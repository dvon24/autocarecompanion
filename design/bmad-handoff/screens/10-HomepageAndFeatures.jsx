/* ============================================================
   Au7o handoff · HomePageMerged — the recommended replacement for au7o.io home: diagnose hero + KEEPS the vehicle-picker tool + proof strip + diagnose showcase + how-it-works + premium upsell. FeaturesPage — the /pricing destination (hero, proof, how-it-works, the 3-tier pricing grid, FAQ). DEPENDS ON _diagnose-visuals.jsx (DiagnoseHeroPhone, ValueRow, DIAGNOSE_VALUE) and 12-Pricing.jsx (PricingTiers).
   ============================================================ */
/* Au7o · Redesigned features / subscribe page
   Leads with the photo/video diagnosis hero moment, value before price,
   then proof (known-issue + parts matching), comparison, FAQ, price.
*/
function FeaturesPage() {
  return (
    <div style={{ background:"var(--paper)", fontFamily:"var(--font-sans)", color:"var(--ink)" }}>
      {/* nav */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 56px", borderBottom:"1px solid var(--paper-line)", position:"sticky", top: 0, background:"rgba(247,246,242,0.9)", backdropFilter:"blur(10px)", zIndex: 10 }}>
        <Au7oMark size={26}/>
        <div style={{ display:"flex", alignItems:"center", gap: 22 }}>
          <span style={{ fontSize: 13.5, color:"var(--slate-700)", fontWeight: 500 }}>Known Issues</span>
          <span style={{ fontSize: 13.5, color:"var(--slate-700)", fontWeight: 500 }}>Drive</span>
          <button style={{ padding:"8px 16px", background:"var(--ink)", color:"#fff", border:"none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor:"pointer", fontFamily:"var(--font-sans)" }}>Sign In</button>
        </div>
      </div>

      {/* HERO */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: 48, alignItems:"center", padding:"64px 56px 72px", maxWidth: 1200, margin:"0 auto" }}>
        <div>
          <div style={{ display:"inline-flex", alignItems:"center", gap: 8, padding:"5px 12px", background:"var(--au7o-blue-50)", borderRadius: 999, marginBottom: 22 }}>
            <Icon name="camera" size={13} style={{ color:"var(--au7o-blue)" }}/>
            <span style={{ fontSize: 12, fontWeight: 600, color:"var(--au7o-blue-700)" }}>New · Photo & video diagnosis</span>
          </div>
          <h1 style={{ fontSize: 52, fontWeight: 700, letterSpacing:"-0.03em", lineHeight: 1.04, margin: 0 }}>
            Show Au7o<br/>what's wrong.
          </h1>
          <p style={{ fontSize: 18, color:"var(--slate-700)", lineHeight: 1.5, margin:"20px 0 0", maxWidth: 460 }}>
            Point your camera at a leak, a worn tread, or a strange part — even record the noise. Au7o matches it to <b style={{ color:"var(--ink)" }}>4,200+ known issues</b> and the exact part that fits your car.
          </p>
          <div style={{ display:"flex", gap: 12, marginTop: 30, alignItems:"center" }}>
            <button style={{ padding:"14px 26px", background:"var(--au7o-blue)", color:"#fff", border:"none", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor:"pointer", fontFamily:"var(--font-sans)", display:"inline-flex", alignItems:"center", gap: 8, boxShadow:"0 8px 22px rgba(59,130,246,0.35)" }}>
              <Icon name="camera" size={16}/> Try a diagnosis free
            </button>
            <span style={{ fontSize: 13, color:"var(--slate-500)" }}>No card needed to start</span>
          </div>
        </div>
        <div style={{ display:"flex", justifyContent:"center" }}>
          <DiagnoseHeroPhone scale={1.32}/>
        </div>
      </div>

      {/* PROOF STRIP */}
      <div style={{ background:"var(--ink)", padding:"30px 56px" }}>
        <div style={{ maxWidth: 1000, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap: 24 }}>
          {[
            ["4,200+","known issues matched"],
            ["12,000+","parts in the catalog"],
            ["738+","models covered"],
            ["92%","avg. match confidence"],
          ].map(([n,l],i)=>(
            <div key={i} style={{ textAlign:"center" }}>
              <div className="mono" style={{ fontSize: 30, fontWeight: 700, color:"#fff", letterSpacing:"-0.02em" }}>{n}</div>
              <div style={{ fontSize: 12.5, color:"rgba(255,255,255,0.6)", marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS — 3 steps */}
      <div style={{ padding:"64px 56px", maxWidth: 1100, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom: 44 }}>
          <div className="eyebrow" style={{ color:"var(--au7o-blue)" }}>HOW IT WORKS</div>
          <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing:"-0.025em", margin:"8px 0 0" }}>From a photo to the fix in seconds</h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap: 20 }}>
          {[
            { n:"01", icon:"camera", title:"Capture it", body:"Photo, video, or a voice note describing the sound or smell. Au7o sees what's in frame." },
            { n:"02", icon:"search", title:"Au7o matches it", body:"It cross-references thousands of documented issues for your exact make, model, and trim." },
            { n:"03", icon:"settings", title:"Get the part & fix", body:"The right part number, what it costs, and a step-by-step guide — or book a shop." },
          ].map((s,i)=>(
            <div key={i} style={{ background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 16, padding:"24px 22px", boxShadow:"var(--shadow-1)" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: 16 }}>
                <span style={{ width: 44, height: 44, borderRadius: 12, background:"var(--au7o-blue-50)", display:"inline-flex", alignItems:"center", justifyContent:"center", color:"var(--au7o-blue)" }}>
                  <Icon name={s.icon} size={20}/>
                </span>
                <span className="mono" style={{ fontSize: 22, fontWeight: 700, color:"var(--paper-line)" }}>{s.n}</span>
              </div>
              <div style={{ fontSize: 17, fontWeight: 600, letterSpacing:"-0.01em" }}>{s.title}</div>
              <p style={{ fontSize: 13.5, color:"var(--slate-700)", lineHeight: 1.5, margin:"6px 0 0" }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* PRICING — three tiers */}
      <div style={{ padding:"8px 56px 64px", maxWidth: 1060, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom: 30 }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing:"-0.02em", margin: 0 }}>Plans for every kind of owner</h2>
          <p style={{ fontSize: 15, color:"var(--slate-700)", margin:"8px 0 0" }}>Start free. Upgrade when you want the full garage. Cancel anytime.</p>
        </div>
        <PricingTiers/>
        <div style={{ textAlign:"center", fontSize: 12, color:"var(--slate-500)", marginTop: 18, display:"flex", alignItems:"center", justifyContent:"center", gap: 7 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          Secure payment via Stripe · all plans cancel anytime
        </div>
      </div>

      {/* FAQ */}
      <div style={{ padding:"0 56px 72px", maxWidth: 720, margin:"0 auto" }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing:"-0.02em", textAlign:"center", marginBottom: 22 }}>Common questions</h2>
        <div style={{ display:"flex", flexDirection:"column", gap: 10 }}>
          {[
            ["How accurate is the photo diagnosis?","Au7o shows a confidence score with every match and cites how many documented reports it's based on. It always recommends verifying with your service manual or a mechanic for safety-critical work."],
            ["Can I cancel anytime?","Yes. You keep access until the end of your billing period, and your garage and history are preserved if you come back."],
            ["What if Au7o isn't sure?","You'll see the next most likely matches, and you can add another angle, a video, or describe the sound to narrow it down."],
          ].map(([q,a],i)=>(
            <div key={i} style={{ background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 12, padding:"16px 20px" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap: 12 }}>
                <span style={{ fontSize: 15, fontWeight: 600 }}>{q}</span>
                <Icon name="chevron-down" size={15} style={{ color:"var(--slate-400)", flexShrink: 0 }}/>
              </div>
              <p style={{ fontSize: 13.5, color:"var(--slate-700)", lineHeight: 1.55, margin:"10px 0 0" }}>{a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* footer */}
      <div style={{ borderTop:"1px solid var(--paper-line)", padding:"28px 56px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <Au7oMark size={22}/>
        <span style={{ fontSize: 12, color:"var(--slate-500)" }}>Built for DIY mechanics. Privacy-first.</span>
      </div>
    </div>
  );
}

Object.assign(window, { FeaturesPage, HomePageMerged });

// ════════════════════════════════════════════════════════════════
// MERGED HOMEPAGE — diagnose hero + vehicle picker utility + upsell
// Keeps the known-issues tool (SEO + free value) AND sells Premium.
// ════════════════════════════════════════════════════════════════
function HomePageMerged() {
  const makes = ["Dodge","BMW","Ford","Toyota","Honda","Subaru","Chevrolet","Jeep"];
  return (
    <div style={{ background:"var(--paper)", fontFamily:"var(--font-sans)", color:"var(--ink)" }}>
      {/* nav */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 56px", borderBottom:"1px solid var(--paper-line)", position:"sticky", top: 0, background:"rgba(247,246,242,0.9)", backdropFilter:"blur(10px)", zIndex: 10 }}>
        <Au7oMark size={26}/>
        <div style={{ display:"flex", alignItems:"center", gap: 22 }}>
          <span style={{ fontSize: 13.5, color:"var(--slate-700)", fontWeight: 500 }}>Known Issues</span>
          <span style={{ fontSize: 13.5, color:"var(--slate-700)", fontWeight: 500 }}>Drive</span>
          <span style={{ fontSize: 13.5, color:"var(--slate-700)", fontWeight: 500 }}>Pricing</span>
          <button style={{ padding:"8px 16px", background:"var(--ink)", color:"#fff", border:"none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor:"pointer", fontFamily:"var(--font-sans)" }}>Sign In</button>
        </div>
      </div>

      {/* HERO — diagnose magic LEFT, the free vehicle-picker tool RIGHT */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: 48, alignItems:"center", padding:"60px 56px 64px", maxWidth: 1200, margin:"0 auto" }}>
        <div>
          <div style={{ display:"inline-flex", alignItems:"center", gap: 8, padding:"5px 12px", background:"var(--au7o-blue-50)", borderRadius: 999, marginBottom: 22 }}>
            <Icon name="camera" size={13} style={{ color:"var(--au7o-blue)" }}/>
            <span style={{ fontSize: 12, fontWeight: 600, color:"var(--au7o-blue-700)" }}>New · Photo & video diagnosis</span>
          </div>
          <h1 style={{ fontSize: 50, fontWeight: 700, letterSpacing:"-0.03em", lineHeight: 1.04, margin: 0 }}>
            Know your car's<br/>weak spots.
          </h1>
          <p style={{ fontSize: 17.5, color:"var(--slate-700)", lineHeight: 1.5, margin:"18px 0 0", maxWidth: 470 }}>
            Show Au7o a photo or video of the problem — it matches what it sees to <b style={{ color:"var(--ink)" }}>4,200+ known issues</b> and the exact part. Or browse documented problems for your exact car, free.
          </p>
          <div style={{ display:"flex", gap: 12, marginTop: 28, alignItems:"center" }}>
            <button style={{ padding:"14px 24px", background:"var(--au7o-blue)", color:"#fff", border:"none", borderRadius: 12, fontSize: 14.5, fontWeight: 600, cursor:"pointer", fontFamily:"var(--font-sans)", display:"inline-flex", alignItems:"center", gap: 8, boxShadow:"0 8px 22px rgba(59,130,246,0.32)" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/></svg> Upload a photo to diagnose
            </button>
            <span style={{ fontSize: 13, color:"var(--slate-500)" }}>Free · no card needed</span>
          </div>
        </div>

        {/* RIGHT — the free utility, front and center */}
        <div style={{ background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 18, padding: 24, boxShadow:"var(--shadow-2)" }}>
          <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom: 14 }}>
            <span style={{ fontSize: 14.5, fontWeight: 600, letterSpacing:"-0.01em" }}>Find issues for your car</span>
            <div style={{ display:"flex", gap: 12 }}>
              {[["4,231+","issues"],["738+","models"]].map(([n,l],i)=>(
                <span key={i} style={{ display:"flex", alignItems:"baseline", gap: 4 }}>
                  <span className="mono" style={{ fontSize: 12, fontWeight: 700, color:"var(--au7o-blue)" }}>{n}</span>
                  <span style={{ fontSize: 11, color:"var(--slate-500)" }}>{l}</span>
                </span>
              ))}
            </div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap: 9 }}>
            <div style={{ display:"flex", alignItems:"center", gap: 8, padding:"12px 14px", background:"var(--paper-2)", border:"1px solid var(--paper-line)", borderRadius: 10, fontSize: 14, color:"var(--slate-600)" }}>
              <Icon name="car" size={15} style={{ color:"var(--slate-400)" }}/> Select make
              <Icon name="chevron-down" size={13} style={{ color:"var(--slate-400)", marginLeft:"auto" }}/>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap: 8, padding:"12px 14px", background:"var(--paper-2)", border:"1px solid var(--paper-line)", borderRadius: 10, fontSize: 14, color:"var(--slate-400)" }}>
              Select model
              <Icon name="chevron-down" size={13} style={{ color:"var(--slate-400)", marginLeft:"auto" }}/>
            </div>
            <button style={{ padding:"13px 0", background:"var(--ink)", color:"#fff", border:"none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor:"pointer", fontFamily:"var(--font-sans)", display:"inline-flex", alignItems:"center", justifyContent:"center", gap: 7 }}>
              <Icon name="search" size={14}/> Browse known issues
            </button>
          </div>
          <div style={{ display:"flex", gap: 6, flexWrap:"wrap", marginTop: 14, paddingTop: 14, borderTop:"1px solid var(--paper-line)" }}>
            <span style={{ fontSize: 11, color:"var(--slate-500)", alignSelf:"center", marginRight: 2 }}>Popular:</span>
            {makes.map((m,i)=>(
              <span key={i} style={{ padding:"4px 10px", background:"var(--paper-2)", border:"1px solid var(--paper-line)", borderRadius: 999, fontSize: 11.5, color:"var(--slate-700)", fontWeight: 500 }}>{m}</span>
            ))}
          </div>
        </div>
      </div>

      {/* PROOF STRIP */}
      <div style={{ background:"var(--ink)", padding:"28px 56px" }}>
        <div style={{ maxWidth: 1000, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap: 24 }}>
          {[["4,200+","known issues matched"],["12,000+","parts in the catalog"],["738+","models covered"],["92%","avg. match confidence"]].map(([n,l],i)=>(
            <div key={i} style={{ textAlign:"center" }}>
              <div className="mono" style={{ fontSize: 28, fontWeight: 700, color:"#fff", letterSpacing:"-0.02em" }}>{n}</div>
              <div style={{ fontSize: 12, color:"rgba(255,255,255,0.6)", marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* THE DIAGNOSE MOMENT — full showcase band */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: 48, alignItems:"center", padding:"64px 56px", maxWidth: 1160, margin:"0 auto" }}>
        <div style={{ display:"flex", justifyContent:"center" }}>
          <DiagnoseHeroPhone scale={1.28}/>
        </div>
        <div>
          <div className="eyebrow" style={{ color:"var(--au7o-blue)" }}>WHAT MAKES AU7O DIFFERENT</div>
          <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing:"-0.025em", margin:"8px 0 0", lineHeight: 1.1 }}>Don't know the part?<br/>Just show it.</h2>
          <p style={{ fontSize: 15, color:"var(--slate-700)", lineHeight: 1.5, margin:"12px 0 24px", maxWidth: 440 }}>
            Most people can't name the part that's failing — but they can point a camera at it. Au7o does the rest.
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap: 16 }}>
            {DIAGNOSE_VALUE.map((v,i)=><ValueRow key={i} item={v}/>)}
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div style={{ padding:"8px 56px 64px", maxWidth: 1100, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom: 40 }}>
          <div className="eyebrow" style={{ color:"var(--au7o-blue)" }}>HOW IT WORKS</div>
          <h2 style={{ fontSize: 30, fontWeight: 700, letterSpacing:"-0.025em", margin:"8px 0 0" }}>From a photo to the fix in seconds</h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap: 20 }}>
          {[
            { n:"01", icon:"camera", title:"Capture it", body:"Photo, video, or a voice note describing the sound or smell. Au7o sees what's in frame." },
            { n:"02", icon:"search", title:"Au7o matches it", body:"It cross-references thousands of documented issues for your exact make, model, and trim." },
            { n:"03", icon:"settings", title:"Get the part & fix", body:"The right part number, what it costs, and a step-by-step guide — or book a shop." },
          ].map((s,i)=>(
            <div key={i} style={{ background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 16, padding:"24px 22px", boxShadow:"var(--shadow-1)" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: 16 }}>
                <span style={{ width: 44, height: 44, borderRadius: 12, background:"var(--au7o-blue-50)", display:"inline-flex", alignItems:"center", justifyContent:"center", color:"var(--au7o-blue)" }}>
                  <Icon name={s.icon} size={20}/>
                </span>
                <span className="mono" style={{ fontSize: 22, fontWeight: 700, color:"var(--paper-line)" }}>{s.n}</span>
              </div>
              <div style={{ fontSize: 17, fontWeight: 600, letterSpacing:"-0.01em" }}>{s.title}</div>
              <p style={{ fontSize: 13.5, color:"var(--slate-700)", lineHeight: 1.5, margin:"6px 0 0" }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* PREMIUM UPSELL — compact, links to full pricing */}
      <div style={{ padding:"0 56px 64px", maxWidth: 860, margin:"0 auto" }}>
        <div style={{ background:"linear-gradient(135deg,var(--au7o-blue),var(--au7o-blue-700))", borderRadius: 20, padding:"34px 40px", display:"flex", alignItems:"center", gap: 28, boxShadow:"0 16px 40px rgba(59,130,246,0.28)" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing:"0.1em", color:"rgba(255,255,255,0.7)", marginBottom: 8 }}>AU7O PREMIUM</div>
            <h2 style={{ fontSize: 25, fontWeight: 700, letterSpacing:"-0.02em", margin: 0, color:"#fff" }}>Unlimited diagnoses + your full garage</h2>
            <p style={{ fontSize: 14, color:"rgba(255,255,255,0.85)", margin:"8px 0 0", lineHeight: 1.5 }}>Track maintenance, get service reminders, and save up to 10 vehicles. Start free.</p>
          </div>
          <div style={{ textAlign:"center" }}>
            <button style={{ padding:"15px 28px", background:"#fff", color:"var(--au7o-blue-700)", border:"none", borderRadius: 12, fontSize: 15.5, fontWeight: 700, cursor:"pointer", fontFamily:"var(--font-sans)", whiteSpace:"nowrap" }}>See what's included</button>
            <div style={{ fontSize: 11.5, color:"rgba(255,255,255,0.8)", marginTop: 9 }}>Plus from $14.99/mo · cancel anytime</div>
          </div>
        </div>
      </div>

      {/* footer */}
      <div style={{ borderTop:"1px solid var(--paper-line)", padding:"26px 56px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <Au7oMark size={22}/>
        <span style={{ fontSize: 12, color:"var(--slate-500)" }}>Built for DIY mechanics. Vehicle data stored locally in your browser.</span>
      </div>
    </div>
  );
}

Object.assign(window, { FeaturesPage, HomePageMerged });
