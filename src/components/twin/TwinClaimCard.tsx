'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { OwnerEquipmentChoice } from './OwnerEquipmentConfirmation';
import type { ReviewedOwnerEquipment } from '@/lib/twin-owner-equipment';

export function TwinClaimCard({ reservationId, vehicle, transmission, trialDays, needsMileage = false, expectedUpdatedAt, equipment, vehicleRevision, resumeClaimed=false }: { reservationId: string; vehicle: string; transmission?: 'manual'|'automatic'|null; trialDays: number; needsMileage?: boolean; expectedUpdatedAt: string; equipment?:ReviewedOwnerEquipment|null; vehicleRevision?:string; resumeClaimed?:boolean }) {
  const router = useRouter();
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState('');
  const [mileage, setMileage] = useState('');
  const [equipmentConfirmed,setEquipmentConfirmed]=useState(false);

  async function claim() {
    if(state==='loading')return;
    if(equipment&&!equipmentConfirmed){setError('Confirm your actual equipment before continuing.');return;}
    if(needsMileage&&(!Number.isSafeInteger(Number(mileage))||Number(mileage)<=0||Number(mileage)>2000000)){setError('Enter your current mileage in whole miles.');return;}
    setState('loading');
    setError('');
    try {
      const response = await fetch('/api/twin/claim', { method: 'POST', headers:{'Content-Type':'application/json'},body:JSON.stringify({reservationId,expectedUpdatedAt,expectedTrialDays:trialDays,...(equipment?{reviewedEquipmentId:equipment.id,expectedVehicleUpdatedAt:vehicleRevision}:{}),...(needsMileage?{mileage:Number(mileage)}:{})}) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(payload.error || 'Could not activate your twin yet.');
        setState('error');
        return;
      }
      router.push(payload.href);
      router.refresh();
    } catch {
      setError('Could not activate your twin — try again.');
      setState('error');
    }
  }

  return (
    <div style={{ fontFamily: 'var(--font-sans, Arial, sans-serif)', maxWidth: 620, margin: '0 auto', padding: 28, borderRadius: 20, border: '1px solid #DCE3EA', background: '#fff', boxShadow: '0 18px 45px rgba(12,18,28,.08)' }}>
      <div style={{ color: '#2563EB', fontSize: 12, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase' }}>Your vehicle twin is ready</div>
      <h1 style={{ marginTop: 10, color: '#0B1220', fontSize: 32, lineHeight: 1.1, fontWeight: 650 }}>{vehicle}</h1>
      {(transmission === 'manual' || transmission === 'automatic') && <p style={{margin:'12px 0',color:'#172033',fontSize:16,fontWeight:650}}>Transmission: {transmission === 'manual' ? 'Manual' : 'Automatic'}</p>}
      <p style={{ marginTop: 12, color: '#52606D', fontSize: 15, lineHeight: 1.65 }}>
        {resumeClaimed ? 'Your existing access period stays unchanged. Confirming equipment does not restart the trial or charge a card.' : `This offer gives this vehicle ${trialDays} days of beta access to the fitment-reviewed twin prepared for your reservation. Accepting does not start a paid subscription or charge a card.`}
      </p>
      {equipment&&<OwnerEquipmentChoice profile={equipment} checked={equipmentConfirmed} onChange={setEquipmentConfirmed} disabled={state==='loading'}/>}
      {needsMileage && <label style={{display:'grid',gap:8,marginTop:18,fontSize:14}}>Current odometer (miles)<input aria-label="Current odometer in miles" inputMode="numeric" type="number" min="1" max="2000000" step="1" disabled={state==='loading'} value={mileage} onChange={event=>setMileage(event.target.value)} style={{width:'100%',padding:12,fontSize:16,border:'1px solid #DCE3EA',borderRadius:10}}/><span style={{fontSize:12,color:'#52606D'}}>Use the reading on your vehicle. We do not copy demo mileage or maintenance records.</span></label>}
      <button type="button" onClick={claim} disabled={state === 'loading'||Boolean(equipment&&!equipmentConfirmed)} style={{ width: '100%', marginTop: 20, minHeight: 48, border: 0, borderRadius: 12, background: '#2563EB', color: '#fff', fontSize: 15, fontWeight: 650, cursor: 'pointer', opacity: state === 'loading'||Boolean(equipment&&!equipmentConfirmed) ? .65 : 1 }}>
        {state === 'loading' ? 'Activating…' : resumeClaimed ? 'Confirm equipment and open my Hub' : `Accept my ${trialDays}-day beta access`}
      </button>
      {error && <p role="alert" style={{ marginTop: 12, color: '#B42318', fontSize: 13 }}>{error}</p>}
    </div>
  );
}
