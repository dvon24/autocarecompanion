/* Au7o Hub — tech tree direction.
   The hub greets you with your car. Click a part and the tech tree opens over it. */

const TH_MILES = 65000;
const TH_V = { year:2015, make:"Dodge", model:"Challenger", trim:"SRT 392", engine:"6.4L V8 HEMI" };

const TH_HOTSPOTS = [
  { id:"wheel",     branch:"wheel",  label:"Wheel, Tire & Brakes", x:39.6, y:65.5 },
  { id:"hood",      branch:"engine", node:"oil",       label:"Engine",             x:61,   y:42 },
  { id:"glass",     branch:"wipers", label:"Windshield Wipers",    x:44,   y:29 },
  { id:"rearwheel", branch:"wheel",  node:"tire",      label:"Rear Wheel & Tire",  x:20.5, y:52.5 },
  { id:"rad",       branch:"engine", node:"rad",       label:"Radiator & Coolant", x:67,   y:58.5 },
  { id:"airbox",    branch:"engine", node:"airFilter", label:"Engine Air Filter",  x:78.5, y:42.5 },
];

const TH_SYSTEMS = [
  { hot:"wheel", branch:"wheel",  label:"Wheel, Tire & Brakes", img:"assets/part-caliper.webp" },
  { hot:"hood",  branch:"engine", label:"Engine",               img:"assets/part-engine.webp" },
  { hot:"trans", branch:"trans",  label:"Transmission",         img:"assets/part-transmission.png" },
  { hot:"glass", branch:"wipers", label:"Windshield Wipers",    img:"assets/part-wipers.webp" },
];

const thCount = (branch, kind) => {
  const t = TT_TREES[branch];
  if (!t) return 0;
  return Object.keys(t.nodes).filter(k => k !== t.root && ttRisk(t.nodes[k], TH_MILES) === kind).length;
};
const TH_DUE = thCount("car", "critical");
const TH_WATCH = thCount("car", "watch");
const thPartCount = branch => Object.keys(TT_TREES[branch].nodes).filter(k => !TT_TREES[branch].nodes[k].group).length;
const thMeta = branch => `${thPartCount(branch)} parts · ${thCount(branch, "critical")} due · ${thCount(branch, "watch")} watch`;
const thHot = (h, eq) => {
  const t = TT_TREES[h.branch];
  const ids = [];
  const walk = id => { ids.push(id); (t.nodes[id].kids || []).forEach(walk); };
  if (h.node) walk(h.node); else (t.nodes[t.root].kids || []).forEach(walk);
  const due = ids.filter(k => ttRisk(t.nodes[k], TH_MILES) === "critical").length;
  const watch = ids.filter(k => ttRisk(t.nodes[k], TH_MILES) === "watch").length;
  const parts = ids.filter(k => !t.nodes[k].group).length;
  const upgrade = ttHasUpgrade(t.nodes, ids, eq || {});
  return { ...h, risk: due > 0, upgrade, parts, sub: upgrade ? (due ? `${due} due · 1 upgrade` : "1 upgrade available") : due ? `${due} due` : watch ? `${watch} to watch` : "On track" };
};
/* Status vocabulary — one triad, used everywhere:
   red + warning triangle = overdue on mileage · green + check = on track · purple + shield = known issue on record */
const TH_DOT = h => h.upgrade
  ? { icon:"shield-alert", edge:"#A78BFA", fill:"rgba(139,92,246,.2)", glow:"rgba(139,92,246,.7)", ink:"#EDE4FF", sub:"#C9B6FF", line:"rgba(167,139,250,.5)" }
  : h.risk
  ? { icon:"alert", edge:"#FF6B63", fill:"rgba(255,107,99,0.16)", glow:"rgba(255,107,99,.7)", ink:"#FFD9D6", sub:"#FF9C96", line:"rgba(255,107,99,.5)" }
  : { icon:"check", edge:"#35D69B", fill:"rgba(53,214,155,0.16)", glow:"rgba(53,214,155,.6)", ink:"#D8FFF0", sub:"#7FE9C4", line:"rgba(53,214,155,.45)" };

const TH_ENTRY_MODES = [
  { id:"hotspots", label:"Hotspots", hint:"Pulsing markers sit on the car — hover to name the system, click to open its tree." },
  { id:"rail",     label:"Part rail", hint:"The car stays clean; systems live on a rail underneath with real part photos." },
  { id:"xray",     label:"X-ray",     hint:"The body goes transparent and every system is labelled at once." },
];

/* ── Hero stage ── */
function THStage({ mode, setMode, onOpen, mobile, hideNote, noteDark }) {
  const [hover, setHover] = React.useState(null);
  const [active, setActive] = React.useState(null);
  const [equipped] = useEquipped();
  const cur = hover || active;
  const lit = mode === "hotspots" && ["wheel","hood","rad","airbox","rearwheel"].includes(cur) ? cur : null;
  const tap = h => { if (mobile && active !== h.id) { setActive(h.id); return; } setActive(h.id); onOpen(h.id); };
  return (
    <div style={{ position:"relative", flex:"0 0 auto", borderRadius:16, overflow:"hidden", border:"1px solid var(--ki-line)", background:"#0A0D14", boxShadow:"var(--shadow-2)" }}>
      <div className="th-stage-frame" onClick={()=>setActive(null)} style={{ position:"relative", width:"100%", aspectRatio:"16 / 9" }}>
        <img src="assets/car-base.webp" alt={`${TH_V.year} ${TH_V.make} ${TH_V.model}`} style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }}/>
        <img src="assets/car-wheels-bronze.webp" alt="" aria-hidden="true" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", opacity: ttFinish().id === "oem" ? 0 : 1, filter: ttFinish().filter || "none", transition:"opacity .4s ease, filter .4s ease" }}/>
        <img src="assets/car-wheel-highlight-glow.webp" alt="" aria-hidden="true" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", opacity: lit === "wheel" ? 1 : 0, transition:"opacity .32s ease" }}/>
        <img src="assets/car-hood-highlight-glow.webp" alt="" aria-hidden="true" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", opacity: lit === "hood" ? 1 : 0, transition:"opacity .32s ease" }}/>
        <img src="assets/car-rear-wheel-highlight-glow.webp" alt="" aria-hidden="true" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", opacity: lit === "rearwheel" ? 1 : 0, transition:"opacity .32s ease" }}/>
        <img src="assets/car-radiator-highlight-glow.webp" alt="" aria-hidden="true" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", opacity: lit === "rad" ? 1 : 0, transition:"opacity .32s ease" }}/>
        <img src="assets/car-airbox-highlight-glow.webp" alt="" aria-hidden="true" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", opacity: lit === "airbox" ? 1 : 0, transition:"opacity .32s ease" }}/>
        <img src="assets/car-xray.webp" alt="" aria-hidden="true" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", opacity: mode === "xray" ? 1 : 0, transition:"opacity .45s ease" }}/>

        {mode !== "rail" && TH_HOTSPOTS.map(h => thHot(h, equipped)).map(h => {
          const on = cur === h.id, open = mode === "xray", above = h.y > 55, c = TH_DOT(h);
          return (
            <button key={h.id} onMouseEnter={()=>setHover(h.id)} onMouseLeave={()=>setHover(null)} onClick={e=>{ e.stopPropagation(); tap(h); }}
              aria-label={h.label}
              style={{ position:"absolute", left:h.x+"%", top:h.y+"%", transform:"translate(-50%,-50%)", background:"transparent", border:"none", padding:0, cursor:"pointer", zIndex: on ? 4 : 3 }}>
              <span className={h.risk && !h.upgrade ? "th-dot th-dot-risk" : "th-dot"} style={{ display:"flex", alignItems:"center", justifyContent:"center", width: mobile?32:44, height: mobile?32:44, borderRadius:"50%", border:`2px solid ${c.edge}`, background:c.fill, boxShadow:`0 0 ${on?26:14}px ${c.glow}`, transform: on ? "scale(1.14)" : "scale(1)", transition:"all .22s ease" }}>
                <Icon name={c.icon} size={mobile?15:19} stroke={c.icon==="check"?2.6:2} style={{ color:c.ink }}/>
              </span>
              {(on || open) && (
                <span style={{ position:"absolute", left:"50%", transform:"translateX(-50%)", ...(above ? { bottom:"100%", marginBottom:9 } : { top:"100%", marginTop:9 }), whiteSpace:"nowrap", background:"rgba(10,13,20,.9)", border:`1px solid ${c.line}`, backdropFilter:"blur(8px)", borderRadius:9, padding:"6px 11px", textAlign:"left" }}>
                  <span style={{ display:"block", fontSize:12, fontWeight:600, color:"#fff", letterSpacing:"-0.01em" }}>{h.label}</span>
                  <span style={{ display:"block", fontSize:10, color:c.sub, marginTop:1 }}>{h.sub} · {mobile && active !== h.id ? "tap again to open" : "open tech tree"}</span>
                </span>
              )}
            </button>
          );
        })}

      </div>

      <div style={{ padding: mobile ? "11px 14px" : "13px 18px", background:"#0A0D14", borderTop:"1px solid rgba(255,255,255,.1)", display:"flex", alignItems:"flex-end", gap:12, flexWrap:"wrap" }}>
        <div style={{ minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:7 }}>
            <span className="au7o-pulse-soft" style={{ width:6, height:6, borderRadius:"50%", background:"#4CC9F0" }}/>
            <span className="eyebrow" style={{ color:"#8FDDF7", fontSize:9.5 }}>Your garage · live</span>
          </div>
          <div style={{ color:"#fff", fontSize: mobile?17:21, fontWeight:600, letterSpacing:"-0.02em", marginTop:4 }}>{TH_V.year} {TH_V.make} {TH_V.model} <span style={{ color:"rgba(255,255,255,.55)", fontWeight:500 }}>{TH_V.trim}</span></div>
          <div className="mono" style={{ color:"rgba(255,255,255,.6)", fontSize:11, marginTop:3 }}>{TH_V.engine} · {TH_MILES.toLocaleString()} mi</div>
        </div>
        <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:7, flexShrink:0 }}>
          <span className="mono" style={{ fontSize:10.5, fontWeight:600, padding:"3px 8px", borderRadius:999, background:"var(--ki-crit-bg)", color:"var(--ki-crit)", flexShrink:0 }}>{TH_DUE} due</span>
        </div>
        <div style={{ flexBasis:"100%", display:"flex", alignItems:"center", gap: mobile ? 10 : 16, flexWrap:"wrap", paddingTop:10, marginTop:2, borderTop:"1px solid rgba(255,255,255,.09)", fontSize:10.5, color:"rgba(255,255,255,.62)" }}>
          {[["alert","#FF6B63","Overdue on mileage"],["check","#35D69B","On track"],["shield-alert","#A78BFA","Known issue — fix available"]].map(([ic,c,l]) => (
            <span key={l} style={{ display:"inline-flex", alignItems:"center", gap:6 }}><Icon name={ic} size={12} stroke={ic==="check"?2.6:2} style={{ color:c }}/>{l}</span>
          ))}
        </div>
      </div>

      {mode === "rail" && (
        <div style={{ display:"flex", gap:8, padding:"11px 12px", background:"#0A0D14", borderTop:"1px solid rgba(255,255,255,.1)", overflowX:"auto" }}>
          {TH_SYSTEMS.map(s => (
            <button key={s.branch} onClick={()=>onOpen(s.hot)} style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0, background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.14)", borderRadius:12, padding:"8px 13px 8px 9px", cursor:"pointer", textAlign:"left", fontFamily:"var(--font-sans)" }}>
              <span style={{ width:34, height:34, borderRadius:9, overflow:"hidden", background:"rgba(255,255,255,.05)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                {s.img ? <img src={s.img} alt="" style={{ width:"124%", height:"124%", objectFit:"contain", filter:"brightness(1.6)" }}/> : <Icon name={s.icon} size={16} style={{ color:"rgba(255,255,255,.7)" }}/>}
              </span>
              <span style={{ minWidth:0 }}>
                <span style={{ display:"block", fontSize:12.5, fontWeight:600, color:"#fff", whiteSpace:"nowrap" }}>{s.label}</span>
                <span style={{ display:"block", fontSize:10, color:"rgba(255,255,255,.55)", whiteSpace:"nowrap", marginTop:1 }}>{thMeta(s.branch)}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Sidebar — systems double as a second way in ── */
/* Life bars — the bar IS the maintenance window, so it drains as the window runs down:
   full and green when the part is fresh, orange through the middle, red on the last fifth.
   Parts Au7o has a record for read the tech tree's own life figure; the rest count up from the
   owner's-manual interval. Each row says which, so an estimate never reads like a sensor. */
const TH_LIFE_CAR = ["oilFluid", "coolant"];
const thLifeInk = left => left >= 50 ? "#12855A" : left >= 22 ? "#B4661F" : "var(--ki-crit)";
const thLifeFill = left => left >= 50 ? "#16A46B" : left >= 22 ? "#D9822B" : "#E5484D";
function thLifeRows(n) {
  if (typeof TS_ITEMS === "undefined") return [];
  const nodes = TT_TREES.car.nodes;
  const lanes = tsLanes(TH_MILES);
  const next = lanes.find(l => tsState(l.mi, TH_MILES) === "next");
  const nextIds = (next ? next.items : []).map(i => i.id);
  const row = it => {
    const nd = (it.nodes || (it.node ? [it.node] : [])).map(id => nodes[id]).find(Boolean);
    const span = nd && nd.riskAt ? nd.riskAt : it.every;
    const due = nd && nd.riskAt ? (ttNextDue(nd) || nd.riskAt) : Math.ceil((TH_MILES + 1) / it.every) * it.every;
    return { id:it.id, label:it.label, due, left: due - TH_MILES, qty:it.qty,
      pct: Math.max(2, ((TH_MILES - (due - span)) / span) * 100),
      src: TH_LIFE_CAR.indexOf(it.node) >= 0 ? "read from the car" : "from your mileage" };
  };
  const ranked = TS_ITEMS.filter(it => it.cost && !it.labour).map(row)
    .sort((a,b) => (nextIds.indexOf(b.id) >= 0) - (nextIds.indexOf(a.id) >= 0) || b.pct - a.pct);
  /* always keep one window that is still open, so the card shows a running gauge and not
     three spent rails — the nearest part with life left earns the last slot */
  const rows = ranked.slice(0, Math.max(1, n - 1));
  const open = ranked.filter(r => r.left > 0).sort((a,b) => a.left - b.left)[0];
  if (open && rows.indexOf(open) < 0) rows.push(open);
  return rows.concat(ranked.filter(r => rows.indexOf(r) < 0)).slice(0, n);
}
const thLifeWhen = r => r.left > 0 ? "in " + r.left.toLocaleString() + " mi" : r.left === 0 ? "due now" : (-r.left).toLocaleString() + " mi past due";
function THLifeBar({ pct }) {
  const left = Math.max(0, Math.min(100, 100 - pct));
  const spent = pct >= 100;
  return (
    <div style={{ position:"relative", height:6, borderRadius:999, background: spent ? "rgba(229,72,77,.16)" : "var(--ki-page)", overflow:"hidden" }}>
      <div style={{ position:"absolute", left:0, top:0, bottom:0, width: spent ? "8%" : left + "%", borderRadius:999, background: spent ? "#E5484D" : thLifeFill(left), transition:"width .5s ease, background .3s ease" }}/>
    </div>
  );
}

/* the rail's next-service card reads the schedule, so it can't drift from the lane it opens */
function thNextStop() {
  if (typeof tsLanes === "undefined") return null;
  const lanes = tsLanes(TH_MILES);
  const lane = lanes.find(l => tsState(l.mi, TH_MILES) === "next") || lanes[0];
  if (!lane) return null;
  const labels = lane.items.map(i => i.label.replace(/ ?(&|and) /g, " & "));
  const what = labels.slice(0, 2).join(", ").toLowerCase() + (labels.length > 2 ? " +" + (labels.length - 2) : "");
  const parts = typeof tsBuyList !== "undefined" ? tsBuyList(lane.items).total : null;
  const away = lane.mi - TH_MILES;
  const line = [away > 0 ? "in " + away.toLocaleString() + " mi" : "due now",
    "$" + tsCost(lane.items).toLocaleString() + " at this stop",
    parts != null ? "$" + parts.toLocaleString() + " in parts" : null].filter(Boolean).join(" · ");
  return { mi: lane.mi, what, line };
}
function THSidebar({ onOpen, onClose, drawer, onFeedback, onSchedule, onOrder }) {
  const next = React.useMemo(thNextStop, []);
  const rows = React.useMemo(() => thLifeRows(3), []);
  const orderN = React.useMemo(() => (typeof tsDueList === "undefined" ? 0 : tsBuyList(tsDueList(TH_MILES).items).buy.length), []);
  return (
    <aside style={{ width:264, flex:"0 0 264px", borderRight: drawer ? "none" : "1px solid var(--ki-line)", background:"var(--ki-card)", display:"flex", flexDirection:"column", height:"100%" }}>
      <div style={{ padding:"18px 20px 14px", display:"flex", alignItems:"center" }}>
        <Au7oMark size={24}/>
        {drawer && <button onClick={onClose} style={{ marginLeft:"auto", background:"transparent", border:"none", color:"var(--slate-400)", cursor:"pointer", display:"flex", padding:4 }}><Icon name="x" size={16}/></button>}
      </div>
      <div className="web-scroll" style={{ flex:1, minHeight:0, overflowY:"auto" }}>
        <div style={{ padding:"0 14px" }}>
          <KICard>
            <div style={{ height:112, background:"#0A0D14" }}><img src="assets/car-base.webp" alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/></div>
            <div style={{ padding:"11px 13px 13px" }}>
              <div style={{ fontSize:13.5, fontWeight:600, letterSpacing:"-0.01em" }}>{TH_V.year} {TH_V.make} {TH_V.model}</div>
              <div style={{ fontSize:11.5, color:"var(--slate-500)", marginTop:1 }}>{TH_V.trim} · <span className="mono">{TH_MILES.toLocaleString()} mi</span></div>
              <div style={{ display:"flex", gap:5, marginTop:9, flexWrap:"wrap" }}>
                <span className="mono" style={{ fontSize:10.5, fontWeight:600, padding:"3px 8px", borderRadius:6, background:"var(--ki-crit-bg)", color:"var(--ki-crit)" }}>{TH_DUE} due</span>
                <span className="mono" style={{ fontSize:10.5, fontWeight:600, padding:"3px 8px", borderRadius:6, background:"var(--ki-mod-bg)", color:"var(--ki-mod-ink)" }}>{TH_WATCH} watch</span>
              </div>
            </div>
          </KICard>
        </div>
        <div style={{ padding:"14px 14px 0" }}>
          <KICard>
            <button onClick={()=>onSchedule && onSchedule()} title="Open the service schedule" style={{ display:"block", width:"100%", padding:0, textAlign:"left", background:"transparent", border:"none", cursor:"pointer", fontFamily:"var(--font-sans)", color:"var(--ink)" }}>
              <div style={{ padding:"11px 14px", display:"flex", alignItems:"center", gap:8 }}>
                <span className="eyebrow" style={{ fontSize:10 }}>Next service</span>
                <span style={{ marginLeft:"auto" }}><SevBadge kind="Overdue"/></span>
              </div>
              <div style={{ padding:"0 14px 4px" }}>
                <div style={{ fontSize:13, fontWeight:600 }}>{next ? next.mi.toLocaleString() + " mi · " + next.what : TH_DUE + " parts past due"}</div>
                <div className="mono" style={{ fontSize:11, color:"var(--ki-crit)", marginTop:2 }}>{next ? next.line : "Open the schedule to see what lands next"}</div>
              </div>
            </button>
            <div style={{ padding:"10px 14px 0", display:"flex", flexDirection:"column", gap:10 }}>
              {rows.map(r => (
                <div key={r.id}>
                  <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
                    <span style={{ minWidth:0, flex:1, fontSize:11.5, fontWeight:600, letterSpacing:"-0.01em", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{r.label}</span>
                    <span className="mono" style={{ flexShrink:0, fontSize:10, fontWeight:600, color:thLifeInk(100 - r.pct) }}>{thLifeWhen(r)}</span>
                  </div>
                  <div style={{ marginTop:5 }}><THLifeBar pct={r.pct}/></div>
                  <div style={{ fontSize:9.5, color:"var(--slate-400)", marginTop:4 }}>{r.left > 0 ? Math.round(100 - r.pct) + "% of life left · " + r.src : r.left === 0 ? "window closes now · " + r.src : "past its life · " + r.src}</div>
                </div>
              ))}
            </div>
            <div style={{ padding:"11px 14px 13px", display:"flex", flexDirection:"column", gap:7 }}>
              <div style={{ fontSize:10, color:"var(--slate-400)", lineHeight:1.45, textWrap:"pretty" }}>Oil life comes off the car's own monitor when Au7o is plugged in. Everything else counts up from the odometer reading you enter.</div>
              {orderN > 0 && (
                <button onClick={()=>onOrder && onOrder()} style={{ minHeight:38, borderRadius:10, border:"none", cursor:"pointer", background:"var(--ink)", color:"var(--ki-page)", fontFamily:"var(--font-sans)", fontSize:12, fontWeight:600, display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1.5 2h1.7l1.6 6.4h6.1l1.6-4.6H4"/><circle cx="5.6" cy="11.4" r="1.1"/><circle cx="10.6" cy="11.4" r="1.1"/></svg>
                  Everything to order · {orderN}
                </button>
              )}
              <button onClick={()=>onSchedule && onSchedule()} style={{ minHeight:34, borderRadius:10, border:"1px solid var(--ki-line)", background:"transparent", cursor:"pointer", color:"var(--au7o-blue)", fontFamily:"var(--font-sans)", fontSize:11.5, fontWeight:600, display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}>Open the schedule<Icon name="chevron" size={11}/></button>
            </div>
          </KICard>
        </div>
        <div style={{ padding:"16px 20px 7px" }} className="eyebrow">Tech trees</div>
        <div style={{ padding:"0 8px 2px" }}>
          <button onClick={()=>onOpen("car")} style={{ width:"100%", display:"flex", alignItems:"center", gap:10, background:"transparent", border:"none", padding:"7px 12px", borderRadius:10, cursor:"pointer", textAlign:"left", color:"var(--ink)", fontFamily:"var(--font-sans)" }}>
            <span style={{ width:28, height:28, borderRadius:8, overflow:"hidden", background:"#0d1017", border:"1px solid var(--ki-line)", flexShrink:0 }}><img src="assets/thumbs/car-base.webp" alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/></span>
            <span style={{ minWidth:0, flex:1 }}>
              <span style={{ display:"block", fontSize:12.5, fontWeight:600 }}>Whole car</span>
              <span style={{ display:"block", fontSize:10.5, color:"var(--slate-500)" }}>{TH_SYSTEMS.length} systems · {TH_DUE} due</span>
            </span>
            <Icon name="chevron" size={12} style={{ color:"var(--slate-400)" }}/>
          </button>
        </div>
        <div style={{ padding:"0 8px", display:"flex", flexDirection:"column", gap:2 }}>
          {TH_SYSTEMS.map(s => (
            <button key={s.branch} onClick={()=>onOpen(s.hot)} style={{ display:"flex", alignItems:"center", gap:10, background:"transparent", border:"none", padding:"7px 12px", borderRadius:10, cursor:"pointer", textAlign:"left", color:"var(--ink)", fontFamily:"var(--font-sans)" }}>
              <span style={{ width:28, height:28, borderRadius:8, overflow:"hidden", background:"#0d1017", border:"1px solid var(--ki-line)", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                {s.img ? <img src={s.img} alt="" style={{ width:"128%", height:"128%", objectFit:"contain", filter:"brightness(1.6)" }}/> : <Icon name={s.icon} size={15} style={{ color:"var(--slate-400)" }}/>}
              </span>
              <span style={{ minWidth:0, flex:1 }}>
                <span style={{ display:"block", fontSize:12.5, fontWeight:500, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{s.label}</span>
                <span style={{ display:"block", fontSize:10.5, color:"var(--slate-500)" }}>{thMeta(s.branch)}</span>
              </span>
              <Icon name="chevron" size={12} style={{ color:"var(--slate-400)" }}/>
            </button>
          ))}
        </div>
        <div style={{ padding:"16px 20px 6px" }} className="eyebrow">Recent</div>
        <div style={{ padding:"0 8px 10px", display:"flex", flexDirection:"column", gap:2 }}>
          {[{ t:"Swollen lug nuts — why?", w:"2d ago", i:"search" }, { t:"Photo of my front rotor", w:"6d ago", i:"camera" }, { t:"0W-40 vs 5W-20 on a 392", w:"1w ago", i:"chat" }].map((t,i)=>(
            <button key={i} style={{ display:"flex", alignItems:"center", gap:10, background:"transparent", border:"none", padding:"8px 12px", borderRadius:10, cursor:"pointer", textAlign:"left", color:"var(--ink)", fontFamily:"var(--font-sans)" }}>
              <Icon name={t.i} size={13} style={{ color:"var(--slate-400)" }}/>
              <span style={{ minWidth:0, flex:1 }}>
                <span style={{ display:"block", fontSize:12.5, fontWeight:500, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{t.t}</span>
                <span style={{ display:"block", fontSize:10.5, color:"var(--slate-500)" }}>{t.w}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
      <div style={{ borderTop:"1px solid var(--ki-line)", padding:"10px 8px", display:"flex", flexDirection:"column" }}>
        {[["map","Open Drive"],["book","Known Issues"],["chat","Send feedback"],["plus","Add vehicle"]].map(([ic,label],i)=>(
          <button key={i} onClick={label === "Send feedback" ? onFeedback : undefined} style={{ display:"flex", alignItems:"center", gap:10, background:"transparent", border:"none", padding:"9px 12px", borderRadius:10, cursor:"pointer", fontSize:12.5, fontWeight:500, color:"var(--ink)", fontFamily:"var(--font-sans)" }}>
            <Icon name={ic} size={14} style={{ color:"var(--slate-400)" }}/>{label}
          </button>
        ))}
      </div>
    </aside>
  );
}

/* ── Beta feedback — reachable from anywhere in the hub, including with a tree open ── */
const TH_FB_TOPICS = ["Finding a part", "A known issue", "Prices", "The tree layout", "Something broke", "Other"];

function THFeedback({ open, onClose }) {
  const [topic, setTopic] = React.useState(null);
  const [note, setNote] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [sent, setSent] = React.useState(false);
  React.useEffect(() => { if (open) { setSent(false); setTopic(null); setNote(""); } }, [open]);
  if (!open) return null;
  const field = { width:"100%", background:"var(--ki-page)", border:"1px solid var(--ki-line)", borderRadius:11, padding:"10px 12px", fontSize:13, color:"var(--ink)", fontFamily:"var(--font-sans)", outline:"none" };
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:60, background:"rgba(8,11,18,.6)", backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div onClick={e=>e.stopPropagation()} className="hl-bubble" style={{ width:"100%", maxWidth:440, background:"var(--ki-card)", border:"1px solid var(--ki-line)", borderRadius:18, boxShadow:"0 30px 80px rgba(0,0,0,.45)", overflow:"hidden" }}>
        {sent ? (
          <div style={{ padding:"26px 22px", display:"flex", flexDirection:"column", alignItems:"center", gap:10, textAlign:"center" }}>
            <span style={{ display:"grid", placeItems:"center", width:38, height:38, borderRadius:999, background:"var(--ki-ok-bg)", color:"var(--ki-ok-ink)" }}><Icon name="check" size={19} stroke={2.6}/></span>
            <div style={{ fontSize:15.5, fontWeight:600, letterSpacing:"-0.01em" }}>Got it — thank you.</div>
            <div style={{ fontSize:12.5, color:"var(--slate-500)", textWrap:"pretty", maxWidth:300 }}>This goes straight into what gets built next. If you left an email I'll reply when it ships.</div>
            <button onClick={onClose} style={{ marginTop:4, background:"var(--ink)", color:"var(--ki-page)", border:"none", borderRadius:11, padding:"10px 18px", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"var(--font-sans)" }}>Back to the car</button>
          </div>
        ) : (
          <form onSubmit={e=>{ e.preventDefault(); if (note.trim()) setSent(true); }}>
            <div style={{ padding:"14px 16px", borderBottom:"1px solid var(--ki-line)", display:"flex", alignItems:"center", gap:9 }}>
              <img src="brand/au7o-mascot.png" alt="" style={{ width:24, height:24, objectFit:"contain", flexShrink:0 }}/>
              <div style={{ minWidth:0, flex:1 }}>
                <div className="eyebrow" style={{ fontSize:9.5, color:"var(--au7o-blue)" }}>Beta feedback</div>
                <div style={{ fontSize:14.5, fontWeight:600, letterSpacing:"-0.01em", marginTop:2 }}>What should be better?</div>
              </div>
              <button type="button" onClick={onClose} aria-label="Close" style={{ width:30, height:30, borderRadius:9, background:"var(--ki-page)", border:"1px solid var(--ki-line)", color:"var(--slate-500)", cursor:"pointer", display:"grid", placeItems:"center", flexShrink:0 }}><Icon name="x" size={14}/></button>
            </div>
            <div style={{ padding:"14px 16px 16px", display:"flex", flexDirection:"column", gap:11 }}>
              <div>
                <div style={{ fontSize:11.5, fontWeight:600, color:"var(--slate-700)", marginBottom:7 }}>What were you doing?</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {TH_FB_TOPICS.map(t => (
                    <button key={t} type="button" onClick={()=>setTopic(topic===t?null:t)}
                      style={{ padding:"6px 11px", borderRadius:999, cursor:"pointer", fontFamily:"var(--font-sans)", fontSize:11.5, fontWeight:600,
                        background: topic===t ? "var(--ink)" : "transparent", color: topic===t ? "var(--ki-page)" : "var(--slate-700)",
                        border:`1px solid ${topic===t ? "var(--ink)" : "var(--ki-line)"}` }}>{t}</button>
                  ))}
                </div>
              </div>
              <textarea value={note} onChange={e=>setNote(e.target.value)} required rows={4} aria-label="Your feedback"
                placeholder="The part I wanted wasn't under the system I expected…" style={{ ...field, resize:"vertical", lineHeight:1.5 }}/>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email (optional — only if you want a reply)" aria-label="Email" style={field}/>
              <button type="submit" style={{ background:"#3B82F6", color:"#fff", border:"none", borderRadius:11, padding:"11px 16px", fontSize:13.5, fontWeight:600, cursor:"pointer", fontFamily:"var(--font-sans)" }}>Send feedback</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function THFeedbackPill({ onClick, mobile }) {
  return (
    <button onClick={onClick} style={{ position:"fixed", zIndex:55, right: mobile ? 12 : 18, bottom: mobile ? 78 : 18, display:"inline-flex", alignItems:"center", gap:7,
      minHeight:44, padding:"0 16px", borderRadius:999, cursor:"pointer", fontFamily:"var(--font-sans)", fontSize:12.5, fontWeight:600,
      background:"var(--ki-card)", color:"var(--ink)", border:"1px solid var(--ki-line)", boxShadow:"var(--shadow-2)" }}>
      <Icon name="chat" size={14} style={{ color:"var(--au7o-blue)" }}/>Feedback
    </button>
  );
}

/* ── Au7o bubble — sits in flow directly above the composer so it can never cover the hero ── */
function THBubble({ bubble, clear }) {
  return (
    <div style={{ flex:"0 0 auto", padding:"0 16px", minHeight: bubble ? undefined : 0, display:"flex", justifyContent:"center" }}>
      {bubble && (
        <div key={bubble.key} className="hl-bubble" style={{ display:"flex", gap:9, alignItems:"flex-start", background:"var(--ki-card)", border:"1px solid var(--ki-line)", borderRadius:"14px 14px 14px 4px", boxShadow:"var(--shadow-2)", padding:"11px 13px", maxWidth:560, width:"100%" }}>
          <img src="brand/au7o-mascot.png" alt="" style={{ width:20, height:20, flexShrink:0, marginTop:1 }}/>
          <div style={{ fontSize:12.5, lineHeight:1.45, flex:1 }}>{bubble.text}</div>
          <button onClick={clear} aria-label="Dismiss" style={{ background:"transparent", border:"none", color:"var(--slate-400)", cursor:"pointer", fontSize:14, lineHeight:1, padding:0, flexShrink:0 }}>×</button>
        </div>
      )}
    </div>
  );
}

/* ── Tech tree overlay ── */
function THTreeOverlay({ branch, setBranch, onClose, say, mobile, startNode, startView, startStop, startList }) {
  React.useEffect(() => {
    const on = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [onClose]);
  return (
    <div onClick={onClose} className="th-overlay" style={{ position:"fixed", inset:0, zIndex:50, background:"rgba(8,11,18,.62)", backdropFilter:"blur(6px)", display:"flex", alignItems: mobile ? "flex-end" : "center", justifyContent:"center", padding: mobile ? 0 : 28 }}>
      <div onClick={e=>e.stopPropagation()} className="th-sheet" style={{ position:"relative", width:"100%", maxWidth:1180, height: mobile ? "94%" : "100%", maxHeight: mobile ? "94%" : 760, borderRadius: mobile ? "20px 20px 0 0" : 18, overflow:"hidden", border:"1px solid var(--ki-line)", boxShadow:"0 30px 80px rgba(0,0,0,.45)", background:"var(--ki-page)", display:"flex", flexDirection:"column" }}>
        {mobile && <button onClick={onClose} aria-label="Close tech tree" style={{ flex:"0 0 auto", display:"grid", placeItems:"center", padding:"9px 0 4px", background:"var(--ki-band)", border:"none", borderBottom:"1px solid var(--ki-line)", cursor:"pointer", width:"100%" }}><span style={{ width:40, height:4, borderRadius:999, background:"var(--slate-400)", opacity:.5 }}/></button>}
        <div style={{ flex:1, minHeight:0 }}><TechTree key={startView || "tree"} branch={branch} setBranch={setBranch} miles={TH_MILES} onClose={onClose} say={say} startNode={startNode} compact={!!mobile} vertical={!!mobile} startView={startView || "tree"} startStop={startStop} startList={startList}/></div>
      </div>
    </div>
  );
}

/* ── Desktop ── */
function THDesktop({ tc }) {
  const [mode, setMode] = React.useState("hotspots");
  const [branch, setBranch] = React.useState(null);
  const [startNode, setStartNode] = React.useState(null);
  const [view, setView] = React.useState("tree");
  const [fb, setFb] = React.useState(false);
  const { bubble, say, clear } = useBubble("Evening. This is your Challenger — click any part of it and I'll open the tech tree for that system. Everything glowing red is at or past its life at 65,000 miles.");
  const openSchedule = () => { setStartNode(null); setView("schedule"); setBranch("car"); say("Here's the schedule — every service stop from here forward, what lands in it and what it costs. The lane in blue is the next one you'll hit."); };
  const open = hot => { const b = hot === "car" ? "car" : TT_BRANCH_FOR_HOTSPOT[hot]; setStartNode(TT_NODE_FOR_HOTSPOT[hot] || null); setView("tree"); setBranch(b); say(b === "car" ? "Here's the whole car — every system Au7o tracks. Click one to drill in." : `Opening the ${TT_TREES[b].label.toLowerCase()} tree. Back out to the car any time from the breadcrumb.`); };
  return (
    <div className={"ki-theme-" + tc.theme} style={{ display:"flex", height:"100dvh", background:"var(--ki-page)", color:"var(--ink)", fontFamily:"var(--font-sans)", overflow:"hidden" }}>
      <THSidebar onOpen={open} onSchedule={openSchedule} onOrder={()=>{ setStartNode(null); setView("schedule"); setBranch("car"); }} onFeedback={()=>setFb(true)}/>
      <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", position:"relative" }}>
        <div className="web-scroll" style={{ flex:1, minHeight:0, display:"flex", flexDirection:"column", gap:16, padding:"26px clamp(18px,4vw,44px) 16px", maxWidth:1020, width:"100%", margin:"0 auto" }}>
          <div style={{ flex:"0 0 auto" }}>
            <div style={{ display:"flex", alignItems:"center", gap:9 }}>
              <span className="eyebrow" style={{ color:"var(--au7o-blue)" }}>Au7o · tech tree hub</span>
              <span style={{ marginLeft:"auto" }}><ThemeDots tc={tc}/></span>
            </div>
            <h1 style={{ fontSize:29, fontWeight:600, letterSpacing:"-0.03em", lineHeight:1.15, marginTop:9, textWrap:"pretty" }}>
              Good evening. <span style={{ color:"var(--slate-400)" }}>Touch any part of the car.</span>
            </h1>
          </div>
          <THStage mode={mode} setMode={setMode} onOpen={open}/>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, alignItems:"center", flex:"0 0 auto" }}>
            <button onClick={()=>{ setStartNode(null); setView("tree"); setBranch("car"); say(`Here's the whole car. ${TH_DUE} parts are due across ${TH_SYSTEMS.length} systems — click any system to drill in.`); }} style={{ background:"var(--ki-crit)", color:"#fff", border:"none", borderRadius:999, padding:"7px 14px", fontSize:12.5, fontWeight:700, cursor:"pointer", display:"inline-flex", alignItems:"center", gap:6, fontFamily:"var(--font-sans)" }}>
              <Icon name="alert" size={12} stroke={2.2}/> {TH_DUE} parts due
            </button>
            <button className="chip" style={{ border:"1px solid var(--ki-line)" }} onClick={()=>open("wheel")}>Why won't my lug nut come off?</button>
            <button className="chip" style={{ border:"1px solid var(--ki-line)" }} onClick={()=>open("hood")}>What oil does a 392 take?</button>            <button className="chip" style={{ border:"1px solid var(--ki-line)" }} onClick={()=>open("glass")}>My wipers chatter</button>
          </div>
        </div>
        <THBubble bubble={bubble} clear={clear}/>
        <HPComposer say={say}/>
      </div>
      {branch && <THTreeOverlay branch={branch} setBranch={b=>{ setStartNode(null); setBranch(b); }} onClose={()=>setBranch(null)} say={say} startNode={startNode} startView={view}/>}
      <THFeedbackPill onClick={()=>setFb(true)}/>
      <THFeedback open={fb} onClose={()=>setFb(false)}/>
    </div>
  );
}

/* ── Mobile ── */
function THMobile({ tc }) {
  const [mode, setMode] = React.useState("hotspots");
  const [branch, setBranch] = React.useState(null);
  const [nav, setNav] = React.useState(false);
  const [fb, setFb] = React.useState(false);
  const [startNode, setStartNode] = React.useState(null);
  const [view, setView] = React.useState("tree");
  const { bubble, say, clear } = useBubble("Evening. Tap any part of your Challenger and I'll open its tech tree.");
  const open = hot => { setNav(false); setStartNode(TT_NODE_FOR_HOTSPOT[hot] || null); setView("tree"); setBranch(hot === "car" ? "car" : TT_BRANCH_FOR_HOTSPOT[hot]); };
  const openSchedule = () => { setNav(false); setStartNode(null); setView("schedule"); setBranch("car"); };
  return (
    <div className={"ki-theme-" + tc.theme} style={{ height:"100dvh", display:"flex", justifyContent:"center", background:"var(--ki-desk)", color:"var(--ink)", fontFamily:"var(--font-sans)" }}>
      <div style={{ width:"min(430px,100vw)", height:"100%", background:"var(--ki-page)", display:"flex", flexDirection:"column", position:"relative", overflow:"hidden", boxShadow:"var(--shadow-2)" }}>
        <div style={{ padding:"12px 14px", display:"flex", alignItems:"center", gap:10, background:"var(--ki-card)", borderBottom:"1px solid var(--ki-line)", zIndex:5 }}>
          <button onClick={()=>setNav(true)} aria-label="Menu" style={{ width:32, height:32, borderRadius:9, border:"1px solid var(--ki-line)", background:"var(--ki-card)", color:"var(--slate-700)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><Icon name="list" size={15}/></button>
          <Au7oMark size={20}/>
          <span style={{ marginLeft:"auto" }}><ThemeDots tc={tc} size={13}/></span>
          <span className="mono" style={{ fontSize:10.5, fontWeight:600, padding:"4px 9px", borderRadius:999, background:"var(--ki-page)", border:"1px solid var(--ki-line)" }}>{TH_MILES.toLocaleString()} mi</span>
        </div>
        <div className="web-scroll" style={{ flex:1, minHeight:0, padding:"14px 13px 12px", display:"flex", flexDirection:"column", gap:13 }}>
          <h2 style={{ fontSize:20, fontWeight:600, letterSpacing:"-0.02em", lineHeight:1.2, flex:"0 0 auto" }}>Good evening. <span style={{ color:"var(--slate-400)" }}>Tap any part.</span></h2>
          <THStage mode={mode} setMode={setMode} onOpen={open} mobile/>
          <div style={{ display:"flex", flexDirection:"column", gap:7, flex:"0 0 auto" }}>
            {TH_SYSTEMS.map(s => (
              <button key={s.branch} onClick={()=>open(s.hot)} style={{ display:"flex", alignItems:"center", gap:11, background:"var(--ki-card)", border:"1px solid var(--ki-line)", borderRadius:13, padding:"10px 12px", cursor:"pointer", textAlign:"left", minHeight:56, fontFamily:"var(--font-sans)", color:"var(--ink)" }}>
                <span style={{ width:38, height:38, borderRadius:10, overflow:"hidden", background:"#0d1017", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {s.img ? <img src={s.img} alt="" style={{ width:"126%", height:"126%", objectFit:"contain", filter:"brightness(1.6)" }}/> : <Icon name={s.icon} size={17} style={{ color:"rgba(255,255,255,.7)" }}/>}
                </span>
                <span style={{ minWidth:0, flex:1 }}>
                  <span style={{ display:"block", fontSize:13.5, fontWeight:600 }}>{s.label}</span>
                  <span style={{ display:"block", fontSize:11, color:"var(--slate-500)", marginTop:1 }}>{thMeta(s.branch)}</span>
                </span>
                <Icon name="chevron" size={14} style={{ color:"var(--slate-400)" }}/>
              </button>
            ))}
          </div>
        </div>
        <THBubble bubble={bubble} clear={clear}/>
        <div style={{ padding:"10px 12px 14px", borderTop:"1px solid var(--ki-line)", background:"var(--ki-glass)", backdropFilter:"blur(14px)", zIndex:6 }}>
          <div style={{ background:"var(--ki-card)", border:"1px solid var(--ki-line)", borderRadius:14, boxShadow:"var(--shadow-1)", padding:"9px 10px 9px 14px", display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ flex:1, fontSize:13, color:"var(--slate-400)" }}>Ask about your car…</span>
            <button className="chip chip-sm"><Icon name="camera" size={12}/></button>
            <VoiceButton compact say={say}/>
            <button style={{ background:"var(--ink)", border:"none", color:"var(--ki-page)", width:30, height:30, borderRadius:10, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><Icon name="send" size={13}/></button>
          </div>
        </div>
        {nav && (
          <div onClick={()=>setNav(false)} style={{ position:"absolute", inset:0, zIndex:40, background:"rgba(8,11,18,.5)", display:"flex" }}>
            <div onClick={e=>e.stopPropagation()} style={{ height:"100%", boxShadow:"var(--shadow-2)" }}><THSidebar onOpen={open} onSchedule={openSchedule} onClose={()=>setNav(false)} onFeedback={()=>{ setNav(false); setFb(true); }} drawer/></div>
          </div>
        )}
      </div>
      {branch && <THTreeOverlay branch={branch} setBranch={b=>{ setStartNode(null); setBranch(b); }} onClose={()=>setBranch(null)} say={say} startNode={startNode} startView={view} mobile/>}
      <THFeedbackPill onClick={()=>setFb(true)} mobile/>
      <THFeedback open={fb} onClose={()=>setFb(false)}/>
    </div>
  );
}

function HubTechTree() {
  const [mobile, setMobile] = React.useState(window.innerWidth < 860);
  const tc = useTheme();
  React.useEffect(() => {
    const on = () => setMobile(window.innerWidth < 860);
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return <THMinimal tc={tc} mobile={mobile}/>;
}

Object.assign(window, { HubTechTree, THDesktop, THMobile, TH_DOT, thHot, thMeta, TH_V, TH_DUE, TT_BRANCH_FOR_HOTSPOT, TT_NODE_FOR_HOTSPOT, THStage, THSidebar, THBubble, THTreeOverlay, THFeedback, THFeedbackPill, TH_MILES, TH_HOTSPOTS, TH_SYSTEMS, TH_ENTRY_MODES, THLifeBar, thLifeRows });
