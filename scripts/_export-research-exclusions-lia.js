/**
 * Export existing published titles for the Lexus/Infiniti/Acura deepen wave,
 * so the discover agents can exclude what we already have. Read-only.
 */
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
pool.on('error', () => {});
const TARGETS = [
  ['Lexus','NX'],['Lexus','UX'],['Lexus','GS'],['Lexus','GX'],['Lexus','ES'],
  ['Infiniti','Q50'],['Infiniti','Q60'],['Infiniti','G35'],['Infiniti','G37'],['Infiniti','QX80'],
  ['Acura','ILX'],['Acura','TLX'],['Acura','RDX'],
];
(async () => {
  const out = [];
  for (const [make, model] of TARGETS) {
    const r = await pool.query(
      `SELECT title, years FROM "KnownIssue" WHERE make=$1 AND model=$2 AND status IN ('published','pending_review') ORDER BY title`,
      [make, model]);
    const yrs = new Set();
    r.rows.forEach(x => (Array.isArray(x.years) ? x.years : []).forEach(y => yrs.add(y)));
    out.push({ make, model, existingTitles: r.rows.map(x => x.title), yearsCovered: [...yrs].sort((a,b)=>a-b) });
  }
  fs.writeFileSync('data/research-lia-exclusions.json', JSON.stringify(out, null, 2));
  out.forEach(t => console.log(`${t.make} ${t.model}: ${t.existingTitles.length} existing | years ${t.yearsCovered[0]||'?'}-${t.yearsCovered[t.yearsCovered.length-1]||'?'}`));
  await pool.end();
})().catch(e => { console.error('FAIL:', e.message); pool.end(); });
