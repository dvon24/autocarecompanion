'use client';
import { useEffect, useState } from 'react';
import { requestEmailPreference } from '@/lib/notification-preferences-client';

export default function NotificationPreferences() {
  const [enabled,setEnabled] = useState<boolean|null>(null);
  const [busy,setBusy] = useState(false);
  const [message,setMessage] = useState('');
  const [error,setError] = useState('');
  async function load() {
    setBusy(true); setError('');
    try { setEnabled(await requestEmailPreference(fetch)); }
    catch(cause) { setError(cause instanceof Error ? cause.message : 'Could not load preferences.'); }
    finally { setBusy(false); }
  }
  useEffect(()=>{void load();},[]);
  async function save(value:boolean) {
    setBusy(true); setError(''); setMessage('');
    try { setEnabled(await requestEmailPreference(fetch,value)); setMessage('Email preference saved.'); }
    catch(cause) { setError(cause instanceof Error ? cause.message : 'Could not save preferences.'); }
    finally { setBusy(false); }
  }
  return <section style={{padding:24,border:'1px solid #CBD5E1',borderRadius:16,background:'#FFFFFF',color:'#0F172A'}} aria-label="Email notification preference">
    {enabled === null ? <p role="status">{busy ? 'Loading preferences…' : 'Preferences could not be loaded.'}</p> :
      <label style={{display:'flex',alignItems:'center',gap:12,minHeight:48,cursor:busy?'wait':'pointer'}}>
        <input type="checkbox" checked={enabled} disabled={busy} onChange={event=>void save(event.target.checked)} style={{width:22,height:22,flexShrink:0}} />
        <span>Email maintenance reminders</span>
      </label>}
    <p style={{marginTop:12,lineHeight:1.6,color:'#475569'}}>Receive reminders based on your saved mileage and service history.</p>
    <p role="status" aria-live="polite">{busy && enabled !== null ? 'Saving…' : message}</p>
    {error && <p role="alert" style={{color:'#B91C1C'}}>{error}</p>}
    {enabled === null && !busy && <button type="button" onClick={()=>void load()} style={{minHeight:44,padding:'8px 16px',background:'#1D4ED8',color:'#FFFFFF',border:0,borderRadius:8}}>Try again</button>}
  </section>;
}
