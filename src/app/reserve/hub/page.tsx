import Link from 'next/link';
import { HeroReserveForm } from '@/components/home/HeroReserveForm';
import { headers } from 'next/headers';
import { isAllowedSubscriptionRegion } from '@/lib/pricing/region';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { hubReservationNavigation } from '@/lib/hub-reservation-navigation';

export const metadata = { title: 'Reserve your Au7o Hub', robots: { index: false, follow: true } };

export default async function HubReservationPage({ searchParams }: { searchParams: Promise<{ source?: string; vehicleId?: string; return?: string; intent?: string }> }) {
  const { source: requestedSource, vehicleId, return: requestedReturn, intent } = await searchParams;
  const source = requestedSource === 'hub-demo' ? 'demo' : requestedSource === 'hub-owner' ? 'hub-owner' : 'visual-known-issues';
  const accountReturn = source === 'hub-owner' && requestedReturn === 'account';
  const equipmentRequest = accountReturn && intent === 'equipment';
  const eligible = isAllowedSubscriptionRegion((await headers()).get('x-vercel-ip-country'));
  if (!eligible) return <main className="ki-theme-warm min-h-screen px-5 py-10" style={{background:'#F7F6F2',color:'#172033'}}><div className="mx-auto max-w-2xl">
    <h1 className="text-2xl font-semibold">Hub reservations are available in the US only.</h1>
    <p className="mt-3">You can still explore the free known issues and public vehicle demos.</p>
    <Link href="/known-issues" className="mt-4 inline-block text-blue-600 underline">Browse known issues</Link>
    {source === 'hub-owner' && <Link href="/account" className="mt-4 block text-blue-600 underline">Return to Account</Link>}
  </div></main>;
  let ownerNavigation: ReturnType<typeof hubReservationNavigation> | undefined;
  if (source === 'hub-owner') {
    const session = await auth();
    const vehicle = session?.user?.id && !accountReturn ? await prisma.vehicle.findFirst({
      where: { userId: session.user.id, ...(typeof vehicleId === 'string' && vehicleId ? { id: vehicleId } : {}) },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'desc' }],
      select: { id: true, year: true, make: true, model: true, trim: true },
    }) : null;
    ownerNavigation = hubReservationNavigation(requestedReturn, vehicle);
  }
  return <main className="ki-theme-warm min-h-screen px-5 py-10" style={{background:'#F7F6F2',color:'#172033'}}><div className="mx-auto max-w-2xl">
    <Link href={ownerNavigation?.beforeHref || '/'} className="text-sm text-blue-600 underline">{ownerNavigation?.label || 'Au7o home'}</Link>
    <h1 className="mt-6 text-3xl font-semibold">{equipmentRequest ? 'Request your actual vehicle / configuration' : 'Your car. Your Hub.'}</h1>
    <p className="mt-3 text-sm leading-6 text-slate-600">Reserve your vehicle’s visual twin, maintenance tracking, service records and AI assistance. Hub pricing is $14.99/month when you subscribe. Paid access launches in the US; a reservation does not start billing.</p>
    <div className="mt-6"><HeroReserveForm source={source} ownerReturnHref={ownerNavigation?.href} ownerReturnLabel={ownerNavigation?.label} equipmentRequest={equipmentRequest} ctaLabel="Request a Twin" wide/></div>
    <p className="mt-4 text-xs text-slate-500">This is a Hub reservation, separate from the $4.99 Visual Known Issues launch list.</p>
  </div></main>;
}
