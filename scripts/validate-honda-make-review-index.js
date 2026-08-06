/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { BASE_PACKET, MODEL_PACKETS, buildIndex, normalizedFileHash } = require('./build-honda-make-review-index');

const ROOT = path.resolve(__dirname, '..');
const DEFAULT_INDEX = path.join(ROOT, 'data', 'known-issue-honda-make-review-index-2026-08-06.json');
function equal(left, right) { return JSON.stringify(left) === JSON.stringify(right); }

function validateIndex(index, expected = buildIndex()) {
  const errors = [];
  if (index.status !== 'proposal-only' || index.purpose !== 'independent-make-review') errors.push('review index safety status mismatch');
  if (index.requiresIndependentApproval !== true) errors.push('independent approval must be required');
  if (index.make !== 'Honda' || index.reviewBranch !== 'codex/honda-deeplink-audit') errors.push('review scope mismatch');
  if (index.source?.frozenRecordCount !== 383 || index.rows?.length !== 383) errors.push('review index must contain 383 rows');
  if (index.summary?.total !== 383 || index.summary?.exactFrozenIdCoverage !== true || index.summary?.duplicateIdCount !== 0 || index.summary?.missingIdCount !== 0) errors.push('exact coverage summary mismatch');
  if (index.summary?.rewrite_same_identity !== 101 || index.summary?.correct_clicked_integrity !== 1 || index.summary?.remove_invalid_search_link !== 1 || index.summary?.keep_published_pending_source !== 280) errors.push('aggregate action counts mismatch');
  if (index.summary?.packetFileCount !== 19 || index.packetFiles?.length !== 19) errors.push('packet file count mismatch');
  if (new Set(index.rows?.map((row) => row.id)).size !== 383) errors.push('duplicate review IDs');
  if (index.rows?.some((row) => row.action === 'keep_published_pending_source' && (row.beforeSha256 !== row.proposalSha256 || row.changedFields.length !== 0))) errors.push('changed hold found');
  const files = index.packetFiles?.map((item) => path.basename(item.file)).sort() || [];
  if (!equal(files, [...MODEL_PACKETS, BASE_PACKET].sort())) errors.push('packet selection list mismatch');
  for (const packet of index.packetFiles || []) {
    const absolute = path.join(ROOT, packet.file);
    if (!fs.existsSync(absolute) || normalizedFileHash(absolute) !== packet.sha256) errors.push(`packet hash mismatch: ${packet.file}`);
  }
  if (!equal(index, expected)) errors.push('generated review index differs from deterministic rebuild');
  return errors;
}

if (require.main === module) {
  const index = JSON.parse(fs.readFileSync(DEFAULT_INDEX, 'utf8'));
  const errors = validateIndex(index);
  console.log(JSON.stringify({ passed: errors.length === 0, indexSha256: normalizedFileHash(DEFAULT_INDEX), rowCount: index.rows?.length || 0, packetFileCount: index.packetFiles?.length || 0, errors }, null, 2));
  if (errors.length) process.exitCode = 1;
}
module.exports = { validateIndex };
