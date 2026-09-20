'use client';

import { useEffect, useId, useState } from 'react';
import { savedVehicleHubHref, type SavedHubVehicle } from '@/lib/hub-vehicle-selection';

export function HubVehicleSwitcher({ vehicleId }: { vehicleId: string }) {
  const id = useId();
  const [vehicles, setVehicles] = useState<SavedHubVehicle[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const changed = () => setRevision((value) => value + 1);
    window.addEventListener('au7o:vehicles-changed', changed);
    return () => window.removeEventListener('au7o:vehicles-changed', changed);
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    fetch('/api/vehicles?view=switcher', { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('Could not load vehicles');
        const payload = await response.json();
        if (!Array.isArray(payload.vehicles)) throw new Error('Invalid vehicles');
        setVehicles(payload.vehicles);
      })
      .catch(() => { if (!controller.signal.aborted) setError(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [revision, vehicleId]);
  return <div style={{ marginTop:12, color:'var(--ink)', fontFamily:'var(--font-sans)' }}>
    <label htmlFor={id} className="eyebrow" style={{ display:'block', marginBottom:6 }}>Your vehicles</label>
    {error ? <button onClick={() => setRevision((value) => value + 1)} style={{ color:'var(--au7o-blue)', fontSize:12 }}>Couldn’t load vehicles. Retry</button>
      : <select id={id} value={vehicleId} disabled={loading} onChange={(event) => {
        const selected = vehicles.find((vehicle) => vehicle.id === event.target.value);
        if (selected && selected.id !== vehicleId) window.location.assign(savedVehicleHubHref(selected));
      }} style={{ width:'100%', minHeight:44, borderRadius:11, padding:'9px 10px', border:'1px solid var(--ki-line)', background:'var(--ki-page)', color:'var(--ink)', fontFamily:'inherit', fontSize:12 }}>
        {!vehicles.some((vehicle) => vehicle.id === vehicleId) && <option value={vehicleId}>{loading ? 'Loading your vehicles…' : 'Current vehicle'}</option>}
        {vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.nickname ? `${vehicle.nickname} · ` : ''}{vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim || ''}</option>)}
      </select>}
    <p style={{ fontSize:10.5, color:'var(--slate-500)', marginTop:5 }}>Chat and service records follow the selected car.</p>
  </div>;
}
