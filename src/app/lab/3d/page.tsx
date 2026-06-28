'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

// Splat viewer is client-only (WebGL + workers) — never SSR it.
const SplatViewer = dynamic(() => import('@/components/lab/SplatViewer'), {
  ssr: false,
  loading: () => <div style={{ width: '100%', height: '100%', background: '#0B1220', borderRadius: 14 }} />,
});

// Placeholder analysis until the real pipeline (vision + depth + SAM 3/3D) feeds
// this. Shape mirrors what the live data will look like so the UI is final.
// `pos` = screen-anchored callout position (%) — in production these anchor to
// the 3D points and track as the model rotates.
const SAMPLE = {
  source: 'SAMPLE (sphere placeholder + mock callouts) — replace with SAM 3D output',
  splatUrl: '/lab/sample-splat.ply',
  vehicle: '2019 Chevrolet Camaro ZL1',
  summary:
    'Front-left corner impact. Bumper cover cracked at the fascia seam; headlight housing tab broken; no structural/rail deformation visible.',
  severity: 'medium',
  parts: [
    { name: 'Front bumper cover', confidence: 0.94, status: 'cracked', pos: { x: 32, y: 64 }, pn: '84134333', price: '$310–480' },
    { name: 'Left headlight assembly', confidence: 0.88, status: 'mount tab broken', pos: { x: 62, y: 38 }, pn: '84078625', price: '$520–700' },
    { name: 'Fender (left front)', confidence: 0.71, status: 'minor scuff', pos: { x: 78, y: 70 }, pn: '23390377', price: '$240–390' },
  ],
  geometry: { unit: 'relative', nearest: 0.31, median: 0.55, farthest: 0.92, note: 'depth from DA3 — macro shape only' },
};

const sevColor = (s: string) => (s === 'high' ? '#DC2626' : s === 'medium' ? '#D97706' : '#16A34A');

export default function Lab3dPage() {
  const d = SAMPLE;
  const [showCallouts, setShowCallouts] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div style={{ minHeight: '100vh', background: '#F7F6F2', padding: '20px 16px', fontFamily: 'system-ui,-apple-system,Segoe UI,Roboto,sans-serif' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0B1220', margin: 0 }}>3D Analysis</h1>
          <span style={{ fontSize: 12, color: '#fff', background: '#0B1220', borderRadius: 999, padding: '2px 10px', fontWeight: 700 }}>founder lab</span>
        </div>
        <p style={{ fontSize: 12.5, color: '#B45309', background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 8, padding: '7px 11px', display: 'inline-block', margin: '6px 0 18px' }}>
          {d.source}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.3fr) minmax(0,1fr)', gap: 18, alignItems: 'stretch' }}>
          {/* 3D viewer + callout overlay */}
          <div style={{ position: 'relative', height: 460, minHeight: 320 }}>
            <SplatViewer splatUrl={d.splatUrl} />

            {/* Callout overlay — pointer-events pass through to the viewer except
                on the pins/labels, so orbit still works. In production each pin
                anchors to a 3D point and tracks rotation. */}
            {showCallouts && (
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                {d.parts.map((p, i) => (
                  <button
                    key={p.name}
                    onClick={() => setSelected(selected === i ? null : i)}
                    style={{
                      position: 'absolute', left: `${p.pos.x}%`, top: `${p.pos.y}%`,
                      transform: 'translate(-50%,-50%)', pointerEvents: 'auto',
                      display: 'flex', alignItems: 'center', gap: 7, padding: '5px 10px 5px 6px',
                      background: selected === i ? '#2563EB' : 'rgba(11,18,32,0.82)',
                      color: '#fff', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 999,
                      fontSize: 12, fontWeight: 600, cursor: 'pointer', backdropFilter: 'blur(4px)',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.35)', whiteSpace: 'nowrap',
                    }}
                  >
                    <span style={{ width: 9, height: 9, borderRadius: 999, background: sevColor(d.severity), boxShadow: '0 0 0 3px rgba(255,255,255,0.25)' }} />
                    {p.name}
                  </button>
                ))}
              </div>
            )}

            {/* selected part → live part-finder card (mock buy links) */}
            {selected !== null && (
              <div style={{ position: 'absolute', left: 12, right: 12, bottom: 12, background: '#fff', border: '1px solid #E3DFD4', borderRadius: 14, padding: 14, boxShadow: '0 8px 30px rgba(0,0,0,0.25)' }}>
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

            {/* callout toggle (mimics the live viewfinder control) */}
            <button
              onClick={() => setShowCallouts((s) => !s)}
              style={{ position: 'absolute', top: 10, right: 10, pointerEvents: 'auto', background: 'rgba(11,18,32,0.82)', color: '#fff', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 999, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', backdropFilter: 'blur(4px)' }}
            >
              {showCallouts ? 'Hide callouts' : 'Show callouts'}
            </button>
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
              <div style={{ fontSize: 11.5, color: '#94A3B8', marginTop: 10 }}>Tap a part → callout highlights on the model + buy links.</div>
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
    </div>
  );
}
