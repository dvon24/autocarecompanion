import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { makeSlug } from '@/lib/known-issues';
import { categoryConfig } from '@/lib/issue-categories';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { ShareButtons } from '@/components/shared/ShareButtons';
import { IssueCategory } from '@/schemas/knownIssue.schema';
import prisma from '@/lib/db';

// --- ISR + dynamic params ---

export const revalidate = 3600; // Re-generate cached pages every 1 hour
export const dynamicParams = true; // Allow on-demand rendering of new categories

// --- Category display helpers ---

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
    engine: 'Engine-related problems including misfires, oil leaks, timing issues, turbo failures, and check engine light causes across all makes and models.',
    transmission: 'Transmission problems including harsh shifting, slipping, torque converter issues, and CVT failures documented across hundreds of vehicles.',
    drivetrain: 'Drivetrain issues including differential failures, transfer case problems, driveshaft vibrations, and AWD/4WD system faults.',
    electrical: 'Electrical system problems including battery drain, alternator failures, wiring harness issues, and module malfunctions.',
    brakes: 'Brake system issues including premature wear, rotor warping, ABS module failures, and brake fluid leaks.',
    suspension: 'Suspension problems including strut failures, control arm bushing wear, ball joint issues, and air suspension faults.',
    cooling: 'Cooling system issues including radiator leaks, water pump failures, thermostat problems, and head gasket failures.',
    fuel: 'Fuel system problems including fuel pump failures, injector issues, fuel line leaks, and EVAP system faults.',
    interior: 'Interior issues including infotainment glitches, seat motor failures, dashboard cracks, and climate control problems.',
    exterior: 'Exterior problems including paint defects, clear coat peeling, trim deterioration, and lighting issues.',
    body: 'Body and panel issues including rust, corrosion, panel gap problems, and structural concerns.',
    safety: 'Safety-related issues and recalls including airbag problems, seatbelt defects, and crash avoidance system faults.',
    other: 'Other documented vehicle issues that don\'t fall into a specific system category.',
  };
  return descriptions[cat] || `Known ${categoryLabel(cat).toLowerCase()} issues documented across all makes and models.`;
}

// --- Static generation ---

export async function generateStaticParams() {
  const rows = await prisma.knownIssue.findMany({
    where: { status: 'published' },
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
  if (!VALID_CATEGORIES.includes(category as IssueCategory)) {
    return { title: 'Not Found' };
  }

  const label = categoryLabel(category);
  const count = await prisma.knownIssue.count({
    where: { status: 'published', category },
  });

  const title = `${label} Problems & Known Issues | Au7o`;
  const description = `${count} documented ${label.toLowerCase()} problems across all makes and models. Symptoms, repair costs, and solutions from real owner reports.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://au7o.io/known-issues/category/${category}`,
      siteName: 'Au7o',
    },
    alternates: {
      canonical: `https://au7o.io/known-issues/category/${category}`,
    },
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
    where: { status: 'published', category },
    select: { make: true, model: true, severity: true },
  });

  // Aggregate by make+model
  const vehicleMap: Record<string, { make: string; model: string; count: number; highCount: number }> = {};
  for (const row of rows) {
    const key = `${row.make}|${row.model}`;
    if (!vehicleMap[key]) {
      vehicleMap[key] = { make: row.make, model: row.model, count: 0, highCount: 0 };
    }
    vehicleMap[key].count++;
    if (row.severity === 'high') vehicleMap[key].highCount++;
  }

  // Build vehicle list
  const vehicles: VehicleGroup[] = Object.values(vehicleMap).map(v => ({
    make: v.make,
    model: v.model,
    slug: makeSlug(v.make, v.model),
    issueCount: v.count,
    highCount: v.highCount,
  }));

  // Group by make, sort vehicles by issue count descending
  const grouped: Record<string, VehicleGroup[]> = {};
  for (const v of vehicles) {
    if (!grouped[v.make]) grouped[v.make] = [];
    grouped[v.make].push(v);
  }

  // Sort makes alphabetically, vehicles by issue count desc
  const sortedMakes = Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([make, vehs]) => ({
      make,
      vehicles: vehs.sort((a, b) => a.model.localeCompare(b.model)),
      totalIssues: vehs.reduce((sum, v) => sum + v.issueCount, 0),
    }));

  return {
    totalIssues: rows.length,
    totalVehicles: vehicles.length,
    makes: sortedMakes,
  };
}

// --- Page component ---

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  if (!VALID_CATEGORIES.includes(category as IssueCategory)) {
    notFound();
  }

  const data = await getCategoryData(category);
  const label = categoryLabel(category);
  const icon = categoryIcon(category);
  const description = categoryDescription(category);

  return (
    <div className="min-h-screen bg-white">
      <BreadcrumbJsonLd items={[
        { name: 'Au7o', url: 'https://au7o.io' },
        { name: 'Known Issues', url: 'https://au7o.io/known-issues' },
        { name: `${label} Issues`, url: `https://au7o.io/known-issues/category/${category}` },
      ]} />

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

      <article className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5">
            <li><Link href="/" className="hover:text-gray-700">Au7o</Link></li>
            <li>/</li>
            <li><Link href="/known-issues" className="hover:text-gray-700">Known Issues</Link></li>
            <li>/</li>
            <li className="text-gray-900 font-medium">{label} Issues</li>
          </ol>
        </nav>

        {/* Title */}
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            {icon} {label} Problems & Known Issues
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl">
            {description}
          </p>
          <div className="mt-4">
            <ShareButtons url={`https://au7o.io/known-issues/category/${category}`} title={`${label} Problems & Known Issues | Au7o`} />
          </div>
        </header>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{data.totalIssues.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Issues Documented</div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{data.totalVehicles}</div>
            <div className="text-sm text-gray-500">Vehicles Affected</div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{data.makes.length}</div>
            <div className="text-sm text-gray-500">Makes</div>
          </div>
        </div>

        {/* Make quick-jump nav */}
        <nav className="mb-10" aria-label="Jump to make">
          <div className="flex flex-wrap gap-2">
            {data.makes.map(({ make, totalIssues }) => (
              <a
                key={make}
                href={`#${make.toLowerCase().replace(/\s+/g, '-')}`}
                className="px-3 py-1.5 text-sm font-medium bg-gray-100 text-gray-700 rounded-full hover:bg-blue-100 hover:text-blue-700 transition-colors"
              >
                {make} ({totalIssues})
              </a>
            ))}
          </div>
        </nav>

        {/* Vehicles grouped by make */}
        <div className="space-y-8">
          {data.makes.map(({ make, vehicles, totalIssues }) => (
            <section
              key={make}
              id={make.toLowerCase().replace(/\s+/g, '-')}
              className="scroll-mt-8"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold text-gray-900">
                  {make}
                </h2>
                <span className="text-sm text-gray-500">
                  {totalIssues} {label.toLowerCase()} {totalIssues === 1 ? 'issue' : 'issues'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {vehicles.map(v => (
                  <Link
                    key={v.slug}
                    href={`/known-issues/${v.slug}`}
                    className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                  >
                    <span className="text-sm font-medium text-gray-900 group-hover:text-blue-700">
                      {v.make} {v.model}
                    </span>
                    <span className="flex items-center gap-2">
                      {v.highCount > 0 && (
                        <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-medium">
                          {v.highCount} critical
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {v.issueCount} {v.issueCount === 1 ? 'issue' : 'issues'}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Browse other categories */}
        <section className="mt-12 mb-10">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Browse Other Categories</h3>
          <div className="flex flex-wrap gap-2">
            {VALID_CATEGORIES.filter(c => c !== category).map(c => (
              <Link
                key={c}
                href={`/known-issues/category/${c}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
              >
                <span>{categoryIcon(c)}</span>
                <span>{categoryLabel(c)}</span>
              </Link>
            ))}
          </div>
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
          <p className="text-xs text-gray-500 mt-2">
            &copy; {new Date().getFullYear()} Au7o. All rights reserved.
          </p>
        </footer>
      </article>
    </div>
  );
}
