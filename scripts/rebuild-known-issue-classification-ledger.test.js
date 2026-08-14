/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const test = require('node:test');
const { rebuildClassification } = require('./rebuild-known-issue-classification-ledger');

const issue = {
  id: 'audi-test', make: 'Audi', model: 'A4', years: [2016], engines: ['2.0T'],
  title: 'Module fault', solution: 'Scan with VCDS before repair.', dtcCodes: ['P17D0'], claims: [],
};

test('rebuilds diagnostic dispositions from frozen make artifacts without a global snapshot', () => {
  const output = rebuildClassification({
    artifactKind: 'known-issue-make-source', snapshotHash: 'hash', make: 'Audi', makeKey: 'audi',
    recordCount: 1, records: [issue],
  }, {
    artifactKind: 'known-issue-make-disposition-ledger', snapshotHash: 'hash', make: 'Audi', issueCount: 1,
    issues: [{ issueId: 'audi-test', disposition: 'service/tool/fluid', reason: 'diagnostic', prescriptionCount: 0, existingFixPartCount: 0, workItemIds: [] }],
  }, { makeIndex: 2, totalMakes: 20 });
  assert.equal(output.ledger.issueCount, 1);
  assert.equal(output.ledger.diagnosticSummary.unresolvedToolHoldCount, 0);
  assert.equal(output.ledger.rows[0].diagnosticDispositions[0].toolId, 'ross-tech-vcds-hex-v2');
  assert.equal(output.checkpoint.makeIndex, 2);
});

test('rejects mismatched frozen artifacts', () => {
  assert.throws(() => rebuildClassification({
    artifactKind: 'known-issue-make-source', snapshotHash: 'one', make: 'Audi', makeKey: 'audi', recordCount: 1, records: [issue],
  }, {
    artifactKind: 'known-issue-make-disposition-ledger', snapshotHash: 'two', make: 'Audi', issueCount: 1, issues: [],
  }, {}), /do not reconcile|count is inconsistent/);
});
