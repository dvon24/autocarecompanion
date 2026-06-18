require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
pool.on('error', () => {});
(async () => {
  // All DTC codes cited by published issues
  const cited = (await pool.query(
    "SELECT DISTINCT upper(trim(code)) AS code FROM (SELECT unnest(\"dtcCodes\") AS code FROM \"KnownIssue\" WHERE status='published') t WHERE code IS NOT NULL AND code <> ''"
  )).rows.map(r=>r.code);
  const have = new Set((await pool.query('SELECT upper(code) AS code FROM "DTCCode"')).rows.map(r=>r.code));
  const missing = cited.filter(c=>!have.has(c));
  console.log('Cited codes:', cited.length, '| have reference pages:', cited.length-missing.length, '| MISSING:', missing.length);
  // classify missing: generic OBD-II P0/P2/P3, manufacturer P1, U/B/C, 5-digit
  const cls = {generic:[], mfrP1:[], chassisBodyNet:[], manufNum:[], other:[]};
  for(const c of missing){
    if(/^P0[0-9A-F]{3}$/.test(c)||/^P2[0-9A-F]{3}$/.test(c)||/^P3[0-9A-F]{3}$/.test(c)) cls.generic.push(c);
    else if(/^P1[0-9A-F]{3}$/.test(c)) cls.mfrP1.push(c);
    else if(/^[UBC][0-9A-F]{4}$/.test(c)) cls.chassisBodyNet.push(c);
    else if(/^[0-9]{4,5}$/.test(c)) cls.manufNum.push(c);
    else cls.other.push(c);
  }
  console.log('  generic P0/P2/P3:', cls.generic.length);
  console.log('  mfr P1xxx:', cls.mfrP1.length);
  console.log('  U/B/C codes:', cls.chassisBodyNet.length);
  console.log('  numeric (VAG/BMW):', cls.manufNum.length);
  console.log('  other/malformed:', cls.other.length, cls.other.slice(0,20).join(','));
  require('fs').writeFileSync('data/_dtc-missing.json', JSON.stringify(cls,null,2));
  console.log('Wrote data/_dtc-missing.json');
  await pool.end();
})().catch(e=>{console.error('FAIL:',e.message);pool.end();});
