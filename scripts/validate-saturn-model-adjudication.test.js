/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const test = require('node:test');
const { buildForModel } = require('./build-saturn-model-adjudication');
const { clone } = require('./known-issue-adjudication-utils');
const { validatePacket } = require('./validate-saturn-model-adjudication');

test('Astra packet passes every frozen-identity gate', () => {
  const { contract, packet, snapshot } = buildForModel('Astra');
  assert.deepEqual(validatePacket(contract, packet, snapshot), []);
  assert.deepEqual(packet.summary, {
    retain_indexed_identity_and_accuracy_cleanup: 0,
    hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 1,
    fabricated_report_counts_proposed_zero: 0,
    pages_preserved_published: 1,
    total: 1,
  });
});

test('Aura packet covers all nine pages and preserves every indexed identity', () => {
  const { contract, packet, snapshot } = buildForModel('Aura');
  assert.deepEqual(validatePacket(contract, packet, snapshot), []);
  assert.deepEqual(packet.summary, {
    retain_indexed_identity_and_accuracy_cleanup: 3,
    hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 6,
    fabricated_report_counts_proposed_zero: 0,
    pages_preserved_published: 9,
    total: 9,
  });
});

test('Ion packet covers all nine pages without retiring duplicate URLs', () => {
  const { contract, packet, snapshot } = buildForModel('Ion');
  assert.deepEqual(validatePacket(contract, packet, snapshot), []);
  assert.deepEqual(packet.summary, {
    retain_indexed_identity_and_accuracy_cleanup: 2,
    hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 7,
    fabricated_report_counts_proposed_zero: 0,
    pages_preserved_published: 9,
    total: 9,
  });
});

test('Outlook packet preserves the indexed page and corrects special-coverage scope', () => {
  const { contract, packet, snapshot } = buildForModel('Outlook');
  assert.deepEqual(validatePacket(contract, packet, snapshot), []);
  assert.deepEqual(packet.summary, {
    retain_indexed_identity_and_accuracy_cleanup: 1,
    hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 0,
    fabricated_report_counts_proposed_zero: 0,
    pages_preserved_published: 1,
    total: 1,
  });
});

test('SC packet holds the unsupported third-door defect without darkening the page', () => {
  const { contract, packet, snapshot } = buildForModel('SC');
  assert.deepEqual(validatePacket(contract, packet, snapshot), []);
  assert.deepEqual(packet.summary, {
    retain_indexed_identity_and_accuracy_cleanup: 0,
    hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 1,
    fabricated_report_counts_proposed_zero: 0,
    pages_preserved_published: 1,
    total: 1,
  });
});

test('Sky packet holds both over-broad identities while preserving both URLs', () => {
  const { contract, packet, snapshot } = buildForModel('Sky');
  assert.deepEqual(validatePacket(contract, packet, snapshot), []);
  assert.deepEqual(packet.summary, {
    retain_indexed_identity_and_accuracy_cleanup: 0,
    hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 2,
    fabricated_report_counts_proposed_zero: 0,
    pages_preserved_published: 2,
    total: 2,
  });
});

test('SL packet holds both engine identities without expanding the exact bulletin years', () => {
  const { contract, packet, snapshot } = buildForModel('SL');
  assert.deepEqual(validatePacket(contract, packet, snapshot), []);
  assert.deepEqual(packet.summary, {
    retain_indexed_identity_and_accuracy_cleanup: 0,
    hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 2,
    fabricated_report_counts_proposed_zero: 0,
    pages_preserved_published: 2,
    total: 2,
  });
});

test('S-Series packet holds all three mismatched identities without trusting prior approval', () => {
  const { contract, packet, snapshot } = buildForModel('S-Series');
  assert.deepEqual(validatePacket(contract, packet, snapshot), []);
  assert.deepEqual(packet.summary, {
    retain_indexed_identity_and_accuracy_cleanup: 0,
    hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 3,
    fabricated_report_counts_proposed_zero: 0,
    pages_preserved_published: 3,
    total: 3,
  });
});

test('validator rejects a held page becoming unpublished', () => {
  const { contract, packet, snapshot } = buildForModel('Astra');
  const changed = clone(packet);
  changed.rows[0].proposal.status = 'archived';
  assert.match(validatePacket(contract, changed, snapshot).join('\n'), /unpublished|immutable|deterministic/);
});

test('validator rejects frozen title and vehicle drift', () => {
  const { contract, packet, snapshot } = buildForModel('Astra');
  const changed = clone(packet);
  changed.rows[0].proposal.title += ' changed';
  changed.rows[0].proposal.engines = ['guessed engine'];
  assert.match(validatePacket(contract, changed, snapshot).join('\n'), /immutable title|immutable engines|deterministic/);
});

test('validator rejects owner social proof and commerce additions', () => {
  const { contract, packet, snapshot } = buildForModel('Astra');
  const changed = clone(packet);
  changed.rows[0].proposal.description += ' 0+ owners have reported this.';
  changed.rows[0].proposal.fixParts.push({ partNumber: 'fake' });
  assert.match(validatePacket(contract, changed, snapshot).join('\n'), /owner social proof|commerce-free|deterministic/);
});
