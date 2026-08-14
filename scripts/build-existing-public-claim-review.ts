/** Bind an explicit safety decision to every currently verified/public fixPart in a frozen make source. */
import fs from 'node:fs';
import path from 'node:path';

const VERDICTS = new Set(['preserve_safe_public', 'preserve_recall_information', 'block_unsafe_public']);

interface FixPart {
  component?: string;
  oemPartNumber?: string | null;
  aftermarketXref?: string[];
  fitment?: unknown;
  buyLinks?: unknown[];
  verified?: boolean;
  recallFirst?: boolean;
}
interface SourceRecord { id: string; title?: string; solution?: string; fixParts?: FixPart[] }
interface ReviewDecision { issueId: string; partIndex: number; verdict: string; reason: string }
const keyOf = (issueId: string, partIndex: number) => `${issueId}::${partIndex}`;

export function buildExistingPublicClaimReview(
  source: { make?: string; snapshotHash?: string; records?: SourceRecord[] },
  input: { make?: string; decisions?: ReviewDecision[] },
) {
  if (!source.make || input.make !== source.make || !Array.isArray(source.records)) {
    throw new Error('Existing-public-claim review make/source mismatch');
  }
  const byKey = new Map<string, ReviewDecision>();
  for (const decision of input.decisions || []) {
    const key = keyOf(decision.issueId, decision.partIndex);
    if (byKey.has(key)) throw new Error(`${key}: duplicate public-claim decision`);
    if (!VERDICTS.has(decision.verdict)) throw new Error(`${key}: invalid public-claim verdict`);
    if (String(decision.reason || '').trim().length < 12) throw new Error(`${key}: public-claim reason is required`);
    byKey.set(key, decision);
  }
  const decisions: unknown[] = [];
  const tally = Object.fromEntries([...VERDICTS].map((verdict) => [verdict, 0]));
  for (const record of source.records) {
    for (const [partIndex, part] of (record.fixParts || []).entries()) {
      if (part.verified !== true) continue;
      const key = keyOf(record.id, partIndex);
      const decision = byKey.get(key);
      if (!decision) throw new Error(`${key}: verified public claim has no decision`);
      tally[decision.verdict] += 1;
      decisions.push({
        issueId: record.id,
        partIndex,
        component: part.component || null,
        partNumbers: [part.oemPartNumber, ...(part.aftermarketXref || [])]
          .map((value) => String(value || '').trim()).filter(Boolean),
        currentFitment: part.fitment || {},
        currentBuyLinks: part.buyLinks || [],
        recallFirst: part.recallFirst === true,
        verdict: decision.verdict,
        reason: decision.reason.trim(),
        sourceEvidence: { title: record.title || null, howToFix: record.solution || null },
      });
      byKey.delete(key);
    }
  }
  if (byKey.size) throw new Error(`Public-claim decisions include ${byKey.size} rows outside verified frozen claims`);
  return {
    schemaVersion: 1,
    artifactKind: 'known-issue-existing-public-claim-review',
    make: source.make,
    snapshotHash: source.snapshotHash,
    status: 'REVIEWED_NOT_APPLIED',
    productionApplied: false,
    releaseBlocked: tally.block_unsafe_public > 0,
    verifiedPublicClaimCount: decisions.length,
    tally,
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
  const sourceFile = path.resolve(argValue(args, '--source'));
  const decisionsFile = path.resolve(argValue(args, '--decisions'));
  const outFile = path.resolve(argValue(args, '--out'));
  const output = buildExistingPublicClaimReview(
    JSON.parse(fs.readFileSync(sourceFile, 'utf8')),
    JSON.parse(fs.readFileSync(decisionsFile, 'utf8')),
  );
  fs.writeFileSync(outFile, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ claims: output.verifiedPublicClaimCount, tally: output.tally, output: outFile }, null, 2));
}

if (require.main === module) {
  try { main(); } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
