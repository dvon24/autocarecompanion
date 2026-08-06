/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { validatePacket } = require('./validate-hyundai-casper-adjudication');

const ROOT = path.resolve(__dirname, '..');
const packet = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'known-issue-hyundai-casper-adjudication-2026-08-06.json'), 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', '_hyundai-deeplink-snapshot-2026-08-06.json'), 'utf8'));

test('Casper hold packet passes the complete safety contract', () => { assert.deepEqual(validatePacket(packet, snapshot, packet.source.snapshotSha256), []); });
test('all six Casper rows remain byte-for-byte frozen', () => { assert.equal(packet.rows.length, 6); for (const row of packet.rows) { assert.equal(row.action, 'keep_published_pending_source'); assert.equal(row.beforeSha256, row.proposalSha256, row.id); assert.deepEqual(row.changedFields, [], row.id); } });
test('packet covers every frozen Casper ID exactly once', () => { const expected = snapshot.records.filter((row) => row.model === 'Casper').map((row) => row.id).sort(); const actual = packet.rows.map((row) => row.id).sort(); assert.deepEqual(actual, expected); assert.equal(new Set(actual).size, 6); });
test('POST-only registry evidence never replaces frozen public citations', () => { for (const row of packet.rows) assert.deepEqual(row.proposal.citations, row.before.citations, row.id); assert.equal(packet.officialRegistry.coolantHub.facts.affectedCount, 2245); assert.equal(packet.officialRegistry.iccu.facts.affectedCount, 13587); assert.equal(packet.officialRegistry.threeWayValve.facts.affectedCount, 18961); });
