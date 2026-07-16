import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  getLocaleConfig,
  getTranslatedModel,
  getAllLocaleSlugParams,
  hreflangFor,
  t,
  type TIssue,
} from '@/lib/i18n';
import { LAYOUT_LAST_REVISED } from '@/lib/known-issues';
import { getLinkableDtcCodes } from '@/lib/dtc-codes';
import { TechnicalArticleJsonLd, BreadcrumbJsonLd, FAQJsonLd } from '@/components/seo/JsonLd';
import { SiteFooter } from '@/components/shared/SiteFooter';

export const revalidate = 3600;
export const dynamicParams = false; // only (locale, slug) pairs that have a translation; else 404

export async function generateStaticParams() {
  return getAllLocaleSlugParams();
}

const SEV_KEY: Record<string, string> = {
  critical: 'sevCritical', high: 'sevHigh', medium: 'sevMedium', low: 'sevLow',
};
const SEV_STYLE: Record<string, { color: string; bg: string; border: string }> = {
  critical: { color: '#0B1220', bg: '#E8E2D5', border: '#C9C0B1' },
  high: { color: '#0B1220', bg: '#E8E2D5', border: '#C9C0B1' },
  medium: { color: '#0B1220', bg: '#E8E2D5', border: '#C9C0B1' },
  low: { color: '#0B1220', bg: '#E8E2D5', border: '#C9C0B1' },
};
const SEV_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const cfg = getLocaleConfig(locale);
  const model = getTranslatedModel(locale, slug);
  if (!cfg || !model) return { title: 'Not Found' };

  const url = `https://au7o.io/${locale}/known-issues/${slug}`;
  const enUrl = `https://au7o.io/known-issues/${slug}`;
  const title = `${model.h1} | Au7o`;
  return {
    title,
    description: model.intro.slice(0, 160),
    openGraph: { title: model.h1, description: model.intro.slice(0, 160), type: 'article', url, siteName: 'Au7o', locale: cfg.ogLocale },
    twitter: { card: 'summary_large_image', title: model.h1, description: model.intro.slice(0, 160) },
    alternates: { canonical: url, languages: hreflangFor(slug, enUrl) },
  };
}

export default async function LocalizedKnownIssuesPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const cfg = getLocaleConfig(locale);
  const model = getTranslatedModel(locale, slug);
  if (!cfg || !model) notFound();

  // Only link DTC chips for codes that have a real reference page —
  // linking unknown codes creates internal links to 404s (GSC report).
  const linkableDtc = new Set(await getLinkableDtcCodes());

  const url = `https://au7o.io/${locale}/known-issues/${slug}`;
  const enUrl = `https://au7o.io/known-issues/${slug}`;
  const vehicle = `${model.make} ${model.model}`;
  const tr = (key: string, fallback: string) => t(locale, key, fallback);

  const issues = [...model.issues].sort(
    (a, b) => (SEV_ORDER[a.severity] ?? 4) - (SEV_ORDER[b.severity] ?? 4) || b.reportCount - a.reportCount,
  );
  const sevLabel = (s: string) => tr(SEV_KEY[s] || 'sevMedium', s);

  const faq = issues.slice(0, 12).map((i) => ({
    question: i.title,
    answer: `${i.description} ${i.solution}`.slice(0, 290),
  }));

  return (
    <div className="min-h-screen" style={{ background: '#F7F6F2' }}>
      <TechnicalArticleJsonLd
        title={model.h1}
        description={model.intro.slice(0, 200)}
        url={url}
        datePublished={LAYOUT_LAST_REVISED}
        dateModified={LAYOUT_LAST_REVISED}
      />
      <FAQJsonLd questions={faq} />
      <BreadcrumbJsonLd
        items={[
          { name: 'Au7o', url: 'https://au7o.io' },
          { name: tr('knownIssues', 'Known Issues'), url: `https://au7o.io/${locale}/known-issues` },
          { name: vehicle, url },
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
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <Image src="/og-image.png" alt="Au7o" width={32} height={32} className="rounded-lg" />
            <span className="text-2xl font-bold text-[#0B1220] tracking-tight">
              Au<span className="text-blue-600">7</span>o
            </span>
          </Link>
          <div className="flex items-center gap-3">
            {/* Language switcher → English */}
            <Link href={enUrl} className="px-3 py-2 text-sm font-medium text-[#475569] hover:text-[#0B1220] transition-colors" hrefLang="en">
              English
            </Link>
            <Link href="/" className="px-4 py-2 text-sm font-semibold bg-[#0B1220] text-white rounded-lg hover:opacity-90 transition-opacity">
              {tr('diagnoseCta', 'Diagnose my car')}
            </Link>
          </div>
        </div>
      </header>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Breadcrumb */}
        <nav className="text-sm text-[#64748B] mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 flex-wrap">
            <li><Link href="/" className="hover:text-[#334155]">Au7o</Link></li>
            <li>/</li>
            <li className="text-[#0B1220] font-medium">{vehicle}</li>
          </ol>
        </nav>

        {/* Title */}
        <header className="mb-6">
          <div className="text-[11px] font-semibold uppercase mb-3 tracking-wider text-blue-600">
            {model.make} · {tr('knownIssues', 'Known Issues')}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#0B1220] mb-3">{model.h1}</h1>
          <p className="text-sm text-[#64748B]">
            {model.issues.length} {tr('documentedProblems', 'documented problems')}
          </p>
        </header>

        {/* Intro / GEO */}
        <div className="bg-[#EFEDE6] border border-[#E3DFD4] rounded-xl p-5 sm:p-6 mb-8">
          <p className="text-[#334155] leading-relaxed">{model.intro}</p>
        </div>

        {/* Issues */}
        <div className="space-y-4">
          {issues.map((issue: TIssue) => {
            const sev = SEV_STYLE[issue.severity] || SEV_STYLE.medium;
            return (
              <section key={issue.id} className="bg-white border border-[#E3DFD4] rounded-xl p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h2 className="text-lg font-bold text-[#0B1220]">{issue.title}</h2>
                  <span
                    className="flex-shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                    style={{ color: sev.color, background: sev.bg, border: `1px solid ${sev.border}` }}
                  >
                    {sevLabel(issue.severity)}
                  </span>
                </div>
                <p className="text-[#475569] leading-relaxed mb-3">{issue.description}</p>

                {issue.symptoms.length > 0 && (
                  <p className="text-sm text-[#475569] mb-2">
                    <span className="font-semibold text-[#334155]">{tr('symptomsLabel', 'Symptoms')}: </span>
                    {issue.symptoms.join(' · ')}
                  </p>
                )}
                {issue.solution && (
                  <p className="text-sm text-[#475569] mb-2">
                    <span className="font-semibold text-[#334155]">{tr('solutionLabel', 'Fix')}: </span>
                    {issue.solution}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#64748B] mt-2">
                  {issue.costLow && issue.costHigh ? (
                    <span>
                      <span className="font-semibold text-[#334155]">{tr('repairCost', 'Repair cost')}: </span>
                      ${issue.costLow.toLocaleString()}–${issue.costHigh.toLocaleString()}
                    </span>
                  ) : null}
                  {issue.dtcCodes.length > 0 && (
                    <span className="flex flex-wrap gap-1.5">
                      {issue.dtcCodes.map((code) =>
                        linkableDtc.has(code.toLowerCase()) ? (
                          <Link
                            key={code}
                            href={`/known-issues/dtc/${code.toLowerCase()}`}
                            className="font-mono text-xs font-semibold text-[#3C313D] hover:underline"
                          >
                            {code}
                          </Link>
                        ) : (
                          <span key={code} className="font-mono text-xs font-semibold text-[#475569]">
                            {code}
                          </span>
                        ),
                      )}
                    </span>
                  )}
                </div>
              </section>
            );
          })}
        </div>

        {/* Diagnose CTA */}
        <section className="bg-[#0B1220] rounded-2xl p-6 sm:p-8 text-center my-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">{tr('notSure', "Not sure it's your car?")}</h2>
          <p className="text-[#94A3B8] mb-5 max-w-md mx-auto">
            {tr('diagnosePitch', 'Snap a photo or describe the problem and let Au7o confirm the likely cause for your exact vehicle — free.')}
          </p>
          <Link href="/" className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-500 transition-colors">
            {tr('diagnoseFreeCta', 'Diagnose my car free')}
          </Link>
        </section>

        {/* AI disclaimer + English link */}
        <p className="text-xs text-[#94A3B8] mb-3">
          {tr('aiDisclaimer', 'Compiled with AI assistance from owner reports, NHTSA data, and manufacturer bulletins — may contain errors.')}
        </p>
        <Link href={enUrl} className="text-sm text-blue-600 hover:text-blue-800 font-medium" hrefLang="en">
          {tr('readInEnglish', 'Read this page in English')} →
        </Link>
      </article>

      <SiteFooter />
    </div>
  );
}
