/**
 * Seed Parts Database — Batch populate verified parts for all vehicles
 *
 * Runs a simplified pipeline (identify → Claude verify → GPT verify → score)
 * WITHOUT web search verification (too slow for bulk). Web verification can
 * be added in a second pass for high-traffic vehicles.
 *
 * Usage:
 *   node scripts/seed-parts-database.js                    # All makes alphabetically
 *   node scripts/seed-parts-database.js --make Dodge       # Single make
 *   node scripts/seed-parts-database.js --make Dodge --model Challenger  # Single model
 *   node scripts/seed-parts-database.js --resume           # Skip already-cached entries
 */

require('dotenv').config({ path: '.env.local' });

const Anthropic = require('@anthropic-ai/sdk');
const specsData = require('../src/data/vehicle-specs.json');

const client = new Anthropic.default({ apiKey: process.env.ANTHROPIC_API_KEY });
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// ─── Config ───────────────────────────────────────────────────────────

const args = process.argv.slice(2);
function getArg(name) {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
}
const targetMake = getArg('make');
const targetModel = getArg('model');
const resumeMode = args.includes('--resume');
const webVerify = args.includes('--web-verify');

// Delay between pipeline runs (ms) to stay under rate limits
// Longer delay with web verify to avoid rate limits on web_search tool
const DELAY_MS = webVerify ? 10000 : 5000;

// Tasks to seed — most common first
const SEED_TASKS = [
  'oil_change', 'brake_inspection', 'spark_plugs', 'air_filter', 'cabin_filter',
  'battery', 'coolant_flush', 'transmission_fluid', 'wiper_blades', 'bulb_replacement',
  'tire_rotation', 'serpentine_belt', 'brake_fluid', 'differential_fluid',
  'alternator', 'starter_motor', 'water_pump', 'thermostat', 'radiator',
  'shocks_struts', 'wheel_bearing', 'ignition_coils', 'fuel_filter', 'fuel_pump',
  'oxygen_sensor', 'ac_compressor', 'power_steering_fluid', 'timing_belt',
  'brake_calipers', 'ball_joints', 'tie_rods', 'control_arms', 'sway_bar_links',
  'cv_axle', 'clutch_kit', 'u_joints', 'catalytic_converter', 'muffler_exhaust',
  'transfer_case_fluid', 'wheel_specs',
  'valve_cover_gasket', 'oil_pan_gasket', 'head_gasket', 'intake_manifold_gasket',
];

const TASK_DESCRIPTIONS = {
  oil_change: 'Motor oil type/weight/capacity, oil filter OEM + aftermarket, drain plug size/torque',
  brake_inspection: 'Front/rear brake rotors (size, part number), brake pads (OEM + aftermarket), brake fluid type',
  spark_plugs: 'Spark plugs OEM + aftermarket, gap, quantity, torque spec',
  air_filter: 'Engine air filter OEM + aftermarket part numbers',
  cabin_filter: 'Cabin air filter OEM + aftermarket part numbers',
  battery: 'Battery group size, CCA recommendation, location',
  coolant_flush: 'Coolant type, specification, total system capacity',
  transmission_fluid: 'Transmission fluid type/specification, drain and fill capacity',
  wiper_blades: 'Wiper blade sizes (driver, passenger, rear if applicable)',
  bulb_replacement: 'All bulb numbers (headlight low/high, turn signals, tail/brake, fog)',
  tire_rotation: 'Lug nut/bolt socket size, torque specification',
  serpentine_belt: 'Serpentine/drive belt part number, tensioner part number',
  brake_fluid: 'Brake fluid type (DOT rating), reservoir location',
  differential_fluid: 'Differential fluid type and capacity (front and rear)',
  alternator: 'Alternator part number OEM + aftermarket, amperage rating',
  starter_motor: 'Starter motor part number OEM + aftermarket',
  water_pump: 'Water pump part number OEM + aftermarket, gasket',
  thermostat: 'Thermostat part number, housing/gasket, opening temperature',
  radiator: 'Radiator part number OEM + aftermarket, core dimensions',
  shocks_struts: 'Front struts and rear shocks part numbers OEM + aftermarket',
  wheel_bearing: 'Front/rear wheel bearing/hub assembly part numbers',
  ignition_coils: 'Ignition coil part number, quantity needed',
  fuel_filter: 'Fuel filter part number, location (in-tank or inline)',
  fuel_pump: 'Fuel pump assembly part number',
  oxygen_sensor: 'O2 sensor part numbers (upstream/downstream)',
  ac_compressor: 'AC compressor part number, refrigerant type and capacity',
  power_steering_fluid: 'Power steering fluid type/specification',
  timing_belt: 'Timing belt/chain part number, tensioner, idler pulleys',
  brake_calipers: 'Front/rear brake caliper part numbers',
  ball_joints: 'Upper/lower ball joint part numbers',
  tie_rods: 'Inner/outer tie rod end part numbers',
  control_arms: 'Front control arm part numbers',
  sway_bar_links: 'Front/rear stabilizer bar end link part numbers',
  cv_axle: 'Front CV axle/halfshaft part numbers',
  clutch_kit: 'Clutch disc, pressure plate, throwout bearing (manual only)',
  u_joints: 'Driveshaft universal joint part numbers',
  catalytic_converter: 'Catalytic converter part number',
  muffler_exhaust: 'Muffler and exhaust pipe part numbers',
  transfer_case_fluid: 'Transfer case fluid type and capacity (4WD/AWD)',
  wheel_specs: 'Wheel bolt pattern, center bore, offset, TPMS sensor',
  valve_cover_gasket: 'Valve cover gasket set (OEM + aftermarket), bolt/grommet kit, PCV valve, left/right bank for V-engines',
  oil_pan_gasket: 'Oil pan gasket (OEM + aftermarket), RTV sealant if required, drain plug washer',
  head_gasket: 'Head gasket set (OEM + aftermarket), head bolt set, MLS or composite, left/right bank for V-engines',
  intake_manifold_gasket: 'Intake manifold gasket set (OEM + aftermarket), upper/lower if applicable, plenum gasket',
};

// ─── Database ─────────────────────────────────────────────────────────

// Use pg directly since we can't use Prisma outside Next.js easily
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
pool.on('error', () => {}); // Prevent crash on connection drop

async function isAlreadyCached(year, make, model, trim, task) {
  try {
    const res = await pool.query(
      `SELECT id FROM "VehiclePartLookup" WHERE year=$1 AND make=$2 AND model=$3 AND trim=$4 AND task=$5`,
      [year, make, model, trim, task]
    );
    return res.rows.length > 0;
  } catch { return false; }
}

async function storeParts(year, make, model, trim, task, generation, parts, source, status) {
  try {
    await pool.query(
      `INSERT INTO "VehiclePartLookup" (id, year, make, model, trim, task, generation, parts, source, status, "webSearchConfirmed", "createdAt", "updatedAt")
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8, $9, false, NOW(), NOW())
       ON CONFLICT (year, make, model, trim, task) DO UPDATE SET parts=$7, source=$8, status=$9, "updatedAt"=NOW()`,
      [year, make, model, trim, task, generation, JSON.stringify(parts), source, status]
    );
  } catch (e) {
    console.error(`    DB error: ${e.message}`);
  }
}

// ─── Pipeline (simplified — no web search) ────────────────────────────

function parseJSON(text) {
  const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');
  const match = cleaned.match(/\{[\s\S]*\}/);
  return JSON.parse(match ? match[0] : cleaned);
}

async function identifyParts(vehicleStr, trim, task, groundTruth) {
  const gtSection = groundTruth
    ? `\nVERIFIED SPECS (trust over training data):\nEngine: ${groundTruth.engine}\n${groundTruth.raw}\n`
    : '';

  const resp = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `Automotive parts specialist. Look up EXACT parts for this vehicle/task.

Vehicle: ${vehicleStr}
Task: ${task.replace(/_/g, ' ')}
Look up: ${TASK_DESCRIPTIONS[task] || task}
${gtSection}
For each part: name, oemPartNumber, oemBrand, specification, quantity, notes.
Be specific to the ${trim} trim. Don't confuse base model with performance specs.
Respond with ONLY JSON: { "engine": "...", "parts": [...] }`,
    }],
    temperature: 0.1,
  });

  const text = resp.content.find(b => b.type === 'text')?.text || '{}';
  return parseJSON(text);
}

async function verifyParts(vehicleStr, parts) {
  const resp = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 6000,
    messages: [{
      role: 'user',
      content: `Verify these parts for a ${vehicleStr}. For each: confirm OEM number, check superseded, add 2-4 aftermarket cross-references.

Parts: ${JSON.stringify(parts, null, 2)}

Respond with ONLY JSON: { "parts": [{ "name", "oemPartNumber", "oemBrand", "specification", "quantity", "notes", "verified": true/false, "crossReferences": [{ "brand", "partNumber" }] }] }`,
    }],
    temperature: 0.1,
  });

  const text = resp.content.find(b => b.type === 'text')?.text || '{}';
  try { return parseJSON(text); } catch { return { parts }; }
}

async function gptVerify(vehicleStr, parts) {
  if (!OPENAI_API_KEY) return parts;
  try {
    const resp = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [
          { role: 'system', content: 'Automotive parts verifier. Verify each part number for the given vehicle.' },
          { role: 'user', content: `Verify for ${vehicleStr}:\n${JSON.stringify(parts.map(p => ({ name: p.name, oemPartNumber: p.oemPartNumber, oemBrand: p.oemBrand })))}\n\nReturn JSON: { "parts": [{ "oemPartNumber", "gptAgrees": true/false }] }` },
        ],
        max_completion_tokens: 1500,
        temperature: 0.1,
        response_format: { type: 'json_object' },
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!resp.ok) return parts;
    const data = await resp.json();
    const parsed = JSON.parse(data.choices?.[0]?.message?.content || '{}');
    const gptResults = parsed.parts || [];
    return parts.map((p, i) => ({
      ...p,
      dualVerified: gptResults[i]?.gptAgrees !== false,
    }));
  } catch { return parts; }
}

async function webVerifyPart(partNumber, partName, vehicleStr) {
  try {
    const resp = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1500,
      tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 1 }],
      messages: [{
        role: 'user',
        content: `Search for automotive part "${partNumber}" for ${vehicleStr}. Is this part number sold by real retailers (Amazon, RockAuto, AutoZone)?`,
      }],
    });

    const retailers = [];
    const urls = [];
    for (const block of resp.content) {
      if (block.type === 'web_search_tool_result' && Array.isArray(block.content)) {
        for (const r of block.content) {
          if (r.type === 'web_search_result') {
            urls.push(r.url);
            for (const domain of ['amazon.com', 'rockauto.com', 'autozone.com', 'oreillyauto.com', 'advanceautoparts.com']) {
              if (r.url.includes(domain) && !retailers.includes(domain.split('.')[0])) {
                retailers.push(domain.split('.')[0]);
              }
            }
          }
        }
      }
    }
    return { confirmed: retailers.length > 0, retailers };
  } catch {
    return { confirmed: false, retailers: [] };
  }
}

function normalizeParts(parts) {
  return (parts || []).map(p => ({
    name: String(p.name || 'Unknown'),
    spec: String(p.specification || p.oemPartNumber || ''),
    detail: p.notes || undefined,
    partNumber: p.oemPartNumber || undefined,
    oemBrand: p.oemBrand || undefined,
    crossReferences: Array.isArray(p.crossReferences) ? p.crossReferences : undefined,
    quantity: p.quantity || undefined,
    confidence: p.dualVerified ? 'dual-verified' : (p.verified === false ? 'moderate' : 'high'),
    searchQuery: `${p.oemBrand || ''} ${p.oemPartNumber || ''} ${p.name || ''}`.trim(),
  }));
}

// ─── Ground Truth ─────────────────────────────────────────────────────

function loadGroundTruth(make, model, trim, year) {
  const makeData = specsData[make];
  if (!makeData) return null;
  const modelData = makeData[model];
  if (!modelData) return null;

  const trimLower = (trim || '').toLowerCase();
  for (const [genKey, genData] of Object.entries(modelData)) {
    if (!genData.years || !genData.years.includes(year)) continue;
    const genKeyLower = genKey.toLowerCase();
    const match = genKeyLower.split(/[\/,]/).some(p => p.trim().length > 1 && trimLower.includes(p.trim())) ||
                  trimLower.split(/[\s,]/).some(p => p.length > 1 && genKeyLower.includes(p));
    if (match) {
      return { engine: genData.engine, raw: JSON.stringify(genData, null, 2).slice(0, 2000) };
    }
  }
  // Fallback: first matching year
  for (const [, genData] of Object.entries(modelData)) {
    if (genData.years && genData.years.includes(year)) {
      return { engine: genData.engine, raw: JSON.stringify(genData, null, 2).slice(0, 2000) };
    }
  }
  return null;
}

// ─── Main ─────────────────────────────────────────────────────────────

async function seedGeneration(make, model, genKey, genData) {
  const years = genData.years || [];
  if (years.length === 0) return;

  // Use middle year as representative
  const repYear = years[Math.floor(years.length / 2)];
  // Extract trim from genKey (e.g., "2015+ 6.4 SRT" → "SRT")
  const trimParts = genKey.replace(/^\d{4}[\+\-]?\d*\s*/, '').trim();
  const trim = trimParts || 'Base';
  const vehicleStr = `${repYear} ${make} ${model} ${trim}`;

  console.log(`\n  ${vehicleStr} (gen: "${genKey}", years: ${years[0]}-${years[years.length - 1]})`);

  let seeded = 0;
  let skipped = 0;
  let failed = 0;

  for (const task of SEED_TASKS) {
    // Check cache
    if (resumeMode) {
      const cached = await isAlreadyCached(repYear, make, model, trim, task);
      if (cached) { skipped++; continue; }
    }

    try {
      process.stdout.write(`    ${task}...`);

      // Load ground truth
      const gt = loadGroundTruth(make, model, trim, repYear);

      // Identify
      const identified = await identifyParts(vehicleStr, trim, task, gt);
      if (!identified.parts || identified.parts.length === 0) {
        console.log(' no parts found');
        failed++;
        await delay(DELAY_MS);
        continue;
      }

      // Verify (Claude)
      const verified = await verifyParts(vehicleStr, identified.parts);

      // Verify (GPT)
      let dualVerified = await gptVerify(vehicleStr, verified.parts || identified.parts);

      // Web verify (optional — slower but confirms parts exist on retailer sites)
      if (webVerify) {
        for (let i = 0; i < dualVerified.length; i++) {
          const p = dualVerified[i];
          if (!p.oemPartNumber) continue;
          const wv = await webVerifyPart(p.oemPartNumber, p.name, vehicleStr);
          dualVerified[i] = { ...p, webVerified: wv.confirmed, retailers: wv.retailers };
          await delay(2000); // Extra delay between web searches
        }
      }

      // Normalize and store
      const normalized = normalizeParts(dualVerified);

      // Store for representative year
      const status = webVerify ? (normalized.some(p => p.webVerified === false) ? 'partial' : 'verified') : 'pending';
      await storeParts(repYear, make, model, trim, task, genKey, normalized, 'pipeline', status);

      // Also store for all other years in this generation (same parts)
      for (const yr of years) {
        if (yr === repYear) continue;
        await storeParts(yr, make, model, trim, task, genKey, normalized, 'pipeline', status);
      }

      console.log(` ✓ ${normalized.length} parts (${years.length} years)`);
      seeded++;
    } catch (e) {
      console.log(` ✗ ${e.message?.slice(0, 60)}`);
      failed++;
    }

    await delay(DELAY_MS);
  }

  console.log(`    → Seeded: ${seeded}, Skipped: ${skipped}, Failed: ${failed}`);
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  Au7o Parts Database Seeder');
  console.log(`  Target: ${targetMake || 'All makes'} ${targetModel || ''}`);
  console.log(`  Resume mode: ${resumeMode ? 'ON' : 'OFF'}`);
  console.log(`  Web verify: ${webVerify ? 'ON (slower, confirms on retailer sites)' : 'OFF (fast seed, verify later)'}`);
  console.log(`  Tasks: ${SEED_TASKS.length}`);
  console.log(`  Delay: ${DELAY_MS}ms between lookups`);
  console.log('═══════════════════════════════════════════════════════════');

  const allMakes = Object.keys(specsData).filter(k => k !== '_note');

  // Order: target make first (Dodge), then alphabetical
  let makes;
  if (targetMake) {
    makes = allMakes.filter(m => m.toLowerCase() === targetMake.toLowerCase());
    if (makes.length === 0) {
      console.error(`Make "${targetMake}" not found. Available: ${allMakes.join(', ')}`);
      process.exit(1);
    }
  } else {
    // Dodge first, then alphabetical
    makes = ['Dodge', ...allMakes.filter(m => m !== 'Dodge').sort()];
  }

  const startTime = Date.now();
  let totalGens = 0;

  for (const make of makes) {
    const makeData = specsData[make];
    const models = Object.keys(makeData);
    const filteredModels = targetModel
      ? models.filter(m => m.toLowerCase() === targetModel.toLowerCase())
      : models;

    console.log(`\n━━━ ${make} (${filteredModels.length} models) ━━━`);

    for (const model of filteredModels) {
      const generations = makeData[model];
      console.log(`\n📦 ${make} ${model} — ${Object.keys(generations).length} generations`);

      for (const [genKey, genData] of Object.entries(generations)) {
        await seedGeneration(make, model, genKey, genData);
        totalGens++;
      }
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  console.log(`\n═══════════════════════════════════════════════════════════`);
  console.log(`  Done! ${totalGens} generations seeded in ${elapsed} minutes`);
  console.log('═══════════════════════════════════════════════════════════');

  await pool.end();
}

main().catch(err => {
  console.error('Fatal:', err.message);
  pool.end();
  process.exit(1);
});
