/**
 * Should this issue offer a "find a dealer near me" referral?
 *
 * True when the fix is dealer work rather than something the owner buys and
 * installs: an open recall (repaired free, and selling them the part instead is
 * actively harmful), or a solution that explicitly routes them to a dealer.
 *
 * WHY A TEXT TEST AND NOT JUST THE FLAG. The `recallFirst` part flag is the
 * precise signal, but it is set on only 6 of 8,158 published issues, so gating
 * on it alone makes the referral invisible. Measured against the live corpus
 * 2026-08-22:
 *
 *   recallFirst flag only ....................    6
 *   + strong recall wording ..................  439
 *   + explicit dealer-visit wording ..........  101   (516 combined)
 *   bare /nhtsa/ mention ..................... (868)  REJECTED — see below
 *
 * A bare "NHTSA" mention is NOT a signal: NHTSA is cited as a source on
 * hundreds of issues whose fix is an ordinary DIY part, and matching it would
 * push owners toward a dealer for a job they could do themselves. The patterns
 * below deliberately require recall language or an explicit dealer instruction.
 *
 * The flag remains the authority — the text test is the interim widener until
 * `recallFirst` is backfilled properly across the corpus.
 */

const RECALL_LANGUAGE =
  /\b(open recall|recall repair|under recall|covered by (an? )?recall|check your vin|vin (check|lookup)|recall campaign)\b/i;

const DEALER_INSTRUCTION =
  /\b(see (a|your) dealer|visit (a|your) dealer|authorized dealer|dealer will (perform|replace|reprogram|inspect)|dealership)\b/i;

export interface DealerReferralInput {
  title?: string | null;
  solution?: string | null;
  fixParts?: unknown;
}

export function needsDealerReferral(issue: DealerReferralInput): boolean {
  const parts = Array.isArray(issue.fixParts) ? (issue.fixParts as Array<{ recallFirst?: boolean }>) : [];
  if (parts.some((part) => part?.recallFirst === true)) return true;

  const text = `${issue.title || ''} ${issue.solution || ''}`;
  return RECALL_LANGUAGE.test(text) || DEALER_INSTRUCTION.test(text);
}
