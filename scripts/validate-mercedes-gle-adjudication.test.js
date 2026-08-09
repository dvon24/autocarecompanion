/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { IDS, OUTPUT, SNAPSHOT } = require('./build-mercedes-gle-adjudication');
const { diffFields, hashValue } = require('./known-issue-adjudication-utils');
const { validatePacket } = require('./validate-mercedes-gle-adjudication');

const frozen = JSON.parse(fs.readFileSync(OUTPUT, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function item(packet, id = IDS.drain) { return packet.rows.find((row) => row.id === id); }
function rehash(row) {
  row.proposalSha256 = hashValue(row.proposal);
  row.changedFields = diffFields(row.before, row.proposal);
}
function rejects(name, mutate, pattern = /deterministic/) {
  test(name, () => {
    const packet = clone(frozen); mutate(packet);
    assert.match(validatePacket(packet, snapshot).join('\n'), pattern);
  });
}

test('frozen GLE packet passes', () => assert.deepEqual(validatePacket(clone(frozen), snapshot), []));
rejects('rejects title change', (packet) => { item(packet).proposal.title += ' revised'; rehash(item(packet)); }, /deterministic|immutable title/);
rejects('rejects year change', (packet) => { item(packet).proposal.years = [2021]; rehash(item(packet)); }, /deterministic|immutable years/);
rejects('rejects trim change', (packet) => { item(packet, IDS.hybrid).proposal.trims = []; rehash(item(packet, IDS.hybrid)); }, /deterministic|immutable trims/);
rejects('rejects engine change', (packet) => { item(packet, IDS.transmission).proposal.engines = []; rehash(item(packet, IDS.transmission)); }, /deterministic|immutable engines/);
rejects('rejects category change', (packet) => { item(packet).proposal.category = 'engine'; rehash(item(packet)); }, /deterministic|immutable category/);
rejects('rejects severity change', (packet) => { item(packet).proposal.severity = 'medium'; rehash(item(packet)); }, /deterministic|immutable severity/);
rejects('rejects archive', (packet) => { item(packet).proposal.status = 'archived'; rehash(item(packet)); }, /deterministic|immutable status/);
rejects('rejects related-link change', (packet) => { item(packet).proposal.relatedIssueIds = ['fake-related-id']; rehash(item(packet)); }, /deterministic|immutable relatedIssueIds/);
rejects('rejects restored suspension count', (packet) => { item(packet, IDS.suspension).proposal.reportCount = 1800; rehash(item(packet, IDS.suspension)); }, /deterministic|zero-count/);
rejects('rejects restored differential count', (packet) => { item(packet, IDS.differential).proposal.reportCount = 600; rehash(item(packet, IDS.differential)); }, /deterministic|zero-count/);
rejects('rejects zero social proof', (packet) => { item(packet).proposal.description += ' 0+ owners have reported this.'; rehash(item(packet)); }, /deterministic|owner social proof/);
rejects('rejects old social proof', (packet) => { item(packet).proposal.description += ' 1,800+ owners have reported this.'; rehash(item(packet)); }, /deterministic|owner social proof/);
rejects('rejects commerce', (packet) => { item(packet).proposal.fixParts.push({ partNumber: 'A1678323600' }); rehash(item(packet)); }, /deterministic|commerce-free/);
rejects('rejects human approval', (packet) => { item(packet).proposal.humanApproved = true; rehash(item(packet)); }, /deterministic|commerce-free/);
rejects('rejects search citation', (packet) => { item(packet).proposal.citations[0].url = 'https://example.com/search?q=gle'; rehash(item(packet)); }, /deterministic|citation/);
rejects('rejects drain converted to hold', (packet) => { const row = item(packet); row.action = 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy'; row.identityReviewRequired = true; row.identityConflict = 'x'; }, /deterministic|retain verdict/);
rejects('rejects hybrid hold converted to retain', (packet) => { const row = item(packet, IDS.hybrid); row.action = 'retain_indexed_identity_and_accuracy_cleanup'; row.identityReviewRequired = false; row.identityConflict = null; }, /deterministic|hold verdict/);
rejects('rejects blocker removal', (packet) => { packet.applicationGate.blockerRecordIds = []; }, /deterministic|blocker/);
rejects('rejects recall population as owner count', (packet) => { item(packet).proposal.description += ' 4,325+ owners reported this.'; rehash(item(packet)); }, /deterministic|owner social proof/);
rejects('rejects 48V hardware inference', (packet) => { item(packet, IDS.hybrid).proposal.description = 'Mercedes proves one ISG hardware failure.'; rehash(item(packet, IDS.hybrid)); }, /deterministic|48V evidence/);
rejects('rejects natural fogging relabeled failure', (packet) => { item(packet, IDS.headlight).proposal.description = 'Any condensation proves electronics failure.'; rehash(item(packet, IDS.headlight)); }, /deterministic|headlamp guidance/);
rejects('rejects transfer oil relabeled chain wear', (packet) => { item(packet, IDS.transferCase).proposal.description = 'Mercedes proves chain stretch.'; rehash(item(packet, IDS.transferCase)); }, /deterministic|transfer-case evidence/);
rejects('rejects universal liftgate spindle advice', (packet) => { item(packet, IDS.liftgate).proposal.solution = 'Buy the spindle drive.'; rehash(item(packet, IDS.liftgate)); }, /deterministic|commerce boundary/);
rejects('rejects PDF page drift', (packet) => { packet.pdfSources.drainRecall.visualPages = [1, 3, 4]; }, /deterministic|PDF evidence/);
