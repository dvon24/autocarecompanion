import { resolveEbay } from '@/lib/ebay-resolver';
import type { BuildInput, LinkCandidate, LinkResolver } from '@/lib/part-link-builder';
import { createHash } from 'node:crypto';

const normalizePn = (value: unknown) => String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const titleHash = (value: string) => createHash('sha256').update(value, 'utf8').digest('hex');

/** Browse API IDs are often `v1|123456789012|0`; public item URLs use the numeric ID. */
export function canonicalEbayItemId(value: unknown): string {
  const raw = String(value || '').trim();
  const browseMatch = raw.match(/^v1\|(\d{9,15})\|\d+$/i);
  if (browseMatch) return browseMatch[1]!;
  return /^\d{9,15}$/.test(raw) ? raw : '';
}

export function ebayQuery(input: BuildInput): string {
  // Retail listings rarely contain internal engine codes (C27A/J35A3), so
  // carrying the entire catalog label can turn an exact PN into zero results.
  // Fitment was already proven upstream; search keeps only displacement.
  const engine = String(input.engine || '').match(/\b\d(?:\.\d)?\s*L\b/i)?.[0]?.replace(/\s+/g, '');
  return [input.year, input.make, input.model, input.trim, engine, input.supplier, input.partNumber, input.component]
    .filter(Boolean).join(' ');
}

/**
 * Converts eBay Browse evidence into the canonical direct-product resolver.
 * A listing is eligible only when its own title/item-specifics contains the
 * requested PN; seller consensus elsewhere in the result cannot bless it.
 */
export const ebayPartLinkResolver: LinkResolver = async (input): Promise<LinkCandidate[]> => {
  const expected = normalizePn(input.partNumber);
  const result = await resolveEbay(ebayQuery(input), input.partNumber, {
    make: input.make,
    model: input.model,
    trim: input.trim,
  });
  if (!result) return [];
  return result.listings.flatMap((listing) => {
    const matched = listing.matchedPartNumbers.find((partNumber) => normalizePn(partNumber) === expected);
    const productId = canonicalEbayItemId(listing.itemId);
    if (!matched || !productId) return [];
    return [{
      vendor: 'eBay',
      url: listing.url,
      via: 'eBay Browse exact listing PN',
      matchedPartNumber: matched,
      productId,
      listingTitleHash: titleHash(listing.title),
    }];
  });
};
