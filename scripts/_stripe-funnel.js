require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
pool.on('error', () => {});
const q = async (label, sql) => { try { const r = await pool.query(sql); console.log(label+':', JSON.stringify(r.rows)); } catch(e){ console.log(label+': (n/a — '+e.message.split('\n')[0]+')'); } };
(async () => {
  await q('Total users', 'SELECT COUNT(*)::int n FROM "User"');
  await q('Users w/ subscriptionTier', 'SELECT "subscriptionTier", COUNT(*)::int n FROM "User" GROUP BY "subscriptionTier"');
  await q('Users w/ subscriptionStatus', 'SELECT "subscriptionStatus", COUNT(*)::int n FROM "User" GROUP BY "subscriptionStatus"');
  await q('Users w/ stripeCustomerId', 'SELECT COUNT(*)::int n FROM "User" WHERE "stripeCustomerId" IS NOT NULL');
  await q('Diagnosis samples (usage)', 'SELECT COUNT(*)::int n FROM "DiagnosisSample"');
  await q('Chat sessions (usage)', 'SELECT COUNT(*)::int n FROM "ChatSession"');
  await q('Signups by week (last 6)', "SELECT date_trunc('week',\"createdAt\")::date wk, COUNT(*)::int n FROM \"User\" GROUP BY wk ORDER BY wk DESC LIMIT 6");
  await pool.end();
})().catch(e=>{console.error('FAIL:',e.message);pool.end();});
