/* Au7o · Mobile A3 hub — SIGNED-IN conversation-first hub on mobile.
   Same vocabulary as MobileA2Hub, but personalized:
   - Header includes user avatar
   - Au7o auto-loads BOTH the maintenance schedule AND the known-issues attachment
   - Maintenance schedule uses a vertical timeline (better for narrow viewports than the web horizontal track)
*/

function MobileA3Hub({ vehicle = WEB_VEHICLE, user = { name:"Marcus", initials:"MR" }, diagnose = null }) {
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

        {/* DIAGNOSE WITH CAMERA — promote the snap-to-diagnose feature */}
        <div style={{ marginTop: 12 }}>
          <MobileA3DiagnoseCard/>
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

        {/* DIAGNOSIS TURN — appended when the user arrives from "Try a photo diagnosis" */}
        {diagnose && <MobileA3DiagnoseTurn state={diagnose}/>}
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
          <span style={{ flex: 1, fontSize: 13, color:"var(--slate-400)" }}>{diagnose === "analyzing" ? "Au7o is analyzing your photo…" : "Ask Au7o anything…"}</span>
          <button style={{ width: 28, height: 28, borderRadius:"50%", background:"var(--paper-2)", border:"none", display:"inline-flex", alignItems:"center", justifyContent:"center", color:"var(--slate-500)" }}>
            <Icon name="mic" size={13}/>
          </button>
          <button title="Diagnose with camera" style={{ width: 30, height: 30, borderRadius:"50%", background:"var(--au7o-blue)", border:"none", display:"inline-flex", alignItems:"center", justifyContent:"center", color:"#fff" }}>
            <Icon name="camera" size={14}/>
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

// ─── Diagnosis turn (appended to the live hub conversation) ──────
// state: "analyzing" → Au7o working inline · "result" → match card lands
function MobileA3DiagnoseTurn({ state = "result" }) {
  return (
    <div style={{ marginTop: 22 }}>
      {/* fresh-turn divider */}
      <div style={{ display:"flex", alignItems:"center", gap: 10, marginBottom: 12 }}>
        <span style={{ flex: 1, height: 1, background:"var(--paper-line)" }}/>
        <span className="mono" style={{ fontSize: 9, color:"var(--slate-400)", letterSpacing:"0.06em", fontWeight: 600 }}>YOUR PHOTO · JUST NOW</span>
        <span style={{ flex: 1, height: 1, background:"var(--paper-line)" }}/>
      </div>

      {/* user photo bubble */}
      <div style={{ display:"flex", justifyContent:"flex-end" }}>
        <div style={{ maxWidth:"82%" }}>
          <div style={{ borderRadius:"14px 14px 4px 14px", overflow:"hidden", border:"3px solid var(--ink)", position:"relative", height: 118 }}>
            <HeroEngineBay/>
            <div style={{ position:"absolute", bottom: 6, left: 6, padding:"3px 7px", background:"rgba(11,18,32,0.7)", borderRadius: 6, fontSize: 9, color:"#fff", fontFamily:"var(--font-mono)" }}>PHOTO · ENGINE BAY</div>
          </div>
          <div style={{ background:"var(--ink)", color:"#fff", padding:"7px 12px", borderRadius:"0 0 4px 14px", fontSize: 12.5, marginTop:-2 }}>
            Hearing a squeal from here on cold start
          </div>
        </div>
      </div>

      {state === "analyzing" ? (
        /* INLINE ANALYZING */
        <div style={{ marginTop: 12, display:"flex", gap: 8, alignItems:"flex-start" }}>
          <img src="brand/au7o-mascot.png" alt="" style={{ width: 22, height: 22, marginTop: 2 }}/>
          <div style={{ flex: 1, background:"#fff", border:"1px solid var(--paper-line)", borderRadius:"4px 14px 14px 14px", padding:"12px 14px", boxShadow:"var(--shadow-1)" }}>
            <div style={{ display:"flex", alignItems:"center", gap: 8, marginBottom: 10 }}>
              <span className="au7o-pulse-soft" style={{ width: 8, height: 8, borderRadius:"50%", background:"var(--au7o-blue)" }}/>
              <span style={{ fontSize: 12.5, fontWeight: 600 }}>Analyzing your photo…</span>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap: 7 }}>
              {[
                { t:"Identifying components in frame", done: true },
                { t:"Matching against 4,200+ known issues", active: true },
                { t:"Finding the part that fits your trim" },
              ].map((s,i)=>(
                <div key={i} style={{ display:"flex", alignItems:"center", gap: 9 }}>
                  <span style={{ width: 16, height: 16, borderRadius:"50%", flexShrink: 0, background: s.done?"var(--ok)":s.active?"var(--au7o-blue)":"var(--paper-2)", border: s.done||s.active?"none":"1px solid var(--paper-line)", display:"inline-flex", alignItems:"center", justifyContent:"center", color:"#fff" }}>
                    {s.done ? <Icon name="check" size={9}/> : s.active ? <span className="au7o-pulse-soft" style={{ width: 6, height: 6, borderRadius:"50%", background:"#fff" }}/> : null}
                  </span>
                  <span style={{ fontSize: 11.5, fontWeight: s.active?600:500, color: s.done||s.active?"var(--ink)":"var(--slate-500)" }}>{s.t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* RESULT */
        <React.Fragment>
          <div style={{ marginTop: 12, display:"flex", gap: 8, alignItems:"flex-start" }}>
            <img src="brand/au7o-mascot.png" alt="" style={{ width: 22, height: 22, marginTop: 2 }}/>
            <p style={{ flex: 1, fontSize: 12.5, color:"var(--ink)", lineHeight: 1.5, margin: 0 }}>
              That squeal plus the glazing I can see is a <b>known issue on your SRT 392</b> — here's what I found:
            </p>
          </div>

          <div style={{ marginTop: 10, marginLeft: 30, background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 14, overflow:"hidden", boxShadow:"var(--shadow-1)" }}>
            <div style={{ padding:"11px 13px", borderBottom:"1px solid var(--paper-line)", display:"flex", alignItems:"center", gap: 9 }}>
              <span className="status-dot warn" style={{ width: 8, height: 8 }}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, letterSpacing:"-0.01em" }}>Serpentine Belt — Glazed</div>
                <div className="mono" style={{ fontSize: 9, color:"var(--slate-500)", marginTop: 1 }}>MATCHES 1,840 KNOWN REPORTS</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div className="mono" style={{ fontSize: 15, fontWeight: 700, color:"var(--ok)", lineHeight: 1 }}>92%</div>
                <div style={{ fontSize: 7.5, color:"var(--slate-500)", letterSpacing:"0.06em", fontWeight: 600 }}>MATCH</div>
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", borderBottom:"1px solid var(--paper-line)" }}>
              {[{k:"SEVERITY",v:"Medium",c:"var(--warn)"},{k:"FIX",v:"30 min",c:"var(--ink)"},{k:"DIY",v:"$48",c:"var(--ok)"}].map((s,i)=>(
                <div key={i} style={{ padding:"9px 11px", borderRight: i<2?"1px solid var(--paper-line)":"none" }}>
                  <div className="eyebrow" style={{ fontSize: 8 }}>{s.k}</div>
                  <div className="mono" style={{ fontSize: 12.5, fontWeight: 700, color: s.c, marginTop: 1 }}>{s.v}</div>
                </div>
              ))}
            </div>
            <div style={{ padding:"10px 13px", background:"rgba(59,130,246,0.04)", display:"flex", alignItems:"center", gap: 9 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background:"#fff", border:"1px solid var(--paper-line)", display:"inline-flex", alignItems:"center", justifyContent:"center", flexShrink: 0 }}>
                <Icon name="settings" size={16} style={{ color:"var(--slate-500)" }}/>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11.5, fontWeight: 600, lineHeight: 1.2 }}>Gates Micro-V Belt</div>
                <div className="mono" style={{ fontSize: 9, color:"var(--slate-500)" }}>K060841 · FITS YOUR 6.4L</div>
              </div>
              <button className="chip chip-sm" style={{ fontSize: 11, background:"var(--ink)", color:"#fff", border:"none" }}>
                <Icon name="spark" size={10}/> $48
              </button>
            </div>
          </div>

          {/* ties back to the maintenance schedule above */}
          <div style={{ marginTop: 12, display:"flex", gap: 8, alignItems:"flex-start" }}>
            <img src="brand/au7o-mascot.png" alt="" style={{ width: 22, height: 22, marginTop: 2 }}/>
            <p style={{ flex: 1, fontSize: 12.5, color:"var(--ink)", lineHeight: 1.5, margin: 0 }}>
              It's a 30-minute job. Want me to walk you through it, or bundle it with your <b>overdue brake fluid</b> above?
            </p>
          </div>
          <div style={{ marginTop: 12, marginLeft: 30, display:"flex", flexDirection:"column", gap: 7 }}>
            {[
              { icon:"book", text:"Walk me through the replacement" },
              { icon:"wrench", text:"Bundle with my overdue brake fluid" },
              { icon:"map", text:"Find a shop near me" },
            ].map((s, i) => (
              <button key={i} style={{ display:"flex", alignItems:"center", gap: 10, padding:"10px 13px", background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 12, fontFamily:"var(--font-sans)", fontSize: 12.5, color:"var(--ink)", textAlign:"left", cursor:"pointer" }}>
                <Icon name={s.icon} size={13} style={{ color:"var(--au7o-blue)" }}/>
                <span style={{ flex: 1 }}>{s.text}</span>
                <Icon name="chevron" size={10} style={{ color:"var(--slate-400)" }}/>
              </button>
            ))}
          </div>
        </React.Fragment>
      )}
    </div>
  );
}

// ─── Maintenance schedule card (mobile, vertical timeline) ────────
function MobileA3MaintenanceCard() {
  const userMi = 64218;
  const [expanded, setExpanded] = React.useState(null);
  const [logged, setLogged] = React.useState({}); // { idx: mileage }
  const services = [
    { mi: 60000, label:"Brake fluid flush", note:"Last done @ 30k · 4 yr ago", status:"overdue", interval: 30000,
      need:"2× Mopar DOT 4 (1L) · 10mm flare wrench", time:"60–90 min", diy:"$66", shop:"$140+" },
    { mi: 65000, label:"Engine oil & filter", note:"Mobil 1 0W-40 · ~$78 DIY", status:"due-soon", primary: true, interval: 5500,
      need:"2× Mobil 1 0W-40 (5qt) · MO-899 filter", time:"30 min", diy:"$81", shop:"$120+" },
    { mi: 65000, label:"Tire rotation", note:"Pair with oil — save labor", status:"due-soon", interval: 7500,
      need:"No parts · floor jack + torque wrench", time:"30 min", diy:"$0", shop:"$40" },
    { mi: 75000, label:"Differential fluid", note:"in 10,782 mi", status:"upcoming", interval: 30000,
      need:"75W-140 gear oil · RTV sealant", time:"45 min", diy:"$55", shop:"$160+" },
    { mi: 80000, label:"Coolant flush", note:"in 15,782 mi · 5-yr also", status:"upcoming", interval: 30000,
      need:"2 gal MOPAR OAT coolant", time:"60 min", diy:"$48", shop:"$150+" },
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
            const isLogged = logged[i] != null;
            const effStatus = isLogged ? "done" : s.status;
            const c = statusColor(effStatus);
            const isOpen = expanded === i;
            return (
              <div key={i} style={{ position:"relative", paddingBottom: 14 }}>
                {/* dot */}
                <span style={{
                  position:"absolute", left: -22, top: 4,
                  width: s.primary && !isLogged ? 14 : 10, height: s.primary && !isLogged ? 14 : 10, borderRadius:"50%",
                  background: effStatus === "upcoming" ? "#fff" : c,
                  border: `2px solid ${c}`,
                  boxShadow: s.primary && !isLogged ? "0 0 0 4px rgba(59,130,246,0.18)" : "none",
                  marginLeft: s.primary && !isLogged ? -2 : 0,
                  display:"inline-flex", alignItems:"center", justifyContent:"center",
                }}>
                  {isLogged && <Icon name="check" size={6} style={{ color:"#fff" }}/>}
                </span>

                {/* tappable row */}
                <button onClick={() => setExpanded(isOpen ? null : i)} style={{
                  width:"100%", textAlign:"left", background:"transparent", border:"none",
                  padding: 0, cursor:"pointer", fontFamily:"var(--font-sans)",
                  display:"flex", alignItems:"flex-start", gap: 8,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display:"flex", alignItems:"baseline", gap: 8, flexWrap:"wrap" }}>
                      <span style={{ fontSize: 12.5, fontWeight: 600, letterSpacing:"-0.005em" }}>{s.label}</span>
                      <span className="mono" style={{ fontSize: 9.5, fontWeight: 700, color: c, letterSpacing:"0.04em" }}>{statusLabel(effStatus)}</span>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap: 8, marginTop: 2 }}>
                      <span className="mono" style={{ fontSize: 10, color:"var(--slate-500)", fontWeight: 600 }}>{(s.mi/1000)}k mi</span>
                      <span style={{ fontSize: 11, color:"var(--slate-700)" }}>· {isLogged ? `Done @ ${logged[i].toLocaleString()} mi` : s.note}</span>
                    </div>
                  </div>
                  <span style={{
                    flexShrink: 0, width: 20, height: 20, borderRadius: 6, marginTop: 1,
                    background:"var(--paper-2)", border:"1px solid var(--paper-line)",
                    display:"inline-flex", alignItems:"center", justifyContent:"center",
                    color:"var(--slate-500)",
                    transform: isOpen ? "rotate(180deg)" : "none", transition:"transform .2s ease",
                  }}>
                    <Icon name="chevron-down" size={10}/>
                  </span>
                </button>

                {/* expanded detail + log flow */}
                {isOpen && (
                  <div style={{ marginTop: 10, background:"var(--paper-2)", border:`1px solid ${isLogged ? "rgba(31,138,91,0.3)" : "var(--paper-line)"}`, borderRadius: 10, padding: 12 }}>
                    {!isLogged ? (
                      <MobileServiceDetail
                        service={s}
                        accent={c}
                        currentMi={userMi}
                        onLogged={(mi) => { setLogged(p => ({ ...p, [i]: mi })); }}
                      />
                    ) : (
                      <MobileLogDone service={s} mi={logged[i]} onUndo={() => setLogged(p => { const n = {...p}; delete n[i]; return n; })}/>
                    )}
                  </div>
                )}
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

// ─── Mobile service detail + log-completion form ─────────────────
function MobileServiceDetail({ service, accent, currentMi, onLogged }) {
  const [logging, setLogging] = React.useState(false);
  const [mi, setMi] = React.useState(currentMi);
  const [who, setWho] = React.useState("diy");

  if (!logging) {
    return (
      <div style={{ display:"flex", flexDirection:"column", gap: 10 }}>
        {/* quick facts */}
        <div style={{ display:"flex", gap: 6 }}>
          {[
            { k:"TIME", v: service.time },
            { k:"DIY", v: service.diy, c:"var(--ok)" },
            { k:"SHOP", v: service.shop },
          ].map((f, i) => (
            <div key={i} style={{ flex: 1, background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 8, padding:"6px 8px" }}>
              <div className="eyebrow" style={{ fontSize: 8 }}>{f.k}</div>
              <div className="mono" style={{ fontSize: 12, fontWeight: 700, color: f.c || "var(--ink)", marginTop: 1 }}>{f.v}</div>
            </div>
          ))}
        </div>
        {/* what you need */}
        <div style={{ display:"flex", gap: 7, alignItems:"flex-start" }}>
          <Icon name="wrench" size={11} style={{ color:"var(--slate-500)", marginTop: 2, flexShrink: 0 }}/>
          <span style={{ fontSize: 11.5, color:"var(--slate-700)", lineHeight: 1.4 }}>{service.need}</span>
        </div>
        {/* actions */}
        <div style={{ display:"flex", gap: 6 }}>
          <button onClick={() => setLogging(true)} style={{
            flex: 1, padding:"9px 0", background:"var(--ink)", color:"#fff", border:"none", borderRadius: 8,
            fontSize: 12, fontWeight: 600, cursor:"pointer", fontFamily:"var(--font-sans)",
            display:"inline-flex", alignItems:"center", justifyContent:"center", gap: 6,
          }}>
            <Icon name="check" size={12}/> Mark done + log mileage
          </button>
          <button className="chip chip-sm" style={{ justifyContent:"center", fontSize: 11.5 }}>
            <Icon name="book" size={11}/> Guide
          </button>
        </div>
      </div>
    );
  }

  // logging form
  return (
    <div style={{ display:"flex", flexDirection:"column", gap: 10 }}>
      <div style={{ fontSize: 11.5, fontWeight: 600, color:"var(--ink)" }}>What was the odometer reading?</div>
      <div style={{ position:"relative" }}>
        <input
          type="number"
          value={mi}
          onChange={(e) => setMi(e.target.value)}
          style={{
            width:"100%", boxSizing:"border-box", padding:"8px 50px 8px 12px",
            fontFamily:"var(--font-mono)", fontSize: 20, fontWeight: 700, letterSpacing:"-0.02em",
            background:"#fff", border:`1px solid ${accent}`, borderRadius: 8, color:"var(--ink)",
          }}
        />
        <span className="mono" style={{ position:"absolute", right: 12, top:"50%", transform:"translateY(-50%)", fontSize: 11, color:"var(--slate-500)", fontWeight: 600, pointerEvents:"none" }}>miles</span>
      </div>
      <button onClick={() => setMi(currentMi)} className="chip chip-sm" style={{ fontSize: 11, alignSelf:"flex-start" }}>
        Use current · {currentMi.toLocaleString()}
      </button>
      {/* who */}
      <div style={{ display:"flex", gap: 6 }}>
        {[{ k:"diy", l:"I did it" }, { k:"shop", l:"A shop" }].map(opt => (
          <button key={opt.k} onClick={() => setWho(opt.k)} style={{
            flex: 1, padding:"8px 0", fontSize: 12, fontWeight: 600, cursor:"pointer",
            fontFamily:"var(--font-sans)", borderRadius: 8,
            background: who === opt.k ? accent : "#fff",
            color: who === opt.k ? "#fff" : "var(--slate-600)",
            border: `1px solid ${who === opt.k ? accent : "var(--paper-line)"}`,
          }}>{opt.l}</button>
        ))}
      </div>
      {/* confirm */}
      <div style={{ display:"flex", gap: 6 }}>
        <button onClick={() => onLogged(Number(mi))} style={{
          flex: 1, padding:"10px 0", background: accent, color:"#fff", border:"none", borderRadius: 8,
          fontSize: 12.5, fontWeight: 600, cursor:"pointer", fontFamily:"var(--font-sans)",
          display:"inline-flex", alignItems:"center", justifyContent:"center", gap: 6,
        }}>
          <Icon name="check" size={12}/> Log at {Number(mi).toLocaleString()} mi
        </button>
        <button onClick={() => setLogging(false)} className="chip chip-sm" style={{ justifyContent:"center", fontSize: 11.5 }}>Cancel</button>
      </div>
    </div>
  );
}

// ─── Mobile log-completion confirmation ──────────────────────────
function MobileLogDone({ service, mi, onUndo }) {
  const nextDue = Number(mi) + (service.interval || 7500);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap: 10 }}>
      <div style={{ display:"flex", alignItems:"center", gap: 8 }}>
        <span style={{ width: 24, height: 24, borderRadius:"50%", background:"var(--ok)", color:"#fff", display:"inline-flex", alignItems:"center", justifyContent:"center", flexShrink: 0 }}>
          <Icon name="check" size={13}/>
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700 }}>Logged to your history</div>
          <div style={{ fontSize: 11, color:"var(--slate-700)" }}>Completed at <span className="mono" style={{ fontWeight: 600, color:"var(--ink)" }}>{Number(mi).toLocaleString()} mi</span></div>
        </div>
        <button onClick={onUndo} style={{ background:"transparent", border:"none", fontSize: 11, color:"var(--slate-500)", cursor:"pointer", fontFamily:"var(--font-sans)", textDecoration:"underline", flexShrink: 0 }}>Undo</button>
      </div>
      <div style={{ display:"flex", gap: 8, paddingTop: 10, borderTop:"1px solid rgba(31,138,91,0.2)" }}>
        <div style={{ flex: 1 }}>
          <div className="eyebrow" style={{ fontSize: 8 }}>NEXT DUE</div>
          <div className="mono" style={{ fontSize: 13, fontWeight: 700, color:"var(--au7o-blue)", marginTop: 1 }}>{nextDue.toLocaleString()} mi</div>
        </div>
        <div style={{ flex: 1 }}>
          <div className="eyebrow" style={{ fontSize: 8 }}>STATUS</div>
          <div style={{ display:"inline-flex", alignItems:"center", gap: 4, marginTop: 3 }}>
            <span className="status-dot ok"/>
            <span style={{ fontSize: 12, fontWeight: 600 }}>Up to date</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Diagnose-with-camera card (promotes snap-to-diagnose) ───────
function MobileA3DiagnoseCard() {
  const uses = [
    { icon:"search", label:"Find a part" },
    { icon:"car", label:"Tread wear" },
    { icon:"mic", label:"Noisy sounds" },
    { icon:"alert", label:"Leaks & damage" },
  ];
  return (
    <div style={{
      borderRadius: 14, overflow:"hidden", boxShadow:"var(--shadow-1)",
      border:"1px solid var(--paper-line)", background:"#0B0E14", position:"relative",
    }}>
      {/* dark camera-feel header strip */}
      <div style={{ position:"relative", padding:"14px 14px 13px", background:"linear-gradient(135deg,#161d2c,#0B0E14)", overflow:"hidden" }}>
        {/* faint reticle motif in corner */}
        <div style={{ position:"absolute", right: -18, top:-18, width: 96, height: 96, borderRadius:"50%", border:"2px solid rgba(59,130,246,0.18)" }}/>
        <div style={{ position:"absolute", right: 6, top: 6, width: 48, height: 48, borderRadius:"50%", border:"2px solid rgba(59,130,246,0.28)" }}/>
        <div style={{ display:"flex", alignItems:"center", gap: 10, position:"relative" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background:"var(--au7o-blue)", display:"inline-flex", alignItems:"center", justifyContent:"center", flexShrink: 0, boxShadow:"0 4px 14px rgba(59,130,246,0.45)" }}>
            <Icon name="camera" size={18} style={{ color:"#fff" }}/>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color:"#fff", letterSpacing:"-0.01em" }}>Diagnose with your camera</div>
            <div style={{ fontSize: 11, color:"rgba(255,255,255,0.6)", marginTop: 1, lineHeight: 1.35 }}>
              Snap a photo or video — I'll match it to known issues and find the right part.
            </div>
          </div>
        </div>
      </div>

      {/* use-case chips on paper */}
      <div style={{ background:"#fff", padding:"10px 12px 12px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: 6 }}>
          {uses.map((u, i) => (
            <div key={i} style={{
              display:"flex", alignItems:"center", gap: 7,
              padding:"7px 9px", background:"var(--paper-2)", border:"1px solid var(--paper-line)", borderRadius: 9,
            }}>
              <Icon name={u.icon} size={12} style={{ color:"var(--slate-500)", flexShrink: 0 }}/>
              <span style={{ fontSize: 11.5, color:"var(--ink)", fontWeight: 500 }}>{u.label}</span>
            </div>
          ))}
        </div>
        <button style={{
          width:"100%", marginTop: 10, padding:"10px 0",
          background:"var(--ink)", color:"#fff", border:"none", borderRadius: 10,
          fontSize: 13, fontWeight: 600, cursor:"pointer", fontFamily:"var(--font-sans)",
          display:"inline-flex", alignItems:"center", justifyContent:"center", gap: 7,
        }}>
          <Icon name="camera" size={14}/> Open camera
        </button>
      </div>
    </div>
  );
}

Object.assign(window, {
  MobileA3Hub,
  MobileA3MaintenanceCard,
  MobileA3DiagnoseCard,
  MobileA3DiagnoseTurn,
  MobileServiceDetail,
  MobileLogDone,
});
