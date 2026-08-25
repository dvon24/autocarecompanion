#!/usr/bin/env node
/**
 * RECALL PROPAGATION GAP FINDER. ZERO AI, ZERO WebSearch, ZERO writes.
 *
 * A single NHTSA recall campaign routinely covers a dozen nameplates, but we usually document it
 * on one. Example: 25V595000 (instrument panel blank at startup, 591,377 units) covers 14
 * nameplates; we had it on 3.
 *
 * This finds every such gap:
 *   1. scan published issues for NHTSA campaign numbers (e.g. 25V595000)
 *   2. ask NHTSA what that campaign ACTUALLY covers (make/model/year rows)
 *   3. diff against our own coverage
 *   4. report campaign x model gaps, restricted to models we already carry
 *
 * Recalls are the one NHTSA dataset that carries an authoritative FIX (`Remedy`), plus the exact
 * affected model-years — so propagation is fitment-safe and fully citable. Complaints have no
 * remedy field and cannot ground a solution.
 *
 * Usage:
 *   node scripts/_find-recall-propagation-gaps.js [--limit 50] [--min-models 2]
 * Output: data/_recall-propagation-gaps.json
 */
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { Pool } = require('pg');

const args = process.argv.slice(2);
const getArg = (n) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : null; };
const LIMIT = parseInt(getArg('limit') || '0', 10);
const MIN_MODELS = parseInt(getArg('min-models') || '2', 10);
const UA = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36' };
const CAMPAIGN_RE = /\b\d{2}[VETRC]\d{6}\b/gi;

// NHTSA writes model names its own way; normalise both sides before comparing.
function norm(s) {
  return String(s).toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .replace(/^THE/, '');
}
// NHTSA uses one make string per row; ours can differ in punctuation/case.
function normMake(s) { return String(s).toUpperCase().replace(/[^A-Z]/g, ''); }

async function campaignDetail(id) {
  try {
    const r = await fetch(`https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=${encodeURIComponent(id)}`, { headers: UA, signal: AbortSignal.timeout(30000) });
    if (!r.ok) return null;
    const j = await r.json();
    return (j.results && j.results.length) ? j.results : null;
  } catch { return null; }
}

(async () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
  pool.on('error', () => {});

  // 1. campaigns referenced in our published corpus, and which of our models mention each
  const rows = (await pool.query(
    `SELECT id, make, model, title, description, solution FROM "KnownIssue" WHERE status='published'`)).rows;
  const campaignMentions = {};
  for (const r of rows) {
    const hits = new Set(String(`${r.title} ${r.description} ${r.solution}`).match(CAMPAIGN_RE) || []);
    for (const h of hits) {
      const k = h.toUpperCase();
      (campaignMentions[k] ||= new Set()).add(`${r.make}|||${r.model}`);
    }
  }
  let campaigns = Object.keys(campaignMentions).sort();
  if (LIMIT) campaigns = campaigns.slice(0, LIMIT);
  console.log(`Campaigns referenced in published issues: ${Object.keys(campaignMentions).length}${LIMIT ? ` (checking first ${campaigns.length})` : ''}\n`);

  // 2. our full model inventory, for matching NHTSA rows to models we actually carry
  const ours = (await pool.query(
    `SELECT make, model, COUNT(*)::int n FROM "KnownIssue" WHERE status='published' GROUP BY make, model`)).rows;
  const ourIndex = new Map(); // normMake|norm(model) -> {make, model, n}
  for (const o of ours) ourIndex.set(`${normMake(o.make)}|${norm(o.model)}`, o);

  const gaps = [];
  const unmatched = new Map();
  let checked = 0, apiFail = 0;

  for (const camp of campaigns) {
    const detail = await campaignDetail(camp);
    checked++;
    process.stdout.write(`\r  checked ${checked}/${campaigns.length}  gaps so far: ${gaps.length}   `);
    if (!detail) { apiFail++; continue; }

    const head = detail[0];
    // every make/model/year row NHTSA says this campaign covers
    const covered = new Map(); // "make|model" -> Set(years)
    for (const d of detail) {
      if (!d.Make || !d.Model) continue;
      const key = `${d.Make}|${d.Model}`;
      (covered.get(key) || covered.set(key, new Set()).get(key)).add(parseInt(d.ModelYear, 10));
    }
    if (covered.size < MIN_MODELS) continue;

    const documented = campaignMentions[camp];
    for (const [key, yrsSet] of covered) {
      const [nMake, nModel] = key.split('|');
      const match = ourIndex.get(`${normMake(nMake)}|${norm(nModel)}`);
      if (!match) {
        const k = `${nMake} ${nModel}`;
        unmatched.set(k, (unmatched.get(k) || 0) + 1);
        continue;                                   // model we don't carry at all
      }
      if (documented.has(`${match.make}|||${match.model}`)) continue;  // already documented
      gaps.push({
        campaign: camp,
        component: head.Component,
        summary: head.Summary,
        consequence: head.Consequence,
        remedy: head.Remedy,
        unitsAffected: head.PotentialNumberofUnitsAffected ?? null,
        make: match.make,
        model: match.model,
        years: [...yrsSet].filter(Boolean).sort((a, b) => a - b),
        ourExistingIssues: match.n,
        nhtsaMake: nMake,
        nhtsaModel: nModel,
      });
    }
  }
  process.stdout.write('\n\n');

  // report
  const byCampaign = {};
  gaps.forEach((g) => { (byCampaign[g.campaign] ||= []).push(g); });
  const ranked = Object.entries(byCampaign).sort((a, b) => b[1].length - a[1].length);

  console.log(`campaigns checked      : ${checked}  (API failures: ${apiFail})`);
  console.log(`PROPAGATION GAPS found : ${gaps.length}  across ${ranked.length} campaigns`);
  console.log(`  (each = a recall NHTSA says affects one of OUR models, that we do not document there)\n`);
  console.log('top campaigns by missing models:');
  ranked.slice(0, 15).forEach(([c, list]) => {
    console.log(`  ${c}  missing on ${String(list.length).padStart(2)} models  [${list[0].component}]`);
    console.log(`      ${list.map((g) => `${g.make} ${g.model}`).join(', ')}`);
  });

  const topUnmatched = [...unmatched.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);
  if (topUnmatched.length) {
    console.log('\nNHTSA models in these campaigns that we do NOT carry at all (net-new candidates):');
    topUnmatched.forEach(([k, n]) => console.log(`   ${k}  (in ${n} campaigns)`));
  }

  fs.writeFileSync('data/_recall-propagation-gaps.json', JSON.stringify({ generatedFor: 'recall propagation', checked, gaps }, null, 2));
  console.log('\nwrote data/_recall-propagation-gaps.json');
  await pool.end();
})().catch((e) => { console.error('FAIL:', e.message); process.exit(1); });
