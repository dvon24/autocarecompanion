require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
pool.on('error', () => {});
(async () => {
  const pend = (await pool.query("SELECT COUNT(*)::int n FROM \"KnownIssue\" WHERE status='pending_review'")).rows[0].n;
  console.log('pending_review total:', pend);
  // target models from both waves
  const targets = [
    ['Porsche','Taycan'],['Mercedes-Benz','GLC'],['Audi','Q8'],['BMW','M340i'],['Opel','Mokka'],   // deepen
    ['Volkswagen','T-Roc'],['Audi','Q2'],['Mercedes-Benz','V-Class'],['Volkswagen','ID.3'],['BMW','2 Series Active Tourer'], // net-new
  ];
  console.log('\nmodel | published | pending_review');
  for (const [mk,md] of targets) {
    const pub = (await pool.query("SELECT COUNT(*)::int n FROM \"KnownIssue\" WHERE make=$1 AND model=$2 AND status='published'",[mk,md])).rows[0].n;
    const pr = (await pool.query("SELECT COUNT(*)::int n FROM \"KnownIssue\" WHERE make=$1 AND model=$2 AND status='pending_review'",[mk,md])).rows[0].n;
    console.log(`  ${mk} ${md}: pub=${pub} pending=${pr}`);
  }
  await pool.end();
})().catch(e=>{console.error('FAIL:',e.message);pool.end();});
