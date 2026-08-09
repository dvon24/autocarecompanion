/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict'); const fs = require('node:fs'); const test = require('node:test'); const { IDS, OUTPUT, SNAPSHOT } = require('./build-mazda-mx5-miata-adjudication'); const { hashValue } = require('./mazda-adjudication-utils'); const { validatePacket } = require('./validate-mazda-mx5-miata-adjudication');
const packet = JSON.parse(fs.readFileSync(OUTPUT, 'utf8')); const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')); function clone(value) { return JSON.parse(JSON.stringify(value)); } function row(target, id) { return target.rows.find((item) => item.id === id); } function rehash(item) { item.proposalSha256 = hashValue(item.proposal); } function rejects(name, mutate, expected) { test(name, () => { const changed = clone(packet); mutate(changed); const errors = validatePacket(changed, snapshot); assert.ok(errors.some((error) => error.includes(expected)), JSON.stringify(errors)); }); }
test('frozen MX-5 Miata packet passes', () => assert.deepEqual(validatePacket(packet, snapshot), []));
rejects('rejects title change', (p) => { const item = row(p, IDS.fuelRecall); item.proposal.title += ' changed'; rehash(item); }, 'immutable title changed');
rejects('rejects year change', (p) => { const item = row(p, IDS.infotainment); item.proposal.years.pop(); rehash(item); }, 'immutable years changed');
rejects('rejects archive', (p) => { const item = row(p, IDS.diff); item.proposal.status = 'archived'; rehash(item); }, 'immutable status changed');
rejects('rejects owner social proof', (p) => { const item = row(p, IDS.rearMain); item.proposal.description += ' 0+ owners have reported this issue.'; rehash(item); }, 'owner social proof');
rejects('rejects commerce', (p) => { const item = row(p, IDS.radiator); item.proposal.fixParts = [{ name: 'radiator' }]; rehash(item); }, 'commerce-free');
rejects('rejects search citation', (p) => { const item = row(p, IDS.fuelRecall); item.proposal.citations[0].url += '?search=recall'; rehash(item); }, 'exact citations drifted');
rejects('rejects hold converted to retain', (p) => { row(p, IDS.infotainment).action = 'retain_indexed_identity_and_accuracy_cleanup'; }, 'identity hold drifted');
rejects('rejects blocker removal', (p) => { p.applicationGate.blockerRecordIds.pop(); }, 'blocker IDs');
rejects('rejects fabricated CPS count', (p) => { const item = row(p, IDS.cps); item.proposal.reportCount = 4500; rehash(item); }, 'fabricated report count');
rejects('rejects fabricated differential count', (p) => { const item = row(p, IDS.diff); item.proposal.reportCount = 1100; rehash(item); }, 'fabricated report count');
rejects('rejects fabricated rear-main count', (p) => { const item = row(p, IDS.rearMain); item.proposal.reportCount = 3800; rehash(item); }, 'fabricated report count');
rejects('rejects fabricated short-nose count', (p) => { const item = row(p, IDS.shortNoseDuplicate); item.proposal.reportCount = 6000; rehash(item); }, 'fabricated report count');
rejects('rejects fabricated soft-top count', (p) => { const item = row(p, IDS.softTopBroad); item.proposal.reportCount = 5000; rehash(item); }, 'fabricated report count');
rejects('rejects friction-modifier advice', (p) => { const item = row(p, IDS.diff); item.proposal.solution += ' Adding friction modifier can fix it.'; rehash(item); }, 'differential boundary');
rejects('rejects contradictory torque advice', (p) => { const item = row(p, IDS.shortNoseDuplicate); item.proposal.solution += ' Torque it to 116 ft-lb.'; rehash(item); }, 'short-nose-duplicate boundary');
rejects('rejects incomplete visual review', (p) => { p.pdfSources.maintenanceAlert.visualPages.pop(); }, 'PDF evidence metadata');
rejects('rejects human approval', (p) => { const item = row(p, IDS.fuelRecall); item.proposal.humanApproved = true; rehash(item); }, 'unapproved');
rejects('rejects related-link mutation', (p) => { const item = row(p, IDS.infotainment); item.proposal.relatedIssueIds = ['fake']; rehash(item); }, 'immutable relatedIssueIds changed');
