require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const p = new PrismaClient({ adapter });

async function main() {
  const total = await p.knownIssue.count({ where: { status: 'published' } });
  const allIssues = await p.knownIssue.findMany({ select: { communityRecommendations: true } });

  let withParts = 0, withAffLinks = 0, totalPartRecs = 0, totalAffLinks = 0;

  for (const issue of allIssues) {
    const recs = issue.communityRecommendations || [];
    const parts = recs.filter(r => r.type === 'part');
    const aff = recs.filter(r => r.type === 'part' && (r.affiliateUrl || r.affiliateLink || r.amazonLink));
    if (parts.length > 0) withParts++;
    if (aff.length > 0) withAffLinks++;
    totalPartRecs += parts.length;
    totalAffLinks += aff.length;
  }

  console.log('Total published issues:', total);
  console.log('Issues with part recs:', withParts, '(' + (withParts / total * 100).toFixed(1) + '%)');
  console.log('Issues with affiliate links:', withAffLinks, '(' + (withAffLinks / total * 100).toFixed(1) + '%)');
  console.log('Total part recommendations:', totalPartRecs);
  console.log('Total affiliate links:', totalAffLinks);

  await p.$disconnect();
  pool.end();
}

main();
