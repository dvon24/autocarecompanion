import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { TwinClaimCard } from '@/components/twin/TwinClaimCard';
import { loadTwinClaimPageOutcome } from '@/lib/twin-claim-page-loader';

export const dynamic='force-dynamic';

export default async function TwinClaimPage(){
  const outcome=await loadTwinClaimPageOutcome(await auth(),{prisma});
  if(outcome.kind==='sign-in')redirect('/auth/signin?callbackUrl=/twin/claim');
  if(outcome.kind==='redirect-owner')redirect(outcome.href);
  return <main style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:24,background:'#F7F6F2',fontFamily:'var(--font-geist-sans, system-ui, sans-serif)'}}>
    {outcome.ready?<TwinClaimCard vehicle={outcome.vehicle} trialDays={outcome.trialDays as number}/>:<div style={{maxWidth:560,padding:28,borderRadius:20,border:'1px solid #DCE3EA',background:'#fff',textAlign:'center'}}>
      <h1 style={{margin:'0 0 10px',fontSize:28,color:'#172033'}}>{outcome.expired?'Your beta access has ended':'Your vehicle twin is not ready yet'}</h1>
      <p style={{margin:0,color:'#667085',lineHeight:1.6}}>{outcome.expired?'Thanks for testing the Au7o vehicle twin. We will let you know when the next access window opens.':'We will email you when your exact vehicle twin and beta access window are ready.'}</p>
    </div>}
  </main>;
}
