import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getAllDTCSlugs, getDTCWithIssues, getDTCDates, getRelatedDTCCodes } from '@/lib/dtc-codes';
import { TechnicalArticleJsonLd, FAQJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { CollapsibleMakeSection } from '@/components/known-issues/CollapsibleMakeSection';
import { OBDScannerRecommendations } from '@/components/known-issues/OBDScannerRecommendations';
import { ShareButtons } from '@/components/shared/ShareButtons';
import { AdSlot } from '@/components/ads/AdSlot';

// --- ISR + dynamic params ---

export const revalidate = 3600; // Re-generate cached pages every 1 hour
export const dynamicParams = true; // Allow on-demand rendering of new DTC codes

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

  // Group issues by make for the vehicle section
  const issuesByMake: Record<string, typeof data.issues> = {};
  for (const issue of data.issues) {
    const make = issue.vehicleMatch.make;
    if (!issuesByMake[make]) issuesByMake[make] = [];
    issuesByMake[make].push(issue);
  }
  const sortedMakes = Object.entries(issuesByMake).sort(([a], [b]) => a.localeCompare(b));

  // Compute cost range across all related issues
  const costsLow = data.issues.filter(i => i.estimatedCost).map(i => i.estimatedCost!.low);
  const costsHigh = data.issues.filter(i => i.estimatedCost).map(i => i.estimatedCost!.high);
  const minCost = costsLow.length > 0 ? Math.min(...costsLow) : 0;
  const maxCost = costsHigh.length > 0 ? Math.max(...costsHigh) : 0;

  // Severity config
  const severityLabel = data.severity === 'high' ? 'Critical' : data.severity === 'medium' ? 'Moderate' : 'Minor';
  const severityColor = data.severity === 'high' ? 'text-red-700 bg-red-100' : data.severity === 'medium' ? 'text-yellow-700 bg-yellow-100' : 'text-gray-700 bg-gray-100';

  // FAQs for JSON-LD
  const faqs = [
    {
      question: `What does ${data.code} mean?`,
      answer: `${data.code} stands for "${data.name}." ${data.description}`,
    },
    {
      question: `What are the most common causes of ${data.code}?`,
      answer: `The most common causes of ${data.code} are: ${data.commonCauses.join(', ')}. The specific cause varies by vehicle — Au7o documents vehicle-specific causes for ${data.vehicleCount} models.`,
    },
    {
      question: `How much does it cost to fix ${data.code}?`,
      answer: minCost > 0
        ? `Repair costs for ${data.code} range from $${minCost.toLocaleString()} to $${maxCost.toLocaleString()}, depending on the specific vehicle and root cause. Some fixes like cleaning a MAF sensor are under $50, while others like replacing a catalytic converter can exceed $2,000.`
        : `Repair costs vary widely depending on the root cause and vehicle. Check the vehicle-specific issues below for estimated costs.`,
    },
    {
      question: `Which vehicles are affected by ${data.code}?`,
      answer: `Au7o has documented ${data.code} across ${data.vehicleCount} vehicle models from ${data.makes.length} manufacturers: ${data.makes.join(', ')}. See the full list below for vehicle-specific causes and repair costs.`,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="px-6 py-4 border-b border-gray-100">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
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

      <article className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5">
            <li><Link href="/" className="hover:text-gray-700">Au7o</Link></li>
            <li>/</li>
            <li><Link href="/known-issues" className="hover:text-gray-700">Known Issues</Link></li>
            <li>/</li>
            <li className="text-gray-900 font-medium">{data.code}</li>
          </ol>
        </nav>

        {/* Title */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm font-mono font-bold bg-gray-900 text-white px-3 py-1 rounded-md">
              {data.code}
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded ${severityColor}`}>
              {severityLabel}
            </span>
            <span className="text-xs text-gray-500 font-medium">{data.system}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            {data.code}: {data.name}
          </h1>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-gray-500 text-sm">
              Found on {data.vehicleCount} vehicle models across {data.makes.length} makes
            </p>
            <ShareButtons url={articleUrl} title={`${data.code}: ${data.name}`} />
          </div>
        </header>

        {/* GEO Summary */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 sm:p-6 mb-8">
          <p className="text-gray-800 leading-relaxed">
            <strong>{data.code}</strong> is an OBD-II diagnostic trouble code meaning &ldquo;{data.name}.&rdquo; {data.description}{' '}
            According to Au7o&apos;s database, this code appears across <strong>{data.vehicleCount} vehicle models</strong> from {data.makes.length} manufacturers
            {minCost > 0 && <>, with repair costs ranging from <strong>${minCost.toLocaleString()}</strong> to <strong>${maxCost.toLocaleString()}</strong></>}.
            {' '}Full vehicle-specific causes and solutions at <strong>au7o.io</strong>.
          </p>
        </div>

        {/* Ad slot — horizontal banner after description */}
        <AdSlot slotId="auto" format="horizontal" className="mb-8" />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{data.vehicleCount}</div>
            <div className="text-sm text-gray-500">Vehicles Affected</div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{data.makes.length}</div>
            <div className="text-sm text-gray-500">Makes</div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{data.issues.length}</div>
            <div className="text-sm text-gray-500">Related Issues</div>
          </div>
        </div>

        {/* Common Causes */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Common Causes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.commonCauses.map((cause, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <span className="flex-shrink-0 w-6 h-6 bg-gray-900 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="text-sm text-gray-700">{cause}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Cost Range */}
        {minCost > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Typical Repair Cost</h2>
            <div className="bg-green-50 border border-green-200 rounded-xl p-5">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold text-green-800">
                  ${minCost.toLocaleString()} - ${maxCost.toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-green-700">
                Range based on {data.issues.length} documented vehicle-specific issues. Actual cost depends on the root cause, your vehicle, and whether you DIY or visit a shop.
              </p>
            </div>
          </section>
        )}

        {/* OBD-II Scanner Recommendations */}
        <OBDScannerRecommendations dtcCode={data.code} />

        {/* Vehicle-Specific Issues by Make */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Vehicles Affected by {data.code}
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Click any vehicle to see the full issue details, symptoms, and repair guide.
          </p>

          {/* Make quick-jump */}
          <nav className="mb-6" aria-label="Jump to make">
            <div className="flex flex-wrap gap-2">
              {sortedMakes.map(([make]) => (
                <a
                  key={make}
                  href={`#dtc-${make.toLowerCase().replace(/\s+/g, '-')}`}
                  className="px-3 py-1.5 text-sm font-medium bg-gray-100 text-gray-700 rounded-full hover:bg-blue-100 hover:text-blue-700 transition-colors"
                >
                  {make} ({issuesByMake[make].length})
                </a>
              ))}
            </div>
          </nav>

          <div className="space-y-3">
            {sortedMakes.map(([make, issues]) => (
              <CollapsibleMakeSection
                key={make}
                make={make}
                issues={issues}
                dtcCode={data.code}
              />
            ))}
          </div>
        </section>

        {/* Related DTC Codes */}
        {relatedCodes.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Related Codes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {relatedCodes.map(rc => (
                <Link
                  key={rc.code}
                  href={`/known-issues/dtc/${rc.code.toLowerCase()}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                >
                  <span className="font-mono font-bold text-sm text-gray-700 group-hover:text-blue-700 bg-white px-2 py-0.5 rounded border border-gray-200">
                    {rc.code}
                  </span>
                  <span className="text-sm text-gray-600 truncate">{rc.name}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* FAQ Section */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
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

        {/* CTA */}
        <section className="bg-gray-900 text-white rounded-xl p-6 sm:p-8 text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-3">
            Get a DIY Repair Guide for Your Vehicle
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

        {/* AI content disclaimer */}
        <div className="mt-10 flex items-start gap-2 px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg">
          <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-gray-400 leading-relaxed">
            Content on this page was compiled with AI assistance using NHTSA complaints, TSBs, owner reports, and public automotive data. While we strive for accuracy, this information may contain errors. Always verify repair procedures with your vehicle&apos;s service manual or a qualified mechanic.
          </p>
        </div>

        {/* Footer */}
        <footer className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            Data sourced from owner reports, TSBs, recalls, and automotive forums.
            Always consult a professional mechanic for diagnosis. OBD-II codes should be interpreted alongside symptoms and vehicle history.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            &copy; {new Date().getFullYear()} Au7o. All rights reserved.
          </p>
        </footer>
      </article>
    </div>
  );
}
