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
  // Read YMMT (what we COULD have issues for)
  const ymmtPath = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
  const ymmt = JSON.parse(fs.readFileSync(ymmtPath, 'utf8'));

  // Per year, count how many year/make/model combos exist in YMMT
  // (skip trims to keep counts about models)
  const ymmtByYear = {}; // year -> Set of "make|model"
  const ymmtByMakeYear = {}; // make -> { year -> count }
  for (const [year, makes] of Object.entries(ymmt)) {
    const y = parseInt(year, 10);
    if (!ymmtByYear[y]) ymmtByYear[y] = new Set();
    for (const [make, models] of Object.entries(makes)) {
      if (!ymmtByMakeYear[make]) ymmtByMakeYear[make] = {};
      ymmtByMakeYear[make][y] = (ymmtByMakeYear[make][y] || 0) + Object.keys(models).length;
      for (const model of Object.keys(models)) {
        ymmtByYear[y].add(`${make}|${model}`);
      }
    }
  }

  // Get all published issues + their year coverage
  const issues = await prisma.knownIssue.findMany({
    where: { status: 'published' },
    select: { id: true, make: true, model: true, years: true },
  });

  // Per year, count how many unique YMMTs HAVE at least one issue
  const issueYMMTByYear = {}; // year -> Set of "make|model"
  const issuesPerYear = {}; // year -> issue count
  for (const i of issues) {
    for (const y of (i.years || [])) {
      if (!issueYMMTByYear[y]) issueYMMTByYear[y] = new Set();
      issueYMMTByYear[y].add(`${i.make}|${i.model}`);
      issuesPerYear[y] = (issuesPerYear[y] || 0) + 1;
    }
  }

  // Year-by-year coverage report
  const years = Object.keys(ymmtByYear).map(Number).sort((a, b) => a - b);
  console.log('Year | YMMT models | Models with issues | % coverage | Total issues');
  console.log('-'.repeat(75));
  let totalUncoveredYMMTs = 0;
  let totalUncoveredPre2000 = 0;
  let totalUncoveredPost2000 = 0;
  const decadeBuckets = { '1990s': { ymmt: 0, covered: 0 }, '2000s': { ymmt: 0, covered: 0 }, '2010s': { ymmt: 0, covered: 0 }, '2020s': { ymmt: 0, covered: 0 } };
  for (const y of years) {
    const ymmtCount = ymmtByYear[y].size;
    const coveredCount = (issueYMMTByYear[y] || new Set()).size;
    const issueCount = issuesPerYear[y] || 0;
    const pct = ymmtCount > 0 ? Math.round(100 * coveredCount / ymmtCount) : 0;
    const decade = y < 2000 ? '1990s' : y < 2010 ? '2000s' : y < 2020 ? '2010s' : '2020s';
    decadeBuckets[decade].ymmt += ymmtCount;
    decadeBuckets[decade].covered += coveredCount;
    const uncovered = ymmtCount - coveredCount;
    totalUncoveredYMMTs += uncovered;
    if (y < 2000) totalUncoveredPre2000 += uncovered;
    else totalUncoveredPost2000 += uncovered;
    console.log(`${y} | ${String(ymmtCount).padStart(4)} | ${String(coveredCount).padStart(4)} | ${String(pct).padStart(3)}% | ${String(issueCount).padStart(4)}`);
  }

  console.log('\n=== Decade summary ===');
  for (const [decade, b] of Object.entries(decadeBuckets)) {
    const pct = b.ymmt > 0 ? Math.round(100 * b.covered / b.ymmt) : 0;
    console.log(`${decade}: ${b.covered.toLocaleString()} / ${b.ymmt.toLocaleString()} YMMT model-years covered (${pct}%) — ${(b.ymmt - b.covered).toLocaleString()} gap`);
  }

  console.log('\n=== Totals ===');
  const totalYMMT = years.reduce((s, y) => s + ymmtByYear[y].size, 0);
  const totalCovered = years.reduce((s, y) => s + (issueYMMTByYear[y] || new Set()).size, 0);
  console.log(`Total YMMT model-years (1990-${years[years.length - 1]}): ${totalYMMT.toLocaleString()}`);
  console.log(`Total covered with at least one issue: ${totalCovered.toLocaleString()} (${Math.round(100 * totalCovered / totalYMMT)}%)`);
  console.log(`Total uncovered: ${totalUncoveredYMMTs.toLocaleString()}`);
  console.log(`  - Pre-2000: ${totalUncoveredPre2000.toLocaleString()}`);
  console.log(`  - 2000+: ${totalUncoveredPost2000.toLocaleString()}`);

  // Estimate issues to add if we hit ~5 issues per uncovered model-year (the average for covered ones)
  const avgIssuesPerCoveredYMMT = issues.length / totalCovered;
  console.log(`\nAverage issues per covered model-year: ${avgIssuesPerCoveredYMMT.toFixed(1)}`);
  console.log(`If we add to similar density:`);
  console.log(`  - All gaps: +${Math.round(totalUncoveredYMMTs * avgIssuesPerCoveredYMMT).toLocaleString()} issues`);
  console.log(`  - Pre-2000 only: +${Math.round(totalUncoveredPre2000 * avgIssuesPerCoveredYMMT).toLocaleString()} issues`);
  console.log(`  - 2000+ only: +${Math.round(totalUncoveredPost2000 * avgIssuesPerCoveredYMMT).toLocaleString()} issues`);

  // Which makes have the biggest pre-2000 gaps?
  console.log('\n=== Top 10 makes with biggest 1990s YMMT gaps ===');
  const makeGaps = {};
  for (const [make, byYear] of Object.entries(ymmtByMakeYear)) {
    let ymmt = 0, covered = 0;
    for (const [year, count] of Object.entries(byYear)) {
      const y = parseInt(year, 10);
      if (y >= 1990 && y < 2000) {
        ymmt += count;
        const yset = issueYMMTByYear[y] || new Set();
        let c = 0;
        for (const key of yset) if (key.startsWith(make + '|')) c++;
        covered += c;
      }
    }
    if (ymmt > 0) {
      makeGaps[make] = { ymmt, covered, gap: ymmt - covered };
    }
  }
  const sortedMakes = Object.entries(makeGaps).sort((a, b) => b[1].gap - a[1].gap).slice(0, 15);
  for (const [make, g] of sortedMakes) {
    console.log(`  ${make}: ${g.gap} uncovered (${g.covered}/${g.ymmt})`);
  }

  await prisma.$disconnect();
  await pool.end();
})().catch(e => { console.error('FAIL:', e); process.exit(1); });
