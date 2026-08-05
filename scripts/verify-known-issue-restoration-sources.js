/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Proves that a frozen catalog snapshot contains the exact pre-audit field
 * values committed as hashes in every schema-v2 full-record decision file.
 * This script is read-only: it never connects to or writes to the database.
 *
 * Usage:
 *   node scripts/verify-known-issue-restoration-sources.js \
 *     --snapshot C:\\path\\to\\known-issues-catalog-deeplink-snapshot.json
 */
const fs = require('node:fs');
const path = require('node:path');
const {
  fullRecordHashes,
  isFullRecordManifest,
} = require('./apply-known-issue-catalog-deeplinks');

const PROJECT_ROOT = path.resolve(__dirname, '..');

function requiredPath(args, flag) {
  const index = args.indexOf(flag);
  if (index < 0 || !args[index + 1]) throw new Error(`Missing ${flag}`);
  return path.resolve(PROJECT_ROOT, args[index + 1]);
}

function loadDecisionManifests(directory) {
  return fs.readdirSync(directory)
    .filter((name) => name.endsWith('.json'))
    .sort()
    .map((name) => {
      const file = path.join(directory, name);
      return { file, manifest: JSON.parse(fs.readFileSync(file, 'utf8')) };
    })
    .filter(({ manifest }) => isFullRecordManifest(manifest) && Array.isArray(manifest.issues));
}

function compareSnapshotToDecisions(snapshot, manifestEntries, targetIds = null) {
  const sourceById = new Map(snapshot.records.map((row) => [row.id, row]));
  const decisions = manifestEntries
    .flatMap(({ manifest }) => manifest.issues.map((issue) => ({
      batchId: manifest.batchId,
      issue,
    })));
  const decisionsById = new Map();
  for (const decision of decisions) {
    if (!decisionsById.has(decision.issue.id)) decisionsById.set(decision.issue.id, []);
    decisionsById.get(decision.issue.id).push(decision);
  }
  const selectedIds = targetIds || new Set(decisionsById.keys());
  const unrepresentedTargetIds = [...selectedIds].filter((id) => !decisionsById.has(id));
  const missing = [];
  const mismatched = [];

  for (const id of selectedIds) {
    const candidates = decisionsById.get(id);
    if (!candidates) continue;
    const source = sourceById.get(id);
    if (!source) {
      missing.push({ id, batchIds: candidates.map(({ batchId }) => batchId) });
      continue;
    }
    const actual = fullRecordHashes(source);
    const comparisons = candidates.map(({ batchId, issue }) => ({
      batchId,
      fields: Object.entries(issue.before)
        .filter(([key]) => key.endsWith('Hash'))
        .filter(([key, expected]) => actual[key] !== expected)
        .map(([key]) => key.replace(/Hash$/, '')),
    }));
    if (!comparisons.some(({ fields }) => fields.length === 0)) {
      mismatched.push({ id, comparisons });
    }
  }

  return {
    passed: missing.length === 0 && mismatched.length === 0 && unrepresentedTargetIds.length === 0,
    snapshotGeneratedAt: snapshot.generatedAt,
    snapshotRecordCount: snapshot.records.length,
    fullRecordDecisionEntries: decisions.length,
    fullRecordDecisionIds: decisionsById.size,
    targetIds: selectedIds.size,
    duplicateDecisionEntries: decisions.length - decisionsById.size,
    matched: selectedIds.size - unrepresentedTargetIds.length - missing.length - mismatched.length,
    unrepresentedTargetIds,
    missing,
    mismatched,
  };
}

function main() {
  const args = process.argv.slice(2);
  const snapshotFile = requiredPath(args, '--snapshot');
  const snapshot = JSON.parse(fs.readFileSync(snapshotFile, 'utf8'));
  if (!Array.isArray(snapshot.records)) throw new Error('Snapshot records must be an array');

  const decisionsDirectories = [];
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === '--decisions-dir') {
      if (!args[index + 1]) throw new Error('Missing --decisions-dir');
      decisionsDirectories.push(path.resolve(PROJECT_ROOT, args[index + 1]));
      index += 1;
    }
  }
  if (decisionsDirectories.length === 0) {
    decisionsDirectories.push(path.join(PROJECT_ROOT, 'data', 'known-issues-catalog-deeplink-decisions'));
  }
  const manifests = decisionsDirectories.flatMap(loadDecisionManifests);
  let targetIds = null;
  const targetManifestIndex = args.indexOf('--target-manifest');
  if (targetManifestIndex >= 0) {
    if (!args[targetManifestIndex + 1]) throw new Error('Missing --target-manifest');
    const targetManifest = JSON.parse(fs.readFileSync(path.resolve(PROJECT_ROOT, args[targetManifestIndex + 1]), 'utf8'));
    const targetDispositionIndex = args.indexOf('--target-disposition');
    const targetDisposition = targetDispositionIndex >= 0 ? args[targetDispositionIndex + 1] : null;
    targetIds = new Set((targetManifest.restore || [])
      .filter((row) => !targetDisposition || row.disposition === targetDisposition)
      .map((row) => row.id));
  }
  const result = compareSnapshotToDecisions(snapshot, manifests, targetIds);
  result.snapshotFile = snapshotFile;
  result.decisionDirectories = decisionsDirectories;
  result.decisionManifestCount = manifests.length;
  console.log(JSON.stringify(result, null, 2));
  if (!result.passed) process.exitCode = 1;
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

module.exports = { compareSnapshotToDecisions, loadDecisionManifests };
