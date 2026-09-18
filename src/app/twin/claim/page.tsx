import { TwinClaimStatus } from '@/components/twin/TwinClaimStatus';
import { ReservationOffers } from '@/components/twin/ReservationOffers';
import { reservationClaimHref, reservationOfferId } from '@/lib/reservation-identity';
import { signinHref } from '@/lib/auth-callback';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { TwinClaimCard } from '@/components/twin/TwinClaimCard';
import { loadTwinClaimPageOutcome } from '@/lib/twin-claim-page-loader';

export const dynamic='force-dynamic';

export default async function TwinClaimPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
  const params=await searchParams;
  const outcome=await loadTwinClaimPageOutcome(await auth(),{prisma,reservationId:params.reservationId});
  if(outcome.kind==='sign-in')redirect(signinHref(reservationClaimHref(reservationOfferId(params.reservationId))));
  if(outcome.kind==='redirect-owner')redirect(outcome.href);
  if(outcome.kind==='choose')return <main style={{minHeight:'100vh',padding:'48px 20px',background:'#F7F6F2'}}><div style={{maxWidth:1000,margin:'auto'}}><ReservationOffers reservations={outcome.reservations} chooser/></div></main>;
  return <main style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:24,background:'#F7F6F2',fontFamily:'var(--font-geist-sans, system-ui, sans-serif)'}}>
    {outcome.ready?<TwinClaimCard reservationId={outcome.reservationId!} vehicle={outcome.vehicle} transmission={outcome.transmission} trialDays={outcome.trialDays as number} needsMileage={outcome.needsMileage} expectedUpdatedAt={outcome.updatedAt!} equipment={outcome.equipment} vehicleRevision={outcome.vehicleRevision} resumeClaimed={outcome.resumeClaimed}/>:<TwinClaimStatus expired={outcome.expired} reason={outcome.reason} vehicle={outcome.vehicle}/>}
  </main>;
}
