/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const test = require('node:test');
const { buildReconciliation } = require('./build-saturn-make-reconciliation');
const { clone } = require('./known-issue-adjudication-utils');
const { validateReconciliation } = require('./validate-saturn-make-reconciliation');

test('Saturn make reconciliation covers the exact 37-page frozen inventory', () => {
  const report = buildReconciliation();
  assert.deepEqual(validateReconciliation(report), []);
  assert.deepEqual(report.summary, {
    models: 9,
    rows: 37,
    retained: 11,
    held: 26,
    unsupportedOwnerCountsZeroed: 0,
    pagesPreservedPublished: 37,
  });
  assert.deepEqual(report.crossPacketChecks, {
    exactModelInventory: true,
    exactRowInventory: true,
    makeDrift: 0,
    identityDrift: 0,
    unpublished: 0,
    noncanonicalSeverity: 0,
    ownerDataDrift: 0,
    ownerSocialProof: 0,
    commerceDrift: 0,
    perPacketValidationErrors: 0,
  });
});

test('Saturn make reconciliation rejects an unpublished-page count', () => {
  const report = clone(buildReconciliation());
  report.crossPacketChecks.unpublished = 1;
  report.summary.pagesPreservedPublished = 36;
  assert.match(validateReconciliation(report).join('\n'), /deterministic|totals|unpublished/);
});
