/* Au7o web — shared components for the redesigned web app */
/* Loaded via <script type="text/babel">; relies on React being global */

// ─── Vehicle context ──────────────────────────────────────────────
const WEB_VEHICLE = {
  year: 2015,
  make: "Dodge",
  model: "Challenger",
  trim: "SRT 392",
  engine: "6.4L V8 Hemi (Apache)",
  pkg: "SRT 392, Scat Pack, 1320",
  miles: 64218,
  knownIssues: 4,
  recalls: 6,
  partsCached: 8,
  color: "#1a1a1a",
};

// Health snapshot derived from issues + mileage
const HEALTH_SUMMARY = {
  status: "attention",   // ok | attention | critical
  headline: "2 high-priority issues need attention",
  detail: "Driveshaft U-Joint and EPS rack failures are common at this mileage. Recall S19 may apply — free repair.",
};

const SUGGESTED_PROMPTS = [
  { icon: "alert", label: "Common problems at 64k miles", scope: "issues" },
  { icon: "wrench", label: "Plan my next oil change", scope: "maintenance" },
  { icon: "search", label: "Why does my steering feel loose?", scope: "diagnose" },
  { icon: "map", label: "Plan a weekend trip", scope: "drive" },
  { icon: "list", label: "What recalls apply to my car?", scope: "recalls" },
  { icon: "spark", label: "Find a brake pad upgrade", scope: "parts" },
];

const RECENT_THREADS = [
  { title: "EPS rack — what to ask the shop", when: "Yesterday", icon: "wrench" },
  { title: "Trip to Big Sur, charging-free", when: "3 days ago", icon: "map" },
  { title: "OEM radiator — replace or upgrade?", when: "Last week", icon: "spark" },
];

// ─── Icons (single source) ───────────────────────────────────────
function Icon({ name, size = 18, stroke = 1.6, style }) {
  const s = { width: size, height: size, display: "inline-block", flex: "0 0 auto", ...style };
  const common = { fill: "none", stroke: "currentColor", strokeWidth: stroke, strokeLinecap: "round", strokeLinejoin: "round", viewBox: "0 0 24 24" };
  switch (name) {
    case "alert": return <svg style={s} {...common}><path d="M12 9v4M12 17h.01"/><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/></svg>;
    case "wrench": return <svg style={s} {...common}><path d="M14.7 6.3a4 4 0 0 1 5.66 5.66l-1.42 1.41-5.66-5.66 1.42-1.41Z"/><path d="m13.29 7.71-9.5 9.5a2 2 0 1 0 2.83 2.83l9.5-9.5"/></svg>;
    case "search": return <svg style={s} {...common}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>;
    case "map": return <svg style={s} {...common}><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z"/><path d="M9 4v14M15 6v14"/></svg>;
    case "list": return <svg style={s} {...common}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>;
    case "spark": return <svg style={s} {...common}><path d="M12 2v6M12 16v6M4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24M2 12h6M16 12h6M4.93 19.07l4.24-4.24M14.83 9.17l4.24-4.24"/></svg>;
    case "send": return <svg style={s} {...common}><path d="m22 2-7 20-4-9-9-4 20-7Z"/></svg>;
    case "mic": return <svg style={s} {...common}><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4"/></svg>;
    case "car": return <svg style={s} {...common}><path d="M5 17h14M5 17v-4l2-5h10l2 5v4M5 17v2M19 17v2M8 13h8"/><circle cx="8" cy="17" r="1.5"/><circle cx="16" cy="17" r="1.5"/></svg>;
    case "chat": return <svg style={s} {...common}><path d="M21 12a8 8 0 0 1-12 7l-5 1 1-4a8 8 0 1 1 16-4Z"/></svg>;
    case "book": return <svg style={s} {...common}><path d="M4 4v16a2 2 0 0 0 2 2h14V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2Z"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>;
    case "plus": return <svg style={s} {...common}><path d="M12 5v14M5 12h14"/></svg>;
    case "chevron": return <svg style={s} {...common}><path d="m9 6 6 6-6 6"/></svg>;
    case "chevron-down": return <svg style={s} {...common}><path d="m6 9 6 6 6-6"/></svg>;
    case "settings": return <svg style={s} {...common}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5h0a1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></svg>;
    case "check": return <svg style={s} {...common}><path d="M20 6 9 17l-5-5"/></svg>;
    case "spark2": return <svg style={s} {...common}><path d="M12 3 13.5 9.5 20 11 13.5 12.5 12 19 10.5 12.5 4 11 10.5 9.5 12 3Z"/></svg>;
    case "pin": return <svg style={s} {...common}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
    case "coffee": return <svg style={s} {...common}><path d="M3 8h14v6a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8ZM17 8h2a3 3 0 0 1 0 6h-2"/></svg>;
    case "fuel": return <svg style={s} {...common}><path d="M3 21h12V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v16ZM3 10h12"/><path d="M15 10v2a2 2 0 0 0 2 2h0a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2"/></svg>;
    case "swap": return <svg style={s} {...common}><path d="M7 4 3 8l4 4M3 8h13M17 20l4-4-4-4M21 16H8"/></svg>;
    case "chevron-up": return <svg style={s} {...common}><path d="m6 15 6-6 6 6"/></svg>;
    case "users": return <svg style={s} {...common}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
    case "info": return <svg style={s} {...common}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>;
    case "more": return <svg style={s} {...common}><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg>;
    case "user": return <svg style={s} {...common}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
    default: return null;
  }
}

// ─── Au7o mascot mark (small wordmark) ───────────────────────────
function Au7oMark({ size = 28, color = "var(--ink)" }) {
  return (
    <div style={{ display:"inline-flex", alignItems:"center", gap: 8 }}>
      <img src="brand/au7o-mascot.png" alt="" style={{ width: size, height: size, objectFit:"contain" }}/>
      <span style={{ fontFamily:"var(--font-sans)", fontSize: size*0.6, fontWeight: 600, letterSpacing:"-0.02em", color }}>
        Au<span style={{ color: "var(--au7o-blue)" }}>7</span>o
      </span>
    </div>
  );
}

// ─── Vehicle silhouette (simple, abstract) ───────────────────────
function ChallengerSilhouette({ width = 220, color = "currentColor", accent = "var(--au7o-blue)" }) {
  return (
    <svg viewBox="0 0 320 100" width={width} height={width * 100/320} style={{ display:"block" }}>
      <ellipse cx="160" cy="92" rx="138" ry="3.5" fill="rgba(11,18,32,0.12)"/>
      <path
        d="M14,76 C18,66 30,62 50,60
           C58,46 80,38 116,36
           L160,30 C198,28 230,32 260,46
           L292,52 C302,54 308,58 308,68
           L308,80 C308,84 304,86 298,86
           L268,86
           A22,22 0 0 0 224,86
           L114,86
           A22,22 0 0 0 70,86
           L24,86 C16,86 12,82 12,80 Z"
        fill={color}
      />
      <path
        d="M112,40 L160,32 C190,30 216,34 234,42 L234,58 L108,58 Z"
        fill={accent} opacity="0.18"
      />
      <path d="M50,60 L108,56 L234,56 L292,60" stroke={color} strokeOpacity="0.4" strokeWidth="1" fill="none"/>
      <circle cx="92" cy="86" r="16" fill="#0B1220"/>
      <circle cx="92" cy="86" r="7" fill="#3a3f4d"/>
      <circle cx="246" cy="86" r="16" fill="#0B1220"/>
      <circle cx="246" cy="86" r="7" fill="#3a3f4d"/>
    </svg>
  );
}

// ─── Vehicle context bar (used at top of post-select screens) ────
function VehicleContextBar({ compact = false, onChange }) {
  const v = WEB_VEHICLE;
  return (
    <div style={{
      display:"flex", alignItems:"center", gap: 16,
      padding: compact ? "10px 14px" : "14px 18px",
      background:"#fff", border:"1px solid var(--paper-line)", borderRadius: 14,
    }}>
      <div style={{ width: 44, height: 28, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <ChallengerSilhouette width={44} color="#1a1a1a"/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, letterSpacing:"-0.01em" }}>
          {v.year} {v.make} {v.model} {v.trim}
        </div>
        <div style={{ fontSize: 11.5, color:"var(--slate-500)" }}>
          <span className="mono">{v.miles.toLocaleString()} mi</span> · {v.engine}
        </div>
      </div>
      <button onClick={onChange} style={{
        border:"1px solid var(--paper-line)", background:"#fff",
        padding: "6px 10px", borderRadius: 8, fontSize: 12, color:"var(--slate-500)",
        fontFamily:"var(--font-sans)", cursor:"pointer", display:"inline-flex", alignItems:"center", gap: 4,
      }}>
        <Icon name="swap" size={13}/> Switch
      </button>
    </div>
  );
}

// ─── Atmosphere — animated background blobs (premium feel) ───────
function AmbientBackground({ intensity = 1, theme = "paper" }) {
  // Soft, slow-moving radial gradients. Procedurally placed.
  return (
    <div style={{
      position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0,
    }}>
      <div style={{
        position:"absolute", left:"-10%", top:"-20%", width: 700, height: 700, borderRadius:"50%",
        background:"radial-gradient(circle, rgba(59,130,246,0.10), transparent 60%)",
        animation: "au7o-float-a 22s ease-in-out infinite",
      }}/>
      <div style={{
        position:"absolute", right:"-15%", top:"30%", width: 600, height: 600, borderRadius:"50%",
        background:"radial-gradient(circle, rgba(16,185,129,0.08), transparent 60%)",
        animation: "au7o-float-b 28s ease-in-out infinite",
      }}/>
      <div style={{
        position:"absolute", left:"30%", bottom:"-25%", width: 800, height: 800, borderRadius:"50%",
        background:"radial-gradient(circle, rgba(245,158,11,0.06), transparent 60%)",
        animation: "au7o-float-c 34s ease-in-out infinite",
      }}/>
    </div>
  );
}

Object.assign(window, {
  WEB_VEHICLE, HEALTH_SUMMARY, SUGGESTED_PROMPTS, RECENT_THREADS,
  Icon, Au7oMark, ChallengerSilhouette, VehicleContextBar, AmbientBackground,
});
