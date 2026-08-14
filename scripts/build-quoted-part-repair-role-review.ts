/** Bind a human repair-role decision to every independently fitment-reviewed quoted-part proposal. */
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const DECISIONS = new Set([
  'approve',
  'block_wrong_role',
  'block_incomplete_scope',
  'block_ambiguous',
  'hold_diagnosis_gate',
  'hold_needs_manual',
]);

interface SourceRecord { id: string; title?: string; solution?: string }
interface ProposalPart {
  component: string;
  oemPartNumber?: string;
  aftermarketXref?: string[];
  fitment?: Record<string, unknown>;
  buyLinks?: unknown[];
}
interface Proposal {
  proposalId: string;
  id: string;
  parts: ProposalPart[];
  reviewEvidence?: unknown;
}
interface Decision {
  proposalId: string;
  partIndex: number;
  decision: string;
  reason: string;
}

const normalizedPartNumber = (value: unknown) => String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const keyOf = (proposalId: string, partIndex: number) => `${proposalId}::${partIndex}`;

export function normalizedTextSha256(text: string): string {
  return createHash('sha256').update(text.replace(/\r\n?/g, '\n')).digest('hex');
}

function fileSha256(file: string): string {
  return normalizedTextSha256(fs.readFileSync(file, 'utf8'));
}

export function buildQuotedPartRepairRoleReview(
  source: { make?: string; snapshotHash?: string; records?: SourceRecord[] },
  proposalStage: { make?: string; snapshotHash?: string; proposals?: Proposal[] },
  decisionInput: { make?: string; decisions?: Decision[] },
  bindings: { sourceSha256?: string; proposalSha256?: string; decisionsSha256?: string } = {},
) {
  const make = String(source.make || proposalStage.make || '').trim();
  if (!make || proposalStage.make !== make || decisionInput.make !== make) {
    throw new Error('make does not reconcile across repair-role inputs');
  }
  if (source.snapshotHash && proposalStage.snapshotHash && source.snapshotHash !== proposalStage.snapshotHash) {
    throw new Error('snapshot hash does not reconcile across repair-role inputs');
  }
  const sourceById = new Map((source.records || []).map((row) => [row.id, row]));
  const decisions = decisionInput.decisions || [];
  const decisionByKey = new Map<string, Decision>();
  for (const decision of decisions) {
    const key = keyOf(decision.proposalId, decision.partIndex);
    if (decisionByKey.has(key)) throw new Error(`${key}: duplicate repair-role decision`);
    if (!Number.isInteger(decision.partIndex) || decision.partIndex < 0) throw new Error(`${key}: invalid part index`);
    if (!DECISIONS.has(decision.decision)) throw new Error(`${key}: invalid repair-role decision`);
    if (String(decision.reason || '').trim().length < 12) throw new Error(`${key}: repair-role reason is required`);
    decisionByKey.set(key, decision);
  }

  const rows: unknown[] = [];
  const tally: Record<string, number> = Object.fromEntries([...DECISIONS].map((decision) => [decision, 0]));
  const seen = new Set<string>();
  for (const proposal of proposalStage.proposals || []) {
    const issue = sourceById.get(proposal.id);
    if (!issue) throw new Error(`${proposal.proposalId}: source issue is missing`);
    for (const [partIndex, part] of proposal.parts.entries()) {
      const key = keyOf(proposal.proposalId, partIndex);
      if (seen.has(key)) throw new Error(`${key}: duplicate proposal part`);
      seen.add(key);
      const decision = decisionByKey.get(key);
      if (!decision) throw new Error(`${key}: repair-role decision is missing`);
      const partNumber = normalizedPartNumber(part.oemPartNumber || part.aftermarketXref?.[0]);
      if (!partNumber || !part.buyLinks?.length) throw new Error(`${key}: staged proposal lacks exact product evidence`);
      tally[decision.decision] = (tally[decision.decision] || 0) + 1;
      rows.push({
        proposalId: proposal.proposalId,
        issueId: proposal.id,
        partIndex,
        partNumber,
        component: part.component,
        decision: decision.decision,
        reason: decision.reason.trim(),
        sourceEvidence: {
          title: issue.title || null,
          howToFix: issue.solution || null,
        },
        fitment: part.fitment || {},
        exactProductLinkCount: part.buyLinks.length,
      });
    }
  }
  if (decisionByKey.size !== seen.size) throw new Error('repair-role decisions contain rows outside the proposal stage');
  const approveCount = tally.approve || 0;
  return {
    schemaVersion: 1,
    artifactKind: 'known-issue-quoted-part-repair-role-review',
    make,
    snapshotHash: source.snapshotHash || proposalStage.snapshotHash,
    status: 'REVIEWED_NOT_APPLIED',
    productionApplied: false,
    releaseBlocked: true,
    reviewedArtifactSha256: bindings,
    proposalPartCount: seen.size,
    approvedCount: approveCount,
    heldOrBlockedCount: seen.size - approveCount,
    tally,
    decisions: rows,
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
  const proposalFile = path.resolve(argValue(args, '--proposals'));
  const decisionsFile = path.resolve(argValue(args, '--decisions'));
  const outFile = path.resolve(argValue(args, '--out'));
  const output = buildQuotedPartRepairRoleReview(
    JSON.parse(fs.readFileSync(sourceFile, 'utf8')),
    JSON.parse(fs.readFileSync(proposalFile, 'utf8')),
    JSON.parse(fs.readFileSync(decisionsFile, 'utf8')),
    {
      sourceSha256: fileSha256(sourceFile),
      proposalSha256: fileSha256(proposalFile),
      decisionsSha256: fileSha256(decisionsFile),
    },
  );
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({
    proposalParts: output.proposalPartCount,
    approved: output.approvedCount,
    heldOrBlocked: output.heldOrBlockedCount,
    output: outFile,
  }, null, 2));
}

if (require.main === module) {
  try { main(); } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
