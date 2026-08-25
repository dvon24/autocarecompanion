/**
 * RESEARCH WAVE (DEEPEN) — Lexus / Infiniti / Acura.
 *
 * Why: these are the three thinnest major makes in the DB (avg 4.3 / 4.3 / 4.7
 * issues per model) while their mainstream siblings Toyota and Honda sit at
 * 14.8 and 18.2. High US search demand, low depth. 13 target models.
 *
 *   Workflow({ scriptPath: 'scripts/_wf-research-lia-deepen.js' })
 *
 * Same discover -> adversarial-verify pipeline as _wf-research-de-netnew.js.
 * Output matches _persist-known-issues-run.js: { result: { confirmed[], stats } }.
 *
 * DOWNSTREAM — HELD. Sol is mid parts-audit, so this wave does NOT write to the
 * DB. Save the result to data/research-lia-<date>.json and stop. Persist and
 * promote (both GATED -> Devon) only after the audit clears:
 *   1. node scripts/_persist-known-issues-run.js <out>   -> status='pending_review'
 *   2. node scripts/_promote-pending-review.js           -> URL-liveness gate
 *   3. node scripts/_check-tonight-dupes.js
 * NOTE: there is already a 61-row pending_review backlog on these same makes
 * (Infiniti 49, Lexus 12) awaiting promote — reconcile before persisting more.
 *
 * Exclusions below are the existing published + pending_review titles, exported
 * by scripts/_export-research-exclusions-lia.js. Embedded rather than passed via
 * the `args` global, which is unreliable.
 */
export const meta = {
  name: 'research-lia-deepen',
  description: 'Deepen Lexus/Infiniti/Acura (thinnest major makes): US-sourced discover + adversarial verify',
  phases: [
    { title: 'Discover' },
    { title: 'Verify' },
  ],
}

const EXCLUSIONS = [
  {
    "make": "Lexus",
    "model": "NX",
    "existingTitles": [
      "Airbag Pressure and Acceleration Sensor Failure Prevents Deployment (Recall 18V085000)",
      "Blocked A-Pillar and Sunroof Drain Tubes Causing Cabin Water Leak",
      "CVT Drone and Rubber Band Effect",
      "Infotainment System Lag and Touchpad Issues",
      "Low-Pressure Fuel Pump Failure Causing Engine Stall (Recall 25V028000)",
      "Panoramic View Monitor Rearview Camera Freezes or Goes Blank (Recall 25V744000)",
      "Rearview Camera Image Fails to Display in Reverse (Recall 26V162000)",
      "Steering Column Spiral Cable Weld Failure Deactivates Driver Airbag (Recall 25V040000)",
      "Water Pump Leak on 8AR-FTS Turbo Engine"
    ]
  },
  {
    "make": "Lexus",
    "model": "UX",
    "existingTitles": [
      "12V Auxiliary Battery Drain and Premature Failure",
      "CVT Hesitation and Sluggish Response",
      "Infotainment System Lag and Touchpad Frustration"
    ]
  },
  {
    "make": "Lexus",
    "model": "GS",
    "existingTitles": [
      "Dashboard Melting and Sticky Surface",
      "Power Steering Rack Seal Leak",
      "Water Pump Premature Failure"
    ]
  },
  {
    "make": "Lexus",
    "model": "GX",
    "existingTitles": [
      "AHC (Adaptive Hydraulic) Suspension Leak",
      "Center Differential Lock Actuator Failure",
      "Secondary Air Injection Pump Failure",
      "Secondary Air Injection System Failure Causing Limp Mode on GX 460",
      "Takata Passenger Airbag Inflator May Rupture (Recall 16V340000)",
      "Uneven Ride Height — Vehicle Sits Lower on the Right Side",
      "Vehicle Stability Control Calibration Allows Sideways Skid and Rollover Risk (Recall 10V159000)"
    ]
  },
  {
    "make": "Lexus",
    "model": "ES",
    "existingTitles": [
      "Brake Actuator Buzzing and Grinding Noise",
      "Dashboard Melting and Sticky Surface",
      "Excessive Oil Consumption 2GR-FE Engine",
      "Hybrid Battery Pack Degradation"
    ]
  },
  {
    "make": "Infiniti",
    "model": "Q50",
    "existingTitles": [
      "Accessory Drive Belt Walks Off Pulleys and Shreds (TSB ITB18-012)",
      "Driveshaft Fatigue Fracture Causing Loss of Drive Power (Recall 24V470000)",
      "ECM Software Cuts Fuel After Rapid Acceleration Causing Stall (Recall 21V234000)",
      "Fuel Pump Control Module Software Causes Engine Stall (Recall 17V476000)",
      "Improperly Heat-Treated Steering Knuckle and Rear Axle Housing (Recall 21V402000)",
      "InTouch Infotainment System Lag and Freezing",
      "M274 2.0T Excessive Oil Consumption",
      "M274 2.0T Timing Chain and Camshaft Adjuster Wear",
      "Occupant Classification System Suppresses Passenger Airbag (Recall 16V244000)",
      "Rear-View Camera Image Fails to Display (Recall 21V599000)",
      "VR30DDTT Internal Turbocharger Oil Leak (Emissions Warranty Extension to 10yr/120k)"
    ]
  },
  {
    "make": "Infiniti",
    "model": "Q60",
    "existingTitles": [
      "Accessory Drive Belt Walks Off Pulleys and Shreds (TSB ITB18-012)",
      "Direct Adaptive Steering Feel Disconnect",
      "Fuel Dilution of Engine Oil on Direct-Injected VR30DDTT",
      "Fuel Pump Control Module Software Causes Engine Stall (Recall 17V476000)",
      "InTouch Infotainment Freezing and Slow Response",
      "Rear Seat Belt Locking Mechanism May Not Lock (Recall 20V145000)",
      "Rear-View Camera Image Fails to Display (Recall 19V654000)",
      "VR30DDTT Internal Turbocharger Oil Leak (Emissions Warranty Extension to 10yr/120k)"
    ]
  },
  {
    "make": "Infiniti",
    "model": "G35",
    "existingTitles": [
      "Belt Tension Sensor Harness Wear Prevents Airbag Deployment (Recall 10V175000)",
      "Clogged Sunroof Drains Causing Cabin Water Leaks and Electrical Faults",
      "Crank and Cam Position Sensor Solder Failure Causing Stall and No-Start (Recall 03V455000)",
      "Dashboard Melts, Turns Sticky, and Cracks Causing Windshield Glare",
      "Fuel Filler Hose Cracking Causing Fuel Leak While Refueling (Recall 05V555000)",
      "Fuel Pump Outlet Hose Improperly Attached Causing Stall and Fire Risk (Recall 02V245000)",
      "Headlamp Assemblies Fail FMVSS 108 Photometric Requirements (Recall 06V394000)",
      "OCS Varistor Defect Suppresses Passenger Airbag (Recall 08V521000)",
      "Power Window Regulator Failure",
      "Steering Wheel Lock Malfunction",
      "VQ35DE Oil Consumption"
    ]
  },
  {
    "make": "Infiniti",
    "model": "G37",
    "existingTitles": [
      "Cam Cover Gasket Leak Causing Low Oil Pressure",
      "Clogged Sunroof Drains Causing Cabin Water Leaks and Electrical Faults",
      "Concentric Slave Cylinder Failure (Manual)",
      "Dashboard Melts, Turns Sticky, and Cracks Causing Windshield Glare",
      "Electronic Steering Lock Failure",
      "OCS Varistor Defect Suppresses Passenger Airbag (Recall 08V521000)",
      "Oil Gallery Gasket Leak",
      "Power Window Auto-Reverse Threshold Out of Specification (Recall 11V538000)",
      "Timing Chain Stretch and Guide Wear on VQ37VHR",
      "VQ37VHR Excessive Oil Consumption on Early Engines",
      "VVEL Actuator and Control Module Failure Causing Limp Mode"
    ]
  },
  {
    "make": "Infiniti",
    "model": "QX80",
    "existingTitles": [
      "Certification Label Lists Incorrect Gross Axle Weight Rating (Recall 26V455000)",
      "Driver Airbag Inflator Built With Incorrect Part May Rupture (Recall 14V668000)",
      "Fuel Pressure Sensor Under-Torqued Causing Fuel Leak and Fire Risk (Recall 14V683000)",
      "Fuel Pump Impeller Swells and Binds Causing Engine Stall (Recall 21V373000)",
      "Hydraulic Body Motion Control System Leak",
      "Infotainment System Slow Response",
      "Rear Self-Leveling Air Suspension Sag from Air Spring Leak, Height Sensor, or Compressor Failure",
      "VK56VD Timing Chain Stretch"
    ]
  },
  {
    "make": "Acura",
    "model": "ILX",
    "existingTitles": [
      "8-Speed DCT Shudder and Low-Speed Jerking",
      "Infotainment System Lag and Unresponsive Touchscreen"
    ]
  },
  {
    "make": "Acura",
    "model": "TLX",
    "existingTitles": [
      "9-Speed Automatic Transmission Shudder and Harsh Shifting",
      "Infotainment System Lag, Freezing, and Crashes",
      "Type S Brembo Front Brake Squeal and Premature Pad Wear"
    ]
  },
  {
    "make": "Acura",
    "model": "RDX",
    "existingTitles": [
      "2.0T Engine Oil Dilution from Direct Injection Fuel Wash",
      "AC Compressor Clutch and Bearing Failure",
      "Transmission Harsh Shifting and Hesitation from Stop",
      "True Touchpad Interface Infotainment Reboots and Lag"
    ]
  }
]

const TARGETS = [
  { make: 'Lexus',    model: 'NX',   yearsHint: '2015-present', note: 'AZ10 2015-2021 (2.0T 8AR-FTS / 300h hybrid); AZ20 2022+ (NX250/350/350h/450h+). US market.' },
  { make: 'Lexus',    model: 'UX',   yearsHint: '2019-present', note: 'UX200 / UX250h / 2023+ UX300h, GA-C platform, M20A-FKS. US market.' },
  { make: 'Lexus',    model: 'GS',   yearsHint: '2006-2020',    note: 'GS300/350/450h/460 and GS F (2016+ 2UR-GSE). US market.' },
  { make: 'Lexus',    model: 'GX',   yearsHint: '2003-present', note: 'GX470 (2UZ-FE), GX460 (1UR-FE, incl. the 2010 VSC rollover recall era), 2024+ GX550 (V35A-FTS). Body-on-frame.' },
  { make: 'Lexus',    model: 'ES',   yearsHint: '2007-present', note: 'ES350 (2GR-FE/2GR-FKS), ES300h hybrid, XZ10 2019+. High-volume sedan.' },
  { make: 'Infiniti', model: 'Q50',  yearsHint: '2014-present', note: 'VQ37VHR, VR30DDTT twin-turbo, 3.5h hybrid; Direct Adaptive Steering. US market.' },
  { make: 'Infiniti', model: 'Q60',  yearsHint: '2014-2022',    note: '2014-2015 Q60 = rebadged G37 coupe/convertible; 2017+ CV37 coupe with VR30DDTT.' },
  { make: 'Infiniti', model: 'G35',  yearsHint: '2003-2008',    note: 'V35 sedan/coupe, VQ35DE/VQ35HR. US market.' },
  { make: 'Infiniti', model: 'G37',  yearsHint: '2008-2013',    note: 'V36 sedan/coupe/convertible, VQ37VHR. US market.' },
  { make: 'Infiniti', model: 'QX80', yearsHint: '2011-present', note: 'Z62 (QX56 2011-2013, renamed QX80 for 2014+), VK56VD, RE7R01A 7-speed, hydraulic body-on-frame SUV; 2025+ new gen VR35DDTT.' },
  { make: 'Acura',    model: 'ILX',  yearsHint: '2013-2022',    note: 'K24 2.4 with 8-speed DCT (2016+), early 2.0 with 5AT, 2013-2014 hybrid. Civic-based.' },
  { make: 'Acura',    model: 'TLX',  yearsHint: '2015-present', note: 'UB1/2 2015-2020 (ZF 9-speed 9HP, J35 V6 / K24 2.4 8DCT); UB5 2021+ (K20C 2.0T, Type S 3.0T turbo V6).' },
  { make: 'Acura',    model: 'RDX',  yearsHint: '2007-present', note: 'RDX1 2.3T K23A1, 2013+ J35 V6 with 6AT, 2019+ TC1 K20C1 2.0T with 10-speed AT. Best-selling Acura.' },
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
    `You research REAL, documented known issues for a specific car. Vehicle: ${t.make} ${t.model} (${t.yearsHint}). Context: ${t.note}.`,
    ``,
    `This is a US-market vehicle. Use NHTSA complaints and recalls (nhtsa.gov), manufacturer TSBs, and established owner communities: ClubLexus, Lexus Owners Club, G35Driver, MyG37, infinitiq50.org, AcuraZine, Acura-specific forums, model subreddits, and reputable repair sources.`,
    ``,
    `WE ALREADY HAVE THESE ${existing.length} ISSUES. Do NOT return any of them, and do not return a lightly-reworded restatement of one:`,
    existing.length ? existing.map((s) => `  - ${s}`).join('\n') : '  (none)',
    ``,
    `Use web search to find 6-10 ADDITIONAL well-documented, recurring issues real owners report that are NOT in the list above. Go deeper than the obvious headline failures: cover specific engines, transmissions, model-year ranges, and subsystems (electrical, HVAC, suspension, interior wear, infotainment) that the existing list misses. Depth and specificity are the point of this wave.`,
    ``,
    `For EACH issue provide: title (specific - name the component and the failure mode, not a vague symptom), description (what fails and why), solution (the real fix), severity (high/medium/low), category (one of: engine, transmission, drivetrain, electrical, brakes, suspension, cooling, fuel, interior, exterior, body, safety, exhaust, steering, hvac, emissions, other), years (specific model years affected, integers), trims/engines when the issue is specific to them (use exact engine codes such as VQ37VHR, K20C1, 2GR-FKS - an issue on one engine is often absent on another), symptoms[], dtcCodes[] when applicable (real codes only), estimatedCostLow/High in USD when known, and citations[] with at least ONE real, currently-live URL per issue.`,
    ``,
    `CRITICAL ON CITATIONS: cite ONLY pages you actually found and opened in search results. Do NOT construct or guess a URL from a pattern. Fabricated carcomplaints.com and forum URLs have polluted this database before. One real NHTSA complaint page or forum thread you actually saw is worth more than five plausible-looking guesses.`,
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
    `(1) Is this a genuine, documented issue for THIS specific model and THESE years - not copied from a platform sibling, a different generation, or a different engine? An issue that is real on the VQ37VHR is not automatically real on the VR30DDTT.`,
    `(2) Do the cited URLs actually exist, resolve, and support the claim? Fetch them. A URL that 404s, or that you cannot confirm, is NOT a live citation.`,
    `(3) Are the model years plausible for this nameplate and powertrain?`,
    `(4) Is this substantively the same problem as one already in our database above (isDuplicate)?`,
    ``,
    `Return: isReal, confidence 0-1, hasLiveCitation (true ONLY if at least one cited URL is real, reachable, and on-topic), isDuplicate, and a one-sentence reason. If the citations look fabricated, or you cannot corroborate the issue, isReal=false.`,
  ].join('\n')
}

log(`Research deepen: ${TARGETS.length} models across Lexus / Infiniti / Acura`)

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
