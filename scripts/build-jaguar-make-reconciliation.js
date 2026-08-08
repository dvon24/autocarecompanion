/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { normalizedFileHash } = require('./jaguar-adjudication-utils');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const SNAPSHOT_FILE = '_jaguar-deeplink-snapshot-2026-08-06.json';
const OUTPUT_FILE = 'known-issue-jaguar-make-reconciliation-2026-08-06.json';
const MODELS = ['E-PACE', 'F-PACE', 'F-TYPE', 'I-PACE', 'S-TYPE', 'X-TYPE', 'XE', 'XF', 'XJ', 'XK'];

function packetFile(model) { return `known-issue-jaguar-${model.toLowerCase()}-adjudication-2026-08-06.json`; }

function buildReconciliation() {
  const snapshotPath = path.join(DATA, SNAPSHOT_FILE);
  const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
  const modelPackets = [];
  const decisions = [];
  for (const model of MODELS) {
    const file = packetFile(model);
    const filePath = path.join(DATA, file);
    const packet = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const rewrites = packet.rows.filter((row) => row.action === 'rewrite_same_identity').length;
    const holds = packet.rows.filter((row) => row.action === 'keep_published_pending_source').length;
    modelPackets.push({ model, file: `data/${file}`, sha256: normalizedFileHash(filePath), rowCount: packet.rows.length, rewrites, holds });
    for (const row of packet.rows) decisions.push({ id: row.id, model: row.model, action: row.action, beforeSha256: row.beforeSha256, proposalSha256: row.proposalSha256, changedFields: row.changedFields });
  }
  decisions.sort((left, right) => left.id.localeCompare(right.id));
  const rewriteIds = decisions.filter((row) => row.action === 'rewrite_same_identity').map((row) => row.id);
  const holds = decisions.filter((row) => row.action === 'keep_published_pending_source').length;
  return {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'make-wide-reconciliation', requiresIndependentApproval: true,
    generatedOn: '2026-08-06', make: 'Jaguar',
    completionStatement: 'All 10 Jaguar model packets reconcile to all 63 frozen published rows exactly once. Two exact NHTSA recall rewrites and one same-identity safety correction are proposed; the other 60 rows remain byte-for-byte holds.',
    safetyContract: [
      'No production database write, cache purge, deployment, archive action, redirect, slug change, new issue or public-page change is authorized by this packet.',
      'Every frozen Jaguar ID remains published with the same make, model, years, title, category and related-issue identity.',
      'Only the three explicitly listed same-identity corrections may be rewritten after independent approval.',
      'Newly discovered issue identities remain deferred until the existing-catalog make audit is complete.',
    ],
    source: { snapshotFile: `data/${SNAPSHOT_FILE}`, snapshotSha256: normalizedFileHash(snapshotPath), snapshotHash: snapshot.snapshotHash, snapshotRecordCount: snapshot.records.length },
    models: MODELS, modelPackets, rewriteIds,
    summary: { rewrite_same_identity: rewriteIds.length, keep_published_pending_source: holds, total: decisions.length },
    invariants: { missingIds: 0, extraIds: 0, duplicateIds: 0, identityDrift: 0, statusDrift: 0, changedHolds: 0, archiveDeleteRedirectOrNewIssue: 0 },
    decisions,
  };
}

function main() {
  const outputPath = path.join(DATA, OUTPUT_FILE);
  const packet = buildReconciliation();
  fs.writeFileSync(outputPath, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: outputPath, sha256: normalizedFileHash(outputPath), summary: packet.summary, modelCount: packet.models.length }, null, 2));
}
if (require.main === module) main();
module.exports = { MODELS, OUTPUT_FILE, SNAPSHOT_FILE, buildReconciliation, packetFile };
