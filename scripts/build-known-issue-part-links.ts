/** Resolve staged, catalog-fit part numbers to exact direct product pages. No DB writes. */
import fs from 'node:fs';
import path from 'node:path';
import { config } from 'dotenv';
import { buildPartLinks, type BuildInput, type BuiltLink } from '../src/lib/part-link-builder';

config({ path: process.env.DOTENV_CONFIG_PATH || '.env.local' });

interface ProposalPart {
  component: string;
  supplier: string;
  aftermarketXref: string[];
  fitment?: { years?: number[]; engines?: string[]; trims?: string[] };
  buyLinks?: BuiltLink[];
  verified?: boolean;
}
interface Proposal {
  proposalId?: string;
  id: string;
  articleScope?: { make?: string; model?: string } | null;
  parts: ProposalPart[];
}

interface LinkEvidenceRow {
  proposalId: string;
  issueId: string;
  partIndex: number;
  input: BuildInput;
  result: string;
  links: BuiltLink[];
}

function value(args: string[], flag: string): string {
  const index = args.indexOf(flag);
  if (index < 0 || !args[index + 1]) throw new Error(`${flag} is required`);
  return args[index + 1]!;
}
const keyFor = (input: BuildInput) => JSON.stringify(input);

export function buildReviewedRetailerCandidates(make: string, evidence: unknown[]) {
  const normalizedMake = make.trim();
  if (!normalizedMake) throw new Error('--make is required with --out-candidates');
  const candidates = (evidence as LinkEvidenceRow[])
    .filter((row) => row.result === 'exact-product-link' && row.links.length > 0)
    .map((row) => ({
      proposalId: row.proposalId,
      issueId: row.issueId,
      partIndex: row.partIndex,
      partNumber: row.input.partNumber,
      links: row.links,
    }));
  return {
    schemaVersion: 1,
    artifactKind: 'known-issue-reviewed-retailer-candidates',
    make: normalizedMake,
    status: 'LINK_IDENTITY_REVIEWED_NOT_APPLIED',
    productionApplied: false,
    selectedCandidateCount: candidates.length,
    candidates,
  };
}

function structuralPart(part: ProposalPart): ProposalPart {
  const value = JSON.parse(JSON.stringify(part)) as ProposalPart;
  value.buyLinks = [];
  return value;
}

function linkInput(proposal: Proposal, part: ProposalPart): BuildInput {
  const partNumber = String(part.aftermarketXref?.[0] || '').trim();
  const years = part.fitment?.years || [];
  return {
    partNumber,
    supplier: part.supplier,
    component: part.component,
    make: proposal.articleScope?.make,
    model: proposal.articleScope?.model,
    year: years[0],
    engine: part.fitment?.engines?.[0],
    trim: part.fitment?.trims?.length === 1 ? part.fitment.trims[0] : undefined,
  };
}

export function rebindPreservedProposalLinks(
  proposals: Proposal[],
  previous: Proposal[],
): { proposals: Proposal[]; evidence: unknown[] } {
  const out = JSON.parse(JSON.stringify(proposals)) as Proposal[];
  const previousById = new Map(previous.map((proposal) => [proposal.proposalId || proposal.id, proposal]));
  const evidence: unknown[] = [];
  for (const proposal of out) {
    const prior = previousById.get(proposal.proposalId || proposal.id);
    for (const [partIndex, part] of proposal.parts.entries()) {
      const priorPart = prior?.parts[partIndex];
      const samePart = priorPart
        && JSON.stringify(structuralPart(priorPart)) === JSON.stringify(structuralPart(part));
      const links = samePart ? JSON.parse(JSON.stringify(priorPart.buyLinks || [])) as BuiltLink[] : [];
      part.buyLinks = links;
      part.verified = false;
      evidence.push({
        proposalId: proposal.proposalId || proposal.id,
        issueId: proposal.id,
        partIndex,
        input: linkInput(proposal, part),
        result: links.length ? 'exact-product-link' : 'no-exact-product-link',
        links,
      });
    }
  }
  return { proposals: out, evidence };
}

export async function resolveProposalLinks(
  proposals: Proposal[],
  resolve?: Parameters<typeof buildPartLinks>[1][number],
): Promise<{ proposals: Proposal[]; evidence: unknown[] }> {
  // eBay reads its credentials at module initialization. Import it only after
  // dotenv has run; a static import is hoisted and silently disables the
  // resolver when this script is launched with DOTENV_CONFIG_PATH.
  const activeResolver = resolve
    || (await import('../src/lib/ebay-part-link-resolver')).ebayPartLinkResolver;
  const cache = new Map<string, Promise<BuiltLink[]>>();
  const evidence: unknown[] = [];
  const out = JSON.parse(JSON.stringify(proposals)) as Proposal[];
  const tasks: Array<{ proposal: Proposal; part: ProposalPart; partIndex: number; input: BuildInput }> = [];
  for (const proposal of out) {
    for (const [partIndex, part] of proposal.parts.entries()) {
      const partNumber = String(part.aftermarketXref?.[0] || '').trim();
      if (!partNumber) continue;
      const input = linkInput(proposal, part);
      tasks.push({ proposal, part, partIndex, input });
    }
  }
  let next = 0;
  const worker = async () => {
    while (next < tasks.length) {
      const taskIndex = next++;
      const { proposal, part, partIndex, input } = tasks[taskIndex]!;
      const key = keyFor(input);
      // The current eBay resolver can return only one merchant, but the stage
      // contract allows a future manufacturer/OEM-retailer resolver plus one
      // vendor-distinct alternate. Keep the cap aligned with public commerce.
      if (!cache.has(key)) cache.set(key, buildPartLinks(input, [activeResolver], { maxLinks: 2 }));
      const links = await cache.get(key)!;
      // Link identity can be verified while repair-role approval remains false.
      part.buyLinks = links;
      part.verified = false;
      evidence[taskIndex] = {
        proposalId: proposal.proposalId || proposal.id,
        issueId: proposal.id,
        partIndex,
        input,
        result: links.length ? 'exact-product-link' : 'no-exact-product-link',
        links,
      };
    }
  };
  await Promise.all(Array.from({ length: Math.min(4, tasks.length) }, worker));
  return { proposals: out, evidence };
}

async function main() {
  const args = process.argv.slice(2);
  const inputFile = path.resolve(value(args, '--in'));
  const outputFile = path.resolve(value(args, '--out'));
  const doc = JSON.parse(fs.readFileSync(inputFile, 'utf8')) as { proposals: Proposal[]; [key: string]: unknown };
  const preserveIndex = args.indexOf('--preserve-from');
  const preserved = preserveIndex >= 0 && args[preserveIndex + 1]
    ? JSON.parse(fs.readFileSync(path.resolve(args[preserveIndex + 1]!), 'utf8')) as { proposals?: Proposal[] }
    : null;
  const resolved = preserved
    ? rebindPreservedProposalLinks(doc.proposals || [], preserved.proposals || [])
    : await resolveProposalLinks(doc.proposals || []);
  fs.writeFileSync(outputFile, `${JSON.stringify({
    ...doc,
    generatedFrom: path.relative(process.cwd(), inputFile),
    linkGuardrail: 'Exact product-page identity only. Repair role remains unapproved and nothing is applied.',
    proposals: resolved.proposals,
    linkEvidence: resolved.evidence,
  }, null, 2)}\n`);
  const linked = resolved.evidence.filter((entry) => (entry as { result: string }).result === 'exact-product-link').length;
  const candidatesIndex = args.indexOf('--out-candidates');
  if (candidatesIndex >= 0) {
    const candidatesFile = args[candidatesIndex + 1];
    if (!candidatesFile) throw new Error('--out-candidates requires a path');
    const make = value(args, '--make');
    fs.writeFileSync(
      path.resolve(candidatesFile),
      `${JSON.stringify(buildReviewedRetailerCandidates(make, resolved.evidence), null, 2)}\n`,
    );
  }
  console.log(JSON.stringify({ proposals: resolved.proposals.length, partRows: resolved.evidence.length, linked, heldNoExactLink: resolved.evidence.length - linked, output: outputFile }, null, 2));
}

if (require.main === module) main().catch((error) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
