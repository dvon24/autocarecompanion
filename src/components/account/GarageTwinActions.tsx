'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HubAddVehicleModal } from '@/components/twin/hub/HubAddVehicleModal';
import { EnrollmentOfferGate } from '@/components/auth/EnrollmentOfferGate';

/** Account uses the same exact-build picker and save reconciliation as the Hub. */
export function GarageTwinActions({ onVehicleAdded }: { onVehicleAdded?: () => void } = {}) {
  const router = useRouter();
  const trigger = useRef<HTMLButtonElement>(null);
  const [adding, setAdding] = useState(false);
  return <div className="ki-theme-warm" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, minWidth: 0 }}>
    <button ref={trigger} type="button" onClick={() => setAdding(true)}
      style={{ minHeight: 44, border: 0, borderRadius: 9, padding: '10px 14px', fontSize: 13, fontWeight: 650, color: '#fff', background: '#2563EB', cursor: 'pointer' }}>
      Add vehicle
    </button>
    <EnrollmentOfferGate fallback={<span style={{fontSize:12,color:'#475569',maxWidth:230}}>Twin requests are currently available in the US only. Your saved vehicles stay available.</span>}><Link href="/reserve/hub?source=hub-owner&return=account"
      style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44, padding: '10px 4px', fontSize: 13, fontWeight: 650, color: '#2563EB', textDecoration: 'underline' }}>
      Request a Twin
    </Link></EnrollmentOfferGate>
    {adding && <HubAddVehicleModal successDestination="account" returnFocusTo={trigger.current}
      onClose={() => setAdding(false)} onVehicleAdded={() => { router.refresh(); onVehicleAdded?.(); }} />}
  </div>;
}
