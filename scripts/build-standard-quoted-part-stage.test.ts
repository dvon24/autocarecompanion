import test from 'node:test';
import assert from 'node:assert/strict';
import { buildStandardQuotedPartStages } from './build-standard-quoted-part-stage';

const base = () => ({
  generatedFrom: ['03.json'],
  guardrail: 'base',
  count: 0,
  workItemDispositionCount: 3,
  workItemDispositions: [
    { workItemId: 'a', issueId: 'issue-a', verdict: 'hold', reasonCode: 'fitment-unmapped' },
    { workItemId: 'b', issueId: 'issue-b', verdict: 'hold', reasonCode: 'fitment-no-catalog' },
    { workItemId: 'c', issueId: 'issue-c', verdict: 'proposed', reasonCode: 'eligible-proposal' },
  ],
  proposals: [{ proposalId: 'c', id: 'issue-c', parts: [] }],
});
const quoted = () => ({
  make: 'Audi',
  proposals: [{
    proposalId: 'a', id: 'issue-a', articleScope: { make: 'Audi', model: 'A4' },
    parts: [{ role: 'primary', component: 'water pump', supplier: 'Audi OEM', aftermarketXref: ['ABC-123'], fitment: { years: [2010], engines: ['2.0T'] }, verified: false, buyLinks: [{ vendor: 'eBay', url: 'https://www.ebay.com/itm/123', verified: true }] }],
  }],
});
const review = () => ({
  make: 'Audi', decisions: [{ proposalId: 'a', issueId: 'issue-a', partIndex: 0, partNumber: 'ABC-123', decision: 'approve' }],
});

test('promotes only approved quoted rows and keeps exact links in stage 05 only', () => {
  const result = buildStandardQuotedPartStages(base(), quoted(), review(), {
    quotedProposalSha256: '1'.repeat(64), repairRoleReviewSha256: '2'.repeat(64),
  });
  assert.equal(result.proposals.count, 1);
  assert.equal(result.proposals.workItemDispositions[0]?.verdict, 'proposed');
  assert.equal(result.proposals.workItemDispositions[1]?.verdict, 'hold');
  assert.deepEqual(result.proposals.workItemDispositions[2], {
    workItemId: 'c', issueId: 'issue-c', verdict: 'hold', reasonCode: 'unreviewed-standard-proposal',
  });
  assert.deepEqual(result.proposals.proposals[0]?.parts[0]?.buyLinks, []);
  assert.equal(result.links.proposals[0]?.parts[0]?.buyLinks?.length, 1);
  assert.equal(result.retailerCandidates.selectedCandidateCount, 1);
  assert.deepEqual(result.links.linkEvidence[0]?.input, {
    partNumber: 'ABC-123', supplier: 'Audi OEM', component: 'water pump',
    make: 'Audi', model: 'A4', year: 2010, engine: '2.0T',
  });
});

test('rejects an approval that is not bound to a held canonical work item', () => {
  const invalid = base();
  invalid.workItemDispositions[0]!.verdict = 'proposed';
  assert.throws(() => buildStandardQuotedPartStages(invalid, quoted(), review(), {
    quotedProposalSha256: '1'.repeat(64), repairRoleReviewSha256: '2'.repeat(64),
  }), /no held canonical work item/);
});

test('rejects approval PN drift and missing exact links', () => {
  const wrongPn = review();
  wrongPn.decisions[0]!.partNumber = 'XYZ-999';
  assert.throws(() => buildStandardQuotedPartStages(base(), quoted(), wrongPn, {
    quotedProposalSha256: '1'.repeat(64), repairRoleReviewSha256: '2'.repeat(64),
  }), /part-number identity mismatch/);
  const noLink = quoted();
  noLink.proposals[0]!.parts[0]!.buyLinks = [];
  assert.throws(() => buildStandardQuotedPartStages(base(), noLink, review(), {
    quotedProposalSha256: '1'.repeat(64), repairRoleReviewSha256: '2'.repeat(64),
  }), /requires one or two exact product links/);

  const twoLinks = quoted();
  twoLinks.proposals[0]!.parts[0]!.buyLinks.push({
    vendor: 'Audi Parts Store', url: 'https://parts.example.com/product/abc-123', verified: true,
  });
  assert.equal(buildStandardQuotedPartStages(base(), twoLinks, review(), {
    quotedProposalSha256: '1'.repeat(64), repairRoleReviewSha256: '2'.repeat(64),
  }).links.proposals[0]!.parts[0]!.buyLinks!.length, 2);

  const threeLinks = quoted();
  threeLinks.proposals[0]!.parts[0]!.buyLinks.push(
    { vendor: 'Audi Parts Store', url: 'https://parts.example.com/product/abc-123', verified: true },
    { vendor: 'Amazon', url: 'https://www.amazon.com/dp/B0ABC12345', verified: true },
  );
  assert.throws(() => buildStandardQuotedPartStages(base(), threeLinks, review(), {
    quotedProposalSha256: '1'.repeat(64), repairRoleReviewSha256: '2'.repeat(64),
  }), /requires one or two exact product links/);
});
