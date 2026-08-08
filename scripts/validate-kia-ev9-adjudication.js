/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { FULL_RECORD_FIELDS, fullRecord, hashValue, normalizedFileHash, stableValue } = require('./kia-adjudication-utils');
const { CAMPAIGNS, EXPECTED_CAMPAIGNS, EXPECTED_FLAT_RECALL_DETAILS, EXPECTED_FLAT_RECALL_INVENTORY, FLAT_RECALL_SOURCE, HOLD_IDS, HOLD_REASONS, PDF_SOURCES, REWRITE_CARDS, REWRITE_IDS, evidenceFor, rewriteProposal } = require('./build-kia-ev9-adjudication');

const PACKET = path.resolve(__dirname, '..', 'data', 'known-issue-kia-ev9-adjudication-2026-08-08.json');
const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_kia-deeplink-snapshot-2026-08-06.json');
const IMMUTABLE_FIELDS = ['make', 'model', 'years', 'category', 'title', 'status', 'relatedIssueIds'];
const ALLOWED_NO_RETAIL_DECISIONS = /^(dealer-only-no-retail-part|no-official-remedy-or-part)-/;
function equal(a, b) { return JSON.stringify(stableValue(a)) === JSON.stringify(stableValue(b)); }

function validatePacket(packet, snapshot, expectedSnapshotSha256 = normalizedFileHash(SNAPSHOT)) {
  const errors = [];
  const modelRows = snapshot.records.filter((row) => row.make === 'Kia' && row.model === 'EV9');
  const frozenById = new Map(modelRows.map((row) => [row.id, row]));
  const ids = packet.rows?.map((row) => row.id) || [];
  const rewriteIds = Object.values(REWRITE_IDS).sort();
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true) errors.push('packet safety status mismatch');
  if (packet.make !== 'Kia' || packet.model !== 'EV9') errors.push('packet scope mismatch');
  if (packet.applicationGate?.status !== 'blocked' || !equal(packet.applicationGate?.blockerRecordIds, [HOLD_IDS.software])) errors.push('critical software application gate mismatch');
  if (packet.source?.snapshotSha256 !== expectedSnapshotSha256 || packet.source?.snapshotHash !== snapshot.snapshotHash) errors.push('snapshot binding mismatch');
  if (packet.source?.modelRecordCount !== 4 || modelRows.length !== 4 || ids.length !== 4 || new Set(ids).size !== 4) errors.push('EV9 row count mismatch');
  if (!equal(ids.slice().sort(), [...frozenById.keys()].sort())) errors.push('frozen ID coverage mismatch');
  if (!equal(packet.summary, { rewrite_same_identity: 3, keep_published_pending_source: 1, total: 4 })) errors.push('summary mismatch');
  if (!equal(packet.pdfSources, PDF_SOURCES)) errors.push('PDF source map mismatch');
  if (!equal(packet.campaigns, { urls: CAMPAIGNS, expected: EXPECTED_CAMPAIGNS })) errors.push('campaign map mismatch');
  if (!equal(packet.flatRecallDataset, { source: FLAT_RECALL_SOURCE, expectedInventory: EXPECTED_FLAT_RECALL_INVENTORY, expectedDetails: EXPECTED_FLAT_RECALL_DETAILS })) errors.push('flat recall dataset mismatch');

  for (const row of packet.rows || []) {
    const frozen = frozenById.get(row.id);
    if (!frozen) { errors.push(`${row.id}: unknown ID`); continue; }
    const before = fullRecord(frozen); const card = REWRITE_CARDS[row.id]; const expectedProposal = card ? rewriteProposal(frozen, card) : before;
    const expectedAction = card ? 'rewrite_same_identity' : 'keep_published_pending_source';
    const expectedReason = card ? 'The exact official source matches this indexed failure identity. The proposal narrows claims and removes unsupported commerce without changing ID, title, category, years, status or related links.' : HOLD_REASONS[row.id];
    if (row.action !== expectedAction || row.reason !== expectedReason) errors.push(`${row.id}: decision mismatch`);
    if (!equal(row.before, before) || row.beforeSha256 !== hashValue(before)) errors.push(`${row.id}: before drift`);
    if (!equal(row.proposal, expectedProposal) || row.proposalSha256 !== hashValue(expectedProposal)) errors.push(`${row.id}: proposal drift`);
    if (!equal(row.changedFields, FULL_RECORD_FIELDS.filter((field) => hashValue(before[field]) !== hashValue(expectedProposal[field])))) errors.push(`${row.id}: changed-field drift`);
    if (!equal(row.evidence, evidenceFor(frozen)) || !row.evidence?.length) errors.push(`${row.id}: evidence drift`);
    for (const field of IMMUTABLE_FIELDS) if (!equal(row.proposal[field], before[field])) errors.push(`${row.id}: immutable ${field} drift`);
    if (row.proposal.status !== 'published' || /^Archived\s*-/i.test(row.proposal.title)) errors.push(`${row.id}: publication drift`);
    for (const field of FULL_RECORD_FIELDS) if (!Object.prototype.hasOwnProperty.call(row.before, field) || !Object.prototype.hasOwnProperty.call(row.proposal, field)) errors.push(`${row.id}: missing ${field}`);
    if (card) {
      if (!ALLOWED_NO_RETAIL_DECISIONS.test(row.commerceDecision || '')) errors.push(`${row.id}: missing explicit no-retail commerce disposition`);
      if (row.proposal.humanApproved !== false || row.proposal.reportCount !== 0 || row.proposal.source !== 'manual') errors.push(`${row.id}: rewrite approval/source drift`);
      if (row.proposal.reviewedOn !== '2026-08-08' || row.proposal.contentUpdatedOn !== '2026-08-08') errors.push(`${row.id}: rewrite date drift`);
      if (!equal(row.proposal.trims, []) || !equal(row.proposal.engines, []) || !equal(row.proposal.communityRecommendations, []) || !equal(row.proposal.fixParts, [])) errors.push(`${row.id}: rewrite unsupported fields remain`);
      if ([row.proposal.estimatedCostLow, row.proposal.estimatedCostHigh, row.proposal.typicalMileageLow, row.proposal.typicalMileageHigh].some((value) => value !== null)) errors.push(`${row.id}: rewrite cost/mileage remains`);
      if (JSON.stringify(row.proposal).match(/amazon\.com\/s\?k=|rockauto\.com\/en\/partsearch|ebay\.com\/sch\/i\.html/)) errors.push(`${row.id}: rewrite search commerce remains`);
      if (!row.changedFields.length) errors.push(`${row.id}: rewrite has no changes`);
    } else {
      if (!equal(row.proposal, before) || row.proposalSha256 !== row.beforeSha256 || !equal(row.changedFields, [])) errors.push(`${row.id}: hold drift`);
      if (row.id === HOLD_IDS.software && row.commerceDecision !== 'unchanged-commerce-pending-exact-source-and-fitment') errors.push(`${row.id}: critical hold disposition drift`);
    }
  }
  const actualRewriteIds = (packet.rows || []).filter((row) => row.action === 'rewrite_same_identity').map((row) => row.id).sort();
  if (!equal(actualRewriteIds, rewriteIds)) errors.push('rewrite ID set mismatch');
  const iccu = packet.rows?.find((row) => row.id === REWRITE_IDS.iccu);
  if (/24V200/i.test(JSON.stringify(iccu?.proposal || {}))) errors.push('ICCU public proposal retains false 24V200 citation');
  if (!iccu?.evidence?.some((item) => item.urls?.includes(CAMPAIGNS.wrongIccu))) errors.push('ICCU false-citation boundary evidence missing');
  const software = packet.rows?.find((row) => row.id === HOLD_IDS.software);
  if (!software || !/xyz123/.test(JSON.stringify(software.before)) || !/abcdef12345/.test(JSON.stringify(software.before))) errors.push('software placeholder-citation finding missing');
  for (const code of ['ev9-iccu-false-recall-citation-corrected', 'ev9-placeholder-software-citations-held', 'ev9-wiper-investigation-not-recall', 'ev9-eight-new-recall-identities-deferred', 'ev9-model-api-504-flat-dataset-used', 'ev9-three-exact-identities-rewritten', 'all-ev9-pages-preserved']) if (!packet.observations?.some((item) => item.code === code)) errors.push(`missing observation ${code}`);
  return errors;
}

if (require.main === module) {
  const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8')); const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')); const errors = validatePacket(packet, snapshot);
  console.log(JSON.stringify({ passed: errors.length === 0, packetSha256: normalizedFileHash(PACKET), decisionCount: packet.rows?.length || 0, applicationGate: packet.applicationGate, errors }, null, 2)); if (errors.length) process.exitCode = 1;
}
module.exports = { PACKET, SNAPSHOT, validatePacket };
