'use client';

import { LiveHubDemo } from '@/components/marketing/LiveHubDemo';

/**
 * The "prove it before the ask" value column for the auth pages, per
 * design/"Au7o - Signup Redesign". A dark panel: eyebrow → headline →
 * subcopy → the LIVE rotating hub demo → social proof. Sits on the left of
 * the split (or as the top cap on mobile); the signup/sign-in form is the ask.
 */
export function AuthValueColumn({
  eyebrow = 'YOUR CAR, IN ONE CHAT',
  headline,
  sub,
}: {
  eyebrow?: string;
  headline: React.ReactNode;
  sub: React.ReactNode;
}) {
  return (
    <div
      style={{ background: 'linear-gradient(160deg,#0B1220,#141d33 68%,#1b2748)' }}
      className="relative overflow-hidden flex flex-col justify-center px-8 py-12 lg:px-12"
    >
      {/* ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute"
        style={{ width: 460, height: 460, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.22), transparent 70%)', filter: 'blur(20px)', top: '-12%', right: '-16%' }}
      />
      <div className="relative z-[1] mx-auto w-full max-w-[520px]">
        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-4" style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3B82F6' }} />
          <span className="text-[11px] font-bold tracking-[0.06em]" style={{ color: '#93C5FD' }}>{eyebrow}</span>
        </div>
        <h2 className="text-white font-bold leading-[1.08] tracking-[-0.02em]" style={{ fontSize: 36 }}>
          {headline}
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.72)' }}>
          {sub}
        </p>

        <div className="mt-7 flex justify-center lg:justify-start">
          <LiveHubDemo />
        </div>

        {/* social proof */}
        <div className="mt-7 flex items-center gap-3">
          <div className="flex">
            {['#0166B1', '#1a1a1a', '#7a1f1f'].map((c, i) => (
              <span key={i} style={{ width: 24, height: 24, borderRadius: '50%', background: c, border: '2px solid #0B1220', marginLeft: i ? -8 : 0 }} />
            ))}
          </div>
          <span className="text-[12.5px]" style={{ color: 'rgba(255,255,255,0.7)' }}>
            <b className="text-white">26,000+ owners</b> track their cars with Au7o
          </span>
        </div>
      </div>
    </div>
  );
}
