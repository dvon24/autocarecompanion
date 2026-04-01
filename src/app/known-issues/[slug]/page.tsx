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
} from '@/lib/known-issues';
import { getRecallsForArticle } from '@/lib/recalls';
import { categoryConfig } from '@/lib/issue-categories';
import { ArticleIssuesList } from '@/components/known-issues/ArticleIssuesList';
import { ArticleSidebar } from '@/components/known-issues/ArticleSidebar';
import { MobileBottomBar } from '@/components/known-issues/MobileBottomBar';
import { VehicleChatLink } from '@/components/known-issues/VehicleChatLink';
import { TechnicalArticleJsonLd, FAQJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { ShareButtons } from '@/components/shared/ShareButtons';
import { AdSlot } from '@/components/ads/AdSlot';
import { KnownIssue, IssueCategory } from '@/schemas/knownIssue.schema';

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
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const parsed = await parseSlug(slug);
  if (!parsed) return { title: 'Not Found' };

  const issues = await getKnownIssuesForArticle(parsed.make, parsed.model);
  const yearRange = getYearRange(issues);
  const highCount = issues.filter(i => i.severity === 'high').length;
  const totalReports = issues.reduce((sum, i) => sum + i.reportCount, 0);
  const vehicleName = `${parsed.make} ${parsed.model}`;
  const yearStr = yearRange ? `${yearRange.min}-${yearRange.max} ` : '';

  const title = `${vehicleName} Problems: ${issues.length} Issues Every Owner Should Know`;
  const description = `${issues.length} documented problems for the ${yearStr}${vehicleName}${highCount > 0 ? `, including ${highCount} critical` : ''}. Symptoms, repair costs ($${getMinCost(issues)}-$${getMaxCost(issues)}), and solutions from ${totalReports.toLocaleString()}+ owner reports.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `https://au7o.io/known-issues/${slug}`,
      siteName: 'Au7o',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `https://au7o.io/known-issues/${slug}`,
    },
  };
}

// --- Helper functions ---

function getMinCost(issues: KnownIssue[]): string {
  const costs = issues.filter(i => i.estimatedCost).map(i => i.estimatedCost!.low);
  return costs.length > 0 ? Math.min(...costs).toLocaleString() : '0';
}

function getMaxCost(issues: KnownIssue[]): string {
  const costs = issues.filter(i => i.estimatedCost).map(i => i.estimatedCost!.high);
  return costs.length > 0 ? Math.max(...costs).toLocaleString() : '0';
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
  faqs.push({
    question: `What are the most common ${vehicleName} problems?`,
    answer: `According to Au7o's analysis of ${totalReports.toLocaleString()}+ owner reports, the ${yearStr}${vehicleName} has ${issues.length} documented issues. The most frequently reported are: ${topIssues}. ${highIssues.length > 0 ? `Of these, ${highIssues.length} ${highIssues.length === 1 ? 'is' : 'are'} rated critical and should be addressed promptly.` : 'None are rated critical, but regular maintenance is recommended.'}`,
  });

  // FAQ 2: Reliability
  faqs.push({
    question: `Is the ${vehicleName} reliable?`,
    answer: `The ${yearStr}${vehicleName} has ${issues.length} known issues documented across ${totalReports.toLocaleString()}+ owner reports. ${highIssues.length === 0 ? `No issues are rated critical, suggesting generally good reliability.` : `${highIssues.length} issue${highIssues.length > 1 ? 's are' : ' is'} rated critical: ${highIssues.map(i => i.title).join(' and ')}. Prospective buyers should inspect for these issues and factor potential repair costs into their purchase decision.`} Regular maintenance following the manufacturer's schedule helps prevent many common problems.`,
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
      answer: `Reliability varies across model years of the ${vehicleName}. Based on owner reports, issues are most commonly reported in earlier model years. Au7o recommends checking the specific known issues for your target year before purchasing, and having a pre-purchase inspection performed by a qualified mechanic. Our known issues database covers the ${yearStr}${vehicleName} with ${issues.length} documented issues from ${totalReports.toLocaleString()}+ owner reports.`,
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
  const [issues, articleDates, related] = await Promise.all([
    getKnownIssuesForArticle(make, model),
    getArticleDates(make, model),
    getRelatedVehicles(make, model),
  ]);
  // Fetch after issues so we have the years array
  const allYears = issues.flatMap(i => i.vehicleMatch.years);
  const recalls = await getRecallsForArticle(make, model, [...new Set(allYears)]);
  if (issues.length === 0) notFound();

  const yearRange = getYearRange(issues);
  const highCount = issues.filter(i => i.severity === 'high').length;
  const totalReports = issues.reduce((sum, i) => sum + i.reportCount, 0);
  const grouped = groupByCategory(issues);
  const faqs = generateFAQs(make, model, issues, yearRange);

  const vehicleName = `${make} ${model}`;
  const yearStr = yearRange ? `${yearRange.min}-${yearRange.max}` : '';
  const articleUrl = `https://au7o.io/known-issues/${slug}`;
  const title = `${vehicleName} Problems: ${issues.length} Issues Every Owner Should Know`;

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
          <div className="flex items-center gap-3">
            <Link
              href="/known-issues"
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Known Issues
            </Link>
            <Link
              href="/get-started"
              className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Get Started
            </Link>
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
              {yearStr && `${yearStr} model years`} &middot; {totalReports.toLocaleString()}+ owner reports &middot; Updated April 2026
            </p>
            <ShareButtons url={articleUrl} title={title} />
          </div>
        </header>

        {/* GEO Summary — blockquote style for AI citation */}
        <blockquote className="border-l-4 border-blue-200 pl-5 mb-10">
          <p className="text-gray-600 leading-relaxed">
            According to Au7o&apos;s analysis of {totalReports.toLocaleString()}+ owner reports, the {yearStr} {vehicleName} has {issues.length} documented known issues
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
            <Link href="/get-started" className="text-blue-600 hover:text-blue-800 font-medium">
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
              <ArticleIssuesList issues={issues} make={make} model={model} initialYear={initialYear} />
            </section>

            {/* Single ad slot — after issues, before recalls */}
            <AdSlot slotId="auto" format="horizontal" className="my-10" />

            {/* NHTSA Recalls Section — collapsible */}
            {recalls.length > 0 && (
              <section id="recalls" className="scroll-mt-16 mb-10">
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer py-3 border-b border-gray-200 list-none">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      NHTSA Recalls ({recalls.length})
                    </h2>
                    <svg className="w-5 h-5 text-gray-400 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="pt-4 space-y-3">
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
                      <p className="text-sm text-gray-500 mt-3">
                        + {recalls.length - 5} more recalls.{' '}
                        <a href="https://www.nhtsa.gov/recalls" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                          Check all recalls on NHTSA.gov
                        </a>
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-3">
                      Recall data from NHTSA. Enter your VIN at{' '}
                      <a href="https://www.nhtsa.gov/recalls" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">NHTSA.gov</a>{' '}
                      to check recalls specific to your vehicle.
                    </p>
                  </div>
                </details>
              </section>
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
                <Link href="/get-started" className="text-blue-600 hover:text-blue-800 font-medium">
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

            {/* Footer attribution */}
            <footer className="pt-6 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400">
                Data sourced from {totalReports.toLocaleString()}+ owner reports, TSBs, recalls, and automotive forums.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                &copy; {new Date().getFullYear()} Au7o. All rights reserved.
              </p>
            </footer>
          </div>
        </div>
      </article>

      {/* Mobile fixed bottom bar */}
      <MobileBottomBar make={make} model={model} />
    </div>
  );
}
