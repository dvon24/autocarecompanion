// Wave-19 correction (found by scripts/_audit-wave-recalls.js, 2026-09-03):
// Infiniti FX35 Takata issue cited 13V136 and 14V361, which do not exist at NHTSA.
// api.nhtsa.gov recallsByVehicle lists the real 2015 Takata campaigns for the FX35 as
// 15V226 and 15V287 (both AIR BAGS component). Replace in the prose + citation title.
require('dotenv').config({ path: '.env.local', quiet: true });
const fs = require('fs');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
const WRONG_DESC = '13V136 and 14V361 (initial/regional)';
const RIGHT_DESC = '15V226 and 15V287 (2015 regional expansions)';
const WRONG_TITLE = '(13V136, 14V361, 16V349, 20V008)';
const RIGHT_TITLE = '(15V226, 15V287, 16V349, 20V008)';
(async () => {
  const r = await pool.query(`SELECT id, description, citations FROM "KnownIssue" WHERE make='Infiniti' AND model='FX35' AND title ILIKE '%takata%'`);
  for (const row of r.rows) {
    if (!row.description.includes(WRONG_DESC)) { console.log('! sentence not found on', row.id); continue; }
    const desc = row.description.replace(WRONG_DESC, RIGHT_DESC);
    const cites = row.citations.map((c) => ({ ...c, title: String(c.title).replace(WRONG_TITLE, RIGHT_TITLE) }));
    await pool.query(`UPDATE "KnownIssue" SET description=$1, citations=$2::jsonb, "updatedAt"=now() WHERE id=$3`, [desc, JSON.stringify(cites), row.id]);
    console.log('fixed DB row', row.id);
  }
  const f = 'data/research-wave19-2026-09-03.json';
  const j = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const c of j.result.confirmed) {
    if (c.make === 'Infiniti' && /takata/i.test(c.title)) {
      c.description = c.description.replace(WRONG_DESC, RIGHT_DESC);
      c.recallCampaigns = c.recallCampaigns.map((x) => ({ '13V136000': '15V226000', '14V361000': '15V287000' })[x] || x);
      for (const ci of c.citations) ci.title = ci.title.replace(WRONG_TITLE, RIGHT_TITLE);
      console.log('fixed wave file');
    }
  }
  fs.writeFileSync(f, JSON.stringify(j, null, 2));
  await pool.end();
})();
