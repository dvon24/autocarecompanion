'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PricingTiers } from '@/components/pricing/PricingTiers';
import { MobilePricing } from '@/components/pricing/MobilePricing';
import type { Tier, TierId } from '@/lib/pricing/tiers';

/**
 * /subscribe — three-tier pricing page (Free / Plus $14.99 / Pro $24.99).
 *
 * Desktop: PricingTiers 3-column grid.
 * Mobile: MobilePricing stacked list.
 * Both call into the same checkout flow — clicking a paid tier POSTs
 * /api/stripe/create-checkout with the tier ID and redirects to the
 * Stripe-hosted checkout page. Hosted page (not embedded) keeps PCI
 * scope small and avoids embedding Stripe Elements; we can swap in the
 * embedded modal later without touching this page.
 *
 * Free tier "Current plan" button is informational only — no checkout.
 */
export default function SubscribePage() {
  const [loadingTier, setLoadingTier] = useState<TierId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentTier, setCurrentTier] = useState<TierId | null>(null);

  // Fetch the user's current tier so we can flag the right card with
  // "Current plan" instead of letting them re-checkout into the same
  // plan. Failure (e.g. anonymous user) leaves currentTier null and
  // every tier is purchasable as it should be for new visitors.
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
      // Nothing to do — free is just sign up. Send unauthenticated
      // users to signup, authenticated users back home.
      window.location.href = '/auth/signup';
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

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--paper, #F7F6F2)',
        color: 'var(--ink, #0B1220)',
        fontFamily: 'var(--font-sans, system-ui, -apple-system, sans-serif)',
      }}
    >
      <header style={{ padding: '14px 22px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'inherit' }}>
            <Image src="/og-image.png" alt="" width={28} height={28} style={{ borderRadius: 8 }} />
            <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>
              Au<span style={{ color: 'var(--au7o-blue, #3B82F6)' }}>7</span>o
            </span>
          </Link>
          <Link
            href="/auth/signin"
            style={{ padding: '8px 14px', fontSize: 13.5, fontWeight: 500, color: 'var(--slate-700, #334155)', textDecoration: 'none' }}
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Desktop layout — hidden under 760px. */}
      <main className="subscribe-desktop" style={{ maxWidth: 1080, margin: '0 auto', padding: '28px 22px 80px' }}>
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

        <PricingTiers onSelect={handleSelect} loadingTierId={loadingTier} currentTierId={currentTier} />

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--slate-500, #64748B)', marginTop: 28 }}>
          Secure checkout by Stripe · Cancel anytime · Plus + Pro: 30-day money back
        </p>
      </main>

      {/* Mobile layout — hidden over 760px. */}
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

        <MobilePricing onSelect={handleSelect} loadingTierId={loadingTier} currentTierId={currentTier} />

        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--slate-500, #64748B)', marginTop: 22 }}>
          Secure checkout by Stripe · Cancel anytime
        </p>
      </main>

      <style jsx global>{`
        .subscribe-desktop {
          display: block;
        }
        .subscribe-mobile {
          display: none;
        }
        @media (max-width: 760px) {
          .subscribe-desktop {
            display: none;
          }
          .subscribe-mobile {
            display: block;
          }
        }
      `}</style>
    </div>
  );
}
