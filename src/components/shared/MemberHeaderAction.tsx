'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { EnrollmentOfferGate } from '@/components/auth/EnrollmentOfferGate';

/** Member return navigation also works on cached public article pages. */
export function MemberHeaderAction({ fallbackHref, fallbackLabel, fallbackShortLabel, enrollment = false }: {
  fallbackHref: string; fallbackLabel: string; fallbackShortLabel?: string; enrollment?: boolean;
}) {
  const { data: session } = useSession();
  const member = !!session?.user;
  const hasHub = session?.user?.capabilities?.hub === true;
  const action = <Link href={member ? hasHub ? '/garage' : '/account' : fallbackHref}
    className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#0B1220] px-4 py-2 text-sm font-semibold text-white"
    style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}>
    {member ? hasHub ? 'My Hub' : 'Account' : fallbackShortLabel ? <><span className="cta-label-full">{fallbackLabel}</span><span className="cta-label-short">{fallbackShortLabel}</span></> : fallbackLabel}
  </Link>;
  return !member && enrollment ? <EnrollmentOfferGate>{action}</EnrollmentOfferGate> : action;
}
