require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
pool.on('error', () => {});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
(async () => {
  const codes = await prisma.dTCCode.count();
  const thinDesc = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int n FROM "DTCCode" WHERE length(description) < 120 OR array_length("commonCauses",1) IS NULL OR array_length("commonCauses",1) < 3`);
  // known issues carrying DTC codes
  const issuesWithDtc = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int n FROM "KnownIssue" WHERE status='published' AND array_length("dtcCodes",1) > 0`);
  const totalIssues = await prisma.knownIssue.count({ where: { status:'published' } });
  // distinct codes referenced by issues (the /dtc/[code] pages that actually have vehicle content)
  const codesWithIssues = await prisma.$queryRawUnsafe(`SELECT COUNT(DISTINCT c)::int n FROM (SELECT unnest("dtcCodes") c FROM "KnownIssue" WHERE status='published') t`);
  // top codes by how many issues reference them
  const topCodes = await prisma.$queryRawUnsafe(`SELECT c, COUNT(*)::int n FROM (SELECT unnest("dtcCodes") c FROM "KnownIssue" WHERE status='published') t GROUP BY c ORDER BY COUNT(*) DESC LIMIT 15`);
  console.log('DTCCode reference rows:', codes, '| thin (short desc or <3 causes):', thinDesc[0].n);
  console.log('Published issues carrying >=1 DTC:', issuesWithDtc[0].n, '/', totalIssues, `(${(100*issuesWithDtc[0].n/totalIssues).toFixed(0)}%)`);
  console.log('Distinct codes referenced by issues (pages w/ vehicle content):', codesWithIssues[0].n);
  console.log('\nTop referenced codes:');
  topCodes.forEach(r => console.log(`  ${r.c}  ${r.n} issues`));
  await prisma.$disconnect(); await pool.end();
})();
