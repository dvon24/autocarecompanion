/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { IDS, OUTPUT, SNAPSHOT } = require('./build-mercedes-amg-gt-4-door-adjudication');
const { hashValue } = require('./known-issue-adjudication-utils');
const { validatePacket } = require('./validate-mercedes-amg-gt-4-door-adjudication');

const frozen = JSON.parse(fs.readFileSync(OUTPUT, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function row(packet, id) { return packet.rows.find((item) => item.id === id); }
function rehash(item) { item.proposalSha256 = hashValue(item.proposal); item.changedFields = Object.keys(item.proposal).filter((key) => hashValue(item.before[key]) !== hashValue(item.proposal[key])); }
function rejects(name, mutate, pattern) {
  test(name, () => { const packet = clone(frozen); mutate(packet); assert.match(validatePacket(packet, snapshot).join('\n'), pattern); });
}

test('frozen AMG GT 4-Door packet passes', () => assert.deepEqual(validatePacket(clone(frozen), snapshot), []));
rejects('rejects title change', (packet) => { const item = row(packet, IDS.battery48v); item.proposal.title += ' revised'; rehash(item); }, /deterministic|immutable title/);
rejects('rejects year change', (packet) => { const item = row(packet, IDS.suspension); item.proposal.years.push(2026); rehash(item); }, /deterministic|immutable years/);
rejects('rejects trim change', (packet) => { const item = row(packet, IDS.suspension); item.proposal.trims = ['AMG GT 63']; rehash(item); }, /deterministic|immutable trims/);
rejects('rejects engine change', (packet) => { const item = row(packet, IDS.battery48v); item.proposal.engines = []; rehash(item); }, /deterministic|immutable engines/);
rejects('rejects archive', (packet) => { const item = row(packet, IDS.rearSteering); item.proposal.status = 'archived'; rehash(item); }, /deterministic|immutable status|published status/);
rejects('rejects owner social proof', (packet) => { const item = row(packet, IDS.battery48v); item.proposal.description += ' 220+ owners have reported it.'; rehash(item); }, /deterministic|owner social proof/);
rejects('rejects commerce', (packet) => { const item = row(packet, IDS.suspension); item.proposal.fixParts.push({ name: 'compressor' }); rehash(item); }, /deterministic|commerce-free/);
rejects('rejects search citation', (packet) => { const item = row(packet, IDS.suspension); item.proposal.citations[0].url = 'https://example.com/search?q=compressor'; rehash(item); }, /deterministic|citation/);
rejects('rejects rear steering converted to hold', (packet) => { const item = row(packet, IDS.rearSteering); item.action = 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy'; item.identityReviewRequired = true; }, /deterministic|identity verdict/);
rejects('rejects battery converted to retain', (packet) => { const item = row(packet, IDS.battery48v); item.action = 'retain_indexed_identity_and_accuracy_cleanup'; item.identityReviewRequired = false; }, /deterministic|identity verdict/);
rejects('rejects blocker removal', (packet) => { packet.applicationGate.blockerRecordIds = packet.applicationGate.blockerRecordIds.slice(1); }, /deterministic|blocker/);
rejects('rejects fabricated 48V count', (packet) => { const item = row(packet, IDS.battery48v); item.proposal.reportCount = 220; rehash(item); }, /deterministic|fabricated report count/);
rejects('rejects fabricated suspension count', (packet) => { const item = row(packet, IDS.suspension); item.proposal.reportCount = 280; rehash(item); }, /deterministic|fabricated report count/);
rejects('rejects fabricated steering count', (packet) => { const item = row(packet, IDS.rearSteering); item.proposal.reportCount = 180; rehash(item); }, /deterministic|fabricated report count/);
rejects('rejects universal 48V replacement', (packet) => { const item = row(packet, IDS.battery48v); item.proposal.solution = 'Replace the 48V lithium-ion battery pack.'; rehash(item); }, /deterministic|48V evidence boundary/);
rejects('rejects unsupported compressor mechanism', (packet) => { const item = row(packet, IDS.suspension); item.proposal.description = 'The compressor overworks and burns out.'; rehash(item); }, /deterministic|suspension absence boundary/);
rejects('rejects rear-steering hardware overstatement', (packet) => { const item = row(packet, IDS.rearSteering); item.proposal.description = 'The actuator fails or the control module loses communication.'; rehash(item); }, /deterministic|rear-steering evidence boundary/);
rejects('rejects related-link mutation', (packet) => { const item = row(packet, IDS.rearSteering); item.proposal.relatedIssueIds = []; rehash(item); }, /deterministic|immutable relatedIssueIds/);
rejects('rejects PDF page omission', (packet) => { packet.pdfSources.battery48vBulletin.visualPages = [1, 2, 3]; }, /deterministic|PDF evidence manifest/);
