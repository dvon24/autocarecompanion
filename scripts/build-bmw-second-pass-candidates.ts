import fs from 'node:fs';
import path from 'node:path';
import { isKnownIssueProductUrl } from '../src/lib/known-issue-commerce';

const root = path.resolve(process.cwd());
const snapshot = JSON.parse(fs.readFileSync(path.join(root, 'data', 'known-issues-catalog-deeplink-snapshot.json'), 'utf8'));
const ledger = JSON.parse(fs.readFileSync(path.join(root, 'data', 'bmw-repair-first-review', 'review-ledger.json'), 'utf8'));

const current = snapshot.records.filter((record: { make: string }) => record.make === 'BMW');
const currentById = new Map(current.map((record: { id: string }) => [record.id, record]));
const reviewedById = new Map(ledger.reviews.map((review: { issueId: string }) => [review.issueId, review]));

const candidateIssues = [];
const rejectedDestinations = [];

for (const record of current) {
  const review = reviewedById.get(record.id) as {
    destinations?: Array<{ label: string; url: string; scope: string; role: string }>;
  } | undefined;
  if (!review) continue;

  const direct = (review.destinations || []).filter((destination) => isKnownIssueProductUrl(destination.url));
  for (const destination of review.destinations || []) {
    if (!isKnownIssueProductUrl(destination.url)) {
      rejectedDestinations.push({ issueId: record.id, title: record.title, ...destination });
    }
  }
  if (!direct.length) continue;

  candidateIssues.push({
    id: record.id,
    make: record.make,
    model: record.model,
    years: record.years,
    trims: record.trims,
    engines: record.engines,
    title: record.title,
    solution: record.solution,
    fixParts: direct.map((destination, index) => ({
      component: destination.label,
      oemPartNumber: '',
      note: `${destination.role}. Fitment: ${destination.scope}`,
      buyLinks: [{
        vendor: new URL(destination.url).hostname.toLowerCase().replace(/^www\./, '').split('.')[0],
        url: destination.url,
        linkType: 'product',
        verified: false,
        affiliate: false,
      }],
      variants: [{ scope: destination.scope, note: destination.role, oemPartNumber: '' }],
      verified: false,
      recallFirst: false,
      provenance: `BMW repair-first second pass 2026-08-21 (${record.id} candidate ${index + 1})`,
    })),
  });
}

const reviewedIds = new Set(ledger.reviews.map((review: { issueId: string }) => review.issueId));
const newIssues = current.filter((record: { id: string }) => !reviewedIds.has(record.id));
const staleReviews = ledger.reviews.filter((review: { issueId: string }) => !currentById.has(review.issueId));

const serviceOrCatalogRole = /service|diagnos|recall|coverage|locator|official|campaign|software|dealer|inspection|programming|source|government|lookup|analysis|catalog|diagram|selector|route|warranty|repair network|installer|shop|reference|information|history|guidance/i;
const guardRejectedProductish = rejectedDestinations.filter((destination) => !serviceOrCatalogRole.test(destination.role || ''));
const guardRejectedByIssue = new Map<string, typeof guardRejectedProductish>();
for (const destination of guardRejectedProductish) {
  const rows = guardRejectedByIssue.get(destination.issueId) || [];
  rows.push(destination);
  guardRejectedByIssue.set(destination.issueId, rows);
}
const guardRejectedCandidateIssues = [...guardRejectedByIssue.entries()].map(([id, destinations]) => {
  const record = currentById.get(id) as Record<string, unknown>;
  return {
    id,
    make: record.make,
    model: record.model,
    years: record.years,
    trims: record.trims,
    engines: record.engines,
    title: record.title,
    solution: record.solution,
    fixParts: destinations.map((destination, index) => ({
      component: destination.label,
      oemPartNumber: '',
      note: `${destination.role}. Fitment: ${destination.scope}`,
      buyLinks: [{
        vendor: new URL(destination.url).hostname.toLowerCase().replace(/^www\./, '').split('.')[0],
        url: destination.url,
        linkType: 'product',
        verified: false,
        affiliate: false,
      }],
      variants: [{ scope: destination.scope, note: destination.role, oemPartNumber: '' }],
      verified: false,
      recallFirst: false,
      provenance: `BMW repair-first second pass guard review 2026-08-21 (${id} candidate ${index + 1})`,
    })),
  };
});

const output = {
  schemaVersion: 1,
  generatedOn: '2026-08-21',
  snapshotHash: snapshot.snapshotHash,
  summary: {
    currentPublishedBmwIssues: current.length,
    priorReviewedIssuesStillCurrent: current.length - newIssues.length,
    newIssuesNeedingFullReview: newIssues.length,
    stalePriorReviews: staleReviews.length,
    candidateIssues: candidateIssues.length,
    candidateLinks: candidateIssues.reduce((sum, issue) => sum + issue.fixParts.length, 0),
    rejectedOrNonProductDestinations: rejectedDestinations.length,
    guardRejectedProductishIssues: guardRejectedCandidateIssues.length,
    guardRejectedProductishLinks: guardRejectedProductish.length,
  },
  newIssues: newIssues.map((record: { id: string; model: string; years: number[]; trims: string[]; engines: string[]; title: string; solution: string }) => ({
    id: record.id,
    model: record.model,
    years: record.years,
    trims: record.trims,
    engines: record.engines,
    title: record.title,
    solution: record.solution,
  })),
  rejectedDestinations,
  result: { resolvedIssues: candidateIssues },
};

const outputPath = path.join(root, 'data', 'bmw-second-pass-candidates-2026-08-21.json');
fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
const guardRejectedPath = path.join(root, 'data', 'bmw-second-pass-guard-rejected-candidates-2026-08-21.json');
fs.writeFileSync(guardRejectedPath, `${JSON.stringify({ result: { resolvedIssues: guardRejectedCandidateIssues } }, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ outputPath: path.relative(root, outputPath), ...output.summary }, null, 2));
