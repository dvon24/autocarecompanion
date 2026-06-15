'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { Icon } from '@/components/ui/Icon';
import { downscaleImage } from '@/lib/downscale-image';
import { VisionResultCard, type VisionResult } from '@/components/vehicle/VisionResultCard';
import { InlineGateCard, type GateInfo } from '@/components/vehicle/InlineGateCard';
import { type YMMTData } from '@/schemas/vehicle.schema';
import { loadYmmt } from '@/lib/load-ymmt';
import { diagnoseStrings } from '@/lib/diagnose-i18n';
import { trackEvent } from '@/components/analytics/GoogleAnalytics';

/**
 * sessionStorage key shared with /diagnose/claim. Stashes everything
 * the claim endpoint needs to re-create the diagnosis chat after the
 * user signs up + lands back on /diagnose/claim. Cleared by the claim
 * page on successful seed.
 */
const SNAPSHOT_KEY = 'au7o.diagSnapshot';

/**
 * Phase 4.5 — anonymous-friendly "try-it-free" photo diagnose flow.
 *
 * Mirrors design/au7o(3)/11-DesktopDiagnose.jsx (DesktopUploadDiagnose +
 * inline analyze + result), adapted for the existing /api/vision
 * endpoint and the production VisionResultCard renderer.
 *
 * State machine:
 *   idle      → vehicle picker + upload zone visible
 *   analyzing → image is being downscaled + POST'd to /api/vision
 *   result    → VisionResultCard rendered + chat handoff CTA
 *   gated     → InlineGateCard (anon used their free credit)
 *   error     → generic error message + retry
 *
 * Anonymous users are rate-limited server-side to 1 photo per IP per
 * month via the existing photo-quota ChatQuota bucket. After the free
 * credit, the API returns 401 with login_required gate info which we
 * render in-place — no redirect, no surprise.
 */

type State = 'idle' | 'analyzing' | 'result' | 'gated' | 'error';

export function DiagnoseFlowClient({ isMobile = false }: { isMobile?: boolean }) {
  const { status: sessionStatus } = useSession();
  const isSignedIn = sessionStatus === 'authenticated';
  const t = diagnoseStrings();
  // YMMT picker
  const [ymmt, setYmmt] = useState<YMMTData | null>(null);
  const [year, setYear] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [trim, setTrim] = useState('');

  // File state
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  // Visual data flywheel (Phase 0) per-upload opt-in. Default OFF. Only
  // shown to (and only sent for) signed-in users — an anon visitor has no
  // account to exercise deletion against, so we never collect a consent
  // we couldn't honor.
  const [keepPhoto, setKeepPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Second input WITHOUT `capture` so mobile users can pick an existing
  // photo/video they shot earlier (the camera input forces a live capture).
  const galleryInputRef = useRef<HTMLInputElement>(null);
  // Multi-photo (Pro): additional angles of the SAME issue beyond the first
  // photo. The /api/vision route accepts every `image` part and Pro-gates
  // the extras (free users get the first only + an upsell). 1 primary + up
  // to 4 extra = 5 total (matches the route's MAX_PHOTOS).
  const [extraFiles, setExtraFiles] = useState<File[]>([]);
  const [extraPreviews, setExtraPreviews] = useState<string[]>([]);
  const addAngleInputRef = useRef<HTMLInputElement>(null);
  const MAX_ANGLES = 5;

  // Flow state
  const [state, setState] = useState<State>('idle');
  const [result, setResult] = useState<VisionResult | null>(null);
  const [gate, setGate] = useState<GateInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    // Resilient loader: network fetch first, bundled-copy fallback on any
    // failure (interrupted 1MB download, broken SW precache, parse error)
    // so the year/make/model dropdowns ALWAYS populate. (Prod bug: empty
    // year dropdown for a user in Germany whose fetch never completed.)
    loadYmmt()
      .then(setYmmt)
      .catch((err) => console.warn('[diagnose] ymmt load failed (network + bundled fallback)', err));
  }, []);

  // Free the preview URL on unmount / replace.
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const years = useMemo(
    () => (ymmt ? Object.keys(ymmt).map((y) => parseInt(y, 10)).sort((a, b) => b - a) : []),
    [ymmt]
  );
  const makes = useMemo(
    () => (ymmt && year ? Object.keys(ymmt[year] ?? {}).sort() : []),
    [ymmt, year]
  );
  const models = useMemo(
    () => (ymmt && year && make ? Object.keys(ymmt[year]?.[make] ?? {}).sort() : []),
    [ymmt, year, make]
  );
  const trims = useMemo(
    () => (ymmt && year && make && model ? ymmt[year]?.[make]?.[model] ?? [] : []),
    [ymmt, year, make, model]
  );

  // Photo is the ONLY hard requirement. Vehicle (YMMT) is now OPTIONAL —
  // the /api/vision route already handles "unknown vehicle", it's just less
  // accurate without it. So we never block on YMMT; we surface a disclaimer
  // instead (desktop "skip & diagnose", and a note in the analyzing state).
  // Trim was always optional. This fixes the grayed-button dead-ends.
  const hasVehicle = !!year && !!make && !!model;
  const ready = !!file;

  const onFileChosen = (f: File) => {
    if (!/^image\//.test(f.type)) {
      setError(t.chooseImageErr);
      setState('error');
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(URL.createObjectURL(f));
    if (state === 'error') setState('idle');
  };

  // Add another angle (multi-photo). Appends to the extras list, capped so
  // primary + extras ≤ MAX_ANGLES.
  const onAngleChosen = (f: File) => {
    if (!/^image\//.test(f.type)) {
      setError(t.chooseImageErr);
      setState('error');
      return;
    }
    setExtraFiles((prev) => (prev.length + 1 >= MAX_ANGLES ? prev : [...prev, f]));
    setExtraPreviews((prev) => (prev.length + 1 >= MAX_ANGLES ? prev : [...prev, URL.createObjectURL(f)]));
    if (state === 'error') setState('idle');
  };

  const removeAngle = (i: number) => {
    setExtraPreviews((prev) => {
      const url = prev[i];
      if (url) URL.revokeObjectURL(url);
      return prev.filter((_, idx) => idx !== i);
    });
    setExtraFiles((prev) => prev.filter((_, idx) => idx !== i));
  };

  const submit = async () => {
    if (!ready || state === 'analyzing') return;
    setState('analyzing');
    setError(null);
    setGate(null);
    trackEvent('diagnose_photo_submit', {
      source: isMobile ? 'mobile_upload' : 'desktop_upload',
      has_vehicle: hasVehicle,
      angles: extraFiles.length + 1,
    });

    try {
      // Client-side downscale to keep us under Vercel's 4.5 MB body cap.
      const fd = new FormData();
      const primary = await downscaleImage(file!);
      fd.append('image', primary, file!.name || 'diagnose.jpg');
      // Additional angles (multi-photo). The route Pro-gates these — free
      // users' extras are dropped server-side and flagged for an upsell.
      for (let i = 0; i < extraFiles.length; i++) {
        const angle = await downscaleImage(extraFiles[i]);
        fd.append('image', angle, extraFiles[i].name || `angle-${i + 1}.jpg`);
      }
      fd.append(
        'vehicle',
        JSON.stringify({ year: Number(year), make, model, trim })
      );
      if (caption.trim()) fd.append('caption', caption.trim());
      // User's language → diagnosis responds in it (not English).
      if (typeof navigator !== 'undefined' && navigator.language) fd.append('lang', navigator.language);
      // Per-upload consent signal — only for signed-in users. '1' = keep,
      // '0' = explicit decline (overrides any account-level opt-in for
      // this upload). Anon sends nothing (server never stores anon).
      if (isSignedIn) fd.append('keepPhoto', keepPhoto ? '1' : '0');

      const res = await fetch('/api/vision', {
        method: 'POST',
        body: fd,
        signal: AbortSignal.timeout(75_000),
      });
      const data = await res.json().catch(() => ({}));

      if ((res.status === 401 || res.status === 429) && data.gated) {
        setGate({
          message: data.message ?? 'Sign up to keep diagnosing.',
          ctaUrl: data.ctaUrl ?? '/auth/signup',
          ctaLabel: data.ctaLabel ?? 'Sign up free',
          secondaryCtaUrl: data.secondaryCtaUrl,
          secondaryCtaLabel: data.secondaryCtaLabel,
        });
        setState('gated');
        return;
      }

      if (!res.ok) {
        setError(data.message || `Diagnosis failed (HTTP ${res.status})`);
        setState('error');
        return;
      }

      // /api/vision returns { vision: VisionResult }; some legacy paths
      // return the result at top level. Accept both.
      const vision = (data.vision ?? data) as VisionResult;
      setResult(vision);
      setState('result');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error. Try again.');
      setState('error');
    }
  };

  const reset = () => {
    if (preview) URL.revokeObjectURL(preview);
    extraPreviews.forEach((u) => URL.revokeObjectURL(u));
    setFile(null);
    setPreview(null);
    setExtraFiles([]);
    setExtraPreviews([]);
    setCaption('');
    setResult(null);
    setGate(null);
    setError(null);
    setState('idle');
  };

  const vehicleSlug = useMemo(() => {
    if (!year || !make || !model) return null;
    const slug = `${year}-${make}-${model}${trim ? `-${trim}` : ''}`
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    return slug;
  }, [year, make, model, trim]);

  /**
   * "Save & open chat" handler. Snapshots the diagnosis into
   * sessionStorage and navigates the user into the claim flow.
   *
   * - Anonymous user → /auth/signup?callbackUrl=/diagnose/claim.
   *   The signup page renders a banner reading the snapshot back so
   *   they see what they're saving. After signup, /diagnose/claim
   *   POSTs to /api/diagnose/seed and routes them to their hub.
   * - Signed-in user → /diagnose/claim directly. No signup detour.
   *
   * Snapshot is cleared by /diagnose/claim on successful seed.
   */
  const handleSaveAndOpenChat = () => {
    if (!result) return;
    try {
      const snapshot = {
        visionResult: result,
        year: Number(year),
        make,
        model,
        trim: trim || undefined,
        caption: caption.trim() || undefined,
      };
      sessionStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot));
    } catch {
      /* sessionStorage can fail in private mode — let the navigation
         continue so the user at least sees the claim-page fallback. */
    }
    const callback = '/diagnose/claim';
    if (isSignedIn) {
      window.location.href = callback;
    } else {
      window.location.href = `/auth/signup?callbackUrl=${encodeURIComponent(callback)}`;
    }
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--paper, #F7F6F2)',
        color: 'var(--ink, #0B1220)',
        fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)',
      }}
    >
      {/* Top bar */}
      <header
        style={{
          padding: '16px 22px',
          borderBottom: '1px solid var(--paper-line, #E3DFD4)',
          background: 'rgba(247,246,242,0.92)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'inherit' }}>
            <Image src="/og-image.png" alt="" width={26} height={26} className="rounded-md" />
            <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>
              Au<span style={{ color: 'var(--au7o-blue, #3B82F6)' }}>7</span>o
            </span>
          </Link>
          <span style={{ fontSize: 12, color: 'var(--slate-500, #64748B)' }}>
            {t.freeNoCard}
          </span>
        </div>
      </header>

      <main style={{ maxWidth: 980, margin: '0 auto', padding: '40px 22px 80px' }}>
        {/* Title + intro */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--au7o-blue, #3B82F6)',
            }}
          >
            {t.freeBadge}
          </div>
          <h1
            style={{
              fontSize: 'clamp(28px, 5vw, 34px)',
              fontWeight: 700,
              letterSpacing: '-0.025em',
              margin: '8px 0 0',
            }}
          >
            {t.showWrong}
          </h1>
          <p style={{ fontSize: 15, color: 'var(--slate-700, #334155)', margin: '8px 0 0', maxWidth: 580, marginLeft: 'auto', marginRight: 'auto' }}>
            {t.intro(isMobile)}
          </p>
        </div>

        {/* Idle / analyzing — upload form */}
        {(state === 'idle' || state === 'analyzing' || state === 'error') && (
          <div
            style={{
              background: '#fff',
              border: '1px solid var(--paper-line, #E3DFD4)',
              borderRadius: 18,
              padding: 22,
              boxShadow: 'var(--shadow-1, 0 1px 2px rgba(11,18,32,0.06))',
            }}
          >
            <div className="dx-grid">
              {/* LEFT — YMMT picker (now optional) */}
              <div className="dx-col-vehicle">
                <Eyebrow>{t.vehicleOptional}</Eyebrow>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 10 }}>
                  <Select
                    label={t.yearLabel}
                    value={year}
                    onChange={(v) => { setYear(v); setMake(''); setModel(''); setTrim(''); }}
                    options={years.map((y) => String(y))}
                    placeholder={t.yearLabel}
                  />
                  <Select
                    label={t.makeLabel}
                    value={make}
                    onChange={(v) => { setMake(v); setModel(''); setTrim(''); }}
                    options={makes}
                    placeholder={year ? t.makeLabel : t.pickYearFirst}
                    disabled={!year}
                  />
                  <Select
                    label={t.modelLabel}
                    value={model}
                    onChange={(v) => { setModel(v); setTrim(''); }}
                    options={models}
                    placeholder={make ? t.modelLabel : t.pickMakeFirst}
                    disabled={!make}
                  />
                  <Select
                    label={t.trimLabel}
                    value={trim}
                    onChange={setTrim}
                    options={trims}
                    placeholder={model ? t.trimLabel : t.pickModelFirst}
                    disabled={!model}
                  />
                </div>
              </div>

              {/* RIGHT — upload zone (ordered first on mobile = photo-first) */}
              <div className="dx-col-photo">
                <Eyebrow>{isMobile ? t.takePhotoEyebrow : t.problemEyebrow}</Eyebrow>
                {!file ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      const f = e.dataTransfer.files?.[0];
                      if (f) onFileChosen(f);
                    }}
                    style={{
                      width: '100%',
                      marginTop: 10,
                      height: 232,
                      borderRadius: 12,
                      border: `2px dashed ${dragOver ? 'var(--au7o-blue-700, #1D4ED8)' : 'var(--au7o-blue, #3B82F6)'}`,
                      background: dragOver ? 'rgba(59,130,246,0.12)' : 'var(--au7o-blue-50, #EFF6FF)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      padding: '0 24px',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    <span
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        background: '#fff',
                        border: '1px solid var(--au7o-blue-100, #DBEAFE)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--au7o-blue, #3B82F6)',
                        marginBottom: 14,
                      }}
                    >
                      <Icon name="camera" size={20} />
                    </span>
                    <span style={{ fontSize: 15.5, fontWeight: 600, color: 'var(--ink, #0B1220)' }}>
                      {isMobile ? t.tapOpenCamera : t.dragPhoto}
                    </span>
                    <span style={{ fontSize: 13, color: 'var(--slate-600, #475569)', marginTop: 4 }}>
                      {isMobile ? (
                        t.pointAtProblem
                      ) : (
                        <>
                          {t.orPrefix}
                          <span style={{ color: 'var(--au7o-blue-700, #1D4ED8)', fontWeight: 600, textDecoration: 'underline' }}>
                            {t.browseFiles}
                          </span>
                        </>
                      )}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--slate-400, #94A3B8)', marginTop: 14 }}>
                      {t.fileTypes}
                    </span>
                  </button>
                ) : (
                  <div
                    style={{
                      width: '100%',
                      marginTop: 10,
                      height: 232,
                      borderRadius: 12,
                      overflow: 'hidden',
                      border: '1px solid var(--paper-line, #E3DFD4)',
                      position: 'relative',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview ?? ''}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(180deg, transparent 55%, rgba(11,18,32,0.7))',
                      }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '5px 10px',
                        background: 'rgba(16,185,129,0.95)',
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#fff',
                      }}
                    >
                      <Icon name="check" size={11} /> {t.loaded}
                    </span>
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 12,
                        left: 14,
                        right: 14,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                      }}
                    >
                      <span style={{ flex: 1, fontSize: 11.5, color: '#fff', fontFamily: 'var(--font-geist-mono, monospace)' }}>
                        {file.name} · {(file.size / 1024 / 1024).toFixed(1)} MB
                      </span>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          padding: '5px 12px',
                          background: 'rgba(255,255,255,0.92)',
                          border: 'none',
                          borderRadius: 8,
                          fontSize: 11.5,
                          fontWeight: 600,
                          color: 'var(--ink, #0B1220)',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        {t.replace}
                      </button>
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                  // On phones, open the rear camera directly (photo-first).
                  // Ignored on desktop, where it falls back to the file dialog.
                  capture={isMobile ? 'environment' : undefined}
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onFileChosen(f);
                  }}
                />
                {/* Gallery picker (no capture) — lets phone users choose a
                    photo/video they already took. */}
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onFileChosen(f);
                  }}
                />
                {isMobile && !file && (
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    style={{
                      width: '100%',
                      marginTop: 10,
                      padding: '11px 13px',
                      fontSize: 13,
                      fontWeight: 600,
                      background: 'transparent',
                      border: '1px solid var(--paper-line, #E3DFD4)',
                      borderRadius: 10,
                      color: 'var(--slate-700, #334155)',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    {t.uploadExisting}
                  </button>
                )}
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder={t.captionPlaceholder}
                  style={{
                    width: '100%',
                    marginTop: 10,
                    padding: '10px 13px',
                    fontSize: 13,
                    background: 'var(--paper-2, #EFEDE6)',
                    border: '1px solid var(--paper-line, #E3DFD4)',
                    borderRadius: 10,
                    color: 'var(--ink, #0B1220)',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                  }}
                />

                {/* Multi-photo (Pro): add more angles of the same issue. */}
                {file && (
                  <div style={{ marginTop: 12 }}>
                    <input
                      ref={addAngleInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                      capture={isMobile ? 'environment' : undefined}
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) onAngleChosen(f);
                        e.target.value = '';
                      }}
                    />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                      {extraPreviews.map((src, i) => (
                        <div key={i} style={{ position: 'relative', width: 54, height: 54, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--paper-line, #E3DFD4)' }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={src} alt={`Angle ${i + 2}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button
                            type="button"
                            onClick={() => removeAngle(i)}
                            aria-label="Remove angle"
                            style={{
                              position: 'absolute', top: 2, right: 2, width: 18, height: 18, borderRadius: '50%',
                              background: 'rgba(11,18,32,0.78)', color: '#fff', border: 'none', fontSize: 12, lineHeight: '18px',
                              cursor: 'pointer', padding: 0,
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      {extraFiles.length + 1 < MAX_ANGLES && (
                        <button
                          type="button"
                          onClick={() => addAngleInputRef.current?.click()}
                          style={{
                            width: 54, height: 54, borderRadius: 8,
                            border: '1px dashed var(--au7o-blue, #3B82F6)',
                            background: 'var(--au7o-blue-50, #EFF6FF)',
                            color: 'var(--au7o-blue-700, #1D4ED8)',
                            fontSize: 22, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          }}
                          title="Add another angle"
                        >
                          +
                        </button>
                      )}
                    </div>
                    <p style={{ fontSize: 11.5, color: 'var(--slate-500, #64748B)', margin: '8px 0 0', lineHeight: 1.4 }}>
                      {extraFiles.length > 0 ? t.anglesCount(extraFiles.length + 1) : t.addAngleHint}{' '}
                      <span style={{ color: 'var(--au7o-blue-700, #1D4ED8)', fontWeight: 600 }}>{t.proAngles}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <p
                style={{
                  marginTop: 14,
                  padding: '8px 12px',
                  background: 'var(--crit-bg, #FEE2E2)',
                  color: 'var(--crit, #B91C1C)',
                  borderRadius: 8,
                  fontSize: 13,
                }}
              >
                {error}
              </p>
            )}

            {/* Submit */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 18 }}>
              <button
                type="button"
                onClick={submit}
                disabled={!ready || state === 'analyzing'}
                style={{
                  padding: '14px 28px',
                  borderRadius: 12,
                  border: 'none',
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: ready && state !== 'analyzing' ? 'pointer' : 'not-allowed',
                  background: ready ? 'var(--au7o-blue, #3B82F6)' : 'var(--paper-2, #EFEDE6)',
                  color: ready ? '#fff' : 'var(--slate-400, #94A3B8)',
                  boxShadow: ready ? '0 8px 22px rgba(59,130,246,0.32)' : 'none',
                  fontFamily: 'inherit',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  minWidth: 220,
                  justifyContent: 'center',
                }}
              >
                {state === 'analyzing' ? (
                  <>
                    <Spinner /> {t.analyzingBtn}
                  </>
                ) : (
                  <>
                    <Icon name="camera" size={15} /> {t.diagnoseThis}
                  </>
                )}
              </button>
            </div>
            {/* Button is disabled only when there's no photo (YMMT is
                optional now), so the hint just asks for a photo. */}
            {!ready && state !== 'analyzing' && (
              <p style={{ textAlign: 'center', marginTop: 10, fontSize: 12.5, color: 'var(--slate-500, #64748B)' }}>
                {t.needPhoto(isMobile)} {t.vehicleOptionalHint}
              </p>
            )}
            {/* Photo is in but no vehicle picked — nudge (don't block). */}
            {ready && !hasVehicle && state !== 'analyzing' && (
              <p style={{ textAlign: 'center', marginTop: 10, fontSize: 12.5, color: 'var(--slate-500, #64748B)' }}>
                {t.tipAddVehicle(isMobile)}
              </p>
            )}
            {/* Analyzing without a vehicle — the disclaimer Devon asked for. */}
            {state === 'analyzing' && !hasVehicle && (
              <p style={{ textAlign: 'center', marginTop: 10, fontSize: 12.5, color: 'var(--slate-600, #475569)' }}>
                {t.analyzingNoVehicle}
              </p>
            )}

            {/* Visual data flywheel (Phase 0) per-upload opt-in — signed-in
                only, default OFF. Anon visitors never see it (no account to
                exercise deletion against). Phase 0.0 keeps metadata only. */}
            {isSignedIn && (
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  marginTop: 14,
                  maxWidth: 520,
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={keepPhoto}
                  onChange={(e) => setKeepPhoto(e.target.checked)}
                  style={{ marginTop: 2, width: 15, height: 15, flexShrink: 0, accentColor: 'var(--au7o-blue, #3B82F6)', cursor: 'pointer' }}
                />
                <span style={{ fontSize: 12, color: 'var(--slate-600, #475569)', lineHeight: 1.45 }}>
                  {t.flywheelConsent}
                </span>
              </label>
            )}
          </div>
        )}

        {/* Gated — anon used their free credit */}
        {state === 'gated' && gate && (
          <div style={{ marginTop: 8 }}>
            <InlineGateCard gate={gate} />
            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <button
                type="button"
                onClick={reset}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: 12,
                  color: 'var(--slate-500, #64748B)',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontFamily: 'inherit',
                }}
              >
                {t.startOver}
              </button>
            </div>
          </div>
        )}

        {/* Result — VisionResultCard + chat handoff */}
        {state === 'result' && result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <VisionResultCard vision={result} />
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                padding: '14px 18px',
                background: '#fff',
                border: '1px solid var(--paper-line, #E3DFD4)',
                borderRadius: 14,
              }}
            >
              <div style={{ fontSize: 13, color: 'var(--slate-700, #334155)' }}>
                {t.handoffPrompt}
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={handleSaveAndOpenChat}
                  style={{
                    padding: '10px 16px',
                    background: 'var(--au7o-blue, #3B82F6)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  {isSignedIn ? t.saveGarage : t.saveOpenChat}
                </button>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <button
                type="button"
                onClick={reset}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: 12,
                  color: 'var(--slate-500, #64748B)',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontFamily: 'inherit',
                }}
              >
                {t.diagnoseAnother}
              </button>
            </div>
          </div>
        )}
      </main>

      <style jsx global>{`
        .dx-grid {
          display: grid;
          grid-template-columns: 0.85fr 1.15fr;
          gap: 18px;
        }
        @media (max-width: 760px) {
          .dx-grid { grid-template-columns: 1fr; gap: 16px; }
          /* Photo-first on phones: capture zone above the (optional) vehicle picker. */
          .dx-col-photo { order: -1; }
        }
      `}</style>
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 9.5,
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'var(--slate-500, #64748B)',
      }}
    >
      {children}
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
  disabled?: boolean;
}) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{ display: 'none' }}>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '11px 13px',
          fontSize: 13.5,
          fontWeight: value ? 600 : 500,
          background: 'var(--paper-2, #EFEDE6)',
          border: '1px solid var(--paper-line, #E3DFD4)',
          borderRadius: 10,
          color: value ? 'var(--ink, #0B1220)' : 'var(--slate-500, #64748B)',
          fontFamily: 'inherit',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}

function Spinner() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" style={{ animation: 'spin 1s linear infinite' }}>
      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" fill="none" />
      <path
        d="M22 12a10 10 0 0 1-10 10"
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </svg>
  );
}
