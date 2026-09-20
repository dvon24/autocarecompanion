'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { VEHICLE_TWIN_CATALOG } from '@/lib/vehicle-twin-catalog';
import { getTransmissionOptions } from '@/lib/transmission-options';
import { visualReturnDestination } from '@/lib/visual-return-destination';

type PaidSignupProps = { authenticated: boolean; currentProduct: string | null; currentStatus: string | null; hasSubscriptionHistory?: boolean; selectedProduct?: 'hub' };
type UpgradeReview = { token: string; amountDue: number; invoiceTotal: number; monthlyAmount: number; currency: 'usd'; renewalAt: number; expiresAt: number; recovering: boolean };
const usd = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
export function PaidSignupClient(props: PaidSignupProps) {
  const params = useSearchParams();
  return <PaidSignupForm key={`${params.get('product') || ''}:${params.get('vehicleId') || ''}`} {...props} />;
}
function PaidSignupForm({ authenticated, currentProduct, currentStatus, hasSubscriptionHistory = false, selectedProduct }: PaidSignupProps) {
  const params = useSearchParams();
  const [product, setProduct] = useState<'visual' | 'hub'>(selectedProduct || (params.get('product') === 'hub' ? 'hub' : 'visual'));
  const ready = VEHICLE_TWIN_CATALOG.filter((entry) => entry.ownerReady);
  const [catalogId, setCatalogId] = useState(ready.some((entry) => entry.id === params.get('vehicleId')) ? params.get('vehicleId')! : '');
  const [ignoreProvidedVehicle, setIgnoreProvidedVehicle] = useState(false);
  const existingVehicleId = ignoreProvidedVehicle || ready.some((entry) => entry.id === params.get('vehicleId')) ? null : params.get('vehicleId');
  const [mileage, setMileage] = useState('');
  const [transmission, setTransmission] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [usBillingConfirmed, setUsBillingConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [preparedVehicleId, setPreparedVehicleId] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [quote, setQuote] = useState<UpgradeReview | null>(null);
  function resetQuote() { setQuote(null); setConfirmed(false); }
  const returnTo = visualReturnDestination(params.get('returnTo'));
  const returnUrl = (vehicleId: string | null) => `/subscribe/success?product=${product}${vehicleId ? `&vehicleId=${encodeURIComponent(vehicleId)}` : ''}`;
  const catalog = ready.find((entry) => entry.id === catalogId);
  const gearboxes = catalog ? getTransmissionOptions(catalog.identity) : [];
  const upgrade = currentProduct === 'visual' && currentStatus === 'active' && product === 'hub';
  async function checkout(event: React.FormEvent) {
    event.preventDefault(); setError('');
    if (!authenticated) { window.location.href = `/auth/signup?${new URLSearchParams({ product, ...(product === 'visual' ? { returnTo } : {}), ...(params.get('vehicleId') ? { vehicleId: params.get('vehicleId')! } : {}) })}`; return; }
    setBusy(true);
    try {
      let vehicleId = preparedVehicleId || existingVehicleId;
      if (product === 'hub' && !vehicleId) {
        const response = await fetch('/api/billing/vehicle', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ catalogId, mileage: Number(mileage), ...(transmission ? { transmission } : {}) }) });
        const data = await response.json(); if (!response.ok) throw new Error(data.message || data.error); vehicleId = data.vehicleId; setPreparedVehicleId(vehicleId);
      }
      const response = await fetch(upgrade ? '/api/stripe/change-tier' : '/api/stripe/create-checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product, vehicleId, returnTo, interval: 'month', ...(upgrade ? { action: quote ? 'confirm' : 'preview', quote: quote?.token, confirmProration: confirmed } : {}), billingCountry: usBillingConfirmed ? 'US' : null }) });
      const data = await response.json();
      if (!response.ok && data.error === 'existing_subscription_use_account') { window.location.href = '/account'; return; }
      if (!response.ok && data.error === 'subscription_confirmation_pending') { window.location.href = returnUrl(vehicleId); return; }
      if (!response.ok && data.error === 'owner_ready_vehicle_required') { resetQuote(); setIgnoreProvidedVehicle(true); setPreparedVehicleId(null); setError('Choose an available vehicle and confirm its mileage and transmission. The previous selection could not be used.'); setBusy(false); return; }
      if (!response.ok && ['upgrade_quote_expired', 'upgrade_quote_changed', 'upgrade_quote_invalid'].includes(data.error)) resetQuote();
      if (!response.ok) throw new Error(data.message || data.error);
      if (data.quote) { setQuote(data.quote); setConfirmed(false); setBusy(false); return; }
      if (data.paymentRequired) {
        if (data.vehicleId) setPreparedVehicleId(data.vehicleId);
        setPaymentUrl(data.paymentUrl || null);
        setError(data.message || 'Payment needs attention. Open your account to manage billing.'); setBusy(false);
        return;
      }
      window.location.href = data.url || returnUrl(typeof data.vehicleId === 'string' ? data.vehicleId : vehicleId);
    } catch (failure) {
      const message = failure instanceof Error ? failure.message : '';
      setError(/^[a-z_]+$/.test(message) ? 'Checkout needs attention. Retry to resume the same attempt, or open Account to review your vehicle and billing.' : message || 'Could not start checkout. Please retry.');
      setBusy(false);
    }
  }
  if (authenticated && currentProduct === 'hub' && ['active', 'trialing'].includes(currentStatus || '')) return <main className="min-h-screen bg-[#F7F6F2] p-6 py-16 text-[#0B1220]"><div className="mx-auto max-w-xl"><h1 className="text-2xl font-bold">Your Hub is already active</h1><p className="my-5">Hub includes Visual. You don’t need another subscription.</p><Link className="font-semibold text-blue-700 underline" href="/account">Open your account and vehicle</Link></div></main>;
  return <main className="min-h-screen bg-[#F7F6F2] text-[#0B1220]"><div className="mx-auto max-w-3xl px-5 py-10"><nav className="mb-8 flex gap-5 text-sm font-semibold text-blue-700"><Link href="/account">Account</Link><Link href="/demo/hub">Test Hub</Link></nav><h1 className="text-3xl font-bold">{selectedProduct ? 'Complete your Hub setup' : 'Choose Visual or Hub'}</h1>
    <form onSubmit={checkout} className="my-6 grid gap-5">{selectedProduct ? <p className="rounded-xl border border-blue-200 bg-blue-50 p-5 text-slate-900">Your selected plan: Hub · $14.99 USD/month. Eligible new members get 7 days free. Cancel anytime.</p> : <div className="grid gap-4 sm:grid-cols-2">{(['visual', 'hub'] as const).map((id) => <label key={id} className={`cursor-pointer rounded-2xl border p-5 text-[#0B1220] ${product === id ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'border-[#E3DFD4] bg-white'}`}><input type="radio" name="product" disabled={busy || !!paymentUrl} className="accent-blue-700" checked={product === id} onChange={() => { setProduct(id); resetQuote(); }} /> <strong>{id === 'visual' ? 'Visual · $4.99/month' : 'Hub · $14.99/month'}</strong><p className="mt-3 text-slate-600">{id === 'visual' ? 'All available visuals. No trial. Account, Test Hub and Upgrade.' : hasSubscriptionHistory ? 'Includes Visual, your ready vehicle, maintenance and personal AI. Your account has subscription history; a new trial does not start. Cancel anytime.' : 'Includes Visual, your ready vehicle, maintenance and personal AI. Eligible new members get 7 days free, then monthly billing. Cancel anytime.'}</p></label>)}</div>}
      {authenticated && product === 'hub' && !existingVehicleId && <fieldset disabled={busy || !!paymentUrl} className="grid gap-3"><legend className="mb-3 font-semibold">Your exact vehicle</legend><label>Ready vehicle<select required className="mt-1 w-full rounded border p-3" value={catalogId} onChange={(e) => { setCatalogId(e.target.value); setTransmission(''); setPreparedVehicleId(null); resetQuote(); }}><option value="">Choose your vehicle</option>{ready.map((entry) => <option key={entry.id} value={entry.id}>{entry.identity.year} {entry.identity.make} {entry.identity.model} {entry.identity.trim}</option>)}</select></label><label>Actual current mileage<input required type="number" min="1" max="2000000" step="1" value={mileage} onChange={(e) => { setMileage(e.target.value); setPreparedVehicleId(null); resetQuote(); }} className="mt-1 w-full rounded border p-3" /></label>{gearboxes.length > 1 && <label>Transmission<select required value={transmission} onChange={(e) => { setTransmission(e.target.value); setPreparedVehicleId(null); resetQuote(); }} className="mt-1 w-full rounded border p-3"><option value="">Choose transmission</option>{gearboxes.map((box) => <option key={box.value} value={box.value}>{box.label}</option>)}</select></label>}<p className="text-sm">Only choose an exact match. More vehicles are being prepared.</p></fieldset>}
      {authenticated && <label className="rounded-xl border border-[#E3DFD4] bg-white p-4 text-slate-900"><input required disabled={busy || !!paymentUrl} type="checkbox" checked={usBillingConfirmed} onChange={(event) => { setUsBillingConfirmed(event.target.checked); resetQuote(); }} /> I live in the United States and will use a US billing address. Subscriptions are currently US-only and billed in USD.</label>}
      {upgrade && quote && <section aria-label="Hub upgrade review" aria-live="polite" className="grid gap-3 rounded-xl border border-blue-200 bg-blue-50 p-5 text-slate-900"><h2 className="text-xl font-semibold">Review your Hub upgrade</h2><p>Due now <strong className="text-2xl">{usd(quote.amountDue)} USD</strong></p>{quote.amountDue === 0 && <p>No payment is due now.</p>}{quote.invoiceTotal < 0 && <p>Invoice credit: {usd(-quote.invoiceTotal)} USD.</p>}<p>Next renewal: <strong>{new Date(quote.renewalAt * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}</strong>. Hub is {usd(quote.monthlyAmount)} USD/month before any future tax or credit adjustments. Your billing date stays the same.</p><p className="text-sm">{quote.recovering ? 'Your previously confirmed upgrade is still being checked. Continue to recover the same operation and reviewed amount.' : 'This amount is available for five minutes and is checked again when you confirm.'} Hub starts after successful payment confirmation. Your current Visual access remains available while payment is pending.</p><label><input required disabled={busy || !!paymentUrl} type="checkbox" checked={confirmed} onChange={(event) => { if (!event.target.checked) resetQuote(); else setConfirmed(true); }} /> I agree to upgrade my existing subscription for {usd(quote.amountDue)} USD due now and the Hub renewal shown above.</label></section>}
      {upgrade && quote && quote.amountDue > 0 && <p className="text-sm leading-relaxed text-slate-700">Your billing method will be charged the amount shown when you confirm the upgrade.</p>}
      <button disabled={busy || !!paymentUrl || (upgrade && !!quote && !confirmed)} className="rounded-xl bg-blue-600 p-3 font-semibold text-white disabled:opacity-50">{busy ? 'Please wait…' : authenticated ? upgrade ? quote ? `${quote.recovering ? 'Resume' : 'Confirm'} Hub upgrade · ${usd(quote.amountDue)} USD due now` : 'Review Hub upgrade cost' : product === 'hub' ? hasSubscriptionHistory ? 'Continue to Hub checkout' : 'Continue to 7-day Hub trial' : 'Continue to Visual checkout' : 'Verify email to continue'}</button><p role="alert" className="text-red-700">{error}</p>
      {paymentUrl && <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-slate-900"><a href={paymentUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-700 underline">Complete payment securely in Stripe</a><p className="my-3">Then return here. Your vehicle is saved and your existing subscription is being upgraded.</p><Link href={returnUrl(preparedVehicleId || existingVehicleId)} className="font-semibold text-blue-700 underline">I’ve completed payment — open my Hub</Link></div>}
      {error && <div className="flex flex-wrap gap-4 text-sm"><Link href="/account" className="font-semibold text-blue-700 underline">Manage billing in Account</Link>{paymentUrl && <button type="button" className="font-semibold text-blue-700 underline" onClick={() => { setPaymentUrl(null); setError('Your vehicle remains saved. You can recheck the same upgrade or manage an expired payment in Account.'); }}>Recheck the same upgrade</button>}</div>}
    </form></div></main>;
}
