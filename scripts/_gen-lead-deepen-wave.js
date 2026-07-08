const fs = require('fs');
const data = JSON.parse(fs.readFileSync('scripts/_lead-deepen-data.json', 'utf8'));
// target new issues by current depth
function target(n){ if(n<10) return 6; if(n<20) return 4; if(n<40) return 3; return 2; }
const MODELS = data.filter(d => d.make && d.model).map(d => ({
  make: d.make, model: d.model, count: d.count, target: target(d.count),
  leads: d.leads, never: d.never,
  exclude: (d.titles||[]).slice(0, 30),
}));
const script = `export const meta = {
  name: 'lead-vehicle-deepening-wave',
  description: 'Deepen every interest-lead vehicle (39 models) with NEW verified known issues so the Mon Jul 13 digest lands fresh findings — prioritized never-notified + thin first, targets scaled by current depth',
  phases: [
    { title: 'Discover', detail: 'per lead vehicle: find NEW real issues excluding what we have' },
    { title: 'Verify', detail: 'independent adversarial verify, keep confidence >= 0.7' },
  ],
}

const MODELS = ${JSON.stringify(MODELS, null, 2)}

const CITATION = { type: 'object', additionalProperties: false, properties: { type: { type: 'string', enum: ['forum','nhtsa','tsb','recall','article','manufacturer','reddit'] }, title: { type: 'string' }, url: { type: 'string' } }, required: ['type','title','url'] }
const ISSUE_PROPS = {
  title: { type: 'string' }, description: { type: 'string' }, solution: { type: 'string' },
  category: { type: 'string', enum: ['engine','transmission','drivetrain','electrical','brakes','suspension','cooling','fuel','interior','exterior','body','safety','exhaust','steering','hvac','emissions','other'] },
  severity: { type: 'string', enum: ['high','medium','low'] },
  years: { type: 'array', items: { type: 'integer' } }, trims: { type: 'array', items: { type: 'string' } },
  engines: { type: 'array', items: { type: 'string' } }, symptoms: { type: 'array', items: { type: 'string' } },
  dtcCodes: { type: 'array', items: { type: 'string' } }, estimatedCostLow: { type: 'number' }, estimatedCostHigh: { type: 'number' },
  citations: { type: 'array', items: CITATION },
}
const REQ = ['title','description','solution','category','severity','years','trims','engines','symptoms','dtcCodes','estimatedCostLow','estimatedCostHigh','citations']
const RESEARCH_SCHEMA = { type: 'object', additionalProperties: false, properties: { issues: { type: 'array', items: { type: 'object', additionalProperties: false, properties: ISSUE_PROPS, required: REQ } } }, required: ['issues'] }
const VERIFY_SCHEMA = { type: 'object', additionalProperties: false, properties: { confirmed: { type: 'array', items: { type: 'object', additionalProperties: false, properties: { ...ISSUE_PROPS, confidence: { type: 'number' } }, required: [...REQ, 'confidence'] } } }, required: ['confirmed'] }

function researchPrompt(m) {
  return \`You are an automotive reliability researcher. Find REAL, well-documented known issues for the \${m.make} \${m.model}.

We ALREADY have these \${m.count} issues — do NOT return any that duplicate or paraphrase them:
\${m.exclude.map((t) => '- ' + t).join(String.fromCharCode(10))}

Find \${m.target} ADDITIONAL genuine, DISTINCT known issues (different failure modes/systems than above). Each MUST be real and corroborated — use web search against NHTSA complaints/recalls, manufacturer TSBs, and owner forums/Reddit. Provide: specific failure, affected years/engines/trims, symptoms, accepted fix, realistic repair cost range, and 2-4 REAL citations (actual pages — never invent URLs). If genuinely fewer than \${m.target} more real issues exist, return only what's real; never pad.\`
}
function verifyPrompt(m, issues) {
  return \`You are a SKEPTICAL automotive fact-checker. For the \${m.make} \${m.model}, independently verify each proposed issue with web search: is it a REAL documented failure for THIS vehicle, correctly attributed, with citations that actually support it?

Proposed (JSON):
\${JSON.stringify(issues)}

Return ONLY confirmed real+correct issues, each with confidence 0-1. Drop fabricated/uncorroborated/mis-cited ones. Fix wrong years/engines if real data differs. Fewer solid beats padded.\`
}

phase('Discover')
const perModel = await pipeline(
  MODELS,
  (m) => agent(researchPrompt(m), { label: 'discover:' + m.make + ' ' + m.model, phase: 'Discover', schema: RESEARCH_SCHEMA }).then((r) => ({ m, issues: (r && Array.isArray(r.issues)) ? r.issues : [] })),
  (prev) => (!prev || prev.issues.length === 0) ? { m: prev ? prev.m : null, confirmed: [] } : agent(verifyPrompt(prev.m, prev.issues), { label: 'verify:' + prev.m.make + ' ' + prev.m.model, phase: 'Verify', schema: VERIFY_SCHEMA }).then((v) => ({ m: prev.m, confirmed: (v && Array.isArray(v.confirmed)) ? v.confirmed : [] })),
)

const confirmed = []
let kept = 0
for (const r of perModel) {
  if (!r || !r.m) continue
  for (const iss of r.confirmed) {
    if (typeof iss.confidence === 'number' && iss.confidence >= 0.7) { confirmed.push({ make: r.m.make, model: r.m.model, ...iss, _verdictConfidence: iss.confidence }); kept++ }
  }
}
log('Confirmed ' + kept + ' new issues across ' + MODELS.length + ' lead vehicles')
return { confirmed, visualEvidence: [], stats: { models: MODELS.length, confirmed: kept } }
`;
fs.writeFileSync('scripts/gen-lead-deepen-wave.js', script);
console.log('Generated scripts/gen-lead-deepen-wave.js —', MODELS.length, 'models, targets:', MODELS.reduce((s,m)=>s+m.target,0), 'issues sought');
