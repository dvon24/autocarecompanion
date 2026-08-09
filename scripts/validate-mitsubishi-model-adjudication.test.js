/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const test = require('node:test');
const { CONTRACTS } = require('./mitsubishi-model-adjudication-contracts');
const { diffFields, hashValue } = require('./known-issue-adjudication-utils');
const { loadModel, validatePacket } = require('./validate-mitsubishi-model-adjudication');
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function item(packet, id) { return packet.rows.find((row) => row.id === id); }
function rehash(row) { row.proposalSha256 = hashValue(row.proposal); row.changedFields = diffFields(row.before, row.proposal); }

for (const model of Object.keys(CONTRACTS)) {
  const { contract, packet: frozen, snapshot } = loadModel(model);
  const firstId = contract.allIds[0];
  const countId = contract.reportCountCleanupIds[0] || firstId;
  function rejects(name, mutate, pattern = /deterministic/) {
    test(`${model}: ${name}`, () => { const packet = clone(frozen); mutate(packet); assert.match(validatePacket(contract, packet, snapshot).join('\n'), pattern); });
  }
  test(`${model}: frozen packet passes`, () => assert.deepEqual(validatePacket(contract, clone(frozen), snapshot), []));
  rejects('rejects title change', (packet) => { item(packet, firstId).proposal.title += ' revised'; rehash(item(packet, firstId)); }, /deterministic|immutable title/);
  rejects('rejects year change', (packet) => { item(packet, firstId).proposal.years = [1900]; rehash(item(packet, firstId)); }, /deterministic|immutable years/);
  rejects('rejects category change', (packet) => { const row = item(packet, firstId); row.proposal.category = row.proposal.category === 'engine' ? 'transmission' : 'engine'; rehash(row); }, /deterministic|immutable category/);
  rejects('rejects severity change', (packet) => { item(packet, firstId).proposal.severity = 'critical'; rehash(item(packet, firstId)); }, /deterministic|immutable severity|noncanonical/);
  rejects('rejects archive', (packet) => { item(packet, firstId).proposal.status = 'archived'; rehash(item(packet, firstId)); }, /deterministic|immutable status/);
  rejects('rejects owner-count invention', (packet) => { item(packet, countId).proposal.reportCount = 1; rehash(item(packet, countId)); }, /deterministic|owner data/);
  rejects('rejects zero social proof', (packet) => { item(packet, firstId).proposal.description += ' 0+ owners have reported this.'; rehash(item(packet, firstId)); }, /deterministic|owner social proof/);
  rejects('rejects commerce', (packet) => { item(packet, firstId).proposal.fixParts.push({ partNumber: 'fake' }); rehash(item(packet, firstId)); }, /deterministic|commerce-free/);
  rejects('rejects search citation', (packet) => { item(packet, firstId).proposal.citations[0].url = 'https://example.com/search?q=mitsubishi'; rehash(item(packet, firstId)); }, /deterministic|citation/);
  rejects('rejects verdict change', (packet) => { const row = item(packet, firstId); row.action = 'retain_indexed_identity_and_accuracy_cleanup'; row.identityReviewRequired = false; row.identityConflict = null; }, /deterministic|verdict/);
  rejects('rejects blocker removal', (packet) => { packet.applicationGate.blockerRecordIds = []; }, /deterministic|blocker/);
  rejects('rejects DTC insertion', (packet) => { item(packet, firstId).proposal.dtcCodes.push('P9999'); rehash(item(packet, firstId)); }, /deterministic|DTC/);
  rejects('rejects source replacement', (packet) => {
    const pdfKey = Object.keys(packet.pdfSources)[0];
    const otherKey = Object.keys(packet.otherSources).find((key) => key !== 'datasets') || Object.keys(packet.otherSources)[0];
    if (pdfKey) packet.pdfSources[pdfKey].url = 'https://example.com/fake.pdf';
    else packet.otherSources[otherKey].url = 'https://example.com/fake';
  }, /deterministic|source evidence/);
}
