#!/usr/bin/env node
/**
 * Generate RESEARCH WAVE 12 - the second four-bucket wave (EVs, newer, top sellers, thin, moto).
 *
 * Reuses wave 11's prompt body verbatim (`scripts/_wave11-body.js`) because the five-style approach
 * worked: 137/193 confirmed, zero fabricated NHTSA campaign numbers across 96 checked, zero pending
 * duplicates. Only the target list changes.
 *
 * WHAT IS DIFFERENT FROM WAVE 11:
 *
 * 1. FIVE NET-NEW MOTORCYCLE NAMEPLATES, not a re-run. Wave 11 proved the class works - Gold Wing
 *    returned 12/12 - but three of its four bike targets starved on the WebSearch cap. These five
 *    are chosen for the largest, longest-lived rider communities available: Street Glide (the
 *    best-selling touring bike in the US), MT-09, R1250GS, Rebel 500, Z900. Two are net-new MAKES
 *    for this catalog in practice (Kawasaki has zero rows; Yamaha has only MT-07).
 *
 * 2. THE THIN BUCKET GOES DEEPER. Wave 11's thin targets sat at 2-5 issues; these sit at 1-4, and
 *    Acura TSX at ONE is the thinnest nameplate we have attempted. The wave 11 result that matters
 *    here is TLX: 4 issues -> 16, a 12/12 confirm rate. Thin nameplates are not clean, they are
 *    unresearched, and the prompt says so in those words.
 *
 * 3. THE VOLUME BUCKET TARGETS GENUINELY BIG NAMEPLATES. Highlander, Forester, Escape and Malibu
 *    sit at 30-36 issues - respectable in isolation, thin for vehicles at their sales volume, and
 *    all four span four or more generations with distinct engine families.
 *
 * PREREQUISITE - CHECK THIS BEFORE RUNNING:
 *   `~/.claude/settings.json` must set env.CLAUDE_CODE_MAX_WEB_SEARCHES_PER_SESSION (25000).
 * With it unset the ceiling is 200/session, a wave this size blows through it partway, and the
 * targets that schedule LAST return a clean well-formed {"candidates":[]} with no error at all.
 * That is exactly how wave 11 lost seven targets. Verify the setting; do not assume it.
 */
require('dotenv').config({ path: '.env.local', quiet: true });
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const TARGETS = [
  // ---------------------------------------------------------------- EVs
  {
    style: 'ev', make: 'Kia', model: 'Niro EV', yearsHint: '2019-2026',
    note: 'NET-NEW NAMEPLATE - zero rows today, although the combined "Kia Niro" nameplate has its own. This catalog treats EV variants as separate nameplates, so do that here and keep hybrid/PHEV Niro findings out. DE 2019-2022 and SG2 2023+. Documented themes: the ICCU / on-board charger and 12V drain problems that run across Hyundai-Kia electrics, DC fast-charge derating and long-term charge-rate taper complaints, the 2021-22 recalls, reduction-gear and drive-motor faults, and heat-pump/cabin-heating shortfalls in cold weather. Confirm each campaign names the EV specifically rather than the hybrid.',
    forums: 'kia-forums.com, niroforum.org, kiaevforums.com, r/kia, r/electricvehicles',
  },
  {
    style: 'ev', make: 'Polestar', model: 'Polestar 2', yearsHint: '2021-2026',
    note: 'Only 6 documented issues on Polestar\'s volume car, five model years in. CMA platform, shared with the Volvo XC40 Recharge (7 issues, added 2026-08-26 - check those before returning anything, and do not copy across without confirming the nameplate). The defining chapters: the 2022 recall over inverter software causing sudden loss of propulsion, the high-voltage battery contactor/BECM faults, 12V drain that bricks the car, and the Google Built-In (Android Automotive) infotainment freezes and failed OTA updates. Also: single-motor vs dual-motor differences and the 2024 switch to rear-wheel drive.',
    forums: 'polestarforum.com, swedespeed.com, polestar2forum.com, r/Polestar, r/electricvehicles',
  },
  {
    style: 'ev', make: 'Audi', model: 'Q4 e-tron', yearsHint: '2022-2026',
    note: 'Only 7 documented issues. VW MEB platform - the SAME skateboard as the VW ID.4 (13 issues here) and ID. Buzz, so MEB-wide faults are plausible but must be confirmed per nameplate. Documented: the well-known MEB infotainment and software failures, 12V battery drain, the rear drive-unit/pulse inverter faults behind several stop-drive campaigns, DC fast-charge derating, and the heat-pump availability and cold-weather range complaints. Quarterly-priority make (Audi, 44 models but only 401 issues). Sportback and standard bodies share mechanicals.',
    forums: 'audiworld.com, q4etronforum.com, vwidtalk.com, r/Audi, r/electricvehicles',
  },
  {
    style: 'ev', make: 'Audi', model: 'e-tron', yearsHint: '2019-2023',
    note: 'Only 7 documented issues on Audi\'s first mass-market EV (later renamed Q8 e-tron - keep that rename in mind when searching, much owner discussion uses both names). The defining chapter is the 2019-2020 HIGH-VOLTAGE BATTERY MOISTURE INTRUSION recall: a wiring-harness sealing defect let moisture into the pack and could cause a fire, and it triggered a stop-delivery. Also: 12V and charging-module faults, the virtual side mirrors on equipped cars, MMI/infotainment failures, and thermal-management and charging-speed complaints. Quarterly-priority make.',
    forums: 'audiworld.com, etronforum.com, quattroworld.com, r/Audi, r/electricvehicles',
  },
  {
    style: 'ev', make: 'Rivian', model: 'R1T', yearsHint: '2022-2026',
    note: 'Only 8 documented issues, while the R1S sibling was just deepened to 10 - and the two share nearly everything, so confirm which nameplate a campaign names rather than assuming. Gen 1 (2022-2024) vs Gen 2 (2025+, an all-new zonal electrical architecture) are meaningfully different vehicles electrically. Documented: the 2022 steering-knuckle fastener recall, seatbelt and airbag campaigns, Gateway module and 12V faults, software/OTA failures that have bricked vehicles, drive-unit failures, heat-pump and HVAC issues, and the tonneau and gear-tunnel mechanisms.',
    forums: 'rivianforums.com, r1tr1s.com, rivianownersforum.com, r/Rivian, r/electricvehicles',
  },
  {
    style: 'ev', make: 'Lucid', model: 'Air', yearsHint: '2022-2026',
    note: 'Only 8 documented issues, and Lucid as a make has just 15 across 2 models. 900V architecture - genuinely different from almost everything else on the road, so do not reason by analogy to 400V cars. Documented: multiple recalls in the first three years (high-voltage coolant heater, retractable door handles, seatbelt anchorages, the software campaigns), 12V and low-voltage faults, DreamDrive ADAS complaints, infotainment and OTA failures, and build-quality/panel and water-intrusion issues from early Dream Edition and Grand Touring production.',
    forums: 'lucidowners.com, lucidforums.com, r/lucidmotors, r/electricvehicles',
  },

  // ------------------------------------------------------- NEWER VEHICLES
  {
    style: 'new', make: 'Buick', model: 'Envista', yearsHint: '2024-2026',
    note: 'NET-NEW NAMEPLATE - zero rows today. Launched 2024 as Buick\'s entry crossover, sharing its platform and its 1.2L turbo three-cylinder (LIH) with the Chevrolet Trax (11 issues, just deepened 2026-08-26) and Buick Encore GX. THE PLATFORM TWIN IS THE MAIN TRAP: a Trax defect is plausible here but must be confirmed against NHTSA naming the Envista. Themes to check: the 1.2T three-cylinder (turbo, timing chain, oil consumption, carbon), the 6-speed automatic, the 11-inch infotainment, and the launch-year recalls including any seat-belt or airbag campaigns.',
    forums: 'buickforums.com, chevytraxforum.com, gm-trucks.com, r/Buick',
  },
  {
    style: 'new', make: 'Honda', model: 'Prologue', yearsHint: '2024-2026',
    note: 'Only 4 documented issues. GM-BUILT ON ULTIUM, not a Honda platform - this is the key fact about the car, and it means GM-origin battery, BMS and electrical campaigns may apply while Honda-specific software and warranty handling differ. The Ultium siblings are the Chevrolet Blazer EV, Equinox EV, Silverado EV, GMC Hummer EV and Acura ZDX, several of which are already in this catalog. Confirm per-nameplate at NHTSA before attributing anything. Themes: charging faults, 12V drain, propulsion-power-loss campaigns, software/OTA, and the 2024-25 recalls.',
    forums: 'hondaprologueforum.com, driveaccord.net, r/HondaPrologue, r/electricvehicles',
  },
  {
    style: 'new', make: 'Jeep', model: 'Wagoneer', yearsHint: '2022-2026',
    note: 'Only 4 documented issues on a full-size flagship three model years in (the Grand Wagoneer is a SEPARATE nameplate here with 25 - keep them distinct, they differ in powertrain and trim). WS platform. Powertrain history matters: launch cars used the 5.7 Hemi with eTorque, and 2023+ moved to the 3.0 Hurricane twin-turbo inline-six. Themes: the Hemi lifter/camshaft failure that runs across Stellantis 5.7s, the Hurricane\'s own early record, the 8-speed, air suspension failures, Uconnect 5 faults, and a heavy early-build recall load including seat-belt and airbag campaigns.',
    forums: 'wagoneerforums.com, jeepgarage.org, moparts.org, r/Wagoneer, r/Jeep',
  },
  {
    style: 'new', make: 'Toyota', model: 'Crown', yearsHint: '2023-2026',
    note: 'Only 12 documented issues. Reintroduced to the US for 2023 on TNGA-K as a lifted sedan, with two very different powertrains: the 2.5 hybrid (HEV) and the Hybrid MAX 2.4 turbo (T24A-FTS). THE HYBRID MAX MATTERS - the 2024-25 recall over machining debris left in V35A and related turbo engines causing knock and engine failure swept the Tundra, Lexus LX and Grand Highlander, so verify precisely which engine and campaign apply to the Crown rather than assuming. Also: the Crown Signia is a separate 2025 nameplate. Themes: transmission/eCVT behaviour, 12.3-inch infotainment, and launch-year campaigns.',
    forums: 'toyotanation.com, toyotacrownforum.com, priuschat.com, r/Toyota',
  },
  {
    style: 'new', make: 'Mazda', model: 'CX-50', yearsHint: '2023-2026',
    note: 'Only 19 documented issues. Built in Alabama at the Mazda-Toyota joint plant on the transverse Skyactiv platform - a DIFFERENT vehicle from both the CX-5 (18 issues, just deepened) and the longitudinal CX-90, despite the naming. Powertrains: 2.5 naturally aspirated, 2.5 Turbo, and the 2025+ hybrid which uses TOYOTA hybrid hardware. Themes to check: cylinder deactivation on the 2.5, the turbo\'s own record, the 6-speed automatic, infotainment and CarPlay, early-build quality and water intrusion, and the launch-period recalls.',
    forums: 'cx50forum.com, mazdas247.com, mazdaforum.com, r/mazda',
  },

  // ------------------------------------------ TOP SELLERS, UNDER-DOCUMENTED
  {
    style: 'volume', make: 'Toyota', model: 'Highlander', yearsHint: '2001-2025',
    note: '36 issues across FOUR generations of a consistent US three-row best-seller - light for the volume. XU20 2001-2007 (1MZ-FE and 3MZ-FE V6, plus the first Highlander Hybrid), XU40 2008-2013 (2GR-FE - the RUBBER OIL SUPPLY HOSE recall and the VVT-i oil line failure), XU50 2014-2019 (2GR-FKS, the 8-speed), XU70 2020-2025 (2GR-FKS then the 2.4T T24A-FTS from 2023, plus the hybrid). Quarterly-priority make. Themes: the 2GR oil line, torque-converter shudder, dashboard melting in heat, water intrusion and rear liftgate faults. The Grand Highlander is a SEPARATE nameplate - keep them apart.',
    forums: 'toyotanation.com, highlanderclub.com, toyota-4runner.org, r/Toyota',
  },
  {
    style: 'volume', make: 'Subaru', model: 'Forester', yearsHint: '1998-2025',
    note: 'Only 34 issues (plus 2 pending) across FIVE generations of Subaru\'s best-seller. SF 1998-2002 and SG 2003-2008 (EJ25 - the head-gasket era, and the turbo XT), SH 2009-2013 (EJ25 and the notorious oil consumption), SJ 2014-2018 (FB25 - the excessive oil consumption class action, and the CVT), SK 2019-2025 (FB25 direct injection), 2025+ (plus hybrid). Quarterly-priority make. THE EJ HEAD-GASKET STORY AND THE FB OIL-CONSUMPTION STORY ARE DIFFERENT ENGINES - merging them is the classic error on this nameplate. Also: CVT torque-converter and valve-body failures, and rear wheel bearing wear.',
    forums: 'subaruforester.org, nasioc.com, subaruoutback.org, iclub.com, r/subaru',
  },
  {
    style: 'volume', make: 'Ford', model: 'Escape', yearsHint: '2001-2025',
    note: '33 issues across FOUR generations of one of Ford\'s highest-volume vehicles. 2001-2007 (the 2.0 Zetec and 3.0 Duratec, plus the first Escape Hybrid), 2008-2012, 2013-2019 (the 1.6 and 2.0 EcoBoost - the 1.6 EcoBoost COOLANT INTRUSION INTO THE CYLINDER and resulting fire recalls are the defining chapter, along with the 6F35 transmission), 2020-2025 (1.5 EcoBoost three-cylinder - which has its OWN coolant-intrusion history - plus the 2.0 and the hybrid/PHEV). Tag to the exact engine; the 1.6 story and the 1.5 story are separate defects on separate hardware. Also: the 2.5 hybrid and the PHEV battery recalls.',
    forums: 'fordescape.org, escape-city.com, ford-trucks.com, r/FordEscape, r/Ford',
  },
  {
    style: 'volume', make: 'Chevrolet', model: 'Malibu', yearsHint: '1997-2025',
    note: '30 issues across a nameplate sold continuously for nearly thirty years and discontinued after 2025. Key eras: 1997-2003, 2004-2007 (the ELECTRIC POWER STEERING failures that drew a major recall and NHTSA investigation), 2008-2012 (the 2.4 Ecotec LAF - heavy oil consumption, timing chain wear and the balance-shaft/chain issues), 2013-2015, 2016-2025 (1.5T LFV and 2.0T LTG with the CVT from 2016 on, plus the hybrid). Themes: the 2.4 Ecotec oil consumption and chain, EPS failure, the CVT, ignition/electrical faults, and A/C condenser failures. Tag to the exact engine.',
    forums: 'chevymalibuforum.com, chevroletforum.com, gm-trucks.com, r/Chevy',
  },

  // ------------------------------------------------------ THIN NAMEPLATES
  {
    style: 'thin', make: 'Acura', model: 'RDX', yearsHint: '2007-2025',
    note: 'Only 4 documented issues across THREE generations of Acura\'s best-selling vehicle. TB1/TB2 2007-2012: the K23A1 2.3 TURBO - genuinely unusual for Honda and with its own record (turbo and oil-feed issues, the 5-speed automatic), plus SH-AWD. TB3/TB4 2013-2018: the J35 3.5 V6 with cylinder deactivation (VCM) - the oil consumption and spark-plug fouling complaints that run across Honda V6s, and the 6-speed. TC1/TC2 2019-2025: the 2.0 turbo with a 10-speed automatic, plus the widely reported infotainment True Touchpad complaints. Three completely different powertrains - never merge them.',
    forums: 'acurazine.com, rdxforums.com, acura-forums.com, r/Acura',
  },
  {
    style: 'thin', make: 'Acura', model: 'TSX', yearsHint: '2004-2014',
    note: 'ONE documented issue - the thinnest nameplate attempted so far, on a car with a large and still-active enthusiast community. CL9 2004-2008: the K24A2 2.4 - and the widely documented excessive oil consumption, the VTC (variable timing control) actuator RATTLE ON COLD START which is the signature TSX complaint, plus the 5-speed automatic and the 6-speed manual. CU2 2009-2014: the K24Z3 2.4 and the J35Z6 3.5 V6 added for 2010, both with their own records. Also across generations: front lower control arm/compliance bushing wear, power steering pump whine and leaks, and A/C condenser failure. Read the low count as a coverage gap.',
    forums: 'acurazine.com, tsxclub.com, acura-forums.com, r/Acura',
  },
  {
    style: 'thin', make: 'Lexus', model: 'UX', yearsHint: '2019-2025',
    note: 'Only 3 documented issues on a nameplate seven model years old. Built on TNGA-C, closely related to the Toyota C-HR and Corolla. Two powertrains: UX 200 (2.0 M20A-FKS, with a CVT that uses a mechanical LAUNCH GEAR rather than a pure belt start - unusual and worth describing correctly) and UX 250h/300h hybrid. Themes to check: the hybrid battery and inverter, the Lexus Enform/infotainment and the pre-2022 touchpad, the 2.0 engine\'s direct-injection carbon and oil-consumption record, brake actuator faults, and the model\'s recall history. Quarterly note: Lexus is thin overall at 98 issues across 18 models.',
    forums: 'clublexus.com, lexusownersclub.com, toyotanation.com, r/Lexus',
  },
  {
    style: 'thin', make: 'Nissan', model: 'Quest', yearsHint: '1993-2017',
    note: 'Only 3 documented issues across FOUR generations of a minivan sold for over twenty years. V40 1993-1998 and V41 1999-2002 (co-developed with Ford as the Mercury Villager - shared mechanicals, so Villager findings may be genuinely relevant but confirm the nameplate). V42 2004-2009: the VQ35DE with the notorious problems of that era - the transmission, the dash-mounted instrument pod, sliding-door motor and track failures, and catalytic converter issues. V43 2011-2017: VQ35DE with the CVT, and the JATCO CVT failure record is the defining chapter of this generation. Quarterly-priority make.',
    forums: 'nissanforums.com, nissanquestforums.com, clubfrontier.org, r/Nissan',
  },
  {
    style: 'thin', make: 'Mitsubishi', model: 'Endeavor', yearsHint: '2004-2011',
    note: 'Only 2 documented issues. Built in Normal, Illinois on the Mitsubishi PS platform shared with the Galant and Eclipse - so findings on those (Galant has rows here) may be genuinely relevant, but confirm the nameplate. Single powertrain across its life: the 6G75 3.8 V6 with a 4-speed automatic. Themes to check: the automatic transmission and torque converter, front suspension and lower ball joint wear, power steering pump and rack leaks, the well-documented rear differential and AWD transfer issues on AWD cars, A/C evaporator and condenser failures, and rust on the rear subframe and suspension in salt states.',
    forums: 'mitsubishi-forums.com, endeavorforums.com, clubgalant.com, r/Mitsubishi',
  },

  // --------------------------------------------------------- MOTORCYCLES
  {
    style: 'moto', make: 'Harley-Davidson', model: 'Street Glide', yearsHint: '2006-2025',
    note: 'NET-NEW NAMEPLATE and the best-selling touring motorcycle in the US, with an enormous owner community. Engine eras matter enormously and must never be merged: Twin Cam 88/96 to 2016, Milwaukee-Eight 107/114 from 2017, and the Milwaukee-Eight 117 from 2024. Recurring documented themes: the TWIN CAM CAM-CHAIN TENSIONER shoe wear that sends debris through the engine (the signature failure of that era), excessive rear-cylinder head heat and the resulting rider complaints, Milwaukee-Eight lifter and cam-plate issues, stator and voltage-regulator failure, Boom! Box infotainment faults, and the 2018+ clutch and hydraulic-clutch recalls.',
    forums: 'hdforums.com, harley-davidsonforums.com, road-glide.org, fljrider.com, r/Harley',
  },
  {
    style: 'moto', make: 'Yamaha', model: 'MT-09', yearsHint: '2014-2025',
    note: 'NET-NEW NAMEPLATE (this catalog holds Yamaha MT-07 already - a DIFFERENT machine with a parallel twin, so never carry findings between them). The MT-09 uses the 847cc then 890cc CP3 crossplane triple; sold as the FZ-09 in the US for 2014-2016, which matters when searching. Recurring documented themes: the 2014-2016 abrupt throttle response and fuelling complaints that Yamaha revised, soft and underdamped stock suspension, the 2015-2016 recalls, cam chain tensioner noise, fuel pump and FI faults, regulator/rectifier and charging failures, and clutch and gearbox issues on hard-ridden examples.',
    forums: 'mt09.net, fz09.org, yamahamt09forum.com, r/MT09, r/motorcycles',
  },
  {
    style: 'moto', make: 'BMW', model: 'R1250GS', yearsHint: '2019-2023',
    note: 'NET-NEW NAMEPLATE, though this catalog already holds BMW R1200GS (5 pending rows) - the R1250GS is the SHIFTCAM successor and a genuinely different engine, so never carry findings between them. MAKE COLLISION: BMW also has 452 automotive issues here. The 1254cc boxer with ShiftCam variable valve timing. Recurring documented themes: the 2019-2020 final-drive and swingarm bearing complaints, fork-tube and Telelever issues, the well-publicised recalls (including fork slider tubes and the rear shock), TFT and connectivity faults, camshaft and ShiftCam concerns, and clutch and gearbox issues. Adventure (GSA) is a variant, not a separate nameplate.',
    forums: 'advrider.com, ukgser.com, bmwmotorcycletech.info, r/bmwmotorrad, r/motorcycles',
  },
  {
    style: 'moto', make: 'Honda', model: 'Rebel 500', yearsHint: '2017-2025',
    note: 'NET-NEW NAMEPLATE and one of the best-selling beginner motorcycles in the US, which means an unusually large population of low-mileage machines and a very active owner community. The 471cc parallel twin shared with the CB500 family. Recurring documented themes to check: the notably short rear suspension travel and the resulting harshness complaints, fuel pump and FI faults, regulator/rectifier and stator charging issues, the 2017-2018 recalls, clutch and gearbox behaviour, and the 2020 refresh changes. Also check NHTSA - Honda files motorcycle campaigns like any other manufacturer.',
    forums: 'hondarebelforum.com, rebel500forum.com, honda-forums.com, r/Rebel500, r/motorcycles',
  },
  {
    style: 'moto', make: 'Kawasaki', model: 'Z900', yearsHint: '2017-2025',
    note: 'NET-NEW NAMEPLATE and Kawasaki is effectively a NET-NEW MAKE for this catalog (zero rows). The 948cc inline-four, successor to the Z800, with the RS and SE variants. Recurring documented themes: the 2017-2018 recalls, regulator/rectifier and stator charging failures (the signature complaint across this engine family), fuel pump and FI faults, cam chain tensioner noise, clutch slave cylinder leaks, fork seal and rear shock wear, and the TFT dash and Bluetooth issues on 2020+ machines. Be careful with the Z900RS, a retro variant with its own chassis - confirm which machine a complaint belongs to.',
    forums: 'kawiforums.com, z900.org, zx-forums.com, r/kawasaki, r/motorcycles',
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
    console.log(`  [${t.style.padEnd(6)}] ${(t.make + ' ' + t.model).padEnd(30)} ${String(rows.length).padStart(3)} existing titles`);
  }
  fs.writeFileSync(`data/research-wave12${suffix}-exclusions.json`, JSON.stringify(excl, null, 2));

  const body = fs.readFileSync('scripts/_wave11-body.js', 'utf8').replace(/\r/g, '');
  const out = body
    .replace('/*__TARGETS__*/', JSON.stringify(SELECTED, null, 2))
    .replace('/*__EXCLUSIONS__*/', JSON.stringify(excl, null, 2))
    .replace("name: 'research-wave11-four-bucket'", `name: 'research-wave12${suffix}-four-bucket'`)
    .replace(/Wave-11: 26 targets[^']*/, `Wave-12${suffix}: ${SELECTED.length} targets across EVs, newer vehicles, top sellers, thin nameplates and motorcycles. Style-selected discover prompt + adversarial verify`)
    .replace(/log\(`Wave 11:/, 'log(`Wave 12:')
    .replace(/WAVE 11 TOTAL/, 'WAVE 12 TOTAL');
  const outPath = `scripts/_wf-research-wave12${suffix}.js`;
  fs.writeFileSync(outPath, out);
  console.log(`\nWrote ${outPath} (${out.length} bytes, ${SELECTED.length} targets)`);
  await prisma.$disconnect();
  await pool.end();
})().catch((e) => { console.error('FAIL:', e.message); pool.end(); process.exit(1); });
