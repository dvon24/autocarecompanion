/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const test = require('node:test');
const { clone, loadInputs, reconcile } = require('./reconcile-renault-make-adjudication');

function row(inputs, model, index = 0) { return inputs.packets[model].rows[index]; }

test('Renault reconciliation covers the exact frozen make inventory', () => {
  const report = reconcile(loadInputs());
  assert.equal(report.passed, true);
  assert.deepEqual(report.summary, { models: 11, rows: 55, retained: 2, held: 53, unsupportedOwnerCountsZeroed: 18, pagesPreservedPublished: 55 });
  assert.deepEqual(report.crossPacketChecks, { exactModelInventory: true, exactRowInventory: true, makeDrift: 0, identityDrift: 0, unpublished: 0, noncanonicalSeverity: 0, ownerDataDrift: 0, ownerSocialProof: 0, commerceDrift: 0, perPacketValidationErrors: 0 });
});

test('Renault reconciliation rejects a missing packet row', () => {
  const inputs = clone(loadInputs());
  inputs.packets.Captur.rows.pop();
  const report = reconcile(inputs);
  assert.equal(report.passed, false);
  assert.match(report.errors.join('\n'), /Captur:|missing ids/);
});

test('Renault reconciliation rejects title and make drift', () => {
  const inputs = clone(loadInputs());
  row(inputs, 'Clio').proposal.make = 'RENAULT';
  row(inputs, 'Koleos').proposal.title += ' changed';
  const report = reconcile(inputs);
  assert.equal(report.passed, false);
  assert.match(report.errors.join('\n'), /make drift|identity drift|immutable|deterministic/);
});

test('Renault reconciliation rejects unpublished content and owner social proof', () => {
  const inputs = clone(loadInputs());
  row(inputs, 'Megane').proposal.status = 'archived';
  row(inputs, 'Twizy', 1).proposal.description += ' 0+ owners have reported this.';
  const report = reconcile(inputs);
  assert.equal(report.passed, false);
  assert.match(report.errors.join('\n'), /unpublished|owner social proof|deterministic/);
});

test('Renault reconciliation rejects commerce additions', () => {
  const inputs = clone(loadInputs());
  row(inputs, 'Zoe').proposal.fixParts.push({ partNumber: 'fake' });
  const report = reconcile(inputs);
  assert.equal(report.passed, false);
  assert.match(report.errors.join('\n'), /commerce drift|commerce-free|deterministic/);
});
