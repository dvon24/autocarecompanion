/**
 * Compare a human product-search benchmark with the frozen make audit.
 *
 * This is an offline evaluation only. Human URLs are discovery candidates,
 * never approval evidence, and this script cannot write to production.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import {
  isKnownIssueProductUrl,
  vendorMatchesProductUrl,
} from '../src/lib/known-issue-commerce';

type ReleaseDecision = 'hold' | 'reject';
type CandidateLane = 'repair-part' | 'diagnostic-tool' | 'service-fluid' | 'dealer-or-shop' | 'unknown';

export interface HumanCandidate {
  vendor: string;
  normalizedUrl: string;
  sourceFlags: string[];
  candidateLane: CandidateLane;
  discoveryAssessment:
    | 'promising'
    | 'unreviewed'
    | 'known-mismatch'
    | 'non-product'
    | 'tool-lane'
    | 'fluid-lane'
    | 'content-correction';
  releaseDecision: ReleaseDecision;
  reasonCode: string;
}

export interface HumanBenchmarkRow {
  sourceRow: number;
  issueId: string;
  titleSha256: string;
  howToFixSha256: string;
  humanDisposition: string;
  sourceCorrection?: {
    reasonCode: string;
    authoritativeSources: string[];
  };
  candidates: HumanCandidate[];
}

export interface HumanSearchBenchmark {
  schemaVersion: 1;
  artifactKind: 'known-issue-human-search-benchmark';
  make: string;
  status: 'DISCOVERY_BENCHMARK_NOT_APPLIED';
  productionApplied: false;
  sourceWorkbook: {
    name: string;
    sha256: string;
    sheet: string;
    range: string;
    rowCount: number;
  };
  snapshotHash: string;
  reasonCatalog: Record<string, string>;
  rows: HumanBenchmarkRow[];
}

interface MakeSource {
  snapshotHash: string;
  make: string;
  records: Array<{ id: string; title: string; solution?: string | null }>;
}

interface DispositionLedger {
  issues: Array<{ issueId: string; disposition: string; workItemIds?: string[] }>;
}

interface Worklist {
  entries: Array<{ id: string; workItemId: string }>;
}

interface ProposalStage {
  proposals: Array<{ id: string; proposalId: string }>;
}

interface LinkStage {
  linkEvidence: Array<{
    issueId: string;
    result: string;
    links?: Array<{ vendor?: string; url?: string }>;
  }>;
}

const HASH_RE = /^[a-f0-9]{64}$/i;
const normalizedText = (value: unknown) => String(value ?? '').replace(/\r\n?/g, '\n').trim();
const textSha256 = (value: unknown) => createHash('sha256').update(normalizedText(value)).digest('hex');
const hostOf = (value: string) => new URL(value).hostname.toLowerCase().replace(/^www\./, '');

function increment(map: Record<string, number>, key: string) {
  map[key] = (map[key] || 0) + 1;
}

function assertBenchmark(benchmark: HumanSearchBenchmark) {
  if (benchmark.schemaVersion !== 1 || benchmark.artifactKind !== 'known-issue-human-search-benchmark') {
    throw new Error('Human benchmark schema is unsupported');
  }
  if (!benchmark.make.trim() || benchmark.status !== 'DISCOVERY_BENCHMARK_NOT_APPLIED') {
    throw new Error('Human benchmark must be an explicitly non-production discovery artifact');
  }
  if (benchmark.productionApplied !== false) throw new Error('Human benchmark cannot claim production application');
  if (!HASH_RE.test(benchmark.sourceWorkbook.sha256) || !HASH_RE.test(benchmark.snapshotHash)) {
    throw new Error('Human benchmark is missing source hashes');
  }
  if (benchmark.rows.length !== benchmark.sourceWorkbook.rowCount) {
    throw new Error('Human benchmark row count does not match the workbook binding');
  }
  if (!benchmark.reasonCatalog || !Object.keys(benchmark.reasonCatalog).length) {
    throw new Error('Human benchmark reason catalog is missing');
  }
  const issueIds = new Set<string>();
  const sourceRows = new Set<number>();
  for (const row of benchmark.rows) {
    if (!row.issueId || issueIds.has(row.issueId)) throw new Error(`Duplicate or missing issue ID: ${row.issueId}`);
    if (!Number.isInteger(row.sourceRow) || sourceRows.has(row.sourceRow)) {
      throw new Error(`Duplicate or invalid workbook row: ${row.sourceRow}`);
    }
    issueIds.add(row.issueId);
    sourceRows.add(row.sourceRow);
    if (!HASH_RE.test(row.titleSha256) || !HASH_RE.test(row.howToFixSha256)) {
      throw new Error(`${row.issueId}: workbook content hash is missing`);
    }
    if (row.sourceCorrection) {
      if (!benchmark.reasonCatalog[row.sourceCorrection.reasonCode]) {
        throw new Error(`${row.issueId}: source correction reason is not cataloged`);
      }
      if (!row.sourceCorrection.authoritativeSources.length
        || row.sourceCorrection.authoritativeSources.some((url) => !/^https:\/\//i.test(url))) {
        throw new Error(`${row.issueId}: source correction lacks authoritative HTTPS evidence`);
      }
    }
    for (const candidate of row.candidates) {
      if (!['hold', 'reject'].includes(candidate.releaseDecision)) {
        throw new Error(`${row.issueId}: a discovery benchmark cannot approve commerce`);
      }
      if (!benchmark.reasonCatalog[candidate.reasonCode]) {
        throw new Error(`${row.issueId}: candidate reason is not cataloged`);
      }
      if (candidate.sourceFlags.includes('foreign-amazon-affiliate-tag')
        && new URL(candidate.normalizedUrl).searchParams.has('tag')) {
        throw new Error(`${row.issueId}: foreign Amazon attribution survived normalization`);
      }
    }
  }
}

export function evaluateHumanSearchBenchmark(
  benchmark: HumanSearchBenchmark,
  source: MakeSource,
  ledger: DispositionLedger,
  worklist: Worklist,
  proposals: ProposalStage,
  links: LinkStage,
) {
  assertBenchmark(benchmark);
  if (source.make.toLowerCase() !== benchmark.make.toLowerCase()) throw new Error('Benchmark/source make mismatch');
  if (source.snapshotHash !== benchmark.snapshotHash) throw new Error('Benchmark/source snapshot mismatch');

  const sourceById = new Map(source.records.map((record) => [record.id, record]));
  const ledgerById = new Map(ledger.issues.map((row) => [row.issueId, row]));
  const workByIssue = new Map<string, string[]>();
  for (const row of worklist.entries) {
    const values = workByIssue.get(row.id) || [];
    values.push(row.workItemId);
    workByIssue.set(row.id, values);
  }
  const proposalsByIssue = new Map<string, string[]>();
  for (const row of proposals.proposals) {
    const values = proposalsByIssue.get(row.id) || [];
    values.push(row.proposalId);
    proposalsByIssue.set(row.id, values);
  }
  const linkedByIssue = new Map<string, Array<{ vendor: string; url: string }>>();
  for (const row of links.linkEvidence) {
    if (row.result !== 'exact-product-link') continue;
    const values = linkedByIssue.get(row.issueId) || [];
    for (const link of row.links || []) {
      if (link.vendor && link.url) values.push({ vendor: link.vendor, url: link.url });
    }
    linkedByIssue.set(row.issueId, values);
  }

  const retailerCounts: Record<string, number> = {};
  const candidateLaneCounts: Record<string, number> = {};
  const assessmentCounts: Record<string, number> = {};
  const releaseDecisionCounts: Record<string, number> = {};
  const reasonCodeCounts: Record<string, number> = {};
  let candidateCount = 0;
  let productGateAcceptedCount = 0;
  let vendorGateAcceptedCount = 0;
  let foreignAffiliateRemovedCount = 0;
  let humanLinkIssueCount = 0;
  let humanLinkIssuesWithProposal = 0;
  let humanLinkIssuesWithAutomatedExactLink = 0;
  let retailerOverlapIssueCount = 0;

  const issueResults = benchmark.rows.map((row) => {
    const sourceRow = sourceById.get(row.issueId);
    const ledgerRow = ledgerById.get(row.issueId);
    if (!sourceRow || !ledgerRow) throw new Error(`${row.issueId}: benchmark issue is outside the frozen audit`);
    if (row.titleSha256 !== textSha256(sourceRow.title)) {
      throw new Error(`${row.issueId}: workbook title does not match the frozen source`);
    }
    if (row.howToFixSha256 !== textSha256(sourceRow.solution)) {
      throw new Error(`${row.issueId}: workbook How to Fix does not match the frozen source`);
    }

    const pipelineProposals = proposalsByIssue.get(row.issueId) || [];
    const pipelineLinks = linkedByIssue.get(row.issueId) || [];
    const pipelineHosts = new Set(pipelineLinks.map((link) => hostOf(link.url)));
    const humanHosts = new Set<string>();
    const candidateResults = row.candidates.map((candidate) => {
      candidateCount += 1;
      const host = hostOf(candidate.normalizedUrl);
      humanHosts.add(host);
      increment(retailerCounts, host);
      increment(candidateLaneCounts, candidate.candidateLane);
      increment(assessmentCounts, candidate.discoveryAssessment);
      increment(releaseDecisionCounts, candidate.releaseDecision);
      increment(reasonCodeCounts, candidate.reasonCode);
      if (candidate.sourceFlags.includes('foreign-amazon-affiliate-tag')) foreignAffiliateRemovedCount += 1;
      const productUrlAccepted = isKnownIssueProductUrl(candidate.normalizedUrl);
      const vendorAccepted = productUrlAccepted
        && vendorMatchesProductUrl(candidate.vendor, candidate.normalizedUrl);
      if (productUrlAccepted) productGateAcceptedCount += 1;
      if (vendorAccepted) vendorGateAcceptedCount += 1;
      return {
        vendor: candidate.vendor,
        host,
        normalizedUrl: candidate.normalizedUrl,
        productUrlAccepted,
        vendorAccepted,
        discoveryAssessment: candidate.discoveryAssessment,
        candidateLane: candidate.candidateLane,
        releaseDecision: candidate.releaseDecision,
        reasonCode: candidate.reasonCode,
        note: benchmark.reasonCatalog[candidate.reasonCode],
        sourceFlags: candidate.sourceFlags,
      };
    });

    if (row.candidates.length) {
      humanLinkIssueCount += 1;
      if (pipelineProposals.length) humanLinkIssuesWithProposal += 1;
      if (pipelineLinks.length) humanLinkIssuesWithAutomatedExactLink += 1;
      if ([...humanHosts].some((host) => pipelineHosts.has(host))) retailerOverlapIssueCount += 1;
    }

    return {
      sourceRow: row.sourceRow,
      issueId: row.issueId,
      title: sourceRow.title,
      humanDisposition: row.humanDisposition,
      pipelineDisposition: ledgerRow.disposition,
      pipelineWorkItemCount: (workByIssue.get(row.issueId) || []).length,
      pipelineProposalCount: pipelineProposals.length,
      pipelineExactLinkCount: pipelineLinks.length,
      sourceCorrection: row.sourceCorrection || null,
      candidates: candidateResults,
    };
  });

  return {
    schemaVersion: 1,
    artifactKind: 'known-issue-human-search-evaluation',
    make: benchmark.make,
    status: 'EVALUATED_NOT_APPLIED',
    productionApplied: false,
    sourceWorkbook: benchmark.sourceWorkbook,
    snapshotHash: benchmark.snapshotHash,
    summary: {
      benchmarkIssueCount: benchmark.rows.length,
      humanLinkIssueCount,
      humanCandidateCount: candidateCount,
      productGateAcceptedCount,
      productGateRejectedCount: candidateCount - productGateAcceptedCount,
      vendorGateAcceptedCount,
      vendorGateRejectedCount: candidateCount - vendorGateAcceptedCount,
      foreignAffiliateRemovedCount,
      humanLinkIssuesWithProposal,
      humanLinkIssuesWithAutomatedExactLink,
      humanLinkIssueProposalRecall: humanLinkIssueCount
        ? humanLinkIssuesWithProposal / humanLinkIssueCount
        : 0,
      humanLinkIssueExactLinkRecall: humanLinkIssueCount
        ? humanLinkIssuesWithAutomatedExactLink / humanLinkIssueCount
        : 0,
      retailerOverlapIssueCount,
      retailerCounts,
      candidateLaneCounts,
      assessmentCounts,
      releaseDecisionCounts,
      reasonCodeCounts,
    },
    guardrail: 'Human search results are discovery candidates, not ground truth. Every candidate remains held or rejected until exact repair role, product identity and full vehicle application are independently reviewed.',
    issueResults,
  };
}

export function compactHumanSearchEvaluation(
  evaluation: ReturnType<typeof evaluateHumanSearchBenchmark>,
) {
  const issueGaps = evaluation.issueResults
    .filter((row) => row.candidates.length > 0 && row.pipelineProposalCount === 0)
    .map((row) => ({
      sourceRow: row.sourceRow,
      issueId: row.issueId,
      title: row.title,
      pipelineDisposition: row.pipelineDisposition,
      humanCandidateCount: row.candidates.length,
    }));
  const heldOrRejectedSpecialLanes = evaluation.issueResults.flatMap((row) => row.candidates
    .map((candidate, candidateIndex) => ({
      sourceRow: row.sourceRow,
      issueId: row.issueId,
      candidateIndex,
      vendor: candidate.vendor,
      candidateLane: candidate.candidateLane,
      discoveryAssessment: candidate.discoveryAssessment,
      releaseDecision: candidate.releaseDecision,
      reasonCode: candidate.reasonCode,
    }))
    .filter((candidate) => candidate.candidateLane !== 'repair-part'
      || candidate.releaseDecision === 'reject'
      || candidate.discoveryAssessment === 'known-mismatch'));
  const sourceCorrectionHolds = evaluation.issueResults
    .filter((row) => row.sourceCorrection)
    .map((row) => ({
      sourceRow: row.sourceRow,
      issueId: row.issueId,
      title: row.title,
      ...row.sourceCorrection!,
    }));
  return {
    schemaVersion: evaluation.schemaVersion,
    artifactKind: 'known-issue-human-search-evaluation-summary',
    make: evaluation.make,
    status: evaluation.status,
    productionApplied: evaluation.productionApplied,
    sourceWorkbook: evaluation.sourceWorkbook,
    snapshotHash: evaluation.snapshotHash,
    summary: evaluation.summary,
    guardrail: evaluation.guardrail,
    issueGapCount: issueGaps.length,
    issueGaps,
    sourceCorrectionHolds,
    heldOrRejectedSpecialLanes,
  };
}

function requiredArg(args: string[], flag: string): string {
  const index = args.indexOf(flag);
  if (index < 0 || !args[index + 1]) throw new Error(`${flag} is required`);
  return args[index + 1]!;
}

function main() {
  const args = process.argv.slice(2);
  const benchmarkFile = path.resolve(requiredArg(args, '--benchmark'));
  const auditDir = path.resolve(requiredArg(args, '--audit-dir'));
  const outputFile = path.resolve(requiredArg(args, '--out'));
  const read = (name: string) => JSON.parse(fs.readFileSync(path.join(auditDir, name), 'utf8'));
  const evaluation = evaluateHumanSearchBenchmark(
    JSON.parse(fs.readFileSync(benchmarkFile, 'utf8')),
    read('00-make-source.json'),
    read('01-disposition-ledger.json'),
    read('02-fitment-worklist.json'),
    read('04-part-proposals.json'),
    read('05-direct-link-evidence.json'),
  );
  fs.writeFileSync(outputFile, `${JSON.stringify(compactHumanSearchEvaluation(evaluation), null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(evaluation.summary, null, 2));
}

if (require.main === module) {
  try { main(); } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
