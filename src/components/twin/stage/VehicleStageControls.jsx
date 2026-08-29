"use client";
import React from "react";
import { Icon } from "./Icon";
import { resolveTwinPaintArtwork } from "./paint-art";
import { useTwinCatalog, useTwinLive, useTwinPaintControl, useTwinTransmissionControl } from "../twin-context";

export function VehicleStageControls({ mobile = false }) {
  const catalog = useTwinCatalog();
  const live = useTwinLive();
  const transmission = useTwinTransmissionControl();
  const paint = useTwinPaintControl();
  const options = paint?.options || catalog.paintPalette?.colors || [];
  const choice = paint?.choice || catalog.identity.paint;
  const paintArtwork = resolveTwinPaintArtwork(catalog, { choice, options });
  const hasTransmission = Boolean(transmission?.model?.options?.length > 1);
  const hasPaint = options.length > 1;
  const transmissionMissing = hasTransmission && !transmission.model.current;
  const [open, setOpen] = React.useState(false);
  const id = React.useId().replace(/:/g, "");
  if (!hasTransmission && !hasPaint) return null;
  // Keep the compact control out of the hotspot field on phones. A missing
  // transmission is called out on the button, but the owner opens the panel
  // deliberately instead of a large panel covering the windshield marker.
  const expanded = open;
  const currentTransmission = transmission?.model?.current === "automatic" ? "Automatic" : transmission?.model?.current === "manual" ? "Manual" : null;
  const control = {minWidth:0,flex:1,minHeight:34,borderRadius:8,border:"1px solid rgba(255,255,255,.2)",background:"rgba(255,255,255,.96)",color:"#0B1220",padding:"0 8px",fontFamily:"var(--font-sans)",fontSize:11.5};
  return (
    <div onClick={(event)=>event.stopPropagation()} style={{position:"absolute",top:10,left:10,zIndex:7,width:expanded?`min(${mobile?228:278}px, calc(100% - 68px))`:"auto",maxWidth:"calc(100% - 68px)",fontFamily:"var(--font-sans)"}}>
      {!expanded ? (
        <button type="button" onClick={()=>setOpen(true)} aria-expanded="false" style={{minHeight:36,maxWidth:mobile?126:250,display:"flex",alignItems:"center",gap:7,padding:"0 11px",borderRadius:10,border:"1px solid rgba(255,255,255,.22)",background:"rgba(10,13,20,.68)",backdropFilter:"blur(10px)",color:"#fff",cursor:"pointer",boxShadow:"0 6px 18px rgba(0,0,0,.22)"}}>
          <Icon name="settings" size={13}/><span style={{fontSize:11.5,fontWeight:650,whiteSpace:"nowrap"}}>{transmissionMissing?"Setup required":mobile?"Setup":"Vehicle setup"}</span>{!mobile&&<span style={{fontSize:10,color:"rgba(255,255,255,.62)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{[currentTransmission, choice].filter(Boolean).join(" · ")}</span>}
        </button>
      ) : (
        <div style={{padding:10,borderRadius:12,border:"1px solid rgba(255,255,255,.22)",background:"rgba(10,13,20,.86)",backdropFilter:"blur(14px)",color:"#fff",boxShadow:"0 10px 30px rgba(0,0,0,.32)"}}>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:9}}><Icon name="settings" size={13}/><span style={{fontSize:11.5,fontWeight:700}}>Vehicle setup</span>{!transmissionMissing&&<button type="button" onClick={()=>setOpen(false)} aria-label="Close vehicle setup" style={{marginLeft:"auto",width:26,height:26,display:"grid",placeItems:"center",border:0,borderRadius:7,background:"rgba(255,255,255,.1)",color:"#fff",cursor:"pointer"}}><Icon name="x" size={12}/></button>}</div>
          {hasTransmission && <div style={{paddingBottom:hasPaint?9:0,borderBottom:hasPaint?"1px solid rgba(255,255,255,.14)":"none"}}>
            <label htmlFor={`${id}-trans`} style={{display:"block",fontSize:10,fontWeight:650,color:"rgba(255,255,255,.72)",marginBottom:5}}>{transmissionMissing?"Choose transmission for exact parts":"Transmission"}</label>
            <div style={{display:"flex",gap:6}}><select id={`${id}-trans`} value={transmission.choice} disabled={transmission.state==="saving"||transmission.state==="refreshing"} onChange={(event)=>transmission.setChoice(event.target.value)} style={control}><option value="">Select…</option>{transmission.model.options.map((option)=><option key={option.value} value={option.value}>{option.label}</option>)}</select>{transmission.save&&<button type="button" onClick={transmission.save} disabled={!transmission.choice||transmission.choice===transmission.model.current||transmission.state==="saving"||transmission.state==="refreshing"} style={{minHeight:34,padding:"0 9px",border:0,borderRadius:8,background:"#fff",color:"#0B1220",fontSize:11,fontWeight:700,opacity:!transmission.choice||transmission.choice===transmission.model.current ? .5 : 1}}>{transmission.state==="saving"?"Saving…":"Save"}</button>}</div>
            {transmission.error&&<div role="alert" style={{marginTop:5,fontSize:10,color:"#FF9B94"}}>{transmission.error}</div>}
          </div>}
          {hasPaint && <div style={{paddingTop:hasTransmission?9:0}}>
            <label htmlFor={`${id}-paint`} style={{display:"block",fontSize:10,fontWeight:650,color:"rgba(255,255,255,.72)",marginBottom:5}}>Factory color</label>
            <div style={{display:"flex",gap:6}}><select id={`${id}-paint`} value={choice} disabled={paint?.state==="saving"} onChange={(event)=>paint?.setChoice?.(event.target.value)} style={control}>{options.map((color)=><option key={color.name} value={color.name} disabled={color.artStatus!=="rendered"}>{color.name}{color.artStatus!=="rendered"?" · artwork pending":""}</option>)}</select>{live&&paint?.save&&<button type="button" onClick={paint.save} disabled={!choice||choice===paint.current||paint.state==="saving"} style={{minHeight:34,padding:"0 9px",border:0,borderRadius:8,background:"#fff",color:"#0B1220",fontSize:11,fontWeight:700,opacity:!choice||choice===paint.current ? .5 : 1}}>{paint.state==="saving"?"Saving…":"Save"}</button>}</div>
            <div style={{marginTop:5,fontSize:9.5,lineHeight:1.35,color:paintArtwork.art?"#87E7B5":"rgba(255,255,255,.68)"}}>{paintArtwork.art?`Showing ${paintArtwork.selected?.name||choice} artwork`:`${paintArtwork.selected?.name||choice} art unavailable · prior color hidden`}</div>
            {paint?.error&&<div role="alert" style={{marginTop:5,fontSize:10,color:"#FF9B94"}}>{paint.error}</div>}
          </div>}
        </div>
      )}
    </div>
  );
}
