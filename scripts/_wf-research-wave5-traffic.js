/**
 * RESEARCH WAVE 5 (TRAFFIC-LED) - 12 models chosen by SEARCH DEMAND, not by make thinness.
 *
 * Waves 1-4 picked targets by how thin a MAKE was; fix-parts picked by email leads. Wave 5
 * inverts that: these models already earn GSC clicks while carrying only 4-20 issues.
 * Devon's Aug 1-21 data: 10.1k clicks / 967k impressions / avg position 8.2. Winners include
 * Hyundai Accent (184 clicks, TOP PAGE OF THE SITE, 7 issues), VW Taos (112), Renault Twizy
 * (95), BMW iX3 (71); rising clusters include bmw i5 +1,100%, bmw i4 +900%,
 * 2025 Mitsubishi Outlander +400%.
 *
 * Two non-US models are deliberate: BMW iX3 (Europe/China only) and Renault Twizy (EU
 * quadricycle). Both rank today and both draw non-English queries ("renault twizy
 * klimaanlage", "bmw i4 tyyppiviat"). Their evidence is UK/EU/FR/DE owner communities and
 * EU recall notices, NOT NHTSA - the per-model notes say so.
 *
 * Carries the wave-3/4 prompt fixes: owner communities named first, no aggregator named,
 * >=1 non-aggregator citation gated via hasNonAggregatorSource, raw api.nhtsa.gov banned.
 */
export const meta = {
  name: 'research-wave5-traffic',
  description: 'Wave-5 TRAFFIC-LED: 12 models that earn real GSC clicks but have thin coverage. Forum-weighted discover + adversarial verify',
  phases: [
    { title: 'Discover' },
    { title: 'Verify' },
  ],
}

const EXCLUSIONS = [
  {
    "make": "Hyundai",
    "model": "Accent",
    "existingTitles": [
      "A/C Compressor Premature Failure",
      "ABS/HECU Brake-Fluid Leak Causing Engine-Compartment Fire (Recall 23V-651 / Campaign 251)",
      "Brake Light / Stop Lamp Switch Failure",
      "Crankshaft Position Sensor Failure",
      "IVT/CVT Transmission Failure and Shudder",
      "Rear Suspension Clunk / Torsion Beam Bushing Wear",
      "Seat-Belt Pretensioner May Explode and Send Shrapnel (Recall 229 / NHTSA 22V-354)"
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
      2020,
      2021,
      2022
    ]
  },
  {
    "make": "BMW",
    "model": "i5",
    "existingTitles": [
      "12V Auxiliary Battery Drain and Dead Car Syndrome",
      "2024 i5 Pedestrian Sound Recall 23V-885",
      "2024 i5 Propulsion-Loss Recall 25V-395",
      "2024-2025 i5 Integrated Brake System Recall 26V-422",
      "2024-2025 i5 Integrated-Brake Recall 24V-697",
      "2024-2025 i5 Steering-Spindle Recall 24V-714",
      "2024-2026 i5 A/C Harness Recall 26V-096",
      "Adaptive Suspension Self-Leveling Calibration Errors",
      "DC Fast-Charge Throttling and Loud Cooling Fans on Repeated Sessions",
      "Early-Production G60 i5 Condensation-Drain Drum Noise",
      "i5 Integrated Brake System Recall 24V104000 (2024-2025)",
      "iDrive 8.5 Software Bugs and EV System Errors",
      "iDrive 9 Software Updates and Calibration Issues",
      "Regenerative Braking Inconsistency in Cold Weather",
      "Single-Vehicle 2024 i5 Battery-Weld Recall 24V-135"
    ],
    "yearsCovered": [
      2024,
      2025,
      2026
    ]
  },
  {
    "make": "BMW",
    "model": "i4",
    "existingTitles": [
      "12V Auxiliary Battery Drain",
      "12V Battery Drain - Sleep Mode Failure",
      "2022-2023 i4 eDrive40 Sound-Generator Recall 23V-026",
      "2022-2025 i4 Propulsion-Loss Recall 25V-395",
      "G26 i4 Coolant Changeover-Valve Leak Diagnosis",
      "Heat Pump Malfunction in Cold Weather",
      "iDrive 8 Software and Infotainment Glitches",
      "iDrive 8 Software Bugs - Screen Crashes, Reboots & Freezing",
      "Regenerative Braking Pedal Feel Complaints - Grabby/Aggressive"
    ],
    "yearsCovered": [
      2022,
      2023,
      2024,
      2025,
      2026
    ]
  },
  {
    "make": "BMW",
    "model": "iX3",
    "existingTitles": [
      "12V Auxiliary Battery Drain and Failure",
      "2021 iX3 Cell-Supervision Cable-Bridge Recall",
      "2021 iX3 Intermediate-Circuit Discharge Recall",
      "Charging Socket Lock Fault \u2014 Cable Will Not Unlock / Charging Won't Initiate",
      "iDrive Infotainment Software Freezes and Reboots",
      "Rear Brake Disc Corrosion and Caliper Seizure from Regen Under-Use",
      "Regenerative Braking Lag and Inconsistency"
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
    "make": "Toyota",
    "model": "bZ4X",
    "existingTitles": [
      "12V Auxiliary Battery Premature Failure and No-Start",
      "Charge Connector / Port Locking Mechanism Sticking",
      "DC Fast Charging Speed Significantly Below Rated Capacity",
      "Defroster/Defogger May Become Inoperative During HVAC Fault - Recall 25V577 (25TA07)",
      "Incorrect Load Carrying Capacity Label - Recall 24V548",
      "Infotainment Screen Freezing/Rebooting and CarPlay/Android Auto Dropouts",
      "Rearview Camera May Freeze or Fail to Display on Panoramic View Monitor - Recall 25V744",
      "Severely Reduced DC Fast Charging Speed in Cold Weather",
      "Significant Range Reduction in Cold Weather",
      "Wheel Hub Bolt Loosening - Safety Recall 22V-651"
    ],
    "yearsCovered": [
      2023,
      2024,
      2025
    ]
  },
  {
    "make": "Volkswagen",
    "model": "Taos",
    "existingTitles": [
      "12V Battery Parasitic Drain / Repeated Dead Battery",
      "7-Speed DSG (DQ381) Shudder and Rough Low-Speed Shifting",
      "A/C Compressor Noise and Vibration",
      "Acceleration Hesitation / Throttle Lag From a Standstill (4Motion DSG)",
      "EA211 1.5T Coolant Loss from Water Pump / Thermostat Housing Leak",
      "EA211 1.5T Engine Ticking and Fuel Injector Noise",
      "Engine Stalls When Coming to a Stop - AWD ECU Software Defect (Recall 21V615)",
      "Fuel Delivery Module Failure Causing Sudden Power Loss (Recall 23V214 / 20DV)",
      "Intake Valve Carbon Buildup on the GDI 1.5 TSI",
      "MIB3 Infotainment System Glitches and Connectivity Issues",
      "Premature Rear Brake Pad Wear (VW Warranty Extension / TSB)",
      "Rear Drum Brake Groaning and Noise",
      "Rear Suspension Knuckle Cracking / Fracture (Recall 22V176 / VW code 42L8)",
      "Rearview Camera Image Fails to Display - eMMC Infotainment Memory Defect (Recall 22V514 / 91DV)",
      "Underhood Fuel Supply Quick-Connector Detachment and Fuel Leak (Recall 21V651 / 20DB)"
    ],
    "yearsCovered": [
      2022,
      2023,
      2024,
      2025
    ]
  },
  {
    "make": "Renault",
    "model": "Twizy",
    "existingTitles": [
      "12V Battery Discharge and No-Start",
      "Brake Seizure and Uneven Pad Wear",
      "Door, Window, and Latch Water Ingress Problems",
      "On-Board Charger Failure or Charge Interruption"
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
    "make": "Mitsubishi",
    "model": "Outlander",
    "existingTitles": [
      "12V Auxiliary Battery Parasitic Drain / Repeated Dead Battery",
      "AC Compressor Failure",
      "Cracked Accessory Belt Tensioner Can Strand the Outlander (Recall 18V069)",
      "CVT Transmission Premature Failure",
      "Engine Drive Belt Can Detach, Causing Battery Discharge and Stall (Recall 14V562000)",
      "Engine Malfunction / 'Power Reduced' Warning from ECU Software (False P0401/P0404, TSB-22-13-001)",
      "Forward Collision Mitigation Software Holds Brakes Too Long (Recall 18V620000)",
      "Front Suspension Clunking and Noise",
      "Fuel Pump Failure Causing Engine Stall (Recall 22V027)",
      "Hood Flutter and Bounce at Highway Speed (Latch/Weatherstrip Defect)",
      "Hydraulic Unit ECU Software Defect Can Disable ABS, Stability Control and Automatic Emergency Braking (Recall 18V621)",
      "Infotainment System Freezing and Connectivity Issues",
      "Parking Brake May Not Hold Due to Corroded Rear Caliper Actuator Shafts (Recall 18V070)",
      "Parking Brake Shafts Can Corrode and Bind \u2014 Rollaway Risk (Recall 20V741)",
      "Phantom / False Automatic Emergency Braking (Forward Collision Mitigation)",
      "PHEV Battery Degradation and Charging Issues",
      "Rearview Backup Camera Image Blank or Frozen (Recalls 23V345 / 25V369)",
      "Salt-Belt Front Cross Member Corrosion \u2014 Control Arm Detachment Recall (20V279)",
      "Seat Belt Automatic Locking Retractor Deactivates Early (Child-Seat Recall 21V596)",
      "Spontaneous Windshield and Door Glass Cracking (4th-Gen Thin Glass)"
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
      2025,
      2026
    ]
  },
  {
    "make": "Audi",
    "model": "Q7",
    "existingTitles": [
      "2009-2015 Q7 3.0 TDI Emissions Settlement and Modification History",
      "2011-2015 Q7 3.0 TFSI Brief Cold-Start Timing-Chain Rattle - TSB 2039995/2",
      "2011-2016 Q7 3.0 TFSI Secondary-Air Carbon Restriction - P0491/P0492",
      "2013 Q7 TDI Brake-Booster Vacuum-Line Recall 47L8 (14V516)",
      "Air Suspension Strut Failure and Compressor Issues",
      "Air Suspension System Failure (Compressor and Springs)",
      "Supercharger Bearing Failure and Boost Leaks (3.0T)",
      "Transfer Case Fluid Leak and Failure",
      "Water Pump and Thermostat Failure (Overheating)"
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
      2019
    ]
  },
  {
    "make": "Chrysler",
    "model": "Pacifica",
    "existingTitles": [
      "3.6L Pentastar Engine Stalling and Head Gasket Failure",
      "A/C Compressor Failure and Rear A/C Performance Loss",
      "Hybrid Transmission Wiring Harness Short (PHEV)",
      "Plug-In Hybrid Battery Fire Risk (PHEV)",
      "Power Liftgate Malfunction and Failure to Open/Close",
      "Power Sliding Door Actuator and Motor Failure",
      "TPMS Sensor Battery Failure and False Warnings",
      "Transmission Harsh 3-4 Shift and Shudder (9-Speed)",
      "UConnect Infotainment System Freezing and Rebooting"
    ],
    "yearsCovered": [
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
    "make": "Cadillac",
    "model": "CT4",
    "existingTitles": [
      "10-Speed Transmission Damage Can Cause Wheel Lock-Up (Recall 25V148)",
      "Airbag Warning Lamp May Not Illuminate Consistently (Recall 21V421)",
      "Daytime Running Lights May Stay On with Headlights (Recall 22V903)",
      "Electronic Brake-Boost Sensor Contamination Can Remove Assist (Recall 20V588)",
      "Roof-Rail Side-Curtain Airbags May Be Installed Incorrectly (Recall 21V611)"
    ],
    "yearsCovered": [
      2020,
      2021,
      2022,
      2023
    ]
  },
  {
    "make": "Mercedes-Benz",
    "model": "Sprinter",
    "existingTitles": [
      "722.6 (NAG1) Automatic Transmission Conductor Plate Failure / Limp Mode",
      "DEF/AdBlue SCR System Faults and Derate",
      "Diesel Injector Failure and Black Death (OM651/OM654)",
      "Diesel Particulate Filter (DPF) Clogging from Short-Trip / Urban Use",
      "EGR Valve and EGR Cooler Carbon Clogging (Limp Mode, P0400-Series Codes)",
      "Glow Plug Failure and Cold Start Issues",
      "Intake Manifold Swirl Flap Linkage Breakage (P2015)",
      "OM642 Harmonic Balancer / Crankshaft Pulley Rubber Failure",
      "OM642 V6 Oil Cooler Seal Leak (Oil in the Engine Valley)",
      "Rear Wheel-Arch and Body Seam Corrosion (Pre-VS30 W906)",
      "Sliding Door Roller and Track Wear",
      "Turbo Resonator Crack and Boost Leak",
      "Turbocharger VNT Actuator Failure (Boost Faults, Limp Mode)"
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
  }
]

const TARGETS = [
  { make: 'Hyundai',       model: 'Accent',     yearsHint: '2006-2022', note: 'MC 2006-2011, RB 2012-2017 (1.6 GDI Gamma), HC 2018-2022 (1.6 MPI, IVT). Discontinued in the US after 2022. NOTE: our 2022 view is the single highest-traffic page on the site and shows only 3 issues.', forums: 'hyundai-forums.com, hyundaiaccentforum.com, r/Hyundai, kia-forums.com (shared Gamma engine)' },
  { make: 'BMW',           model: 'i5',         yearsHint: '2024-present', note: 'G60 electric 5 Series, 81.2 kWh, eDrive40 / xDrive40 / M60.', forums: 'bimmerpost G60 and i5 forums, bimmerfest, r/BMWi, r/BMW' },
  { make: 'BMW',           model: 'i4',         yearsHint: '2022-present', note: 'G26 Gran Coupe EV, 83.9 kWh, eDrive35/eDrive40/xDrive40/M50. Shares G22 4 Series structure.', forums: 'bimmerpost i4 and G26 forums, bimmerfest, r/BMWi4, r/BMWi' },
  { make: 'BMW',           model: 'iX3',        yearsHint: '2021-present', note: 'G08 electric X3, 80 kWh, single rear motor. Sold in Europe and China, NOT the US - expect UK/EU owner sources and DVSA/EU recall notices rather than NHTSA.', forums: 'bimmerpost iX3 forums, speakev.com, UK and EU BMW owner communities, r/BMWi' },
  { make: 'Toyota',        model: 'bZ4X',       yearsHint: '2023-present', note: 'e-TNGA electric SUV, 71.4 kWh, FWD and AWD. Early cars had the wheel-hub-bolt stop-sale. Twin of the Subaru Solterra.', forums: 'bz4xforum.com, r/bz4x, toyotanation.com, r/electricvehicles' },
  { make: 'Volkswagen',    model: 'Taos',       yearsHint: '2022-present', note: '1.5 TSI EA211 evo, 8-speed automatic (FWD) or 7-speed DSG (4MOTION). MQB A0 platform.', forums: 'vwtaosforum.com, vwvortex.com, r/VWTaos, r/Volkswagen' },
  { make: 'Renault',       model: 'Twizy',      yearsHint: '2012-2020', note: 'Quadricycle EV (L6e/L7e), 6.1 kWh, Twizy 45 and 80. EU-only - sources are UK/FR/DE/ES owner communities and EU recall notices, NOT NHTSA. Search in French, German and Spanish as well as English.', forums: 'twizyforum, renault twizy owner forums, speakev.com, forum-auto.caradisiac.com, r/electricvehicles' },
  { make: 'Mitsubishi',    model: 'Outlander',  yearsHint: '2007-present', note: 'CW 2007-2013, GF 2014-2021 (including PHEV), GN 2022+ (Nissan CMF-CD, 2.5 PR25DD). PHEV variants have distinct battery and charger failures.', forums: 'mitsubishi-forums.com, outlanderphevforum.com, myoutlander.com, r/mitsubishi' },
  { make: 'Audi',          model: 'Q7',         yearsHint: '2007-present', note: '4L 2007-2015 (3.0 TFSI supercharged, 3.0 TDI, 4.2 FSI) and 4M 2017+ (3.0 TFSI EA839, 48V mild hybrid). Timing chain and air suspension are known 4L weak points. NOTE: our coverage stops at 2019.', forums: 'audiworld.com, audizine.com, quattroworld.com, r/Audi' },
  { make: 'Chrysler',      model: 'Pacifica',   yearsHint: '2017-present', note: 'RU minivan, 3.6 Pentastar with 9-speed 948TE, plus the Pacifica Hybrid PHEV (16 kWh) which has its own battery and charging recalls. Stow n Go seating.', forums: 'pacificaforums.com, chryslerminivan.net, allpar forums, r/Chrysler' },
  { make: 'Cadillac',      model: 'CT4',        yearsHint: '2020-present', note: 'Alpha 2 platform, 2.0T LSY or 2.7T L3B, 8L45/10L60. Includes CT4-V and CT4-V Blackwing (LF4 3.6 twin-turbo).', forums: 'cadillacforums.com, cadillacsociety forums, Alpha platform forums, r/Cadillac' },
  { make: 'Mercedes-Benz', model: 'Sprinter',   yearsHint: '2007-present', note: 'NCV3 2007-2018 (OM642 3.0 V6 diesel, OM651 2.1) and VS30 2019+ (OM642/OM654, 4x4 option). Heavy commercial use - expect DEF/SCR, turbo and corrosion issues. Distinct from Metris.', forums: 'sprinter-source.com, sprinterforum.com, r/sprintervanlife, r/Vandwellers' },
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

log(`Wave 4 deepen: ${TARGETS.length} models — Mercedes-Benz depth + modern-EV thin set`)

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
