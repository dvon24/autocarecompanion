'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * CAMERA SPIKE — live on-device camera guidance, the foundation of the
 * "Live AI Mechanic" direction (see memory/project_live_ai_mechanic.md).
 *
 * Proves two things on real hardware, with ZERO server cost and the image
 * never leaving the device:
 *   1. Read the live viewfinder — a small CV model (MediaPipe EfficientDet,
 *      loaded lazily from CDN, runs on-device) detects objects each frame and
 *      we draw a box + label on the user's actual camera feed.
 *   2. Coach the shot — real-time "move closer / hold steady / center it /
 *      framed ✓" from object size + centering + a live sharpness metric, with
 *      a green shutter that only lights when the shot is actually good.
 *
 * Robustness: the sharpness/centering COACH works with no model at all, so if
 * the on-device model can't load (older phone / network), the page still
 * guides framing — it just won't name the object. NEVER streams to a server.
 *
 * This is a throwaway proof. The real product swaps the generic detector for a
 * custom car-part model trained on the consented visual-flywheel photos, and
 * layers voice (OpenAI Realtime) on top.
 */

type Detection = { label: string; score: number; x: number; y: number; w: number; h: number };

const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs';
const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';
const DETECTOR_MODEL = 'https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite';

const MAX_RECORD_SECS = 15; // auto-stop the in-app recorder at 15s

// Pick a MediaRecorder mime the browser actually supports (iOS Safari prefers
// mp4; Chrome/Android prefer webm). Empty string lets the browser choose.
function pickRecordMime(): string {
  const candidates = ['video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
  for (const c of candidates) {
    try { if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(c)) return c; } catch { /* */ }
  }
  return '';
}

export function CameraSpikeClient() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const workRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const detectorRef = useRef<any>(null);
  const rafRef = useRef<number>(0);
  const runningRef = useRef(false);
  const frameRef = useRef(0);
  const sharpRef = useRef(999);

  const [started, setStarted] = useState(false);
  const [modelState, setModelState] = useState<'off' | 'loading' | 'ready' | 'failed'>('off');
  const [coach, setCoach] = useState('Point at a part');
  const [framed, setFramed] = useState(false);
  const [captured, setCaptured] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  // In-app video recorder (the true countdown the native camera can't show).
  const [recording, setRecording] = useState(false);
  const [recordSecs, setRecordSecs] = useState(0);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mediaRecorderRef = useRef<any>(null);
  const recordChunksRef = useRef<BlobPart[]>([]);
  const recordTimerRef = useRef<number>(0);
  // Press-and-hold gesture: tap = photo, hold (>350ms) = record video.
  const holdTimerRef = useRef<number>(0);
  const heldRef = useRef(false);

  // ── lazy-load the on-device detector (best-effort) ──
  const loadDetector = useCallback(async () => {
    setModelState('loading');
    try {
      // Dodge the bundler's static analysis so the CDN ESM module loads at
      // runtime only (and only on this page, on demand).
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dynamicImport = new Function('u', 'return import(u)') as (u: string) => Promise<any>;
      const mod = await dynamicImport(MODEL_URL);
      const vision = await mod.FilesetResolver.forVisionTasks(WASM_URL);
      const detector = await mod.ObjectDetector.createFromOptions(vision, {
        baseOptions: { modelAssetPath: DETECTOR_MODEL, delegate: 'GPU' },
        scoreThreshold: 0.35,
        maxResults: 5,
        runningMode: 'VIDEO',
      });
      detectorRef.current = detector;
      setModelState('ready');
    } catch {
      // CPU fallback attempt, then give up gracefully (coach still works).
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dynamicImport = new Function('u', 'return import(u)') as (u: string) => Promise<any>;
        const mod = await dynamicImport(MODEL_URL);
        const vision = await mod.FilesetResolver.forVisionTasks(WASM_URL);
        const detector = await mod.ObjectDetector.createFromOptions(vision, {
          baseOptions: { modelAssetPath: DETECTOR_MODEL, delegate: 'CPU' },
          scoreThreshold: 0.35, maxResults: 5, runningMode: 'VIDEO',
        });
        detectorRef.current = detector;
        setModelState('ready');
      } catch {
        setModelState('failed');
      }
    }
  }, []);

  // ── live sharpness (Laplacian variance on a small copy) ──
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

  // ── per-frame loop ──
  const tick = useCallback(() => {
    const video = videoRef.current;
    const overlay = overlayRef.current;
    if (!video || !overlay || !runningRef.current) return;
    if (video.readyState < 2) { rafRef.current = requestAnimationFrame(tick); return; }

    // Match overlay to the video's displayed size.
    const rect = video.getBoundingClientRect();
    if (overlay.width !== Math.round(rect.width) || overlay.height !== Math.round(rect.height)) {
      overlay.width = Math.round(rect.width);
      overlay.height = Math.round(rect.height);
    }
    const octx = overlay.getContext('2d');
    if (!octx) { rafRef.current = requestAnimationFrame(tick); return; }
    octx.clearRect(0, 0, overlay.width, overlay.height);

    frameRef.current++;
    // Sharpness every ~6 frames (cheap-ish).
    if (frameRef.current % 6 === 0) sharpRef.current = measureSharpness(video);

    // Detection.
    let best: Detection | null = null;
    const det = detectorRef.current;
    if (det) {
      try {
        const res = det.detectForVideo(video, performance.now());
        const vw = video.videoWidth || 1, vh = video.videoHeight || 1;
        const sx = overlay.width / vw, sy = overlay.height / vh;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const d of (res?.detections || []) as any[]) {
          const bb = d.boundingBox;
          const cat = d.categories?.[0];
          if (!bb || !cat) continue;
          const box: Detection = { label: cat.categoryName || 'object', score: cat.score || 0, x: bb.originX * sx, y: bb.originY * sy, w: bb.width * sx, h: bb.height * sy };
          if (!best || box.w * box.h > best.w * best.h) best = box;
          // draw every detection faintly
          octx.strokeStyle = 'rgba(59,130,246,0.55)';
          octx.lineWidth = 2;
          octx.strokeRect(box.x, box.y, box.w, box.h);
        }
      } catch { /* detector hiccup — skip this frame */ }
    }

    // Highlight the primary (largest) detection + label.
    if (best) {
      octx.strokeStyle = framedNow(best, overlay, sharpRef.current) ? '#10B981' : '#3B82F6';
      octx.lineWidth = 3;
      roundRect(octx, best.x, best.y, best.w, best.h, 10);
      octx.stroke();
      const tag = `${best.label} ${(best.score * 100) | 0}%`;
      octx.font = '600 13px system-ui, sans-serif';
      const tw = octx.measureText(tag).width + 14;
      octx.fillStyle = octx.strokeStyle as string;
      roundRect(octx, best.x, Math.max(0, best.y - 24), tw, 20, 6);
      octx.fill();
      octx.fillStyle = '#fff';
      octx.fillText(tag, best.x + 7, Math.max(13, best.y - 10));
    } else {
      // No detection → center reticle to guide aim.
      drawReticle(octx, overlay.width, overlay.height, sharpRef.current >= 28 ? '#3B82F6' : '#F59E0B');
    }

    // Coaching.
    const { msg, ok } = coachFor(best, overlay, sharpRef.current, !!det);
    setCoach(msg);
    setFramed(ok);

    rafRef.current = requestAnimationFrame(tick);
  }, [measureSharpness]);

  const start = useCallback(async () => {
    setErr(null);
    setCaptured(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setStarted(true);
      runningRef.current = true;
      rafRef.current = requestAnimationFrame(tick);
      loadDetector();
    } catch {
      setErr('Camera access denied or unavailable. Allow camera permission and reload.');
    }
  }, [tick, loadDetector]);

  const stop = useCallback(() => {
    runningRef.current = false;
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const capture = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const c = document.createElement('canvas');
    c.width = video.videoWidth; c.height = video.videoHeight;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    setCaptured(c.toDataURL('image/jpeg', 0.9));
  }, []);

  const stopRecording = useCallback(() => {
    try { mediaRecorderRef.current?.stop(); } catch { /* */ }
  }, []);

  const startRecording = useCallback(() => {
    const stream = streamRef.current;
    if (!stream || typeof MediaRecorder === 'undefined') { setErr('Recording isn\'t supported on this browser.'); return; }
    try {
      recordChunksRef.current = [];
      const mime = pickRecordMime();
      const mr = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      mr.ondataavailable = (e: BlobEvent) => { if (e.data && e.data.size > 0) recordChunksRef.current.push(e.data); };
      mr.onstop = () => {
        window.clearInterval(recordTimerRef.current);
        const blob = new Blob(recordChunksRef.current, { type: mr.mimeType || 'video/webm' });
        setRecordedUrl(URL.createObjectURL(blob));
        setRecording(false);
      };
      mr.start();
      setRecording(true);
      setRecordSecs(0);
      const t0 = performance.now();
      recordTimerRef.current = window.setInterval(() => {
        const secs = (performance.now() - t0) / 1000;
        setRecordSecs(secs);
        if (secs >= MAX_RECORD_SECS) stopRecording(); // auto-stop at 15s
      }, 100);
    } catch {
      setErr('Could not start recording.');
    }
  }, [stopRecording]);

  // Shutter press-and-hold: hold past 350ms → start recording; a quick tap →
  // photo. Release (or 15s auto-stop) ends the recording.
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

  useEffect(() => () => { stop(); window.clearInterval(recordTimerRef.current); window.clearTimeout(holdTimerRef.current); }, [stop]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0B0E14', color: '#fff', fontFamily: 'system-ui, sans-serif', overflow: 'hidden' }}>
      {!started ? (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center', gap: 14 }}>
          <div style={{ fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#3B82F6', fontWeight: 700 }}>Au7o · Camera Spike</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, maxWidth: 320, lineHeight: 1.25 }}>Live in-camera shot guidance</h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.66)', maxWidth: 330, lineHeight: 1.5, margin: 0 }}>
            Point your phone at a part. It runs <strong>on-device</strong> (nothing leaves your phone), boxes what it sees, and coaches the shot. Hold it up to the Camaro.
          </p>
          <button type="button" onClick={start} style={{ marginTop: 8, padding: '14px 26px', borderRadius: 14, border: 'none', background: '#3B82F6', color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
            Start camera
          </button>
          {err && <p style={{ color: '#FCA5A5', fontSize: 13, maxWidth: 320 }}>{err}</p>}
        </div>
      ) : (
        <>
          <video ref={videoRef} playsInline muted autoPlay style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          <canvas ref={overlayRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />

          {/* model status chip */}
          <div style={{ position: 'absolute', top: 14, left: 14, display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 11px', borderRadius: 999, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)', fontSize: 11.5, fontWeight: 600 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: modelState === 'ready' ? '#10B981' : modelState === 'loading' ? '#F59E0B' : modelState === 'failed' ? '#9CA3AF' : '#3B82F6' }} />
            {modelState === 'ready' ? 'On-device model: live' : modelState === 'loading' ? 'Loading model…' : modelState === 'failed' ? 'Framing coach (no model)' : 'Starting…'}
          </div>

          {/* coaching pill */}
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, marginTop: 150, display: 'flex', justifyContent: 'center', padding: '0 24px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderRadius: 999, background: framed ? 'rgba(16,185,129,0.92)' : 'rgba(0,0,0,0.55)', backdropFilter: 'blur(10px)', fontSize: 14, fontWeight: 700, boxShadow: framed ? '0 6px 22px rgba(16,185,129,0.45)' : 'none' }}>
              {framed ? '✓ ' : ''}{coach}
            </span>
          </div>

          {/* recording progress bar + countdown */}
          {recording && (
            <>
              <div style={{ position: 'absolute', top: 0, left: 0, height: 4, width: `${Math.min(100, (recordSecs / MAX_RECORD_SECS) * 100)}%`, background: '#EF4444', transition: 'width 0.1s linear', zIndex: 7 }} />
              <div style={{ position: 'absolute', top: 54, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 7 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '8px 14px', borderRadius: 999, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}>
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#EF4444', animation: 'au7oRecBlink 1s steps(2) infinite' }} />
                  <span style={{ fontSize: 14, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>0:{String(Math.min(MAX_RECORD_SECS, Math.floor(recordSecs))).padStart(2, '0')}</span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>/ 0:{MAX_RECORD_SECS}</span>
                </div>
              </div>
              <style>{`@keyframes au7oRecBlink { 0%,50%{opacity:1} 51%,100%{opacity:0.15} }`}</style>
            </>
          )}

          {/* bottom controls */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 0 30px', background: 'linear-gradient(180deg, transparent, rgba(11,14,20,0.9) 45%)' }}>
            <button type="button" onClick={() => { stopRecording(); stop(); }} style={{ position: 'absolute', left: 24, bottom: 40, fontSize: 13, color: 'rgba(255,255,255,0.7)', background: 'none', border: 'none', cursor: 'pointer' }}>Close</button>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <button type="button"
                onPointerDown={onShutterDown}
                onPointerUp={onShutterUp}
                onPointerCancel={onShutterUp}
                aria-label="Tap for photo, hold to record video"
                style={{ width: 82, height: 82, borderRadius: '50%', background: 'transparent', border: `4px solid ${recording ? '#EF4444' : framed ? '#10B981' : '#fff'}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'border-color 0.15s', touchAction: 'none', WebkitUserSelect: 'none', userSelect: 'none' }}>
                <span style={{ width: recording ? 32 : 64, height: recording ? 32 : 64, borderRadius: recording ? 8 : '50%', background: recording ? '#EF4444' : framed ? '#10B981' : '#fff', transition: 'width 0.15s, height 0.15s, border-radius 0.15s' }} />
              </button>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.72)', fontWeight: 500 }}>
                {recording ? 'Recording… release to stop' : 'Tap for photo · hold to record'}
              </span>
            </div>
          </div>

          {/* captured preview */}
          {captured && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(11,14,20,0.92)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, gap: 14 }}>
              <div style={{ fontSize: 13, color: '#10B981', fontWeight: 700 }}>Captured — this is the frame the AI would diagnose</div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={captured} alt="captured" style={{ maxWidth: '100%', maxHeight: '70dvh', borderRadius: 14, border: '1px solid rgba(255,255,255,0.15)' }} />
              <button type="button" onClick={() => setCaptured(null)} style={{ padding: '12px 22px', borderRadius: 12, border: 'none', background: '#3B82F6', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
                Retake
              </button>
            </div>
          )}

          {/* recorded clip preview */}
          {recordedUrl && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(11,14,20,0.94)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, gap: 14, zIndex: 9 }}>
              <div style={{ fontSize: 13, color: '#10B981', fontWeight: 700 }}>Recorded — auto-stops at {MAX_RECORD_SECS}s</div>
              <video src={recordedUrl} controls playsInline style={{ maxWidth: '100%', maxHeight: '64dvh', borderRadius: 14, border: '1px solid rgba(255,255,255,0.15)', background: '#000' }} />
              <button type="button" onClick={() => { if (recordedUrl) URL.revokeObjectURL(recordedUrl); setRecordedUrl(null); }} style={{ padding: '12px 22px', borderRadius: 12, border: 'none', background: '#3B82F6', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
                Record again
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── helpers ──
function centerOffset(b: Detection, canvas: HTMLCanvasElement): number {
  const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
  const dx = (cx - canvas.width / 2) / canvas.width;
  const dy = (cy - canvas.height / 2) / canvas.height;
  return Math.hypot(dx, dy);
}
function areaRatio(b: Detection, canvas: HTMLCanvasElement): number {
  return (b.w * b.h) / (canvas.width * canvas.height);
}
function framedNow(b: Detection, canvas: HTMLCanvasElement, sharp: number): boolean {
  return sharp >= 28 && areaRatio(b, canvas) >= 0.12 && centerOffset(b, canvas) <= 0.22;
}
function coachFor(best: Detection | null, canvas: HTMLCanvasElement, sharp: number, hasModel: boolean): { msg: string; ok: boolean } {
  if (sharp < 22) return { msg: 'Hold steady — let it focus', ok: false };
  if (!best) {
    if (!hasModel) return { msg: sharp >= 28 ? 'Looks sharp — tap to capture' : 'Hold steady', ok: sharp >= 28 };
    return { msg: 'Aim at the part', ok: false };
  }
  if (areaRatio(best, canvas) < 0.12) return { msg: 'Move closer', ok: false };
  if (centerOffset(best, canvas) > 0.22) return { msg: 'Center it in the frame', ok: false };
  return { msg: `Got the ${best.label} — tap to capture`, ok: true };
}
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}
function drawReticle(ctx: CanvasRenderingContext2D, w: number, h: number, color: string) {
  const s = Math.min(w, h) * 0.42;
  const x = (w - s) / 2, y = (h - s) / 2, c = 26;
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  const corners: Array<[number, number, number, number, number, number]> = [
    [x, y + c, x, y, x + c, y],
    [x + s - c, y, x + s, y, x + s, y + c],
    [x, y + s - c, x, y + s, x + c, y + s],
    [x + s - c, y + s, x + s, y + s, x + s, y + s - c],
  ];
  for (const [x1, y1, x2, y2, x3, y3] of corners) {
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.stroke();
  }
}
