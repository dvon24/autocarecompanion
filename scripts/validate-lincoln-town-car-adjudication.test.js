/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');
const { IDS, OUTPUT, SNAPSHOT } = require('./build-lincoln-town-car-adjudication');
const { diffFields, hashValue } = require('./lincoln-adjudication-utils');
const { validatePacket } = require('./validate-lincoln-town-car-adjudication');

const packet = JSON.parse(fs.readFileSync(OUTPUT, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function rowFor(copy, id) { return copy.rows.find((row) => row.id === id); }
function rehash(row) { row.proposalSha256 = hashValue(row.proposal); row.changedFields = diffFields(row.before, row.proposal); }
function assertRejected(copy, pattern) { const errors = validatePacket(copy, snapshot); assert.ok(errors.some((error) => pattern.test(error)), errors.join('\n')); }

test('Town Car packet passes the complete 9-page safety contract', () => assert.deepEqual(validatePacket(packet, snapshot), []));
test('validator rejects missing, duplicate and invented page coverage', () => {
  const missing = clone(packet); missing.rows.pop(); assert.ok(validatePacket(missing, snapshot).length);
  const duplicate = clone(packet); duplicate.rows[0] = clone(duplicate.rows[1]); assert.ok(validatePacket(duplicate, snapshot).length);
  const invented = clone(packet); invented.rows.push(clone(invented.rows[0])); invented.rows.at(-1).id = 'lincoln-town-car-invented'; assert.ok(validatePacket(invented, snapshot).length);
});
test('validator rejects identity, fitment, severity, count and status drift', () => {
  for (const [field, value] of [['title','Changed'],['years',[1900]],['trims',['Invented']],['engines',['Invented']],['category','other'],['severity','critical'],['relatedIssueIds',['other']],['reportCount',12],['status','archived']]) {
    const changed = clone(packet); const row = changed.rows[0]; row.proposal[field] = value; rehash(row);
    assert.ok(validatePacket(changed, snapshot).length, `expected ${field} mutation failure`);
  }
});
test('validator rejects hidden redirect or canonical identity fields', () => {
  const changed = clone(packet); const row = changed.rows[0]; row.proposal.canonicalId = 'replacement'; rehash(row); assertRejected(changed, /unauthorized proposal field/);
});
test('validator rejects 0+ owners and invented owner social proof', () => {
  const changed = clone(packet); const row = changed.rows[0]; row.proposal.solution += ' 0+ owners have reported this issue.'; rehash(row); assertRejected(changed, /social proof/);
});
test('validator rejects search links, secondary citations and commerce activation', () => {
  const changed = clone(packet); const row = changed.rows[0]; row.proposal.citations.push({ type: 'article', title: 'Search', url: 'https://example.com/search?q=part' }); row.proposal.fixParts.push({ name: 'Part', url: 'https://example.com/part' }); rehash(row);
  const errors = validatePacket(changed, snapshot); assert.ok(errors.some((error) => /search-style/.test(error))); assert.ok(errors.some((error) => /non-primary/.test(error))); assert.ok(errors.some((error) => /commerce-free/.test(error)));
});
test('validator rejects universal air suspension and conversion claims', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.air); row.proposal.description += ' Compressor burnout is common.'; row.proposal.solution += ' Buy Strutmasters and convert to coil springs.'; rehash(row); assertRejected(changed, /air-suspension evidence/);
});
test('validator rejects blend-door replacement-first and invented DTCs', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.blend); row.proposal.solution += ' Replacement is the only fix; install Dorman first.'; row.proposal.dtcCodes = ['B1342']; rehash(row); assertRejected(changed, /blend-door evidence/);
});
test('validator rejects universal COP replacement copy', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.coil); row.proposal.description += ' This is the most common Town Car failure.'; row.proposal.solution += ' Replace failed coils and boots plus high-mileage spark plugs.'; rehash(row); assertRejected(changed, /ignition-coil evidence/);
});
test('validator rejects current fuel-shield promises and DIY grinding', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.fuel); row.proposal.solution += ' Ford provides a free shield today; grind the tab yourself.'; rehash(row); assertRejected(changed, /fuel-tank historical-program/);
});
test('validator rejects transplanting the sister-car LCM bypass', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.lcm); row.proposal.description += ' Town Cars have the same solder defect.'; row.proposal.solution += ' Install the 15S39 bypass.'; rehash(row); assertRejected(changed, /LCM sister-recall/);
});
test('validator rejects current intake settlement claims and branded parts', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.intake); row.proposal.description += ' The settlement reimburses owners today.'; row.proposal.solution += ' Buy a Dorman manifold.'; rehash(row); assertRejected(changed, /intake-manifold evidence/);
});
test('validator rejects universal rack and window replacement claims', () => {
  const rack = clone(packet); const rackRow = rowFor(rack, IDS.rack); rackRow.proposal.description += ' Rack seals are frequent leak points.'; rackRow.proposal.solution += ' Install a remanufactured rack and flush old fluid.'; rehash(rackRow); assertRejected(rack, /power-steering evidence/);
  const window = clone(packet); const windowRow = rowFor(window, IDS.window); windowRow.proposal.description += ' Regulators fail routinely because plastic balls break.'; windowRow.proposal.solution += ' Replace the regulator assembly in one hour.'; rehash(windowRow); assertRejected(window, /power-window evidence/);
});
test('validator rejects expanding the steering recall to every indexed vehicle', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.shaft); row.proposal.description += ' All 2005-2011 Town Cars are recalled.'; rehash(row); assertRejected(changed, /steering-recall scope/);
});
test('validator rejects incomplete PDF visual-review metadata', () => {
  const changed = clone(packet); changed.pdfSources.steeringRecall.visualPages = [1]; assertRejected(changed, /PDF visual\/hash metadata incomplete/);
});
