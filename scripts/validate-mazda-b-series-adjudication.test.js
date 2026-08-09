/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');
const { IDS, OUTPUT, SNAPSHOT } = require('./build-mazda-b-series-adjudication');
const { diffFields, hashValue } = require('./mazda-adjudication-utils');
const { validatePacket } = require('./validate-mazda-b-series-adjudication');

const packet = JSON.parse(fs.readFileSync(OUTPUT, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function rowFor(copy, id) { return copy.rows.find((row) => row.id === id); }
function rehash(row) { row.proposalSha256 = hashValue(row.proposal); row.changedFields = diffFields(row.before, row.proposal); }
function assertRejected(copy, pattern) { const errors = validatePacket(copy, snapshot); assert.ok(errors.some((error) => pattern.test(error)), errors.join('\n')); }

test('Mazda B-Series packet passes the complete 5-page safety contract', () => assert.deepEqual(validatePacket(packet, snapshot), []));
test('validator rejects missing, duplicate and invented page coverage', () => {
  const missing = clone(packet); missing.rows.pop(); assert.ok(validatePacket(missing, snapshot).length);
  const duplicate = clone(packet); duplicate.rows[0] = clone(duplicate.rows[1]); assert.ok(validatePacket(duplicate, snapshot).length);
  const invented = clone(packet); invented.rows.push(clone(invented.rows[0])); invented.rows.at(-1).id = 'mazda-b-series-invented'; assert.ok(validatePacket(invented, snapshot).length);
});
test('validator rejects identity, fitment, severity, count and status drift', () => {
  for (const [field, value] of [['title', 'Changed'], ['years', [1900]], ['trims', ['Invented']], ['engines', ['Invented']], ['category', 'other'], ['severity', 'critical'], ['relatedIssueIds', ['other']], ['reportCount', 12], ['status', 'archived']]) {
    const changed = clone(packet); const row = changed.rows[0]; row.proposal[field] = value; rehash(row); assert.ok(validatePacket(changed, snapshot).length, `expected ${field} mutation failure`);
  }
});
test('validator preserves nonzero report counts without owner social proof', () => {
  const expected = new Map([[IDS.ballJoint, 170], [IDS.leafSpring, 130], [IDS.timingChain, 220]]);
  for (const [id, count] of expected) { const row = rowFor(packet, id); assert.equal(row.before.reportCount, count); assert.equal(row.proposal.reportCount, count); assert.doesNotMatch(`${row.proposal.description} ${row.proposal.solution}`, /owners? have reported|\d+\+ owners?/i); }
});
test('validator rejects hidden redirect fields and owner-count marketing copy', () => {
  const hidden = clone(packet); hidden.rows[0].proposal.canonicalId = 'replacement'; rehash(hidden.rows[0]); assertRejected(hidden, /unauthorized proposal field/);
  const social = clone(packet); social.rows[0].proposal.solution += ' 170+ owners have reported this issue.'; rehash(social.rows[0]); assertRejected(social, /social proof/);
});
test('validator rejects search links, secondary citations and commerce activation', () => {
  const changed = clone(packet); const row = changed.rows[0]; row.proposal.citations.push({ type: 'article', title: 'Search', url: 'https://example.com/search?q=part' }); row.proposal.fixParts.push({ name: 'Part', url: 'https://example.com/part' }); rehash(row); const errors = validatePacket(changed, snapshot); assert.ok(errors.some((error) => /search-style/.test(error))); assert.ok(errors.some((error) => /non-primary/.test(error))); assert.ok(errors.some((error) => /commerce-free/.test(error)));
});
test('validator rejects restoring universal ball-joint or frame-repair claims', () => {
  const ball = clone(packet); const ballRow = rowFor(ball, IDS.ballJoint); ballRow.proposal.solution += ' Replace upper and lower ball joints with Moog K80026.'; rehash(ballRow); assertRejected(ball, /ball-joint evidence/);
  const frame = clone(packet); const frameRow = rowFor(frame, IDS.frameRust); frameRow.proposal.description += ' Every truck fails within 10-15 years because the C-channel traps water.'; rehash(frameRow); assertRejected(frame, /frame-rust evidence/);
});
test('validator rejects importing B4000 evidence into the 3.0L head-gasket page', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.headGasket); row.proposal.description = 'B4000 complaints prove every 3.0L head gasket fails between 80,000-130,000 miles.'; rehash(row); assertRejected(changed, /head-gasket evidence/);
});
test('validator rejects treating corroded hangers as proof of leaf-pack sag', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.leafSpring); row.proposal.solution += ' Ranger leaf springs are interchangeable; add helper springs for regular hauling.'; rehash(row); assertRejected(changed, /leaf-spring evidence/);
});
test('validator rejects applying a generic Ranger timing kit to both V6 engines', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.timingChain); row.proposal.description += ' The same plastic-guide failure affects both engines because this is the same issue as Ford Ranger.'; rehash(row); assertRejected(changed, /timing-chain evidence/);
});
test('validator rejects invented PDF evidence or an unblocked packet', () => {
  const pdf = clone(packet); pdf.pdfSources.invented = { url: 'https://static.nhtsa.gov/fake.pdf' }; assertRejected(pdf, /must not invent PDF evidence/);
  const ready = clone(packet); ready.applicationGate.status = 'ready'; ready.rows[0].proposal.humanApproved = true; rehash(ready.rows[0]); const errors = validatePacket(ready, snapshot); assert.ok(errors.some((error) => /blocked proposal-only/.test(error))); assert.ok(errors.some((error) => /commerce-free/.test(error)));
});
