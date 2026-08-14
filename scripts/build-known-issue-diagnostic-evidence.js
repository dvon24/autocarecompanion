#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const {
  TOOL_PRODUCT_URLS,
  TOOL_REVIEW_EVIDENCE,
} = require('../src/lib/diagnostic-procedures');

const PROJECT_ROOT = path.resolve(__dirname, '..');

function argValue(args, flag) {
  const index = args.indexOf(flag);
  return index >= 0 && args[index + 1] && !args[index + 1].startsWith('--') ? args[index + 1] : '';
}

function compareText(left, right) {
  return String(left).localeCompare(String(right), 'en-US');
}

function reviewedTool(toolId) {
  const evidence = TOOL_REVIEW_EVIDENCE[toolId];
  const productUrl = TOOL_PRODUCT_URLS[toolId];
  if (!evidence || !productUrl) throw new Error(`${toolId}: reviewed diagnostic product evidence is missing`);
  return { toolId, productUrl, ...evidence };
}

function buildDiagnosticEvidence(classification) {
  if (classification?.artifactKind !== 'known-issue-part-classification-ledger'
    || !Array.isArray(classification.rows)) {
    throw new Error('Classification ledger is invalid.');
  }
  const dispositions = classification.rows.flatMap((row) => (row.diagnosticDispositions || [])
    .map((disposition) => ({ issueId: row.issueId, ...disposition })));
  const linked = dispositions.filter((row) => row.status === 'tool-linked');
  const usedToolIds = [...new Set(linked.map((row) => row.toolId))].sort(compareText);
  for (const row of linked) {
    const tool = reviewedTool(row.toolId);
    if (tool.productUrl !== row.productUrl) throw new Error(`${row.toolId}: disposition product URL is not the reviewed URL`);
  }
  const allReviewedToolIds = Object.keys(TOOL_REVIEW_EVIDENCE).sort(compareText);
  const unusedToolIds = allReviewedToolIds.filter((toolId) => !usedToolIds.includes(toolId));
  const summary = classification.diagnosticSummary || {};
  const holds = dispositions
    .filter((row) => row.status === 'unresolved-tool-hold')
    .map((row) => Object.fromEntries(
      ['issueId', 'source', 'procedure', 'excerpt', 'reasonCode', 'toolId', 'productUrl']
        .map((field) => [field, row[field] ?? null]),
    ));
  return {
    schemaVersion: 1,
    artifactKind: 'known-issue-diagnostic-tool-evidence',
    snapshotHash: classification.snapshotHash,
    make: classification.make,
    status: 'IN_PROGRESS',
    scope: {
      issueCount: classification.issueCount,
      issuesWithDtcCodes: summary.issueWithDtcCount,
      uniqueDtcCount: summary.uniqueDtcCount,
      solutionInstructionCount: summary.instructionCount,
      dtcDispositionCount: summary.dtcDispositionCount,
      toolLinkedDispositionCount: summary.toolLinkedCount,
      procedureNoToolDispositionCount: summary.procedureNoToolCount,
      unresolvedToolHoldCount: summary.unresolvedToolHoldCount,
      uncoveredDiagnosticInstructionCount: 0,
    },
    makeToolLinks: usedToolIds.map(reviewedTool),
    reusableReviewedTools: unusedToolIds.map(reviewedTool),
    holds,
  };
}

function main() {
  const args = process.argv.slice(2);
  const classificationArg = argValue(args, '--classification');
  const outArg = argValue(args, '--out');
  if (!classificationArg || !outArg) throw new Error('--classification and --out are required');
  const classificationFile = path.resolve(PROJECT_ROOT, classificationArg);
  const outFile = path.resolve(PROJECT_ROOT, outArg);
  const evidence = buildDiagnosticEvidence(JSON.parse(fs.readFileSync(classificationFile, 'utf8')));
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({
    output: path.relative(PROJECT_ROOT, outFile),
    issueCount: evidence.scope.issueCount,
    linked: evidence.scope.toolLinkedDispositionCount,
    holds: evidence.scope.unresolvedToolHoldCount,
  }, null, 2));
}

if (require.main === module) {
  try { main(); } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

module.exports = { buildDiagnosticEvidence, reviewedTool };
