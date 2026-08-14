/**
 * eBay Partner Network (EPN) affiliate tagging for any eBay link we render
 * outside the Browse-resolver path (e.g. the search links stored on known-issue
 * fixParts). The Browse resolver already returns pre-tagged itemAffiliateWebUrl;
 * this covers the stored/search links so those clicks also earn commission.
 *
 * Ships DARK: if NEXT_PUBLIC_EBAY_CAMPAIGN_ID isn't set, returns the URL
 * unchanged (no-op). The campaign ID is a PUBLIC identifier (it appears in every
 * affiliate URL), so exposing it via NEXT_PUBLIC is expected and safe.
 */
const CAMPAIGN_ID = process.env.NEXT_PUBLIC_EBAY_CAMPAIGN_ID;
// US rotation id. EPN attributes clicks with mkevt/mkcid/mkrid/campid params.
const MKRID = process.env.NEXT_PUBLIC_EBAY_MKRID || '711-53200-19255-0';
const EBAY_DOMAINS = new Set([
  'ebay.com', 'ebay.ca', 'ebay.co.uk', 'ebay.com.au', 'ebay.de', 'ebay.fr',
  'ebay.it', 'ebay.es', 'ebay.at', 'ebay.be', 'ebay.ch', 'ebay.ie', 'ebay.nl', 'ebay.pl',
]);

function isEbayHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^www\./, '');
  return [...EBAY_DOMAINS].some((domain) => host === domain || host.endsWith(`.${domain}`));
}

export function ebayAffiliate(url: string, customId?: string): string {
  if (!CAMPAIGN_ID || !url) return url;
  try {
    const u = new URL(url);
    if (u.protocol !== 'https:' || !isEbayHost(u.hostname)) return url;
    // Don't double-tag (resolver links are already tagged).
    if (u.searchParams.has('campid')) return url;
    u.searchParams.set('mkevt', '1');
    u.searchParams.set('mkcid', '1');
    u.searchParams.set('mkrid', MKRID);
    u.searchParams.set('campid', CAMPAIGN_ID);
    u.searchParams.set('toolid', '10001');
    if (customId) u.searchParams.set('customid', customId.slice(0, 256));
    return u.toString();
  } catch {
    return url;
  }
}
