'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { VoiceMechanic } from './VoiceMechanic';
import { TapToIdentifyPhoto } from './TapToIdentifyPhoto';

/**
 * LiveCameraShutter — the ONE shared in-app camera surface for diagnosis.
 *
 * Extracted from the camera spike so the home /diagnose flow AND the vehicle
 * hub share the exact same capture UX (Devon: "it should be the same ui"):
 *   • live rear-camera viewfinder + framing brackets,
 *   • a lightweight on-device sharpness coach (no CDN/model — just "hold steady
 *     / looks sharp") so the green shutter actually means something,
 *   • ONE unified shutter: TAP = photo, PRESS-AND-HOLD = record video
 *     (15s auto-stop, live countdown + progress bar),
 *   • gallery fallback (photo + video) for denied-camera / desktop,
 *   • optional live VoiceMechanic (talk to it while pointing — auth/cost-gated).
 *
 * It is capture-only: it hands the host a File via onPhoto / onVideo and the
 * host owns confirm + submit to /api/vision (the hosts already have that
 * pipeline + result rendering). Nothing streams anywhere from here.
 */

const DEFAULT_MAX_RECORD_SECS = 15;

/**
 * The live tap/hold viewfinder is a phone/tablet interaction — on a laptop or
 * desktop it should NOT light up the webcam (Devon: "that shouldn't work, should
 * only be for tablet and phone"). We gate on a real handheld signal: a mobile/
 * tablet user-agent, or iPadOS-13+ which masquerades as desktop Safari but
 * reports touch points. A touch-screen Windows laptop is intentionally treated
 * as desktop (it isn't a phone/tablet) and falls through to file upload.
 */
function isHandheld(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  if (/Android|iPhone|iPod|iPad|webOS|BlackBerry|IEMobile|Opera Mini|Mobile Safari|Silk/i.test(ua)) return true;
  // iPadOS 13+ presents as "Macintosh" but exposes multi-touch.
  if (/Macintosh/.test(ua) && (navigator.maxTouchPoints || 0) > 1) return true;
  return false;
}

function pickRecordMime(): { mime: string; ext: string } {
  const candidates: Array<[string, string]> = [
    ['video/mp4', 'mp4'],
    ['video/webm;codecs=vp9,opus', 'webm'],
    ['video/webm;codecs=vp8,opus', 'webm'],
    ['video/webm', 'webm'],
  ];
  for (const [c, ext] of candidates) {
    try { if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(c)) return { mime: c, ext }; } catch { /* */ }
  }
  return { mime: '', ext: 'webm' };
}

export interface LiveCameraShutterLabels {
  hint?: string;
  tapHold?: string;
  recording?: string;
  upload?: string;
  denyTitle?: string;
  denyBody?: string;
}

export function LiveCameraShutter({
  onPhoto,
  onVideo,
  onClose,
  vehicle,
  vehicleLabel,
  enableVoice = false,
  voiceAutoStart = true,
  maxRecordSeconds = DEFAULT_MAX_RECORD_SECS,
  modeToggle,
  headerExtra,
  labels,
  accent = '#3B82F6',
  beta = true,
}: {
  onPhoto: (file: File) => void;
  onVideo: (file: File, durationSec: number) => void;
  onClose?: () => void;
  vehicle?: { year?: number; make?: string; model?: string; trim?: string };
  vehicleLabel?: string;
  enableVoice?: boolean;
  /** Auto-start the voice mechanic on open (hub greeting). Public/anon flow
   *  passes false so the demo is opt-in (tap-to-talk) and isn't burned on a
   *  user who just wanted to snap a photo. */
  voiceAutoStart?: boolean;
  maxRecordSeconds?: number;
  modeToggle?: React.ReactNode;
  headerExtra?: React.ReactNode;
  labels?: LiveCameraShutterLabels;
  accent?: string;
  beta?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const workRef = useRef<HTMLCanvasElement | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const rafRef = useRef<number>(0);
  const runningRef = useRef(false);
  const frameRef = useRef(0);
  const sharpRef = useRef(999);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mediaRecorderRef = useRef<any>(null);
  const recordChunksRef = useRef<BlobPart[]>([]);
  const recordTimerRef = useRef<number>(0);
  const holdTimerRef = useRef<number>(0);
  const heldRef = useRef(false);

  const [cameraDenied, setCameraDenied] = useState(false);
  const [deviceBlocked, setDeviceBlocked] = useState(false); // desktop/laptop — upload only
  const [framed, setFramed] = useState(false);
  const [coach, setCoach] = useState(labels?.hint || 'Point at the part or problem');
  const [recording, setRecording] = useState(false);
  const [recordSecs, setRecordSecs] = useState(0);
  const [err, setErr] = useState<string | null>(null);
  // Identify mode: tap the LIVE viewfinder → freeze that frame + identify the
  // tapped part (reuses the /api/vision/identify engine on a still).
  const [frozen, setFrozen] = useState<{ url: string; point: { x: number; y: number } } | null>(null);
  // Continuous "Auto-scan" (Phase 3 taste): while on, sample the center every
  // few seconds and call out the part. Hard-capped so it can't run away on cost;
  // true hands-free masklet tracking arrives with the SAM endpoint.
  const [autoScan, setAutoScan] = useState(false);
  const [scanLabel, setScanLabel] = useState<string | null>(null);
  const scanTimerRef = useRef<number>(0);
  const scanCountRef = useRef(0);
  const scanBusyRef = useRef(false);
  const SCAN_INTERVAL_MS = 4500;   // ≤ the 12/min identify burst limit
  const SCAN_MAX = 10;             // auto-stop after 10 calls (~45s)

  const L = {
    hint: labels?.hint || 'Point at the part or problem',
    tapHold: labels?.tapHold || 'Tap for photo · hold to record',
    recording: labels?.recording || 'Recording… release to stop',
    upload: labels?.upload || 'Upload from gallery',
    denyTitle: labels?.denyTitle || 'Camera unavailable',
    denyBody: labels?.denyBody || 'Allow camera access, or upload a photo or video instead.',
  };

  // ── lightweight sharpness (Laplacian variance on a small copy) ──
  const measureSharpness = useCallback((video: HTMLVideoElement) => {
    if (!workRef.current) workRef.current = document.createElement('canvas');
    const c = workRef.current;
    const w = 160, h = Math.round((video.videoHeight / video.videoWidth) * 160) || 120;
    c.width = w; c.height = h;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    if (!ctx) return 999;
    ctx.drawImage(video, 0, 0, w, h);
    const { data } = ctx.getImageData(0, 0, w, h);
    const gray = new Float32Array(w * h);
    for (let i = 0, p = 0; i < data.length; i += 4, p++) {
      gray[p] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    }
    let sum = 0, sumSq = 0, n = 0;
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const idx = y * w + x;
        const lap = 4 * gray[idx] - gray[idx - 1] - gray[idx + 1] - gray[idx - w] - gray[idx + w];
        sum += lap; sumSq += lap * lap; n++;
      }
    }
    const mean = n ? sum / n : 0;
    return n ? sumSq / n - mean * mean : 999;
  }, []);

  const tick = useCallback(() => {
    const video = videoRef.current;
    if (!video || !runningRef.current) return;
    if (video.readyState < 2) { rafRef.current = requestAnimationFrame(tick); return; }
    frameRef.current++;
    if (frameRef.current % 6 === 0) {
      const s = measureSharpness(video);
      sharpRef.current = s;
      if (s < 22) { setCoach('Hold steady — let it focus'); setFramed(false); }
      else if (s >= 30) { setCoach(L.hint.includes('sharp') ? L.hint : 'Looks sharp'); setFramed(true); }
      else { setCoach(L.hint); setFramed(false); }
    }
    rafRef.current = requestAnimationFrame(tick);
    // L is recreated each render but its values are stable per labels prop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [measureSharpness]);

  const startCamera = useCallback(async () => {
    setErr(null);
    // Desktop/laptop: never open the webcam — go straight to upload.
    if (!isHandheld()) { setDeviceBlocked(true); setCameraDenied(true); return; }
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) { setCameraDenied(true); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setCameraDenied(false);
      runningRef.current = true;
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      setCameraDenied(true);
    }
  }, [tick]);

  const stopCamera = useCallback(() => {
    runningRef.current = false;
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    startCamera();
    return () => { stopCamera(); window.clearInterval(recordTimerRef.current); window.clearTimeout(holdTimerRef.current); };
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── photo ──
  const capture = useCallback(() => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    const c = document.createElement('canvas');
    c.width = v.videoWidth; c.height = v.videoHeight;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(v, 0, 0);
    c.toBlob((blob) => {
      if (!blob) return;
      onPhoto(new File([blob], 'snap.jpg', { type: 'image/jpeg' }));
    }, 'image/jpeg', 0.92);
  }, [onPhoto]);

  // Small downscaled JPEG for the voice mechanic to "see" the current frame.
  const captureFrameDataUrl = useCallback((): string | null => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return null;
    const scale = Math.min(1, 640 / Math.max(v.videoWidth, v.videoHeight));
    const w = Math.round(v.videoWidth * scale), h = Math.round(v.videoHeight * scale);
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(v, 0, 0, w, h);
    return c.toDataURL('image/jpeg', 0.6);
  }, []);

  // ── live identify: map a tap on the (object-fit:cover) video to a
  // source-percent point, then freeze the current frame as a still so the
  // highlight + callout line up with what the user tapped.
  const videoTapToSource = useCallback((clientX: number, clientY: number) => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return null;
    const rect = v.getBoundingClientRect();
    const scale = Math.max(rect.width / v.videoWidth, rect.height / v.videoHeight); // cover
    const cW = v.videoWidth * scale, cH = v.videoHeight * scale;
    const offX = (rect.width - cW) / 2, offY = (rect.height - cH) / 2;
    const sx = (clientX - rect.left - offX) / scale;
    const sy = (clientY - rect.top - offY) / scale;
    return {
      x: Math.max(0, Math.min(100, (sx / v.videoWidth) * 100)),
      y: Math.max(0, Math.min(100, (sy / v.videoHeight) * 100)),
    };
  }, []);

  const freezeAt = useCallback((clientX: number, clientY: number) => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    const point = videoTapToSource(clientX, clientY);
    if (!point) return;
    const scale = Math.min(1, 1600 / Math.max(v.videoWidth, v.videoHeight));
    const w = Math.round(v.videoWidth * scale), h = Math.round(v.videoHeight * scale);
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    try {
      ctx.drawImage(v, 0, 0, w, h);
      setFrozen({ url: c.toDataURL('image/jpeg', 0.9), point });
    } catch { /* draw/encode failed — ignore, stay live */ }
  }, [videoTapToSource]);

  // ── voice "surface_parts" tool: the mechanic (hands-free) asked to put the
  // parts for the fix on screen. Freeze the CENTER of the live frame + open the
  // Identify-&-Shop callout, exactly as if the user had tapped the middle. The
  // mechanic is looking at the same frame, so center is what it's talking about.
  const surfacePartsFromVoice = useCallback((partQuery: string) => {
    const v = videoRef.current;
    if (!v) return;
    const r = v.getBoundingClientRect();
    setScanLabel(partQuery || null); // brief on-screen echo of what it's finding
    freezeAt(r.left + r.width / 2, r.top + r.height / 2);
  }, [freezeAt]);

  // ── Auto-scan: crop the CENTER of the current frame and identify it, then
  // call out the part name (+ speak). One gpt call per tick; hard-capped.
  const scanCenter = useCallback(async () => {
    const v = videoRef.current;
    if (!v || !v.videoWidth || scanBusyRef.current) return;
    // center 40% square crop
    const side = Math.min(v.videoWidth, v.videoHeight) * 0.4;
    const sx = (v.videoWidth - side) / 2, sy = (v.videoHeight - side) / 2;
    const out = Math.min(560, side);
    const c = document.createElement('canvas');
    c.width = out; c.height = out;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    let dataUrl: string;
    try { ctx.drawImage(v, sx, sy, side, side, 0, 0, out, out); dataUrl = c.toDataURL('image/jpeg', 0.82); }
    catch { return; }
    // Full frame too — lets the identifier read badges/logos (ZL1, SRT…) and
    // body-panel shape for make/model, not just the center crop.
    let fullUrl: string | undefined;
    try {
      const fs = Math.min(1, 960 / Math.max(v.videoWidth, v.videoHeight));
      const fw = Math.round(v.videoWidth * fs), fh = Math.round(v.videoHeight * fs);
      const fc = document.createElement('canvas'); fc.width = fw; fc.height = fh;
      const fctx = fc.getContext('2d');
      if (fctx) { fctx.drawImage(v, 0, 0, fw, fh); fullUrl = fc.toDataURL('image/jpeg', 0.8); }
    } catch { /* full frame optional */ }
    scanBusyRef.current = true;
    try {
      const res = await fetch('/api/vision/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageDataUrl: dataUrl,
          fullImageDataUrl: fullUrl,
          prompt: { kind: 'point', x: 50, y: 50 },
          vehicle: vehicle && vehicle.make && vehicle.model
            ? { year: Number(vehicle.year) || undefined, make: vehicle.make, model: vehicle.model, trim: vehicle.trim }
            : undefined,
        }),
      });
      const data = await res.json();
      if (data?.ok && data.part?.name && data.part.category !== 'other') {
        setScanLabel(data.part.name);
        // Only narrate here when the VoiceMechanic isn't already the voice —
        // otherwise the two talk over each other (Devon's "two voices" bug).
        if (!enableVoice) speakLive(data.part.name);
      }
    } catch { /* skip this tick */ }
    finally { scanBusyRef.current = false; }
  }, [vehicle, enableVoice]);

  // drive the auto-scan interval
  useEffect(() => {
    window.clearInterval(scanTimerRef.current);
    if (!autoScan || frozen) return;
    scanCountRef.current = 0;
    setScanLabel(null);
    scanCenter(); // immediate first read
    scanCountRef.current = 1;
    scanTimerRef.current = window.setInterval(() => {
      if (scanCountRef.current >= SCAN_MAX) { setAutoScan(false); return; }
      scanCountRef.current += 1;
      scanCenter();
    }, SCAN_INTERVAL_MS);
    return () => window.clearInterval(scanTimerRef.current);
  }, [autoScan, frozen, scanCenter]);

  // ── video ──
  const stopRecording = useCallback(() => {
    try { mediaRecorderRef.current?.stop(); } catch { /* */ }
  }, []);

  const startRecording = useCallback(() => {
    const stream = streamRef.current;
    if (!stream || typeof MediaRecorder === 'undefined') { setErr("Recording isn't supported on this browser."); return; }
    try {
      recordChunksRef.current = [];
      const { mime, ext } = pickRecordMime();
      const mr = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      const startedAt = performance.now();
      mr.ondataavailable = (e: BlobEvent) => { if (e.data && e.data.size > 0) recordChunksRef.current.push(e.data); };
      mr.onstop = () => {
        window.clearInterval(recordTimerRef.current);
        setRecording(false);
        const dur = (performance.now() - startedAt) / 1000;
        const type = mr.mimeType || (mime || 'video/webm');
        const blob = new Blob(recordChunksRef.current, { type });
        if (blob.size > 0) onVideo(new File([blob], `clip.${ext}`, { type }), Math.round(dur * 10) / 10);
      };
      mr.start();
      setRecording(true);
      setRecordSecs(0);
      const t0 = performance.now();
      recordTimerRef.current = window.setInterval(() => {
        const secs = (performance.now() - t0) / 1000;
        setRecordSecs(secs);
        if (secs >= maxRecordSeconds) stopRecording();
      }, 100);
    } catch {
      setErr('Could not start recording.');
    }
  }, [maxRecordSeconds, onVideo, stopRecording]);

  // Tap = photo, hold (>350ms) = record. Release (or auto-stop) ends it.
  const onShutterDown = useCallback((e: React.PointerEvent) => {
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* */ }
    heldRef.current = false;
    holdTimerRef.current = window.setTimeout(() => { heldRef.current = true; startRecording(); }, 350);
  }, [startRecording]);
  const onShutterUp = useCallback(() => {
    window.clearTimeout(holdTimerRef.current);
    if (heldRef.current) stopRecording();
    else capture();
    heldRef.current = false;
  }, [stopRecording, capture]);

  const onGalleryPhoto = (f: File) => { if (/^image\//.test(f.type)) onPhoto(f); };
  const onGalleryVideo = (f: File) => { if (/^video\//.test(f.type)) onVideo(f, 0); };

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0B0E14', color: '#fff', overflow: 'hidden', fontFamily: 'var(--font-sans, system-ui, sans-serif)', zIndex: 60, userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }}>
      {!cameraDenied && (
        <video ref={videoRef} playsInline muted autoPlay style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      )}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 75% at 50% 42%, transparent 42%, rgba(11,14,20,0.6) 100%)', pointerEvents: 'none' }} />

      {/* live voice mechanic (auth/cost-gated) — positions itself top-right.
          Shown whenever voice is enabled, even while the camera is still
          starting or denied (you can talk to the mechanic without a live
          frame; getFrame just returns null until the camera is up). */}
      {enableVoice && !deviceBlocked && <VoiceMechanic getFrame={captureFrameDataUrl} vehicle={vehicle} autoStart={voiceAutoStart} onSurfaceParts={surfacePartsFromVoice} />}

      {/* top bar */}
      <div style={{ position: 'absolute', top: 12, left: 12, right: 12, zIndex: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button type="button" onClick={() => { stopRecording(); stopCamera(); onClose?.(); }} aria-label="Close"
          style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(0,0,0,0.42)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.14)', color: '#fff', fontSize: 15, cursor: 'pointer' }}>✕</button>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '7px 13px', background: 'rgba(0,0,0,0.42)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 999, color: '#fff', fontSize: 12, fontWeight: 600 }}>
          {beta && <span style={{ fontSize: 8.5, fontWeight: 800, letterSpacing: '0.08em', padding: '2px 5px', borderRadius: 5, background: accent, color: '#fff' }}>BETA</span>}
          {vehicleLabel || 'Diagnose'}
        </span>
        <span style={{ width: 34 }} />
      </div>

      {headerExtra && (
        <div style={{ position: 'absolute', top: 56, left: 12, right: 12, zIndex: 6, display: 'flex', alignItems: 'center', gap: 8 }}>{headerExtra}</div>
      )}

      {/* framing brackets */}
      {!cameraDenied && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 4 }}>
          <div style={{ position: 'relative', width: 250, height: 250 }}>
            {(['tl', 'tr', 'bl', 'br'] as const).map((p) => <Bracket key={p} pos={p} framed={framed} accent={accent} />)}
          </div>
        </div>
      )}

      {/* live-identify tap layer — captures a tap anywhere on the viewfinder.
          The inset leaves the top bar + bottom controls tappable. All the
          no-select props stop iOS from firing a text-selection/copy callout
          on the underlying chrome when you tap. */}
      {!cameraDenied && !frozen && (
        <div
          onPointerDown={(e) => { e.preventDefault(); }}
          onPointerUp={(e) => { e.preventDefault(); freezeAt(e.clientX, e.clientY); }}
          onContextMenu={(e) => e.preventDefault()}
          style={{
            position: 'absolute', top: 56, left: 0, right: 0, bottom: 150, zIndex: 5,
            cursor: 'crosshair', touchAction: 'none',
            userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none',
          }}
        />
      )}

      {/* auto-scan rolling call-out — tap it to freeze + open the full result */}
      {!cameraDenied && !frozen && (autoScan || scanLabel) && (
        <button
          type="button"
          onClick={() => {
            const v = videoRef.current;
            if (!v) return;
            const r = v.getBoundingClientRect();
            freezeAt(r.left + r.width / 2, r.top + r.height / 2);
          }}
          style={{
            position: 'absolute', top: 64, left: '50%', transform: 'translateX(-50%)', zIndex: 6,
            maxWidth: '82%', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 15px',
            borderRadius: 999, background: 'rgba(37,99,235,0.92)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', boxShadow: '0 6px 20px rgba(37,99,235,0.4)',
          }}
        >
          🔎 <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{scanLabel || 'Scanning…'}</span>
          {scanLabel ? <span style={{ opacity: 0.8, fontWeight: 600 }}>· tap to shop</span> : null}
        </button>
      )}

      {/* coach pill (framing feedback for the shutter capture) */}
      {!cameraDenied && !recording && !autoScan && (
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, marginTop: 150, zIndex: 5, display: 'flex', justifyContent: 'center', padding: '0 24px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 15px', background: framed ? 'rgba(16,185,129,0.92)' : 'rgba(0,0,0,0.55)', backdropFilter: 'blur(10px)', borderRadius: 999, boxShadow: framed ? '0 6px 20px rgba(16,185,129,0.42)' : 'none', color: '#fff', fontSize: 12.5, fontWeight: 600 }}>
            {framed ? '✓ ' : ''}{coach}
          </span>
        </div>
      )}

      {/* recording progress + countdown */}
      {recording && (
        <>
          <div style={{ position: 'absolute', top: 0, left: 0, height: 4, width: `${Math.min(100, (recordSecs / maxRecordSeconds) * 100)}%`, background: '#EF4444', transition: 'width 0.1s linear', zIndex: 7 }} />
          <div style={{ position: 'absolute', top: 54, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 7 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '8px 14px', borderRadius: 999, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#EF4444', animation: 'au7oRecBlink 1s steps(2) infinite' }} />
              <span style={{ fontSize: 14, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>0:{String(Math.min(maxRecordSeconds, Math.floor(recordSecs))).padStart(2, '0')}</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>/ 0:{maxRecordSeconds}</span>
            </div>
          </div>
          <style>{`@keyframes au7oRecBlink { 0%,50%{opacity:1} 51%,100%{opacity:0.15} }`}</style>
        </>
      )}

      {/* camera-denied fallback */}
      {cameraDenied && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 28px', textAlign: 'center', color: '#fff' }}>
          {deviceBlocked && (
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, fontSize: 24 }}>📱</div>
          )}
          <p style={{ fontSize: 15, fontWeight: 600, margin: '0 0 6px' }}>{deviceBlocked ? 'Live capture is for phone & tablet' : L.denyTitle}</p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: '0 0 18px', lineHeight: 1.45 }}>{deviceBlocked ? 'Open au7o on your phone to point-and-shoot, or upload a photo or video from this computer.' : L.denyBody}</p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={() => photoInputRef.current?.click()} style={{ padding: '12px 18px', background: accent, color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Upload photo</button>
            <button type="button" onClick={() => videoInputRef.current?.click()} style={{ padding: '12px 18px', background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Upload video</button>
          </div>
          {onClose && <button type="button" onClick={onClose} style={{ marginTop: 18, background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>}
        </div>
      )}

      {/* bottom controls */}
      {!cameraDenied && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 6, padding: '18px 0 26px', background: 'linear-gradient(180deg, transparent, rgba(11,14,20,0.9) 42%)' }}>
          {/* Unified: tap a part in the viewfinder = identify + diagnose that
              part; the shutter captures a full-frame diagnosis (tap = photo,
              hold = video); 🔎 = hands-free continuous scan. No mode toggle. */}
          {modeToggle && !recording && <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>{modeToggle}</div>}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 34px' }}>
            <button type="button" onClick={() => photoInputRef.current?.click()} aria-label={L.upload}
              style={{ width: 46, height: 46, borderRadius: 11, border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.12)', color: '#fff', fontSize: 20, cursor: 'pointer' }}>⊕</button>
            <button type="button"
              onPointerDown={onShutterDown}
              onPointerUp={onShutterUp}
              onPointerCancel={onShutterUp}
              aria-label="Tap for a full-photo diagnosis, hold to record video"
              style={{ width: 82, height: 82, borderRadius: '50%', background: 'transparent', border: `4px solid ${recording ? '#EF4444' : framed ? '#10B981' : '#fff'}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'border-color 0.15s', touchAction: 'none', WebkitUserSelect: 'none', userSelect: 'none' }}>
              <span style={{ width: recording ? 32 : 64, height: recording ? 32 : 64, borderRadius: recording ? 8 : '50%', background: recording ? '#EF4444' : framed ? '#10B981' : '#fff', transition: 'width 0.15s, height 0.15s, border-radius 0.15s' }} />
            </button>
            <button type="button" onClick={() => setAutoScan((s) => !s)} aria-label={autoScan ? 'Stop auto-scan' : 'Auto-scan parts'}
              style={{ width: 46, height: 46, borderRadius: 11, border: `1px solid ${autoScan ? '#EF4444' : 'rgba(255,255,255,0.3)'}`, background: autoScan ? 'rgba(239,68,68,0.9)' : 'rgba(255,255,255,0.12)', color: '#fff', fontSize: 18, cursor: 'pointer' }}>🔎</button>
          </div>
          <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.78)', margin: '9px 0 0', fontWeight: 500 }}>
            {recording ? L.recording : autoScan ? 'Scanning… tap 🔎 to stop' : 'Tap a part to identify · shutter for a full diagnosis'}
          </p>
        </div>
      )}

      {err && (
        <div style={{ position: 'absolute', bottom: 120, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 8 }}>
          <span style={{ padding: '8px 14px', borderRadius: 10, background: 'rgba(127,29,29,0.92)', color: '#FECACA', fontSize: 12.5 }}>{err}</span>
        </div>
      )}

      {/* frozen-frame Identify-&-Shop surface — in-place over the frozen frame
          (no separate screen, no rectangle). SAM mask + shop callout + kit tray
          all live here. The ✕ returns to the live camera. speakResults is off
          when the VoiceMechanic already owns audio, so there's ONE voice. */}
      {frozen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 80 }}>
          <TapToIdentifyPhoto
            embedded
            imageUrl={frozen.url}
            vehicle={vehicle}
            autoIdentifyPoint={frozen.point}
            speakResults={!enableVoice}
            onClose={() => setFrozen(null)}
          />
        </div>
      )}

      {/* hidden gallery inputs */}
      <input ref={photoInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" style={{ display: 'none' }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onGalleryPhoto(f); e.target.value = ''; }} />
      <input ref={videoInputRef} type="file" accept="video/*" style={{ display: 'none' }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onGalleryVideo(f); e.target.value = ''; }} />
    </div>
  );
}

let lastSpoken = '';
function speakLive(text: string) {
  try {
    const synth = window.speechSynthesis;
    if (!synth || text === lastSpoken) return; // don't repeat the same call-out
    lastSpoken = text;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.03;
    synth.speak(u);
  } catch { /* best-effort */ }
}

function Bracket({ pos, framed, accent }: { pos: 'tl' | 'tr' | 'bl' | 'br'; framed: boolean; accent: string }) {
  const color = framed ? '#10B981' : '#fff';
  const base: React.CSSProperties = { position: 'absolute', width: 30, height: 30, borderColor: color, borderStyle: 'solid', borderWidth: 0, opacity: 0.9, transition: 'border-color 0.2s' };
  void accent;
  const map: Record<string, React.CSSProperties> = {
    tl: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 9 },
    tr: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 9 },
    bl: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 9 },
    br: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 9 },
  };
  return <span style={{ ...base, ...map[pos] }} />;
}
