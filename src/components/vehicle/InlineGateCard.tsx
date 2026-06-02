'use client';

import Link from 'next/link';

export interface GateInfo {
  /** Server-provided headline message (e.g. "Sign up free to keep chatting…") */
  message: string;
  /** Where the primary action button takes the user — /auth/signup for anon, /account for authed-free */
  ctaUrl: string;
  /** Primary button label — "Sign up free" or "Subscribe" */
  ctaLabel: string;
  /** Optional secondary link (e.g. "Sign in" for anon users who already have an account) */
  secondaryCtaUrl?: string;
  secondaryCtaLabel?: string;
  /** Server-provided ISO string for when the quota resets — shown as small print */
  resetAt?: string;
  /** True when the gate is for an authed-free user (subscribe path) vs anon (signup path) — drives copy tone */
  isAuthed?: boolean;
}

/**
 * Inline card rendered inside the conversation stream when the server
 * returns 429 with `gated: true`. Replaces the assistant's empty
 * placeholder bubble so the user sees a clear sign-up / subscribe path
 * exactly where they expected an answer.
 *
 * Distinct from <UpgradePrompt> (modal, hardcoded copy) because:
 *  - This sits inline with the conversation, doesn't interrupt
 *  - Copy + CTAs come from the server response shape so the same
 *    component handles both anonymous (signup gate) and authed-free
 *    (subscribe gate) cases — no client-side branching needed
 */
export function InlineGateCard({ gate }: { gate: GateInfo }) {
  const resetText = gate.resetAt ? formatReset(gate.resetAt) : '';
  // Visual treatment shifts by gate type — signup gate is friendlier
  // (this is their first wall, we want them to convert), subscribe
  // gate is more premium (they've already invested by signing up).
  const isSignupGate = !gate.isAuthed && /sign.?up/i.test(gate.ctaLabel);
  return (
    <div className="gate-card">
      <div className="gate-icon" aria-hidden>
        {isSignupGate ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 14a5 5 0 0 0-6 0M9 9a3 3 0 1 0 6 0M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L4 7v6c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V7l-8-5z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <div className="gate-body">
        <p className="gate-message">{gate.message}</p>
        <div className="gate-actions">
          <Link href={gate.ctaUrl} className="gate-primary">
            {gate.ctaLabel}
          </Link>
          {gate.secondaryCtaUrl && gate.secondaryCtaLabel && (
            <Link href={gate.secondaryCtaUrl} className="gate-secondary">
              {gate.secondaryCtaLabel}
            </Link>
          )}
        </div>
        {resetText && (
          <p className="gate-reset" suppressHydrationWarning>
            Otherwise, the free limit resets {resetText}.
          </p>
        )}
      </div>

      <style jsx>{`
        .gate-card {
          display: flex;
          gap: 14px;
          align-items: flex-start;
          padding: 16px 18px;
          border-radius: 14px;
          border: 1px solid var(--paper-line, #E3DFD4);
          background: linear-gradient(135deg, #FAFBFF 0%, #F4F1FA 100%);
          margin-top: 4px;
        }
        .gate-icon {
          flex: 0 0 auto;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #3B82F6 0%, #6366F1 100%);
          color: #fff;
        }
        .gate-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 10px; }
        .gate-message {
          color: #0B1220;
          font-size: 14px;
          line-height: 1.45;
          margin: 0;
        }
        .gate-actions { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
        .gate-primary {
          display: inline-flex;
          align-items: center;
          padding: 9px 16px;
          border-radius: 999px;
          background: linear-gradient(135deg, #2563EB 0%, #4F46E5 100%);
          color: #fff;
          font-weight: 600;
          font-size: 13px;
          text-decoration: none;
          box-shadow: 0 1px 2px rgba(37,99,235,0.18);
        }
        .gate-primary:hover { filter: brightness(1.05); }
        .gate-secondary {
          display: inline-flex;
          align-items: center;
          padding: 8px 12px;
          border-radius: 999px;
          color: #4338CA;
          font-weight: 500;
          font-size: 13px;
          text-decoration: none;
          background: transparent;
        }
        .gate-secondary:hover { background: rgba(99,102,241,0.08); }
        .gate-reset { color: #64748B; font-size: 11.5px; margin: 0; }
      `}</style>
    </div>
  );
}

function formatReset(iso: string): string {
  try {
    const target = new Date(iso).getTime();
    const ms = target - Date.now();
    if (!Number.isFinite(ms) || ms <= 0) return 'shortly';
    const hours = Math.floor(ms / 3_600_000);
    if (hours < 1) return 'within the hour';
    if (hours < 24) return `in ~${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `in ~${days}d`;
    return new Date(iso).toLocaleDateString();
  } catch {
    return '';
  }
}
