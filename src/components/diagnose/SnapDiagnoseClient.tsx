'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { downscaleImage } from '@/lib/downscale-image';
import { VisionResultCard, AnnotatedPhoto, type VisionResult } from '@/components/vehicle/VisionResultCard';
import { InlineGateCard, type GateInfo } from '@/components/vehicle/InlineGateCard';
import { type YMMTData } from '@/schemas/vehicle.schema';
import { loadYmmt } from '@/lib/load-ymmt';
import { useDiagnoseStrings } from '@/lib/diagnose-i18n';
import { trackEvent } from '@/components/analytics/GoogleAnalytics';

/**
 * Mobile snap-first diagnose flow — production port of the au7oapp design
 * (design/au7oapp/.../14-SnapDiagnosis.jsx), part A: the camera + processing
 * screens wired to the real /api/vision. The result renders the existing
 * VisionResultCard (with the urgency hero); the annotated-pins-on-photo
 * result (AnnotatedDiagnosis) is part B and needs bounding-box output from
 * the vision model first.
 *
 * Stages:
 *   camera   → live rear-camera viewfinder, one-tap shutter (gallery fallback)
 *   confirm  → captured frame + scan line + YMMT sheet ("diagnose while you
 *              confirm" — vehicle optional, the API handles unknown)
 *   analyzing→ same frame + scan line + thinking logs while /api/vision runs
 *   result   → VisionResultCard   ·   gated → InlineGateCard   ·   error
 *
 * Desktop still uses the upload-first DiagnoseFlowClient; this is rendered
 * only for mobile (the /diagnose server page decides by UA).
 */

type Stage = 'camera' | 'confirm' | 'analyzing' | 'result' | 'gated' | 'error';
type Mode = 'diagnosis' | 'parts';

const BLUE = 'var(--au7o-blue, #3B82F6)';

export function SnapDiagnoseClient() {
  const { status } = useSession();
  const isSignedIn = status === 'authenticated';
  const t = useDiagnoseStrings();

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const [stage, setStage] = useState<Stage>('camera');
  const [mode, setMode] = useState<Mode>('diagnosis');
  const [cameraDenied, setCameraDenied] = useState(false);
  const [photo, setPhoto] = useState<{ file: File; url: string } | null>(null);
  const [result, setResult] = useState<VisionResult | null>(null);
  const [gate, setGate] = useState<GateInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Visual-flywheel per-upload consent (signed-in only, default OFF). Was
  // hardcoded to decline; now the user can opt in like the desktop flow.
  const [keepPhoto, setKeepPhoto] = useState(false);

  // YMMT (optional)
  const [ymmt, setYmmt] = useState<YMMTData | null>(null);
  const [year, setYear] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [trim, setTrim] = useState('');
  const hasVehicle = !!year && !!make && !!model;

  // ── Camera lifecycle ────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setCameraDenied(true);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setCameraDenied(false);
    } catch {
      setCameraDenied(true);
    }
  }, []);

  // Start when on the camera stage; stop otherwise + on unmount.
  useEffect(() => {
    if (stage === 'camera') startCamera();
    else stopCamera();
    return () => stopCamera();
  }, [stage, startCamera, stopCamera]);

  useEffect(() => {
    loadYmmt().then(setYmmt).catch(() => {});
  }, []);

  // free captured object URL on replace/unmount
  useEffect(() => () => { if (photo) URL.revokeObjectURL(photo.url); }, [photo]);

  const years = useMemo(() => (ymmt ? Object.keys(ymmt).map((y) => parseInt(y, 10)).sort((a, b) => b - a) : []), [ymmt]);
  const makes = useMemo(() => (ymmt && year ? Object.keys(ymmt[year] ?? {}).sort() : []), [ymmt, year]);
  const models = useMemo(() => (ymmt && year && make ? Object.keys(ymmt[year]?.[make] ?? {}).sort() : []), [ymmt, year, make]);
  const trims = useMemo(() => (ymmt && year && make && model ? ymmt[year]?.[make]?.[model] ?? [] : []), [ymmt, year, make, model]);

  // ── Capture ─────────────────────────────────────────────────────
  const capture = () => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    trackEvent('snap_photo_capture', { mode });
    const canvas = document.createElement('canvas');
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(v, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], 'snap.jpg', { type: 'image/jpeg' });
        if (photo) URL.revokeObjectURL(photo.url);
        setPhoto({ file, url: URL.createObjectURL(file) });
        setStage('confirm');
      },
      'image/jpeg',
      0.92,
    );
  };

  const onGalleryChosen = (f: File) => {
    if (!/^image\//.test(f.type)) return;
    if (photo) URL.revokeObjectURL(photo.url);
    setPhoto({ file: f, url: URL.createObjectURL(f) });
    setStage('confirm');
  };

  // ── Submit ──────────────────────────────────────────────────────
  const submit = async () => {
    if (!photo) return;
    setStage('analyzing');
    setError(null);
    setGate(null);
    try {
      const ds = await downscaleImage(photo.file);
      const fd = new FormData();
      fd.append('image', ds, 'snap.jpg');
      fd.append('vehicle', JSON.stringify({ year: year ? Number(year) : undefined, make, model, trim }));
      // Tell the API the user's language so the diagnosis comes back in it.
      if (typeof navigator !== 'undefined' && navigator.language) fd.append('lang', navigator.language);
      if (isSignedIn) fd.append('keepPhoto', keepPhoto ? '1' : '0');
      trackEvent('snap_diagnose_submit', { mode, has_vehicle: hasVehicle });
      const res = await fetch('/api/vision', { method: 'POST', body: fd, signal: AbortSignal.timeout(75_000) });
      const data = await res.json().catch(() => ({}));
      if ((res.status === 401 || res.status === 429) && data.gated) {
        setGate({
          message: data.message ?? 'Sign up to keep diagnosing.',
          ctaUrl: data.ctaUrl ?? '/auth/signup',
          ctaLabel: data.ctaLabel ?? 'Sign up free',
          secondaryCtaUrl: data.secondaryCtaUrl,
          secondaryCtaLabel: data.secondaryCtaLabel,
        });
        setStage('gated');
        return;
      }
      if (!res.ok) {
        setError(data.message || `Diagnosis failed (HTTP ${res.status})`);
        setStage('error');
        return;
      }
      const vision = (data.vision ?? data) as VisionResult;
      if (photo) vision.imagePreviewUrl = photo.url;
      setResult(vision);
      setStage('result');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error. Try again.');
      setStage('error');
    }
  };

  const retake = () => {
    if (photo) URL.revokeObjectURL(photo.url);
    setPhoto(null);
    setResult(null);
    setGate(null);
    setError(null);
    setStage('camera');
  };

  // ════════ RESULT / GATED / ERROR (light, scrollable) ════════
  if (stage === 'result' && result) {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--paper, #F7F6F2)', padding: '12px 12px 40px' }}>
        {/* Annotated photo hero (part B) — pins on the user's real photo;
            no-ops when the model returned no boxes. Then the full result. */}
        <div style={{ background: '#fff', border: '1px solid var(--paper-line, #E3DFD4)', borderRadius: 14, overflow: 'hidden', marginBottom: 12 }}>
          <AnnotatedPhoto vision={result} />
        </div>
        <VisionResultCard vision={result} />
        <button type="button" onClick={retake} style={ghostBtn}>{t.diagnoseAnother}</button>
      </div>
    );
  }
  if (stage === 'gated' && gate) {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--paper, #F7F6F2)', padding: '16px 14px' }}>
        <InlineGateCard gate={gate} />
        <button type="button" onClick={retake} style={ghostBtn}>{t.startOver}</button>
      </div>
    );
  }

  // ════════ CAMERA / CONFIRM / ANALYZING (dark, full-screen) ════════
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0B0E14', overflow: 'hidden', fontFamily: 'var(--font-sans, system-ui, sans-serif)' }}>
      {/* Live viewfinder (camera) OR captured frame (confirm/analyzing) */}
      {stage === 'camera' && !cameraDenied && (
        <video ref={videoRef} playsInline muted autoPlay
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      )}
      {(stage === 'confirm' || stage === 'analyzing') && photo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo.url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: stage === 'analyzing' ? 0.55 : 0.9 }} />
      )}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 75% at 50% 42%, transparent 42%, rgba(11,14,20,0.62) 100%)' }} />

      {/* Scan line during analyzing */}
      {stage === 'analyzing' && (
        <>
          <style>{`@keyframes snapScan { 0%{top:4%} 50%{top:90%} 100%{top:4%} }`}</style>
          <div style={{ position: 'absolute', left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${BLUE}, transparent)`, boxShadow: `0 0 16px ${BLUE}`, animation: 'snapScan 2s ease-in-out infinite', zIndex: 2 }} />
        </>
      )}

      {/* ── TOP BAR ── */}
      <div style={{ position: 'absolute', top: 12, left: 12, right: 12, zIndex: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" aria-label="Close" style={roundBtn}>✕</Link>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '7px 13px', background: 'rgba(0,0,0,0.42)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 999, color: '#fff', fontSize: 12, fontWeight: 600 }}>
          {hasVehicle ? `${year} ${make} ${model}` : t.addCar}
        </span>
        <span style={{ ...roundBtn, visibility: 'hidden' }}>·</span>
      </div>

      {/* known-issues entry + scans-left (camera stage only) */}
      {stage === 'camera' && (
        <div style={{ position: 'absolute', top: 56, left: 12, right: 12, zIndex: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link href="/known-issues" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '7px 12px', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 999, color: '#fff', textDecoration: 'none', fontSize: 11.5, fontWeight: 600 }}>
            {t.browseIssues}
          </Link>
          {!isSignedIn && (
            <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 10px', background: 'rgba(59,130,246,0.9)', borderRadius: 999, color: '#fff', fontSize: 10.5, fontWeight: 700 }}>
              {t.freeLeft}
            </span>
          )}
        </div>
      )}

      {/* frame guide (camera) */}
      {stage === 'camera' && !cameraDenied && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 4 }}>
          <div style={{ position: 'relative', width: 250, height: 250 }}>
            {(['tl', 'tr', 'bl', 'br'] as const).map((p) => <Bracket key={p} pos={p} />)}
          </div>
        </div>
      )}

      {/* hint chip (camera) */}
      {stage === 'camera' && !cameraDenied && (
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, marginTop: 150, zIndex: 5, display: 'flex', justifyContent: 'center', padding: '0 24px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 13px', background: 'rgba(59,130,246,0.92)', backdropFilter: 'blur(10px)', borderRadius: 999, boxShadow: '0 6px 20px rgba(59,130,246,0.4)', color: '#fff', fontSize: 11, fontWeight: 600 }}>
            <Image src="/og-image.png" alt="" width={15} height={15} style={{ borderRadius: 4 }} />
            {mode === 'parts' ? t.hintPart : t.hintProblem}
          </span>
        </div>
      )}

      {/* camera-denied fallback */}
      {stage === 'camera' && cameraDenied && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 28px', textAlign: 'center', color: '#fff' }}>
          <p style={{ fontSize: 15, fontWeight: 600, margin: '0 0 6px' }}>{t.camTitle}</p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: '0 0 18px', lineHeight: 1.45 }}>
            {t.camBody}
          </p>
          <button type="button" onClick={() => galleryRef.current?.click()} style={{ padding: '13px 22px', background: BLUE, color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, fontFamily: 'inherit' }}>
            {t.uploadPhoto}
          </button>
        </div>
      )}

      {/* ── BOTTOM CONTROLS (camera) ── */}
      {stage === 'camera' && !cameraDenied && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 6, padding: '18px 0 24px', background: 'linear-gradient(180deg, transparent, rgba(11,14,20,0.9) 42%)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 2, padding: 3, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 999 }}>
              {(['diagnosis', 'parts'] as const).map((m) => {
                const on = m === mode;
                return (
                  <button key={m} type="button" onClick={() => setMode(m)} style={{ padding: '7px 18px', borderRadius: 999, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', border: 'none', fontFamily: 'inherit', background: on ? '#fff' : 'transparent', color: on ? '#0B1220' : 'rgba(255,255,255,0.7)' }}>
                    {m === 'diagnosis' ? t.modeDiagnosis : t.modeParts}
                  </button>
                );
              })}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 34px' }}>
            <button type="button" onClick={() => galleryRef.current?.click()} aria-label="Upload from gallery" style={{ width: 46, height: 46, borderRadius: 11, border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.12)', color: '#fff', fontSize: 20 }}>⊕</button>
            <button type="button" onClick={capture} aria-label="Take photo" style={{ width: 76, height: 76, borderRadius: '50%', background: 'transparent', border: '4px solid #fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0, cursor: 'pointer' }}>
              <span style={{ width: 60, height: 60, borderRadius: '50%', background: '#fff' }} />
            </button>
            <span style={{ width: 46 }} />
          </div>
          <p style={{ textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.7)', margin: '8px 0 0' }}>{t.tapCapture}</p>
        </div>
      )}

      {/* ── ANALYZING logs ── */}
      {stage === 'analyzing' && (
        <div style={{ position: 'absolute', left: 14, right: 14, bottom: 28, zIndex: 4, display: 'flex', flexDirection: 'column', gap: 9 }}>
          <style>{`@keyframes snapPulse { 0%,100%{opacity:1} 50%{opacity:.35} }`}</style>
          {[t.log1, t.log2, t.log3, t.log4].map((line, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0, background: i < 2 ? 'var(--ok, #10B981)' : i === 2 ? BLUE : 'rgba(255,255,255,0.14)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11 }}>
                {i < 2 ? '✓' : i === 2 ? <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', animation: 'snapPulse 1s ease-in-out infinite' }} /> : null}
              </span>
              <span style={{ fontSize: 12.5, fontWeight: i === 2 ? 600 : 500, color: i <= 2 ? '#fff' : 'rgba(255,255,255,0.5)' }}>{line}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── CONFIRM: YMMT sheet (productive waiting) ── */}
      {stage === 'confirm' && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 6, background: 'var(--paper, #F7F6F2)', borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: '14px 16px 20px', boxShadow: '0 -14px 44px rgba(0,0,0,0.5)', maxHeight: '82dvh', overflowY: 'auto' }}>
          <div style={{ width: 36, height: 4, borderRadius: 999, background: 'var(--paper-line, #E3DFD4)', margin: '0 auto 12px' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: BLUE, flexShrink: 0 }} />
            <span style={{ fontSize: 11.5, color: 'var(--slate-600, #475569)' }}>{t.sheetSub}</span>
          </div>
          <h2 style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 12px' }}>{t.whichCar}</h2>

          {error && <p style={{ margin: '0 0 10px', padding: '8px 12px', background: 'var(--crit-bg, #FEE2E2)', color: 'var(--crit, #B91C1C)', borderRadius: 8, fontSize: 13 }}>{error}</p>}

          <div style={{ marginBottom: 9 }}>
            <Eyebrow>{t.year}</Eyebrow>
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2, marginTop: 6 }}>
              {years.slice(0, 40).map((y) => {
                const on = String(y) === year;
                return (
                  <button key={y} type="button" onClick={() => { setYear(String(y)); setMake(''); setModel(''); setTrim(''); }} style={{ flexShrink: 0, padding: '9px 15px', borderRadius: 10, fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-mono, monospace)', cursor: 'pointer', background: on ? '#0B1220' : 'var(--paper-2, #EFEDE6)', color: on ? '#fff' : 'var(--slate-500, #64748B)', border: `1px solid ${on ? '#0B1220' : 'var(--paper-line, #E3DFD4)'}` }}>{y}</button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 9 }}>
            <SheetSelect label={t.make} value={make} onChange={(v) => { setMake(v); setModel(''); setTrim(''); }} options={makes} disabled={!year} placeholder={year ? t.make : t.yearFirst} />
            <SheetSelect label={t.model} value={model} onChange={(v) => { setModel(v); setTrim(''); }} options={models} disabled={!make} placeholder={make ? t.model : t.makeFirst} />
          </div>
          {trims.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <SheetSelect label={t.trimOptional} value={trim} onChange={setTrim} options={trims} disabled={!model} placeholder={t.trimOptional} />
            </div>
          )}

          {/* Visual-flywheel consent — signed-in only, default OFF. */}
          {isSignedIn && (
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, margin: '4px 0 10px', cursor: 'pointer' }}>
              <input type="checkbox" checked={keepPhoto} onChange={(e) => setKeepPhoto(e.target.checked)}
                style={{ marginTop: 2, width: 15, height: 15, flexShrink: 0, accentColor: BLUE, cursor: 'pointer' }} />
              <span style={{ fontSize: 11.5, color: 'var(--slate-600, #475569)', lineHeight: 1.4 }}>{t.flywheelConsent}</span>
            </label>
          )}

          <button type="button" onClick={submit} style={{ width: '100%', padding: '14px 0', background: BLUE, color: '#fff', border: 'none', borderRadius: 13, fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', marginTop: 4 }}>
            {t.diagnose(hasVehicle ? model : null)}
          </button>
          <button type="button" onClick={retake} style={{ width: '100%', padding: '10px 0 0', background: 'transparent', border: 'none', fontSize: 13, color: 'var(--slate-500, #64748B)', cursor: 'pointer', fontFamily: 'inherit' }}>{t.retake}</button>
        </div>
      )}

      {/* hidden gallery input (fallback / upload) */}
      <input ref={galleryRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" style={{ display: 'none' }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onGalleryChosen(f); e.target.value = ''; }} />
    </div>
  );
}

const roundBtn: React.CSSProperties = {
  width: 34, height: 34, borderRadius: '50%', background: 'rgba(0,0,0,0.42)', backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255,255,255,0.14)', color: '#fff', display: 'inline-flex', alignItems: 'center',
  justifyContent: 'center', fontSize: 15, textDecoration: 'none',
};
const ghostBtn: React.CSSProperties = {
  display: 'block', margin: '16px auto 0', background: 'transparent', border: 'none', fontSize: 13,
  color: 'var(--slate-500, #64748B)', textDecoration: 'underline', cursor: 'pointer', fontFamily: 'inherit',
};

function Bracket({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const base: React.CSSProperties = { position: 'absolute', width: 30, height: 30, borderColor: '#fff', borderStyle: 'solid', borderWidth: 0, opacity: 0.9 };
  const map: Record<string, React.CSSProperties> = {
    tl: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 9 },
    tr: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 9 },
    bl: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 9 },
    br: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 9 },
  };
  return <span style={{ ...base, ...map[pos] }} />;
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--slate-500, #64748B)' }}>{children}</div>;
}

function SheetSelect({ label, value, onChange, options, disabled, placeholder }: { label: string; value: string; onChange: (v: string) => void; options: string[]; disabled?: boolean; placeholder: string }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '8px 11px', background: '#fff', border: `1px solid ${value ? BLUE : 'var(--paper-line, #E3DFD4)'}`, borderRadius: 11 }}>
      <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--slate-500, #64748B)' }}>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}
        style={{ border: 'none', background: 'transparent', fontSize: 14.5, fontWeight: 700, color: value ? '#0B1220' : 'var(--slate-500, #64748B)', fontFamily: 'inherit', outline: 'none', padding: 0, width: '100%' }}>
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}
