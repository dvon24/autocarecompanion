/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { IDS, OUTPUT, SNAPSHOT } = require('./build-mercedes-amg-gt-adjudication');
const { hashValue } = require('./known-issue-adjudication-utils');
const { validatePacket } = require('./validate-mercedes-amg-gt-adjudication');

const frozen = JSON.parse(fs.readFileSync(OUTPUT, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function row(packet, id) { return packet.rows.find((item) => item.id === id); }
function rehash(item) { item.proposalSha256 = hashValue(item.proposal); item.changedFields = Object.keys(item.proposal).filter((key) => hashValue(item.before[key]) !== hashValue(item.proposal[key])); }
function rejects(name, mutate, pattern) {
  test(name, () => { const packet = clone(frozen); mutate(packet); assert.match(validatePacket(packet, snapshot).join('\n'), pattern); });
}

test('frozen AMG GT packet passes', () => assert.deepEqual(validatePacket(clone(frozen), snapshot), []));
rejects('rejects title change', (packet) => { const item = row(packet, IDS.mount); item.proposal.title += ' revised'; rehash(item); }, /deterministic|immutable title/);
rejects('rejects year change', (packet) => { const item = row(packet, IDS.battery); item.proposal.years.push(2026); rehash(item); }, /deterministic|immutable years/);
rejects('rejects trim change', (packet) => { const item = row(packet, IDS.mount); item.proposal.trims = ['AMG GT']; rehash(item); }, /deterministic|immutable trims/);
rejects('rejects engine change', (packet) => { const item = row(packet, IDS.mount); item.proposal.engines = []; rehash(item); }, /deterministic|immutable engines/);
rejects('rejects archive', (packet) => { const item = row(packet, IDS.steering); item.proposal.status = 'archived'; rehash(item); }, /deterministic|immutable status|published status/);
rejects('rejects owner social proof', (packet) => { const item = row(packet, IDS.mount); item.proposal.description += ' 210+ owners have reported it.'; rehash(item); }, /deterministic|owner social proof/);
rejects('rejects commerce', (packet) => { const item = row(packet, IDS.mount); item.proposal.fixParts.push({ name: 'mount' }); rehash(item); }, /deterministic|commerce-free/);
rejects('rejects search citation', (packet) => { const item = row(packet, IDS.battery); item.proposal.citations[0].url = 'https://example.com/search?q=battery'; rehash(item); }, /deterministic|citation/);
rejects('rejects cluster converted to hold', (packet) => { const item = row(packet, IDS.cluster); item.action = 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy'; item.identityReviewRequired = true; }, /deterministic|identity verdict/);
rejects('rejects mount converted to retain', (packet) => { const item = row(packet, IDS.mount); item.action = 'retain_indexed_identity_and_accuracy_cleanup'; item.identityReviewRequired = false; }, /deterministic|identity verdict/);
rejects('rejects blocker removal', (packet) => { packet.applicationGate.blockerRecordIds = packet.applicationGate.blockerRecordIds.slice(1); }, /deterministic|blocker/);
rejects('rejects fabricated mount count', (packet) => { const item = row(packet, IDS.mount); item.proposal.reportCount = 210; rehash(item); }, /deterministic|fabricated report count/);
rejects('rejects platform 290 transferred to platform 190', (packet) => { const item = row(packet, IDS.mount); item.proposal.description = 'Platform 290 proves the same platform 190 mount failure.'; rehash(item); }, /deterministic|mount generation boundary/);
rejects('rejects battery cross-platform cause', (packet) => { const item = row(packet, IDS.battery); item.proposal.description = 'The same root cause applies from other models.'; rehash(item); }, /deterministic|battery extrapolation boundary/);
rejects('rejects recall population as owner count', (packet) => { const item = row(packet, IDS.cluster); item.proposal.description += ' 144,049 owners have reported this issue.'; rehash(item); }, /deterministic|owner social proof/);
rejects('rejects steering platform transfer', (packet) => { const item = row(packet, IDS.steering); item.proposal.description = 'The platform 190 bulletin establishes the 2024 platform 192 claim.'; rehash(item); }, /deterministic|steering generation boundary/);
rejects('rejects human approval', (packet) => { const item = row(packet, IDS.cluster); item.proposal.humanApproved = true; rehash(item); }, /deterministic|commerce-free/);
rejects('rejects related-link mutation', (packet) => { const item = row(packet, IDS.cluster); item.proposal.relatedIssueIds = []; rehash(item); }, /deterministic|immutable relatedIssueIds/);
rejects('rejects PDF page omission', (packet) => { packet.pdfSources.clusterRecall.visualPages = [19, 20]; }, /deterministic|PDF evidence manifest/);
