/* ============================================================
   Au7o handoff · _diagnose-visuals.jsx  (SHARED DEPENDENCY)
   Visual primitives reused across the diagnosis + home + features
   screens. Load this BEFORE 05 / 10 / 11.
     · HeroEngineBay / HeroBracket — mock engine-bay photo for chat
       photo bubbles and the hero product shot.
     · DiagnoseHeroPhone — condensed phone showing a 92%-match result
       (used in HomePageMerged + FeaturesPage hero).
     · ValueRow + DIAGNOSE_VALUE — the three diagnose value props.
   ============================================================ */

function DiagnoseHeroPhone({ scale = 1 }) {
  return (
    <div style={{ width: 280, transform:`scale(${scale})`, transformOrigin:"center" }}>
      {/* phone-ish framed capture + result */}
      <div style={{ borderRadius: 26, background:"#0B0E14", padding: 10, boxShadow:"var(--shadow-3)" }}>
        <div style={{ borderRadius: 18, overflow:"hidden", background:"var(--paper)" }}>
          {/* captured frame */}
          <div style={{ position:"relative", height: 132 }}>
            <HeroEngineBay/>
            <div style={{ position:"absolute", inset: 0, background:"radial-gradient(120% 80% at 60% 45%, transparent 38%, rgba(11,14,20,0.5) 100%)" }}/>
            {/* reticle on the detected part */}
            <div style={{ position:"absolute", left:"57%", top:"42%", width: 70, height: 70, transform:"translate(-50%,-50%)" }}>
              <HeroBracket pos="tl"/><HeroBracket pos="tr"/><HeroBracket pos="bl"/><HeroBracket pos="br"/>
            </div>
            <div style={{ position:"absolute", top: 8, left: 8, display:"inline-flex", alignItems:"center", gap: 5, padding:"3px 8px", background:"rgba(59,130,246,0.92)", borderRadius: 999, whiteSpace:"nowrap" }}>
              <span style={{ width: 5, height: 5, borderRadius:"50%", background:"#fff" }}/>
              <span style={{ fontSize: 8.5, fontWeight: 700, color:"#fff", letterSpacing:"0.04em" }}>ANALYZING · ENGINE BAY</span>
            </div>
          </div>
          {/* result card */}
          <div style={{ padding: 10, background:"var(--paper)" }}>
            <div style={{ background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 12, overflow:"hidden", boxShadow:"var(--shadow-1)" }}>
              <div style={{ padding:"9px 11px", borderBottom:"1px solid var(--paper-line)", display:"flex", alignItems:"center", gap: 8 }}>
                <span className="status-dot warn" style={{ width: 7, height: 7 }}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing:"-0.01em", lineHeight: 1.15 }}>Serpentine Belt — Glazed</div>
                  <div className="mono" style={{ fontSize: 7.5, color:"var(--slate-500)", marginTop: 1 }}>MATCHES 1,840 KNOWN REPORTS</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div className="mono" style={{ fontSize: 13, fontWeight: 700, color:"var(--ok)", lineHeight: 1 }}>92%</div>
                  <div style={{ fontSize: 6, color:"var(--slate-500)", letterSpacing:"0.06em", fontWeight: 600 }}>CONFIDENCE</div>
                </div>
              </div>
              <div style={{ padding:"8px 11px", display:"flex", alignItems:"center", gap: 8, background:"rgba(59,130,246,0.04)" }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background:"#fff", border:"1px solid var(--paper-line)", display:"inline-flex", alignItems:"center", justifyContent:"center", flexShrink: 0 }}>
                  <Icon name="settings" size={14} style={{ color:"var(--slate-500)" }}/>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 9.5, fontWeight: 600, lineHeight: 1.2 }}>Gates Micro-V Belt</div>
                  <div className="mono" style={{ fontSize: 7.5, color:"var(--slate-500)" }}>K060841 · FITS YOUR 6.4L</div>
                </div>
                <div className="mono" style={{ fontSize: 11, fontWeight: 700 }}>$48</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroBracket({ pos }) {
  const base = { position:"absolute", width: 14, height: 14, borderColor:"#fff", borderStyle:"solid", borderWidth: 0, opacity: 0.92 };
  const map = {
    tl:{ top:0,left:0,borderTopWidth:2,borderLeftWidth:2,borderTopLeftRadius:4 },
    tr:{ top:0,right:0,borderTopWidth:2,borderRightWidth:2,borderTopRightRadius:4 },
    bl:{ bottom:0,left:0,borderBottomWidth:2,borderLeftWidth:2,borderBottomLeftRadius:4 },
    br:{ bottom:0,right:0,borderBottomWidth:2,borderRightWidth:2,borderBottomRightRadius:4 },
  };
  return <span style={{ ...base, ...map[pos] }}/>;
}

function HeroEngineBay() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 280 132" preserveAspectRatio="xMidYMid slice" style={{ display:"block" }}>
      <defs><linearGradient id="hbay" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#2a3142"/><stop offset="1" stopColor="#11151f"/>
      </linearGradient></defs>
      <rect width="280" height="132" fill="url(#hbay)"/>
      <rect x="30" y="40" width="230" height="80" rx="10" fill="#1f2735" stroke="#33405a" strokeWidth="1.5"/>
      <rect x="46" y="54" width="180" height="10" rx="3" fill="#28323f"/>
      <rect x="46" y="72" width="180" height="10" rx="3" fill="#28323f"/>
      <rect x="46" y="90" width="130" height="10" rx="3" fill="#28323f"/>
      <circle cx="186" cy="62" r="30" fill="#10151e" stroke="#3a4863" strokeWidth="2"/>
      <circle cx="186" cy="62" r="16" fill="#181f2b" stroke="#2c3850" strokeWidth="1.5"/>
      <circle cx="186" cy="62" r="5" fill="#0b0e14"/>
      <path d="M156 62 Q120 38 96 62 Q120 86 156 62" fill="none" stroke="#0d1119" strokeWidth="6"/>
    </svg>
  );
}

// ─── Reusable value props ────────────────────────────────────────
const DIAGNOSE_VALUE = [
  { icon:"camera", title:"Photo & video diagnosis", body:"Point your camera at the problem — a leak, a worn tread, a strange part. Even record the noise it makes." },
  { icon:"search", title:"Matched to 4,200+ known issues", body:"Au7o cross-references what it sees against thousands of documented problems for your exact trim." },
  { icon:"settings", title:"Finds the exact part", body:"Get the right part number that fits your vehicle, the fix, and what it should cost — instantly." },
];

function ValueRow({ item, accent = "var(--au7o-blue)" }) {
  return (
    <div style={{ display:"flex", gap: 13, alignItems:"flex-start" }}>
      <span style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background:"var(--au7o-blue-50)", display:"inline-flex", alignItems:"center", justifyContent:"center", color: accent }}>
        <Icon name={item.icon} size={17}/>
      </span>
      <div>
        <div style={{ fontSize: 14.5, fontWeight: 600, letterSpacing:"-0.01em", color:"var(--ink)" }}>{item.title}</div>
        <div style={{ fontSize: 13, color:"var(--slate-700)", lineHeight: 1.45, marginTop: 2 }}>{item.body}</div>
      </div>
    </div>
  );
}

Object.assign(window, { HeroEngineBay, HeroBracket, DiagnoseHeroPhone, ValueRow, DIAGNOSE_VALUE });
