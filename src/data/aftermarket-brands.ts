/**
 * Aftermarket recommended-brand table — DATA, not code.
 *
 * Powers the "Performance upgrade" row of the vision buy-callout (the tier
 * split next to the OEM-replacement row). The whole point of this file is that
 * expanding a category to a new set of brands is a DATA edit here, never a
 * change to the routing rule in aftermarket-tier.ts.
 *
 * Trust: entries here are CURATED SHORTLISTS, not verified fitment. The upgrade
 * row renders them as "Shop <brand> options →" search links — it has NOT
 * confirmed a part number or that a given SKU fits. Keep the honesty styling in
 * the UI (no verified badge on this row). Phase B graduates specific
 * <platform × category> pairs into exact-SKU cards with prices; those live in
 * the identity graph, not here.
 *
 * Later: this table is itself seedable from the same community/forum signal
 * that ranked Power Stop for the LX/LC platform in the first place — the shape
 * already allows a `note` and per-platform overrides so a seeder can populate
 * `byPlatform` without touching consumers.
 *
 * v1 populates BRAKES only (default + a couple perf-platform overrides). The
 * schema supports every category + per-platform overrides from day one so the
 * next category (suspension → Bilstein/Eibach, exhaust → Borla/Corsa/Flowmaster,
 * intake → K&N/aFe) is a pure data add.
 */

import type { PartCategory } from '@/types/vision';

export interface BrandRec {
  /** Brand as a shopper types it (drives the descriptive search query). */
  brand: string;
  /** Optional one-liner shown under the brand (e.g. "street/track"). */
  note?: string;
}

export interface CategoryBrandTable {
  /** Category-wide default shortlist (used when no platform override matches). */
  default: BrandRec[];
  /** Platform-keyed overrides — keys come from platformFor() in
   *  aftermarket-tier.ts. A matched platform REPLACES the default list. */
  byPlatform?: Partial<Record<PlatformKey, BrandRec[]>>;
}

/**
 * Coarse platform buckets used ONLY to pick a better brand shortlist. Not a
 * fitment system — that's Phase B. Keep these broad + cheap to detect from
 * make/model/trim tokens. '*' is never a key here (the default list covers it).
 */
export type PlatformKey =
  | 'mopar_srt'        // Challenger/Charger/300 SRT/392/Hellcat (6-piston Brembo)
  | 'gm_fbody_perf'    // Camaro SS 1LE / ZL1, Corvette
  | 'ford_mustang_perf'// Mustang GT PP / Shelby GT350/GT500
  | 'euro_perf';       // M/AMG/RS/S — perf Euro brake packages

/**
 * category → recommended aftermarket brands. Only categories present here get a
 * "Performance upgrade" row (the presence of an entry is the gate). v1: brakes.
 */
export const AFTERMARKET_BRANDS: Partial<Record<PartCategory, CategoryBrandTable>> = {
  rotor: {
    default: [
      { brand: 'Power Stop', note: 'street/tow, drilled & slotted' },
      { brand: 'EBC', note: 'sport rotors + pads' },
      { brand: 'Brembo', note: 'OE-style + upgrade kits' },
    ],
    byPlatform: {
      mopar_srt: [
        { brand: 'Power Stop', note: 'Z26 Extreme kits for the 392/Hellcat' },
        { brand: 'Brembo', note: '6-piston OE + upgrade discs' },
        { brand: 'StopTech', note: 'slotted big-brake' },
      ],
      gm_fbody_perf: [
        { brand: 'Brembo', note: '6-piston OE (SS/ZL1)' },
        { brand: 'Power Stop', note: 'track kits' },
        { brand: 'PFC', note: 'track pads/discs' },
      ],
      ford_mustang_perf: [
        { brand: 'Brembo', note: 'GT/PP 6-piston' },
        { brand: 'Power Stop', note: 'Z-series kits' },
        { brand: 'StopTech', note: 'BBK' },
      ],
      euro_perf: [
        { brand: 'Zimmermann', note: 'OE sport discs' },
        { brand: 'Brembo', note: 'upgrade kits' },
        { brand: 'EBC', note: 'sport rotors' },
      ],
    },
  },
  brake_pad: {
    default: [
      { brand: 'Power Stop', note: 'Z23/Z26 low-dust' },
      { brand: 'EBC', note: 'Yellowstuff/Redstuff' },
      { brand: 'Hawk', note: 'HPS / track compounds' },
    ],
    byPlatform: {
      mopar_srt: [
        { brand: 'Hawk', note: 'HPS 5.0 / track' },
        { brand: 'EBC', note: 'Yellowstuff' },
        { brand: 'Power Stop', note: 'Z26' },
      ],
      gm_fbody_perf: [
        { brand: 'Hawk', note: 'HP+/track' },
        { brand: 'PFC', note: 'track' },
        { brand: 'EBC', note: 'Yellowstuff' },
      ],
      ford_mustang_perf: [
        { brand: 'Hawk', note: 'HPS 5.0' },
        { brand: 'EBC', note: 'Yellowstuff' },
        { brand: 'Power Stop', note: 'Z26' },
      ],
    },
  },
  caliper: {
    default: [
      { brand: 'Power Stop', note: 'remanufactured + big-brake kits' },
      { brand: 'Brembo', note: 'upgrade calipers' },
    ],
  },
};
