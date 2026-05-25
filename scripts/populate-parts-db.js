/**
 * Populate VehiclePartLookup database with part recommendations.
 *
 * Strategy:
 * 1. For vehicles WITH static specs in vehicle-specs.json:
 *    Only look up tasks that static doesn't cover (air_filter, cabin_filter, wiper_blades, battery)
 * 2. For vehicles WITHOUT static specs:
 *    Look up ALL 12 tasks via AI
 *
 * Uses a single AI call per vehicle asking for all needed tasks at once.
 * Results are cached in VehiclePartLookup table (unique on year+make+model+trim+task).
 *
 * Usage:
 *   node scripts/populate-parts-db.js [--make Toyota] [--all] [--no-static-gaps] [--dry-run]
 *
 *   --make <Make>      Only process this make
 *   --all              Process ALL vehicles in YMMT (not just static-spec vehicles)
 *   --no-static-gaps   Skip gap-filling for static-spec vehicles
 *   --dry-run          Don't write to DB, just show what would be done
 *   --limit <N>        Max vehicles to process (default: 50)
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// ─── Config ────────────────────────────────────────────────────────────

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-5.4';
const API_KEY = process.env.OPENAI_API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

if (!API_KEY) { console.error('Missing OPENAI_API_KEY'); process.exit(1); }
if (!DATABASE_URL) { console.error('Missing DATABASE_URL'); process.exit(1); }

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 3,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Prevent unhandled pool errors from crashing the process
pool.on('error', (err) => {
  console.error('Pool idle client error:', err.message);
});

const ALL_TASKS = [
  'oil_change', 'spark_plugs', 'brake_inspection', 'coolant_flush',
  'transmission_fluid', 'air_filter', 'cabin_filter', 'wiper_blades',
  'battery', 'differential_fluid', 'bulb_replacement', 'tire_rotation',
];

// Tasks that static vehicle-specs.json NEVER covers
const STATIC_GAPS = ['air_filter', 'cabin_filter', 'wiper_blades', 'battery'];

const TASK_DESCRIPTIONS = {
  oil_change: 'Motor oil type/weight, capacity with filter, oil filter part number (OEM + aftermarket like Mobil 1/Fram/Wix), drain plug socket size, drain plug torque spec',
  spark_plugs: 'Spark plug part number (OEM + aftermarket NGK/Denso), gap, quantity, torque spec',
  brake_inspection: 'Brake fluid type, front brake pad part number/type, rear brake pad part number/type',
  coolant_flush: 'Coolant type (color and spec), total system capacity',
  transmission_fluid: 'Transmission fluid type/spec, capacity for drain and fill',
  air_filter: 'Engine air filter part number (OEM + aftermarket K&N/Fram/Wix)',
  cabin_filter: 'Cabin air filter part number (OEM + aftermarket)',
  wiper_blades: 'Wiper blade sizes: driver side length, passenger side length, rear if applicable. Common brand part numbers (Bosch, Rain-X)',
  battery: 'Battery group size, CCA recommendation, battery location (under hood/trunk/under seat)',
  differential_fluid: 'Rear differential fluid type and capacity. Front differential if AWD/4WD. If FWD-only, say N/A',
  bulb_replacement: 'Low beam bulb number, high beam bulb number, front turn signal, rear turn signal, tail/brake light, fog light',
  tire_rotation: 'Lug nut or lug bolt socket size, torque spec in ft-lbs. Note if lug bolts (European) vs nuts',
};

// ─── Parse args ────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const makeFilter = args.includes('--make') ? args[args.indexOf('--make') + 1] : null;
const processAll = args.includes('--all');
const noStaticGaps = args.includes('--no-static-gaps');
const dryRun = args.includes('--dry-run');
const limit = args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1], 10) : 50;

// ─── Load data ─────────────────────────────────────────────────────────

const vehicleSpecs = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/vehicle-specs.json'), 'utf-8'));
const ymmtData = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/data/ymmt.json'), 'utf-8'));

/**
 * Check which tasks have static specs for a given vehicle.
 * Returns set of task IDs that ARE covered by static data.
 */
function getStaticCoveredTasks(make, model, year, trim) {
  const makeData = vehicleSpecs[make];
  if (!makeData) return new Set();

  let modelData = makeData[model];
  if (!modelData) {
    const key = Object.keys(makeData).find(k =>
      model.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(model.toLowerCase())
    );
    if (key) modelData = makeData[key];
  }
  if (!modelData) return new Set();

  // Find matching generation
  let specs = null;
  const trimLower = (trim || '').toLowerCase();
  for (const [genKey, genData] of Object.entries(modelData)) {
    if (!genData.years || !genData.years.includes(year)) continue;
    const genLower = genKey.toLowerCase();
    if (trimLower && (genLower.includes(trimLower) || trimLower.includes(genLower.split(/[\/,]/)[0]))) {
      specs = genData;
      break;
    }
    if (!specs) specs = genData;
  }
  if (!specs) return new Set();

  const covered = new Set();
  if (specs.oil) covered.add('oil_change');
  if (specs.sparkPlugs) covered.add('spark_plugs');
  if (specs.brakeFluid) covered.add('brake_inspection');
  if (specs.coolant) covered.add('coolant_flush');
  if (specs.transmission) covered.add('transmission_fluid');
  if (specs.differentials) covered.add('differential_fluid');
  if (specs.bulbs) covered.add('bulb_replacement');
  if (specs.lugNuts || specs.lugBolts) covered.add('tire_rotation');
  // air_filter, cabin_filter, wiper_blades, battery are NEVER in static data
  return covered;
}

/**
 * Build list of vehicles to process with their needed tasks.
 */
function buildWorkList() {
  const work = []; // { year, make, model, trim, tasks: string[] }

  // Phase 1: Static-spec vehicles — fill gaps
  if (!noStaticGaps) {
    for (const [make, models] of Object.entries(vehicleSpecs)) {
      if (make === '_note') continue;
      if (makeFilter && make !== makeFilter) continue;

      for (const [model, generations] of Object.entries(models)) {
        for (const [genKey, genData] of Object.entries(generations)) {
          if (!genData.years || !genData.years.length) continue;

          // Use the middle year as representative
          const repYear = genData.years[Math.floor(genData.years.length / 2)];

          // Find matching trims from YMMT
          const yearData = ymmtData[String(repYear)];
          if (!yearData || !yearData[make] || !yearData[make][model]) continue;

          const trims = yearData[make][model];
          // Just use the first trim — parts are usually same across trims for these tasks
          const trim = trims[0] || 'Base';

          const staticCovered = getStaticCoveredTasks(make, model, repYear, trim);
          const neededTasks = STATIC_GAPS.filter(t => !staticCovered.has(t));

          if (neededTasks.length > 0) {
            work.push({ year: repYear, make, model, trim, tasks: neededTasks });
          }
        }
      }
    }
  }

  // Phase 2: Non-static vehicles (--all flag)
  if (processAll) {
    const staticModels = new Set();
    for (const [make, models] of Object.entries(vehicleSpecs)) {
      if (make === '_note') continue;
      for (const model of Object.keys(models)) {
        staticModels.add(`${make}|${model}`);
      }
    }

    for (const [yearStr, makes] of Object.entries(ymmtData)) {
      const year = parseInt(yearStr, 10);
      if (year < 2010) continue; // Focus on newer vehicles

      for (const [make, models] of Object.entries(makes)) {
        if (makeFilter && make !== makeFilter) continue;

        for (const [model, trims] of Object.entries(models)) {
          if (staticModels.has(`${make}|${model}`)) continue; // Already handled in Phase 1

          const trim = trims[0] || 'Base';
          // Only add once per make/model (use newest year)
          const key = `${make}|${model}|${trim}`;
          const existing = work.find(w => `${w.make}|${w.model}|${w.trim}` === key);
          if (existing) {
            if (year > existing.year) existing.year = year;
            continue;
          }

          work.push({ year, make, model, trim, tasks: ALL_TASKS });
        }
      }
    }
  }

  return work;
}

/**
 * Check which tasks are already cached in DB for a vehicle.
 */
async function getCachedTasks(year, make, model, trim) {
  const res = await pool.query(
    `SELECT task FROM "VehiclePartLookup" WHERE year=$1 AND make=$2 AND model=$3 AND trim=$4`,
    [year, make, model, trim]
  );
  return new Set(res.rows.map(r => r.task));
}

/**
 * Call AI to look up parts for multiple tasks at once.
 */
async function lookupParts(year, make, model, trim, tasks) {
  const vehicleStr = `${year} ${make} ${model} ${trim}`;

  const taskList = tasks.map(t =>
    `- ${t}: ${TASK_DESCRIPTIONS[t]}`
  ).join('\n');

  const prompt = `You are an automotive parts specialist with access to OEM service manuals and parts catalogs.

Vehicle: ${vehicleStr}

Look up the EXACT parts and specifications for each of these maintenance tasks:

${taskList}

IMPORTANT RULES:
- Use OEM part numbers from the service manual for this EXACT year/make/model/trim.
- Include both OEM and popular aftermarket alternatives (Denso, NGK, Fram, Wix, Bosch, K&N, etc.).
- Different trims often have different engines and parts — be specific to this trim level.
- For searchQuery, optimize for finding the part on Amazon (include vehicle year/make/model and part name).
- If a task is not applicable (e.g. differential fluid on a FWD car), return an empty array for that task.
- Be PRECISE. Wrong part numbers destroy trust.

Respond with a JSON object where each key is the task ID and the value is an array of parts:
{
  "task_id": [
    {
      "name": "Part Name",
      "spec": "Primary specification (part number, type, size, weight)",
      "detail": "Additional info (capacity, torque, quantity, notes)",
      "partNumber": "Primary part number if applicable",
      "searchQuery": "Optimized Amazon search query including vehicle"
    }
  ]
}

Return ONLY the JSON object.`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  try {
    const res = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: `Look up all parts for the ${vehicleStr}.` },
        ],
        max_completion_tokens: 4000,
        temperature: 0.2,
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `API ${res.status}`);
    }

    const data = await res.json();
    const content = data.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);

    // Normalize results
    const results = {};
    for (const task of tasks) {
      const parts = parsed[task];
      if (!Array.isArray(parts) || parts.length === 0) continue;
      results[task] = parts.map(p => ({
        name: String(p.name || 'Unknown'),
        spec: String(p.spec || ''),
        detail: p.detail ? String(p.detail) : undefined,
        partNumber: p.partNumber ? String(p.partNumber) : undefined,
        searchQuery: String(p.searchQuery || `${vehicleStr} ${p.name || task}`),
      }));
    }

    const usage = data.usage;
    return { results, tokens: (usage?.prompt_tokens || 0) + (usage?.completion_tokens || 0) };
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

/**
 * Insert parts into DB.
 */
async function saveParts(year, make, model, trim, taskResults) {
  for (const [task, parts] of Object.entries(taskResults)) {
    if (!parts || parts.length === 0) continue;
    await pool.query(
      `INSERT INTO "VehiclePartLookup" (id, year, make, model, trim, task, parts, source, "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, 'ai', NOW(), NOW())
       ON CONFLICT (year, make, model, trim, task)
       DO UPDATE SET parts = $6, source = 'ai', "updatedAt" = NOW()`,
      [year, make, model, trim, task, JSON.stringify(parts)]
    );
  }
}

// ─── Main ──────────────────────────────────────────────────────────────

async function main() {
  console.log('=== Parts Database Population ===');
  console.log(`Model: ${MODEL}`);
  console.log(`Make filter: ${makeFilter || 'all'}`);
  console.log(`Process all YMMT: ${processAll}`);
  console.log(`Fill static gaps: ${!noStaticGaps}`);
  console.log(`Limit: ${limit}`);
  console.log(`Dry run: ${dryRun}\n`);

  const workList = buildWorkList();
  console.log(`Total vehicles to consider: ${workList.length}`);

  // Filter out already-cached vehicles
  let pending = [];
  for (const item of workList) {
    const cached = await getCachedTasks(item.year, item.make, item.model, item.trim);
    const needed = item.tasks.filter(t => !cached.has(t));
    if (needed.length > 0) {
      pending.push({ ...item, tasks: needed });
    }
  }

  console.log(`Vehicles needing lookups: ${pending.length}`);

  // Apply limit
  if (pending.length > limit) {
    console.log(`Limiting to ${limit} vehicles`);
    pending = pending.slice(0, limit);
  }

  if (pending.length === 0) {
    console.log('Nothing to do!');
    await pool.end();
    return;
  }

  let totalTokens = 0;
  let totalTasks = 0;
  let errors = 0;

  for (let i = 0; i < pending.length; i++) {
    const { year, make, model, trim, tasks } = pending[i];
    const vehicleStr = `${year} ${make} ${model} ${trim}`;

    process.stdout.write(`[${i + 1}/${pending.length}] ${vehicleStr} (${tasks.length} tasks)... `);

    if (dryRun) {
      console.log(`DRY RUN — would look up: ${tasks.join(', ')}`);
      continue;
    }

    try {
      const { results, tokens } = await lookupParts(year, make, model, trim, tasks);
      const taskCount = Object.keys(results).length;
      await saveParts(year, make, model, trim, results);

      totalTokens += tokens;
      totalTasks += taskCount;

      console.log(`${taskCount} tasks saved (${tokens} tokens)`);

      // Rate limit: ~1 request/sec to be safe
      if (i < pending.length - 1) {
        await new Promise(r => setTimeout(r, 1000));
      }
    } catch (err) {
      errors++;
      console.log(`ERROR: ${err.message}`);
      // On network errors, wait longer before retrying
      if (err.message.includes('fetch failed') || err.message.includes('ENOTFOUND') || err.message.includes('aborted')) {
        console.log('  Waiting 5s before next request...');
        await new Promise(r => setTimeout(r, 5000));
      }
    }
  }

  console.log(`\n=== Done ===`);
  console.log(`Vehicles processed: ${pending.length - errors}`);
  console.log(`Tasks saved: ${totalTasks}`);
  console.log(`Total tokens: ${totalTokens.toLocaleString()}`);
  console.log(`Errors: ${errors}`);

  // Show DB stats
  const stats = await pool.query(
    `SELECT COUNT(*) as total, COUNT(DISTINCT make || '|' || model) as vehicles FROM "VehiclePartLookup"`
  );
  console.log(`\nDB total: ${stats.rows[0].total} part lookups across ${stats.rows[0].vehicles} vehicles`);

  await pool.end();
}

main().catch(err => {
  console.error('Fatal:', err);
  pool.end();
  process.exit(1);
});
