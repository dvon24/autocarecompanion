import { getKnownIssueCommerce, knownIssueAffiliateUrl } from '@/lib/known-issue-commerce';
import { partCanBeShownForVehicle, partFitsVehicle, resolvePartNumber } from '@/lib/known-issue-part-fitment';
import { VEHICLE_TWIN_CATALOG } from '@/lib/vehicle-twin-catalog';
import type { KnownIssue } from '@/schemas/knownIssue.schema';

export const KNOWN_ISSUE_TWIN_PILOT = {
  slug: 'cadillac-xt6',
  year: 2020,
  twinId: 'xt6',
  sessionKey: 'au7o:known-issue-twin:cadillac-xt6:2020:viewed',
} as const;

export type KnownIssueTwinHotspotId = 'hood' | 'trans' | 'wheel' | 'rearwheel' | 'rad' | 'glass';

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
  system: string;
  condition: string;
  mechanism: string;
  symptoms: string;
  action: string;
  verifiedParts: string;
  narrative: string;
}

export interface KnownIssueTwinIssue {
  id: string;
  title: string;
  description: string;
  solution: string;
  severity: KnownIssue['severity'];
  category: KnownIssue['category'];
  symptoms: string[];
  affectedSystems: string[];
  typicalMileage: { low: number; high: number } | null;
  hotspot: {
    id: KnownIssueTwinHotspotId;
    label: string;
    x: number;
    y: number;
  } | null;
  recallFirst: boolean;
  fixParts: KnownIssueTwinFixPart[];
  explanation: KnownIssueTwinExplanation;
}

const HOTSPOT_LABELS: Record<KnownIssueTwinHotspotId, string> = {
  hood: 'Engine bay',
  trans: 'Transmission and driveline',
  wheel: 'Steering, suspension and brakes',
  rearwheel: 'Rear wheel, suspension and brakes',
  rad: 'Cooling and cabin heat',
  glass: 'Visibility and cabin electronics',
};

function appliesToPilot(issue: KnownIssue): boolean {
  return Boolean(issue.id.trim())
    && issue.status === 'published'
    && issue.vehicleMatch.make.trim().toLowerCase() === 'cadillac'
    && issue.vehicleMatch.model.trim().toLowerCase() === 'xt6'
    && issue.vehicleMatch.years.includes(KNOWN_ISSUE_TWIN_PILOT.year);
}

export function buildKnownIssueTwinExplanation(
  issue: Pick<KnownIssue, 'title' | 'description' | 'solution' | 'symptoms' | 'affectedSystems'>,
  fixParts: KnownIssueTwinFixPart[],
): KnownIssueTwinExplanation {
  const systems = (issue.affectedSystems || []).map((value) => value.trim()).filter(Boolean);
  const symptoms = issue.symptoms.map((value) => value.trim()).filter(Boolean);
  const parts = fixParts.map((part) => {
    const partNumber = part.oemPartNumber ? ` (${part.oemPartNumber})` : '';
    return `${part.component}${partNumber}`;
  });
  const system = systems.length > 0
    ? systems.join(' · ')
    : 'The published record does not identify a more specific affected system.';
  const condition = issue.title.trim() || 'a condition that the published record does not specifically name';
  const mechanism = issue.description.trim() || 'The published record does not establish how this condition develops.';
  const symptomText = symptoms.length > 0
    ? symptoms.join('; ')
    : 'The published record does not establish a symptom sequence.';
  const action = issue.solution.trim() || 'The published record does not establish a repair step.';
  const verifiedParts = parts.length > 0
    ? `Verified products allowed by the current fitment guard: ${parts.join(' · ')}.`
    : 'No verified repair product passes the current fitment guard for this branch.';
  return {
    system, condition, mechanism, symptoms: symptomText, action, verifiedParts,
    narrative: `Read the tree from the vehicle to ${system}, then to ${condition}. From that condition, the tree decomposes into two related branches. The failure branch explains how it develops using the published record: ${mechanism} Its symptoms branch shows what an owner may notice: ${symptomText} The separate repair branch shows the published action: ${action} ${verifiedParts}`,
  };
}

export function projectKnownIssueTwinIssues(issues: KnownIssue[]): KnownIssueTwinIssue[] {
  const twin = VEHICLE_TWIN_CATALOG.find((candidate) => candidate.id === KNOWN_ISSUE_TWIN_PILOT.twinId);
  if (!twin) return [];
  const hotspotById = new Map(twin.hotspots.map((hotspot) => [hotspot.id, hotspot]));
  const issueHotspotIds = new Map<string, KnownIssueTwinHotspotId>();
  for (const hotspot of twin.hotspots) {
    if (!(hotspot.id in HOTSPOT_LABELS)) continue;
    for (const issueId of hotspot.knownIssueIds || []) {
      issueHotspotIds.set(issueId, hotspot.id as KnownIssueTwinHotspotId);
    }
  }
  const fitmentVehicle = {
    year: twin.identity.year,
    trim: twin.identity.trim,
    engine: twin.identity.engine,
  };

  return issues
    .filter(appliesToPilot)
    .map((issue) => {
      // A visual location is allowed only when the reviewed Twin catalog names
      // this exact issue ID on a hotspot. Category/keyword inference is not
      // evidence of a physical location.
      const hotspotId = issueHotspotIds.get(issue.id) ?? null;
      const hotspot = hotspotId ? hotspotById.get(hotspotId) : null;
      const commerce = getKnownIssueCommerce(issue);
      const recallFirst = (issue.fixParts || []).some((part) => part.recallFirst === true);
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

      const projected = {
        id: issue.id,
        title: issue.title,
        description: issue.description,
        solution: issue.solution,
        severity: issue.severity,
        category: issue.category,
        symptoms: [...issue.symptoms],
        affectedSystems: [...(issue.affectedSystems || [])],
        typicalMileage,
        hotspot: hotspotId && hotspot
          ? { id: hotspotId, label: HOTSPOT_LABELS[hotspotId], x: hotspot.x, y: hotspot.y }
          : null,
        recallFirst,
        fixParts,
        explanation: buildKnownIssueTwinExplanation(issue, fixParts),
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
  return issues.filter((issue) => issue.hotspot
    && issue.typicalMileage
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
    || input.slug !== KNOWN_ISSUE_TWIN_PILOT.slug
    || input.requestedYear !== KNOWN_ISSUE_TWIN_PILOT.year
  ) return false;

  if (input.isVercel && input.vercelEnvironment === 'preview') return true;
  if (input.nodeEnvironment === 'development') return true;
  if (!input.isVercel) return false;
  return input.productionFlag === 'true' && input.country?.toUpperCase() === 'US';
}
