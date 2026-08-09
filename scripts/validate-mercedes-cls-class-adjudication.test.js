/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict'); const fs = require('node:fs'); const test = require('node:test');
const { IDS, OUTPUT, SNAPSHOT } = require('./build-mercedes-cls-class-adjudication'); const { hashValue } = require('./known-issue-adjudication-utils'); const { validatePacket } = require('./validate-mercedes-cls-class-adjudication');
const frozen = JSON.parse(fs.readFileSync(OUTPUT, 'utf8')); const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
function clone(value) { return JSON.parse(JSON.stringify(value)); } function row(packet, id) { return packet.rows.find((item) => item.id === id); }
function rehash(item) { item.proposalSha256 = hashValue(item.proposal); item.changedFields = Object.keys(item.proposal).filter((key) => hashValue(item.before[key]) !== hashValue(item.proposal[key])); }
function rejects(name, mutate, pattern) { test(name, () => { const packet = clone(frozen); mutate(packet); assert.match(validatePacket(packet, snapshot).join('\n'), pattern); }); }
test('frozen CLS-Class packet passes', () => assert.deepEqual(validatePacket(clone(frozen), snapshot), []));
rejects('rejects title change', (packet) => { const item = row(packet, IDS.hybrid48v); item.proposal.title += ' revised'; rehash(item); }, /deterministic|immutable title/);
rejects('rejects year change', (packet) => { const item = row(packet, IDS.balanceShaft); item.proposal.years = [2005, 2006, 2007]; rehash(item); }, /deterministic|immutable years/);
rejects('rejects trim change', (packet) => { const item = row(packet, IDS.brakes); item.proposal.trims = ['AMG CLS 53']; rehash(item); }, /deterministic|immutable trims/);
rejects('rejects engine change', (packet) => { const item = row(packet, IDS.balanceShaft); item.proposal.engines = ['3.5L V6 M272']; rehash(item); }, /deterministic|immutable engines/);
rejects('rejects archive', (packet) => { const item = row(packet, IDS.sunroof); item.proposal.status = 'archived'; rehash(item); }, /deterministic|immutable status|published status/);
rejects('rejects owner social proof', (packet) => { const item = row(packet, IDS.valveBody); item.proposal.description += ' 1,800+ owners have reported it.'; rehash(item); }, /deterministic|owner social proof/);
rejects('rejects commerce', (packet) => { const item = row(packet, IDS.airmatic); item.proposal.fixParts.push({ partNumber: 'AS-3226' }); rehash(item); }, /deterministic|commerce-free/);
rejects('rejects search citation', (packet) => { const item = row(packet, IDS.headlight); item.proposal.citations[0].url = 'https://example.com/search?q=headlight'; rehash(item); }, /deterministic|citation/);
rejects('rejects hold converted to retain', (packet) => { const item = row(packet, IDS.mbux); item.action = 'retain_indexed_identity_and_accuracy_cleanup'; item.identityReviewRequired = false; }, /deterministic|identity verdict/);
rejects('rejects blocker removal', (packet) => { packet.applicationGate.blockerRecordIds = packet.applicationGate.blockerRecordIds.slice(1); }, /deterministic|blocker/);
rejects('rejects fabricated valve-body count', (packet) => { const item = row(packet, IDS.valveBody); item.proposal.reportCount = 1800; rehash(item); }, /deterministic|fabricated report count/);
rejects('rejects fabricated AIRMATIC count', (packet) => { const item = row(packet, IDS.airmatic); item.proposal.reportCount = 680; rehash(item); }, /deterministic|fabricated report count/);
rejects('rejects fabricated crank count', (packet) => { const item = row(packet, IDS.crankSensor); item.proposal.reportCount = 560; rehash(item); }, /deterministic|fabricated report count/);
rejects('rejects fabricated headlight count', (packet) => { const item = row(packet, IDS.headlight); item.proposal.reportCount = 420; rehash(item); }, /deterministic|fabricated report count/);
rejects('rejects fabricated balance count', (packet) => { const item = row(packet, IDS.balanceShaft); item.proposal.reportCount = 2500; rehash(item); }, /deterministic|fabricated report count/);
rejects('rejects universal ISG transfer', (packet) => { const item = row(packet, IDS.hybrid48v); item.proposal.description = 'The bulletin proves every ISG fails.'; rehash(item); }, /deterministic|48V multiple-cause/);
rejects('rejects premature brake wear transfer', (packet) => { const item = row(packet, IDS.brakes); item.proposal.description = 'The bulletin proves premature rotor wear.'; rehash(item); }, /deterministic|brake evidence/);
rejects('rejects MBUX camera transfer', (packet) => { const item = row(packet, IDS.mbux); item.proposal.description = 'Campaign 2022010008 proves backup-camera failure.'; rehash(item); }, /deterministic|MBUX navigation/);
rejects('rejects valve-body shortcut', (packet) => { const item = row(packet, IDS.valveBody); item.proposal.description = 'Replace the valve body before diagnostics.'; rehash(item); }, /deterministic|valve-body diagnostic/);
rejects('rejects AIRMATIC fitment transfer', (packet) => { const item = row(packet, IDS.airmatic); item.proposal.description = 'Arnott AS-3226 fits every CLS.'; rehash(item); }, /deterministic|AIRMATIC fitment/);
rejects('rejects balance-shaft scope transfer', (packet) => { const item = row(packet, IDS.balanceShaft); item.proposal.description = 'All 2005-2010 M272 and M273 vehicles are covered.'; rehash(item); }, /deterministic|balance-shaft scope/);
rejects('rejects related-link mutation', (packet) => { const item = row(packet, IDS.crankSensor); item.proposal.relatedIssueIds = ['unauthorized']; rehash(item); }, /deterministic|immutable relatedIssueIds/);
rejects('rejects PDF page omission', (packet) => { packet.pdfSources.hybrid48vBulletin.visualPages = [1]; }, /deterministic|PDF evidence manifest/);
rejects('rejects human approval', (packet) => { const item = row(packet, IDS.headlight); item.proposal.humanApproved = true; rehash(item); }, /deterministic|commerce-free/);
