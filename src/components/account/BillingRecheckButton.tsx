'use client';
import { useRef, useState } from 'react';

export function BillingRecheckButton({ onConfirmed, onRechecked }: { onConfirmed?: () => void; onRechecked?: () => void }) {
  const active = useRef(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  async function recheck() {
    if (active.current) return;
    active.current = true; setPending(true); setMessage('');
    try {
      const response = await fetch('/api/billing/recheck', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: '{}', cache: 'no-store', signal: AbortSignal.timeout(12000) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Billing could not be rechecked. Please try again.');
      if (result.reviewRequired === false) onConfirmed?.();
      else setMessage(result.message || 'Billing still needs review. Update billing details or contact support; do not check out again.');
      // Account also needs fresh provider status when an eligibility hold remains.
      onRechecked?.();
    } catch (error) { setMessage(error instanceof Error && error.name !== 'TimeoutError' ? error.message : 'Billing could not be rechecked. Please try again.'); }
    finally { active.current = false; setPending(false); }
  }
  return <div className="my-4"><button type="button" disabled={pending} onClick={recheck} className="min-h-11 rounded-xl border border-[#E3DFD4] bg-white px-4 py-3 text-sm font-semibold text-[#0B1220] hover:bg-[#EFEDE6] disabled:opacity-50">{pending ? 'Rechecking…' : 'Recheck billing'}</button>
    {message && <p role="status" className="mt-3 text-sm text-slate-700">{message}</p>}
  </div>;
}
