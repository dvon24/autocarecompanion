/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { buildReconciliation, OUTPUT_FILE, EXPECTED_BASELINE, EXPECTED_BRANCH } = require('./build-subaru-make-reconciliation');
const { EXPECTED_SUMMARY } = require('./build-subaru-routing-report');
const { stableValue } = require('./known-issue-adjudication-utils');

function equal(left, right) { return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right)); }

function validateReconciliation(report, deterministic = buildReconciliation()) {
  const errors = [];
  if (!equal(report, deterministic)) errors.push('make reconciliation does not match deterministic packet union');
  if (report.status !== 'proposal-only' || report.requiresIndependentApproval !== true) errors.push('make reconciliation is not proposal-only');
  const expectedSummary = { models: 14, rows: 205, retained: 0, held: 205, archivedExcluded: 12, pagesPreservedPublished: 205, authorizedWriteCandidates: 0 };
  if (!equal(report.summary, expectedSummary)) errors.push('Subaru make totals drifted');
  if (!equal(report.snapshot?.frozenMakeValues, ['Subaru']) || !equal(report.snapshot?.frozenMakeCounts, { Subaru: 205 })) errors.push('frozen make casing/counts drifted');
  if (report.sourceControl?.branch !== EXPECTED_BRANCH || report.sourceControl?.baselineCommit !== EXPECTED_BASELINE || report.sourceControl?.containsBaseline !== true || !report.sourceControl?.reviewedTree?.sha256 || !Array.isArray(report.sourceControl?.reviewedTree?.files)) errors.push('source-control provenance drifted');
  if (report.archivedInventory?.rows !== 12 || report.archivedInventory?.ids?.length !== 12 || report.archivedInventory?.republishAuthorized !== false) errors.push('archived inventory boundary drifted');
  if (report.routing?.deterministic !== true || report.routing?.validationErrors !== 0 || !equal(report.routing?.summary, EXPECTED_SUMMARY)) errors.push('routing reconciliation drifted');
  for (const [name, value] of Object.entries(report.crossPacketChecks || {})) if (name.startsWith('exact') ? value !== true : value !== 0) errors.push(`cross-packet check failed: ${name}=${JSON.stringify(value)}`);
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
