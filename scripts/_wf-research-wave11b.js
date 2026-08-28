/**
 * RESEARCH WAVE 11 - FOUR THESES IN ONE WAVE (EVs, newer vehicles, top sellers, thin nameplates)
 * PLUS the motorcycle class.
 *
 * GENERATED FILE. Edit scripts/_wave11-body.js and re-run scripts/_gen-wave11.js instead.
 *
 * Every previous wave carried ONE thesis and one prompt. This one carries five, selected per target
 * by `style`, because the evidence lives somewhere different in each case:
 *
 *   'ev' / 'new'  OFFICIAL FIRST. On a vehicle launched 1-3 years ago the forums are thin, and
 *                 demanding forum corroboration is exactly the condition under which an agent starts
 *                 inventing plausible-looking threads. A recall campaign number is a CHECKABLE FACT -
 *                 api.nhtsa.gov returns the make/model/years for a real one and nothing for an
 *                 invented one, and _audit-wave-recalls.js runs that check over the whole wave after.
 *   'volume'      FORUM FIRST. A ten-year-old top-seller has a deep owner community that holds detail
 *                 no government summary captures. These nameplates are not thin because they are
 *                 clean; they are thin because no wave has deepened them yet.
 *   'thin'        FORUM FIRST, and explicitly told the low count is a COVERAGE GAP, not evidence of
 *                 reliability - CX-7 turbo failures and 350Z clutch/CSC failures are notorious.
 *   'moto'        Motorcycle failure surface, and every row is emitted with vehicleType='motorcycle'
 *                 so it can never be counted into the automotive catalog. Make names COLLIDE across
 *                 classes (Suzuki V-Strom vs Suzuki Vitara), which is why the column exists.
 *
 * NO NUMERIC CONFIDENCE GATE. Previous waves dropped anything under 0.70 self-reported confidence.
 * That is unsafe here: self-reported confidence tracks PROMPT WORDING rather than belief (measured
 * 0.70-0.72 vs 0.20-0.33 on identical work), and this wave runs FIVE different prompts, so the
 * numbers are not comparable across targets - a threshold would silently delete the thin and
 * motorcycle results while keeping the EV ones. The gates below are all EVIDENCE gates: real,
 * live citation, at least one non-aggregator source, not a duplicate, citations present. The
 * confidence number is still recorded for the persist step's high/medium/low mapping.
 *
 * ENUM DISCIPLINE: category and severity use the SAME closed sets as the rest of the catalog. The
 * renderer knows 17 categories and high/medium/low only; a wider enum from a research workflow has
 * previously crashed article pages for 39 models. EV and motorcycle concepts must map INTO the
 * existing set, never extend it.
 */
export const meta = {
  name: 'research-wave11b-four-bucket',
  description: 'Wave-11: 26 targets across EVs, newer vehicles, top sellers, thin nameplates and motorcycles. Style-selected discover prompt + adversarial verify',
  phases: [
    { title: 'Discover' },
    { title: 'Verify' },
  ],
}

const TARGETS = [
  {
    "style": "volume",
    "make": "Volkswagen",
    "model": "Jetta",
    "yearsHint": "1999-2025",
    "note": "Only 24 issues (plus 4 pending) across five generations of VW's highest-volume US nameplate. Mk4 1999-2005 (window regulators, coil packs, the ALH/BEW TDI), Mk5 2005-2010 (2.5 five-cylinder, the 2.0T FSI cam follower, and the BRM TDI), Mk6 2011-2018 (1.8T EA888 Gen3 water pump and PCV, the EA189 diesel at the centre of the emissions scandal), Mk7 2019-2025 (1.4T/1.5T EA211). Quarterly-priority make (VW, 3 of 22 models covered). GLI is a separate nameplate concern - keep genuinely Jetta-wide issues here. Tag to the exact engine code.",
    "forums": "vwvortex.com, tdiclub.com, jettaforums.com, vwforum.com, r/Volkswagen"
  },
  {
    "style": "volume",
    "make": "Hyundai",
    "model": "Elantra",
    "yearsHint": "2001-2025",
    "note": "29 issues across five generations of a perennial top-20 US seller - still light for the volume. XD 2001-2006, HD 2007-2010, MD 2011-2016 (the Nu 1.8 - oil consumption, plus the widely reported steering-column/MDPS clunk and the fuel-economy restatement), AD 2017-2020 (the 2.0 Nu and the 1.6T), CN7 2021-2025 (2.0 Smartstream, the N with the 2.0T, plus hybrid). Also: the ABS/HECU fire recalls, the piston-ring/engine-seizure campaigns on Nu and Gamma engines, and the well-publicised 2015-2021 theft vulnerability from the missing engine immobiliser. Quarterly-priority make.",
    "forums": "hyundai-forums.com, elantraxd.com, hyundaiforums.net, r/Hyundai, r/Elantra"
  },
  {
    "style": "thin",
    "make": "Lexus",
    "model": "GS",
    "yearsHint": "1998-2020",
    "note": "Only 4 issues (this catalog also holds GS300 with 2 - keep genuinely GS-wide findings here). S160 1998-2005 (2JZ-GE and the 3UZ V8 on the GS400/430), S190 2006-2011 (the 2GR-FSE - and the RUBBER OIL SUPPLY HOSE recall plus the VVT-i oil line failure that swept the 2GR family, along with the GS450h hybrid), L10 2013-2020 (2GR-FKS, the GS F with the 2UR-GSE 5.0 V8). Recurring: dashboard melting/stickiness in heat (a well-documented Toyota/Lexus complaint of this era), air suspension on equipped cars, and infotainment/navigation faults. Quarterly note: Lexus is thin overall.",
    "forums": "clublexus.com, lexusownersclub.com, gs300.com, toyotanation.com, r/Lexus"
  },
  {
    "style": "thin",
    "make": "Nissan",
    "model": "350Z",
    "yearsHint": "2003-2009",
    "note": "Only 4 issues on a car with one of the largest enthusiast communities of its generation. Z33 with the VQ35DE (2003-2006, the DE and the revised REV-UP HR-precursor) and the VQ35HR from 2007 - and these are DIFFERENT engines with different failure records, which is the main tagging trap. Documented: heavy oil consumption on the early DE, the well-known tyre feathering/rear-tyre wear from suspension geometry, clutch and CSC (concentric slave cylinder) failures on the 6-speed, catalytic converter failure sending debris back into the engine, window motor/regulator failure, and rear differential and driveshaft bushing wear.",
    "forums": "my350z.com, 350z-tech.com, nico club (nicoclub.com), the350z.com, r/350z"
  },
  {
    "style": "moto",
    "make": "Harley-Davidson",
    "model": "Sportster",
    "yearsHint": "2004-2022",
    "note": "RE-RUN: this nameplate's discover agent returned EMPTY in the pilot from search starvation, not because the machine is clean. Evolution 883/1200 air-cooled V-twin, rubber-mounted frame from 2004. Long-documented themes: cam chain tensioner and cam bearing wear, primary chain adjuster, stator and voltage regulator failure, oil weep from the cam cover, and the 2014+ ABS/ECU electrical faults. The 2021+ Sportster S is a COMPLETELY different bike (liquid-cooled Revolution Max 1250T) - do NOT carry Evolution issues onto it.",
    "forums": "xlforum.net, hdforums.com, thesportsterandbuellmotorcycleforum.com, r/Harley"
  },
  {
    "style": "moto",
    "make": "Suzuki",
    "model": "V-Strom 650",
    "yearsHint": "2004-2025",
    "note": "RE-RUN: returned EMPTY in the pilot from search starvation. MAKE COLLISION - this catalog also holds Suzuki Vitara, Swift, Jimny, SX4 (cars). DL650 with the SV650-derived 645cc 90-degree V-twin. Recurring: regulator/rectifier and stator failure (the signature electrical complaint), fuel pump and FI issues, second-gear and clutch basket wear, cam chain tensioner, and rear shock linkage bearing seizure from lack of grease. 2012+ got a revised engine and 2017+ another revision - note which applies.",
    "forums": "stromtrooper.com, vstrom.info, wee-strom forums, r/Vstrom, r/SuzukiMotorcycles"
  },
  {
    "style": "moto",
    "make": "Kawasaki",
    "model": "Ninja 650",
    "yearsHint": "2006-2025",
    "note": "NET-NEW NAMEPLATE and a NET-NEW MAKE for this catalog - Kawasaki has zero rows today. ER-6f/Ninja 650R 2006-2011, 2012-2016, and the 2017+ redesign onto the trellis-frame platform shared with the Z650 and Versys 650, all using the 649cc parallel twin. Recurring documented themes: regulator/rectifier and stator charging failures (the signature complaint on this engine family), fuel pump and FI faults, cam chain tensioner noise, clutch slave cylinder leaks, fork seal and rear shock wear, and the 2020+ TFT/Bluetooth dash issues. Also check NHTSA recalls - Kawasaki files them like any other manufacturer.",
    "forums": "ninja650.net, kawiforums.com, ninjette.org, exriders.com, r/Kawasaki, r/motorcycles"
  }
]

const EXCLUSIONS = [
  {
    "make": "Volkswagen",
    "model": "Jetta",
    "existingTitles": [
      "1.9 TDI Timing Belt Failure on an Interference Engine (Short Original Interval)",
      "2.5L 5-Cylinder Intake Manifold Runner Failure",
      "ABS Control Module and Low-Speed False ABS Activation",
      "Airbag Warning Light, Crash Sensor, and Non-Deployment Concerns",
      "Backup Camera May Not Display an Image - Infotainment Memory Defect (Recall 22V514000)",
      "Brake Light Switch Failure",
      "Coolant Temperature Sensor (Blue/Black Top) Failure",
      "Direct Injection Carbon Buildup on Intake Valves",
      "Driver Frontal Airbag May Not Deploy Due to Contaminated Clock Spring (Recall 15V483000)",
      "DSG Mechatronic Unit Failure",
      "EA888 Gen1/Gen2 Timing Chain Tensioner Failure",
      "Fuel Pump and Fuel Leak Stalling Issues",
      "Hazard Flasher Switch Relay Failure",
      "Heated Seat Element Overheating and Burn-Through",
      "High-Pressure Fuel Pump (HPFP) Failure",
      "Ignition Coil Failure",
      "Ignition Coil Pack Failure Causing Misfires (2.0 ABA and VR6)",
      "Intake Valve Carbon Buildup",
      "PCV Valve/Diaphragm Failure",
      "Plastic Water Pump and Thermostat Housing Failure",
      "Power Window Regulator Clip Failure",
      "Power Window Regulator Failure",
      "Timing Chain Tensioner Failure",
      "Timing Chain Tensioner Failure (TSI)",
      "Turbocharger Failure/Wastegate Rattle",
      "VR6 Plastic Coolant Flange / 'Crack Pipe' Coolant Leak",
      "VR6 Timing Chain Guide and Tensioner Rattle (Rear of Engine)",
      "Water Pump/Thermostat Housing Failure"
    ],
    "yearsCovered": [
      1993,
      1994,
      1995,
      1996,
      1997,
      1998,
      1999,
      2000,
      2001,
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
      2024
    ]
  },
  {
    "make": "Hyundai",
    "model": "Elantra",
    "existingTitles": [
      "ABS Module Electrical Short and Fire Risk",
      "ABS Module Short Circuit Causing Engine Compartment Fire (Recall 20V061)",
      "Airbag Sensor and Control Module Malfunction",
      "Automatic Transmission Input/Output Speed Sensor Failure Causing Harsh Shifting",
      "Brake Light Switch Failure Causing Inoperative Brake Lamps and Shift Interlock Problems",
      "Crankshaft Position Sensor Failure Causing Stalling",
      "Dual Clutch Transmission (DCT) Shudder and Failure",
      "Electronic Power Steering System Failure",
      "Evaporative Emissions Purge Valve and Fuel Tank Pressure Sensor Faults Triggering Check Engine Light",
      "Front Coil Spring Fracture and Tire Damage",
      "Front Lower Control Arm Corrosion and Possible Separation",
      "Front Seat Belt Pretensioner May Explode and Project Metal Fragments (Recall 229)",
      "Front Wheel Bearing Premature Wear Causing Humming Noise and Hub Play",
      "Fuel Pump Module and Fuel Level Sender Failure Causing No-Start or Inaccurate Gauge Readings",
      "IVT/CVT Transmission Failure and Power Loss",
      "MDPS Rubber Coupler Wear — Steering Clunk / Knock and Loss of Assist",
      "Nu Engine Bearing Failure and Seizure",
      "P0011 — Intake Camshaft Timing Over-Advanced (Bank 1) from Stuck CVVT Oil Control Valve",
      "P0016 — Crank/Cam Correlation (Bank 1 Sensor A) from Clogged OCV or Stretched Timing Chain",
      "P0128 — Coolant Below Thermostat Regulating Temp from Stuck-Open Thermostat",
      "P0171 — System Too Lean (Bank 1) from Vacuum Leak / Dirty MAF",
      "P0420 — Catalyst Efficiency Below Threshold (Bank 1), Often Downstream of Nu 2.0L Oil Consumption",
      "Panoramic Sunroof Spontaneous Shattering",
      "Phantom / False Automatic Emergency Braking and Forward Collision Activation",
      "Radiator End Tank Cracking and Coolant Loss on Aging 2.0L Cars",
      "Theft Vulnerability — Missing Engine Immobilizer ('Kia Boyz' / TikTok Challenge)",
      "Timing Belt Neglect Leading to Bent Valves and No-Start",
      "Valve Cover Gasket Oil Leaks Onto Spark Plug Wells and Exhaust Manifold",
      "White / Pearl Paint Peeling and Clear-Coat Delamination ('Scratch Recovery Clear')"
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
    "make": "Lexus",
    "model": "GS",
    "existingTitles": [
      "Dashboard Melting and Sticky Surface",
      "Power Steering Rack Seal Leak",
      "Recall 06V096000: 2006 Lexus GS SRS Air Bag Inflator May Not Deploy With Full Force",
      "Water Pump Premature Failure"
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
      2018,
      2019,
      2020
    ]
  },
  {
    "make": "Nissan",
    "model": "350Z",
    "existingTitles": [
      "Excessive Oil Consumption (Pre-Revision VQ35DE)",
      "Power Window Regulator and Motor Failure",
      "Power Window Regulator Failure",
      "Steering Lock Module and NATS Immobilizer Failure",
      "VQ35DE Rev-Up Engine Oil Consumption"
    ],
    "yearsCovered": [
      2003,
      2004,
      2005,
      2006,
      2007,
      2008,
      2009
    ]
  },
  {
    "make": "Harley-Davidson",
    "model": "Sportster",
    "existingTitles": [],
    "yearsCovered": []
  },
  {
    "make": "Suzuki",
    "model": "V-Strom 650",
    "existingTitles": [],
    "yearsCovered": []
  },
  {
    "make": "Kawasaki",
    "model": "Ninja 650",
    "existingTitles": [],
    "yearsCovered": []
  }
]

const CATEGORIES = ['engine', 'transmission', 'drivetrain', 'electrical', 'brakes', 'suspension', 'cooling', 'fuel', 'interior', 'exterior', 'body', 'safety', 'exhaust', 'steering', 'hvac', 'emissions', 'other']

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
          typicalMileageLow: { type: 'number' },
          typicalMileageHigh: { type: 'number' },
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

const CITATION_RULES = [
  `CITATION RULES - hard requirements:`,
  `  * At least ONE citation per issue must be an official source (NHTSA, manufacturer campaign, TSB) or a real owner community thread. Third-party problem-aggregator sites alone do not qualify.`,
  `  * NEVER cite a raw api.nhtsa.gov endpoint - cite the human-readable nhtsa.gov page or the campaign PDF.`,
  `  * Cite ONLY pages you actually found and opened. Do NOT construct or guess a URL from a pattern - fabricated URLs have polluted this database before, and a guessed static.nhtsa.gov PDF path was tested and 404s.`,
  `  * A forum thread found in search results counts even if the site blocks automated fetching (403).`,
].join('\n')

function fieldSpec(t) {
  return [
    `For EACH issue provide: title (name the component AND the failure mode), description, solution (the real fix, including whether a free recall remedy exists), severity, category (one of: ${CATEGORIES.join(', ')}), years, trims when variant-specific, engines[] when the failure is engine-code specific, symptoms[], recallCampaigns[] (NHTSA campaign numbers such as 24V123 - state these ONLY where you actually found them), dtcCodes[] where genuinely documented, estimatedCostLow/High and typicalMileageLow/High when known, and citations[].`,
    ``,
    `ENGINE-CODE SPECIFICITY: the model name is not enough. A failure on one engine is not a failure on another sold in the same body. Where the note above names specific engines, tag down to them.`,
  ].join('\n')
}

// ---------------------------------------------------------------- prompts

function discoverOfficialFirst(t) {
  const existing = existingFor(t)
  const isEv = t.style === 'ev'
  return [
    `You research REAL, documented known issues for a RECENTLY LAUNCHED vehicle. Vehicle: ${t.make} ${t.model} (${t.yearsHint}).`,
    ``,
    `Context on this vehicle: ${t.note}`,
    ``,
    `This vehicle is NEW. That changes where the evidence lives, so change where you look:`,
    `  1. OFFICIAL FIRST - NHTSA recalls and complaints, manufacturer recall and service campaigns, TSBs, stop-sale and delivery-hold notices, OEM service documentation. On a vehicle this new this is the RICHEST and most reliable source and where most of your effort should go.`,
    `  2. OWNER COMMUNITIES second - ${t.forums}. These exist but are THIN for a vehicle this new. Use them to corroborate and add detail, not as primary evidence.`,
    ``,
    `Because the forums are thin, the temptation to fill gaps with plausible-sounding threads is high. Do not. One issue grounded in a verifiable recall campaign is worth more than five with invented forum links. If you cannot find real evidence, return fewer issues.`,
    ``,
    `WE ALREADY HAVE THESE ${existing.length} ISSUES. Do NOT return any of them or a reworded restatement:`,
    existing.length ? existing.map((s) => `  - ${s}`).join('\n') : '  (none - this nameplate has NO coverage at all yet, so establish the foundational issues)',
    ``,
    `Find 6-10 ADDITIONAL well-documented issues NOT in that list.`,
    ``,
    isEv
      ? `THE EV FAILURE SURFACE IS NOT THE ICE ONE. Look specifically at: high-voltage battery and BMS faults; ICCU / on-board charger / DC-DC converter failures; DC fast-charging faults and derating; thermal management and heat pump; 12V auxiliary battery drain (an extremely common real complaint on new EVs); software and OTA update failures; infotainment; regenerative braking and brake-blending; drive-unit and reduction-gear failures; and propulsion-power-loss campaigns.`
      : `FAILURE SURFACE: this is an internal-combustion or hybrid vehicle in its first generation. Concentrate on the powertrain the note names (new turbo engines, new transmissions and new hybrid systems generate the launch-period failures), plus electrical and infotainment architecture, ADAS false activations, and any seat, belt or airbag campaigns.`,
    ``,
    `PLATFORM SIBLINGS - the single biggest error risk in this wave. Several targets share hardware with vehicles already in this catalog. A recall or failure on a sibling is NOT automatically an issue on THIS nameplate. Before you attribute one, confirm NHTSA or the manufacturer actually names THIS vehicle. Copying failures across platform mates is the exact error a previous cross-link audit caught.`,
    ``,
    `MODEL YEARS: this vehicle is 1-5 years old. Never return a year that predates its launch.`,
    ``,
    fieldSpec(t),
    ``,
    `CATEGORY MAPPING - the list is CLOSED and shared with the whole catalog. Map concepts INTO it, never extend it: HV battery / BMS / charging / ICCU / 12V / software -> electrical; drive unit and reduction gear -> drivetrain; regenerative braking -> brakes; heat pump and cabin climate -> hvac; thermal management of the pack -> cooling.`,
    ``,
    isEv
      ? `DTC CODES: most EV faults surface as manufacturer-specific codes or dash messages, not generic OBD-II P-codes. Provide dtcCodes[] only where a code is genuinely documented for this vehicle. Never infer one by analogy to a gas car.`
      : `DTC CODES: provide them only where genuinely documented for this vehicle. Never infer a code by analogy to a related model.`,
    ``,
    CITATION_RULES,
    ``,
    `Accuracy over volume. A single isolated complaint is an anecdote, not a known issue. Never invent an issue or a citation. Respond ONLY via the StructuredOutput tool.`,
  ].join('\n')
}

function discoverForumFirst(t) {
  const existing = existingFor(t)
  const isThin = t.style === 'thin'
  return [
    `You research REAL, documented known issues for a specific vehicle. Vehicle: ${t.make} ${t.model} (${t.yearsHint}).`,
    ``,
    `Context on this vehicle: ${t.note}`,
    ``,
    isThin
      ? `THIS NAMEPLATE HAS ALMOST NO COVERAGE IN OUR DATABASE - ${existing.length} issue(s) for a vehicle sold for years with an active owner community. Read that as a COVERAGE GAP, not as evidence the vehicle is reliable. The note above names failures that are extensively documented. Your job is to establish the foundational record for this nameplate.`
      : `THIS IS A HIGH-VOLUME NAMEPLATE CARRYING ONLY ${existing.length} ISSUES, while comparable-volume vehicles in this catalog average 50 or more. It is under-documented, not clean. Go deep: this vehicle has decades of owner reporting behind it.`,
    ``,
    `WHERE TO LOOK, in order:`,
    `  1. OWNER COMMUNITIES FIRST - ${t.forums}. On a vehicle with this much history the forums hold detail no government summary ever captures: which build months, which engine code, what the actual fix was, what the dealer denied.`,
    `  2. OFFICIAL SOURCES second - NHTSA recalls and complaints, manufacturer campaigns, TSBs, class-action settlements and extended warranty notices. These make an issue checkable.`,
    ``,
    `WE ALREADY HAVE THESE ${existing.length} ISSUES. Do NOT return any of them or a reworded restatement:`,
    existing.length ? existing.map((s) => `  - ${s}`).join('\n') : '  (none)',
    ``,
    `Find ${isThin ? '8-12' : '10-14'} ADDITIONAL well-documented issues NOT in that list. Spread them across generations and across systems - do not return ten variations of the same engine complaint.`,
    ``,
    `GENERATION AND ENGINE DISCIPLINE: this nameplate spans multiple generations and engines. A failure on one generation is NOT a failure on the next, and the most common error on nameplates like this is merging two different engines' stories into one issue. The note above names the specific traps.`,
    ``,
    fieldSpec(t),
    ``,
    `CATEGORY MAPPING - the list is CLOSED and shared with the whole catalog. Map concepts INTO it, never extend it.`,
    ``,
    CITATION_RULES,
    ``,
    `Accuracy over volume. A single isolated complaint is an anecdote, not a known issue. Never invent an issue or a citation. Respond ONLY via the StructuredOutput tool.`,
  ].join('\n')
}

function discoverMoto(t) {
  const existing = existingFor(t)
  return [
    `You research REAL, documented known issues for a specific MOTORCYCLE. Machine: ${t.make} ${t.model} (${t.yearsHint}).`,
    ``,
    `Context on this machine: ${t.note}`,
    ``,
    `This is a motorcycle, not a car. Treat it as one: riders diagnose and document differently, and the failure surface is different - charging systems (stator, regulator/rectifier), final drive (chain, belt, or shaft and its splines), fork seals and steering head bearings, cam chain tensioners, clutch baskets and slave cylinders, fuel pumps and FI, and corrosion on exposed components are the recurring themes across most makes.`,
    ``,
    `WHERE TO LOOK, in order:`,
    `  1. RIDER COMMUNITIES FIRST - ${t.forums}. These are the primary record for motorcycles; long-running model-specific forums document failures in far more detail than any official source.`,
    `  2. OFFICIAL SOURCES second - NHTSA recalls (manufacturers file motorcycle campaigns like any other vehicle), manufacturer service bulletins and campaigns.`,
    ``,
    `WE ALREADY HAVE THESE ${existing.length} ISSUES. Do NOT return any of them or a reworded restatement:`,
    existing.length ? existing.map((s) => `  - ${s}`).join('\n') : '  (none - this machine has NO coverage yet, so establish the foundational issues)',
    ``,
    `Find 8-12 well-documented issues NOT in that list.`,
    ``,
    `GENERATION AND ENGINE DISCIPLINE: the note above names the generation split for this machine, and it matters more on bikes than on cars because manufacturers reuse a nameplate across completely unrelated engines. Never carry a finding across that split.`,
    ``,
    fieldSpec(t),
    ``,
    `CATEGORY MAPPING - the category list is CLOSED and SHARED with the automotive catalog. The renderer knows exactly these 17 and nothing else. Map motorcycle concepts INTO the set, never extend it: final drive / chain / belt / shaft splines -> drivetrain; fairing and bodywork -> exterior; stator, regulator-rectifier and wiring -> electrical; forks, shocks and steering head bearings -> suspension (or steering where it is genuinely the steering head).`,
    ``,
    `DTC CODES: motorcycles largely do NOT use OBD-II. Codes here are manufacturer-specific (Harley P- and B-codes, Honda/Yamaha/Suzuki/Kawasaki FI blink codes). Provide dtcCodes[] only where a code is genuinely documented for THIS machine, and never one borrowed from automotive OBD-II.`,
    ``,
    CITATION_RULES,
    ``,
    `Accuracy over volume. A single isolated complaint is an anecdote, not a known issue. Never invent an issue or a citation. Respond ONLY via the StructuredOutput tool.`,
  ].join('\n')
}

function discoverPrompt(t) {
  if (t.style === 'moto') return discoverMoto(t)
  if (t.style === 'ev' || t.style === 'new') return discoverOfficialFirst(t)
  return discoverForumFirst(t)
}

function verifyPrompt(t, c) {
  const existing = existingFor(t)
  const isNewish = t.style === 'ev' || t.style === 'new'
  const kind = t.style === 'moto' ? 'MOTORCYCLE' : (isNewish ? 'RECENTLY LAUNCHED vehicle' : 'vehicle')
  return [
    `You are a skeptical automotive fact-checker. DEFAULT TO REFUTING unless the evidence is solid. Subject: ${t.make} ${t.model} (${t.yearsHint}) - a ${kind}.`,
    ``,
    `CLAIM:`,
    `Title: ${c.title}`,
    `Description: ${c.description}`,
    `Years: ${(c.years || []).join(', ')}`,
    `Engines claimed: ${(c.engines || []).join(', ') || '(none)'}`,
    `Recall campaigns claimed: ${(c.recallCampaigns || []).join(', ') || '(none)'}`,
    `Cited URLs: ${(c.citations || []).map((x) => x.url).join(' | ') || '(none)'}`,
    ``,
    `Context on this vehicle: ${t.note}`,
    ``,
    `ISSUES ALREADY IN OUR DATABASE for this nameplate:`,
    existing.length ? existing.map((s) => `  - ${s}`).join('\n') : '  (none)',
    ``,
    `Verify:`,
    `(1) PLATFORM AND GENERATION. Is this genuinely documented for THIS nameplate, THIS generation and THIS engine - or is it a sibling's or a different generation's problem copied across? Shared hardware makes a shared defect PLAUSIBLE but never automatic. If a recall is claimed, confirm the campaign lists THIS vehicle.`,
    `(2) If a recall campaign number is claimed, does it exist AND cover this make/model? An invented campaign number is the clearest possible sign of fabrication.`,
    `(3) Do the cited URLs exist, resolve, and support the claim? A 404 is not a live citation. A 403 from a forum that clearly exists DOES count as live.`,
    `(4) Are the model years plausible for this nameplate and generation?`,
    isNewish
      ? `(5) Is this a RECURRING documented problem or a handful of early-adopter complaints? New vehicles attract loud launch-period noise, and a software annoyance that one OTA fixed is not a known issue.`
      : `(5) Is this a RECURRING documented problem affecting a meaningful population, or one owner's bad luck amplified by a single thread?`,
    `(6) Is it substantively the same problem as one already in our database above (isDuplicate)? Judge on the FAILURE, not the wording.`,
    ``,
    `Classify sources: hasOfficialSource (NHTSA / manufacturer campaign / TSB), hasOwnerCommunitySource (a real owner or rider forum, or a model-specific community), hasNonAggregatorSource (either of those, as opposed to third-party problem-aggregator sites).`,
    ``,
    `Return isReal, confidence 0-1, hasLiveCitation, hasNonAggregatorSource, hasOwnerCommunitySource, hasOfficialSource, isDuplicate, and a one-sentence reason. If the citations look fabricated, or you cannot corroborate a recurring documented problem, isReal=false.`,
  ].join('\n')
}

// ------------------------------------------------------------------- run

const byStyle = {}
for (const t of TARGETS) byStyle[t.style] = (byStyle[t.style] || 0) + 1
log(`Wave 11: ${TARGETS.length} targets — ${Object.entries(byStyle).map(([k, v]) => `${k}:${v}`).join('  ')}`)

const perModel = await pipeline(
  TARGETS,
  (t) => agent(discoverPrompt(t), { label: `discover:${t.make} ${t.model}`, phase: 'Discover', schema: DISCOVER_SCHEMA })
    .then((d) => ({ t, candidates: (d && Array.isArray(d.candidates)) ? d.candidates : [] })),
  (disc) => {
    const { t, candidates } = disc
    if (!candidates.length) {
      return { make: t.make, model: t.model, style: t.style, found: 0, confirmed: [], forumBacked: 0, officialBacked: 0 }
    }
    return parallel(candidates.map((c) => () =>
      agent(verifyPrompt(t, c), { label: `verify:${t.model}`, phase: 'Verify', schema: VERDICT_SCHEMA })
        .then((v) => {
          if (!v) return null
          // EVIDENCE gates only — see the header note on why there is no numeric confidence threshold.
          if (!v.isReal) return null
          if (!v.hasLiveCitation) return null
          if (!v.hasNonAggregatorSource) return null
          if (v.isDuplicate) return null
          if (!Array.isArray(c.citations) || c.citations.length === 0) return null
          return {
            ...c,
            make: t.make,
            model: t.model,
            vehicleType: t.style === 'moto' ? 'motorcycle' : 'car',
            _style: t.style,
            _verdict: v,
            _verdictConfidence: v.confidence,
            _verdictReason: v.reason,
            _forumBacked: !!v.hasOwnerCommunitySource,
            _officialBacked: !!v.hasOfficialSource,
          }
        })
    )).then((res) => {
      const kept = res.filter(Boolean)
      return {
        make: t.make, model: t.model, style: t.style,
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
const styleTotals = {}
for (const r of perModel.filter(Boolean)) {
  totalFound += r.found
  totalForum += r.forumBacked
  totalOfficial += r.officialBacked
  styleTotals[r.style] = styleTotals[r.style] || { found: 0, confirmed: 0 }
  styleTotals[r.style].found += r.found
  styleTotals[r.style].confirmed += r.confirmed.length
  perModelStats.push({ make: r.make, model: r.model, style: r.style, found: r.found, confirmed: r.confirmed.length, forumBacked: r.forumBacked, officialBacked: r.officialBacked })
  log(`[${r.style}] ${r.make} ${r.model}: ${r.confirmed.length}/${r.found} confirmed, ${r.officialBacked} official-backed, ${r.forumBacked} forum-backed`)
  for (const c of r.confirmed) confirmed.push(c)
}
for (const [s, v] of Object.entries(styleTotals)) log(`  style ${s}: ${v.confirmed}/${v.found} confirmed`)
log(`WAVE 11 TOTAL: ${confirmed.length}/${totalFound} confirmed, ${totalOfficial} official-backed, ${totalForum} forum-backed`)

return { result: { confirmed, stats: { models: TARGETS.length, found: totalFound, confirmed: confirmed.length, forumBacked: totalForum, officialBacked: totalOfficial, byStyle: styleTotals, perModel: perModelStats } } }
