/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const {
  FULL_RECORD_FIELDS,
  RECALL_SCOPES,
  REWRITE_IDS,
  TSB_SCOPES,
  fullRecord,
  hashValue,
} = require('./build-gmc-adjudication');

const DEFAULT_PACKET = path.resolve(__dirname, '..', 'data', 'known-issue-gmc-adjudication-2026-08-05.json');
const DEFAULT_SNAPSHOT = path.resolve(__dirname, '..', 'data', '_gmc-deeplink-snapshot-2026-08-05.json');
const ACTIONS = ['rewrite_then_publish', 'keep_published_pending_source'];
const APPLICABILITY_PROSE = /\b(?:20\d{2}|vehicles?|covered|equipped|applicable|production|campaign|bulletin|by vin)\b/i;

function sha256File(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function expectedAction(id) {
  return REWRITE_IDS.has(id) ? 'rewrite_then_publish' : 'keep_published_pending_source';
}

function expectedCitationUrl(id) {
  const recall = RECALL_SCOPES[id];
  if (recall) return `https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=${recall.campaign}000`;
  return TSB_SCOPES[id]?.url || null;
}

function validatePacket(packet, snapshot, snapshotSha256) {
  const errors = [];
  if (packet.status !== 'proposal-only') errors.push('packet status must be proposal-only');
  if (packet.requiresIndependentApproval !== true) errors.push('packet must require independent approval');
  if (packet.make !== 'GMC') errors.push('packet make must be GMC');
  if (packet.source?.snapshotSha256 !== snapshotSha256) errors.push('snapshot SHA-256 mismatch');
  if (packet.source?.snapshotHash !== snapshot.snapshotHash) errors.push('snapshotHash mismatch');
  if (!Array.isArray(packet.rows)) return [...errors, 'packet rows[] missing'];
  if (packet.rows.some((row) => row.proposal?.status === 'archived')) errors.push('packet must not propose archives');

  const snapshotById = new Map(snapshot.records.map((row) => [row.id, row]));
  const packetIds = packet.rows.map((row) => row.id);
  const duplicateIds = packetIds.filter((id, index) => packetIds.indexOf(id) !== index);
  if (duplicateIds.length) errors.push(`duplicate IDs: ${[...new Set(duplicateIds)].join(', ')}`);
  const missing = [...snapshotById.keys()].filter((id) => !packetIds.includes(id));
  const extra = packetIds.filter((id) => !snapshotById.has(id));
  if (missing.length) errors.push(`missing snapshot IDs: ${missing.join(', ')}`);
  if (extra.length) errors.push(`extra IDs: ${extra.join(', ')}`);

  for (const row of packet.rows) {
    const label = row.id || '<missing>';
    const source = snapshotById.get(row.id);
    if (!source) continue;
    const before = fullRecord(source);
    if (row.action !== expectedAction(row.id)) errors.push(`${label}: unexpected action ${row.action}`);
    if (row.beforeSha256 !== hashValue(row.before)) errors.push(`${label}: before hash mismatch`);
    if (row.beforeSha256 !== hashValue(before)) errors.push(`${label}: before does not match snapshot`);
    if (row.proposalSha256 !== hashValue(row.proposal)) errors.push(`${label}: proposal hash mismatch`);
    for (const field of FULL_RECORD_FIELDS) {
      if (!Object.prototype.hasOwnProperty.call(row.before, field)) errors.push(`${label}: before missing ${field}`);
      if (!Object.prototype.hasOwnProperty.call(row.proposal, field)) errors.push(`${label}: proposal missing ${field}`);
    }
    if (row.proposal.make !== 'GMC') errors.push(`${label}: make drift`);
    if (row.proposal.model !== row.before.model || row.model !== row.proposal.model) errors.push(`${label}: model drift`);
    if (row.proposal.status !== 'published') errors.push(`${label}: proposal must remain published`);
    if (row.commerceDecision !== 'no-commerce') errors.push(`${label}: commerce decision must be no-commerce`);

    if (row.action === 'keep_published_pending_source') {
      if (row.proposalSha256 !== row.beforeSha256) errors.push(`${label}: keep action changed content`);
      if (JSON.stringify(row.proposal) !== JSON.stringify(row.before)) errors.push(`${label}: keep action is not byte-equivalent JSON`);
      continue;
    }

    if (row.proposal.humanApproved !== false) errors.push(`${label}: rewrite must remain unapproved`);
    if (row.proposal.reportCount !== 0) errors.push(`${label}: rewrite reportCount must be zero`);
    if (!Array.isArray(row.proposal.fixParts) || row.proposal.fixParts.length) errors.push(`${label}: rewrite fixParts must be empty`);
    if (!Array.isArray(row.proposal.communityRecommendations) || row.proposal.communityRecommendations.length) errors.push(`${label}: rewrite recommendations must be empty`);
    if (row.proposal.estimatedCostLow !== null || row.proposal.estimatedCostHigh !== null) errors.push(`${label}: rewrite cost claims must be null`);
    if (row.proposal.typicalMileageLow !== null || row.proposal.typicalMileageHigh !== null) errors.push(`${label}: rewrite mileage claims must be null`);
    for (const value of [...(row.proposal.trims || []), ...(row.proposal.engines || [])]) {
      if (APPLICABILITY_PROSE.test(value)) errors.push(`${label}: applicability prose in trim/engine array: ${value}`);
    }

    const scope = RECALL_SCOPES[row.id] || TSB_SCOPES[row.id];
    if (!scope) errors.push(`${label}: rewrite lacks frozen source scope`);
    if (JSON.stringify(row.proposal.years) !== JSON.stringify(scope?.years)) errors.push(`${label}: years differ from frozen source scope`);
    if (!Array.isArray(row.proposal.citations) || row.proposal.citations.length !== 1) errors.push(`${label}: rewrite must have exactly one primary citation`);
    const citation = row.proposal.citations?.[0];
    if (citation?.url !== expectedCitationUrl(row.id)) errors.push(`${label}: primary citation URL mismatch`);
    if (RECALL_SCOPES[row.id]) {
      if (!citation?.title?.includes(RECALL_SCOPES[row.id].campaign)) errors.push(`${label}: recall title omits campaign`);
    } else if (citation?.url && !citation.url.startsWith('https://static.nhtsa.gov/')) {
      errors.push(`${label}: bulletin is not a direct NHTSA PDF`);
    }
  }

  for (const action of ACTIONS) {
    const actual = packet.rows.filter((row) => row.action === action).length;
    if (packet.summary?.[action] !== actual) errors.push(`summary.${action} mismatch`);
  }
  if (packet.summary?.total !== packet.rows.length) errors.push('summary.total mismatch');
  for (const [model, declared] of Object.entries(packet.byModel || {})) {
    const rows = packet.rows.filter((row) => row.model === model);
    for (const action of ACTIONS) {
      if (declared[action] !== rows.filter((row) => row.action === action).length) errors.push(`byModel.${model}.${action} mismatch`);
    }
    if (declared.total !== rows.length) errors.push(`byModel.${model}.total mismatch`);
  }
  return errors;
}

function argValue(args, flag, fallback) {
  const index = args.indexOf(flag);
  return index >= 0 && args[index + 1] ? path.resolve(args[index + 1]) : fallback;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const packetFile = argValue(args, '--packet', DEFAULT_PACKET);
  const snapshotFile = argValue(args, '--snapshot', DEFAULT_SNAPSHOT);
  const packet = JSON.parse(fs.readFileSync(packetFile, 'utf8'));
  const snapshot = JSON.parse(fs.readFileSync(snapshotFile, 'utf8'));
  const errors = validatePacket(packet, snapshot, sha256File(snapshotFile));
  const result = {
    passed: errors.length === 0,
    packetFile,
    packetSha256: sha256File(packetFile),
    snapshotFile,
    snapshotSha256: sha256File(snapshotFile),
    decisionCount: packet.rows?.length || 0,
    errors,
  };
  console.log(JSON.stringify(result, null, 2));
  if (errors.length) process.exitCode = 1;
}

module.exports = { ACTIONS, APPLICABILITY_PROSE, expectedAction, expectedCitationUrl, validatePacket };
