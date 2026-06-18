'use client';

import { useState } from 'react';
import { trackEvent } from '@/components/analytics/GoogleAnalytics';

/**
 * Low-friction soft-conversion for the known-issues pages: an EMAIL-ONLY
 * "alert me about new issues for THIS vehicle" capture. No account, no photo —
 * the 99% of "my [car] is doing X" Googlers who won't sign up or run a
 * diagnosis on a first visit will leave an email for something genuinely
 * valuable (a recall/issue alert for the exact car they're worried about).
 *
 * Posts {email, context:"known-issues:<slug>"} to /api/interest (which writes
 * an InterestEmail row — a remarketable lead tied to the vehicle). This is the
 * on-site conversion stage that was ~0% (Clarity: 2 logins / 260 sessions).
 */
export function KnownIssueAlertSignup({
  vehicleName,
  context,
  headline,
  blurb,
}: {
  /** Used in the success line ("new <vehicleName> findings"). For non-vehicle
   *  pages pass the subject (e.g. a make "Toyota" or a code "P0420"). */
  vehicleName: string;
  context: string;
  /** Override the headline (defaults to vehicle framing). */
  headline?: string;
  /** Override the supporting line. */
  blurb?: string;
}) {
  const heading = headline ?? `Stay ahead of ${vehicleName} problems`;
  const sub = blurb ?? `Get a free email the moment we add a new recall or known issue for your ${vehicleName}. No account needed.`;
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@') || email.length > 320) {
      setState('error');
      return;
    }
    setState('loading');
    try {
      const res = await fetch('/api/interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), context }),
      });
      if (res.ok) {
        setState('done');
        try { trackEvent('lead_capture', { context }); } catch { /* analytics best-effort */ }
      } else {
        setState('error');
      }
    } catch {
      setState('error');
    }
  };

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #E3DFD4',
        borderRadius: 16,
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <span
          aria-hidden
          style={{ flexShrink: 0, width: 40, height: 40, borderRadius: 11, background: '#EFF5FF', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </span>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 15.5, fontWeight: 700, color: '#0B1220', letterSpacing: '-0.01em' }}>
            {heading}
          </div>
          <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, marginTop: 2 }}>
            {sub}
          </div>
        </div>
      </div>

      {state === 'done' ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px', borderRadius: 11, background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', fontSize: 13.5, fontWeight: 600 }}>
          <span aria-hidden>✓</span> You&apos;re on the list — we&apos;ll email you about new {vehicleName} findings.
        </div>
      ) : (
        <form onSubmit={submit} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (state === 'error') setState('idle'); }}
            disabled={state === 'loading'}
            style={{ flex: '1 1 200px', minWidth: 0, padding: '11px 14px', borderRadius: 11, border: '1px solid #E3DFD4', fontSize: 14, color: '#0B1220', background: '#FBFAF7', outline: 'none' }}
          />
          <button
            type="submit"
            disabled={state === 'loading'}
            style={{ flexShrink: 0, padding: '11px 18px', borderRadius: 11, border: 'none', background: '#3B82F6', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          >
            {state === 'loading' ? '…' : 'Notify me'}
          </button>
        </form>
      )}
      {state === 'error' && (
        <div style={{ fontSize: 12.5, color: '#B91C1C' }}>Enter a valid email and try again.</div>
      )}
    </div>
  );
}
