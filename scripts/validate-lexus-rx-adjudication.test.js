/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');
const { clone } = require('./lexus-adjudication-utils');
const { IDS, SNAPSHOT, buildPacket } = require('./build-lexus-rx-adjudication');
const { MARKERS, validatePacket } = require('./validate-lexus-rx-adjudication');

const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
function row(packet, id) { return packet.rows.find((item) => item.id === id); }

test('RX packet passes the complete thirteen-page safety contract', () => { assert.deepEqual(validatePacket(buildPacket(snapshot), snapshot), []); });
test('validator rejects indexed identity, fitment, related-link, severity and archive drift', () => {
  const packet = buildPacket(snapshot);
  row(packet, IDS.battery).proposal.title = 'Changed'; row(packet, IDS.oil).proposal.engines = ['Guess']; row(packet, IDS.shudder).proposal.years = [2016]; row(packet, IDS.dashboard).proposal.relatedIssueIds = []; row(packet, IDS.brakes).proposal.severity = 'critical'; row(packet, IDS.adas).proposal.status = 'archived';
  const errors = validatePacket(packet, snapshot);
  for (const pattern of [/immutable title|proposal drift/, /immutable engines/, /immutable years/, /immutable relatedIssueIds/, /severity/, /publication\/source\/severity/]) assert.ok(errors.some((error) => pattern.test(error)), String(pattern));
});
test('validator rejects guessed commerce and search links', () => {
  const packet = buildPacket(snapshot); row(packet, IDS.waterPump).proposal.fixParts = [{ oemPartNumber: 'WPT-190', url: 'https://www.amazon.com/s?k=Lexus+RX+water+pump' }]; const errors = validatePacket(packet, snapshot); assert.ok(errors.some((error) => /derived-data\/commerce/.test(error))); assert.ok(errors.some((error) => /search-style commerce/.test(error)));
});
test('validator rejects representative removed positive claims', () => {
  const packet = clone(buildPacket(snapshot));
  row(packet, IDS.battery).proposal.description += ' Multiple 2023-2025 RX owners prove DCM telematics modules are not entering sleep and causing parasitic draw.';
  row(packet, IDS.oil).proposal.solution += ' Toyota TSB 0094-14 makes piston ring replacement the definitive fix.';
  row(packet, IDS.shudder).proposal.solution += ' Perform a drain-and-fill because it resolves most cases. Repeat it every 30,000-40,000 miles.';
  row(packet, IDS.waterPump).proposal.solution += ' Replace the water pump and thermostat with WPT-190 plus the belt and tensioner.';
  const errors = validatePacket(packet, snapshot);
  for (const id of [IDS.battery, IDS.oil, IDS.shudder, IDS.waterPump]) assert.ok(errors.includes(`${id}: unsupported positive claim survived`), id);
});
test('validator rejects every missing no-commerce marker', () => {
  const packet = clone(buildPacket(snapshot)); for (const item of packet.rows) item.proposal.solution = item.proposal.solution.replace(MARKERS[item.id], 'Buy a generic replacement.'); const errors = validatePacket(packet, snapshot); for (const id of Object.values(IDS)) assert.ok(errors.includes(`${id}: explicit no-commerce marker missing`), id);
});
test('validator rejects hiding the three critical source corrections', () => {
  const packet = buildPacket(snapshot); row(packet, IDS.oil).proposal.description = 'The engine may consume oil.'; row(packet, IDS.shudder).proposal.description = 'The transmission may shudder.'; row(packet, IDS.earlyTransmission).proposal.description = 'The transmission may fail.'; const errors = validatePacket(packet, snapshot); assert.ok(errors.includes('RX oil-bulletin mismatch disclosure missing')); assert.ok(errors.includes('RX transmission remedy correction missing')); assert.ok(errors.includes('RX U151E scope disclosure missing'));
});
