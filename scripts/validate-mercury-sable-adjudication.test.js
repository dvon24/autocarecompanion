/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { IDS, OUTPUT, SNAPSHOT } = require('./build-mercury-sable-adjudication');
const { diffFields, hashValue } = require('./known-issue-adjudication-utils');
const { validatePacket } = require('./validate-mercury-sable-adjudication');

const frozen = JSON.parse(fs.readFileSync(OUTPUT, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function item(packet, id = IDS.cooling) { return packet.rows.find((row) => row.id === id); }
function rehash(row) { row.proposalSha256 = hashValue(row.proposal); row.changedFields = diffFields(row.before, row.proposal); }
function rejects(name, mutate, pattern = /deterministic/) {
  test(name, () => {
    const packet = clone(frozen);
    mutate(packet);
    assert.match(validatePacket(packet, snapshot).join('\n'), pattern);
  });
}

test('frozen Sable packet passes', () => assert.deepEqual(validatePacket(clone(frozen), snapshot), []));
rejects('rejects title change', (packet) => { item(packet).proposal.title += ' revised'; rehash(item(packet)); }, /deterministic|immutable title/);
rejects('rejects year change', (packet) => { item(packet).proposal.years = [1996, 1997]; rehash(item(packet)); }, /deterministic|immutable years/);
rejects('rejects engine change', (packet) => { item(packet).proposal.engines = ['3.0L']; rehash(item(packet)); }, /deterministic|immutable engines/);
rejects('rejects category change', (packet) => { item(packet).proposal.category = 'engine'; rehash(item(packet)); }, /deterministic|immutable category/);
rejects('rejects severity change', (packet) => { item(packet).proposal.severity = 'critical'; rehash(item(packet)); }, /deterministic|immutable severity/);
rejects('rejects archive', (packet) => { item(packet).proposal.status = 'archived'; rehash(item(packet)); }, /deterministic|immutable status/);
rejects('rejects owner-count invention', (packet) => { item(packet).proposal.reportCount = 1; rehash(item(packet)); }, /deterministic|zero report count/);
rejects('rejects zero social proof', (packet) => { item(packet).proposal.description += ' 0+ owners have reported this.'; rehash(item(packet)); }, /deterministic|owner social proof/);
rejects('rejects commerce', (packet) => { item(packet).proposal.fixParts.push({ partNumber: 'fake' }); rehash(item(packet)); }, /deterministic|commerce-free/);
rejects('rejects human approval', (packet) => { item(packet).proposal.humanApproved = true; rehash(item(packet)); }, /deterministic|commerce-free/);
rejects('rejects search citation', (packet) => { item(packet).proposal.citations[0].url = 'https://example.com/search?q=sable'; rehash(item(packet)); }, /deterministic|citation/);
rejects('rejects held cooling row converted to retain', (packet) => { const row = item(packet); row.action = 'retain_indexed_identity_and_accuracy_cleanup'; row.identityReviewRequired = false; row.identityConflict = null; }, /deterministic|verdict/);
rejects('rejects retained spring row converted to hold', (packet) => { const row = item(packet, IDS.spring); row.action = 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy'; row.identityReviewRequired = true; row.identityConflict = 'fake'; }, /deterministic|verdict/);
rejects('rejects blocker removal', (packet) => { packet.applicationGate.blockerRecordIds = []; }, /deterministic|blocker/);
rejects('rejects universal spring-recall claim', (packet) => { item(packet, IDS.spring).proposal.description = 'All Sables have a free spring recall forever.'; rehash(item(packet, IDS.spring)); }, /deterministic|spring recall boundary/);
rejects('rejects universal throttle claim', (packet) => { item(packet, IDS.throttle).proposal.description = 'Every 2000-2003 Sable has the defect.'; rehash(item(packet, IDS.throttle)); }, /deterministic|throttle safety boundary/);
rejects('rejects unsafe stuck-throttle guidance', (packet) => { item(packet, IDS.throttle).proposal.solution = 'Buy a cable.'; rehash(item(packet, IDS.throttle)); }, /deterministic|commerce boundary|throttle safety boundary/);
rejects('rejects unsupported DTC expansion', (packet) => { item(packet, IDS.lean).proposal.dtcCodes.push('P9999'); rehash(item(packet, IDS.lean)); }, /deterministic|DTC scope/);
rejects('rejects PDF replacement', (packet) => { packet.pdfSources.springInvestigation.url = 'https://example.com/fake.pdf'; }, /deterministic|source evidence/);
