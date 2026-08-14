import assert from 'node:assert/strict';
import test from 'node:test';
import { buildReviewedQuotedPartProposals } from './build-reviewed-quoted-part-proposals';

const proposal = {
  proposalId: 'proposal', id: 'issue', component: 'PCV valve',
  articleScope: { make: 'Audi', model: 'A4', years: [2009, 2010], trims: [], engines: ['2.0T'] },
  sourceEvidence: { kind: 'article-quoted-part-number' },
  parts: [{ role: 'primary', component: 'PCV valve', supplier: 'Audi OEM', oemPartNumber: '06H103495AK' }],
};

test('emits only reviewed narrow-fitment exact-link proposals', () => {
  const result = buildReviewedQuotedPartProposals({ proposals: [proposal], holds: [] }, {
    linkEvidence: [{
      proposalId: 'proposal', issueId: 'issue', partIndex: 0,
      input: { partNumber: '06H103495AK' }, result: 'exact-product-link', links: [{ url: 'https://ebay.example/itm/1' }],
    }],
  }, { decisions: [{
    proposalId: 'proposal', issueId: 'issue', partIndex: 0, partNumber: '06H103495AK',
    verdict: 'approve_reviewed_fitment', reviewedFitment: { years: [2009], engines: ['2.0T'] },
    reviewedComponent: 'PCV/oil separator assembly',
    independentSources: ['https://parts.example/pn'], reviewerReason: 'Exact application table.',
  }] });
  const first = result.proposals[0] as {
    component: string;
    reviewEvidence: unknown;
    parts: Array<{ component: string; fitment: unknown; verified: boolean }>;
  };
  assert.equal(result.queuePartCount, 1);
  assert.equal(result.proposalCount, 1);
  assert.deepEqual(first.parts[0]!.fitment, { years: [2009], engines: ['2.0T'] });
  assert.equal(first.component, 'PCV/oil separator assembly');
  assert.equal(first.parts[0]!.component, 'PCV/oil separator assembly');
  assert.deepEqual(first.reviewEvidence, {
    independentSources: ['https://parts.example/pn'],
    reviewerReason: 'Exact application table.',
    originalComponent: 'PCV valve',
    reviewedComponent: 'PCV/oil separator assembly',
  });
  assert.equal(first.parts[0]!.verified, false);
});

test('reconciles a no-link row as a terminal hold', () => {
  const result = buildReviewedQuotedPartProposals({ proposals: [proposal], holds: [{ reason: 'bad PN' }] }, {
    linkEvidence: [{
      proposalId: 'proposal', issueId: 'issue', partIndex: 0,
      input: { partNumber: '06H103495AK' }, result: 'no-exact-product-link', links: [],
    }],
  }, { decisions: [] });
  assert.equal(result.proposalCount, 0);
  assert.equal(result.heldOrBlockedCount, 1);
  assert.equal(result.manualNormalizationHoldCount, 1);
});

test('rejects approval that widens beyond article years', () => {
  assert.throws(() => buildReviewedQuotedPartProposals({ proposals: [proposal] }, {
    linkEvidence: [{
      proposalId: 'proposal', issueId: 'issue', partIndex: 0,
      input: { partNumber: '06H103495AK' }, result: 'exact-product-link', links: [{ url: 'https://ebay.example/itm/1' }],
    }],
  }, { decisions: [{
    proposalId: 'proposal', issueId: 'issue', partIndex: 0, partNumber: '06H103495AK',
    verdict: 'approve_reviewed_fitment', reviewedFitment: { years: [2011] }, independentSources: [], reviewerReason: '',
  }] }), /reviewed years exceed/);
});
