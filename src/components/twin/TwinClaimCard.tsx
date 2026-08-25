'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function TwinClaimCard({ vehicle, trialDays }: { vehicle: string; trialDays: number }) {
  const router = useRouter();
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState('');

  async function claim() {
    setState('loading');
    setError('');
    try {
      const response = await fetch('/api/twin/claim', { method: 'POST' });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(payload.error || 'Could not activate your twin yet.');
        setState('error');
        return;
      }
      router.push(payload.href);
      router.refresh();
    } catch {
      setError('Could not activate your twin — try again.');
      setState('error');
    }
  }

  return (
    <div style={{ maxWidth: 620, margin: '0 auto', padding: 28, borderRadius: 20, border: '1px solid #DCE3EA', background: '#fff', boxShadow: '0 18px 45px rgba(12,18,28,.08)' }}>
      <div style={{ color: '#2563EB', fontSize: 12, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase' }}>Your vehicle twin is ready</div>
      <h1 style={{ marginTop: 10, color: '#0B1220', fontSize: 32, lineHeight: 1.1, fontWeight: 650 }}>{vehicle}</h1>
      <p style={{ marginTop: 12, color: '#52606D', fontSize: 15, lineHeight: 1.65 }}>
        This offer gives this account {trialDays} days of beta access to the fitment-reviewed twin prepared for your reservation. Accepting does not start a paid subscription or charge a card.
      </p>
      <button type="button" onClick={claim} disabled={state === 'loading'} style={{ width: '100%', marginTop: 20, minHeight: 48, border: 0, borderRadius: 12, background: '#2563EB', color: '#fff', fontSize: 15, fontWeight: 650, cursor: 'pointer', opacity: state === 'loading' ? .65 : 1 }}>
        {state === 'loading' ? 'Activating…' : `Accept my ${trialDays}-day beta access`}
      </button>
      {error && <p role="alert" style={{ marginTop: 12, color: '#B42318', fontSize: 13 }}>{error}</p>}
    </div>
  );
}
