/* Au7o · Mobile A2 hub — conversation-first hub on mobile.
   Translates Direction A's web hub to a phone form factor.
   Uses the existing mobile design system (Phone, paper palette).
*/

function MobileA2Hub({ vehicle = WEB_VEHICLE, scenario = "default" }) {
  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", background:"var(--paper)", overflow:"hidden", position:"relative" }}>

      {/* Status bar slot is provided by the Phone frame; this is below it */}
      {/* App header */}
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

      {/* Scrollable conversation surface */}
      <div style={{ flex: 1, overflow:"auto", padding:"4px 16px 130px" }}>

        {/* Greeting — Au7o speaks first */}
        <div style={{ marginTop: 10 }}>
          <div style={{ display:"flex", alignItems:"center", gap: 8, marginBottom: 8 }}>
            <span className="au7o-pulse-soft" style={{ width: 6, height: 6, borderRadius:"50%", background:"var(--au7o-blue)" }}/>
            <span className="eyebrow" style={{ color:"var(--au7o-blue)", fontSize: 10 }}>AU7O · YOUR CHALLENGER</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing:"-0.02em", lineHeight: 1.2, textWrap:"pretty" }}>
            Morning, Ricardo.<br/>
            <span style={{ color:"var(--slate-500)" }}>What's on your mind today?</span>
          </h1>
          <p style={{ fontSize: 12.5, color:"var(--slate-700)", marginTop: 8, lineHeight: 1.5 }}>
            You're at 64,218 miles. <span style={{ color:"var(--crit)", fontWeight: 600 }}>2 issues</span> are common at this mileage — want to take a look?
          </p>
        </div>

        {/* Health attachment */}
        <div style={{ marginTop: 14, background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 14, overflow:"hidden", boxShadow:"var(--shadow-1)" }}>
          <div style={{ padding:"10px 14px", borderBottom:"1px solid var(--paper-line)", display:"flex", alignItems:"center", gap: 8 }}>
            <Icon name="alert" size={12} style={{ color:"var(--slate-500)" }}/>
            <span className="eyebrow" style={{ fontSize: 10 }}>COMMON AT 60K+ MILES</span>
            <span style={{ marginLeft:"auto", fontSize: 10, color:"var(--slate-400)" }} className="mono">2 ISSUES</span>
          </div>
          {[
            { name:"Driveshaft U-Joint", cost:"$300–$2,500", priority:"high", common:"~14% at 60k+" },
            { name:"EPS Rack Failure", cost:"$1,200–$2,800", priority:"high", common:"Recall S19" },
          ].map((iss,i,a) => (
            <div key={i} style={{
              padding:"10px 14px", display:"flex", alignItems:"center", gap: 10,
              borderBottom: i < a.length-1 ? "1px solid var(--paper-line)" : "none",
            }}>
              <span className="status-dot crit"/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.25 }}>{iss.name}</div>
                <div className="mono" style={{ fontSize: 10, color:"var(--slate-500)", marginTop: 2 }}>{iss.common}</div>
              </div>
              <div className="mono" style={{ fontSize: 11, color:"var(--ink)", fontWeight: 600 }}>{iss.cost}</div>
            </div>
          ))}
          <div style={{ padding:"8px 14px", display:"flex", gap: 6 }}>
            <button className="chip chip-sm" style={{ flex: 1, justifyContent:"center" }}>Diagnose mine</button>
            <button className="chip chip-sm" style={{ flex: 1, justifyContent:"center" }}>Find a shop</button>
          </div>
        </div>

        {/* User question bubble */}
        <div style={{ display:"flex", justifyContent:"flex-end", marginTop: 18 }}>
          <div style={{ background:"var(--ink)", color:"#fff", padding:"8px 12px", borderRadius:"14px 14px 4px 14px", fontSize: 13, maxWidth:"82%" }}>
            Plan a weekend trip to Big Sur
          </div>
        </div>

        {/* Au7o reply with map attachment */}
        <div style={{ marginTop: 12 }}>
          <div style={{ display:"flex", gap: 8, alignItems:"flex-start" }}>
            <img src="brand/au7o-mascot.png" alt="" style={{ width: 22, height: 22, marginTop: 2 }}/>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 12.5, color:"var(--ink)", lineHeight: 1.5, margin: 0 }}>
                329 mi round trip — your tank covers it with one stop. I picked a coffee detour in Carmel that's open early.
              </p>
            </div>
          </div>
          {/* Map card */}
          <div style={{ marginTop: 8, marginLeft: 30, background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 14, overflow:"hidden", boxShadow:"var(--shadow-1)" }}>
            <div style={{ height: 130, background:"linear-gradient(180deg,#FAF6E8,#F0EAD4)", position:"relative" }}>
              <svg viewBox="0 0 320 130" width="100%" height="100%" preserveAspectRatio="none" style={{ display:"block" }}>
                <path d="M0 95 C 60 80 80 50 130 45 S 240 70 290 35 L 320 30" stroke="#FFFFFF" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.8"/>
                <path d="M0 95 C 60 80 80 50 130 45 S 240 70 290 35 L 320 30" stroke="var(--au7o-blue)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                <g transform="translate(0,95)"><circle r="6" fill="#fff"/><circle r="3.5" fill="var(--au7o-blue)"/></g>
                <g transform="translate(130,45)"><circle r="6" fill="#fff" stroke="var(--paper-line)"/><text x="0" y="2.5" fontSize="8" textAnchor="middle">☕</text></g>
                <g transform="translate(290,35)"><circle r="7" fill="var(--ink)"/><circle r="3" fill="#fff"/></g>
              </svg>
            </div>
            <div style={{ padding:"10px 12px", display:"flex", alignItems:"center", gap: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600 }}>Berkeley → Big Sur</div>
                <div className="mono" style={{ fontSize: 10, color:"var(--slate-500)", marginTop: 1 }}>329 MI · 5H 24M · 1 STOP</div>
              </div>
              <button className="chip chip-sm" style={{ background:"var(--ink)", color:"#fff", border:"none" }}>
                <Icon name="map" size={10}/> Open in Drive
              </button>
            </div>
          </div>
        </div>

        {/* Suggestion chips */}
        <div style={{ marginTop: 22 }}>
          <div className="eyebrow" style={{ marginBottom: 8, fontSize: 10 }}>SUGGESTED FOR YOU</div>
          <div style={{ display:"flex", flexDirection:"column", gap: 6 }}>
            {[
              { icon:"alert", text:"What recalls apply to my Challenger?", tone:"crit" },
              { icon:"wrench", text:"Plan my next oil change", tone:"" },
              { icon:"search", text:"Why does my steering feel loose?", tone:"" },
              { icon:"spark", text:"Find a brake pad upgrade", tone:"" },
            ].map((s,i) => (
              <button key={i} style={{
                display:"flex", alignItems:"center", gap: 10,
                padding:"10px 12px", background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 12,
                fontFamily:"var(--font-sans)", fontSize: 12.5, color:"var(--ink)", textAlign:"left", cursor:"pointer",
              }}>
                <Icon name={s.icon} size={13} style={{ color: s.tone === "crit" ? "var(--crit)" : "var(--slate-500)" }}/>
                <span style={{ flex: 1 }}>{s.text}</span>
                <Icon name="chevron" size={10} style={{ color:"var(--slate-400)" }}/>
              </button>
            ))}
          </div>
        </div>

        {/* Recent threads */}
        <div style={{ marginTop: 22 }}>
          <div className="eyebrow" style={{ marginBottom: 8, fontSize: 10 }}>RECENT</div>
          <div style={{ display:"flex", flexDirection:"column", gap: 4 }}>
            {[
              { title:"EPS rack — what to ask the shop", when:"Yesterday" },
              { title:"Trip to Big Sur, charging-free", when:"3d ago" },
              { title:"OEM radiator — replace or upgrade?", when:"Last week" },
            ].map((t,i) => (
              <button key={i} style={{
                display:"flex", alignItems:"center", gap: 10, padding:"8px 4px",
                background:"transparent", border:"none", textAlign:"left", cursor:"pointer",
              }}>
                <Icon name="chat" size={11} style={{ color:"var(--slate-400)" }}/>
                <span style={{ flex: 1, fontSize: 12.5, color:"var(--ink)" }}>{t.title}</span>
                <span className="mono" style={{ fontSize: 10, color:"var(--slate-400)" }}>{t.when}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Composer — fixed at bottom */}
      <div style={{
        position:"absolute", left: 0, right: 0, bottom: 0,
        padding:"8px 12px 14px",
        background:"linear-gradient(180deg, rgba(247,243,234,0) 0%, rgba(247,243,234,0.9) 30%, var(--paper) 70%)",
      }}>
        <div style={{ display:"flex", gap: 6, marginBottom: 8, overflowX:"auto", paddingBottom: 4 }}>
          {["Recalls","Issues","Maintenance","Parts","Trip"].map((q,i) => (
            <button key={i} style={{
              flexShrink: 0,
              padding:"5px 10px", background:"rgba(255,255,255,0.85)", backdropFilter:"blur(10px)",
              border:"1px solid var(--paper-line)", borderRadius: 999,
              fontFamily:"var(--font-sans)", fontSize: 11.5, color:"var(--slate-700)", cursor:"pointer",
            }}>{q}</button>
          ))}
        </div>
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
        {/* Bottom tab nav */}
        <div style={{ display:"flex", justifyContent:"space-around", paddingTop: 10, marginTop: 4, borderTop:"1px solid var(--paper-line)" }}>
          {[
            { icon:"chat", label:"Ask", active: true },
            { icon:"list", label:"Garage" },
            { icon:"map", label:"Drive" },
            { icon:"user", label:"You" },
          ].map((t,i) => (
            <button key={i} style={{
              display:"flex", flexDirection:"column", alignItems:"center", gap: 2,
              background:"transparent", border:"none", cursor:"pointer",
              color: t.active ? "var(--ink)" : "var(--slate-400)",
            }}>
              <Icon name={t.icon} size={16}/>
              <span style={{ fontSize: 9.5, fontWeight: t.active ? 600 : 500 }}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Self-contained phone frame so the web redesign doc has no dep on the mobile system
function PhoneShell({ children, time = "10:34" }) {
  return (
    <div style={{
      width:"100%", height:"100%",
      background:"#0B1220", borderRadius: 44, padding: 10,
      boxShadow:"0 30px 60px rgba(11,18,32,0.25), inset 0 0 0 1px rgba(255,255,255,0.04)",
      display:"flex",
    }}>
      <div style={{
        flex: 1, background:"var(--paper)", borderRadius: 36, overflow:"hidden",
        position:"relative", display:"flex", flexDirection:"column",
      }}>
        {/* Notch */}
        <div style={{ position:"absolute", top: 8, left:"50%", transform:"translateX(-50%)", width: 110, height: 28, background:"#0B1220", borderRadius: 18, zIndex: 10 }}/>
        {/* Status bar */}
        <div style={{
          height: 44, padding:"0 22px",
          display:"flex", alignItems:"center", justifyContent:"space-between",
          fontFamily:"var(--font-mono)", fontSize: 13, fontWeight: 600, color:"var(--ink)",
          flexShrink: 0,
        }}>
          <span>{time}</span>
          <span style={{ display:"inline-flex", alignItems:"center", gap: 5 }}>
            <svg width="16" height="11" viewBox="0 0 16 11"><rect x="0" y="7" width="3" height="4" rx="0.5" fill="currentColor"/><rect x="4" y="5" width="3" height="6" rx="0.5" fill="currentColor"/><rect x="8" y="2" width="3" height="9" rx="0.5" fill="currentColor"/><rect x="12" y="0" width="3" height="11" rx="0.5" fill="currentColor" opacity="0.4"/></svg>
            <svg width="14" height="11" viewBox="0 0 14 11"><path d="M7 10.5a1.3 1.3 0 1 1 0-2.6 1.3 1.3 0 0 1 0 2.6z" fill="currentColor"/><path d="M2.5 6a6 6 0 0 1 9 0" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round"/><path d="M0.5 3a9.5 9.5 0 0 1 13 0" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round"/></svg>
            <span style={{ display:"inline-block", width: 22, height: 11, border:"1px solid currentColor", borderRadius: 3, position:"relative" }}>
              <span style={{ position:"absolute", inset: 1.5, width:"75%", background:"currentColor", borderRadius: 1 }}/>
            </span>
          </span>
        </div>
        <div style={{ flex: 1, overflow:"hidden", position:"relative" }}>{children}</div>
      </div>
    </div>
  );
}

Object.assign(window, { MobileA2Hub, PhoneShell });
