import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  parseSlug,
  getAllKnownIssueSlugs,
  getKnownIssuesForArticle,
  getYearRange,
  getArticleDates,
  getRelatedVehicles,
  findRelatedVehiclesForIssues,
} from '@/lib/known-issues';
import { getRecallsForArticle } from '@/lib/recalls';
import { categoryConfig } from '@/lib/issue-categories';
import { ArticleIssuesList } from '@/components/known-issues/ArticleIssuesList';
import { ConfirmWithPhotoCTA } from '@/components/diagnose/ConfirmWithPhotoCTA';
import { ArticleSidebar } from '@/components/known-issues/ArticleSidebar';
import { MobileBottomBar } from '@/components/known-issues/MobileBottomBar';
import { VehicleChatLink } from '@/components/known-issues/VehicleChatLink';
import FutureModelYearNotice from '@/components/known-issues/FutureModelYearNotice';
import { TechnicalArticleJsonLd, FAQJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { ShareButtons } from '@/components/shared/ShareButtons';
import { OpenHubLink } from '@/components/known-issues/OpenHubLink';
import { SiteFooter } from '@/components/shared/SiteFooter';
import { AdSlot } from '@/components/ads/AdSlot';
import { KnownIssue, IssueCategory } from '@/schemas/knownIssue.schema';
import { sourceLabel, analysisAttribution, sourceFootnote, metaSourceTail, formatUpdatedLabel } from '@/lib/source-attribution';
import { vehicleSlug } from '@/lib/vehicle-slug';

// --- ISR + dynamic params ---

export const revalidate = 3600; // Re-generate cached pages every 1 hour
export const dynamicParams = true; // Allow on-demand rendering of new slugs

// --- Static generation ---

export async function generateStaticParams() {
  const slugs = await getAllKnownIssueSlugs();
  return slugs.map(s => ({ slug: s.slug }));
}

// --- Dynamic metadata ---

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ year?: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { year: yearParam } = await searchParams;
  const requestedYear = yearParam ? parseInt(yearParam, 10) : null;
  const parsed = await parseSlug(slug);
  if (!parsed) return { title: 'Not Found' };

  const allIssues = await getKnownIssuesForArticle(parsed.make, parsed.model);
  // Year-filtered indexable variant. When ?year=YYYY is set AND that year
  // has at least one documented issue, we treat this as a *separate*
  // canonical page from the all-years base — its own title, description,
  // and canonical URL. Multiplies index footprint ~5-7x.
  const yearIsValid = requestedYear != null && allIssues.some((i) => i.vehicleMatch.years.includes(requestedYear));
  const issues = yearIsValid
    ? allIssues.filter((i) => i.vehicleMatch.years.includes(requestedYear!))
    : allIssues;
  const yearRange = getYearRange(allIssues); // base range stays from full set
  const highCount = issues.filter((i) => i.severity === 'high').length;
  const totalReports = issues.reduce((sum, i) => sum + i.reportCount, 0);
  const vehicleName = `${parsed.make} ${parsed.model}`;

  // Title: when year-specific, lead with that single year. Otherwise the
  // full year range. Owners search "2014 BMW 1 Series problems" 5x more
  // than the bare model — explicit year match dominates range match.
  const titlePrefix = yearIsValid
    ? `${requestedYear}`
    : (yearRange ? `${yearRange.min}-${yearRange.max}` : '');
  const title = titlePrefix
    ? `${titlePrefix} ${vehicleName} Problems: ${issues.length} Issues Every Owner Should Know`
    : `${vehicleName} Problems: ${issues.length} Issues Every Owner Should Know`;

  const descPrefix = yearIsValid
    ? `${requestedYear} `
    : (yearRange ? `${yearRange.min}-${yearRange.max} ` : '');
  // Only render the cost range when we have real numbers to show.
  // When all issues lack cost data, drop the segment entirely instead
  // of advertising "$0-$0" or "$0-$500" — both signal missing data.
  const minCost = getMinCost(issues);
  const maxCost = getMaxCost(issues);
  const costSegment = minCost && maxCost ? `, repair costs ($${minCost}-$${maxCost})` : '';
  const description = `${issues.length} documented problems for the ${descPrefix}${vehicleName}${highCount > 0 ? `, including ${highCount} critical` : ''}. Symptoms${costSegment}, and ${metaSourceTail(totalReports)}.`;

  // Canonical splits between base and per-year variants. Each is a
  // distinct indexable URL; Google credits content + ranking to the
  // canonical that matches the request.
  const baseUrl = `https://au7o.io/known-issues/${slug}`;
  const canonical = yearIsValid ? `${baseUrl}?year=${requestedYear}` : baseUrl;

  // Thin year-variant guard. When a user (or crawler) hits the page
  // with ?year=YYYY but that year has zero documented issues, the page
  // gracefully falls back to all-years content — but the URL itself is
  // now a thin duplicate of the canonical base. Google correctly refused
  // to index ~150 of these (5/9 GSC "Crawled — currently not indexed"
  // report). Emitting noindex,follow makes the intent explicit so they
  // drop from the report on next recrawl: "don't index this URL, but
  // follow the canonical we point to so link equity still flows."
  const isThinYearVariant = requestedYear != null && !yearIsValid;

  return {
    title,
    description,
    robots: isThinYearVariant
      ? { index: false, follow: true, googleBot: { index: false, follow: true } }
      : undefined,
    openGraph: {
      title,
      description,
      type: 'article',
      url: canonical,
      siteName: 'Au7o',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical,
    },
  };
}

// --- Helper functions ---

// Cost-range helpers used in the meta description. Issues with no
// real cost data carry low=0 / high=0 in the DB (the AI research
// pipeline writes zeros when it can't find a cost estimate). Including
// those zeros makes the meta render "$0-$500" which signals to SERP
// readers that we don't have real data — a major CTR killer. Filter
// those out so the meta description shows only the cost range backed
// by actual data, or omits the range entirely when no issue has a
// real cost on file. Returns '' (empty) when there's nothing to show
// — caller renders the description without the cost segment.
function getMinCost(issues: KnownIssue[]): string {
  const costs = issues
    .filter(i => i.estimatedCost && i.estimatedCost.low > 0)
    .map(i => i.estimatedCost!.low);
  return costs.length > 0 ? Math.min(...costs).toLocaleString() : '';
}

function getMaxCost(issues: KnownIssue[]): string {
  const costs = issues
    .filter(i => i.estimatedCost && i.estimatedCost.high > 0)
    .map(i => i.estimatedCost!.high);
  return costs.length > 0 ? Math.max(...costs).toLocaleString() : '';
}

function groupByCategory(issues: KnownIssue[]) {
  const groups: Partial<Record<IssueCategory, KnownIssue[]>> = {};
  for (const issue of issues) {
    if (!groups[issue.category]) groups[issue.category] = [];
    groups[issue.category]!.push(issue);
  }
  return Object.entries(groups).sort(([, a], [, b]) => {
    const aHigh = a!.filter(i => i.severity === 'high').length;
    const bHigh = b!.filter(i => i.severity === 'high').length;
    if (aHigh !== bHigh) return bHigh - aHigh;
    return b!.length - a!.length;
  }) as [IssueCategory, KnownIssue[]][];
}

function generateFAQs(make: string, model: string, issues: KnownIssue[], yearRange: { min: number; max: number } | null) {
  const vehicleName = `${make} ${model}`;
  const yearStr = yearRange ? `${yearRange.min}-${yearRange.max} ` : '';
  const highIssues = issues.filter(i => i.severity === 'high');
  const totalReports = issues.reduce((sum, i) => sum + i.reportCount, 0);
  const costIssues = issues.filter(i => i.estimatedCost);

  const faqs: { question: string; answer: string }[] = [];

  // FAQ 1: Most common problems
  const topIssues = issues.slice(0, 3).map(i => i.title).join(', ');
  const reliabilityCorpus = totalReports > 0
    ? `documented across ${totalReports.toLocaleString()}+ owner reports`
    : `compiled from NHTSA recalls, manufacturer TSBs, and owner forum reports`;
  faqs.push({
    question: `What are the most common ${vehicleName} problems?`,
    answer: `According to ${analysisAttribution(totalReports)}, the ${yearStr}${vehicleName} has ${issues.length} documented issues. The most frequently reported are: ${topIssues}. ${highIssues.length > 0 ? `Of these, ${highIssues.length} ${highIssues.length === 1 ? 'is' : 'are'} rated critical and should be addressed promptly.` : 'None are rated critical, but regular maintenance is recommended.'}`,
  });

  // FAQ 2: Reliability
  faqs.push({
    question: `Is the ${vehicleName} reliable?`,
    answer: `The ${yearStr}${vehicleName} has ${issues.length} known issues ${reliabilityCorpus}. ${highIssues.length === 0 ? `No issues are rated critical, suggesting generally good reliability.` : `${highIssues.length} issue${highIssues.length > 1 ? 's are' : ' is'} rated critical: ${highIssues.map(i => i.title).join(' and ')}. Prospective buyers should inspect for these issues and factor potential repair costs into their purchase decision.`} Regular maintenance following the manufacturer's schedule helps prevent many common problems.`,
  });

  // FAQ 3: Maintenance cost
  if (costIssues.length > 0) {
    const minCost = Math.min(...costIssues.map(i => i.estimatedCost!.low));
    const maxCost = Math.max(...costIssues.map(i => i.estimatedCost!.high));
    faqs.push({
      question: `How much does it cost to fix common ${vehicleName} problems?`,
      answer: `Repair costs for known ${vehicleName} issues range from $${minCost.toLocaleString()} to $${maxCost.toLocaleString()}, depending on the specific problem and whether you choose DIY or professional repair. ${highIssues.length > 0 && highIssues[0].estimatedCost ? `The most critical issue, ${highIssues[0].title}, typically costs $${highIssues[0].estimatedCost.low.toLocaleString()}-$${highIssues[0].estimatedCost.high.toLocaleString()} to repair.` : ''} Au7o provides step-by-step DIY maintenance guides that can help reduce repair costs.`,
    });
  }

  // FAQ 4: What year is most reliable
  if (yearRange && yearRange.max - yearRange.min > 2) {
    faqs.push({
      question: `What year ${vehicleName} is the most reliable?`,
      answer: `Reliability varies across model years of the ${vehicleName}. Based on documented issues, problems are most commonly reported in earlier model years. Au7o recommends checking the specific known issues for your target year before purchasing, and having a pre-purchase inspection performed by a qualified mechanic. Our known issues database covers the ${yearStr}${vehicleName} with ${issues.length} documented issues ${reliabilityCorpus}.`,
    });
  }

  // Per-issue Q&As. One entry for each documented issue gives Google
  // dozens of distinct, structured Q&A pairs per page — Gemini's
  // "Multiplier" recommendation. Capped at 20 to keep schema readable;
  // for pages with more issues we keep the highest-severity / most-reported
  // ones (which are also what users search for).
  const PER_ISSUE_FAQ_CAP = 20;
  const sortedForFaq = [...issues].sort((a, b) => {
    const order: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    const sevDiff = (order[a.severity] ?? 4) - (order[b.severity] ?? 4);
    if (sevDiff !== 0) return sevDiff;
    return b.reportCount - a.reportCount;
  }).slice(0, PER_ISSUE_FAQ_CAP);

  for (const issue of sortedForFaq) {
    const issueYears = issue.vehicleMatch?.years || [];
    const yearLabel = issueYears.length === 0
      ? ''
      : issueYears.length === 1
        ? `${issueYears[0]} `
        : `${issueYears[0]}-${issueYears[issueYears.length - 1]} `;
    const cost = issue.estimatedCost
      ? ` Repairs typically run $${issue.estimatedCost.low.toLocaleString()}-$${issue.estimatedCost.high.toLocaleString()}.`
      : '';
    // Trim to ~280 chars so the schema stays readable + Google doesn't
    // truncate. Description first sentence usually carries the symptom
    // detail that makes the answer useful.
    const desc = (issue.description || '').slice(0, 280).trim();
    const tail = desc.endsWith('.') ? desc : desc + '…';
    faqs.push({
      question: `What is the ${yearLabel}${vehicleName} ${issue.title}?`,
      answer: `${tail}${cost} Severity: ${issue.severity}.`,
    });
  }

  return faqs;
}

// --- Page component ---

export default async function KnownIssuesArticlePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ year?: string }>;
}) {
  const { slug } = await params;
  const { year: yearParam } = await searchParams;
  const initialYear = yearParam ? parseInt(yearParam, 10) : undefined;
  const parsed = await parseSlug(slug);
  if (!parsed) notFound();

  const { make, model } = parsed;
  const [allIssues, articleDates, related] = await Promise.all([
    getKnownIssuesForArticle(make, model),
    getArticleDates(make, model),
    getRelatedVehicles(make, model),
  ]);

  // Year-filtered indexable variant. When ?year=YYYY is set AND that year
  // has documented issues, we filter SERVER-SIDE so the SSR HTML
  // contains only that year's issues — Google indexes a year-specific
  // page (canonical = `?year=YYYY`) with year-specific content.
  // When the year is invalid or has no issues, we fall back to the
  // base view (all years) rather than 404, since users may bookmark
  // a year that no longer matches our data.
  const yearIsValid = initialYear != null && allIssues.some((i) => i.vehicleMatch.years.includes(initialYear));
  const issues = yearIsValid
    ? allIssues.filter((i) => i.vehicleMatch.years.includes(initialYear!))
    : allIssues;

  // Every year that has at least one documented issue across this make/model
  // — built from allIssues (PRE-filter) so the year-nav rail in
  // ArticleIssuesList can render a link for every ?year=YYYY variant. Each
  // link is a real <a href>, so Google's crawler discovers all per-year
  // canonicals from this single page; previously the year picker was a
  // <select> whose options weren't crawlable, leaving the per-year pages
  // orphaned in the link graph.
  const navYearsSet = new Set<number>();
  for (const i of allIssues) for (const y of i.vehicleMatch.years) navYearsSet.add(y);
  const navYears = [...navYearsSet].sort((a, b) => b - a);

  // Per-issue cross-vehicle links — issues that share DTC codes across
  // makes/models. Adds Gemini's "hub-and-spoke" internal-link network so
  // Google sees these pages as a connected library, not 900 isolated
  // pages. Cheap single batched query.
  const relatedByIssue = await findRelatedVehiclesForIssues(issues, make, model);
  // Fetch after issues so we have the years array
  const allYears = issues.flatMap(i => i.vehicleMatch.years);
  const recalls = await getRecallsForArticle(make, model, [...new Set(allYears)]);
  if (issues.length === 0) notFound();

  // For year-filtered variants the "yearRange" displayed is just that year.
  const yearRange = yearIsValid
    ? { min: initialYear!, max: initialYear! }
    : getYearRange(issues);

  // Future-model-year detection: user requested a specific year via
  // ?year=YYYY but that year had zero issues, so we fell back to
  // showing all years (above). Without this flag the fallback is
  // silent — the SERP says "2026 Mitsubishi Outlander Problems" and
  // the page loads with 2022-2024 content and no explanation. Set when
  // user explicitly asked for a year that isn't in our data but the
  // model itself has other-year coverage.
  const allYearsRange = getYearRange(allIssues);
  const showFutureYearNotice =
    initialYear != null && !yearIsValid && allIssues.length > 0 && allYearsRange != null;
  const highCount = issues.filter(i => i.severity === 'high').length;
  const totalReports = issues.reduce((sum, i) => sum + i.reportCount, 0);
  const grouped = groupByCategory(issues);
  const faqs = generateFAQs(make, model, issues, yearRange);

  const vehicleName = `${make} ${model}`;
  // Year display collapses to a single year when the user is on the
  // ?year=YYYY variant (yearRange.min === yearRange.max). For the all-
  // years base view it stays as a range like "2008-2019".
  const yearStr = yearRange
    ? (yearRange.min === yearRange.max ? `${yearRange.min}` : `${yearRange.min}-${yearRange.max}`)
    : '';
  // Canonical URL — base for all-years, ?year=YYYY for the year-filtered
  // variant. Must match the canonical we emit in generateMetadata.
  const articleUrl = yearIsValid
    ? `https://au7o.io/known-issues/${slug}?year=${initialYear}`
    : `https://au7o.io/known-issues/${slug}`;
  // Title now leads with the year (single year or full range). H1,
  // <title>, OG, and TechArticle.headline all derive from this string
  // so they stay in sync. Year prefix is the highest-weight SEO signal
  // for these queries — owners search "2014 BMW 1 Series problems" 5x
  // more than the bare model.
  const title = yearStr
    ? `${yearStr} ${vehicleName} Problems: ${issues.length} Issues Every Owner Should Know`
    : `${vehicleName} Problems: ${issues.length} Issues Every Owner Should Know`;

  // Find most critical issues for the GEO summary
  const criticalIssues = issues.filter(i => i.severity === 'high');
  const topReported = [...issues].sort((a, b) => b.reportCount - a.reportCount)[0];

  // Sidebar data
  const sidebarGroups = grouped.map(([cat, catIssues]) => ({
    category: cat,
    count: catIssues.length,
    highCount: catIssues.filter(i => i.severity === 'high').length,
  }));

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="px-6 py-4 border-b border-gray-100">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/og-image.png"
              alt="Au7o mascot"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="text-2xl font-bold text-gray-900 tracking-tight">
              Au<span className="text-blue-600">7</span>o
            </span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/known-issues"
              className="px-3 sm:px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors hidden sm:inline-block"
            >
              Known Issues
            </Link>
            {/* Open Hub — anonymous visitors land on the hub for THIS
                page's vehicle (a free preview of what the hub looks like
                for the model they're researching). Signed-in users route
                to "/" so they land on their own primary vehicle's hub
                instead of a stranger base-trim default. See OpenHubLink. */}
            <OpenHubLink
              articleSlug={vehicleSlug(yearRange?.max ?? new Date().getFullYear(), make, model)}
              className="px-3 sm:px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            />
          </div>
        </div>
      </header>

      {/* JSON-LD Structured Data */}
      <TechnicalArticleJsonLd
        title={title}
        description={`${issues.length} documented problems for the ${yearStr} ${vehicleName} with symptoms, repair costs, and solutions.`}
        url={articleUrl}
        datePublished={articleDates.published}
        dateModified={articleDates.modified}
      />
      <FAQJsonLd questions={faqs} />
      <BreadcrumbJsonLd items={[
        { name: 'Au7o', url: 'https://au7o.io' },
        { name: 'Known Issues', url: 'https://au7o.io/known-issues' },
        { name: make, url: `https://au7o.io/known-issues/make/${make.toLowerCase().replace(/\s+/g, '-')}` },
        { name: vehicleName, url: articleUrl },
      ]} />

      <article id="top" className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 pb-24 lg:pb-12">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5">
            <li><Link href="/" className="hover:text-gray-600">Au7o</Link></li>
            <li className="text-gray-300">/</li>
            <li><Link href="/known-issues" className="hover:text-gray-600">Known Issues</Link></li>
            <li className="text-gray-300">/</li>
            <li><Link href={`/known-issues/make/${make.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-gray-600">{make}</Link></li>
            <li className="text-gray-300">/</li>
            <li className="text-gray-700 font-medium">{model}</li>
          </ol>
        </nav>

        {/* Title */}
        <header className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            {title}
          </h1>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-gray-400 text-sm">
              {yearStr && `${yearStr} model year${yearRange && yearRange.min !== yearRange.max ? 's' : ''}`} &middot; {sourceLabel(totalReports)} &middot; {formatUpdatedLabel(articleDates.modified)}
            </p>
            <ShareButtons url={articleUrl} title={title} />
          </div>
        </header>

        {/* Future-model-year notice — shows when user requested a
            year via ?year= that has no data, so we fell back to the
            all-years view. Tells the user honestly rather than silently
            showing prior-gen content under a year-specific URL/SERP. */}
        {showFutureYearNotice && allYearsRange && (
          <FutureModelYearNotice
            requestedYear={initialYear!}
            vehicleName={vehicleName}
            yearRange={allYearsRange}
            slug={slug}
          />
        )}

        {/* GEO Summary — blockquote style for AI citation */}
        <blockquote className="border-l-4 border-blue-200 pl-5 mb-10">
          <p className="text-gray-600 leading-relaxed">
            According to {analysisAttribution(totalReports)}, the {yearStr} {vehicleName} has {issues.length} documented known issues
            {highCount > 0 ? (
              <>, with {highCount} rated critical. {criticalIssues.length > 0 && (
                <>The most serious {criticalIssues.length === 1 ? 'is' : 'are'}{' '}
                  {criticalIssues.map((issue, i) => (
                    <span key={issue.id}>
                      {i > 0 && (i === criticalIssues.length - 1 ? ' and ' : ', ')}
                      <strong className="text-gray-800">{issue.title}</strong>
                      {issue.estimatedCost && (
                        <> (${issue.estimatedCost.low.toLocaleString()}-${issue.estimatedCost.high.toLocaleString()} repair)</>
                      )}
                    </span>
                  ))}.{' '}
                </>
              )}</>
            ) : (
              <>. No issues are rated critical, indicating generally reliable ownership. </>
            )}
            {topReported && topReported.reportCount > 100 && (
              <>The most commonly reported issue is <strong className="text-gray-800">{topReported.title}</strong> with {topReported.reportCount.toLocaleString()} owner reports. </>
            )}
            Across all issues, repair costs range from ${getMinCost(issues)} to ${getMaxCost(issues)}.{' '}
            <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
              DIY maintenance guides
            </Link>{' '}
            at <strong className="text-gray-800">au7o.io</strong>.
          </p>
        </blockquote>

        {/* Two-column layout */}
        <div className="lg:flex lg:gap-0">
          {/* Sticky sidebar — desktop only */}
          <ArticleSidebar
            grouped={sidebarGroups}
            hasRecalls={recalls.length > 0}
            recallCount={recalls.length}
            make={make}
            model={model}
            hubYear={yearIsValid ? initialYear! : (yearRange?.max ?? new Date().getFullYear())}
          />

          {/* Main content */}
          <div className="min-w-0 flex-1">
            {/* Mobile TOC */}
            <nav className="lg:hidden border border-gray-200 rounded-lg p-4 mb-6" aria-label="Issue categories">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">In This Article</h2>
              <ul className="space-y-1">
                {grouped.map(([category, catIssues]) => {
                  const config = categoryConfig[category];
                  const catHigh = catIssues.filter(i => i.severity === 'high').length;
                  return (
                    <li key={category}>
                      <a
                        href={`#${category}`}
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors py-1"
                      >
                        <span>{config.icon}</span>
                        <span>{config.label}</span>
                        <span className="text-gray-300 text-xs ml-auto">{catIssues.length}</span>
                        {catHigh > 0 && (
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                        )}
                      </a>
                    </li>
                  );
                })}
                {recalls.length > 0 && (
                  <li>
                    <a href="#recalls" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors py-1">
                      <span>&#9888;&#65039;</span>
                      <span>Recalls</span>
                      <span className="text-gray-300 text-xs ml-auto">{recalls.length}</span>
                    </a>
                  </li>
                )}
                <li className="pt-1 border-t border-gray-100 mt-1">
                  <a href="#faq" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors py-1">
                    <span>&#10067;</span>
                    <span>FAQ</span>
                  </a>
                </li>
              </ul>
            </nav>

            {/* Issues List */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                All {issues.length} Known Issues
              </h2>
              {/* Confirm-with-a-photo CTA at the peak "is this my problem?"
                  moment. Server-rendered (crawlable, no hydration cost),
                  links to the anonymous /diagnose flow. Additive — sits
                  above the issue cards without displacing any content. */}
              <div className="mb-5">
                <ConfirmWithPhotoCTA />
              </div>
              <ArticleIssuesList
                issues={issues}
                make={make}
                model={model}
                initialYear={initialYear}
                allYears={navYears}
                relatedByIssueId={Object.fromEntries(relatedByIssue)}
              />
            </section>

            {/* Single ad slot — after issues, before recalls */}
            <AdSlot slotId="auto" format="horizontal" className="my-10" />

            {/* NHTSA Recalls Section — same style as category dropdowns */}
            {recalls.length > 0 && (
              <div id="recalls" className="scroll-mt-16 border border-gray-200 rounded-lg overflow-hidden mb-4">
                <details className="group">
                  <summary className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center gap-3 cursor-pointer list-none">
                    <span className="text-lg">⚠️</span>
                    <span className="font-medium text-gray-900 flex-1 text-left">NHTSA Recalls</span>
                    <span className="text-sm text-gray-500">{recalls.length} recall{recalls.length !== 1 ? 's' : ''}</span>
                    <svg className="w-5 h-5 text-gray-400 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="p-3 space-y-2 bg-white">
                    {recalls.slice(0, 5).map(recall => (
                      <div
                        key={recall.campaignNumber}
                        className={`border-l-4 pl-4 py-3 ${
                          recall.severity === 'critical' || recall.parkIt ? 'border-l-red-500' :
                          recall.severity === 'high' ? 'border-l-amber-400' :
                          'border-l-gray-300'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {recall.parkIt && (
                            <span className="text-xs font-bold bg-red-600 text-white px-2 py-0.5 rounded mt-0.5 flex-shrink-0">PARK IT</span>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900">{recall.component}</p>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{recall.summary}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                              <span>Campaign #{recall.campaignNumber}</span>
                              <span>{recall.reportDate}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {recalls.length > 5 && (
                      <p className="text-sm text-gray-500 mt-3 pl-4">
                        + {recalls.length - 5} more recalls.{' '}
                        <a href="https://www.nhtsa.gov/recalls" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                          Check all on NHTSA.gov
                        </a>
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-2 pl-4">
                      Enter your VIN at{' '}
                      <a href="https://www.nhtsa.gov/recalls" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">NHTSA.gov</a>{' '}
                      to check recalls specific to your vehicle.
                    </p>
                  </div>
                </details>
              </div>
            )}

            {/* Fallthrough CTA — simplified */}
            <div className="text-center py-8 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Don&apos;t see your problem?{' '}
                <VehicleChatLink
                  make={make}
                  model={model}
                  issues={issues}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Describe your symptoms
                </VehicleChatLink>{' '}
                to get a diagnosis, or{' '}
                <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
                  get a full repair guide
                </Link>.
              </p>
            </div>

            {/* Related Vehicles */}
            {related.length > 0 && (
              <section className="mb-10">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Other {make} Models
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {related.map(v => (
                    <Link
                      key={v.slug}
                      href={`/known-issues/${v.slug}`}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors group"
                    >
                      <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">
                        {v.make} {v.model}
                      </span>
                      <span className="text-xs text-gray-400">{v.issueCount}</span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* FAQ Section */}
            <section id="faq" className="scroll-mt-16 mb-10">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Frequently Asked Questions
              </h2>
              <div className="space-y-6">
                {faqs.map((faq, i) => (
                  <div key={i} className="border-b border-gray-100 pb-6 last:border-0">
                    <h3 className="text-base font-semibold text-gray-900 mb-2">
                      {faq.question}
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-sm">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* AI content disclaimer */}
            <div className="flex items-start gap-2 py-3">
              <svg className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-gray-400 leading-relaxed">
                Content on this page was compiled with AI assistance using NHTSA complaints, TSBs, owner reports, and public automotive data. While we strive for accuracy, this information may contain errors. Always verify repair procedures and specifications with your vehicle&apos;s service manual or a qualified mechanic.
              </p>
            </div>

            {/* Article-specific attribution stays inline so report
                count + © sits close to the article body. */}
            <footer className="pt-6 mt-8 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400">
                {sourceFootnote(totalReports)}
              </p>
            </footer>
          </div>
        </div>
      </article>

      {/* Site-wide footer (legal links + share + AI disclaimer + brand).
          Same component used on the home page and every other long-form
          public page. */}
      <SiteFooter />

      {/* Mobile fixed bottom bar — pass the requested year if valid,
          else the most recent documented year, so the Hub deep-link
          routes to the right /vehicle/[year-make-model] slug. */}
      <MobileBottomBar
        make={make}
        model={model}
        hubYear={yearIsValid ? initialYear! : (yearRange?.max ?? new Date().getFullYear())}
      />
    </div>
  );
}
