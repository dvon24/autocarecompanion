import Link from 'next/link';
import Image from 'next/image';
import { makeSlug, getPublishedMakes } from '@/lib/known-issues';
import { ISSUE_CATALOGS, MOTORCYCLE_CATALOG, catalogIsDesignPreview, motorcycleCoverageDescription, type IssueCatalog } from '@/lib/known-issues-catalog';
import { catalogCategory, categoryConfig } from '@/lib/issue-categories';
import type { IssueCategory } from '@/schemas/knownIssue.schema';
import { BreadcrumbJsonLd, CollectionPageJsonLd } from '@/components/seo/JsonLd';
import { DirectorySections } from '@/components/known-issues/catalog/DirectorySections';
import { SiteFooter } from '@/components/shared/SiteFooter';
import prisma from '@/lib/db';

/**
 * The catalog INDEX template, shared by every catalog. Not a page module: the
 * route wrappers own `revalidate` and `metadata` and call IndexPage with
 * their catalog. See src/lib/known-issues-catalog.ts.
 */

interface VehicleEntry {
  slug: string;
  make: string;
  model: string;
  issueCount: number;
  highCount: number;
  yearRange: { min: number; max: number } | null;
}

async function buildDirectory(catalog: IssueCatalog) {
  const rows = await prisma.knownIssue.findMany({
    where: { status: 'published', vehicleType: catalog.vehicleType },
    select: { make: true, model: true, severity: true, years: true, category: true },
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

  const directory = Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([make, vehicles]) => ({
      make,
      vehicles: vehicles.sort((a, b) => a.model.localeCompare(b.model)),
      totalIssues: vehicles.reduce((sum, v) => sum + v.issueCount, 0),
    }));
  const coveredCategories = new Set(rows.map(row => catalogCategory(row.category)));
  const categories = (Object.keys(categoryConfig) as IssueCategory[]).filter(category => coveredCategories.has(category));
  return { directory, categories };
}

export async function IndexPage(catalog: IssueCatalog) {
  const [coverage, motorcycleCoverage] = await Promise.all([
    buildDirectory(catalog),
    catalog.vehicleType === 'car' ? buildDirectory(MOTORCYCLE_CATALOG) : Promise.resolve(null),
  ]);
  const { directory } = coverage;
  const totalVehicles = directory.reduce((sum, g) => sum + g.vehicles.length, 0);
  const totalIssues = directory.reduce((sum, g) => sum + g.totalIssues, 0);
  const bikeDescription = motorcycleCoverageDescription(totalIssues, catalogIsDesignPreview(catalog));

  // Other catalogs that have something published, for the hero cross-link.
  const siblingCatalogs = (await Promise.all(
    ISSUE_CATALOGS.filter((c) => c.vehicleType !== catalog.vehicleType).map(async (c) =>
      (await getPublishedMakes(c.vehicleType)).length > 0 ? c : null),
  )).filter((c): c is IssueCatalog => c !== null);

  // OBD-II is automotive; the error-code section is switched off elsewhere.
  const allDtcRows = catalog.dtcLinks
    ? await prisma.dTCCode.findMany({
      select: { code: true, name: true },
      orderBy: { code: 'asc' },
    })
    : [];
  const dtcSlice = allDtcRows.slice(0, 15);
  const dtcInfoMap: Record<string, { name: string } | null> = {};
  const dtcNameLookup = new Map(allDtcRows.map(r => [r.code.toLowerCase(), r.name]));
  for (const { code } of dtcSlice) {
    const name = dtcNameLookup.get(code.toLowerCase());
    dtcInfoMap[code.toLowerCase()] = name ? { name } : null;
  }

  // searchVehicles / searchDtcCodes removed with IssueSearch — they existed
  // only to feed it, and building them walked every vehicle and DTC row.

  return (
    <div className="min-h-screen" style={{ background: '#F7F6F2' }}>
      <BreadcrumbJsonLd items={[
        { name: 'Au7o', url: 'https://au7o.io' },
        { name: catalog.label, url: `https://au7o.io${catalog.basePath}` },
      ]} />
      <CollectionPageJsonLd
        name={catalogIsDesignPreview(catalog) ? 'Motorcycle Catalog Design Preview' : `${catalog.indexTitle} & Problems`}
        description={catalog.vehicleType === 'motorcycle' ? bikeDescription : `Browse ${totalIssues.toLocaleString()}+ documented ${catalog.noun} problems across ${directory.length} makes and ${totalVehicles} models.`}
        url={`https://au7o.io${catalog.basePath}`}
        numberOfItems={directory.length}
        itemListElement={directory.map(({ make, totalIssues: makeTotal }) => ({
          name: `${make} Issues`,
          url: `https://au7o.io${catalog.basePath}?make=${encodeURIComponent(make.toLowerCase())}`,
          description: catalogIsDesignPreview(catalog) ? `${makeTotal} synthetic design examples` : `${makeTotal} known issues for ${make} ${catalog.nounPlural}`,
        }))}
      />

      {/* Header — BMAD KITopNav: sticky, blurred paper, brand + CTA */}
      <header
        className="sticky top-0 z-30 px-6 py-3"
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
              width={28}
              height={28}
              className="rounded-lg"
            />
            <span className="text-xl font-bold tracking-tight" style={{ color: '#0B1220' }}>
              Au<span style={{ color: '#3B82F6' }}>7</span>o
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href={catalog.hubLinks ? '/' : `${catalog.basePath}#catalog-directory`}
              className="px-4 py-2 text-sm font-semibold text-white rounded-lg transition-opacity hover:opacity-90"
              style={{ background: '#0B1220' }}
            >
              {catalog.diagnoseCta}
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Hero */}
        <div className="py-10 sm:py-14">
          <nav className="text-sm mb-4" style={{ color: '#94A3B8' }} aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5">
              <li><Link href="/" className="hover:text-gray-600">Au7o</Link></li>
              <li style={{ color: '#CBD5E1' }}>/</li>
              <li className="font-medium" style={{ color: '#334155' }}>{catalog.label}</li>
            </ol>
          </nav>
          <div
            className="text-[11px] font-semibold uppercase mb-3"
            style={{ letterSpacing: '0.08em', color: '#3B82F6' }}
          >
            {catalog.label}{catalog.vehicleType === 'car' ? ' · NHTSA-Verified' : catalogIsDesignPreview(catalog) ? ' · Private design preview' : ''}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3" style={{ color: '#0B1220', letterSpacing: '-0.02em' }}>
            {catalog.indexTitle}
          </h1>
          <p className="max-w-xl" style={{ color: '#475569' }}>
            {catalog.vehicleType === 'motorcycle' ? bikeDescription : <>{totalIssues.toLocaleString()}+ documented problems across {directory.length} makes and {totalVehicles} models. Symptoms, costs, and solutions compiled from NHTSA recalls, manufacturer TSBs, and owner forums.</>}
          </p>
          {siblingCatalogs.length > 0 && (
            <p className="mt-3 text-sm" style={{ color: '#64748B' }}>
              Also on Au7o:{' '}
              {siblingCatalogs.map((c, i) => (
                <span key={c.vehicleType}>
                  {i > 0 && ' · '}
                  <Link href={c.basePath} className="text-[#3B82F6] hover:text-blue-700 font-medium">{c.indexTitle}</Link>
                </span>
              ))}
            </p>
          )}
        </div>

        <DirectorySections catalog={catalog} directory={directory} />

        {/* Common DTC Codes — collapsible. OBD-II is automotive, so other catalogs skip it. */}
        {catalog.dtcLinks && (
        <section className="mb-12">
          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer py-3 border-b border-[#E3DFD4] list-none">
              <h2 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Common Error Codes</h2>
              <svg className="w-5 h-5 text-gray-400 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-4">
              {dtcSlice.map(({ code }) => {
                const info = dtcInfoMap[code.toLowerCase()];
                return (
                  <Link
                    key={code}
                    href={`${catalog.basePath}/dtc/${code.toLowerCase()}`}
                    className="group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#EFEDE6]/70 transition-colors"
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
          </details>
        </section>
        )}

        {motorcycleCoverage && <DirectorySections
          catalog={MOTORCYCLE_CATALOG}
          directory={motorcycleCoverage.directory}
          categories={motorcycleCoverage.categories}
          motorcycleDiscovery
        />}

        {/* AI disclaimer */}
        <div className="flex items-start gap-2 py-3 mb-6">
          <svg className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-gray-400 leading-relaxed">
            {catalogIsDesignPreview(catalog) ? 'Synthetic layout examples only. They are not research findings or repair advice.' : totalIssues === 0 && catalog.vehicleType === 'motorcycle' ? 'Motorcycle coverage is not yet available.' : 'Issue data was compiled with AI assistance and may contain errors. Always consult a qualified mechanic for diagnosis and repair.'}
          </p>
        </div>

        {/* Cross-site sitemap — most known-issues traffic lands from
            Google and never sees the homepage, so surface the rest of
            the product here. */}
        <SiteFooter />

        {/* Footer */}
        <footer className="py-6 mt-8 border-t border-[#E3DFD4] text-center">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Au7o. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
