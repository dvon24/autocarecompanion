require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

(async () => {
  // Load YMMT for years 1990-1999 Audi
  const ymmt = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'public', 'data', 'ymmt.json'), 'utf8'));
  const audiYmmt = {}; // year -> { model -> trims }
  for (let y = 1990; y <= 1999; y++) {
    if (ymmt[y] && ymmt[y].Audi) audiYmmt[y] = ymmt[y].Audi;
  }

  // Existing Audi issues touching any 1990s year
  const issues = await prisma.knownIssue.findMany({
    where: { make: { equals: 'Audi', mode: 'insensitive' }, status: 'published' },
    select: { id: true, model: true, years: true, title: true, severity: true },
  });
  const audi90sIssues = issues.filter(i => (i.years || []).some(y => y >= 1990 && y < 2000));

  // Unique models per year with coverage
  const coveredByYear = {}; // year -> Set(model)
  const issuesByModel = {}; // model -> [{id, years}, ...]
  for (const i of audi90sIssues) {
    for (const y of i.years) {
      if (y >= 1990 && y < 2000) {
        if (!coveredByYear[y]) coveredByYear[y] = new Set();
        coveredByYear[y].add(i.model);
      }
    }
    if (!issuesByModel[i.model]) issuesByModel[i.model] = [];
    issuesByModel[i.model].push({ id: i.id, years: i.years, title: i.title, severity: i.severity });
  }

  console.log('=== AUDI 1990s — YMMT vs ISSUE COVERAGE ===\n');
  console.log('Year | YMMT models                    | Issues covering | Gap');
  console.log('-'.repeat(95));
  let totalYmmtRows = 0;
  let totalCoveredRows = 0;
  const allMissing = new Map(); // "model" -> Set(years)
  for (let y = 1990; y <= 1999; y++) {
    const ymmtModels = Object.keys(audiYmmt[y] || {}).sort();
    const covered = coveredByYear[y] || new Set();
    const missing = ymmtModels.filter(m => !covered.has(m));
    totalYmmtRows += ymmtModels.length;
    totalCoveredRows += covered.size;
    for (const m of missing) {
      if (!allMissing.has(m)) allMissing.set(m, new Set());
      allMissing.get(m).add(y);
    }
    console.log(`${y} | ${(ymmtModels.join(', ') || '(none)').padEnd(30)} | ${String(covered.size).padStart(3)}/${String(ymmtModels.length).padStart(3)} | ${missing.length ? missing.join(', ') : 'fully covered'}`);
  }

  console.log(`\n=== TOTALS ===`);
  console.log(`YMMT model-year combos (1990-1999): ${totalYmmtRows}`);
  console.log(`Covered by at least 1 issue:        ${totalCoveredRows} (${Math.round(100 * totalCoveredRows / totalYmmtRows)}%)`);
  console.log(`Total Audi issues touching 90s:     ${audi90sIssues.length}`);

  console.log(`\n=== MISSING MODELS (need new issues) ===`);
  const sortedMissing = [...allMissing.entries()].sort((a, b) => b[1].size - a[1].size);
  for (const [model, years] of sortedMissing) {
    const yearList = [...years].sort();
    console.log(`  ${model.padEnd(20)} ${yearList.length} year${yearList.length === 1 ? '' : 's'}: ${yearList.join(', ')}`);
  }

  console.log(`\n=== MODELS WITH SOME 90s COVERAGE (may need beefing up) ===`);
  for (const [model, issuesList] of Object.entries(issuesByModel).sort((a, b) => a[0].localeCompare(b[0]))) {
    const ninetiesIssues = issuesList.filter(i => i.years.some(y => y >= 1990 && y < 2000));
    console.log(`  ${model.padEnd(20)} ${ninetiesIssues.length} issue${ninetiesIssues.length === 1 ? '' : 's'} touching 90s`);
    for (const ii of ninetiesIssues.slice(0, 3)) {
      const ninetiesYears = ii.years.filter(y => y >= 1990 && y < 2000);
      console.log(`     [${ii.severity}] ${ii.title.slice(0, 70)} (${ninetiesYears.join(',')})`);
    }
  }

  await prisma.$disconnect();
  await pool.end();
})().catch(e => { console.error('FAIL:', e); process.exit(1); });
