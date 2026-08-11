/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const test = require('node:test');
const contract = require('./ram-1500-adjudication-contract');
const { diffFields, hashValue } = require('./known-issue-adjudication-utils');
const { load, validatePacket } = require('./validate-ram-1500-adjudication');

function clone(value) { return JSON.parse(JSON.stringify(value)); }
function item(packet, id) { return packet.rows.find((row) => row.id === id); }
function rehash(row) { row.proposalSha256 = hashValue(row.proposal); row.changedFields = diffFields(row.before, row.proposal); }

const { packet: frozen, snapshot, liveRecallInventory } = load();
const firstId = contract.allIds[0];
const countId = contract.reportCountCleanupIds[0];
const verdictId = contract.allIds.find((id) => !contract.retainedIds.includes(id));
const ramCaseId = frozen.rows.find((row) => row.frozenMake === 'Ram').id;

function rejects(name, mutate, pattern = /deterministic/) {
  test(name, () => {
    const packet = clone(frozen);
    mutate(packet);
    assert.match(validatePacket(packet, snapshot, liveRecallInventory).join('\n'), pattern);
  });
}

test('RAM 1500: frozen packet passes', () => assert.deepEqual(validatePacket(clone(frozen), snapshot, liveRecallInventory), []));
rejects('RAM 1500: rejects title change', (packet) => { item(packet, firstId).proposal.title += ' revised'; rehash(item(packet, firstId)); }, /deterministic|immutable title/);
rejects('RAM 1500: rejects make casing normalization', (packet) => { item(packet, ramCaseId).proposal.make = 'RAM'; rehash(item(packet, ramCaseId)); }, /deterministic|immutable make/);
rejects('RAM 1500: rejects year change', (packet) => { item(packet, firstId).proposal.years = [1900]; rehash(item(packet, firstId)); }, /deterministic|immutable years/);
rejects('RAM 1500: rejects trim change', (packet) => { item(packet, firstId).proposal.trims = ['invented']; rehash(item(packet, firstId)); }, /deterministic|immutable trims/);
rejects('RAM 1500: rejects category change', (packet) => { const row = item(packet, firstId); row.proposal.category = row.proposal.category === 'engine' ? 'transmission' : 'engine'; rehash(row); }, /deterministic|immutable category/);
rejects('RAM 1500: rejects severity change', (packet) => { item(packet, firstId).proposal.severity = 'critical'; rehash(item(packet, firstId)); }, /deterministic|immutable severity|noncanonical/);
rejects('RAM 1500: rejects archive', (packet) => { item(packet, firstId).proposal.status = 'archived'; rehash(item(packet, firstId)); }, /deterministic|immutable status/);
rejects('RAM 1500: rejects owner-count invention', (packet) => { item(packet, countId).proposal.reportCount = 1; rehash(item(packet, countId)); }, /deterministic|owner data/);
rejects('RAM 1500: rejects zero social proof', (packet) => { item(packet, firstId).proposal.description += ' 0+ owners have reported this.'; rehash(item(packet, firstId)); }, /deterministic|owner social proof/);
rejects('RAM 1500: rejects commerce', (packet) => { item(packet, firstId).proposal.fixParts.push({ partNumber: 'fake' }); rehash(item(packet, firstId)); }, /deterministic|commerce-free/);
rejects('RAM 1500: rejects search citation', (packet) => { item(packet, firstId).proposal.citations[0].url = 'https://example.com/search?q=ram'; rehash(item(packet, firstId)); }, /deterministic|citation/);
rejects('RAM 1500: rejects verdict change', (packet) => { const row = item(packet, verdictId); row.action = 'retain_indexed_identity_and_accuracy_cleanup'; row.identityReviewRequired = false; row.identityConflict = null; }, /deterministic|verdict/);
rejects('RAM 1500: rejects blocker removal', (packet) => { packet.applicationGate.blockerRecordIds = []; }, /deterministic|blocker/);
rejects('RAM 1500: rejects DTC insertion', (packet) => { item(packet, firstId).proposal.dtcCodes.push('P9999'); rehash(item(packet, firstId)); }, /deterministic|DTC/);
rejects('RAM 1500: rejects live campaign removal', (packet) => { packet.recallInventory.newlyObservedCampaigns = []; }, /deterministic|new live campaign/);
rejects('RAM 1500: rejects source replacement', (packet) => { packet.otherSources.datasets.url = 'https://example.com/fake'; }, /deterministic|source evidence/);
