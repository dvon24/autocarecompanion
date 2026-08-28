/* Au7o homepage hero — 11 directions driven by Tweaks. `split` is the fallback.
   The feature isn't shipped: every direction takes reservations.
   Chrome follows the landing pages: .eyebrow, --paper / --paper-line, #fff cards + shadow-1. */

const HH_STATS = [
  { v:"6,268+", l:"known issues documented" },
  { v:"Photo-first", l:"no part names needed" },
  { v:"7 days", l:"free when it opens" },
  { v:"$14.99", l:"per month after" },
];
const HH_NAV = ["Known Issues", "Drive", "Pricing"];

const HH_DIRECTIONS = [
  { id:"split",     label:"1 · Split — fallback" },
  { id:"stage",     label:"2 · Stage first" },
  { id:"center",    label:"3 · Centered" },
  { id:"tree",      label:"4 · Tree forward" },
  { id:"quiet",     label:"5 · Quiet — minimal" },
  { id:"waitlist",  label:"6 · Waitlist — form only" },
  { id:"bleed",     label:"7 · Full bleed" },
  { id:"cinema",    label:"8 · Cinematic — spotlight" },
  { id:"letterbox", label:"9 · Cinematic — title card" },
  { id:"hud",       label:"10 · Diagnostic HUD" },
  { id:"editorial", label:"11 · Editorial split" },
  { id:"gradient",  label:"12 · Gradient fade — text left, demo right" },
];

const HHCtx = React.createContext({});
const useHH = () => React.useContext(HHCtx);

/* nav — LandingTopNav's spec, links only */
function HHNav({ dark, minimal }) {
  const ink = dark ? "rgba(255,255,255,0.7)" : "var(--slate-700)";
  return (
    <div style={{ height:72, padding:"0 clamp(20px,5vw,56px)", display:"flex", alignItems:"center", gap:26, position:"relative", zIndex:5, color: dark ? "#fff" : "var(--ink)" }}>
      <Au7oMark size={28} color={dark ? "#fff" : "var(--ink)"}/>
      {!minimal && (
        <nav className="hh-nav-links" style={{ display:"flex", gap:20 }}>
          {HH_NAV.map(n => <a key={n} href="#" onClick={e=>e.preventDefault()} style={{ fontSize:13.5, color:ink, textDecoration:"none" }}>{n}</a>)}
        </nav>
      )}
      <div style={{ flex:1 }}/>
    </div>
  );
}

/* eyebrow — the landings' pulse-dot + .eyebrow lockup */
function HHEyebrow({ dark }) {
  const { t } = useHH();
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
      <div className="au7o-pulse-soft" style={{ width:8, height:8, borderRadius:"50%", background: dark ? "#8FDDF7" : "var(--au7o-blue)" }}/>
      <span className="eyebrow" style={{ color: dark ? "#8FDDF7" : "var(--au7o-blue)" }}>{t.eyebrow}</span>
    </div>
  );
}

function HHHeadline({ size = 52, dark, center }) {
  const fs = `clamp(${Math.round(size * 0.58)}px, ${(size / 10.2).toFixed(1)}vw, ${size}px)`;
  const { t } = useHH();
  const words = (t.headline || "").split(" ");
  const tail = words.slice(-2).join(" ");
  const head = words.slice(0, -2).join(" ");
  return (
    <h1 style={{ fontSize: fs, fontWeight:600, letterSpacing:"-0.035em", lineHeight:1.03, textWrap:"balance", color: dark ? "#fff" : "var(--ink)", textAlign: center ? "center" : "left" }}>
      {head} <span style={{ color: dark ? "rgba(255,255,255,.5)" : "var(--slate-400)" }}>{tail}</span>
    </h1>
  );
}

function HHSub({ dark, center, max = 560 }) {
  const { t } = useHH();
  return (
    <p style={{ fontSize:"clamp(14.5px,1.5vw,16.5px)", lineHeight:1.55, color: dark ? "rgba(255,255,255,.72)" : "var(--slate-700)", maxWidth:max, textWrap:"pretty", textAlign: center ? "center" : "left", margin: center ? "0 auto" : undefined }}>
      {t.subcopy}
    </p>
  );
}

function HHStats({ row, dark }) {
  const { t } = useHH();
  if (!t.showStats) return null;
  return (
    <div style={{ display: row ? "flex" : "grid", gridTemplateColumns: row ? undefined : "repeat(auto-fit,minmax(136px,1fr))", gap:10, justifyContent: row ? "center" : undefined, flexWrap:"wrap" }}>
      {HH_STATS.map(s => (
        <div key={s.l} style={{ padding:"13px 15px", borderRadius:16, background: dark ? "rgba(255,255,255,.06)" : "#fff", border:`1px solid ${dark ? "rgba(255,255,255,.13)" : "var(--paper-line)"}`, boxShadow: dark ? "none" : "var(--shadow-1)", minWidth: row ? 150 : undefined }}>
          <div className="mono" style={{ fontSize: s.v.length > 8 ? 13.5 : 17, fontWeight:600, letterSpacing:"-0.02em", color: dark ? "#fff" : "var(--ink)" }}>{s.v}</div>
          <div style={{ fontSize:10.5, color: dark ? "rgba(255,255,255,.55)" : "var(--slate-500)", marginTop:3, lineHeight:1.35 }}>{s.l}</div>
        </div>
      ))}
    </div>
  );
}

/* ── Reserve ──
   Country is required: billing is US-only at launch, so everyone else needs to be told that up front. */
const HH_COUNTRIES = ["United States","Canada","United Kingdom","Australia","New Zealand","Ireland","Germany","France","Netherlands","Belgium","Spain","Portugal","Italy","Switzerland","Austria","Sweden","Norway","Denmark","Finland","Poland","Czechia","Romania","Greece","Turkey","Mexico","Brazil","Argentina","Chile","Colombia","Peru","Puerto Rico","South Africa","Nigeria","Kenya","Egypt","United Arab Emirates","Saudi Arabia","Israel","India","Pakistan","Philippines","Indonesia","Malaysia","Singapore","Thailand","Vietnam","Japan","South Korea","China","Hong Kong","Taiwan","Other"];
function HHReserveForm({ dark, wide, glass }) {
  const { t } = useHH();
  const [country, setCountry] = React.useState("");
  const [done, setDone] = React.useState(false);
  const onGlass = dark || glass;
  const field = {
    minWidth:0, background: onGlass ? "rgba(255,255,255,.09)" : "#fff",
    border:`1px solid ${onGlass ? "rgba(255,255,255,.22)" : "var(--paper-line)"}`,
    borderRadius:12, padding:"12px 14px", fontSize:14, color: onGlass ? "#fff" : "var(--ink)",
    fontFamily:"var(--font-sans)", outline:"none",
  };
  const usOnly = country && country !== "United States";
  return (
    <form onSubmit={e=>{ e.preventDefault(); if (country) setDone(true); }} style={{ display:"flex", flexDirection:"column", gap:8, width: wide ? "100%" : undefined }}>
      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
        <input type="text" required placeholder="2015 Dodge Challenger SRT 392" aria-label="Year, make, model and trim"
          style={{ ...field, flex: wide ? "1 1 100%" : "1 1 190px" }}/>
        <input type="email" required placeholder="you@email.com" aria-label="Email"
          style={{ ...field, flex: wide ? "1 1 200px" : "1 1 190px" }}/>
        <select required value={country} onChange={e=>setCountry(e.target.value)} aria-label="Country"
          style={{ ...field, flex: wide ? "1 1 160px" : "1 1 150px", cursor:"pointer", color: country ? (onGlass ? "#fff" : "var(--ink)") : (onGlass ? "rgba(255,255,255,.55)" : "var(--slate-400)"), appearance:"none",
            backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23${onGlass ? "ffffff" : "8A9099"}' stroke-width='1.6' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
            backgroundRepeat:"no-repeat", backgroundPosition:"right 12px center", paddingRight:30 }}>
          <option value="" disabled>Country</option>
          {HH_COUNTRIES.map(c => <option key={c} value={c} style={{ color:"var(--ink)" }}>{c}</option>)}
        </select>
        <button type="submit" style={{ background:"#3B82F6", color:"#fff", border:"none", borderRadius:12, padding:"12px 18px", fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"var(--font-sans)", flexShrink:0 }}>{done ? "You're on the list" : t.ctaLabel}</button>
      </div>
      {usOnly && (
        <div style={{ fontSize:11.5, lineHeight:1.45, color: onGlass ? "rgba(255,255,255,.7)" : "var(--slate-500)", textWrap:"pretty" }}>
          Heads up — paid plans are US-only at launch while we sort tax registration. You'll get the free tier in {country} and first notice when billing opens there.
        </div>
      )}
    </form>
  );
}

function HHReserveMeta({ dark, center }) {
  const { t } = useHH();
  const dim = dark ? "rgba(255,255,255,.6)" : "var(--slate-500)";
  return (
    <div style={{ display:"flex", alignItems:"center", gap:9, flexWrap:"wrap", justifyContent: center ? "center" : "flex-start", fontSize:12, color:dim }}>
      <span style={{ display:"inline-flex", alignItems:"center", gap:5, fontWeight:600, color: dark ? "#8FDDF7" : "var(--ki-ok-ink)" }}><Icon name="check" size={12} stroke={2.4}/> {t.priceNote}</span>
      <span style={{ opacity:.5 }}>·</span>
      <span className="mono">{t.reserved.toLocaleString()} reserved</span>
    </div>
  );
}

function HHReserve({ dark }) {
  const { t } = useHH();
  const line = dark ? "rgba(255,255,255,.14)" : "var(--paper-line)";
  const dim = dark ? "rgba(255,255,255,.6)" : "var(--slate-500)";
  const ink = dark ? "#fff" : "var(--ink)";
  return (
    <div id="reserve" style={{ display:"flex", gap:11, flexWrap:"wrap" }}>
      <div style={{ flex:"1 1 380px", minWidth:0, padding:"15px 16px", borderRadius:16, border:`1px solid ${dark ? "rgba(76,201,240,.4)" : "var(--paper-line)"}`, background: dark ? "rgba(76,201,240,.07)" : "#fff", boxShadow: dark ? "none" : "var(--shadow-1)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ width:32, height:32, borderRadius:10, background: dark ? "rgba(255,255,255,.1)" : "var(--au7o-blue-50)", color: dark ? "#8FDDF7" : "var(--au7o-blue)", display:"grid", placeItems:"center", flexShrink:0 }}><Icon name="spark2" size={16}/></span>
          <div style={{ minWidth:0, flex:1 }}>
            <div style={{ fontSize:14, fontWeight:600, letterSpacing:"-0.01em", color:ink }}>Reserve your spot</div>
            <div style={{ fontSize:12, color:dim, marginTop:2, textWrap:"pretty" }}>{t.photoNote}</div>
          </div>
        </div>
        <div style={{ marginTop:12, display:"flex", flexDirection:"column", gap:8 }}>
          <HHReserveForm dark={dark} wide/>
          <HHReserveMeta dark={dark}/>
        </div>
      </div>
      <div style={{ flex:"1 1 260px", minWidth:0, display:"flex", alignItems:"center", gap:13, padding:"15px 16px", borderRadius:16, border:`1px solid ${line}`, background: dark ? "rgba(255,255,255,.05)" : "#fff", boxShadow: dark ? "none" : "var(--shadow-1)" }}>
        <span style={{ width:32, height:32, borderRadius:10, background: dark ? "rgba(76,201,240,.16)" : "var(--paper-2)", color: dark ? "#8FDDF7" : "var(--slate-500)", display:"grid", placeItems:"center", flexShrink:0 }}><Icon name="car" size={16}/></span>
        <div style={{ minWidth:0, flex:1 }}>
          <div style={{ fontSize:13.5, fontWeight:600, letterSpacing:"-0.01em", color:ink }}>Or poke around ours</div>
          <div style={{ fontSize:12, color:dim, marginTop:2 }}>A 2015 Challenger at {t.miles.toLocaleString()} mi. No account.</div>
        </div>
        <a href="Au7o Hub Tech Tree.html" style={{ background:"transparent", color: dark ? "rgba(255,255,255,.82)" : "var(--ink)", border:`1px solid ${dark ? "rgba(255,255,255,.24)" : "var(--paper-line)"}`, borderRadius:11, padding:"9px 14px", fontSize:12.5, fontWeight:600, textDecoration:"none", display:"inline-flex", alignItems:"center", gap:5, flexShrink:0 }}>See the full hub <Icon name="chevron" size={12}/></a>
      </div>
    </div>
  );
}

/* car ⇄ tree in one frame */
function HHPlayground({ dark, height = 700, startBranch = null, flush, noReserve }) {
  const { t } = useHH();
  const narrow = useNarrow();
  const [branch, setBranch] = React.useState(startBranch);
  const [startNode, setStartNode] = React.useState(null);
  const [mode, setMode] = React.useState(t.entryStyle);
  const [note, setNote] = React.useState(null);
  React.useEffect(() => { setMode(t.entryStyle); }, [t.entryStyle]);
  const say = text => setNote({ text, key: Date.now() });
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ borderRadius: flush ? 0 : 18, overflow:"hidden", border: flush ? "none" : `1px solid ${dark ? "rgba(255,255,255,.14)" : "var(--paper-line)"}`, boxShadow: flush ? "none" : dark ? "0 24px 60px rgba(0,0,0,.45)" : "var(--shadow-2)", background: dark ? "#0A0D14" : "var(--ki-page)" }}>
        {branch
          ? <div style={{ height:`min(${height}px, 88vh)`, display:"flex", flexDirection:"column" }}>
              <TechTree branch={branch} vertical={narrow} compact={narrow} detailMode={narrow ? "sheet" : null} setBranch={b=>{ setBranch(b); setStartNode(null); }} startNode={startNode} miles={t.miles} onClose={()=>{ setStartNode(null); setBranch(startBranch ? (branch === startBranch ? null : startBranch) : null); }} say={say}/>
            </div>
          : typeof HHStageCarousel !== "undefined"
            ? <HHStageCarousel mode={mode} setMode={setMode} narrow={narrow} hideNote={!t.showEntryNote} noteDark={dark} onOpen={hot => { setStartNode(TT_NODE_FOR_HOTSPOT[hot] || null); setBranch(hot === "car" ? "car" : TT_BRANCH_FOR_HOTSPOT[hot]); }}/>
            : <THStage mode={mode} setMode={setMode} mobile={narrow} hideNote={!t.showEntryNote} noteDark={dark} onOpen={hot => { setStartNode(TT_NODE_FOR_HOTSPOT[hot] || null); setBranch(hot === "car" ? "car" : TT_BRANCH_FOR_HOTSPOT[hot]); }}/>}
      </div>
      {note && (
        <div className="hl-bubble" style={{ display:"flex", gap:9, alignItems:"flex-start", padding:"11px 13px", borderRadius:14, background: dark ? "rgba(255,255,255,.06)" : "#fff", border:`1px solid ${dark ? "rgba(255,255,255,.14)" : "var(--paper-line)"}` }}>
          <img src="brand/au7o-mascot.png" alt="" style={{ width:19, height:19, flexShrink:0, marginTop:1 }}/>
          <div style={{ fontSize:12.5, lineHeight:1.45, color: dark ? "rgba(255,255,255,.8)" : "var(--ink)" }}>{note.text}</div>
        </div>
      )}
      {!noReserve && <HHReserve dark={dark}/>}
    </div>
  );
}

/* ── 1 · Split — fallback ── */
function HeroSplit() {
  return (
    <div style={{ background:"var(--paper)" }}>
      <HHNav/>
      <main style={{ maxWidth:1240, margin:"0 auto", padding:"24px clamp(20px,5vw,56px) 60px", display:"flex", flexDirection:"column", gap:26 }}>
        <div style={{ display:"flex", gap:34, alignItems:"flex-end", flexWrap:"wrap" }}>
          <div style={{ flex:"1 1 440px", minWidth:0, display:"flex", flexDirection:"column", gap:16 }}>
            <HHEyebrow/><HHHeadline/><HHSub/>
          </div>
          <div style={{ flex:"0 1 300px" }}><HHStats/></div>
        </div>
        <HHPlayground/>
      </main>
    </div>
  );
}

/* ── 2 · Stage first ── */
function HeroStage() {
  return (
    <div style={{ background:"#080B12" }}>
      <HHNav dark/>
      <main style={{ maxWidth:1240, margin:"0 auto", padding:"26px clamp(20px,5vw,56px) 56px", display:"flex", flexDirection:"column", gap:24 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:15 }}>
          <HHEyebrow dark/>
          <HHHeadline size={60} dark/>
          <HHSub dark max={680}/>
        </div>
        <HHPlayground dark/>
        <HHStats row dark/>
      </main>
    </div>
  );
}

/* ── 3 · Centered ── */
function HeroCenter() {
  return (
    <div style={{ background:"var(--paper)" }}>
      <HHNav/>
      <main style={{ maxWidth:1140, margin:"0 auto", padding:"40px clamp(20px,5vw,56px) 60px", display:"flex", flexDirection:"column", gap:22 }}>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:17 }}>
          <HHEyebrow/>
          <HHHeadline size={58} center/>
          <HHSub center max={640}/>
        </div>
        <HHPlayground/>
        <HHStats row/>
      </main>
    </div>
  );
}

/* ── 4 · Tree forward ── */
function HeroTree() {
  const { t } = useHH();
  return (
    <div style={{ background:"var(--paper)" }}>
      <HHNav/>
      <main style={{ maxWidth:1240, margin:"0 auto", padding:"20px clamp(20px,5vw,56px) 56px", display:"flex", flexDirection:"column", gap:20 }}>
        <div style={{ display:"flex", gap:30, alignItems:"center", flexWrap:"wrap" }}>
          <div style={{ flex:"1 1 400px", minWidth:0, display:"flex", flexDirection:"column", gap:14 }}>
            <HHEyebrow/>
            <HHHeadline size={44}/>
            <HHSub max={520}/>
          </div>
          <div style={{ flex:"0 1 280px", display:"flex", flexDirection:"column", gap:10 }}>
            <div style={{ borderRadius:16, overflow:"hidden", border:"1px solid var(--paper-line)", background:"#0A0D14" }}>
              <img src="assets/car-base.webp" alt="2015 Dodge Challenger SRT 392" style={{ display:"block", width:"100%", aspectRatio:"16 / 9", objectFit:"cover" }}/>
            </div>
            <div style={{ fontSize:11.5, color:"var(--slate-500)", textWrap:"pretty" }}>Every tree below belongs to this car — a 2015 Challenger SRT 392 at {t.miles.toLocaleString()} mi.</div>
          </div>
        </div>
        <HHPlayground height={540} startBranch="wheel"/>
      </main>
    </div>
  );
}

/* ── 5 · Quiet ── */
function HeroQuiet() {
  const { t } = useHH();
  return (
    <div style={{ background:"var(--paper)" }}>
      <HHNav minimal/>
      <main style={{ maxWidth:900, margin:"0 auto", padding:"clamp(40px,7vw,84px) clamp(20px,5vw,56px) 80px", display:"flex", flexDirection:"column", gap:56 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
          <span className="mono" style={{ fontSize:11, letterSpacing:"0.14em", textTransform:"uppercase", color:"var(--slate-400)" }}>{t.eyebrow}</span>
          <h1 style={{ fontSize:"clamp(25px,4.5vw,46px)", fontWeight:500, letterSpacing:"-0.035em", lineHeight:1.08, textWrap:"balance", maxWidth:680 }}>{t.headline}</h1>
          <p style={{ fontSize:15.5, lineHeight:1.6, color:"var(--slate-500)", maxWidth:520, textWrap:"pretty" }}>{t.subcopy}</p>
        </div>
        <HHPlayground/>
      </main>
    </div>
  );
}

/* ── 6 · Waitlist ── */
function HeroWaitlist() {
  const { t } = useHH();
  return (
    <div style={{ background:"var(--paper)" }}>
      <HHNav minimal/>
      <main style={{ maxWidth:1120, margin:"0 auto", padding:"clamp(36px,6vw,64px) clamp(20px,5vw,56px) 72px", display:"flex", flexDirection:"column", gap:44 }}>
        <div style={{ display:"flex", gap:40, alignItems:"flex-end", flexWrap:"wrap" }}>
          <h1 style={{ flex:"1 1 460px", fontSize:48, fontWeight:500, letterSpacing:"-0.035em", lineHeight:1.05, textWrap:"balance", margin:0 }}>{t.headline}</h1>
          <div style={{ flex:"0 1 340px", display:"flex", flexDirection:"column", gap:10 }}>
            <HHReserveForm wide/>
            <HHReserveMeta/>
          </div>
        </div>
        <HHPlayground/>
      </main>
    </div>
  );
}

/* ── 7 · Full bleed ── */
function HeroBleed() {
  const { t } = useHH();
  return (
    <div style={{ background:"#080B12", minHeight:"100dvh" }}>
      <HHNav dark minimal/>
      <main>
        <div style={{ padding:"clamp(28px,5vw,48px) clamp(20px,5vw,56px) 30px", maxWidth:1000 }}>
          <span className="mono" style={{ fontSize:11, letterSpacing:"0.14em", textTransform:"uppercase", color:"rgba(143,221,247,.8)" }}>{t.eyebrow}</span>
          <h1 style={{ fontSize:"clamp(36px,6.5vw,66px)", fontWeight:500, letterSpacing:"-0.04em", lineHeight:1, color:"#fff", marginTop:16, textWrap:"balance" }}>{t.headline}</h1>
        </div>
        <HHPlayground dark flush/>
      </main>
    </div>
  );
}

/* ── 8 · Cinematic spotlight — the car under a light, everything else recedes ── */
function HeroCinema() {
  const { t } = useHH();
  return (
    <div style={{ background:"#05070C", minHeight:"100dvh", position:"relative", overflow:"hidden" }}>
      <div className="hh-spot" style={{ position:"absolute", top:"-18%", left:"50%", transform:"translateX(-50%)", width:1100, height:900, background:"radial-gradient(ellipse at center, rgba(76,201,240,.16), rgba(5,7,12,0) 62%)", pointerEvents:"none" }}/>
      <div style={{ position:"relative", zIndex:1 }}>
        <HHNav dark minimal/>
        <main style={{ maxWidth:1080, margin:"0 auto", padding:"34px clamp(20px,5vw,56px) 64px", display:"flex", flexDirection:"column", gap:26, alignItems:"center", textAlign:"center" }}>
          <span className="mono" style={{ fontSize:10.5, letterSpacing:"0.24em", textTransform:"uppercase", color:"rgba(143,221,247,.9)" }}>{t.eyebrow}</span>
          <h1 style={{ fontSize:"clamp(35px,6.3vw,64px)", fontWeight:500, letterSpacing:"-0.04em", lineHeight:0.98, color:"#fff", textWrap:"balance", maxWidth:820, margin:0 }}>{t.headline}</h1>
          <p style={{ fontSize:16, lineHeight:1.6, color:"rgba(255,255,255,.62)", maxWidth:600, textWrap:"pretty", margin:0 }}>{t.subcopy}</p>
          <div style={{ width:"100%", marginTop:6 }}><HHPlayground dark noReserve/></div>
          <div style={{ display:"flex", flexDirection:"column", gap:11, alignItems:"center", padding:"18px 22px", borderRadius:18, background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.12)", backdropFilter:"blur(18px)", maxWidth:520, width:"100%" }} id="reserve">
            <div style={{ fontSize:14.5, fontWeight:600, color:"#fff", letterSpacing:"-0.01em" }}>Reserve your spot</div>
            <div style={{ fontSize:12.5, color:"rgba(255,255,255,.6)", textWrap:"pretty" }}>{t.photoNote}</div>
            <HHReserveForm glass wide/>
            <HHReserveMeta dark center/>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ── 9 · Cinematic title card — letterboxed, film-title type ── */
function HeroLetterbox() {
  const { t } = useHH();
  return (
    <div style={{ background:"#000", minHeight:"100dvh" }}>
      <HHNav dark minimal/>
      <main>
        <div style={{ position:"relative", background:"#000", borderTop:"1px solid rgba(255,255,255,.12)", borderBottom:"1px solid rgba(255,255,255,.12)" }}>
          <HHPlayground dark flush noReserve/>
          <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", paddingTop:"5%", pointerEvents:"none", zIndex:6 }}>
            <span className="mono" style={{ fontSize:10, letterSpacing:"0.34em", textTransform:"uppercase", color:"rgba(255,255,255,.55)" }}>{t.eyebrow}</span>
            <h1 style={{ fontSize:"clamp(32px,5.7vw,58px)", fontWeight:400, letterSpacing:"0.01em", lineHeight:1.05, color:"#fff", textAlign:"center", maxWidth:900, marginTop:14, textShadow:"0 4px 30px rgba(0,0,0,.7)" }}>{t.headline}</h1>
          </div>
        </div>
        <div style={{ maxWidth:620, margin:"0 auto", padding:"40px clamp(20px,5vw,32px) 72px", display:"flex", flexDirection:"column", gap:14, alignItems:"center", textAlign:"center" }} id="reserve">
          <p style={{ fontSize:15.5, lineHeight:1.6, color:"rgba(255,255,255,.6)", textWrap:"pretty", margin:0 }}>{t.subcopy}</p>
          <div style={{ width:"100%", height:1, background:"rgba(255,255,255,.12)", margin:"6px 0" }}/>
          <HHReserveForm glass wide/>
          <HHReserveMeta dark center/>
        </div>
      </main>
    </div>
  );
}

/* ── 10 · Diagnostic HUD — telemetry over the car ── */
function HHHudCorner({ pos, label, value, tone }) {
  const c = tone === "crit" ? "#FF6B63" : tone === "warn" ? "#F0A33F" : "rgba(143,221,247,.9)";
  return (
    <div style={{ position:"absolute", ...pos, padding:"7px 11px", border:`1px solid ${c}44`, borderRadius:8, background:"rgba(5,7,12,.6)", backdropFilter:"blur(8px)", pointerEvents:"none", zIndex:6 }}>
      <div className="mono" style={{ fontSize:8.5, letterSpacing:"0.16em", textTransform:"uppercase", color:"rgba(255,255,255,.45)" }}>{label}</div>
      <div className="mono" style={{ fontSize:13, fontWeight:600, color:c, marginTop:2 }}>{value}</div>
    </div>
  );
}

function HeroHud() {
  const { t } = useHH();
  return (
    <div style={{ background:"#05070C", minHeight:"100dvh" }}>
      <HHNav dark minimal/>
      <main style={{ maxWidth:1240, margin:"0 auto", padding:"20px clamp(20px,5vw,56px) 64px", display:"flex", flexDirection:"column", gap:22 }}>
        <div style={{ display:"flex", alignItems:"flex-end", gap:26, flexWrap:"wrap" }}>
          <div style={{ flex:"1 1 420px", minWidth:0 }}>
            <div className="mono" style={{ fontSize:10, letterSpacing:"0.22em", textTransform:"uppercase", color:"rgba(143,221,247,.85)" }}>{t.eyebrow}</div>
            <h1 className="mono" style={{ fontSize:"clamp(23px,4.1vw,42px)", fontWeight:500, letterSpacing:"-0.03em", lineHeight:1.08, color:"#fff", marginTop:14, textWrap:"balance" }}>{t.headline}</h1>
          </div>
          <p style={{ flex:"1 1 300px", fontSize:14.5, lineHeight:1.6, color:"rgba(255,255,255,.6)", textWrap:"pretty", margin:0 }}>{t.subcopy}</p>
        </div>
        <div style={{ position:"relative" }}>
          <div className="hh-scan" style={{ position:"absolute", inset:0, zIndex:5, pointerEvents:"none", background:"repeating-linear-gradient(0deg, rgba(76,201,240,.05) 0 1px, transparent 1px 4px)" }}/>
          <HHHudCorner pos={{ top:14, left:14 }} label="Odometer" value={t.miles.toLocaleString() + " mi"}/>
          <HHHudCorner pos={{ top:14, right:14 }} label="Parts at risk" value="4 due" tone="crit"/>
          <HHHudCorner pos={{ bottom:70, left:14 }} label="Watch list" value="2 parts" tone="warn"/>
          <HHHudCorner pos={{ bottom:70, right:14 }} label="Systems mapped" value="3 trees"/>
          <HHPlayground dark noReserve/>
        </div>
        <div id="reserve" style={{ display:"flex", alignItems:"center", gap:16, flexWrap:"wrap", padding:"16px 18px", borderRadius:14, border:"1px solid rgba(76,201,240,.3)", background:"rgba(76,201,240,.06)" }}>
          <div style={{ minWidth:0, flex:"1 1 260px" }}>
            <div className="mono" style={{ fontSize:12.5, fontWeight:600, color:"#fff", letterSpacing:"-0.01em" }}>&gt; reserve_spot --trial 7d</div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,.6)", marginTop:4, textWrap:"pretty" }}>{t.photoNote}</div>
          </div>
          <div style={{ flex:"0 1 340px", display:"flex", flexDirection:"column", gap:8 }}>
            <HHReserveForm glass wide/>
            <HHReserveMeta dark/>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ── 11 · Editorial split — hard 50/50, ink panel against the car ── */
function HeroEditorial() {
  const { t } = useHH();
  return (
    <div style={{ background:"var(--paper)", minHeight:"100dvh", display:"flex", flexDirection:"column" }}>
      <div style={{ display:"flex", flexWrap:"wrap", flex:1, minHeight:0 }}>
        <div style={{ flex:"1 1 440px", minWidth:0, background:"var(--ink)", color:"#fff", padding:"0 0 40px", display:"flex", flexDirection:"column" }}>
          <HHNav dark minimal/>
          <div style={{ padding:"20px clamp(20px,5vw,48px) 0", display:"flex", flexDirection:"column", gap:20, flex:1 }}>
            <span className="mono" style={{ fontSize:10.5, letterSpacing:"0.2em", textTransform:"uppercase", color:"rgba(143,221,247,.9)" }}>{t.eyebrow}</span>
            <h1 style={{ fontSize:56, fontWeight:600, letterSpacing:"-0.04em", lineHeight:0.98, textWrap:"balance", margin:0 }}>{t.headline}</h1>
            <p style={{ fontSize:15.5, lineHeight:1.6, color:"rgba(255,255,255,.66)", maxWidth:440, textWrap:"pretty", margin:0 }}>{t.subcopy}</p>
            <div style={{ marginTop:"auto", display:"flex", flexDirection:"column", gap:10 }} id="reserve">
              <div style={{ fontSize:13.5, fontWeight:600 }}>Reserve your spot</div>
              <HHReserveForm glass/>
              <HHReserveMeta dark/>
              <a href="Au7o Hub Tech Tree.html" style={{ fontSize:12.5, color:"rgba(255,255,255,.7)", textDecoration:"underline", textUnderlineOffset:3, marginTop:2 }}>or open the demo hub on our Challenger →</a>
            </div>
          </div>
        </div>
        <div style={{ flex:"1 1 520px", minWidth:0, background:"#05070C", display:"flex", flexDirection:"column", justifyContent:"center", padding:"24px 0" }}>
          <HHPlayground dark flush noReserve/>
        </div>
      </div>
    </div>
  );
}

/* ── 12 · Gradient fade — copy left, live demo right, dissolving into the sand ── */
function HeroGradient() {
  const { t } = useHH();
  return (
    <div style={{ background:"var(--paper)", minHeight:"100dvh" }}>
      <HHNav/>
      <main style={{ maxWidth:1320, margin:"0 auto", padding:"18px clamp(20px,5vw,44px) 64px", display:"flex", gap:36, alignItems:"center", flexWrap:"wrap" }}>
        <div style={{ flex:"1 1 330px", minWidth:0, display:"flex", flexDirection:"column", gap:20, paddingBottom:28 }}>
          <HHEyebrow/>
          <HHHeadline size={54}/>
          <HHSub max={480}/>
          <div style={{ display:"flex", flexDirection:"column", gap:10, marginTop:4 }} id="reserve">
            <HHReserveForm/>
            <HHReserveMeta/>
          </div>
          <div style={{ fontSize:12.5, color:"var(--slate-500)", maxWidth:430, textWrap:"pretty", paddingTop:6, borderTop:"1px solid var(--paper-line)", marginTop:4 }}>
            {t.photoNote} <a href="Au7o Hub Tech Tree.html" style={{ fontWeight:600, textDecoration:"none" }}>Or open the demo hub →</a>
          </div>
        </div>

        <div style={{ flex:"1.15 1 430px", minWidth:0, position:"relative", borderRadius:"22px 22px 0 0", overflow:"hidden", background:"linear-gradient(180deg, #05070C 0%, #0C1522 34%, #1B2C3E 62%, var(--paper) 100%)" }}>
          <div className="hh-spot" style={{ position:"absolute", top:"-14%", left:"50%", transform:"translateX(-50%)", width:"120%", height:"70%", background:"radial-gradient(ellipse at center, rgba(76,201,240,.22), rgba(5,7,12,0) 68%)", pointerEvents:"none", zIndex:1 }}/>
          <div style={{ position:"relative", zIndex:2, padding:"24px 24px 0" }}>
            <HHPlayground dark noReserve/>
          </div>
          <div style={{ height:86 }}/>
        </div>
      </main>
    </div>
  );
}

const HH_RENDER = {
  split: HeroSplit, stage: HeroStage, center: HeroCenter, tree: HeroTree,
  quiet: HeroQuiet, waitlist: HeroWaitlist, bleed: HeroBleed,
  cinema: HeroCinema, letterbox: HeroLetterbox, hud: HeroHud, editorial: HeroEditorial, gradient: HeroGradient,
};

function HomeHero() {
  const tc = useTheme();
  const [t, setTweak] = useTweaks(window.HERO_TWEAK_DEFAULTS);
  const View = HH_RENDER[t.direction] || HeroSplit;
  return (
    <HHCtx.Provider value={{ t }}>
      <div className={"ki-theme-" + tc.theme} style={{ minHeight:"100dvh", color:"var(--ink)", fontFamily:"var(--font-sans)", "--au7o-blue": t.accent }}>
        <View/>
        <TweaksPanel>
          <TweakSection label="Layout"/>
          <TweakSelect label="Hero direction" value={t.direction} options={HH_DIRECTIONS.map(d => ({ value:d.id, label:d.label }))} onChange={v=>setTweak("direction", v)}/>
          <TweakToggle label="Stat cards" value={t.showStats} onChange={v=>setTweak("showStats", v)}/>
          <TweakSection label="The car"/>
          <TweakRadio label="Entry style" value={t.entryStyle} options={["hotspots","rail","xray"]} onChange={v=>setTweak("entryStyle", v)}/>
          <TweakToggle label="Explain the entry style" value={t.showEntryNote} onChange={v=>setTweak("showEntryNote", v)}/>
          <TweakSlider label="Demo mileage" value={t.miles} min={0} max={150000} step={5000} unit=" mi" onChange={v=>setTweak("miles", v)}/>
          <TweakSection label="Launch copy"/>
          <TweakText label="Eyebrow" value={t.eyebrow} onChange={v=>setTweak("eyebrow", v)}/>
          <TweakText label="Headline" value={t.headline} onChange={v=>setTweak("headline", v)}/>
          <TweakText label="Sub-headline" value={t.subcopy} onChange={v=>setTweak("subcopy", v)}/>
          <TweakText label="Reserve button" value={t.ctaLabel} onChange={v=>setTweak("ctaLabel", v)}/>
          <TweakText label="Trial + price" value={t.priceNote} onChange={v=>setTweak("priceNote", v)}/>
          <TweakText label="Photo / onboarding note" value={t.photoNote} onChange={v=>setTweak("photoNote", v)}/>
          <TweakSlider label="Reserved count" value={t.reserved} min={0} max={20000} step={50} onChange={v=>setTweak("reserved", v)}/>
          <TweakSection label="Colour"/>
          <TweakColor label="Accent" value={t.accent} options={["#3B82F6","#0E9F6E","#A62B22","#6D28D9"]} onChange={v=>setTweak("accent", v)}/>
        </TweaksPanel>
      </div>
    </HHCtx.Provider>
  );
}

Object.assign(window, { HomeHero, HHNav, HHPlayground, HHReserve, HHReserveForm, HHReserveMeta, HHStats, HHEyebrow, HeroSplit, HeroStage, HeroCenter, HeroTree, HeroQuiet, HeroWaitlist, HeroBleed, HeroCinema, HeroLetterbox, HeroHud, HeroEditorial, HeroGradient, HH_STATS, HH_DIRECTIONS, HHCtx });
