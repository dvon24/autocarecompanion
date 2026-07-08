require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
pool.on('error', () => {});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
const CODES = ['P0300','P0171','P0174','P0420','P0430','P0128','P0442','P0455','P0700','P0741','P0016','P0011','P0301','P0302','P0303'];
const VEHICLES = [['Ford','F-150'],['Chevrolet','Silverado 1500'],['RAM','1500'],['Toyota','Camry'],['Toyota','Corolla'],['Toyota','RAV4'],['Honda','CR-V'],['Honda','Civic'],['Honda','Accord'],['Nissan','Rogue'],['Nissan','Altima'],['Ford','Escape'],['Ford','Explorer'],['Chevrolet','Equinox'],['Chevrolet','Malibu'],['Jeep','Wrangler'],['Jeep','Grand Cherokee'],['Toyota','Tacoma'],['Ford','Mustang'],['Hyundai','Sonata'],['Hyundai','Elantra'],['Kia','Sorento'],['Subaru','Outback'],['Nissan','Sentra'],['GMC','Sierra 1500']];
(async () => {
  const names = {};
  const nrows = await prisma.dTCCode.findMany({ where: { code: { in: CODES } }, select: { code: true, name: true } });
  nrows.forEach(r => names[r.code] = r.name);
  const targets = [];
  for (const [make, model] of VEHICLES) {
    const rows = await prisma.$queryRawUnsafe(`SELECT DISTINCT unnest("dtcCodes") c FROM "KnownIssue" WHERE status='published' AND make ILIKE $1 AND model ILIKE $2`, make, model);
    const have = new Set(rows.map(r => r.c));
    const missing = CODES.filter(c => !have.has(c)).map(c => ({ code: c, name: names[c] || c }));
    if (missing.length) targets.push({ make, model, missing });
  }
  const totalGaps = targets.reduce((s,t)=>s+t.missing.length,0);
  const T = JSON.stringify(targets, null, 2);
  const script = `export const meta = {
  name: 'dtc-vehicle-gap-wave',
  description: 'Build known-issues FROM DTCs: research each top OBD-II code as it presents on a specific popular vehicle (fills ${totalGaps} thin code x vehicle gaps across ${targets.length} models), auto-populating the /dtc/[code]/[make] money pages',
  phases: [ { title: 'Discover' }, { title: 'Verify' } ],
}
const TARGETS = ${T}
const CITATION = { type:'object', additionalProperties:false, properties:{ type:{type:'string',enum:['forum','nhtsa','tsb','recall','article','manufacturer','reddit']}, title:{type:'string'}, url:{type:'string'} }, required:['type','title','url'] }
const IP = { title:{type:'string'}, description:{type:'string'}, solution:{type:'string'}, category:{type:'string',enum:['engine','transmission','drivetrain','electrical','brakes','suspension','cooling','fuel','interior','exterior','body','safety','exhaust','steering','hvac','emissions','other']}, severity:{type:'string',enum:['high','medium','low']}, years:{type:'array',items:{type:'integer'}}, trims:{type:'array',items:{type:'string'}}, engines:{type:'array',items:{type:'string'}}, symptoms:{type:'array',items:{type:'string'}}, dtcCodes:{type:'array',items:{type:'string'}}, estimatedCostLow:{type:'number'}, estimatedCostHigh:{type:'number'}, citations:{type:'array',items:CITATION} }
const REQ = ['title','description','solution','category','severity','years','trims','engines','symptoms','dtcCodes','estimatedCostLow','estimatedCostHigh','citations']
const RS = { type:'object', additionalProperties:false, properties:{ issues:{type:'array',items:{type:'object',additionalProperties:false,properties:IP,required:REQ}} }, required:['issues'] }
const VS = { type:'object', additionalProperties:false, properties:{ confirmed:{type:'array',items:{type:'object',additionalProperties:false,properties:{...IP,confidence:{type:'number'}},required:[...REQ,'confidence']}} }, required:['confirmed'] }
function rp(t){ return \`You are an OBD-II diagnostics + reliability researcher. For the \${t.make} \${t.model}, research ONE distinct, real known issue for EACH trouble code below, AS IT SPECIFICALLY PRESENTS ON THIS VEHICLE (common engine/generation):
\${t.missing.map(m=>'- '+m.code+' ('+m.name+')').join(String.fromCharCode(10))}

For each code: the specific cause that triggers THIS code on THIS vehicle, affected years/engines, symptoms the driver notices, the accepted fix, a realistic repair cost range, and 2-4 REAL citations (NHTSA, TSBs, owner forums/Reddit — never invent URLs). Use web search to confirm. Set dtcCodes to EXACTLY that one code. Title should name the failure (not just the code), e.g. "P0301 — Cylinder 1 Misfire from Failed Ignition Coil". Return one issue per code; skip a code only if there's genuinely no real \${t.make} \${t.model}-specific pattern for it.\`; }
function vp(t,issues){ return \`Skeptical fact-checker. For the \${t.make} \${t.model}, verify each proposed code-specific issue with web search: is it a REAL documented cause of that exact code on THIS vehicle, correctly attributed, with citations that support it? Proposed (JSON): \${JSON.stringify(issues)}. Return ONLY confirmed issues, each with confidence 0-1; keep dtcCodes exact. Drop fabricated/mis-attributed ones.\`; }
phase('Discover')
const per = await pipeline(TARGETS,
  (t)=>agent(rp(t),{label:'dtc:'+t.make+' '+t.model,phase:'Discover',schema:RS}).then(r=>({t,issues:(r&&Array.isArray(r.issues))?r.issues:[]})),
  (p)=>(!p||p.issues.length===0)?{t:p?p.t:null,confirmed:[]}:agent(vp(p.t,p.issues),{label:'verify:'+p.t.make+' '+p.t.model,phase:'Verify',schema:VS}).then(v=>({t:p.t,confirmed:(v&&Array.isArray(v.confirmed))?v.confirmed:[]})))
const confirmed=[]; let kept=0
for(const r of per){ if(!r||!r.t)continue; for(const iss of r.confirmed){ if(typeof iss.confidence==='number'&&iss.confidence>=0.7){ confirmed.push({make:r.t.make,model:r.t.model,...iss,_verdictConfidence:iss.confidence}); kept++ } } }
log('Confirmed '+kept+' code-specific issues across '+TARGETS.length+' vehicles')
return { confirmed, visualEvidence:[], stats:{ vehicles:TARGETS.length, gaps:${totalGaps}, confirmed:kept } }
`;
  fs.writeFileSync('scripts/gen-dtc-wave.js', script);
  console.log(`Wrote scripts/gen-dtc-wave.js — ${targets.length} vehicles, ${totalGaps} code-gaps to fill`);
  await prisma.$disconnect(); await pool.end();
})();
