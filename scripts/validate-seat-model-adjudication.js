/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { buildPacket } = require('./build-seat-model-adjudication');
const { getContract } = require('./seat-model-adjudication-contracts');
const { FULL_RECORD_FIELDS, diffFields, fullRecord, hashValue, stableValue } = require('./known-issue-adjudication-utils');

const IMMUTABLE_FIELDS = Object.freeze(['make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'severity', 'status', 'relatedIssueIds']);
const ALLOWED_CHANGED_FIELDS = new Set([
  'description', 'solution', 'confidence', 'symptoms', 'affectedSystems', 'dtcCodes',
  'estimatedCostLow', 'estimatedCostHigh', 'typicalMileageLow', 'typicalMileageHigh',
  'citations', 'humanApproved', 'reportCount', 'source', 'lastReportedByOwners',
  'reviewedOn', 'contentUpdatedOn', 'contentUpdateSummary',
]);
const CANONICAL_SEVERITIES = new Set(['low', 'medium', 'high']);
const ALLOWED_CITATION_TYPES = new Set(['tsb', 'recall', 'forum', 'manual', 'nhtsa', 'manufacturer', 'investigation']);

function argValue(flag) { const index = process.argv.indexOf(flag); return index >= 0 ? process.argv[index + 1] : ''; }
function resolveRepo(file) { return path.resolve(__dirname, '..', file); }
function equal(left, right) { return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right)); }
function allText(value) {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(allText).join(' ');
  if (value && typeof value === 'object') return Object.values(value).map(allText).join(' ');
  return '';
}
function prose(row) { return `${row?.description || ''} ${row?.solution || ''} ${allText(row?.symptoms)} ${allText(row?.affectedSystems)}`; }
function searchStyle(url) {
  try {
    const parsed = new URL(String(url));
    return parsed.search.length > 0 || /(^|\/)(?:s|search|search-results?|results|lookup|query)(?:\/|$)/i.test(parsed.pathname);
  } catch { return true; }
}
function official(url) { return /^https:\/\/(?:www\.)?(?:seat\.com|check-vehicle-recalls\.service\.gov\.uk)\//i.test(String(url)); }
function ownerSocialProof(value) {
  return /\b\d[\d,.]*\+?\s+(?:owners?|drivers?|users?)\b|\b(?:many|numerous|several|multiple|most)\s+owners?\b|\bowners?\s+(?:have\s+)?(?:report(?:ed)?|say|complain(?:ed)?)\b/i.test(allText(value));
}

function validatePacket(contract, packet, snapshot) {
  const errors = [];
  const deterministic = buildPacket(contract, snapshot);
  const expected = snapshot.records
    .filter((row) => row.make === contract.make && row.model === contract.model)
    .sort((a, b) => a.id.localeCompare(b.id));
  const expectedById = new Map(expected.map((row) => [row.id, row]));
  const rows = Array.isArray(packet.rows) ? packet.rows : [];
  const ids = rows.map((row) => row.id);
  const blockerIds = contract.allIds.filter((id) => !contract.retainedIds.includes(id));

  if (!equal(packet, deterministic)) errors.push('packet does not exactly match deterministic frozen-snapshot build');
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true) errors.push('packet must remain proposal-only');
  if (packet.make !== 'SEAT' || packet.make !== contract.make || packet.model !== contract.model) errors.push('wrong make/model or make casing');
  if (expected.length !== contract.allIds.length || rows.length !== contract.allIds.length || new Set(ids).size !== contract.allIds.length || !equal([...ids].sort(), contract.allIds)) {
    errors.push(`${contract.model} coverage mismatch`);
  }
  if (!equal(packet.applicationGate?.blockerRecordIds || [], blockerIds)) errors.push('blocker IDs drifted');

  for (const row of rows) {
    const source = expectedById.get(row.id);
    if (!source) { errors.push(`${row.id}: unknown row`); continue; }
    const frozen = fullRecord(source);
    const retained = contract.retainedIds.includes(row.id);
    if (!equal(row.before, frozen) || row.beforeSha256 !== hashValue(frozen)) errors.push(`${row.id}: before state drifted`);
    if (row.proposalSha256 !== hashValue(row.proposal) || !equal(row.changedFields, diffFields(row.before, row.proposal))) errors.push(`${row.id}: proposal hash/diff drifted`);
    for (const field of FULL_RECORD_FIELDS) if (!(field in row.before) || !(field in row.proposal)) errors.push(`${row.id}: missing field ${field}`);
    for (const field of IMMUTABLE_FIELDS) if (!equal(row.before[field], row.proposal[field])) errors.push(`${row.id}: immutable ${field} changed`);
    if (!CANONICAL_SEVERITIES.has(row.proposal.severity)) errors.push(`${row.id}: noncanonical severity`);
    if (row.proposal.status !== 'published') errors.push(`${row.id}: page became unpublished`);
    if (!retained) {
      if (row.action !== 'hold_indexed_identity_byte_identical_pending_identity_policy') errors.push(`${row.id}: incorrect hold action`);
      if (!equal(row.proposal, row.before) || row.proposalSha256 !== row.beforeSha256 || row.changedFields.length !== 0) errors.push(`${row.id}: held row is not byte-identical`);
      continue;
    }

    if (row.action !== 'retain_indexed_identity_and_accuracy_cleanup') errors.push(`${row.id}: incorrect retain action`);
    if (ownerSocialProof(row.proposal)) errors.push(`${row.id}: owner social proof is forbidden`);
    for (const field of row.changedFields) if (!ALLOWED_CHANGED_FIELDS.has(field)) errors.push(`${row.id}: unauthorized changed field ${field}`);
    if (!equal(row.before.fixParts, row.proposal.fixParts) || !equal(row.before.communityRecommendations, row.proposal.communityRecommendations)) errors.push(`${row.id}: commerce drifted`);
    const cleanReportCount = contract.reportCountCleanupIds.includes(row.id);
    const expectedReportCount = cleanReportCount ? 0 : row.before.reportCount;
    const expectedLastReported = cleanReportCount ? '' : row.before.lastReportedByOwners;
    if (row.proposal.humanApproved !== false || row.proposal.reportCount !== expectedReportCount || row.proposal.lastReportedByOwners !== expectedLastReported) errors.push(`${row.id}: retained review/owner state is unsafe`);
    if (row.proposal.dtcCodes.length || row.proposal.estimatedCostLow !== null || row.proposal.estimatedCostHigh !== null || row.proposal.typicalMileageLow !== null || row.proposal.typicalMileageHigh !== null) errors.push(`${row.id}: unsupported DTC/cost/mileage remained`);
    if (!/do not buy/i.test(row.proposal.solution) || !/no universal retail part/i.test(row.commerceDecision || '')) errors.push(`${row.id}: commerce boundary missing`);
    if (/[£$€]\s?\d|\b\d[\d,]*\s*(?:dollars?|pounds?|euros?)\b/i.test(prose(row.proposal))) errors.push(`${row.id}: prose contains an unsupported price`);
    if (/\b[BCPU]\d{4}\b/i.test(prose(row.proposal))) errors.push(`${row.id}: prose contains an unsupported DTC`);
    if (/\b\d[\d,]*(?:\s*-\s*\d[\d,]*)?\s*(?:miles?|mi)\b/i.test(prose(row.proposal))) errors.push(`${row.id}: prose contains unsupported mileage precision`);
    if (!row.proposal.citations.length) errors.push(`${row.id}: retained identity has no citation`);
    const expectedUrls = new Set(contract.content[row.id].citations.map((key) => (contract.pdfSources[key] || contract.otherSources[key])?.url));
    if (row.proposal.citations.some((citation) => searchStyle(citation.url) || !official(citation.url) || !expectedUrls.has(citation.url) || !ALLOWED_CITATION_TYPES.has(citation.type))) errors.push(`${row.id}: citation is not an exact official source`);
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
