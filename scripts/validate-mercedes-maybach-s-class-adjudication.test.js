/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict'); const fs = require('node:fs'); const test = require('node:test');
const { IDS, OUTPUT, SNAPSHOT } = require('./build-mercedes-maybach-s-class-adjudication');
const { diffFields, hashValue } = require('./known-issue-adjudication-utils');
const { validatePacket } = require('./validate-mercedes-maybach-s-class-adjudication');
const frozen = JSON.parse(fs.readFileSync(OUTPUT, 'utf8')); const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function item(packet, id = IDS.suspension) { return packet.rows.find((row) => row.id === id); }
function rehash(row) { row.proposalSha256 = hashValue(row.proposal); row.changedFields = diffFields(row.before, row.proposal); }
function rejects(name, mutate, pattern = /deterministic/) { test(name, () => { const packet = clone(frozen); mutate(packet); assert.match(validatePacket(packet, snapshot).join('\n'), pattern); }); }
test('frozen Mercedes-Maybach S-Class packet passes', () => assert.deepEqual(validatePacket(clone(frozen), snapshot), []));
rejects('rejects title change', (packet) => { item(packet).proposal.title += ' revised'; rehash(item(packet)); }, /deterministic|immutable title/);
rejects('rejects year change', (packet) => { item(packet).proposal.years = [2021]; rehash(item(packet)); }, /deterministic|immutable years/);
rejects('rejects trim change', (packet) => { item(packet).proposal.trims = []; rehash(item(packet)); }, /deterministic|immutable trims/);
rejects('rejects engine change', (packet) => { item(packet).proposal.engines = []; rehash(item(packet)); }, /deterministic|immutable engines/);
rejects('rejects category change', (packet) => { item(packet).proposal.category = 'electrical'; rehash(item(packet)); }, /deterministic|immutable category/);
rejects('rejects severity change', (packet) => { item(packet).proposal.severity = 'high'; rehash(item(packet)); }, /deterministic|immutable severity/);
rejects('rejects archive', (packet) => { item(packet).proposal.status = 'archived'; rehash(item(packet)); }, /deterministic|immutable status/);
rejects('rejects related-link change', (packet) => { item(packet).proposal.relatedIssueIds = ['fake']; rehash(item(packet)); }, /deterministic|immutable relatedIssueIds/);
rejects('rejects restored count', (packet) => { item(packet).proposal.reportCount = 190; rehash(item(packet)); }, /deterministic|zero-count/);
rejects('rejects zero social proof', (packet) => { item(packet).proposal.description += ' 0+ owners have reported this.'; rehash(item(packet)); }, /deterministic|owner social proof/);
rejects('rejects old social proof', (packet) => { item(packet).proposal.description += ' 190+ owners have reported this.'; rehash(item(packet)); }, /deterministic|owner social proof/);
rejects('rejects commerce', (packet) => { item(packet).proposal.fixParts.push({ partNumber: 'fake' }); rehash(item(packet)); }, /deterministic|commerce-free/);
rejects('rejects human approval', (packet) => { item(packet).proposal.humanApproved = true; rehash(item(packet)); }, /deterministic|commerce-free/);
rejects('rejects search citation', (packet) => { item(packet).proposal.citations[0].url = 'https://example.com/search?q=maybach'; rehash(item(packet)); }, /deterministic|citation/);
rejects('rejects hold converted to retain', (packet) => { const row = item(packet); row.action = 'retain_indexed_identity_and_accuracy_cleanup'; row.identityReviewRequired = false; row.identityConflict = null; }, /deterministic|hold verdict/);
rejects('rejects blocker removal', (packet) => { packet.applicationGate.blockerRecordIds = []; }, /deterministic|blocker/);
rejects('rejects universal hydraulic flush', (packet) => { item(packet).proposal.solution = 'Flush the hydraulic fluid.'; rehash(item(packet)); }, /deterministic|suspension/);
rejects('rejects compressed-air fragrance repair', (packet) => { item(packet, IDS.fragrance).proposal.solution = 'Clean with compressed air.'; rehash(item(packet, IDS.fragrance)); }, /deterministic|fragrance/);
rejects('rejects processor-overload claim', (packet) => { item(packet, IDS.rearEntertainment).proposal.description = 'Two media streams overload the processor.'; rehash(item(packet, IDS.rearEntertainment)); }, /deterministic|rear-entertainment/);
rejects('rejects PDF insertion', (packet) => { packet.pdfSources.fake = { url: 'https://example.com/fake.pdf' }; }, /deterministic|source evidence/);
