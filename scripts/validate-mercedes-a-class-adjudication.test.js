/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { IDS, OUTPUT, SNAPSHOT } = require('./build-mercedes-a-class-adjudication');
const { hashValue } = require('./known-issue-adjudication-utils');
const { validatePacket } = require('./validate-mercedes-a-class-adjudication');

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

test('frozen A-Class packet passes', () => assert.deepEqual(validatePacket(packet, snapshot), []));
rejects('rejects title change', (p) => { const item = row(p, IDS.camera); item.proposal.title += ' changed'; rehash(item); }, 'immutable title changed');
rejects('rejects year change', (p) => { const item = row(p, IDS.drain); item.proposal.years.pop(); rehash(item); }, 'immutable years changed');
rejects('rejects trim change', (p) => { const item = row(p, IDS.carrier); item.proposal.trims.pop(); rehash(item); }, 'immutable trims changed');
rejects('rejects engine change', (p) => { const item = row(p, IDS.dct); item.proposal.engines = []; rehash(item); }, 'immutable engines changed');
rejects('rejects archive', (p) => { const item = row(p, IDS.carbon); item.proposal.status = 'archived'; rehash(item); }, 'immutable status changed');
rejects('rejects owner social proof', (p) => { const item = row(p, IDS.mbux); item.proposal.description += ' 0+ owners have reported this issue.'; rehash(item); }, 'owner social proof');
rejects('rejects commerce', (p) => { const item = row(p, IDS.strut); item.proposal.fixParts = [{ component: 'strut' }]; rehash(item); }, 'commerce-free');
rejects('rejects search citation', (p) => { const item = row(p, IDS.camera); item.proposal.citations[0].url += '?search=camera'; rehash(item); }, 'exact citations drifted');
rejects('rejects retained camera converted to hold', (p) => { row(p, IDS.camera).action = 'hold_indexed_identity_and_accuracy_cleanup_pending_identity_policy'; }, 'identity verdict drifted');
rejects('rejects held drain converted to retain', (p) => { row(p, IDS.drain).action = 'retain_indexed_identity_and_accuracy_cleanup'; }, 'identity verdict drifted');
rejects('rejects blocker removal', (p) => { p.applicationGate.blockerRecordIds.pop(); }, 'blocker IDs');
for (const [name, id, count] of [
  ['DCT', IDS.dct, 1200],
  ['MBUX', IDS.mbux, 1500],
  ['strut', IDS.strut, 600],
]) rejects(`rejects fabricated ${name} count`, (p) => { const item = row(p, id); item.proposal.reportCount = count; rehash(item); }, 'fabricated report count');
rejects('rejects drain plug overstatement', (p) => { const item = row(p, IDS.drain); item.proposal.solution += ' Dealer installs a water drain plug.'; rehash(item); }, 'drain recall boundary');
rejects('rejects DPF forced-regeneration prescription', (p) => { const item = row(p, IDS.dpf); item.proposal.solution += ' Perform a forced/static regeneration.'; rehash(item); }, 'DPF source boundary');
rejects('rejects human approval', (p) => { const item = row(p, IDS.camera); item.proposal.humanApproved = true; rehash(item); }, 'unapproved');
rejects('rejects related-link mutation', (p) => { const item = row(p, IDS.dct); item.proposal.relatedIssueIds = ['fake']; rehash(item); }, 'immutable relatedIssueIds changed');
rejects('rejects PDF page omission', (p) => { p.pdfSources.brochure.visualPages.pop(); }, 'PDF evidence manifest drifted');
