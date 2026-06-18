/* Au7o · Mobile Diagnose flow — "Snap it, Au7o diagnoses it"
   Entry: camera icon in the A3 hub composer/dock.
   Flow: Camera capture → Analyzing → Diagnosis result (known-issue match + fix + parts).
   The camera surface is dark (live viewfinder); results return to the paper palette.
*/

// ════════════════════════════════════════════════════════════════
// 1 · CAMERA CAPTURE — full-bleed dark viewfinder
// ════════════════════════════════════════════════════════════════
function DiagnoseCamera() {
  return (
    <div style={{ height:"100%", width:"100%", position:"relative", overflow:"hidden", background:"#0B0E14" }}>
      {/* Live viewfinder (mock engine-bay photo via layered gradients) */}
      <div style={{ position:"absolute", inset: 0 }}>
        <FakeEngineBay/>
        {/* darkening vignette so chrome reads */}
        <div style={{ position:"absolute", inset: 0, background:"radial-gradient(120% 80% at 50% 40%, transparent 40%, rgba(11,14,20,0.55) 100%)" }}/>
      </div>

      {/* Top bar */}
      <div style={{ position:"absolute", top: 12, left: 12, right: 12, zIndex: 5, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <button style={{ width: 34, height: 34, borderRadius:"50%", background:"rgba(0,0,0,0.4)", backdropFilter:"blur(10px)", border:"1px solid rgba(255,255,255,0.12)", color:"#fff", display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize: 16 }}>✕</button>
        <div style={{ display:"flex", alignItems:"center", gap: 7, padding:"6px 12px", background:"rgba(0,0,0,0.4)", backdropFilter:"blur(10px)", border:"1px solid rgba(255,255,255,0.12)", borderRadius: 999 }}>
          <span className="au7o-pulse-soft" style={{ width: 6, height: 6, borderRadius:"50%", background:"var(--au7o-blue)" }}/>
          <span style={{ fontSize: 11, fontWeight: 600, color:"#fff", letterSpacing:"0.04em" }}>DIAGNOSE</span>
        </div>
        <button style={{ width: 34, height: 34, borderRadius:"50%", background:"rgba(0,0,0,0.4)", backdropFilter:"blur(10px)", border:"1px solid rgba(255,255,255,0.12)", color:"#fff", display:"inline-flex", alignItems:"center", justifyContent:"center" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z"/></svg>
        </button>
      </div>

      {/* AI live-detect chip — Au7o pre-recognizes what's in frame */}
      <div style={{ position:"absolute", top: 60, left: 12, right: 12, zIndex: 5, display:"flex", justifyContent:"center" }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap: 8, padding:"7px 12px", background:"rgba(59,130,246,0.92)", backdropFilter:"blur(10px)", borderRadius: 999, boxShadow:"0 6px 20px rgba(59,130,246,0.4)" }}>
          <img src="brand/au7o-mascot.png" alt="" style={{ width: 16, height: 16 }}/>
          <span style={{ fontSize: 11.5, fontWeight: 600, color:"#fff" }}>I can see the serpentine belt area — keep steady</span>
        </div>
      </div>

      {/* Center reticle — corner brackets + hint */}
      <div style={{ position:"absolute", inset: 0, display:"flex", alignItems:"center", justifyContent:"center", pointerEvents:"none", zIndex: 4 }}>
        <div style={{ position:"relative", width: 230, height: 230 }}>
          <Bracket pos="tl"/><Bracket pos="tr"/><Bracket pos="bl"/><Bracket pos="br"/>
          {/* scan target dot pulsing on the detected area */}
          <div style={{ position:"absolute", left:"58%", top:"44%" }}>
            <span style={{ position:"absolute", width: 36, height: 36, marginLeft:-18, marginTop:-18, borderRadius:"50%", border:"2px solid #fff", opacity:0.9 }}/>
            <span className="au7o-pulse-soft" style={{ position:"absolute", width: 10, height: 10, marginLeft:-5, marginTop:-5, borderRadius:"50%", background:"#fff" }}/>
          </div>
        </div>
      </div>

      {/* Bottom controls */}
      <div style={{ position:"absolute", bottom: 0, left: 0, right: 0, zIndex: 6, padding:"16px 0 22px", background:"linear-gradient(180deg, transparent, rgba(11,14,20,0.85) 40%)" }}>
        {/* hint */}
        <div style={{ textAlign:"center", marginBottom: 16, padding:"0 32px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color:"#fff" }}>Show me what's wrong</div>
          <div style={{ fontSize: 11, color:"rgba(255,255,255,0.65)", marginTop: 2, lineHeight: 1.4 }}>
            Photo, or hold for video. Add a voice note to describe the sound or smell.
          </div>
        </div>

        {/* mode toggle */}
        <div style={{ display:"flex", justifyContent:"center", gap: 22, marginBottom: 16, fontSize: 12, fontWeight: 600, letterSpacing:"0.04em" }}>
          <span style={{ color:"rgba(255,255,255,0.45)" }}>VIDEO</span>
          <span style={{ color:"#F5C24E" }}>PHOTO</span>
          <span style={{ color:"rgba(255,255,255,0.45)" }}>LIVE AR</span>
        </div>

        {/* shutter row */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 32px" }}>
          {/* gallery */}
          <button style={{ width: 44, height: 44, borderRadius: 10, overflow:"hidden", border:"1px solid rgba(255,255,255,0.25)", padding: 0, background:"#1a2030" }}>
            <div style={{ width:"100%", height:"100%", background:"linear-gradient(135deg,#2a3550,#161b28)", display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(255,255,255,0.6)" }}>
              <Icon name="more" size={16}/>
            </div>
          </button>
          {/* shutter */}
          <button style={{ width: 74, height: 74, borderRadius:"50%", background:"transparent", border:"4px solid #fff", display:"inline-flex", alignItems:"center", justifyContent:"center", padding: 0 }}>
            <span style={{ width: 58, height: 58, borderRadius:"50%", background:"#fff" }}/>
          </button>
          {/* voice note */}
          <button style={{ width: 44, height: 44, borderRadius:"50%", background:"rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.25)", color:"#fff", display:"inline-flex", alignItems:"center", justifyContent:"center" }}>
            <Icon name="mic" size={18}/>
          </button>
        </div>
      </div>
    </div>
  );
}

function Bracket({ pos }) {
  const base = { position:"absolute", width: 30, height: 30, borderColor:"#fff", borderStyle:"solid", borderWidth: 0 };
  const map = {
    tl: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 8 },
    tr: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 8 },
    bl: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 8 },
    br: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 8 },
  };
  return <span style={{ ...base, ...map[pos], opacity: 0.92 }}/>;
}

// mock engine bay so the viewfinder reads as a real camera
function FakeEngineBay() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 390 780" preserveAspectRatio="xMidYMid slice" style={{ display:"block" }}>
      <defs>
        <linearGradient id="bay" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a3142"/><stop offset="0.5" stopColor="#1b2130"/><stop offset="1" stopColor="#11151f"/>
        </linearGradient>
      </defs>
      <rect width="390" height="780" fill="url(#bay)"/>
      {/* engine cover slab */}
      <rect x="40" y="300" width="310" height="200" rx="16" fill="#1f2735" stroke="#33405a" strokeWidth="2"/>
      <rect x="64" y="330" width="262" height="22" rx="6" fill="#28323f"/>
      <rect x="64" y="364" width="262" height="22" rx="6" fill="#28323f"/>
      <rect x="64" y="398" width="200" height="22" rx="6" fill="#28323f"/>
      {/* belt / pulley region (the detected area) */}
      <circle cx="250" cy="360" r="46" fill="#10151e" stroke="#3a4863" strokeWidth="3"/>
      <circle cx="250" cy="360" r="26" fill="#181f2b" stroke="#2c3850" strokeWidth="2"/>
      <circle cx="250" cy="360" r="8" fill="#0b0e14"/>
      <path d="M204 360 Q150 320 110 360 Q150 400 204 360" fill="none" stroke="#0d1119" strokeWidth="10"/>
      {/* hoses */}
      <path d="M70 260 C 120 220 180 280 250 240" fill="none" stroke="#161c27" strokeWidth="16" strokeLinecap="round"/>
      <path d="M300 520 C 260 560 200 540 150 580" fill="none" stroke="#171d28" strokeWidth="14" strokeLinecap="round"/>
      {/* cap */}
      <circle cx="110" cy="470" r="24" fill="#2b3445" stroke="#3c4a64" strokeWidth="3"/>
      {/* highlights */}
      <ellipse cx="150" cy="200" rx="180" ry="60" fill="rgba(120,150,200,0.06)"/>
    </svg>
  );
}

// ════════════════════════════════════════════════════════════════
// 2 · ANALYZING — captured frame + Au7o working checklist
// ════════════════════════════════════════════════════════════════
function DiagnoseAnalyzing() {
  const steps = [
    { label:"Identifying components in frame", done: true },
    { label:"Matching against 4,312 known issues", done: true },
    { label:"Cross-referencing your recalls", done: false, active: true },
    { label:"Checking compatible parts", done: false },
  ];
  return (
    <div style={{ height:"100%", width:"100%", position:"relative", overflow:"hidden", background:"#0B0E14" }}>
      {/* captured frame, dimmed */}
      <div style={{ position:"absolute", inset: 0, opacity: 0.5 }}>
        <FakeEngineBay/>
      </div>
      <div style={{ position:"absolute", inset: 0, background:"rgba(11,14,20,0.55)" }}/>

      {/* scan line sweeping the detected area */}
      <div style={{ position:"absolute", left:"50%", top:"40%", transform:"translate(-50%,-50%)", width: 220, height: 220, zIndex: 3 }}>
        <Bracket pos="tl"/><Bracket pos="tr"/><Bracket pos="bl"/><Bracket pos="br"/>
        <div style={{ position:"absolute", left: 0, right: 0, height: 2, background:"linear-gradient(90deg, transparent, var(--au7o-blue), transparent)", boxShadow:"0 0 16px var(--au7o-blue)", animation:"au7o-scan 1.8s ease-in-out infinite" }}/>
        <style>{`@keyframes au7o-scan { 0%,100% { top: 4%; } 50% { top: 92%; } }`}</style>
      </div>

      {/* bottom sheet — working state */}
      <div style={{ position:"absolute", left: 0, right: 0, bottom: 0, zIndex: 6, background:"var(--paper)", borderTopLeftRadius: 22, borderTopRightRadius: 22, padding:"18px 18px 26px", boxShadow:"0 -12px 40px rgba(0,0,0,0.4)" }}>
        <div style={{ width: 36, height: 4, borderRadius: 999, background:"var(--paper-line)", margin:"0 auto 16px" }}/>
        <div style={{ display:"flex", alignItems:"center", gap: 10, marginBottom: 14 }}>
          <img src="brand/au7o-mascot.png" alt="" style={{ width: 26, height: 26 }}/>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Analyzing your photo…</div>
            <div className="mono" style={{ fontSize: 10.5, color:"var(--slate-500)", marginTop: 1 }}>2015 CHALLENGER SRT 392 · ENGINE BAY</div>
          </div>
          <span className="au7o-pulse-soft" style={{ marginLeft:"auto", width: 8, height: 8, borderRadius:"50%", background:"var(--au7o-blue)" }}/>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap: 8 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap: 10 }}>
              <span style={{
                width: 20, height: 20, borderRadius:"50%", flexShrink: 0,
                background: s.done ? "var(--ok)" : s.active ? "var(--au7o-blue)" : "var(--paper-2)",
                border: s.done || s.active ? "none" : "1px solid var(--paper-line)",
                display:"inline-flex", alignItems:"center", justifyContent:"center", color:"#fff",
              }}>
                {s.done ? <Icon name="check" size={11}/> : s.active ? <span className="au7o-pulse-soft" style={{ width: 7, height: 7, borderRadius:"50%", background:"#fff" }}/> : null}
              </span>
              <span style={{ fontSize: 12.5, fontWeight: s.active ? 600 : 500, color: s.done || s.active ? "var(--ink)" : "var(--slate-500)" }}>{s.label}</span>
              {s.active && <span className="mono" style={{ marginLeft:"auto", fontSize: 10, color:"var(--slate-400)" }}>1.4s</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 3 · RESULT — diagnosis returns into the conversation
// ════════════════════════════════════════════════════════════════
function DiagnoseResult() {
  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", background:"var(--paper)", overflow:"hidden", position:"relative" }}>
      {/* header */}
      <div style={{ display:"flex", alignItems:"center", gap: 10, padding:"6px 16px 10px", background:"var(--paper)" }}>
        <button style={{ width: 32, height: 32, borderRadius:"50%", background:"#fff", border:"1px solid var(--paper-line)", display:"inline-flex", alignItems:"center", justifyContent:"center", color:"var(--slate-500)" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, letterSpacing:"-0.01em" }}>Diagnosis</div>
          <div className="mono" style={{ fontSize: 9.5, color:"var(--slate-500)" }}>FROM YOUR PHOTO · JUST NOW</div>
        </div>
        <button style={{ width: 32, height: 32, borderRadius:"50%", background:"#fff", border:"1px solid var(--paper-line)", display:"inline-flex", alignItems:"center", justifyContent:"center", color:"var(--slate-500)" }}>
          <Icon name="more" size={15}/>
        </button>
      </div>

      <div style={{ flex: 1, overflow:"auto", padding:"4px 16px 130px" }}>
        {/* user "sent a photo" bubble */}
        <div style={{ display:"flex", justifyContent:"flex-end", marginTop: 8 }}>
          <div style={{ maxWidth:"78%" }}>
            <div style={{ borderRadius:"14px 14px 4px 14px", overflow:"hidden", border:"3px solid var(--ink)", position:"relative", height: 130 }}>
              <FakeEngineBay/>
              <div style={{ position:"absolute", bottom: 6, left: 6, padding:"3px 7px", background:"rgba(11,18,32,0.7)", borderRadius: 6, fontSize: 9.5, color:"#fff", fontFamily:"var(--font-mono)" }}>PHOTO · ENGINE BAY</div>
            </div>
            <div style={{ background:"var(--ink)", color:"#fff", padding:"7px 12px", borderRadius:"0 0 4px 14px", fontSize: 12.5, marginTop:-2 }}>
              Hearing a squeal from here on cold start
            </div>
          </div>
        </div>

        {/* Au7o reply intro */}
        <div style={{ marginTop: 14, display:"flex", gap: 8, alignItems:"flex-start" }}>
          <img src="brand/au7o-mascot.png" alt="" style={{ width: 22, height: 22, marginTop: 2 }}/>
          <p style={{ flex: 1, fontSize: 12.5, color:"var(--ink)", lineHeight: 1.5, margin: 0 }}>
            Good photo — I can see it clearly. That squeal on cold start plus the glazing I spotted points to one thing, and it's <b>a known issue on your trim</b>.
          </p>
        </div>

        {/* MATCH CARD */}
        <div style={{ marginTop: 12, marginLeft: 30, background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 14, overflow:"hidden", boxShadow:"var(--shadow-1)" }}>
          {/* confidence header */}
          <div style={{ padding:"12px 14px", borderBottom:"1px solid var(--paper-line)", display:"flex", alignItems:"center", gap: 10, background:"linear-gradient(180deg,#fff,#FAFAF7)" }}>
            <span className="status-dot warn" style={{ width: 9, height: 9 }}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, letterSpacing:"-0.01em" }}>Serpentine Belt — Glazed &amp; Cracking</div>
              <div className="mono" style={{ fontSize: 10, color:"var(--slate-500)", marginTop: 1 }}>KNOWN ISSUE · MATCHES 1,840 REPORTS</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div className="mono" style={{ fontSize: 17, fontWeight: 700, color:"var(--ok)", lineHeight: 1 }}>92%</div>
              <div style={{ fontSize: 8.5, color:"var(--slate-500)", letterSpacing:"0.06em", fontWeight: 600 }}>CONFIDENCE</div>
            </div>
          </div>

          {/* what Au7o saw */}
          <div style={{ padding:"12px 14px", borderBottom:"1px solid var(--paper-line)" }}>
            <div className="eyebrow" style={{ fontSize: 9.5, marginBottom: 8 }}>WHAT I SPOTTED</div>
            <div style={{ display:"flex", flexDirection:"column", gap: 6 }}>
              {[
                "Shiny glazed surface on the belt ribs",
                "Hairline cracks across the underside",
                "Belt is the original (no date marking on tensioner)",
              ].map((t, i) => (
                <div key={i} style={{ display:"flex", gap: 8, fontSize: 12, color:"var(--slate-700)", lineHeight: 1.4 }}>
                  <Icon name="check" size={13} style={{ color:"var(--ok)", marginTop: 1, flexShrink: 0 }}/>
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* severity + cost */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", borderBottom:"1px solid var(--paper-line)" }}>
            {[
              { k:"SEVERITY", v:"Medium", c:"var(--warn)" },
              { k:"FIX TIME", v:"30 min", c:"var(--ink)" },
              { k:"DIY COST", v:"$48", c:"var(--ok)" },
            ].map((s, i) => (
              <div key={i} style={{ padding:"10px 12px", borderRight: i < 2 ? "1px solid var(--paper-line)" : "none" }}>
                <div className="eyebrow" style={{ fontSize: 8.5 }}>{s.k}</div>
                <div className="mono" style={{ fontSize: 13, fontWeight: 700, color: s.c, marginTop: 2 }}>{s.v}</div>
              </div>
            ))}
          </div>

          {/* recommended part */}
          <div style={{ padding:"12px 14px", background:"rgba(59,130,246,0.04)" }}>
            <div className="eyebrow" style={{ fontSize: 9.5, marginBottom: 8, color:"var(--au7o-blue)" }}>THE PART YOU NEED</div>
            <div style={{ display:"flex", alignItems:"center", gap: 10 }}>
              <div style={{ width: 42, height: 42, borderRadius: 8, background:"#fff", border:"1px solid var(--paper-line)", display:"inline-flex", alignItems:"center", justifyContent:"center", flexShrink: 0 }}>
                <Icon name="settings" size={20} style={{ color:"var(--slate-500)" }}/>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.25 }}>Gates Micro-V Serpentine Belt</div>
                <div className="mono" style={{ fontSize: 10, color:"var(--slate-500)", marginTop: 1 }}>K060841 · FITS YOUR 6.4L · IN STOCK</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div className="mono" style={{ fontSize: 14, fontWeight: 700 }}>$48</div>
                <div style={{ fontSize: 9, color:"var(--ok)", fontWeight: 600 }}>2-day ship</div>
              </div>
            </div>
          </div>

          {/* actions */}
          <div style={{ padding:"10px 12px", display:"flex", gap: 6 }}>
            <button className="chip chip-sm" style={{ flex: 1, justifyContent:"center", background:"var(--ink)", color:"#fff", border:"none", padding:"8px" }}>
              <Icon name="spark" size={11}/> Order part · $48
            </button>
            <button className="chip chip-sm" style={{ flex: 1, justifyContent:"center", padding:"8px" }}>
              <Icon name="book" size={11}/> How to replace
            </button>
          </div>
        </div>

        {/* follow-up reply */}
        <div style={{ marginTop: 16, display:"flex", gap: 8, alignItems:"flex-start" }}>
          <img src="brand/au7o-mascot.png" alt="" style={{ width: 22, height: 22, marginTop: 2 }}/>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 12.5, color:"var(--ink)", lineHeight: 1.5, margin: 0 }}>
              It's an easy 30-minute job — the tensioner releases with a 15mm and the routing diagram is on your radiator shroud. Want me to walk you through it, or book a shop?
            </p>
          </div>
        </div>

        {/* not right? */}
        <div style={{ marginTop: 16, marginLeft: 30 }}>
          <div className="eyebrow" style={{ fontSize: 10, marginBottom: 8 }}>NOT QUITE RIGHT?</div>
          <div style={{ display:"flex", flexDirection:"column", gap: 6 }}>
            {[
              { icon:"camera", text:"Add another angle or a video" },
              { icon:"mic", text:"Describe the sound it makes" },
              { icon:"search", text:"See other possible matches (3)" },
            ].map((s, i) => (
              <button key={i} style={{
                display:"flex", alignItems:"center", gap: 10,
                padding:"10px 12px", background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 12,
                fontFamily:"var(--font-sans)", fontSize: 12.5, color:"var(--ink)", textAlign:"left",
              }}>
                <Icon name={s.icon} size={13} style={{ color:"var(--slate-500)" }}/>
                <span style={{ flex: 1 }}>{s.text}</span>
                <Icon name="chevron" size={10} style={{ color:"var(--slate-400)" }}/>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* composer (collapsed, same as hub) */}
      <div style={{ position:"absolute", left: 0, right: 0, bottom: 0, padding:"8px 12px 14px", background:"linear-gradient(180deg, rgba(247,243,234,0) 0%, var(--paper) 60%)" }}>
        <div style={{ background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 18, boxShadow:"var(--shadow-2)", padding:"7px 7px 7px 14px", display:"flex", alignItems:"center", gap: 8 }}>
          <Icon name="chat" size={13} style={{ color:"var(--slate-400)" }}/>
          <span style={{ flex: 1, fontSize: 13, color:"var(--slate-400)" }}>Ask a follow-up…</span>
          <button style={{ width: 28, height: 28, borderRadius:"50%", background:"var(--au7o-blue)", border:"none", display:"inline-flex", alignItems:"center", justifyContent:"center", color:"#fff" }}>
            <Icon name="camera" size={13}/>
          </button>
          <button style={{ width: 30, height: 30, borderRadius:"50%", background:"var(--ink)", border:"none", display:"inline-flex", alignItems:"center", justifyContent:"center", color:"#fff" }}>
            <Icon name="send" size={12}/>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Vehicle-info entry (YMMT) — step 1 of the free diagnosis flow ─
// Reached from "Try a photo diagnosis"; on continue → DiagnoseCamera.
// ════════════════════════════════════════════════════════════════
// 1 · VEHICLE INFO ENTRY (YMMT) — guided, branded onboarding
// ════════════════════════════════════════════════════════════════
function DiagnoseVehicleEntry() {
  const steps = ["Year","Make","Model","Trim"];
  const picked = { Year:"2015", Make:"Dodge", Model:"Challenger", Trim:null };
  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", background:"var(--paper)", overflow:"hidden" }}>
      {/* header */}
      <div style={{ padding:"10px 16px 8px", display:"flex", alignItems:"center", gap: 10 }}>
        <button style={{ width: 32, height: 32, borderRadius:"50%", background:"#fff", border:"1px solid var(--paper-line)", display:"inline-flex", alignItems:"center", justifyContent:"center", color:"var(--slate-500)" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div style={{ flex: 1 }}>
          {/* progress */}
          <div style={{ display:"flex", gap: 4 }}>
            {[0,1,2].map(i => <span key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i === 0 ? "var(--au7o-blue)" : "var(--paper-line)" }}/>)}
          </div>
        </div>
        <span className="mono" style={{ fontSize: 10, color:"var(--slate-400)", fontWeight: 600 }}>STEP 1/3</span>
      </div>

      <div style={{ flex: 1, overflow:"auto", padding:"20px 18px 18px" }}>
        <div style={{ display:"flex", alignItems:"center", gap: 8, marginBottom: 14 }}>
          <img src="brand/au7o-mascot.png" alt="" style={{ width: 30, height: 30 }}/>
          <span className="eyebrow" style={{ color:"var(--au7o-blue)" }}>FREE DIAGNOSIS</span>
        </div>
        <h1 style={{ fontSize: 25, fontWeight: 700, letterSpacing:"-0.02em", lineHeight: 1.12, margin: 0 }}>
          First — which car<br/>are we looking at?
        </h1>
        <p style={{ fontSize: 13.5, color:"var(--slate-700)", lineHeight: 1.5, margin:"8px 0 22px" }}>
          So I can match what I see to the issues and parts specific to your exact trim.
        </p>

        {/* YMMT fields */}
        <div style={{ display:"flex", flexDirection:"column", gap: 10 }}>
          {steps.map((s, i) => {
            const val = picked[s];
            const isActive = s === "Trim";
            return (
              <div key={i} style={{
                display:"flex", alignItems:"center", gap: 12,
                padding:"14px 16px", borderRadius: 12,
                background: val ? "#fff" : isActive ? "#fff" : "var(--paper-2)",
                border: `1px solid ${isActive ? "var(--au7o-blue)" : "var(--paper-line)"}`,
                boxShadow: isActive ? "0 0 0 4px rgba(59,130,246,0.12)" : "none",
              }}>
                <span className="eyebrow" style={{ fontSize: 9.5, width: 42, flexShrink: 0 }}>{s}</span>
                <span style={{ flex: 1, fontSize: 15, fontWeight: val ? 600 : 500, color: val ? "var(--ink)" : "var(--slate-400)" }}>
                  {val || (isActive ? "Select trim…" : "—")}
                </span>
                {val ? <Icon name="check" size={15} style={{ color:"var(--ok)" }}/> : <Icon name="chevron-down" size={14} style={{ color:"var(--slate-400)" }}/>}
              </div>
            );
          })}
        </div>

        {/* trim options (the active step) */}
        <div style={{ marginTop: 12, display:"flex", flexWrap:"wrap", gap: 7 }}>
          {["SXT","R/T","R/T Scat Pack","SRT 392","SRT Hellcat"].map((t, i) => (
            <span key={i} style={{
              padding:"8px 13px", borderRadius: 999, fontSize: 12.5, fontWeight: 600, cursor:"pointer",
              background: t === "SRT 392" ? "var(--au7o-blue)" : "#fff",
              color: t === "SRT 392" ? "#fff" : "var(--slate-700)",
              border: `1px solid ${t === "SRT 392" ? "var(--au7o-blue)" : "var(--paper-line)"}`,
            }}>{t}</span>
          ))}
        </div>

        {/* plate shortcut */}
        <div style={{ marginTop: 18, display:"flex", alignItems:"center", gap: 10, padding:"12px 14px", background:"var(--paper-2)", border:"1px dashed var(--paper-line)", borderRadius: 12 }}>
          <Icon name="camera" size={15} style={{ color:"var(--slate-500)", flexShrink: 0 }}/>
          <span style={{ fontSize: 12.5, color:"var(--slate-700)", flex: 1 }}>Or scan your plate / VIN to autofill</span>
          <Icon name="chevron" size={12} style={{ color:"var(--slate-400)" }}/>
        </div>
      </div>

      {/* sticky CTA */}
      <div style={{ padding:"12px 18px 18px", borderTop:"1px solid var(--paper-line)", background:"var(--paper)" }}>
        <button style={{
          width:"100%", padding:"14px 0", background:"var(--ink)", color:"#fff", border:"none", borderRadius: 12,
          fontSize: 15, fontWeight: 600, cursor:"pointer", fontFamily:"var(--font-sans)",
          display:"inline-flex", alignItems:"center", justifyContent:"center", gap: 8,
        }}>
          <Icon name="camera" size={16}/> Continue to camera
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { DiagnoseCamera, DiagnoseAnalyzing, DiagnoseResult, DiagnoseVehicleEntry });
