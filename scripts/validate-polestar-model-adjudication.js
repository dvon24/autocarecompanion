/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { buildPacket, citationsFor, commerceDecisionFor } = require('./build-polestar-model-adjudication');
const { getContract } = require('./polestar-model-adjudication-contracts');
const { FULL_RECORD_FIELDS, diffFields, fullRecord, hashValue, stableValue } = require('./known-issue-adjudication-utils');
const IMMUTABLE_FIELDS = Object.freeze(['make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'severity', 'status', 'relatedIssueIds']);
const ALLOWED_CHANGED_FIELDS = new Set(['description', 'solution', 'confidence', 'symptoms', 'affectedSystems', 'dtcCodes', 'estimatedCostLow', 'estimatedCostHigh', 'typicalMileageLow', 'typicalMileageHigh', 'citations', 'communityRecommendations', 'fixParts', 'humanApproved', 'reportCount', 'source', 'lastReportedByOwners', 'reviewedOn', 'contentUpdatedOn', 'contentUpdateSummary']);
const CANONICAL_SEVERITIES = new Set(['low', 'medium', 'high']);
function argValue(flag) { const index = process.argv.indexOf(flag); return index >= 0 ? process.argv[index + 1] : ''; }
function resolveRepo(file) { return path.resolve(__dirname, '..', file); }
function equal(left, right) { return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right)); }
function prose(row) { return `${row?.description || ''} ${row?.solution || ''}`; }
function searchStyle(url) { return /[?&](?:q|query|search|keyword)=|\/search(?:\/|\?|$)|\/s\?/i.test(String(url)); }
function validatePacket(contract, packet, snapshot) {
  const errors = []; const deterministic = buildPacket(contract, snapshot); const expected = snapshot.records.filter((row) => row.make === contract.make && row.model === contract.model).sort((a, b) => a.id.localeCompare(b.id)); const expectedById = new Map(expected.map((row) => [row.id, row])); const rows = Array.isArray(packet.rows) ? packet.rows : []; const ids = rows.map((row) => row.id); const blockerIds = contract.allIds.filter((id) => !contract.retainedIds.includes(id));
  if (!equal(packet, deterministic)) errors.push('packet does not exactly match deterministic frozen-snapshot build');
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true || !['blocked', 'pending-independent-approval'].includes(packet.applicationGate?.status)) errors.push('packet must remain proposal-only');
  if (packet.make !== contract.make || packet.model !== contract.model) errors.push('wrong make/model');
  if (expected.length !== contract.allIds.length || rows.length !== contract.allIds.length || new Set(ids).size !== contract.allIds.length || !equal([...ids].sort(), contract.allIds)) errors.push(`${contract.model} coverage must exactly match ${contract.allIds.length}/${contract.allIds.length} frozen rows`);
  if (!equal(packet.applicationGate?.blockerRecordIds || [], blockerIds)) errors.push('blocker IDs drifted');
  if (!packet.safetyContract?.some((line) => /0\+ owners/.test(line)) || !packet.safetyContract?.some((line) => /cross-generation proof/i.test(line)) || !packet.safetyContract?.some((line) => /No production write/.test(line))) errors.push('safety contract incomplete');
  for (const row of rows) {
    const source = expectedById.get(row.id); if (!source) { errors.push(`${row.id}: unknown row`); continue; } const frozen = fullRecord(source);
    if (!equal(row.before, frozen) || row.beforeSha256 !== hashValue(frozen)) errors.push(`${row.id}: before state drifted`);
    if (row.proposalSha256 !== hashValue(row.proposal) || !equal(row.changedFields, diffFields(row.before, row.proposal))) errors.push(`${row.id}: proposal hash/diff drifted`);
    for (const field of FULL_RECORD_FIELDS) if (!(field in row.before) || !(field in row.proposal)) errors.push(`${row.id}: missing field ${field}`);
    for (const field of IMMUTABLE_FIELDS) if (!equal(row.before[field], row.proposal[field])) errors.push(`${row.id}: immutable ${field} changed`);
    for (const field of row.changedFields) if (!ALLOWED_CHANGED_FIELDS.has(field)) errors.push(`${row.id}: unauthorized changed field ${field}`);
    const retained = contract.retainedIds.includes(row.id); if (row.action !== (retained ? 'retain_indexed_identity_and_accuracy_cleanup' : 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy') || row.identityReviewRequired !== !retained || (retained ? row.identityConflict !== null : !row.identityConflict)) errors.push(`${row.id}: verdict drifted`);
    if (!CANONICAL_SEVERITIES.has(row.proposal.severity)) errors.push(`${row.id}: noncanonical severity`);
    if (row.proposal.reportCount !== 0 || row.proposal.lastReportedByOwners !== '') errors.push(`${row.id}: owner data not reduced to unknown`);
    if (/\b\d[\d,.]*\+\s*owners?\b|\bowners? have reported\b/i.test(prose(row.proposal))) errors.push(`${row.id}: owner social proof is forbidden`);
    if (row.proposal.humanApproved !== false || row.proposal.fixParts.length || row.proposal.communityRecommendations.length) errors.push(`${row.id}: must remain unapproved and commerce-free`);
    if (!/do not buy/i.test(row.proposal.solution) || !/no universal retail part/i.test(row.commerceDecision || '') || row.commerceDecision !== commerceDecisionFor(contract, row.id)) errors.push(`${row.id}: commerce boundary missing`);
    if (!equal(row.proposal.citations, citationsFor(contract, row.id)) || !row.proposal.citations.length || row.proposal.citations.some((citation) => !/^https:\/\//.test(citation.url) || searchStyle(citation.url))) errors.push(`${row.id}: exact primary citation drifted`);
    if (row.proposal.estimatedCostLow !== null || row.proposal.estimatedCostHigh !== null || row.proposal.typicalMileageLow !== null || row.proposal.typicalMileageHigh !== null) errors.push(`${row.id}: unsupported cost or mileage retained`);
    if (row.proposal.dtcCodes.length) errors.push(`${row.id}: unsupported DTC retained or introduced`);
  }
  const byId = new Map(rows.map((row) => [row.id, row.proposal])); for (const requirement of contract.requiredProse || []) { const value = String(byId.get(requirement.id)?.[requirement.field] || ''); for (const pattern of requirement.patterns) if (!new RegExp(pattern, 'i').test(value)) errors.push(`${requirement.id}: required ${requirement.field} boundary missing: ${pattern}`); }
  if (!equal(packet.pdfSources, contract.pdfSources) || !equal(packet.otherSources, contract.otherSources)) errors.push('source evidence manifest drifted');
  if (!equal(packet.manufacturerCommunications.periodCounts, contract.bulletinInventory.periodCounts) || !equal(packet.manufacturerCommunications.requiredDocumentIds, contract.relevantDocumentIds)) errors.push('communication inventory drifted');
  if (!equal(packet.recallInventory.periodCounts, contract.recallInventory.periodCounts) || !equal(packet.recallInventory.campaigns, contract.campaigns)) errors.push('recall inventory drifted');
  return errors;
}
function loadModel(model) { const contract = getContract(model); const packet = JSON.parse(fs.readFileSync(resolveRepo(contract.outputFile), 'utf8')); const snapshot = JSON.parse(fs.readFileSync(resolveRepo(contract.snapshotFile), 'utf8')); return { contract, packet, snapshot }; }
if (require.main === module) { const model = argValue('--model'); if (!model) throw new Error('--model is required'); const { contract, packet, snapshot } = loadModel(model); const errors = validatePacket(contract, packet, snapshot); console.log(JSON.stringify({ passed: !errors.length, packetSha256: hashValue(packet), decisionCount: packet.rows.length, applicationGate: packet.applicationGate, errors }, null, 2)); if (errors.length) process.exitCode = 1; }
module.exports = { ALLOWED_CHANGED_FIELDS, IMMUTABLE_FIELDS, loadModel, validatePacket };
