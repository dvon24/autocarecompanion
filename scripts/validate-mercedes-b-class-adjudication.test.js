/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { IDS, OUTPUT, SNAPSHOT } = require('./build-mercedes-b-class-adjudication');
const { hashValue } = require('./known-issue-adjudication-utils');
const { validatePacket } = require('./validate-mercedes-b-class-adjudication');
const frozen = JSON.parse(fs.readFileSync(OUTPUT, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function row(packet, id) { return packet.rows.find((item) => item.id === id); }
function rehash(item) { item.proposalSha256 = hashValue(item.proposal); item.changedFields = Object.keys(item.proposal).filter((key) => hashValue(item.before[key]) !== hashValue(item.proposal[key])); }
function rejects(name, mutate, pattern) { test(name, () => { const packet = clone(frozen); mutate(packet); assert.match(validatePacket(packet, snapshot).join('\n'), pattern); }); }
test('frozen B-Class packet passes', () => assert.deepEqual(validatePacket(clone(frozen), snapshot), []));
rejects('rejects title change', (packet) => { const item = row(packet, IDS.dct); item.proposal.title += ' revised'; rehash(item); }, /deterministic|immutable title/);
rejects('rejects year change', (packet) => { const item = row(packet, IDS.electricDrive); item.proposal.years.push(2018); rehash(item); }, /deterministic|immutable years/);
rejects('rejects trim change', (packet) => { const item = row(packet, IDS.parkingBrake); item.proposal.trims = ['B250']; rehash(item); }, /deterministic|immutable trims/);
rejects('rejects engine change', (packet) => { const item = row(packet, IDS.thermostat); item.proposal.engines = []; rehash(item); }, /deterministic|immutable engines/);
rejects('rejects archive', (packet) => { const item = row(packet, IDS.sunroof); item.proposal.status = 'archived'; rehash(item); }, /deterministic|immutable status|published status/);
rejects('rejects owner social proof', (packet) => { const item = row(packet, IDS.dct); item.proposal.description += ' 680+ owners have reported it.'; rehash(item); }, /deterministic|owner social proof/);
rejects('rejects commerce', (packet) => { const item = row(packet, IDS.turboOil); item.proposal.fixParts.push({ name: 'line' }); rehash(item); }, /deterministic|commerce-free/);
rejects('rejects search citation', (packet) => { const item = row(packet, IDS.diesel); item.proposal.citations[0].url = 'https://example.com/search?q=dpf'; rehash(item); }, /deterministic|citation/);
rejects('rejects hold converted to retain', (packet) => { const item = row(packet, IDS.parkingBrake); item.action = 'retain_indexed_identity_and_accuracy_cleanup'; item.identityReviewRequired = false; }, /deterministic|identity verdict/);
rejects('rejects blocker removal', (packet) => { packet.applicationGate.blockerRecordIds = packet.applicationGate.blockerRecordIds.slice(1); }, /deterministic|blocker/);
rejects('rejects fabricated DCT count', (packet) => { const item = row(packet, IDS.dct); item.proposal.reportCount = 680; rehash(item); }, /deterministic|fabricated report count/);
rejects('rejects fabricated EV count', (packet) => { const item = row(packet, IDS.electricDrive); item.proposal.reportCount = 150; rehash(item); }, /deterministic|fabricated report count/);
rejects('rejects fabricated turbo count', (packet) => { const item = row(packet, IDS.turboOil); item.proposal.reportCount = 290; rehash(item); }, /deterministic|fabricated report count/);
rejects('rejects DCT clutch-wear transfer', (packet) => { const item = row(packet, IDS.dct); item.proposal.solution = 'The revised friction material requires replacement.'; rehash(item); }, /deterministic|DCT evidence/);
rejects('rejects recall converted to motor-bearing proof', (packet) => { const item = row(packet, IDS.electricDrive); item.proposal.description = 'Recall 15V-655 proves the motor-bearing defect.'; rehash(item); }, /deterministic|electric-drive recall/);
rejects('rejects connector converted to actuator proof', (packet) => { const item = row(packet, IDS.parkingBrake); item.proposal.description = 'The actuator motor fails on all years.'; rehash(item); }, /deterministic|parking-brake connector/);
rejects('rejects related-link mutation', (packet) => { const item = row(packet, IDS.tailgate); item.proposal.relatedIssueIds = ['unauthorized-related-page']; rehash(item); }, /deterministic|immutable relatedIssueIds/);
rejects('rejects PDF page omission', (packet) => { packet.pdfSources.parkingBrakeBulletin.visualPages = [1, 2]; }, /deterministic|PDF evidence manifest/);
rejects('rejects human approval', (packet) => { const item = row(packet, IDS.timingChain); item.proposal.humanApproved = true; rehash(item); }, /deterministic|commerce-free/);
