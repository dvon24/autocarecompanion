'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { triggerHaptic } from '@/hooks/useHaptic';
import { dealerEmbedUrl, dealerLocationFailure, dealerMapsUrl, parseDealerSearchInput, type DealerSearchLocation } from '@/lib/dealer-search';

interface Dealer {
  name: string;
  address: string | null;
  phone: string | null;
  mapsUrl: string | null;
  rating: number | null;
  ratingCount: number | null;
}

// Location is requested only by the explicit button. City/postcode entry works
// without browser location permission. Neither option persists the location.
export function FindDealerNearby({ make, vehicleType = 'car' }: { make: string; vehicleType?: 'car' | 'motorcycle' }) {
  // The existing nearby API searches automotive dealerships. Explicit bike
  // searches go to Maps, with no automotive provider request or geolocation.
  if (vehicleType === 'motorcycle') return <section className="my-3 rounded-lg border border-[#BFDBFE] p-3">
    <h4 className="text-sm font-semibold">Find a {make} motorcycle dealer</h4>
    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(make + ' motorcycle dealer service near me')}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-sm text-blue-600">Search {make} motorcycle dealers in Google Maps ↗</a>
    <p className="text-xs text-[#64748B]">Call to confirm they service your motorcycle model and can check its VIN and recall eligibility.</p>
  </section>;
  return <CarDealerNearby make={make} />;
}

function CarDealerNearby({ make }: { make: string }) {
  const id = useId();
  const [busy, setBusy] = useState<'locating' | 'searching' | null>(null);
  const [place, setPlace] = useState('');
  const [location, setLocation] = useState<DealerSearchLocation | null>(null);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [message, setMessage] = useState('');
  const pending = useRef<AbortController | null>(null);
  const sequence = useRef(0);
  useEffect(() => () => { sequence.current++; pending.current?.abort(); }, []);

  const mapsUrl = dealerMapsUrl(make, location);
  const embedUrl = dealerEmbedUrl(make, location, process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY);

  async function search(target: DealerSearchLocation, current: number) {
    if (current !== sequence.current) return;
    setLocation(target);
    setDealers([]);
    setBusy('searching');
    setMessage('');
    pending.current?.abort();
    const controller = new AbortController();
    pending.current = controller;
    try {
      const response = await fetch('/api/dealers/nearby', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ make, ...target }), signal: controller.signal,
      });
      const data = await response.json();
      if (current !== sequence.current) return;
      if (response.ok && data.available && Array.isArray(data.dealers) && data.dealers.length) {
        setDealers(data.dealers);
      } else {
        setMessage('An in-page dealer list is unavailable for this search. Open Google Maps to see results for this area.');
      }
    } catch {
      if (current === sequence.current) setMessage('The dealer list could not load. You can still open Google Maps for this area.');
    } finally {
      if (current === sequence.current) setBusy(null);
    }
  }

  function searchPlace() {
    const input = parseDealerSearchInput({ make, place });
    if (!input) { setMessage('Enter a city or postcode, including the country if needed.'); return; }
    void search(input.location, ++sequence.current);
  }

  function useLocation() {
    triggerHaptic();
    const current = ++sequence.current;
    pending.current?.abort();
    setLocation(null);
    setDealers([]);
    setMessage('');
    if (!navigator.geolocation) { setBusy(null); setMessage(dealerLocationFailure()); return; }
    setBusy('locating');
    navigator.geolocation.getCurrentPosition((position) => {
      if (current !== sequence.current) return;
      const input = parseDealerSearchInput({ make, lat: position.coords.latitude, lng: position.coords.longitude });
      if (!input) { setBusy(null); setMessage(dealerLocationFailure()); return; }
      void search(input.location, current);
    }, (error) => {
      if (current !== sequence.current) return;
      setBusy(null);
      setMessage(dealerLocationFailure(error.code));
    }, { timeout: 10_000, maximumAge: 5 * 60_000 });
  }

  return (
    <section aria-labelledby={id + '-title'} style={{ marginTop: 12, marginBottom: 12, padding: 10, minWidth: 0, borderRadius: 11, containerType: 'inline-size',
      background: 'var(--ki-page, #EFF6FF)', border: '1px solid var(--ki-line, #BFDBFE)', color: 'var(--ink, #0B1220)' }}>
      <h4 id={id + '-title'} style={{ fontSize: 12.5, fontWeight: 650, marginBottom: 8 }}>Find a {make} dealer</h4>
      <button type="button" onClick={useLocation} disabled={!!busy} className="disabled:opacity-60"
        style={{ width: '100%', minHeight: 44, padding: '8px 10px', borderRadius: 9, border: '1px solid var(--ki-line, #BFDBFE)',
          background: 'var(--ki-card, #fff)', color: 'var(--au7o-blue, #2563EB)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
        {busy === 'locating' ? 'Getting your location…' : 'Use my location'}
      </button>
      <p style={{ fontSize: 10.5, lineHeight: 1.5, marginTop: 5, color: 'var(--slate-500, #64748B)' }}>Choose to share your location for this search, or enter an area below. Your search location is sent to Google to find dealers.</p>
      <label htmlFor={id + '-place'} style={{ display: 'block', fontSize: 11.5, marginTop: 9, marginBottom: 5 }}>City or postcode</label>
      <input id={id + '-place'} value={place} maxLength={120} disabled={!!busy} autoComplete="off" placeholder="City, postcode, country"
        onChange={(event) => setPlace(event.target.value)}
        onKeyDown={(event) => { if (event.key === 'Enter' && !busy) { event.preventDefault(); searchPlace(); } }}
        style={{ width: '100%', minWidth: 0, padding: '10px 9px', fontSize: 16, borderRadius: 9, border: '1px solid var(--ki-line, #BFDBFE)', background: 'var(--ki-card, #fff)', color: 'inherit' }} />
      <button type="button" onClick={searchPlace} disabled={!!busy || place.trim().length < 2} className="disabled:opacity-60"
        style={{ width: '100%', marginTop: 7, minHeight: 44, border: 0, borderRadius: 9, background: '#2563EB', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
        {busy === 'searching' ? 'Finding dealers…' : 'Search this area'}
      </button>
      <p role="status" style={{ fontSize: 11.5, lineHeight: 1.5, marginTop: message || busy ? 8 : 0 }}>{busy === 'searching' ? 'Searching for ' + make + ' dealerships…' : message}</p>
      {/* Google requires at least 200px per map dimension. A narrow detail rail
          keeps the external map link instead of rendering an unsupported map. */}
      <style>{'@container (max-width: 199px) { .dealer-inline-map { display: none; } }'}</style>
      {embedUrl && <div className="dealer-inline-map"><iframe title={make + ' dealer map'} src={embedUrl} width="100%" height="240" loading="lazy" allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin" style={{ display: 'block', border: 0, borderRadius: 9, marginTop: 10 }} /></div>}
      <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', minHeight: 44, fontSize: 11.5, fontWeight: 600, color: 'var(--au7o-blue, #2563EB)' }}>Open {make} dealer map in Google Maps ↗</a>
      {dealers.length > 0 && <>
        <p style={{ fontSize: 10.5, color: 'var(--slate-500, #64748B)', marginBottom: 6 }}>Dealer search results from Google Maps</p>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 0, listStyle: 'none' }}>
          {dealers.map((dealer, index) => <li key={dealer.name + '-' + index} style={{ padding: 9, borderRadius: 9, background: 'var(--ki-card, #fff)', border: '1px solid var(--ki-line, #BFDBFE)' }}>
            <div style={{ fontSize: 12, fontWeight: 600 }}>{dealer.name}</div>
            {dealer.address && <div style={{ marginTop: 3, fontSize: 11, color: 'var(--slate-600, #475569)' }}>{dealer.address}</div>}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px 12px', marginTop: 5, fontSize: 11 }}>
              {typeof dealer.rating === 'number' && <span>★ {dealer.rating.toFixed(1)}{dealer.ratingCount != null ? ' (' + dealer.ratingCount + ')' : ''}</span>}
              {dealer.phone && <a href={'tel:' + dealer.phone.replace(/[^\d+]/g, '')} style={{ color: 'var(--au7o-blue, #2563EB)' }}>{dealer.phone}</a>}
              {dealer.mapsUrl && <a href={dealer.mapsUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--au7o-blue, #2563EB)' }}>Directions ↗</a>}
            </div>
          </li>)}
        </ul>
      </>}
      <p style={{ marginTop: 8, fontSize: 10.5, lineHeight: 1.5, color: 'var(--slate-500, #64748B)' }}>Call to confirm they service {make} vehicles and check your VIN, recall eligibility, parts availability, and appointment options.</p>
    </section>
  );
}
