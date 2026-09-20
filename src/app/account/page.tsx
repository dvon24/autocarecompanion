import { reservationOfferEligible } from '@/lib/reservation-offer-summary';
import { ReservationOffers } from '@/components/twin/ReservationOffers';
import { reservationEmailWhere } from '@/lib/reservation-email-lock';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';
import { PageLayout } from '@/components/ui/PageLayout';
import AccountPrivacyActions from '@/components/account/AccountPrivacyActions';
import SubscriptionControls from '@/components/account/SubscriptionControls';
import SecondaryEmailEditor from '@/components/account/SecondaryEmailEditor';
import { AccountShell } from '@/components/account/AccountShell';
import { AcctCard } from '@/components/account/AcctCard';
import { GarageSummary } from '@/components/account/GarageSummary';
import { GarageTwinActions } from '@/components/account/GarageTwinActions';
import { RecentDiagnoses } from '@/components/account/RecentDiagnoses';
import { RecentChats } from '@/components/account/RecentChats';
import MobileSignOut from '@/components/account/MobileSignOut';
import { Icon } from '@/components/ui/Icon';
import { getStripe } from '@/lib/stripe';
import { vehicleSlug } from '@/lib/vehicle-slug';
import { resolveTier } from '@/lib/pricing/tiers';
import { SiteFooter } from '@/components/shared/SiteFooter';
import { headers } from 'next/headers';
import { isAllowedSubscriptionRegion } from '@/lib/pricing/region';
import { productEntitlements, entitlementSelect, publicEnrollmentEnabled } from '@/lib/product-entitlements';
import { getBillingEnrollmentReview } from '@/lib/billing-enrollment-review';
import { getSelectedEnrollment, hasCompletedEnrollmentHistory, needsEnrollmentCompletion } from '@/lib/selected-enrollment';
import { EnrollmentCompletion } from '@/components/account/EnrollmentCompletion';
import { enrollmentContinuation } from '@/lib/visual-return-destination';
import { enrollmentRegionMessage } from '@/lib/pricing/region';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Account',
  description: 'Your Au7o account, chat history, and vehicle insights.',
};

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/auth/signin?callbackUrl=/account');
  }

  const userId = session.user.id;

  // Paid offers share the strict US gate; account access and cancellation
  // remain available worldwide, including for owners traveling abroad.
  const h = await headers();
  const country = h.get('x-vercel-ip-country');
  const regionAllowed = isAllowedSubscriptionRegion(country);

  // Subscription state — same load-bearing logic as before. The Stripe
  // round-trip for cancel_at_period_end / current_period_end is wrapped
  // in try/catch so a Stripe outage doesn't blank the section.
  const userSubInfo = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      ...entitlementSelect,
      subscriptionId: true,
      subscriptionStatus: true,
      subscriptionTier: true,
      secondaryEmail: true,
      id: true,
      createdAt: true,
      enrollmentProduct: true,
      enrollmentVehicleId: true,
    },
  });
  const hasStripeSub = !!userSubInfo?.subscriptionId;
  const enrollmentReview = await getBillingEnrollmentReview(prisma, userId, userSubInfo?.subscriptionId);
  const billingReview = enrollmentReview?.state === 'review_required';
  const effectiveStatus = hasStripeSub ? userSubInfo?.subscriptionStatus ?? null : null;
  const effectiveTier = hasStripeSub ? userSubInfo?.subscriptionTier ?? null : null;
  const resolvedTier = resolveTier(effectiveStatus, effectiveTier);
  const capabilities = productEntitlements(userSubInfo);
  let subCancelAtPeriodEnd = false;
  let subCurrentPeriodEnd: number | null = null;
  if (
    hasStripeSub &&
    (effectiveStatus === 'active' ||
      effectiveStatus === 'trialing' ||
      effectiveStatus === 'past_due')
  ) {
    try {
      const sub = await getStripe().subscriptions.retrieve(userSubInfo!.subscriptionId!);
      subCancelAtPeriodEnd = !!sub.cancel_at_period_end;
      subCurrentPeriodEnd = sub.items?.data?.[0]?.current_period_end ?? null;
    } catch {
      // Stripe unavailable — render the controls without period info.
    }
  }

  const reservations = session.user.email ? await prisma.reservation.findMany({ where: await reservationEmailWhere(prisma,session.user.email), orderBy: [{createdAt:'asc'},{id:'asc'}], select: { id:true, transmission:true, twinStatus: true, vehicle: true, trialDays: true, country:true,year:true,make:true,model:true,trim:true,vehicleVerified:true,trimVerified:true,assignedTwin:true,claimedAt:true } }) : [];
  if (userSubInfo && needsEnrollmentCompletion(userSubInfo, {
    initialVerified: enrollmentReview?.initialVerified,
    hasReservationOffer: reservations.some(reservationOfferEligible),
    establishedHistory: !capabilities.visual && !!userSubInfo.enrollmentProduct && await hasCompletedEnrollmentHistory(prisma, userId),
  })) {
    const selected = await getSelectedEnrollment(prisma, userSubInfo);
    if (selected) {
      const unavailable = billingReview ? 'Your billing needs review. Use the billing controls below or contact support before another checkout.'
        : !publicEnrollmentEnabled() ? 'New subscriptions are currently closed. Your account and privacy controls remain available.'
        : (h.get('user-agent') || '').includes('Au7oApp') ? 'Complete your subscription in a web browser. In-app purchases are not available here.'
        : enrollmentRegionMessage(country);
      return <EnrollmentCompletion email={userSubInfo.email} {...selected} unavailable={unavailable}
        hubHref={enrollmentContinuation('hub', selected.vehicleId)}
        paymentPending={hasStripeSub ? !['canceled', 'incomplete_expired'].includes(effectiveStatus || '') : ['complete', 'billing_review'].includes(selected.attemptState || '')}
        billingControls={hasStripeSub || billingReview ? <SubscriptionControls initialBillingReview={billingReview} initialTier={resolvedTier} initialStatus={effectiveStatus} initialCancelAtPeriodEnd={subCancelAtPeriodEnd} initialCurrentPeriodEnd={subCurrentPeriodEnd} regionAllowed={regionAllowed} country={country} frameless /> : undefined} />;
    }
  }
  if (!capabilities.hub) {
    return <PageLayout backLink={{ href: '/?home=1', label: 'Home' }} showBackground={false} contentClassName="bg-[#F7F6F2]">
      <AccountShell accountOnly><div className="grid min-w-0 gap-4 md:grid-cols-2">
        <AcctCard title={capabilities.visual ? 'Your Visual access' : 'Your account'}><p className="text-sm leading-relaxed text-slate-600">{capabilities.visual ? 'Explore every available visual known-issue model. Your plan does not include a personal Hub, maintenance tracking or AI chat.' : 'Your verified account is ready. Choose a plan or activate the vehicle offer prepared for you.'}</p><div className="mt-4 flex flex-wrap gap-3">
          <Link href={capabilities.visual ? '/visual' : '/known-issues/cadillac-xt6?year=2020&twinPilot=1'} className="rounded-xl border border-[#E3DFD4] bg-white px-4 py-3 text-sm font-semibold text-[#0B1220] hover:bg-[#EFEDE6]">{capabilities.visual ? 'Open Visual library' : 'Preview Visual Known Issues'}</Link>
          <Link href="/demo/hub?vehicle=xt6" className="rounded-xl border border-[#E3DFD4] bg-white px-4 py-3 text-sm font-semibold text-[#0B1220] hover:bg-[#EFEDE6]">Test the Hub · Free demo</Link>
          {!billingReview && regionAllowed && publicEnrollmentEnabled() && (!hasStripeSub || (effectiveStatus === 'active' && !subCancelAtPeriodEnd)) && <Link href="/subscribe?product=hub" className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white">{capabilities.visual ? 'Upgrade to Hub' : 'Explore Hub'}</Link>}
        </div></AcctCard>
        <AcctCard title="Subscription"><SubscriptionControls initialBillingReview={billingReview} initialTier={resolvedTier} initialStatus={effectiveStatus} initialCancelAtPeriodEnd={subCancelAtPeriodEnd} initialCurrentPeriodEnd={subCurrentPeriodEnd} regionAllowed={regionAllowed} country={country} frameless /></AcctCard>
        <div className="min-w-0 md:col-span-2"><ReservationOffers reservations={reservations.map(row=>({...row,eligible:reservationOfferEligible(row)}))}/></div>
        <AcctCard title="Emails"><SecondaryEmailEditor loginEmail={session.user.email ?? ''} initialSecondary={userSubInfo?.secondaryEmail ?? null} frameless /></AcctCard>
        <AcctCard title="Privacy & Data"><AccountPrivacyActions email={session.user.email ?? ''} frameless /></AcctCard>
        <MobileSignOut />
      </div></AccountShell><SiteFooter />
    </PageLayout>;
  }

  const [chats, diagnoses, vehicles] = await Promise.all([
    prisma.chatSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, messages: true, diagnosis: true, createdAt: true, vehicleId: true },
    }),
    prisma.vehicleInsight.findMany({
      where: { userId, insightType: 'diagnosis' },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, year: true, make: true, model: true, title: true, confidence: true, createdAt: true },
    }),
    prisma.vehicle.findMany({
      where: { userId },
      // Match the ordering every other surface uses (garage, home,
      // onboarding, hub) so the PRIMARY pill labels the SAME vehicle
      // here as everywhere else — the real isPrimary flag first, then
      // most-recently-updated as the tiebreaker.
      orderBy: [{ isPrimary: 'desc' }, { updatedAt: 'desc' }],
      take: 6,
      select: { id: true, year: true, make: true, model: true, trim: true, nickname: true, isPrimary: true },
    }),
  ]);

  // RecentChats links each row to the owning vehicle's hub (preserving
  // the same handoff used by VehicleHub's "Recent threads" list). Build
  // a {vehicleId -> slug} lookup from the garage vehicles so we only
  // produce links for vehicles still in the user's garage.
  const vehicleSlugById: Record<string, string> = {};
  for (const v of vehicles) {
    vehicleSlugById[v.id] = vehicleSlug(v.year, v.make, v.model, v.trim);
  }

  return (
    <PageLayout
      backLink={{ href: '/?home=1', label: 'Home' }}
      showBackground={false}
      contentClassName="bg-[#F7F6F2]"
    >
      <AccountShell>
        <div className="mb-4"><ReservationOffers reservations={reservations.map(row=>({...row,eligible:reservationOfferEligible(row)}))}/></div>
        {/*
          Two columns that pack INDEPENDENTLY on desktop — main (garage,
          diagnoses, chats, privacy) and a right rail (subscription,
          emails). Each column is its own flex stack inside a 2-col grid,
          so a tall Subscription card never leaves a gap under the short
          Garage card (the bug a shared grid-row layout would create).

          On mobile the two wrappers become `display: contents`, which
          promotes all the cards to flex items of `.acct-grid` so `order`
          can interleave them into the BMAD mobile sequence: garage →
          subscription → diagnoses → chats → emails → privacy → sign out.
        */}
        <style>{`
          .acct-grid { display: flex; flex-direction: column; gap: 16px; min-width: 0; max-width: 100%; }
          .acct-col-main, .acct-col-rail { display: contents; }
          .acct-grid > *, .acct-col-main > *, .acct-col-rail > * { min-width: 0; max-width: 100%; }
          .acct-card--garage       { order: 1; }
          .acct-card--subscription { order: 2; }
          .acct-card--diagnoses    { order: 3; }
          .acct-card--chats        { order: 4; }
          .acct-card--emails       { order: 5; }
          .acct-card--privacy      { order: 6; }
          .acct-card--signout      { order: 7; }
          @media (min-width: 900px) {
            .acct-grid {
              display: grid;
              grid-template-columns: minmax(0, 1fr) minmax(0, 340px);
              gap: 22px;
              align-items: start;
            }
            .acct-col-main, .acct-col-rail {
              display: flex;
              flex-direction: column;
              gap: 18px;
              min-width: 0;
            }
            .acct-col-rail { position: sticky; top: 16px; }
          }
        `}</style>
        <div className="acct-grid">
          <div className="acct-col-main">
            <div className="acct-card--garage">
              <AcctCard
                title="My Garage"
                action={<GarageTwinActions />}
              >
                <GarageSummary vehicles={vehicles} columns={2} />
              </AcctCard>
            </div>

            <div className="acct-card--diagnoses">
              <AcctCard title="Recent Diagnoses">
                <RecentDiagnoses diagnoses={diagnoses} formatAgo={timeAgo} />
              </AcctCard>
            </div>

            <div className="acct-card--chats">
              <AcctCard title="Recent Chats">
                <RecentChats
                  chats={chats}
                  vehicleSlugById={vehicleSlugById}
                  formatAgo={timeAgo}
                />
              </AcctCard>
            </div>

            <div className="acct-card--privacy">
              <AcctCard title="Privacy & Data">
                <AccountPrivacyActions
                  email={session.user.email ?? ''}
                  frameless
                />
              </AcctCard>
            </div>
          </div>

          <div className="acct-col-rail">
            <div className="acct-card--subscription">
              <AcctCard title="Subscription">
                <SubscriptionControls
                  initialBillingReview={billingReview}
                  initialTier={resolvedTier}
                  initialStatus={effectiveStatus}
                  initialCancelAtPeriodEnd={subCancelAtPeriodEnd}
                  initialCurrentPeriodEnd={subCurrentPeriodEnd}
                  regionAllowed={regionAllowed}
                  country={country}
                  frameless
                />
              </AcctCard>
            </div>

            <div className="acct-card--emails">
              <AcctCard title="Emails">
                <SecondaryEmailEditor
                  loginEmail={session.user.email ?? ''}
                  initialSecondary={userSubInfo?.secondaryEmail ?? null}
                  frameless
                />
              </AcctCard>
            </div>

            <div className="acct-card--signout">
              <MobileSignOut />
            </div>
          </div>
        </div>
      </AccountShell>

      {/* Same footer the home page and known-issues pages use, so the
          bottom of every page reads identically. Full-width, sits below
          the paper content area. */}
      <SiteFooter />
    </PageLayout>
  );
}
