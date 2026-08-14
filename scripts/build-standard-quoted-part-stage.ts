/**
 * Promote only independently approved quoted-PN rows into the canonical 04/05
 * packet stages. This is an offline transform: it performs no network or DB IO.
 */
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

interface BuyLink { [key: string]: unknown }
interface ProposalPart {
  role?: string;
  component?: string;
  supplier?: string;
  oemPartNumber?: string;
  aftermarketXref?: string[];
  fitment?: { years?: number[]; engines?: string[]; trims?: string[] };
  buyLinks?: BuyLink[];
  [key: string]: unknown;
}
interface Proposal {
  proposalId: string;
  id: string;
  articleScope?: { make?: string; model?: string };
  parts: ProposalPart[];
  [key: string]: unknown;
}
interface ProposalStage {
  generatedFrom?: unknown;
  guardrail?: string;
  count: number;
  workItemDispositionCount: number;
  workItemDispositions: Array<{
    workItemId: string;
    issueId: string;
    verdict: string;
    reasonCode: string;
  }>;
  proposals: Proposal[];
  [key: string]: unknown;
}
interface QuotedProposalStage {
  make?: string;
  proposals?: Proposal[];
}
interface RepairRoleReview {
  make?: string;
  decisions?: Array<{
    proposalId: string;
    issueId: string;
    partIndex: number;
    partNumber: string;
    decision: string;
  }>;
}

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const normalizedPartNumber = (value: unknown) => String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

export function normalizedTextSha256(text: string): string {
  return createHash('sha256').update(text.replace(/\r\n?/g, '\n')).digest('hex');
}

function partNumberFor(part: ProposalPart): string {
  return String(part.aftermarketXref?.[0] || part.oemPartNumber || '').trim();
}

function expectedInput(proposal: Proposal, part: ProposalPart) {
  const years = part.fitment?.years || [];
  return {
    partNumber: partNumberFor(part),
    supplier: part.supplier,
    component: part.component,
    make: proposal.articleScope?.make,
    model: proposal.articleScope?.model,
    year: years[0],
    engine: part.fitment?.engines?.[0],
    ...(part.fitment?.trims?.length === 1 ? { trim: part.fitment.trims[0] } : {}),
  };
}

export function buildStandardQuotedPartStages(
  base: ProposalStage,
  quoted: QuotedProposalStage,
  repairReview: RepairRoleReview,
  bindings: { quotedProposalSha256: string; repairRoleReviewSha256: string },
) {
  if (!Array.isArray(base.workItemDispositions) || base.workItemDispositions.length !== base.workItemDispositionCount) {
    throw new Error('Base proposal stage has incomplete work-item dispositions');
  }
  if (!quoted.make || quoted.make !== repairReview.make) throw new Error('Quoted proposal/review make mismatch');
  const quotedById = new Map((quoted.proposals || []).map((proposal) => [proposal.proposalId, proposal]));
  if (quotedById.size !== (quoted.proposals || []).length) throw new Error('Quoted proposals contain duplicate proposal IDs');
  const dispositionById = new Map(base.workItemDispositions.map((row) => [row.workItemId, row]));
  if (dispositionById.size !== base.workItemDispositions.length) throw new Error('Base dispositions contain duplicate work-item IDs');

  const selected: Array<{ proposal: Proposal; linkedPart: ProposalPart }> = [];
  const selectedIds = new Set<string>();
  for (const decision of repairReview.decisions || []) {
    if (decision.decision !== 'approve') continue;
    const proposal = quotedById.get(decision.proposalId);
    const linkedPart = proposal?.parts?.[decision.partIndex];
    if (!proposal || !linkedPart) throw new Error(`${decision.proposalId}::${decision.partIndex}: approved source row is missing`);
    if (decision.issueId !== proposal.id) throw new Error(`${decision.proposalId}: approved issue identity mismatch`);
    if (decision.partIndex !== 0 || proposal.parts.length !== 1 || linkedPart.role !== 'primary') {
      throw new Error(`${decision.proposalId}: approved quoted row must be one primary part at index zero`);
    }
    if (normalizedPartNumber(decision.partNumber) !== normalizedPartNumber(partNumberFor(linkedPart))) {
      throw new Error(`${decision.proposalId}: approved part-number identity mismatch`);
    }
    if (!Array.isArray(linkedPart.buyLinks)
      || linkedPart.buyLinks.length < 1
      || linkedPart.buyLinks.length > 2) {
      throw new Error(`${decision.proposalId}: approved row requires one or two exact product links`);
    }
    const disposition = dispositionById.get(proposal.proposalId);
    if (!disposition || disposition.issueId !== proposal.id || disposition.verdict !== 'hold') {
      throw new Error(`${proposal.proposalId}: approved row has no held canonical work item`);
    }
    if (selectedIds.has(proposal.proposalId)) throw new Error(`${proposal.proposalId}: duplicate approved quoted row`);
    selectedIds.add(proposal.proposalId);
    selected.push({ proposal, linkedPart });
  }
  if (!selected.length) throw new Error('No independently approved quoted-PN rows were selected');

  const proposals = selected.map(({ proposal }) => {
    const canonical = clone(proposal);
    canonical.parts[0]!.buyLinks = [];
    canonical.parts[0]!.verified = false;
    return canonical;
  });
  const workItemDispositions = clone(base.workItemDispositions).map((row) => {
    if (selectedIds.has(row.workItemId)) {
      return { ...row, verdict: 'proposed', reasonCode: 'approved-quoted-part-proposal' };
    }
    // The raw catalog stage may discover additional candidates after parser or
    // catalog refreshes. They remain explicit holds until independently
    // reviewed; a prior quoted-part review cannot approve them by implication.
    if (row.verdict === 'proposed') {
      return { ...row, verdict: 'hold', reasonCode: 'unreviewed-standard-proposal' };
    }
    return row;
  });
  const supplementalBindings = {
    quotedProposalArtifact: '04b-reviewed-quoted-part-proposals.json',
    quotedProposalSha256: bindings.quotedProposalSha256,
    repairRoleReviewArtifact: '06b-quoted-part-repair-role-review.json',
    repairRoleReviewSha256: bindings.repairRoleReviewSha256,
    selectedProposalCount: proposals.length,
  };
  const proposalStage: ProposalStage = {
    ...clone(base),
    generatedFrom: clone(base.generatedFrom),
    guardrail: 'Catalog and quoted-PN fitment only. Every selected quoted part also has independent repair-role approval; verified remains false until stage 06 finalization.',
    count: proposals.length,
    workItemDispositionCount: workItemDispositions.length,
    workItemDispositions,
    proposals,
    supplementalBindings,
  };
  const linkedProposals = selected.map(({ proposal, linkedPart }) => {
    const linked = clone(proposal);
    linked.parts[0]!.buyLinks = clone(linkedPart.buyLinks || []);
    linked.parts[0]!.verified = false;
    return linked;
  });
  const linkStage = {
    ...clone(proposalStage),
    generatedFrom: '04-part-proposals.json',
    proposals: linkedProposals,
    linkGuardrail: 'Only exact direct-product links with independently reviewed PN identity are present. Search/category URLs remain prohibited.',
    linkEvidence: selected.map(({ proposal, linkedPart }) => ({
      proposalId: proposal.proposalId,
      issueId: proposal.id,
      partIndex: 0,
      input: expectedInput(proposal, linkedPart),
      result: 'exact-product-link',
      links: clone(linkedPart.buyLinks || []),
    })),
  };
  const retailerCandidates = {
    schemaVersion: 1,
    artifactKind: 'known-issue-reviewed-retailer-candidates',
    make: quoted.make,
    status: 'REVIEWED_NOT_APPLIED',
    productionApplied: false,
    selectedCandidateCount: selected.length,
    candidates: selected.map(({ proposal, linkedPart }) => ({
      proposalId: proposal.proposalId,
      issueId: proposal.id,
      partIndex: 0,
      partNumber: partNumberFor(linkedPart),
      links: clone(linkedPart.buyLinks || []),
    })),
  };
  return { proposals: proposalStage, links: linkStage, retailerCandidates };
}

function argValue(args: string[], flag: string, required = true): string | undefined {
  const index = args.indexOf(flag);
  const result = index >= 0 ? args[index + 1] : undefined;
  if (required && !result) throw new Error(`${flag} is required`);
  return result;
}

function main() {
  const args = process.argv.slice(2);
  const baseFile = path.resolve(argValue(args, '--base')!);
  const quotedFile = path.resolve(argValue(args, '--quoted-proposals')!);
  const reviewFile = path.resolve(argValue(args, '--repair-role-review')!);
  const proposalOut = path.resolve(argValue(args, '--out-proposals')!);
  const linksOutValue = argValue(args, '--out-links', false);
  const candidatesOutValue = argValue(args, '--out-candidates', false);
  const output = buildStandardQuotedPartStages(
    JSON.parse(fs.readFileSync(baseFile, 'utf8')),
    JSON.parse(fs.readFileSync(quotedFile, 'utf8')),
    JSON.parse(fs.readFileSync(reviewFile, 'utf8')),
    {
      quotedProposalSha256: normalizedTextSha256(fs.readFileSync(quotedFile, 'utf8')),
      repairRoleReviewSha256: normalizedTextSha256(fs.readFileSync(reviewFile, 'utf8')),
    },
  );
  fs.mkdirSync(path.dirname(proposalOut), { recursive: true });
  fs.writeFileSync(proposalOut, `${JSON.stringify(output.proposals, null, 2)}\n`, 'utf8');
  if (linksOutValue) {
    const linksOut = path.resolve(linksOutValue);
    fs.mkdirSync(path.dirname(linksOut), { recursive: true });
    fs.writeFileSync(linksOut, `${JSON.stringify(output.links, null, 2)}\n`, 'utf8');
  }
  if (candidatesOutValue) {
    const candidatesOut = path.resolve(candidatesOutValue);
    fs.mkdirSync(path.dirname(candidatesOut), { recursive: true });
    fs.writeFileSync(candidatesOut, `${JSON.stringify(output.retailerCandidates, null, 2)}\n`, 'utf8');
  }
  console.log(JSON.stringify({
    selectedProposalCount: output.proposals.count,
    proposalOut,
    linksOut: linksOutValue || null,
    candidatesOut: candidatesOutValue || null,
  }, null, 2));
}

if (require.main === module) {
  try { main(); } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
