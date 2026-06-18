/* ============================================================
   Au7o handoff · Desktop diagnosis flow. Desktop has NO camera, so the user UPLOADS a photo: DesktopUploadDiagnose (YMMT + drag/drop upload zone; pass uploaded={true} for the filled state) -> DesktopHubChat (lands in the desktop hub; pass analyzing={true} for the inline 'analyzing' state, omit for the result). DeskNav is the shared top nav. Same destination as the mobile flow. DEPENDS ON _diagnose-visuals.jsx (HeroEngineBay).
   ============================================================ */
/* Au7o · Desktop diagnosis flow — UPLOAD a photo (no camera on desktop),
   then land in the desktop hub chat where Au7o analyzes it inline.
   Flow: home → upload photo (+YMMT) → hub chat (analyzing → result).
*/

// ─── Desktop top nav (shared) ────────────────────────────────────
function DeskNav({ vehicle = false }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 40px", borderBottom:"1px solid var(--paper-line)", background:"var(--paper)", flexShrink: 0 }}>
      <Au7oMark size={24}/>
      <div style={{ display:"flex", alignItems:"center", gap: 22 }}>
        <span style={{ fontSize: 13.5, color:"var(--slate-700)", fontWeight: 600 }}>Known Issues</span>
        <span style={{ fontSize: 13.5, color:"var(--slate-700)", fontWeight: 500 }}>Drive</span>
        <span style={{ fontSize: 13.5, color:"var(--slate-700)", fontWeight: 500 }}>Pricing</span>
        {vehicle && (
          <span style={{ display:"inline-flex", alignItems:"center", gap: 6, padding:"6px 12px", background:"var(--paper-2)", border:"1px solid var(--paper-line)", borderRadius: 999 }}>
            <Icon name="car" size={12} style={{ color:"var(--slate-500)" }}/>
            <span style={{ fontSize: 12, fontWeight: 600 }}>'15 SRT 392</span>
          </span>
        )}
        <button style={{ padding:"8px 16px", background:"var(--ink)", color:"#fff", border:"none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor:"pointer", fontFamily:"var(--font-sans)" }}>Sign In</button>
      </div>
    </div>
  );
}

// ─── 1 · DESKTOP UPLOAD — YMMT + drag/drop upload zone ───────────
function DesktopUploadDiagnose({ uploaded = false }) {
  const ymmt = [["Year","2015"],["Make","Dodge"],["Model","Challenger"],["Trim","SRT 392"]];
  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", background:"var(--paper)", overflow:"hidden" }}>
      <DeskNav/>
      <div style={{ flex: 1, overflow:"auto", display:"flex", alignItems:"center", justifyContent:"center", padding:"40px" }}>
        <div style={{ width: 860 }}>
          <div style={{ textAlign:"center", marginBottom: 26 }}>
            <div className="eyebrow" style={{ color:"var(--au7o-blue)" }}>FREE DIAGNOSIS</div>
            <h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing:"-0.025em", margin:"8px 0 0" }}>Upload a photo to diagnose</h1>
            <p style={{ fontSize: 15, color:"var(--slate-700)", margin:"8px 0 0" }}>Tell us your car, drop in a photo or video of the problem, and Au7o takes it from there.</p>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"0.85fr 1.15fr", gap: 18, background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 18, padding: 22, boxShadow:"var(--shadow-1)" }}>
            {/* YMMT */}
            <div>
              <div className="eyebrow" style={{ fontSize: 9.5, marginBottom: 12 }}>YOUR VEHICLE</div>
              <div style={{ display:"flex", flexDirection:"column", gap: 9 }}>
                {ymmt.map(([k,v],i)=>(
                  <div key={i} style={{ display:"flex", alignItems:"center", gap: 10, padding:"11px 13px", background:"var(--paper-2)", border:"1px solid var(--paper-line)", borderRadius: 10 }}>
                    <span className="eyebrow" style={{ fontSize: 9, width: 38, flexShrink: 0 }}>{k}</span>
                    <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600 }}>{v}</span>
                    <Icon name="check" size={14} style={{ color:"var(--ok)" }}/>
                  </div>
                ))}
              </div>
              <button style={{ width:"100%", marginTop: 10, padding:"9px 0", background:"transparent", border:"1px dashed var(--paper-line)", borderRadius: 10, fontSize: 12, color:"var(--slate-600)", cursor:"pointer", fontFamily:"var(--font-sans)" }}>
                Change vehicle
              </button>
            </div>

            {/* upload zone */}
            <div>
              <div className="eyebrow" style={{ fontSize: 9.5, marginBottom: 12 }}>THE PROBLEM</div>
              {!uploaded ? (
                <div style={{ height: 232, borderRadius: 12, border:"2px dashed var(--au7o-blue)", background:"var(--au7o-blue-50)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center", padding:"0 24px" }}>
                  <span style={{ width: 56, height: 56, borderRadius:"50%", background:"#fff", border:"1px solid var(--au7o-blue-100)", display:"inline-flex", alignItems:"center", justifyContent:"center", color:"var(--au7o-blue)", marginBottom: 14 }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/></svg>
                  </span>
                  <div style={{ fontSize: 15.5, fontWeight: 600 }}>Drag a photo or video here</div>
                  <div style={{ fontSize: 13, color:"var(--slate-600)", marginTop: 4 }}>or <span style={{ color:"var(--au7o-blue-700)", fontWeight: 600, textDecoration:"underline" }}>browse your files</span></div>
                  <div style={{ fontSize: 11, color:"var(--slate-400)", marginTop: 14 }}>JPG, PNG, HEIC or MP4 · up to 50 MB</div>
                </div>
              ) : (
                <div style={{ height: 232, borderRadius: 12, overflow:"hidden", border:"1px solid var(--paper-line)", position:"relative" }}>
                  <HeroEngineBay/>
                  <div style={{ position:"absolute", inset: 0, background:"linear-gradient(180deg, transparent 55%, rgba(11,18,32,0.75))" }}/>
                  <div style={{ position:"absolute", top: 12, right: 12, display:"flex", gap: 8 }}>
                    <span style={{ display:"inline-flex", alignItems:"center", gap: 5, padding:"5px 10px", background:"rgba(16,185,129,0.95)", borderRadius: 999, fontSize: 11, fontWeight: 700, color:"#fff" }}>
                      <Icon name="check" size={11}/> Uploaded
                    </span>
                  </div>
                  <div style={{ position:"absolute", bottom: 12, left: 14, right: 14, display:"flex", alignItems:"center", gap: 10 }}>
                    <span className="mono" style={{ flex: 1, fontSize: 11.5, color:"#fff" }}>engine-bay-squeal.jpg · 3.2 MB</span>
                    <button style={{ padding:"5px 12px", background:"rgba(255,255,255,0.92)", border:"none", borderRadius: 8, fontSize: 11.5, fontWeight: 600, color:"var(--ink)", cursor:"pointer", fontFamily:"var(--font-sans)" }}>Replace</button>
                  </div>
                </div>
              )}
              {/* optional note */}
              <input placeholder="Add a note — what does it sound or smell like? (optional)" style={{ width:"100%", boxSizing:"border-box", marginTop: 10, padding:"10px 13px", fontSize: 13, fontFamily:"var(--font-sans)", background:"var(--paper-2)", border:"1px solid var(--paper-line)", borderRadius: 10, color:"var(--ink)" }}/>
            </div>
          </div>

          {/* CTA */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap: 16, marginTop: 22 }}>
            <button style={{
              padding:"14px 30px", borderRadius: 12, border:"none", fontSize: 15, fontWeight: 600, fontFamily:"var(--font-sans)",
              cursor: uploaded ? "pointer" : "not-allowed",
              background: uploaded ? "var(--au7o-blue)" : "var(--paper-2)",
              color: uploaded ? "#fff" : "var(--slate-400)",
              boxShadow: uploaded ? "0 8px 22px rgba(59,130,246,0.32)" : "none",
              display:"inline-flex", alignItems:"center", gap: 8,
            }}>
              <Icon name="spark" size={15}/> Start diagnosis
            </button>
            <span style={{ fontSize: 13, color:"var(--slate-500)" }}>Free · results in seconds</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 2 · DESKTOP HUB CHAT — analyzes inline, then result ─────────
function DesktopHubChat({ analyzing = false }) {
  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", background:"var(--paper)", overflow:"hidden" }}>
      <DeskNav vehicle/>
      {/* vehicle context strip */}
      <div style={{ display:"flex", alignItems:"center", gap: 10, padding:"10px 40px", borderBottom:"1px solid var(--paper-line)", background:"#fff" }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>2015 Dodge Challenger SRT 392</span>
        <span style={{ display:"inline-flex", alignItems:"center", gap: 5, padding:"2px 9px", background:"var(--warn-bg)", borderRadius: 999 }}>
          <span className="status-dot warn" style={{ width: 6, height: 6 }}/>
          <span style={{ fontSize: 10.5, fontWeight: 700, color:"#92400E" }}>1 OVERDUE</span>
        </span>
        <span style={{ marginLeft:"auto", fontSize: 12, color:"var(--slate-500)" }}>Maintenance · Recalls · Parts</span>
      </div>

      <div style={{ flex: 1, overflow:"auto", position:"relative" }}>
        <div style={{ maxWidth: 720, margin:"0 auto", padding:"24px 24px 120px" }}>
          {/* greeting + maintenance schedule */}
          <div style={{ display:"flex", gap: 12, alignItems:"flex-start" }}>
            <img src="brand/au7o-mascot.png" alt="" style={{ width: 28, height: 28, marginTop: 2 }}/>
            <p style={{ flex: 1, fontSize: 14, color:"var(--ink)", lineHeight: 1.55, margin: 0, maxWidth: 560 }}>
              Welcome — I pulled the maintenance schedule for your SRT 392. Heads up, your <b>brake fluid is overdue</b>.
            </p>
          </div>
          <div style={{ marginTop: 12, marginLeft: 40, maxWidth: 460, background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 12, overflow:"hidden", boxShadow:"var(--shadow-1)" }}>
            <div style={{ padding:"10px 14px", borderBottom:"1px solid var(--paper-line)", display:"flex", alignItems:"center", gap: 8 }}>
              <Icon name="wrench" size={12} style={{ color:"var(--au7o-blue)" }}/>
              <span className="eyebrow" style={{ fontSize: 9.5, color:"var(--au7o-blue)" }}>MAINTENANCE SCHEDULE</span>
              <span style={{ marginLeft:"auto", fontSize: 11, color:"var(--slate-500)" }}>64,218 mi</span>
            </div>
            {[{label:"Brake fluid flush",note:"Overdue · 4 yr",c:"#B45309"},{label:"Engine oil & filter",note:"Due in 782 mi",c:"var(--au7o-blue)"}].map((r,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"center", gap: 10, padding:"9px 14px", borderBottom: i<1?"1px solid var(--paper-line)":"none" }}>
                <span style={{ width: 7, height: 7, borderRadius:"50%", background: r.c, flexShrink: 0 }}/>
                <span style={{ fontSize: 12.5, fontWeight: 600 }}>{r.label}</span>
                <span style={{ marginLeft:"auto", fontSize: 11, fontWeight: 600, color: r.c }}>{r.note}</span>
              </div>
            ))}
          </div>

          {/* divider */}
          <div style={{ display:"flex", alignItems:"center", gap: 12, margin:"22px 0 6px" }}>
            <span style={{ flex: 1, height: 1, background:"var(--paper-line)" }}/>
            <span className="mono" style={{ fontSize: 9.5, color:"var(--slate-400)", letterSpacing:"0.06em", fontWeight: 600 }}>YOUR UPLOAD · JUST NOW</span>
            <span style={{ flex: 1, height: 1, background:"var(--paper-line)" }}/>
          </div>

          {/* user photo bubble */}
          <div style={{ display:"flex", justifyContent:"flex-end" }}>
            <div style={{ maxWidth: 320 }}>
              <div style={{ borderRadius:"16px 16px 4px 16px", overflow:"hidden", border:"3px solid var(--ink)", position:"relative", height: 150 }}>
                <HeroEngineBay/>
                <div style={{ position:"absolute", bottom: 7, left: 7, padding:"3px 8px", background:"rgba(11,18,32,0.7)", borderRadius: 6, fontSize: 9.5, color:"#fff", fontFamily:"var(--font-mono)" }}>engine-bay-squeal.jpg</div>
              </div>
              <div style={{ background:"var(--ink)", color:"#fff", padding:"8px 13px", borderRadius:"0 0 4px 16px", fontSize: 13, marginTop:-2 }}>
                Hearing a squeal from here on cold start
              </div>
            </div>
          </div>

          {analyzing ? (
            <div style={{ marginTop: 16, display:"flex", gap: 12, alignItems:"flex-start" }}>
              <img src="brand/au7o-mascot.png" alt="" style={{ width: 28, height: 28, marginTop: 2 }}/>
              <div style={{ flex: 1, maxWidth: 420, background:"#fff", border:"1px solid var(--paper-line)", borderRadius:"4px 16px 16px 16px", padding:"14px 16px", boxShadow:"var(--shadow-1)" }}>
                <div style={{ display:"flex", alignItems:"center", gap: 9, marginBottom: 12 }}>
                  <span className="au7o-pulse-soft" style={{ width: 9, height: 9, borderRadius:"50%", background:"var(--au7o-blue)" }}/>
                  <span style={{ fontSize: 13.5, fontWeight: 600 }}>Analyzing your photo…</span>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap: 8 }}>
                  {[{t:"Identifying components in frame",done:true},{t:"Matching against 4,200+ known issues",active:true},{t:"Finding the part that fits your trim"}].map((s,i)=>(
                    <div key={i} style={{ display:"flex", alignItems:"center", gap: 10 }}>
                      <span style={{ width: 18, height: 18, borderRadius:"50%", flexShrink: 0, background: s.done?"var(--ok)":s.active?"var(--au7o-blue)":"var(--paper-2)", border: s.done||s.active?"none":"1px solid var(--paper-line)", display:"inline-flex", alignItems:"center", justifyContent:"center", color:"#fff" }}>
                        {s.done ? <Icon name="check" size={10}/> : s.active ? <span className="au7o-pulse-soft" style={{ width: 7, height: 7, borderRadius:"50%", background:"#fff" }}/> : null}
                      </span>
                      <span style={{ fontSize: 12.5, fontWeight: s.active?600:500, color: s.done||s.active?"var(--ink)":"var(--slate-500)" }}>{s.t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <React.Fragment>
              <div style={{ marginTop: 16, display:"flex", gap: 12, alignItems:"flex-start" }}>
                <img src="brand/au7o-mascot.png" alt="" style={{ width: 28, height: 28, marginTop: 2 }}/>
                <p style={{ flex: 1, fontSize: 14, color:"var(--ink)", lineHeight: 1.55, margin: 0, maxWidth: 560 }}>
                  That squeal plus the glazing I can see is a <b>known issue on your SRT 392</b> — here's what I found:
                </p>
              </div>
              <div style={{ marginTop: 12, marginLeft: 40, maxWidth: 460, background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 14, overflow:"hidden", boxShadow:"var(--shadow-1)" }}>
                <div style={{ padding:"12px 14px", borderBottom:"1px solid var(--paper-line)", display:"flex", alignItems:"center", gap: 10 }}>
                  <span className="status-dot warn" style={{ width: 9, height: 9 }}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, letterSpacing:"-0.01em" }}>Serpentine Belt — Glazed</div>
                    <div className="mono" style={{ fontSize: 9.5, color:"var(--slate-500)", marginTop: 1 }}>MATCHES 1,840 KNOWN REPORTS</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div className="mono" style={{ fontSize: 17, fontWeight: 700, color:"var(--ok)", lineHeight: 1 }}>92%</div>
                    <div style={{ fontSize: 8, color:"var(--slate-500)", letterSpacing:"0.06em", fontWeight: 600 }}>MATCH</div>
                  </div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", borderBottom:"1px solid var(--paper-line)" }}>
                  {[{k:"SEVERITY",v:"Medium",c:"var(--warn)"},{k:"FIX TIME",v:"30 min",c:"var(--ink)"},{k:"DIY COST",v:"$48",c:"var(--ok)"}].map((s,i)=>(
                    <div key={i} style={{ padding:"10px 13px", borderRight: i<2?"1px solid var(--paper-line)":"none" }}>
                      <div className="eyebrow" style={{ fontSize: 8.5 }}>{s.k}</div>
                      <div className="mono" style={{ fontSize: 13.5, fontWeight: 700, color: s.c, marginTop: 2 }}>{s.v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ padding:"11px 14px", background:"rgba(59,130,246,0.04)", display:"flex", alignItems:"center", gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 8, background:"#fff", border:"1px solid var(--paper-line)", display:"inline-flex", alignItems:"center", justifyContent:"center", flexShrink: 0 }}>
                    <Icon name="settings" size={18} style={{ color:"var(--slate-500)" }}/>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600 }}>Gates Micro-V Serpentine Belt</div>
                    <div className="mono" style={{ fontSize: 9.5, color:"var(--slate-500)" }}>K060841 · FITS YOUR 6.4L · IN STOCK</div>
                  </div>
                  <button className="chip chip-sm" style={{ fontSize: 11.5, background:"var(--ink)", color:"#fff", border:"none" }}>
                    <Icon name="spark" size={11}/> Order · $48
                  </button>
                </div>
              </div>
              {/* suggestion chips */}
              <div style={{ marginTop: 14, marginLeft: 40, display:"flex", gap: 8, flexWrap:"wrap" }}>
                {[{icon:"book",t:"Walk me through the replacement"},{icon:"wrench",t:"Bundle with my overdue brake fluid"},{icon:"map",t:"Find a shop near me"}].map((s,i)=>(
                  <button key={i} style={{ display:"inline-flex", alignItems:"center", gap: 8, padding:"9px 14px", background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 999, fontFamily:"var(--font-sans)", fontSize: 12.5, color:"var(--ink)", cursor:"pointer" }}>
                    <Icon name={s.icon} size={12} style={{ color:"var(--au7o-blue)" }}/> {s.t}
                  </button>
                ))}
              </div>
            </React.Fragment>
          )}
        </div>

        {/* composer */}
        <div style={{ position:"absolute", left: 0, right: 0, bottom: 0, padding:"14px 24px 20px", background:"linear-gradient(180deg, rgba(247,246,242,0) 0%, var(--paper) 50%)" }}>
          <div style={{ maxWidth: 720, margin:"0 auto", background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 16, boxShadow:"var(--shadow-2)", padding:"9px 9px 9px 18px", display:"flex", alignItems:"center", gap: 10 }}>
            <Icon name="chat" size={15} style={{ color:"var(--slate-400)" }}/>
            <span style={{ flex: 1, fontSize: 14, color:"var(--slate-400)" }}>{analyzing ? "Au7o is analyzing…" : "Ask a follow-up, or upload another photo…"}</span>
            <button style={{ display:"inline-flex", alignItems:"center", gap: 6, padding:"8px 14px", background:"var(--paper-2)", border:"1px solid var(--paper-line)", borderRadius: 10, fontSize: 12.5, fontWeight: 600, color:"var(--slate-700)", cursor:"pointer", fontFamily:"var(--font-sans)" }}>
              <Icon name="camera" size={13}/> Upload
            </button>
            <button style={{ width: 36, height: 36, borderRadius: 10, background:"var(--ink)", border:"none", display:"inline-flex", alignItems:"center", justifyContent:"center", color:"#fff" }}>
              <Icon name="send" size={14}/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { DesktopUploadDiagnose, DesktopHubChat, DeskNav });
