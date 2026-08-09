/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { IDS, OUTPUT, SNAPSHOT } = require('./build-mercedes-m-class-adjudication');
const { diffFields, hashValue } = require('./known-issue-adjudication-utils');
const { validatePacket } = require('./validate-mercedes-m-class-adjudication');
const frozen = JSON.parse(fs.readFileSync(OUTPUT, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function item(packet, id = IDS.conductor) { return packet.rows.find((row) => row.id === id); }
function rehash(row) { row.proposalSha256 = hashValue(row.proposal); row.changedFields = diffFields(row.before, row.proposal); }
function rejects(name, mutate, pattern = /deterministic/) {
  test(name, () => { const packet = clone(frozen); mutate(packet); assert.match(validatePacket(packet, snapshot).join('\n'), pattern); });
}
test('frozen M-Class packet passes', () => assert.deepEqual(validatePacket(clone(frozen), snapshot), []));
rejects('rejects title change', (packet) => { item(packet).proposal.title += ' revised'; rehash(item(packet)); }, /deterministic|immutable title/);
rejects('rejects year change', (packet) => { item(packet).proposal.years = [2006]; rehash(item(packet)); }, /deterministic|immutable years/);
rejects('rejects trim change', (packet) => { item(packet).proposal.trims = []; rehash(item(packet)); }, /deterministic|immutable trims/);
rejects('rejects engine change', (packet) => { item(packet).proposal.engines = []; rehash(item(packet)); }, /deterministic|immutable engines/);
rejects('rejects category change', (packet) => { item(packet).proposal.category = 'engine'; rehash(item(packet)); }, /deterministic|immutable category/);
rejects('rejects severity change', (packet) => { item(packet).proposal.severity = 'medium'; rehash(item(packet)); }, /deterministic|immutable severity/);
rejects('rejects archive', (packet) => { item(packet).proposal.status = 'archived'; rehash(item(packet)); }, /deterministic|immutable status/);
rejects('rejects related-link change', (packet) => { item(packet).proposal.relatedIssueIds = ['fake-related-id']; rehash(item(packet)); }, /deterministic|immutable relatedIssueIds/);
rejects('rejects restored owner count', (packet) => { item(packet, IDS.airmatic).proposal.reportCount = 2100; rehash(item(packet, IDS.airmatic)); }, /deterministic|zero-count/);
rejects('rejects zero social proof', (packet) => { item(packet).proposal.description += ' 0+ owners have reported this.'; rehash(item(packet)); }, /deterministic|owner social proof/);
rejects('rejects old social proof', (packet) => { item(packet).proposal.description += ' 2100+ owners have reported this.'; rehash(item(packet)); }, /deterministic|owner social proof/);
rejects('rejects commerce', (packet) => { item(packet).proposal.fixParts.push({ partNumber: 'fake' }); rehash(item(packet)); }, /deterministic|commerce-free/);
rejects('rejects human approval', (packet) => { item(packet).proposal.humanApproved = true; rehash(item(packet)); }, /deterministic|commerce-free/);
rejects('rejects search citation', (packet) => { item(packet).proposal.citations[0].url = 'https://example.com/search?q=m-class'; rehash(item(packet)); }, /deterministic|citation/);
rejects('rejects hold converted to retain', (packet) => { const row = item(packet); row.action = 'retain_indexed_identity_and_accuracy_cleanup'; row.identityReviewRequired = false; row.identityConflict = null; }, /deterministic|verdict/);
rejects('rejects oil-cooler retain converted to hold', (packet) => { const row = item(packet, IDS.oilCooler); row.action = 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy'; row.identityReviewRequired = true; row.identityConflict = 'fake'; }, /deterministic|verdict/);
rejects('rejects blocker removal', (packet) => { packet.applicationGate.blockerRecordIds = []; }, /deterministic|blocker/);
rejects('rejects plug-and-play VGS repair', (packet) => { item(packet).proposal.solution = 'Replacement is plug-and-play.'; rehash(item(packet)); }, /deterministic|conductor/);
rejects('rejects brake recall downgrade', (packet) => { item(packet, IDS.booster).proposal.solution = 'Keep driving and inspect later.'; rehash(item(packet, IDS.booster)); }, /deterministic|brake-booster/);
rejects('rejects M276 chain-damage claim', (packet) => { item(packet, IDS.m276).proposal.description = 'The rattle always causes chain damage.'; rehash(item(packet, IDS.m276)); }, /deterministic|M276/);
rejects('rejects swirl resistor bypass', (packet) => { item(packet, IDS.swirl).proposal.solution = 'Install a resistor bypass.'; rehash(item(packet, IDS.swirl)); }, /deterministic|swirl/);
rejects('rejects tail-lamp recall expansion', (packet) => { item(packet, IDS.tailLamp).proposal.description = 'All 2006-2011 vehicles are recalled.'; rehash(item(packet, IDS.tailLamp)); }, /deterministic|tail-lamp/);
rejects('rejects oil-cooler replacement', (packet) => { item(packet, IDS.oilCooler).proposal.solution = 'Replace the entire oil cooler.'; rehash(item(packet, IDS.oilCooler)); }, /deterministic|oil-cooler/);
rejects('rejects PDF manifest mutation', (packet) => { packet.pdfSources.m276Bulletin.sha256 = 'bad'; }, /deterministic|source evidence/);
