/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');
const { IDS, OUTPUT, SNAPSHOT } = require('./build-lucid-gravity-adjudication');
const { diffFields, hashValue } = require('./lucid-adjudication-utils');
const { validatePacket } = require('./validate-lucid-gravity-adjudication');

const packet = JSON.parse(fs.readFileSync(OUTPUT, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function rowFor(copy, id) { return copy.rows.find((row) => row.id === id); }
function rehash(row) { row.proposalSha256 = hashValue(row.proposal); row.changedFields = diffFields(row.before, row.proposal); }
function assertRejected(copy, pattern) { const errors = validatePacket(copy, snapshot); assert.ok(errors.some((error) => pattern.test(error)), errors.join('\n')); }

test('Lucid Gravity packet passes the complete 7-page safety contract', () => assert.deepEqual(validatePacket(packet, snapshot), []));
test('validator rejects missing, duplicate and invented page coverage', () => {
  const missing = clone(packet); missing.rows.pop(); assert.ok(validatePacket(missing, snapshot).length);
  const duplicate = clone(packet); duplicate.rows[0] = clone(duplicate.rows[1]); assert.ok(validatePacket(duplicate, snapshot).length);
  const invented = clone(packet); invented.rows.push(clone(invented.rows[0])); invented.rows.at(-1).id = 'lucid-gravity-invented'; assert.ok(validatePacket(invented, snapshot).length);
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
test('validator rejects unsupported door-hardware and HVAC replacement claims', () => {
  const door = clone(packet); const doorRow = rowFor(door, IDS.doorHandles); doorRow.proposal.solution += ' Replace the actuator under the 4-year/50,000-mile warranty.'; rehash(doorRow); assertRejected(door, /door-handle evidence/);
  const hvac = clone(packet); const hvacRow = rowFor(hvac, IDS.hvac); hvacRow.proposal.description += ' Marc Winterhoff confirmed the blower-motor failure.'; rehash(hvacRow); assertRejected(hvac, /HVAC evidence/);
});
test('validator rejects recall identity and remedy drift', () => {
  const airbag = clone(packet); const airbagRow = rowFor(airbag, IDS.airbag); airbagRow.proposal.description = airbagRow.proposal.description.replace('39.4%', '90%'); rehash(airbagRow); assertRejected(airbag, /airbag recall/);
  const camera = clone(packet); const cameraRow = rowFor(camera, IDS.camera); cameraRow.proposal.solution = 'Replace the camera hardware.'; rehash(cameraRow); assertRejected(camera, /camera recall/);
  const seat = clone(packet); const seatRow = rowFor(seat, IDS.seatBelt); seatRow.proposal.solution = 'Wait for an owner letter.'; rehash(seatRow); assertRejected(seat, /seat-belt recall/);
});
test('validator rejects backdating the app fob updater or adding Mobile Key forecasts', () => { const changed = clone(packet); const row = rowFor(changed, IDS.keyFob); row.proposal.description += ' The app updater launched in October 2025 and Mobile Key arrives Q3 2026.'; rehash(row); assertRejected(changed, /key-fob chronology/); });
test('validator rejects the old navigation editorial placeholder and forum metric', () => { const changed = clone(packet); const row = rowFor(changed, IDS.navigation); row.proposal.description += ' Remove the unsupported claim about a thread exceeding 300 replies.'; rehash(row); assertRejected(changed, /navigation evidence/); });
test('validator rejects incomplete PDF visual-review metadata', () => { const changed = clone(packet); changed.pdfSources.recall25V855.visualPages = [1]; assertRejected(changed, /PDF visual\/hash metadata incomplete/); });
test('validator rejects application approval or an unblocked packet', () => { const changed = clone(packet); changed.applicationGate.status = 'ready'; changed.rows[0].proposal.humanApproved = true; rehash(changed.rows[0]); const errors = validatePacket(changed, snapshot); assert.ok(errors.some((error) => /blocked proposal-only/.test(error))); assert.ok(errors.some((error) => /commerce-free/.test(error))); });
