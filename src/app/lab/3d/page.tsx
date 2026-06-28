'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { VoiceMechanic } from '@/components/diagnose/VoiceMechanic';

// Splat viewer is client-only (WebGL + workers) — never SSR it.
const SplatViewer = dynamic(() => import('@/components/lab/SplatViewer'), {
  ssr: false,
  loading: () => <div style={{ width: '100%', height: '100%', background: '#0B1220', borderRadius: 14 }} />,
});

// Placeholder analysis until the real pipeline (vision + depth + SAM 3/3D) feeds
// this. `pos` = callout anchor (%) — in production these anchor to the 3D points
// and track as the model rotates / as the phone pans over the part.
const SAMPLE = {
  source: 'REAL SAM 3D output (238k gaussians, reconstructed from the og-image test) — snap a car part for a real one',
  splatUrl: '/lab/sam3d-sample.ply',
  vehicle: '2019 Chevrolet Camaro ZL1',
  summary:
    'Front-left corner impact. Bumper cover cracked at the fascia seam; headlight housing tab broken; no structural/rail deformation visible.',
  severity: 'medium',
  parts: [
    { name: 'Front bumper cover', confidence: 0.94, status: 'cracked', pos: { x: 30, y: 66 }, pn: '84134333', price: '$310–480' },
    { name: 'Left headlight assembly', confidence: 0.88, status: 'mount tab broken', pos: { x: 58, y: 34 }, pn: '84078625', price: '$520–700' },
    { name: 'Fender (left front)', confidence: 0.71, status: 'minor scuff', pos: { x: 76, y: 72 }, pn: '23390377', price: '$240–390' },
  ],
  geometry: { unit: 'relative', nearest: 0.31, median: 0.55, farthest: 0.92, note: 'depth from DA3 — macro shape only' },
};

const sevColor = (s: string) => (s === 'high' ? '#EF4444' : s === 'medium' ? '#F59E0B' : '#22C55E');

const CALLOUT_CSS = `
@keyframes auScan { 0% { transform: translateY(-100%); opacity: 0 } 12% { opacity: .9 } 100% { transform: translateY(120%); opacity: 0 } }
@keyframes auPop { 0% { opacity: 0; transform: translateY(-50%) scale(.7) } 60% { opacity: 1; transform: translateY(-50%) scale(1.04) } 100% { opacity: 1; transform: translateY(-50%) scale(1) } }
@keyframes auPing { 0% { transform: scale(.6); opacity: .7 } 80%,100% { transform: scale(2.6); opacity: 0 } }
@keyframes auStem { from { width: 0; opacity: 0 } to { width: 22px; opacity: 1 } }
@keyframes auLabel { from { opacity: 0; transform: translateX(-6px) } to { opacity: 1; transform: translateX(0) } }
@keyframes auCard { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: none } }
.au-co { position:absolute; transform:translateY(-50%); display:flex; align-items:center; animation: auPop .45s cubic-bezier(.2,.8,.2,1) both; }
.au-dot { position:relative; width:13px; height:13px; border-radius:999px; flex-shrink:0; cursor:pointer; }
.au-dot::before { content:''; position:absolute; inset:-6px; border-radius:999px; background:currentColor; opacity:.55; animation: auPing 1.8s ease-out infinite; }
.au-dot::after { content:''; position:absolute; inset:0; border-radius:999px; background:#fff; box-shadow:0 2px 8px rgba(0,0,0,.55); }
.au-stem { height:1.5px; background:linear-gradient(90deg, rgba(255,255,255,.9), rgba(255,255,255,.35)); animation: auStem .35s ease-out both; animation-delay:.2s; }
.au-label { animation: auLabel .35s ease-out both; animation-delay:.32s; cursor:pointer; display:flex; align-items:center; gap:8px;
  padding:7px 12px; border-radius:12px; background:rgba(13,18,32,.72); backdrop-filter:blur(10px) saturate(1.3);
  border:1px solid rgba(255,255,255,.16); box-shadow:0 8px 26px rgba(0,0,0,.4); color:#fff; white-space:nowrap; }
.au-label b { font-size:12.5px; font-weight:700; letter-spacing:-.01em; }
.au-label span { font-size:11px; color:#9FB0C6; }
.au-card { animation: auCard .3s ease-out both; }
.au-scan { position:absolute; left:0; right:0; height:34%; pointer-events:none;
  background:linear-gradient(180deg, rgba(56,189,248,0) 0%, rgba(56,189,248,.18) 50%, rgba(56,189,248,0) 100%);
  animation: auScan 1.1s ease-in-out both; }
`;

export default function Lab3dPage() {
  const d = SAMPLE;
  const [showCallouts, setShowCallouts] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);
  const [scanKey, setScanKey] = useState(0); // bump to replay the "detect" animation

  const rescan = () => { setSelected(null); setScanKey((k) => k + 1); };

  return (
    <div style={{ minHeight: '100vh', background: '#F7F6F2', padding: '20px 16px', fontFamily: 'system-ui,-apple-system,Segoe UI,Roboto,sans-serif' }}>
      <style>{CALLOUT_CSS}</style>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0B1220', margin: 0 }}>3D Analysis</h1>
          <span style={{ fontSize: 12, color: '#fff', background: '#0B1220', borderRadius: 999, padding: '2px 10px', fontWeight: 700 }}>founder lab</span>
        </div>
        <p style={{ fontSize: 12.5, color: '#B45309', background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 8, padding: '7px 11px', display: 'inline-block', margin: '6px 0 18px' }}>
          {d.source}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.3fr) minmax(0,1fr)', gap: 18, alignItems: 'stretch' }}>
          {/* 3D viewer + animated callout overlay */}
          <div style={{ position: 'relative', height: 460, minHeight: 320, borderRadius: 14, overflow: 'hidden' }}>
            <SplatViewer splatUrl={d.splatUrl} />

            {/* scan sweep replays each "detect" */}
            {showCallouts && <div key={`scan-${scanKey}`} className="au-scan" />}

            {/* callouts — pointer-events pass through except on dots/labels */}
            {showCallouts && (
              <div key={`co-${scanKey}`} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                {d.parts.map((p, i) => (
                  <div
                    key={p.name}
                    className="au-co"
                    style={{ left: `${p.pos.x}%`, top: `${p.pos.y}%`, color: sevColor(d.severity), animationDelay: `${0.15 + i * 0.18}s`, pointerEvents: 'auto' }}
                  >
                    <span className="au-dot" onClick={() => setSelected(selected === i ? null : i)} />
                    <span className="au-stem" />
                    <span className="au-label" onClick={() => setSelected(selected === i ? null : i)}>
                      <b>{p.name}</b>
                      <span>{p.price} ›</span>
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* selected part → live part-finder card (mock buy links) */}
            {selected !== null && (
              <div className="au-card" style={{ position: 'absolute', left: 12, right: 12, bottom: 12, background: '#fff', border: '1px solid #E3DFD4', borderRadius: 14, padding: 14, boxShadow: '0 10px 34px rgba(0,0,0,0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0B1220' }}>{d.parts[selected].name}</div>
                    <div style={{ fontSize: 12, color: '#64748B' }}>{d.parts[selected].status} · OEM {d.parts[selected].pn} · {d.parts[selected].price}</div>
                  </div>
                  <button onClick={() => setSelected(null)} style={{ flexShrink: 0, border: 'none', background: '#F1F5F9', borderRadius: 999, width: 26, height: 26, cursor: 'pointer', color: '#64748B', fontSize: 14 }}>✕</button>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <span style={{ flex: 1, textAlign: 'center', background: '#FF9900', color: '#0B1220', fontWeight: 700, fontSize: 12.5, borderRadius: 9, padding: '8px 0' }}>Amazon</span>
                  <span style={{ flex: 1, textAlign: 'center', background: '#0B1220', color: '#fff', fontWeight: 700, fontSize: 12.5, borderRadius: 9, padding: '8px 0' }}>RockAuto</span>
                  <span style={{ flex: 1, textAlign: 'center', background: '#fff', color: '#0B1220', border: '1px solid #E3DFD4', fontWeight: 700, fontSize: 12.5, borderRadius: 9, padding: '8px 0' }}>eBay</span>
                </div>
              </div>
            )}

            {/* viewfinder-style controls */}
            <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 8 }}>
              <button onClick={rescan} style={ctrlBtn}>↻ Rescan</button>
              <button onClick={() => setShowCallouts((s) => !s)} style={ctrlBtn}>{showCallouts ? 'Callouts on' : 'Callouts off'}</button>
            </div>
          </div>

          {/* analysis panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: '#fff', border: '1px solid #E3DFD4', borderRadius: 14, padding: 18 }}>
              <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>{d.vehicle}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '8px 0' }}>
                <span style={{ width: 9, height: 9, borderRadius: 999, background: sevColor(d.severity) }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: sevColor(d.severity), textTransform: 'capitalize' }}>{d.severity} severity</span>
              </div>
              <p style={{ fontSize: 13.5, color: '#0B1220', lineHeight: 1.55, margin: 0 }}>{d.summary}</p>
            </div>

            <div style={{ background: '#fff', border: '1px solid #E3DFD4', borderRadius: 14, padding: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#0B1220', marginBottom: 10 }}>Detected parts (segmentation)</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {d.parts.map((p, i) => (
                  <button
                    key={p.name}
                    onClick={() => setSelected(selected === i ? null : i)}
                    style={{ textAlign: 'left', cursor: 'pointer', background: selected === i ? '#EFF5FF' : 'transparent', border: '1px solid', borderColor: selected === i ? '#BFDBFE' : 'transparent', borderRadius: 10, padding: '7px 9px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#0B1220' }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: '#64748B' }}>{p.status}</div>
                    </div>
                    <span style={{ flexShrink: 0, fontSize: 12, fontWeight: 700, color: '#334155', background: '#F1F5F9', borderRadius: 999, padding: '3px 9px' }}>
                      {Math.round(p.confidence * 100)}%
                    </span>
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 11.5, color: '#94A3B8', marginTop: 10 }}>Tap a part → its callout highlights on the model + buy links. ↻ Rescan replays the detect animation.</div>
            </div>

            <div style={{ background: '#fff', border: '1px solid #E3DFD4', borderRadius: 14, padding: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#0B1220', marginBottom: 8 }}>Measured geometry (depth)</div>
              <div style={{ fontSize: 13, color: '#0B1220', display: 'flex', gap: 16 }}>
                <span>nearest <b>{d.geometry.nearest}</b></span>
                <span>median <b>{d.geometry.median}</b></span>
                <span>farthest <b>{d.geometry.farthest}</b></span>
              </div>
              <div style={{ fontSize: 11.5, color: '#94A3B8', marginTop: 6 }}>{d.geometry.unit} · {d.geometry.note}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Talk-to-the-AI voice layer (founder = full Realtime session). On the
          live result screen getFrame() returns the analyzed photo so you can
          ask "what's wrong with this?" — here it's a voice-only preview. */}
      <VoiceMechanic getFrame={() => null} autoStart={false} vehicle={{ year: 2019, make: 'Chevrolet', model: 'Camaro', trim: 'ZL1' }} />
    </div>
  );
}

const ctrlBtn: React.CSSProperties = {
  pointerEvents: 'auto', background: 'rgba(13,18,32,.72)', color: '#fff', border: '1px solid rgba(255,255,255,.16)',
  borderRadius: 999, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', backdropFilter: 'blur(8px)',
};
