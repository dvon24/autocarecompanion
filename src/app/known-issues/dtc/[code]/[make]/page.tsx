import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getDTCWithIssuesForMake, getAllDTCMakeSlugs, slugToMake, getDTCDates, getThinDtcMakeKeys, getLinkableDtcCodes, getDtcTriage } from '@/lib/dtc-codes';
import { TechnicalArticleJsonLd, BreadcrumbJsonLd, FAQJsonLd } from '@/components/seo/JsonLd';
import { ShareButtons } from '@/components/shared/ShareButtons';
import { SiteFooter } from '@/components/shared/SiteFooter';
import { DtcModelSection } from '@/components/known-issues/DtcModelSection';
import { DtcSidebar, DtcMobileToc, type DtcSidebarEntry } from '@/components/known-issues/DtcSidebar';
import { DtcTriageBlock } from '@/components/known-issues/DtcTriageBlock';
import { KnownIssueAlertSignup } from '@/components/known-issues/KnownIssueAlertSignup';
import { MobileBottomBar } from '@/components/known-issues/MobileBottomBar';
import { AdSlot } from '@/components/ads/AdSlot';
import { FaqIcon } from '@/components/known-issues/IssueCategoryIcon';
import type { KnownIssue } from '@/schemas/knownIssue.schema';

/**
 * Per-make DTC page — /known-issues/dtc/[code]/[make]
 *
 * Built on the make/model article design (ArticleRoute): sticky header,
 * breadcrumb + eyebrow, GEO lead, sticky sidebar, collapsible sections
 * holding full KnownIssueCards. Each card carries symptoms, "How to Fix",
 * diagnostic tools, verified parts, cost and sources — the reader who
 * searched "p0016 toyota" gets the diagnosis and the fix here, not a
 * definition and a link.
 *
 * Static-generated only for (code, make) pairs that have at least one
 * published KnownIssue link.
 */

export const revalidate = 3600;
export const dynamicParams = true;

/** Leading cards rendered expanded so the fix text is in the SSR HTML. */
const EXPAND_FIRST_CARDS = 6;

export async function generateStaticParams() {
  // COST: these ~2,500 code×make pages were rebuilt in full on EVERY deploy
  // (the dominant Vercel Build-CPU-Minutes charge). They're already ISR
  // (revalidate 3600 + dynamicParams true), so we pre-render only a small
  // warm set at build and generate the long tail on-demand on first visit,
  // then cache. Fully indexable; also fixes the Supabase build-timeouts (no
  // 19-worker parallel DB storm at build). Bump the slice to pre-warm more.
  return (await getAllDTCMakeSlugs()).slice(0, 50);
}

function topModelsOf(issues: KnownIssue[], limit = 3): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const iss of issues) {
    if (seen.has(iss.vehicleMatch.model)) continue;
    seen.add(iss.vehicleMatch.model);
    out.push(iss.vehicleMatch.model);
    if (out.length >= limit) break;
  }
  return out;
}

function costRange(issues: KnownIssue[]): { min: number; max: number } {
  // Filter $0 entries (AI pipeline writes zeros when no real cost is found).
  // "$0-$X" in the SERP snippet kills CTR.
  const lows = issues.filter(i => i.estimatedCost && i.estimatedCost.low > 0).map(i => i.estimatedCost!.low);
  const highs = issues.filter(i => i.estimatedCost && i.estimatedCost.high > 0).map(i => i.estimatedCost!.high);
  return { min: lows.length ? Math.min(...lows) : 0, max: highs.length ? Math.max(...highs) : 0 };
}

/** First one or two sentences of a solution, for lead paragraphs and FAQ. */
function leadSentences(text: string, max = 2): string {
  const parts = text.replace(/\s+/g, ' ').trim().match(/[^.!?]+[.!?]+/g);
  if (!parts) return text.trim();
  return parts.slice(0, max).join(' ').trim();
}

function yearSpan(issues: KnownIssue[]): string {
  const years = issues.flatMap(i => i.vehicleMatch.years || []);
  if (years.length === 0) return '';
  const min = Math.min(...years);
  const max = Math.max(...years);
  return min === max ? `${min}` : `${min}-${max}`;
}

function slugToLabel(slug: string): string {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string; make: string }>;
}): Promise<Metadata> {
  const { code, make: makeSlug } = await params;
  const make = await slugToMake(makeSlug);
  if (!make) return { title: 'Not Found' };

  const data = await getDTCWithIssuesForMake(code, make);
  if (!data) return { title: 'Not Found' };

  const topModels = topModelsOf(data.issues);
  const moreCount = Math.max(0, data.vehicleCount - topModels.length);
  const moreSuffix = moreCount > 0 ? ` +${moreCount}` : '';
  const { min, max } = costRange(data.issues);
  const costLabel = min > 0 && max > 0 ? ` $${min.toLocaleString()}-$${max.toLocaleString()}` : '';

  // Title leads with what the AI Overview can't give the searcher — the
  // vehicle-specific fix and cost — instead of restating the code
  // definition that every DTC site and the SERP itself already show.
  const title = `${data.code} on ${make}: How to Diagnose & Fix (${topModels.join(', ')}${moreSuffix})`;
  const description = `${data.code} (${data.name}) on ${make} ${topModels.join(', ')}${moreSuffix}: symptoms, step-by-step fixes,${costLabel ? ` typical repair cost${costLabel},` : ''} verified parts and sources from TSBs, recalls and owner reports.`;

  // Same content bar as the parent code page. A make page is a subset of its
  // parent's issues, so it is always the thinner of the two — noindex it when
  // it falls short, keep it crawlable so its links still carry.
  const thin = (await getThinDtcMakeKeys()).includes(`${code.toUpperCase()}|${makeSlug}`);

  return {
    title,
    description,
    ...(thin ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      title,
      description,
      type: 'article',
      url: `https://au7o.io/known-issues/dtc/${code.toLowerCase()}/${makeSlug}`,
      siteName: 'Au7o',
    },
    twitter: { card: 'summary_large_image', title, description },
    alternates: {
      canonical: `https://au7o.io/known-issues/dtc/${code.toLowerCase()}/${makeSlug}`,
    },
  };
}

export default async function PerMakeDTCPage({
  params,
}: {
  params: Promise<{ code: string; make: string }>;
}) {
  const { code, make: makeSlug } = await params;
  const make = await slugToMake(makeSlug);
  if (!make) notFound();

  const [data, dtcDates, linkableDtcCodes, allMakeSlugs, triage] = await Promise.all([
    getDTCWithIssuesForMake(code, make),
    getDTCDates(code),
    getLinkableDtcCodes(),
    getAllDTCMakeSlugs(),
    getDtcTriage(code, make),
  ]);
  if (!data) notFound();

  const codeUpper = data.code;
  const codeLower = code.toLowerCase();
  const articleUrl = `https://au7o.io/known-issues/dtc/${codeLower}/${makeSlug}`;
  const parentUrl = `https://au7o.io/known-issues/dtc/${codeLower}`;
  const { min: minCost, max: maxCost } = costRange(data.issues);

  // Group by model, most-reported model first (issues arrive sorted by
  // reportCount desc, so first-appearance order is the report order).
  const byModel = new Map<string, (KnownIssue & { slug: string })[]>();
  for (const issue of data.issues) {
    const model = issue.vehicleMatch.model;
    if (!byModel.has(model)) byModel.set(model, []);
    byModel.get(model)!.push(issue);
  }
  const models = [...byModel.entries()];
  const modelAnchor = (model: string) => `model-${model.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

  // Cards render expanded from the top of the page downward, across model
  // sections, until the budget is spent.
  let expandBudget = EXPAND_FIRST_CARDS;
  const expandFor = (n: number) => { const k = Math.min(n, expandBudget); expandBudget -= k; return k; };

  const otherMakes = allMakeSlugs
    .filter(s => s.code === codeLower && s.make !== makeSlug)
    .map(s => ({ label: slugToLabel(s.make), href: `/known-issues/dtc/${codeLower}/${s.make}` }))
    .sort((a, b) => a.label.localeCompare(b.label))
    .slice(0, 12);

  const sidebarEntries: DtcSidebarEntry[] = [
    ...(triage ? [{ anchor: 'triage', label: 'Narrow it down', count: triage.branches.length, highCount: 0 }] : []),
    ...models.map(([model, issues]) => ({
    anchor: modelAnchor(model),
    label: model,
    count: issues.length,
    highCount: issues.filter(i => i.severity === 'high').length,
    span: yearSpan(issues),
  }))];

  const highCount = data.issues.filter(i => i.severity === 'high').length;
  const totalReports = data.issues.reduce((s, i) => s + (i.reportCount || 0), 0);
  const topIssue = data.issues[0];
  const criticalIssues = data.issues.filter(i => i.severity === 'high').slice(0, 3);
  const severityLabel = data.severity === 'high' ? 'Critical' : data.severity === 'medium' ? 'Moderate' : 'Minor';

  const faqs = [
    {
      question: `What does ${codeUpper} mean on a ${make}?`,
      answer: `${codeUpper} stands for "${data.name}." ${data.description} On ${make} it is documented across ${data.vehicleCount} model${data.vehicleCount === 1 ? '' : 's'}: ${models.map(([m]) => m).join(', ')}.`,
    },
    {
      question: `How do I diagnose ${codeUpper} on a ${make} ${topIssue.vehicleMatch.model}?`,
      answer: triage
        ? `${triage.firstCheck} ${leadSentences(triage.intro, 1)} The "Narrow it down" section on this page maps each symptom to the documented failure and its fix.`
        : `${leadSentences(topIssue.solution, 3)} Published repair guidance and available estimates are in the ${topIssue.vehicleMatch.model} section on this page.`,
    },
    {
      question: `What causes ${codeUpper} on ${make} vehicles?`,
      answer: `Documented causes on ${make}: ${data.issues.slice(0, 4).map(i => i.title).join('; ')}. Generic causes of ${codeUpper}: ${data.commonCauses.slice(0, 4).join(', ')}.`,
    },
    {
      question: `How much does it cost to fix ${codeUpper} on a ${make}?`,
      answer: minCost > 0
        ? `Published repair estimates on ${make} range from $${minCost.toLocaleString()} to $${maxCost.toLocaleString()} depending on the model and root cause. If an issue mentions a recall or campaign, check your VIN with the manufacturer or NHTSA and confirm eligibility and coverage with a dealer.`
        : `Repair costs vary widely with the root cause and ${make} model; each issue on this page carries its own estimate where one is published.`,
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#F7F6F2' }}>
      {/* Header — same as the article pages */}
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
            <Link href="/known-issues" className="px-3 sm:px-4 py-2 text-sm font-medium text-[#475569] hover:text-[#0B1220] transition-colors hidden sm:inline-block">
              Known Issues
            </Link>
            <Link href="/get-started" className="px-3 sm:px-4 py-2 text-sm font-semibold bg-[#3B82F6] text-white rounded-lg transition-colors hover:bg-[#2563EB]">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <TechnicalArticleJsonLd
        title={`${codeUpper} on ${make}: How to Diagnose & Fix`}
        description={`${codeUpper} (${data.name}) documented on ${data.vehicleCount} ${make} model${data.vehicleCount === 1 ? '' : 's'} with symptoms, repair guidance and available repair estimates.`}
        url={articleUrl}
        datePublished={dtcDates.published}
        dateModified={dtcDates.modified}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Au7o', url: 'https://au7o.io' },
          { name: 'Known Issues', url: 'https://au7o.io/known-issues' },
          { name: 'DTC Codes', url: 'https://au7o.io/known-issues/dtc' },
          { name: codeUpper, url: parentUrl },
          { name: make, url: articleUrl },
        ]}
      />
      <FAQJsonLd questions={faqs} />

      <article id="top" className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 pb-24 lg:pb-12">
        {/* Breadcrumb */}
        <nav className="text-sm mb-6" style={{ color: '#94A3B8' }} aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 flex-wrap">
            <li><Link href="/" className="hover:text-gray-600">Au7o</Link></li>
            <li style={{ color: '#CBD5E1' }}>/</li>
            <li><Link href="/known-issues" className="hover:text-gray-600">Known Issues</Link></li>
            <li style={{ color: '#CBD5E1' }}>/</li>
            <li><Link href="/known-issues/dtc" className="hover:text-gray-600">DTC Codes</Link></li>
            <li style={{ color: '#CBD5E1' }}>/</li>
            <li><Link href={`/known-issues/dtc/${codeLower}`} className="hover:text-gray-600 font-mono">{codeUpper}</Link></li>
            <li style={{ color: '#CBD5E1' }}>/</li>
            <li className="font-medium" style={{ color: '#334155' }}>{make}</li>
          </ol>
        </nav>

        {/* Title */}
        <header className="mb-6">
          <div className="text-[11px] font-semibold uppercase mb-3" style={{ letterSpacing: '0.08em', color: '#3B82F6' }}>
            {make} &middot; {data.system} &middot; {severityLabel} code
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: '#0B1220', letterSpacing: '-0.02em' }}>
            <span className="font-mono">{codeUpper}</span> on {make}: How to Diagnose &amp; Fix
          </h1>
          <p className="text-base sm:text-lg text-[#475569] mb-3">{data.name}</p>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-sm" style={{ color: '#64748B' }}>
              {data.vehicleCount} {make} model{data.vehicleCount === 1 ? '' : 's'} &middot; {data.issues.length} documented issue{data.issues.length === 1 ? '' : 's'}
              {highCount > 0 && <> &middot; {highCount} critical</>}
              {minCost > 0 && <> &middot; ${minCost.toLocaleString()}-${maxCost.toLocaleString()} repair</>}
            </p>
            <ShareButtons url={articleUrl} title={`${codeUpper} on ${make}: How to Diagnose & Fix`} />
          </div>
        </header>

        {/* GEO lead — the paragraph AI answers cite. Fix-first: names the
            most-reported cause and its remedy before restating the definition. */}
        <blockquote className="border-l-4 border-[#3B82F6] pl-5 mb-10">
          <p className="leading-relaxed" style={{ color: '#475569' }}>
            On <strong className="text-[#0B1220]">{make}</strong> vehicles, <strong className="text-[#0B1220]">{codeUpper}</strong> ({data.name.toLowerCase()}) is most often reported on the{' '}
            <strong className="text-[#0B1220]">{yearSpan([topIssue]) && `${yearSpan([topIssue])} `}{make} {topIssue.vehicleMatch.model}</strong> as{' '}
            <strong className="text-[#0B1220]">{topIssue.title}</strong>
            {topIssue.estimatedCost && topIssue.estimatedCost.high > 0 && (
              <> (${topIssue.estimatedCost.low.toLocaleString()}-${topIssue.estimatedCost.high.toLocaleString()} repair)</>
            )}. {leadSentences(topIssue.solution, 2)}{' '}
            {criticalIssues.length > 0 && (
              <>Rated critical: {criticalIssues.map((issue, i) => (
                <span key={issue.id}>
                  {i > 0 && (i === criticalIssues.length - 1 ? ' and ' : ', ')}
                  <strong className="text-[#0B1220]">{issue.vehicleMatch.model} {issue.title}</strong>
                </span>
              ))}. </>
            )}
            {totalReports > 100 && <>Compiled from {totalReports.toLocaleString()} owner reports, TSBs and recall filings. </>}
            Each section below gives the symptoms, how to confirm the cause, the fix, parts and sources for that model.
          </p>
        </blockquote>

        {/* Two-column layout */}
        <div className="lg:flex lg:gap-0">
          <DtcSidebar
            heading={`${codeUpper} by ${make} model`}
            entries={sidebarEntries}
            otherMakes={otherMakes}
            otherMakesHeading={`${codeUpper} on other makes`}
          />

          <div className="min-w-0 flex-1">
            {/* Mobile TOC */}
            <DtcMobileToc heading={`${codeUpper} by ${make} model`} entries={sidebarEntries} />

            {/* Generic causes — short, above the vehicle-specific meat. The
                reference block is what every DTC site publishes; it stays
                for completeness but is not the reason to rank. */}
            {data.commonCauses.length > 0 && (
              <section className="mb-6 bg-white border border-[#E3DFD4] rounded-lg p-4">
                <h2 className="text-sm font-semibold text-[#0B1220] mb-2">Common causes of {codeUpper} (all vehicles)</h2>
                <ul className="flex flex-wrap gap-2">
                  {data.commonCauses.map((cause) => (
                    <li key={cause} className="text-xs px-2 py-1 rounded bg-[#EFEDE6] text-[#334155] border border-[#E3DFD4]">{cause}</li>
                  ))}
                </ul>
              </section>
            )}

            {/* Code x make triage — the content that is unique to this page. */}
            {triage && <DtcTriageBlock triage={triage} codeUpper={codeUpper} make={make} />}

            {/* Per-model sections with full cards */}
            <section>
              <h2 className="text-xl font-semibold mb-4" style={{ color: '#0B1220' }}>
                {codeUpper} on {make} by model: symptoms, diagnosis and fix
              </h2>
              <div className="space-y-3">
                {models.map(([model, issues]) => (
                  <DtcModelSection
                    key={model}
                    make={make}
                    model={model}
                    articleSlug={issues[0].slug}
                    issues={issues}
                    dtcCode={codeUpper}
                    defaultExpanded
                    expandFirst={expandFor(issues.length)}
                    linkableDtcCodes={linkableDtcCodes}
                  />
                ))}
              </div>
            </section>

            <AdSlot slotId="auto" format="horizontal" className="my-10" />

            {/* Same code across all makes */}
            <section className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-8 text-center">
              <p className="text-sm text-[#334155] mb-2">Looking for {codeUpper} on a different make?</p>
              <Link href={`/known-issues/dtc/${codeLower}`} className="text-[#3B82F6] hover:text-[#2563EB] font-medium">
                View {codeUpper} across all makes →
              </Link>
            </section>

            {/* FAQ */}
            <section id="faq" className="scroll-mt-16 mb-8">
              <h2 className="text-xl font-semibold mb-5" style={{ color: '#0B1220' }}>Frequently asked questions</h2>
              <div className="space-y-5">
                {faqs.map((faq) => (
                  <div key={faq.question} className="border-b border-[#E3DFD4] pb-5">
                    <h3 className="font-semibold text-[#0B1220] mb-2">{faq.question}</h3>
                    <p className="text-sm leading-relaxed text-[#475569]">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </section>

            <div className="mb-8">
              <KnownIssueAlertSignup
                vehicleName={`${codeUpper} on ${make}`}
                context={`dtc:${codeUpper}:${make}`}
                headline={`Get notified about ${codeUpper} fixes on ${make}`}
                blurb={`We add new causes, fixes and affected ${make} models for ${codeUpper} regularly — drop your email and we'll keep you posted. You can also diagnose your own car free.`}
              />
            </div>

            <div className="flex items-start gap-2 py-3">
              <svg className="w-4 h-4 text-[#CBD5E1] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Content compiled with AI assistance using NHTSA complaints, TSBs, and owner reports. May contain errors. Always verify with your vehicle&apos;s service manual.
              </p>
            </div>

            <SiteFooter />
          </div>
        </div>
      </article>
      <MobileBottomBar />
    </div>
  );
}
