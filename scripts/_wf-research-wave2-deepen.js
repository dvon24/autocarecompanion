/**
 * RESEARCH WAVE 2 (DEEPEN) — Volvo / MINI / Buick / Cadillac / Mitsubishi.
 *
 * Why: after the Lexus/Infiniti/Acura wave, these are the thinnest major makes
 * (MINI 5.6, Buick 6.4, Volvo 6.4, Mitsubishi 6.5, Cadillac 7.2 avg issues per
 * model). Targets are CURRENT-LINEUP VOLUME models specifically — the ones with
 * real search demand — not the dead nameplates that drag those averages down.
 * Chevrolet is deliberately excluded: Sol's parts audit is working toward it.
 *
 *   Workflow({ scriptPath: 'scripts/_wf-research-wave2-deepen.js' })
 *
 * Same discover -> adversarial-verify pipeline as _wf-research-lia-deepen.js.
 * Output matches _persist-known-issues-run.js: { result: { confirmed[], stats } }.
 *
 * DEPLOY HOLD IS ACTIVE. Nothing here writes to the DB. Save the result to
 * data/research-wave2-<date>.json and stop. See data/_SESSION-STATE-known-issues.md
 * for the hold terms and the deploy sequence for when Sol's audit clears Chevrolet.
 *
 * Exclusions are existing published + pending_review titles, exported by
 * scripts/_export-research-exclusions-wave2.js. Embedded rather than passed via
 * the `args` global, which is unreliable.
 */
export const meta = {
  name: 'research-wave2-deepen',
  description: 'Deepen Volvo/MINI/Buick/Cadillac/Mitsubishi current-lineup volume models: discover + adversarial verify',
  phases: [
    { title: 'Discover' },
    { title: 'Verify' },
  ],
}

const EXCLUSIONS = [
  {
    "make": "Volvo",
    "model": "XC40",
    "existingTitles": [
      "Fuel Pump Control Module Failure",
      "Power Tailgate Wiring Harness Break",
      "Recharge EV 12V Battery Drain and No-Start Condition",
      "Sensus Infotainment System Freezing and Random Reboots",
      "T4/T5 Turbocharger Oil Feed Line Leak"
    ]
  },
  {
    "make": "Volvo",
    "model": "XC60",
    "existingTitles": [
      "A/C Compressor Clutch and Bearing Failure",
      "Aisin TF-80SC 8-Speed Transmission Shudder and Harsh Shifting",
      "Four-Corner Air Suspension Compressor and Strut Failure",
      "PCV Oil Trap/Separator Failure",
      "Rear Differential Mounting Bushing Wear (AWD)",
      "Sensus/Google Infotainment System Random Reboots and Black Screen",
      "T5/T6 Engine Excessive Oil Consumption",
      "Timing Belt Tensioner Failure (3.2L I6)"
    ]
  },
  {
    "make": "Volvo",
    "model": "S60",
    "existingTitles": [
      "8-Speed Automatic Delayed Engagement and Hesitation",
      "Electronic Throttle Module (ETM) Failure",
      "Rear Electronic Module (REM) Water Damage",
      "Rear Shock Tower and Trunk Floor Corrosion",
      "T5/T6 PCV Oil Trap System Failure and Oil Consumption",
      "T6 Twin-Charged Engine Supercharger Drive Belt and Turbo Oil Line Leak",
      "Thermostat Housing Coolant Leak (Turbo 5-Cylinder)",
      "Upper Engine Mount (Torque Rod) Failure"
    ]
  },
  {
    "make": "MINI",
    "model": "Countryman",
    "existingTitles": [
      "Aisin 8-Speed Automatic Transmission Shudder",
      "ALL4 AWD System Coupling and Transfer Case Issues",
      "Electric Water Pump and Thermostat Failure"
    ]
  },
  {
    "make": "MINI",
    "model": "Hardtop 4 Door",
    "existingTitles": [
      "Aisin 6-Speed Automatic Transmission Mechatronic Issues",
      "B38/B48 Engine Timing Chain Stretch and Rattle",
      "Rear Door Weatherstrip Water Leak",
      "Rear Hatch Wiring Harness Fatigue and Breakage"
    ]
  },
  {
    "make": "MINI",
    "model": "Clubman",
    "existingTitles": [
      "B46/B48 Oil Filter Housing Gasket Leak",
      "Power Window Regulator Failure",
      "Premature Clutch and Dual-Mass Flywheel Failure",
      "Rear Barn Door Latch and Hinge Failure (R55)"
    ]
  },
  {
    "make": "Buick",
    "model": "Envision",
    "existingTitles": [
      "Top-End Engine Ticking from Hydraulic Lash Adjusters (LSY 2.0T)"
    ]
  },
  {
    "make": "Buick",
    "model": "Encore GX",
    "existingTitles": [
      "ECM Ignition Timing Fault Causing Engine Knock After Auto Stop/Start (Recall A242435780)",
      "Electronic Brake Boost Sensor Connection Failure - Loss of Power Assist (Recall 20V588)",
      "Encore GX CVT / 9-Speed Hesitation and Shudder",
      "False \"Shift to Park\" Warning / Park Switch Failure (TSB 23-NA-119)",
      "Incorrect Catalytic Converter Installed at Factory (Emissions Recall A202317281)",
      "Instrument Panel Display Goes Blank While Driving (Recall 23V744 - VCU Software)"
    ]
  },
  {
    "make": "Cadillac",
    "model": "Escalade",
    "existingTitles": [
      "10-Speed Harsh Shift or Shudder Needs Cooler-Line and Data Diagnosis",
      "8L90 Light-Throttle Shudder Has a Specific Fluid-Exchange Procedure",
      "Brake Line Corrosion and Failure (Rust Belt)",
      "Confirmed AFM Lifter Collapse Requires Generation-Specific Diagnosis",
      "Instrument Cluster Gauge Failure (Stepper Motors)",
      "L86 Oil Use Needs a Measured Consumption and PCV-Path Diagnosis",
      "Service Suspension or Low Ride Height Needs Level-Control Diagnosis",
      "Transfer Case Encoder Motor and Chain Failure"
    ]
  },
  {
    "make": "Cadillac",
    "model": "XT5",
    "existingTitles": [
      "3.6L V6 Timing Chain Issues (XT5 V6 models)",
      "8-Speed / 9-Speed Transmission Shudder and Harsh Shifting",
      "Electronic Gear Selector Park-Switch Fault - Persistent 'Shift to Park' Message / Won't Power Down (TSB 19-NA-206)",
      "Front Brake Rotor Warping and Pedal Pulsation",
      "Low-Speed TCC Shudder Must Be Confirmed Before a Fluid Drain and Fill",
      "Power Liftgate Strut Failure and Erratic Operation",
      "Recall 20V639: AWD Fuel-Pump Mixing-Tube Burr May Cause a Stall"
    ]
  },
  {
    "make": "Cadillac",
    "model": "XT4",
    "existingTitles": [
      "2.0L Turbo Excessive Oil Consumption",
      "2.0T LSY Engine - PCV and Turbo Coolant Line Issues",
      "9T50 Surge or Shudder Requires a Transmission Glycol Test",
      "Blank Radio Display or No Audio Is Limited to Early Radio Software",
      "Front-Engine Rattle May Require Timing-Chain Tensioner Inspection"
    ]
  },
  {
    "make": "Mitsubishi",
    "model": "Mirage",
    "existingTitles": [
      "AC Evaporator Core Leak",
      "CVT Reliability and Longevity Concerns"
    ]
  },
  {
    "make": "Mitsubishi",
    "model": "Eclipse Cross",
    "existingTitles": [
      "CVT Shudder During Acceleration",
      "Infotainment Touchpad and Screen Issues"
    ]
  }
]

const TARGETS = [
  { make: 'Volvo',      model: 'XC40',            yearsHint: '2019-present', note: 'CMA platform, B4/B5 mild-hybrid and Recharge EV (later renamed EX40). Volume compact SUV.', forums: 'SwedeSpeed, volvoforums.org, volvoxc40forum, r/Volvo' },
  { make: 'Volvo',      model: 'XC60',            yearsHint: '2010-present', note: 'Gen1 2010-2017 (incl. the 3.2/T6 era and Drive-E T5/T6); Gen2 2018+ SPA platform, B5/B6/T8 Recharge PHEV. Volvo best-seller.', forums: 'SwedeSpeed, volvoforums.org, MVS (matthewsvolvosite) forums' },
  { make: 'Volvo',      model: 'S60',             yearsHint: '2001-present', note: 'P2 2001-2009 (5-cyl white-block), P3 2011-2018, SPA 2019+ (T5/T6/T8 Recharge). Includes Polestar-tuned variants.', forums: 'SwedeSpeed, volvoforums.org, MVS forums' },
  { make: 'MINI',       model: 'Countryman',      yearsHint: '2011-present', note: 'R60 2011-2016 (N16/N18 Prince engines, timing chain era), F60 2017-2024 (B38/B46/B48), U25 2025+. Largest MINI.', forums: 'North American Motoring (motoringalliance), mini2.com, r/MINI' },
  { make: 'MINI',       model: 'Hardtop 4 Door',  yearsHint: '2015-present', note: 'F55 2015-2023 and J01/F66 2024+. B38 1.5 three-cylinder and B48 2.0 four. Distinct from the 2-door F56.', forums: 'North American Motoring, mini2.com, r/MINI' },
  { make: 'MINI',       model: 'Clubman',         yearsHint: '2008-present', note: 'R55 2008-2014 (N12/N14/N18 Prince), F54 2016-2024 (B38/B46/B48, incl. JCW ALL4).', forums: 'North American Motoring, mini2.com' },
  { make: 'Buick',      model: 'Envision',        yearsHint: '2016-present', note: 'Gen1 2016-2020 (2.5 LCV / 2.0T LTG, China-built), Gen2 2021+ (2.0T LSY). NOTE: our DB currently covers ONLY 2025-2026 — the 2016-2024 cars are entirely uncovered, so dig hard there.', forums: 'BuickForums, GM-trucks.com, Buick Envision Forum, r/Buick' },
  { make: 'Buick',      model: 'Encore GX',       yearsHint: '2020-present', note: '1.2L LIH and 1.3L L3T three-cylinder turbos with CVT (VT40) or 9AT. Distinct from the older Encore.', forums: 'BuickForums, Encore GX Forum, GM-trucks.com' },
  { make: 'Cadillac',   model: 'Escalade',        yearsHint: '2002-present', note: 'GMT800/900, K2XX 2015-2020 (6.2 L86, 8L90 8-speed), T1XX 2021+ (6.2 L87 incl. the rod-bearing issue era, 3.0 Duramax LM2/LZ0, independent rear suspension, 38-inch OLED). High demand.', forums: 'GM-trucks.com, CadillacForums, Escalade Forum, r/Cadillac' },
  { make: 'Cadillac',   model: 'XT5',             yearsHint: '2017-present', note: '3.6 LGX V6 and 2.0T LSY, 9-speed 9T65. Cadillac volume SUV, replaced the SRX.', forums: 'CadillacForums, CadillacSociety, XT5 owner forums' },
  { make: 'Cadillac',   model: 'XT4',             yearsHint: '2019-present', note: '2.0T LSY with 9-speed. Compact luxury SUV.', forums: 'CadillacForums, CadillacSociety, XT4 owner forums' },
  { make: 'Mitsubishi', model: 'Mirage',          yearsHint: '2014-present', note: 'Hatch and G4 sedan, 3A92 1.2 three-cylinder with CVT (JATCO). Cheapest new car in the US market — high search volume.', forums: 'mitsubishi-forums.com, Mirage Forum (mirageforum.com), r/Mitsubishi' },
  { make: 'Mitsubishi', model: 'Eclipse Cross',   yearsHint: '2018-present', note: '1.5T 4B40 with CVT, later 2.4 PHEV. S-AWC available.', forums: 'mitsubishi-forums.com, Eclipse Cross Forum, r/Mitsubishi' },
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
          category: { type: 'string', enum: ['engine', 'transmission', 'drivetrain', 'electrical', 'brakes', 'suspension', 'cooling', 'fuel', 'interior', 'exterior', 'body', 'safety', 'exhaust', 'steering', 'hvac', 'emissions', 'other'] },
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
    isDuplicate: { type: 'boolean' },
    reason: { type: 'string' },
  },
  required: ['isReal', 'confidence', 'hasLiveCitation', 'isDuplicate', 'reason'],
}

function existingFor(t) {
  const e = EXCLUSIONS.find((x) => x.make === t.make && x.model === t.model)
  return (e && e.existingTitles) || []
}

function discoverPrompt(t) {
  const existing = existingFor(t)
  return [
    `You research REAL, documented known issues for a specific car. Vehicle: ${t.make} ${t.model} (${t.yearsHint}). Context: ${t.note}`,
    ``,
    `This is a US-market vehicle. Use NHTSA complaints and recalls (nhtsa.gov), manufacturer TSBs, CarComplaints, and the owner communities that actually cover this model: ${t.forums}.`,
    ``,
    `WE ALREADY HAVE THESE ${existing.length} ISSUES. Do NOT return any of them, and do not return a lightly-reworded restatement of one:`,
    existing.length ? existing.map((s) => `  - ${s}`).join('\n') : '  (none)',
    ``,
    `Use web search to find 6-10 ADDITIONAL well-documented, recurring issues real owners report that are NOT in the list above. Go deeper than the obvious headline failures: cover specific engines, transmissions, model-year ranges, and subsystems (electrical, HVAC, suspension, interior wear, infotainment) that the existing list misses. Depth and specificity are the point of this wave — our coverage on this model is unusually shallow and the goal is to fix that.`,
    ``,
    `For EACH issue provide: title (specific - name the component and the failure mode, not a vague symptom), description (what fails and why), solution (the real fix), severity (high/medium/low), category (one of: engine, transmission, drivetrain, electrical, brakes, suspension, cooling, fuel, interior, exterior, body, safety, exhaust, steering, hvac, emissions, other), years (specific model years affected, integers), trims/engines when the issue is specific to them (use exact engine codes such as B48, LSY, L87, 3A92 - an issue on one engine is often absent on another, and these makes share platforms across generations), symptoms[], dtcCodes[] when applicable (real codes only), estimatedCostLow/High in USD when known, and citations[] with at least ONE real, currently-live URL per issue.`,
    ``,
    `CRITICAL ON CITATIONS: cite ONLY pages you actually found and opened in search results. Do NOT construct or guess a URL from a pattern. Fabricated carcomplaints.com and forum URLs have polluted this database before. One real NHTSA complaint page or forum thread you actually saw is worth more than five plausible-looking guesses. Prefer a human-readable nhtsa.gov page over a raw api.nhtsa.gov JSON endpoint.`,
    ``,
    `Accuracy over volume: 4 solid issues beat 10 with two invented. Never invent an issue or a citation. Respond ONLY via the StructuredOutput tool.`,
  ].join('\n')
}

function verifyPrompt(t, c) {
  const existing = existingFor(t)
  return [
    `You are a skeptical automotive fact-checker. DEFAULT TO REFUTING unless the evidence is solid. Vehicle: ${t.make} ${t.model} (${t.yearsHint}).`,
    ``,
    `CLAIM:`,
    `Title: ${c.title}`,
    `Description: ${c.description}`,
    `Years: ${(c.years || []).join(', ')}`,
    `Engines: ${(c.engines || []).join(', ') || '(unspecified)'}`,
    `Cited URLs: ${(c.citations || []).map((x) => x.url).join(' | ') || '(none)'}`,
    ``,
    `ISSUES ALREADY IN OUR DATABASE for this model:`,
    existing.length ? existing.map((s) => `  - ${s}`).join('\n') : '  (none)',
    ``,
    `Use web search to verify:`,
    `(1) Is this a genuine, documented issue for THIS specific model and THESE years - not copied from a platform sibling, a different generation, or a different engine? These makes share platforms heavily (MINI with BMW, Buick and Cadillac with GM, Volvo across SPA/CMA), so a real BMW N20 or GM L87 problem is NOT automatically a problem on this nameplate in these years. Check that the engine and generation actually line up.`,
    `(2) Do the cited URLs actually exist, resolve, and support the claim? Fetch them. A URL that 404s, or that you cannot confirm, is NOT a live citation. A 403 from a forum that clearly exists still counts as live.`,
    `(3) Are the model years plausible for this nameplate and powertrain?`,
    `(4) Is this substantively the same problem as one already in our database above (isDuplicate)?`,
    ``,
    `Return: isReal, confidence 0-1, hasLiveCitation (true ONLY if at least one cited URL is real, reachable, and on-topic), isDuplicate, and a one-sentence reason. If the citations look fabricated, or you cannot corroborate the issue, isReal=false.`,
  ].join('\n')
}

log(`Wave 2 deepen: ${TARGETS.length} models across Volvo / MINI / Buick / Cadillac / Mitsubishi`)

const perModel = await pipeline(
  TARGETS,
  (t) => agent(discoverPrompt(t), { label: `discover:${t.make} ${t.model}`, phase: 'Discover', schema: DISCOVER_SCHEMA })
    .then((d) => ({ t, candidates: (d && Array.isArray(d.candidates)) ? d.candidates : [] })),
  (disc) => {
    const { t, candidates } = disc
    if (!candidates.length) return { make: t.make, model: t.model, found: 0, confirmed: [] }
    return parallel(candidates.map((c) => () =>
      agent(verifyPrompt(t, c), { label: `verify:${t.model}`, phase: 'Verify', schema: VERDICT_SCHEMA })
        .then((v) => {
          if (!v) return null
          if (!v.isReal || !v.hasLiveCitation || v.isDuplicate) return null
          if ((v.confidence ?? 0) < 0.7) return null
          if (!Array.isArray(c.citations) || c.citations.length === 0) return null
          return { ...c, make: t.make, model: t.model, _verdictConfidence: v.confidence, _verdictReason: v.reason }
        })
    )).then((arr) => ({ make: t.make, model: t.model, found: candidates.length, confirmed: arr.filter(Boolean) }))
  }
)

const confirmed = []
const perModelStats = {}
let totalFound = 0
for (const r of perModel.filter(Boolean)) {
  totalFound += r.found
  perModelStats[`${r.make} ${r.model}`] = { found: r.found, confirmed: r.confirmed.length }
  for (const c of r.confirmed) confirmed.push(c)
}

for (const [k, v] of Object.entries(perModelStats)) log(`${k}: ${v.confirmed}/${v.found} confirmed`)
log(`TOTAL: ${confirmed.length} confirmed of ${totalFound} candidates`)

return { result: { confirmed, stats: { models: TARGETS.length, found: totalFound, confirmed: confirmed.length, perModel: perModelStats } } }
