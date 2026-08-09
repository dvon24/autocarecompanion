/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { IDS, OUTPUT, SNAPSHOT } = require('./build-mercedes-eqe-adjudication');
const { hashValue } = require('./known-issue-adjudication-utils');
const { validatePacket } = require('./validate-mercedes-eqe-adjudication');
const frozen = JSON.parse(fs.readFileSync(OUTPUT, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function row(packet, id) { return packet.rows.find((item) => item.id === id); }
function rehash(item) { item.proposalSha256 = hashValue(item.proposal); item.changedFields = Object.keys(item.proposal).filter((key) => hashValue(item.before[key]) !== hashValue(item.proposal[key])); }
function rejects(name, mutate, pattern) { test(name, () => { const packet = clone(frozen); mutate(packet); assert.match(validatePacket(packet, snapshot).join('\n'), pattern); }); }
test('frozen EQE packet passes', () => assert.deepEqual(validatePacket(clone(frozen), snapshot), []));
rejects('rejects title change', (packet) => { const item = row(packet, IDS.charging); item.proposal.title += ' revised'; rehash(item); }, /deterministic|immutable title/);
rejects('rejects year change', (packet) => { const item = row(packet, IDS.ota); item.proposal.years = [2023]; rehash(item); }, /deterministic|immutable years/);
rejects('rejects trim change', (packet) => { const item = row(packet, IDS.charging); item.proposal.trims = []; rehash(item); }, /deterministic|immutable trims/);
rejects('rejects engine change', (packet) => { const item = row(packet, IDS.ota); item.proposal.engines = []; rehash(item); }, /deterministic|immutable engines/);
rejects('rejects category change', (packet) => { const item = row(packet, IDS.charging); item.proposal.category = 'engine'; rehash(item); }, /deterministic|immutable category/);
rejects('rejects archive', (packet) => { const item = row(packet, IDS.ota); item.proposal.status = 'archived'; rehash(item); }, /deterministic|immutable status/);
rejects('rejects social proof', (packet) => { const item = row(packet, IDS.charging); item.proposal.description += ' 580+ owners have reported it.'; rehash(item); }, /deterministic|owner social proof/);
rejects('rejects restored owner count', (packet) => { const item = row(packet, IDS.ota); item.proposal.reportCount = 420; rehash(item); }, /deterministic|zero-count/);
rejects('rejects commerce', (packet) => { const item = row(packet, IDS.charging); item.proposal.fixParts.push({ partNumber: 'battery' }); rehash(item); }, /deterministic|commerce-free/);
rejects('rejects search citation', (packet) => { const item = row(packet, IDS.ota); item.proposal.citations[0].url = 'https://example.com/search?q=ota'; rehash(item); }, /deterministic|citation/);
rejects('rejects charging hold converted to retain', (packet) => { const item = row(packet, IDS.charging); item.action = 'retain_indexed_identity_and_accuracy_cleanup'; item.identityReviewRequired = false; }, /deterministic|hold verdict/);
rejects('rejects OTA hold converted to retain', (packet) => { const item = row(packet, IDS.ota); item.action = 'retain_indexed_identity_and_accuracy_cleanup'; item.identityReviewRequired = false; }, /deterministic|hold verdict/);
rejects('rejects blocker removal', (packet) => { packet.applicationGate.blockerRecordIds.pop(); }, /deterministic|blocker/);
rejects('rejects charging defect transfer', (packet) => { const item = row(packet, IDS.charging); item.proposal.description = 'The manual proves repeated 50-80 kW charging due to bad software.'; rehash(item); }, /deterministic|charging evidence/);
rejects('rejects MBUX failure transfer', (packet) => { const item = row(packet, IDS.ota); item.proposal.description = 'LI00.00-P-079603 proves general MBUX boot loops.'; rehash(item); }, /deterministic|OTA evidence/);
rejects('rejects related-link mutation', (packet) => { const item = row(packet, IDS.ota); item.proposal.relatedIssueIds = ['unauthorized']; rehash(item); }, /deterministic|immutable relatedIssueIds/);
rejects('rejects manual page omission', (packet) => { packet.pdfSources.ownersManual.visualPages = [197, 212]; }, /deterministic|PDF evidence/);
rejects('rejects OTA PDF page omission', (packet) => { packet.pdfSources.otaSrsBulletin.visualPages = [1]; }, /deterministic|PDF evidence/);
rejects('rejects human approval', (packet) => { const item = row(packet, IDS.ota); item.proposal.humanApproved = true; rehash(item); }, /deterministic|commerce-free/);
