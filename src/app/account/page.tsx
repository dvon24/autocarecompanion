import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';
import { PageLayout } from '@/components/ui/PageLayout';
import AccountPrivacyActions from '@/components/account/AccountPrivacyActions';
import SubscriptionControls from '@/components/account/SubscriptionControls';
import SecondaryEmailEditor from '@/components/account/SecondaryEmailEditor';
import { getStripe } from '@/lib/stripe';
import { vehicleSlug } from '@/lib/vehicle-slug';
import { resolveTier } from '@/lib/pricing/tiers';
import { SiteMapSection } from '@/components/shared/SiteMapSection';
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

interface ChatMessagePreview {
  role: string;
  content: string;
  timestamp?: string;
}

interface DiagnosisPreview {
  title?: string;
  confidence?: string;
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

  // Pull subscriptionId + status for the cancel/reactivate UI. The
  // status column is kept in sync by the Stripe webhook, but we
  // re-fetch cancel_at_period_end + current_period_end live from
  // Stripe so the user sees the truth — the webhook lags by seconds
  // and we don't store these fields locally.
  const userSubInfo = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionId: true, subscriptionStatus: true, subscriptionTier: true, secondaryEmail: true },
  });
  // Phantom-sub guard: a row can carry a paid status without an actual
  // Stripe subscriptionId (legacy backfill, manual Stripe delete with
  // no webhook delivery, etc.). Treat those as Free everywhere — never
  // surface a "Cancel subscription" button when there's nothing real to
  // cancel against.
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
      // Stripe API 2025+ moved current_period_end onto subscription items.
      subCurrentPeriodEnd = sub.items?.data?.[0]?.current_period_end ?? null;
    } catch {
      // Stripe unavailable — render the controls without period info
      // rather than blanking the section entirely.
    }
  }

  const [chats, diagnoses, partSearches, vehicles] = await Promise.all([
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
    prisma.vehicleInsight.findMany({
      where: { userId, insightType: 'part_demand' },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, year: true, make: true, model: true, title: true, createdAt: true },
    }),
    prisma.vehicle.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      select: { id: true, year: true, make: true, model: true, trim: true, nickname: true },
    }),
  ]);

  return (
    <PageLayout backLink={{ href: '/', label: 'Home' }}>
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
        {/* Header — email line removed (the FloatingAuthButton avatar
            dropdown in the top-right already surfaces it). */}
        <header>
          <h1 className="text-3xl font-bold text-gray-900">
            Your Account
            <span className="ml-2 align-middle text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded">Beta</span>
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Premium features (SMS reminders, push alerts, cross-device sync) are still
            in active development. What you see here today is read-only history of your
            chats, diagnoses, and saved vehicles.
          </p>
        </header>

        {/* Garage summary */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">My Garage</h2>
            <Link href="/garage" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Manage →
            </Link>
          </div>
          {vehicles.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center">
              <p className="text-gray-600 text-sm">No vehicles yet.</p>
              <Link href="/garage" className="text-blue-600 hover:text-blue-700 font-medium text-sm mt-2 inline-block">
                Add a vehicle →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {vehicles.map((v) => (
                <Link
                  key={v.id}
                  href={`/vehicle/${vehicleSlug(v.year, v.make, v.model, v.trim)}`}
                  className="block rounded-xl border border-gray-200 bg-white p-4 hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <p className="font-semibold text-gray-900 text-sm truncate">
                    {v.nickname || `${v.year} ${v.make} ${v.model}`}
                  </p>
                  {v.nickname && (
                    <p className="text-xs text-gray-500 truncate">
                      {v.year} {v.make} {v.model} {v.trim}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Recent diagnoses */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Diagnoses</h2>
          {diagnoses.length === 0 ? (
            <p className="text-sm text-gray-500">No diagnoses yet. Start a chat to diagnose a symptom.</p>
          ) : (
            <ul className="space-y-2">
              {diagnoses.map((d) => (
                <li key={d.id} className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{d.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {d.year} {d.make} {d.model}
                        {d.confidence && <span className="ml-2 inline-block px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-medium uppercase">{d.confidence}</span>}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(d.createdAt)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Recent chats */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Chats</h2>
          {chats.length === 0 ? (
            <p className="text-sm text-gray-500">
              No chats yet. <Link href="/symptom-chat" className="text-blue-600 hover:text-blue-700 font-medium">Start one →</Link>
            </p>
          ) : (
            <ul className="space-y-2">
              {chats.map((c) => {
                const msgs = (c.messages as unknown as ChatMessagePreview[]) || [];
                const firstUser = msgs.find((m) => m.role === 'user');
                const diag = c.diagnosis as unknown as DiagnosisPreview | null;
                return (
                  <li key={c.id} className="rounded-xl border border-gray-200 bg-white p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-900 line-clamp-2">
                          {firstUser?.content || '(empty)'}
                        </p>
                        {diag?.title && (
                          <p className="text-xs text-blue-600 font-medium mt-1">
                            → {diag.title}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {msgs.length} message{msgs.length === 1 ? '' : 's'}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(c.createdAt)}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Subscription self-service — surfaces current tier, in-app
            upgrade/downgrade (Plus ↔ Pro), and cancel. Free-tier users
            see an upgrade CTA pointing at /subscribe. */}
        <SubscriptionControls
          initialTier={resolvedTier}
          initialStatus={effectiveStatus}
          initialCancelAtPeriodEnd={subCancelAtPeriodEnd}
          initialCurrentPeriodEnd={subCurrentPeriodEnd}
          regionAllowed={regionAllowed}
          country={country}
        />

        {/* Account emails — login (read-only) + optional secondary
            contact email the user can edit. */}
        <section className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Emails</h2>
          <SecondaryEmailEditor
            loginEmail={session.user.email ?? ''}
            initialSecondary={userSubInfo?.secondaryEmail ?? null}
          />
        </section>

        {/* GDPR data-rights actions */}
        <AccountPrivacyActions email={session.user.email} />

        {/* Site map — shared component, also rendered on known-issues
            pages. Helps users who land deep discover the rest of the
            site without bouncing back to nav. */}
        <SiteMapSection className="mt-8" />

        {/* Recent Parts Searches section hidden 2026-05-30 — Parts
            Finder is temporarily unsurfaced pending verification. The
            partSearches query above still runs (cheap) so existing
            history is preserved in state for when the section is
            restored; no DB changes needed. */}
      </div>
    </PageLayout>
  );
}
