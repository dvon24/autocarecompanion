require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
pool.on('error', () => {});
(async () => {
  const r = await pool.query("SELECT COUNT(*)::int n FROM (SELECT DISTINCT make,model FROM \"KnownIssue\" WHERE status='published') t");
  const i = await pool.query("SELECT COUNT(*)::int n FROM \"KnownIssue\" WHERE status='published'");
  console.log('Distinct published models:', r.rows[0].n, '| total published issues:', i.rows[0].n);
  await pool.end();
})().catch(e=>{console.error(e.message);pool.end();});
