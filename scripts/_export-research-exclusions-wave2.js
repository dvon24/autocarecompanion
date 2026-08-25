/**
 * Export existing published + pending_review titles for the wave-2 deepen targets
 * (Volvo / MINI / Buick / Cadillac / Mitsubishi). Read-only — no DB writes.
 */
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
pool.on('error', () => {});
const TARGETS = [
  ['Volvo','XC40'],['Volvo','XC60'],['Volvo','S60'],
  ['MINI','Countryman'],['MINI','Hardtop 4 Door'],['MINI','Clubman'],
  ['Buick','Envision'],['Buick','Encore GX'],
  ['Cadillac','Escalade'],['Cadillac','XT5'],['Cadillac','XT4'],
  ['Mitsubishi','Mirage'],['Mitsubishi','Eclipse Cross'],
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
  fs.writeFileSync('data/research-wave2-exclusions.json', JSON.stringify(out, null, 2));
  out.forEach(t => console.log(`${t.make} ${t.model}: ${t.existingTitles.length} existing | years ${t.yearsCovered[0]||'?'}-${t.yearsCovered[t.yearsCovered.length-1]||'?'}`));
  await pool.end();
})().catch(e => { console.error('FAIL:', e.message); pool.end(); });
