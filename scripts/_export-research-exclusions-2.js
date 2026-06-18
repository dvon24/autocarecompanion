require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
pool.on('error', () => {});
const TARGETS = [
  ['Mercedes-Benz','GLB'],['Mercedes-Benz','GLE'],['Mercedes-Benz','GLS'],['Mercedes-Benz','B-Class'],
  ['Mercedes-Benz','M-Class'],['Mercedes-Benz','G-Class'],
  ['Volkswagen','ID.4'],['Volkswagen','Golf R'],['Volkswagen','CC'],['Volkswagen','Taos'],
  ['Porsche','718 Boxster'],['Porsche','718 Cayman'],
  ['Audi','Q8 e-tron'],['BMW','i5'],['BMW','X3 M'],
];
(async () => {
  const out = [];
  for (const [make, model] of TARGETS) {
    const r = await pool.query("SELECT title, years FROM \"KnownIssue\" WHERE make=$1 AND model=$2 AND status='published' ORDER BY title",[make,model]);
    const yrs = new Set(); r.rows.forEach(x=>(Array.isArray(x.years)?x.years:[]).forEach(y=>yrs.add(y)));
    out.push({ make, model, existingTitles: r.rows.map(x=>x.title), yearsCovered: [...yrs].sort() });
  }
  fs.writeFileSync('data/research-de-exclusions-2.json', JSON.stringify(out, null, 2));
  out.forEach(t=>console.log(`${t.make} ${t.model}: ${t.existingTitles.length} existing | ${t.yearsCovered[0]||'?'}-${t.yearsCovered[t.yearsCovered.length-1]||'?'}`));
  console.log('Wrote data/research-de-exclusions-2.json');
  await pool.end();
})().catch(e=>{console.error('FAIL:',e.message);pool.end();});
