/* Au7o · Known-Issues email-capture — RECOMMENDED "Split" arrangement.
   ────────────────────────────────────────────────────────────────────
   The email-capture moment on a known-issues page, backed by a LIVE demo
   of the vehicle hub. Left: email capture on warm paper. Right (on ink):
   a framed browser window that OPENS on the loaded hub (Au7o has already
   surfaced the maintenance schedule + known issues), then AUTO-ROTATES
   through the remaining capabilities — photo/video diagnosis, live recalls,
   and Drive — with the composer pinned at the bottom the whole time.
   Hover the window to pause; click the dots to jump.

   Primary export: FeatureCarouselSplit  (alias: WallSplitMerged)

   Depends on _shared.jsx (Icon, Au7oMark, ChallengerSilhouette,
   AmbientBackground) + brand/au7o-mascot.png. Load _shared.jsx first.
   CSS: status-dot + web-scroll + au7o-pulse-soft live in utilities.css;
   fc-fade / fc-rise (slide transitions) added there too.
*/

const { useState: fcUseState, useEffect: fcUseEffect } = React;

// Shared bubble look (mirrors the hub's bubble-au7o / bubble-user)
const fcBubble = {
  background: "#fff", border: "1px solid var(--paper-line)", borderRadius: 14,
  borderTopLeftRadius: 4, padding: "10px 13px", fontSize: 12.5, lineHeight: 1.5,
  color: "var(--ink)", boxShadow: "var(--shadow-1)", maxWidth: 320,
};
const fcUserBubble = {
  background: "var(--au7o-blue)", color: "#fff", borderRadius: 14, borderTopRightRadius: 4,
  padding: "8px 13px", fontSize: 12.5, lineHeight: 1.45, maxWidth: 260, fontWeight: 500,
};
const fcComposerChip = {
  display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 9px",
  background: "var(--paper-2)", border: "1px solid var(--paper-line)", borderRadius: 999,
  fontSize: 11, color: "var(--slate-600)", cursor: "pointer", fontWeight: 500,
};

// ════════════════════════════════════════════════════════════════
// CAPABILITY SLIDES — each is a chat exchange + a rich attachment
// ════════════════════════════════════════════════════════════════
const HUB_SLIDES = [
  {
    id: "maintenance",
    eyebrow: "MAINTENANCE TRACKING",
    accent: "var(--au7o-blue)",
    prompt: "What's due on my Challenger?",
    reply: <>You're at <b className="mono">64,218 mi</b> — an oil change lands in 782 mi and your <b>brake fluid</b> is quietly overdue.</>,
    Attachment: AttMaintenance,
  },
  {
    id: "issues",
    eyebrow: "KNOWN ISSUES",
    accent: "#EF4444",
    prompt: "What should I watch for at this mileage?",
    reply: <>Four issues sit in the window for your <b>SRT 392</b> at 64k. Two are safety-critical — ranked by your mileage.</>,
    Attachment: AttIssues,
  },
  {
    id: "recalls",
    eyebrow: "LIVE RECALLS",
    accent: "#B45309",
    prompt: "Any open recalls on my car?",
    reply: <>Yes — <b>recall S19</b> is open on your EPS rack. It's a free dealer fix. Want me to book it?</>,
    Attachment: AttRecalls,
  },
  {
    id: "diagnose",
    eyebrow: "PHOTO & VIDEO DIAGNOSIS",
    accent: "var(--au7o-blue)",
    prompt: "Snapped this under the hood — what is it?",
    reply: <>That's a weep at the <b>oil filter housing</b> — common on the 6.4 Hemi. Not urgent, but worth a gasket.</>,
    Attachment: AttDiagnose,
    promptHasPhoto: true,
  },
  {
    id: "drive",
    eyebrow: "CAR-AWARE DRIVE",
    accent: "#10B981",
    prompt: "Plan me a run up to Big Sur this weekend.",
    reply: <>138 miles, ~2h 14m. Your range covers it with one fuel stop — and your pre-trip check is clear.</>,
    Attachment: AttDrive,
  },
];

// ─── Attachment: maintenance schedule (compact) ──────────────────
function AttMaintenance() {
  const ticks = [
    { mi: "55k", done: true }, { mi: "60k", done: true },
    { mi: "64k", now: true }, { mi: "65k", due: true }, { mi: "75k" }, { mi: "80k" },
  ];
  return (
    <AttShell title="Maintenance schedule" meta="2015 SRT 392 · 8 tracked">
      {/* mini timeline */}
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 2px 2px" }}>
        <div style={{ position: "absolute", left: 5, right: 5, top: 6, height: 2, background: "var(--paper-line)" }}/>
        <div style={{ position: "absolute", left: 5, width: "40%", top: 6, height: 2, background: "linear-gradient(90deg,var(--ok),var(--au7o-blue))" }}/>
        {ticks.map((t, i) => (
          <div key={i} style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 5, zIndex: 1 }}>
            <span style={{
              width: t.now ? 13 : 11, height: t.now ? 13 : 11, borderRadius: "50%",
              background: t.now ? "var(--au7o-blue)" : t.done ? "var(--ok)" : t.due ? "var(--warn)" : "#fff",
              border: t.now ? "3px solid #fff" : t.done || t.due ? "none" : "2px solid var(--paper-line)",
              boxShadow: t.now ? "0 0 0 2px var(--au7o-blue)" : "none",
            }}/>
            <span className="mono" style={{ fontSize: 8.5, color: t.now ? "var(--au7o-blue)" : t.due ? "#92400E" : "var(--slate-400)", fontWeight: t.now || t.due ? 700 : 400 }}>{t.mi}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 12 }}>
        <AttRow dot="crit" label="Brake fluid flush" note="1 yr overdue" right="$140" />
        <AttRow dot="warn" label="Engine oil & filter" note="in 782 mi" right="$78" primary />
        <AttRow dot="ok" label="Spark plugs" note="done @ 60,120" right="✓" muted />
      </div>
    </AttShell>
  );
}

// ─── Attachment: known issues ────────────────────────────────────
function AttIssues() {
  const rows = [
    { dot: "crit", label: "Driveshaft U-joint", note: "~14% at 60k+", right: "$890" },
    { dot: "crit", label: "EPS rack failure", note: "recall S19", right: "$1,950" },
    { dot: "warn", label: "OEM radiator", note: "~6%", right: "$480" },
  ];
  return (
    <AttShell title="4 known issues" meta="filtered to your trim" icon="alert">
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {rows.map((r, i) => <AttRow key={i} {...r} />)}
      </div>
      <div style={{ marginTop: 9, fontSize: 10.5, color: "var(--slate-500)", display: "flex", alignItems: "center", gap: 5 }}>
        <Icon name="info" size={11} style={{ color: "var(--slate-400)" }}/> Ranked by your 64k mileage
      </div>
    </AttShell>
  );
}

// ─── Attachment: live recalls ────────────────────────────────────
function AttRecalls() {
  return (
    <AttShell title="Live recall feed" meta="NHTSA · synced today" icon="alert" live>
      <div style={{ background: "var(--warn-bg)", border: "1px solid rgba(180,83,9,0.25)", borderRadius: 10, padding: "11px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "#92400E", background: "#fff", padding: "2px 7px", borderRadius: 4, border: "1px solid rgba(180,83,9,0.3)" }}>S19</span>
          <span style={{ fontSize: 9, fontWeight: 700, color: "#fff", background: "#B45309", padding: "2px 7px", borderRadius: 999, letterSpacing: "0.04em" }}>OPEN</span>
          <span style={{ marginLeft: "auto", fontSize: 10, color: "#92400E" }}>free fix</span>
        </div>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink)", marginTop: 8, lineHeight: 1.3 }}>Electronic power steering may lose assist</div>
        <div style={{ fontSize: 10.5, color: "#92400E", marginTop: 3 }}>Affects 2015 Challenger · steering gear</div>
      </div>
      <button style={{
        width: "100%", marginTop: 9, padding: "9px 0",
        background: "var(--ink)", color: "#fff", border: "none", borderRadius: 8,
        fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)",
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
      }}>
        <Icon name="calendar" size={12}/> Book the free repair
      </button>
    </AttShell>
  );
}

// ─── Attachment: photo/video diagnosis ───────────────────────────
function AttDiagnose() {
  return (
    <AttShell title="Photo diagnosis" meta="94% confidence" icon="camera" noPad>
      <div style={{ position: "relative", height: 138, background: "linear-gradient(135deg,#1f2733,#0B1220)" }}>
        <svg width="100%" height="100%" viewBox="0 0 300 138" style={{ position: "absolute", inset: 0, opacity: 0.45 }}>
          <path d="M20 100 Q70 55 130 75 T290 50" stroke="rgba(255,255,255,0.12)" strokeWidth="11" fill="none"/>
          <rect x="44" y="36" width="76" height="50" rx="6" fill="rgba(255,255,255,0.06)"/>
          <rect x="165" y="64" width="96" height="38" rx="6" fill="rgba(255,255,255,0.06)"/>
        </svg>
        <div style={{ position: "absolute", left: 104, top: 52, width: 28, height: 28, borderRadius: "50%", border: "2px solid var(--au7o-blue)", background: "rgba(59,130,246,0.25)", boxShadow: "0 0 0 6px rgba(59,130,246,0.15)" }}/>
        <div style={{ position: "absolute", left: 138, top: 44, background: "rgba(11,18,32,0.92)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "5px 9px" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--au7o-blue)", fontWeight: 700 }}>OIL FILTER HOUSING</div>
          <div style={{ fontSize: 11, color: "#fff", fontWeight: 600 }}>Gasket weep</div>
        </div>
        <div style={{ position: "absolute", left: 10, top: 10, display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.12)", borderRadius: 999, padding: "4px 9px", backdropFilter: "blur(8px)" }}>
          <Icon name="camera" size={11} style={{ color: "#fff" }}/>
          <span style={{ fontSize: 9.5, color: "#fff", fontWeight: 600 }}>photo + video</span>
        </div>
      </div>
      <div style={{ padding: "10px 13px", display: "flex", alignItems: "center", gap: 10 }}>
        <span className="status-dot warn"/>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600 }}>Not urgent · plan a gasket</div>
          <div style={{ fontSize: 10.5, color: "var(--slate-500)" }}>Common on the 6.4 Hemi</div>
        </div>
        <span className="mono" style={{ fontSize: 12.5, fontWeight: 700 }}>~$340</span>
      </div>
    </AttShell>
  );
}

// ─── Attachment: Drive ───────────────────────────────────────────
function AttDrive() {
  return (
    <AttShell title="Drive · Big Sur" meta="car-aware route" icon="map" noPad>
      <div style={{ position: "relative", height: 120, background: "#F2EEE3" }}>
        <svg width="100%" height="100%" viewBox="0 0 300 120" style={{ position: "absolute", inset: 0 }}>
          <g stroke="#E2DBC7" strokeWidth="1"><path d="M0 38 H300 M0 84 H300 M80 0 V120 M195 0 V120"/></g>
          <path d="M30 102 C72 82 96 64 150 54 S232 26 268 16" stroke="var(--au7o-blue)" strokeWidth="4" fill="none" strokeLinecap="round"/>
          <circle cx="268" cy="16" r="5" fill="var(--au7o-blue)"/>
          <circle cx="30" cy="102" r="6" fill="#fff" stroke="var(--au7o-blue)" strokeWidth="3"/>
        </svg>
        <div style={{ position: "absolute", left: 10, bottom: 10, right: 10, background: "rgba(255,255,255,0.95)", border: "1px solid var(--paper-line)", borderRadius: 9, padding: "7px 10px", display: "flex", alignItems: "center", gap: 8, backdropFilter: "blur(8px)" }}>
          <Icon name="fuel" size={13} style={{ color: "var(--ink)" }}/>
          <span style={{ fontSize: 10.5, color: "var(--slate-700)", fontWeight: 500 }}>Range covers it · +1 fuel stop</span>
        </div>
      </div>
      <div style={{ padding: "10px 13px", display: "flex", alignItems: "center", gap: 10 }}>
        <span className="mono" style={{ fontSize: 15, fontWeight: 700 }}>2h 14m</span>
        <span className="mono" style={{ fontSize: 11, color: "var(--slate-500)" }}>· 138 mi</span>
        <span style={{ marginLeft: "auto", fontSize: 10.5, color: "var(--ok)", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}><Icon name="check" size={11}/> Pre-trip OK</span>
      </div>
    </AttShell>
  );
}

// ─── Attachment shell + row helpers ──────────────────────────────
function AttShell({ title, meta, icon, live, noPad, width = 300, children }) {
  return (
    <div style={{ background: "#fff", border: "1px solid var(--paper-line)", borderRadius: 14, boxShadow: "0 18px 40px rgba(11,18,32,0.12)", overflow: "hidden", width }}>
      <div style={{ padding: "10px 13px", borderBottom: "1px solid var(--paper-line)", display: "flex", alignItems: "center", gap: 8 }}>
        {icon && <Icon name={icon} size={13} style={{ color: "var(--slate-500)" }}/>}
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>{title}</span>
        {live && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, marginLeft: 2 }}>
            <span className="au7o-pulse-soft" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--ok)" }}/>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 8.5, color: "var(--ok)", fontWeight: 700, letterSpacing: "0.06em" }}>LIVE</span>
          </span>
        )}
        <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--slate-400)" }}>{meta}</span>
      </div>
      <div style={{ padding: noPad ? 0 : "12px 13px" }}>{children}</div>
    </div>
  );
}

function AttRow({ dot, label, note, right, primary, muted }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 9, padding: "7px 9px", borderRadius: 8,
      background: primary ? "rgba(59,130,246,0.06)" : "var(--paper-2)",
      border: primary ? "1px solid rgba(59,130,246,0.2)" : "1px solid transparent",
      opacity: muted ? 0.65 : 1,
    }}>
      <span className={`status-dot ${dot}`} style={{ width: 9, height: 9 }}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</div>
        <div style={{ fontSize: 10, color: "var(--slate-500)" }}>{note}</div>
      </div>
      <span className="mono" style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink)" }}>{right}</span>
    </div>
  );
}

// ─── Shared composer (pinned at the bottom of the hub window) ─────
function HubComposer() {
  return (
    <div style={{ flex: "0 0 auto", padding: "10px 14px 14px", background: "linear-gradient(180deg, transparent, var(--paper) 38%)" }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 9, flexWrap: "wrap" }}>
        {[["wrench", "What's overdue?"], ["alert", "Open recalls"], ["camera", "Diagnose a photo"], ["map", "Plan a drive"]].map(([ic, lb], i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 10px", background: "#fff", border: "1px solid var(--paper-line)", borderRadius: 999, fontSize: 11, fontWeight: 500, color: "var(--slate-700)", cursor: "pointer" }}>
            <Icon name={ic} size={11} style={{ color: "var(--slate-500)" }}/> {lb}
          </span>
        ))}
      </div>
      <div style={{ background: "#fff", border: "1px solid var(--paper-line)", borderRadius: 14, boxShadow: "var(--shadow-2)", padding: "10px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
        <input placeholder="Ask Au7o anything about your Challenger…" style={{ border: "none", outline: "none", fontFamily: "var(--font-sans)", fontSize: 13.5, padding: "4px 2px", color: "var(--ink)", background: "transparent" }}/>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 6 }}>
            <span style={fcComposerChip}><Icon name="paperclip" size={11}/> Attach</span>
            <span style={fcComposerChip}><Icon name="camera" size={11}/> Photo</span>
            <span style={fcComposerChip}><Icon name="mic" size={11}/> Voice</span>
          </div>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px", background: "var(--ink)", color: "#fff", borderRadius: 8, fontSize: 12.5, fontWeight: 500, cursor: "pointer" }}>
            <Icon name="send" size={12}/> Send
          </span>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// HUB WINDOW — MERGED: opens on the loaded hub (maintenance + issues),
// then auto-rotates through photo/video, recalls, and Drive.
// Composer stays pinned across every view.
// ════════════════════════════════════════════════════════════════
function HubWindowMerged({ interval = 4600 }) {
  const [idx, setIdx] = fcUseState(0);
  const [paused, setPaused] = fcUseState(false);
  const feedRef = React.useRef(null);

  // view 0 = on-open feed; views 1..3 = single-capability exchanges
  const extra = ["diagnose", "recalls", "drive"].map(id => HUB_SLIDES.find(s => s.id === id));
  const views = [{ id: "open", tag: "YOUR HUB · LOADED" }, ...extra];
  const n = views.length;

  fcUseEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIdx(i => (i + 1) % n), interval);
    return () => clearInterval(t);
  }, [paused, interval, n]);

  // reset scroll to top whenever the view changes
  fcUseEffect(() => { if (feedRef.current) feedRef.current.scrollTop = 0; }, [idx]);

  const v = views[idx];

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{
        width: 408, height: 600, background: "var(--paper)", borderRadius: 16, overflow: "hidden",
        border: "1px solid var(--paper-line)", boxShadow: "0 40px 90px rgba(0,0,0,0.45)",
        display: "flex", flexDirection: "column",
      }}
    >
      {/* window chrome */}
      <div style={{ height: 38, display: "flex", alignItems: "center", gap: 10, padding: "0 14px", borderBottom: "1px solid var(--paper-line)", background: "rgba(255,255,255,0.6)", backdropFilter: "blur(20px)", flex: "0 0 auto" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {["#ef4444", "#f59e0b", "#10b981"].map(c => <span key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.7 }}/>)}
        </div>
        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--slate-500)", fontFamily: "var(--font-mono)" }}>
            <span style={{ color: "var(--slate-400)" }}>🔒</span> au7o.io
          </span>
        </div>
        <div style={{ width: 42 }}/>
      </div>

      {/* vehicle context strip */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderBottom: "1px solid var(--paper-line)", background: "rgba(255,255,255,0.4)", flex: "0 0 auto" }}>
        <ChallengerSilhouette width={40} color="#1a1a1a"/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "-0.01em" }}>2015 Dodge Challenger SRT 392</div>
          <div className="mono" style={{ fontSize: 10, color: "var(--slate-500)" }}>64,218 mi · 6.4L Hemi</div>
        </div>
        <span style={{ fontSize: 9, fontWeight: 700, color: "var(--au7o-blue)", background: "rgba(59,130,246,0.1)", padding: "3px 8px", borderRadius: 999, letterSpacing: "0.04em" }}>AI HUB</span>
      </div>

      {/* feed — view 0 is the auto-loaded hub; 1..3 are capability exchanges */}
      <div ref={feedRef} className="web-scroll" style={{ flex: 1, overflow: "auto", padding: "14px 16px 8px", display: "flex", flexDirection: "column", gap: 13 }}>
        {idx === 0 ? (
          <div key="open" style={{ animation: "fc-fade .4s ease both", display: "flex", flexDirection: "column", gap: 13 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="au7o-pulse-soft" style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--au7o-blue)" }}/>
              <span className="eyebrow" style={{ fontSize: 9, color: "var(--au7o-blue)" }}>WELCOME BACK · HERE'S YOUR CHALLENGER</span>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <img src="brand/au7o-mascot.png" alt="" style={{ width: 28, height: 28, marginTop: 2, flex: "0 0 auto" }}/>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 0, flex: 1 }}>
                <div style={{ ...fcBubble, maxWidth: "none" }}>
                  You're at <b className="mono">64,218 mi</b>. Two services are coming up and your brake fluid's overdue — and I'm tracking <b>4 known issues</b> for this trim.
                </div>
                <AttMaintenance/>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <img src="brand/au7o-mascot.png" alt="" style={{ width: 28, height: 28, marginTop: 2, flex: "0 0 auto" }}/>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 0, flex: 1 }}>
                <div style={{ ...fcBubble, maxWidth: "none" }}>
                  Here's what's worth watching at your mileage — one is covered by an <b>open recall</b>:
                </div>
                <AttIssues/>
              </div>
            </div>
          </div>
        ) : (
          <React.Fragment>
            <div key={v.id + "-eb"} style={{ animation: "fc-fade .4s ease both", display: "inline-flex", alignItems: "center", gap: 7 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: v.accent }}/>
              <span className="eyebrow" style={{ fontSize: 9.5, color: "var(--slate-500)" }}>{v.eyebrow}</span>
            </div>
            <div key={v.id + "-u"} style={{ animation: "fc-fade .4s ease both", display: "flex", justifyContent: "flex-end" }}>
              <div style={fcUserBubble}>
                {v.promptHasPhoto && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, padding: "5px 7px", background: "rgba(255,255,255,0.18)", borderRadius: 7 }}>
                    <Icon name="camera" size={12} style={{ color: "#fff" }}/>
                    <span style={{ fontSize: 10.5, fontWeight: 600 }}>engine-bay.jpg</span>
                  </div>
                )}
                {v.prompt}
              </div>
            </div>
            <div key={v.id + "-a"} style={{ animation: "fc-rise .5s ease both", display: "flex", gap: 10, alignItems: "flex-start" }}>
              <img src="brand/au7o-mascot.png" alt="" style={{ width: 28, height: 28, marginTop: 2, flex: "0 0 auto" }}/>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 0, flex: 1 }}>
                <div style={{ ...fcBubble, maxWidth: "none" }}>{v.reply}</div>
                {React.createElement(v.Attachment)}
              </div>
            </div>
          </React.Fragment>
        )}
      </div>

      {/* dots */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px 0", flex: "0 0 auto" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {views.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)} aria-label={`View ${i + 1}`} style={{
              height: 6, borderRadius: 999, border: "none", cursor: "pointer", padding: 0,
              width: i === idx ? 24 : 6,
              background: i === idx ? "var(--ink)" : "var(--slate-300)",
              transition: "width .3s ease, background .3s ease",
            }}/>
          ))}
        </div>
        <span className="mono" style={{ fontSize: 10.5, color: "var(--slate-400)", marginLeft: "auto" }}>
          {idx === 0 ? "your hub" : "live demo"} · {String(idx + 1).padStart(2, "0")}/{String(n).padStart(2, "0")}
        </span>
      </div>

      {/* composer pinned */}
      <HubComposer/>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// EMAIL CAPTURE FORM
// ════════════════════════════════════════════════════════════════
function EmailCaptureForm({ dark = false, headline, sub, onSkip }) {
  const muted = dark ? "rgba(255,255,255,0.62)" : "var(--slate-500)";
  return (
    <div style={{ width: "100%", maxWidth: 400 }}>
      <Au7oMark size={26} color={dark ? "#fff" : "var(--ink)"}/>
      <h2 style={{ fontSize: 27, fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.12, marginTop: 20, color: dark ? "#fff" : "var(--ink)", textWrap: "pretty" }}>
        {headline || <>Your whole car, in one&nbsp;chat.</>}
      </h2>
      <p style={{ fontSize: 14, lineHeight: 1.55, marginTop: 12, color: muted }}>
        {sub || <>You already found your issue. Get the email and Au7o tracks maintenance, recalls, and known issues for your <b style={{ color: dark ? "#fff" : "var(--ink)" }}>2015 Challenger</b> — and diagnoses new ones from a photo.</>}
      </p>

      <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          background: dark ? "rgba(255,255,255,0.08)" : "#fff",
          border: dark ? "1px solid rgba(255,255,255,0.18)" : "1px solid var(--paper-line)",
          borderRadius: 12, padding: "4px 4px 4px 14px",
        }}>
          <Icon name="user" size={15} style={{ color: dark ? "rgba(255,255,255,0.5)" : "var(--slate-400)" }}/>
          <input placeholder="you@email.com" style={{
            flex: 1, border: "none", outline: "none", background: "transparent",
            fontFamily: "var(--font-sans)", fontSize: 14, padding: "10px 0",
            color: dark ? "#fff" : "var(--ink)",
          }}/>
          <button style={{
            padding: "11px 18px", background: "var(--au7o-blue)", color: "#fff", border: "none",
            borderRadius: 9, fontFamily: "var(--font-sans)", fontSize: 13.5, fontWeight: 600,
            cursor: "pointer", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 6,
          }}>
            Track my car <Icon name="chevron" size={12}/>
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11.5, color: muted }}>
          <Icon name="check" size={12} style={{ color: "var(--ok)" }}/>
          Free · no spam · your data stays yours
        </div>
      </div>

      <div style={{ marginTop: 20, paddingTop: 16, borderTop: dark ? "1px solid rgba(255,255,255,0.12)" : "1px solid var(--paper-line)", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex" }}>
          {["#0166B1", "#1a1a1a", "#7a1f1f"].map((c, i) => (
            <span key={i} style={{ width: 22, height: 22, borderRadius: "50%", background: c, border: `2px solid ${dark ? "#0B1220" : "var(--paper)"}`, marginLeft: i ? -7 : 0 }}/>
          ))}
        </div>
        <span style={{ fontSize: 11.5, color: muted }}>
          <b style={{ color: dark ? "#fff" : "var(--ink)" }}>26,000+ owners</b> track their cars with Au7o
        </span>
      </div>

      {onSkip && (
        <button onClick={onSkip} style={{
          marginTop: 14, background: "none", border: "none", cursor: "pointer",
          fontFamily: "var(--font-sans)", fontSize: 12.5, color: muted,
          textDecoration: "underline", textUnderlineOffset: 3, padding: 0,
        }}>Maybe later — keep reading</button>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// RECOMMENDED — SPLIT: email left (paper), rotating hub window right (ink)
// ════════════════════════════════════════════════════════════════
function FeatureCarouselSplit() {
  return (
    <div style={{ width: "100%", display: "grid", gridTemplateColumns: "1fr 1.15fr", minHeight: 720, background: "#fff", borderRadius: 24, overflow: "hidden", border: "1px solid var(--paper-line)", boxShadow: "0 30px 60px rgba(11,18,32,0.10)" }}>
      <div style={{ padding: "52px 48px", display: "flex", alignItems: "center", background: "var(--paper)" }}>
        <EmailCaptureForm onSkip={() => {}}/>
      </div>
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", padding: 40, background: "linear-gradient(155deg,#0B1220,#1a2440 70%,#1d2b4a)", overflow: "hidden" }}>
        <AmbientBackground/>
        <div style={{ position: "relative", zIndex: 1 }}>
          <HubWindowMerged/>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  HUB_SLIDES,
  AttMaintenance, AttIssues, AttRecalls, AttDiagnose, AttDrive, AttShell, AttRow,
  HubComposer, HubWindowMerged, EmailCaptureForm,
  FeatureCarouselSplit,
  WallSplitMerged: FeatureCarouselSplit, // alias — matches the exploration name
});
