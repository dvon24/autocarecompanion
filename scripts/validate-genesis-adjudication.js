/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const {
  ARCHIVE_REASONS,
  DUPLICATES,
  FULL_RECORD_FIELDS,
  PROTECTED_FIELDS,
  REWRITE_IDS,
  hashValue,
} = require('./build-genesis-adjudication');

const DEFAULT_PACKET = path.resolve(__dirname, '..', 'data', 'known-issue-genesis-adjudication-2026-08-05.json');
const DEFAULT_SNAPSHOT = path.resolve(__dirname, '..', 'data', '_genesis-deeplink-snapshot-2026-08-05.json');
const ACTIONS = ['hold_indexed_identity_byte_identical'];
const APPLICABILITY_PROSE = /\b(?:20\d{2}|vehicle|covered|equipped|applicable|production|campaign|bulletin|vin)\b/i;

function sha256File(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function expectedAction(id) {
  if (REWRITE_IDS.has(id) || DUPLICATES.has(id) || ARCHIVE_REASONS[id]) {
    return 'hold_indexed_identity_byte_identical';
  }
  return null;
}

function validatePacket(packet, snapshot, snapshotSha256) {
  const errors = [];
  if (packet.status !== 'proposal-only') errors.push('packet status must be proposal-only');
  if (packet.requiresIndependentApproval !== true) errors.push('packet must require independent approval');
  if (packet.make !== 'Genesis') errors.push('packet make must be Genesis');
  if (packet.source?.snapshotSha256 !== snapshotSha256) errors.push('snapshot SHA-256 mismatch');
  if (packet.source?.snapshotHash !== snapshot.snapshotHash) errors.push('snapshotHash mismatch');
  if (!Array.isArray(packet.rows)) return [...errors, 'packet rows[] missing'];

  const snapshotById = new Map(snapshot.records.map((row) => [row.id, row]));
  const packetIds = packet.rows.map((row) => row.id);
  const duplicateIds = packetIds.filter((id, index) => packetIds.indexOf(id) !== index);
  if (duplicateIds.length) errors.push(`duplicate IDs: ${[...new Set(duplicateIds)].join(', ')}`);
  const missing = [...snapshotById.keys()].filter((id) => !packetIds.includes(id));
  const extra = packetIds.filter((id) => !snapshotById.has(id));
  if (missing.length) errors.push(`missing snapshot IDs: ${missing.join(', ')}`);
  if (extra.length) errors.push(`extra IDs: ${extra.join(', ')}`);

  for (const row of packet.rows) {
    const label = row.id || '<missing>';
    const source = snapshotById.get(row.id);
    if (!source) continue;
    if (row.action !== expectedAction(row.id)) errors.push(`${label}: unexpected action ${row.action}`);
    if (row.beforeSha256 !== hashValue(row.before)) errors.push(`${label}: before hash mismatch`);
    if (row.proposalSha256 !== hashValue(row.proposal)) errors.push(`${label}: proposal hash mismatch`);
    for (const field of FULL_RECORD_FIELDS) {
      if (!Object.prototype.hasOwnProperty.call(row.before, field)) errors.push(`${label}: before missing ${field}`);
      if (!Object.prototype.hasOwnProperty.call(row.proposal, field)) errors.push(`${label}: proposal missing ${field}`);
    }
    if (hashValue(row.proposal) !== hashValue(row.before)) errors.push(`${label}: held proposal changed the frozen row`);
    if (row.proposal.status !== 'published') errors.push(`${label}: held row must remain published`);
    if (!['rewrite_then_publish', 'archive_as_duplicate', 'archive_unsupported'].includes(row.reviewedAction)) {
      errors.push(`${label}: reviewed action missing`);
    }
    if (!Array.isArray(row.protectedDrift) || !row.protectedDrift.length) {
      errors.push(`${label}: held reviewed proposal must identify protected drift`);
    } else if (row.protectedDrift.some((field) => !PROTECTED_FIELDS.includes(field))) {
      errors.push(`${label}: protected drift ledger contains an unknown field`);
    }
  }

  for (const action of ACTIONS) {
    const actual = packet.rows.filter((row) => row.action === action).length;
    if (packet.summary?.[action] !== actual) errors.push(`summary.${action} mismatch`);
  }
  if (packet.summary?.total !== packet.rows.length) errors.push('summary.total mismatch');
  for (const [model, declared] of Object.entries(packet.byModel || {})) {
    const rows = packet.rows.filter((row) => row.model === model);
    for (const action of ACTIONS) {
      if (declared[action] !== rows.filter((row) => row.action === action).length) errors.push(`byModel.${model}.${action} mismatch`);
    }
    if (declared.total !== rows.length) errors.push(`byModel.${model}.total mismatch`);
  }
  return errors;
}

function argValue(args, flag, fallback) {
  const index = args.indexOf(flag);
  return index >= 0 && args[index + 1] ? path.resolve(args[index + 1]) : fallback;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const packetFile = argValue(args, '--packet', DEFAULT_PACKET);
  const snapshotFile = argValue(args, '--snapshot', DEFAULT_SNAPSHOT);
  const packet = JSON.parse(fs.readFileSync(packetFile, 'utf8'));
  const snapshot = JSON.parse(fs.readFileSync(snapshotFile, 'utf8'));
  const errors = validatePacket(packet, snapshot, sha256File(snapshotFile));
  const result = {
    passed: errors.length === 0,
    packetFile,
    packetSha256: sha256File(packetFile),
    snapshotFile,
    snapshotSha256: sha256File(snapshotFile),
    decisionCount: packet.rows?.length || 0,
    errors,
  };
  console.log(JSON.stringify(result, null, 2));
  if (errors.length) process.exitCode = 1;
}

module.exports = { ACTIONS, APPLICABILITY_PROSE, expectedAction, validatePacket };
