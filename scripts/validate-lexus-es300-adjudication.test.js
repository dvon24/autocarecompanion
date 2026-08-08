/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');
const { clone } = require('./lexus-adjudication-utils');
const { ID, SNAPSHOT, buildPacket } = require('./build-lexus-es300-adjudication');
const { validatePacket } = require('./validate-lexus-es300-adjudication');
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));

test('ES300 packet passes the complete one-page safety contract', () => { assert.deepEqual(validatePacket(buildPacket(snapshot), snapshot), []); });
test('validator rejects indexed identity, engine and severity drift', () => { const packet = buildPacket(snapshot); packet.rows[0].proposal.title = 'Changed'; packet.rows[0].proposal.engines = ['Guess']; packet.rows[0].proposal.severity = 'critical'; const errors = validatePacket(packet, snapshot); assert.ok(errors.some((error) => /proposal drift|immutable title/.test(error))); assert.ok(errors.some((error) => /immutable engines/.test(error))); assert.ok(errors.some((error) => /severity/.test(error))); });
test('validator rejects archives and guessed commerce', () => { const packet = buildPacket(snapshot); packet.rows[0].proposal.status = 'archived'; packet.rows[0].proposal.fixParts = [{ oemPartNumber: 'GUESS' }]; assert.ok(validatePacket(packet, snapshot).some((error) => /proposal drift|publication\/source\/severity|derived-data\/commerce/.test(error))); });
test('validator rejects a present-day free warranty promise', () => { const packet = buildPacket(snapshot); packet.rows[0].proposal.solution += ' This is a free repair covered under the Toyota sludge warranty.'; assert.ok(validatePacket(packet, snapshot).some((error) => /unsupported prescription/.test(error))); });
test('validator rejects unsafe flush and viscosity instructions', () => { const packet = clone(buildPacket(snapshot)); const row = packet.rows.find((item) => item.id === ID); row.proposal.solution += ' Use a chemical flush every 1,000 miles and switch to 5W-30.'; assert.ok(validatePacket(packet, snapshot).some((error) => /unsupported prescription/.test(error))); });
