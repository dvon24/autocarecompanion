/**
 * Fluid & spec reference data layer for the public /specs pages.
 *
 * Reads ONLY from src/data/fluid-specs.json — the AUDITED source. The raw
 * src/data/vehicle-specs.json (used by the guide/maintenance system) is NOT
 * read here, so unverified capacities can never reach a public page. A
 * generation only "publishes" (static param, sitemap, index, indexable page)
 * when verified === true. Wrong fluid capacities are a safety hazard, so the
 * gate is deliberately strict.
 *
 * Monetization: free + SEO-indexed; each fluid/part row carries a `buy` query
 * that becomes an Amazon affiliate (au7o-20) search link — high-intent
 * affiliate, same flywheel as the known-issues pages.
 */

import fluidSpecsData from '@/data/fluid-specs.json';

export interface FluidSpec {
  type: string;
  capacity?: string;
  note?: string;
  /** Free-text product query → Amazon affiliate search link. */
  buy?: string;
}

export interface PartSpec {
  value: string;
  buy?: string;
}

export interface SpecGeneration {
  label: string;
  yearStart: number;
  yearEnd: number;
  engine?: string;
  verified: boolean;
  source: 'curated' | 'web-verified';
  auditedAt?: string;
  citations?: string[];
  fluids: Record<string, FluidSpec>;
  parts?: Record<string, PartSpec>;
  safety?: string[];
}

export interface SpecVehicle {
  make: string;
  model: string;
  slug: string;
  generations: SpecGeneration[];
}

interface FluidSpecsFile {
  _note?: string;
  vehicles: SpecVehicle[];
}

const DATA = fluidSpecsData as FluidSpecsFile;

/** Mirror of known-issues.makeSlug — kept local so /specs doesn't import the
 *  Prisma-heavy known-issues module. Same NFD accent handling (Citroën →
 *  citroen-, not citro-n-). */
export function specSlug(make: string, model: string): string {
  return `${make} ${model}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** Amazon affiliate search link — au7o-20, hard-coded per project convention. */
export function amazonSearchLink(query: string): string {
  return `https://www.amazon.com/s?k=${encodeURIComponent(query)}&tag=au7o-20`;
}

/** A vehicle is "published" only if it has at least one verified generation. */
function publishedVehicles(): SpecVehicle[] {
  return DATA.vehicles
    .map((v) => ({ ...v, generations: v.generations.filter((g) => g.verified) }))
    .filter((v) => v.generations.length > 0);
}

/** All published spec slugs (for generateStaticParams + sitemap). */
export function getAllSpecSlugs(): { slug: string; make: string; model: string }[] {
  return publishedVehicles().map((v) => ({ slug: v.slug, make: v.make, model: v.model }));
}

/** Published spec vehicles with a last-modified date (for the sitemap). */
export function getAllSpecSlugsWithDates(): { slug: string; lastModified: Date }[] {
  return publishedVehicles().map((v) => {
    const newest = v.generations
      .map((g) => g.auditedAt)
      .filter(Boolean)
      .sort()
      .pop();
    return { slug: v.slug, lastModified: newest ? new Date(newest) : new Date('2026-06-16') };
  });
}

/** Lookup one published vehicle by slug. Returns null if absent or unverified. */
export function getSpecVehicle(slug: string): SpecVehicle | null {
  return publishedVehicles().find((v) => v.slug === slug) ?? null;
}

/** Directory for the /specs index — grouped by make. */
export function getSpecsDirectory(): { make: string; vehicles: { slug: string; model: string }[] }[] {
  const byMake = new Map<string, { slug: string; model: string }[]>();
  for (const v of publishedVehicles()) {
    const arr = byMake.get(v.make) ?? [];
    arr.push({ slug: v.slug, model: v.model });
    byMake.set(v.make, arr);
  }
  return [...byMake.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([make, vehicles]) => ({
      make,
      vehicles: vehicles.sort((a, b) => a.model.localeCompare(b.model)),
    }));
}

/** Human label for a fluid/part key, e.g. "engineOil" → "Engine oil". */
export function specLabel(key: string): string {
  const map: Record<string, string> = {
    engineOil: 'Engine oil',
    coolant: 'Coolant / antifreeze',
    transmission: 'Transmission fluid',
    brakeFluid: 'Brake fluid',
    rearDifferential: 'Rear differential',
    frontDifferential: 'Front differential',
    transferCase: 'Transfer case',
    powerSteering: 'Power steering fluid',
    oilFilter: 'Oil filter',
    sparkPlugs: 'Spark plugs',
    lugNuts: 'Lug nuts',
    battery: 'Battery',
    wiperBlades: 'Wiper blades',
  };
  return map[key] ?? key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()).trim();
}
