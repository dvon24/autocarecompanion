import { ConfirmWithPhotoCTA } from '@/components/diagnose/ConfirmWithPhotoCTA';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getDTCWithIssuesForMake, getAllDTCMakeSlugs, slugToMake, makeToSlug, getDTCDates } from '@/lib/dtc-codes';
import { TechnicalArticleJsonLd, BreadcrumbJsonLd, FAQJsonLd } from '@/components/seo/JsonLd';
import { ShareButtons } from '@/components/shared/ShareButtons';

/**
 * Per-make DTC page — /known-issues/dtc/[code]/[make]
 *
 * Captures SERP queries like "ford p0a09" or "honda p0420" that the
 * generic /known-issues/dtc/[code] page wasn't optimized for. Filters
 * the DTC's linked KnownIssues to a single make and produces title +
 * meta + H1 tightly scoped to that make for relevance.
 *
 * Static-generated only for (code, make) pairs that have at least one
 * published KnownIssue link — filters the combinatorial explosion
 * (323 codes × 34 makes = 10,982 theoretical) down to ~2,000 real pages.
 */

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  // COST: these ~2,500 code×make pages were rebuilt in full on EVERY deploy
  // (the dominant Vercel Build-CPU-Minutes charge). They're already ISR
  // (revalidate 3600 + dynamicParams true), so we pre-render only a small
  // warm set at build and generate the long tail on-demand on first visit,
  // then cache. Fully indexable; also fixes the Supabase build-timeouts (no
  // 19-worker parallel DB storm at build). Bump the slice to pre-warm more.
  return (await getAllDTCMakeSlugs()).slice(0, 50);
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

  // Top 3 models for this make+DTC, used in the title + description
  const topModels: string[] = [];
  const seen = new Set<string>();
  for (const iss of data.issues) {
    if (seen.has(iss.vehicleMatch.model)) continue;
    seen.add(iss.vehicleMatch.model);
    topModels.push(iss.vehicleMatch.model);
    if (topModels.length >= 3) break;
  }
  const moreCount = Math.max(0, data.vehicleCount - topModels.length);
  const moreSuffix = moreCount > 0 ? ` & ${moreCount} more` : '';

  const title = `${data.code} on ${make}${topModels.length ? ` (${topModels.join(', ')}${moreSuffix})` : ''} — ${data.name}`;
  const description = `${data.code} (${data.name}) on ${make} ${topModels.join(', ')}${moreSuffix} — common causes, model-specific fixes, and repair costs from real owner reports.`;

  return {
    title,
    description,
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

  const [data, dtcDates] = await Promise.all([
    getDTCWithIssuesForMake(code, make),
    getDTCDates(code),
  ]);
  if (!data) notFound();

  const codeUpper = data.code;
  const articleUrl = `https://au7o.io/known-issues/dtc/${code.toLowerCase()}/${makeSlug}`;
  const parentUrl = `https://au7o.io/known-issues/dtc/${code.toLowerCase()}`;

  // Cost range across this make's issues — filter $0 entries (AI
  // pipeline writes zeros when no real cost is found). Including them
  // produces "$0-$X" in the SERP snippet which kills CTR.
  const costsLow = data.issues
    .filter(i => i.estimatedCost && i.estimatedCost.low > 0)
    .map(i => i.estimatedCost!.low);
  const costsHigh = data.issues
    .filter(i => i.estimatedCost && i.estimatedCost.high > 0)
    .map(i => i.estimatedCost!.high);
  const minCost = costsLow.length > 0 ? Math.min(...costsLow) : 0;
  const maxCost = costsHigh.length > 0 ? Math.max(...costsHigh) : 0;

  // Group by model
  const byModel: Record<string, typeof data.issues> = {};
  for (const issue of data.issues) {
    const model = issue.vehicleMatch.model;
    if (!byModel[model]) byModel[model] = [];
    byModel[model].push(issue);
  }
  const sortedModels = Object.entries(byModel).sort(([a], [b]) => a.localeCompare(b));

  const severityLabel = data.severity === 'high' ? 'Critical' : data.severity === 'medium' ? 'Moderate' : 'Minor';
  const severityColor = data.severity === 'high' ? 'text-red-700 bg-red-100' : data.severity === 'medium' ? 'text-yellow-700 bg-yellow-100' : 'text-gray-700 bg-gray-100';

  const faqs = [
    {
      question: `What does ${codeUpper} mean on ${make}?`,
      answer: `${codeUpper} stands for "${data.name}." ${data.description} On ${make} specifically, this code is documented across ${data.vehicleCount} model${data.vehicleCount === 1 ? '' : 's'}.`,
    },
    {
      question: `What causes ${codeUpper} on ${make} vehicles?`,
      answer: `Common causes on ${make}: ${data.commonCauses.slice(0, 5).join(', ')}. Specific causes vary by model and year — see the per-model sections below.`,
    },
    {
      question: `How much does it cost to fix ${codeUpper} on a ${make}?`,
      answer: minCost > 0
        ? `Repair costs on ${make} range from $${minCost.toLocaleString()} to $${maxCost.toLocaleString()}, depending on the specific model and root cause.`
        : `Repair costs vary widely depending on the root cause and specific ${make} model.`,
    },
    {
      question: `Which ${make} models have ${codeUpper} documented?`,
      answer: `Au7o has documented ${codeUpper} on ${data.vehicleCount} ${make} model${data.vehicleCount === 1 ? '' : 's'}: ${sortedModels.map(([m]) => m).join(', ')}.`,
    },
  ];

  return (
    <main className="min-h-screen" style={{ background: '#F7F6F2' }}>
      <TechnicalArticleJsonLd
        title={`${codeUpper} on ${make} — ${data.name}`}
        description={`${codeUpper} (${data.name}) documented on ${data.vehicleCount} ${make} model${data.vehicleCount === 1 ? '' : 's'} with common causes, fixes, and repair costs.`}
        url={articleUrl}
        datePublished={dtcDates.published}
        dateModified={dtcDates.modified}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://au7o.io' },
          { name: 'Known Issues', url: 'https://au7o.io/known-issues' },
          { name: 'DTC Codes', url: 'https://au7o.io/known-issues/dtc' },
          { name: codeUpper, url: parentUrl },
          { name: make, url: articleUrl },
        ]}
      />
      <FAQJsonLd questions={faqs} />

      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-[#64748B] mb-4">
          <Link href="/known-issues" className="hover:text-blue-600">Known Issues</Link>
          <span className="mx-2">/</span>
          <Link href={`/known-issues/dtc/${code.toLowerCase()}`} className="hover:text-blue-600">{codeUpper}</Link>
          <span className="mx-2">/</span>
          <span className="text-[#0B1220]">{make}</span>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl font-bold text-[#0B1220] mb-2">
            {codeUpper} on {make}
          </h1>
          <p className="text-xl text-[#334155] mb-4">{data.name}</p>
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${severityColor}`}>
              {severityLabel}
            </span>
            <span className="px-3 py-1 rounded-full text-sm font-medium text-[#334155] bg-[#EFEDE6]">
              {data.vehicleCount} {make} model{data.vehicleCount === 1 ? '' : 's'} affected
            </span>
            {minCost > 0 && (
              <span className="px-3 py-1 rounded-full text-sm font-medium text-emerald-700 bg-emerald-50">
                ${minCost.toLocaleString()}-${maxCost.toLocaleString()} typical repair
              </span>
            )}
            <span className="px-3 py-1 rounded-full text-sm font-medium text-[#475569] bg-white border border-[#E3DFD4]">
              System: {data.system}
            </span>
          </div>
        </header>

        {/* Photo/video diagnose CTA — same banner as the article pages. */}
        <div className="mb-6">
          <ConfirmWithPhotoCTA />
        </div>

        {/* GEO summary — the lead paragraph AI models cite when answering
            "what does P0420 mean on a Honda" style queries. Names the
            specific make + top models + cost range so the citation has
            everything in one block. */}
        <section className="bg-white border border-[#E3DFD4] rounded-2xl p-6 mb-6">
          <p className="text-[#334155] leading-relaxed">
            <strong>{codeUpper}</strong> on <strong>{make}</strong> vehicles indicates {data.name.toLowerCase()}.{' '}
            Au7o has documented this code across {data.vehicleCount} {make} model{data.vehicleCount === 1 ? '' : 's'}
            {sortedModels.length > 0 && (
              <> — most commonly on <strong>{sortedModels.slice(0, 3).map(([m]) => m).join(', ')}</strong></>
            )}
            . {data.description}{' '}
            {minCost > 0 && (
              <>Typical repair costs on {make} range from <strong>${minCost.toLocaleString()} to ${maxCost.toLocaleString()}</strong>,{' '}
              depending on the specific model and root cause.</>
            )}
          </p>
        </section>

        {/* Common causes — universal for this DTC */}
        <section className="bg-white border border-[#E3DFD4] rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-[#0B1220] mb-3">Common Causes of {codeUpper}</h2>
          <ul className="space-y-2">
            {data.commonCauses.map((cause, i) => (
              <li key={i} className="flex gap-2 text-[#334155]">
                <span className="text-blue-500 flex-shrink-0 mt-0.5">•</span>
                <span>{cause}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Per-model breakdown — the meat of the page */}
        <section className="mb-6">
          <h2 className="text-2xl font-bold text-[#0B1220] mb-4">
            {codeUpper} on {make} by Model
          </h2>
          <div className="space-y-6">
            {sortedModels.map(([model, modelIssues]) => (
              <div key={model} className="bg-white border border-[#E3DFD4] rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-[#0B1220] mb-3">
                  <Link
                    href={`/known-issues/${modelIssues[0].slug}`}
                    className="hover:text-blue-600"
                  >
                    {make} {model}
                  </Link>
                  <span className="ml-2 text-sm font-normal text-[#64748B]">
                    ({modelIssues.length} issue{modelIssues.length === 1 ? '' : 's'})
                  </span>
                </h3>
                <ul className="space-y-3">
                  {modelIssues.slice(0, 5).map((issue) => {
                    const years = issue.vehicleMatch.years || [];
                    const yearLabel = years.length
                      ? years.length === 1
                        ? `${years[0]}`
                        : `${Math.min(...years)}-${Math.max(...years)}`
                      : null;
                    return (
                      <li key={issue.id} className="border-l-2 border-blue-100 pl-3">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="font-medium text-[#0B1220]">{issue.title}</span>
                          {yearLabel && (
                            <span className="text-xs text-[#64748B]">{yearLabel}</span>
                          )}
                        </div>
                        {issue.description && (
                          <p className="text-sm text-[#475569] mt-1 line-clamp-2">{issue.description}</p>
                        )}
                      </li>
                    );
                  })}
                  {modelIssues.length > 5 && (
                    <li className="text-sm text-[#64748B] pl-3">
                      + {modelIssues.length - 5} more issue{modelIssues.length - 5 === 1 ? '' : 's'} —{' '}
                      <Link
                        href={`/known-issues/${modelIssues[0].slug}`}
                        className="text-blue-600 hover:underline"
                      >
                        see all on {model} page
                      </Link>
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Link out to generic DTC page */}
        <section className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6 text-center">
          <p className="text-sm text-[#334155] mb-2">
            Looking for {codeUpper} on a different make?
          </p>
          <Link
            href={`/known-issues/dtc/${code.toLowerCase()}`}
            className="text-blue-700 hover:text-blue-900 font-medium"
          >
            View {codeUpper} across all makes →
          </Link>
        </section>

        {/* FAQs */}
        <section className="bg-white border border-[#E3DFD4] rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-[#0B1220] mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="group">
                <summary className="cursor-pointer font-medium text-[#0B1220] hover:text-blue-600 list-none flex items-baseline justify-between">
                  <span>{faq.question}</span>
                  <span className="text-[#94A3B8] group-open:rotate-180 transition-transform text-xs">▼</span>
                </summary>
                <p className="mt-2 text-[#334155] text-sm">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <ShareButtons url={articleUrl} title={`${codeUpper} on ${make} — ${data.name}`} />
      </article>
    </main>
  );
}
