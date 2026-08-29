"use client";
/* eslint-disable */
/**
 * The full-screen hub — ported from `design/au7o (11)` ("Minimal hub for the
 * web demo"): greeting on top, the car filling the middle, one composer at the
 * bottom. Markers use a quick select-then-open interaction on every viewport:
 * the first tap identifies the system and the second opens its tech tree.
 *
 * Why this exists as a separate view rather than a CSS fullscreen of the normal
 * hub: it fits the car to a measured box (4:3 on mobile, 16:9 on desktop) via
 * ResizeObserver with objectFit:contain, so the percentage-positioned hotspots
 * stay glued to the car at any viewport. Stretching the existing stage could
 * not do that.
 *
 * One addition to the design: an exit control in the top bar. The standalone
 * file had no way back out, since it was its own page.
 */
import React from "react";
import { Icon } from "../stage/Icon";
import { TH_DOT, thHot } from "../stage/TwinStage";
import { TwinMarkerDot } from "../stage/TwinMarker";
import { projectTwinHotspots } from "../stage/mobile-hotspots";
import { resolveTwinPaintArtwork } from "../stage/paint-art";
import { VehicleStageControls } from "../stage/VehicleStageControls";
import { greetingFor, useTwinEquipment, useTwinLive, useTwinVehicle, useTwinMiles, useTwinTrees, useTwinCatalog, useTwinMode, useTwinPaintControl, useTwinGuideAnswer } from "../twin-context";
import { resolveTwinDeepLink } from "../../../lib/vehicle-twin-catalog";

/* The full-screen view used TH_DUE, a module constant computed once against
   the demo's 65,000 mi. On a live hub the odometer arrives at render, so the
   count has to be computed then. */
const thmDue = (trees, miles) => {
  if (typeof miles !== "number") return null;
  const t = trees.car;
  if (!t) return 0;
  return Object.keys(t.nodes).filter(k => k !== t.root && ttRisk(t.nodes[k], miles) === "critical").length;
};
import { TT_TREES, ttRisk, TT_BRANCH_FOR_HOTSPOT, TT_NODE_FOR_HOTSPOT, ttFinish, useEquipped } from "../stage/TechTree";
import { Au7oMark, ThemeDots, TwinChatComposer, useBubble } from "./hub-shared";
import { THSidebar, THBubble, THTreeOverlay, THFeedback } from "./Hub";

export const openMinimalHotspot = ({selected,hotspot,select,open}) => {
  select(hotspot.id);
  if (selected === hotspot.id) open(hotspot.id);
};

/* Minimal hub for the web demo — same idea as the phone's minimal screen:
   greeting at the top, the vehicle filling the middle, one composer at the bottom.
   Every viewport highlights on the first tap and opens on the second. */

function THMinTop({ tc, onMenu, mobile, railOpen, onExit }) {
  const miles = useTwinMiles();
  const twinMode = useTwinMode();
  const greeting = greetingFor();
  return (
    <div style={{ flex:"0 0 auto", padding: mobile ? "14px 16px 0" : "20px 26px 0" }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, paddingRight:mobile?42:50 }}>
        <Au7oMark size={mobile ? 20 : 24} color="#fff"/>
        <div style={{ flex:1 }}/>
        <ThemeDots tc={tc} size={13}/>
        <span className="mono" style={{ fontSize:10.5, fontWeight:600, padding:"4px 9px", borderRadius:999, background:"rgba(255,255,255,.07)", border:"1px solid rgba(255,255,255,.14)", color:"rgba(255,255,255,.72)" }}>{typeof miles === "number" ? `${miles.toLocaleString()} mi${twinMode === "demo" ? " sample" : ""}` : "Mileage unavailable"}</span>
        {onExit && (
          <button onClick={onExit} aria-label="Exit full screen" title="Exit full screen"
            style={{ width:34, height:34, borderRadius:999, border:"1px solid rgba(255,255,255,.14)", background:"rgba(255,255,255,.06)", color:"rgba(255,255,255,.8)", cursor:"pointer", display:"grid", placeItems:"center", flexShrink:0 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M9 3v6H3M15 21v-6h6"/><path d="M3 15h6v6M21 9h-6V3"/>
            </svg>
          </button>
        )}
        <button onClick={onMenu} aria-label={railOpen ? "Collapse menu" : "Menu"} title={railOpen ? "Collapse menu" : "Menu"} style={{ width:34, height:34, borderRadius:999, border:"1px solid rgba(255,255,255,.14)", background:"rgba(255,255,255,.06)", color:"rgba(255,255,255,.8)", cursor:"pointer", display:"grid", placeItems:"center", flexShrink:0 }}><Icon name="list" size={15}/></button>
      </div>
      <h1 style={{ margin: mobile ? "16px 0 0" : "18px 0 0", fontSize: mobile ? 26 : "clamp(22px,2.4vw,34px)", textWrap:"balance", fontWeight:600, letterSpacing:"-0.03em", lineHeight:1.08, color:"#fff" }}>
        {greeting}.<span style={{ color:"rgba(255,255,255,.42)", fontWeight:500 }}> Click any part.</span>
      </h1>
    </div>
  );
}

function THMinStage({ sel, onTap, onBg, mobile }) {
  const vehicle = useTwinVehicle();
  const miles = useTwinMiles();
  const trees = useTwinTrees(TT_TREES);
  const catalog = useTwinCatalog();
  const paintControl = useTwinPaintControl();
  const paintArtwork = resolveTwinPaintArtwork(catalog, paintControl);
  const displayedArt = paintArtwork.art;
  const hotspots = React.useMemo(
    () => projectTwinHotspots(catalog.hotspots, { mobile:Boolean(mobile), twinId:catalog.id }),
    [catalog.hotspots, catalog.id, mobile],
  );
  const [hover, setHover] = React.useState(null);
  const [equipped] = useEquipped();
  const live = useTwinLive();
  const ownerEquipped = useTwinEquipment();
  const effectiveEquipped = live ? ownerEquipped : equipped;
  const finish = live || catalog.id !== "challenger" ? null : ttFinish();
  const lit = hover || sel;
  const boxRef = React.useRef(null);
  const [fit, setFit] = React.useState(null);
  const [baseFailed, setBaseFailed] = React.useState(false);
  const [failedEffects, setFailedEffects] = React.useState({});
  React.useEffect(() => { setBaseFailed(false); setFailedEffects({}); }, [catalog.id, displayedArt?.base]);
  const ar = 16 / 9;
  React.useEffect(() => {
    const el = boxRef.current; if (!el) return;
    const measure = () => {
      const cs = getComputedStyle(el);
      const w = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const h = el.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      if (!w || !h) return;
      const fw = Math.min(w, h * ar);
      setFit({ width: Math.round(fw), height: Math.round(fw / ar) });
    };
    measure();
    const ro = new ResizeObserver(measure); ro.observe(el);
    return () => ro.disconnect();
  }, [ar]);
  return (
    <div ref={boxRef} onClick={onBg} style={{ flex:1, minHeight:0, position:"relative", display:"grid", placeItems:"center", overflow:"hidden", padding: mobile ? "4px 8px" : "8px 26px" }}>
      <div style={{ position:"absolute", width: mobile ? "150%" : "80%", aspectRatio:"1 / 1", borderRadius:"50%", background:"radial-gradient(circle, rgba(59,130,246,.14), rgba(59,130,246,0) 62%)", pointerEvents:"none" }}/>
      <div style={{ position:"relative", width: fit ? fit.width : "100%", height: fit ? fit.height : "100%", visibility: fit ? "visible" : "hidden" }}>
        <VehicleStageControls mobile={mobile}/>
        {!baseFailed && displayedArt && (
          <img src={displayedArt.base} onError={()=>setBaseFailed(true)} alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}${paintArtwork.selected?.name ? ` in ${paintArtwork.selected.name}` : ""}`} style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"contain" }}/>
        )}
        {(baseFailed || !displayedArt) && <div role="img" aria-label={`${vehicle.year} ${vehicle.make} ${vehicle.model} artwork unavailable`} style={{position:"absolute",inset:0,display:"grid",placeItems:"center",padding:20,textAlign:"center",color:"rgba(255,255,255,.72)",fontSize:13}}>{paintArtwork.pending ? `${paintArtwork.selected?.name || paintControl?.choice || "Selected color"} selected · matching vehicle artwork is not available yet` : "Vehicle artwork unavailable"}</div>}
        {displayedArt && catalog.id === "challenger" && (
          <img src="/twin-stage/car-wheels-bronze.webp" alt="" aria-hidden="true" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"contain", opacity: !finish || finish.id === "oem" ? 0 : 1, filter: finish?.filter || "none", transition:"opacity .4s ease" }}/>
        )}
        {Object.entries(displayedArt?.effects || {}).filter(([k])=>!failedEffects[k]).map(([k,src]) => (
          <img key={k} src={src} onError={()=>setFailedEffects(value=>({...value,[k]:true}))} alt="" aria-hidden="true" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"contain", opacity: lit === k ? 1 : 0, transition:"opacity .3s ease", pointerEvents:"none", ...(displayedArt?.strategy === "opaque-masked" ? {clipPath:displayedArt.masks?.[k]} : {}) }}/>
        ))}
        {hotspots.map(h0 => thHot(h0, effectiveEquipped, trees, miles)).filter(Boolean).map(h => {
          const on = sel === h.id || hover === h.id, above = h.y > 55, c = TH_DOT(h);
          return (
            <button key={h.id} onMouseEnter={()=>setHover(h.id)} onMouseLeave={()=>setHover(null)} onClick={e=>{ e.stopPropagation(); onTap(h); }} aria-label={h.label}
              style={{ position:"absolute", left:h.x+"%", top:h.y+"%", transform:"translate(-50%,-50%)", width:mobile?44:"auto", height:mobile?44:"auto", display:"grid", placeItems:"center", background:"transparent", border:"none", padding:0, cursor:"pointer", zIndex: on ? 4 : 3, touchAction:"manipulation" }}>
              <TwinMarkerDot evidence={h} size={mobile?34:42} active={on} className={h.risk && !h.knownIssue && !h.upgrade ? "th-dot th-dot-risk" : "th-dot"}/>
              {on && !mobile && (
                <span style={{ position:"absolute", left:"50%", transform:"translateX(-50%)", ...(above ? { bottom:"100%", marginBottom:9 } : { top:"100%", marginTop:9 }), whiteSpace:"nowrap", background:"rgba(10,13,20,.92)", border:`1px solid ${c.line}`, backdropFilter:"blur(8px)", borderRadius:9, padding:"6px 11px", textAlign:"left" }}>
                  <span style={{ display:"block", fontSize:12, fontWeight:600, color:"#fff", letterSpacing:"-0.01em" }}>{h.label}</span>
                  <span style={{ display:"block", fontSize:10, color:c.sub, marginTop:1 }}>{h.sub} · {sel === h.id ? "click again to open" : "click to select"}</span>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function THMinCaption({ hot, onOpen, mobile }) {
  const vehicle = useTwinVehicle();
  const miles = useTwinMiles();
  const trees = useTwinTrees(TT_TREES);
  const due = thmDue(trees, miles);
  const mode = useTwinMode();
  if (!hot) return (
    <div style={{ flex:"0 0 auto", display:"flex", justifyContent:"center", padding:"0 20px 10px" }}>
      <span className="mono" style={{ fontSize:10.5, letterSpacing:"0.06em", textTransform:"uppercase", color:"rgba(255,255,255,.42)", textAlign:"center" }}>{vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim} · {vehicle.engine || "Engine unavailable"}{due > 0 ? ` · ${due} due` : ""} · {mode}</span>
    </div>
  );
  return (
    <div style={{ flex:"0 0 auto", display:"flex", justifyContent:"center", padding:"0 16px 10px" }}>
      <button onClick={onOpen} style={{ display:"flex", alignItems:"center", gap:11, maxWidth:520, width: mobile ? "100%" : "auto", padding:"9px 13px", borderRadius:16, background:"rgba(255,255,255,.07)", border:"1px solid rgba(255,255,255,.14)", backdropFilter:"blur(10px)", cursor:"pointer", fontFamily:"var(--font-sans)", textAlign:"left" }}>
        <TwinMarkerDot evidence={hot} size={28} style={{flexShrink:0,borderWidth:1.5,boxShadow:'none'}}/>
        <span style={{ minWidth:0, flex:1 }}>
          <span style={{ display:"block", fontSize:13.5, fontWeight:600, color:"#fff", letterSpacing:"-0.01em", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{hot.label}</span>
          <span style={{ display:"block", fontSize:11, color:"rgba(255,255,255,.52)", marginTop:1 }}>{hot.sub}</span>
        </span>
        <span style={{ fontSize:11.5, fontWeight:600, color:"rgba(255,255,255,.75)", flexShrink:0 }}>Open tech tree</span>
        <Icon name="chevron" size={13} style={{ color:"rgba(255,255,255,.5)", flexShrink:0 }}/>
      </button>
    </div>
  );
}

function THMinComposer({ say, answer, mobile, hot, prefill }) {
  const mode = useTwinMode();
  return (
    <div style={{ flex:"0 0 auto", padding: mobile ? "0 12px 16px" : "0 26px 24px", display:"flex", justifyContent:"center" }}>
      <div style={{width:"100%",maxWidth:720}}><TwinChatComposer say={say} answer={answer} compact prefill={prefill} placeholder={hot ? `Ask about the ${hot.label.toLowerCase()}…` : mode === "owner" ? "Ask about your car…" : "Ask about this demo…"}/></div>
    </div>
  );
}

function THMinimal({ tc, mobile, onExit }) {
  const miles = useTwinMiles();
  const trees = useTwinTrees(TT_TREES);
  const [sel, setSel] = React.useState(null);
  const [branch, setBranch] = React.useState(null);
  const [startNode, setStartNode] = React.useState(null);
  const [chatPrefill, setChatPrefill] = React.useState(null);
  const chatPrefillSeq = React.useRef(0);
  const [nav, setNav] = React.useState(false);
  const [rail, setRail] = React.useState(() => { try { return localStorage.getItem("au7o.hubRail") !== "0"; } catch (e) { return true; } });
  const setRailOpen = v => { try { localStorage.setItem("au7o.hubRail", v ? "1" : "0"); } catch (e) {} setRail(v); };
  const [fb, setFb] = React.useState(false);
  const { bubble, say, clear } = useBubble(null);
  const askPart = React.useCallback((context) => {
    setBranch(null);
    setChatPrefill({ value:context, key:++chatPrefillSeq.current });
    say("Part and vehicle context loaded in the hub chat. Review or edit it, then send when ready.");
  }, [say]);
  const changeBranch = React.useCallback((nextBranch) => { setStartNode(null); setBranch(nextBranch); }, []);
  const closeTree = React.useCallback(() => setBranch(null), []);
  const [equipped] = useEquipped();
  const live = useTwinLive();
  const ownerEquipped = useTwinEquipment();
  const catalog = useTwinCatalog();
  const answer = useTwinGuideAnswer();
  const visibleHotspots = React.useMemo(
    () => projectTwinHotspots(catalog.hotspots, { mobile:Boolean(mobile), twinId:catalog.id }),
    [catalog.hotspots, catalog.id, mobile],
  );
  React.useEffect(() => {
    if (sel && !visibleHotspots.some((hotspot) => hotspot.id === sel)) setSel(null);
  }, [sel, visibleHotspots]);
  const hot = sel ? thHot(visibleHotspots.find(h => h.id === sel), live ? ownerEquipped : equipped, trees, miles) : null;

  const openTreeFor = id => { const target=id === "car" ? {branch:"car",node:null} : resolveTwinDeepLink(catalog,id,trees); if (!target.branch) return; setNav(false); setStartNode(target.node); setBranch(target.branch); };
  const tap = h => openMinimalHotspot({selected:sel,hotspot:h,select:setSel,open:openTreeFor});

  return (
    <div className={"ki-theme-" + tc.theme} style={{ height:"100dvh", display:"flex", background:"#080B12", color:"var(--ink)", fontFamily:"var(--font-sans)", overflow:"hidden", position:"relative" }}>
      {!mobile && rail && (
        <div style={{ flex:"0 0 264px", height:"100%", borderRight:"1px solid rgba(255,255,255,.08)", color:"var(--ink)" }}>
          <THSidebar onOpen={openTreeFor} onClose={()=>setRailOpen(false)} onFeedback={()=>setFb(true)} drawer/>
        </div>
      )}
      <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", overflow:"hidden", color:"#fff", position:"relative" }}>
      <THMinTop tc={tc} mobile={mobile} onExit={onExit} railOpen={!mobile && rail} onMenu={()=>{ if (mobile) setNav(true); else setRailOpen(!rail); }}/>
      <THMinStage sel={sel} onTap={tap} onBg={()=>setSel(null)} mobile={mobile}/>
      <THMinCaption hot={hot} mobile={mobile} onOpen={()=>sel && openTreeFor(sel)}/>
      {bubble && <THBubble bubble={bubble} clear={clear}/>}
      <THMinComposer say={say} answer={answer} mobile={mobile} hot={hot} prefill={chatPrefill}/>
      </div>
      {/* Drawer opens from the LEFT, matching the normal mobile hub (which omits
          justifyContent and so defaults to flex-start) and the desktop rail,
          which is docked left. The design file had this as flex-end. */}
      {nav && (
        <div onClick={()=>setNav(false)} style={{ position:"absolute", inset:0, zIndex:40, background:"rgba(8,11,18,.6)", display:"flex", justifyContent:"flex-start" }}>
          <div onClick={e=>e.stopPropagation()} style={{ height:"100%", boxShadow:"var(--shadow-2)" }}><THSidebar onOpen={openTreeFor} onClose={()=>setNav(false)} onFeedback={()=>{ setNav(false); setFb(true); }} drawer/></div>
        </div>
      )}
      {branch && <THTreeOverlay branch={branch} setBranch={changeBranch} onClose={closeTree} say={say} onPartHelp={askPart} startNode={startNode} mobile={mobile}/>}
      <THFeedback open={fb} onClose={()=>setFb(false)}/>
    </div>
  );
}


export { THMinimal as HubMinimal };
