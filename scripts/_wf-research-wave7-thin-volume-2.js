/**
 * RESEARCH WAVE 7 - THIN HIGH-VOLUME US NAMEPLATES, ROUND 2.
 *
 * Same thesis as wave 6: mainstream US cars with large fleets but 5-8 documented issues.
 * Every target here sits at <=8 published issues while the top-15 US sellers average 56.
 *
 * Cruze 5 - Sonic 7 - Cobalt 6 - Focus 8 - Flex 5 - Avalon 8 - Yaris 5 -
 * Versa 7 - Juke 8 - Armada 6 - 7 Series 8 - 2 Series 6
 *
 * Covers four quarterly-priority makes (Chevrolet, Toyota, Nissan, BMW) plus Ford.
 *
 * Carries the wave-3/4/5/6 prompt fixes: owner communities named first, no aggregator named,
 * >=1 non-aggregator citation gated via hasNonAggregatorSource, raw api.nhtsa.gov banned.
 *
 * PER-MODEL TRAP flagged in the notes: several targets span two mechanically unrelated cars under
 * one nameplate (Yaris vs Yaris iA/Mazda2; Armada TA60 vs Y62 Patrol). The verifier is told not to
 * carry an issue across that boundary.
 */
export const meta = {
  name: 'research-wave7-thin-volume-2',
  description: 'Wave-7: 12 high-volume US nameplates carrying only 5-8 documented issues. Forum-weighted discover + adversarial verify',
  phases: [
    { title: 'Discover' },
    { title: 'Verify' },
  ],
}

const EXCLUSIONS = [
  {
    "make": "Chevrolet",
    "model": "Cruze",
    "existingTitles": [
      "1.4T Coolant Leak at Water Outlet and Thermostat Housing",
      "6T40 Transmission Shudder (Gen 1)",
      "Intake Manifold Runner Control Failure (1.4T)",
      "PCV Valve Cover Failure and Oil Leak (1.4T)",
      "Turbo Oil Feed Line Leak (1.4T LUJ/LUV)"
    ],
    "yearsCovered": [
      2011,
      2012,
      2013,
      2014,
      2015,
      2016
    ]
  },
  {
    "make": "Chevrolet",
    "model": "Sonic",
    "existingTitles": [
      "1.4L Turbo PCV Valve Cover Diaphragm Failure",
      "6-Speed Automatic Transmission Turbine Shaft Fracture",
      "Automatic Shifter Knob Cracks - Cannot Shift Out of Park",
      "Front Stabilizer (Sway Bar) Link Rattle and Clunking",
      "Ignition Coil and Spark Plug Misfire from Valve Cover Gasket Oil Leak (1.8L)",
      "Persistent Check Engine Light and Electrical System Faults",
      "Premature Water Pump Failure and Coolant Leaks"
    ],
    "yearsCovered": [
      2012,
      2013,
      2014,
      2015,
      2016,
      2017,
      2018,
      2019,
      2020
    ]
  },
  {
    "make": "Chevrolet",
    "model": "Cobalt",
    "existingTitles": [
      "2009 Cobalt Transmission Shift Cable Clip Recall — Rollaway After Parking",
      "Defective Ignition Switch Causing Engine Shutoff and Airbag Failure",
      "Ecotec Engine Timing Chain Stretch and Guide Wear",
      "Electric Power Steering Motor Sudden Failure",
      "Fuel Pump Module Failure Causing Stalling and No-Start",
      "Premature Front Wheel Hub Bearing Failure"
    ],
    "yearsCovered": [
      2005,
      2006,
      2007,
      2008,
      2009,
      2010
    ]
  },
  {
    "make": "Ford",
    "model": "Focus",
    "existingTitles": [
      "2.0L Direct Injection Carbon Buildup on Intake Valves",
      "Canister Purge Valve Failure Causing Rough Idle and Stalling",
      "Door Ajar Warning False Alarm and Interior Lights Staying On",
      "DPS6 PowerShift Dual-Clutch Transmission Shudder, Hesitation, and Failure",
      "Improperly Plated Fuel Pump Components - Stall Risk (NHTSA 15V005)",
      "Oil Pump Drive Belt or Tensioner Failure Causing Loss of Oil Pressure (Recall 23V905)",
      "Rear Wheel Bearing Premature Failure (1st-Generation Mk1/Mk1.5)",
      "Side Door Latch Failure - Door Opening While Driving (Recall 16V643)"
    ],
    "yearsCovered": [
      2000,
      2001,
      2002,
      2003,
      2004,
      2005,
      2006,
      2007,
      2008,
      2009,
      2010,
      2011,
      2012,
      2013,
      2014,
      2015,
      2016,
      2017,
      2018
    ]
  },
  {
    "make": "Ford",
    "model": "Flex",
    "existingTitles": [
      "Brake Booster Check Valve Failure",
      "Door Ajar Warning Stays On",
      "Electric Power Steering (EPS) Failure and Assist Loss",
      "Internal Water Pump Failure Causes Coolant-Oil Mixing and Catastrophic Engine Damage",
      "Power Transfer Unit (PTU) Seal Leaks and AWD System Failure"
    ],
    "yearsCovered": [
      2009,
      2010,
      2011,
      2012,
      2013,
      2014,
      2015,
      2016,
      2017,
      2018,
      2019
    ]
  },
  {
    "make": "Toyota",
    "model": "Avalon",
    "existingTitles": [
      "2GR-FE V6 Oil Consumption and Valve Cover Gasket Seepage",
      "6-Speed Automatic Transmission Torque Converter Shudder",
      "Dashboard Cracking and Warping",
      "Front Strut Mount Bearing Noise and Clunking",
      "Power Steering Rack Seal Leak",
      "Recall 06V096000: Under-Filled Side/Curtain/Knee Air Bag Inflator May Not Inflate Properly",
      "Transmission Shudder and Torque Converter Vibration",
      "Water Pump Leak and Failure (2GR-FE)"
    ],
    "yearsCovered": [
      2005,
      2006,
      2007,
      2008,
      2009,
      2010,
      2011,
      2012,
      2013,
      2014,
      2015,
      2016,
      2017,
      2018,
      2019,
      2020,
      2021,
      2022
    ]
  },
  {
    "make": "Toyota",
    "model": "Yaris",
    "existingTitles": [
      "4-Speed Automatic Transmission Shudder and Harsh Shifts",
      "Electric Power Steering (EPS) Failure",
      "Exterior Door Handle Breakage",
      "Front Engine Mount Premature Failure",
      "Interior Door Handle Breaking"
    ],
    "yearsCovered": [
      2006,
      2007,
      2008,
      2009,
      2010,
      2011,
      2012,
      2013,
      2014,
      2015,
      2016,
      2017,
      2018
    ]
  },
  {
    "make": "Nissan",
    "model": "Versa",
    "existingTitles": [
      "Catalytic Converter Premature Failure and Theft",
      "CVT Transmission Failure (Jatco CVT7/JF015E)",
      "Front Strut Mount Bearing Noise",
      "Fuel Pump Control Module Failure",
      "Ignition Coil Failure",
      "Mass Air Flow Sensor Failure",
      "Rear Coil Spring Fracture and Corrosion"
    ],
    "yearsCovered": [
      2007,
      2008,
      2009,
      2010,
      2011,
      2012,
      2013,
      2014,
      2015,
      2016,
      2017,
      2018,
      2019,
      2020,
      2021,
      2022,
      2023
    ]
  },
  {
    "make": "Nissan",
    "model": "Juke",
    "existingTitles": [
      "A/C Condenser Leaks (Road-Debris Damage, Exposed Front Mounting)",
      "CVT Transmission Failure (Jatco CVT7)",
      "Engine Start/Stop Push-Button Sticks, Causing Unexpected Shutoff (Recall 15V418)",
      "Fuel Pressure Sensor Loosens and Leaks Fuel (Recall 14V683 / PC618)",
      "NISMO RS Brake Master Cylinder Seal Failure / Fluid Leak into Booster (Recall 18V086 / R1801)",
      "Timing Chain Stretch (MR16DDT Engine)",
      "Turbocharger Failure (MR16DDT Engine)",
      "Turbocharger Oil Feed Line Leak"
    ],
    "yearsCovered": [
      2011,
      2012,
      2013,
      2014,
      2015,
      2016,
      2017
    ]
  },
  {
    "make": "Nissan",
    "model": "Armada",
    "existingTitles": [
      "Exhaust Manifold Cracking (Both Banks)",
      "Front Brake Rotor Warping",
      "Hydraulic Body Mount Failure and Clunking",
      "IPDM ECM Relay Failure Causing Engine Stalling (Recall 10V517000)",
      "Rear Air Suspension Compressor and Airbag Failure",
      "VVEL Solenoid Failure (VK56VD Engine)"
    ],
    "yearsCovered": [
      2004,
      2005,
      2006,
      2007,
      2008,
      2009,
      2010,
      2011,
      2012,
      2013,
      2014,
      2015,
      2017,
      2018,
      2019,
      2020,
      2021,
      2022,
      2023,
      2024
    ]
  },
  {
    "make": "BMW",
    "model": "7 Series",
    "existingTitles": [
      "Air Suspension Compressor & Strut Failure - All Generations",
      "G11/G12 Air-Suspension Strut Diagnosis",
      "High-Pressure Fuel Pump Failure - F01/F02 750i/750Li (N63)",
      "iDrive Head Unit and CIC/NBT Module Failures",
      "N63 Valvetronic Motor Failure - F01/F02 750i/750Li",
      "N63TU1 750i Oil-Consumption and Turbo-Leak Diagnosis",
      "Panoramic Glass Roof Cracking and Drain Blockage",
      "Widespread Electrical Issues - E65/E66 745i/750i/760i"
    ],
    "yearsCovered": [
      2002,
      2003,
      2004,
      2005,
      2006,
      2007,
      2008,
      2009,
      2010,
      2011,
      2012,
      2013,
      2014,
      2015,
      2016,
      2017,
      2018,
      2019,
      2020,
      2021,
      2022,
      2023,
      2024,
      2025
    ]
  },
  {
    "make": "BMW",
    "model": "2 Series",
    "existingTitles": [
      "228i Water-Pump Connector Fire Recall Requires a VIN Check",
      "B48 Engine Coolant Loss from Expansion Tank",
      "Early 228i Timing-Chain Complaints Require N20/N26 Test-Plan Diagnosis",
      "Oil Leaks - Valve Cover & Oil Filter Housing - All Engines",
      "Turbo Charge Pipe Failure - F22/F23 228i/230i/M240i",
      "Valve Cover Gasket Oil Leak"
    ],
    "yearsCovered": [
      2014,
      2015,
      2016,
      2017,
      2018,
      2019,
      2020,
      2021,
      2022,
      2023,
      2024,
      2025
    ]
  }
]

const TARGETS = [
  { make: 'Chevrolet', model: 'Cruze',    yearsHint: '2011-2019', note: 'J300 2011-2015 (1.4L turbo LUJ/LUV, 1.8L LUW, 6T40) and J400 2016-2019 (1.4L LE2, 1.6L LH7 diesel). Cooling-system and PCV failures are the signature complaints. Very high US fleet volume for only 5 documented issues.', forums: 'cruzetalk.com, chevroletforum.com, r/CruzeTalk, r/Chevy' },
  { make: 'Chevrolet', model: 'Sonic',    yearsHint: '2012-2020', note: 'Gamma II platform, 1.8L LUW or 1.4L turbo (LUV then LE2), 6T30 auto or manual. Shares the Cruze 1.4T architecture, so verify Sonic-specific coverage rather than assuming a Cruze issue carries over.', forums: 'sonicownersforum.com, chevysonicforum.com, chevroletforum.com, r/Chevy' },
  { make: 'Chevrolet', model: 'Cobalt',   yearsHint: '2005-2010', note: 'Delta platform, 2.2/2.4 Ecotec, plus supercharged and turbo SS variants. Subject of the ignition-switch recall (14V-047) and an electric power steering recall. Confirm which failures are recall-covered vs unaddressed.', forums: 'cobaltss.net, chevycobaltforum.com, r/Chevy' },
  { make: 'Ford',      model: 'Focus',    yearsHint: '2000-2018', note: 'Mk1 2000-2007, Mk2 2008-2011, Mk3 2012-2018. The Mk3 DPS6 PowerShift dry dual-clutch is the defining failure and produced a class-action settlement and many TSBs - but the car has far more than that one issue. 2.0 Duratec/GDI and 1.0 EcoBoost. Huge US fleet, only 8 documented issues.', forums: 'focusfanatics.com, focusst.org, r/FordFocus, r/Ford' },
  { make: 'Ford',      model: 'Flex',     yearsHint: '2009-2019', note: 'D4 platform, 3.5 Duratec and 3.5 EcoBoost, 6F50/6F55. Internal water pump on the 3.5 Cyclone (chain-driven, leaks coolant into the oil) and PTU failure on AWD are known weak points. Shares much with the Taurus and MKT.', forums: 'fordflexforum.com, flexowners.com, r/Ford' },
  { make: 'Toyota',    model: 'Avalon',   yearsHint: '2005-2022', note: 'XX30 2005-2012 (2GR-FE - rubber oil supply hose recall, VVT-i timing cover leak, melting dashboard), XX40 2013-2018, XX50 2019-2022 (2GR-FKS plus A25A hybrid). Quarterly-priority make.', forums: 'toyotanation.com, avalonclub.com, r/Toyota' },
  { make: 'Toyota',    model: 'Yaris',    yearsHint: '2006-2020', note: 'XP90 2007-2011 and XP130 2012-2018 (1NZ-FE / 2NZ-FE, U340E), plus the 2016-2020 Yaris iA/Yaris sedan which is a rebadged Mazda2 with a Skyactiv 1.5 - a completely different car mechanically. Do not mix the two.', forums: 'yarisworld.com, toyotanation.com, r/ToyotaYaris, r/Toyota' },
  { make: 'Nissan',    model: 'Versa',    yearsHint: '2007-2025', note: 'C11 2007-2012, N17 2012-2019, N18 2020+. HR16DE with the Jatco Xtronic CVT; CVT failure and the extended warranty around it dominate owner reports, but look well beyond it. Quarterly-priority make.', forums: 'nissanversaforums.com, nissanforums.com, r/Nissan' },
  { make: 'Nissan',    model: 'Juke',     yearsHint: '2011-2017', note: 'F15, 1.6 DIG-T MR16DDT turbo with the JF015E CVT (or 6MT on NISMO/AWD variants). Turbocharger, timing chain and CVT failures are the recurring themes.', forums: 'nissanjukeforums.com, jukeownersclub.com, nissanforums.com, r/Nissan' },
  { make: 'Nissan',    model: 'Armada',   yearsHint: '2004-2025', note: 'TA60 2004-2015 (VK56DE, US-built, Titan-based) and Y62 2017+ (VK56VD, rebadged Patrol). These are two very different trucks - do not carry a TA60 issue onto a Y62. Brake and fuel-gauge complaints recur on the TA60.', forums: 'nissanarmadaforum.com, clubarmada.com, nissanforums.com, r/Nissan' },
  { make: 'BMW',       model: '7 Series', yearsHint: '2002-2025', note: 'E65/E66 2002-2008 (first iDrive, N62 valve stem seals, alternator bracket gasket), F01/F02 2009-2015 (N63 twin-turbo, subject of the Customer Care Package rework), G11/G12 2016-2022 (N63TU, B58), G70 2023+. Quarterly-priority make (8 of 39 models covered). Tag issues to the exact engine code.', forums: 'bimmerfest.com, 7post.com, bimmerforums.com, r/BMW' },
  { make: 'BMW',       model: '2 Series', yearsHint: '2014-2025', note: 'F22/F23 2014-2021 (N20/N26 timing chain guide failure, N55 then B58 in M235i/M240i), F44 Gran Coupe 2020+, G42 2022+. The N20 timing chain issue is engine-code specific - an N20B20A and a later revised unit are not equally affected.', forums: '2addicts.com, bimmerpost.com, bimmerfest.com, r/BMW' },
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

log(`Wave 7: ${TARGETS.length} thin high-volume nameplates — Chevrolet/Ford/Toyota/Nissan/BMW`)

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

