/**
 * Static vendor catalog — single source of truth for which vendors
 * we can route photo-identified parts to. Used by vendor-resolver.ts
 * to populate IdentifiedPart.vendorLinks server-side.
 *
 * Mapping research lives in memory/project_vendor_catalog_research.md
 * (workflow w4zsf17w2). Add new vendors here, NOT in the resolver.
 */

import type { PartCategory, VendorKey } from '@/types/vision';

export interface VendorConfig {
  key: VendorKey;
  displayName: string;
  /** Generic search URL with {query} placeholder. */
  searchUrlTemplate: string;
  /** When the vendor lets us link directly to a PDP by part number,
   *  this template has {part_number}. We prefer this over the search
   *  URL when the AI gave us a high-confidence OEM number. */
  partNumberUrlTemplate?: string;
  /** 'native' = partNumberUrlTemplate resolves to a real product page.
   *  'searchable' = the part number works in the search box but lands
   *  on a SERP, not a PDP.
   *  'none' = vendor doesn't support part-number lookups. */
  partNumberSupport: 'native' | 'searchable' | 'none';
  /** Categories this vendor is best-positioned to serve. The resolver
   *  intersects with each part's category to decide which vendors to
   *  surface. Order within the array doesn't matter; per-category
   *  priority is set in the resolver. */
  bestForCategories: PartCategory[];
  /** Optional make-specific specialization. When set, this vendor
   *  ONLY surfaces for users whose vehicle make is in this list — and
   *  gets a priority boost over generic vendors when it matches.
   *  Example: American Muscle covers Mustang/Camaro/Challenger/Charger
   *  performance parts; it shouldn't appear for a Honda Civic. */
  bestForMakes?: string[];
  /** True when the vendor URL accepts an affiliate tag append. The
   *  resolver wraps the URL accordingly if VENDOR_AFFILIATE_TAGS env
   *  has a tag for this vendor. Amazon is always tagged (au7o-20). */
  affiliateProgram: 'amazon-associates' | 'cj' | 'flex-offers' | 'epn' | 'impact' | 'none';
  /** Human-readable notes — what this vendor is good for, when to
   *  prefer it. Surfaced to the UI as the VendorLink.rationale. */
  rationale: string;
}

export const VENDORS: Record<VendorKey, VendorConfig> = {
  amazon: {
    key: 'amazon',
    displayName: 'Amazon',
    searchUrlTemplate: 'https://www.amazon.com/s?k={query}&tag=au7o-20',
    partNumberSupport: 'searchable',
    bestForCategories: [
      'brake_pad', 'rotor', 'filter', 'fluid', 'wiper', 'bulb',
      'battery', 'lug_nut', 'accessory', 'tool', 'spark_plug',
    ],
    affiliateProgram: 'amazon-associates',
    rationale: 'Universal default — Prime shipping, broad catalog',
  },
  rockauto: {
    key: 'rockauto',
    displayName: 'RockAuto',
    // RockAuto's partsearch endpoint is strict about format — it works
    // for exact OEM/aftermarket numbers but returns "no match" for
    // free-text queries. When we have a part number, use partsearch.
    // When we don't, route through Google with site:rockauto.com so
    // the user lands on a real product page instead of an empty SERP.
    searchUrlTemplate: 'https://www.google.com/search?q=site%3Arockauto.com+{query}',
    partNumberUrlTemplate: 'https://www.rockauto.com/en/partsearch/?partnum={part_number}',
    partNumberSupport: 'native',
    bestForCategories: [
      'brake_pad', 'rotor', 'caliper', 'filter', 'fluid', 'suspension',
      'ignition', 'belt', 'hose', 'sensor', 'tpms', 'alternator', 'starter',
      'fuel_pump', 'spark_plug',
    ],
    affiliateProgram: 'none',
    rationale: 'Cheapest aftermarket, biggest catalog',
  },
  tire_rack: {
    key: 'tire_rack',
    displayName: 'Tire Rack',
    // Generic SERP. The vendor-resolver has a tire-size-aware builder
    // that uses width/ratio/diameter when it can parse part.spec.
    searchUrlTemplate: 'https://www.tirerack.com/tires/TireSearchResults.jsp?ad=text&btn={query}',
    partNumberSupport: 'searchable',
    bestForCategories: ['tire', 'wheel', 'tpms'],
    affiliateProgram: 'cj',
    rationale: 'Best-in-class for tires + wheels',
  },
  autozone: {
    key: 'autozone',
    displayName: 'AutoZone',
    searchUrlTemplate: 'https://www.autozone.com/searchresult?searchText={query}',
    partNumberSupport: 'searchable',
    bestForCategories: [
      'brake_pad', 'rotor', 'battery', 'filter', 'fluid', 'wiper',
      'bulb', 'spark_plug', 'sensor', 'tpms', 'alternator', 'starter', 'belt',
    ],
    affiliateProgram: 'none',
    rationale: 'Same-day in-store pickup nationwide',
  },
  napa_online: {
    key: 'napa_online',
    displayName: 'NAPA',
    searchUrlTemplate: 'https://www.napaonline.com/en/search?text={query}',
    partNumberSupport: 'searchable',
    bestForCategories: [
      'filter', 'fluid', 'battery', 'belt', 'hose', 'brake_pad',
      'rotor', 'ignition', 'sensor', 'alternator', 'starter',
    ],
    affiliateProgram: 'impact',
    rationale: 'Professional-grade with brick-and-mortar warranty support',
  },
  mopar_parts_giant: {
    key: 'mopar_parts_giant',
    displayName: 'Mopar Parts Giant',
    searchUrlTemplate: 'https://www.moparpartsgiant.com/search.html?search_string={query}',
    partNumberUrlTemplate: 'https://www.moparpartsgiant.com/parts/{part_number}.html',
    partNumberSupport: 'native',
    bestForCategories: [
      'oem_specific', 'body_panel', 'trim', 'badge', 'bracket',
      'interior', 'emblem',
    ],
    affiliateProgram: 'none',
    rationale: 'OEM Mopar specialist — below-MSRP dealer parts',
  },
  gm_parts_giant: {
    key: 'gm_parts_giant',
    displayName: 'GM Parts Giant',
    searchUrlTemplate: 'https://www.gmpartsgiant.com/search.html?search_string={query}',
    partNumberUrlTemplate: 'https://www.gmpartsgiant.com/parts/{part_number}.html',
    partNumberSupport: 'native',
    bestForCategories: [
      'oem_specific', 'body_panel', 'trim', 'badge', 'bracket',
      'interior', 'emblem',
    ],
    affiliateProgram: 'none',
    rationale: 'OEM GM specialist — Chevy/GMC/Cadillac/Buick parts',
  },
  oreilly: {
    key: 'oreilly',
    displayName: "O'Reilly",
    searchUrlTemplate: 'https://www.oreillyauto.com/search?q={query}',
    partNumberSupport: 'searchable',
    bestForCategories: [
      'brake_pad', 'rotor', 'battery', 'filter', 'fluid', 'wiper',
      'bulb', 'spark_plug', 'alternator', 'starter', 'belt',
    ],
    affiliateProgram: 'none',
    rationale: 'Same-day pickup + free tool loaner program',
  },
  advance_auto: {
    key: 'advance_auto',
    displayName: 'Advance Auto',
    searchUrlTemplate: 'https://shop.advanceautoparts.com/r/search?q={query}',
    partNumberSupport: 'searchable',
    bestForCategories: [
      'brake_pad', 'rotor', 'battery', 'filter', 'fluid', 'wiper',
      'bulb', 'belt', 'ignition', 'sensor',
    ],
    affiliateProgram: 'flex-offers',
    rationale: 'Includes Carquest OE-equivalent line, frequent 20% off coupons',
  },
  ebay_motors: {
    key: 'ebay_motors',
    displayName: 'eBay Motors',
    searchUrlTemplate: 'https://www.ebay.com/sch/i.html?_nkw={query}&_sacat=6028',
    partNumberSupport: 'searchable',
    bestForCategories: ['oem_specific', 'wheel'],
    affiliateProgram: 'epn',
    rationale: 'Fallback for discontinued / used OEM (factory take-offs, NLA parts)',
  },
  american_muscle: {
    key: 'american_muscle',
    displayName: 'American Muscle',
    // AmericanMuscle's onsite search regularly misses on OEM part
    // numbers (their catalog is keyed by part NAME and YMM, not OEM).
    // Use Google site-search so a Mopar OEM number for a Challenger
    // rotor actually lands on a relevant AmericanMuscle PDP instead
    // of "0 results".
    searchUrlTemplate: 'https://www.google.com/search?q=site%3Aamericanmuscle.com+{query}',
    partNumberSupport: 'searchable',
    bestForCategories: [
      'wheel', 'tire', 'suspension', 'body_panel', 'trim', 'badge',
      'emblem', 'bracket', 'interior', 'accessory', 'brake_pad', 'rotor',
      'caliper', 'oem_specific',
    ],
    // Make-specific specialist — covers modern American muscle:
    // Mustang (S550/S650), Camaro (5th/6th gen), Challenger/Charger
    // (LX/LD chassis), and select trucks via AmericanTrucks brand.
    bestForMakes: ['Ford', 'Chevrolet', 'Dodge'],
    affiliateProgram: 'cj',
    rationale: 'Modern American muscle specialist — Mustang/Camaro/Challenger performance parts',
  },
  summit_racing: {
    key: 'summit_racing',
    displayName: 'Summit Racing',
    searchUrlTemplate: 'https://www.summitracing.com/search?searchTerm={query}',
    partNumberSupport: 'searchable',
    bestForCategories: [
      'suspension', 'wheel', 'brake_pad', 'rotor', 'caliper', 'tire',
      'ignition', 'spark_plug', 'belt', 'hose', 'filter', 'fluid',
      'accessory', 'tool', 'oem_specific', 'body_panel',
    ],
    // Summit Racing covers everything from GM/Ford/Mopar performance
    // to vintage muscle (Pontiac, Plymouth, Oldsmobile). Set as
    // specialist for the major American makes — won't surface for a
    // Honda Civic, will surface for any V8 American iron.
    bestForMakes: ['Ford', 'Chevrolet', 'Dodge', 'Pontiac', 'Plymouth', 'Oldsmobile', 'Cadillac', 'Buick', 'GMC', 'Chrysler', 'RAM', 'Lincoln', 'Mercury'],
    affiliateProgram: 'cj',
    rationale: 'Performance + racing parts catalog — huge V8 selection',
  },
};

/**
 * Reverse index built at module load: for each PartCategory, which
 * vendor keys serve it (in catalog order). Used by the resolver as
 * the starting set before per-category priority rules run.
 */
export const CATEGORY_TO_VENDORS: Map<PartCategory, VendorKey[]> = (() => {
  const map = new Map<PartCategory, VendorKey[]>();
  for (const [key, cfg] of Object.entries(VENDORS)) {
    for (const cat of cfg.bestForCategories) {
      const arr = map.get(cat) || [];
      arr.push(key as VendorKey);
      map.set(cat, arr);
    }
  }
  return map;
})();

/**
 * For 'oem_specific' / body / trim / interior / emblem categories,
 * pick the OEM specialist for the user's make. Falls back to
 * mopar_parts_giant default (covers FCA/Stellantis fleet) when the
 * make doesn't have a dedicated vendor in the catalog yet.
 */
export function oemSpecialistForMake(make: string | undefined): VendorKey {
  const m = (make || '').toLowerCase();
  if (['chevrolet', 'chevy', 'gmc', 'cadillac', 'buick'].includes(m)) return 'gm_parts_giant';
  if (['dodge', 'jeep', 'chrysler', 'ram', 'plymouth'].includes(m)) return 'mopar_parts_giant';
  // Future: ford_parts_giant, honda_parts_now, etc. For now, generic.
  return 'mopar_parts_giant';
}
