/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { FULL_RECORD_FIELDS, fullRecord, hashValue, normalizedFileHash, stableValue } = require('./kia-adjudication-utils');
const { CAMPAIGNS, CAMPAIGN_COMPONENTS, EXPECTED_CAMPAIGN_MODEL_YEARS, EXPECTED_RECALLS, PDF_SOURCES, RECALL_QUERIES, REWRITE_CARDS, REWRITE_IDS, SPECIAL_IDS, evidenceFor, holdReasonFor, rewriteProposal } = require('./build-kia-carnival-adjudication');

const PACKET = path.resolve(__dirname, '..', 'data', 'known-issue-kia-carnival-adjudication-2026-08-06.json');
const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_kia-deeplink-snapshot-2026-08-06.json');
const IMMUTABLE_FIELDS = ['make', 'model', 'years', 'category', 'title', 'status', 'relatedIssueIds'];
function equal(a, b) { return JSON.stringify(stableValue(a)) === JSON.stringify(stableValue(b)); }

function validatePacket(packet, snapshot, expectedSnapshotSha256 = normalizedFileHash(SNAPSHOT)) {
  const errors = [];
  const modelRows = snapshot.records.filter((row) => row.make === 'Kia' && row.model === 'Carnival');
  const frozenById = new Map(modelRows.map((row) => [row.id, row]));
  const ids = packet.rows?.map((row) => row.id) || [];
  const rewriteIds = Object.values(REWRITE_IDS).sort();
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true) errors.push('packet safety status mismatch');
  if (packet.make !== 'Kia' || packet.model !== 'Carnival') errors.push('packet scope mismatch');
  if (packet.source?.snapshotSha256 !== expectedSnapshotSha256 || packet.source?.snapshotHash !== snapshot.snapshotHash) errors.push('snapshot binding mismatch');
  if (packet.source?.modelRecordCount !== 26 || modelRows.length !== 26 || ids.length !== 26 || new Set(ids).size !== 26) errors.push('Carnival row count mismatch');
  if (!equal(ids.slice().sort(), [...frozenById.keys()].sort())) errors.push('frozen ID coverage mismatch');
  if (!equal(packet.summary, { rewrite_same_identity: 4, keep_published_pending_source: 22, total: 26 })) errors.push('summary mismatch');
  if (!equal(packet.pdfSources, PDF_SOURCES)) errors.push('PDF source map mismatch');
  if (!equal(packet.campaigns, { urls: CAMPAIGNS, expectedModelYears: EXPECTED_CAMPAIGN_MODEL_YEARS, expectedComponents: CAMPAIGN_COMPONENTS })) errors.push('campaign map mismatch');
  if (!equal(packet.recallInventory, { queries: RECALL_QUERIES, expected: EXPECTED_RECALLS })) errors.push('recall inventory mismatch');

  for (const row of packet.rows || []) {
    const frozen = frozenById.get(row.id);
    if (!frozen) { errors.push(`${row.id}: unknown ID`); continue; }
    const before = fullRecord(frozen); const card = REWRITE_CARDS[row.id]; const expectedProposal = card ? rewriteProposal(frozen, card) : before;
    const expectedAction = card ? 'rewrite_same_identity' : 'keep_published_pending_source';
    const expectedReason = card ? 'The exact official source matches this indexed failure identity. The proposal narrows claims and removes unsupported commerce without changing ID, title, category, years, status or related links.' : holdReasonFor(frozen);
    if (row.action !== expectedAction || row.reason !== expectedReason) errors.push(`${row.id}: decision mismatch`);
    if (!equal(row.before, before) || row.beforeSha256 !== hashValue(before)) errors.push(`${row.id}: before drift`);
    if (!equal(row.proposal, expectedProposal) || row.proposalSha256 !== hashValue(expectedProposal)) errors.push(`${row.id}: proposal drift`);
    if (!equal(row.changedFields, FULL_RECORD_FIELDS.filter((field) => hashValue(before[field]) !== hashValue(expectedProposal[field])))) errors.push(`${row.id}: changed-field drift`);
    if (!equal(row.evidence, evidenceFor(frozen)) || !row.evidence?.length) errors.push(`${row.id}: evidence drift`);
    for (const field of IMMUTABLE_FIELDS) if (!equal(row.proposal[field], before[field])) errors.push(`${row.id}: immutable ${field} drift`);
    if (row.proposal.status !== 'published' || /^Archived\s*-/i.test(row.proposal.title)) errors.push(`${row.id}: publication drift`);
    for (const field of FULL_RECORD_FIELDS) if (!Object.prototype.hasOwnProperty.call(row.before, field) || !Object.prototype.hasOwnProperty.call(row.proposal, field)) errors.push(`${row.id}: missing ${field}`);
    if (card) {
      if (row.proposal.humanApproved !== false || row.proposal.reportCount !== 0 || row.proposal.source !== 'manual') errors.push(`${row.id}: rewrite approval/source drift`);
      if (row.proposal.reviewedOn !== '2026-08-06' || row.proposal.contentUpdatedOn !== '2026-08-06') errors.push(`${row.id}: rewrite date drift`);
      if (!equal(row.proposal.trims, []) || !equal(row.proposal.engines, []) || !equal(row.proposal.dtcCodes, []) || !equal(row.proposal.communityRecommendations, []) || !equal(row.proposal.fixParts, [])) errors.push(`${row.id}: rewrite unsupported fields remain`);
      if ([row.proposal.estimatedCostLow, row.proposal.estimatedCostHigh, row.proposal.typicalMileageLow, row.proposal.typicalMileageHigh].some((value) => value !== null)) errors.push(`${row.id}: rewrite cost/mileage remains`);
      if (JSON.stringify(row.proposal).match(/amazon\.com\/s\?k=|rockauto\.com\/en\/partsearch|ebay\.com\/sch\/i\.html/)) errors.push(`${row.id}: rewrite search commerce remains`);
      if (!row.changedFields.length) errors.push(`${row.id}: rewrite has no changes`);
    } else if (!equal(row.proposal, before) || row.proposalSha256 !== row.beforeSha256 || !equal(row.changedFields, [])) errors.push(`${row.id}: hold drift`);
  }
  const actualRewriteIds = (packet.rows || []).filter((row) => row.action === 'rewrite_same_identity').map((row) => row.id).sort();
  if (!equal(actualRewriteIds, rewriteIds)) errors.push('rewrite ID set mismatch');
  for (const code of ['carnival-fabricated-sc372-conflation-held', 'carnival-sliding-door-page-names-wrong-campaign', 'carnival-sc361-year-scope-conflict', 'carnival-service-action-scope-conflicts-preserved', 'carnival-four-exact-identities-rewritten', 'all-carnival-pages-preserved']) if (!packet.observations?.some((item) => item.code === code)) errors.push(`missing observation ${code}`);
  for (const id of Object.values(SPECIAL_IDS)) if (!frozenById.has(id)) errors.push(`missing special ID ${id}`);
  return errors;
}

if (require.main === module) {
  const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8')); const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')); const errors = validatePacket(packet, snapshot);
  console.log(JSON.stringify({ passed: errors.length === 0, packetSha256: normalizedFileHash(PACKET), decisionCount: packet.rows?.length || 0, errors }, null, 2)); if (errors.length) process.exitCode = 1;
}
module.exports = { PACKET, SNAPSHOT, validatePacket };
