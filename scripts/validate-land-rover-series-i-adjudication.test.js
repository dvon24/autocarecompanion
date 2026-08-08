/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');
const { clone } = require('./land-rover-adjudication-utils');
const { buildPacket, SNAPSHOT } = require('./build-land-rover-series-i-adjudication');
const { validatePacket } = require('./validate-land-rover-series-i-adjudication');

const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));

test('Series I packet passes the full 51-page safety contract', () => {
  assert.deepEqual(validatePacket(buildPacket(snapshot), snapshot), []);
});
test('validator rejects indexed identity drift', () => {
  const packet = buildPacket(snapshot);
  packet.rows[0].proposal.years = [2026];
  assert.ok(validatePacket(packet, snapshot).some((error) => /proposal drift|immutable years/.test(error)));
});
test('validator rejects archives and guessed commerce', () => {
  const packet = buildPacket(snapshot);
  packet.rows[1].proposal.status = 'archived';
  packet.rows[1].proposal.fixParts = [{ partNumber: 'GUESS' }];
  assert.ok(validatePacket(packet, snapshot).some((error) => /proposal drift|publication\/source drift|derived-data\/commerce/.test(error)));
});
test('validator rejects unsafe upgrade advice and promotion of a hold', () => {
  const packet = clone(buildPacket(snapshot));
  packet.rows[2].proposal.solution += ' Fit a disc-brake conversion and DOT 5.';
  packet.rows[2].action = 'rewrite_same_identity';
  const errors = validatePacket(packet, snapshot);
  assert.ok(errors.some((error) => /decision mismatch/.test(error)));
  assert.ok(errors.some((error) => /unsafe prescriptive advice/.test(error)));
});
