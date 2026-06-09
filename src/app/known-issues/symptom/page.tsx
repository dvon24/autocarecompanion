import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getAllSymptoms, SEVERITY_META, type SymptomSeverity } from '@/lib/symptoms';
import { LAYOUT_LAST_REVISED } from '@/lib/known-issues';
import { BreadcrumbJsonLd, CollectionPageJsonLd, TechnicalArticleJsonLd } from '@/components/seo/JsonLd';
import { SiteFooter } from '@/components/shared/SiteFooter';

export const revalidate = 3600;

const URL = 'https://au7o.io/known-issues/symptom';

export const metadata: Metadata = {
  title: 'Car Symptoms — Diagnose by What You See, Hear or Smell | Au7o',
  description:
    'Diagnose your car by symptom: warning lights, noises, smoke, smells, and how it drives. Each symptom maps to its likely causes, the OBD-II codes behind it, and what to do.',
  openGraph: {
    title: 'Car Symptom Diagnosis | Au7o',
    description:
      'Find the likely cause of your car symptom — warning lights, noises, smoke, smells — plus the trouble codes and what to do.',
    type: 'website',
    url: URL,
    siteName: 'Au7o',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Car Symptom Diagnosis | Au7o',
    description: 'Diagnose your car by what you see, hear, or smell.',
  },
  alternates: { canonical: URL },
};

const SECTION_ORDER: SymptomSeverity[] = ['stop-driving', 'caution', 'safe-to-drive'];

export default function SymptomIndexPage() {
  const symptoms = getAllSymptoms();
  const grouped = SECTION_ORDER.map((sev) => ({
    sev,
    items: symptoms.filter((s) => s.severity === sev),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="min-h-screen" style={{ background: '#F7F6F2' }}>
      <TechnicalArticleJsonLd
        title="Car Symptom Diagnosis — by Warning Light, Noise, Smoke & Smell"
        description={`Diagnose your car by symptom across ${symptoms.length} common problems — likely causes, the OBD-II codes behind them, and what to do.`}
        url={URL}
        datePublished={LAYOUT_LAST_REVISED}
        dateModified={LAYOUT_LAST_REVISED}
      />
      <CollectionPageJsonLd
        name="Car Symptom Diagnosis"
        description="Common car symptoms and their likely causes."
        url={URL}
        numberOfItems={symptoms.length}
        itemListElement={symptoms.map((s) => ({
          name: s.title.replace(/\?.*$/, ''),
          url: `${URL}/${s.slug}`,
        }))}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Au7o', url: 'https://au7o.io' },
          { name: 'Known Issues', url: 'https://au7o.io/known-issues' },
          { name: 'Symptoms', url: URL },
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
            <Link href="/known-issues" className="px-4 py-2 text-sm font-medium text-[#475569] hover:text-[#0B1220] transition-colors">
              Known Issues
            </Link>
            <Link href="/" className="px-4 py-2 text-sm font-medium bg-[#0B1220] text-white rounded-lg hover:opacity-90 transition-opacity">
              Diagnose my car
            </Link>
          </div>
        </div>
      </header>

      <article className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Breadcrumb */}
        <nav className="text-sm text-[#64748B] mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5">
            <li><Link href="/" className="hover:text-[#334155]">Au7o</Link></li>
            <li>/</li>
            <li><Link href="/known-issues" className="hover:text-[#334155]">Known Issues</Link></li>
            <li>/</li>
            <li className="text-[#0B1220] font-medium">Symptoms</li>
          </ol>
        </nav>

        <header className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#0B1220] mb-3">Diagnose Your Car by Symptom</h1>
          <p className="text-[#475569] text-lg max-w-2xl">
            No trouble code? Start with what you&apos;re actually experiencing — a warning light, a noise, smoke, a
            smell, or how the car drives. Each page explains the likely causes, the OBD-II codes behind it, how
            serious it is, and what to do next.
          </p>
        </header>

        {/* GEO explainer */}
        <div className="bg-[#EFEDE6] border border-[#E3DFD4] rounded-xl p-5 sm:p-6 mb-8">
          <p className="text-[#334155] leading-relaxed">
            Most car problems announce themselves as a <strong>symptom</strong> before they ever throw a code — a
            dashboard light, a new noise, a puddle, or a change in how it drives. Browse the {symptoms.length}{' '}
            symptoms below, or{' '}
            <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
              snap a photo and let Au7o diagnose it
            </Link>{' '}
            for your exact vehicle at <strong>au7o.io</strong>.
          </p>
        </div>

        {grouped.map(({ sev, items }) => {
          const meta = SEVERITY_META[sev];
          return (
            <section key={sev} className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <span
                  className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ color: meta.color, background: meta.bg, border: `1px solid ${meta.border}` }}
                >
                  {meta.label}
                </span>
                <span className="text-sm text-[#94A3B8]">{items.length}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/known-issues/symptom/${s.slug}`}
                    className="block bg-white border border-[#E3DFD4] rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all"
                  >
                    <h2 className="font-semibold text-[#0B1220] leading-snug">{s.title.replace(/\?.*$/, '')}</h2>
                    <p className="text-[#64748B] text-sm mt-1 line-clamp-2">{s.metaDescription}</p>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </article>

      <SiteFooter />
    </div>
  );
}
