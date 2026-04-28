#!/usr/bin/env node
/* eslint-disable */
/**
 * Seeds VehiclePartLookup cache for the top US bestseller vehicles using
 * the EXISTING multi-agent parts pipeline (Identifier → Verifier → GPT
 * verification → Web verification → Scorer). Goes through /api/parts so
 * the standard storePipelineResult() upsert path runs and we don't have
 * to duplicate persistence logic here.
 *
 * Latency note from the pipeline audit: ~30-40s per vehicle×task. With
 * concurrency=3 a 60-lookup pilot is ~10-15 min wall-clock; the full
 * 864-lookup run is ~1.5-2 hours.
 *
 * Usage:
 *   # Pilot (10 vehicles × 1 year × 3 tasks = 30 lookups, validate quality)
 *   node scripts/seed-parts-bestsellers.js --pilot
 *
 *   # Full run (24 vehicles × 3 years × 12 tasks ≈ 864 lookups)
 *   node scripts/seed-parts-bestsellers.js
 *
 *   # Custom concurrency
 *   SEED_CONCURRENCY=5 node scripts/seed-parts-bestsellers.js
 *
 *   # Production target (default is localhost)
 *   AU7O_BASE_URL=https://au7o.io node scripts/seed-parts-bestsellers.js
 *
 * Requires: dev server running at AU7O_BASE_URL (or production URL).
 *           Pipeline env vars (ANTHROPIC_API_KEY, OPENAI_API_KEY) must
 *           be set on the SERVER, not here — this script just hits HTTP.
 */
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.AU7O_BASE_URL || 'http://localhost:3000';
const CONCURRENCY = parseInt(process.env.SEED_CONCURRENCY || '3', 10);
const TIMEOUT_MS = parseInt(process.env.SEED_TIMEOUT_MS || '180000', 10); // 3 min/lookup
const isPilot = process.argv.includes('--pilot');

// Top 25 US bestsellers (annualized 2024). [make, model] pairs — trim is
// resolved per-year from ymmt.json since trim names rotate.
const BESTSELLERS = [
  ['Ford', 'F-150'],
  ['Chevrolet', 'Silverado 1500'],
  ['Ram', '1500'],
  ['Toyota', 'RAV4'],
  ['Honda', 'CR-V'],
  ['Toyota', 'Camry'],
  ['Honda', 'Civic'],
  ['Toyota', 'Corolla'],
  ['Tesla', 'Model Y'],
  ['Toyota', 'Tacoma'],
  ['Nissan', 'Rogue'],
  ['GMC', 'Sierra 1500'],
  ['Honda', 'Accord'],
  ['Hyundai', 'Tucson'],
  ['Mazda', 'CX-5'],
  ['Subaru', 'Forester'],
  ['Subaru', 'Outback'],
  ['Toyota', 'Highlander'],
  ['Ford', 'Explorer'],
  ['Jeep', 'Grand Cherokee'],
  ['Jeep', 'Wrangler'],
  ['Chevrolet', 'Equinox'],
  ['Toyota', '4Runner'],
  ['Honda', 'Pilot'],
  ['Ford', 'Bronco'],
];

// Pilot uses the 10 highest-volume models, only the latest model year, and
// the 3 tasks with the most search demand. Goal: ~30 lookups in ~10 min so
// we can spot-check quality before the full run.
const PILOT_BESTSELLERS = BESTSELLERS.slice(0, 10);
const PILOT_YEARS = [2024];
const PILOT_TASKS = ['oil_change', 'air_filter', 'brake_inspection'];

const FULL_YEARS = [2024, 2025, 2026];
const FULL_TASKS = [
  'oil_change',
  'air_filter',
  'cabin_filter',
  'spark_plugs',
  'brake_inspection',
  'tire_rotation',
  'battery',
  'wiper_blades',
  'coolant_flush',
  'transmission_fluid',
  'serpentine_belt',
  'fuel_filter',
];

const vehicles = isPilot ? PILOT_BESTSELLERS : BESTSELLERS;
const years = isPilot ? PILOT_YEARS : FULL_YEARS;
const tasks = isPilot ? PILOT_TASKS : FULL_TASKS;

const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

// Pick a "common" trim for seeding. Performance trims (ZL1, GT500, Trail
// Boss) often have different OEM specs, so we deliberately avoid them in
// the pilot — users searching ZL1 still hit the live pipeline on demand.
const PREFERRED_TRIMS = [
  'Base', 'LE', 'SE', 'EX', 'LX', 'LT', '1LT', 'SR5', 'XLT', 'Sport',
  'Big Horn', 'Laramie', 'Limited', 'Premium', 'Touring', 'Latitude',
  'SXT', 'GT', 'Special Edition', 'Long Range', 'Standard',
];

function pickTrim(year, make, model) {
  const trims = ymmt[String(year)]?.[make]?.[model];
  if (!trims || trims.length === 0) return null;
  for (const p of PREFERRED_TRIMS) {
    if (trims.includes(p)) return p;
  }
  return trims[0];
}

async function seedOne(year, make, model, trim, task) {
  const params = new URLSearchParams({
    year: String(year),
    make,
    model,
    trim,
    task,
  });
  const url = `${BASE_URL}/api/parts?${params}`;
  const t0 = Date.now();
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    const ms = Date.now() - t0;
    if (!r.ok) {
      const text = await r.text().catch(() => '');
      return { ok: false, error: `HTTP ${r.status}: ${text.slice(0, 100)}`, ms };
    }
    const data = await r.json();
    return {
      ok: true,
      ms,
      partsCount: Array.isArray(data.parts) ? data.parts.length : 0,
      confidence: data.overallConfidence || data.source || 'unknown',
      source: data.source || 'unknown',
      cached: !!data.cached,
    };
  } catch (err) {
    return { ok: false, error: err.message || String(err), ms: Date.now() - t0 };
  }
}

async function runPool(items, worker, concurrency) {
  const results = [];
  let idx = 0;
  async function workerLoop() {
    while (idx < items.length) {
      const i = idx++;
      const item = items[i];
      const r = await worker(item, i);
      results.push({ item, result: r });
    }
  }
  await Promise.all(Array.from({ length: concurrency }, workerLoop));
  return results;
}

async function main() {
  const work = [];
  const skipped = [];
  for (const [make, model] of vehicles) {
    for (const year of years) {
      const trim = pickTrim(year, make, model);
      if (!trim) {
        skipped.push(`${year} ${make} ${model}`);
        continue;
      }
      for (const task of tasks) {
        work.push({ year, make, model, trim, task });
      }
    }
  }

  const total = work.length;
  console.log(`[seed] mode=${isPilot ? 'PILOT' : 'FULL'} · target=${BASE_URL}`);
  console.log(`[seed] ${vehicles.length} vehicles × ${years.length} years × ${tasks.length} tasks = ${total} lookups`);
  console.log(`[seed] concurrency=${CONCURRENCY}, timeout=${TIMEOUT_MS}ms/lookup`);
  if (skipped.length > 0) {
    console.log(`[seed] skipped (no trim in ymmt): ${skipped.length}`);
    skipped.slice(0, 5).forEach((s) => console.log(`         · ${s}`));
  }
  console.log('');

  const t0 = Date.now();
  let done = 0;
  let failed = 0;
  let totalParts = 0;
  await runPool(
    work,
    async (job) => {
      const r = await seedOne(job.year, job.make, job.model, job.trim, job.task);
      done++;
      if (!r.ok) failed++;
      else totalParts += r.partsCount || 0;
      const status = r.ok
        ? `✓ ${r.partsCount} parts · ${r.confidence}${r.cached ? ' · cached' : ''}`
        : `✗ ${r.error}`;
      const idxStr = `[${String(done).padStart(String(total).length)}/${total}]`;
      const veh = `${job.year} ${job.make} ${job.model} ${job.trim}`.padEnd(45);
      console.log(`${idxStr} ${veh} ${job.task.padEnd(22)} ${status} (${r.ms}ms)`);
      return r;
    },
    CONCURRENCY,
  );

  const elapsed = Math.round((Date.now() - t0) / 1000);
  console.log('\n──────────────────────────────────────────────────');
  console.log(`[seed] done in ${elapsed}s (${(elapsed / 60).toFixed(1)}m)`);
  console.log(`[seed] ${done - failed}/${done} succeeded · ${failed} failed`);
  console.log(`[seed] total parts cached: ${totalParts}`);
  console.log(`[seed] avg parts per lookup: ${(totalParts / Math.max(1, done - failed)).toFixed(1)}`);
}

main().catch((e) => {
  console.error('[seed] fatal error:', e);
  process.exit(1);
});
