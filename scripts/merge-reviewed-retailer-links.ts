/** Merge human-reviewed exact retailer product pages into stage 05. No network or DB writes. */
import fs from 'node:fs';
import path from 'node:path';
import {
  buildPartLinks,
  type BuildInput,
  type BuiltLink,
  type LinkCandidate,
} from '../src/lib/part-link-builder';

interface ReviewedCandidate {
  proposalId: string;
  partIndex: number;
  candidate?: LinkCandidate;
  links?: BuiltLink[];
}

interface ProposalPart {
  component: string;
  supplier: string;
  aftermarketXref?: string[];
  fitment?: { years?: number[]; engines?: string[]; trims?: string[] };
  buyLinks?: BuiltLink[];
}

interface Proposal {
  proposalId: string;
  id: string;
  articleScope?: { make?: string; model?: string };
  parts: ProposalPart[];
}

interface LinkStage {
  proposals: Proposal[];
  linkEvidence: Array<{
    proposalId: string;
    issueId: string;
    partIndex: number;
    input: BuildInput;
    result: 'exact-product-link' | 'no-exact-product-link';
    links: unknown[];
  }>;
  [key: string]: unknown;
}

const normalizedPartNumber = (value: unknown) => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');

function candidateFromBuiltLink(link: BuiltLink): LinkCandidate {
  return {
    vendor: link.vendor,
    url: link.url,
    via: link.via,
    matchedPartNumber: link.productIdentity.matchedPartNumber,
    productId: link.productIdentity.productId,
    listingTitleHash: link.productIdentity.listingTitleHash,
    observedListingTitle: link.productIdentity.observedListingTitle,
    matchedPartNumberSource: link.productIdentity.matchedPartNumberSource,
    observedPartNumberField: link.productIdentity.observedPartNumberField,
    observedPartNumberValue: link.productIdentity.observedPartNumberValue,
  };
}

function candidatePriority(candidate: LinkCandidate): number {
  const host = new URL(candidate.url).hostname.toLowerCase().replace(/^www\./, '');
  if (host === 'ebay.com' || host.endsWith('.ebay.com')) return 1;
  if (host === 'amazon.com' || host.endsWith('.amazon.com')) return 2;
  return 0;
}

function reviewedCandidates(row: ReviewedCandidate): LinkCandidate[] {
  if (row.candidate) return [row.candidate];
  return (row.links || []).map(candidateFromBuiltLink);
}

function value(args: string[], flag: string): string {
  const index = args.indexOf(flag);
  if (index < 0 || !args[index + 1]) throw new Error(`${flag} is required`);
  return args[index + 1]!;
}

function expectedInput(proposal: Proposal, part: ProposalPart): BuildInput {
  const years = part.fitment?.years || [];
  return {
    partNumber: String(part.aftermarketXref?.[0] || '').trim(),
    supplier: part.supplier,
    component: part.component,
    make: proposal.articleScope?.make,
    model: proposal.articleScope?.model,
    year: years[0],
    engine: part.fitment?.engines?.[0],
    ...(part.fitment?.trims?.length === 1 ? { trim: part.fitment.trims[0] } : {}),
  };
}

export async function mergeReviewedRetailerLinks(
  stage: LinkStage,
  reviewed: ReviewedCandidate[],
): Promise<LinkStage> {
  const output = JSON.parse(JSON.stringify(stage)) as LinkStage;
  const grouped = new Map<string, ReviewedCandidate[]>();

  for (const row of reviewed) {
    const key = `${row.proposalId}::${row.partIndex}`;
    const rows = grouped.get(key) || [];
    rows.push(row);
    grouped.set(key, rows);
  }

  for (const [key, rows] of grouped) {
    const { proposalId, partIndex } = rows[0]!;
    const proposal = output.proposals.find((item) => item.proposalId === proposalId);
    const part = proposal?.parts[partIndex];
    if (!proposal || !part) throw new Error(`${key}: proposal part does not exist`);
    const input = expectedInput(proposal, part);
    const addedCandidates = rows.flatMap(reviewedCandidates);
    if (!addedCandidates.length) throw new Error(`${key}: reviewed retailer candidate is missing`);
    for (const candidate of addedCandidates) {
      if (!input.partNumber
        || normalizedPartNumber(candidate.matchedPartNumber) !== normalizedPartNumber(input.partNumber)) {
        throw new Error(`${key}: retailer identity does not match the proposal part number`);
      }
      const accepted = await buildPartLinks(input, [async () => [candidate]], { maxLinks: 1 });
      if (accepted.length !== 1) {
        throw new Error(`${key}: reviewed retailer candidate failed the product-identity gate`);
      }
    }

    const retainedCandidates = (part.buyLinks || []).map(candidateFromBuiltLink);
    const combined = [...retainedCandidates, ...addedCandidates]
      .sort((left, right) => candidatePriority(left) - candidatePriority(right));
    const links = await buildPartLinks(input, [async () => combined], { maxLinks: 2 });
    if (!links.length) throw new Error(`${key}: no safe retailer link survived the merge`);
    part.buyLinks = links;
    const evidence = output.linkEvidence.find((item) => item.proposalId === proposalId && item.partIndex === partIndex);
    if (!evidence || evidence.issueId !== proposal.id) throw new Error(`${key}: stage-05 link evidence is missing`);
    evidence.input = input;
    evidence.result = 'exact-product-link';
    evidence.links = links;
  }
  return output;
}

async function main() {
  const args = process.argv.slice(2);
  const stageFile = path.resolve(value(args, '--stage'));
  const reviewedFile = path.resolve(value(args, '--reviewed'));
  const outputFile = path.resolve(value(args, '--out'));
  const stage = JSON.parse(fs.readFileSync(stageFile, 'utf8')) as LinkStage;
  const reviewedDoc = JSON.parse(fs.readFileSync(reviewedFile, 'utf8')) as { candidates?: ReviewedCandidate[] };
  const output = await mergeReviewedRetailerLinks(stage, reviewedDoc.candidates || []);
  fs.writeFileSync(outputFile, `${JSON.stringify(output, null, 2)}\n`);
  console.log(JSON.stringify({ merged: reviewedDoc.candidates?.length || 0, output: outputFile }, null, 2));
}

if (require.main === module) main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
