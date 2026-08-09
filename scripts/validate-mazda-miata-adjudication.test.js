/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { IDS, OUTPUT, SNAPSHOT } = require('./build-mazda-miata-adjudication');
const { hashValue } = require('./mazda-adjudication-utils');
const { validatePacket } = require('./validate-mazda-miata-adjudication');

const packet = JSON.parse(fs.readFileSync(OUTPUT, 'utf8')); const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function row(target, id) { return target.rows.find((item) => item.id === id); }
function rehash(item) { item.proposalSha256 = hashValue(item.proposal); }
function rejects(name, mutate, expected) { test(name, () => { const changed = clone(packet); mutate(changed); const errors = validatePacket(changed, snapshot); assert.ok(errors.some((error) => error.includes(expected)), JSON.stringify(errors)); }); }

test('frozen Miata packet passes', () => assert.deepEqual(validatePacket(packet, snapshot), []));
rejects('rejects title change', (p) => { const item = row(p, IDS.oil); item.proposal.title += ' changed'; rehash(item); }, 'immutable title changed');
rejects('rejects year change', (p) => { const item = row(p, IDS.top); item.proposal.years.pop(); rehash(item); }, 'immutable years changed');
rejects('rejects archive', (p) => { const item = row(p, IDS.rust); item.proposal.status = 'archived'; rehash(item); }, 'immutable status changed');
rejects('rejects owner social proof', (p) => { const item = row(p, IDS.slave); item.proposal.description += ' 0+ owners have reported this issue.'; rehash(item); }, 'owner social proof');
rejects('rejects commerce', (p) => { const item = row(p, IDS.oil); item.proposal.fixParts = [{ name: 'gasket' }]; rehash(item); }, 'commerce-free');
rejects('rejects search citation', (p) => { const item = row(p, IDS.thrust); item.proposal.citations[0].url += '?search=miata'; rehash(item); }, 'exact citations drifted');
rejects('rejects hold converted to retain', (p) => { row(p, IDS.shortNose).action = 'retain_indexed_identity_and_accuracy_cleanup'; }, 'identity hold drifted');
rejects('rejects oil hold converted to retain', (p) => { row(p, IDS.oil).action = 'retain_indexed_identity_and_accuracy_cleanup'; }, 'identity hold drifted');
rejects('rejects blocker removal', (p) => { p.applicationGate.blockerRecordIds.pop(); }, 'blocker IDs');
rejects('rejects unsafe torque', (p) => { const item = row(p, IDS.shortNose); item.proposal.solution += ' Torque it to 80-87 ft-lbs.'; rehash(item); }, 'short-nose boundary');
rejects('rejects thrust threshold', (p) => { const item = row(p, IDS.thrust); item.proposal.solution += ' Use 0.008 inches.'; rehash(item); }, 'thrust-bearing boundary');
rejects('rejects universal oil wording', (p) => { const item = row(p, IDS.oil); item.proposal.description += ' This affects essentially every Miata.'; rehash(item); }, 'oil-leak boundary');
rejects('rejects PDF insertion', (p) => { p.pdfSources.fake = { pages: 1, visualPages: [] }; }, 'must not claim selected PDF');
rejects('rejects human approval', (p) => { const item = row(p, IDS.top); item.proposal.humanApproved = true; rehash(item); }, 'unapproved');
rejects('rejects related-link mutation', (p) => { const item = row(p, IDS.rust); item.proposal.relatedIssueIds = ['fake']; rehash(item); }, 'immutable relatedIssueIds changed');
