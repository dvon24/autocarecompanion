/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');
const { clone } = require('./lexus-adjudication-utils');
const { IDS, SNAPSHOT, buildPacket } = require('./build-lexus-rc-adjudication');
const { MARKERS, validatePacket } = require('./validate-lexus-rc-adjudication');

const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
function row(packet, id) { return packet.rows.find((item) => item.id === id); }

test('RC packet passes the complete five-page safety contract', () => {
  assert.deepEqual(validatePacket(buildPacket(snapshot), snapshot), []);
});

test('validator rejects indexed identity, fitment, related-link, severity and archive drift', () => {
  const packet = buildPacket(snapshot);
  row(packet, IDS.battery).proposal.title = 'Changed';
  row(packet, IDS.carbon).proposal.trims = ['Guess'];
  row(packet, IDS.infotainment).proposal.years = [2023];
  row(packet, IDS.battery).proposal.relatedIssueIds = [];
  row(packet, IDS.brakes).proposal.severity = 'critical';
  row(packet, IDS.rattle).proposal.status = 'archived';
  const errors = validatePacket(packet, snapshot);
  for (const pattern of [/immutable title|proposal drift/, /immutable trims/, /immutable years/, /immutable relatedIssueIds/, /severity/, /publication\/source\/severity/]) assert.ok(errors.some((error) => pattern.test(error)), String(pattern));
});

test('validator rejects guessed commerce and search links', () => {
  const packet = buildPacket(snapshot);
  row(packet, IDS.carbon).proposal.fixParts = [{ oemPartNumber: 'JLT-3012P', url: 'https://www.amazon.com/s?k=RC300+catch+can' }];
  const errors = validatePacket(packet, snapshot);
  assert.ok(errors.some((error) => /derived-data\/commerce/.test(error)));
  assert.ok(errors.some((error) => /search-style commerce/.test(error)));
});

test('validator rejects every removed positive claim', () => {
  const packet = clone(buildPacket(snapshot));
  row(packet, IDS.battery).proposal.description += ' Multiple owners prove the DCM is staying awake and causing parasitic draw.';
  row(packet, IDS.brakes).proposal.solution += ' Replace rotors and pads as a set and perform a proper bed-in.';
  row(packet, IDS.carbon).proposal.solution += ' Perform walnut shell blasting every 40,000-60,000 miles and install JLT-3012P.';
  row(packet, IDS.infotainment).proposal.description += ' The issue is usually software-related or USB cable sensitivity.';
  row(packet, IDS.rattle).proposal.description += ' This is a recurring owner complaint caused by the coupe body style and firm suspension tuning.';
  const errors = validatePacket(packet, snapshot);
  for (const id of Object.values(IDS)) assert.ok(errors.includes(`${id}: unsupported positive claim survived`), id);
});

test('validator rejects missing no-commerce markers', () => {
  const packet = clone(buildPacket(snapshot));
  for (const item of packet.rows) item.proposal.solution = item.proposal.solution.replace(MARKERS[item.id], 'Buy a generic replacement.');
  const errors = validatePacket(packet, snapshot);
  for (const id of Object.values(IDS)) assert.ok(errors.includes(`${id}: explicit no-commerce marker missing`), id);
});

test('validator rejects hiding either critical source correction', () => {
  const packet = buildPacket(snapshot);
  row(packet, IDS.battery).proposal.solution = 'Have the dealer update the DCM.';
  row(packet, IDS.carbon).proposal.description = 'The engine may accumulate deposits.';
  const errors = validatePacket(packet, snapshot);
  assert.ok(errors.includes('RC DCM mismatch disclosure missing'));
  assert.ok(errors.includes('RC port-injection correction missing'));
});
