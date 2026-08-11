/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { buildReconciliation, OUTPUT_FILE, EXPECTED_BASELINE, EXPECTED_BRANCH } = require('./build-skoda-make-reconciliation');
const { stableValue } = require('./known-issue-adjudication-utils');

function equal(left, right) { return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right)); }

function validateReconciliation(report) {
  const errors = [];
  const deterministic = buildReconciliation();
  if (!equal(report, deterministic)) errors.push('make reconciliation does not match deterministic packet union');
  if (report.status !== 'proposal-only' || report.requiresIndependentApproval !== true) errors.push('make reconciliation is not proposal-only');
  const expectedSummary = { models: 7, rows: 60, retained: 0, held: 60, pagesPreservedPublished: 60, authorizedWriteCandidates: 0 };
  if (!equal(report.summary, expectedSummary)) errors.push('Skoda make totals drifted');
  if (!equal(report.snapshot?.frozenMakeValues, ['Skoda']) || !equal(report.snapshot?.frozenMakeCounts, { Skoda: 60 })) errors.push('frozen make casing/counts drifted');
  if (report.sourceControl?.branch !== EXPECTED_BRANCH || report.sourceControl?.baselineCommit !== EXPECTED_BASELINE || !report.sourceControl?.reviewedDiffSha256 || !report.sourceControl?.reviewedTree?.sha256 || !Array.isArray(report.sourceControl?.dirtyInventory)) errors.push('source-control provenance drifted');
  if (report.routing?.deterministic !== true || report.routing?.validationErrors !== 0 || report.routing?.summary?.hiddenForAllSelectableTrims !== 18 || report.routing?.summary?.substringOnlyRoutes !== 20) errors.push('routing reconciliation drifted');
  for (const [name, value] of Object.entries(report.crossPacketChecks || {})) {
    const passing = name.startsWith('exact') ? value === true : value === 0;
    if (!passing) errors.push(`cross-packet check failed: ${name}=${JSON.stringify(value)}`);
  }
  if (report.applicationGate?.status !== 'blocked') errors.push('application gate must remain blocked');
  return errors;
}

if (require.main === module) {
  const report = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', OUTPUT_FILE), 'utf8'));
  const errors = validateReconciliation(report);
  console.log(JSON.stringify({ valid: errors.length === 0, errors }, null, 2));
  if (errors.length) process.exitCode = 1;
}

module.exports = { validateReconciliation };
