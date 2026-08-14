/** Build fail-closed supplemental proposals from article-quoted PNs with reviewed fitment and exact links. */
import fs from 'node:fs';
import path from 'node:path';

interface QueueProposal {
  proposalId: string;
  id: string;
  component: string;
  articleScope: {
    make: string;
    model: string;
    years: number[];
    trims?: string[];
    engines?: string[];
    drivetrains?: string[];
    transmissions?: string[];
  };
  sourceEvidence: unknown;
  parts: Array<{
    role: string;
    component: string;
    supplier: string;
    oemPartNumber?: string;
    aftermarketXref?: string[];
    fitment?: Record<string, unknown>;
    buyLinks?: unknown[];
    verified?: boolean;
    note?: string;
  }>;
}

interface LinkRow {
  proposalId: string;
  issueId: string;
  partIndex: number;
  input: { partNumber: string };
  result: string;
  links: unknown[];
}

interface ReviewDecision {
  proposalId: string;
  issueId: string;
  partIndex: number;
  partNumber: string;
  verdict: string;
  reasonCodes?: string[];
  reviewedFitment?: Record<string, unknown> | null;
  reviewedComponent?: string | null;
  independentSources?: string[];
  reviewerReason?: string | null;
}

const pn = (value: unknown) => String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

function subset<T>(values: T[], scope: T[]): boolean {
  return values.every((value) => scope.includes(value));
}

function validateReviewedScope(proposal: QueueProposal, fitment: Record<string, unknown>) {
  const years = (fitment.years || []) as number[];
  if (!years.length || !subset(years, proposal.articleScope.years || [])) {
    throw new Error(`${proposal.proposalId}: reviewed years exceed or omit the article scope`);
  }
  for (const dimension of ['trims', 'drivetrains', 'transmissions'] as const) {
    const values = (fitment[dimension] || []) as string[];
    const articleValues = proposal.articleScope[dimension] || [];
    if (articleValues.length > 0 && !subset(values, articleValues)) {
      throw new Error(`${proposal.proposalId}: reviewed ${dimension} exceed article scope`);
    }
  }
}

export function buildReviewedQuotedPartProposals(
  queue: { snapshotHash?: string; make?: string; proposals?: QueueProposal[]; holds?: unknown[] },
  links: { linkEvidence?: LinkRow[] },
  review: { decisions?: ReviewDecision[] },
) {
  const queueRows = queue.proposals || [];
  const linkByKey = new Map((links.linkEvidence || []).map((row) => [`${row.proposalId}::${row.partIndex}`, row]));
  const reviewByKey = new Map((review.decisions || []).map((row) => [`${row.proposalId}::${row.partIndex}`, row]));
  const proposals: unknown[] = [];
  const dispositions: unknown[] = [];
  const seen = new Set<string>();

  for (const proposal of queueRows) {
    for (const [partIndex, part] of proposal.parts.entries()) {
      const key = `${proposal.proposalId}::${partIndex}`;
      if (seen.has(key)) throw new Error(`${key}: duplicate queue part`);
      seen.add(key);
      const link = linkByKey.get(key);
      if (!link || link.issueId !== proposal.id
        || pn(link.input.partNumber) !== pn(part.oemPartNumber || part.aftermarketXref?.[0])) {
        throw new Error(`${key}: exact link stage does not reconcile with the queue`);
      }
      const decision = reviewByKey.get(key);
      if (link.result !== 'exact-product-link') {
        dispositions.push({ proposalId: proposal.proposalId, issueId: proposal.id, partIndex, verdict: 'hold_no_exact_link' });
        continue;
      }
      if (!decision || decision.issueId !== proposal.id
        || pn(decision.partNumber) !== pn(part.oemPartNumber || part.aftermarketXref?.[0])) {
        throw new Error(`${key}: exact linked candidate has no identity-bound review`);
      }
      if (decision.verdict !== 'approve_reviewed_fitment') {
        dispositions.push({
          proposalId: proposal.proposalId,
          issueId: proposal.id,
          partIndex,
          verdict: decision.verdict,
          reasonCodes: decision.reasonCodes || [],
        });
        continue;
      }
      if (!decision.reviewedFitment || !link.links.length) throw new Error(`${key}: approval lacks fitment or product link`);
      validateReviewedScope(proposal, decision.reviewedFitment);
      const reviewedComponent = decision.reviewedComponent?.trim() || proposal.component;
      proposals.push({
        proposalId: proposal.proposalId,
        id: proposal.id,
        component: reviewedComponent,
        articleScope: proposal.articleScope,
        sourceEvidence: proposal.sourceEvidence,
        reviewEvidence: {
          independentSources: decision.independentSources || [],
          reviewerReason: decision.reviewerReason,
          originalComponent: proposal.component,
          reviewedComponent,
        },
        parts: [{
          ...part,
          component: reviewedComponent,
          fitment: decision.reviewedFitment,
          buyLinks: link.links,
          verified: false,
          note: 'Article-quoted PN, exact product identity, and independently reviewed narrow fitment. Independent make-level repair-role approval is still required.',
        }],
      });
      dispositions.push({ proposalId: proposal.proposalId, issueId: proposal.id, partIndex, verdict: 'proposed_for_independent_review' });
    }
  }
  if (linkByKey.size !== seen.size) throw new Error('Link-stage row count does not equal queue part count');
  return {
    schemaVersion: 1,
    artifactKind: 'known-issue-reviewed-quoted-part-proposals',
    snapshotHash: queue.snapshotHash,
    make: queue.make,
    status: 'IN_PROGRESS_INDEPENDENT_REVIEW_REQUIRED',
    queuePartCount: seen.size,
    proposalCount: proposals.length,
    heldOrBlockedCount: dispositions.filter((row) => (
      (row as { verdict: string }).verdict !== 'proposed_for_independent_review'
    )).length,
    manualNormalizationHoldCount: queue.holds?.length || 0,
    dispositions,
    proposals,
  };
}

function argValue(args: string[], flag: string): string {
  const index = args.indexOf(flag);
  if (index < 0 || !args[index + 1]) throw new Error(`${flag} is required`);
  return args[index + 1]!;
}

function main() {
  const args = process.argv.slice(2);
  const queueFile = path.resolve(argValue(args, '--queue'));
  const linkFile = path.resolve(argValue(args, '--links'));
  const reviewFile = path.resolve(argValue(args, '--review'));
  const outFile = path.resolve(argValue(args, '--out'));
  const output = buildReviewedQuotedPartProposals(
    JSON.parse(fs.readFileSync(queueFile, 'utf8')),
    JSON.parse(fs.readFileSync(linkFile, 'utf8')),
    JSON.parse(fs.readFileSync(reviewFile, 'utf8')),
  );
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({
    queueParts: output.queuePartCount,
    proposals: output.proposalCount,
    heldOrBlocked: output.heldOrBlockedCount,
    normalizationHolds: output.manualNormalizationHoldCount,
    output: outFile,
  }, null, 2));
}

if (require.main === module) {
  try { main(); } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
