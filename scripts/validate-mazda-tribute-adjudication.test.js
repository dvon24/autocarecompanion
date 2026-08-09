/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict'); const fs = require('node:fs'); const test = require('node:test');
const { IDS, OUTPUT, SNAPSHOT } = require('./build-mazda-tribute-adjudication'); const { hashValue } = require('./mazda-adjudication-utils'); const { validatePacket } = require('./validate-mazda-tribute-adjudication');
const packet = JSON.parse(fs.readFileSync(OUTPUT, 'utf8')); const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
function clone(value) { return JSON.parse(JSON.stringify(value)); } function row(target, id) { return target.rows.find((item) => item.id === id); } function rehash(item) { item.proposalSha256 = hashValue(item.proposal); }
function rejects(name, mutate, expected) { test(name, () => { const changed = clone(packet); mutate(changed); const errors = validatePacket(changed, snapshot); assert.ok(errors.some((error) => error.includes(expected)), JSON.stringify(errors)); }); }
test('frozen Tribute packet passes', () => assert.deepEqual(validatePacket(packet, snapshot), []));
rejects('rejects title change', (p) => { const item = row(p, IDS.corrosion); item.proposal.title += ' changed'; rehash(item); }, 'immutable title changed');
rejects('rejects year change', (p) => { const item = row(p, IDS.coil); item.proposal.years.pop(); rehash(item); }, 'immutable years changed');
rejects('rejects archive', (p) => { const item = row(p, IDS.transmission); item.proposal.status = 'archived'; rehash(item); }, 'immutable status changed');
rejects('rejects owner social proof', (p) => { const item = row(p, IDS.differential); item.proposal.description += ' 0+ owners have reported this issue.'; rehash(item); }, 'owner social proof');
rejects('rejects commerce', (p) => { const item = row(p, IDS.transferSeal); item.proposal.fixParts = [{ name: 'seal' }]; rehash(item); }, 'commerce-free');
rejects('rejects search citation', (p) => { const item = row(p, IDS.corrosion); item.proposal.citations[0].url += '?search=rust'; rehash(item); }, 'exact citations drifted');
rejects('rejects hold converted to retain', (p) => { row(p, IDS.corrosion).action = 'retain_indexed_identity_and_accuracy_cleanup'; }, 'identity hold drifted');
rejects('rejects blocker removal', (p) => { p.applicationGate.blockerRecordIds.pop(); }, 'blocker IDs');
for (const [name, id, count] of [['coil', IDS.coil, 200], ['transmission', IDS.transmission, 350], ['differential', IDS.differential, 180]]) rejects(`rejects fabricated ${name} count`, (p) => { const item = row(p, id); item.proposal.reportCount = count; rehash(item); }, 'fabricated report count');
rejects('rejects wrong corrosion campaign', (p) => { const item = row(p, IDS.corrosion); item.proposal.description += ' Use recall 14V-440.'; rehash(item); }, 'corrosion boundary');
rejects('rejects generic subframe replacement', (p) => { const item = row(p, IDS.corrosion); item.proposal.solution += ' The dealer will replace the subframe at no cost.'; rehash(item); }, 'corrosion boundary');
rejects('rejects universal transmission service', (p) => { const item = row(p, IDS.transmission); item.proposal.solution += ' Use updated servo bore kit and fluid changes every 30k.'; rehash(item); }, 'transmission boundary');
rejects('rejects PDF injection', (p) => { p.pdfSources.fake = { url: 'https://example.com/fake.pdf' }; }, 'select zero PDFs');
rejects('rejects human approval', (p) => { const item = row(p, IDS.corrosion); item.proposal.humanApproved = true; rehash(item); }, 'unapproved');
rejects('rejects related-link mutation', (p) => { const item = row(p, IDS.coil); item.proposal.relatedIssueIds = ['fake']; rehash(item); }, 'immutable relatedIssueIds changed');
