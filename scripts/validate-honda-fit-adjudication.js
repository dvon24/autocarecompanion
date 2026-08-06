/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { FULL_RECORD_FIELDS, IDS, REWRITE_CARDS, SOURCES, fullRecord, hashValue, normalizedFileHash } = require('./build-honda-fit-adjudication');
const DEFAULT_PACKET = path.resolve(__dirname, '..', 'data', 'known-issue-honda-fit-adjudication-2026-08-06.json');
const DEFAULT_SNAPSHOT = path.resolve(__dirname, '..', 'data', '_honda-deeplink-snapshot-2026-08-05.json');
function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]));
  return value;
}
function equalValue(left, right) { return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right)); }
function sha256File(file) { return crypto.createHash('sha256').update(fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n')).digest('hex'); }

function validatePacket(packet, snapshot, expectedSnapshotSha256 = normalizedFileHash(DEFAULT_SNAPSHOT)) {
  const errors = [];
  const modelRows = snapshot.records.filter((row) => row.make === 'Honda' && row.model === 'Fit');
  const snapshotById = new Map(modelRows.map((row) => [row.id, row]));
  const rewriteIds = new Set(Object.keys(REWRITE_CARDS));
  if (packet.status !== 'proposal-only') errors.push('packet status must be proposal-only');
  if (packet.requiresIndependentApproval !== true) errors.push('packet must require independent approval');
  if (packet.make !== 'Honda' || packet.model !== 'Fit') errors.push('packet scope mismatch');
  if (packet.source?.snapshotSha256 !== expectedSnapshotSha256) errors.push('snapshot SHA-256 mismatch');
  if (packet.source?.snapshotHash !== snapshot.snapshotHash) errors.push('snapshotHash mismatch');
  if (packet.source?.fitRecordCount !== 11 || modelRows.length !== 11) errors.push('Fit baseline must contain 11 rows');
  if (!Array.isArray(packet.rows)) return [...errors, 'packet rows[] missing'];
  const ids = packet.rows.map((row) => row.id);
  if (new Set(ids).size !== ids.length) errors.push('duplicate IDs');
  for (const id of snapshotById.keys()) if (!ids.includes(id)) errors.push(`missing Fit ID: ${id}`);
  for (const id of ids) if (!snapshotById.has(id)) errors.push(`extra ID: ${id}`);
  for (const row of packet.rows) {
    const source = snapshotById.get(row.id);
    if (!source) continue;
    const before = fullRecord(source);
    const shouldRewrite = rewriteIds.has(row.id);
    if (row.action !== (shouldRewrite ? 'rewrite_same_identity' : 'keep_published_pending_source')) errors.push(`${row.id}: action mismatch`);
    if (!equalValue(row.before, before) || row.beforeSha256 !== hashValue(before)) errors.push(`${row.id}: frozen before mismatch`);
    if (row.beforeSha256 !== hashValue(row.before) || row.proposalSha256 !== hashValue(row.proposal)) errors.push(`${row.id}: payload hash mismatch`);
    if (row.proposal.make !== 'Honda' || row.proposal.model !== 'Fit' || row.proposal.status !== 'published') errors.push(`${row.id}: identity/status drift`);
    for (const field of FULL_RECORD_FIELDS) if (!Object.prototype.hasOwnProperty.call(row.before, field) || !Object.prototype.hasOwnProperty.call(row.proposal, field)) errors.push(`${row.id}: missing ${field}`);
    if (shouldRewrite) {
      const card = REWRITE_CARDS[row.id];
      if (!equalValue(row.proposal.years, card.years)) errors.push(`${row.id}: year scope mismatch`);
      if (!row.changedFields?.length) errors.push(`${row.id}: rewrite has no changed fields`);
      if (row.proposal.trims.length || row.proposal.engines.length) errors.push(`${row.id}: rewrite invented applicability`);
      if (row.proposal.communityRecommendations.length || row.proposal.fixParts.length) errors.push(`${row.id}: rewrite contains commerce`);
      if (row.proposal.estimatedCostLow !== null || row.proposal.estimatedCostHigh !== null || row.proposal.typicalMileageLow !== null || row.proposal.typicalMileageHigh !== null) errors.push(`${row.id}: rewrite contains cost/mileage claims`);
      if (!row.proposal.citations.some((citation) => citation.url === card.citations[0].url)) errors.push(`${row.id}: official source missing`);
    } else {
      if (!equalValue(row.proposal, before) || row.proposalSha256 !== row.beforeSha256) errors.push(`${row.id}: keep changed content`);
      if (row.changedFields?.length !== 0) errors.push(`${row.id}: changedFields must be empty`);
    }
  }
  if (packet.summary?.rewrite_same_identity !== 3) errors.push('rewrite count must be 3');
  if (packet.summary?.keep_published_pending_source !== 8) errors.push('keep count must be 8');
  if (packet.summary?.total !== 11 || packet.rows.length !== 11) errors.push('packet total must be 11');
  for (const code of ['cvt-recall-scope-narrowed', 'eps-citation-and-scope-corrected', 'fuel-pump-recall-scope-narrowed', 'uncited-claim-cluster']) {
    if (!packet.observations?.some((item) => item.code === code)) errors.push(`missing observation: ${code}`);
  }
  const packetUrls = [...new Set(packet.rows.filter((row) => row.action === 'rewrite_same_identity').flatMap((row) => row.proposal.citations.map((item) => item.url)))].sort();
  const expectedUrls = Object.values(SOURCES).sort();
  if (!equalValue(packetUrls, expectedUrls)) errors.push('rewrite source set mismatch');
  if (!packet.rows.find((row) => row.id === IDS.eps)?.reason?.includes('13-043')) errors.push('EPS citation correction not stated');
  return errors;
}

if (require.main === module) {
  const packet = JSON.parse(fs.readFileSync(DEFAULT_PACKET, 'utf8'));
  const snapshot = JSON.parse(fs.readFileSync(DEFAULT_SNAPSHOT, 'utf8'));
  const errors = validatePacket(packet, snapshot, sha256File(DEFAULT_SNAPSHOT));
  console.log(JSON.stringify({ passed: errors.length === 0, packetSha256: sha256File(DEFAULT_PACKET), decisionCount: packet.rows?.length || 0, errors }, null, 2));
  if (errors.length) process.exitCode = 1;
}
module.exports = { validatePacket };
