'use client';

import Link from 'next/link';
import { EnrollmentOfferGate } from '@/components/auth/EnrollmentOfferGate';
import { useTwinMode, useTwinOwnerActions } from '@/components/twin/twin-context';

/** Request an unbuilt vehicle in either Hub mode; eligibility is server-checked. */
export function HubDemoReservation() {
  const mode = useTwinMode();
  const owner = useTwinOwnerActions() as { vehicleId?: string } | null;
  if (mode !== 'demo' && mode !== 'owner') return null;
  return <EnrollmentOfferGate>
    <div data-demo-reservation style={{ marginTop: 10, flexShrink: 0 }}>
      <Link href={`/reserve/hub?source=${mode === 'owner' ? 'hub-owner' : 'hub-demo'}${mode === 'owner' && owner?.vehicleId ? `&vehicleId=${encodeURIComponent(owner.vehicleId)}` : ''}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 44, padding: '9px 12px', borderRadius: 12, background: 'var(--ink)', color: 'var(--ki-card)', fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 650, textAlign: 'center', textDecoration: 'none' }}>{mode === 'owner' ? 'Request another vehicle’s Twin' : 'Reserve your vehicle’s Twin'}</Link>
      <p style={{ margin: '5px 0 0', fontSize: 10.5, lineHeight: 1.4, color: 'var(--slate-500)', textAlign: 'center' }}>{mode === 'owner' ? 'Can’t find your other car? Request its Twin. No charge.' : 'For your own vehicle. No charge to reserve.'}</p>
    </div>
  </EnrollmentOfferGate>;
}
