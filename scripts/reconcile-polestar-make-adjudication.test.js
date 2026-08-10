/* eslint-disable @typescript-eslint/no-require-imports */
const test = require('node:test');
const assert = require('node:assert/strict');
const { clone } = require('./known-issue-adjudication-utils');
const { buildReconciliation, loadInputs } = require('./reconcile-polestar-make-adjudication');

test('Polestar make reconciliation covers all frozen rows exactly once', () => {
  const { contracts, snapshot, packets } = loadInputs();
  const result = buildReconciliation(contracts, snapshot, packets);
  assert.equal(result.status, 'proposal-only-reconciled');
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.coverage, { snapshotModels: 4, packetModels: 4, snapshotRows: 10, packetRows: 10, uniquePacketRows: 10, missingIds: [], extraIds: [], duplicateIds: [] });
  assert.deepEqual(result.decisions, { retain_indexed_identity_and_accuracy_cleanup: 1, hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 9, total: 10 });
  assert.deepEqual(result.safety, { immutableIdentityDriftRows: 0, nonPublishedProposalRows: 0, commerceRows: 0, ownerSocialProofRows: 0, productionWriteAuthorized: false });
  assert.equal(result.applicationGate.status, 'blocked');
});

test('Polestar make reconciliation rejects a missing model packet', () => {
  const { contracts, snapshot, packets } = loadInputs();
  const result = buildReconciliation(contracts, snapshot, packets.slice(1));
  assert.equal(result.status, 'failed');
  assert.ok(result.errors.some((error) => /packet missing/.test(error)));
  assert.ok(result.coverage.missingIds.length > 0);
});

test('Polestar make reconciliation rejects identity drift', () => {
  const { contracts, snapshot, packets } = loadInputs();
  const mutated = clone(packets);
  mutated[0].rows[0].proposal.title = 'Mutated title';
  const result = buildReconciliation(contracts, snapshot, mutated);
  assert.equal(result.status, 'failed');
  assert.ok(result.errors.some((error) => /immutable title changed|immutable drift/.test(error)));
  assert.equal(result.safety.immutableIdentityDriftRows, 1);
});

test('Polestar make reconciliation rejects commerce and owner social proof', () => {
  const { contracts, snapshot, packets } = loadInputs();
  const mutated = clone(packets);
  mutated[0].rows[0].proposal.fixParts = [{ component: 'unsafe' }];
  mutated[0].rows[0].proposal.solution += ' 0+ owners have reported this issue.';
  const result = buildReconciliation(contracts, snapshot, mutated);
  assert.equal(result.status, 'failed');
  assert.equal(result.safety.commerceRows, 1);
  assert.equal(result.safety.ownerSocialProofRows, 1);
});
