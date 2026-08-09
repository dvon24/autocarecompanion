/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const {
  SNAPSHOT,
  loadPackets,
  validateMakeCoverage,
} = require('./validate-mercedes-benz-make-coverage');

const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
const frozenPackets = loadPackets();
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function wrappers() { return clone(frozenPackets); }

test('all 253 Mercedes-Benz rows are covered by 32 packets', () => {
  const result = validateMakeCoverage(snapshot, wrappers());
  assert.equal(result.passed, true);
  assert.equal(result.packetCount, 32);
  assert.equal(result.snapshotRows, 253);
  assert.equal(result.coveredRows, 253);
  assert.deepEqual(result.missingIds, []);
  assert.equal(result.uncitedProposalCount, 0);
});

test('missing Mercedes-Maybach packet exposes all three missing rows', () => {
  const packets = wrappers().filter((wrapper) => !wrapper.file.includes('mercedes-maybach-s-class'));
  const result = validateMakeCoverage(snapshot, packets);
  assert.equal(result.passed, false);
  assert.equal(result.missingIds.length, 3);
  assert.ok(result.missingIds.every((id) => id.startsWith('mercedes-maybach-s-class-')));
});

test('duplicate row cannot silently inflate coverage', () => {
  const packets = wrappers();
  packets[1].packet.rows.push(clone(packets[0].packet.rows[0]));
  assert.match(validateMakeCoverage(snapshot, packets).errors.join('\n'), /duplicate coverage/);
});

test('identity and severity drift are rejected', () => {
  const packets = wrappers();
  const row = packets[0].packet.rows[0];
  row.proposal.title += ' changed';
  row.proposal.severity = 'critical';
  const errors = validateMakeCoverage(snapshot, packets).errors.join('\n');
  assert.match(errors, /immutable title changed/);
  assert.match(errors, /immutable severity changed/);
  assert.match(errors, /non-canonical severity critical/);
});

test('uncited proposal and unknown-owner social proof are rejected', () => {
  const packets = wrappers();
  const row = packets[0].packet.rows[0];
  row.proposal.citations = [];
  row.proposal.description += ' 0+ owners have reported this issue.';
  const errors = validateMakeCoverage(snapshot, packets).errors.join('\n');
  assert.match(errors, /proposal has no citation/);
  assert.match(errors, /forbidden unknown-owner social proof/);
});
