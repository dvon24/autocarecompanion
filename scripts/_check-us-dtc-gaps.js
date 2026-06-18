require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
pool.on('error', () => {});
(async () => {
  // 1. DTC codes referenced by published issues with NO DTCCode reference row
  const missing = (await pool.query(`
    SELECT code, count(*) AS refs FROM (
      SELECT unnest("dtcCodes") AS code FROM "KnownIssue" WHERE status='published'
    ) x
    WHERE NOT EXISTS (SELECT 1 FROM "DTCCode" d WHERE upper(d.code) = upper(x.code))
    GROUP BY code ORDER BY refs DESC
  `)).rows;
  console.log(`DTC codes referenced but missing reference data: ${missing.length}`);
  console.log(missing.map(r => `${r.code}(${r.refs})`).join(' '));

  // 2. US-make models with 1-3 published issues (thin pages)
  const thin = (await pool.query(`
    SELECT make, model, count(*)::int AS n FROM "KnownIssue"
    WHERE status='published'
      AND make IN ('Ford','Chevrolet','Dodge','Chrysler','Jeep','GMC','RAM','Buick','Cadillac','Lincoln','Mercury','Pontiac','Saturn')
    GROUP BY make, model HAVING count(*) <= 3 ORDER BY make, model
  `)).rows;
  console.log(`\nThin US model pages (<=3 issues): ${thin.length}`);
  console.log(thin.map(r => `${r.make} ${r.model}(${r.n})`).join(', '));
  await pool.end();
})().catch((e) => { console.error(e.message); process.exit(1); });
