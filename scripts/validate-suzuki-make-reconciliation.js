/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { buildReconciliation, EXPECTED_BASELINE, EXPECTED_BRANCH, OUTPUT_FILE } = require('./build-suzuki-make-reconciliation');
const { EXPECTED_SUMMARY } = require('./build-suzuki-routing-report');
const { stableValue } = require('./known-issue-adjudication-utils');

function equal(left, right) { return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right)); }

function validateReconciliation(report) {
  const errors = [];
  const deterministic = buildReconciliation();
  if (!equal(report, deterministic)) errors.push('make reconciliation does not match deterministic packet union and reviewed tree');
  if (report.status !== 'proposal-only' || report.requiresIndependentApproval !== true) errors.push('make reconciliation is not proposal-only');
  const expectedSummary = { models: 7, rows: 18, retained: 0, held: 18, pagesPreservedPublished: 18, authorizedWriteCandidates: 0 };
  if (!equal(report.summary, expectedSummary)) errors.push('Suzuki make totals drifted');
  if (!equal(report.snapshot?.frozenMakeValues, ['Suzuki']) || !equal(report.snapshot?.frozenMakeCounts, { Suzuki: 18 })) errors.push('frozen make casing/counts drifted');
  if (report.sourceControl?.branch !== EXPECTED_BRANCH || report.sourceControl?.baselineCommit !== EXPECTED_BASELINE || report.sourceControl?.baselineIsAncestor !== true || !report.sourceControl?.reviewedTree?.sha256 || !Array.isArray(report.sourceControl?.reviewedTree?.files)) errors.push('source-control provenance drifted');
  if (report.routing?.deterministic !== true || report.routing?.validationErrors !== 0 || !equal(report.routing?.summary, EXPECTED_SUMMARY)) errors.push('routing reconciliation drifted');
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
