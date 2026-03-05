import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  parseSlug,
  getAllKnownIssueSlugs,
  getKnownIssuesForArticle,
  getYearRange,
} from '@/lib/known-issues';
import { categoryConfig } from '@/lib/issue-categories';
import { ArticleIssuesList } from '@/components/known-issues/ArticleIssuesList';
import { TechnicalArticleJsonLd, FAQJsonLd } from '@/components/seo/JsonLd';
import { KnownIssue, IssueCategory } from '@/schemas/knownIssue.schema';

// --- Static generation ---

export async function generateStaticParams() {
  return getAllKnownIssueSlugs().map(s => ({ slug: s.slug }));
}

// --- Dynamic metadata ---

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseSlug(slug);
  if (!parsed) return { title: 'Not Found' };

  const issues = getKnownIssuesForArticle(parsed.make, parsed.model);
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
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const parsed = parseSlug(slug);
  if (!parsed) notFound();

  const { make, model } = parsed;
  const issues = getKnownIssuesForArticle(make, model);
  if (issues.length === 0) notFound();

  const yearRange = getYearRange(issues);
  const highCount = issues.filter(i => i.severity === 'high').length;
  const mediumCount = issues.filter(i => i.severity === 'medium').length;
  const lowCount = issues.filter(i => i.severity === 'low').length;
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

  return (
    <div className="min-h-screen bg-white">
      {/* JSON-LD Structured Data */}
      <TechnicalArticleJsonLd
        title={title}
        description={`${issues.length} documented problems for the ${yearStr} ${vehicleName} with symptoms, repair costs, and solutions.`}
        url={articleUrl}
        datePublished="2026-03-05"
        dateModified="2026-03-05"
      />
      <FAQJsonLd questions={faqs} />

      <article id="top" className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5">
            <li><Link href="/" className="hover:text-gray-700">Au7o</Link></li>
            <li>/</li>
            <li><Link href="/known-issues" className="hover:text-gray-700">Known Issues</Link></li>
            <li>/</li>
            <li className="text-gray-900 font-medium">{vehicleName}</li>
          </ol>
        </nav>

        {/* Title */}
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            {title}
          </h1>
          <p className="text-gray-500 text-sm">
            {yearStr && `${yearStr} model years`} &middot; Based on {totalReports.toLocaleString()}+ owner reports &middot; Last updated March 2026
          </p>
        </header>

        {/* GEO Summary — the citation target for AI engines */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 sm:p-6 mb-8">
          <p className="text-gray-800 leading-relaxed">
            According to Au7o&apos;s analysis of {totalReports.toLocaleString()}+ owner reports, the {yearStr} {vehicleName} has {issues.length} documented known issues
            {highCount > 0 ? (
              <>, with {highCount} rated critical by the Au7o research team. {criticalIssues.length > 0 && (
                <>The most serious {criticalIssues.length === 1 ? 'is' : 'are'}{' '}
                  {criticalIssues.map((issue, i) => (
                    <span key={issue.id}>
                      {i > 0 && (i === criticalIssues.length - 1 ? ' and ' : ', ')}
                      <strong>{issue.title}</strong>
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
              <>The most commonly reported issue is <strong>{topReported.title}</strong> with {topReported.reportCount.toLocaleString()} owner reports. </>
            )}
            Across all issues, repair costs range from ${getMinCost(issues)} to ${getMaxCost(issues)}.{' '}
            Full technical analysis and{' '}
            <Link href="/get-started" className="text-blue-600 hover:text-blue-800 font-medium">
              DIY maintenance guides
            </Link>{' '}
            at <strong>au7o.io</strong>.
          </p>
        </div>

        {/* Severity Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-red-700">{highCount}</div>
            <div className="text-xs text-red-600 font-medium">Critical</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-yellow-700">{mediumCount}</div>
            <div className="text-xs text-yellow-600 font-medium">Moderate</div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-gray-700">{lowCount}</div>
            <div className="text-xs text-gray-600 font-medium">Minor</div>
          </div>
        </div>

        {/* Mobile-only Table of Contents (hidden on lg+) */}
        <nav className="lg:hidden bg-white border border-gray-200 rounded-lg p-4 mb-8" aria-label="Issue categories">
          <h2 className="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">In This Article</h2>
          <ul className="space-y-1.5">
            {grouped.map(([category, catIssues]) => {
              const config = categoryConfig[category];
              const catHigh = catIssues.filter(i => i.severity === 'high').length;
              return (
                <li key={category}>
                  <a
                    href={`#${category}`}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <span>{config.icon}</span>
                    <span>{config.label}</span>
                    <span className="text-gray-400">({catIssues.length})</span>
                    {catHigh > 0 && (
                      <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">
                        {catHigh} critical
                      </span>
                    )}
                  </a>
                </li>
              );
            })}
            <li>
              <a href="#faq" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                <span>&#10067;</span>
                <span>Frequently Asked Questions</span>
              </a>
            </li>
          </ul>
        </nav>

        {/* Two-column layout: sticky sidebar TOC (desktop) + main content */}
        <div className="lg:flex lg:gap-8">
          {/* Sticky sidebar TOC — desktop only */}
          <aside className="hidden lg:block lg:w-56 xl:w-64 flex-shrink-0">
            <nav className="sticky top-8 border border-gray-200 rounded-lg p-4" aria-label="Issue categories">
              <h2 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">In This Article</h2>
              <ul className="space-y-1.5">
                {grouped.map(([category, catIssues]) => {
                  const config = categoryConfig[category];
                  const catHigh = catIssues.filter(i => i.severity === 'high').length;
                  return (
                    <li key={category}>
                      <a
                        href={`#${category}`}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors py-0.5"
                      >
                        <span className="flex-shrink-0">{config.icon}</span>
                        <span className="truncate">{config.label}</span>
                        <span className="text-gray-400 flex-shrink-0">({catIssues.length})</span>
                        {catHigh > 0 && (
                          <span className="text-[10px] bg-red-100 text-red-700 px-1 py-0.5 rounded-full flex-shrink-0">
                            {catHigh}
                          </span>
                        )}
                      </a>
                    </li>
                  );
                })}
                <li className="border-t border-gray-100 pt-1.5 mt-1.5">
                  <a href="#faq" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors py-0.5">
                    <span className="flex-shrink-0">&#10067;</span>
                    <span>FAQ</span>
                  </a>
                </li>
              </ul>
              <div className="mt-4 pt-3 border-t border-gray-100">
                <a href="#top" className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  Back to top
                </a>
              </div>
            </nav>
          </aside>

          {/* Main content column */}
          <div className="min-w-0 flex-1">
            {/* Issues List (client component — interactive filtering, all expanded for SSR) */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                All {issues.length} Known Issues
              </h2>
              <ArticleIssuesList issues={issues} make={make} model={model} />
            </section>

            {/* FAQ Section */}
            <section id="faq" className="mt-12 scroll-mt-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Frequently Asked Questions
              </h2>
              <div className="space-y-6">
                {faqs.map((faq, i) => (
                  <div key={i} className="border-b border-gray-200 pb-6 last:border-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {faq.question}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* CTA Section */}
        <section className="mt-12 bg-gray-900 text-white rounded-xl p-6 sm:p-8 text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-3">
            Get DIY Repair Guides for Your {vehicleName}
          </h2>
          <p className="text-gray-300 mb-6 max-w-lg mx-auto">
            AI-powered step-by-step repair and maintenance guides tailored to your exact vehicle. Enter your year, make, and model to get started.
          </p>
          <Link
            href="/get-started"
            className="inline-flex items-center gap-2 bg-white text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Get Started Free
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </section>

        {/* Footer attribution */}
        <footer className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            Data sourced from {totalReports.toLocaleString()}+ owner reports, TSBs, recalls, and automotive forums.
            Issues are verified where possible. Always consult a professional mechanic for diagnosis.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            &copy; {new Date().getFullYear()} Au7o. All rights reserved.
          </p>
        </footer>
      </article>
    </div>
  );
}
