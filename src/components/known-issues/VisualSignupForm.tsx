'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { EnrollmentOfferGate } from '@/components/auth/EnrollmentOfferGate';

export function VisualSignupForm() {
  return <EnrollmentOfferGate><EligibleVisualSignupForm /></EnrollmentOfferGate>;
}

function EligibleVisualSignupForm() {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const data = new FormData(event.currentTarget);
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/visual-signup', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(15000),
        body: JSON.stringify({ email: data.get('email'), country: 'US', consent: data.get('consent') === 'on', company: data.get('company') }),
      });
      const result = await response.json();
      if (!response.ok || result.success !== true) throw new Error(result.error || 'Signup could not be saved.');
      setDone(true);
    } catch (reason) { setError(reason instanceof Error && reason.name !== 'TimeoutError' ? reason.message : 'We could not confirm the signup. Please retry; repeated submissions will not create duplicate signups.'); }
    finally { setBusy(false); }
  }
  if (done) return <p role="status" className="mt-4 text-sm text-emerald-700">Your request was received. Existing email opt-outs stay unchanged. No charge or Hub reservation was created.</p>;
  return <form onSubmit={submit} className="mx-auto mt-4 max-w-md rounded-2xl border border-[#DDD6C9] bg-[#FAF8F2] p-4 text-left" aria-label="Visual Known Issues signup">
    <label htmlFor="visual-signup-email" className="block text-sm font-semibold">Email for Visual Known Issues</label>
    <input id="visual-signup-email" type="email" name="email" autoComplete="email" required maxLength={254} className="mt-2 w-full rounded-lg border border-[#DDD6C9] bg-white px-3 py-2 text-sm"/>
    <div hidden aria-hidden="true"><label>Company<input name="company" tabIndex={-1} autoComplete="off"/></label></div>
    <label className="mt-3 flex items-start gap-2 text-xs leading-5"><input type="checkbox" name="consent" required className="mt-1"/>I’m in the US and agree to receive Visual Known Issues launch emails. I can unsubscribe at any time.</label>
    {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
    <button disabled={busy} className="mt-3 w-full rounded-full bg-[#7C3AED] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{busy ? 'Saving…' : 'Notify me when Visual launches'}</button>
    <p className="mt-2 text-xs leading-5 text-slate-500">Planned price: $4.99/month for all available visual models. This is a launch signup, not a paid subscription. <Link href="/privacy" className="underline">Privacy</Link></p>
  </form>;
}
