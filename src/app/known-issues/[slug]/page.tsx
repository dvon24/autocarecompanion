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
import { getLinkableDtcCodes } from '@/lib/dtc-codes';
import { categoryConfig } from '@/lib/issue-categories';
import { ArticleIssuesList } from '@/components/known-issues/ArticleIssuesList';
import { ModelIssueSearch } from '@/components/known-issues/ModelIssueSearch';
import { ArticleSidebar } from '@/components/known-issues/ArticleSidebar';
import { FaqIcon, IssueCategoryIcon, RecallIcon } from '@/components/known-issues/IssueCategoryIcon';
import { MobileBottomBar } from '@/components/known-issues/MobileBottomBar';
import { VehicleChatLink } from '@/components/known-issues/VehicleChatLink';
import FutureModelYearNotice from '@/components/known-issues/FutureModelYearNotice';
import { TechnicalArticleJsonLd, FAQJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { ShareButtons } from '@/components/shared/ShareButtons';
import { KnownIssueAlertSignup } from '@/components/known-issues/KnownIssueAlertSignup';
import { AlertSignupPopup } from '@/components/known-issues/AlertSignupPopup';
import { SiteFooter } from '@/components/shared/SiteFooter';
import { AdSlot } from '@/components/ads/AdSlot';
import { KnownIssue, IssueCategory } from '@/schemas/knownIssue.schema';
import { sourceLabel, analysisAttribution, sourceFootnote, metaSourceTail, formatUpdatedLabel } from '@/lib/source-attribution';
import { vehicleSlug } from '@/lib/vehicle-slug';
import { getLocalesForSlug, hreflangFor } from '@/lib/i18n';

// --- ISR + dynamic params ---

export const revalidate = 3600; // Re-generate cached pages every 1 hour
export const dynamicParams = true; // Allow on-demand rendering of new slugs

// Add models here as their full-record audit reaches the SEO verification
// gate. This preserves existing metadata output for previously indexed pages.
const SEO_AUDITED_MODEL_SLUGS = new Set([
  'toyota-rav4',
  'audi-100',
  'audi-90',
  'audi-a1',
  'audi-a3',
  'audi-a4-avant',
  'audi-a5',
  'audi-a5-sportback',
  'audi-a6-allroad',
  'audi-a7',
  'audi-cabriolet',
  'audi-q2',
  'audi-q3',
  'audi-q4-e-tron',
  'audi-q5-sportback',
  'audi-q7',
  'audi-q8',
  'audi-q8-e-tron',
  'audi-r8',
  'audi-rs-e-tron-gt',
  'audi-rs-q8',
  'audi-rs4',
  'audi-rs6',
  'audi-s3',
  'audi-s4',
  'audi-s7',
  'audi-sq2',
  'audi-sq8',
  'audi-tt',
  'bmw-1-series',
  'bmw-2-series',
  'bmw-2-series-active-tourer',
  'bmw-3-series',
  'bmw-4-series',
  'bmw-5-series',
  'bmw-6-series',
  'bmw-7-series',
  'bmw-8-series',
  'bmw-i3',
  'bmw-i4',
  'bmw-i5',
  'bmw-i7',
  'bmw-i8',
  'bmw-ix',
  'bmw-ix3',
  'bmw-m2',
  'bmw-m240i',
  'bmw-m3',
  'bmw-m3-cs',
  'bmw-m340i',
  'bmw-m4',
  'bmw-m4-cs',
  'bmw-m5',
  'bmw-m6',
  'bmw-m8',
  'bmw-x1',
  'bmw-x2',
  'bmw-x3',
  'bmw-x3-m',
  'bmw-x4',
  'bmw-x4-m',
  'bmw-x5',
  'bmw-x5-m',
  'bmw-x6',
  'bmw-x6-m',
  'cadillac-allante',
  'cadillac-ats',
  'cadillac-catera',
  'cadillac-celestiq',
  'cadillac-ct4',
  'cadillac-ct5',
  'cadillac-ct6',
  'cadillac-cts',
  'cadillac-cts-v',
  'cadillac-deville',
  'cadillac-dts',
  'cadillac-eldorado',
  'cadillac-elr',
  'cadillac-escalade',
  'cadillac-escalade-esv',
  'cadillac-fleetwood',
  'cadillac-lyriq',
  'cadillac-seville',
  'cadillac-srx',
  'cadillac-sts',
  'cadillac-xt4',
  'cadillac-xt5',
  'cadillac-xt6',
  'cadillac-xts',
]);

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
  const baseYearLabel = SEO_AUDITED_MODEL_SLUGS.has(slug)
    ? getYearCoverageLabel(allIssues)
    : (yearRange
      ? (yearRange.min === yearRange.max ? `${yearRange.min}` : `${yearRange.min}-${yearRange.max}`)
      : '');
  const highCount = issues.filter((i) => i.severity === 'high').length;
  const totalReports = issues.reduce((sum, i) => sum + i.reportCount, 0);
  const vehicleName = `${parsed.make} ${parsed.model}`;

  if (issues.length === 0 && SEO_AUDITED_MODEL_SLUGS.has(slug)) {
    const title = `${vehicleName} Problems & Known Issues`;
    const description = `Evidence-reviewed ${vehicleName} owner reference with VIN-first recall guidance, symptom diagnosis next steps, and audited issue coverage from Au7o.`;
    const baseUrl = `https://au7o.io/known-issues/${slug}`;
    const isThinYearVariant = requestedYear != null;
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
        url: baseUrl,
        siteName: 'Au7o',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
      },
      alternates: { canonical: baseUrl },
    };
  }

  // Title: when year-specific, lead with that single year. Otherwise the
  // full year range. Owners search "2014 BMW 1 Series problems" 5x more
  // than the bare model — explicit year match dominates range match.
  const titlePrefix = yearIsValid
    ? `${requestedYear}`
    : baseYearLabel;
  const title = knownIssuesArticleTitle(slug, titlePrefix, vehicleName, issues.length);

  const descPrefix = yearIsValid
    ? `${requestedYear} `
    : (baseYearLabel ? `${baseYearLabel} ` : '');
  // Only render the cost range when we have real numbers to show.
  // When all issues lack cost data, drop the segment entirely instead
  // of advertising "$0-$0" or "$0-$500" — both signal missing data.
  const minCost = getMinCost(issues);
  const maxCost = getMaxCost(issues);
  const costSegment = minCost && maxCost ? `, repair costs ($${minCost}-$${maxCost})` : '';
  const description = issues.length === 1
    ? `1 documented problem for the ${descPrefix}${vehicleName}${highCount > 0 ? `, including ${highCount} critical` : ''}. ${costSegment ? `Symptoms${costSegment}, and` : 'Symptoms and'} ${metaSourceTail(totalReports)}.`
    : `${issues.length} documented problems for the ${descPrefix}${vehicleName}${highCount > 0 ? `, including ${highCount} critical` : ''}. Symptoms${costSegment}, and ${metaSourceTail(totalReports)}.`;

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

  // hreflang — only on the base (all-years) view, and only when a translated
  // version of this slug actually exists. Links en ↔ pt-BR/es + x-default.
  const hreflangLanguages =
    !yearIsValid && getLocalesForSlug(slug).length > 0 ? hreflangFor(slug, baseUrl) : undefined;

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
      ...(hreflangLanguages ? { languages: hreflangLanguages } : {}),
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

function getYearCoverageLabel(issues: KnownIssue[]): string {
  const years = [...new Set(issues.flatMap(i => i.vehicleMatch.years))]
    .sort((a, b) => a - b);
  if (years.length === 0) return '';

  const ranges: Array<{ start: number; end: number }> = [];
  for (const year of years) {
    const current = ranges[ranges.length - 1];
    if (!current || year > current.end + 1) {
      ranges.push({ start: year, end: year });
    } else {
      current.end = year;
    }
  }

  return ranges
    .map(({ start, end }) => start === end ? `${start}` : `${start}-${end}`)
    .join(', ');
}

// The root layout appends " | Au7o". Keep this portion at or below 52
// characters when possible so the complete title remains concise.
function knownIssuesArticleTitle(slug: string, yearLabel: string, vehicleName: string, issueCount: number): string {
  const vehicleWithYear = `${yearLabel} ${vehicleName}`.trim();
  if (!SEO_AUDITED_MODEL_SLUGS.has(slug)) {
    return `${vehicleWithYear} Problems: ${issueCount} Issue${issueCount === 1 ? '' : 's'} Every Owner Should Know`;
  }
  const candidates = [
    `${vehicleWithYear} Problems: ${issueCount} Known Issue${issueCount === 1 ? '' : 's'}`,
    `${vehicleWithYear} Problems & Issues`,
    `${vehicleName} Problems & Known Issues`,
    `${vehicleName} Problems`,
  ];

  return candidates.find((candidate) => candidate.length <= 52) ?? candidates[candidates.length - 1];
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

function generateFAQs(
  make: string,
  model: string,
  issues: KnownIssue[],
  yearRange: { min: number; max: number } | null,
  exactYearLabel = '',
) {
  const vehicleName = `${make} ${model}`;
  const yearStr = exactYearLabel
    ? `${exactYearLabel} `
    : yearRange
    ? `${yearRange.min === yearRange.max ? yearRange.min : `${yearRange.min}-${yearRange.max}`} `
    : '';
  const highIssues = issues.filter(i => i.severity === 'high');
  const totalReports = issues.reduce((sum, i) => sum + i.reportCount, 0);
  const costIssues = issues.filter(i => i.estimatedCost);
  const issueNoun = issues.length === 1 ? 'issue' : 'issues';

  const faqs: { question: string; answer: string }[] = [];

  // FAQ 1: Most common problems
  const topIssues = issues.slice(0, 3).map(i => i.title).join(', ');
  const reliabilityCorpus = totalReports > 0
    ? `documented across ${totalReports.toLocaleString()}+ owner reports`
    : `compiled from NHTSA recalls, manufacturer TSBs, and owner forum reports`;
  faqs.push({
    question: `What are the most common ${vehicleName} problems?`,
    answer: `According to ${analysisAttribution(totalReports)}, the ${yearStr}${vehicleName} has ${issues.length} documented ${issueNoun}. ${issues.length === 1 ? `The documented issue is: ${topIssues}.` : `The most frequently reported are: ${topIssues}.`} ${highIssues.length > 0 ? `Of these, ${highIssues.length} ${highIssues.length === 1 ? 'is' : 'are'} rated critical and should be addressed promptly.` : 'None are rated critical, but regular maintenance is recommended.'}`,
  });

  // FAQ 2: Reliability
  faqs.push({
    question: `Is the ${vehicleName} reliable?`,
    answer: `The ${yearStr}${vehicleName} has ${issues.length} known ${issueNoun} ${reliabilityCorpus}. ${highIssues.length === 0 ? `No issues are rated critical, suggesting generally good reliability.` : `${highIssues.length} issue${highIssues.length > 1 ? 's are' : ' is'} rated critical: ${highIssues.map(i => i.title).join(' and ')}. Prospective buyers should inspect for these issues and factor potential repair costs into their purchase decision.`} Regular maintenance following the manufacturer's schedule helps prevent many common problems.`,
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
      answer: `Reliability varies across model years of the ${vehicleName}. Based on documented issues, problems are most commonly reported in earlier model years. Au7o recommends checking the specific known issues for your target year before purchasing, and having a pre-purchase inspection performed by a qualified mechanic. Our known issues database covers the ${yearStr}${vehicleName} with ${issues.length} documented ${issueNoun} ${reliabilityCorpus}.`,
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

  if (allIssues.length === 0) {
    if (!SEO_AUDITED_MODEL_SLUGS.has(slug)) notFound();
    const vehicleName = `${make} ${model}`;
    const articleUrl = `https://au7o.io/known-issues/${slug}`;
    const title = `${vehicleName} Problems & Known Issues`;
    const emptyFaqs = [
      {
        question: `Does Au7o currently publish a verified ${vehicleName} issue card?`,
        answer: `No current ${vehicleName} card passed the full-record evidence threshold. Earlier broad owner or aftermarket claims were removed rather than presented as confirmed defects or universal repairs.`,
      },
      {
        question: `How should I check my ${vehicleName} for safety recalls?`,
        answer: `Use the 17-character VIN at NHTSA.gov/recalls and BMW's recall lookup. Recall eligibility depends on the exact VIN, production date, installed equipment, and campaign completion history.`,
      },
      {
        question: `What should I do if my ${vehicleName} has a problem not listed here?`,
        answer: `Record the symptoms, warning messages, DTCs, operating conditions, recent work, and VIN-specific configuration, then use a qualified BMW diagnosis before ordering parts.`,
      },
    ];
    return (
      <div className="min-h-screen" style={{ background: '#F7F6F2' }}>
        <header
          className="sticky top-0 z-30 px-6 py-4"
          style={{
            background: 'rgba(247,246,242,0.85)',
            backdropFilter: 'blur(20px) saturate(140%)',
            WebkitBackdropFilter: 'blur(20px) saturate(140%)',
            borderBottom: '1px solid #E3DFD4',
          }}
        >
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/og-image.png" alt="Au7o mascot" width={32} height={32} className="rounded-lg" />
              <span className="text-2xl font-bold tracking-tight" style={{ color: '#0B1220' }}>
                Au<span style={{ color: '#3B82F6' }}>7</span>o
              </span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/known-issues" className="hidden sm:inline-block px-3 sm:px-4 py-2 text-sm font-medium text-[#475569] hover:text-[#0B1220] transition-colors">
                Known Issues
              </Link>
              <Link href="/get-started" className="px-3 sm:px-4 py-2 text-sm font-semibold bg-[#3B82F6] text-white rounded-lg transition-colors hover:bg-[#2563EB]">
                Get Started
              </Link>
            </div>
          </div>
        </header>

        <FAQJsonLd questions={emptyFaqs} />
        <BreadcrumbJsonLd items={[
          { name: 'Au7o', url: 'https://au7o.io' },
          { name: 'Known Issues', url: 'https://au7o.io/known-issues' },
          { name: make, url: `/known-issues/make/${make.toLowerCase().replace(/\s+/g, '-')}` },
          { name: vehicleName, url: articleUrl },
        ]} />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 pb-24">
          <nav className="text-sm mb-7 text-[#94A3B8]" aria-label="Breadcrumb">
            <Link href="/known-issues" className="hover:text-[#475569]">Known Issues</Link>
            <span className="mx-2">/</span>
            <Link href={`/known-issues/make/${make.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-[#475569]">{make}</Link>
            <span className="mx-2">/</span>
            <span className="text-[#334155]">{model}</span>
          </nav>

          <div className="text-[11px] font-semibold uppercase mb-3 tracking-[0.08em] text-[#3B82F6]">
            {make} &middot; Evidence-reviewed owner reference
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-[#0B1220] tracking-[-0.02em]">{title}</h1>
          <p className="text-base sm:text-lg leading-relaxed text-[#475569] mb-8">
            No current issue card meets Au7o&apos;s full-record evidence threshold for the {vehicleName}. We kept this established model route useful and indexable while removing broad claims and unverified parts advice.
          </p>

          <section className="grid gap-4 sm:grid-cols-2 mb-10">
            <div className="rounded-xl border border-[#E3DFD4] bg-[#FBFAF6] p-5">
              <h2 className="text-lg font-semibold text-[#0B1220] mb-2">Check VIN-specific recalls</h2>
              <p className="text-sm leading-relaxed text-[#475569] mb-4">
                A model-wide list cannot determine campaign eligibility. Use the exact VIN and confirm whether every open remedy is complete.
              </p>
              <a href="https://www.nhtsa.gov/recalls" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-[#3B82F6] hover:text-[#2563EB]">
                Check recalls at NHTSA.gov
              </a>
            </div>
            <div className="rounded-xl border border-[#E3DFD4] bg-[#FBFAF6] p-5">
              <h2 className="text-lg font-semibold text-[#0B1220] mb-2">Diagnose before buying parts</h2>
              <p className="text-sm leading-relaxed text-[#475569] mb-4">
                Preserve warning messages, DTCs, operating conditions and recent repair history. Fitment alone never proves which component failed.
              </p>
              <Link href="/get-started" className="text-sm font-semibold text-[#3B82F6] hover:text-[#2563EB]">
                Get Started with Au7o
              </Link>
            </div>
          </section>

          <KnownIssueAlertSignup vehicleName={vehicleName} context={`known-issues:${vehicleName}`} />

          {related.length > 0 && (
            <section className="mt-10 mb-10">
              <h2 className="text-xl font-semibold mb-4 text-[#0B1220]">Other {make} models</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {related.map((vehicle) => (
                  <Link key={vehicle.slug} href={`/known-issues/${vehicle.slug}`} className="flex items-center justify-between rounded-lg border border-[#E3DFD4] bg-white p-3 hover:border-blue-300 transition-colors">
                    <span className="text-sm font-medium text-[#475569]">{vehicle.make} {vehicle.model}</span>
                    <span className="text-xs text-[#94A3B8]">{vehicle.issueCount}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section id="faq" className="mt-10">
            <h2 className="text-xl font-semibold mb-5 text-[#0B1220]">Frequently asked questions</h2>
            <div className="space-y-5">
              {emptyFaqs.map((faq) => (
                <div key={faq.question} className="border-b border-[#E3DFD4] pb-5">
                  <h3 className="font-semibold text-[#0B1220] mb-2">{faq.question}</h3>
                  <p className="text-sm leading-relaxed text-[#475569]">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <p className="mt-10 text-xs leading-relaxed text-[#94A3B8]">
            Audit updated {formatUpdatedLabel(articleDates.modified)}. Absence of a published card does not mean a vehicle cannot develop faults; it means Au7o has not retained a sufficiently bounded defect-and-remedy record for this model.
          </p>
        </main>

        <SiteFooter />
        <MobileBottomBar />
      </div>
    );
  }

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

  // Codes with a real /dtc/[code] page — chips for anything else render as
  // plain text so we never internally link to a 404 (GSC not-indexed fix).
  const linkableDtcCodes = await getLinkableDtcCodes();

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
  const hubYear = yearIsValid
    ? initialYear!
    : (yearRange?.max ?? new Date().getFullYear());

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
  const articleMinCost = getMinCost(issues);
  const articleMaxCost = getMaxCost(issues);
  const grouped = groupByCategory(issues);
  const vehicleName = `${make} ${model}`;
  // Year display collapses to a single year when the user is on the
  // ?year=YYYY variant (yearRange.min === yearRange.max). For the all-
  // years base view it stays as a range like "2008-2019".
  const yearStr = yearIsValid
    ? `${initialYear}`
    : (SEO_AUDITED_MODEL_SLUGS.has(slug)
      ? getYearCoverageLabel(issues)
      : (yearRange
        ? (yearRange.min === yearRange.max ? `${yearRange.min}` : `${yearRange.min}-${yearRange.max}`)
        : ''));
  const faqs = generateFAQs(make, model, issues, yearRange, yearStr);
  // Canonical URL — base for all-years, ?year=YYYY for the year-filtered
  // variant. Must match the canonical we emit in generateMetadata.
  const articleUrl = yearIsValid
    ? `https://au7o.io/known-issues/${slug}?year=${initialYear}`
    : `https://au7o.io/known-issues/${slug}`;
  // H1, <title>, OG, Twitter, and TechArticle.headline share the same
  // concise label. The helper preserves the year when it fits safely.
  const title = knownIssuesArticleTitle(slug, yearStr, vehicleName, issues.length);
  const structuredProblemNoun = issues.length === 1 ? 'problem' : 'problems';
  const structuredDetailNoun = articleMinCost && articleMaxCost
    ? 'with symptoms, repair costs, and solutions'
    : 'with symptoms and solutions';

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
    <div className="min-h-screen" style={{ background: '#F7F6F2' }}>
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
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/og-image.png"
              alt="Au7o mascot"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="text-2xl font-bold tracking-tight" style={{ color: '#0B1220' }}>
              Au<span style={{ color: '#3B82F6' }}>7</span>o
            </span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/known-issues"
              className="px-3 sm:px-4 py-2 text-sm font-medium text-[#475569] hover:text-[#0B1220] transition-colors hidden sm:inline-block"
            >
              Known Issues
            </Link>
            <Link
              href="/get-started"
              className="px-3 sm:px-4 py-2 text-sm font-semibold bg-[#3B82F6] text-white rounded-lg transition-colors hover:bg-[#2563EB]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* JSON-LD Structured Data */}
      <TechnicalArticleJsonLd
        title={title}
        description={`${issues.length} documented ${structuredProblemNoun} for the ${yearStr} ${vehicleName} ${structuredDetailNoun}.`}
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
        <nav className="text-sm mb-6" style={{ color: '#94A3B8' }} aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5">
            <li><Link href="/" className="hover:text-gray-600">Au7o</Link></li>
            <li style={{ color: '#CBD5E1' }}>/</li>
            <li><Link href="/known-issues" className="hover:text-gray-600">Known Issues</Link></li>
            <li style={{ color: '#CBD5E1' }}>/</li>
            <li><Link href={`/known-issues/make/${make.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-gray-600">{make}</Link></li>
            <li style={{ color: '#CBD5E1' }}>/</li>
            <li className="font-medium" style={{ color: '#334155' }}>{model}</li>
          </ol>
        </nav>

        {/* Title */}
        <header className="mb-6">
          <div
            className="text-[11px] font-semibold uppercase mb-3"
            style={{ letterSpacing: '0.08em', color: '#3B82F6' }}
          >
            {make} &middot; Known Issues
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: '#0B1220', letterSpacing: '-0.02em' }}>
            {title}
          </h1>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-sm" style={{ color: '#64748B' }}>
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
        <blockquote className="border-l-4 border-[#3B82F6] pl-5 mb-10">
          <p className="leading-relaxed" style={{ color: '#475569' }}>
            According to {analysisAttribution(totalReports)}, the {yearStr} {vehicleName} has {issues.length} {issues.length === 1 ? 'documented issue' : 'documented known issues'}
            {highCount > 0 ? (
              <>, with {highCount} rated critical. {criticalIssues.length > 0 && (
                <>The most serious {criticalIssues.length === 1 ? 'is' : 'are'}{' '}
                  {criticalIssues.map((issue, i) => (
                    <span key={issue.id}>
                      {i > 0 && (i === criticalIssues.length - 1 ? ' and ' : ', ')}
                      <strong className="text-[#0B1220]">{issue.title}</strong>
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
              <>The most commonly reported issue is <strong className="text-[#0B1220]">{topReported.title}</strong> with {topReported.reportCount.toLocaleString()} owner reports. </>
            )}
            {articleMinCost && articleMaxCost && (
              <>Across all issues with published estimates, repair costs range from ${articleMinCost} to ${articleMaxCost}. </>
            )}
            <Link href="/" className="text-[#3B82F6] hover:text-blue-700 font-medium">
              DIY maintenance guides
            </Link>{' '}
            at <strong className="text-[#0B1220]">au7o.io</strong>.
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
            <nav className="lg:hidden bg-white border border-[#E3DFD4] rounded-lg p-4 mb-6" aria-label="Issue categories">
              <h2 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">In This Article</h2>
              <ul className="space-y-1">
                {grouped.map(([category, catIssues]) => {
                  // Fallback guard: an unknown category must never crash the
                  // page render (it gutted 39 models' articles on 2026-06-11).
                  const config = categoryConfig[category] ?? categoryConfig.other;
                  const catHigh = catIssues.filter(i => i.severity === 'high').length;
                  return (
                    <li key={category}>
                      <a
                        href={`#${category}`}
                        className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#0B1220] transition-colors py-1"
                      >
                        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-[#D8D1C3] bg-[#FBFAF6] text-[#3C313D]">
                          <IssueCategoryIcon category={category} className="h-4 w-4" />
                        </span>
                        <span>{config.label}</span>
                        <span className="text-[#94A3B8] text-xs ml-auto">{catIssues.length}</span>
                        {catHigh > 0 && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#3C313D] flex-shrink-0" />
                        )}
                      </a>
                    </li>
                  );
                })}
                {recalls.length > 0 && (
                  <li>
                    <a href="#recalls" className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#0B1220] transition-colors py-1">
                      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-[#D8D1C3] bg-[#FBFAF6] text-[#3C313D]">
                        <RecallIcon className="h-4 w-4" />
                      </span>
                      <span>Recalls</span>
                      <span className="text-[#94A3B8] text-xs ml-auto">{recalls.length}</span>
                    </a>
                  </li>
                )}
                <li className="pt-1 border-t border-[#E3DFD4] mt-1">
                  <a href="#faq" className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#0B1220] transition-colors py-1">
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-[#D8D1C3] bg-[#FBFAF6] text-[#3C313D]">
                      <FaqIcon className="h-4 w-4" />
                    </span>
                    <span>FAQ</span>
                  </a>
                </li>
              </ul>
            </nav>

            {/* Issues List */}
            <section>
              <h2 className="text-xl font-semibold mb-4" style={{ color: '#0B1220' }}>
                All {issues.length} Known {issues.length === 1 ? 'Issue' : 'Issues'}
              </h2>
              {/* Unified "find your issue" bar — free fuzzy/keyword search,
                  Plus AI natural-language search, and a camera to snap a
                  photo/video (quota-gated per tier). Replaces the old photo
                  CTA. Client filter over already-SSR'd content (SEO-safe). */}
              <ModelIssueSearch
                issues={issues.map((i) => ({ id: i.id, title: i.title, symptoms: i.symptoms, dtcCodes: (i as { dtcCodes?: string[] }).dtcCodes, severity: i.severity }))}
                make={make}
                model={model}
                hubHref={`/vehicle/${vehicleSlug(hubYear, make, model)}`}
              />
              <ArticleIssuesList
                issues={issues}
                make={make}
                model={model}
                initialYear={initialYear}
                allYears={navYears}
                relatedByIssueId={Object.fromEntries(relatedByIssue)}
                linkableDtcCodes={linkableDtcCodes}
              />
            </section>

            {/* Single ad slot — after issues, before recalls */}
            <AdSlot slotId="auto" format="horizontal" className="my-10" />

            {/* NHTSA Recalls Section — same style as category dropdowns */}
            {recalls.length > 0 && (
              <div id="recalls" className="scroll-mt-16 border border-[#E3DFD4] rounded-lg overflow-hidden mb-4">
                <details className="group">
                  <summary className="w-full px-4 py-3 bg-[#EFEDE6] hover:bg-[#E3DFD4] transition-colors flex items-center gap-3 cursor-pointer list-none">
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-[#D8D1C3] bg-[#FBFAF6] text-[#3C313D]">
                      <RecallIcon className="h-[18px] w-[18px]" />
                    </span>
                    <span className="font-medium text-[#0B1220] flex-1 text-left">NHTSA Recalls</span>
                    <span className="text-sm text-[#64748B]">{recalls.length} recall{recalls.length !== 1 ? 's' : ''}</span>
                    <svg className="w-5 h-5 text-[#94A3B8] transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                            <span className="text-xs font-bold bg-[#0B1220] text-white px-2 py-0.5 rounded mt-0.5 flex-shrink-0">PARK IT</span>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#0B1220]">{recall.component}</p>
                            <p className="text-sm text-[#475569] mt-1 line-clamp-2">{recall.summary}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-[#94A3B8]">
                              <span>Campaign #{recall.campaignNumber}</span>
                              <span>{recall.reportDate}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {recalls.length > 5 && (
                      <p className="text-sm text-[#64748B] mt-3 pl-4">
                        + {recalls.length - 5} more recalls.{' '}
                        <a href="https://www.nhtsa.gov/recalls" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                          Check all on NHTSA.gov
                        </a>
                      </p>
                    )}
                    <p className="text-xs text-[#94A3B8] mt-2 pl-4">
                      Enter your VIN at{' '}
                      <a href="https://www.nhtsa.gov/recalls" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">NHTSA.gov</a>{' '}
                      to check recalls specific to your vehicle.
                    </p>
                  </div>
                </details>
              </div>
            )}

            {/* Always-visible lightweight capture (SEO-friendly, low weight).
                The rich live-demo "carousel" pops as a modal ~5s in (below). */}
            <div className="mb-8">
              <KnownIssueAlertSignup
                vehicleName={`${make} ${model}`}
                context={`known-issues:${make} ${model}`}
              />
            </div>
            {/* Engagement popup — the live hub-demo carousel, ~5s after load
                (design/15-FeatureCarousel "Split"). Speaks about THIS vehicle. */}
            <AlertSignupPopup
              vehicleName={`${make} ${model}`}
              context={`known-issues:${make} ${model}`}
              headline={`Get ahead of ${make} ${model} problems — free`}
              blurb={`Leave your email and we'll alert you the moment there's a new recall or known issue for your ${make} ${model}. No account needed.`}
            />

            {/* Fallthrough CTA — simplified */}
            <div className="text-center py-8 border-t border-[#E3DFD4]">
              <p className="text-sm text-[#64748B]">
                Don&apos;t see your problem?{' '}
                <VehicleChatLink
                  make={make}
                  model={model}
                  issues={issues}
                  className="text-[#3B82F6] hover:text-blue-700 font-medium"
                >
                  Describe your symptoms
                </VehicleChatLink>{' '}
                to get a diagnosis, or{' '}
                <Link href="/" className="text-[#3B82F6] hover:text-blue-700 font-medium">
                  get a full repair guide
                </Link>.
              </p>
            </div>

            {/* Related Vehicles */}
            {related.length > 0 && (
              <section className="mb-10">
                <h2 className="text-xl font-semibold mb-4" style={{ color: '#0B1220' }}>
                  Other {make} Models
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {related.map(v => (
                    <Link
                      key={v.slug}
                      href={`/known-issues/${v.slug}`}
                      className="flex items-center justify-between p-3 bg-white border border-[#E3DFD4] rounded-lg hover:border-blue-300 transition-colors group"
                    >
                      <span className="text-sm font-medium text-[#475569] group-hover:text-[#3B82F6]">
                        {v.make} {v.model}
                      </span>
                      <span className="text-xs text-[#94A3B8]">{v.issueCount}</span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* FAQ Section */}
            <section id="faq" className="scroll-mt-16 mb-10">
              <h2 className="text-xl font-semibold mb-6" style={{ color: '#0B1220' }}>
                Frequently Asked Questions
              </h2>
              <div className="space-y-6">
                {faqs.map((faq, i) => (
                  <div key={i} className="border-b border-[#E3DFD4] pb-6 last:border-0">
                    <h3 className="text-base font-semibold mb-2" style={{ color: '#0B1220' }}>
                      {faq.question}
                    </h3>
                    <p className="leading-relaxed text-sm" style={{ color: '#475569' }}>
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* AI content disclaimer */}
            <div className="flex items-start gap-2 py-3">
              <svg className="w-4 h-4 text-[#94A3B8] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Content on this page was compiled with AI assistance using NHTSA complaints, TSBs, owner reports, and public automotive data. While we strive for accuracy, this information may contain errors. Always verify repair procedures and specifications with your vehicle&apos;s service manual or a qualified mechanic.
              </p>
            </div>

            {/* Article-specific attribution stays inline so report
                count + © sits close to the article body. */}
            <footer className="pt-6 mt-8 border-t border-[#E3DFD4] text-center">
              <p className="text-xs text-[#94A3B8]">
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

      <MobileBottomBar />
    </div>
  );
}
