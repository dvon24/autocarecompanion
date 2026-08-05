/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Read-only production verification for the 2026-08-05 Known Issues restore.
 *
 * The baseline is the pre-restore fingerprint captured before any rollback.
 * This verifier never writes to the database. It fails unless:
 *   - every frozen manifest patch matches the database field-for-field;
 *   - all non-held audit-archived IDs are published again;
 *   - no non-held published row stores applicability prose in trims[];
 *   - every formerly empty model page except an explicit allowlist has content;
 *   - published/archived totals match the exact projected status transitions.
 *
 * Usage:
 *   node scripts/verify-known-issue-restoration.js \
 *     --baseline data/_prerestore-snapshot.json \
 *     --manifest data/_restore-manifest.json \
 *     --allow-dead-model Acura:RLX
 */
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const {
  FULL_RECORD_FIELDS,
  resolveKnownIssueConnectionString,
} = require('./apply-known-issue-catalog-deeplinks');

const PROJECT_ROOT = path.resolve(__dirname, '..');

function argValue(args, flag) {
  const index = args.indexOf(flag);
  if (index < 0 || !args[index + 1]) throw new Error(`Missing ${flag}`);
  return path.resolve(PROJECT_ROOT, args[index + 1]);
}

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function requireDependency(name) {
  try {
    return require(name);
  } catch (error) {
    const dependencyRoot = process.env.KNOWN_ISSUE_DEPENDENCY_ROOT;
    if (!dependencyRoot) throw error;
    return require(path.join(dependencyRoot, name));
  }
}

function looksLikeApplicabilityProse(trim) {
  const value = String(trim || '').trim();
  return /^(?:only\s+)?vehicles?\b/i.test(value) ||
    /\b(?:verify (?:eligibility )?(?:by|with) vin|verify the vin|equipped with|sales code|built (?:from|between|before|after|on)|production dates?|campaign (?:eligibility|population)|(?:north american|u\.s\.|canadian|mexican|european|uk|eu) market)\b/i.test(value);
}

function validateBaseline(baseline) {
  const errors = [];
  if (!baseline || typeof baseline !== 'object') errors.push('baseline must be an object');
  if (!Array.isArray(baseline.auditArchivedIds) || baseline.auditArchivedIds.length === 0) {
    errors.push('baseline.auditArchivedIds must be a non-empty array');
  }
  if (!Array.isArray(baseline.proseTrimIds) || baseline.proseTrimIds.length === 0) {
    errors.push('baseline.proseTrimIds must be a non-empty array');
  }
  if (!Array.isArray(baseline.zeroPageModels) || baseline.zeroPageModels.length === 0) {
    errors.push('baseline.zeroPageModels must be a non-empty array');
  }
  for (const [label, rows] of [
    ['auditArchivedIds', baseline.auditArchivedIds || []],
    ['proseTrimIds', baseline.proseTrimIds || []],
  ]) {
    const ids = rows.map((row) => row && row.id).filter(Boolean);
    if (ids.length !== rows.length) errors.push(`${label} contains a row without an id`);
    if (new Set(ids).size !== ids.length) errors.push(`${label} contains duplicate ids`);
  }
  return errors;
}

function validateManifest(manifest) {
  const errors = [];
  if (!manifest || typeof manifest !== 'object') return ['manifest must be an object'];
  if (!Array.isArray(manifest.restore) || manifest.restore.length === 0) {
    errors.push('manifest.restore must be a non-empty array');
  }
  if (!Array.isArray(manifest.hold)) errors.push('manifest.hold must be an array');
  const restoreIds = (manifest.restore || []).map((row) => row && row.id).filter(Boolean);
  const holdIds = (manifest.hold || []).map((row) => row && row.id).filter(Boolean);
  if (restoreIds.length !== (manifest.restore || []).length) errors.push('manifest.restore contains a row without an id');
  if (holdIds.length !== (manifest.hold || []).length) errors.push('manifest.hold contains a row without an id');
  if (new Set(restoreIds).size !== restoreIds.length) errors.push('manifest.restore contains duplicate ids');
  if (new Set(holdIds).size !== holdIds.length) errors.push('manifest.hold contains duplicate ids');
  const overlap = restoreIds.filter((id) => new Set(holdIds).has(id));
  if (overlap.length > 0) errors.push(`restore/hold overlap: ${overlap.join(', ')}`);
  for (const row of manifest.restore || []) {
    if (!row.patch || typeof row.patch !== 'object' || Array.isArray(row.patch) || Object.keys(row.patch).length === 0) {
      errors.push(`${row.id || '<missing id>'}: patch must be a non-empty object`);
      continue;
    }
    const unsupported = Object.keys(row.patch).filter((field) => !FULL_RECORD_FIELDS.includes(field));
    if (unsupported.length > 0) errors.push(`${row.id}: unsupported patch fields: ${unsupported.join(', ')}`);
  }
  return errors;
}

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]));
  }
  return value;
}

function valuesEqual(left, right) {
  return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right));
}

function projectedStatusCounts(baseline, manifest) {
  const counts = Object.fromEntries((baseline.byStatus || []).map((row) => [row.status, Number(row.count)]));
  for (const row of manifest.restore) {
    if (!row.statusFrom || !row.statusTo || row.statusFrom === row.statusTo) continue;
    counts[row.statusFrom] = (counts[row.statusFrom] || 0) - 1;
    counts[row.statusTo] = (counts[row.statusTo] || 0) + 1;
  }
  return counts;
}

function placeholders(values, offset = 1) {
  return values.map((_, index) => `$${index + offset}`).join(', ');
}

function expectedArchivedHoldIds(baseline, manifest) {
  const baselineArchivedIds = new Set(baseline.auditArchivedIds.map((row) => row.id));
  return new Set(manifest.hold.map((row) => row.id).filter((id) => baselineArchivedIds.has(id)));
}

async function verify(pool, baseline, manifest, allowedDeadModels = new Set()) {
  const archivedIds = baseline.auditArchivedIds.map((row) => row.id);
  const holdIds = new Set(manifest.hold.map((row) => row.id));
  const archivedHoldIds = expectedArchivedHoldIds(baseline, manifest);
  const archivedRestoreIds = archivedIds.filter((id) => !holdIds.has(id));
  const restoreIds = manifest.restore.map((row) => row.id);
  const projected = projectedStatusCounts(baseline, manifest);
  const patchFields = [...new Set(manifest.restore.flatMap((row) => Object.keys(row.patch)))];

  const [statusResult, signatureResult, restoredArchivedResult, proseResult, restoredRowsResult] = await Promise.all([
    pool.query(`SELECT status, count(*)::int AS count FROM "KnownIssue" GROUP BY status ORDER BY status`),
    pool.query(`
      SELECT id, make, model, title, status
      FROM "KnownIssue"
      WHERE status = 'archived' AND title LIKE 'Archived - %'
      ORDER BY make, model, id
    `),
    pool.query(`
      SELECT id, make, model, title, status
      FROM "KnownIssue"
      WHERE id IN (${placeholders(archivedRestoreIds)}) AND status <> 'published'
      ORDER BY make, model, id
    `, archivedRestoreIds),
    pool.query(`
      SELECT id, make, model, title, trims, status
      FROM "KnownIssue"
      WHERE status = 'published' AND cardinality(trims) > 0
      ORDER BY make, model, id
    `),
    pool.query(`
      SELECT id, ${patchFields.map((field) => `"${field}"`).join(', ')}
      FROM "KnownIssue"
      WHERE id IN (${placeholders(restoreIds)})
      ORDER BY id
    `, restoreIds),
  ]);

  const remainingProseRows = proseResult.rows
    .filter((row) => !holdIds.has(row.id))
    .filter((row) => row.trims.some(looksLikeApplicabilityProse));
  const restoredById = new Map(restoredRowsResult.rows.map((row) => [row.id, row]));
  const patchMismatches = [];
  for (const expected of manifest.restore) {
    const actual = restoredById.get(expected.id);
    if (!actual) {
      patchMismatches.push({ id: expected.id, fields: ['<missing row>'] });
      continue;
    }
    const fields = Object.entries(expected.patch)
      .filter(([field, value]) => !valuesEqual(actual[field], value))
      .map(([field]) => field);
    if (fields.length > 0) patchMismatches.push({ id: expected.id, fields });
  }
  const signatureIds = new Set(signatureResult.rows.map((row) => row.id));
  const signatureSetMismatches = [
    ...[...signatureIds]
      .filter((id) => !archivedHoldIds.has(id))
      .map((id) => ({ id, reason: 'unexpected audit archive remains' })),
    ...[...archivedHoldIds]
      .filter((id) => !signatureIds.has(id))
      .map((id) => ({ id, reason: 'held archive signature is missing' })),
  ];
  const deadModels = [];
  for (const row of baseline.zeroPageModels) {
    const result = await pool.query(`
      SELECT count(*)::int AS count
      FROM "KnownIssue"
      WHERE status = 'published' AND lower(make) = lower($1) AND lower(model) = lower($2)
    `, [row.make, row.model]);
    const key = `${row.make}:${row.model}`.toLowerCase();
    if (result.rows[0].count === 0 && !allowedDeadModels.has(key)) {
      deadModels.push({ make: row.make, model: row.model });
    }
  }

  const currentCounts = Object.fromEntries(statusResult.rows.map((row) => [row.status, row.count]));
  const statusMismatches = Object.entries(projected)
    .filter(([status, count]) => currentCounts[status] !== count)
    .map(([status, expected]) => ({ status, expected, actual: currentCounts[status] || 0 }));

  const checks = {
    auditArchiveSignatureRemaining: signatureResult.rows.length,
    auditArchiveSignatureSetMismatches: signatureSetMismatches.length,
    baselineAuditArchivedIdsNotPublished: restoredArchivedResult.rows.length,
    nonHeldApplicabilityProseTrimRows: remainingProseRows.length,
    baselineDeadModelPagesStillEmpty: deadModels.length,
    restorePatchMismatches: patchMismatches.length,
    projectedStatusCountMismatches: statusMismatches.length,
  };
  const passed =
    checks.auditArchiveSignatureSetMismatches === 0 &&
    checks.baselineAuditArchivedIdsNotPublished === 0 &&
    checks.nonHeldApplicabilityProseTrimRows === 0 &&
    checks.baselineDeadModelPagesStillEmpty === 0 &&
    checks.restorePatchMismatches === 0 &&
    checks.projectedStatusCountMismatches === 0;

  return {
    passed,
    capturedAt: baseline.capturedAt,
    capturedCounts: {
      auditArchivedIds: archivedIds.length,
      proseTrimIds: baseline.proseTrimIds.length,
      deadModelPages: baseline.zeroPageModels.length,
    },
    projectedStatusCounts: projected,
    currentStatusCounts: statusResult.rows,
    checks,
    failures: {
      auditArchiveSignature: signatureResult.rows,
      auditArchiveSignatureSetMismatches: signatureSetMismatches,
      auditArchivedIdsNotPublished: restoredArchivedResult.rows,
      proseTrimRows: remainingProseRows,
      deadModelPages: deadModels,
      patchMismatches,
      statusMismatches,
    },
  };
}

async function main() {
  const args = process.argv.slice(2);
  const baselineFile = argValue(args, '--baseline');
  const manifestFile = argValue(args, '--manifest');
  const baseline = JSON.parse(fs.readFileSync(baselineFile, 'utf8'));
  const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  const baselineErrors = validateBaseline(baseline);
  if (baselineErrors.length > 0) throw new Error(`Invalid baseline: ${baselineErrors.join('; ')}`);
  const manifestErrors = validateManifest(manifest);
  if (manifestErrors.length > 0) throw new Error(`Invalid manifest: ${manifestErrors.join('; ')}`);
  const allowedDeadModels = new Set();
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === '--allow-dead-model' && args[index + 1]) {
      allowedDeadModels.add(args[index + 1].toLowerCase());
      index += 1;
    }
  }

  const { Pool } = requireDependency('pg');
  const pool = new Pool({
    connectionString: resolveKnownIssueConnectionString(),
    max: 2,
    idleTimeoutMillis: 30000,
  });
  try {
    const result = await verify(pool, baseline, manifest, allowedDeadModels);
    result.baselineFile = path.relative(PROJECT_ROOT, baselineFile);
    result.baselineSha256 = sha256(baselineFile);
    result.manifestFile = path.relative(PROJECT_ROOT, manifestFile);
    result.manifestSha256 = sha256(manifestFile);
    console.log(JSON.stringify(result, null, 2));
    if (!result.passed) process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}

module.exports = {
  expectedArchivedHoldIds,
  looksLikeApplicabilityProse,
  projectedStatusCounts,
  validateBaseline,
  validateManifest,
  valuesEqual,
  verify,
};
