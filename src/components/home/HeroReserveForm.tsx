'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { trackEvent } from '@/components/analytics/GoogleAnalytics';
import { RESERVATION_COUNTRIES, composeVehicle } from '@/lib/reservation';
import { loadYmmt } from '@/lib/load-ymmt';
import { getTransmissionOptions, type TransmissionChoice } from '@/lib/transmission-options';
import { getLiveTwinForVehicle } from '@/lib/twin-fulfillment';

/**
 * The hero's reservation form — the demand test for the Vehicle Twin.
 *
 * Ported from `design/au7o (6)` (HHReserveForm). The design's version was a
 * stub that only flipped a local `done` flag; this one posts to
 * /api/reservation. Field order, placeholders, and the US-only notice are kept
 * exactly as designed — country is required because paid plans are US-only at
 * launch while tax registration is pending, and people deserve to know that
 * BEFORE they commit rather than after.
 *
 * The vehicle is a cascading Year → Make → Model → Trim picker rather than the
 * original free-text box, because the maintenance schedule keys off exactly
 * those four values. "2025 nissan kicks" reads fine to a human and is useless
 * to a schedule: no trim means no capacity, no interval, no fitment.
 *
 * Trim is always OFFERED but never required, and never flagged as a missing
 * field. Where the catalog lists trims you pick one (or "Not listed…"); where
 * it lists none, a text box appears. A typed trim is kept and stored with
 * `trimVerified: false` — an owner who knows they have an SV is worth more
 * than a blank, and the flag stops the schedule treating their word as a
 * confirmed fitment. An owner who does not know is left alone: a wrong trim
 * is worse than a missing one, because a missing one we can still ask about.
 *
 * Free text for the whole vehicle is still reachable behind "enter it
 * manually" — for kit cars, imports, and anything ymmt.json has not heard of —
 * and those rows carry `vehicleVerified: false` for the same reason.
 *
 * Prefill: the launch email links each recipient to /?make=X&model=Y, taken
 * from the make and model they already gave us at known-issues signup. They
 * land with make and model filled, leaving one required field on the vehicle
 * (year) plus email and country — which is what the red gap markers point at.
 */

type Ymmt = Record<string, Record<string, Record<string, string[]>>>;

/** Sentinel for "my trim isn't in this list", which reveals the text box. */
const TRIM_OTHER = '__other__';

/** Case/spacing-tolerant lookup, so a link param matches the catalog's casing. */
function canon(s: string): string {
  return s.trim().toLowerCase().replace(/[\s_-]+/g, ' ');
}
function matchKey(keys: string[], wanted: string | null): string {
  if (!wanted) return '';
  const target = canon(wanted);
  return keys.find((k) => canon(k) === target) ?? '';
}

/**
 * `window.location.search`, read without a hydration mismatch.
 *
 * The homepage is statically rendered, so the server has no query string. A
 * plain read during render would disagree with the server HTML, and reading it
 * in an effect means setState-in-effect. useSyncExternalStore is the sanctioned
 * shape: '' on the server, the real value on the client, React reconciles.
 * The subscribe is a no-op because the params cannot change without a
 * navigation that remounts this form.
 */
const NO_SEARCH = '';
const subscribeNever = () => () => {};
function useSearchString(): string {
  return useSyncExternalStore(
    subscribeNever,
    () => window.location.search,
    () => NO_SEARCH,
  );
}

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
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  const [ymmt, setYmmt] = useState<Ymmt | null>(null);
  const [ymmtFailed, setYmmtFailed] = useState(false);

  // Every vehicle field is "what the person picked, or null if they have not
  // touched it yet". The rendered value falls back to the prefill, so the link
  // fills the form without ever writing to state — which keeps the resolution
  // a pure derivation instead of an effect that races the catalog load.
  const [yearPick, setYearPick] = useState<string | null>(null);
  const [makePick, setMakePick] = useState<string | null>(null);
  const [modelPick, setModelPick] = useState<string | null>(null);
  const [trimPick, setTrimPick] = useState<string | null>(null);

  // Free-text escape hatch. Auto-engages if the catalog cannot be loaded at
  // all, so a failed fetch degrades to the old behaviour instead of a dead
  // form — the same principle load-ymmt.ts applies with its bundled fallback.
  const [manualPick, setManualPick] = useState<boolean | null>(null);
  const [manualVehiclePick, setManualVehiclePick] = useState<string | null>(null);

  // Typed trim, for the two cases the dropdown cannot cover: models the
  // catalog lists no trims for at all, and owners whose trim is missing from
  // the list. Trim is not cosmetic here — it decides oil capacity, interval
  // and fitment — so an unlisted one is worth capturing as text rather than
  // dropping. It is stored with trimVerified false so the schedule knows it
  // came from the owner, not the catalog.
  const [trimTextPick, setTrimTextPick] = useState<string | null>(null);
  const [transmission, setTransmission] = useState<TransmissionChoice | ''>('');

  // The catalog is ~1 MB and this form sits in the hero, which is the LCP
  // element on the page most of our search traffic lands on. It is therefore
  // NOT fetched on mount — only once someone shows intent by touching the
  // form, or immediately when a prefill link proves they arrived to use it.
  // Deliberately no "loading" flag: setting one is a synchronous state write
  // inside the mount effect below, which cascades a render for a spinner
  // nobody sees. The dropdowns simply fill in when the catalog lands — their
  // labels already read correctly while empty.
  const wantYmmt = useRef(false);

  const fetchYmmt = useCallback(() => {
    if (wantYmmt.current) return;
    wantYmmt.current = true;
    loadYmmt()
      .then((d) => setYmmt(d as unknown as Ymmt))
      // `manual` derives from ymmtFailed, so flagging the failure is enough to
      // swap the picker for the free-text box.
      .catch(() => setYmmtFailed(true));
  }, []);

  // Prefill from the query string. Read off window rather than useSearchParams
  // so this component never forces a Suspense bailout on the static homepage.
  const search = useSearchString();
  const params = useMemo(() => {
    const q = new URLSearchParams(search);
    const got = {
      year: q.get('year') ?? '',
      make: q.get('make') ?? '',
      model: q.get('model') ?? '',
      trim: q.get('trim') ?? '',
      vehicle: q.get('vehicle') ?? '',
    };
    const any = Boolean(got.year || got.make || got.model || got.trim || got.vehicle);
    return any ? got : null;
  }, [search]);

  // A prefill link is proof they came here to reserve, so the catalog is worth
  // fetching immediately rather than waiting for them to touch the form.
  useEffect(() => {
    if (params) fetchYmmt();
  }, [params, fetchYmmt]);

  // Every make in the catalog, and every model per make, unioned across years.
  // Needed because a prefill link carries make/model but no year, so the year
  // dropdown has to narrow to the years that actually offered that pairing.
  const index = useMemo(() => {
    const makes = new Set<string>();
    const modelsByMake = new Map<string, Set<string>>();
    if (ymmt) {
      for (const y of Object.keys(ymmt)) {
        for (const mk of Object.keys(ymmt[y] ?? {})) {
          makes.add(mk);
          let bucket = modelsByMake.get(mk);
          if (!bucket) { bucket = new Set(); modelsByMake.set(mk, bucket); }
          for (const md of Object.keys(ymmt[y][mk] ?? {})) bucket.add(md);
        }
      }
    }
    return { makes: [...makes].sort(), modelsByMake };
  }, [ymmt]);

  // Resolve the prefill against the catalog. Anything that does not resolve
  // drops to the manual box rather than being silently discarded — a link with
  // a model we have never heard of still has to leave the person able to
  // reserve.
  const resolved = useMemo(() => {
    const empty = { year: '', make: '', model: '', trim: '', trimText: '', manualVehicle: '', forceManual: false };
    if (!params || !ymmt) return empty;

    const mk = matchKey(index.makes, params.make);
    const md = mk ? matchKey([...(index.modelsByMake.get(mk) ?? [])], params.model) : '';
    const yr = matchKey(Object.keys(ymmt), params.year);
    // Only honour the year if it actually offered this make/model pairing.
    const year = yr && (!mk || !md || ymmt[yr]?.[mk]?.[md]) ? yr : '';
    const trim = year && mk && md ? matchKey(ymmt[year][mk][md] ?? [], params.trim) : '';
    // A link carrying a trim the catalog does not list still knows something
    // we do not. Keep it in the text box instead of throwing it away.
    const trimText = !trim && params.trim ? params.trim : '';

    // ?vehicle= is the loose form. We do not try to parse it into YMMT — a
    // guess there is exactly the wrong-trim failure this picker exists to
    // prevent — so it seeds the manual box only when nothing structured hit.
    if (!mk && !md && !year && params.vehicle) {
      return { ...empty, manualVehicle: params.vehicle, forceManual: true };
    }
    return { ...empty, year, make: mk, model: md, trim, trimText };
  }, [params, ymmt, index]);

  // What the form actually shows: the person's choice if they have made one,
  // otherwise whatever the link resolved to.
  const year = yearPick ?? resolved.year;
  const make = makePick ?? resolved.make;
  const model = modelPick ?? resolved.model;
  const trim = trimPick ?? resolved.trim;
  const manual = manualPick ?? (ymmtFailed || resolved.forceManual);
  const manualVehicle = manualVehiclePick ?? resolved.manualVehicle;
  const trimText = trimTextPick ?? resolved.trimText;

  const yearOptions = useMemo(() => {
    if (!ymmt) return [];
    const all = Object.keys(ymmt);
    const narrowed = make && model
      ? all.filter((y) => ymmt[y]?.[make]?.[model])
      : make
        ? all.filter((y) => ymmt[y]?.[make])
        : all;
    return narrowed.sort((a, b) => Number(b) - Number(a));
  }, [ymmt, make, model]);

  const makeOptions = useMemo(() => (
    year && ymmt?.[year] ? Object.keys(ymmt[year]).sort() : index.makes
  ), [ymmt, year, index.makes]);

  const modelOptions = useMemo(() => {
    if (!make) return [];
    if (year && ymmt?.[year]?.[make]) return Object.keys(ymmt[year][make]).sort();
    return [...(index.modelsByMake.get(make) ?? [])].sort();
  }, [ymmt, year, make, index.modelsByMake]);

  const trimOptions = useMemo(() => (
    year && make && model ? (ymmt?.[year]?.[make]?.[model] ?? []) : []
  ), [ymmt, year, make, model]);

  // Trim is where the schedule diverges — a ZL1 and an LT1 are the same model
  // year and do not take the same oil — so it is always offered. But it is
  // never REQUIRED and never marked as a gap: plenty of owners genuinely do
  // not know their trim, and some cars have only one. Demanding it would
  // either block those people or push them into guessing, and a wrong trim is
  // worse for the schedule than an absent one — an absent trim we can ask
  // about later, a wrong one we would trust.
  const hasCatalogTrims = trimOptions.length > 0;
  const vehiclePicked = Boolean(year && make && model);
  const usingTrimText = vehiclePicked && (!hasCatalogTrims || trim === TRIM_OTHER);
  const effectiveTrim = usingTrimText ? trimText.trim() : trim;
  const transmissionOptions = useMemo(() => getTransmissionOptions({
    year, make, model, trim: effectiveTrim,
  }), [year, make, model, effectiveTrim]);
  const needsTransmission = transmissionOptions.length > 1;
  const pickedComplete = vehiclePicked;
  const canSubmit = manual
    ? manualVehicle.trim().length > 0
    : pickedComplete && (!needsTransmission || Boolean(transmission));

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
  const selectField = (filled: boolean): React.CSSProperties => ({
    ...field,
    cursor: 'pointer',
    color: filled ? (onGlass ? '#fff' : 'var(--ink)') : (onGlass ? 'rgba(255,255,255,.55)' : 'var(--slate-400)'),
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23${onGlass ? 'ffffff' : '8A9099'}' stroke-width='1.6' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    paddingRight: 30,
  });
  /**
   * Red outline on the required boxes still waiting on an answer.
   *
   * Only once the form is "engaged" — a prefill link landed, they typed
   * something, or a submit failed. A cold, untouched form would otherwise
   * paint every box red on first paint, which reads as six errors before the
   * visitor has done anything. Engaged, it does the opposite: arriving from
   * the launch email with make and model already filled, the three that still
   * need them (year, email, country) are the only things marked.
   */
  const engaged = Boolean(params)
    || state === 'error'
    || yearPick !== null || makePick !== null || modelPick !== null || trimPick !== null
    || trimTextPick !== null || manualVehiclePick !== null || transmission !== ''
    || email !== '' || country !== '';
  const gapStyle: React.CSSProperties = {
    border: `1px solid ${onGlass ? '#FCA5A5' : '#DC2626'}`,
    boxShadow: onGlass ? '0 0 0 3px rgba(252,165,165,.16)' : '0 0 0 3px rgba(220,38,38,.10)',
  };
  /** Style + aria for a required control, marked only while it is empty. */
  const gap = (isEmpty: boolean) => (engaged && isEmpty
    ? { style: gapStyle, 'aria-invalid': true as const }
    : { style: undefined, 'aria-invalid': undefined });

  const linkish: React.CSSProperties = {
    background: 'none', border: 'none', padding: 0, cursor: 'pointer',
    fontSize: 11.5, fontFamily: 'var(--font-sans)', textDecoration: 'underline',
    color: onGlass ? 'rgba(255,255,255,.7)' : 'var(--slate-500)',
  };
  const usOnly = country !== '' && country !== 'United States';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const vehicle = manual ? manualVehicle.trim() : composeVehicle({ year, make, model, trim: effectiveTrim });
    if (!email.includes('@') || email.length > 254 || !vehicle || !country || !canSubmit) {
      setState('error');
      return;
    }
    setState('loading');
    let path = '';
    try { path = window.location.pathname + window.location.search; } catch { /* SSR */ }
    const verified = !manual && pickedComplete;
    try {
      const res = await fetch('/api/reservation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(), vehicle, country, source, path,
          year: verified ? Number(year) : null,
          make: verified ? make : null,
          model: verified ? model : null,
          trim: verified ? effectiveTrim || null : null,
          transmission: verified && needsTransmission ? transmission : null,
        }),
      });
      if (res.ok) {
        setState('done');
        try { localStorage.setItem('au7o.twinReservation', 'done'); } catch { /* private mode */ }
        try { trackEvent('twin_reservation', { source, country, verified }); } catch { /* analytics best-effort */ }
      } else {
        setState('error');
      }
    } catch {
      setState('error');
    }
  };

  if (state === 'done') {
    const shown = manual ? manualVehicle.trim() : composeVehicle({ year, make, model, trim: effectiveTrim });
    const liveTwin = !manual && getLiveTwinForVehicle({ year: Number(year), make, model, trim: effectiveTrim });
    return (
      <div
        role="status"
        aria-live="polite"
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
          <strong>You&apos;re on the list.</strong>{' '}
          {liveTwin
            ? `The ${shown} twin is live; we’ll email this address when your access is ready.`
            : `We’re still gauging interest before we build this${shown ? `, and the ${shown} is now a vote for that car` : ''}. If it goes ahead, you’ll hear from us first.`}
          {' '}No spam, unsubscribe anytime.
        </span>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      onPointerEnter={fetchYmmt}
      onFocusCapture={fetchYmmt}
      style={{ display: 'flex', flexDirection: 'column', gap: 8, width: wide ? '100%' : undefined }}
    >
      {manual ? (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            type="text" required placeholder="2015 Dodge Challenger SRT 392" aria-label="Year, make, model and trim"
            value={manualVehicle} onChange={(e) => { setManualVehiclePick(e.target.value); if (state === 'error') setState('idle'); }}
            disabled={state === 'loading'}
            maxLength={120}
            aria-invalid={gap(!manualVehicle.trim())['aria-invalid']}
            style={{ ...field, ...gap(!manualVehicle.trim()).style, flex: '1 1 100%' }}
          />
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <select
            required value={year} onChange={(e) => { setYearPick(e.target.value); setTrimPick(''); setTrimTextPick(''); setTransmission(''); if (state === 'error') setState('idle'); }}
            aria-label="Year" disabled={state === 'loading'}
            aria-invalid={gap(!year)['aria-invalid']}
            style={{ ...selectField(Boolean(year)), ...gap(!year).style, flex: '1 1 92px' }}
          >
            <option value="" disabled>Year</option>
            {yearOptions.map((y) => <option key={y} value={y} style={{ color: 'var(--ink)' }}>{y}</option>)}
          </select>
          <select
            required value={make} onChange={(e) => { setMakePick(e.target.value); setModelPick(''); setTrimPick(''); setTrimTextPick(''); setTransmission(''); if (state === 'error') setState('idle'); }}
            aria-label="Make" disabled={state === 'loading'}
            aria-invalid={gap(!make)['aria-invalid']}
            style={{ ...selectField(Boolean(make)), ...gap(!make).style, flex: '1 1 128px' }}
          >
            <option value="" disabled>Make</option>
            {makeOptions.map((m) => <option key={m} value={m} style={{ color: 'var(--ink)' }}>{m}</option>)}
          </select>
          <select
            required value={model} onChange={(e) => { setModelPick(e.target.value); setTrimPick(''); setTrimTextPick(''); setTransmission(''); if (state === 'error') setState('idle'); }}
            aria-label="Model" disabled={state === 'loading' || !make}
            aria-invalid={gap(Boolean(make) && !model)['aria-invalid']}
            style={{ ...selectField(Boolean(model)), ...gap(Boolean(make) && !model).style, flex: '1 1 132px' }}
          >
            <option value="" disabled>Model</option>
            {modelOptions.map((m) => <option key={m} value={m} style={{ color: 'var(--ink)' }}>{m}</option>)}
          </select>
          {hasCatalogTrims && (
            <select
              value={trim} onChange={(e) => { setTrimPick(e.target.value); setTransmission(''); if (state === 'error') setState('idle'); }}
              aria-label="Trim" disabled={state === 'loading'}
              style={{ ...selectField(Boolean(trim)), flex: '1 1 118px' }}
            >
              <option value="">Trim (optional)</option>
              {trimOptions.map((t) => <option key={t} value={t} style={{ color: 'var(--ink)' }}>{t}</option>)}
              <option value={TRIM_OTHER} style={{ color: 'var(--ink)' }}>Not listed…</option>
            </select>
          )}
          {usingTrimText && (
            <input
              type="text" aria-label="Trim"
              placeholder={hasCatalogTrims ? 'Type your trim' : 'Trim (optional)'}
              value={trimText} onChange={(e) => { setTrimTextPick(e.target.value); setTransmission(''); if (state === 'error') setState('idle'); }}
              disabled={state === 'loading'}
              maxLength={60}
              style={{ ...field, flex: '1 1 118px' }}
            />
          )}
          {!hasCatalogTrims && !vehiclePicked && (
            <select aria-label="Trim" disabled value="" style={{ ...selectField(false), flex: '1 1 118px' }}>
              <option value="">Trim (optional)</option>
            </select>
          )}
          {needsTransmission && (
            <select
              required
              value={transmission}
              onChange={(e) => { setTransmission(e.target.value as TransmissionChoice); if (state === 'error') setState('idle'); }}
              aria-label="Transmission"
              disabled={state === 'loading'}
              aria-invalid={gap(!transmission)['aria-invalid']}
              style={{ ...selectField(Boolean(transmission)), ...gap(!transmission).style, flex: '1 1 138px' }}
            >
              <option value="" disabled>Transmission</option>
              {transmissionOptions.map((option) => (
                <option key={option.value} value={option.value} style={{ color: 'var(--ink)' }}>{option.label}</option>
              ))}
            </select>
          )}
        </div>
      )}

      {usingTrimText && (
        <div style={{ fontSize: 11.5, lineHeight: 1.45, color: onGlass ? 'rgba(255,255,255,.7)' : 'var(--slate-500)', textWrap: 'pretty' }}>
          {hasCatalogTrims
            ? 'We’ll check this one by hand — trim drives the oil capacity and every service interval.'
            : 'We don’t have trims on file for this model yet. Add yours if you know it — it drives the oil capacity and every service interval.'}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input
          type="email" required placeholder="you@email.com" aria-label="Email" inputMode="email" autoComplete="email"
          value={email} onChange={(e) => { setEmail(e.target.value); if (state === 'error') setState('idle'); }}
          disabled={state === 'loading'}
          maxLength={254}
          aria-invalid={gap(!email.includes('@'))['aria-invalid']}
          style={{ ...field, ...gap(!email.includes('@')).style, flex: wide ? '1 1 200px' : '1 1 190px' }}
        />
        <select
          required value={country} onChange={(e) => setCountry(e.target.value)} aria-label="Country"
          disabled={state === 'loading'}
          aria-invalid={gap(!country)['aria-invalid']}
          style={{ ...selectField(Boolean(country)), ...gap(!country).style, flex: wide ? '1 1 160px' : '1 1 150px' }}
        >
          <option value="" disabled>Country</option>
          {RESERVATION_COUNTRIES.map((c) => <option key={c} value={c} style={{ color: 'var(--ink)' }}>{c}</option>)}
        </select>
        <button
          type="submit" disabled={state === 'loading'}
          style={{ background: '#3B82F6', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)', flexShrink: 0 }}
        >
          {state === 'loading' ? '…' : ctaLabel}
        </button>
      </div>

      {!ymmtFailed && (
        <button
          type="button"
          onClick={() => { setManualPick(!manual); if (state === 'error') setState('idle'); }}
          style={{ ...linkish, alignSelf: 'flex-start' }}
        >
          {manual ? 'Pick from the list instead' : "Can't find it? Enter it manually"}
        </button>
      )}

      {manual && (
        <div style={{ fontSize: 11.5, lineHeight: 1.45, color: onGlass ? 'rgba(255,255,255,.7)' : 'var(--slate-500)', textWrap: 'pretty' }}>
          We&apos;ll confirm this one by hand before building it — typed vehicles skip the
          fitment check that keeps the maintenance schedule accurate.
        </div>
      )}

      {usOnly && (
        <div style={{ fontSize: 11.5, lineHeight: 1.45, color: onGlass ? 'rgba(255,255,255,.7)' : 'var(--slate-500)', textWrap: 'pretty' }}>
          Heads up — paid plans are US-only at launch while we sort tax registration.
          You&apos;ll get the free tier in {country} and first notice when billing opens there.
        </div>
      )}

      <div style={{ fontSize: 10.5, lineHeight: 1.45, color: onGlass ? 'rgba(255,255,255,.65)' : 'var(--slate-500)' }}>
        By reserving, you agree to receive Vehicle Twin beta updates. Unsubscribe anytime.{' '}
        <Link href="/privacy" style={{ color: 'inherit', textDecoration: 'underline' }}>Privacy</Link>
      </div>

      {state === 'error' && (
        <div role="alert" style={{ fontSize: 11.5, color: onGlass ? '#FCA5A5' : '#B91C1C' }}>
          {manual
            ? 'Enter your vehicle, a valid email, and your country, then try again.'
            : `Pick your year, make and model${needsTransmission ? ', transmission' : ''}, add a valid email and your country, then try again.`}
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
