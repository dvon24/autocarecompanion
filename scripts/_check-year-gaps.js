require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
pool.on('error', () => {});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

(async () => {
  const ymmt = JSON.parse(fs.readFileSync('public/data/ymmt.json', 'utf8'));
  const ymmtRanges = {};
  for (const [year, makes] of Object.entries(ymmt)) {
    const y = parseInt(year);
    if (y < 2000 || y > 2025) continue;
    for (const [make, models] of Object.entries(makes)) {
      for (const model of Object.keys(models)) {
        const key = `${make}|${model}`;
        if (!ymmtRanges[key]) ymmtRanges[key] = { min: y, max: y, make, model, years: [] };
        ymmtRanges[key].min = Math.min(ymmtRanges[key].min, y);
        ymmtRanges[key].max = Math.max(ymmtRanges[key].max, y);
        ymmtRanges[key].years.push(y);
      }
    }
  }

  const issues = await prisma.knownIssue.findMany({
    where: { status: 'published' },
    select: { make: true, model: true, years: true }
  });
  const dbCov = {};
  for (const i of issues) {
    const key = `${i.make}|${i.model}`;
    if (!dbCov[key]) dbCov[key] = new Set();
    for (const y of i.years) if (y >= 2000 && y <= 2025) dbCov[key].add(y);
  }

  let bigGaps = 0;
  const gapList = [];
  for (const [key, ymm] of Object.entries(ymmtRanges)) {
    if (ymm.years.length < 3) continue;
    const db = dbCov[key] || new Set();
    const uncov = ymm.years.filter(y => !db.has(y));
    if (uncov.length > 5) {
      bigGaps++;
      gapList.push({ make: ymm.make, model: ymm.model, uncov: uncov.length, ymmtRange: `${ymm.min}-${ymm.max}`, dbRange: db.size > 0 ? `${Math.min(...db)}-${Math.max(...db)}` : 'none' });
    }
  }
  gapList.sort((a, b) => b.uncov - a.uncov);
  for (const g of gapList.slice(0, 30)) {
    console.log(`${g.make} ${g.model}: ${g.uncov} uncovered years (YMMT ${g.ymmtRange}, DB ${g.dbRange})`);
  }
  console.log(`\nModels with >5 uncovered years: ${bigGaps}`);

  await prisma.$disconnect();
  await pool.end();
})();
