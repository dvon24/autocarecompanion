/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const {
  FULL_RECORD_FIELDS,
  fullRecord,
  hashValue,
  normalizedFileHash,
  stableValue,
} = require('./jeep-adjudication-utils');
const {
  ALL_IDS,
  CAMPAIGNS,
  OFFICIAL_PDF_URLS,
  evidenceFor,
  reasonFor,
  sourceClassFor,
} = require('./build-jeep-grand-cherokee-adjudication');

const PACKET = path.resolve(__dirname, '..', 'data', 'known-issue-jeep-grand-cherokee-adjudication-2026-08-06.json');
const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_jeep-deeplink-snapshot-2026-08-06.json');

function equal(a, b) {
  return JSON.stringify(stableValue(a)) === JSON.stringify(stableValue(b));
}

function validatePacket(packet, snapshot, expectedSnapshotSha256 = normalizedFileHash(SNAPSHOT)) {
  const errors = [];
  const modelRows = snapshot.records.filter((row) => row.make === 'Jeep' && row.model === 'Grand Cherokee');
  const frozenById = new Map(modelRows.map((row) => [row.id, row]));
  const ids = packet.rows?.map((row) => row.id) || [];

  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true) errors.push('packet safety status mismatch');
  if (packet.make !== 'Jeep' || packet.model !== 'Grand Cherokee') errors.push('packet scope mismatch');
  if (packet.source?.snapshotSha256 !== expectedSnapshotSha256 || packet.source?.snapshotHash !== snapshot.snapshotHash) errors.push('snapshot binding mismatch');
  if (packet.source?.modelRecordCount !== 77 || modelRows.length !== 77 || ids.length !== 77 || new Set(ids).size !== 77) errors.push('Grand Cherokee row count mismatch');
  if (!equal(ids.slice().sort(), [...frozenById.keys()].sort()) || !equal([...ALL_IDS].sort(), [...frozenById.keys()].sort())) errors.push('frozen ID coverage mismatch');

  const calculatedSourceQuality = {};
  for (const row of packet.rows || []) {
    const frozen = frozenById.get(row.id);
    if (!frozen) {
      errors.push(`${row.id}: unknown ID`);
      continue;
    }
    const before = fullRecord(frozen);
    const sourceClass = sourceClassFor(frozen);
    calculatedSourceQuality[sourceClass] = (calculatedSourceQuality[sourceClass] || 0) + 1;
    if (row.action !== 'keep_published_pending_source' || row.reason !== reasonFor(frozen)) errors.push(`${row.id}: decision mismatch`);
    if (row.sourceClass !== sourceClass) errors.push(`${row.id}: source classification mismatch`);
    if (!equal(row.before, before) || !equal(row.proposal, before) || row.beforeSha256 !== hashValue(before) || row.proposalSha256 !== hashValue(before) || row.proposalSha256 !== row.beforeSha256 || !equal(row.changedFields, [])) errors.push(`${row.id}: hold drift`);
    if (row.proposal.make !== 'Jeep' || row.proposal.model !== 'Grand Cherokee' || row.proposal.status !== 'published' || row.proposal.title !== before.title || row.proposal.category !== before.category || !equal(row.proposal.years, before.years) || /^Archived\s*-/i.test(row.proposal.title)) errors.push(`${row.id}: identity/status drift`);
    if (!equal(row.evidence, evidenceFor(frozen)) || !row.evidence?.length) errors.push(`${row.id}: evidence drift`);
    for (const field of FULL_RECORD_FIELDS) {
      if (!Object.prototype.hasOwnProperty.call(row.before, field) || !Object.prototype.hasOwnProperty.call(row.proposal, field)) errors.push(`${row.id}: missing ${field}`);
    }
  }

  if (!equal(packet.summary, { rewrite_same_identity: 0, keep_published_pending_source: 77, total: 77 })) errors.push('summary mismatch');
  if (!equal(packet.sourceQuality, calculatedSourceQuality)) errors.push('source quality mismatch');
  if (!equal(packet.campaignSources, CAMPAIGNS)) errors.push('campaign source map mismatch');
  if (!equal(packet.officialPdfLinks, OFFICIAL_PDF_URLS) || packet.officialPdfLinks?.length !== 39) errors.push('official PDF link inventory mismatch');
  for (const code of [
    'grand-cherokee-fuel-tank-recall-scope-overreach',
    'grand-cherokee-loss-of-drive-title-is-steering-recall',
    'grand-cherokee-rear-coil-current-recall-scope-mismatch',
    'grand-cherokee-second-row-airbag-source-is-front-seat',
    'grand-cherokee-duplicate-alternator-pages',
    'grand-cherokee-overlapping-oil-filter-housing-pages',
    'grand-cherokee-overlapping-cylinder-head-pages',
    'grand-cherokee-overlapping-hemi-tick-pages',
    'grand-cherokee-overlapping-evap-pages',
    'grand-cherokee-generic-recall-links-are-not-deep-links',
    'all-grand-cherokee-pages-preserved',
  ]) {
    if (!packet.observations?.some((item) => item.code === code)) errors.push(`missing observation ${code}`);
  }
  return errors;
}

if (require.main === module) {
  const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8'));
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const errors = validatePacket(packet, snapshot);
  console.log(JSON.stringify({ passed: errors.length === 0, packetSha256: normalizedFileHash(PACKET), decisionCount: packet.rows?.length || 0, errors }, null, 2));
  if (errors.length) process.exitCode = 1;
}

module.exports = { PACKET, SNAPSHOT, validatePacket };
