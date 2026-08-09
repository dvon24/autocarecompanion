/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const {
  fullRecord,
  hashValue,
  stableValue,
} = require('./known-issue-adjudication-utils');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(PROJECT_ROOT, 'data', '_mercedes-benz-deeplink-snapshot-2026-08-09.json');
const PACKET_PATTERN = /^known-issue-mercedes-(?:benz|maybach)-.+-adjudication-2026-08-09\.json$/;
const IMMUTABLE_FIELDS = Object.freeze([
  'make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'severity',
  'status', 'lastReportedByOwners', 'relatedIssueIds',
]);
const CANONICAL_SEVERITIES = new Set(['low', 'medium', 'high']);

function equal(left, right) {
  return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right));
}

function loadPackets(dataDirectory = path.join(PROJECT_ROOT, 'data')) {
  return fs.readdirSync(dataDirectory)
    .filter((name) => PACKET_PATTERN.test(name))
    .sort()
    .map((name) => ({
      file: path.join(dataDirectory, name),
      packet: JSON.parse(fs.readFileSync(path.join(dataDirectory, name), 'utf8')),
    }));
}

function validateMakeCoverage(snapshot, packetWrappers) {
  const errors = [];
  const expectedRows = snapshot.records
    .filter((row) => row.make === 'Mercedes-Benz')
    .sort((left, right) => left.id.localeCompare(right.id));
  const expectedById = new Map(expectedRows.map((row) => [row.id, row]));
  const coveredById = new Map();
  const modelCounts = {};
  let citationBeforeCount = 0;
  let citationAfterCount = 0;
  let uncitedProposalCount = 0;

  for (const wrapper of packetWrappers) {
    const packet = wrapper.packet || wrapper;
    const label = wrapper.file ? path.basename(wrapper.file) : '<packet>';
    if (packet.make !== 'Mercedes-Benz') errors.push(`${label}: wrong make ${packet.make}`);
    if (!Array.isArray(packet.rows) || !packet.rows.length) {
      errors.push(`${label}: packet has no rows`);
      continue;
    }
    for (const row of packet.rows) {
      if (coveredById.has(row.id)) {
        errors.push(`${row.id}: duplicate coverage in ${coveredById.get(row.id)} and ${label}`);
        continue;
      }
      coveredById.set(row.id, label);
      const source = expectedById.get(row.id);
      if (!source) {
        errors.push(`${row.id}: not present in frozen Mercedes-Benz snapshot`);
        continue;
      }
      const before = fullRecord(source);
      if (!equal(row.before, before) || row.beforeSha256 !== hashValue(before)) {
        errors.push(`${row.id}: before state does not match frozen snapshot`);
      }
      for (const field of IMMUTABLE_FIELDS) {
        if (!equal(row.before?.[field], row.proposal?.[field])) {
          errors.push(`${row.id}: immutable ${field} changed`);
        }
      }
      if (!CANONICAL_SEVERITIES.has(row.proposal?.severity)) {
        errors.push(`${row.id}: non-canonical severity ${row.proposal?.severity}`);
      }
      if (/\b0\+\s*owners?\b|\bowners? have reported this issue\b/i.test(`${row.proposal?.description || ''} ${row.proposal?.solution || ''}`)) {
        errors.push(`${row.id}: forbidden unknown-owner social proof`);
      }
      const beforeCitations = Array.isArray(row.before?.citations) ? row.before.citations.length : 0;
      const afterCitations = Array.isArray(row.proposal?.citations) ? row.proposal.citations.length : 0;
      citationBeforeCount += beforeCitations;
      citationAfterCount += afterCitations;
      if (afterCitations === 0) {
        uncitedProposalCount += 1;
        errors.push(`${row.id}: proposal has no citation`);
      }
      modelCounts[source.model] = (modelCounts[source.model] || 0) + 1;
    }
  }

  const missingIds = expectedRows.filter((row) => !coveredById.has(row.id)).map((row) => row.id);
  for (const id of missingIds) errors.push(`${id}: missing packet coverage`);

  return {
    passed: errors.length === 0,
    make: 'Mercedes-Benz',
    snapshotRows: expectedRows.length,
    packetCount: packetWrappers.length,
    coveredRows: coveredById.size,
    missingIds,
    modelCounts,
    citationBeforeCount,
    citationAfterCount,
    uncitedProposalCount,
    errors,
  };
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const result = validateMakeCoverage(snapshot, loadPackets());
  console.log(JSON.stringify(result, null, 2));
  if (!result.passed) process.exitCode = 1;
}

if (require.main === module) main();
module.exports = {
  CANONICAL_SEVERITIES,
  IMMUTABLE_FIELDS,
  PACKET_PATTERN,
  SNAPSHOT,
  loadPackets,
  validateMakeCoverage,
};
