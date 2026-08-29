import fs from 'node:fs';
import { getKnownIssueCommerce, isKnownIssueProductUrl, vendorMatchesProductUrl } from '../src/lib/known-issue-commerce';

type BuyLink = {
  vendor: string;
  url: string;
  linkType?: string;
  verified?: boolean;
};

type FixPart = {
  component: string;
  verified?: boolean;
  buyLinks?: BuyLink[];
};

type Decision = {
  id: string;
  fixParts?: FixPart[];
};

const file = process.argv[2];
if (!file) {
  throw new Error('Usage: tsx scripts/_audit-opus-session-306-render.ts <master-review.json>');
}

const document = JSON.parse(fs.readFileSync(file, 'utf8')) as { decisions?: Decision[] };
const decisions = document.decisions || [];
type CommerceInput = Parameters<typeof getKnownIssueCommerce>[0];
const hidden: Array<Record<string, unknown>> = [];
let storedLinks = 0;
let renderedLinks = 0;
let renderedIssues = 0;

for (const decision of decisions) {
  const commerce = getKnownIssueCommerce({
    fixParts: (decision.fixParts || []) as unknown as CommerceInput['fixParts'],
    communityRecommendations: [],
  });
  const rendered = new Set(
    commerce.fixParts.flatMap((part) => part.buyLinks || []).map((link) => {
      const url = new URL(link.url);
      url.hash = '';
      return `${link.vendor}\n${url.toString()}`;
    }),
  );
  if (rendered.size > 0) renderedIssues += 1;
  renderedLinks += rendered.size;

  for (const part of decision.fixParts || []) {
    for (const link of part.buyLinks || []) {
      storedLinks += 1;
      const url = new URL(link.url);
      url.hash = '';
      const key = `${link.vendor}\n${url.toString()}`;
      if (!rendered.has(key)) {
        hidden.push({
          issueId: decision.id,
          component: part.component,
          vendor: link.vendor,
          url: link.url,
          partVerified: part.verified === true,
          linkVerified: link.verified === true,
          productUrl: isKnownIssueProductUrl(link.url),
          vendorMatches: vendorMatchesProductUrl(link.vendor, link.url),
        });
      }
    }
  }
}

console.log(JSON.stringify({
  issues: decisions.length,
  storedLinks,
  renderedLinks,
  renderedIssues,
  hiddenLinks: hidden.length,
  hidden,
}, null, 2));

if (hidden.length > 0) process.exitCode = 1;
