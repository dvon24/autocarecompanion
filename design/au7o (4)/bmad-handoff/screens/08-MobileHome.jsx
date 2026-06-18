/* ============================================================
   Au7o handoff · MobileHome — mobile homepage. Diagnose hero CTA + the free vehicle-picker (known-issues) tool + proof stats + bottom dock. The mobile counterpart to HomePageMerged.
   ============================================================ */
/* Au7o · Mobile home screen — diagnose hero + the free known-issues tool */
function MobileHome() {
  const makes = ["Dodge","BMW","Ford","Toyota","Honda","Jeep"];
  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", background:"var(--paper)", overflow:"hidden" }}>
      {/* top bar */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 16px", borderBottom:"1px solid var(--paper-line)" }}>
        <Au7oMark size={22}/>
        <div style={{ display:"flex", alignItems:"center", gap: 8 }}>
          <button style={{ padding:"7px 14px", background:"var(--ink)", color:"#fff", border:"none", borderRadius: 9, fontSize: 12.5, fontWeight: 600, cursor:"pointer", fontFamily:"var(--font-sans)" }}>Sign In</button>
        </div>
      </div>

      <div style={{ flex: 1, overflow:"auto", padding:"22px 18px 28px" }}>
        {/* badge */}
        <div style={{ display:"inline-flex", alignItems:"center", gap: 7, padding:"5px 11px", background:"var(--au7o-blue-50)", borderRadius: 999, marginBottom: 16 }}>
          <Icon name="camera" size={12} style={{ color:"var(--au7o-blue)" }}/>
          <span style={{ fontSize: 11, fontWeight: 600, color:"var(--au7o-blue-700)" }}>New · Photo &amp; video diagnosis</span>
        </div>

        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing:"-0.03em", lineHeight: 1.05, margin: 0 }}>
          Know your car's<br/>weak spots.
        </h1>
        <p style={{ fontSize: 14.5, color:"var(--slate-700)", lineHeight: 1.5, margin:"12px 0 0" }}>
          Show Au7o a photo of the problem — it matches what it sees to <b style={{ color:"var(--ink)" }}>4,200+ known issues</b> and the exact part.
        </p>

        {/* primary CTA */}
        <button style={{ width:"100%", marginTop: 20, padding:"15px 0", background:"var(--au7o-blue)", color:"#fff", border:"none", borderRadius: 13, fontSize: 15.5, fontWeight: 600, cursor:"pointer", fontFamily:"var(--font-sans)", display:"inline-flex", alignItems:"center", justifyContent:"center", gap: 8, boxShadow:"0 8px 22px rgba(59,130,246,0.32)" }}>
          <Icon name="camera" size={17}/> Try a photo diagnosis
        </button>
        <div style={{ textAlign:"center", fontSize: 11.5, color:"var(--slate-500)", marginTop: 8 }}>Free · no account needed to start</div>

        {/* divider */}
        <div style={{ display:"flex", alignItems:"center", gap: 12, margin:"22px 0" }}>
          <span style={{ flex: 1, height: 1, background:"var(--paper-line)" }}/>
          <span style={{ fontSize: 11, color:"var(--slate-400)", fontWeight: 600 }}>OR BROWSE BY CAR</span>
          <span style={{ flex: 1, height: 1, background:"var(--paper-line)" }}/>
        </div>

        {/* vehicle picker tool */}
        <div style={{ background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 16, padding: 16, boxShadow:"var(--shadow-1)" }}>
          <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 13.5, fontWeight: 600 }}>Find issues for your car</span>
            <span style={{ display:"flex", alignItems:"baseline", gap: 4 }}>
              <span className="mono" style={{ fontSize: 11.5, fontWeight: 700, color:"var(--au7o-blue)" }}>4,231+</span>
              <span style={{ fontSize: 10.5, color:"var(--slate-500)" }}>issues</span>
            </span>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap: 8 }}>
            <div style={{ display:"flex", alignItems:"center", gap: 8, padding:"12px 13px", background:"var(--paper-2)", border:"1px solid var(--paper-line)", borderRadius: 10, fontSize: 13.5, color:"var(--slate-600)" }}>
              <Icon name="car" size={14} style={{ color:"var(--slate-400)" }}/> Select make
              <Icon name="chevron-down" size={12} style={{ color:"var(--slate-400)", marginLeft:"auto" }}/>
            </div>
            <button style={{ padding:"12px 0", background:"var(--ink)", color:"#fff", border:"none", borderRadius: 10, fontSize: 13.5, fontWeight: 600, cursor:"pointer", fontFamily:"var(--font-sans)", display:"inline-flex", alignItems:"center", justifyContent:"center", gap: 7 }}>
              <Icon name="search" size={13}/> Browse known issues
            </button>
          </div>
          <div style={{ display:"flex", gap: 6, flexWrap:"wrap", marginTop: 12 }}>
            {makes.map((m,i)=>(
              <span key={i} style={{ padding:"5px 11px", background:"var(--paper-2)", border:"1px solid var(--paper-line)", borderRadius: 999, fontSize: 11.5, color:"var(--slate-700)", fontWeight: 500 }}>{m}</span>
            ))}
          </div>
        </div>

        {/* proof */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap: 8, marginTop: 18 }}>
          {[["12,000+","parts"],["738+","models"],["92%","match"]].map(([n,l],i)=>(
            <div key={i} style={{ textAlign:"center", padding:"12px 6px", background:"var(--ink)", borderRadius: 12 }}>
              <div className="mono" style={{ fontSize: 17, fontWeight: 700, color:"#fff" }}>{n}</div>
              <div style={{ fontSize: 10, color:"rgba(255,255,255,0.6)", marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* bottom dock */}
      <div style={{ display:"flex", justifyContent:"space-around", padding:"10px 0 12px", borderTop:"1px solid var(--paper-line)", background:"var(--paper)" }}>
        {[
          { icon:"car", label:"Home", active: true },
          { icon:"search", label:"Issues" },
          { icon:"camera", label:"Diagnose" },
          { icon:"user", label:"Sign in" },
        ].map((t,i)=>(
          <button key={i} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap: 3, background:"transparent", border:"none", cursor:"pointer", color: t.active?"var(--ink)":"var(--slate-400)" }}>
            <Icon name={t.icon} size={17}/>
            <span style={{ fontSize: 9.5, fontWeight: t.active?600:500 }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { MobileHome });
