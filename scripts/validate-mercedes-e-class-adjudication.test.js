/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict'); const fs = require('node:fs'); const test = require('node:test');
const { IDS, OUTPUT, SNAPSHOT } = require('./build-mercedes-e-class-adjudication'); const { hashValue } = require('./known-issue-adjudication-utils'); const { validatePacket } = require('./validate-mercedes-e-class-adjudication');
const frozen = JSON.parse(fs.readFileSync(OUTPUT, 'utf8')); const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
function clone(value) { return JSON.parse(JSON.stringify(value)); } function row(packet, id) { return packet.rows.find((item) => item.id === id); }
function rehash(item) { item.proposalSha256 = hashValue(item.proposal); item.changedFields = Object.keys(item.proposal).filter((key) => hashValue(item.before[key]) !== hashValue(item.proposal[key])); }
function rejects(name, mutate, pattern) { test(name, () => { const packet = clone(frozen); mutate(packet); assert.match(validatePacket(packet, snapshot).join('\n'), pattern); }); }
test('frozen E-Class packet passes', () => assert.deepEqual(validatePacket(clone(frozen), snapshot), []));
rejects('rejects title change', (packet) => { const item = row(packet, IDS.hybrid48v); item.proposal.title += ' revised'; rehash(item); }, /deterministic|immutable title/);
rejects('rejects year change', (packet) => { const item = row(packet, IDS.balanceShaft); item.proposal.years = [2005, 2006, 2007]; rehash(item); }, /deterministic|immutable years/);
rejects('rejects trim change', (packet) => { const item = row(packet, IDS.fuelPump); item.proposal.trims = ['E450']; rehash(item); }, /deterministic|immutable trims/);
rejects('rejects engine change', (packet) => { const item = row(packet, IDS.crankSensor); item.proposal.engines = ['3.5L M276']; rehash(item); }, /deterministic|immutable engines/);
rejects('rejects archive', (packet) => { const item = row(packet, IDS.oilCooler); item.proposal.status = 'archived'; rehash(item); }, /deterministic|immutable status|published status/);
rejects('rejects owner social proof', (packet) => { const item = row(packet, IDS.conductorPlate); item.proposal.description += ' 2,400+ owners have reported it.'; rehash(item); }, /deterministic|owner social proof/);
rejects('rejects commerce', (packet) => { const item = row(packet, IDS.airmatic); item.proposal.fixParts.push({ partNumber: 'AS-3226' }); rehash(item); }, /deterministic|commerce-free/);
rejects('rejects search citation', (packet) => { const item = row(packet, IDS.crankSensor); item.proposal.citations[0].url = 'https://example.com/search?q=sensor'; rehash(item); }, /deterministic|citation/);
rejects('rejects COMAND retain converted to hold', (packet) => { const item = row(packet, IDS.comand); item.action = 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy'; item.identityReviewRequired = true; }, /deterministic|retain verdict/);
rejects('rejects fuel hold converted to retain', (packet) => { const item = row(packet, IDS.fuelPump); item.action = 'retain_indexed_identity_and_accuracy_cleanup'; item.identityReviewRequired = false; }, /deterministic|hold verdict/);
rejects('rejects blocker removal', (packet) => { packet.applicationGate.blockerRecordIds = packet.applicationGate.blockerRecordIds.slice(1); }, /deterministic|blocker/);
for (const [name, id, count] of [['conductor', IDS.conductorPlate, 2400], ['AIRMATIC', IDS.airmatic, 2100], ['COMAND', IDS.comand, 1600], ['crank', IDS.crankSensor, 1300], ['balance', IDS.balanceShaft, 2600], ['oil cooler', IDS.oilCooler, 1700]]) rejects(`rejects fabricated ${name} count`, (packet) => { const item = row(packet, id); item.proposal.reportCount = count; rehash(item); }, /deterministic|fabricated report count/);
rejects('rejects universal ISG transfer', (packet) => { const item = row(packet, IDS.hybrid48v); item.proposal.description = 'The bulletin proves every ISG fails.'; rehash(item); }, /deterministic|48V multiple-cause/);
rejects('rejects fuel 2024 transfer', (packet) => { const item = row(packet, IDS.fuelPump); item.proposal.description = 'Recall 23V445 proves all 2021-2024 delivery modules fail.'; rehash(item); }, /deterministic|fuel-pump recall/);
rejects('rejects MBUX camera transfer', (packet) => { const item = row(packet, IDS.mbux); item.proposal.description = 'Campaign 2022010008 proves rear-camera failure.'; rehash(item); }, /deterministic|MBUX navigation/);
rejects('rejects conductor-plate shortcut', (packet) => { const item = row(packet, IDS.conductorPlate); item.proposal.description = 'Replace the conductor plate before diagnostics.'; rehash(item); }, /deterministic|conductor-plate diagnostic/);
rejects('rejects AIRMATIC fitment transfer', (packet) => { const item = row(packet, IDS.airmatic); item.proposal.description = 'Arnott fits every W212.'; rehash(item); }, /deterministic|AIRMATIC fitment/);
rejects('rejects COMAND hardware transfer', (packet) => { const item = row(packet, IDS.comand); item.proposal.solution = 'Replace the hard drive and COMAND unit.'; rehash(item); }, /deterministic|COMAND software/);
rejects('rejects Bosch fitment transfer', (packet) => { const item = row(packet, IDS.crankSensor); item.proposal.description = 'Bosch 0261210302 fits every listed car.'; rehash(item); }, /deterministic|crank-sensor evidence/);
rejects('rejects balance-shaft 2011 transfer', (packet) => { const item = row(packet, IDS.balanceShaft); item.proposal.description = 'All 2005-2011 E350 vehicles qualify.'; rehash(item); }, /deterministic|balance-shaft scope/);
rejects('rejects oil-coolant mixing transfer', (packet) => { const item = row(packet, IDS.oilCooler); item.proposal.description = 'Communication 10166980 proves coolant-to-oil cross-contamination.'; rehash(item); }, /deterministic|OM642 oil-versus-coolant/);
rejects('rejects related-link mutation', (packet) => { const item = row(packet, IDS.crankSensor); item.proposal.relatedIssueIds = ['unauthorized']; rehash(item); }, /deterministic|immutable relatedIssueIds/);
rejects('rejects PDF page omission', (packet) => { packet.pdfSources.fuelPumpRecall.visualPages = [1]; }, /deterministic|PDF evidence manifest/);
rejects('rejects human approval', (packet) => { const item = row(packet, IDS.comand); item.proposal.humanApproved = true; rehash(item); }, /deterministic|commerce-free/);
