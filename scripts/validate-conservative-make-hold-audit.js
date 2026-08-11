/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { ACTION, buildAudit } = require('./build-conservative-make-hold-audit');
const { FULL_RECORD_FIELDS, diffFields, hashValue, stableValue } = require('./known-issue-adjudication-utils');

function equal(left, right) { return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right)); }
function resolveRepo(file) { return path.resolve(__dirname, '..', file); }

function validateAudit(config, audit) {
  const errors = [];
  const deterministic = buildAudit(config);
  if (!equal(audit, deterministic)) errors.push('audit does not match the deterministic snapshot build');
  if (audit.status !== 'proposal-only' || audit.requiresIndependentApproval !== false || audit.applicationGate?.status !== 'blocked') errors.push('audit gate/header drifted');
  if (audit.make !== config.make || audit.summary?.rows !== config.expectedRows || audit.summary?.held !== config.expectedRows || audit.summary?.retained !== 0 || audit.summary?.authorizedWriteCandidates !== 0) errors.push('make summary drifted');
  if (!equal(audit.modelCounts, config.expectedModelCounts)) errors.push('model counts drifted');
  const rows = Array.isArray(audit.decisions) ? audit.decisions : [];
  const ids = rows.map((row) => row.id);
  const snapshot = JSON.parse(fs.readFileSync(resolveRepo(config.snapshotFile), 'utf8'));
  const frozenById = new Map(snapshot.records.map((row) => [row.id, row]));
  if (rows.length !== config.expectedRows || new Set(ids).size !== config.expectedRows) errors.push('decision inventory drifted');
  for (const row of rows) {
    const frozen = frozenById.get(row.id);
    if (!frozen) { errors.push(`${row.id}: decision is not in the frozen snapshot`); continue; }
    const expected = Object.fromEntries(FULL_RECORD_FIELDS.map((field) => [field, frozen[field]]));
    if (row.action !== ACTION || row.contentWriteAuthorized !== false || row.metadataWriteAuthorized !== false) errors.push(`${row.id}: write authorization drifted`);
    if (row.beforeSha256 !== row.proposalSha256 || row.beforeSha256 !== hashValue(expected) || row.changedFields.length !== 0) errors.push(`${row.id}: held row hash is not byte-identical to the frozen record`);
    if (config.compactDecisions === true) {
      if ('before' in row || 'proposal' in row) errors.push(`${row.id}: compact decision unexpectedly embeds mutable record content`);
    } else {
      if (!equal(row.before, row.proposal) || !equal(row.before, expected) || row.proposalSha256 !== hashValue(row.proposal) || !equal(row.changedFields, diffFields(row.before, row.proposal))) errors.push(`${row.id}: held row is not byte-identical`);
      if (row.proposal.status !== 'published') errors.push(`${row.id}: page became unpublished`);
      for (const field of FULL_RECORD_FIELDS) if (!(field in row.before) || !(field in row.proposal)) errors.push(`${row.id}: missing full-record field ${field}`);
      if (!equal(row.before.fixParts, row.proposal.fixParts) || !equal(row.before.communityRecommendations, row.proposal.communityRecommendations)) errors.push(`${row.id}: commerce drifted`);
      if (row.before.reportCount !== row.proposal.reportCount || row.before.lastReportedByOwners !== row.proposal.lastReportedByOwners) errors.push(`${row.id}: owner telemetry drifted`);
    }
  }
  if (audit.routing?.metadataWritesAuthorized !== 0) errors.push('routing report authorizes metadata writes');
  return errors;
}

if (require.main === module) {
  const flagIndex = process.argv.indexOf('--config');
  if (flagIndex < 0 || !process.argv[flagIndex + 1]) throw new Error('--config is required');
  const config = require(resolveRepo(process.argv[flagIndex + 1]));
  const audit = JSON.parse(fs.readFileSync(resolveRepo(config.outputFile), 'utf8'));
  const errors = validateAudit(config, audit);
  console.log(JSON.stringify({ valid: errors.length === 0, errors }, null, 2));
  if (errors.length) process.exitCode = 1;
}

module.exports = { validateAudit };
