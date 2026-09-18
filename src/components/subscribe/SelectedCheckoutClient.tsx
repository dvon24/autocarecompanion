'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { SELECTED_CHECKOUT_PATH } from '@/lib/selected-enrollment';

export type SelectedCheckoutProps = {
  returnTo: string; resumeKey: string; usConfirmed: boolean; autoOpen?: boolean;
  unavailable?: string | null; paymentPending?: boolean;
};
export function SelectedCheckoutClient({ returnTo, resumeKey, usConfirmed, autoOpen = false, unavailable, paymentPending = false }: SelectedCheckoutProps) {
  const [confirmed, setConfirmed] = useState(usConfirmed);
  const [busy, setBusy] = useState(autoOpen && usConfirmed && !unavailable && !paymentPending);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(paymentPending);
  const locked = useRef(false);
  const started = useRef(false);
  const mounted = useRef(false);
  const activeRequest = useRef<AbortController | null>(null);
  const attemptFlag = `au7o:selected-checkout:${resumeKey}`;

  async function openCheckout() {
    if (locked.current || unavailable || pending || !confirmed) return;
    locked.current = true; setBusy(true); setError('');
    // This flag only prevents Back from reopening Stripe. It conveys no consent,
    // access or billing identity; the server owns those across tabs and devices.
    try { sessionStorage.setItem(attemptFlag, '1'); } catch { /* Storage may be disabled. */ }
    const controller = new AbortController();
    activeRequest.current = controller;
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch('/api/stripe/create-checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal,
        body: JSON.stringify({ product: 'visual', interval: 'month', billingCountry: 'US', returnTo }) });
      const data = await response.json();
      if (!mounted.current || activeRequest.current !== controller) return;
      if (response.status === 401) { window.location.assign(`/auth/signin?callbackUrl=${encodeURIComponent(SELECTED_CHECKOUT_PATH)}`); return; }
      if (['subscription_confirmation_pending', 'existing_subscription_use_account'].includes(data.error)) { setPending(true); setBusy(false); return; }
      if (!response.ok) throw new Error(data.message || (data.error === 'billing_review_required' ? 'Your billing needs review. Open Account to review billing or contact support before trying another checkout.' : 'Checkout could not be confirmed. Retry to resume the same attempt.'));
      // Provider URL comes from the authenticated, price-checked API.
      if (typeof data.url !== 'string' || !data.url.startsWith('https://checkout.stripe.com/')) throw new Error('Checkout could not be opened. Retry to resume the same attempt.');
      window.location.assign(data.url);
    } catch (failure) {
      if (!mounted.current || activeRequest.current !== controller) return;
      setError(failure instanceof Error && failure.name !== 'AbortError' ? failure.message : 'Connection interrupted. Retry to resume the same checkout attempt.');
      setBusy(false);
    } finally {
      clearTimeout(timeout);
      if (activeRequest.current === controller) { activeRequest.current = null; locked.current = false; }
    }
  }

  useEffect(() => {
    mounted.current = true;
    let cancelled = false;
    const back = (event: PageTransitionEvent) => { if (event.persisted) { locked.current = false; setBusy(false); } };
    window.addEventListener('pageshow', back);
    // StrictMode replays setup/cleanup. Only the live setup may start a request.
    queueMicrotask(() => {
      if (cancelled || started.current) return;
      started.current = true;
      let attempted = false;
      try { attempted = sessionStorage.getItem(attemptFlag) === '1'; } catch { /* Back navigation below also covers disabled storage. */ }
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
      if (autoOpen && usConfirmed && !unavailable && !paymentPending && !attempted && navigation?.type !== 'back_forward') void openCheckout();
      else setBusy(false);
    });
    return () => {
      cancelled = true; mounted.current = false;
      const request = activeRequest.current;
      activeRequest.current = null; request?.abort(); locked.current = false;
      window.removeEventListener('pageshow', back);
    };
    // The server supplies immutable enrollment props for this mounted surface.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <section aria-label="Complete Visual subscription" className="grid min-w-0 gap-5">
    <h1 className="text-3xl font-semibold">{busy ? 'Opening your Visual checkout' : 'Complete your Visual subscription'}</h1>
    <p className="text-lg font-semibold">Visual · $4.99 USD/month</p>
    <p className="leading-relaxed text-slate-700">No trial. Cancel anytime. Your account is ready. Visual access begins after secure payment confirmation.</p>
    {unavailable ? <p role="status" className="rounded-xl bg-amber-50 p-4 text-amber-950">{unavailable}</p> : pending ? <><p role="status" className="rounded-xl bg-blue-50 p-4 text-blue-950">Your checkout has already been submitted. Check payment confirmation before starting another payment.</p><Link className="min-h-11 rounded-xl bg-blue-600 px-4 py-3 text-center font-semibold text-white" href="/subscribe/success?product=visual">Check payment confirmation</Link></> : <form className="grid gap-4" onSubmit={event => { event.preventDefault(); void openCheckout(); }}>
      {!usConfirmed && <label className="flex items-start gap-3 rounded-xl border border-[#E3DFD4] p-4"><input required type="checkbox" className="mt-1 h-5 w-5 shrink-0" checked={confirmed} disabled={busy} onChange={event => setConfirmed(event.target.checked)} /><span>I live in the United States and will use a US billing address. Subscriptions are US-only and billed in USD.</span></label>}
      <button disabled={busy || !confirmed} className="min-h-11 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white disabled:opacity-50">{busy ? 'Opening secure checkout…' : error ? 'Retry Visual checkout' : 'Continue to Visual checkout'}</button>
      <p role="status" aria-live="polite" className="break-words text-slate-700">{error || (busy ? 'Your selected plan is saved. You’ll continue securely in Stripe.' : 'Stripe collects and verifies your US billing address. Your original Visual page is saved.')}</p>
    </form>}
  </section>;
}
