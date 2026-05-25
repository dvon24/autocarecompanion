/**
 * Audit: YMMT models with ZERO known issues in the database.
 * Groups by make, shows year ranges, skips models with <3 years in YMMT.
 * Read-only — does not modify anything.
 */
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
pool.on('error', () => {});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // 1. Load YMMT data
  const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
  const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf-8'));

  // 2. Build make/model → years map from YMMT
  // Structure: { year: { make: { model: [trims] } } }
  const modelYears = {}; // key: "Make|||Model" → Set of years
  for (const [yearStr, makes] of Object.entries(ymmt)) {
    const year = parseInt(yearStr, 10);
    for (const [make, models] of Object.entries(makes)) {
      for (const model of Object.keys(models)) {
        const key = `${make}|||${model}`;
        if (!modelYears[key]) modelYears[key] = new Set();
        modelYears[key].add(year);
      }
    }
  }

  // 3. Filter to models with 3+ years
  const ymmtModels = {};
  for (const [key, years] of Object.entries(modelYears)) {
    if (years.size < 3) continue;
    const [make, model] = key.split('|||');
    if (!ymmtModels[make]) ymmtModels[make] = {};
    const sortedYears = [...years].sort((a, b) => a - b);
    ymmtModels[make][model] = {
      minYear: sortedYears[0],
      maxYear: sortedYears[sortedYears.length - 1],
      count: sortedYears.length,
    };
  }

  // 4. Get distinct make/model pairs from DB (published issues only)
  const dbPairs = await prisma.knownIssue.findMany({
    where: { status: 'published' },
    select: { make: true, model: true },
    distinct: ['make', 'model'],
  });

  // Build a set of "Make|||Model" for fast lookup
  const dbSet = new Set(dbPairs.map(p => `${p.make}|||${p.model}`));

  // 5. Analyze by make
  const makes = Object.keys(ymmtModels).sort();
  let totalYmmtModels = 0;
  let totalWithIssues = 0;
  let totalWithout = 0;

  for (const make of makes) {
    const models = ymmtModels[make];
    const modelNames = Object.keys(models).sort();
    const withIssues = [];
    const withoutIssues = [];

    for (const model of modelNames) {
      const key = `${make}|||${model}`;
      if (dbSet.has(key)) {
        withIssues.push(model);
      } else {
        withoutIssues.push(model);
      }
    }

    totalYmmtModels += modelNames.length;
    totalWithIssues += withIssues.length;
    totalWithout += withoutIssues.length;

    // Only print makes that have at least one missing model
    console.log(`\n${'='.repeat(60)}`);
    console.log(`${make}`);
    console.log(`  Total YMMT models (3+ years): ${modelNames.length}`);
    console.log(`  With issues: ${withIssues.length}`);
    console.log(`  ZERO issues: ${withoutIssues.length}`);

    if (withoutIssues.length > 0) {
      for (const model of withoutIssues) {
        const info = models[model];
        console.log(`    - ${model} (${info.minYear}–${info.maxYear}, ${info.count} years)`);
      }
    }
  }

  // 6. Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('SUMMARY');
  console.log(`${'='.repeat(60)}`);
  console.log(`Total makes: ${makes.length}`);
  console.log(`Total YMMT models (3+ years): ${totalYmmtModels}`);
  console.log(`Models WITH issues: ${totalWithIssues}`);
  console.log(`Models with ZERO issues: ${totalWithout}`);
  console.log(`Coverage: ${((totalWithIssues / totalYmmtModels) * 100).toFixed(1)}%`);

  // 7. Top uncovered makes (sorted by gap count desc)
  console.log(`\nTop uncovered makes:`);
  const makeGaps = makes.map(make => {
    const models = ymmtModels[make];
    const modelNames = Object.keys(models);
    const missing = modelNames.filter(m => !dbSet.has(`${make}|||${m}`)).length;
    return { make, missing, total: modelNames.length };
  }).filter(m => m.missing > 0).sort((a, b) => b.missing - a.missing);

  for (const { make, missing, total } of makeGaps) {
    console.log(`  ${make}: ${missing}/${total} models missing`);
  }

  await prisma.$disconnect();
  await pool.end();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
