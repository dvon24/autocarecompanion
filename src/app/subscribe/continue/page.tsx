import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { entitlementSelect, productEntitlements, publicEnrollmentEnabled } from '@/lib/product-entitlements';
import { enrollmentRegionMessage } from '@/lib/pricing/region';
import { getBillingEnrollmentReview } from '@/lib/billing-enrollment-review';
import { getSelectedEnrollment, hasCompletedEnrollmentHistory, needsEnrollmentCompletion, SELECTED_CHECKOUT_PATH } from '@/lib/selected-enrollment';
import { enrollmentContinuation } from '@/lib/visual-return-destination';
import { EnrollmentCompletion } from '@/components/account/EnrollmentCompletion';
import { reservationEmailWhere } from '@/lib/reservation-email-lock';
import { reservationOfferEligible } from '@/lib/reservation-offer-summary';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Complete your Visual subscription · Au7o', robots: { index: false, follow: false } };
export default async function SelectedCheckoutPage() {
  const session = await auth();
  if (!session?.user?.id) redirect(`/auth/signin?callbackUrl=${encodeURIComponent(SELECTED_CHECKOUT_PATH)}`);
  const account = await prisma.user.findUnique({ where: { id: session.user.id }, select: {
    ...entitlementSelect, id: true, createdAt: true, enrollmentProduct: true, enrollmentVehicleId: true,
  } });
  if (!account) redirect('/auth/signin');
  const selected = await getSelectedEnrollment(prisma, account);
  if (!selected) redirect('/account');
  const review = await getBillingEnrollmentReview(prisma, account.id, account.subscriptionId);
  if (review?.state === 'review_required') redirect('/account');
  if (productEntitlements(account).visual && selected.product === 'visual') redirect(selected.returnTo);
  const reservations = await prisma.reservation.findMany({ where: await reservationEmailWhere(prisma, account.email) });
  if (!needsEnrollmentCompletion(account, { initialVerified: review?.initialVerified,
    establishedHistory: await hasCompletedEnrollmentHistory(prisma, account.id), hasReservationOffer: reservations.some(reservationOfferEligible),
  })) redirect('/account');
  if (selected.product === 'hub') redirect(enrollmentContinuation('hub', selected.vehicleId));
  const h = await headers();
  const unavailable = !publicEnrollmentEnabled() ? 'New subscriptions are currently closed. Your account and privacy controls remain available.'
    : (h.get('user-agent') || '').includes('Au7oApp') ? 'Complete your subscription in a web browser. In-app purchases are not available here.'
    : enrollmentRegionMessage(h.get('x-vercel-ip-country'));
  return <EnrollmentCompletion email={account.email} {...selected} autoOpen unavailable={unavailable}
    paymentPending={account.subscriptionId ? !['canceled', 'incomplete_expired'].includes(account.subscriptionStatus || '') : ['complete', 'billing_review'].includes(selected.attemptState || '')} />;
}
