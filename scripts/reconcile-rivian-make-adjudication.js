/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { buildPacket } = require('./build-rivian-model-adjudication');
const { getContract, supportedModels } = require('./rivian-model-adjudication-contracts');
const { hashValue, normalizedFileHash, stableValue } = require('./known-issue-adjudication-utils');
const { validatePacket } = require('./validate-rivian-model-adjudication');

const IMMUTABLE_FIELDS = Object.freeze(['make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'severity', 'status', 'relatedIssueIds']);
const CANONICAL_SEVERITIES = new Set(['low', 'medium', 'high']);
const SNAPSHOT_FILE = 'data/_rivian-deeplink-snapshot-2026-08-11.json';
const OUTPUT_FILE = 'data/known-issue-rivian-make-reconciliation-2026-08-11.json';

function resolveRepo(file) { return path.resolve(__dirname, '..', file); }
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function equal(left, right) { return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right)); }
function prose(record) { return `${record?.description || ''} ${record?.solution || ''}`; }

function loadInputs() {
  const snapshot = JSON.parse(fs.readFileSync(resolveRepo(SNAPSHOT_FILE), 'utf8'));
  const contracts = Object.fromEntries(supportedModels.map((model) => [model, getContract(model)]));
  const packets = Object.fromEntries(Object.entries(contracts).map(([model, contract]) => [model, JSON.parse(fs.readFileSync(resolveRepo(contract.outputFile), 'utf8'))]));
  return { contracts, packets, snapshot };
}

function reconcile({ contracts, packets, snapshot }) {
  const errors = [];
  const expected = snapshot.records.filter((row) => row.make === 'Rivian').sort((left, right) => left.id.localeCompare(right.id));
  const expectedById = new Map(expected.map((row) => [row.id, row]));
  const expectedModels = [...new Set(expected.map((row) => row.model))].sort();
  const contractModels = Object.keys(contracts).sort();
  const packetModels = Object.keys(packets).sort();
  if (!equal(contractModels, expectedModels)) errors.push('contract model inventory does not exactly match frozen Rivian models');
  if (!equal(packetModels, expectedModels)) errors.push('packet model inventory does not exactly match frozen Rivian models');

  const modelReports = [];
  const combined = [];
  for (const model of expectedModels) {
    const contract = contracts[model];
    const packet = packets[model];
    if (!contract || !packet) continue;
    const packetErrors = validatePacket(contract, packet, snapshot);
    if (packetErrors.length) errors.push(...packetErrors.map((error) => `${model}: ${error}`));
    const expectedCount = expected.filter((row) => row.model === model).length;
    const rows = Array.isArray(packet.rows) ? packet.rows : [];
    if (rows.length !== expectedCount) errors.push(`${model}: ${rows.length}/${expectedCount} rows`);
    combined.push(...rows.map((row) => ({ ...row, packetModel: model })));
    modelReports.push({
      model,
      packetFile: contract.outputFile,
      packetSha256: hashValue(packet),
      deterministicPacketSha256: hashValue(buildPacket(contract, snapshot)),
      rows: rows.length,
      retained: rows.filter((row) => row.action === 'retain_indexed_identity_and_accuracy_cleanup').length,
      held: rows.filter((row) => row.action === 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy').length,
      unsupportedOwnerCountsZeroed: contract.reportCountCleanupIds.length,
      applicationGate: packet.applicationGate.status,
    });
  }

  const combinedIds = combined.map((row) => row.id).sort();
  const expectedIds = expected.map((row) => row.id);
  const duplicates = combinedIds.filter((id, index) => index > 0 && id === combinedIds[index - 1]);
  const missing = expectedIds.filter((id) => !combinedIds.includes(id));
  const extra = combinedIds.filter((id) => !expectedById.has(id));
  if (duplicates.length) errors.push(`duplicate ids: ${[...new Set(duplicates)].join(', ')}`);
  if (missing.length) errors.push(`missing ids: ${missing.join(', ')}`);
  if (extra.length) errors.push(`extra ids: ${[...new Set(extra)].join(', ')}`);

  const identityDrift = [];
  const unpublished = [];
  const severityDrift = [];
  const ownerDataDrift = [];
  const ownerSocialProof = [];
  const commerceDrift = [];
  const makeDrift = [];
  for (const row of combined) {
    const frozen = expectedById.get(row.id);
    if (!frozen) continue;
    for (const field of IMMUTABLE_FIELDS) if (!equal(row.proposal[field], frozen[field])) identityDrift.push(`${row.id}:${field}`);
    if (row.proposal.make !== 'Rivian' || row.before.make !== 'Rivian') makeDrift.push(row.id);
    if (row.proposal.status !== 'published') unpublished.push(row.id);
    if (!CANONICAL_SEVERITIES.has(row.proposal.severity)) severityDrift.push(row.id);
    if (row.proposal.reportCount !== 0 || row.proposal.lastReportedByOwners !== '') ownerDataDrift.push(row.id);
    if (/\b0\+\s*owners?\b|\b\d[\d,.]*\+\s*owners?\b|\bowners? have reported\b/i.test(prose(row.proposal))) ownerSocialProof.push(row.id);
    if (row.proposal.fixParts.length || row.proposal.communityRecommendations.length) commerceDrift.push(row.id);
  }
  if (identityDrift.length) errors.push(`identity drift: ${identityDrift.join(', ')}`);
  if (makeDrift.length) errors.push(`make drift: ${makeDrift.join(', ')}`);
  if (unpublished.length) errors.push(`unpublished proposals: ${unpublished.join(', ')}`);
  if (severityDrift.length) errors.push(`noncanonical severity: ${severityDrift.join(', ')}`);
  if (ownerDataDrift.length) errors.push(`owner data drift: ${ownerDataDrift.join(', ')}`);
  if (ownerSocialProof.length) errors.push(`owner social proof: ${ownerSocialProof.join(', ')}`);
  if (commerceDrift.length) errors.push(`commerce drift: ${commerceDrift.join(', ')}`);

  const retained = combined.filter((row) => row.action === 'retain_indexed_identity_and_accuracy_cleanup').length;
  const held = combined.filter((row) => row.action === 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy').length;
  const unsupportedOwnerCountsZeroed = modelReports.reduce((sum, model) => sum + model.unsupportedOwnerCountsZeroed, 0);
  return {
    schemaVersion: 1,
    status: 'proposal-only',
    requiresIndependentApproval: true,
    generatedOn: '2026-08-11',
    make: 'Rivian',
    branch: 'codex/rivian-deeplink-audit',
    snapshot: {
      file: SNAPSHOT_FILE,
      normalizedSha256: normalizedFileHash(resolveRepo(SNAPSHOT_FILE)),
      generatedAt: snapshot.generatedAt,
      snapshotHash: snapshot.snapshotHash,
      makeRows: expected.length,
    },
    summary: {
      models: modelReports.length,
      rows: combined.length,
      retained,
      held,
      unsupportedOwnerCountsZeroed,
      pagesPreservedPublished: combined.length - unpublished.length,
    },
    crossPacketChecks: {
      exactModelInventory: equal(contractModels, expectedModels) && equal(packetModels, expectedModels),
      exactRowInventory: !duplicates.length && !missing.length && !extra.length && combined.length === expected.length,
      makeDrift: makeDrift.length,
      identityDrift: identityDrift.length,
      unpublished: unpublished.length,
      noncanonicalSeverity: severityDrift.length,
      ownerDataDrift: ownerDataDrift.length,
      ownerSocialProof: ownerSocialProof.length,
      commerceDrift: commerceDrift.length,
      perPacketValidationErrors: errors.filter((error) => expectedModels.some((model) => error.startsWith(`${model}:`))).length,
    },
    applicationGate: {
      status: 'blocked',
      reason: 'Independent review is required for every model packet, and held identities require an approved identity policy before any catalog write.',
    },
    models: modelReports,
    rows: combined.map((row) => ({ id: row.id, model: row.packetModel, action: row.action, proposalSha256: row.proposalSha256 })).sort((left, right) => left.id.localeCompare(right.id)),
    passed: errors.length === 0,
    errors,
  };
}

function main() {
  const report = reconcile(loadInputs());
  if (process.argv.includes('--write')) fs.writeFileSync(resolveRepo(OUTPUT_FILE), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
  if (!report.passed) process.exitCode = 1;
}

if (require.main === module) main();
module.exports = { IMMUTABLE_FIELDS, OUTPUT_FILE, SNAPSHOT_FILE, clone, loadInputs, reconcile };
