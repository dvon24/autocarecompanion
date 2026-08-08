import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { formatOwnerReportCount, hasOwnerReportCount } from './owner-report-count';

test('zero and unknown report counts never become social proof', () => {
  for (const value of [0, -1, Number.NaN, undefined, null]) {
    assert.equal(hasOwnerReportCount(value), false);
    assert.equal(formatOwnerReportCount(value), null);
  }
});

test('positive report counts use truthful singular and plural copy', () => {
  assert.equal(formatOwnerReportCount(1), '1 owner report');
  assert.equal(formatOwnerReportCount(1250), '1,250 owner reports');
});

test('known-issue renderers do not restore the zero-plus-owner claim', () => {
  const components = [
    'KnownIssueCard.tsx',
    'ConfidenceBadge.tsx',
    'CollapsibleMakeSection.tsx',
  ].map((file) => fs.readFileSync(path.resolve(process.cwd(), 'src', 'components', 'known-issues', file), 'utf8'));

  for (const source of components) {
    assert.doesNotMatch(source, /0\+ owners have reported this issue/i);
    assert.doesNotMatch(source, /\{issue\.reportCount\.toLocaleString\(\)\}\+ owners have reported this issue/);
  }
});
