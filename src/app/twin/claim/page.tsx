import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { TwinClaimCard } from '@/components/twin/TwinClaimCard';

export const dynamic = 'force-dynamic';

export default async function TwinClaimPage() {
  const session = await auth();
  if (!session?.user?.email) redirect('/auth/signin?callbackUrl=/twin/claim');

  const [reservation, currentTimeRows] = await Promise.all([
    prisma.reservation.findUnique({
      where: { email: session.user.email.trim().toLowerCase() },
      select: {
        vehicle: true,
        twinStatus: true,
        trialDays: true,
        claimedAt: true,
      },
    }),
    prisma.$queryRaw<Array<{ now: Date }>>`SELECT CURRENT_TIMESTAMP AS "now"`,
  ]);
  const now = currentTimeRows[0]?.now.getTime() ?? Number.POSITIVE_INFINITY;

  const ready = reservation
    && ['ready', 'claimed'].includes(reservation.twinStatus)
    && [7, 30].includes(reservation.trialDays ?? 0)
    && !(reservation.twinStatus === 'claimed' && reservation.claimedAt && (
      reservation.claimedAt.getTime() + (reservation.trialDays ?? 0) * 86_400_000 <= now
    ));
  const expired = Boolean(
    reservation?.twinStatus === 'claimed'
    && reservation.claimedAt
    && reservation.trialDays
    && reservation.claimedAt.getTime() + reservation.trialDays * 86_400_000 <= now,
  );

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#F7F6F2', fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)' }}>
      {ready ? (
        <TwinClaimCard
          vehicle={reservation.vehicle || 'Your vehicle'}
          trialDays={reservation.trialDays as number}
        />
      ) : (
        <div style={{ maxWidth: 560, padding: 28, borderRadius: 20, border: '1px solid #DCE3EA', background: '#fff', textAlign: 'center' }}>
          <h1 style={{ color: '#0B1220', fontSize: 28, fontWeight: 650 }}>{expired ? 'Your beta access has ended' : 'Your twin is still being prepared'}</h1>
          <p style={{ marginTop: 12, color: '#52606D', lineHeight: 1.65 }}>{expired ? 'Your original beta period is complete. Your garage and maintenance history are unchanged; contact Au7o if you would like to continue testing the twin.' : 'We will use the exact reservation email on this account to make the offer appear here when its vehicle and fitment review are ready.'}</p>
          <Link href="/garage" style={{ display: 'inline-block', marginTop: 18, color: '#2563EB', fontWeight: 650 }}>Go to my garage</Link>
        </div>
      )}
    </main>
  );
}
