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
  name: 'research-wave14-four-bucket',
  description: 'Wave-14: 22 targets across heavy-duty/work trucks, high-volume used vehicles and thin luxury nameplates. Style-selected discover prompt + adversarial verify',
  phases: [
    { title: 'Discover' },
    { title: 'Verify' },
  ],
}

const TARGETS = [
  {
    "style": "top",
    "make": "Ford",
    "model": "F-250 Super Duty",
    "yearsHint": "1999-2016",
    "note": "Only 7 documented issues on one of the most failure-documented vehicles in North America. THIS NAMEPLATE IS SPLIT IN THE CATALOG - a separate \"Ford F-250\" row exists with 6 issues; file everything here and do not create the other spelling. The defining chapters are diesel: the 6.0L Power Stroke (2003-2007) with head-gasket lift and stretched head bolts, EGR cooler failure, oil cooler plugging, FICM failure and the STC fitting on the HPOP - this engine produced a class action and a Ford buy-back program, and the record is exceptional. Then the 6.4L Power Stroke (2008-2010) with radiator/coolant leaks, piston cracking and the DPF regen fuel-dilution problem. Then the 6.7L Scorpion (2011+) with the CP4.2 injection pump self-destruction. Also gas: the 6.8L V10 spark-plug blowout and two-piece plug breakage on the earlier Triton heads. Chassis: the 2005-2007 death-wobble track bar, ball joints and the front leaf/coil transition.",
    "forums": "ford-trucks.com, powerstroke.org, thedieselstop.com, oilburners.net, r/FordTrucks, r/Diesel"
  },
  {
    "style": "top",
    "make": "Ford",
    "model": "F-350",
    "yearsHint": "1999-2016",
    "note": "Only 5 documented issues. Shares the Super Duty platform and the same diesel record as the F-250 - but do NOT blind-copy: file only what sources tie to the F-350/dually specifically, or to the shared engine where the source names it. The F-350-specific angles worth chasing: dual-rear-wheel tire and wheel-bearing loads, the higher-GVWR rear axle and leaf packs, the fifth-wheel/gooseneck towing failures, the DRW brake wear pattern, and the chassis-cab variants. The engine chapters (6.0L head bolts/EGR/oil cooler, 6.4L radiator and pistons, 6.7L CP4.2) apply if the source names the F-350 or the engine family.",
    "forums": "ford-trucks.com, powerstroke.org, thedieselstop.com, r/FordTrucks, r/Diesel"
  },
  {
    "style": "top",
    "make": "Chevrolet",
    "model": "Silverado 2500HD",
    "yearsHint": "2001-2019",
    "note": "Only 8 documented issues on GM's heavy-duty volume truck. The Duramax generations are the story and each has a distinct, well-documented defect: LB7 (2001-2004) INJECTOR FAILURE - the single most documented Duramax problem, with an extended 7yr/200k warranty because injectors are under the valve covers; LLY (2004.5-2005) overheating while towing; LBZ/LMM (2006-2010) with the LMM DPF regeneration and injector issues; LML (2011-2016) CP4.2 HIGH-PRESSURE FUEL PUMP FAILURE contaminating the entire fuel system, which produced a class action; L5P (2017+) is comparatively clean, say so if the evidence says so. Also: the Allison 1000 transmission behaviour, the 2007-2014 rusting brake lines, the AFM/DoD lifters on the 6.0L gas, and the steering-shaft clunk. GM SIBLING: GMC Sierra 2500HD is a SEPARATE nameplate here (5 issues) - confirm which the source names.",
    "forums": "duramaxforum.com, dieselplace.com, gm-trucks.com, chevytalk.org, r/Duramax, r/Diesel"
  },
  {
    "style": "top",
    "make": "GMC",
    "model": "Sierra 2500HD",
    "yearsHint": "2001-2019",
    "note": "Only 5 documented issues. Mechanical twin of the Silverado 2500HD - the Duramax LB7 injector, LLY overheat, LMM DPF and LML CP4.2 chapters all apply where the source names the Sierra or the engine family. Do not simply mirror the Silverado; NHTSA campaigns list both nameplates explicitly when they cover both, so verify. GMC-specific angles: the Denali trim electronics and MagneRide where fitted, the different front fascia/headlamp campaigns, and the Sierra-badged chassis cab. Note GMC Sierra 3500HD already has 24 issues in this catalog - use it as a cross-check for what the 2500HD is missing rather than as a source to copy.",
    "forums": "duramaxforum.com, dieselplace.com, gm-trucks.com, r/Duramax, r/GMC"
  },
  {
    "style": "top",
    "make": "Chevrolet",
    "model": "Express",
    "yearsHint": "1996-2024",
    "note": "Only 5 documented issues on a van that has been in production nearly thirty years and is overwhelmingly a fleet/commercial vehicle - meaning high-mileage failure data is abundant. Documented themes: the 4L60E/4L80E and later 6L90 transmission failures under load, the 6.0L Vortec AFM lifter and valve-spring issues, the 6.6L Duramax option in later vans, the notorious rear-door hinge and latch problems, the 2007-2014 brake line and fuel line corrosion, HVAC rear-air failures, the ABS/EBCM, and the long list of NHTSA campaigns including the seat-belt and the rear-door ones. Upfitter and cutaway variants complicate fitment - state which body applies. TWIN: GMC Savana is a SEPARATE nameplate here.",
    "forums": "gm-trucks.com, chevyexpressforum.com, expressvanforum.com, r/vandwellers, r/Chevy"
  },
  {
    "style": "top",
    "make": "GMC",
    "model": "Savana",
    "yearsHint": "1996-2024",
    "note": "Only 5 documented issues. Badge twin of the Chevrolet Express - the same 4L80E/6L90, Vortec AFM, brake-line corrosion and rear-door latch chapters apply where sources name the Savana. Verify rather than mirror: NHTSA campaigns normally name both, so a campaign that names only the Express should not be filed here. Savana-specific: the passenger/cutaway upfits, the 2500/3500 GVWR differences and the commercial-fleet duty cycle that drives the rear suspension and brake findings.",
    "forums": "gm-trucks.com, gmsavanaforum.com, r/vandwellers, r/GMC"
  },
  {
    "style": "top",
    "make": "Ford",
    "model": "E-Series",
    "yearsHint": "1992-2024",
    "note": "Only 5 documented issues on the best-selling full-size van in American history, still built as a cutaway today - ambulances, shuttles, box trucks and RVs all ride on it, so failure data is extensive. Documented themes: the 5.4L and 6.8L Triton SPARK PLUG BLOWOUT (threads pulling from the aluminium head) and the later two-piece plug that breaks on removal, the 5.4L cam phaser rattle and timing chain, the 6.0L Power Stroke chapters in the E-350/E-450 diesel vans (head bolts, EGR cooler, oil cooler), the 4R100/5R110 TorqShift transmissions, the rear-door hinge and step-bumper corrosion, and the long recall history. The E-150 was dropped after 2014 while E-350/E-450 cutaways continue - be precise about which body and year.",
    "forums": "ford-trucks.com, econolineforum.com, powerstroke.org, r/vandwellers, r/Ford"
  },
  {
    "style": "top",
    "make": "Jeep",
    "model": "Liberty",
    "yearsHint": "2002-2012",
    "note": "Only 5 documented issues on a vehicle with an unusually heavy and well-documented failure record. KJ (2002-2007) and KK (2008-2012) are different vehicles - keep them apart. Documented themes: the 3.7L PowerTech V6 VALVE SEAT DROP causing catastrophic engine failure, the KJ 2.8L CRD diesel with its EGR and turbo problems, the well-known WINDOW REGULATOR failures, the ball joints and lower control arms, the rear differential and the 2002-2004 recalls, the notorious KK sunroof/sky-slider roof leaks and its drainage, the fuel-tank/skid-plate campaign, and the 42RLE transmission. This nameplate has a large active owner base relative to sales, which is exactly the profile that returned 13/13 on the 350Z in wave 11b.",
    "forums": "jeepforum.com, libertyforum.net, jeepkj.net, cherokeeforum.com, r/Jeep, r/JeepLiberty"
  },
  {
    "style": "top",
    "make": "Jeep",
    "model": "Patriot",
    "yearsHint": "2007-2017",
    "note": "Only 5 documented issues across an eleven-year production run of a high-volume budget crossover. THE DEFINING STORY IS THE JATCO JF011E CVT - overheating, limp mode and outright failure, with a documented aux-cooler service action; describe accurately what Chrysler did and did not issue. Also: the 2.0L and 2.4L World Engine with its oil consumption and the timing chain/tensioner, the notorious head-gasket and rocker-arm complaints, front strut and wheel-bearing wear, the TIPM electrical failures that swept Chrysler products of this era, water leaks at the doors and the A-pillar, and the recalls. SIBLING: Jeep Compass shares the platform and CVT - confirm which nameplate the source names.",
    "forums": "jeepforum.com, patriotforums.com, jeeppatriot.org, r/Jeep, r/JeepPatriot"
  },
  {
    "style": "top",
    "make": "Chrysler",
    "model": "Town & Country",
    "yearsHint": "1996-2016",
    "note": "Only 5 documented issues on a nameplate that defined the American minivan for two decades. Generations differ substantially - be precise. Documented themes: the 41TE/62TE TRANSMISSION FAILURES that dominate the ownership record, the 3.6L Pentastar CYLINDER HEAD failure (the left-bank rocker/head defect with its own warranty extension), the 3.3/3.8 oil leaks and the 2.8 diesel in some markets, the POWER SLIDING DOOR motor, cable and latch failures, the TIPM (totally integrated power module) failures that caused no-starts, fuel-pump-relay problems and even fires across Chrysler products of this era, the rear liftgate struts, and the long recall list. SIBLING: Dodge Grand Caravan is essentially the same vehicle and is a separate nameplate - confirm attribution.",
    "forums": "chryslerminivan.net, allpar.com, minivan.net, r/ChryslerPacifica, r/Chrysler"
  },
  {
    "style": "top",
    "make": "Kia",
    "model": "Sedona",
    "yearsHint": "2002-2021",
    "note": "Only 6 documented issues across three generations of Kia's minivan. Quarterly-priority make context: Kia is under-covered relative to volume. Documented themes: the 3.5L and 3.8L Lambda V6 - including the widely reported early-generation timing belt and water pump interval and the later oil consumption, the POWER SLIDING DOOR motor and latch failures, the 2006-2012 lower control arm and ball joint, the alternator and battery drain complaints, the 2015+ YP generation infotainment and the sliding-door recall, brake-light switch (a Hyundai-Kia-wide campaign - confirm the Sedona is named), and the airbag/ODS seat-sensor faults. Note Kia Carnival is the successor nameplate and is separate.",
    "forums": "kia-forums.com, kiasedonaforum.com, kiaforum.com, r/kia"
  },
  {
    "style": "top",
    "make": "Chevrolet",
    "model": "Cavalier",
    "yearsHint": "1995-2005",
    "note": "Only 5 documented issues on one of the highest-volume American compacts ever built - millions sold, and still a common first car. The J-body 1995-2005 run is the target (the 2016+ Chinese/Mexican Cavalier is a different vehicle - exclude it unless clearly separated). Documented themes: the 2.2L OHV and 2.2L Ecotec HEAD GASKET failures, the intake manifold gasket, the notorious ignition-switch and key-cylinder problems (note the ignition-switch recall that swept GM applies to specific models - confirm the Cavalier is named rather than assuming), the 3T40/4T40E transmission, blower motor resistor, fuel pump failure, and the rear brake and coil-spring corrosion on northern cars. TWIN: Pontiac Sunfire is the same car under another badge and is a separate nameplate here (1 issue).",
    "forums": "j-body.org, cavalierforums.com, chevytalk.org, r/Chevy"
  },
  {
    "style": "top",
    "make": "Toyota",
    "model": "Matrix",
    "yearsHint": "2003-2013",
    "note": "Only 5 documented issues. Quarterly-priority make (Toyota is thin relative to volume). The Matrix is mechanically a Corolla wagon and shares the 1ZZ-FE / 2ZZ-GE / 2ZR-FE engines - which matters because THE 1ZZ-FE OIL CONSUMPTION AND PISTON-RING DEFECT is one of the best-documented Toyota engine problems of the era and carries its own service campaign. Also: the 2ZZ-GE lift-bolt failure on the XRS, the notorious 2003-2008 ENGINE-COMPARTMENT WIRING and the ECM problems, the Takata airbag inflator campaigns, the excessive rear-wheel-bearing and rear-brake wear, sunroof and hatch water leaks, and the accelerator-pedal/floor-mat recalls that swept Toyota in 2009-2010. TWIN: Pontiac Vibe is the same vehicle - confirm attribution.",
    "forums": "toyotanation.com, matrixowners.com, corollaland.com, r/ToyotaMatrix, r/Toyota"
  },
  {
    "style": "top",
    "make": "Ford",
    "model": "Crown Victoria",
    "yearsHint": "1992-2011",
    "note": "Only 5 documented issues on the Panther-platform car that served as nearly every American police cruiser and taxi for two decades - which means the failure data comes with fleet maintenance records, not just owner anecdotes. Documented themes: THE 1992-2001 FUEL-TANK / REAR-IMPACT FIRE controversy and the police-package shields (a genuinely major, well-sourced safety story - describe it precisely and factually), the 4.6L 2V Modular engine INTAKE MANIFOLD CRACKING at the plastic coolant crossover (with a class action and a redesigned part), spark-plug thread and blow-out issues on the later heads, the 4R70W/4R75W transmission, the air-suspension option on the Grand Marquis-derived cars, blend-door actuators, and the rear axle and control-arm bushings under fleet duty. SIBLINGS: Mercury Grand Marquis and Lincoln Town Car (9 issues here) share the platform.",
    "forums": "crownvic.net, panthercarclub.com, ford-trucks.com, r/CrownVictoria, r/Ford"
  },
  {
    "style": "thin",
    "make": "Cadillac",
    "model": "SRX",
    "yearsHint": "2004-2016",
    "note": "Only 5 documented issues across two very different generations. Gen 1 (2004-2009) is a rear-drive Sigma-platform wagon-SUV with the 3.6L LY7 and the Northstar 4.6L V8; gen 2 (2010-2016) is front-drive Theta with the 3.0L LF1 and the 3.6L LFX. Keep them apart. Documented themes: the LY7/LF1 TIMING CHAIN STRETCH from oil dilution and extended intervals - one of the best-documented GM V6 problems, with its own service bulletins; the Northstar head-bolt/head-gasket failure on gen 1; the gen-1 panoramic sunroof and its drains; the CUE INFOTAINMENT DELAMINATING TOUCHSCREEN on gen 2, which produced a class action and a warranty extension; the 6T70 transmission; and the HID headlamp and water-ingress campaigns.",
    "forums": "cadillacforums.com, cadillacowners.com, srxforum.com, r/Cadillac"
  },
  {
    "style": "thin",
    "make": "Ford",
    "model": "EcoSport",
    "yearsHint": "2018-2022",
    "note": "Only 5 documented issues. Sold in the US 2018-2022 but built globally since 2013 - be explicit about which market and generation a finding covers, because the Brazilian/Indian cars differ. Documented themes: the 1.0L EcoBoost three-cylinder with its wet-belt and coolant-intrusion record (the wet timing belt in oil is a genuinely significant, well-documented Ford three-cylinder story - confirm which engines/markets), the 2.0L Ti-VCT, the 6F35 transmission shudder and harsh shifts, the SIDE-SWINGING TAILGATE and its hinge/strut problems, water leaks and the rear-wiper, SYNC 3 faults, and the recalls including the fuel-injector/fuel-odour campaigns that hit Ford three-cylinders.",
    "forums": "ecosportforum.com, fordecosportforum.com, ford-forums.com, r/Ford"
  },
  {
    "style": "thin",
    "make": "Chevrolet",
    "model": "TrailBlazer",
    "yearsHint": "2002-2009",
    "note": "Only 7 documented issues, and NOTE THE CATALOG SPLIT: a separate \"Chevrolet Trailblazer\" row (lower-case b, 4 issues) covers the 2021+ crossover. THIS TARGET IS THE 2002-2009 GMT360 BODY-ON-FRAME SUV with the 4.2L Atlas inline-six - file findings under \"TrailBlazer\" for the old truck only, and say so in the title/years. Documented themes: the 4.2L Atlas with its camshaft actuator/position-sensor faults and the notorious oil consumption, the GMT360 BLOWER-MOTOR RESISTOR and HVAC actuator failures, the INSTRUMENT CLUSTER STEPPER-MOTOR failure (gauges reading wrong or dead - one of the most documented GM cluster problems, with a service bulletin), the fuel-level sender, the 4WD encoder motor and transfer case, the ignition-switch/key cylinder, and the rear air-suspension on the EXT/Envoy XL. SIBLINGS: GMC Envoy (6 issues), Buick Rainier, Isuzu Ascender, Saab 9-7X (2).",
    "forums": "trailvoy.com, gm-trucks.com, chevytalk.org, r/Chevy"
  },
  {
    "style": "thin",
    "make": "Lexus",
    "model": "ES",
    "yearsHint": "1997-2026",
    "note": "Only 5 documented issues on the HIGHEST-VOLUME LEXUS SEDAN - the single most under-covered high-demand nameplate in this catalog. NOTE the legacy split rows \"Lexus ES300\" (1 issue) and \"Lexus ES 350\" if present; file everything under \"Lexus ES\" and make the generation explicit in the title. Generations: XV20 (1997-2001, 1MZ-FE), XV30 (2002-2006), XV40 (2007-2012, 2GR-FE), XV60 (2013-2018, plus the ES 300h hybrid), XZ10 (2019+). Documented themes: the 1MZ-FE/2GR-FE OIL-LINE (rubber VVT-i oil hose) FAILURE causing sudden oil loss - a genuine Toyota recall/campaign; the 1MZ-FE oil sludge issue and the resulting Toyota engine-sludge settlement; the 2GR-FE valve-cover and timing-cover leaks; the XV40 dashboard MELTING/STICKY DASH warranty extension; the Takata inflator campaigns; and the brake-actuator faults on the hybrid. Quarterly note: Lexus is thin overall (133 issues / 19 models).",
    "forums": "clublexus.com, lexusownersclub.com, toyotanation.com, r/Lexus"
  },
  {
    "style": "thin",
    "make": "Cadillac",
    "model": "CTS",
    "yearsHint": "2003-2019",
    "note": "Only 6 documented issues across three generations (a separate \"Cadillac CTS-V\" row holds 3 - keep the V-series findings there unless the source covers the base car). Gen 1 (2003-2007, 3.2/3.6 and the Aisin/Tremec manual), gen 2 (2008-2014, 3.0/3.6 direct injection, plus the coupe and wagon), gen 3 (2014-2019, Alpha platform, 2.0T/3.6/3.6TT). Documented themes: THE LLT/LFX DIRECT-INJECTION TIMING CHAIN STRETCH on gen 2 - among the best-documented GM V6 failures, with bulletins and extended coverage; the high-pressure fuel pump and injector faults on DI engines; the gen-2 sunroof drains and water in the footwells; the CUE infotainment delaminating screen on gen 3 with its warranty extension; the 6L50/8L45 transmission; the HID/adaptive headlamps; and the electronic door handles on gen 3.",
    "forums": "cadillacforums.com, cadillacowners.com, ctsvowners.com, r/Cadillac"
  },
  {
    "style": "thin",
    "make": "Audi",
    "model": "S4",
    "yearsHint": "2000-2025",
    "note": "Only 6 documented issues on a nameplate spanning four radically different engines - and getting them apart is the whole job. B5 (2000-2002) 2.7T BITURBO: the turbo failures, the notorious oil-line coking and the timing belt service; B6/B7 (2004-2008) 4.2 V8: the TIMING CHAIN GUIDE failure driven from the back of the engine (engine-out repair, an exceptionally well-documented story); B8 (2010-2016) 3.0 TFSI supercharged: the thermostat/water pump, the carbon buildup on the intake valves, and the supercharger coupler; B9 (2017+) turbo 3.0 TFSI. Also: the DSG/S-tronic mechatronic, the S4-specific brakes, and the recalls. Quarterly-priority make (Audi is 420 issues / 44 models but thin per model). SIBLING: Audi RS4 (2) and Audi A4/S5 are separate nameplates.",
    "forums": "audizine.com, audiworld.com, s4wiki.com, quattroworld.com, r/Audi"
  },
  {
    "style": "thin",
    "make": "BMW",
    "model": "M2",
    "yearsHint": "2016-2026",
    "note": "Only 6 documented issues. Quarterly-priority make (BMW). Three distinct cars: F87 M2 (2016-2018, N55), F87 M2 Competition/CS (2019-2021, S55), G87 M2 (2023+, S58). Keep them apart - the engines have DIFFERENT failure records. N55: the charge pipe (a well-documented plastic-to-aluminium failure under boost), the oil filter housing gasket, the valve cover and the VANOS solenoids. S55: the crank hub / timing-drive concern on tuned cars (be careful and precise here - describe what is documented versus what is enthusiast lore, and say which is which), the fuel-pump and injector faults, and the oil consumption. S58: the coolant and the early-production recalls. Also platform-wide: the DCT vs manual, the electric water pump, and the plastic cooling components that BMW is known for.",
    "forums": "m2forum.com, bimmerpost.com, bimmerfest.com, f80post.com, r/BMW, r/BmwTech"
  },
  {
    "style": "thin",
    "make": "Porsche",
    "model": "Panamera",
    "yearsHint": "2010-2025",
    "note": "Only 6 documented issues on Porsche's volume four-door across two generations - 970 (2010-2016) and 971 (2017-2024) - with an unusually wide engine range: 3.6 V6, 3.0 supercharged and later turbo V6, 4.8/4.0 V8 turbo, the diesel in some markets, and the E-Hybrid. Documented themes: the 970 AIR SUSPENSION compressor and strut failures, the PDK mechatronic and clutch-pack wear, the 4.8 V8 turbo coolant-pipe and the well-documented early-engine issues, water pump and thermostat failures, the PCM infotainment, the panoramic roof drains, and the E-Hybrid battery and charging faults including the 2020-2021 campaigns. Porsche is 118 issues / 9 models - genuinely thin for the brand's repair-cost profile, which is exactly what owners search for.",
    "forums": "rennlist.com, planet-9.com, 6speedonline.com, panamera-forum.com, r/Porsche"
  }
]

const EXCLUSIONS = [
  {
    "make": "Ford",
    "model": "F-250 Super Duty",
    "existingTitles": [
      "6.0L Powerstroke EGR Cooler Rupture and Coolant Leak",
      "6.2L V8 Cam Phaser Tick on Cold Start",
      "6.7L Power Stroke CP4 High-Pressure Fuel Pump Failure - Catastrophic Fuel System Contamination",
      "6.7L Power Stroke DEF/SCR System Failure - P207F and P20EE Codes",
      "6.7L Power Stroke Early-Generation Turbocharger Failure (2011-2014)",
      "6.7L Power Stroke EGR Cooler Clogging and Failure",
      "6.7L Powerstroke Exhaust Manifold Stud Failure",
      "Death Wobble — Violent Steering Oscillation",
      "Steering Damper Failure and Shimmy"
    ],
    "yearsCovered": [
      1999,
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
      2024,
      2025
    ]
  },
  {
    "make": "Ford",
    "model": "F-350",
    "existingTitles": [
      "6.2L Boss V8 Cam Phaser Rattle and Exhaust Manifold Studs",
      "6.7L Power Stroke Turbocharger Bearing and Actuator Failure",
      "7.3L Powerstroke Turbo Pedestal O-Ring Leak",
      "Death Wobble - Violent Steering Oscillation",
      "Exhaust Manifold Bolt Breakage"
    ],
    "yearsCovered": [
      1994,
      1995,
      1996,
      1997,
      1998,
      1999,
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
      2024,
      2025
    ]
  },
  {
    "make": "Chevrolet",
    "model": "Silverado 2500HD",
    "existingTitles": [
      "Allison 1000 Transmission Torque Converter Shudder",
      "CP4 High-Pressure Fuel Pump Failure (LML/LGH Duramax)",
      "Duramax Diesel Injector Failure",
      "Exhaust Manifold Bolt Failure",
      "Injector Wiring Harness Chafing (Duramax)",
      "Steering Stabilizer Failure and Death Wobble",
      "Steering Wander and Death Wobble",
      "Transfer Case Encoder Motor Failure"
    ],
    "yearsCovered": [
      1999,
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
      2024,
      2025
    ]
  },
  {
    "make": "GMC",
    "model": "Sierra 2500HD",
    "existingTitles": [
      "6.0L V8 Excessive Oil Consumption and AFM Lifter Wear",
      "Allison 1000/2000 Transmission TCM Failure and Harsh Shifting",
      "CP4.2 High-Pressure Fuel Pump Catastrophic Failure",
      "Front Axle Disconnect Actuator and IWE Hub Failure (4WD Engagement Issues)",
      "LML Duramax EGR Cooler and EGR Valve Failure"
    ],
    "yearsCovered": [
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
    "make": "Chevrolet",
    "model": "Express",
    "existingTitles": [
      "Front Door Hinge Pin and Bushing Wear",
      "Fuel Pump Module Failure",
      "Intake Manifold Gasket Leak",
      "Side Door Hinge Pin and Roller Wear",
      "StabiliTrak and ABS False Activation from Wheel Speed Sensors"
    ],
    "yearsCovered": [
      1996,
      1997,
      1998,
      1999,
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
      2024,
      2025
    ]
  },
  {
    "make": "GMC",
    "model": "Savana",
    "existingTitles": [
      "AFM Lifter Failure on V8 Vortec/EcoTec3 Engines",
      "Brake Line Corrosion and Brake Fluid Loss (Rust Belt)",
      "Fuel Pump Module Failure and Hard Start / Stalling",
      "Ignition Switch Electrical Failure",
      "Rear Cargo Door and Side Door Hinge Wear"
    ],
    "yearsCovered": [
      1996,
      1997,
      1998,
      1999,
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
      2024,
      2025
    ]
  },
  {
    "make": "Ford",
    "model": "E-Series",
    "existingTitles": [
      "Front Door Hinge Pin Wear and Door Sagging",
      "Idle Air Control Valve Sticking",
      "Rear A/C Evaporator and Line Leaks",
      "Transmission Cooler Line Rubber Hose Degradation and Leak",
      "Triton 2-Valve Spark Plug Blow-Out from Cylinder Head"
    ],
    "yearsCovered": [
      1997,
      1998,
      1999,
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
      2014
    ]
  },
  {
    "make": "Jeep",
    "model": "Liberty",
    "existingTitles": [
      "3.7L V6 Exhaust Manifold Crack / Valve Cover Oil Leaks",
      "Front Lower Ball Joint Separation / Failure",
      "Power Window Regulator Failure",
      "Severe Body / Frame Rust and Corrosion",
      "Transfer Case / Differential Seal Leaks"
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
      2012
    ]
  },
  {
    "make": "Jeep",
    "model": "Patriot",
    "existingTitles": [
      "2.4L Engine Excessive Oil Consumption",
      "Engine Overheating / Water Pump and Radiator Fan Failure",
      "Front Suspension Clunking / Strut Mount & Sway Bar Link Failure",
      "Jatco CVT Transmission Overheating / Failure",
      "Thermostat Housing Coolant Leak / Cracking"
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
      2017
    ]
  },
  {
    "make": "Chrysler",
    "model": "Town & Country",
    "existingTitles": [
      "62TE Transmission Solenoid Pack Failure",
      "Cooling System Failures (3.3L/3.8L V6)",
      "Ignition Switch and SKREEM Module Failure",
      "Power Sliding Door Cable and Motor Failure",
      "TIPM (Totally Integrated Power Module) Failure"
    ],
    "yearsCovered": [
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
      2016
    ]
  },
  {
    "make": "Kia",
    "model": "Sedona",
    "existingTitles": [
      "Air Bag Control Unit May Short Circuit, Disabling Front Air Bags and Seat Belt Pretensioners",
      "Alternator Overheating and Premature Failure",
      "Automatic Transmission Shudder and Harsh Shifting",
      "Parasitic Battery Drain from Sliding Door Module",
      "Power Sliding Door Cable Fraying and Failure",
      "Sliding Door Latch and Roller Mechanism Failure"
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
      2021
    ]
  },
  {
    "make": "Chevrolet",
    "model": "Cavalier",
    "existingTitles": [
      "2.2L Ecotec Coolant Leak and Thermostat Housing Crack",
      "2.2L/2.4L Head Gasket Failure",
      "Ignition Switch Contact Failure",
      "Lower Intake Manifold Gasket Coolant Leak",
      "Passlock Anti-Theft System Prevents Starting"
    ],
    "yearsCovered": [
      1995,
      1996,
      1997,
      1998,
      1999,
      2000,
      2001,
      2002,
      2003,
      2004,
      2005
    ]
  },
  {
    "make": "Toyota",
    "model": "Matrix",
    "existingTitles": [
      "2AZ-FE Engine Excessive Oil Consumption",
      "Rear Hatch Lift Strut Failure",
      "Rear Hatch Strut Failure",
      "Rocker Panel and Rear Wheel Arch Rust",
      "Water Leak Through Taillight Seal Into Cargo Area"
    ],
    "yearsCovered": [
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
      2014
    ]
  },
  {
    "make": "Ford",
    "model": "Crown Victoria",
    "existingTitles": [
      "4.6L 2-Valve Spark Plug Ejection/Breakage",
      "4.6L Intake Manifold Cracking and Coolant Leak",
      "4R70W/4R75W Transmission Shift Solenoid Pack Failure",
      "Rear Air Suspension Compressor and Air Spring Failure",
      "Rear Differential Whine and Axle Shaft Wear"
    ],
    "yearsCovered": [
      1992,
      1993,
      1994,
      1995,
      1996,
      1997,
      1998,
      1999,
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
      2011
    ]
  },
  {
    "make": "Cadillac",
    "model": "SRX",
    "existingTitles": [
      "AWD Power Transfer Unit (PTU) Seal Leak and Bearing Noise",
      "CUE Infotainment Touchscreen Delamination",
      "Front Strut Mount Bearing Failure and Clunking",
      "High-Feature V6 Timing-Chain DTCs Require Exact Kit Identification",
      "Power Liftgate May Sag or Reverse When the Right Gas Strut Is Worn"
    ],
    "yearsCovered": [
      2010,
      2011,
      2012,
      2013,
      2014,
      2015,
      2016
    ]
  },
  {
    "make": "Ford",
    "model": "EcoSport",
    "existingTitles": [
      "1.0L EcoBoost Oil Pump Belt Tensioner Failure Leading to Engine Seizure",
      "A/C Compressor Premature Failure",
      "Exhaust Flex Pipe Cracking and Exhaust Leak",
      "Rough and Jerky Transmission Shifting",
      "Tailgate Seal Water Leak"
    ],
    "yearsCovered": [
      2018,
      2019,
      2020,
      2021,
      2022
    ]
  },
  {
    "make": "Chevrolet",
    "model": "TrailBlazer",
    "existingTitles": [
      "1.2L/1.3L Turbo Hesitation and Turbo Lag",
      "4.2L I6 Coolant Leak from Throttle Body and Water Pump",
      "Electric Fan Clutch Failure",
      "Infotainment System Freezing and Rebooting",
      "Power Window Regulator Failure",
      "Recall 21V440000: Emergency Jack Can Fracture and Let the Vehicle Collapse",
      "TrailBlazer Headlamp Driver Module Failure — Safety Recall 15V519000"
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
      2021,
      2022,
      2023,
      2024,
      2025
    ]
  },
  {
    "make": "Lexus",
    "model": "ES",
    "existingTitles": [
      "Brake Actuator Buzzing and Grinding Noise",
      "Dashboard Melting and Sticky Surface",
      "Excessive Oil Consumption 2GR-FE Engine",
      "Hybrid Battery Pack Degradation",
      "Panoramic View Monitor Rearview Camera Freezes or Goes Blank in Reverse (Recall 25V744000)"
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
    "make": "Cadillac",
    "model": "CTS",
    "existingTitles": [
      "Brake-Pedal Pushrod Bracket May Fracture (Recall 15V358)",
      "Chassis Electronic Module Can Short and Stall the Engine (Recall 14V614)",
      "Electric Power-Steering Assist May Fail (Recall 25V175)",
      "Heated Washer Fluid System Fire Hazard (Recall 10V240000)",
      "Ignition Key Can Move Out of Run and Disable Airbags (Recall 14V394)",
      "Rear-Axle Pinion Seal Can Leak and Allow Differential Failure (Recall 07V589)"
    ],
    "yearsCovered": [
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
    "make": "Audi",
    "model": "S4",
    "existingTitles": [
      "Airbag-Control Software May Miss Front-Airbag Deployment After a Second Impact (Recall 14V667 / 69K5)",
      "Driver Airbag Inflator May Deploy Improperly (Recall 21V470 / 69CJ)",
      "Fuel Rail or Seal Leak Creates Fire Risk (Recall 15V019 / 24AP)",
      "Passenger Airbag Inflator Can Rupture (Recall 18V427 / 69R7)",
      "Thermostat Housing Failure and Coolant Leak",
      "Xenon Headlamp Reflector Coating Can Reduce Light Output (Recall 05V096)"
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
      2024,
      2025
    ]
  },
  {
    "make": "BMW",
    "model": "M2",
    "existingTitles": [
      "Cooling System Inadequacy Under Track Use - F87 M2/M2C",
      "DCT (M-DCT) Mechatronics Unit Failure",
      "DCT Dual-Clutch Transmission Shudder & Clutch Wear - F87 M2/M2C",
      "Early F87 M2 Boost-Control Software Faults",
      "N55 Rod Bearing Premature Wear - F87 M2",
      "Rear Subframe Cracking (Track Use) - F87 M2/M2C",
      "S55 Crank Hub Bolt Loosening",
      "S55 Crank Hub Failure (CATASTROPHIC) - M2 Competition",
      "S58 Oil Starvation Under Hard Cornering"
    ],
    "yearsCovered": [
      2016,
      2017,
      2018,
      2019,
      2020,
      2021,
      2023,
      2024,
      2025,
      2026
    ]
  },
  {
    "make": "Porsche",
    "model": "Panamera",
    "existingTitles": [
      "Air Suspension Strut and Compressor Failure",
      "Coolant Pipe and Distribution Housing Leak",
      "Parasitic Battery Drain",
      "PCM Infotainment System Freezing and Failure",
      "PDK Dual-Clutch Transmission Mechatronic Failure",
      "Timing Chain Stretch and Tensioner Failure"
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
      2024,
      2025
    ]
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
log(`Wave 14: ${TARGETS.length} targets — ${Object.entries(byStyle).map(([k, v]) => `${k}:${v}`).join('  ')}`)

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
log(`WAVE 14 TOTAL: ${confirmed.length}/${totalFound} confirmed, ${totalOfficial} official-backed, ${totalForum} forum-backed`)

return { result: { confirmed, stats: { models: TARGETS.length, found: totalFound, confirmed: confirmed.length, forumBacked: totalForum, officialBacked: totalOfficial, byStyle: styleTotals, perModel: perModelStats } } }
