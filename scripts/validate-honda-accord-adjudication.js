/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const {
  FUEL_PUMP_ID,
  FULL_RECORD_FIELDS,
  REWRITE_CARDS,
  fullRecord,
  hashValue,
  normalizedFileHash,
  rewriteProposal,
} = require('./build-honda-accord-adjudication');

const DEFAULT_PACKET = path.resolve(__dirname, '..', 'data', 'known-issue-honda-accord-adjudication-2026-08-05.json');
const DEFAULT_SNAPSHOT = path.resolve(__dirname, '..', 'data', '_honda-deeplink-snapshot-2026-08-05.json');
const ACTIONS = ['rewrite_same_identity', 'keep_published_pending_source'];

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]));
  }
  return value;
}

function equalValue(left, right) {
  return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right));
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function identityText(record) {
  return normalizeText([
    record.title,
    record.description,
    record.solution,
    ...(record.symptoms || []),
    ...(record.affectedSystems || []),
    ...(record.dtcCodes || []),
  ].join(' '));
}

function collectUrls(value, urls = []) {
  if (typeof value === 'string' && /^https?:\/\//i.test(value)) urls.push(value);
  if (Array.isArray(value)) value.forEach((item) => collectUrls(item, urls));
  else if (value && typeof value === 'object') Object.values(value).forEach((item) => collectUrls(item, urls));
  return urls;
}

function isSearchOrCategoryUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);
    const pathname = url.pathname.toLowerCase();
    return url.searchParams.has('k')
      || url.searchParams.has('_nkw')
      || pathname === '/s'
      || pathname.startsWith('/s/')
      || pathname.includes('/search')
      || pathname.includes('/category/');
  } catch {
    return true;
  }
}

function sha256File(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n')).digest('hex');
}

function expectedAction(id) {
  return REWRITE_CARDS[id] ? 'rewrite_same_identity' : 'keep_published_pending_source';
}

function validatePacket(packet, snapshot, expectedSnapshotSha256 = normalizedFileHash(DEFAULT_SNAPSHOT)) {
  const errors = [];
  const accordRows = snapshot.records.filter((row) => row.make === 'Honda' && row.model === 'Accord');
  const snapshotById = new Map(accordRows.map((row) => [row.id, row]));

  if (packet.schemaVersion !== 1) errors.push('unexpected schema version');
  if (packet.status !== 'proposal-only') errors.push('packet status must be proposal-only');
  if (packet.requiresIndependentApproval !== true) errors.push('packet must require independent approval');
  if (packet.make !== 'Honda' || packet.model !== 'Accord') errors.push('packet scope must be Honda Accord');
  if (packet.source?.snapshotSha256 !== expectedSnapshotSha256) errors.push('snapshot SHA-256 mismatch');
  if (packet.source?.snapshotHash !== snapshot.snapshotHash) errors.push('snapshotHash mismatch');
  if (packet.source?.accordRecordCount !== 56 || accordRows.length !== 56) errors.push('Accord baseline must contain 56 rows');
  if (!Array.isArray(packet.rows)) return [...errors, 'packet rows[] missing'];

  const ids = packet.rows.map((row) => row.id);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  const missingIds = [...snapshotById.keys()].filter((id) => !ids.includes(id));
  const extraIds = ids.filter((id) => !snapshotById.has(id));
  if (duplicateIds.length) errors.push(`duplicate IDs: ${[...new Set(duplicateIds)].join(', ')}`);
  if (missingIds.length) errors.push(`missing Accord IDs: ${missingIds.join(', ')}`);
  if (extraIds.length) errors.push(`extra IDs: ${extraIds.join(', ')}`);

  for (const row of packet.rows) {
    const label = row.id || '<missing>';
    const source = snapshotById.get(row.id);
    if (!source) continue;
    const expectedBefore = fullRecord(source);
    const action = expectedAction(row.id);

    if (row.action !== action) errors.push(`${label}: expected ${action}, got ${row.action}`);
    if (row.beforeSha256 !== hashValue(row.before)) errors.push(`${label}: before hash mismatch`);
    if (row.beforeSha256 !== hashValue(expectedBefore)) errors.push(`${label}: before does not match frozen snapshot`);
    if (!equalValue(row.before, expectedBefore)) errors.push(`${label}: before payload drifted from snapshot`);
    if (row.proposalSha256 !== hashValue(row.proposal)) errors.push(`${label}: proposal hash mismatch`);

    for (const field of FULL_RECORD_FIELDS) {
      if (!Object.prototype.hasOwnProperty.call(row.before, field)) errors.push(`${label}: before missing ${field}`);
      if (!Object.prototype.hasOwnProperty.call(row.proposal, field)) errors.push(`${label}: proposal missing ${field}`);
    }
    if (row.proposal.make !== 'Honda') errors.push(`${label}: make drift`);
    if (row.proposal.model !== 'Accord') errors.push(`${label}: model drift`);
    if (row.proposal.status !== 'published') errors.push(`${label}: proposal must remain published`);

    if (action === 'keep_published_pending_source') {
      if (row.proposalSha256 !== row.beforeSha256) errors.push(`${label}: keep action changed content`);
      if (!equalValue(row.proposal, row.before)) errors.push(`${label}: keep action is not byte-equivalent`);
      if (row.commerceDecision !== 'unchanged-pending-audit') errors.push(`${label}: keep commerce decision drifted`);
      continue;
    }

    const card = REWRITE_CARDS[row.id];
    const expectedProposal = rewriteProposal(expectedBefore, card);
    if (!equalValue(row.proposal, expectedProposal)) errors.push(`${label}: proposal differs from reviewed whitelist`);
    if (row.commerceDecision !== 'no-commerce') errors.push(`${label}: rewrite must be no-commerce`);
    if (!equalValue(row.proposal.citations, card.citations)) errors.push(`${label}: citation-to-card mapping mismatch`);
    if (!equalValue(row.proposal.years, card.years)) errors.push(`${label}: reviewed year scope mismatch`);
    if (row.proposal.title !== card.title) errors.push(`${label}: reviewed title mismatch`);
    if (row.proposal.category !== card.category) errors.push(`${label}: reviewed category mismatch`);
    if (!equalValue(row.proposal.trims, []) || !equalValue(row.proposal.engines, [])) errors.push(`${label}: applicability labels must stay empty`);
    if (!equalValue(row.proposal.fixParts, []) || !equalValue(row.proposal.communityRecommendations, [])) errors.push(`${label}: commerce must stay empty`);
    if (row.proposal.estimatedCostLow !== null || row.proposal.estimatedCostHigh !== null) errors.push(`${label}: unverified cost remains`);
    if (row.proposal.typicalMileageLow !== null || row.proposal.typicalMileageHigh !== null) errors.push(`${label}: unverified mileage remains`);

    const beforeIdentity = identityText(row.before);
    const proposalIdentity = identityText(row.proposal);
    for (const term of card.identityTerms) {
      const normalizedTerm = normalizeText(term);
      if (!beforeIdentity.includes(normalizedTerm)) errors.push(`${label}: before identity lacks ${term}`);
      if (!proposalIdentity.includes(normalizedTerm)) errors.push(`${label}: proposal identity lacks ${term}`);
    }

    const commerceUrls = collectUrls({
      communityRecommendations: row.proposal.communityRecommendations,
      fixParts: row.proposal.fixParts,
    });
    if (commerceUrls.length) errors.push(`${label}: rewrite contains an unauthorized commerce URL`);
    const allUrls = collectUrls(row.proposal);
    if (allUrls.some(isSearchOrCategoryUrl)) errors.push(`${label}: search/category URL remains`);
  }

  for (const action of ACTIONS) {
    const count = packet.rows.filter((row) => row.action === action).length;
    if (packet.summary?.[action] !== count) errors.push(`summary.${action} mismatch`);
  }
  if (packet.summary?.rewrite_same_identity !== 13) errors.push('rewrite whitelist count must be 13');
  if (packet.summary?.keep_published_pending_source !== 43) errors.push('keep count must be 43');
  if (packet.summary?.total !== 56 || packet.rows.length !== 56) errors.push('packet total must be 56');
  if (packet.rows.some((row) => row.proposal?.status !== 'published')) errors.push('archive/removal action detected');

  const fuelPump = packet.rows.find((row) => row.id === FUEL_PUMP_ID);
  if (!fuelPump) errors.push('fuel-pump correction missing');
  else {
    const fuelJson = JSON.stringify(fuelPump.proposal);
    if (/20V[- ]?374/i.test(fuelJson)) errors.push('false 20V374 campaign remains');
    const expectedUrls = REWRITE_CARDS[FUEL_PUMP_ID].citations.map((citation) => citation.url);
    const actualUrls = fuelPump.proposal.citations.map((citation) => citation.url);
    if (!equalValue(actualUrls, expectedUrls)) errors.push('fuel-pump campaign set mismatch');
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
  console.log(JSON.stringify({
    passed: errors.length === 0,
    packetFile,
    packetSha256: sha256File(packetFile),
    snapshotFile,
    snapshotSha256: sha256File(snapshotFile),
    decisionCount: packet.rows?.length || 0,
    errors,
  }, null, 2));
  if (errors.length) process.exitCode = 1;
}

module.exports = {
  ACTIONS,
  collectUrls,
  identityText,
  isSearchOrCategoryUrl,
  normalizeText,
  validatePacket,
};
