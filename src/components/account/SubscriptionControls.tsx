'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { TierId } from '@/lib/pricing/tiers';
import { getTier } from '@/lib/pricing/tiers';
import { regionDisplayName } from '@/lib/pricing/region';

/**
 * Account-page subscription panel. Surfaces the current tier and the
 * actions the user can take:
 *
 *   free  → "Upgrade your plan" CTA pointing at /subscribe
 *   plus  → current tier badge + "Upgrade to Pro" (in-app change-tier)
 *           + "Cancel subscription"
 *   pro   → current tier badge + "Switch to Plus" (downgrade)
 *           + "Cancel subscription"
 *
 * Plan changes call /api/stripe/change-tier which updates the live
 * Stripe subscription in place (proration recorded for next invoice)
 * and writes subscriptionTier on the User row eagerly so this UI
 * reflects the change without waiting on the webhook.
 *
 * Per FTC Click-to-Cancel: cancellation stays a single click. No
 * confirmation modal, no friction.
 */
interface Props {
  initialTier: TierId;
  initialStatus: string | null;
  initialCancelAtPeriodEnd: boolean;
  initialCurrentPeriodEnd: number | null; // unix seconds
  /** Resolved server-side: false when this visitor's IP country isn't
   *  on the allow-list and their email isn't on the founder bypass. */
  regionAllowed: boolean;
  /** ISO country code from the Vercel edge geo header, or null on
   *  local dev. Used only for the user-facing notice copy. */
  country: string | null;
  /** When true, render without the outer <section>/<h2> chrome so the
   *  caller can wrap us in an AcctCard. Tier badge stays inside this
   *  component (it owns the optimistic state) and is exposed via the
   *  `renderTierBadge` ref-style render-prop pattern below — but for
   *  simplicity v1 just keeps the badge rendering as a small pill at
   *  the top of the body when frameless. The parent can use the same
   *  tier prop to render its own header pill if needed. */
  frameless?: boolean;
}

function formatDate(unixSeconds: number | null): string {
  if (!unixSeconds) return 'the end of your current billing period';
  return new Date(unixSeconds * 1000).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

const TIER_BADGE: Record<TierId, { label: string; bg: string; fg: string }> = {
  free: { label: 'Free',  bg: '#EFEDE6', fg: '#475569' },
  plus: { label: 'Plus',  bg: '#DBEAFE', fg: '#1D4ED8' },
  pro:  { label: 'Pro',   bg: '#0B1220', fg: '#FFFFFF' },
};

export default function SubscriptionControls({
  initialTier,
  initialStatus,
  initialCancelAtPeriodEnd,
  initialCurrentPeriodEnd,
  regionAllowed,
  country,
  frameless = false,
}: Props) {
  const [tier, setTier] = useState<TierId>(initialTier);
  const [status, setStatus] = useState(initialStatus);
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(initialCancelAtPeriodEnd);
  const [periodEnd, setPeriodEnd] = useState(initialCurrentPeriodEnd);
  const [pending, setPending] = useState<'cancel' | TierId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const isActiveSub = status === 'active' || status === 'trialing' || status === 'past_due';
  const tierMeta = getTier(tier);
  const badge = TIER_BADGE[tier];

  const callCancel = async () => {
    if (pending) return;
    const wantReactivate = cancelAtPeriodEnd;
    setPending('cancel');
    setError(null); setInfo(null);
    try {
      const res = await fetch('/api/account/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reactivate: wantReactivate }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || `Update failed (HTTP ${res.status})`);
        return;
      }
      const data = await res.json();
      setCancelAtPeriodEnd(!!data.cancelAtPeriodEnd);
      setPeriodEnd(data.currentPeriodEnd ?? periodEnd);
      setStatus(data.status ?? status);
      setInfo(wantReactivate ? 'Subscription reactivated.' : 'Cancellation scheduled.');
    } catch {
      setError('Network error. Try again.');
    } finally {
      setPending(null);
    }
  };

  const callChangeTier = async (target: TierId) => {
    if (pending) return;
    if (target === tier) return;
    setPending(target);
    setError(null); setInfo(null);
    try {
      const res = await fetch('/api/stripe/change-tier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tierId: target }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || data.error || `Plan change failed (HTTP ${res.status})`);
        return;
      }
      setTier(target);
      setInfo(
        target === 'pro'
          ? 'Upgraded to Pro. Proration will appear on your next invoice.'
          : 'Switched to Plus. Credit for unused Pro time will apply to your next invoice.'
      );
    } catch {
      setError('Network error. Try again.');
    } finally {
      setPending(null);
    }
  };

  // Free-tier user — show upgrade CTA, no Stripe controls yet.
  if (!isActiveSub) {
    const freeBody = (
      <div className={frameless ? '' : 'rounded-xl border border-gray-200 bg-white p-5'}>
        {/* Tier badge — in frameless mode the AcctCard title slot is
            owned by the (server-rendered) page, which can't reflect an
            optimistic in-component tier change. So we render the colored
            chip here from local `badge` (tracks `tier` state) to keep
            the affordance AND keep it accurate after a change. */}
        {frameless && (
          <div className="flex justify-end mb-2">
            <span
              className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full"
              style={{ background: badge.bg, color: badge.fg }}
            >
              {badge.label}
            </span>
          </div>
        )}
        {/* CURRENT PLAN row — paper well showing the active tier so
            the user always sees what they're on (even at Free). */}
        <div
          className="flex items-center gap-3 mb-3"
          style={{
            padding: '13px 15px',
            background: '#EFEDE6',
            border: '1px solid #E3DFD4',
            borderRadius: 12,
          }}
        >
          <div className="flex-1">
            <div className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">
              CURRENT PLAN
            </div>
            <div className="text-[17px] font-bold mt-0.5 text-slate-900">Free</div>
          </div>
          <span
            className="text-[18px] font-bold text-slate-400 font-mono"
            style={{ fontFamily: 'ui-monospace, SFMono-Regular, monospace' }}
          >
            $0
          </span>
        </div>

        {regionAllowed ? (
          <>
            <p className="text-[12.5px] text-slate-600 leading-relaxed mb-4">
              You&apos;re on the Free plan — <strong className="text-slate-900">2 photo diagnoses / week</strong> and one vehicle. Unlock more diagnoses, alerts, and the full garage with a paid plan.
            </p>

            <div className="flex flex-col gap-2">
              {(['plus', 'pro'] as const).map((id) => {
                const t = getTier(id);
                const popular = t.popular;
                return (
                  <Link key={id} href={`/subscribe?tier=${id}`} className="block">
                    <div
                      className="flex items-center gap-3"
                      style={{
                        padding: '12px 14px',
                        background: '#fff',
                        border: popular ? '1.5px solid #3B82F6' : '1px solid #E3DFD4',
                        borderRadius: 11,
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">{t.name}</span>
                          {popular && (
                            <span
                              className="text-[8.5px] font-bold uppercase text-white bg-blue-600 rounded-full"
                              style={{ padding: '2px 6px', letterSpacing: '0.05em' }}
                            >
                              POPULAR
                            </span>
                          )}
                        </div>
                        <div className="text-[11.5px] text-slate-500 mt-0.5 truncate">
                          {t.tagline}
                        </div>
                      </div>
                      <span
                        className="text-sm font-bold text-slate-900"
                        style={{ fontFamily: 'ui-monospace, SFMono-Regular, monospace' }}
                      >
                        ${t.price}
                      </span>
                      <span
                        className="flex-shrink-0 text-xs font-semibold rounded-lg"
                        style={{
                          padding: '7px 13px',
                          background: popular ? '#3B82F6' : '#0B1220',
                          color: '#fff',
                        }}
                      >
                        Upgrade
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
            <Link
              href="/subscribe"
              className="inline-flex items-center gap-1 text-[12.5px] text-blue-600 hover:text-blue-700 font-semibold mt-4"
            >
              Compare all plans →
            </Link>
          </>
        ) : (
          /* Region not on the allow-list — no purchasable tiles at all,
             just a clear "not available here yet" note. The free tier
             is global so the user keeps everything they have. */
          <div
            className="rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-3 text-xs leading-relaxed text-amber-900"
            role="note"
          >
            <strong>Plus &amp; Pro aren&apos;t available in {regionDisplayName(country)} yet.</strong>{' '}
            We&apos;re launching paid plans in the US first while we work through tax and compliance elsewhere. Your free plan stays fully available — no charge, nothing to do.
          </div>
        )}
      </div>
    );

    if (frameless) return freeBody;
    return (
      <section className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Subscription</h2>
          <span
            className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full"
            style={{ background: badge.bg, color: badge.fg }}
          >
            {badge.label}
          </span>
        </div>
        {freeBody}
      </section>
    );
  }

  // Plus / Pro user — full self-service panel.
  const activeBody = (
    <div className={frameless ? '' : 'rounded-xl border border-gray-200 bg-white p-5'}>
      {/* Tier badge (frameless) — see freeBody note: rendered here from
          local `badge` so it survives an optimistic Plus↔Pro change. */}
      {frameless && (
        <div className="flex justify-end mb-2">
          <span
            className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full"
            style={{ background: badge.bg, color: badge.fg }}
          >
            {badge.label}
          </span>
        </div>
      )}
      {/* CURRENT PLAN row — paper well */}
      {frameless && (
        <div
          className="flex items-center gap-3 mb-3"
          style={{
            padding: '13px 15px',
            background: '#EFEDE6',
            border: '1px solid #E3DFD4',
            borderRadius: 12,
          }}
        >
          <div className="flex-1">
            <div className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">
              CURRENT PLAN
            </div>
            <div className="text-[17px] font-bold mt-0.5 text-slate-900">
              {tierMeta.name}
            </div>
          </div>
          <span
            className="text-[18px] font-bold text-slate-900"
            style={{ fontFamily: 'ui-monospace, SFMono-Regular, monospace' }}
          >
            ${tierMeta.price}
          </span>
        </div>
      )}

      {cancelAtPeriodEnd ? (
          <>
            <h3 className="font-semibold text-gray-900 mb-1">Scheduled to cancel</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Your {tierMeta.name} subscription will end on{' '}
              <strong>{formatDate(periodEnd)}</strong>. You&apos;ll keep
              all {tierMeta.name} features until then and won&apos;t be
              charged again. Reactivate any time with one click.
            </p>
            <button
              onClick={callCancel}
              disabled={pending === 'cancel'}
              className="w-full sm:w-auto py-2.5 px-5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {pending === 'cancel' ? 'Reactivating…' : 'Reactivate subscription'}
            </button>
          </>
        ) : (
          <>
            {!frameless && (
              <h3 className="font-semibold text-gray-900 mb-1">
                Au7o {tierMeta.name} · ${tierMeta.price}/mo
              </h3>
            )}
            <p className="text-sm text-gray-600 leading-relaxed mb-5">
              Auto-renews{' '}
              {periodEnd ? (<>on <strong>{formatDate(periodEnd)}</strong></>) : <>at the end of your current period</>}.
              Cancel anytime — you keep access through the end of the period you&apos;ve paid for.
            </p>

            {/* Upgrade / downgrade action — tier-aware. Upgrades are
                gated by regionAllowed (Plus → Pro is a paid plan change).
                Downgrades stay available everywhere — no compliance risk
                in shrinking what we charge an existing subscriber. */}
            {tier === 'plus' && (
              <div className="mb-5 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">Upgrade to Pro · $24.99/mo</p>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      Unlimited photo &amp; video diagnosis, up to 10 vehicles, priority AI, family/shop sharing.
                    </p>
                    {!regionAllowed && (
                      <p className="text-[10px] uppercase tracking-wider text-amber-700 mt-1.5">US only for now</p>
                    )}
                  </div>
                  <button
                    onClick={() => callChangeTier('pro')}
                    disabled={pending !== null || !regionAllowed}
                    title={!regionAllowed ? `Plus → Pro upgrades aren't available in ${regionDisplayName(country)} yet.` : undefined}
                    className={`flex-shrink-0 py-2 px-4 text-sm font-semibold rounded-lg transition-colors disabled:cursor-not-allowed ${
                      regionAllowed
                        ? 'bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50'
                        : 'bg-gray-200 text-gray-500 border border-gray-300 opacity-70'
                    }`}
                  >
                    {pending === 'pro' ? 'Upgrading…' : regionAllowed ? 'Upgrade' : 'US only'}
                  </button>
                </div>
              </div>
            )}

            {tier === 'pro' && (
              <div className="mb-5 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">Switch to Plus · $14.99/mo</p>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      10 diagnoses/week and up to 3 vehicles. Credit for unused Pro time applies to your next invoice.
                    </p>
                  </div>
                  <button
                    onClick={() => callChangeTier('plus')}
                    disabled={pending !== null}
                    className="flex-shrink-0 py-2 px-4 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {pending === 'plus' ? 'Switching…' : 'Switch'}
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={callCancel}
              disabled={pending === 'cancel'}
              className="w-full sm:w-auto py-2.5 px-5 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {pending === 'cancel' ? 'Canceling…' : 'Cancel subscription'}
            </button>
          </>
        )}

      {info && <p className="text-xs text-green-700 mt-3">{info}</p>}
      {error && <p className="text-xs text-red-600 mt-3">{error}</p>}
    </div>
  );

  if (frameless) return activeBody;
  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Subscription</h2>
        <span
          className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full"
          style={{ background: badge.bg, color: badge.fg }}
        >
          {badge.label}
        </span>
      </div>
      {activeBody}
    </section>
  );
}
