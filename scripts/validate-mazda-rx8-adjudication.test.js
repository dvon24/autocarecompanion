/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { IDS, OUTPUT, SNAPSHOT } = require('./build-mazda-rx8-adjudication');
const { hashValue } = require('./mazda-adjudication-utils');
const { validatePacket } = require('./validate-mazda-rx8-adjudication');

const packet = JSON.parse(fs.readFileSync(OUTPUT, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function row(target, id) { return target.rows.find((item) => item.id === id); }
function rehash(item) { item.proposalSha256 = hashValue(item.proposal); }
function rejects(name, mutate, expected) {
  test(name, () => {
    const changed = clone(packet);
    mutate(changed);
    const errors = validatePacket(changed, snapshot);
    assert.ok(errors.some((error) => error.includes(expected)), JSON.stringify(errors));
  });
}

test('frozen RX-8 packet passes', () => assert.deepEqual(validatePacket(packet, snapshot), []));
rejects('rejects title change', (p) => { const item = row(p, IDS.clutch); item.proposal.title += ' changed'; rehash(item); }, 'immutable title changed');
rejects('rejects year change', (p) => { const item = row(p, IDS.ssv); item.proposal.years.pop(); rehash(item); }, 'immutable years changed');
rejects('rejects archive', (p) => { const item = row(p, IDS.apex); item.proposal.status = 'archived'; rehash(item); }, 'immutable status changed');
rejects('rejects owner social proof', (p) => { const item = row(p, IDS.flooding); item.proposal.description += ' 0+ owners have reported this issue.'; rehash(item); }, 'owner social proof');
rejects('rejects commerce', (p) => { const item = row(p, IDS.ignition); item.proposal.fixParts = [{ name: 'coil' }]; rehash(item); }, 'commerce-free');
rejects('rejects search citation', (p) => { const item = row(p, IDS.clutch); item.proposal.citations[0].url += '?search=clutch'; rehash(item); }, 'exact citations drifted');
rejects('rejects retained clutch converted to hold', (p) => { row(p, IDS.clutch).action = 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy'; }, 'identity verdict drifted');
rejects('rejects held SSV converted to retain', (p) => { row(p, IDS.ssv).action = 'retain_indexed_identity_and_accuracy_cleanup'; }, 'identity verdict drifted');
rejects('rejects blocker removal', (p) => { p.applicationGate.blockerRecordIds.pop(); }, 'blocker IDs');
for (const [name, id, count] of [
  ['apex', IDS.apex, 8000],
  ['catalyst', IDS.catalyst, 4500],
  ['flooding', IDS.flooding, 7500],
  ['OMP', IDS.omp, 3200],
]) rejects(`rejects fabricated ${name} count`, (p) => { const item = row(p, id); item.proposal.reportCount = count; rehash(item); }, 'fabricated report count');
rejects('rejects clutch recall overstatement', (p) => { const item = row(p, IDS.clutch); item.proposal.description += ' NHTSA issued a recall.'; rehash(item); }, 'clutch investigation boundary');
rejects('rejects carbon assumption', (p) => { const item = row(p, IDS.ssv); item.proposal.solution += ' Carbon is always the cause; install the stronger updated actuator.'; rehash(item); }, 'SSV boundary');
rejects('rejects generic deflood rule', (p) => { const item = row(p, IDS.flooding); item.proposal.solution += ' Hold accelerator to the floor for 10-15 seconds.'; rehash(item); }, 'flooding boundary');
rejects('rejects PDF page omission', (p) => { p.pdfSources.clutchInvestigation.visualPages.pop(); }, 'PDF evidence manifest drifted');
rejects('rejects human approval', (p) => { const item = row(p, IDS.clutch); item.proposal.humanApproved = true; rehash(item); }, 'unapproved');
rejects('rejects related-link mutation', (p) => { const item = row(p, IDS.battery); item.proposal.relatedIssueIds = ['fake']; rehash(item); }, 'immutable relatedIssueIds changed');
