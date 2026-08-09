/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');
const { IDS, OUTPUT, SNAPSHOT } = require('./build-mazda-626-adjudication');
const { diffFields, hashValue } = require('./mazda-adjudication-utils');
const { validatePacket } = require('./validate-mazda-626-adjudication');

const packet = JSON.parse(fs.readFileSync(OUTPUT, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function rowFor(copy, id) { return copy.rows.find((row) => row.id === id); }
function rehash(row) { row.proposalSha256 = hashValue(row.proposal); row.changedFields = diffFields(row.before, row.proposal); }
function assertRejected(copy, pattern) { const errors = validatePacket(copy, snapshot); assert.ok(errors.some((error) => pattern.test(error)), errors.join('\n')); }

test('Mazda 626 packet passes the complete 9-page safety contract', () => assert.deepEqual(validatePacket(packet, snapshot), []));
test('validator rejects missing, duplicate and invented page coverage', () => {
  const missing = clone(packet); missing.rows.pop(); assert.ok(validatePacket(missing, snapshot).length);
  const duplicate = clone(packet); duplicate.rows[0] = clone(duplicate.rows[1]); assert.ok(validatePacket(duplicate, snapshot).length);
  const invented = clone(packet); invented.rows.push(clone(invented.rows[0])); invented.rows.at(-1).id = 'mazda-626-invented'; assert.ok(validatePacket(invented, snapshot).length);
});
test('validator rejects identity, fitment, severity, count and status drift', () => {
  for (const [field, value] of [['title', 'Changed'], ['years', [1900]], ['trims', ['Invented']], ['engines', ['Invented']], ['category', 'other'], ['severity', 'critical'], ['relatedIssueIds', ['other']], ['reportCount', 12], ['status', 'archived']]) {
    const changed = clone(packet); const row = changed.rows[0]; row.proposal[field] = value; rehash(row);
    assert.ok(validatePacket(changed, snapshot).length, `expected ${field} mutation failure`);
  }
});
test('validator preserves the one known nonzero report count without writing social proof', () => {
  const egr = rowFor(packet, IDS.egr);
  assert.equal(egr.before.reportCount, 150);
  assert.equal(egr.proposal.reportCount, 150);
  assert.doesNotMatch(`${egr.proposal.description} ${egr.proposal.solution}`, /owners? have reported|\d+\+ owners?/i);
});
test('validator rejects hidden redirect or canonical identity fields', () => {
  const changed = clone(packet); const row = changed.rows[0]; row.proposal.canonicalId = 'replacement'; rehash(row); assertRejected(changed, /unauthorized proposal field/);
});
test('validator rejects 0+ owners and all invented owner social proof', () => {
  const changed = clone(packet); const row = changed.rows[0]; row.proposal.solution += ' 0+ owners have reported this issue.'; rehash(row); assertRejected(changed, /social proof/);
});
test('validator rejects search links, secondary citations and commerce activation', () => {
  const changed = clone(packet); const row = changed.rows[0]; row.proposal.citations.push({ type: 'article', title: 'Search', url: 'https://example.com/search?q=part' }); row.proposal.fixParts.push({ name: 'Part', url: 'https://example.com/part' }); rehash(row);
  const errors = validatePacket(changed, snapshot); assert.ok(errors.some((error) => /search-style/.test(error))); assert.ok(errors.some((error) => /non-primary/.test(error))); assert.ok(errors.some((error) => /commerce-free/.test(error)));
});
test('validator rejects restoring the unsupported transmission mileage and fluid advice', () => {
  const early = clone(packet); const earlyRow = rowFor(early, IDS.transmissionEarly); earlyRow.proposal.description += ' Failures occur at 60,000 miles because the clutches are undersized.'; rehash(earlyRow); assertRejected(early, /early transmission/);
  const late = clone(packet); const lateRow = rowFor(late, IDS.transmissionLate); lateRow.proposal.solution += ' Use Mercon V every 30,000 miles and never flush.'; rehash(lateRow); assertRejected(late, /late transmission/);
});
test('validator rejects merging the 1997 and 1998 timing-tensioner recalls', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.timingTensioner); row.proposal.description = row.proposal.description.replace('The earlier 98V206 campaign applies to 1997 model-year 626 and MX-6 vehicles and must not be blended into this 1998 page.', 'The same 98V206 recall covers all 1998 engines.'); rehash(row); assertRejected(changed, /timing-tensioner recall/);
});
test('validator rejects unsupported distributor, EGR and head-gasket certainty', () => {
  const distributor = clone(packet); const distributorRow = rowFor(distributor, IDS.distributor); distributorRow.proposal.description += ' Heat always destroys the Hall sensor at 80,000 miles.'; rehash(distributorRow); assertRejected(distributor, /distributor evidence/);
  const egr = clone(packet); const egrRow = rowFor(egr, IDS.egr); egrRow.proposal.solution += ' Clean it every 60k as preventive maintenance.'; rehash(egrRow); assertRejected(egr, /EGR evidence/);
  const head = clone(packet); const headRow = rowFor(head, IDS.headGasket); headRow.proposal.description = 'This is a chronic defect in every listed engine.'; rehash(headRow); assertRejected(head, /head-gasket evidence/);
});
test('validator rejects the old ignition aftermarket substitution and V6 sealant advice', () => {
  const ignition = clone(packet); const ignitionRow = rowFor(ignition, IDS.ignitionSwitch); ignitionRow.proposal.solution += ' Use an independent aftermarket switch if the dealer cannot source it.'; rehash(ignitionRow); assertRejected(ignition, /ignition recall/);
  const seal = clone(packet); const sealRow = rowFor(seal, IDS.v6DistributorSeal); sealRow.proposal.solution += ' Apply RTV sealer around the housing.'; rehash(sealRow); assertRejected(seal, /V6 distributor-seal/);
});
test('validator rejects incomplete PDF visual-review metadata', () => {
  const changed = clone(packet); changed.pdfSources.ignitionRecall.visualPages = [1]; assertRejected(changed, /PDF visual\/hash metadata incomplete/);
});
test('validator rejects application approval or an unblocked packet', () => {
  const changed = clone(packet); changed.applicationGate.status = 'ready'; changed.rows[0].proposal.humanApproved = true; rehash(changed.rows[0]); const errors = validatePacket(changed, snapshot); assert.ok(errors.some((error) => /blocked proposal-only/.test(error))); assert.ok(errors.some((error) => /commerce-free/.test(error)));
});
