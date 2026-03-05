import { Metadata } from 'next';
import Link from 'next/link';
import { getAllKnownIssueSlugs, getKnownIssuesForArticle, getYearRange } from '@/lib/known-issues';

export const metadata: Metadata = {
  title: 'Known Vehicle Issues & Problems | Au7o',
  description:
    'Browse 1,600+ documented vehicle problems across 20 makes and 386 models. Symptoms, repair costs, and solutions from real owner reports.',
  openGraph: {
    title: 'Known Vehicle Issues & Problems | Au7o',
    description:
      'Browse 1,600+ documented vehicle problems across 20 makes and 386 models.',
    url: 'https://au7o.io/known-issues',
    siteName: 'Au7o',
  },
  alternates: {
    canonical: 'https://au7o.io/known-issues',
  },
};

interface VehicleEntry {
  slug: string;
  make: string;
  model: string;
  issueCount: number;
  highCount: number;
  yearRange: { min: number; max: number } | null;
}

function buildDirectory() {
  const slugs = getAllKnownIssueSlugs();
  const grouped: Record<string, VehicleEntry[]> = {};

  for (const { slug, make, model } of slugs) {
    const issues = getKnownIssuesForArticle(make, model);
    if (issues.length === 0) continue;

    const entry: VehicleEntry = {
      slug,
      make,
      model,
      issueCount: issues.length,
      highCount: issues.filter(i => i.severity === 'high').length,
      yearRange: getYearRange(issues),
    };

    if (!grouped[make]) grouped[make] = [];
    grouped[make].push(entry);
  }

  // Sort makes alphabetically, models by issue count descending
  const sorted = Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([make, vehicles]) => ({
      make,
      vehicles: vehicles.sort((a, b) => b.issueCount - a.issueCount),
      totalIssues: vehicles.reduce((sum, v) => sum + v.issueCount, 0),
    }));

  return sorted;
}

export default function KnownIssuesIndexPage() {
  const directory = buildDirectory();
  const totalVehicles = directory.reduce((sum, g) => sum + g.vehicles.length, 0);
  const totalIssues = directory.reduce((sum, g) => sum + g.totalIssues, 0);

  return (
    <div className="min-h-screen bg-white">
      <article className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5">
            <li><Link href="/" className="hover:text-gray-700">Au7o</Link></li>
            <li>/</li>
            <li className="text-gray-900 font-medium">Known Issues</li>
          </ol>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Known Vehicle Issues & Problems
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl">
            Browse {totalIssues.toLocaleString()}+ documented problems across {directory.length} makes and {totalVehicles} models. Every issue includes symptoms, repair costs, and solutions from real owner reports.
          </p>
        </header>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{directory.length}</div>
            <div className="text-sm text-gray-500">Makes</div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{totalVehicles}</div>
            <div className="text-sm text-gray-500">Models</div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{totalIssues.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Issues Documented</div>
          </div>
        </div>

        {/* Make quick-jump nav */}
        <nav className="mb-10" aria-label="Jump to make">
          <div className="flex flex-wrap gap-2">
            {directory.map(({ make }) => (
              <a
                key={make}
                href={`#${make.toLowerCase().replace(/\s+/g, '-')}`}
                className="px-3 py-1.5 text-sm font-medium bg-gray-100 text-gray-700 rounded-full hover:bg-blue-100 hover:text-blue-700 transition-colors"
              >
                {make}
              </a>
            ))}
          </div>
        </nav>

        {/* Vehicle directory by make */}
        <div className="space-y-10">
          {directory.map(({ make, vehicles, totalIssues: makeTotal }) => (
            <section
              key={make}
              id={make.toLowerCase().replace(/\s+/g, '-')}
              className="scroll-mt-16"
            >
              <div className="flex items-baseline gap-3 mb-4 border-b border-gray-200 pb-2">
                <h2 className="text-xl font-bold text-gray-900">{make}</h2>
                <span className="text-sm text-gray-400">
                  {vehicles.length} models &middot; {makeTotal} issues
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {vehicles.map((vehicle) => (
                  <Link
                    key={vehicle.slug}
                    href={`/known-issues/${vehicle.slug}`}
                    className="group flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors truncate">
                        {vehicle.model}
                      </div>
                      {vehicle.yearRange && (
                        <div className="text-xs text-gray-400">
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
                      <span className="text-sm text-gray-400">
                        {vehicle.issueCount}
                      </span>
                      <svg className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* CTA */}
        <section className="mt-16 bg-gray-900 text-white rounded-xl p-6 sm:p-8 text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-3">
            Get DIY Repair Guides for Your Vehicle
          </h2>
          <p className="text-gray-300 mb-6 max-w-lg mx-auto">
            AI-powered step-by-step repair and maintenance guides tailored to your exact vehicle.
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

        {/* Footer */}
        <footer className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            Data sourced from owner reports, TSBs, recalls, and automotive forums.
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
