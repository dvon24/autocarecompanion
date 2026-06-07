'use client';

import Link from 'next/link';
import Image from 'next/image';
import { HeroVehicleSearch } from '@/components/discovery/HeroVehicleSearch';
import { Icon } from '@/components/ui/Icon';
import { SiteFooter } from '@/components/shared/SiteFooter';

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
            {/* FloatingAuthButton renders the auth-aware Sign in pill
                in the corner already — the nav link here is a
                redundant deeplink for users who scan headers instead
                of corners. Kept for parity with the BMAD design. */}
            <Link
              href="/auth/signin"
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
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      {/* ─── Hero ───────────────────────────────────────────────── */}
      <section
        className="lp-hero"
        style={{ padding: '60px 22px 64px', maxWidth: 1200, margin: '0 auto', width: '100%' }}
      >
        <div className="lp-hero-grid">
          {/* LEFT — value prop */}
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '5px 12px',
                background: 'var(--au7o-blue-50, #EFF6FF)',
                borderRadius: 999,
                marginBottom: 20,
              }}
            >
              <Icon name="camera" size={13} style={{ color: 'var(--au7o-blue, #3B82F6)' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--au7o-blue-700, #1D4ED8)' }}>
                New · Photo &amp; video diagnosis
              </span>
            </div>
            <h1
              style={{
                fontSize: 'clamp(36px, 7vw, 52px)',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                lineHeight: 1.04,
                margin: 0,
              }}
            >
              Know your car&apos;s<br />weak spots.
            </h1>
            <p
              style={{
                fontSize: 17.5,
                color: 'var(--slate-700, #334155)',
                lineHeight: 1.5,
                margin: '18px 0 0',
                maxWidth: 470,
              }}
            >
              Show Au7o a photo or video of the problem — it matches what it sees to{' '}
              <strong style={{ color: 'var(--ink, #0B1220)' }}>
                {totalIssues.toLocaleString()}+ known issues
              </strong>{' '}
              and the exact part. Or browse documented problems for your exact car, free.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 28, alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Anchor-scroll to the vehicle picker on the right /
                  stacked below on mobile. Picking a vehicle is the
                  prerequisite for the photo flow (the hub at
                  /vehicle/{slug} is where the upload composer lives),
                  so the CTA naturally walks the user into the right
                  next step instead of dumping them on the catalog. */}
              <a
                href="#vehicle-picker"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '14px 24px',
                  background: 'var(--au7o-blue, #3B82F6)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: 14.5,
                  fontWeight: 600,
                  textDecoration: 'none',
                  boxShadow: '0 8px 22px rgba(59,130,246,0.32)',
                }}
              >
                <Icon name="camera" size={15} /> Upload a photo to diagnose
              </a>
              <span style={{ fontSize: 13, color: 'var(--slate-500, #64748B)' }}>Free · no card needed</span>
            </div>
          </div>

          {/* RIGHT — the free vehicle picker tool */}
          <div
            id="vehicle-picker"
            style={{
              background: '#fff',
              border: '1px solid var(--paper-line, #E3DFD4)',
              borderRadius: 18,
              padding: 24,
              boxShadow: '0 16px 36px rgba(11,18,32,0.08), 0 2px 8px rgba(11,18,32,0.04)',
              scrollMarginTop: 80, // sticky nav clearance for anchor jump
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                marginBottom: 14,
                gap: 8,
                flexWrap: 'wrap',
              }}
            >
              <span style={{ fontSize: 14.5, fontWeight: 600, letterSpacing: '-0.01em' }}>
                Find issues for your car
              </span>
              <div style={{ display: 'flex', gap: 12 }}>
                <Stat n={`${totalIssues.toLocaleString()}+`} l="issues" />
                <Stat n={`${totalModels}+`} l="models" />
              </div>
            </div>
            <HeroVehicleSearch />
          </div>
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

      {/* ─── Diagnose-moment showcase ───────────────────────────── */}
      <section
        className="lp-show"
        style={{ padding: '64px 22px', maxWidth: 1160, margin: '0 auto', width: '100%' }}
      >
        <div className="lp-show-grid">
          {/* LEFT — illustrative diagnose card. Static SSR-friendly
              composition (no animation) so first paint is instant. */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <DiagnoseShowcase />
          </div>
          {/* RIGHT — copy */}
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--au7o-blue, #3B82F6)',
              }}
            >
              WHAT MAKES AU7O DIFFERENT
            </div>
            <h2
              style={{
                fontSize: 'clamp(26px, 4.6vw, 32px)',
                fontWeight: 700,
                letterSpacing: '-0.025em',
                margin: '8px 0 0',
                lineHeight: 1.1,
              }}
            >
              Don&apos;t know the part?
              <br />
              Just show it.
            </h2>
            <p
              style={{
                fontSize: 15,
                color: 'var(--slate-700, #334155)',
                lineHeight: 1.5,
                margin: '12px 0 24px',
                maxWidth: 440,
              }}
            >
              Most people can&apos;t name the part that&apos;s failing — but they can point a camera at it. Au7o does the rest.
            </p>
            <ValueRow icon="camera" title="Photo or video, even just audio">
              Snap a leak, record a rattle, or show the dashboard warning. Au7o reads them together.
            </ValueRow>
            <ValueRow icon="search" title="Matched to YOUR exact trim">
              Cross-referenced against {totalIssues.toLocaleString()}+ documented issues, filtered to your make, model, and engine.
            </ValueRow>
            <ValueRow icon="settings" title="The exact part + the fix">
              OEM part number, multi-vendor pricing (Amazon, RockAuto, OEM), and a step-by-step guide.
            </ValueRow>
          </div>
        </div>
      </section>

      {/* ─── How it works ──────────────────────────────────────── */}
      <section style={{ padding: '8px 22px 64px', maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--au7o-blue, #3B82F6)',
            }}
          >
            HOW IT WORKS
          </div>
          <h2
            style={{
              fontSize: 'clamp(24px, 4.5vw, 30px)',
              fontWeight: 700,
              letterSpacing: '-0.025em',
              margin: '8px 0 0',
            }}
          >
            From a photo to the fix in seconds
          </h2>
        </div>
        <div className="lp-steps">
          <StepCard
            n="01"
            icon="camera"
            title="Capture it"
            body="Photo, video, or a voice note describing the sound or smell. Au7o sees what's in frame."
          />
          <StepCard
            n="02"
            icon="search"
            title="Au7o matches it"
            body="It cross-references thousands of documented issues for your exact make, model, and trim."
          />
          <StepCard
            n="03"
            icon="settings"
            title="Get the part & fix"
            body="The right part number, what it costs, and a step-by-step guide — or book a shop."
          />
        </div>
      </section>

      {/* ─── Premium upsell ─────────────────────────────────────── */}
      <section style={{ padding: '0 22px 64px', maxWidth: 860, margin: '0 auto', width: '100%' }}>
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

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <span style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: 'var(--au7o-blue, #3B82F6)',
          fontFamily: 'var(--font-geist-mono, ui-monospace, monospace)',
        }}
      >
        {n}
      </span>
      <span style={{ fontSize: 11, color: 'var(--slate-500, #64748B)' }}>{l}</span>
    </span>
  );
}

function ValueRow({
  icon,
  title,
  children,
}: {
  icon: 'camera' | 'search' | 'settings';
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 14 }}>
      <span
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: 'var(--au7o-blue-50, #EFF6FF)',
          color: 'var(--au7o-blue, #3B82F6)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon name={icon} size={17} />
      </span>
      <div>
        <div style={{ fontSize: 14.5, fontWeight: 600, letterSpacing: '-0.005em' }}>{title}</div>
        <p style={{ fontSize: 13, color: 'var(--slate-700, #334155)', lineHeight: 1.5, margin: '3px 0 0' }}>
          {children}
        </p>
      </div>
    </div>
  );
}

function StepCard({
  n,
  icon,
  title,
  body,
}: {
  n: string;
  icon: 'camera' | 'search' | 'settings';
  title: string;
  body: string;
}) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid var(--paper-line, #E3DFD4)',
        borderRadius: 16,
        padding: '24px 22px',
        boxShadow: 'var(--shadow-1, 0 1px 2px rgba(11,18,32,0.06))',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <span
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'var(--au7o-blue-50, #EFF6FF)',
            color: 'var(--au7o-blue, #3B82F6)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name={icon} size={20} />
        </span>
        <span
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: 'var(--paper-line, #E3DFD4)',
            fontFamily: 'var(--font-geist-mono, ui-monospace, monospace)',
          }}
        >
          {n}
        </span>
      </div>
      <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em' }}>{title}</div>
      <p style={{ fontSize: 13.5, color: 'var(--slate-700, #334155)', lineHeight: 1.5, margin: '6px 0 0' }}>
        {body}
      </p>
    </div>
  );
}

/**
 * Static, SSR-friendly "diagnose moment" illustration for the hero
 * showcase. Avoids the full BMAD DiagnoseHeroPhone (which depends on
 * client-only animation state). Conveys the value visually: a photo
 * frame on top, an identified-part card underneath.
 */
function DiagnoseShowcase() {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 380,
        background: '#fff',
        border: '1px solid var(--paper-line, #E3DFD4)',
        borderRadius: 22,
        padding: 20,
        boxShadow: '0 24px 60px rgba(11,18,32,0.12), 0 4px 12px rgba(11,18,32,0.06)',
      }}
    >
      {/* Faux photo frame */}
      <div
        style={{
          aspectRatio: '4 / 3',
          background: 'linear-gradient(135deg, #1E293B, #334155)',
          borderRadius: 14,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(255,255,255,0.4)',
            fontSize: 12,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          Your photo
        </div>
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            padding: '4px 10px',
            background: 'rgba(0,0,0,0.55)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 999,
            fontSize: 10,
            color: '#fff',
            fontWeight: 600,
            letterSpacing: '0.04em',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Icon name="camera" size={10} /> ANALYZING
        </div>
      </div>

      {/* Identified part card */}
      <div
        style={{
          marginTop: 14,
          padding: '14px 14px 12px',
          border: '1px solid var(--paper-line, #E3DFD4)',
          borderRadius: 12,
          background: '#FAFBFF',
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: 'var(--au7o-blue, #3B82F6)',
            textTransform: 'uppercase',
          }}
        >
          Identified
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em' }}>
            Front brake rotor (vented)
          </span>
          <span style={{ fontSize: 11, color: 'var(--slate-500, #64748B)' }}>92%</span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginTop: 8,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-geist-mono, ui-monospace, monospace)',
              background: 'var(--ink, #0B1220)',
              color: '#fff',
              padding: '2px 8px',
              borderRadius: 4,
              fontSize: 10.5,
              fontWeight: 600,
            }}
          >
            OEM 68249841AA
          </span>
          <span style={{ fontSize: 11, color: 'var(--slate-500, #64748B)' }}>· $180 – $340</span>
        </div>
      </div>
    </div>
  );
}
