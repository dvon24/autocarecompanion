/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { ID, OUTPUT, SNAPSHOT } = require('./build-mercedes-eqs-suv-adjudication');
const { hashValue } = require('./known-issue-adjudication-utils');
const { validatePacket } = require('./validate-mercedes-eqs-suv-adjudication');
const frozen = JSON.parse(fs.readFileSync(OUTPUT, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function item(packet) { return packet.rows.find((row) => row.id === ID); }
function rehash(row) { row.proposalSha256 = hashValue(row.proposal); row.changedFields = Object.keys(row.proposal).filter((key) => hashValue(row.before[key]) !== hashValue(row.proposal[key])); }
function rejects(name, mutate, pattern) { test(name, () => { const packet = clone(frozen); mutate(packet); assert.match(validatePacket(packet, snapshot).join('\n'), pattern); }); }

test('frozen EQS SUV packet passes', () => assert.deepEqual(validatePacket(clone(frozen), snapshot), []));
rejects('rejects title change', (packet) => { item(packet).proposal.title += ' revised'; rehash(item(packet)); }, /deterministic|immutable title/);
rejects('rejects year change', (packet) => { item(packet).proposal.years = [2024]; rehash(item(packet)); }, /deterministic|immutable years/);
rejects('rejects trim change', (packet) => { item(packet).proposal.trims = []; rehash(item(packet)); }, /deterministic|immutable trims/);
rejects('rejects engine change', (packet) => { item(packet).proposal.engines = []; rehash(item(packet)); }, /deterministic|immutable engines/);
rejects('rejects category change', (packet) => { item(packet).proposal.category = 'electrical'; rehash(item(packet)); }, /deterministic|immutable category/);
rejects('rejects archive', (packet) => { item(packet).proposal.status = 'archived'; rehash(item(packet)); }, /deterministic|immutable status/);
rejects('rejects related-link change', (packet) => { item(packet).proposal.relatedIssueIds = []; rehash(item(packet)); }, /deterministic|immutable relatedIssueIds/);
rejects('rejects restored owner count', (packet) => { item(packet).proposal.reportCount = 220; rehash(item(packet)); }, /deterministic|zero-count/);
rejects('rejects zero social proof', (packet) => { item(packet).proposal.description += ' 0+ owners have reported this.'; rehash(item(packet)); }, /deterministic|owner social proof/);
rejects('rejects old social proof', (packet) => { item(packet).proposal.description += ' 220+ owners have reported this.'; rehash(item(packet)); }, /deterministic|owner social proof/);
rejects('rejects commerce', (packet) => { item(packet).proposal.fixParts.push({ partNumber: 'compressor' }); rehash(item(packet)); }, /deterministic|commerce-free/);
rejects('rejects human approval', (packet) => { item(packet).proposal.humanApproved = true; rehash(item(packet)); }, /deterministic|commerce-free/);
rejects('rejects search citation', (packet) => { item(packet).proposal.citations[0].url = 'https://example.com/search?q=compressor'; rehash(item(packet)); }, /deterministic|citation/);
rejects('rejects hold converted to retain', (packet) => { item(packet).action = 'retain_indexed_identity_and_accuracy_cleanup'; item(packet).identityReviewRequired = false; item(packet).identityConflict = null; }, /deterministic|hold verdict/);
rejects('rejects blocker removal', (packet) => { packet.applicationGate.blockerRecordIds = []; }, /deterministic|blocker/);
rejects('rejects software-to-hardware transfer', (packet) => { item(packet).proposal.description = '11012135 proves the suspension compressor is defective.'; rehash(item(packet)); }, /deterministic|compressor evidence/);
rejects('rejects climate compressor transfer', (packet) => { item(packet).proposal.description = 'The HV AC compressor bulletin proves the AIRMATIC compressor is noisy.'; rehash(item(packet)); }, /deterministic|compressor evidence/);
rejects('rejects replacement claim', (packet) => { item(packet).proposal.solution = 'Buy the revised quieter compressor.'; rehash(item(packet)); }, /deterministic|commerce boundary/);
rejects('rejects PDF insertion', (packet) => { packet.pdfSources.fake = { url: 'https://example.com/fake.pdf' }; }, /deterministic|source manifest/);
