/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');
const { IDS, OUTPUT, SNAPSHOT } = require('./build-mazda-cx-3-adjudication');
const { diffFields, hashValue } = require('./mazda-adjudication-utils');
const { validatePacket } = require('./validate-mazda-cx-3-adjudication');

const packet = JSON.parse(fs.readFileSync(OUTPUT, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function rowFor(copy, id) { return copy.rows.find((row) => row.id === id); }
function rehash(row) { row.proposalSha256 = hashValue(row.proposal); row.changedFields = diffFields(row.before, row.proposal); }
function assertRejected(copy, pattern) { const errors = validatePacket(copy, snapshot); assert.ok(errors.some((error) => pattern.test(error)), errors.join('\n')); }

test('Mazda CX-3 packet passes the complete 4-page safety contract', () => assert.deepEqual(validatePacket(packet, snapshot), []));
test('validator rejects missing, duplicate and invented page coverage', () => {
  const missing = clone(packet); missing.rows.pop(); assert.ok(validatePacket(missing, snapshot).length);
  const duplicate = clone(packet); duplicate.rows[0] = clone(duplicate.rows[1]); assert.ok(validatePacket(duplicate, snapshot).length);
  const invented = clone(packet); invented.rows.push(clone(invented.rows[0])); invented.rows.at(-1).id = 'mazda-cx3-invented'; assert.ok(validatePacket(invented, snapshot).length);
});
test('validator rejects identity, fitment, severity, count and status drift', () => {
  for (const [field, value] of [['title', 'Changed'], ['years', [1900]], ['trims', ['Invented']], ['engines', ['Invented']], ['category', 'other'], ['severity', 'critical'], ['relatedIssueIds', ['other']], ['reportCount', 12], ['status', 'archived']]) {
    const changed = clone(packet); const row = changed.rows[0]; row.proposal[field] = value; rehash(row); assert.ok(validatePacket(changed, snapshot).length, `expected ${field} mutation failure`);
  }
});
test('validator preserves all frozen counts while forbidding owner marketing copy', () => {
  const expected = new Map([[IDS.ac, 700], [IDS.carbon, 0], [IDS.rearBrake, 850], [IDS.transmission, 950]]);
  for (const [id, count] of expected) { const row = rowFor(packet, id); assert.equal(row.before.reportCount, count); assert.equal(row.proposal.reportCount, count); assert.doesNotMatch(`${row.proposal.description} ${row.proposal.solution}`, /owners? have reported|\d+\+ owners?/i); }
});
test('validator rejects hidden redirects and 0+ owner social proof', () => {
  const hidden = clone(packet); hidden.rows[0].proposal.canonicalId = 'replacement'; rehash(hidden.rows[0]); assertRejected(hidden, /unauthorized proposal field/);
  const social = clone(packet); rowFor(social, IDS.carbon).proposal.solution += ' 0+ owners have reported this issue.'; rehash(rowFor(social, IDS.carbon)); assertRejected(social, /social proof/);
});
test('validator rejects search links, secondary citations and commerce activation', () => {
  const changed = clone(packet); const row = changed.rows[0]; row.proposal.citations.push({ type: 'article', title: 'Search', url: 'https://example.com/search?q=part' }); row.proposal.fixParts.push({ name: 'Part', url: 'https://example.com/part' }); rehash(row); const errors = validatePacket(changed, snapshot); assert.ok(errors.some((error) => /search-style/.test(error))); assert.ok(errors.some((error) => /non-primary/.test(error))); assert.ok(errors.some((error) => /commerce-free/.test(error)));
});
test('validator rejects restoring the unsupported compressor story and fitment', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.ac); row.proposal.description += ' The compressor always fails at 40,000-80,000 miles and sends metal debris everywhere.'; row.proposal.solution += ' Buy Denso 471-5011 and Four Seasons 83602.'; rehash(row); assertRejected(changed, /A\/C evidence/);
});
test('validator rejects presenting direct injection as proof of carbon deposits', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.carbon); row.proposal.description = 'Direct injection proves every CX-3 has carbon because conventional oil volatility worsens it.'; rehash(row); assertRejected(changed, /carbon evidence/);
});
test('validator rejects the false drum-in-hat, EBD and EGR-code narrative', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.rearBrake); row.proposal.description += ' The drum-in-hat design and EBD rear brake bias cause wear on every year.'; row.proposal.dtcCodes = ['P0401']; rehash(row); assertRejected(changed, /rear-brake evidence/);
});
test('validator rejects FW fluid, 30,000-mile service and preventive flushing', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.transmission); row.proposal.solution = 'Use 0000-FW-ATF-MV every 30,000 miles and flush the transmission; replace the torque converter if shudder persists.'; rehash(row); assertRejected(changed, /transmission evidence/);
});
test('validator rejects incomplete PDF metadata or an unblocked packet', () => {
  const pdf = clone(packet); pdf.pdfSources.rearBrake.visualPages = [1]; assertRejected(pdf, /PDF evidence metadata/);
  const ready = clone(packet); ready.applicationGate.status = 'ready'; ready.rows[0].proposal.humanApproved = true; rehash(ready.rows[0]); const errors = validatePacket(ready, snapshot); assert.ok(errors.some((error) => /blocked proposal-only/.test(error))); assert.ok(errors.some((error) => /commerce-free/.test(error)));
});
