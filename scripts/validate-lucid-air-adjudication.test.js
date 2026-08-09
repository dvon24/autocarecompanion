/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');
const { IDS, OUTPUT, SNAPSHOT } = require('./build-lucid-air-adjudication');
const { diffFields, hashValue } = require('./lucid-adjudication-utils');
const { validatePacket } = require('./validate-lucid-air-adjudication');

const packet = JSON.parse(fs.readFileSync(OUTPUT, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function rowFor(copy, id) { return copy.rows.find((row) => row.id === id); }
function rehash(row) { row.proposalSha256 = hashValue(row.proposal); row.changedFields = diffFields(row.before, row.proposal); }
function assertRejected(copy, pattern) { const errors = validatePacket(copy, snapshot); assert.ok(errors.some((error) => pattern.test(error)), errors.join('\n')); }

test('Lucid Air packet passes the complete 8-page safety contract', () => assert.deepEqual(validatePacket(packet, snapshot), []));
test('validator rejects missing, duplicate and invented page coverage', () => {
  const missing = clone(packet); missing.rows.pop(); assert.ok(validatePacket(missing, snapshot).length);
  const duplicate = clone(packet); duplicate.rows[0] = clone(duplicate.rows[1]); assert.ok(validatePacket(duplicate, snapshot).length);
  const invented = clone(packet); invented.rows.push(clone(invented.rows[0])); invented.rows.at(-1).id = 'lucid-air-invented'; assert.ok(validatePacket(invented, snapshot).length);
});
test('validator rejects identity, fitment, severity, count and status drift', () => {
  for (const [field, value] of [['title','Changed'],['years',[1900]],['trims',['Invented']],['engines',['Invented']],['category','other'],['severity','critical'],['relatedIssueIds',['other']],['reportCount',12],['status','archived']]) {
    const changed = clone(packet); const row = changed.rows[0]; row.proposal[field] = value; rehash(row);
    assert.ok(validatePacket(changed, snapshot).length, `expected ${field} mutation failure`);
  }
});
test('validator rejects hidden redirect or canonical identity fields', () => { const changed = clone(packet); const row = changed.rows[0]; row.proposal.canonicalId = 'replacement'; rehash(row); assertRejected(changed, /unauthorized proposal field/); });
test('validator rejects 0+ owners and invented owner social proof', () => { const changed = clone(packet); const row = changed.rows[0]; row.proposal.solution += ' 0+ owners have reported this issue.'; rehash(row); assertRejected(changed, /social proof/); });
test('validator rejects search links, secondary citations and commerce activation', () => {
  const changed = clone(packet); const row = changed.rows[0]; row.proposal.citations.push({ type: 'article', title: 'Search', url: 'https://example.com/search?q=part' }); row.proposal.fixParts.push({ name: 'Part', url: 'https://example.com/part' }); rehash(row);
  const errors = validatePacket(changed, snapshot); assert.ok(errors.some((error) => /search-style/.test(error))); assert.ok(errors.some((error) => /non-primary/.test(error))); assert.ok(errors.some((error) => /commerce-free/.test(error)));
});
test('validator rejects old 12V and charge-light replacement claims', () => {
  const battery = clone(packet); const batteryRow = rowFor(battery, IDS.battery); batteryRow.proposal.solution += ' Use a 12V battery maintainer and buy an AGM battery for $300-$500.'; rehash(batteryRow); assertRejected(battery, /12V evidence/);
  const led = clone(packet); const ledRow = rowFor(led, IDS.chargeLed); ledRow.proposal.solution += ' Replace the module under warranty for $250-$500.'; rehash(ledRow); assertRejected(led, /charge-light evidence/);
});
test('validator rejects blending the HVCH recall into generic heat-pump or loss-of-drive claims', () => {
  const heat = clone(packet); const heatRow = rowFor(heat, IDS.heatPump); heatRow.proposal.description += ' Refrigerant leak and compressor failure are covered.'; rehash(heatRow); assertRejected(heat, /heat-pump evidence/);
  const hvch = clone(packet); const hvchRow = rowFor(hvch, IDS.hvch); hvchRow.proposal.description += ' The same component causes sudden loss of drive through a wiring harness failure.'; rehash(hvchRow); assertRejected(hvch, /HVCH recall/);
});
test('validator rejects the false steering-wheel reset and automatic compute replacement', () => { const changed = clone(packet); const row = rowFor(changed, IDS.infotainment); row.proposal.solution += ' Hold both scroll wheels, then replace the compute stack.'; rehash(row); assertRejected(changed, /infotainment evidence/); });
test('validator rejects unsupported paint and roof production narratives', () => {
  const paint = clone(packet); const paintRow = rowFor(paint, IDS.paint); paintRow.proposal.description += ' Quality improved across 2023 and Lucid gave goodwill repaints.'; rehash(paintRow); assertRejected(paint, /paint evidence/);
  const roof = clone(packet); const roofRow = rowFor(roof, IDS.roof); roofRow.proposal.description += ' The single-piece glass creates a tight tolerance challenge.'; rehash(roofRow); assertRejected(roof, /roof evidence/);
});
test('validator rejects converting the front hose-clip communication into a rear-mount bulletin', () => { const changed = clone(packet); const row = rowFor(changed, IDS.rearMount); row.proposal.description += ' Lucid issued several rear mount bulletins.'; row.proposal.solution += ' Replace it under the 8 yr / 100,000 mile warranty for $400-$900.'; rehash(row); assertRejected(changed, /rear-mount evidence/); });
test('validator rejects incomplete PDF visual-review metadata', () => { const changed = clone(packet); changed.pdfSources.hvchRecall.visualPages = [1]; assertRejected(changed, /PDF visual\/hash metadata incomplete/); });
