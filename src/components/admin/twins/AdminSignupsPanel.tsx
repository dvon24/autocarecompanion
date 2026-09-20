'use client';
import { useEffect, useState } from 'react';
import type { SignupSummary } from '@/lib/admin-signup-summary';
import { VisualSignupsPanel } from './VisualSignupsPanel';

export function AdminSignupsPanel() {
  const [data, setData] = useState<SignupSummary | null>(null);
  const [error, setError] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    let live = true;
    fetch('/api/admin/signup-summary', { signal: controller.signal, cache: 'no-store' })
      .then(async response => { if (!response.ok) throw new Error('Unavailable'); return response.json() as Promise<SignupSummary>; })
      .then(value => { if (live) setData(value); })
      .catch(() => { if (live) setError(true); })
      .finally(() => clearTimeout(timeout));
    return () => { live = false; clearTimeout(timeout); controller.abort(); };
  }, [revision]);
  return <>
    <section className="page-head"><div><div className="eyebrow">Separate audiences</div><h1>Signups</h1><p>Hub reservations and Visual launch signups, counted separately.</p></div><button className="primary" onClick={() => {setError(false);setData(null);setRevision(value => value + 1);}}>Refresh</button></section>
    {error && <p role="alert" className="panel-state error">Signup counts are unavailable. Retry with Refresh.</p>}
    {!data && !error && <p role="status">Loading signup counts…</p>}
    <div className="grid gap-4 md:grid-cols-2">
      {(['hub', 'visual'] as const).map(plan => {
        const counts = data?.[plan];
        return <article key={plan} className="panel" aria-label={`${plan === 'hub' ? 'Hub' : 'Visual'} signup totals`}>
          <div className="eyebrow">{plan === 'hub' ? 'Hub · $14.99/month plan' : 'Visual · $4.99/month plan'}</div>
          <h2>{plan === 'hub' ? 'Hub reservations' : 'Visual launch list'}</h2>
          <p className="my-3 text-4xl font-bold" style={{ color: plan === 'hub' ? '#2563EB' : '#7C3AED' }}>{counts ? counts.total.toLocaleString() : '—'}</p>
          <p className="text-sm text-slate-600">{counts ? `${counts.active.toLocaleString()} opted in · ${(counts.total - counts.active).toLocaleString()} unsubscribed` : data ? 'Source unavailable—not zero signups.' : 'Awaiting counts.'}</p>
          <p className="mt-3 text-xs text-slate-500">{plan === 'hub' ? 'Unique reservation emails, including claimed reservations.' : 'Unique Visual launch-list emails. These are not Hub reservations.'}</p>
        </article>;
      })}
    </div>
    <div className="my-4 grid gap-4 md:grid-cols-2">{(['hub','visual'] as const).map(plan=><article key={plan} className="panel"><h2>{plan==='hub'?'Hub':'Visual'} accounts & subscriptions</h2>{data?.memberships?<dl className="mt-3 grid gap-3 text-sm"><div className="flex justify-between gap-3"><dt>Verified signups for this plan</dt><dd>{data.memberships[plan].verifiedAccounts.toLocaleString()}</dd></div><div className="flex justify-between gap-3"><dt>Active paid subscriptions</dt><dd>{data.memberships[plan].paid.toLocaleString()}</dd></div><div className="flex justify-between gap-3"><dt>Stripe trials</dt><dd>{data.memberships[plan].trialing.toLocaleString()}</dd></div></dl>:<p className="mt-3 text-sm text-slate-600">Subscription counts unavailable—not zero.</p>}</article>)}</div>
    <p className="my-4 text-sm text-slate-600">Lead lists may overlap. Verified signups reflect the original enrollment plan; active subscriptions reflect the current plan after upgrades. Trials and complimentary reservation offers are not counted as paid. Legacy plans are not included in these two launch-plan totals.</p>
    <VisualSignupsPanel key={revision} />
  </>;
}
