'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { TierId } from '@/lib/pricing/tiers';
import { AU7O_TIERS, getTier } from '@/lib/pricing/tiers';

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
  free: { label: 'Free',  bg: '#F1F5F9', fg: '#475569' },
  plus: { label: 'Plus',  bg: '#DBEAFE', fg: '#1D4ED8' },
  pro:  { label: 'Pro',   bg: '#0B1220', fg: '#FFFFFF' },
};

export default function SubscriptionControls({
  initialTier,
  initialStatus,
  initialCancelAtPeriodEnd,
  initialCurrentPeriodEnd,
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
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="font-semibold text-gray-900 mb-1">Upgrade your plan</h3>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            You&apos;re on the Free plan — {AU7O_TIERS[0].features.find((f) => f.t.includes('photo'))?.t.toLowerCase() ?? '2 photo diagnoses / week'} and one vehicle. Unlock more diagnoses, alerts, and the full garage with a paid plan.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {(['plus', 'pro'] as const).map((id) => {
              const t = getTier(id);
              return (
                <Link
                  key={id}
                  href={`/subscribe?tier=${id}`}
                  className={`block rounded-xl border p-4 transition-colors ${
                    id === 'plus'
                      ? 'border-blue-200 bg-blue-50 hover:bg-blue-100'
                      : 'border-gray-900 bg-gray-900 hover:bg-gray-800 text-white'
                  }`}
                >
                  <div className="flex items-baseline justify-between">
                    <span className={`font-semibold ${id === 'pro' ? 'text-white' : 'text-gray-900'}`}>
                      {t.name}
                    </span>
                    <span className={`text-sm ${id === 'pro' ? 'text-gray-300' : 'text-gray-600'}`}>
                      ${t.price}/mo
                    </span>
                  </div>
                  <p className={`text-xs mt-1 ${id === 'pro' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {t.tagline}
                  </p>
                </Link>
              );
            })}
          </div>
          <Link
            href="/subscribe"
            className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium mt-4"
          >
            Compare all plans →
          </Link>
        </div>
      </section>
    );
  }

  // Plus / Pro user — full self-service panel.
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

      <div className="rounded-xl border border-gray-200 bg-white p-5">
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
            <h3 className="font-semibold text-gray-900 mb-1">
              Au7o {tierMeta.name} · ${tierMeta.price}/mo
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-5">
              Auto-renews{' '}
              {periodEnd ? (<>on <strong>{formatDate(periodEnd)}</strong></>) : <>at the end of your current period</>}.
              Cancel anytime — you keep access through the end of the period you&apos;ve paid for.
            </p>

            {/* Upgrade / downgrade action — tier-aware. */}
            {tier === 'plus' && (
              <div className="mb-5 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">Upgrade to Pro · $24.99/mo</p>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      Unlimited photo &amp; video diagnosis, up to 10 vehicles, priority AI, family/shop sharing.
                    </p>
                  </div>
                  <button
                    onClick={() => callChangeTier('pro')}
                    disabled={pending !== null}
                    className="flex-shrink-0 py-2 px-4 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {pending === 'pro' ? 'Upgrading…' : 'Upgrade'}
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
    </section>
  );
}
