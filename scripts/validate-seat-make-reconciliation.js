/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { buildReconciliation, OUTPUT_FILE } = require('./build-seat-make-reconciliation');
const { stableValue } = require('./known-issue-adjudication-utils');

function equal(left, right) { return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right)); }

function validateReconciliation(report) {
  const errors = [];
  const deterministic = buildReconciliation();
  if (!equal(report, deterministic)) errors.push('make reconciliation does not match deterministic packet union');
  if (report.status !== 'proposal-only' || report.requiresIndependentApproval !== true) errors.push('make reconciliation is not proposal-only');
  const expectedSummary = { models: 6, rows: 36, retained: 1, held: 35, pagesPreservedPublished: 36, authorizedWriteCandidates: 1 };
  if (!equal(report.summary, expectedSummary)) errors.push('SEAT make totals drifted');
  if (!equal(report.snapshot?.frozenMakeValues, ['SEAT']) || !equal(report.snapshot?.frozenMakeCounts, { SEAT: 36 })) errors.push('frozen make casing/counts drifted');
  if (!equal(report.sourceControl, { branch: 'codex/seat-deeplink-audit', baselineCommit: '788bc03680e738d3ffb18c2718f78f1ae8887e6a' })) errors.push('source-control provenance drifted');
  for (const [name, value] of Object.entries(report.crossPacketChecks || {})) {
    const passing = name.startsWith('exact') ? value === true : value === 0;
    if (!passing) errors.push(`cross-packet check failed: ${name}=${JSON.stringify(value)}`);
  }
  if (report.applicationGate?.status !== 'blocked') errors.push('application gate must remain blocked before independent approval');
  return errors;
}

if (require.main === module) {
  const report = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', OUTPUT_FILE), 'utf8'));
  const errors = validateReconciliation(report);
  console.log(JSON.stringify({ valid: errors.length === 0, errors }, null, 2));
  if (errors.length) process.exitCode = 1;
}

module.exports = { validateReconciliation };
