/**
 * RESEARCH WAVE 3 (DEEPEN) — Mercedes-Benz depth + the modern-EV thin set.
 *
 * Two groups:
 *  - Mercedes-Benz (7.9 avg over 32 models, the largest untouched thin make):
 *    volume models GLB/GLA/E-Class/CLA plus the EQ line, which sits at 1-3 issues each.
 *  - Cross-make modern vehicles that are thin AND high-search: Cybertruck, Grand Cherokee L,
 *    EV9, Ioniq 5 N, i7. Several have coverage only for their launch year.
 *
 *   Workflow({ scriptPath: 'scripts/_wf-research-wave3-deepen.js' })
 *
 * PROMPT FIX vs wave 2 — see feedback_research_source_diversity in memory.
 * Wave 2 named "CarComplaints" in its source list; its citations collapsed to 3% forums /
 * 40% aggregators, versus wave 1's 27% forums across 16 communities. This wave:
 *   1. names ONLY owner communities and official sources — no aggregator is named
 *   2. requires at least one non-aggregator citation per issue
 *   3. bans raw api.nhtsa.gov endpoints as a citation outright (a soft "prefer" was ignored
 *      last time and the API share went UP to 57%)
 *   4. has the verifier REPORT source quality (hasOwnerCommunitySource / hasNonAggregatorSource)
 *      so the mix is measurable. Only hasNonAggregatorSource is gated on — gating on forums
 *      would wrongly kill genuine recall-only issues on brand-new vehicles.
 *
 * DEPLOY HOLD IS ACTIVE. Nothing here writes to the DB. Save to data/research-wave3-<date>.json
 * and stop. See data/_SESSION-STATE-known-issues.md for the hold and the deploy sequence.
 *
 * Exclusions exported by scripts/_export-research-exclusions-wave3.js. Embedded rather than
 * passed via the `args` global, which is unreliable.
 */
export const meta = {
  name: 'research-wave3-deepen',
  description: 'Mercedes-Benz depth + modern-EV thin set: forum-weighted discover + adversarial verify',
  phases: [
    { title: 'Discover' },
    { title: 'Verify' },
  ],
}

const EXCLUSIONS = [
  {
    "make": "Mercedes-Benz",
    "model": "GLB",
    "existingTitles": [
      "8G-DCT Transmission Shudder",
      "Carbon Buildup on Intake Valves (Direct-Injection M260) Causing Rough Idle and Power Loss",
      "Emergency Call (eCall) System Disabled by Communication Module SIM Software Error (Recall 22V365)",
      "ESP/ABS Control Unit Damage Disabling Stability Control and Anti-Lock Brakes (Recall 22V679)",
      "Front Axle Carrier (Integral Carrier) Corrosion / Failure (Recall 21V990)",
      "M260 Cylinder Head Exhaust Valve Seat/Guide Wear (Misfires, Compression Loss)",
      "MBUX Infotainment Freeze",
      "Panoramic Sunroof Creak",
      "Rearview Camera Fails to Display (Black Screen) Due to Software Error (Recall 22V232)",
      "Water Intrusion Into Front Footwells Causing Blank Instrument Cluster or Engine Stall (Recall 20V246)"
    ]
  },
  {
    "make": "Mercedes-Benz",
    "model": "GLA",
    "existingTitles": [
      "12V Battery Parasitic Drain / No-Start After Sitting",
      "7G-DCT (724.0) Dual-Clutch Transmission Shudder & Mechatronics Failure",
      "Diesel EGR/DPF Clogging & AdBlue (SCR) System Faults (OM651/OM654)",
      "M270/M274 Timing Chain Stretch & Tensioner Wear (Cold-Start Rattle)",
      "MBUX/COMAND Infotainment Black Screen & Reboot (NHTSA Recall 21V354)",
      "Panoramic Sunroof Spontaneous Shattering / Front Roof Panel Detachment Recall",
      "Rear Differential Carrier Whine/Clunk on 4MATIC Models",
      "Transfer Case Noise (AWD Models)",
      "Turbo Coolant Line Leak",
      "Water Pump Failure"
    ]
  },
  {
    "make": "Mercedes-Benz",
    "model": "E-Class",
    "existingTitles": [
      "48V Integrated Starter-Generator / DC-DC Converter Failure Causing Sudden Power Loss and No-Restart",
      "7G-Tronic Conductor Plate Failure",
      "Air Suspension Failure (W212)",
      "COMAND Infotainment System Freeze",
      "Crankshaft Position Sensor Failure",
      "Fuel Pump Delivery Module Failure Leading to Extended Crank, Stalling, or No-Start",
      "M272 Balance Shaft Gear Wear",
      "MBUX / Instrument Cluster Black Screen, Rebooting, and Rear Camera Inoperative Due to Infotainment Software Faults",
      "OM642 Diesel Oil Cooler Leak"
    ]
  },
  {
    "make": "Mercedes-Benz",
    "model": "CLA",
    "existingTitles": [
      "7G-DCT (724.0) Dual-Clutch Transmission Shudder and Mechatronics Failure",
      "Auxiliary (Backup) Battery Malfunction Warning",
      "COMAND Infotainment Freeze",
      "Front Suspension Strut Noise",
      "M270/M274 Camshaft Breakage from Defective Weld (Engine Stall) — Safety Recall",
      "Panoramic Roof Front Panel Detachment — Safety Recall",
      "Premature Rear Brake Wear and Caliper Piston Sticking",
      "Turbo Oil Leak (M270)",
      "Water Leaks into Trunk and Rear Footwell (Vent Flap / Seam Sealing)"
    ]
  },
  {
    "make": "Mercedes-Benz",
    "model": "GLK-Class",
    "existingTitles": [
      "Diesel Injector Leak and Black Death (OM651)",
      "Front Suspension Strut Mount Noise and Wear"
    ]
  },
  {
    "make": "Mercedes-Benz",
    "model": "EQE",
    "existingTitles": [
      "DC Fast Charging Speed Inconsistency",
      "Over-the-Air Software Update Failures"
    ]
  },
  {
    "make": "Mercedes-Benz",
    "model": "EQB",
    "existingTitles": [
      "Brake Pedal Feel Inconsistency with Regenerative Braking",
      "Infotainment System Lag and Crashes",
      "Real-World Range Significantly Below EPA Rating"
    ]
  },
  {
    "make": "Mercedes-Benz",
    "model": "EQS SUV",
    "existingTitles": [
      "Air Suspension Compressor Excessive Noise"
    ]
  },
  {
    "make": "Tesla",
    "model": "Cybertruck",
    "existingTitles": [
      "Cybertruck Accelerator Pedal Pad Detachment (April 2024 Recall)"
    ]
  },
  {
    "make": "Jeep",
    "model": "Grand Cherokee L",
    "existingTitles": [
      "eTorque Mild Hybrid 48V Battery and Stop/Start Malfunction",
      "Panoramic Sunroof Drain Blockage and Water Leak",
      "Uconnect 5 Infotainment Freezing and Lag"
    ]
  },
  {
    "make": "Kia",
    "model": "EV9",
    "existingTitles": [
      "ICCU Failure Causing 12V Battery Drain and Loss of Drive Power",
      "Instrument Panel Screen Goes Blank Due to Software Error",
      "Software Update and Infotainment Issues",
      "Windshield Wipers Stopping During Snow and Ice Conditions"
    ]
  },
  {
    "make": "Hyundai",
    "model": "Ioniq 5 N",
    "existingTitles": [
      "12V Auxiliary Battery Parasitic Drain",
      "High-Pitched Motor Whine at Highway Speeds",
      "Integrated Charging Control Unit (ICCU) Failure",
      "Regenerative-to-Friction Brake Transition Clunk and Noise"
    ]
  },
  {
    "make": "BMW",
    "model": "i7",
    "existingTitles": [
      "Air Suspension Calibration and Sensor Issues",
      "G70 i7 ADCAM Assistance-Limit Diagnosis",
      "G70 i7 Comfort-Access Faults after Remote Upgrade"
    ]
  }
]

const TARGETS = [
  { make: 'Mercedes-Benz', model: 'GLB',              yearsHint: '2020-present', note: 'X247, M260 2.0T (GLB250) and AMG GLB35, 8G-DCT dual-clutch, optional third row. FWD/4MATIC.', forums: 'mbworld.org, benzworld.org, GLB-specific subforums, mbclub.co.uk, r/mercedes_benz' },
  { make: 'Mercedes-Benz', model: 'GLA',              yearsHint: '2015-present', note: 'X156 2015-2020 (M270 2.0T, 7G-DCT) and H247 2021+ (M260, 8G-DCT). Includes AMG GLA35/45.', forums: 'mbworld.org, benzworld.org, GLA forums, mbclub.co.uk, r/mercedes_benz' },
  { make: 'Mercedes-Benz', model: 'E-Class',          yearsHint: '2003-present', note: 'W211 2003-2009 (SBC brake era, airmatic), W212 2010-2016 (M276/OM642, 7G-Tronic), W213 2017-2023 (M264/M256 mild hybrid, 9G-Tronic), W214 2024+. Very broad used market.', forums: 'mbworld.org, benzworld.org, peachparts.com, mbclub.co.uk, r/mercedes_benz' },
  { make: 'Mercedes-Benz', model: 'CLA',              yearsHint: '2014-present', note: 'C117 2014-2019 (M270 2.0T, 7G-DCT) and C118 2020+ (M260, 8G-DCT). Includes AMG CLA35/45.', forums: 'mbworld.org, benzworld.org, CLA forums (cla-class specific), r/mercedes_benz' },
  { make: 'Mercedes-Benz', model: 'GLK-Class',        yearsHint: '2010-2015',    note: 'X204. GLK350 with M272/M276 V6 and the GLK250 BlueTEC OM651 diesel, 7G-Tronic. Strong used-market volume and we have only 2 issues.', forums: 'mbworld.org, benzworld.org, GLK forums, peachparts.com' },
  { make: 'Mercedes-Benz', model: 'EQE',              yearsHint: '2023-present', note: 'V295 electric sedan, EVA2 platform, 90.6 kWh pack, EQE 350+/500 4MATIC and AMG EQE.', forums: 'mbworld.org EQ subforums, r/MercedesEQ, MBWorld EQE threads, EV owner communities' },
  { make: 'Mercedes-Benz', model: 'EQB',              yearsHint: '2022-present', note: 'X243 electric compact SUV based on the GLB, 70.5 kWh pack, EQB 250+/300/350 4MATIC.', forums: 'mbworld.org EQ subforums, r/MercedesEQ, EQB owner threads' },
  { make: 'Mercedes-Benz', model: 'EQS SUV',          yearsHint: '2023-present', note: 'X296 electric SUV, EVA2, 108 kWh pack, EQS 450+/450 4MATIC/580. Distinct from the EQS sedan (V297).', forums: 'mbworld.org EQ subforums, r/MercedesEQ, EQS SUV owner threads' },
  { make: 'Tesla',         model: 'Cybertruck',       yearsHint: '2024-present', note: '48V architecture, steer-by-wire, stainless exoskeleton, 4680 cells, Cyberbeast tri-motor. NOTE: our DB covers only 2024 — 2025/2026 are blank, and this vehicle has had many recalls.', forums: 'cybertruckownersclub.com, teslamotorsclub.com, r/cybertruck, r/TeslaLounge' },
  { make: 'Jeep',          model: 'Grand Cherokee L', yearsHint: '2021-present', note: 'WL75 three-row, 3.6 Pentastar eTorque and 5.7 Hemi, ZF 8HP. Distinct from the two-row WL Grand Cherokee and from the older WK2.', forums: 'jeepgarage.org, Grand Cherokee L owner forums, r/GrandCherokee, wlforums' },
  { make: 'Kia',           model: 'EV9',              yearsHint: '2024-present', note: 'E-GMP three-row electric SUV, 99.8 kWh pack, 800V architecture, Light/Wind/Land/GT-Line.', forums: 'kiaevforums.com, EV9 owner forums, r/KiaEV9, r/electricvehicles' },
  { make: 'Hyundai',       model: 'Ioniq 5 N',        yearsHint: '2024-present', note: 'High-performance E-GMP variant, 84 kWh, N Grin Boost, simulated shift. NOTE: our coverage is 2024 only — 2025/2026 blank. Distinct from the standard Ioniq 5.', forums: 'ioniqforum.com, Ioniq 5 N owner threads, r/Ioniq5, r/HyundaiIoniq5' },
  { make: 'BMW',           model: 'i7',               yearsHint: '2023-present', note: 'G70 electric 7 Series, 101.7 kWh pack, eDrive50/xDrive60/M70, 31-inch Theatre Screen, Integrated Active Steering.', forums: 'bimmerpost i7/G70 forums, bimmerfest, r/BMWi, r/BMW' },
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
    hasNonAggregatorSource: { type: 'boolean' },
    hasOwnerCommunitySource: { type: 'boolean' },
    isDuplicate: { type: 'boolean' },
    reason: { type: 'string' },
  },
  required: ['isReal', 'confidence', 'hasLiveCitation', 'hasNonAggregatorSource', 'hasOwnerCommunitySource', 'isDuplicate', 'reason'],
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
    `This is a US-market vehicle. Your sources, in priority order:`,
    `  1. OWNER COMMUNITIES — go here first and spend real effort: ${t.forums}. This is where the detail lives that never reaches a government summary: exact engine codes, which model years actually fail, what the dealer tried first, what finally fixed it.`,
    `  2. OFFICIAL — NHTSA recalls and complaints, manufacturer TSBs and service bulletins, OEM service documentation.`,
    ``,
    `WE ALREADY HAVE THESE ${existing.length} ISSUES. Do NOT return any of them, and do not return a lightly-reworded restatement of one:`,
    existing.length ? existing.map((s) => `  - ${s}`).join('\n') : '  (none)',
    ``,
    `Use web search to find 6-10 ADDITIONAL well-documented, recurring issues real owners report that are NOT in the list above. Go deeper than the obvious headline failures: cover specific engines, transmissions, model-year ranges, and subsystems (electrical, HVAC, suspension, interior wear, infotainment, charging and high-voltage systems on EVs) that the existing list misses.`,
    ``,
    `For EACH issue provide: title (specific - name the component and the failure mode, not a vague symptom), description (what fails and why), solution (the real fix), severity (high/medium/low), category (one of: engine, transmission, drivetrain, electrical, brakes, suspension, cooling, fuel, interior, exterior, body, safety, exhaust, steering, hvac, emissions, other), years (specific model years affected, integers), trims/engines when the issue is specific to them (use exact codes such as M260, OM651, M276 - an issue on one engine is often absent on another), symptoms[], dtcCodes[] when applicable (real codes only), estimatedCostLow/High in USD when known, and citations[].`,
    ``,
    `CITATION RULES — these are hard requirements, not preferences:`,
    `  * At least ONE citation per issue must be an owner community thread or an official source. An issue supported ONLY by third-party problem-aggregator sites does not qualify.`,
    `  * NEVER cite a raw api.nhtsa.gov endpoint. Those return JSON a human cannot read. Cite the human-readable nhtsa.gov page instead.`,
    `  * Cite ONLY pages you actually found and opened in search results. Do NOT construct or guess a URL from a pattern — fabricated URLs have polluted this database before.`,
    `  * A forum thread that you found in search results counts even if the site blocks automated fetching.`,
    ``,
    `Accuracy over volume: 4 solid issues beat 10 with two invented. A single isolated complaint is an anecdote, not a known issue — look for a recurring pattern across multiple owners. Never invent an issue or a citation. Respond ONLY via the StructuredOutput tool.`,
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
    `(1) Is this a genuine, RECURRING issue for THIS specific model and THESE years - not copied from a platform sibling, a different generation, or a different engine? These vehicles share platforms heavily (GLB/EQB, GLA/CLA, Ioniq 5/EV9 on E-GMP, Grand Cherokee L/WL), so a real problem on one is NOT automatically a problem on this nameplate. A single isolated complaint is an anecdote — refute it as a "known issue" unless multiple independent owners report the same failure.`,
    `(2) Do the cited URLs actually exist, resolve, and support the claim? A URL that 404s is not a live citation. A 403 from a forum that clearly exists DOES count as live.`,
    `(3) Are the model years plausible for this nameplate and powertrain? Several of these vehicles are only 1-3 years old — reject year ranges that predate the model.`,
    `(4) Is this substantively the same problem as one already in our database above (isDuplicate)?`,
    ``,
    `Also classify the sources: hasOwnerCommunitySource (at least one citation is a real owner forum, club, or model-specific community thread), and hasNonAggregatorSource (at least one citation is an owner community OR an official source such as NHTSA/TSB/OEM — as opposed to third-party problem-aggregator sites).`,
    ``,
    `Return: isReal, confidence 0-1, hasLiveCitation, hasNonAggregatorSource, hasOwnerCommunitySource, isDuplicate, and a one-sentence reason. If the citations look fabricated, or you cannot corroborate a recurring pattern, isReal=false.`,
  ].join('\n')
}

log(`Wave 3 deepen: ${TARGETS.length} models — Mercedes-Benz depth + modern-EV thin set`)

const perModel = await pipeline(
  TARGETS,
  (t) => agent(discoverPrompt(t), { label: `discover:${t.make} ${t.model}`, phase: 'Discover', schema: DISCOVER_SCHEMA })
    .then((d) => ({ t, candidates: (d && Array.isArray(d.candidates)) ? d.candidates : [] })),
  (disc) => {
    const { t, candidates } = disc
    if (!candidates.length) return { make: t.make, model: t.model, found: 0, confirmed: [], forumBacked: 0 }
    return parallel(candidates.map((c) => () =>
      agent(verifyPrompt(t, c), { label: `verify:${t.model}`, phase: 'Verify', schema: VERDICT_SCHEMA })
        .then((v) => {
          if (!v) return null
          if (!v.isReal || !v.hasLiveCitation || v.isDuplicate) return null
          if ((v.confidence ?? 0) < 0.7) return null
          if (!v.hasNonAggregatorSource) return null
          if (!Array.isArray(c.citations) || c.citations.length === 0) return null
          return {
            ...c, make: t.make, model: t.model,
            _verdictConfidence: v.confidence,
            _verdictReason: v.reason,
            _hasOwnerCommunitySource: v.hasOwnerCommunitySource,
          }
        })
    )).then((arr) => {
      const ok = arr.filter(Boolean)
      return { make: t.make, model: t.model, found: candidates.length, confirmed: ok, forumBacked: ok.filter((x) => x._hasOwnerCommunitySource).length }
    })
  }
)

const confirmed = []
const perModelStats = {}
let totalFound = 0, totalForumBacked = 0
for (const r of perModel.filter(Boolean)) {
  totalFound += r.found
  totalForumBacked += r.forumBacked
  perModelStats[`${r.make} ${r.model}`] = { found: r.found, confirmed: r.confirmed.length, forumBacked: r.forumBacked }
  for (const c of r.confirmed) confirmed.push(c)
}

for (const [k, v] of Object.entries(perModelStats)) log(`${k}: ${v.confirmed}/${v.found} confirmed (${v.forumBacked} forum-backed)`)
log(`TOTAL: ${confirmed.length} confirmed of ${totalFound} candidates | ${totalForumBacked} forum-backed (${confirmed.length ? Math.round(100 * totalForumBacked / confirmed.length) : 0}%)`)

return { result: { confirmed, stats: { models: TARGETS.length, found: totalFound, confirmed: confirmed.length, forumBacked: totalForumBacked, perModel: perModelStats } } }
