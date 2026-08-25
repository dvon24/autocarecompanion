/**
 * RESEARCH WAVE 6 - THIN HIGH-VOLUME NAMEPLATES.
 *
 * Wave 5 targeted models by GSC clicks. Wave 6 targets the other under-served group: mainstream
 * US nameplates with millions on the road but only 9-11 documented issues. Measured against the
 * top-15 US sellers, which average 56 issues across 14 of 17 categories, these are the outliers.
 *
 * Palisade 9 - Seltos 9 - Mazda3 9 - Tiguan 9 - Compass 9 - Gladiator 9 - Prius 10 - Edge 10 -
 * Forte 10 - CX-50 10 - Sienna 11 - Ridgeline 11
 *
 * VW is also a quarterly-priority make (3 of 22 models covered).
 *
 * WARNING carried from wave 5: on Hyundai/Kia GDI engines the verifier caught a confirmed issue
 * claiming KSDS Campaign 966/982 and the GDI class settlement covered a model they do NOT list.
 * Forte (Nu GDI) and Seltos (Gamma II 1.6T) are exposed to the same error - its per-model note
 * says to verify model-specific campaign coverage rather than assume it. Run
 * scripts/_qa-verdict-caveats.js on the output before persisting.
 *
 * Carries the wave-3/4/5 prompt fixes: owner communities named first, no aggregator named,
 * >=1 non-aggregator citation gated via hasNonAggregatorSource, raw api.nhtsa.gov banned.
 */
export const meta = {
  name: 'research-wave6-thin-volume',
  description: 'Wave-6: 12 mainstream high-volume US nameplates carrying only 9-11 documented issues. Forum-weighted discover + adversarial verify',
  phases: [
    { title: 'Discover' },
    { title: 'Verify' },
  ],
}

const EXCLUSIONS = [
  {
    "make": "Hyundai",
    "model": "Palisade",
    "existingTitles": [
      "8-Speed Automatic Harsh Shifting / Delayed Downshift",
      "ABS / Traction Control Malfunction on Rough Roads (Class-Action Braking Defect)",
      "Foul Cabin Odor from Headrests / Interior Materials",
      "Headlight Assembly Moisture Intrusion / Condensation",
      "Idle Stop & Go (ISG) Electric Oil Pump Controller Fire Risk \u2014 Recall 246 / 23V526",
      "Infotainment Screen Blackout & BlueLink Telematics Failures",
      "Oil Dilution / Gasoline Contamination in Engine Oil",
      "Seat Belt Buckle Fails to Latch (Out-of-Spec Buckle Assembly) \u2014 Recall 25V607",
      "Third-Row Side Curtain Airbag Improper Deployment (FMVSS 226 Failure) \u2014 Recall 26V034"
    ],
    "yearsCovered": [
      2020,
      2021,
      2022,
      2023,
      2024,
      2025
    ]
  },
  {
    "make": "Kia",
    "model": "Seltos",
    "existingTitles": [
      "1.6L Turbo 7-Speed Dry DCT Overheating, Shudder and Hesitation",
      "CVT Hesitation and Jerking Under Load",
      "Idle Stop & Go Oil Pump Overheating",
      "Instrument Cluster Goes Blank on Startup",
      "LED Headlight / DRL / Fog Lamp Internal Condensation",
      "Missing Engine Immobilizer \u2014 \"Kia Boys\" USB Theft Vulnerability",
      "Piston Oil Ring Defect and Engine Damage",
      "Side Curtain Airbag Inadvertent Deployment (Recall 23V830 / SC289)",
      "Stalling and Fire Hazard on Unrepaired / Still-Symptomatic 2021-2023 2.0L Vehicles"
    ],
    "yearsCovered": [
      2021,
      2022,
      2023,
      2024,
      2025
    ]
  },
  {
    "make": "Mazda",
    "model": "Mazda3",
    "existingTitles": [
      "2004-2010 Mazda3 EVAP Leak or P0441 - Test Before Replacing the Purge Valve",
      "2010 Mazda3 Sticky Dashboard Surface - SSP99",
      "2012-2013 Mazda3 SKYACTIV Cold-Start Misfire from Intake-Valve Deposits",
      "2012-2016 Mazda3 Six-Speed Manual Hard Shifting or Shift-Lever Vibration",
      "2014-2016 Mazda3 Hand-Operated Parking Brake Corrosion - Recall 1217F",
      "2019-2022 Mazda3 Mazda Connect Blank Screen, Freeze, or Reboot",
      "Rear Shock Absorber Upper Mount Failure",
      "Rear Torsion Beam Bushing Deterioration",
      "Windshield Spontaneous Stress Cracking"
    ],
    "yearsCovered": [
      2004,
      2005,
      2006,
      2007,
      2008,
      2009,
      2010,
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
    "make": "Volkswagen",
    "model": "Tiguan",
    "existingTitles": [
      "DSG Mechatronic Unit Failure",
      "EA888 Water Pump and Thermostat Housing Failure",
      "Panoramic Sunroof Cracking and Exploding",
      "Panoramic Sunroof Drain Clog and Water Leak",
      "Rear Hatch Wiring Harness Break",
      "Rear Visibility Noncompliance - Camera Image May Not Show on Screen (Recall 91DV)",
      "Steering Wheel Clock Spring Debris Contamination - Driver Airbag Recall 15V483000",
      "Timing Chain Tensioner Failure (Gen 1 EA888)",
      "Valve Cover Gasket and PCV Valve Oil Leak"
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
    "make": "Jeep",
    "model": "Compass",
    "existingTitles": [
      "2.4L Tigershark Oil Pump Failure / Engine Stalling",
      "9-Speed Automatic Transmission Rough Shifting",
      "A/C Evaporator Core Leak",
      "Electrical System / Voltage Regulator Failure Causing Stalling",
      "Jatco CVT Transmission Failure / Overheating",
      "Liftgate Strut Failure and Liftgate Dropping",
      "Oil Filter Housing Leak (2.4L Tigershark)",
      "Thermostat Housing Coolant Leak",
      "Windshield Stress Cracking"
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
      2023,
      2024,
      2025
    ]
  },
  {
    "make": "Jeep",
    "model": "Gladiator",
    "existingTitles": [
      "Automatic Transmission Stalling / Auto-Park Engagement",
      "Death Wobble / Steering Shimmy",
      "Electronic Locker (E-Locker) Actuator Failure",
      "Frame Weld Seam Corrosion / Premature Rust",
      "Instrument Panel Cluster (IPC) Failure",
      "Manual Transmission Clutch Hydraulic Failure",
      "Manual Transmission Clutch Overheating / Fire Risk",
      "Rear Window Leak into Cab",
      "TPMS Sensor Premature Failure"
    ],
    "yearsCovered": [
      2020,
      2021,
      2022,
      2023,
      2024,
      2025
    ]
  },
  {
    "make": "Toyota",
    "model": "Prius",
    "existingTitles": [
      "12V Auxiliary Battery Drain and Failure",
      "1NZ-FXE Head Gasket Failure and EGR Cooler Issues",
      "3rd Generation 2ZR-FXE Excessive Oil Consumption",
      "Catalytic Converter Theft Vulnerability",
      "EGR Valve and Intake Manifold Carbon Buildup",
      "Hybrid Battery Pack (HV Battery) Failure",
      "Inverter Coolant Pump Failure",
      "Prius and Prius Prime: Incorrect Load Capacity Modification Label (GST Recall 24V548000)",
      "Recall 06V096000: Side, Curtain and Knee Air Bag Inflator Defect on 2004-2006 Prius",
      "Reverse Camera Image Freezes or Goes Blank From Parking Assist Software Error (Recall 25V744000)"
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
    "make": "Ford",
    "model": "Edge",
    "existingTitles": [
      "2.0L EcoBoost Coolant Intrusion - Open-Deck Block Failure",
      "2.0L EcoBoost Water Pump Failure and Coolant Leak",
      "3.5L V6 Timing Chain Stretch and VCT Phaser Rattle",
      "6F35 Transmission Harsh Shifting and Shudder",
      "MyFord Touch / APIM Module Failure - Unresponsive Touchscreen",
      "Panoramic Sunroof Spontaneous Cracking",
      "Power Transfer Unit (PTU) Fluid Leak and Failure - AWD Models",
      "Rear Shock Absorber Premature Failure and Leaking",
      "Recall 15V005 - Fuel Pump Can Fail and Stall the Vehicle",
      "Steering Gear Motor Attachment Bolt Corrosion in Salt-Belt States (Recall 19V632 / Ford 19S26)"
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
      2023,
      2024
    ]
  },
  {
    "make": "Kia",
    "model": "Forte",
    "existingTitles": [
      "ABS/HECU Brake-Fluid Leak Causing Electrical Short and Engine-Bay Fire",
      "Airbag Control Unit Electrical Fault - Airbags May Not Deploy in a Crash",
      "Clear-Coat / Paint Peeling and Flaking (Snow White Pearl and Light Colors)",
      "Connecting Rod Bearing Failure Causing Engine Seizure, Sudden Stall and Fire Risk",
      "CVT Shudder and Hesitation Under Acceleration",
      "Front Strut Bearing and Upper Spring Pad Noise/Failure",
      "Headlight and Taillight Moisture Condensation",
      "Motor-Driven Power Steering (MDPS) Flexible Coupler Knocking/Clunking",
      "Nu 2.0L GDI Engine Knocking and Oil Consumption",
      "Premature Low-Beam Headlight Burnout from Melting Connector/Socket"
    ],
    "yearsCovered": [
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
    "make": "Mazda",
    "model": "CX-50",
    "existingTitles": [
      "ABS Hydraulic Control Unit (HCU) Internal Damage Reduces Braking \u2014 Recall 23V-275 / Mazda 5823D",
      "Accessory Trailer Hitch Bolts Under-Torqued / Hitch Can Detach \u2014 Recall 7225C (25V-167)",
      "Cylinder Deactivation Solenoid Failure with Metal Shavings in Oil (Naturally-Aspirated 2.5L)",
      "Excessive Wind Noise from Roof Rails",
      "Forward Sensing Camera Mode-Setting Error / i-Activsense Malfunction \u2014 Recall 6824H (24V-649)",
      "Hybrid System Failure Warning / No-Start \u2014 Powertrain Gateway Unit Logic (TSB 30-001/25)",
      "Infotainment System Lag and Slow Response",
      "Transmission Hesitation on Acceleration",
      "Turbo Wastegate Rattle on Cold Start",
      "Windshield Cracking Radiating from Driver-Side A-Pillar with Little/No Impact"
    ],
    "yearsCovered": [
      2023,
      2024,
      2025
    ]
  },
  {
    "make": "Toyota",
    "model": "Sienna",
    "existingTitles": [
      "2GR-FE V6 Excessive Oil Consumption",
      "2GR-FE Water Pump Bearing Failure and Coolant Leak",
      "3.5L 2GR-FE Oil Leak from VVT-i System and Timing Cover",
      "AC Evaporator Core Leak and Refrigerant Loss",
      "Dashboard Cracking and Melting",
      "Denso Low-Pressure Fuel Pump Failure Causing Engine Stall (Recall 20V-682 / 20TA02)",
      "EVAP System Leak-Detection / Vapor Canister Fault (Check Engine Light, Hard Refueling)",
      "Hybrid Battery Performance Degradation Signs",
      "Power Sliding Door Malfunction",
      "Power Steering Rack Seal Leak",
      "Rearview Camera Image Freeze or Blank Screen in Reverse (Recall 25V744 / 25TB13)"
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
      2016,
      2017,
      2018,
      2019,
      2020,
      2021,
      2022,
      2023,
      2024,
      2025,
      2026
    ]
  },
  {
    "make": "Honda",
    "model": "Ridgeline",
    "existingTitles": [
      "10-Speed Transmission - Rough Shifting and Programming Defect",
      "Brake Master Cylinder Separation Recall (NHTSA 23V-458)",
      "Fuel Pump Failure Recall (NHTSA 23V-858)",
      "Honda Sensing - Collision Mitigation False Braking",
      "Idle Stop & Go (ISG) - Failure to Restart Investigation",
      "In-Bed Trunk Water Intrusion and Drainage Clogs",
      "Infotainment Touchscreen Black Screen and System Failure",
      "Radiator Cross-Contamination (SMOD) - Catastrophic Transmission Failure",
      "Rear Differential Noise and Shuddering (AWD Models)",
      "Spark Plugs Backing Out - Coil Pack Melting and Engine Damage",
      "VCM System - Excessive Oil Consumption and Misfires"
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
      2017,
      2018,
      2019,
      2020,
      2021,
      2022,
      2023
    ]
  }
]

const TARGETS = [
  { make: 'Hyundai',    model: 'Palisade',  yearsHint: '2020-present', note: 'LX2 three-row SUV, 3.8 Lambda II GDI V6, 8AT. Early cars had a widely-reported cabin odor complaint. Twin of the Kia Telluride.', forums: 'palisadeforums.org, hyundai-forums.com, r/Palisade, r/Hyundai' },
  { make: 'Kia',        model: 'Seltos',    yearsHint: '2021-present', note: 'SP2 compact SUV, 2.0 MPI with IVT (CVT) or 1.6 T-GDI with 7-speed DCT. The 1.6T Gamma II has had engine-failure recalls.', forums: 'kiaseltosforum.com, kia-forums.com, r/KiaSeltos, r/kia' },
  { make: 'Mazda',      model: 'Mazda3',    yearsHint: '2004-present', note: 'BK 2004-2009, BL 2010-2013, BM/BN 2014-2018 (Skyactiv-G), BP 2019+ (incl. 2.5 Turbo and Skyactiv-X). Older BK/BL are known for rear-arch rust.', forums: 'mazda3forums.com, forum.mazda3revolution.com, r/mazda3, r/Mazda' },
  { make: 'Volkswagen', model: 'Tiguan',    yearsHint: '2009-present', note: '5N 2009-2017 (2.0 TSI EA888 gen1/2 - timing chain tensioner is the notorious failure) and MQB AD1 2018+ (EA888 gen3, 8AT). Quarterly-priority make.', forums: 'vwtiguanforums.com, vwvortex.com, tiguanforums.com, r/Tiguan, r/Volkswagen' },
  { make: 'Jeep',       model: 'Compass',   yearsHint: '2007-present', note: 'MK 2007-2016 (2.0/2.4 World Engine, CVT2) and MP 2017+ (2.4 Tigershark MultiAir2, 6AT/9AT ZF). Tigershark oil consumption is widely reported.', forums: 'jeepcompassforum.com, jeepgarage.org, r/jeep, r/JeepCompass' },
  { make: 'Jeep',       model: 'Gladiator', yearsHint: '2020-present', note: 'JT pickup on the JL Wrangler platform, 3.6 Pentastar and the 3.0 EcoDiesel. Shares JL steering-damper/death-wobble and frame concerns.', forums: 'jeepgladiatorforum.com, jlwranglerforums.com, r/JeepGladiator, r/Jeep' },
  { make: 'Toyota',     model: 'Prius',     yearsHint: '2004-present', note: 'XW20 2004-2009, XW30 2010-2015 (EGR cooler clogging, head gasket), XW50 2016-2022, XW60 2023+. Hybrid battery and inverter failures are generation-specific. Very high fleet volume.', forums: 'priuschat.com, toyotanation.com, r/prius, r/ToyotaHybrids' },
  { make: 'Ford',       model: 'Edge',      yearsHint: '2007-present', note: 'CD3 2007-2014 (3.5/3.7 Duratec, 6F50) and CD4 2015-2024 (2.0 EcoBoost, 2.7 EcoBoost Sport/ST, 8F35 from 2019). PTU failure on AWD is a known weak point.', forums: 'fordedgeforum.com, edgeforums.com, f150forum network, r/FordEdge, r/Ford' },
  { make: 'Kia',        model: 'Forte',     yearsHint: '2010-present', note: 'TD 2010-2013, YD 2014-2018 (2.0 Nu MPI/GDI), BD 2019-2024 (2.0 Nu with IVT, plus 1.6T GT). Nu GDI engines fall under the Hyundai/Kia engine settlement and KSDS campaigns - verify Forte-specific coverage rather than assuming it.', forums: 'kia-forums.com, kiaforteforum.com, r/kia, r/KiaForte' },
  { make: 'Mazda',      model: 'CX-50',     yearsHint: '2023-present', note: 'Built in Alabama on the Small Platform, 2.5 Skyactiv-G and 2.5 Turbo, 6AT; hybrid added for 2025 using Toyota hybrid hardware. Distinct from the CX-5.', forums: 'cx50forum.com, mazdas247, r/mazda, r/CX50' },
  { make: 'Toyota',     model: 'Sienna',    yearsHint: '2004-present', note: 'XL20 2004-2010, XL30 2011-2020 (2GR-FE V6, sliding-door and power-door failures), XL40 2021+ (hybrid-only 2.5 THS II). Very high fleet volume as a family and rideshare vehicle.', forums: 'siennachat.com, toyotanation.com, r/ToyotaSienna, r/Toyota' },
  { make: 'Honda',      model: 'Ridgeline', yearsHint: '2006-present', note: 'YK1 2006-2014 (unibody, 3.5 J35) and YK2/YK3 2017+ (J35Y6, 6AT then 9AT ZF). Shares the Pilot/Odyssey J35 platform, so VCM-related oil consumption and misfire patterns are relevant.', forums: 'ridgelineownersclub.com, hondaridgeline.org, r/Ridgeline, r/Honda' },
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

log(`Wave 6: ${TARGETS.length} models — Mercedes-Benz depth + modern-EV thin set`)

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
