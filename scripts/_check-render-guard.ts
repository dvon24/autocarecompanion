// Zero-AI: prove what the public commerce model will actually render before
// persisting a reviewed batch. This checks the complete public path, not only
// the URL helpers, and proves each make's approval module exactly matches it.
import fs from 'fs';
import { getKnownIssueCommerce } from '../src/lib/known-issue-commerce';

async function main(): Promise<void> {
const file = process.argv[2];
if (!file) throw new Error('Usage: tsx scripts/_check-render-guard.ts <gated-output.json>');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const issues = data.result.resolvedIssues;
type Entry = { issueId: string; vendor: string; url: string; reason?: string };

function canonicalUrl(value: string): string {
  const url = new URL(value);
  url.hash = '';
  return url.toString();
}

function fingerprint(value: string): string {
  const hash = (seed: number): string => {
    let result = (0x811c9dc5 ^ seed) >>> 0;
    for (let index = 0; index < value.length; index += 1) {
      result = Math.imul(result ^ value.charCodeAt(index), 0x01000193) >>> 0;
    }
    result = (result ^ (result >>> 16)) >>> 0;
    result = Math.imul(result, 0x85ebca6b) >>> 0;
    result = (result ^ (result >>> 13)) >>> 0;
    result = Math.imul(result, 0xc2b2ae35) >>> 0;
    result = (result ^ (result >>> 16)) >>> 0;
    return result.toString(16).padStart(8, '0');
  };
  return `${hash(0x9e3779b9)}${hash(0x243f6a88)}${hash(0xb7e15162)}`;
}

function linkKey(issueId: string, vendor: string, url: string): string {
  return `${issueId}\n${vendor}\n${canonicalUrl(url)}`;
}

const intentionalEntries: Entry[] = data.result.renderGuard?.intentionalExclusions || [];
const intentional = new Map(
  intentionalEntries.map((entry) => [linkKey(entry.issueId, entry.vendor, entry.url), entry.reason || 'intentional']),
);
const renderedCounts = new Map<string, number>();
const survivingIssues = new Set<string>();

for (const issue of issues) {
  const commerce = getKnownIssueCommerce(issue);
  for (const part of commerce.fixParts) {
    for (const link of part.buyLinks || []) {
      const key = linkKey(issue.id, link.vendor, link.url);
      renderedCounts.set(key, (renderedCounts.get(key) || 0) + 1);
      survivingIssues.add(issue.id);
    }
  }
}

let total = 0;
let rendered = 0;
let duplicateRemoved = 0;
const intentionalByReason: Record<string, number> = {};
const hiddenByVendor: Record<string, number> = {};
const unexpectedHidden: Entry[] = [];
const unexpectedAllowed: Entry[] = [];

for (const issue of issues) {
  const recallFirst = (issue.fixParts || []).some((part: { recallFirst?: boolean }) => part.recallFirst === true);
  const consumed = new Set<string>();
  for (const part of issue.fixParts || []) {
    for (const link of part.buyLinks || []) {
      total += 1;
      const key = linkKey(issue.id, link.vendor, link.url);
      const remaining = renderedCounts.get(key) || 0;
      const intentionalReason = intentional.get(key);
      if (remaining > 0) {
        renderedCounts.set(key, remaining - 1);
        rendered += 1;
        if (intentionalReason) unexpectedAllowed.push({ issueId: issue.id, vendor: link.vendor, url: link.url, reason: intentionalReason });
      } else if (consumed.has(key)) {
        duplicateRemoved += 1;
      } else {
        hiddenByVendor[link.vendor] = (hiddenByVendor[link.vendor] || 0) + 1;
        const reason = recallFirst ? 'recall-first' : intentionalReason;
        if (reason) intentionalByReason[reason] = (intentionalByReason[reason] || 0) + 1;
        else unexpectedHidden.push({ issueId: issue.id, vendor: link.vendor, url: link.url });
      }
      consumed.add(key);
    }
  }
}

const moduleMismatches: string[] = [];
for (const makeStat of data.result.stats.makes as Array<{ make: string }>) {
  const make = makeStat.make;
  const moduleName = make.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const approvalModule = await import(`../src/lib/known-issue-reviewed-retailer-links/${moduleName}.ts`);
  const expectedProducts = new Set<string>();
  const expectedVendors = new Set<string>();
  const expectedHosts = new Set<string>();
  for (const issue of issues.filter((candidate: { make: string }) => candidate.make === make)) {
    for (const part of issue.fixParts || []) {
      for (const link of part.buyLinks || []) {
        const key = linkKey(issue.id, link.vendor, link.url);
        if (link.linkType !== 'product' || intentional.has(key)) continue;
        const canonical = canonicalUrl(link.url);
        const host = new URL(canonical).hostname.toLowerCase().replace(/^www\./, '');
        expectedVendors.add(fingerprint(`${link.vendor.trim().toLowerCase()}\n${canonical}`));
        if (!/(^|\.)(amazon\.com|ebay\.com|rockauto\.com)$/.test(host)) {
          expectedProducts.add(fingerprint(canonical));
          expectedHosts.add(fingerprint(host));
        }
      }
    }
  }
  const comparisons: Array<[string, Set<string>, readonly string[]]> = [
    ['product URLs', expectedProducts, approvalModule.productUrlFingerprints],
    ['vendor URLs', expectedVendors, approvalModule.vendorUrlFingerprints],
    ['retailer hosts', expectedHosts, approvalModule.retailerHostFingerprints],
  ];
  for (const [label, expected, actual] of comparisons) {
    const actualSet = new Set(actual);
    if (actualSet.size !== expected.size || [...expected].some((value) => !actualSet.has(value))) {
      moduleMismatches.push(`${make} ${label}: expected ${expected.size}, module ${actualSet.size}`);
    }
  }
}

console.log(`gated links                    : ${total}`);
console.log(`actual public render links     : ${rendered}`);
console.log(`duplicates removed             : ${duplicateRemoved}`);
console.log(`issues with >=1 rendered link  : ${survivingIssues.size} of ${issues.length}`);
console.log(`intentional exclusions         : ${Object.values(intentionalByReason).reduce((sum, count) => sum + count, 0)}`);
console.log(`UNEXPECTED hidden links        : ${unexpectedHidden.length}`);
console.log(`UNEXPECTED allowed exclusions  : ${unexpectedAllowed.length}`);
console.log(`approval module mismatches     : ${moduleMismatches.length}`);
console.log('\nintentional exclusions, by reason:');
Object.entries(intentionalByReason).sort((a, b) => b[1] - a[1]).forEach(([key, value]) => console.log(`  ${String(value).padStart(3)}  ${key}`));
console.log('\nlinks hidden, by vendor:');
Object.entries(hiddenByVendor).sort((a, b) => b[1] - a[1]).forEach(([key, value]) => console.log(`  ${String(value).padStart(3)}  ${key}`));

if (unexpectedHidden.length || unexpectedAllowed.length || moduleMismatches.length) {
  for (const entry of unexpectedHidden.slice(0, 50)) console.error(`HIDDEN: ${entry.issueId} | ${entry.vendor} | ${entry.url}`);
  for (const entry of unexpectedAllowed.slice(0, 50)) console.error(`ALLOWED EXCLUSION: ${entry.issueId} | ${entry.vendor} | ${entry.url} | ${entry.reason}`);
  for (const mismatch of moduleMismatches) console.error(`MODULE: ${mismatch}`);
  process.exitCode = 1;
}
}

void main();
