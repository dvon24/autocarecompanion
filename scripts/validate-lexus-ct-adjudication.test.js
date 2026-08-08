/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');
const { clone } = require('./lexus-adjudication-utils');
const { SNAPSHOT, buildPacket } = require('./build-lexus-ct-adjudication');
const { validatePacket } = require('./validate-lexus-ct-adjudication');
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));

test('CT packet passes the full two-page safety contract', () => { assert.deepEqual(validatePacket(buildPacket(snapshot), snapshot), []); });
test('validator rejects indexed identity and severity drift', () => { const packet = buildPacket(snapshot); packet.rows[0].proposal.years = [2026]; packet.rows[0].proposal.severity = 'critical'; const errors = validatePacket(packet, snapshot); assert.ok(errors.some((error) => /proposal drift|immutable years/.test(error))); assert.ok(errors.some((error) => /severity/.test(error))); });
test('validator rejects archives and guessed battery commerce', () => { const packet = buildPacket(snapshot); packet.rows[0].proposal.status = 'archived'; packet.rows[0].proposal.fixParts = [{ component: 'battery', oemPartNumber: 'GUESS' }]; assert.ok(validatePacket(packet, snapshot).some((error) => /proposal drift|publication\/source\/severity|derived-data\/commerce/.test(error))); });
test('validator rejects Prius interchangeability and promotion', () => { const packet = clone(buildPacket(snapshot)); packet.rows[0].proposal.solution += ' Replace the hybrid battery; it is the same as the Prius.'; packet.rows[0].action = 'rewrite_same_identity'; const errors = validatePacket(packet, snapshot); assert.ok(errors.some((error) => /decision mismatch/.test(error))); assert.ok(errors.some((error) => /unsupported prescription/.test(error))); });
