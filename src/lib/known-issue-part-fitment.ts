/**
 * Per-part fitment: does THIS part number fit THIS vehicle, inside an article
 * that may span many more years than the part does?
 *
 * An article covering 2007-2016 can carry a water pump that only fits 2009-2013.
 * `fixPart.fitment` records that; this module reads it. Every renderer — the
 * known-issues card, au7o vision, and the vehicle twin — must resolve a part
 * through here rather than assuming the article's own year span, so a part is
 * scoped once and answers the same way everywhere.
 *
 * The two rules that matter:
 *
 *  1. NO SCOPE MEANS UNKNOWN, NOT UNIVERSAL. Every part in the catalog today is
 *     unscoped. Treating absent scope as "fits nothing" would hide all of them;
 *     treating it as a positive "fits" would state something we never verified.
 *     So it is its own verdict — `unscoped` — and the caller decides.
 *
 *  2. A DECLARED SCOPE IS EXCLUSIVE. Once someone writes `years: [2009..2013]`,
 *     a 2015 car is `excluded`, full stop. The whole point is to stop selling a
 *     part to someone it does not fit.
 */

export interface PartFitment {
  years?: number[];
  engines?: string[];
  trims?: string[];
}

export interface FitmentVehicle {
  year?: number | null;
  engine?: string | null;
  trim?: string | null;
}

export type FitmentVerdict =
  /** A declared scope covers this vehicle. */
  | 'fits'
  /** A declared scope explicitly does NOT cover this vehicle. */
  | 'excluded'
  /** No scope declared, or nothing known about the vehicle to test against. */
  | 'unscoped';

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9.]+/g, ' ').trim();
}

/**
 * Whole-token containment, deliberately NOT substring containment.
 *
 * Substring matching both ways is how "SE" comes to match "SEL" and "S" matches
 * everything. Requiring the shorter value to appear as a complete token run lets
 * "3.6L" match "3.6L V6" while keeping "SE" away from "SEL".
 */
function tokenMatch(a: string, b: string): boolean {
  const x = normalize(a);
  const y = normalize(b);
  if (!x || !y) return false;
  if (x === y) return true;
  const [short, long] = x.length <= y.length ? [x, y] : [y, x];
  const tokens = long.split(' ');
  const needle = short.split(' ');
  for (let i = 0; i + needle.length <= tokens.length; i += 1) {
    if (needle.every((t, j) => t === tokens[i + j])) return true;
  }
  return false;
}

function listMatches(declared: string[] | undefined, actual: string | null | undefined): boolean | null {
  if (!declared || declared.length === 0) return null; // dimension not scoped
  if (!actual) return null; // nothing to test against — do not invent an exclusion
  return declared.some((d) => tokenMatch(d, actual));
}

/**
 * Resolve one part against one vehicle.
 *
 * A part is `excluded` as soon as ANY declared dimension rejects the vehicle —
 * right year but wrong engine is still the wrong part.
 */
export function partFitsVehicle(fitment: PartFitment | undefined, vehicle: FitmentVehicle): FitmentVerdict {
  if (!fitment) return 'unscoped';

  const checks: Array<boolean | null> = [];

  if (fitment.years && fitment.years.length > 0) {
    checks.push(vehicle.year == null ? null : fitment.years.includes(vehicle.year));
  }
  if (fitment.engines && fitment.engines.length > 0) {
    checks.push(listMatches(fitment.engines, vehicle.engine));
  }
  if (fitment.trims && fitment.trims.length > 0) {
    checks.push(listMatches(fitment.trims, vehicle.trim));
  }

  if (checks.length === 0) return 'unscoped';
  if (checks.some((check) => check === false)) return 'excluded';
  // A year match cannot prove an engine- or trim-scoped part fits when that
  // dimension is missing from the vehicle. Keep the verdict unknown until
  // every declared dimension can be tested.
  if (checks.some((check) => check === null)) return 'unscoped';
  return 'fits';
}

/**
 * Preserve legacy unscoped parts, but require every deliberately scoped part
 * to be positively confirmed before it reaches a purchase surface.
 */
export function partIsEligibleForVehicle(
  fitment: PartFitment | undefined,
  vehicle: FitmentVehicle,
): boolean {
  const hasDeclaredScope = Boolean(
    fitment?.years?.length || fitment?.engines?.length || fitment?.trims?.length,
  );
  return !hasDeclaredScope || partFitsVehicle(fitment, vehicle) === 'fits';
}

/**
 * Pick the part number for a specific vehicle when fitment splits across
 * variants — the CR-V VTC actuator case, where one article's year span needs
 * `14310-RZA-003` for 2007-09 and `14310-R40-A02` for 2010-11 and a single PN
 * is wrong for half its readers.
 *
 * Unscoped legacy records retain the base part number. Once any machine-readable
 * scope is declared, an unmatched vehicle receives no part number.
 */
export function resolvePartNumber(
  part: {
    oemPartNumber?: string | null;
    fitment?: PartFitment;
    variants?: Array<{ oemPartNumber: string; scope?: string; fitment?: PartFitment }>;
  },
  vehicle: FitmentVehicle,
): { partNumber: string | null; scope: string | null; matched: boolean } {
  const variants = part.variants || [];
  for (const variant of variants) {
    if (partFitsVehicle(variant.fitment, vehicle) === 'fits') {
      return { partNumber: variant.oemPartNumber, scope: variant.scope || null, matched: true };
    }
  }

  const hasScopedVariant = variants.some((variant) => Boolean(
    variant.fitment?.years?.length || variant.fitment?.engines?.length || variant.fitment?.trims?.length,
  ));
  const hasScopedBase = Boolean(
    part.fitment?.years?.length || part.fitment?.engines?.length || part.fitment?.trims?.length,
  );
  if (hasScopedBase && partFitsVehicle(part.fitment, vehicle) === 'fits') {
    return { partNumber: part.oemPartNumber || null, scope: describeFitment(part.fitment) || null, matched: true };
  }
  // Once any PN is deliberately scoped, an unmatched vehicle must not inherit
  // the legacy base number. That fallback is exactly how a correct PN for one
  // year range gets sold to the rest of the article's readers.
  if (hasScopedVariant || hasScopedBase) {
    return { partNumber: null, scope: null, matched: false };
  }
  return { partNumber: part.oemPartNumber || null, scope: null, matched: false };
}

/** "2009-2013", "2009-2011, 2015", "2009" — collapses contiguous runs. */
export function formatYearRange(years: number[]): string {
  const sorted = [...new Set(years)].sort((a, b) => a - b);
  if (sorted.length === 0) return '';
  const runs: string[] = [];
  let start = sorted[0]!;
  let prev = sorted[0]!;
  for (const year of sorted.slice(1)) {
    if (year === prev + 1) { prev = year; continue; }
    runs.push(start === prev ? `${start}` : `${start}-${prev}`);
    start = year;
    prev = year;
  }
  runs.push(start === prev ? `${start}` : `${start}-${prev}`);
  return runs.join(', ');
}

/**
 * Short human label for a part's scope — "2009-2013 · 3.6L V6". Empty string
 * when nothing is declared, so callers can render it unconditionally.
 */
export function describeFitment(fitment: PartFitment | undefined): string {
  if (!fitment) return '';
  const parts: string[] = [];
  if (fitment.years?.length) parts.push(formatYearRange(fitment.years));
  if (fitment.engines?.length) parts.push(fitment.engines.join(' / '));
  if (fitment.trims?.length) parts.push(fitment.trims.join(' / '));
  return parts.join(' · ');
}

/**
 * True when the part is scoped NARROWER than the article that carries it — the
 * case worth showing the reader, because the page's own year range would
 * otherwise imply the part fits their car.
 */
export function isNarrowerThanArticle(fitment: PartFitment | undefined, articleYears: number[]): boolean {
  if (!fitment?.years?.length || articleYears.length === 0) return false;
  const scoped = new Set(fitment.years);
  return articleYears.some((y) => !scoped.has(y));
}
