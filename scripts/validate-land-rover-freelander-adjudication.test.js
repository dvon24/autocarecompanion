/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');
const { clone } = require('./land-rover-adjudication-utils');
const { buildPacket, SNAPSHOT } = require('./build-land-rover-freelander-adjudication');
const { validatePacket } = require('./validate-land-rover-freelander-adjudication');

const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));

test('Freelander packet passes the full safety contract', () => {
  assert.deepEqual(validatePacket(buildPacket(snapshot), snapshot), []);
});

test('validator rejects indexed identity drift', () => {
  const packet = buildPacket(snapshot);
  packet.rows[0].proposal.title = 'Different issue';
  assert.ok(validatePacket(packet, snapshot).some((error) => /proposal drift|immutable title/.test(error)));
});

test('validator rejects archives and guessed commerce', () => {
  const packet = buildPacket(snapshot);
  packet.rows[0].proposal.status = 'archived';
  packet.rows[0].proposal.fixParts = [{ partNumber: 'GUESS', name: 'Pump' }];
  assert.ok(validatePacket(packet, snapshot).some((error) => /proposal drift|publication\/source drift|derived-data\/commerce/.test(error)));
});

test('validator rejects applying a blocked row', () => {
  const packet = clone(buildPacket(snapshot));
  packet.rows[0].action = 'rewrite_same_identity';
  assert.ok(validatePacket(packet, snapshot).some((error) => /decision mismatch/.test(error)));
});
