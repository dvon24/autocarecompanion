/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');
const { IDS, OUTPUT, SNAPSHOT } = require('./build-lincoln-mkx-adjudication');
const { hashValue } = require('./lincoln-adjudication-utils');
const { validatePacket } = require('./validate-lincoln-mkx-adjudication');

const packet = JSON.parse(fs.readFileSync(OUTPUT, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function rehash(row) { row.proposalSha256 = hashValue(row.proposal); }

test('MKX packet passes the complete nine-page safety contract', () => assert.deepEqual(validatePacket(packet, snapshot), []));
test('validator rejects missing, duplicate and unknown page coverage', () => {
  const missing = clone(packet); missing.rows.pop(); assert.ok(validatePacket(missing, snapshot).length);
  const duplicate = clone(packet); duplicate.rows[0] = clone(duplicate.rows[1]); assert.ok(validatePacket(duplicate, snapshot).length);
});
test('validator rejects identity, fitment, severity, relation and archive drift', () => {
  for (const [field, value] of [['title', 'Changed title'], ['years', [1900]], ['trims', ['UNSUPPORTED']], ['engines', ['UNSUPPORTED']], ['severity', 'critical'], ['relatedIssueIds', ['other']], ['status', 'archived']]) {
    const changed = clone(packet); const row = changed.rows[0]; row.proposal[field] = value; rehash(row);
    assert.ok(validatePacket(changed, snapshot).some((error) => error.includes(field) || error.includes('severity') || error.includes('archived')));
  }
});
test('validator rejects oil build-date drift and unsupported spark-plug prescription', () => {
  const changed = clone(packet); const row = changed.rows.find((item) => item.id === IDS.oil);
  row.proposal.description = 'All 2016-2017 engines fail.'; row.proposal.solution = 'Typically replace spark plugs for $8,000.'; rehash(row);
  assert.ok(validatePacket(changed, snapshot).some((error) => error.includes('oil') || error.includes('boundary')));
});
test('validator rejects universal water-pump mileage, cost and timing-set advice', () => {
  const changed = clone(packet); const row = changed.rows.find((item) => item.id === IDS.water37);
  row.proposal.solution = 'At 100,000 miles replace timing chain set proactively for $2,500.'; rehash(row);
  assert.ok(validatePacket(changed, snapshot).some((error) => error.includes('water-pump') || error.includes('boundary')));
});
test('validator rejects converting the qualified battery-fire chronology into causation', () => {
  const changed = clone(packet); const row = changed.rows.find((item) => item.id === IDS.battery);
  row.proposal.description = 'The cable caused three fires in every affected MKX.'; rehash(row);
  assert.ok(validatePacket(changed, snapshot).some((error) => error.includes('battery')));
});
test('validator rejects blanket APIM replacement and battery-disconnect advice', () => {
  const changed = clone(packet); const row = changed.rows.find((item) => item.id === IDS.sync);
  row.proposal.solution = 'Disconnecting the battery restores it; replace the APIM every time.'; rehash(row);
  assert.ok(validatePacket(changed, snapshot).some((error) => error.includes('SYNC') || error.includes('boundary')));
});
test('validator rejects roof glass-design and class-action assertions', () => {
  const changed = clone(packet); const row = changed.rows.find((item) => item.id === IDS.roof);
  row.proposal.description = 'Ford used thinner ceramic-tempered glass in every MKX.'; row.proposal.solution = 'Seek class-action coverage where applicable.'; rehash(row);
  assert.ok(validatePacket(changed, snapshot).some((error) => error.includes('roof')));
});
test('validator rejects universal PTU fluid interval and stale brake remedy', () => {
  const ptuPacket = clone(packet); const ptu = ptuPacket.rows.find((item) => item.id === IDS.ptu); ptu.proposal.solution = 'Change fluid every 30,000 miles before the unit seizes and damages the transmission.'; rehash(ptu); assert.ok(validatePacket(ptuPacket, snapshot).some((error) => error.includes('PTU') || error.includes('boundary')));
  const brakePacket = clone(packet); const brake = brakePacket.rows.find((item) => item.id === IDS.brake); brake.proposal.solution = 'Wait until the remedy is available in 2026.'; rehash(brake); assert.ok(validatePacket(brakePacket, snapshot).some((error) => error.includes('brake')));
});
test('validator rejects applying Do Not Drive to every 21V158 or 21V081 vehicle', () => {
  const changed = clone(packet); const row = changed.rows.find((item) => item.id === IDS.airbag);
  row.proposal.description = 'Every vehicle in 21V158 and 21V081 is automatically Do Not Drive.'; rehash(row);
  assert.ok(validatePacket(changed, snapshot).some((error) => error.includes('airbag')));
});
test('validator rejects fake owner social proof, search commerce and non-primary citations', () => {
  const changed = clone(packet); const row = changed.rows[0]; row.proposal.reportCount = 99; row.proposal.solution += ' 99+ owners have reported this.'; row.proposal.citations.push({ type: 'article', title: 'Search', url: 'https://example.com/search?q=part' }); rehash(row);
  const errors = validatePacket(changed, snapshot);
  assert.ok(errors.some((error) => error.includes('social proof')));
  assert.ok(errors.some((error) => error.includes('search-style')));
  assert.ok(errors.some((error) => error.includes('non-primary')));
});
