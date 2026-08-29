"use client";
/* eslint-disable */
/**
 * The demo hub — ported from `design/au7o (6)/(9)` (identical in both).
 * Sidebar + car stage + tech-tree overlay + feedback modal, desktop and mobile.
 *
 * Two changes from the design source:
 *   • THStage is imported from the twin stage rather than duplicated — the hero
 *     and the hub render the same car.
 *   • The feedback modal actually posts to /api/feedback now; the design’s
 *     version only flipped a local “sent” flag, which would have quietly
 *     thrown away every note a beta tester wrote.
 */
import React from "react";
import { useSearchParams } from "next/navigation";
import { Icon } from "../stage/Icon";
import { TwinStage as THStage, TH_V, TH_MILES } from "../stage/TwinStage";
import { TechTree, TT_TREES, ttRisk, ttHasUpgrade, ttFinish, useEquipped, TT_BRANCH_FOR_HOTSPOT, TT_NODE_FOR_HOTSPOT } from "../stage/TechTree";
import { Au7oMark, KICard, useTheme, useNarrow, useBubble, ThemeDots, SevBadge, TwinChatComposer, HPComposer, KI } from "./hub-shared";
import { useHubView } from "./hub-view";
import { useTwinVehicle, useTwinMiles, useTwinTrees, useTwinNextService, useTwinRecent, useTwinCatalog, useTwinMode, useTwinPaintControl, useTwinGuideAnswer, greetingFor } from "../twin-context";
import { resolveTwinDeepLink } from "../../../lib/vehicle-twin-catalog";
import { collectHotspotNodes, summarizeEvidence } from "../demo-trees";
import { resolveTwinPaintArtwork } from "../stage/paint-art";

/* /demo/hub?open=<hotspot> — the marketing card on known-issues articles links
   straight to the part someone clicked, so they land in that tech tree instead
   of a generic demo. Client-only (the hub is ssr:false), fails soft. */
function initialFromQuery() {
  try {
    const hot = new URLSearchParams(window.location.search).get("open");
    if (!hot) return { branch: null, node: null };
    if (hot === "car") return { branch: "car", node: null };
    const branch = TT_BRANCH_FOR_HOTSPOT[hot];
    if (!branch) return { branch: null, node: null };
    return { branch, node: TT_NODE_FOR_HOTSPOT[hot] || null };
  } catch (e) { return { branch: null, node: null }; }
}

/* Risk/label helpers the sidebar shares with the stage. These were computed
   once at module load against the demo's tree set and 65,000 mi; a live hub's
   odometer only exists at render, so they take both as arguments now. */
const thEvidence = (branch, trees, miles) => summarizeEvidence(collectHotspotNodes(trees, {branch}), miles);
const thPartCount = (branch, trees) => trees[branch] ? Object.keys(trees[branch].nodes).filter(k => !trees[branch].nodes[k].group).length : 0;
const thMeta = (branch, trees, miles) => `${thPartCount(branch, trees)} parts · ${thEvidence(branch, trees, miles).label}`;
const mobileComposerPlaceholder = (twinMode, model) => twinMode === "owner" ? "Ask about your car…" : `Ask about this ${model} demo…`;
const TH_SYSTEMS = [
  { hot:"wheel", branch:"wheel",  label:"Wheel, Tire & Brakes", img:"/twin-stage/parts/part-caliper.webp" },
  { hot:"hood",  branch:"engine", label:"Engine",               img:"/twin-stage/parts/part-engine.webp" },
  { hot:"trans", branch:"trans",  label:"Transmission",         img:"/twin-stage/parts/part-transmission.webp" },
  { hot:"glass", branch:"wipers", label:"Windshield Wipers",    img:"/twin-stage/parts/part-wipers.webp" },
];

/* ── Sidebar — systems double as a second way in ── */
function THSidebar({ onOpen, onClose, drawer, onFeedback }) {
  const vehicle = useTwinVehicle();
  const miles = useTwinMiles();
  const trees = useTwinTrees(TT_TREES);
  const nextService = useTwinNextService();
  const recent = useTwinRecent();
  const catalog = useTwinCatalog();
  const paintControl = useTwinPaintControl();
  const paintArtwork = resolveTwinPaintArtwork(catalog, paintControl);
  const twinMode = useTwinMode();
  const evidence = thEvidence("car", trees, miles);
  const due = evidence.due;
  const watch = evidence.watch;
  /* The demo ships a sample "Recent" list. On a live hub those threads belong
     to nobody, so show the owner's real ones or show none at all. */
  const threads = recent || [];
  return (
    <aside style={{ width:264, flex:"0 0 264px", borderRight: drawer ? "none" : "1px solid var(--ki-line)", background:"var(--ki-card)", display:"flex", flexDirection:"column", height:"100%" }}>
      <div style={{ padding:"18px 20px 14px", display:"flex", alignItems:"center" }}>
        <Au7oMark size={24}/>
        {drawer && <button onClick={onClose} style={{ marginLeft:"auto", background:"transparent", border:"none", color:"var(--slate-400)", cursor:"pointer", display:"flex", padding:4 }}><Icon name="x" size={16}/></button>}
      </div>
      <div className="web-scroll" style={{ flex:1, minHeight:0, overflowY:"auto" }}>
        <div style={{ padding:"0 14px" }}>
          <KICard>
            <div style={{ aspectRatio:"16 / 9", overflow:"hidden",display:"grid",placeItems:"center",color:"rgba(255,255,255,.7)",fontSize:10.5,textAlign:"center",background:"#0A0D14" }}>{paintArtwork.art ? <img src={paintArtwork.art.base} alt="" style={{ display:"block",width:"100%",height:"100%",objectFit:"cover" }}/> : "Matching color artwork unavailable"}</div>
            <div style={{ padding:"11px 13px 13px" }}>
              <div style={{ fontSize:13.5, fontWeight:600, letterSpacing:"-0.01em" }}>{vehicle.year} {vehicle.make} {vehicle.model}</div>
              <div style={{ fontSize:11.5, color:"var(--slate-500)", marginTop:1 }}>{vehicle.trim} · <span className="mono">{typeof miles === "number" ? `${miles.toLocaleString()} mi${twinMode === "demo" ? " sample" : ""}` : "Mileage unavailable"}</span> · {twinMode}</div>
              <div style={{ display:"flex", gap:5, marginTop:9, flexWrap:"wrap" }}>
                {due > 0 && <span className="mono" style={{ fontSize:10.5, fontWeight:600, padding:"3px 8px", borderRadius:6, background:"var(--ki-crit-bg)", color:"var(--ki-crit)" }}>{due} due</span>}
                {watch > 0 && <span className="mono" style={{ fontSize:10.5, fontWeight:600, padding:"3px 8px", borderRadius:6, background:"var(--ki-mod-bg)", color:"var(--ki-mod-ink)" }}>{watch} watch</span>}
              </div>
            </div>
          </KICard>
        </div>
        <div style={{ padding:"16px 20px 7px" }} className="eyebrow">Tech trees</div>
        <div style={{ padding:"0 8px 2px" }}>
          <button onClick={()=>onOpen("car")} style={{ width:"100%", display:"flex", alignItems:"center", gap:10, background:"transparent", border:"none", padding:"7px 12px", borderRadius:10, cursor:"pointer", textAlign:"left", color:"var(--ink)", fontFamily:"var(--font-sans)" }}>
            <span style={{ width:28, height:28, borderRadius:8, overflow:"hidden", background:"#0d1017", border:"1px solid var(--ki-line)", flexShrink:0 }}>{paintArtwork.art&&<img src={paintArtwork.art.base} alt="" style={{ display:"block",width:"100%",height:"100%",objectFit:"cover" }}/>}</span>
            <span style={{ minWidth:0, flex:1 }}>
              <span style={{ display:"block", fontSize:12.5, fontWeight:600 }}>Whole car</span>
              <span style={{ display:"block", fontSize:10.5, color:"var(--slate-500)" }}>{catalog.systems.filter(s=>trees[s.branch]).length} systems{due > 0 ? ` · ${due} due` : ""}</span>
            </span>
            <Icon name="chevron" size={12} style={{ color:"var(--slate-400)" }}/>
          </button>
        </div>
        <div style={{ padding:"0 8px", display:"flex", flexDirection:"column", gap:2 }}>
          {catalog.systems.filter(s => trees[s.branch]).map(s => (
            <button key={s.branch} onClick={()=>onOpen(s.hot)} style={{ display:"flex", alignItems:"center", gap:10, background:"transparent", border:"none", padding:"7px 12px", borderRadius:10, cursor:"pointer", textAlign:"left", color:"var(--ink)", fontFamily:"var(--font-sans)" }}>
              <span style={{ width:28, height:28, borderRadius:8, overflow:"hidden", background:"#0d1017", border:"1px solid var(--ki-line)", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                {s.img ? <img src={s.img} alt="" style={{ width:"128%", height:"128%", objectFit:"contain", filter:"brightness(1.6)" }}/> : <Icon name={s.icon} size={15} style={{ color:"var(--slate-400)" }}/>}
              </span>
              <span style={{ minWidth:0, flex:1 }}>
                <span style={{ display:"block", fontSize:12.5, fontWeight:500, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{s.label}</span>
                <span style={{ display:"block", fontSize:10.5, color:"var(--slate-500)" }}>{thMeta(s.branch, trees, miles)}</span>
              </span>
              <Icon name="chevron" size={12} style={{ color:"var(--slate-400)" }}/>
            </button>
          ))}
        </div>
        {/* The demo hardcoded "Front brake pads · 20,000 mi past a typical set".
            A live hub computes this from the owner's logged services, and when
            nothing is due it renders nothing rather than inventing a job. */}
        {nextService && (
          <div style={{ padding:"14px 14px 0" }}>
            <KICard>
              <div style={{ padding:"11px 14px", display:"flex", alignItems:"center", gap:8 }}>
                <span className="eyebrow" style={{ fontSize:10 }}>Next service</span>
                <span style={{ marginLeft:"auto" }}><SevBadge kind={!nextService.overdue ? "Moderate" : "Overdue"}/></span>
              </div>
              <div style={{ padding:"0 14px 12px" }}>
                <div style={{ fontSize:13, fontWeight:600 }}>{nextService.label}</div>
                <div className="mono" style={{ fontSize:11, color:!nextService.overdue ? "var(--slate-500)" : "var(--ki-crit)", marginTop:2 }}>{nextService.note}</div>
                <div style={{ height:4, borderRadius:999, background:"var(--ki-page)", marginTop:9, overflow:"hidden" }}><div style={{ width:`${Math.round(Math.min(1, nextService.progress == null ? 1 : nextService.progress) * 100)}%`, height:"100%", background:!nextService.overdue ? "var(--ki-mod)" : "var(--ki-crit)" }}/></div>
                {nextService.hot && <button onClick={()=>onOpen(nextService.hot, nextService.nodeId)} style={{ marginTop:10, width:"100%", minHeight:34, borderRadius:9, border:"1px solid var(--ki-line)", background:"var(--ki-card)", color:"var(--ink)", fontFamily:"var(--font-sans)", fontSize:11.5, fontWeight:600, cursor:"pointer" }}>Open item</button>}
              </div>
            </KICard>
          </div>
        )}
        {threads.length > 0 && <div style={{ padding:"16px 20px 6px" }} className="eyebrow">Recent</div>}
        <div style={{ padding:"0 8px 10px", display:"flex", flexDirection:"column", gap:2 }}>
          {threads.map((t,i)=>(
            <button key={i} onClick={t.href ? () => { window.location.href = t.href; } : undefined} style={{ display:"flex", alignItems:"center", gap:10, background:"transparent", border:"none", padding:"8px 12px", borderRadius:10, cursor:"pointer", textAlign:"left", color:"var(--ink)", fontFamily:"var(--font-sans)" }}>
              <Icon name={t.i} size={13} style={{ color:"var(--slate-400)" }}/>
              <span style={{ minWidth:0, flex:1 }}>
                <span style={{ display:"block", fontSize:12.5, fontWeight:500, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{t.t}</span>
                <span style={{ display:"block", fontSize:10.5, color:"var(--slate-500)" }}>{t.w}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
      <div style={{ borderTop:"1px solid var(--ki-line)", padding:"10px 8px", display:"flex", flexDirection:"column" }}>
        {/* "Open Drive" and "Add vehicle" removed — the latter was a <button>
            with no handler, and there is no vehicle to add in a no-account
            demo. Known Issues is a real link now; it had the same dead-button
            problem. Same component serves the desktop sidebar and the mobile
            drawer, so both are fixed here. */}
        {[
          { ic: "home", label: "Home", href: "/" },
          { ic: "car", label: "Garage", href: "/garage" },
          { ic: "user", label: "Founder sign in", href: "/founder/signin" },
          { ic: "book", label: "Known Issues", href: "/known-issues" },
          { ic: "chat", label: "Send feedback", onClick: onFeedback },
        ].map((item) => {
          const style = { display:"flex", alignItems:"center", gap:10, background:"transparent", border:"none", padding:"9px 12px", borderRadius:10, cursor:"pointer", fontSize:12.5, fontWeight:500, color:"var(--ink)", fontFamily:"var(--font-sans)", textDecoration:"none" };
          const body = <><Icon name={item.ic} size={14} style={{ color:"var(--slate-400)" }}/>{item.label}</>;
          return item.href
            ? <a key={item.label} href={item.href} style={style}>{body}</a>
            : <button key={item.label} onClick={item.onClick} style={style}>{body}</button>;
        })}
      </div>
    </aside>
  );
}

/* ── Beta feedback — reachable from anywhere in the hub, including with a tree open ── */
const TH_FB_TOPICS = ["Finding a part", "A known issue", "Prices", "The tree layout", "Something broke", "Other"];

function THFeedback({ open, onClose }) {
  const [topic, setTopic] = React.useState(null);
  const [note, setNote] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [sent, setSent] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  React.useEffect(() => { if (open) { setSent(false); setFailed(false); setTopic(null); setNote(""); } }, [open]);
  if (!open) return null;
  const field = { width:"100%", background:"var(--ki-page)", border:"1px solid var(--ki-line)", borderRadius:11, padding:"10px 12px", fontSize:13, color:"var(--ink)", fontFamily:"var(--font-sans)", outline:"none" };
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:60, background:"rgba(8,11,18,.6)", backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div onClick={e=>e.stopPropagation()} className="hl-bubble" style={{ width:"100%", maxWidth:440, background:"var(--ki-card)", border:"1px solid var(--ki-line)", borderRadius:18, boxShadow:"0 30px 80px rgba(0,0,0,.45)", overflow:"hidden" }}>
        {sent ? (
          <div style={{ padding:"26px 22px", display:"flex", flexDirection:"column", alignItems:"center", gap:10, textAlign:"center" }}>
            <span style={{ display:"grid", placeItems:"center", width:38, height:38, borderRadius:999, background:"var(--ki-ok-bg)", color:"var(--ki-ok-ink)" }}><Icon name="check" size={19} stroke={2.6}/></span>
            <div style={{ fontSize:15.5, fontWeight:600, letterSpacing:"-0.01em" }}>Got it — thank you.</div>
            <div style={{ fontSize:12.5, color:"var(--slate-500)", textWrap:"pretty", maxWidth:300 }}>This goes straight into what gets built next. If you left an email I'll reply when it ships.</div>
            <button onClick={onClose} style={{ marginTop:4, background:"var(--ink)", color:"var(--ki-page)", border:"none", borderRadius:11, padding:"10px 18px", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"var(--font-sans)" }}>Back to the car</button>
          </div>
        ) : (
          <form onSubmit={async e=>{ e.preventDefault(); if (!note.trim()) return;
              /* Real submit: /api/feedback stores a Feedback row the admin page reads.
                 Fail-soft — a dropped network call must never eat someone’s note silently,
                 so we only show the thank-you on a confirmed write. */
              try {
                const res = await fetch("/api/feedback", { method:"POST", headers:{"Content-Type":"application/json"},
                  body: JSON.stringify({ type:"general", message: (topic ? "["+topic+"] " : "") + note.trim(), email: email.trim() || undefined }) });
                if (res.ok) setSent(true); else setFailed(true);
              } catch { setFailed(true); }
            }}>
            <div style={{ padding:"14px 16px", borderBottom:"1px solid var(--ki-line)", display:"flex", alignItems:"center", gap:9 }}>
              <img src="/twin-stage/au7o-mascot.webp" alt="" style={{ width:24, height:24, objectFit:"contain", flexShrink:0 }}/>
              <div style={{ minWidth:0, flex:1 }}>
                <div className="eyebrow" style={{ fontSize:9.5, color:"var(--au7o-blue)" }}>Beta feedback</div>
                <div style={{ fontSize:14.5, fontWeight:600, letterSpacing:"-0.01em", marginTop:2 }}>What should be better?</div>
              </div>
              <button type="button" onClick={onClose} aria-label="Close" style={{ width:30, height:30, borderRadius:9, background:"var(--ki-page)", border:"1px solid var(--ki-line)", color:"var(--slate-500)", cursor:"pointer", display:"grid", placeItems:"center", flexShrink:0 }}><Icon name="x" size={14}/></button>
            </div>
            <div style={{ padding:"14px 16px 16px", display:"flex", flexDirection:"column", gap:11 }}>
              <div>
                <div style={{ fontSize:11.5, fontWeight:600, color:"var(--slate-700)", marginBottom:7 }}>What were you doing?</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {TH_FB_TOPICS.map(t => (
                    <button key={t} type="button" onClick={()=>setTopic(topic===t?null:t)}
                      style={{ padding:"6px 11px", borderRadius:999, cursor:"pointer", fontFamily:"var(--font-sans)", fontSize:11.5, fontWeight:600,
                        background: topic===t ? "var(--ink)" : "transparent", color: topic===t ? "var(--ki-page)" : "var(--slate-700)",
                        border:`1px solid ${topic===t ? "var(--ink)" : "var(--ki-line)"}` }}>{t}</button>
                  ))}
                </div>
              </div>
              <textarea value={note} onChange={e=>setNote(e.target.value)} required rows={4} aria-label="Your feedback"
                placeholder="The part I wanted wasn't under the system I expected…" style={{ ...field, resize:"vertical", lineHeight:1.5 }}/>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email (optional — only if you want a reply)" aria-label="Email" style={field}/>
              {failed && <div style={{ fontSize:11.5, color:"var(--ki-crit)" }}>That didn’t send — check your connection and try again.</div>}
              <button type="submit" style={{ background:"#3B82F6", color:"#fff", border:"none", borderRadius:11, padding:"11px 16px", fontSize:13.5, fontWeight:600, cursor:"pointer", fontFamily:"var(--font-sans)" }}>Send feedback</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function THFeedbackPill({ onClick, mobile }) {
  return (
    <button onClick={onClick} style={{ position:"fixed", zIndex:55, right: mobile ? 12 : 18, bottom: mobile ? 78 : 18, display:"inline-flex", alignItems:"center", gap:7,
      minHeight:44, padding:"0 16px", borderRadius:999, cursor:"pointer", fontFamily:"var(--font-sans)", fontSize:12.5, fontWeight:600,
      background:"var(--ki-card)", color:"var(--ink)", border:"1px solid var(--ki-line)", boxShadow:"var(--shadow-2)" }}>
      <Icon name="chat" size={14} style={{ color:"var(--au7o-blue)" }}/>Feedback
    </button>
  );
}

/* ── Au7o bubble — sits in flow directly above the composer so it can never cover the hero ── */
function THBubble({ bubble, clear }) {
  return (
    <div style={{ flex:"0 0 auto", padding:"0 16px", minHeight: bubble ? undefined : 0, display:"flex", justifyContent:"center" }}>
      {bubble && (
        <div key={bubble.key} className="hl-bubble" style={{ display:"flex", gap:9, alignItems:"flex-start", background:"var(--ki-card)", border:"1px solid var(--ki-line)", borderRadius:"14px 14px 14px 4px", boxShadow:"var(--shadow-2)", padding:"11px 13px", maxWidth:560, width:"100%" }}>
          <img src="/twin-stage/au7o-mascot.webp" alt="" style={{ width:20, height:20, flexShrink:0, marginTop:1 }}/>
          <div style={{ fontSize:12.5, lineHeight:1.45, flex:1 }}>{bubble.text}</div>
          <button onClick={clear} aria-label="Dismiss" style={{ background:"transparent", border:"none", color:"var(--slate-400)", cursor:"pointer", fontSize:14, lineHeight:1, padding:0, flexShrink:0 }}>×</button>
        </div>
      )}
    </div>
  );
}

/* ── Tech tree overlay ── */
function THTreeOverlay({ branch, setBranch, onClose, say, onPartHelp, mobile, startNode }) {
  const miles = useTwinMiles();
  React.useEffect(() => {
    const on = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [onClose]);
  return (
    <div className="th-overlay" style={{ position:"fixed", inset:0, zIndex:50, background:"rgba(8,11,18,.62)", backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center", padding: mobile ? 0 : 28 }}>
      <div className="th-sheet" style={{ width:"100%", maxWidth:1180, height:"100%", maxHeight: mobile ? "100%" : 760, borderRadius: mobile ? 0 : 18, overflow:"hidden", border:"1px solid var(--ki-line)", boxShadow:"0 30px 80px rgba(0,0,0,.45)", background:"var(--ki-page)" }}>
        {/* Mobile gets the vertical tree + bottom-sheet detail — the same treatment
            as the hero, which reads far better on a phone. The overlay already
            knew it was mobile; it just never passed that down. */}
        <TechTree branch={branch} setBranch={setBranch} miles={miles} onClose={onClose} say={say} onPartHelp={onPartHelp} startNode={startNode}
          vertical={mobile} compact={mobile} detailMode={mobile ? "sheet" : null}/>
      </div>
    </div>
  );
}

/* ── Desktop ── */
function THDesktop({ tc }) {
  const { enterMinimal } = useHubView();
  const vehicle = useTwinVehicle();
  const miles = useTwinMiles();
  const trees = useTwinTrees(TT_TREES);
  const [mode, setMode] = React.useState("hotspots");
  const catalog = useTwinCatalog();
  const searchParams = useSearchParams();
  const answer = useTwinGuideAnswer();
  const [branch, setBranch] = React.useState(null);
  const [startNode, setStartNode] = React.useState(null);
  const [chatPrefill, setChatPrefill] = React.useState(null);
  const chatPrefillSeq = React.useRef(0);
  React.useEffect(() => { const target=resolveTwinDeepLink(catalog, searchParams.get("open"), trees); setBranch(target.branch); setStartNode(target.node); }, [catalog, searchParams, trees]);
  const [fb, setFb] = React.useState(false);
  const changeBranch = React.useCallback((nextBranch) => { setStartNode(null); setBranch(nextBranch); }, []);
  const closeTree = React.useCallback(() => setBranch(null), []);
  /* The greeting was frozen at "Evening" and named the car in the string.
     Both read from the clock and the actual vehicle now — this screen is
     meant to be opened daily, and a hub that says "Evening" at 8am tells on
     itself immediately. */
  const greeting = greetingFor();
  const { bubble, say, clear } = useBubble(`${greeting}. This is the ${vehicle.model} ${useTwinMode() === "owner" ? "owner hub" : "demo"} — click any mapped part to open its selected tree.`);
  const askPart = React.useCallback((context) => {
    setBranch(null);
    setChatPrefill({ value:context, key:++chatPrefillSeq.current });
    say("Part and vehicle context loaded in the hub chat. Review or edit it, then send when ready.");
  }, [say]);
  const open = (hot, nodeId = null) => {
    const target = resolveTwinDeepLink(catalog, hot, trees);
    if (!target.branch) return;
    const b = target.branch;
    setStartNode(nodeId || target.node || null);
    setBranch(b);
    say(b === "car" ? "Here's the whole car — every system Au7o tracks. Click one to drill in." : `Opening the ${trees[b].label.toLowerCase()} tree. Back out to the car any time from the breadcrumb.`);
  };
  return (
    <div className={"ki-theme-" + tc.theme} style={{ display:"flex", height:"100dvh", background:"var(--ki-page)", color:"var(--ink)", fontFamily:"var(--font-sans)", overflow:"hidden" }}>
      <THSidebar onOpen={open} onFeedback={()=>setFb(true)}/>
      <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", position:"relative" }}>
        <div className="web-scroll" style={{ flex:1, minHeight:0, display:"flex", flexDirection:"column", gap:16, padding:"26px clamp(18px,4vw,44px) 16px", maxWidth:1020, width:"100%", margin:"0 auto" }}>
          <div style={{ flex:"0 0 auto" }}>
            <div style={{ display:"flex", alignItems:"center", gap:9 }}>
              <span className="eyebrow" style={{ color:"var(--au7o-blue)" }}>Au7o · tech tree hub</span>
              <span style={{ marginLeft:"auto" }}><ThemeDots tc={tc}/></span>
            </div>
            <h1 style={{ fontSize:29, fontWeight:600, letterSpacing:"-0.03em", lineHeight:1.15, marginTop:9, textWrap:"pretty" }}>
              {greeting}. <span style={{ color:"var(--slate-400)" }}>Touch any part of the car.</span>
            </h1>
          </div>
          {/* fill: the car expands to own the column — there is nothing else in it.
              No fullscreen control needed here; it is already as large as the space allows. */}
          <THStage mode={mode} setMode={setMode} onOpen={open} fill allowFullscreen onExpand={enterMinimal}/>
          {/* Suggestion chips removed — they competed with the car for attention
              and the car is the whole point of this screen. */}
        </div>
        <THBubble bubble={bubble} clear={clear}/>
        <HPComposer say={say} answer={answer} prefill={chatPrefill}/>
      </div>
      {branch && <THTreeOverlay branch={branch} setBranch={changeBranch} onClose={closeTree} say={say} onPartHelp={askPart} startNode={startNode}/>}
      {/* Floating feedback pill removed — it sat over the content on mobile.
          Feedback is still reachable from the sidebar item. */}
      <THFeedback open={fb} onClose={()=>setFb(false)}/>
    </div>
  );
}

/* ── Mobile ── */
function THMobile({ tc }) {
  const { enterMinimal } = useHubView();
  const vehicle = useTwinVehicle();
  const miles = useTwinMiles();
  const trees = useTwinTrees(TT_TREES);
  const twinMode = useTwinMode();
  const greeting = greetingFor();
  const [mode, setMode] = React.useState("hotspots");
  const catalog = useTwinCatalog();
  const searchParams = useSearchParams();
  const answer = useTwinGuideAnswer();
  const [branch, setBranch] = React.useState(null);
  const [nav, setNav] = React.useState(false);
  const [fb, setFb] = React.useState(false);
  const [startNode, setStartNode] = React.useState(null);
  const [chatPrefill, setChatPrefill] = React.useState(null);
  const chatPrefillSeq = React.useRef(0);
  const changeBranch = React.useCallback((nextBranch) => { setStartNode(null); setBranch(nextBranch); }, []);
  const closeTree = React.useCallback(() => setBranch(null), []);
  React.useEffect(() => { const target=resolveTwinDeepLink(catalog, searchParams.get("open"), trees); setBranch(target.branch); setStartNode(target.node); }, [catalog, searchParams, trees]);
  const { bubble, say, clear } = useBubble(`${greeting}. Tap any part of ${twinMode === "owner" ? `your ${vehicle.model}` : `this ${vehicle.model} demo`} and I'll open its tech tree.`);
  const askPart = React.useCallback((context) => {
    setBranch(null);
    setChatPrefill({ value:context, key:++chatPrefillSeq.current });
    say("Part and vehicle context loaded in the hub chat. Review or edit it, then send when ready.");
  }, [say]);
  const open = (hot, nodeId = null) => {
    const target = resolveTwinDeepLink(catalog, hot, trees);
    if (!target.branch) return;
    setNav(false);
    setStartNode(nodeId || target.node || null);
    setBranch(target.branch);
  };
  return (
    <div className={"ki-theme-" + tc.theme} style={{ height:"100dvh", display:"flex", justifyContent:"center", background:"var(--ki-desk)", color:"var(--ink)", fontFamily:"var(--font-sans)" }}>
      <div style={{ width:"min(430px,100vw)", height:"100%", background:"var(--ki-page)", display:"flex", flexDirection:"column", position:"relative", overflow:"hidden", boxShadow:"var(--shadow-2)" }}>
        <div style={{ padding:"12px 14px", display:"flex", alignItems:"center", gap:10, background:"var(--ki-card)", borderBottom:"1px solid var(--ki-line)", zIndex:5 }}>
          <button onClick={()=>setNav(true)} aria-label="Menu" style={{ width:32, height:32, borderRadius:9, border:"1px solid var(--ki-line)", background:"var(--ki-card)", color:"var(--slate-700)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><Icon name="list" size={15}/></button>
          <Au7oMark size={20}/>
          <span style={{ marginLeft:"auto" }}><ThemeDots tc={tc} size={13}/></span>
          <span className="mono" style={{ fontSize:10.5, fontWeight:600, padding:"4px 9px", borderRadius:999, background:"var(--ki-page)", border:"1px solid var(--ki-line)" }}>{typeof miles === "number" ? `${miles.toLocaleString()} mi${twinMode === "demo" ? " sample" : ""}` : "Mileage unavailable"}</span>
        </div>
        <div className="web-scroll" style={{ flex:1, minHeight:0, padding:"14px 13px 12px", display:"flex", flexDirection:"column", gap:13 }}>
          <h2 style={{ fontSize:20, fontWeight:600, letterSpacing:"-0.02em", lineHeight:1.2, flex:"0 0 auto" }}>{greeting}. <span style={{ color:"var(--slate-400)" }}>Tap any part.</span></h2>
          <THStage mode={mode} setMode={setMode} onOpen={open} mobile allowFullscreen onExpand={enterMinimal}/>
          <div style={{ display:"flex", flexDirection:"column", gap:7, flex:"0 0 auto" }}>
            {catalog.systems.filter(s => trees[s.branch]).map(s => (
              <button key={s.branch} onClick={()=>open(s.hot)} style={{ display:"flex", alignItems:"center", gap:11, background:"var(--ki-card)", border:"1px solid var(--ki-line)", borderRadius:13, padding:"10px 12px", cursor:"pointer", textAlign:"left", minHeight:56, fontFamily:"var(--font-sans)", color:"var(--ink)" }}>
                <span style={{ width:38, height:38, borderRadius:10, overflow:"hidden", background:"#0d1017", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {s.img ? <img src={s.img} alt="" style={{ width:"126%", height:"126%", objectFit:"contain", filter:"brightness(1.6)" }}/> : <Icon name={s.icon} size={17} style={{ color:"rgba(255,255,255,.7)" }}/>}
                </span>
                <span style={{ minWidth:0, flex:1 }}>
                  <span style={{ display:"block", fontSize:13.5, fontWeight:600 }}>{s.label}</span>
                  <span style={{ display:"block", fontSize:11, color:"var(--slate-500)", marginTop:1 }}>{thMeta(s.branch, trees, miles)}</span>
                </span>
                <Icon name="chevron" size={14} style={{ color:"var(--slate-400)" }}/>
              </button>
            ))}
          </div>
        </div>
        <THBubble bubble={bubble} clear={clear}/>
        <div style={{ padding:"10px 12px 14px", borderTop:"1px solid var(--ki-line)", background:"var(--ki-glass)", backdropFilter:"blur(14px)", zIndex:6 }}>
          <TwinChatComposer say={say} answer={answer} compact prefill={chatPrefill} placeholder={mobileComposerPlaceholder(twinMode, vehicle.model)}/>
        </div>
        {nav && (
          <div onClick={()=>setNav(false)} style={{ position:"absolute", inset:0, zIndex:40, background:"rgba(8,11,18,.5)", display:"flex" }}>
            <div onClick={e=>e.stopPropagation()} style={{ height:"100%", boxShadow:"var(--shadow-2)" }}><THSidebar onOpen={open} onClose={()=>setNav(false)} onFeedback={()=>{ setNav(false); setFb(true); }} drawer/></div>
          </div>
        )}
      </div>
      {branch && <THTreeOverlay branch={branch} setBranch={changeBranch} onClose={closeTree} say={say} onPartHelp={askPart} startNode={startNode} mobile/>}
      {/* Floating feedback pill removed — it sat over the content on mobile.
          Feedback is still reachable from the sidebar item. */}
      <THFeedback open={fb} onClose={()=>setFb(false)}/>
    </div>
  );
}

function HubTechTree() {
  const [mobile, setMobile] = React.useState(window.innerWidth < 860);
  const tc = useTheme();
  React.useEffect(() => {
    const on = () => setMobile(window.innerWidth < 860);
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return mobile ? <THMobile tc={tc}/> : <THDesktop tc={tc}/>;
}

/* removed: standalone-bundle window export; this module uses real exports (see bottom). */
export { HubTechTree, THDesktop, THMobile, THSidebar, THBubble, THTreeOverlay, THFeedback, mobileComposerPlaceholder };
