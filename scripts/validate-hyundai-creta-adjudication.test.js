/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { validatePacket } = require('./validate-hyundai-creta-adjudication');

const ROOT = path.resolve(__dirname, '..');
const packet = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'known-issue-hyundai-creta-adjudication-2026-08-06.json'), 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', '_hyundai-deeplink-snapshot-2026-08-06.json'), 'utf8'));

test('Creta packet passes the complete proposal-only safety contract', () => { assert.deepEqual(validatePacket(packet, snapshot, packet.source.snapshotSha256), []); });
test('all four Creta holds remain byte-for-byte frozen', () => { const holds = packet.rows.filter((row) => row.action === 'keep_published_pending_source'); assert.equal(holds.length, 4); for (const row of holds) { assert.equal(row.beforeSha256, row.proposalSha256, row.id); assert.deepEqual(row.changedFields, [], row.id); } });
test('both Creta rewrites remain published and commerce-free', () => { const rewrites = packet.rows.filter((row) => row.action === 'rewrite_same_identity'); assert.equal(rewrites.length, 2); for (const row of rewrites) { assert.equal(row.proposal.status, 'published', row.id); assert.deepEqual(row.proposal.trims, [], row.id); assert.deepEqual(row.proposal.engines, [], row.id); assert.deepEqual(row.proposal.fixParts, [], row.id); assert.equal(row.proposal.estimatedCostLow, null, row.id); assert.equal(row.proposal.estimatedCostHigh, null, row.id); } });
test('packet covers every frozen Creta ID exactly once', () => { const expected = snapshot.records.filter((row) => row.model === 'Creta').map((row) => row.id).sort(); const actual = packet.rows.map((row) => row.id).sort(); assert.deepEqual(actual, expected); assert.equal(new Set(actual).size, 6); });
test('India recall rewrite retains only registry-supported scope', () => { const row = packet.rows.find((item) => item.id.includes('electronic-oil-pump')); assert.match(row.proposal.description, /7,698/); assert.match(row.proposal.description, /February 13 through June 6, 2023/); assert.equal(row.proposal.symptoms.length, 1); assert.doesNotMatch(row.proposal.description, /warning light|hesitation|harsh engagement|hydraulic pressure/i); });
