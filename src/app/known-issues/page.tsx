import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getAllKnownIssueSlugs, getKnownIssuesForArticle, getYearRange } from '@/lib/known-issues';
import { getAllDTCSlugs, getDTCInfo } from '@/lib/dtc-codes';
import { CollapsibleMakeDirectory } from '@/components/known-issues/CollapsibleMakeDirectory';

export const metadata: Metadata = {
  title: 'Known Vehicle Issues & Problems | Au7o',
  description:
    'Browse 2,300+ documented vehicle problems across 20 makes and 500+ models, plus 59 common OBD-II error codes. Symptoms, repair costs, and solutions from real owner reports.',
  openGraph: {
    title: 'Known Vehicle Issues & Problems | Au7o',
    description:
      'Browse 2,300+ documented vehicle problems across 20 makes and 490+ models.',
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
      vehicles: vehicles.sort((a, b) => a.model.localeCompare(b.model)),
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
              href="/get-started"
              className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

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
        <div className="space-y-3">
          {directory.map(({ make, vehicles, totalIssues: makeTotal }) => (
            <CollapsibleMakeDirectory
              key={make}
              make={make}
              vehicles={vehicles}
              totalIssues={makeTotal}
            />
          ))}
        </div>

        {/* Common DTC Codes Section */}
        <section className="mt-12 mb-10">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Common OBD-II Error Codes</h3>
          <p className="text-gray-400 text-sm mb-4">
            Pulled a code with your scanner? Find out what it means and which vehicles are affected.
          </p>
          <div className="flex flex-wrap gap-2">
            {getAllDTCSlugs().slice(0, 15).map(({ code }) => {
              const info = getDTCInfo(code);
              return (
                <Link
                  key={code}
                  href={`/known-issues/dtc/${code}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg text-sm hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                >
                  <span className="font-mono font-bold text-gray-700 group-hover:text-blue-700 text-xs">{code.toUpperCase()}</span>
                  {info && (
                    <span className="text-gray-400 text-xs hidden sm:inline truncate max-w-[160px]">{info.name}</span>
                  )}
                </Link>
              );
            })}
          </div>
          {getAllDTCSlugs().length > 15 && (
            <Link
              href="/known-issues/dtc/p0300"
              className="inline-flex items-center gap-1 mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              Browse all error codes
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          )}
        </section>

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
