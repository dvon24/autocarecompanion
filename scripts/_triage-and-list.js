require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
pool.on('error', () => {});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
(async () => {
  // 1) UPDATE Volvo V60 D4 → euro-market
  const v60 = await prisma.knownIssue.findFirst({ where: { make:'Volvo', model:'V60', title:{contains:'D4 Diesel Turbocharger'}, status:'published' } });
  if (v60) {
    const newDesc = 'Market note: the D4 diesel was sold in Europe and other non-US markets (the US-market V60 was gasoline/PHEV only), so this applies to European/RHD-market cars. ' + v60.description;
    await prisma.knownIssue.update({ where:{id:v60.id}, data:{ title:'D4 Diesel Turbocharger Wear (European-market diesel) — Power Loss, Black Smoke and Whistling', description:newDesc } });
    console.log('UPDATED V60 D4 → euro-market:', v60.id);
  } else console.log('V60 D4 not found');

  // 2) ARCHIVE the 2
  const a1 = await prisma.knownIssue.updateMany({ where:{make:'Mazda',model:'CX-70',title:{contains:'Windshield'},status:'published'}, data:{status:'archived'} });
  const a2 = await prisma.knownIssue.updateMany({ where:{make:'Mercedes-Benz',model:'GLE',title:{contains:'722.9'},status:'published'}, data:{status:'archived'} });
  console.log('ARCHIVED CX-70 windshield:', a1.count, '| GLE 722.9:', a2.count);

  // 3) LIST forum/article-only issues (no recall/tsb/nhtsa/manufacturer cite)
  const since = new Date(Date.now() - 8*3600000);
  const rows = await prisma.knownIssue.findMany({
    where: { status:'published', source:'ai-researched', createdAt:{gt:since} },
    select: { make:true, model:true, title:true, citations:true }, orderBy:[{make:'asc'},{model:'asc'}],
  });
  const forumOnly = rows.filter(r => { const t=(Array.isArray(r.citations)?r.citations:[]).map(c=>c.type); return !t.some(x=>['recall','tsb','nhtsa','manufacturer'].includes(x)); });
  console.log(`\n=== ${forumOnly.length} FORUM/ARTICLE-ONLY issues (for review) ===\n`);
  let lastMake='';
  forumOnly.forEach(r => {
    if (r.make!==lastMake){ console.log(`\n${r.make}:`); lastMake=r.make; }
    const t=(Array.isArray(r.citations)?r.citations:[]).map(c=>c.type);
    console.log(`  ${r.model.padEnd(16)} ${r.title.slice(0,74)}  [${t.join(',')}]`);
  });
  await prisma.$disconnect(); await pool.end();
})();
