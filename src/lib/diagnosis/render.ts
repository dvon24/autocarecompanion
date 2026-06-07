/**
 * Helpers for turning a /api/vision result into the seeded chat history
 * the user lands in after the diagnose-to-chat handoff. Used by
 * /api/diagnose/seed when it creates a ChatSession from an anonymous
 * diagnosis result.
 *
 * Why these are pure functions: the seeded messages must be
 * deterministic so the user sees the same thing whether they refresh
 * the hub once or twice, and so subsequent /api/hub-chat turns can
 * reason over a stable history.
 */

import type { VisionResult } from '@/components/vehicle/VisionResultCard';

interface YMMT {
  year: number;
  make: string;
  model: string;
  trim?: string | null;
}

/**
 * The user-side seed message. Mirrors what the user "would have said"
 * if they'd typed into chat instead of uploading on /diagnose. Prefers
 * their caption when they supplied one, falls back to a generic phrasing
 * grounded in the part the vision call identified.
 */
export function synthesizeUserPromptFromCaption(
  vision: VisionResult,
  ymmt: YMMT,
  caption?: string | null,
): string {
  const trimmed = (caption ?? '').trim();
  if (trimmed) return trimmed;

  const primary = pickPrimaryPart(vision);
  const vehicleDesc = `${ymmt.year} ${ymmt.make} ${ymmt.model}${ymmt.trim ? ' ' + ymmt.trim : ''}`;
  if (primary) {
    return `I uploaded a photo of my ${vehicleDesc} — looks like ${primary.toLowerCase()}. What am I dealing with?`;
  }
  return `I uploaded a photo of something on my ${vehicleDesc}. What is this and what should I do about it?`;
}

/**
 * Assistant-side seed message. Writes a concise markdown summary that
 * reads like a chat reply: 1-line headline, identified part(s), and a
 * short "next steps" tail. Detailed multi-vendor links + identified
 * parts cards are still rendered by VisionResultCard via the `vision`
 * attachment on the same Message; this text gives the bubble a body so
 * it doesn't read as an empty card.
 */
export function renderDiagnosisAsMarkdown(vision: VisionResult, ymmt: YMMT): string {
  const lines: string[] = [];

  const summary = (vision.summary ?? '').trim();
  if (summary) {
    lines.push(summary);
  } else {
    lines.push(
      `Here's what I see in your photo of the ${ymmt.year} ${ymmt.make} ${ymmt.model}${ymmt.trim ? ' ' + ymmt.trim : ''}.`
    );
  }

  const parts = (vision.identifiedParts ?? []).filter((p) => p && p.name);
  if (parts.length > 0) {
    lines.push('');
    lines.push('**What I spotted:**');
    for (const p of parts.slice(0, 5)) {
      const conf = typeof p.confidence === 'number' ? ` · ${Math.round(p.confidence * 100)}%` : '';
      const pos = p.position ? ` (${p.position})` : '';
      lines.push(`- ${p.name}${pos}${conf}`);
    }
    if (parts.length > 5) {
      lines.push(`- …and ${parts.length - 5} more in the card below`);
    }
  }

  if (vision.warnings && vision.warnings.length > 0) {
    lines.push('');
    lines.push('**Heads up:** ' + vision.warnings.slice(0, 2).join(' '));
  }

  lines.push('');
  lines.push(
    'Ask me anything about the fix — part numbers, torque specs, whether to DIY or take it to a shop, or how this lines up with known issues for your trim.'
  );

  return lines.join('\n');
}

function pickPrimaryPart(vision: VisionResult): string | null {
  const parts = vision.identifiedParts ?? [];
  if (parts.length === 0) return null;
  // Trust the primaryPartId pointer when set, fall back to the
  // first listed part otherwise.
  if (vision.primaryPartId) {
    const hit = parts.find((p) => p.id === vision.primaryPartId);
    if (hit?.name) return hit.name;
  }
  return parts[0]?.name ?? null;
}
