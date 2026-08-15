/**
 * Exact product-path exceptions for retailers whose PDP URLs do not use a
 * conventional /product/ or /item/ segment.
 *
 * This list is shared by public Known Issue commerce and the web-verification
 * cache so the same retailer URL cannot receive two different verdicts.
 */
const VERIFIED_RETAILER_PATTERNS: ReadonlyArray<readonly [RegExp, RegExp]> = Object.freeze([
  // TransPartsWarehouse is intentionally omitted: the observed destinations
  // were search/category pages, not one stable exact product offer.
  [/^store\.ross-tech\.com$/, /^\/shop\/vchv2_ent\/?$/i],
  [/^partshawk\.com$/, /^\/[a-z0-9-]*\d[a-z0-9-]*\.html$/i],
  [/^densoproducts\.com$/, /^\/denso-[a-z0-9-]*\d[a-z0-9-]*$/i],
  [/^zoro\.com$/, /\/i\/[a-z0-9]+\/?$/i],
  [/^partcatalog\.com$/, /^\/[a-z0-9-]*\d[a-z0-9-]*\.html$/i],
  [/^summitracing\.com$/, /^\/parts\/(?=[a-z0-9-]*\d)[a-z0-9][a-z0-9-]+$/i],
  [/^raybestospowertrain\.com$/, /^\/[a-z0-9-]+\/\d{4,}$/i],
  [/^mishimoto\.com$/, /^\/(?=[a-z0-9-]*\d)[a-z0-9][a-z0-9-]+\.html$/i],
  // Acura OEM PDPs terminate in the factory five-three-three part-number
  // shape. A model/year page such as acura~integra~2000.html must not pass.
  [/^acurapartswarehouse\.com$/, /^\/oem\/acura~[a-z0-9~.-]*~?[a-z0-9]{5}-[a-z0-9]{3}-[a-z0-9]{3}\.html$/i],
  // PartsGeek's seven-character offer key identifies a single product row.
  [/^partsgeek\.com$/, /^\/[a-z0-9]{7}-[a-z0-9][a-z0-9-]+\.html$/i],
]);

function normalizedHostname(value: string): string {
  return value.toLowerCase().replace(/^www\./, '').replace(/\.+$/, '');
}

/** Match one exact retailer-specific product path. Query strings are ignored. */
export function matchesVerifiedRetailerProductPath(hostname: string, pathname: string): boolean {
  const host = normalizedHostname(hostname);
  const path = pathname.toLowerCase().replace(/\/+$/, '') || '/';
  return VERIFIED_RETAILER_PATTERNS.some(([hostRe, pathRe]) => hostRe.test(host) && pathRe.test(path));
}
