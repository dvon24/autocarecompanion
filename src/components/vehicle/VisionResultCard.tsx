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
  /** Which input flavor produced this — 'photo' or 'video'. v2 only. */
  mode?: 'photo' | 'video';
  /** Whisper transcript of the video's audio track. Empty for photos
   *  or videos where audio extraction failed. */
  transcript?: string;
  /** Number of frames the server analyzed. Video mode only. */
  framesAnalyzed?: number;
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
      {/* `global` is load-bearing — the .vr2-* selectors target elements
          rendered by PartCardV2 + VendorButtonV2 (child components).
          Without global, styled-jsx adds a scope hash className only to
          elements in THIS component's render tree, so the child <a>s
          never match .vr2-vendor-btn.jsx-<hash> and the buttons fall
          back to default <a> styling (= inline text). Confirmed via
          workflow ws21h7jc2. */}
      <style jsx global>{v2Styles}</style>
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

const v2Styles = `
  .vr2-card { /* additional v2-specific overrides if needed */ }
  .vr2-transcript {
    display: flex; align-items: flex-start; gap: 6px;
    margin-top: 6px; padding: 6px 8px;
    background: rgba(37,99,235,0.08); border-left: 2px solid #2563EB;
    border-radius: 4px;
    font-size: 12px; line-height: 1.4; color: #1E40AF;
  }
  .vr2-transcript-icon { flex: 0 0 auto; font-size: 12px; line-height: 1.4; }
  .vr2-transcript-label { font-weight: 600; flex: 0 0 auto; }
  .vr2-transcript-text { font-style: italic; }
  .vr2-hero { padding: 12px 16px; background: #FAFBFF; border-bottom: 1px solid var(--paper-line, #E3DFD4); }
  .vr2-others { border-bottom: 1px solid var(--paper-line, #E3DFD4); }
  .vr2-others-toggle {
    width: 100%; background: transparent; border: 0; padding: 12px 16px;
    display: flex; align-items: center; justify-content: space-between;
    cursor: pointer; text-align: left;
  }
  .vr2-others-toggle:hover { background: #F8FAFC; }
  .vr2-others-chevron { color: #94A3B8; font-size: 12px; }
  .vr2-others-list { padding: 0 16px 12px; display: flex; flex-direction: column; gap: 10px; }

  .vr2-part-card {
    border: 1px solid #E2E8F0; border-radius: 10px; padding: 12px;
    background: #fff; display: flex; flex-direction: column; gap: 10px;
  }
  .vr2-part-card[data-role="consumable"] { background: #F8FAFC; }
  .vr2-part-card[data-role="fastener"] { background: #FAFAFA; }
  .vr2-part-compact { padding: 10px; }

  .vr2-part-head { display: flex; gap: 10px; align-items: flex-start; }
  .vr2-part-icon {
    font-size: 22px; line-height: 1; flex: 0 0 auto;
    width: 36px; height: 36px; border-radius: 8px;
    background: #F1F5F9; display: flex; align-items: center; justify-content: center;
  }
  .vr2-part-meta { flex: 1; min-width: 0; }
  .vr2-part-name {
    font-size: 14px; font-weight: 600; color: #0B1220; line-height: 1.3;
  }
  .vr2-part-pos { color: #64748B; font-weight: 400; font-size: 12.5px; }
  .vr2-part-line {
    font-size: 12px; color: #475569; margin-top: 2px; line-height: 1.4;
  }
  .vr2-part-oem {
    margin-top: 6px; display: flex; flex-wrap: wrap; gap: 6px; align-items: center;
    font-size: 11.5px;
  }
  .vr2-oem-label {
    color: #64748B; font-weight: 600; text-transform: uppercase;
    letter-spacing: 0.04em; font-size: 10px;
  }
  .vr2-oem-num {
    background: #0B1220; color: #fff; border: 0;
    font-family: 'SF Mono', Menlo, monospace;
    padding: 2px 8px; border-radius: 4px; font-size: 11px;
    cursor: pointer; line-height: 1.4;
  }
  .vr2-oem-num:hover { background: #1E293B; }
  .vr2-part-cross {
    font-size: 11px; color: #64748B; margin-top: 4px;
    font-family: 'SF Mono', Menlo, monospace; line-height: 1.4;
  }
  .vr2-part-notes {
    font-size: 11.5px; color: #475569; margin-top: 6px; line-height: 1.4;
    font-style: italic;
  }
  .vr2-part-conf {
    font-size: 11px; color: #92400E; margin-top: 4px;
    background: #FEF3C7; padding: 4px 6px; border-radius: 4px;
    display: inline-block;
  }

  .vr2-vendor-primary {
    display: flex; align-items: center; justify-content: space-between;
    background: #FFA500; color: #fff; border: 1px solid #FF8C00;
    padding: 12px 14px; border-radius: 8px;
    font-size: 13.5px; font-weight: 600;
    text-decoration: none; min-height: 44px;
  }
  .vr2-vendor-primary:hover { background: #FF9500; }
  .vr2-vendor-primary span:last-child { font-size: 12px; opacity: 0.9; }

  .vr2-vendor-grid {
    display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px;
  }
  .vr2-vendor-btn {
    display: flex; align-items: center; justify-content: space-between;
    background: #fff; color: #0B1220; border: 1px solid #CBD5E1;
    padding: 9px 11px; border-radius: 7px;
    font-size: 12px; font-weight: 500;
    text-decoration: none; min-height: 40px;
  }
  .vr2-vendor-btn:hover { background: #F1F5F9; }
  .vr2-vendor-btn span:last-child { color: #64748B; font-size: 11px; }

  @media (max-width: 380px) {
    .vr2-vendor-grid { grid-template-columns: 1fr; }
  }
`;

