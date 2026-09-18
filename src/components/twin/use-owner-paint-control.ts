'use client';

import { useEffect, useReducer, useRef } from 'react';
import { hasValidReviewedTransmissionState, resolveReviewedTransmissionBranch } from '../../lib/transmission-options';

type Vehicle = { year:number; make:string; model:string; trim?:string|null; reviewedEquipmentId?:string|null; color?:string|null };
type Data = { vehicleId:string; vehicleRevision:string; transmission?:string|null; vehicle:Vehicle };
type Paint = { name:string; artStatus?:string };
type Session = {
  key:string; id:string; revision:string; current:string; choice:string;
  state:string; error:string; needsRefresh:boolean; refreshFrom:Data|null;
  pending:object|null;
};
const revisionTime = (value:unknown) => {
  if(typeof value!=='string')return NaN;
  const time=Date.parse(value);
  return Number.isFinite(time)&&new Date(time).toISOString()===value?time:NaN;
};
const identity = (data:Data) => JSON.stringify([data.vehicleId,data.vehicle.year,data.vehicle.make,data.vehicle.model,data.vehicle.trim||null,data.transmission||null,data.vehicle.reviewedEquipmentId||null]);

/** Per-mounted-Hub paint state. Preview never becomes committed on HTTP status alone. */
export function useOwnerPaintControl(data:Data, options:readonly Paint[], refresh:()=>void) {
  const [,render] = useReducer((n:number)=>n+1,0);
  const mounted = useRef(true);
  const locks = useRef(new Map<string,object>());
  const acknowledged = useRef(new Map<string,{key:string;revision:string;color:string}>());
  const session = useRef<Session|null>(null);
  const key=identity(data),incoming=Date.parse(data.vehicleRevision||'');
  if (!session.current || session.current.key!==key) {
    const cached=acknowledged.current.get(data.vehicleId);
    const useCached=cached?.key===key && Date.parse(cached.revision)>incoming;
    const current=useCached?cached.color:data.vehicle.color||'';
    const waiting=locks.current.has(data.vehicleId);
    session.current={key,id:data.vehicleId,revision:useCached?cached.revision:data.vehicleRevision,current,choice:current||options.find(p=>p.artStatus==='rendered')?.name||'',state:waiting?'error':'idle',error:waiting?'A previous save is still settling. Refresh the saved color before trying again.':'',needsRefresh:waiting,refreshFrom:null,pending:null};
  }
  const active=session.current;
  const newer=Number.isFinite(incoming)&&incoming>Date.parse(active.revision);
  const refreshArrived=active.refreshFrom!==null&&active.refreshFrom!==data&&Number.isFinite(incoming)&&incoming>=Date.parse(active.revision);
  if (newer||refreshArrived) {
    const dirty=active.choice!==active.current;
    active.current=data.vehicle.color||'';active.revision=data.vehicleRevision;
    if(!dirty)active.choice=active.current;
    if(active.pending){active.pending=null;active.state='error';active.error='This vehicle changed while color was saving. Review the refreshed color and try again.';}
    else {active.state='idle';active.error='';}
    active.needsRefresh=false;active.refreshFrom=null;
  }
  useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;if(session.current)session.current.pending=null;};},[]);
  const isCurrent=()=>mounted.current&&session.current===active;
  const setChoice=(choice:string)=>{
    if(!isCurrent()||locks.current.has(active.id)||!options.some(p=>p.name===choice&&p.artStatus==='rendered'))return;
    active.choice=choice;active.state=active.needsRefresh?'error':'idle';if(!active.needsRefresh)active.error='';render();
  };
  const reload=()=>{
    if(!isCurrent()||locks.current.has(active.id))return;
    active.refreshFrom=data;active.needsRefresh=true;active.state='refreshing';active.error='';render();refresh();
  };
  const save=async()=>{
    if(!isCurrent()||locks.current.has(active.id)||active.needsRefresh||!active.choice||active.choice===active.current)return false;
    if(!options.some(p=>p.name===active.choice&&p.artStatus==='rendered')||!Number.isFinite(Date.parse(active.revision))){active.state='error';active.error='Refresh this vehicle before choosing a reviewed factory color.';active.needsRefresh=true;render();return false;}
    const token={},color=active.choice,expectedUpdatedAt=active.revision;
    active.pending=token;locks.current.set(active.id,token);active.state='saving';active.error='';render();
    const applicable=()=>isCurrent()&&active.pending===token;
    try{
      const response=await fetch(`/api/vehicles/${encodeURIComponent(active.id)}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({color,expectedUpdatedAt})});
      const payload=await response.json().catch(()=>null);
      if(!applicable())return false;
      if(!response.ok)throw new Error(typeof payload?.error==='string'?payload.error:'Could not save the factory color.');
      const vehicle=payload?.vehicle;
      // The loader exposes the reviewed branch. Single-fitment garage rows store
      // null, so normalize the acknowledgement with that same fitment registry.
      const returned:Data={vehicleId:vehicle?.id,vehicleRevision:vehicle?.updatedAt,transmission:vehicle?resolveReviewedTransmissionBranch(vehicle,vehicle.transmission).branch:null,vehicle:vehicle||{}};
      let revision=NaN;try{revision=revisionTime(vehicle?.updatedAt);}catch{/* invalid dates fail closed */}
      if(!vehicle||!hasValidReviewedTransmissionState(vehicle)||identity(returned)!==active.key||vehicle.color!==color||payload?.paintSave?.expectedUpdatedAt!==expectedUpdatedAt||!Number.isFinite(revision)||revision<=Date.parse(expectedUpdatedAt))throw new Error('The saved-color acknowledgement did not match this vehicle. Refresh to confirm before retrying.');
      active.current=color;active.revision=vehicle.updatedAt;active.state='saved';active.needsRefresh=false;
      acknowledged.current.set(active.id,{key:active.key,revision:active.revision,color});
      render();refresh();return true;
    }catch(cause){
      if(applicable()){active.state='error';active.error=cause instanceof Error?cause.message:'Could not save the factory color.';active.needsRefresh=true;render();}
      return false;
    }finally{
      if(locks.current.get(active.id)===token)locks.current.delete(active.id);
      if(active.pending===token)active.pending=null;
      if(mounted.current)render();
    }
  };
  return {current:active.current,choice:active.choice,revision:active.revision,state:locks.current.has(active.id)?'saving':active.state,error:active.error,needsRefresh:active.needsRefresh,setChoice,save,refresh:reload};
}
