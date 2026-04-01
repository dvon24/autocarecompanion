import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { makeSlug } from '@/lib/known-issues';
import { categoryConfig } from '@/lib/issue-categories';
import { IssueCategory } from '@/schemas/knownIssue.schema';
import { IssueSearch } from '@/components/known-issues/IssueSearch';
import { BreadcrumbJsonLd, CollectionPageJsonLd } from '@/components/seo/JsonLd';
import prisma from '@/lib/db';

// --- ISR ---

export const revalidate = 1800; // Re-generate cached page every 30 minutes

export const metadata: Metadata = {
  title: 'Known Vehicle Issues & Problems | Au7o',
  description:
    'Browse 4,100+ documented vehicle problems across 34 makes and 640+ models, plus 323 OBD-II error codes. Symptoms, repair costs, and solutions from real owner reports.',
  openGraph: {
    title: 'Known Vehicle Issues & Problems | Au7o',
    description:
      'Browse 4,100+ documented vehicle problems across 34 makes and 640+ models.',
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

// Popular makes — shown as featured cards at top
const POPULAR_MAKES = [
  'Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW', 'Dodge',
  'Jeep', 'Nissan', 'Hyundai', 'Kia', 'Mercedes-Benz', 'Subaru',
];

// Make icons — simple emoji/text representations
const makeIcons: Record<string, string> = {
  'Acura': '🅰️', 'Alfa Romeo': '🏎️', 'Audi': '🔵', 'BMW': '🔷',
  'Cadillac': '👑', 'Chevrolet': '🏁', 'Chrysler': '⭐', 'Citroën': '🇫🇷',
  'Dodge': '🐏', 'Fiat': '🇮🇹', 'Ford': '🔵', 'Genesis': '💎',
  'GMC': '🔴', 'Honda': '🔴', 'Hyundai': '🔷', 'Infiniti': '♾️',
  'Jaguar': '🐆', 'Jeep': '🏔️', 'Kia': '🔴', 'Land Rover': '🟢',
  'Lexus': '🔷', 'Mazda': '🔴', 'Mercedes-Benz': '⭐', 'MINI': '🇬🇧',
  'Mitsubishi': '🔺', 'Nissan': '🔴', 'Peugeot': '🦁', 'Porsche': '🏎️',
  'RAM': '🐏', 'Renault': '🇫🇷', 'Subaru': '⭐', 'Toyota': '🔴',
  'Volkswagen': '🔵', 'Volvo': '🔵',
};

async function buildDirectory() {
  const rows = await prisma.knownIssue.findMany({
    where: { status: 'published' },
    select: { make: true, model: true, severity: true, years: true },
  });

  const vehicleMap: Record<string, { make: string; model: string; count: number; highCount: number; minYear: number; maxYear: number }> = {};

  for (const row of rows) {
    const key = `${row.make}|${row.model}`;
    if (!vehicleMap[key]) {
      vehicleMap[key] = { make: row.make, model: row.model, count: 0, highCount: 0, minYear: Infinity, maxYear: -Infinity };
    }
    vehicleMap[key].count++;
    if (row.severity === 'high') vehicleMap[key].highCount++;
    for (const y of row.years) {
      if (y < vehicleMap[key].minYear) vehicleMap[key].minYear = y;
      if (y > vehicleMap[key].maxYear) vehicleMap[key].maxYear = y;
    }
  }

  const grouped: Record<string, VehicleEntry[]> = {};
  for (const v of Object.values(vehicleMap)) {
    const entry: VehicleEntry = {
      slug: makeSlug(v.make, v.model),
      make: v.make,
      model: v.model,
      issueCount: v.count,
      highCount: v.highCount,
      yearRange: v.minYear === Infinity ? null : { min: v.minYear, max: v.maxYear },
    };
    if (!grouped[v.make]) grouped[v.make] = [];
    grouped[v.make].push(entry);
  }

  return Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([make, vehicles]) => ({
      make,
      vehicles: vehicles.sort((a, b) => a.model.localeCompare(b.model)),
      totalIssues: vehicles.reduce((sum, v) => sum + v.issueCount, 0),
    }));
}

export default async function KnownIssuesIndexPage() {
  const directory = await buildDirectory();
  const totalVehicles = directory.reduce((sum, g) => sum + g.vehicles.length, 0);
  const totalIssues = directory.reduce((sum, g) => sum + g.totalIssues, 0);

  const allDtcRows = await prisma.dTCCode.findMany({
    select: { code: true, name: true },
    orderBy: { code: 'asc' },
  });
  const dtcSlice = allDtcRows.slice(0, 15);
  const dtcInfoMap: Record<string, { name: string } | null> = {};
  const dtcNameLookup = new Map(allDtcRows.map(r => [r.code.toLowerCase(), r.name]));
  for (const { code } of dtcSlice) {
    const name = dtcNameLookup.get(code.toLowerCase());
    dtcInfoMap[code.toLowerCase()] = name ? { name } : null;
  }

  const searchVehicles = directory.flatMap(({ vehicles }) =>
    vehicles.map(v => ({ slug: v.slug, make: v.make, model: v.model, issueCount: v.issueCount }))
  );
  const searchDtcCodes = allDtcRows.map(r => ({ code: r.code.toLowerCase(), name: r.name }));

  // Split directory into popular and rest
  const popularMakes = directory.filter(d => POPULAR_MAKES.includes(d.make));
  const otherMakes = directory.filter(d => !POPULAR_MAKES.includes(d.make));

  return (
    <div className="min-h-screen bg-white">
      <BreadcrumbJsonLd items={[
        { name: 'Au7o', url: 'https://au7o.io' },
        { name: 'Known Issues', url: 'https://au7o.io/known-issues' },
      ]} />
      <CollectionPageJsonLd
        name="Known Vehicle Issues & Problems"
        description={`Browse ${totalIssues.toLocaleString()}+ documented vehicle problems across ${directory.length} makes and ${totalVehicles} models.`}
        url="https://au7o.io/known-issues"
        numberOfItems={directory.length}
        itemListElement={directory.map(({ make, totalIssues: makeTotal }) => ({
          name: `${make} Issues`,
          url: `https://au7o.io/known-issues?make=${encodeURIComponent(make.toLowerCase())}`,
          description: `${makeTotal} known issues for ${make} vehicles`,
        }))}
      />

      {/* Header */}
      <header className="px-6 py-4 border-b border-gray-200">
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
              href="/get-started"
              className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Hero */}
        <div className="py-10 sm:py-14">
          <nav className="text-sm text-gray-400 mb-4" aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5">
              <li><Link href="/" className="hover:text-gray-600">Au7o</Link></li>
              <li className="text-gray-300">/</li>
              <li className="text-gray-700 font-medium">Known Issues</li>
            </ol>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Known Vehicle Issues
          </h1>
          <p className="text-gray-500 max-w-xl">
            {totalIssues.toLocaleString()}+ documented problems across {directory.length} makes and {totalVehicles} models. Symptoms, costs, and solutions from real owner reports.
          </p>
        </div>

        {/* Search */}
        <div className="mb-10">
          <IssueSearch vehicles={searchVehicles} dtcCodes={searchDtcCodes} />
        </div>

        {/* Popular Makes — featured cards */}
        <section className="mb-12">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Popular Makes</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {popularMakes.map(({ make, vehicles, totalIssues: makeTotal }) => (
              <Link
                key={make}
                href={`/known-issues/make/${make.toLowerCase().replace(/\s+/g, '-')}`}
                className="group flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <span className="text-2xl flex-shrink-0 mt-0.5">{makeIcons[make] || '🚗'}</span>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{make}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {vehicles.length} models &middot; {makeTotal} issues
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* All Makes — compact grid */}
        <section className="mb-12">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">All Makes</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
            {directory.map(({ make, vehicles, totalIssues: makeTotal }) => (
              <Link
                key={make}
                href={`/known-issues/make/${make.toLowerCase().replace(/\s+/g, '-')}`}
                className="group flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-lg flex-shrink-0">{makeIcons[make] || '🚗'}</span>
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 truncate block">{make}</span>
                  <span className="text-xs text-gray-400">{vehicles.length} models</span>
                </div>
                <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </section>

        {/* Browse by Category */}
        <section className="mb-12">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Browse by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {(Object.keys(categoryConfig) as IssueCategory[]).map(cat => {
              const config = categoryConfig[cat];
              return (
                <Link
                  key={cat}
                  href={`/known-issues/category/${cat}`}
                  className="group flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-lg">{config.icon}</span>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{config.label}</span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Common DTC Codes */}
        <section className="mb-12">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Common Error Codes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {dtcSlice.map(({ code }) => {
              const info = dtcInfoMap[code.toLowerCase()];
              return (
                <Link
                  key={code}
                  href={`/known-issues/dtc/${code.toLowerCase()}`}
                  className="group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="font-mono font-bold text-gray-500 group-hover:text-blue-600 text-xs w-14 flex-shrink-0">{code.toUpperCase()}</span>
                  {info && (
                    <span className="text-sm text-gray-500 truncate">{info.name}</span>
                  )}
                </Link>
              );
            })}
          </div>
          {allDtcRows.length > 15 && (
            <Link
              href="/known-issues/dtc/p0300"
              className="inline-flex items-center gap-1 mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              Browse all {allDtcRows.length} error codes
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </section>

        {/* AI disclaimer */}
        <div className="flex items-start gap-2 py-3 mb-6">
          <svg className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-gray-400 leading-relaxed">
            Issue data was compiled with AI assistance and may contain errors. Always consult a qualified mechanic for diagnosis and repair.
          </p>
        </div>

        {/* Footer */}
        <footer className="py-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Au7o. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
