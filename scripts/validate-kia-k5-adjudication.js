/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { FULL_RECORD_FIELDS, fullRecord, hashValue, normalizedFileHash, stableValue } = require('./kia-adjudication-utils');
const {
  CAMPAIGNS, CITATION_REMOVAL_IDS, CITATION_REMOVAL_REASONS, DEFERRED_CAMPAIGNS,
  EXPECTED_CAMPAIGNS, EXPECTED_FLAT_RECALL_INVENTORY, FLAT_RECALL_SOURCE, HOLD_IDS,
  HOLD_REASONS, MFR_COMMUNICATIONS_SOURCE, PDF_SOURCES, REWRITE_CARDS, REWRITE_IDS,
  citationRemovalProposal, evidenceFor, rewriteProposal,
} = require('./build-kia-k5-adjudication');

const PACKET = path.resolve(__dirname, '..', 'data', 'known-issue-kia-k5-adjudication-2026-08-08.json');
const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_kia-deeplink-snapshot-2026-08-06.json');
const IMMUTABLE_FIELDS = ['make', 'model', 'years', 'category', 'title', 'status'];
const EXPECTED_SUMMARY = { rewrite_same_identity: 3, remove_false_citation_and_search_commerce_pending_source: 3, keep_published_pending_source: 18, total: 24 };
function equal(a, b) { return JSON.stringify(stableValue(a)) === JSON.stringify(stableValue(b)); }

function validatePacket(packet, snapshot, expectedSnapshotSha256 = normalizedFileHash(SNAPSHOT)) {
  const errors = [];
  const modelRows = snapshot.records.filter((row) => row.make === 'Kia' && row.model === 'K5');
  const frozenById = new Map(modelRows.map((row) => [row.id, row]));
  const ids = packet.rows?.map((row) => row.id) || [];
  const expectedBlockers = [...Object.values(CITATION_REMOVAL_IDS), ...Object.values(HOLD_IDS)].sort();
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true) errors.push('packet safety status mismatch');
  if (packet.make !== 'Kia' || packet.model !== 'K5') errors.push('packet scope mismatch');
  if (packet.applicationGate?.status !== 'blocked' || !equal(packet.applicationGate?.blockerRecordIds, expectedBlockers)) errors.push('application blocker set mismatch');
  if (packet.source?.snapshotSha256 !== expectedSnapshotSha256 || packet.source?.snapshotHash !== snapshot.snapshotHash) errors.push('snapshot binding mismatch');
  if (packet.source?.modelRecordCount !== 24 || modelRows.length !== 24 || ids.length !== 24 || new Set(ids).size !== 24) errors.push('K5 row count mismatch');
  if (!equal(ids.slice().sort(), [...frozenById.keys()].sort())) errors.push('frozen ID coverage mismatch');
  if (!equal(packet.summary, EXPECTED_SUMMARY)) errors.push('summary mismatch');
  if (!equal(packet.pdfSources, PDF_SOURCES)) errors.push('PDF source map mismatch');
  if (!equal(packet.campaigns, { urls: CAMPAIGNS, expectedModelYears: EXPECTED_CAMPAIGNS })) errors.push('campaign map mismatch');
  if (!equal(packet.manufacturerCommunicationsDataset, MFR_COMMUNICATIONS_SOURCE)) errors.push('manufacturer-communications map mismatch');
  if (!equal(packet.flatRecallDataset, { source: FLAT_RECALL_SOURCE, expectedInventory: EXPECTED_FLAT_RECALL_INVENTORY })) errors.push('flat recall dataset mismatch');
  if (!equal(packet.deferredCampaigns, DEFERRED_CAMPAIGNS)) errors.push('deferred campaign set mismatch');

  for (const row of packet.rows || []) {
    const frozen = frozenById.get(row.id);
    if (!frozen) { errors.push(`${row.id}: unknown ID`); continue; }
    const before = fullRecord(frozen);
    const card = REWRITE_CARDS[row.id];
    const citationReason = CITATION_REMOVAL_REASONS[row.id];
    const expectedProposal = card ? rewriteProposal(frozen, card) : citationReason ? citationRemovalProposal(frozen) : before;
    const expectedAction = card ? 'rewrite_same_identity' : citationReason ? 'remove_false_citation_and_search_commerce_pending_source' : 'keep_published_pending_source';
    const expectedReason = card ? 'The exact official source matches this indexed failure identity. The proposal narrows claims and removes unsupported commerce without changing ID, title, category, years or status.' : citationReason || HOLD_REASONS[row.id];
    if (row.action !== expectedAction || row.reason !== expectedReason) errors.push(`${row.id}: decision mismatch`);
    if (!equal(row.before, before) || row.beforeSha256 !== hashValue(before)) errors.push(`${row.id}: before drift`);
    if (!equal(row.proposal, expectedProposal) || row.proposalSha256 !== hashValue(expectedProposal)) errors.push(`${row.id}: proposal drift`);
    if (!equal(row.changedFields, FULL_RECORD_FIELDS.filter((field) => hashValue(before[field]) !== hashValue(expectedProposal[field])))) errors.push(`${row.id}: changed-field drift`);
    if (!equal(row.evidence, evidenceFor(frozen)) || !row.evidence?.length) errors.push(`${row.id}: evidence drift`);
    for (const field of IMMUTABLE_FIELDS) if (!equal(row.proposal[field], before[field])) errors.push(`${row.id}: immutable ${field} drift`);
    if (row.proposal.status !== 'published' || /^Archived\s*-/i.test(row.proposal.title)) errors.push(`${row.id}: publication drift`);
    for (const field of FULL_RECORD_FIELDS) if (!Object.prototype.hasOwnProperty.call(row.before, field) || !Object.prototype.hasOwnProperty.call(row.proposal, field)) errors.push(`${row.id}: missing ${field}`);
    if (card) {
      if (!/^dealer-only-no-retail-part-/.test(row.commerceDecision || '')) errors.push(`${row.id}: missing explicit no-retail disposition`);
      if (row.proposal.humanApproved !== false || row.proposal.reportCount !== 0 || row.proposal.source !== 'manual') errors.push(`${row.id}: rewrite approval/source drift`);
      if (row.proposal.reviewedOn !== '2026-08-08' || row.proposal.contentUpdatedOn !== '2026-08-08') errors.push(`${row.id}: rewrite date drift`);
      if (!equal(row.proposal.trims, card.trims) || !equal(row.proposal.engines, card.engines) || !equal(row.proposal.dtcCodes, []) || !equal(row.proposal.communityRecommendations, []) || !equal(row.proposal.fixParts, [])) errors.push(`${row.id}: rewrite bounded-field drift`);
      if ([row.proposal.estimatedCostLow, row.proposal.estimatedCostHigh, row.proposal.typicalMileageLow, row.proposal.typicalMileageHigh].some((value) => value !== null)) errors.push(`${row.id}: rewrite cost/mileage remains`);
      if (JSON.stringify(row.proposal).match(/amazon\.com\/s\?k=|rockauto\.com\/en\/partsearch|ebay\.com\/sch\/i\.html/)) errors.push(`${row.id}: rewrite search commerce remains`);
      if (!row.changedFields.length) errors.push(`${row.id}: rewrite has no changes`);
    } else if (citationReason) {
      if (!equal(row.proposal.citations, []) || !equal(row.proposal.communityRecommendations, []) || !equal(row.proposal.fixParts, [])) errors.push(`${row.id}: false citation/search commerce remains`);
      if (row.proposal.humanApproved !== false || row.commerceDecision !== 'unresolved-no-retail-link-until-primary-source-correction') errors.push(`${row.id}: citation-removal safety state mismatch`);
      if (!packet.applicationGate.blockerRecordIds.includes(row.id)) errors.push(`${row.id}: citation-removal row is not a blocker`);
      if (/abcd1234efg|\/xyz123\//i.test(JSON.stringify(row.proposal))) errors.push(`${row.id}: placeholder URL remains`);
    } else if (!equal(row.proposal, before) || row.proposalSha256 !== row.beforeSha256 || !equal(row.changedFields, [])) errors.push(`${row.id}: hold drift`);
  }

  const actualRewriteIds = (packet.rows || []).filter((row) => row.action === 'rewrite_same_identity').map((row) => row.id).sort();
  const actualCitationRemovalIds = (packet.rows || []).filter((row) => row.action === 'remove_false_citation_and_search_commerce_pending_source').map((row) => row.id).sort();
  if (!equal(actualRewriteIds, Object.values(REWRITE_IDS).sort())) errors.push('rewrite ID set mismatch');
  if (!equal(actualCitationRemovalIds, Object.values(CITATION_REMOVAL_IDS).sort())) errors.push('citation-removal ID set mismatch');
  const oilPump = packet.rows?.find((row) => row.id === REWRITE_IDS.oilPump);
  if (!equal(oilPump?.proposal?.trims, ['GT']) || !equal(oilPump?.proposal?.relatedIssueIds, ['kia-sorento-dct-oil-pump-failure']) || JSON.stringify({ communityRecommendations: oilPump?.proposal?.communityRecommendations, fixParts: oilPump?.proposal?.fixParts }).match(/amazon\.com\/s\?k=/i)) errors.push('oil-pump trim/commerce/relation correction mismatch');
  const fuelTank = packet.rows?.find((row) => row.id === REWRITE_IDS.fuelTank);
  if (!JSON.stringify(fuelTank?.proposal?.citations || []).includes('25V794000') || !equal(fuelTank?.proposal?.years, fuelTank?.before?.years)) errors.push('fuel-tank recall/year preservation mismatch');
  for (const code of ['k5-three-exact-identities-bounded', 'k5-three-placeholder-citations-explicitly-removed', 'k5-adjacent-bulletins-not-stretched', 'k5-theta-and-transmission-metadata-conflicts', 'k5-oil-pump-unrelated-audi-link-removed', 'k5-seven-new-recall-identities-deferred', 'k5-fuel-tank-2024-expansion-deferred', 'all-k5-pages-preserved']) if (!packet.observations?.some((item) => item.code === code)) errors.push(`missing observation ${code}`);
  return errors;
}

if (require.main === module) {
  const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8'));
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const errors = validatePacket(packet, snapshot);
  console.log(JSON.stringify({ passed: errors.length === 0, packetSha256: normalizedFileHash(PACKET), decisionCount: packet.rows?.length || 0, applicationGate: packet.applicationGate, errors }, null, 2));
  if (errors.length) process.exitCode = 1;
}

module.exports = { EXPECTED_SUMMARY, PACKET, SNAPSHOT, validatePacket };
