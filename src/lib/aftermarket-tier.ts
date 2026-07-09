/**
 * Aftermarket-tier routing — turns the curated brand table (data) into the
 * "Performance upgrade" row's search links. Deliberately thin: all curation
 * lives in src/data/aftermarket-brands.ts, so adding a category or brand never
 * touches this file.
 *
 * HONESTY: every link this builds is a descriptive SEARCH ("2015 Dodge
 * Challenger SRT 392 Power Stop brake rotor"), not a verified part. The UI must
 * render these as "Shop <brand> options →", with no verified badge — the tier
 * split is the whole point. Phase B replaces specific <platform × category>
 * pairs with exact-SKU cards from the identity graph.
 */

import { VENDORS } from './vendor-catalog';
import { AFTERMARKET_BRANDS, type PlatformKey } from '@/data/aftermarket-brands';
import type { PartCategory, VendorKey } from '@/types/vision';

export interface UpgradeVehicle {
  year?: number | string;
  make?: string;
  model?: string;
  trim?: string;
}

export interface UpgradeOption {
  brand: string;
  note?: string;
  vendor: VendorKey;
  displayName: string;
  /** Descriptive-search URL (affiliate-tagged where the template carries it). */
  url: string;
}

/**
 * Coarse platform bucket used only to pick a better brand shortlist. Broad,
 * token-based, cheap — NOT a fitment decision. Returns null → the category
 * default list is used.
 */
export function platformFor(v?: UpgradeVehicle): PlatformKey | null {
  if (!v) return null;
  const make = (v.make || '').toLowerCase();
  const model = (v.model || '').toLowerCase();
  const trim = (v.trim || '').toLowerCase();
  const t = `${trim} ${model}`;

  if ((make === 'dodge' || make === 'chrysler') && /\bsrt\b|392|hellcat|redeye|scat\s?pack|super\s?bee|demon/.test(t)) {
    return 'mopar_srt';
  }
  if (make === 'chevrolet' && (/\bcorvette\b/.test(model) || (/\bcamaro\b/.test(model) && /\bss\b|zl1|1le/.test(trim)))) {
    return 'gm_fbody_perf';
  }
  if (make === 'ford' && /\bmustang\b/.test(model) && /\bgt\b|shelby|gt350|gt500|mach\s?1|performance|\bpp\b/.test(trim)) {
    return 'ford_mustang_perf';
  }
  if (
    (make === 'bmw' && /\bm\d?\b|\bm\b|competition/.test(trim)) ||
    ((make === 'mercedes' || make === 'mercedes-benz') && /amg/.test(t)) ||
    (make === 'audi' && /\brs\b|\bs\d\b/.test(trim)) ||
    make === 'porsche'
  ) {
    return 'euro_perf';
  }
  return null;
}

/** Which vendor a performance brand search should target. Summit Racing carries
 *  essentially all of these performance brands and has a DIRECT search template
 *  (searchTerm=), so upgrade links resolve to real results — not the Google
 *  site-search redirect that American Muscle/RockAuto use. Kept as a function so
 *  Phase B / affiliate wiring can re-route per platform later without touching
 *  the option builder. */
function vendorForBrand(_platform: PlatformKey | null): VendorKey {
  return 'summit_racing';
}

function buildSearchUrl(vendor: VendorKey, query: string): string | null {
  const cfg = VENDORS[vendor];
  if (!cfg) return null;
  return cfg.searchUrlTemplate.replace('{query}', encodeURIComponent(query));
}

/**
 * Build the upgrade-row options for a part. Empty array when the category has
 * no brand table (the row simply doesn't render) — that's the data gate.
 */
export function buildUpgradeOptions(
  category: PartCategory | undefined,
  partName: string | undefined,
  vehicle?: UpgradeVehicle,
  max = 3,
): UpgradeOption[] {
  if (!category) return [];
  const table = AFTERMARKET_BRANDS[category];
  if (!table) return [];

  const platform = platformFor(vehicle);
  const brands = (platform && table.byPlatform?.[platform]) || table.default;
  if (!brands?.length) return [];

  const veh = [vehicle?.year, vehicle?.make, vehicle?.model, vehicle?.trim].filter(Boolean).join(' ');
  // Strip parenthetical qualifiers ("(vented)", "(360mm)") — they over-narrow a
  // retailer search that already has year/make/model/brand to work with.
  const noun = ((partName && partName.replace(/\([^)]*\)/g, '').trim()) || category.replace(/_/g, ' ')).replace(/\s+/g, ' ');

  const out: UpgradeOption[] = [];
  const seen = new Set<string>();
  for (const b of brands) {
    if (out.length >= max) break;
    const key = b.brand.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    // Primary vendor per platform; fall back to Summit if American Muscle isn't
    // configured (e.g. euro_perf). Both are descriptive searches.
    const vendor = vendorForBrand(platform);
    const query = [veh, b.brand, noun].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
    const url = buildSearchUrl(vendor, query) || buildSearchUrl('summit_racing', query) || buildSearchUrl('amazon', query);
    if (!url) continue;
    out.push({
      brand: b.brand,
      note: b.note,
      vendor: VENDORS[vendor] ? vendor : 'summit_racing',
      displayName: VENDORS[vendor]?.displayName || 'Summit Racing',
      url,
    });
  }
  return out;
}
