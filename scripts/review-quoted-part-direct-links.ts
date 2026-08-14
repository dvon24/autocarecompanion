/** Conservative first-pass review of exact-item links sourced from article-quoted part numbers. */
import fs from 'node:fs';
import path from 'node:path';

interface LinkEvidenceRow {
  proposalId: string;
  issueId: string;
  partIndex: number;
  input: { partNumber: string; component?: string; year?: number; engine?: string };
  result: string;
  links: Array<{
    url: string;
    productIdentity?: {
      observedListingTitle?: string;
      productId?: string;
      matchedPartNumber?: string;
      matchedPartNumberSource?: string;
    };
  }>;
}

interface ManualFitmentEvidence {
  proposalId: string;
  issueId: string;
  partIndex: number;
  partNumber: string;
  verdict: 'approve_fitment' | 'block_wrong_repair_role' | 'block_fitment';
  reviewedFitment?: {
    years?: number[];
    engines?: string[];
    trims?: string[];
    drivetrains?: string[];
    transmissions?: string[];
  };
  reviewedComponent?: string;
  sourceUrls: string[];
  reason: string;
}

function displacement(value: unknown): string {
  return String(value || '').toUpperCase().match(/\b\d(?:\.\d)?\s*(?:L|T)\b/)?.[0]?.replace(/\s+/g, '')
    ?.replace(/T$/, 'L') || '';
}

function normalizedPartNumber(value: unknown): string {
  return String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function titlePartNumbers(title: string, requested: string): string[] {
  const requestedLength = normalizedPartNumber(requested).length;
  return [...new Set([...title.toUpperCase().matchAll(/\b[A-Z0-9][A-Z0-9-]{6,17}\b/g)]
    .map((match) => normalizedPartNumber(match[0]))
    .filter((token) => /[A-Z]/.test(token) && /\d/.test(token))
    .filter((token) => Math.abs(token.length - requestedLength) <= 2))];
}

function listedYears(title: string): number[] {
  const years = new Set<number>();
  for (const match of title.matchAll(/\b(19\d{2}|20\d{2})(?:\s*[-–]\s*(19\d{2}|20\d{2}|\d{2}))?/g)) {
    const from = Number(match[1]);
    let to = match[2] ? Number(match[2]) : from;
    if (to < 100) to += Math.floor(from / 100) * 100;
    if (to < from || to - from > 40) continue;
    for (let year = from; year <= to; year += 1) years.add(year);
  }
  return [...years].sort((a, b) => a - b);
}

export function scopeConflict(row: LinkEvidenceRow): string[] {
  const identity = row.links[0]?.productIdentity;
  const title = String(identity?.observedListingTitle || '');
  const conflicts: string[] = [];
  const years = listedYears(title);
  if (row.input.year && years.length > 0 && !years.includes(row.input.year)) {
    conflicts.push('listing-title-year-excludes-requested-application');
  }
  const requestedDisplacement = displacement(row.input.engine);
  const listingDisplacements = [...new Set([...title.matchAll(/\b\d(?:\.\d)?\s*(?:L|T)\b/ig)]
    .map((match) => displacement(match[0])).filter(Boolean))];
  if (requestedDisplacement && listingDisplacements.length > 0
    && !listingDisplacements.includes(requestedDisplacement)) {
    conflicts.push('listing-title-engine-displacement-conflicts');
  }
  const component = String(row.input.component || '').toLowerCase();
  const listing = title.toLowerCase();
  if (/\bleft\b/.test(component) && /\bright\b/.test(listing) && !/\bleft\b/.test(listing)) {
    conflicts.push('listing-title-side-conflicts');
  }
  if (/\bright\b/.test(component) && /\bleft\b/.test(listing) && !/\bright\b/.test(listing)) {
    conflicts.push('listing-title-side-conflicts');
  }
  const requestedPartNumber = normalizedPartNumber(row.input.partNumber);
  const visiblePartNumbers = titlePartNumbers(title, row.input.partNumber);
  const titleNamesRequestedBase = visiblePartNumbers.some((partNumber) => (
    requestedPartNumber.startsWith(partNumber) || partNumber.startsWith(requestedPartNumber)
  ));
  if (identity?.matchedPartNumberSource === 'item-specifics'
    && visiblePartNumbers.length > 0
    && !titleNamesRequestedBase) {
    conflicts.push('listing-title-identifies-different-part-number');
  }
  return conflicts;
}

export function reviewQuotedPartLinks(
  doc: { snapshotHash?: string; make?: string; linkEvidence?: LinkEvidenceRow[] },
  manualEvidence: ManualFitmentEvidence[] = [],
) {
  const linked = (doc.linkEvidence || []).filter((row) => row.result === 'exact-product-link');
  const manualByKey = new Map<string, ManualFitmentEvidence>();
  for (const row of manualEvidence) {
    const key = `${row.proposalId}::${row.partIndex}`;
    if (manualByKey.has(key)) throw new Error(`${key}: duplicate manual fitment evidence`);
    if (!row.sourceUrls?.length || !row.reason?.trim()) throw new Error(`${key}: reviewed evidence needs sources and a reason`);
    if (row.reviewedComponent !== undefined) {
      if (row.verdict !== 'approve_fitment') throw new Error(`${key}: component correction requires approved fitment`);
      const reviewedComponent = row.reviewedComponent.trim();
      if (reviewedComponent.length < 3 || reviewedComponent.length > 160 || /[\r\n<>]/.test(reviewedComponent)) {
        throw new Error(`${key}: reviewed component is invalid`);
      }
      row.reviewedComponent = reviewedComponent;
    }
    manualByKey.set(key, row);
  }
  const decisions = linked.map((row) => {
    const conflicts = scopeConflict(row);
    const manual = manualByKey.get(`${row.proposalId}::${row.partIndex}`);
    if (manual && (manual.issueId !== row.issueId
      || normalizedPartNumber(manual.partNumber) !== normalizedPartNumber(row.input.partNumber))) {
      throw new Error(`${row.proposalId}::${row.partIndex}: manual evidence identity mismatch`);
    }
    let verdict = conflicts.length ? 'block_listing_scope_conflict' : 'hold_manual_fitment_confirmation';
    let reasonCodes = conflicts.length ? conflicts : ['article-quoted-part-number-has-no-independent-fitment-matrix'];
    if (!conflicts.length && manual?.verdict === 'approve_fitment') {
      if (!manual.reviewedFitment?.years?.length) {
        throw new Error(`${row.proposalId}::${row.partIndex}: approved fitment needs at least one reviewed year`);
      }
      verdict = 'approve_reviewed_fitment';
      reasonCodes = ['independent-fitment-source-reviewed'];
    } else if (!conflicts.length && manual?.verdict.startsWith('block_')) {
      verdict = manual.verdict;
      reasonCodes = [manual.verdict === 'block_wrong_repair_role'
        ? 'quoted-part-does-not-repair-the-known-issue'
        : 'independent-source-disproves-requested-fitment'];
    }
    return {
      proposalId: row.proposalId,
      issueId: row.issueId,
      partIndex: row.partIndex,
      partNumber: row.input.partNumber,
      verdict,
      reasonCodes,
      productUrl: row.links[0]?.url || null,
      productIdentity: row.links[0]?.productIdentity || null,
      requestedApplication: {
        year: row.input.year || null,
        engine: row.input.engine || null,
        component: row.input.component || null,
      },
      reviewedFitment: manual?.reviewedFitment || null,
      reviewedComponent: manual?.reviewedComponent || null,
      independentSources: manual?.sourceUrls || [],
      reviewerReason: manual?.reason || null,
    };
  });
  const linkedKeys = new Set(linked.map((row) => `${row.proposalId}::${row.partIndex}`));
  for (const key of manualByKey.keys()) {
    if (!linkedKeys.has(key)) throw new Error(`${key}: manual evidence has no exact linked candidate`);
  }
  const approvedCount = decisions.filter((row) => row.verdict === 'approve_reviewed_fitment').length;
  return {
    schemaVersion: 1,
    artifactKind: 'known-issue-quoted-part-direct-link-review',
    snapshotHash: doc.snapshotHash,
    make: doc.make,
    status: approvedCount > 0 ? 'IN_PROGRESS_PARTIAL_REVIEW' : 'IN_PROGRESS_NO_LINK_APPROVALS',
    exactProductIdentityCount: linked.length,
    blockedConflictCount: decisions.filter((row) => row.verdict === 'block_listing_scope_conflict').length,
    blockedCount: decisions.filter((row) => row.verdict.startsWith('block_')).length,
    manualFitmentHoldCount: decisions.filter((row) => row.verdict === 'hold_manual_fitment_confirmation').length,
    approvedCount,
    decisions,
  };
}

function argValue(args: string[], flag: string): string {
  const index = args.indexOf(flag);
  if (index < 0 || !args[index + 1]) throw new Error(`${flag} is required`);
  return args[index + 1]!;
}

function main() {
  const args = process.argv.slice(2);
  const inFile = path.resolve(argValue(args, '--in'));
  const outFile = path.resolve(argValue(args, '--out'));
  const evidenceIndex = args.indexOf('--fitment-evidence');
  const manualEvidence = evidenceIndex >= 0 && args[evidenceIndex + 1]
    ? JSON.parse(fs.readFileSync(path.resolve(args[evidenceIndex + 1]!), 'utf8')).evidence || []
    : [];
  const review = reviewQuotedPartLinks(JSON.parse(fs.readFileSync(inFile, 'utf8')), manualEvidence);
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, `${JSON.stringify(review, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({
    output: outFile,
    exact: review.exactProductIdentityCount,
    blocked: review.blockedCount,
    held: review.manualFitmentHoldCount,
    approved: review.approvedCount,
  }, null, 2));
}

if (require.main === module) {
  try { main(); } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
