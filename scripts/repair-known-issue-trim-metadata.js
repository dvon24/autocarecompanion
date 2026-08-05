/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Repairs the non-Toyota applicability prose left in KnownIssue.trims after the
 * 2026-08-05 restoration. Dry-run by default; --apply uses one guarded
 * transaction and writes only trims plus updatedAt.
 */
const path = require('node:path');
const { resolveKnownIssueConnectionString } = require('./apply-known-issue-catalog-deeplinks');

const REPAIRS = [
  ['mercedes-benz-b-class-panoramic-sunroof-drain-clog-water-leak', 'Mercedes-Benz', 'B-Class', ['Models equipped with Panoramic Sunroof'], []],
  ['volvo-v70-sunroof-drain-blockage-and-2008', 'Volvo', 'V70', ['models equipped with sunroof'], []],
  ['audi-a8-door-handle-comfort-access-2004', 'Audi', 'A8', ['Models equipped with Advanced Key/Comfort Access'], []],
  ['volvo-v70-power-tailgate-module-and-2008', 'Volvo', 'V70', ['models equipped with power tailgate'], []],
  ['audi-s8-air-suspension-failure-2013', 'Audi', 'S8', ['Vehicles with adaptive air suspension; confirm DTC and symptom code before parts'], []],
  ['seat-arona-rear-left-seatbelt-buckle-can-release-involuntarily', 'SEAT', 'Arona', ['All trims (early build)'], []],
  ['seat-arona-rear-brake-discs-corrode-seize-very-low-mileage', 'SEAT', 'Arona', ['All trims'], []],
  ['seat-arona-infotainment-system-goes-black-continuously-reboots', 'SEAT', 'Arona', ['All (multiple infotainment generations)'], []],
  ['mercedes-benz-gla-mbux-comand-infotainment-black-screen-reboot', 'Mercedes-Benz', 'GLA', ['All trims (MBUX on H247, COMAND/Audio 20 on X156)'], []],
  ['mercedes-benz-gla-12v-battery-parasitic-drain-no-start-after-sitting', 'Mercedes-Benz', 'GLA', ['All trims (incl. GLA 250e hybrid)'], []],
  ['opel-grandland-front-lower-suspension-arm-ball-joint-bolt-failure', 'Opel', 'Grandland', ['All (built 24 Jul 2023 - 28 Feb 2025)'], []],
  ['audi-a6-air-suspension-compressor-2012', 'Audi', 'A6', ['Vehicles equipped with adaptive suspension'], []],
  ['audi-a6-instrument-cluster-pixel-loss-2000', 'Audi', 'A6', ['Vehicles equipped with Audi virtual cockpit Gen2+'], []],
  ['jeep-grand-cherokee-air-suspension-2011', 'Jeep', 'Grand Cherokee', ['Vehicles equipped with Quadra-Lift air suspension (sales code SER)'], []],
  ['mazda-cx-60-wireless-qi-charger-overheating-won-t-fast-charge-phone', 'Mazda', 'CX-60', ['Vehicles equipped with the Qi wireless charger'], []],
  ['mazda-protege-ignition-switch-may-overheat-catch-fire', 'Mazda', 'Protege', ['DX', 'LX', 'ES', 'SE', 'all trims'], ['DX', 'LX', 'ES', 'SE']],
].map(([id, make, model, beforeTrims, afterTrims]) => ({ id, make, model, beforeTrims, afterTrims }));

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

async function run({ apply = false } = {}) {
  const validationErrors = validateRepairs();
  if (validationErrors.length) throw new Error(validationErrors.join('; '));
  const { Pool } = requireDependency('pg');
  const pool = new Pool({ connectionString: resolveKnownIssueConnectionString(), max: 1 });
  const client = await pool.connect();
  const ids = REPAIRS.map((row) => row.id);
  try {
    if (apply) await client.query('BEGIN');
    const before = (await client.query(`
      SELECT id, make, model, trims, status
      FROM "KnownIssue"
      WHERE id = ANY($1)
      ${apply ? 'FOR UPDATE' : ''}
    `, [ids])).rows;
    const preStateFailures = verifyRows(before);
    if (preStateFailures.length) throw new Error(`pre-state verification failed: ${JSON.stringify(preStateFailures)}`);

    if (!apply) {
      return { applied: false, verifiedRows: before.length, repairs: REPAIRS };
    }

    const payload = REPAIRS.map((row) => ({ id: row.id, trims: row.afterTrims }));
    const update = await client.query(`
      UPDATE "KnownIssue" AS issue
      SET trims = patch.trims, "updatedAt" = now()
      FROM jsonb_to_recordset($1::jsonb) AS patch(id text, trims text[])
      WHERE issue.id = patch.id
    `, [JSON.stringify(payload)]);
    if (update.rowCount !== REPAIRS.length) throw new Error(`updated ${update.rowCount} of ${REPAIRS.length} rows`);

    const after = (await client.query(`
      SELECT id, make, model, trims, status
      FROM "KnownIssue"
      WHERE id = ANY($1)
    `, [ids])).rows;
    const postStateFailures = verifyRows(after, REPAIRS, 'afterTrims');
    if (postStateFailures.length) throw new Error(`post-state verification failed: ${JSON.stringify(postStateFailures)}`);
    await client.query('COMMIT');
    return { applied: true, verifiedRows: after.length, updatedRows: update.rowCount };
  } catch (error) {
    if (apply) await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  run({ apply: process.argv.includes('--apply') })
    .then((result) => console.log(JSON.stringify(result, null, 2)))
    .catch((error) => {
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    });
}

module.exports = { REPAIRS, sameArray, validateRepairs, verifyRows };
