'use client';
import { useEffect, useState } from 'react';

type SignupData = {total: number; active: number; items: {id: string; email: string; source: string; createdAt: string; unsubscribedAt: string | null}[]};

export function VisualSignupsPanel() {
  const [data, setData] = useState<SignupData | null>(null);
  const [error, setError] = useState('');
  useEffect(()=>{
    const controller = new AbortController();
    const timer = setTimeout(()=>controller.abort(), 10000);
    let active = true;
    fetch('/api/admin/visual-signups', {signal: controller.signal, cache: 'no-store'})
      .then(async response=>{const body = await response.json(); if (!response.ok) throw new Error(body.error || 'Visual signups unavailable.'); return body as SignupData;})
      .then(body=>{if (active) setData(body);})
      .catch(()=>{if (active) setError('Visual signups unavailable. Check the release migration and retry.');})
      .finally(()=>clearTimeout(timer));
    return ()=>{active=false; clearTimeout(timer); controller.abort();};
  },[]);
  return <article className="panel overview-wide">
    <div className="panel-head"><div><div className="eyebrow">Separate launch audience · $4.99/month</div><h2>Visual Known Issues signups</h2></div>{data&&<span className="count">{data.active} active</span>}</div>
    <p className="panel-state">All available visual models. These are launch signups—not Hub reservations or paid subscribers. No campaign is sent from this panel.</p>
    {error?<p role="alert" className="panel-state error">{error}</p>:!data?<p role="status" className="panel-state">Loading visual signups…</p>:<>
      <p className="panel-state">{data.total} total · {data.active} opted in · showing the latest {data.items.length}</p>
      <div className="simple-list">{data.items.map(item=><div key={item.id}><span><strong>{item.email}</strong><small>{item.source} · {new Date(item.createdAt).toLocaleDateString()}</small></span><em>{item.unsubscribedAt?'Unsubscribed':'Launch signup'}</em></div>)}</div>
    </>}
  </article>;
}
