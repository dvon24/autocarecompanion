/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');
const { IDS, OUTPUT, SNAPSHOT } = require('./build-mazda-cx-60-adjudication');
const { diffFields, hashValue } = require('./mazda-adjudication-utils');
const { validatePacket } = require('./validate-mazda-cx-60-adjudication');

const packet = JSON.parse(fs.readFileSync(OUTPUT, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function rowFor(copy, id) { return copy.rows.find((row) => row.id === id); }
function rehash(row) { row.proposalSha256 = hashValue(row.proposal); row.changedFields = diffFields(row.before, row.proposal); }
function assertRejected(copy, pattern) { const errors = validatePacket(copy, snapshot); assert.ok(errors.some((error) => pattern.test(error)), errors.join('\n')); }

test('Mazda CX-60 packet passes the complete 27-page safety contract', () => assert.deepEqual(validatePacket(packet, snapshot), []));
test('validator rejects missing, duplicate and invented page coverage', () => {
  const missing = clone(packet); missing.rows.pop(); assert.ok(validatePacket(missing, snapshot).length);
  const duplicate = clone(packet); duplicate.rows[0] = clone(duplicate.rows[1]); assert.ok(validatePacket(duplicate, snapshot).length);
  const invented = clone(packet); invented.rows.push(clone(invented.rows[0])); invented.rows.at(-1).id = 'mazda-cx60-invented'; assert.ok(validatePacket(invented, snapshot).length);
});
test('validator rejects identity, fitment, severity, count and status drift', () => {
  for (const [field, value] of [['title', 'Changed'], ['years', [1900]], ['trims', ['Invented']], ['engines', ['Invented']], ['category', 'other'], ['severity', 'critical'], ['relatedIssueIds', ['other']], ['reportCount', 12], ['status', 'archived']]) {
    const changed = clone(packet); const row = changed.rows[0]; row.proposal[field] = value; rehash(row); assert.ok(validatePacket(changed, snapshot).length, `expected ${field} mutation failure`);
  }
});
test('validator preserves every frozen report count and forbids owner-count prose', () => {
  for (const row of packet.rows) {
    assert.equal(row.proposal.reportCount, row.before.reportCount);
    assert.doesNotMatch(`${row.proposal.description} ${row.proposal.solution}`, /owners? have reported|\d+\+ owners?/i);
  }
  assert.equal(rowFor(packet, IDS.dieselCampaign).before.reportCount, 140);
  assert.equal(rowFor(packet, IDS.evRange).before.reportCount, 100);
  assert.equal(rowFor(packet, IDS.phevShift).before.reportCount, 180);
});
test('validator rejects hidden redirects, social proof, search links and commerce activation', () => {
  const changed = clone(packet); const row = changed.rows[0];
  row.proposal.canonicalId = 'replacement'; row.proposal.solution += ' 0+ owners have reported this issue.';
  row.proposal.citations.push({ type: 'article', title: 'Search', url: 'https://example.com/search?q=part' });
  row.proposal.fixParts.push({ name: 'Part', url: 'https://example.com/part' }); rehash(row);
  const errors = validatePacket(changed, snapshot);
  assert.ok(errors.some((error) => /unauthorized proposal field/.test(error)));
  assert.ok(errors.some((error) => /social proof/.test(error)));
  assert.ok(errors.some((error) => /search-style|citations drifted/.test(error)));
  assert.ok(errors.some((error) => /commerce-free/.test(error)));
});
test('validator rejects merging generic battery discharge into the early BCM campaign', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.batteryGeneric);
  row.proposal.description = 'Every CX-60 drains its 6.5Ah battery in 4.8 hours because of the BCM.';
  row.proposal.solution = 'Buy a new battery and reprogram every BCM. Do not buy nothing.'; rehash(row);
  assertRejected(changed, /generic battery versus campaign/);
});
test('validator rejects invented AdBlue quantities, codes, self-clear distance and sensor replacement', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.adblue);
  row.proposal.description = 'The 6.7-litre tank sets P20BA on all vehicles.';
  row.proposal.solution = 'Drive 1,000 km or replace the sensor. Do not buy until later.'; rehash(row);
  assertRejected(changed, /AdBlue report boundary/);
});
test('validator rejects restoring the unsafe DPF schedule and forced regeneration', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.dpf);
  row.proposal.description = 'Regenerate every two or three weeks.';
  row.proposal.solution = 'Drive for 30-45 minutes, then command a forced regeneration as the repair. Do not buy parts.'; rehash(row);
  assertRejected(changed, /DPF manual boundary/);
});
test('validator rejects guaranteed suspension retrofit, aftermarket advice and citation artifacts', () => {
  for (const id of [IDS.rideGeneric, IDS.rideRevision]) {
    const changed = clone(packet); const row = rowFor(changed, id);
    row.proposal.description = 'Mazda proves a universal defect. <cite index="1">';
    row.proposal.solution = 'This will be a free upgrade; buy Koni dampers and H&R springs. Do not buy elsewhere.'; rehash(row);
    assertRejected(changed, /suspension revision/);
  }
});
test('validator rejects the false AR058A PCM/BECM/TCM no-restart mechanism', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.hybridWrong);
  row.proposal.description = 'AR058A proves every no-restart is a PCM fault.';
  row.proposal.solution = 'Replace the PCM and reprogram the TCM as the AR058A remedy. Do not buy first.'; rehash(row);
  assertRejected(changed, /AR058A false-mechanism/);
});
test('validator rejects invented refueling production fix and automatic ORVR replacement', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.refuel);
  row.proposal.description = 'Mazda fixed this in July 2022 with new control logic.';
  row.proposal.solution = 'Replace the ORVR valve. Do not buy until VIN checked.'; rehash(row);
  assertRejected(changed, /refueling evidence/);
});
test('validator rejects treating transmission architecture as defect proof or merging the braking recall', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.shiftGeneric);
  row.proposal.description = 'The architecture proves every transmission will fail.';
  row.proposal.solution = 'Replace the clutch on every low-speed jerk. Do not buy before inspection.'; rehash(row);
  assertRejected(changed, /transmission architecture\/recall/);
});
test('validator rejects treating the AS007A North American bulletin as CX-60 applicability proof', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.insulation);
  row.proposal.description = 'The North American CX-70/CX-90 bulletin proves every global CX-60 is covered.';
  row.proposal.dtcCodes = []; rehash(row);
  assertRejected(changed, /AS007A jurisdiction\/diagnostic/);
});
test('validator rejects missing visual-page evidence or an application-ready gate', () => {
  const pdf = clone(packet); pdf.pdfSources.ar054a.visualPages = [1]; assertRejected(pdf, /PDF evidence metadata/);
  const ready = clone(packet); ready.applicationGate.status = 'ready'; assertRejected(ready, /blocked proposal-only/);
});
