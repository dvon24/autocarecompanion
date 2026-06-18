/* Au7o · 14 · Snap-first diagnosis — the Cal-AI-style funnel.
   Self-contained: detection data + all four screens.

   Mobile flow (button → camera in ONE tap):
     CaptureCamera  → CaptureProcessing → AnnotatedDiagnosis (result)
   Desktop: upload-first, then DesktopYmmtPrompt (YMMT optional, AFTER the photo).

   Exports:
     AU7O_DETECTIONS   the part-detection data for the demo photo (swap with
                       your vision model's bounding boxes: x/y = pin %, card/anchor
                       = callout + tether anchor in image %).
     CaptureCamera({ mode:"diagnosis"|"parts", knownCar, scansLeft })
     CaptureProcessing({ ymmt })          ymmt=true → YMMT sheet as productive waiting
     AnnotatedDiagnosis({ embedded })     the result: real photo + floating overlays
     DesktopYmmtPrompt()                  desktop optional-YMMT-after-upload

   Depends on: Icon (components/Icon.tsx), brand/challenger-wheel.jpg,
   brand/au7o-mascot.png. Free-standing — no other screen file required.
*/

const SNAP_IMG = "brand/challenger-wheel.jpg";

// ─── Detection data (replace with vision-model output per photo) ──
const AU7O_DETECTIONS = [
  {
    id:"wheel", x: 57, y: 51, status:"ok",
    title:'20" Hellcat-Style Wheel', finding:"Straight — no curb rash on the lip",
    desc:"Aftermarket split-spoke replica, 20×9.5. Finish is clean, lip is undamaged.",
    sku:"Fitment 5×115 · ET18", badge:{ label:"Compatible", tone:"blue" },
    card:{ x: 51, y: 8 }, anchor:{ x: 60, y: 32 },
  },
  {
    id:"caliper", x: 37, y: 57, status:"ok",
    title:"Brembo 4-Piston Caliper", finding:"Pads healthy · no fluid weeping",
    desc:"Front red Brembo. Pad material looks above 6 mm, seals dry at the pistons.",
    sku:"Mopar 68249101AB", badge:{ label:"In stock", tone:"green" },
    card:{ x: 2, y: 62 }, anchor:{ x: 26, y: 62 },
  },
  {
    id:"tire", x: 62, y: 72, status:"warn",
    title:"Pirelli P Zero", finding:"~4/32\" tread — plan ahead",
    desc:"275/40ZR20 staggered fitment. Even wear, but getting toward replacement.",
    sku:"PIR-2654300", badge:{ label:"In stock", tone:"green" },
    card:{ x: 51, y: 75 }, anchor:{ x: 59, y: 75 },
  },
  {
    id:"badge", x: 17, y: 38, status:"info",
    title:"392 HEMI Fender Badge", finding:"Confirms Scat Pack / SRT 392 trim",
    desc:"Factory 6.4L emblem — Au7o uses it to lock every part to your exact trim.",
    sku:"Mopar 68259533AA", badge:{ label:"Identified", tone:"blue" },
    card:{ x: 26, y: 18 }, anchor:{ x: 28, y: 29 },
  },
];

function snapColor(s){ return s === "warn" ? "#B45309" : s === "info" ? "var(--au7o-blue)" : "var(--ok)"; }
function snapTone(t){
  return t === "green" ? { bg:"rgba(31,138,91,0.12)", fg:"#0f6b46" }
       : t === "blue"  ? { bg:"var(--au7o-blue-50)", fg:"var(--au7o-blue-700)" }
       : { bg:"rgba(180,83,9,0.12)", fg:"#92400E" };
}
const snapShort = (t) => t.replace(/^[\d"]+\s*/,'').split(" ").slice(0,2).join(" ");

// the actionable kit for THIS photo (the tires are the one aging item)
const SNAP_KIT = {
  title: "Recommended · fresh rubber",
  lines: [
    { n:"Pirelli P Zero · front pair", s:"245/45ZR20", p: 560 },
    { n:"Pirelli P Zero · rear pair",  s:"275/40ZR20", p: 640 },
    { n:"Mount, balance & alignment",  s:"local installer", p: 180, soft: true },
  ],
  total: 1380, save: 420,
};

// ════════════════════════════════════════════════════════════════
// 1 · CAMERA — dark, one tap from the button. mode = "diagnosis" | "parts"
// ════════════════════════════════════════════════════════════════
function CaptureCamera({ mode = "diagnosis", knownCar = true, scansLeft = 1 }) {
  const isParts = mode === "parts";
  return (
    <div style={{ height:"100%", width:"100%", position:"relative", overflow:"hidden", background:"#0B0E14", fontFamily:"var(--font-sans)" }}>
      <img src={SNAP_IMG} alt="" style={{ position:"absolute", inset: 0, width:"100%", height:"100%", objectFit:"cover" }}/>
      <div style={{ position:"absolute", inset: 0, background:"radial-gradient(120% 75% at 50% 42%, transparent 42%, rgba(11,14,20,0.6) 100%)" }}/>

      {/* TOP BAR */}
      <div style={{ position:"absolute", top: 12, left: 12, right: 12, zIndex: 6, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <button style={{ width: 34, height: 34, borderRadius:"50%", background:"rgba(0,0,0,0.42)", backdropFilter:"blur(10px)", border:"1px solid rgba(255,255,255,0.14)", color:"#fff", display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize: 15 }}>✕</button>
        <button style={{ display:"inline-flex", alignItems:"center", gap: 7, padding:"7px 13px", background:"rgba(0,0,0,0.42)", backdropFilter:"blur(10px)", border:"1px solid rgba(255,255,255,0.14)", borderRadius: 999, color:"#fff", cursor:"pointer", fontFamily:"var(--font-sans)" }}>
          <Icon name="car" size={13} style={{ color:"rgba(255,255,255,0.85)" }}/>
          <span style={{ fontSize: 12, fontWeight: 600 }}>{knownCar ? "2015 SRT 392" : "Add your car"}</span>
          <Icon name="chevron-down" size={11} style={{ color:"rgba(255,255,255,0.6)" }}/>
        </button>
        <button style={{ width: 34, height: 34, borderRadius:"50%", background:"rgba(0,0,0,0.42)", backdropFilter:"blur(10px)", border:"1px solid rgba(255,255,255,0.14)", color:"#fff", display:"inline-flex", alignItems:"center", justifyContent:"center" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z"/></svg>
        </button>
      </div>

      {/* KNOWN ISSUES entry + scans-left */}
      <div style={{ position:"absolute", top: 56, left: 12, right: 12, zIndex: 6, display:"flex", alignItems:"center", gap: 8 }}>
        <button style={{ display:"inline-flex", alignItems:"center", gap: 7, padding:"7px 12px", background:"rgba(255,255,255,0.12)", backdropFilter:"blur(10px)", border:"1px solid rgba(255,255,255,0.18)", borderRadius: 999, color:"#fff", cursor:"pointer", fontFamily:"var(--font-sans)" }}>
          <Icon name="search" size={12}/>
          <span style={{ fontSize: 11.5, fontWeight: 600 }}>Browse 4,500 known issues</span>
        </button>
        <span style={{ marginLeft:"auto", display:"inline-flex", alignItems:"center", gap: 5, padding:"6px 10px", background: scansLeft > 0 ? "rgba(59,130,246,0.9)" : "rgba(180,83,9,0.92)", borderRadius: 999, color:"#fff" }}>
          <Icon name="camera" size={11}/>
          <span style={{ fontSize: 10.5, fontWeight: 700 }}>{scansLeft} free left</span>
        </span>
      </div>

      {/* FRAME GUIDE */}
      <div style={{ position:"absolute", inset: 0, display:"flex", alignItems:"center", justifyContent:"center", pointerEvents:"none", zIndex: 4 }}>
        <div style={{ position:"relative", width: 250, height: 250 }}>
          <SnapBracket pos="tl"/><SnapBracket pos="tr"/><SnapBracket pos="bl"/><SnapBracket pos="br"/>
        </div>
      </div>

      {/* live-detect chip */}
      <div style={{ position:"absolute", top:"50%", left: 0, right: 0, marginTop: 150, zIndex: 5, display:"flex", justifyContent:"center", padding:"0 24px" }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap: 8, padding:"7px 13px", background:"rgba(59,130,246,0.92)", backdropFilter:"blur(10px)", borderRadius: 999, boxShadow:"0 6px 20px rgba(59,130,246,0.4)" }}>
          <img src="brand/au7o-mascot.png" alt="" style={{ width: 15, height: 15 }}/>
          <span style={{ fontSize: 11, fontWeight: 600, color:"#fff" }}>{isParts ? "Frame the part you want to match" : "Frame the problem — hold steady"}</span>
        </div>
      </div>

      {/* BOTTOM CONTROLS */}
      <div style={{ position:"absolute", bottom: 0, left: 0, right: 0, zIndex: 6, padding:"18px 0 24px", background:"linear-gradient(180deg, transparent, rgba(11,14,20,0.9) 42%)" }}>
        {/* mode toggle */}
        <div style={{ display:"flex", justifyContent:"center", marginBottom: 16 }}>
          <div style={{ display:"flex", gap: 2, padding: 3, background:"rgba(0,0,0,0.45)", backdropFilter:"blur(10px)", border:"1px solid rgba(255,255,255,0.14)", borderRadius: 999 }}>
            {[{k:"diagnosis",l:"Diagnosis",ic:"alert"},{k:"parts",l:"Parts",ic:"settings"}].map(m=>{
              const on = m.k === mode;
              return (
                <span key={m.k} style={{ display:"inline-flex", alignItems:"center", gap: 6, padding:"7px 16px", borderRadius: 999, fontSize: 12.5, fontWeight: 600, cursor:"pointer",
                  background: on ? "#fff" : "transparent", color: on ? "var(--ink)" : "rgba(255,255,255,0.7)" }}>
                  <Icon name={m.ic} size={12}/> {m.l}
                </span>
              );
            })}
          </div>
        </div>

        {/* shutter row */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 34px" }}>
          <button style={{ position:"relative", width: 46, height: 46, borderRadius: 11, overflow:"hidden", border:"1px solid rgba(255,255,255,0.3)", padding: 0, background:"#1a2030" }}>
            <img src={SNAP_IMG} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", opacity: 0.85 }}/>
            <span style={{ position:"absolute", right:-4, bottom:-4, width: 20, height: 20, borderRadius:"50%", background:"var(--au7o-blue)", border:"2px solid #0B0E14", display:"inline-flex", alignItems:"center", justifyContent:"center", color:"#fff" }}>
              <Icon name="plus" size={11}/>
            </span>
          </button>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap: 7 }}>
            <button style={{ width: 76, height: 76, borderRadius:"50%", background:"transparent", border:"4px solid #fff", display:"inline-flex", alignItems:"center", justifyContent:"center", padding: 0 }}>
              <span style={{ width: 60, height: 60, borderRadius:"50%", background:"#fff" }}/>
            </button>
            <span style={{ fontSize: 10, color:"rgba(255,255,255,0.7)", fontWeight: 500 }}>Tap photo · hold video <span className="mono">(15s)</span></span>
          </div>
          <button style={{ width: 46, height: 46, borderRadius:"50%", background:"rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.28)", color:"#fff", display:"inline-flex", alignItems:"center", justifyContent:"center" }}>
            <Icon name="mic" size={18}/>
          </button>
        </div>
      </div>
    </div>
  );
}

function SnapBracket({ pos }) {
  const base = { position:"absolute", width: 30, height: 30, borderColor:"#fff", borderStyle:"solid", borderWidth: 0, opacity: 0.9 };
  const map = {
    tl: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 9 },
    tr: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 9 },
    bl: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 9 },
    br: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 9 },
  };
  return <span style={{ ...base, ...map[pos] }}/>;
}

// ════════════════════════════════════════════════════════════════
// 2 · PROCESSING — captured frame + scan-line + thinking logs.
//     ymmt=true → YMMT sheet slides up (productive waiting)
// ════════════════════════════════════════════════════════════════
function CaptureProcessing({ ymmt = true }) {
  const logs = [
    { t:"Identifying parts in frame", done: true },
    { t:"Matching against 4,500 known issues", done: true },
    { t:"Cross-referencing TSBs & recalls", active: true },
    { t:"Pricing parts that fit your trim", done: false },
  ];
  return (
    <div style={{ height:"100%", width:"100%", position:"relative", overflow:"hidden", background:"#0B0E14", fontFamily:"var(--font-sans)" }}>
      <style>{`@keyframes snapScan { 0%{top:4%} 50%{top:90%} 100%{top:4%} }`}</style>
      <img src={SNAP_IMG} alt="" style={{ position:"absolute", inset: 0, width:"100%", height:"100%", objectFit:"cover", opacity: 0.55 }}/>
      <div style={{ position:"absolute", inset: 0, background:"rgba(11,14,20,0.5)" }}/>
      <div style={{ position:"absolute", left: 0, right: 0, height: 2, background:"linear-gradient(90deg, transparent, var(--au7o-blue), transparent)", boxShadow:"0 0 16px var(--au7o-blue)", animation:"snapScan 2s ease-in-out infinite", zIndex: 2 }}/>

      <div style={{ position:"absolute", top: 16, left: 14, right: 14, zIndex: 4 }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap: 8, padding:"7px 13px", background:"rgba(11,18,32,0.66)", backdropFilter:"blur(10px)", borderRadius: 999, border:"1px solid rgba(255,255,255,0.12)" }}>
          <img src="brand/au7o-mascot.png" alt="" style={{ width: 16, height: 16 }}/>
          <span style={{ fontSize: 11.5, fontWeight: 600, color:"#fff" }}>Analyzing your photo…</span>
        </div>
      </div>

      {!ymmt && (
        <div style={{ position:"absolute", left: 14, right: 14, bottom: 28, zIndex: 4, display:"flex", flexDirection:"column", gap: 9 }}>
          {logs.map((s,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", gap: 10 }}>
              <span style={{ width: 20, height: 20, borderRadius:"50%", flexShrink: 0, background: s.done?"var(--ok)":s.active?"var(--au7o-blue)":"rgba(255,255,255,0.14)", display:"inline-flex", alignItems:"center", justifyContent:"center", color:"#fff" }}>
                {s.done ? <Icon name="check" size={11}/> : s.active ? <span className="au7o-pulse-soft" style={{ width: 7, height: 7, borderRadius:"50%", background:"#fff" }}/> : null}
              </span>
              <span style={{ fontSize: 12.5, fontWeight: s.active?600:500, color: s.done||s.active?"#fff":"rgba(255,255,255,0.5)" }}>{s.t}</span>
            </div>
          ))}
        </div>
      )}

      {ymmt && (
        <div style={{ position:"absolute", left: 0, right: 0, bottom: 0, zIndex: 6, background:"var(--paper)", borderTopLeftRadius: 22, borderTopRightRadius: 22, padding:"16px 18px 22px", boxShadow:"0 -14px 44px rgba(0,0,0,0.5)" }}>
          <div style={{ width: 36, height: 4, borderRadius: 999, background:"var(--paper-line)", margin:"0 auto 14px" }}/>
          <div style={{ display:"flex", alignItems:"center", gap: 8, marginBottom: 12 }}>
            <span className="au7o-pulse-soft" style={{ width: 8, height: 8, borderRadius:"50%", background:"var(--au7o-blue)", flexShrink: 0 }}/>
            <span style={{ fontSize: 11.5, color:"var(--slate-600)" }}>Analyzing while you confirm — this makes it accurate</span>
          </div>
          <h2 style={{ fontSize: 19, fontWeight: 700, letterSpacing:"-0.02em", margin:"0 0 12px" }}>Which car is this?</h2>

          <div style={{ marginBottom: 9 }}>
            <div className="eyebrow" style={{ fontSize: 9, marginBottom: 6 }}>YEAR</div>
            <div style={{ display:"flex", gap: 6, overflowX:"auto", paddingBottom: 2 }}>
              {["2013","2014","2015","2016","2017"].map((y,i)=>(
                <span key={i} style={{ flexShrink: 0, padding:"9px 16px", borderRadius: 10, fontSize: 15, fontWeight: 700, fontFamily:"var(--font-mono)", cursor:"pointer",
                  background: y==="2015" ? "var(--ink)" : "var(--paper-2)", color: y==="2015" ? "#fff" : "var(--slate-500)", border:`1px solid ${y==="2015"?"var(--ink)":"var(--paper-line)"}` }}>{y}</span>
              ))}
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: 8, marginBottom: 9 }}>
            {[["MAKE","Dodge"],["MODEL","Challenger"]].map(([k,v],i)=>(
              <div key={i} style={{ display:"flex", flexDirection:"column", gap: 4, padding:"11px 13px", background:"#fff", border:"1px solid var(--au7o-blue)", borderRadius: 11, boxShadow:"0 0 0 3px rgba(59,130,246,0.1)" }}>
                <span className="eyebrow" style={{ fontSize: 8.5 }}>{k}</span>
                <span style={{ fontSize: 14.5, fontWeight: 700 }}>{v}</span>
              </div>
            ))}
          </div>

          <div style={{ display:"flex", alignItems:"center", gap: 8, padding:"10px 13px", background:"var(--paper-2)", border:"1px solid var(--paper-line)", borderRadius: 11, marginBottom: 14 }}>
            <span className="eyebrow" style={{ fontSize: 8.5 }}>TRIM</span>
            <span style={{ fontSize: 13.5, fontWeight: 600, color:"var(--slate-600)" }}>SRT 392</span>
            <span style={{ marginLeft:"auto", fontSize: 10.5, color:"var(--slate-400)" }}>optional</span>
          </div>

          <button style={{ width:"100%", padding:"14px 0", background:"var(--au7o-blue)", color:"#fff", border:"none", borderRadius: 13, fontSize: 15, fontWeight: 600, cursor:"pointer", fontFamily:"var(--font-sans)", display:"inline-flex", alignItems:"center", justifyContent:"center", gap: 8, boxShadow:"0 8px 22px rgba(59,130,246,0.32)" }}>
            <Icon name="spark" size={15}/> Diagnose my Challenger
          </button>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 3 · RESULT — annotated real photo + floating tethered overlays
//     embedded → drop the back-header (when used inside the hub)
// ════════════════════════════════════════════════════════════════
function AnnotatedDiagnosis({ embedded = false }) {
  const parts = AU7O_DETECTIONS;
  const [active, setActive] = React.useState("tire");
  const act = parts.find(p => p.id === active) || parts[0];

  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", background:"var(--paper)", overflow:"hidden", fontFamily:"var(--font-sans)" }}>
      <style>{`
        @keyframes snapRadar { 0% { transform: scale(1); opacity:.5 } 70% { transform: scale(2.6); opacity:0 } 100% { opacity:0 } }
        .snap-hs { position:absolute; transform:translate(-50%,-50%); cursor:pointer; border:none; background:transparent; padding:0; }
        .snap-hs .ring { position:absolute; inset:0; margin:auto; width:18px; height:18px; border-radius:50%; }
        .snap-hs .ring.r1 { animation: snapRadar 2.4s ease-out infinite; }
        .snap-hs .ring.r2 { animation: snapRadar 2.4s ease-out infinite 1.2s; }
      `}</style>

      {!embedded && (
        <div style={{ display:"flex", alignItems:"center", gap: 10, padding:"10px 14px", borderBottom:"1px solid var(--paper-line)", flexShrink: 0 }}>
          <button style={{ width: 30, height: 30, borderRadius:"50%", background:"#fff", border:"1px solid var(--paper-line)", display:"inline-flex", alignItems:"center", justifyContent:"center", color:"var(--slate-500)" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, letterSpacing:"-0.01em" }}>Diagnosis</div>
            <div className="mono" style={{ fontSize: 9, color:"var(--slate-500)" }}>FROM YOUR PHOTO · 2015 SRT 392</div>
          </div>
          <span style={{ display:"inline-flex", alignItems:"center", gap: 5, padding:"4px 9px", background:"var(--au7o-blue-50)", borderRadius: 999 }}>
            <span className="mono" style={{ fontSize: 11, fontWeight: 700, color:"var(--au7o-blue-700)" }}>{parts.length}</span>
            <span style={{ fontSize: 10, fontWeight: 600, color:"var(--au7o-blue-700)" }}>found</span>
          </span>
        </div>
      )}

      <div style={{ flex: 1, overflow:"auto" }}>
        {/* FULL-BLEED ANNOTATED PHOTO with floating frosted overlays */}
        <div style={{ position:"relative", background:"#0B0E14", aspectRatio:"4 / 3", overflow:"hidden" }}>
          <img src={SNAP_IMG} alt="" style={{ display:"block", width:"100%", height:"100%", objectFit:"cover" }}/>
          <div style={{ position:"absolute", inset: 0, background:"linear-gradient(180deg, rgba(11,14,20,0.28), transparent 24%, transparent 68%, rgba(11,14,20,0.4))" }}/>

          <div style={{ position:"absolute", top: 10, left: 10, display:"inline-flex", alignItems:"center", gap: 6, padding:"5px 10px", background:"rgba(11,18,32,0.62)", backdropFilter:"blur(8px)", borderRadius: 999, border:"1px solid rgba(255,255,255,0.12)" }}>
            <span className="au7o-pulse-soft" style={{ width: 6, height: 6, borderRadius:"50%", background:"var(--au7o-blue)" }}/>
            <span style={{ fontSize: 10, fontWeight: 600, color:"#fff", letterSpacing:"0.03em" }}>AU7O DETECTED {parts.length} PARTS</span>
          </div>

          {act && (
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position:"absolute", inset: 0, width:"100%", height:"100%", pointerEvents:"none", zIndex: 3 }}>
              <line x1={act.x} y1={act.y} x2={act.anchor.x} y2={act.anchor.y} stroke="#fff" strokeWidth="3" vectorEffect="non-scaling-stroke" strokeOpacity="0.7" strokeLinecap="round"/>
              <line x1={act.x} y1={act.y} x2={act.anchor.x} y2={act.anchor.y} stroke="#0B1220" strokeWidth="1.3" vectorEffect="non-scaling-stroke" strokeOpacity="0.55" strokeLinecap="round"/>
            </svg>
          )}

          {parts.map(p => {
            const c = snapColor(p.status); const on = p.id === active;
            return (
              <button key={p.id} className="snap-hs" style={{ left:`${p.x}%`, top:`${p.y}%`, zIndex: on ? 5 : 4 }} onClick={() => setActive(p.id)}>
                <span className="ring r1" style={{ background: c }}/>
                <span className="ring r2" style={{ background: c }}/>
                <span style={{ position:"relative", display:"block", width: on ? 18 : 14, height: on ? 18 : 14, borderRadius:"50%", background: c, border:"2.5px solid #fff", boxShadow:"0 2px 8px rgba(0,0,0,0.45)", transition:"width .15s, height .15s" }}/>
              </button>
            );
          })}

          {act && <SnapFloatCard part={act}/>}
        </div>

        {/* part chips */}
        <div style={{ display:"flex", gap: 6, overflowX:"auto", padding:"12px 14px 2px" }}>
          {parts.map(p => {
            const on = p.id === active;
            return (
              <button key={p.id} onClick={() => setActive(p.id)} style={{
                flexShrink: 0, display:"inline-flex", alignItems:"center", gap: 7, padding:"7px 12px", borderRadius: 999, cursor:"pointer", fontFamily:"var(--font-sans)",
                background: on ? "var(--ink)" : "#fff", border:`1px solid ${on ? "var(--ink)" : "var(--paper-line)"}`,
                color: on ? "#fff" : "var(--slate-600)", boxShadow: on ? "var(--shadow-1)" : "none" }}>
                <span style={{ width: 8, height: 8, borderRadius:"50%", background: snapColor(p.status) }}/>
                <span style={{ fontSize: 12, fontWeight: 600, whiteSpace:"nowrap" }}>{snapShort(p.title)}</span>
              </button>
            );
          })}
        </div>

        {/* ANALYSIS */}
        <div style={{ padding:"14px 14px 0" }}>
          <div style={{ display:"flex", alignItems:"center", gap: 7, marginBottom: 8 }}>
            <img src="brand/au7o-mascot.png" alt="" style={{ width: 20, height: 20 }}/>
            <span className="eyebrow" style={{ fontSize: 9.5, color:"var(--au7o-blue)" }}>AU7O'S ANALYSIS</span>
          </div>
          <p style={{ fontSize: 12.5, color:"var(--ink)", lineHeight: 1.55, margin: 0 }}>
            Clean car. Your <b>Brembos</b> and <b>Hellcat-style wheels</b> check out — no curb rash, pads look healthy. The one thing aging is the <b style={{ color:"#92400E" }}>Pirelli P Zeros (~4/32")</b>. I priced a staggered set that fits your 392.
          </p>
        </div>

        {/* JOB KIT */}
        <div style={{ padding:"14px 14px 18px" }}>
          <div style={{ background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 14, boxShadow:"var(--shadow-1)", overflow:"hidden" }}>
            <div style={{ display:"flex", alignItems:"center", gap: 8, padding:"11px 13px", borderBottom:"1px solid var(--paper-line)" }}>
              <span style={{ width: 24, height: 24, borderRadius: 7, background:"#B45309", display:"inline-flex", alignItems:"center", justifyContent:"center", flexShrink: 0 }}>
                <Icon name="wrench" size={12} style={{ color:"#fff" }}/>
              </span>
              <span style={{ fontSize: 13, fontWeight: 700 }}>{SNAP_KIT.title}</span>
              <span style={{ marginLeft:"auto", display:"inline-flex", alignItems:"center", gap: 4, fontSize: 10.5, color:"var(--ok)", fontWeight: 600 }}>
                <Icon name="check" size={11}/> Fits your 392
              </span>
            </div>
            {SNAP_KIT.lines.map((r,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"center", gap: 10, padding:"9px 13px", borderBottom:"1px solid var(--paper-line)" }}>
                <Icon name={r.soft ? "plus" : "check"} size={12} style={{ color: r.soft ? "var(--slate-400)" : "var(--ok)", flexShrink: 0 }}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600 }}>{r.n}</div>
                  <div className="mono" style={{ fontSize: 9.5, color:"var(--slate-500)" }}>{r.s}</div>
                </div>
                <span className="mono" style={{ fontSize: 12.5, fontWeight: 700, color: r.soft ? "var(--slate-400)" : "var(--ink)" }}>${r.p}</span>
              </div>
            ))}
            <div style={{ display:"flex", alignItems:"center", gap: 12, padding:"12px 13px" }}>
              <div>
                <div className="eyebrow" style={{ fontSize: 8.5 }}>KIT TOTAL</div>
                <div style={{ display:"flex", alignItems:"baseline", gap: 6, marginTop: 1 }}>
                  <span className="mono" style={{ fontSize: 21, fontWeight: 700 }}>${SNAP_KIT.total.toLocaleString()}</span>
                  <span style={{ fontSize: 10.5, color:"var(--ok)", fontWeight: 600 }}>save ${SNAP_KIT.save} vs dealer</span>
                </div>
              </div>
              <button style={{ marginLeft:"auto", padding:"11px 16px", background:"var(--ink)", color:"#fff", border:"none", borderRadius: 11, fontSize: 13, fontWeight: 600, cursor:"pointer", fontFamily:"var(--font-sans)", display:"inline-flex", alignItems:"center", gap: 6, flexShrink: 0 }}>
                <Icon name="spark" size={13}/> Add kit
              </button>
            </div>
          </div>

          <div style={{ display:"flex", gap: 7, marginTop: 10 }}>
            <button style={{ flex: 1, padding:"10px 0", background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 10, fontSize: 12, fontWeight: 600, color:"var(--ink)", cursor:"pointer", fontFamily:"var(--font-sans)", display:"inline-flex", alignItems:"center", justifyContent:"center", gap: 6 }}>
              <Icon name="camera" size={12} style={{ color:"var(--au7o-blue)" }}/> Add an angle
            </button>
            <button style={{ flex: 1, padding:"10px 0", background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 10, fontSize: 12, fontWeight: 600, color:"var(--ink)", cursor:"pointer", fontFamily:"var(--font-sans)", display:"inline-flex", alignItems:"center", justifyContent:"center", gap: 6 }}>
              <Icon name="chat" size={12} style={{ color:"var(--au7o-blue)" }}/> Ask a follow-up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SnapFloatCard({ part }) {
  const tone = snapTone(part.badge.tone);
  const right = part.card.x >= 48; // right-half cards anchor to the right edge so they never clip
  return (
    <div style={{ position:"absolute", zIndex: 6, ...(right ? { right: "4%" } : { left:`${part.card.x}%` }), top:`${part.card.y}%`, width:"min(52%, 206px)",
      background:"rgba(255,255,255,0.93)", backdropFilter:"blur(14px)", border:"1px solid rgba(255,255,255,0.7)", borderRadius: 13, boxShadow:"0 12px 32px rgba(11,18,32,0.4)", padding:"11px 12px" }}>
      <div style={{ display:"flex", alignItems:"flex-start", gap: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius:"50%", background: snapColor(part.status), marginTop: 4, flexShrink: 0 }}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing:"-0.01em", color:"var(--ink)", lineHeight: 1.2 }}>{part.title}</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: snapColor(part.status), marginTop: 2 }}>{part.finding}</div>
        </div>
      </div>
      <div style={{ fontSize: 11, color:"var(--slate-700)", lineHeight: 1.45, marginTop: 7 }}>{part.desc}</div>
      <div style={{ display:"flex", alignItems:"center", gap: 8, marginTop: 9, paddingTop: 9, borderTop:"1px solid rgba(11,18,32,0.08)" }}>
        <span className="mono" style={{ fontSize: 9.5, color:"var(--slate-500)", fontWeight: 600, flex: 1, minWidth: 0, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{part.sku}</span>
        <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing:"0.03em", color: tone.fg, background: tone.bg, padding:"3px 8px", borderRadius: 999, flexShrink: 0 }}>{part.badge.label}</span>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// DESKTOP · optional YMMT — prompted AFTER the upload, never before
// ════════════════════════════════════════════════════════════════
function DesktopYmmtPrompt() {
  return (
    <div style={{ height:"100%", display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(11,18,32,0.55)", backdropFilter:"blur(3px)", fontFamily:"var(--font-sans)" }}>
      <div style={{ width: 560, background:"var(--paper)", borderRadius: 18, overflow:"hidden", boxShadow:"var(--shadow-3)" }}>
        <div style={{ display:"flex", gap: 16, padding:"22px 24px 18px" }}>
          <div style={{ width: 132, height: 100, borderRadius: 12, overflow:"hidden", flexShrink: 0, position:"relative", border:"1px solid var(--paper-line)" }}>
            <img src={SNAP_IMG} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
            <span style={{ position:"absolute", top: 7, left: 7, display:"inline-flex", alignItems:"center", gap: 4, padding:"3px 8px", background:"rgba(16,185,129,0.95)", borderRadius: 999, fontSize: 9.5, fontWeight: 700, color:"#fff" }}>
              <Icon name="check" size={10}/> Uploaded
            </span>
          </div>
          <div style={{ flex: 1 }}>
            <div className="eyebrow" style={{ fontSize: 9.5, color:"var(--au7o-blue)", marginBottom: 6 }}>OPTIONAL · MAKES IT ACCURATE</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing:"-0.02em", margin:"0 0 6px" }}>Which vehicle is this?</h2>
            <p style={{ fontSize: 13, color:"var(--slate-700)", lineHeight: 1.45, margin: 0 }}>
              Au7o can diagnose the photo on its own — but your year/make/model locks every part and known-issue match to your exact car.
            </p>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap: 8, padding:"0 24px 16px" }}>
          {[["YEAR","2015"],["MAKE","Dodge"],["MODEL","Challenger"],["TRIM","SRT 392"]].map(([k,v],i)=>(
            <div key={i} style={{ display:"flex", flexDirection:"column", gap: 3, padding:"10px 12px", background:"#fff", border:`1px solid ${i<3?"var(--au7o-blue)":"var(--paper-line)"}`, borderRadius: 10 }}>
              <span className="eyebrow" style={{ fontSize: 8 }}>{k}{i===3 && " ·OPT"}</span>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: i<3?"var(--ink)":"var(--slate-500)" }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap: 12, padding:"14px 24px", borderTop:"1px solid var(--paper-line)", background:"#fff" }}>
          <button style={{ background:"transparent", border:"none", fontSize: 13.5, color:"var(--slate-500)", cursor:"pointer", fontFamily:"var(--font-sans)", fontWeight: 500 }}>Skip — diagnose anyway</button>
          <button style={{ marginLeft:"auto", padding:"12px 22px", background:"var(--au7o-blue)", color:"#fff", border:"none", borderRadius: 11, fontSize: 14, fontWeight: 600, cursor:"pointer", fontFamily:"var(--font-sans)", display:"inline-flex", alignItems:"center", gap: 7, boxShadow:"0 6px 18px rgba(59,130,246,0.3)" }}>
            <Icon name="spark" size={14}/> Diagnose with vehicle
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  AU7O_DETECTIONS,
  CaptureCamera, SnapBracket,
  CaptureProcessing,
  AnnotatedDiagnosis, SnapFloatCard,
  DesktopYmmtPrompt,
});
