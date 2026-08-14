/** Summarize legacy commerce that an exact quoted-PN candidate could replace after review. */
import fs from 'node:fs';
import path from 'node:path';

const pn = (value: unknown) => String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

interface SourceClaim {
  claimId: string;
  system: string;
  partNumber?: string;
  oemPartNumber?: string;
  links?: Array<{ field?: string; url?: string; error?: string }>;
}

interface SourceRecord { id: string; claims?: SourceClaim[] }
interface EvidenceRow { issueId: string; result: string; input: { partNumber: string } }
interface ReviewRow { issueId: string; partNumber: string; verdict: string; reasonCodes?: string[] }

export function buildQuotedPartCommerceGapSummary(
  source: { make?: string; snapshotHash?: string; records?: SourceRecord[] },
  evidence: { linkEvidence?: EvidenceRow[] },
  review: { decisions?: ReviewRow[] },
) {
  const exact = (evidence.linkEvidence || []).filter((row) => row.result === 'exact-product-link');
  const exactKeys = new Set<string>(exact.map((row) => `${row.issueId}|${pn(row.input.partNumber)}`));
  const reviewByKey = new Map<string, ReviewRow>((review.decisions || [])
    .map((row) => [`${row.issueId}|${pn(row.partNumber)}`, row]));
  const matchingClaims: Array<{
    issueId: string;
    claimId: string;
    system: string;
    partNumber: string;
    legacyLinkCount: number;
    invalidLegacyLinkCount: number;
    invalidReasons: string[];
    candidateVerdict: string;
    candidateReasonCodes: string[];
  }> = [];
  for (const record of source.records || []) {
    for (const claim of record.claims || []) {
      const partNumber = claim.oemPartNumber || claim.partNumber || '';
      const key = `${record.id}|${pn(partNumber)}`;
      if (!exactKeys.has(key)) continue;
      const links = claim.links || [];
      const decision = reviewByKey.get(key);
      matchingClaims.push({
        issueId: record.id,
        claimId: claim.claimId,
        system: claim.system,
        partNumber,
        legacyLinkCount: links.length,
        invalidLegacyLinkCount: links.filter((link) => Boolean(link.error)).length,
        invalidReasons: [...new Set(links.map((link) => link.error)
          .filter((value): value is string => Boolean(value)))].sort(),
        candidateVerdict: decision?.verdict || 'missing-review',
        candidateReasonCodes: decision?.reasonCodes || [],
      });
    }
  }
  const invalidLegacyLinks = matchingClaims.reduce((sum, value) => sum + value.invalidLegacyLinkCount, 0);
  return {
    schemaVersion: 1,
    artifactKind: 'known-issue-quoted-part-commerce-gap-summary',
    make: source.make,
    snapshotHash: source.snapshotHash,
    exactEvidenceRowCount: exact.length,
    exactIssuePartPairCount: exactKeys.size,
    matchingLegacyClaimCount: matchingClaims.length,
    matchingClaimsWithInvalidLinks: matchingClaims.filter((value) => value.invalidLegacyLinkCount > 0).length,
    invalidLegacyLinkCount: invalidLegacyLinks,
    approvedReplacementCount: (review.decisions || []).filter((row) => row.verdict.startsWith('approve_')).length,
    blockedCandidateCount: (review.decisions || []).filter((row) => row.verdict.startsWith('block_')).length,
    heldCandidateCount: (review.decisions || []).filter((row) => row.verdict.startsWith('hold_')).length,
    guardrail: 'Legacy search links remain unchanged until an exact candidate independently passes repair-role and fitment review.',
    matchingClaims,
  };
}

function argValue(args: string[], flag: string): string {
  const index = args.indexOf(flag);
  if (index < 0 || !args[index + 1]) throw new Error(`${flag} is required`);
  return args[index + 1]!;
}

function main() {
  const args = process.argv.slice(2);
  const sourceFile = path.resolve(argValue(args, '--source'));
  const evidenceFile = path.resolve(argValue(args, '--evidence'));
  const reviewFile = path.resolve(argValue(args, '--review'));
  const outFile = path.resolve(argValue(args, '--out'));
  const summary = buildQuotedPartCommerceGapSummary(
    JSON.parse(fs.readFileSync(sourceFile, 'utf8')),
    JSON.parse(fs.readFileSync(evidenceFile, 'utf8')),
    JSON.parse(fs.readFileSync(reviewFile, 'utf8')),
  );
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({
    exact: summary.exactEvidenceRowCount,
    claims: summary.matchingLegacyClaimCount,
    invalidLinks: summary.invalidLegacyLinkCount,
    approved: summary.approvedReplacementCount,
    blocked: summary.blockedCandidateCount,
    held: summary.heldCandidateCount,
    output: outFile,
  }, null, 2));
}

if (require.main === module) {
  try { main(); } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
