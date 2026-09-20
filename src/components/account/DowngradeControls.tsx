'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type State = { available?: boolean; pending?: boolean; recoveryRequired?: boolean; action?: string; renewalAt?: number; currentProduct?: string };
type Quote = { token: string; renewalAt: number; monthlyAmount: number; expiresAt: number };
const dateLabel = (seconds?: number) => seconds ? new Date(seconds * 1000).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : 'your current period end';

export function DowngradeControls({ tier, cancelAtPeriodEnd, disabled = false, onBusyChange, onChanged }: {
  tier: string; cancelAtPeriodEnd: boolean; disabled?: boolean; onBusyChange?: (busy: boolean) => void; onChanged?: () => void;
}) {
  const [state, setState] = useState<State | null>(null); const [quote, setQuote] = useState<Quote | null>(null);
  const [consent, setConsent] = useState(false); const [busy, setBusy] = useState(false); const inFlight = useRef(false);
  const [message, setMessage] = useState(''); const [error, setError] = useState('');
  const statusSequence = useRef(0);
  const readStatus = useCallback(async () => {
    const sequence = ++statusSequence.current;
    const response = await fetch('/api/account/change-to-visual', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'status' }), cache: 'no-store' });
    const result = await response.json(); if (!response.ok) throw new Error(result.message || 'Plan change status is unavailable.');
    if (sequence === statusSequence.current) setState(result);
  }, []);
  useEffect(() => {
    let active = true; setQuote(null); setConsent(false);
    readStatus().catch(() => { if (active) { setState(null); setError('Plan change status is unavailable. Recheck to try again.'); } });
    return () => { active = false; statusSequence.current++; };
  }, [readStatus, cancelAtPeriodEnd, tier]);
  async function act(action: 'preview' | 'confirm' | 'undo' | 'resume' | 'status') {
    if (inFlight.current || disabled) return;
    inFlight.current = true; setBusy(true); onBusyChange?.(true); setError(''); setMessage('');
    statusSequence.current++;
    try {
      if (action === 'status') { await readStatus(); onChanged?.(); return; }
      const response = await fetch('/api/account/change-to-visual', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, quote: quote?.token, confirmPeriodEnd: consent }) });
      const result = await response.json(); if (!response.ok) {
        if (['downgrade_quote_expired','downgrade_quote_invalid','downgrade_subscription_changed'].includes(result.error)) { setQuote(null); setConsent(false); }
        throw new Error(result.message || 'Your plan change could not be confirmed. Recheck its status.');
      }
      if (result.quote) { setQuote(result.quote); setConsent(false); }
      else {
        setQuote(null); setConsent(false); await readStatus(); onChanged?.();
        setMessage(result.keptHub ? 'Your change to Visual was removed. Your Hub subscription continues.' : result.pending ? 'Your change to Visual is scheduled. Hub stays available until ' + dateLabel(result.renewalAt) + '.' : 'Your plan change status is up to date.');
      }
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Your plan change could not be confirmed.'); }
    finally { inFlight.current = false; setBusy(false); onBusyChange?.(false); }
  }
  const button = 'min-h-11 rounded-xl border border-[#E3DFD4] bg-white px-4 py-3 text-sm font-semibold text-[#0B1220] disabled:opacity-50';
  const blocked = busy || disabled;
  if (tier !== 'hub' && !state?.pending && !state?.recoveryRequired) return null;
  return <div className="mt-4 min-w-0 rounded-xl border border-[#E3DFD4] p-4" aria-label="Change subscription plan">
    {state?.pending ? <>
      <p className="text-sm leading-relaxed">Visual starts {dateLabel(state.renewalAt)} at $4.99/month USD. Keep Hub until then. Your saved vehicles and service history stay on your account.</p>
      <button className={button + ' mt-3'} disabled={blocked} onClick={() => act('undo')}>Keep Hub</button>
    </> : state?.recoveryRequired ? <>
      <p role="status" className="text-sm leading-relaxed">Your plan change is not confirmed. Recheck its status or resume the saved request. Contact support if it still needs review.</p>
      <div className="mt-3 flex flex-wrap gap-2"><button className={button} disabled={blocked} onClick={() => act('status')}>Recheck plan change</button>{state.action !== 'cancel' && <><button className={button} disabled={blocked} onClick={() => act('resume')}>Resume plan change</button><button className={button} disabled={blocked} onClick={() => act('undo')}>Keep Hub</button></>}</div>
    </> : quote ? <>
      <h3 className="font-semibold">Review change to Visual</h3>
      <p className="mt-2 text-sm leading-relaxed">No charge today. Hub remains active until {dateLabel(quote.renewalAt)}. Your existing subscription then renews as Visual for $4.99/month USD until canceled.</p>
      <p className="mt-2 text-sm leading-relaxed">Visual includes available visual known-issue models. Personal Hub features end on that date. Your saved vehicles and service history remain on your account.</p>
      <label className="mt-3 flex min-h-11 items-start gap-3 text-sm"><input type="checkbox" className="mt-1 h-5 w-5 shrink-0" checked={consent} onChange={event => setConsent(event.target.checked)} disabled={blocked} /><span>I agree to change to Visual on {dateLabel(quote.renewalAt)} for $4.99/month USD.</span></label>
      <div className="mt-3 flex flex-wrap gap-2"><button className={button} disabled={blocked || !consent} onClick={() => act('confirm')}>{busy ? 'Updating…' : 'Confirm change to Visual'}</button><button className={button} disabled={blocked} onClick={() => { setQuote(null); setConsent(false); }}>Keep current plan</button></div>
    </> : !cancelAtPeriodEnd ? <>
      <button className={button} disabled={blocked || !state?.available} onClick={() => act('preview')}>Review change to Visual</button>
      <p className="mt-2 text-xs leading-relaxed text-slate-600">{state?.available ? 'Change at your next renewal for $4.99/month USD. No charge today.' : 'Scheduling a change to Visual is not available yet. Billing and cancellation remain available.'}</p>
    </> : <p className="text-sm">Your subscription is set to end. Reactivate before reviewing a change to Visual.</p>}
    {message && <p role="status" className="mt-3 text-sm text-green-700">{message}</p>}
    {error && <><p role="alert" className="mt-3 text-sm text-red-700">{error}</p><button className={button + ' mt-2'} disabled={blocked} onClick={() => act('status')}>Recheck plan change</button></>}
  </div>;
}
