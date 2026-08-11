/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const test = require('node:test');
const { buildForModel } = require('./build-saab-model-adjudication');
const { clone } = require('./known-issue-adjudication-utils');
const { validatePacket } = require('./validate-saab-model-adjudication');

test('900 packet passes all frozen-identity gates', () => {
  const { contract, packet, snapshot } = buildForModel('900');
  assert.deepEqual(validatePacket(contract, packet, snapshot), []);
  assert.deepEqual(packet.summary, { retain_indexed_identity_and_accuracy_cleanup: 0, hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 1, fabricated_report_counts_proposed_zero: 0, pages_preserved_published: 1, total: 1 });
});

test('9-2X packet passes all frozen-identity gates', () => {
  const { contract, packet, snapshot } = buildForModel('9-2X');
  assert.deepEqual(validatePacket(contract, packet, snapshot), []);
  assert.deepEqual(packet.summary, { retain_indexed_identity_and_accuracy_cleanup: 0, hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 1, fabricated_report_counts_proposed_zero: 0, pages_preserved_published: 1, total: 1 });
});

test('9-3 packet passes all frozen-identity gates', () => {
  const { contract, packet, snapshot } = buildForModel('9-3');
  assert.deepEqual(validatePacket(contract, packet, snapshot), []);
  assert.deepEqual(packet.summary, { retain_indexed_identity_and_accuracy_cleanup: 0, hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 5, fabricated_report_counts_proposed_zero: 0, pages_preserved_published: 5, total: 5 });
});

test('9-5 packet passes all frozen-identity gates', () => {
  const { contract, packet, snapshot } = buildForModel('9-5');
  assert.deepEqual(validatePacket(contract, packet, snapshot), []);
  assert.deepEqual(packet.summary, { retain_indexed_identity_and_accuracy_cleanup: 2, hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 9, fabricated_report_counts_proposed_zero: 0, pages_preserved_published: 11, total: 11 });
});

test('validator rejects a held page becoming unpublished', () => {
  const { contract, packet, snapshot } = buildForModel('900');
  const changed = clone(packet); changed.rows[0].proposal.status = 'archived';
  assert.match(validatePacket(contract, changed, snapshot).join('\n'), /unpublished|immutable|deterministic/);
});

test('validator rejects frozen title drift', () => {
  const { contract, packet, snapshot } = buildForModel('900');
  const changed = clone(packet); changed.rows[0].proposal.title += ' changed';
  assert.match(validatePacket(contract, changed, snapshot).join('\n'), /immutable title|deterministic/);
});

test('validator rejects owner social proof and commerce additions', () => {
  const { contract, packet, snapshot } = buildForModel('900');
  const changed = clone(packet); changed.rows[0].proposal.description += ' 0+ owners have reported this.'; changed.rows[0].proposal.fixParts.push({ partNumber: 'fake' });
  assert.match(validatePacket(contract, changed, snapshot).join('\n'), /owner social proof|commerce-free|deterministic/);
});
