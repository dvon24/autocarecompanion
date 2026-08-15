import assert from 'node:assert/strict';
import test from 'node:test';
import type { PartSearchQueue } from '../src/lib/known-issue-part-search';
import { evaluateKnownIssuePartSearchLane } from './evaluate-known-issue-part-search-lane';

const queue: PartSearchQueue = {
  schemaVersion: 2,
  artifactKind: 'known-issue-part-search-queue',
  make: 'Acura',
  snapshotHash: 'a'.repeat(64),
  status: 'DISCOVERY_QUEUED_NOT_APPLIED',
  productionApplied: false,
  guardrail: 'held',
  issueCount: 1,
  workItemCount: 1,
  primarySearchCount: 1,
  alternateSearchCount: 0,
  sourceCorrectionHeldWorkItemCount: 0,
  sourceCorrectionHolds: [],
  issueRoutes: [{ issueId: 'issue-1', sourceDisposition: 'buyable', lane: 'repair-part', workItemIds: ['work-1'] }],
  entries: [{
    workItemId: 'work-1',
    issueId: 'issue-1',
    lane: 'repair-part',
    searchDecision: 'find-primary',
    searchReasonCode: 'catalog-gap-needs-primary',
    searchEligibility: 'eligible',
    catalogVerdict: 'unmapped',
    component: 'mounts',
    searchComponent: 'motor mounts',
    queries: {
      devon: '1990-2001 Acura Integra — RS, LS motor mounts us',
      precision: '1990-2001 Acura Integra — RS, LS 1.7L B17A1 motor mounts us',
    },
    title: 'Motor mounts crack',
    repairRoleEvidence: 'Replace the mounts.',
    diagnosisDependent: false,
    articleScope: {
      make: 'Acura', model: 'Integra', years: [1990, 2001], trims: ['RS', 'LS'],
      engines: [], drivetrains: [], transmissions: [],
    },
  }],
};

const benchmark = {
  make: 'Acura', snapshotHash: 'a'.repeat(64), status: 'DISCOVERY_BENCHMARK_NOT_APPLIED', productionApplied: false as const,
  rows: [{ issueId: 'issue-1', candidates: [{}] }],
};
const expectations = {
  schemaVersion: 1 as const,
  artifactKind: 'known-issue-human-search-component-expectations' as const,
  make: 'Acura', snapshotHash: 'a'.repeat(64), status: 'EVALUATION_ONLY_NOT_APPLIED' as const, productionApplied: false as const,
  rows: [{ issueId: 'issue-1', expectedComponents: ['motor mounts'] }],
};

test('measures component query recall without treating it as product precision', () => {
  const result = evaluateKnownIssuePartSearchLane(benchmark, expectations, queue);
  assert.equal(result.componentQueryCoveredCount, 1);
  assert.equal(result.componentQueryCoverage, 1);
  assert.equal(Object.hasOwn(result, 'componentMatchRecall'), false);
  assert.equal(Object.hasOwn(result, 'goNoGo'), false);
  assert.equal(result.exactProductPrecision, null);
  assert.equal(result.status, 'QUERY_COMPONENTS_EVALUATED_DISCOVERY_NOT_RUN');
  assert.equal(result.experimentQueryCount, 2);
  assert.deepEqual(result.experimentQueries.map((row) => row.template), ['devon', 'precision']);
});

test('reports a missing component and rejects answer-key or query drift', () => {
  const missing = evaluateKnownIssuePartSearchLane(
    benchmark,
    { ...expectations, rows: [{ issueId: 'issue-1', expectedComponents: ['water pump'] }] },
    queue,
  );
  assert.equal(missing.componentQueryCoveredCount, 0);
  assert.deepEqual(missing.issueResults[0]?.missingComponents, ['water pump']);
  assert.throws(
    () => evaluateKnownIssuePartSearchLane(
      benchmark,
      { ...expectations, rows: [{ issueId: 'other', expectedComponents: ['motor mounts'] }] },
      queue,
    ),
    /set mismatch/,
  );
  assert.throws(
    () => evaluateKnownIssuePartSearchLane(benchmark, expectations, {
      ...queue,
      entries: [{
        ...queue.entries[0]!,
        queries: { ...queue.entries[0]!.queries, devon: '1990 Acura Integra motor mounts' },
      }],
    }),
    /US market scope/,
  );
});
