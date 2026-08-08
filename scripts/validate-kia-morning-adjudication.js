/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const { FULL_RECORD_FIELDS, fullRecord, hashValue, normalizedFileHash, stableValue } = require('./kia-adjudication-utils');
const { HOLD_IDS, HOLD_REASONS, NHTSA_SOURCE, OUTPUT: PACKET, PDF_SOURCES, REWRITE_CARD, REWRITE_ID, SNAPSHOT, WEB_SOURCES, evidenceFor, rewriteProposal } = require('./build-kia-morning-adjudication');

const EXPECTED_SUMMARY = { rewrite_same_identity: 1, keep_published_pending_source: 5, total: 6 };
const IMMUTABLE_FIELDS = ['make', 'model', 'years', 'category', 'title', 'status'];
function equal(a, b) { return JSON.stringify(stableValue(a)) === JSON.stringify(stableValue(b)); }

function validatePacket(packet, snapshot, expectedSnapshotSha256 = normalizedFileHash(SNAPSHOT)) {
  const errors = [];
  const modelRows = snapshot.records.filter((row) => row.make === 'Kia' && row.model === 'Morning');
  const frozenById = new Map(modelRows.map((row) => [row.id, row]));
  const ids = packet.rows?.map((row) => row.id) || [];
  const expectedBlockers = Object.values(HOLD_IDS).sort();
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true) errors.push('packet safety status mismatch');
  if (packet.make !== 'Kia' || packet.model !== 'Morning') errors.push('packet scope mismatch');
  if (packet.applicationGate?.status !== 'blocked' || !equal(packet.applicationGate?.blockerRecordIds, expectedBlockers)) errors.push('application blocker set mismatch');
  if (packet.source?.snapshotSha256 !== expectedSnapshotSha256 || packet.source?.snapshotHash !== snapshot.snapshotHash) errors.push('snapshot binding mismatch');
  if (packet.source?.modelRecordCount !== 6 || modelRows.length !== 6 || ids.length !== 6 || new Set(ids).size !== 6) errors.push('Morning row count mismatch');
  if (!equal(ids.slice().sort(), [...frozenById.keys()].sort())) errors.push('frozen ID coverage mismatch');
  if (!equal(packet.summary, EXPECTED_SUMMARY)) errors.push('summary mismatch');
  if (!equal(packet.webSources, WEB_SOURCES) || !equal(packet.pdfSources, PDF_SOURCES) || !equal(packet.nhtsaCoverage, NHTSA_SOURCE)) errors.push('source map mismatch');

  for (const row of packet.rows || []) {
    const frozen = frozenById.get(row.id);
    if (!frozen) { errors.push(`${row.id}: unknown ID`); continue; }
    const before = fullRecord(frozen);
    const rewrite = row.id === REWRITE_ID;
    const expectedProposal = rewrite ? rewriteProposal(frozen) : before;
    const expectedAction = rewrite ? 'rewrite_same_identity' : 'keep_published_pending_source';
    const expectedReason = rewrite ? 'The exact Korean government recall matches this indexed PCV-valve identity and its complete frozen year set. The proposal narrows the content to the official production range, failure mechanism and dealer remedy without changing ID, title, category, years or status.' : HOLD_REASONS[row.id];
    if (row.action !== expectedAction || row.reason !== expectedReason) errors.push(`${row.id}: decision mismatch`);
    if (!equal(row.before, before) || row.beforeSha256 !== hashValue(before)) errors.push(`${row.id}: before drift`);
    if (!equal(row.proposal, expectedProposal) || row.proposalSha256 !== hashValue(expectedProposal)) errors.push(`${row.id}: proposal drift`);
    const expectedChanged = FULL_RECORD_FIELDS.filter((field) => hashValue(before[field]) !== hashValue(expectedProposal[field]));
    if (!equal(row.changedFields, expectedChanged)) errors.push(`${row.id}: changed-field drift`);
    if (!equal(row.evidence, evidenceFor(frozen)) || !row.evidence?.length) errors.push(`${row.id}: evidence drift`);
    for (const field of IMMUTABLE_FIELDS) if (!equal(row.proposal[field], before[field])) errors.push(`${row.id}: immutable ${field} drift`);
    for (const field of FULL_RECORD_FIELDS) if (!Object.prototype.hasOwnProperty.call(row.before, field) || !Object.prototype.hasOwnProperty.call(row.proposal, field)) errors.push(`${row.id}: missing ${field}`);
    if (row.proposal.status !== 'published' || /^Archived\s*-/i.test(row.proposal.title)) errors.push(`${row.id}: publication drift`);
    if (rewrite) {
      if (!row.changedFields.length || row.commerceDecision !== REWRITE_CARD.commerceDecision) errors.push(`${row.id}: rewrite disposition mismatch`);
      if (!equal(row.proposal.communityRecommendations, []) || !equal(row.proposal.fixParts, [])) errors.push(`${row.id}: rewrite commerce remains`);
      if (row.proposal.humanApproved !== false || row.proposal.reportCount !== 0 || row.proposal.source !== 'manual') errors.push(`${row.id}: rewrite approval/source drift`);
      if (row.proposal.reviewedOn !== '2026-08-08' || row.proposal.contentUpdatedOn !== '2026-08-08') errors.push(`${row.id}: rewrite date drift`);
      if (!equal(row.proposal.years, [2011, 2012]) || !equal(row.proposal.trims, []) || !equal(row.proposal.engines, [])) errors.push(`${row.id}: rewrite scope drift`);
      if (JSON.stringify(row.proposal).match(/amazon\.com\/s\?k=|rockauto\.com\/en\/partsearch|ebay\.com\/sch\/i\.html/)) errors.push(`${row.id}: search commerce remains`);
    } else if (!equal(row.proposal, before) || row.proposalSha256 !== row.beforeSha256 || !equal(row.changedFields, [])) errors.push(`${row.id}: hold drift`);
  }

  const pcv = packet.rows?.find((row) => row.id === REWRITE_ID);
  if (!JSON.stringify(pcv?.proposal?.citations || []).includes('boardId=343514') || !/plastic needle|steel/i.test(`${pcv?.proposal?.description} ${pcv?.proposal?.solution}`)) errors.push('PCV official correction mismatch');
  const fuel = packet.rows?.find((row) => row.id === HOLD_IDS.fuelHose);
  if (!equal(fuel?.proposal?.years, [2011, 2012, 2013]) || fuel?.action !== 'keep_published_pending_source') errors.push('fuel-hose year hold mismatch');
  for (const code of ['morning-korean-market-source-route', 'morning-pcv-official-recall-bounded', 'morning-fuel-hose-2013-boundary-conflict', 'morning-cold-start-primary-source-missing', 'morning-rear-seal-generation-conflict', 'morning-oap-and-clutch-secondary-only', 'all-morning-pages-preserved']) if (!packet.observations?.some((item) => item.code === code)) errors.push(`missing observation ${code}`);
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
