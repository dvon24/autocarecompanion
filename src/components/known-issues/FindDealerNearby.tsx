'use client';

import { useState } from 'react';
import { triggerHaptic } from '@/hooks/useHaptic';

/**
 * "Find a dealer near me" — the missing next step on recall-first issues.
 *
 * These cards deliberately suppress every retail buy link, because an open
 * manufacturer recall is repaired free and selling the owner the part instead
 * would be actively harmful. Before this, that left the card ending on a
 * generic NHTSA link with nowhere to go next.
 *
 * PRIVACY: location is read only when the owner taps the button, is sent once
 * to our own API, and is never stored. The button copy says so, because an
 * unexplained geolocation prompt is the fastest way to get denied.
 *
 * Never a dead end — if the owner denies location, or the Places key is unset,
 * or Google returns nothing, it falls back to a plain Google Maps search link
 * that needs no permission at all.
 */

interface Dealer {
  name: string;
  address: string | null;
  phone: string | null;
  mapsUrl: string | null;
  rating: number | null;
  ratingCount: number | null;
}

type State = 'idle' | 'locating' | 'searching' | 'done' | 'fallback';

export function FindDealerNearby({ make }: { make: string }) {
  const [state, setState] = useState<State>('idle');
  const [dealers, setDealers] = useState<Dealer[]>([]);

  const mapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${make} dealership near me`)}`;

  async function findDealers() {
    triggerHaptic();

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setState('fallback');
      return;
    }

    setState('locating');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setState('searching');
        try {
          const res = await fetch('/api/dealers/nearby', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              make,
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            }),
          });
          const data = await res.json();
          if (data.available && Array.isArray(data.dealers) && data.dealers.length > 0) {
            setDealers(data.dealers);
            setState('done');
          } else {
            setState('fallback');
          }
        } catch {
          setState('fallback');
        }
      },
      // Denied, unavailable, or timed out — all the same to the owner, who just
      // wants the list. Hand them the no-permission path instead of an error.
      () => setState('fallback'),
      { timeout: 10_000, maximumAge: 5 * 60_000 },
    );
  }

  if (state === 'done') {
    return (
      <div className="mb-3 rounded-md border border-[#BFDBFE] bg-[#EFF6FF] p-2.5">
        <p className="mb-2 text-xs font-semibold text-[#2563EB]">
          {make} dealers near you
        </p>
        <ul className="space-y-2">
          {dealers.map((dealer, index) => (
            <li key={`${dealer.name}-${index}`} className="rounded border border-[#BFDBFE] bg-white p-2">
              <div className="text-xs font-medium text-[#0B1220]">{dealer.name}</div>
              {dealer.address && (
                <div className="mt-0.5 text-[11px] text-[#475569]">{dealer.address}</div>
              )}
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                {dealer.rating !== null && (
                  <span className="text-[11px] text-[#64748B]">
                    ★ {dealer.rating.toFixed(1)}
                    {dealer.ratingCount !== null && ` (${dealer.ratingCount})`}
                  </span>
                )}
                {dealer.phone && (
                  <a href={`tel:${dealer.phone.replace(/[^\d+]/g, '')}`} className="text-[11px] font-medium text-[#2563EB] hover:underline">
                    {dealer.phone}
                  </a>
                )}
                {dealer.mapsUrl && (
                  <a
                    href={dealer.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-medium text-[#2563EB] hover:underline"
                  >
                    Directions →
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[11px] text-[#64748B]">
          Ask them to check your VIN for open recalls — that repair is free.
        </p>
      </div>
    );
  }

  if (state === 'fallback') {
    return (
      <a
        href={mapsSearchUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => triggerHaptic()}
        className="mb-3 flex items-center justify-center gap-2 rounded-md border border-[#BFDBFE] bg-[#EFF6FF] p-2.5 text-xs font-semibold text-[#2563EB] transition-colors hover:border-[#3B82F6] hover:bg-[#DBEAFE]"
      >
        Find a {make} dealer on Google Maps →
      </a>
    );
  }

  const busy = state === 'locating' || state === 'searching';

  return (
    <button
      type="button"
      onClick={findDealers}
      disabled={busy}
      className="mb-3 flex w-full items-center justify-center gap-2 rounded-md border border-[#BFDBFE] bg-[#EFF6FF] p-2.5 text-xs font-semibold text-[#2563EB] transition-colors hover:border-[#3B82F6] hover:bg-[#DBEAFE] disabled:opacity-60"
    >
      {busy ? (
        state === 'locating' ? 'Getting your location…' : `Finding ${make} dealers…`
      ) : (
        <>
          <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Find a {make} dealer near me
        </>
      )}
    </button>
  );
}
