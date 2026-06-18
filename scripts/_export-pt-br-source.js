#!/usr/bin/env node
/**
 * Export English known-issue content for Brazil-popular models so a workflow
 * can translate it to pt-BR. Phase 1 proof slice: the makes Brazilians search
 * most, capped to the models with the richest pages. ZERO AI calls.
 *
 * Writes data/pt-br-source.json: [{slug, make, model, issues:[...]}]
 */
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
pool.on('error', () => {});

const BR_MAKES = ['Volkswagen', 'Fiat', 'Chevrolet', 'Hyundai', 'Toyota', 'Renault', 'Jeep', 'Nissan', 'Honda', 'Citroen', 'Peugeot'];
const MAX_MODELS = 15;

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

async function main() {
  const rows = (await pool.query(
    `SELECT id, make, model, years, title, description, solution, symptoms, severity, category,
            "estimatedCostLow", "estimatedCostHigh", "dtcCodes", "reportCount"
     FROM "KnownIssue"
     WHERE status='published' AND make = ANY($1)
     ORDER BY make, model`,
    [BR_MAKES],
  )).rows;

  // Group by make+model slug.
  const byModel = new Map();
  for (const r of rows) {
    const slug = slugify(`${r.make} ${r.model}`);
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

  // Keep substantial pages (>=4 issues), richest first, capped.
  const models = [...byModel.values()]
    .filter((m) => m.issues.length >= 4)
    .sort((a, b) => b.issues.length - a.issues.length)
    .slice(0, MAX_MODELS);

  const outPath = path.join(__dirname, '..', 'data', 'pt-br-source.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(models, null, 2));

  const totalIssues = models.reduce((s, m) => s + m.issues.length, 0);
  console.log(`Brazil-popular models exported: ${models.length} (${totalIssues} issues)`);
  models.forEach((m) => console.log(`  ${m.slug} (${m.issues.length})`));
  console.log(`Wrote -> ${outPath}`);

  await pool.end();
}

main().catch((err) => { console.error('FAIL:', err.message); pool.end(); process.exit(1); });
