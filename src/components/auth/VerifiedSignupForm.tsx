'use client';
import { useEffect, useRef, useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { reservationClaimHref } from '@/lib/reservation-identity';
import { safeInternalCallback } from '@/lib/auth-callback';
import { enrollmentContinuation, visualReturnDestination } from '@/lib/visual-return-destination';

type Props = { token?: string; product?: 'visual' | 'hub'; vehicleId?: string; intent?: 'reservation'; reservationId?: string; returnTo?: string; invalidLink?: boolean; preview?: boolean };
export function VerifiedSignupForm({ token, product = 'visual', vehicleId, intent, reservationId, returnTo, invalidLink = false, preview = false }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [usBillingConfirmed, setUsBillingConfirmed] = useState(false);
  const [message, setMessage] = useState(invalidLink ? 'This link has expired or was already used. Request another link, or sign in if you created your account.' : '');
  const [busy, setBusy] = useState(false);
  const locked = useRef(false);
  const [phase, setPhase] = useState<'email' | 'sent' | 'verify' | 'complete'>(token && !invalidLink ? 'verify' : 'email');
  const [deadlines, setDeadlines] = useState<Record<string, number>>({});
  const [ipDeadline, setIpDeadline] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const normalizedEmail = email.trim().toLowerCase();
  const deadline = Math.max(deadlines[normalizedEmail] || 0, ipDeadline);
  const seconds = Math.max(0, Math.ceil((deadline - now) / 1000));
  const [callback, setCallback] = useState(intent === 'reservation' ? reservationClaimHref(reservationId) : enrollmentContinuation(product, vehicleId, returnTo));
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick(); const timer = setInterval(tick, 1000); return () => clearInterval(timer);
  }, []);
  function restart() { setPhase('email'); setPassword(''); setMessage('Enter the correct email below. Starting over does not delete an account or subscription.'); }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (locked.current || (phase !== 'verify' && Date.now() < deadline)) return;
    if (phase === 'verify' && intent !== 'reservation' && !usBillingConfirmed) { setMessage('Confirm your US residence and US billing address before continuing.'); return; }
    locked.current = true; setBusy(true); setMessage('');
    const verifying = phase === 'verify';
    const requestedEmail = normalizedEmail;
    try {
      const response = await fetch(verifying ? '/api/auth/verify' : '/api/auth/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(verifying ? { token, password, usBillingConfirmed } : { email: email.trim(), product, vehicleId, intent, reservationId, returnTo: visualReturnDestination(returnTo) }) });
      const data = await response.json();
      if (!verifying) {
        const retryAfter = typeof data.retryAfter === 'number' ? data.retryAfter : Number(response.headers.get('Retry-After'));
        if (Number.isFinite(retryAfter) && retryAfter > 0) {
          const nextDeadline = Date.now() + Math.ceil(retryAfter) * 1000;
          if (data.retryScope === 'ip') setIpDeadline(nextDeadline);
          else setDeadlines(current => ({ ...current, [requestedEmail]: nextDeadline }));
          setNow(Date.now());
        }
      }
      if (!response.ok || !data.ok) {
        setMessage(data.message || (response.status === 429 ? 'Too many attempts. Please wait a few minutes before trying again.' : 'This request could not be completed. Please try again or sign in.'));
        if (data.error === 'invalid_or_used_link') { setPhase('email'); setPassword(''); }
        return;
      }
      if (!verifying) {
        setPhase('sent');
        setMessage(data.message || 'Request received. Check your inbox and spam for verification or sign-in instructions. If nothing arrives, contact support@au7o.io for help.'); return;
      }
      const destination = safeInternalCallback(data.callbackUrl, callback);
      setCallback(destination); setPhase('complete');
      if (!data.existing && typeof data.email === 'string') {
        setEmail(data.email); setMessage('Your email is verified. Signing you in…');
        const result = await signIn('credentials', { email: data.email, password, redirect: false });
        setPassword('');
        if (result?.ok && !result.error) { window.location.assign(destination); return; }
      }
      setPassword(''); setMessage('Your account is ready. Sign in with your account email and password to continue. An existing account’s password has not changed.');
    } catch {
      setPassword('');
      setMessage(verifying ? 'Connection interrupted. Your account may already be verified. Try signing in, or request a new link if verification was not completed.' : 'Connection interrupted. We could not confirm this request. Check your inbox in case it arrived, then retry.');
    } finally { locked.current = false; setBusy(false); }
  }
  const inputStyle = 'mt-2 w-full min-w-0 rounded-xl border border-[#D6D0C4] bg-white p-3 text-base text-[#0B1220] focus:outline-blue-600';
  const buttonStyle = 'min-h-11 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white disabled:opacity-50';
  return <main className="min-h-screen bg-[#F7F6F2] px-5 py-10 text-[#0B1220]"><section className="mx-auto max-w-lg rounded-2xl border border-[#E3DFD4] bg-white p-5 sm:p-8">
    <Link href="/" className="text-xl font-bold">Au7o</Link>
    <h1 className="mt-7 text-3xl font-semibold">{phase === 'verify' ? 'Finish creating your account' : phase === 'sent' ? 'Check your email' : phase === 'complete' ? 'Your account is ready' : 'Create your Au7o account'}</h1>
    <p className="my-4 leading-relaxed text-slate-700">{phase === 'verify' ? 'Choose your Au7o account password. Use at least 12 characters.' : intent === 'reservation' ? 'Verify your email to view your ready vehicle offer. Claiming never starts billing.' : `Verify your email before continuing to ${product === 'hub' ? 'Hub — 7 days free, then $14.99/month' : 'Visual — $4.99/month, no trial'}.`}</p>
    {preview && <p className="my-4 rounded-xl bg-blue-50 p-3 text-sm text-blue-950">Preview access uses <strong>au7o-review</strong>. Your Au7o account uses <strong>your email address</strong> and the password you create here.</p>}
    {phase !== 'complete' && <form onSubmit={submit} className="grid gap-4">
      {phase === 'verify' ? <label>New account password<input className={inputStyle} type="password" autoComplete="new-password" minLength={12} maxLength={128} required disabled={busy} value={password} onChange={e => setPassword(e.target.value)} /></label> : phase === 'sent' ? <p className="break-words">Email requested for <strong>{email.trim()}</strong>. Follow the verification or sign-in instructions. Already have an account? You can sign in below.</p> : <label>Your email address<input className={inputStyle} type="email" inputMode="email" autoComplete="email" maxLength={254} required disabled={busy} value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" /></label>}
      {phase === 'verify' && intent !== 'reservation' && <><p className="rounded-xl bg-blue-50 p-4 text-blue-950">{product === 'visual' ? 'Your selected plan: Visual · $4.99 USD/month. No trial. Cancel anytime. Continue to secure Stripe checkout after signing in.' : 'Your selected plan: Hub · 7 days free for eligible new members, then $14.99 USD/month. Cancel anytime.'}</p><label className="flex items-start gap-3 rounded-xl border border-[#E3DFD4] p-4"><input required type="checkbox" className="mt-1 h-5 w-5 shrink-0" disabled={busy} checked={usBillingConfirmed} onChange={event => setUsBillingConfirmed(event.target.checked)} /><span>I live in the United States and will use a US billing address. Subscriptions are US-only and billed in USD. Stripe collects my billing address.</span></label></>}
      <button disabled={busy || (phase !== 'verify' && seconds > 0)} className={buttonStyle}>{busy ? 'Please wait…' : phase === 'verify' ? 'Verify and continue' : seconds > 0 ? `Resend available in ${seconds}s` : phase === 'sent' ? 'Resend verification email' : 'Email my verification link'}</button>
    </form>}
    <p role="status" className="my-4 break-words leading-relaxed text-slate-700">{message}</p>
    <nav aria-label="Account recovery" className="grid gap-3 text-sm font-semibold text-blue-700">
      <Link className="flex min-h-11 items-center underline" href={`/auth/signin?callbackUrl=${encodeURIComponent(callback)}`}>Sign in with your account email</Link>
      <Link className="flex min-h-11 items-center underline" href={`/auth/forgot-password?callbackUrl=${encodeURIComponent(callback)}`}>Forgot your account password?</Link>
      <button type="button" disabled={busy} className="min-h-11 rounded-xl border border-[#D6D0C4] bg-white px-4 py-3 text-left text-[#0B1220] disabled:opacity-50" onClick={restart}>{phase === 'sent' ? 'Change email / start over' : 'Start over with an email address'}</button>
    </nav>
  </section></main>;
}
