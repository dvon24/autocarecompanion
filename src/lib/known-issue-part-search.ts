import { isKnownIssueProductUrl, vendorMatchesProductUrl } from '@/lib/known-issue-commerce';
import type {
  FitmentWorkItem,
  IssueDisposition,
  IssueLedgerEntry,
} from '@/lib/known-issue-fitment-worklist';

export type PartSearchLane =
  | 'repair-part'
  | 'source-correction-hold'
  | 'service-fluid'
  | 'diagnostic-tool'
  | 'recall-dealer-shop'
  | 'no-commerce';

export type PartSearchDecision = 'find-primary' | 'find-alternate';
export type PartSearchQueryTemplate = 'devon' | 'precision';

interface FrozenSearchIssue {
  id: string;
  make: string;
  model: string;
  years: number[];
  trims?: string[];
  engines?: string[];
  title: string;
  solution?: string | null;
}

interface CatalogEvidenceRow {
  workItemId: string;
  verdict: string;
}

interface ProposalRow {
  proposalId: string;
  id: string;
}

export interface PartSearchQueueEntry {
  workItemId: string;
  issueId: string;
  lane: 'repair-part';
  searchDecision: PartSearchDecision;
  searchReasonCode: 'catalog-gap-needs-primary' | 'catalog-proposal-needs-alternate';
  searchEligibility: 'eligible' | 'source-correction-hold';
  catalogVerdict: string;
  component: string;
  searchComponent: string;
  queries: Record<PartSearchQueryTemplate, string>;
  title: string;
  repairRoleEvidence: string;
  diagnosisDependent: boolean;
  articleScope: FitmentWorkItem['articleScope'];
  declaredEngine?: string;
}

export interface PartSearchQueue {
  schemaVersion: 2;
  artifactKind: 'known-issue-part-search-queue';
  make: string;
  snapshotHash: string;
  status: 'DISCOVERY_QUEUED_NOT_APPLIED';
  productionApplied: false;
  guardrail: string;
  issueCount: number;
  workItemCount: number;
  primarySearchCount: number;
  alternateSearchCount: number;
  sourceCorrectionHeldWorkItemCount: number;
  sourceCorrectionHolds: Array<{
    issueId: string;
    reasonCode: 'authoritative-spec-conflict';
    authoritativeSources: string[];
  }>;
  issueRoutes: Array<{
    issueId: string;
    sourceDisposition: IssueDisposition;
    lane: PartSearchLane;
    workItemIds: string[];
  }>;
  entries: PartSearchQueueEntry[];
}

export interface SearchDiscoveryInput {
  workItemId: string;
  template: PartSearchQueryTemplate;
  query: string;
  vendor: string;
  productUrl: string;
  observedTitle: string;
  observedPartNumber: string;
  discoverySourceUrl: string;
  retrievedAt: string;
}

export interface HeldSearchCandidate {
  workItemId: string;
  issueId: string;
  component: string;
  template: PartSearchQueryTemplate;
  query: string;
  vendor: string;
  productUrl: string;
  observedTitle: string;
  observedPartNumber: string;
  discoverySourceUrl: string;
  retrievedAt: string;
  releaseDecision: 'hold';
  reasonCode: 'manual-repair-role-fitment-review-required';
}

const FLUID = /\b(?:atf|brake fluid|transmission fluid|differential fluid|coolant|gear oil|motor oil|engine oil|power steering fluid|refrigerant|grease)\b/i;
const DIAGNOSTIC = /\b(?:scan(?:ner| tool)?|multimeter|meter|oscilloscope|scope|pressure (?:gauge|tester)|smoke test|compression test|load test|test light|diagnos\w*)\b/i;

function uniqueText(values: Array<string | undefined>): string[] {
  const seen = new Set<string>();
  const output: string[] = [];
  for (const value of values) {
    const cleaned = String(value || '').replace(/\s+/g, ' ').trim();
    const key = cleaned.toLowerCase();
    if (!cleaned || seen.has(key)) continue;
    seen.add(key);
    output.push(cleaned);
  }
  return output;
}

function exactSet(label: string, left: string[], right: string[]) {
  const a = [...left].sort();
  const b = [...right].sort();
  if (JSON.stringify(a) !== JSON.stringify(b)) {
    const missing = a.filter((value) => !b.includes(value));
    const extra = b.filter((value) => !a.includes(value));
    throw new Error(`${label} set mismatch; missing=${missing.join(',')} extra=${extra.join(',')}`);
  }
}

function yearLabel(years: number[]): string {
  const sorted = [...new Set(years)].filter(Number.isInteger).sort((a, b) => a - b);
  if (!sorted.length) throw new Error('Search work item has no year scope');
  const runs: Array<[number, number]> = [];
  for (const year of sorted) {
    const current = runs.at(-1);
    if (current && year === current[1] + 1) current[1] = year;
    else runs.push([year, year]);
  }
  return runs.map(([start, end]) => start === end ? String(start) : `${start}-${end}`).join(' ');
}

/** Build the exact query Devon used for the human Acura benchmark. */
export function buildKnownIssuePartSearchQuery(
  item: FitmentWorkItem,
  template: PartSearchQueryTemplate,
  searchComponent = item.component,
): string {
  const vehicle = uniqueText([yearLabel(item.years), item.make, item.model]).join(' ');
  const trims = uniqueText(item.trims).join(', ');
  const scope = trims ? `${vehicle} — ${trims}` : vehicle;
  const engine = template === 'precision' ? String(item.declaredEngine || '').trim() : '';
  return uniqueText([scope, engine, searchComponent, 'us']).join(' ');
}

export function contextualSearchComponent(item: FitmentWorkItem, title: string): string {
  const component = item.component.trim();
  const context = `${title} ${item.repairRoleEvidence}`;
  if (/^mounts?$/i.test(component) && /\b(?:engine|transmission|motor)[^.]{0,20}\bmount/i.test(context)) {
    return 'motor mounts';
  }
  if (/^boot kit$/i.test(component) && /\b(?:outer\s+)?cv\b/i.test(context)) return 'outer CV boot kit';
  if (/^clear grommet\/seal pieces$/i.test(component)) {
    const partNumber = context.match(/\b\d{5}-[A-Z0-9]{3}-[A-Z0-9]{3}\b/i)?.[0];
    return partNumber ? `cowl grommet seal ${partNumber.toUpperCase()}` : 'cowl grommet seals';
  }
  if (/^bolts?$/i.test(component) && /\brear lower control arm\b/i.test(context)) {
    return 'rear lower control arm bolts';
  }
  if (/^timing belt kit belt$/i.test(component)) return 'timing belt kit';
  if (/^switch$/i.test(component) && /\bvtec oil pressure\b/i.test(context)) return 'VTEC oil pressure switch';
  if (/^pump\/accumulator$/i.test(component) && /\b(?:alb|abs)\b/i.test(context)) {
    return 'ABS pump accumulator assembly';
  }
  if (/^omron unit$/i.test(component) && /\bpgm-fi main relay\b/i.test(context)) {
    return 'PGM-FI main relay Omron';
  }
  if (/^high-pressure hose$/i.test(component) && /\bpower steering\b/i.test(context)) {
    return 'power steering high-pressure hose';
  }
  if (/^tubes?$/i.test(component) && /\bsunroof drain\b/i.test(context)) return 'sunroof drain tubes';
  if (/^honda\/acura timing belt kit$/i.test(component)) return 'timing belt kit';
  if (/^ac compressor$/i.test(component)) return 'AC compressor assembly';
  if (/^electromagnetic actuators$/i.test(component) && /\bsh-awd\b/i.test(context)) {
    return 'SH-AWD electromagnetic actuators';
  }
  if (/^rotors?$/i.test(component) && /\bfront brake rotor\b/i.test(context)) return 'front brake rotors';
  if (/^dashboard$/i.test(component)) return 'dashboard assembly';
  if (/^pads?$/i.test(component) && /\btype s brembo front brake\b/i.test(context)) {
    return 'Type S Brembo front brake pads';
  }
  return component;
}

export function partSearchLaneForIssue(
  disposition: IssueDisposition,
  issue: Pick<FrozenSearchIssue, 'title' | 'solution'>,
): PartSearchLane {
  if (disposition === 'buyable' || disposition === 'diagnosis-dependent') return 'repair-part';
  if (disposition === 'recall/dealer') return 'recall-dealer-shop';
  if (disposition === 'no-commerce') return 'no-commerce';
  const text = `${issue.title} ${issue.solution || ''}`;
  if (FLUID.test(text)) return 'service-fluid';
  if (DIAGNOSTIC.test(text)) return 'diagnostic-tool';
  return 'no-commerce';
}

export function buildKnownIssuePartSearchQueue(input: {
  make: string;
  snapshotHash: string;
  sourceRecords: FrozenSearchIssue[];
  ledger: IssueLedgerEntry[];
  workItems: FitmentWorkItem[];
  evidence: CatalogEvidenceRow[];
  proposals: ProposalRow[];
  sourceCorrectionHolds?: Array<{
    issueId: string;
    reasonCode: 'authoritative-spec-conflict';
    authoritativeSources: string[];
  }>;
}): PartSearchQueue {
  const source = input.sourceRecords
    .filter((row) => row.make.localeCompare(input.make, undefined, { sensitivity: 'accent' }) === 0)
    .sort((a, b) => a.id.localeCompare(b.id));
  const sourceById = new Map(source.map((row) => [row.id, row]));
  const ledgerById = new Map(input.ledger.map((row) => [row.issueId, row]));
  const workById = new Map(input.workItems.map((row) => [row.workItemId, row]));
  const evidenceById = new Map(input.evidence.map((row) => [row.workItemId, row]));
  const sourceCorrectionHolds = [...(input.sourceCorrectionHolds || [])]
    .sort((a, b) => a.issueId.localeCompare(b.issueId));
  const correctionByIssue = new Map(sourceCorrectionHolds.map((row) => [row.issueId, row]));
  if (sourceById.size !== source.length || ledgerById.size !== input.ledger.length
    || workById.size !== input.workItems.length || evidenceById.size !== input.evidence.length
    || correctionByIssue.size !== sourceCorrectionHolds.length) {
    throw new Error('Search-lane inputs contain duplicate identities');
  }
  for (const hold of sourceCorrectionHolds) {
    if (!sourceById.has(hold.issueId) || hold.reasonCode !== 'authoritative-spec-conflict'
      || !hold.authoritativeSources.length
      || hold.authoritativeSources.some((value) => {
        try {
          const url = new URL(value);
          return url.protocol !== 'https:' || Boolean(url.username || url.password);
        } catch { return true; }
      })) {
      throw new Error(`${hold.issueId}: source-correction hold is incomplete`);
    }
  }
  exactSet('source/ledger issue', source.map((row) => row.id), input.ledger.map((row) => row.issueId));
  exactSet('work/evidence item', [...workById.keys()], [...evidenceById.keys()]);
  exactSet('ledger/work item', input.ledger.flatMap((row) => row.workItemIds), [...workById.keys()]);
  for (const workItem of input.workItems) {
    if (!sourceById.has(workItem.issueId)) throw new Error(`${workItem.workItemId}: source issue is missing`);
  }
  const proposed = new Set(input.proposals.map((row) => {
    if (!workById.has(row.proposalId) || workById.get(row.proposalId)?.issueId !== row.id) {
      throw new Error(`${row.proposalId}: proposal is not bound to its work item`);
    }
    return row.proposalId;
  }));

  const issueRoutes = source.map((issue) => {
    const row = ledgerById.get(issue.id)!;
    const lane = correctionByIssue.has(issue.id)
      ? 'source-correction-hold' as const
      : partSearchLaneForIssue(row.disposition, issue);
    if (lane !== 'repair-part' && lane !== 'source-correction-hold' && row.workItemIds.length) {
      throw new Error(`${issue.id}: non-part lane unexpectedly contains repair work items`);
    }
    return {
      issueId: issue.id,
      sourceDisposition: row.disposition,
      lane,
      workItemIds: [...row.workItemIds].sort(),
    };
  });

  const entries = input.workItems
    .map((workItem): PartSearchQueueEntry => {
      const issue = sourceById.get(workItem.issueId)!;
      const catalogVerdict = evidenceById.get(workItem.workItemId)!.verdict;
      const hasProposal = proposed.has(workItem.workItemId);
      return {
        workItemId: workItem.workItemId,
        issueId: workItem.issueId,
        lane: 'repair-part',
        searchDecision: hasProposal ? 'find-alternate' : 'find-primary',
        searchReasonCode: hasProposal ? 'catalog-proposal-needs-alternate' : 'catalog-gap-needs-primary',
        searchEligibility: correctionByIssue.has(workItem.issueId) ? 'source-correction-hold' : 'eligible',
        catalogVerdict,
        component: workItem.component,
        searchComponent: contextualSearchComponent(workItem, issue.title),
        queries: {
          devon: buildKnownIssuePartSearchQuery(
            workItem,
            'devon',
            contextualSearchComponent(workItem, issue.title),
          ),
          precision: buildKnownIssuePartSearchQuery(
            workItem,
            'precision',
            contextualSearchComponent(workItem, issue.title),
          ),
        },
        title: issue.title,
        repairRoleEvidence: workItem.repairRoleEvidence,
        diagnosisDependent: workItem.diagnosisDependent,
        articleScope: workItem.articleScope,
        ...(workItem.declaredEngine ? { declaredEngine: workItem.declaredEngine } : {}),
      };
    })
    .sort((a, b) => a.workItemId.localeCompare(b.workItemId));

  return {
    schemaVersion: 2,
    artifactKind: 'known-issue-part-search-queue',
    make: input.make,
    snapshotHash: input.snapshotHash,
    status: 'DISCOVERY_QUEUED_NOT_APPLIED',
    productionApplied: false,
    guardrail: 'Queries discover candidates only. Product identity, repair role, source accuracy and exact fitment remain independent release gates.',
    issueCount: source.length,
    workItemCount: entries.length,
    primarySearchCount: entries.filter((row) => row.searchEligibility === 'eligible' && row.searchDecision === 'find-primary').length,
    alternateSearchCount: entries.filter((row) => row.searchEligibility === 'eligible' && row.searchDecision === 'find-alternate').length,
    sourceCorrectionHeldWorkItemCount: entries.filter((row) => row.searchEligibility === 'source-correction-hold').length,
    sourceCorrectionHolds,
    issueRoutes,
    entries,
  };
}

function tokenRuns(value: string): string[] {
  let decoded = value;
  try { decoded = decodeURIComponent(value); } catch { /* keep original evidence */ }
  return decoded.toLowerCase().match(/[a-z0-9]+/g) || [];
}

function containsExactPartNumber(value: string, partNumber: string): boolean {
  const expected = tokenRuns(partNumber);
  const actual = tokenRuns(value);
  if (!expected.length) return false;
  const expectedKey = expected.join('');
  return actual.some((_, start) => {
    let joined = '';
    for (let offset = start; offset < actual.length && joined.length <= expectedKey.length; offset += 1) {
      joined += actual[offset];
      if (joined === expectedKey) return true;
    }
    return false;
  });
}

/**
 * Convert observed search results into held evidence. Search/result URLs never
 * become public links here, and every accepted candidate remains unapproved.
 */
export function reviewKnownIssuePartSearchDiscoveries(
  queue: PartSearchQueue,
  discoveries: SearchDiscoveryInput[],
): HeldSearchCandidate[] {
  const queueById = new Map(queue.entries.map((row) => [row.workItemId, row]));
  const seen = new Set<string>();
  return discoveries.map((row) => {
    const work = queueById.get(row.workItemId);
    if (!work) throw new Error(`${row.workItemId}: discovery is outside the frozen search queue`);
    if (row.query !== work.queries[row.template]) {
      throw new Error(`${row.workItemId}: discovery query does not match the frozen ${row.template} query`);
    }
    if (!isKnownIssueProductUrl(row.productUrl) || !vendorMatchesProductUrl(row.vendor, row.productUrl)) {
      throw new Error(`${row.workItemId}: discovery destination is not an exact vendor-matched product URL`);
    }
    if (work.searchEligibility !== 'eligible') {
      throw new Error(`${row.workItemId}: source-correction hold is not searchable`);
    }
    if (!row.observedTitle.trim() || !row.observedPartNumber.trim()) {
      throw new Error(`${row.workItemId}: observed product identity is incomplete`);
    }
    if (!containsExactPartNumber(`${row.observedTitle} ${new URL(row.productUrl).pathname}`, row.observedPartNumber)) {
      throw new Error(`${row.workItemId}: observed part number is not an exact product-identity token`);
    }
    const retrieved = new Date(row.retrievedAt);
    let discoverySource: URL;
    try { discoverySource = new URL(row.discoverySourceUrl); } catch {
      throw new Error(`${row.workItemId}: discovery provenance is incomplete`);
    }
    if (!Number.isFinite(retrieved.getTime()) || discoverySource.protocol !== 'https:'
      || discoverySource.username || discoverySource.password) {
      throw new Error(`${row.workItemId}: discovery provenance is incomplete`);
    }
    const productIdentity = new URL(row.productUrl);
    productIdentity.search = '';
    productIdentity.hash = '';
    const key = `${row.workItemId}|${productIdentity.toString()}`;
    if (seen.has(key)) throw new Error(`${row.workItemId}: duplicate discovery product URL`);
    seen.add(key);
    return {
      workItemId: work.workItemId,
      issueId: work.issueId,
      component: work.component,
      template: row.template,
      query: work.queries[row.template],
      vendor: row.vendor,
      productUrl: new URL(row.productUrl).toString(),
      observedTitle: row.observedTitle.trim(),
      observedPartNumber: row.observedPartNumber.trim(),
      discoverySourceUrl: row.discoverySourceUrl,
      retrievedAt: retrieved.toISOString(),
      releaseDecision: 'hold' as const,
      reasonCode: 'manual-repair-role-fitment-review-required' as const,
    };
  }).sort((a, b) => `${a.workItemId}|${a.productUrl}`.localeCompare(`${b.workItemId}|${b.productUrl}`));
}
