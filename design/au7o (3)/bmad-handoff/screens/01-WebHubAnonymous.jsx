/* Direction A — Conversation-first
   The chat IS the product. Vehicle context lives in a slim left rail.
   Issues, recalls, parts, and Drive routes surface as rich attachments inside the conversation.
*/

function DirectionAHub({ vehicle = WEB_VEHICLE }) {
  const [input, setInput] = React.useState("");
  return (
    <div style={{ position:"relative", display:"flex", height: "100%", background:"var(--paper)" }}>
      {/* Left rail — vehicle + threads */}
      <DirAVehicleRail vehicle={vehicle}/>

      {/* Conversation column */}
      <div style={{ flex: 1, display:"flex", flexDirection:"column", position:"relative", overflow:"hidden" }}>
        <DirATopBar vehicle={vehicle}/>
        <div style={{ flex: 1, overflow:"hidden", position:"relative" }}>
          <AmbientBackground/>
          <div className="web-scroll" style={{ position:"relative", zIndex: 1, height:"100%", padding: "32px 56px 200px", display:"flex", flexDirection:"column", gap: 22 }}>
            <DirAGreetingBlock vehicle={vehicle}/>
            <DirAUserBubble text="What are the most common problems on this car around 64k miles?"/>
            <DirAAu7oReply/>
            <DirAUserBubble text="Plan me a weekend trip to a winery, with a coffee stop on the way."/>
            <DirAMapAttachment/>
          </div>
        </div>
        <DirAComposer input={input} setInput={setInput}/>
      </div>
    </div>
  );
}

// ─── Left vehicle rail ───────────────────────────────────────────
function DirAVehicleRail({ vehicle }) {
  return (
    <aside style={{
      width: 280, flex:"0 0 280px",
      borderRight: "1px solid var(--paper-line)",
      background: "rgba(255,255,255,0.5)",
      backdropFilter:"blur(20px)",
      display:"flex", flexDirection:"column",
    }}>
      <div style={{ padding: "20px 22px 16px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <Au7oMark size={26}/>
        <button style={{ background:"transparent", border:"none", padding: 4, color:"var(--slate-500)", cursor:"pointer" }}>
          <Icon name="settings" size={16}/>
        </button>
      </div>

      {/* Vehicle card */}
      <div style={{ padding: "0 14px" }}>
        <div style={{
          padding: "16px",
          background: "linear-gradient(180deg,#fff,#FAF8F2)",
          border:"1px solid var(--paper-line)", borderRadius: 14,
        }}>
          <div style={{ display:"flex", justifyContent:"center", marginBottom: 8 }}>
            <ChallengerSilhouette width={140} color="#1a1a1a"/>
          </div>
          <div style={{ fontSize: 13.5, fontWeight: 600, letterSpacing:"-0.01em", lineHeight: 1.3 }}>
            {vehicle.year} {vehicle.make} {vehicle.model}
          </div>
          <div style={{ fontSize: 11.5, color:"var(--slate-500)", marginTop: 1 }}>
            {vehicle.trim} · <span className="mono">{vehicle.miles.toLocaleString()} mi</span>
          </div>
          <div style={{ display:"flex", gap: 6, marginTop: 10, flexWrap:"wrap" }}>
            <span style={chipStyle("warn")}>{vehicle.knownIssues} issues</span>
            <span style={chipStyle("crit")}>{vehicle.recalls} recalls</span>
            <span style={chipStyle("ok")}>{vehicle.partsCached} parts</span>
          </div>
        </div>
      </div>

      <div style={{ padding: "16px 22px 6px" }} className="eyebrow">Recent</div>
      <div style={{ padding: "0 10px", display:"flex", flexDirection:"column", gap: 2 }}>
        {RECENT_THREADS.map((t,i) => (
          <button key={i} style={{
            display:"flex", alignItems:"center", gap: 10,
            background:"transparent", border:"none",
            padding: "9px 12px", borderRadius: 10, cursor:"pointer",
            textAlign:"left", color:"var(--ink)",
          }} onMouseEnter={e => e.currentTarget.style.background="rgba(11,18,32,0.04)"}
             onMouseLeave={e => e.currentTarget.style.background="transparent"}>
            <Icon name={t.icon} size={14} style={{ color:"var(--slate-500)" }}/>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 12.5, fontWeight: 500, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{t.title}</div>
              <div style={{ fontSize: 10.5, color:"var(--slate-500)" }}>{t.when}</div>
            </div>
          </button>
        ))}
      </div>

      <div style={{ flex: 1 }}/>

      <div style={{ padding: "12px 16px", borderTop: "1px solid var(--paper-line)" }}>
        <button className="btn-outline" style={{ width:"100%", justifyContent:"center", padding:"10px 12px" }}>
          <Icon name="plus" size={14}/> New conversation
        </button>
      </div>
    </aside>
  );
}

function chipStyle(kind) {
  const map = {
    ok: { bg:"var(--ok-bg)", color:"#065F46" },
    warn: { bg:"var(--warn-bg)", color:"#92400E" },
    crit: { bg:"var(--crit-bg)", color:"#991B1B" },
  };
  const c = map[kind];
  return {
    fontSize: 10.5, fontWeight: 600,
    padding: "3px 8px", borderRadius: 999,
    background: c.bg, color: c.color,
    fontFamily: "var(--font-mono)",
  };
}

// ─── Top bar ─────────────────────────────────────────────────────
function DirATopBar({ vehicle }) {
  return (
    <div style={{
      height: 56, padding:"0 24px",
      display:"flex", alignItems:"center", justifyContent:"space-between",
      borderBottom: "1px solid var(--paper-line)",
      background:"rgba(255,255,255,0.5)", backdropFilter:"blur(20px)",
      position:"relative", zIndex: 5,
    }}>
      <div style={{ display:"flex", alignItems:"center", gap: 12 }}>
        <span className="eyebrow">Conversation</span>
        <span style={{ color:"var(--slate-300)" }}>·</span>
        <span style={{ fontSize: 13, color:"var(--slate-700)" }}>Symptoms & maintenance</span>
      </div>
      <div style={{ display:"flex", gap: 8 }}>
        <button className="chip chip-sm"><Icon name="map" size={12}/> Open Drive</button>
        <button className="chip chip-sm"><Icon name="book" size={12}/> Library</button>
      </div>
    </div>
  );
}

// ─── Greeting block ──────────────────────────────────────────────
function DirAGreetingBlock({ vehicle }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap: 14, alignItems:"flex-start", maxWidth: 720 }}>
      <div style={{ display:"flex", alignItems:"center", gap: 10 }}>
        <div className="au7o-pulse-soft" style={{ width: 8, height: 8, borderRadius:"50%", background:"var(--au7o-blue)" }}/>
        <span className="eyebrow" style={{ color:"var(--au7o-blue)" }}>AU7O FOR YOUR CHALLENGER</span>
      </div>
      <h1 style={{ fontSize: 38, fontWeight: 600, letterSpacing:"-0.03em", lineHeight: 1.1, textWrap: "pretty" }}>
        Good afternoon. <span style={{ color:"var(--slate-400)" }}>What's on your mind today?</span>
      </h1>
      <div style={{ display:"flex", flexWrap:"wrap", gap: 8, marginTop: 4 }}>
        {SUGGESTED_PROMPTS.slice(0,5).map((p,i) => (
          <button key={i} className="chip">
            <Icon name={p.icon} size={13} style={{ color:"var(--slate-500)" }}/>
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Conversation primitives ─────────────────────────────────────
function DirAUserBubble({ text }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", marginTop: 14 }}>
      <div className="bubble-user">{text}</div>
    </div>
  );
}

function DirAAu7oReply() {
  return (
    <div style={{ display:"flex", gap: 14, alignItems:"flex-start" }}>
      <img src="brand/au7o-mascot.png" alt="" style={{ width: 32, height: 32, marginTop: 2 }}/>
      <div style={{ flex: 1, display:"flex", flexDirection:"column", gap: 12, maxWidth: 720 }}>
        <div className="bubble-au7o">
          For a 2015 Challenger SRT 392 around 64k miles, four issues come up most often. Two are <b>safety-critical</b> — let's start with those.
        </div>
        <DirAIssueAttachment/>
        <div className="bubble-au7o">
          Recall <b>S19</b> covers the EPS rack on your VIN range — repair is free at any Dodge dealer. Want me to find the closest one and book a slot?
        </div>
        <div style={{ display:"flex", gap: 8 }}>
          <button className="btn-outline" style={{ padding:"8px 12px", fontSize: 13 }}>Find a dealer</button>
          <button className="chip chip-sm"><Icon name="search" size={12}/> Open recall details</button>
        </div>
      </div>
    </div>
  );
}

function DirAIssueAttachment() {
  const issues = [
    { name:"Driveshaft / U-Joint Failure", cost:"$300 – $2,500", priority:"high", common:"~14% at 60k+" },
    { name:"EPS Rack Failure", cost:"$1,200 – $2,800", priority:"high", common:"~9% — recall S19", recall: true },
    { name:"OEM Radiator Premature Failure", cost:"$200 – $800", priority:"medium", common:"~6%" },
    { name:"ZF 8-Speed Harsh Shifting", cost:"$820 – $2,500", priority:"medium", common:"~5%" },
  ];
  return (
    <div style={{
      background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 16,
      overflow:"hidden", boxShadow:"var(--shadow-1)",
    }}>
      <div style={{ padding:"12px 16px", borderBottom:"1px solid var(--paper-line)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap: 8 }}>
          <Icon name="alert" size={14} style={{ color:"var(--slate-500)" }}/>
          <span style={{ fontSize: 13, fontWeight: 600 }}>4 known issues</span>
          <span style={{ fontSize: 11, color:"var(--slate-500)" }}>· filtered to your trim</span>
        </div>
        <button style={{ background:"transparent", border:"none", color:"var(--slate-500)", fontSize: 12, cursor:"pointer", display:"inline-flex", alignItems:"center", gap: 2 }}>
          See all <Icon name="chevron" size={12}/>
        </button>
      </div>
      {issues.map((iss,i) => (
        <div key={i} style={{
          padding:"12px 16px", display:"flex", alignItems:"center", gap: 12,
          borderBottom: i < issues.length-1 ? "1px solid var(--paper-line)" : "none",
        }}>
          <span className={`status-dot ${iss.priority === "high" ? "crit" : "warn"}`}/>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 500 }}>
              {iss.name}
              {iss.recall && <span style={{ ...chipStyle("crit"), marginLeft: 8 }}>RECALL S19</span>}
            </div>
            <div style={{ fontSize: 11.5, color:"var(--slate-500)" }}>
              <span className="mono">{iss.cost}</span> · {iss.common}
            </div>
          </div>
          <Icon name="chevron" size={14} style={{ color:"var(--slate-400)" }}/>
        </div>
      ))}
    </div>
  );
}

// ─── Drive attachment (small map preview rendered inline) ────────
function DirAMapAttachment() {
  return (
    <div style={{ display:"flex", gap: 14, alignItems:"flex-start" }}>
      <img src="brand/au7o-mascot.png" alt="" style={{ width: 32, height: 32, marginTop: 2 }}/>
      <div style={{ flex: 1, display:"flex", flexDirection:"column", gap: 10, maxWidth: 720 }}>
        <div className="bubble-au7o">
          Plotted a Saturday loop with a stop at <b>Equator Coffee</b> 28 minutes in. Trip is <span className="mono">112 mi</span>, ~<span className="mono">2h 40m</span>. I checked: no part-store stops needed for your maintenance items right now.
        </div>
        <div style={{
          background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 16, overflow:"hidden",
          boxShadow:"var(--shadow-1)",
        }}>
          <div style={{ position:"relative", height: 220 }}>
            <DirAMiniMap/>
            <div style={{ position:"absolute", top: 12, left: 14, display:"flex", gap: 6 }}>
              <span className="chip chip-sm" style={{ background:"#fff" }}><Icon name="pin" size={11}/> Healdsburg</span>
              <span className="chip chip-sm" style={{ background:"#fff" }}><Icon name="coffee" size={11}/> Coffee</span>
            </div>
            <div style={{ position:"absolute", bottom: 12, right: 14, display:"flex", gap: 6 }}>
              <button className="chip chip-sm" style={{ background:"var(--ink)", color:"#fff", border:"none" }}>
                <Icon name="map" size={11}/> Open in Drive
              </button>
            </div>
          </div>
          <div style={{ padding:"12px 16px", display:"flex", alignItems:"center", gap: 14, fontSize: 12 }}>
            <span style={{ display:"flex", alignItems:"center", gap: 6 }}><Icon name="map" size={13}/><span className="mono">112 mi</span></span>
            <span style={{ color:"var(--slate-300)" }}>·</span>
            <span className="mono" style={{ color:"var(--slate-700)" }}>2h 40m</span>
            <span style={{ color:"var(--slate-300)" }}>·</span>
            <span style={{ color:"var(--slate-700)" }}>1 stop</span>
            <span style={{ marginLeft:"auto", color:"var(--slate-500)" }}>Plotted by Au7o · uses live traffic</span>
          </div>
        </div>
        <div style={{ display:"flex", gap: 8 }}>
          <button className="chip chip-sm">Add another stop</button>
          <button className="chip chip-sm">Avoid highways</button>
          <button className="chip chip-sm">Find scenic alternative</button>
        </div>
      </div>
    </div>
  );
}

function DirAMiniMap() {
  return (
    <svg viewBox="0 0 720 220" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" style={{ display:"block" }}>
      <defs>
        <linearGradient id="dirA-water" x1="0" x2="1">
          <stop offset="0" stopColor="#C9DCE6"/><stop offset="1" stopColor="#B5CCD9"/>
        </linearGradient>
      </defs>
      <rect width="720" height="220" fill="#F2EEE3"/>
      <path d="M-20 130 C 100 110 220 150 320 130 C 420 110 540 150 740 130 L 740 220 L -20 220 Z" fill="url(#dirA-water)" opacity="0.6"/>
      <rect x="40" y="30" width="80" height="50" rx="4" fill="#D5E2C9"/>
      <rect x="180" y="20" width="60" height="40" rx="4" fill="#D5E2C9"/>
      <rect x="420" y="40" width="100" height="60" rx="4" fill="#D5E2C9"/>
      <rect x="600" y="20" width="80" height="50" rx="4" fill="#D5E2C9"/>
      {/* roads */}
      <path d="M0 100 L720 90" stroke="#FFFFFF" strokeWidth="6"/>
      <path d="M0 160 L720 165" stroke="#FFFFFF" strokeWidth="4"/>
      <path d="M180 0 L200 220" stroke="#FFFFFF" strokeWidth="4"/>
      <path d="M540 0 L560 220" stroke="#FFFFFF" strokeWidth="4"/>
      {/* route */}
      <path d="M 60 180 C 150 160 200 100 280 95 S 420 130 500 80 S 640 60 700 50"
            stroke="#FFFFFF" strokeWidth="7" fill="none" strokeLinecap="round"/>
      <path d="M 60 180 C 150 160 200 100 280 95 S 420 130 500 80 S 640 60 700 50"
            stroke="var(--au7o-blue)" strokeWidth="4" fill="none" strokeLinecap="round"/>
      {/* pins */}
      <g transform="translate(60,180)">
        <circle r="9" fill="#fff"/><circle r="5" fill="var(--au7o-blue)"/>
      </g>
      <g transform="translate(280,95)">
        <circle r="10" fill="#fff" stroke="var(--paper-line)"/>
        <text x="0" y="3" fontSize="10" textAnchor="middle" fill="#92400E">☕</text>
      </g>
      <g transform="translate(700,50)">
        <circle r="11" fill="var(--ink)"/>
        <circle r="5" fill="#fff"/>
      </g>
    </svg>
  );
}

// ─── Composer ────────────────────────────────────────────────────
function DirAComposer({ input, setInput }) {
  return (
    <div style={{ position:"relative", padding: "18px 56px 28px", borderTop:"1px solid var(--paper-line)", background:"rgba(255,255,255,0.6)", backdropFilter:"blur(20px)" }}>
      <div style={{
        background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 18,
        boxShadow:"var(--shadow-2)",
        padding: "10px 12px 10px 18px",
        display:"flex", alignItems:"flex-end", gap: 10,
      }}>
        <textarea
          rows={1}
          placeholder="Ask anything about your Challenger — symptoms, parts, recalls, or plan a trip."
          value={input}
          onChange={e=>setInput(e.target.value)}
          style={{
            flex: 1, border:"none", outline:"none", resize:"none",
            fontFamily:"var(--font-sans)", fontSize: 14.5, lineHeight: 1.5, color:"var(--ink)",
            padding:"8px 0",
            background:"transparent",
          }}
        />
        <button style={{
          background:"transparent", border:"1px solid var(--paper-line)",
          width: 36, height: 36, borderRadius: 12, cursor:"pointer",
          display:"flex", alignItems:"center", justifyContent:"center",
          color:"var(--slate-500)",
        }}>
          <Icon name="mic" size={16}/>
        </button>
        <button style={{
          background:"var(--ink)", border:"none", color:"#fff",
          width: 36, height: 36, borderRadius: 12, cursor:"pointer",
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>
          <Icon name="send" size={15}/>
        </button>
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", marginTop: 8, padding:"0 6px" }}>
        <div style={{ fontSize: 11, color:"var(--slate-500)" }}>
          Au7o uses your vehicle context · responses may need verifying with a mechanic
        </div>
        <div style={{ fontSize: 11, color:"var(--slate-500)", display:"flex", gap: 14 }}>
          <span>↵ to send</span>
          <span>⇧↵ for new line</span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  DirectionAHub, DirAVehicleRail, DirATopBar, DirAGreetingBlock,
  DirAUserBubble, DirAAu7oReply, DirAIssueAttachment, DirAMapAttachment,
  DirAComposer, chipStyle,
});
