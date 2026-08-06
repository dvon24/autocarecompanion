/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict'); const fs = require('node:fs'); const path = require('node:path'); const test = require('node:test');
const { IDS, SOURCES } = require('./build-hyundai-ioniq-6-adjudication'); const { validatePacket } = require('./validate-hyundai-ioniq-6-adjudication');
const ROOT = path.resolve(__dirname, '..'); const packet = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'known-issue-hyundai-ioniq-6-adjudication-2026-08-06.json'), 'utf8')); const snapshot = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', '_hyundai-deeplink-snapshot-2026-08-06.json'), 'utf8'));

test('Ioniq 6 proposal packet passes the complete safety contract', () => { assert.deepEqual(validatePacket(packet, snapshot, packet.source.snapshotSha256), []); });
test('packet covers every frozen Ioniq 6 ID exactly once', () => { const expected = snapshot.records.filter((row) => row.make === 'Hyundai' && row.model === 'Ioniq 6').map((row) => row.id).sort(); const actual = packet.rows.map((row) => row.id).sort(); assert.deepEqual(actual, expected); assert.equal(new Set(actual).size, 9); });
test('only three exact recall identities are rewritten', () => {
  const rewriteIds = new Set([IDS.chargeDoor, IDS.seatbelt, IDS.iccu]);
  for (const row of packet.rows) { if (rewriteIds.has(row.id)) { assert.equal(row.action, 'rewrite_same_identity'); assert.notEqual(row.beforeSha256, row.proposalSha256); } else { assert.equal(row.action, 'keep_published_pending_source'); assert.equal(row.beforeSha256, row.proposalSha256, row.id); assert.deepEqual(row.changedFields, [], row.id); } }
});
test('all rewrites preserve identity and strip unsupported applicability and commerce', () => {
  for (const id of [IDS.chargeDoor, IDS.seatbelt, IDS.iccu]) { const row = packet.rows.find((item) => item.id === id); assert.equal(row.proposal.title, row.before.title); assert.equal(row.proposal.category, row.before.category); assert.equal(row.proposal.status, 'published'); assert.deepEqual(row.proposal.trims, []); assert.deepEqual(row.proposal.engines, []); assert.deepEqual(row.proposal.fixParts, []); assert.deepEqual(row.proposal.communityRecommendations, []); assert.equal(row.proposal.estimatedCostLow, null); assert.equal(row.proposal.estimatedCostHigh, null); assert.equal(row.proposal.typicalMileageLow, null); assert.equal(row.proposal.typicalMileageHigh, null); assert.equal(row.proposal.humanApproved, false); }
});
test('charge-port-door rewrite follows recall 25V-606', () => {
  const row = packet.rows.find((item) => item.id === IDS.chargeDoor); assert.deepEqual(row.proposal.years, [2023, 2024, 2025]); assert.deepEqual(row.proposal.citations.map((item) => item.url), [SOURCES.chargeDoor]); assert.match(row.proposal.solution, /25V-606/); assert.doesNotMatch(`${row.proposal.description} ${row.proposal.solution}`, /improper adhesion during assembly|highway air pressure|normal charging use/i);
});
test('seat-belt rewrite corrects the campaign to 26V-218', () => {
  const row = packet.rows.find((item) => item.id === IDS.seatbelt); assert.deepEqual(row.proposal.years, [2023, 2024, 2025]); assert.deepEqual(row.proposal.citations.map((item) => item.url), [SOURCES.seatbelt]); assert.match(row.proposal.solution, /26V-218/); assert.doesNotMatch(`${row.proposal.description} ${row.proposal.solution}`, /25V797|25V-797|36,000/i);
});
test('ICCU rewrite follows recall 24V-868 without secondary warning claims', () => {
  const row = packet.rows.find((item) => item.id === IDS.iccu); assert.deepEqual(row.proposal.years, [2023, 2024, 2025]); assert.deepEqual(row.proposal.citations.map((item) => item.url), [SOURCES.iccu]); assert.deepEqual(row.proposal.dtcCodes, []); assert.match(row.proposal.solution, /24V-868/); assert.doesNotMatch(`${row.proposal.description} ${row.proposal.solution} ${row.proposal.symptoms.join(' ')}`, /Check Electric Vehicle System|turtle|tow|software-only remedy did not fully/i);
});
