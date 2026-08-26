/**
 * RESEARCH WAVE 10 - NEWER MODELS AND EVs, RECALL-GROUNDED.
 *
 * Inverts the source priority of every previous wave, on purpose. Waves 3-9 put owner communities
 * first, which is right for a ten-year-old Camry and wrong for a car launched eighteen months ago:
 * the forums are thin, and demanding forum corroboration on a new model is exactly the condition
 * where an agent starts inventing plausible-looking threads. That risk is why wave 8 deliberately
 * SKIPPED brand-new models.
 *
 * What makes these targets safe anyway is the recall record. New EVs generate dense, well-documented
 * NHTSA campaign activity, and a campaign number is a CHECKABLE FACT rather than a URL that merely
 * has to resolve - api.nhtsa.gov returns the make/model/years for a real campaign and nothing for an
 * invented one. _audit-wave-recalls.js verifies the whole wave against that API afterwards.
 *
 * PLATFORM SIBLING TRAP, unusually severe here: FIVE of the twelve ride on GM Ultium (Blazer EV,
 * Prologue, ZDX, Silverado EV, Hummer EV, plus Equinox EV = six). Ioniq 5 N is E-GMP, ID. Buzz is
 * MEB, Polestar 3 shares SPA2 with the Volvo EX90. A sibling's recall is NOT automatically this
 * nameplate's recall - copying failures across platform mates is the exact error the cross-link
 * audit caught. Both prompts say so and the verifier gates on it.
 *
 * EV FAILURE SURFACE is different from ICE and the prompt says so: HV battery and BMS, ICCU /
 * on-board charger, DC fast charging, thermal management and heat pump, 12V auxiliary drain,
 * software/OTA, regenerative braking, drive units. Do NOT invent OBD-II P-codes for these - most
 * EV faults surface as manufacturer-specific codes or as dash messages only.
 */
export const meta = {
  name: 'research-wave10-new-and-ev',
  description: 'Wave-10: 12 newer models and EVs, official/recall-grounded rather than forum-first. Discover + adversarial verify',
  phases: [
    { title: 'Discover' },
    { title: 'Verify' },
  ],
}

const EXCLUSIONS = [
  {
    "make": "Chevrolet",
    "model": "Blazer EV",
    "existingTitles": [
      "Door Striker Fracture Allowing Unexpected Door Opening",
      "Infotainment System Black Screen, Freezing, and Software Glitches",
      "Rear Drive Unit Motor Insulation Failure Causing Power Loss",
      "Rear Parking Brake Wiring Harness Defect Causing Unintended Activation"
    ],
    "yearsCovered": [
      2024
    ]
  },
  {
    "make": "Honda",
    "model": "Prologue",
    "existingTitles": [
      "CV Joint/Axle Clicking and Knocking Noise When Turning",
      "False AEB Activation and Phantom Braking",
      "High Voltage System Failure Disabling Charging and Performance",
      "Instrument Panel and Infotainment Screens Go Blank While Driving"
    ],
    "yearsCovered": [
      2024
    ]
  },
  {
    "make": "Acura",
    "model": "ZDX",
    "existingTitles": [
      "DC Fast Charging Speed Inconsistency",
      "Software and OTA Update Bugs"
    ],
    "yearsCovered": [
      2024,
      2025,
      2026
    ]
  },
  {
    "make": "Chevrolet",
    "model": "Silverado EV",
    "existingTitles": [
      "Charge Port Door Malfunction",
      "Infotainment Screen Random Reboot",
      "Level 2 Charging Interruptions and EVSE Communication Faults",
      "Propulsion Power Reduced Warning During Towing",
      "Significant Range Loss in Cold Weather"
    ],
    "yearsCovered": [
      2024,
      2025,
      2026
    ]
  },
  {
    "make": "GMC",
    "model": "Hummer EV",
    "existingTitles": [
      "A-Pillar Water Leak Disables Door Switches",
      "Battery Pack Enclosure Water Ingress",
      "Multiple Warning Lights with Speed Limited to 36 MPH",
      "Public Charging Failures and Software Anomalies"
    ],
    "yearsCovered": [
      2022,
      2023,
      2024
    ]
  },
  {
    "make": "Hyundai",
    "model": "Ioniq 5 N",
    "existingTitles": [
      "12V Auxiliary Battery Parasitic Drain",
      "High-Pitched Motor Whine at Highway Speeds",
      "Infotainment Head Unit Lockup / Static Screen and Bluelink Telematics Dropouts",
      "Integrated Charging Control Unit (ICCU) Failure",
      "Left-Foot Braking (LFB) Mode Depressurizes ABS, Causing Long Pedal and Extended Stopping Distance",
      "N e-Shift Software Fault Causes Continued Acceleration After Throttle Release",
      "Regenerative-to-Friction Brake Transition Clunk and Noise",
      "Tailgate and Rear Trim Rattle Over Broken Pavement (TSB 24-BD-012H)"
    ],
    "yearsCovered": [
      2024,
      2025
    ]
  },
  {
    "make": "Volkswagen",
    "model": "ID. Buzz",
    "existingTitles": [
      "12V Auxiliary Battery Drain and Dead Battery",
      "Charge Port Door Sticking or Not Opening",
      "Infotainment System Freezing and Touchscreen Unresponsive",
      "OTA Software Updates Required for EV Systems",
      "Power Sliding Door Alignment and Operation Issues"
    ],
    "yearsCovered": [
      2024,
      2025,
      2026
    ]
  },
  {
    "make": "Volvo",
    "model": "EX30",
    "existingTitles": [
      "12V Battery Drain When Parked",
      "Android Automotive OS Infotainment Critical Bugs and Missing Features",
      "Excessive Wind Noise from A-Pillar Area",
      "Single Motor Variant Inconsistent Range Estimation"
    ],
    "yearsCovered": [
      2024,
      2025
    ]
  },
  {
    "make": "Polestar",
    "model": "Polestar 3",
    "existingTitles": [
      "Polestar 3 Early-Production Delivery + Quality Issues"
    ],
    "yearsCovered": [
      2023,
      2024
    ]
  },
  {
    "make": "Mercedes-Benz",
    "model": "EQE SUV",
    "existingTitles": [
      "AIRMATIC Air Suspension Fault Warning",
      "OTA Update Causing System Brick"
    ],
    "yearsCovered": [
      2023,
      2024,
      2025
    ]
  },
  {
    "make": "Rivian",
    "model": "R1S",
    "existingTitles": [
      "R1S Third-Row Creaks / Folding Mechanism Issues"
    ],
    "yearsCovered": [
      2022,
      2023,
      2024
    ]
  },
  {
    "make": "Chevrolet",
    "model": "Equinox EV",
    "existingTitles": [
      "12V Auxiliary Battery Drain and Charging System Issues",
      "Adaptive Cruise Control Braking Failure",
      "Continental Tire Tread Separation Recall (21-inch All-Season)",
      "Front Footwell Water Leak (HVAC Drain / Body Seam Seal)",
      "High-Voltage Battery Fault / Sudden State-of-Charge Drop to 0% (Bricking)",
      "Infotainment and Vehicle Software Glitches Requiring Reboot",
      "LED Headlamp Snow and Slush Buildup (Winter Visibility)",
      "Loss of Propulsion / Vehicle Control Software Defect (Power-Loss Recall)",
      "Pedestrian Alert Sound System Non-Compliance Recall",
      "Regenerative Braking Inconsistency and One-Pedal Driving Jerkiness",
      "Slow DC Fast Charging and Early Thermal Derating"
    ],
    "yearsCovered": [
      2024,
      2025
    ]
  }
]

const TARGETS = [
  {
    "make": "Chevrolet",
    "model": "Blazer EV",
    "yearsHint": "2024-2026",
    "note": "GM Ultium (BEV3). Subject of a high-profile 2023-24 software stop-sale that halted deliveries fleet-wide, plus subsequent recalls. Recurring: infotainment and software faults, DC fast-charging failures, 12V auxiliary battery, and battery-module campaigns. SIBLINGS ON ULTIUM: Prologue, ZDX, Silverado EV, Hummer EV, Equinox EV - do not copy a sibling recall across unless NHTSA lists this nameplate.",
    "forums": "blazerevforum.com, gm-trucks.com, r/ChevyBlazerEV, r/electricvehicles"
  },
  {
    "make": "Honda",
    "model": "Prologue",
    "yearsHint": "2024-2026",
    "note": "GM-built on Ultium, NOT a Honda platform - this is the key fact about the car. Shares its battery, BMS and much of its electrical architecture with the Blazer EV, so GM-origin campaigns may apply, but Honda-specific software and warranty handling differ. Recurring: charging faults, 12V drain, software. Verify per-nameplate at NHTSA.",
    "forums": "hondaprologueforum.com, r/HondaPrologue, r/electricvehicles"
  },
  {
    "make": "Acura",
    "model": "ZDX",
    "yearsHint": "2024-2026",
    "note": "The third Ultium sibling (with Blazer EV and Prologue), built by GM. Type S variant. Same caution: a Blazer EV or Prologue defect is not automatically a ZDX defect - confirm the nameplate appears in the campaign.",
    "forums": "acurazine.com, r/Acura, r/electricvehicles"
  },
  {
    "make": "Chevrolet",
    "model": "Silverado EV",
    "yearsHint": "2024-2026",
    "note": "Ultium full-size truck, RST and WT trims. Recurring themes so far: charging and DC fast-charge faults, software/OTA, propulsion power loss campaigns, and 12V/aux systems. Distinct from the gas Silverado 1500 in every relevant way - do not carry an ICE Silverado issue here.",
    "forums": "gm-trucks.com, silveradoevforum.com, r/SilveradoEV"
  },
  {
    "make": "GMC",
    "model": "Hummer EV",
    "yearsHint": "2022-2026",
    "note": "Ultium, pickup and SUV body styles (this catalog lists them as separate nameplates - keep them separate). Recurring: battery-module recalls, extreme weight-related brake and tire complaints, software faults, and charging issues. Early 2022 builds differ substantially from later production.",
    "forums": "gmhummerevforum.com, gm-trucks.com, r/HummerEV"
  },
  {
    "make": "Hyundai",
    "model": "Ioniq 5 N",
    "yearsHint": "2024-2026",
    "note": "E-GMP, the performance variant - NOT the standard Ioniq 5, which is a separate nameplate here with its own documented issues. The ICCU (Integrated Charging Control Unit) failure is the defining E-GMP story and has its own recalls; verify whether a given ICCU campaign covers the N specifically. N-specific: track-mode thermal limits, N Grin Boost, simulated-shift software, brake and tire wear under track use.",
    "forums": "ioniqforum.com, ioniq5forum.com, r/Ioniq5, r/electricvehicles"
  },
  {
    "make": "Volkswagen",
    "model": "ID. Buzz",
    "yearsHint": "2024-2026",
    "note": "MEB platform, US launch 2024. Recurring: infotainment and software faults (a long-standing MEB complaint across ID.4 and ID.3), the 2024-25 recall over the third-row bench seating position/occupancy, door and power-sliding-door faults, 12V and charging issues. ID.4 is a platform sibling - confirm the Buzz is named.",
    "forums": "idbuzzforum.com, vwidtalk.com, r/idbuzz, r/electricvehicles"
  },
  {
    "make": "Volvo",
    "model": "EX30",
    "yearsHint": "2024-2026",
    "note": "SEA platform (Geely-shared). Launch was delayed repeatedly over software, and the software/UX complaints - everything routed through one central screen, no driver display - are the defining owner criticism. Also: OTA update failures, 12V, charging, and early-build recalls. Quarterly-priority make (Volvo, 4 of 26 models covered).",
    "forums": "swedespeed.com, ex30forum.com, r/Volvo, r/electricvehicles"
  },
  {
    "make": "Polestar",
    "model": "Polestar 3",
    "yearsHint": "2024-2026",
    "note": "SPA2 platform, shares heavily with the Volvo EX90 - and the EX90 software delays are well documented, so check whether a given fault is genuinely Polestar-side. Only 2 documented issues today. Recurring themes to check: software/OTA, 12V, charging, and the launch-period recalls.",
    "forums": "polestarforum.com, swedespeed.com, r/Polestar, r/electricvehicles"
  },
  {
    "make": "Mercedes-Benz",
    "model": "EQE SUV",
    "yearsHint": "2023-2026",
    "note": "EVA2 platform, sibling to the EQE sedan and EQS/EQS SUV (all separate nameplates here). Documented themes: BMS software faults that open the HV contactors, 12V auxiliary drain, MBUX faults, and the Farasis-cell campaigns affecting the EQ range. Confirm which EQ nameplates a campaign actually names.",
    "forums": "mbworld.org, benzworld.org, r/mercedes_benz, r/electricvehicles"
  },
  {
    "make": "Rivian",
    "model": "R1S",
    "yearsHint": "2022-2026",
    "note": "Only 3 documented issues while the R1T sibling has 19 - a clear coverage gap rather than a clean vehicle. Gen 1 (2022-2024) vs Gen 2 (2025+, new zonal electrical architecture) are meaningfully different. Recurring: seatbelt/airbag and steering-knuckle recalls, 12V and Gateway module faults, software/OTA, HVAC and heat-pump issues, drive-unit failures.",
    "forums": "rivianforums.com, r1tr1s.com, r/Rivian, r/electricvehicles"
  },
  {
    "make": "Chevrolet",
    "model": "Equinox EV",
    "yearsHint": "2024-2026",
    "note": "Ultium, GM's volume affordable EV and a genuinely high-seller. Recurring: software/OTA and infotainment, DC fast-charge faults, 12V, and the shared Ultium battery-module campaigns. Completely unrelated to the gas Equinox (a separate nameplate) - do not carry ICE Equinox issues here.",
    "forums": "equinoxevforum.com, gm-trucks.com, r/EquinoxEV, r/electricvehicles"
  }
]

const CATEGORIES = ["engine","transmission","drivetrain","electrical","brakes","suspension","cooling","fuel","interior","exterior","body","safety","exhaust","steering","hvac","emissions","other"]

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
          category: { type: 'string', enum: CATEGORIES },
          years: { type: 'array', items: { type: 'number' } },
          trims: { type: 'array', items: { type: 'string' } },
          engines: { type: 'array', items: { type: 'string' } },
          symptoms: { type: 'array', items: { type: 'string' } },
          dtcCodes: { type: 'array', items: { type: 'string' } },
          recallCampaigns: { type: 'array', items: { type: 'string' } },
          estimatedCostLow: { type: 'number' },
          estimatedCostHigh: { type: 'number' },
          citations: { type: 'array', items: CITATION },
        },
        required: ['title', 'description', 'solution', 'severity', 'category', 'years', 'symptoms', 'citations'],
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
    hasOfficialSource: { type: 'boolean' },
    isDuplicate: { type: 'boolean' },
    reason: { type: 'string' },
  },
  required: ['isReal', 'confidence', 'hasLiveCitation', 'hasNonAggregatorSource', 'hasOwnerCommunitySource', 'hasOfficialSource', 'isDuplicate', 'reason'],
}

function existingFor(t) {
  const e = EXCLUSIONS.find((x) => x.make === t.make && x.model === t.model)
  return (e && e.existingTitles) || []
}

function discoverPrompt(t) {
  const existing = existingFor(t)
  return [
    `You research REAL, documented known issues for a RECENTLY LAUNCHED vehicle. Vehicle: ${t.make} ${t.model} (${t.yearsHint}). Context: ${t.note}`,
    ``,
    `This vehicle is NEW. That changes where the evidence lives, so change where you look:`,
    `  1. OFFICIAL FIRST - NHTSA recalls and complaints, manufacturer recall and service campaigns, TSBs, stop-sale and delivery-hold notices, OEM service documentation. On a vehicle this new this is the RICHEST and most reliable source, and it is where you should spend most of your effort.`,
    `  2. OWNER COMMUNITIES second - ${t.forums}. These exist but are THIN for a vehicle this new. Use them to corroborate and to add detail, not as your primary evidence.`,
    ``,
    `Because the forums are thin, the temptation to fill gaps with plausible-sounding threads is high. Do not. An issue grounded in one verifiable recall campaign is worth more than five with invented forum links. If you cannot find real evidence for this nameplate, return fewer issues.`,
    ``,
    `WE ALREADY HAVE THESE ${existing.length} ISSUES. Do NOT return any of them or a reworded restatement:`,
    existing.length ? existing.map((s) => `  - ${s}`).join('\n') : '  (none)',
    ``,
    `Find 6-10 ADDITIONAL well-documented issues NOT in that list.`,
    ``,
    `THE EV / NEW-VEHICLE FAILURE SURFACE is not the ICE one. Look specifically at: high-voltage battery and BMS faults; ICCU / on-board charger / DC-DC converter failures; DC fast-charging faults; thermal management and heat pump; 12V auxiliary battery drain (an extremely common real complaint on new EVs); software and OTA update failures; infotainment; regenerative braking and brake-blending; drive-unit and reduction-gear failures; and one-pedal / propulsion-loss campaigns.`,
    ``,
    `PLATFORM SIBLINGS - this is the single biggest error risk in this wave. Several of these vehicles share a skateboard (GM Ultium runs under the Blazer EV, Prologue, ZDX, Silverado EV, Hummer EV and Equinox EV; Hyundai E-GMP under the Ioniq 5 range; VW MEB under the ID. Buzz; SPA2 under the Polestar 3 and Volvo EX90). A recall or failure on a sibling is NOT automatically an issue on THIS nameplate. Before you attribute one, confirm NHTSA or the manufacturer actually names this vehicle.`,
    ``,
    `For EACH issue provide: title (name the component and the failure mode), description, solution (the real fix, including whether a free recall remedy exists), severity, category (one of: ${CATEGORIES.join(', ')}), years, trims when variant-specific, symptoms[], recallCampaigns[] (NHTSA campaign numbers such as 24V123 where one applies - state these ONLY when you actually found them), estimatedCostLow/High when known, and citations[].`,
    ``,
    `CATEGORY MAPPING - the list above is CLOSED and shared with the whole catalog. Map EV concepts into it, never extend it: HV battery / BMS / charging / ICCU / 12V / software -> electrical; drive unit and reduction gear -> drivetrain; regenerative braking -> brakes; heat pump and cabin climate -> hvac; thermal management of the pack -> cooling.`,
    ``,
    `DTC CODES: most EV faults surface as manufacturer-specific codes or dash messages, not generic OBD-II P-codes. Provide dtcCodes[] only where a code is genuinely documented for this vehicle. Never infer one by analogy to a gas car.`,
    ``,
    `CITATION RULES - hard requirements:`,
    `  * At least ONE citation per issue must be an official source (NHTSA, manufacturer campaign, TSB) or a real owner community thread. Third-party problem-aggregator sites alone do not qualify.`,
    `  * NEVER cite a raw api.nhtsa.gov endpoint - cite the human-readable nhtsa.gov page or the campaign PDF.`,
    `  * Cite ONLY pages you actually found and opened. Do NOT construct or guess a URL from a pattern - fabricated URLs have polluted this database before, and a guessed static.nhtsa.gov PDF path was tested and 404s.`,
    `  * A forum thread found in search results counts even if the site blocks automated fetching.`,
    ``,
    `Accuracy over volume. A single isolated complaint is an anecdote, not a known issue. Never invent an issue or a citation. Respond ONLY via the StructuredOutput tool.`,
  ].join('\n')
}

function verifyPrompt(t, c) {
  const existing = existingFor(t)
  return [
    `You are a skeptical automotive fact-checker. DEFAULT TO REFUTING unless the evidence is solid. Vehicle: ${t.make} ${t.model} (${t.yearsHint}) - a RECENTLY LAUNCHED vehicle.`,
    ``,
    `CLAIM:`,
    `Title: ${c.title}`,
    `Description: ${c.description}`,
    `Years: ${(c.years || []).join(', ')}`,
    `Recall campaigns claimed: ${(c.recallCampaigns || []).join(', ') || '(none)'}`,
    `Cited URLs: ${(c.citations || []).map((x) => x.url).join(' | ') || '(none)'}`,
    ``,
    `Context on this vehicle: ${t.note}`,
    ``,
    `ISSUES ALREADY IN OUR DATABASE for this model:`,
    existing.length ? existing.map((s) => `  - ${s}`).join('\n') : '  (none)',
    ``,
    `Verify:`,
    `(1) PLATFORM SIBLINGS - the biggest risk here. Is this genuinely documented for THIS nameplate, or is it a sibling's problem copied across? GM Ultium underpins the Blazer EV, Prologue, ZDX, Silverado EV, Hummer EV and Equinox EV; E-GMP the Ioniq 5 range; MEB the ID. Buzz; SPA2 the Polestar 3 and Volvo EX90. Shared hardware makes a shared defect PLAUSIBLE but not automatic. If a recall is claimed, confirm NHTSA lists THIS vehicle.`,
    `(2) If a recall campaign number is claimed, does it exist AND cover this make/model? An invented campaign number is the clearest possible sign of fabrication.`,
    `(3) Do the cited URLs exist, resolve, and support the claim? A 404 is not a live citation. A 403 from a forum that clearly exists DOES count as live.`,
    `(4) Are the model years plausible? These vehicles are 1-4 years old - reject any year range that predates the launch. This is a common and easily-caught error.`,
    `(5) Is this a RECURRING documented problem or a handful of early-adopter complaints? New vehicles attract loud launch-period noise. A software annoyance that one OTA fixed is not a known issue.`,
    `(6) Is it substantively the same problem as one already in our database above (isDuplicate)?`,
    ``,
    `Classify sources: hasOfficialSource (NHTSA / manufacturer campaign / TSB), hasOwnerCommunitySource (a real owner forum or model-specific community), hasNonAggregatorSource (either of those, as opposed to third-party aggregator sites).`,
    ``,
    `Return isReal, confidence 0-1, hasLiveCitation, hasNonAggregatorSource, hasOwnerCommunitySource, hasOfficialSource, isDuplicate, and a one-sentence reason. If citations look fabricated, or you cannot corroborate a recurring documented problem, isReal=false.`,
  ].join('\n')
}

log(`Wave 10: ${TARGETS.length} newer models and EVs — official/recall-grounded, forums second`)

const perModel = await pipeline(
  TARGETS,
  (t) => agent(discoverPrompt(t), { label: `discover:${t.make} ${t.model}`, phase: 'Discover', schema: DISCOVER_SCHEMA })
    .then((d) => ({ t, candidates: (d && Array.isArray(d.candidates)) ? d.candidates : [] })),
  (disc) => {
    const { t, candidates } = disc
    if (!candidates.length) return { make: t.make, model: t.model, found: 0, confirmed: [], forumBacked: 0, officialBacked: 0 }
    return parallel(candidates.map((c) => () =>
      agent(verifyPrompt(t, c), { label: `verify:${t.model}`, phase: 'Verify', schema: VERDICT_SCHEMA })
        .then((v) => {
          if (!v) return null
          if (!v.isReal || !v.hasLiveCitation || v.isDuplicate) return null
          if ((v.confidence ?? 0) < 0.7) return null
          if (!v.hasNonAggregatorSource) return null
          if (!Array.isArray(c.citations) || c.citations.length === 0) return null
          return { ...c, make: t.make, model: t.model, _verdict: v, _verdictConfidence: v.confidence, _verdictReason: v.reason, _forumBacked: !!v.hasOwnerCommunitySource, _officialBacked: !!v.hasOfficialSource }
        })
    )).then((res) => {
      const kept = res.filter(Boolean)
      return {
        make: t.make, model: t.model,
        found: candidates.length,
        confirmed: kept,
        forumBacked: kept.filter((x) => x._forumBacked).length,
        officialBacked: kept.filter((x) => x._officialBacked).length,
      }
    })
  }
)

const confirmed = []
let totalFound = 0, totalForum = 0, totalOfficial = 0
const perModelStats = []
for (const r of perModel.filter(Boolean)) {
  totalFound += r.found
  totalForum += r.forumBacked
  totalOfficial += r.officialBacked
  perModelStats.push({ make: r.make, model: r.model, found: r.found, confirmed: r.confirmed.length, forumBacked: r.forumBacked, officialBacked: r.officialBacked })
  log(`${r.make} ${r.model}: ${r.confirmed.length}/${r.found} confirmed, ${r.officialBacked} official-backed, ${r.forumBacked} forum-backed`)
  for (const c of r.confirmed) confirmed.push(c)
}
log(`WAVE 10 TOTAL: ${confirmed.length}/${totalFound} confirmed, ${totalOfficial} official-backed, ${totalForum} forum-backed`)

return { result: { confirmed, stats: { models: TARGETS.length, found: totalFound, confirmed: confirmed.length, forumBacked: totalForum, officialBacked: totalOfficial, perModel: perModelStats } } }
