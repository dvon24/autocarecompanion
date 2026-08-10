/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const test = require('node:test');
const { clone, loadInputs, reconcile } = require('./reconcile-ram-make-adjudication');

function row(inputs, model, index = 0) { return inputs.packets[model].rows[index]; }

test('RAM make reconciliation covers the exact frozen inventory and casing split', () => {
  const report = reconcile(loadInputs());
  assert.equal(report.passed, true);
  assert.deepEqual(report.summary, { models: 6, rows: 102, retained: 7, held: 95, unsupportedOwnerCountsZeroed: 25, pagesPreservedPublished: 102, frozenMakeCounts: { RAM: 66, Ram: 36 } });
  assert.deepEqual(report.crossPacketChecks, { exactModelInventory: true, exactRowInventory: true, makeCaseDrift: 0, identityDrift: 0, unpublished: 0, noncanonicalSeverity: 0, ownerDataDrift: 0, ownerSocialProof: 0, commerceDrift: 0, perPacketValidationErrors: 0 });
});

test('RAM make reconciliation rejects a missing packet row', () => {
  const inputs = clone(loadInputs());
  inputs.packets['ProMaster City'].rows.pop();
  const report = reconcile(inputs);
  assert.equal(report.passed, false);
  assert.match(report.errors.join('\n'), /ProMaster City:|missing ids/);
});

test('RAM make reconciliation rejects title and make-casing drift', () => {
  const inputs = clone(loadInputs());
  row(inputs, '1500').proposal.make = 'RAM';
  row(inputs, '3500').proposal.title += ' changed';
  const report = reconcile(inputs);
  assert.equal(report.passed, false);
  assert.match(report.errors.join('\n'), /make-case drift|identity drift|immutable|deterministic/);
});

test('RAM make reconciliation rejects unpublished content and owner social proof', () => {
  const inputs = clone(loadInputs());
  row(inputs, '2500').proposal.status = 'archived';
  row(inputs, 'ProMaster', 1).proposal.description += ' 0+ owners have reported this.';
  const report = reconcile(inputs);
  assert.equal(report.passed, false);
  assert.match(report.errors.join('\n'), /unpublished|owner social proof|deterministic/);
});

test('RAM make reconciliation rejects commerce additions', () => {
  const inputs = clone(loadInputs());
  row(inputs, 'ProMaster City').proposal.fixParts.push({ partNumber: 'fake' });
  const report = reconcile(inputs);
  assert.equal(report.passed, false);
  assert.match(report.errors.join('\n'), /commerce drift|commerce-free|deterministic/);
});
