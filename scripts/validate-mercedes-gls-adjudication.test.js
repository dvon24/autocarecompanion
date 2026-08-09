/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { IDS, OUTPUT, SNAPSHOT } = require('./build-mercedes-gls-adjudication');
const { diffFields, hashValue } = require('./known-issue-adjudication-utils');
const { validatePacket } = require('./validate-mercedes-gls-adjudication');
const frozen = JSON.parse(fs.readFileSync(OUTPUT, 'utf8')); const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function item(packet, id = IDS.ground) { return packet.rows.find((row) => row.id === id); }
function rehash(row) { row.proposalSha256 = hashValue(row.proposal); row.changedFields = diffFields(row.before, row.proposal); }
function rejects(name, mutate, pattern = /deterministic/) { test(name, () => { const packet = clone(frozen); mutate(packet); assert.match(validatePacket(packet, snapshot).join('\n'), pattern); }); }
test('frozen GLS packet passes', () => assert.deepEqual(validatePacket(clone(frozen), snapshot), []));
rejects('rejects title change', (packet) => { item(packet).proposal.title += ' revised'; rehash(item(packet)); }, /deterministic|immutable title/);
rejects('rejects year change', (packet) => { item(packet).proposal.years = [2023]; rehash(item(packet)); }, /deterministic|immutable years/);
rejects('rejects trim change', (packet) => { item(packet).proposal.trims = []; rehash(item(packet)); }, /deterministic|immutable trims/);
rejects('rejects engine change', (packet) => { item(packet, IDS.stall).proposal.engines = []; rehash(item(packet, IDS.stall)); }, /deterministic|immutable engines/);
rejects('rejects category change', (packet) => { item(packet).proposal.category = 'engine'; rehash(item(packet)); }, /deterministic|immutable category/);
rejects('rejects severity change', (packet) => { item(packet).proposal.severity = 'medium'; rehash(item(packet)); }, /deterministic|immutable severity/);
rejects('rejects archive', (packet) => { item(packet).proposal.status = 'archived'; rehash(item(packet)); }, /deterministic|immutable status/);
rejects('rejects related-link change', (packet) => { item(packet).proposal.relatedIssueIds = ['fake']; rehash(item(packet)); }, /deterministic|immutable relatedIssueIds/);
rejects('rejects restored owner count', (packet) => { item(packet, IDS.airmatic).proposal.reportCount = 1500; rehash(item(packet, IDS.airmatic)); }, /deterministic|zero-count/);
rejects('rejects zero social proof', (packet) => { item(packet).proposal.description += ' 0+ owners have reported this.'; rehash(item(packet)); }, /deterministic|owner social proof/);
rejects('rejects old social proof', (packet) => { item(packet, IDS.harshShift).proposal.description += ' 1,100+ owners have reported this.'; rehash(item(packet, IDS.harshShift)); }, /deterministic|owner social proof/);
rejects('rejects commerce', (packet) => { item(packet).proposal.fixParts.push({ partNumber: 'fake' }); rehash(item(packet)); }, /deterministic|commerce-free/);
rejects('rejects human approval', (packet) => { item(packet).proposal.humanApproved = true; rehash(item(packet)); }, /deterministic|commerce-free/);
rejects('rejects search citation', (packet) => { item(packet).proposal.citations[0].url = 'https://example.com/search?q=gls'; rehash(item(packet)); }, /deterministic|citation/);
rejects('rejects retain converted to hold', (packet) => { const row = item(packet, IDS.stall); row.action = 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy'; row.identityReviewRequired = true; row.identityConflict = 'fake'; }, /deterministic|retain verdict/);
rejects('rejects hold converted to retain', (packet) => { const row = item(packet); row.action = 'retain_indexed_identity_and_accuracy_cleanup'; row.identityReviewRequired = false; row.identityConflict = null; }, /deterministic|hold verdict/);
rejects('rejects blocker removal', (packet) => { packet.applicationGate.blockerRecordIds = []; }, /deterministic|blocker/);
rejects('rejects ground recall expanded to 2024 GLS', (packet) => { item(packet).proposal.description = 'Recall 24V207 covers every 2024 GLS.'; rehash(item(packet)); }, /deterministic|ground-recall scope/);
rejects('rejects stall mechanism expansion', (packet) => { item(packet, IDS.stall).proposal.description = 'All GLS transmissions stall.'; rehash(item(packet, IDS.stall)); }, /deterministic|stall-recall evidence/);
rejects('rejects MBUX recall expansion', (packet) => { item(packet, IDS.mbux).proposal.description = 'All model years freeze.'; rehash(item(packet, IDS.mbux)); }, /deterministic|MBUX recall/);
rejects('rejects oil vibration relabeled bearing lockup', (packet) => { item(packet, IDS.transfer).proposal.description = 'Mercedes proves bearing lock-up.'; rehash(item(packet, IDS.transfer)); }, /deterministic|transfer-case evidence/);
rejects('rejects unsupported M256 diagnosis', (packet) => { item(packet, IDS.oil).proposal.description = 'Piston rings always fail.'; rehash(item(packet, IDS.oil)); }, /deterministic|M256 evidence/);
rejects('rejects unsupported OM656 fuel diagnosis', (packet) => { item(packet, IDS.fuelPump).proposal.description = 'Every CP4 sheds metal.'; rehash(item(packet, IDS.fuelPump)); }, /deterministic|OM656 fuel/);
rejects('rejects combined emissions diagnosis', (packet) => { item(packet, IDS.emissions).proposal.description = 'EGR, DPF and SCR always fail together.'; rehash(item(packet, IDS.emissions)); }, /deterministic|OM656 emissions/);
rejects('rejects sleep-mode drain assertion', (packet) => { item(packet, IDS.battery).proposal.description = 'A sleep bug drains both batteries.'; rehash(item(packet, IDS.battery)); }, /deterministic|48V battery/);
rejects('rejects 2024 shift evidence moved into old years', (packet) => { item(packet, IDS.harshShift).proposal.description = 'The 2024 bulletin proves 2017-2023.'; rehash(item(packet, IDS.harshShift)); }, /deterministic|harsh-shift evidence/);
rejects('rejects CAIRS replacement advice', (packet) => { item(packet, IDS.airmatic).proposal.description = 'Replace the CAIRS unit.'; rehash(item(packet, IDS.airmatic)); }, /deterministic|AIRMATIC evidence/);
rejects('rejects sunroof gesture record relabeled leak', (packet) => { item(packet, IDS.sunroof).proposal.description = 'Gesture records prove drain leaks.'; rehash(item(packet, IDS.sunroof)); }, /deterministic|sunroof evidence/);
rejects('rejects universal part sale', (packet) => { item(packet).proposal.solution = 'Buy the recalled nut.'; rehash(item(packet)); }, /deterministic|commerce boundary/);
rejects('rejects incomplete PDF visual coverage', (packet) => { packet.pdfSources.mbuxRecall.visualPages.pop(); }, /deterministic|PDF visual-review/);
