/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { IDS, OUTPUT, SNAPSHOT } = require('./build-mg-mgb-adjudication');
const { diffFields, hashValue } = require('./known-issue-adjudication-utils');
const { validatePacket } = require('./validate-mg-mgb-adjudication');

const frozen = JSON.parse(fs.readFileSync(OUTPUT, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function item(packet, id = IDS.charging) { return packet.rows.find((row) => row.id === id); }
function rehash(row) { row.proposalSha256 = hashValue(row.proposal); row.changedFields = diffFields(row.before, row.proposal); }
function rejects(name, mutate, pattern = /deterministic/) {
  test(name, () => { const packet = clone(frozen); mutate(packet); assert.match(validatePacket(packet, snapshot).join('\n'), pattern); });
}

test('frozen MGB packet passes', () => assert.deepEqual(validatePacket(clone(frozen), snapshot), []));
rejects('rejects title change', (packet) => { item(packet).proposal.title += ' revised'; rehash(item(packet)); }, /deterministic|immutable title/);
rejects('rejects year change', (packet) => { item(packet).proposal.years = [1962]; rehash(item(packet)); }, /deterministic|immutable years/);
rejects('rejects trim change', (packet) => { item(packet).proposal.trims = ['Roadster']; rehash(item(packet)); }, /deterministic|immutable trims/);
rejects('rejects engine change', (packet) => { item(packet).proposal.engines = []; rehash(item(packet)); }, /deterministic|immutable engines/);
rejects('rejects category change', (packet) => { item(packet).proposal.category = 'engine'; rehash(item(packet)); }, /deterministic|immutable category/);
rejects('rejects severity change', (packet) => { item(packet).proposal.severity = 'critical'; rehash(item(packet)); }, /deterministic|immutable severity/);
rejects('rejects archive', (packet) => { item(packet).proposal.status = 'archived'; rehash(item(packet)); }, /deterministic|immutable status/);
rejects('rejects owner-count invention', (packet) => { item(packet).proposal.reportCount = 1; rehash(item(packet)); }, /deterministic|zero report count/);
rejects('rejects zero social proof', (packet) => { item(packet).proposal.description += ' 0+ owners have reported this.'; rehash(item(packet)); }, /deterministic|owner social proof/);
rejects('rejects commerce', (packet) => { item(packet).proposal.fixParts.push({ partNumber: 'fake' }); rehash(item(packet)); }, /deterministic|commerce-free/);
rejects('rejects search citation', (packet) => { item(packet).proposal.citations[0].url = 'https://example.com/search?q=mgb'; rehash(item(packet)); }, /deterministic|citation/);
rejects('rejects held charging row converted to retain', (packet) => { const row = item(packet); row.action = 'retain_indexed_identity_and_accuracy_cleanup'; row.identityReviewRequired = false; row.identityConflict = null; }, /deterministic|verdict/);
rejects('rejects retained damper row converted to hold', (packet) => { const row = item(packet, IDS.dampers); row.action = 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy'; row.identityReviewRequired = true; row.identityConflict = 'fake'; }, /deterministic|verdict/);
rejects('rejects blocker removal', (packet) => { packet.applicationGate.blockerRecordIds = []; }, /deterministic|blocker/);
rejects('rejects weak-dynamo assertion', (packet) => { item(packet).proposal.description = 'Every MGB has a weak dynamo.'; rehash(item(packet)); }, /deterministic|charging boundary/);
rejects('rejects always-leaks assertion', (packet) => { item(packet, IDS.scrollSeal).proposal.description = 'All engines always leak.'; rehash(item(packet, IDS.scrollSeal)); }, /deterministic|scroll-seal boundary/);
rejects('rejects DTC insertion', (packet) => { item(packet).proposal.dtcCodes.push('P9999'); rehash(item(packet)); }, /deterministic|non-OBD/);
rejects('rejects manual replacement', (packet) => { packet.pdfSources.workshopManual.url = 'https://example.com/fake.pdf'; }, /deterministic|source evidence/);
