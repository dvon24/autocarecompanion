'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ReviewedOwnerEquipment } from '@/lib/twin-owner-equipment';

export function OwnerEquipmentChoice({ profile, checked, onChange, disabled=false }: {
  profile:ReviewedOwnerEquipment; checked:boolean; onChange:(checked:boolean)=>void; disabled?:boolean;
}) {
  return <fieldset disabled={disabled} style={{ border:'1px solid #CBD5E1', borderRadius:12, padding:16, margin:'12px 0', minWidth:0, color:'#172033', background:'#F7F6F2' }}>
    <legend style={{fontSize:14,fontWeight:650}}>Confirm your actual equipment</legend>
    <p style={{fontSize:14,lineHeight:1.6,margin:'0 0 12px'}}>{profile.year} {profile.make} {profile.model} {profile.trim}<br/><strong>{profile.details}</strong></p>
    <label style={{display:'flex',gap:10,alignItems:'start',fontSize:14,lineHeight:1.5,minHeight:44,cursor:'pointer'}}>
      <input type="checkbox" checked={checked} onChange={event=>onChange(event.target.checked)} style={{marginTop:4,width:18,height:18,flexShrink:0,accentColor:'#2563EB'}}/>
      I checked my vehicle and confirm this exact configuration.
    </label>
    <p style={{fontSize:12,lineHeight:1.6,margin:'8px 0 0'}}>If any detail differs or is unknown, leave this unchecked. Your saved vehicle and history stay intact. Contact Au7o for another configuration. VIN, build-date and installed-part checks shown with individual parts still apply.</p>
  </fieldset>;
}

export function OwnerEquipmentConfirmation({vehicleId,vehicleRevision,profile}:{vehicleId:string;vehicleRevision:string;profile:ReviewedOwnerEquipment}) {
  const router=useRouter();
  const [checked,setChecked]=useState(false);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  async function save() {
    if(!checked||busy)return;
    setBusy(true);setError('');
    try {
      const response=await fetch(`/api/vehicles/${encodeURIComponent(vehicleId)}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({reviewedEquipmentId:profile.id,expectedUpdatedAt:vehicleRevision})});
      const payload=await response.json().catch(()=>null);
      if(!response.ok)throw new Error(payload?.error||'Equipment could not be confirmed. Refresh and try again.');
      if(payload?.vehicle?.id!==vehicleId||payload?.vehicle?.reviewedEquipmentId!==profile.id)throw new Error('The save was not confirmed. Refresh to check your vehicle before trying again.');
      router.refresh();
    } catch(failure) {setError(failure instanceof Error?failure.message:'Equipment could not be confirmed.');}
    finally {setBusy(false);}
  }
  return <main style={{minHeight:'100dvh',background:'#F7F6F2',color:'#172033',padding:'40px 20px',fontFamily:'var(--font-sans,Arial,sans-serif)'}}><div style={{maxWidth:620,margin:'auto',background:'#fff',border:'1px solid #DCE3EA',borderRadius:20,padding:24}}>
    <h1 style={{fontSize:26,lineHeight:1.2}}>Finish your personal Hub setup</h1>
    <p style={{fontSize:14,lineHeight:1.6}}>Confirm the reviewed equipment before we show your vehicle’s parts and service branches. This does not start a trial or change your service history.</p>
    <OwnerEquipmentChoice profile={profile} checked={checked} onChange={setChecked} disabled={busy}/>
    <button type="button" onClick={save} disabled={!checked||busy} style={{width:'100%',minHeight:48,background:'#2563EB',color:'#fff',border:0,borderRadius:12,fontWeight:650,opacity:(!checked||busy) ? .55 : 1}}>{busy?'Saving…':'Confirm equipment'}</button>
    {error&&<p role="alert" style={{color:'#B42318',fontSize:14}}>{error}</p>}
    <div style={{marginTop:20,borderTop:'1px solid #DCE3EA',paddingTop:16,fontSize:14,lineHeight:1.6}}>
      <strong>Not your vehicle or equipment is different?</strong>
      <p style={{margin:'6px 0'}}>Leave the confirmation unchecked. Request a Twin for your actual vehicle and configuration, or return to Account to add an available Twin. If you’re unsure of a detail, tell us it’s unknown instead of guessing.</p>
      {!busy && <a href="/reserve/hub?source=hub-owner&return=account&intent=equipment" style={{display:'inline-block',padding:'12px 0',color:'#2563EB',textDecoration:'underline'}}>Request my vehicle / configuration</a>}
    </div>
    {!busy && <a href="/account" style={{display:'inline-block',padding:'14px 0',color:'#2563EB'}}>Back to Account</a>}
  </div></main>;
}
