/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Repairs the non-Toyota applicability prose left in KnownIssue.trims after the
 * 2026-08-05 restoration. Dry-run by default; --apply uses one guarded
 * transaction and writes only trims plus updatedAt.
 */
const path = require('node:path');
const fs = require('node:fs');
const { resolveKnownIssueConnectionString } = require('./apply-known-issue-catalog-deeplinks');

const REPAIRS = require('../data/known-issue-trim-metadata-repairs-2026-08-05.json').repairs;

function requireDependency(name) {
  try {
    return require(name);
  } catch (error) {
    const dependencyRoot = process.env.KNOWN_ISSUE_DEPENDENCY_ROOT;
    if (!dependencyRoot) throw error;
    return require(path.join(dependencyRoot, name));
  }
}

function sameArray(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function validateRepairs(repairs = REPAIRS) {
  const errors = [];
  const ids = repairs.map((row) => row.id);
  if (new Set(ids).size !== ids.length) errors.push('repair ids must be unique');
  for (const row of repairs) {
    if (!row.id || !row.make || !row.model) errors.push('every repair requires id, make, and model');
    if (!Array.isArray(row.beforeTrims) || !Array.isArray(row.afterTrims)) errors.push(`${row.id}: trim states must be arrays`);
    if (sameArray(row.beforeTrims, row.afterTrims)) errors.push(`${row.id}: repair must change trims`);
  }
  return errors;
}

function verifyRows(rows, repairs = REPAIRS, state = 'beforeTrims') {
  const byId = new Map(rows.map((row) => [row.id, row]));
  const failures = [];
  for (const repair of repairs) {
    const row = byId.get(repair.id);
    if (!row) {
      failures.push({ id: repair.id, reason: 'missing row' });
      continue;
    }
    if (row.make !== repair.make || row.model !== repair.model || row.status !== 'published') {
      failures.push({ id: repair.id, reason: 'identity/status drift', actual: { make: row.make, model: row.model, status: row.status } });
    }
    if (!sameArray(row.trims, repair[state])) {
      failures.push({ id: repair.id, reason: `${state} mismatch`, actual: row.trims, expected: repair[state] });
    }
  }
  return failures;
}

function classifyRows(rows, repairs = REPAIRS) {
  const byId = new Map(rows.map((row) => [row.id, row]));
  const pending = [];
  const alreadyApplied = [];
  const failures = [];
  for (const repair of repairs) {
    const row = byId.get(repair.id);
    if (!row) {
      failures.push({ id: repair.id, reason: 'missing row' });
      continue;
    }
    if (row.make !== repair.make || row.model !== repair.model || row.status !== 'published') {
      failures.push({ id: repair.id, reason: 'identity/status drift', actual: { make: row.make, model: row.model, status: row.status } });
      continue;
    }
    if (sameArray(row.trims, repair.beforeTrims)) pending.push(repair);
    else if (sameArray(row.trims, repair.afterTrims)) alreadyApplied.push(repair);
    else failures.push({ id: repair.id, reason: 'unexpected trim state', actual: row.trims });
  }
  return { pending, alreadyApplied, failures };
}

async function run({ apply = false, repairs = REPAIRS } = {}) {
  const validationErrors = validateRepairs(repairs);
  if (validationErrors.length) throw new Error(validationErrors.join('; '));
  const { Pool } = requireDependency('pg');
  const pool = new Pool({ connectionString: resolveKnownIssueConnectionString(), max: 1 });
  const client = await pool.connect();
  const ids = repairs.map((row) => row.id);
  try {
    if (apply) await client.query('BEGIN');
    const before = (await client.query(`
      SELECT id, make, model, trims, status
      FROM "KnownIssue"
      WHERE id = ANY($1)
      ${apply ? 'FOR UPDATE' : ''}
    `, [ids])).rows;
    const classification = classifyRows(before, repairs);
    if (classification.failures.length) throw new Error(`pre-state verification failed: ${JSON.stringify(classification.failures)}`);

    if (!apply) {
      return {
        applied: false,
        verifiedRows: before.length,
        pendingRows: classification.pending.length,
        alreadyAppliedRows: classification.alreadyApplied.length,
        repairs,
      };
    }

    const payload = classification.pending.map((row) => ({ id: row.id, trims: row.afterTrims }));
    let updatedRows = 0;
    if (payload.length) {
      const update = await client.query(`
        UPDATE "KnownIssue" AS issue
        SET trims = patch.trims, "updatedAt" = now()
        FROM jsonb_to_recordset($1::jsonb) AS patch(id text, trims text[])
        WHERE issue.id = patch.id
      `, [JSON.stringify(payload)]);
      updatedRows = update.rowCount;
      if (updatedRows !== payload.length) throw new Error(`updated ${updatedRows} of ${payload.length} pending rows`);
    }

    const after = (await client.query(`
      SELECT id, make, model, trims, status
      FROM "KnownIssue"
      WHERE id = ANY($1)
    `, [ids])).rows;
    const postStateFailures = verifyRows(after, repairs, 'afterTrims');
    if (postStateFailures.length) throw new Error(`post-state verification failed: ${JSON.stringify(postStateFailures)}`);
    await client.query('COMMIT');
    return {
      applied: true,
      verifiedRows: after.length,
      updatedRows,
      alreadyAppliedRows: classification.alreadyApplied.length,
    };
  } catch (error) {
    if (apply) await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const repairFileIndex = args.indexOf('--repairs');
  const repairFile = repairFileIndex >= 0 && args[repairFileIndex + 1]
    ? path.resolve(args[repairFileIndex + 1])
    : null;
  const repairs = repairFile
    ? JSON.parse(fs.readFileSync(repairFile, 'utf8')).repairs
    : REPAIRS;
  run({ apply: args.includes('--apply'), repairs })
    .then((result) => console.log(JSON.stringify(result, null, 2)))
    .catch((error) => {
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    });
}

module.exports = { REPAIRS, classifyRows, run, sameArray, validateRepairs, verifyRows };
