/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { IDS, OUTPUT, SNAPSHOT } = require('./build-mercedes-glc-adjudication');
const { diffFields, hashValue } = require('./known-issue-adjudication-utils');
const { validatePacket } = require('./validate-mercedes-glc-adjudication');
const frozen = JSON.parse(fs.readFileSync(OUTPUT, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function item(packet, id = IDS.fuel) { return packet.rows.find((row) => row.id === id); }
function rehash(row) { row.proposalSha256 = hashValue(row.proposal); row.changedFields = diffFields(row.before, row.proposal); }
function rejects(name, mutate, pattern = /deterministic/) { test(name, () => { const packet = clone(frozen); mutate(packet); assert.match(validatePacket(packet, snapshot).join('\n'), pattern); }); }

test('frozen GLC packet passes', () => assert.deepEqual(validatePacket(clone(frozen), snapshot), []));
rejects('rejects title change', (packet) => { item(packet).proposal.title += ' revised'; rehash(item(packet)); }, /deterministic|immutable title/);
rejects('rejects year change', (packet) => { item(packet).proposal.years = [2022]; rehash(item(packet)); }, /deterministic|immutable years/);
rejects('rejects trim change', (packet) => { item(packet, IDS.pcv).proposal.trims = []; rehash(item(packet, IDS.pcv)); }, /deterministic|immutable trims/);
rejects('rejects engine change', (packet) => { item(packet, IDS.hybrid).proposal.engines = []; rehash(item(packet, IDS.hybrid)); }, /deterministic|immutable engines/);
rejects('rejects category change', (packet) => { item(packet).proposal.category = 'engine'; rehash(item(packet)); }, /deterministic|immutable category/);
rejects('rejects archive', (packet) => { item(packet).proposal.status = 'archived'; rehash(item(packet)); }, /deterministic|immutable status/);
rejects('rejects related-link change', (packet) => { item(packet).proposal.relatedIssueIds = ['fake-related-id']; rehash(item(packet)); }, /deterministic|immutable relatedIssueIds/);
rejects('rejects restored transmission count', (packet) => { item(packet, IDS.transmission).proposal.reportCount = 2000; rehash(item(packet, IDS.transmission)); }, /deterministic|zero-count/);
rejects('rejects restored roof count', (packet) => { item(packet, IDS.roof).proposal.reportCount = 1100; rehash(item(packet, IDS.roof)); }, /deterministic|zero-count/);
rejects('rejects zero social proof', (packet) => { item(packet).proposal.description += ' 0+ owners have reported this.'; rehash(item(packet)); }, /deterministic|owner social proof/);
rejects('rejects old social proof', (packet) => { item(packet).proposal.description += ' 2,000+ owners have reported this.'; rehash(item(packet)); }, /deterministic|owner social proof/);
rejects('rejects commerce', (packet) => { item(packet).proposal.fixParts.push({ partNumber: 'A2544702300' }); rehash(item(packet)); }, /deterministic|commerce-free/);
rejects('rejects human approval', (packet) => { item(packet).proposal.humanApproved = true; rehash(item(packet)); }, /deterministic|commerce-free/);
rejects('rejects search citation', (packet) => { item(packet).proposal.citations[0].url = 'https://example.com/search?q=glc'; rehash(item(packet)); }, /deterministic|citation/);
rejects('rejects fuel converted to hold', (packet) => { item(packet).action = 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy'; item(packet).identityReviewRequired = true; item(packet).identityConflict = 'x'; }, /deterministic|retain verdict/);
rejects('rejects PCV hold converted to retain', (packet) => { const row = item(packet, IDS.pcv); row.action = 'retain_indexed_identity_and_accuracy_cleanup'; row.identityReviewRequired = false; row.identityConflict = null; }, /deterministic|hold verdict/);
rejects('rejects blocker removal', (packet) => { packet.applicationGate.blockerRecordIds = []; }, /deterministic|blocker/);
rejects('rejects recall population as owner count', (packet) => { item(packet, IDS.fuel).proposal.description += ' 43,257+ owners reported this.'; rehash(item(packet, IDS.fuel)); }, /deterministic|owner social proof/);
rejects('rejects ISG inference', (packet) => { item(packet, IDS.hybrid).proposal.description = 'Mercedes proves the ISG fails.'; rehash(item(packet, IDS.hybrid)); }, /deterministic|48V evidence/);
rejects('rejects harness replacement inference', (packet) => { item(packet, IDS.pcv).proposal.description = 'Oil requires engine harness replacement.'; rehash(item(packet, IDS.pcv)); }, /deterministic|PCV evidence/);
rejects('rejects front squeal relabeled rear wear', (packet) => { item(packet, IDS.brake).proposal.description = '10135720 proves rear wear.'; rehash(item(packet, IDS.brake)); }, /deterministic|brake evidence/);
rejects('rejects transfer vibration relabeled shift', (packet) => { item(packet, IDS.transmission).proposal.description = '11028270 proves transmission failure.'; rehash(item(packet, IDS.transmission)); }, /deterministic|transmission evidence/);
rejects('rejects Arnott recommendation', (packet) => { item(packet, IDS.suspension).proposal.solution = 'Buy Arnott P-3508.'; rehash(item(packet, IDS.suspension)); }, /deterministic|commerce boundary/);
rejects('rejects PDF page drift', (packet) => { packet.pdfSources.fuelRecall.visualPages = [3, 11, 14]; }, /deterministic|PDF evidence/);
