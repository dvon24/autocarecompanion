'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PricingTiers } from '@/components/pricing/PricingTiers';
import { MobilePricing } from '@/components/pricing/MobilePricing';
import type { Tier, TierId } from '@/lib/pricing/tiers';
import { regionDisplayName } from '@/lib/pricing/region';

/**
 * /subscribe client. Renders pricing tiers + handles checkout dispatch.
 *
 * `regionAllowed` is driven by the server component using Vercel's geo
 * header (see src/lib/pricing/region.ts). When false:
 *   - Free tier button still works (it's just "sign up")
 *   - Plus + Pro buttons gray out with a "US only" label
 *   - A banner up top tells the visitor what's going on so they don't
 *     bounce thinking the site is broken
 *   - As a backstop, the create-checkout API also returns 403 if the
 *     gate is somehow bypassed (e.g. direct API call)
 */
export function SubscribeClient({
  country,
  regionAllowed,
}: {
  country: string | null;
  regionAllowed: boolean;
}) {
  const [loadingTier, setLoadingTier] = useState<TierId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentTier, setCurrentTier] = useState<TierId | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/user/tier', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data?.tier) return;
        setCurrentTier(data.tier as TierId);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSelect = async (tier: Tier) => {
    setError(null);
    if (tier.id === 'free') {
      window.location.href = '/auth/signup';
      return;
    }
    if (!regionAllowed) {
      // Defense-in-depth — buttons should be disabled when we reach
      // here, but if a click squeaks through (assistive tech, race
      // condition) we still refuse.
      setError(`Plus and Pro are available in the US only right now. We're working on ${regionDisplayName(country)}.`);
      return;
    }
    setLoadingTier(tier.id);
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tierId: tier.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        setError(data.message || data.error || 'Could not start checkout. Try again.');
        setLoadingTier(null);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError('Network error. Try again.');
      setLoadingTier(null);
    }
  };

  // Plus + Pro are the paid tiers; free stays available everywhere.
  const lockedTiers: TierId[] = regionAllowed ? [] : ['plus', 'pro'];
  const lockedReason = regionAllowed ? undefined : 'US only for now';

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--paper, #F7F6F2)',
        color: 'var(--ink, #0B1220)',
        fontFamily: 'var(--font-sans, system-ui, -apple-system, sans-serif)',
      }}
    >
      {/* The global FloatingAuthButton (rendered from layout.tsx) owns
          the top-right Sign-in pill, so this header just carries the
          brand wordmark to avoid a duplicate sign-in link. */}
      <header style={{ padding: '14px 22px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'inherit' }}>
            <Image src="/og-image.png" alt="" width={28} height={28} style={{ borderRadius: 8 }} />
            <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>
              Au<span style={{ color: 'var(--au7o-blue, #3B82F6)' }}>7</span>o
            </span>
          </Link>
        </div>
      </header>

      {!regionAllowed && (
        <div
          style={{
            maxWidth: 760,
            margin: '0 auto 4px',
            padding: '12px 16px',
            background: '#FEF3C7',
            border: '1px solid #F59E0B',
            color: '#92400E',
            borderRadius: 12,
            fontSize: 13.5,
            lineHeight: 1.5,
            textAlign: 'center',
          }}
        >
          <strong>Paid plans aren&apos;t available in {regionDisplayName(country)} yet.</strong>{' '}
          We&apos;re launching Plus and Pro in the US first while we work through tax and
          compliance in other regions. The free tier is fully available everywhere.
        </div>
      )}

      <main className="subscribe-desktop" style={{ maxWidth: 1080, margin: '0 auto', padding: '24px 22px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.03em', margin: 0 }}>Pick your plan</h1>
          <p style={{ fontSize: 16, color: 'var(--slate-500, #64748B)', marginTop: 10 }}>
            Start free. Upgrade when you want the full garage, unlimited diagnoses, and alerts.
          </p>
        </div>

        {error && (
          <div
            style={{
              maxWidth: 680,
              margin: '0 auto 18px',
              padding: '10px 14px',
              background: 'var(--crit-bg, #FEE2E2)',
              color: 'var(--crit, #EF4444)',
              borderRadius: 10,
              fontSize: 13,
              textAlign: 'center',
            }}
          >
            {error}
          </div>
        )}

        <PricingTiers
          onSelect={handleSelect}
          loadingTierId={loadingTier}
          currentTierId={currentTier}
          lockedTiers={lockedTiers}
          lockedReason={lockedReason}
        />

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--slate-500, #64748B)', marginTop: 28 }}>
          Secure checkout by Stripe · Cancel anytime · Plus + Pro: 30-day money back
        </p>
      </main>

      <main className="subscribe-mobile" style={{ padding: '6px 16px 40px' }}>
        <div style={{ textAlign: 'center', margin: '4px 0 18px' }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.025em', margin: 0 }}>Pick your plan</h1>
          <p style={{ fontSize: 13, color: 'var(--slate-700, #334155)', margin: '6px 0 0' }}>
            Start free. Upgrade when you want the full garage.
          </p>
        </div>

        {error && (
          <div
            style={{
              margin: '0 0 14px',
              padding: '9px 12px',
              background: 'var(--crit-bg, #FEE2E2)',
              color: 'var(--crit, #EF4444)',
              borderRadius: 10,
              fontSize: 12.5,
              textAlign: 'center',
            }}
          >
            {error}
          </div>
        )}

        <MobilePricing
          onSelect={handleSelect}
          loadingTierId={loadingTier}
          currentTierId={currentTier}
          lockedTiers={lockedTiers}
          lockedReason={lockedReason}
        />

        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--slate-500, #64748B)', marginTop: 22 }}>
          Secure checkout by Stripe · Cancel anytime
        </p>
      </main>

      <style jsx global>{`
        .subscribe-desktop { display: block; }
        .subscribe-mobile { display: none; }
        @media (max-width: 760px) {
          .subscribe-desktop { display: none; }
          .subscribe-mobile { display: block; }
        }
      `}</style>
    </div>
  );
}
