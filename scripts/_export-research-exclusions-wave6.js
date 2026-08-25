/**
 * Export existing published + pending_review titles for the wave-6 targets.
 * Wave 6 targets THIN HIGH-VOLUME NAMEPLATES: every model here is a mainstream US nameplate with
 * millions on the road but only 9-11 documented issues - under-served relative to fleet size. Read-only — no DB writes.
 */
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
pool.on('error', () => {});
const TARGETS = [
  ['Hyundai','Palisade'],['Kia','Seltos'],['Mazda','Mazda3'],['Volkswagen','Tiguan'],
  ['Jeep','Compass'],['Jeep','Gladiator'],['Toyota','Prius'],['Ford','Edge'],
  ['Kia','Forte'],['Mazda','CX-50'],['Toyota','Sienna'],['Honda','Ridgeline'],
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
  fs.writeFileSync('data/research-wave6-exclusions.json', JSON.stringify(out, null, 2));
  out.forEach(t => console.log(`${(t.make+' '+t.model).padEnd(26)} ${String(t.existingTitles.length).padStart(2)} existing | years ${t.yearsCovered[0]||'?'}-${t.yearsCovered[t.yearsCovered.length-1]||'?'}`));
  await pool.end();
})().catch(e => { console.error('FAIL:', e.message); pool.end(); });
