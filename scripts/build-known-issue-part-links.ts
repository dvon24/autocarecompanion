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

function value(args: string[], flag: string): string {
  const index = args.indexOf(flag);
  if (index < 0 || !args[index + 1]) throw new Error(`${flag} is required`);
  return args[index + 1]!;
}
const keyFor = (input: BuildInput) => JSON.stringify(input);

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
      const years = part.fitment?.years || [];
      const input: BuildInput = {
        partNumber,
        supplier: part.supplier,
        component: part.component,
        make: proposal.articleScope?.make,
        model: proposal.articleScope?.model,
        year: years[0],
        engine: part.fitment?.engines?.[0],
        trim: part.fitment?.trims?.length === 1 ? part.fitment.trims[0] : undefined,
      };
      tasks.push({ proposal, part, partIndex, input });
    }
  }
  let next = 0;
  const worker = async () => {
    while (next < tasks.length) {
      const taskIndex = next++;
      const { proposal, part, partIndex, input } = tasks[taskIndex]!;
      const key = keyFor(input);
      if (!cache.has(key)) cache.set(key, buildPartLinks(input, [activeResolver], { maxLinks: 1 }));
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
  const resolved = await resolveProposalLinks(doc.proposals || []);
  fs.writeFileSync(outputFile, `${JSON.stringify({
    ...doc,
    generatedFrom: path.relative(process.cwd(), inputFile),
    linkGuardrail: 'Exact product-page identity only. Repair role remains unapproved and nothing is applied.',
    proposals: resolved.proposals,
    linkEvidence: resolved.evidence,
  }, null, 2)}\n`);
  const linked = resolved.evidence.filter((entry) => (entry as { result: string }).result === 'exact-product-link').length;
  console.log(JSON.stringify({ proposals: resolved.proposals.length, partRows: resolved.evidence.length, linked, heldNoExactLink: resolved.evidence.length - linked, output: outputFile }, null, 2));
}

if (require.main === module) main().catch((error) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
