import assert from 'node:assert/strict';
import test from 'node:test';
import {
  compactHumanSearchEvaluation,
  evaluateHumanSearchBenchmark,
  type HumanSearchBenchmark,
} from './evaluate-known-issue-human-search-benchmark';

const hash = 'a'.repeat(64);
const benchmark: HumanSearchBenchmark = {
  schemaVersion: 1,
  artifactKind: 'known-issue-human-search-benchmark',
  make: 'Acura',
  status: 'DISCOVERY_BENCHMARK_NOT_APPLIED',
  productionApplied: false,
  sourceWorkbook: { name: 'Acura .xlsx', sha256: hash, sheet: 'Sheet1', range: 'A1:O2', rowCount: 1 },
  snapshotHash: hash,
  reasonCatalog: {
    'exact-product-candidate-needs-pipeline-binding': 'Discovery only.',
    'foreign-affiliate-tag-removed': 'Foreign attribution removed.',
    'non-product-url': 'Search pages are not product pages.',
    'manual-identity-role-fitment-review-required': 'Manual review required.',
  },
  rows: [{
    sourceRow: 2,
    issueId: 'issue-1',
    titleSha256: 'f44a123cd6111cdbc21898f32bd6d51f45e72ea4ba5c1ee4e678ff8acaa2c778',
    howToFixSha256: '63e5c2ae90add8b82b8eb3940eaec886af189327fffbdb0d3de8048f08911f32',
    humanDisposition: 'buyable',
    candidates: [{
      vendor: 'Acura Parts Warehouse',
      normalizedUrl: 'https://www.acurapartswarehouse.com/oem/acura~water~pump~19200-p75-003.html',
      sourceFlags: [],
      candidateLane: 'repair-part',
      discoveryAssessment: 'promising',
      releaseDecision: 'hold',
      reasonCode: 'exact-product-candidate-needs-pipeline-binding',
    }],
  }],
};

function evaluate(value = benchmark) {
  return evaluateHumanSearchBenchmark(
    value,
    { make: 'Acura', snapshotHash: hash, records: [{ id: 'issue-1', title: 'Water pump leak', solution: 'Replace the water pump.' }] },
    { issues: [{ issueId: 'issue-1', disposition: 'buyable', workItemIds: ['work-1'] }] },
    { entries: [{ id: 'issue-1', workItemId: 'work-1' }] },
    { proposals: [{ id: 'issue-1', proposalId: 'work-1' }] },
    { linkEvidence: [{ issueId: 'issue-1', result: 'exact-product-link', links: [{ vendor: 'eBay', url: 'https://www.ebay.com/itm/123456789012' }] }] },
  );
}

test('measures human discovery against proposals without treating it as approval', () => {
  const result = evaluate();
  assert.equal(result.summary.benchmarkIssueCount, 1);
  assert.equal(result.summary.humanCandidateCount, 1);
  assert.equal(result.summary.productGateAcceptedCount, 1);
  assert.equal(result.summary.vendorGateAcceptedCount, 1);
  assert.equal(result.summary.humanLinkIssueProposalRecall, 1);
  assert.equal(result.summary.humanLinkIssueExactLinkRecall, 1);
  assert.equal(result.issueResults[0]!.candidates[0]!.releaseDecision, 'hold');
  assert.equal(compactHumanSearchEvaluation(result).issueGapCount, 0);
});

test('rejects workbook/source drift and duplicate issue coverage', () => {
  const titleDrift = structuredClone(benchmark);
  titleDrift.rows[0]!.titleSha256 = hash;
  assert.throws(() => evaluate(titleDrift), /title does not match/);

  const duplicate = structuredClone(benchmark);
  duplicate.rows.push(structuredClone(duplicate.rows[0]!));
  duplicate.sourceWorkbook.rowCount = 2;
  assert.throws(() => evaluate(duplicate), /Duplicate or missing issue ID/);
});

test('strips foreign Amazon attribution before the benchmark can be evaluated', () => {
  const unsafe = structuredClone(benchmark);
  unsafe.rows[0]!.candidates[0] = {
    vendor: 'Amazon',
    normalizedUrl: 'https://www.amazon.com/dp/B01G5EA74I?tag=someone-else',
    sourceFlags: ['foreign-amazon-affiliate-tag'],
    candidateLane: 'diagnostic-tool',
    discoveryAssessment: 'unreviewed',
    releaseDecision: 'hold',
    reasonCode: 'foreign-affiliate-tag-removed',
  };
  assert.throws(() => evaluate(unsafe), /foreign Amazon attribution survived/);
});

test('counts structurally blocked pages and vendor mismatches separately', () => {
  const blocked = structuredClone(benchmark);
  blocked.rows[0]!.candidates = [
    {
      vendor: 'RockAuto',
      normalizedUrl: 'https://www.rockauto.com/en/partsearch/?q=water+pump',
      sourceFlags: ['search-or-catalog-url'],
      candidateLane: 'repair-part',
      discoveryAssessment: 'non-product',
      releaseDecision: 'reject',
      reasonCode: 'non-product-url',
    },
    {
      vendor: 'Wrong Store',
      normalizedUrl: 'https://www.acurapartswarehouse.com/oem/acura~water~pump~19200-p75-003.html',
      sourceFlags: [],
      candidateLane: 'repair-part',
      discoveryAssessment: 'unreviewed',
      releaseDecision: 'hold',
      reasonCode: 'manual-identity-role-fitment-review-required',
    },
  ];
  const result = evaluate(blocked);
  assert.equal(result.summary.productGateAcceptedCount, 1);
  assert.equal(result.summary.vendorGateAcceptedCount, 0);
  assert.equal(result.summary.productGateRejectedCount, 1);
});
