/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const { OUTPUT, RECORD_ID, SNAPSHOT } = require('./build-lincoln-ls-adjudication');
const { FULL_RECORD_FIELDS, diffFields, fullRecord, hashValue } = require('./lincoln-adjudication-utils');
const IMMUTABLE_FIELDS = ['make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'severity', 'status', 'relatedIssueIds'];
const ALLOWED_CHANGED_FIELDS = new Set(['description', 'solution', 'confidence', 'symptoms', 'affectedSystems', 'dtcCodes', 'estimatedCostLow', 'estimatedCostHigh', 'typicalMileageLow', 'typicalMileageHigh', 'citations', 'communityRecommendations', 'fixParts', 'humanApproved', 'source', 'reviewedOn', 'contentUpdatedOn', 'contentUpdateSummary']);
const ALLOWED_SEVERITIES = new Set(['high', 'medium', 'low']);
function stable(value) { if (Array.isArray(value)) return value.map(stable); if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])])); return value; }
function equal(a, b) { return JSON.stringify(stable(a)) === JSON.stringify(stable(b)); }
function searchStyle(url) { return /[?&](?:q|query|search|keyword)=|\/search(?:\/|\?|$)|\/s\?/i.test(String(url)); }

function validatePacket(packet, snapshot) {
  const errors = []; const expected = snapshot.records.filter((row) => row.make === 'Lincoln' && row.model === 'LS'); const rows = Array.isArray(packet.rows) ? packet.rows : [];
  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true || packet.applicationGate?.status !== 'blocked') errors.push('packet must remain blocked proposal-only');
  if (packet.make !== 'Lincoln' || packet.model !== 'LS') errors.push('wrong make/model');
  if (expected.length !== 1 || rows.length !== 1 || rows[0]?.id !== RECORD_ID) errors.push('LS coverage must be the exact frozen 1/1 row');
  if (!equal(packet.applicationGate?.blockerRecordIds || [], [RECORD_ID])) errors.push('blocker IDs drifted');
  if (packet.summary?.retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source !== 1 || packet.summary?.total !== 1) errors.push('summary drifted');
  const row = rows[0]; const source = expected[0];
  if (!row || !source) return [...errors, 'missing LS decision'];
  const frozen = fullRecord(source);
  if (!equal(row.before, frozen) || row.beforeSha256 !== hashValue(frozen)) errors.push('before state drifted');
  if (row.proposalSha256 !== hashValue(row.proposal)) errors.push('proposal hash drifted');
  if (!equal(row.changedFields, diffFields(row.before, row.proposal))) errors.push('changedFields drifted');
  for (const field of FULL_RECORD_FIELDS) if (!(field in row.before) || !(field in row.proposal)) errors.push(`missing field ${field}`);
  for (const field of IMMUTABLE_FIELDS) if (!equal(row.before[field], row.proposal[field])) errors.push(`immutable ${field} changed`);
  if (!ALLOWED_SEVERITIES.has(row.proposal.severity)) errors.push('invalid severity');
  if (row.proposal.status !== 'published') errors.push('page may not be archived');
  if (row.proposal.reportCount !== 0 || /\b0\+?\s+owners?\b|owners? have reported/i.test(`${row.proposal.description} ${row.proposal.solution}`)) errors.push('fake owner social proof');
  if (row.action !== 'retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source') errors.push('wrong correction action');
  for (const field of row.changedFields) if (!ALLOWED_CHANGED_FIELDS.has(field)) errors.push(`unauthorized changed field ${field}`);
  if (row.proposal.humanApproved !== false || row.proposal.fixParts.length !== 0 || row.proposal.communityRecommendations.length !== 0) errors.push('correction must remain unapproved and commerce-free');
  if (!/do not buy/i.test(row.proposal.solution) || !/no universal retail part/i.test(row.proposal.solution)) errors.push('missing diagnosis-first no-commerce boundary');
  for (const citation of row.proposal.citations || []) { if (!/^https:\/\//.test(citation.url || '')) errors.push('non-HTTPS citation'); if (searchStyle(citation.url)) errors.push('search-style citation'); }
  const text = `${row.proposal.description} ${row.proposal.solution}`;
  if (!/no coolant-crossover or coolant-manifold communication/i.test(row.proposal.description) || !/rather than assuming a crossover leak/i.test(row.proposal.solution)) errors.push('unsupported crossover claim was not bounded');
  if (!/2001-2002 LS/.test(text) || !/P1285/.test(text) || !/P1299/.test(text) || !/hydraulic cooling fan/i.test(text)) errors.push('TSB 01-21-11 scope was lost');
  if (!/stop as soon as safely possible/i.test(row.proposal.solution) || !/never remove .* pressure cap while hot/i.test(row.proposal.solution)) errors.push('overheat safety boundary was lost');
  if (!/ESE-M97B44-A/.test(text) || !/WSS-M97B51-A1/.test(text) || !/exact model year/i.test(row.proposal.solution)) errors.push('year-specific coolant boundary was lost');
  if (/Motorcraft updated metal-flange|simultaneous replacement|all plastic coolant fittings|\$300-\$600/i.test(text)) errors.push('unsupported parts or cost prescription returned');
  if (row.proposal.citations.length !== 3 || !row.proposal.citations.every((citation) => /^https:\/\/www\.fordservicecontent\.com\//.test(citation.url))) errors.push('exact Ford source set drifted');
  return errors;
}

function main() { const packet = JSON.parse(fs.readFileSync(OUTPUT, 'utf8')); const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')); const errors = validatePacket(packet, snapshot); console.log(JSON.stringify({ passed: errors.length === 0, packetSha256: hashValue(packet), decisionCount: packet.rows.length, applicationGate: packet.applicationGate, errors }, null, 2)); if (errors.length) process.exitCode = 1; }
if (require.main === module) main();
module.exports = { ALLOWED_CHANGED_FIELDS, IMMUTABLE_FIELDS, validatePacket };
