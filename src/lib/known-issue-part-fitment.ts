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
  drivetrains?: string[];
  transmissions?: string[];
  catalogModels?: string[];
}

export interface FitmentVehicle {
  year?: number | null;
  make?: string | null;
  model?: string | null;
  engine?: string | null;
  trim?: string | null;
  drivetrain?: string | null;
  transmission?: string | null;
}

export interface VehicleIdentity {
  make?: string | null;
  model?: string | null;
}

export interface PartBuyLink {
  vendor: string;
  url: string;
  linkType?: string;
  verified?: boolean;
  affiliate?: boolean;
}

export interface PartVariant {
  scope?: string;
  component?: string;
  oemPartNumber?: string | null;
  aftermarketXref?: string[];
  note?: string;
  buyLinks?: PartBuyLink[];
  fitment?: PartFitment;
}

export interface ResolvablePart {
  component?: string;
  oemPartNumber?: string | null;
  aftermarketXref?: string[];
  note?: string;
  buyLinks?: PartBuyLink[];
  fitment?: PartFitment;
  variants?: PartVariant[];
}

export type VehicleResolvedPart<T extends ResolvablePart> = T & ResolvablePart;

export type FitmentVerdict =
  /** A declared scope covers this vehicle. */
  | 'fits'
  /** A declared scope explicitly does NOT cover this vehicle. */
  | 'excluded'
  /** No scope declared, or nothing known about the vehicle to test against. */
  | 'unscoped';

export type FitmentDimension = 'year' | 'engine' | 'trim' | 'drivetrain' | 'transmission';

export interface PartsForVehicleResolution<T extends ResolvablePart> {
  parts: VehicleResolvedPart<T>[];
  hiddenCount: number;
  /** Selected details still needed before a reviewed fitment can be resolved. */
  unresolvedDimensions: FitmentDimension[];
  /** More than one reviewed variant positively matched the supplied details. */
  ambiguousCount: number;
  /** Known details positively excluded all reviewed fitments. */
  excludedCount: number;
}

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

type PowertrainQualifier = 'gasoline' | 'diesel' | 'hybrid' | 'electric' | 'fuel-cell';

/**
 * A shorter displacement/configuration label may abbreviate a longer engine
 * label, but it must never bridge an explicit fuel or powertrain conflict.
 */
function powertrainQualifier(value: string): PowertrainQualifier | null {
  const normalized = normalize(value);
  if (/\b(?:fuel cell|fcev|hydrogen)\b/.test(normalized)) return 'fuel-cell';
  if (/\b(?:plug in hybrid|phev|hybrid|hev)\b/.test(normalized)) return 'hybrid';
  if (/\b(?:battery electric|electric|bev|ev)\b/.test(normalized)) return 'electric';
  if (/\b(?:turbodiesel|diesel|tdi|cdi|crdi)\b/.test(normalized)) return 'diesel';
  if (/\b(?:gasoline|petrol|gas|flex fuel|e85)\b/.test(normalized)) return 'gasoline';
  return null;
}

function engineTokenMatch(declared: string, actual: string): boolean {
  const declaredQualifier = powertrainQualifier(declared);
  const actualQualifier = powertrainQualifier(actual);
  if (declaredQualifier && actualQualifier && declaredQualifier !== actualQualifier) return false;
  return tokenMatch(declared, actual);
}

function listMatches(
  declared: string[] | undefined,
  actual: string | null | undefined,
  allowTokenContainment = false,
): boolean | null {
  if (!declared || declared.length === 0) return null; // dimension not scoped
  if (!actual) return null; // nothing to test against — do not invent an exclusion
  return declared.some((d) => allowTokenContainment
    ? engineTokenMatch(d, actual)
    : normalize(d) === normalize(actual));
}

function missingFitmentDimensions(
  fitment: PartFitment | undefined,
  vehicle: FitmentVehicle,
): FitmentDimension[] {
  if (!fitment) return [];
  const missing: FitmentDimension[] = [];
  if (fitment.years?.length && vehicle.year == null) missing.push('year');
  if (fitment.engines?.length && !vehicle.engine) missing.push('engine');
  if (fitment.trims?.length && !vehicle.trim) missing.push('trim');
  if (fitment.drivetrains?.length && !vehicle.drivetrain) missing.push('drivetrain');
  if (fitment.transmissions?.length && !vehicle.transmission) missing.push('transmission');
  return missing;
}

/**
 * A selected vehicle from another article must never unlock commerce here.
 * Identity uses normalized equality rather than substring matching: an Accord
 * is not an Accord Crosstour, and a Challenger is not a Charger.
 */
export function vehicleIdentityMatches(vehicle: FitmentVehicle, expected: VehicleIdentity | undefined): boolean {
  if (!expected) return true;
  const expectedMake = normalize(expected.make || '');
  const expectedModel = normalize(expected.model || '');
  if (expectedMake && normalize(vehicle.make || '') !== expectedMake) return false;
  if (expectedModel && normalize(vehicle.model || '') !== expectedModel) return false;
  return true;
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
  if (fitment.engines?.length) checks.push(listMatches(fitment.engines, vehicle.engine, true));
  if (fitment.trims?.length) checks.push(listMatches(fitment.trims, vehicle.trim));
  if (fitment.drivetrains?.length) checks.push(listMatches(fitment.drivetrains, vehicle.drivetrain));
  if (fitment.transmissions?.length) checks.push(listMatches(fitment.transmissions, vehicle.transmission));

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
    fitment?.years?.length || fitment?.engines?.length || fitment?.trims?.length
      || fitment?.drivetrains?.length || fitment?.transmissions?.length,
  );
  return !hasDeclaredScope || partFitsVehicle(fitment, vehicle) === 'fits';
}

/**
 * Public commerce must fail closed when a part declares a dimension the current
 * vehicle has not supplied. This is intentionally stricter than the diagnostic
 * `partFitsVehicle` verdict: unknown engine/trim cannot prove a scoped product
 * is safe to show, while a legacy part with no declared scope remains visible.
 */
export function partCanBeShownForVehicle(fitment: PartFitment | undefined, vehicle: FitmentVehicle): boolean {
  if (!fitment) return true;
  if (fitment.years?.length && vehicle.year == null) return false;
  if (fitment.engines?.length && !vehicle.engine) return false;
  if (fitment.trims?.length && !vehicle.trim) return false;
  if (fitment.drivetrains?.length && !vehicle.drivetrain) return false;
  if (fitment.transmissions?.length && !vehicle.transmission) return false;
  return partFitsVehicle(fitment, vehicle) !== 'excluded';
}

/**
 * Resolve a stored repair part for one exact selected vehicle.
 *
 * Variant rows are exclusive. Exactly one must match, otherwise the whole part
 * is hidden. In particular, base buy links are never inherited by a variant:
 * doing that would turn a correctly split Challenger pump into another
 * universal link. The selected variant's links are subsequently passed through
 * the normal product-URL commerce gate by each renderer.
 */
export function resolvePartForVehicle<T extends ResolvablePart>(
  part: T,
  vehicle: FitmentVehicle,
  expectedIdentity?: VehicleIdentity,
): VehicleResolvedPart<T> | null {
  return resolvePartForVehicleDetailed(part, vehicle, expectedIdentity).part;
}

type PartResolutionDetail<T extends ResolvablePart> =
  | { part: VehicleResolvedPart<T>; reason: 'resolved'; missing: FitmentDimension[] }
  | { part: null; reason: 'unknown' | 'ambiguous' | 'excluded'; missing: FitmentDimension[] };

function resolvePartForVehicleDetailed<T extends ResolvablePart>(
  part: T,
  vehicle: FitmentVehicle,
  expectedIdentity?: VehicleIdentity,
): PartResolutionDetail<T> {
  if (!vehicleIdentityMatches(vehicle, expectedIdentity)) {
    return { part: null, reason: 'excluded', missing: [] };
  }

  const baseVerdict = partFitsVehicle(part.fitment, vehicle);
  if (baseVerdict === 'excluded') return { part: null, reason: 'excluded', missing: [] };
  const baseMissing = missingFitmentDimensions(part.fitment, vehicle);
  if (baseMissing.length > 0) return { part: null, reason: 'unknown', missing: baseMissing };

  const variants = part.variants || [];
  if (variants.length === 0) {
    return { part: part as VehicleResolvedPart<T>, reason: 'resolved', missing: [] };
  }

  const notExcluded = variants.filter((variant) => partFitsVehicle(variant.fitment, vehicle) !== 'excluded');
  const unresolved = [...new Set(notExcluded.flatMap((variant) =>
    missingFitmentDimensions(variant.fitment, vehicle)))];
  if (unresolved.length > 0) return { part: null, reason: 'unknown', missing: unresolved };
  const compatible = notExcluded.filter((variant) => partFitsVehicle(variant.fitment, vehicle) === 'fits');
  if (compatible.length > 1) return { part: null, reason: 'ambiguous', missing: [] };

  if (compatible.length === 1) {
    const variant = compatible[0]!;
    return {
      reason: 'resolved',
      missing: [],
      part: {
        ...part,
        ...(variant.component ? { component: variant.component } : {}),
        ...(variant.oemPartNumber !== undefined ? { oemPartNumber: variant.oemPartNumber } : {}),
        ...(variant.aftermarketXref !== undefined ? { aftermarketXref: variant.aftermarketXref } : {}),
        ...(variant.note !== undefined ? { note: variant.note } : {}),
        fitment: variant.fitment,
        buyLinks: variant.buyLinks || [],
      } as VehicleResolvedPart<T>,
    };
  }

  return { part: null, reason: 'excluded', missing: [] };
}

export function resolvePartsForVehicle<T extends ResolvablePart>(
  parts: readonly T[],
  vehicle: FitmentVehicle,
  expectedIdentity?: VehicleIdentity,
): PartsForVehicleResolution<T> {
  const decisions = parts.map((part) => resolvePartForVehicleDetailed(part, vehicle, expectedIdentity));
  const resolved = decisions
    .map((decision) => decision.part)
    .filter((part): part is VehicleResolvedPart<T> => part !== null);
  return {
    parts: resolved,
    hiddenCount: parts.length - resolved.length,
    unresolvedDimensions: [...new Set(decisions.flatMap((decision) => decision.missing))],
    ambiguousCount: decisions.filter((decision) => decision.reason === 'ambiguous').length,
    excludedCount: decisions.filter((decision) => decision.reason === 'excluded').length,
  };
}

function humanList(values: string[]): string {
  if (values.length <= 1) return values[0] || '';
  if (values.length === 2) return `${values[0]} and ${values[1]}`;
  return `${values.slice(0, -1).join(', ')}, and ${values[values.length - 1]}`;
}

/** Clear, uncertainty-preserving copy shared by public commerce renderers. */
export function fitmentResolutionPrompt(
  resolution: Pick<PartsForVehicleResolution<ResolvablePart>, 'unresolvedDimensions' | 'ambiguousCount'>,
): string | null {
  if (resolution.unresolvedDimensions.length > 0) {
    const fields = humanList(resolution.unresolvedDimensions);
    return `Confirm your exact ${fields} to see the reviewed part option. No part link is shown until those vehicle details are known.`;
  }
  if (resolution.ambiguousCount > 0) {
    return 'More than one reviewed fitment matches these vehicle details. No part link is shown; confirm the exact configuration or VIN before buying.';
  }
  return null;
}

/**
 * Pick the part number for a specific vehicle when fitment splits across
 * variants — the CR-V VTC actuator case, where one article's year span needs
 * `14310-RZA-003` for 2007-09 and `14310-R40-A02` for 2010-11 and a single PN
 * is wrong for half its readers.
 *
 * Machine-readable variant rows are exclusive: exactly one must match. Zero
 * and overlapping matches both return no number. Entirely unscoped legacy
 * variant rows retain main's base-number fallback until they can be audited.
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
  const hasScopedVariant = variants.some((variant) => Boolean(
    variant.fitment?.years?.length || variant.fitment?.engines?.length || variant.fitment?.trims?.length
      || variant.fitment?.drivetrains?.length || variant.fitment?.transmissions?.length,
  ));
  if (hasScopedVariant) {
    const compatible = variants.filter((variant) =>
      partCanBeShownForVehicle(variant.fitment, vehicle)
        && partFitsVehicle(variant.fitment, vehicle) === 'fits');
    if (compatible.length === 1) {
      const variant = compatible[0]!;
      return { partNumber: variant.oemPartNumber, scope: variant.scope || null, matched: true };
    }
    return { partNumber: null, scope: null, matched: false };
  }

  const hasScopedBase = Boolean(
    part.fitment?.years?.length || part.fitment?.engines?.length || part.fitment?.trims?.length
      || part.fitment?.drivetrains?.length || part.fitment?.transmissions?.length,
  );
  if (hasScopedBase) {
    if (partCanBeShownForVehicle(part.fitment, vehicle) && partFitsVehicle(part.fitment, vehicle) === 'fits') {
      return { partNumber: part.oemPartNumber || null, scope: describeFitment(part.fitment) || null, matched: true };
    }
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
  if (fitment.drivetrains?.length) parts.push(fitment.drivetrains.join(' / '));
  if (fitment.transmissions?.length) parts.push(fitment.transmissions.join(' / '));
  return parts.join(' · ');
}

/**
 * True when the part is scoped NARROWER than the article that carries it — the
 * case worth showing the reader, because the page's own year range would
 * otherwise imply the part fits their car.
 */
export function isNarrowerThanArticle(fitment: PartFitment | undefined, articleYears: number[]): boolean {
  if (!fitment) return false;
  if (fitment.engines?.length || fitment.trims?.length
    || fitment.drivetrains?.length || fitment.transmissions?.length) return true;
  if (!fitment.years?.length || articleYears.length === 0) return false;
  const scoped = new Set(fitment.years);
  return articleYears.some((y) => !scoped.has(y));
}
