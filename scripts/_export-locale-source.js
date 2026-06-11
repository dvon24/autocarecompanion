#!/usr/bin/env node
/**
 * Export English known-issue content for an explicit model list so a
 * workflow can translate it for a target market. ZERO AI calls.
 *
 * Generalizes _export-pt-br-source.js: instead of a make filter + richness
 * cap, takes the exact "Make Model" list that fits the target market.
 *
 * Usage:
 *   node scripts/_export-locale-source.js de-source.json "BMW 3 Series" "Audi A4" ...
 *
 * Writes data/<outfile>: [{slug, make, model, issues:[...]}] — same shape
 * the translate workflows and _persist-translation.js consume.
 */
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const [outFile, ...modelNames] = process.argv.slice(2);
if (!outFile || modelNames.length === 0) {
  console.error('Usage: node scripts/_export-locale-source.js <outfile.json> "Make Model" ...');
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
pool.on('error', () => {});

const slugify = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

async function main() {
  const wanted = new Set(modelNames.map((n) => slugify(n)));
  const rows = (await pool.query(
    `SELECT id, make, model, years, title, description, solution, symptoms, severity, category,
            "estimatedCostLow", "estimatedCostHigh", "dtcCodes", "reportCount"
     FROM "KnownIssue"
     WHERE status='published'
     ORDER BY make, model`,
  )).rows;

  const byModel = new Map();
  for (const r of rows) {
    const slug = slugify(`${r.make} ${r.model}`);
    if (!wanted.has(slug)) continue;
    if (!byModel.has(slug)) byModel.set(slug, { slug, make: r.make, model: r.model, issues: [] });
    byModel.get(slug).issues.push({
      id: r.id,
      title: r.title,
      description: r.description,
      solution: r.solution,
      symptoms: Array.isArray(r.symptoms) ? r.symptoms : [],
      severity: r.severity,
      category: r.category,
      costLow: r.estimatedCostLow,
      costHigh: r.estimatedCostHigh,
      dtcCodes: Array.isArray(r.dtcCodes) ? r.dtcCodes : [],
      reportCount: r.reportCount || 0,
    });
  }

  const models = [...byModel.values()].sort((a, b) => b.issues.length - a.issues.length);
  const missing = [...wanted].filter((w) => !models.some((m) => m.slug === w));

  const outPath = path.join(__dirname, '..', 'data', outFile);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(models, null, 2));

  const totalIssues = models.reduce((s, m) => s + m.issues.length, 0);
  console.log(`Exported: ${models.length} models (${totalIssues} issues)`);
  models.forEach((m) => console.log(`  ${m.slug} (${m.issues.length})`));
  if (missing.length) console.log(`MISSING (no published rows): ${missing.join(', ')}`);
  console.log(`Wrote -> ${outPath}`);

  await pool.end();
}

main().catch((err) => { console.error('FAIL:', err.message); pool.end(); process.exit(1); });
