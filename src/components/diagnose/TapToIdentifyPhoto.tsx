'use client';

/**
 * TapToIdentifyPhoto — the premier "point at a part" interaction.
 *
 * The user TAPS a spot (or DRAGS a box) on their photo; we crop that
 * region client-side and POST it to /api/vision/identify, which runs the
 * catalog-grounded WHAT/WHICH stages and returns the exact part + buy
 * links. We draw a highlight box + a callout on the tapped region.
 *
 * WHY tap works consistently: the server pins the answer to a discrete
 * catalog part, so tapping anywhere ON a part resolves to the same part.
 * Phase 1 uses a fixed-size crop around the tap (or the drawn box); when
 * a SAM endpoint is deployed the region tightens to the exact object
 * mask, but the client contract here does not change.
 *
 * Self-contained: renders the image with object-fit:contain (no clipping,
 * so display→source mapping is exact) and needs only an image URL + the
 * vehicle context for grounding.
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
   *  fall back to the box highlight. */
  polygon?: Array<{ x: number; y: number }> | null;
  /** Set when the image shows a different vehicle than the garage car. */
  mismatch?: string;
  error?: string;
}

/** A part the user has tapped this session (multi-tap "parts found" list). */
interface FoundPart {
  key: string;
  part: IdentifiedPart;
}

const CROP_SQUARE_PCT = 24; // default single-component crop for a tap
const DRAG_THRESHOLD_PX = 10; // below this = a tap, above = a box
const MAX_CROP_OUT_PX = 640; // cap crop payload dimension

export function TapToIdentifyPhoto({
  imageUrl,
  vehicle,
  className,
  autoIdentifyPoint,
}: {
  imageUrl: string;
  vehicle?: TapVehicle;
  className?: string;
  /** Source-percent point (0-100) to identify automatically once the image
   *  loads — used by the live viewfinder, which already knows where the user
   *  tapped on the frame it just froze. Runs once. */
  autoIdentifyPoint?: SourcePoint;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [sel, setSel] = useState<IdentifyState | null>(null);
  const [dragRect, setDragRect] = useState<BoxPct | null>(null);
  const [found, setFound] = useState<FoundPart[]>([]); // multi-tap parts list
  const [voiceOn, setVoiceOn] = useState(false);
  const drag = useRef<{ x: number; y: number; moved: boolean; id: number } | null>(null);
  const autoRan = useRef(false);
  const voiceOnRef = useRef(false);
  voiceOnRef.current = voiceOn;

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

  // full frame (downscaled) so a live SAM endpoint can segment the exact
  // object on the WHOLE image and return a mask; ignored server-side when SAM
  // is off. Small enough (~≤960px jpeg) to keep the tap round-trip snappy.
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
      setSel({
        box: data.box || box,
        loading: false,
        part,
        polygon: Array.isArray(data.polygon) && data.polygon.length >= 3 ? data.polygon : null,
        relatedIssue: data.relatedIssue,
        mismatch: data.vehicleMismatch
          ? (data.vehicleMismatchNote || 'This looks like a different vehicle than your garage car.')
          : undefined,
      });
      // multi-tap "parts found" list — dedupe by lowercased name.
      if (part?.name && part.category !== 'other') {
        const key = part.name.toLowerCase().trim();
        setFound((prev) => (prev.some((f) => f.key === key) ? prev : [...prev, { key, part }]));
      }
      // voice narration
      if (voiceOnRef.current && part?.name) {
        speak(`${part.name}.${part.finding ? ' ' + part.finding + '.' : ''}`);
      }
    } catch {
      setSel({ box, loading: false, error: 'Network hiccup — try tapping again.' });
    }
  }, [cropToDataUrl, fullFrameDataUrl, vehicle]);

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

  // ── pointer handlers (tap OR drag-box)
  const onDown = useCallback((e: React.PointerEvent) => {
    // Ignore secondary touches — a second finger (pinch/zoom) must NOT be
    // read as a box-drag. Only the first/primary pointer drives selection.
    if (!e.isPrimary || drag.current) return;
    const p = toSourcePct(e.clientX, e.clientY);
    if (!p) return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, moved: false, id: e.pointerId };
    setDragRect(null);
  }, [toSourcePct]);

  const onMove = useCallback((e: React.PointerEvent) => {
    if (!drag.current || drag.current.id !== e.pointerId) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    if (Math.abs(dx) < DRAG_THRESHOLD_PX && Math.abs(dy) < DRAG_THRESHOLD_PX) return;
    drag.current.moved = true;
    const a = toSourcePct(drag.current.x, drag.current.y);
    const b = toSourcePct(e.clientX, e.clientY);
    if (!a || !b) return;
    setDragRect({
      x: Math.min(a.x, b.x),
      y: Math.min(a.y, b.y),
      w: Math.abs(b.x - a.x),
      h: Math.abs(b.y - a.y),
    });
  }, [toSourcePct]);

  const onUp = useCallback((e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (d.moved && dragRect && dragRect.w > 4 && dragRect.h > 4) {
      // padded box selection
      const pad = 4;
      const box: BoxPct = {
        x: Math.max(0, dragRect.x - pad),
        y: Math.max(0, dragRect.y - pad),
        w: Math.min(100, dragRect.w + pad * 2),
        h: Math.min(100, dragRect.h + pad * 2),
      };
      setDragRect(null);
      runIdentify(box, { kind: 'box', x: box.x, y: box.y, w: box.w, h: box.h });
      return;
    }
    // tap → fixed square around the point
    const p = toSourcePct(e.clientX, e.clientY);
    setDragRect(null);
    if (!p) return;
    identifyPoint(p);
  }, [dragRect, runIdentify, toSourcePct, identifyPoint]);

  // ── highlight overlay geometry: source-percent box → element px
  const overlayStyle = useCallback((box: BoxPct): React.CSSProperties | null => {
    const g = contentGeom();
    if (!g) return null;
    return {
      position: 'absolute',
      left: g.offX + (box.x / 100) * g.cW,
      top: g.offY + (box.y / 100) * g.cH,
      width: (box.w / 100) * g.cW,
      height: (box.h / 100) * g.cH,
    };
  }, [contentGeom]);

  // the rendered image content rectangle (for placing an SVG whose viewBox is
  // 0..100 percent of the SOURCE image — SAM polygon points are in that space)
  const contentRectStyle = useCallback((): React.CSSProperties | null => {
    const g = contentGeom();
    if (!g) return null;
    return { position: 'absolute', left: g.offX, top: g.offY, width: g.cW, height: g.cH, pointerEvents: 'none', zIndex: 5 };
  }, [contentGeom]);

  const activeBox = dragRect || sel?.box || null;
  const cond = sel?.part?.condition || 'info';
  const showPolygon = !dragRect && !sel?.loading && sel?.polygon && sel.polygon.length >= 3;

  return (
    <div className={`t2i-wrap ${className || ''}`} ref={wrapRef}>
      <style>{`
        .t2i-wrap { position:relative; user-select:none; -webkit-user-select:none; -webkit-touch-callout:none; }
        .t2i-stage { position:relative; width:100%; background:#0B0E14; border-radius:14px; overflow:hidden; touch-action:none; user-select:none; -webkit-user-select:none; -webkit-touch-callout:none; aspect-ratio:4/3; }
        .t2i-stage > img { display:block; width:100%; height:100%; object-fit:contain; pointer-events:none; }
        .t2i-hint { position:absolute; top:10px; left:50%; transform:translateX(-50%); z-index:6; padding:6px 12px; border-radius:999px; background:rgba(11,18,32,0.66); backdrop-filter:blur(8px); border:1px solid rgba(255,255,255,0.14); color:#fff; font-size:11px; font-weight:600; letter-spacing:.02em; white-space:nowrap; pointer-events:none; }
        .t2i-box { z-index:5; border:2.5px solid #3B82F6; border-radius:8px; box-shadow:0 0 0 9999px rgba(11,14,20,0.34); pointer-events:none; }
        .t2i-box.warn { border-color:#F59E0B; } .t2i-box.critical { border-color:#EF4444; } .t2i-box.ok { border-color:#10B981; }
        .t2i-spin { position:absolute; z-index:7; width:22px; height:22px; border-radius:50%; border:2.5px solid rgba(255,255,255,0.35); border-top-color:#fff; animation:t2iSpin .8s linear infinite; }
        @keyframes t2iSpin { to { transform:rotate(360deg) } }
        .t2i-card { margin-top:8px; background:#fff; border:1px solid #E3DFD4; border-radius:12px; padding:12px; box-shadow:0 8px 24px rgba(11,18,32,0.10); }
        .t2i-name { font-size:14px; font-weight:800; color:#0B1220; line-height:1.25; }
        .t2i-find { font-size:12px; font-weight:600; margin-top:3px; }
        .t2i-pn { font-size:11px; font-family:'SF Mono',Menlo,monospace; color:#64748B; margin-top:4px; }
        .t2i-chips { display:flex; flex-wrap:wrap; gap:6px; margin-top:10px; }
        .t2i-chip { display:inline-flex; align-items:center; gap:6px; padding:8px 12px; border-radius:999px; font-size:12px; font-weight:700; text-decoration:none; border:1px solid #E3DFD4; color:#0B1220; background:#fff; }
        .t2i-chip.primary { background:#0B1220; color:#fff; border-color:#0B1220; }
        .t2i-conf { font-size:10px; font-weight:700; color:#94A3B8; margin-top:8px; letter-spacing:.03em; }
        .t2i-issue { display:inline-block; margin-top:8px; font-size:12px; font-weight:700; color:#B91C1C; text-decoration:none; }
        .t2i-err { margin-top:8px; font-size:12px; font-weight:600; color:#B45309; background:#FEF3C7; border:1px solid #FDE68A; border-radius:10px; padding:8px 10px; }
        @keyframes t2iMask { from { stroke-dashoffset:0 } to { stroke-dashoffset:-12 } }
        .t2i-voice { position:absolute; top:10px; right:10px; z-index:7; width:34px; height:34px; border-radius:50%; border:1px solid rgba(255,255,255,0.2); background:rgba(11,18,32,0.6); backdrop-filter:blur(8px); color:#fff; font-size:15px; cursor:pointer; display:flex; align-items:center; justify-content:center; }
        .t2i-voice.on { background:#2563EB; border-color:#2563EB; }
        .t2i-tray { margin-top:10px; background:#fff; border:1px solid #E3DFD4; border-radius:12px; overflow:hidden; }
        .t2i-tray-h { display:flex; align-items:center; justify-content:space-between; padding:10px 12px; font-size:12px; font-weight:800; color:#0B1220; border-bottom:1px solid #F1EEE6; }
        .t2i-tray-row { display:flex; align-items:center; justify-content:space-between; gap:8px; padding:9px 12px; border-bottom:1px solid #F5F3EC; }
        .t2i-tray-row:last-child { border-bottom:none; }
        .t2i-tray-name { font-size:12.5px; font-weight:700; color:#0B1220; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .t2i-tray-buy { flex-shrink:0; font-size:11.5px; font-weight:800; text-decoration:none; color:#fff; background:#0B1220; padding:6px 11px; border-radius:999px; }
        .t2i-tray-clear { font-size:11px; font-weight:700; color:#94A3B8; background:none; border:none; cursor:pointer; }
      `}</style>

      <div
        className="t2i-stage"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={() => { drag.current = null; setDragRect(null); }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img ref={imgRef} src={imageUrl} alt="Tap a part to identify it" crossOrigin="anonymous" onLoad={onImgLoad} />
        <div className="t2i-hint">Tap a part — or drag a box — to identify &amp; shop it</div>

        <button
          type="button"
          className={`t2i-voice ${voiceOn ? 'on' : ''}`}
          onClick={() => setVoiceOn((v) => { const n = !v; if (!n) cancelSpeak(); return n; })}
          aria-label={voiceOn ? 'Voice on' : 'Voice off'}
          title="Read the part out loud"
        >{voiceOn ? '🔊' : '🔈'}</button>

        {/* SAM segmentation mask (when a SAM endpoint is live) — else the box */}
        {showPolygon && contentRectStyle() && (
          <svg style={contentRectStyle()!} viewBox="0 0 100 100" preserveAspectRatio="none">
            <polygon
              points={sel!.polygon!.map((p) => `${p.x},${p.y}`).join(' ')}
              fill={CONDITION_COLOR[cond]}
              fillOpacity={0.16}
              stroke={CONDITION_COLOR[cond]}
              strokeWidth={2.5}
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              style={{ strokeDasharray: '5 3', animation: 't2iMask 1s linear infinite' }}
            />
          </svg>
        )}

        {activeBox && !showPolygon && overlayStyle(activeBox) && (
          <div className={`t2i-box ${cond}`} style={overlayStyle(activeBox)!} />
        )}
        {sel?.loading && overlayStyle(sel.box) && (
          <div
            className="t2i-spin"
            style={{
              left: (overlayStyle(sel.box)!.left as number) + (overlayStyle(sel.box)!.width as number) / 2 - 11,
              top: (overlayStyle(sel.box)!.top as number) + (overlayStyle(sel.box)!.height as number) / 2 - 11,
            }}
          />
        )}
      </div>

      {sel?.error && <div className="t2i-err">{sel.error}</div>}

      {sel?.part && !sel.loading && (
        <div className="t2i-card">
          {sel.mismatch && (
            <div style={{ fontSize: 11.5, fontWeight: 700, color: '#B45309', background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 10, padding: '7px 10px', marginBottom: 8 }}>
              ⚠ {sel.mismatch}
            </div>
          )}
          <div className="t2i-name">{sel.part.name}{sel.part.position ? ` (${sel.part.position})` : ''}</div>
          {sel.part.finding && (
            <div className="t2i-find" style={{ color: CONDITION_COLOR[cond] }}>{sel.part.finding}</div>
          )}
          {sel.part.oemPartNumbers?.[0] && <div className="t2i-pn">OEM {sel.part.oemPartNumbers[0]}</div>}

          {sel.part.vendorLinks?.length ? (
            <div className="t2i-chips">
              {sel.part.vendorLinks.slice(0, 4).map((v, i) => (
                <a
                  key={v.vendor + i}
                  className={`t2i-chip ${i === 0 ? 'primary' : ''}`}
                  href={v.url}
                  target="_blank"
                  rel="noopener noreferrer nofollow sponsored"
                  onClick={() => track('identify_buy_click', { vendor: v.vendor, part: sel.part?.category })}
                >
                  🛒 {v.displayName}
                </a>
              ))}
            </div>
          ) : null}

          {sel.relatedIssue && (
            <a className="t2i-issue" href={`#${sel.relatedIssue.id}`}>
              ⚠ Known issue: {sel.relatedIssue.title} →
            </a>
          )}

          <div className="t2i-conf">
            {sel.part.confidence >= 0.75 ? 'HIGH CONFIDENCE' : sel.part.confidence >= 0.45 ? 'LIKELY' : 'BEST GUESS — tap again for a tighter read'}
          </div>
        </div>
      )}

      {/* multi-tap running list — every part you tapped, with a buy button */}
      {found.length > 0 && (
        <div className="t2i-tray">
          <div className="t2i-tray-h">
            <span>🛒 Parts found ({found.length})</span>
            <button type="button" className="t2i-tray-clear" onClick={() => setFound([])}>Clear</button>
          </div>
          {found.map((f) => {
            const buy = f.part.vendorLinks?.[0];
            return (
              <div className="t2i-tray-row" key={f.key}>
                <span className="t2i-tray-name">{f.part.name}</span>
                {buy && (
                  <a className="t2i-tray-buy" href={buy.url} target="_blank" rel="noopener noreferrer nofollow sponsored"
                    onClick={() => track('identify_tray_buy', { vendor: buy.vendor })}>Buy</a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
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

function cancelSpeak() {
  try { window.speechSynthesis?.cancel(); } catch { /* */ }
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
