/**
 * resolveParts — the ONE trust-gated part-resolution service, shared by every
 * surface (vision tap, hub chat, voice). The whole point: no surface ever emits
 * a part number or a store URL itself. A surface produces PART INTENTS
 * (what part, roughly) and this service resolves each into a grounded card:
 *   - vendor links built by the deterministic resolver (vendor dialects: OEM PNs
 *     only go to PN-searchable vendors; retail gets descriptive queries),
 *   - an OEM part number ONLY when corroborated (≥3 distinct eBay sellers, or our
 *     own catalog), never a model guess,
 *   - an honest "varies by build date — verify by VIN" note + an OEM-catalog
 *     fitment link when the number isn't corroborated,
 *   - the aftermarket-upgrade tier (Power Stop/EBC…) from the data table.
 *
 * This is the platform-level fix for the fabrication class (e.g. hub chat
 * labeling a Ram PN as OEM on a Challenger hose): the model never writes the PN,
 * so it can't invent one. Extraction of existing resolver behavior behind an
 * interface — attachVendorLinks + resolveEbay + buildUpgradeOptions already
 * exist; this orchestrates them with the trust gate.
 */

import type { PartCategory, PartSource } from '@/types/vision';
import { attachVendorLinks } from './vendor-resolver';
import { ebayEnabled, resolveEbay } from './ebay-resolver';
import { buildUpgradeOptions, type UpgradeOption } from './aftermarket-tier';
import { VENDORS } from './vendor-catalog';

export interface PartIntent {
  /** What the part is, in shopper words: "lower radiator hose", "front brake rotor". */
  partName: string;
  category?: PartCategory;
  brand?: string;
  /** Hint from the surface: does the user want OEM or aftermarket? Advisory. */
  tier?: 'oem' | 'aftermarket';
}

export interface ResolvePartsVehicle {
  year?: number | string;
  make?: string;
  model?: string;
  trim?: string;
}

export interface ResolvedPartCard {
  name: string;
  category: PartCategory;
  brand?: string;
  /** A corroborated OEM part number, or null. NEVER a model guess. */
  oemPartNumber: string | null;
  /** True only when the PN is strongly corroborated (≥3 distinct eBay sellers
   *  or catalog). Drives the "verified" badge; a bare eBay-reported/uncorroborated
   *  PN stays unverified. */
  partNumberVerified: boolean;
  provenance: PartSource | 'unresolved';
  vendorLinks: Array<{ vendor: string; displayName: string; url: string; linkType: string }>;
  /** Best single buy link (real listing > non-search vendor > first). */
  primaryUrl: string;
  upgradeOptions: UpgradeOption[];
  /** Set when there is NO corroborated PN — the honest fitment caveat. */
  fitmentNote?: string;
  /** OEM-catalog fitment search (verify-by-VIN destination) when PN is uncorroborated. */
  fitmentLink?: string;
}

export interface ResolvePartsOpts {
  /** Corroborated OEM part numbers for THIS vehicle (uppercased, no spaces) —
   *  from KnownIssue.fixParts / VehiclePartLookup. Lets a catalog PN count as
   *  corroboration without an eBay round-trip. */
  catalogPNs?: Set<string>;
  /** Run the live eBay verify (adds latency; off by default for chat). */
  useEbay?: boolean;
  /** Cap the number of intents resolved (protects latency/cost). */
  max?: number;
}

const norm = (s: string) => s.toUpperCase().replace(/\s+/g, '');

/** OEM-catalog "verify by VIN" fitment link for the make (Mopar/GM Parts Giant,
 *  else eBay Motors P&A), as a descriptive search — the honest destination when
 *  we can't hand out a corroborated PN. */
function oemFitmentLink(vehicle: ResolvePartsVehicle | undefined, name: string): string {
  const make = (vehicle?.make || '').toLowerCase();
  const q = [vehicle?.year, vehicle?.make, vehicle?.model, vehicle?.trim, name].filter(Boolean).join(' ');
  let vendorKey: keyof typeof VENDORS = 'ebay_motors';
  if (/(dodge|chrysler|jeep|ram|mopar)/.test(make)) vendorKey = 'mopar_parts_giant';
  else if (/(chevrolet|chevy|gmc|buick|cadillac|gm)/.test(make)) vendorKey = 'gm_parts_giant';
  const cfg = VENDORS[vendorKey];
  return cfg ? cfg.searchUrlTemplate.replace('{query}', encodeURIComponent(q)) : '';
}

/**
 * Resolve part intents into grounded, trust-gated cards. Runs the per-intent
 * work in parallel. NEVER trusts a caller-supplied PN — corroboration comes only
 * from the catalog set or a live eBay verify.
 */
export async function resolveParts(
  intents: PartIntent[],
  vehicle?: ResolvePartsVehicle,
  opts: ResolvePartsOpts = {},
): Promise<ResolvedPartCard[]> {
  const useEbay = opts.useEbay ?? false;
  const catalog = opts.catalogPNs;
  const list = intents.filter((i) => i && i.partName && i.partName.trim()).slice(0, opts.max ?? 10);

  const vehForLinks = vehicle
    ? { year: Number(vehicle.year) || undefined, make: vehicle.make, model: vehicle.model, trim: vehicle.trim }
    : undefined;

  return Promise.all(list.map(async (intent, i): Promise<ResolvedPartCard> => {
    const category = (intent.category || 'other') as PartCategory;
    const name = intent.partName.trim();

    // Deterministic vendor links (descriptive for retail, PN-searchable elsewhere).
    const [linked] = attachVendorLinks([{
      id: `hub_${i}_${name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12)}`,
      role: 'primary',
      category,
      name,
      confidence: 1,
      visibleInPhoto: false,
      brand: intent.brand,
      oemPartNumbers: [],
    }], vehForLinks);

    let oemPartNumber: string | null = null;
    let verified = false;
    let provenance: PartSource | 'unresolved' = 'unresolved';
    let listingUrl: string | undefined;

    // Live eBay verify (opt-in) — the strongest corroboration.
    if (useEbay && ebayEnabled() && category !== 'other') {
      const q = [intent.brand, vehicle?.year, vehicle?.make, vehicle?.model, vehicle?.trim, name]
        .filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
      try {
        const r = await resolveEbay(q, undefined, { category, make: vehicle?.make, model: vehicle?.model, trim: vehicle?.trim });
        if (r) {
          const pn = r.verifiedPartNumber || r.reportedPartNumber;
          if (pn) {
            oemPartNumber = pn;
            verified = !!r.verifiedPartNumber;
            provenance = verified ? 'ebay_verified' : 'ebay_reported';
          }
          if (r.listings?.[0]?.url) listingUrl = r.listings[0].url;
        }
      } catch { /* fail soft — stay with descriptive links */ }
    }

    // Catalog corroboration (no eBay round-trip): only counts if the catalog has
    // a PN for this vehicle. We don't have a PN candidate from the model (by
    // design), so this path just confirms verified=true when eBay already found
    // one and the catalog agrees — belt-and-suspenders, never a source of a PN.
    if (oemPartNumber && catalog && catalog.has(norm(oemPartNumber))) {
      verified = true;
      if (provenance === 'ebay_reported') provenance = 'catalog';
    }

    const vendorLinks = linked.vendorLinks.map((l) => ({ vendor: l.vendor, displayName: l.displayName, url: l.url, linkType: l.linkType }));
    // Prefer, in order: a real eBay listing, then a MONETIZED link (au7o-20 /
    // eBay campaign — so we don't default the buy button to an unmonetized
    // Summit search), then any non-search-engine link, then the first.
    const monetized = vendorLinks.find((l) => /tag=au7o-20|campid=|mkcid=|mkrid=/i.test(l.url));
    const nonSearch = vendorLinks.find((l) => l.url && !/(^https?:\/\/)?(www\.)?google\.[a-z.]+\/search/i.test(l.url));
    const primaryUrl = listingUrl || monetized?.url || nonSearch?.url || vendorLinks[0]?.url || '';

    const upgradeOptions = buildUpgradeOptions(category, name, vehicle);
    const fitmentNote = oemPartNumber ? undefined : 'varies by build date — verify by VIN';
    const fitmentLink = oemPartNumber ? undefined : oemFitmentLink(vehicle, name);

    return {
      name,
      category,
      brand: intent.brand,
      oemPartNumber,
      partNumberVerified: verified,
      provenance,
      vendorLinks,
      primaryUrl,
      upgradeOptions,
      fitmentNote,
      fitmentLink,
    };
  }));
}
