/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');
const { clone } = require('./lexus-adjudication-utils');
const { IDS, SNAPSHOT, buildPacket } = require('./build-lexus-lx-adjudication');
const { MARKERS, validatePacket } = require('./validate-lexus-lx-adjudication');

const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
function row(packet, id) { return packet.rows.find((item) => item.id === id); }

test('LX packet passes the complete seven-page safety contract', () => {
  assert.deepEqual(validatePacket(buildPacket(snapshot), snapshot), []);
});

test('validator rejects indexed identity, year, trim, severity and archive drift', () => {
  const packet = buildPacket(snapshot);
  row(packet, IDS.infotainment).proposal.title = 'Changed';
  row(packet, IDS.ahc).proposal.trims = ['Guess'];
  row(packet, IDS.brakes).proposal.years = [2022];
  row(packet, IDS.engine).proposal.severity = 'critical';
  row(packet, IDS.tailgate).proposal.status = 'archived';
  const errors = validatePacket(packet, snapshot);
  assert.ok(errors.some((error) => /immutable title|proposal drift/.test(error)));
  assert.ok(errors.some((error) => /immutable trims/.test(error)));
  assert.ok(errors.some((error) => /immutable years/.test(error)));
  assert.ok(errors.some((error) => /severity/.test(error)));
  assert.ok(errors.some((error) => /publication\/source\/severity/.test(error)));
});

test('validator rejects guessed commerce and search links', () => {
  const packet = buildPacket(snapshot);
  row(packet, IDS.centerDiff).proposal.fixParts = [{ oemPartNumber: 'GUESS', url: 'https://www.amazon.com/s?k=lx570+actuator' }];
  const errors = validatePacket(packet, snapshot);
  assert.ok(errors.some((error) => /derived-data\/commerce/.test(error)));
  assert.ok(errors.some((error) => /search-style commerce/.test(error)));
});

test('validator rejects each removed claim when it is reintroduced positively', () => {
  const packet = clone(buildPacket(snapshot));
  row(packet, IDS.infotainment).proposal.solution += ' Dealers typically replace the head unit for 2024-2025 vehicles.';
  row(packet, IDS.ahc).proposal.solution += ' A complete AHC overhaul costs $3,000-$6,000.';
  row(packet, IDS.brakes).proposal.solution += ' Install upgraded pads and higher-quality replacement rotors.';
  row(packet, IDS.centerDiff).proposal.solution += ' Replace the center differential lock actuator motor assembly.';
  row(packet, IDS.occupant).proposal.description += ' Multiple owners report persistent SRS warnings and repeated dealer visits.';
  row(packet, IDS.tailgate).proposal.solution += ' Replace the latch assembly or powered support components.';
  row(packet, IDS.engine).proposal.solution += ' Perform oil filter inspection and install a short-block.';
  const errors = validatePacket(packet, snapshot);
  for (const id of Object.values(IDS)) assert.ok(errors.includes(`${id}: unsupported positive claim survived`), id);
});

test('validator rejects missing no-commerce markers', () => {
  const packet = clone(buildPacket(snapshot));
  for (const item of packet.rows) item.proposal.solution = item.proposal.solution.replace(MARKERS[item.id], 'Buy a generic replacement.');
  const errors = validatePacket(packet, snapshot);
  for (const id of Object.values(IDS)) assert.ok(errors.includes(`${id}: explicit no-commerce marker missing`), id);
});

test('validator rejects conflating head-unit and rear-camera conditions', () => {
  const packet = buildPacket(snapshot);
  row(packet, IDS.infotainment).proposal.description += ' The 2024-2025 head-unit bulletin proves the backup-camera problem.';
  const errors = validatePacket(packet, snapshot);
  assert.ok(errors.includes(`${IDS.infotainment}: unsupported positive claim survived`));
});
