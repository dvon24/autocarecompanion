/* Au7o · Mobile A3 hub — SIGNED-IN conversation-first hub on mobile.
   Same vocabulary as MobileA2Hub, but personalized:
   - Header includes user avatar
   - Au7o auto-loads BOTH the maintenance schedule AND the known-issues attachment
   - Maintenance schedule uses a vertical timeline (better for narrow viewports than the web horizontal track)
*/

function MobileA3Hub({ vehicle = WEB_VEHICLE, user = { name:"Marcus", initials:"MR" } }) {
  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", background:"var(--paper)", overflow:"hidden", position:"relative" }}>

      {/* App header — vehicle pill + user avatar */}
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
        <div style={{ display:"flex", gap: 8, alignItems:"center" }}>
          <button style={{ width: 32, height: 32, borderRadius:"50%", background:"#fff", border:"1px solid var(--paper-line)", display:"inline-flex", alignItems:"center", justifyContent:"center", color:"var(--slate-500)" }}>
            <Icon name="list" size={14}/>
          </button>
          <button style={{ width: 32, height: 32, borderRadius:"50%", background:"linear-gradient(135deg, var(--au7o-blue), #1e3a8a)", border:"none", display:"inline-flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize: 11, fontWeight: 700 }}>
            {user.initials}
          </button>
        </div>
      </div>

      {/* Scrollable conversation surface */}
      <div style={{ flex: 1, overflow:"auto", padding:"4px 16px 130px" }}>

        {/* Greeting — personalized */}
        <div style={{ marginTop: 10 }}>
          <div style={{ display:"flex", alignItems:"center", gap: 8, marginBottom: 8 }}>
            <span className="au7o-pulse-soft" style={{ width: 6, height: 6, borderRadius:"50%", background:"var(--au7o-blue)" }}/>
            <span className="eyebrow" style={{ color:"var(--au7o-blue)", fontSize: 10 }}>WELCOME BACK · {user.name.toUpperCase()}</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing:"-0.02em", lineHeight: 1.2, textWrap:"pretty" }}>
            Service is due soon.<br/>
            <span style={{ color:"var(--slate-500)" }}>Here's what I'd handle next.</span>
          </h1>
          <p style={{ fontSize: 12.5, color:"var(--slate-700)", marginTop: 8, lineHeight: 1.5 }}>
            You're at <b>64,218 mi</b>. Two services land in the next 1,000 mi, and brake fluid is <span style={{ color:"#B45309", fontWeight: 600 }}>1 yr overdue</span>.
          </p>
        </div>

        {/* MAINTENANCE SCHEDULE — auto-loaded */}
        <div style={{ marginTop: 14 }}>
          <MobileA3MaintenanceCard/>
        </div>

        {/* User question bubble */}
        <div style={{ display:"flex", justifyContent:"flex-end", marginTop: 18 }}>
          <div style={{ background:"var(--ink)", color:"#fff", padding:"8px 12px", borderRadius:"14px 14px 4px 14px", fontSize: 13, maxWidth:"82%" }}>
            What else should I watch for at this mileage?
          </div>
        </div>

        {/* Au7o reply intro */}
        <div style={{ marginTop: 10, display:"flex", gap: 8, alignItems:"flex-start" }}>
          <img src="brand/au7o-mascot.png" alt="" style={{ width: 22, height: 22, marginTop: 2 }}/>
          <p style={{ fontSize: 12.5, color:"var(--ink)", lineHeight: 1.5, margin: 0, flex: 1 }}>
            Four issues fall in the typical window for your <b>SRT 392</b>. Two are safety-critical and one is covered by recall <b>S19</b>.
          </p>
        </div>

        {/* KNOWN ISSUES — auto-loaded, ranked */}
        <div style={{ marginTop: 10, marginLeft: 30, background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 14, overflow:"hidden", boxShadow:"var(--shadow-1)" }}>
          <div style={{ padding:"10px 14px", borderBottom:"1px solid var(--paper-line)", display:"flex", alignItems:"center", gap: 8 }}>
            <Icon name="alert" size={12} style={{ color:"var(--slate-500)" }}/>
            <span className="eyebrow" style={{ fontSize: 10 }}>4 KNOWN · YOUR TRIM</span>
            <span style={{ marginLeft:"auto", fontSize: 10, color:"#B45309", fontWeight: 600 }} className="mono">2 IN WINDOW</span>
          </div>
          {[
            { name:"Driveshaft U-Joint", cost:"$300–$2.5k", priority:"high", common:"~14% at 60k+", inWindow: true },
            { name:"EPS Rack Failure", cost:"FREE", priority:"high", common:"Recall S19", recall: true },
            { name:"OEM Radiator", cost:"$200–$800", priority:"med", common:"~6%" },
            { name:"ZF Harsh Shifting", cost:"$820–$2.5k", priority:"med", common:"~5%" },
          ].map((iss, i, a) => (
            <div key={i} style={{
              padding:"10px 14px", display:"flex", alignItems:"center", gap: 10,
              borderBottom: i < a.length-1 ? "1px solid var(--paper-line)" : "none",
              background: iss.inWindow ? "rgba(245,158,11,0.04)" : "#fff",
            }}>
              <span className={`status-dot ${iss.priority === "high" ? "crit" : "warn"}`}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.25 }}>
                  {iss.name}
                  {iss.recall && <span style={{ marginLeft: 6, fontSize: 8.5, fontWeight: 700, color:"#991B1B", background:"var(--crit-bg)", padding:"2px 5px", borderRadius: 3, fontFamily:"var(--font-mono)", letterSpacing:"0.04em" }}>S19</span>}
                </div>
                <div className="mono" style={{ fontSize: 10, color:"var(--slate-500)", marginTop: 2 }}>{iss.common}</div>
              </div>
              <div className="mono" style={{ fontSize: 11, color:"var(--ink)", fontWeight: 600 }}>{iss.cost}</div>
            </div>
          ))}
          <div style={{ padding:"8px 14px", display:"flex", gap: 6 }}>
            <button className="chip chip-sm" style={{ flex: 1, justifyContent:"center", background:"var(--ink)", color:"#fff", border:"none" }}>Book S19 free</button>
            <button className="chip chip-sm" style={{ flex: 1, justifyContent:"center" }}>See all</button>
          </div>
        </div>

        {/* Suggestion chips */}
        <div style={{ marginTop: 22 }}>
          <div className="eyebrow" style={{ marginBottom: 8, fontSize: 10 }}>SUGGESTED FOR YOU</div>
          <div style={{ display:"flex", flexDirection:"column", gap: 6 }}>
            {[
              { icon:"calendar", text:"Book the oil change + rotation together", tone:"" },
              { icon:"dollar", text:"Estimate cost for the whole service visit", tone:"" },
              { icon:"book", text:"DIY guide: brake fluid bleed for SRT 392", tone:"" },
              { icon:"map", text:"Plan a weekend drive after the service", tone:"" },
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
      </div>

      {/* Composer + tabs (same as A2) */}
      <div style={{
        position:"absolute", left: 0, right: 0, bottom: 0,
        padding:"8px 12px 14px",
        background:"linear-gradient(180deg, rgba(247,243,234,0) 0%, rgba(247,243,234,0.9) 30%, var(--paper) 70%)",
      }}>
        <div style={{ display:"flex", gap: 6, marginBottom: 8, overflowX:"auto", paddingBottom: 4 }}>
          {["Maintenance","Recalls","Issues","Parts","Trip"].map((q,i) => (
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

// ─── Maintenance schedule card (mobile, vertical timeline) ────────
function MobileA3MaintenanceCard() {
  const userMi = 64218;
  const services = [
    { mi: 60000, label:"Brake fluid flush", note:"Last done @ 30k · 4 yr ago", status:"overdue" },
    { mi: 65000, label:"Engine oil & filter", note:"Mobil 1 0W-40 · ~$78 DIY", status:"due-soon", primary: true },
    { mi: 65000, label:"Tire rotation", note:"Pair with oil — save labor", status:"due-soon" },
    { mi: 75000, label:"Differential fluid", note:"in 10,782 mi", status:"upcoming" },
    { mi: 80000, label:"Coolant flush", note:"in 15,782 mi · 5-yr also", status:"upcoming" },
  ];

  const statusColor = (s) => s === "overdue" ? "#B45309" : s === "due-soon" ? "var(--au7o-blue)" : s === "done" ? "var(--ok)" : "var(--slate-400)";
  const statusLabel = (s) => s === "overdue" ? "OVERDUE" : s === "due-soon" ? "DUE SOON" : s === "done" ? "DONE" : "UPCOMING";

  return (
    <div style={{
      background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 14,
      overflow:"hidden", boxShadow:"var(--shadow-1)",
    }}>
      {/* Card header */}
      <div style={{ padding:"12px 14px 10px", borderBottom:"1px solid var(--paper-line)" }}>
        <div style={{ display:"flex", alignItems:"center", gap: 8 }}>
          <Icon name="wrench" size={12} style={{ color:"var(--au7o-blue)" }}/>
          <span className="eyebrow" style={{ fontSize: 10, color:"var(--au7o-blue)" }}>MAINTENANCE SCHEDULE</span>
          <span style={{ marginLeft:"auto", fontSize: 9.5, fontWeight: 700, padding:"2px 6px", borderRadius: 4, background:"var(--warn-bg)", color:"#92400E", letterSpacing:"0.04em" }}>SOON</span>
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, marginTop: 6, letterSpacing:"-0.01em" }}>5 services tracked · 1 overdue · 2 due soon</div>
      </div>

      {/* Stat strip */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", borderBottom:"1px solid var(--paper-line)", background:"var(--paper-2)" }}>
        {[
          { k:"NOW", v:"64,218", u:"miles", color:"var(--ink)" },
          { k:"NEXT", v:"782", u:"mi to go", color:"var(--au7o-blue)" },
          { k:"YTD", v:"$340", u:"spent", color:"var(--ok)" },
        ].map((s,i) => (
          <div key={i} style={{ padding:"10px 12px", borderRight: i < 2 ? "1px solid var(--paper-line)" : "none", background:"#fff" }}>
            <div className="eyebrow" style={{ fontSize: 8.5 }}>{s.k}</div>
            <div className="mono" style={{ fontSize: 14, fontWeight: 700, color: s.color, marginTop: 2, letterSpacing:"-0.01em" }}>{s.v}</div>
            <div style={{ fontSize: 9.5, color:"var(--slate-500)", marginTop: 1 }}>{s.u}</div>
          </div>
        ))}
      </div>

      {/* Vertical mileage timeline */}
      <div style={{ padding:"14px 14px 6px", position:"relative" }}>
        {/* "you are here" pill at top */}
        <div style={{ display:"flex", alignItems:"center", gap: 8, marginBottom: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius:"50%", background:"var(--ink)", flexShrink: 0 }}/>
          <span className="mono" style={{ fontSize: 10, fontWeight: 700, color:"var(--ink)", letterSpacing:"0.04em" }}>YOU ARE HERE · 64,218 MI</span>
        </div>

        <div style={{ position:"relative", paddingLeft: 24 }}>
          {/* track line */}
          <div style={{ position:"absolute", left: 7, top: 0, bottom: 12, width: 2, background:"var(--paper-line)" }}/>
          {/* travelled overlay (above current = below in DOM since timeline ascends to future) */}

          {services.map((s, i) => {
            const c = statusColor(s.status);
            return (
              <div key={i} style={{ display:"flex", gap: 10, alignItems:"flex-start", paddingBottom: 14, position:"relative" }}>
                {/* dot */}
                <span style={{
                  position:"absolute", left: -22, top: 4,
                  width: s.primary ? 14 : 10, height: s.primary ? 14 : 10, borderRadius:"50%",
                  background: s.status === "upcoming" ? "#fff" : c,
                  border: `2px solid ${c}`,
                  boxShadow: s.primary ? "0 0 0 4px rgba(59,130,246,0.18)" : "none",
                  marginLeft: s.primary ? -2 : 0,
                }}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display:"flex", alignItems:"baseline", gap: 8, flexWrap:"wrap" }}>
                    <span style={{ fontSize: 12.5, fontWeight: 600, letterSpacing:"-0.005em" }}>{s.label}</span>
                    <span className="mono" style={{ fontSize: 9.5, fontWeight: 700, color: c, letterSpacing:"0.04em" }}>{statusLabel(s.status)}</span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap: 8, marginTop: 2 }}>
                    <span className="mono" style={{ fontSize: 10, color:"var(--slate-500)", fontWeight: 600 }}>{(s.mi/1000)}k mi</span>
                    <span style={{ fontSize: 11, color:"var(--slate-700)" }}>· {s.note}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action row */}
      <div style={{ padding:"8px 14px 12px", display:"flex", gap: 6, borderTop:"1px solid var(--paper-line)" }}>
        <button className="chip chip-sm" style={{ flex: 1, justifyContent:"center", background:"var(--ink)", color:"#fff", border:"none" }}>
          <Icon name="calendar" size={11}/> Book all 3 at one visit
        </button>
        <button className="chip chip-sm" style={{ justifyContent:"center" }}>
          <Icon name="dollar" size={11}/> Estimate
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { MobileA3Hub, MobileA3MaintenanceCard });
