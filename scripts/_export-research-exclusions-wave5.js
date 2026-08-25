/**
 * Export existing published + pending_review titles for the wave-5 targets.
 * Wave 5 is TRAFFIC-LED: every model here earns real GSC clicks/impressions but has thin
 * coverage. Prior waves were chosen by make-level thinness or by email leads; this one is
 * chosen by what people actually search for. Read-only — no DB writes.
 */
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
pool.on('error', () => {});
const TARGETS = [
  ['Hyundai','Accent'],['BMW','i5'],['BMW','i4'],['BMW','iX3'],
  ['Toyota','bZ4X'],['Volkswagen','Taos'],['Renault','Twizy'],['Mitsubishi','Outlander'],
  ['Audi','Q7'],['Chrysler','Pacifica'],['Cadillac','CT4'],['Mercedes-Benz','Sprinter'],
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
  fs.writeFileSync('data/research-wave5-exclusions.json', JSON.stringify(out, null, 2));
  out.forEach(t => console.log(`${(t.make+' '+t.model).padEnd(26)} ${String(t.existingTitles.length).padStart(2)} existing | years ${t.yearsCovered[0]||'?'}-${t.yearsCovered[t.yearsCovered.length-1]||'?'}`));
  await pool.end();
})().catch(e => { console.error('FAIL:', e.message); pool.end(); });
