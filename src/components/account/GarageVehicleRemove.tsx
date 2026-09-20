'use client';
import { useEffect,useRef,useState } from 'react';
import { useRouter } from 'next/navigation';

/** Destructive action stays outside the card's Hub link and requires a named confirmation. */
export function GarageVehicleRemove({vehicleId,label}:{vehicleId:string;label:string}) {
  const router=useRouter(),dialog=useRef<HTMLDialogElement>(null),trigger=useRef<HTMLButtonElement>(null),pending=useRef(false);
  const [open,setOpen]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[uncertain,setUncertain]=useState(false),[completed,setCompleted]=useState(false);
  useEffect(()=>{if(open)dialog.current?.showModal();else dialog.current?.close();},[open]);
  function close(){if(pending.current)return;setOpen(false);trigger.current?.focus();}
  async function remove(){
    if(pending.current||uncertain||completed)return;pending.current=true;setBusy(true);setError('');
    try{
      const response=await fetch(`/api/vehicles/${encodeURIComponent(vehicleId)}`,{method:'DELETE',signal:AbortSignal.timeout(15000)}),payload=await response.json().catch(()=>null);
      if(!response.ok){if(response.status>=500)setUncertain(true);throw new Error(payload?.error||'Could not remove this vehicle. Your list has not changed.');}
      if(payload?.success!==true){setUncertain(true);throw new Error('Removal was not confirmed. Reload your garage to check before trying again.');}
      setCompleted(true);setOpen(false);router.refresh();window.dispatchEvent(new Event('au7o:vehicles-changed'));
    }catch(failure){if(failure instanceof TypeError||failure instanceof DOMException)setUncertain(true);setError(failure instanceof Error?failure.message:'Could not confirm removal. Reload your garage to check.');}
    finally{pending.current=false;setBusy(false);}
  }
  return <>
    {completed?<button type="button" onClick={()=>window.location.reload()} style={{flexShrink:0,maxWidth:100,minHeight:44,fontSize:11,color:'#2563EB',background:'transparent',border:0}}>Removed. Reload garage</button>:<button ref={trigger} type="button" disabled={busy} onClick={()=>{setError('');setOpen(true);}} aria-label={`Remove ${label}`} title={`Remove ${label}`} style={{flexShrink:0,minWidth:44,minHeight:44,color:'#64748B',background:'transparent',border:0,borderRadius:10,cursor:'pointer'}}><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{margin:'auto'}}><path d="M3 6h18M9 6V4h6v2M5 6l1 14h12l1-14M10 10v6M14 10v6"/></svg></button>}
    <dialog ref={dialog} onCancel={event=>{event.preventDefault();close();}} aria-label={`Remove ${label}?`} style={{width:'calc(100vw - 32px)',maxWidth:460,maxHeight:'calc(100dvh - 32px)',overflowY:'auto',margin:'auto',padding:22,border:'1px solid #CBD5E1',borderRadius:16,background:'#fff',color:'#172033'}}>
      <h2 style={{fontSize:19,overflowWrap:'anywhere'}}>Remove {label}?</h2>
      <p style={{fontSize:14,lineHeight:1.6}}>This permanently removes this vehicle and its saved service records, modifications and uploads. Your other vehicles and subscription are not changed.</p>
      {error&&<p role="alert" style={{fontSize:14,color:'#B42318'}}>{error}</p>}
      <div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:16}}>
        <button type="button" disabled={busy} onClick={close} style={{minHeight:44,padding:'10px 16px',border:'1px solid #CBD5E1',borderRadius:9,background:'#fff',color:'#172033'}}>Cancel</button>
        {uncertain?<button type="button" disabled={busy} onClick={()=>window.location.reload()} style={{minHeight:44,padding:'10px 16px'}}>Reload garage</button>:<button type="button" disabled={busy} onClick={remove} style={{minHeight:44,padding:'10px 16px',border:0,borderRadius:9,background:'#B42318',color:'#fff'}}>{busy?'Removing…':'Remove vehicle'}</button>}
      </div>
    </dialog>
  </>;
}
