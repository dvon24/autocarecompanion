'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * VoiceMechanic — the live voice layer of the Live AI Mechanic.
 *
 * Auto-activates the moment the camera opens, opens a WebRTC speech-to-speech
 * session with OpenAI Realtime (token minted by /api/realtime), and the
 * mechanic GREETS FIRST ("Let's get started — show me what your issue is and I
 * can help"). Renders as a pulsing orb at the BOTTOM-RIGHT (opposite the photo
 * library button), out of the way of the vehicle chip / YMMT up top.
 *
 * A camera FRAME is fed on each user turn so the model can answer about
 * whatever the user is pointing at. The browser talks WebRTC DIRECTLY to
 * OpenAI; our server only mints the short-lived token.
 */

type Status = 'idle' | 'connecting' | 'live' | 'error';
type Line = { role: 'you' | 'au7o'; text: string };
type Upsell = { message: string; ctaUrl: string; ctaLabel: string };

export function VoiceMechanic({
  getFrame,
  vehicle,
  autoStart = true,
  onSurfaceParts,
}: {
  getFrame: () => string | null;
  vehicle?: { year?: number; make?: string; model?: string; trim?: string };
  autoStart?: boolean;
  /** Hands-free "surface_parts" tool: the mechanic asks the screen to freeze the
   *  live frame and show buyable part callouts for the given query. */
  onSurfaceParts?: (partQuery: string) => void;
}) {
  const [status, setStatus] = useState<Status>('idle');
  const [err, setErr] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);
  const [speaking, setSpeaking] = useState(false);
  // Demo (non-paying) state — a short capped live taste then an upsell.
  const [demoLeft, setDemoLeft] = useState<number | null>(null);
  const [upsell, setUpsell] = useState<Upsell | null>(null);
  const [showUpsell, setShowUpsell] = useState(false);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const micRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastFrameSentRef = useRef(0);
  const asstLineRef = useRef<string>('');
  const onSurfacePartsRef = useRef(onSurfaceParts);
  onSurfacePartsRef.current = onSurfaceParts;
  const startedRef = useRef(false);
  const demoTimerRef = useRef<number>(0);
  const maxSecondsRef = useRef<number | null>(null);

  const cleanup = useCallback(() => {
    window.clearInterval(demoTimerRef.current);
    try { dcRef.current?.close(); } catch { /* */ }
    try { pcRef.current?.getSenders().forEach((s) => s.track?.stop()); } catch { /* */ }
    try { pcRef.current?.close(); } catch { /* */ }
    micRef.current?.getTracks().forEach((t) => t.stop());
    pcRef.current = null; dcRef.current = null; micRef.current = null;
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  // Demo countdown: once the live session opens for a non-payer, run a tight
  // timer; at zero, tear the session down and surface the upsell (this IS the
  // conversion moment — they just heard the mechanic talk about their car).
  const startDemoCountdown = useCallback((secs: number) => {
    setDemoLeft(secs);
    const deadline = Date.now() + secs * 1000;
    window.clearInterval(demoTimerRef.current);
    demoTimerRef.current = window.setInterval(() => {
      const left = Math.ceil((deadline - Date.now()) / 1000);
      if (left <= 0) {
        cleanup();
        startedRef.current = false;
        setStatus('idle');
        setSpeaking(false);
        asstLineRef.current = '';
        setDemoLeft(null);
        setShowUpsell(true);
      } else {
        setDemoLeft(left);
      }
    }, 250);
  }, [cleanup]);

  // Append the current camera frame as a user image item so the model can SEE
  // what's being pointed at. Throttled — at most one per 1.2s.
  const sendFrame = useCallback(() => {
    const dc = dcRef.current;
    if (!dc || dc.readyState !== 'open') return;
    const now = Date.now();
    if (now - lastFrameSentRef.current < 1200) return;
    const dataUrl = getFrame();
    if (!dataUrl) return;
    lastFrameSentRef.current = now;
    try {
      dc.send(JSON.stringify({
        type: 'conversation.item.create',
        item: { type: 'message', role: 'user', content: [{ type: 'input_image', image_url: dataUrl }] },
      }));
    } catch { /* */ }
  }, [getFrame]);

  const onEvent = useCallback((ev: MessageEvent) => {
    let msg: Record<string, unknown>;
    try { msg = JSON.parse(ev.data); } catch { return; }
    const type = String(msg.type || '');
    if (type === 'input_audio_buffer.speech_started') {
      setSpeaking(false);
      sendFrame();
    } else if (type === 'response.output_audio_transcript.delta' || type === 'response.audio_transcript.delta') {
      asstLineRef.current += String((msg as { delta?: string }).delta || '');
      setSpeaking(true);
    } else if (type === 'response.output_audio_transcript.done' || type === 'response.audio_transcript.done') {
      const text = asstLineRef.current.trim();
      asstLineRef.current = '';
      setSpeaking(false);
      if (text) setLines((p) => [...p, { role: 'au7o' as const, text }].slice(-12));
    } else if (type === 'conversation.item.input_audio_transcription.completed') {
      const text = String((msg as { transcript?: string }).transcript || '').trim();
      if (text) setLines((p) => [...p, { role: 'you' as const, text }].slice(-12));
    } else if (type === 'response.function_call_arguments.done') {
      // The mechanic asked to put parts on the screen, hands-free. Freeze the
      // frame + surface callouts, then ack the tool call so the turn completes.
      const m = msg as { name?: string; call_id?: string; arguments?: string };
      let partQuery = '';
      try { partQuery = String(JSON.parse(m.arguments || '{}').partQuery || '').trim(); } catch { /* */ }
      if (m.name === 'surface_parts' && partQuery) {
        try { onSurfacePartsRef.current?.(partQuery); } catch { /* */ }
      }
      const dc = dcRef.current;
      if (dc && dc.readyState === 'open' && m.call_id) {
        try {
          dc.send(JSON.stringify({ type: 'conversation.item.create', item: { type: 'function_call_output', call_id: m.call_id, output: JSON.stringify({ ok: true, surfaced: partQuery }) } }));
          dc.send(JSON.stringify({ type: 'response.create' }));
        } catch { /* */ }
      }
    } else if (type === 'error') {
      const m = (msg as { error?: { message?: string } }).error?.message;
      if (m) console.error('[realtime event error]', m);
    }
  }, [sendFrame]);

  const start = useCallback(async () => {
    if (startedRef.current) return;
    startedRef.current = true;
    setErr(null);
    setStatus('connecting');
    try {
      const tokenRes = await fetch('/api/realtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicle }),
      });
      const tok = await tokenRes.json().catch(() => ({}));
      if (!tokenRes.ok || !tok.client_secret) {
        // Demo already used → this is a conversion moment, not an error: show
        // the upsell (sign up / upgrade) instead of a red failure state.
        if (tokenRes.status === 402 && tok.error === 'demo_used') {
          setUpsell({ message: tok.message, ctaUrl: tok.ctaUrl, ctaLabel: tok.ctaLabel });
          setShowUpsell(true);
          setStatus('idle');
          startedRef.current = false;
          return;
        }
        setErr(tok.message || (tokenRes.status === 401 ? 'Sign in to use voice.' : 'Could not start voice.'));
        setStatus('error');
        startedRef.current = false;
        return;
      }
      // Tier from the token mint: 'demo' (non-payer, capped) or 'full' (Plus/Pro).
      setUpsell(tok.upsell ?? null);
      maxSecondsRef.current = (tok.tier === 'demo' && typeof tok.maxSeconds === 'number') ? tok.maxSeconds : null;

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
        sendFrame();
        // Non-payer? Start the demo countdown the moment we're actually live
        // (so the cap is real talk time, not handshake time).
        if (maxSecondsRef.current) startDemoCountdown(maxSecondsRef.current);
        // Make the mechanic speak FIRST (the greeting). With server-VAD the
        // model otherwise waits for the user — response.create triggers its
        // opening turn immediately.
        try { dc.send(JSON.stringify({ type: 'response.create' })); } catch { /* */ }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      const sdpRes = await fetch('https://api.openai.com/v1/realtime/calls', {
        method: 'POST',
        body: offer.sdp,
        headers: { Authorization: `Bearer ${tok.client_secret}`, 'Content-Type': 'application/sdp' },
      });
      if (!sdpRes.ok) {
        setErr('Voice connection failed. Tap to retry.');
        setStatus('error');
        startedRef.current = false;
        cleanup();
        return;
      }
      const answer = await sdpRes.text();
      await pc.setRemoteDescription({ type: 'answer', sdp: answer });
    } catch (e) {
      setErr(e instanceof Error && e.name === 'NotAllowedError' ? 'Allow the mic to talk to the mechanic.' : 'Could not start voice. Tap to retry.');
      setStatus('error');
      startedRef.current = false;
      cleanup();
    }
  }, [vehicle, onEvent, sendFrame, cleanup, startDemoCountdown]);

  // Auto-activate shortly after mount (let the camera settle first).
  useEffect(() => {
    if (!autoStart) return;
    const t = setTimeout(() => { start(); }, 700);
    return () => clearTimeout(t);
  }, [autoStart, start]);

  const end = useCallback(() => {
    cleanup();
    startedRef.current = false;
    setStatus('idle');
    setSpeaking(false);
    asstLineRef.current = '';
  }, [cleanup]);

  const toggleMute = useCallback(() => {
    const next = !muted;
    setMuted(next);
    micRef.current?.getAudioTracks().forEach((t) => { t.enabled = !next; });
  }, [muted]);

  // Orb color by state.
  const orbColor = status === 'error' ? '#EF4444'
    : status === 'connecting' ? '#F59E0B'
    : muted ? '#9CA3AF'
    : speaking ? '#3B82F6'
    : status === 'live' ? '#10B981'
    : '#3B82F6';
  const statusText = status === 'connecting' ? 'Connecting…'
    : status === 'error' ? (err || 'Tap to retry')
    : muted ? 'Muted — tap to unmute'
    : speaking ? 'Au7o is talking…'
    : status === 'live' ? 'Listening — just talk'
    : 'Tap to talk to a mechanic';

  const onOrbTap = () => {
    if (status === 'idle' || status === 'error') start();
    else if (status === 'live') toggleMute();
  };

  const demoClock = demoLeft !== null ? `0:${String(Math.max(0, demoLeft)).padStart(2, '0')}` : null;

  return (
    <>
      <audio ref={audioRef} autoPlay style={{ display: 'none' }} />

      {/* Demo-ended (or demo-used) upsell — the conversion moment. They just
          heard the mechanic talk about THEIR car; now ask for the signup/upgrade. */}
      {showUpsell && upsell && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 12, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0 18px 110px', pointerEvents: 'none' }}>
          <div style={{ pointerEvents: 'auto', width: '100%', maxWidth: 340, background: 'rgba(17,21,28,0.96)', backdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 18, padding: '18px 18px 16px', boxShadow: '0 12px 40px rgba(0,0,0,0.5)', textAlign: 'center', color: '#fff' }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>🔧</div>
            <p style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px' }}>That’s the free preview</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.72)', margin: '0 0 14px', lineHeight: 1.4 }}>{upsell.message}</p>
            <a href={upsell.ctaUrl} style={{ display: 'block', padding: '12px 16px', background: '#3B82F6', color: '#fff', textDecoration: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700 }}>{upsell.ctaLabel}</a>
            <button type="button" onClick={() => setShowUpsell(false)} style={{ marginTop: 10, background: 'none', border: 'none', color: 'rgba(255,255,255,0.55)', fontSize: 12.5, cursor: 'pointer' }}>Maybe later</button>
          </div>
        </div>
      )}

      {/* Transcript bubbles, stacked above the orb (bottom-right). */}
      {lines.length > 0 && status === 'live' && (
        <div style={{ position: 'absolute', right: 14, bottom: 150, zIndex: 9, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, maxWidth: 300, pointerEvents: 'none' }}>
          {lines.slice(-3).map((l, i) => (
            <div key={i} style={{ alignSelf: l.role === 'you' ? 'flex-end' : 'flex-start', maxWidth: '90%', padding: '7px 11px', borderRadius: 12, fontSize: 12.5, lineHeight: 1.35, background: l.role === 'you' ? 'rgba(59,130,246,0.92)' : 'rgba(255,255,255,0.95)', color: l.role === 'you' ? '#fff' : '#0B1220', boxShadow: '0 2px 10px rgba(0,0,0,0.25)' }}>
              {l.text}
            </div>
          ))}
        </div>
      )}

      {/* The pulsing orb — bottom-right, opposite the photo-library button. */}
      <div style={{ position: 'absolute', right: 24, bottom: 92, zIndex: 9, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <button type="button" onClick={onOrbTap} aria-label="Talk to the mechanic"
          style={{ position: 'relative', width: 60, height: 60, borderRadius: '50%', border: 'none', background: orbColor, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 6px 22px ${orbColor}66`, transition: 'background 0.3s', WebkitTapHighlightColor: 'transparent' }}>
          {/* pulsing rings */}
          {status !== 'error' && status !== 'idle' && (
            <>
              <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `2px solid ${orbColor}`, animation: `au7oOrbRing ${speaking ? 1 : 2}s ease-out infinite` }} />
              <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `2px solid ${orbColor}`, animation: `au7oOrbRing ${speaking ? 1 : 2}s ease-out infinite 0.6s` }} />
            </>
          )}
          {muted ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 1l22 22M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" /><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" /></svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4" /></svg>
          )}
        </button>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.6)', whiteSpace: 'nowrap' }}>{statusText}</span>
          {status === 'live' && demoClock && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: 'rgba(245,158,11,0.92)', color: '#fff', borderRadius: 999, fontSize: 10, fontWeight: 800, padding: '2px 7px', whiteSpace: 'nowrap' }}>
              Preview · {demoClock}
            </span>
          )}
          {status === 'live' && (
            <button type="button" onClick={end} aria-label="End voice" style={{ background: 'rgba(0,0,0,0.45)', border: 'none', color: '#fff', borderRadius: 999, fontSize: 10, fontWeight: 700, padding: '2px 7px', cursor: 'pointer' }}>End</button>
          )}
        </div>
      </div>

      <style>{`@keyframes au7oOrbRing { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(1.6);opacity:0} }`}</style>
    </>
  );
}
