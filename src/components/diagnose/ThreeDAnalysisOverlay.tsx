'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { VoiceMechanic } from '@/components/diagnose/VoiceMechanic';
import type { VisionResult } from '@/components/vehicle/VisionResultCard';

const SplatViewer = dynamic(() => import('@/components/lab/SplatViewer'), {
  ssr: false,
  loading: () => <div style={{ width: '100%', height: '100%', background: '#0B1220' }} />,
});

/**
 * Full-screen "View in 3D" overlay for a diagnosis — the premium result screen.
 * Renders the 3D model (SAM 3D splat once verified; sphere placeholder until
 * then) with animated callouts built from the REAL diagnosed parts, a voice
 * layer (talk to the AI about it), and a back button to the camera/result.
 *
 * Pro/founder only — mounted by VisionResultCard behind a tier gate. Splat URL
 * defaults to the sample until the SAM 3D endpoint output is wired in.
 */

const CSS = `
@keyframes t3dScan { 0%{transform:translateY(-100%);opacity:0} 12%{opacity:.9} 100%{transform:translateY(120%);opacity:0} }
@keyframes t3dPop { 0%{opacity:0;transform:translateY(-50%) scale(.7)} 60%{opacity:1;transform:translateY(-50%) scale(1.04)} 100%{opacity:1;transform:translateY(-50%) scale(1)} }
@keyframes t3dPing { 0%{transform:scale(.6);opacity:.7} 80%,100%{transform:scale(2.6);opacity:0} }
@keyframes t3dStem { from{width:0;opacity:0} to{width:20px;opacity:1} }
@keyframes t3dLabel { from{opacity:0;transform:translateX(-6px)} to{opacity:1;transform:translateX(0)} }
.t3d-co{position:absolute;transform:translateY(-50%);display:flex;align-items:center;animation:t3dPop .45s cubic-bezier(.2,.8,.2,1) both;pointer-events:auto}
.t3d-dot{position:relative;width:13px;height:13px;border-radius:999px;flex-shrink:0;cursor:pointer}
.t3d-dot::before{content:'';position:absolute;inset:-6px;border-radius:999px;background:currentColor;opacity:.55;animation:t3dPing 1.8s ease-out infinite}
.t3d-dot::after{content:'';position:absolute;inset:0;border-radius:999px;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.55)}
.t3d-stem{height:1.5px;background:linear-gradient(90deg,rgba(255,255,255,.9),rgba(255,255,255,.35));animation:t3dStem .35s ease-out both;animation-delay:.2s}
.t3d-label{animation:t3dLabel .35s ease-out both;animation-delay:.32s;cursor:pointer;display:flex;align-items:center;gap:8px;padding:7px 12px;border-radius:12px;background:rgba(13,18,32,.72);backdrop-filter:blur(10px) saturate(1.3);border:1px solid rgba(255,255,255,.16);box-shadow:0 8px 26px rgba(0,0,0,.4);color:#fff;white-space:nowrap}
.t3d-label b{font-size:12.5px;font-weight:700}
.t3d-scan{position:absolute;left:0;right:0;height:34%;pointer-events:none;background:linear-gradient(180deg,rgba(56,189,248,0),rgba(56,189,248,.18) 50%,rgba(56,189,248,0));animation:t3dScan 1.1s ease-in-out both}
`;

const COND_COLOR: Record<string, string> = { ok: '#22C55E', warn: '#F59E0B', critical: '#EF4444', info: '#38BDF8' };

interface Callout { name: string; color: string; x: number; y: number; url?: string | null }

function buildCallouts(vision: VisionResult): Callout[] {
  // v2: real identified parts (use box centers when present, else distribute)
  const parts = vision.identifiedParts || [];
  if (parts.length) {
    const spread = [{ x: 32, y: 60 }, { x: 60, y: 36 }, { x: 74, y: 68 }, { x: 26, y: 38 }, { x: 50, y: 78 }];
    return parts.slice(0, 5).map((p, i) => ({
      name: p.name,
      color: COND_COLOR[p.condition || 'info'] || COND_COLOR.info,
      x: p.box ? p.box.x + p.box.w / 2 : spread[i % spread.length].x,
      y: p.box ? p.box.y + p.box.h / 2 : spread[i % spread.length].y,
      url: p.vendorLinks?.find((v) => v.priority === 1)?.url || p.vendorLinks?.[0]?.url || null,
    }));
  }
  // v1 fallback: primary + kit names
  const items = [vision.primaryPart, ...(vision.kitItems || [])].filter(Boolean).slice(0, 4);
  const spread = [{ x: 34, y: 58 }, { x: 62, y: 38 }, { x: 72, y: 70 }, { x: 28, y: 40 }];
  return items.map((it, i) => ({ name: it!.name, color: COND_COLOR.info, x: spread[i].x, y: spread[i].y, url: it!.amazonUrl }));
}

export function ThreeDAnalysisOverlay({
  vision,
  splatUrl = '/lab/sample-splat.ply',
  onClose,
}: {
  vision: VisionResult;
  splatUrl?: string;
  onClose: () => void;
}) {
  const callouts = buildCallouts(vision);
  const [sel, setSel] = useState<number | null>(null);
  const [splat, setSplat] = useState(splatUrl);
  const [gen, setGen] = useState<'idle' | 'building' | 'done' | 'error'>('idle');

  // On open, build the REAL splat from the captured photo (SAM 3D -> Blob).
  // No image (e.g. the founder lab) → keep whatever splatUrl was passed.
  useEffect(() => {
    const src = vision.imagePreviewUrl;
    if (!src) return;
    let cancelled = false;
    (async () => {
      try {
        setGen('building');
        const blob = await fetch(src).then((r) => r.blob());
        const b64 = await new Promise<string>((res, rej) => {
          const fr = new FileReader();
          fr.onload = () => res(String(fr.result).split(',')[1] || '');
          fr.onerror = rej;
          fr.readAsDataURL(blob);
        });
        const resp = await fetch('/api/diagnose-3d', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: b64 }),
        });
        const data = await resp.json().catch(() => null);
        if (cancelled) return;
        if (resp.ok && data?.splatUrl) { setSplat(data.splatUrl); setGen('done'); }
        else setGen('error');
      } catch {
        if (!cancelled) setGen('error');
      }
    })();
    return () => { cancelled = true; };
  }, [vision.imagePreviewUrl]);

  const isPlaceholder = splat === '/lab/sample-splat.ply' || splat === '/lab/sam3d-sample.ply';

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 120, background: '#0B1220', display: 'flex', flexDirection: 'column' }}>
      <style>{CSS}</style>

      {/* top bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', color: '#fff' }}>
        <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.18)', color: '#fff', borderRadius: 999, padding: '7px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>← Camera</button>
        <div style={{ fontSize: 14, fontWeight: 700 }}>3D Analysis</div>
        <span style={{ fontSize: 10, fontWeight: 700, background: '#6D28D9', color: '#fff', borderRadius: 999, padding: '2px 8px' }}>PRO</span>
      </div>

      {/* 3D + callouts */}
      <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>
        <SplatViewer splatUrl={splat} />
        <div key="scan" className="t3d-scan" />
        {callouts.map((c, i) => (
          <div key={i} className="t3d-co" style={{ left: `${c.x}%`, top: `${c.y}%`, color: c.color, animationDelay: `${0.15 + i * 0.18}s` }}>
            <span className="t3d-dot" onClick={() => setSel(sel === i ? null : i)} />
            <span className="t3d-stem" />
            <span className="t3d-label" onClick={() => setSel(sel === i ? null : i)}><b>{c.name}</b></span>
          </div>
        ))}

        {gen === 'building' && (
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#fff', background: 'rgba(11,18,32,.78)', border: '1px solid rgba(255,255,255,.16)', borderRadius: 14, padding: '12px 18px', backdropFilter: 'blur(8px)' }}>
              <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.35)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
              <span style={{ fontSize: 13, fontWeight: 600 }}>Building your 3D model… (~30s)</span>
            </div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}
        {gen === 'error' && (
          <div style={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', fontSize: 11, color: '#FCA5A5', background: 'rgba(127,29,29,.5)', border: '1px solid rgba(252,165,165,.4)', borderRadius: 999, padding: '3px 10px', pointerEvents: 'none', textAlign: 'center' }}>
            couldn&apos;t build 3D this time (model warming up) — showing a sample
          </div>
        )}
        {gen !== 'building' && gen !== 'error' && isPlaceholder && (
          <div style={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', fontSize: 11, color: '#FDE68A', background: 'rgba(180,83,9,.4)', border: '1px solid rgba(253,230,138,.4)', borderRadius: 999, padding: '3px 10px', pointerEvents: 'none' }}>
            sample model — snap a part to build a real one
          </div>
        )}

        {/* selected part → buy */}
        {sel !== null && (
          <div style={{ position: 'absolute', left: 12, right: 12, bottom: 12, background: '#fff', borderRadius: 14, padding: 14, boxShadow: '0 10px 34px rgba(0,0,0,.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0B1220' }}>{callouts[sel].name}</div>
              <button onClick={() => setSel(null)} style={{ border: 'none', background: '#F1F5F9', borderRadius: 999, width: 26, height: 26, cursor: 'pointer', color: '#64748B' }}>✕</button>
            </div>
            {callouts[sel].url && (
              <a href={callouts[sel].url!} target="_blank" rel="noopener noreferrer sponsored" style={{ display: 'block', marginTop: 10, textAlign: 'center', background: '#FF9900', color: '#0B1220', fontWeight: 700, fontSize: 13, borderRadius: 9, padding: '9px 0', textDecoration: 'none' }}>Find this part ▸</a>
            )}
          </div>
        )}
      </div>

      {/* voice (founder = full Realtime). getFrame null = voice-only (the
          preview is a blob: URL, not a base64 frame, so we don't send it). */}
      <VoiceMechanic getFrame={() => null} autoStart={false} />
    </div>
  );
}
