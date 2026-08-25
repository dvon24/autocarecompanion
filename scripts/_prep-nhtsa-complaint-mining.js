#!/usr/bin/env node
/**
 * PREP for subscription-based NHTSA complaint mining. ZERO AI, ZERO writes, ZERO WebSearch.
 *
 * Fetches real owner complaints from the NHTSA API, groups them by component, keeps only
 * recurring groups, and packages them with our existing issue titles so a Workflow agent can
 * synthesize known issues from evidence ALREADY IN HAND.
 *
 * Why this shape:
 *  - Devon wants subscription usage, not metered OpenAI. scripts/nhtsa-sourced-issues.js calls
 *    api.openai.com directly and also writes status='published', skipping the review gates.
 *    This replaces the data half of that; a Workflow does the synthesis half on the subscription.
 *  - It needs NO WebSearch, so it runs even when the session's search budget is exhausted.
 *    NHTSA is the evidence — there is nothing to go looking for.
 *
 * Usage:
 *   node scripts/_prep-nhtsa-complaint-mining.js --make Ford --model Edge --years 2015-2024
 *   node scripts/_prep-nhtsa-complaint-mining.js --targets data/_mining-targets.json
 *
 * Output: data/_nhtsa-mining-<make>-<model>.json
 *   { make, model, years, existingTitles[], groups:[{ component, count, odiNumbers[], samples[] }] }
 */
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { Pool } = require('pg');

const args = process.argv.slice(2);
const getArg = (n) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : null; };
const UA = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36' };

const MIN_GROUP = parseInt(getArg('min-complaints') || '10', 10);
const MAX_SAMPLES = parseInt(getArg('samples') || '12', 10);

// Components too vague to synthesize a specific issue from.
const SKIP_COMPONENTS = new Set(['UNKNOWN OR OTHER', 'NO SUMMARY LISTED', 'OTHER']);

function parseYears(spec) {
  if (!spec) return null;
  const m = String(spec).match(/^(\d{4})-(\d{4})$/);
  if (m) { const out = []; for (let y = +m[1]; y <= +m[2]; y++) out.push(y); return out; }
  return String(spec).split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
}

async function fetchComplaints(make, model, year) {
  const url = `https://api.nhtsa.gov/complaints/complaintsByVehicle?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&modelYear=${year}`;
  try {
    const r = await fetch(url, { headers: UA, signal: AbortSignal.timeout(30000) });
    if (!r.ok) return [];
    const j = await r.json();
    return (j.results || []).map((c) => ({ ...c, modelYear: year }));
  } catch { return []; }
}

async function fetchRecalls(make, model, year) {
  const url = `https://api.nhtsa.gov/recalls/recallsByVehicle?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&modelYear=${year}`;
  try {
    const r = await fetch(url, { headers: UA, signal: AbortSignal.timeout(30000) });
    if (!r.ok) return [];
    const j = await r.json();
    return (j.results || []).map((x) => ({ campaign: x.NHTSACampaignNumber, component: x.Component, summary: x.Summary, modelYear: year }));
  } catch { return []; }
}

async function prep(pool, make, model, years) {
  const complaints = [];
  const recalls = [];
  for (const y of years) {
    const [c, r] = await Promise.all([fetchComplaints(make, model, y), fetchRecalls(make, model, y)]);
    complaints.push(...c);
    recalls.push(...r);
    process.stdout.write(`\r  ${make} ${model}: ${complaints.length} complaints through ${y}   `);
  }
  process.stdout.write('\n');

  // group by component
  const groups = {};
  for (const c of complaints) {
    for (const raw of String(c.components || '').split(/[,|]/)) {
      const comp = raw.trim().toUpperCase();
      if (!comp || SKIP_COMPONENTS.has(comp)) continue;
      (groups[comp] ||= []).push(c);
    }
  }

  const kept = Object.entries(groups)
    .filter(([, arr]) => arr.length >= MIN_GROUP)
    .sort((a, b) => b[1].length - a[1].length)
    .map(([component, arr]) => {
      const yrs = [...new Set(arr.map((c) => c.modelYear))].sort((a, b) => a - b);
      // longest summaries carry the most diagnostic detail
      const samples = arr
        .filter((c) => c.summary && c.summary.length > 80)
        .sort((a, b) => (b.summary || '').length - (a.summary || '').length)
        .slice(0, MAX_SAMPLES)
        .map((c) => ({ odi: c.odiNumber, year: c.modelYear, crash: !!c.crash, fire: !!c.fire, injuries: c.numberOfInjuries || 0, summary: String(c.summary).slice(0, 900) }));
      return {
        component,
        count: arr.length,
        years: yrs,
        crashes: arr.filter((c) => c.crash).length,
        fires: arr.filter((c) => c.fire).length,
        injuries: arr.reduce((n, c) => n + (c.numberOfInjuries || 0), 0),
        odiNumbers: samples.map((s) => s.odi),
        samples,
      };
    });

  const existing = (await pool.query(
    `SELECT title FROM "KnownIssue" WHERE make=$1 AND model=$2 AND status IN ('published','pending_review') ORDER BY title`,
    [make, model])).rows.map((r) => r.title);

  const uniqRecalls = [...new Map(recalls.map((r) => [r.campaign, r])).values()];
  const out = { make, model, years, totalComplaints: complaints.length, existingTitles: existing, recalls: uniqRecalls, groups: kept };
  const file = `data/_nhtsa-mining-${make}-${model}`.replace(/[^a-zA-Z0-9\-_/.]/g, '-') + '.json';
  fs.writeFileSync(file, JSON.stringify(out, null, 2));
  console.log(`  ${complaints.length} complaints -> ${kept.length} recurring components (>=${MIN_GROUP}) | ${existing.length} existing titles | ${uniqRecalls.length} recalls`);
  console.log(`  top: ${kept.slice(0, 6).map((g) => `${g.component}(${g.count})`).join(', ')}`);
  console.log(`  wrote ${file}\n`);
  return out;
}

(async () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
  pool.on('error', () => {});
  let targets;
  const tf = getArg('targets');
  if (tf) targets = JSON.parse(fs.readFileSync(tf, 'utf8'));
  else {
    const make = getArg('make'), model = getArg('model');
    if (!make || !model) { console.error('need --make and --model, or --targets <file>'); process.exit(1); }
    targets = [{ make, model, years: parseYears(getArg('years')) || [2015,2016,2017,2018,2019,2020,2021,2022,2023,2024] }];
  }
  console.log(`Prepping ${targets.length} vehicle(s), min group ${MIN_GROUP}\n`);
  for (const t of targets) await prep(pool, t.make, t.model, t.years || parseYears(t.yearRange) || []);
  await pool.end();
})().catch((e) => { console.error('FAIL:', e.message); process.exit(1); });
