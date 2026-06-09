import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getDTCDirectory } from '@/lib/dtc-codes';
import { LAYOUT_LAST_REVISED } from '@/lib/known-issues';
import { BreadcrumbJsonLd, TechnicalArticleJsonLd } from '@/components/seo/JsonLd';
import { SiteFooter } from '@/components/shared/SiteFooter';
import { ShareButtons } from '@/components/shared/ShareButtons';
import { DTCDirectory } from '@/components/known-issues/DTCDirectory';

export const revalidate = 3600;

const URL = 'https://au7o.io/known-issues/dtc';

export const metadata: Metadata = {
  title: 'OBD-II DTC Code Lookup — Trouble Code Directory | Au7o',
  description:
    'Look up any OBD-II diagnostic trouble code (DTC). What each P, B, C, and U code means, common causes, severity, and the real vehicles that throw it — with repair costs and fixes.',
  openGraph: {
    title: 'OBD-II DTC Code Lookup | Au7o',
    description:
      'Search OBD-II trouble codes — what they mean, common causes, and the vehicles that throw them.',
    type: 'website',
    url: URL,
    siteName: 'Au7o',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OBD-II DTC Code Lookup | Au7o',
    description: 'Search OBD-II trouble codes — meaning, causes, severity, and per-vehicle fixes.',
  },
  alternates: { canonical: URL },
};

export default async function DTCIndexPage() {
  const codes = await getDTCDirectory();
  const total = codes.length;

  return (
    <div className="min-h-screen" style={{ background: '#F7F6F2' }}>
      <TechnicalArticleJsonLd
        title="OBD-II DTC Code Lookup — Diagnostic Trouble Code Directory"
        description={`A directory of ${total} OBD-II diagnostic trouble codes — what each means, common causes, severity, and the real vehicles that throw them.`}
        url={URL}
        datePublished={LAYOUT_LAST_REVISED}
        dateModified={LAYOUT_LAST_REVISED}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Au7o', url: 'https://au7o.io' },
          { name: 'Known Issues', url: 'https://au7o.io/known-issues' },
          { name: 'DTC Codes', url: URL },
        ]}
      />

      {/* Header */}
      <header
        className="sticky top-0 z-30 px-6 py-4"
        style={{
          background: 'rgba(247,246,242,0.85)',
          backdropFilter: 'blur(20px) saturate(140%)',
          WebkitBackdropFilter: 'blur(20px) saturate(140%)',
          borderBottom: '1px solid #E3DFD4',
        }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/og-image.png" alt="Au7o mascot" width={32} height={32} className="rounded-lg" />
            <span className="text-2xl font-bold text-[#0B1220] tracking-tight">
              Au<span className="text-blue-600">7</span>o
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/known-issues"
              className="px-4 py-2 text-sm font-medium text-[#475569] hover:text-[#0B1220] transition-colors"
            >
              Known Issues
            </Link>
            <Link
              href="/"
              className="px-4 py-2 text-sm font-medium bg-[#0B1220] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Diagnose my car
            </Link>
          </div>
        </div>
      </header>

      <article className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Breadcrumb */}
        <nav className="text-sm text-[#64748B] mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-[#334155]">
                Au7o
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/known-issues" className="hover:text-[#334155]">
                Known Issues
              </Link>
            </li>
            <li>/</li>
            <li className="text-[#0B1220] font-medium">DTC Codes</li>
          </ol>
        </nav>

        {/* Title */}
        <header className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#0B1220] mb-3">OBD-II DTC Code Lookup</h1>
          <p className="text-[#475569] text-lg max-w-2xl">
            Search any diagnostic trouble code your scanner threw. Each page explains what the code means, its
            common causes, how serious it is, and the real vehicles that report it — with symptoms, repair costs,
            and fixes.
          </p>
          <div className="mt-4">
            <ShareButtons url={URL} title="OBD-II DTC Code Lookup | Au7o" />
          </div>
        </header>

        {/* GEO / general explainer */}
        <div className="bg-[#EFEDE6] border border-[#E3DFD4] rounded-xl p-5 sm:p-6 mb-8">
          <p className="text-[#334155] leading-relaxed">
            A <strong>DTC (Diagnostic Trouble Code)</strong> is the 5-character code an OBD-II scanner reads from
            your car&apos;s computer when the check-engine light comes on. The first letter tells you the system:{' '}
            <strong>P</strong> = powertrain (engine/transmission), <strong>B</strong> = body, <strong>C</strong> =
            chassis, <strong>U</strong> = network. A &ldquo;P0&rdquo; prefix means it&apos;s a generic code defined
            for every manufacturer; &ldquo;P1&rdquo; means it&apos;s maker-specific. A code points you at the
            affected <em>system</em>, not the exact broken part — the same code can have several causes, which is
            why Au7o pairs each code with the real failures owners actually find. No code yet? Start from{' '}
            <Link href="/known-issues/symptom" className="text-blue-600 hover:text-blue-800 font-medium">
              what your car is doing
            </Link>{' '}
            instead. Browse the {total.toLocaleString()} codes below, or{' '}
            <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
              snap a photo of the problem
            </Link>{' '}
            and let Au7o diagnose it at <strong>au7o.io</strong>.
          </p>
        </div>

        {/* Searchable directory */}
        {total > 0 ? (
          <DTCDirectory codes={codes} />
        ) : (
          <p className="text-[#64748B]">Our DTC reference is being rebuilt — check back shortly.</p>
        )}
      </article>

      <SiteFooter />
    </div>
  );
}
