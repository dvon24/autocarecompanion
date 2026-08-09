/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');
const { IDS, OUTPUT, SNAPSHOT } = require('./build-lincoln-mkz-adjudication');
const { hashValue } = require('./lincoln-adjudication-utils');
const { validatePacket } = require('./validate-lincoln-mkz-adjudication');

const packet = JSON.parse(fs.readFileSync(OUTPUT, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function rowFor(copy, id) { return copy.rows.find((row) => row.id === id); }
function rehash(row) { row.proposalSha256 = hashValue(row.proposal); }

test('MKZ packet passes the complete ten-page safety contract', () => assert.deepEqual(validatePacket(packet, snapshot), []));
test('validator rejects missing and duplicate frozen-page coverage', () => {
  const missing = clone(packet); missing.rows.pop(); assert.ok(validatePacket(missing, snapshot).length);
  const duplicate = clone(packet); duplicate.rows[0] = clone(duplicate.rows[1]); assert.ok(validatePacket(duplicate, snapshot).length);
});
test('validator rejects identity, fitment, severity, relation, count and archive drift', () => {
  for (const [field, value] of [['title','Changed'],['years',[1900]],['trims',['Invented']],['engines',['Invented']],['category','other'],['severity','critical'],['relatedIssueIds',['other']],['reportCount',12],['status','archived']]) {
    const changed = clone(packet); const row = changed.rows[0]; row.proposal[field] = value; rehash(row);
    assert.ok(validatePacket(changed, snapshot).length, `expected ${field} mutation failure`);
  }
});
test('validator rejects broad coolant years and unverified class-action or cheap-repair advice', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.coolant); row.proposal.description = 'Every 2013-2020 MKZ has the defect and class-action reimbursement.'; row.proposal.solution = 'Use a head-gasket-only repair for $5,000.'; rehash(row);
  assert.ok(validatePacket(changed, snapshot).some((error) => /coolant|commerce/.test(error)));
});
test('validator rejects universal water-pump mileage, price and proactive replacement', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.waterPump); row.proposal.solution = 'Replace proactively at 100,000 miles for $3,500.'; rehash(row);
  assert.ok(validatePacket(changed, snapshot).some((error) => /water-pump|commerce/.test(error)));
});
test('validator rejects merging the two door-latch recall populations', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.doorLatch); row.proposal.description = 'All 2013-2018 MKZ vehicles are recalled under one campaign.'; rehash(row);
  assert.ok(validatePacket(changed, snapshot).some((error) => /door-latch/.test(error)));
});
test('validator rejects deleting regional scope or claiming total loss of steering control', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.steering); row.proposal.description = 'Every MKZ loses all steering control when the bolts fail.'; rehash(row);
  assert.ok(validatePacket(changed, snapshot).some((error) => /steering/.test(error)));
});
test('validator rejects separator-plate, check-ball and fluid-service transmission lore', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.transmission); row.proposal.solution = 'Modify the valve body separator plate, remove the affected check ball, and use a fluid service.'; rehash(row);
  assert.ok(validatePacket(changed, snapshot).some((error) => /transmission|commerce/.test(error)));
});
test('validator rejects invented hybrid-steering DTCs and universal gear replacement', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.hybridSteering); row.proposal.dtcCodes = ['C2007']; row.proposal.solution = 'Replace every steering gear.'; rehash(row);
  assert.ok(validatePacket(changed, snapshot).some((error) => /hybrid|commerce/.test(error)));
});
test('validator rejects broad APIM years, class-action assertions and replacement-first advice', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.apim); row.proposal.description = 'All 2013-2016 cars received a 5 years regardless warranty because of a class-action settlement.'; row.proposal.solution = 'Replace the APIM without diagnosis.'; rehash(row);
  assert.ok(validatePacket(changed, snapshot).some((error) => /APIM|commerce/.test(error)));
});
test('validator rejects roof-design causation, universal drain cleaning and lawsuit coverage', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.roof); row.proposal.description = 'The glass was too thin and the lawsuit proved the defect.'; row.proposal.solution = 'Clear and flush every drain and replace worn seals.'; rehash(row);
  assert.ok(validatePacket(changed, snapshot).some((error) => /roof|commerce/.test(error)));
});
test('validator rejects conflating premature wear with the HCU recall', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.brakes); row.proposal.solution = 'Install quality pads and rotors for premature pad wear.'; rehash(row);
  assert.ok(validatePacket(changed, snapshot).some((error) => /brake|commerce/.test(error)));
});
test('validator rejects automatic Do Not Drive status for every 21V158 vehicle', () => {
  const changed = clone(packet); const row = rowFor(changed, IDS.airbag); row.proposal.description = 'Every 21V158 vehicle is automatically Do Not Drive.'; rehash(row);
  assert.ok(validatePacket(changed, snapshot).some((error) => /airbag/.test(error)));
});
test('validator rejects fake owner social proof, search commerce and non-primary citations', () => {
  const changed = clone(packet); const row = changed.rows[0]; row.proposal.reportCount = 99; row.proposal.solution += ' 99+ owners have reported this.'; row.proposal.citations.push({ type: 'article', title: 'Search', url: 'https://example.com/search?q=part' }); rehash(row);
  const errors = validatePacket(changed, snapshot);
  assert.ok(errors.some((error) => error.includes('social proof')));
  assert.ok(errors.some((error) => error.includes('search-style')));
  assert.ok(errors.some((error) => error.includes('non-primary')));
});
