import Link from 'next/link';
import { reservationClaimHref } from '@/lib/reservation-identity';

export interface ReservationOfferSummary {
  eligible?: boolean; id: string; vehicle: string | null; transmission?: string | null; twinStatus: string; trialDays: number | null;
}
export function ReservationOffers({ reservations, chooser = false }: { reservations: ReservationOfferSummary[]; chooser?: boolean }) {
  if (!reservations.length) return null;
  return <section aria-label="Your reserved vehicles" style={{minWidth:0,width:'100%'}}>
    <h2 style={{fontSize:22,margin:'0 0 16px'}}>{chooser ? 'Choose your vehicle offer' : 'Your reserved vehicles'}</h2>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,260px),1fr))',gap:16}}>
      {reservations.map(row => { const actionable = row.eligible === true && [7,30].includes(row.trialDays ?? 0) && ['ready','claimed'].includes(row.twinStatus); return <article key={row.id} style={{minWidth:0,padding:20,border:'1px solid #DCE3EA',borderRadius:16,background:'#fff',overflowWrap:'anywhere'}}>
        <h3 style={{fontSize:18,margin:'0 0 8px'}}>{row.vehicle || 'Vehicle request'}{row.transmission ? ` · ${row.transmission}` : ''}</h3>
        <p style={{color:'#52606D',lineHeight:1.6}}>{actionable
          ? `${row.trialDays}-day complimentary access for this vehicle. No automatic billing.`
          : row.twinStatus === 'canceled' ? 'Canceled by customer. Contact support@au7o.io if you want to request this vehicle again.' : ['ready','claimed'].includes(row.twinStatus) ? 'This vehicle offer needs review before it can be opened.' : row.twinStatus === 'building' ? 'Your vehicle is being reviewed and prepared.' : 'Your request is saved for review.'}</p>
        {actionable && <Link href={reservationClaimHref(row.id)} style={{display:'inline-flex',alignItems:'center',minHeight:48,padding:'8px 12px',border:'1px solid #DCE3EA',borderRadius:10,color:'#1D4ED8',fontWeight:600}}>
          {row.twinStatus === 'claimed' ? 'Open my vehicle offer' : 'Review and activate my vehicle'}
        </Link>}
      </article>; })}
    </div>
  </section>;
}
