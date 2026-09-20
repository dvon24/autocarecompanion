'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OwnerEquipmentChoice } from './OwnerEquipmentConfirmation';
import { validHubMileage, MAX_HUB_MILEAGE, type OwnerHubSetup as Setup } from '@/lib/owner-hub-setup';

export function OwnerHubSetup({setup}:{setup:Setup}) {
  const router=useRouter();
  const [mileage,setMileage]=useState(''),[transmission,setTransmission]=useState(''),[confirmed,setConfirmed]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[uncertain,setUncertain]=useState(false);
  const ready=(!setup.needsMileage||validHubMileage(Number(mileage)))&&(!setup.transmissionOptions.length||setup.transmissionOptions.some(option=>option===transmission))&&(!setup.equipment||confirmed);
  async function submit(event:React.FormEvent){
    event.preventDefault();if(!ready||busy||uncertain)return;setBusy(true);setError('');
    const body={expectedUpdatedAt:setup.vehicleRevision,...(setup.needsMileage?{currentMileage:Number(mileage)}:{}),...(setup.transmissionOptions.length?{transmission}:{}),...(setup.equipment?{reviewedEquipmentId:setup.equipment.id}:{})};
    try{
      const response=await fetch(`/api/vehicles/${encodeURIComponent(setup.vehicleId)}/hub-setup`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(15000)});
      const payload=await response.json().catch(()=>null);
      if(!response.ok){if(response.status>=500||response.status===409)setUncertain(true);throw new Error(payload?.error||'Setup could not be confirmed. Reload to check your saved vehicle.');}
      const v=payload?.vehicle;
      if(!v||v.id!==setup.vehicleId||!validHubMileage(v.currentMileage)||(body.currentMileage!==undefined&&v.currentMileage!==body.currentMileage)||(body.transmission!==undefined&&v.transmission!==body.transmission)||(body.reviewedEquipmentId!==undefined&&v.reviewedEquipmentId!==body.reviewedEquipmentId)||!Number.isFinite(Date.parse(v.updatedAt))||Date.parse(v.updatedAt)<=Date.parse(setup.vehicleRevision)){
        setUncertain(true);throw new Error('The save was not confirmed. Reload to check this vehicle before trying again.');
      }
      // Stay on the exact owned route; never navigate to a response-controlled URL.
      setUncertain(true);router.refresh();
    }catch(failure){if(failure instanceof TypeError||failure instanceof DOMException)setUncertain(true);setError(failure instanceof Error?failure.message:'Setup could not be confirmed. Reload to check your vehicle.');}
    finally{setBusy(false);}
  }
  return <main style={{minHeight:'100dvh',padding:'32px 16px',background:'#F7F6F2',color:'#172033',fontFamily:'var(--font-sans,Arial,sans-serif)'}}><form onSubmit={submit} style={{maxWidth:620,margin:'auto',padding:24,borderRadius:20,border:'1px solid #DCE3EA',background:'#fff'}}>
    <h1 style={{fontSize:26,lineHeight:1.2}}>Finish your personal Hub setup</h1>
    <p style={{fontWeight:650,overflowWrap:'anywhere'}}>{setup.label}</p>
    <p style={{fontSize:14,lineHeight:1.6}}>Add the missing details for this saved vehicle. Your other vehicles, color and service history stay unchanged. This does not start a trial or charge you.</p>
    <fieldset disabled={busy||uncertain} style={{border:0,padding:0,minWidth:0}}>
      {setup.needsMileage&&<label style={{display:'grid',gap:8,margin:'16px 0'}}>Current mileage in miles
        <input type="number" inputMode="numeric" required min={1} max={MAX_HUB_MILEAGE} step={1} value={mileage} onChange={event=>setMileage(event.target.value)} style={{width:'100%',boxSizing:'border-box',minHeight:44,padding:10,fontSize:16,color:'#172033',background:'#fff',border:'1px solid #CBD5E1',borderRadius:9}}/>
      </label>}
      {!!setup.transmissionOptions.length&&<label style={{display:'grid',gap:8,margin:'16px 0'}}>Your transmission
        <select aria-label="Your transmission" required value={transmission} onChange={event=>setTransmission(event.target.value)} style={{width:'100%',minHeight:44,fontSize:16,padding:10,color:'#172033',background:'#fff',border:'1px solid #CBD5E1',borderRadius:9}}><option value="">Choose your actual transmission</option>{setup.transmissionOptions.map(value=><option key={value} value={value}>{value==='automatic'?'Automatic':'Manual'}</option>)}</select>
      </label>}
      {setup.equipment&&<OwnerEquipmentChoice profile={setup.equipment} checked={confirmed} onChange={setConfirmed}/>}
    </fieldset>
    {error&&<p role="alert" style={{color:'#B42318',fontSize:14,lineHeight:1.5}}>{error}</p>}
    {!uncertain&&<button type="submit" disabled={!ready||busy} style={{width:'100%',minHeight:48,border:0,borderRadius:12,background:'#2563EB',color:'#fff',fontWeight:650,opacity:ready&&!busy?1:.55}}>{busy?'Saving…':'Save and open my Hub'}</button>}
    {uncertain&&!busy&&<button type="button" onClick={()=>window.location.reload()} style={{minHeight:44,color:'#2563EB',background:'#fff',border:'1px solid #CBD5E1',borderRadius:9,padding:10}}>Reload saved setup</button>}
    {!busy&&<div style={{display:'grid',gap:8,marginTop:20,fontSize:14,lineHeight:1.6}}><a href="/reserve/hub?source=hub-owner&return=account&intent=equipment" style={{color:'#2563EB',padding:'8px 0'}}>Not your configuration? Request a Twin</a><a href="/account" style={{color:'#2563EB',padding:'8px 0'}}>Back to Account</a></div>}
  </form></main>;
}
