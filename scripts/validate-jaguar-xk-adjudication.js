/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { FULL_RECORD_FIELDS, diffFields, fullRecord, hashValue, normalizedFileHash, stableValue } = require('./jaguar-adjudication-utils');
const { DATASET_MARKERS, EXPECTED_CAMPAIGNS, EXPECTED_RECALLS, IDS, KEEP_REASONS, NHTSA_COMMUNICATION_RECORD, PDF_SHA256, PDF_SOURCES, RECALL_QUERIES, REWRITE_CARDS, SOURCES, VISUALLY_INSPECTED_PAGES, evidenceFor, rewriteProposal } = require('./build-jaguar-xk-adjudication');

const PACKET = path.resolve(__dirname, '..', 'data', 'known-issue-jaguar-xk-adjudication-2026-08-06.json');
const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_jaguar-deeplink-snapshot-2026-08-06.json');
function equal(left, right) { return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right)); }
function collectUrls(value, urls = []) { if (typeof value === 'string' && /^https?:\/\//i.test(value)) urls.push(value); else if (Array.isArray(value)) value.forEach((item) => collectUrls(item, urls)); else if (value && typeof value === 'object') Object.values(value).forEach((item) => collectUrls(item, urls)); return urls; }
function isSearchUrl(raw) { try { const url = new URL(raw); return url.searchParams.has('k') || url.searchParams.has('_nkw') || /\/search\/?$/i.test(url.pathname); } catch { return true; } }

function validatePacket(packet, snapshot, expectedSnapshotSha256 = normalizedFileHash(SNAPSHOT)) {
  const errors = [];
  const modelRows = snapshot.records.filter((row) => row.make === 'Jaguar' && row.model === 'XK');
  const frozenById = new Map(modelRows.map((row) => [row.id, row]));
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true) errors.push('packet safety status mismatch');
  if (packet.make !== 'Jaguar' || packet.model !== 'XK') errors.push('packet scope mismatch');
  if (packet.source?.snapshotSha256 !== expectedSnapshotSha256 || packet.source?.snapshotHash !== snapshot.snapshotHash) errors.push('snapshot binding mismatch');
  if (packet.source?.modelRecordCount !== 22 || modelRows.length !== 22 || packet.rows?.length !== 22) errors.push('XK row count mismatch');
  const ids = packet.rows?.map((row) => row.id) || [];
  if (new Set(ids).size !== 22) errors.push('duplicate or missing IDs');
  for (const id of frozenById.keys()) if (!ids.includes(id)) errors.push(`missing XK ID: ${id}`);
  for (const id of ids) if (!frozenById.has(id)) errors.push(`unknown XK ID: ${id}`);

  for (const row of packet.rows || []) {
    const frozen = frozenById.get(row.id);
    if (!frozen) continue;
    const before = fullRecord(frozen);
    const card = REWRITE_CARDS[row.id];
    const expectedAction = card ? 'rewrite_same_identity' : 'keep_published_pending_source';
    if (row.action !== expectedAction) errors.push(`${row.id}: decision mismatch`);
    if (!equal(row.before, before) || row.beforeSha256 !== hashValue(before)) errors.push(`${row.id}: frozen before mismatch`);
    if (row.beforeSha256 !== hashValue(row.before) || row.proposalSha256 !== hashValue(row.proposal)) errors.push(`${row.id}: payload hash mismatch`);
    if (!equal(row.changedFields, diffFields(row.before, row.proposal))) errors.push(`${row.id}: changedFields mismatch`);
    for (const field of FULL_RECORD_FIELDS) if (!Object.prototype.hasOwnProperty.call(row.before, field) || !Object.prototype.hasOwnProperty.call(row.proposal, field)) errors.push(`${row.id}: missing ${field}`);
    for (const field of ['make', 'model', 'title', 'category', 'years', 'status', 'relatedIssueIds']) if (!equal(row.proposal[field], before[field])) errors.push(`${row.id}: immutable ${field} drift`);
    if (row.proposal.make !== 'Jaguar' || row.proposal.model !== 'XK' || row.proposal.status !== 'published' || /^Archived\s*-/i.test(row.proposal.title)) errors.push(`${row.id}: identity/status drift`);
    if (!equal(row.evidence, evidenceFor(row.id)) || !Array.isArray(row.evidence) || row.evidence.length === 0) errors.push(`${row.id}: evidence drift`);
    if (!card) {
      if (row.reason !== KEEP_REASONS[row.id]) errors.push(`${row.id}: hold reason mismatch`);
      if (!equal(row.proposal, before) || row.proposalSha256 !== row.beforeSha256 || !equal(row.changedFields, [])) errors.push(`${row.id}: hold proposal drift`);
      continue;
    }
    const expectedProposal = rewriteProposal(before, card);
    if (!equal(row.proposal, expectedProposal)) errors.push(`${row.id}: proposal differs from whitelist`);
    if (row.reason !== card.summary || !equal(row.proposal.citations, card.citations)) errors.push(`${row.id}: rewrite source mismatch`);
    if (!equal(row.proposal.trims, []) || !equal(row.proposal.engines, []) || !equal(row.proposal.dtcCodes, [])) errors.push(`${row.id}: unsupported applicability remains`);
    if (!equal(row.proposal.communityRecommendations, []) || !equal(row.proposal.fixParts, [])) errors.push(`${row.id}: commerce remains`);
    if (row.proposal.estimatedCostLow !== null || row.proposal.estimatedCostHigh !== null || row.proposal.typicalMileageLow !== null || row.proposal.typicalMileageHigh !== null) errors.push(`${row.id}: unsupported cost/mileage remains`);
    if (row.proposal.humanApproved !== false || row.proposal.reportCount !== 0 || row.proposal.source !== 'manual') errors.push(`${row.id}: review/source reset mismatch`);
    if (collectUrls(row.proposal).some(isSearchUrl)) errors.push(`${row.id}: search URL remains`);
  }

  if (!equal(packet.summary, { rewrite_same_identity: 2, keep_published_pending_source: 20, total: 22 })) errors.push('summary mismatch');
  if (!equal(packet.reviewSources, SOURCES) || !equal(packet.pdfSources, PDF_SOURCES) || !equal(packet.sourceArtifactSha256, PDF_SHA256) || !equal(packet.visuallyInspectedPages, VISUALLY_INSPECTED_PAGES)) errors.push('document source map mismatch');
  if (!equal(packet.nhtsaCommunicationRecord, NHTSA_COMMUNICATION_RECORD) || !equal(packet.datasetMarkers, DATASET_MARKERS)) errors.push('manufacturer communication source mismatch');
  if (!equal(packet.exactCampaigns, EXPECTED_CAMPAIGNS)) errors.push('exact campaign map mismatch');
  if (!equal(packet.mismatchSources, { recallQueries: RECALL_QUERIES, expected: EXPECTED_RECALLS })) errors.push('recall inventory source mismatch');
  for (const code of ['xk-two-exact-recall-corrections-only', 'xk-coolant-bulletin-excludes-model', 'xk-timing-source-is-land-rover-only', 'xk-partial-source-holds', 'xk-primary-source-gaps-held', 'all-xk-pages-preserved']) if (!packet.observations?.some((item) => item.code === code)) errors.push(`missing observation ${code}`);
  if (!equal(Object.values(IDS).sort(), [...frozenById.keys()].sort())) errors.push('ID constant mismatch');
  if (modelRows.some((row) => row.status !== 'published')) errors.push('frozen publication-state assumption mismatch');
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
