/**
 * DTC TAGGING PASS 1 - the "error codes" half of the overnight drill.
 *
 * 5,824 of 8,690 published known issues carry NO dtcCodes[] at all. A /dtc/[code]/[make] page mints
 * only where a code is BOTH tagged on an issue AND present in the code library, so untagged issues
 * are the binding constraint on that surface - not the library, whose cited-but-missing gap is now
 * down to 47 mostly single-cite manufacturer codes.
 *
 * This pass takes the 12 highest-traffic nameplates' untagged engine / transmission / fuel /
 * emissions / electrical / cooling / drivetrain / hvac / brakes / steering issues and asks what code
 * the described FAILURE MODE actually sets.
 *
 * TWO HARD GATES, because a wrong code is worse than no code:
 *   1. Deterministic (JS, not a model): a proposed code must already exist in the DTC library.
 *      A code we cannot define is a page we cannot render.
 *   2. Adversarial (agent): the verifier is shown the LIBRARY'S OWN definition of each surviving
 *      code and rules on whether that definition actually describes this failure. Proposing
 *      "P0301 cylinder 1 misfire" for a general rough-idle article fails here.
 *
 * OBD-II gate applied at export: an issue qualifies only if it covers a model year >= 1996. That is
 * what keeps the pre-OBD Land Rover Series I/II/IIA articles - the single largest untagged cluster
 * in the catalog - out of a pass about diagnostic trouble codes.
 */
export const meta = {
  name: 'dtc-tag-pass1',
  description: 'Tag DTC codes onto untagged known issues for 12 high-traffic nameplates; library-gated + adversarially verified',
  phases: [
    { title: 'Propose' },
    { title: 'Verify' },
  ],
}

const BATCHES = []   // filled in by scripts/_gen-dtc-tag-parts.js

const LIB = {}       // filled in by scripts/_gen-dtc-tag-parts.js

const PROPOSE_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: {
    tags: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        properties: {
          id: { type: 'string' },
          codes: { type: 'array', items: { type: 'string' } },
          rationale: { type: 'string' },
          confidence: { type: 'number' },
        },
        required: ['id', 'codes', 'rationale', 'confidence'],
      },
    },
  },
  required: ['tags'],
}

const VERIFY_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: {
    rulings: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        properties: {
          id: { type: 'string' },
          keep: { type: 'array', items: { type: 'string' } },
          reject: { type: 'array', items: { type: 'string' } },
          reason: { type: 'string' },
        },
        required: ['id', 'keep', 'reject', 'reason'],
      },
    },
  },
  required: ['rulings'],
}

function proposePrompt(b) {
  const list = b.issues.map((i, n) => [
    n + 1 + '. id=' + i.id,
    '   title: ' + i.title,
    '   category: ' + i.category + ' | years: ' + ((i.years || []).join(', ') || 'unspecified') + ' | engines: ' + ((i.engines || []).join(', ') || 'unspecified'),
    '   description: ' + i.description,
    '   symptoms: ' + ((i.symptoms || []).join('; ') || '(none listed)'),
  ].join('\n')).join('\n\n')

  return [
    'You are an OBD-II diagnostics specialist. Vehicle: ' + b.make + ' ' + b.model + '.',
    '',
    'Below are documented known issues for this vehicle that currently carry NO diagnostic trouble codes in our database. For each one, decide which DTC(s) that specific failure mode ACTUALLY sets on THIS vehicle.',
    '',
    'The question for each issue is simple: if an owner with this exact failure plugged in a scan tool, what would come up?',
    '',
    'MOST of these failures DO set something. If a failure illuminates the check-engine light, lights a warning lamp, puts the car in limp mode, or is watched by an onboard monitor, it stores a code. Powertrain, emissions, fuel-delivery, charging, module-communication and electronic-control faults almost always do. So do failures that a recall or TSB describes as stalling, no-start, loss of assist, or loss of a driver-assist function - the recall describes the defect, but the car still stores whatever the resulting condition sets.',
    '',
    'SOME set nothing, and for those return an empty codes array: purely mechanical, cosmetic or structural problems with no sensor watching them - worn bushings, rust and corrosion, water leaks, peeling trim, cracked dashboards, brake squeal, sagging struts, an oil or coolant seep that never drops a monitored level.',
    '',
    'RULES:',
    '  * Judge the FAILURE MODE, not the component. A thermostat stuck open sets P0128; a cracked thermostat housing that merely weeps sets nothing. A turbo running underboost sets P0299; a turbo seeping oil sets nothing.',
    '  * Prefer the code the failure CAUSES over one that merely shares a subsystem.',
    '  * Do NOT pad and do NOT list a whole code family. If a failure sets one code, return one. If it genuinely sets three, return three.',
    '  * Use SAE generic codes (P0xxx, P2xxx, U0xxx) where the failure is generic. Use a manufacturer-specific code only where that is genuinely the code this make uses.',
    '  * Cylinder-specific codes (P0301-P0312) apply only when the article is about a specific cylinder. For a general misfire use P0300.',
    '  * Format codes as one letter plus four characters, uppercase, no spaces: P0128, U0100, C1234, B1057.',
    '  * Give a calibrated confidence 0-1 reflecting how sure you are that this code is what actually appears. Do not cluster your answers near any particular value - spread them honestly.',
    '',
    'ISSUES:',
    list,
    '',
    'Return one entry per issue id, including the ones you assign no codes. Respond ONLY via the StructuredOutput tool.',
  ].join('\n')
}

function verifyPrompt(b, proposals) {
  const list = proposals.map((p) => [
    'id=' + p.id + ' (analyst confidence ' + p.confidence + ')',
    '  issue: ' + p.title,
    '  description: ' + p.description,
    '  analyst rationale: ' + p.rationale,
    '  proposed codes:',
    p.codes.map((c) => '    ' + c + ' -- library definition: ' + (p.defs[c] || '(no definition)')).join('\n'),
  ].join('\n')).join('\n\n')

  return [
    'You are a skeptical diagnostics reviewer. DEFAULT TO REJECTING a code unless the library definition below plainly describes the failure. Vehicle: ' + b.make + ' ' + b.model + '.',
    '',
    "Another analyst proposed DTC tags for these known issues. Every proposed code has been checked to exist in our code library, and the library's OWN definition is quoted for you. Your job is semantic fit ONLY: does that definition actually describe THIS failure on THIS vehicle?",
    '',
    'Reject a code when:',
    '  * The definition describes a different component or a different subsystem than the article.',
    "  * The definition describes something the article's failure could cause only indirectly, through a chain of several steps.",
    '  * The code is cylinder-, bank-, or circuit-specific but the article is general.',
    '  * The failure is mechanical, cosmetic, or structural and would set no code at all.',
    "  * The code belongs to a different manufacturer's numbering scheme.",
    '',
    'Keep a code only when an owner with this exact failure would plausibly see that exact code on a scan tool. When in doubt, reject - a wrong code on a public page is worse than a missing one.',
    '',
    'PROPOSALS:',
    list,
    '',
    'Return one ruling per id with keep[] and reject[] (every proposed code must appear in exactly one of them) and a one-sentence reason. Respond ONLY via the StructuredOutput tool.',
  ].join('\n')
}

const CODE_RE = /^[PBCU][0-9A-F]{4}$/

log('DTC tagging pass 1: ' + BATCHES.length + ' nameplates, ' + BATCHES.reduce((s, b) => s + b.issues.length, 0) + ' untagged issues | library ' + Object.keys(LIB).length + ' codes')

const perBatch = await pipeline(
  BATCHES,
  (b) => agent(proposePrompt(b), { label: 'propose:' + b.make + ' ' + b.model, phase: 'Propose', schema: PROPOSE_SCHEMA })
    .then((d) => ({ b, tags: (d && Array.isArray(d.tags)) ? d.tags : [] })),
  (prop) => {
    const { b, tags } = prop
    const byId = new Map(b.issues.map((i) => [i.id, i]))

    // GATE 1 (deterministic): shape + confidence + must already exist in the library.
    let proposedCount = 0, droppedNotInLib = 0, droppedLowConf = 0
    const survivors = []
    for (const t of tags) {
      const issue = byId.get(t.id)
      if (!issue) continue
      const raw = Array.isArray(t.codes) ? t.codes : []
      proposedCount += raw.length
      // NO CONFIDENCE GATE - deliberate, and the reason is worth keeping.
      //
      // Two runs over the same 120 issues showed this number tracks the PROMPT, not any belief:
      //   run 1, prompt said "below 0.7 means you are guessing" -> every value came back 0.70-0.72
      //   run 2, prompt said "spread them honestly"             -> every value came back 0.20-0.33
      // Same issues, largely the same codes (34 of 36 in the library), opposite numbers. A gate on
      // this is a gate on my own wording, and at 0.6 it silently discarded all 76 proposed codes.
      //
      // Confidence is still collected and reported, because the spread is a useful smell test for a
      // misfiring prompt. It just does not decide anything. GATE 2 does the judging, against the
      // library's own definition text - evidence the model cannot talk itself into or out of.
      const defs = {}
      const kept = []
      for (const c0 of raw) {
        const c = String(c0).trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
        if (!CODE_RE.test(c) || !(c in LIB)) { droppedNotInLib++; continue }
        kept.push(c)
        defs[c] = LIB[c]
      }
      if (!kept.length) continue
      survivors.push({
        id: t.id, title: issue.title, description: issue.description,
        rationale: t.rationale, confidence: t.confidence, codes: kept, defs,
      })
    }

    const stats = {
      make: b.make, model: b.model, issues: b.issues.length,
      proposedCount, droppedLowConf, droppedNotInLib,
      survivedGate1: survivors.reduce((s, x) => s + x.codes.length, 0),
    }
    if (!survivors.length) return { ...stats, confirmed: [] }

    // GATE 2 (adversarial): semantic fit against the library's own definition.
    return agent(verifyPrompt(b, survivors), { label: 'verify:' + b.make + ' ' + b.model, phase: 'Verify', schema: VERIFY_SCHEMA })
      .then((v) => {
        const rulings = (v && Array.isArray(v.rulings)) ? v.rulings : []
        const byRuling = new Map(rulings.map((r) => [r.id, r]))
        const confirmed = []
        for (const s of survivors) {
          const r = byRuling.get(s.id)
          if (!r) continue // No ruling is a reject, never a pass. Silence must not publish a code.
          const keep = (Array.isArray(r.keep) ? r.keep : [])
            .map((c) => String(c).trim().toUpperCase().replace(/[^A-Z0-9]/g, ''))
            .filter((c) => s.codes.includes(c))
          if (!keep.length) continue
          confirmed.push({ id: s.id, make: b.make, model: b.model, title: s.title, codes: keep, reason: r.reason, _confidence: s.confidence })
        }
        return { ...stats, confirmed }
      })
  }
)

const all = []
let totProposed = 0, totGate1 = 0
for (const r of perBatch.filter(Boolean)) {
  totProposed += r.proposedCount
  totGate1 += r.survivedGate1
  const codes = r.confirmed.reduce((s, x) => s + x.codes.length, 0)
  log(r.make + ' ' + r.model + ': ' + r.confirmed.length + '/' + r.issues + ' issues tagged, ' + codes + ' codes kept (proposed ' + r.proposedCount + ', gate1 ' + r.survivedGate1 + ', not-in-library ' + r.droppedNotInLib + ', low-conf ' + r.droppedLowConf + ')')
  for (const c of r.confirmed) all.push(c)
}
const totalCodes = all.reduce((s, x) => s + x.codes.length, 0)
log('TOTAL: ' + all.length + ' issues tagged with ' + totalCodes + ' codes | proposed ' + totProposed + ' -> library-gated ' + totGate1 + ' -> confirmed ' + totalCodes)

return { result: { tagged: all, stats: { batches: BATCHES.length, proposed: totProposed, survivedLibraryGate: totGate1, confirmedCodes: totalCodes, taggedIssues: all.length } } }
