'use client';

import Link from 'next/link';
import { useState } from 'react';
import { HeroReserveForm, HeroReserveMeta } from './HeroReserveForm';
import { RotatingTwinStage } from './RotatingTwinStage';
import { DEFAULT_TWIN_ID, resolveDemoVehicleTwin, type VehicleTwinCatalogEntry } from '@/lib/vehicle-twin-catalog';

/**
 * Homepage hero — direction 1 "Split" from `design/au7o (6)`.
 *
 * Ported from the standalone design bundle (HeroSplit + HHEyebrow/HHHeadline/
 * HHSub/HHStats/HHReserve). Two deliberate departures from the design file:
 *
 *   • The design's HHNav is dropped — that was chrome so the standalone file
 *     could stand alone. The real homepage already has navigation, and shipping
 *     both would give the page two navs.
 *   • The design's 12 directions and Tweaks panel are dropped. Only `split`
 *     ships, so the tweak values are frozen here as the defaults from the
 *     bundle's HERO_TWEAK_DEFAULTS rather than carried as live state.
 *
 * The car stage ("playground") is passed in as `stage` — see TwinStageSlot.
 */

// "Photo-first / no part names needed" removed at Devon's call — it described a
// different product surface (vision) than the one this page is selling.
//
// The issue count is passed in from the live DB total where available rather
// than baked in, so it can't drift from reality as the catalogue grows.
const statsFor = (issueCount?: number) => [
  { v: issueCount ? `${issueCount.toLocaleString()}+` : '6,268+', l: 'known issues documented' },
  { v: '7 days', l: 'free when it opens' },
  { v: '$14.99', l: 'per month after' },
];

const COPY = {
  eyebrow: 'Coming soon · the Au7o tech tree',
  headline: "Know your car's weak spots.",
  subcopy: 'Click any part of the car and Au7o opens its tech tree — every component underneath it, what it costs, and which one is documented to fail at your mileage. No part names required.',
  ctaLabel: 'Reserve my spot',
  priceNote: '7 days free, then $14.99/mo',
  // The honest pitch: nothing is built yet, this is a 30-day demand test, and a
  // reservation is a vote. Saying so outright beats implying the feature exists —
  // and it gives a reason to act now instead of "maybe later", which is the
  // whole job of this card.
  windowNote: "We're gauging interest in this for the next 30 days.",
  photoNote: 'If you want it, reserve your spot — tell us your year, make, model and trim, and we build the cars people ask for first.',
  miles: 65000,
};

function Eyebrow() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div className="au7o-pulse-soft" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--au7o-blue)' }} />
      <span className="eyebrow" style={{ color: 'var(--au7o-blue)' }}>{COPY.eyebrow}</span>
    </div>
  );
}

/** The design greys the last two words of the headline. */
function Headline({ size = 52 }: { size?: number }) {
  const fs = `clamp(${Math.round(size * 0.58)}px, ${(size / 10.2).toFixed(1)}vw, ${size}px)`;
  const words = COPY.headline.split(' ');
  const tail = words.slice(-2).join(' ');
  const head = words.slice(0, -2).join(' ');
  return (
    <h1 style={{ fontSize: fs, fontWeight: 600, letterSpacing: '-0.035em', lineHeight: 1.03, textWrap: 'balance', color: 'var(--ink)' }}>
      {head} <span style={{ color: 'var(--slate-400)' }}>{tail}</span>
    </h1>
  );
}

/** Desktop: cards beside the headline. Hidden on mobile — see StatsInline. */
function Stats({ stats }: { stats: ReturnType<typeof statsFor> }) {
  return (
    <div className="hero-stat-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(136px,1fr))', gap: 10, flexWrap: 'wrap' }}>
      {stats.map((s) => (
        <div key={s.l} style={{ padding: '13px 15px', borderRadius: 16, background: '#fff', border: '1px solid var(--paper-line)', boxShadow: 'var(--shadow-1)' }}>
          <div className="mono" style={{ fontSize: s.v.length > 8 ? 13.5 : 17, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ink)' }}>{s.v}</div>
          <div style={{ fontSize: 10.5, color: 'var(--slate-500)', marginTop: 3, lineHeight: 1.35 }}>{s.l}</div>
        </div>
      ))}
    </div>
  );
}

/**
 * Mobile: the same facts as one inline text line, sitting between the car and
 * the reserve form. Cards cost four boxes of vertical space on a phone and push
 * the reservation — the thing this page exists to collect — below the fold.
 */
function StatsInline({ stats }: { stats: ReturnType<typeof statsFor> }) {
  return (
    <div
      className="hero-stat-inline"
      style={{ fontSize: 12.5, lineHeight: 1.6, color: 'var(--slate-700)', textAlign: 'center', textWrap: 'pretty' }}
    >
      {stats.map((s, i) => (
        <span key={s.l}>
          {i > 0 && <span style={{ color: 'var(--slate-400)', margin: '0 7px' }}>·</span>}
          <strong style={{ color: 'var(--ink)', fontWeight: 600 }}>{s.v}</strong> {s.l}
        </span>
      ))}
    </div>
  );
}

/**
 * The reserve block: the demand test on the left, the no-account demo on the
 * right. Both live directly under the stage, which is where the design puts the
 * commitment — after someone has actually touched the car.
 */
export const demoHubHref = (vehicleId: string) => `/demo/hub?vehicle=${encodeURIComponent(vehicleId)}`;

function Reserve({ selectedTwin }: { selectedTwin: VehicleTwinCatalogEntry }) {
  const demoDescription = selectedTwin.demoMileage == null
    ? `${selectedTwin.identity.year} ${selectedTwin.identity.make} ${selectedTwin.identity.model}. Visual structure preview; service evidence unavailable.`
    : `${selectedTwin.identity.year} ${selectedTwin.identity.make} ${selectedTwin.identity.model} at ${selectedTwin.demoMileage.toLocaleString()} mi. No account.`;
  return (
    <div id="reserve" style={{ display: 'flex', gap: 11, flexWrap: 'wrap' }}>
      <div style={{ flex: '1 1 380px', minWidth: 0, padding: '15px 16px', borderRadius: 16, border: '1px solid var(--paper-line)', background: '#fff', boxShadow: 'var(--shadow-1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--au7o-blue-50, #EFF5FF)', color: 'var(--au7o-blue)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
            </svg>
          </span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--ink)' }}>Reserve your spot</div>
            <div style={{ fontSize: 12, marginTop: 2, textWrap: 'pretty', lineHeight: 1.5 }}>
              <span style={{ color: 'var(--ink)', fontWeight: 600 }}>{COPY.windowNote}</span>{' '}
              <span style={{ color: 'var(--slate-500)' }}>{COPY.photoNote}</span>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <HeroReserveForm source="hero" ctaLabel={COPY.ctaLabel} wide />
          <HeroReserveMeta priceNote={COPY.priceNote} />
        </div>
      </div>

      <div style={{ flex: '1 1 260px', minWidth: 0, display: 'flex', alignItems: 'center', gap: 13, padding: '15px 16px', borderRadius: 16, border: '1px solid var(--paper-line)', background: '#fff', boxShadow: 'var(--shadow-1)' }}>
        <span style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--paper-2, #F4F1EA)', color: 'var(--slate-500)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 17h14M5 17a2 2 0 0 1-2-2v-3l2-5h14l2 5v3a2 2 0 0 1-2 2M7 17v2M17 17v2" />
          </svg>
        </span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--ink)' }}>Or poke around ours</div>
          <div style={{ fontSize: 12, color: 'var(--slate-500)', marginTop: 2 }}>{demoDescription}</div>
        </div>
        <Link
          href={demoHubHref(selectedTwin.id)}
          aria-label={`See the ${selectedTwin.identity.model} full hub`}
          style={{ background: '#fff', color: 'var(--ink)', border: '1px solid var(--paper-line)', borderRadius: 11, padding: '9px 14px', fontSize: 12.5, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0 }}
        >
          See full hub
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M9 18l6-6-6-6" /></svg>
        </Link>
      </div>
    </div>
  );
}

export function TwinHero({ stage, issueCount }: { stage?: React.ReactNode; issueCount?: number }) {
  const stats = statsFor(issueCount);
  const [selectedTwinId, setSelectedTwinId] = useState(DEFAULT_TWIN_ID);
  const selectedTwin = resolveDemoVehicleTwin(selectedTwinId);
  return (
    <div className="twin-surface" style={{ background: 'var(--paper)', color: 'var(--ink)' }}>
      <main style={{ maxWidth: 1240, margin: '0 auto', padding: '24px clamp(20px,5vw,56px) 60px', display: 'flex', flexDirection: 'column', gap: 26 }}>
        <div style={{ display: 'flex', gap: 34, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 440px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Eyebrow />
            <Headline />
            <p style={{ fontSize: 'clamp(14.5px,1.5vw,16.5px)', lineHeight: 1.55, color: 'var(--slate-700)', maxWidth: 560, textWrap: 'pretty' }}>
              {COPY.subcopy}
            </p>
          </div>
          <div style={{ flex: '0 1 300px' }}><Stats stats={stats} /></div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {stage ?? <RotatingTwinStage onSelectedVehicleChange={setSelectedTwinId} />}
          {/* Mobile only: stats as text, between the car and the reserve form. */}
          <StatsInline stats={stats} />
          <Reserve selectedTwin={selectedTwin} />
        </div>
      </main>
    </div>
  );
}
