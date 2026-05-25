/* Au7o Drive — A2-style web view (conversation-first, paper palette).
   Matches the Mobile A2 hub vocabulary: Au7o speaks first, then a rich
   map attachment, then car-aware notes inline as conversational beats.
*/

function DriveA2Web({ vehicle = WEB_VEHICLE }) {
  return (
    <div style={{ position:"relative", height:"100%", background:"var(--paper)", display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <AmbientBackground/>

      {/* Top bar — same DNA as A2 web */}
      <div style={{
        height: 56, padding:"0 24px",
        display:"flex", alignItems:"center", justifyContent:"space-between",
        borderBottom:"1px solid var(--paper-line)",
        background:"rgba(255,255,255,0.7)", backdropFilter:"blur(20px) saturate(140%)",
        position:"relative", zIndex: 5,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap: 12 }}>
          <Au7oMark size={22}/>
          <span style={{ color:"var(--slate-300)" }}>·</span>
          <span className="eyebrow">Drive</span>
          <span style={{ color:"var(--slate-300)" }}>·</span>
          <span style={{ fontSize: 13, color:"var(--slate-700)" }}>Trip planning, car-aware</span>
        </div>
        <div style={{ display:"flex", gap: 8 }}>
          <button className="chip chip-sm"><Icon name="chat" size={12}/> Ask</button>
          <button className="chip chip-sm"><Icon name="alert" size={12}/> Known issues</button>
        </div>
      </div>

      {/* Two-column scroll: conversation left, sticky map right */}
      <div style={{ flex: 1, display:"grid", gridTemplateColumns:"minmax(0, 1fr) 520px", overflow:"hidden", position:"relative", zIndex: 1 }}>
        {/* Conversation column */}
        <div className="web-scroll" style={{ overflowY:"auto", padding:"40px 56px 64px" }}>
          {/* Greeting */}
          <div style={{ display:"flex", alignItems:"center", gap: 10, marginBottom: 14 }}>
            <span className="au7o-pulse-soft" style={{ width: 8, height: 8, borderRadius:"50%", background:"var(--au7o-blue)" }}/>
            <span className="eyebrow" style={{ color:"var(--au7o-blue)" }}>DRIVE · YOUR CHALLENGER</span>
          </div>
          <h1 style={{ fontSize: 38, fontWeight: 600, letterSpacing:"-0.03em", lineHeight: 1.1, textWrap:"pretty", maxWidth: 620 }}>
            Where do you want to go this Saturday?
          </h1>
          <p style={{ fontSize: 15, color:"var(--slate-700)", marginTop: 12, lineHeight: 1.55, maxWidth: 560 }}>
            Tell me in your own words. I'll route around your fuel range, oil life, and any parts shops on the way.
          </p>

          <div style={{ display:"flex", flexWrap:"wrap", gap: 8, marginTop: 16 }}>
            {[
              { icon:"map", text:"Plan a weekend trip to Big Sur" },
              { icon:"coffee", text:"Coffee detour on my commute" },
              { icon:"spark", text:"Find a parts run with my route" },
              { icon:"fuel", text:"Cheapest premium near me" },
            ].map((s,i) => (
              <button key={i} className="chip">
                <Icon name={s.icon} size={13} style={{ color:"var(--slate-500)" }}/>
                {s.text}
              </button>
            ))}
          </div>

          {/* User bubble */}
          <div style={{ display:"flex", justifyContent:"flex-end", marginTop: 32 }}>
            <div className="bubble-user">Take me to Healdsburg with a coffee stop on the way</div>
          </div>

          {/* Au7o reply */}
          <div style={{ display:"flex", gap: 14, alignItems:"flex-start", marginTop: 18 }}>
            <img src="brand/au7o-mascot.png" alt="" style={{ width: 32, height: 32, marginTop: 2 }}/>
            <div style={{ flex: 1, display:"flex", flexDirection:"column", gap: 12, maxWidth: 620 }}>
              <div className="bubble-au7o">
                Plotted a <b>112 mi</b> route via the 101 with a stop at <b>Equator Coffee</b> in Mill Valley — about 28 minutes in. Whole trip is <b>2h 40m</b> with traffic.
              </div>

              {/* Car-aware notes attachment */}
              <div style={{ background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 16, overflow:"hidden", boxShadow:"var(--shadow-1)" }}>
                <div style={{ padding:"10px 14px", borderBottom:"1px solid var(--paper-line)", display:"flex", alignItems:"center", gap: 8 }}>
                  <Icon name="car" size={13} style={{ color:"var(--slate-500)" }}/>
                  <span style={{ fontSize: 12.5, fontWeight: 600 }}>Car-aware notes</span>
                  <span style={{ fontSize: 10.5, color:"var(--slate-500)" }}>· scoped to your Challenger</span>
                </div>
                {[
                  { icon:"fuel", tone:"slate", body: <>Premium along this route averages <span className="mono" style={{ fontWeight: 600 }}>$5.42/gal</span>. Fill at home for ~$8 savings.</> },
                  { icon:"alert", tone:"warn", body: <>You're at <span className="mono" style={{ fontWeight: 600 }}>82%</span> oil life — trip won't push you over, but plan an oil change in the next <span className="mono" style={{ fontWeight: 600 }}>1,200 mi</span>.</> },
                  { icon:"spark", tone:"ok", body: <>NAPA on River Road has your <b>OEM radiator</b> in stock. Add as a stop?</> },
                ].map((n,i,a) => (
                  <div key={i} style={{ padding:"12px 14px", display:"flex", gap: 10, fontSize: 13, lineHeight: 1.5,
                    borderBottom: i < a.length-1 ? "1px solid var(--paper-line)" : "none" }}>
                    <Icon name={n.icon} size={14} style={{ marginTop: 2,
                      color: n.tone === "warn" ? "var(--warn)" : n.tone === "ok" ? "var(--ok)" : "var(--slate-500)" }}/>
                    <div style={{ flex: 1 }}>{n.body}</div>
                  </div>
                ))}
              </div>

              <div className="bubble-au7o">
                Want me to add the <b>NAPA</b> stop? It's a 6-minute detour — and it'd save you a separate trip later this month.
              </div>
              <div style={{ display:"flex", gap: 8 }}>
                <button className="btn-outline" style={{ padding:"8px 12px", fontSize: 13 }}>Yes, add NAPA</button>
                <button className="chip chip-sm">Skip — keep it simple</button>
                <button className="chip chip-sm"><Icon name="search" size={12}/> Compare other shops</button>
              </div>
            </div>
          </div>

          {/* Suggested follow-ups (mirrors mobile A2 hub) */}
          <div style={{ marginTop: 36 }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>WHILE YOU'RE PLANNING</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: 8 }}>
              {[
                { icon:"alert", text:"What recalls apply to my Challenger?", tone:"crit" },
                { icon:"wrench", text:"Plan my next oil change" },
                { icon:"search", text:"Why does my steering feel loose?" },
                { icon:"coffee", text:"Best espresso in Healdsburg" },
              ].map((s,i) => (
                <button key={i} style={{
                  display:"flex", alignItems:"center", gap: 10,
                  padding:"12px 14px", background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 14,
                  fontFamily:"var(--font-sans)", fontSize: 13.5, color:"var(--ink)", textAlign:"left", cursor:"pointer",
                }}>
                  <Icon name={s.icon} size={14} style={{ color: s.tone === "crit" ? "var(--crit)" : "var(--slate-500)" }}/>
                  <span style={{ flex: 1 }}>{s.text}</span>
                  <Icon name="chevron" size={11} style={{ color:"var(--slate-400)" }}/>
                </button>
              ))}
            </div>
          </div>

          {/* Composer */}
          <div style={{ position:"sticky", bottom: 24, marginTop: 36, zIndex: 6 }}>
            <div style={{
              background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 18,
              boxShadow:"var(--shadow-2)", padding:"10px 10px 10px 18px",
              display:"flex", alignItems:"center", gap: 10,
            }}>
              <Icon name="chat" size={16} style={{ color:"var(--slate-400)" }}/>
              <span style={{ flex: 1, fontSize: 14.5, color:"var(--slate-400)" }}>Ask Au7o anything…</span>
              <button style={{ width: 36, height: 36, borderRadius:"50%", background:"var(--paper-2)", border:"none", display:"inline-flex", alignItems:"center", justifyContent:"center", color:"var(--slate-500)", cursor:"pointer" }}>
                <Icon name="mic" size={15}/>
              </button>
              <button style={{ width: 36, height: 36, borderRadius:"50%", background:"var(--ink)", border:"none", display:"inline-flex", alignItems:"center", justifyContent:"center", color:"#fff", cursor:"pointer" }}>
                <Icon name="send" size={14}/>
              </button>
            </div>
          </div>
        </div>

        {/* Sticky map column */}
        <aside style={{ borderLeft:"1px solid var(--paper-line)", background:"#F2EEE3", position:"relative", overflow:"hidden" }}>
          <DriveA2WebMap/>

          {/* Floating route summary card */}
          <div style={{ position:"absolute", top: 22, left: 22, right: 22,
            background:"rgba(255,255,255,0.95)", backdropFilter:"blur(20px)",
            border:"1px solid var(--paper-line)", borderRadius: 16, padding:"14px 16px",
            boxShadow:"var(--shadow-2)" }}>
            <div className="eyebrow">SATURDAY ROUTE</div>
            <div style={{ fontSize: 18, fontWeight: 600, letterSpacing:"-0.02em", marginTop: 4 }}>Healdsburg loop</div>
            <div style={{ display:"flex", gap: 14, marginTop: 8, fontSize: 12, color:"var(--slate-500)" }}>
              <span><span className="mono" style={{ color:"var(--ink)", fontWeight: 600 }}>112</span> mi</span>
              <span><span className="mono" style={{ color:"var(--ink)", fontWeight: 600 }}>2h 40m</span></span>
              <span><span className="mono" style={{ color:"var(--ink)", fontWeight: 600 }}>1</span> stop</span>
              <span style={{ marginLeft:"auto", color:"var(--ok)", fontWeight: 600 }}>● On time</span>
            </div>
          </div>

          {/* Floating stops list */}
          <div style={{ position:"absolute", left: 22, right: 22, bottom: 22,
            background:"rgba(255,255,255,0.95)", backdropFilter:"blur(20px)",
            border:"1px solid var(--paper-line)", borderRadius: 16, overflow:"hidden",
            boxShadow:"var(--shadow-2)" }}>
            {[
              { icon:"pin", label:"Home", sub:"San Francisco, CA", time:"9:30 AM", active: true },
              { icon:"coffee", label:"Equator Coffee", sub:"Mill Valley · 28 min in", time:"10:00 AM" },
              { icon:"pin", label:"Healdsburg", sub:"Destination", time:"12:10 PM" },
            ].map((s,i,a) => (
              <div key={i} style={{ padding:"12px 14px", display:"flex", gap: 12, alignItems:"center",
                borderBottom: i < a.length-1 ? "1px solid var(--paper-line)" : "none" }}>
                <div style={{ width: 30, height: 30, borderRadius: 9,
                  background: s.active ? "var(--ink)" : "var(--paper-2)",
                  border: s.active ? "none" : "1px solid var(--paper-line)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  color: s.active ? "#fff" : "var(--slate-500)" }}>
                  <Icon name={s.icon} size={14}/>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{s.label}</div>
                  <div style={{ fontSize: 11, color:"var(--slate-500)" }}>{s.sub}</div>
                </div>
                <span className="mono" style={{ fontSize: 11, color:"var(--slate-500)" }}>{s.time}</span>
              </div>
            ))}
            <button style={{
              width:"100%", background:"var(--au7o-blue)", color:"#fff", border:"none",
              padding: 12, fontFamily:"var(--font-sans)", fontWeight: 600, fontSize: 13.5, cursor:"pointer",
              display:"inline-flex", alignItems:"center", justifyContent:"center", gap: 6,
            }}>
              Start drive <Icon name="chevron" size={13}/>
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function DriveA2WebMap() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 520 900" preserveAspectRatio="xMidYMid slice" style={{ display:"block" }}>
      <rect width="520" height="900" fill="#F2EEE3"/>
      {/* water inlets */}
      <path d="M-20 280 C 100 260 200 320 320 300 C 420 280 500 320 540 300 L 540 360 C 500 380 420 340 320 360 C 200 380 100 320 -20 340 Z" fill="#C9DCE6" opacity="0.55"/>
      <path d="M-20 700 C 60 720 160 680 240 700 L 240 760 C 160 740 60 770 -20 750 Z" fill="#C9DCE6" opacity="0.4"/>
      {/* parks */}
      <rect x="40" y="60" width="120" height="100" rx="8" fill="#D5E2C9"/>
      <rect x="320" y="540" width="160" height="120" rx="8" fill="#D5E2C9"/>
      <rect x="60" y="820" width="100" height="60" rx="6" fill="#D5E2C9"/>
      {/* blocks */}
      {[[180,80,60,60],[260,80,60,60],[340,80,80,60],[440,60,60,80],[60,200,80,60],[160,200,70,60],[260,220,80,60],[360,200,60,80],[440,200,60,60],[60,400,70,80],[160,400,80,60],[260,420,60,60],[340,400,80,80],[440,400,60,60],[60,520,70,60],[160,520,80,60],[260,640,60,60],[340,720,60,60],[420,700,80,60],[60,640,80,60],[160,720,70,60],[420,820,60,60]].map((b,i) => (
        <rect key={i} x={b[0]} y={b[1]} width={b[2]} height={b[3]} rx="4" fill="#E8E2D2"/>
      ))}
      {/* roads */}
      <path d="M0 380 L520 360" stroke="#fff" strokeWidth="8"/>
      <path d="M0 580 L520 560" stroke="#fff" strokeWidth="6"/>
      <path d="M0 280 L520 260" stroke="#fff" strokeWidth="5"/>
      <path d="M120 0 L140 900" stroke="#fff" strokeWidth="6"/>
      <path d="M380 0 L400 900" stroke="#fff" strokeWidth="6"/>
      {/* route */}
      <path d="M 100 800 C 180 740 220 660 280 600 S 320 460 360 380 S 380 240 320 160 S 280 100 260 60"
            stroke="#fff" strokeWidth="14" fill="none" strokeLinecap="round"/>
      <path d="M 100 800 C 180 740 220 660 280 600 S 320 460 360 380 S 380 240 320 160 S 280 100 260 60"
            stroke="var(--au7o-blue)" strokeWidth="6" fill="none" strokeLinecap="round"/>
      {/* origin */}
      <g transform="translate(100,800)">
        <circle r="22" fill="var(--au7o-blue)" opacity="0.18">
          <animate attributeName="r" from="14" to="40" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="opacity" from="0.4" to="0" dur="2s" repeatCount="indefinite"/>
        </circle>
        <circle r="14" fill="#fff"/><circle r="8" fill="var(--au7o-blue)"/>
      </g>
      {/* coffee */}
      <g transform="translate(330,420)">
        <circle r="18" fill="#fff" stroke="var(--paper-line)" strokeWidth="2"/>
        <text y="6" textAnchor="middle" fontSize="16">☕</text>
      </g>
      {/* dest */}
      <g transform="translate(260,60)">
        <circle r="18" fill="var(--ink)"/>
        <circle r="6" fill="#fff"/>
      </g>
    </svg>
  );
}

// ════════════════════════════════════════════════════════════════
// MOBILE — KNOWN ISSUES INDEX (the landing, no vehicle yet)
// Symptom-first hero. Mirrors web KIRevisedIndex.
// ════════════════════════════════════════════════════════════════
function MobileKIIndex() {
  const [mode, setMode] = React.useState("symptom"); // symptom · code · car
  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", background:"var(--paper)", overflow:"hidden", position:"relative" }}>
      {/* Header */}
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"6px 16px 10px", gap: 10, background:"var(--paper)",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap: 8 }}>
          <Au7oMark size={18} color="var(--ink)"/>
          <span style={{ fontSize: 14, fontWeight: 600, letterSpacing:"-0.01em" }}>Known Issues</span>
        </div>
        <button style={{ width: 32, height: 32, borderRadius:"50%", background:"#fff", border:"1px solid var(--paper-line)", display:"inline-flex", alignItems:"center", justifyContent:"center", color:"var(--slate-500)" }}>
          <Icon name="search" size={14}/>
        </button>
      </div>

      <div style={{ flex: 1, overflow:"auto", padding:"4px 16px 130px" }}>
        {/* Hero */}
        <div style={{ marginTop: 14 }}>
          <div className="eyebrow" style={{ color:"var(--au7o-blue)", fontSize: 10 }}>OWNER-SOURCED · 2.4M REPORTS</div>
          <h1 style={{ fontSize: 26, fontWeight: 600, letterSpacing:"-0.025em", lineHeight: 1.1, marginTop: 8, textWrap:"pretty" }}>
            Describe what's wrong<br/>
            <span style={{ color:"var(--slate-500)" }}>get a real diagnosis.</span>
          </h1>
          <p style={{ fontSize: 12.5, color:"var(--slate-700)", marginTop: 10, lineHeight: 1.55 }}>
            Au7o cross-references your symptoms against documented failures, recalls, and TSBs — anchored to local repair costs.
          </p>
        </div>

        {/* Mode tabs */}
        <div style={{ marginTop: 18, display:"flex", gap: 6, padding: 4, background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 12 }}>
          {[
            { id:"symptom", icon:"chat", label:"Symptom" },
            { id:"code", icon:"alert", label:"Code" },
            { id:"car", icon:"car", label:"By car" },
          ].map(t => (
            <button key={t.id} onClick={() => setMode(t.id)} style={{
              flex: 1, display:"inline-flex", alignItems:"center", justifyContent:"center", gap: 5,
              padding:"8px 6px",
              background: mode === t.id ? "var(--ink)" : "transparent",
              color: mode === t.id ? "#fff" : "var(--slate-700)",
              border:"none", borderRadius: 8,
              fontFamily:"var(--font-sans)", fontSize: 11.5, fontWeight: 600,
            }}>
              <Icon name={t.icon} size={11}/>
              {t.label}
            </button>
          ))}
        </div>

        {/* Search field */}
        <div style={{ marginTop: 12, background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 14, padding:"14px 14px 12px" }}>
          {mode === "symptom" && (
            <>
              <div style={{ display:"flex", alignItems:"flex-start", gap: 10 }}>
                <span style={{ width: 22, height: 22, borderRadius: 6, background:"var(--paper-2)", display:"inline-flex", alignItems:"center", justifyContent:"center", flexShrink: 0, marginTop: 2 }}>
                  <Icon name="chat" size={11} style={{ color:"var(--slate-500)" }}/>
                </span>
                <div style={{ flex: 1, fontSize: 13.5, lineHeight: 1.45, color:"var(--ink)", minHeight: 56 }}>
                  Steering pulls hard right when I brake from highway speeds…
                  <span className="au7o-pulse-soft" style={{ display:"inline-block", width: 1.5, height: 14, background:"var(--ink)", marginLeft: 2, verticalAlign:"middle" }}/>
                </div>
              </div>
              <div style={{ display:"flex", flexWrap:"wrap", gap: 6, marginTop: 10, paddingTop: 10, borderTop:"1px solid var(--paper-line)" }}>
                {["Squeals at low speed", "Coolant smell", "Shudders 40-50 mph", "Won't crank when hot"].map((s,i) => (
                  <button key={i} style={{
                    padding:"5px 10px", background:"var(--paper-2)", border:"1px solid var(--paper-line)",
                    borderRadius: 999, fontSize: 11, fontWeight: 500, color:"var(--slate-700)",
                  }}>{s}</button>
                ))}
              </div>
            </>
          )}
          {mode === "code" && (
            <div style={{ display:"flex", alignItems:"center", gap: 10 }}>
              <Icon name="alert" size={14} style={{ color:"var(--slate-500)" }}/>
              <input className="mono" style={{ flex: 1, border:"none", outline:"none", fontSize: 14, fontWeight: 600, letterSpacing:"0.05em", background:"transparent" }} placeholder="P0420  ·  U0100  ·  C1201"/>
              <button style={{ padding:"6px 12px", background:"var(--ink)", color:"#fff", border:"none", borderRadius: 8, fontSize: 11.5, fontWeight: 600 }}>Decode</button>
            </div>
          )}
          {mode === "car" && (
            <div style={{ display:"flex", alignItems:"center", gap: 10 }}>
              <Icon name="car" size={14} style={{ color:"var(--slate-500)" }}/>
              <input style={{ flex: 1, border:"none", outline:"none", fontSize: 13.5, background:"transparent" }} placeholder="2018 Honda Civic"/>
            </div>
          )}
        </div>

        {/* Trending issues */}
        <div style={{ marginTop: 22 }}>
          <div className="eyebrow" style={{ marginBottom: 10, fontSize: 10 }}>TRENDING THIS WEEK</div>
          <div style={{ display:"flex", flexDirection:"column", gap: 8 }}>
            {[
              { make:"BMW N20", problem:"Timing chain guides", cost:"$2.4k–$5.8k", reports:"+38%", crit: true },
              { make:"Honda CR-V", problem:"Oil dilution (1.5T)", cost:"$0–$200", reports:"+22%" },
              { make:"Ford F-150", problem:"Cam phaser rattle", cost:"$1.2k–$3.1k", reports:"+18%" },
              { make:"Tesla Model 3", problem:"HV battery contactor", cost:"Recall — $0", recall: true },
            ].map((t,i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap: 10, padding:"11px 12px", background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 12 }}>
                <span className={`status-dot ${t.crit ? "crit" : t.recall ? "warn" : "ok"}`}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600 }}>
                    {t.make} <span style={{ color:"var(--slate-500)", fontWeight: 400 }}>· {t.problem}</span>
                  </div>
                  <div className="mono" style={{ fontSize: 10, color:"var(--slate-500)", marginTop: 2 }}>{t.cost} · {t.reports} reports</div>
                </div>
                <Icon name="chevron" size={11} style={{ color:"var(--slate-400)" }}/>
              </div>
            ))}
          </div>
        </div>

        {/* Browse by make — secondary */}
        <div style={{ marginTop: 22 }}>
          <div className="eyebrow" style={{ marginBottom: 10, fontSize: 10 }}>OR BROWSE BY MAKE</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap: 8 }}>
            {["BMW","Honda","Ford","Toyota","Tesla","Subaru","Audi","More"].map((m,i) => (
              <button key={i} style={{
                padding:"14px 6px", background:"#fff", border:"1px solid var(--paper-line)",
                borderRadius: 10, fontSize: 11.5, fontWeight: 600, color:"var(--ink)",
              }}>{m}</button>
            ))}
          </div>
        </div>
      </div>

      <MobileBottomDock active="garage"/>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// MOBILE — KNOWN ISSUES MAKE DETAIL (BMW page, models in cost rows)
// Mirrors web KIRevisedBMWPage. Personal-context CTA on top.
// ════════════════════════════════════════════════════════════════
function MobileKIMake() {
  const models = [
    { name:"3 Series · F30 (N20)", years:"2012–2015", cost:"$2.4k–$5.8k median", issues: 4, severity:"crit", topIssue:"Timing chain guides" },
    { name:"5 Series · F10 (N63)", years:"2011–2016", cost:"$3.1k–$8.4k median", issues: 6, severity:"crit", topIssue:"Valve stem seals · oil consumption" },
    { name:"X5 · F15", years:"2014–2018", cost:"$1.8k–$4.2k median", issues: 3, severity:"warn", topIssue:"Coolant transfer pipe" },
    { name:"3 Series · E90 (N52)", years:"2006–2011", cost:"$900–$2.6k median", issues: 5, severity:"warn", topIssue:"VANOS solenoid + valve cover" },
    { name:"M3 · F80 (S55)", years:"2014–2018", cost:"$1.2k–$3.4k median", issues: 2, severity:"ok", topIssue:"Crankhub slip (track use)" },
  ];

  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", background:"var(--paper)", overflow:"hidden", position:"relative" }}>
      {/* Header — back + crumb */}
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"6px 16px 10px", gap: 10, background:"var(--paper)",
      }}>
        <button style={{ display:"flex", alignItems:"center", gap: 6, padding:"6px 10px 6px 6px", background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 999, fontSize: 11.5, fontWeight: 500, color:"var(--ink)" }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Known Issues
        </button>
        <button style={{ width: 32, height: 32, borderRadius:"50%", background:"#fff", border:"1px solid var(--paper-line)", display:"inline-flex", alignItems:"center", justifyContent:"center", color:"var(--slate-500)" }}>
          <Icon name="search" size={14}/>
        </button>
      </div>

      <div style={{ flex: 1, overflow:"auto", padding:"4px 16px 130px" }}>
        {/* Title */}
        <div style={{ marginTop: 8 }}>
          <div className="mono" style={{ fontSize: 10, color:"var(--slate-500)", letterSpacing:"0.06em", textTransform:"uppercase", fontWeight: 700 }}>BMW · Known Issues</div>
          <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing:"-0.025em", lineHeight: 1.05, marginTop: 6 }}>BMW</h1>
          <div style={{ display:"flex", gap: 14, marginTop: 10, fontSize: 11.5, color:"var(--slate-500)" }}>
            <span><b style={{ color:"var(--ink)" }}>62</b> documented issues</span>
            <span><b style={{ color:"var(--ink)" }}>14</b> active recalls</span>
            <span><b style={{ color:"var(--ink)" }}>980k</b> reports</span>
          </div>
        </div>

        {/* Personal-context CTA */}
        <div style={{
          marginTop: 14,
          background:"linear-gradient(180deg, rgba(59,130,246,0.08), rgba(59,130,246,0.02))",
          border:"1px solid rgba(59,130,246,0.22)",
          borderRadius: 14, padding:"12px 14px",
          display:"flex", alignItems:"center", gap: 10,
        }}>
          <span style={{ width: 30, height: 30, borderRadius: 8, background:"var(--au7o-blue)",
            display:"inline-flex", alignItems:"center", justifyContent:"center", flexShrink: 0 }}>
            <Au7oMark size={16} color="#fff"/>
          </span>
          <div style={{ flex: 1, minWidth: 0, fontSize: 12, lineHeight: 1.4 }}>
            <div style={{ fontWeight: 600, color:"var(--ink)" }}>See issues for your car only</div>
            <div style={{ color:"var(--slate-700)", marginTop: 1 }}>Add a vehicle for filtered results + local cost.</div>
          </div>
          <button style={{ padding:"7px 12px", background:"var(--ink)", color:"#fff", border:"none", borderRadius: 8, fontSize: 11.5, fontWeight: 600, flexShrink: 0 }}>Add</button>
        </div>

        {/* Filter chips */}
        <div style={{ marginTop: 14, display:"flex", gap: 6, overflowX:"auto", paddingBottom: 4 }}>
          {[
            { label:"All models", active: true },
            { label:"With recalls" },
            { label:"Engine" },
            { label:"Electrical" },
            { label:"Drivetrain" },
          ].map((t,i) => (
            <button key={i} style={{
              flexShrink: 0, padding:"6px 12px",
              background: t.active ? "var(--ink)" : "#fff",
              color: t.active ? "#fff" : "var(--slate-700)",
              border:"1px solid " + (t.active ? "var(--ink)" : "var(--paper-line)"),
              borderRadius: 999, fontSize: 11.5, fontWeight: 500,
            }}>{t.label}</button>
          ))}
        </div>

        {/* Anchored cost panel */}
        <div style={{ marginTop: 14, background:"var(--ink)", color:"#fff", borderRadius: 14, padding:"14px 16px" }}>
          <div className="eyebrow" style={{ color:"rgba(255,255,255,0.5)", fontSize: 9 }}>BMW · MEDIAN REPAIR COST</div>
          <div style={{ display:"flex", alignItems:"baseline", gap: 10, marginTop: 6 }}>
            <span className="mono" style={{ fontSize: 28, fontWeight: 700, letterSpacing:"-0.02em" }}>$2,180</span>
            <span style={{ fontSize: 11, color:"rgba(255,255,255,0.55)" }}>across active issues</span>
          </div>
          <div style={{ marginTop: 8, fontSize: 11, color:"rgba(255,255,255,0.7)", lineHeight: 1.4 }}>
            Anchored to <b style={{ color:"#fff" }}>4 shops near 94703</b> · indie + dealer parts. Tap a model for the breakdown.
          </div>
        </div>

        {/* Models list */}
        <div style={{ marginTop: 14, display:"flex", flexDirection:"column", gap: 10 }}>
          {models.map((m,i) => (
            <button key={i} style={{
              textAlign:"left",
              background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 14,
              padding:"12px 14px", display:"flex", alignItems:"center", gap: 12,
            }}>
              <span className={`status-dot ${m.severity}`} style={{ flexShrink: 0 }}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display:"flex", alignItems:"center", gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, letterSpacing:"-0.01em" }}>{m.name}</span>
                </div>
                <div className="mono" style={{ fontSize: 10.5, color:"var(--slate-500)", marginTop: 2 }}>{m.years} · {m.issues} issues</div>
                <div style={{ fontSize: 11.5, color:"var(--slate-700)", marginTop: 4 }}>
                  <b style={{ color:"var(--ink)" }}>Top:</b> {m.topIssue}
                </div>
                <div className="mono" style={{ fontSize: 11, fontWeight: 700, color:"var(--ink)", marginTop: 4 }}>{m.cost}</div>
              </div>
              <Icon name="chevron" size={12} style={{ color:"var(--slate-400)" }}/>
            </button>
          ))}
        </div>
      </div>

      <MobileBottomDock active="garage"/>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// MOBILE — KNOWN ISSUES (matches A2 hub mobile vocabulary)
// ════════════════════════════════════════════════════════════════
function MobileKnownIssues() {
  const issues = [
    { name:"Driveshaft U-Joint", cost:"$300–$2,500", priority:"crit", common:"~14% at 60k+ miles", days:"1–2 days" },
    { name:"EPS Rack Failure", cost:"$1,200–$2,800", priority:"crit", common:"Recall S19 — free", recall: true, days:"½ day" },
    { name:"OEM Radiator", cost:"$200–$800", priority:"warn", common:"~6% at this mileage", days:"3–4 hrs" },
    { name:"ZF 8-Speed Harsh Shifting", cost:"$820–$2,500", priority:"warn", common:"~5% — TSB issued", days:"1 day" },
  ];

  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", background:"var(--paper)", overflow:"hidden", position:"relative" }}>
      {/* Header — matches A2 mobile */}
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"6px 16px 10px", gap: 10, background:"var(--paper)",
      }}>
        <button style={{ display:"flex", alignItems:"center", gap: 8, padding:"6px 12px 6px 6px", background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 999 }}>
          <span style={{ width: 26, height: 26, borderRadius:"50%", background:"var(--ink)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize: 11, fontWeight: 700 }}>C</span>
          <div style={{ textAlign:"left", lineHeight: 1.1 }}>
            <div style={{ fontSize: 11.5, fontWeight: 600 }}>Challenger</div>
            <div className="mono" style={{ fontSize: 9.5, color:"var(--slate-500)" }}>2015 · 64,218 mi</div>
          </div>
          <Icon name="chevron-down" size={11} style={{ color:"var(--slate-400)", marginLeft: 4 }}/>
        </button>
        <div style={{ display:"flex", gap: 8 }}>
          <button style={{ width: 32, height: 32, borderRadius:"50%", background:"#fff", border:"1px solid var(--paper-line)", display:"inline-flex", alignItems:"center", justifyContent:"center", color:"var(--slate-500)" }}>
            <Icon name="search" size={14}/>
          </button>
          <button style={{ width: 32, height: 32, borderRadius:"50%", background:"var(--ink)", border:"none", display:"inline-flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize: 11, fontWeight: 700 }}>R</button>
        </div>
      </div>

      <div style={{ flex: 1, overflow:"auto", padding:"4px 16px 130px" }}>
        {/* Eyebrow + title */}
        <div style={{ marginTop: 10 }}>
          <div style={{ display:"flex", alignItems:"center", gap: 8, marginBottom: 8 }}>
            <span className="au7o-pulse-soft" style={{ width: 6, height: 6, borderRadius:"50%", background:"var(--au7o-blue)" }}/>
            <span className="eyebrow" style={{ color:"var(--au7o-blue)", fontSize: 10 }}>KNOWN ISSUES · YOUR CHALLENGER</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing:"-0.02em", lineHeight: 1.2, textWrap:"pretty" }}>
            What's commonly going wrong<br/>
            <span style={{ color:"var(--slate-500)" }}>at 64k miles?</span>
          </h1>
          <p style={{ fontSize: 12.5, color:"var(--slate-700)", marginTop: 8, lineHeight: 1.5 }}>
            <b>4 documented issues</b> for your trim, sourced from NHTSA + 880 owner reports. Two are safety-critical.
          </p>
        </div>

        {/* Search/filter chips — symptom · code · all */}
        <div style={{ marginTop: 14, display:"flex", gap: 6, overflowX:"auto", paddingBottom: 4 }}>
          {[
            { icon:"chat", label:"By symptom" },
            { icon:"alert", label:"By error code" },
            { icon:"list", label:"All 4 issues", active: true },
          ].map((t,i) => (
            <button key={i} style={{
              flexShrink: 0, display:"inline-flex", alignItems:"center", gap: 6,
              padding:"6px 12px",
              background: t.active ? "var(--ink)" : "#fff",
              color: t.active ? "#fff" : "var(--ink)",
              border: "1px solid " + (t.active ? "var(--ink)" : "var(--paper-line)"),
              borderRadius: 999, fontFamily:"var(--font-sans)", fontSize: 12, fontWeight: 500,
            }}>
              <Icon name={t.icon} size={11}/>
              {t.label}
            </button>
          ))}
        </div>

        {/* Issue cards — cost-led, collapsed (matches A2 attachment style) */}
        <div style={{ marginTop: 14, display:"flex", flexDirection:"column", gap: 10 }}>
          {issues.map((iss,i) => (
            <div key={i} style={{
              background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 14,
              overflow:"hidden", boxShadow:"var(--shadow-1)",
            }}>
              {/* header row */}
              <div style={{ padding:"12px 14px 10px", display:"flex", alignItems:"flex-start", gap: 10 }}>
                <span className={`status-dot ${iss.priority}`} style={{ marginTop: 5 }}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap: 6, flexWrap:"wrap" }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600, letterSpacing:"-0.01em" }}>{iss.name}</span>
                    {iss.recall && (
                      <span style={{ fontSize: 9.5, fontWeight: 700, padding:"2px 6px", borderRadius: 4, background:"var(--crit-bg)", color:"#991B1B", letterSpacing:"0.04em" }}>RECALL</span>
                    )}
                  </div>
                  <div className="mono" style={{ fontSize: 10.5, color:"var(--slate-500)", marginTop: 2 }}>
                    {iss.common}
                  </div>
                </div>
              </div>
              {/* cost row */}
              <div style={{ padding:"8px 14px 12px", borderTop:"1px solid var(--paper-line)",
                display:"flex", alignItems:"center", gap: 14, background:"var(--paper-2)" }}>
                <div>
                  <div className="eyebrow" style={{ fontSize: 9 }}>FIX RANGE</div>
                  <div className="mono" style={{ fontSize: 13, fontWeight: 700, color:"var(--ink)", marginTop: 1 }}>{iss.cost}</div>
                </div>
                <div>
                  <div className="eyebrow" style={{ fontSize: 9 }}>SHOP TIME</div>
                  <div className="mono" style={{ fontSize: 13, fontWeight: 700, color:"var(--ink)", marginTop: 1 }}>{iss.days}</div>
                </div>
                <button className="chip chip-sm" style={{ marginLeft:"auto", background:"var(--ink)", color:"#fff", border:"none" }}>
                  Read more <Icon name="chevron" size={10}/>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Below: ask Au7o */}
        <div style={{ marginTop: 22 }}>
          <div className="eyebrow" style={{ marginBottom: 8, fontSize: 10 }}>ASK AU7O</div>
          <div style={{ display:"flex", flexDirection:"column", gap: 6 }}>
            {[
              { icon:"chat", text:"Which of these would you fix first?" },
              { icon:"map", text:"Find me a shop near 94703" },
              { icon:"search", text:"How do I tell if my U-joint is failing?" },
            ].map((s,i) => (
              <button key={i} style={{
                display:"flex", alignItems:"center", gap: 10,
                padding:"10px 12px", background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 12,
                fontFamily:"var(--font-sans)", fontSize: 12.5, color:"var(--ink)", textAlign:"left", cursor:"pointer",
              }}>
                <Icon name={s.icon} size={13} style={{ color:"var(--slate-500)" }}/>
                <span style={{ flex: 1 }}>{s.text}</span>
                <Icon name="chevron" size={10} style={{ color:"var(--slate-400)" }}/>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Composer + tab nav — same pattern as A2 mobile */}
      <MobileBottomDock active="garage"/>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// MOBILE — DRIVE (matches A2 hub mobile vocabulary)
// ════════════════════════════════════════════════════════════════
function MobileDrive() {
  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", background:"var(--paper)", overflow:"hidden", position:"relative" }}>
      {/* Header */}
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"6px 16px 10px", gap: 10, background:"var(--paper)",
      }}>
        <button style={{ display:"flex", alignItems:"center", gap: 8, padding:"6px 12px 6px 6px", background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 999 }}>
          <span style={{ width: 26, height: 26, borderRadius:"50%", background:"var(--ink)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize: 11, fontWeight: 700 }}>C</span>
          <div style={{ textAlign:"left", lineHeight: 1.1 }}>
            <div style={{ fontSize: 11.5, fontWeight: 600 }}>Challenger</div>
            <div className="mono" style={{ fontSize: 9.5, color:"var(--slate-500)" }}>2015 · 64,218 mi</div>
          </div>
          <Icon name="chevron-down" size={11} style={{ color:"var(--slate-400)", marginLeft: 4 }}/>
        </button>
        <div style={{ display:"flex", gap: 8 }}>
          <button style={{ width: 32, height: 32, borderRadius:"50%", background:"#fff", border:"1px solid var(--paper-line)", display:"inline-flex", alignItems:"center", justifyContent:"center", color:"var(--slate-500)" }}>
            <Icon name="list" size={14}/>
          </button>
          <button style={{ width: 32, height: 32, borderRadius:"50%", background:"var(--ink)", border:"none", display:"inline-flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize: 11, fontWeight: 700 }}>R</button>
        </div>
      </div>

      <div style={{ flex: 1, overflow:"auto", padding:"4px 16px 130px" }}>
        {/* Greeting */}
        <div style={{ marginTop: 10 }}>
          <div style={{ display:"flex", alignItems:"center", gap: 8, marginBottom: 8 }}>
            <span className="au7o-pulse-soft" style={{ width: 6, height: 6, borderRadius:"50%", background:"var(--au7o-blue)" }}/>
            <span className="eyebrow" style={{ color:"var(--au7o-blue)", fontSize: 10 }}>DRIVE · YOUR CHALLENGER</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing:"-0.02em", lineHeight: 1.2, textWrap:"pretty" }}>
            Where to today, Ricardo?<br/>
            <span style={{ color:"var(--slate-500)" }}>Tell me in your own words.</span>
          </h1>
          <p style={{ fontSize: 12.5, color:"var(--slate-700)", marginTop: 8, lineHeight: 1.5 }}>
            I'll route around your fuel range, oil life, and any parts shops on the way.
          </p>
        </div>

        {/* User question */}
        <div style={{ display:"flex", justifyContent:"flex-end", marginTop: 18 }}>
          <div style={{ background:"var(--ink)", color:"#fff", padding:"8px 12px", borderRadius:"14px 14px 4px 14px", fontSize: 13, maxWidth:"82%" }}>
            Take me to Healdsburg with a coffee stop
          </div>
        </div>

        {/* Au7o reply with map attachment */}
        <div style={{ marginTop: 12 }}>
          <div style={{ display:"flex", gap: 8, alignItems:"flex-start" }}>
            <img src="brand/au7o-mascot.png" alt="" style={{ width: 22, height: 22, marginTop: 2 }}/>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 12.5, color:"var(--ink)", lineHeight: 1.5, margin: 0 }}>
                Plotted <b>112 mi</b> via the 101 with a stop at <b>Equator Coffee</b>. Whole trip is <b>2h 40m</b>.
              </p>
            </div>
          </div>
          {/* Map card — bigger than A2 hub, this is the focal point */}
          <div style={{ marginTop: 8, marginLeft: 30, background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 14, overflow:"hidden", boxShadow:"var(--shadow-1)" }}>
            <div style={{ height: 200, background:"#F2EEE3", position:"relative" }}>
              <MobileDriveMap/>
              {/* floating summary chip */}
              <div style={{ position:"absolute", top: 10, left: 10,
                background:"rgba(255,255,255,0.95)", backdropFilter:"blur(10px)",
                padding:"6px 10px", borderRadius: 10, border:"1px solid var(--paper-line)",
                display:"flex", alignItems:"center", gap: 8, fontSize: 11 }}>
                <span className="mono" style={{ fontWeight: 700 }}>112 mi</span>
                <span style={{ color:"var(--slate-300)" }}>·</span>
                <span className="mono" style={{ fontWeight: 700 }}>2h 40m</span>
                <span style={{ color:"var(--slate-300)" }}>·</span>
                <span style={{ color:"var(--ok)", fontWeight: 600 }}>● On time</span>
              </div>
            </div>
            {/* stops mini-list */}
            <div>
              {[
                { icon:"pin", label:"Home", time:"9:30 AM" },
                { icon:"coffee", label:"Equator Coffee · 28m in", time:"10:00 AM" },
                { icon:"pin", label:"Healdsburg", time:"12:10 PM" },
              ].map((s,i,a) => (
                <div key={i} style={{ padding:"9px 12px", display:"flex", alignItems:"center", gap: 10,
                  borderTop: "1px solid var(--paper-line)" }}>
                  <Icon name={s.icon} size={12} style={{ color:"var(--slate-500)" }}/>
                  <span style={{ flex: 1, fontSize: 12, fontWeight: 500 }}>{s.label}</span>
                  <span className="mono" style={{ fontSize: 10.5, color:"var(--slate-500)" }}>{s.time}</span>
                </div>
              ))}
            </div>
            <div style={{ padding: 8, display:"flex", gap: 6, borderTop:"1px solid var(--paper-line)" }}>
              <button className="chip chip-sm" style={{ flex: 1, justifyContent:"center", background:"var(--ink)", color:"#fff", border:"none" }}>Start drive</button>
              <button className="chip chip-sm" style={{ flex: 1, justifyContent:"center" }}>Edit stops</button>
            </div>
          </div>
        </div>

        {/* Au7o second message — car-aware notes */}
        <div style={{ marginTop: 16 }}>
          <div style={{ display:"flex", gap: 8, alignItems:"flex-start" }}>
            <img src="brand/au7o-mascot.png" alt="" style={{ width: 22, height: 22, marginTop: 2 }}/>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 12.5, color:"var(--ink)", lineHeight: 1.5, margin: 0 }}>
                A few things to know about your car for this trip:
              </p>
            </div>
          </div>
          <div style={{ marginTop: 8, marginLeft: 30, background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 14, overflow:"hidden", boxShadow:"var(--shadow-1)" }}>
            <div style={{ padding:"8px 12px", borderBottom:"1px solid var(--paper-line)",
              display:"flex", alignItems:"center", gap: 6 }}>
              <Icon name="car" size={11} style={{ color:"var(--slate-500)" }}/>
              <span className="eyebrow" style={{ fontSize: 10 }}>CAR-AWARE NOTES</span>
            </div>
            {[
              { icon:"fuel", body: <>Premium averages <span className="mono" style={{ fontWeight: 600 }}>$5.42/gal</span> on this route.</>, tone:"slate" },
              { icon:"alert", body: <>Oil life at <span className="mono" style={{ fontWeight: 600 }}>82%</span> — schedule a change in 1,200 mi.</>, tone:"warn" },
              { icon:"spark", body: <>NAPA on River Road has your <b>OEM radiator</b>. Add as a stop?</>, tone:"ok" },
            ].map((n,i,a) => (
              <div key={i} style={{ padding:"10px 12px", display:"flex", gap: 10, fontSize: 12, lineHeight: 1.45,
                borderBottom: i < a.length-1 ? "1px solid var(--paper-line)" : "none" }}>
                <Icon name={n.icon} size={12} style={{ marginTop: 2,
                  color: n.tone === "warn" ? "var(--warn)" : n.tone === "ok" ? "var(--ok)" : "var(--slate-500)" }}/>
                <div style={{ flex: 1 }}>{n.body}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Suggestions */}
        <div style={{ marginTop: 22 }}>
          <div className="eyebrow" style={{ marginBottom: 8, fontSize: 10 }}>WHILE YOU'RE PLANNING</div>
          <div style={{ display:"flex", flexDirection:"column", gap: 6 }}>
            {[
              { icon:"coffee", text:"Best espresso in Healdsburg" },
              { icon:"fuel", text:"Cheapest premium near me" },
              { icon:"map", text:"Find a scenic alternate route" },
            ].map((s,i) => (
              <button key={i} style={{
                display:"flex", alignItems:"center", gap: 10,
                padding:"10px 12px", background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 12,
                fontFamily:"var(--font-sans)", fontSize: 12.5, color:"var(--ink)", textAlign:"left", cursor:"pointer",
              }}>
                <Icon name={s.icon} size={13} style={{ color:"var(--slate-500)" }}/>
                <span style={{ flex: 1 }}>{s.text}</span>
                <Icon name="chevron" size={10} style={{ color:"var(--slate-400)" }}/>
              </button>
            ))}
          </div>
        </div>
      </div>

      <MobileBottomDock active="drive"/>
    </div>
  );
}

function MobileDriveMap() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 360 200" preserveAspectRatio="xMidYMid slice" style={{ display:"block" }}>
      <rect width="360" height="200" fill="#F2EEE3"/>
      <path d="M-10 80 C 80 70 160 100 240 90 C 300 82 340 100 370 92 L 370 120 C 340 130 300 110 240 118 C 160 128 80 110 -10 118 Z" fill="#C9DCE6" opacity="0.5"/>
      <rect x="20" y="10" width="60" height="40" rx="4" fill="#D5E2C9"/>
      <rect x="280" y="150" width="70" height="40" rx="4" fill="#D5E2C9"/>
      {[[100,20,40,30],[160,10,40,40],[210,30,40,30],[20,140,40,30],[80,150,50,30],[150,160,40,30],[210,160,40,30]].map((b,i) => (
        <rect key={i} x={b[0]} y={b[1]} width={b[2]} height={b[3]} rx="3" fill="#E8E2D2"/>
      ))}
      <path d="M0 100 L360 96" stroke="#fff" strokeWidth="6"/>
      <path d="M0 60 L360 56" stroke="#fff" strokeWidth="4"/>
      <path d="M120 0 L130 200" stroke="#fff" strokeWidth="4"/>
      <path d="M260 0 L270 200" stroke="#fff" strokeWidth="4"/>
      {/* route */}
      <path d="M 30 175 C 80 160 110 130 150 110 S 200 80 240 60 S 290 40 320 25"
            stroke="#fff" strokeWidth="8" fill="none" strokeLinecap="round"/>
      <path d="M 30 175 C 80 160 110 130 150 110 S 200 80 240 60 S 290 40 320 25"
            stroke="var(--au7o-blue)" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
      <g transform="translate(30,175)">
        <circle r="14" fill="var(--au7o-blue)" opacity="0.18">
          <animate attributeName="r" from="8" to="22" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="opacity" from="0.4" to="0" dur="2s" repeatCount="indefinite"/>
        </circle>
        <circle r="7" fill="#fff"/><circle r="4" fill="var(--au7o-blue)"/>
      </g>
      <g transform="translate(180,90)">
        <circle r="9" fill="#fff" stroke="var(--paper-line)" strokeWidth="1.5"/>
        <text y="3" textAnchor="middle" fontSize="9">☕</text>
      </g>
      <g transform="translate(320,25)">
        <circle r="9" fill="var(--ink)"/>
        <circle r="3" fill="#fff"/>
      </g>
    </svg>
  );
}

// ════════════════════════════════════════════════════════════════
// Shared bottom dock — composer + tab nav (matches A2 mobile)
// ════════════════════════════════════════════════════════════════
function MobileBottomDock({ active = "ask" }) {
  return (
    <div style={{
      position:"absolute", left: 0, right: 0, bottom: 0,
      padding:"8px 12px 14px",
      background:"linear-gradient(180deg, rgba(247,243,234,0) 0%, rgba(247,243,234,0.9) 30%, var(--paper) 70%)",
    }}>
      <div style={{
        background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 18,
        boxShadow:"var(--shadow-2)", padding:"7px 7px 7px 14px",
        display:"flex", alignItems:"center", gap: 8,
      }}>
        <Icon name="chat" size={13} style={{ color:"var(--slate-400)" }}/>
        <span style={{ flex: 1, fontSize: 13, color:"var(--slate-400)" }}>Ask Au7o anything…</span>
        <button style={{ width: 28, height: 28, borderRadius:"50%", background:"var(--paper-2)", border:"none", display:"inline-flex", alignItems:"center", justifyContent:"center", color:"var(--slate-500)" }}>
          <Icon name="mic" size={13}/>
        </button>
        <button style={{ width: 30, height: 30, borderRadius:"50%", background:"var(--ink)", border:"none", display:"inline-flex", alignItems:"center", justifyContent:"center", color:"#fff" }}>
          <Icon name="send" size={12}/>
        </button>
      </div>
      <div style={{ display:"flex", justifyContent:"space-around", paddingTop: 10, marginTop: 4, borderTop:"1px solid var(--paper-line)" }}>
        {[
          { id:"ask", icon:"chat", label:"Ask" },
          { id:"garage", icon:"list", label:"Garage" },
          { id:"drive", icon:"map", label:"Drive" },
          { id:"you", icon:"user", label:"You" },
        ].map((t) => (
          <button key={t.id} style={{
            display:"flex", flexDirection:"column", alignItems:"center", gap: 2,
            background:"transparent", border:"none", cursor:"pointer",
            color: t.id === active ? "var(--ink)" : "var(--slate-400)",
          }}>
            <Icon name={t.icon} size={16}/>
            <span style={{ fontSize: 9.5, fontWeight: t.id === active ? 600 : 500 }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// MOBILE — DRIVE, FULL-SCREEN (after tapping "Start drive")
// Pushes to a full-bleed nav surface. No header chrome, no
// conversation peek — map is edge-to-edge. Turn-by-turn directive,
// ETA pill, upcoming-stop chip, and a car-aware nudge float over
// the map. Composer collapses to a single voice-forward pill.
// ════════════════════════════════════════════════════════════════
function MobileDriveExpanded() {
  return (
    <div style={{ height:"100%", width:"100%", background:"#E9E4D6", overflow:"hidden", position:"relative" }}>
      {/* Full-bleed map — edge-to-edge, no card frame */}
      <div style={{ position:"absolute", inset: 0 }}>
        <MobileDriveMapLarge/>
      </div>

      {/* Floating top bar — back to chat, status, options */}
      <div style={{
        position:"absolute", top: 12, left: 12, right: 12, zIndex: 5,
        display:"flex", alignItems:"center", justifyContent:"space-between", gap: 8,
      }}>
        <button style={{
          display:"flex", alignItems:"center", gap: 6,
          padding:"7px 12px 7px 9px",
          background:"rgba(255,255,255,0.95)", backdropFilter:"blur(20px)",
          border:"1px solid var(--paper-line)", borderRadius: 999,
          fontFamily:"var(--font-sans)", fontSize: 11.5, fontWeight: 600, color:"var(--ink)",
          boxShadow:"var(--shadow-1)",
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Back to chat
        </button>
        <div style={{ display:"flex", alignItems:"center", gap: 6,
          padding:"6px 11px", background:"rgba(255,255,255,0.95)", backdropFilter:"blur(20px)",
          border:"1px solid var(--paper-line)", borderRadius: 999, boxShadow:"var(--shadow-1)" }}>
          <span className="au7o-pulse-soft" style={{ width: 6, height: 6, borderRadius:"50%", background:"var(--ok)" }}/>
          <span className="mono" style={{ fontSize: 10, color:"var(--slate-700)", fontWeight: 700, letterSpacing:"0.06em" }}>NAVIGATING</span>
        </div>
        <button style={{ width: 32, height: 32, borderRadius:"50%", background:"rgba(255,255,255,0.95)", backdropFilter:"blur(20px)", border:"1px solid var(--paper-line)", display:"inline-flex", alignItems:"center", justifyContent:"center", color:"var(--slate-500)", boxShadow:"var(--shadow-1)" }}>
          <Icon name="more" size={14}/>
        </button>
      </div>

      {/* Floating overlay layer — turn-by-turn + chips + nudge */}
      <div style={{ position:"absolute", inset: 0, pointerEvents:"none" }}>
        {/* Top: turn-by-turn directive card */}
        <div style={{ position:"absolute", top: 60, left: 12, right: 12, pointerEvents:"auto",
          background:"rgba(11,18,32,0.94)", backdropFilter:"blur(20px)",
          color:"#fff", borderRadius: 16, padding:"12px 14px",
          display:"flex", alignItems:"center", gap: 12,
          boxShadow:"0 12px 28px rgba(11,18,32,0.25)",
        }}>
          {/* turn icon */}
          <div style={{ width: 44, height: 44, borderRadius: 12, background:"var(--au7o-blue)",
            display:"flex", alignItems:"center", justifyContent:"center", flexShrink: 0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M14 5l7 7-7 7"/><path d="M3 19V12a4 4 0 0 1 4-4h14"/></svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="mono" style={{ fontSize: 22, fontWeight: 700, lineHeight: 1, letterSpacing:"-0.01em" }}>
              0.4 <span style={{ fontSize: 11, fontWeight: 500, color:"rgba(255,255,255,0.6)" }}>mi</span>
            </div>
            <div style={{ fontSize: 12.5, color:"rgba(255,255,255,0.85)", marginTop: 4, lineHeight: 1.3 }}>
              Take exit <b style={{ color:"#fff" }}>442</b> toward <b style={{ color:"#fff" }}>Mill Valley</b>
            </div>
          </div>
        </div>

        {/* Top-right: ETA pill */}
        <div style={{ position:"absolute", top: 132, right: 12, pointerEvents:"auto",
          background:"rgba(255,255,255,0.95)", backdropFilter:"blur(10px)",
          padding:"7px 11px", borderRadius: 10, border:"1px solid var(--paper-line)",
          display:"flex", alignItems:"center", gap: 8,
          boxShadow:"var(--shadow-1)",
        }}>
          <div style={{ textAlign:"right", lineHeight: 1.05 }}>
            <div className="mono" style={{ fontSize: 14, fontWeight: 700 }}>2h 38m</div>
            <div style={{ fontSize: 9, color:"var(--slate-500)", letterSpacing:"0.04em", textTransform:"uppercase", fontWeight: 600 }}>arrives 12:08 pm</div>
          </div>
        </div>

        {/* Top-left: stop coming up */}
        <div style={{ position:"absolute", top: 132, left: 12, pointerEvents:"auto",
          background:"rgba(255,255,255,0.95)", backdropFilter:"blur(10px)",
          padding:"6px 10px 6px 8px", borderRadius: 999, border:"1px solid var(--paper-line)",
          display:"flex", alignItems:"center", gap: 6,
          boxShadow:"var(--shadow-1)",
        }}>
          <span style={{ width: 18, height: 18, borderRadius:"50%", background:"var(--paper-2)",
            display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Icon name="coffee" size={9} style={{ color:"#92400E" }}/>
          </span>
          <span style={{ fontSize: 10.5, fontWeight: 600 }}>Equator Coffee</span>
          <span className="mono" style={{ fontSize: 10, color:"var(--slate-500)" }}>· 26m</span>
        </div>

        {/* Bottom: car-aware nudge — keeps the "Drive is car-aware" feature visible mid-trip */}
        <div style={{ position:"absolute", bottom: 72, left: 12, right: 12, pointerEvents:"auto",
          background:"rgba(255,255,255,0.95)", backdropFilter:"blur(20px)",
          border:"1px solid var(--paper-line)", borderRadius: 14,
          padding:"10px 12px",
          boxShadow:"var(--shadow-2)",
          display:"flex", alignItems:"center", gap: 10,
        }}>
          <span style={{ width: 28, height: 28, borderRadius: 8, background:"var(--paper-2)",
            display:"flex", alignItems:"center", justifyContent:"center", flexShrink: 0 }}>
            <Icon name="fuel" size={14} style={{ color:"var(--slate-500)" }}/>
          </span>
          <div style={{ flex: 1, minWidth: 0, fontSize: 11.5, lineHeight: 1.35 }}>
            <span style={{ fontWeight: 600 }}>Cheaper premium 1.2 mi ahead</span><span style={{ color:"var(--slate-500)" }}> · $5.18 vs $5.42 at next exit</span>
          </div>
          <button style={{
            background:"var(--ink)", color:"#fff", border:"none",
            padding:"6px 10px", borderRadius: 8, fontSize: 11, fontWeight: 600, fontFamily:"var(--font-sans)",
          }}>Add stop</button>
        </div>
      </div>

      {/* Collapsed composer — minimal pill, drive controls take precedence */}
      <div style={{
        position:"absolute", left: 0, right: 0, bottom: 0,
        padding:"0 14px 14px",
        zIndex: 5,
      }}>
        <div style={{
          background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 999,
          boxShadow:"var(--shadow-2)", padding:"6px 6px 6px 14px",
          display:"flex", alignItems:"center", gap: 8,
        }}>
          <Icon name="chat" size={12} style={{ color:"var(--slate-400)" }}/>
          <span style={{ flex: 1, fontSize: 12, color:"var(--slate-400)" }}>Ask while driving…</span>
          <button style={{ width: 26, height: 26, borderRadius:"50%", background:"var(--au7o-blue)", border:"none", display:"inline-flex", alignItems:"center", justifyContent:"center", color:"#fff" }}>
            <Icon name="mic" size={11}/>
          </button>
        </div>
      </div>
    </div>
  );
}

function MobileDriveMapLarge() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 360 640" preserveAspectRatio="xMidYMid slice" style={{ display:"block" }}>
      <rect width="360" height="640" fill="#F2EEE3"/>
      {/* water */}
      <path d="M-10 220 C 100 200 200 250 300 230 C 340 222 360 232 370 226 L 370 280 C 340 290 300 250 200 270 C 100 290 0 260 -10 270 Z" fill="#C9DCE6" opacity="0.55"/>
      <path d="M-10 510 C 80 530 180 490 260 510 L 260 560 C 180 540 80 570 -10 555 Z" fill="#C9DCE6" opacity="0.4"/>
      {/* parks */}
      <rect x="40" y="40" width="100" height="80" rx="6" fill="#D5E2C9"/>
      <rect x="240" y="380" width="100" height="80" rx="6" fill="#D5E2C9"/>
      <rect x="60" y="580" width="80" height="50" rx="5" fill="#D5E2C9"/>
      {/* blocks */}
      {[[160,40,40,40],[210,40,50,40],[270,30,50,50],[40,140,60,50],[110,150,50,40],[180,160,50,50],[240,150,40,50],[290,160,40,50],[40,300,60,50],[110,310,50,50],[170,320,60,40],[240,300,50,60],[300,310,40,50],[40,400,60,50],[110,420,50,50],[40,500,60,40],[110,510,50,50],[180,520,50,40],[240,500,50,60],[40,580,40,40],[280,580,60,40]].map((b,i) => (
        <rect key={i} x={b[0]} y={b[1]} width={b[2]} height={b[3]} rx="3" fill="#E8E2D2"/>
      ))}
      {/* roads */}
      <path d="M0 250 L360 240" stroke="#fff" strokeWidth="7"/>
      <path d="M0 380 L360 370" stroke="#fff" strokeWidth="6"/>
      <path d="M0 470 L360 460" stroke="#fff" strokeWidth="5"/>
      <path d="M120 0 L130 640" stroke="#fff" strokeWidth="6"/>
      <path d="M260 0 L270 640" stroke="#fff" strokeWidth="5"/>
      {/* route — already partially traveled (faded) + remaining (bright) */}
      <path d="M 80 590 C 130 540 160 500 200 460"
            stroke="var(--au7o-blue)" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.28" strokeDasharray="2 6"/>
      <path d="M 200 460 C 240 420 230 360 250 320 S 290 220 280 160 S 240 100 220 60"
            stroke="#fff" strokeWidth="11" fill="none" strokeLinecap="round"/>
      <path d="M 200 460 C 240 420 230 360 250 320 S 290 220 280 160 S 240 100 220 60"
            stroke="var(--au7o-blue)" strokeWidth="5" fill="none" strokeLinecap="round"/>
      {/* current position arrow */}
      <g transform="translate(200,460) rotate(-55)">
        <circle r="18" fill="var(--au7o-blue)" opacity="0.18">
          <animate attributeName="r" from="11" to="28" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="opacity" from="0.45" to="0" dur="2s" repeatCount="indefinite"/>
        </circle>
        <circle r="11" fill="#fff"/>
        <path d="M0 -7 L5 4 L0 1 L-5 4 Z" fill="var(--au7o-blue)"/>
      </g>
      {/* coffee stop */}
      <g transform="translate(280,200)">
        <circle r="11" fill="#fff" stroke="var(--paper-line)" strokeWidth="1.5"/>
        <text y="4" textAnchor="middle" fontSize="11">☕</text>
      </g>
      {/* destination */}
      <g transform="translate(220,60)">
        <circle r="11" fill="var(--ink)"/>
        <circle r="4" fill="#fff"/>
      </g>
    </svg>
  );
}

Object.assign(window, {
  DriveA2Web, MobileKnownIssues, MobileKIIndex, MobileKIMake, MobileDrive, MobileDriveExpanded, MobileBottomDock,
});
