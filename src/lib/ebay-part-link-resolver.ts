import { resolveEbay } from '@/lib/ebay-resolver';
import type { BuildInput, LinkCandidate, LinkResolver } from '@/lib/part-link-builder';

const normalizePn = (value: unknown) => String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

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
    if (!matched) return [];
    return [{ vendor: 'eBay', url: listing.url, via: 'eBay Browse exact listing PN', matchedPartNumber: matched }];
  });
};
