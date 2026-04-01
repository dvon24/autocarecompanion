import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getAllDTCSlugs, getDTCWithIssues, getDTCDates, getRelatedDTCCodes } from '@/lib/dtc-codes';
import { TechnicalArticleJsonLd, FAQJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { CollapsibleMakeSection } from '@/components/known-issues/CollapsibleMakeSection';
import { OBDScannerRecommendations } from '@/components/known-issues/OBDScannerRecommendations';
import { ShareButtons } from '@/components/shared/ShareButtons';

// --- ISR + dynamic params ---

export const revalidate = 3600;
export const dynamicParams = true;

// --- Static generation ---

export async function generateStaticParams() {
  return await getAllDTCSlugs();
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

  const title = `${data.code}: ${data.name} | OBD-II Code Guide`;
  const description = `${data.code} means "${data.name}." Found on ${data.vehicleCount} vehicle models across ${data.makes.length} makes. Common causes, symptoms, repair costs, and vehicle-specific fixes.`;

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

  const articleUrl = `https://au7o.io/known-issues/dtc/${code.toLowerCase()}`;

  // Group issues by make
  const issuesByMake: Record<string, typeof data.issues> = {};
  for (const issue of data.issues) {
    const make = issue.vehicleMatch.make;
    if (!issuesByMake[make]) issuesByMake[make] = [];
    issuesByMake[make].push(issue);
  }
  const sortedMakes = Object.entries(issuesByMake).sort(([a], [b]) => a.localeCompare(b));

  // Cost range
  const costsLow = data.issues.filter(i => i.estimatedCost).map(i => i.estimatedCost!.low);
  const costsHigh = data.issues.filter(i => i.estimatedCost).map(i => i.estimatedCost!.high);
  const minCost = costsLow.length > 0 ? Math.min(...costsLow) : 0;
  const maxCost = costsHigh.length > 0 ? Math.max(...costsHigh) : 0;

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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="px-6 py-4 border-b border-gray-200">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/og-image.png" alt="Au7o mascot" width={32} height={32} className="rounded-lg" />
            <span className="text-2xl font-bold text-gray-900 tracking-tight">
              Au<span className="text-blue-600">7</span>o
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/known-issues" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Known Issues
            </Link>
            <Link href="/get-started" className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
              Get Started
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
        <nav className="text-sm text-gray-400 mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5">
            <li><Link href="/" className="hover:text-gray-600">Au7o</Link></li>
            <li className="text-gray-300">/</li>
            <li><Link href="/known-issues" className="hover:text-gray-600">Known Issues</Link></li>
            <li className="text-gray-300">/</li>
            <li className="text-gray-700 font-medium">{data.code}</li>
          </ol>
        </nav>

        {/* Title */}
        <header className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm font-mono font-bold bg-gray-900 text-white px-3 py-1 rounded-md">
              {data.code}
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded ${severityColor}`}>
              {severityLabel}
            </span>
            <span className="text-xs text-gray-400 font-medium">{data.system}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            {data.code}: {data.name}
          </h1>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-gray-400 text-sm">
              {data.vehicleCount} vehicles &middot; {data.makes.length} makes
              {minCost > 0 && <> &middot; ${minCost.toLocaleString()}-${maxCost.toLocaleString()} repair</>}
            </p>
            <ShareButtons url={articleUrl} title={`${data.code}: ${data.name}`} />
          </div>
        </header>

        {/* GEO Summary — blockquote */}
        <blockquote className="border-l-4 border-blue-200 pl-5 mb-10">
          <p className="text-gray-600 leading-relaxed">
            <strong className="text-gray-800">{data.code}</strong> is an OBD-II diagnostic trouble code meaning &ldquo;{data.name}.&rdquo; {data.description}{' '}
            This code appears across <strong className="text-gray-800">{data.vehicleCount} vehicle models</strong> from {data.makes.length} manufacturers
            {minCost > 0 && <>, with repair costs ranging from <strong className="text-gray-800">${minCost.toLocaleString()}</strong> to <strong className="text-gray-800">${maxCost.toLocaleString()}</strong></>}.
          </p>
        </blockquote>

        {/* Two-column layout */}
        <div className="lg:flex lg:gap-0">
          {/* Sidebar TOC */}
          <aside className="hidden lg:block lg:w-56 xl:w-64 flex-shrink-0 border-r border-gray-200 pr-8 mr-8">
            <nav className="sticky top-8 space-y-6" aria-label="Page navigation">
              <div>
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">On This Page</h2>
                <ul className="space-y-0.5">
                  <li>
                    <a href="#causes" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 py-1.5 rounded-md hover:bg-gray-50 px-2 -mx-2 transition-colors">
                      Common Causes
                    </a>
                  </li>
                  {minCost > 0 && (
                    <li>
                      <a href="#cost" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 py-1.5 rounded-md hover:bg-gray-50 px-2 -mx-2 transition-colors">
                        Repair Cost
                      </a>
                    </li>
                  )}
                  <li>
                    <a href="#vehicles" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 py-1.5 rounded-md hover:bg-gray-50 px-2 -mx-2 transition-colors">
                      Vehicles ({data.vehicleCount})
                    </a>
                  </li>
                  {relatedCodes.length > 0 && (
                    <li>
                      <a href="#related" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 py-1.5 rounded-md hover:bg-gray-50 px-2 -mx-2 transition-colors">
                        Related Codes
                      </a>
                    </li>
                  )}
                  <li className="pt-1.5 border-t border-gray-100 mt-1.5">
                    <a href="#faq" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 py-1.5 rounded-md hover:bg-gray-50 px-2 -mx-2 transition-colors">
                      FAQ
                    </a>
                  </li>
                </ul>
              </div>

              {/* Sidebar makes list */}
              {sortedMakes.length > 1 && (
                <div>
                  <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Makes</h2>
                  <ul className="space-y-0.5">
                    {sortedMakes.map(([make, issues]) => (
                      <li key={make}>
                        <a
                          href={`#dtc-${make.toLowerCase().replace(/\s+/g, '-')}`}
                          className="flex items-center justify-between text-sm text-gray-500 hover:text-gray-900 py-1 rounded-md hover:bg-gray-50 px-2 -mx-2 transition-colors"
                        >
                          <span className="truncate">{make}</span>
                          <span className="text-gray-300 text-xs">{issues.length}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <a href="#top" className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors">
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
                <summary className="flex items-center justify-between cursor-pointer py-3 border-b border-gray-200 list-none">
                  <h2 className="text-lg font-semibold text-gray-900">Common Causes</h2>
                  <svg className="w-5 h-5 text-gray-400 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-4">
                  {data.commonCauses.map((cause, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg">
                      <span className="flex-shrink-0 w-5 h-5 bg-gray-900 text-white text-xs font-bold rounded-full flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-sm text-gray-700">{cause}</span>
                    </div>
                  ))}
                </div>
              </details>
            </section>

            {/* Cost Range — collapsible */}
            {minCost > 0 && (
              <section id="cost" className="scroll-mt-16 mb-8">
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer py-3 border-b border-gray-200 list-none">
                    <h2 className="text-lg font-semibold text-gray-900">Typical Repair Cost</h2>
                    <svg className="w-5 h-5 text-gray-400 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="pt-4">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-2xl font-bold text-gray-900">
                        ${minCost.toLocaleString()} - ${maxCost.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
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
                <summary className="flex items-center justify-between cursor-pointer py-3 border-b border-gray-200 list-none">
                  <h2 className="text-lg font-semibold text-gray-900">Vehicles Affected ({data.vehicleCount})</h2>
                  <svg className="w-5 h-5 text-gray-400 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="space-y-3 pt-4">
                  {sortedMakes.map(([make, issues]) => (
                    <CollapsibleMakeSection
                      key={make}
                      make={make}
                      issues={issues}
                      dtcCode={data.code}
                    />
                  ))}
                </div>
              </details>
            </section>

            {/* Related Codes — collapsible */}
            {relatedCodes.length > 0 && (
              <section id="related" className="scroll-mt-16 mb-8">
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer py-3 border-b border-gray-200 list-none">
                    <h2 className="text-lg font-semibold text-gray-900">Related Codes ({relatedCodes.length})</h2>
                    <svg className="w-5 h-5 text-gray-400 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-4">
                    {relatedCodes.map(rc => (
                      <Link
                        key={rc.code}
                        href={`/known-issues/dtc/${rc.code.toLowerCase()}`}
                        className="group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-mono font-bold text-sm text-gray-500 group-hover:text-blue-600 w-16 flex-shrink-0">
                          {rc.code}
                        </span>
                        <span className="text-sm text-gray-600 truncate">{rc.name}</span>
                      </Link>
                    ))}
                  </div>
                </details>
              </section>
            )}

            {/* FAQ — collapsible */}
            <section id="faq" className="scroll-mt-16 mb-8">
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer py-3 border-b border-gray-200 list-none">
                  <h2 className="text-lg font-semibold text-gray-900">FAQ</h2>
                  <svg className="w-5 h-5 text-gray-400 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="space-y-6 pt-4">
                  {faqs.map((faq, i) => (
                    <div key={i} className="border-b border-gray-100 pb-6 last:border-0">
                      <h3 className="text-base font-semibold text-gray-900 mb-2">{faq.question}</h3>
                      <p className="text-gray-600 leading-relaxed text-sm">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </details>
            </section>

            {/* AI disclaimer */}
            <div className="flex items-start gap-2 py-3">
              <svg className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-gray-400 leading-relaxed">
                Content compiled with AI assistance using NHTSA complaints, TSBs, and owner reports. May contain errors. Always verify with your vehicle&apos;s service manual.
              </p>
            </div>

            {/* Footer */}
            <footer className="pt-6 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400">
                &copy; {new Date().getFullYear()} Au7o. All rights reserved.
              </p>
            </footer>
          </div>
        </div>
      </article>
    </div>
  );
}
