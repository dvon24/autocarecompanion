import { reservationClaimHref, reservationOfferId } from '@/lib/reservation-identity';
import { headers } from 'next/headers';
import Link from 'next/link';
import { VerifiedSignupForm } from '@/components/auth/VerifiedSignupForm';
import { publicEnrollmentEnabled } from '@/lib/product-entitlements';
import { enrollmentRegionMessage } from '@/lib/pricing/region';
import { enrollmentContinuation } from '@/lib/visual-return-destination';
export const dynamic = 'force-dynamic';
export default async function SignUpPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const h = await headers(); const params = await searchParams;
  const unavailable = !publicEnrollmentEnabled() ? 'New account signup is currently closed. Existing members can sign in to manage their account.' : enrollmentRegionMessage(h.get('x-vercel-ip-country'));
  const continuation = params.intent === 'reservation' ? reservationClaimHref(reservationOfferId(params.reservationId)) : enrollmentContinuation(params.product === 'hub' ? 'hub' : 'visual', typeof params.vehicleId === 'string' ? params.vehicleId : undefined, typeof params.returnTo === 'string' ? params.returnTo : undefined);
  if (unavailable) return <main className="mx-auto max-w-lg p-6 py-16"><h1 className="text-2xl">New accounts are currently unavailable here.</h1><p className="my-4">{unavailable}</p><Link href={`/auth/signin?callbackUrl=${encodeURIComponent(continuation)}`} className="text-blue-600 underline">Sign in</Link></main>;
  return <VerifiedSignupForm preview={process.env.NODE_ENV === 'development'} returnTo={typeof params.returnTo === 'string' ? params.returnTo : undefined} reservationId={reservationOfferId(params.reservationId) ?? undefined} product={params.product === 'hub' ? 'hub' : 'visual'} vehicleId={typeof params.vehicleId === 'string' ? params.vehicleId : undefined} intent={params.intent === 'reservation' ? 'reservation' : undefined} />;
}
