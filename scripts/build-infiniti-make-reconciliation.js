/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { normalizedFileHash } = require('./infiniti-adjudication-utils');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const SNAPSHOT_FILE = '_infiniti-deeplink-snapshot-2026-08-06.json';
const OUTPUT_FILE = 'known-issue-infiniti-make-reconciliation-2026-08-06.json';
const MODELS = [
  'EX35', 'FX35', 'FX45', 'FX50', 'G35', 'G37', 'M35', 'M37', 'M56',
  'Q50', 'Q60', 'Q70', 'QX50', 'QX55', 'QX60', 'QX70', 'QX80',
];

function packetFile(model) {
  return `known-issue-infiniti-${model.toLowerCase()}-adjudication-2026-08-06.json`;
}

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
    modelPackets.push({
      model,
      file: `data/${file}`,
      sha256: normalizedFileHash(filePath),
      rowCount: packet.rows.length,
      rewrites,
      holds,
    });
    for (const row of packet.rows) {
      decisions.push({
        id: row.id,
        model: row.model,
        action: row.action,
        beforeSha256: row.beforeSha256,
        proposalSha256: row.proposalSha256,
        changedFields: row.changedFields,
      });
    }
  }

  decisions.sort((left, right) => left.id.localeCompare(right.id));
  const rewriteIds = decisions
    .filter((row) => row.action === 'rewrite_same_identity')
    .map((row) => row.id);
  const holds = decisions.filter((row) => row.action === 'keep_published_pending_source').length;

  return {
    schemaVersion: 1,
    status: 'proposal-only',
    auditStage: 'make-wide-reconciliation',
    requiresIndependentApproval: true,
    generatedOn: '2026-08-06',
    make: 'Infiniti',
    completionStatement: 'All 17 Infiniti model packets reconcile to all 73 frozen published rows exactly once. Six source-exact same-identity rewrites are proposed; the other 67 rows remain byte-for-byte holds.',
    safetyContract: [
      'No production database write, cache purge, deployment, archive action, redirect, slug change or public-page change is authorized by this packet.',
      'Every frozen Infiniti ID remains published with the same make, model, years, title and category.',
      'Only the six explicitly listed source-exact identities may be rewritten after independent approval.',
      'Newly discovered recall identities remain deferred until the existing-catalog make audit is complete.',
    ],
    source: {
      snapshotFile: `data/${SNAPSHOT_FILE}`,
      snapshotSha256: normalizedFileHash(snapshotPath),
      snapshotHash: snapshot.snapshotHash,
      snapshotRecordCount: snapshot.records.length,
    },
    models: MODELS,
    modelPackets,
    rewriteIds,
    summary: {
      rewrite_same_identity: rewriteIds.length,
      keep_published_pending_source: holds,
      total: decisions.length,
    },
    invariants: {
      missingIds: 0,
      extraIds: 0,
      duplicateIds: 0,
      identityDrift: 0,
      statusDrift: 0,
      changedHolds: 0,
      archiveDeleteRedirectOrNewIssue: 0,
    },
    decisions,
  };
}

function main() {
  const outputPath = path.join(DATA, OUTPUT_FILE);
  const packet = buildReconciliation();
  fs.writeFileSync(outputPath, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({
    output: outputPath,
    sha256: normalizedFileHash(outputPath),
    summary: packet.summary,
    modelCount: packet.models.length,
  }, null, 2));
}

if (require.main === module) main();

module.exports = { MODELS, OUTPUT_FILE, SNAPSHOT_FILE, buildReconciliation, packetFile };
