/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { FULL_RECORD_FIELDS, diffFields, fullRecord, hashValue, normalizedFileHash, stableValue } = require('./jeep-adjudication-utils');
const { EXPECTED_CAMPAIGNS, EXPECTED_RECALLS, IDS, KEEP_REASONS, PDF_SOURCES, RECALL_QUERIES, RECALL_URLS, REWRITE_CARDS, evidenceFor, rewriteProposal } = require('./build-jeep-cherokee-adjudication');

const PACKET = path.resolve(__dirname, '..', 'data', 'known-issue-jeep-cherokee-adjudication-2026-08-06.json');
const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_jeep-deeplink-snapshot-2026-08-06.json');

function equal(left, right) {
  return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right));
}

function validatePacket(packet, snapshot, expectedSnapshotSha256 = normalizedFileHash(SNAPSHOT)) {
  const errors = [];
  const modelRows = snapshot.records.filter((row) => row.make === 'Jeep' && row.model === 'Cherokee');
  const frozenById = new Map(modelRows.map((row) => [row.id, row]));
  const packetIds = packet.rows?.map((row) => row.id) || [];

  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true) errors.push('packet safety status mismatch');
  if (packet.make !== 'Jeep' || packet.model !== 'Cherokee') errors.push('packet scope mismatch');
  if (packet.source?.snapshotSha256 !== expectedSnapshotSha256 || packet.source?.snapshotHash !== snapshot.snapshotHash) errors.push('snapshot binding mismatch');
  if (packet.source?.modelRecordCount !== 18 || modelRows.length !== 18 || packetIds.length !== 18) errors.push('Cherokee row count mismatch');
  if (new Set(packetIds).size !== 18) errors.push('duplicate packet IDs');
  if (!equal(packetIds.slice().sort(), [...frozenById.keys()].sort()) || !equal(Object.values(IDS).sort(), [...frozenById.keys()].sort())) errors.push('frozen ID coverage mismatch');

  for (const row of packet.rows || []) {
    const frozen = frozenById.get(row.id);
    if (!frozen) { errors.push(`${row.id}: unknown ID`); continue; }
    const before = fullRecord(frozen);
    const card = REWRITE_CARDS[row.id];
    const expectedAction = card ? 'rewrite_same_identity' : 'keep_published_pending_source';
    const expectedProposal = card ? rewriteProposal(frozen, card) : before;
    if (row.action !== expectedAction) errors.push(`${row.id}: action mismatch`);
    if (!card && row.reason !== KEEP_REASONS[row.id]) errors.push(`${row.id}: hold reason mismatch`);
    if (!equal(row.before, before) || row.beforeSha256 !== hashValue(before)) errors.push(`${row.id}: before snapshot mismatch`);
    if (!equal(row.proposal, expectedProposal) || row.proposalSha256 !== hashValue(expectedProposal)) errors.push(`${row.id}: proposal mismatch`);
    if (!equal(row.changedFields, diffFields(before, expectedProposal))) errors.push(`${row.id}: changedFields mismatch`);
    if (!equal(row.evidence, evidenceFor(row.id)) || !row.evidence?.length) errors.push(`${row.id}: evidence mismatch`);

    for (const field of FULL_RECORD_FIELDS) {
      if (!Object.prototype.hasOwnProperty.call(row.before, field) || !Object.prototype.hasOwnProperty.call(row.proposal, field)) errors.push(`${row.id}: missing ${field}`);
    }
    if (row.proposal.make !== before.make || row.proposal.model !== before.model || row.proposal.title !== before.title || row.proposal.category !== before.category || !equal(row.proposal.years, before.years) || row.proposal.status !== 'published' || /^Archived\s*-/i.test(row.proposal.title)) errors.push(`${row.id}: identity/status drift`);

    if (!card) {
      if (!equal(row.proposal, before) || row.proposalSha256 !== row.beforeSha256 || !equal(row.changedFields, [])) errors.push(`${row.id}: hold drift`);
    } else {
      if (!equal(row.proposal.relatedIssueIds, before.relatedIssueIds)) errors.push(`${row.id}: relatedIssueIds drift`);
      for (const field of ['trims', 'engines', 'dtcCodes', 'communityRecommendations', 'fixParts']) if (!equal(row.proposal[field], [])) errors.push(`${row.id}: ${field} must be empty`);
      for (const field of ['estimatedCostLow', 'estimatedCostHigh', 'typicalMileageLow', 'typicalMileageHigh']) if (row.proposal[field] !== null) errors.push(`${row.id}: ${field} must be null`);
      if (row.proposal.humanApproved !== false || row.proposal.reportCount !== 0 || row.proposal.source !== 'manual' || row.proposal.lastReportedByOwners !== '' || row.proposal.reviewedOn !== '2026-08-06' || row.proposal.contentUpdatedOn !== '2026-08-06') errors.push(`${row.id}: rewrite metadata mismatch`);
      const urls = row.proposal.citations.map((item) => item.url);
      if (urls.some((url) => !url.startsWith('https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=') || /amazon|ebay|rockauto|[?&](?:q|k|_nkw)=/i.test(url))) errors.push(`${row.id}: rewrite contains non-primary or commerce URL`);
    }
  }

  if (!equal(packet.summary, { rewrite_same_identity: 2, keep_published_pending_source: 16, total: 18 })) errors.push('summary mismatch');
  if (!equal(packet.pdfSources, PDF_SOURCES) || !equal(packet.recallSources, RECALL_URLS) || !equal(packet.expectedCampaigns, EXPECTED_CAMPAIGNS)) errors.push('official source map mismatch');
  if (!equal(packet.recallInventory, { queries: RECALL_QUERIES, expectedStatus: 200, expectedCampaignsByYear: EXPECTED_RECALLS })) errors.push('recall inventory mismatch');
  for (const code of ['cherokee-can-bus-citation-is-ferrari-bulletin', 'cherokee-shifter-campaign-is-grand-cherokee', 'cherokee-headlamp-source-partial-year-scope', 'cherokee-rear-main-service-path-conflict', 'all-cherokee-pages-preserved']) if (!packet.observations?.some((item) => item.code === code)) errors.push(`missing observation ${code}`);
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
