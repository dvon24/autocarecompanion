import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { makeSlug, getCategoryDates } from '@/lib/known-issues';
import { categoryConfig } from '@/lib/issue-categories';
import { BreadcrumbJsonLd, TechnicalArticleJsonLd } from '@/components/seo/JsonLd';
import { IssueCategory } from '@/schemas/knownIssue.schema';
import { SiteFooter } from '@/components/shared/SiteFooter';
import { MakeLogo } from '@/components/shared/MakeLogo';
import prisma from '@/lib/db';

// --- ISR + dynamic params ---

export const revalidate = 86400; // 24h — only ~17 category pages, change rarely; cuts steady-state DB re-render load (article [slug] pages stay at 1h)
export const dynamicParams = true;

// --- Category helpers ---

const VALID_CATEGORIES = Object.keys(categoryConfig) as IssueCategory[];

function categoryLabel(cat: string): string {
  const config = categoryConfig[cat as IssueCategory];
  return config ? config.label : cat.charAt(0).toUpperCase() + cat.slice(1);
}

function categoryIcon(cat: string): string {
  const config = categoryConfig[cat as IssueCategory];
  return config ? config.icon : '';
}

function categoryDescription(cat: string): string {
  const descriptions: Record<string, string> = {
    engine: 'Engine-related problems including misfires, oil leaks, timing issues, turbo failures, and check engine light causes.',
    transmission: 'Transmission problems including harsh shifting, slipping, torque converter issues, and CVT failures.',
    drivetrain: 'Drivetrain issues including differential failures, transfer case problems, and driveshaft vibrations.',
    electrical: 'Electrical system problems including battery drain, alternator failures, and wiring issues.',
    brakes: 'Brake system issues including premature wear, rotor warping, and ABS module failures.',
    suspension: 'Suspension problems including strut failures, control arm wear, and air suspension faults.',
    cooling: 'Cooling system issues including radiator leaks, water pump failures, and head gasket problems.',
    fuel: 'Fuel system problems including fuel pump failures, injector issues, and EVAP system faults.',
    interior: 'Interior issues including infotainment glitches, seat motor failures, and climate control problems.',
    exterior: 'Exterior problems including paint defects, clear coat peeling, and lighting issues.',
    body: 'Body issues including rust, corrosion, panel gap problems, and structural concerns.',
    safety: 'Safety-related issues and recalls including airbag and seatbelt defects.',
    other: 'Other documented vehicle issues.',
  };
  return descriptions[cat] || `Known ${categoryLabel(cat).toLowerCase()} issues across all makes and models.`;
}

// --- Static generation ---

export async function generateStaticParams() {
  // vehicleType: 'car' — category pages are part of the automotive catalog. See KnownIssue.vehicleType.
  const rows = await prisma.knownIssue.findMany({
    where: { status: 'published', vehicleType: 'car' },
    select: { category: true },
    distinct: ['category'],
  });
  return rows
    .map(r => r.category)
    .filter(c => VALID_CATEGORIES.includes(c as IssueCategory))
    .map(c => ({ category: c }));
}

// --- Dynamic metadata ---

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  if (!VALID_CATEGORIES.includes(category as IssueCategory)) return { title: 'Not Found' };

  const label = categoryLabel(category);
  const count = await prisma.knownIssue.count({ where: { status: 'published', category, vehicleType: 'car' } });

  const title = `${label} Problems & Known Issues | Au7o`;
  const description = `${count} documented ${label.toLowerCase()} problems across all makes and models. Symptoms, repair costs, and solutions.`;

  return {
    // absolute so the layout's "%s | Au7o" template doesn't double the suffix.
    title: { absolute: title },
    description,
    openGraph: { title, description, url: `https://au7o.io/known-issues/category/${category}`, siteName: 'Au7o' },
    alternates: { canonical: `https://au7o.io/known-issues/category/${category}` },
  };
}

// --- Data fetching ---

interface VehicleGroup {
  make: string;
  model: string;
  slug: string;
  issueCount: number;
  highCount: number;
}

async function getCategoryData(category: string) {
  const rows = await prisma.knownIssue.findMany({
    where: { status: 'published', category, vehicleType: 'car' },
    select: { make: true, model: true, severity: true },
  });

  const vehicleMap: Record<string, { make: string; model: string; count: number; highCount: number }> = {};
  for (const row of rows) {
    const key = `${row.make}|${row.model}`;
    if (!vehicleMap[key]) vehicleMap[key] = { make: row.make, model: row.model, count: 0, highCount: 0 };
    vehicleMap[key].count++;
    if (row.severity === 'high') vehicleMap[key].highCount++;
  }

  const vehicles: VehicleGroup[] = Object.values(vehicleMap).map(v => ({
    make: v.make,
    model: v.model,
    slug: makeSlug(v.make, v.model),
    issueCount: v.count,
    highCount: v.highCount,
  }));

  const grouped: Record<string, VehicleGroup[]> = {};
  for (const v of vehicles) {
    if (!grouped[v.make]) grouped[v.make] = [];
    grouped[v.make].push(v);
  }

  const sortedMakes = Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([make, vehs]) => ({
      make,
      vehicles: vehs.sort((a, b) => a.model.localeCompare(b.model)),
      totalIssues: vehs.reduce((sum, v) => sum + v.issueCount, 0),
    }));

  return { totalIssues: rows.length, totalVehicles: vehicles.length, makes: sortedMakes };
}

// --- Page component ---

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  if (!VALID_CATEGORIES.includes(category as IssueCategory)) notFound();

  const [data, dates] = await Promise.all([
    getCategoryData(category),
    getCategoryDates(category),
  ]);
  const label = categoryLabel(category);
  const icon = categoryIcon(category);
  const description = categoryDescription(category);
  const articleUrl = `https://au7o.io/known-issues/category/${category}`;
  const articleTitle = `${label} Problems & Known Issues — ${data.totalIssues} documented across ${data.totalVehicles} vehicles`;

  return (
    <div className="min-h-screen" style={{ background: '#F7F6F2' }}>
      {/* TechArticle gives Google a structured signal for the page. dateModified
          comes from getCategoryDates() so a layout revision (e.g. today's
          render fixes) bumps the freshness signal even when issue rows
          haven't moved. */}
      <TechnicalArticleJsonLd
        title={articleTitle}
        description={description}
        url={articleUrl}
        datePublished={dates.published}
        dateModified={dates.modified}
      />
      <BreadcrumbJsonLd items={[
        { name: 'Au7o', url: 'https://au7o.io' },
        { name: 'Known Issues', url: 'https://au7o.io/known-issues' },
        { name: `${label} Issues`, url: articleUrl },
      ]} />

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
            <span className="text-2xl font-bold text-[#0B1220] tracking-tight">
              Au<span className="text-blue-600">7</span>o
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/known-issues" className="px-4 py-2 text-sm font-medium text-[#475569] hover:text-[#0B1220] transition-colors">Known Issues</Link>
            <Link href="/" className="px-4 py-2 text-sm font-medium bg-[#0B1220] text-white rounded-lg hover:opacity-90 transition-opacity">Diagnose my car</Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Breadcrumb */}
        <nav className="text-sm text-[#94A3B8] mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5">
            <li><Link href="/" className="hover:text-[#475569]">Au7o</Link></li>
            <li className="text-[#CBD5E1]">/</li>
            <li><Link href="/known-issues" className="hover:text-[#475569]">Known Issues</Link></li>
            <li className="text-[#CBD5E1]">/</li>
            <li className="text-[#334155] font-medium">{label}</li>
          </ol>
        </nav>

        {/* Title */}
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#0B1220] mb-2">
            {icon} {label} Issues
          </h1>
          <p className="text-[#475569] max-w-xl">{description}</p>
          <p className="text-[#64748B] text-sm mt-2">
            {data.totalIssues.toLocaleString()} issues &middot; {data.totalVehicles} vehicles &middot; {data.makes.length} makes
          </p>
        </header>

        {/* Photo/video diagnose CTA — same banner as the article pages. */}
        <div className="mb-6">
        </div>

        {/* Two-column layout */}
        <div className="lg:flex lg:gap-0">
          {/* Sidebar */}
          <aside className="hidden lg:block lg:w-56 xl:w-64 flex-shrink-0 border-r border-[#E3DFD4] pr-8 mr-8">
            <nav className="sticky top-8 space-y-6" aria-label="Page navigation">
              <div>
                <h2 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3">Makes</h2>
                <ul className="space-y-0.5">
                  {data.makes.map(({ make, totalIssues }) => (
                    <li key={make}>
                      <a
                        href={`#${make.toLowerCase().replace(/\s+/g, '-')}`}
                        className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#0B1220] py-1.5 rounded-md hover:bg-[#EFEDE6]/70 px-2 -mx-2 transition-colors"
                      >
                        <MakeLogo make={make} size={18} />
                        <span className="truncate">{make}</span>
                        <span className="text-[#CBD5E1] text-xs ml-auto">{totalIssues}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Other categories */}
              <div>
                <h2 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3">Other Categories</h2>
                <ul className="space-y-0.5">
                  {VALID_CATEGORIES.filter(c => c !== category).slice(0, 8).map(c => (
                    <li key={c}>
                      <Link
                        href={`/known-issues/category/${c}`}
                        className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#0B1220] py-1.5 rounded-md hover:bg-[#EFEDE6]/70 px-2 -mx-2 transition-colors"
                      >
                        <span>{categoryIcon(c)}</span>
                        <span className="truncate">{categoryLabel(c)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

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
            {data.makes.map(({ make, vehicles, totalIssues }) => (
              <section
                key={make}
                id={make.toLowerCase().replace(/\s+/g, '-')}
                className="scroll-mt-16 mb-8"
              >
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer py-3 border-b border-[#E3DFD4] list-none">
                    <div className="flex items-center gap-2.5">
                      <MakeLogo make={make} size={24} />
                      <h2 className="text-lg font-semibold text-[#0B1220]">{make}</h2>
                      <span className="text-sm text-[#94A3B8]">{totalIssues} issues</span>
                    </div>
                    <svg className="w-5 h-5 text-[#94A3B8] transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-4">
                    {vehicles.map(v => (
                      <Link
                        key={v.slug}
                        href={`/known-issues/${v.slug}`}
                        className="group flex items-center justify-between p-3 rounded-lg hover:bg-[#EFEDE6]/70 transition-colors"
                      >
                        <span className="text-sm font-medium text-[#334155] group-hover:text-[#0B1220]">
                          {v.model}
                        </span>
                        <span className="flex items-center gap-2">
                          {v.highCount > 0 && (
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" title={`${v.highCount} critical`} />
                          )}
                          <span className="text-xs text-[#94A3B8]">{v.issueCount}</span>
                          <svg className="w-4 h-4 text-[#CBD5E1] group-hover:text-[#64748B] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </Link>
                    ))}
                  </div>
                </details>
              </section>
            ))}

            {/* AI disclaimer */}
            <div className="flex items-start gap-2 py-3 mt-8">
              <svg className="w-4 h-4 text-[#CBD5E1] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Issue data compiled with AI assistance and may contain errors. Always consult a qualified mechanic.
              </p>
            </div>

            {/* Cross-site sitemap for deep-link visitors. */}
            <SiteFooter />

            <footer className="pt-6 mt-8 border-t border-[#E3DFD4] text-center">
              <p className="text-xs text-[#94A3B8]">&copy; {new Date().getFullYear()} Au7o. All rights reserved.</p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
