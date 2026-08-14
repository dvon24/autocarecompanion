import test from 'node:test';
import assert from 'node:assert/strict';
import { buildStandardIndependentReview } from './build-standard-independent-review';

function fixture() {
  const link = {
    vendor: 'eBay', url: 'https://www.ebay.com/itm/123?mkrid=1', linkType: 'product', verified: true,
    productIdentity: {
      matchedPartNumber: 'ABC-123', productId: '123', matchedPartNumberSource: 'listing-title',
      observedPartNumberField: 'title', observedPartNumberValue: 'Audi ABC-123 pump', observedListingTitle: 'Audi ABC-123 pump',
      listingTitleHash: 'ignored-in-this-unit-test',
    },
  };
  const workRows = [
    { workItemId: 'proposal-a', issueId: 'issue-a', source: 'existing-fix-part', existingPartIndex: 0, partNumber: 'ABC-123', declaredEngine: '2.0T' },
    { workItemId: 'hidden-b', issueId: 'issue-b', source: 'existing-fix-part', existingPartIndex: 0, partNumber: 'XYZ-9', declaredEngine: null },
  ];
  return {
    source: { make: 'Audi', snapshotHash: 's', recordCount: 2, records: [
      { id: 'issue-a', title: 'Pump', solution: 'Replace pump.', fixParts: [{ verified: true, component: 'pump' }] },
      { id: 'issue-b', title: 'Sensor', solution: 'Replace sensor.', fixParts: [{ verified: false, component: 'sensor' }] },
    ] },
    ledger: { issueCount: 2 }, worklist: { entries: workRows },
    evidence: { results: workRows.map((row) => ({ workItemId: row.workItemId, verdict: 'unmapped' })) },
    proposals: { workItemDispositions: [
      { workItemId: 'proposal-a', issueId: 'issue-a', verdict: 'proposed', reasonCode: 'approved-quoted-part-proposal' },
      { workItemId: 'hidden-b', issueId: 'issue-b', verdict: 'hold', reasonCode: 'fitment-unmapped' },
    ] },
    links: { proposals: [{ proposalId: 'proposal-a', id: 'issue-a', articleScope: { model: 'A4' }, parts: [{ component: 'pump', supplier: 'Audi', aftermarketXref: ['ABC-123'], buyLinks: [link] }] }], linkEvidence: [{ proposalId: 'proposal-a', partIndex: 0, result: 'exact-product-link', links: [link] }] },
    quotedRepairReview: { make: 'Audi', snapshotHash: 's', decisions: [{ proposalId: 'proposal-a', issueId: 'issue-a', partIndex: 0, partNumber: 'ABC-123', decision: 'approve', reason: 'The exact pump is the prescribed repair.', sourceEvidence: { howToFix: 'Replace pump.' } }] },
    publicClaimReview: { make: 'Audi', snapshotHash: 's', decisions: [{ issueId: 'issue-a', partIndex: 0, verdict: 'block_unsafe_public', reason: 'The old public claim is unscoped and unsafe.' }] },
    reviewedArtifactSha256: Object.fromEntries(['01-disposition-ledger.json','02-fitment-worklist.json','03-showmetheparts-evidence.json','04-part-proposals.json','05-direct-link-evidence.json'].map((name) => [name, '1'.repeat(64)])),
    supplementalArtifactSha256: {},
  };
}

test('builds complete canonical proposal and existing-claim review rows', () => {
  const output = buildStandardIndependentReview(fixture());
  assert.equal(output.proposalCount, 1);
  assert.equal(output.tally.approve, 1);
  assert.equal(output.existingClaimWorkRowCount, 2);
  assert.deepEqual(output.existingClaimTally, { preserve: 1, block: 1 });
  assert.match(output.decisions[0]?.reviewedSourceEvidence.directLink, /Exact product link/);
});

test('rejects a verified public claim missing from its explicit review', () => {
  const input = fixture();
  input.publicClaimReview.decisions = [];
  assert.throws(() => buildStandardIndependentReview(input), /absent from the public-claim review/);
});

test('accepts terminal non-approval decisions and rejects a missing repair-role decision', () => {
  const input = fixture();
  input.quotedRepairReview.decisions[0]!.decision = 'hold_diagnosis_gate';
  input.links.proposals[0]!.parts[0]!.buyLinks = [];
  input.links.linkEvidence[0]!.links = [];
  input.links.linkEvidence[0]!.result = 'no-exact-product-link';
  const held = buildStandardIndependentReview(input);
  assert.equal(held.decisions[0]?.decision, 'hold_needs_manual');
  input.quotedRepairReview.decisions = [];
  assert.throws(() => buildStandardIndependentReview(input), /lacks a repair-role decision/);
});

test('approves one or two exact links and attests every destination', () => {
  const input = fixture();
  const first = input.links.proposals[0]!.parts[0]!.buyLinks[0]!;
  const alternate = structuredClone(first);
  alternate.vendor = 'Audi Parts Store';
  alternate.url = 'https://www.audipartsstore.com/parts/audi-pump-abc-123.html';
  alternate.productIdentity.productId = 'abc-123';
  input.links.proposals[0]!.parts[0]!.buyLinks.push(alternate);
  input.links.linkEvidence[0]!.links.push(alternate);

  const output = buildStandardIndependentReview(input);
  assert.match(output.decisions[0]!.reviewedSourceEvidence.directLink, /ebay\.com/);
  assert.match(output.decisions[0]!.reviewedSourceEvidence.directLink, /audipartsstore\.com/);
  assert.equal(output.productIdentityReconciliation.exactProductLinkRowCount, 1);
  assert.equal(output.productIdentityReconciliation.exactProductLinkCount, 2);

  const third = structuredClone(alternate);
  third.vendor = 'Amazon';
  third.url = 'https://www.amazon.com/dp/B0ABC12345';
  input.links.proposals[0]!.parts[0]!.buyLinks.push(third);
  assert.throws(() => buildStandardIndependentReview(input), /requires one or two exact links/);
});
