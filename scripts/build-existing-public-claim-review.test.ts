import assert from 'node:assert/strict';
import test from 'node:test';
import { buildExistingPublicClaimReview } from './build-existing-public-claim-review';

const source = {
  make: 'Audi', snapshotHash: 'hash', records: [{
    id: 'issue', title: 'Recall', solution: 'Check the VIN.',
    fixParts: [
      { component: 'Dealer remedy', verified: true, recallFirst: true, buyLinks: [] },
      { component: 'Hidden old part', verified: false, buyLinks: [] },
    ],
  }],
};

test('requires one decision for every verified public claim and ignores hidden metadata', () => {
  const output = buildExistingPublicClaimReview(source, { make: 'Audi', decisions: [{
    issueId: 'issue', partIndex: 0, verdict: 'preserve_recall_information',
    reason: 'This is a no-commerce recall-first information card.',
  }] });
  assert.equal(output.verifiedPublicClaimCount, 1);
  assert.equal(output.releaseBlocked, false);
  assert.equal((output.decisions[0] as { recallFirst: boolean }).recallFirst, true);
});

test('rejects missing, duplicate, extra, and invalid decisions', () => {
  const valid = { issueId: 'issue', partIndex: 0, verdict: 'preserve_recall_information', reason: 'This is a no-commerce recall-first information card.' };
  assert.throws(() => buildExistingPublicClaimReview(source, { make: 'Audi', decisions: [] }), /no decision/);
  assert.throws(() => buildExistingPublicClaimReview(source, { make: 'Audi', decisions: [valid, valid] }), /duplicate/);
  assert.throws(() => buildExistingPublicClaimReview(source, { make: 'Audi', decisions: [valid, { ...valid, issueId: 'other' }] }), /outside/);
  assert.throws(() => buildExistingPublicClaimReview(source, { make: 'Audi', decisions: [{ ...valid, verdict: 'maybe' }] }), /invalid/);
});
