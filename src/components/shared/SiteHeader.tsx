import Link from 'next/link';
import Image from 'next/image';

/**
 * Site header — the production sticky nav, extracted so pages other than the
 * landing page can render it. Visually identical to the one inside
 * LandingPage.tsx (same background, blur, border, logo lockup and links);
 * LandingPage is deliberately NOT refactored to use this, so the live homepage
 * can't be broken by a change here.
 *
 * `showSignIn` exists for the twin demo surfaces. Those pages are the beta
 * demand test — the one action we want is "reserve your spot" — so the quiet
 * Sign in link is dropped there rather than competing with it.
 */
const navLink: React.CSSProperties = {
  fontSize: 13.5,
  color: 'var(--slate-700, #334155)',
  fontWeight: 500,
  textDecoration: 'none',
};

export function SiteHeader({
  showSignIn = true,
  ctaLabel = 'Get started free',
  ctaShortLabel = 'Sign up',
  ctaHref = '/auth/signup',
}: {
  showSignIn?: boolean;
  ctaLabel?: string;
  /** Shown instead of ctaLabel below 760px, where the full label overflows. */
  ctaShortLabel?: string;
  ctaHref?: string;
}) {
  return (
    <header
      className="sticky top-0 z-30"
      style={{
        background: 'rgba(247,246,242,0.9)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--paper-line, #E3DFD4)',
      }}
    >
      <div
        className="flex items-center justify-between"
        style={{ padding: '14px 22px', maxWidth: 1200, margin: '0 auto' }}
      >
        {/* color is PINNED to --ink, not inherited. body sets `color: var(--foreground)`,
            which flips to #ededed under prefers-color-scheme: dark — and this header's
            background is a fixed light cream, so an inherited colour turns the wordmark
            near-white on near-white for anyone whose phone is in dark mode. */}
        <Link href="/" className="flex items-center gap-2" style={{ textDecoration: 'none', color: 'var(--ink, #0B1220)' }}>
          <Image src="/og-image.png" alt="Au7o" width={28} height={28} className="rounded-lg" />
          <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>
            Au<span style={{ color: 'var(--au7o-blue, #3B82F6)' }}>7</span>o
          </span>
        </Link>
        {/* Own class, not LandingPage's `lp-nav-links` — that rule lives in a
            <style jsx> block scoped to that component, so reusing the name here
            silently did nothing and the links overlapped the logo on mobile. */}
        <nav className="site-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          <Link href="/known-issues" style={navLink}>Known Issues</Link>
          <Link href="/drive" style={navLink}>Drive</Link>
          <Link href="/subscribe" style={navLink}>Pricing</Link>
          {showSignIn && <Link href="/auth/signin" style={navLink}>Sign in</Link>}
          <Link
            href={ctaHref}
            style={{
              padding: '8px 16px',
              background: 'var(--ink, #0B1220)',
              color: '#fff',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {/* Full label on desktop, short one on phones — "Reserve my spot"
                eats the whole bar at 390px. */}
            <span className="cta-label-full">{ctaLabel}</span>
            <span className="cta-label-short">{ctaShortLabel}</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
