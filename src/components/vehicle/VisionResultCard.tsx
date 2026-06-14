'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import type { IdentifiedPart, VendorLink, PartCategory } from '@/types/vision';

export interface VisionItem {
  name: string;
  spec?: string;
  brand?: string;
  partNumber?: string;
  amazonUrl: string | null;
}

export interface VisionRelatedIssue {
  id: string;
  title: string;
  severity: string;
}

export interface VisionResult {
  summary: string;
  confidence: number;
  isCarRelated: boolean;
  /** AI's verdict on whether the photo is from the user's currently-viewed
   *  vehicle. 'likely_mismatch' renders a prominent warning so users don't
   *  buy Camaro parts for a Challenger photo. */
  vehicleMatch?: 'confident' | 'uncertain' | 'likely_mismatch';
  /** What visual cue the AI used to reach the vehicleMatch verdict. */
  vehicleMatchNote?: string;
  primaryPart: VisionItem | null;
  kitItems: VisionItem[];
  consumables: VisionItem[];
  toolsNeeded: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTimeMinutes: number | null;
  warnings: string[];
  relatedIssues: VisionRelatedIssue[];
  /** Optional preview URL of the uploaded image, set client-side from the
   *  File object via URL.createObjectURL before the result returns. The
   *  server never echoes images back. */
  imagePreviewUrl?: string;

  // ─── v2 fields (multi-part + per-part vendor links) ───
  /** Schema version. v2 routes the render through VisionResultCardV2;
   *  v1 (undefined or 1) falls through to the legacy renderer. */
  schemaVersion?: 2;
  /** Flat array of every buyable part the model identified. v2 only. */
  identifiedParts?: IdentifiedPart[];
  /** Hero pointer — id of the most likely "this is what you came for"
   *  part. References an id present in identifiedParts. */
  primaryPartId?: string | null;
  /** Cal-AI-style urgency verdict — drives the traffic-light hero banner so
   *  a non-mechanic gets instant "what do I do" confidence. Optional: when
   *  the model doesn't supply it we derive a conservative signal client-side
   *  (and show nothing rather than guess "safe"). */
  urgency?: 'stop_driving' | 'fix_soon' | 'monitor';
  /** Which input flavor produced this — 'photo' or 'video'. v2 only. */
  mode?: 'photo' | 'video';
  /** Whisper transcript of the video's audio track. Empty for photos
   *  or videos where audio extraction failed. */
  transcript?: string;
  /** Number of frames the server analyzed. Video mode only. */
  framesAnalyzed?: number;
  /** Multi-photo (Pro): how many still photos were analyzed this diagnosis. */
  photosAnalyzed?: number;
  /** True when a non-Pro user sent multiple photos and the server used only
   *  the first — drives the "Pro uses every angle" upsell. */
  multiPhotoCapped?: boolean;
}

/**
 * Inline card rendered in the chat conversation when /api/vision
 * returns a successful analysis. Mirrors the MaintenanceSchedule /
 * MobileIssuesCard pattern — inline-styled so it works at any viewport.
 *
 * Layout:
 *   ┌─────────────────────────────────────────────────────────┐
 *   │ [preview]  ┌─ summary ────────────────────────────────┐ │
 *   │            │ "Driver-side projector headlight, cracked│ │
 *   │            │  lens — confidence 85%"                  │ │
 *   │            └──────────────────────────────────────────┘ │
 *   ├─────────────────────────────────────────────────────────┤
 *   │ MAIN PART                                               │
 *   │ Motorcraft FOAZ-13008-AA Headlight Assembly  [View on  │
 *   │ Driver-side LED projector                     Amazon]   │
 *   ├─────────────────────────────────────────────────────────┤
 *   │ YOU'LL ALSO NEED                                        │
 *   │ • T20 Torx retaining bolts (3)              [Amazon]    │
 *   │ • Headlight harness clip                    [Amazon]    │
 *   │ • Bulb anti-corrosion gel                   [Amazon]    │
 *   ├─────────────────────────────────────────────────────────┤
 *   │ TOOLS · Easy · 25 min                                   │
 *   │ T20 driver · trim removal tool                          │
 *   ├─────────────────────────────────────────────────────────┤
 *   │ RELATED KNOWN ISSUES                                    │
 *   │ → Headlight Moisture Intrusion on 2019-2024 (high)     │
 *   └─────────────────────────────────────────────────────────┘
 */
type Urgency = 'stop_driving' | 'fix_soon' | 'monitor';

/**
 * Conservative urgency derivation for the traffic-light hero. The model's
 * explicit `urgency` wins; otherwise we infer from safety-flavored warnings
 * and the severity of matched known issues. CRITICAL SAFETY RULE: never
 * fabricate a green "monitor / safe" verdict — if there's no real signal we
 * return null and render no banner, so we never tell someone an unsafe car
 * is fine. Green only ever comes from the model saying so explicitly.
 */
function deriveUrgency(vision: VisionResult): Urgency | null {
  if (vision.urgency) return vision.urgency;
  const warnings = vision.warnings || [];
  const hasSafetyWord = warnings.some((w) =>
    /stop driving|do not drive|don'?t drive|unsafe|pull over|blowout|loss of control|fire|brake fail|won'?t stop|steering|tire failure/i.test(w),
  );
  if (hasSafetyWord) return 'stop_driving';
  const sev = (vision.relatedIssues || []).map((i) => i.severity);
  if (sev.includes('critical')) return 'stop_driving';
  if (warnings.length > 0 || sev.includes('high')) return 'fix_soon';
  return null; // no signal → no banner (never guess "safe")
}

const URGENCY_UI: Record<Urgency, { icon: string; title: string; sub: string; cls: string }> = {
  stop_driving: {
    icon: '🛑',
    title: "Stop driving — get this looked at now",
    sub: 'This points to a safety-critical fault. Avoid driving until it’s checked.',
    cls: 'vr-urg-stop',
  },
  fix_soon: {
    icon: '⚠️',
    title: 'Fix this soon',
    sub: 'Safe to drive carefully short-term, but don’t let it sit — it gets worse (and pricier).',
    cls: 'vr-urg-soon',
  },
  monitor: {
    icon: '✅',
    title: 'Not urgent — keep an eye on it',
    sub: 'No immediate danger. Monitor it and address it at your next service.',
    cls: 'vr-urg-monitor',
  },
};

function UrgencyBanner({ vision }: { vision: VisionResult }) {
  const u = deriveUrgency(vision);
  if (!u) return null;
  const ui = URGENCY_UI[u];
  return (
    <div className={`vr-urg ${ui.cls}`} role="status">
      <span className="vr-urg-icon" aria-hidden>{ui.icon}</span>
      <div className="vr-urg-text">
        <div className="vr-urg-title">{ui.title}</div>
        <div className="vr-urg-sub">{ui.sub}</div>
      </div>
    </div>
  );
}

/** "You sent multiple angles but only the first was used — go Pro" upsell.
 *  Only renders for non-Pro users who actually sent extra photos. */
function MultiPhotoUpsell({ vision }: { vision: VisionResult }) {
  if (!vision.multiPhotoCapped) return null;
  return (
    <a href="/subscribe" className="vr-mpu">
      <span className="vr-mpu-icon" aria-hidden>📸</span>
      <span className="vr-mpu-text">
        We used your first photo. <strong>Au7o Pro</strong> analyzes every angle you add for a sharper diagnosis.
      </span>
      <span className="vr-mpu-cta" aria-hidden>Upgrade ▸</span>
    </a>
  );
}

const CONDITION_COLOR: Record<string, string> = { ok: '#10B981', warn: '#B45309', critical: '#DC2626', info: '#2563EB' };

/**
 * Annotated detection photo (au7oapp design, part B). Draws pulsing pins on
 * the user's actual photo at each part's model-estimated box, with a
 * tethered frosted callout for the active part + selectable chips. Renders
 * nothing unless the result carries an image preview AND at least one part
 * with a box — so callers can stack it above VisionResultCard and it simply
 * no-ops on older/box-less results. The model's boxes are approximate; this
 * is illustrative, not a precise bounding box.
 */
export function AnnotatedPhoto({ vision }: { vision: VisionResult }) {
  const pinned = (vision.identifiedParts || []).filter((p) => p.box && p.visibleInPhoto !== false);
  const [activeId, setActiveId] = useState<string | null>(pinned[0]?.id ?? null);
  if (!vision.imagePreviewUrl || pinned.length === 0) return null;
  const active = pinned.find((p) => p.id === activeId) || pinned[0];
  const pinX = active.box!.x + active.box!.w / 2;
  const pinY = active.box!.y + active.box!.h / 2;
  const cond = active.condition || 'info';

  return (
    <div className="ap-wrap">
      <style>{`
        @keyframes apRadar { 0%{transform:scale(1);opacity:.5} 70%{transform:scale(2.6);opacity:0} 100%{opacity:0} }
        .ap-photo { position:relative; background:#0B0E14; aspect-ratio:4/3; overflow:hidden; border-radius:14px 14px 0 0; }
        .ap-photo > img { display:block; width:100%; height:100%; object-fit:cover; }
        .ap-grad { position:absolute; inset:0; background:linear-gradient(180deg, rgba(11,14,20,0.30), transparent 26%, transparent 60%, rgba(11,14,20,0.55)); }
        .ap-badge { position:absolute; top:10px; left:10px; display:inline-flex; align-items:center; gap:6px; padding:5px 10px; background:rgba(11,18,32,0.62); backdrop-filter:blur(8px); border-radius:999px; border:1px solid rgba(255,255,255,0.12); font-size:10px; font-weight:600; color:#fff; letter-spacing:0.03em; }
        .ap-hs { position:absolute; transform:translate(-50%,-50%); cursor:pointer; border:none; background:transparent; padding:0; }
        .ap-hs .ring { position:absolute; inset:0; margin:auto; width:18px; height:18px; border-radius:50%; }
        .ap-hs .ring.r1 { animation: apRadar 2.4s ease-out infinite; }
        .ap-hs .ring.r2 { animation: apRadar 2.4s ease-out infinite 1.2s; }
        .ap-callout { position:absolute; left:10px; right:10px; bottom:10px; background:rgba(255,255,255,0.94); backdrop-filter:blur(14px); border:1px solid rgba(255,255,255,0.7); border-radius:12px; box-shadow:0 12px 32px rgba(11,18,32,0.4); padding:10px 12px; z-index:6; }
        .ap-chips { display:flex; gap:6px; overflow-x:auto; padding:10px 12px 2px; }
        .ap-chip { flex-shrink:0; display:inline-flex; align-items:center; gap:7px; padding:7px 12px; border-radius:999px; cursor:pointer; font-family:inherit; font-size:12px; font-weight:600; white-space:nowrap; }
      `}</style>
      <div className="ap-photo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={vision.imagePreviewUrl} alt="Your photo, annotated" />
        <div className="ap-grad" />
        <div className="ap-badge">
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3B82F6', display: 'inline-block' }} />
          AU7O DETECTED {pinned.length} {pinned.length === 1 ? 'PART' : 'PARTS'}
        </div>

        {/* tether from active pin to the callout */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 3 }}>
          <line x1={pinX} y1={pinY} x2={50} y2={88} stroke="#fff" strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeOpacity="0.55" strokeLinecap="round" />
        </svg>

        {pinned.map((p) => {
          const c = CONDITION_COLOR[p.condition || 'info'];
          const on = p.id === active.id;
          const cx = p.box!.x + p.box!.w / 2;
          const cy = p.box!.y + p.box!.h / 2;
          return (
            <button key={p.id} className="ap-hs" style={{ left: `${cx}%`, top: `${cy}%`, zIndex: on ? 5 : 4 }} onClick={() => setActiveId(p.id)} aria-label={p.name}>
              {on && <><span className="ring r1" style={{ background: c }} /><span className="ring r2" style={{ background: c }} /></>}
              <span style={{ position: 'relative', display: 'block', width: on ? 18 : 14, height: on ? 18 : 14, borderRadius: '50%', background: c, border: '2.5px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.45)' }} />
            </button>
          );
        })}

        {/* active callout */}
        <div className="ap-callout">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: CONDITION_COLOR[cond], marginTop: 4, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0B1220', lineHeight: 1.2 }}>
                {active.name}{active.position ? ` (${active.position})` : ''}
              </div>
              {active.finding && <div style={{ fontSize: 11, fontWeight: 600, color: CONDITION_COLOR[cond], marginTop: 2 }}>{active.finding}</div>}
              {active.oemPartNumbers[0] && (
                <div style={{ fontSize: 9.5, fontFamily: "'SF Mono', Menlo, monospace", color: '#64748B', marginTop: 3 }}>OEM {active.oemPartNumbers[0]}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* selectable chips */}
      <div className="ap-chips">
        {pinned.map((p) => {
          const on = p.id === active.id;
          return (
            <button key={p.id} className="ap-chip" onClick={() => setActiveId(p.id)}
              style={{ background: on ? '#0B1220' : '#fff', color: on ? '#fff' : '#475569', border: `1px solid ${on ? '#0B1220' : '#E3DFD4'}` }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: CONDITION_COLOR[p.condition || 'info'] }} />
              {p.name.split(' ').slice(0, 2).join(' ')}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function VisionResultCard({ vision }: { vision: VisionResult }) {
  // v2 fan-out — when the API returned the new multi-part shape,
  // hand off to VisionResultCardV2. Old saved responses + any
  // fallback path stay on the legacy renderer below.
  if (vision.schemaVersion === 2 && Array.isArray(vision.identifiedParts) && vision.identifiedParts.length > 0) {
    return <VisionResultCardV2 vision={vision} />;
  }

  if (!vision.isCarRelated) {
    return (
      <div className="vr-card vr-not-car">
        <div className="vr-not-car-icon" aria-hidden>🤔</div>
        <div>
          <div className="vr-not-car-title">Not sure that's a vehicle part</div>
          <div className="vr-not-car-body">
            {vision.summary || "I couldn't recognize a vehicle part in this photo. Try a closer shot in better light, or describe the issue in chat."}
          </div>
        </div>
        <style jsx>{cardStyles}</style>
      </div>
    );
  }

  const difficultyLabel = vision.difficulty === 'easy' ? 'Easy' : vision.difficulty === 'hard' ? 'Hard' : 'Medium';
  const confidencePct = Math.round((vision.confidence || 0) * 100);
  const isMismatch = vision.vehicleMatch === 'likely_mismatch';
  const isUncertain = vision.vehicleMatch === 'uncertain';

  return (
    <div className="vr-card">
      {/* Traffic-light urgency hero — the Cal-AI-style "what do I do now"
          signal. Suppressed on a likely vehicle mismatch (the whole verdict
          is suspect when the photo isn't even the right car). */}
      {!isMismatch && <UrgencyBanner vision={vision} />}
      <MultiPhotoUpsell vision={vision} />
      {/* Vehicle-match warning banner. Renders ABOVE everything else when
          the AI flagged the photo as likely from a different vehicle than
          the one the user is currently viewing. Without this, users buy
          Camaro parts based on a Challenger photo and the trust is gone. */}
      {isMismatch && (
        <div className="vr-mismatch">
          <div className="vr-mismatch-icon" aria-hidden>⚠️</div>
          <div className="vr-mismatch-body">
            <div className="vr-mismatch-title">This photo might not be from your vehicle</div>
            {vision.vehicleMatchNote && (
              <div className="vr-mismatch-note">What I saw: {vision.vehicleMatchNote}</div>
            )}
            <div className="vr-mismatch-cta">Switch to the correct vehicle before buying parts — fitment may be wrong.</div>
          </div>
        </div>
      )}
      <div className="vr-head">
        {vision.imagePreviewUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={vision.imagePreviewUrl} alt="Your photo" className="vr-preview" />
        )}
        <div className="vr-summary-block">
          <div className="vr-eyebrow">
            <span className="vr-dot" aria-hidden />
            AU7O VISION · {confidencePct}% CONFIDENT
          </div>
          <div className="vr-summary">{vision.summary}</div>
          {isUncertain && vision.vehicleMatchNote && (
            <div className="vr-uncertain">
              Confirm this is from your vehicle before ordering — {vision.vehicleMatchNote.toLowerCase()}.
            </div>
          )}
        </div>
      </div>

      {vision.primaryPart && (
        <div className="vr-section vr-primary">
          <div className="vr-section-label">MAIN PART</div>
          <PartLine item={vision.primaryPart} highlight />
        </div>
      )}

      {(vision.kitItems.length > 0 || vision.consumables.length > 0) && (
        <div className="vr-section">
          <div className="vr-section-label">YOU&apos;LL ALSO NEED</div>
          <ul className="vr-list">
            {vision.kitItems.map((it, i) => (
              <li key={`k-${i}`}><PartLine item={it} /></li>
            ))}
            {vision.consumables.map((it, i) => (
              <li key={`c-${i}`}><PartLine item={it} /></li>
            ))}
          </ul>
        </div>
      )}

      {(vision.toolsNeeded.length > 0 || vision.estimatedTimeMinutes != null) && (
        <div className="vr-meta-row">
          <span className="vr-difficulty">{difficultyLabel}</span>
          {vision.estimatedTimeMinutes != null && (
            <span className="vr-time">~{vision.estimatedTimeMinutes} min</span>
          )}
          {vision.toolsNeeded.length > 0 && (
            <span className="vr-tools">Tools: {vision.toolsNeeded.join(' · ')}</span>
          )}
        </div>
      )}

      {vision.warnings.length > 0 && (
        <div className="vr-warnings">
          {vision.warnings.map((w, i) => (
            <div key={i} className="vr-warning">⚠️ {w}</div>
          ))}
        </div>
      )}

      {vision.relatedIssues.length > 0 && (
        <div className="vr-section vr-related">
          <div className="vr-section-label">RELATED KNOWN ISSUES</div>
          <ul className="vr-list">
            {vision.relatedIssues.map((iss) => (
              <li key={iss.id}>
                <Link href={`#${iss.id}`} className="vr-related-link">
                  <span className={`vr-sev vr-sev-${iss.severity}`} />
                  <span>{iss.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="vr-disclaimer">
        AI-generated suggestions. Verify fitment by VIN or part number before purchase.
      </div>

      <style jsx>{cardStyles}</style>
    </div>
  );
}

function PartLine({ item, highlight = false }: { item: VisionItem; highlight?: boolean }) {
  const label = [item.brand, item.partNumber && `#${item.partNumber}`].filter(Boolean).join(' ');
  return (
    <div className={`vr-part ${highlight ? 'vr-part-highlight' : ''}`}>
      <div className="vr-part-info">
        <div className="vr-part-name">{item.name}</div>
        {(label || item.spec) && (
          <div className="vr-part-spec">{[label, item.spec].filter(Boolean).join(' · ')}</div>
        )}
      </div>
      {item.amazonUrl && (
        <a
          href={item.amazonUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className={`vr-buy ${highlight ? 'vr-buy-primary' : ''}`}
        >
          View on Amazon
        </a>
      )}
    </div>
  );
}

const cardStyles = `
  .vr-card {
    border: 1px solid var(--paper-line, #E3DFD4);
    border-radius: 14px;
    background: #fff;
    overflow: hidden;
    margin-top: 4px;
  }
  .vr-urg {
    display: flex; gap: 11px; align-items: flex-start;
    padding: 13px 16px; border-bottom: 1px solid transparent;
  }
  .vr-urg-icon { font-size: 22px; line-height: 1; flex: 0 0 auto; }
  .vr-urg-text { flex: 1; min-width: 0; }
  .vr-urg-title { font-size: 15px; font-weight: 700; line-height: 1.25; letter-spacing: -0.01em; }
  .vr-urg-sub { font-size: 12.5px; line-height: 1.4; margin-top: 3px; opacity: 0.9; }
  .vr-urg-stop { background: #FEF2F2; border-bottom-color: #FECACA; }
  .vr-urg-stop .vr-urg-title { color: #991B1B; }
  .vr-urg-stop .vr-urg-sub { color: #7F1D1D; }
  .vr-urg-soon { background: #FFFBEB; border-bottom-color: #FDE68A; }
  .vr-urg-soon .vr-urg-title { color: #92400E; }
  .vr-urg-soon .vr-urg-sub { color: #78350F; }
  .vr-urg-monitor { background: #F0FDF4; border-bottom-color: #BBF7D0; }
  .vr-urg-monitor .vr-urg-title { color: #166534; }
  .vr-urg-monitor .vr-urg-sub { color: #15803D; }
  .vr-mpu {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px; text-decoration: none;
    background: #EFF6FF; border-bottom: 1px solid #DBEAFE;
  }
  .vr-mpu-icon { font-size: 17px; flex: 0 0 auto; }
  .vr-mpu-text { flex: 1; min-width: 0; font-size: 12.5px; line-height: 1.4; color: #1E3A8A; }
  .vr-mpu-cta { flex: 0 0 auto; font-size: 12px; font-weight: 700; color: #1D4ED8; white-space: nowrap; }
  .vr-head {
    display: flex; gap: 12px; padding: 14px 16px;
    background: linear-gradient(135deg, #F4F7FF 0%, #FAFBFF 100%);
    border-bottom: 1px solid var(--paper-line, #E3DFD4);
  }
  .vr-preview {
    width: 64px; height: 64px; flex: 0 0 auto;
    border-radius: 10px; object-fit: cover;
    border: 1px solid #E3DFD4;
  }
  .vr-summary-block { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; }
  .vr-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    font-size: 10.5px; font-weight: 600; letter-spacing: 0.08em;
    text-transform: uppercase; color: #2563EB;
  }
  .vr-dot {
    width: 7px; height: 7px; border-radius: 50%; background: #2563EB;
    box-shadow: 0 0 0 0 rgba(37,99,235,0.6);
    animation: vr-pulse 2s ease-in-out infinite;
  }
  @keyframes vr-pulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(37,99,235,0.4); }
    50%     { box-shadow: 0 0 0 6px rgba(37,99,235,0); }
  }
  .vr-summary { color: #0B1220; font-size: 14px; line-height: 1.4; }
  .vr-uncertain {
    font-size: 12px; color: #92400E; font-style: italic;
    margin-top: 6px; line-height: 1.4;
  }
  .vr-mismatch {
    display: flex; gap: 10px; align-items: flex-start;
    padding: 12px 14px;
    background: #FEF2F2; border-bottom: 1px solid #FECACA;
  }
  .vr-mismatch-icon { font-size: 20px; flex: 0 0 auto; line-height: 1; }
  .vr-mismatch-body { flex: 1; min-width: 0; }
  .vr-mismatch-title { font-size: 13.5px; font-weight: 600; color: #991B1B; line-height: 1.3; }
  .vr-mismatch-note {
    font-size: 11.5px; color: #7F1D1D; margin-top: 4px;
    font-family: 'SF Mono', Menlo, monospace;
  }
  .vr-mismatch-cta {
    font-size: 12px; color: #7F1D1D; margin-top: 6px; line-height: 1.4;
  }
  .vr-section { padding: 12px 16px; border-bottom: 1px solid var(--paper-line, #E3DFD4); }
  .vr-section:last-of-type { border-bottom: 0; }
  .vr-section-label {
    font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;
    color: #64748B; margin-bottom: 8px;
  }
  .vr-primary { background: #FAFBFF; }
  .vr-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; }
  .vr-part {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 10px; border-radius: 8px; background: #FAFBFC;
  }
  .vr-part-highlight { background: #fff; border: 1px solid #E2E8F0; }
  .vr-part-info { flex: 1; min-width: 0; }
  .vr-part-name { font-size: 13.5px; color: #0B1220; font-weight: 500; }
  .vr-part-spec { font-size: 11.5px; color: #64748B; font-family: 'SF Mono', Menlo, monospace; }
  .vr-buy {
    display: inline-flex; align-items: center; padding: 6px 11px;
    border-radius: 6px; font-size: 12px; font-weight: 500;
    color: #0B1220; background: #fff; border: 1px solid #CBD5E1;
    text-decoration: none; white-space: nowrap; flex: 0 0 auto;
  }
  .vr-buy:hover { background: #F1F5F9; }
  .vr-buy-primary {
    background: #FFA500; border-color: #FF8C00; color: #fff;
  }
  .vr-buy-primary:hover { background: #FF9500; }
  .vr-meta-row {
    display: flex; flex-wrap: wrap; align-items: center; gap: 10px;
    padding: 10px 16px; background: #F8FAFC;
    font-size: 11.5px; color: #475569;
    border-bottom: 1px solid var(--paper-line, #E3DFD4);
  }
  .vr-difficulty {
    padding: 2px 8px; border-radius: 999px; font-weight: 600;
    background: #DBEAFE; color: #1E40AF; font-size: 10.5px; letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .vr-time { font-weight: 500; color: #0B1220; }
  .vr-tools { font-style: italic; }
  .vr-warnings { padding: 10px 16px; background: #FEF3C7; border-bottom: 1px solid #FDE68A; }
  .vr-warning { font-size: 12.5px; color: #78350F; line-height: 1.4; }
  .vr-warning + .vr-warning { margin-top: 4px; }
  .vr-related-link {
    display: inline-flex; align-items: center; gap: 8px;
    color: #2563EB; text-decoration: none; font-size: 13px;
  }
  .vr-related-link:hover { text-decoration: underline; }
  .vr-sev { width: 8px; height: 8px; border-radius: 50%; flex: 0 0 auto; }
  .vr-sev-critical, .vr-sev-high { background: #DC2626; }
  .vr-sev-medium { background: #F59E0B; }
  .vr-sev-low { background: #94A3B8; }
  .vr-disclaimer { padding: 8px 16px 12px; font-size: 11px; color: #94A3B8; font-style: italic; }
  .vr-not-car {
    display: flex; gap: 12px; align-items: flex-start;
    padding: 14px 16px;
  }
  .vr-not-car-icon { font-size: 22px; flex: 0 0 auto; }
  .vr-not-car-title { font-size: 13.5px; font-weight: 600; color: #0B1220; }
  .vr-not-car-body { font-size: 12.5px; color: #475569; line-height: 1.45; margin-top: 4px; }
`;

// ──────────────────────────────────────────────────────────────────
// VisionResultCard v2 — multi-part + per-part vendor links
// ──────────────────────────────────────────────────────────────────

const CATEGORY_ICONS: Partial<Record<PartCategory, string>> = {
  rotor: '🛑',
  brake_pad: '🅿️',
  caliper: '🛑',
  tire: '🛞',
  wheel: '⚙️',
  lug_nut: '🔩',
  tpms: '📡',
  filter: '🧰',
  fluid: '💧',
  wiper: '🌧️',
  bulb: '💡',
  battery: '🔋',
  spark_plug: '⚡',
  sensor: '📟',
  belt: '➰',
  hose: '🪢',
  suspension: '🪜',
  ignition: '🔑',
  fuel_pump: '⛽',
  alternator: '🔌',
  starter: '🔋',
  body_panel: '🚗',
  trim: '✨',
  badge: '🏷️',
  emblem: '🏷️',
  bracket: '🔧',
  interior: '🪑',
  accessory: '🎯',
  tool: '🛠️',
  oem_specific: '🏷️',
  other: '🔧',
};

function VisionResultCardV2({ vision }: { vision: VisionResult }) {
  const parts = vision.identifiedParts || [];
  const primaryId = vision.primaryPartId || (parts.find((p) => p.role === 'primary')?.id);
  const heroPart = parts.find((p) => p.id === primaryId) || parts[0] || null;
  const otherParts = parts.filter((p) => p.id !== heroPart?.id);
  const [expanded, setExpanded] = useState(otherParts.length <= 3);
  const isMismatch = vision.vehicleMatch === 'likely_mismatch';
  const isUncertain = vision.vehicleMatch === 'uncertain';
  const confidencePct = Math.round((vision.confidence || 0) * 100);
  const difficultyLabel = vision.difficulty === 'easy' ? 'Easy' : vision.difficulty === 'hard' ? 'Hard' : 'Medium';

  return (
    <div className="vr-card vr2-card">
      {!isMismatch && <UrgencyBanner vision={vision} />}
      <MultiPhotoUpsell vision={vision} />
      {isMismatch && (
        <div className="vr-mismatch">
          <div className="vr-mismatch-icon" aria-hidden>⚠️</div>
          <div className="vr-mismatch-body">
            <div className="vr-mismatch-title">This photo might not be from your vehicle</div>
            {vision.vehicleMatchNote && (
              <div className="vr-mismatch-note">What I saw: {vision.vehicleMatchNote}</div>
            )}
            <div className="vr-mismatch-cta">Switch to the correct vehicle before buying parts — fitment may be wrong.</div>
          </div>
        </div>
      )}

      <div className="vr-head">
        {vision.imagePreviewUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={vision.imagePreviewUrl} alt="Your photo" className="vr-preview" />
        )}
        <div className="vr-summary-block">
          <div className="vr-eyebrow">
            <span className="vr-dot" aria-hidden />
            {vision.mode === 'video' ? 'AU7O VIDEO' : 'AU7O VISION'} · {confidencePct}%
            {vision.mode === 'video' && vision.framesAnalyzed ? ` · ${vision.framesAnalyzed} FRAMES` : ''}
            {` · ${parts.length} ${parts.length === 1 ? 'PART' : 'PARTS'}`}
          </div>
          <div className="vr-summary">{vision.summary}</div>
          {vision.transcript && vision.transcript.trim().length > 0 && (
            <div className="vr2-transcript">
              <span className="vr2-transcript-icon" aria-hidden>🎤</span>
              <span className="vr2-transcript-label">You said:</span>
              <span className="vr2-transcript-text">&ldquo;{vision.transcript}&rdquo;</span>
            </div>
          )}
          {isUncertain && vision.vehicleMatchNote && (
            <div className="vr-uncertain">
              Confirm this is from your vehicle before ordering — {vision.vehicleMatchNote.toLowerCase()}.
            </div>
          )}
        </div>
      </div>

      {heroPart && (
        <div className="vr2-hero">
          <div className="vr-section-label">MAIN PART</div>
          <PartCardV2 part={heroPart} />
        </div>
      )}

      {otherParts.length > 0 && (
        <div className="vr2-others">
          <button
            type="button"
            className="vr2-others-toggle"
            onClick={() => setExpanded((e) => !e)}
            aria-expanded={expanded}
          >
            <span className="vr-section-label">
              {expanded ? "YOU'LL ALSO NEED" : `SHOW ${otherParts.length} MORE ${otherParts.length === 1 ? 'PART' : 'PARTS'}`}
            </span>
            <span className="vr2-others-chevron" aria-hidden>{expanded ? '▾' : '▸'}</span>
          </button>
          {expanded && (
            <div className="vr2-others-list">
              {otherParts.map((p) => <PartCardV2 key={p.id} part={p} compact />)}
            </div>
          )}
        </div>
      )}

      {(vision.toolsNeeded.length > 0 || vision.estimatedTimeMinutes != null) && (
        <div className="vr-meta-row">
          <span className="vr-difficulty">{difficultyLabel}</span>
          {vision.estimatedTimeMinutes != null && (
            <span className="vr-time">~{vision.estimatedTimeMinutes} min</span>
          )}
          {vision.toolsNeeded.length > 0 && (
            <span className="vr-tools">Tools: {vision.toolsNeeded.join(' · ')}</span>
          )}
        </div>
      )}

      {vision.warnings.length > 0 && (
        <div className="vr-warnings">
          {vision.warnings.map((w, i) => (
            <div key={i} className="vr-warning">⚠️ {w}</div>
          ))}
        </div>
      )}

      {vision.relatedIssues.length > 0 && (
        <div className="vr-section vr-related">
          <div className="vr-section-label">RELATED KNOWN ISSUES</div>
          <ul className="vr-list">
            {vision.relatedIssues.map((iss) => (
              <li key={iss.id}>
                <Link href={`#${iss.id}`} className="vr-related-link">
                  <span className={`vr-sev vr-sev-${iss.severity}`} />
                  <span>{iss.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="vr-disclaimer">
        AI-generated suggestions. Verify fitment by VIN or part number before purchase. Affiliate links may earn Au7o a commission.
      </div>

      <style jsx>{cardStyles}</style>
      {/* v2 styles (.vr2-*) live in src/app/globals.css — styled-jsx
          global wasn't reliably applying in the production bundle.
          Plain global CSS is bulletproof. */}
    </div>
  );
}

function PartCardV2({ part, compact = false }: { part: IdentifiedPart; compact?: boolean }) {
  const [copied, setCopied] = useState<string | null>(null);
  const icon = CATEGORY_ICONS[part.category] || '🔧';
  const primaryVendor = part.vendorLinks.find((v) => v.priority === 1) || part.vendorLinks[0];
  const secondaryVendors = part.vendorLinks.filter((v) => v !== primaryVendor).slice(0, 5);
  const confidencePct = Math.round((part.confidence || 0) * 100);

  const copyPart = useCallback((n: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(n).catch(() => { /* */ });
    }
    setCopied(n);
    setTimeout(() => setCopied(null), 1200);
  }, []);

  return (
    <div className={`vr2-part-card ${compact ? 'vr2-part-compact' : ''}`} data-role={part.role}>
      <div className="vr2-part-head">
        <div className="vr2-part-icon" aria-hidden>{icon}</div>
        <div className="vr2-part-meta">
          <div className="vr2-part-name">
            {part.name}
            {part.position && <span className="vr2-part-pos"> ({part.position})</span>}
          </div>
          {(part.brand || part.spec) && (
            <div className="vr2-part-line">
              {[part.brand, part.spec].filter(Boolean).join(' · ')}
            </div>
          )}
          {part.oemPartNumbers.length > 0 && (
            <div className="vr2-part-oem">
              <span className="vr2-oem-label">OEM:</span>
              {part.oemPartNumbers.map((n, i) => (
                <button
                  key={i}
                  type="button"
                  className="vr2-oem-num"
                  onClick={() => copyPart(n)}
                  title="Copy part number"
                >
                  {n}{copied === n ? ' ✓' : ''}
                </button>
              ))}
            </div>
          )}
          {part.aftermarketPartNumbers && part.aftermarketPartNumbers.length > 0 && (
            <div className="vr2-part-cross">
              Cross: {part.aftermarketPartNumbers.map((x) => `${x.brand} ${x.partNumber}`).join(' · ')}
            </div>
          )}
          {part.notes && <div className="vr2-part-notes">{part.notes}</div>}
          {confidencePct < 70 && (
            <div className="vr2-part-conf">Lower confidence ({confidencePct}%) — verify before ordering</div>
          )}
        </div>
      </div>

      {primaryVendor && (
        <a
          href={primaryVendor.url}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="vr2-vendor-primary"
        >
          Shop at {primaryVendor.displayName}
          <span aria-hidden>▸</span>
        </a>
      )}

      {secondaryVendors.length > 0 && (
        <div className="vr2-vendor-grid">
          {secondaryVendors.map((v) => (
            <VendorButtonV2 key={v.vendor} link={v} />
          ))}
        </div>
      )}
    </div>
  );
}

function VendorButtonV2({ link }: { link: VendorLink }) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="vr2-vendor-btn"
      title={link.rationale || link.displayName}
    >
      <span>{link.displayName}</span>
      <span aria-hidden>▸</span>
    </a>
  );
}


