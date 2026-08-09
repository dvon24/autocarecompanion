/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { IDS, OUTPUT, SNAPSHOT } = require('./build-mercedes-glb-adjudication');
const { diffFields, hashValue } = require('./known-issue-adjudication-utils');
const { validatePacket } = require('./validate-mercedes-glb-adjudication');
const frozen = JSON.parse(fs.readFileSync(OUTPUT, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function item(packet, id = IDS.esp) { return packet.rows.find((row) => row.id === id); }
function rehash(row) { row.proposalSha256 = hashValue(row.proposal); row.changedFields = diffFields(row.before, row.proposal); }
function rejects(name, mutate, pattern = /deterministic/) { test(name, () => { const packet = clone(frozen); mutate(packet); assert.match(validatePacket(packet, snapshot).join('\n'), pattern); }); }

test('frozen GLB packet passes', () => assert.deepEqual(validatePacket(clone(frozen), snapshot), []));
rejects('rejects title change', (packet) => { item(packet).proposal.title += ' revised'; rehash(item(packet)); }, /deterministic|immutable title/);
rejects('rejects year change', (packet) => { item(packet).proposal.years = [2022]; rehash(item(packet)); }, /deterministic|immutable years/);
rejects('rejects trim change', (packet) => { item(packet, IDS.water).proposal.trims = []; rehash(item(packet, IDS.water)); }, /deterministic|immutable trims/);
rejects('rejects engine correction', (packet) => { item(packet, IDS.dct).proposal.engines = ['2.0L turbo I4 (M260)']; rehash(item(packet, IDS.dct)); }, /deterministic|immutable engines/);
rejects('rejects category change', (packet) => { item(packet).proposal.category = 'engine'; rehash(item(packet)); }, /deterministic|immutable category/);
rejects('rejects archive', (packet) => { item(packet).proposal.status = 'archived'; rehash(item(packet)); }, /deterministic|immutable status/);
rejects('rejects related-link change', (packet) => { item(packet).proposal.relatedIssueIds = ['fake-related-id']; rehash(item(packet)); }, /deterministic|immutable relatedIssueIds/);
rejects('rejects restored DCT count', (packet) => { item(packet, IDS.dct).proposal.reportCount = 800; rehash(item(packet, IDS.dct)); }, /deterministic|zero-count/);
rejects('rejects restored MBUX count', (packet) => { item(packet, IDS.mbux).proposal.reportCount = 600; rehash(item(packet, IDS.mbux)); }, /deterministic|zero-count/);
rejects('rejects zero social proof', (packet) => { item(packet).proposal.description += ' 0+ owners have reported this.'; rehash(item(packet)); }, /deterministic|owner social proof/);
rejects('rejects old social proof', (packet) => { item(packet).proposal.description += ' 400+ owners have reported this.'; rehash(item(packet)); }, /deterministic|owner social proof/);
rejects('rejects commerce', (packet) => { item(packet).proposal.fixParts.push({ partNumber: 'A1779008105' }); rehash(item(packet)); }, /deterministic|commerce-free/);
rejects('rejects human approval', (packet) => { item(packet).proposal.humanApproved = true; rehash(item(packet)); }, /deterministic|commerce-free/);
rejects('rejects search citation', (packet) => { item(packet).proposal.citations[0].url = 'https://example.com/search?q=glb'; rehash(item(packet)); }, /deterministic|citation/);
rejects('rejects ESP converted to hold', (packet) => { item(packet).action = 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy'; item(packet).identityReviewRequired = true; item(packet).identityConflict = 'x'; }, /deterministic|retain verdict/);
rejects('rejects eCall hold converted to retain', (packet) => { const row = item(packet, IDS.ecall); row.action = 'retain_indexed_identity_and_accuracy_cleanup'; row.identityReviewRequired = false; row.identityConflict = null; }, /deterministic|hold verdict/);
rejects('rejects blocker removal', (packet) => { packet.applicationGate.blockerRecordIds = []; }, /deterministic|blocker/);
rejects('rejects recall population as owner count', (packet) => { item(packet, IDS.camera).proposal.description += ' 15,787+ owners reported this.'; rehash(item(packet, IDS.camera)); }, /deterministic|owner social proof/);
rejects('rejects 2022 eCall expansion', (packet) => { item(packet, IDS.ecall).proposal.description = 'Recall 22V365 proves every 2022 GLB is affected.'; rehash(item(packet, IDS.ecall)); }, /deterministic|eCall scope/);
rejects('rejects ESP mechanism expansion', (packet) => { item(packet, IDS.esp).proposal.description = 'Every GLB ESP unit fails from water.'; rehash(item(packet, IDS.esp)); }, /deterministic|ESP evidence/);
rejects('rejects camera freeze relabeling', (packet) => { item(packet, IDS.camera).proposal.description = 'Recall 22V232 proves the image freezes.'; rehash(item(packet, IDS.camera)); }, /deterministic|camera evidence/);
rejects('rejects DCT engine fix in packet', (packet) => { item(packet, IDS.dct).proposal.description = 'M260 8G-DCT shudder is proven.'; rehash(item(packet, IDS.dct)); }, /deterministic|DCT evidence/);
rejects('rejects direct purchase instruction', (packet) => { item(packet, IDS.valve).proposal.solution = 'Buy a cylinder head.'; rehash(item(packet, IDS.valve)); }, /deterministic|commerce boundary/);
rejects('rejects PDF page drift', (packet) => { packet.pdfSources.cameraRecall.visualPages = [11, 13]; }, /deterministic|PDF evidence/);
