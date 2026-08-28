'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { VEHICLE_TWIN_CATALOG } from '@/lib/vehicle-twin-catalog';
import { TWIN_MARKER_VISUALS, TwinMarkerDot } from '@/components/twin/stage/TwinMarker';

export const HERO_MARKER_VISUALS = TWIN_MARKER_VISUALS;

// Keep the artwork and its percentage-positioned hotspots in one responsive
// coordinate space. A fixed minimum height here transfers through the aspect
// ratio into an oversized width on phones, which clips the right side of the
// vehicle and moves hotspots outside the card.
export const TWIN_STAGE_FRAME_STYLE = {
  position: 'relative',
  width: '100%',
  minWidth: 0,
  aspectRatio: '16 / 9',
} as const;

export function RotatingTwinStage({ onSelectedVehicleChange }: { onSelectedVehicleChange?: (vehicleId: string) => void }) {
  const [index, setIndex] = useState(0);
  const [active, setActive] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const twin = VEHICLE_TWIN_CATALOG[index];
  useEffect(() => {
    if (paused) return;
    const timer = window.setTimeout(() => { setActive(null); setIndex((value) => (value + 1) % VEHICLE_TWIN_CATALOG.length); }, 8000);
    return () => window.clearTimeout(timer);
  }, [index, paused]);
  useEffect(() => onSelectedVehicleChange?.(twin.id), [onSelectedVehicleChange, twin.id]);
  const go = (next: number) => { setIndex((next + VEHICLE_TWIN_CATALOG.length) % VEHICLE_TWIN_CATALOG.length); setActive(null); };
  const open = (hotspot: string) => window.location.assign(`/demo/hub?vehicle=${encodeURIComponent(twin.id)}&open=${encodeURIComponent(hotspot)}`);
  const markers = twin.hotspots;
  return <section aria-label="Vehicle Twin preview" onPointerDownCapture={() => setPaused(true)} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false); }} style={{overflow:'hidden',borderRadius:20,border:'1px solid rgba(255,255,255,.14)',background:'#05070C',boxShadow:'0 24px 60px rgba(0,0,0,.35)'}}>
    <div style={TWIN_STAGE_FRAME_STYLE}>
      <Image src={twin.art.base} alt={`${twin.identity.year} ${twin.identity.make} ${twin.identity.model} ${twin.identity.trim} in ${twin.identity.paint}`} fill priority={index === 0} sizes="(max-width:900px) 100vw,1120px" style={{objectFit:'cover'}} />
      {Object.entries(twin.art.effects).map(([id, src]) => <Image key={id} src={src} alt="" aria-hidden fill sizes="(max-width:900px) 100vw,1120px" style={{objectFit:'cover',opacity:active === id ? 1 : 0,transition:'opacity .3s',...(twin.art.strategy === 'opaque-masked' ? {clipPath:twin.art.masks?.[id]} : {})}} />)}
      {markers.map((hotspot) => <button key={hotspot.id} type="button" aria-label={`${hotspot.label}: ${hotspot.statusDetail}. Press Enter to open the selected vehicle demo.`} onClick={() => setActive(hotspot.id)} onDoubleClick={() => open(hotspot.id)} onKeyDown={(event) => { if (event.key === 'Enter') open(hotspot.id); }} style={{position:'absolute',left:`${hotspot.x}%`,top:`${hotspot.y}%`,transform:'translate(-50%,-50%)',zIndex:5,padding:0,border:0,background:'transparent',cursor:'pointer'}}><TwinMarkerDot evidence={hotspot} size={44} active={active===hotspot.id}/></button>)}
    </div>
    <div style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',borderTop:'1px solid rgba(255,255,255,.1)',background:'rgba(8,11,18,.96)',flexWrap:'wrap'}}>
      <div><div style={{color:'#fff',fontSize:14.5,fontWeight:600}}>{twin.identity.year} {twin.identity.make} {twin.identity.model} <span style={{color:'rgba(255,255,255,.5)'}}>{twin.identity.trim}</span></div><div className="mono" style={{marginTop:2,color:'rgba(255,255,255,.5)',fontSize:10.5}}>{twin.identity.paint} · {twin.demoMileage?.toLocaleString()} mi sample · model-specific demo evidence</div></div>
      <div style={{marginLeft:'auto',display:'flex',gap:8}}><button type="button" onClick={() => go(index - 1)} aria-label="Previous vehicle" style={{width:34,height:34,borderRadius:'50%',border:'1px solid rgba(255,255,255,.16)',background:'rgba(255,255,255,.08)',color:'#fff'}}>‹</button><button type="button" onClick={() => go(index + 1)} aria-label="Next vehicle" style={{width:34,height:34,borderRadius:'50%',border:'1px solid rgba(255,255,255,.16)',background:'rgba(255,255,255,.08)',color:'#fff'}}>›</button></div>
    </div>
    <div style={{padding:'9px 14px',borderTop:'1px solid rgba(255,255,255,.08)',color:'rgba(255,255,255,.56)',fontSize:11.5}}>{VEHICLE_TWIN_CATALOG.length} vehicles visualized. <Link href={`/demo/hub?vehicle=${twin.id}`} style={{color:'#8FDDF7',fontWeight:600}}>Open this vehicle demo →</Link></div>
  </section>;
}
