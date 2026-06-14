'use client';

import { useState } from 'react';
import Link from 'next/link';

/**
 * VISUAL TEST (Devon's "create a test" ask) — proof-of-concept for adding
 * interactive visuals to known-issues pages WITHOUT scraping anyone's photos
 * and WITHOUT paid image generation.
 *
 * It renders an interactive, animated SVG cross-section of a known issue,
 * driven entirely by the issue's OWN structured data (the failure mode, the
 * affected component, the symptoms) — so it can never hallucinate a part
 * layout the way a generative image model would, and it's $0 to produce.
 *
 * The sample issue is REAL DB data: 2011–2021 Dodge Challenger "OEM Radiator
 * Premature Failure" (cooling / medium / $200–800), failure point = the
 * crimped plastic end-tank seams. Symptoms verbatim from the KnownIssue row.
 *
 * This is the "system-level interactive diagram" path from the visual-media
 * roadmap: one reusable diagram per SYSTEM (cooling, brakes, …) with the
 * failure point highlighted per issue. See the response in chat for the
 * other media options (AI realistic images, three.js 3D, real-photo strips).
 */

// Verbatim from the KnownIssue row (status=published).
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
const COOL = '#22B8CF'; // coolant teal

type Mode = 'healthy' | 'failing';

type Hotspot = {
  id: string;
  label: string;
  blurb: string;
  x: number; // % of svg width
  y: number; // % of svg height
  failurePoint?: boolean;
};

const HOTSPOTS: Hotspot[] = [
  { id: 'upper', label: 'Upper plastic tank', blurb: 'Molded plastic end tank. Holds hot coolant coming off the engine. Cheap to make, but it is the first thing to go brittle with heat cycling.', x: 30, y: 17 },
  { id: 'seam', label: 'Crimped seam (failure point)', blurb: 'Where the plastic tank is mechanically crimped to the aluminum core. The gasket here hardens and the plastic cracks — this is exactly where Challenger radiators leak.', x: 80, y: 27, failurePoint: true },
  { id: 'core', label: 'Aluminum core', blurb: 'Tubes + fins that shed heat. The core itself usually survives; it is the plastic tanks bolted to it that fail.', x: 50, y: 50 },
  { id: 'lower', label: 'Lower plastic tank', blurb: 'Cooled coolant collects here before heading back to the water pump. Same plastic-fatigue risk as the upper tank.', x: 30, y: 83 },
];

export function VisualTestClient() {
  const [mode, setMode] = useState<Mode>('failing');
  const [active, setActive] = useState<string | null>('seam');
  const failing = mode === 'failing';
  const activeSpot = HOTSPOTS.find((h) => h.id === active) || null;

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
        <p style={{ fontSize: 12.5, color: 'var(--slate-500, #64748B)', margin: '0 0 20px', maxWidth: 680 }}>
          This diagram is generated from the issue&apos;s own data — the failure mode, the affected
          part, the symptoms. Nothing here is a photo of anyone&apos;s car, and no image generator
          was used, so it can&apos;t invent a wrong part layout. Toggle the radiator between healthy
          and failing, and tap the pins to see what each part does.
        </p>

        {/* Controls */}
        <div style={{ display: 'inline-flex', gap: 3, padding: 3, background: '#fff', border: `1px solid ${LINE}`, borderRadius: 999, marginBottom: 16 }}>
          {(['healthy', 'failing'] as const).map((m) => {
            const on = m === mode;
            return (
              <button key={m} type="button" onClick={() => setMode(m)}
                style={{ padding: '7px 18px', borderRadius: 999, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, background: on ? (m === 'failing' ? CRIT : INK) : 'transparent', color: on ? '#fff' : 'var(--slate-600, #475569)' }}>
                {m === 'failing' ? 'Failing radiator' : 'Healthy radiator'}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr)', gap: 20, alignItems: 'start' }} className="vt-grid">
          {/* ── Diagram ── */}
          <div style={{ position: 'relative', background: '#fff', border: `1px solid ${LINE}`, borderRadius: 16, padding: 14 }}>
            <RadiatorSVG failing={failing} activeId={active} />
            {/* Hotspot pins overlaid in % coords */}
            {HOTSPOTS.map((h) => {
              const on = h.id === active;
              const danger = h.failurePoint && failing;
              return (
                <button key={h.id} type="button" onClick={() => setActive(h.id)} aria-label={h.label}
                  style={{ position: 'absolute', left: `calc(${h.x}% )`, top: `calc(${h.y}% )`, transform: 'translate(-50%,-50%)', width: on ? 26 : 22, height: on ? 26 : 22, borderRadius: '50%', cursor: 'pointer', border: `2px solid #fff`, background: danger ? CRIT : on ? INK : BLUE, color: '#fff', fontSize: 11, fontWeight: 700, boxShadow: '0 2px 8px rgba(11,18,32,0.35)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0, animation: danger ? 'vtPulse 1.1s ease-in-out infinite' : undefined }}>
                  {danger ? '!' : ''}
                </button>
              );
            })}
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
          <strong>What this proves:</strong> one reusable diagram per system (here: cooling) can be
          reskinned to any of our ~4,500 issues by moving the failure highlight to the part the data
          names — at $0 and with no accuracy risk. The fancier media options (photoreal AI images,
          rotatable three.js 3D, real-photo failure strips from the consented flywheel) build on top
          of this; see chat for the trade-offs.
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
    <svg viewBox="0 0 400 300" width="100%" style={{ display: 'block' }} role="img" aria-label="Radiator cross-section">
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
      {/* highlight core when active */}
      <rect x="48" y="58" width="304" height="184" rx="4" fill={BLUE} opacity={hot('core') * 0.12} />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const x = 70 + i * 38;
        return (
          <g key={i}>
            <rect x={x} y="62" width="10" height="176" rx="3" fill="#DBE3E8" stroke="#B9C3CA" strokeWidth="0.8" />
            {/* coolant flowing down each tube */}
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

      {/* Failure highlight at the upper-right crimp seam */}
      {failing ? (
        <>
          {/* crack */}
          <path d="M330 64 l6 -7 l-3 9 l7 -3 l-6 8" fill="none" stroke={CRIT} strokeWidth="2.4" strokeLinejoin="round" />
          <circle cx="334" cy="64" r="13" fill="none" stroke={CRIT} strokeWidth="2" opacity="0.6">
            <animate attributeName="r" values="9;16;9" dur="1.4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0;0.6" dur="1.4s" repeatCount="indefinite" />
          </circle>
          {/* drips */}
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={332 + i * 3} cy="70" r="3.2" fill={i % 2 ? '#5BBF3A' : '#E08A1E'}
              style={{ animation: `vtDrip 1.5s ease-in ${i * 0.5}s infinite` }} />
          ))}
          {/* puddle */}
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
