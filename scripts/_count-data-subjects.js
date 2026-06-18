require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
pool.on('error', () => {});
(async () => {
  // Which tables hold a person's email / PII?
  const cols = await pool.query(`SELECT table_name, column_name FROM information_schema.columns
     WHERE table_schema='public' AND (column_name ILIKE '%email%' OR column_name ILIKE '%country%' OR column_name ILIKE '%region%' OR column_name ILIKE '%phone%') ORDER BY table_name`);
  console.log('PII-ish columns:'); cols.rows.forEach(r=>console.log('  '+r.table_name+'.'+r.column_name));
  const safe = async (label, q) => { try { const r = await pool.query(q); console.log(label+':', r.rows[0].n); } catch(e){ console.log(label+': (n/a — '+e.message.split('\n')[0]+')'); } };
  console.log('\nIndividual counts:');
  await safe('Registered users (User)', 'SELECT COUNT(*)::int n FROM "User"');
  await safe('  - distinct user emails', 'SELECT COUNT(DISTINCT lower(email))::int n FROM "User" WHERE email IS NOT NULL');
  await safe('Interest/lead emails (InterestEmail)', 'SELECT COUNT(DISTINCT lower(email))::int n FROM "InterestEmail"');
  await safe('Feedback with email', 'SELECT COUNT(*)::int n FROM "Feedback" WHERE email IS NOT NULL');
  await safe('Users created last 90 days', 'SELECT COUNT(*)::int n FROM "User" WHERE "createdAt" > now() - interval \'90 days\'');
  await pool.end();
})().catch(e=>{console.error('FAIL:',e.message);pool.end();});
