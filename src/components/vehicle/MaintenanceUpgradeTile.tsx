'use client';

import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';

/**
 * Compact upsell tile rendered where the Maintenance Schedule card
 * would have lived for signed-in free users. Matches the schedule
 * card's footprint so the hub layout stays balanced — empty space
 * here would read as a missing feature rather than a deliberate
 * tier gate.
 *
 * Rendered ONLY when:
 *   - User is signed in (anonymous users see neither schedule nor
 *     this tile — they're upstream of the signup conversion)
 *   - User's tier is free (Plus / Pro see the real schedule)
 *   - User has a matching vehicle in their garage (no point pushing
 *     maintenance tracking on a vehicle they don't own)
 *
 * The CTA deep-links to /subscribe?tier=plus so the pricing page
 * pre-selects the right plan.
 */
export function MaintenanceUpgradeTile() {
  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #fff 0%, #F5F8FF 100%)',
        border: '1px solid #E3DFD4',
        borderRadius: 16,
        padding: '20px 22px',
        boxShadow: '0 1px 2px rgba(11,18,32,.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle brand accent stripe on the left edge */}
      <span
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          background: 'linear-gradient(180deg, #3B82F6, #1D4ED8)',
        }}
        aria-hidden
      />

      <div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#3B82F6',
          }}
        >
          MAINTENANCE TRACKING · PLUS
        </div>
        <div
          style={{
            fontSize: 17,
            fontWeight: 600,
            letterSpacing: '-0.02em',
            marginTop: 4,
            lineHeight: 1.25,
            color: '#0B1220',
          }}
        >
          Stay ahead of every service
        </div>
      </div>

      <p
        style={{
          fontSize: 13,
          color: '#475569',
          lineHeight: 1.5,
          margin: 0,
        }}
      >
        See what&apos;s due, log completed services to your history, and get
        recall + alert notifications tailored to your trim. Free with{' '}
        <strong style={{ color: '#0B1220' }}>Au7o Plus</strong>.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 10,
          padding: '12px 0 4px',
          borderTop: '1px solid #E3DFD4',
        }}
      >
        {[
          ['Schedule', 'service intervals'],
          ['History', 'logged completions'],
          ['Alerts', 'recalls + reminders'],
        ].map(([label, sub]) => (
          <div key={label}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#0B1220',
                letterSpacing: '-0.01em',
              }}
            >
              {label}
            </div>
            <div style={{ fontSize: 11, color: '#64748B', marginTop: 1 }}>
              {sub}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <Link
          href="/subscribe?tier=plus"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 18px',
            background: '#3B82F6',
            color: '#fff',
            borderRadius: 10,
            fontSize: 13.5,
            fontWeight: 600,
            textDecoration: 'none',
            boxShadow: '0 6px 16px rgba(59,130,246,0.28)',
          }}
        >
          <Icon name="check" size={14} /> Upgrade to Plus · $14.99/mo
        </Link>
        <span style={{ fontSize: 11.5, color: '#64748B' }}>Cancel anytime</span>
      </div>
    </div>
  );
}
