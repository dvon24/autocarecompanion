'use client';

import Link from 'next/link';
import Image from 'next/image';
import { HeroVehicleSearch } from '@/components/discovery/HeroVehicleSearch';
import { SiteFooter } from '@/components/shared/SiteFooter';
import { LiveHubDemo } from '@/components/marketing/LiveHubDemo';
import { TwinHero } from '@/components/home/TwinHero';
import { TwinPlayground } from '@/components/twin/stage/TwinPlayground';

/**
 * Landing page — Phase 4 redesign aligned with BMAD au7o(3)/10-
 * HomepageAndFeatures HomePageMerged. Leads with the photo / video
 * diagnosis pitch (the new differentiator) while preserving the
 * vehicle-picker tool that drives the free SEO funnel.
 *
 * Sections (top → bottom):
 *   1. Sticky nav  — Known Issues / Drive / Pricing / Sign in
 *   2. Two-column hero — value prop + "Upload a photo" CTA / vehicle picker
 *   3. Dark proof strip — site-level stats
 *   4. Diagnose-moment showcase — "Don't know the part? Just show it."
 *   5. How it works — 3 cards (capture · match · part + fix)
 *   6. Premium upsell — compact gradient block linking to /subscribe
 *   7. Legal footer + share + AI disclaimer + bottom nav
 *
 * Trending issues (passed in by the server page) intentionally aren't
 * rendered here anymore — the new structure routes that interest into
 * /known-issues where the SEO surface lives. Prop kept for API compat.
 */

interface TrendingIssue {
  id: string;
  make: string;
  model: string;
  title: string;
  category: string;
  severity: string;
  reportCount: number;
  yearRange: string;
  slug: string;
}

interface SiteStats {
  totalIssues: number;
  totalMakes: number;
  totalModels: number;
}

interface Props {
  trendingIssues?: TrendingIssue[];
  stats?: SiteStats;
}

export default function LandingPage({ stats }: Props) {
  const totalIssues = stats?.totalIssues ?? 4200;
  const totalMakes = stats?.totalMakes ?? 34;
  const totalModels = stats?.totalModels ?? 640;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: 'var(--paper, #F7F6F2)',
        color: 'var(--ink, #0B1220)',
        fontFamily: 'var(--font-geist-sans, system-ui, -apple-system, sans-serif)',
      }}
    >
      {/* ─── Sticky nav ─────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-30"
        style={{
          background: 'rgba(247,246,242,0.9)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid var(--paper-line, #E3DFD4)',
        }}
      >
        <div
          className="flex items-center justify-between"
          style={{ padding: '14px 22px', maxWidth: 1200, margin: '0 auto' }}
        >
          <Link href="/" className="flex items-center gap-2" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Image src="/og-image.png" alt="Au7o" width={28} height={28} className="rounded-lg" />
            <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>
              Au<span style={{ color: 'var(--au7o-blue, #3B82F6)' }}>7</span>o
            </span>
          </Link>
          <nav className="lp-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
            <Link href="/known-issues" style={navLink}>Known Issues</Link>
            <Link href="/drive" style={navLink}>Drive</Link>
            <Link href="/subscribe" style={navLink}>Pricing</Link>
            {/* Signup-first: "Sign in" is a quiet link, "Get started free" is
                the filled primary. On mobile the CSS below keeps only the last
                child (the primary), so the signup CTA is what survives. */}
            <Link href="/auth/signin" style={navLink}>Sign in</Link>
            <Link
              href="/auth/signup"
              style={{
                padding: '8px 16px',
                background: 'var(--ink, #0B1220)',
                color: '#fff',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Get started free
            </Link>
          </nav>
        </div>
      </header>

      {/* ─── Hero — Vehicle Twin demand test ─────────────────────── */}
      {/* Replaces the previous value-prop hero. The vehicle picker below it is
          deliberately kept: it was inside the old hero and is a live path into
          the known-issues catalogue, which is where our traffic actually goes. */}
      <TwinHero stage={<TwinPlayground />} issueCount={totalIssues} />
      <section style={{ padding: '0 22px 56px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <div style={{ maxWidth: 560 }} id="vehicle-picker">
          <HeroVehicleSearch />
        </div>
      </section>

      {/* ─── Proof strip ────────────────────────────────────────── */}
      <section style={{ background: 'var(--ink, #0B1220)', padding: '28px 22px' }}>
        <div
          style={{
            maxWidth: 1000,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(4,1fr)',
            gap: 24,
          }}
        >
          {[
            [`${totalIssues.toLocaleString()}+`, 'known issues matched'],
            ['Multi-vendor', 'OEM + Amazon + RockAuto'],
            [`${totalModels}+`, 'models covered'],
            [`${totalMakes}+`, 'makes (US + EU + JDM)'],
          ].map(([n, l], i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: '#fff',
                  letterSpacing: '-0.02em',
                  fontFamily: 'var(--font-geist-mono, ui-monospace, monospace)',
                }}
              >
                {n}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Live hub demo (design/15-FeatureCarousel) ──────────── */}
      <section style={{ background: 'linear-gradient(180deg,#0B1220,#111a2e)', padding: '64px 22px' }}>
        <div
          className="lp-hubdemo"
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'minmax(0,1fr) minmax(0,408px)',
            gap: 44,
            alignItems: 'center',
          }}
        >
          <style>{`@media (max-width: 900px){ .lp-hubdemo{ grid-template-columns:1fr !important; justify-items:center; text-align:center; } .lp-hubdemo .lp-hubdemo-cta{ justify-content:center; } }`}</style>
          {/* LEFT — copy + CTA */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 11px', borderRadius: 999, background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', marginBottom: 16 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3B82F6' }} />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: '#93C5FD' }}>ONE CHAT, YOUR WHOLE CAR</span>
            </div>
            <h2 style={{ fontSize: 34, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.1, margin: 0 }}>
              A mechanic that <span style={{ color: '#93C5FD' }}>knows your car</span>.
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: 'rgba(255,255,255,0.72)', marginTop: 14, maxWidth: 460 }}>
              Au7o tracks maintenance, open recalls, and known issues for your exact year, make, model &amp; trim — and diagnoses new problems from a photo, with the exact part and where to buy it. Watch it work →
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '20px 0 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                'Maintenance & recalls tracked automatically',
                'Snap a photo → exact part + verified buy link',
                'Answers tuned to your trim, saved to your garage',
              ].map((t) => (
                <li key={t} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14.5, color: 'rgba(255,255,255,0.85)' }}>
                  <span style={{ width: 20, height: 20, borderRadius: 999, background: 'rgba(16,185,129,0.18)', color: '#34D399', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flex: '0 0 auto' }}>✓</span>
                  {t}
                </li>
              ))}
            </ul>
            <div className="lp-hubdemo-cta" style={{ display: 'flex', gap: 12, marginTop: 26, flexWrap: 'wrap' }}>
              <Link href="/auth/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '13px 22px', borderRadius: 12, background: '#3B82F6', color: '#fff', fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>
                Create a free account →
              </Link>
              <Link href="/known-issues" style={{ display: 'inline-flex', alignItems: 'center', padding: '13px 20px', borderRadius: 12, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', color: '#fff', fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>
                Browse known issues
              </Link>
            </div>
          </div>
          {/* RIGHT — the live rotating hub demo */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <LiveHubDemo />
          </div>
        </div>
      </section>

      {/* ─── Premium upsell ─────────────────────────────────────── */}
      <section style={{ padding: '72px 22px 80px', maxWidth: 900, margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--au7o-blue, #3B82F6)' }}>
            Free to start
          </div>
          <h2 style={{ fontSize: 'clamp(24px, 4.5vw, 30px)', fontWeight: 700, letterSpacing: '-0.025em', margin: '8px 0 0' }}>
            Ready to go further?
          </h2>
          <p style={{ fontSize: 15, color: 'var(--slate-700, #334155)', lineHeight: 1.5, margin: '10px auto 0', maxWidth: 520 }}>
            Everything above is free. Plus &amp; Pro add unlimited diagnoses, service reminders, and your full garage.
          </p>
        </div>
        <div
          className="lp-upsell"
          style={{
            background: 'linear-gradient(135deg, var(--au7o-blue, #3B82F6), var(--au7o-blue-700, #1D4ED8))',
            borderRadius: 20,
            padding: '32px 36px',
            display: 'flex',
            alignItems: 'center',
            gap: 28,
            boxShadow: '0 16px 40px rgba(59,130,246,0.28)',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: '1 1 320px' }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.1em',
                color: 'rgba(255,255,255,0.7)',
                marginBottom: 8,
              }}
            >
              AU7O PLUS &amp; PRO
            </div>
            <h2
              style={{
                fontSize: 25,
                fontWeight: 700,
                letterSpacing: '-0.02em',
                margin: 0,
                color: '#fff',
              }}
            >
              Unlimited diagnoses + your full garage
            </h2>
            <p
              style={{
                fontSize: 14,
                color: 'rgba(255,255,255,0.85)',
                margin: '8px 0 0',
                lineHeight: 1.5,
              }}
            >
              Track maintenance, get service reminders, and save up to 10 vehicles. Start free.
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Link
              href="/subscribe"
              style={{
                display: 'inline-block',
                padding: '14px 26px',
                background: '#fff',
                color: 'var(--au7o-blue-700, #1D4ED8)',
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 700,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              See what&apos;s included
            </Link>
            <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.8)', marginTop: 9 }}>
              Plus from $14.99/mo · cancel anytime
            </div>
          </div>
        </div>
      </section>

      {/* Shared footer — same component used on known-issues pages. */}
      <SiteFooter />

      <style jsx global>{`
        .lp-hero-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: center;
        }
        .lp-show-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: center;
        }
        .lp-steps {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        @media (max-width: 880px) {
          .lp-hero-grid, .lp-show-grid { grid-template-columns: 1fr; gap: 32px; }
          .lp-steps { grid-template-columns: 1fr; gap: 14px; }
          .lp-nav-links { gap: 14px; }
          .lp-nav-links a:not(:last-child) { display: none; }
        }
      `}</style>
    </div>
  );
}

/* ── Small composable bits ────────────────────────────────────── */

const navLink: React.CSSProperties = {
  fontSize: 13.5,
  color: 'var(--slate-700, #334155)',
  fontWeight: 500,
  textDecoration: 'none',
};

/* Stat lived only in the old value-prop hero, which the twin hero replaced. */
