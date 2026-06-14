'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';

/**
 * VISUAL TEST (Devon's "create a test" ask) — proof-of-concept for adding
 * interactive visuals to known-issues pages WITHOUT scraping anyone's photos
 * and WITHOUT paid image generation.
 *
 * v2 adds the path Devon chose: a REAL photo of his own Challenger as the
 * base layer (he owns it → zero copyright/consent risk, automatically
 * realistic) with our DATA-DRIVEN annotations on top, plus pinch/scroll ZOOM,
 * drag PAN, and an "X-ray" slider that cross-fades the real photo into the
 * labeled cross-section diagram. Until a photo is dropped in, the diagram
 * itself is the base so the page is already useful.
 *
 * To wire Devon's photo: drop the file in /public/diagrams/ and set PHOTO
 * below (src + the % coords for each hotspot, tuned to that photo's framing).
 *
 * Sample issue is REAL DB data: 2011–2021 Dodge Challenger "OEM Radiator
 * Premature Failure" (cooling / medium / $200–800), failure point = the
 * crimped plastic end-tank seams. Symptoms verbatim from the KnownIssue row.
 */

// Drop Devon's photo here once provided, e.g.
// { src: '/diagrams/challenger-radiator.jpg', alt: 'Challenger radiator, front' }
const PHOTO: { src: string; alt: string } | null = null;

const ISSUE = {
  make: 'Dodge',
  model: 'Challenger',
  years: '2011–2021',
  title: 'OEM Radiator Premature Failure',
  category: 'Cooling',
  severity: 'medium' as const,
  costLow: 200,
  costHigh: 800,
  description:
    'The factory plastic-tank radiators on Challengers are prone to cracking and leaking, especially under spirited driving or in hot climates. The crimped plastic end tanks can fail at the seams. Many owners report needing radiator replacements between 60,000–100,000 miles.',
  symptoms: [
    'Coolant leak at radiator seams',
    'Overheating during spirited driving',
    'Low coolant warnings',
    'Green or orange puddles under front of car',
    'Steam from engine bay',
  ],
};

const PAPER = '#F7F6F2';
const INK = '#0B1220';
const LINE = '#E3DFD4';
const BLUE = '#3B82F6';
const CRIT = '#DC2626';
const COOL = '#22B8CF';

type Mode = 'healthy' | 'failing';

type Hotspot = { id: string; label: string; blurb: string; x: number; y: number; failurePoint?: boolean };

const HOTSPOTS: Hotspot[] = [
  { id: 'upper', label: 'Upper plastic tank', blurb: 'Molded plastic end tank. Holds hot coolant coming off the engine. Cheap to make, but it is the first thing to go brittle with heat cycling.', x: 30, y: 17 },
  { id: 'seam', label: 'Crimped seam (failure point)', blurb: 'Where the plastic tank is mechanically crimped to the aluminum core. The gasket here hardens and the plastic cracks — this is exactly where Challenger radiators leak.', x: 80, y: 27, failurePoint: true },
  { id: 'core', label: 'Aluminum core', blurb: 'Tubes + fins that shed heat. The core itself usually survives; it is the plastic tanks bolted to it that fail.', x: 50, y: 50 },
  { id: 'lower', label: 'Lower plastic tank', blurb: 'Cooled coolant collects here before heading back to the water pump. Same plastic-fatigue risk as the upper tank.', x: 30, y: 83 },
];

export function VisualTestClient() {
  const [mode, setMode] = useState<Mode>('failing');
  const [active, setActive] = useState<string | null>('seam');
  const [zoom, setZoom] = useState(1);
  const [xray, setXray] = useState(PHOTO ? 0.5 : 1); // diagram opacity over the photo
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);

  const failing = mode === 'failing';
  const activeSpot = HOTSPOTS.find((h) => h.id === active) || null;
  const hasPhoto = !!PHOTO;

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current || zoom === 1) return;
    setPan({ x: drag.current.px + (e.clientX - drag.current.x), y: drag.current.py + (e.clientY - drag.current.y) });
  };
  const onPointerUp = () => { drag.current = null; };
  const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  return (
    <div style={{ minHeight: '100dvh', background: PAPER, color: INK, fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)' }}>
      <header style={{ padding: '14px 20px', borderBottom: `1px solid ${LINE}` }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/known-issues" style={{ fontSize: 13, color: 'var(--slate-600, #475569)', textDecoration: 'none' }}>← Known issues</Link>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: BLUE }}>Visual test · proof of concept</span>
        </div>
      </header>

      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '28px 20px 72px' }}>
        <h1 style={{ fontSize: 'clamp(22px,4vw,30px)', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 6px' }}>
          {ISSUE.years} {ISSUE.make} {ISSUE.model} — {ISSUE.title}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--slate-600, #475569)', margin: '0 0 4px' }}>
          {ISSUE.category} · severity {ISSUE.severity} · est. ${ISSUE.costLow}–${ISSUE.costHigh}
        </p>
        <p style={{ fontSize: 12.5, color: 'var(--slate-500, #64748B)', margin: '0 0 18px', maxWidth: 700 }}>
          {hasPhoto
            ? 'Real photo of the actual part as the base, our data-driven annotations on top. Drag the X-ray slider to fade between the photo and the labeled diagram, zoom in, and tap the pins.'
            : 'Right now the base is a diagram generated from the issue’s own data (failure mode, affected part, symptoms) — no scraping, no image generator, so it can’t invent a wrong layout. Once a real photo of the car is added it becomes the base and the X-ray slider fades between photo and diagram.'}
        </p>

        {/* Controls */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14, marginBottom: 14 }}>
          <div style={{ display: 'inline-flex', gap: 3, padding: 3, background: '#fff', border: `1px solid ${LINE}`, borderRadius: 999 }}>
            {(['healthy', 'failing'] as const).map((m) => {
              const on = m === mode;
              return (
                <button key={m} type="button" onClick={() => setMode(m)}
                  style={{ padding: '7px 16px', borderRadius: 999, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, background: on ? (m === 'failing' ? CRIT : INK) : 'transparent', color: on ? '#fff' : 'var(--slate-600, #475569)' }}>
                  {m === 'failing' ? 'Failing' : 'Healthy'}
                </button>
              );
            })}
          </div>

          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--slate-600, #475569)' }}>
            Zoom
            <input type="range" min={1} max={3} step={0.1} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} style={{ width: 110, accentColor: BLUE }} />
            <span style={{ fontFamily: 'monospace', width: 30 }}>{zoom.toFixed(1)}×</span>
          </label>

          {hasPhoto && (
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--slate-600, #475569)' }}>
              Photo
              <input type="range" min={0} max={1} step={0.05} value={xray} onChange={(e) => setXray(Number(e.target.value))} style={{ width: 110, accentColor: BLUE }} />
              Diagram
            </label>
          )}

          {(zoom !== 1 || pan.x || pan.y) && (
            <button type="button" onClick={resetView} style={{ fontSize: 12, color: BLUE, background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}>Reset view</button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr)', gap: 20, alignItems: 'start' }} className="vt-grid">
          {/* ── Interactive stage ── */}
          <div style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 16, padding: 14 }}>
            <div
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerLeave={onPointerUp}
              style={{ position: 'relative', width: '100%', aspectRatio: '4 / 3', overflow: 'hidden', borderRadius: 10, background: hasPhoto ? '#0B0E14' : '#fff', cursor: zoom > 1 ? (drag.current ? 'grabbing' : 'grab') : 'default', touchAction: 'none' }}
            >
              {/* zoom/pan wrapper — photo, diagram overlay, and pins all scale together */}
              <div style={{ position: 'absolute', inset: 0, transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: 'center center', transition: drag.current ? 'none' : 'transform 0.12s ease-out' }}>
                {hasPhoto && PHOTO && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={PHOTO.src} alt={PHOTO.alt} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
                {/* Diagram layer — base when no photo, faded overlay when there is one */}
                <div style={{ position: 'absolute', inset: 0, opacity: hasPhoto ? xray : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <RadiatorSVG failing={failing} activeId={active} />
                </div>
                {/* Hotspot pins (counter-scaled so they stay a constant size) */}
                {HOTSPOTS.map((h) => {
                  const on = h.id === active;
                  const danger = h.failurePoint && failing;
                  return (
                    <button key={h.id} type="button" onClick={(e) => { e.stopPropagation(); setActive(h.id); }} aria-label={h.label}
                      style={{ position: 'absolute', left: `${h.x}%`, top: `${h.y}%`, transform: `translate(-50%,-50%) scale(${1 / zoom})`, width: on ? 26 : 22, height: on ? 26 : 22, borderRadius: '50%', cursor: 'pointer', border: '2px solid #fff', background: danger ? CRIT : on ? INK : BLUE, color: '#fff', fontSize: 11, fontWeight: 700, boxShadow: '0 2px 8px rgba(11,18,32,0.35)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0, animation: danger ? 'vtPulse 1.1s ease-in-out infinite' : undefined }}>
                      {danger ? '!' : ''}
                    </button>
                  );
                })}
              </div>

              {!hasPhoto && (
                <div style={{ position: 'absolute', bottom: 8, left: 8, right: 8, textAlign: 'center', fontSize: 10.5, color: 'var(--slate-400, #94A3B8)', pointerEvents: 'none' }}>
                  Diagram base · add a real photo to enable the X-ray fade
                </div>
              )}
            </div>
          </div>

          {/* ── Side panel ── */}
          <div>
            {activeSpot && (
              <div style={{ background: '#fff', border: `1px solid ${activeSpot.failurePoint && failing ? CRIT : LINE}`, borderRadius: 14, padding: '14px 16px', marginBottom: 14 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: activeSpot.failurePoint && failing ? CRIT : BLUE, marginBottom: 4 }}>
                  {activeSpot.failurePoint ? 'Where it fails' : 'Part'}
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{activeSpot.label}</div>
                <p style={{ fontSize: 13, color: 'var(--slate-700, #334155)', lineHeight: 1.5, margin: 0 }}>{activeSpot.blurb}</p>
              </div>
            )}

            <div style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 14, padding: '14px 16px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--slate-500, #64748B)', marginBottom: 8 }}>Symptoms owners report</div>
              <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {ISSUE.symptoms.map((s) => (
                  <li key={s} style={{ fontSize: 13, color: 'var(--slate-700, #334155)', lineHeight: 1.4 }}>{s}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <p style={{ fontSize: 12, color: 'var(--slate-500, #64748B)', marginTop: 22, lineHeight: 1.55, maxWidth: 720 }}>
          <strong>The plan:</strong> a real photo of the actual part (owned, consented, automatically
          realistic) as the base, our data-driven annotations + X-ray cross-fade on top. One reusable
          interaction reskins to any of our ~4,500 issues by moving the highlight to the part the data
          names — $0 and no accuracy risk. Generative photoreal images stay off the table (they invent
          part geometry); real photos + 3D are the honest realism path.
        </p>
      </main>

      <style>{`
        @keyframes vtPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(220,38,38,0.55); } 50% { box-shadow: 0 0 0 9px rgba(220,38,38,0); } }
        @keyframes vtFlow { to { stroke-dashoffset: -28; } }
        @keyframes vtDrip { 0% { transform: translateY(0); opacity: 0; } 15% { opacity: 1; } 80% { opacity: 1; } 100% { transform: translateY(46px); opacity: 0; } }
        @keyframes vtPuddle { 0% { transform: scaleX(0.3); opacity: 0.2; } 100% { transform: scaleX(1); opacity: 0.85; } }
        @media (max-width: 720px) { .vt-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}

function RadiatorSVG({ failing, activeId }: { failing: boolean; activeId: string | null }) {
  const hot = (id: string) => (activeId === id ? 1 : 0.0);
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" style={{ display: 'block' }} preserveAspectRatio="xMidYMid meet" role="img" aria-label="Radiator cross-section">
      <defs>
        <pattern id="vtFins" width="9" height="10" patternUnits="userSpaceOnUse">
          <rect width="9" height="10" fill="#EEF2F4" />
          <path d="M0 0 L9 10 M-2 8 L2 12 M7 -2 L11 2" stroke="#C8D2D8" strokeWidth="1" />
        </pattern>
      </defs>

      {/* Inlet / outlet hoses */}
      <path d="M40 50 C20 50 20 40 44 40" fill="none" stroke="#374151" strokeWidth="9" strokeLinecap="round" />
      <path d="M40 250 C20 250 20 260 44 260" fill="none" stroke="#374151" strokeWidth="9" strokeLinecap="round" />

      {/* Core (tubes + fins) */}
      <rect x="48" y="58" width="304" height="184" rx="4" fill="url(#vtFins)" stroke="#B9C3CA" />
      <rect x="48" y="58" width="304" height="184" rx="4" fill={BLUE} opacity={hot('core') * 0.12} />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const x = 70 + i * 38;
        return (
          <g key={i}>
            <rect x={x} y="62" width="10" height="176" rx="3" fill="#DBE3E8" stroke="#B9C3CA" strokeWidth="0.8" />
            <line x1={x + 5} y1="64" x2={x + 5} y2="236" stroke={COOL} strokeWidth="4" strokeLinecap="round"
              strokeDasharray="10 18" style={{ animation: 'vtFlow 0.9s linear infinite' }} opacity={0.85} />
          </g>
        );
      })}

      {/* Upper tank (plastic) */}
      <rect x="44" y="34" width="312" height="30" rx="8" fill="#222A33" stroke="#11161C" />
      <rect x="44" y="34" width="312" height="30" rx="8" fill={BLUE} opacity={hot('upper') * 0.35} />
      <text x="200" y="53" textAnchor="middle" fontSize="11" fill="#9AA6B2" fontFamily="monospace">PLASTIC END TANK</text>

      {/* Lower tank (plastic) */}
      <rect x="44" y="236" width="312" height="30" rx="8" fill="#222A33" stroke="#11161C" />
      <rect x="44" y="236" width="312" height="30" rx="8" fill={BLUE} opacity={hot('lower') * 0.35} />

      {/* Crimp seams (left + right). Right seam = failure point. */}
      <rect x="44" y="60" width="312" height="6" fill="#5B6670" />
      <rect x="44" y="234" width="312" height="6" fill="#5B6670" />

      {failing ? (
        <>
          <path d="M330 64 l6 -7 l-3 9 l7 -3 l-6 8" fill="none" stroke={CRIT} strokeWidth="2.4" strokeLinejoin="round" />
          <circle cx="334" cy="64" r="13" fill="none" stroke={CRIT} strokeWidth="2" opacity="0.6">
            <animate attributeName="r" values="9;16;9" dur="1.4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0;0.6" dur="1.4s" repeatCount="indefinite" />
          </circle>
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={332 + i * 3} cy="70" r="3.2" fill={i % 2 ? '#5BBF3A' : '#E08A1E'}
              style={{ animation: `vtDrip 1.5s ease-in ${i * 0.5}s infinite` }} />
          ))}
          <ellipse cx="320" cy="292" rx="60" ry="6" fill="#5BBF3A" style={{ animation: 'vtPuddle 2.4s ease-out forwards', transformOrigin: '320px 292px' }} opacity="0.8" />
        </>
      ) : (
        <g opacity="0.5">
          <text x="334" y="22" textAnchor="middle" fontSize="11" fill="#16A34A">✓ sealed</text>
        </g>
      )}
    </svg>
  );
}
