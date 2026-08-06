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
test('all five Creta holds remain byte-for-byte frozen', () => { const holds = packet.rows.filter((row) => row.action === 'keep_published_pending_source'); assert.equal(holds.length, 5); for (const row of holds) { assert.equal(row.beforeSha256, row.proposalSha256, row.id); assert.deepEqual(row.changedFields, [], row.id); } });
test('the one Creta rewrite remains published, identity-stable and commerce-free', () => { const rewrites = packet.rows.filter((row) => row.action === 'rewrite_same_identity'); assert.equal(rewrites.length, 1); for (const row of rewrites) { assert.equal(row.proposal.status, 'published', row.id); assert.equal(row.proposal.title, row.before.title, row.id); assert.equal(row.proposal.category, row.before.category, row.id); assert.deepEqual(row.proposal.trims, [], row.id); assert.deepEqual(row.proposal.engines, [], row.id); assert.deepEqual(row.proposal.fixParts, [], row.id); assert.equal(row.proposal.estimatedCostLow, null, row.id); assert.equal(row.proposal.estimatedCostHigh, null, row.id); } });
test('packet covers every frozen Creta ID exactly once', () => { const expected = snapshot.records.filter((row) => row.model === 'Creta').map((row) => row.id).sort(); const actual = packet.rows.map((row) => row.id).sort(); assert.deepEqual(actual, expected); assert.equal(new Set(actual).size, 6); });
test('India oil-pump row is frozen because generic pages do not prove a remedy', () => { const row = packet.rows.find((item) => item.id.includes('electronic-oil-pump')); assert.equal(row.action, 'keep_published_pending_source'); assert.equal(row.beforeSha256, row.proposalSha256); assert.deepEqual(row.changedFields, []); });
