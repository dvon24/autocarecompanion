/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');
const { IDS, OUTPUT, SNAPSHOT } = require('./build-lincoln-nautilus-adjudication');
const { hashValue } = require('./lincoln-adjudication-utils');
const { validatePacket } = require('./validate-lincoln-nautilus-adjudication');

const packet = JSON.parse(fs.readFileSync(OUTPUT, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function rowFor(copy, id) { return copy.rows.find((row) => row.id === id); }
function rehash(row) { row.proposalSha256 = hashValue(row.proposal); row.changedFields = require('./lincoln-adjudication-utils').diffFields(row.before, row.proposal); }
function assertRejected(copy, pattern) { const errors = validatePacket(copy, snapshot); assert.ok(errors.some((error) => pattern.test(error)), errors.join('\n')); }

test('Nautilus packet passes the complete 18-page safety contract', () => assert.deepEqual(validatePacket(packet, snapshot), []));
test('validator rejects missing, duplicate and invented page coverage', () => {
  const missing = clone(packet); missing.rows.pop(); assert.ok(validatePacket(missing, snapshot).length);
  const duplicate = clone(packet); duplicate.rows[0] = clone(duplicate.rows[1]); assert.ok(validatePacket(duplicate, snapshot).length);
  const invented = clone(packet); invented.rows.push(clone(invented.rows[0])); invented.rows.at(-1).id = 'lincoln-nautilus-invented'; assert.ok(validatePacket(invented, snapshot).length);
});
test('validator rejects identity, fitment, severity, relation, count and archive drift', () => {
  for (const [field, value] of [['title','Changed'],['years',[1900]],['trims',['Invented']],['engines',['Invented']],['category','other'],['severity','critical'],['relatedIssueIds',['other']],['reportCount',12],['status','archived']]) {
    const changed = clone(packet); const row = changed.rows[0]; row.proposal[field] = value; rehash(row);
    assert.ok(validatePacket(changed, snapshot).length, `expected ${field} mutation failure`);
  }
});
test('validator rejects hidden redirect or canonical identity fields', () => {
  const changed = clone(packet); const row = changed.rows[0]; row.proposal.canonicalId = 'replacement'; rehash(row);
  assertRejected(changed, /unauthorized proposal field/);
});
test('validator rejects 0+ owners and invented owner social proof', () => {
  const changed = clone(packet); const row = changed.rows[0]; row.proposal.solution += ' 0+ owners have reported this issue.'; rehash(row);
  assertRejected(changed, /social proof/);
});
test('validator rejects search links, secondary citations and commerce activation', () => {
  const changed = clone(packet); const row = changed.rows[0];
  row.proposal.citations.push({ type: 'article', title: 'Search', url: 'https://example.com/search?q=part' });
  row.proposal.fixParts.push({ name: 'Part', url: 'https://example.com/part' }); rehash(row);
  const errors = validatePacket(changed, snapshot);
  assert.ok(errors.some((error) => /search-style/.test(error)));
  assert.ok(errors.some((error) => /non-primary/.test(error)));
  assert.ok(errors.some((error) => /commerce-free/.test(error)));
});
test('validator rejects missing commerce boundaries for named parts', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.camera); row.proposal.solution = 'Buy camera K2GT-19G490-BB now.'; rehash(row);
  assertRejected(changed, /commerce boundary/);
});
test('validator rejects EGR engine, head-gasket and coolant-flush prescriptions', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.egr); row.proposal.solution = 'Replace the engine and head gasket, then perform a coolant flush. Do not buy unrelated parts; no universal retail part.'; rehash(row);
  assertRejected(changed, /EGR correction/);
});
test('validator rejects extra timing-drive work beyond four VCT units', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.vct); row.proposal.solution += ' Replace the timing chain and guides.'; rehash(row);
  assertRejected(changed, /VCT correction/);
});
test('validator rejects torque-converter, rebuild and fluid prescriptions for 8F35', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.transmission); row.proposal.solution += ' Replace the torque converter and perform a fluid service.'; rehash(row);
  assertRejected(changed, /8F35 correction/);
});
test('validator rejects invented start-stop DTCs and eliminator advice', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.startStop); row.proposal.description += ' DTC P0A7F confirms it.'; row.proposal.solution += ' A start-stop eliminator is recommended.'; rehash(row);
  assertRejected(changed, /Auto Start-Stop/);
});
test('validator rejects an inflated Nautilus block-heater count', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.blockHeater); row.proposal.description += ' All 6,781 Nautilus vehicles are affected.'; rehash(row);
  assertRejected(changed, /block-heater/);
});
test('validator rejects blanket brake-rotor replacement across indexed years', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.brakes); row.proposal.solution += ' Replace both front rotors on every 2022-2024 Nautilus.'; rehash(row);
  assertRejected(changed, /brake SSM/);
});
test('validator rejects presenting the expired injector CSP as currently free', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.injector); row.proposal.solution += ' This repair is free of charge today.'; rehash(row);
  assertRejected(changed, /injector CSP/);
});
test('validator rejects treating superseded 25SA2 as the final remedy', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.pedestrian); row.proposal.description += ' 25SA2 is the final remedy.'; rehash(row);
  assertRejected(changed, /pedestrian recall/);
});
test('validator rejects adding BlueCruise to the IPMA source', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.ipma); row.proposal.description += ' BlueCruise is also disabled.'; rehash(row);
  assertRejected(changed, /IPMA recall/);
});
test('validator rejects expanding the rear-shock remedy to automatic end-link replacement', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.shocks); row.proposal.solution += ' Replace the stabilizer-bar end link on every vehicle.'; rehash(row);
  assertRejected(changed, /rear-shock recall/);
});
test('validator rejects universal roof drain clearing', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.roof); row.proposal.solution += ' Clear every drain with compressed air.'; rehash(row);
  assertRejected(changed, /roof allegation/);
});
test('validator rejects wrong battery campaigns, poll data and replacement advice', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.battery); row.proposal.description += ' 46% of owners confirm campaign 24P14.'; row.proposal.solution += ' Replace the battery as the remedy.'; rehash(row);
  assertRejected(changed, /battery CSP/);
});
test('validator rejects liftgate motor, strut or latch replacement', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.liftgate); row.proposal.solution += ' Replace the liftgate motor, strut and latch.'; rehash(row);
  assertRejected(changed, /liftgate SSM/);
});
test('validator rejects merging the original and follow-up window recalls', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.window); row.proposal.description = 'Every vehicle is in one undifferentiated recall.'; rehash(row);
  assertRejected(changed, /window recall/);
});
test('validator rejects APIM replacement-first guidance', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.sync); row.proposal.solution += ' Replace the APIM first.'; rehash(row);
  assertRejected(changed, /SYNC software/);
});
test('validator rejects incomplete PDF visual-review metadata', () => {
  const changed = clone(packet); changed.pdfSources.egr.visualPages = [1];
  assertRejected(changed, /PDF visual\/hash metadata incomplete/);
});
