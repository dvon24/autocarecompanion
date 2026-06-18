require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
pool.on('error', () => {});
(async () => {
  const rows = (await pool.query(`SELECT model, status, count(*)::int n, min(title) sample FROM "KnownIssue" WHERE make='Chevrolet' AND model ILIKE '%blazer%' GROUP BY model, status ORDER BY model`)).rows;
  for (const r of rows) console.log(`${r.model} [${r.status}]: ${r.n} (e.g. ${r.sample.slice(0,60)})`);
  await pool.end();
})().catch((e) => { console.error(e.message); process.exit(1); });
