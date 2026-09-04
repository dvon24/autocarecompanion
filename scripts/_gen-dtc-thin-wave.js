/**
 * Generate research waves that fatten the DTC pages held back by the
 * DTC_MIN_UNIQUE_WORDS content bar.
 *
 * The bar (src/lib/dtc-codes.ts) noindexes a code page carrying under 150
 * words of vehicle-specific text. Suppressing them is the stop-gap; this is
 * the cure. Each target is a thin CODE, and the ask is additional real
 * vehicle cases for it — a second and third vehicle is exactly what lifts a
 * page over the bar, and the page re-indexes itself on the next revalidate
 * with no deploy needed.
 *
 * Unlike _gen-dtc-wave.js (vehicle-first: known vehicles x a fixed code list)
 * this is code-first, because the thin set is defined by code.
 *
 * Usage:
 *   node scripts/_gen-dtc-thin-wave.js [codesPerWave=20] [waveCount=1]
 *
 * Writes scripts/_wf-dtc-thin-w<N>.js per wave. Run each with the Workflow
 * tool, then persist through the normal path:
 *   _persist-known-issues-run.js -> _check-tonight-dupes.js -> _promote-pending-review.js
 *
 * Search budget: a 13-model wave costs ~200 searches and the cap is roughly
 * one wave per session, so keep codesPerWave modest and run them across
 * sessions rather than launching the whole backlog at once.
 */
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
pool.on('error', () => {});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const PER_WAVE = Number.parseInt(process.argv[2], 10) || 20;
const WAVES = Number.parseInt(process.argv[3], 10) || 1;
const MIN_WORDS = 150;

(async () => {
  // Same word-count expression the render bar uses. POSIX class, not \s —
  // Prisma's template escaping eats the backslash.
  const WC = `COALESCE(array_length(regexp_split_to_array(trim(
      COALESCE(k.title,'') || ' ' || COALESCE(k.description,'') || ' ' ||
      COALESCE(k.solution,'') || ' ' || COALESCE(array_to_string(k.symptoms,' '),'')
    ), '[[:space:]]+'), 1), 0)`;

  const thin = await prisma.$queryRawUnsafe(`
    SELECT c.code, SUM(${WC})::int AS words, COUNT(*)::int AS issues
    FROM "KnownIssue" k, unnest(k."dtcCodes") AS c(code)
    WHERE k.status = 'published'
    GROUP BY c.code
    HAVING SUM(${WC}) < ${MIN_WORDS}
  `);

  // Only codes that actually have a page — a code missing from the library
  // 404s no matter how much content we add to it.
  const lib = await prisma.dTCCode.findMany({
    select: { code: true, name: true, system: true, description: true },
  });
  const libByCode = new Map(lib.map((d) => [d.code, d]));
  const candidates = thin.filter((t) => libByCode.has(t.code.toUpperCase()));

  // Closest to the bar first: those need the least new content to graduate,
  // so the early waves convert the most pages per search spent.
  candidates.sort((a, b) => b.words - a.words);

  const targets = [];
  for (const c of candidates) {
    const code = c.code.toUpperCase();
    const d = libByCode.get(code);
    const have = await prisma.knownIssue.findMany({
      where: { status: 'published', dtcCodes: { has: code } },
      select: { make: true, model: true, years: true },
    });
    targets.push({
      code,
      name: d.name,
      system: d.system,
      blurb: (d.description || '').slice(0, 300),
      words: c.words,
      have: have.map((h) => ({
        make: h.make,
        model: h.model,
        years: (h.years || []).slice(0, 3),
      })),
    });
  }

  console.log(`thin code pages needing content: ${targets.length}`);
  console.log(`emitting ${WAVES} wave(s) of up to ${PER_WAVE} codes each\n`);

  for (let w = 0; w < WAVES; w++) {
    const slice = targets.slice(w * PER_WAVE, (w + 1) * PER_WAVE);
    if (slice.length === 0) break;
    const file = `scripts/_wf-dtc-thin-w${w}.js`;
    fs.writeFileSync(file, buildScript(slice, w));
    console.log(
      `  ${file}  ${slice.length} codes  (${slice[0].words}-${slice[slice.length - 1].words} words today)`,
    );
  }

  const remaining = Math.max(0, targets.length - WAVES * PER_WAVE);
  if (remaining) console.log(`\n${remaining} thin codes still unqueued — rerun with a higher waveCount.`);

  await prisma.$disconnect();
  await pool.end();
})();

function buildScript(targets, w) {
  const T = JSON.stringify(targets, null, 2);
  return `export const meta = {
  name: 'dtc-thin-wave-${w}',
  description: 'Add real vehicle-specific cases to ${targets.length} DTC code pages currently held back by the 150-word content bar, so they re-index themselves',
  phases: [ { title: 'Discover' }, { title: 'Verify' } ],
}
const TARGETS = ${T}
const CITATION = { type:'object', additionalProperties:false, properties:{ type:{type:'string',enum:['forum','nhtsa','tsb','recall','article','manufacturer','reddit']}, title:{type:'string'}, url:{type:'string'} }, required:['type','title','url'] }
const IP = { make:{type:'string'}, model:{type:'string'}, title:{type:'string'}, description:{type:'string'}, solution:{type:'string'}, category:{type:'string',enum:['engine','transmission','drivetrain','electrical','brakes','suspension','cooling','fuel','interior','exterior','body','safety','exhaust','steering','hvac','emissions','other']}, severity:{type:'string',enum:['high','medium','low']}, years:{type:'array',items:{type:'integer'}}, trims:{type:'array',items:{type:'string'}}, engines:{type:'array',items:{type:'string'}}, symptoms:{type:'array',items:{type:'string'}}, dtcCodes:{type:'array',items:{type:'string'}}, estimatedCostLow:{type:'number'}, estimatedCostHigh:{type:'number'}, citations:{type:'array',items:CITATION} }
const REQ = ['make','model','title','description','solution','category','severity','years','trims','engines','symptoms','dtcCodes','estimatedCostLow','estimatedCostHigh','citations']
const RS = { type:'object', additionalProperties:false, properties:{ issues:{type:'array',items:{type:'object',additionalProperties:false,properties:IP,required:REQ}} }, required:['issues'] }
const VS = { type:'object', additionalProperties:false, properties:{ confirmed:{type:'array',items:{type:'object',additionalProperties:false,properties:{...IP,confidence:{type:'number'}},required:[...REQ,'confidence']}} }, required:['confirmed'] }

function rp(t){ return \`You are an OBD-II diagnostics and vehicle-reliability researcher.

Trouble code: \${t.code} — \${t.name} (system: \${t.system})
\${t.blurb ? 'Reference: ' + t.blurb : ''}

We already document this code on:
\${t.have.map(h=>'- '+h.make+' '+h.model+(h.years.length?' ('+h.years.join(', ')+')':'')).join(String.fromCharCode(10))}

Find 2-4 ADDITIONAL real, documented cases of \${t.code} on DIFFERENT vehicles (do not repeat the makes/models above). Each must be a specific, recognised failure pattern on a specific vehicle — not a generic restatement of what the code means. For each: the exact cause that sets \${t.code} on that vehicle, affected years/engines, what the driver notices, the accepted repair, a realistic cost range, and 2-4 REAL citations (NHTSA, manufacturer TSBs, owner forums, Reddit).

Rules:
- Use web search to confirm every case. NEVER invent a URL. If you cannot find real corroboration for a vehicle, drop it — returning two solid cases beats four thin ones.
- Set dtcCodes to EXACTLY ["\${t.code}"].
- Title must name the failure, not the code, e.g. "Cylinder 1 Misfire from Failed Ignition Coil".
- description and solution should each be substantial prose; these pages are being rewritten because they were too thin.
- If this code genuinely has no documented pattern beyond the vehicles listed, return an empty issues array. That is an acceptable answer.\`; }

function vp(t,issues){ return \`Skeptical fact-checker for trouble code \${t.code} (\${t.name}).

Proposed cases (JSON): \${JSON.stringify(issues)}

For each, verify with web search: is this a REAL documented cause of \${t.code} on that exact vehicle, correctly attributed, and do the citations actually support it? Reject anything you cannot corroborate, anything that merely paraphrases the generic code definition, and any case whose citations do not resolve to real pages about that vehicle. Judge on the evidence you can actually retrieve, not on how confident the proposal sounds. Return ONLY confirmed cases, each with confidence 0-1, dtcCodes kept exactly as ["\${t.code}"].\`; }

phase('Discover')
const per = await pipeline(TARGETS,
  (t)=>agent(rp(t),{label:'dtc:'+t.code,phase:'Discover',schema:RS,model:'opus'}).then(r=>({t,issues:(r&&Array.isArray(r.issues))?r.issues:[]})),
  (p)=>(!p||p.issues.length===0)?{t:p?p.t:null,confirmed:[]}:agent(vp(p.t,p.issues),{label:'verify:'+p.t.code,phase:'Verify',schema:VS,model:'opus'}).then(v=>({t:p.t,confirmed:(v&&Array.isArray(v.confirmed))?v.confirmed:[]})))

const confirmed=[]; let kept=0, dropped=0
for(const r of per){
  if(!r||!r.t)continue
  for(const iss of r.confirmed){
    // Gate on evidence, not on the self-reported number: a case with no
    // citation is unusable regardless of how confident the agent claims to be.
    const hasEvidence = Array.isArray(iss.citations) && iss.citations.length > 0
    const okConfidence = typeof iss.confidence!=='number' || iss.confidence>=0.7
    if(hasEvidence && okConfidence){ confirmed.push({...iss,_verdictConfidence:iss.confidence}); kept++ }
    else dropped++
  }
}
log('Confirmed '+kept+' new cases across '+TARGETS.length+' thin codes ('+dropped+' dropped for missing evidence)')
return { confirmed, visualEvidence:[], stats:{ codes:TARGETS.length, confirmed:kept, dropped } }
`;
}
