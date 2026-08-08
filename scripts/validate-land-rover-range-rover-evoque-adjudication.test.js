/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');
const { clone } = require('./land-rover-adjudication-utils');
const { buildPacket, SNAPSHOT } = require('./build-land-rover-range-rover-evoque-adjudication');
const { validatePacket } = require('./validate-land-rover-range-rover-evoque-adjudication');

const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));

test('Evoque packet passes the full safety contract', () => {
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
  packet.rows[1].proposal.communityRecommendations = [{ type: 'part', partNumber: 'GUESS' }];
  assert.ok(validatePacket(packet, snapshot).some((error) => /proposal drift|publication\/source drift|derived-data\/commerce/.test(error)));
});

test('validator rejects promoting a held row', () => {
  const packet = clone(buildPacket(snapshot));
  packet.rows.find((row) => row.action === 'targeted_safety_cleanup_pending_source').action = 'rewrite_same_identity';
  assert.ok(validatePacket(packet, snapshot).some((error) => /decision mismatch/.test(error)));
});
