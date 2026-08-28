/* Homepage hero — the twinned garage, rotating.
   One stage, five cars. Each car plays the same beat: the cursor lands on the front wheel,
   the wheel lights up, its tech tree opens. Then it cross-fades to the next twin.
   Auto-advances; arrows and dots steer it, and steering pauses the auto-advance. */

/* Camaro (ZL1 1LE) and XC90 are twinned but held out of the rotation — their glow layers
   don't register with the base render, so the overlay edges show. Put them back once the
   renders are re-QC'd in the admin. */
const HT_CARS = [
  { id:"challenger", name:"2015 Dodge Challenger", trim:"SRT 392", paint:"Granite Crystal", miles:65000, live:true,
    base:"assets/car-base.webp", gw:"assets/car-wheel-highlight-glow.webp", gh:"assets/car-hood-highlight-glow.webp",
    wheel:[39.6,65.5], hood:[61,42], glass:[44,29],
    rows:[["od","Front Tire","Past its life at 65,000 mi"],["up","Lug Nuts","Known issue · swelling · fix available"],["ok","Brake Rotor","On track · $89.99"],["ok","Brake Pads","On track · $41.99"]] },
  { id:"nautilus", name:"2019 Lincoln Nautilus", trim:"Standard", paint:"Magnetic Grey", miles:52000,
    base:"assets/lincoln/base-gray.webp", gw:"assets/lincoln/glow-wheel-gray.webp", gh:"assets/lincoln/glow-hood-gray.webp",
    wheel:[45,65], hood:[65,39], glass:[57,32],
    rows:[["od","Front Tire","Past its life at 52,000 mi"],["up","Front Rotor","Known issue · fix available"],["ok","Brake Pads","On track"],["ok","Wheel Bearing","On track"]] },
  { id:"murano", name:"2023 Nissan Murano", trim:"SV", paint:"Scarlet Ember", miles:24000,
    base:"assets/murano/base-red.png", gw:"assets/murano/glow-wheel-red.png", gh:"assets/murano/glow-hood-red.png",
    wheel:[41.5,66], hood:[63,35], glass:[54,31],
    rows:[["ok","Front Tire","On track · 24,000 mi"],["up","Front Rotor","Known issue · fix available"],["ok","Brake Pads","On track"],["ok","Wheel Bearing","On track"]] },
];

const HT_TONE = {
  od:{ edge:"#FF6B63", fill:"rgba(255,107,99,.18)", glow:"rgba(255,107,99,.7)", ink:"#FFD9D6", sub:"#FF9C96", icon:"alert" },
  up:{ edge:"#A78BFA", fill:"rgba(139,92,246,.2)",  glow:"rgba(139,92,246,.7)", ink:"#EDE4FF", sub:"#C9B6FF", icon:"shield-alert" },
  ok:{ edge:"#35D69B", fill:"rgba(53,214,155,.18)", glow:"rgba(53,214,155,.6)", ink:"#D8FFF0", sub:"#7FE9C4", icon:"check" },
};
/* one beat: marker lands, wheel lights, tree opens, hold, next car */
const HT_BEAT = [{ at:600, step:1 }, { at:1500, step:2 }, { at:7200, step:0 }];
const HT_MASK = "linear-gradient(90deg,transparent 0%,rgba(0,0,0,.35) 6%,#000 16%,#000 84%,rgba(0,0,0,.35) 94%,transparent 100%)";
/* the glow renders are opaque full frames whose backdrop doesn't match the base exactly, so
   reveal only a pool around the part being lit — no frame edge can show that way */
const htSpot = ([x, y], narrow) => `radial-gradient(ellipse 24% ${narrow ? 32 : 43}% at ${x}% ${y}%, #000 46%, rgba(0,0,0,.55) 68%, transparent 100%)`;
/* the wheel marker carries the worst mark under it, so a healthy car isn't flagged red */
const htWorst = c => c.rows.some(r => r[0] === "od") ? "od" : c.rows.some(r => r[0] === "up") ? "up" : "ok";

function HTMarker({ tone, x, y, label, live, small, inline }) {
  const c = HT_TONE[tone];
  const above = y > 55;
  return (
    <div style={{ position: inline ? "relative" : "absolute", ...(inline ? {} : { left:x + "%", top:y + "%", transform:"translate(-50%,-50%)" }), zIndex: live ? 4 : 3 }}>
      <div style={{ display:"grid", placeItems:"center", width: small ? 30 : 44, height: small ? 30 : 44, borderRadius:"50%", border:`2px solid ${c.edge}`, background:c.fill,
        boxShadow: live ? `0 0 0 7px ${c.fill}, 0 0 30px ${c.glow}` : `0 0 12px ${c.glow}`, transform: live ? "scale(1.12)" : "scale(1)", transition:"all .4s cubic-bezier(.2,.8,.2,1)" }}>
        <Icon name={c.icon} size={small ? 14 : 20} stroke={c.icon === "check" ? 2.6 : 2} style={{ color:c.ink }}/>
      </div>
      {live && !small && (
        <div style={{ position:"absolute", left:"50%", transform:"translateX(-50%)", ...(above ? { bottom:"100%", marginBottom:10 } : { top:"100%", marginTop:10 }), whiteSpace:"nowrap",
          background:"rgba(10,13,20,.82)", border:`1px solid ${c.edge}66`, backdropFilter:"blur(8px)", borderRadius:999, padding:"6px 13px", fontSize:12.5, fontWeight:600, color:c.ink }}>{label}</div>
      )}
    </div>
  );
}

function HTTreePanel({ car, open, narrow }) {
  return (
    <div style={{ position:"absolute", zIndex:6, ...(narrow ? { left:12, right:12, bottom:12 } : { right:20, top:"50%", width:330, transform: open ? "translate(0,-50%)" : "translate(16px,-50%)" }),
      background:"rgba(16,20,29,.9)", backdropFilter:"blur(14px)", border:"1px solid rgba(255,255,255,.12)", borderRadius:18, padding:16,
      opacity: open ? 1 : 0, transition:"opacity .45s ease, transform .45s cubic-bezier(.2,.8,.2,1)", pointerEvents:"none" }}>
      <div className="eyebrow" style={{ fontSize:9.5, color:"rgba(143,221,247,.9)" }}>Wheel, Tire &amp; Brakes</div>
      <div style={{ fontSize:18, fontWeight:600, color:"#fff", letterSpacing:"-0.02em", marginTop:4 }}>{car.rows.filter(r => r[0] !== "ok").length} of 11 need you</div>
      <div style={{ display:"flex", flexDirection:"column", gap:7, marginTop:12 }}>
        {car.rows.slice(0, narrow ? 2 : 4).map((r, i) => {
          const c = HT_TONE[r[0]];
          return (
            <div key={r[1]} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 10px", borderRadius:12, background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.07)",
              opacity: open ? 1 : 0, transform: open ? "none" : "translateY(6px)", transition:`opacity .35s ease ${0.1 + i * 0.09}s, transform .35s ease ${0.1 + i * 0.09}s` }}>
              <span style={{ width:26, height:26, borderRadius:"50%", display:"grid", placeItems:"center", border:`2px solid ${c.edge}`, background:c.fill, flexShrink:0 }}>
                <Icon name={c.icon} size={13} stroke={c.icon === "check" ? 2.6 : 2} style={{ color:c.ink }}/>
              </span>
              <span style={{ minWidth:0 }}>
                <span style={{ display:"block", fontSize:13, fontWeight:600, color:"#EAEEF5", letterSpacing:"-0.01em" }}>{r[1]}</span>
                <span style={{ display:"block", fontSize:11, color:"rgba(255,255,255,.5)", marginTop:1 }}>{r[2]}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HHTwins({ auto = true }) {
  const narrow = useNarrow();
  const [i, setI] = React.useState(0);
  const [step, setStep] = React.useState(0);
  const [held, setHeld] = React.useState(false);
  const car = HT_CARS[i];
  const go = React.useCallback(n => { setHeld(true); setStep(0); setI((n + HT_CARS.length) % HT_CARS.length); }, []);
  React.useEffect(() => {
    const ts = HT_BEAT.map(b => setTimeout(() => setStep(b.step), b.at));
    const next = (auto && !held) ? setTimeout(() => setI(v => (v + 1) % HT_CARS.length), 8200) : null;
    return () => { ts.forEach(clearTimeout); if (next) clearTimeout(next); };
  }, [i, auto, held]);
  const cursor = step >= 1 ? car.wheel : [88, 16];
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      <div style={{ position:"relative", borderRadius:18, overflow:"hidden", border:"1px solid rgba(255,255,255,.12)", background:"#05070C", boxShadow:"0 24px 60px rgba(0,0,0,.45)" }}>
        <div style={{ position:"relative", width:"100%", aspectRatio: narrow ? "4 / 3" : "16 / 9" }}>
          {HT_CARS.map((c, n) => (
            <React.Fragment key={c.id}>
              <img src={c.base} alt={`${c.name} ${c.trim}`} style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"contain", opacity: n === i ? 1 : 0, transition:"opacity .9s ease" }}/>
              <img src={c.gw} alt="" aria-hidden="true" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"contain", opacity: n === i && step >= 1 ? 1 : 0, transition:"opacity .55s ease" }}/>
            </React.Fragment>
          ))}
          <HTMarker tone={htWorst(car)} x={car.wheel[0]} y={car.wheel[1]} label="Wheel, Tire &amp; Brakes" live={step >= 1}/>
          <HTMarker tone="up" x={car.hood[0]} y={car.hood[1]} label="Engine" small={narrow}/>
          <HTMarker tone="ok" x={car.glass[0]} y={car.glass[1]} label="Windshield Wipers" small={narrow}/>
          <HTTreePanel car={car} open={step >= 2} narrow={narrow}/>
          <svg viewBox="0 0 26 34" aria-hidden="true" style={{ position:"absolute", width:24, height:31, left:`calc(${cursor[0]}% - 3px)`, top:`calc(${cursor[1]}% - 2px)`, zIndex:9, pointerEvents:"none",
            filter:"drop-shadow(0 3px 7px rgba(0,0,0,.6))", transition:"left 1s cubic-bezier(.4,.1,.2,1), top 1s cubic-bezier(.4,.1,.2,1)" }}>
            <path d="M3 2l17 13-7.5 1.5L17 27l-4 1.7-4.3-10L3 22V2Z" fill="#fff" stroke="#0A0D14" strokeWidth="1.6" strokeLinejoin="round"/>
          </svg>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", borderTop:"1px solid rgba(255,255,255,.09)", background:"rgba(8,11,18,.7)", flexWrap:"wrap" }}>
          <div style={{ minWidth:0 }}>
            <div style={{ fontSize:14.5, fontWeight:600, color:"#fff", letterSpacing:"-0.02em" }}>{car.name} <span style={{ color:"rgba(255,255,255,.5)", fontWeight:500 }}>{car.trim}</span></div>
            <div className="mono" style={{ fontSize:10.5, color:"rgba(255,255,255,.5)", marginTop:2 }}>{car.paint} · {car.miles.toLocaleString()} mi · {car.live ? "hub is live" : "twin mapped · trees in progress"}</div>
          </div>
          <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ display:"flex", gap:6 }}>
              {HT_CARS.map((c, n) => (
                <button key={c.id} onClick={()=>go(n)} aria-label={c.name} aria-current={n === i}
                  style={{ width: n === i ? 22 : 8, height:8, borderRadius:999, border:"none", padding:0, cursor:"pointer",
                    background: n === i ? "#8FDDF7" : "rgba(255,255,255,.28)", transition:"width .3s ease, background .3s ease" }}/>
              ))}
            </div>
            <div style={{ display:"flex", gap:6 }}>
              {[["Previous vehicle", -1, "M15 5l-7 7 7 7"], ["Next vehicle", 1, "M9 5l7 7-7 7"]].map(([lbl, d, path]) => (
                <button key={lbl} onClick={()=>go(i + d)} aria-label={lbl} style={{ width:32, height:32, borderRadius:999, cursor:"pointer", display:"grid", placeItems:"center",
                  background:"rgba(255,255,255,.08)", border:"1px solid rgba(255,255,255,.16)", color:"#fff" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={path}/></svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap", fontSize:12, color:"rgba(255,255,255,.55)" }}>
        <span>{HT_CARS.length} cars twinned so far — same tree, same part numbers, your paint.</span>
        <a href="Au7o Hub Tech Tree.html" style={{ fontSize:12.5, fontWeight:600, color:"#8FDDF7", textDecoration:"underline", textUnderlineOffset:3 }}>Open the live hub on the Challenger →</a>
      </div>
    </div>
  );
}

/* ── Hero direction: the garage rotates behind the reservation form ── */
function HeroTwins() {
  const { t } = useHH();
  return (
    <div style={{ background:"#05070C", minHeight:"100dvh" }}>
      <HHNav dark/>
      <main style={{ maxWidth:1240, margin:"0 auto", padding:"22px clamp(20px,5vw,56px) 60px", display:"flex", flexDirection:"column", gap:22 }}>
        <div style={{ display:"flex", gap:28, alignItems:"flex-end", flexWrap:"wrap" }}>
          <div style={{ flex:"1 1 440px", minWidth:0, display:"flex", flexDirection:"column", gap:14 }}>
            <HHEyebrow dark/>
            <HHHeadline size={54} dark/>
            <HHSub dark max={600}/>
          </div>
        </div>
        <HHTwins/>
        <HHReserve dark/>
      </main>
    </div>
  );
}

/* ── The hero stage, rotating ──
   The Challenger keeps the full interactive stage (its trees are real). The other twins are
   renders with their own markers and glows; clicking one says so rather than opening a tree
   that belongs to a different car. Auto-advances; arrows and dots steer it and stop it. */
function HHStageCarousel({ mode, setMode, narrow, hideNote, noteDark, onOpen }) {
  const [i, setI] = React.useState(0);
  const [held, setHeld] = React.useState(false);
  const [lit, setLit] = React.useState(null);
  const [hover, setHover] = React.useState(null);
  const [note, setNote] = React.useState(null);
  const car = HT_CARS[i];
  const on = hover || lit;
  const go = n => { setHeld(true); setLit(null); setHover(null); setNote(null); setI((n + HT_CARS.length) % HT_CARS.length); };
  React.useEffect(() => {
    if (held) return;
    const t = setTimeout(() => { setLit(null); setNote(null); setI(v => (v + 1) % HT_CARS.length); }, 9000);
    return () => clearTimeout(t);
  }, [i, held]);
  const tap = key => { setLit(key); setNote(`${car.name} ${car.trim} is twinned — its part trees are being mapped now. The live tree runs on our Challenger.`); };
  return (
    <div style={{ position:"relative" }}>
      {/* the renders are cropped differently car to car — fade the sides so no cut edge shows */}
      <div aria-hidden="true" style={{ position:"absolute", left:0, right:0, top:0, aspectRatio: narrow ? "4 / 3" : "16 / 9", pointerEvents:"none", zIndex:2,
        background:"linear-gradient(90deg,#0A0D14 0%,rgba(10,13,20,.92) 8%,rgba(10,13,20,0) 24%,rgba(10,13,20,0) 76%,rgba(10,13,20,.92) 92%,#0A0D14 100%)" }}/>
      {car.live
        ? <THStage mode={mode} setMode={setMode} mobile={narrow} hideNote={hideNote} noteDark={noteDark} onOpen={onOpen}/>
        : (
          <div>
            <div style={{ position:"relative", width:"100%", aspectRatio: narrow ? "4 / 3" : "16 / 9", background:"#0A0D14" }}>
              {/* base and glow share one mask, so the glow can't reveal an edge the base hides */}
              <div style={{ position:"absolute", inset:0, maskImage:HT_MASK, WebkitMaskImage:HT_MASK }}>
                <img src={car.base} alt={`${car.name} ${car.trim}`} style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"contain" }}/>
                <img src={car.gw} alt="" aria-hidden="true" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"contain", maskImage:htSpot(car.wheel, narrow), WebkitMaskImage:htSpot(car.wheel, narrow), opacity: on === "wheel" ? 1 : 0, transition:"opacity .35s ease" }}/>
                <img src={car.gh} alt="" aria-hidden="true" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"contain", maskImage:htSpot(car.hood, narrow), WebkitMaskImage:htSpot(car.hood, narrow), opacity: on === "hood" ? 1 : 0, transition:"opacity .35s ease" }}/>
              </div>
              {[["wheel", htWorst(car), car.wheel, "Wheel, Tire & Brakes"], ["hood", "up", car.hood, "Engine"], ["glass", "ok", car.glass, "Windshield Wipers"]].map(([k, tone, pos, label]) => (
                <button key={k} onMouseOver={()=>setHover(k)} onMouseOut={()=>setHover(null)} onFocus={()=>setHover(k)} onBlur={()=>setHover(null)} onClick={()=>tap(k)} aria-label={label} style={{ position:"absolute", left:pos[0] + "%", top:pos[1] + "%", transform:"translate(-50%,-50%)", background:"transparent", border:"none", padding:0, cursor:"pointer", zIndex: on === k ? 6 : 5 }}>
                  <HTMarker tone={tone} x={0} y={pos[1]} label={label} live={on === k} small={narrow} inline/>
                </button>
              ))}
            </div>
            <div style={{ padding:"11px 14px", background:"#0A0D14", borderTop:"1px solid rgba(255,255,255,.1)" }}>
              <div style={{ fontSize:15, fontWeight:600, color:"#fff", letterSpacing:"-0.02em" }}>{car.name} <span style={{ color:"rgba(255,255,255,.5)", fontWeight:500 }}>{car.trim}</span></div>
              <div className="mono" style={{ fontSize:10.5, color:"rgba(255,255,255,.55)", marginTop:3 }}>{car.paint} · {car.miles.toLocaleString()} mi · twin mapped · trees in progress</div>
              {note && <div style={{ fontSize:11.5, color:"rgba(255,255,255,.62)", marginTop:7, textWrap:"pretty" }}>{note}</div>}
            </div>
          </div>
        )}
      <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", background:"#0A0D14", borderTop:"1px solid rgba(255,255,255,.1)", flexWrap:"wrap" }}>
        <span className="mono" style={{ fontSize:10, letterSpacing:"0.14em", textTransform:"uppercase", color:"rgba(255,255,255,.42)" }}>{HT_CARS.length} cars twinned</span>
        <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ display:"flex", gap:6 }}>
            {HT_CARS.map((c, n) => (
              <button key={c.id} onClick={()=>go(n)} aria-label={c.name} aria-current={n === i}
                style={{ width: n === i ? 22 : 8, height:8, borderRadius:999, border:"none", padding:0, cursor:"pointer", background: n === i ? "#8FDDF7" : "rgba(255,255,255,.28)", transition:"width .3s ease, background .3s ease" }}/>
            ))}
          </div>
          <div style={{ display:"flex", gap:6 }}>
            {[["Previous vehicle", -1, "M15 5l-7 7 7 7"], ["Next vehicle", 1, "M9 5l7 7-7 7"]].map(([lbl, d, path]) => (
              <button key={lbl} onClick={()=>go(i + d)} aria-label={lbl} style={{ width:30, height:30, borderRadius:999, cursor:"pointer", display:"grid", placeItems:"center", background:"rgba(255,255,255,.08)", border:"1px solid rgba(255,255,255,.16)", color:"#fff" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={path}/></svg>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { HHTwins, HeroTwins, HHStageCarousel, HT_CARS, HTMarker, HTTreePanel, htWorst });
