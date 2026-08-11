/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const test = require('node:test');
const { buildForModel } = require('./build-rivian-model-adjudication');
const { clone } = require('./known-issue-adjudication-utils');
const { validatePacket } = require('./validate-rivian-model-adjudication');

test('EDV packet passes all frozen-identity gates', () => {
  const { contract, packet, snapshot } = buildForModel('EDV');
  assert.deepEqual(validatePacket(contract, packet, snapshot), []);
  assert.deepEqual(packet.summary, {
    retain_indexed_identity_and_accuracy_cleanup: 2,
    hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 1,
    fabricated_report_counts_proposed_zero: 0,
    pages_preserved_published: 3,
    total: 3,
  });
});

test('R1S packet passes all frozen-identity gates', () => {
  const { contract, packet, snapshot } = buildForModel('R1S');
  assert.deepEqual(validatePacket(contract, packet, snapshot), []);
  assert.deepEqual(packet.summary, {
    retain_indexed_identity_and_accuracy_cleanup: 0,
    hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: 1,
    fabricated_report_counts_proposed_zero: 0,
    pages_preserved_published: 1,
    total: 1,
  });
});

test('validator rejects a held page becoming unpublished', () => {
  const { contract, packet, snapshot } = buildForModel('EDV');
  const changed = clone(packet);
  changed.rows.find((row) => row.action.includes('hold_')).proposal.status = 'archived';
  assert.match(validatePacket(contract, changed, snapshot).join('\n'), /unpublished|immutable|deterministic/);
});

test('validator rejects frozen title drift', () => {
  const { contract, packet, snapshot } = buildForModel('EDV');
  const changed = clone(packet);
  changed.rows[0].proposal.title += ' changed';
  assert.match(validatePacket(contract, changed, snapshot).join('\n'), /immutable title|deterministic/);
});

test('validator rejects owner social proof', () => {
  const { contract, packet, snapshot } = buildForModel('EDV');
  const changed = clone(packet);
  changed.rows[0].proposal.description += ' 0+ owners have reported this.';
  assert.match(validatePacket(contract, changed, snapshot).join('\n'), /owner social proof|deterministic/);
});

test('validator rejects commerce additions', () => {
  const { contract, packet, snapshot } = buildForModel('EDV');
  const changed = clone(packet);
  changed.rows[0].proposal.fixParts.push({ partNumber: 'fake' });
  assert.match(validatePacket(contract, changed, snapshot).join('\n'), /commerce-free|deterministic/);
});

test('retained rows require official primary evidence', () => {
  const { contract, packet, snapshot } = buildForModel('EDV');
  const changed = clone(packet);
  const retained = changed.rows.find((row) => row.action.startsWith('retain_'));
  retained.proposal.citations = retained.proposal.citations.map((citation, index) => ({ ...citation, url: `https://example.com/article-${index}` }));
  assert.match(validatePacket(contract, changed, snapshot).join('\n'), /official primary evidence|deterministic/);
});
