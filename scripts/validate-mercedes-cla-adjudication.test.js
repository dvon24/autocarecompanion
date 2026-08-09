/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { IDS, OUTPUT, SNAPSHOT } = require('./build-mercedes-cla-adjudication');
const { hashValue } = require('./known-issue-adjudication-utils');
const { validatePacket } = require('./validate-mercedes-cla-adjudication');
const frozen = JSON.parse(fs.readFileSync(OUTPUT, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function row(packet, id) { return packet.rows.find((item) => item.id === id); }
function rehash(item) { item.proposalSha256 = hashValue(item.proposal); item.changedFields = Object.keys(item.proposal).filter((key) => hashValue(item.before[key]) !== hashValue(item.proposal[key])); }
function rejects(name, mutate, pattern) { test(name, () => { const packet = clone(frozen); mutate(packet); assert.match(validatePacket(packet, snapshot).join('\n'), pattern); }); }
test('frozen CLA packet passes', () => assert.deepEqual(validatePacket(clone(frozen), snapshot), []));
rejects('rejects title change', (packet) => { const item = row(packet, IDS.roof); item.proposal.title += ' revised'; rehash(item); }, /deterministic|immutable title/);
rejects('rejects year change', (packet) => { const item = row(packet, IDS.comand); item.proposal.years.push(2020); rehash(item); }, /deterministic|immutable years/);
rejects('rejects trim change', (packet) => { const item = row(packet, IDS.rearBrakes); item.proposal.trims = ['CLA 250']; rehash(item); }, /deterministic|immutable trims/);
rejects('rejects engine change', (packet) => { const item = row(packet, IDS.camshaft); item.proposal.engines = ['M270 2.0L turbo']; rehash(item); }, /deterministic|immutable engines/);
rejects('rejects archive', (packet) => { const item = row(packet, IDS.dct); item.proposal.status = 'archived'; rehash(item); }, /deterministic|immutable status|published status/);
rejects('rejects owner social proof', (packet) => { const item = row(packet, IDS.comand); item.proposal.description += ' 1,000+ owners have reported it.'; rehash(item); }, /deterministic|owner social proof/);
rejects('rejects commerce', (packet) => { const item = row(packet, IDS.turboOil); item.proposal.fixParts.push({ name: 'oil line' }); rehash(item); }, /deterministic|commerce-free/);
rejects('rejects search citation', (packet) => { const item = row(packet, IDS.waterLeak); item.proposal.citations[0].url = 'https://example.com/search?q=leak'; rehash(item); }, /deterministic|citation/);
rejects('rejects roof retain converted to hold', (packet) => { const item = row(packet, IDS.roof); item.action = 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy'; item.identityReviewRequired = true; }, /deterministic|identity verdict/);
rejects('rejects held DCT converted to retain', (packet) => { const item = row(packet, IDS.dct); item.action = 'retain_indexed_identity_and_accuracy_cleanup'; item.identityReviewRequired = false; }, /deterministic|identity verdict/);
rejects('rejects blocker removal', (packet) => { packet.applicationGate.blockerRecordIds = packet.applicationGate.blockerRecordIds.slice(1); }, /deterministic|blocker/);
rejects('rejects fabricated COMAND count', (packet) => { const item = row(packet, IDS.comand); item.proposal.reportCount = 1000; rehash(item); }, /deterministic|fabricated report count/);
rejects('rejects fabricated strut count', (packet) => { const item = row(packet, IDS.strut); item.proposal.reportCount = 700; rehash(item); }, /deterministic|fabricated report count/);
rejects('rejects fabricated turbo count', (packet) => { const item = row(packet, IDS.turboOil); item.proposal.reportCount = 900; rehash(item); }, /deterministic|fabricated report count/);
rejects('rejects COMAND unit replacement', (packet) => { const item = row(packet, IDS.comand); item.proposal.solution = 'Replace the COMAND head unit.'; rehash(item); }, /deterministic|COMAND evidence|commerce boundary/);
rejects('rejects roof recall scope removal', (packet) => { const item = row(packet, IDS.roof); item.proposal.description = 'Every 2014-2020 CLA needs a new roof panel.'; rehash(item); }, /deterministic|roof recall/);
rejects('rejects camshaft engine extrapolation', (packet) => { const item = row(packet, IDS.camshaft); item.proposal.description = 'Recall 15V-662 proves M270 and M274 CLA engines are affected.'; rehash(item); }, /deterministic|camshaft engine-scope/);
rejects('rejects brake caliper transfer', (packet) => { const item = row(packet, IDS.rearBrakes); item.proposal.description = 'The bulletin proves sticking rear calipers.'; rehash(item); }, /deterministic|rear-brake evidence/);
rejects('rejects strut generation transfer', (packet) => { const item = row(packet, IDS.strut); item.proposal.description = 'All 2014-2023 CLA strut mounts fail.'; rehash(item); }, /deterministic|strut generation/);
rejects('rejects turbo gasket transfer', (packet) => { const item = row(packet, IDS.turboOil); item.proposal.description = '10205154 proves the turbo return gasket fails.'; rehash(item); }, /deterministic|turbo-oil evidence/);
rejects('rejects related-link mutation', (packet) => { const item = row(packet, IDS.auxiliaryBattery); item.proposal.relatedIssueIds = ['unauthorized']; rehash(item); }, /deterministic|immutable relatedIssueIds/);
rejects('rejects PDF page omission', (packet) => { packet.pdfSources.roofRecall2023.visualPages = [1, 2]; }, /deterministic|PDF evidence manifest/);
rejects('rejects human approval', (packet) => { const item = row(packet, IDS.roof); item.proposal.humanApproved = true; rehash(item); }, /deterministic|commerce-free/);
