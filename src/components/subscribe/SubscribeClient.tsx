'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PricingTiers } from '@/components/pricing/PricingTiers';
import { MobilePricing } from '@/components/pricing/MobilePricing';
import type { Tier, TierId, BillingInterval } from '@/lib/pricing/tiers';
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
/**
 * Flip to true ONLY after the Apple/Google external-purchase-link
 * entitlements are approved. When true, the in-app subscribe screen shows a
 * "Continue in your browser" button that opens the real web checkout in the
 * SYSTEM browser (not the WebView) — the US-allowed external-link path. Left
 * false = pure informational (zero rejection risk) for the first submission.
 */
const EXTERNAL_SUBSCRIBE_ENABLED = false;

export function SubscribeClient({
  country,
  regionAllowed,
  appMode = false,
}: {
  country: string | null;
  regionAllowed: boolean;
  /** Native app (Au7oApp WebView) or ?app=1 preview — render the store-safe
   *  informational state instead of in-WebView Stripe checkout. */
  appMode?: boolean;
}) {
  // App-store compliance gate. The native shell can't run Stripe checkout in
  // the WebView, so swap the whole purchase UI for an informational panel.
  // Keyed on the UA marker (server-detected), never on screen size — phone
  // browsers are plain web and keep full checkout.
  if (appMode) return <AppSubscribeInfo />;
  return <SubscribeCheckout country={country} regionAllowed={regionAllowed} />;
}

function SubscribeCheckout({
  country,
  regionAllowed,
}: {
  country: string | null;
  regionAllowed: boolean;
}) {
  const [loadingTier, setLoadingTier] = useState<TierId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentTier, setCurrentTier] = useState<TierId | null>(null);
  // Annual is the default-selected interval — better deal for the user,
  // retention play for us. Monthly is one tap away. (The annual Stripe
  // prices + env vars went live 2026-06-12.)
  const [interval, setInterval] = useState<BillingInterval>('year');

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
        body: JSON.stringify({ tierId: tier.id, interval }),
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

        {/* Billing interval toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 22 }}>
          <div style={{ display: 'inline-flex', background: '#fff', border: '1px solid var(--paper-line, #E3DFD4)', borderRadius: 999, padding: 3 }}>
            {(['month', 'year'] as const).map((iv) => (
              <button
                key={iv}
                onClick={() => setInterval(iv)}
                style={{
                  padding: '7px 16px',
                  borderRadius: 999,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  background: interval === iv ? 'var(--ink, #0B1220)' : 'transparent',
                  color: interval === iv ? '#fff' : 'var(--slate-500, #64748B)',
                }}
              >
                {iv === 'month' ? 'Monthly' : 'Annual — save up to 45%'}
              </button>
            ))}
          </div>
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
          interval={interval}
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

        {/* Billing interval toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 22 }}>
          <div style={{ display: 'inline-flex', background: '#fff', border: '1px solid var(--paper-line, #E3DFD4)', borderRadius: 999, padding: 3 }}>
            {(['month', 'year'] as const).map((iv) => (
              <button
                key={iv}
                onClick={() => setInterval(iv)}
                style={{
                  padding: '7px 16px',
                  borderRadius: 999,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  background: interval === iv ? 'var(--ink, #0B1220)' : 'transparent',
                  color: interval === iv ? '#fff' : 'var(--slate-500, #64748B)',
                }}
              >
                {iv === 'month' ? 'Monthly' : 'Annual — save up to 45%'}
              </button>
            ))}
          </div>
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
          interval={interval}
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

/**
 * Store-safe subscribe screen for the native app (Au7oApp WebView).
 * Shows NO in-app purchase mechanism — Apple/Google require their own
 * billing for in-app digital goods, and an in-WebView Stripe checkout is a
 * guaranteed rejection. This is the informational path: explain Au7o Pro,
 * point to the website to manage it, no price/checkout. When
 * EXTERNAL_SUBSCRIBE_ENABLED is flipped on (after the external-purchase-link
 * entitlements are approved), it adds a button that opens the real checkout
 * in the SYSTEM browser.
 */
function AppSubscribeInfo() {
  const openInBrowser = () => {
    // System-browser open. A raw window.open inside the WebView would load
    // in-app (the ambiguous version reviewers dislike); once the Capacitor
    // Browser plugin is wired, swap this for `Browser.open({ url })` so the
    // checkout clearly happens OUTSIDE the app.
    window.open('https://au7o.io/subscribe', '_blank', 'noopener');
  };

  const perks = [
    'Unlimited photo & video diagnoses',
    'Full diagnosis history saved to your garage',
    'Unlimited follow-up questions in the hub',
    'Recall & known-issue alerts for your vehicles',
  ];

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--paper, #F7F6F2)',
        color: 'var(--ink, #0B1220)',
        fontFamily: 'var(--font-sans, system-ui, -apple-system, sans-serif)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <header style={{ padding: '14px 22px' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'inherit' }}>
          <Image src="/og-image.png" alt="" width={28} height={28} style={{ borderRadius: 8 }} />
          <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>
            Au<span style={{ color: 'var(--au7o-blue, #3B82F6)' }}>7</span>o
          </span>
        </Link>
      </header>

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 22px 60px' }}>
        <div
          style={{
            maxWidth: 440,
            width: '100%',
            background: '#fff',
            border: '1px solid var(--paper-line, #E3DFD4)',
            borderRadius: 18,
            padding: '26px 22px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-1, 0 1px 2px rgba(11,18,32,0.06))',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--au7o-blue, #3B82F6)' }}>
            AU7O PRO
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.025em', margin: '8px 0 6px' }}>
            More diagnoses, fewer guesses
          </h1>
          <p style={{ fontSize: 14, color: 'var(--slate-700, #334155)', margin: '0 0 18px', lineHeight: 1.5 }}>
            Au7o Pro unlocks the full toolkit for keeping your car healthy.
          </p>

          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 22px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {perks.map((p) => (
              <li key={p} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: 'var(--ink, #0B1220)' }}>
                <span aria-hidden style={{ color: '#10B981', fontWeight: 700, lineHeight: 1.4 }}>✓</span>
                <span style={{ lineHeight: 1.4 }}>{p}</span>
              </li>
            ))}
          </ul>

          {EXTERNAL_SUBSCRIBE_ENABLED ? (
            <>
              <button
                type="button"
                onClick={openInBrowser}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  borderRadius: 12,
                  border: 'none',
                  background: 'var(--au7o-blue, #3B82F6)',
                  color: '#fff',
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Continue in your browser →
              </button>
              <p style={{ fontSize: 12, color: 'var(--slate-500, #64748B)', margin: '12px 0 0', lineHeight: 1.45 }}>
                You&apos;ll finish in your browser, then sign back into the app — your Pro features unlock automatically.
              </p>
            </>
          ) : (
            <div
              style={{
                padding: '14px 16px',
                background: 'var(--paper-2, #EFEDE6)',
                border: '1px solid var(--paper-line, #E3DFD4)',
                borderRadius: 12,
                fontSize: 13.5,
                color: 'var(--slate-700, #334155)',
                lineHeight: 1.5,
              }}
            >
              Au7o Pro is managed on the web. Visit <strong>au7o.io</strong> in your browser and sign in to your account to upgrade — your Pro features then unlock here automatically.
            </div>
          )}

          <div style={{ marginTop: 18 }}>
            <Link href="/" style={{ fontSize: 13, color: 'var(--slate-500, #64748B)', textDecoration: 'underline' }}>
              Back to Au7o
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
