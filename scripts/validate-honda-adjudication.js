/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const {
  ACTION_BY_ID,
  FULL_RECORD_FIELDS,
  RIDGELINE_ID,
  RIDGELINE_MANUAL_2006,
  RIDGELINE_MANUAL_2014,
  S2000_ID,
  diffFields,
  fullRecord,
  hashValue,
} = require('./build-honda-adjudication');

const DEFAULT_PACKET = path.resolve(__dirname, '..', 'data', 'known-issue-honda-adjudication-2026-08-05.json');
const DEFAULT_SNAPSHOT = path.resolve(__dirname, '..', 'data', '_honda-deeplink-snapshot-2026-08-05.json');
const ACTIONS = ['correct_clicked_integrity', 'remove_invalid_search_link', 'keep_published_pending_source'];
const RIDGELINE_ALLOWED_DIFFS = [
  'solution',
  'estimatedCostLow',
  'estimatedCostHigh',
  'typicalMileageLow',
  'typicalMileageHigh',
  'citations',
  'communityRecommendations',
  'reviewedOn',
  'contentUpdatedOn',
  'contentUpdateSummary',
];
const S2000_ALLOWED_DIFFS = ['communityRecommendations', 'contentUpdatedOn', 'contentUpdateSummary'];

function sha256File(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n')).digest('hex');
}

function actionFor(id) {
  return ACTION_BY_ID.get(id) || 'keep_published_pending_source';
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

function sameSet(left, right) {
  return JSON.stringify([...left].sort()) === JSON.stringify([...right].sort());
}

function validatePacket(packet, snapshot, snapshotSha256) {
  const errors = [];
  if (packet.status !== 'proposal-only') errors.push('packet status must be proposal-only');
  if (packet.auditStage !== 'priority-click-integrity-and-make-inventory') errors.push('unexpected audit stage');
  if (packet.requiresIndependentApproval !== true) errors.push('packet must require independent approval');
  if (packet.make !== 'Honda') errors.push('packet make must be Honda');
  if (packet.source?.snapshotSha256 !== snapshotSha256) errors.push('snapshot SHA-256 mismatch');
  if (packet.source?.snapshotHash !== snapshot.snapshotHash) errors.push('snapshotHash mismatch');
  if (JSON.stringify(packet.source?.inventory) !== JSON.stringify(snapshot.inventory)) errors.push('source inventory mismatch');
  if (!packet.observations?.some((item) => item.code === 'model-case-split')) errors.push('Del Sol model-case observation missing');
  if (!packet.observations?.some((item) => item.code === 'commerce-backlog')) errors.push('commerce backlog observation missing');
  if (!Array.isArray(packet.rows)) return [...errors, 'packet rows[] missing'];
  if (packet.rows.some((row) => row.proposal?.status !== 'published')) errors.push('every proposal must remain published');

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
    const expectedAction = actionFor(row.id);
    if (row.action !== expectedAction) errors.push(`${label}: unexpected action ${row.action}`);
    if (row.beforeSha256 !== hashValue(row.before)) errors.push(`${label}: before hash mismatch`);
    if (row.beforeSha256 !== hashValue(before)) errors.push(`${label}: before does not match snapshot`);
    if (row.proposalSha256 !== hashValue(row.proposal)) errors.push(`${label}: proposal hash mismatch`);
    for (const field of FULL_RECORD_FIELDS) {
      if (!Object.prototype.hasOwnProperty.call(row.before, field)) errors.push(`${label}: before missing ${field}`);
      if (!Object.prototype.hasOwnProperty.call(row.proposal, field)) errors.push(`${label}: proposal missing ${field}`);
    }
    if (row.proposal.make !== 'Honda') errors.push(`${label}: make drift`);
    if (row.proposal.model !== row.before.model || row.model !== row.proposal.model) errors.push(`${label}: model drift`);
    if (row.proposal.title !== row.before.title) errors.push(`${label}: title drift`);
    if (JSON.stringify(row.proposal.years) !== JSON.stringify(row.before.years)) errors.push(`${label}: model-year scope drift`);
    if (row.proposal.status !== 'published') errors.push(`${label}: proposal must remain published`);
    const actualDiffs = diffFields(row.before, row.proposal);
    if (!sameSet(row.changedFields || [], actualDiffs)) errors.push(`${label}: changedFields mismatch`);

    if (row.action === 'keep_published_pending_source') {
      if (row.proposalSha256 !== row.beforeSha256) errors.push(`${label}: keep action changed content`);
      if (JSON.stringify(row.proposal) !== JSON.stringify(row.before)) errors.push(`${label}: keep action is not byte-equivalent JSON`);
      if (row.commerceDecision !== 'unchanged-pending-audit') errors.push(`${label}: keep commerce decision changed`);
      continue;
    }

    if (source.priorityClicks < 1) errors.push(`${label}: changed row was not a clicked priority row`);
    if (row.commerceDecision !== 'no-commerce') errors.push(`${label}: changed row must be no-commerce`);
    if (!Array.isArray(row.proposal.fixParts) || row.proposal.fixParts.length) errors.push(`${label}: fixParts must be empty`);
    const proposalUrls = collectUrls({
      communityRecommendations: row.proposal.communityRecommendations,
      fixParts: row.proposal.fixParts,
    });
    if (proposalUrls.some(isSearchOrCategoryUrl)) errors.push(`${label}: invalid search/category commerce URL remains`);

    if (row.id === RIDGELINE_ID) {
      if (!sameSet(actualDiffs, RIDGELINE_ALLOWED_DIFFS)) errors.push(`${label}: unexpected changed fields ${actualDiffs.join(', ')}`);
      if (!row.proposal.solution.includes('Honda VTM-4 Differential Fluid')) errors.push(`${label}: VTM-4 correction missing`);
      if (/\bDPSF\b/i.test(JSON.stringify(row.proposal))) errors.push(`${label}: DPSF mismatch remains`);
      if (row.proposal.estimatedCostLow !== null || row.proposal.estimatedCostHigh !== null) errors.push(`${label}: unverified costs remain`);
      if (row.proposal.typicalMileageLow !== null || row.proposal.typicalMileageHigh !== null) errors.push(`${label}: unverified mileage remains`);
      const citationUrls = row.proposal.citations.map((citation) => citation.url);
      if (!sameSet(citationUrls, [RIDGELINE_MANUAL_2006, RIDGELINE_MANUAL_2014])) errors.push(`${label}: boundary-year manual citations mismatch`);
      if (!Array.isArray(row.evidence) || row.evidence.length !== 3) errors.push(`${label}: evidence ledger incomplete`);
    }

    if (row.id === S2000_ID) {
      if (!sameSet(actualDiffs, S2000_ALLOWED_DIFFS)) errors.push(`${label}: unexpected changed fields ${actualDiffs.join(', ')}`);
      const beforeLinked = row.before.communityRecommendations.filter((item) => item.affiliateUrl);
      const afterLinked = row.proposal.communityRecommendations.filter((item) => item.affiliateUrl);
      if (beforeLinked.length !== 1 || afterLinked.length !== 0) errors.push(`${label}: invalid affiliate URL was not removed exactly once`);
      if (!Array.isArray(row.evidence) || row.evidence.length !== 2) errors.push(`${label}: evidence ledger incomplete`);
    }
  }

  for (const action of ACTIONS) {
    const actual = packet.rows.filter((row) => row.action === action).length;
    if (packet.summary?.[action] !== actual) errors.push(`summary.${action} mismatch`);
  }
  if (packet.summary?.total !== packet.rows.length) errors.push('summary.total mismatch');
  if (packet.rows.length !== snapshot.records.length) errors.push('packet and snapshot counts differ');
  if (packet.rows.filter((row) => row.action !== 'keep_published_pending_source').length !== snapshot.inventory.clickedCommerceIssueCount) {
    errors.push('changed-row count does not match clicked-commerce inventory');
  }

  const models = [...new Set(packet.rows.map((row) => row.model))].sort();
  if (!sameSet(Object.keys(packet.byModel || {}), models)) errors.push('byModel keys do not reconcile');
  for (const model of models) {
    const declared = packet.byModel?.[model];
    const rows = packet.rows.filter((row) => row.model === model);
    for (const action of ACTIONS) {
      if (declared?.[action] !== rows.filter((row) => row.action === action).length) errors.push(`byModel.${model}.${action} mismatch`);
    }
    if (declared?.total !== rows.length) errors.push(`byModel.${model}.total mismatch`);
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

module.exports = {
  ACTIONS,
  RIDGELINE_ALLOWED_DIFFS,
  S2000_ALLOWED_DIFFS,
  actionFor,
  collectUrls,
  isSearchOrCategoryUrl,
  validatePacket,
};
