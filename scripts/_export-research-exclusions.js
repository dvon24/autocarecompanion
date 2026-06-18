require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
pool.on('error', () => {});
const TARGETS = [
  ['Mercedes-Benz','A-Class'],['Mercedes-Benz','GLC'],['Mercedes-Benz','GLA'],['Mercedes-Benz','CLA'],
  ['Porsche','Macan'],['Porsche','Taycan'],['Porsche','Cayman'],
  ['Volkswagen','Touareg'],['Volkswagen','Arteon'],
  ['Audi','Q8'],['Audi','Q5 Sportback'],
  ['BMW','iX3'],['BMW','M340i'],
  ['Opel','Mokka'],['Opel','Grandland'],
];
(async () => {
  const out = [];
  for (const [make, model] of TARGETS) {
    const r = await pool.query(
      "SELECT title, years FROM \"KnownIssue\" WHERE make=$1 AND model=$2 AND status='published' ORDER BY title",
      [make, model]);
    const yrs = new Set();
    r.rows.forEach(x => (Array.isArray(x.years)?x.years:[]).forEach(y=>yrs.add(y)));
    out.push({ make, model, existingTitles: r.rows.map(x=>x.title), yearsCovered: [...yrs].sort() });
  }
  fs.writeFileSync('data/research-de-exclusions.json', JSON.stringify(out, null, 2));
  out.forEach(t => console.log(`${t.make} ${t.model}: ${t.existingTitles.length} existing | years ${t.yearsCovered[0]||'?'}-${t.yearsCovered[t.yearsCovered.length-1]||'?'}`));
  console.log('\nWrote data/research-de-exclusions.json');
  await pool.end();
})().catch(e=>{console.error('FAIL:',e.message);pool.end();});
