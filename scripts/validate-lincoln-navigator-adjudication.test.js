/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');
const { IDS, OUTPUT, SNAPSHOT } = require('./build-lincoln-navigator-adjudication');
const { diffFields, hashValue } = require('./lincoln-adjudication-utils');
const { validatePacket } = require('./validate-lincoln-navigator-adjudication');

const packet = JSON.parse(fs.readFileSync(OUTPUT, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function rowFor(copy, id) { return copy.rows.find((row) => row.id === id); }
function rehash(row) { row.proposalSha256 = hashValue(row.proposal); row.changedFields = diffFields(row.before, row.proposal); }
function assertRejected(copy, pattern) { const errors = validatePacket(copy, snapshot); assert.ok(errors.some((error) => pattern.test(error)), errors.join('\n')); }

test('Navigator packet passes the complete 16-page safety contract', () => assert.deepEqual(validatePacket(packet, snapshot), []));
test('validator rejects missing, duplicate and invented page coverage', () => {
  const missing = clone(packet); missing.rows.pop(); assert.ok(validatePacket(missing, snapshot).length);
  const duplicate = clone(packet); duplicate.rows[0] = clone(duplicate.rows[1]); assert.ok(validatePacket(duplicate, snapshot).length);
  const invented = clone(packet); invented.rows.push(clone(invented.rows[0])); invented.rows.at(-1).id = 'lincoln-navigator-invented'; assert.ok(validatePacket(invented, snapshot).length);
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
test('validator rejects torque-converter and fluid-only 10R80 prescriptions', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.tenR80Torque); row.proposal.solution += ' Replace the torque converter and a fluid change fixes it.'; rehash(row); assertRejected(changed, /10R80 correction/);
});
test('validator rejects extra cam-phaser timing parts and current coverage promises', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.camCsp); row.proposal.solution += ' Replace the timing chain and guides; this is free of charge today.'; rehash(row); assertRejected(changed, /cam-phaser correction/);
});
test('validator rejects treating VCT codes as proof of timing-chain stretch', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.timingChain); row.proposal.description += ' These codes confirm timing-chain stretch.'; row.proposal.solution += ' Replace the timing chain and water pump.'; rehash(row); assertRejected(changed, /timing-chain evidence/);
});
test('validator rejects unsafe warm-engine and improvised spark-plug advice', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.sparkTwoPiece); row.proposal.solution += ' Use PB Blaster and service the engine while warm.'; rehash(row); assertRejected(changed, /spark-plug safety/);
});
test('validator rejects universal air-suspension mechanisms and brands', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.airCompressor); row.proposal.description += ' All Navigator air bags fail at the crimp after 8-12 years.'; row.proposal.solution += ' Buy Arnott bags.'; rehash(row); assertRejected(changed, /air-suspension evidence/);
});
test('validator rejects expanding the brake recall to every indexed vehicle', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.brakes); row.proposal.description += ' All 2017-2018 Navigators are recalled.'; rehash(row); assertRejected(changed, /brake recall/);
});
test('validator rejects universal running-board motor and lubricant advice', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.runningMotor); row.proposal.solution += ' Replace the running-board motor and use white lithium grease.'; rehash(row); assertRejected(changed, /running-board evidence/);
});
test('validator rejects automatic HVAC actuator replacement', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.hvac); row.proposal.solution += ' Replace the blend-door actuator first.'; rehash(row); assertRejected(changed, /HVAC unsupported-causation/);
});
test('validator rejects converting the liftgate allegation into a proven hardware cause', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.liftgate); row.proposal.description += ' The kick sensor is the cause.'; row.proposal.solution += ' Replace the latch and motor.'; rehash(row); assertRejected(changed, /liftgate evidence separation/);
});
test('validator rejects APIM replacement-first and class-action SYNC copy', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.sync); row.proposal.solution += ' Replace the APIM first and join the class action.'; rehash(row); assertRejected(changed, /SYNC evidence/);
});
test('validator rejects incomplete PDF visual-review metadata', () => {
  const changed = clone(packet); changed.pdfSources.cam.visualPages = [1]; assertRejected(changed, /PDF visual\/hash metadata incomplete/);
});
