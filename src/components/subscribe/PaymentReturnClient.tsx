'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BillingRecheckButton } from '@/components/account/BillingRecheckButton';
import { visualReturnDestination } from '@/lib/visual-return-destination';
export function PaymentReturnClient({ query, product }: { query: string; product: 'visual' | 'hub' }) {
  const router = useRouter();
  const [retry, setRetry] = useState(0);
  const [waiting, setWaiting] = useState(true);
  const [reviewRequired, setReviewRequired] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    let checks = 0;
    setWaiting(true);
    setReviewRequired(false);
    async function check() {
      const requestController = new AbortController();
      const cancel = () => requestController.abort();
      controller.signal.addEventListener('abort', cancel, { once: true });
      const timeout = setTimeout(cancel, 6000);
      try {
        const response = await fetch(`/api/billing/status?${query}`, { cache: 'no-store', signal: requestController.signal });
        if (controller.signal.aborted) return;
        if (response.status === 401) { router.replace(`/auth/signin?callbackUrl=${encodeURIComponent(`/subscribe/success?${query}`)}`); return; }
        const result = response.ok ? await response.json() : null;
        if (controller.signal.aborted) return;
        if (result?.reviewRequired === true) { setReviewRequired(true); setWaiting(false); return; }
        if (result?.ready && typeof result.destination === 'string' && (/^\/(vehicle\/|visual$|account$)/.test(result.destination) || visualReturnDestination(result.destination) === result.destination)) {
          router.replace(result.destination); router.refresh(); return;
        }
      } catch { if (controller.signal.aborted) return; }
      finally { clearTimeout(timeout); controller.signal.removeEventListener('abort', cancel); }
      if (++checks < 15) timer = setTimeout(check, 2000);
      else setWaiting(false);
    }
    void check();
    return () => { controller.abort(); clearTimeout(timer); };
  }, [query, retry, router]);
  return <main className="min-h-screen bg-[#F7F6F2] px-5 py-16 text-[#0B1220]"><div className="mx-auto max-w-xl rounded-2xl border border-[#E3DFD4] bg-white p-6">
    <h1 className="text-2xl font-bold">{reviewRequired ? 'Your billing needs review' : waiting ? `Confirming your ${product === 'hub' ? 'Hub' : 'Visual'} access` : 'Confirmation is taking longer than usual'}</h1>
    <p role="status" className="my-5 text-slate-700">{reviewRequired ? 'We couldn’t confirm the US billing information required for paid access. Please don’t check out again. A payment may already have occurred; this review does not refund or cancel it. Open Account to manage billing and contact support.' : waiting ? 'We’re waiting for secure payment confirmation. Your vehicle selection is saved; this page will open your access when it is ready.' : 'Please don’t check out again. If Stripe requested payment authentication, finish that first. You can check again or return to your account.'}</p>
    {!waiting && !reviewRequired && <button onClick={() => setRetry(value => value + 1)} className="mr-5 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white">Check again</button>}
    <Link href="/account" className="font-semibold text-blue-700 underline">Open Account</Link>
    {reviewRequired && <BillingRecheckButton onConfirmed={() => setRetry(value => value + 1)} />}
    {reviewRequired && <a href="mailto:support@au7o.io" className="ml-5 font-semibold text-blue-700 underline">Contact support</a>}
  </div></main>;
}
