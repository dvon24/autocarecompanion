import assert from 'node:assert/strict';
import test from 'node:test';
import { buildQuotedPartRetailerQueue, reviewedQuotedPartNumber } from './build-quoted-part-retailer-queue';

test('accepts exact OEM formatting while rejecting descriptive or qualified pseudo numbers', () => {
  assert.deepEqual(reviewedQuotedPartNumber('4A0 612 061 D'), {
    raw: '4A0 612 061 D',
    normalized: '4A0612061D',
  });
  assert.equal(reviewedQuotedPartNumber('079103542E (separator alone)'), null);
  assert.equal(reviewedQuotedPartNumber('URO Parts 079103542E'), null);
  assert.equal(reviewedQuotedPartNumber('G12evo concentrate, TL 774 L'), null);
});

test('article-quoted numbers become retailer research rows, never fitment-approved parts', () => {
  const queue = buildQuotedPartRetailerQueue({
    complete: true,
    snapshotHash: 'a'.repeat(64),
    results: [{
      id: 'audi-example',
      workItemId: 'audi-example--part',
      component: 'water pump',
      repairRoleEvidence: 'Replace water pump 06H121026ED.',
      articleScope: {
        make: 'Audi', model: 'A4', years: [2009, 2010], trims: ['Base'], engines: ['2.0T'],
      },
      quotedPartNumber: '06H121026ED',
      engineMatch: '2.0T',
      verdict: 'no-catalog',
      mappedFrom: 'prescription',
    }],
  }, 'Audi');
  assert.equal(queue.proposalCount, 1);
  const proposal = queue.proposals[0] as {
    fitmentReviewRequired: boolean;
    parts: Array<{ verified: boolean; buyLinks: unknown[]; oemPartNumber: string }>;
  };
  assert.equal(proposal.fitmentReviewRequired, true);
  assert.equal(proposal.parts[0]?.verified, false);
  assert.deepEqual(proposal.parts[0]?.buyLinks, []);
  assert.equal(proposal.parts[0]?.oemPartNumber, '06H121026ED');
});
