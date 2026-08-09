/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');
const { IDS, OUTPUT, SNAPSHOT } = require('./build-mazda-cx-5-adjudication');
const { diffFields, hashValue } = require('./mazda-adjudication-utils');
const { validatePacket } = require('./validate-mazda-cx-5-adjudication');

const packet = JSON.parse(fs.readFileSync(OUTPUT, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function rowFor(copy, id) { return copy.rows.find((row) => row.id === id); }
function rehash(row) { row.proposalSha256 = hashValue(row.proposal); row.changedFields = diffFields(row.before, row.proposal); }
function assertRejected(copy, pattern) { const errors = validatePacket(copy, snapshot); assert.ok(errors.some((error) => pattern.test(error)), errors.join('\n')); }

test('Mazda CX-5 packet passes the complete 18-page safety contract', () => assert.deepEqual(validatePacket(packet, snapshot), []));
test('validator rejects missing, duplicate and invented page coverage', () => {
  const missing = clone(packet); missing.rows.pop(); assert.ok(validatePacket(missing, snapshot).length);
  const duplicate = clone(packet); duplicate.rows[0] = clone(duplicate.rows[1]); assert.ok(validatePacket(duplicate, snapshot).length);
  const invented = clone(packet); invented.rows.push(clone(invented.rows[0])); invented.rows.at(-1).id = 'mazda-cx5-invented'; assert.ok(validatePacket(invented, snapshot).length);
});
test('validator rejects identity, fitment, severity, count and status drift', () => {
  for (const [field, value] of [['title', 'Changed'], ['years', [1900]], ['trims', ['Invented']], ['engines', ['Invented']], ['category', 'other'], ['severity', 'critical'], ['relatedIssueIds', ['other']], ['reportCount', 12], ['status', 'archived']]) {
    const changed = clone(packet); const row = changed.rows[0]; row.proposal[field] = value; rehash(row); assert.ok(validatePacket(changed, snapshot).length, `expected ${field} mutation failure`);
  }
});
test('validator preserves all frozen counts while forbidding 0+ and nonzero owner marketing copy', () => {
  for (const row of packet.rows) { assert.equal(row.proposal.reportCount, row.before.reportCount); assert.doesNotMatch(`${row.proposal.description} ${row.proposal.solution}`, /owners? have reported|\d+\+ owners?/i); }
  assert.equal(rowFor(packet, IDS.turboOil).before.reportCount, 0);
  assert.equal(rowFor(packet, IDS.fuelPump).before.reportCount, 3200);
});
test('validator rejects hidden redirects, social proof, search links and commerce activation', () => {
  const changed = clone(packet); const row = changed.rows[0]; row.proposal.canonicalId = 'replacement'; row.proposal.solution += ' 0+ owners have reported this issue.'; row.proposal.citations.push({ type: 'article', title: 'Search', url: 'https://example.com/search?q=part' }); row.proposal.fixParts.push({ name: 'Part', url: 'https://example.com/part' }); rehash(row);
  const errors = validatePacket(changed, snapshot); assert.ok(errors.some((error) => /unauthorized proposal field/.test(error))); assert.ok(errors.some((error) => /social proof/.test(error))); assert.ok(errors.some((error) => /search-style/.test(error))); assert.ok(errors.some((error) => /commerce-free/.test(error)));
});
test('validator rejects restoring the rocker-arm mechanism to recall 19V497', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.cylinderDeactivation); row.proposal.description = 'Recall 19V497 proves the number-four rocker arm dislodges.'; row.proposal.solution = 'Replace rocker arms, HLAs, camshaft and cylinder head.'; rehash(row); assertRejected(changed, /19V497 mechanism/);
});
test('validator rejects converting the bounded evaporator case back into compressor replacement', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.ac); row.proposal.description = 'Every 2013-2019 CX-5 has compressor failure.'; row.proposal.solution = 'Replace the compressor, receiver-drier and expansion valve.'; rehash(row); assertRejected(changed, /A\/C evidence/);
});
test('validator rejects broad EPB codes and automatic two-sided caliper repair', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.epb); row.proposal.description = 'All 2016-2020 CX-5 vehicles have connector corrosion.'; row.proposal.solution = 'Replace both rear calipers.'; row.proposal.dtcCodes = ['C2005', 'C112A']; rehash(row); assertRejected(changed, /EPB boundary/);
});
test('validator rejects universal battery, carbon and MAF shopping advice', () => {
  const battery = clone(packet); const batteryRow = rowFor(battery, IDS.istopBattery); batteryRow.proposal.description = 'The 480 CCA battery is undersized.'; batteryRow.proposal.solution = 'Buy a 600 CCA Group 35 AGM battery.'; rehash(batteryRow); assertRejected(battery, /i-stop battery/);
  const carbon = clone(packet); const carbonRow = rowFor(carbon, IDS.carbon); carbonRow.proposal.solution = 'Perform a walnut blast every 15,000 miles and add fuel additive.'; rehash(carbonRow); assertRejected(carbon, /carbon\/software/);
  const maf = clone(packet); const mafRow = rowFor(maf, IDS.maf); mafRow.proposal.description = 'P0401 proves MAF failure.'; mafRow.proposal.solution = 'Buy CRC cleaner and spray the sensor.'; rehash(mafRow); assertRejected(maf, /MAF evidence/);
});
test('validator rejects expanding recall and bulletin years in prose', () => {
  const fuel = clone(packet); const fuelRow = rowFor(fuel, IDS.fuelPump); fuelRow.proposal.description = 'Recall 21V875 covers every 2019-2021 CX-5.'; rehash(fuelRow); assertRejected(fuel, /fuel-pump recall/);
  const suspension = clone(packet); const suspensionRow = rowFor(suspension, IDS.suspension); suspensionRow.proposal.description = 'TSB 02-003/17 proves all 2013-2020 clunks.'; rehash(suspensionRow); assertRejected(suspension, /suspension boundary/);
});
test('validator rejects automatic water-pump and bilateral wheel-bearing replacement', () => {
  const cover = clone(packet); const coverRow = rowFor(cover, IDS.coverPump); coverRow.proposal.description = 'Any green residue proves water-pump failure.'; coverRow.proposal.solution = 'Replace the water pump and add stop-leak.'; rehash(coverRow); assertRejected(cover, /front-cover\/water-pump/);
  const wheel = clone(packet); const wheelRow = rowFor(wheel, IDS.wheelBearing); wheelRow.proposal.description = 'Potholes cause premature wheel-bearing failure.'; wheelRow.proposal.solution = 'Replace both sides automatically.'; rehash(wheelRow); assertRejected(wheel, /wheel-bearing diagnostic/);
});
test('validator rejects CMU replacement without serial diagnosis and unsupported rust color theory', () => {
  const cmu = clone(packet); const cmuRow = rowFor(cmu, IDS.cmu); cmuRow.proposal.description = 'Every black screen is a failed CMU.'; cmuRow.proposal.solution = 'Replace the CMU and reset it by holding navigation and mute.'; rehash(cmuRow); assertRejected(cmu, /CMU scope/);
  const rust = clone(packet); const rustRow = rowFor(rust, IDS.rust); rustRow.proposal.description = 'Thin Soul Red paint causes every door to rust.'; rehash(rustRow); assertRejected(rust, /rust TSB/);
});
test('validator rejects incomplete PDF review metadata or an unblocked packet', () => {
  const pdf = clone(packet); pdf.pdfSources.frontCover.visualPages = [1]; assertRejected(pdf, /PDF evidence metadata/);
  const ready = clone(packet); ready.applicationGate.status = 'ready'; ready.rows[0].proposal.humanApproved = true; rehash(ready.rows[0]); const errors = validatePacket(ready, snapshot); assert.ok(errors.some((error) => /blocked proposal-only/.test(error))); assert.ok(errors.some((error) => /commerce-free/.test(error)));
});
