import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';
import { OnboardingClient } from '@/components/onboarding/OnboardingClient';
import { parseStep, ONBOARDING_DESTINATIONS } from '@/lib/onboarding/state';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Welcome to Au7o',
  description: "Set up Au7o — your car's co-pilot.",
};

/**
 * /onboarding — first-run welcome flow.
 *
 * Server-side guard:
 *   - Anonymous visitor → bounce to /auth/signin?callbackUrl=/onboarding
 *     (we want them signed in BEFORE we walk them through onboarding so
 *     the "add my vehicle" step writes to a real user).
 *   - Already-completed user → bounce to their primary vehicle if they
 *     have one, otherwise /garage. Idempotent so re-visiting /onboarding
 *     can't double-show.
 *   - First-time user → render the OnboardingClient with their existing
 *     vehicle count so step 3 can fast-forward when they already have
 *     a car saved.
 *
 * The step is in the URL (?step=1|2|3) so refresh + back-button work,
 * the user can be linked to a specific step, and analytics can hook
 * the step transitions trivially.
 */
export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string }>;
}) {
  const session = await auth().catch(() => null);
  if (!session?.user?.id) {
    redirect('/auth/signin?callbackUrl=/onboarding');
  }
  const userId = session.user.id;

  const [user, vehicleCount, primary] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { onboardingCompletedAt: true, name: true, email: true },
    }),
    prisma.vehicle.count({ where: { userId } }),
    prisma.vehicle.findFirst({
      where: { userId },
      orderBy: [{ isPrimary: 'desc' }, { updatedAt: 'desc' }],
      select: { year: true, make: true, model: true, trim: true },
    }),
  ]);

  if (!user) redirect('/auth/signin');

  // Already-completed users skip the flow. If they have a vehicle we
  // route them into its hub; otherwise the garage page.
  if (user.onboardingCompletedAt) {
    if (primary) {
      const slug = `${primary.year}-${primary.make}-${primary.model}${primary.trim ? '-' + primary.trim : ''}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      redirect(ONBOARDING_DESTINATIONS.finishedWithVehicle(slug));
    }
    redirect(ONBOARDING_DESTINATIONS.finishedNoVehicle);
  }

  const params = await searchParams;
  const step = parseStep(params.step ?? '1');

  // OnboardingClient calls useSearchParams(), which in Next.js App Router
  // requires a <Suspense> boundary — without it the route blanks out for
  // a freshly-signed-up user landing here (the founder is server-redirected
  // away above before this ever renders, which is why the bug was invisible
  // in dev/owner testing). Every other useSearchParams() page in this app
  // (signin, signup, reset-password, error) wraps it the same way.
  return (
    <Suspense fallback={null}>
      <OnboardingClient
        step={step}
        userName={user.name || (user.email ? user.email.split('@')[0] : 'there')}
        hasVehicle={vehicleCount > 0}
      />
    </Suspense>
  );
}
