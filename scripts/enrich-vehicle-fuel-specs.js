#!/usr/bin/env node
/**
 * Enrich src/data/vehicle-specs.json with structured fuel-economy and
 * tank-capacity data via Claude Sonnet 4.6.
 *
 * Adds two fields per generation entry that doesn't already have them:
 *   fuelEconomy: { city, highway, combined, mpgeCombined, source }
 *   tankCapacity: { gallons, batteryKwh }
 *
 * EVs: city/hwy/combined null, mpgeCombined populated, tankGallons null,
 * batteryKwh populated. ICE/hybrid: opposite.
 *
 * Usage:
 *   node scripts/enrich-vehicle-fuel-specs.js --dry-run         # preview
 *   node scripts/enrich-vehicle-fuel-specs.js --limit 10        # 10 entries only
 *   node scripts/enrich-vehicle-fuel-specs.js                   # full run
 *   node scripts/enrich-vehicle-fuel-specs.js --make Toyota     # one make only
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = 'claude-sonnet-4-6';
const SPECS_PATH = path.join(__dirname, '..', 'src', 'data', 'vehicle-specs.json');
const BATCH_SIZE = 5;
const DELAY_MS = 1500;

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const limit = args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1], 10) : Infinity;
const makeFilter = args.includes('--make') ? args[args.indexOf('--make') + 1] : null;

if (!ANTHROPIC_KEY) {
  console.error('Missing ANTHROPIC_API_KEY in .env.local');
  process.exit(1);
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function enrichBatch(items) {
  const prompt = `For each of these specific vehicles, return EPA-rated fuel economy (city, highway, combined in MPG) and fuel tank capacity (US gallons). Use the BASE / most common trim's official EPA numbers from your training data.

${items.map((it, i) => `${i + 1}. ${it.years[0]}-${it.years[it.years.length - 1]} ${it.make} ${it.model} (${it.gen}) — engine: ${it.engine || 'unknown'}`).join('\n')}

Return a JSON array, one object per vehicle in the SAME ORDER, with this exact shape:

For ICE / hybrid vehicles:
{ "city": <int>, "highway": <int>, "combined": <int>, "mpge_combined": null, "tankGallons": <number with one decimal>, "batteryKwh": null }

For pure EVs:
{ "city": null, "highway": null, "combined": null, "mpge_combined": <int>, "tankGallons": null, "batteryKwh": <number> }

For PHEVs (plug-in hybrids), populate BOTH MPG and MPGe and BOTH tankGallons and batteryKwh.

If you genuinely don't know a number, return null for that field. NEVER fabricate. Return only the JSON array, no markdown fences, no prose.`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2000,
      system: 'You are a vehicle specs reference. Return ONLY JSON arrays matching the requested shape. Use real EPA numbers from your training. NEVER fabricate; use null when uncertain.',
      messages: [{ role: 'user', content: prompt }],
    }),
    signal: AbortSignal.timeout(60000),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Anthropic API ${res.status}`);
  }

  const data = await res.json();
  const raw = data.content?.[0]?.text || '[]';
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  // Some responses might wrap in an object; handle both.
  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
    if (arrayMatch) parsed = JSON.parse(arrayMatch[0]);
    else throw new Error('Unparseable response');
  }
  if (Array.isArray(parsed)) return parsed;
  if (parsed && Array.isArray(parsed.vehicles)) return parsed.vehicles;
  if (parsed && Array.isArray(parsed.results)) return parsed.results;
  throw new Error('Response is not an array');
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  Enrich vehicle-specs.json with fuel economy + tank data');
  console.log('  Dry run:', dryRun, '| Make filter:', makeFilter || 'ALL', '| Limit:', limit);
  console.log('═══════════════════════════════════════════════════════════\n');

  const specs = JSON.parse(fs.readFileSync(SPECS_PATH, 'utf8'));
  const items = [];

  for (const make of Object.keys(specs).filter(k => !k.startsWith('_'))) {
    if (makeFilter && make !== makeFilter) continue;
    for (const model of Object.keys(specs[make])) {
      for (const gen of Object.keys(specs[make][model])) {
        const entry = specs[make][model][gen];
        if (entry.fuelEconomy && entry.tankCapacity) continue; // skip already enriched
        items.push({
          make, model, gen,
          years: entry.years || [],
          engine: entry.engine || '',
        });
      }
    }
  }

  const toProcess = items.slice(0, limit);
  console.log(`Found ${items.length} entries needing enrichment, processing ${toProcess.length}\n`);

  let updated = 0;
  let failed = 0;

  for (let i = 0; i < toProcess.length; i += BATCH_SIZE) {
    const batch = toProcess.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(toProcess.length / BATCH_SIZE);
    process.stdout.write(`  Batch ${batchNum}/${totalBatches}: ${batch.map(b => `${b.make} ${b.model}`).join(', ').slice(0, 60)}... `);

    try {
      const results = await enrichBatch(batch);
      for (let j = 0; j < batch.length; j++) {
        const item = batch[j];
        const result = results[j];
        if (!result || typeof result !== 'object') {
          failed++;
          continue;
        }
        const target = specs[item.make][item.model][item.gen];
        target.fuelEconomy = {
          city: typeof result.city === 'number' ? result.city : null,
          highway: typeof result.highway === 'number' ? result.highway : null,
          combined: typeof result.combined === 'number' ? result.combined : null,
          mpgeCombined: typeof result.mpge_combined === 'number' ? result.mpge_combined : null,
          source: 'epa-estimate',
        };
        target.tankCapacity = {
          gallons: typeof result.tankGallons === 'number' ? result.tankGallons : null,
          batteryKwh: typeof result.batteryKwh === 'number' ? result.batteryKwh : null,
        };
        updated++;
      }
      console.log('✓');
    } catch (err) {
      failed += batch.length;
      console.log('✗', err.message);
    }

    if (i + BATCH_SIZE < toProcess.length) await sleep(DELAY_MS);
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`  Updated: ${updated} | Failed: ${failed}`);
  console.log('═══════════════════════════════════════════════════════════');

  if (dryRun) {
    console.log('\nDRY RUN — no file written.');
    if (updated > 0) {
      console.log('\nFirst few proposed updates:');
      let shown = 0;
      for (const make of Object.keys(specs).filter(k => !k.startsWith('_'))) {
        for (const model of Object.keys(specs[make])) {
          for (const gen of Object.keys(specs[make][model])) {
            const entry = specs[make][model][gen];
            if (entry.fuelEconomy?.source === 'epa-estimate') {
              console.log(`  ${make} ${model} (${gen}):`, JSON.stringify({ fuel: entry.fuelEconomy, tank: entry.tankCapacity }));
              shown++;
              if (shown >= 8) return;
            }
          }
        }
      }
    }
  } else {
    fs.writeFileSync(SPECS_PATH, JSON.stringify(specs, null, 2));
    console.log(`\nWrote updates to ${SPECS_PATH}`);
  }
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
