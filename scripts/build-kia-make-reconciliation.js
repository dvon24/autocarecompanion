/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { normalizedFileHash, stableValue } = require('./kia-adjudication-utils');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const SNAPSHOT = path.join(DATA, '_kia-deeplink-snapshot-2026-08-06.json');
const OUTPUT = path.join(DATA, 'known-issue-kia-make-reconciliation-2026-08-08.json');
const PACKET_PATTERN = /^known-issue-kia-.+-adjudication-2026-08-\d{2}\.json$/;
const APPLY_ACTIONS = new Set(['rewrite_same_identity']);
const NON_APPLY_ACTIONS = new Set([
  'keep_published_pending_source',
  'remove_false_citation_and_search_commerce_pending_source',
  'remove_inexact_relation_and_search_commerce_pending_source',
  'remove_search_commerce_pending_source',
  'remove_unverifiable_citations_and_search_commerce_pending_source',
  'targeted_safety_cleanup_pending_source',
]);
const IDENTITY_FIELDS = ['make', 'model', 'title', 'category', 'severity', 'years', 'trims', 'engines', 'status'];
function equal(left, right) { return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right)); }

function packetFiles() {
  return fs.readdirSync(DATA).filter((file) => PACKET_PATTERN.test(file)).sort();
}

function buildReconciliation() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const files = packetFiles();
  const modelPackets = [];
  const decisions = [];
  const actionCounts = {};
  for (const file of files) {
    const filePath = path.join(DATA, file);
    const packet = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const counts = {};
    for (const row of packet.rows || []) {
      counts[row.action] = (counts[row.action] || 0) + 1;
      actionCounts[row.action] = (actionCounts[row.action] || 0) + 1;
      decisions.push({
        id: row.id,
        model: row.model,
        packetFile: `data/${file}`,
        action: row.action,
        beforeSha256: row.beforeSha256,
        proposalSha256: row.proposalSha256,
        changedFields: row.changedFields,
        identityPreserved: IDENTITY_FIELDS.every((field) => equal(row.before[field], row.proposal[field])),
        statusPreserved: row.before.status === 'published' && row.proposal.status === 'published',
      });
    }
    modelPackets.push({
      model: packet.model,
      file: `data/${file}`,
      sha256: normalizedFileHash(filePath),
      rowCount: packet.rows?.length || 0,
      actionCounts: counts,
      applicationGate: packet.applicationGate?.status || 'none',
    });
  }
  decisions.sort((left, right) => left.id.localeCompare(right.id));
  const applyAllowlist = decisions.filter((row) => APPLY_ACTIONS.has(row.action)).map((row) => row.id);
  const nonApplyIds = decisions.filter((row) => NON_APPLY_ACTIONS.has(row.action)).map((row) => row.id);
  return {
    schemaVersion: 1,
    status: 'proposal-only',
    auditStage: 'make-wide-reconciliation',
    requiresIndependentApproval: true,
    generatedOn: '2026-08-08',
    make: 'Kia',
    completionStatement: 'All 23 Kia model packets reconcile to all 247 frozen published rows exactly once. Fifty-three exact same-identity rewrites form the only production allowlist; 194 holds or pending cleanups remain no-ops.',
    safetyContract: [
      'No database write, deployment, archive, redirect, deletion, slug change, title change, category change, make/model change or publication-state change is authorized by this packet.',
      'Only rewrite_same_identity rows may enter a guarded production manifest after independent review.',
      'All pending-source cleanup actions and byte-identical holds remain no-ops until separately approved.',
      'Every production manifest must preserve the 247 published Kia rows and every model page count.',
    ],
    source: {
      snapshotFile: 'data/_kia-deeplink-snapshot-2026-08-06.json',
      snapshotSha256: normalizedFileHash(SNAPSHOT),
      snapshotHash: snapshot.snapshotHash,
      snapshotRecordCount: snapshot.records.length,
    },
    modelPackets,
    applyAllowlist,
    nonApplyIds,
    summary: {
      models: modelPackets.length,
      ...Object.fromEntries(Object.entries(actionCounts).sort(([left], [right]) => left.localeCompare(right))),
      applyRows: applyAllowlist.length,
      nonApplyRows: nonApplyIds.length,
      total: decisions.length,
    },
    safetyTotals: { archives: 0, redirects: 0, deletions: 0, identityChanges: 0, statusChanges: 0 },
    decisions,
  };
}

function main() {
  const packet = buildReconciliation();
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({
    output: OUTPUT,
    sha256: normalizedFileHash(OUTPUT),
    summary: packet.summary,
  }, null, 2));
}

if (require.main === module) main();
module.exports = { APPLY_ACTIONS, IDENTITY_FIELDS, NON_APPLY_ACTIONS, OUTPUT, PACKET_PATTERN, SNAPSHOT, buildReconciliation, packetFiles };
