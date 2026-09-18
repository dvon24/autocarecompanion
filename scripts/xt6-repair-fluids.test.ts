import assert from 'node:assert/strict';
import test from 'node:test';
import snapshot from './fixtures/xt6-published-snapshot.json';
import reviews from '../src/data/xt6-reviewed-repair-fluids.json';
import { withReviewedTwinParts } from '../src/lib/known-issue-twin-reviewed-parts';
import { projectKnownIssueTwinIssues } from '../src/lib/known-issue-twin-pilot';
import type { KnownIssue } from '../src/schemas/knownIssue.schema';
import { buildIssueTree } from '../src/lib/known-issue-twin-tree';

for (const review of reviews) {
  const source = snapshot.issues.find(row => row.id === review.id) as unknown as KnownIssue;
  test(`${review.oemPartNumber}: reviewed fluid survives commerce and fitment guards`, () => {
    const before = JSON.stringify(source);
    const enriched = withReviewedTwinParts(source);
    assert.equal(enriched.fixParts?.[0].verified, true);
    assert.equal(enriched.fixParts?.[0].buyLinks[0].verified, true);
    const part = projectKnownIssueTwinIssues([source])[0].fixParts[0];
    assert.ok(part, 'fluid must render, not just exist in storage');
    assert.equal(part.oemPartNumber, review.oemPartNumber);
    assert.equal(part.fitmentConfirmed, true);
    assert.equal(part.buyLinks[0].url, review.url);
    assert.equal(part.priceLow, review.priceLow);
    assert.equal(part.note, review.note);
    const actionProduct = buildIssueTree(projectKnownIssueTwinIssues([source])[0]).nodes.action.products![0];
    assert.equal(actionProduct.buyUrl, review.url);
    assert.equal(actionProduct.note, review.note);
    assert.equal(JSON.stringify(source), before);
  });
  test(`${review.oemPartNumber}: changed source or existing parts require a new review`, () => {
    for (const mutate of [
      (row: KnownIssue) => { row.solution += ' changed'; },
      (row: KnownIssue) => { row.description += ' changed'; },
      (row: KnownIssue) => { row.vehicleMatch.years = [2021]; },
      (row: KnownIssue) => { row.vehicleMatch.trims = ['Luxury']; },
      (row: KnownIssue) => { row.vehicleMatch.engines = ['2.0L']; },
      (row: KnownIssue) => { row.vehicleMatch.model = 'XT5'; },
      (row: KnownIssue) => { row.fixParts = [{ ...withReviewedTwinParts(source).fixParts![0], oemPartNumber: 'existing' }]; },
    ]) {
      const changed = structuredClone(source);
      mutate(changed);
      assert.equal(withReviewedTwinParts(changed), changed);
    }
  });
}

test('conflicting Blue Label flush and dealer-only records do not receive guessed fluids', () => {
  for (const source of snapshot.issues as unknown as KnownIssue[]) {
    if (reviews.some(row => row.id === source.id) || source.id === 'cadillac-xt6-auto-stop-2020') continue;
    assert.equal(withReviewedTwinParts(source), source);
  }
  assert.equal(new Set(reviews.map(row => row.oemPartNumber)).size, 3);
  assert.match(reviews.find(row => row.oemPartNumber === '12346290')!.note, /concentrate, not premix/);
  assert.match(reviews.find(row => row.oemPartNumber === '19352759')!.note, /AWD/);
});
