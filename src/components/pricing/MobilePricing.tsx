'use client';

import { Icon } from '@/components/ui/Icon';
import { AU7O_TIERS, type Tier, type TierId, type BillingInterval } from '@/lib/pricing/tiers';

/**
 * Mobile pricing — stacked tier cards. Same data as PricingTiers but
 * laid out vertically for narrow screens. The first 4 features per
 * tier are shown (BMAD pattern — full list is on the post-checkout
 * confirmation page).
 *
 * `lockedTiers` + `lockedReason` mirror PricingTiers — grays out
 * specific tiers (e.g. paid tiers for non-US visitors) without hiding
 * the marketing copy.
 *
 * Adapted from design/au7o (2)/bmad-handoff2/screens/12-Pricing.jsx.
 */
export function MobilePricing({
  onSelect,
  loadingTierId,
  currentTierId,
  lockedTiers,
  lockedReason,
  interval = 'month',
}: {
  onSelect: (tier: Tier) => void;
  loadingTierId?: string | null;
  currentTierId?: string | null;
  lockedTiers?: TierId[];
  lockedReason?: string;
  interval?: BillingInterval;
}) {
  const locked = new Set<TierId>(lockedTiers ?? []);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {AU7O_TIERS.map((tier) => {
        const isCurrent = currentTierId === tier.id;
        const isLoading = loadingTierId === tier.id;
        const isLocked = locked.has(tier.id);
        const isDisabled = isCurrent || isLoading || isLocked;
        return (
          <div
            key={tier.id}
            style={{
              background: '#fff',
              borderRadius: 16,
              padding: '16px 18px',
              border: tier.popular ? '2px solid var(--au7o-blue)' : '1px solid var(--paper-line)',
              boxShadow: tier.popular
                ? '0 10px 26px rgba(59,130,246,0.14)'
                : 'var(--shadow-1, 0 1px 2px rgba(11,18,32,0.06))',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 15.5, fontWeight: 700 }}>{tier.name}</span>
              {tier.popular && (
                <span
                  style={{
                    padding: '2px 8px',
                    background: 'var(--au7o-blue)',
                    color: '#fff',
                    borderRadius: 999,
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                  }}
                >
                  POPULAR
                </span>
              )}
              <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'baseline', gap: 2 }}>
                <span
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    fontFamily: 'var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)',
                  }}
                >
                  ${interval === 'year' ? tier.priceAnnual : tier.price}
                </span>
                <span style={{ fontSize: 11.5, color: 'var(--slate-500)' }}>{interval === 'year' ? '/yr' : '/mo'}</span>
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, margin: '12px 0 14px' }}>
              {tier.features.slice(0, 4).map((f, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 12,
                    color: f.on ? 'var(--ink)' : 'var(--slate-400)',
                  }}
                >
                  {f.on ? (
                    <Icon name="check" size={12} style={{ color: 'var(--ok)' }} />
                  ) : (
                    <span style={{ width: 8, height: 1.5, background: 'var(--slate-300)', borderRadius: 2, margin: '0 2px' }} />
                  )}
                  {f.t}
                </div>
              ))}
            </div>
            <button
              onClick={() => onSelect(tier)}
              disabled={isDisabled}
              aria-disabled={isDisabled}
              title={isLocked && lockedReason ? lockedReason : undefined}
              style={{
                width: '100%',
                padding: '11px 0',
                borderRadius: 10,
                fontSize: 13.5,
                fontWeight: 600,
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                opacity: isDisabled ? (isLocked ? 0.5 : 0.7) : 1,
                fontFamily: 'inherit',
                ...(isLocked
                  ? { background: '#E2E8F0', color: '#64748B', border: '1px solid #CBD5E1' }
                  : tier.ctaStyle === 'primary'
                    ? { background: 'var(--au7o-blue)', color: '#fff', border: 'none' }
                    : tier.ctaStyle === 'dark'
                      ? { background: 'var(--ink)', color: '#fff', border: 'none' }
                      : { background: '#fff', color: 'var(--slate-700, #334155)', border: '1px solid var(--paper-line)' }),
              }}
            >
              {isLoading
                ? 'Loading…'
                : isCurrent
                  ? 'Current plan'
                  : isLocked
                    ? (lockedReason ?? 'Not available')
                    : tier.cta}
            </button>
          </div>
        );
      })}
    </div>
  );
}
