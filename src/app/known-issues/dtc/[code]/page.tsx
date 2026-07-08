import { ConfirmWithPhotoCTA } from '@/components/diagnose/ConfirmWithPhotoCTA';
import { KnownIssueAlertSignup } from '@/components/known-issues/KnownIssueAlertSignup';
import { AlertSignupPopup } from '@/components/known-issues/AlertSignupPopup';
import { ToolRecommendations } from '@/components/known-issues/ToolRecommendations';
import { toolsForDtc } from '@/lib/affiliate-tools';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getAllDTCSlugs, getDTCWithIssues, getDTCDates, getRelatedDTCCodes, makeToSlug } from '@/lib/dtc-codes';
import { TechnicalArticleJsonLd, FAQJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { CollapsibleMakeSection } from '@/components/known-issues/CollapsibleMakeSection';
import { OBDScannerRecommendations } from '@/components/known-issues/OBDScannerRecommendations';
import { SiteFooter } from '@/components/shared/SiteFooter';
import { ShareButtons } from '@/components/shared/ShareButtons';

// --- ISR + dynamic params ---

export const revalidate = 3600;
export const dynamicParams = true;

// --- Static generation ---

export async function generateStaticParams() {
  // COST: ~2,500 code pages were rebuilt in full on EVERY deploy (the dominant
  // Vercel Build-CPU-Minutes charge). Already ISR (revalidate 3600 +
  // dynamicParams true), so pre-render a small warm set at build and generate
  // the rest on-demand on first visit, then cache. Fully indexable; also fixes
  // the Supabase build-timeouts. Bump the slice to pre-warm more.
  return (await getAllDTCSlugs()).slice(0, 50);
}

// --- Dynamic metadata ---

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const data = await getDTCWithIssues(code);
  if (!data) return { title: 'Not Found' };

  // Top 3 most-reported vehicles for the SERP snippet. Issues come back
  // sorted by reportCount desc from getDTCWithIssues, so the first three
  // unique make+model pairs are what searchers will most likely query
  // alongside the code (e.g. "p0420 toyota camry"). Baking these into the
  // title + description gives Google an unambiguous signal that this page
  // covers vehicle-specific cases of the code, not generic reference
  // boilerplate that 1000 other DTC sites also publish.
  const topVehicles: { make: string; model: string }[] = [];
  const seen = new Set<string>();
  for (const iss of data.issues) {
    const key = `${iss.vehicleMatch.make}|${iss.vehicleMatch.model}`;
    if (seen.has(key)) continue;
    seen.add(key);
    topVehicles.push({ make: iss.vehicleMatch.make, model: iss.vehicleMatch.model });
    if (topVehicles.length >= 3) break;
  }
  const vehicleList = topVehicles.map(v => `${v.make} ${v.model}`).join(', ');
  const moreCount = Math.max(0, data.vehicleCount - topVehicles.length);
  const moreSuffix = moreCount > 0 ? ` & ${moreCount} more` : '';

  // Title — keep tight (~60 chars). Format puts the code first (matches
  // search query lead), then makes (relevance), then code name (context).
  const title = vehicleList
    ? `${data.code} on ${topVehicles.map(v => v.make).join(', ')}${moreSuffix} — ${data.name}`
    : `${data.code}: ${data.name} | OBD-II Code Guide`;
  // Description (~155 chars). Lead with code + vehicle context. The
  // generic "across N makes" framing was correct but invisible — it
  // matched no real query.
  const description = vehicleList
    ? `${data.code} (${data.name}) on ${vehicleList}${moreSuffix} — common causes, repair costs, and per-vehicle fixes from real owner reports.`
    : `${data.code} means "${data.name}." Found on ${data.vehicleCount} vehicle models. Common causes, symptoms, repair costs, and vehicle-specific fixes.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `https://au7o.io/known-issues/dtc/${code.toLowerCase()}`,
      siteName: 'Au7o',
    },
    twitter: { card: 'summary_large_image', title, description },
    alternates: {
      canonical: `https://au7o.io/known-issues/dtc/${code.toLowerCase()}`,
    },
  };
}

// --- Page component ---

export default async function DTCCodePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const [data, dtcDates, relatedCodes] = await Promise.all([
    getDTCWithIssues(code),
    getDTCDates(code),
    getRelatedDTCCodes(code),
  ]);
  if (!data) notFound();
  // Hard 404 when the code exists in the registry but no published issue
  // references it. Earlier the page rendered with empty pills, empty
  // CollapsibleMakeSection grid, and a broken GEO blockquote
  // ("most commonly reported on  with..."), which Google classified as
  // soft 404 (200 OK with effectively no content). Returning a real 404
  // tells Google to drop the URL cleanly rather than keep it in limbo.
  if (data.issues.length === 0) notFound();

  const articleUrl = `https://au7o.io/known-issues/dtc/${code.toLowerCase()}`;

  // Group issues by make
  const issuesByMake: Record<string, typeof data.issues> = {};
  for (const issue of data.issues) {
    const make = issue.vehicleMatch.make;
    if (!issuesByMake[make]) issuesByMake[make] = [];
    issuesByMake[make].push(issue);
  }
  const sortedMakes = Object.entries(issuesByMake).sort(([a], [b]) => a.localeCompare(b));

  // Cost range — filter out issues with $0 cost data (the AI research
  // pipeline writes zeros when it can't find a real estimate). Including
  // them produces "$0-$X" in the SERP snippet, which signals incomplete
  // data and tanks CTR. Same fix applied to the per-vehicle article
  // page in [slug]/page.tsx.
  const costsLow = data.issues
    .filter(i => i.estimatedCost && i.estimatedCost.low > 0)
    .map(i => i.estimatedCost!.low);
  const costsHigh = data.issues
    .filter(i => i.estimatedCost && i.estimatedCost.high > 0)
    .map(i => i.estimatedCost!.high);
  const minCost = costsLow.length > 0 ? Math.min(...costsLow) : 0;
  const maxCost = costsHigh.length > 0 ? Math.max(...costsHigh) : 0;

  // Top 3 unique make+model pairs by reportCount (issues already sorted
  // desc). Used by the GEO blockquote so the lead sentence names the
  // vehicles searchers are most likely to query alongside the code.
  // Also carries year range + trims so the YMMT context appears in the
  // body — earlier just "Audi SQ8" was rendered, which the user
  // (correctly) flagged as missing the year and trim signals that
  // searchers actually type ("002f audi sq8 prestige", "p0420 toyota
  // camry 2018", etc.).
  type TopVehicle = { make: string; model: string; minYear: number; maxYear: number; trims: string[] };
  const topVehicles: TopVehicle[] = [];
  const seenVehicles = new Set<string>();
  for (const iss of data.issues) {
    const key = `${iss.vehicleMatch.make}|${iss.vehicleMatch.model}`;
    if (seenVehicles.has(key)) continue;
    seenVehicles.add(key);
    const years = iss.vehicleMatch.years || [];
    topVehicles.push({
      make: iss.vehicleMatch.make,
      model: iss.vehicleMatch.model,
      minYear: years.length ? Math.min(...years) : 0,
      maxYear: years.length ? Math.max(...years) : 0,
      trims: iss.vehicleMatch.trims || [],
    });
    if (topVehicles.length >= 3) break;
  }
  const moreCount = Math.max(0, data.vehicleCount - topVehicles.length);
  const formatYearLabel = (v: TopVehicle): string => {
    if (!v.minYear) return '';
    return v.minYear === v.maxYear ? `${v.minYear}` : `${v.minYear}-${v.maxYear}`;
  };
  // Aggregate unique citations across all linked issues so the page can
  // surface real source URLs (TSBs, NHTSA filings, forum threads). De-dup
  // by URL since the same recall doc often appears on multiple issues.
  // Many issues have citations:[] today — that's a data backfill gap, not
  // a rendering one. The section just hides itself when nothing exists.
  const citationMap = new Map<string, { type: string; title: string; url: string }>();
  for (const iss of data.issues) {
    for (const c of (iss.citations || [])) {
      if (!c.url) continue;
      if (citationMap.has(c.url)) continue;
      citationMap.set(c.url, { type: c.type, title: c.title, url: c.url });
    }
  }
  const citations = [...citationMap.values()].slice(0, 12);

  // Severity
  const severityLabel = data.severity === 'high' ? 'Critical' : data.severity === 'medium' ? 'Moderate' : 'Minor';
  const severityColor = data.severity === 'high' ? 'text-red-700 bg-red-100' : data.severity === 'medium' ? 'text-yellow-700 bg-yellow-100' : 'text-gray-700 bg-gray-100';

  // FAQs
  const faqs = [
    {
      question: `What does ${data.code} mean?`,
      answer: `${data.code} stands for "${data.name}." ${data.description}`,
    },
    {
      question: `What are the most common causes of ${data.code}?`,
      answer: `The most common causes of ${data.code} are: ${data.commonCauses.join(', ')}. The specific cause varies by vehicle.`,
    },
    {
      question: `How much does it cost to fix ${data.code}?`,
      answer: minCost > 0
        ? `Repair costs for ${data.code} range from $${minCost.toLocaleString()} to $${maxCost.toLocaleString()}, depending on the vehicle and root cause.`
        : `Repair costs vary widely depending on the root cause and vehicle.`,
    },
    {
      question: `Which vehicles are affected by ${data.code}?`,
      answer: `Au7o has documented ${data.code} across ${data.vehicleCount} vehicle models from ${data.makes.length} manufacturers: ${data.makes.join(', ')}.`,
    },
  ];

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
            <Image src="/og-image.png" alt="Au7o mascot" width={32} height={32} className="rounded-lg" />
            <span className="text-2xl font-bold tracking-tight" style={{ color: '#0B1220' }}>
              Au<span style={{ color: '#3B82F6' }}>7</span>o
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/known-issues" className="px-4 py-2 text-sm font-medium text-[#475569] hover:text-[#0B1220] transition-colors">
              Known Issues
            </Link>
            <Link href="/" className="px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-opacity" style={{ background: '#0B1220' }}>
              Diagnose my car
            </Link>
          </div>
        </div>
      </header>

      {/* JSON-LD */}
      <TechnicalArticleJsonLd
        title={`${data.code}: ${data.name}`}
        description={data.description}
        url={articleUrl}
        datePublished={dtcDates.published}
        dateModified={dtcDates.modified}
      />
      <FAQJsonLd questions={faqs} />
      <BreadcrumbJsonLd items={[
        { name: 'Au7o', url: 'https://au7o.io' },
        { name: 'Known Issues', url: 'https://au7o.io/known-issues' },
        { name: data.code, url: articleUrl },
      ]} />

      <article id="top" className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Breadcrumb */}
        <nav className="text-sm text-[#94A3B8] mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5">
            <li><Link href="/" className="hover:text-[#475569]">Au7o</Link></li>
            <li className="text-[#CBD5E1]">/</li>
            <li><Link href="/known-issues" className="hover:text-[#475569]">Known Issues</Link></li>
            <li className="text-[#CBD5E1]">/</li>
            <li className="text-[#334155] font-medium">{data.code}</li>
          </ol>
        </nav>

        {/* Title */}
        <header className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm font-mono font-bold bg-[#0B1220] text-white px-3 py-1 rounded-md">
              {data.code}
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded ${severityColor}`}>
              {severityLabel}
            </span>
            <span className="text-xs text-[#94A3B8] font-medium">{data.system}</span>
          </div>
          {/* H1 — when the code maps to a SINGLE vehicle (only one unique
              make+model across all linked issues), bake the full YMMT
              into the heading so searchers querying "002f audi sq8" or
              "p2095 honda civic 2014" get an exact-match signal. For
              multi-vehicle codes the H1 stays generic ("P0420: Catalyst
              System Efficiency") since cramming 8 makes into the heading
              would read worse than letting the body's "Most Reported On"
              + per-make grid do that work. */}
          <h1 className="text-3xl sm:text-4xl font-bold text-[#0B1220] mb-2">
            {topVehicles.length === 1 && data.vehicleCount === 1 ? (
              <>
                {data.code} on{' '}
                {formatYearLabel(topVehicles[0]) && (
                  <>{formatYearLabel(topVehicles[0])} </>
                )}
                {topVehicles[0].make} {topVehicles[0].model}
                {topVehicles[0].trims.length > 0 && (
                  <> ({topVehicles[0].trims.join(', ')})</>
                )}
                {' — '}
                {data.name}
              </>
            ) : (
              <>{data.code}: {data.name}</>
            )}
          </h1>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-[#94A3B8] text-sm">
              {data.vehicleCount} vehicles &middot; {data.makes.length} makes
              {minCost > 0 && <> &middot; ${minCost.toLocaleString()}-${maxCost.toLocaleString()} repair</>}
            </p>
            <ShareButtons url={articleUrl} title={`${data.code}: ${data.name}`} />
          </div>
        </header>

        {/* Photo/video diagnose CTA — same banner as the article pages.
            Someone reading a code page is mid-diagnosis; the photo flow is
            the fastest path to "is this MY problem". */}
        <div className="mb-6">
          <ConfirmWithPhotoCTA />
        </div>

        {/* Most-reported-on rail — top 5 vehicles by reportCount, each as
            a real <Link>. Surfaces YMMT context above the fold for both
            users (instant visual context: "this code shows up on my
            Camry/Accord/Cruze") and Google (vehicle keywords appear high
            in the page body, reinforcing the title/meta signal). The
            CollapsibleMakeSection grid further down still covers the
            full list. */}
        {data.issues.length > 0 && (
          <section aria-label="Most reported vehicles for this code" className="mb-8">
            <h2 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">
              Most Reported On
            </h2>
            <div className="flex flex-wrap gap-2">
              {data.issues.slice(0, 5).map((iss) => {
                const years = iss.vehicleMatch.years || [];
                const yMin = years.length ? Math.min(...years) : 0;
                const yMax = years.length ? Math.max(...years) : 0;
                const yearLabel = !yMin ? '' : yMin === yMax ? String(yMin) : `${yMin}-${yMax}`;
                const trims = iss.vehicleMatch.trims || [];
                return (
                  <Link
                    key={iss.id}
                    href={`/known-issues/${iss.slug}#${iss.id}`}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#E3DFD4] hover:border-blue-300 hover:bg-blue-50 transition-colors text-sm"
                  >
                    {yearLabel && <span className="font-mono text-xs text-[#64748B]">{yearLabel}</span>}
                    <span className="font-medium text-[#0B1220]">
                      {iss.vehicleMatch.make} {iss.vehicleMatch.model}
                    </span>
                    {trims.length > 0 && (
                      <span className="text-xs text-[#64748B]">
                        {trims.length <= 2 ? trims.join(', ') : `${trims[0]} +${trims.length - 1}`}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* GEO Summary — blockquote */}
        <blockquote className="border-l-4 border-blue-200 pl-5 mb-10">
          <p className="text-[#475569] leading-relaxed">
            <strong className="text-[#334155]">{data.code}</strong> is an OBD-II diagnostic trouble code meaning &ldquo;{data.name}.&rdquo; {data.description}{' '}
            This code is most commonly reported on{' '}
            {topVehicles.map((v, idx) => {
              const yearLabel = formatYearLabel(v);
              return (
                <span key={`${v.make}-${v.model}`}>
                  {idx > 0 && (idx === topVehicles.length - 1 ? ', and ' : ', ')}
                  <strong className="text-[#334155]">
                    {yearLabel && `${yearLabel} `}{v.make} {v.model}
                  </strong>
                  {v.trims.length > 0 && (
                    <> ({v.trims.join(', ')})</>
                  )}
                </span>
              );
            })}
            {moreCount > 0 && <>, plus {moreCount} other vehicle{moreCount === 1 ? '' : 's'}</>}
            {minCost > 0 && <>, with repair costs ranging from <strong className="text-[#334155]">${minCost.toLocaleString()}</strong> to <strong className="text-[#334155]">${maxCost.toLocaleString()}</strong></>}.
          </p>
        </blockquote>

        {/* Two-column layout */}
        <div className="lg:flex lg:gap-0">
          {/* Sidebar TOC */}
          <aside className="hidden lg:block lg:w-56 xl:w-64 flex-shrink-0 border-r border-[#E3DFD4] pr-8 mr-8">
            <nav className="sticky top-8 space-y-6" aria-label="Page navigation">
              <div>
                <h2 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3">On This Page</h2>
                <ul className="space-y-0.5">
                  <li>
                    <a href="#causes" className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#0B1220] py-1.5 rounded-md hover:bg-[#EFEDE6]/70 px-2 -mx-2 transition-colors">
                      Common Causes
                    </a>
                  </li>
                  {minCost > 0 && (
                    <li>
                      <a href="#cost" className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#0B1220] py-1.5 rounded-md hover:bg-[#EFEDE6]/70 px-2 -mx-2 transition-colors">
                        Repair Cost
                      </a>
                    </li>
                  )}
                  <li>
                    <a href="#vehicles" className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#0B1220] py-1.5 rounded-md hover:bg-[#EFEDE6]/70 px-2 -mx-2 transition-colors">
                      Vehicles ({data.vehicleCount})
                    </a>
                  </li>
                  {relatedCodes.length > 0 && (
                    <li>
                      <a href="#related" className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#0B1220] py-1.5 rounded-md hover:bg-[#EFEDE6]/70 px-2 -mx-2 transition-colors">
                        Related Codes
                      </a>
                    </li>
                  )}
                  <li className="pt-1.5 border-t border-[#E3DFD4] mt-1.5">
                    <a href="#faq" className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#0B1220] py-1.5 rounded-md hover:bg-[#EFEDE6]/70 px-2 -mx-2 transition-colors">
                      FAQ
                    </a>
                  </li>
                  {citations.length > 0 && (
                    <li>
                      <a href="#sources" className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#0B1220] py-1.5 rounded-md hover:bg-[#EFEDE6]/70 px-2 -mx-2 transition-colors">
                        Sources ({citations.length})
                      </a>
                    </li>
                  )}
                </ul>
              </div>

              {/* Sidebar makes list */}
              {sortedMakes.length > 1 && (
                <div>
                  <h2 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3">Makes</h2>
                  <ul className="space-y-0.5">
                    {sortedMakes.map(([make, issues]) => (
                      <li key={make}>
                        <a
                          href={`#dtc-${make.toLowerCase().replace(/\s+/g, '-')}`}
                          className="flex items-center justify-between text-sm text-[#64748B] hover:text-[#0B1220] py-1 rounded-md hover:bg-[#EFEDE6]/70 px-2 -mx-2 transition-colors"
                        >
                          <span className="truncate">{make}</span>
                          <span className="text-[#CBD5E1] text-xs">{issues.length}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <a href="#top" className="flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-[#475569] transition-colors">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                Back to top
              </a>
            </nav>
          </aside>

          {/* Main content */}
          <div className="min-w-0 flex-1">
            {/* Common Causes — collapsible */}
            <section id="causes" className="scroll-mt-16 mb-8">
              <details className="group" open>
                <summary className="flex items-center justify-between cursor-pointer py-3 border-b border-[#E3DFD4] list-none">
                  <h2 className="text-lg font-semibold text-[#0B1220]">Common Causes</h2>
                  <svg className="w-5 h-5 text-[#94A3B8] transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-4">
                  {data.commonCauses.map((cause, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg">
                      <span className="flex-shrink-0 w-5 h-5 bg-[#0B1220] text-white text-xs font-bold rounded-full flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-sm text-[#475569]">{cause}</span>
                    </div>
                  ))}
                </div>
              </details>
            </section>

            {/* Cost Range — collapsible */}
            {minCost > 0 && (
              <section id="cost" className="scroll-mt-16 mb-8">
                <details className="group" open>
                  <summary className="flex items-center justify-between cursor-pointer py-3 border-b border-[#E3DFD4] list-none">
                    <h2 className="text-lg font-semibold text-[#0B1220]">Typical Repair Cost</h2>
                    <svg className="w-5 h-5 text-[#94A3B8] transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="pt-4">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-2xl font-bold text-[#0B1220]">
                        ${minCost.toLocaleString()} - ${maxCost.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-[#64748B]">
                      Based on {data.issues.length} documented vehicle-specific issues. Actual cost depends on root cause and vehicle.
                    </p>
                  </div>
                </details>
              </section>
            )}

            {/* OBD Scanner */}
            <OBDScannerRecommendations dtcCode={data.code} />

            {/* Vehicles by Make — collapsible */}
            <section id="vehicles" className="scroll-mt-16 mb-8">
              <details className="group" open>
                <summary className="flex items-center justify-between cursor-pointer py-3 border-b border-[#E3DFD4] list-none">
                  <h2 className="text-lg font-semibold text-[#0B1220]">Vehicles Affected ({data.vehicleCount})</h2>
                  <svg className="w-5 h-5 text-[#94A3B8] transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="space-y-3 pt-4">
                  {sortedMakes.map(([make, issues]) => (
                    <CollapsibleMakeSection
                      key={make}
                      make={make}
                      // Slim DTO: passing the full Prisma rows serialized
                      // EVERYTHING (descriptions, solutions, citations,
                      // affiliate blobs) into the client RSC payload —
                      // P0300 shipped 1.5MB of HTML even though the
                      // component renders 7 small fields (2026-06-12
                      // review finding).
                      issues={issues.map((i) => ({
                        id: i.id,
                        slug: i.slug,
                        title: i.title,
                        severity: i.severity,
                        reportCount: i.reportCount,
                        estimatedCost: i.estimatedCost ?? null,
                        vehicleMatch: {
                          make: i.vehicleMatch.make,
                          model: i.vehicleMatch.model,
                          years: i.vehicleMatch.years,
                        },
                      }))}
                      dtcCode={data.code}
                      makeHref={`/known-issues/dtc/${code.toLowerCase()}/${makeToSlug(make)}`}
                    />
                  ))}
                </div>
              </details>
            </section>

            {/* Related Codes — collapsible */}
            {relatedCodes.length > 0 && (
              <section id="related" className="scroll-mt-16 mb-8">
                <details className="group" open>
                  <summary className="flex items-center justify-between cursor-pointer py-3 border-b border-[#E3DFD4] list-none">
                    <h2 className="text-lg font-semibold text-[#0B1220]">Related Codes ({relatedCodes.length})</h2>
                    <svg className="w-5 h-5 text-[#94A3B8] transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-4">
                    {relatedCodes.map(rc => (
                      <Link
                        key={rc.code}
                        href={`/known-issues/dtc/${rc.code.toLowerCase()}`}
                        className="group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#EFEDE6]/70 transition-colors"
                      >
                        <span className="font-mono font-bold text-sm text-[#64748B] group-hover:text-blue-600 w-16 flex-shrink-0">
                          {rc.code}
                        </span>
                        <span className="text-sm text-[#475569] truncate">{rc.name}</span>
                      </Link>
                    ))}
                  </div>
                </details>
              </section>
            )}

            {/* FAQ — collapsible */}
            <section id="faq" className="scroll-mt-16 mb-8">
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer py-3 border-b border-[#E3DFD4] list-none">
                  <h2 className="text-lg font-semibold text-[#0B1220]">FAQ</h2>
                  <svg className="w-5 h-5 text-[#94A3B8] transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="space-y-6 pt-4">
                  {faqs.map((faq, i) => (
                    <div key={i} className="border-b border-[#E3DFD4] pb-6 last:border-0">
                      <h3 className="text-base font-semibold text-[#0B1220] mb-2">{faq.question}</h3>
                      <p className="text-[#475569] leading-relaxed text-sm">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </details>
            </section>

            {/* Sources — TSBs, NHTSA filings, forum threads, manual refs.
                Aggregated across the issues that mention this DTC code,
                de-duped by URL. Hidden when no citations exist (many
                issues currently have citations:[] — that's a data
                backfill gap, not a code one). Each row is a real <a
                target="_blank" rel="nofollow noopener"> so the SERP page
                still controls outbound link signal but users get the
                primary-source receipt. */}
            {citations.length > 0 && (
              <section id="sources" className="scroll-mt-16 mb-8">
                <details className="group" open>
                  <summary className="flex items-center justify-between cursor-pointer py-3 border-b border-[#E3DFD4] list-none">
                    <h2 className="text-lg font-semibold text-[#0B1220]">Sources ({citations.length})</h2>
                    <svg className="w-5 h-5 text-[#94A3B8] transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <ul className="space-y-2 pt-4">
                    {citations.map((c) => {
                      const typeLabel = c.type === 'tsb' ? 'TSB'
                        : c.type === 'recall' ? 'Recall'
                        : c.type === 'nhtsa' ? 'NHTSA'
                        : c.type === 'forum' ? 'Forum'
                        : c.type === 'manual' ? 'Manual'
                        : c.type;
                      const typeColor = c.type === 'recall' ? 'bg-red-100 text-red-700'
                        : c.type === 'tsb' ? 'bg-blue-100 text-blue-700'
                        : c.type === 'nhtsa' ? 'bg-amber-100 text-amber-700'
                        : 'bg-[#EFEDE6] text-[#334155]';
                      return (
                        <li key={c.url}>
                          <a
                            href={c.url}
                            target="_blank"
                            rel="nofollow noopener noreferrer"
                            className="group flex items-start gap-3 p-3 rounded-lg border border-[#E3DFD4] hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
                          >
                            <span className={`text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded flex-shrink-0 ${typeColor}`}>
                              {typeLabel}
                            </span>
                            <span className="text-sm text-[#475569] group-hover:text-blue-700 transition-colors flex-1 min-w-0">
                              {c.title}
                            </span>
                            <svg className="w-4 h-4 text-[#CBD5E1] group-hover:text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 3h7v7m0-7L10 14m-7 7h7a4 4 0 004-4v-7" />
                            </svg>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </details>
              </section>
            )}

            {/* An OBD2 scanner is the highest-intent match on a trouble-code
                page — the visitor literally needs one to read/clear this code. */}
            <ToolRecommendations
              tools={toolsForDtc()}
              heading={`Read & clear ${data.code} yourself`}
              issueId={`dtc:${data.code}`}
            />

            {/* Soft-conversion: DTC-level email alert capture (SEO-safe, additive). */}
            <div className="mb-8 mt-8">
              <KnownIssueAlertSignup
                vehicleName={data.code}
                context={`dtc:${data.code}`}
                headline={`Get notified about ${data.code} fixes`}
                blurb={`We add new causes, fixes and affected vehicles for ${data.code} regularly — drop your email and we'll keep you posted. You can also diagnose your own car free.`}
              />
            </div>
            <AlertSignupPopup
              vehicleName={data.code}
              context={`dtc:${data.code}`}
              headline={`Get notified about ${data.code} fixes`}
              blurb={`We add new causes, fixes and affected vehicles for ${data.code} regularly — drop your email and we'll keep you posted.`}
            />

            {/* AI disclaimer */}
            <div className="flex items-start gap-2 py-3">
              <svg className="w-4 h-4 text-[#CBD5E1] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Content compiled with AI assistance using NHTSA complaints, TSBs, and owner reports. May contain errors. Always verify with your vehicle&apos;s service manual.
              </p>
            </div>

            {/* Cross-site sitemap for deep-link visitors. */}
            <SiteFooter />

            {/* Footer */}
            <footer className="pt-6 mt-8 border-t border-[#E3DFD4] text-center">
              <p className="text-xs text-[#94A3B8]">
                &copy; {new Date().getFullYear()} Au7o. All rights reserved.
              </p>
            </footer>
          </div>
        </div>
      </article>
    </div>
  );
}
