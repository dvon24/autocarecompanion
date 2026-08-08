/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const { FULL_RECORD_FIELDS, fullRecord, hashValue, normalizedFileHash, stableValue } = require('./kia-adjudication-utils');
const { CAMPAIGN_SOURCES, CLEANUP_IDS, CLEANUP_REASONS, DEFERRED_CAMPAIGNS, EXPECTED_FLAT_RECALL_INVENTORY, FLAT_RECALL_SOURCE, IDS, MFR_COMMUNICATIONS_SOURCE, OUTPUT: PACKET, PDF_SOURCES, REWRITE_CARDS, REWRITE_IDS, SNAPSHOT, actionFor, cleanupProposal, evidenceFor, reasonFor, rewriteProposal } = require('./build-kia-optima-adjudication');

const EXPECTED_SUMMARY = { rewrite_same_identity: 5, targeted_safety_cleanup_pending_source: 8, total: 13 };
const IMMUTABLE_FIELDS = ['make', 'model', 'years', 'category', 'title', 'status'];
function equal(a, b) { return JSON.stringify(stableValue(a)) === JSON.stringify(stableValue(b)); }

function validatePacket(packet, snapshot, expectedSnapshotSha256 = normalizedFileHash(SNAPSHOT)) {
  const errors = [];
  const modelRows = snapshot.records.filter((row) => row.make === 'Kia' && row.model === 'Optima');
  const frozenById = new Map(modelRows.map((row) => [row.id, row]));
  const ids = packet.rows?.map((row) => row.id) || [];
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true) errors.push('packet safety status mismatch');
  if (packet.make !== 'Kia' || packet.model !== 'Optima') errors.push('packet scope mismatch');
  if (packet.applicationGate?.status !== 'blocked' || !equal(packet.applicationGate?.blockerRecordIds, CLEANUP_IDS.slice().sort())) errors.push('application blocker set mismatch');
  if (packet.source?.snapshotSha256 !== expectedSnapshotSha256 || packet.source?.snapshotHash !== snapshot.snapshotHash) errors.push('snapshot binding mismatch');
  if (packet.source?.modelRecordCount !== 13 || modelRows.length !== 13 || ids.length !== 13 || new Set(ids).size !== 13) errors.push('Optima row count mismatch');
  if (!equal(ids.slice().sort(), [...frozenById.keys()].sort())) errors.push('frozen ID coverage mismatch');
  if (!equal(packet.summary, EXPECTED_SUMMARY)) errors.push('summary mismatch');
  if (!equal(packet.campaignSources, CAMPAIGN_SOURCES) || !equal(packet.pdfSources, PDF_SOURCES)) errors.push('official source map mismatch');
  if (!equal(packet.manufacturerCommunications, MFR_COMMUNICATIONS_SOURCE) || !equal(packet.flatRecallSource, FLAT_RECALL_SOURCE)) errors.push('dataset source map mismatch');
  if (!equal(packet.expectedFlatRecallInventory, EXPECTED_FLAT_RECALL_INVENTORY) || !equal(packet.deferredCampaigns, DEFERRED_CAMPAIGNS)) errors.push('recall inventory mismatch');

  for (const row of packet.rows || []) {
    const frozen = frozenById.get(row.id);
    if (!frozen) { errors.push(`${row.id}: unknown ID`); continue; }
    const before = fullRecord(frozen);
    const rewrite = REWRITE_IDS.includes(row.id);
    const expectedProposal = rewrite ? rewriteProposal(frozen) : cleanupProposal(frozen);
    if (row.action !== actionFor(row.id) || row.reason !== reasonFor(row.id)) errors.push(`${row.id}: decision mismatch`);
    if (!equal(row.before, before) || row.beforeSha256 !== hashValue(before)) errors.push(`${row.id}: before drift`);
    if (!equal(row.proposal, expectedProposal) || row.proposalSha256 !== hashValue(expectedProposal)) errors.push(`${row.id}: proposal drift`);
    const expectedChanged = FULL_RECORD_FIELDS.filter((field) => hashValue(before[field]) !== hashValue(expectedProposal[field]));
    if (!equal(row.changedFields, expectedChanged)) errors.push(`${row.id}: changed-field drift`);
    if (!equal(row.evidence, evidenceFor(frozen)) || !row.evidence?.length) errors.push(`${row.id}: evidence drift`);
    for (const field of IMMUTABLE_FIELDS) if (!equal(row.proposal[field], before[field])) errors.push(`${row.id}: immutable ${field} drift`);
    for (const field of FULL_RECORD_FIELDS) if (!Object.prototype.hasOwnProperty.call(row.before, field) || !Object.prototype.hasOwnProperty.call(row.proposal, field)) errors.push(`${row.id}: missing ${field}`);
    if (row.proposal.status !== 'published' || /^Archived\s*-/i.test(row.proposal.title)) errors.push(`${row.id}: publication drift`);
    if (!row.changedFields.length || row.proposal.humanApproved !== false || row.proposal.reportCount !== 0 || row.proposal.source !== 'manual') errors.push(`${row.id}: proposal approval/source drift`);
    if (!equal(row.proposal.communityRecommendations, []) || !equal(row.proposal.fixParts, [])) errors.push(`${row.id}: proposal commerce remains`);
    if (JSON.stringify(row.proposal).match(/amazon\.com\/s\?k=|rockauto\.com\/en\/partsearch|ebay\.com\/sch\/i\.html/)) errors.push(`${row.id}: search commerce remains`);
    if (rewrite && row.commerceDecision !== REWRITE_CARDS[row.id].commerceDecision) errors.push(`${row.id}: rewrite commerce disposition mismatch`);
    if (!rewrite && row.commerceDecision !== 'remove-unsafe-or-unverified-commerce-pending-exact-source') errors.push(`${row.id}: cleanup commerce disposition mismatch`);
  }

  const byId = new Map((packet.rows || []).map((row) => [row.id, row]));
  if (!/extension wiring-harness kit/i.test(byId.get(IDS.acu)?.proposal?.solution || '') || /clock spring/i.test(byId.get(IDS.acu)?.proposal?.solution || '') === false) errors.push('ACU remedy correction mismatch');
  if (!/2008-2011/i.test(byId.get(IDS.brakeSwitch)?.proposal?.description || '') || !equal(byId.get(IDS.brakeSwitch)?.proposal?.years, [2008, 2009, 2010])) errors.push('brake-switch bounded scope mismatch');
  if (!/2\.5L or 2\.7L V6/i.test(byId.get(IDS.crankSensor)?.proposal?.description || '')) errors.push('crank-sensor scope mismatch');
  if (!/event 541/i.test(byId.get(IDS.dct)?.proposal?.solution || '') || !/TRA083/i.test(byId.get(IDS.dct)?.proposal?.solution || '') || !equal(byId.get(IDS.dct)?.proposal?.relatedIssueIds, [])) errors.push('DCT correction mismatch');
  if (!/salt-belt/i.test(byId.get(IDS.subframe)?.proposal?.description || '')) errors.push('subframe recall scope mismatch');
  if (!equal(byId.get(IDS.hybridBattery)?.proposal?.dtcCodes, []) || byId.get(IDS.hybridBattery)?.proposal?.citations?.length) errors.push('hybrid-battery false fields remain');
  for (const code of ['optima-five-exact-identities-bounded', 'optima-acu-remedy-corrected', 'optima-dct-fluid-codes-and-relations-removed', 'optima-hybrid-battery-false-egr-codes-and-sources-removed', 'optima-eight-aggregations-remain-blocked', 'optima-seventeen-new-recall-identities-deferred', 'all-optima-pages-preserved']) if (!packet.observations?.some((item) => item.code === code)) errors.push(`missing observation ${code}`);
  return errors;
}

if (require.main === module) {
  const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8')); const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')); const errors = validatePacket(packet, snapshot);
  console.log(JSON.stringify({ passed: errors.length === 0, packetSha256: normalizedFileHash(PACKET), decisionCount: packet.rows?.length || 0, applicationGate: packet.applicationGate, errors }, null, 2));
  if (errors.length) process.exitCode = 1;
}
module.exports = { EXPECTED_SUMMARY, PACKET, SNAPSHOT, validatePacket };
