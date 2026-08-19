import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import { isKnownIssueProductUrl, vendorMatchesProductUrl } from './known-issue-commerce';

type BuyLink = { vendor: string; url: string };
type Manifest = { issues: Array<{ id: string; after: { fixParts: Array<{ buyLinks: BuyLink[] }> } }> };

const manifest = JSON.parse(fs.readFileSync(
  path.resolve(process.cwd(), 'data/acura-corrected-link-release/final-target.json'),
  'utf8',
)) as Manifest;

test('every approved Acura destination passes the storefront product guard', () => {
  const failures: string[] = [];
  for (const issue of manifest.issues) {
    for (const part of issue.after.fixParts) {
      for (const link of part.buyLinks) {
        if (!isKnownIssueProductUrl(link.url)) failures.push(`${issue.id}: product guard: ${link.url}`);
        if (!vendorMatchesProductUrl(link.vendor, link.url)) failures.push(`${issue.id}: vendor guard: ${link.vendor} ${link.url}`);
      }
    }
  }
  assert.deepEqual(failures, []);
});
