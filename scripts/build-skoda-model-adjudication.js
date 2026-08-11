/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { clone, diffFields, fullRecord, hashValue, normalizedFileHash } = require('./known-issue-adjudication-utils');
const { clustersForModel, getContract } = require('./skoda-model-adjudication-contracts');
const { assertSkodaSnapshot } = require('./skoda-snapshot-contract');
const { assertSkodaEvidence } = require('./validate-skoda-primary-evidence');
const { loadAndValidateReviewLedger } = require('./skoda-review-ledger');

function argValue(flag) { const index = process.argv.indexOf(flag); return index >= 0 ? process.argv[index + 1] : ''; }
function resolveRepo(file) { return path.resolve(__dirname, '..', file); }

function buildPacket(contract, snapshot) {
  const evidence = assertSkodaEvidence();
  const evidenceByKey = new Map(evidence.sources.map((source) => [source.key, source]));
  const skodaRows = assertSkodaSnapshot(snapshot, resolveRepo(contract.snapshotFile));
  const ledger = loadAndValidateReviewLedger(skodaRows);
  const decisionById = new Map(ledger.entries.map((entry) => [entry.id, entry]));
  const frozenRows = skodaRows.filter((row) => row.model === contract.model).sort((a, b) => a.id.localeCompare(b.id));
  if (frozenRows.length !== contract.allIds.length || frozenRows.map((row) => row.id).join('|') !== contract.allIds.join('|')) {
    throw new Error(`${contract.model}: frozen coverage mismatch`);
  }

  const rows = frozenRows.map((record) => {
    const decision = decisionById.get(record.id);
    if (!decision) throw new Error(`${record.id}: review-ledger decision missing`);
    const before = fullRecord(record);
    const keys = decision.capturedEvidenceKeys;
    const primaryEvidence = keys.map((key) => {
      const source = evidenceByKey.get(key);
      if (!source) throw new Error(`${record.id}: evidence ${key} is not captured`);
      return { key, url: source.url, decisionUse: source.decisionUse };
    });
    const proposal = clone(before);
    return {
      id: record.id,
      action: decision.action,
      identityReviewRequired: true,
      identityConflict: decision.justification,
      reason: 'Exact same-identity primary support was not established. The complete frozen record remains byte-identical and published.',
      evidence: { primaryEvidence, limitations: decision.justification },
      reviewLedger: { disposition: decision.disposition, existingSourcesInspected: clone(decision.existingSourcesInspected), duplicateClusterKeys: clone(decision.duplicateClusterKeys) },
      commerceDecision: 'No audit commerce action; all frozen commerce and recommendation fields remain byte-identical.',
      before,
      beforeSha256: hashValue(before),
      proposal,
      proposalSha256: hashValue(proposal),
      changedFields: diffFields(before, proposal),
    };
  });

  return {
    schemaVersion: 1,
    status: 'proposal-only',
    auditStage: 'model-primary-source-technical-adjudication',
    requiresIndependentApproval: true,
    generatedOn: contract.reviewDate,
    make: contract.make,
    model: contract.model,
    completionStatement: `All ${rows.length} frozen Skoda ${contract.model} pages are byte-identical published holds.`,
    applicationGate: {
      status: 'blocked',
      blockerRecordIds: contract.allIds,
      reason: 'No row has exact same-identity evidence sufficient to authorize a content write.',
    },
    safetyContract: [
      'No archive, redirect, consolidation, new issue, title change, indexed vehicle-metadata change, status/severity change or commerce mutation is authorized.',
      'Every held row is a byte-identical published no-op across every full-record field.',
      'Identity, status, owner telemetry, commerce and related IDs remain frozen.',
      'Unknown owner totals remain internal zero and are never converted into social proof.',
      'Sibling-brand or platform similarity is not Skoda proof without an exact applicability path.',
      'Routing correction candidates are reported separately and authorize no metadata write.',
    ],
    source: {
      snapshotFile: contract.snapshotFile,
      snapshotSha256: normalizedFileHash(resolveRepo(contract.snapshotFile)),
      snapshotGeneratedAt: snapshot.generatedAt,
      snapshotHash: snapshot.snapshotHash,
      modelRecordCount: frozenRows.length,
      reviewLedgerFile: 'data/known-issue-skoda-review-ledger-2026-08-11.json',
    },
    observations: clone(contract.observations),
    duplicateClusters: clone(clustersForModel(contract.model)),
    evidenceInventory: clone(contract.evidenceInventory),
    summary: {
      retain_indexed_identity_and_accuracy_cleanup: 0,
      hold_indexed_identity_byte_identical_pending_identity_policy: rows.length,
      pages_preserved_published: rows.length,
      authorized_write_candidates: 0,
      total: rows.length,
    },
    rows,
  };
}

function buildForModel(model) {
  const contract = getContract(model);
  const snapshot = JSON.parse(fs.readFileSync(resolveRepo(contract.snapshotFile), 'utf8'));
  return { contract, snapshot, packet: buildPacket(contract, snapshot) };
}

if (require.main === module) {
  const model = argValue('--model');
  if (!model) throw new Error('--model is required');
  const { contract, packet } = buildForModel(model);
  const output = resolveRepo(contract.outputFile);
  fs.writeFileSync(output, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output, rows: packet.rows.length, summary: packet.summary, applicationGate: packet.applicationGate.status }, null, 2));
}

module.exports = { buildForModel, buildPacket };
