import Link from 'next/link';
import { MakeLogo } from '@/components/shared/MakeLogo';
import { catalogIsDesignPreview, makeToSlug, type IssueCatalog } from '@/lib/known-issues-catalog';
import { categoryConfig } from '@/lib/issue-categories';
import type { IssueCategory } from '@/schemas/knownIssue.schema';

interface DirectoryMake {
  make: string;
  vehicles: readonly unknown[];
  totalIssues: number;
}

function Chevron() {
  return <svg className="w-5 h-5 text-gray-400 transition-transform group-open:rotate-180 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>;
}

/** Shared make/category cards; the automotive landing can embed motorcycle
 * coverage without embedding another index page or its metadata/header. */
export function DirectorySections({ catalog, directory, motorcycleDiscovery = false, categories = Object.keys(categoryConfig) as IssueCategory[] }: {
  catalog: IssueCatalog;
  directory: readonly DirectoryMake[];
  motorcycleDiscovery?: boolean;
  categories?: IssueCategory[];
}) {
  const popularMakes = directory.filter(d => catalog.popularMakes.includes(d.make));
  const syntheticDiscovery = motorcycleDiscovery && catalogIsDesignPreview(catalog);
  const showSections = motorcycleDiscovery || catalog.vehicleType === 'car' || directory.length > 0;
  const emptyCopy = 'No motorcycle issues are published yet. Published coverage will appear here when available.';
  return <>
    {showSections && <section id={motorcycleDiscovery ? 'motorcycle-popular-makes' : undefined} className="mb-12">
      <h2 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#64748B' }}>{motorcycleDiscovery ? 'Popular Makes - Motorcycles' : 'Popular Makes'}</h2>
      {motorcycleDiscovery && <p className="text-sm mb-4" style={{ color: '#475569' }}>
        {syntheticDiscovery
          ? 'Synthetic motorcycle design examples only — not verified issues, recalls or repair advice.'
          : directory.length === 0 ? emptyCopy : 'Explore published motorcycle issues by make and category.'}{' '}
        <Link href={catalog.basePath} className="font-medium text-blue-600 hover:text-blue-800">Browse motorcycle catalog</Link>
      </p>}
      {motorcycleDiscovery && directory.length > 0 && popularMakes.length === 0 && <p className="text-sm text-[#475569]">{syntheticDiscovery ? 'No synthetic examples for these popular makes.' : 'No published coverage for these popular makes yet.'} Browse All Makes below.</p>}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {popularMakes.map(({ make, vehicles, totalIssues }) => <Link key={make} href={`${catalog.basePath}/make/${makeToSlug(make)}`}
          className="group flex items-start gap-3 p-4 bg-white rounded-xl hover:shadow-sm hover:border-blue-300 transition-all" style={{ border: '1px solid #E3DFD4' }}>
          <MakeLogo make={make} size={36} />
          <div className="min-w-0">
            <h3 className={`font-semibold group-hover:text-blue-600 transition-colors${motorcycleDiscovery ? ' break-words' : ''}`} style={{ color: '#0B1220' }}>{make}</h3>
            <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>{vehicles.length} models &middot; {totalIssues} {syntheticDiscovery ? 'synthetic examples' : 'issues'}</p>
          </div>
        </Link>)}
      </div>
    </section>}

    <section id={motorcycleDiscovery ? 'motorcycle-catalog-directory' : 'catalog-directory'} className="mb-12">
      {!motorcycleDiscovery && directory.length === 0 && catalog.vehicleType === 'motorcycle' ? <p className="text-[#475569]">There are no published models to browse yet.</p> : <details className="group">
        <summary className="flex items-center justify-between cursor-pointer py-3 border-b border-[#E3DFD4] list-none">
          <h2 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">{motorcycleDiscovery ? 'All Makes - Motorcycle' : `All Makes (${directory.length})`}</h2>
          <Chevron />
        </summary>
        {motorcycleDiscovery && directory.length === 0 && <p className="pt-4 text-sm text-[#475569]">{syntheticDiscovery ? 'There are no synthetic motorcycle makes to browse yet.' : 'There are no published motorcycle makes to browse yet.'}</p>}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 pt-4">
          {directory.map(({ make, vehicles }) => <Link key={make} href={`${catalog.basePath}/make/${makeToSlug(make)}`} className="group flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-[#EFEDE6]/70 transition-colors">
            <MakeLogo make={make} size={24} />
            <div className="min-w-0 flex-1">
              <span className={`text-sm font-medium text-gray-700 group-hover:text-gray-900 block ${motorcycleDiscovery ? 'break-words' : 'truncate'}`}>{make}</span>
              <span className="text-xs text-gray-400">{vehicles.length} models</span>
            </div>
            <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>)}
        </div>
      </details>}
    </section>

    {showSections && <section id={motorcycleDiscovery ? 'motorcycle-catalog-categories' : undefined} className="mb-12">
      <details className="group">
        <summary className="flex items-center justify-between cursor-pointer py-3 border-b border-[#E3DFD4] list-none">
          <h2 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">{motorcycleDiscovery ? 'Browse by Category - Motorcycle' : 'Browse by Category'}</h2>
          <Chevron />
        </summary>
        {motorcycleDiscovery && categories.length === 0 && <p className="pt-4 text-sm text-[#475569]">{syntheticDiscovery ? 'There are no synthetic motorcycle categories to browse yet.' : 'There are no published motorcycle categories to browse yet.'}</p>}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pt-4">
          {categories.map(cat => <Link key={cat} href={`${catalog.basePath}/category/${cat}`} className="group flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-[#EFEDE6]/70 transition-colors">
            <span className="text-lg">{categoryConfig[cat].icon}</span>
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{categoryConfig[cat].label}</span>
          </Link>)}
        </div>
      </details>
    </section>}
  </>;
}
