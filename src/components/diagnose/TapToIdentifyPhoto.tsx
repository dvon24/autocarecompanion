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
  error?: string;
}

const CROP_SQUARE_PCT = 24; // default single-component crop for a tap
const DRAG_THRESHOLD_PX = 10; // below this = a tap, above = a box
const MAX_CROP_OUT_PX = 640; // cap crop payload dimension

export function TapToIdentifyPhoto({
  imageUrl,
  vehicle,
  className,
}: {
  imageUrl: string;
  vehicle?: TapVehicle;
  className?: string;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [sel, setSel] = useState<IdentifyState | null>(null);
  const [dragRect, setDragRect] = useState<BoxPct | null>(null);
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null);

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
      setSel({ box: data.box || box, loading: false, part: data.part, relatedIssue: data.relatedIssue });
    } catch {
      setSel({ box, loading: false, error: 'Network hiccup — try tapping again.' });
    }
  }, [cropToDataUrl, vehicle]);

  // ── pointer handlers (tap OR drag-box)
  const onDown = useCallback((e: React.PointerEvent) => {
    const p = toSourcePct(e.clientX, e.clientY);
    if (!p) return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, moved: false };
    setDragRect(null);
  }, [toSourcePct]);

  const onMove = useCallback((e: React.PointerEvent) => {
    if (!drag.current) return;
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
    drag.current = null;
    if (!d) return;
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
    const half = CROP_SQUARE_PCT / 2;
    const box: BoxPct = {
      x: Math.max(0, Math.min(p.x - half, 100 - CROP_SQUARE_PCT)),
      y: Math.max(0, Math.min(p.y - half, 100 - CROP_SQUARE_PCT)),
      w: CROP_SQUARE_PCT,
      h: CROP_SQUARE_PCT,
    };
    runIdentify(box, { kind: 'point', x: p.x, y: p.y });
  }, [dragRect, runIdentify, toSourcePct]);

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

  const activeBox = dragRect || sel?.box || null;
  const cond = sel?.part?.condition || 'info';

  return (
    <div className={`t2i-wrap ${className || ''}`} ref={wrapRef}>
      <style>{`
        .t2i-wrap { position:relative; }
        .t2i-stage { position:relative; width:100%; background:#0B0E14; border-radius:14px; overflow:hidden; touch-action:none; user-select:none; -webkit-user-select:none; aspect-ratio:4/3; }
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
      `}</style>

      <div
        className="t2i-stage"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={() => { drag.current = null; setDragRect(null); }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img ref={imgRef} src={imageUrl} alt="Tap a part to identify it" crossOrigin="anonymous" />
        <div className="t2i-hint">Tap a part — or drag a box — to identify &amp; shop it</div>

        {activeBox && overlayStyle(activeBox) && (
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
    </div>
  );
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
