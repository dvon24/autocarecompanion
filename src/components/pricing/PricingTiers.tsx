'use client';

import { Icon } from '@/components/ui/Icon';
import { AU7O_TIERS, type Tier, type TierCtaStyle } from '@/lib/pricing/tiers';

/**
 * Desktop 3-column pricing grid. Pure presentation — clicking any tier
 * fires onSelect(tier) and the parent decides whether to redirect to
 * Stripe (Plus/Pro), show the "current plan" hint (Free), or open a
 * confirmation modal.
 *
 * Adapted from design/au7o (2)/bmad-handoff2/screens/12-Pricing.jsx.
 */
export function PricingTiers({
  onSelect,
  loadingTierId,
  currentTierId,
}: {
  onSelect: (tier: Tier) => void;
  loadingTierId?: string | null;
  currentTierId?: string | null;
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, alignItems: 'start' }}>
      {AU7O_TIERS.map((tier) => {
        const isCurrent = currentTierId === tier.id;
        const isLoading = loadingTierId === tier.id;
        return (
          <div
            key={tier.id}
            style={{
              background: '#fff',
              borderRadius: 18,
              overflow: 'hidden',
              border: tier.popular ? '2px solid var(--au7o-blue)' : '1px solid var(--paper-line)',
              boxShadow: tier.popular
                ? '0 16px 40px rgba(59,130,246,0.16)'
                : 'var(--shadow-1, 0 1px 2px rgba(11,18,32,0.06))',
              position: 'relative',
            }}
          >
            {tier.popular && (
              <div
                style={{
                  position: 'absolute',
                  top: 14,
                  right: 14,
                  padding: '3px 10px',
                  background: 'var(--au7o-blue)',
                  color: '#fff',
                  borderRadius: 999,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                }}
              >
                POPULAR
              </div>
            )}
            <div style={{ padding: '22px 22px 18px', borderBottom: '1px solid var(--paper-line)' }}>
              <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>{tier.name}</div>
              <div style={{ fontSize: 12.5, color: 'var(--slate-500)', marginTop: 3 }}>{tier.tagline}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginTop: 16 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--slate-500)' }}>$</span>
                <span
                  style={{
                    fontSize: 38,
                    fontWeight: 700,
                    letterSpacing: '-0.03em',
                    lineHeight: 1,
                    fontFamily: 'var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)',
                  }}
                >
                  {tier.price}
                </span>
                <span style={{ fontSize: 13, color: 'var(--slate-500)' }}>/mo</span>
              </div>
              <button
                onClick={() => onSelect(tier)}
                disabled={isLoading || isCurrent}
                style={{
                  width: '100%',
                  marginTop: 16,
                  padding: '11px 0',
                  borderRadius: 11,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: isLoading || isCurrent ? 'not-allowed' : 'pointer',
                  opacity: isLoading || isCurrent ? 0.7 : 1,
                  fontFamily: 'inherit',
                  ...btnStyle(tier.ctaStyle),
                }}
              >
                {isLoading ? 'Loading…' : isCurrent ? 'Current plan' : tier.cta}
              </button>
            </div>
            <div style={{ padding: '16px 22px 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {tier.features.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                  <span
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      flexShrink: 0,
                      marginTop: 1,
                      background: f.on ? 'rgba(16,185,129,0.12)' : 'var(--paper-2)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {f.on ? (
                      <Icon name="check" size={10} style={{ color: 'var(--ok)' }} />
                    ) : (
                      <span style={{ width: 7, height: 1.5, background: 'var(--slate-300)', borderRadius: 2 }} />
                    )}
                  </span>
                  <span
                    style={{
                      fontSize: 12.5,
                      color: f.on ? 'var(--ink)' : 'var(--slate-400)',
                      lineHeight: 1.4,
                    }}
                  >
                    {f.t}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function btnStyle(s: TierCtaStyle): React.CSSProperties {
  switch (s) {
    case 'ghost':
      return { background: '#fff', color: 'var(--slate-700, #334155)', border: '1px solid var(--paper-line)' };
    case 'primary':
      return {
        background: 'var(--au7o-blue)',
        color: '#fff',
        border: 'none',
        boxShadow: '0 6px 16px rgba(59,130,246,0.32)',
      };
    case 'dark':
      return { background: 'var(--ink)', color: '#fff', border: 'none' };
  }
}
