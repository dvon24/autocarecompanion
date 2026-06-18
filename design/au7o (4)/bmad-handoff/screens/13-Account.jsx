/* ============================================================
   Au7o handoff · Account page (au7o.io/account).

   AccountPage (desktop) + MobileAccount (mobile) mirror the real page:
   Beta notice · My Garage (nicknamed vehicles) · Recent Diagnoses (empty
   state) · Recent Chats (typed: photo/video/text) · Subscription (Free +
   upgrade to Plus/Pro) · Emails · Privacy & Data (GDPR: AI-processing
   toggle, export, delete) · Site map footer.

   DEPENDENCIES — load BEFORE this file:
     • 11-DesktopDiagnose.jsx  → DeskNav (top nav on the desktop page)
     • 12-Pricing.jsx          → AU7O_TIERS (drives the upgrade options)
   Plus the usual _shared.jsx (Au7oMark) + Icon.tsx.

   INTEGRATE: this is the read-only Beta page. Subscription upgrade buttons
   should open the Stripe checkout (StripeCheckout from 12); "Manage" /
   "Change" / privacy actions are stubs to wire to your backend. Plan state
   here is Free — a paid user shows billing history + a saved card (see
   PlanBillingBlock pattern if you add it).
   ============================================================ */

// ─── shared bits ─────────────────────────────────────────────────
function AcctCard({ title, action, children, id, pad = 20 }) {
  return (
    <section id={id} style={{ background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 16, boxShadow:"var(--shadow-1)", overflow:"hidden" }}>
      {title && (
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 18px", borderBottom:"1px solid var(--paper-line)" }}>
          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing:"-0.01em" }}>{title}</span>
          {action}
        </div>
      )}
      <div style={{ padding: pad }}>{children}</div>
    </section>
  );
}

function AcctToggle({ on }) {
  return (
    <span style={{ width: 38, height: 22, borderRadius: 999, background: on ? "var(--ok)" : "var(--paper-line)", position:"relative", flexShrink: 0 }}>
      <span style={{ position:"absolute", top: 2, left: on ? 18 : 2, width: 18, height: 18, borderRadius:"50%", background:"#fff", boxShadow:"0 1px 3px rgba(0,0,0,0.2)" }}/>
    </span>
  );
}

const GARAGE = [
  { nick:"Bae", v:"2015 Dodge Challenger SRT 392", primary: true, meta:"64,218 mi", flag:"1 overdue", flagColor:"#B45309" },
  { nick:"Track Weapon", v:"2019 Chevrolet Camaro ZL1 1LE", meta:"Garage-kept", flag:"Up to date", flagColor:"var(--ok)" },
];

const RECENT_CHATS = [
  { title:"How do I do a wiper blades?", n: 3, when:"52m ago", type:"text" },
  { title:"Uploaded a video for diagnosis", n: 5, when:"12h ago", type:"video" },
  { title:"Uploaded a photo for analysis", n: 7, when:"16h ago", type:"photo" },
  { title:"Help with wiper blades", n: 3, when:"16h ago", type:"text" },
  { title:"Uploaded a photo for analysis", n: 7, when:"21h ago", type:"photo" },
  { title:"Help with cabin air filter", n: 3, when:"3d ago", type:"text" },
  { title:"How do I do a differential fluid?", n: 3, when:"7d ago", type:"text" },
  { title:"this is a test", n: 3, when:"7d ago", type:"text" },
];

function ChatTypeIcon({ type }) {
  if (type === "video") {
    return (
      <span style={{ width: 30, height: 30, borderRadius: 8, background:"var(--au7o-blue-50)", display:"inline-flex", alignItems:"center", justifyContent:"center", color:"var(--au7o-blue)", flexShrink: 0 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>
      </span>
    );
  }
  if (type === "photo") {
    return (
      <span style={{ width: 30, height: 30, borderRadius: 8, background:"var(--au7o-blue-50)", display:"inline-flex", alignItems:"center", justifyContent:"center", color:"var(--au7o-blue)", flexShrink: 0 }}>
        <Icon name="camera" size={14}/>
      </span>
    );
  }
  return (
    <span style={{ width: 30, height: 30, borderRadius: 8, background:"var(--paper-2)", display:"inline-flex", alignItems:"center", justifyContent:"center", color:"var(--slate-500)", flexShrink: 0 }}>
      <Icon name="chat" size={14}/>
    </span>
  );
}

function RecentChatRow({ c, last }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap: 12, padding:"10px 0", borderBottom: last ? "none" : "1px solid var(--paper-line)" }}>
      <ChatTypeIcon type={c.type}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color:"var(--ink)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{c.title}</div>
        <div style={{ fontSize: 11.5, color:"var(--slate-500)", marginTop: 1 }}>{c.n} messages</div>
      </div>
      <span style={{ fontSize: 11.5, color:"var(--slate-400)", flexShrink: 0 }}>{c.when}</span>
      <Icon name="chevron" size={11} style={{ color:"var(--slate-300)", flexShrink: 0 }}/>
    </div>
  );
}

// ─── Garage grid ─────────────────────────────────────────────────
function GarageGrid({ columns = 2 }) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:`repeat(${columns}, 1fr)`, gap: 10 }}>
      {GARAGE.map((g,i)=>(
        <div key={i} style={{ display:"flex", alignItems:"center", gap: 12, padding:"13px 14px", background:"var(--paper-2)", border:"1px solid var(--paper-line)", borderRadius: 12 }}>
          <span style={{ width: 40, height: 40, borderRadius: 10, background:"#fff", border:"1px solid var(--paper-line)", display:"inline-flex", alignItems:"center", justifyContent:"center", flexShrink: 0, color:"var(--slate-600)" }}>
            <Icon name="car" size={20}/>
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display:"flex", alignItems:"center", gap: 7 }}>
              <span style={{ fontSize: 14, fontWeight: 700, letterSpacing:"-0.01em" }}>{g.nick}</span>
              {g.primary && <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing:"0.05em", color:"var(--au7o-blue-700)", background:"var(--au7o-blue-50)", padding:"2px 6px", borderRadius: 999 }}>PRIMARY</span>}
            </div>
            <div style={{ fontSize: 11.5, color:"var(--slate-600)", marginTop: 1, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{g.v}</div>
            <div style={{ fontSize: 11, color:"var(--slate-500)", marginTop: 3, display:"flex", gap: 8 }}>
              <span className="mono">{g.meta}</span>
              <span style={{ color: g.flagColor, fontWeight: 600 }}>{g.flag}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Subscription rail (Free + upgrade to Plus/Pro) ──────────────
function SubscriptionBlock() {
  const ups = (typeof AU7O_TIERS !== "undefined" ? AU7O_TIERS : []).filter(t => t.id !== "free");
  return (
    <div style={{ display:"flex", flexDirection:"column", gap: 14 }}>
      {/* current: Free */}
      <div style={{ display:"flex", alignItems:"center", gap: 12, padding:"13px 15px", background:"var(--paper-2)", border:"1px solid var(--paper-line)", borderRadius: 12 }}>
        <div style={{ flex: 1 }}>
          <div className="eyebrow" style={{ fontSize: 9 }}>CURRENT PLAN</div>
          <div style={{ fontSize: 17, fontWeight: 700, marginTop: 2 }}>Free</div>
        </div>
        <span className="mono" style={{ fontSize: 18, fontWeight: 700, color:"var(--slate-400)" }}>$0</span>
      </div>
      <p style={{ fontSize: 12.5, color:"var(--slate-600)", lineHeight: 1.5, margin: 0 }}>
        You're on the Free plan — <b style={{ color:"var(--ink)" }}>2 photo diagnoses / week</b> and one vehicle. Unlock unlimited diagnoses, alerts, and the full garage with a paid plan.
      </p>
      {/* upgrade options */}
      <div style={{ display:"flex", flexDirection:"column", gap: 8 }}>
        {ups.map((t,i)=>(
          <div key={i} style={{ display:"flex", alignItems:"center", gap: 12, padding:"12px 14px", background:"#fff", border: t.popular ? "1.5px solid var(--au7o-blue)" : "1px solid var(--paper-line)", borderRadius: 11 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display:"flex", alignItems:"center", gap: 7 }}>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{t.name}</span>
                {t.popular && <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing:"0.05em", color:"#fff", background:"var(--au7o-blue)", padding:"2px 6px", borderRadius: 999 }}>POPULAR</span>}
              </div>
              <div style={{ fontSize: 11.5, color:"var(--slate-500)", marginTop: 1 }}>{t.tagline}</div>
            </div>
            <span className="mono" style={{ fontSize: 14, fontWeight: 700 }}>${t.price}</span>
            <button style={{ padding:"7px 13px", background: t.popular ? "var(--au7o-blue)" : "var(--ink)", color:"#fff", border:"none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor:"pointer", fontFamily:"var(--font-sans)", flexShrink: 0 }}>Upgrade</button>
          </div>
        ))}
      </div>
      <a style={{ fontSize: 12.5, color:"var(--au7o-blue)", cursor:"pointer", fontWeight: 600, display:"inline-flex", alignItems:"center", gap: 4 }}>
        Compare all plans <Icon name="chevron" size={11}/>
      </a>
    </div>
  );
}

// ─── Emails block ────────────────────────────────────────────────
function EmailsBlock() {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap: 12 }}>
      <p style={{ fontSize: 12.5, color:"var(--slate-600)", lineHeight: 1.5, margin: 0 }}>
        Your login email can't be changed here. Add a secondary email for receipts and contact.
      </p>
      <div>
        <div className="eyebrow" style={{ fontSize: 9, marginBottom: 6 }}>LOGIN</div>
        <div style={{ display:"flex", alignItems:"center", gap: 10, padding:"11px 13px", background:"var(--paper-2)", border:"1px solid var(--paper-line)", borderRadius: 10 }}>
          <Icon name="user" size={13} style={{ color:"var(--slate-500)" }}/>
          <span style={{ flex: 1, fontSize: 13, color:"var(--ink)" }}>devonsroberson24@yahoo.com</span>
          <span style={{ fontSize: 10.5, color:"var(--slate-400)", fontWeight: 600, letterSpacing:"0.04em", textTransform:"uppercase" }}>Read-only</span>
        </div>
      </div>
      <div>
        <div className="eyebrow" style={{ fontSize: 9, marginBottom: 6 }}>SECONDARY (CONTACT)</div>
        <div style={{ display:"flex", alignItems:"center", gap: 10, padding:"11px 13px", background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 10 }}>
          <Icon name="chat" size={13} style={{ color:"var(--slate-500)" }}/>
          <span style={{ flex: 1, fontSize: 13, color:"var(--ink)" }}>dvoninvestllc@yahoo.com</span>
          <button className="chip chip-sm" style={{ fontSize: 11.5 }}>Change</button>
        </div>
      </div>
    </div>
  );
}

// ─── Privacy & Data (GDPR) block ─────────────────────────────────
function PrivacyDataBlock() {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap: 16 }}>
      <p style={{ fontSize: 12.5, color:"var(--slate-600)", lineHeight: 1.55, margin: 0 }}>
        Under GDPR and similar laws, you have the right to a copy of your data and the right to have it erased. Both controls below operate on your Au7o account (<b style={{ color:"var(--slate-700)" }}>devonsroberson24@yahoo.com</b>). For other request types, use the <a style={{ color:"var(--au7o-blue)", cursor:"pointer", fontWeight: 500 }}>data rights form</a>.
      </p>

      {/* AI processing toggle */}
      <div style={{ display:"flex", alignItems:"center", gap: 14, padding:"13px 15px", background:"var(--paper-2)", border:"1px solid var(--paper-line)", borderRadius: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600 }}>AI processing</div>
          <div style={{ fontSize: 11.5, color:"var(--slate-500)", marginTop: 2, lineHeight: 1.45 }}>Powers chat, repair guides, and parts lookups (Anthropic &amp; OpenAI). Article 21 — right to object. Opting out disables those features until re-enabled.</div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap: 5 }}>
          <AcctToggle on={true}/>
          <span style={{ fontSize: 10, fontWeight: 700, color:"var(--ok)", letterSpacing:"0.04em" }}>ALLOWED</span>
        </div>
      </div>

      {/* export + delete */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: 12 }}>
        <div style={{ padding:"14px 16px", background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 12 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600 }}>Export my data</div>
          <div style={{ fontSize: 11.5, color:"var(--slate-500)", marginTop: 3, lineHeight: 1.45, minHeight: 50 }}>A JSON file with your profile, garage, chats, diagnoses, and parts searches. Article 20.</div>
          <button style={{ width:"100%", marginTop: 8, padding:"9px 0", background:"var(--ink)", color:"#fff", border:"none", borderRadius: 9, fontSize: 12.5, fontWeight: 600, cursor:"pointer", fontFamily:"var(--font-sans)", display:"inline-flex", alignItems:"center", justifyContent:"center", gap: 6 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>
            Download my data
          </button>
        </div>
        <div style={{ padding:"14px 16px", background:"#fff", border:"1px solid #FEE2E2", borderRadius: 12 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color:"#B91C1C" }}>Delete my account</div>
          <div style={{ fontSize: 11.5, color:"var(--slate-500)", marginTop: 3, lineHeight: 1.45, minHeight: 50 }}>Permanently erases your account, garage, chats, and reminders. Irreversible. Article 17.</div>
          <button style={{ width:"100%", marginTop: 8, padding:"9px 0", background:"#fff", color:"#B91C1C", border:"1px solid #FECACA", borderRadius: 9, fontSize: 12.5, fontWeight: 600, cursor:"pointer", fontFamily:"var(--font-sans)" }}>Delete account…</button>
        </div>
      </div>
    </div>
  );
}

// ─── Site map footer ─────────────────────────────────────────────
function SiteMapFooter() {
  const cols = [
    { h:"My stuff", links:["Garage","Account","Plans & pricing","Drive (trip planner)"] },
    { h:"Diagnose & research", links:["Symptom chat","Known issues index","DTC code lookup","Parts finder"] },
    { h:"Company & legal", links:["About Au7o","Privacy policy","Terms","Data rights request","XML sitemap (SEO)"] },
  ];
  return (
    <footer style={{ borderTop:"1px solid var(--paper-line)", background:"var(--paper)", padding:"32px 32px 28px" }}>
      <div style={{ maxWidth: 1040, margin:"0 auto", display:"grid", gridTemplateColumns:"1.2fr 1fr 1fr 1fr", gap: 28 }}>
        <div>
          <Au7oMark size={22}/>
          <p style={{ fontSize: 12, color:"var(--slate-500)", lineHeight: 1.5, marginTop: 12, maxWidth: 220 }}>Know your car's weak spots. Built for DIY mechanics.</p>
        </div>
        {cols.map((c,i)=>(
          <div key={i}>
            <div className="eyebrow" style={{ fontSize: 9.5, marginBottom: 12 }}>{c.h}</div>
            <div style={{ display:"flex", flexDirection:"column", gap: 9 }}>
              {c.links.map((l,j)=>(
                <a key={j} style={{ fontSize: 12.5, color:"var(--slate-600)", cursor:"pointer", textDecoration:"none" }}>{l}</a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </footer>
  );
}

// ═══ DESKTOP ACCOUNT PAGE ════════════════════════════════════════
function AccountPage() {
  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", background:"var(--paper)", overflow:"hidden" }}>
      <DeskNav vehicle/>
      <div style={{ flex: 1, overflow:"auto" }}>
        {/* beta banner */}
        <div style={{ background:"var(--warn-bg)", borderBottom:"1px solid rgba(180,83,9,0.18)", padding:"11px 32px" }}>
          <div style={{ maxWidth: 1040, margin:"0 auto", display:"flex", alignItems:"center", gap: 12 }}>
            <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing:"0.06em", color:"#fff", background:"#B45309", padding:"3px 8px", borderRadius: 999, flexShrink: 0 }}>BETA</span>
            <span style={{ fontSize: 12.5, color:"#92400E", lineHeight: 1.45 }}>
              Premium features (SMS reminders, push alerts, cross-device sync) are still in active development. What you see today is a read-only history of your chats, diagnoses, and saved vehicles.
            </span>
          </div>
        </div>

        <div style={{ maxWidth: 1040, margin:"0 auto", padding:"30px 32px 48px" }}>
          <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing:"-0.025em", margin: 0 }}>Your account</h1>
          <p style={{ fontSize: 14, color:"var(--slate-600)", margin:"6px 0 26px" }}>Your garage, activity, plan, and data — all in one place.</p>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap: 22, alignItems:"start" }}>
            {/* MAIN */}
            <div style={{ display:"flex", flexDirection:"column", gap: 20 }}>
              <AcctCard title="My Garage" action={<a style={{ fontSize: 12.5, color:"var(--au7o-blue)", cursor:"pointer", fontWeight: 600, display:"inline-flex", alignItems:"center", gap: 3 }}>Manage <Icon name="chevron" size={11}/></a>}>
                <GarageGrid columns={2}/>
              </AcctCard>

              <AcctCard title="Recent Diagnoses">
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"22px 0", textAlign:"center" }}>
                  <span style={{ width: 46, height: 46, borderRadius:"50%", background:"var(--au7o-blue-50)", display:"inline-flex", alignItems:"center", justifyContent:"center", color:"var(--au7o-blue)", marginBottom: 12 }}>
                    <Icon name="camera" size={21}/>
                  </span>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>No diagnoses yet</div>
                  <div style={{ fontSize: 12.5, color:"var(--slate-500)", marginTop: 3 }}>Start a chat to diagnose a symptom — by photo, video, or description.</div>
                  <button style={{ marginTop: 14, padding:"9px 18px", background:"var(--au7o-blue)", color:"#fff", border:"none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor:"pointer", fontFamily:"var(--font-sans)", display:"inline-flex", alignItems:"center", gap: 7 }}>
                    <Icon name="camera" size={14}/> Start a diagnosis
                  </button>
                </div>
              </AcctCard>

              <AcctCard title="Recent Chats" action={<a style={{ fontSize: 12.5, color:"var(--au7o-blue)", cursor:"pointer", fontWeight: 600 }}>View all</a>}>
                <div style={{ display:"flex", flexDirection:"column" }}>
                  {RECENT_CHATS.slice(0, 6).map((c,i,arr)=>(
                    <RecentChatRow key={i} c={c} last={i === arr.length-1}/>
                  ))}
                </div>
              </AcctCard>

              <AcctCard title="Privacy & Data">
                <PrivacyDataBlock/>
              </AcctCard>
            </div>

            {/* RAIL */}
            <div style={{ display:"flex", flexDirection:"column", gap: 20, position:"sticky", top: 16 }}>
              <AcctCard title="Subscription">
                <SubscriptionBlock/>
              </AcctCard>
              <AcctCard title="Emails">
                <EmailsBlock/>
              </AcctCard>
            </div>
          </div>
        </div>

        <SiteMapFooter/>
      </div>
    </div>
  );
}

// ═══ MOBILE ACCOUNT PAGE ═════════════════════════════════════════
function MobileAccount() {
  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", background:"var(--paper)", overflow:"hidden" }}>
      <div style={{ display:"flex", alignItems:"center", gap: 10, padding:"12px 16px", borderBottom:"1px solid var(--paper-line)" }}>
        <button style={{ width: 32, height: 32, borderRadius:"50%", background:"#fff", border:"1px solid var(--paper-line)", display:"inline-flex", alignItems:"center", justifyContent:"center", color:"var(--slate-500)" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <span style={{ fontSize: 15.5, fontWeight: 700, letterSpacing:"-0.01em" }}>Your account</span>
        <span style={{ marginLeft:"auto", fontSize: 9, fontWeight: 700, letterSpacing:"0.06em", color:"#fff", background:"#B45309", padding:"3px 8px", borderRadius: 999 }}>BETA</span>
      </div>

      <div style={{ flex: 1, overflow:"auto", padding:"14px 16px 28px", display:"flex", flexDirection:"column", gap: 16 }}>
        {/* beta note */}
        <div style={{ background:"var(--warn-bg)", border:"1px solid rgba(180,83,9,0.2)", borderRadius: 12, padding:"11px 13px", fontSize: 11.5, color:"#92400E", lineHeight: 1.45 }}>
          Premium features (SMS, push, cross-device sync) are in development. Today this is a read-only history of your chats, diagnoses, and vehicles.
        </div>

        {/* garage */}
        <div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: 8 }}>
            <div className="eyebrow" style={{ fontSize: 9.5 }}>MY GARAGE</div>
            <a style={{ fontSize: 12, color:"var(--au7o-blue)", fontWeight: 600 }}>Manage</a>
          </div>
          <GarageGrid columns={1}/>
        </div>

        {/* subscription */}
        <div>
          <div className="eyebrow" style={{ fontSize: 9.5, marginBottom: 8 }}>SUBSCRIPTION</div>
          <div style={{ background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 14, padding: 16, boxShadow:"var(--shadow-1)" }}>
            <SubscriptionBlock/>
          </div>
        </div>

        {/* recent chats */}
        <div>
          <div className="eyebrow" style={{ fontSize: 9.5, marginBottom: 8 }}>RECENT CHATS</div>
          <div style={{ background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 14, padding:"4px 14px" }}>
            {RECENT_CHATS.slice(0, 5).map((c,i,arr)=>(
              <RecentChatRow key={i} c={c} last={i === arr.length-1}/>
            ))}
          </div>
        </div>

        {/* emails */}
        <div>
          <div className="eyebrow" style={{ fontSize: 9.5, marginBottom: 8 }}>EMAILS</div>
          <div style={{ background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 14, padding: 16 }}>
            <EmailsBlock/>
          </div>
        </div>

        {/* privacy */}
        <div>
          <div className="eyebrow" style={{ fontSize: 9.5, marginBottom: 8 }}>PRIVACY &amp; DATA</div>
          <div style={{ background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 14, padding: 16 }}>
            <PrivacyDataBlock/>
          </div>
        </div>

        <button style={{ padding:"12px 0", background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 12, fontSize: 13.5, fontWeight: 600, color:"var(--slate-700)", cursor:"pointer", fontFamily:"var(--font-sans)" }}>Sign out</button>
      </div>
    </div>
  );
}

Object.assign(window, { AccountPage, MobileAccount, SubscriptionBlock, GarageGrid, PrivacyDataBlock, EmailsBlock, SiteMapFooter });
