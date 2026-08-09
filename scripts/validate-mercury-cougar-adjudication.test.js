/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { IDS, OUTPUT, SNAPSHOT } = require('./build-mercury-cougar-adjudication');
const { diffFields, hashValue } = require('./known-issue-adjudication-utils');
const { validatePacket } = require('./validate-mercury-cougar-adjudication');

const frozen = JSON.parse(fs.readFileSync(OUTPUT, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function item(packet, id = IDS.headGasket) { return packet.rows.find((row) => row.id === id); }
function rehash(row) { row.proposalSha256 = hashValue(row.proposal); row.changedFields = diffFields(row.before, row.proposal); }
function rejects(name, mutate, pattern = /deterministic/) {
  test(name, () => {
    const packet = clone(frozen);
    mutate(packet);
    assert.match(validatePacket(packet, snapshot).join('\n'), pattern);
  });
}

test('frozen Cougar packet passes', () => assert.deepEqual(validatePacket(clone(frozen), snapshot), []));
rejects('rejects title change', (packet) => { item(packet).proposal.title += ' revised'; rehash(item(packet)); }, /deterministic|immutable title/);
rejects('rejects year change', (packet) => { item(packet).proposal.years = [1994, 1995]; rehash(item(packet)); }, /deterministic|immutable years/);
rejects('rejects engine change', (packet) => { item(packet).proposal.engines = ['3.8L']; rehash(item(packet)); }, /deterministic|immutable engines/);
rejects('rejects category change', (packet) => { item(packet).proposal.category = 'cooling'; rehash(item(packet)); }, /deterministic|immutable category/);
rejects('rejects severity change', (packet) => { item(packet).proposal.severity = 'critical'; rehash(item(packet)); }, /deterministic|immutable severity/);
rejects('rejects archive', (packet) => { item(packet).proposal.status = 'archived'; rehash(item(packet)); }, /deterministic|immutable status/);
rejects('rejects owner-count invention', (packet) => { item(packet).proposal.reportCount = 1; rehash(item(packet)); }, /deterministic|zero report count/);
rejects('rejects zero social proof', (packet) => { item(packet).proposal.description += ' 0+ owners have reported this.'; rehash(item(packet)); }, /deterministic|owner social proof/);
rejects('rejects commerce', (packet) => { item(packet).proposal.fixParts.push({ partNumber: 'fake' }); rehash(item(packet)); }, /deterministic|commerce-free/);
rejects('rejects human approval', (packet) => { item(packet).proposal.humanApproved = true; rehash(item(packet)); }, /deterministic|commerce-free/);
rejects('rejects search citation', (packet) => { item(packet).proposal.citations[0].url = 'https://example.com/search?q=cougar'; rehash(item(packet)); }, /deterministic|citation/);
rejects('rejects held head gasket converted to retain', (packet) => { const row = item(packet); row.action = 'retain_indexed_identity_and_accuracy_cleanup'; row.identityReviewRequired = false; row.identityConflict = null; }, /deterministic|verdict/);
rejects('rejects retained CD4E converted to hold', (packet) => { const row = item(packet, IDS.cd4e); row.action = 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy'; row.identityReviewRequired = true; row.identityConflict = 'fake'; }, /deterministic|verdict/);
rejects('rejects blocker removal', (packet) => { packet.applicationGate.blockerRecordIds = []; }, /deterministic|blocker/);
rejects('rejects universal FDM recall claim', (packet) => { item(packet, IDS.fuelModule).proposal.description = 'This is a free recall forever.'; rehash(item(packet, IDS.fuelModule)); }, /deterministic|campaign boundary/);
rejects('rejects alternator/cable relabel', (packet) => { item(packet, IDS.alternator).proposal.description = 'The alternator always fails.'; rehash(item(packet, IDS.alternator)); }, /deterministic|alternator\/cable/);
rejects('rejects unsupported DTC expansion', (packet) => { item(packet, IDS.cd4e).proposal.dtcCodes.push('P9999'); rehash(item(packet, IDS.cd4e)); }, /deterministic|DTC scope/);
rejects('rejects PDF insertion', (packet) => { packet.pdfSources.fake = { url: 'https://example.com/fake.pdf' }; }, /deterministic|source evidence/);
