import { getKnownIssueCommerce, knownIssueAffiliateUrl } from '@/lib/known-issue-commerce';
import { partCanBeShownForVehicle, partFitsVehicle, resolvePartNumber } from '@/lib/known-issue-part-fitment';
import { diagnosticToolsForIssue } from '@/data/diagnostic-tools';
import type { KnownIssue } from '@/schemas/knownIssue.schema';
import { reviewedKnownIssueTwinCopy } from '@/lib/known-issue-twin-copy';
import { withReviewedTwinParts, hasSourceRecallFirst } from '@/lib/known-issue-twin-reviewed-parts';

import { KNOWN_ISSUE_TWIN_PILOT, XT6_KNOWN_ISSUE_VISUAL, resolveKnownIssueTwinVisual, type KnownIssueTwinVisualDefinition, type KnownIssueTwinHotspotId } from './known-issue-twin-visuals';
export { KNOWN_ISSUE_TWIN_PILOT, KNOWN_ISSUE_TWIN_EFFECTS, KNOWN_ISSUE_TWIN_POSITIONS, KNOWN_ISSUE_TWIN_PHONE_ANCHORS, type KnownIssueTwinHotspotId } from './known-issue-twin-visuals';

export type KnownIssueTwinSeverity = KnownIssue['severity'];

export const KNOWN_ISSUE_TWIN_SEVERITY: Record<KnownIssueTwinSeverity, {
  label: 'Critical' | 'Moderate' | 'Minor';
  rank: number;
}> = {
  high: { label: 'Critical', rank: 3 },
  medium: { label: 'Moderate', rank: 2 },
  low: { label: 'Minor', rank: 1 },
};


export interface KnownIssueTwinBuyLink {
  vendor: string;
  url: string;
}

export interface KnownIssueTwinFixPart {
  component: string;
  oemPartNumber: string | null;
  aftermarketXref: string[];
  note: string;
  priceLow: number | null;
  priceHigh: number | null;
  recallFirst: boolean;
  fitmentScope: string | null;
  fitmentConfirmed?: boolean;
  buyLinks: KnownIssueTwinBuyLink[];
}

export interface KnownIssueTwinExplanation {
  system: string | null;
  condition: string;
  mechanism: string;
  symptoms: string;
  action: string;
  verifiedParts: string;
  narrative: string;
  issueSentence: string;
  repairSentence: string;
}

export interface KnownIssueTwinScanner {
  name: string;
  priceRange: string;
  productUrl: string;
}

export interface KnownIssueTwinIssue {
  visualId?: string;
  vehicleMatch?: KnownIssue['vehicleMatch'];
  citations?: KnownIssue['citations'];
  id: string;
  title: string;
  description: string;
  solution: string;
  severity: KnownIssue['severity'];
  category: KnownIssue['category'];
  symptoms: string[];
  affectedSystems: string[];
  dtcCodes: string[];
  typicalMileage: { low: number; high: number } | null;
  hotspot: {
    id: KnownIssueTwinHotspotId;
    label: string;
    x: number;
    y: number;
  } | null;
  recallFirst: boolean;
  dealerAction: boolean;
  fixParts: KnownIssueTwinFixPart[];
  explanation: KnownIssueTwinExplanation;
  scanner: KnownIssueTwinScanner | null;
  howToCheck: string[];
  applicability?: string;
}

export function highestKnownIssueTwinSeverity(
  severities: readonly KnownIssueTwinSeverity[],
): KnownIssueTwinSeverity {
  return severities.reduce<KnownIssueTwinSeverity>((highest, severity) => (
    KNOWN_ISSUE_TWIN_SEVERITY[severity].rank > KNOWN_ISSUE_TWIN_SEVERITY[highest].rank
      ? severity
      : highest
  ), 'low');
}

export function knownIssueTwinMarkerMode(issueCount: number): 'direct' | 'choose' {
  return issueCount > 1 ? 'choose' : 'direct';
}

const GENERIC_SYSTEM_IMAGE: Record<KnownIssueTwinHotspotId, string> = {
  assistance: '/twin-stage/parts/part-radar-sensor.webp',
  fuel: '/twin-stage/parts/part-fuel-pump-module.webp',
  hood: '/twin-stage/parts/part-engine.webp',
  trans: '/twin-stage/parts/part-transmission.webp',
  wheel: '/twin-stage/parts/part-wheel.webp',
  rearwheel: '/twin-stage/parts/part-wheel.webp',
  rad: '/twin-stage/parts/part-radiator.webp',
  glass: '/twin-stage/parts/part-infotainment-module.webp',
  cooling: '/twin-stage/parts/part-radiator.webp',
  steering: '/twin-stage/parts/steering-system-concept.svg',
  camera: '/twin-stage/parts/part-infotainment-module.webp',
  roof: '/twin-stage/parts/roof-system-concept.svg',
};

const REVIEWED_COMPONENT_IMAGE: Readonly<Record<string, string>> = {
  'automatic transmission fluid': '/twin-stage/parts/part-transmission-fluid.webp',
  '9-speed automatic transmission fluid': '/twin-stage/parts/part-transmission-fluid.webp',
  'transmission fluid': '/twin-stage/parts/part-transmission-fluid.webp',
  'power transfer unit': '/twin-stage/parts/part-power-transfer-unit.webp',
  'power transfer unit assembly': '/twin-stage/parts/part-power-transfer-unit.webp',
  'ptu assembly': '/twin-stage/parts/part-power-transfer-unit.webp',
  radiator: '/twin-stage/parts/part-radiator.webp',
  battery: '/twin-stage/parts/part-battery.webp',
  'agm battery (group 94r / h7, 850 cca) — main starting battery': '/twin-stage/parts/part-battery.webp',
  'brake fluid': '/twin-stage/parts/part-brake-fluid.webp',
  'engine air filter': '/twin-stage/parts/part-air-filter.webp',
  'cabin air filter': '/twin-stage/parts/part-cabin-filter.webp',
  'engine oil filter': '/twin-stage/parts/part-oil-filter.webp',
  'oil filter': '/twin-stage/parts/part-oil-filter.webp',
  'engine oil': '/twin-stage/parts/part-oil.webp',
  'spark plug': '/twin-stage/parts/part-spark-plug.webp',
  'spark plugs': '/twin-stage/parts/part-spark-plug.webp',
  antifreeze: '/twin-stage/parts/part-antifreeze.webp',
  'engine coolant': '/twin-stage/parts/part-antifreeze.webp',
  differential: '/twin-stage/parts/part-differential.webp',
};

export interface KnownIssueTwinPartImage {
  src: string;
  specific: boolean;
}

export function resolveKnownIssueTwinPartImage(
  component: string,
  hotspot: KnownIssueTwinHotspotId | null | undefined,
): KnownIssueTwinPartImage {
  const reviewed = REVIEWED_COMPONENT_IMAGE[component.trim().toLowerCase()];
  if (reviewed) return { src: reviewed, specific: true };
  return {
    src: hotspot ? GENERIC_SYSTEM_IMAGE[hotspot] : '/twin-stage/parts/part-engine.webp',
    specific: false,
  };
}

const DIAGNOSTIC_ACTION = '(?:check|inspect|test|read|scan|measure|verify|monitor)';
const DIRECT_DIAGNOSTIC_STEP = new RegExp(`^${DIAGNOSTIC_ACTION}\\b`, 'i');
const PROFESSIONAL_DIAGNOSTIC_STEP = new RegExp(
  `^(?:a |an |the )?(?:technician|mechanic|dealer|service (?:department|technician|center))\\b.{0,60}\\b${DIAGNOSTIC_ACTION}\\b`,
  'i',
);
const DIRECTED_PROFESSIONAL_DIAGNOSTIC_STEP = new RegExp(
  `^(?:have|ask)\\s+(?:a |an |the )?(?:(?:qualified|certified|trained|transmission|automotive)\\s+){0,3}(?:technician|mechanic|dealer|service (?:department|technician|center))\\b.{0,60}\\b${DIAGNOSTIC_ACTION}\\b`,
  'i',
);
const CONDITIONAL_DIAGNOSTIC_STEP = new RegExp(
  `^(?:if|when)\\b.{0,100}?(?:,\\s*|\\s+)${DIAGNOSTIC_ACTION}\\b`,
  'i',
);
const NEGATED_DIAGNOSTIC_STEP = new RegExp(
  `(?:\\b(?:do not|don't|does not|doesn't|should not|shouldn't|must not|mustn't|cannot|can't|no need to)\\s+${DIAGNOSTIC_ACTION}\\b|\\b${DIAGNOSTIC_ACTION}\\b.{0,45}\\b(?:is not required|isn't required|is unnecessary)\\b)`,
  'i',
);

/**
 * Returns published diagnostic wording only. It deliberately does not turn
 * repair prose, symptoms, DTC presence, or inferred mechanical knowledge into
 * owner instructions.
 */
export function extractKnownIssueTwinCheckSteps(solution: string): string[] {
  return solution
    .split(/(?<=[.!?])\s+|;\s+/)
    .map((step) => step.trim())
    .filter(Boolean)
    .filter((step) => !NEGATED_DIAGNOSTIC_STEP.test(step))
    .filter((step) => (
      DIRECT_DIAGNOSTIC_STEP.test(step)
      || PROFESSIONAL_DIAGNOSTIC_STEP.test(step)
      || DIRECTED_PROFESSIONAL_DIAGNOSTIC_STEP.test(step)
      || CONDITIONAL_DIAGNOSTIC_STEP.test(step)
    ));
}

export function isKnownIssueTwinScannerUrl(value: string | null | undefined): value is string {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:'
      && /^(?:www\.)?amazon\.com$/i.test(url.hostname)
      && /\/(?:[^/]+\/)?dp\/[A-Z0-9]{10}(?:\/|$)/i.test(url.pathname)
      && url.searchParams.get('tag') === 'au7o-20';
  } catch {
    return false;
  }
}

const HOTSPOT_LABELS: Record<KnownIssueTwinHotspotId, string> = {
  assistance: 'Front driver-assistance sensors',
  fuel: 'Fuel delivery system',
  hood: 'Engine bay',
  trans: 'Transmission and driveline',
  wheel: 'Steering, suspension and brakes',
  rearwheel: 'Rear wheel, suspension and brakes',
  rad: 'Cooling and cabin heat',
  glass: 'Visibility and cabin electronics',
  cooling: 'Engine and cooling contamination',
  steering: 'Electric power steering',
  camera: 'Surround Vision signal',
  roof: 'Roof and body sealing',
};

function appliesToPilot(issue: KnownIssue, definition: KnownIssueTwinVisualDefinition): boolean {
  return Boolean(issue.id.trim())
    && issue.status === 'published'
    && issue.vehicleMatch.make.trim().toLowerCase() === definition.identity.make.toLowerCase()
    && issue.vehicleMatch.model.trim().toLowerCase() === definition.identity.model.toLowerCase()
    && issue.vehicleMatch.years.includes(definition.year);
}

export function buildKnownIssueTwinExplanation(
  issue: Pick<KnownIssue, 'title' | 'description' | 'solution' | 'symptoms' | 'affectedSystems'> & {id?: string},
  fixParts: KnownIssueTwinFixPart[],
): KnownIssueTwinExplanation {
  const systems = (issue.affectedSystems || []).map((value) => value.trim()).filter(Boolean);
  const symptoms = issue.symptoms.map((value) => value.trim()).filter(Boolean);
  const parts = fixParts.map((part) => {
    const partNumber = part.oemPartNumber ? ` (${part.oemPartNumber})` : '';
    return `${part.component}${partNumber}`;
  });
  const system = systems.length > 0 ? systems.join(' · ') : null;
  const condition = issue.title.trim() || 'Published condition';
  const mechanism = issue.description.trim() || 'The published record does not establish how this condition develops.';
  const symptomText = symptoms.length > 0
    ? symptoms.join('; ')
    : 'The published record does not establish a symptom sequence.';
  const action = issue.solution.trim() || 'The published record does not establish a repair step.';
  const verifiedParts = parts.length > 0
    ? `Verified products allowed by the current fitment guard: ${parts.join(' · ')}.`
    : 'No verified repair product passes the current fitment guard for this branch.';
  const asSentence = (value: string) => /[.!?]$/.test(value) ? value : `${value}.`;
  const firstSentence = (value: string) => {
    for (let index = 0; index < value.length; index += 1) {
      const character = value[index];
      if (character !== '.' && character !== '!' && character !== '?') continue;
      const next = value[index + 1];
      if (next && !/\s/.test(next)) continue;
      const candidate = value.slice(0, index + 1);
      if (character === '.' && /(?:\b[A-Z]\.){2,}$/i.test(candidate)) continue;
      if (character === '.' && /\b(?:e\.g|i\.e|mr|mrs|ms|dr|st|no|vs)\.$/i.test(candidate)) continue;
      return candidate.trim();
    }
    return value;
  };
  const conciseSentence = (value: string, fallback: string, maxLength = 160) => {
    const clean = value.trim();
    if (!clean) return asSentence(fallback);
    const first = firstSentence(clean);
    if (first.length <= maxLength) return asSentence(first);
    const clause = first.split(/;\s+|\s+—\s+|:\s+/)[0]?.trim();
    if (clause && clause.length >= 30 && clause.length <= maxLength) return asSentence(clause);
    // Length is not evidence that the record lacks repair instructions. Keep
    // the complete first sentence rather than cutting away safety conditions.
    return asSentence(first);
  };
  const reviewed = reviewedKnownIssueTwinCopy(issue);
  const issueSentence = reviewed?.problem ?? conciseSentence(issue.description, issue.title.trim() || 'The published record does not describe the condition');
  const repairSentence = `Fix: ${reviewed?.repair ?? conciseSentence(issue.solution, 'The published record does not establish a repair step')}`;
  return {
    system, condition, mechanism: reviewed?.reviewedMechanism ?? mechanism, symptoms: symptomText, action: reviewed?.reviewedAction ?? action, verifiedParts,
    issueSentence,
    repairSentence,
    narrative: `${issueSentence} ${repairSentence}`,
  };
}

export function projectKnownIssueTwinIssues(issues: KnownIssue[], definition: KnownIssueTwinVisualDefinition = XT6_KNOWN_ISSUE_VISUAL): KnownIssueTwinIssue[] {
  const issueHotspotIds = new Map(Object.entries(definition.mappings));
  const fitmentVehicle = {
    year: definition.year,
    trim: definition.identity.trim,
    engine: definition.identity.engine,
  };

  return issues
    .filter(issue => appliesToPilot(issue, definition))
    .map((issue) => {
      // A visual location is allowed only when the reviewed Twin catalog names
      // this exact issue ID on a hotspot. Category/keyword inference is not
      // evidence of a physical location.
      const reviewed = reviewedKnownIssueTwinCopy(issue);
      // New reviewed areas fail closed on wording, year/engine or citation drift.
      // The incompatible LSY cabin-heat record has no LGX catalog mapping.
      const mappedArea = issueHotspotIds.get(issue.id);
      const sourceScoped = definition.twinId !== 'xt6' || (mappedArea
        && (['cooling', 'steering', 'camera', 'roof'].includes(mappedArea) || issue.id.includes('missing-endcap')));
      const reviewedScopeMatches = reviewed?.sourceYears
        && JSON.stringify(reviewed.sourceYears) === JSON.stringify(issue.vehicleMatch.years)
        && JSON.stringify(reviewed.sourceEngines) === JSON.stringify(issue.vehicleMatch.engines || [])
        && JSON.stringify(reviewed.sourceTrims) === JSON.stringify(issue.vehicleMatch.trims || [])
        && JSON.stringify(reviewed.sourceCitations) === JSON.stringify((issue.citations || []).map(citation => citation.url));
      const hotspotId = sourceScoped && !reviewedScopeMatches ? null : issueHotspotIds.get(issue.id) ?? null;
      const hotspot = hotspotId ? definition.positions[hotspotId] : null;
      const commerce = getKnownIssueCommerce(definition.twinId !== 'xt6' && !hotspot
        ? {...issue,fixParts:[]} : withReviewedTwinParts(issue, definition));
      const mileage = issue.typicalMileage;
      const typicalMileage = mileage
        && Number.isFinite(mileage.low)
        && Number.isFinite(mileage.high)
        && mileage.low >= 0
        && mileage.high >= mileage.low
        ? { low: mileage.low, high: mileage.high }
        : null;

      const fixParts = commerce.fixParts
        .filter((part) => {
          if (!part.component.trim()) return false;
          const resolvedPart = resolvePartNumber(part, fitmentVehicle);
          const hasScopedVariant = (part.variants || []).some((variant) => Boolean(
            variant.fitment?.years?.length
            || variant.fitment?.engines?.length
            || variant.fitment?.trims?.length,
          ));
          if (resolvedPart.matched) return true;
          return !hasScopedVariant && partCanBeShownForVehicle(part.fitment, fitmentVehicle);
        })
        .map((part) => {
          const resolvedPart = resolvePartNumber(part, fitmentVehicle);
          const resolvedVariant = (part.variants || []).some((variant) => (
            variant.oemPartNumber === resolvedPart.partNumber
            && partFitsVehicle(variant.fitment, fitmentVehicle) === 'fits'
          ));
          return {
            component: part.component,
            oemPartNumber: resolvedPart.partNumber,
            aftermarketXref: [...(part.aftermarketXref || [])],
            note: part.note || '',
            priceLow: part.priceLow ?? null,
            priceHigh: part.priceHigh ?? null,
            recallFirst: part.recallFirst === true,
            fitmentScope: resolvedPart.scope,
            fitmentConfirmed: resolvedPart.matched || partFitsVehicle(part.fitment, fitmentVehicle) === 'fits',
            // Buy links live on the base part. A matched variant PN must not
            // inherit a base-PN destination unless that link is variant-keyed.
            buyLinks: resolvedVariant ? [] : (part.buyLinks || []).map((link) => ({
              vendor: link.vendor,
              url: knownIssueAffiliateUrl(link.url, issue.id),
            })),
          } satisfies KnownIssueTwinFixPart;
        });

      const diagnostics = diagnosticToolsForIssue(reviewed?.reviewedAction ?? issue.solution, issue.dtcCodes);
      const recallFirst = hasSourceRecallFirst(issue) || fixParts.some((part) => part.recallFirst === true);
      const dealerAction = recallFirst || /\b(?:dealer|recall)\b/i.test(`${issue.title} ${reviewed?.reviewedAction ?? issue.solution}`)
        || (definition.twinId !== 'xt6' && !!reviewed && new RegExp(`\\b${definition.identity.make}\\b`, 'i').test(reviewed.reviewedAction ?? issue.solution));
      const scanner = issue.category === 'steering' ? undefined : diagnostics.tools.find((tool) => tool.kind === 'scanner'
        && isKnownIssueTwinScannerUrl(tool.productUrl));
      const projected = {
        visualId: definition.twinId,
        vehicleMatch: issue.vehicleMatch,
        citations: issue.citations,
        id: issue.id,
        title: issue.title,
        description: issue.description,
        solution: issue.solution,
        severity: issue.severity,
        category: issue.category,
        symptoms: [...issue.symptoms],
        affectedSystems: [...(issue.affectedSystems || [])],
        dtcCodes: [...(issue.dtcCodes || [])],
        typicalMileage,
        hotspot: hotspotId && hotspot
          ? { id: hotspotId, label: definition.labels[hotspotId] ?? HOTSPOT_LABELS[hotspotId], ...hotspot }
          : null,
        recallFirst,
        dealerAction,
        fixParts,
        explanation: buildKnownIssueTwinExplanation(issue, fixParts),
        scanner: scanner?.productUrl ? { name: scanner.name, priceRange: scanner.priceRange, productUrl: scanner.productUrl } : null,
        howToCheck: extractKnownIssueTwinCheckSteps(reviewed?.reviewedAction ?? issue.solution),
        applicability: reviewed?.scope,
      } satisfies KnownIssueTwinIssue;
      return projected;
    })
    .sort((left, right) => {
      const leftMileage = left.typicalMileage?.low ?? Number.POSITIVE_INFINITY;
      const rightMileage = right.typicalMileage?.low ?? Number.POSITIVE_INFINITY;
      return leftMileage - rightMileage || left.title.localeCompare(right.title);
    });
}

export function issuesAtMileage(
  issues: KnownIssueTwinIssue[],
  mileage: number,
  neighborhoodMiles = 10_000,
): KnownIssueTwinIssue[] {
  if (!Number.isFinite(mileage) || !Number.isFinite(neighborhoodMiles) || neighborhoodMiles < 0) return [];
  const low = Math.max(0, mileage - neighborhoodMiles);
  const high = mileage + neighborhoodMiles;
  return issues.filter((issue) => issue.typicalMileage
    && issue.typicalMileage.high >= low
    && issue.typicalMileage.low <= high);
}

export function retainKnownIssueSelection(
  selectedIssueId: string | null,
  visibleIssueIds: readonly string[],
): string | null {
  return selectedIssueId && visibleIssueIds.includes(selectedIssueId) ? selectedIssueId : null;
}

export function registerDistinctIssueView(
  viewedIssueIds: readonly string[],
  issueId: string,
): { viewedIssueIds: string[]; isNew: boolean; gated: boolean } {
  const normalized = [...new Set(viewedIssueIds.filter(Boolean))];
  if (normalized.includes(issueId)) {
    return { viewedIssueIds: normalized, isNew: false, gated: normalized.length >= 2 };
  }
  const next = [...normalized, issueId];
  return { viewedIssueIds: next, isNew: true, gated: next.length >= 2 };
}

export function filterKnownIssueViewHistory(
  storedIssueIds: readonly unknown[],
  currentIssueIds: readonly string[],
): string[] {
  const current = new Set(currentIssueIds);
  return [...new Set(storedIssueIds.filter((value): value is string => typeof value === 'string'))]
    .filter((issueId) => current.has(issueId));
}

export interface KnownIssueTwinPilotExposure {
  slug: string;
  requestedYear: number | undefined;
  queryEnabled: boolean;
  isVercel: boolean;
  vercelEnvironment: string | undefined;
  country: string | null | undefined;
  productionFlag: string | undefined;
  nodeEnvironment: string | undefined;
}

export function isKnownIssueTwinPilotEnabled(input: KnownIssueTwinPilotExposure): boolean {
  if (
    !input.queryEnabled
    || input.requestedYear == null
    || !resolveKnownIssueTwinVisual(input.slug, input.requestedYear)
  ) return false;

  if (input.isVercel && input.vercelEnvironment === 'preview') return true;
  if (input.nodeEnvironment === 'development') return true;
  if (!input.isVercel) return false;
  return input.productionFlag === 'true' && input.country?.toUpperCase() === 'US';
}
