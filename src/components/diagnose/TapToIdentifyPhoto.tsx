'use client';

/**
 * TapToIdentifyPhoto — the premier "point at a part" interaction, redesigned
 * as an in-context Identify-&-Shop surface (design/Photo Diagnosis).
 *
 * The user TAPS a spot on their photo (or a frozen camera frame); we crop that
 * region + send the full frame to /api/vision/identify, which runs SAM (WHERE)
 * + the catalog-grounded WHAT/WHICH stages and returns the exact part, its SAM
 * mask polygon, OEM part number and buy links. We:
 *   • highlight the part with the SAM MASK OUTLINE only (spotlight dim + dashed
 *     contour) — never a rectangle,
 *   • float a shop CALLOUT in-context (name · part number · match% · price ·
 *     Add-to-kit / Buy) — no per-part screen jump,
 *   • accumulate every add into a persistent KIT tray docked at the bottom,
 *     so one photo builds the whole repair's buy selection.
 *
 * Known-issue / diagnostic context is spoken by the AI voice, NOT shown as a
 * second on-screen callout (that stays purely shop-focused). When a parent
 * already owns the voice (the live camera's VoiceMechanic), pass
 * speakResults={false} so we don't narrate over it.
 *
 * `embedded` renders full-bleed over a dark stage (the frozen live-camera
 * frame); the default renders as an in-flow rounded stage for the uploaded
 * photo flow on /diagnose and the hub.
 */

import { useCallback, useRef, useState } from 'react';
import type { IdentifiedPart } from '@/types/vision';

interface SourcePoint { x: number; y: number }

export interface TapVehicle {
  year?: number | string;
  make?: string;
  model?: string;
  trim?: string;
}

interface BoxPct { x: number; y: number; w: number; h: number }

interface IdentifyState {
  box: BoxPct; // source-percent region we sent
  loading: boolean;
  part?: IdentifiedPart;
  relatedIssue?: { id: string; title: string } | null;
  /** SAM mask outline (full-image PERCENT points) when SAM is live; null =
   *  no mask (we then just float the callout, still no rectangle). */
  polygon?: Array<{ x: number; y: number }> | null;
  /** Set when the image shows a different vehicle than the garage car. */
  mismatch?: string;
  error?: string;
}

/** A part in the buy-selection kit (dedup by id or lowercased name). */
interface KitPart {
  key: string;
  part: IdentifiedPart;
  polygon?: Array<{ x: number; y: number }> | null;
}

const CROP_SQUARE_PCT = 24; // default single-component crop for a tap
const MAX_CROP_OUT_PX = 640; // cap crop payload dimension

export function TapToIdentifyPhoto({
  imageUrl,
  vehicle,
  className,
  autoIdentifyPoint,
  embedded = false,
  speakResults = true,
  onClose,
}: {
  imageUrl: string;
  vehicle?: TapVehicle;
  className?: string;
  /** Source-percent point (0-100) to identify automatically once the image
   *  loads — used by the live viewfinder, which already knows where the user
   *  tapped on the frame it just froze. Runs once. */
  autoIdentifyPoint?: SourcePoint;
  /** Full-bleed over a dark stage (frozen live-camera frame). */
  embedded?: boolean;
  /** Narrate the identified part via speechSynthesis. Off when a parent voice
   *  (the live camera's VoiceMechanic) already owns audio — prevents the
   *  "two voices" bug. */
  speakResults?: boolean;
  /** Close / retake — shown as the ✕ in embedded mode. */
  onClose?: () => void;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [sel, setSel] = useState<IdentifyState | null>(null);
  const [kit, setKit] = useState<KitPart[]>([]);
  const [kitOpen, setKitOpen] = useState(false);
  const tapId = useRef<number | null>(null); // active primary pointer id
  const autoRan = useRef(false);

  const partKey = (p: IdentifiedPart) => (p.id || p.name.toLowerCase().trim());
  const inKit = useCallback((p?: IdentifiedPart) => !!p && kit.some((k) => k.key === partKey(p)), [kit]);
  const addToKit = useCallback((p: IdentifiedPart, polygon?: Array<{ x: number; y: number }> | null) => {
    const key = partKey(p);
    setKit((prev) => (prev.some((k) => k.key === key) ? prev : [...prev, { key, part: p, polygon }]));
  }, []);
  const removeFromKit = useCallback((key: string) => setKit((prev) => prev.filter((k) => k.key !== key)), []);

  // ── geometry: map a client point to the source image (object-fit:contain)
  const contentGeom = useCallback(() => {
    const img = imgRef.current;
    if (!img || !img.naturalWidth) return null;
    const rect = img.getBoundingClientRect();
    const scale = Math.min(rect.width / img.naturalWidth, rect.height / img.naturalHeight);
    const cW = img.naturalWidth * scale;
    const cH = img.naturalHeight * scale;
    return {
      rect,
      scale,
      offX: (rect.width - cW) / 2,
      offY: (rect.height - cH) / 2,
      cW,
      cH,
      natW: img.naturalWidth,
      natH: img.naturalHeight,
    };
  }, []);

  // client (clientX/Y) → source-percent point, or null if on the letterbox
  const toSourcePct = useCallback((clientX: number, clientY: number) => {
    const g = contentGeom();
    if (!g) return null;
    const cx = clientX - g.rect.left - g.offX;
    const cy = clientY - g.rect.top - g.offY;
    if (cx < 0 || cy < 0 || cx > g.cW || cy > g.cH) return null;
    return { x: (cx / g.cW) * 100, y: (cy / g.cH) * 100 };
  }, [contentGeom]);

  // crop a source-percent box out of the loaded <img> → jpeg data URL
  const cropToDataUrl = useCallback((box: BoxPct): string | null => {
    const img = imgRef.current;
    if (!img || !img.naturalWidth) return null;
    const sx = (box.x / 100) * img.naturalWidth;
    const sy = (box.y / 100) * img.naturalHeight;
    const sw = (box.w / 100) * img.naturalWidth;
    const sh = (box.h / 100) * img.naturalHeight;
    const scale = Math.min(1, MAX_CROP_OUT_PX / Math.max(sw, sh));
    const outW = Math.max(1, Math.round(sw * scale));
    const outH = Math.max(1, Math.round(sh * scale));
    const canvas = document.createElement('canvas');
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    try {
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);
      return canvas.toDataURL('image/jpeg', 0.85);
    } catch {
      return null; // tainted canvas (cross-origin) — shouldn't happen for object URLs
    }
  }, []);

  // full frame (downscaled) so the SAM endpoint can segment the exact object
  // on the WHOLE image + the model can read badges for make/model.
  const fullFrameDataUrl = useCallback((): string | null => {
    const img = imgRef.current;
    if (!img || !img.naturalWidth) return null;
    const scale = Math.min(1, 960 / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    try {
      ctx.drawImage(img, 0, 0, w, h);
      return canvas.toDataURL('image/jpeg', 0.8);
    } catch {
      return null;
    }
  }, []);

  const runIdentify = useCallback(async (box: BoxPct, prompt: { kind: 'point'; x: number; y: number } | { kind: 'box'; x: number; y: number; w: number; h: number }) => {
    const dataUrl = cropToDataUrl(box);
    if (!dataUrl) {
      setSel({ box, loading: false, error: "Couldn't read that spot — try again." });
      return;
    }
    setSel({ box, loading: true });
    setKitOpen(false);
    try {
      const res = await fetch('/api/vision/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageDataUrl: dataUrl,
          fullImageDataUrl: fullFrameDataUrl() || undefined,
          prompt,
          box,
          vehicle: vehicle
            ? { year: Number(vehicle.year) || undefined, make: vehicle.make, model: vehicle.model, trim: vehicle.trim }
            : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        setSel({ box, loading: false, error: data?.message || "Couldn't identify that part." });
        return;
      }
      const part = data.part as IdentifiedPart;
      const polygon = Array.isArray(data.polygon) && data.polygon.length >= 3 ? data.polygon : null;
      setSel({
        box: data.box || box,
        loading: false,
        part,
        polygon,
        relatedIssue: data.relatedIssue,
        mismatch: data.vehicleMismatch
          ? (data.vehicleMismatchNote || 'This looks like a different vehicle than your garage car.')
          : undefined,
      });
      // voice narration (only when this surface owns the voice)
      if (speakResults && part?.name) {
        speak(`${part.name}.${part.finding ? ' ' + part.finding + '.' : ''}`);
      }
    } catch {
      setSel({ box, loading: false, error: 'Network hiccup — try tapping again.' });
    }
  }, [cropToDataUrl, fullFrameDataUrl, vehicle, speakResults]);

  // identify a source-percent POINT (shared by taps + autoIdentifyPoint)
  const identifyPoint = useCallback((p: SourcePoint) => {
    const half = CROP_SQUARE_PCT / 2;
    const box: BoxPct = {
      x: Math.max(0, Math.min(p.x - half, 100 - CROP_SQUARE_PCT)),
      y: Math.max(0, Math.min(p.y - half, 100 - CROP_SQUARE_PCT)),
      w: CROP_SQUARE_PCT,
      h: CROP_SQUARE_PCT,
    };
    runIdentify(box, { kind: 'point', x: p.x, y: p.y });
  }, [runIdentify]);

  // when the image is ready, fire the pre-supplied point once (live viewfinder)
  const onImgLoad = useCallback(() => {
    if (autoIdentifyPoint && !autoRan.current) {
      autoRan.current = true;
      identifyPoint(autoIdentifyPoint);
    }
  }, [autoIdentifyPoint, identifyPoint]);

  // ── tap handlers (tap-only). Ignore secondary touches so a pinch/zoom
  // never fires an identify.
  const onDown = useCallback((e: React.PointerEvent) => {
    if (!e.isPrimary || tapId.current !== null) return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    tapId.current = e.pointerId;
  }, []);

  const onUp = useCallback((e: React.PointerEvent) => {
    if (tapId.current !== e.pointerId) return;
    tapId.current = null;
    const p = toSourcePct(e.clientX, e.clientY);
    if (p) identifyPoint(p);
  }, [toSourcePct, identifyPoint]);

  // ── overlay geometry helpers (source-percent → element px)
  const overlayCenter = useCallback((box: BoxPct): { left: number; top: number } | null => {
    const g = contentGeom();
    if (!g) return null;
    return {
      left: g.offX + ((box.x + box.w / 2) / 100) * g.cW,
      top: g.offY + ((box.y + box.h / 2) / 100) * g.cH,
    };
  }, [contentGeom]);

  // the rendered image content rectangle (for an SVG whose viewBox is 0..100
  // percent of the SOURCE image — SAM polygon points live in that space)
  const contentRectStyle = useCallback((): React.CSSProperties | null => {
    const g = contentGeom();
    if (!g) return null;
    return { position: 'absolute', left: g.offX, top: g.offY, width: g.cW, height: g.cH, pointerEvents: 'none', zIndex: 5 };
  }, [contentGeom]);

  const cond = sel?.part?.condition || 'info';
  const accent = CONDITION_COLOR[cond];
  const polyPts = sel?.polygon && sel.polygon.length >= 3 ? sel.polygon : null;
  const polyPath = polyPts ? 'M ' + polyPts.map((p) => `${p.x} ${p.y}`).join(' L ') + ' Z' : null;
  const nameAnchor = sel && !sel.loading && sel.part ? overlayCenter(sel.box) : null;
  const loadAnchor = sel?.loading ? overlayCenter(sel.box) : null;
  const kitTotal = kit.reduce((s, k) => s + (k.part.estimatedPriceUsd?.low || 0), 0);

  return (
    <div ref={wrapRef} className={`t2i-wrap ${embedded ? 't2i-embedded' : ''} ${className || ''}`}>
      <style>{`
        .t2i-wrap { position:relative; user-select:none; -webkit-user-select:none; -webkit-touch-callout:none; }
        .t2i-embedded { position:absolute; inset:0; display:flex; flex-direction:column; background:#05070B; }
        .t2i-stage { position:relative; width:100%; background:#05070B; overflow:hidden; touch-action:none; user-select:none; -webkit-user-select:none; -webkit-touch-callout:none; }
        .t2i-wrap:not(.t2i-embedded) .t2i-stage { border-radius:14px; aspect-ratio:4/3; }
        .t2i-embedded .t2i-stage { flex:1; min-height:0; }
        .t2i-stage > img { display:block; width:100%; height:100%; object-fit:contain; pointer-events:none; }
        .t2i-hint { position:absolute; top:10px; left:50%; transform:translateX(-50%); z-index:8; padding:7px 14px; border-radius:999px; background:rgba(8,12,20,0.62); backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,0.14); color:#fff; font-size:12px; font-weight:600; white-space:nowrap; pointer-events:none; display:inline-flex; align-items:center; gap:7px; }
        .t2i-hint .dot { width:6px; height:6px; border-radius:50%; background:#38E1B0; box-shadow:0 0 8px #38E1B0; }
        .t2i-close { position:absolute; top:calc(10px + env(safe-area-inset-top)); right:12px; z-index:9; width:34px; height:34px; border-radius:50%; background:rgba(8,12,20,0.5); backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,0.16); color:#fff; font-size:15px; cursor:pointer; display:grid; place-items:center; }
        .t2i-nametag { position:absolute; transform:translate(-50%,-50%); z-index:20; pointer-events:none; display:inline-flex; align-items:center; gap:6px; padding:5px 10px; border-radius:999px; background:rgba(8,12,20,0.72); backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,0.16); white-space:nowrap; box-shadow:0 6px 20px rgba(0,0,0,0.4); animation:t2iTagIn .3s ease both; }
        .t2i-nametag .nm { font-size:11px; font-weight:600; color:#fff; letter-spacing:-0.01em; }
        .t2i-nametag .cf { font-size:9.5px; font-weight:600; }
        .t2i-load { position:absolute; z-index:7; width:26px; height:26px; margin:-13px 0 0 -13px; border-radius:50%; border:2.5px solid rgba(255,255,255,0.35); border-top-color:#fff; animation:t2iSpin .8s linear infinite; }
        .t2i-load-ring { position:absolute; z-index:6; width:56px; height:56px; margin:-28px 0 0 -28px; border-radius:50%; border:2px solid rgba(56,225,176,0.7); animation:t2iPulse 1.4s ease-out infinite; }
        @keyframes t2iSpin { to { transform:rotate(360deg) } }
        @keyframes t2iPulse { 0%{ transform:scale(.6); opacity:.9 } 100%{ transform:scale(1.15); opacity:0 } }
        @keyframes t2iMask { to { stroke-dashoffset:-16 } }
        @keyframes t2iTagIn { from { opacity:0; transform:translate(-50%,-46%) } to { opacity:1; transform:translate(-50%,-50%) } }
        @keyframes t2iCalloutIn { from { opacity:0; transform:translateY(8px) scale(.97) } to { opacity:1; transform:none } }
        .t2i-callout { position:absolute; left:12px; right:12px; z-index:40; animation:t2iCalloutIn .3s cubic-bezier(.2,.8,.2,1) both; border-radius:18px; overflow:hidden; background:linear-gradient(180deg, rgba(17,22,33,0.9), rgba(11,15,24,0.94)); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px); border:1px solid rgba(255,255,255,0.14); box-shadow:0 22px 55px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08); }
        .t2i-embedded .t2i-callout { top:calc(54px + env(safe-area-inset-top)); }
        .t2i-wrap:not(.t2i-embedded) .t2i-callout { top:12px; }
        .t2i-accentbar { height:3px; }
        .t2i-cbody { padding:13px 14px 14px; }
        .t2i-crow1 { display:flex; align-items:flex-start; gap:9px; }
        .t2i-dot { width:9px; height:9px; border-radius:50%; margin-top:5px; flex-shrink:0; }
        .t2i-nm { font-size:15px; font-weight:700; color:#fff; letter-spacing:-0.02em; line-height:1.15; }
        .t2i-sub { font-size:11.5px; font-weight:500; color:rgba(255,255,255,0.62); margin-top:3px; }
        .t2i-x { width:24px; height:24px; border-radius:50%; border:1px solid rgba(255,255,255,0.16); background:rgba(255,255,255,0.06); color:rgba(255,255,255,0.7); display:grid; place-items:center; flex-shrink:0; padding:0; cursor:pointer; font-size:12px; }
        .t2i-mism { font-size:11px; font-weight:600; color:#FCD34D; background:rgba(245,158,11,0.14); border:1px solid rgba(245,158,11,0.3); border-radius:9px; padding:6px 9px; margin-top:10px; }
        .t2i-meta { display:flex; align-items:center; gap:12px; margin-top:11px; }
        .t2i-lbl { font-size:8.5px; font-weight:700; letter-spacing:0.08em; color:rgba(255,255,255,0.4); }
        .t2i-pn { font-family:'SF Mono',Menlo,monospace; font-size:12.5px; font-weight:600; color:#fff; margin-top:2px; word-break:break-all; }
        .t2i-matchbar { height:4px; border-radius:99px; background:rgba(255,255,255,0.12); margin-top:4px; overflow:hidden; }
        .t2i-issue { display:block; margin-top:10px; font-size:11.5px; font-weight:600; color:#FCA5A5; text-decoration:none; }
        .t2i-cbuy { display:flex; align-items:center; gap:10px; margin-top:13px; padding-top:12px; border-top:1px solid rgba(255,255,255,0.1); }
        .t2i-price { font-family:'SF Mono',Menlo,monospace; font-size:19px; font-weight:700; color:#fff; }
        .t2i-ret { font-size:10px; color:rgba(255,255,255,0.5); margin-top:1px; }
        .t2i-btn { padding:10px 14px; border-radius:12px; font-size:13px; font-weight:600; cursor:pointer; display:inline-flex; align-items:center; gap:6px; font-family:inherit; border:none; }
        .t2i-add { border:1px solid rgba(255,255,255,0.18); background:rgba(255,255,255,0.06); color:#fff; }
        .t2i-add.in { border-color:rgba(56,225,176,0.4); background:rgba(56,225,176,0.14); color:#38E1B0; }
        .t2i-buy { background:#3B82F6; color:#fff; text-decoration:none; }
        .t2i-err { position:absolute; left:12px; right:12px; bottom:96px; z-index:40; font-size:12.5px; font-weight:600; color:#FED7AA; background:rgba(127,29,29,0.9); border:1px solid rgba(245,158,11,0.4); border-radius:12px; padding:10px 12px; text-align:center; }
        /* kit tray */
        .t2i-kit { z-index:60; background:var(--paper,#faf9f5); }
        .t2i-embedded .t2i-kit { position:absolute; left:0; right:0; bottom:0; border-top-left-radius:20px; border-top-right-radius:20px; box-shadow:0 -14px 40px rgba(11,18,32,0.4); }
        .t2i-wrap:not(.t2i-embedded) .t2i-kit { margin-top:10px; border:1px solid #E3DFD4; border-radius:14px; overflow:hidden; }
        .t2i-kit-list { max-height:0; overflow:hidden; transition:max-height .32s cubic-bezier(.2,.8,.2,1); }
        .t2i-kit-list.open { max-height:260px; overflow-y:auto; }
        .t2i-kit-row { display:flex; align-items:center; gap:10px; padding:10px 14px; border-bottom:1px solid #F1EEE6; }
        .t2i-kit-nm { font-size:13px; font-weight:600; color:#0B1220; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .t2i-kit-sku { font-family:'SF Mono',Menlo,monospace; font-size:9.5px; color:#64748B; }
        .t2i-kit-bar { display:flex; align-items:center; gap:12px; padding:12px 14px calc(12px + env(safe-area-inset-bottom)); background:var(--paper,#faf9f5); cursor:pointer; }
        .t2i-kit-icon { position:relative; width:38px; height:38px; border-radius:11px; background:#0B1220; color:#fff; display:grid; place-items:center; flex-shrink:0; font-size:17px; }
        .t2i-kit-badge { position:absolute; top:-6px; right:-6px; min-width:18px; height:18px; padding:0 4px; border-radius:9px; background:#38E1B0; color:#052E22; font-size:10.5px; font-weight:700; display:grid; place-items:center; }
      `}</style>

      {embedded && onClose && (
        <button type="button" className="t2i-close" onClick={onClose} aria-label="Back to camera">✕</button>
      )}

      <div
        className="t2i-stage"
        onPointerDown={onDown}
        onPointerUp={onUp}
        onPointerCancel={() => { tapId.current = null; }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img ref={imgRef} src={imageUrl} alt="Tap a part to identify it" crossOrigin="anonymous" onLoad={onImgLoad} />

        {!sel && (
          <div className="t2i-hint"><span className="dot" />Tap any part to identify &amp; shop it</div>
        )}
        {sel && !sel.loading && !sel.error && (
          <div className="t2i-hint"><span className="dot" />Tap another part to add to your kit</div>
        )}

        {/* SAM mask: spotlight dim + dashed contour — never a rectangle */}
        {polyPath && contentRectStyle() && (
          <svg style={contentRectStyle()!} viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <mask id="t2iSpot">
                <rect x="0" y="0" width="100" height="100" fill="#fff" />
                <path d={polyPath} fill="#000" />
              </mask>
            </defs>
            <rect x="0" y="0" width="100" height="100" fill="rgba(5,7,11,0.45)" mask="url(#t2iSpot)" />
            <path d={polyPath} fill={accent} fillOpacity={0.16} />
            <path
              d={polyPath}
              fill="none"
              stroke={accent}
              strokeWidth={2.4}
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              style={{ strokeDasharray: '5 3', animation: 't2iMask 1s linear infinite', filter: `drop-shadow(0 0 4px ${accent})` }}
            />
            <path d={polyPath} fill="none" stroke="#fff" strokeWidth={0.8} strokeOpacity={0.85} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
          </svg>
        )}

        {/* name tag at the part */}
        {nameAnchor && sel?.part && (
          <div className="t2i-nametag" style={{ left: nameAnchor.left, top: nameAnchor.top }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: accent, boxShadow: `0 0 6px ${accent}` }} />
            <span className="nm">{sel.part.name}</span>
            <span className="cf" style={{ color: accent }}>{Math.round((sel.part.confidence || 0) * 100)}%</span>
          </div>
        )}

        {/* loading: soft pulse at the tap point (no rectangle) */}
        {loadAnchor && (
          <>
            <span className="t2i-load-ring" style={{ left: loadAnchor.left, top: loadAnchor.top }} />
            <span className="t2i-load" style={{ left: loadAnchor.left, top: loadAnchor.top }} />
          </>
        )}

        {/* shop callout — the whole job in-context */}
        {sel?.part && !sel.loading && (
          <div className="t2i-callout">
            <div className="t2i-accentbar" style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
            <div className="t2i-cbody">
              <div className="t2i-crow1">
                <span className="t2i-dot" style={{ background: accent, boxShadow: `0 0 8px ${accent}` }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="t2i-nm">{sel.part.name}{sel.part.position ? ` (${sel.part.position})` : ''}</div>
                  {subLine(sel.part) && <div className="t2i-sub">{subLine(sel.part)}</div>}
                </div>
                <button className="t2i-x" onClick={() => setSel(null)} aria-label="close">✕</button>
              </div>

              {sel.mismatch && <div className="t2i-mism">⚠ {sel.mismatch}</div>}

              <div className="t2i-meta">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="t2i-lbl">PART NUMBER {sel.part.partNumberVerified && <span style={{ color: '#38E1B0', fontWeight: 800 }} title="Verified across live listings">✓ VERIFIED</span>}</div>
                  <div className="t2i-pn">{sel.part.oemPartNumbers?.[0] || sel.part.aftermarketPartNumbers?.[0]?.partNumber || '—'}</div>
                </div>
                <div style={{ width: 84, flexShrink: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span className="t2i-lbl">MATCH</span>
                    <span style={{ fontFamily: "'SF Mono',Menlo,monospace", fontSize: 11, fontWeight: 600, color: accent }}>{Math.round((sel.part.confidence || 0) * 100)}%</span>
                  </div>
                  <div className="t2i-matchbar"><div style={{ width: `${Math.round((sel.part.confidence || 0) * 100)}%`, height: '100%', background: accent, borderRadius: 99 }} /></div>
                </div>
              </div>

              {sel.relatedIssue && (
                <a className="t2i-issue" href={`#${sel.relatedIssue.id}`}>⚠ Known issue: {sel.relatedIssue.title} →</a>
              )}

              <div className="t2i-cbuy">
                <div>
                  {sel.part.ebayListings?.[0]?.price
                    ? <span className="t2i-price">${sel.part.ebayListings[0].price}</span>
                    : sel.part.estimatedPriceUsd
                      ? <span className="t2i-price">${sel.part.estimatedPriceUsd.low}{sel.part.estimatedPriceUsd.high > sel.part.estimatedPriceUsd.low ? '+' : ''}</span>
                      : <span className="t2i-price" style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>See price</span>}
                  {sel.part.ebayListings?.[0]
                    ? <div className="t2i-ret">eBay{sel.part.ebayListings[0].condition ? ` · ${sel.part.ebayListings[0].condition}` : ''}</div>
                    : sel.part.vendorLinks?.[0] && <div className="t2i-ret">{sel.part.vendorLinks[0].displayName}</div>}
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                  <button
                    className={`t2i-btn t2i-add ${inKit(sel.part) ? 'in' : ''}`}
                    disabled={inKit(sel.part)}
                    onClick={() => { if (sel.part) addToKit(sel.part, sel.polygon); }}
                  >
                    {inKit(sel.part) ? '✓ In kit' : '＋ Add to kit'}
                  </button>
                  {(sel.part.ebayListings?.[0] || sel.part.vendorLinks?.[0]) && (
                    <a
                      className="t2i-btn t2i-buy"
                      href={sel.part.ebayListings?.[0]?.url || sel.part.vendorLinks![0].url}
                      target="_blank"
                      rel="noopener noreferrer nofollow sponsored"
                      onClick={() => { if (sel.part) addToKit(sel.part, sel.polygon); track('identify_buy_click', { vendor: sel.part?.ebayListings?.[0] ? 'ebay' : sel.part?.vendorLinks?.[0]?.vendor, part: sel.part?.category }); }}
                    >Buy</a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {sel?.error && <div className="t2i-err">{sel.error}</div>}
      </div>

      {/* KIT tray — the persistent buy selection, docked at the bottom */}
      <div className="t2i-kit">
        <div className={`t2i-kit-list ${kitOpen ? 'open' : ''}`}>
          {kit.map((k) => {
            const buy = k.part.vendorLinks?.[0];
            return (
              <div className="t2i-kit-row" key={k.key}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: CONDITION_COLOR[k.part.condition || 'info'], flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="t2i-kit-nm">{k.part.name}</div>
                  <div className="t2i-kit-sku">{k.part.oemPartNumbers?.[0] || '—'}{buy ? ` · ${buy.displayName}` : ''}</div>
                </div>
                {k.part.estimatedPriceUsd && <span style={{ fontFamily: "'SF Mono',Menlo,monospace", fontSize: 13, fontWeight: 700, color: '#0B1220' }}>${k.part.estimatedPriceUsd.low}</span>}
                {buy && <a className="t2i-btn t2i-buy" style={{ padding: '7px 11px', fontSize: 12 }} href={buy.url} target="_blank" rel="noopener noreferrer nofollow sponsored" onClick={() => track('identify_kit_buy', { vendor: buy.vendor })}>Buy</a>}
                <button onClick={() => removeFromKit(k.key)} aria-label="remove" style={{ width: 24, height: 24, borderRadius: '50%', border: 'none', background: 'transparent', color: '#94A3B8', cursor: 'pointer', fontSize: 13, flexShrink: 0 }}>✕</button>
              </div>
            );
          })}
        </div>
        <div className="t2i-kit-bar" onClick={() => kit.length && setKitOpen((o) => !o)}>
          <span className="t2i-kit-icon">🛒{kit.length > 0 && <span className="t2i-kit-badge">{kit.length}</span>}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0B1220', letterSpacing: '-0.01em' }}>{kit.length ? 'Your kit' : 'Your kit is empty'}</div>
            <div style={{ fontSize: 11, color: '#64748B' }}>{kit.length ? 'Tap to review & order' : 'Tap a part to start building your repair'}</div>
          </div>
          {kitTotal > 0 && <span style={{ fontFamily: "'SF Mono',Menlo,monospace", fontSize: 17, fontWeight: 700, color: '#0B1220' }}>${kitTotal}</span>}
        </div>
      </div>
    </div>
  );
}

/** Short shop sub-line: condition/finding first, then spec, then position. */
function subLine(p: IdentifiedPart): string {
  return (p.finding || p.spec || (p.brand ? `${p.brand}` : '') || '').trim();
}

function speak(text: string) {
  try {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.02;
    u.pitch = 1;
    synth.speak(u);
  } catch { /* speech is best-effort */ }
}

const CONDITION_COLOR: Record<string, string> = {
  ok: '#10B981',
  warn: '#F59E0B',
  critical: '#EF4444',
  info: '#3B82F6',
};

function track(event: string, params: Record<string, unknown>) {
  try {
    (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag?.('event', event, params);
  } catch { /* analytics must never throw */ }
}
