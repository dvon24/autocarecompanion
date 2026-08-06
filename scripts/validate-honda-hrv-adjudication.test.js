/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { IDS, MISMATCH_SOURCES, REWRITE_CARDS, SOURCES, fullRecord, hashValue } = require('./build-honda-hrv-adjudication');
const { validatePacket } = require('./validate-honda-hrv-adjudication');
const ROOT = path.resolve(__dirname, '..');
const PACKET = path.join(ROOT, 'data', 'known-issue-honda-hrv-adjudication-2026-08-06.json');
const SNAPSHOT = path.join(ROOT, 'data', '_honda-deeplink-snapshot-2026-08-05.json');
function fixture() { return { packet: JSON.parse(fs.readFileSync(PACKET, 'utf8')), snapshot: JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')) }; }

test('valid HR-V packet passes every invariant', () => { const { packet, snapshot } = fixture(); assert.deepEqual(validatePacket(packet, snapshot), []); });
test('all eight source-gap rows remain byte-for-byte frozen', () => {
  const { packet, snapshot } = fixture(); const sourceById = new Map(snapshot.records.filter((row) => row.model === 'HR-V').map((row) => [row.id, row]));
  const keeps = packet.rows.filter((row) => row.action === 'keep_published_pending_source'); assert.equal(keeps.length, 8);
  for (const row of keeps) { const frozen = fullRecord(sourceById.get(row.id)); assert.deepEqual(row.before, frozen); assert.deepEqual(row.proposal, frozen); assert.equal(row.beforeSha256, hashValue(frozen)); assert.equal(row.proposalSha256, row.beforeSha256); assert.deepEqual(row.changedFields, []); }
});
test('seven same-identity rewrites use exact scopes and contain no commerce', () => {
  const { packet } = fixture(); const rewrites = packet.rows.filter((row) => row.action === 'rewrite_same_identity'); assert.equal(rewrites.length, 7);
  for (const row of rewrites) { assert.deepEqual(row.proposal.years, REWRITE_CARDS[row.id].years); assert.deepEqual(row.proposal.trims, []); assert.deepEqual(row.proposal.engines, []); assert.deepEqual(row.proposal.communityRecommendations, []); assert.deepEqual(row.proposal.fixParts, []); assert.equal(row.proposal.estimatedCostLow, null); assert.equal(row.proposal.estimatedCostHigh, null); }
  assert.deepEqual(packet.rows.find((row) => row.id === IDS.rearCamera).proposal.years, [2019, 2020, 2021, 2022]);
  assert.equal(packet.rows.find((row) => row.id === IDS.rearCamera).proposal.citations[0].url, SOURCES.rearCamera);
  assert.deepEqual(packet.rows.find((row) => row.id === IDS.steering).proposal.years, [2023, 2024, 2025]);
});
test('false bulletin identities are exposed without mutating their rows', () => {
  const { packet } = fixture(); const info = packet.rows.find((row) => row.id === IDS.infotainment); const oil = packet.rows.find((row) => row.id === IDS.oilLeaks);
  assert.equal(info.evidence[0].url, MISMATCH_SOURCES.bulletin23010); assert.match(info.evidence[0].observation, /does not cover HR-V infotainment/i);
  assert.equal(oil.evidence[0].url, MISMATCH_SOURCES.bulletin23017); assert.match(oil.evidence[0].observation, /does not cover HR-V oil leakage/i);
});
test('validator rejects mutation, archival, invented applicability and commerce', () => {
  const first = fixture(); const keep = first.packet.rows.find((row) => row.id === IDS.doorLock); keep.proposal.title = 'mutated'; keep.proposalSha256 = hashValue(keep.proposal); assert.ok(validatePacket(first.packet, first.snapshot).some((error) => error.includes('keep changed content')));
  const second = fixture(); const rewrite = second.packet.rows.find((row) => row.id === IDS.cvt); rewrite.proposal.status = 'archived'; rewrite.proposalSha256 = hashValue(rewrite.proposal); assert.ok(validatePacket(second.packet, second.snapshot).some((error) => error.includes('identity/status drift')));
  const third = fixture(); const seat = third.packet.rows.find((row) => row.id === IDS.seatBelt); seat.proposal.trims = ['Sport']; seat.proposalSha256 = hashValue(seat.proposal); assert.ok(validatePacket(third.packet, third.snapshot).some((error) => error.includes('invented applicability')));
  const fourth = fixture(); const glass = fourth.packet.rows.find((row) => row.id === IDS.rearWindow); glass.proposal.fixParts = [{ name: 'glass' }]; glass.proposalSha256 = hashValue(glass.proposal); assert.ok(validatePacket(fourth.packet, fourth.snapshot).some((error) => error.includes('contains commerce')));
});
