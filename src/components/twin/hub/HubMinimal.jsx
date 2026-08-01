"use client";
/* eslint-disable */
/**
 * The full-screen hub — ported from `design/au7o (11)` ("Minimal hub for the
 * web demo"): greeting on top, the car filling the middle, one composer at the
 * bottom. First tap on a marker selects it, second opens its tech tree.
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
import { TH_V, TH_MILES, TH_HOTSPOTS, TH_DOT, thHot, TH_DUE } from "../stage/TwinStage";
import { TT_BRANCH_FOR_HOTSPOT, TT_NODE_FOR_HOTSPOT, ttFinish, useEquipped } from "../stage/TechTree";
import { Au7oMark, ThemeDots, VoiceButton, useBubble } from "./hub-shared";
import { THSidebar, THBubble, THTreeOverlay, THFeedback } from "./Hub";

/* Minimal hub for the web demo — same idea as the phone's minimal screen:
   greeting at the top, the vehicle filling the middle, one composer at the bottom.
   First click on a marker highlights it, second click opens its tech tree. */

const THM_GLOW = {
  wheel: "/twin-stage/car-wheel-highlight-glow.webp",
  hood: "/twin-stage/car-hood-highlight-glow.webp",
  rearwheel: "/twin-stage/car-rear-wheel-highlight-glow.webp",
  rad: "/twin-stage/car-radiator-highlight-glow.webp",
  airbox: "/twin-stage/car-airbox-highlight-glow.webp",
};

function THMinTop({ tc, onMenu, mobile, railOpen, onExit }) {
  const h = new Date().getHours();
  const part = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  return (
    <div style={{ flex:"0 0 auto", padding: mobile ? "14px 16px 0" : "20px 26px 0" }}>
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <Au7oMark size={mobile ? 20 : 24} color="#fff"/>
        <div style={{ flex:1 }}/>
        <ThemeDots tc={tc} size={13}/>
        <span className="mono" style={{ fontSize:10.5, fontWeight:600, padding:"4px 9px", borderRadius:999, background:"rgba(255,255,255,.07)", border:"1px solid rgba(255,255,255,.14)", color:"rgba(255,255,255,.72)" }}>{TH_MILES.toLocaleString()} mi</span>
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
        {part}, Jordan.<span style={{ color:"rgba(255,255,255,.42)", fontWeight:500 }}> Click any part.</span>
      </h1>
    </div>
  );
}

function THMinStage({ sel, onTap, onBg, mobile }) {
  const [hover, setHover] = React.useState(null);
  const [equipped] = useEquipped();
  const lit = hover || sel;
  const boxRef = React.useRef(null);
  const [fit, setFit] = React.useState(null);
  const ar = mobile ? 4 / 3 : 16 / 9;
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
        <img src="/twin-stage/car-base.webp" alt={`${TH_V.year} ${TH_V.make} ${TH_V.model}`} style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"contain" }}/>
        <img src="/twin-stage/car-wheels-bronze.webp" alt="" aria-hidden="true" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"contain", opacity: ttFinish().id === "oem" ? 0 : 1, filter: ttFinish().filter || "none", transition:"opacity .4s ease" }}/>
        {Object.keys(THM_GLOW).map(k => (
          <img key={k} src={THM_GLOW[k]} alt="" aria-hidden="true" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"contain", opacity: lit === k ? 1 : 0, transition:"opacity .3s ease", pointerEvents:"none" }}/>
        ))}
        {TH_HOTSPOTS.map(h0 => thHot(h0, equipped)).map(h => {
          const on = sel === h.id || hover === h.id, above = h.y > 55, c = TH_DOT(h);
          return (
            <button key={h.id} onMouseEnter={()=>setHover(h.id)} onMouseLeave={()=>setHover(null)} onClick={e=>{ e.stopPropagation(); onTap(h); }} aria-label={h.label}
              style={{ position:"absolute", left:h.x+"%", top:h.y+"%", transform:"translate(-50%,-50%)", background:"transparent", border:"none", padding:0, cursor:"pointer", zIndex: on ? 4 : 3 }}>
              <span className={h.risk && !h.upgrade ? "th-dot th-dot-risk" : "th-dot"} style={{ display:"grid", placeItems:"center", width: mobile?34:42, height: mobile?34:42, borderRadius:"50%", border:`2px solid ${c.edge}`, background:c.fill, boxShadow:`0 0 ${on?26:14}px ${c.glow}`, transform: on ? "scale(1.14)" : "scale(1)", transition:"all .22s ease" }}>
                <Icon name={c.icon} size={mobile?16:18} stroke={c.icon==="check"?2.6:2} style={{ color:c.ink }}/>
              </span>
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
  if (!hot) return (
    <div style={{ flex:"0 0 auto", display:"flex", justifyContent:"center", padding:"0 20px 10px" }}>
      <span className="mono" style={{ fontSize:10.5, letterSpacing:"0.06em", textTransform:"uppercase", color:"rgba(255,255,255,.42)", textAlign:"center" }}>{TH_V.year} {TH_V.make} {TH_V.model} {TH_V.trim} · {TH_V.engine} · {TH_DUE} due</span>
    </div>
  );
  const c = TH_DOT(hot);
  return (
    <div style={{ flex:"0 0 auto", display:"flex", justifyContent:"center", padding:"0 16px 10px" }}>
      <button onClick={onOpen} style={{ display:"flex", alignItems:"center", gap:11, maxWidth:520, width: mobile ? "100%" : "auto", padding:"9px 13px", borderRadius:16, background:"rgba(255,255,255,.07)", border:"1px solid rgba(255,255,255,.14)", backdropFilter:"blur(10px)", cursor:"pointer", fontFamily:"var(--font-sans)", textAlign:"left" }}>
        <span style={{ width:28, height:28, borderRadius:999, display:"grid", placeItems:"center", background:c.fill, border:`1.5px solid ${c.edge}`, flexShrink:0 }}><Icon name={c.icon} size={14} stroke={c.icon==="check"?2.6:2} style={{ color:c.ink }}/></span>
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

function THMinComposer({ say, mobile, hot }) {
  return (
    <div style={{ flex:"0 0 auto", padding: mobile ? "0 12px 16px" : "0 26px 24px", display:"flex", justifyContent:"center" }}>
      <div style={{ width:"100%", maxWidth:720, display:"flex", alignItems:"center", gap:8, padding:"9px 9px 9px 16px", borderRadius:18, background:"rgba(255,255,255,.08)", border:"1px solid rgba(255,255,255,.16)", backdropFilter:"blur(14px)" }}>
        <span style={{ flex:1, fontSize:13.5, color:"rgba(255,255,255,.5)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{hot ? `Ask about the ${hot.label.toLowerCase()}…` : "Ask about your car…"}</span>
        <button className="chip chip-sm" style={{ background:"rgba(255,255,255,.09)", border:"1px solid rgba(255,255,255,.14)", color:"rgba(255,255,255,.8)" }}><Icon name="camera" size={12}/></button>
        <VoiceButton compact say={say}/>
        <button aria-label="Send" style={{ background:"var(--au7o-blue, #3B82F6)", border:"none", color:"#fff", width:32, height:32, borderRadius:999, cursor:"pointer", display:"grid", placeItems:"center", flexShrink:0 }}><Icon name="send" size={13}/></button>
      </div>
    </div>
  );
}

function THMinimal({ tc, mobile, onExit }) {
  const [sel, setSel] = React.useState(null);
  const [branch, setBranch] = React.useState(null);
  const [startNode, setStartNode] = React.useState(null);
  const [nav, setNav] = React.useState(false);
  const [rail, setRail] = React.useState(() => { try { return localStorage.getItem("au7o.hubRail") !== "0"; } catch (e) { return true; } });
  const setRailOpen = v => { try { localStorage.setItem("au7o.hubRail", v ? "1" : "0"); } catch (e) {} setRail(v); };
  const [fb, setFb] = React.useState(false);
  const { bubble, say, clear } = useBubble(null);
  const [equipped] = useEquipped();
  const hot = sel ? thHot(TH_HOTSPOTS.find(h => h.id === sel), equipped) : null;

  const openTreeFor = id => { setNav(false); setStartNode(TT_NODE_FOR_HOTSPOT[id] || null); setBranch(id === "car" ? "car" : TT_BRANCH_FOR_HOTSPOT[id]); };
  const tap = h => { if (sel !== h.id) { setSel(h.id); return; } openTreeFor(h.id); };

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
      <THMinComposer say={say} mobile={mobile} hot={hot}/>
      </div>
      {/* Drawer opens from the LEFT, matching the normal mobile hub (which omits
          justifyContent and so defaults to flex-start) and the desktop rail,
          which is docked left. The design file had this as flex-end. */}
      {nav && (
        <div onClick={()=>setNav(false)} style={{ position:"absolute", inset:0, zIndex:40, background:"rgba(8,11,18,.6)", display:"flex", justifyContent:"flex-start" }}>
          <div onClick={e=>e.stopPropagation()} style={{ height:"100%", boxShadow:"var(--shadow-2)" }}><THSidebar onOpen={openTreeFor} onClose={()=>setNav(false)} onFeedback={()=>{ setNav(false); setFb(true); }} drawer/></div>
        </div>
      )}
      {branch && <THTreeOverlay branch={branch} setBranch={b=>{ setStartNode(null); setBranch(b); }} onClose={()=>setBranch(null)} say={say} startNode={startNode} mobile={mobile}/>}
      <THFeedback open={fb} onClose={()=>setFb(false)}/>
    </div>
  );
}


export { THMinimal as HubMinimal };
