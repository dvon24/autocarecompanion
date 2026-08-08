/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');
const { clone } = require('./lexus-adjudication-utils');
const { IDS, SNAPSHOT, buildPacket } = require('./build-lexus-is-adjudication');
const { validatePacket } = require('./validate-lexus-is-adjudication');
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));

test('IS packet passes the full 11-page safety contract', () => { assert.deepEqual(validatePacket(buildPacket(snapshot), snapshot), []); });
test('validator rejects indexed identity, engine and severity drift', () => {
  const packet = buildPacket(snapshot);
  packet.rows[0].proposal.title = 'Changed';
  packet.rows[0].proposal.engines = ['Guess'];
  packet.rows[0].proposal.severity = 'critical';
  const errors = validatePacket(packet, snapshot);
  assert.ok(errors.some((error) => /proposal drift|immutable title/.test(error)));
  assert.ok(errors.some((error) => /immutable engines/.test(error)));
  assert.ok(errors.some((error) => /severity/.test(error)));
});
test('validator rejects archives, guessed parts and search commerce', () => {
  const packet = buildPacket(snapshot);
  packet.rows[1].proposal.status = 'archived';
  packet.rows[1].proposal.fixParts = [{ oemPartNumber: 'GUESS', url: 'https://www.amazon.com/s?k=guess' }];
  assert.ok(validatePacket(packet, snapshot).some((error) => /proposal drift|publication\/source\/severity|derived-data\/commerce|search commerce/.test(error)));
});
test('validator rejects unsupported carbon and transmission prescriptions', () => {
  const packet = clone(buildPacket(snapshot));
  packet.rows.find((item) => item.id === IDS.carbon).proposal.solution += ' Perform walnut blasting every 40,000 miles and install a catch can.';
  packet.rows.find((item) => item.id === IDS.transmission).proposal.solution += ' Reflash the transmission and replace the valve body.';
  const errors = validatePacket(packet, snapshot);
  assert.ok(errors.filter((error) => /unsupported prescription/.test(error)).length >= 2);
});
test('validator rejects guessed brake and dashboard repairs', () => {
  const packet = clone(buildPacket(snapshot));
  packet.rows.find((item) => item.id === IDS.brake).proposal.solution += ' Resurface the rotors and install revised brake pads.';
  packet.rows.find((item) => item.id === IDS.dashboard).proposal.solution += ' Replace the dashboard for free under ZE7.';
  const errors = validatePacket(packet, snapshot);
  assert.ok(errors.filter((error) => /unsupported prescription/.test(error)).length >= 2);
});
