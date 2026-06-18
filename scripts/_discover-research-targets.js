require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
pool.on('error', () => {});
(async () => {
  const GERMAN = ['Volkswagen','Audi','BMW','Mercedes-Benz','Porsche','Opel','MINI','Smart'];
  const rows = (await pool.query(
    "SELECT make, model, COUNT(*)::int AS n FROM \"KnownIssue\" WHERE status='published' AND make = ANY($1) GROUP BY make, model HAVING COUNT(*) < 6 ORDER BY make, n DESC",
    [GERMAN])).rows;
  console.log('=== THIN German models (<6 published issues):', rows.length, '===');
  const byMake = {};
  for (const r of rows) { (byMake[r.make] ||= []).push(`${r.model}(${r.n})`); }
  for (const mk of Object.keys(byMake)) console.log(`${mk}: ${byMake[mk].join(', ')}`);

  // Are mainstream German nameplates present at all? (any status)
  const checks = ['A-Class','B-Class','GLA','GLB','GLC','CLA','EQC','EQE','EQS','V-Class',
    'T-Roc','T-Cross','Touran','Sharan','Touareg','Arteon','ID.3','ID.4','ID.5','Scirocco','Up','Caddy',
    'Q2','A1','SQ2','RS Q3','Cayman','Macan','Taycan','718',
    '2 Series Active Tourer','3 Series Touring','5 Series Touring','X4','M2','M8 Gran Coupe',
    'Grandland','Mokka','Crossland','Zafira','Combo','Adam','Meriva'];
  const present = new Set((await pool.query('SELECT DISTINCT model FROM "KnownIssue"')).rows.map(r=>r.model));
  const missing = checks.filter(c => !present.has(c));
  console.log('\n=== Mainstream German nameplates with ZERO rows in DB (net-new candidates) ===');
  console.log(missing.join(', ') || '(none — all present)');
  await pool.end();
})().catch(e=>{console.error('FAIL:',e.message);pool.end();});
