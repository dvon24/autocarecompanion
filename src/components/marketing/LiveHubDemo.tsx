'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * LiveHubDemo — a framed browser window that OPENS on a loaded Au7o hub
 * (maintenance schedule + known issues already surfaced) and then AUTO-ROTATES
 * through the product's capabilities (photo/video diagnosis, live recalls,
 * car-aware Drive), with the chat composer pinned at the bottom the whole time.
 *
 * Ported from design/15-FeatureCarousel.jsx (HubWindowMerged). It's the shared
 * "prove the value before the ask" centerpiece used on BOTH the known-issues
 * capture split and the signup redesign. Hover to pause; click the dots to jump.
 *
 * Self-contained (no design-system deps) so it drops into any page. Pass the
 * page's vehicle so the demo speaks about the visitor's actual car when we know
 * it; otherwise it falls back to a representative demo vehicle.
 */

const INK = '#0B1220';
const BLUE = '#3B82F6';
const PAPER = '#FBFAF7';
const PAPER_2 = '#F4F1E9';
const LINE = '#E3DFD4';
const SLATE_500 = '#64748B';
const SLATE_400 = '#94A3B8';
const OK = '#10B981';
const WARN = '#F59E0B';
const CRIT = '#EF4444';

type Row = { dot: 'crit' | 'warn' | 'ok'; label: string; note: string; right: string; primary?: boolean; muted?: boolean };

function dotColor(d: Row['dot']) {
  return d === 'crit' ? CRIT : d === 'warn' ? WARN : OK;
}

function AttShell({ title, meta, live, children }: { title: string; meta: string; live?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 14, boxShadow: '0 18px 40px rgba(11,18,32,0.12)', overflow: 'hidden' }}>
      <div style={{ padding: '10px 13px', borderBottom: `1px solid ${LINE}`, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: INK }}>{title}</span>
        {live && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginLeft: 2 }}>
            <span className="au7o-demo-pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: OK }} />
            <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 8.5, color: OK, fontWeight: 700, letterSpacing: '0.06em' }}>LIVE</span>
          </span>
        )}
        <span style={{ marginLeft: 'auto', fontSize: 10, color: SLATE_400 }}>{meta}</span>
      </div>
      <div style={{ padding: '12px 13px' }}>{children}</div>
    </div>
  );
}

function AttRow({ dot, label, note, right, primary, muted }: Row) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 9, padding: '7px 9px', borderRadius: 8,
      background: primary ? 'rgba(59,130,246,0.06)' : PAPER_2,
      border: primary ? '1px solid rgba(59,130,246,0.2)' : '1px solid transparent',
      opacity: muted ? 0.65 : 1,
    }}>
      <span style={{ width: 9, height: 9, borderRadius: '50%', background: dotColor(dot), flex: '0 0 auto' }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11.5, fontWeight: 600, color: INK, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
        <div style={{ fontSize: 10, color: SLATE_500 }}>{note}</div>
      </div>
      <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11.5, fontWeight: 700, color: INK }}>{right}</span>
    </div>
  );
}

function AttMaintenance() {
  const ticks = [
    { mi: '55k', done: true }, { mi: '60k', done: true },
    { mi: '64k', now: true }, { mi: '65k', due: true }, { mi: '75k' }, { mi: '80k' },
  ];
  return (
    <AttShell title="Maintenance schedule" meta="8 tracked">
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 2px 2px' }}>
        <div style={{ position: 'absolute', left: 5, right: 5, top: 6, height: 2, background: LINE }} />
        <div style={{ position: 'absolute', left: 5, width: '40%', top: 6, height: 2, background: `linear-gradient(90deg,${OK},${BLUE})` }} />
        {ticks.map((t, i) => (
          <div key={i} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, zIndex: 1 }}>
            <span style={{
              width: t.now ? 13 : 11, height: t.now ? 13 : 11, borderRadius: '50%',
              background: t.now ? BLUE : t.done ? OK : t.due ? WARN : '#fff',
              border: t.now ? '3px solid #fff' : t.done || t.due ? 'none' : `2px solid ${LINE}`,
              boxShadow: t.now ? `0 0 0 2px ${BLUE}` : 'none',
            }} />
            <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 8.5, color: t.now ? BLUE : t.due ? '#92400E' : SLATE_400, fontWeight: t.now || t.due ? 700 : 400 }}>{t.mi}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 12 }}>
        <AttRow dot="crit" label="Brake fluid flush" note="1 yr overdue" right="$140" />
        <AttRow dot="warn" label="Engine oil & filter" note="in 782 mi" right="$78" primary />
        <AttRow dot="ok" label="Spark plugs" note="done @ 60,120" right="✓" muted />
      </div>
    </AttShell>
  );
}

function AttIssues() {
  const rows: Row[] = [
    { dot: 'crit', label: 'Driveshaft U-joint', note: '~14% at 60k+', right: '$890' },
    { dot: 'crit', label: 'EPS rack failure', note: 'recall S19', right: '$1,950' },
    { dot: 'warn', label: 'OEM radiator', note: '~6%', right: '$480' },
  ];
  return (
    <AttShell title="4 known issues" meta="filtered to your trim">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {rows.map((r, i) => <AttRow key={i} {...r} />)}
      </div>
      <div style={{ marginTop: 9, fontSize: 10.5, color: SLATE_500 }}>Ranked by your mileage</div>
    </AttShell>
  );
}

function AttRecalls() {
  return (
    <AttShell title="Live recall feed" meta="NHTSA · synced today" live>
      <div style={{ background: '#FEF6E7', border: '1px solid rgba(180,83,9,0.25)', borderRadius: 10, padding: '11px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11, fontWeight: 700, color: '#92400E', background: '#fff', padding: '2px 7px', borderRadius: 4, border: '1px solid rgba(180,83,9,0.3)' }}>S19</span>
          <span style={{ fontSize: 9, fontWeight: 700, color: '#fff', background: '#B45309', padding: '2px 7px', borderRadius: 999, letterSpacing: '0.04em' }}>OPEN</span>
          <span style={{ marginLeft: 'auto', fontSize: 10, color: '#92400E' }}>free fix</span>
        </div>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: INK, marginTop: 8, lineHeight: 1.3 }}>Electronic power steering may lose assist</div>
        <div style={{ fontSize: 10.5, color: '#92400E', marginTop: 3 }}>Steering gear · free dealer repair</div>
      </div>
      <button style={{ width: '100%', marginTop: 9, padding: '9px 0', background: INK, color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
        Book the free repair
      </button>
    </AttShell>
  );
}

function AttDiagnose() {
  return (
    <div style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 14, boxShadow: '0 18px 40px rgba(11,18,32,0.12)', overflow: 'hidden' }}>
      <div style={{ padding: '10px 13px', borderBottom: `1px solid ${LINE}`, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: INK }}>Photo diagnosis</span>
        <span style={{ marginLeft: 'auto', fontSize: 10, color: SLATE_400 }}>94% confidence</span>
      </div>
      <div style={{ position: 'relative', height: 132, background: 'linear-gradient(135deg,#1f2733,#0B1220)' }}>
        <svg width="100%" height="100%" viewBox="0 0 300 132" style={{ position: 'absolute', inset: 0, opacity: 0.45 }}>
          <path d="M20 100 Q70 55 130 75 T290 50" stroke="rgba(255,255,255,0.12)" strokeWidth="11" fill="none" />
          <rect x="44" y="34" width="76" height="48" rx="6" fill="rgba(255,255,255,0.06)" />
          <rect x="165" y="62" width="96" height="36" rx="6" fill="rgba(255,255,255,0.06)" />
        </svg>
        <div style={{ position: 'absolute', left: 104, top: 50, width: 28, height: 28, borderRadius: '50%', border: `2px solid ${BLUE}`, background: 'rgba(59,130,246,0.25)', boxShadow: '0 0 0 6px rgba(59,130,246,0.15)' }} />
        <div style={{ position: 'absolute', left: 138, top: 42, background: 'rgba(11,18,32,0.92)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '5px 9px' }}>
          <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 9, color: BLUE, fontWeight: 700 }}>OIL FILTER HOUSING</div>
          <div style={{ fontSize: 11, color: '#fff', fontWeight: 600 }}>Gasket weep</div>
        </div>
      </div>
      <div style={{ padding: '10px 13px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: WARN }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600 }}>Not urgent · plan a gasket</div>
          <div style={{ fontSize: 10.5, color: SLATE_500 }}>Exact part + where to buy, saved</div>
        </div>
        <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12.5, fontWeight: 700 }}>~$340</span>
      </div>
    </div>
  );
}

function AttDrive() {
  return (
    <div style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 14, boxShadow: '0 18px 40px rgba(11,18,32,0.12)', overflow: 'hidden' }}>
      <div style={{ padding: '10px 13px', borderBottom: `1px solid ${LINE}`, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: INK }}>Drive · car-aware route</span>
        <span style={{ marginLeft: 'auto', fontSize: 10, color: SLATE_400 }}>pre-trip checked</span>
      </div>
      <div style={{ position: 'relative', height: 118, background: '#F2EEE3' }}>
        <svg width="100%" height="100%" viewBox="0 0 300 118" style={{ position: 'absolute', inset: 0 }}>
          <g stroke="#E2DBC7" strokeWidth="1"><path d="M0 38 H300 M0 82 H300 M80 0 V118 M195 0 V118" /></g>
          <path d="M30 100 C72 80 96 62 150 52 S232 24 268 16" stroke={BLUE} strokeWidth="4" fill="none" strokeLinecap="round" />
          <circle cx="268" cy="16" r="5" fill={BLUE} />
          <circle cx="30" cy="100" r="6" fill="#fff" stroke={BLUE} strokeWidth="3" />
        </svg>
        <div style={{ position: 'absolute', left: 10, bottom: 10, right: 10, background: 'rgba(255,255,255,0.95)', border: `1px solid ${LINE}`, borderRadius: 9, padding: '7px 10px', fontSize: 10.5, color: '#334155', fontWeight: 500 }}>
          Range covers it · +1 fuel stop
        </div>
      </div>
      <div style={{ padding: '10px 13px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 15, fontWeight: 700 }}>2h 14m</span>
        <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11, color: SLATE_500 }}>· 138 mi</span>
        <span style={{ marginLeft: 'auto', fontSize: 10.5, color: OK, fontWeight: 600 }}>✓ Pre-trip OK</span>
      </div>
    </div>
  );
}

type View = { id: string; eyebrow: string; accent: string; prompt: string; reply: React.ReactNode; Att: () => React.ReactNode; hasPhoto?: boolean };

const EXTRA_VIEWS: View[] = [
  {
    id: 'diagnose', eyebrow: 'PHOTO & VIDEO DIAGNOSIS', accent: BLUE,
    prompt: 'Snapped this under the hood — what is it?',
    reply: <>That&apos;s a weep at the <b>oil filter housing</b>. Not urgent — here&apos;s the exact gasket and where to buy it.</>,
    Att: AttDiagnose, hasPhoto: true,
  },
  {
    id: 'recalls', eyebrow: 'LIVE RECALLS', accent: '#B45309',
    prompt: 'Any open recalls on my car?',
    reply: <>Yes — <b>recall S19</b> is open on your EPS rack. It&apos;s a free dealer fix. Want me to book it?</>,
    Att: AttRecalls,
  },
  {
    id: 'drive', eyebrow: 'CAR-AWARE DRIVE', accent: OK,
    prompt: 'Plan me a weekend run up the coast.',
    reply: <>138 miles, ~2h 14m. Your range covers it with one fuel stop — and your pre-trip check is clear.</>,
    Att: AttDrive,
  },
];

export function LiveHubDemo({ vehicleName = '2015 Dodge Challenger SRT 392', mileage = '64,218 mi', interval = 4600 }: {
  vehicleName?: string;
  mileage?: string;
  interval?: number;
}) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);
  const n = EXTRA_VIEWS.length + 1; // view 0 = loaded hub, 1..3 = capability demos

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % n), interval);
    return () => clearInterval(t);
  }, [paused, interval, n]);

  useEffect(() => { if (feedRef.current) feedRef.current.scrollTop = 0; }, [idx]);

  const v = idx === 0 ? null : EXTRA_VIEWS[idx - 1];

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{
        width: '100%', maxWidth: 408, height: 600, background: PAPER, borderRadius: 16, overflow: 'hidden',
        border: `1px solid ${LINE}`, boxShadow: '0 40px 90px rgba(0,0,0,0.45)', display: 'flex', flexDirection: 'column',
      }}
    >
      <style>{`
        @keyframes au7oDemoPulse { 0%,100% { opacity: 1 } 50% { opacity: 0.35 } }
        .au7o-demo-pulse { animation: au7oDemoPulse 1.8s ease-in-out infinite; }
        @keyframes au7oDemoFade { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: none } }
        .au7o-demo-fade { animation: au7oDemoFade .4s ease both; }
      `}</style>

      {/* window chrome */}
      <div style={{ height: 38, display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', borderBottom: `1px solid ${LINE}`, background: 'rgba(255,255,255,0.6)', flex: '0 0 auto' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {['#ef4444', '#f59e0b', '#10b981'].map((c) => <span key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.7 }} />)}
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <span style={{ fontSize: 11, color: SLATE_500, fontFamily: 'ui-monospace, monospace' }}>🔒 au7o.io</span>
        </div>
        <div style={{ width: 42 }} />
      </div>

      {/* vehicle context strip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: `1px solid ${LINE}`, background: 'rgba(255,255,255,0.4)', flex: '0 0 auto' }}>
        <span aria-hidden style={{ width: 34, height: 34, borderRadius: 9, background: INK, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flex: '0 0 auto' }}>🚗</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{vehicleName}</div>
          <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 10, color: SLATE_500 }}>{mileage}</div>
        </div>
        <span style={{ fontSize: 9, fontWeight: 700, color: BLUE, background: 'rgba(59,130,246,0.1)', padding: '3px 8px', borderRadius: 999, letterSpacing: '0.04em' }}>AI HUB</span>
      </div>

      {/* feed */}
      <div ref={feedRef} style={{ flex: 1, overflow: 'auto', padding: '14px 16px 8px', display: 'flex', flexDirection: 'column', gap: 13 }}>
        {idx === 0 ? (
          <div key="open" className="au7o-demo-fade" style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="au7o-demo-pulse" style={{ width: 7, height: 7, borderRadius: '50%', background: BLUE }} />
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', color: BLUE }}>WELCOME BACK · HERE&apos;S YOUR CAR</span>
            </div>
            <HubBubble>
              You&apos;re at <b style={{ fontFamily: 'ui-monospace, monospace' }}>{mileage}</b>. Two services are coming up and your brake fluid&apos;s overdue — and I&apos;m tracking <b>4 known issues</b> for this trim.
            </HubBubble>
            <AttMaintenance />
            <HubBubble>Here&apos;s what&apos;s worth watching at your mileage — one is covered by an <b>open recall</b>:</HubBubble>
            <AttIssues />
          </div>
        ) : v ? (
          <>
            <div key={v.id + '-eb'} className="au7o-demo-fade" style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: v.accent }} />
              <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em', color: SLATE_500 }}>{v.eyebrow}</span>
            </div>
            <div key={v.id + '-u'} className="au7o-demo-fade" style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ background: BLUE, color: '#fff', borderRadius: 14, borderTopRightRadius: 4, padding: '8px 13px', fontSize: 12.5, lineHeight: 1.45, maxWidth: 260, fontWeight: 500 }}>
                {v.hasPhoto && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, padding: '5px 7px', background: 'rgba(255,255,255,0.18)', borderRadius: 7 }}>
                    <span style={{ fontSize: 12 }}>📷</span>
                    <span style={{ fontSize: 10.5, fontWeight: 600 }}>engine-bay.jpg</span>
                  </div>
                )}
                {v.prompt}
              </div>
            </div>
            <div key={v.id + '-a'} className="au7o-demo-fade" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <HubBubble>{v.reply}</HubBubble>
              {v.Att()}
            </div>
          </>
        ) : null}
      </div>

      {/* dots */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px 0', flex: '0 0 auto' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {Array.from({ length: n }).map((_, i) => (
            <button key={i} onClick={() => setIdx(i)} aria-label={`View ${i + 1}`} style={{
              height: 6, borderRadius: 999, border: 'none', cursor: 'pointer', padding: 0,
              width: i === idx ? 24 : 6, background: i === idx ? INK : '#CBD5E1', transition: 'width .3s ease, background .3s ease',
            }} />
          ))}
        </div>
        <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 10.5, color: SLATE_400, marginLeft: 'auto' }}>
          {idx === 0 ? 'your hub' : 'live demo'} · {String(idx + 1).padStart(2, '0')}/{String(n).padStart(2, '0')}
        </span>
      </div>

      {/* composer (pinned) */}
      <div style={{ flex: '0 0 auto', padding: '10px 14px 14px' }}>
        <div style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 14, boxShadow: '0 8px 24px rgba(11,18,32,0.08)', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 13.5, color: SLATE_400 }}>Ask Au7o anything about your car…</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {['📎 Attach', '📷 Photo', '🎙 Voice'].map((c) => (
                <span key={c} style={{ padding: '4px 9px', background: PAPER_2, border: `1px solid ${LINE}`, borderRadius: 999, fontSize: 11, color: SLATE_500, fontWeight: 500 }}>{c}</span>
              ))}
            </div>
            <span style={{ padding: '7px 12px', background: INK, color: '#fff', borderRadius: 8, fontSize: 12.5, fontWeight: 500 }}>Send</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function HubBubble({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <span aria-hidden style={{ width: 26, height: 26, borderRadius: 8, background: BLUE, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, marginTop: 2, flex: '0 0 auto', fontWeight: 700 }}>A</span>
      <div style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 14, borderTopLeftRadius: 4, padding: '10px 13px', fontSize: 12.5, lineHeight: 1.5, color: INK, boxShadow: '0 1px 2px rgba(11,18,32,0.04)' }}>
        {children}
      </div>
    </div>
  );
}
