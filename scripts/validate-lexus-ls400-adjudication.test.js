/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');
const { clone } = require('./lexus-adjudication-utils');
const { IDS, SNAPSHOT, buildPacket } = require('./build-lexus-ls400-adjudication');
const { MARKERS, validatePacket } = require('./validate-lexus-ls400-adjudication');

const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
function row(packet, id) { return packet.rows.find((item) => item.id === id); }

test('LS400 packet passes the complete six-page safety contract', () => {
  assert.deepEqual(validatePacket(buildPacket(snapshot), snapshot), []);
});

test('validator rejects indexed identity, engine, severity and archive drift', () => {
  const packet = buildPacket(snapshot);
  row(packet, IDS.ecu).proposal.title = 'Changed';
  row(packet, IDS.ballJoint).proposal.engines = ['Guess'];
  row(packet, IDS.timing).proposal.severity = 'critical';
  row(packet, IDS.starter).proposal.status = 'archived';
  const errors = validatePacket(packet, snapshot);
  assert.ok(errors.some((error) => /immutable title|proposal drift/.test(error)));
  assert.ok(errors.some((error) => /immutable engines/.test(error)));
  assert.ok(errors.some((error) => /severity/.test(error)));
  assert.ok(errors.some((error) => /publication\/source\/severity/.test(error)));
});

test('validator rejects guessed commerce and search links', () => {
  const packet = buildPacket(snapshot);
  row(packet, IDS.starter).proposal.fixParts = [{ oemPartNumber: 'GUESS', url: 'https://www.amazon.com/s?k=ls400+starter' }];
  const errors = validatePacket(packet, snapshot);
  assert.ok(errors.some((error) => /derived-data\/commerce/.test(error)));
  assert.ok(errors.some((error) => /search-style commerce/.test(error)));
});

test('validator rejects each removed claim when it is reintroduced positively', () => {
  const packet = clone(buildPacket(snapshot));
  row(packet, IDS.ecu).proposal.solution += ' Recap the ECU with Rubycon capacitors and baking soda.';
  row(packet, IDS.ballJoint).proposal.solution += ' Replace the lower ball joints in pairs with Moog parts every 15,000 miles.';
  row(packet, IDS.oilLeak).proposal.solution += ' Replace all three seals and bundle the repair with timing service.';
  row(packet, IDS.starter).proposal.solution += ' Replace the heater control valve and install a Denso starter.';
  row(packet, IDS.timing).proposal.solution += ' Replace the whole kit every 90,000 miles with Aisin parts.';
  row(packet, IDS.powerSteering).proposal.solution += ' Replace the alternator with a Denso reman unit.';
  const errors = validatePacket(packet, snapshot);
  for (const id of Object.values(IDS)) assert.ok(errors.includes(`${id}: unsupported positive claim survived`), id);
});

test('validator rejects missing no-commerce markers', () => {
  const packet = clone(buildPacket(snapshot));
  for (const item of packet.rows) item.proposal.solution = item.proposal.solution.replace(MARKERS[item.id], 'Buy a generic replacement.');
  const errors = validatePacket(packet, snapshot);
  for (const id of Object.values(IDS)) assert.ok(errors.includes(`${id}: explicit no-commerce marker missing`), id);
});

test('validator rejects complaints evidence outside its exact supported row', () => {
  const packet = buildPacket(snapshot);
  row(packet, IDS.ecu).proposal.citations.push({ type: 'nhtsa', title: 'Complaints', url: packet.complaintInventory.source });
  const errors = validatePacket(packet, snapshot);
  assert.ok(errors.some((error) => /complaints citation leaked|citation boundary|proposal drift/.test(error)));
});
