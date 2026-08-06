/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { FULL_RECORD_FIELDS, IDS, KEEP_REASONS, REWRITE_CARDS, SOURCES, fullRecord, hashValue, normalizedFileHash } = require('./build-honda-prelude-adjudication');

const DEFAULT_PACKET = path.resolve(__dirname, '..', 'data', 'known-issue-honda-prelude-adjudication-2026-08-06.json');
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
  const modelRows = snapshot.records.filter((row) => row.make === 'Honda' && row.model === 'Prelude');
  const snapshotById = new Map(modelRows.map((row) => [row.id, row]));
  const rewriteIds = new Set(Object.keys(REWRITE_CARDS));
  if (packet.status !== 'proposal-only') errors.push('packet status must be proposal-only');
  if (packet.requiresIndependentApproval !== true) errors.push('packet must require independent approval');
  if (packet.make !== 'Honda' || packet.model !== 'Prelude') errors.push('packet scope mismatch');
  if (packet.source?.snapshotSha256 !== expectedSnapshotSha256) errors.push('snapshot SHA-256 mismatch');
  if (packet.source?.snapshotHash !== snapshot.snapshotHash) errors.push('snapshotHash mismatch');
  if (packet.source?.preludeRecordCount !== 14 || modelRows.length !== 14) errors.push('Prelude baseline must contain 14 rows');
  if (!Array.isArray(packet.rows)) return [...errors, 'packet rows[] missing'];

  const ids = packet.rows.map((row) => row.id);
  if (new Set(ids).size !== ids.length) errors.push('duplicate IDs');
  for (const id of snapshotById.keys()) if (!ids.includes(id)) errors.push(`missing Prelude ID: ${id}`);
  for (const id of ids) if (!snapshotById.has(id)) errors.push(`extra ID: ${id}`);

  for (const row of packet.rows) {
    const source = snapshotById.get(row.id);
    if (!source) continue;
    const before = fullRecord(source);
    const shouldRewrite = rewriteIds.has(row.id);
    if (row.action !== (shouldRewrite ? 'rewrite_same_identity' : 'keep_published_pending_source')) errors.push(`${row.id}: action mismatch`);
    if (!equalValue(row.before, before) || row.beforeSha256 !== hashValue(before)) errors.push(`${row.id}: frozen before mismatch`);
    if (row.beforeSha256 !== hashValue(row.before) || row.proposalSha256 !== hashValue(row.proposal)) errors.push(`${row.id}: payload hash mismatch`);
    if (row.proposal.make !== 'Honda' || row.proposal.model !== 'Prelude' || row.proposal.status !== 'published') errors.push(`${row.id}: identity/status drift`);
    if (/^Archived\s*-/i.test(row.proposal.title)) errors.push(`${row.id}: archived title prohibited`);
    for (const field of FULL_RECORD_FIELDS) if (!Object.prototype.hasOwnProperty.call(row.before, field) || !Object.prototype.hasOwnProperty.call(row.proposal, field)) errors.push(`${row.id}: missing ${field}`);
    if (shouldRewrite) {
      const card = REWRITE_CARDS[row.id];
      if (!equalValue(row.proposal.years, card.years)) errors.push(`${row.id}: year scope mismatch`);
      if (!row.changedFields?.length) errors.push(`${row.id}: rewrite has no changed fields`);
      if (row.proposal.trims.length || row.proposal.engines.length) errors.push(`${row.id}: rewrite invented applicability`);
      if (row.proposal.communityRecommendations.length || row.proposal.fixParts.length) errors.push(`${row.id}: rewrite contains commerce`);
      if (row.proposal.estimatedCostLow !== null || row.proposal.estimatedCostHigh !== null || row.proposal.typicalMileageLow !== null || row.proposal.typicalMileageHigh !== null) errors.push(`${row.id}: rewrite contains cost/mileage claims`);
      if (!row.proposal.citations.length) errors.push(`${row.id}: rewrite missing primary source`);
      for (const citation of card.citations) if (!row.proposal.citations.some((item) => item.url === citation.url)) errors.push(`${row.id}: official source missing: ${citation.url}`);
      for (const term of card.identityTerms) if (!`${row.proposal.title} ${row.proposal.description}`.toLowerCase().includes(term.toLowerCase())) errors.push(`${row.id}: identity term missing: ${term}`);
      for (const citation of row.proposal.citations) {
        const host = new URL(citation.url).hostname;
        if (!['global.honda', 'api.nhtsa.gov'].includes(host)) errors.push(`${row.id}: non-primary citation host ${host}`);
      }
    } else {
      if (!KEEP_REASONS[row.id]) errors.push(`${row.id}: specific keep reason missing`);
      if (!equalValue(row.proposal, before) || row.proposalSha256 !== row.beforeSha256) errors.push(`${row.id}: keep changed content`);
      if (row.changedFields?.length !== 0) errors.push(`${row.id}: changedFields must be empty`);
    }
  }

  if (packet.summary?.rewrite_same_identity !== 4) errors.push('rewrite count must be 4');
  if (packet.summary?.keep_published_pending_source !== 10) errors.push('keep count must be 10');
  if (packet.summary?.total !== 14 || packet.rows.length !== 14) errors.push('packet total must be 14');
  for (const code of ['duplicate-transmission-pages-preserved', 'historical-warranty-not-presented-as-current', 'three-recall-identities-kept-distinct', 'unsupported-prelude-narratives-frozen']) if (!packet.observations?.some((item) => item.code === code)) errors.push(`missing observation: ${code}`);

  const packetUrls = [...new Set(packet.rows.filter((row) => row.action === 'rewrite_same_identity').flatMap((row) => row.proposal.citations.map((item) => item.url)))].sort();
  if (!equalValue(packetUrls, [...new Set(Object.values(SOURCES))].sort())) errors.push('rewrite source set mismatch');
  for (const id of [IDS.transmissionDetailed, IDS.transmissionSparse]) {
    const row = packet.rows.find((item) => item.id === id)?.proposal;
    if (!row || !equalValue(row.years, [2000, 2001]) || !/expired/i.test(row.solution) || row.citations.length !== 1) errors.push(`${id}: transmission correction must use exact historical scope and expiry`);
  }
  const combined = packet.rows.find((row) => row.id === IDS.combinedRecalls)?.proposal;
  if (!combined || !equalValue(combined.years, [1996, 1997, 1998, 1999, 2000, 2001]) || combined.citations.length !== 3) errors.push('combined recall row must preserve all three exact campaign identities');
  const ignition = packet.rows.find((row) => row.id === IDS.ignitionSwitch)?.proposal;
  if (!ignition || !equalValue(ignition.years, [1997, 1998, 1999]) || ignition.citations.length !== 1 || /03V474|35130-S84-A01|one hour/i.test(`${ignition.title} ${ignition.description} ${ignition.solution}`)) errors.push('standalone ignition correction must use only exact 02V120 scope and remove unsupported claims');
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
