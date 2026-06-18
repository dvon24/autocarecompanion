/* ============================================================
   Au7o handoff · MobileOnboarding (3 steps: Welcome / How it works / Add your car) + DesktopOnboarding (welcome modal over a dimmed home). After onboarding the user is dropped into the hub (MobileA3Hub / DirectionA3Hub). Always offers a no-account 'just browse' path.
   ============================================================ */
/* Au7o · New-user onboarding — mobile (3 steps) + desktop (welcome) */

// ─── MOBILE ONBOARDING — 3-step intro ────────────────────────────
// step: 1 welcome · 2 how it works · 3 add your car
function MobileOnboarding({ step = 1 }) {
  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", background:"var(--paper)", overflow:"hidden" }}>
      {/* top: skip + progress */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 18px 6px" }}>
        <div style={{ display:"flex", gap: 5 }}>
          {[1,2,3].map(i => <span key={i} style={{ width: i===step?20:7, height: 7, borderRadius: 999, background: i<=step?"var(--au7o-blue)":"var(--paper-line)", transition:"width .2s" }}/>)}
        </div>
        <span style={{ fontSize: 12.5, color:"var(--slate-500)", fontWeight: 500 }}>{step < 3 ? "Skip" : ""}</span>
      </div>

      {step === 1 && <OnboardWelcome/>}
      {step === 2 && <OnboardHowItWorks/>}
      {step === 3 && <OnboardAddCar/>}
    </div>
  );
}

function OnboardWelcome() {
  return (
    <React.Fragment>
      <div style={{ flex: 1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"0 28px", textAlign:"center" }}>
        <div style={{ width: 100, height: 100, borderRadius: 28, background:"var(--au7o-blue-50)", display:"inline-flex", alignItems:"center", justifyContent:"center", marginBottom: 26 }}>
          <img src="brand/au7o-mascot.png" alt="" style={{ width: 62, height: 62 }}/>
        </div>
        <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing:"-0.03em", lineHeight: 1.08, margin: 0 }}>
          Meet Au7o — your<br/>car's co-pilot.
        </h1>
        <p style={{ fontSize: 15, color:"var(--slate-700)", lineHeight: 1.55, margin:"14px 0 0", maxWidth: 300 }}>
          Diagnose problems from a photo, browse known issues for your exact car, and stay ahead of maintenance.
        </p>
      </div>
      <OnboardFooter primary="Get started" secondary="I already have an account"/>
    </React.Fragment>
  );
}

function OnboardHowItWorks() {
  const steps = [
    { icon:"camera", title:"Show it the problem", body:"Snap a photo or video — a leak, worn tread, a strange part." },
    { icon:"search", title:"Au7o matches it", body:"Cross-referenced against 4,200+ documented issues for your trim." },
    { icon:"settings", title:"Get the part & fix", body:"The exact part, the cost, and how to do it — or book a shop." },
  ];
  return (
    <React.Fragment>
      <div style={{ flex: 1, display:"flex", flexDirection:"column", justifyContent:"center", padding:"0 26px" }}>
        <div className="eyebrow" style={{ color:"var(--au7o-blue)", marginBottom: 8 }}>HOW IT WORKS</div>
        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing:"-0.025em", lineHeight: 1.1, margin:"0 0 24px" }}>
          Don't know the part?<br/>Just show it.
        </h1>
        <div style={{ display:"flex", flexDirection:"column", gap: 18 }}>
          {steps.map((s,i)=>(
            <div key={i} style={{ display:"flex", gap: 14, alignItems:"flex-start" }}>
              <span style={{ width: 44, height: 44, borderRadius: 13, flexShrink: 0, background:"var(--au7o-blue-50)", display:"inline-flex", alignItems:"center", justifyContent:"center", color:"var(--au7o-blue)", position:"relative" }}>
                <Icon name={s.icon} size={20}/>
                <span className="mono" style={{ position:"absolute", top:-6, right:-6, width: 18, height: 18, borderRadius:"50%", background:"var(--ink)", color:"#fff", fontSize: 9, fontWeight: 700, display:"inline-flex", alignItems:"center", justifyContent:"center" }}>{i+1}</span>
              </span>
              <div style={{ flex: 1, paddingTop: 2 }}>
                <div style={{ fontSize: 15.5, fontWeight: 600, letterSpacing:"-0.01em" }}>{s.title}</div>
                <div style={{ fontSize: 13, color:"var(--slate-700)", lineHeight: 1.45, marginTop: 2 }}>{s.body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <OnboardFooter primary="Next"/>
    </React.Fragment>
  );
}

function OnboardAddCar() {
  return (
    <React.Fragment>
      <div style={{ flex: 1, display:"flex", flexDirection:"column", justifyContent:"center", padding:"0 26px" }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background:"var(--ink)", display:"inline-flex", alignItems:"center", justifyContent:"center", marginBottom: 18 }}>
          <Icon name="car" size={26} style={{ color:"#fff" }}/>
        </div>
        <h1 style={{ fontSize: 27, fontWeight: 700, letterSpacing:"-0.025em", lineHeight: 1.1, margin:"0 0 8px" }}>
          Add your car to<br/>get started.
        </h1>
        <p style={{ fontSize: 14, color:"var(--slate-700)", lineHeight: 1.5, margin:"0 0 22px" }}>
          We'll tailor every diagnosis, issue, and maintenance tip to your exact vehicle.
        </p>
        <div style={{ display:"flex", flexDirection:"column", gap: 10 }}>
          <button style={{ padding:"15px 0", background:"var(--au7o-blue)", color:"#fff", border:"none", borderRadius: 13, fontSize: 15, fontWeight: 600, cursor:"pointer", fontFamily:"var(--font-sans)", display:"inline-flex", alignItems:"center", justifyContent:"center", gap: 8 }}>
            <Icon name="plus" size={15}/> Add my vehicle
          </button>
          <button style={{ padding:"15px 0", background:"#fff", color:"var(--ink)", border:"1px solid var(--paper-line)", borderRadius: 13, fontSize: 15, fontWeight: 600, cursor:"pointer", fontFamily:"var(--font-sans)", display:"inline-flex", alignItems:"center", justifyContent:"center", gap: 8 }}>
            <Icon name="camera" size={15} style={{ color:"var(--au7o-blue)" }}/> Scan plate or VIN
          </button>
        </div>
      </div>
      <div style={{ padding:"14px 26px 22px", textAlign:"center" }}>
        <button style={{ background:"transparent", border:"none", fontSize: 13.5, color:"var(--slate-500)", cursor:"pointer", fontFamily:"var(--font-sans)", fontWeight: 500 }}>Just let me browse for now</button>
      </div>
    </React.Fragment>
  );
}

function OnboardFooter({ primary, secondary }) {
  return (
    <div style={{ padding:"14px 26px 24px" }}>
      <button style={{ width:"100%", padding:"15px 0", background:"var(--ink)", color:"#fff", border:"none", borderRadius: 13, fontSize: 15, fontWeight: 600, cursor:"pointer", fontFamily:"var(--font-sans)" }}>{primary}</button>
      {secondary && <div style={{ textAlign:"center", marginTop: 12 }}><button style={{ background:"transparent", border:"none", fontSize: 13.5, color:"var(--slate-500)", cursor:"pointer", fontFamily:"var(--font-sans)", fontWeight: 500 }}>{secondary}</button></div>}
    </div>
  );
}

// ─── DESKTOP ONBOARDING — centered welcome over a dimmed home ─────
function DesktopOnboarding() {
  const cards = [
    { icon:"camera", title:"Diagnose from a photo", body:"Upload a picture of the problem — Au7o matches it to 4,200+ known issues." },
    { icon:"search", title:"Browse your car's weak spots", body:"Documented problems, repair costs, and real fixes for your exact trim." },
    { icon:"wrench", title:"Stay ahead of maintenance", body:"Track service history and get reminders before things break." },
  ];
  return (
    <div style={{ position:"absolute", inset: 0, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(11,18,32,0.5)", backdropFilter:"blur(3px)" }}>
      <div style={{ width: 620, background:"var(--paper)", borderRadius: 20, overflow:"hidden", boxShadow:"var(--shadow-3)", position:"relative" }}>
        <div style={{ padding:"34px 40px 0", textAlign:"center" }}>
          <div style={{ width: 76, height: 76, borderRadius: 22, background:"var(--au7o-blue-50)", display:"inline-flex", alignItems:"center", justifyContent:"center", marginBottom: 18 }}>
            <img src="brand/au7o-mascot.png" alt="" style={{ width: 48, height: 48 }}/>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing:"-0.025em", margin: 0 }}>Welcome to Au7o</h1>
          <p style={{ fontSize: 15, color:"var(--slate-700)", lineHeight: 1.5, margin:"10px auto 0", maxWidth: 420 }}>
            Your car's co-pilot — here's what you can do.
          </p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap: 14, padding:"24px 40px 8px" }}>
          {cards.map((c,i)=>(
            <div key={i} style={{ background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 14, padding:"18px 16px", textAlign:"center" }}>
              <span style={{ width: 42, height: 42, borderRadius: 12, background:"var(--au7o-blue-50)", display:"inline-flex", alignItems:"center", justifyContent:"center", color:"var(--au7o-blue)", marginBottom: 12 }}>
                <Icon name={c.icon} size={19}/>
              </span>
              <div style={{ fontSize: 14, fontWeight: 600, letterSpacing:"-0.01em" }}>{c.title}</div>
              <div style={{ fontSize: 12, color:"var(--slate-700)", lineHeight: 1.45, marginTop: 5 }}>{c.body}</div>
            </div>
          ))}
        </div>
        <div style={{ padding:"18px 40px 30px", display:"flex", alignItems:"center", gap: 14 }}>
          <button style={{ flex: 1, padding:"14px 0", background:"var(--au7o-blue)", color:"#fff", border:"none", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor:"pointer", fontFamily:"var(--font-sans)", display:"inline-flex", alignItems:"center", justifyContent:"center", gap: 8, boxShadow:"0 6px 18px rgba(59,130,246,0.32)" }}>
            <Icon name="car" size={16}/> Add my vehicle to start
          </button>
          <button style={{ padding:"14px 22px", background:"transparent", color:"var(--slate-600)", border:"none", fontSize: 14, fontWeight: 500, cursor:"pointer", fontFamily:"var(--font-sans)" }}>Just browse</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { MobileOnboarding, DesktopOnboarding });
