/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const { FULL_RECORD_FIELDS, fullRecord, hashValue, normalizedFileHash, stableValue } = require('./kia-adjudication-utils');
const {
  DECISIONS, DEFERRED_CAMPAIGNS, EXPECTED_FLAT_RECALL_INVENTORY, FLAT_RECALL_SOURCE,
  IDS, MFR_COMMUNICATIONS_SOURCE, OUTPUT: PACKET, PDF_SOURCES, SNAPSHOT, evidenceFor, proposalFor,
} = require('./build-kia-k900-adjudication');

const IMMUTABLE_FIELDS = ['make', 'model', 'years', 'category', 'title', 'status'];
const EXPECTED_SUMMARY = {
  remove_inexact_relation_and_search_commerce_pending_source: 1,
  remove_search_commerce_pending_source: 1,
  remove_false_citation_and_search_commerce_pending_source: 1,
  remove_unverifiable_citations_and_search_commerce_pending_source: 2,
  total: 5,
};
function equal(a, b) { return JSON.stringify(stableValue(a)) === JSON.stringify(stableValue(b)); }

function validatePacket(packet, snapshot, expectedSnapshotSha256 = normalizedFileHash(SNAPSHOT)) {
  const errors = [];
  const modelRows = snapshot.records.filter((row) => row.make === 'Kia' && row.model === 'K900');
  const frozenById = new Map(modelRows.map((row) => [row.id, row]));
  const ids = packet.rows?.map((row) => row.id) || [];
  const expectedBlockers = Object.values(IDS).sort();
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true) errors.push('packet safety status mismatch');
  if (packet.make !== 'Kia' || packet.model !== 'K900') errors.push('packet scope mismatch');
  if (packet.applicationGate?.status !== 'blocked' || !equal(packet.applicationGate?.blockerRecordIds, expectedBlockers)) errors.push('application blocker set mismatch');
  if (packet.source?.snapshotSha256 !== expectedSnapshotSha256 || packet.source?.snapshotHash !== snapshot.snapshotHash) errors.push('snapshot binding mismatch');
  if (packet.source?.modelRecordCount !== 5 || modelRows.length !== 5 || ids.length !== 5 || new Set(ids).size !== 5) errors.push('K900 row count mismatch');
  if (!equal(ids.slice().sort(), [...frozenById.keys()].sort())) errors.push('frozen ID coverage mismatch');
  if (!equal(packet.summary, EXPECTED_SUMMARY)) errors.push('summary mismatch');
  if (!equal(packet.pdfSources, PDF_SOURCES)) errors.push('PDF source map mismatch');
  if (!equal(packet.manufacturerCommunicationsDataset, MFR_COMMUNICATIONS_SOURCE)) errors.push('manufacturer-communications map mismatch');
  if (!equal(packet.flatRecallDataset, { source: FLAT_RECALL_SOURCE, expectedInventory: EXPECTED_FLAT_RECALL_INVENTORY })) errors.push('flat recall dataset mismatch');
  if (!equal(packet.deferredCampaigns, DEFERRED_CAMPAIGNS)) errors.push('deferred campaign set mismatch');

  for (const row of packet.rows || []) {
    const frozen = frozenById.get(row.id);
    if (!frozen) { errors.push(`${row.id}: unknown ID`); continue; }
    const decision = DECISIONS[row.id];
    const before = fullRecord(frozen);
    const expectedProposal = proposalFor(frozen, decision);
    if (row.action !== decision.action || row.reason !== decision.reason || row.commerceDecision !== decision.commerceDecision) errors.push(`${row.id}: decision mismatch`);
    if (!equal(row.before, before) || row.beforeSha256 !== hashValue(before)) errors.push(`${row.id}: before drift`);
    if (!equal(row.proposal, expectedProposal) || row.proposalSha256 !== hashValue(expectedProposal)) errors.push(`${row.id}: proposal drift`);
    const expectedChanged = FULL_RECORD_FIELDS.filter((field) => hashValue(before[field]) !== hashValue(expectedProposal[field]));
    if (!equal(row.changedFields, expectedChanged) || !row.changedFields.length) errors.push(`${row.id}: changed-field drift`);
    if (!equal(row.evidence, evidenceFor(frozen)) || !row.evidence?.length) errors.push(`${row.id}: evidence drift`);
    for (const field of IMMUTABLE_FIELDS) if (!equal(row.proposal[field], before[field])) errors.push(`${row.id}: immutable ${field} drift`);
    for (const field of FULL_RECORD_FIELDS) if (!Object.prototype.hasOwnProperty.call(row.before, field) || !Object.prototype.hasOwnProperty.call(row.proposal, field)) errors.push(`${row.id}: missing ${field}`);
    if (row.proposal.status !== 'published' || /^Archived\s*-/i.test(row.proposal.title)) errors.push(`${row.id}: publication drift`);
    if (!equal(row.proposal.communityRecommendations, []) || !equal(row.proposal.fixParts, [])) errors.push(`${row.id}: search commerce remains`);
    if (/amazon\.com\/s\?k=|rockauto\.com\/en\/partsearch|ebay\.com\/sch\/i\.html/i.test(JSON.stringify(row.proposal))) errors.push(`${row.id}: search URL remains`);
    if (row.proposal.humanApproved !== false) errors.push(`${row.id}: proposal became human-approved`);
  }

  const transmission = packet.rows?.find((row) => row.id === IDS.transmission);
  if (!equal(transmission?.proposal?.relatedIssueIds, []) || !transmission?.changedFields?.includes('relatedIssueIds')) errors.push('transmission inexact relation remains');
  const drl = packet.rows?.find((row) => row.id === IDS.drl);
  if (!equal(drl?.proposal?.citations, []) || /abcd1234efg/i.test(JSON.stringify(drl?.proposal))) errors.push('DRL placeholder citation remains');
  for (const id of [IDS.engine, IDS.infotainment]) {
    const row = packet.rows?.find((item) => item.id === id);
    if (!equal(row?.proposal?.citations, [])) errors.push(`${id}: unverifiable citations remain`);
  }
  for (const code of ['k900-complete-official-inventory-reviewed', 'k900-transmission-bulletin-not-stretched', 'k900-drl-placeholder-and-component-conflict', 'k900-infotainment-year-conflict', 'k900-inexact-cadenza-relation-removed', 'k900-unverified-search-commerce-cleared-in-proposals', 'k900-four-recall-campaigns-deferred', 'all-k900-pages-preserved']) if (!packet.observations?.some((item) => item.code === code)) errors.push(`missing observation ${code}`);
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
