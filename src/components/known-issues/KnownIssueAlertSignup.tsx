'use client';

import { useState } from 'react';
import { trackEvent } from '@/components/analytics/GoogleAnalytics';
import { AuthValueCarousel } from '@/components/auth/AuthValueCarousel';

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
  onDone,
  showCarousel = true,
}: {
  /** Used in the success line ("new <vehicleName> findings"). For non-vehicle
   *  pages pass the subject (e.g. a make "Toyota" or a code "P0420"). */
  vehicleName: string;
  context: string;
  /** Override the headline (defaults to vehicle framing). */
  headline?: string;
  /** Override the supporting line. */
  blurb?: string;
  /** Called after a successful capture (the popup uses it to auto-close). */
  onDone?: () => void;
  /** Show the value carousel above the CTAs (inline yes; popup no). */
  showCarousel?: boolean;
}) {
  const heading = headline ?? `Get ahead of ${vehicleName} problems — free`;
  const sub = blurb ?? `Leave your email and we'll alert you the moment there's a new recall or known issue for your ${vehicleName}. Free, no account needed.`;
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  // The server can now reject for a specific, fixable reason ("that domain does
  // not exist"). A typo'd address is the common case, so showing the actual
  // reason recovers a lead that a generic error would have lost.
  const [errorMsg, setErrorMsg] = useState('');
  // Honeypot: hidden from humans, filled by bots. Never populated by a person.
  const [company, setCompany] = useState('');
  // Post-signup feedback box (shown on the confirmation): "help us make the site better".
  const [fb, setFb] = useState('');
  const [fbState, setFbState] = useState<'idle' | 'sending' | 'sent'>('idle');

  const submitFeedback = async () => {
    const msg = fb.trim();
    if (!msg) return;
    setFbState('sending');
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'general', message: msg, email: email.trim() || undefined }),
      });
      setFbState('sent');
      try { trackEvent('feedback_submit', { context }); } catch { /* analytics best-effort */ }
    } catch {
      setFbState('idle'); // fail-soft: let them retry, never block
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@') || email.length > 320) {
      setErrorMsg('Enter a valid email and try again.');
      setState('error');
      return;
    }
    setState('loading');
    try {
      const res = await fetch('/api/interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), context, company }),
      });
      if (res.ok) {
        setState('done');
        try { localStorage.setItem('au7o.alertCapture.v2', 'done'); } catch { /* private mode */ }
        try { trackEvent('lead_capture', { context }); } catch { /* analytics best-effort */ }
        onDone?.();
      } else {
        const body = await res.json().catch(() => null);
        setErrorMsg(
          res.status === 429
            ? 'Too many attempts — try again in a little while.'
            : (body?.error as string) || 'Enter a valid email and try again.',
        );
        setState('error');
      }
    } catch {
      setErrorMsg('Something went wrong on our end — please try again.');
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
      {showCarousel && state !== 'done' && <AuthValueCarousel />}

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '12px 14px', borderRadius: 11, background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', fontSize: 13.5, lineHeight: 1.5 }}>
            <span aria-hidden style={{ marginTop: 1 }}>✓</span>
            <span><strong>We&apos;ve got your request.</strong> We&apos;ll email you on Mondays when there&apos;s something new for your {vehicleName} — and only then. Quiet week, no email. No spam, unsubscribe anytime.</span>
          </div>
          {fbState === 'sent' ? (
            <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>🙏 Thanks — feedback like yours is how au7o gets better.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
                Have an idea to make au7o better? We read every note:
              </label>
              <textarea
                value={fb}
                onChange={(e) => setFb(e.target.value)}
                placeholder="What would make this more useful for you?"
                rows={3}
                style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 11, border: '1px solid #E3DFD4', fontSize: 13.5, color: '#0B1220', background: '#FBFAF7', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
              />
              <button
                type="button"
                onClick={submitFeedback}
                disabled={fbState === 'sending' || !fb.trim()}
                style={{ alignSelf: 'flex-start', padding: '9px 16px', borderRadius: 11, border: '1px solid #E3DFD4', background: '#fff', color: '#0B1220', fontSize: 13.5, fontWeight: 600, cursor: fb.trim() ? 'pointer' : 'default', opacity: fb.trim() && fbState !== 'sending' ? 1 : 0.6 }}
              >
                {fbState === 'sending' ? 'Sending…' : 'Send feedback'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* PRIMARY: low-friction email capture — this is what actually converts
              (~1-3 leads/day). Account creation is the secondary link below. */}
          <form onSubmit={submit} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (state === 'error') setState('idle'); }}
              disabled={state === 'loading'}
              style={{ flex: '1 1 200px', minWidth: 0, padding: '12px 14px', borderRadius: 11, border: '1px solid #E3DFD4', fontSize: 14, color: '#0B1220', background: '#FBFAF7', outline: 'none' }}
            />
            {/* Honeypot. Off-screen rather than display:none, which some bots
                detect and skip. aria-hidden + tabIndex keep it away from screen
                readers and keyboard users. */}
            <input
              type="text"
              name="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
            />
            <button
              type="submit"
              disabled={state === 'loading'}
              style={{ flexShrink: 0, padding: '12px 20px', borderRadius: 11, border: 'none', background: '#3B82F6', color: '#fff', fontSize: 14.5, fontWeight: 700, cursor: 'pointer' }}
            >
              {state === 'loading' ? '…' : 'Email me alerts'}
            </button>
          </form>
          {/* The secondary "create a free account" link was removed: this block
              has seconds of attention, and a second ask splits it. The email
              capture is the one thing we want here. */}
        </div>
      )}
      {state === 'error' && (
        <div style={{ fontSize: 12.5, color: '#B91C1C' }}>{errorMsg || 'Enter a valid email and try again.'}</div>
      )}
    </div>
  );
}
