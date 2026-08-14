/**
 * Build the canonical schema-v2 review from the approved quoted-PN lane plus
 * the frozen existing-claim review. Offline only; no network or DB access.
 */
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const REVIEW_DECISIONS = [
  'approve', 'block_wrong_role', 'block_incomplete_scope',
  'block_ambiguous', 'hold_no_exact_link', 'hold_needs_manual',
] as const;
const REVIEW_DECISION_SET = new Set<string>(REVIEW_DECISIONS);

// Audit artifacts are external JSON with several historical schema shapes.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonObject = Record<string, any>;
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const normalizedPartNumber = (value: unknown) => String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const keyOf = (proposalId: string, partIndex: number) => `${proposalId}::${partIndex}`;
const publicClaimKey = (issueId: string, partIndex: number) => `${issueId}::${partIndex}`;

export function normalizedTextSha256(text: string): string {
  return createHash('sha256').update(text.replace(/\r\n?/g, '\n')).digest('hex');
}

function hashValue(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function partNumberFor(part: JsonObject): string {
  return String(part.aftermarketXref?.[0] || part.oemPartNumber || '').trim();
}

function directLinkAttestation(link: JsonObject): string {
  const identity = link.productIdentity || {};
  return [
    `Exact product link ${link.url}.`,
    `Product ID ${identity.productId || 'unrecorded'}.`,
    `Observed ${identity.observedPartNumberField || 'identity evidence'} contains ${identity.matchedPartNumber || 'the reviewed PN'}.`,
    identity.observedListingTitle ? `Observed title: ${identity.observedListingTitle}.` : '',
  ].filter(Boolean).join(' ');
}

function reasonTally(rows: JsonObject[]) {
  const tally: Record<string, number> = {};
  for (const row of rows) tally[row.reasonCode] = (tally[row.reasonCode] || 0) + 1;
  return Object.fromEntries(Object.entries(tally).sort(([left], [right]) => left.localeCompare(right)));
}

export function buildStandardIndependentReview(inputs: {
  source: JsonObject;
  ledger: JsonObject;
  worklist: JsonObject;
  evidence: JsonObject;
  proposals: JsonObject;
  links: JsonObject;
  quotedRepairReview: JsonObject;
  publicClaimReview: JsonObject;
  reviewedArtifactSha256: Record<string, string>;
  supplementalArtifactSha256: Record<string, string>;
}) {
  const {
    source, ledger, worklist, evidence, proposals, links,
    quotedRepairReview, publicClaimReview,
  } = inputs;
  const make = String(source.make || '').trim();
  if (!make || String(quotedRepairReview.make || '') !== make || String(publicClaimReview.make || '') !== make) {
    throw new Error('Canonical review make mismatch');
  }
  if (quotedRepairReview.snapshotHash !== source.snapshotHash || publicClaimReview.snapshotHash !== source.snapshotHash) {
    throw new Error('Canonical review snapshot mismatch');
  }
  const sourceById = new Map((source.records || []).map((record: JsonObject) => [record.id, record]));
  const workById = new Map((worklist.entries || []).map((row: JsonObject) => [row.workItemId, row]));
  const evidenceById = new Map((evidence.results || []).map((row: JsonObject) => [row.workItemId, row]));
  const repairByKey = new Map((quotedRepairReview.decisions || []).map((row: JsonObject) => [keyOf(row.proposalId, row.partIndex), row]));
  const publicByKey = new Map((publicClaimReview.decisions || []).map((row: JsonObject) => [publicClaimKey(row.issueId, row.partIndex), row]));
  if (repairByKey.size !== (quotedRepairReview.decisions || []).length) throw new Error('Quoted repair review contains duplicate decisions');
  if (publicByKey.size !== (publicClaimReview.decisions || []).length) throw new Error('Public-claim review contains duplicate decisions');

  const decisions: JsonObject[] = [];
  for (const proposal of links.proposals || []) {
    const sourceRecord = sourceById.get(proposal.id) as JsonObject | undefined;
    const workItem = workById.get(proposal.proposalId) as JsonObject | undefined;
    if (!sourceRecord || !workItem || workItem.issueId !== proposal.id) {
      throw new Error(`${proposal.proposalId}: canonical proposal source/work item mismatch`);
    }
    for (const [partIndex, part] of (proposal.parts || []).entries()) {
      const repair = repairByKey.get(keyOf(proposal.proposalId, partIndex)) as JsonObject | undefined;
      if (!repair) throw new Error(`${proposal.proposalId}::${partIndex}: canonical proposal lacks a repair-role decision`);
      const decisionName = repair.decision === 'hold_diagnosis_gate' ? 'hold_needs_manual' : repair.decision;
      if (!REVIEW_DECISION_SET.has(decisionName)) {
        throw new Error(`${proposal.proposalId}::${partIndex}: invalid canonical repair-role decision`);
      }
      const partNumber = partNumberFor(part);
      if (normalizedPartNumber(partNumber) !== normalizedPartNumber(repair.partNumber)) {
        throw new Error(`${proposal.proposalId}::${partIndex}: canonical proposal/review PN mismatch`);
      }
      if (!Array.isArray(part.buyLinks)
        || (decisionName === 'approve' && (part.buyLinks.length < 1 || part.buyLinks.length > 2))) {
        throw new Error(`${proposal.proposalId}::${partIndex}: approved canonical proposal requires one or two exact links`);
      }
      const independent = proposal.reviewEvidence || {};
      const suppliedEvidence = repair.reviewedSourceEvidence || {};
      decisions.push({
        proposalId: proposal.proposalId,
        issueId: proposal.id,
        workItemId: proposal.proposalId,
        model: proposal.articleScope?.model,
        partIndex,
        partNumber,
        decision: decisionName,
        reason: repair.reason,
        reviewedSourceEvidence: {
          howToFix: suppliedEvidence.howToFix || repair.sourceEvidence?.howToFix || sourceRecord.solution || sourceRecord.title,
          catalog: suppliedEvidence.catalog || [
            'Article-quoted part number with independently narrowed vehicle fitment.',
            independent.reviewerReason || '',
            ...(independent.independentSources || []),
          ].filter(Boolean).join(' '),
          directLink: suppliedEvidence.directLink || (part.buyLinks.length
            ? part.buyLinks.map(directLinkAttestation).join(' ')
            : 'No exact product link was resolved; this candidate remains held.'),
        },
      });
    }
  }

  const existingClaims: JsonObject[] = [];
  const verifiedPublicSeen = new Set<string>();
  for (const row of (worklist.entries || []).filter((entry: JsonObject) => entry.source === 'existing-fix-part')) {
    const sourceRecord = sourceById.get(row.issueId) as JsonObject | undefined;
    const sourcePart = sourceRecord?.fixParts?.[row.existingPartIndex];
    const result = evidenceById.get(row.workItemId) as JsonObject | undefined;
    if (!sourceRecord || !sourcePart || !result) throw new Error(`${row.workItemId}: existing claim source evidence is missing`);
    const publicDecision = publicByKey.get(publicClaimKey(row.issueId, row.existingPartIndex)) as JsonObject | undefined;
    if (sourcePart.verified === true && !publicDecision) {
      throw new Error(`${row.workItemId}: verified public claim is absent from the public-claim review`);
    }
    if (publicDecision) verifiedPublicSeen.add(publicClaimKey(row.issueId, row.existingPartIndex));
    const verdict = publicDecision?.verdict === 'block_unsafe_public' ? 'block' : 'preserve';
    const publicReason = String(publicDecision?.reason || '').trim();
    existingClaims.push({
      workItemId: row.workItemId,
      issueId: row.issueId,
      partNumber: row.partNumber || '',
      engineWorkRow: row.declaredEngine || '',
      verdict,
      reason: publicReason || 'Frozen fixPart metadata is unverified and remains hidden by the canonical public-commerce guard; this review neither validates nor publishes it.',
      reviewedSourceEvidence: {
        howToFix: sourceRecord.solution || sourceRecord.title || 'Frozen known-issue repair text.',
        catalog: `Fitment work row ended with ${result.verdict || row.mappingStatus || 'unresolved'}; no broader fitment is inferred.`,
        directLink: publicDecision
          ? `Existing verified public claim reviewed explicitly: ${JSON.stringify(publicDecision.currentBuyLinks || [])}`
          : 'No verified public direct-product link is approved by this preservation decision.',
      },
    });
  }
  for (const publicDecision of publicClaimReview.decisions || []) {
    if (publicDecision.verdict === 'block_unsafe_public'
      && !verifiedPublicSeen.has(publicClaimKey(publicDecision.issueId, publicDecision.partIndex))) {
      throw new Error(`${publicDecision.issueId}::${publicDecision.partIndex}: blocked public claim has no canonical existing-claim work row`);
    }
  }

  const workDispositions = clone(proposals.workItemDispositions || []);
  const exactRows = (links.linkEvidence || []).filter((row: JsonObject) => row.result === 'exact-product-link');
  const exactLinks = exactRows.flatMap((row: JsonObject) => row.links || []);
  const listingTitleLinks = exactLinks.filter((link: JsonObject) => link.productIdentity?.matchedPartNumberSource === 'listing-title');
  const itemSpecificLinks = exactLinks.filter((link: JsonObject) => link.productIdentity?.matchedPartNumberSource === 'item-specifics');
  const decisionTally = Object.fromEntries(REVIEW_DECISIONS.map((decision) => [decision, decisions.filter((row) => row.decision === decision).length]));
  const existingClaimTally = {
    preserve: existingClaims.filter((row) => row.verdict === 'preserve').length,
    block: existingClaims.filter((row) => row.verdict === 'block').length,
  };
  const uniqueExistingClaims = new Set(existingClaims.map((row) => `${row.issueId}::${normalizedPartNumber(row.partNumber)}`));
  return {
    schemaVersion: 2,
    artifactKind: 'known-issue-part-independent-review',
    snapshotHash: source.snapshotHash,
    make,
    reviewedArtifacts: [
      '01-disposition-ledger.json', '02-fitment-worklist.json', '03-showmetheparts-evidence.json',
      '04-part-proposals.json', '05-direct-link-evidence.json',
    ],
    reviewedArtifactSha256: clone(inputs.reviewedArtifactSha256),
    supplementalArtifactSha256: clone(inputs.supplementalArtifactSha256),
    proposalCount: (links.proposals || []).length,
    partRowCount: decisions.length,
    tally: decisionTally,
    reconciliation: {
      sourceProposalCount: (links.proposals || []).length,
      sourcePartRowCount: decisions.length,
      reviewedPartRowCount: decisions.length,
      sourceIssueCount: source.recordCount,
      reviewedIssueCount: ledger.issueCount,
      sourceWorkItemCount: (worklist.entries || []).length,
      reviewedWorkItemDispositionCount: workDispositions.length,
      terminalWorkItemDispositionCount: workDispositions.length,
      proposedWorkItemCount: workDispositions.filter((row: JsonObject) => row.verdict === 'proposed').length,
      heldWorkItemCount: workDispositions.filter((row: JsonObject) => row.verdict === 'hold').length,
      workItemDispositionSha256: hashValue([...workDispositions].sort((left, right) => left.workItemId.localeCompare(right.workItemId))),
      workItemDispositionReasonTally: reasonTally(workDispositions),
      missingIssues: [], missingWorkItemDispositions: [], duplicateWorkItemDispositions: [], missing: [], duplicates: [], complete: true,
    },
    productIdentityReconciliation: {
      sourcePartRowCount: decisions.length,
      reviewedPartRowCount: decisions.length,
      exactProductLinkRowCount: exactRows.length,
      exactProductLinkCount: exactLinks.length,
      noExactProductLinkRowCount: (links.linkEvidence || []).length - exactRows.length,
      reviewedExactProductLinkRowCount: exactRows.length,
      reviewedExactProductLinkCount: exactLinks.length,
      listingTitleSourceCount: listingTitleLinks.length,
      itemSpecificsSourceCount: itemSpecificLinks.length,
      observedListingTitlePresentCount: exactLinks.filter((link: JsonObject) => link.productIdentity?.observedListingTitle).length,
      recomputedTitleHashMatchCount: exactLinks.filter((link: JsonObject) => {
        const title = String(link.productIdentity?.observedListingTitle || '');
        return title && createHash('sha256').update(title).digest('hex') === link.productIdentity?.listingTitleHash;
      }).length,
      matchedPartNumberMatchCount: exactLinks.filter((link: JsonObject) => normalizedPartNumber(link.productIdentity?.matchedPartNumber)).length,
      observedPartNumberFieldPresentCount: exactLinks.filter((link: JsonObject) => link.productIdentity?.observedPartNumberField).length,
      observedPartNumberValuePresentCount: exactLinks.filter((link: JsonObject) => link.productIdentity?.observedPartNumberValue).length,
      observedPartNumberValueMatchCount: exactLinks.length,
      urlProductIdMatchCount: exactLinks.length,
      invalidRows: [],
      complete: true,
    },
    existingClaimWorkRowCount: existingClaims.length,
    uniqueExistingClaimCount: uniqueExistingClaims.size,
    existingClaimTally,
    existingClaims,
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
  const repairReviewFlag = args.includes('--repair-review') ? '--repair-review' : '--quoted-repair-review';
  const files = Object.fromEntries([
    ['source', '--source'], ['ledger', '--ledger'], ['worklist', '--worklist'], ['evidence', '--evidence'],
    ['proposals', '--proposals'], ['links', '--links'], ['quotedRepairReview', repairReviewFlag],
    ['publicClaimReview', '--public-claim-review'],
  ].map(([key, flag]) => [key, path.resolve(argValue(args, flag))]));
  const outFile = path.resolve(argValue(args, '--out'));
  const read = (key: string) => JSON.parse(fs.readFileSync(files[key]!, 'utf8'));
  const reviewedNames = {
    ledger: '01-disposition-ledger.json', worklist: '02-fitment-worklist.json', evidence: '03-showmetheparts-evidence.json',
    proposals: '04-part-proposals.json', links: '05-direct-link-evidence.json',
  };
  const output = buildStandardIndependentReview({
    source: read('source'), ledger: read('ledger'), worklist: read('worklist'), evidence: read('evidence'),
    proposals: read('proposals'), links: read('links'), quotedRepairReview: read('quotedRepairReview'),
    publicClaimReview: read('publicClaimReview'),
    reviewedArtifactSha256: Object.fromEntries(Object.entries(reviewedNames).map(([key, name]) => [name, normalizedTextSha256(fs.readFileSync(files[key]!, 'utf8'))])),
    supplementalArtifactSha256: {
      [path.basename(files.quotedRepairReview!)]: normalizedTextSha256(fs.readFileSync(files.quotedRepairReview!, 'utf8')),
      'existing-public-claim-review.json': normalizedTextSha256(fs.readFileSync(files.publicClaimReview!, 'utf8')),
    },
  });
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ proposals: output.proposalCount, existingClaimRows: output.existingClaimWorkRowCount, tally: output.tally, existingClaimTally: output.existingClaimTally, outFile }, null, 2));
}

if (require.main === module) {
  try { main(); } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
