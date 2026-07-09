'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { downscaleImage } from '@/lib/downscale-image';
import { extractVideoFrames } from '@/lib/video-extract';
import { LiveCameraShutter } from '@/components/diagnose/LiveCameraShutter';
import { VisionResultCard, AnnotatedPhoto, type VisionResult } from '@/components/vehicle/VisionResultCard';
import { TapToIdentifyPhoto } from '@/components/diagnose/TapToIdentifyPhoto';
import { InlineGateCard, type GateInfo } from '@/components/vehicle/InlineGateCard';
import { type YMMTData } from '@/schemas/vehicle.schema';
import { loadYmmt } from '@/lib/load-ymmt';
import { useDiagnoseStrings } from '@/lib/diagnose-i18n';
import { trackEvent } from '@/components/analytics/GoogleAnalytics';

/**
 * Mobile snap-first diagnose flow. The capture surface is the shared
 * <LiveCameraShutter> (the same one the vehicle hub uses): live viewfinder,
 * framing coach, and ONE unified shutter — TAP = photo, HOLD = record video
 * (15s) — plus the optional live voice mechanic for signed-in users.
 *
 * Stages:
 *   camera   → <LiveCameraShutter> (photo OR video, gallery fallback, voice)
 *   confirm  → captured frame/clip + scan line + YMMT sheet ("diagnose while
 *              you confirm" — vehicle optional, the API handles unknown)
 *   analyzing→ same media + scan line + thinking logs while /api/vision runs
 *   result   → VisionResultCard   ·   gated → InlineGateCard   ·   error
 */

type Stage = 'camera' | 'confirm' | 'analyzing' | 'result' | 'gated' | 'error';
type Mode = 'diagnosis' | 'parts';
type Captured = { kind: 'photo' | 'video'; file: File; url: string };

const BLUE = 'var(--au7o-blue, #3B82F6)';

export function SnapDiagnoseClient() {
  const { status } = useSession();
  const isSignedIn = status === 'authenticated';
  const t = useDiagnoseStrings();
  const router = useRouter();

  const [stage, setStage] = useState<Stage>('camera');
  const [mode, setMode] = useState<Mode>('diagnosis');
  const [photo, setPhoto] = useState<Captured | null>(null);
  const [result, setResult] = useState<VisionResult | null>(null);
  const [gate, setGate] = useState<GateInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Visual-flywheel per-upload consent (signed-in only, default OFF).
  const [keepPhoto, setKeepPhoto] = useState(false);

  // YMMT (optional)
  const [ymmt, setYmmt] = useState<YMMTData | null>(null);
  const [year, setYear] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [trim, setTrim] = useState('');
  const hasVehicle = !!year && !!make && !!model;

  useEffect(() => {
    loadYmmt().then(setYmmt).catch(() => {});
  }, []);

  // free captured object URL on replace/unmount
  useEffect(() => () => { if (photo) URL.revokeObjectURL(photo.url); }, [photo]);

  const years = useMemo(() => (ymmt ? Object.keys(ymmt).map((y) => parseInt(y, 10)).sort((a, b) => b - a) : []), [ymmt]);
  const makes = useMemo(() => (ymmt && year ? Object.keys(ymmt[year] ?? {}).sort() : []), [ymmt, year]);
  const models = useMemo(() => (ymmt && year && make ? Object.keys(ymmt[year]?.[make] ?? {}).sort() : []), [ymmt, year, make]);
  const trims = useMemo(() => (ymmt && year && make && model ? ymmt[year]?.[make]?.[model] ?? [] : []), [ymmt, year, make, model]);

  // ── Capture callbacks from the shutter ──────────────────────────
  const onCaptured = useCallback((kind: 'photo' | 'video', file: File) => {
    trackEvent(kind === 'video' ? 'snap_video_capture' : 'snap_photo_capture', { mode });
    setPhoto((prev) => { if (prev) URL.revokeObjectURL(prev.url); return { kind, file, url: URL.createObjectURL(file) }; });
    setStage('confirm');
  }, [mode]);

  // ── Submit ──────────────────────────────────────────────────────
  const submit = async () => {
    if (!photo) return;
    setStage('analyzing');
    setError(null);
    setGate(null);
    const vehiclePayload = JSON.stringify({ year: year ? Number(year) : undefined, make, model, trim });
    try {
      let fd: FormData;
      let timeoutMs: number;
      if (photo.kind === 'video') {
        const extract = await extractVideoFrames(photo.file, 4);
        if (extract.frames.length === 0) {
          setError("Couldn't read your video — try a different format (MP4 or MOV).");
          setStage('error');
          return;
        }
        fd = new FormData();
        extract.frames.forEach((f, i) => fd.append('frames', f, `frame_${i}.jpg`));
        if (extract.audio) fd.append('audio', extract.audio, extract.audio.name);
        timeoutMs = 90_000; // Whisper + multi-frame takes longer than a photo
      } else {
        const ds = await downscaleImage(photo.file);
        fd = new FormData();
        fd.append('image', ds, 'snap.jpg');
        timeoutMs = 75_000;
      }
      fd.append('vehicle', vehiclePayload);
      if (typeof navigator !== 'undefined' && navigator.language) fd.append('lang', navigator.language);
      if (isSignedIn) fd.append('keepPhoto', keepPhoto ? '1' : '0');
      trackEvent('snap_diagnose_submit', { mode, kind: photo.kind, has_vehicle: hasVehicle });
      const res = await fetch('/api/vision', { method: 'POST', body: fd, signal: AbortSignal.timeout(timeoutMs) });
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
      const isTimeout = e instanceof DOMException && (e.name === 'TimeoutError' || e.name === 'AbortError');
      setError(isTimeout ? 'That took too long. Try a clearer, shorter capture.' : (e instanceof Error ? e.message : 'Network error. Try again.'));
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
        <div style={{ background: '#fff', border: '1px solid var(--paper-line, #E3DFD4)', borderRadius: 14, overflow: 'hidden', marginBottom: 12 }}>
          <AnnotatedPhoto vision={result} />
        </div>
        <VisionResultCard vision={result} />
        {(result.imagePreviewUrl || photo?.url) && (
          <div style={{ background: '#fff', border: '1px solid var(--paper-line, #E3DFD4)', borderRadius: 14, padding: 12, marginTop: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#0B1220', marginBottom: 8 }}>Tap to identify any part</div>
            <TapToIdentifyPhoto
              imageUrl={(result.imagePreviewUrl || photo?.url)!}
              vehicle={hasVehicle ? { year, make, model, trim } : undefined}
            />
          </div>
        )}
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
  if (stage === 'error') {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--paper, #F7F6F2)', padding: '20px 16px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {photo && <CapturedThumb captured={photo} size={120} />}
        <div style={{ maxWidth: 440, width: '100%', background: '#fff', border: '1px solid var(--paper-line, #E3DFD4)', borderRadius: 16, padding: '18px 18px 20px', textAlign: 'center', marginTop: 16 }}>
          <div style={{ fontSize: 30, lineHeight: 1, marginBottom: 8 }} aria-hidden>⚠️</div>
          <div style={{ fontSize: 15.5, fontWeight: 700, color: 'var(--ink, #0B1220)', marginBottom: 6 }}>That didn&apos;t go through</div>
          <p style={{ fontSize: 13.5, color: 'var(--slate-600, #475569)', lineHeight: 1.5, margin: '0 0 16px' }}>
            {error || 'Something went wrong. Try again — it usually works on a retry.'}
          </p>
          <button type="button" onClick={submit} disabled={!photo}
            style={{ width: '100%', padding: '13px 0', background: BLUE, color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: photo ? 'pointer' : 'default', fontFamily: 'inherit', opacity: photo ? 1 : 0.5 }}>
            Try again
          </button>
          <button type="button" onClick={retake}
            style={{ width: '100%', padding: '11px 0 0', background: 'transparent', border: 'none', fontSize: 13.5, color: 'var(--slate-500, #64748B)', cursor: 'pointer', fontFamily: 'inherit' }}>
            {t.retake}
          </button>
        </div>
      </div>
    );
  }

  // ════════ CAMERA ════════
  if (stage === 'camera') {
    const modeToggle = (
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
    );
    const headerExtra = (
      <>
        <Link href="/known-issues" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '7px 12px', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 999, color: '#fff', textDecoration: 'none', fontSize: 11.5, fontWeight: 600 }}>
          {t.browseIssues}
        </Link>
        {!isSignedIn && (
          <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 10px', background: 'rgba(59,130,246,0.9)', borderRadius: 999, color: '#fff', fontSize: 10.5, fontWeight: 700 }}>
            {t.freeLeft}
          </span>
        )}
      </>
    );
    return (
      <LiveCameraShutter
        onPhoto={(f) => onCaptured('photo', f)}
        onVideo={(f) => onCaptured('video', f)}
        onClose={() => router.push('/')}
        vehicle={hasVehicle ? { year: Number(year), make, model, trim } : undefined}
        vehicleLabel={hasVehicle ? `${year} ${make} ${model}${trim ? ' ' + trim : ''}` : t.addCar}
        enableVoice
        voiceAutoStart={false}
        modeToggle={modeToggle}
        headerExtra={headerExtra}
        labels={{ hint: mode === 'parts' ? t.hintPart : t.hintProblem, tapHold: `${t.tapCapture} · or hold to record` }}
      />
    );
  }

  // ════════ CONFIRM / ANALYZING (dark, full-screen) ════════
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0B0E14', overflow: 'hidden', fontFamily: 'var(--font-sans, system-ui, sans-serif)' }}>
      {photo && (
        photo.kind === 'video' ? (
          <video src={photo.url} muted loop autoPlay playsInline
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: stage === 'analyzing' ? 0.55 : 0.9 }} />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo.url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: stage === 'analyzing' ? 0.55 : 0.9 }} />
        )
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
        <button type="button" onClick={retake} aria-label="Back" style={roundBtn}>✕</button>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '7px 13px', background: 'rgba(0,0,0,0.42)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 999, color: '#fff', fontSize: 12, fontWeight: 600 }}>
          {hasVehicle ? `${year} ${make} ${model}` : t.addCar}
        </span>
        <span style={{ ...roundBtn, visibility: 'hidden' }}>·</span>
      </div>

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
            <span style={{ fontSize: 11.5, color: 'var(--slate-600, #475569)' }}>{photo?.kind === 'video' ? 'Clip ready — we’ll read the frames + sound' : t.sheetSub}</span>
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
    </div>
  );
}

function CapturedThumb({ captured, size }: { captured: Captured; size: number }) {
  const style: React.CSSProperties = { width: size, height: size, objectFit: 'cover', borderRadius: 14, border: '1px solid var(--paper-line, #E3DFD4)' };
  if (captured.kind === 'video') return <video src={captured.url} muted playsInline style={style} />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={captured.url} alt="" style={style} />;
}

const roundBtn: React.CSSProperties = {
  width: 34, height: 34, borderRadius: '50%', background: 'rgba(0,0,0,0.42)', backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255,255,255,0.14)', color: '#fff', display: 'inline-flex', alignItems: 'center',
  justifyContent: 'center', fontSize: 15, textDecoration: 'none', cursor: 'pointer',
};
const ghostBtn: React.CSSProperties = {
  display: 'block', margin: '16px auto 0', background: 'transparent', border: 'none', fontSize: 13,
  color: 'var(--slate-500, #64748B)', textDecoration: 'underline', cursor: 'pointer', fontFamily: 'inherit',
};

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
