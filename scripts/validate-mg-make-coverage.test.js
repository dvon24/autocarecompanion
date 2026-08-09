/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { SNAPSHOT, loadPackets, validateMakeCoverage } = require('./validate-mg-make-coverage');
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
const frozenPackets = loadPackets();
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function wrappers() { return clone(frozenPackets); }

test('all six MG rows are covered by the MGB packet', () => {
  const result = validateMakeCoverage(snapshot, wrappers());
  assert.equal(result.passed, true);
  assert.equal(result.packetCount, 1);
  assert.equal(result.snapshotRows, 6);
  assert.equal(result.coveredRows, 6);
  assert.deepEqual(result.missingIds, []);
  assert.deepEqual(result.modelCounts, { MGB: 6 });
  assert.equal(result.uncitedProposalCount, 0);
});
test('missing MGB packet exposes all six rows', () => {
  const result = validateMakeCoverage(snapshot, []);
  assert.equal(result.passed, false);
  assert.equal(result.missingIds.length, 6);
});
test('duplicate row cannot silently inflate coverage', () => {
  const packets = wrappers();
  packets[0].packet.rows.push(clone(packets[0].packet.rows[0]));
  assert.match(validateMakeCoverage(snapshot, packets).errors.join('\n'), /duplicate coverage/);
});
test('identity and severity drift are rejected', () => {
  const packets = wrappers();
  const row = packets[0].packet.rows[0];
  row.proposal.title += ' changed';
  row.proposal.severity = 'critical';
  const errors = validateMakeCoverage(snapshot, packets).errors.join('\n');
  assert.match(errors, /immutable title changed/);
  assert.match(errors, /non-canonical severity critical/);
});
test('uncited proposal, commerce and unknown-owner social proof are rejected', () => {
  const packets = wrappers();
  const row = packets[0].packet.rows[0];
  row.proposal.citations = [];
  row.proposal.fixParts = [{ partNumber: 'fake' }];
  row.proposal.description += ' 0+ owners have reported this issue.';
  const errors = validateMakeCoverage(snapshot, packets).errors.join('\n');
  assert.match(errors, /proposal has no citation/);
  assert.match(errors, /introduced commerce/);
  assert.match(errors, /forbidden unknown-owner social proof/);
});
test('packet cannot silently become apply-ready', () => {
  const packets = wrappers();
  packets[0].packet.applicationGate.status = 'approved';
  assert.match(validateMakeCoverage(snapshot, packets).errors.join('\n'), /blocked proposal-only/);
});
