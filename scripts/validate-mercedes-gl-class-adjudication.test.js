/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { IDS, OUTPUT, SNAPSHOT } = require('./build-mercedes-gl-class-adjudication');
const { diffFields, hashValue } = require('./known-issue-adjudication-utils');
const { validatePacket } = require('./validate-mercedes-gl-class-adjudication');
const frozen = JSON.parse(fs.readFileSync(OUTPUT, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function item(packet, id = IDS.suspension) { return packet.rows.find((row) => row.id === id); }
function rehash(row) { row.proposalSha256 = hashValue(row.proposal); row.changedFields = diffFields(row.before, row.proposal); }
function rejects(name, mutate, pattern = /deterministic/) {
  test(name, () => {
    const packet = clone(frozen); mutate(packet);
    assert.match(validatePacket(packet, snapshot).join('\n'), pattern);
  });
}
test('frozen GL-Class packet passes', () => assert.deepEqual(validatePacket(clone(frozen), snapshot), []));
rejects('rejects title change', (packet) => { item(packet).proposal.title += ' revised'; rehash(item(packet)); }, /deterministic|immutable title/);
rejects('rejects year change', (packet) => { item(packet).proposal.years = [2008]; rehash(item(packet)); }, /deterministic|immutable years/);
rejects('rejects trim change', (packet) => { item(packet).proposal.trims = []; rehash(item(packet)); }, /deterministic|immutable trims/);
rejects('rejects engine change', (packet) => { item(packet, IDS.oilCooler).proposal.engines = []; rehash(item(packet, IDS.oilCooler)); }, /deterministic|immutable engines/);
rejects('rejects category change', (packet) => { item(packet).proposal.category = 'engine'; rehash(item(packet)); }, /deterministic|immutable category/);
rejects('rejects severity change', (packet) => { item(packet).proposal.severity = 'medium'; rehash(item(packet)); }, /deterministic|immutable severity/);
rejects('rejects archive', (packet) => { item(packet).proposal.status = 'archived'; rehash(item(packet)); }, /deterministic|immutable status/);
rejects('rejects related-link change', (packet) => { item(packet).proposal.relatedIssueIds = ['fake-related-id']; rehash(item(packet)); }, /deterministic|immutable relatedIssueIds/);
rejects('rejects restored owner count', (packet) => { item(packet).proposal.reportCount = 1800; rehash(item(packet)); }, /deterministic|zero-count/);
rejects('rejects zero social proof', (packet) => { item(packet).proposal.description += ' 0+ owners have reported this.'; rehash(item(packet)); }, /deterministic|owner social proof/);
rejects('rejects old social proof', (packet) => { item(packet).proposal.description += ' 1,800+ owners have reported this.'; rehash(item(packet)); }, /deterministic|owner social proof/);
rejects('rejects commerce', (packet) => { item(packet).proposal.fixParts.push({ partNumber: 'fake' }); rehash(item(packet)); }, /deterministic|commerce-free/);
rejects('rejects human approval', (packet) => { item(packet).proposal.humanApproved = true; rehash(item(packet)); }, /deterministic|commerce-free/);
rejects('rejects search citation', (packet) => { item(packet).proposal.citations[0].url = 'https://example.com/search?q=gl'; rehash(item(packet)); }, /deterministic|citation/);
rejects('rejects hold converted to retain', (packet) => { const row = item(packet); row.action = 'retain_indexed_identity_and_accuracy_cleanup'; row.identityReviewRequired = false; row.identityConflict = null; }, /deterministic|hold verdict/);
rejects('rejects blocker removal', (packet) => { packet.applicationGate.blockerRecordIds = []; }, /deterministic|blocker/);
rejects('rejects pressure-disk evidence expansion', (packet) => { item(packet).proposal.description = 'All GL-Class compressors fail from vehicle weight.'; rehash(item(packet)); }, /deterministic|AIRMATIC evidence/);
rejects('rejects oil trace relabeled coolant damage', (packet) => { item(packet, IDS.oilCooler).proposal.description = 'Oil always contaminates coolant.'; rehash(item(packet, IDS.oilCooler)); }, /deterministic|oil-cooler evidence/);
rejects('rejects rear-SAM relabeled strut failure', (packet) => { item(packet, IDS.tailgate).proposal.description = '10028625 proves gas strut failure.'; rehash(item(packet, IDS.tailgate)); }, /deterministic|tailgate evidence/);
rejects('rejects oil condition relabeled chain wear', (packet) => { item(packet, IDS.transferCase).proposal.description = 'Mercedes proves chain wear.'; rehash(item(packet, IDS.transferCase)); }, /deterministic|transfer-case evidence/);
rejects('rejects universal aftermarket compressor', (packet) => { item(packet).proposal.solution = 'Buy an Arnott compressor.'; rehash(item(packet)); }, /deterministic|commerce boundary/);
rejects('rejects PDF source insertion', (packet) => { packet.pdfSources.fake = { url: 'https://example.com/fake.pdf' }; }, /deterministic|source evidence/);
