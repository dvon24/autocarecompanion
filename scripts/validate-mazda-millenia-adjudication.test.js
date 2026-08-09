/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict'); const fs = require('node:fs'); const test = require('node:test'); const { IDS, OUTPUT, SNAPSHOT } = require('./build-mazda-millenia-adjudication'); const { hashValue } = require('./mazda-adjudication-utils'); const { validatePacket } = require('./validate-mazda-millenia-adjudication');
const packet = JSON.parse(fs.readFileSync(OUTPUT, 'utf8')); const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')); function clone(value) { return JSON.parse(JSON.stringify(value)); } function row(target, id) { return target.rows.find((item) => item.id === id); } function rehash(item) { item.proposalSha256 = hashValue(item.proposal); } function rejects(name, mutate, expected) { test(name, () => { const changed = clone(packet); mutate(changed); const errors = validatePacket(changed, snapshot); assert.ok(errors.some((error) => error.includes(expected)), JSON.stringify(errors)); }); }
test('frozen Millenia packet passes', () => assert.deepEqual(validatePacket(packet, snapshot), []));
rejects('rejects title change', (p) => { const item = row(p, IDS.elbow); item.proposal.title += ' changed'; rehash(item); }, 'immutable title changed');
rejects('rejects year change', (p) => { const item = row(p, IDS.supercharger); item.proposal.years.pop(); rehash(item); }, 'immutable years changed');
rejects('rejects archive', (p) => { const item = row(p, IDS.strut); item.proposal.status = 'archived'; rehash(item); }, 'immutable status changed');
rejects('rejects owner social proof', (p) => { const item = row(p, IDS.window); item.proposal.description += ' 0+ owners have reported this issue.'; rehash(item); }, 'owner social proof');
rejects('rejects commerce', (p) => { const item = row(p, IDS.elbow); item.proposal.fixParts = [{ name: 'elbow' }]; rehash(item); }, 'commerce-free');
rejects('rejects search citation', (p) => { const item = row(p, IDS.strut); item.proposal.citations[0].url += '?search=rust'; rehash(item); }, 'exact citations drifted');
rejects('rejects hold converted to retain', (p) => { row(p, IDS.window).action = 'retain_indexed_identity_and_accuracy_cleanup'; }, 'identity hold drifted');
rejects('rejects blocker removal', (p) => { p.applicationGate.blockerRecordIds.pop(); }, 'blocker IDs');
rejects('rejects fabricated strut count', (p) => { const item = row(p, IDS.strut); item.proposal.reportCount = 100; rehash(item); }, 'fabricated report count');
rejects('rejects fabricated window count', (p) => { const item = row(p, IDS.window); item.proposal.reportCount = 110; rehash(item); }, 'fabricated report count');
rejects('rejects invented interval', (p) => { const item = row(p, IDS.supercharger); item.proposal.solution += ' Change it every 30,000 miles.'; rehash(item); }, 'supercharger boundary');
rejects('rejects incomplete visual review', (p) => { p.pdfSources.maintenanceAlert.visualPages.pop(); }, 'PDF evidence metadata');
rejects('rejects human approval', (p) => { const item = row(p, IDS.elbow); item.proposal.humanApproved = true; rehash(item); }, 'unapproved');
rejects('rejects related-link mutation', (p) => { const item = row(p, IDS.strut); item.proposal.relatedIssueIds = ['fake']; rehash(item); }, 'immutable relatedIssueIds changed');
