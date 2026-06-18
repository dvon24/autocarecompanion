/* Direction A3 — Conversation-first, SIGNED IN
   Same A2 hub vocabulary, with personalized maintenance:
   - Sidebar gains a glanceable maintenance progress tile
   - Au7o's first reply is a rich Maintenance Schedule attachment (mileage timeline)
   - Greeting is personalized + scoped to "this car"
*/

function DirectionA3Hub({ vehicle = WEB_VEHICLE, user = { name: "Marcus", initials: "MR" } }) {
  const [input, setInput] = React.useState("");
  return (
    <div style={{ position:"relative", display:"flex", height: "100%", background:"var(--paper)" }}>
      {/* Left rail with vehicle + maintenance tile + recent threads + user footer */}
      <DirA3VehicleRail vehicle={vehicle} user={user}/>

      {/* Conversation column */}
      <div style={{ flex: 1, display:"flex", flexDirection:"column", position:"relative", overflow:"hidden" }}>
        <DirA3TopBar vehicle={vehicle} user={user}/>
        <div style={{ flex: 1, overflow:"hidden", position:"relative" }}>
          <AmbientBackground/>
          <div className="web-scroll" style={{ position:"relative", zIndex: 1, height:"100%", padding: "32px 56px 200px", display:"flex", flexDirection:"column", gap: 22 }}>
            <DirA3GreetingBlock vehicle={vehicle} user={user}/>

            {/* The hero — maintenance schedule served by Au7o */}
            <DirA3MaintenanceReply vehicle={vehicle}/>

            {/* Then known issues, auto-surfaced — same attachment as A2, just framed differently */}
            <DirA3UserBubble text="And what should I keep an eye on for this car at this mileage?"/>
            <DirA3KnownIssuesReply/>

            {/* Bonus: while-on-the-lift inspection items */}
            <DirA3UserBubble text="Anything else worth doing while it's on the lift?"/>
            <DirA3WhileOnLiftReply/>
          </div>
        </div>
        <DirA3Composer input={input} setInput={setInput}/>
      </div>
    </div>
  );
}

// ─── Left rail (signed-in) ────────────────────────────────────────
function DirA3VehicleRail({ vehicle, user }) {
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
            <span style={a3ChipStyle("warn")}>{vehicle.knownIssues} issues</span>
            <span style={a3ChipStyle("crit")}>{vehicle.recalls} recalls</span>
            <span style={a3ChipStyle("ok")}>{vehicle.partsCached} parts</span>
          </div>
        </div>
      </div>

      {/* Maintenance tile — only visible when signed in */}
      <div style={{ padding: "12px 14px 0" }}>
        <DirA3MaintenanceTile vehicle={vehicle}/>
      </div>

      <div style={{ padding: "16px 22px 6px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span className="eyebrow">Recent</span>
        <span className="mono" style={{ fontSize: 10, color:"var(--slate-400)" }}>{RECENT_THREADS.length}</span>
      </div>
      <div style={{ padding: "0 10px", display:"flex", flexDirection:"column", gap: 2 }}>
        {RECENT_THREADS.slice(0, 4).map((t, i) => (
          <button key={i} style={{
            display:"flex", alignItems:"center", gap: 10,
            background:"transparent", border:"none",
            padding: "9px 12px", borderRadius: 10, cursor:"pointer",
            textAlign:"left", color:"var(--ink)",
          }}>
            <Icon name={t.icon} size={14} style={{ color:"var(--slate-500)" }}/>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 12.5, fontWeight: 500, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{t.title}</div>
              <div style={{ fontSize: 10.5, color:"var(--slate-500)" }}>{t.when}</div>
            </div>
          </button>
        ))}
      </div>

      <div style={{ flex: 1 }}/>

      {/* User footer — signed-in affordance */}
      <div style={{ padding: "10px 12px", borderTop: "1px solid var(--paper-line)", display:"flex", alignItems:"center", gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background:"linear-gradient(135deg, var(--au7o-blue), #1e3a8a)",
          color:"#fff", display:"flex", alignItems:"center", justifyContent:"center",
          fontSize: 11.5, fontWeight: 700, letterSpacing:"0.02em",
        }}>{user.initials}</div>
        <div style={{ flex: 1, minWidth: 0, lineHeight: 1.1 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600 }}>{user.name}</div>
          <div className="mono" style={{ fontSize: 9.5, color:"var(--slate-500)", marginTop: 2 }}>SUBSCRIBER · 14 MO</div>
        </div>
        <button style={{ background:"transparent", border:"none", padding: 4, color:"var(--slate-500)", cursor:"pointer" }}>
          <Icon name="chevron" size={14}/>
        </button>
      </div>
    </aside>
  );
}

// ─── Sidebar maintenance tile — glanceable progress ──────────────
function DirA3MaintenanceTile({ vehicle }) {
  // Next service window: oil change at 65k (we're at 64,218 — 782 mi to go)
  const nextDue = 65000;
  const lastDue = 60000;
  const pct = Math.min(100, ((vehicle.miles - lastDue) / (nextDue - lastDue)) * 100);

  return (
    <button style={{
      width:"100%", textAlign:"left",
      background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 12,
      padding:"12px 14px", cursor:"pointer", display:"block",
    }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: 8 }}>
        <span className="eyebrow" style={{ fontSize: 9.5 }}>NEXT SERVICE</span>
        <span style={{ fontSize: 9.5, fontWeight: 700, color:"#92400E", background:"var(--warn-bg)", padding:"2px 6px", borderRadius: 4, letterSpacing:"0.04em" }}>SOON</span>
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, letterSpacing:"-0.01em" }}>Engine oil & filter</div>
      <div className="mono" style={{ fontSize: 10.5, color:"var(--slate-500)", marginTop: 2 }}>
        in <b style={{ color:"var(--ink)" }}>782 mi</b> · ~3 weeks
      </div>
      {/* progress bar */}
      <div style={{ marginTop: 10, height: 4, background:"var(--paper-line)", borderRadius: 2, overflow:"hidden", position:"relative" }}>
        <div style={{ width: `${pct}%`, height:"100%", background:"linear-gradient(90deg, var(--au7o-blue), #2563EB)", borderRadius: 2 }}/>
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", marginTop: 4 }}>
        <span className="mono" style={{ fontSize: 9.5, color:"var(--slate-400)" }}>60k</span>
        <span className="mono" style={{ fontSize: 9.5, color:"var(--slate-400)" }}>65k</span>
      </div>
    </button>
  );
}

// ─── Top bar (signed-in) ─────────────────────────────────────────
function DirA3TopBar({ vehicle, user }) {
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
        <span style={{ fontSize: 13, color:"var(--slate-700)" }}>Maintenance check-in</span>
      </div>
      <div style={{ display:"flex", gap: 8, alignItems:"center" }}>
        <button className="chip chip-sm"><Icon name="map" size={12}/> Open Drive</button>
        <button className="chip chip-sm"><Icon name="book" size={12}/> Library</button>
        <span style={{ width: 1, height: 18, background:"var(--paper-line)", margin:"0 4px" }}/>
        <button style={{
          padding:"5px 10px 5px 6px", display:"inline-flex", alignItems:"center", gap: 6,
          background:"transparent", border:"1px solid var(--paper-line)", borderRadius: 999,
          fontSize: 12, fontWeight: 500, color:"var(--ink)", cursor:"pointer",
        }}>
          <span style={{ width: 20, height: 20, borderRadius:"50%", background:"linear-gradient(135deg, var(--au7o-blue), #1e3a8a)", color:"#fff", fontSize: 9, fontWeight: 700, display:"inline-flex", alignItems:"center", justifyContent:"center" }}>{user.initials}</span>
          {user.name}
        </button>
      </div>
    </div>
  );
}

// ─── Greeting (personalized) ─────────────────────────────────────
function DirA3GreetingBlock({ vehicle, user }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap: 14, alignItems:"flex-start", maxWidth: 720 }}>
      <div style={{ display:"flex", alignItems:"center", gap: 10 }}>
        <div className="au7o-pulse-soft" style={{ width: 8, height: 8, borderRadius:"50%", background:"var(--au7o-blue)" }}/>
        <span className="eyebrow" style={{ color:"var(--au7o-blue)" }}>WELCOME BACK · {user.name.toUpperCase()}</span>
      </div>
      <h1 style={{ fontSize: 38, fontWeight: 600, letterSpacing:"-0.03em", lineHeight: 1.1, textWrap: "pretty" }}>
        Your Challenger is due for service soon. <span style={{ color:"var(--slate-400)" }}>Here's what I'd handle next.</span>
      </h1>
      <div style={{ display:"flex", flexWrap:"wrap", gap: 8, marginTop: 4 }}>
        <button className="chip"><Icon name="wrench" size={13} style={{ color:"var(--slate-500)" }}/> What's overdue?</button>
        <button className="chip"><Icon name="dollar" size={13} style={{ color:"var(--slate-500)" }}/> Estimate the next service</button>
        <button className="chip"><Icon name="calendar" size={13} style={{ color:"var(--slate-500)" }}/> Book at a local shop</button>
        <button className="chip"><Icon name="book" size={13} style={{ color:"var(--slate-500)" }}/> Show me the DIY guide</button>
      </div>
    </div>
  );
}

// ─── Au7o's primary reply: maintenance schedule attachment ────────
function DirA3MaintenanceReply({ vehicle }) {
  return (
    <div style={{ display:"flex", gap: 14, alignItems:"flex-start" }}>
      <img src="brand/au7o-mascot.png" alt="" style={{ width: 32, height: 32, marginTop: 2 }}/>
      <div style={{ flex: 1, display:"flex", flexDirection:"column", gap: 12, maxWidth: 860 }}>
        <div className="bubble-au7o">
          You're at <b className="mono">64,218 mi</b>. Two services land in the next 1,000 miles, plus a brake-fluid flush that's quietly overdue. Here's the full schedule for your <b>SRT 392</b>:
        </div>

        {/* The maintenance schedule visualization */}
        <DirA3MaintenanceSchedule vehicle={vehicle}/>

        <div className="bubble-au7o">
          The <b>oil change</b> is the easy one — Mobil 1 0W-40 plus a Mopar filter, ~$78 in parts, 30 minutes if you DIY. The <b>brake fluid</b> is the one I'd actually push — it's a year overdue and on a track-trim car that matters more than most.
        </div>

        <div style={{ display:"flex", gap: 8, flexWrap:"wrap" }}>
          <button className="btn-outline" style={{ padding:"8px 12px", fontSize: 13 }}>
            <Icon name="calendar" size={13}/> Book all three at one visit
          </button>
          <button className="chip chip-sm"><Icon name="dollar" size={12}/> Estimate cost</button>
          <button className="chip chip-sm"><Icon name="book" size={12}/> DIY guide for oil change</button>
        </div>
      </div>
    </div>
  );
}

// ─── The maintenance schedule visualization ──────────────────────
function DirA3MaintenanceSchedule({ vehicle }) {
  const [expandedKey, setExpandedKey] = React.useState("Brake fluid-60000");
  // Mileage-based service plot
  const userMi = vehicle.miles; // 64218
  const min = 50000;
  const max = 80000;
  const pct = (m) => Math.max(0, Math.min(1, (m - min) / (max - min))) * 100;

  const services = [
    { mi: 50000, label:"Cabin filter", status:"done", icon:"check", note:"Replaced @ 49,840" },
    { mi: 55000, label:"Oil change", status:"done", icon:"check", note:"Mobil 1 0W-40 · 54,810" },
    { mi: 60000, label:"Spark plugs", status:"done", icon:"check", note:"NGK · 60,120" },
    { mi: 60000, label:"Brake fluid", status:"overdue", icon:"alert", note:"Last done @ 30,210 — 4 yr ago", overdue: true,
      detail: {
        why: "DOT 4 brake fluid absorbs moisture from the air over time. After 2-3 years, water content climbs above 3%, lowering the boiling point — on a track-trim SRT 392 with 6-piston Brembos, that means soft pedal under hard braking and accelerated corrosion in the ABS module.",
        parts: [
          { name:"Mopar DOT 4 brake fluid (1L)", sku:"68001067AB", price:"$14", qty: 2, vendor:"Mopar OEM" },
          { name:"Speed-bleeder caps M10x1.0 (set of 4)", sku:"SB1010", price:"$26", qty: 1, vendor:"Russell" },
          { name:"Brake fluid catch bottle", sku:"7048", price:"$12", qty: 1, vendor:"Motive" },
        ],
        tools: ["10mm flare-nut wrench", "Turkey baster or syringe", "Clear vinyl tubing (4ft)", "Jack + jack stands"],
        time: "60–90 min DIY · 30 min at a shop",
        difficulty: "Beginner-friendly",
        cost: { diy: "$66", shop: "$140–$220" },
        guide: [
          { step: "Suck out old fluid from reservoir", detail:"Use a turkey baster. Don't let it run dry — refill with fresh DOT 4 immediately." },
          { step: "Start at the farthest wheel (rear passenger)", detail:"Crack the bleeder with a 10mm flare-nut wrench. Attach clear tubing into the catch bottle." },
          { step: "Pump and hold pedal, open bleeder, close, release", detail:"Repeat until clear fluid flows. Top up reservoir every 4 pumps — never let it drop below MIN." },
          { step: "Repeat: rear driver → front passenger → front driver", detail:"Same procedure. Watch for any bubbles in the line." },
          { step: "Final pedal feel test", detail:"Pedal should be firm with no sponginess. If soft, you've got air — rebleed the suspect corner." },
        ],
        videoUrl: "youtu.be/srt392-brake-bleed",
      },
    },
    { mi: 65000, label:"Oil & filter", status:"due-soon", icon:"clock", note:"in 782 mi · ~3 weeks", primary: true,
      detail: {
        why: "Your factory interval is 8,000 mi for the 6.4L Hemi but Au7o tracks you closer to 5,500 mi based on your driving profile (mostly highway, some spirited use). Cleaner oil = longer lifter and cam life.",
        parts: [
          { name:"Mobil 1 Truck & SUV 0W-40 (5qt jug)", sku:"MO0W40-5", price:"$34", qty: 2, vendor:"Mobil 1" },
          { name:"Mopar oil filter MO-899", sku:"68191349AB", price:"$11", qty: 1, vendor:"Mopar OEM" },
          { name:"Drain plug crush washer", sku:"6505592AA", price:"$2", qty: 1, vendor:"Mopar OEM" },
        ],
        tools: ["13mm socket for drain plug", "Oil filter wrench", "Oil drain pan (8qt+)", "Funnel"],
        time: "30 min DIY · 15 min at a shop",
        difficulty: "Beginner",
        cost: { diy: "$81", shop: "$110–$160" },
        guide: [
          { step: "Warm engine for 5 min then shut off", detail:"Warm oil drains faster and carries more contaminants out." },
          { step: "Remove drain plug, drain into pan", detail:"Takes ~10 min to fully drain. Replace crush washer when reinstalling." },
          { step: "Remove old filter, pre-fill new with oil", detail:"Smear fresh oil on the new gasket. Hand-tighten + 3/4 turn — don't use a wrench to install." },
          { step: "Reinstall drain plug to 25 ft-lb", detail:"Use a torque wrench. Cross-threading a hot aluminum pan is a $1,200 mistake." },
          { step: "Refill 7 quarts, check dipstick, run engine 2 min, recheck", detail:"6.4L Hemi takes 7 US quarts with filter change." },
        ],
        videoUrl: "youtu.be/srt392-oil-change",
      },
    },
    { mi: 65000, label:"Tire rotation", status:"due-soon", icon:"clock", note:"in 782 mi · pair with oil" },
    { mi: 75000, label:"Differential fluid", status:"upcoming", icon:"calendar", note:"in 10,782 mi" },
    { mi: 80000, label:"Coolant flush", status:"upcoming", icon:"calendar", note:"in 15,782 mi · 5-yr also" },
  ];

  return (
    <div style={{
      background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 16,
      padding: "20px 22px", boxShadow:"var(--shadow-1)",
      display:"flex", flexDirection:"column", gap: 18,
    }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", gap: 16 }}>
        <div>
          <div className="eyebrow" style={{ color:"var(--au7o-blue)" }}>MAINTENANCE SCHEDULE · 2015 SRT 392</div>
          <div style={{ fontSize: 18, fontWeight: 600, letterSpacing:"-0.02em", marginTop: 4, lineHeight: 1.2 }}>
            8 services tracked · <span style={{ color:"#B45309" }}>1 overdue</span> · <span style={{ color:"var(--au7o-blue)" }}>2 due soon</span>
          </div>
        </div>
        <div style={{ display:"flex", gap: 8 }}>
          <button className="chip chip-sm"><Icon name="calendar" size={11}/> Calendar view</button>
          <button className="chip chip-sm"><Icon name="settings" size={11}/> Edit history</button>
        </div>
      </div>

      {/* Stat strip */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap: 0, border:"1px solid var(--paper-line)", borderRadius: 10, overflow:"hidden", background:"var(--paper-2)" }}>
        {[
          { k:"NOW", v:"64,218", u:"miles", color:"var(--ink)" },
          { k:"NEXT DUE", v:"782", u:"miles to go", color:"var(--au7o-blue)" },
          { k:"OVERDUE", v:"1", u:"service", color:"#B45309" },
          { k:"YR-TO-DATE", v:"$340", u:"spent on maint.", color:"var(--ok)" },
        ].map((s,i) => (
          <div key={i} style={{ padding:"12px 14px", borderRight: i < 3 ? "1px solid var(--paper-line)" : "none", background: "#fff" }}>
            <div className="eyebrow" style={{ fontSize: 9 }}>{s.k}</div>
            <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: s.color, marginTop: 4, letterSpacing:"-0.02em" }}>{s.v}</div>
            <div style={{ fontSize: 10.5, color:"var(--slate-500)", marginTop: 1 }}>{s.u}</div>
          </div>
        ))}
      </div>

      {/* The mileage timeline */}
      <div style={{ position:"relative", padding: "32px 0 8px" }}>
        {/* Track */}
        <div style={{ position:"relative", height: 40 }}>
          {/* baseline */}
          <div style={{ position:"absolute", left: 0, right: 0, top: 18, height: 4, background:"var(--paper-line)", borderRadius: 2 }}/>
          {/* travelled portion (filled) */}
          <div style={{
            position:"absolute", left: 0, top: 18, height: 4,
            width: `${pct(userMi)}%`,
            background:"linear-gradient(90deg, var(--ok), var(--au7o-blue))",
            borderRadius: 2,
          }}/>

          {/* tick labels */}
          {[50000, 55000, 60000, 65000, 70000, 75000, 80000].map((m,i) => (
            <div key={i} style={{
              position:"absolute", left: `${pct(m)}%`, top: 0, transform:"translateX(-50%)",
              display:"flex", flexDirection:"column", alignItems:"center", gap: 2,
            }}>
              <span className="mono" style={{ fontSize: 10, color: m === 65000 ? "var(--au7o-blue)" : "var(--slate-400)", fontWeight: m === 65000 ? 700 : 500 }}>
                {m / 1000}k
              </span>
              <span style={{ width: 1, height: 8, background: m === 65000 ? "var(--au7o-blue)" : "var(--paper-line)" }}/>
            </div>
          ))}

          {/* Services as dots */}
          {services.map((s, i) => {
            const left = pct(s.mi);
            // Stagger dots so 60k items don't pile up
            const yOffset = (i % 2) * 6;
            const color = s.status === "done" ? "var(--ok)" :
                          s.status === "overdue" ? "#B45309" :
                          s.status === "due-soon" ? "var(--au7o-blue)" : "var(--slate-400)";
            const isUpcoming = s.status === "upcoming";
            return (
              <div key={i} style={{
                position:"absolute", left: `${left}%`, top: 14 + yOffset,
                transform:"translateX(-50%)",
              }}>
                <span style={{
                  display:"inline-block",
                  width: s.primary ? 14 : 10, height: s.primary ? 14 : 10,
                  borderRadius:"50%",
                  background: isUpcoming ? "#fff" : color,
                  border: `2px solid ${color}`,
                  boxShadow: s.primary ? "0 0 0 4px rgba(59,130,246,0.18)" : "none",
                }}/>
              </div>
            );
          })}

          {/* "you are here" marker */}
          <div style={{
            position:"absolute", left: `${pct(userMi)}%`, top: -10,
            transform:"translateX(-50%)",
            display:"flex", flexDirection:"column", alignItems:"center", pointerEvents:"none",
          }}>
            <span style={{ fontSize: 9.5, fontFamily:"var(--font-mono)", fontWeight: 700, color:"var(--ink)", background:"#fff", padding:"2px 6px", borderRadius: 4, border:"1px solid var(--paper-line)", letterSpacing:"0.04em" }}>
              YOU · 64,218
            </span>
            <span style={{ width: 2, height: 22, background:"var(--ink)", marginTop: 4 }}/>
          </div>
        </div>
      </div>

      {/* Service rows — grouped */}
      <div style={{ display:"flex", flexDirection:"column", gap: 0, marginTop: 4 }}>
        <DirA3ServiceGroup
          title="Overdue"
          subtitle="Past the recommended interval — handle this next."
          color="#B45309"
          services={services.filter(s => s.status === "overdue")}
          expandedKey={expandedKey}
          setExpandedKey={setExpandedKey}
        />
        <DirA3ServiceGroup
          title="Due in the next 1,000 miles"
          subtitle="Pair these in one visit to save labor."
          color="var(--au7o-blue)"
          services={services.filter(s => s.status === "due-soon")}
          expandedKey={expandedKey}
          setExpandedKey={setExpandedKey}
        />
        <DirA3ServiceGroup
          title="On the horizon"
          subtitle="More than 5,000 mi out — plan ahead."
          color="var(--slate-500)"
          services={services.filter(s => s.status === "upcoming")}
          expandedKey={expandedKey}
          setExpandedKey={setExpandedKey}
        />
        <DirA3ServiceGroup
          title="Recently completed"
          subtitle="Logged in the last 12 months."
          color="var(--ok)"
          services={services.filter(s => s.status === "done")}
          collapsed
          expandedKey={expandedKey}
          setExpandedKey={setExpandedKey}
        />
      </div>
    </div>
  );
}

function DirA3ServiceGroup({ title, subtitle, color, services, collapsed, expandedKey, setExpandedKey }) {
  if (services.length === 0) return null;
  return (
    <div style={{ borderTop:"1px solid var(--paper-line)", padding:"14px 0 12px" }}>
      <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom: 10, gap: 12 }}>
        <div style={{ display:"flex", alignItems:"center", gap: 8 }}>
          <span style={{ width: 6, height: 6, borderRadius:"50%", background: color }}/>
          <span style={{ fontSize: 12, fontWeight: 600, letterSpacing:"-0.005em" }}>{title}</span>
          <span className="mono" style={{ fontSize: 10, color:"var(--slate-400)", fontWeight: 600 }}>{services.length}</span>
        </div>
        <span style={{ fontSize: 11.5, color:"var(--slate-500)" }}>{subtitle}</span>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap: 6 }}>
        {(collapsed ? services.slice(0, 1) : services).map((s, i) => {
          const key = `${s.label}-${s.mi}`;
          return (
            <DirA3ServiceRow
              key={key}
              service={s}
              accent={color}
              isOpen={expandedKey === key}
              onToggle={() => setExpandedKey(expandedKey === key ? null : key)}
            />
          );
        })}
        {collapsed && services.length > 1 && (
          <button style={{
            background:"transparent", border:"none",
            padding:"6px 0", fontSize: 11.5, color:"var(--slate-500)", textAlign:"left", cursor:"pointer",
            fontFamily:"var(--font-sans)",
          }}>
            + show {services.length - 1} more completed
          </button>
        )}
      </div>
    </div>
  );
}

function DirA3ServiceRow({ service, accent, isOpen, onToggle }) {
  const hasDetail = !!service.detail;
  return (
    <div style={{
      background: service.primary ? "rgba(59,130,246,0.05)" : "var(--paper-2)",
      border: `1px solid ${isOpen ? accent : (service.primary ? "rgba(59,130,246,0.22)" : "var(--paper-line)")}`,
      borderRadius: 10,
      overflow:"hidden",
      transition:"border-color .15s ease",
    }}>
      {/* Collapsed row */}
      <button
        onClick={hasDetail ? onToggle : undefined}
        style={{
          width:"100%", textAlign:"left",
          display:"flex", alignItems:"center", gap: 14,
          padding:"10px 14px",
          background:"transparent", border:"none",
          cursor: hasDetail ? "pointer" : "default",
          fontFamily:"var(--font-sans)",
        }}>
        <span style={{
          width: 28, height: 28, borderRadius: 8, flexShrink: 0,
          background: "#fff", border: `1px solid ${accent}`,
          display:"inline-flex", alignItems:"center", justifyContent:"center",
          color: accent,
        }}>
          <Icon name={service.icon} size={13}/>
        </span>
        <div style={{ flex: 1, minWidth: 0, display:"flex", alignItems:"baseline", gap: 12, flexWrap:"wrap" }}>
          <span style={{ fontSize: 13, fontWeight: 600, letterSpacing:"-0.005em" }}>{service.label}</span>
          <span className="mono" style={{ fontSize: 11, color:"var(--slate-500)", fontWeight: 500 }}>{service.mi.toLocaleString()} mi</span>
          <span style={{ fontSize: 11.5, color:"var(--slate-700)" }}>· {service.note}</span>
        </div>
        <div style={{ display:"flex", gap: 6, flexShrink: 0, alignItems:"center" }}>
          {service.status !== "done" && (
            <span className="chip chip-sm" style={{ fontSize: 11 }}>
              <Icon name="calendar" size={11}/> Book
            </span>
          )}
          {hasDetail && (
            <span style={{
              display:"inline-flex", alignItems:"center", justifyContent:"center",
              width: 22, height: 22, borderRadius: 6,
              background:"#fff", border:"1px solid var(--paper-line)",
              color: isOpen ? accent : "var(--slate-500)",
              transform: isOpen ? "rotate(180deg)" : "rotate(0)",
              transition:"transform .2s ease, color .15s ease",
            }}>
              <Icon name="chevron-down" size={11}/>
            </span>
          )}
        </div>
      </button>

      {/* Expanded detail */}
      {isOpen && hasDetail && (
        <ServiceDetailPanel service={service} accent={accent}/>
      )}
    </div>
  );
}

function ServiceDetailPanel({ service, accent }) {
  const d = service.detail;
  const partsTotal = d.parts.reduce((sum, p) => sum + parseInt(p.price.replace(/[^0-9]/g, "")) * p.qty, 0);
  const [logState, setLogState] = React.useState("idle"); // idle | logging | done
  const [loggedMi, setLoggedMi] = React.useState(null);
  return (
    <div style={{
      background:"#fff",
      borderTop: `1px solid var(--paper-line)`,
      padding: "16px 14px 14px",
      display:"flex", flexDirection:"column", gap: 14,
    }}>
      {/* Why this matters */}
      <div>
        <div style={{ display:"flex", alignItems:"center", gap: 6, marginBottom: 6 }}>
          <Icon name="info" size={12} style={{ color: accent }}/>
          <span className="eyebrow" style={{ fontSize: 9.5, color: accent }}>WHY THIS MATTERS</span>
        </div>
        <p style={{ fontSize: 12.5, color:"var(--slate-700)", lineHeight: 1.5, margin: 0 }}>{d.why}</p>
      </div>

      {/* Two columns: parts + tools */}
      <div style={{ display:"grid", gridTemplateColumns:"1.4fr 1fr", gap: 12 }}>
        {/* Parts */}
        <div style={{ background:"var(--paper-2)", border:"1px solid var(--paper-line)", borderRadius: 8, padding: "10px 12px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: 8 }}>
            <span className="eyebrow" style={{ fontSize: 9.5 }}>WHAT YOU'LL NEED</span>
            <span className="mono" style={{ fontSize: 10.5, color:"var(--slate-500)", fontWeight: 600 }}>${partsTotal} total</span>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap: 4 }}>
            {d.parts.map((p, i) => (
              <div key={i} style={{ display:"flex", alignItems:"baseline", gap: 8, fontSize: 11.5, padding: "3px 0" }}>
                <span className="mono" style={{ width: 22, color:"var(--slate-400)", fontWeight: 600 }}>{p.qty}×</span>
                <span style={{ flex: 1, color:"var(--ink)", fontWeight: 500, lineHeight: 1.3 }}>{p.name}</span>
                <span className="mono" style={{ color:"var(--ink)", fontWeight: 600 }}>{p.price}</span>
              </div>
            ))}
          </div>
          <button style={{
            width:"100%", marginTop: 10, padding:"7px 0",
            background:"var(--ink)", color:"#fff", border:"none", borderRadius: 6,
            fontSize: 11.5, fontWeight: 600, cursor:"pointer", fontFamily:"var(--font-sans)",
            display:"inline-flex", alignItems:"center", justifyContent:"center", gap: 5,
          }}>
            <Icon name="spark" size={11}/> Order all parts · ${partsTotal}
          </button>
        </div>

        {/* Tools + time + difficulty */}
        <div style={{ display:"flex", flexDirection:"column", gap: 8 }}>
          <div style={{ background:"var(--paper-2)", border:"1px solid var(--paper-line)", borderRadius: 8, padding: "10px 12px" }}>
            <div className="eyebrow" style={{ fontSize: 9.5, marginBottom: 6 }}>TOOLS</div>
            <ul style={{ margin: 0, padding: 0, listStyle:"none", display:"flex", flexDirection:"column", gap: 3 }}>
              {d.tools.map((t, i) => (
                <li key={i} style={{ fontSize: 11, color:"var(--slate-700)", lineHeight: 1.35, display:"flex", gap: 6 }}>
                  <span style={{ color:"var(--slate-400)" }}>·</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: 6 }}>
            <div style={{ background:"var(--paper-2)", border:"1px solid var(--paper-line)", borderRadius: 8, padding: "8px 10px" }}>
              <div className="eyebrow" style={{ fontSize: 9 }}>DIY COST</div>
              <div className="mono" style={{ fontSize: 14, fontWeight: 700, color:"var(--ok)", marginTop: 2 }}>{d.cost.diy}</div>
            </div>
            <div style={{ background:"var(--paper-2)", border:"1px solid var(--paper-line)", borderRadius: 8, padding: "8px 10px" }}>
              <div className="eyebrow" style={{ fontSize: 9 }}>SHOP COST</div>
              <div className="mono" style={{ fontSize: 14, fontWeight: 700, color:"var(--ink)", marginTop: 2 }}>{d.cost.shop}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Step-by-step guide */}
      <div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: 8 }}>
          <div style={{ display:"flex", alignItems:"center", gap: 6 }}>
            <Icon name="book" size={12} style={{ color: accent }}/>
            <span className="eyebrow" style={{ fontSize: 9.5, color: accent }}>STEP-BY-STEP GUIDE</span>
          </div>
          <div style={{ display:"flex", gap: 10, fontSize: 11, color:"var(--slate-500)" }}>
            <span><Icon name="clock" size={10} style={{ display:"inline", verticalAlign:-1, marginRight: 3 }}/>{d.time}</span>
            <span style={{ fontWeight: 600, color: accent }}>{d.difficulty}</span>
          </div>
        </div>
        <ol style={{ margin: 0, padding: 0, listStyle:"none", display:"flex", flexDirection:"column", gap: 8 }}>
          {d.guide.map((g, i) => (
            <li key={i} style={{ display:"flex", gap: 10, alignItems:"flex-start" }}>
              <span style={{
                flexShrink: 0, width: 22, height: 22, borderRadius:"50%",
                background: accent, color:"#fff",
                display:"inline-flex", alignItems:"center", justifyContent:"center",
                fontSize: 11, fontWeight: 700, fontFamily:"var(--font-mono)",
              }}>{i + 1}</span>
              <div style={{ flex: 1, paddingTop: 1 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color:"var(--ink)", lineHeight: 1.3 }}>{g.step}</div>
                <div style={{ fontSize: 11.5, color:"var(--slate-700)", lineHeight: 1.45, marginTop: 2 }}>{g.detail}</div>
              </div>
            </li>
          ))}
        </ol>
        {d.videoUrl && (
          <a style={{
            display:"inline-flex", alignItems:"center", gap: 6,
            marginTop: 12, padding:"7px 12px",
            background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 6,
            fontSize: 11.5, color:"var(--ink)", fontWeight: 600, cursor:"pointer",
            textDecoration:"none",
          }}>
            <Icon name="camera" size={11} style={{ color: accent }}/>
            Watch the full video · <span className="mono" style={{ color:"var(--slate-500)", fontWeight: 500 }}>{d.videoUrl}</span>
          </a>
        )}
      </div>

      {/* Action row / log-completion flow */}
      {logState === "idle" && (
        <div style={{ display:"flex", gap: 8, paddingTop: 12, borderTop:"1px solid var(--paper-line)" }}>
          <button onClick={() => setLogState("logging")} style={{
            flex: 1, padding:"9px 12px",
            background:"var(--ink)", color:"#fff", border:"none", borderRadius: 8,
            fontSize: 12.5, fontWeight: 600, cursor:"pointer", fontFamily:"var(--font-sans)",
            display:"inline-flex", alignItems:"center", justifyContent:"center", gap: 6,
          }}>
            <Icon name="check" size={12}/> Mark complete + log to history
          </button>
          <button className="chip chip-sm" style={{ fontSize: 11.5 }}>
            <Icon name="calendar" size={11}/> Book shop instead
          </button>
          <button className="chip chip-sm" style={{ fontSize: 11.5 }}>
            <Icon name="chat" size={11}/> Ask Au7o
          </button>
        </div>
      )}

      {logState === "logging" && (
        <LogCompletionForm
          service={service}
          accent={accent}
          onCancel={() => setLogState("idle")}
          onConfirm={(mi) => { setLoggedMi(mi); setLogState("done"); }}
        />
      )}

      {logState === "done" && (
        <LogCompletionDone service={service} accent={accent} mi={loggedMi} onUndo={() => setLogState("idle")}/>
      )}
    </div>
  );
}

// ─── Log-completion form (set mileage + date + who did it) ───────
function LogCompletionForm({ service, accent, onCancel, onConfirm }) {
  const CURRENT_MI = 64218;
  const [mi, setMi] = React.useState(CURRENT_MI);
  const [who, setWho] = React.useState("diy");
  const [date, setDate] = React.useState("2026-06-06");
  const [cost, setCost] = React.useState(service.detail?.cost?.diy?.replace(/[^0-9]/g, "") || "");
  const [note, setNote] = React.useState("");
  const fieldStyle = {
    width:"100%", padding:"8px 10px", fontSize: 13, fontFamily:"var(--font-sans)",
    background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 8, color:"var(--ink)",
    boxSizing:"border-box",
  };
  const labelStyle = { fontSize: 9.5, letterSpacing:"0.07em", fontWeight: 700, color:"var(--slate-500)", textTransform:"uppercase", marginBottom: 5, display:"block" };
  return (
    <div style={{
      paddingTop: 14, borderTop:"1px solid var(--paper-line)",
      display:"flex", flexDirection:"column", gap: 14,
    }}>
      <div style={{ display:"flex", alignItems:"center", gap: 8 }}>
        <span style={{ width: 22, height: 22, borderRadius:"50%", background: accent, color:"#fff", display:"inline-flex", alignItems:"center", justifyContent:"center" }}>
          <Icon name="check" size={12}/>
        </span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, letterSpacing:"-0.005em" }}>Log this service to your history</div>
          <div style={{ fontSize: 11, color:"var(--slate-500)" }}>{service.label} · I'll reset the next-due interval automatically.</div>
        </div>
      </div>

      {/* Mileage — the headline field */}
      <div style={{ background:"var(--paper-2)", border:`1px solid ${accent}`, borderRadius: 10, padding:"12px 14px" }}>
        <label style={labelStyle}>Odometer reading when completed</label>
        <div style={{ display:"flex", alignItems:"center", gap: 10 }}>
          <div style={{ position:"relative", flex: 1 }}>
            <input
              type="number"
              value={mi}
              onChange={(e) => setMi(e.target.value)}
              style={{ ...fieldStyle, fontFamily:"var(--font-mono)", fontSize: 22, fontWeight: 700, letterSpacing:"-0.02em", padding:"6px 52px 6px 12px", background:"#fff" }}
            />
            <span className="mono" style={{ position:"absolute", right: 12, top:"50%", transform:"translateY(-50%)", fontSize: 12, color:"var(--slate-500)", fontWeight: 600, pointerEvents:"none" }}>miles</span>
          </div>
          <button onClick={() => setMi(CURRENT_MI)} className="chip chip-sm" style={{ fontSize: 11, flexShrink: 0 }}>
            Use current · {CURRENT_MI.toLocaleString()}
          </button>
        </div>
      </div>

      {/* Who did it + date */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: 12 }}>
        <div>
          <label style={labelStyle}>Who completed it</label>
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
        </div>
        <div>
          <label style={labelStyle}>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ ...fieldStyle, fontFamily:"var(--font-mono)", fontSize: 12.5 }}/>
        </div>
      </div>

      {/* Cost + note */}
      <div style={{ display:"grid", gridTemplateColumns:"110px 1fr", gap: 12 }}>
        <div>
          <label style={labelStyle}>Cost</label>
          <div style={{ position:"relative" }}>
            <span className="mono" style={{ position:"absolute", left: 10, top:"50%", transform:"translateY(-50%)", fontSize: 13, color:"var(--slate-500)", fontWeight: 600 }}>$</span>
            <input type="number" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="0" style={{ ...fieldStyle, fontFamily:"var(--font-mono)", paddingLeft: 22 }}/>
          </div>
        </div>
        <div>
          <label style={labelStyle}>Note (optional)</label>
          <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder={who === "diy" ? "Parts used, observations…" : "Shop name, invoice #…"} style={fieldStyle}/>
        </div>
      </div>

      {/* Confirm row */}
      <div style={{ display:"flex", gap: 8 }}>
        <button onClick={() => onConfirm(mi)} style={{
          flex: 1, padding:"10px 12px",
          background: accent, color:"#fff", border:"none", borderRadius: 8,
          fontSize: 13, fontWeight: 600, cursor:"pointer", fontFamily:"var(--font-sans)",
          display:"inline-flex", alignItems:"center", justifyContent:"center", gap: 6,
        }}>
          <Icon name="check" size={13}/> Log completion at {Number(mi).toLocaleString()} mi
        </button>
        <button onClick={onCancel} className="chip chip-sm" style={{ fontSize: 12 }}>Cancel</button>
      </div>
    </div>
  );
}

// ─── Confirmation after logging ──────────────────────────────────
function LogCompletionDone({ service, accent, mi, onUndo }) {
  // figure out next interval (most services here are mileage-interval based)
  const interval = service.label.toLowerCase().includes("oil") ? 5500 :
                   service.label.toLowerCase().includes("brake fluid") ? 30000 : 7500;
  const nextDue = (Number(mi) + interval);
  return (
    <div style={{ paddingTop: 14, borderTop:"1px solid var(--paper-line)" }}>
      <div style={{ background:"rgba(31,138,91,0.07)", border:"1px solid rgba(31,138,91,0.3)", borderRadius: 12, padding:"14px 16px" }}>
        <div style={{ display:"flex", alignItems:"center", gap: 10 }}>
          <span style={{ width: 30, height: 30, borderRadius:"50%", background:"var(--ok)", color:"#fff", display:"inline-flex", alignItems:"center", justifyContent:"center", flexShrink: 0 }}>
            <Icon name="check" size={15}/>
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, letterSpacing:"-0.01em" }}>Logged to your history</div>
            <div style={{ fontSize: 11.5, color:"var(--slate-700)", marginTop: 1 }}>
              {service.label} · completed at <span className="mono" style={{ fontWeight: 600, color:"var(--ink)" }}>{Number(mi).toLocaleString()} mi</span>
            </div>
          </div>
          <button onClick={onUndo} style={{ background:"transparent", border:"none", fontSize: 11.5, color:"var(--slate-500)", cursor:"pointer", fontFamily:"var(--font-sans)", textDecoration:"underline", flexShrink: 0 }}>Undo</button>
        </div>
        <div style={{ display:"flex", gap: 10, marginTop: 12, paddingTop: 12, borderTop:"1px solid rgba(31,138,91,0.2)" }}>
          <div style={{ flex: 1 }}>
            <div className="eyebrow" style={{ fontSize: 8.5 }}>NEXT DUE</div>
            <div className="mono" style={{ fontSize: 14, fontWeight: 700, color:"var(--au7o-blue)", marginTop: 2 }}>{nextDue.toLocaleString()} mi</div>
            <div style={{ fontSize: 10.5, color:"var(--slate-500)" }}>in {interval.toLocaleString()} mi · interval reset</div>
          </div>
          <div style={{ flex: 1 }}>
            <div className="eyebrow" style={{ fontSize: 8.5 }}>STATUS</div>
            <div style={{ display:"inline-flex", alignItems:"center", gap: 5, marginTop: 4 }}>
              <span className="status-dot ok"/>
              <span style={{ fontSize: 12.5, fontWeight: 600 }}>Up to date</span>
            </div>
          </div>
          <button className="chip chip-sm" style={{ fontSize: 11.5, alignSelf:"center" }}>
            <Icon name="book" size={11}/> View in history
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Known Issues reply (auto-loaded for signed-in users) ────────
function DirA3KnownIssuesReply() {
  const issues = [
    { name:"Driveshaft / U-Joint Failure", cost:"$300 – $2,500", priority:"high", common:"~14% at 60k+", inWindow: true },
    { name:"EPS Rack Failure", cost:"$1,200 – $2,800", priority:"high", common:"~9% — recall S19", recall: true },
    { name:"OEM Radiator Premature Failure", cost:"$200 – $800", priority:"medium", common:"~6%" },
    { name:"ZF 8-Speed Harsh Shifting", cost:"$820 – $2,500", priority:"medium", common:"~5%" },
  ];

  return (
    <div style={{ display:"flex", gap: 14, alignItems:"flex-start" }}>
      <img src="brand/au7o-mascot.png" alt="" style={{ width: 32, height: 32, marginTop: 2 }}/>
      <div style={{ flex: 1, display:"flex", flexDirection:"column", gap: 12, maxWidth: 720 }}>
        <div className="bubble-au7o">
          Four issues land in the typical window for your <b>SRT 392</b> at 64k miles. Two are <b>safety-critical</b>, and one is covered by the open <b>S19 recall</b> — let me handle the recall booking for you.
        </div>

        <div style={{
          background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 16,
          overflow:"hidden", boxShadow:"var(--shadow-1)",
        }}>
          <div style={{ padding:"12px 16px", borderBottom:"1px solid var(--paper-line)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ display:"flex", alignItems:"center", gap: 8 }}>
              <Icon name="alert" size={14} style={{ color:"var(--slate-500)" }}/>
              <span style={{ fontSize: 13, fontWeight: 600 }}>4 known issues</span>
              <span style={{ fontSize: 11, color:"var(--slate-500)" }}>· filtered to your trim · ranked by your mileage</span>
            </div>
            <button style={{ background:"transparent", border:"none", color:"var(--slate-500)", fontSize: 12, cursor:"pointer", display:"inline-flex", alignItems:"center", gap: 2 }}>
              See all <Icon name="chevron" size={12}/>
            </button>
          </div>
          {issues.map((iss,i) => (
            <div key={i} style={{
              padding:"12px 16px", display:"flex", alignItems:"center", gap: 12,
              borderBottom: i < issues.length-1 ? "1px solid var(--paper-line)" : "none",
              background: iss.inWindow ? "rgba(245,158,11,0.04)" : "#fff",
            }}>
              <span className={`status-dot ${iss.priority === "high" ? "crit" : "warn"}`}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>
                  {iss.name}
                  {iss.recall && <span style={{ ...a3ChipStyle("crit"), marginLeft: 8 }}>RECALL S19</span>}
                  {iss.inWindow && <span style={{ ...a3ChipStyle("warn"), marginLeft: 8 }}>IN WINDOW</span>}
                </div>
                <div style={{ fontSize: 11.5, color:"var(--slate-500)" }}>
                  <span className="mono">{iss.cost}</span> · {iss.common}
                </div>
              </div>
              <Icon name="chevron" size={14} style={{ color:"var(--slate-400)" }}/>
            </div>
          ))}
        </div>

        <div style={{ display:"flex", gap: 8, flexWrap:"wrap" }}>
          <button className="btn-outline" style={{ padding:"8px 12px", fontSize: 13 }}>
            <Icon name="calendar" size={13}/> Book recall S19 free
          </button>
          <button className="chip chip-sm"><Icon name="search" size={12}/> Open driveshaft thread</button>
        </div>
      </div>
    </div>
  );
}

// ─── Bonus reply: "while you're under the car" ────────────────────
function DirA3UserBubble({ text }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", marginTop: 14 }}>
      <div className="bubble-user">{text}</div>
    </div>
  );
}

function DirA3WhileOnLiftReply() {
  return (
    <div style={{ display:"flex", gap: 14, alignItems:"flex-start" }}>
      <img src="brand/au7o-mascot.png" alt="" style={{ width: 32, height: 32, marginTop: 2 }}/>
      <div style={{ flex: 1, display:"flex", flexDirection:"column", gap: 12, maxWidth: 720 }}>
        <div className="bubble-au7o">
          Three things make sense to inspect — none are services yet, but they're cheap to look at while you've already got eyes on the underside.
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap: 8 }}>
          {[
            { label:"U-joint play", reason:"Driveshaft is a known issue at 60k+ on this trim — 60-second check.", icon:"alert" },
            { label:"Diff vent hose", reason:"Cracks here cause slow leaks. Visual only.", icon:"alert" },
            { label:"Sway bar end-link bushings", reason:"Common at this mileage. If they're cracked, do them with the rotation.", icon:"alert" },
          ].map((it, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap: 12, padding:"10px 14px", background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 10 }}>
              <span style={{ width: 26, height: 26, borderRadius: 7, background:"var(--paper-2)", display:"inline-flex", alignItems:"center", justifyContent:"center", color:"var(--slate-500)", flexShrink: 0 }}>
                <Icon name={it.icon} size={12}/>
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600 }}>{it.label}</div>
                <div style={{ fontSize: 11.5, color:"var(--slate-500)", marginTop: 1 }}>{it.reason}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Composer ────────────────────────────────────────────────────
function DirA3Composer({ input, setInput }) {
  return (
    <div style={{
      position:"absolute", bottom: 0, left: 0, right: 0,
      padding: "16px 56px 28px",
      background:"linear-gradient(180deg, transparent, var(--paper) 32%)",
      display:"flex", justifyContent:"center",
    }}>
      <div style={{
        width:"100%", maxWidth: 860,
        background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 16,
        boxShadow:"var(--shadow-2)",
        padding:"12px 14px",
        display:"flex", flexDirection:"column", gap: 8,
      }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Au7o anything about your Challenger…"
          style={{
            border:"none", outline:"none", fontFamily:"var(--font-sans)",
            fontSize: 15, padding:"6px 4px", color:"var(--ink)", background:"transparent",
          }}
        />
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", gap: 6 }}>
            <button className="chip chip-sm"><Icon name="paperclip" size={11}/> Attach</button>
            <button className="chip chip-sm"><Icon name="camera" size={11}/> Photo</button>
            <button className="chip chip-sm"><Icon name="mic" size={11}/> Voice</button>
          </div>
          <button style={{
            display:"inline-flex", alignItems:"center", gap: 6,
            padding:"7px 12px", background:"var(--ink)", color:"#fff", border:"none", borderRadius: 8,
            fontSize: 12.5, fontWeight: 500, cursor:"pointer", fontFamily:"var(--font-sans)",
          }}>
            <Icon name="send" size={12}/> Send
          </button>
        </div>
      </div>
    </div>
  );
}

function a3ChipStyle(kind) {
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

Object.assign(window, {
  DirectionA3Hub,
  DirA3MaintenanceSchedule,
  DirA3MaintenanceTile,
  DirA3ServiceGroup,
  DirA3ServiceRow,
  ServiceDetailPanel,
  LogCompletionForm,
  LogCompletionDone,
});
