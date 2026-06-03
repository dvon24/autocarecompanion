'use client';

import Link from 'next/link';

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

  return (
    <div className="vr-card">
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
