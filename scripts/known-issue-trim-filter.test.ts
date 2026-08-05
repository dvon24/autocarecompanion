import assert from 'node:assert/strict';
import test from 'node:test';

import {
  filterableKnownIssueTrims,
  isApplicabilityProseTrim,
  knownIssueMatchesTrim,
} from '../src/lib/known-issue-trim-filter';

test('preserves literal trim names', () => {
  const trims = ['SXT', 'R/T', 'Citadel', 'SRT Hellcat Redeye Widebody', 'Type R (1997-1998, 2000-2001)'];
  assert.deepEqual(filterableKnownIssueTrims(trims), trims);
  assert.equal(knownIssueMatchesTrim(trims, 'R/T Plus'), true);
  assert.equal(knownIssueMatchesTrim(trims, 'SE'), false);
});

test('recognizes campaign applicability prose', () => {
  for (const value of [
    'Vehicles built February 8-9, 2023; verify by VIN',
    'North American vehicles equipped with an 8.4-inch radio',
    'VIN-specific Emissions Service Action 27BQ; verify open action',
    'Prowler vehicles included in recall C03; confirm applicability by VIN',
    'Vehicles with 6.4L SRT HEMI engine sales code ESG or ESH',
  ]) {
    assert.equal(isApplicabilityProseTrim(value), true, value);
  }
});

test('fails open when any trim entry contains applicability prose', () => {
  const broken = ['SXT', 'Vehicles built February 8-9, 2023; verify by VIN'];
  assert.deepEqual(filterableKnownIssueTrims(broken), []);
  assert.equal(knownIssueMatchesTrim(broken, 'Citadel'), true);
});
