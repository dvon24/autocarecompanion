/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const {
  beforeHashes,
  hashValue,
  snapshotFields,
  validateManifest,
} = require('./apply-known-issue-catalog-deeplinks');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const DEFAULT_TARGET = path.join(
  PROJECT_ROOT,
  'data', 'acura-corrected-link-release', 'final-target.json',
);
const DEFAULT_OUTPUT = path.join(
  PROJECT_ROOT,
  'data',
  'known-issues-catalog-deeplink-decisions',
  'acura-corrected-links-display-hotfix-2026-08-19.json',
);

function argValue(args, flag, fallback = '') {
  const index = args.indexOf(flag);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]));
  }
  return value;
}

function buildHotfix(snapshot, target, batchId = 'acura-corrected-links-display-hotfix-2026-08-19') {
  const records = new Map(snapshot.records.map((record) => [record.id, record]));
  const issues = [];
  for (const targetIssue of target.issues) {
    const record = records.get(targetIssue.id);
    if (!record) throw new Error(`${targetIssue.id}: missing from current Acura snapshot`);
    const current = { ...snapshotFields(record), title: record.title };
    const persistedTarget = { ...snapshotFields(targetIssue.after), title: targetIssue.after.title };
    if (JSON.stringify(stableValue(current)) === JSON.stringify(stableValue(persistedTarget))) continue;
    issues.push({
      id: targetIssue.id,
      disposition: 'replace',
      evidence: [
        'Post-release browser verification',
        'Corrected Acura repair-first review ledger',
      ],
      before: {
        ...beforeHashes(record),
        titleHash: hashValue(record.title),
        claimIds: Array.isArray(record.before?.claimIds) ? record.before.claimIds : [],
      },
      after: persistedTarget,
    });
  }

  const manifest = {
    schemaVersion: 1,
    manifestKind: 'known-issues-catalog-deeplinks',
    batchId,
    reviewedOn: '2026-08-19',
    sourceSnapshotHash: snapshot.snapshotHash,
    issues,
  };
  // A zero-row comparison is a valid no-op result for auditing. The apply
  // tool still refuses an empty manifest, so it cannot become a write.
  const errors = issues.length > 0 ? validateManifest(manifest) : [];
  if (errors.length) throw new Error(errors.join('\n'));
  return manifest;
}

function main(args = process.argv.slice(2)) {
  const snapshotPath = path.resolve(argValue(args, '--snapshot'));
  if (!fs.existsSync(snapshotPath)) throw new Error('Provide --snapshot <current Acura snapshot JSON>');
  const targetPath = path.resolve(argValue(args, '--target', DEFAULT_TARGET));
  const outputPath = path.resolve(argValue(args, '--output', DEFAULT_OUTPUT));
  const batchId = argValue(args, '--batch-id', 'acura-corrected-links-display-hotfix-2026-08-19');
  const manifest = buildHotfix(
    JSON.parse(fs.readFileSync(snapshotPath, 'utf8')),
    JSON.parse(fs.readFileSync(targetPath, 'utf8')),
    batchId,
  );
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ output: path.relative(PROJECT_ROOT, outputPath), issueCount: manifest.issues.length }, null, 2));
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

module.exports = { buildHotfix };
