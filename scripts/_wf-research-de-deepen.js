/**
 * RESEARCH WAVE — deepen 15 thin mainstream German-market models.
 * Prepped while the translate-de-wave2 workflow runs; launch with:
 *   Workflow({ scriptPath: 'scripts/_wf-research-de-deepen.js' })
 * AFTER the translation wave finishes (protect the weekly limit).
 *
 * Pipeline per model: discover (web search, exclude existing titles) →
 * adversarially verify each candidate (refute-by-default; require isReal +
 * confidence >= 0.7 + >= 1 live citation). Output shape matches
 * _persist-known-issues-run.js: { result: { confirmed[], stats } }.
 * Persist (DB write) is gated → hand the output file to Devon to run.
 *
 * Dedupe: each discover agent reads data/research-de-exclusions.json and
 * MUST skip any issue already covered for its model (research-dedupe-gate).
 */
export const meta = {
  name: 'research-de-deepen',
  description: 'Deepen 15 thin German-market models: web-search discover + adversarial verify → pending_review issues',
  phases: [
    { title: 'Discover' },
    { title: 'Verify' },
  ],
}

const TARGETS = [
  { make: 'Mercedes-Benz', model: 'A-Class' },
  { make: 'Mercedes-Benz', model: 'GLC' },
  { make: 'Mercedes-Benz', model: 'GLA' },
  { make: 'Mercedes-Benz', model: 'CLA' },
  { make: 'Porsche', model: 'Macan' },
  { make: 'Porsche', model: 'Taycan' },
  { make: 'Porsche', model: 'Cayman' },
  { make: 'Volkswagen', model: 'Touareg' },
  { make: 'Volkswagen', model: 'Arteon' },
  { make: 'Audi', model: 'Q8' },
  { make: 'Audi', model: 'Q5 Sportback' },
  { make: 'BMW', model: 'iX3' },
  { make: 'BMW', model: 'M340i' },
  { make: 'Opel', model: 'Mokka' },
  { make: 'Opel', model: 'Grandland' },
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
          title: { type: 'string' },
          description: { type: 'string' },
          solution: { type: 'string' },
          severity: { type: 'string', enum: ['high', 'medium', 'low'] },
          category: { type: 'string' },
          years: { type: 'array', items: { type: 'integer' } },
          trims: { type: 'array', items: { type: 'string' } },
          engines: { type: 'array', items: { type: 'string' } },
          symptoms: { type: 'array', items: { type: 'string' } },
          dtcCodes: { type: 'array', items: { type: 'string' } },
          estimatedCostLow: { type: 'number' },
          estimatedCostHigh: { type: 'number' },
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
    isReal: { type: 'boolean' },
    confidence: { type: 'number' },
    hasLiveCitation: { type: 'boolean' },
    reason: { type: 'string' },
  },
  required: ['isReal', 'confidence', 'hasLiveCitation', 'reason'],
}

function discoverPrompt(t) {
  return [
    `You research REAL, documented mechanical/electrical known issues for a specific car model. Vehicle: ${t.make} ${t.model}.`,
    ``,
    `STEP 1 — Read \`data/research-de-exclusions.json\` and find the entry where make="${t.make}" and model="${t.model}". Its \`existingTitles\` are issues we ALREADY have — you MUST NOT return those or trivial rewordings of them. \`yearsCovered\` shows what we already span.`,
    ``,
    `STEP 2 — Use web search to find 4–8 ADDITIONAL well-documented issues for the ${t.make} ${t.model} that are NOT in existingTitles. Prioritize issues real owners actually report. Consult multiple sources: owner forums, Reddit, NHTSA complaints/recalls, manufacturer TSBs, and — since this is a German-market model — German-language sources (e.g. motor-talk.de, forums) are valuable. This model is popular in Germany/EU, so favor issues relevant to EU-spec cars.`,
    ``,
    `For EACH issue provide: title (specific, e.g. "7G-DCT transmission shudder / mechatronics failure"), description (what fails and why), solution (the real fix), severity (high/medium/low), category (one of: engine, transmission, drivetrain, electrical, brakes, suspension, cooling, fuel, interior, exterior, body, safety, exhaust, steering, hvac, emissions, other), years (specific model years affected, as integers), trims/engines if specific, symptoms[], dtcCodes[] if applicable (real codes only), estimatedCostLow/High in USD if known, and citations[] — at least ONE real, currently-live URL per issue (forum thread, NHTSA page, TSB, reputable article). DO NOT fabricate URLs; only cite pages you actually found via search.`,
    ``,
    `Accuracy over volume. If you can only confirm 3 solid new issues, return 3. Never invent an issue or a citation. Respond ONLY via the StructuredOutput tool.`,
  ].join('\n')
}

function verifyPrompt(t, c) {
  return [
    `You are a skeptical automotive fact-checker. DEFAULT TO REFUTING unless the evidence is solid. Decide whether this claimed known issue for the ${t.make} ${t.model} is REAL and properly sourced.`,
    ``,
    `CLAIM:`,
    `Title: ${c.title}`,
    `Description: ${c.description}`,
    `Years: ${(c.years || []).join(', ')}`,
    `Cited URLs: ${(c.citations || []).map((x) => x.url).join(' | ') || '(none)'}`,
    ``,
    `Use web search to verify: (1) Is this a genuine, documented issue for THIS model (not copy-pasted from a different make/model, not a generic AI fabrication)? (2) Do the cited URLs actually exist and support the claim? Open/search them. (3) Are the affected years plausible for this model?`,
    ``,
    `Return: isReal (true only if it is a genuine documented issue for this model), confidence 0-1 (your calibrated certainty), hasLiveCitation (true only if at least one cited URL is real and reachable and on-topic), and a one-sentence reason. If the citations look fabricated or you cannot corroborate the issue, set isReal=false.`,
  ].join('\n')
}

log(`Research-deepen: ${TARGETS.length} German-market models`)

const perModel = await pipeline(
  TARGETS,
  // Stage 1 — discover (one agent per model)
  (t) => agent(discoverPrompt(t), { label: `discover:${t.model}`, phase: 'Discover', schema: DISCOVER_SCHEMA })
    .then((d) => ({ t, candidates: (d && Array.isArray(d.candidates)) ? d.candidates : [] })),
  // Stage 2 — verify each candidate (no barrier between models)
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
log(`TOTAL confirmed (pending_review): ${confirmed.length}`)

return { result: { confirmed, stats: { models: TARGETS.length, confirmed: confirmed.length, perModel: perModelStats } } }
