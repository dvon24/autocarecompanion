#!/usr/bin/env node
/**
 * Select which published issues should get a buyable fix (fixParts). ZERO AI, ZERO writes.
 *
 * fixParts coverage is 734/7,761 (9.5%). This picks the issues where a buyable part actually
 * exists and demand is real, so the resolver spends its budget where it pays.
 *
 * WHAT IS DELIBERATELY EXCLUDED
 *  - **Recall-derived issues.** The remedy is a FREE dealer repair. Selling someone a part for a
 *    repair the manufacturer owes them is wrong, and it would bury the actionable advice (check
 *    your VIN, book the free fix). All 337 recall-propagation issues are excluded on this rule.
 *  - Software/reflash/calibration-only fixes — nothing to buy.
 *  - Diagnostic-only fixes ("have it inspected") — the recommendation is a test, not a part.
 *  - Issues that already have fixParts.
 *
 * RANKING: interest-email lead vehicles first (real people waiting), then models with the most
 * published issues (proxy for traffic), then issue severity.
 *
 * Usage:
 *   node scripts/_prep-fixparts-targets.js [--limit 60] [--out data/_fixparts-targets.json]
 */
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { Pool } = require('pg');

const args = process.argv.slice(2);
const getArg = (n) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : null; };
const LIMIT = parseInt(getArg('limit') || '60', 10);
const OUT = getArg('out') || 'data/_fixparts-targets.json';

// A recall remedy is free at a dealer — never attach a buy link to one.
const RECALL_RE = /\brecall\b|\bcampaign\s*\d{2}[VETRC]\d{6}\b|\b\d{2}[VETRC]\d{6}\b/i;
// Fixes with nothing to buy.
const NO_PART_RE = /^(?=.*\b(software|reflash|re-?program|calibration|firmware|update|ota)\b)(?!.*\b(replace|install|kit|pump|valve|sensor|hose|gasket|belt|chain|module|coil|filter)\b)/i;
const DIAGNOSTIC_RE = /^(?=.*\b(inspect|diagnos|test|verify|confirm|scan)\b)(?!.*\breplace\b)/i;
// Positive signal: the solution names something you fit.
const PART_RE = /\b(replace|replacement|install|new)\b.{0,60}\b(pump|valve|sensor|hose|gasket|belt|chain|tensioner|module|coil|filter|actuator|solenoid|bearing|bushing|strut|shock|compressor|condenser|radiator|thermostat|injector|spark plug|battery|alternator|starter|clutch|rotor|caliper|pad|regulator|switch|relay|harness|seal|mount|arm|link|joint)\b/i;

(async () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
  pool.on('error', () => {});

  const rows = (await pool.query(`
    SELECT id, make, model, years, trims, engines, category, title, description, solution,
           severity, "estimatedCostLow", "estimatedCostHigh"
    FROM "KnownIssue"
    WHERE status = 'published' AND "fixParts"::text IN ('[]','null')
  `)).rows;

  // demand signals
  const perModel = new Map((await pool.query(
    `SELECT make, model, COUNT(*)::int n FROM "KnownIssue" WHERE status='published' GROUP BY make, model`
  )).rows.map((r) => [`${r.make}|${r.model}`, r.n]));

  const leadRows = (await pool.query(
    `SELECT context, COUNT(*)::int n FROM "InterestEmail"
     WHERE "unsubscribedAt" IS NULL AND context LIKE 'known-issues:%' GROUP BY context`)).rows;
  const leadCount = new Map();
  for (const l of leadRows) leadCount.set(String(l.context).replace(/^known-issues:/, '').trim(), l.n);

  const rejected = { recall: 0, noPart: 0, diagnostic: 0, noSignal: 0 };
  const candidates = [];
  for (const r of rows) {
    const hay = `${r.title} ${r.solution}`;
    if (RECALL_RE.test(hay)) { rejected.recall++; continue; }
    if (NO_PART_RE.test(r.solution)) { rejected.noPart++; continue; }
    if (DIAGNOSTIC_RE.test(r.solution)) { rejected.diagnostic++; continue; }
    if (!PART_RE.test(r.solution)) { rejected.noSignal++; continue; }

    const key = `${r.make} ${r.model}`;
    const leads = leadCount.get(key) || 0;
    const modelIssues = perModel.get(`${r.make}|${r.model}`) || 0;
    const sevScore = r.severity === 'high' ? 3 : r.severity === 'medium' ? 2 : 1;
    candidates.push({
      id: r.id, make: r.make, model: r.model, years: r.years, trims: r.trims, engines: r.engines,
      category: r.category, severity: r.severity, title: r.title,
      solution: r.solution, description: String(r.description || '').slice(0, 600),
      estimatedCostLow: r.estimatedCostLow, estimatedCostHigh: r.estimatedCostHigh,
      _leads: leads, _modelIssues: modelIssues,
      _score: leads * 100 + modelIssues + sevScore,
    });
  }
  candidates.sort((a, b) => b._score - a._score);
  const picked = candidates.slice(0, LIMIT);

  console.log(`published without fixParts : ${rows.length}`);
  console.log(`  excluded — recall (free dealer fix) : ${rejected.recall}`);
  console.log(`  excluded — software/no part         : ${rejected.noPart}`);
  console.log(`  excluded — diagnostic only          : ${rejected.diagnostic}`);
  console.log(`  excluded — no part named in solution: ${rejected.noSignal}`);
  console.log(`  BUYABLE CANDIDATES                  : ${candidates.length}`);
  console.log(`\nselected top ${picked.length} by (lead count x100 + model issue count + severity)`);
  const byMake = {};
  picked.forEach((c) => { byMake[c.make] = (byMake[c.make] || 0) + 1; });
  console.log('  by make: ' + Object.entries(byMake).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}=${v}`).join(' '));
  console.log('\n  top 12:');
  picked.slice(0, 12).forEach((c) => console.log(`    ${c._leads ? c._leads + ' lead(s)  ' : '          '}${(c.make + ' ' + c.model).padEnd(24)} ${c.title.slice(0, 58)}`));

  fs.writeFileSync(OUT, JSON.stringify(picked, null, 2));
  console.log(`\nwrote ${OUT}`);
  await pool.end();
})().catch((e) => { console.error('FAIL:', e.message); process.exit(1); });
