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
import { getKnownIssuesForArticle, LAYOUT_LAST_REVISED } from '@/lib/known-issues';
import { getLinkableDtcCodes } from '@/lib/dtc-codes';
import { reconcileLocalizedBMWIssues } from '@/lib/localized-known-issues-audit';
import { getBMWAuditedModel } from '@/lib/known-issues-audit-registry';
import { TechnicalArticleJsonLd, BreadcrumbJsonLd, FAQJsonLd } from '@/components/seo/JsonLd';
import { SiteFooter } from '@/components/shared/SiteFooter';
import { LocalizedIssueHashExpander } from '@/components/known-issues/LocalizedIssueHashExpander';

export const revalidate = 3600;
export const dynamicParams = false; // only (locale, slug) pairs that have a translation; else 404

export async function generateStaticParams() {
  return getAllLocaleSlugParams();
}

const SEV_KEY: Record<string, string> = {
  critical: 'sevCritical', high: 'sevHigh', medium: 'sevMedium', low: 'sevLow',
};
const SEV_STYLE: Record<string, { color: string; bg: string; border: string }> = {
  critical: { color: '#FFFFFF', bg: '#8B1E1E', border: '#8B1E1E' },
  high: { color: '#FFFFFF', bg: '#8B1E1E', border: '#8B1E1E' },
  medium: { color: '#0B1220', bg: '#F4A261', border: '#E58A2B' },
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

  const vehicle = `${model.make} ${model.model}`;
  const currentPublishedIssues = getBMWAuditedModel(slug)
    ? await getKnownIssuesForArticle(model.make, model.model)
    : [];
  const auditView = reconcileLocalizedBMWIssues(
    locale,
    slug,
    vehicle,
    model.issues,
    currentPublishedIssues,
  );
  const description = (auditView.intro ?? model.intro).slice(0, 160);

  const url = `https://au7o.io/${locale}/known-issues/${slug}`;
  const enUrl = `https://au7o.io/known-issues/${slug}`;
  // The root layout applies the Au7o title template. Supplying the brand here
  // would produce a duplicate "| Au7o | Au7o" title in rendered HTML.
  const title = model.h1;
  return {
    title,
    description,
    openGraph: { title: model.h1, description, type: 'article', url, siteName: 'Au7o', locale: cfg.ogLocale },
    twitter: { card: 'summary_large_image', title: model.h1, description },
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

  const currentPublishedIssues = getBMWAuditedModel(slug)
    ? await getKnownIssuesForArticle(model.make, model.model)
    : [];
  const auditView = reconcileLocalizedBMWIssues(
    locale,
    slug,
    vehicle,
    model.issues,
    currentPublishedIssues,
  );
  const intro = auditView.intro ?? model.intro;
  const issues = [...auditView.issues].sort(
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
        description={intro.slice(0, 200)}
        url={url}
        datePublished={auditView.auditedOn ?? LAYOUT_LAST_REVISED}
        dateModified={auditView.auditedOn ?? LAYOUT_LAST_REVISED}
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
            <Link href="/" className="px-4 py-2 text-sm font-semibold bg-[#3B82F6] text-white rounded-lg hover:bg-blue-600 transition-colors">
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
            {issues.length} {tr('documentedProblems', 'documented problems')}
          </p>
        </header>

        {/* Intro / GEO */}
        <div className="bg-[#EFEDE6] border border-[#E3DFD4] rounded-xl p-5 sm:p-6 mb-8">
          <p className="text-[#334155] leading-relaxed">{intro}</p>
          {auditView.usesCurrentEnglishIssueCopy && (
            <p className="mt-3 text-xs font-medium text-[#64748B]" lang="en">
              Current evidence-audited issue details are shown in English while this translation is revalidated.
            </p>
          )}
        </div>

        {/* Issues */}
        <div className="space-y-4">
          <LocalizedIssueHashExpander />
          {issues.map((issue: TIssue) => {
            const sev = SEV_STYLE[issue.severity] || SEV_STYLE.medium;
            return (
              <details
                key={issue.id}
                id={issue.id}
                className="group scroll-mt-24 overflow-hidden rounded-xl border border-[#E3DFD4] bg-white"
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-3 p-5 [&::-webkit-details-marker]:hidden">
                  <span className="flex min-w-0 items-start gap-3">
                    <svg className="mt-0.5 flex-none text-[#64748B]" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M12 3 2.8 19h18.4L12 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                      <path d="M12 9v4.5M12 17h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                    <h2 className="text-lg font-bold leading-snug text-[#0B1220]">{issue.title}</h2>
                  </span>
                  <span className="flex flex-none items-center gap-2">
                    <span
                      className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                      style={{ color: sev.color, background: sev.bg, border: `1px solid ${sev.border}` }}
                    >
                      {sevLabel(issue.severity)}
                    </span>
                    <svg className="mt-0.5 text-[#64748B] transition-transform group-open:rotate-180" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </summary>

                <div className="border-t border-[#E3DFD4] px-5 pb-5 pt-4">
                  <p className="mb-3 leading-relaxed text-[#475569]">{issue.description}</p>

                  {issue.symptoms.length > 0 && (
                    <p className="mb-2 text-sm text-[#475569]">
                      <span className="font-semibold text-[#334155]">{tr('symptomsLabel', 'Symptoms')}: </span>
                      {issue.symptoms.join(' · ')}
                    </p>
                  )}
                  {issue.solution && (
                    <p className="mb-2 text-sm text-[#475569]">
                      <span className="font-semibold text-[#334155]">{tr('solutionLabel', 'Fix')}: </span>
                      {issue.solution}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#64748B]">
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
                              className="rounded border border-blue-200 bg-blue-50 px-1.5 py-0.5 font-mono text-xs font-semibold text-[#3B82F6] underline decoration-blue-200 underline-offset-2 hover:bg-blue-100 hover:text-blue-700"
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
                </div>
              </details>
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
