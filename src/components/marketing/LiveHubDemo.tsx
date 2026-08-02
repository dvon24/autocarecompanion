/**
 * LiveHubDemo — the Vehicle Twin, shown as one thing you can click.
 *
 * This used to be a framed browser window that auto-rotated through four
 * capability slides (loaded hub, photo/video diagnosis, live recalls,
 * car-aware Drive), wrapped in window chrome with a maintenance schedule, a
 * known-issues list and a chat composer.
 *
 * All of it is gone. It is shown to someone mid-article who gave us a few
 * seconds at most, and four arguments in that window is zero arguments. What
 * is left is the car with its hotspots and one place to tap.
 *
 * The car pictured is our demo Challenger, and on known-issues articles this
 * component is handed THAT page's vehicle — so the badge says "demo car"
 * outright rather than letting a CR-V reader think it is theirs.
 *
 * Self-contained (no design-system deps) so it drops into any page.
 */

const LINE = '#E3DFD4';

/* Marker positions mirror TH_HOTSPOTS on the real stage. Copied rather than
   imported: importing from TwinStage would pull the whole 75KB tech tree into
   every page that renders this promo. Decorative — the card is one link. */
/* The stage's status triad, kept identical here so the promo and the real thing
   speak the same visual language:
     alert (red)   = overdue on mileage
     shield (violet) = known issue on record, fix available
     check (green) = on track                                                */
const DOT = {
  alert: { edge: '#FF6B63', fill: 'rgba(255,107,99,.16)', glow: 'rgba(255,107,99,.7)', ink: '#FFD9D6' },
  shield: { edge: '#A78BFA', fill: 'rgba(139,92,246,.2)', glow: 'rgba(139,92,246,.7)', ink: '#EDE4FF' },
  check: { edge: '#35D69B', fill: 'rgba(53,214,155,.16)', glow: 'rgba(53,214,155,.6)', ink: '#D8FFF0' },
} as const;

function DotIcon({ kind, color }: { kind: keyof typeof DOT; color: string }) {
  const common = {
    width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: color,
    strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true,
  };
  if (kind === 'check') return <svg {...common} strokeWidth={2.6}><path d="M20 6L9 17l-5-5" /></svg>;
  if (kind === 'shield') {
    return (
      <svg {...common} strokeWidth={2}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        <path d="M12 8v4M12 16h.01" />
      </svg>
    );
  }
  return (
    <svg {...common} strokeWidth={2}>
      <path d="M12 9v4M12 17h.01" />
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
    </svg>
  );
}

const TWIN_HOTSPOTS = [
  { id: 'wheel', label: 'Wheel, Tire & Brakes', x: 39.6, y: 65.5, kind: 'alert' as const, glow: 'car-wheel-highlight-glow' },
  { id: 'hood', label: 'Engine', x: 61, y: 42, kind: 'alert' as const, glow: 'car-hood-highlight-glow' },
  // No glow art for the windshield — the real stage doesn't light it either.
  { id: 'glass', label: 'Windshield Wipers', x: 44, y: 29, kind: 'alert' as const, glow: null },
  { id: 'rearwheel', label: 'Rear Wheel & Tire', x: 20.5, y: 52.5, kind: 'alert' as const, glow: 'car-rear-wheel-highlight-glow' },
  // The radiator is the one with a documented issue AND an upgrade on record.
  { id: 'rad', label: 'Radiator & Coolant', x: 67, y: 58.5, kind: 'shield' as const, glow: 'car-radiator-highlight-glow' },
  { id: 'airbox', label: 'Engine Air Filter', x: 78.5, y: 42.5, kind: 'alert' as const, glow: 'car-airbox-highlight-glow' },
];

export function LiveHubDemo({ vehicleName }: { vehicleName?: string; mileage?: string }) {
  return (
    /* NOT one big link: each marker is its own link so a reader can click the
       part they actually came here about, and land in that tech tree. Wrapping
       all of it in an outer <a> would make nested anchors, which is invalid. */
    <div
      style={{
        display: 'block',
        width: '100%',
        maxWidth: 460,
        borderRadius: 18,
        overflow: 'hidden',
        background: '#0A0D14',
        border: `1px solid ${LINE}`,
        boxShadow: '0 40px 90px rgba(0,0,0,0.45)',
      }}
    >
      <style>{`
        @keyframes au7oDemoPulse { 0%,100% { opacity: 1 } 50% { opacity: 0.35 } }
        .au7o-demo-pulse { animation: au7oDemoPulse 1.8s ease-in-out infinite; }
        /* Label + part glow on hover/focus, CSS only so this stays a server
           component. The glow layers sit AFTER the markers in the DOM purely so
           the general-sibling selector can reach them; z-index puts them back
           underneath. Same micro-interaction as the real stage. */
        .au7o-hot { text-decoration: none; }
        .au7o-hot .au7o-hot-label {
          opacity: 0; transform: translate(-50%, 4px);
          transition: opacity .18s ease, transform .18s ease;
          pointer-events: none;
        }
        .au7o-hot:hover .au7o-hot-label,
        .au7o-hot:focus-visible .au7o-hot-label { opacity: 1; transform: translate(-50%, 0); }
        .au7o-hot-dot { transition: transform .18s ease; }
        .au7o-hot:hover .au7o-hot-dot,
        .au7o-hot:focus-visible .au7o-hot-dot { transform: scale(1.16); }
        .au7o-glow {
          opacity: 0; transition: opacity .28s ease;
          position: absolute; inset: 0; width: 100%; height: 100%;
          object-fit: cover; pointer-events: none; z-index: 1;
        }
        ${TWIN_HOTSPOTS.filter((h) => h.glow)
          .map((h) => `.au7o-hot-${h.id}:hover ~ .au7o-glow-${h.id}, .au7o-hot-${h.id}:focus-visible ~ .au7o-glow-${h.id} { opacity: 1; }`)
          .join('\n        ')}
        @media (prefers-reduced-motion: reduce) {
          .au7o-demo-pulse { animation: none; }
          .au7o-hot-dot { transition: none; }
        }
      `}</style>

      <div style={{ position: 'relative' }}>
        <img
          src="/twin-stage/car-base.webp"
          alt="Au7o tech tree demo — 2015 Dodge Challenger SRT 392"
          loading="lazy"
          style={{ display: 'block', width: '100%', aspectRatio: '16 / 9', objectFit: 'cover' }}
        />

        {TWIN_HOTSPOTS.map((h, i) => {
          const c = DOT[h.kind];
          const above = h.y > 55;
          return (
            <a
              key={h.id}
              className={`au7o-hot au7o-hot-${h.id}`}
              href={`/demo/hub?open=${h.id}`}
              aria-label={`${h.label} — open its tech tree`}
              style={{ position: 'absolute', left: `${h.x}%`, top: `${h.y}%`, transform: 'translate(-50%,-50%)', zIndex: 3 }}
            >
              <span
                className="au7o-hot-dot au7o-demo-pulse"
                style={{
                  display: 'grid',
                  placeItems: 'center',
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  border: `2px solid ${c.edge}`,
                  background: c.fill,
                  boxShadow: `0 0 16px ${c.glow}`,
                  animationDelay: `${i * 0.22}s`,
                }}
              >
                <DotIcon kind={h.kind} color={c.ink} />
              </span>
              <span
                className="au7o-hot-label"
                style={{
                  position: 'absolute',
                  left: '50%',
                  ...(above ? { bottom: '100%', marginBottom: 8 } : { top: '100%', marginTop: 8 }),
                  whiteSpace: 'nowrap',
                  background: 'rgba(10,13,20,.92)',
                  border: `1px solid ${c.edge}55`,
                  borderRadius: 8,
                  padding: '5px 9px',
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#fff',
                }}
              >
                {h.label}
              </span>
            </a>
          );
        })}

        {/* Per-part glow overlays. They must come AFTER the markers in the DOM
            for `.au7o-hot-x:hover ~ .au7o-glow-x` to reach them; z-index puts
            them back beneath. Promo-sized copies (512px, 171KB for all five)
            rather than the stage's full-res set, which is 1.2MB — too much
            weight for a hover effect on our highest-traffic pages. */}
        {TWIN_HOTSPOTS.filter((h) => h.glow).map((h) => (
          <img
            key={h.glow}
            className={`au7o-glow au7o-glow-${h.id}`}
            src={`/twin-stage/promo/${h.glow}.webp`}
            alt=""
            aria-hidden
            loading="lazy"
          />
        ))}

        <div style={{ position: 'absolute', left: 12, bottom: 10, zIndex: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="au7o-demo-pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: '#4CC9F0' }} />
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(255,255,255,.85)' }}>
            DEMO CAR · YOUR HUB SHOWS YOUR VEHICLE
          </span>
        </div>
      </div>

      {/* The CTA goes to the HOMEPAGE, not /demo/hub: the homepage hero has the
          same car AND the reservation form, so it can capture. The hub is a
          dead end for conversion. The individual markers still deep-link into
          the hub, for people who want the specific part. */}
      <a
        href="/"
        style={{ textDecoration: 'none', color: 'inherit', padding: '14px 16px 16px', display: 'flex', alignItems: 'center', gap: 12 }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', letterSpacing: '-0.01em' }}>
            Tap any part, see what fails
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', marginTop: 3, lineHeight: 1.45 }}>
            Every component underneath it, what it costs, and which one is documented to fail
            {vehicleName ? ' — yours gets mapped the same way' : ''}. No account.
          </div>
        </div>
        <span
          style={{
            flexShrink: 0,
            fontSize: 13,
            fontWeight: 600,
            color: '#fff',
            background: '#3B82F6',
            borderRadius: 11,
            padding: '10px 16px',
            whiteSpace: 'nowrap',
          }}
        >
          Try it →
        </span>
      </a>
    </div>
  );
}
