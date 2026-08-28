"use client";
/* eslint-disable */
/**
 * The car stage — ported from `design/au7o (6)` (THStage in the hub module).
 * This is the thing a visitor actually touches: the car with pulsing hotspots
 * that open a tech tree. Same verbatim-port rationale as TechTree.jsx.
 *
 * Renamed THStage -> TwinStage on export; everything else is the design’s code
 * with globals turned into imports and asset paths pointed at /twin-stage/.
 */
import React from "react";
import { Icon } from "./Icon";
import { TT_TREES, ttHasUpgrade, ttFinish, useEquipped } from "./TechTree";
import { TWIN_DEMO_MILES, TWIN_DEMO_VEHICLE, useTwinEquipment, useTwinLive, useTwinVehicle, useTwinMiles, useTwinTrees, useTwinCatalog, useTwinMode } from "../twin-context";
import { collectHotspotNodes, summarizeEvidence } from "../demo-trees";
import { TwinMarkerDot, resolveTwinMarkerVisual } from "./TwinMarker";

/* Au7o Hub — tech tree direction.
   The hub greets you with your car. Click a part and the tech tree opens over it. */

/* Demo fallbacks only. A live hub supplies the owner's car and odometer
   through TwinDataCtx; these are what /demo/hub keeps showing. */
const TH_MILES = TWIN_DEMO_MILES;
const TH_V = TWIN_DEMO_VEHICLE;

const TH_HOTSPOTS = [
  { id:"wheel",     branch:"wheel",  label:"Wheel, Tire & Brakes", x:39.6, y:65.5 },
  { id:"hood",      branch:"engine", node:"oil",       label:"Engine",             x:61,   y:42 },
  { id:"glass",     branch:"wipers", label:"Windshield Wipers",    x:44,   y:29 },
  { id:"rearwheel", branch:"wheel",  node:"tire",      label:"Rear Wheel & Tire",  x:20.5, y:52.5 },
  { id:"rad",       branch:"engine", node:"rad",       label:"Radiator & Coolant", x:67,   y:58.5 },
];

const TH_SYSTEMS = [
  { hot:"wheel", branch:"wheel",  label:"Wheel, Tire & Brakes", img:"/twin-stage/parts/part-caliper.webp" },
  { hot:"hood",  branch:"engine", label:"Engine",               img:"/twin-stage/parts/part-engine.webp" },
  { hot:"trans", branch:"trans",  label:"Transmission",         img:"/twin-stage/parts/part-transmission.webp" },
  { hot:"glass", branch:"wipers", label:"Windshield Wipers",    img:"/twin-stage/parts/part-wipers.webp" },
];

/* These closed over the demo's tree set and 65,000 mi. They take both as
   arguments now, defaulting to the demo, so a live hub can pass the owner's. */
const thEvidence = (branch, trees = TT_TREES, miles = TH_MILES) => summarizeEvidence(collectHotspotNodes(trees, {branch}), miles);
const TH_DUE = thEvidence("car").due;
const thPartCount = (branch, trees = TT_TREES) => Object.keys(trees[branch].nodes).filter(k => !trees[branch].nodes[k].group).length;
const thMeta = (branch, trees = TT_TREES, miles = TH_MILES) => `${thPartCount(branch, trees)} parts · ${thEvidence(branch, trees, miles).label}`;
const thHot = (h, eq, trees = TT_TREES, miles = TH_MILES) => {
  if (!h || !trees[h.branch]) return null;
  const t = trees[h.branch];
  const nodes = collectHotspotNodes(trees, h).map((node) => (
    node.upgrade && eq?.[node.id] && node.upgrade.node?.resolved
      ? { ...node, knownIssue:null, upgraded:true, resolved:node.upgrade.node.resolved }
      : node
  ));
  const ids = nodes.map(node => node.id);
  const evidence = summarizeEvidence(nodes, miles);
  const due = evidence.due;
  const watch = evidence.watch;
  const parts = ids.filter(k => !t.nodes[k].group).length;
  const knownIssue = evidence.status === "known-issue";
  const unlogged = evidence.serviceStatus === "unlogged" || evidence.serviceStatus === "unavailable";
  const upgrade = ttHasUpgrade(t.nodes, ids, eq || {});
  return { ...h, status:evidence.status, risk: evidence.serviceStatus === "overdue", knownIssue, upgrade, unavailable:evidence.serviceStatus === "unavailable", unlogged, parts,
    due, watch, sub:evidence.label };
};
/* Status vocabulary — one triad, used everywhere:
   red + warning triangle = overdue on mileage · green + check = on track · purple + shield = known issue on record */
const TH_DOT = resolveTwinMarkerVisual;

const TH_ENTRY_MODES = [
  { id:"hotspots", label:"Hotspots", hint:"Pulsing markers sit on the car — hover to name the system, click to open its tree." },
  { id:"rail",     label:"Part rail", hint:"The car stays clean; systems live on a rail underneath with real part photos." },
  { id:"xray",     label:"X-ray",     hint:"The body goes transparent and every system is labelled at once." },
];

export const retainActiveHotspot = (active, hotspots) => (
  active && hotspots.some((hotspot) => hotspot.id === active) ? active : null
);

export const resolveActiveTwinEffect = (mode, active, effects) => (
  mode === "hotspots"
  && active
  && Object.prototype.hasOwnProperty.call(effects || {}, active)
    ? active
    : null
);
export const openTwinHotspot = (hotspot, setActive, onOpen) => {
  setActive(hotspot.id);
  onOpen(hotspot.id);
};

/* ── Hero stage ── */
/* The glow overlays sit at opacity:0, so a browser defers decoding them until
   the first hover — which is exactly when you notice the hitch. Decode them
   off the critical path once the stage has mounted, so the first hover is as
   smooth as the tenth. */
const GLOW_LAYERS = [
  "/twin-stage/car-wheel-highlight-glow.webp",
  "/twin-stage/car-hood-highlight-glow.webp",
  "/twin-stage/car-rear-wheel-highlight-glow.webp",
  "/twin-stage/car-radiator-highlight-glow.webp",
  "/twin-stage/car-xray.webp",
];

function THStage({ mode, setMode, onOpen, mobile, hideNote, noteDark, fill, allowFullscreen, onExpand }) {
  const [hover, setHover] = React.useState(null);
  const [expanded, setExpanded] = React.useState(false);
  const rootRef = React.useRef(null);

  /* Native fullscreen where it exists; iOS Safari refuses it for non-video
     elements, so .stage-expanded is the fallback that works everywhere. */
  const toggleExpand = (e) => {
    e.stopPropagation();
    /* The hub hands us a dedicated full-screen DESIGN to switch to, which beats
       blowing up the inline stage — see HubRoot. */
    if (onExpand) { onExpand(); return; }
    const el = rootRef.current;
    if (expanded || document.fullscreenElement) {
      if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
      setExpanded(false);
      return;
    }
    if (el && el.requestFullscreen) el.requestFullscreen().then(() => setExpanded(true)).catch(() => setExpanded(true));
    else setExpanded(true);
  };
  const live = useTwinLive();
  const vehicle = useTwinVehicle();
  const miles = useTwinMiles();
  const trees = useTwinTrees(TT_TREES);
  const catalog = useTwinCatalog();
  const twinMode = useTwinMode();
  const [equipped] = useEquipped();
  const finish = !live && catalog.id === "challenger" ? ttFinish() : null;
  const hotspots = catalog.hotspots;
  const systems = catalog.systems.filter(s => trees[s.branch]);
  const glowLayers = React.useMemo(() => Object.values(catalog.art.effects), [catalog.id, catalog.art.effects]);
  const [baseFailed, setBaseFailed] = React.useState(false);
  const [failedEffects, setFailedEffects] = React.useState({});
  React.useEffect(() => { setBaseFailed(false); setFailedEffects({}); }, [catalog.id]);
  React.useEffect(() => {
    const onFs = () => { if (!document.fullscreenElement) setExpanded(false); };
    const onKey = (ev) => { if (ev.key === "Escape") setExpanded(false); };
    document.addEventListener("fullscreenchange", onFs);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("fullscreenchange", onFs); document.removeEventListener("keydown", onKey); };
  }, []);
  React.useEffect(() => {
    let cancelled = false;
    const idle = window.requestIdleCallback || ((f) => setTimeout(f, 400));
    idle(() => {
      if (cancelled) return;
      for (const src of glowLayers) {
        const img = new Image();
        img.src = src;
        if (img.decode) img.decode().catch(() => { /* decode is best-effort */ });
      }
    });
    return () => { cancelled = true; };
  }, [glowLayers]);
  const [active, setActive] = React.useState(null);
  const hotspotKey = hotspots.map((hotspot) => hotspot.id).join("|");
  React.useEffect(() => {
    setActive((value) => retainActiveHotspot(value, hotspots));
    setHover((value) => retainActiveHotspot(value, hotspots));
  }, [hotspotKey]);
  const ownerEquipped = useTwinEquipment();
  const effectiveEquipped = live ? ownerEquipped : equipped;
  const dueCount = thEvidence("car", trees, miles).due;
  const cur = retainActiveHotspot(hover || active, hotspots);
  const lit = resolveActiveTwinEffect(mode, cur, catalog.art.effects);
  const tap = h => openTwinHotspot(h,setActive,onOpen);
  return (
    <div ref={rootRef} className={[expanded ? "stage-expanded" : "", fill ? "stage-fill" : ""].filter(Boolean).join(" ") || undefined}
      style={{ position:"relative", flex: "0 0 auto", borderRadius:16, overflow:"hidden", border:"1px solid var(--ki-line)", background:"#0A0D14", boxShadow:"var(--shadow-2)" }}>
      <div className="th-stage-frame" onClick={()=>setActive(null)} style={{ position:"relative", width:"100%", aspectRatio:"16 / 9" }}>
        {allowFullscreen && (
          <button onClick={toggleExpand} aria-label={expanded ? "Exit full screen" : "View full screen"} title={expanded ? "Exit full screen" : "View full screen"}
            style={{ position:"absolute", top:10, right:10, zIndex:7, width:36, height:36, borderRadius:10, cursor:"pointer", display:"grid", placeItems:"center", background:"rgba(10,13,20,.55)", backdropFilter:"blur(8px)", border:"1px solid rgba(255,255,255,.22)", color:"#fff" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              {expanded
                ? <><path d="M9 3v6H3M15 21v-6h6"/><path d="M3 15h6v6M21 9h-6V3"/></>
                : <><path d="M8 3H3v5M21 8V3h-5"/><path d="M3 16v5h5M16 21h5v-5"/></>}
            </svg>
          </button>
        )}
        {!baseFailed && (
          <img src={catalog.art.base} onError={()=>setBaseFailed(true)} alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`} style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }}/>
        )}
        {baseFailed && <div role="img" aria-label={`${vehicle.year} ${vehicle.make} ${vehicle.model} artwork unavailable`} style={{position:"absolute",inset:0,display:"grid",placeItems:"center",color:"rgba(255,255,255,.72)",fontSize:13,background:"radial-gradient(circle at 50% 45%,#182238,#080B12 70%)"}}>Vehicle artwork unavailable</div>}
        {catalog.id === "challenger" && (
          <img src="/twin-stage/car-wheels-bronze.webp" alt="" aria-hidden="true" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", opacity: !finish || finish.id === "oem" ? 0 : 1, filter: finish?.filter || "none", transition:"opacity .4s ease, filter .4s ease" }}/>
        )}
        {Object.entries(catalog.art.effects).filter(([id])=>!failedEffects[id]).map(([id, src]) => <img key={id} src={src} onError={()=>setFailedEffects(value=>({...value,[id]:true}))} alt="" aria-hidden="true" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", opacity:lit === id ? 1 : 0, transition:"opacity .32s ease", ...(catalog.art.strategy === "opaque-masked" ? {clipPath:catalog.art.masks?.[id]} : {}) }}/>) }
        {catalog.art.xray && (
          <img src={catalog.art.xray} alt="" aria-hidden="true" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", opacity:mode === "xray" ? 1 : 0 }}/>
        )}

        {mode !== "rail" && hotspots.map(h => thHot(h, effectiveEquipped, trees, miles)).filter(Boolean).map(h => {
          const on = cur === h.id, open = mode === "xray", above = h.y > 55, c = TH_DOT(h);
          return (
            <button key={h.id} onMouseEnter={()=>setHover(h.id)} onMouseLeave={()=>setHover(null)} onClick={e=>{ e.stopPropagation(); tap(h); }}
              aria-label={h.label}
              style={{ position:"absolute", left:h.x+"%", top:h.y+"%", transform:"translate(-50%,-50%)", width:mobile?44:"auto", height:mobile?44:"auto", display:"grid", placeItems:"center", background:"transparent", border:"none", padding:0, cursor:"pointer", zIndex: on ? 4 : 3, touchAction:"manipulation" }}>
              <TwinMarkerDot evidence={h} size={mobile?32:44} active={on} className={h.risk && !h.knownIssue && !h.upgrade ? "th-dot th-dot-risk" : "th-dot"}/>
              {(on || open) && (
                <span style={{ position:"absolute", left:"50%", transform:"translateX(-50%)", ...(above ? { bottom:"100%", marginBottom:9 } : { top:"100%", marginTop:9 }), whiteSpace:"nowrap", background:"rgba(10,13,20,.9)", border:`1px solid ${c.line}`, backdropFilter:"blur(8px)", borderRadius:9, padding:"6px 11px", textAlign:"left" }}>
                  <span style={{ display:"block", fontSize:12, fontWeight:600, color:"#fff", letterSpacing:"-0.01em" }}>{h.label}</span>
                  <span style={{ display:"block", fontSize:10, color:c.sub, marginTop:1 }}>{h.sub} · open tech tree</span>
                </span>
              )}
            </button>
          );
        })}

      </div>

      <div className="th-stage-meta" style={{ padding: mobile ? "11px 14px" : "13px 18px", background:"#0A0D14", borderTop:"1px solid rgba(255,255,255,.1)", display:"flex", alignItems:"flex-end", gap:12, flexWrap:"wrap" }}>
        <div style={{ minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:7 }}>
            <span className="au7o-pulse-soft" style={{ width:6, height:6, borderRadius:"50%", background:"#4CC9F0" }}/>
            <span className="eyebrow" style={{ color:"#8FDDF7", fontSize:9.5 }}>{twinMode === "owner" ? "Your garage · live" : "Public demo · sample state"}</span>
          </div>
          <div style={{ color:"#fff", fontSize: mobile?17:21, fontWeight:600, letterSpacing:"-0.02em", marginTop:4 }}>{vehicle.year} {vehicle.make} {vehicle.model} <span style={{ color:"rgba(255,255,255,.55)", fontWeight:500 }}>{vehicle.trim}</span></div>
          <div className="mono" style={{ color:"rgba(255,255,255,.6)", fontSize:11, marginTop:3 }}>{vehicle.engine || "Engine unavailable"} · {typeof miles === "number" ? `${miles.toLocaleString()} mi` : "Mileage unavailable"}</div>
        </div>
        <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:7, flexShrink:0 }}>
          {dueCount !== null && dueCount > 0 && <span className="mono" style={{ fontSize:10.5, fontWeight:600, padding:"3px 8px", borderRadius:999, background:"var(--ki-crit-bg)", color:"var(--ki-crit)", flexShrink:0 }}>{dueCount} due</span>}
        </div>
        <div style={{ flexBasis:"100%", display:"flex", alignItems:"center", gap: mobile ? 10 : 16, flexWrap:"wrap", paddingTop:10, marginTop:2, borderTop:"1px solid rgba(255,255,255,.09)", fontSize:10.5, color:"rgba(255,255,255,.62)" }}>
          {[["alert","#FF6B63","Overdue on service deadline"],["check","#35D69B","On track"],["shield-alert","#A78BFA","Known issue on record"]].map(([ic,c,l]) => (
            <span key={l} style={{ display:"inline-flex", alignItems:"center", gap:6 }}><Icon name={ic} size={12} stroke={ic==="check"?2.6:2} style={{ color:c }}/>{l}</span>
          ))}
        </div>
      </div>

      {mode === "rail" && (
        <div style={{ display:"flex", gap:8, padding:"11px 12px", background:"#0A0D14", borderTop:"1px solid rgba(255,255,255,.1)", overflowX:"auto" }}>
          {systems.map(s => (
            <button key={s.branch} onClick={()=>onOpen(s.hot)} style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0, background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.14)", borderRadius:12, padding:"8px 13px 8px 9px", cursor:"pointer", textAlign:"left", fontFamily:"var(--font-sans)" }}>
              <span style={{ width:34, height:34, borderRadius:9, overflow:"hidden", background:"rgba(255,255,255,.05)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                {s.img ? <img src={s.img} alt="" style={{ width:"124%", height:"124%", objectFit:"contain", filter:"brightness(1.6)" }}/> : <Icon name={s.icon} size={16} style={{ color:"rgba(255,255,255,.7)" }}/>}
              </span>
              <span style={{ minWidth:0 }}>
                <span style={{ display:"block", fontSize:12.5, fontWeight:600, color:"#fff", whiteSpace:"nowrap" }}>{s.label}</span>
                <span style={{ display:"block", fontSize:10, color:"rgba(255,255,255,.55)", whiteSpace:"nowrap", marginTop:1 }}>{thMeta(s.branch, trees, miles)}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}



export { THStage as TwinStage, TH_HOTSPOTS, TH_V, TH_MILES, TH_ENTRY_MODES, TH_DOT, thHot, TH_DUE };
