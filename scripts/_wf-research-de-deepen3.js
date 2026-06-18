/**
 * RESEARCH WAVE 3 (deepen) — next 12 thin German/EU models incl. iconic
 * classics. Same discover→adversarial-verify pipeline; reads
 * data/research-de-exclusions-3.json for dedupe. Output →
 * _persist-known-issues-run.js shape.
 */
export const meta = {
  name: 'research-de-deepen3',
  description: 'Deepen 12 more thin German/EU models (wave 3): discover + adversarial verify → pending_review',
  phases: [{ title: 'Discover' }, { title: 'Verify' }],
}

const TARGETS = [
  { make: 'Mercedes-Benz', model: 'Sprinter' },
  { make: 'Mercedes-Benz', model: 'EQS' },
  { make: 'Mercedes-Benz', model: 'SLC' },
  { make: 'Volkswagen', model: 'Eos' },
  { make: 'Volkswagen', model: 'New Beetle' },
  { make: 'Volkswagen', model: 'Phaeton' },
  { make: 'Audi', model: 'S7' },
  { make: 'Audi', model: '100' },
  { make: 'Audi', model: '90' },
  { make: 'BMW', model: 'M6' },
  { make: 'BMW', model: 'Z3' },
  { make: 'Opel', model: 'Zafira' },
]

const CITATION = {
  type: 'object', additionalProperties: false,
  properties: { type: { type: 'string' }, title: { type: 'string' }, url: { type: 'string' } },
  required: ['type', 'title', 'url'],
}
const DISCOVER_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: {
    candidates: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        properties: {
          title: { type: 'string' }, description: { type: 'string' }, solution: { type: 'string' },
          severity: { type: 'string', enum: ['high', 'medium', 'low'] }, category: { type: 'string' },
          years: { type: 'array', items: { type: 'integer' } },
          trims: { type: 'array', items: { type: 'string' } },
          engines: { type: 'array', items: { type: 'string' } },
          symptoms: { type: 'array', items: { type: 'string' } },
          dtcCodes: { type: 'array', items: { type: 'string' } },
          estimatedCostLow: { type: 'number' }, estimatedCostHigh: { type: 'number' },
          citations: { type: 'array', items: CITATION },
        },
        required: ['title', 'description', 'solution', 'severity', 'category', 'years', 'symptoms', 'dtcCodes', 'citations'],
      },
    },
  },
  required: ['candidates'],
}
const VERDICT_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: {
    isReal: { type: 'boolean' }, confidence: { type: 'number' },
    hasLiveCitation: { type: 'boolean' }, reason: { type: 'string' },
  },
  required: ['isReal', 'confidence', 'hasLiveCitation', 'reason'],
}

function discoverPrompt(t) {
  return [
    `You research REAL, documented mechanical/electrical known issues for a specific car model. Vehicle: ${t.make} ${t.model}.`,
    ``,
    `STEP 1 — Read \`data/research-de-exclusions-3.json\` and find the entry where make="${t.make}" and model="${t.model}". Its \`existingTitles\` are issues we ALREADY have — do NOT return those or trivial rewordings. \`yearsCovered\` shows what we already span.`,
    ``,
    `STEP 2 — Use web search to find 4–8 ADDITIONAL well-documented issues NOT in existingTitles. Prioritize what real owners report. Consult owner forums, Reddit, NHTSA, manufacturer TSBs, and — German-market model — German-language sources (motor-talk.de, brand forums). Favor EU-spec relevance.`,
    ``,
    `For EACH: title (specific), description, solution, severity (high/medium/low), category (engine, transmission, drivetrain, electrical, brakes, suspension, cooling, fuel, interior, exterior, body, safety, exhaust, steering, hvac, emissions, other), years (integers), trims/engines if specific, symptoms[], dtcCodes[] (real only), estimatedCostLow/High USD if known, citations[] with ≥1 real live URL. DO NOT fabricate URLs.`,
    ``,
    `Accuracy over volume. Never invent an issue or citation. Respond ONLY via the StructuredOutput tool.`,
  ].join('\n')
}
function verifyPrompt(t, c) {
  return [
    `You are a skeptical automotive fact-checker. DEFAULT TO REFUTING unless evidence is solid. Decide whether this claimed known issue for the ${t.make} ${t.model} is REAL and properly sourced.`,
    ``,
    `CLAIM:\nTitle: ${c.title}\nDescription: ${c.description}\nYears: ${(c.years || []).join(', ')}\nCited URLs: ${(c.citations || []).map((x) => x.url).join(' | ') || '(none)'}`,
    ``,
    `Use web search: (1) genuine documented issue for THIS model (not copied from another, not fabricated)? (2) Do cited URLs exist and support it? (3) Years plausible? Return isReal, confidence 0-1, hasLiveCitation (≥1 real reachable on-topic URL), one-sentence reason. If citations look fabricated or uncorroborated, isReal=false.`,
  ].join('\n')
}

log(`Deepen wave 3: ${TARGETS.length} German/EU models`)
const perModel = await pipeline(
  TARGETS,
  (t) => agent(discoverPrompt(t), { label: `discover:${t.model}`, phase: 'Discover', schema: DISCOVER_SCHEMA })
    .then((d) => ({ t, candidates: (d && Array.isArray(d.candidates)) ? d.candidates : [] })),
  (disc) => {
    const { t, candidates } = disc
    if (!candidates.length) return { make: t.make, model: t.model, confirmed: [] }
    return parallel(candidates.map((c) => () =>
      agent(verifyPrompt(t, c), { label: `verify:${t.model}`, phase: 'Verify', schema: VERDICT_SCHEMA })
        .then((v) => {
          if (!v || !v.isReal || !v.hasLiveCitation || (v.confidence ?? 0) < 0.7) return null
          if (!Array.isArray(c.citations) || c.citations.length === 0) return null
          return { ...c, make: t.make, model: t.model, _verdictConfidence: v.confidence }
        })
    )).then((arr) => ({ make: t.make, model: t.model, confirmed: arr.filter(Boolean) }))
  }
)
const confirmed = []
const perModelStats = {}
for (const r of perModel.filter(Boolean)) {
  perModelStats[`${r.make} ${r.model}`] = r.confirmed.length
  for (const c of r.confirmed) confirmed.push(c)
}
for (const [k, n] of Object.entries(perModelStats)) log(`${k}: +${n} confirmed`)
log(`TOTAL confirmed: ${confirmed.length}`)
return { result: { confirmed, stats: { models: TARGETS.length, confirmed: confirmed.length, perModel: perModelStats } } }
