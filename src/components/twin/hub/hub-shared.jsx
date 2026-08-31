"use client";
/* eslint-disable */
/**
 * Small shared pieces the hub screen needs, lifted from the design bundle's
 * shared modules (Au7oMark, KICard, useTheme, useNarrow). They lived in
 * separate standalone files there; there is no reason for four files here.
 */
import React from "react";
import Link from "next/link";
import { Icon } from "../stage/Icon";
import { useTwinCatalog, useTwinIssues, useTwinMiles, useTwinOwnerActions, useTwinTransmissionControl, useTwinVehicle } from "../twin-context";
import { buildTwinAssistantVehicle, normalizeTwinNodeContext, sendTwinAssistantMessage } from "../../../lib/twin-assistant-client";

/** The known-issues palette, as the design references it. */
export const KI = {
  desk: "var(--ki-desk)", pageBg: "var(--ki-page)", line: "var(--ki-line)",
  band: "var(--ki-band)", bandInk: "var(--ki-band-ink)",
  crit: "var(--ki-crit)", critBg: "var(--ki-crit-bg)", mod: "var(--ki-mod)", modBg: "var(--ki-mod-bg)",
  code: "var(--ki-code)", codeBg: "var(--ki-code-bg)", codeLine: "var(--ki-code-line)",
  ok: "var(--ki-ok)", okBg: "var(--ki-ok-bg)",
};

export const HL_THEMES = [
  { id: "paper", label: "Paper", a: "#F7F1E3", b: "#8A6D3B" },
  { id: "slate", label: "Slate", a: "#EDF2F7", b: "#52657D" },
  { id: "midnight", label: "Midnight", a: "#1B2334", b: "#7DA6F8" },
  { id: "plum", label: "Plum", a: "#EDE8F8", b: "#5B4A8E" },
];

/** Au7o's speech bubble — auto-dismisses after ~5s. */
export function useBubble(intro) {
  const [bubble, setBubble] = React.useState(intro ? { text: intro, key: 0 } : null);
  const timer = React.useRef(null);
  const seq = React.useRef(0);
  React.useEffect(() => {
    if (!bubble) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setBubble(null), 5200);
    return () => clearTimeout(timer.current);
  }, [bubble]);
  // Stable callbacks keep an auto-dismiss re-render from looking like a new
  // navigation handler to TechTree (which previously reset its branches).
  const say = React.useCallback((text) => setBubble({ text, key: ++seq.current }), []);
  const clear = React.useCallback(() => setBubble(null), []);
  return { bubble, say, clear };
}

export function ThemeDots({ tc, size = 15 }) {
  return (
    <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
      {HL_THEMES.map((t) => (
        <button key={t.id} onClick={() => tc.setTheme(t.id)} title={t.label} aria-label={"Theme: " + t.label} style={{
          width: size, height: size, borderRadius: "50%", cursor: "pointer", padding: 0,
          background: `radial-gradient(circle at 35% 35%, ${t.a} 55%, ${t.b} 56%)`,
          border: tc.theme === t.id ? "2px solid var(--au7o-blue)" : `1px solid ${KI.line}`,
          boxShadow: tc.theme === t.id ? "0 0 0 2px var(--ki-card) inset" : "none",
        }} />
      ))}
    </span>
  );
}

export function SevBadge({ kind }) {
  const map = {
    Critical: { bg: KI.crit, c: "#fff" }, Moderate: { bg: KI.mod, c: "#fff" },
    Recall: { bg: "var(--ink)", c: "var(--ki-page)" }, Overdue: { bg: KI.crit, c: "#fff" },
  };
  const m = map[kind] || map.Moderate;
  return <span style={{ fontSize: 10.5, fontWeight: 700, padding: "3px 9px", borderRadius: 6, background: m.bg, color: m.c, letterSpacing: "0.02em", flexShrink: 0 }}>{kind}</span>;
}

/**
 * Mic button. In the design this is a non-functional stub that merely says
 * "Listening…". Au7o has a REAL voice mechanic, so faking it in a public demo
 * would be the wrong kind of lie — this routes to the real thing instead.
 */
export function VoiceButton({ compact, href = "/diagnose" }) {
  const sz = compact ? 30 : 34;
  return (
    <a href={href} title="Talk to Au7o" aria-label="Talk to Au7o"
      style={{ width: sz, height: sz, borderRadius: compact ? 10 : 11, border: `1px solid ${KI.line}`, background: "var(--ki-card)", color: "var(--slate-500)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, textDecoration: "none" }}>
      <Icon name="mic" size={compact ? 13 : 14} />
    </a>
  );
}

export function normalizeTwinChatInput(value) {
  const text = String(value || "").trim();
  return text || null;
}

export function splitTwinAnswerLink(value) {
  const text = String(value || "");
  const match = text.match(/^(.*?)(?:\s*·\s*Buy:\s*)(https?:\/\/\S+)$/);
  return match ? { text:match[1].trim(), url:match[2] } : { text, url:null };
}

function inlineTwinAnswer(text) {
  const nodes = [];
  const pattern = /\[([^\]]+)\]\((https:\/\/[^\s)]+)\)|\*\*(.+?)\*\*|`([^`]+)`/g;
  let last = 0;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    if (match[1] && match[2]) {
      const youtube = /^https:\/\/(?:www\.)?youtube\.com\//i.test(match[2]);
      nodes.push(<a key={match.index} href={match[2]} target="_blank" rel={youtube ? "noopener noreferrer" : "noopener noreferrer sponsored"} style={{display:youtube?"inline-flex":"inline",alignItems:"center",gap:6,color:youtube?"#DC2626":"#2563EB",fontWeight:700,textDecoration:"underline",textUnderlineOffset:2}}>{youtube&&<span aria-hidden>▶</span>} {match[1]}</a>);
    } else if (match[3]) nodes.push(<strong key={match.index}>{match[3]}</strong>);
    else if (match[4]) nodes.push(<code key={match.index} style={{fontFamily:"var(--font-mono)",fontSize:".94em"}}>{match[4]}</code>);
    last = match.index + match[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function TwinAnswerContent({ text }) {
  const lines = String(text || "").split("\n");
  return <div style={{display:"grid",gap:6}}>{lines.map((line,index)=>{
    const follow = line.match(/^→\s+(.+)/);
    const bullet = line.match(/^[-•]\s+(.+)/);
    if (!line.trim()) return <div key={index} style={{height:3}}/>;
    if (follow) return <div key={index} style={{fontSize:11.5,color:"var(--slate-500)"}}>→ {inlineTwinAnswer(follow[1])}</div>;
    if (bullet) return <div key={index} style={{display:"flex",gap:7,alignItems:"flex-start"}}><span aria-hidden style={{color:"var(--slate-400)"}}>•</span><span>{inlineTwinAnswer(bullet[1])}</span></div>;
    return <div key={index}>{inlineTwinAnswer(line)}</div>;
  })}</div>;
}

export function TwinChatComposer({ say, compact = false, placeholder = "Ask anything about your car…", prefill = null }) {
  const [value, setValue] = React.useState("");
  const [reply, setReply] = React.useState(null);
  const [messages, setMessages] = React.useState([]);
  const [sessionId, setSessionId] = React.useState(null);
  const [selectedNode, setSelectedNode] = React.useState(null);
  const [continueMutation, setContinueMutation] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const inputRef = React.useRef(null);
  const autoSentKey = React.useRef(null);
  const vehicle = useTwinVehicle();
  const catalog = useTwinCatalog();
  const miles = useTwinMiles();
  const issues = useTwinIssues();
  const transmissionControl = useTwinTransmissionControl();
  const ownerActions = useTwinOwnerActions();
  const assistantVehicle = React.useMemo(()=>buildTwinAssistantVehicle({vehicle,catalogIdentity:catalog?.identity,transmission:transmissionControl?.choice||transmissionControl?.model?.current||vehicle?.transmission,mileage:miles}),[catalog?.identity,miles,transmissionControl?.choice,transmissionControl?.model?.current,vehicle]);
  const knownIssueTitles = React.useMemo(()=>(issues||[]).filter(issue=>issue?.id&&issue?.title).slice(0,12).map(issue=>({id:issue.id,title:issue.title})),[issues]);

  const ask = React.useCallback(async (raw, nodeOverride = selectedNode) => {
    const question = normalizeTwinChatInput(raw);
    if (!question || pending) {
      if (!question) setReply({text:"Type a question first.",error:true,key:Date.now()});
      return;
    }
    if (!assistantVehicle) {
      setReply({text:"This Twin does not have enough vehicle identity to ask safely yet.",error:true,key:Date.now()});
      return;
    }
    const previousMessages = messages;
    const nextMessages = [...previousMessages,{role:"user",content:question}].slice(-19);
    setMessages(nextMessages);
    setValue("");
    setPending(true);
    setReply({question,text:"",error:false,key:Date.now()});
    let streamed = "";
    try {
      const result = await sendTwinAssistantMessage({
        vehicle:assistantVehicle,
        messages:nextMessages,
        sessionId,
        ownerVehicleId:ownerActions?.vehicleId,
        continueMutation,
        knownIssueTitles,
        selectedNode:nodeOverride,
        onSession:setSessionId,
        onToken:(token)=>{streamed+=token;setReply(current=>({...current,text:streamed}));},
      });
      setMessages([...nextMessages,{role:"assistant",content:result.text}].slice(-20));
      setReply(current=>({...current,text:result.text,error:false}));
      setContinueMutation(result.awaitingMutationDetails);
      if (result.committedActions.length) {
        setSelectedNode(null);
        ownerActions?.refresh?.();
        say?.("Saved to your garage. The Twin is refreshing from the committed record.");
      } else if (result.awaitingMutationDetails) {
        say?.("Au7o needs one more detail before anything can be saved.");
      } else {
        say?.("Answer ready below — you can keep asking without leaving the hub.");
      }
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Au7o could not answer just now. Please try again.";
      setMessages(previousMessages);
      setValue(question);
      setReply({question,text:message,error:true,key:Date.now()});
    } finally {
      setPending(false);
    }
  }, [assistantVehicle, continueMutation, knownIssueTitles, messages, ownerActions, pending, say, selectedNode, sessionId]);

  React.useEffect(() => {
    if (!prefill?.value) return;
    setValue(prefill.value);
    const nextNode = normalizeTwinNodeContext(prefill.node);
    setSelectedNode(nextNode);
    setContinueMutation(false);
    setReply(null);
    const input = inputRef.current;
    input?.focus();
    input?.setSelectionRange(prefill.value.length, prefill.value.length);
  }, [prefill?.key]);
  React.useEffect(() => {
    if (prefill?.autoSend && prefill.value && !pending && autoSentKey.current !== prefill.key) {
      autoSentKey.current = prefill.key;
      ask(prefill.value, normalizeTwinNodeContext(prefill.node));
    }
  }, [pending, prefill?.key]);
  const submit = (event) => {
    event.preventDefault();
    ask(value);
  };
  return (
    <div style={{width:"100%"}}>
      {reply&&<div role={reply.error?"alert":"status"} aria-live="polite" style={{marginBottom:8,maxHeight:compact?220:260,overflowY:"auto",padding:compact?"11px 12px":"13px 14px",borderRadius:14,border:`1px solid ${reply.error?"var(--ki-crit)":"var(--ki-line)"}`,background:"var(--ki-card)",boxShadow:"var(--shadow-1)",fontSize:12.5,lineHeight:1.5,color:reply.error?"var(--ki-crit)":"var(--ink)"}}>
        {reply.question&&<div className="eyebrow" style={{fontSize:9.5,color:"var(--slate-500)",marginBottom:7,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>You asked · {reply.question}</div>}
        {reply.text?<TwinAnswerContent text={reply.text}/>:<div style={{color:"var(--slate-500)"}}>Au7o is checking your exact vehicle…</div>}
      </div>}
      <form onSubmit={submit} style={{ background:"var(--ki-card)", border:`1px solid ${KI.line}`, borderRadius:compact?14:16, boxShadow:"var(--shadow-1)", padding:compact?"8px 9px 8px 12px":"10px 12px 10px 16px", display:"flex", alignItems:"center", gap:8 }}>
        <input ref={inputRef} value={value} disabled={pending} onChange={(event)=>setValue(event.target.value)} aria-label="Ask Au7o about this vehicle" placeholder={placeholder} autoComplete="off" style={{flex:1,minWidth:0,border:0,outline:0,background:"transparent",color:"var(--ink)",fontFamily:"var(--font-sans)",fontSize:compact?13:14,lineHeight:1.4,opacity:pending?.65:1}}/>
        <a href="/diagnose" aria-label="Open camera diagnosis" title="Open camera diagnosis" style={{width:compact?30:34,height:compact?30:34,borderRadius:10,border:`1px solid ${KI.line}`,display:"grid",placeItems:"center",color:"var(--slate-500)",textDecoration:"none",flexShrink:0}}><Icon name="camera" size={12}/></a>
        {!compact&&<VoiceButton/>}
        <button type="submit" disabled={pending} aria-label="Send question" style={{background:"var(--ink)",border:"none",color:"var(--ki-page)",width:compact?30:34,height:compact?30:34,borderRadius:10,cursor:pending?"wait":"pointer",display:"grid",placeItems:"center",flexShrink:0,opacity:pending?.55:1}}><Icon name="send" size={compact?13:14}/></button>
      </form>
      <div style={{marginTop:6,fontSize:10.5,lineHeight:1.4,color:"var(--slate-500)",textAlign:"center"}}>Answers use this Twin's exact configuration when available · verify safety-critical work</div>
    </div>
  );
}

export function HPComposer({ say, prefill = null }) {
  return (
    <div style={{ padding: "14px 44px 20px", borderTop: `1px solid ${KI.line}`, background: "var(--ki-glass)", backdropFilter: "blur(16px)" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <TwinChatComposer say={say} prefill={prefill} placeholder="Ask anything about your car — symptoms, parts, how-to help, or what to buy."/>
        <div style={{ fontSize: 10.5, color: "var(--slate-500)", marginTop: 7, textAlign: "center" }}>Au7o knows your vehicle context · responses may need verifying with a mechanic</div>
      </div>
    </div>
  );
}

export function Au7oMark({ size = 28, color = "var(--ink)" }) {
  return (
    <Link href="/" aria-label="Au7o home" style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration:"none" }}>
      <img src="/twin-stage/au7o-mascot.webp" alt="" style={{ width: size, height: size, objectFit: "contain" }} />
      <span style={{ fontFamily: "var(--font-sans)", fontSize: size * 0.6, fontWeight: 600, letterSpacing: "-0.02em", color }}>
        Au<span style={{ color: "var(--au7o-blue)" }}>7</span>o
      </span>
    </Link>
  );
}

export function KICard({ children, style }) {
  return (
    <div className="twin-surface" style={{ background: "var(--ki-card)", color: "var(--ink)", border: "1px solid var(--ki-line)", borderRadius: 14, overflow: "hidden", ...style }}>
      {children}
    </div>
  );
}

/** Reads the design's theme preference. SSR-safe: defaults to "paper". */
export function useTheme() {
  const [theme, setT] = React.useState("paper");
  React.useEffect(() => {
    try {
      const s = localStorage.getItem("au7o-hl-theme");
      if (["paper", "slate", "midnight", "plum"].indexOf(s) >= 0) setT(s);
    } catch (e) { /* private mode */ }
    const on = (e) => { if (e.key === "au7o-hl-theme" && e.newValue) setT(e.newValue); };
    window.addEventListener("storage", on);
    return () => window.removeEventListener("storage", on);
  }, []);
  return { theme, setTheme: (t) => { setT(t); try { localStorage.setItem("au7o-hl-theme", t); } catch (e) {} } };
}

export function useNarrow(bp = 760) {
  const [narrow, setNarrow] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${bp}px)`);
    const on = () => setNarrow(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [bp]);
  return narrow;
}
