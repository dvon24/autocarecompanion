import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  getSymptom,
  getAllSymptomSlugs,
  getLinkableDtcCodes,
  SEVERITY_META,
} from '@/lib/symptoms';
import { LAYOUT_LAST_REVISED } from '@/lib/known-issues';
import { TechnicalArticleJsonLd, BreadcrumbJsonLd, FAQJsonLd } from '@/components/seo/JsonLd';
import { SiteFooter } from '@/components/shared/SiteFooter';
import { ShareButtons } from '@/components/shared/ShareButtons';

export const revalidate = 3600;
export const dynamicParams = false; // only our curated symptoms; unknown slugs 404 cleanly

export async function generateStaticParams() {
  return getAllSymptomSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const s = getSymptom(slug);
  if (!s) return { title: 'Not Found' };
  const url = `https://au7o.io/known-issues/symptom/${slug}`;
  return {
    title: `${s.title} | Au7o`,
    description: s.metaDescription,
    openGraph: {
      title: s.title,
      description: s.metaDescription,
      type: 'article',
      url,
      siteName: 'Au7o',
    },
    twitter: { card: 'summary_large_image', title: s.title, description: s.metaDescription },
    alternates: { canonical: url },
  };
}

export default async function SymptomPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = getSymptom(slug);
  if (!s) notFound();

  const url = `https://au7o.io/known-issues/symptom/${slug}`;
  const sev = SEVERITY_META[s.severity];
  const linkable = await getLinkableDtcCodes(s.likelyDtcCodes);

  const faq = [
    { question: `What causes ${s.h1.replace(/:.*$/, '').toLowerCase()}?`, answer: s.commonCauses.map((c) => c.cause).join('; ') + '.' },
    { question: 'Is it safe to keep driving?', answer: s.whatToDo },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#F7F6F2' }}>
      <TechnicalArticleJsonLd
        title={s.h1}
        description={s.metaDescription}
        url={url}
        datePublished={LAYOUT_LAST_REVISED}
        dateModified={LAYOUT_LAST_REVISED}
      />
      <FAQJsonLd questions={faq} />
      <BreadcrumbJsonLd
        items={[
          { name: 'Au7o', url: 'https://au7o.io' },
          { name: 'Known Issues', url: 'https://au7o.io/known-issues' },
          { name: 'Symptoms', url: 'https://au7o.io/known-issues/symptom' },
          { name: s.title, url },
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
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/og-image.png" alt="Au7o mascot" width={32} height={32} className="rounded-lg" />
            <span className="text-2xl font-bold text-[#0B1220] tracking-tight">
              Au<span className="text-blue-600">7</span>o
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/known-issues/symptom" className="px-4 py-2 text-sm font-medium text-[#475569] hover:text-[#0B1220] transition-colors">
              All Symptoms
            </Link>
            <Link href="/" className="px-4 py-2 text-sm font-medium bg-[#0B1220] text-white rounded-lg hover:opacity-90 transition-opacity">
              Diagnose my car
            </Link>
          </div>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Breadcrumb */}
        <nav className="text-sm text-[#64748B] mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 flex-wrap">
            <li><Link href="/" className="hover:text-[#334155]">Au7o</Link></li>
            <li>/</li>
            <li><Link href="/known-issues" className="hover:text-[#334155]">Known Issues</Link></li>
            <li>/</li>
            <li><Link href="/known-issues/symptom" className="hover:text-[#334155]">Symptoms</Link></li>
            <li>/</li>
            <li className="text-[#0B1220] font-medium">{s.title.replace(/\?.*$/, '')}</li>
          </ol>
        </nav>

        {/* Severity + title */}
        <header className="mb-6">
          <span
            className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3"
            style={{ color: sev.color, background: sev.bg, border: `1px solid ${sev.border}` }}
          >
            {sev.label}
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#0B1220] mb-3">{s.h1}</h1>
          <div className="mt-3">
            <ShareButtons url={url} title={s.title} />
          </div>
        </header>

        {/* Intro / GEO */}
        <div className="bg-[#EFEDE6] border border-[#E3DFD4] rounded-xl p-5 sm:p-6 mb-8">
          <p className="text-[#334155] leading-relaxed">{s.intro}</p>
        </div>

        {/* Likely trouble codes */}
        {s.likelyDtcCodes.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-[#0B1220] mb-3">Trouble codes you may see</h2>
            <p className="text-[#475569] mb-3 text-sm">
              If you scan the car, these are the OBD-II codes most often behind this symptom:
            </p>
            <div className="flex flex-wrap gap-2">
              {s.likelyDtcCodes.map((code) =>
                linkable.has(code.toUpperCase()) ? (
                  <Link
                    key={code}
                    href={`/known-issues/dtc/${code.toLowerCase()}`}
                    className="px-3 py-1.5 rounded-lg text-sm font-mono font-semibold bg-white border border-[#E3DFD4] text-blue-700 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    {code}
                  </Link>
                ) : (
                  <span key={code} className="px-3 py-1.5 rounded-lg text-sm font-mono font-semibold bg-white border border-[#E3DFD4] text-[#475569]">
                    {code}
                  </span>
                ),
              )}
            </div>
          </section>
        )}

        {/* Photo/video diagnose CTA — a symptom searcher is at peak
            "what is wrong with MY car" intent; the photo flow answers it. */}
        <div className="mb-8">
        </div>

        {/* Common causes */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-[#0B1220] mb-4">Common causes</h2>
          <ol className="space-y-3">
            {s.commonCauses.map((c, i) => (
              <li key={i} className="bg-white border border-[#E3DFD4] rounded-xl p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#0B1220] text-white text-sm font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold text-[#0B1220]">{c.cause}</h3>
                    {c.detail && <p className="text-[#475569] text-sm mt-1 leading-relaxed">{c.detail}</p>}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* What to do */}
        {s.whatToDo && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-[#0B1220] mb-3">What to do</h2>
            <div className="bg-white border border-[#E3DFD4] rounded-xl p-5">
              <p className="text-[#334155] leading-relaxed">{s.whatToDo}</p>
            </div>
          </section>
        )}

        {/* Diagnose CTA */}
        <section className="bg-[#0B1220] rounded-2xl p-6 sm:p-8 text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Not sure it&apos;s your car?</h2>
          <p className="text-[#94A3B8] mb-5 max-w-md mx-auto">
            Snap a photo or describe what you&apos;re seeing and let Au7o confirm the likely cause for your exact
            year, make, and model — free.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-500 transition-colors"
          >
            Diagnose my car free
          </Link>
        </section>

        {/* Related */}
        <section className="text-sm text-[#64748B]">
          <Link href="/known-issues/symptom" className="text-blue-600 hover:text-blue-800 font-medium">
            ← Browse all car symptoms
          </Link>
          <span className="mx-2">·</span>
          <Link href="/known-issues/dtc" className="text-blue-600 hover:text-blue-800 font-medium">
            Look up a trouble code
          </Link>
        </section>
      </article>

      <SiteFooter />
    </div>
  );
}
