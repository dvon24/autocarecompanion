/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');
const { clone } = require('./lexus-adjudication-utils');
const { IDS, SNAPSHOT, buildPacket } = require('./build-lexus-gx-adjudication');
const { validatePacket } = require('./validate-lexus-gx-adjudication');
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));

test('GX packet passes the full three-page safety contract', () => { assert.deepEqual(validatePacket(buildPacket(snapshot), snapshot), []); });
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
test('validator rejects archives and guessed commerce', () => {
  const packet = buildPacket(snapshot);
  packet.rows[1].proposal.status = 'archived';
  packet.rows[1].proposal.fixParts = [{ oemPartNumber: 'GUESS' }];
  assert.ok(validatePacket(packet, snapshot).some((error) => /proposal drift|publication\/source\/severity|derived-data\/commerce/.test(error)));
});
test('validator rejects hydraulic opening and KDSS deletion advice', () => {
  const packet = clone(buildPacket(snapshot));
  const row = packet.rows.find((item) => item.id === IDS.kdss);
  row.proposal.solution += ' Refill and bleed KDSS, replace the hydraulic actuator, then disconnect KDSS and install conventional sway bars.';
  assert.ok(validatePacket(packet, snapshot).some((error) => /unsupported prescription/.test(error)));
});
test('validator rejects center-differential replacement and emissions bypass', () => {
  const packet = clone(buildPacket(snapshot));
  packet.rows.find((item) => item.id === IDS.centerDifferential).proposal.solution += ' Replace the differential lock actuator.';
  packet.rows.find((item) => item.id === IDS.secondaryAir).proposal.solution += ' Bypass the emissions system and replace the air pump.';
  const errors = validatePacket(packet, snapshot);
  assert.ok(errors.filter((error) => /unsupported prescription/.test(error)).length >= 2);
});
