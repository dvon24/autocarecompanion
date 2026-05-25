/* Au7o · Known Issues — REVISED ENTRY FLOW
   Addresses six critiques of the original wiki:
   1. Sticky "your car" filter under hero on every page
   2. Symptom-first search hero (not make-grid)
   3. Collapsed issue cards led by cost
   4. Personal-context CTA on every browse page
   5. Cost ranges anchored to shops/region (with median)
   6. Error code search as a primary path
*/

const { useState: kiUseState } = React;

// ─── Shared: persistent "your car" bar that pins under any KI page header
function YourCarBar({ vehicle = "2015 Dodge Challenger SRT 392", mileage = "64,218 mi", zip = "94703", onChange }) {
  return (
    <div style={{
      position:"sticky", top: 56, zIndex: 8,
      background:"rgba(247,243,234,0.92)", backdropFilter:"blur(20px) saturate(140%)",
      borderBottom:"1px solid var(--paper-line)",
      padding:"10px 32px",
      display:"flex", alignItems:"center", gap: 18,
    }}>
      <span style={{ fontSize: 11, color:"var(--slate-500)", letterSpacing:"0.06em", fontWeight: 600, textTransform:"uppercase" }}>Your car</span>
      <button style={{
        display:"inline-flex", alignItems:"center", gap: 8, padding:"6px 12px",
        background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 999,
        fontFamily:"var(--font-sans)", fontSize: 13, color:"var(--ink)", cursor:"pointer",
      }}>
        <span style={{ width: 18, height: 18, borderRadius:"50%", background:"#E2E8F0", display:"flex", alignItems:"center", justifyContent:"center", fontSize: 9, fontWeight: 700 }}>D</span>
        {vehicle}
        <span style={{ color:"var(--slate-500)", fontSize: 12 }}>· {mileage}</span>
        <Icon name="chevron-down" size={11} style={{ color:"var(--slate-500)" }}/>
      </button>
      <div style={{ flex: 1 }}/>
      <span style={{ display:"inline-flex", alignItems:"center", gap: 6, fontSize: 12, color:"var(--slate-500)" }}>
        <Icon name="map" size={12}/>
        Showing prices near <a style={{ color:"var(--ink)", fontWeight: 500, cursor:"pointer", textDecoration:"underline", textUnderlineOffset: 3 }}>{zip}</a>
        <span style={{ marginLeft: 12 }}>·</span>
        <a style={{ color:"var(--ink)", fontWeight: 500, cursor:"pointer", marginLeft: 4 }}>Change</a>
      </span>
    </div>
  );
}

function KITopNav({ crumbs = [] }) {
  return (
    <header style={{
      position:"sticky", top: 0, zIndex: 9,
      height: 56, padding:"0 32px",
      display:"flex", alignItems:"center", justifyContent:"space-between",
      borderBottom:"1px solid var(--paper-line)",
      background:"rgba(255,255,255,0.85)", backdropFilter:"blur(20px) saturate(140%)",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap: 16 }}>
        <Au7oMark size={24} color="var(--ink)"/>
        <div style={{ display:"flex", alignItems:"center", gap: 6, fontSize: 13, color:"var(--slate-500)" }}>
          {crumbs.map((c,i,a) => (
            <React.Fragment key={i}>
              <a style={{ color: i === a.length-1 ? "var(--ink)" : "var(--slate-500)", cursor:"pointer", fontWeight: i === a.length-1 ? 500 : 400 }}>{c}</a>
              {i < a.length-1 && <span style={{ color:"var(--slate-300)" }}>/</span>}
            </React.Fragment>
          ))}
        </div>
      </div>
      <div style={{ display:"flex", gap: 10, alignItems:"center" }}>
        <a style={{ fontSize: 13, color:"var(--slate-700)", cursor:"pointer" }}>Sign in</a>
        <button style={{ padding:"6px 14px", background:"var(--ink)", color:"#fff", border:"none", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor:"pointer" }}>Open Au7o</button>
      </div>
    </header>
  );
}

// ═══ V1 — REVISED INDEX: symptom-first hero, code search, makes secondary ═══
function KIRevisedIndex() {
  const [tab, setTab] = kiUseState("symptom"); // symptom | code | car
  return (
    <div style={{ background:"var(--paper)", minHeight:"100%" }}>
      <KITopNav crumbs={["Au7o", "Known Issues"]}/>
      <YourCarBar/>

      {/* Symptom-first hero */}
      <section style={{ padding:"56px 32px 48px", maxWidth: 1080, margin:"0 auto" }}>
        <div style={{ textAlign:"center", maxWidth: 760, margin:"0 auto" }}>
          <span className="eyebrow" style={{ color:"var(--au7o-blue)" }}>KNOWN ISSUES · NHTSA-VERIFIED</span>
          <h1 style={{ fontSize: 56, fontWeight: 600, letterSpacing:"-0.035em", lineHeight: 1.0, marginTop: 14, fontFamily:'"Geist", sans-serif' }}>
            What's going on with your car?
          </h1>
          <p style={{ fontSize: 16, color:"var(--slate-700)", lineHeight: 1.55, marginTop: 16, maxWidth: 580, margin:"16px auto 0" }}>
            Describe a symptom, drop a code, or pick your car — Au7o pulls the right issues for your <b style={{ color:"var(--ink)" }}>2015 Challenger</b>.
          </p>
        </div>

        {/* Three-tab symptom/code/car search hero */}
        <div style={{ marginTop: 36, background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 22, boxShadow:"0 30px 60px rgba(11,18,32,0.08)", overflow:"hidden" }}>
          {/* Tabs */}
          <div style={{ display:"flex", borderBottom:"1px solid var(--paper-line)", padding:"0 8px" }}>
            {[
              { id:"symptom", icon:"chat", label:"By symptom",  hint:"\"shakes at 60mph\"" },
              { id:"code",    icon:"alert", label:"By error code", hint:"P0420 · B1320" },
              { id:"car",     icon:"list", label:"Browse by car", hint:"34 makes" },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding:"16px 20px", background:"transparent", border:"none",
                borderBottom: tab === t.id ? "2px solid var(--ink)" : "2px solid transparent",
                marginBottom:-1,
                fontFamily:"var(--font-sans)", fontSize: 13.5, fontWeight: 500,
                color: tab === t.id ? "var(--ink)" : "var(--slate-500)",
                cursor:"pointer", display:"inline-flex", alignItems:"center", gap: 8,
              }}>
                <Icon name={t.icon} size={14}/>
                {t.label}
                <span style={{ color:"var(--slate-400)", fontWeight: 400, fontFamily:"var(--font-mono)", fontSize: 11 }}>{t.hint}</span>
              </button>
            ))}
          </div>

          {/* Search row */}
          {tab === "symptom" && <SymptomSearchPanel/>}
          {tab === "code"    && <CodeSearchPanel/>}
          {tab === "car"     && <CarBrowsePanel/>}
        </div>

        {/* Trending issues for YOUR car (personalization) */}
        <div style={{ marginTop: 44 }}>
          <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, letterSpacing:"-0.01em" }}>
              Common at your mileage <span style={{ color:"var(--slate-500)", fontWeight: 400 }}>· 2015 Challenger · 64k+ mi</span>
            </h2>
            <a style={{ fontSize: 13, color:"var(--ink)", cursor:"pointer", fontWeight: 500 }}>See all 11 issues for your car →</a>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap: 12 }}>
            {[
              { name:"Driveshaft U-joint failure", cost:"$300–$2,500", median:"$890", common:"~14% at 60k+", sev:"high" },
              { name:"EPS rack failure",            cost:"$1,200–$2,800", median:"$1,950", common:"Recall S19 · open", sev:"high" },
              { name:"Hemi tick at idle",           cost:"$0–$1,200",   median:"often $0", common:"Cosmetic in most cases", sev:"low" },
            ].map((i,k) => (
              <a key={k} style={{
                display:"block", padding:"16px 18px",
                background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 14,
                cursor:"pointer", textDecoration:"none",
              }}>
                <div style={{ display:"flex", alignItems:"center", gap: 8 }}>
                  <span className={`status-dot ${i.sev === "high" ? "crit" : i.sev === "low" ? "ok" : "warn"}`}/>
                  <span style={{ fontSize: 11, color:"var(--slate-500)", letterSpacing:"0.06em", textTransform:"uppercase", fontWeight: 600 }}>{i.common}</span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color:"var(--ink)", marginTop: 8, letterSpacing:"-0.01em" }}>{i.name}</div>
                <div style={{ display:"flex", alignItems:"baseline", gap: 8, marginTop: 8 }}>
                  <span style={{ fontFamily:"var(--font-mono)", fontSize: 13, fontWeight: 600, color:"var(--ink)" }}>{i.median}</span>
                  <span style={{ fontSize: 11, color:"var(--slate-500)" }}>median near 94703 · range {i.cost}</span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Browse all makes — secondary, low-key */}
        <div style={{ marginTop: 56, paddingTop: 32, borderTop:"1px solid var(--paper-line)" }}>
          <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom: 18 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color:"var(--slate-700)", letterSpacing:"-0.005em" }}>Browse the full library</h2>
            <span style={{ fontSize: 12, color:"var(--slate-500)" }}>34 makes · 650 models · 4,312 documented issues</span>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(8, 1fr)", gap: 8 }}>
            {["Acura","Audi","BMW","Cadillac","Chevy","Chrysler","Dodge","Ford","GMC","Honda","Hyundai","Infiniti","Jeep","Kia","Lexus","Mazda","Mercedes","Nissan","Porsche","RAM","Subaru","Tesla","Toyota","VW"].map((m,i) => (
              <a key={i} style={{
                display:"block", padding:"10px 12px",
                background: m === "Dodge" ? "var(--paper-2)" : "#fff",
                border:"1px solid var(--paper-line)", borderRadius: 8,
                fontSize: 13, color:"var(--ink)", cursor:"pointer", textAlign:"center",
                fontWeight: m === "Dodge" ? 600 : 400,
              }}>{m}{m === "Dodge" && <span style={{ marginLeft: 4, fontSize: 10, color:"var(--au7o-blue)" }}>(yours)</span>}</a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function SymptomSearchPanel() {
  return (
    <div style={{ padding: 20 }}>
      <div style={{ display:"flex", gap: 10, alignItems:"center", padding:"6px 8px 6px 16px", background:"var(--paper-2)", border:"1px solid var(--paper-line)", borderRadius: 14 }}>
        <Icon name="search" size={16} style={{ color:"var(--slate-500)" }}/>
        <input
          placeholder="Describe what's happening — &quot;steering shudders at 60mph&quot;, &quot;coolant smell after parking&quot;, &quot;ticking from valve cover&quot;..."
          style={{ flex: 1, border:"none", outline:"none", background:"transparent", fontFamily:"var(--font-sans)", fontSize: 14, padding:"10px 0", color:"var(--ink)" }}
        />
        <button style={{ padding:"9px 16px", background:"var(--ink)", color:"#fff", border:"none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor:"pointer", display:"inline-flex", alignItems:"center", gap: 6 }}>
          Search <Icon name="chevron" size={11}/>
        </button>
      </div>
      <div style={{ marginTop: 14, display:"flex", flexWrap:"wrap", gap: 6, alignItems:"center" }}>
        <span style={{ fontSize: 11, color:"var(--slate-500)", letterSpacing:"0.06em", fontWeight: 600, textTransform:"uppercase", marginRight: 6 }}>Common for your car:</span>
        {[
          "Vibration at highway speed",
          "Whirring on cold start",
          "Tick at idle",
          "Coolant smell",
          "Soft brake pedal",
          "Steering wandering",
        ].map((q,i) => (
          <button key={i} style={{
            padding:"5px 11px", background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 999,
            fontSize: 12, color:"var(--slate-700)", cursor:"pointer", fontFamily:"var(--font-sans)",
          }}>{q}</button>
        ))}
      </div>
    </div>
  );
}

function CodeSearchPanel() {
  return (
    <div style={{ padding: 20 }}>
      <div style={{ display:"flex", gap: 10, alignItems:"center", padding:"6px 8px 6px 16px", background:"var(--paper-2)", border:"1px solid var(--paper-line)", borderRadius: 14 }}>
        <Icon name="alert" size={16} style={{ color:"var(--slate-500)" }}/>
        <input
          placeholder="Drop a code — P0420, B1320, U0100, C0035... or paste a list from your scanner"
          style={{ flex: 1, border:"none", outline:"none", background:"transparent", fontFamily:"var(--font-mono)", fontSize: 14, padding:"10px 0", color:"var(--ink)", letterSpacing:"0.04em" }}
        />
        <button style={{ padding:"9px 16px", background:"var(--ink)", color:"#fff", border:"none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor:"pointer", display:"inline-flex", alignItems:"center", gap: 6 }}>
          Decode <Icon name="chevron" size={11}/>
        </button>
      </div>
      <div style={{ marginTop: 14, display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap: 8 }}>
        {[
          { code:"P0420", label:"Catalyst efficiency below threshold", count:"42 issues" },
          { code:"P0300", label:"Random/multiple cylinder misfire",    count:"31 issues" },
          { code:"B1320", label:"Air bag deployment loop",             count:"6 recalls" },
          { code:"U0100", label:"Lost comm with ECM/PCM",              count:"18 issues" },
        ].map((c,i) => (
          <button key={i} style={{
            padding:"10px 12px", background:"var(--paper-2)", border:"1px solid var(--paper-line)", borderRadius: 10,
            cursor:"pointer", textAlign:"left", fontFamily:"var(--font-sans)",
          }}>
            <div style={{ fontFamily:"var(--font-mono)", fontSize: 12.5, fontWeight: 700, color:"var(--ink)", letterSpacing:"0.04em" }}>{c.code}</div>
            <div style={{ fontSize: 11, color:"var(--slate-700)", marginTop: 3, lineHeight: 1.3 }}>{c.label}</div>
            <div style={{ fontSize: 10.5, color:"var(--au7o-blue)", marginTop: 4, fontWeight: 500 }}>{c.count} →</div>
          </button>
        ))}
      </div>
      <div style={{ marginTop: 12, fontSize: 12, color:"var(--slate-500)" }}>
        Don't have a scanner? <a style={{ color:"var(--ink)", fontWeight: 500, cursor:"pointer", textDecoration:"underline", textUnderlineOffset: 3 }}>$25 dongles that work with Au7o →</a>
      </div>
    </div>
  );
}

function CarBrowsePanel() {
  return (
    <div style={{ padding: 20 }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr auto", gap: 8 }}>
        {[
          { l:"Year", v:"2015" },
          { l:"Make", v:"Dodge" },
          { l:"Model", v:"Challenger" },
          { l:"Trim", v:"SRT 392", optional: true },
        ].map((f,i) => (
          <button key={i} style={{
            background:"var(--paper-2)", border:"1px solid var(--paper-line)",
            borderRadius: 12, padding:"10px 14px", textAlign:"left", cursor:"pointer",
          }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing:"0.08em", color:"var(--slate-500)", textTransform:"uppercase" }}>
              {f.l}{f.optional && <span style={{ color:"var(--slate-400)", marginLeft: 4 }}>opt.</span>}
            </div>
            <div style={{ fontSize: 14, color:"var(--ink)", marginTop: 3, fontWeight: 600 }}>{f.v}</div>
          </button>
        ))}
        <button style={{
          background:"var(--ink)", color:"#fff", border:"none",
          borderRadius: 12, padding:"0 22px", fontWeight: 600, fontSize: 13.5, cursor:"pointer",
          display:"flex", alignItems:"center", gap: 6,
        }}>
          See issues <Icon name="chevron" size={11}/>
        </button>
      </div>
      <div style={{ marginTop: 12, fontSize: 12, color:"var(--slate-500)" }}>
        Forgot your year? <a style={{ color:"var(--ink)", fontWeight: 500, cursor:"pointer", textDecoration:"underline", textUnderlineOffset: 3 }}>VIN lookup</a> · <a style={{ color:"var(--ink)", fontWeight: 500, cursor:"pointer", textDecoration:"underline", textUnderlineOffset: 3 }}>License plate</a>
      </div>
    </div>
  );
}

// ═══ V2 — REVISED MAKE PAGE: BMW with personal-context CTA, anchored cost ═══
function KIRevisedBMWPage() {
  return (
    <div style={{ background:"var(--paper)", minHeight:"100%" }}>
      <KITopNav crumbs={["Au7o", "Known Issues", "BMW"]}/>
      <YourCarBar/>

      {/* PERSONAL CONTEXT BANNER — fix #4 */}
      <div style={{
        background:"linear-gradient(180deg, rgba(59,130,246,0.06), rgba(59,130,246,0.02))",
        borderBottom:"1px solid rgba(59,130,246,0.18)",
        padding:"12px 32px",
      }}>
        <div style={{ maxWidth: 1080, margin:"0 auto", display:"flex", alignItems:"center", gap: 14 }}>
          <span style={{ width: 32, height: 32, borderRadius:"50%", background:"#fff", border:"1px solid rgba(59,130,246,0.25)", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--au7o-blue)" }}>
            <Icon name="info" size={14}/>
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, color:"var(--ink)" }}>
              You're browsing BMW issues — but <b>your garage is a 2015 Dodge Challenger</b>.
            </div>
            <div style={{ fontSize: 12, color:"var(--slate-500)", marginTop: 2 }}>
              Au7o can show issues scoped to what you actually drive.
            </div>
          </div>
          <button style={{
            padding:"9px 16px", background:"var(--au7o-blue)", color:"#fff", border:"none",
            borderRadius: 10, fontSize: 13, fontWeight: 600, cursor:"pointer",
            display:"inline-flex", alignItems:"center", gap: 6,
          }}>
            View issues for my Challenger <Icon name="chevron" size={11}/>
          </button>
          <button style={{ background:"transparent", border:"none", color:"var(--slate-500)", cursor:"pointer", padding: 4, display:"inline-flex" }}>
            <Icon name="x" size={14}/>
          </button>
        </div>
      </div>

      {/* Make hero */}
      <section style={{ padding:"36px 32px 24px", maxWidth: 1080, margin:"0 auto" }}>
        <div style={{ display:"flex", alignItems:"flex-end", gap: 24, paddingBottom: 24, borderBottom:"1px solid var(--paper-line)" }}>
          <div style={{ width: 76, height: 76, background:"#0166B1", borderRadius: 18, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontFamily:'"Geist", sans-serif', fontWeight: 700, fontSize: 26, letterSpacing:"-0.04em" }}>BMW</div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 40, fontWeight: 600, letterSpacing:"-0.03em", lineHeight: 1, fontFamily:'"Geist", sans-serif' }}>BMW</h1>
            <div style={{ fontSize: 13, color:"var(--slate-500)", marginTop: 6, display:"flex", gap: 18 }}>
              <span><b style={{ color:"var(--ink)" }}>23</b> models tracked</span>
              <span><b style={{ color:"var(--ink)" }}>312</b> documented issues</span>
              <span><b style={{ color:"var(--ink)" }}>47</b> open recalls</span>
            </div>
          </div>
          <div style={{ display:"flex", gap: 8 }}>
            <input placeholder="Filter models..." style={{ padding:"9px 14px", background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 10, fontSize: 13, fontFamily:"var(--font-sans)", outline:"none", width: 200 }}/>
          </div>
        </div>

        {/* Models grid — collapsed cards leading with cost */}
        <div style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color:"var(--slate-700)", letterSpacing:"0.04em", textTransform:"uppercase", marginBottom: 14 }}>Top BMW models by issue volume</h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap: 10 }}>
            {[
              { model:"3 Series (F30 · 2012-2018)", issues: 28, openRecalls: 4, biggest:"N20 timing chain", cost:"$2,400", priceRange:"$1,800–$3,500", localShops: 12 },
              { model:"5 Series (F10 · 2010-2017)", issues: 21, openRecalls: 3, biggest:"Coolant pump electric", cost:"$1,150", priceRange:"$900–$1,600", localShops: 11 },
              { model:"1 Series (E82 · 2008-2013)", issues: 18, openRecalls: 1, biggest:"Oil filter housing leak", cost:"$1,050", priceRange:"$850–$1,400", localShops: 9 },
              { model:"X3 (F25 · 2011-2017)", issues: 17, openRecalls: 2, biggest:"Transfer case actuator", cost:"$1,650", priceRange:"$1,200–$2,400", localShops: 10 },
              { model:"X5 (E70 · 2007-2013)", issues: 24, openRecalls: 5, biggest:"Air suspension failure", cost:"$3,200", priceRange:"$2,400–$4,500", localShops: 8 },
              { model:"7 Series (F01 · 2009-2015)", issues: 19, openRecalls: 2, biggest:"V8 timing chain guide", cost:"$5,800", priceRange:"$4,200–$8,000", localShops: 6 },
            ].map((m,i) => (
              <a key={i} style={{
                display:"flex", alignItems:"center", gap: 16, padding:"14px 16px",
                background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 12,
                cursor:"pointer", textDecoration:"none",
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color:"var(--ink)", letterSpacing:"-0.01em" }}>{m.model}</div>
                  <div style={{ fontSize: 12, color:"var(--slate-500)", marginTop: 4, display:"flex", gap: 12 }}>
                    <span><b style={{ color:"var(--slate-700)" }}>{m.issues}</b> issues</span>
                    {m.openRecalls > 0 && <span style={{ color:"#B45309" }}><b>{m.openRecalls}</b> open recalls</span>}
                    <span>· biggest: {m.biggest}</span>
                  </div>
                </div>
                {/* Cost panel — anchored to local shops */}
                <div style={{ textAlign:"right", paddingRight: 8 }}>
                  <div style={{ fontFamily:"var(--font-mono)", fontSize: 15, fontWeight: 600, color:"var(--ink)" }}>~{m.cost}</div>
                  <div style={{ fontSize: 10.5, color:"var(--slate-500)" }}>median · {m.localShops} shops near you</div>
                </div>
                <Icon name="chevron" size={13} style={{ color:"var(--slate-400)" }}/>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// ═══ V3 — REVISED ISSUE DETAIL: collapsed by default, cost-led, anchored ═══
function KIRevisedIssueDetail() {
  const [expanded, setExpanded] = kiUseState(null);
  const issues = [
    {
      code:"BMW-N20-TC",
      name:"N20 Timing Chain Guide Failure",
      severity:"high",
      median:"$2,400",
      range:"$1,800–$3,500",
      shops: 12,
      mileage: { typical: "62k–88k", median: 74000, low: 60000, high: 95000, peak: 0.42, note: "Earliest reports start ~58k; the bulge sits around 70–80k miles." },
      symptoms: ["Rattle on cold start (1-3 sec)", "Whining at idle", "Loss of power", "Check engine light · P0016, P0017", "Failure of guide may cause valve damage"],
      affected:"2012-2015 BMW · all N20 4-cyl turbo (228i, 320i, 328i, 428i, 528i, X1, X3)",
      hits: 4218,
      summary: "The N20's plastic timing chain guides shed material between 60-90k miles, especially on engines built before BMW's mid-2015 part revision. Once the guide cracks, the chain develops slack, jumps a tooth, and at worst contacts the valves — turning a $2,400 preventive job into an $8,000 head replacement.",
      whyItHappens: "Early N20s shipped with a brittle plastic guide BMW themselves issued an updated part for in late 2015 (PN 11318648732). Heat cycling, extended oil intervals, and stop-and-go traffic accelerate the cracking. Owners running 10,000-mi factory intervals report failures earlier than those on 5,000-mi changes.",
      fixes: [
        { name:"Preventive replacement (recommended)", cost:"$2,400 median", time:"6-8 hrs", risk:"low", note:"Updated guide, tensioner, chain, and oil pump nut. Most independent BMW shops do this as a package. The job is your one shot to prevent total failure." },
        { name:"Reactive repair (post-failure)", cost:"$3,200-$8,000", time:"8-16 hrs", risk:"high", note:"If the chain has already jumped, valves are bent. Now you're into a head rebuild or a used head swap. Avoid this path." },
        { name:"DIY (advanced)", cost:"$650 in parts", time:"~12 hrs", risk:"medium", note:"Possible with timing tools (~$180 rental) and a service manual. BimmerForums has photo walkthroughs. Get the head torque sequence right or you're in worse shape." },
      ],
      whatOwnersDo: "Most owners we track do the preventive job between 70-85k miles, paired with a valve cover gasket since the labor overlaps. Independent BMW shops in your area average $2,400 — about 40% less than the dealer's $3,800. Owners who skip it and the chain jumps spend $5,800 average, plus a tow.",
      threads: [
        { source:"BimmerForums", title:"Preventive timing chain guide @ 67k — worth it?", responses: 184, when:"3 weeks ago" },
        { source:"r/BMW",        title:"Heard a rattle this morning. P0016. Am I cooked?", responses: 92,  when:"6 days ago" },
        { source:"E90Post",      title:"DIY guide replacement — photo walkthrough", responses: 312, when:"4 months ago" },
      ],
    },
    {
      code:"BMW-N20-OFH",
      name:"Oil Filter Housing Gasket Leak",
      severity:"medium",
      median:"$650",
      range:"$450–$950",
      shops: 18,
      mileage: { typical: "75k–110k", median: 88000, low: 65000, high: 130000, peak: 0.50, note: "Bell curve centers near 90k; rare under 60k." },
      symptoms: ["Oil drips on alternator", "Burning oil smell", "Low oil warning between changes", "Visible weep under filter housing"],
      affected:"2007-2018 BMW · all N20 / N52 / N55 engines",
      hits: 3104,
      summary: "A near-universal BMW failure on N20/N52/N55 engines: the rubber gasket between the oil filter housing and the block hardens after ~80k miles and starts weeping oil — directly onto the alternator and serpentine belt below it. Cheap part, awkward labor, expensive if ignored.",
      whyItHappens: "BMW's gasket compound doesn't survive a decade of heat cycling. The housing itself is fine — the gasket and a small plastic O-ring are what fail. Catching it early means a 90-minute job; ignoring it means oil-soaked belt, a fried alternator, and possibly water pump damage when the oil migrates.",
      fixes: [
        { name:"Gasket replacement (recommended)", cost:"$650 median", time:"1.5-2 hrs", risk:"low", note:"Includes the housing gasket, O-ring, and a new oil filter. Most shops also recommend changing the serpentine belt while it's off — adds ~$80." },
        { name:"DIY", cost:"$45 in parts", time:"~3 hrs first time", risk:"low", note:"Genuine BMW gasket kit (PN 11428637821) + a 10mm + E10 torx. Most common DIY job on this engine; YouTube has dozens of walkthroughs." },
        { name:"Wait and see", cost:"$0 today / $1,400+ later", time:"-", risk:"high", note:"Not recommended. Once oil hits the alternator, you're replacing two things instead of one." },
      ],
      whatOwnersDo: "About 70% of N20 owners we track have done this job by 90k miles, ~half of them DIY. Forum consensus: don't pay the dealer $1,200 for it — the labor isn't hard enough to justify the markup. Independent BMW specialists charge ~$580 in your area.",
      threads: [
        { source:"BimmerForums", title:"OFHG leak at 78k — DIY or shop?", responses: 156, when:"1 week ago" },
        { source:"YouTube",      title:"BMW N20 oil filter housing gasket — full walkthrough (FCP Euro)", responses: 0, when:"views: 412k" },
        { source:"r/BMW",        title:"How bad is it if I drove 200 miles with the leak?", responses: 47, when:"2 weeks ago" },
      ],
    },
    {
      code:"BMW-N20-VC",
      name:"Valve Cover Gasket Leak",
      severity:"low",
      median:"$280",
      range:"$180–$420",
      shops: 22,
      mileage: { typical: "80k–120k", median: 96000, low: 70000, high: 145000, peak: 0.46, note: "Slow-developing leak; most reports cluster around 90–105k." },
      symptoms: ["Burning oil smell when warm", "Oil residue on valve cover", "No drivability impact"],
      affected:"2012-2018 BMW · all N20 engines",
      hits: 2189,
      summary: "The valve cover gasket weeps oil down the side of the engine — annoying but not urgent. You'll smell oil burning off the exhaust manifold but the engine runs fine. Most owners bundle this with the oil filter housing gasket since the labor overlaps.",
      whyItHappens: "Same heat-cycle story as the OFHG — rubber loses its compliance after ~80k miles. The N20's valve cover is plastic, and aggressive over-torquing during prior service can crack the cover itself, which makes a $280 gasket job into a $640 valve cover replacement.",
      fixes: [
        { name:"Gasket only (recommended)", cost:"$280 median", time:"1-2 hrs", risk:"low", note:"Just the gasket and spark plug seals. Cheap, fast, often bundled with OFHG repair." },
        { name:"Cover + gasket", cost:"$640 median", time:"2 hrs", risk:"low", note:"If the cover has stress cracks (check around the bolt holes). Owners on aftermarket aluminum covers report no recurrence." },
        { name:"DIY", cost:"$35 parts", time:"~2 hrs", risk:"low", note:"Easiest N20 gasket job. Eight bolts, careful torque sequence, no special tools." },
      ],
      whatOwnersDo: "Most owners wait until they're already paying for the OFHG and bundle this in for a small labor add. DIY rate is ~60% on this one — it's the entry-level N20 repair.",
      threads: [
        { source:"BimmerForums", title:"VCG + OFHG package — fair price?", responses: 89, when:"5 days ago" },
        { source:"E90Post",      title:"Aftermarket aluminum valve covers — worth it?", responses: 234, when:"8 months ago" },
      ],
    },
  ];

  return (
    <div style={{ background:"var(--paper)", minHeight:"100%" }}>
      <KITopNav crumbs={["Au7o", "Known Issues", "BMW", "1 Series", "Engine"]}/>
      <YourCarBar/>

      {/* Personal-context CTA repeats here */}
      <div style={{ padding:"10px 32px", background:"rgba(59,130,246,0.04)", borderBottom:"1px solid rgba(59,130,246,0.12)" }}>
        <div style={{ maxWidth: 1080, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", fontSize: 13 }}>
          <span style={{ color:"var(--slate-700)" }}>
            <Icon name="info" size={12} style={{ display:"inline", marginRight: 6, verticalAlign:"-1px", color:"var(--au7o-blue)" }}/>
            These don't apply to your <b style={{ color:"var(--ink)" }}>2015 Challenger</b> — different platform.
          </span>
          <a style={{ color:"var(--ink)", fontWeight: 500, cursor:"pointer" }}>See your Challenger's top issues →</a>
        </div>
      </div>

      <section style={{ padding:"32px 32px 56px", maxWidth: 1080, margin:"0 auto" }}>
        {/* Article hero */}
        <div style={{ paddingBottom: 24, borderBottom:"1px solid var(--paper-line)" }}>
          <div style={{ fontSize: 11, color:"var(--slate-500)", letterSpacing:"0.08em", fontWeight: 600, textTransform:"uppercase", marginBottom: 10 }}>BMW · 1 Series · ENGINE — N20 PLATFORM</div>
          <h1 style={{ fontSize: 36, fontWeight: 600, letterSpacing:"-0.03em", lineHeight: 1.1, fontFamily:'"Geist", sans-serif' }}>
            Known issues on the BMW N20 turbo-four
          </h1>
          <p style={{ fontSize: 15, color:"var(--slate-700)", lineHeight: 1.55, marginTop: 12, maxWidth: 720 }}>
            The N20 is BMW's 2.0L turbo I4 found across 2012-2018 lineups. Three failures dominate this engine — listed by severity. Au7o pulls cost data from <b>local shops near 94703</b> and forum threads (BimmerForums, BMW E90).
          </p>
          <div style={{ display:"flex", gap: 8, marginTop: 14, alignItems:"center" }}>
            <span className="chip chip-sm">Engine</span>
            <span className="chip chip-sm">N20 platform</span>
            <span className="chip chip-sm">2012-2018</span>
            <span style={{ flex: 1 }}/>
            <span style={{ fontSize: 12, color:"var(--slate-500)" }}>Last verified 12 days ago · 4,218 owner reports</span>
          </div>
        </div>

        {/* Collapsed issue cards */}
        <div style={{ marginTop: 24, display:"flex", flexDirection:"column", gap: 10 }}>
          {issues.map((iss, i) => (
            <CollapsedIssueCard
              key={i}
              issue={iss}
              expanded={expanded === iss.code}
              onToggle={() => setExpanded(expanded === iss.code ? null : iss.code)}
              defaultOpen={i === 0 && expanded === null}
            />
          ))}
        </div>

        {/* Au7o anchor at the end */}
        <div style={{
          marginTop: 32, padding: "20px 22px",
          background:"linear-gradient(180deg,#fff,#FAF8F2)", border:"1px solid var(--paper-line)", borderRadius: 16,
          display:"flex", alignItems:"center", gap: 16,
        }}>
          <div style={{ width: 40, height: 40, background:"var(--au7o-blue)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontFamily:'"Geist", sans-serif', fontWeight: 700, fontSize: 15 }}>A</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color:"var(--ink)" }}>Want me to walk through any of these?</div>
            <div style={{ fontSize: 12.5, color:"var(--slate-500)", marginTop: 2 }}>Tell me your symptom and I'll narrow it down — or I can prep what to ask the shop.</div>
          </div>
          <button style={{ padding:"9px 16px", background:"var(--ink)", color:"#fff", border:"none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor:"pointer", display:"inline-flex", alignItems:"center", gap: 6 }}>
            Open in Au7o <Icon name="chevron" size={11}/>
          </button>
        </div>
      </section>
    </div>
  );
}

// Collapsed issue card — cost-led, expand for details
function CollapsedIssueCard({ issue, expanded, onToggle, defaultOpen }) {
  const isOpen = expanded || defaultOpen;
  return (
    <div style={{
      background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 14,
      overflow:"hidden",
    }}>
      {/* Header row — always visible. Cost-led. */}
      <button onClick={onToggle} style={{
        width:"100%", display:"flex", alignItems:"center", gap: 16,
        padding:"16px 18px",
        background:"transparent", border:"none", cursor:"pointer", textAlign:"left",
      }}>
        <span className={`status-dot ${issue.severity === "high" ? "crit" : issue.severity === "medium" ? "warn" : "ok"}`} style={{ flex:"0 0 auto" }}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display:"flex", alignItems:"center", gap: 10 }}>
            <span style={{ fontFamily:"var(--font-mono)", fontSize: 11, color:"var(--slate-500)", letterSpacing:"0.04em" }}>{issue.code}</span>
            <span style={{ fontSize: 10.5, padding:"2px 7px", borderRadius: 4, background: issue.severity === "high" ? "#FEE2E2" : issue.severity === "medium" ? "#FEF3C7" : "#D1FAE5", color: issue.severity === "high" ? "#991B1B" : issue.severity === "medium" ? "#92400E" : "#065F46", fontWeight: 600, letterSpacing:"0.04em", textTransform:"uppercase" }}>{issue.severity}</span>
            <span style={{ fontSize: 11, color:"var(--slate-500)" }}>{issue.hits.toLocaleString()} reports</span>
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, color:"var(--ink)", marginTop: 4, letterSpacing:"-0.01em" }}>{issue.name}</div>
        </div>
        {/* COST PANEL — leads visually */}
        <div style={{ textAlign:"right", paddingRight: 10, flex:"0 0 auto" }}>
          <div style={{ fontFamily:"var(--font-mono)", fontSize: 18, fontWeight: 700, color:"var(--ink)", letterSpacing:"-0.01em" }}>{issue.median}</div>
          <div style={{ fontSize: 10.5, color:"var(--slate-500)" }}>median · {issue.shops} shops near you</div>
        </div>
        <span style={{
          width: 26, height: 26, borderRadius:"50%",
          background:"var(--paper-2)", display:"flex", alignItems:"center", justifyContent:"center",
          color:"var(--slate-500)",
          transform: isOpen ? "rotate(180deg)" : "none", transition:"transform 200ms",
        }}>
          <Icon name="chevron-down" size={12}/>
        </span>
      </button>

      {/* Expanded content */}
      {isOpen && (
        <div style={{ padding:"4px 22px 22px", borderTop:"1px solid var(--paper-line)" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap: 28, paddingTop: 18 }}>

            {/* LEFT — editorial column */}
            <div>
              {/* Summary lede */}
              <p style={{
                fontSize: 15, lineHeight: 1.6, color:"var(--ink)",
                margin: 0, fontWeight: 400,
                borderLeft:"3px solid var(--paper-line)", paddingLeft: 14,
              }}>
                {issue.summary}
              </p>

              {/* Why it happens */}
              <SectionHeader>Why it happens</SectionHeader>
              <p style={{ fontSize: 13.5, lineHeight: 1.6, color:"var(--slate-700)", margin: 0 }}>
                {issue.whyItHappens}
              </p>

              {/* Symptoms — compact inline */}
              <SectionHeader>How it shows up</SectionHeader>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, color:"var(--slate-700)", lineHeight: 1.65 }}>
                {issue.symptoms.map((s,i) => <li key={i}>{s}</li>)}
              </ul>

              {/* Fix paths — the core editorial value */}
              <SectionHeader>What owners do about it</SectionHeader>
              <p style={{ fontSize: 13.5, lineHeight: 1.6, color:"var(--slate-700)", margin:"0 0 14px" }}>
                {issue.whatOwnersDo}
              </p>
              <div style={{ display:"flex", flexDirection:"column", gap: 8 }}>
                {issue.fixes.map((f,i) => <FixPath key={i} fix={f} index={i}/>)}
              </div>

              {/* Affected — small print */}
              <SectionHeader>Affected vehicles</SectionHeader>
              <div style={{ fontSize: 12.5, color:"var(--slate-700)", lineHeight: 1.5 }}>{issue.affected}</div>
            </div>

            {/* RIGHT — cost panel + threads */}
            <div style={{ display:"flex", flexDirection:"column", gap: 14 }}>
              {/* Cost detail — anchored */}
              <div style={{ background:"var(--paper-2)", border:"1px solid var(--paper-line)", borderRadius: 12, padding:"14px 16px" }}>
                <div style={{ fontSize: 11, color:"var(--slate-500)", letterSpacing:"0.06em", fontWeight: 600, textTransform:"uppercase", marginBottom: 10 }}>Cost near 94703</div>
                <div style={{ display:"flex", alignItems:"baseline", gap: 8 }}>
                  <span style={{ fontFamily:"var(--font-mono)", fontSize: 24, fontWeight: 700, color:"var(--ink)", letterSpacing:"-0.02em" }}>{issue.median}</span>
                  <span style={{ fontSize: 11, color:"var(--slate-500)" }}>regional median</span>
                </div>
                <div style={{ marginTop: 14, padding:"6px 0" }}>
                  <div style={{ position:"relative", height: 6, background:"var(--paper-line)", borderRadius: 3 }}>
                    <div style={{ position:"absolute", left:"15%", right:"20%", top: 0, bottom: 0, background:"linear-gradient(90deg, #10B981, #F59E0B, #EF4444)", borderRadius: 3 }}/>
                    <div style={{ position:"absolute", left:"45%", top:-2, width: 2, height: 10, background:"var(--ink)" }}/>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize: 10.5, fontFamily:"var(--font-mono)", color:"var(--slate-500)", marginTop: 4 }}>
                    <span>{issue.range.split("–")[0]}</span>
                    <span style={{ color:"var(--ink)", fontWeight: 600 }}>median</span>
                    <span>{issue.range.split("–")[1]}</span>
                  </div>
                </div>
                <a style={{ display:"inline-flex", alignItems:"center", gap: 4, fontSize: 12.5, color:"var(--au7o-blue)", marginTop: 14, cursor:"pointer", fontWeight: 500 }}>
                  <Icon name="map" size={11}/> See {issue.shops} shops near you →
                </a>
              </div>

              {/* Mileage onset — when this issue typically shows up */}
              {issue.mileage && <MileageOnsetCard mileage={issue.mileage} userMileage={64218}/>}

              {/* Forum threads — what real owners are saying */}
              <div style={{ background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 12, padding:"14px 16px" }}>
                <div style={{ fontSize: 11, color:"var(--slate-500)", letterSpacing:"0.06em", fontWeight: 600, textTransform:"uppercase", marginBottom: 10 }}>What owners are saying</div>
                {issue.threads.map((t,i) => (
                  <a key={i} style={{
                    display:"block", padding:"9px 0",
                    borderTop: i > 0 ? "1px solid var(--paper-line)" : "none",
                    cursor:"pointer", textDecoration:"none",
                  }}>
                    <div style={{ display:"flex", alignItems:"center", gap: 6, marginBottom: 3 }}>
                      <span style={{ fontSize: 10, fontFamily:"var(--font-mono)", color:"var(--au7o-blue)", fontWeight: 600, letterSpacing:"0.04em" }}>{t.source}</span>
                      <span style={{ fontSize: 10.5, color:"var(--slate-500)", marginLeft:"auto" }}>{t.when}</span>
                    </div>
                    <div style={{ fontSize: 12.5, color:"var(--ink)", lineHeight: 1.4, fontWeight: 500 }}>{t.title}</div>
                    {t.responses > 0 && (
                      <div style={{ fontSize: 10.5, color:"var(--slate-500)", marginTop: 3 }}>
                        <Icon name="chat" size={9} style={{ display:"inline", verticalAlign:"-1px", marginRight: 3 }}/>
                        {t.responses} responses
                      </div>
                    )}
                  </a>
                ))}
                <a style={{ display:"inline-flex", alignItems:"center", gap: 4, fontSize: 12, color:"var(--au7o-blue)", marginTop: 8, cursor:"pointer", fontWeight: 500 }}>
                  See all threads →
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MileageOnsetCard({ mileage, userMileage }) {
  // Map a value into the [low, high] range, clamped to 0..1
  const pct = (v) => Math.max(0, Math.min(1, (v - mileage.low) / (mileage.high - mileage.low)));
  const userPct = pct(userMileage);
  const userInRange = userMileage >= mileage.low && userMileage <= mileage.high;
  const userBeforeWindow = userMileage < mileage.low;
  const fmt = (n) => `${Math.round(n / 1000)}k`;

  // Status color based on where the user sits
  const status = userBeforeWindow
    ? { label: "Not yet in the window", color: "#065F46", bg: "#D1FAE5" }
    : userInRange
    ? { label: "You're in the window", color: "#92400E", bg: "#FEF3C7" }
    : { label: "Past the typical window", color: "#475569", bg: "#E2E8F0" };

  return (
    <div style={{ background:"var(--paper-2)", border:"1px solid var(--paper-line)", borderRadius: 12, padding:"14px 16px" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: 10 }}>
        <div style={{ fontSize: 11, color:"var(--slate-500)", letterSpacing:"0.06em", fontWeight: 600, textTransform:"uppercase" }}>Typically shows up at</div>
        <span style={{ fontSize: 9.5, fontWeight: 700, padding:"3px 7px", borderRadius: 4, background: status.bg, color: status.color, letterSpacing:"0.04em", textTransform:"uppercase" }}>{status.label}</span>
      </div>

      <div style={{ display:"flex", alignItems:"baseline", gap: 8 }}>
        <span style={{ fontFamily:"var(--font-mono)", fontSize: 24, fontWeight: 700, color:"var(--ink)", letterSpacing:"-0.02em" }}>{mileage.typical}</span>
        <span style={{ fontSize: 11, color:"var(--slate-500)" }}>typical onset · mi</span>
      </div>

      {/* Distribution bar — bell curve hint with a window highlight */}
      <div style={{ marginTop: 14, padding:"10px 0 6px" }}>
        <div style={{ position:"relative", height: 36 }}>
          {/* baseline track */}
          <div style={{ position:"absolute", left: 0, right: 0, top: 22, height: 6, background:"var(--paper-line)", borderRadius: 3 }}/>
          {/* typical window highlight (low → high) */}
          <div style={{
            position:"absolute",
            left: `${pct(mileage.low) * 100}%`,
            right: `${(1 - pct(mileage.high)) * 100}%`,
            top: 22, height: 6,
            background:"linear-gradient(90deg, rgba(245,158,11,0.35), rgba(245,158,11,0.85), rgba(245,158,11,0.35))",
            borderRadius: 3,
          }}/>
          {/* median tick */}
          <div style={{ position:"absolute", left: `${pct(mileage.median) * 100}%`, top: 18, width: 2, height: 14, background:"var(--ink)", transform:"translateX(-1px)" }}/>
          <div style={{ position:"absolute", left: `${pct(mileage.median) * 100}%`, top: 0, transform:"translate(-50%, 0)", fontSize: 10, fontFamily:"var(--font-mono)", color:"var(--ink)", fontWeight: 700, whiteSpace:"nowrap" }}>{fmt(mileage.median)}</div>
          {/* user marker */}
          <div style={{
            position:"absolute",
            left: `${userPct * 100}%`,
            top: 14, transform:"translateX(-50%)",
            display:"flex", flexDirection:"column", alignItems:"center", gap: 1,
            pointerEvents:"none",
          }}>
            <span className="au7o-pulse-soft" style={{ width: 14, height: 14, borderRadius:"50%", background:"var(--au7o-blue)", border:"3px solid var(--paper)", boxShadow:"0 0 0 1px var(--au7o-blue)" }}/>
          </div>
          <div style={{
            position:"absolute",
            left: `${userPct * 100}%`,
            bottom: -2, transform:"translateX(-50%)",
            fontSize: 9.5, fontFamily:"var(--font-mono)", fontWeight: 700, color:"var(--au7o-blue)", whiteSpace:"nowrap", letterSpacing:"0.04em",
          }}>YOU · {fmt(userMileage)}</div>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", fontSize: 10.5, fontFamily:"var(--font-mono)", color:"var(--slate-500)", marginTop: 22 }}>
          <span>{fmt(mileage.low)}</span>
          <span>{fmt(mileage.high)}</span>
        </div>
      </div>

      <div style={{ fontSize: 12, color:"var(--slate-700)", lineHeight: 1.45, marginTop: 4, paddingTop: 12, borderTop:"1px solid var(--paper-line)" }}>
        {mileage.note}
      </div>
    </div>
  );
}

function SectionHeader({ children }) {
  return (
    <div style={{
      fontSize: 11, color:"var(--slate-500)", letterSpacing:"0.08em",
      fontWeight: 600, textTransform:"uppercase",
      marginTop: 22, marginBottom: 10,
    }}>{children}</div>
  );
}

function FixPath({ fix, index }) {
  const riskColor = { low:"#065F46", medium:"#92400E", high:"#991B1B" }[fix.risk];
  const riskBg    = { low:"#D1FAE5", medium:"#FEF3C7", high:"#FEE2E2" }[fix.risk];
  return (
    <div style={{
      display:"grid", gridTemplateColumns:"22px 1fr",
      gap: 12,
      padding:"12px 14px",
      background: index === 0 ? "rgba(59,130,246,0.04)" : "#fff",
      border: index === 0 ? "1px solid rgba(59,130,246,0.2)" : "1px solid var(--paper-line)",
      borderRadius: 10,
    }}>
      <div style={{
        width: 22, height: 22, borderRadius:"50%",
        background:"var(--paper-2)", color:"var(--slate-700)",
        display:"flex", alignItems:"center", justifyContent:"center",
        fontFamily:"var(--font-mono)", fontSize: 11, fontWeight: 700,
      }}>{index + 1}</div>
      <div>
        <div style={{ display:"flex", alignItems:"center", gap: 8, flexWrap:"wrap" }}>
          <span style={{ fontSize: 13.5, fontWeight: 600, color:"var(--ink)", letterSpacing:"-0.005em" }}>{fix.name}</span>
          <span style={{ fontFamily:"var(--font-mono)", fontSize: 11, color:"var(--ink)", fontWeight: 600 }}>{fix.cost}</span>
          <span style={{ fontSize: 11, color:"var(--slate-500)" }}>· {fix.time}</span>
          <span style={{
            padding:"1px 7px", borderRadius: 4, fontSize: 10, fontWeight: 600,
            color: riskColor, background: riskBg, letterSpacing:"0.04em", textTransform:"uppercase",
          }}>{fix.risk} risk</span>
        </div>
        <div style={{ fontSize: 12.5, color:"var(--slate-700)", lineHeight: 1.5, marginTop: 5 }}>{fix.note}</div>
      </div>
    </div>
  );
}

Object.assign(window, {
  KIRevisedIndex, KIRevisedBMWPage, KIRevisedIssueDetail,
  YourCarBar, KITopNav, CollapsedIssueCard,
  SymptomSearchPanel, CodeSearchPanel, CarBrowsePanel,
  SectionHeader, FixPath,
});
