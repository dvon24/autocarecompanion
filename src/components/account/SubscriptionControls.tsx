'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BillingRecheckButton } from './BillingRecheckButton';
import { getTier, type TierId } from '@/lib/pricing/tiers';
import { EnrollmentOfferGate } from '@/components/auth/EnrollmentOfferGate';
import { DowngradeControls } from './DowngradeControls';

interface Props {
  initialTier: TierId; initialStatus: string | null;
  initialCancelAtPeriodEnd: boolean; initialCurrentPeriodEnd: number | null;
  regionAllowed: boolean; country: string | null; frameless?: boolean;
  initialBillingReview?: boolean;
}
const dateLabel=(seconds:number|null)=>seconds?new Date(seconds*1000).toLocaleDateString(undefined,{month:'long',day:'numeric',year:'numeric'}):'the end of your current period';

/** Product changes use confirmed checkout, never optimistic entitlement updates. */
export default function SubscriptionControls({initialTier,initialStatus,initialCancelAtPeriodEnd,initialCurrentPeriodEnd,regionAllowed,frameless=false,initialBillingReview=false}:Props){
  const router = useRouter();
  const [status,setStatus]=useState(initialStatus);
  const [cancel,setCancel]=useState(initialCancelAtPeriodEnd);
  const [end,setEnd]=useState(initialCurrentPeriodEnd);
  const [pending,setPending]=useState<'cancel'|'portal'|null>(null);
  const [downgradeBusy,setDowngradeBusy]=useState(false);
  const [message,setMessage]=useState(''); const [error,setError]=useState('');
  useEffect(()=>{setStatus(initialStatus);setCancel(initialCancelAtPeriodEnd);setEnd(initialCurrentPeriodEnd);},[initialStatus,initialCancelAtPeriodEnd,initialCurrentPeriodEnd]);
  const managed=!!status&&!['canceled','incomplete_expired'].includes(status);
  const name=initialBillingReview?'Billing review required':managed&&initialTier!=='free'?getTier(initialTier).name:'No active paid plan';
  const price=initialTier==='hub'?'$14.99/month USD':initialTier==='visual'?'$4.99/month USD':null;
  const button='min-h-11 rounded-xl border border-[#E3DFD4] px-4 py-3 text-sm font-semibold disabled:opacity-50';
  const secondaryButton=button+' bg-white text-[#0B1220] hover:bg-[#EFEDE6]';
  async function act(action:'cancel'|'portal'){
    if(pending||downgradeBusy)return;setPending(action);setError('');setMessage('');
    try{
      const response=await fetch(action==='cancel'?'/api/account/cancel-subscription':'/api/stripe/portal',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(action==='cancel'?{reactivate:cancel}:{})});
      const result=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(result.message||result.error||'Billing is unavailable. Please retry.');
      if(action==='portal'){
        const url=new URL(result.url);
        if(url.protocol!=='https:'||url.hostname!=='billing.stripe.com')throw new Error('Unexpected billing destination.');
        window.location.assign(url.href);
      }else{setCancel(!!result.cancelAtPeriodEnd);setEnd(result.currentPeriodEnd??end);setStatus(result.status??status);setMessage(result.cancelAtPeriodEnd?'Cancellation scheduled.':'Subscription reactivated.');}
    }catch(failure){setError(failure instanceof Error?failure.message:'Billing is unavailable.');}finally{setPending(null);}
  }
  return <section className={frameless?'min-w-0 max-w-full text-[#0B1220]':'min-w-0 rounded-xl border border-[#E3DFD4] bg-white p-5 text-[#0B1220]'}>
    {!frameless&&<h2 className="mb-4 text-xl font-semibold">Subscription</h2>}
    {initialBillingReview&&<BillingRecheckButton onRechecked={() => router.refresh()} />}
    {initialBillingReview&&<p role="status" className="mb-4 text-sm leading-relaxed text-slate-700">We couldn’t confirm the US billing information required for paid access. Please don’t check out again. A payment may already have occurred; this review does not refund or cancel it. Review Billing &amp; invoices and <a href="mailto:support@au7o.io" className="font-semibold text-blue-700 underline">contact support</a>.</p>}
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E3DFD4] bg-[#EFEDE6] p-4"><div><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Current plan</p><p className="mt-1 font-bold">{name}</p></div>{managed&&price&&<span className="text-sm font-semibold">{price}</span>}</div>
    {managed||initialBillingReview?<>
      <p className="mb-4 text-sm leading-relaxed text-slate-600">{status==='canceled'?'This subscription is canceled. No further renewal is scheduled.':status==='incomplete_expired'?'This incomplete subscription expired. Paid access is not active.':!status?'Subscription status is unavailable. Open Billing & invoices to review the current provider status.':status==='past_due'?'Payment needs attention. Update billing details to restore paid access.':['paused','unpaid'].includes(status??'')?'Billing is paused or unpaid. Open Billing & invoices to review payment recovery; paid access is not active.':status==='incomplete'?'Payment is not complete. Paid access waits for confirmation.':cancel?'Ends '+dateLabel(end)+'. No further renewal is scheduled.':status==='trialing'?(initialTier==='hub'?'Your Hub trial is active. Unless canceled, billing begins '+dateLabel(end)+' at $14.99/month USD.':'Your existing trial ends '+dateLabel(end)+'. Review Billing & invoices for your exact renewal price and interval.'):'Renews '+dateLabel(end)+'. Cancel the next renewal below.'}</p>
      <div className="flex flex-wrap gap-2"><button type="button" className={secondaryButton} disabled={!!pending||downgradeBusy} onClick={()=>act('portal')}>{pending==='portal'?'Opening…':'Billing & invoices'}</button>{['active','trialing','past_due'].includes(status??'')&&<button type="button" className={secondaryButton} disabled={!!pending||downgradeBusy} onClick={()=>act('cancel')}>{pending==='cancel'?'Updating…':cancel?'Reactivate subscription':'Cancel subscription'}</button>}</div>
      {!initialBillingReview&&regionAllowed&&initialTier==='visual'&&status==='active'&&!cancel&&<EnrollmentOfferGate><Link className={button+' mt-4 inline-flex bg-blue-600 text-white'} href="/subscribe?product=hub">Review Hub upgrade</Link><p className="mt-2 text-xs text-slate-500">Review the exact USD amount due now and your next renewal before confirming an upgrade to your existing subscription.</p></EnrollmentOfferGate>}
      {!initialBillingReview&&status==='active'&&initialTier!=='free'&&<DowngradeControls tier={initialTier} cancelAtPeriodEnd={cancel} disabled={!!pending} onBusyChange={setDowngradeBusy} onChanged={() => router.refresh()} />}
    </>:regionAllowed?<EnrollmentOfferGate><div className="grid gap-3">{(['visual','hub'] as const).map(product=><Link key={product} href={'/subscribe?product='+product} className={secondaryButton+' block'}><span className="block">{product==='visual'?'Visual · $4.99/month USD':'Hub · $14.99/month USD'}</span><span className="mt-1 block text-xs font-normal text-slate-600">{product==='visual'?'All available visual known-issue models · No trial':'Personal Hub and Visual · 7-day trial for eligible first-time subscribers'}</span></Link>)}</div></EnrollmentOfferGate>:<p className="text-sm text-slate-600">New paid plans are available in the US only. Your account and existing billing controls remain available.</p>}
    {message&&<p role="status" className="mt-3 text-sm text-green-700">{message}</p>}{error&&<p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
  </section>;
}
