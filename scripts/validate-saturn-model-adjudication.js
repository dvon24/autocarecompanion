/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { buildPacket } = require('./build-saturn-model-adjudication');
const { getContract } = require('./saturn-model-adjudication-contracts');
const { FULL_RECORD_FIELDS, diffFields, fullRecord, hashValue, stableValue } = require('./known-issue-adjudication-utils');

const IMMUTABLE_FIELDS = Object.freeze(['make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'severity', 'status', 'relatedIssueIds']);
const ALLOWED_CHANGED_FIELDS = new Set(['description', 'solution', 'confidence', 'symptoms', 'affectedSystems', 'dtcCodes', 'estimatedCostLow', 'estimatedCostHigh', 'typicalMileageLow', 'typicalMileageHigh', 'citations', 'communityRecommendations', 'fixParts', 'humanApproved', 'reportCount', 'source', 'lastReportedByOwners', 'reviewedOn', 'contentUpdatedOn', 'contentUpdateSummary']);
const CANONICAL_SEVERITIES = new Set(['low', 'medium', 'high']);

function argValue(flag) { const index = process.argv.indexOf(flag); return index >= 0 ? process.argv[index + 1] : ''; }
function resolveRepo(file) { return path.resolve(__dirname, '..', file); }
function equal(left, right) { return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right)); }
function prose(row) { return `${row?.description || ''} ${row?.solution || ''}`; }
function searchStyle(url) { return /[?&](?:q|query|search|keyword)=|\/search(?:\/|\?|$)|\/s\?/i.test(String(url)); }
function official(url) { return /^https:\/\/(?:static\.nhtsa\.gov|www\.nhtsa\.gov|nhtsa\.gov|experience\.gm\.com|www\.gmc\.com\/ownercenter)\//i.test(String(url)); }

function validatePacket(contract, packet, snapshot) {
  const errors = [];
  const deterministic = buildPacket(contract, snapshot);
  const expected = snapshot.records.filter((row) => row.make === contract.make && row.model === contract.model).sort((a, b) => a.id.localeCompare(b.id));
  const expectedById = new Map(expected.map((row) => [row.id, row]));
  const rows = Array.isArray(packet.rows) ? packet.rows : [];
  const ids = rows.map((row) => row.id);
  const blockerIds = contract.allIds.filter((id) => !contract.retainedIds.includes(id));
  if (!equal(packet, deterministic)) errors.push('packet does not exactly match deterministic frozen-snapshot build');
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true) errors.push('packet must remain proposal-only');
  if (packet.make !== contract.make || packet.model !== contract.model) errors.push('wrong make/model');
  if (expected.length !== contract.allIds.length || rows.length !== contract.allIds.length || new Set(ids).size !== contract.allIds.length || !equal([...ids].sort(), contract.allIds)) errors.push(`${contract.model} coverage mismatch`);
  if (!equal(packet.applicationGate?.blockerRecordIds || [], blockerIds)) errors.push('blocker IDs drifted');
  for (const row of rows) {
    const source = expectedById.get(row.id);
    if (!source) { errors.push(`${row.id}: unknown row`); continue; }
    const frozen = fullRecord(source);
    if (!equal(row.before, frozen) || row.beforeSha256 !== hashValue(frozen)) errors.push(`${row.id}: before state drifted`);
    if (row.proposalSha256 !== hashValue(row.proposal) || !equal(row.changedFields, diffFields(row.before, row.proposal))) errors.push(`${row.id}: proposal hash/diff drifted`);
    for (const field of FULL_RECORD_FIELDS) if (!(field in row.before) || !(field in row.proposal)) errors.push(`${row.id}: missing field ${field}`);
    for (const field of IMMUTABLE_FIELDS) if (!equal(row.before[field], row.proposal[field])) errors.push(`${row.id}: immutable ${field} changed`);
    for (const field of row.changedFields) if (!ALLOWED_CHANGED_FIELDS.has(field)) errors.push(`${row.id}: unauthorized changed field ${field}`);
    if (!CANONICAL_SEVERITIES.has(row.proposal.severity)) errors.push(`${row.id}: noncanonical severity`);
    if (row.proposal.reportCount !== 0 || row.proposal.lastReportedByOwners !== '') errors.push(`${row.id}: owner data not reduced to unknown`);
    if (/\b\d[\d,.]*\+\s*owners?\b|\bowners? have reported\b/i.test(prose(row.proposal))) errors.push(`${row.id}: owner social proof is forbidden`);
    if (row.proposal.humanApproved !== false || row.proposal.fixParts.length || row.proposal.communityRecommendations.length) errors.push(`${row.id}: must remain unapproved and commerce-free`);
    if (!/do not buy/i.test(row.proposal.solution) || !/no universal retail part/i.test(row.commerceDecision || '')) errors.push(`${row.id}: commerce boundary missing`);
    if (row.proposal.citations.some((citation) => searchStyle(citation.url) || !String(citation.url).startsWith('https://'))) errors.push(`${row.id}: invalid or search-style citation`);
    if (row.proposal.citations.length < 2) errors.push(`${row.id}: evidence limitation citations missing`);
    if (contract.retainedIds.includes(row.id) && !row.proposal.citations.some((citation) => official(citation.url))) errors.push(`${row.id}: retained identity lacks official primary evidence`);
    if (row.action.includes('hold_') && row.proposal.status !== 'published') errors.push(`${row.id}: held row unpublished`);
  }
  for (const requirement of contract.requiredProse || []) {
    const row = rows.find((entry) => entry.id === requirement.id);
    for (const pattern of requirement.patterns) {
      if (!String(row?.proposal?.[requirement.field] || '').includes(pattern)) errors.push(`${requirement.id}: missing required prose ${pattern}`);
    }
  }
  return errors;
}

if (require.main === module) {
  const model = argValue('--model');
  if (!model) throw new Error('--model is required');
  const contract = getContract(model);
  const snapshot = JSON.parse(fs.readFileSync(resolveRepo(contract.snapshotFile), 'utf8'));
  const packet = JSON.parse(fs.readFileSync(resolveRepo(contract.outputFile), 'utf8'));
  const errors = validatePacket(contract, packet, snapshot);
  console.log(JSON.stringify({ model, valid: errors.length === 0, errors }, null, 2));
  if (errors.length) process.exitCode = 1;
}

module.exports = { validatePacket };
