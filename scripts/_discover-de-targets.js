require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
pool.on('error', () => {});
const slugify = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
(async () => {
  const de = JSON.parse(fs.readFileSync('src/data/i18n/de.json','utf8'));
  const translated = new Set(Object.values(de.models||{}).map(x=>x.slug));
  const GERMAN = ['Volkswagen','Audi','BMW','Mercedes-Benz','Porsche','Opel','MINI','Smart'];
  const rows = (await pool.query(
    'SELECT make, model, COUNT(*)::int AS n FROM "KnownIssue" WHERE status=$2 AND make = ANY($1) GROUP BY make, model ORDER BY n DESC',
    [GERMAN, 'published'])).rows;
  const targets = rows.map(r=>({name: r.make+' '+r.model, slug: slugify(r.make+' '+r.model), n: r.n}))
                      .filter(r=>r.n>=6 && !translated.has(r.slug));
  console.log('UNTRANSLATED German >=6 issues:', targets.length, 'models,', targets.reduce((s,r)=>s+r.n,0), 'issues');
  const top = targets.slice(0,28);
  console.log('TOP 28 (this wave):', top.reduce((s,r)=>s+r.n,0), 'issues');
  console.log(top.map(r=>'"'+r.name+'"').join(' '));
  await pool.end();
})().catch(e=>{console.error('FAIL:',e.message);pool.end();});
