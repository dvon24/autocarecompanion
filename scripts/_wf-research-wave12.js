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
  name: 'research-wave12-four-bucket',
  description: 'Wave-12: 25 targets across EVs, newer vehicles, top sellers, thin nameplates and motorcycles. Style-selected discover prompt + adversarial verify',
  phases: [
    { title: 'Discover' },
    { title: 'Verify' },
  ],
}

const TARGETS = [
  {
    "style": "ev",
    "make": "Kia",
    "model": "Niro EV",
    "yearsHint": "2019-2026",
    "note": "NET-NEW NAMEPLATE - zero rows today, although the combined \"Kia Niro\" nameplate has its own. This catalog treats EV variants as separate nameplates, so do that here and keep hybrid/PHEV Niro findings out. DE 2019-2022 and SG2 2023+. Documented themes: the ICCU / on-board charger and 12V drain problems that run across Hyundai-Kia electrics, DC fast-charge derating and long-term charge-rate taper complaints, the 2021-22 recalls, reduction-gear and drive-motor faults, and heat-pump/cabin-heating shortfalls in cold weather. Confirm each campaign names the EV specifically rather than the hybrid.",
    "forums": "kia-forums.com, niroforum.org, kiaevforums.com, r/kia, r/electricvehicles"
  },
  {
    "style": "ev",
    "make": "Polestar",
    "model": "Polestar 2",
    "yearsHint": "2021-2026",
    "note": "Only 6 documented issues on Polestar's volume car, five model years in. CMA platform, shared with the Volvo XC40 Recharge (7 issues, added 2026-08-26 - check those before returning anything, and do not copy across without confirming the nameplate). The defining chapters: the 2022 recall over inverter software causing sudden loss of propulsion, the high-voltage battery contactor/BECM faults, 12V drain that bricks the car, and the Google Built-In (Android Automotive) infotainment freezes and failed OTA updates. Also: single-motor vs dual-motor differences and the 2024 switch to rear-wheel drive.",
    "forums": "polestarforum.com, swedespeed.com, polestar2forum.com, r/Polestar, r/electricvehicles"
  },
  {
    "style": "ev",
    "make": "Audi",
    "model": "Q4 e-tron",
    "yearsHint": "2022-2026",
    "note": "Only 7 documented issues. VW MEB platform - the SAME skateboard as the VW ID.4 (13 issues here) and ID. Buzz, so MEB-wide faults are plausible but must be confirmed per nameplate. Documented: the well-known MEB infotainment and software failures, 12V battery drain, the rear drive-unit/pulse inverter faults behind several stop-drive campaigns, DC fast-charge derating, and the heat-pump availability and cold-weather range complaints. Quarterly-priority make (Audi, 44 models but only 401 issues). Sportback and standard bodies share mechanicals.",
    "forums": "audiworld.com, q4etronforum.com, vwidtalk.com, r/Audi, r/electricvehicles"
  },
  {
    "style": "ev",
    "make": "Audi",
    "model": "e-tron",
    "yearsHint": "2019-2023",
    "note": "Only 7 documented issues on Audi's first mass-market EV (later renamed Q8 e-tron - keep that rename in mind when searching, much owner discussion uses both names). The defining chapter is the 2019-2020 HIGH-VOLTAGE BATTERY MOISTURE INTRUSION recall: a wiring-harness sealing defect let moisture into the pack and could cause a fire, and it triggered a stop-delivery. Also: 12V and charging-module faults, the virtual side mirrors on equipped cars, MMI/infotainment failures, and thermal-management and charging-speed complaints. Quarterly-priority make.",
    "forums": "audiworld.com, etronforum.com, quattroworld.com, r/Audi, r/electricvehicles"
  },
  {
    "style": "ev",
    "make": "Rivian",
    "model": "R1T",
    "yearsHint": "2022-2026",
    "note": "Only 8 documented issues, while the R1S sibling was just deepened to 10 - and the two share nearly everything, so confirm which nameplate a campaign names rather than assuming. Gen 1 (2022-2024) vs Gen 2 (2025+, an all-new zonal electrical architecture) are meaningfully different vehicles electrically. Documented: the 2022 steering-knuckle fastener recall, seatbelt and airbag campaigns, Gateway module and 12V faults, software/OTA failures that have bricked vehicles, drive-unit failures, heat-pump and HVAC issues, and the tonneau and gear-tunnel mechanisms.",
    "forums": "rivianforums.com, r1tr1s.com, rivianownersforum.com, r/Rivian, r/electricvehicles"
  },
  {
    "style": "ev",
    "make": "Lucid",
    "model": "Air",
    "yearsHint": "2022-2026",
    "note": "Only 8 documented issues, and Lucid as a make has just 15 across 2 models. 900V architecture - genuinely different from almost everything else on the road, so do not reason by analogy to 400V cars. Documented: multiple recalls in the first three years (high-voltage coolant heater, retractable door handles, seatbelt anchorages, the software campaigns), 12V and low-voltage faults, DreamDrive ADAS complaints, infotainment and OTA failures, and build-quality/panel and water-intrusion issues from early Dream Edition and Grand Touring production.",
    "forums": "lucidowners.com, lucidforums.com, r/lucidmotors, r/electricvehicles"
  },
  {
    "style": "new",
    "make": "Buick",
    "model": "Envista",
    "yearsHint": "2024-2026",
    "note": "NET-NEW NAMEPLATE - zero rows today. Launched 2024 as Buick's entry crossover, sharing its platform and its 1.2L turbo three-cylinder (LIH) with the Chevrolet Trax (11 issues, just deepened 2026-08-26) and Buick Encore GX. THE PLATFORM TWIN IS THE MAIN TRAP: a Trax defect is plausible here but must be confirmed against NHTSA naming the Envista. Themes to check: the 1.2T three-cylinder (turbo, timing chain, oil consumption, carbon), the 6-speed automatic, the 11-inch infotainment, and the launch-year recalls including any seat-belt or airbag campaigns.",
    "forums": "buickforums.com, chevytraxforum.com, gm-trucks.com, r/Buick"
  },
  {
    "style": "new",
    "make": "Honda",
    "model": "Prologue",
    "yearsHint": "2024-2026",
    "note": "Only 4 documented issues. GM-BUILT ON ULTIUM, not a Honda platform - this is the key fact about the car, and it means GM-origin battery, BMS and electrical campaigns may apply while Honda-specific software and warranty handling differ. The Ultium siblings are the Chevrolet Blazer EV, Equinox EV, Silverado EV, GMC Hummer EV and Acura ZDX, several of which are already in this catalog. Confirm per-nameplate at NHTSA before attributing anything. Themes: charging faults, 12V drain, propulsion-power-loss campaigns, software/OTA, and the 2024-25 recalls.",
    "forums": "hondaprologueforum.com, driveaccord.net, r/HondaPrologue, r/electricvehicles"
  },
  {
    "style": "new",
    "make": "Jeep",
    "model": "Wagoneer",
    "yearsHint": "2022-2026",
    "note": "Only 4 documented issues on a full-size flagship three model years in (the Grand Wagoneer is a SEPARATE nameplate here with 25 - keep them distinct, they differ in powertrain and trim). WS platform. Powertrain history matters: launch cars used the 5.7 Hemi with eTorque, and 2023+ moved to the 3.0 Hurricane twin-turbo inline-six. Themes: the Hemi lifter/camshaft failure that runs across Stellantis 5.7s, the Hurricane's own early record, the 8-speed, air suspension failures, Uconnect 5 faults, and a heavy early-build recall load including seat-belt and airbag campaigns.",
    "forums": "wagoneerforums.com, jeepgarage.org, moparts.org, r/Wagoneer, r/Jeep"
  },
  {
    "style": "new",
    "make": "Toyota",
    "model": "Crown",
    "yearsHint": "2023-2026",
    "note": "Only 12 documented issues. Reintroduced to the US for 2023 on TNGA-K as a lifted sedan, with two very different powertrains: the 2.5 hybrid (HEV) and the Hybrid MAX 2.4 turbo (T24A-FTS). THE HYBRID MAX MATTERS - the 2024-25 recall over machining debris left in V35A and related turbo engines causing knock and engine failure swept the Tundra, Lexus LX and Grand Highlander, so verify precisely which engine and campaign apply to the Crown rather than assuming. Also: the Crown Signia is a separate 2025 nameplate. Themes: transmission/eCVT behaviour, 12.3-inch infotainment, and launch-year campaigns.",
    "forums": "toyotanation.com, toyotacrownforum.com, priuschat.com, r/Toyota"
  },
  {
    "style": "new",
    "make": "Mazda",
    "model": "CX-50",
    "yearsHint": "2023-2026",
    "note": "Only 19 documented issues. Built in Alabama at the Mazda-Toyota joint plant on the transverse Skyactiv platform - a DIFFERENT vehicle from both the CX-5 (18 issues, just deepened) and the longitudinal CX-90, despite the naming. Powertrains: 2.5 naturally aspirated, 2.5 Turbo, and the 2025+ hybrid which uses TOYOTA hybrid hardware. Themes to check: cylinder deactivation on the 2.5, the turbo's own record, the 6-speed automatic, infotainment and CarPlay, early-build quality and water intrusion, and the launch-period recalls.",
    "forums": "cx50forum.com, mazdas247.com, mazdaforum.com, r/mazda"
  },
  {
    "style": "volume",
    "make": "Toyota",
    "model": "Highlander",
    "yearsHint": "2001-2025",
    "note": "36 issues across FOUR generations of a consistent US three-row best-seller - light for the volume. XU20 2001-2007 (1MZ-FE and 3MZ-FE V6, plus the first Highlander Hybrid), XU40 2008-2013 (2GR-FE - the RUBBER OIL SUPPLY HOSE recall and the VVT-i oil line failure), XU50 2014-2019 (2GR-FKS, the 8-speed), XU70 2020-2025 (2GR-FKS then the 2.4T T24A-FTS from 2023, plus the hybrid). Quarterly-priority make. Themes: the 2GR oil line, torque-converter shudder, dashboard melting in heat, water intrusion and rear liftgate faults. The Grand Highlander is a SEPARATE nameplate - keep them apart.",
    "forums": "toyotanation.com, highlanderclub.com, toyota-4runner.org, r/Toyota"
  },
  {
    "style": "volume",
    "make": "Subaru",
    "model": "Forester",
    "yearsHint": "1998-2025",
    "note": "Only 34 issues (plus 2 pending) across FIVE generations of Subaru's best-seller. SF 1998-2002 and SG 2003-2008 (EJ25 - the head-gasket era, and the turbo XT), SH 2009-2013 (EJ25 and the notorious oil consumption), SJ 2014-2018 (FB25 - the excessive oil consumption class action, and the CVT), SK 2019-2025 (FB25 direct injection), 2025+ (plus hybrid). Quarterly-priority make. THE EJ HEAD-GASKET STORY AND THE FB OIL-CONSUMPTION STORY ARE DIFFERENT ENGINES - merging them is the classic error on this nameplate. Also: CVT torque-converter and valve-body failures, and rear wheel bearing wear.",
    "forums": "subaruforester.org, nasioc.com, subaruoutback.org, iclub.com, r/subaru"
  },
  {
    "style": "volume",
    "make": "Ford",
    "model": "Escape",
    "yearsHint": "2001-2025",
    "note": "33 issues across FOUR generations of one of Ford's highest-volume vehicles. 2001-2007 (the 2.0 Zetec and 3.0 Duratec, plus the first Escape Hybrid), 2008-2012, 2013-2019 (the 1.6 and 2.0 EcoBoost - the 1.6 EcoBoost COOLANT INTRUSION INTO THE CYLINDER and resulting fire recalls are the defining chapter, along with the 6F35 transmission), 2020-2025 (1.5 EcoBoost three-cylinder - which has its OWN coolant-intrusion history - plus the 2.0 and the hybrid/PHEV). Tag to the exact engine; the 1.6 story and the 1.5 story are separate defects on separate hardware. Also: the 2.5 hybrid and the PHEV battery recalls.",
    "forums": "fordescape.org, escape-city.com, ford-trucks.com, r/FordEscape, r/Ford"
  },
  {
    "style": "volume",
    "make": "Chevrolet",
    "model": "Malibu",
    "yearsHint": "1997-2025",
    "note": "30 issues across a nameplate sold continuously for nearly thirty years and discontinued after 2025. Key eras: 1997-2003, 2004-2007 (the ELECTRIC POWER STEERING failures that drew a major recall and NHTSA investigation), 2008-2012 (the 2.4 Ecotec LAF - heavy oil consumption, timing chain wear and the balance-shaft/chain issues), 2013-2015, 2016-2025 (1.5T LFV and 2.0T LTG with the CVT from 2016 on, plus the hybrid). Themes: the 2.4 Ecotec oil consumption and chain, EPS failure, the CVT, ignition/electrical faults, and A/C condenser failures. Tag to the exact engine.",
    "forums": "chevymalibuforum.com, chevroletforum.com, gm-trucks.com, r/Chevy"
  },
  {
    "style": "thin",
    "make": "Acura",
    "model": "RDX",
    "yearsHint": "2007-2025",
    "note": "Only 4 documented issues across THREE generations of Acura's best-selling vehicle. TB1/TB2 2007-2012: the K23A1 2.3 TURBO - genuinely unusual for Honda and with its own record (turbo and oil-feed issues, the 5-speed automatic), plus SH-AWD. TB3/TB4 2013-2018: the J35 3.5 V6 with cylinder deactivation (VCM) - the oil consumption and spark-plug fouling complaints that run across Honda V6s, and the 6-speed. TC1/TC2 2019-2025: the 2.0 turbo with a 10-speed automatic, plus the widely reported infotainment True Touchpad complaints. Three completely different powertrains - never merge them.",
    "forums": "acurazine.com, rdxforums.com, acura-forums.com, r/Acura"
  },
  {
    "style": "thin",
    "make": "Acura",
    "model": "TSX",
    "yearsHint": "2004-2014",
    "note": "ONE documented issue - the thinnest nameplate attempted so far, on a car with a large and still-active enthusiast community. CL9 2004-2008: the K24A2 2.4 - and the widely documented excessive oil consumption, the VTC (variable timing control) actuator RATTLE ON COLD START which is the signature TSX complaint, plus the 5-speed automatic and the 6-speed manual. CU2 2009-2014: the K24Z3 2.4 and the J35Z6 3.5 V6 added for 2010, both with their own records. Also across generations: front lower control arm/compliance bushing wear, power steering pump whine and leaks, and A/C condenser failure. Read the low count as a coverage gap.",
    "forums": "acurazine.com, tsxclub.com, acura-forums.com, r/Acura"
  },
  {
    "style": "thin",
    "make": "Lexus",
    "model": "UX",
    "yearsHint": "2019-2025",
    "note": "Only 3 documented issues on a nameplate seven model years old. Built on TNGA-C, closely related to the Toyota C-HR and Corolla. Two powertrains: UX 200 (2.0 M20A-FKS, with a CVT that uses a mechanical LAUNCH GEAR rather than a pure belt start - unusual and worth describing correctly) and UX 250h/300h hybrid. Themes to check: the hybrid battery and inverter, the Lexus Enform/infotainment and the pre-2022 touchpad, the 2.0 engine's direct-injection carbon and oil-consumption record, brake actuator faults, and the model's recall history. Quarterly note: Lexus is thin overall at 98 issues across 18 models.",
    "forums": "clublexus.com, lexusownersclub.com, toyotanation.com, r/Lexus"
  },
  {
    "style": "thin",
    "make": "Nissan",
    "model": "Quest",
    "yearsHint": "1993-2017",
    "note": "Only 3 documented issues across FOUR generations of a minivan sold for over twenty years. V40 1993-1998 and V41 1999-2002 (co-developed with Ford as the Mercury Villager - shared mechanicals, so Villager findings may be genuinely relevant but confirm the nameplate). V42 2004-2009: the VQ35DE with the notorious problems of that era - the transmission, the dash-mounted instrument pod, sliding-door motor and track failures, and catalytic converter issues. V43 2011-2017: VQ35DE with the CVT, and the JATCO CVT failure record is the defining chapter of this generation. Quarterly-priority make.",
    "forums": "nissanforums.com, nissanquestforums.com, clubfrontier.org, r/Nissan"
  },
  {
    "style": "thin",
    "make": "Mitsubishi",
    "model": "Endeavor",
    "yearsHint": "2004-2011",
    "note": "Only 2 documented issues. Built in Normal, Illinois on the Mitsubishi PS platform shared with the Galant and Eclipse - so findings on those (Galant has rows here) may be genuinely relevant, but confirm the nameplate. Single powertrain across its life: the 6G75 3.8 V6 with a 4-speed automatic. Themes to check: the automatic transmission and torque converter, front suspension and lower ball joint wear, power steering pump and rack leaks, the well-documented rear differential and AWD transfer issues on AWD cars, A/C evaporator and condenser failures, and rust on the rear subframe and suspension in salt states.",
    "forums": "mitsubishi-forums.com, endeavorforums.com, clubgalant.com, r/Mitsubishi"
  },
  {
    "style": "moto",
    "make": "Harley-Davidson",
    "model": "Street Glide",
    "yearsHint": "2006-2025",
    "note": "NET-NEW NAMEPLATE and the best-selling touring motorcycle in the US, with an enormous owner community. Engine eras matter enormously and must never be merged: Twin Cam 88/96 to 2016, Milwaukee-Eight 107/114 from 2017, and the Milwaukee-Eight 117 from 2024. Recurring documented themes: the TWIN CAM CAM-CHAIN TENSIONER shoe wear that sends debris through the engine (the signature failure of that era), excessive rear-cylinder head heat and the resulting rider complaints, Milwaukee-Eight lifter and cam-plate issues, stator and voltage-regulator failure, Boom! Box infotainment faults, and the 2018+ clutch and hydraulic-clutch recalls.",
    "forums": "hdforums.com, harley-davidsonforums.com, road-glide.org, fljrider.com, r/Harley"
  },
  {
    "style": "moto",
    "make": "Yamaha",
    "model": "MT-09",
    "yearsHint": "2014-2025",
    "note": "NET-NEW NAMEPLATE (this catalog holds Yamaha MT-07 already - a DIFFERENT machine with a parallel twin, so never carry findings between them). The MT-09 uses the 847cc then 890cc CP3 crossplane triple; sold as the FZ-09 in the US for 2014-2016, which matters when searching. Recurring documented themes: the 2014-2016 abrupt throttle response and fuelling complaints that Yamaha revised, soft and underdamped stock suspension, the 2015-2016 recalls, cam chain tensioner noise, fuel pump and FI faults, regulator/rectifier and charging failures, and clutch and gearbox issues on hard-ridden examples.",
    "forums": "mt09.net, fz09.org, yamahamt09forum.com, r/MT09, r/motorcycles"
  },
  {
    "style": "moto",
    "make": "BMW",
    "model": "R1250GS",
    "yearsHint": "2019-2023",
    "note": "NET-NEW NAMEPLATE, though this catalog already holds BMW R1200GS (5 pending rows) - the R1250GS is the SHIFTCAM successor and a genuinely different engine, so never carry findings between them. MAKE COLLISION: BMW also has 452 automotive issues here. The 1254cc boxer with ShiftCam variable valve timing. Recurring documented themes: the 2019-2020 final-drive and swingarm bearing complaints, fork-tube and Telelever issues, the well-publicised recalls (including fork slider tubes and the rear shock), TFT and connectivity faults, camshaft and ShiftCam concerns, and clutch and gearbox issues. Adventure (GSA) is a variant, not a separate nameplate.",
    "forums": "advrider.com, ukgser.com, bmwmotorcycletech.info, r/bmwmotorrad, r/motorcycles"
  },
  {
    "style": "moto",
    "make": "Honda",
    "model": "Rebel 500",
    "yearsHint": "2017-2025",
    "note": "NET-NEW NAMEPLATE and one of the best-selling beginner motorcycles in the US, which means an unusually large population of low-mileage machines and a very active owner community. The 471cc parallel twin shared with the CB500 family. Recurring documented themes to check: the notably short rear suspension travel and the resulting harshness complaints, fuel pump and FI faults, regulator/rectifier and stator charging issues, the 2017-2018 recalls, clutch and gearbox behaviour, and the 2020 refresh changes. Also check NHTSA - Honda files motorcycle campaigns like any other manufacturer.",
    "forums": "hondarebelforum.com, rebel500forum.com, honda-forums.com, r/Rebel500, r/motorcycles"
  },
  {
    "style": "moto",
    "make": "Kawasaki",
    "model": "Z900",
    "yearsHint": "2017-2025",
    "note": "NET-NEW NAMEPLATE and Kawasaki is effectively a NET-NEW MAKE for this catalog (zero rows). The 948cc inline-four, successor to the Z800, with the RS and SE variants. Recurring documented themes: the 2017-2018 recalls, regulator/rectifier and stator charging failures (the signature complaint across this engine family), fuel pump and FI faults, cam chain tensioner noise, clutch slave cylinder leaks, fork seal and rear shock wear, and the TFT dash and Bluetooth issues on 2020+ machines. Be careful with the Z900RS, a retro variant with its own chassis - confirm which machine a complaint belongs to.",
    "forums": "kawiforums.com, z900.org, zx-forums.com, r/kawasaki, r/motorcycles"
  }
]

const EXCLUSIONS = [
  {
    "make": "Kia",
    "model": "Niro EV",
    "existingTitles": [],
    "yearsCovered": []
  },
  {
    "make": "Polestar",
    "model": "Polestar 2",
    "existingTitles": [
      "Polestar 2 12V Auxiliary Battery Drain",
      "Polestar 2 Android Automotive Infotainment Bugs",
      "Polestar 2 BMS Software Recall — Charge Limit Mis-Reporting",
      "Polestar 2 Charge Port Door Stuck / Latch Failure",
      "Polestar 2 Front Inverter Recall (Capacitor Tin-Plating Defect) — Sudden Power Loss",
      "Polestar 2 HV Coolant Heater (PTC) Failure"
    ],
    "yearsCovered": [
      2020,
      2021,
      2022,
      2023,
      2024
    ]
  },
  {
    "make": "Audi",
    "model": "Q4 e-tron",
    "existingTitles": [
      "2022-2023 Audi Q4 e-tron Rollaway Recall 454R / NHTSA 25V120",
      "2022-2024 Audi Q4 e-tron Charging-Cable Recall 93U6/93U8 / NHTSA 23V842",
      "2022-2024 Audi Q4 e-tron Headlight Recall 941L / NHTSA 24V361",
      "2024-2025 Audi Q4 e-tron On-Board-Charger Recall 93FR / NHTSA 25V125",
      "Battery Cooling System Efficiency Issues",
      "OTA Updates and Software Glitches",
      "Severe Cold Weather Range Loss (Models Without Heat Pump)"
    ],
    "yearsCovered": [
      2022,
      2023,
      2024,
      2025
    ]
  },
  {
    "make": "Audi",
    "model": "e-tron",
    "existingTitles": [
      "2019-2020 e-tron Charging Door Will Not Open: VIN and Connector Diagnosis Required",
      "2019-2022 e-tron Coolant Valve N632 Leak in Cold Conditions - Diagnosis Required",
      "2019-2022 e-tron High-Voltage Battery Self-Discharge / Fire Risk - Recall 23V867",
      "2019-2023 e-tron Air-Suspension Warning with J1135 Communication Fault - Diagnosis Required",
      "2021 e-tron Charging Interruptions with Onboard-Charger Software 0070 - Diagnosis Required",
      "CCS Charging Port Actuator Failure",
      "OTA Software Update and Infotainment Issues",
      "Virtual Cockpit and MMI Display Blank/Black Screen"
    ],
    "yearsCovered": [
      2019,
      2020,
      2021,
      2022,
      2023,
      2024
    ]
  },
  {
    "make": "Rivian",
    "model": "R1T",
    "existingTitles": [
      "Early R1T Upper Control Arm Corrosion (Salt-Belt)",
      "R1T / R1S 12V Auxiliary Battery Drain (Gear Guard, Cellular Modem)",
      "R1T / R1S Brake Lights Stay On in \"Bench Mode\" (Recall 23V-159)",
      "R1T / R1S Charge Port Motor / Door Failure",
      "R1T / R1S Front Seat Belt Anchor Recall (22V-641, 207 Vehicles)",
      "R1T / R1S Infotainment Freezes + Black-Screen Reboots",
      "R1T / R1S Quad-Motor Front Drive Unit Failures",
      "R1T Frunk Auto-Close Finger Pinch Recall (22V-176)"
    ],
    "yearsCovered": [
      2021,
      2022,
      2023,
      2024
    ]
  },
  {
    "make": "Lucid",
    "model": "Air",
    "existingTitles": [
      "Air 12V Auxiliary Battery Drain (Sentry-Like Modes Enabled)",
      "Air Charge Port LED Indicator Faults",
      "Air Heat Pump Fault Codes (Cold Weather)",
      "Air Infotainment / Center Display Freezes (Early Production)",
      "Air Paint Quality / Orange-Peel + Inclusions (Early Production)",
      "Air Panoramic Glass Roof Wind Noise / Seal Issues",
      "Air Rear Drive Unit Mount / Bushing Wear (Early Production)",
      "Lucid Air Webasto HVCH Recall (SR-24-04-0, Failure to Defrost)"
    ],
    "yearsCovered": [
      2021,
      2022,
      2023,
      2024
    ]
  },
  {
    "make": "Buick",
    "model": "Envista",
    "existingTitles": [],
    "yearsCovered": []
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
    "make": "Jeep",
    "model": "Wagoneer",
    "existingTitles": [
      "5.7L eTorque Engine Stalling at Low Speeds",
      "Air Suspension System Failure / Service Warning",
      "Parasitic Battery Drain / Dead Battery",
      "Rearview Camera Display Failure (Recall 23V-577)"
    ],
    "yearsCovered": [
      2022,
      2023,
      2024,
      2025
    ]
  },
  {
    "make": "Toyota",
    "model": "Crown",
    "existingTitles": [
      "Excessive Road and Wind Noise for Segment",
      "Front Suspension Clunking Over Bumps",
      "Hybrid System Software Glitches and Hesitation",
      "Hybrid System Warning Lamp / MIL in Freezing Temperatures (TSB T-SB-0085-23)",
      "Hybrid Transaxle Shudder/Vibration Under 8 mph (TSB MC-10253240)",
      "Inaccurate Load Carrying Capacity Label (Recall 24V548000, FMVSS 110)",
      "Infotainment System Freezing and Rebooting",
      "Infotainment System Lag and Wireless CarPlay Disconnects",
      "Instrument Panel May Not Display Speed or Brake/TPMS Warning Lights at Startup (Recall 25V595000)",
      "Oil Leak From Cylinder Head Cover at Timing Chain Cover Junction (TSB T-TT-0765-24)",
      "Rearview Camera Freezes or Goes Blank in Reverse (PVM Software Recall, FMVSS 111)",
      "Rearview/Front Camera Water Ingress Failure (Recall 24V442000)"
    ],
    "yearsCovered": [
      2023,
      2024,
      2025
    ]
  },
  {
    "make": "Mazda",
    "model": "CX-50",
    "existingTitles": [
      "ABS Hydraulic Control Unit (HCU) Internal Damage Reduces Braking — Recall 23V-275 / Mazda 5823D",
      "Accessory Trailer Hitch Bolts Under-Torqued / Hitch Can Detach — Recall 7225C (25V-167)",
      "Ambient Air Temperature Sensor Reads Up to 50°F Low, Crippling Automatic Climate Control Cooling",
      "Cloth Seat Bolster Fabric Fraying and Splitting at the Plastic Trim Edge",
      "Cylinder Deactivation Solenoid Failure with Metal Shavings in Oil (Naturally-Aspirated 2.5L)",
      "Excessive Wind Noise from Roof Rails",
      "Forward Sensing Camera Mode-Setting Error / i-Activsense Malfunction — Recall 6824H (24V-649)",
      "Front Lower Control Arm Ball Joint Bolt Under-Torqued at Assembly — Suspension/Wheel Separation Risk (Recall 25V737 / Mazda 7925J)",
      "Fuel Filler Door Locked Shut — Fuel Tank Shut-Off Valve Sticking Closed",
      "Hybrid Shifter Moves Neutral-to-Drive Without Brake Pedal (Factory/Transport Mode Left Active) — Recall 25V418 / Mazda 7725F",
      "Hybrid System Failure Warning / No-Start — Powertrain Gateway Unit Logic (TSB 30-001/25)",
      "Infotainment System Lag and Slow Response",
      "Panoramic Sunroof Rattle from Loose Cross-Brace and Side-Cover Retention Clips",
      "Power Liftgate Inoperative with Three-Beep Fault (Control Module / Gas Strut Failure)",
      "Premature 12V Battery Failure and Parasitic Drain (i-stop AGM/EFB, Door-Jamb Connector Corrosion)",
      "Transmission Hesitation on Acceleration",
      "Turbo Wastegate Rattle on Cold Start",
      "Windshield Cracking Radiating from Driver-Side A-Pillar with Little/No Impact",
      "Wireless Charging Pad Overheats and Halts Charging (No Ventilation Behind Center Stack)"
    ],
    "yearsCovered": [
      2023,
      2024,
      2025
    ]
  },
  {
    "make": "Toyota",
    "model": "Highlander",
    "existingTitles": [
      "1AR-FE 2.7L Four-Cylinder Excessive Oil Consumption (Low-Tension Ring / Carbon Buildup)",
      "2.4L 2AZ-FE Head Gasket and Head Bolt Thread Failure",
      "2GR-FE V6 Excessive Oil Consumption",
      "2GR-FE V6 Oil Leak (Timing Cover and Oil Cooler Line)",
      "2GR-FE Valve Cover Gasket & Spark-Plug Tube Seal Oil Leak (Oil-Fouled Coils / Misfire)",
      "2GR-FE VVT-i Oil Supply Hose Rupture — Sudden Oil Loss (Service Campaign LSC 90K)",
      "8-Speed Automatic Transmission Shudder and Hesitation",
      "A/C Condenser Leak / Thin-Fin Failure (Rock-Strike Refrigerant Loss)",
      "AC Blower Motor Failure and Resistor Burnout",
      "AWD Rear Differential Coupling & Bearing Noise (Whine/Growl That Rises With Speed)",
      "Catalytic Converter Efficiency Failure — P0420 / P0430 Check Engine Light",
      "Charging System Malfunction / Alternator Failure (No-Start, Battery Not Charging)",
      "Cluster Fails to Show Speedometer and Brake/Tire Pressure Warnings After Start (Recall 25V595000)",
      "Denso Low-Pressure Fuel Pump Failure Causing Engine Stalling (Recall 20V-012)",
      "Entune Infotainment Touchscreen Freeze / Blank Display (MFD Lockup)",
      "EVAP Purge Valve / Charcoal Canister Failure — P0441 / P0455 & Fuel-Pump Click-Off",
      "Front Strut Mount / Suspension Clunk & Knock Over Bumps",
      "Highlander and Highlander Hybrid: Wrong Added-Weight Figure on GST Load Capacity Label (Recall 24V548000)",
      "Highway Wind Noise and Sunroof/Moonroof Rattle (A-Pillar Seal / Mirror Whistle)",
      "Hybrid Battery Pack Degradation and Failure",
      "Hybrid Brake Booster / ABS Actuator Assembly Failure (Accumulator Leak) — C1391",
      "Hybrid Fuel Tank Venting Defect — Tank Cannot Be Filled to Capacity",
      "Hybrid Inverter Coolant Pump Failure (Inverter Overheat) — P0A05 / P0A93",
      "Ignition Coil and Intake/PCV Failure Causing Random Misfire (2.7L 1AR-FE / 2GR V6) — P0300",
      "Panoramic Moonroof Rattle/Creak and Water Leak",
      "Power Liftgate Support Arm and Hinge Failure (Rear Hatch Bows / Won't Close) — Class Action",
      "Premature Front Brake Rotor Warping / Brake Pedal Pulsation at Low Mileage",
      "Radiator Internal Transmission-Cooler Failure — ATF/Coolant Cross-Contamination (\"Strawberry Milkshake\")",
      "Rear Cargo / Hatch Water Leak (Taillight & Hatch Seal Intrusion)",
      "Rearview Camera May Freeze or Show a Blank Screen in Reverse (Recall 25V744000)",
      "Second-Row Seat Back May Fail to Lock (Recall 26V-128)",
      "Sun Visor Sags / Won't Stay Up (Warranty Enhancement ZF1)",
      "UA80 8-Speed Transmission Whine/Grind — Front Carrier Pinion Shaft Failure",
      "V6 Engine Oil Sludge / Gelling (1MZ-FE / 3MZ-FE) — Oil Pump Pickup Starvation",
      "V6 Engine Water Pump Leak and Failure (Weep-Hole Coolant Loss)",
      "Windshield Cracks Easily and Costly Safety Sense Camera Recalibration"
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
    "make": "Subaru",
    "model": "Forester",
    "existingTitles": [
      "2022 Forester Inhibitor Switch Water Ingress — Reverse Lights and Backup Camera May Not Work (NHTSA 23V755000)",
      "A/C Compressor Clutch Bearing Failure",
      "A/C Compressor Failure and Clutch Noise",
      "A/C Condenser Internal Corrosion and Refrigerant Leak (Service Program WRB-21)",
      "Brake Light Switch Silicone Contamination — No-Start / Stuck in Park (Recall WUE-90 / NHTSA 19V-149)",
      "Catalytic Converter Efficiency Failure (P0420) — Often Triggered by Oil-Burning Contamination",
      "CVT Judder and Vibration at Low Speeds",
      "CVT Transmission Shudder and Premature Failure",
      "Denso Low-Pressure In-Tank Fuel Pump Failure Causing Sudden Stalling",
      "EJ25 Head Gasket Failure (External Leak)",
      "EJ255 Turbo Piston Ringland Cracking and Engine Failure (Forester XT)",
      "Electric Power Steering Gearbox Corrosion / Cracking in Salt Belt (TSB 04-21-18 + Warranty Extension)",
      "EyeSight False / Phantom Automatic Emergency Braking",
      "FB25 Engine Excessive Oil Consumption",
      "FB25 Timing Chain Tensioner Cold-Start Rattle",
      "Front Air/Fuel Ratio (Wideband O2) Sensor Heater Circuit Failure — P0031/P0037",
      "Front CV Axle Boot Tearing and Grease Leak Causing Clicking on Turns",
      "Front Driveshaft Outer Race Crack and Breakage (Recall WRP-23)",
      "Front Lower Control Arm Forward Bushing Premature Wear — Steering Wobble (TSB 05-63-18)",
      "Front Passenger Occupant Detection System (ODS) Sensor Mat Harness Failure — Airbag Warning Light and Deactivated Passenger Airbag",
      "Ignition Coil Failure Causing Misfire and Hard Cold-Weather Starting",
      "PCV Valve Separation Causing Loss of Power and Engine Damage (Recall WUW-08)",
      "Power Liftgate Won't Stay Open / Drops Shut (Failed Gas Struts)",
      "Premature Front and Rear Wheel Bearing/Hub Failure (Faulty Backing Plate Design)",
      "Premature Front Brake Rotor Warping / Brake Judder — Steering-Wheel Shudder When Braking",
      "Premature Rear Tire Inner-Edge Wear From Excess Factory Rear Toe",
      "Rear Coil Spring Corrosion Fracture (Recall WUT-05) — Spring Snaps in Salt-Belt States",
      "Rear Suspension Bushing Clunk Over Bumps",
      "Secondary Air Injection Pump Relay Failure — Overheat / Fire Risk (Turbo XT, Recall WTM-73 / NHTSA 16V-738)",
      "Starlink DCM Parasitic Battery Drain After 3G Network Shutdown",
      "Starlink Infotainment Screen Freezing, Rebooting and Black Screen",
      "Sunroof/Moonroof Water Leak From Clogged or Detached Drain Tubes",
      "Takata Front Passenger Airbag Inflator Rupture Risk (PSAN) — Safety Recall",
      "Turbo Failure From Clogged Oil-Supply Banjo Bolt Filter (Forester XT, EJ255)",
      "Valve Cover Gasket and Spark Plug Tube Seal Oil Leak Causing Misfires (FB25)",
      "Windshield Spontaneous Cracking Near EyeSight Camera"
    ],
    "yearsCovered": [
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
    "model": "Escape",
    "existingTitles": [
      "1.5L EcoBoost Coolant Intrusion Into Cylinders",
      "1.5L EcoBoost Coolant Intrusion into Cylinders - Engine Block Porosity",
      "1.5L EcoBoost Cracked Fuel Injector Leaking Fuel Onto Hot Engine Surfaces (Underhood Fire Risk)",
      "2.0L EcoBoost Coolant Intrusion - Open-Deck Block Design Failure",
      "2.5L Hybrid Engine Block / Oil Pan Breach - Underhood Fire Risk (Recall 23S27)",
      "8F35 8-Speed Automatic Transmission Needle-Bearing Failure and Shudder/Buck (Non-Hybrid)",
      "ABS Module Brake Fluid Leak and Underhood Fire Risk",
      "Automatic Transmission Failure and Loss of Drive",
      "AWD Power Transfer Unit (PTU) Overheating, Fluid Leak, and Failure",
      "Cruise Control Cable / Throttle Sticking and Unintended Acceleration",
      "CVT Transmission Shudder and Jerking (2020+ Hybrid)",
      "Cylinder Head Ball-Plug Ejection Causing Oil Leak, Fire, and Engine Seizure (1.5L EcoBoost, Recall 25V372)",
      "EGR Valve Failure — Unexpected Loss of Drive Power (Recall 26S10 / NHTSA 26V122000)",
      "Electric Power Steering Rack Failure",
      "Engine Block Heater Can Overheat While Plugged In - Fire Risk (Recall 25S52 / NHTSA 25V343000)",
      "Engine Stalling, Misfire, and Loss of Power",
      "Front Door Check-Arm Weld Failure — Doors Pop, Bind, or Won't Stay Closed",
      "Front Subframe Rust and Lower Control Arm Separation",
      "Fuel Pump Failure Causing Sudden Stalling - Recall 15V005 (Ford 14S30)",
      "Fuel Tank Strap Corrosion and Fuel Tank Drop Risk",
      "Hybrid Forced-Neutral / Sudden Loss of Motive Power (HPCM Software, Recall 24V330)",
      "Liftgate Hinge Cover Can Detach and Become a Road Hazard (Panoramic Roof, Recall 25V829)",
      "Liftgate Latch Failure — Will Not Open or Close",
      "P0011 — Intake Cam Timing Over-Advanced from Sticking VCT Solenoid",
      "P0420 — Failed Catalytic Converter (Bank 1) on EcoBoost Escapes",
      "P0430 — Failed Bank 2 Catalytic Converter on 3.0L Duratec V6 Escapes",
      "P0442 — Small EVAP Leak from Gas Cap or Canister Purge Valve",
      "P0455 — Gross EVAP Leak from Capless Filler Neck or Purge Valve",
      "P0741 — Torque Converter Clutch Failure in the 6F35 Automatic",
      "Panoramic Sunroof Water Leak Into Cabin",
      "PHEV High-Voltage Battery Cell Internal Short Circuit — Loss of Power / Thermal Venting Fire (Recall 24V954)",
      "Side Door Latch Failure - Door May Open While Driving",
      "SYNC 4 Rearview Camera Image Freezes, Delays, or Goes Blank in Reverse (Recall 25V315)",
      "Windshield Wiper Linkage Failure"
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
    "model": "Malibu",
    "existingTitles": [
      "1.5T LFV/LYX Engine PCV System and Oil Consumption",
      "4-Speed Automatic Shift Cable Tab Separation — Car Can Roll Away From 'Park' (Recall 12V460000)",
      "6T40 Transmission Shudder and Harsh Shifts",
      "9-Speed Automatic Transmission Shudder and Harsh Shifting",
      "A/C Compressor Clutch Failure",
      "Body Control Module and Instrument Cluster Electrical Faults Causing Gauges, Warning Lights, and Accessory Malfunctions",
      "Brake Light Switch Failure and Stoplamp Circuit Problems Causing Cruise Control and Shift Interlock Issues",
      "Ecotec 2.4L Timing Chain and Guide Failure",
      "Electric Power Steering (EPS) Assist Motor Failure",
      "Electric Power Steering Column Clunk and Intermediate Steering Shaft Noise",
      "Electric Power Steering Motor Failure",
      "Excessive Oil Consumption (2.5L Ecotec LCV/LKW)",
      "Front Turn Signal / Hazard Switch Failure Causing Inoperative or Erratic Blinkers",
      "Front Wheel Bearing and Hub Assembly Failure Causing Growling Noise and ABS Warning Lights",
      "Hazard Warning Switch Causing Turn Signal and Brake Lamp Malfunctions",
      "Hazard Warning Switch Solder Joint Cracking Causing Intermittent or Dead Turn Signals (Recall 03V327000)",
      "NHTSA Recall 14V252000: Body Control Module Connection Resistance Disturbs Brake Apply Sensor Circuit",
      "NHTSA Recall 15V064000: Sudden Loss of Electric Power Steering Assist (Torque Sensor)",
      "P0128 — Coolant Below Thermostat Regulating Temperature from Thermostat Stuck Open",
      "P0174 — System Too Lean (Bank 2) from Failed EVAP Purge Valve / Intake Manifold Gasket Leak on the 3.5L & 3.6L V6",
      "P0302 — Cylinder 2 Misfire from Failed Ignition Coil or Fouled Spark Plug",
      "P0303 — Cylinder 3 Misfire from Ignition Coil/Plug or Intake-Valve Carbon Buildup on the 1.5L Turbo",
      "P0420 — Catalyst Efficiency Below Threshold (Bank 1) from Oil-Consumption-Poisoned Converter on the 2.4L Ecotec",
      "P0430 — Catalyst Efficiency Below Threshold (Bank 2) from Aged/Failed Rear-Bank Converter on the V6",
      "P0442 — Small EVAP Leak from Gas Cap O-Ring or Purge Valve (Capless Filler Seal on 2016+)",
      "P0455 — Gross EVAP Leak from Loose/Failed Gas Cap or Stuck Purge Valve",
      "Passlock Anti-Theft System Causing No-Start and Intermittent Stalling",
      "Passlock Anti-Theft System No-Start and Security Light Failures",
      "Recall 09V073000: Shift Cable Adjustment Clip Not Fully Engaged — Rollaway Risk",
      "Shift Cable Fracture on 4-Speed Automatic (NHTSA Recall 14V224000)",
      "Trunk Latch and Release Failure"
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
    "make": "Acura",
    "model": "RDX",
    "existingTitles": [
      "2.0T Engine Oil Dilution from Direct Injection Fuel Wash",
      "AC Compressor Clutch and Bearing Failure",
      "Transmission Harsh Shifting and Hesitation from Stop",
      "True Touchpad Interface Infotainment Reboots and Lag"
    ],
    "yearsCovered": [
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
    "make": "Acura",
    "model": "TSX",
    "existingTitles": [
      "AC Compressor Clutch Failure",
      "Power Steering Pump Whine and Moan on Cold Start"
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
      2014
    ]
  },
  {
    "make": "Lexus",
    "model": "UX",
    "existingTitles": [
      "12V Auxiliary Battery Drain and Premature Failure",
      "CVT Hesitation and Sluggish Response",
      "Infotainment System Lag and Touchpad Frustration"
    ],
    "yearsCovered": [
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
    "make": "Nissan",
    "model": "Quest",
    "existingTitles": [
      "CVT Transmission Failure Under Load",
      "Power Sliding Door Failure",
      "Power Sliding Door Motor and Latch Failure",
      "Rear A/C System Failure"
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
      2017
    ]
  },
  {
    "make": "Mitsubishi",
    "model": "Endeavor",
    "existingTitles": [
      "AC Compressor Premature Failure",
      "Automatic Transmission Harsh Shifting and Failure"
    ],
    "yearsCovered": [
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
    "make": "Harley-Davidson",
    "model": "Street Glide",
    "existingTitles": [],
    "yearsCovered": []
  },
  {
    "make": "Yamaha",
    "model": "MT-09",
    "existingTitles": [],
    "yearsCovered": []
  },
  {
    "make": "BMW",
    "model": "R1250GS",
    "existingTitles": [],
    "yearsCovered": []
  },
  {
    "make": "Honda",
    "model": "Rebel 500",
    "existingTitles": [],
    "yearsCovered": []
  },
  {
    "make": "Kawasaki",
    "model": "Z900",
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
log(`Wave 12: ${TARGETS.length} targets — ${Object.entries(byStyle).map(([k, v]) => `${k}:${v}`).join('  ')}`)

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
log(`WAVE 12 TOTAL: ${confirmed.length}/${totalFound} confirmed, ${totalOfficial} official-backed, ${totalForum} forum-backed`)

return { result: { confirmed, stats: { models: TARGETS.length, found: totalFound, confirmed: confirmed.length, forumBacked: totalForum, officialBacked: totalOfficial, byStyle: styleTotals, perModel: perModelStats } } }
