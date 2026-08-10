import { KnownIssueAlertSignup } from '@/components/known-issues/KnownIssueAlertSignup';
import { AlertSignupPopup } from '@/components/known-issues/AlertSignupPopup';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { makeSlug, getMakeDates } from '@/lib/known-issues';
import { categoryConfig } from '@/lib/issue-categories';
import { BreadcrumbJsonLd, TechnicalArticleJsonLd } from '@/components/seo/JsonLd';
import { ShareButtons } from '@/components/shared/ShareButtons';
import { SiteFooter } from '@/components/shared/SiteFooter';
import { IssueCategory } from '@/schemas/knownIssue.schema';
import prisma from '@/lib/db';

// --- ISR + dynamic params ---

export const revalidate = 21600; // 6h — ~51 make pages, change rarely; cuts steady-state DB re-render load (article [slug] pages stay at 1h)
export const dynamicParams = true; // Allow on-demand rendering of new makes

// --- Make name utilities ---

/** Convert a make name to a URL slug. */
function makeToSlug(make: string): string {
  return make.toLowerCase().replace(/\s+/g, '-');
}

/**
 * Module-level cache mapping URL slugs back to the canonical make name
 * stored in the DB. Built lazily on first request and reused for the
 * lifetime of the process (the makes list is small — ~34 entries — and
 * stable across the SSG build). Replaces the previous lossy
 * slugToMakeDisplay() helper that title-cased + space-joined slug parts,
 * which corrupted hyphenated make names (e.g. "mercedes-benz" →
 * "Mercedes Benz" with a space, missing the DB row "Mercedes-Benz"
 * → empty page → soft 404 in Google's eyes).
 */
let _makeSlugIndex: Map<string, string> | null = null;
async function findMakeBySlug(slug: string): Promise<string | null> {
  if (!_makeSlugIndex) {
    const distinct = await prisma.knownIssue.findMany({
      where: { status: 'published' },
      distinct: ['make'],
      select: { make: true },
    });
    _makeSlugIndex = new Map(
      distinct.map(({ make }) => [makeToSlug(make), make]),
    );
  }
  return _makeSlugIndex.get(slug.toLowerCase()) ?? null;
}

// --- Data fetching ---

interface MakePageData {
  make: string;
  totalIssues: number;
  highCount: number;
  models: {
    slug: string;
    model: string;
    issueCount: number;
    highCount: number;
    yearRange: { min: number; max: number } | null;
  }[];
  categoryBreakdown: { category: IssueCategory; label: string; icon: string; count: number }[];
}

async function getMakePageData(makeSlugParam: string): Promise<MakePageData | null> {
  // Resolve slug → canonical make name via the DB-backed index. This is
  // lossless (uses the exact same slug function the sitemap + internal
  // links use) so it works for hyphenated makes like "Mercedes-Benz" and
  // non-ASCII makes like "Citroën" without special-casing each one.
  const canonicalMake = await findMakeBySlug(makeSlugParam);
  if (!canonicalMake) return null;

  const rows = await prisma.knownIssue.findMany({
    where: {
      make: canonicalMake,
      status: 'published',
    },
    select: { make: true, model: true, severity: true, years: true, category: true },
  });

  if (rows.length === 0) return null;

  // Use the actual make name from the DB for proper casing
  const actualMake = rows[0].make;

  // Group by model
  const modelMap: Record<string, {
    model: string;
    count: number;
    highCount: number;
    minYear: number;
    maxYear: number;
  }> = {};

  // Category counts
  const categoryCounts: Partial<Record<IssueCategory, number>> = {};

  let totalHigh = 0;

  for (const row of rows) {
    // Model grouping
    const key = row.model;
    if (!modelMap[key]) {
      modelMap[key] = { model: row.model, count: 0, highCount: 0, minYear: Infinity, maxYear: -Infinity };
    }
    modelMap[key].count++;
    if (row.severity === 'high') {
      modelMap[key].highCount++;
      totalHigh++;
    }
    for (const y of row.years) {
      if (y < modelMap[key].minYear) modelMap[key].minYear = y;
      if (y > modelMap[key].maxYear) modelMap[key].maxYear = y;
    }

    // Category counting
    const cat = row.category as IssueCategory;
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  }

  // Build models array sorted by issue count descending
  const models = Object.values(modelMap)
    .map(v => ({
      slug: makeSlug(actualMake, v.model),
      model: v.model,
      issueCount: v.count,
      highCount: v.highCount,
      yearRange: v.minYear === Infinity ? null : { min: v.minYear, max: v.maxYear },
    }))
    .sort((a, b) => a.model.localeCompare(b.model));

  // Build category breakdown sorted by count descending
  const categoryBreakdown = Object.entries(categoryCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([cat, count]) => {
      const config = categoryConfig[cat as IssueCategory] || { label: cat, icon: '' };
      return {
        category: cat as IssueCategory,
        label: config.label,
        icon: config.icon,
        count,
      };
    });

  return {
    make: actualMake,
    totalIssues: rows.length,
    highCount: totalHigh,
    models,
    categoryBreakdown,
  };
}

// --- Static generation ---

export async function generateStaticParams() {
  const distinct = await prisma.knownIssue.findMany({
    where: { status: 'published' },
    distinct: ['make'],
    select: { make: true },
  });

  return distinct.map(({ make }) => ({
    make: makeToSlug(make),
  }));
}

// --- Dynamic metadata ---

export async function generateMetadata({
  params,
}: {
  params: Promise<{ make: string }>;
}): Promise<Metadata> {
  const { make: makeParam } = await params;
  const data = await getMakePageData(makeParam);
  if (!data) return { title: 'Not Found' };

  const title = `${data.make} Known Issues & Problems | Au7o`;
  const description = `${data.totalIssues} documented problems across ${data.models.length} ${data.make} models${data.highCount > 0 ? `, including ${data.highCount} critical issues` : ''}. Symptoms, repair costs, and solutions compiled from NHTSA recalls, manufacturer TSBs, owner forums, and field reports.`;
  const url = `https://au7o.io/known-issues/make/${makeParam}`;

  return {
    // absolute so the root layout's "%s | Au7o" template doesn't double the
    // suffix (was rendering "... | Au7o | Au7o").
    title: { absolute: title },
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url,
      siteName: 'Au7o',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: url,
    },
  };
}

// --- Page component ---

export default async function MakeLandingPage({
  params,
}: {
  params: Promise<{ make: string }>;
}) {
  const { make: makeParam } = await params;
  const data = await getMakePageData(makeParam);
  if (!data) notFound();

  const { make, totalIssues, highCount, models, categoryBreakdown } = data;
  const makeUrl = `https://au7o.io/known-issues/make/${makeParam}`;
  const dates = await getMakeDates(make);
  const articleTitle = `${make} Known Issues & Problems — ${totalIssues} documented across ${models.length} models`;
  const articleDescription = `${totalIssues} documented ${make} problems across ${models.length} models${highCount > 0 ? `, including ${highCount} critical` : ''}. Known issues, repair costs, and solutions for every ${make} owner.`;

  return (
    <div className="min-h-screen" style={{ background: '#F7F6F2' }}>
      {/* JSON-LD — TechArticle gives Google a structured signal with a
          dateModified that floors at LAYOUT_LAST_REVISED, prompting a
          re-crawl after layout/template revisions even when underlying
          issue rows haven't changed. */}
      <TechnicalArticleJsonLd
        title={articleTitle}
        description={articleDescription}
        url={makeUrl}
        datePublished={dates.published}
        dateModified={dates.modified}
      />
      <BreadcrumbJsonLd items={[
        { name: 'Au7o', url: 'https://au7o.io' },
        { name: 'Known Issues', url: 'https://au7o.io/known-issues' },
        { name: make, url: makeUrl },
      ]} />

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
            <Image
              src="/og-image.png"
              alt="Au7o mascot"
              width={32}
              height={32}
              className="rounded-lg"
            />
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
            <li><Link href="/" className="hover:text-[#334155]">Au7o</Link></li>
            <li>/</li>
            <li><Link href="/known-issues" className="hover:text-[#334155]">Known Issues</Link></li>
            <li>/</li>
            <li className="text-[#0B1220] font-medium">{make}</li>
          </ol>
        </nav>

        {/* Title */}
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#0B1220] mb-3">
            {make} Known Issues & Problems
          </h1>
          <p className="text-[#475569] text-lg max-w-2xl">
            {totalIssues.toLocaleString()} documented problems across {models.length} {make} models. Every issue includes symptoms, repair costs, and solutions — compiled from NHTSA recalls, manufacturer TSBs, owner forums, and field reports.
          </p>
          <div className="mt-4">
            <ShareButtons url={makeUrl} title={`${make} Known Issues & Problems | Au7o`} />
          </div>
        </header>

        {/* Photo/video diagnose CTA — same banner as the article pages. */}
        <div className="mb-6">
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          <div className="bg-white border border-[#E3DFD4] rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-[#0B1220]">{totalIssues.toLocaleString()}</div>
            <div className="text-sm text-[#64748B]">Total Issues</div>
          </div>
          <div className="bg-white border border-[#E3DFD4] rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-[#0B1220]">{models.length}</div>
            <div className="text-sm text-[#64748B]">Models Covered</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-700">{highCount}</div>
            <div className="text-sm text-red-600">Critical Issues</div>
          </div>
        </div>

        {/* GEO Summary */}
        <div className="bg-[#EFEDE6] border border-[#E3DFD4] rounded-xl p-5 sm:p-6 mb-10">
          <p className="text-[#334155] leading-relaxed">
            According to Au7o&apos;s analysis, {make} vehicles have {totalIssues.toLocaleString()} documented known issues across {models.length} models
            {highCount > 0 ? (
              <>, with {highCount} rated critical by the Au7o research team</>
            ) : (
              <>. No issues are rated critical, indicating generally reliable ownership</>
            )}.{' '}
            The most commonly affected {make} model is the{' '}
            <Link href={`/known-issues/${models[0].slug}`} className="text-blue-600 hover:text-blue-800 font-medium">
              {models[0].model}
            </Link>{' '}
            with {models[0].issueCount} documented issues.{' '}
            Full technical analysis and{' '}
            <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
              DIY maintenance guides
            </Link>{' '}
            at <strong>au7o.io</strong>.
          </p>
        </div>

        {/* Models grid */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[#0B1220] mb-4">
            All {make} Models ({models.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {models.map((vehicle) => (
              <Link
                key={vehicle.slug}
                href={`/known-issues/${vehicle.slug}`}
                className="group flex items-center justify-between p-4 rounded-lg border border-[#E3DFD4] hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
              >
                <div className="min-w-0">
                  <div className="font-medium text-[#0B1220] group-hover:text-blue-700 transition-colors truncate">
                    {vehicle.model}
                  </div>
                  {vehicle.yearRange && (
                    <div className="text-xs text-[#64748B] mt-0.5">
                      {vehicle.yearRange.min}-{vehicle.yearRange.max}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  {vehicle.highCount > 0 && (
                    <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">
                      {vehicle.highCount} critical
                    </span>
                  )}
                  <span className="text-sm text-[#94A3B8]">
                    {vehicle.issueCount} issues
                  </span>
                  <svg className="w-4 h-4 text-[#CBD5E1] group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Category breakdown */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[#0B1220] mb-4">
            Issues by Category
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {categoryBreakdown.map(({ category, label, icon, count }) => (
              <Link
                key={category}
                href={`/known-issues/category/${category}`}
                className="group flex items-center gap-3 p-3 border border-[#E3DFD4] rounded-lg hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
              >
                <span className="text-lg flex-shrink-0">{icon}</span>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-[#0B1220] group-hover:text-blue-700 truncate">{label}</div>
                  <div className="text-xs text-[#64748B]">{count} issues</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-12 bg-[#0B1220] text-white rounded-xl p-6 sm:p-8 text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-3">
            Get DIY Repair Guides for Your {make}
          </h2>
          <p className="text-gray-300 mb-6 max-w-lg mx-auto">
            AI-powered step-by-step repair and maintenance guides tailored to your exact vehicle. Enter your year, make, and model to get started.
          </p>
          <Link
            href="/known-issues"
            className="inline-flex items-center gap-2 bg-[#3B82F6] text-white font-semibold px-6 py-3 rounded-lg hover:bg-[#2563EB] transition-colors"
          >
            Browse Known Issues
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </section>

        {/* Soft-conversion: make-level email alert capture (SEO-safe, additive client island). */}
        <div className="mb-8">
          <KnownIssueAlertSignup vehicleName={make} context={`make:${make}`} />
        </div>
        <AlertSignupPopup vehicleName={make} context={`make:${make}`} />

        {/* Cross-site sitemap for deep-link visitors. */}
        <SiteFooter />

        {/* Footer */}
        <footer className="mt-8 pt-6 border-t border-[#E3DFD4] text-center">
          <p className="text-xs text-[#64748B]">
            Data compiled from NHTSA recalls, manufacturer TSBs, owner forums, and AI-assisted research.
            Issues are verified where possible. Always consult a professional mechanic for diagnosis.
          </p>
          <p className="text-xs text-[#64748B] mt-2">
            &copy; {new Date().getFullYear()} Au7o. All rights reserved.
          </p>
        </footer>
      </article>
    </div>
  );
}
