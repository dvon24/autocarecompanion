require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

(async () => {
  const all = await prisma.knownIssue.findMany({
    where: { make: { equals: 'Mazda', mode: 'insensitive' }, model: { equals: 'CX-60', mode: 'insensitive' } },
    select: {
      id: true, title: true, years: true, severity: true, status: true, confidence: true,
      citations: true, dtcCodes: true, typicalMileageLow: true, typicalMileageHigh: true,
      estimatedCostLow: true, estimatedCostHigh: true, communityRecommendations: true,
      updatedAt: true, source: true, humanApproved: true,
    },
  });
  console.log('TOTAL CX-60 issues:', all.length);
  const byStatus = all.reduce((acc, i) => { acc[i.status] = (acc[i.status] || 0) + 1; return acc; }, {});
  console.log('By status:', byStatus);
  console.log('');
  for (const i of all) {
    const cites = Array.isArray(i.citations) ? i.citations.length : 0;
    const recs = Array.isArray(i.communityRecommendations) ? i.communityRecommendations.length : 0;
    console.log(`[${i.status}] sev=${i.severity} conf=${i.confidence} src=${i.source} approved=${i.humanApproved}`);
    console.log(`  TITLE: ${i.title}`);
    console.log(`  years: [${(i.years || []).join(', ')}]`);
    console.log(`  citations:${cites} | dtcs:${(i.dtcCodes || []).length} | recs:${recs} | mileage:${i.typicalMileageLow}-${i.typicalMileageHigh} | cost:$${i.estimatedCostLow}-${i.estimatedCostHigh}`);
    console.log(`  updated: ${i.updatedAt.toISOString().slice(0, 10)}`);
    console.log('');
  }
  await prisma.$disconnect();
  await pool.end();
})().catch(e => { console.error('FAIL:', e); process.exit(1); });
