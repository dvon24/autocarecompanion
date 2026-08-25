require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
pool.on('error', () => {});
const TARGETS = [
  ['Lexus','ES'],['Lexus','GS'],['Lexus','GX'],['Lexus','LS'],['Lexus','NX'],['Lexus','RC'],['Lexus','UX'],['Lexus','CT'],['Lexus','LC'],
  ['Infiniti','Q50'],['Infiniti','Q60'],['Infiniti','Q70'],['Infiniti','G35'],['Infiniti','G37'],['Infiniti','QX80'],['Infiniti','QX70'],['Infiniti','EX35'],
  ['Acura','TLX'],['Acura','RDX'],['Acura','ILX'],['Acura','TSX'],['Acura','RL'],['Acura','RSX'],
];
(async () => {
  const out = [];
  for (const [make, model] of TARGETS) {
    const r = await pool.query("SELECT title, years, status FROM \"KnownIssue\" WHERE make=$1 AND model=$2 AND status IN ('published','pending_review','archived') ORDER BY title",[make,model]);
    const yrs=new Set(); r.rows.filter(x=>x.status==='published').forEach(x=>(Array.isArray(x.years)?x.years:[]).forEach(y=>yrs.add(y)));
    out.push({ make, model, existingTitles: r.rows.map(x=>x.title), yearsCovered: [...yrs].sort() });
  }
  fs.writeFileSync('data/research-jplux-exclusions.json', JSON.stringify(out, null, 2));
  out.forEach(t=>console.log(`${t.make} ${t.model}: ${t.existingTitles.length} | ${t.yearsCovered[0]||'?'}-${t.yearsCovered[t.yearsCovered.length-1]||'?'}`));
  await pool.end();
})().catch(e=>{console.error('FAIL:',e.message);pool.end();});
