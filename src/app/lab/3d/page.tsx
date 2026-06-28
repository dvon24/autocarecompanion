'use client';

import dynamic from 'next/dynamic';

// Splat viewer is client-only (WebGL + workers) — never SSR it.
const SplatViewer = dynamic(() => import('@/components/lab/SplatViewer'), {
  ssr: false,
  loading: () => <div style={{ width: '100%', height: '100%', background: '#0B1220', borderRadius: 14 }} />,
});

// Placeholder analysis until the real pipeline (vision + depth + SAM 3/3D) feeds
// this. Shape mirrors what the live data will look like so the UI is final.
const SAMPLE = {
  source: 'SAMPLE (sphere placeholder) — replace with SAM 3D output',
  splatUrl: '/lab/sample-splat.ply',
  vehicle: '2019 Chevrolet Camaro ZL1',
  summary:
    'Front-left corner impact. Bumper cover cracked at the fascia seam; headlight housing tab broken; no structural/rail deformation visible.',
  severity: 'medium',
  parts: [
    { name: 'Front bumper cover', confidence: 0.94, status: 'cracked' },
    { name: 'Left headlight assembly', confidence: 0.88, status: 'mount tab broken' },
    { name: 'Fender (left front)', confidence: 0.71, status: 'minor scuff' },
  ],
  geometry: { unit: 'relative', nearest: 0.31, median: 0.55, farthest: 0.92, note: 'depth from DA3 — macro shape only' },
};

const sevColor = (s: string) => (s === 'high' ? '#DC2626' : s === 'medium' ? '#D97706' : '#16A34A');

export default function Lab3dPage() {
  const d = SAMPLE;
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
          {/* 3D viewer */}
          <div style={{ height: 460, minHeight: 320 }}>
            <SplatViewer splatUrl={d.splatUrl} />
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
                {d.parts.map((p) => (
                  <div key={p.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#0B1220' }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: '#64748B' }}>{p.status}</div>
                    </div>
                    <span style={{ flexShrink: 0, fontSize: 12, fontWeight: 700, color: '#334155', background: '#F1F5F9', borderRadius: 999, padding: '3px 9px' }}>
                      {Math.round(p.confidence * 100)}%
                    </span>
                  </div>
                ))}
              </div>
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
