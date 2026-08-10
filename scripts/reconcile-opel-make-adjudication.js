/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { CONTRACTS } = require('./opel-model-adjudication-contracts');
const { IMMUTABLE_FIELDS, validatePacket } = require('./validate-opel-model-adjudication');
const { hashValue, normalizedFileHash, stableValue } = require('./known-issue-adjudication-utils');

const OUTPUT = 'data/known-issue-opel-make-reconciliation-2026-08-10.json';
function resolveRepo(file) { return path.resolve(__dirname, '..', file); }
function equal(left, right) { return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right)); }
function loadInputs() {
  const contracts = Object.values(CONTRACTS).sort((a, b) => a.model.localeCompare(b.model));
  const snapshotFiles = [...new Set(contracts.map((contract) => contract.snapshotFile))];
  if (snapshotFiles.length !== 1) throw new Error(`Opel contracts reference ${snapshotFiles.length} snapshots`);
  const snapshot = JSON.parse(fs.readFileSync(resolveRepo(snapshotFiles[0]), 'utf8'));
  const packets = contracts.map((contract) => JSON.parse(fs.readFileSync(resolveRepo(contract.outputFile), 'utf8')));
  return { contracts, snapshot, packets };
}
function buildReconciliation(contracts, snapshot, packets) {
  const errors = [];
  const packetByModel = new Map(packets.map((packet) => [packet.model, packet]));
  const snapshotRows = snapshot.records.filter((row) => row.make === 'Opel').sort((a, b) => a.id.localeCompare(b.id));
  const snapshotIds = snapshotRows.map((row) => row.id);
  const snapshotModels = [...new Set(snapshotRows.map((row) => row.model))].sort();
  const contractModels = contracts.map((contract) => contract.model).sort();
  if (!equal(snapshotModels, contractModels)) errors.push(`model inventory mismatch: snapshot=${snapshotModels.join(',')} contracts=${contractModels.join(',')}`);
  if (packetByModel.size !== packets.length) errors.push('duplicate model packet');

  const rows = [];
  const models = [];
  for (const contract of contracts) {
    const packet = packetByModel.get(contract.model);
    if (!packet) { errors.push(`${contract.model}: packet missing`); continue; }
    const packetErrors = validatePacket(contract, packet, snapshot);
    if (packetErrors.length) errors.push(...packetErrors.map((error) => `${contract.model}: ${error}`));
    rows.push(...packet.rows);
    models.push({
      model: contract.model,
      rows: packet.rows.length,
      retain: packet.summary.retain_indexed_identity_and_accuracy_cleanup,
      hold: packet.summary.hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy,
      gate: packet.applicationGate.status,
      packetFile: contract.outputFile,
      packetSha256: hashValue(packet),
    });
  }

  const packetIds = rows.map((row) => row.id).sort();
  const duplicateIds = [...new Set(packetIds.filter((id, index) => index > 0 && id === packetIds[index - 1]))];
  const missingIds = snapshotIds.filter((id) => !packetIds.includes(id));
  const extraIds = packetIds.filter((id) => !snapshotIds.includes(id));
  if (duplicateIds.length) errors.push(`duplicate IDs: ${duplicateIds.join(',')}`);
  if (missingIds.length) errors.push(`missing IDs: ${missingIds.join(',')}`);
  if (extraIds.length) errors.push(`extra IDs: ${extraIds.join(',')}`);

  let immutableDrift = 0;
  let statusDrift = 0;
  let commerceRows = 0;
  let ownerSocialProofRows = 0;
  for (const row of rows) {
    if (IMMUTABLE_FIELDS.some((field) => !equal(row.before[field], row.proposal[field]))) immutableDrift += 1;
    if (row.proposal.status !== 'published') statusDrift += 1;
    if ((row.proposal.fixParts || []).length || (row.proposal.communityRecommendations || []).length) commerceRows += 1;
    if (/\b\d[\d,.]*\+\s*owners?\b|\bowners? have reported\b/i.test(`${row.proposal.description} ${row.proposal.solution}`)) ownerSocialProofRows += 1;
  }
  if (immutableDrift) errors.push(`${immutableDrift} rows have immutable drift`);
  if (statusDrift) errors.push(`${statusDrift} rows are not published`);
  if (commerceRows) errors.push(`${commerceRows} rows introduce commerce`);
  if (ownerSocialProofRows) errors.push(`${ownerSocialProofRows} rows introduce owner social proof`);

  const retain = rows.filter((row) => row.action === 'retain_indexed_identity_and_accuracy_cleanup').length;
  const hold = rows.filter((row) => row.action === 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy').length;
  if (retain + hold !== rows.length) errors.push('unknown action found');
  return {
    schemaVersion: 1,
    generatedOn: '2026-08-10',
    status: errors.length ? 'failed' : 'proposal-only-reconciled',
    make: 'Opel',
    source: { snapshotFile: contracts[0].snapshotFile, snapshotSha256: normalizedFileHash(resolveRepo(contracts[0].snapshotFile)), snapshotHash: snapshot.snapshotHash },
    coverage: { snapshotModels: snapshotModels.length, packetModels: models.length, snapshotRows: snapshotRows.length, packetRows: rows.length, uniquePacketRows: new Set(packetIds).size, missingIds, extraIds, duplicateIds },
    safety: { immutableIdentityDriftRows: immutableDrift, nonPublishedProposalRows: statusDrift, commerceRows, ownerSocialProofRows, productionWriteAuthorized: false },
    decisions: { retain_indexed_identity_and_accuracy_cleanup: retain, hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy: hold, total: rows.length },
    applicationGate: { status: hold ? 'blocked' : 'pending-independent-approval', reason: hold ? `${hold} indexed identities remain held for policy or evidence review; no production write is authorized.` : 'Independent approval is still required before any write.' },
    models,
    errors,
  };
}
function run() {
  const { contracts, snapshot, packets } = loadInputs();
  const result = buildReconciliation(contracts, snapshot, packets);
  fs.writeFileSync(resolveRepo(OUTPUT), `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify(result, null, 2));
  if (result.errors.length) process.exitCode = 1;
}
if (require.main === module) run();
module.exports = { buildReconciliation, loadInputs, OUTPUT };
