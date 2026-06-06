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
 * Step 1 — gather the candidate vendor set for this category, with
 * an OEM specialist injected for OEM-specific categories based on
 * the user's vehicle make.
 */
function pickCandidateVendors(category: PartCategory, make: string | undefined): VendorKey[] {
  const oemCats: PartCategory[] = ['oem_specific', 'body_panel', 'trim', 'badge', 'bracket', 'interior', 'emblem'];
  const base = CATEGORY_TO_VENDORS.get(category) || [];
  const set = new Set<VendorKey>(base);

  // For OEM-specific categories, inject the make-specific specialist
  // (Mopar Parts Giant for Dodge/Jeep/Chrysler/RAM, GM Parts Giant
  // for Chevy/GMC/Cadillac/Buick) regardless of what bestForCategories
  // happens to list.
  if (oemCats.includes(category)) {
    set.add(oemSpecialistForMake(make));
    // eBay Motors as the discontinued-parts fallback for OEM-specific.
    set.add('ebay_motors');
  }

  // Always include Amazon as universal fallback for non-niche
  // categories that aren't tires/wheels/OEM.
  const skipAmazonCats: PartCategory[] = ['tire', 'wheel', 'tpms'];
  if (!skipAmazonCats.includes(category)) set.add('amazon');

  return Array.from(set);
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
    // Tires → Tire Rack always wins.
    if ((cat === 'tire' || cat === 'wheel' || cat === 'tpms') && v === 'tire_rack') s += 100;
    // OEM-specific + we have a part number → OEM specialist wins.
    if (hasOemNumber && ['oem_specific', 'body_panel', 'trim', 'badge', 'bracket', 'interior', 'emblem'].includes(cat)) {
      if (v === oemSpecialistForMake(input.vehicle?.make)) s += 100;
      else if (v === 'ebay_motors') s += 60;
    }
    // RockAuto is best aftermarket default — when category overlaps,
    // bump it ahead of Amazon.
    if (cfg.bestForCategories.includes(cat) && v === 'rockauto') s += 50;
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
  const part = input.oemPartNumbers?.[0];
  if (cfg.partNumberSupport === 'native' && cfg.partNumberUrlTemplate && part) {
    return cfg.partNumberUrlTemplate.replace('{part_number}', encodeURIComponent(part));
  }
  const query = resolveQuery(input);
  if (!query) return null;
  return cfg.searchUrlTemplate.replace('{query}', encodeURIComponent(query));
}

function resolveQuery(input: ResolveInput): string {
  if (input.searchQuery?.trim()) return input.searchQuery.trim();
  const brand = input.brand || '';
  const oem = input.oemPartNumbers?.[0] || '';
  const fallback = [brand, oem, input.name].filter(Boolean).join(' ').trim();
  return fallback;
}

function isDeepLink(cfg: VendorConfig, input: ResolveInput): boolean {
  return cfg.partNumberSupport === 'native'
    && !!cfg.partNumberUrlTemplate
    && (input.oemPartNumbers?.length ?? 0) > 0;
}

/**
 * Convenience for the route: take a list of identified parts (without
 * vendorLinks) and populate vendorLinks on each.
 */
export function attachVendorLinks(
  parts: Array<Omit<IdentifiedPart, 'vendorLinks'>>,
  vehicle: ResolveInput['vehicle'],
): IdentifiedPart[] {
  return parts.map((p) => ({
    ...p,
    vendorLinks: resolveVendorLinks({
      category: p.category,
      oemPartNumbers: p.oemPartNumbers,
      aftermarketPartNumbers: p.aftermarketPartNumbers,
      name: p.name,
      brand: p.brand,
      spec: p.spec,
      vehicle,
    }),
  }));
}
