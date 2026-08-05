/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const test = require('node:test');
const { fullRecordHashes } = require('./apply-known-issue-catalog-deeplinks');
const { compareSnapshotToDecisions } = require('./verify-known-issue-restoration-sources');

function row(id, title = 'Original issue') {
  return {
    id,
    make: 'Dodge',
    model: 'Viper',
    years: [2013],
    trims: ['SRT'],
    engines: ['8.4L V10'],
    category: 'engine',
    title,
    description: 'Original description',
    solution: 'Inspect before replacing parts.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: ['Noise'],
    affectedSystems: ['engine'],
    dtcCodes: [],
    estimatedCostLow: null,
    estimatedCostHigh: null,
    typicalMileageLow: null,
    typicalMileageHigh: null,
    citations: [],
    communityRecommendations: [],
    fixParts: [],
    humanApproved: false,
    reportCount: 0,
    source: 'ai-researched',
    status: 'published',
    lastReportedByOwners: '',
    reviewedOn: '',
    contentUpdatedOn: '',
    contentUpdateSummary: '',
    relatedIssueIds: [],
  };
}

function entry(batchId, id, before) {
  return {
    manifest: {
      schemaVersion: 2,
      auditScope: 'full-record',
      batchId,
      issues: [{ id, before }],
    },
  };
}

test('accepts a snapshot matching one of multiple recorded pre-states', () => {
  const source = row('issue-1');
  const wrong = row('issue-1', 'Later intermediate title');
  const result = compareSnapshotToDecisions(
    { generatedAt: '2026-07-17T00:00:00.000Z', records: [source] },
    [
      entry('later-correction', source.id, fullRecordHashes(wrong)),
      entry('original-audit', source.id, fullRecordHashes(source)),
    ],
    new Set([source.id]),
  );
  assert.equal(result.passed, true);
  assert.equal(result.matched, 1);
  assert.equal(result.unrepresentedTargetIds.length, 0);
});

test('fails when a requested restore id has no authoritative decision', () => {
  const source = row('issue-1');
  const result = compareSnapshotToDecisions(
    { generatedAt: '2026-07-17T00:00:00.000Z', records: [source] },
    [entry('original-audit', source.id, fullRecordHashes(source))],
    new Set([source.id, 'issue-2']),
  );
  assert.equal(result.passed, false);
  assert.deepEqual(result.unrepresentedTargetIds, ['issue-2']);
});
