export interface CatalogRestrictionFields {
  application?: string;
  comment?: string;
  location?: string;
}

export interface CatalogScopeContext {
  trims?: string[];
}

export interface ParsedCatalogScope {
  trims: string[];
  drivetrains: string[];
  transmissions: string[];
  positions: string[];
  raw: Required<CatalogRestrictionFields>;
  catalogNotes: string[];
  unparsedRestrictions: string[];
}

const REQUIRED_FIELDS = ['application', 'comment', 'location'] as const;

/** Reject verifier artifacts created before all restriction channels existed. */
export function assertFreshCatalogRestrictionFields(
  candidate: CatalogRestrictionFields,
  context = 'candidate',
): asserts candidate is Required<CatalogRestrictionFields> {
  for (const field of REQUIRED_FIELDS) {
    if (!Object.prototype.hasOwnProperty.call(candidate, field)) {
      throw new Error(`stale verifier artifact for ${context}: candidate is missing ${field}; rerun verify-parts-fitment.js`);
    }
  }
}

/**
 * The public fitment contract cannot enforce arbitrary catalog prose such as
 * VIN, side, package, sensor-hole or WITH/WITHOUT equipment restrictions.
 */
export function hasUnrepresentableCatalogScope(candidate: Required<CatalogRestrictionFields>): boolean {
  return REQUIRED_FIELDS.some((field) => candidate[field].trim().length > 0);
}

const clean = (value: unknown) => String(value || '').replace(/\s+/g, ' ').trim();
const words = (value: string) => value.toLowerCase().match(/[a-z0-9]+/g) || [];
const containsRun = (haystack: string, needle: string) => {
  const have = words(haystack);
  const want = words(needle);
  if (!want.length) return false;
  return have.some((_, start) => want.every((token, offset) => have[start + offset] === token));
};

/**
 * Parse only restriction dimensions the public fitment contract can enforce.
 * Anything left over is returned verbatim and keeps the candidate on hold.
 * This intentionally favors missed commerce over silently widening fitment.
 */
export function parseCatalogScope(
  candidate: CatalogRestrictionFields,
  context: CatalogScopeContext = {},
): ParsedCatalogScope {
  assertFreshCatalogRestrictionFields(candidate);
  const raw = {
    application: clean(candidate.application),
    comment: clean(candidate.comment),
    location: clean(candidate.location),
  };
  const source = [raw.application, raw.location].filter(Boolean).join(' ; ');
  const drivetrains: string[] = [];
  const transmissions: string[] = [];
  const positions: string[] = [];
  const trims = (context.trims || []).filter((trim) => containsRun(source, trim));

  const drivetrainRules: Array<[RegExp, string]> = [
    [/\b(?:awd|all[ -]?wheel drive)\b/i, 'AWD'],
    [/\b(?:4wd|four[ -]?wheel drive)\b/i, '4WD'],
    [/\b(?:fwd|front[ -]?wheel drive)\b/i, 'FWD'],
    [/\b(?:rwd|rear[ -]?wheel drive)\b/i, 'RWD'],
  ];
  for (const [pattern, value] of drivetrainRules) if (pattern.test(source)) drivetrains.push(value);

  const transmissionRules: Array<[RegExp, string]> = [
    [/\b([3-9]|10)[ -]?speed automatic\b/i, '$1-speed automatic'],
    [/\b([3-9]|10)[ -]?speed manual\b/i, '$1-speed manual'],
    [/\b(?:cvt|continuously variable transmission)\b/i, 'CVT'],
    [/\b(?:dct|dual[ -]?clutch transmission)\b/i, 'DCT'],
    [/\b(?:automatic|a\/?t)\b/i, 'automatic'],
    [/\b(?:manual|m\/?t)\b/i, 'manual'],
  ];
  for (const [pattern, value] of transmissionRules) {
    const match = pattern.exec(source);
    if (match) transmissions.push(value.replace('$1', match[1] || ''));
  }
  if (transmissions.some((value) => /-speed automatic$/.test(value))) {
    const index = transmissions.indexOf('automatic');
    if (index >= 0) transmissions.splice(index, 1);
  }
  if (transmissions.some((value) => /-speed manual$/.test(value))) {
    const index = transmissions.indexOf('manual');
    if (index >= 0) transmissions.splice(index, 1);
  }

  const positionRules: Array<[RegExp, string]> = [
    [/\bfront[ -]?left\b/i, 'front-left'],
    [/\bfront[ -]?right\b/i, 'front-right'],
    [/\brear[ -]?left\b/i, 'rear-left'],
    [/\brear[ -]?right\b/i, 'rear-right'],
    [/\bfront\b/i, 'front'],
    [/\brear\b/i, 'rear'],
    [/\bleft\b/i, 'left'],
    [/\bright\b/i, 'right'],
  ];
  for (const [pattern, value] of positionRules) if (pattern.test(raw.location)) positions.push(value);

  // Remove only exact phrases that have been converted to enforceable scope.
  // Punctuation or any residual prose remains a hold requiring manual review.
  let residue = source;
  for (const [pattern] of [...drivetrainRules, ...transmissionRules, ...positionRules]) {
    residue = residue.replace(new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`), ' ');
  }
  for (const trim of trims) {
    const escaped = words(trim).map((token) => token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('[^a-z0-9]+');
    if (escaped) residue = residue.replace(new RegExp(`\\b${escaped}\\b`, 'ig'), ' ');
  }
  residue = residue.replace(/[;,/|()\-]+/g, ' ').replace(/\s+/g, ' ').trim();

  // `comment` is frequently descriptive catalog evidence (kit contents,
  // material, dimensions, interference-engine note), not a vehicle selector.
  // Only restriction-shaped language blocks publication; all comment text is
  // still retained for the reviewer.
  const restrictionComment = /\b(?:with(?:out)?|except|vin|only|not for|requires?|from|through|before|after|wheelbase|doors?|sedan|coupe|wagon|convertible|trim|package|heavy duty|oil cooler|sensor hole)\b/i.test(raw.comment)
    ? raw.comment
    : '';
  const unparsed = [residue, restrictionComment].filter(Boolean);

  return {
    trims: [...new Set(trims)],
    drivetrains: [...new Set(drivetrains)],
    transmissions: [...new Set(transmissions)],
    positions: [...new Set(positions)],
    raw,
    catalogNotes: raw.comment ? [raw.comment] : [],
    // Position cannot yet be selected in the public vehicle context, so a
    // left/right/front/rear catalog row remains a hold even though it parsed.
    unparsedRestrictions: [...unparsed, ...(positions.length ? [`location: ${raw.location}`] : [])],
  };
}
