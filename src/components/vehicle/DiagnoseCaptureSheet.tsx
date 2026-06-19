'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { assessImageQuality, type ImageQuality } from '@/lib/image-quality';

const BLUE = 'var(--au7o-blue, #3B82F6)';

type Mode = 'photo' | 'video';

// Part-aware capture coaching. Picking "what are you showing me?" swaps in shot
// guidance for that part — and for the parts where a real measurement is
// possible, the scale-reference nudge (the cheap Depth Phase 1 unlock: a coin or
// card in frame lets the model give a real size/tread reading).
const SUBJECTS: Array<{ key: string; label: string; emoji: string; tips: string[]; scaleHint?: string }> = [
  { key: 'tire', label: 'Tire', emoji: '🛞', tips: ['Shoot straight into the tread', 'Fill the frame with the tread blocks', 'Even light, no glare'], scaleHint: 'For a real tread-depth reading, stand a quarter upside-down in the deepest groove and shoot straight in.' },
  { key: 'brakes', label: 'Brakes', emoji: '🛑', tips: ['Shoot the rotor face + pad edge through the spokes', 'Get close — fill the frame', 'A second angle helps'], scaleHint: 'Lay a coin flat next to the pad — it lets me gauge how much friction material is left.' },
  { key: 'leak', label: 'Leak', emoji: '💧', tips: ['Wide shot of WHERE it’s dripping from', 'Then a close-up of the wet spot + fluid color', 'Wipe it and recheck to see if it’s active'] },
  { key: 'fluid', label: 'Fluid bottle', emoji: '🧴', tips: ['Fill the frame with the label', 'Capture the brand + the spec/standard text', 'Ask “is this the right one?” below'] },
  { key: 'dent', label: 'Dent / body', emoji: '🚗', tips: ['One straight-on shot + one raking-light angle', 'Fill the frame with the damage'], scaleHint: 'Hold a credit card flat next to it for a real size estimate.' },
  { key: 'light', label: 'Dash light', emoji: '⚠️', tips: ['Photograph the lit dash cluster', 'Engine running so the light stays on', 'Hold steady — no motion blur'] },
  { key: 'engine', label: 'Engine bay', emoji: '🔧', tips: ['Wide shot first, then the specific area', 'Point at the part you’re worried about', 'Engine off + cool for close-ups'] },
];

/**
 * Designed capture sheet for the vehicle hub.
 *
 * The hub's composer photo/video buttons used to open a bare OS file picker
 * (Devon: "it's just photo or video in the input"). This brings the /diagnose
 * design to the hub: a frame-guide target, the "point at the problem" framing,
 * a review-before-send step with shot tips, then a clear "Diagnose this" CTA.
 *
 * Capture-time UX ONLY — no vision logic here. On submit it hands the File to
 * the hub's existing onPhotoUpload / onVideoUpload, which run /api/vision and
 * render the VisionResultCard in the thread (image downscale, quota, gating
 * all already live in those handlers).
 */
export function DiagnoseCaptureSheet({
  mode,
  vehicleLabel,
  onClose,
  onSubmit,
}: {
  mode: Mode;
  vehicleLabel?: string;
  onClose: () => void;
  onSubmit: (file: File, caption?: string) => void;
}) {
  const isPhoto = mode === 'photo';
  const cameraRef = useRef<HTMLInputElement>(null);
  const libraryRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  // Optional question/note — the model uses this as the literal user turn
  // ("is this the right coolant?"). Without it the hub sent a generic "what is
  // this" with zero intent, which is what made the coolant photo fall flat.
  const [note, setNote] = useState('');
  // "What are you showing me?" — drives part-specific shot coaching + the
  // scale-reference nudge. Optional; null = generic tips.
  const [subject, setSubject] = useState<string | null>(null);
  // Duration (s) of a chosen video clip, read from metadata — shown in review
  // so the user knows the length + that we analyze only the first 15s.
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  // Remaining free analyses this month (metered tiers only), for the header chip.
  const [quota, setQuota] = useState<{ remaining: number; metered: boolean } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [quality, setQuality] = useState<ImageQuality | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  // Optional crop box (display px, relative to the rendered image's top-left).
  const [crop, setCrop] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const dragRef = useRef<{ sx: number; sy: number } | null>(null);

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);
  // One-shot read-only quota peek so we can show "N free left this month".
  useEffect(() => {
    let alive = true;
    fetch('/api/vision', { method: 'GET' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (alive && d && typeof d.remaining === 'number') setQuota({ remaining: d.remaining, metered: !!d.metered }); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const choose = (f?: File | null) => {
    if (!f) return;
    setFile(f);
    setPreviewUrl(isPhoto ? URL.createObjectURL(f) : null);
    setQuality(null);
    setCrop(null);
    setVideoDuration(null);
    // Photos: flag too-dark/blurry/small before the user diagnoses. (Video
    // quality is handled by best-frame selection at extraction time.)
    if (isPhoto) {
      assessImageQuality(f).then(setQuality).catch(() => {});
    } else {
      // Read the clip's duration off its metadata for the review-state label.
      const u = URL.createObjectURL(f);
      const v = document.createElement('video');
      v.preload = 'metadata';
      v.onloadedmetadata = () => { setVideoDuration(Number.isFinite(v.duration) ? v.duration : null); URL.revokeObjectURL(u); };
      v.onerror = () => URL.revokeObjectURL(u);
      v.src = u;
    }
  };

  const diagnose = async () => {
    if (!file) return;
    let out = file;
    const img = imgRef.current;
    // If the user drew a crop box, send the cropped region — stripping the
    // busy background measurably cuts the model's false calls and gives a
    // cleaner component image (also a better consented-flywheel sample).
    if (isPhoto && img && crop && crop.w > 12 && crop.h > 12) {
      const cropped = await cropToFile(img, crop, file.name).catch(() => null);
      if (cropped) out = cropped;
    }
    // Fold the picked subject into the caption so the model gets the user's
    // intent ("[Showing: Tire]") on top of any typed question.
    const sd = subject ? SUBJECTS.find((s) => s.key === subject) : null;
    const caption = [sd ? `[Showing: ${sd.label}]` : '', note.trim()].filter(Boolean).join(' ');
    onSubmit(out, caption || undefined);
    onClose();
  };

  // ── Drag-to-crop (pointer events = mouse + touch) ──
  const onCropDown = (e: React.PointerEvent<HTMLImageElement>) => {
    const img = imgRef.current;
    if (!img) return;
    e.preventDefault();
    try { img.setPointerCapture(e.pointerId); } catch { /* */ }
    const r = img.getBoundingClientRect();
    dragRef.current = { sx: e.clientX - r.left, sy: e.clientY - r.top };
    setCrop({ x: dragRef.current.sx, y: dragRef.current.sy, w: 0, h: 0 });
  };
  const onCropMove = (e: React.PointerEvent<HTMLImageElement>) => {
    const img = imgRef.current;
    if (!dragRef.current || !img) return;
    const r = img.getBoundingClientRect();
    const cx = Math.max(0, Math.min(r.width, e.clientX - r.left));
    const cy = Math.max(0, Math.min(r.height, e.clientY - r.top));
    const { sx, sy } = dragRef.current;
    setCrop({ x: Math.min(sx, cx), y: Math.min(sy, cy), w: Math.abs(cx - sx), h: Math.abs(cy - sy) });
  };
  const onCropUp = () => {
    dragRef.current = null;
    // A tap (tiny drag) = no crop; clear it.
    setCrop((c) => (c && (c.w < 12 || c.h < 12) ? null : c));
  };

  const subjectDef = subject ? SUBJECTS.find((s) => s.key === subject) || null : null;
  const tips = !isPhoto
    ? ['Keep it short (5–15s)', 'Pan slowly around the area', 'Let it run if there’s a noise to hear', 'Steady hands — avoid motion blur']
    : subjectDef
      ? subjectDef.tips
      : ['Get close — fill the frame with the part', 'Even lighting, no harsh glare', 'One issue at a time', 'A second angle raises confidence'];

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 80, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(11,14,20,0.55)', backdropFilter: 'blur(2px)' }}
    >
      <style>{`@keyframes diagSheetUp { from { transform: translateY(100%) } to { transform: translateY(0) } }`}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 520, background: 'var(--paper, #F7F6F2)', borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: '12px 16px 22px', boxShadow: '0 -14px 44px rgba(0,0,0,0.4)', maxHeight: '90dvh', overflowY: 'auto', animation: 'diagSheetUp 0.22s ease-out' }}
      >
        <div style={{ width: 36, height: 4, borderRadius: 999, background: 'var(--paper-line, #E3DFD4)', margin: '0 auto 12px' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', margin: 0, color: 'var(--ink, #0B1220)' }}>
              {isPhoto ? 'Diagnose with a photo' : 'Diagnose with a video'}
            </h2>
            <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.06em', padding: '2px 6px', borderRadius: 6, background: '#EDE9FE', color: '#6D28D9' }}>BETA</span>
          </div>
          <button type="button" onClick={onClose} aria-label="Close"
            style={{ width: 30, height: 30, borderRadius: 999, border: '1px solid var(--paper-line, #E3DFD4)', background: '#fff', color: 'var(--slate-500, #64748B)', fontSize: 15, cursor: 'pointer', lineHeight: 1 }}>✕</button>
        </div>
        {vehicleLabel && <div style={{ fontSize: 12.5, color: 'var(--slate-500, #64748B)', marginTop: 2 }}>{vehicleLabel}</div>}
        {quota?.metered && (
          <a href="/subscribe" style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 11px', borderRadius: 999, textDecoration: 'none', background: quota.remaining <= 2 ? '#FFF7ED' : '#EFF6FF', border: `1px solid ${quota.remaining <= 2 ? '#FED7AA' : '#BFDBFE'}`, fontSize: 11.5, fontWeight: 600, color: quota.remaining <= 2 ? '#9A3412' : '#1E3A8A' }}>
            <span aria-hidden>{quota.remaining <= 2 ? '⚡' : '🔋'}</span>
            {quota.remaining} free {quota.remaining === 1 ? 'analysis' : 'analyses'} left this month
          </a>
        )}

        <input ref={cameraRef} type="file" accept={isPhoto ? 'image/*' : 'video/*'} capture="environment" style={{ display: 'none' }}
          onChange={(e) => { choose(e.target.files?.[0]); if (e.target) e.target.value = ''; }} />
        <input ref={libraryRef} type="file" accept={isPhoto ? 'image/*' : 'video/*'} style={{ display: 'none' }}
          onChange={(e) => { choose(e.target.files?.[0]); if (e.target) e.target.value = ''; }} />

        {!file ? (
          <>
            {isPhoto && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--slate-600, #475569)', marginBottom: 7 }}>
                  What are you showing me? <span style={{ color: 'var(--slate-400, #94A3B8)', fontWeight: 500 }}>(optional — tailors the shot tips)</span>
                </div>
                <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 2 }}>
                  {SUBJECTS.map((s) => {
                    const on = s.key === subject;
                    return (
                      <button key={s.key} type="button" onClick={() => setSubject(on ? null : s.key)}
                        style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 999, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap', background: on ? '#0B1220' : '#fff', color: on ? '#fff' : 'var(--slate-700, #334155)', border: `1px solid ${on ? '#0B1220' : 'var(--paper-line, #E3DFD4)'}` }}>
                        <span aria-hidden>{s.emoji}</span>{s.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            <button type="button" onClick={() => cameraRef.current?.click()}
              style={{ position: 'relative', width: '100%', aspectRatio: '4 / 3', borderRadius: 16, border: 'none', background: 'var(--paper-2, #EFEDE6)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 14 }}>
              {(['tl', 'tr', 'bl', 'br'] as const).map((p) => <Corner key={p} pos={p} />)}
              <span style={{ width: 54, height: 54, borderRadius: '50%', background: BLUE, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 18px rgba(59,130,246,0.4)' }}>
                <CamIcon kind={mode} />
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12.5, fontWeight: 600, color: 'var(--slate-700, #334155)' }}>
                <Image src="/og-image.png" alt="" width={15} height={15} style={{ borderRadius: 4 }} />
                Point at the problem area
              </span>
            </button>

            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              <button type="button" onClick={() => cameraRef.current?.click()}
                style={{ flex: 1, padding: '13px', borderRadius: 12, border: 'none', background: BLUE, color: '#fff', fontSize: 14.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                {isPhoto ? 'Take photo' : 'Record video'}
              </button>
              <button type="button" onClick={() => libraryRef.current?.click()}
                style={{ flex: 1, padding: '13px', borderRadius: 12, border: '1px solid var(--paper-line, #E3DFD4)', background: '#fff', color: 'var(--ink, #0B1220)', fontSize: 14.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                Upload
              </button>
            </div>
            <TipList tips={tips} />
          </>
        ) : (
          <>
            {isPhoto && previewUrl ? (
              <div style={{ marginTop: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <div style={{ position: 'relative', touchAction: 'none', userSelect: 'none', lineHeight: 0 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      ref={imgRef}
                      src={previewUrl}
                      alt="preview"
                      draggable={false}
                      onPointerDown={onCropDown}
                      onPointerMove={onCropMove}
                      onPointerUp={onCropUp}
                      style={{ display: 'block', maxWidth: '100%', maxHeight: 320, width: 'auto', height: 'auto', borderRadius: 12, background: '#000', cursor: 'crosshair' }}
                    />
                    {crop && crop.w > 4 && crop.h > 4 && (
                      <div style={{ position: 'absolute', left: crop.x, top: crop.y, width: crop.w, height: crop.h, border: `2px solid ${BLUE}`, boxShadow: '0 0 0 9999px rgba(0,0,0,0.34)', borderRadius: 4, pointerEvents: 'none' }} />
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 7 }}>
                  <span style={{ fontSize: 11.5, color: 'var(--slate-500, #64748B)' }}>
                    {crop && crop.w > 12 ? 'Cropped to your selection' : 'Drag across the part to crop (optional)'}
                  </span>
                  {crop && crop.w > 12 && (
                    <button type="button" onClick={() => setCrop(null)} style={{ fontSize: 12, fontWeight: 600, color: BLUE, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Clear</button>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ marginTop: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, background: '#fff', border: '1px solid var(--paper-line, #E3DFD4)' }}>
                  <span style={{ fontSize: 22 }} aria-hidden>🎥</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink, #0B1220)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--slate-500, #64748B)' }}>
                      {(file.size / 1048576).toFixed(1)} MB{videoDuration ? ` · ${fmtDuration(videoDuration)}` : ''} · ready to diagnose
                    </div>
                  </div>
                </div>
                {videoDuration != null && videoDuration > 15.5 && (
                  <div style={{ marginTop: 10, padding: '10px 12px', borderRadius: 12, background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1E3A8A', fontSize: 12.5, lineHeight: 1.45, display: 'flex', gap: 8 }}>
                    <span aria-hidden>⏱️</span><span>Your clip is {fmtDuration(videoDuration)} — I analyze the first <strong>0:15</strong>. Keep clips short (5–15s) and aimed at the problem for the best read.</span>
                  </div>
                )}
              </div>
            )}
            {quality?.message && (
              <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 12, background: '#FEF3C7', border: '1px solid #F59E0B', color: '#92400E', fontSize: 12.5, lineHeight: 1.45, display: 'flex', gap: 8 }}>
                <span aria-hidden>⚠</span><span>{quality.message}</span>
              </div>
            )}
            {/* Scale-reference nudge — the cheap "real measurement" unlock. Only
                shows for parts where a coin/card gives the model a true ruler. */}
            {isPhoto && subjectDef?.scaleHint && (
              <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 12, background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1E3A8A', fontSize: 12.5, lineHeight: 1.45, display: 'flex', gap: 8 }}>
                <span aria-hidden>📐</span><span>{subjectDef.scaleHint}</span>
              </div>
            )}
            {/* Optional question — the API uses it as the literal user turn, so
                "is this the right coolant?" actually reaches the model. */}
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 300))}
              rows={2}
              placeholder={isPhoto ? 'Optional — ask a question (e.g. “is this the right coolant?”)' : 'Optional — what should I listen or look for?'}
              style={{ width: '100%', marginTop: 12, padding: '10px 12px', borderRadius: 12, border: '1px solid var(--paper-line, #E3DFD4)', background: '#fff', color: 'var(--ink, #0B1220)', fontSize: 13.5, fontFamily: 'inherit', lineHeight: 1.45, resize: 'none', outline: 'none', boxSizing: 'border-box' }}
            />
            <TipList tips={tips} />
            {/* Sticky action bar so the CTA never scrolls off a short phone once
                preview + caption + tips stack up. On a low-quality photo, emphasis
                flips to Retake (Diagnose stays available as "Diagnose anyway"). */}
            {(() => {
              const badQuality = !!(isPhoto && quality && quality.level !== 'ok');
              const retakeBtn = (
                <button type="button" key="retake"
                  onClick={() => { setFile(null); setQuality(null); setCrop(null); if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); } }}
                  style={badQuality
                    ? { flex: 1, padding: '13px', borderRadius: 12, border: 'none', background: BLUE, color: '#fff', fontSize: 14.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }
                    : { padding: '13px 16px', borderRadius: 12, border: '1px solid var(--paper-line, #E3DFD4)', background: '#fff', color: 'var(--ink, #0B1220)', fontSize: 14.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Retake
                </button>
              );
              const goBtn = (
                <button type="button" key="go" onClick={diagnose}
                  style={badQuality
                    ? { padding: '13px 16px', borderRadius: 12, border: '1px solid var(--paper-line, #E3DFD4)', background: '#fff', color: 'var(--ink, #0B1220)', fontSize: 14.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }
                    : { flex: 1, padding: '13px', borderRadius: 12, border: 'none', background: BLUE, color: '#fff', fontSize: 14.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {badQuality ? 'Diagnose anyway' : 'Diagnose this →'}
                </button>
              );
              return (
                <div style={{ position: 'sticky', bottom: 0, display: 'flex', gap: 10, marginTop: 14, paddingTop: 12, paddingBottom: 2, marginLeft: -16, marginRight: -16, paddingLeft: 16, paddingRight: 16, background: 'var(--paper, #F7F6F2)', borderTop: '1px solid var(--paper-line, #E3DFD4)' }}>
                  {badQuality ? <>{goBtn}{retakeBtn}</> : <>{retakeBtn}{goBtn}</>}
                </div>
              );
            })()}
          </>
        )}
      </div>
    </div>
  );
}

/** Crop an image element to the user's selection (display px → natural px). */
async function cropToFile(
  img: HTMLImageElement,
  sel: { x: number; y: number; w: number; h: number },
  name: string,
): Promise<File | null> {
  const r = img.getBoundingClientRect();
  if (!r.width || !r.height) return null;
  const scaleX = img.naturalWidth / r.width;
  const scaleY = img.naturalHeight / r.height;
  const sx = Math.max(0, Math.round(sel.x * scaleX));
  const sy = Math.max(0, Math.round(sel.y * scaleY));
  const sw = Math.min(img.naturalWidth - sx, Math.round(sel.w * scaleX));
  const sh = Math.min(img.naturalHeight - sy, Math.round(sel.h * scaleY));
  if (sw < 16 || sh < 16) return null;
  const canvas = document.createElement('canvas');
  canvas.width = sw;
  canvas.height = sh;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
  if (!blob) return null;
  const base = name.replace(/\.[^.]+$/, '');
  return new File([blob], `${base}_crop.jpg`, { type: 'image/jpeg', lastModified: Date.now() });
}

function fmtDuration(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
}

function TipList({ tips }: { tips: string[] }) {
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: '14px 0 0', display: 'flex', flexDirection: 'column', gap: 7 }}>
      {tips.map((t) => (
        <li key={t} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12.5, color: 'var(--slate-600, #475569)', lineHeight: 1.4 }}>
          <span aria-hidden style={{ color: BLUE, fontWeight: 700 }}>·</span>{t}
        </li>
      ))}
    </ul>
  );
}

function Corner({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const m = 12;
  const base: React.CSSProperties = { position: 'absolute', width: 22, height: 22, borderColor: 'var(--slate-400, #94A3B8)', borderStyle: 'solid', borderWidth: 0 };
  const map: Record<typeof pos, React.CSSProperties> = {
    tl: { top: m, left: m, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 8 },
    tr: { top: m, right: m, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 8 },
    bl: { bottom: m, left: m, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 8 },
    br: { bottom: m, right: m, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 8 },
  };
  return <span style={{ ...base, ...map[pos] }} />;
}

function CamIcon({ kind }: { kind: Mode }) {
  return kind === 'photo' ? (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 7h3l2-2h8l2 2h3v12H3V7Z" stroke="#fff" strokeWidth="2" strokeLinejoin="round" /><circle cx="12" cy="13" r="3.5" stroke="#fff" strokeWidth="2" /></svg>
  ) : (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="6" width="13" height="12" rx="2" stroke="#fff" strokeWidth="2" /><path d="m16 10 5-3v10l-5-3" stroke="#fff" strokeWidth="2" strokeLinejoin="round" /></svg>
  );
}
