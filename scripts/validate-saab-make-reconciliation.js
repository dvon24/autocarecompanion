/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { buildReconciliation, OUTPUT_FILE } = require('./build-saab-make-reconciliation');
const { stableValue } = require('./known-issue-adjudication-utils');

function equal(left, right) { return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right)); }

function validateReconciliation(report) {
  const errors = [];
  const deterministic = buildReconciliation();
  if (!equal(report, deterministic)) errors.push('make reconciliation does not match deterministic packet union');
  if (report.status !== 'proposal-only' || report.requiresIndependentApproval !== true) errors.push('make reconciliation is not proposal-only');
  if (report.summary.models !== 5 || report.summary.rows !== 19 || report.summary.retained !== 2 || report.summary.held !== 17 || report.summary.pagesPreservedPublished !== 19) errors.push('Saab make totals drifted');
  for (const [name, value] of Object.entries(report.crossPacketChecks || {})) {
    const passing = name.startsWith('exact') ? value === true : value === 0;
    if (!passing) errors.push(`cross-packet check failed: ${name}=${value}`);
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
