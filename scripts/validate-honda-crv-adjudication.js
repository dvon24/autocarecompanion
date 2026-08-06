/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const {
  FULL_RECORD_FIELDS,
  IDS,
  REWRITE_CARDS,
  fullRecord,
  hashValue,
  normalizedFileHash,
  rewriteProposal,
} = require('./build-honda-crv-adjudication');

const DEFAULT_PACKET = path.resolve(__dirname, '..', 'data', 'known-issue-honda-crv-adjudication-2026-08-06.json');
const DEFAULT_SNAPSHOT = path.resolve(__dirname, '..', 'data', '_honda-deeplink-snapshot-2026-08-05.json');

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]));
  return value;
}

function equalValue(left, right) {
  return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right));
}

function normalizeText(value) {
  return String(value || '').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function identityText(record) {
  return normalizeText([record.title, record.description, record.solution, ...(record.symptoms || []), ...(record.affectedSystems || [])].join(' '));
}

function collectUrls(value, urls = []) {
  if (typeof value === 'string' && /^https?:\/\//i.test(value)) urls.push(value);
  if (Array.isArray(value)) value.forEach((item) => collectUrls(item, urls));
  else if (value && typeof value === 'object') Object.values(value).forEach((item) => collectUrls(item, urls));
  return urls;
}

function isSearchUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);
    return url.searchParams.has('k') || url.searchParams.has('_nkw') || url.pathname.toLowerCase().includes('/search');
  } catch {
    return true;
  }
}

function sha256File(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n')).digest('hex');
}

function validatePacket(packet, snapshot, expectedSnapshotSha256 = normalizedFileHash(DEFAULT_SNAPSHOT)) {
  const errors = [];
  const modelRows = snapshot.records.filter((row) => row.make === 'Honda' && row.model === 'CR-V');
  const snapshotById = new Map(modelRows.map((row) => [row.id, row]));
  if (packet.status !== 'proposal-only') errors.push('packet status must be proposal-only');
  if (packet.requiresIndependentApproval !== true) errors.push('packet must require independent approval');
  if (packet.make !== 'Honda' || packet.model !== 'CR-V') errors.push('packet scope must be Honda CR-V');
  if (packet.source?.snapshotSha256 !== expectedSnapshotSha256) errors.push('snapshot SHA-256 mismatch');
  if (packet.source?.snapshotHash !== snapshot.snapshotHash) errors.push('snapshotHash mismatch');
  if (packet.source?.crvRecordCount !== 53 || modelRows.length !== 53) errors.push('CR-V baseline must contain 53 rows');
  if (!Array.isArray(packet.rows)) return [...errors, 'packet rows[] missing'];
  const ids = packet.rows.map((row) => row.id);
  if (new Set(ids).size !== ids.length) errors.push('duplicate IDs');
  for (const id of snapshotById.keys()) if (!ids.includes(id)) errors.push(`missing CR-V ID: ${id}`);
  for (const id of ids) if (!snapshotById.has(id)) errors.push(`extra ID: ${id}`);

  for (const row of packet.rows) {
    const source = snapshotById.get(row.id);
    if (!source) continue;
    const before = fullRecord(source);
    const card = REWRITE_CARDS[row.id];
    const expectedAction = card ? 'rewrite_same_identity' : 'keep_published_pending_source';
    if (row.action !== expectedAction) errors.push(`${row.id}: action mismatch`);
    if (!equalValue(row.before, before) || row.beforeSha256 !== hashValue(before)) errors.push(`${row.id}: frozen before mismatch`);
    if (row.beforeSha256 !== hashValue(row.before) || row.proposalSha256 !== hashValue(row.proposal)) errors.push(`${row.id}: payload hash mismatch`);
    for (const field of FULL_RECORD_FIELDS) {
      if (!Object.prototype.hasOwnProperty.call(row.before, field) || !Object.prototype.hasOwnProperty.call(row.proposal, field)) errors.push(`${row.id}: missing ${field}`);
    }
    if (row.proposal.make !== 'Honda' || row.proposal.model !== 'CR-V' || row.proposal.status !== 'published') errors.push(`${row.id}: identity/status drift`);
    if (!card) {
      if (!equalValue(row.proposal, row.before) || row.proposalSha256 !== row.beforeSha256) errors.push(`${row.id}: keep changed content`);
      continue;
    }
    if (!equalValue(row.proposal, rewriteProposal(before, card))) errors.push(`${row.id}: proposal differs from whitelist`);
    if (!equalValue(row.proposal.citations, card.citations) || !equalValue(row.proposal.years, card.years)) errors.push(`${row.id}: source/scope mismatch`);
    if (!equalValue(row.proposal.trims, []) || !equalValue(row.proposal.engines, [])) errors.push(`${row.id}: applicability arrays must be empty`);
    if (!equalValue(row.proposal.fixParts, []) || !equalValue(row.proposal.communityRecommendations, [])) errors.push(`${row.id}: commerce remains`);
    if (row.proposal.estimatedCostLow !== null || row.proposal.estimatedCostHigh !== null) errors.push(`${row.id}: cost remains`);
    if (row.proposal.typicalMileageLow !== null || row.proposal.typicalMileageHigh !== null) errors.push(`${row.id}: mileage claim remains`);
    if (row.proposal.humanApproved !== false || row.proposal.reportCount !== 0) errors.push(`${row.id}: approval/report fields unsafe`);
    for (const term of card.identityTerms) {
      if (!identityText(row.before).includes(normalizeText(term)) || !identityText(row.proposal).includes(normalizeText(term))) errors.push(`${row.id}: identity lacks ${term}`);
    }
    if (collectUrls(row.proposal).some(isSearchUrl)) errors.push(`${row.id}: search URL remains`);
  }

  if (packet.summary?.rewrite_same_identity !== 19) errors.push('rewrite count must be 19');
  if (packet.summary?.keep_published_pending_source !== 34) errors.push('keep count must be 34');
  if (packet.summary?.total !== 53 || packet.rows.length !== 53) errors.push('packet total must be 53');
  const byId = new Map(packet.rows.map((row) => [row.id, row]));
  const exactYears = [
    [IDS.oilDilutionLong, [2017, 2018]],
    [IDS.shaftSealLong, [2017, 2018, 2019, 2020, 2021, 2022]],
    [IDS.fuelCellCoolant, [2025]],
    [IDS.airbagHarness, [2019]],
    [IDS.seatBeltBuckle, [2017, 2018, 2019, 2020]],
    [IDS.highPressureFuelPump, [2023, 2024, 2025]],
    [IDS.highVoltageBattery, [2023]],
    [IDS.pistonRings, [2008, 2009, 2010, 2011]],
    [IDS.lowPressureFuelPumpLong, [2018, 2019, 2020]],
    [IDS.phantomBraking, [2017, 2018, 2019, 2020, 2021, 2022]],
    [IDS.stickySteering, [2023, 2024, 2025]],
    [IDS.vibration, [2015]],
    [IDS.acClutch, [2007, 2008, 2009, 2010, 2011]],
    [IDS.infotainment, [2017, 2018, 2019]],
    [IDS.rearFrame, [2007, 2008, 2009, 2010, 2011]],
    [IDS.vtcActuator, [2010, 2011, 2012, 2013]],
  ];
  for (const [id, years] of exactYears) if (!equalValue(byId.get(id)?.proposal.years, years)) errors.push(`${id}: exact year scope mismatch`);
  const overlapSets = [
    [IDS.oilDilutionLong, IDS.oilDilutionShort],
    [IDS.shaftSealLong, IDS.shaftSealShort],
    [IDS.lowPressureFuelPumpLong, IDS.lowPressureFuelPumpShort],
  ];
  for (const [left, right] of overlapSets) {
    const leftProposal = byId.get(left)?.proposal;
    const rightProposal = byId.get(right)?.proposal;
    if (!leftProposal || !rightProposal || !equalValue(leftProposal.years, rightProposal.years) || !equalValue(leftProposal.citations, rightProposal.citations)) errors.push(`${left}/${right}: overlap correction mismatch`);
  }
  if (!/investigation record, not a recall/i.test(byId.get(IDS.phantomBraking)?.proposal.description || '')) errors.push('phantom-braking investigation disclaimer missing');
  if (!/23V-228/.test(byId.get(IDS.rearFrame)?.proposal.title || '')) errors.push('rear-frame recall number not corrected');
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
