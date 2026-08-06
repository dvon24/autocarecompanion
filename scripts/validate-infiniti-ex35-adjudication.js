/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const {
  FULL_RECORD_FIELDS,
  hashValue,
  normalizedFileHash,
  stableValue,
} = require('./infiniti-adjudication-utils');
const {
  ID,
  KEEP_REASON,
  RECALL_QUERIES,
  evidenceFor,
  fullRecord,
} = require('./build-infiniti-ex35-adjudication');

const PACKET = path.resolve(
  __dirname,
  '..',
  'data',
  'known-issue-infiniti-ex35-adjudication-2026-08-06.json',
);
const SNAPSHOT = path.resolve(
  __dirname,
  '..',
  'data',
  '_infiniti-deeplink-snapshot-2026-08-06.json',
);

function equal(left, right) {
  return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right));
}

function validatePacket(packet, snapshot, expectedSnapshotSha256 = normalizedFileHash(SNAPSHOT)) {
  const errors = [];
  const modelRows = snapshot.records.filter(
    (row) => row.make === 'Infiniti' && row.model === 'EX35',
  );
  const frozen = modelRows[0];
  const row = packet.rows?.[0];

  if (packet.status !== 'proposal-only' || packet.requiresIndependentApproval !== true) {
    errors.push('packet safety status mismatch');
  }
  if (packet.make !== 'Infiniti' || packet.model !== 'EX35') errors.push('packet scope mismatch');
  if (
    packet.source?.snapshotSha256 !== expectedSnapshotSha256 ||
    packet.source?.snapshotHash !== snapshot.snapshotHash
  ) {
    errors.push('snapshot binding mismatch');
  }
  if (
    packet.source?.ex35RecordCount !== 1 ||
    modelRows.length !== 1 ||
    packet.rows?.length !== 1 ||
    frozen?.id !== ID ||
    row?.id !== ID
  ) {
    errors.push('EX35 row count or identity mismatch');
  }

  if (frozen && row) {
    const before = fullRecord(frozen);
    if (row.action !== 'keep_published_pending_source' || row.reason !== KEEP_REASON) {
      errors.push(`${row.id}: action/reason mismatch`);
    }
    if (!equal(row.before, before) || !equal(row.proposal, before)) {
      errors.push(`${row.id}: frozen content changed`);
    }
    if (
      row.beforeSha256 !== hashValue(before) ||
      row.proposalSha256 !== row.beforeSha256 ||
      row.changedFields?.length !== 0
    ) {
      errors.push(`${row.id}: hash/change mismatch`);
    }
    if (
      row.proposal.make !== 'Infiniti' ||
      row.proposal.model !== 'EX35' ||
      row.proposal.status !== 'published' ||
      /^Archived\s*-/i.test(row.proposal.title)
    ) {
      errors.push(`${row.id}: identity/status drift`);
    }
    if (!equal(row.evidence, evidenceFor())) errors.push(`${row.id}: evidence drift`);
    for (const field of FULL_RECORD_FIELDS) {
      if (
        !Object.prototype.hasOwnProperty.call(row.before, field) ||
        !Object.prototype.hasOwnProperty.call(row.proposal, field)
      ) {
        errors.push(`${row.id}: missing ${field}`);
      }
    }
  }

  if (
    packet.summary?.rewrite_same_identity !== 0 ||
    packet.summary?.keep_published_pending_source !== 1 ||
    packet.summary?.total !== 1
  ) {
    errors.push('summary mismatch');
  }
  if (!equal(packet.mismatchSources, { recallQueries: RECALL_QUERIES })) {
    errors.push('recall query map mismatch');
  }
  for (const code of [
    'official-recall-set-unrelated',
    'unsupported-mechanism-and-threshold-frozen',
    'one-ex35-page-preserved',
  ]) {
    if (!packet.observations?.some((item) => item.code === code)) {
      errors.push(`missing observation ${code}`);
    }
  }
  return errors;
}

if (require.main === module) {
  const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8'));
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const errors = validatePacket(packet, snapshot);
  console.log(
    JSON.stringify(
      {
        passed: errors.length === 0,
        packetSha256: normalizedFileHash(PACKET),
        decisionCount: packet.rows?.length || 0,
        errors,
      },
      null,
      2,
    ),
  );
  if (errors.length) process.exitCode = 1;
}

module.exports = { validatePacket };
