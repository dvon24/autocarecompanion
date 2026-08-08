/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { FULL_RECORD_FIELDS, fullRecord, hashValue, normalizedFileHash, stableValue } = require('./kia-adjudication-utils');
const { CAMPAIGNS, DEFERRED_CAMPAIGNS, EXPECTED_CAMPAIGNS, EXPECTED_FLAT_RECALL_INVENTORY, FLAT_RECALL_SOURCE, HOLD_IDS, HOLD_REASONS, PDF_SOURCES, REWRITE_CARDS, REWRITE_IDS, evidenceFor, rewriteProposal } = require('./build-kia-forte-adjudication');

const PACKET = path.resolve(__dirname, '..', 'data', 'known-issue-kia-forte-adjudication-2026-08-08.json');
const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_kia-deeplink-snapshot-2026-08-06.json');
const IMMUTABLE_FIELDS = ['make', 'model', 'years', 'category', 'title', 'status', 'relatedIssueIds'];
const ALLOWED_NO_RETAIL_DECISIONS = /^dealer-only-no-retail-part-/;
function equal(a, b) { return JSON.stringify(stableValue(a)) === JSON.stringify(stableValue(b)); }

function validatePacket(packet, snapshot, expectedSnapshotSha256 = normalizedFileHash(SNAPSHOT)) {
  const errors = []; const modelRows = snapshot.records.filter((row) => row.make === 'Kia' && row.model === 'Forte'); const frozenById = new Map(modelRows.map((row) => [row.id, row])); const ids = packet.rows?.map((row) => row.id) || [];
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true) errors.push('packet safety status mismatch');
  if (packet.make !== 'Kia' || packet.model !== 'Forte') errors.push('packet scope mismatch');
  if (packet.applicationGate?.status !== 'blocked' || !equal(packet.applicationGate?.blockerRecordIds, Object.values(HOLD_IDS).sort())) errors.push('application blocker set mismatch');
  if (packet.source?.snapshotSha256 !== expectedSnapshotSha256 || packet.source?.snapshotHash !== snapshot.snapshotHash) errors.push('snapshot binding mismatch');
  if (packet.source?.modelRecordCount !== 10 || modelRows.length !== 10 || ids.length !== 10 || new Set(ids).size !== 10) errors.push('Forte row count mismatch');
  if (!equal(ids.slice().sort(), [...frozenById.keys()].sort())) errors.push('frozen ID coverage mismatch');
  if (!equal(packet.summary, { rewrite_same_identity: 3, keep_published_pending_source: 7, total: 10 })) errors.push('summary mismatch');
  if (!equal(packet.pdfSources, PDF_SOURCES)) errors.push('PDF source map mismatch');
  if (!equal(packet.campaigns, { urls: CAMPAIGNS, expected: EXPECTED_CAMPAIGNS })) errors.push('campaign map mismatch');
  if (!equal(packet.flatRecallDataset, { source: FLAT_RECALL_SOURCE, expectedInventory: EXPECTED_FLAT_RECALL_INVENTORY })) errors.push('flat recall dataset mismatch');
  if (!equal(packet.deferredCampaigns, DEFERRED_CAMPAIGNS)) errors.push('deferred campaign set mismatch');

  for (const row of packet.rows || []) {
    const frozen = frozenById.get(row.id); if (!frozen) { errors.push(`${row.id}: unknown ID`); continue; }
    const before = fullRecord(frozen); const card = REWRITE_CARDS[row.id]; const expectedProposal = card ? rewriteProposal(frozen, card) : before; const expectedAction = card ? 'rewrite_same_identity' : 'keep_published_pending_source'; const expectedReason = card ? 'The exact official source matches this indexed failure identity. The proposal narrows claims and removes unsupported commerce without changing ID, title, category, years, status or related links.' : HOLD_REASONS[row.id];
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
      if (!equal(row.proposal.trims, []) || !equal(row.proposal.engines, []) || !equal(row.proposal.dtcCodes, []) || !equal(row.proposal.communityRecommendations, []) || !equal(row.proposal.fixParts, [])) errors.push(`${row.id}: rewrite unsupported fields remain`);
      if ([row.proposal.estimatedCostLow, row.proposal.estimatedCostHigh, row.proposal.typicalMileageLow, row.proposal.typicalMileageHigh].some((value) => value !== null)) errors.push(`${row.id}: rewrite cost/mileage remains`);
      if (JSON.stringify(row.proposal).match(/amazon\.com\/s\?k=|rockauto\.com\/en\/partsearch|ebay\.com\/sch\/i\.html/)) errors.push(`${row.id}: rewrite search commerce remains`);
      if (!row.changedFields.length) errors.push(`${row.id}: rewrite has no changes`);
    } else if (!equal(row.proposal, before) || row.proposalSha256 !== row.beforeSha256 || !equal(row.changedFields, [])) errors.push(`${row.id}: hold drift`);
  }
  const actualRewriteIds = (packet.rows || []).filter((row) => row.action === 'rewrite_same_identity').map((row) => row.id).sort(); if (!equal(actualRewriteIds, Object.values(REWRITE_IDS).sort())) errors.push('rewrite ID set mismatch');
  const hecu = packet.rows?.find((row) => row.id === REWRITE_IDS.hecu); if (/21V331/i.test(JSON.stringify(hecu?.proposal || {}))) errors.push('HECU proposal retains false 21V331 citation');
  if (!hecu?.evidence?.some((item) => item.urls?.includes(CAMPAIGNS.wrongHecu))) errors.push('HECU wrong-campaign boundary evidence missing');
  const lowBeam = packet.rows?.find((row) => row.id === HOLD_IDS.lowBeam); if (!/SC149.*Sorento/i.test(JSON.stringify(lowBeam?.evidence || []))) errors.push('SC149 wrong-model blocker missing');
  for (const code of ['forte-hecu-wrong-campaign-corrected', 'forte-airbag-recalls-bounded', 'forte-strut-tsb-bounded', 'forte-sc149-sorento-only-blocker', 'forte-engine-and-ivt-scope-blockers', 'forte-lamp-guidance-blocker', 'forte-mdps-partial-year-blocker', 'forte-fourteen-new-recall-identities-deferred', 'all-forte-pages-preserved']) if (!packet.observations?.some((item) => item.code === code)) errors.push(`missing observation ${code}`);
  return errors;
}
if (require.main === module) { const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8')); const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')); const errors = validatePacket(packet, snapshot); console.log(JSON.stringify({ passed: errors.length === 0, packetSha256: normalizedFileHash(PACKET), decisionCount: packet.rows?.length || 0, applicationGate: packet.applicationGate, errors }, null, 2)); if (errors.length) process.exitCode = 1; }
module.exports = { PACKET, SNAPSHOT, validatePacket };
