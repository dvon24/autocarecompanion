import { headers } from 'next/headers';
import { SubscribeClient } from '@/components/subscribe/SubscribeClient';
import { isAllowedSubscriptionRegion } from '@/lib/pricing/region';
import { publicEnrollmentEnabled } from '@/lib/product-entitlements';
import { auth } from '@/lib/auth';
import { PaidSignupClient } from '@/components/subscribe/PaidSignupClient';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { enrollmentContinuation, visualReturnDestination } from '@/lib/visual-return-destination';
import { prisma } from '@/lib/db';
import { getSelectedEnrollment, needsEnrollmentCompletion, hasCompletedEnrollmentHistory, SELECTED_CHECKOUT_PATH } from '@/lib/selected-enrollment';
import { entitlementSelect } from '@/lib/product-entitlements';
import { getBillingEnrollmentReview } from '@/lib/billing-enrollment-review';

/**
 * /subscribe — server entry. Reads Vercel's edge-geo header so the
 * client renders the right state on first paint (no flicker). The
 * actual UI + checkout dispatch is in SubscribeClient.
 *
 * Off-Vercel and unknown geography hide offers, including for owners.
 */
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Pick your plan · Au7o',
  description: 'Visual $4.99/month, no trial. Hub $14.99/month after 7 days free. USD. Cancel anytime.',
  // ?reason= only picks the upsell copy; the plans are identical. Same
  // duplicate-canonical finding as /symptom-chat (GSC, 2026-09-04).
  alternates: {
    canonical: 'https://au7o.io/subscribe',
  },
};

export default async function SubscribePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const h = await headers();
  const country = h.get('x-vercel-ip-country');
  // App-store compliance: the native shell (Au7oApp WebView) must NOT render
  // an in-WebView Stripe checkout — Apple/Google require their own billing
  // for in-app digital purchases. When we detect the app we show a
  // store-safe informational state instead. This is keyed on the UA marker,
  // NOT screen size — a phone *browser* is plain web and Stripe is fine
  // there (that's most of our traffic). `?app=1` previews the app state in
  // a normal browser so it's testable on a phone without the build.
  const ua = h.get('user-agent') || '';
  const sp = await searchParams;
  const appMode = ua.includes('Au7oApp') || sp.app === '1';
  if (!publicEnrollmentEnabled()) return <main className="mx-auto max-w-xl p-6 py-16"><h1 className="text-2xl">New subscriptions are currently closed.</h1><p className="my-4">Existing members can manage their account and cancellation.</p><Link href="/account">Open Account</Link></main>;
  if (isAllowedSubscriptionRegion(country) && !appMode) {
    const session = await auth();
    if (sp.product === 'visual' && session?.user?.capabilities?.visual) redirect(visualReturnDestination(sp.returnTo));
    let selectedProduct: 'hub' | undefined;
    if (session?.user?.id) {
      const account = await prisma.user.findUnique({ where: { id: session.user.id }, select: { ...entitlementSelect, id: true, createdAt: true, enrollmentProduct: true, enrollmentVehicleId: true } });
      if (account?.enrollmentProduct) {
        const review = await getBillingEnrollmentReview(prisma, session.user.id, account.subscriptionId);
        if (needsEnrollmentCompletion(account, { initialVerified: review?.initialVerified, establishedHistory: await hasCompletedEnrollmentHistory(prisma, session.user.id) })) {
          const selected = await getSelectedEnrollment(prisma, account);
          if (selected && (!sp.product || selected.attemptState || sp.product === account.enrollmentProduct)) {
            if (selected.product === 'visual') redirect(SELECTED_CHECKOUT_PATH);
            if (sp.product !== 'hub' || (selected.vehicleId && sp.vehicleId !== selected.vehicleId)) redirect(enrollmentContinuation('hub', selected.vehicleId));
            selectedProduct = 'hub';
          }
        }
      }
    }
    return <PaidSignupClient selectedProduct={selectedProduct} authenticated={!!session?.user?.id} currentProduct={session?.user?.subscriptionTier ?? null} currentStatus={session?.user?.subscriptionStatus ?? null} hasSubscriptionHistory={!!session?.user?.hasSubscriptionHistory} />;
  }
  return (
    <SubscribeClient
      country={country}
      regionAllowed={isAllowedSubscriptionRegion(country)}
      appMode={appMode}
    />
  );
}
