/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');
const { clone } = require('./lexus-adjudication-utils');
const { IDS, SNAPSHOT, buildPacket } = require('./build-lexus-nx-adjudication');
const { MARKERS, validatePacket } = require('./validate-lexus-nx-adjudication');

const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
function row(packet, id) { return packet.rows.find((item) => item.id === id); }

test('NX packet passes the complete two-page safety contract', () => {
  assert.deepEqual(validatePacket(buildPacket(snapshot), snapshot), []);
});

test('validator rejects indexed identity, fitment, related-link, severity and archive drift', () => {
  const packet = buildPacket(snapshot);
  row(packet, IDS.cvt).proposal.title = 'Changed';
  row(packet, IDS.cvt).proposal.trims = ['Guess'];
  row(packet, IDS.infotainment).proposal.years = [2020];
  row(packet, IDS.infotainment).proposal.relatedIssueIds = [];
  row(packet, IDS.cvt).proposal.severity = 'critical';
  row(packet, IDS.infotainment).proposal.status = 'archived';
  const errors = validatePacket(packet, snapshot);
  for (const pattern of [/immutable title|proposal drift/, /immutable trims/, /immutable years/, /immutable relatedIssueIds/, /severity/, /publication\/source\/severity/]) {
    assert.ok(errors.some((error) => pattern.test(error)), String(pattern));
  }
});

test('validator rejects guessed parts and search links', () => {
  const packet = buildPacket(snapshot);
  row(packet, IDS.cvt).proposal.fixParts = [{ oemPartNumber: 'GUESS', url: 'https://www.amazon.com/s?k=nx+cvt' }];
  const errors = validatePacket(packet, snapshot);
  assert.ok(errors.some((error) => /derived-data\/commerce/.test(error)));
  assert.ok(errors.some((error) => /search-style commerce/.test(error)));
});

test('validator rejects the removed software, Sport-mode and usability claims', () => {
  const packet = clone(buildPacket(snapshot));
  row(packet, IDS.cvt).proposal.solution += ' A software update improves the shift simulation, and Sport mode eliminates the drone.';
  row(packet, IDS.infotainment).proposal.description += ' The system suffers from significant lag and poor usability.';
  const errors = validatePacket(packet, snapshot);
  assert.ok(errors.includes(`${IDS.cvt}: unsupported positive claim survived`));
  assert.ok(errors.includes(`${IDS.infotainment}: unsupported positive claim survived`));
});

test('validator rejects missing no-commerce markers', () => {
  const packet = clone(buildPacket(snapshot));
  for (const item of packet.rows) item.proposal.solution = item.proposal.solution.replace(MARKERS[item.id], 'Buy a generic replacement.');
  const errors = validatePacket(packet, snapshot);
  for (const id of Object.values(IDS)) assert.ok(errors.includes(`${id}: explicit no-commerce marker missing`), id);
});

test('validator rejects hiding the NX250 versus NX350h transmission mismatch', () => {
  const packet = buildPacket(snapshot);
  row(packet, IDS.cvt).proposal.description = 'Some NX vehicles may make noise during acceleration.';
  const errors = validatePacket(packet, snapshot);
  assert.ok(errors.includes('NX transmission mismatch disclosure missing'));
});
