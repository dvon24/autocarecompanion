require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
pool.on('error', () => {});
const TARGETS = [
  ['GMC','Sierra 1500'],['Chevrolet','Tahoe'],['Chevrolet','Suburban'],['Jeep','Wrangler'],['Toyota','Highlander'],
  ['Honda','Pilot'],['Ford','Bronco'],['Ford','Maverick'],['Kia','Telluride'],['Hyundai','Tucson'],
  ['Hyundai','Santa Fe'],['Nissan','Rogue'],['Mazda','CX-5'],['Subaru','Forester'],['Toyota','4Runner'],
];
(async () => {
  const out = [];
  for (const [make, model] of TARGETS) {
    const r = await pool.query("SELECT title, years FROM \"KnownIssue\" WHERE make=$1 AND model=$2 AND status='published' ORDER BY title",[make,model]);
    const yrs=new Set(); r.rows.forEach(x=>(Array.isArray(x.years)?x.years:[]).forEach(y=>yrs.add(y)));
    out.push({ make, model, existingTitles: r.rows.map(x=>x.title), yearsCovered: [...yrs].sort() });
  }
  fs.writeFileSync('data/research-us-exclusions-2.json', JSON.stringify(out, null, 2));
  out.forEach(t=>console.log(`${t.make} ${t.model}: ${t.existingTitles.length} | ${t.yearsCovered[0]||'?'}-${t.yearsCovered[t.yearsCovered.length-1]||'?'}`));
  await pool.end();
})().catch(e=>{console.error('FAIL:',e.message);pool.end();});
