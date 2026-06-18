require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
pool.on('error', () => {});
const TARGETS = [
  ['Mercedes-Benz','Sprinter'],['Mercedes-Benz','EQS'],['Mercedes-Benz','SLC'],
  ['Volkswagen','Eos'],['Volkswagen','New Beetle'],['Volkswagen','Phaeton'],
  ['Audi','S7'],['Audi','100'],['Audi','90'],
  ['BMW','M6'],['BMW','Z3'],['Opel','Zafira'],
];
(async () => {
  const out = [];
  for (const [make, model] of TARGETS) {
    const r = await pool.query("SELECT title, years FROM \"KnownIssue\" WHERE make=$1 AND model=$2 AND status='published' ORDER BY title",[make,model]);
    const yrs = new Set(); r.rows.forEach(x=>(Array.isArray(x.years)?x.years:[]).forEach(y=>yrs.add(y)));
    out.push({ make, model, existingTitles: r.rows.map(x=>x.title), yearsCovered: [...yrs].sort() });
  }
  fs.writeFileSync('data/research-de-exclusions-3.json', JSON.stringify(out, null, 2));
  out.forEach(t=>console.log(`${t.make} ${t.model}: ${t.existingTitles.length} existing`));
  console.log('Wrote data/research-de-exclusions-3.json');
  await pool.end();
})().catch(e=>{console.error('FAIL:',e.message);pool.end();});
