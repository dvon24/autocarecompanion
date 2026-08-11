/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const test = require('node:test');
const { clone, loadInputs, reconcile } = require('./reconcile-rivian-make-adjudication');

function row(inputs, model, index = 0) { return inputs.packets[model].rows[index]; }

test('Rivian reconciliation covers the exact frozen make inventory', () => {
  const report = reconcile(loadInputs());
  assert.equal(report.passed, true);
  assert.deepEqual(report.summary, { models: 4, rows: 14, retained: 3, held: 11, unsupportedOwnerCountsZeroed: 0, pagesPreservedPublished: 14 });
  assert.deepEqual(report.crossPacketChecks, { exactModelInventory: true, exactRowInventory: true, makeDrift: 0, identityDrift: 0, unpublished: 0, noncanonicalSeverity: 0, ownerDataDrift: 0, ownerSocialProof: 0, commerceDrift: 0, perPacketValidationErrors: 0 });
});

test('Rivian reconciliation rejects a missing packet row', () => {
  const inputs = clone(loadInputs());
  inputs.packets.EDV.rows.pop();
  const report = reconcile(inputs);
  assert.equal(report.passed, false);
  assert.match(report.errors.join('\n'), /EDV:|missing ids/);
});

test('Rivian reconciliation rejects title and make drift', () => {
  const inputs = clone(loadInputs());
  row(inputs, 'R1S').proposal.make = 'RIVIAN';
  row(inputs, 'R1T').proposal.title += ' changed';
  const report = reconcile(inputs);
  assert.equal(report.passed, false);
  assert.match(report.errors.join('\n'), /make drift|identity drift|immutable|deterministic/);
});

test('Rivian reconciliation rejects unpublished content and owner social proof', () => {
  const inputs = clone(loadInputs());
  row(inputs, 'R2').proposal.status = 'archived';
  row(inputs, 'EDV', 1).proposal.description += ' 0+ owners have reported this.';
  const report = reconcile(inputs);
  assert.equal(report.passed, false);
  assert.match(report.errors.join('\n'), /unpublished|owner social proof|deterministic/);
});

test('Rivian reconciliation rejects commerce additions', () => {
  const inputs = clone(loadInputs());
  row(inputs, 'R1T').proposal.fixParts.push({ partNumber: 'fake' });
  const report = reconcile(inputs);
  assert.equal(report.passed, false);
  assert.match(report.errors.join('\n'), /commerce drift|commerce-free|deterministic/);
});
