import assert from 'node:assert/strict';
import test from 'node:test';
import { reviewQuotedPartLinks, scopeConflict } from './review-quoted-part-direct-links';

function row(title: string, input: { year?: number; engine?: string; component?: string } = {}) {
  return {
    proposalId: 'p', issueId: 'i', partIndex: 0,
    input: { partNumber: '07K905715G', ...input },
    result: 'exact-product-link',
    links: [{
      url: 'https://www.ebay.com/itm/123456789012',
      productIdentity: {
        observedListingTitle: title,
        productId: '123456789012',
        matchedPartNumber: '07K905715G',
        matchedPartNumberSource: 'listing-title',
      },
    }],
  };
}

test('blocks explicit year, engine and side contradictions', () => {
  assert.deepEqual(scopeConflict(row('2015-2020 Audi 2.5L right control arm', {
    year: 2009, engine: '2.0L Turbo', component: 'left control arm',
  })), [
    'listing-title-year-excludes-requested-application',
    'listing-title-engine-displacement-conflicts',
    'listing-title-side-conflicts',
  ]);
});

test('blocks an interchange match when the visible listing names a different part number', () => {
  const candidate = row('Audi S6 front right strut 4G0616040AL OEM', {
    year: 2013, component: 'front air suspension strut',
  });
  candidate.links[0]!.productIdentity!.matchedPartNumberSource = 'item-specifics';
  assert.deepEqual(scopeConflict(candidate), ['listing-title-identifies-different-part-number']);
});

test('does not call a listing conflict when the title omits only a revision suffix', () => {
  const candidate = row('Audi control arm 8V5877071 OEM', {
    year: 2016, component: 'control arm',
  });
  candidate.links[0]!.productIdentity!.matchedPartNumber = '8V5877071A';
  candidate.input.partNumber = '8V5877071A';
  candidate.links[0]!.productIdentity!.matchedPartNumberSource = 'item-specifics';
  assert.deepEqual(scopeConflict(candidate), []);
});

test('normalizes turbo-style displacement labels before comparison', () => {
  assert.deepEqual(scopeConflict(row('Audi 2.0T ignition coil 07K905715G', {
    year: 2000, engine: '1.8L', component: 'ignition coil',
  })), ['listing-title-engine-displacement-conflicts']);
});

test('exact identity without independent fitment remains held, never auto-approved', () => {
  const review = reviewQuotedPartLinks({
    snapshotHash: 'a'.repeat(64), make: 'Audi',
    linkEvidence: [row('2009-2012 Audi A4 2.0L ignition coil 07K905715G', {
      year: 2009, engine: '2.0L', component: 'ignition coil',
    })],
  });
  assert.equal(review.status, 'IN_PROGRESS_NO_LINK_APPROVALS');
  assert.equal(review.blockedConflictCount, 0);
  assert.equal(review.manualFitmentHoldCount, 1);
  assert.equal(review.approvedCount, 0);
});

test('approves only the independently reviewed narrow scope', () => {
  const candidate = row('2009-2015 Audi A4 2.0T PCV 06H103495AK', {
    year: 2009, engine: '2.0T', component: 'PCV valve',
  });
  const review = reviewQuotedPartLinks({ make: 'Audi', linkEvidence: [candidate] }, [{
    proposalId: 'p', issueId: 'i', partIndex: 0, partNumber: '07K905715G',
    verdict: 'approve_fitment', reviewedFitment: { years: [2009, 2010], engines: ['2.0T'] },
    reviewedComponent: '  PCV/oil separator assembly  ',
    sourceUrls: ['https://parts.example/product'], reason: 'Independent application table covers the exact cells.',
  }]);
  assert.equal(review.status, 'IN_PROGRESS_PARTIAL_REVIEW');
  assert.equal(review.approvedCount, 1);
  assert.equal(review.blockedCount, 0);
  assert.deepEqual(review.decisions[0]!.reviewedFitment, { years: [2009, 2010], engines: ['2.0T'] });
  assert.equal(review.decisions[0]!.reviewedComponent, 'PCV/oil separator assembly');
});

test('rejects an invalid reviewed component correction', () => {
  assert.throws(() => reviewQuotedPartLinks({ linkEvidence: [row('Audi coil 07K905715G')] }, [{
    proposalId: 'p', issueId: 'i', partIndex: 0, partNumber: '07K905715G',
    verdict: 'approve_fitment', reviewedFitment: { years: [2009] }, reviewedComponent: '  ',
    sourceUrls: ['https://parts.example/product'], reason: 'Exact application table.',
  }]), /reviewed component is invalid/);
});

test('counts a reviewed wrong-role candidate as blocked', () => {
  const review = reviewQuotedPartLinks({ linkEvidence: [row('Audi oil filter 07K905715G')] }, [{
    proposalId: 'p', issueId: 'i', partIndex: 0, partNumber: '07K905715G',
    verdict: 'block_wrong_repair_role', sourceUrls: ['https://parts.example/product'],
    reason: 'The service filter does not repair the failure.',
  }]);
  assert.equal(review.blockedCount, 1);
  assert.equal(review.manualFitmentHoldCount, 0);
});

test('rejects manual evidence bound to the wrong part number', () => {
  assert.throws(() => reviewQuotedPartLinks({ linkEvidence: [row('Audi coil 07K905715G')] }, [{
    proposalId: 'p', issueId: 'i', partIndex: 0, partNumber: 'WRONG123',
    verdict: 'block_fitment', sourceUrls: ['https://parts.example/product'], reason: 'Wrong application.',
  }]), /identity mismatch/);
});
