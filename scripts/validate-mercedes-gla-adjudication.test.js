/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { IDS, OUTPUT, SNAPSHOT } = require('./build-mercedes-gla-adjudication');
const { diffFields, hashValue } = require('./known-issue-adjudication-utils');
const { validatePacket } = require('./validate-mercedes-gla-adjudication');
const frozen = JSON.parse(fs.readFileSync(OUTPUT, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function item(packet, id = IDS.battery) { return packet.rows.find((row) => row.id === id); }
function rehash(row) { row.proposalSha256 = hashValue(row.proposal); row.changedFields = diffFields(row.before, row.proposal); }
function rejects(name, mutate, pattern) { test(name, () => { const packet = clone(frozen); mutate(packet); assert.match(validatePacket(packet, snapshot).join('\n'), pattern); }); }

test('frozen GLA packet passes', () => assert.deepEqual(validatePacket(clone(frozen), snapshot), []));
rejects('rejects title change', (packet) => { item(packet).proposal.title += ' revised'; rehash(item(packet)); }, /deterministic|immutable title/);
rejects('rejects year change', (packet) => { item(packet).proposal.years = [2021]; rehash(item(packet)); }, /deterministic|immutable years/);
rejects('rejects trim change', (packet) => { item(packet, IDS.dct).proposal.trims = []; rehash(item(packet, IDS.dct)); }, /deterministic|immutable trims/);
rejects('rejects engine change', (packet) => { item(packet, IDS.timing).proposal.engines = []; rehash(item(packet, IDS.timing)); }, /deterministic|immutable engines/);
rejects('rejects category change', (packet) => { item(packet).proposal.category = 'engine'; rehash(item(packet)); }, /deterministic|immutable category/);
rejects('rejects archive', (packet) => { item(packet).proposal.status = 'archived'; rehash(item(packet)); }, /deterministic|immutable status/);
rejects('rejects related-link change', (packet) => { item(packet).proposal.relatedIssueIds = ['fake-related-id']; rehash(item(packet)); }, /deterministic|immutable relatedIssueIds/);
rejects('rejects restored owner count', (packet) => { item(packet, IDS.transfer).proposal.reportCount = 500; rehash(item(packet, IDS.transfer)); }, /deterministic|zero-count/);
rejects('rejects zero social proof', (packet) => { item(packet).proposal.description += ' 0+ owners have reported this.'; rehash(item(packet)); }, /deterministic|owner social proof/);
rejects('rejects old social proof', (packet) => { item(packet).proposal.description += ' 500+ owners have reported this.'; rehash(item(packet)); }, /deterministic|owner social proof/);
rejects('rejects commerce', (packet) => { item(packet).proposal.fixParts.push({ partNumber: 'battery' }); rehash(item(packet)); }, /deterministic|commerce-free/);
rejects('rejects human approval', (packet) => { item(packet).proposal.humanApproved = true; rehash(item(packet)); }, /deterministic|commerce-free/);
rejects('rejects search citation', (packet) => { item(packet).proposal.citations[0].url = 'https://example.com/search?q=gla'; rehash(item(packet)); }, /deterministic|citation/);
rejects('rejects battery converted to hold', (packet) => { item(packet).action = 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy'; item(packet).identityReviewRequired = true; item(packet).identityConflict = 'x'; }, /deterministic|retain verdict/);
rejects('rejects MBUX hold converted to retain', (packet) => { const row = item(packet, IDS.infotainment); row.action = 'retain_indexed_identity_and_accuracy_cleanup'; row.identityReviewRequired = false; row.identityConflict = null; }, /deterministic|hold verdict/);
rejects('rejects blocker removal', (packet) => { packet.applicationGate.blockerRecordIds = []; }, /deterministic|blocker/);
rejects('rejects recall population as owner count', (packet) => { item(packet, IDS.infotainment).proposal.description += ' 22,659+ owners reported this.'; rehash(item(packet, IDS.infotainment)); }, /deterministic|owner social proof/);
rejects('rejects COMAND recall expansion', (packet) => { item(packet, IDS.infotainment).proposal.description = 'Recall 21V354 proves COMAND fails on every 2015-2023 GLA.'; rehash(item(packet, IDS.infotainment)); }, /deterministic|MBUX evidence/);
rejects('rejects shattering recall expansion', (packet) => { item(packet, IDS.roof).proposal.description = 'Recall 21V197 proves panoramic glass spontaneously shatters.'; rehash(item(packet, IDS.roof)); }, /deterministic|roof evidence/);
rejects('rejects rear differential to transfer relabeling', (packet) => { item(packet, IDS.transfer).proposal.description = '11027781 proves the transfer case whines.'; rehash(item(packet, IDS.transfer)); }, /deterministic|transfer evidence/);
rejects('rejects generic coolant line promoted to turbo', (packet) => { item(packet, IDS.turboCoolant).proposal.description = '10199660 proves the turbo coolant line fails.'; rehash(item(packet, IDS.turboCoolant)); }, /deterministic|turbo coolant evidence/);
rejects('rejects direct purchase instruction', (packet) => { item(packet, IDS.waterPump).proposal.solution = 'Buy a new water pump.'; rehash(item(packet, IDS.waterPump)); }, /deterministic|commerce boundary/);
rejects('rejects PDF page drift', (packet) => { packet.pdfSources.mbuxRecall.visualPages = [14, 17]; }, /deterministic|PDF evidence/);
