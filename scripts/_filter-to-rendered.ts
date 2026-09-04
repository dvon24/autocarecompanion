// Reduce a gated fix-parts batch to exactly what the public commerce model will
// render. The buy-link gate proves a link is LIVE; it says nothing about whether
// the reviewed-retailer approval index lets it render. Persisting the difference
// writes fixParts that count as coverage in every query and show the reader
// nothing. This drops those, and any part or issue left with no rendering link.
//
// Usage: tsx scripts/_filter-to-rendered.ts <gated.json> <out.json>
import fs from 'fs';
import { getKnownIssueCommerce } from '../src/lib/known-issue-commerce';

const [file, out] = process.argv.slice(2);
if (!file || !out) throw new Error('usage: tsx scripts/_filter-to-rendered.ts <gated.json> <out.json>');

const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const issues = data.result.resolvedIssues as Array<Record<string, any>>;

const key = (vendor: string, url: string): string => {
  const u = new URL(url);
  u.hash = '';
  return `${vendor}\n${u.toString()}`;
};

let keptLinks = 0, droppedLinks = 0, droppedParts = 0;
const kept = [];
for (const issue of issues) {
  const renders = new Set<string>();
  for (const part of getKnownIssueCommerce(issue as any).fixParts) {
    for (const link of part.buyLinks || []) renders.add(key(link.vendor, link.url));
  }
  const parts = [];
  for (const part of issue.fixParts || []) {
    const links = (part.buyLinks || []).filter((l: any) => {
      const ok = l && l.url && renders.has(key(l.vendor, l.url));
      if (ok) keptLinks += 1; else droppedLinks += 1;
      return ok;
    });
    if (links.length) parts.push({ ...part, buyLinks: links });
    else droppedParts += 1;
  }
  if (parts.length) kept.push({ ...issue, fixParts: parts });
}

fs.writeFileSync(out, JSON.stringify({ ...data, result: { ...data.result, resolvedIssues: kept } }, null, 2));
console.log(`issues : ${kept.length} of ${issues.length}`);
console.log(`parts  : dropped ${droppedParts} with no rendering link`);
console.log(`links  : kept ${keptLinks}, dropped ${droppedLinks} that the approval index hides`);
console.log(`wrote ${out}`);
