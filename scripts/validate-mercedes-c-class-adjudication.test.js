/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { IDS, OUTPUT, SNAPSHOT } = require('./build-mercedes-c-class-adjudication');
const { hashValue } = require('./known-issue-adjudication-utils');
const { validatePacket } = require('./validate-mercedes-c-class-adjudication');
const frozen = JSON.parse(fs.readFileSync(OUTPUT, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function row(packet, id) { return packet.rows.find((item) => item.id === id); }
function rehash(item) { item.proposalSha256 = hashValue(item.proposal); item.changedFields = Object.keys(item.proposal).filter((key) => hashValue(item.before[key]) !== hashValue(item.proposal[key])); }
function rejects(name, mutate, pattern) { test(name, () => { const packet = clone(frozen); mutate(packet); assert.match(validatePacket(packet, snapshot).join('\n'), pattern); }); }
test('frozen C-Class packet passes', () => assert.deepEqual(validatePacket(clone(frozen), snapshot), []));
rejects('rejects title change', (packet) => { const item = row(packet, IDS.hybrid48v); item.proposal.title += ' revised'; rehash(item); }, /deterministic|immutable title/);
rejects('rejects year change', (packet) => { const item = row(packet, IDS.mbux); item.proposal.years.push(2026); rehash(item); }, /deterministic|immutable years/);
rejects('rejects trim change', (packet) => { const item = row(packet, IDS.valveBody); item.proposal.trims = ['C300']; rehash(item); }, /deterministic|immutable trims/);
rejects('rejects engine change', (packet) => { const item = row(packet, IDS.camAdjuster); item.proposal.engines = ['M271']; rehash(item); }, /deterministic|immutable engines/);
rejects('rejects archive', (packet) => { const item = row(packet, IDS.subframe); item.proposal.status = 'archived'; rehash(item); }, /deterministic|immutable status|published status/);
rejects('rejects owner social proof', (packet) => { const item = row(packet, IDS.valveBody); item.proposal.description += ' 2,200+ owners have reported it.'; rehash(item); }, /deterministic|owner social proof/);
rejects('rejects commerce', (packet) => { const item = row(packet, IDS.conductorPlate); item.proposal.fixParts.push({ name: 'plate' }); rehash(item); }, /deterministic|commerce-free/);
rejects('rejects search citation', (packet) => { const item = row(packet, IDS.sunroof); item.proposal.citations[0].url = 'https://example.com/search?q=drain'; rehash(item); }, /deterministic|citation/);
rejects('rejects hold converted to retain', (packet) => { const item = row(packet, IDS.adas); item.action = 'retain_indexed_identity_and_accuracy_cleanup'; item.identityReviewRequired = false; }, /deterministic|identity verdict/);
rejects('rejects blocker removal', (packet) => { packet.applicationGate.blockerRecordIds = packet.applicationGate.blockerRecordIds.slice(1); }, /deterministic|blocker/);
rejects('rejects fabricated valve-body count', (packet) => { const item = row(packet, IDS.valveBody); item.proposal.reportCount = 2200; rehash(item); }, /deterministic|fabricated report count/);
rejects('rejects fabricated cam count', (packet) => { const item = row(packet, IDS.camAdjuster); item.proposal.reportCount = 1200; rehash(item); }, /deterministic|fabricated report count/);
rejects('rejects fabricated SAM count', (packet) => { const item = row(packet, IDS.sam); item.proposal.reportCount = 2500; rehash(item); }, /deterministic|fabricated report count/);
rejects('rejects ISG replacement transfer', (packet) => { const item = row(packet, IDS.hybrid48v); item.proposal.solution = 'Replacement of the integrated starter-generator is required.'; rehash(item); }, /deterministic|48V evidence/);
rejects('rejects ADAS campaign converted to misalignment proof', (packet) => { const item = row(packet, IDS.adas); item.proposal.description = 'Campaign 25P5496520 proves sensor misalignment.'; rehash(item); }, /deterministic|ADAS coding/);
rejects('rejects false 24V797 citation transfer', (packet) => { const item = row(packet, IDS.mbux); item.proposal.citations.push({ url: 'https://static.nhtsa.gov/odi/rcl/2024/RCLQRT-24V797-0226.pdf', type: 'nhtsa', title: 'wrong' }); rehash(item); }, /deterministic|MBUX false-citation|exact citations/);
rejects('rejects cam identity transfer', (packet) => { const item = row(packet, IDS.camAdjuster); item.proposal.description = 'The M274 solenoid is covered.'; rehash(item); }, /deterministic|cam-adjuster identity/);
rejects('rejects subframe welding advice', (packet) => { const item = row(packet, IDS.subframe); item.proposal.solution = 'Weld-repair minor cracks.'; rehash(item); }, /deterministic|subframe corrosion/);
rejects('rejects related-link mutation', (packet) => { const item = row(packet, IDS.doorLock); item.proposal.relatedIssueIds = ['unauthorized-related-page']; rehash(item); }, /deterministic|immutable relatedIssueIds/);
rejects('rejects PDF page omission', (packet) => { packet.pdfSources.instrumentClusterRecall.visualPages = [1, 2]; }, /deterministic|PDF evidence manifest/);
rejects('rejects human approval', (packet) => { const item = row(packet, IDS.brakes); item.proposal.humanApproved = true; rehash(item); }, /deterministic|commerce-free/);
