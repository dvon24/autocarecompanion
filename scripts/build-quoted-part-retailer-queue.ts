/** Build a manual-fitment retailer research queue from exact part numbers quoted by an article. */
import fs from 'node:fs';
import path from 'node:path';

interface EvidenceRow {
  id: string;
  issueId?: string;
  workItemId: string;
  component: string;
  repairRoleEvidence: string;
  articleScope: {
    make: string;
    model: string;
    years: number[];
    trims?: string[];
    engines?: string[];
    drivetrains?: string[];
    transmissions?: string[];
  };
  quotedPartNumber?: string;
  engineMatch?: string | null;
  verdict: string;
  mappedFrom?: string;
}

const WORDLIKE = /\b(?:parts?|premium|separator|alone|service|listed|left|right|bank|tsb|coolant|concentrate|premix|series|assembly|gasket|cover|aftermarket)\b/i;

export function reviewedQuotedPartNumber(value: unknown): { raw: string; normalized: string } | null {
  const raw = String(value || '').trim();
  if (!raw || WORDLIKE.test(raw) || /[(),:]/.test(raw) || !/^[a-z0-9 .\/-]+$/i.test(raw)) return null;
  const normalized = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (normalized.length < 5 || normalized.length > 24 || !/[0-9]/.test(normalized)) return null;
  return { raw, normalized };
}

export function buildQuotedPartRetailerQueue(evidence: {
  complete?: boolean;
  snapshotHash?: string;
  results?: EvidenceRow[];
}, make: string) {
  if (evidence.complete !== true || !Array.isArray(evidence.results)) throw new Error('Complete catalog evidence is required');
  const proposals: unknown[] = [];
  const holds: unknown[] = [];
  const seen = new Set<string>();
  for (const row of evidence.results) {
    if (!String(row.quotedPartNumber || '').trim()) continue;
    const reviewed = reviewedQuotedPartNumber(row.quotedPartNumber);
    if (!reviewed) {
      holds.push({
        workItemId: row.workItemId,
        issueId: row.issueId || row.id,
        quotedPartNumber: row.quotedPartNumber,
        reasonCode: 'quoted-part-number-needs-manual-normalization',
      });
      continue;
    }
    const engine = String(row.engineMatch || '').trim();
    const scope = {
      years: row.articleScope.years || [],
      engines: engine ? [engine] : [],
      trims: row.articleScope.trims || [],
      drivetrains: row.articleScope.drivetrains || [],
      transmissions: row.articleScope.transmissions || [],
    };
    const identity = JSON.stringify([
      row.issueId || row.id,
      row.component,
      reviewed.normalized,
      scope,
    ]);
    if (seen.has(identity)) continue;
    seen.add(identity);
    proposals.push({
      proposalId: row.workItemId,
      id: row.issueId || row.id,
      component: row.component,
      articleScope: row.articleScope,
      sourceEvidence: {
        kind: 'article-quoted-part-number',
        rawPartNumber: reviewed.raw,
        repairRoleEvidence: row.repairRoleEvidence,
        catalogVerdict: row.verdict,
        mappedFrom: row.mappedFrom || '',
      },
      fitmentReviewRequired: true,
      parts: [{
        role: 'primary',
        component: row.component,
        supplier: `${make} OEM`,
        oemPartNumber: reviewed.normalized,
        aftermarketXref: [reviewed.normalized],
        fitment: scope,
        buyLinks: [],
        verified: false,
        note: 'Article-quoted part number; exact retailer identity may be researched, but vehicle fitment remains manual-review-only.',
      }],
    });
  }
  return {
    schemaVersion: 1,
    artifactKind: 'known-issue-quoted-part-retailer-research-queue',
    snapshotHash: evidence.snapshotHash,
    make,
    status: 'IN_PROGRESS_MANUAL_FITMENT_REVIEW_REQUIRED',
    guardrail: 'An article quote is not catalog fitment. Exact product links remain unapproved until repair role and every vehicle scope are independently reviewed.',
    proposalCount: proposals.length,
    manualNormalizationHoldCount: holds.length,
    proposals,
    holds,
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
  const make = argValue(args, '--make');
  const queue = buildQuotedPartRetailerQueue(JSON.parse(fs.readFileSync(inFile, 'utf8')), make);
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, `${JSON.stringify(queue, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({
    output: outFile,
    proposals: queue.proposalCount,
    normalizationHolds: queue.manualNormalizationHoldCount,
  }, null, 2));
}

if (require.main === module) {
  try { main(); } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
