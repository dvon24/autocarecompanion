/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const {
  ACTION_BY_ID,
  EXCLUDED_CITATION_URLS_BY_ID,
  PREFERRED_COMPLAINT_ODIS,
  REDIRECTS,
  fullRecord,
  hashValue,
} = require('./build-toyota-hold-adjudication');
const { validatePacket } = require('./validate-toyota-hold-adjudication');

const packetFile = path.resolve(__dirname, '..', 'data', 'known-issue-toyota-hold-adjudication-2026-08-05.json');
const reviewFile = path.resolve(__dirname, '..', 'data', '_toyota-hold-review-packet.json');
const complaintsFile = path.resolve(__dirname, '..', 'data', '_toyota-hold-nhtsa-complaint-candidates.json');

test('Toyota action map covers the entire 91-row hold without a default destructive action', () => {
  const review = JSON.parse(fs.readFileSync(reviewFile, 'utf8'));
  assert.equal(ACTION_BY_ID.size, 91);
  assert.deepEqual([...ACTION_BY_ID.keys()].sort(), review.rows.map((row) => row.id).sort());
  const counts = Object.fromEntries([...ACTION_BY_ID.values()].map((action) => [action, 0]));
  for (const action of ACTION_BY_ID.values()) counts[action] += 1;
  assert.deepEqual(counts, {
    keep_audited_correction: 2,
    rewrite_and_republish: 68,
    redirect_duplicate: 6,
    uphold_archive_evidence_defect: 15,
  });
});

test('generated Toyota packet passes frozen-source, publication and redirect gates', () => {
  const packet = JSON.parse(fs.readFileSync(packetFile, 'utf8'));
  const review = JSON.parse(fs.readFileSync(reviewFile, 'utf8'));
  const complaints = JSON.parse(fs.readFileSync(complaintsFile, 'utf8'));
  assert.deepEqual(validatePacket(packet, review, complaints), []);
  assert.deepEqual(packet.summary, {
    keep_audited_correction: 2,
    rewrite_and_republish: 68,
    redirect_duplicate: 6,
    uphold_archive_evidence_defect: 15,
    total: 91,
  });
});

test('all 68 republish proposals are visible, sourced, no-commerce and free of archived labeling', () => {
  const packet = JSON.parse(fs.readFileSync(packetFile, 'utf8'));
  const rows = packet.rows.filter((row) => row.action === 'rewrite_and_republish');
  assert.equal(rows.length, 68);
  for (const row of rows) {
    assert.equal(row.proposal.status, 'published', row.id);
    assert.doesNotMatch(`${row.proposal.title} ${row.proposal.description} ${row.proposal.solution}`, /\barchived\b/i, row.id);
    assert.deepEqual(row.proposal.trims, [], row.id);
    assert.deepEqual(row.proposal.engines, [], row.id);
    assert.deepEqual(row.proposal.fixParts, [], row.id);
    assert.deepEqual(row.proposal.communityRecommendations, [], row.id);
    assert.equal(row.proposal.estimatedCostLow, null, row.id);
    assert.equal(row.proposal.estimatedCostHigh, null, row.id);
    assert.equal(row.proposal.typicalMileageLow, null, row.id);
    assert.equal(row.proposal.typicalMileageHigh, null, row.id);
    assert.equal(row.proposal.humanApproved, false, row.id);
    assert.ok(row.proposal.citations.length > 0, row.id);
    assert.equal(JSON.stringify(row.proposal).includes('amazon.com/s?'), false, row.id);
  }
});

test('six retired duplicates have explicit canonical redirect targets', () => {
  const packet = JSON.parse(fs.readFileSync(packetFile, 'utf8'));
  const redirects = packet.rows.filter((row) => row.action === 'redirect_duplicate');
  assert.equal(redirects.length, 6);
  assert.deepEqual(
    Object.fromEntries(redirects.map((row) => [row.id, row.redirectTargetId])),
    REDIRECTS,
  );
  for (const row of redirects) {
    assert.notEqual(row.id, row.redirectTargetId, row.id);
    assert.equal(row.proposal.status, 'archived', row.id);
  }
});

test('known false or unrelated source URLs cannot leak into republished citations', () => {
  const packet = JSON.parse(fs.readFileSync(packetFile, 'utf8'));
  for (const [id, urls] of Object.entries(EXCLUDED_CITATION_URLS_BY_ID)) {
    const row = packet.rows.find((candidate) => candidate.id === id);
    const proposalUrls = row.proposal.citations.map((citation) => citation.url);
    for (const url of urls) assert.equal(proposalUrls.includes(url), false, `${id}: ${url}`);
  }
});

test('selected NHTSA owner-report evidence remains bound to the frozen research output', () => {
  const packet = JSON.parse(fs.readFileSync(packetFile, 'utf8'));
  const complaints = JSON.parse(fs.readFileSync(complaintsFile, 'utf8'));
  const complaintById = new Map(complaints.rows.map((row) => [row.id, row]));
  for (const [id, odiNumbers] of Object.entries(PREFERRED_COMPLAINT_ODIS)) {
    const packetRow = packet.rows.find((row) => row.id === id);
    const evidence = complaintById.get(id);
    const available = new Set(evidence.samples.map((sample) => sample.odiNumber));
    for (const odi of odiNumbers) {
      assert.ok(available.has(odi), `${id}: missing ODI ${odi}`);
      assert.match(JSON.stringify(packetRow.evidence), new RegExp(String(odi)), `${id}: packet evidence missing ODI ${odi}`);
    }
  }
});

test('every before hash binds to the frozen pre-audit record', () => {
  const packet = JSON.parse(fs.readFileSync(packetFile, 'utf8'));
  const review = JSON.parse(fs.readFileSync(reviewFile, 'utf8'));
  const reviewById = new Map(review.rows.map((row) => [row.id, row]));
  for (const row of packet.rows) {
    assert.equal(row.beforeSha256, hashValue(fullRecord(reviewById.get(row.id).preAudit)), row.id);
  }
});
