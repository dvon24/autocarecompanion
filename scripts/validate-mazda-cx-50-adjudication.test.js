/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');
const { IDS, OUTPUT, SNAPSHOT } = require('./build-mazda-cx-50-adjudication');
const { diffFields, hashValue } = require('./mazda-adjudication-utils');
const { validatePacket } = require('./validate-mazda-cx-50-adjudication');

const packet = JSON.parse(fs.readFileSync(OUTPUT, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function rowFor(copy, id) { return copy.rows.find((row) => row.id === id); }
function rehash(row) { row.proposalSha256 = hashValue(row.proposal); row.changedFields = diffFields(row.before, row.proposal); }
function assertRejected(copy, pattern) { const errors = validatePacket(copy, snapshot); assert.ok(errors.some((error) => pattern.test(error)), errors.join('\n')); }

test('Mazda CX-50 packet passes the complete 10-page safety contract', () => assert.deepEqual(validatePacket(packet, snapshot), []));
test('validator rejects missing, duplicate and invented page coverage', () => {
  const missing = clone(packet); missing.rows.pop(); assert.ok(validatePacket(missing, snapshot).length);
  const duplicate = clone(packet); duplicate.rows[0] = clone(duplicate.rows[1]); assert.ok(validatePacket(duplicate, snapshot).length);
  const invented = clone(packet); invented.rows.push(clone(invented.rows[0])); invented.rows.at(-1).id = 'mazda-cx50-invented'; assert.ok(validatePacket(invented, snapshot).length);
});
test('validator rejects identity, fitment, severity, count and status drift', () => {
  for (const [field, value] of [['title', 'Changed'], ['years', [1900]], ['trims', ['Invented']], ['engines', ['Invented']], ['category', 'other'], ['severity', 'critical'], ['relatedIssueIds', ['other']], ['reportCount', 12], ['status', 'archived']]) {
    const changed = clone(packet); const row = changed.rows[0]; row.proposal[field] = value; rehash(row); assert.ok(validatePacket(changed, snapshot).length, `expected ${field} mutation failure`);
  }
});
test('validator preserves frozen counts while forbidding owner social-proof prose', () => {
  for (const row of packet.rows) { assert.equal(row.proposal.reportCount, row.before.reportCount); assert.doesNotMatch(`${row.proposal.description} ${row.proposal.solution}`, /owners? have reported|\d+\+ owners?/i); }
  assert.equal(rowFor(packet, IDS.abs).before.reportCount, 0);
  assert.equal(rowFor(packet, IDS.wind).before.reportCount, 1500);
});
test('validator rejects hidden redirects, social proof, search links and commerce activation', () => {
  const changed = clone(packet); const row = changed.rows[0]; row.proposal.canonicalId = 'replacement'; row.proposal.solution += ' 0+ owners have reported this issue.'; row.proposal.citations.push({ type: 'article', title: 'Search', url: 'https://example.com/search?q=part' }); row.proposal.fixParts.push({ name: 'Part', url: 'https://example.com/part' }); rehash(row);
  const errors = validatePacket(changed, snapshot); assert.ok(errors.some((error) => /unauthorized proposal field/.test(error))); assert.ok(errors.some((error) => /social proof/.test(error))); assert.ok(errors.some((error) => /search-style/.test(error))); assert.ok(errors.some((error) => /commerce-free/.test(error)));
});
test('validator rejects restoring a universal ABS part number', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.abs); row.proposal.description = 'Every 2023 CX-50 has a damaged HCU.'; row.proposal.solution = 'Buy and install VAY0437A0A.'; rehash(row); assertRejected(changed, /ABS recall boundary/);
});
test('validator rejects converting the hitch campaign into parts replacement', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.hitch); row.proposal.solution = 'Replace the hitch and mounting hardware on every 2024-2025 vehicle.'; rehash(row); assertRejected(changed, /hitch recall boundary/);
});
test('validator rejects promoting one P3400 complaint into a multi-year automatic repair', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.cylinder); row.proposal.description = 'All 2023-2025 CX-50 engines have metal from failed solenoids.'; row.proposal.solution = 'Replace both solenoids and the cylinder head.'; rehash(row); assertRejected(changed, /cylinder complaint boundary/);
});
test('validator rejects losing the signed-report versus flat-file camera conflict', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.camera); row.proposal.description = 'Recall 24V-649 covers every 2025 CX-50 Hybrid.'; rehash(row); assertRejected(changed, /camera source-conflict/);
});
test('validator rejects speculative battery replacement on the hybrid no-start path', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.hybrid); row.proposal.solution = 'Replace the 12V battery and PT-GWU.'; rehash(row); assertRejected(changed, /hybrid PT-GWU/);
});
test('validator rejects fake infotainment causes and generic transmission shopping advice', () => {
  const info = clone(packet); const infoRow = rowFor(info, IDS.infotainment); infoRow.proposal.description = 'The processor is underpowered on every 2023-2025 CX-50.'; infoRow.proposal.solution = 'Clear the cache and replace the CMU.'; rehash(infoRow); assertRejected(info, /infotainment software/);
  const trans = clone(packet); const transRow = rowFor(trans, IDS.transmission); transRow.proposal.solution = 'Use Sport mode and change 0000-FW ATF.'; transRow.proposal.dtcCodes = ['P0740']; rehash(transRow); assertRejected(trans, /transmission TCM/);
});
test('validator rejects actuator tightening and fixed-roof-rail DIY advice', () => {
  const turbo = clone(packet); const turboRow = rowFor(turbo, IDS.wastegate); turboRow.proposal.description = 'All years rattle only on cold start.'; turboRow.proposal.solution = 'Tighten the actuator or replace the turbocharger.'; rehash(turboRow); assertRejected(turbo, /wastegate bulletin/);
  const wind = clone(packet); const windRow = rowFor(wind, IDS.wind); windRow.proposal.description = 'The fixed roof rails whistle.'; windRow.proposal.solution = 'Add foam tape or a deflector.'; rehash(windRow); assertRejected(wind, /crossbar ONP09/);
});
test('validator rejects treating distortion as cracking or dropping visual-review metadata', () => {
  const glass = clone(packet); const glassRow = rowFor(glass, IDS.windshield); glassRow.proposal.description = 'TSB 09-041/25 proves every crack is a factory defect.'; glassRow.proposal.solution = 'Replace the windshield.'; rehash(glassRow); assertRejected(glass, /windshield report\/distortion/);
  const pdf = clone(packet); pdf.pdfSources.crossbars.visualPages = [1]; assertRejected(pdf, /PDF evidence metadata/);
  const ready = clone(packet); ready.applicationGate.status = 'ready'; assertRejected(ready, /blocked proposal-only/);
});
