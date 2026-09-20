import { VerifiedSignupForm } from '@/components/auth/VerifiedSignupForm';
import { prisma } from '@/lib/db';
import { enrollmentTokenHash } from '@/lib/account-enrollment';
import { headers } from 'next/headers';
import Link from 'next/link';
import { publicEnrollmentEnabled } from '@/lib/product-entitlements';
import { enrollmentRegionMessage } from '@/lib/pricing/region';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Verify your Au7o email', robots: { index: false, follow: false }, referrer: 'no-referrer' as const };
export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const h = await headers();
  const unavailable = !publicEnrollmentEnabled() ? 'New account signup is currently closed. Existing members can sign in to manage their account.' : enrollmentRegionMessage(h.get('x-vercel-ip-country'));
  if (unavailable) return <main className="mx-auto max-w-lg p-6 py-16"><h1>{unavailable}</h1><Link href="/auth/signin">Existing members can sign in</Link></main>;
  const params = await searchParams;
  const token = typeof params.token === 'string' ? params.token : undefined;
  const lookup = token && /^[a-f0-9]{64}$/.test(token) ? await prisma.accountEnrollment.findUnique({ where: { tokenHash: enrollmentTokenHash(token) }, select: { product: true, intent: true, vehicleId: true, returnTo: true, expiresAt: true, usedAt: true } }).then(row => ({ row, failed: false })).catch(() => ({ row: null, failed: true })) : { row: null, failed: false };
  if (lookup.failed) return <main className="mx-auto max-w-lg p-6 py-16 text-slate-900"><h1 className="text-2xl">Verification is temporarily unavailable</h1><p className="my-4">Your link may still be valid. Retry this page in a moment to keep your original plan and vehicle selection.</p><a className="inline-flex min-h-11 items-center text-blue-700 underline" href={`/auth/verify?token=${token}`}>Try verification again</a></main>;
  const row = lookup.row;
  const invalidLink = !row || !!row.usedAt || row.expiresAt <= new Date();
  return <VerifiedSignupForm token={token} invalidLink={invalidLink} preview={process.env.NODE_ENV === 'development'} product={row?.product === 'hub' ? 'hub' : 'visual'} intent={row?.intent === 'reservation' ? 'reservation' : undefined} reservationId={row?.intent === 'reservation' ? row.vehicleId ?? undefined : undefined} vehicleId={row?.intent !== 'reservation' ? row?.vehicleId ?? undefined : undefined} returnTo={row?.returnTo ?? undefined} />;
}
