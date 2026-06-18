/* ============================================================
   Au7o handoff · Pricing + Stripe checkout. AU7O_TIERS = the 3 plans (Free / Plus $14.99 / Pro $24.99). PricingTiers = desktop 3-column grid (onSelect(tier) callback). MobilePricing = stacked mobile plans screen. StripeCheckout = the Stripe-powered checkout sheet (pass tier=AU7O_TIERS[n]); dark order summary + card form. Edit AU7O_TIERS to change plan names/prices/features in one place.
   ============================================================ */
/* Au7o · Pricing tiers + Stripe checkout layer
   Free · Plus $14.99 · Pro $24.99 — and a Stripe-powered checkout sheet.
*/

const AU7O_TIERS = [
  {
    id:"free", name:"Free", price:"0", tagline:"Browse and try it out.",
    cta:"Current plan", ctaStyle:"ghost",
    features:[
      { t:"Browse all known issues", on:true },
      { t:"5 photo diagnoses / week", on:true },
      { t:"1 vehicle in your garage", on:true },
      { t:"Maintenance tracking", on:false },
      { t:"Recall & service alerts", on:false },
      { t:"Priority AI + parts discounts", on:false },
    ],
  },
  {
    id:"plus", name:"Plus", price:"14.99", tagline:"For the hands-on owner.", popular:true,
    cta:"Start Plus", ctaStyle:"primary",
    features:[
      { t:"Everything in Free", on:true },
      { t:"Unlimited photo & video diagnosis", on:true },
      { t:"Full known-issue matching · your trim", on:true },
      { t:"Up to 3 vehicles", on:true },
      { t:"Maintenance tracking + history", on:true },
      { t:"Recall & service alerts", on:true },
    ],
  },
  {
    id:"pro", name:"Pro", price:"24.99", tagline:"For enthusiasts & small fleets.",
    cta:"Start Pro", ctaStyle:"dark",
    features:[
      { t:"Everything in Plus", on:true },
      { t:"Up to 10 vehicles", on:true },
      { t:"Priority AI — fastest, most detailed", on:true },
      { t:"Parts ordering discounts", on:true },
      { t:"Family / shop sharing (5 seats)", on:true },
      { t:"Export records & service logs", on:true },
    ],
  },
];

// ─── Three-tier pricing grid ─────────────────────────────────────
function PricingTiers({ onSelect }) {
  const btnStyle = (s) => ({
    ghost:    { background:"#fff", color:"var(--slate-600)", border:"1px solid var(--paper-line)" },
    primary:  { background:"var(--au7o-blue)", color:"#fff", border:"none", boxShadow:"0 6px 16px rgba(59,130,246,0.32)" },
    dark:     { background:"var(--ink)", color:"#fff", border:"none" },
  }[s]);
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap: 16, alignItems:"start" }}>
      {AU7O_TIERS.map((tier) => (
        <div key={tier.id} style={{
          background:"#fff", borderRadius: 18, overflow:"hidden",
          border: tier.popular ? "2px solid var(--au7o-blue)" : "1px solid var(--paper-line)",
          boxShadow: tier.popular ? "0 16px 40px rgba(59,130,246,0.16)" : "var(--shadow-1)",
          position:"relative",
        }}>
          {tier.popular && (
            <div style={{ position:"absolute", top: 14, right: 14, padding:"3px 10px", background:"var(--au7o-blue)", color:"#fff", borderRadius: 999, fontSize: 10, fontWeight: 700, letterSpacing:"0.04em" }}>POPULAR</div>
          )}
          <div style={{ padding:"22px 22px 18px", borderBottom:"1px solid var(--paper-line)" }}>
            <div style={{ fontSize: 16, fontWeight: 700, letterSpacing:"-0.01em" }}>{tier.name}</div>
            <div style={{ fontSize: 12.5, color:"var(--slate-600)", marginTop: 3 }}>{tier.tagline}</div>
            <div style={{ display:"flex", alignItems:"baseline", gap: 3, marginTop: 16 }}>
              <span className="mono" style={{ fontSize: 15, fontWeight: 700, color:"var(--slate-500)" }}>$</span>
              <span className="mono" style={{ fontSize: 38, fontWeight: 700, letterSpacing:"-0.03em", lineHeight: 1 }}>{tier.price}</span>
              <span style={{ fontSize: 13, color:"var(--slate-500)" }}>/mo</span>
            </div>
            <button onClick={() => onSelect && onSelect(tier)} style={{
              width:"100%", marginTop: 16, padding:"11px 0", borderRadius: 11,
              fontSize: 14, fontWeight: 600, cursor:"pointer", fontFamily:"var(--font-sans)",
              ...btnStyle(tier.ctaStyle),
            }}>{tier.cta}</button>
          </div>
          <div style={{ padding:"16px 22px 22px", display:"flex", flexDirection:"column", gap: 10 }}>
            {tier.features.map((f, i) => (
              <div key={i} style={{ display:"flex", alignItems:"flex-start", gap: 9 }}>
                <span style={{ width: 16, height: 16, borderRadius:"50%", flexShrink: 0, marginTop: 1, background: f.on ? "var(--ok-bg, rgba(31,138,91,0.12))" : "var(--paper-2)", display:"inline-flex", alignItems:"center", justifyContent:"center" }}>
                  {f.on
                    ? <Icon name="check" size={10} style={{ color:"var(--ok)" }}/>
                    : <span style={{ width: 7, height: 1.5, background:"var(--slate-300)", borderRadius: 2 }}/>}
                </span>
                <span style={{ fontSize: 12.5, color: f.on ? "var(--ink)" : "var(--slate-400)", lineHeight: 1.4 }}>{f.t}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Stripe checkout sheet (the "Stripe layer") ──────────────────
function StripeCheckout({ tier = AU7O_TIERS[1] }) {
  const field = {
    width:"100%", boxSizing:"border-box", padding:"11px 13px", fontSize: 14,
    fontFamily:"var(--font-mono)", background:"#fff", border:"1px solid var(--paper-line)",
    borderRadius: 9, color:"var(--ink)",
  };
  const label = { fontSize: 11, fontWeight: 600, color:"var(--slate-600)", marginBottom: 6, display:"block" };
  return (
    <div style={{ position:"absolute", inset: 0, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(11,18,32,0.55)", backdropFilter:"blur(3px)" }}>
      <div style={{ width: 760, maxWidth:"94%", background:"var(--paper)", borderRadius: 20, overflow:"hidden", boxShadow:"var(--shadow-3)", position:"relative", display:"grid", gridTemplateColumns:"1fr 1.1fr" }}>
        <button style={{ position:"absolute", top: 16, right: 16, width: 30, height: 30, borderRadius:"50%", background:"rgba(255,255,255,0.9)", border:"1px solid var(--paper-line)", color:"var(--slate-500)", cursor:"pointer", fontSize: 14, zIndex: 5 }}>✕</button>

        {/* LEFT — order summary */}
        <div style={{ background:"linear-gradient(160deg,#141b29,#0B0E14)", padding:"30px 28px", color:"#fff", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", right:-30, top:-30, width: 130, height: 130, borderRadius:"50%", border:"2px solid rgba(59,130,246,0.18)" }}/>
          <div style={{ display:"flex", alignItems:"center", gap: 9, marginBottom: 28 }}>
            <Au7oMark size={22} color="#fff"/>
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing:"0.08em", color:"rgba(255,255,255,0.5)" }}>YOU'RE SUBSCRIBING TO</div>
          <div style={{ fontSize: 26, fontWeight: 700, letterSpacing:"-0.02em", marginTop: 6 }}>Au7o {tier.name}</div>
          <div style={{ display:"flex", alignItems:"baseline", gap: 4, marginTop: 14 }}>
            <span className="mono" style={{ fontSize: 34, fontWeight: 700, letterSpacing:"-0.02em" }}>${tier.price}</span>
            <span style={{ fontSize: 14, color:"rgba(255,255,255,0.6)" }}>per month</span>
          </div>
          <div style={{ marginTop: 26, paddingTop: 20, borderTop:"1px solid rgba(255,255,255,0.12)", display:"flex", flexDirection:"column", gap: 11 }}>
            {tier.features.slice(0,4).map((f,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"center", gap: 9, fontSize: 12.5, color:"rgba(255,255,255,0.85)" }}>
                <Icon name="check" size={12} style={{ color:"var(--au7o-blue)" }}/> {f.t}
              </div>
            ))}
          </div>
          <div style={{ position:"absolute", bottom: 22, left: 28, display:"flex", alignItems:"center", gap: 7, fontSize: 11, color:"rgba(255,255,255,0.45)" }}>
            <Icon name="check" size={11}/> Cancel anytime · 30-day money back
          </div>
        </div>

        {/* RIGHT — Stripe card form */}
        <div style={{ padding:"28px 28px 24px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: 18 }}>
            <span style={{ fontSize: 15, fontWeight: 700 }}>Payment details</span>
            <span style={{ display:"inline-flex", alignItems:"center", gap: 5, fontSize: 10.5, color:"var(--slate-500)", fontWeight: 600 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Secured by Stripe
            </span>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap: 14 }}>
            <div>
              <label style={label}>Email</label>
              <input defaultValue="marcus@email.com" style={{ ...field, fontFamily:"var(--font-sans)" }}/>
            </div>
            <div>
              <label style={label}>Card information</label>
              <div style={{ border:"1px solid var(--paper-line)", borderRadius: 9, overflow:"hidden", background:"#fff" }}>
                <div style={{ position:"relative" }}>
                  <input placeholder="1234 1234 1234 1234" style={{ ...field, border:"none", borderRadius: 0 }}/>
                  <div style={{ position:"absolute", right: 12, top:"50%", transform:"translateY(-50%)", display:"flex", gap: 4 }}>
                    {["#1A1F71","#EB001B","#F79E1B","#006FCF"].map((c,i)=>(
                      <span key={i} style={{ width: 22, height: 14, borderRadius: 3, background: c, opacity: 0.9 }}/>
                    ))}
                  </div>
                </div>
                <div style={{ display:"flex", borderTop:"1px solid var(--paper-line)" }}>
                  <input placeholder="MM / YY" style={{ ...field, border:"none", borderRadius: 0, borderRight:"1px solid var(--paper-line)" }}/>
                  <input placeholder="CVC" style={{ ...field, border:"none", borderRadius: 0 }}/>
                </div>
              </div>
            </div>
            <div>
              <label style={label}>Name on card</label>
              <input defaultValue="Marcus Reyes" style={{ ...field, fontFamily:"var(--font-sans)" }}/>
            </div>
            <div>
              <label style={label}>Country</label>
              <div style={{ ...field, display:"flex", alignItems:"center", color:"var(--ink)", fontFamily:"var(--font-sans)" }}>
                United States
                <Icon name="chevron-down" size={13} style={{ color:"var(--slate-400)", marginLeft:"auto" }}/>
              </div>
            </div>
          </div>

          <button style={{
            width:"100%", marginTop: 18, padding:"13px 0", background:"var(--au7o-blue)", color:"#fff", border:"none", borderRadius: 11,
            fontSize: 14.5, fontWeight: 600, cursor:"pointer", fontFamily:"var(--font-sans)",
            display:"inline-flex", alignItems:"center", justifyContent:"center", gap: 7, boxShadow:"0 6px 18px rgba(59,130,246,0.32)",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Subscribe · ${tier.price}/mo
          </button>
          <div style={{ textAlign:"center", fontSize: 10.5, color:"var(--slate-400)", marginTop: 10, lineHeight: 1.5 }}>
            By subscribing you authorize Au7o to charge your card monthly until you cancel.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Mobile pricing (stacked tiers) ──────────────────────────────
function MobilePricing() {
  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", background:"var(--paper)", overflow:"hidden" }}>
      <div style={{ display:"flex", alignItems:"center", gap: 10, padding:"10px 16px 8px" }}>
        <button style={{ width: 32, height: 32, borderRadius:"50%", background:"#fff", border:"1px solid var(--paper-line)", display:"inline-flex", alignItems:"center", justifyContent:"center", color:"var(--slate-500)" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <span style={{ fontSize: 15, fontWeight: 700, letterSpacing:"-0.01em" }}>Plans</span>
      </div>
      <div style={{ flex: 1, overflow:"auto", padding:"8px 16px 24px" }}>
        <div style={{ textAlign:"center", margin:"6px 0 18px" }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing:"-0.025em", margin: 0 }}>Pick your plan</h1>
          <p style={{ fontSize: 13, color:"var(--slate-700)", margin:"6px 0 0" }}>Start free. Upgrade when you want the full garage.</p>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap: 12 }}>
          {AU7O_TIERS.map((tier) => (
            <div key={tier.id} style={{
              background:"#fff", borderRadius: 16, padding:"16px 18px",
              border: tier.popular ? "2px solid var(--au7o-blue)" : "1px solid var(--paper-line)",
              boxShadow: tier.popular ? "0 10px 26px rgba(59,130,246,0.14)" : "var(--shadow-1)",
            }}>
              <div style={{ display:"flex", alignItems:"center", gap: 8 }}>
                <span style={{ fontSize: 15.5, fontWeight: 700 }}>{tier.name}</span>
                {tier.popular && <span style={{ padding:"2px 8px", background:"var(--au7o-blue)", color:"#fff", borderRadius: 999, fontSize: 9, fontWeight: 700, letterSpacing:"0.04em" }}>POPULAR</span>}
                <span style={{ marginLeft:"auto", display:"flex", alignItems:"baseline", gap: 2 }}>
                  <span className="mono" style={{ fontSize: 22, fontWeight: 700, letterSpacing:"-0.02em" }}>${tier.price}</span>
                  <span style={{ fontSize: 11.5, color:"var(--slate-500)" }}>/mo</span>
                </span>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap: 7, margin:"12px 0 14px" }}>
                {tier.features.slice(0,4).map((f,i)=>(
                  <div key={i} style={{ display:"flex", alignItems:"center", gap: 8, fontSize: 12, color: f.on?"var(--ink)":"var(--slate-400)" }}>
                    {f.on ? <Icon name="check" size={12} style={{ color:"var(--ok)" }}/> : <span style={{ width: 8, height: 1.5, background:"var(--slate-300)", borderRadius: 2, margin:"0 2px" }}/>}
                    {f.t}
                  </div>
                ))}
              </div>
              <button style={{
                width:"100%", padding:"11px 0", borderRadius: 10, fontSize: 13.5, fontWeight: 600, cursor:"pointer", fontFamily:"var(--font-sans)",
                ...(tier.ctaStyle === "primary" ? { background:"var(--au7o-blue)", color:"#fff", border:"none" }
                  : tier.ctaStyle === "dark" ? { background:"var(--ink)", color:"#fff", border:"none" }
                  : { background:"#fff", color:"var(--slate-600)", border:"1px solid var(--paper-line)" }),
              }}>{tier.cta}</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AU7O_TIERS, PricingTiers, StripeCheckout, MobilePricing });
