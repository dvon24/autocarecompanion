/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');
const { IDS, OUTPUT, SNAPSHOT } = require('./build-mazda-cx-30-adjudication');
const { diffFields, hashValue } = require('./mazda-adjudication-utils');
const { validatePacket } = require('./validate-mazda-cx-30-adjudication');

const packet = JSON.parse(fs.readFileSync(OUTPUT, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function rowFor(copy, id) { return copy.rows.find((row) => row.id === id); }
function rehash(row) { row.proposalSha256 = hashValue(row.proposal); row.changedFields = diffFields(row.before, row.proposal); }
function assertRejected(copy, pattern) { const errors = validatePacket(copy, snapshot); assert.ok(errors.some((error) => pattern.test(error)), errors.join('\n')); }

test('Mazda CX-30 packet passes the complete 9-page safety contract', () => assert.deepEqual(validatePacket(packet, snapshot), []));
test('validator rejects missing, duplicate and invented page coverage', () => {
  const missing = clone(packet); missing.rows.pop(); assert.ok(validatePacket(missing, snapshot).length);
  const duplicate = clone(packet); duplicate.rows[0] = clone(duplicate.rows[1]); assert.ok(validatePacket(duplicate, snapshot).length);
  const invented = clone(packet); invented.rows.push(clone(invented.rows[0])); invented.rows.at(-1).id = 'mazda-cx30-invented'; assert.ok(validatePacket(invented, snapshot).length);
});
test('validator rejects identity, fitment, severity, count and status drift', () => {
  for (const [field, value] of [['title', 'Changed'], ['years', [1900]], ['trims', ['Invented']], ['engines', ['Invented']], ['category', 'other'], ['severity', 'critical'], ['relatedIssueIds', ['other']], ['reportCount', 12], ['status', 'archived']]) {
    const changed = clone(packet); const row = changed.rows[0]; row.proposal[field] = value; rehash(row); assert.ok(validatePacket(changed, snapshot).length, `expected ${field} mutation failure`);
  }
});
test('validator preserves every frozen report count while forbidding owner marketing copy', () => {
  const expected = new Map([[IDS.ac, 650], [IDS.infotainment, 1800], [IDS.windshield, 1400], [IDS.abs, 0], [IDS.aeb, 0], [IDS.evap, 0], [IDS.liftgate, 0], [IDS.oil, 0], [IDS.valvetrain, 0]]);
  for (const [id, count] of expected) { const row = rowFor(packet, id); assert.equal(row.before.reportCount, count); assert.equal(row.proposal.reportCount, count); assert.doesNotMatch(`${row.proposal.description} ${row.proposal.solution}`, /owners? have reported|\d+\+ owners?/i); }
});
test('validator rejects hidden redirects and 0+ owner social proof', () => {
  const hidden = clone(packet); hidden.rows[0].proposal.canonicalId = 'replacement'; rehash(hidden.rows[0]); assertRejected(hidden, /unauthorized proposal field/);
  const social = clone(packet); rowFor(social, IDS.abs).proposal.solution += ' 0+ owners have reported this issue.'; rehash(rowFor(social, IDS.abs)); assertRejected(social, /social proof/);
});
test('validator rejects search links, secondary citations and commerce activation', () => {
  const changed = clone(packet); const row = changed.rows[0]; row.proposal.citations.push({ type: 'article', title: 'Search', url: 'https://example.com/search?q=part' }); row.proposal.fixParts.push({ name: 'Part', url: 'https://example.com/part' }); rehash(row); const errors = validatePacket(changed, snapshot); assert.ok(errors.some((error) => /search-style/.test(error))); assert.ok(errors.some((error) => /non-primary/.test(error))); assert.ok(errors.some((error) => /commerce-free/.test(error)));
});
test('validator rejects restoring unsupported HLA and cylinder-head replacement', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.valvetrain); row.proposal.solution = 'Replace the switchable HLAs and revised service cylinder head automatically.'; rehash(row); assertRejected(changed, /valvetrain source/);
});
test('validator rejects conflating unintended SBS operation with the 2024 camera recall', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.aeb); row.proposal.description = 'Recall 24V649000 proves every false-braking event.'; row.proposal.solution = 'Disable the SBS system.'; rehash(row); assertRejected(changed, /AEB mechanism/);
});
test('validator rejects the unsupported condenser, universal refrigerant and EGR-code story', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.ac); row.proposal.description = 'Road debris makes every condenser leak.'; row.proposal.solution = 'Buy Denso 477-0878, add R-134a and install a stone guard or grille screen.'; row.proposal.dtcCodes = ['P0401']; rehash(row); assertRejected(changed, /A\/C evidence/);
});
test('validator rejects universal CMU replacement and cable recommendations', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.infotainment); row.proposal.solution = 'Replace the CMU and buy an Anker Powerline cable.'; rehash(row); assertRejected(changed, /infotainment scope/);
});
test('validator rejects presenting unsupported windshield cracking causes as proven', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.windshield); row.proposal.description = 'Acoustic laminated glass is susceptible to thermal shock and frame flex.'; row.proposal.solution += ' Calibration costs $200-$400.'; rehash(row); assertRejected(changed, /windshield evidence/);
});
test('validator rejects incomplete PDF review metadata or an unblocked packet', () => {
  const pdf = clone(packet); pdf.pdfSources.sbs.visualPages = [1]; assertRejected(pdf, /PDF evidence metadata/);
  const ready = clone(packet); ready.applicationGate.status = 'ready'; ready.rows[0].proposal.humanApproved = true; rehash(ready.rows[0]); const errors = validatePacket(ready, snapshot); assert.ok(errors.some((error) => /blocked proposal-only/.test(error))); assert.ok(errors.some((error) => /commerce-free/.test(error)));
});
