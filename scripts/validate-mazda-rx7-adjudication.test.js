/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { IDS, OUTPUT, SNAPSHOT } = require('./build-mazda-rx7-adjudication');
const { hashValue } = require('./mazda-adjudication-utils');
const { validatePacket } = require('./validate-mazda-rx7-adjudication');

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

test('frozen RX-7 packet passes', () => assert.deepEqual(validatePacket(packet, snapshot), []));
rejects('rejects title change', (p) => { const item = row(p, IDS.fpd); item.proposal.title += ' changed'; rehash(item); }, 'immutable title changed');
rejects('rejects year change', (p) => { const item = row(p, IDS.coolingBroad); item.proposal.years.pop(); rehash(item); }, 'immutable years changed');
rejects('rejects archive', (p) => { const item = row(p, IDS.apexFd); item.proposal.status = 'archived'; rehash(item); }, 'immutable status changed');
rejects('rejects owner social proof', (p) => { const item = row(p, IDS.turboFailure); item.proposal.description += ' 0+ owners have reported this issue.'; rehash(item); }, 'owner social proof');
rejects('rejects commerce', (p) => { const item = row(p, IDS.intakePorts); item.proposal.fixParts = [{ name: 'actuator' }]; rehash(item); }, 'commerce-free');
rejects('rejects search citation', (p) => { const item = row(p, IDS.fpd); item.proposal.citations[0].url += '?search=fuel'; rehash(item); }, 'exact citations drifted');
rejects('rejects hold converted to retain', (p) => { row(p, IDS.overheatingFd).action = 'retain_indexed_identity_and_accuracy_cleanup'; }, 'identity hold drifted');
rejects('rejects blocker removal', (p) => { p.applicationGate.blockerRecordIds.pop(); }, 'blocker IDs');
rejects('rejects fabricated cooling count', (p) => { const item = row(p, IDS.coolingBroad); item.proposal.reportCount = 280; rehash(item); }, 'fabricated report count');
rejects('rejects fabricated turbo count', (p) => { const item = row(p, IDS.turboFailure); item.proposal.reportCount = 320; rehash(item); }, 'fabricated report count');
rejects('rejects wrong FPD recall relabel', (p) => { const item = row(p, IDS.fpd); item.proposal.description += ' This recall proves FPD failure.'; rehash(item); }, 'fuel-hose/FPD boundary');
rejects('rejects broad cooling recall advice', (p) => { const item = row(p, IDS.coolingBroad); item.proposal.solution += ' The recall proves immediate seal damage.'; rehash(item); }, 'cooling-recall boundary');
rejects('rejects unsupported apex rebuild price', (p) => { const item = row(p, IDS.apexBroad); item.proposal.solution += ' Budget $3,000-$6,000.'; rehash(item); }, 'broad apex boundary');
rejects('rejects PDF injection', (p) => { p.pdfSources.fake = { url: 'https://example.com/fake.pdf' }; }, 'select zero PDFs');
rejects('rejects human approval', (p) => { const item = row(p, IDS.fpd); item.proposal.humanApproved = true; rehash(item); }, 'unapproved');
rejects('rejects related-link mutation', (p) => { const item = row(p, IDS.dtss); item.proposal.relatedIssueIds = ['fake']; rehash(item); }, 'immutable relatedIssueIds changed');
rejects('rejects market-blind turbo conversion', (p) => { const item = row(p, IDS.vacuumBroad); item.proposal.solution += ' This is a mandatory maintenance item; convert to a single turbo for reliability.'; rehash(item); }, 'turbo/vacuum boundary');
