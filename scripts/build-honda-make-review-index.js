/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { diffFields, fullRecord, hashValue } = require('./build-honda-adjudication');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data', '_honda-deeplink-snapshot-2026-08-05.json');
const OUTPUT = path.join(ROOT, 'data', 'known-issue-honda-make-review-index-2026-08-06.json');
const MODEL_PACKETS = [
  'known-issue-honda-accord-adjudication-2026-08-05.json',
  'known-issue-honda-city-adjudication-2026-08-06.json',
  'known-issue-honda-civic-adjudication-2026-08-06.json',
  'known-issue-honda-clarity-adjudication-2026-08-06.json',
  'known-issue-honda-crosstour-adjudication-2026-08-06.json',
  'known-issue-honda-crv-adjudication-2026-08-06.json',
  'known-issue-honda-crz-adjudication-2026-08-06.json',
  'known-issue-honda-delsol-adjudication-2026-08-06.json',
  'known-issue-honda-element-adjudication-2026-08-06.json',
  'known-issue-honda-fit-adjudication-2026-08-06.json',
  'known-issue-honda-hrv-adjudication-2026-08-06.json',
  'known-issue-honda-insight-adjudication-2026-08-06.json',
  'known-issue-honda-nsx-adjudication-2026-08-06.json',
  'known-issue-honda-odyssey-adjudication-2026-08-06.json',
  'known-issue-honda-passport-adjudication-2026-08-06.json',
  'known-issue-honda-pilot-adjudication-2026-08-06.json',
  'known-issue-honda-prelude-adjudication-2026-08-06.json',
  'known-issue-honda-prologue-adjudication-2026-08-06.json',
];
const BASE_PACKET = 'known-issue-honda-adjudication-2026-08-05.json';
const BASE_MODELS = new Set(['Ridgeline', 'S2000']);

function normalizedFileHash(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n')).digest('hex');
}
function readPacket(file) {
  const absolute = path.join(ROOT, 'data', file);
  return { file: `data/${file}`, absolute, sha256: normalizedFileHash(absolute), packet: JSON.parse(fs.readFileSync(absolute, 'utf8')) };
}
function countActions(rows) {
  return Object.fromEntries([...new Set(rows.map((row) => row.action))].sort().map((action) => [action, rows.filter((row) => row.action === action).length]));
}

function buildIndex() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  if (snapshot.records.length !== 383 || snapshot.records.some((row) => row.make !== 'Honda')) throw new Error('Honda snapshot inventory drift');
  const snapshotSha256 = normalizedFileHash(SNAPSHOT);
  const snapshotById = new Map(snapshot.records.map((row) => [row.id, row]));
  const selections = MODEL_PACKETS.map((file) => ({ ...readPacket(file), selector: 'all-rows' }));
  selections.push({ ...readPacket(BASE_PACKET), selector: 'Ridgeline-and-S2000-only' });

  const selectedRows = [];
  const packetFiles = [];
  for (const selection of selections) {
    const { file, sha256, packet, selector } = selection;
    if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true) throw new Error(`${file}: safety status mismatch`);
    if (packet.source?.snapshotSha256 !== snapshotSha256 || packet.source?.snapshotHash !== snapshot.snapshotHash) throw new Error(`${file}: frozen snapshot mismatch`);
    const rows = selector === 'all-rows' ? packet.rows : packet.rows.filter((row) => BASE_MODELS.has(row.model));
    if (!rows.length) throw new Error(`${file}: empty selected row set`);
    packetFiles.push({ file, sha256, selector, packetModel: packet.model || null, selectedRowCount: rows.length, selectedActionCounts: countActions(rows) });
    for (const row of rows) {
      const frozen = snapshotById.get(row.id);
      if (!frozen) throw new Error(`${file}: unknown frozen ID ${row.id}`);
      const changedFields = Array.isArray(row.changedFields) ? row.changedFields : diffFields(row.before, row.proposal);
      if (row.beforeSha256 !== hashValue(fullRecord(frozen))) throw new Error(`${file}: before hash drift for ${row.id}`);
      if (row.proposalSha256 !== hashValue(row.proposal)) throw new Error(`${file}: proposal hash drift for ${row.id}`);
      if (row.proposal.status !== 'published' || /^Archived\s*-/i.test(row.proposal.title)) throw new Error(`${file}: prohibited publication change for ${row.id}`);
      if (row.action === 'keep_published_pending_source' && (row.beforeSha256 !== row.proposalSha256 || changedFields.length !== 0)) throw new Error(`${file}: hold row changed for ${row.id}`);
      selectedRows.push({ id: row.id, model: row.model, action: row.action, packetFile: file, beforeSha256: row.beforeSha256, proposalSha256: row.proposalSha256, changedFields });
    }
  }

  const idCounts = new Map();
  for (const row of selectedRows) idCounts.set(row.id, (idCounts.get(row.id) || 0) + 1);
  const duplicateIds = [...idCounts.entries()].filter(([, count]) => count !== 1).map(([id]) => id);
  const missingIds = snapshot.records.filter((row) => !idCounts.has(row.id)).map((row) => row.id);
  const extraIds = selectedRows.filter((row) => !snapshotById.has(row.id)).map((row) => row.id);
  if (selectedRows.length !== 383 || duplicateIds.length || missingIds.length || extraIds.length) throw new Error(`review coverage failed: rows=${selectedRows.length}, duplicate=${duplicateIds.length}, missing=${missingIds.length}, extra=${extraIds.length}`);

  const perModel = Object.values(selectedRows.reduce((acc, row) => {
    if (!acc[row.model]) acc[row.model] = { model: row.model, rowCount: 0, actions: {} };
    acc[row.model].rowCount += 1;
    acc[row.model].actions[row.action] = (acc[row.model].actions[row.action] || 0) + 1;
    return acc;
  }, {})).sort((a, b) => a.model.localeCompare(b.model));
  const summary = { ...countActions(selectedRows), total: selectedRows.length, packetFileCount: packetFiles.length, exactFrozenIdCoverage: true, duplicateIdCount: 0, missingIdCount: 0 };
  const index = {
    schemaVersion: 1, status: 'proposal-only', purpose: 'independent-make-review', requiresIndependentApproval: true,
    generatedOn: '2026-08-06', make: 'Honda', reviewBranch: 'codex/honda-deeplink-audit',
    completionStatement: 'All 383 frozen Honda rows across 20 model labels are represented exactly once in this review index. This file selects the 18 completed model packets plus only the Ridgeline and S2000 rows from the original Honda packet.',
    safetyContract: [
      'This index and every selected packet are proposal-only; they authorize no production write, deployment, cache purge, archive, redirect or slug change.',
      'Every selected proposal remains published and no proposal title begins with Archived -.',
      'Every keep_published_pending_source row is hash-identical to the frozen snapshot.',
      'Independent review must validate identity, model, year, component, source and remedy row by row before any guarded apply manifest is designed.',
      'A source gap, weaker citation or duplicate page is not permission to delete, archive, redirect or substitute a different issue.',
    ],
    source: { snapshotFile: 'data/_honda-deeplink-snapshot-2026-08-05.json', snapshotSha256, snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, frozenRecordCount: snapshot.records.length },
    selectionRules: [
      'Use every row from each named model-specific packet.',
      'Use only Ridgeline and S2000 rows from data/known-issue-honda-adjudication-2026-08-05.json; its other 360 rows are superseded by model-specific packets.',
      'Do not mix proposals from older cohort manifests or production state into this frozen review set.',
    ],
    independentReviewChecklist: [
      'Recompute all packet, before-record and proposal hashes.',
      'Confirm all 383 frozen IDs appear exactly once and all hold rows are byte-for-byte unchanged.',
      'Open every official source and verify model, year, component, symptom, investigation status and remedy against the proposed prose.',
      'Reject any rewrite that changes the indexed issue identity or inherits evidence from another model, component or campaign.',
      'Review duplicate and overlapping pages without removing, redirecting or consolidating them during this evidence pass.',
      'Return an ID-level approve, revise or hold decision list; do not write production.',
    ],
    knownVerificationCaveats: [
      'The City source verifier reached four official manufacturer/government records but central3.to.gov.br rejected the automated fetch for one duplicate government-hosted PDF. Treat that URL as access-blocked, not freshly verified.',
      'Honda techinfo rejected the final automated fetch of the 2006 and 2014 Ridgeline manuals and 2000 S2000 manual. Their packet evidence was recorded earlier, but independent review should reopen all three manually before approval.',
    ],
    summary, perModel, packetFiles, rows: selectedRows,
  };
  return index;
}

function main() {
  const index = buildIndex();
  fs.writeFileSync(OUTPUT, `${JSON.stringify(index, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary: index.summary }, null, 2));
}
if (require.main === module) main();
module.exports = { BASE_MODELS, BASE_PACKET, MODEL_PACKETS, OUTPUT, SNAPSHOT, buildIndex, normalizedFileHash };
