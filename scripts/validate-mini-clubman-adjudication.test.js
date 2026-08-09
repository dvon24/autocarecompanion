/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { IDS, OUTPUT, SNAPSHOT } = require('./build-mini-clubman-adjudication');
const { diffFields, hashValue } = require('./known-issue-adjudication-utils');
const { validatePacket } = require('./validate-mini-clubman-adjudication');

const frozen = JSON.parse(fs.readFileSync(OUTPUT, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function item(packet, id = IDS.clutch) { return packet.rows.find((row) => row.id === id); }
function rehash(row) { row.proposalSha256 = hashValue(row.proposal); row.changedFields = diffFields(row.before, row.proposal); }
function rejects(name, mutate, pattern = /deterministic/) {
  test(name, () => { const packet = clone(frozen); mutate(packet); assert.match(validatePacket(packet, snapshot).join('\n'), pattern); });
}

test('frozen Clubman packet passes', () => assert.deepEqual(validatePacket(clone(frozen), snapshot), []));
rejects('rejects title change', (packet) => { item(packet).proposal.title += ' revised'; rehash(item(packet)); }, /deterministic|immutable title/);
rejects('rejects year change', (packet) => { item(packet).proposal.years = [2008]; rehash(item(packet)); }, /deterministic|immutable years/);
rejects('rejects trim change', (packet) => { item(packet).proposal.trims = ['S']; rehash(item(packet)); }, /deterministic|immutable trims/);
rejects('rejects engine change', (packet) => { item(packet, IDS.oilHousing).proposal.engines = ['B48']; rehash(item(packet, IDS.oilHousing)); }, /deterministic|immutable engines/);
rejects('rejects category change', (packet) => { item(packet).proposal.category = 'engine'; rehash(item(packet)); }, /deterministic|immutable category/);
rejects('rejects severity change', (packet) => { item(packet).proposal.severity = 'critical'; rehash(item(packet)); }, /deterministic|immutable severity|noncanonical/);
rejects('rejects archive', (packet) => { item(packet).proposal.status = 'archived'; rehash(item(packet)); }, /deterministic|immutable status/);
rejects('rejects owner-count invention', (packet) => { item(packet).proposal.reportCount = 1; rehash(item(packet)); }, /deterministic|owner data/);
rejects('rejects owner-date retention', (packet) => { item(packet, IDS.oilHousing).proposal.lastReportedByOwners = '2026-02-25'; rehash(item(packet, IDS.oilHousing)); }, /deterministic|owner data/);
rejects('rejects zero social proof', (packet) => { item(packet).proposal.description += ' 0+ owners have reported this.'; rehash(item(packet)); }, /deterministic|owner social proof/);
rejects('rejects commerce', (packet) => { item(packet).proposal.fixParts.push({ partNumber: 'fake' }); rehash(item(packet)); }, /deterministic|commerce-free/);
rejects('rejects search citation', (packet) => { item(packet).proposal.citations[0].url = 'https://example.com/search?q=mini'; rehash(item(packet)); }, /deterministic|citation/);
rejects('rejects hold conversion', (packet) => { const row = item(packet); row.action = 'retain_indexed_identity_and_accuracy_cleanup'; row.identityReviewRequired = false; row.identityConflict = null; }, /deterministic|hold verdict/);
rejects('rejects blocker removal', (packet) => { packet.applicationGate.blockerRecordIds = []; }, /deterministic|blocker/);
rejects('rejects cross-chassis oil assertion', (packet) => { item(packet, IDS.oilHousing).proposal.description = 'All F54 Clubman B48 engines have this F55 problem.'; rehash(item(packet, IDS.oilHousing)); }, /deterministic|oil-housing/);
rejects('rejects hinge assertion', (packet) => { item(packet, IDS.rearDoor).proposal.description = 'All R55 hinges fail.'; rehash(item(packet, IDS.rearDoor)); }, /deterministic|rear-door/);
rejects('rejects regulator assertion', (packet) => { item(packet, IDS.window).proposal.description = 'Every regulator fails.'; rehash(item(packet, IDS.window)); }, /deterministic|window subsystem/);
rejects('rejects DTC insertion', (packet) => { item(packet).proposal.dtcCodes.push('P9999'); rehash(item(packet)); }, /deterministic|DTC/);
rejects('rejects source replacement', (packet) => { packet.pdfSources.dualMassFlywheel.url = 'https://example.com/fake.pdf'; }, /deterministic|source evidence/);
