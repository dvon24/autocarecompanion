'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * VoiceMechanic — the live voice layer of the Live AI Mechanic.
 *
 * Opens a WebRTC speech-to-speech session with OpenAI Realtime (via a
 * short-lived token minted by /api/realtime), streams the mic up and the
 * model's voice down, and feeds a CAMERA FRAME on each user turn so the model
 * can answer about whatever the user is pointing at. Talk while pointing —
 * "what's wrong with this belt?" — and it answers out loud.
 *
 * The browser talks WebRTC DIRECTLY to OpenAI (the heavy stream never touches
 * our serverless functions); our server only mints the ephemeral token.
 *
 * getFrame() returns a JPEG data URL of the current viewfinder frame (or null).
 */

type Status = 'idle' | 'connecting' | 'live' | 'error';
type Line = { role: 'you' | 'au7o'; text: string };

export function VoiceMechanic({
  getFrame,
  vehicle,
}: {
  getFrame: () => string | null;
  vehicle?: { year?: number; make?: string; model?: string; trim?: string };
}) {
  const [status, setStatus] = useState<Status>('idle');
  const [err, setErr] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);
  const [speaking, setSpeaking] = useState(false);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const micRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastFrameSentRef = useRef(0);
  const asstLineRef = useRef<string>('');

  const cleanup = useCallback(() => {
    try { dcRef.current?.close(); } catch { /* */ }
    try { pcRef.current?.getSenders().forEach((s) => s.track?.stop()); } catch { /* */ }
    try { pcRef.current?.close(); } catch { /* */ }
    micRef.current?.getTracks().forEach((t) => t.stop());
    pcRef.current = null; dcRef.current = null; micRef.current = null;
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

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
    // User started talking → grab a frame so this turn is grounded in what
    // they're pointing at (image lands before the auto-VAD response).
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
    } else if (type === 'error') {
      const m = (msg as { error?: { message?: string } }).error?.message;
      if (m) console.error('[realtime event error]', m);
    }
  }, [sendFrame]);

  const start = useCallback(async () => {
    setErr(null);
    setStatus('connecting');
    try {
      // 1. Mint ephemeral token.
      const tokenRes = await fetch('/api/realtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicle }),
      });
      const tok = await tokenRes.json().catch(() => ({}));
      if (!tokenRes.ok || !tok.client_secret) {
        setErr(tok.message || (tokenRes.status === 401 ? 'Sign in to use voice.' : 'Could not start voice.'));
        setStatus('error');
        return;
      }

      // 2. Peer connection + remote audio sink.
      const pc = new RTCPeerConnection();
      pcRef.current = pc;
      pc.ontrack = (e) => { if (audioRef.current) audioRef.current.srcObject = e.streams[0]; };

      // 3. Mic up.
      const mic = await navigator.mediaDevices.getUserMedia({ audio: true });
      micRef.current = mic;
      mic.getTracks().forEach((t) => pc.addTrack(t, mic));

      // 4. Data channel for events (transcripts + sending frames).
      const dc = pc.createDataChannel('oai-events');
      dcRef.current = dc;
      dc.onmessage = onEvent;
      dc.onopen = () => { setStatus('live'); sendFrame(); };

      // 5. SDP offer → OpenAI → answer.
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      // GA WebRTC endpoint: /v1/realtime/calls, no ?model= (the model is baked
      // into the ephemeral token's session), no OpenAI-Beta header.
      const sdpRes = await fetch('https://api.openai.com/v1/realtime/calls', {
        method: 'POST',
        body: offer.sdp,
        headers: { Authorization: `Bearer ${tok.client_secret}`, 'Content-Type': 'application/sdp' },
      });
      if (!sdpRes.ok) {
        setErr('Voice connection failed. Try again.');
        setStatus('error');
        cleanup();
        return;
      }
      const answer = await sdpRes.text();
      await pc.setRemoteDescription({ type: 'answer', sdp: answer });
    } catch (e) {
      setErr(e instanceof Error && e.name === 'NotAllowedError' ? 'Microphone permission needed.' : 'Could not start voice.');
      setStatus('error');
      cleanup();
    }
  }, [vehicle, onEvent, sendFrame, cleanup]);

  const end = useCallback(() => {
    cleanup();
    setStatus('idle');
    setSpeaking(false);
    asstLineRef.current = '';
  }, [cleanup]);

  const toggleMute = useCallback(() => {
    const next = !muted;
    setMuted(next);
    micRef.current?.getAudioTracks().forEach((t) => { t.enabled = !next; });
  }, [muted]);

  return (
    <>
      {/* hidden sink for the model's voice */}
      <audio ref={audioRef} autoPlay style={{ display: 'none' }} />

      {status === 'idle' || status === 'error' ? (
        <button type="button" onClick={start}
          style={{ position: 'absolute', top: 14, right: 14, zIndex: 8, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 15px', borderRadius: 999, border: 'none', background: '#3B82F6', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(59,130,246,0.45)' }}>
          <MicIcon /> Talk to the mechanic
        </button>
      ) : (
        <div style={{ position: 'absolute', top: 12, right: 12, left: 12, zIndex: 8, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, pointerEvents: 'none' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '8px 14px', borderRadius: 999, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', pointerEvents: 'auto' }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: status === 'live' ? (speaking ? '#3B82F6' : '#10B981') : '#F59E0B', animation: status === 'connecting' ? 'au7oVoicePulse 1s infinite' : speaking ? 'au7oVoicePulse 0.7s infinite' : 'none' }} />
            <span style={{ fontSize: 12.5, fontWeight: 700, color: '#fff' }}>
              {status === 'connecting' ? 'Connecting…' : speaking ? 'Au7o is talking…' : 'Listening — just ask'}
            </span>
            <button type="button" onClick={toggleMute} style={{ background: 'none', border: 'none', color: muted ? '#FCA5A5' : 'rgba(255,255,255,0.8)', cursor: 'pointer', fontSize: 12, fontWeight: 700, padding: 0 }}>{muted ? 'Unmute' : 'Mute'}</button>
            <button type="button" onClick={end} style={{ background: '#EF4444', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 999 }}>End</button>
          </div>
          {lines.length > 0 && (
            <div style={{ maxWidth: 320, width: '100%', display: 'flex', flexDirection: 'column', gap: 6, pointerEvents: 'auto' }}>
              {lines.slice(-4).map((l, i) => (
                <div key={i} style={{ alignSelf: l.role === 'you' ? 'flex-end' : 'flex-start', maxWidth: '85%', padding: '7px 11px', borderRadius: 12, fontSize: 12.5, lineHeight: 1.35, background: l.role === 'you' ? 'rgba(59,130,246,0.92)' : 'rgba(255,255,255,0.94)', color: l.role === 'you' ? '#fff' : '#0B1220' }}>
                  {l.text}
                </div>
              ))}
            </div>
          )}
          <style>{`@keyframes au7oVoicePulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
        </div>
      )}
      {err && (status === 'error') && (
        <div style={{ position: 'absolute', top: 58, right: 14, zIndex: 8, padding: '7px 12px', borderRadius: 10, background: 'rgba(127,29,29,0.9)', color: '#FECACA', fontSize: 12, maxWidth: 260 }}>{err}</div>
      )}
    </>
  );
}

function MicIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4" />
    </svg>
  );
}
