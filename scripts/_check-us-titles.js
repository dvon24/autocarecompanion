require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
pool.on('error', () => {});
const T = [['Pontiac','Firebird'],['Pontiac','GTO'],['Pontiac','Bonneville'],['Pontiac','Grand Am'],['Pontiac','Aztek'],['Pontiac','Vibe'],['Buick','LeSabre'],['Lincoln','Town Car'],['Mercury','Cougar'],['Cadillac','Eldorado'],['Chevrolet','Blazer'],['Dodge','Intrepid']];
(async () => {
  for (const [make, model] of T) {
    const rows = (await pool.query(`SELECT title FROM "KnownIssue" WHERE make=$1 AND model=$2 AND status='published'`, [make, model])).rows;
    console.log(`${make} ${model} ::: ${rows.map(r=>r.title).join(' | ')}`);
  }
  await pool.end();
})().catch((e) => { console.error(e.message); process.exit(1); });
