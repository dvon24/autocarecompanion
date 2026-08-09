/**
 * Turn a VERIFIED part into a buy link the public commerce gate will accept.
 *
 * This is the last step before a link reaches a page, and it is deliberately the
 * most suspicious one. The catalog's history is links that resolved perfectly to
 * the wrong part, so nothing here trusts a URL because it was constructed — a
 * link is emitted only if `isKnownIssueProductUrl` accepts it, which is the same
 * predicate `getKnownIssueCommerce` will re-apply at render time.
 *
 * WHY SO FEW VENDORS
 * ------------------
 * The gate accepts Amazon `/dp/`, eBay `/itm/`, and retailer paths with a
 * product/part/item/sku segment. It rejects **all** of rockauto.com, because a
 * part-number search is not an offer for one product — that is where 1,270 of
 * our existing links point, and roughly a third of them render "No Parts Found".
 * So a resolver that returns a real item URL (eBay Browse) is worth more here
 * than any number of constructed search URLs.
 *
 * WHAT THIS DOES NOT DO
 * ---------------------
 * It does not decide whether the part repairs the issue, and it does not check
 * fitment — both happen upstream (ShowMeTheParts for fitment, human judgment for
 * repair role). Given a part that has already passed those, it finds somewhere
 * to buy it, or it returns nothing. Returning nothing is a correct outcome and
 * must stay cheap: a missing buy button costs a click, a wrong one costs trust.
 */
import { isKnownIssueProductUrl, knownIssueAffiliateUrl } from '@/lib/known-issue-commerce';

export interface LinkCandidate {
  vendor: string;
  url: string;
  /** How this URL was obtained — carried through to the stored record. */
  via: string;
}

export interface BuiltLink {
  vendor: string;
  url: string;
  linkType: 'product';
  verified: true;
  via: string;
}

export interface BuildInput {
  partNumber: string;
  supplier?: string;
  component?: string;
  /** True when the issue is covered by an open recall with a free remedy. */
  recallFirst?: boolean;
}

/**
 * A resolver turns a part number into candidate product URLs. eBay Browse is
 * the live one; the interface exists so the OEM-catalog resolver can be added
 * without touching this module's rules.
 */
export type LinkResolver = (input: BuildInput) => Promise<LinkCandidate[]>;

/**
 * The gate is applied to every candidate, whatever produced it. A resolver
 * cannot opt out, and a hand-written link gets no special treatment.
 */
export function acceptCandidate(candidate: LinkCandidate): BuiltLink | null {
  const url = String(candidate.url || '').trim();
  if (!url || !isKnownIssueProductUrl(url)) return null;

  // The vendor label has to match where the link actually goes. A mislabelled
  // vendor is how "Buy at FCP Euro" ends up pointing somewhere else entirely,
  // and getKnownIssueCommerce drops it at render time anyway — better to never
  // store it.
  let host: string;
  try {
    host = new URL(url).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return null;
  }
  const vendor = candidate.vendor.trim();
  const vendorIdentity = vendor.toLowerCase().replace(/[^a-z0-9]/g, '');
  const hostIdentity = host.replace(/[^a-z0-9]/g, '');
  const marketplaceOk =
    (/amazon/.test(vendorIdentity) && /amazon/.test(hostIdentity)) ||
    (/ebay/.test(vendorIdentity) && /ebay/.test(hostIdentity));
  if (!marketplaceOk && (vendorIdentity.length < 3 || !hostIdentity.includes(vendorIdentity))) return null;

  return {
    vendor,
    url: knownIssueAffiliateUrl(url),
    linkType: 'product',
    verified: true,
    via: candidate.via,
  };
}

/**
 * Build the links for one part.
 *
 * Recall-first parts return NOTHING by design. If a manufacturer will fix it
 * free, taking a commission to sell the same part is the one outcome we should
 * never produce — the Ford audit found four of these already live.
 */
export async function buildPartLinks(
  input: BuildInput,
  resolvers: LinkResolver[],
  options: { maxLinks?: number } = {},
): Promise<BuiltLink[]> {
  if (input.recallFirst) return [];
  if (!String(input.partNumber || '').trim()) return [];

  const max = options.maxLinks ?? 2;
  const out: BuiltLink[] = [];
  const seenUrl = new Set<string>();
  const seenVendor = new Set<string>();

  for (const resolve of resolvers) {
    let candidates: LinkCandidate[] = [];
    try {
      candidates = await resolve(input);
    } catch {
      continue; // a resolver failing is not a reason to emit a worse link
    }
    for (const candidate of candidates) {
      const link = acceptCandidate(candidate);
      if (!link) continue;
      const vendorKey = link.vendor.toLowerCase();
      // One link per vendor: two eBay listings for the same part read as
      // padding, not as choice.
      if (seenUrl.has(link.url) || seenVendor.has(vendorKey)) continue;
      seenUrl.add(link.url);
      seenVendor.add(vendorKey);
      out.push(link);
      if (out.length >= max) return out;
    }
  }
  return out;
}
