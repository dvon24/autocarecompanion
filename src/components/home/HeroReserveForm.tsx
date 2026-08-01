'use client';

import { useEffect, useState } from 'react';
import { trackEvent } from '@/components/analytics/GoogleAnalytics';

/**
 * The hero's reservation form — the demand test for the Vehicle Twin.
 *
 * Ported from `design/au7o (6)` (HHReserveForm). The design's version was a
 * stub that only flipped a local `done` flag; this one posts to
 * /api/reservation. Field order, placeholders, and the US-only notice are kept
 * exactly as designed — country is required because paid plans are US-only at
 * launch while tax registration is pending, and people deserve to know that
 * BEFORE they commit rather than after.
 */

const COUNTRIES = ['United States','Canada','United Kingdom','Australia','New Zealand','Ireland','Germany','France','Netherlands','Belgium','Spain','Portugal','Italy','Switzerland','Austria','Sweden','Norway','Denmark','Finland','Poland','Czechia','Romania','Greece','Turkey','Mexico','Brazil','Argentina','Chile','Colombia','Peru','Puerto Rico','South Africa','Nigeria','Kenya','Egypt','United Arab Emirates','Saudi Arabia','Israel','India','Pakistan','Philippines','Indonesia','Malaysia','Singapore','Thailand','Vietnam','Japan','South Korea','China','Hong Kong','Taiwan','Other'];

export function HeroReserveForm({
  source,
  ctaLabel = 'Reserve my spot',
  dark,
  wide,
  glass,
}: {
  /** "hero" | "demo" — the placement being demand-tested. */
  source: string;
  ctaLabel?: string;
  dark?: boolean;
  wide?: boolean;
  glass?: boolean;
}) {
  const [vehicle, setVehicle] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  const onGlass = dark || glass;
  const field: React.CSSProperties = {
    minWidth: 0,
    background: onGlass ? 'rgba(255,255,255,.09)' : '#fff',
    border: `1px solid ${onGlass ? 'rgba(255,255,255,.22)' : 'var(--paper-line)'}`,
    borderRadius: 12,
    padding: '12px 14px',
    fontSize: 14,
    color: onGlass ? '#fff' : 'var(--ink)',
    fontFamily: 'var(--font-sans)',
    outline: 'none',
  };
  const usOnly = country !== '' && country !== 'United States';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@') || email.length > 320 || !country) {
      setState('error');
      return;
    }
    setState('loading');
    let path = '';
    try { path = window.location.pathname + window.location.search; } catch { /* SSR */ }
    try {
      const res = await fetch('/api/reservation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), vehicle, country, source, path }),
      });
      if (res.ok) {
        setState('done');
        try { localStorage.setItem('au7o.twinReservation', 'done'); } catch { /* private mode */ }
        try { trackEvent('twin_reservation', { source, country }); } catch { /* analytics best-effort */ }
      } else {
        setState('error');
      }
    } catch {
      setState('error');
    }
  };

  if (state === 'done') {
    return (
      <div
        style={{
          display: 'flex', alignItems: 'flex-start', gap: 8, padding: '12px 14px', borderRadius: 12,
          background: onGlass ? 'rgba(255,255,255,.09)' : '#ECFDF5',
          border: `1px solid ${onGlass ? 'rgba(255,255,255,.22)' : '#A7F3D0'}`,
          color: onGlass ? '#fff' : '#065F46', fontSize: 13, lineHeight: 1.5,
          width: wide ? '100%' : undefined,
        }}
      >
        <span aria-hidden style={{ marginTop: 1 }}>✓</span>
        {/* Deliberately does NOT promise the feature ships. Nothing is built yet —
            this page is measuring whether enough people want it to justify
            building it, and the confirmation has to say that honestly. */}
        <span>
          <strong>You&apos;re on the list.</strong> We&apos;re still gauging interest before
          we build this{vehicle ? `, and the ${vehicle} is now a vote for that car` : ''}.
          If it goes ahead, you&apos;ll hear from us first. No spam, unsubscribe anytime.
        </span>
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 8, width: wide ? '100%' : undefined }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input
          type="text" required placeholder="2015 Dodge Challenger SRT 392" aria-label="Year, make, model and trim"
          value={vehicle} onChange={(e) => setVehicle(e.target.value)} disabled={state === 'loading'}
          style={{ ...field, flex: wide ? '1 1 100%' : '1 1 190px' }}
        />
        <input
          type="email" required placeholder="you@email.com" aria-label="Email" inputMode="email" autoComplete="email"
          value={email} onChange={(e) => { setEmail(e.target.value); if (state === 'error') setState('idle'); }}
          disabled={state === 'loading'}
          style={{ ...field, flex: wide ? '1 1 200px' : '1 1 190px' }}
        />
        <select
          required value={country} onChange={(e) => setCountry(e.target.value)} aria-label="Country"
          disabled={state === 'loading'}
          style={{
            ...field, flex: wide ? '1 1 160px' : '1 1 150px', cursor: 'pointer',
            color: country ? (onGlass ? '#fff' : 'var(--ink)') : (onGlass ? 'rgba(255,255,255,.55)' : 'var(--slate-400)'),
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23${onGlass ? 'ffffff' : '8A9099'}' stroke-width='1.6' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: 30,
          }}
        >
          <option value="" disabled>Country</option>
          {COUNTRIES.map((c) => <option key={c} value={c} style={{ color: 'var(--ink)' }}>{c}</option>)}
        </select>
        <button
          type="submit" disabled={state === 'loading'}
          style={{ background: '#3B82F6', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)', flexShrink: 0 }}
        >
          {state === 'loading' ? '…' : ctaLabel}
        </button>
      </div>

      {usOnly && (
        <div style={{ fontSize: 11.5, lineHeight: 1.45, color: onGlass ? 'rgba(255,255,255,.7)' : 'var(--slate-500)', textWrap: 'pretty' }}>
          Heads up — paid plans are US-only at launch while we sort tax registration.
          You&apos;ll get the free tier in {country} and first notice when billing opens there.
        </div>
      )}

      {state === 'error' && (
        <div style={{ fontSize: 11.5, color: onGlass ? '#FCA5A5' : '#B91C1C' }}>
          Enter a valid email and pick your country, then try again.
        </div>
      )}
    </form>
  );
}

/**
 * "7 days free, then $14.99/mo · N reserved".
 *
 * The design hard-codes 1,204 reserved. We fetch the real count and render the
 * counter only once it clears the API's threshold — an invented number is the
 * one thing on this page a visitor could catch us lying about.
 */
export function HeroReserveMeta({ dark, center, priceNote = '7 days free, then $14.99/mo' }: { dark?: boolean; center?: boolean; priceNote?: string }) {
  const [reserved, setReserved] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    fetch('/api/reservation/count')
      .then((r) => r.json())
      .then((d) => { if (alive && d?.show) setReserved(d.count); })
      .catch(() => { /* the counter is optional chrome — never block the hero */ });
    return () => { alive = false; };
  }, []);

  const dim = dark ? 'rgba(255,255,255,.6)' : 'var(--slate-500)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap', justifyContent: center ? 'center' : 'flex-start', fontSize: 12, color: dim }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontWeight: 600, color: dark ? '#8FDDF7' : '#0E9F6E' }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M20 6L9 17l-5-5" />
        </svg>
        {priceNote}
      </span>
      {reserved !== null && (
        <>
          <span style={{ opacity: .5 }}>·</span>
          <span className="mono">{reserved.toLocaleString()} reserved</span>
        </>
      )}
    </div>
  );
}
