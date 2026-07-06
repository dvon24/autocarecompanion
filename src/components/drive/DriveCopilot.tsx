'use client';

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';

/**
 * DriveCopilot — the "Jarvis in the map" voice layer for /drive.
 *
 * Same WebRTC speech-to-speech transport as VoiceMechanic (token minted by
 * /api/realtime with mode:'drive'), but built for HANDS-FREE driving:
 *   • LIVE CONTEXT feed — the host streams a drive snapshot (location, ETA,
 *     fuel range, next turn, gas stops, speed cameras, hazards, car alerts) via
 *     getContext(); we push it silently so the model is always grounded but
 *     doesn't chatter.
 *   • PROACTIVE INTERJECTIONS — the host calls the imperative `interject(text)`
 *     when a real event fires (low fuel, hazard ahead, arriving); the copilot
 *     speaks one short line even while dozing.
 *   • AUTO-DOZE / SMART-WAKE — after IDLE_MS with no speech the mic mutes to
 *     save power and ignore road noise; it wakes on a tap or when an
 *     interjection needs a reply. (Devon: "auto-mute after a while, smart
 *     enough to know when to unmute.")
 *   • TRANSLATION — pass `lang`; the model speaks the driver's language and can
 *     translate foreign road signs.
 *
 * Plus-gated: driving is not the place for a 40s demo cutoff, so non-subscribers
 * see an upsell instead of a timed session.
 */

type Status = 'idle' | 'connecting' | 'live' | 'error';
type Line = { role: 'you' | 'au7o'; text: string };

export interface DriveCopilotHandle {
  /** Speak a proactive alert now (grounds on latest context first). If
   *  `listen` is true the mic wakes so the driver can reply. */
  interject: (text: string, opts?: { listen?: boolean }) => void;
  /** Push the latest drive context silently (no spoken response). */
  syncContext: () => void;
  isLive: () => boolean;
}

const IDLE_MS = 60_000;         // doze after 60s of no speech
const CONTEXT_EVERY_MS = 15_000; // silently refresh grounding at most this often

export const DriveCopilot = forwardRef<DriveCopilotHandle, {
  /** Returns a short plain-text snapshot of the live drive situation, or null. */
  getContext: () => string | null;
  /** BCP-47-ish language name/code for the driver (e.g. 'English', 'de'). */
  lang?: string;
  vehicle?: { year?: number; make?: string; model?: string; trim?: string };
  /** Start the session automatically on mount. */
  autoStart?: boolean;
  onClose?: () => void;
  /** Executes a copilot tool call (lookup_place, open_vision). Returns a
   *  JSON-serializable result the model speaks back. */
  onToolCall?: (name: string, args: Record<string, unknown>) => Promise<unknown>;
}>(function DriveCopilot({ getContext, lang, vehicle, autoStart = false, onClose, onToolCall }, ref) {
  const [status, setStatus] = useState<Status>('idle');
  const [err, setErr] = useState<string | null>(null);
  const [dozing, setDozing] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);
  const [gated, setGated] = useState<{ message: string; ctaUrl: string; ctaLabel: string } | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const micRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const asstLineRef = useRef('');
  const startedRef = useRef(false);
  // Always read the LATEST snapshot from intervals/closures (no stale context).
  const getContextRef = useRef(getContext);
  getContextRef.current = getContext;
  const onToolCallRef = useRef(onToolCall);
  onToolCallRef.current = onToolCall;
  const idleTimerRef = useRef<number>(0);
  const lastContextRef = useRef(0);
  const contextTimerRef = useRef<number>(0);

  const cleanup = useCallback(() => {
    window.clearTimeout(idleTimerRef.current);
    window.clearInterval(contextTimerRef.current);
    try { dcRef.current?.close(); } catch { /* */ }
    try { pcRef.current?.getSenders().forEach((s) => s.track?.stop()); } catch { /* */ }
    try { pcRef.current?.close(); } catch { /* */ }
    micRef.current?.getTracks().forEach((t) => t.stop());
    pcRef.current = null; dcRef.current = null; micRef.current = null;
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  const setMic = useCallback((on: boolean) => {
    micRef.current?.getAudioTracks().forEach((t) => { t.enabled = on; });
    setDozing(!on);
  }, []);

  // Doze after inactivity: mute the mic (ignore road noise, save cost). Any
  // speech (user or Au7o) resets it; an interjection can wake it.
  const armIdle = useCallback(() => {
    window.clearTimeout(idleTimerRef.current);
    idleTimerRef.current = window.setTimeout(() => { setMic(false); }, IDLE_MS);
  }, [setMic]);

  const wake = useCallback(() => {
    setMic(true);
    armIdle();
  }, [setMic, armIdle]);

  // Silently push the latest drive snapshot so the model is always grounded —
  // NO response.create, so it stays quiet unless something warrants speaking.
  const syncContext = useCallback(() => {
    const dc = dcRef.current;
    if (!dc || dc.readyState !== 'open') return;
    const now = Date.now();
    if (now - lastContextRef.current < 2000) return; // hard floor
    const ctx = getContextRef.current();
    if (!ctx) return;
    lastContextRef.current = now;
    try {
      dc.send(JSON.stringify({
        type: 'conversation.item.create',
        item: { type: 'message', role: 'user', content: [{ type: 'input_text', text: `DRIVE CONTEXT (silent update, do not respond unless it warrants a proactive alert):\n${ctx}` }] },
      }));
    } catch { /* */ }
  }, []);

  const interject = useCallback((text: string, opts?: { listen?: boolean }) => {
    const dc = dcRef.current;
    if (!dc || dc.readyState !== 'open') return;
    syncContext();
    try {
      dc.send(JSON.stringify({
        type: 'conversation.item.create',
        item: { type: 'message', role: 'user', content: [{ type: 'input_text', text: `PROACTIVE ALERT — say ONE short spoken line about this now: ${text}` }] },
      }));
      dc.send(JSON.stringify({ type: 'response.create' }));
    } catch { /* */ }
    if (opts?.listen) wake();
  }, [syncContext, wake]);

  useImperativeHandle(ref, () => ({
    interject,
    syncContext,
    isLive: () => status === 'live',
  }), [interject, syncContext, status]);

  // Execute a copilot tool call → return its output → let the model speak it.
  const handleTool = useCallback(async (name: string, callId: string, argsStr: string) => {
    let args: Record<string, unknown> = {};
    try { args = JSON.parse(argsStr || '{}'); } catch { /* */ }
    let result: unknown;
    try { result = (await onToolCallRef.current?.(name, args)) ?? { ok: false, error: 'unavailable' }; }
    catch { result = { ok: false, error: 'failed' }; }
    const dc = dcRef.current;
    if (!dc || dc.readyState !== 'open') return;
    try {
      dc.send(JSON.stringify({ type: 'conversation.item.create', item: { type: 'function_call_output', call_id: callId, output: JSON.stringify(result) } }));
      dc.send(JSON.stringify({ type: 'response.create' }));
    } catch { /* */ }
  }, []);

  const onEvent = useCallback((ev: MessageEvent) => {
    let msg: Record<string, unknown>;
    try { msg = JSON.parse(ev.data); } catch { return; }
    const type = String(msg.type || '');
    if (type === 'input_audio_buffer.speech_started') {
      setSpeaking(false);
      armIdle();
    } else if (type === 'response.output_audio_transcript.delta' || type === 'response.audio_transcript.delta') {
      asstLineRef.current += String((msg as { delta?: string }).delta || '');
      setSpeaking(true);
    } else if (type === 'response.output_audio_transcript.done' || type === 'response.audio_transcript.done') {
      const text = asstLineRef.current.trim();
      asstLineRef.current = '';
      setSpeaking(false);
      armIdle();
      if (text) setLines((p) => [...p, { role: 'au7o' as const, text }].slice(-8));
    } else if (type === 'conversation.item.input_audio_transcription.completed') {
      const text = String((msg as { transcript?: string }).transcript || '').trim();
      if (text) setLines((p) => [...p, { role: 'you' as const, text }].slice(-8));
    } else if (type === 'response.function_call_arguments.done') {
      const m2 = msg as { name?: string; call_id?: string; arguments?: string };
      if (m2.name && m2.call_id) handleTool(String(m2.name), String(m2.call_id), String(m2.arguments || '{}'));
    } else if (type === 'error') {
      const m = (msg as { error?: { message?: string } }).error?.message;
      if (m) console.error('[drive-copilot event error]', m);
    }
  }, [armIdle, handleTool]);

  const start = useCallback(async () => {
    if (startedRef.current) return;
    startedRef.current = true;
    setErr(null); setGated(null);
    setStatus('connecting');
    try {
      const tokenRes = await fetch('/api/realtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'drive', vehicle, lang }),
      });
      const tok = await tokenRes.json().catch(() => ({}));
      if (!tokenRes.ok || !tok.client_secret) {
        // Drive copilot is Plus-only — no mid-drive demo cutoff. Any non-full
        // tier (demo/used/401) resolves to an upgrade prompt.
        if (tokenRes.status === 402 || tok.tier === 'demo' || tokenRes.status === 401) {
          setGated({
            message: tok.message || 'The live drive copilot is a Plus feature.',
            ctaUrl: tok.ctaUrl || '/subscribe',
            ctaLabel: tok.ctaLabel || 'Upgrade to Plus',
          });
          setStatus('idle');
          startedRef.current = false;
          return;
        }
        setErr(tok.message || 'Could not start the copilot.');
        setStatus('error');
        startedRef.current = false;
        return;
      }
      if (tok.tier === 'demo') {
        setGated({ message: 'The live drive copilot is a Plus feature.', ctaUrl: '/subscribe', ctaLabel: 'Upgrade to Plus' });
        setStatus('idle'); startedRef.current = false; return;
      }

      const pc = new RTCPeerConnection();
      pcRef.current = pc;
      pc.ontrack = (e) => { if (audioRef.current) audioRef.current.srcObject = e.streams[0]; };

      const mic = await navigator.mediaDevices.getUserMedia({ audio: true });
      micRef.current = mic;
      mic.getTracks().forEach((t) => pc.addTrack(t, mic));

      const dc = pc.createDataChannel('oai-events');
      dcRef.current = dc;
      dc.onmessage = onEvent;
      dc.onopen = () => {
        setStatus('live');
        syncContext();
        armIdle();
        // Greet once, then go quiet.
        try { dc.send(JSON.stringify({ type: 'response.create' })); } catch { /* */ }
        // Keep grounding fresh throughout the drive (silent).
        window.clearInterval(contextTimerRef.current);
        contextTimerRef.current = window.setInterval(() => syncContext(), CONTEXT_EVERY_MS);
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      const sdpRes = await fetch('https://api.openai.com/v1/realtime/calls', {
        method: 'POST',
        body: offer.sdp,
        headers: { Authorization: `Bearer ${tok.client_secret}`, 'Content-Type': 'application/sdp' },
      });
      if (!sdpRes.ok) {
        setErr('Copilot connection failed. Tap to retry.');
        setStatus('error'); startedRef.current = false; cleanup();
        return;
      }
      const answer = await sdpRes.text();
      await pc.setRemoteDescription({ type: 'answer', sdp: answer });
    } catch (e) {
      setErr(e instanceof Error && e.name === 'NotAllowedError' ? 'Allow the mic to use the copilot.' : 'Could not start the copilot. Tap to retry.');
      setStatus('error'); startedRef.current = false; cleanup();
    }
  }, [vehicle, lang, onEvent, syncContext, armIdle, cleanup]);

  useEffect(() => {
    if (!autoStart) return;
    const t = setTimeout(() => { start(); }, 500);
    return () => clearTimeout(t);
  }, [autoStart, start]);

  const end = useCallback(() => {
    cleanup();
    startedRef.current = false;
    setStatus('idle'); setSpeaking(false); setDozing(false);
    asstLineRef.current = '';
    onClose?.();
  }, [cleanup, onClose]);

  const orbColor = status === 'error' ? '#EF4444'
    : status === 'connecting' ? '#F59E0B'
    : speaking ? '#3B82F6'
    : dozing ? '#64748B'
    : status === 'live' ? '#10B981'
    : '#3B82F6';
  const statusText = status === 'connecting' ? 'Connecting…'
    : status === 'error' ? (err || 'Tap to retry')
    : speaking ? 'Au7o…'
    : dozing ? 'Dozing — tap to talk'
    : status === 'live' ? 'Listening'
    : 'Tap for the copilot';

  const onOrbTap = () => {
    if (status === 'idle' || status === 'error') start();
    else if (status === 'live') { if (dozing) wake(); else setMic(false); }
  };

  return (
    <>
      <audio ref={audioRef} autoPlay style={{ display: 'none' }} />

      {gated && (
        <div style={{ position: 'absolute', left: 14, right: 14, bottom: 96, zIndex: 12, background: 'rgba(17,21,28,0.96)', backdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 16, padding: '14px 16px', color: '#fff', boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}>
          <p style={{ fontSize: 14, fontWeight: 700, margin: '0 0 4px' }}>🛰️ Drive copilot</p>
          <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.72)', margin: '0 0 12px', lineHeight: 1.4 }}>{gated.message}</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <a href={gated.ctaUrl} style={{ flex: 1, textAlign: 'center', padding: '10px 14px', background: '#3B82F6', color: '#fff', textDecoration: 'none', borderRadius: 11, fontSize: 13, fontWeight: 700 }}>{gated.ctaLabel}</a>
            <button type="button" onClick={() => setGated(null)} style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.16)', color: '#fff', borderRadius: 11, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Later</button>
          </div>
        </div>
      )}

      {lines.length > 0 && status === 'live' && (
        <div style={{ position: 'absolute', left: 14, bottom: 150, zIndex: 9, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6, maxWidth: 320, pointerEvents: 'none' }}>
          {lines.slice(-2).map((l, i) => (
            <div key={i} style={{ maxWidth: '92%', padding: '8px 12px', borderRadius: 13, fontSize: 13, lineHeight: 1.35, background: l.role === 'you' ? 'rgba(59,130,246,0.92)' : 'rgba(255,255,255,0.97)', color: l.role === 'you' ? '#fff' : '#0B1220', boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
              {l.text}
            </div>
          ))}
        </div>
      )}

      <div style={{ position: 'absolute', left: 20, bottom: 92, zIndex: 9, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <button type="button" onClick={onOrbTap} aria-label="Drive copilot"
          style={{ position: 'relative', width: 58, height: 58, borderRadius: '50%', border: 'none', background: orbColor, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 6px 22px ${orbColor}66`, transition: 'background 0.3s', WebkitTapHighlightColor: 'transparent' }}>
          {status !== 'error' && status !== 'idle' && !dozing && (
            <>
              <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `2px solid ${orbColor}`, animation: `au7oCopilotRing ${speaking ? 1 : 2}s ease-out infinite` }} />
              <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `2px solid ${orbColor}`, animation: `au7oCopilotRing ${speaking ? 1 : 2}s ease-out infinite 0.6s` }} />
            </>
          )}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {dozing
              ? <><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></>
              : <><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></>}
          </svg>
        </button>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.6)', whiteSpace: 'nowrap' }}>{statusText}</span>
          {status === 'live' && (
            <button type="button" onClick={end} aria-label="End copilot" style={{ background: 'rgba(0,0,0,0.45)', border: 'none', color: '#fff', borderRadius: 999, fontSize: 10, fontWeight: 700, padding: '2px 7px', cursor: 'pointer' }}>End</button>
          )}
        </div>
      </div>

      <style>{`@keyframes au7oCopilotRing { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(1.6);opacity:0} }`}</style>
    </>
  );
});
