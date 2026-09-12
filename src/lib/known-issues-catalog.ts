import type { VehicleType } from '@/lib/known-issues';

/**
 * One entry per known-issues catalog. The four catalog routes (index, article,
 * make, category) are built from ONE shared template each, parameterised by
 * this object — so a new vehicle class (ATVs, boats) is an entry here plus a
 * set of thin route wrappers, never a copy of the 1,100-line article template.
 *
 * Catalogs are separate on purpose. Make names collide across classes
 * (Honda, BMW, Suzuki, Triumph and Yamaha all build more than one), so a
 * shared make page would list a Gold Wing next to an Accord with one count.
 * Every catalog therefore has its own URL root and its own vehicleType filter
 * on every read. See KnownIssue.vehicleType.
 */
export interface IssueCatalog {
  vehicleType: VehicleType;
  /** URL root, no trailing slash: '/known-issues'. */
  basePath: string;
  /** Breadcrumb / nav label for the catalog root. */
  label: string;
  /** H1 on the catalog index. */
  indexTitle: string;
  /** <title> for the catalog index (absolute — no " | Au7o" appended by the layout). */
  indexMetaTitle: string;
  /** "vehicle" / "motorcycle" — used in running copy. */
  noun: string;
  nounPlural: string;
  /** Header CTA on the landing pages. */
  diagnoseCta: string;
  /** Prefix for the KnownIssueAlertSignup / AlertSignupPopup context strings. */
  contextPrefix: string;
  /** Context prefix for make-level alert signups ('make' for cars is the
   *  historical value the digest matches on; other catalogs must not collide). */
  makeContextPrefix: string;
  /** Inserted before "Known Issues" in make/category titles: '' or 'Motorcycle '. */
  titleQualifier: string;
  /** "public automotive data" / "public motorcycle data" in the AI disclaimer. */
  sourcesAdjective: string;
  /** Makes featured at the top of the index. */
  popularMakes: string[];
  /** Hub / garage deep links (the Hub is car-shaped). */
  hubLinks: boolean;
  /** hreflang alternates + localized article variants exist for this catalog. */
  localized: boolean;
  /** The BMW full-record audit registry (audited-empty fallbacks, SEO-audited slugs). */
  auditRegistry: boolean;
  /** DTC chips link to /known-issues/dtc/[code]. OBD-II is automotive; motorcycle
   *  codes are maker-specific FI codes with no page behind them. */
  dtcLinks: boolean;
}

export const CAR_CATALOG: IssueCatalog = {
  vehicleType: 'car',
  basePath: '/known-issues',
  label: 'Known Issues',
  indexTitle: 'Known Vehicle Issues',
  indexMetaTitle: 'Known Vehicle Issues & Problems | Au7o',
  noun: 'vehicle',
  nounPlural: 'vehicles',
  diagnoseCta: 'Diagnose my car',
  contextPrefix: 'known-issues',
  makeContextPrefix: 'make',
  titleQualifier: '',
  sourcesAdjective: 'automotive',
  popularMakes: [
    'Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW', 'Dodge',
    'Jeep', 'Nissan', 'Hyundai', 'Kia', 'Mercedes-Benz', 'Subaru',
  ],
  hubLinks: true,
  localized: true,
  auditRegistry: true,
  dtcLinks: true,
};

export const MOTORCYCLE_CATALOG: IssueCatalog = {
  vehicleType: 'motorcycle',
  basePath: '/motorcycle-issues',
  label: 'Motorcycle Issues',
  indexTitle: 'Known Motorcycle Issues',
  indexMetaTitle: 'Known Motorcycle Issues & Problems | Au7o',
  noun: 'motorcycle',
  nounPlural: 'motorcycles',
  diagnoseCta: 'Browse motorcycles',
  contextPrefix: 'motorcycle-issues',
  makeContextPrefix: 'motorcycle-make',
  titleQualifier: 'Motorcycle ',
  sourcesAdjective: 'motorcycle',
  popularMakes: [
    'Harley-Davidson', 'Honda', 'Yamaha', 'Kawasaki', 'Suzuki',
    'BMW', 'Ducati', 'KTM', 'Triumph',
  ],
  hubLinks: false,
  localized: false,
  auditRegistry: false,
  dtcLinks: false,
};

/** Every catalog, in display order. The sitemap, footer and cross-catalog
 *  links iterate this rather than naming a class. */
export const ISSUE_CATALOGS: readonly IssueCatalog[] = [CAR_CATALOG, MOTORCYCLE_CATALOG];

export function catalogFor(vehicleType: VehicleType): IssueCatalog {
  const found = ISSUE_CATALOGS.find((c) => c.vehicleType === vehicleType);
  if (!found) throw new Error(`No issue catalog for vehicleType "${vehicleType}"`);
  return found;
}

/** URL slug for a make within a catalog. Same function every make link uses,
 *  so the sitemap, breadcrumbs and cards can never disagree. */
export function makeToSlug(make: string): string {
  return make.toLowerCase().replace(/\s+/g, '-');
}

/** Isolated preview rows are design examples, never evidence of coverage. */
export function catalogIsDesignPreview(catalog: IssueCatalog): boolean {
  return catalog.vehicleType === 'motorcycle' && process.env.NODE_ENV === 'development'
    && process.env.AU7O_ISOLATED_SIGNUP_PREVIEW === 'true';
}

export function motorcycleCoverageDescription(count: number, preview: boolean): string {
  if (count === 0) return 'No motorcycle issues are published yet. Published coverage will appear here when available.';
  if (preview) return `${count} synthetic design examples for the private motorcycle preview. These are not verified defects, recalls or repair advice.`;
  return `${count} published motorcycle issues. Browse the listed models and check each issue’s sources and applicability.`;
}
