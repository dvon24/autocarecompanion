/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { FULL_RECORD_FIELDS, hashValue, normalizedFileHash, stableValue } = require('./hyundai-adjudication-utils');
const { IDS, KEEP_REASONS, REWRITE_CARDS, SOURCES, fullRecord } = require('./build-hyundai-accent-adjudication');
const PACKET = path.resolve(__dirname, '..', 'data', 'known-issue-hyundai-accent-adjudication-2026-08-06.json');
const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_hyundai-deeplink-snapshot-2026-08-06.json');
function equal(left, right) { return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right)); }

function validatePacket(packet, snapshot, expectedSnapshotSha256 = normalizedFileHash(SNAPSHOT)) {
  const errors = [];
  const modelRows = snapshot.records.filter((row) => row.make === 'Hyundai' && row.model === 'Accent');
  const snapshotById = new Map(modelRows.map((row) => [row.id, row]));
  const rewriteIds = new Set(Object.keys(REWRITE_CARDS));
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true) errors.push('packet safety status mismatch');
  if (packet.make !== 'Hyundai' || packet.model !== 'Accent') errors.push('packet scope mismatch');
  if (packet.source?.snapshotSha256 !== expectedSnapshotSha256 || packet.source?.snapshotHash !== snapshot.snapshotHash) errors.push('snapshot binding mismatch');
  if (packet.source?.accentRecordCount !== 7 || modelRows.length !== 7 || packet.rows?.length !== 7) errors.push('Accent row count mismatch');
  const ids = packet.rows?.map((row) => row.id) || [];
  if (new Set(ids).size !== ids.length) errors.push('duplicate IDs');
  for (const id of snapshotById.keys()) if (!ids.includes(id)) errors.push(`missing Accent ID: ${id}`);
  for (const row of packet.rows || []) {
    const frozen = snapshotById.get(row.id);
    if (!frozen) { errors.push(`unknown Accent ID: ${row.id}`); continue; }
    const before = fullRecord(frozen);
    const shouldRewrite = rewriteIds.has(row.id);
    if (row.action !== (shouldRewrite ? 'rewrite_same_identity' : 'keep_published_pending_source')) errors.push(`${row.id}: action mismatch`);
    if (!equal(row.before, before) || row.beforeSha256 !== hashValue(before)) errors.push(`${row.id}: frozen before mismatch`);
    if (row.proposalSha256 !== hashValue(row.proposal)) errors.push(`${row.id}: proposal hash mismatch`);
    if (row.proposal.make !== 'Hyundai' || row.proposal.model !== 'Accent' || row.proposal.status !== 'published' || /^Archived\s*-/i.test(row.proposal.title)) errors.push(`${row.id}: identity/status drift`);
    for (const field of FULL_RECORD_FIELDS) if (!Object.prototype.hasOwnProperty.call(row.before, field) || !Object.prototype.hasOwnProperty.call(row.proposal, field)) errors.push(`${row.id}: missing ${field}`);
    if (shouldRewrite) {
      const card = REWRITE_CARDS[row.id];
      if (!equal(row.proposal.years, card.years)) errors.push(`${row.id}: year scope mismatch`);
      if (!row.changedFields?.length) errors.push(`${row.id}: rewrite has no changed fields`);
      if (row.proposal.trims.length || row.proposal.engines.length) errors.push(`${row.id}: rewrite invented applicability`);
      if (row.proposal.communityRecommendations.length || row.proposal.fixParts.length) errors.push(`${row.id}: rewrite contains commerce`);
      if ([row.proposal.estimatedCostLow, row.proposal.estimatedCostHigh, row.proposal.typicalMileageLow, row.proposal.typicalMileageHigh].some((value) => value !== null)) errors.push(`${row.id}: rewrite contains cost/mileage claims`);
      for (const term of card.identityTerms) if (!`${row.proposal.title} ${row.proposal.description}`.toLowerCase().includes(term.toLowerCase())) errors.push(`${row.id}: missing identity term ${term}`);
      for (const citation of row.proposal.citations) if (!['api.nhtsa.gov', 'static.nhtsa.gov'].includes(new URL(citation.url).hostname)) errors.push(`${row.id}: non-primary source`);
    } else {
      if (!KEEP_REASONS[row.id]) errors.push(`${row.id}: specific keep reason missing`);
      if (!equal(row.proposal, before) || row.proposalSha256 !== row.beforeSha256 || row.changedFields?.length !== 0) errors.push(`${row.id}: hold changed content`);
    }
  }
  if (packet.summary?.rewrite_same_identity !== 3 || packet.summary?.keep_published_pending_source !== 4 || packet.summary?.total !== 7) errors.push('summary mismatch');
  const urls = [...new Set((packet.rows || []).filter((row) => row.action === 'rewrite_same_identity').flatMap((row) => row.proposal.citations.map((item) => item.url)))].sort();
  if (!equal(urls, Object.values(SOURCES).sort())) errors.push('source set mismatch');
  const abs = packet.rows?.find((row) => row.id === IDS.absFire)?.proposal;
  if (!abs || !equal(abs.years, [2012, 2013, 2014, 2015]) || !/replace the ABS fuse/i.test(abs.solution) || /replace.*HECU|240,589|O-ring/i.test(`${abs.description} ${abs.solution}`)) errors.push('ABS correction mismatch');
  const stopLamp = packet.rows?.find((row) => row.id === IDS.stopLamp)?.proposal;
  if (!stopLamp || !equal(stopLamp.years, [2006, 2007, 2008, 2009, 2010, 2011]) || stopLamp.citations.length !== 3) errors.push('stop-lamp correction mismatch');
  const pretensioner = packet.rows?.find((row) => row.id === IDS.pretensioner)?.proposal;
  if (!pretensioner || !equal(pretensioner.years, [2020, 2021, 2022]) || pretensioner.years.includes(2019) || !/protective cap/i.test(pretensioner.solution)) errors.push('pretensioner amended-scope mismatch');
  for (const code of ['pretensioner-amended-scope', 'stop-lamp-overlapping-campaigns-preserved', 'abs-remedy-narrowed-to-official-record', 'unsupported-accent-narratives-frozen']) if (!packet.observations?.some((item) => item.code === code)) errors.push(`missing observation ${code}`);
  return errors;
}

if (require.main === module) {
  const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8'));
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const errors = validatePacket(packet, snapshot);
  console.log(JSON.stringify({ passed: errors.length === 0, packetSha256: normalizedFileHash(PACKET), decisionCount: packet.rows?.length || 0, errors }, null, 2));
  if (errors.length) process.exitCode = 1;
}
module.exports = { validatePacket };
