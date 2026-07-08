require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
pool.on('error', () => {});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
(async () => {
  const since = new Date(Date.now() - 6*3600000);
  const rows = await prisma.knownIssue.findMany({
    where: { status: 'published', source: 'ai-researched', createdAt: { gt: since } },
    select: { make: true, model: true, title: true, confidence: true, citations: true, severity: true },
    orderBy: { createdAt: 'desc' },
  });
  console.log('Published tonight (ai-researched, last 6h):', rows.length, '\n');
  // confidence distribution
  const conf = {};
  let recallCited=0, tsbCited=0, nhtsaCited=0, noStrong=0, avgCites=0;
  const weak=[];
  for (const r of rows) {
    conf[r.confidence] = (conf[r.confidence]||0)+1;
    const cits = Array.isArray(r.citations)?r.citations:[];
    avgCites += cits.length;
    const types = cits.map(c=>c.type);
    if (types.includes('recall')) recallCited++;
    if (types.includes('tsb')) tsbCited++;
    if (types.includes('nhtsa')) nhtsaCited++;
    const hasStrong = types.some(t=>['recall','tsb','nhtsa','manufacturer'].includes(t));
    if (!hasStrong) { noStrong++; if (weak.length<12) weak.push(`${r.make} ${r.model}: ${r.title.slice(0,70)} [${types.join(',')||'no cites'}]`); }
  }
  console.log('Confidence:', JSON.stringify(conf));
  console.log(`Cite an official source — recall: ${recallCited}, TSB: ${tsbCited}, NHTSA: ${nhtsaCited}`);
  console.log(`Avg citations/issue: ${(avgCites/rows.length).toFixed(1)}`);
  console.log(`\nIssues WITHOUT a recall/TSB/NHTSA/manufacturer cite (forum/article only): ${noStrong}`);
  weak.forEach(w=>console.log('  - '+w));
  await prisma.$disconnect(); await pool.end();
})();
