/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const test = require('node:test');
const { clone, loadInputs, reconcile } = require('./reconcile-porsche-make-adjudication');

function row(inputs, model, index = 0) { return inputs.packets[model].rows[index]; }

test('Porsche make reconciliation covers the exact frozen inventory', () => {
  const report = reconcile(loadInputs());
  assert.equal(report.passed, true);
  assert.deepEqual(report.summary, {
    models: 9,
    rows: 96,
    retained: 10,
    held: 86,
    unsupportedOwnerCountsZeroed: 47,
    pagesPreservedPublished: 96,
  });
  assert.deepEqual(report.crossPacketChecks, {
    exactModelInventory: true,
    exactRowInventory: true,
    identityDrift: 0,
    unpublished: 0,
    noncanonicalSeverity: 0,
    ownerDataDrift: 0,
    ownerSocialProof: 0,
    commerceDrift: 0,
    perPacketValidationErrors: 0,
  });
});

test('Porsche make reconciliation rejects a missing packet row', () => {
  const inputs = clone(loadInputs());
  inputs.packets.Taycan.rows.pop();
  const report = reconcile(inputs);
  assert.equal(report.passed, false);
  assert.match(report.errors.join('\n'), /Taycan:|missing ids/);
});

test('Porsche make reconciliation rejects identity drift', () => {
  const inputs = clone(loadInputs());
  row(inputs, 'Macan').proposal.title += ' changed';
  const report = reconcile(inputs);
  assert.equal(report.passed, false);
  assert.match(report.errors.join('\n'), /identity drift|immutable title|deterministic/);
});

test('Porsche make reconciliation rejects unpublished content and owner social proof', () => {
  const inputs = clone(loadInputs());
  row(inputs, 'Cayenne').proposal.status = 'archived';
  row(inputs, 'Cayenne', 1).proposal.description += ' 0+ owners have reported this.';
  const report = reconcile(inputs);
  assert.equal(report.passed, false);
  assert.match(report.errors.join('\n'), /unpublished|owner social proof|deterministic/);
});

test('Porsche make reconciliation rejects commerce additions', () => {
  const inputs = clone(loadInputs());
  row(inputs, 'Panamera').proposal.fixParts.push({ partNumber: 'fake' });
  const report = reconcile(inputs);
  assert.equal(report.passed, false);
  assert.match(report.errors.join('\n'), /commerce drift|commerce-free|deterministic/);
});
