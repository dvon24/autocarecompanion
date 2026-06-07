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

  // Same geo gate as /subscribe — paid plan changes are US-only for now
  // (VAT/GST + state sales-tax registration pending). Free users outside
  // the US see a notice + grayed CTAs instead of clickable Plus/Pro tiles.
  // Founder + ops emails (see SUBSCRIPTION_REGION_BYPASS_EMAILS) bypass
  // the gate so they can QA the flow from anywhere.
  const h = await headers();
  const country = h.get('x-vercel-ip-country');
  const regionAllowed = isAllowedSubscriptionRegion(country, session.user.email);

  // Subscription state — same load-bearing logic as before. The Stripe
  // round-trip for cancel_at_period_end / current_period_end is wrapped
  // in try/catch so a Stripe outage doesn't blank the section.
  const userSubInfo = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionId: true,
      subscriptionStatus: true,
      subscriptionTier: true,
      secondaryEmail: true,
    },
  });
  const hasStripeSub = !!userSubInfo?.subscriptionId;
  const effectiveStatus = hasStripeSub ? userSubInfo?.subscriptionStatus ?? null : null;
  const effectiveTier = hasStripeSub ? userSubInfo?.subscriptionTier ?? null : null;
  const resolvedTier = resolveTier(effectiveStatus, effectiveTier);
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
      backLink={{ href: '/', label: 'Home' }}
      showBackground={false}
      contentClassName="bg-[#F7F6F2]"
    >
      <AccountShell>
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
          .acct-grid { display: flex; flex-direction: column; gap: 16px; }
          .acct-col-main, .acct-col-rail { display: contents; }
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
              grid-template-columns: 1fr 340px;
              gap: 22px;
              align-items: start;
            }
            .acct-col-main, .acct-col-rail {
              display: flex;
              flex-direction: column;
              gap: 18px;
            }
            .acct-col-rail { position: sticky; top: 16px; }
            .acct-card--signout { display: none; }
          }
        `}</style>
        <div className="acct-grid">
          <div className="acct-col-main">
            <div className="acct-card--garage">
              <AcctCard
                title="My Garage"
                action={
                  <Link
                    href="/garage"
                    className="text-[12.5px] text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1"
                  >
                    Manage <Icon name="chevron" size={11} />
                  </Link>
                }
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

            {/* Mobile-only sign out button. Desktop relies on the
                top-nav UserMenu / FloatingAuthButton. */}
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
