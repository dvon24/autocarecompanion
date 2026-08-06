/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { IDS } = require('./build-hyundai-elantra-adjudication');
const { validatePacket } = require('./validate-hyundai-elantra-adjudication');

const ROOT = path.resolve(__dirname, '..');
const packet = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'known-issue-hyundai-elantra-adjudication-2026-08-06.json'), 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', '_hyundai-deeplink-snapshot-2026-08-06.json'), 'utf8'));
const byId = new Map(packet.rows.map((row) => [row.id, row]));

test('Elantra packet passes the complete proposal-only safety contract', () => { assert.deepEqual(validatePacket(packet, snapshot, packet.source.snapshotSha256), []); });
test('all seventeen Elantra holds remain byte-for-byte frozen', () => { const holds = packet.rows.filter((row) => row.action === 'keep_published_pending_source'); assert.equal(holds.length, 17); for (const row of holds) { assert.equal(row.beforeSha256, row.proposalSha256, row.id); assert.deepEqual(row.changedFields, [], row.id); } });
test('all twelve rewrites remain published and commerce-free', () => { const rewrites = packet.rows.filter((row) => row.action === 'rewrite_same_identity'); assert.equal(rewrites.length, 12); for (const row of rewrites) { assert.equal(row.proposal.status, 'published', row.id); assert.deepEqual(row.proposal.trims, [], row.id); assert.deepEqual(row.proposal.engines, [], row.id); assert.deepEqual(row.proposal.fixParts, [], row.id); assert.deepEqual(row.proposal.communityRecommendations, [], row.id); assert.equal(row.proposal.estimatedCostLow, null, row.id); assert.equal(row.proposal.estimatedCostHigh, null, row.id); } });
test('packet covers every frozen Elantra ID exactly once', () => { const expected = snapshot.records.filter((row) => row.model === 'Elantra').map((row) => row.id).sort(); const actual = packet.rows.map((row) => row.id).sort(); assert.deepEqual(actual, expected); assert.equal(new Set(actual).size, 29); });
test('the two ABS recalls remain separate exact identities', () => { const newer = byId.get(IDS.abs251).proposal; const older = byId.get(IDS.abs188).proposal; assert.match(newer.title, /23V651/); assert.match(newer.description, /brake fluid internally/); assert.match(older.title, /20V061/); assert.match(older.description, /remains energized/); assert.notDeepEqual(newer.years, older.years); });
test('EPS recall and MDPS coupling noise are not blended', () => { const eps = byId.get(IDS.eps).proposal; const coupler = byId.get(IDS.mdps).proposal; assert.deepEqual(eps.years, [2008, 2009, 2010]); assert.match(eps.description, /disable power assist/); assert.match(coupler.description, /does not affect steering control and is not a safety issue/); assert.doesNotMatch(coupler.description + coupler.solution, /loss of assist|C1260|C1604|C1656/i); });
test('misleading 2001 slugs are frozen instead of receiving later campaigns', () => { for (const id of [IDS.brakeSwitch, IDS.coilSpring]) { const row = byId.get(id); assert.equal(row.action, 'keep_published_pending_source'); assert.equal(row.beforeSha256, row.proposalSha256); } });
test('P0128 and paint rewrites retain only exact Hyundai scope', () => { const p0128 = byId.get(IDS.p0128).proposal; assert.deepEqual(p0128.years, [2017]); assert.deepEqual(p0128.dtcCodes, ['P0128']); assert.match(p0128.description, /no drivability issues/i); const paint = byId.get(IDS.paint).proposal; assert.deepEqual(paint.years, [2015, 2016, 2017, 2018]); assert.match(paint.description, /W8 or WW8/); assert.doesNotMatch(paint.description + paint.solution, /Scratch Recovery|\$|1,500|3,000/i); });
test('anti-theft rewrite is gated by ignition equipment and VIN', () => { const theft = byId.get(IDS.theft).proposal; assert.deepEqual(theft.years, Array.from({ length: 12 }, (_, index) => 2011 + index)); assert.match(theft.description, /turn-key/); assert.match(theft.description, /push-button/); assert.match(theft.solution, /VIN/); assert.doesNotMatch(theft.description + theft.solution, /1,000%|USB connector|insurance coverage denied/i); });
