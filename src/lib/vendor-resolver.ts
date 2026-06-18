/**
 * Vendor resolver — turns one IdentifiedPart into N VendorLink rows
 * for the UI to render. The AI model produces category + oemPartNumbers
 * + searchQuery; this module owns vendor selection, URL construction,
 * and per-category priority ordering.
 *
 * The resolver is intentionally simple and deterministic — every
 * routing decision is a static rule, not a model call. Future
 * iterations may swap in click-telemetry-driven priorities; until
 * then this is the source of truth.
 */

import {
  VENDORS,
  CATEGORY_TO_VENDORS,
  oemSpecialistForMake,
  type VendorConfig,
} from '@/lib/vendor-catalog';
import type {
  IdentifiedPart,
  PartCategory,
  VendorKey,
  VendorLink,
} from '@/types/vision';

const MAX_VENDORS_PER_PART = 5;

interface ResolveInput {
  category: PartCategory;
  oemPartNumbers: string[];
  aftermarketPartNumbers?: Array<{ brand: string; partNumber: string }>;
  name: string;
  brand?: string;
  spec?: string;
  /** Pre-built search query from the AI (preferred). When absent we
   *  fall back to "${brand} ${oemPartNumbers[0]} ${name}". */
  searchQuery?: string;
  /** Vehicle context — currently only used to pick GM vs Mopar OEM
   *  specialist. */
  vehicle?: { year?: number; make?: string; model?: string; trim?: string };
}

export function resolveVendorLinks(input: ResolveInput): VendorLink[] {
  const candidates = pickCandidateVendors(input.category, input.vehicle?.make);
  const ordered = applyPriorityRules(candidates, input);
  const links: VendorLink[] = [];
  for (let i = 0; i < ordered.length && links.length < MAX_VENDORS_PER_PART; i++) {
    const vendorKey = ordered[i];
    const cfg = VENDORS[vendorKey];
    if (!cfg) continue;
    const url = buildVendorUrl(cfg, input);
    if (!url) continue;
    links.push({
      vendor: vendorKey,
      displayName: cfg.displayName,
      url,
      searchQuery: resolveQuery(input),
      linkType: isDeepLink(cfg, input) ? 'deep' : 'search',
      priority: i + 1,
      rationale: cfg.rationale,
    });
  }
  return links;
}

/**
 * Step 1 — gather the candidate vendor set for this category. Three
 * passes:
 *   (a) Category-matched vendors from the catalog.
 *   (b) OEM specialist (Mopar/GM Parts Giant) injected for OEM-specific
 *       categories based on user's make.
 *   (c) Drop any vendor with a `bestForMakes` filter that doesn't
 *       include the user's make — American Muscle / Summit Racing
 *       shouldn't surface on a Honda Civic.
 */
function pickCandidateVendors(category: PartCategory, make: string | undefined): VendorKey[] {
  const oemCats: PartCategory[] = ['oem_specific', 'body_panel', 'trim', 'badge', 'bracket', 'interior', 'emblem'];
  const base = CATEGORY_TO_VENDORS.get(category) || [];
  const set = new Set<VendorKey>(base);

  if (oemCats.includes(category)) {
    set.add(oemSpecialistForMake(make));
    set.add('ebay_motors');
  }

  // tire/wheel are big-ticket Tire Rack items where Amazon isn't the right
  // backstop; a TPMS SENSOR, though, is a small electronic part real parts
  // retailers (Amazon/RockAuto/AutoZone) stock — so it keeps the Amazon backstop.
  const skipAmazonCats: PartCategory[] = ['tire', 'wheel'];
  if (!skipAmazonCats.includes(category)) set.add('amazon');

  // Make-specialist filter — vendors with bestForMakes set only
  // surface when the user's make is in their list. Vendors without
  // bestForMakes pass through unchanged.
  const filtered: VendorKey[] = [];
  for (const k of set) {
    const cfg = VENDORS[k];
    if (!cfg) continue;
    if (cfg.bestForMakes && cfg.bestForMakes.length > 0) {
      if (!make) continue; // no vehicle context → drop make-specialists
      if (!cfg.bestForMakes.includes(make)) continue;
    }
    filtered.push(k);
  }
  return filtered;
}

/**
 * Step 2 — apply category-aware priority rules. Returns the candidate
 * list re-ordered with the best-fit-first vendor at index 0.
 */
function applyPriorityRules(candidates: VendorKey[], input: ResolveInput): VendorKey[] {
  const cat = input.category;
  const hasOemNumber = (input.oemPartNumbers?.length ?? 0) > 0;

  // Score each candidate higher = more important.
  const score = (v: VendorKey): number => {
    const cfg = VENDORS[v];
    if (!cfg) return -1;
    let s = 0;
    // Tires/wheels → Tire Rack always wins. (A standalone TPMS sensor is NOT a
    // tire — let RockAuto/Amazon win its primary slot so the user lands on a
    // real sensor PDP, not a generic Tire Rack page.)
    if ((cat === 'tire' || cat === 'wheel') && v === 'tire_rack') s += 100;
    // OEM-specific + we have a part number → OEM specialist wins.
    if (hasOemNumber && ['oem_specific', 'body_panel', 'trim', 'badge', 'bracket', 'interior', 'emblem'].includes(cat)) {
      if (v === oemSpecialistForMake(input.vehicle?.make)) s += 100;
      else if (v === 'ebay_motors') s += 60;
    }
    // RockAuto is best aftermarket default — when category overlaps,
    // bump it ahead of Amazon.
    if (cfg.bestForCategories.includes(cat) && v === 'rockauto') s += 50;
    // Make-specialist boost — American Muscle on a Challenger, Summit
    // on a Camaro. These outrank generic vendors but not the OEM
    // specialist when there's an OEM part number to look up.
    if (cfg.bestForMakes && cfg.bestForMakes.length > 0 && input.vehicle?.make
        && cfg.bestForMakes.includes(input.vehicle.make)) {
      s += 45;
    }
    // Amazon is the universal fallback, but only when nothing better
    // is available — give it a small base score, then category match.
    if (v === 'amazon') s += 10;
    if (cfg.bestForCategories.includes(cat)) s += 20;
    // Vendors with a partNumberUrlTemplate AND a part number → bonus.
    if (hasOemNumber && cfg.partNumberSupport === 'native' && cfg.partNumberUrlTemplate) s += 30;
    return s;
  };

  return [...candidates].sort((a, b) => score(b) - score(a));
}

/**
 * Step 3 — build the URL for one vendor. Prefers part-number-direct
 * URL when the vendor supports it natively AND we have an OEM number;
 * falls back to the search URL otherwise.
 *
 * Amazon URLs always carry the au7o-20 affiliate tag.
 */
function buildVendorUrl(cfg: VendorConfig, input: ResolveInput): string | null {
  // Tire Rack's TireSearchResults.jsp is a FORM-results endpoint — it expects
  // autoMake/autoYear/autoModel + width/ratio/diameter, NOT a free-text query.
  // Feeding it ?btn={query} 404s. Build a real fitment URL instead.
  if (cfg.key === 'tire_rack') return buildTireRackUrl(input);

  const part = input.oemPartNumbers?.[0];
  if (cfg.partNumberSupport === 'native' && cfg.partNumberUrlTemplate && part) {
    return cfg.partNumberUrlTemplate.replace('{part_number}', encodeURIComponent(part));
  }
  const query = resolveQuery(input);
  if (!query) return null;
  return cfg.searchUrlTemplate.replace('{query}', encodeURIComponent(query));
}

interface TireSize { width: string; ratio: string; diameter: string; }

/**
 * Parse tire sizes out of free text — "305/30R19", "305/30ZR19",
 * "P275/40R18", or a staggered "305/30R19 front / 325/30R19 rear".
 * Returns front (first match) + rear (first DISTINCT match, for
 * staggered fitments like the Camaro ZL1 1LE: 305 front / 325 rear).
 */
function parseTireSizes(text: string | undefined): { front?: TireSize; rear?: TireSize } {
  if (!text) return {};
  const re = /\b[PpLT]?(\d{3})\/(\d{2})\s*Z?R\s*(\d{2})\b/g;
  const found: TireSize[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    found.push({ width: m[1], ratio: m[2], diameter: m[3] });
  }
  if (found.length === 0) return {};
  const front = found[0];
  const rear = found.find(
    (s) => s.width !== front.width || s.ratio !== front.ratio || s.diameter !== front.diameter,
  );
  return { front, rear };
}

/**
 * Confident Tire Rack link. Tiers, best-first:
 *   1. YMMT + OE tire size → vehicle results page pinned to the exact fitment.
 *   2. Size only → fitment-correct by-size results.
 *   3. Neither → guaranteed-valid Google site-search (lands on a real Tire
 *      Rack page, NEVER a 404).
 * Note: the exact-tire PDP form (frontTire=<SKU>) needs Tire Rack's proprietary
 * catalog code, which only their affiliate datafeed/API provides — not buildable
 * from our data, so we stop at the fitment results page.
 */
function buildTireRackUrl(input: ResolveInput): string {
  const v = input.vehicle;
  const { front, rear } = parseTireSizes(
    [input.spec, input.name, input.searchQuery].filter(Boolean).join(' '),
  );
  const haveVehicle = !!(v?.make && v?.year && v?.model);

  if (haveVehicle || front) {
    const p = new URLSearchParams();
    if (haveVehicle) {
      p.set('autoMake', v!.make!);
      p.set('autoYear', String(v!.year));
      p.set('autoModel', v!.trim ? `${v!.model} ${v!.trim}` : v!.model!);
    }
    if (front) {
      p.set('frontWidth', `${front.width}/`);
      p.set('frontRatio', front.ratio);
      p.set('frontDiameter', front.diameter);
    }
    if (rear) {
      p.set('rearWidth', `${rear.width}/`);
      p.set('rearRatio', rear.ratio);
      p.set('rearDiameter', rear.diameter);
    }
    p.set('performance', 'ALL');
    return `https://www.tirerack.com/tires/TireSearchResults.jsp?${p.toString()}`;
  }

  const q = [input.brand, input.name || 'tires'].filter(Boolean).join(' ');
  return `https://www.google.com/search?q=${encodeURIComponent(`site:tirerack.com ${q}`)}`;
}

function resolveQuery(input: ResolveInput): string {
  if (input.searchQuery?.trim()) return input.searchQuery.trim();
  const brand = input.brand || '';
  const oem = input.oemPartNumbers?.[0] || '';
  const fallback = [brand, oem, input.name].filter(Boolean).join(' ').trim();
  return fallback;
}

/**
 * Search-tier ("always valid") URL for a vendor — used by the link
 * validator to replace a DEEP link that returned a hard 404. For Tire Rack
 * that's the guaranteed Google site-search; for every other vendor it's the
 * vendor's own onsite search template with the part query. Returns null only
 * when there's no query to search with.
 */
export function searchFallbackUrl(
  vendorKey: VendorKey,
  part: {
    category: PartCategory;
    name: string;
    brand?: string;
    oemPartNumbers: string[];
    spec?: string;
    searchQuery?: string;
  },
): string | null {
  const cfg = VENDORS[vendorKey];
  if (!cfg) return null;
  if (vendorKey === 'tire_rack') {
    const q = [part.brand, part.name || 'tires'].filter(Boolean).join(' ');
    return `https://www.google.com/search?q=${encodeURIComponent(`site:tirerack.com ${q}`)}`;
  }
  const query = resolveQuery({
    category: part.category,
    name: part.name,
    brand: part.brand,
    oemPartNumbers: part.oemPartNumbers,
    spec: part.spec,
    searchQuery: part.searchQuery,
  });
  if (!query) return null;
  return cfg.searchUrlTemplate.replace('{query}', encodeURIComponent(query));
}

function isDeepLink(cfg: VendorConfig, input: ResolveInput): boolean {
  if (cfg.key === 'tire_rack') {
    const { front } = parseTireSizes(
      [input.spec, input.name, input.searchQuery].filter(Boolean).join(' '),
    );
    // A fitment results page (vehicle- or size-pinned) is a confident deep
    // link; the bare Google-site-search fallback is not.
    return !!front || !!(input.vehicle?.make && input.vehicle?.year && input.vehicle?.model);
  }
  return cfg.partNumberSupport === 'native'
    && !!cfg.partNumberUrlTemplate
    && (input.oemPartNumbers?.length ?? 0) > 0;
}

/**
 * Convenience for the route: take a list of identified parts (without
 * vendorLinks) and populate vendorLinks on each.
 */
export function attachVendorLinks(
  parts: Array<Omit<IdentifiedPart, 'vendorLinks'> & { searchQuery?: string }>,
  vehicle: ResolveInput['vehicle'],
): IdentifiedPart[] {
  return parts.map(({ searchQuery, ...p }) => ({
    ...p,
    vendorLinks: resolveVendorLinks({
      category: p.category,
      oemPartNumbers: p.oemPartNumbers,
      aftermarketPartNumbers: p.aftermarketPartNumbers,
      name: p.name,
      brand: p.brand,
      spec: p.spec,
      // The model's purpose-built retailer query (size for tires, exact fluid
      // spec for coolant, OEM+context for brakes). resolveQuery prefers this
      // over the [brand, oem, name] fallback — critical for fluids/badges that
      // have no OEM number. Previously dropped on the floor.
      searchQuery,
      vehicle,
    }),
  }));
}
