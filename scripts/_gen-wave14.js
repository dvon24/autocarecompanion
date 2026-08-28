#!/usr/bin/env node
/**
 * Generate RESEARCH WAVE 14 - the used-market / work-truck wave.
 *
 * Reuses wave 11's prompt body verbatim (`scripts/_wave11-body.js`), unchanged since waves 11-13
 * confirmed at 86-91%. Only the targets change.
 *
 * WHY THESE TARGETS - the selection came from a full nameplate coverage sweep (833 car nameplates,
 * counting published + pending_review). Waves 9-13 pushed hard on EVs and recent launches; that
 * left an entire class of HIGH-DEMAND, HIGH-FAILURE, OLD vehicles sitting at 5-8 issues each.
 * These are used-market vehicles people actually own and search for, and their failure records are
 * the best-documented in the industry (NHTSA campaigns, class actions, decades of forum threads).
 *
 * 1. HEAVY-DUTY AND WORK VEHICLES - the biggest single gap in the catalog. The 6.0/6.4 Power
 *    Stroke, the LB7/LML Duramax and the 5.9/6.7 Cummins are among the most-searched failure
 *    stories in North America, and the full-size vans are fleet vehicles with enormous mileage.
 *    NAMEPLATE HYGIENE: this catalog already splits "Ford F-250" (6) from "Ford F-250 Super Duty"
 *    (7), and "Dodge Ram 2500" (5) from "RAM 2500" (21). Findings must be filed against the
 *    nameplate named in each target below - do not invent a variant.
 *
 * 2. HIGH-VOLUME USED VEHICLES - Liberty, Patriot, Town & Country, Cavalier, Crown Victoria and
 *    Matrix each sit at 5 issues with millions on the road and well-documented defects.
 *
 * 3. THIN LUXURY AND ENTHUSIAST - Lexus ES at 5 is the standout: Lexus's highest-volume sedan.
 *    (Note the legacy split rows "Lexus ES300" at 1 - do NOT file there; use "Lexus ES".)
 *
 * NO MOTORCYCLES this wave. The class has 166 researched issues and none are published because
 * ~30 make-only read paths are still ungated. More moto research adds nothing until that ships.
 *
 * PREREQUISITE - CHECKED 2026-08-28: `~/.claude/settings.json` sets
 * env.CLAUDE_CODE_MAX_WEB_SEARCHES_PER_SESSION = 25000. Unset means a 200/session ceiling and the
 * targets scheduled LAST return a clean {"candidates":[]} with no error at all.
 */
require('dotenv').config({ path: '.env.local', quiet: true });
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const TARGETS = [
  // ------------------------------------------------- HEAVY DUTY / WORK TRUCKS
  {
    style: 'top', make: 'Ford', model: 'F-250 Super Duty', yearsHint: '1999-2016',
    note: 'Only 7 documented issues on one of the most failure-documented vehicles in North America. THIS NAMEPLATE IS SPLIT IN THE CATALOG - a separate "Ford F-250" row exists with 6 issues; file everything here and do not create the other spelling. The defining chapters are diesel: the 6.0L Power Stroke (2003-2007) with head-gasket lift and stretched head bolts, EGR cooler failure, oil cooler plugging, FICM failure and the STC fitting on the HPOP - this engine produced a class action and a Ford buy-back program, and the record is exceptional. Then the 6.4L Power Stroke (2008-2010) with radiator/coolant leaks, piston cracking and the DPF regen fuel-dilution problem. Then the 6.7L Scorpion (2011+) with the CP4.2 injection pump self-destruction. Also gas: the 6.8L V10 spark-plug blowout and two-piece plug breakage on the earlier Triton heads. Chassis: the 2005-2007 death-wobble track bar, ball joints and the front leaf/coil transition.',
    forums: 'ford-trucks.com, powerstroke.org, thedieselstop.com, oilburners.net, r/FordTrucks, r/Diesel',
  },
  {
    style: 'top', make: 'Ford', model: 'F-350', yearsHint: '1999-2016',
    note: 'Only 5 documented issues. Shares the Super Duty platform and the same diesel record as the F-250 - but do NOT blind-copy: file only what sources tie to the F-350/dually specifically, or to the shared engine where the source names it. The F-350-specific angles worth chasing: dual-rear-wheel tire and wheel-bearing loads, the higher-GVWR rear axle and leaf packs, the fifth-wheel/gooseneck towing failures, the DRW brake wear pattern, and the chassis-cab variants. The engine chapters (6.0L head bolts/EGR/oil cooler, 6.4L radiator and pistons, 6.7L CP4.2) apply if the source names the F-350 or the engine family.',
    forums: 'ford-trucks.com, powerstroke.org, thedieselstop.com, r/FordTrucks, r/Diesel',
  },
  {
    style: 'top', make: 'Chevrolet', model: 'Silverado 2500HD', yearsHint: '2001-2019',
    note: 'Only 8 documented issues on GM\'s heavy-duty volume truck. The Duramax generations are the story and each has a distinct, well-documented defect: LB7 (2001-2004) INJECTOR FAILURE - the single most documented Duramax problem, with an extended 7yr/200k warranty because injectors are under the valve covers; LLY (2004.5-2005) overheating while towing; LBZ/LMM (2006-2010) with the LMM DPF regeneration and injector issues; LML (2011-2016) CP4.2 HIGH-PRESSURE FUEL PUMP FAILURE contaminating the entire fuel system, which produced a class action; L5P (2017+) is comparatively clean, say so if the evidence says so. Also: the Allison 1000 transmission behaviour, the 2007-2014 rusting brake lines, the AFM/DoD lifters on the 6.0L gas, and the steering-shaft clunk. GM SIBLING: GMC Sierra 2500HD is a SEPARATE nameplate here (5 issues) - confirm which the source names.',
    forums: 'duramaxforum.com, dieselplace.com, gm-trucks.com, chevytalk.org, r/Duramax, r/Diesel',
  },
  {
    style: 'top', make: 'GMC', model: 'Sierra 2500HD', yearsHint: '2001-2019',
    note: 'Only 5 documented issues. Mechanical twin of the Silverado 2500HD - the Duramax LB7 injector, LLY overheat, LMM DPF and LML CP4.2 chapters all apply where the source names the Sierra or the engine family. Do not simply mirror the Silverado; NHTSA campaigns list both nameplates explicitly when they cover both, so verify. GMC-specific angles: the Denali trim electronics and MagneRide where fitted, the different front fascia/headlamp campaigns, and the Sierra-badged chassis cab. Note GMC Sierra 3500HD already has 24 issues in this catalog - use it as a cross-check for what the 2500HD is missing rather than as a source to copy.',
    forums: 'duramaxforum.com, dieselplace.com, gm-trucks.com, r/Duramax, r/GMC',
  },
  {
    style: 'top', make: 'Chevrolet', model: 'Express', yearsHint: '1996-2024',
    note: 'Only 5 documented issues on a van that has been in production nearly thirty years and is overwhelmingly a fleet/commercial vehicle - meaning high-mileage failure data is abundant. Documented themes: the 4L60E/4L80E and later 6L90 transmission failures under load, the 6.0L Vortec AFM lifter and valve-spring issues, the 6.6L Duramax option in later vans, the notorious rear-door hinge and latch problems, the 2007-2014 brake line and fuel line corrosion, HVAC rear-air failures, the ABS/EBCM, and the long list of NHTSA campaigns including the seat-belt and the rear-door ones. Upfitter and cutaway variants complicate fitment - state which body applies. TWIN: GMC Savana is a SEPARATE nameplate here.',
    forums: 'gm-trucks.com, chevyexpressforum.com, expressvanforum.com, r/vandwellers, r/Chevy',
  },
  {
    style: 'top', make: 'GMC', model: 'Savana', yearsHint: '1996-2024',
    note: 'Only 5 documented issues. Badge twin of the Chevrolet Express - the same 4L80E/6L90, Vortec AFM, brake-line corrosion and rear-door latch chapters apply where sources name the Savana. Verify rather than mirror: NHTSA campaigns normally name both, so a campaign that names only the Express should not be filed here. Savana-specific: the passenger/cutaway upfits, the 2500/3500 GVWR differences and the commercial-fleet duty cycle that drives the rear suspension and brake findings.',
    forums: 'gm-trucks.com, gmsavanaforum.com, r/vandwellers, r/GMC',
  },
  {
    style: 'top', make: 'Ford', model: 'E-Series', yearsHint: '1992-2024',
    note: 'Only 5 documented issues on the best-selling full-size van in American history, still built as a cutaway today - ambulances, shuttles, box trucks and RVs all ride on it, so failure data is extensive. Documented themes: the 5.4L and 6.8L Triton SPARK PLUG BLOWOUT (threads pulling from the aluminium head) and the later two-piece plug that breaks on removal, the 5.4L cam phaser rattle and timing chain, the 6.0L Power Stroke chapters in the E-350/E-450 diesel vans (head bolts, EGR cooler, oil cooler), the 4R100/5R110 TorqShift transmissions, the rear-door hinge and step-bumper corrosion, and the long recall history. The E-150 was dropped after 2014 while E-350/E-450 cutaways continue - be precise about which body and year.',
    forums: 'ford-trucks.com, econolineforum.com, powerstroke.org, r/vandwellers, r/Ford',
  },

  // ------------------------------------------------- HIGH-VOLUME USED VEHICLES
  {
    style: 'top', make: 'Jeep', model: 'Liberty', yearsHint: '2002-2012',
    note: 'Only 5 documented issues on a vehicle with an unusually heavy and well-documented failure record. KJ (2002-2007) and KK (2008-2012) are different vehicles - keep them apart. Documented themes: the 3.7L PowerTech V6 VALVE SEAT DROP causing catastrophic engine failure, the KJ 2.8L CRD diesel with its EGR and turbo problems, the well-known WINDOW REGULATOR failures, the ball joints and lower control arms, the rear differential and the 2002-2004 recalls, the notorious KK sunroof/sky-slider roof leaks and its drainage, the fuel-tank/skid-plate campaign, and the 42RLE transmission. This nameplate has a large active owner base relative to sales, which is exactly the profile that returned 13/13 on the 350Z in wave 11b.',
    forums: 'jeepforum.com, libertyforum.net, jeepkj.net, cherokeeforum.com, r/Jeep, r/JeepLiberty',
  },
  {
    style: 'top', make: 'Jeep', model: 'Patriot', yearsHint: '2007-2017',
    note: 'Only 5 documented issues across an eleven-year production run of a high-volume budget crossover. THE DEFINING STORY IS THE JATCO JF011E CVT - overheating, limp mode and outright failure, with a documented aux-cooler service action; describe accurately what Chrysler did and did not issue. Also: the 2.0L and 2.4L World Engine with its oil consumption and the timing chain/tensioner, the notorious head-gasket and rocker-arm complaints, front strut and wheel-bearing wear, the TIPM electrical failures that swept Chrysler products of this era, water leaks at the doors and the A-pillar, and the recalls. SIBLING: Jeep Compass shares the platform and CVT - confirm which nameplate the source names.',
    forums: 'jeepforum.com, patriotforums.com, jeeppatriot.org, r/Jeep, r/JeepPatriot',
  },
  {
    style: 'top', make: 'Chrysler', model: 'Town & Country', yearsHint: '1996-2016',
    note: 'Only 5 documented issues on a nameplate that defined the American minivan for two decades. Generations differ substantially - be precise. Documented themes: the 41TE/62TE TRANSMISSION FAILURES that dominate the ownership record, the 3.6L Pentastar CYLINDER HEAD failure (the left-bank rocker/head defect with its own warranty extension), the 3.3/3.8 oil leaks and the 2.8 diesel in some markets, the POWER SLIDING DOOR motor, cable and latch failures, the TIPM (totally integrated power module) failures that caused no-starts, fuel-pump-relay problems and even fires across Chrysler products of this era, the rear liftgate struts, and the long recall list. SIBLING: Dodge Grand Caravan is essentially the same vehicle and is a separate nameplate - confirm attribution.',
    forums: 'chryslerminivan.net, allpar.com, minivan.net, r/ChryslerPacifica, r/Chrysler',
  },
  {
    style: 'top', make: 'Kia', model: 'Sedona', yearsHint: '2002-2021',
    note: 'Only 6 documented issues across three generations of Kia\'s minivan. Quarterly-priority make context: Kia is under-covered relative to volume. Documented themes: the 3.5L and 3.8L Lambda V6 - including the widely reported early-generation timing belt and water pump interval and the later oil consumption, the POWER SLIDING DOOR motor and latch failures, the 2006-2012 lower control arm and ball joint, the alternator and battery drain complaints, the 2015+ YP generation infotainment and the sliding-door recall, brake-light switch (a Hyundai-Kia-wide campaign - confirm the Sedona is named), and the airbag/ODS seat-sensor faults. Note Kia Carnival is the successor nameplate and is separate.',
    forums: 'kia-forums.com, kiasedonaforum.com, kiaforum.com, r/kia',
  },
  {
    style: 'top', make: 'Chevrolet', model: 'Cavalier', yearsHint: '1995-2005',
    note: 'Only 5 documented issues on one of the highest-volume American compacts ever built - millions sold, and still a common first car. The J-body 1995-2005 run is the target (the 2016+ Chinese/Mexican Cavalier is a different vehicle - exclude it unless clearly separated). Documented themes: the 2.2L OHV and 2.2L Ecotec HEAD GASKET failures, the intake manifold gasket, the notorious ignition-switch and key-cylinder problems (note the ignition-switch recall that swept GM applies to specific models - confirm the Cavalier is named rather than assuming), the 3T40/4T40E transmission, blower motor resistor, fuel pump failure, and the rear brake and coil-spring corrosion on northern cars. TWIN: Pontiac Sunfire is the same car under another badge and is a separate nameplate here (1 issue).',
    forums: 'j-body.org, cavalierforums.com, chevytalk.org, r/Chevy',
  },
  {
    style: 'top', make: 'Toyota', model: 'Matrix', yearsHint: '2003-2013',
    note: 'Only 5 documented issues. Quarterly-priority make (Toyota is thin relative to volume). The Matrix is mechanically a Corolla wagon and shares the 1ZZ-FE / 2ZZ-GE / 2ZR-FE engines - which matters because THE 1ZZ-FE OIL CONSUMPTION AND PISTON-RING DEFECT is one of the best-documented Toyota engine problems of the era and carries its own service campaign. Also: the 2ZZ-GE lift-bolt failure on the XRS, the notorious 2003-2008 ENGINE-COMPARTMENT WIRING and the ECM problems, the Takata airbag inflator campaigns, the excessive rear-wheel-bearing and rear-brake wear, sunroof and hatch water leaks, and the accelerator-pedal/floor-mat recalls that swept Toyota in 2009-2010. TWIN: Pontiac Vibe is the same vehicle - confirm attribution.',
    forums: 'toyotanation.com, matrixowners.com, corollaland.com, r/ToyotaMatrix, r/Toyota',
  },
  {
    style: 'top', make: 'Ford', model: 'Crown Victoria', yearsHint: '1992-2011',
    note: 'Only 5 documented issues on the Panther-platform car that served as nearly every American police cruiser and taxi for two decades - which means the failure data comes with fleet maintenance records, not just owner anecdotes. Documented themes: THE 1992-2001 FUEL-TANK / REAR-IMPACT FIRE controversy and the police-package shields (a genuinely major, well-sourced safety story - describe it precisely and factually), the 4.6L 2V Modular engine INTAKE MANIFOLD CRACKING at the plastic coolant crossover (with a class action and a redesigned part), spark-plug thread and blow-out issues on the later heads, the 4R70W/4R75W transmission, the air-suspension option on the Grand Marquis-derived cars, blend-door actuators, and the rear axle and control-arm bushings under fleet duty. SIBLINGS: Mercury Grand Marquis and Lincoln Town Car (9 issues here) share the platform.',
    forums: 'crownvic.net, panthercarclub.com, ford-trucks.com, r/CrownVictoria, r/Ford',
  },

  // --------------------------------------------- THIN CROSSOVERS AND LUXURY
  {
    style: 'thin', make: 'Cadillac', model: 'SRX', yearsHint: '2004-2016',
    note: 'Only 5 documented issues across two very different generations. Gen 1 (2004-2009) is a rear-drive Sigma-platform wagon-SUV with the 3.6L LY7 and the Northstar 4.6L V8; gen 2 (2010-2016) is front-drive Theta with the 3.0L LF1 and the 3.6L LFX. Keep them apart. Documented themes: the LY7/LF1 TIMING CHAIN STRETCH from oil dilution and extended intervals - one of the best-documented GM V6 problems, with its own service bulletins; the Northstar head-bolt/head-gasket failure on gen 1; the gen-1 panoramic sunroof and its drains; the CUE INFOTAINMENT DELAMINATING TOUCHSCREEN on gen 2, which produced a class action and a warranty extension; the 6T70 transmission; and the HID headlamp and water-ingress campaigns.',
    forums: 'cadillacforums.com, cadillacowners.com, srxforum.com, r/Cadillac',
  },
  {
    style: 'thin', make: 'Ford', model: 'EcoSport', yearsHint: '2018-2022',
    note: 'Only 5 documented issues. Sold in the US 2018-2022 but built globally since 2013 - be explicit about which market and generation a finding covers, because the Brazilian/Indian cars differ. Documented themes: the 1.0L EcoBoost three-cylinder with its wet-belt and coolant-intrusion record (the wet timing belt in oil is a genuinely significant, well-documented Ford three-cylinder story - confirm which engines/markets), the 2.0L Ti-VCT, the 6F35 transmission shudder and harsh shifts, the SIDE-SWINGING TAILGATE and its hinge/strut problems, water leaks and the rear-wiper, SYNC 3 faults, and the recalls including the fuel-injector/fuel-odour campaigns that hit Ford three-cylinders.',
    forums: 'ecosportforum.com, fordecosportforum.com, ford-forums.com, r/Ford',
  },
  {
    style: 'thin', make: 'Chevrolet', model: 'TrailBlazer', yearsHint: '2002-2009',
    note: 'Only 7 documented issues, and NOTE THE CATALOG SPLIT: a separate "Chevrolet Trailblazer" row (lower-case b, 4 issues) covers the 2021+ crossover. THIS TARGET IS THE 2002-2009 GMT360 BODY-ON-FRAME SUV with the 4.2L Atlas inline-six - file findings under "TrailBlazer" for the old truck only, and say so in the title/years. Documented themes: the 4.2L Atlas with its camshaft actuator/position-sensor faults and the notorious oil consumption, the GMT360 BLOWER-MOTOR RESISTOR and HVAC actuator failures, the INSTRUMENT CLUSTER STEPPER-MOTOR failure (gauges reading wrong or dead - one of the most documented GM cluster problems, with a service bulletin), the fuel-level sender, the 4WD encoder motor and transfer case, the ignition-switch/key cylinder, and the rear air-suspension on the EXT/Envoy XL. SIBLINGS: GMC Envoy (6 issues), Buick Rainier, Isuzu Ascender, Saab 9-7X (2).',
    forums: 'trailvoy.com, gm-trucks.com, chevytalk.org, r/Chevy',
  },
  {
    style: 'thin', make: 'Lexus', model: 'ES', yearsHint: '1997-2026',
    note: 'Only 5 documented issues on the HIGHEST-VOLUME LEXUS SEDAN - the single most under-covered high-demand nameplate in this catalog. NOTE the legacy split rows "Lexus ES300" (1 issue) and "Lexus ES 350" if present; file everything under "Lexus ES" and make the generation explicit in the title. Generations: XV20 (1997-2001, 1MZ-FE), XV30 (2002-2006), XV40 (2007-2012, 2GR-FE), XV60 (2013-2018, plus the ES 300h hybrid), XZ10 (2019+). Documented themes: the 1MZ-FE/2GR-FE OIL-LINE (rubber VVT-i oil hose) FAILURE causing sudden oil loss - a genuine Toyota recall/campaign; the 1MZ-FE oil sludge issue and the resulting Toyota engine-sludge settlement; the 2GR-FE valve-cover and timing-cover leaks; the XV40 dashboard MELTING/STICKY DASH warranty extension; the Takata inflator campaigns; and the brake-actuator faults on the hybrid. Quarterly note: Lexus is thin overall (133 issues / 19 models).',
    forums: 'clublexus.com, lexusownersclub.com, toyotanation.com, r/Lexus',
  },
  {
    style: 'thin', make: 'Cadillac', model: 'CTS', yearsHint: '2003-2019',
    note: 'Only 6 documented issues across three generations (a separate "Cadillac CTS-V" row holds 3 - keep the V-series findings there unless the source covers the base car). Gen 1 (2003-2007, 3.2/3.6 and the Aisin/Tremec manual), gen 2 (2008-2014, 3.0/3.6 direct injection, plus the coupe and wagon), gen 3 (2014-2019, Alpha platform, 2.0T/3.6/3.6TT). Documented themes: THE LLT/LFX DIRECT-INJECTION TIMING CHAIN STRETCH on gen 2 - among the best-documented GM V6 failures, with bulletins and extended coverage; the high-pressure fuel pump and injector faults on DI engines; the gen-2 sunroof drains and water in the footwells; the CUE infotainment delaminating screen on gen 3 with its warranty extension; the 6L50/8L45 transmission; the HID/adaptive headlamps; and the electronic door handles on gen 3.',
    forums: 'cadillacforums.com, cadillacowners.com, ctsvowners.com, r/Cadillac',
  },
  {
    style: 'thin', make: 'Audi', model: 'S4', yearsHint: '2000-2025',
    note: 'Only 6 documented issues on a nameplate spanning four radically different engines - and getting them apart is the whole job. B5 (2000-2002) 2.7T BITURBO: the turbo failures, the notorious oil-line coking and the timing belt service; B6/B7 (2004-2008) 4.2 V8: the TIMING CHAIN GUIDE failure driven from the back of the engine (engine-out repair, an exceptionally well-documented story); B8 (2010-2016) 3.0 TFSI supercharged: the thermostat/water pump, the carbon buildup on the intake valves, and the supercharger coupler; B9 (2017+) turbo 3.0 TFSI. Also: the DSG/S-tronic mechatronic, the S4-specific brakes, and the recalls. Quarterly-priority make (Audi is 420 issues / 44 models but thin per model). SIBLING: Audi RS4 (2) and Audi A4/S5 are separate nameplates.',
    forums: 'audizine.com, audiworld.com, s4wiki.com, quattroworld.com, r/Audi',
  },
  {
    style: 'thin', make: 'BMW', model: 'M2', yearsHint: '2016-2026',
    note: 'Only 6 documented issues. Quarterly-priority make (BMW). Three distinct cars: F87 M2 (2016-2018, N55), F87 M2 Competition/CS (2019-2021, S55), G87 M2 (2023+, S58). Keep them apart - the engines have DIFFERENT failure records. N55: the charge pipe (a well-documented plastic-to-aluminium failure under boost), the oil filter housing gasket, the valve cover and the VANOS solenoids. S55: the crank hub / timing-drive concern on tuned cars (be careful and precise here - describe what is documented versus what is enthusiast lore, and say which is which), the fuel-pump and injector faults, and the oil consumption. S58: the coolant and the early-production recalls. Also platform-wide: the DCT vs manual, the electric water pump, and the plastic cooling components that BMW is known for.',
    forums: 'm2forum.com, bimmerpost.com, bimmerfest.com, f80post.com, r/BMW, r/BmwTech',
  },
  {
    style: 'thin', make: 'Porsche', model: 'Panamera', yearsHint: '2010-2025',
    note: 'Only 6 documented issues on Porsche\'s volume four-door across two generations - 970 (2010-2016) and 971 (2017-2024) - with an unusually wide engine range: 3.6 V6, 3.0 supercharged and later turbo V6, 4.8/4.0 V8 turbo, the diesel in some markets, and the E-Hybrid. Documented themes: the 970 AIR SUSPENSION compressor and strut failures, the PDK mechatronic and clutch-pack wear, the 4.8 V8 turbo coolant-pipe and the well-documented early-engine issues, water pump and thermostat failures, the PCM infotainment, the panoramic roof drains, and the E-Hybrid battery and charging faults including the 2020-2021 campaigns. Porsche is 118 issues / 9 models - genuinely thin for the brand\'s repair-cost profile, which is exactly what owners search for.',
    forums: 'rennlist.com, planet-9.com, 6speedonline.com, panamera-forum.com, r/Porsche',
  },
];

const onlyArg = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : null;
const suffix = process.argv.includes('--suffix') ? process.argv[process.argv.indexOf('--suffix') + 1] : '';
const SELECTED = onlyArg
  ? TARGETS.filter((t) => onlyArg.split(',').map((s) => s.trim()).includes(t.model))
  : TARGETS;
if (onlyArg && SELECTED.length !== onlyArg.split(',').length) {
  console.error(`--only matched ${SELECTED.length} of ${onlyArg.split(',').length} names; check spelling against the TARGETS list`);
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 4 });
pool.on('error', () => {});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

(async () => {
  const excl = [];
  for (const t of SELECTED) {
    const rows = await prisma.knownIssue.findMany({
      where: {
        make: t.make,
        model: t.model,
        vehicleType: t.style === 'moto' ? 'motorcycle' : 'car',
      },
      select: { title: true, years: true },
      orderBy: { title: 'asc' },
    });
    const yrs = [...new Set(rows.flatMap((r) => r.years))].sort((a, b) => a - b);
    excl.push({ make: t.make, model: t.model, existingTitles: rows.map((r) => r.title), yearsCovered: yrs });
    console.log(`  [${t.style.padEnd(6)}] ${(t.make + ' ' + t.model).padEnd(32)} ${String(rows.length).padStart(3)} existing titles`);
  }
  fs.writeFileSync(`data/research-wave14${suffix}-exclusions.json`, JSON.stringify(excl, null, 2));

  const body = fs.readFileSync('scripts/_wave11-body.js', 'utf8').replace(/\r/g, '');
  const out = body
    .replace('/*__TARGETS__*/', JSON.stringify(SELECTED, null, 2))
    .replace('/*__EXCLUSIONS__*/', JSON.stringify(excl, null, 2))
    .replace("name: 'research-wave11-four-bucket'", `name: 'research-wave14${suffix}-four-bucket'`)
    .replace(/Wave-11: 26 targets[^']*/, `Wave-14${suffix}: ${SELECTED.length} targets across heavy-duty/work trucks, high-volume used vehicles and thin luxury nameplates. Style-selected discover prompt + adversarial verify`)
    .replace(/log\(`Wave 11:/, 'log(`Wave 14:')
    .replace(/WAVE 11 TOTAL/, 'WAVE 14 TOTAL');
  const outPath = `scripts/_wf-research-wave14${suffix}.js`;
  fs.writeFileSync(outPath, out);
  console.log(`\nWrote ${outPath} (${out.length} bytes, ${SELECTED.length} targets)`);
  await prisma.$disconnect();
  await pool.end();
})().catch((e) => { console.error('FAIL:', e.message); pool.end(); process.exit(1); });
