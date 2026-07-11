require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
pool.on('error', () => {});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
const APPLY = process.argv.includes('--apply');
const norm = s => String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
function descrip(make, model, component){
  const short = String(component||'part').split('—')[0].split(/[,(]/)[0].split(' ').slice(0,6).join(' ').trim();
  return `${make} ${model} ${short}`.replace(/\s+/g,' ').trim();
}
(async () => {
  const rows = await prisma.$queryRawUnsafe(`SELECT id, make, model, "fixParts" FROM "KnownIssue" WHERE status='published' AND "fixParts" IS NOT NULL AND "fixParts"::text NOT IN ('[]','null')`);
  let issuesTouched=0, linksFixed=0; const samples=[];
  for (const row of rows) {
    const fp = Array.isArray(row.fixParts) ? row.fixParts : [];
    let changed=false;
    for (const p of fp) {
      const pn = norm(p.oemPartNumber);
      for (const b of (Array.isArray(p.buyLinks)?p.buyLinks:[])) {
        const url = String(b.url||'');
        // Amazon (or Summit) search whose k=/searchTerm= is JUST the OEM PN
        const m = url.match(/[?&](?:k|searchTerm)=([^&]+)/i);
        const isRetail = /amazon\.com\/s|summitracing\.com\/search|autozone\.com|napaonline/i.test(url);
        if (isRetail && m) {
          const q = norm(decodeURIComponent(m[1]));
          if (pn && (q === pn || (q.length <= pn.length+4 && q.includes(pn)))) {
            const newQ = encodeURIComponent(descrip(row.make, row.model, p.component));
            b.url = url.replace(/([?&](?:k|searchTerm)=)[^&]+/i, `$1${newQ}`);
            linksFixed++; changed=true;
            if (samples.length<8) samples.push(`${row.make} ${row.model}: ${decodeURIComponent(m[1])} -> ${descrip(row.make,row.model,p.component)}`);
          }
        }
      }
    }
    if (changed) { issuesTouched++; if (APPLY) await prisma.knownIssue.update({ where:{id:row.id}, data:{ fixParts: fp } }); }
  }
  console.log(`${APPLY?'APPLIED':'DRY RUN'} — issues touched: ${issuesTouched}, Amazon/retail links rewritten: ${linksFixed}`);
  samples.forEach(s=>console.log('  '+s));
  await prisma.$disconnect(); await pool.end();
})();
