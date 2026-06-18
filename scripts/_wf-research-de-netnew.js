/**
 * RESEARCH WAVE (NET-NEW) — German/EU bestsellers with ZERO coverage.
 * Prepped while translate-de-wave2 runs; launch AFTER the deepen wave
 * (research-de-deepen) completes, to protect the weekly limit:
 *   Workflow({ scriptPath: 'scripts/_wf-research-de-netnew.js' })
 *
 * These models are mostly EU-ONLY (never sold in the US), so the discover
 * agents must lean on EU/UK/German sources (motor-talk.de, honestjohn.co.uk,
 * pistonheads, DVSA recalls, brand forums) — NOT NHTSA, which won't list them.
 *
 * Same discover -> adversarial-verify pipeline as the deepen wave. Output
 * matches _persist-known-issues-run.js: { result: { confirmed[], stats } } →
 * lands as status='pending_review'.
 *
 * DOWNSTREAM (after persist) — these are NEW nameplates, so before promoting:
 *   1. Persist (DB write, GATED → Devon): node scripts/_persist-known-issues-run.js <out>
 *   2. Add each model to public/data/ymmt.json (local file; mirror an existing
 *      add-<make>-...-to-ymmt.js script) with correct EU year ranges.
 *   3. Promote with URL-liveness gate (GATED → Devon): scripts/_promote-pending-review.js
 *   This IS the audit-before-publish gate (#135): nothing publishes until the
 *   verify pass + human promote sign off.
 */
export const meta = {
  name: 'research-de-netnew',
  description: 'Net-new German/EU bestsellers (zero coverage): EU-sourced discover + adversarial verify → pending_review',
  phases: [
    { title: 'Discover' },
    { title: 'Verify' },
  ],
}

// EU-market models with zero DB coverage. yearsHint scopes the search; these
// are mostly EU-only nameplates. (Opel Combo is already in YMMT; the rest need
// a YMMT add before promote.)
const TARGETS = [
  { make: 'Volkswagen', model: 'T-Roc',                  yearsHint: '2017–present (EU)', note: 'compact SUV, top German seller, EU-only' },
  { make: 'Volkswagen', model: 'T-Cross',                yearsHint: '2019–present (EU)', note: 'subcompact SUV, EU-only' },
  { make: 'Volkswagen', model: 'Touran',                 yearsHint: '2003–present (EU)', note: 'compact MPV, EU-only' },
  { make: 'Volkswagen', model: 'ID.3',                   yearsHint: '2020–present (EU)', note: 'compact EV, EU-only' },
  { make: 'Audi',       model: 'Q2',                     yearsHint: '2016–present (EU)', note: 'subcompact SUV, EU-only' },
  { make: 'Audi',       model: 'A1',                     yearsHint: '2010–present (EU)', note: 'subcompact hatch, EU-only' },
  { make: 'BMW',        model: '2 Series Active Tourer', yearsHint: '2014–present (EU)', note: 'FWD MPV (UKL platform) — distinct from the RWD 2 Series coupe' },
  { make: 'Mercedes-Benz', model: 'V-Class',             yearsHint: '2014–present (EU)', note: 'W447 MPV/van, EU-only' },
  { make: 'Mercedes-Benz', model: 'EQC',                 yearsHint: '2019–2023 (EU)',    note: 'electric SUV (N293)' },
  { make: 'Opel',       model: 'Combo',                  yearsHint: '2018–present (EU)', note: 'van/MPV (Combo Life), EU' },
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
    `You research REAL, documented known issues for a specific car. Vehicle: ${t.make} ${t.model} (${t.yearsHint}). Context: ${t.note}.`,
    ``,
    `IMPORTANT: this model is sold mainly in Europe and was likely NEVER sold in the US, so US sources (NHTSA) will NOT list it. Lean on EU/UK/German sources: motor-talk.de, honestjohn.co.uk, pistonheads, UK/DE brand owner forums, DVSA (UK) recalls, ADAC/Euro NCAP, reputable EU automotive press.`,
    ``,
    `Use web search to find 5–9 well-documented, recurring issues real owners report for the ${t.make} ${t.model}. We currently have ZERO issues for this model, so there is nothing to exclude — but only include GENUINE, corroborated problems (no generic filler, no issues copied from a different model/platform).`,
    ``,
    `For EACH issue provide: title (specific), description (what fails and why), solution (the real fix), severity (high/medium/low), category (one of: engine, transmission, drivetrain, electrical, brakes, suspension, cooling, fuel, interior, exterior, body, safety, exhaust, steering, hvac, emissions, other), years (specific EU model years affected, integers), trims/engines if specific (use EU engine codes, e.g. TSI/TDI/TFSI), symptoms[], dtcCodes[] if applicable (real codes only), estimatedCostLow/High in USD if known, and citations[] — at least ONE real, currently-live URL per issue. DO NOT fabricate URLs; cite only pages you actually found.`,
    ``,
    `Accuracy over volume. Never invent an issue or a citation. Respond ONLY via the StructuredOutput tool.`,
  ].join('\n')
}

function verifyPrompt(t, c) {
  return [
    `You are a skeptical automotive fact-checker. DEFAULT TO REFUTING unless the evidence is solid. This is an EU-market model (${t.make} ${t.model}, ${t.yearsHint}); US databases will not list it, so judge against EU/UK/German sources.`,
    ``,
    `CLAIM:`,
    `Title: ${c.title}`,
    `Description: ${c.description}`,
    `Years: ${(c.years || []).join(', ')}`,
    `Cited URLs: ${(c.citations || []).map((x) => x.url).join(' | ') || '(none)'}`,
    ``,
    `Use web search to verify: (1) Is this a genuine, documented issue for THIS specific EU model (not copied from another model/platform, not fabricated)? (2) Do the cited URLs actually exist, resolve, and support the claim? (3) Are the years plausible for this nameplate?`,
    ``,
    `Return: isReal, confidence 0-1, hasLiveCitation (true only if ≥1 cited URL is real, reachable, on-topic), and a one-sentence reason. If citations look fabricated or you cannot corroborate it, isReal=false.`,
  ].join('\n')
}

log(`Research net-new: ${TARGETS.length} EU-market models (zero coverage)`)

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
log(`TOTAL confirmed (pending_review): ${confirmed.length}`)

return { result: { confirmed, stats: { models: TARGETS.length, confirmed: confirmed.length, perModel: perModelStats } } }
