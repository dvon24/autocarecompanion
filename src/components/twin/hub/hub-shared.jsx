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
  return {
    bubble,
    // Date.now() as a key would differ between server and client render; a
    // counter keeps the remount behaviour without the hydration mismatch.
    say: (text) => setBubble({ text, key: ++seq.current }),
    clear: () => setBubble(null),
  };
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

export function HPComposer({ say }) {
  return (
    <div style={{ padding: "14px 44px 20px", borderTop: `1px solid ${KI.line}`, background: "var(--ki-glass)", backdropFilter: "blur(16px)" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <div style={{ background: "var(--ki-card)", border: `1px solid ${KI.line}`, borderRadius: 16, boxShadow: "var(--shadow-1)", padding: "10px 12px 10px 16px", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ flex: 1, fontSize: 14, color: "var(--slate-400)" }}>Ask anything about your car — symptoms, parts, recalls, or plan a trip.</span>
          <a href="/diagnose" className="chip chip-sm" style={{ textDecoration: "none" }}><Icon name="camera" size={12} /> Camera</a>
          <VoiceButton say={say} />
          <a href="/diagnose" style={{ background: "var(--ink)", border: "none", color: "var(--ki-page)", width: 34, height: 34, borderRadius: 11, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}><Icon name="send" size={14} /></a>
        </div>
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
