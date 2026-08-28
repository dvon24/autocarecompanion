#!/usr/bin/env node
/**
 * Generate RESEARCH WAVE 11 - the four-bucket wave Devon asked for on 2026-08-26:
 * EVs, newer vehicles, top sellers AND thin nameplates, plus motorcycles, in one run.
 *
 * Previous waves each picked ONE thesis. This one carries four, so the prompt is chosen per target
 * by a `style` field rather than being fixed for the whole wave:
 *
 *   'ev'     official/recall-first, EV failure surface (HV battery, BMS, ICCU, 12V, OTA)
 *   'new'    official/recall-first, ICE - forums are thin on a 1-3 year old vehicle
 *   'volume' forum-first deepening - high-volume nameplates carrying too few issues
 *   'thin'   forum-first, nameplate has almost no coverage at all
 *   'moto'   motorcycle failure surface, vehicleType='motorcycle' on every row
 *
 * Mixing styles in one workflow is the point: a single verify pass, a single persist, a single
 * dupe check. The alternative - five sequential waves - is what hit the rate limiter before.
 *
 * FOUR TARGETS ARE NET-NEW NAMEPLATES (zero rows today): Chevrolet Bolt EUV, Volvo XC40 Recharge,
 * Lexus TX, Kawasaki Ninja 650.
 *
 * THREE MOTORCYCLE TARGETS ARE A RE-RUN. Sportster, Gold Wing and V-Strom 650 returned EMPTY in the
 * pilot. That was search starvation, not clean machines - the note in the session state is explicit
 * about it. They get the same prompts again.
 *
 * Written in node, not python: python's text-mode write turns \n into \r\n on Windows and the
 * Workflow tool rejects the result as control characters.
 */
require('dotenv').config({ path: '.env.local', quiet: true });
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const TARGETS = [
  // ---------------------------------------------------------------- EVs
  {
    style: 'ev', make: 'Chevrolet', model: 'Bolt EUV', yearsHint: '2022-2023',
    note: 'NET-NEW NAMEPLATE - zero rows in this catalog today, while the Bolt EV sibling has 7. The EUV is a separate, longer nameplate sold only for 2022-2023 and it sits squarely inside the LG Chem battery-cell recall (NHTSA 21V560 and the earlier 20V701/21V130 campaigns) that led GM to tell owners to park outdoors and limit charge to 90%. That recall is the defining chapter and the single most checkable fact about this car. Also documented: DC fast-charge derating, 12V accessory battery drain, Super Cruise faults on the Premier, heat-pump/resistive-heat complaints and infotainment reboots. Do NOT assume every Bolt EV campaign covers the EUV - confirm the nameplate appears in the campaign.',
    forums: 'chevybolt.org, boltev.forum, gm-volt.com, r/BoltEV, r/electricvehicles',
  },
  {
    style: 'ev', make: 'Chevrolet', model: 'Bolt EV', yearsHint: '2017-2023',
    note: 'Only 7 documented issues for a car at the centre of the largest EV battery recall in US history - a clear coverage gap, not a clean vehicle. 2017-2019 used LG cells with the anode tab tear and folded separator defects; the full remedy was module replacement under 20V701 / 21V130 / 21V560. Beyond the battery: 12V battery drain, the well-documented "Propulsion Power Reduced" / turtle-mode faults, charge-cord (occ) failures, heater and heat-pump complaints, and the 2019 restyle differences. The 2020 refresh changed the pack chemistry - keep the pre- and post-2020 stories distinct.',
    forums: 'chevybolt.org, gm-volt.com, boltev.forum, r/BoltEV, r/electricvehicles',
  },
  {
    style: 'ev', make: 'Volvo', model: 'XC40 Recharge', yearsHint: '2021-2025',
    note: 'NET-NEW NAMEPLATE - zero rows today, though the sibling C40 Recharge has 4 and the ICE XC40 has its own. This catalog lists Recharge variants as separate nameplates, so do that here. CMA platform BEV. Documented themes: the 2022-23 software recall over a blank driver display / instrument cluster failing to show the required telltales, sudden power loss campaigns, 12V auxiliary battery drain, DC fast-charge faults, and the widely reported Google-based infotainment freezes and OTA failures. Quarterly-priority make (Volvo, 4 of 26 models covered). Do not carry ICE XC40 issues here - the powertrain shares nothing.',
    forums: 'swedespeed.com, volvoforums.org.uk, xc40forum.com, r/Volvo, r/electricvehicles',
  },
  {
    style: 'ev', make: 'Genesis', model: 'GV60', yearsHint: '2023-2026',
    note: 'Only 3 documented issues. E-GMP platform, sibling to the Ioniq 5 and Kia EV6 - and the ICCU (Integrated Charging Control Unit) failure that strands E-GMP cars with a dead 12V is the defining story of the whole platform, with its own recalls and extended warranty. Confirm which campaigns actually name the GV60 rather than assuming Ioniq 5 coverage carries. Also: the fingerprint/face-recognition entry system, Crystal Sphere rotating shifter, boost-mode drive unit complaints, and 800V charging faults.',
    forums: 'genesisownersclub.com, ioniqforum.com, ev6forum.com, r/GenesisMotors, r/electricvehicles',
  },
  {
    style: 'ev', make: 'Nissan', model: 'Ariya', yearsHint: '2023-2026',
    note: 'Only 5 documented issues on a mainstream EV three model years in. Nissan CMF-EV platform (shared with the Renault Megane E-Tech, which is in this catalog with 1 row). Documented themes: the 2023-24 recall over loose/incorrectly-torqued front driveshaft bolts causing power loss, e-4ORCE drive-unit faults, DC fast-charge speed derating and CHAdeMO-to-CCS transition confusion, 12V battery drain, ProPILOT faults, and infotainment/OTA failures. Quarterly-priority make (Nissan, 5 of 27 models).',
    forums: 'ariyaforum.com, nissanariyaforum.com, mynissanleaf.com, r/Ariya, r/electricvehicles',
  },
  {
    style: 'ev', make: 'Ford', model: 'Mustang Mach-E', yearsHint: '2021-2026',
    note: 'Only 7 documented issues on a high-volume EV in its sixth model year. The defining chapter is the HV battery main contactor overheating recall (22V-903 and the 2024 follow-up 24V-XXX series) which caused loss of motive power - a genuinely checkable campaign. Also: the 2021-22 windshield and panoramic roof glass bonding recall, 12V battery drain, the "Stop Safely Now" message, BlueCruise faults, SYNC 4A freezes, and DC fast-charge derating on the 2021-22 pack before the OTA improvements. Extended-range vs standard-range packs (LG vs SK cells) differ - note which applies.',
    forums: 'macheforum.com, mustang6g.com, fordev.forum, r/MachE, r/electricvehicles',
  },

  // ------------------------------------------------------- NEWER VEHICLES
  {
    style: 'new', make: 'Lexus', model: 'TX', yearsHint: '2024-2026',
    note: 'NET-NEW NAMEPLATE - zero rows today. Lexus\' three-row crossover launched for 2024 on the TNGA-K platform, closely related to the Toyota Grand Highlander (also in this wave - keep them SEPARATE and do not copy findings across; confirm the nameplate in any campaign). Three powertrains with different failure surfaces: TX 350 (T24A-FTS 2.4T), TX 500h (hybrid 2.4T), TX 550h+ (PHEV V6). Early-build themes to check: 2024 recalls, the 2.4T turbo and its wastegate, hybrid battery and inverter faults, the 14-inch infotainment, and third-row seat/latch campaigns. Quarterly note: Lexus is thin at 98 issues across 18 models.',
    forums: 'clublexus.com, lexusownersclub.com, toyotanation.com, r/Lexus',
  },
  {
    style: 'new', make: 'Mazda', model: 'CX-90', yearsHint: '2024-2026',
    note: 'Only 9 documented issues on Mazda\'s new flagship. This is an all-new large-platform vehicle: longitudinal e-Skyactiv G 3.3 inline-six with a 48V mild hybrid, an 8-speed automatic that uses a WET MULTI-PLATE CLUTCH instead of a torque converter, plus a PHEV four-cylinder. The clutch-pack transmission is the source of the widely reported low-speed shudder, jerky take-up and hesitation complaints, and it is architecturally unlike anything else Mazda sells - do not describe it as a conventional automatic. Also: 48V/MHEV starter-generator faults, infotainment and CarPlay, and the launch-year recalls.',
    forums: 'cx90forum.com, mazdas247.com, mazdaforum.com, r/mazda, r/CX90',
  },
  {
    style: 'new', make: 'Hyundai', model: 'Santa Cruz', yearsHint: '2022-2026',
    note: 'Only 10 documented issues. Unibody pickup on the Tucson platform. TWO POWERTRAINS WITH VERY DIFFERENT RECORDS: the 2.5 naturally aspirated with an 8-speed conventional automatic, and the 2.5T with the 8-speed WET DUAL-CLUTCH - the DCT is the source of most drivability complaints (shudder, hesitation from a stop, overheating in traffic). Also: the tonneau cover and bed drainage, IVT-era Hyundai electrical themes, ABS/HECU fuse recalls that swept several Hyundai nameplates, and the 2023 facelift changes. Tag to the exact engine - a DCT complaint is not a 2.5 NA issue.',
    forums: 'santacruzforums.com, hyundai-forums.com, tucsonforums.com, r/SantaCruz, r/Hyundai',
  },
  {
    style: 'new', make: 'GMC', model: 'Canyon', yearsHint: '2023-2026',
    note: 'Only 10 documented issues, and the 2023 redesign was a clean break: the entire lineup moved to the 2.7L Turbo (L3B/L2R High-Output) with the 8L80 8-speed - no V6, no diesel. AT4X and AT4X AEV are new. Recurring themes to check: the 2.7T timing chain and active fuel management, turbo actuator faults, the 8-speed shudder/torque-converter history GM carries, infotainment and the 11.3-inch Google-built system, and the launch-year recalls. The Chevrolet Colorado (19 issues here) is the platform twin - a shared defect is plausible but confirm the Canyon is named.',
    forums: 'gm-trucks.com, coloradofans.com, canyonforum.com, r/GMC, r/ColoradoZR2',
  },
  {
    style: 'new', make: 'Toyota', model: 'Grand Highlander', yearsHint: '2024-2026',
    note: 'Only 11 documented issues. Launched 2024 on TNGA-K, a different and larger vehicle from the Highlander (36 issues here) - keep them SEPARATE and confirm the nameplate in any campaign. Three powertrains: 2.4T (T24A-FTS), Hybrid 2.5, and Hybrid MAX 2.4T. THE DEFINING EARLY STORY is the 2024-25 recall of Hybrid MAX / 2.4T units over machining debris left in the engine causing knock and engine failure (the same defect that swept the Tundra and Lexus LX with the V35A) - verify which engine and campaign actually apply here. Also: transmission hesitation, 12.3-inch infotainment, and third-row/seat-belt campaigns.',
    forums: 'grandhighlanderforum.com, toyotanation.com, highlanderclub.com, r/Toyota',
  },
  {
    style: 'new', make: 'Chevrolet', model: 'Trax', yearsHint: '2024-2026',
    note: 'Only 11 documented issues on what became one of Chevrolet\'s best-selling vehicles almost immediately. The 2024 redesign is a COMPLETELY different car from the 2015-2022 Trax: new platform, and a single 1.2L turbo three-cylinder (LIH) with a 6-speed automatic replacing the 1.4T. Do not carry old-Trax issues onto it - check which generation any complaint belongs to. Themes to check: the 1.2T three-cylinder (turbo, carbon, timing chain, oil consumption), the 6-speed, the 11-inch infotainment, and the launch-year recalls including any seat-belt or airbag campaigns.',
    forums: 'chevytraxforum.com, chevroletforum.com, gm-trucks.com, r/Chevy',
  },

  // ------------------------------------------ TOP SELLERS, UNDER-DOCUMENTED
  {
    style: 'volume', make: 'Mazda', model: 'CX-5', yearsHint: '2013-2025',
    note: 'Mazda\'s best-selling vehicle worldwide and it carries only 18 issues while comparable-volume nameplates in this catalog average 50+. KE 2013-2016 (Skyactiv-G 2.0/2.5, the well-documented infotainment/TCU 3G-sunset bricking and the daytime running lamp recall), KF 2017-2025 (2.5T, plus the 2.2 Skyactiv-D diesel briefly in the US and widely in the EU - DPF regeneration and oil dilution are the diesel story). Recurring: cylinder deactivation on the 2.5 from 2018, front strut and sway-bar noise, A/C compressor and condenser failures, windshield cracking, and the melting/peeling dashboard complaints.',
    forums: 'mazdas247.com, cx5forums.com, mazdaforum.com, club-cx5.com, r/mazda',
  },
  {
    style: 'volume', make: 'Hyundai', model: 'Tucson', yearsHint: '2005-2025',
    note: 'Only 19 issues across FOUR generations of a top-10 US crossover. JM 2005-2009, LM 2010-2015 (the 2.0/2.4 Theta II era - the rod-bearing and engine-fire recalls and the KSDS knock-sensor campaign apply to specific engines and build plants, so tag exactly), TL 2016-2021 (the 1.6T with the 7-speed DCT - shudder, hesitation and the separate 2.0 Nu), NX4 2022-2025 (2.5 NA, plus hybrid and PHEV with the 1.6T). Also across generations: the ABS/HECU module fires that triggered park-outside recalls, and IVT/CVT complaints. Quarterly-priority make. Do NOT merge a Theta II failure with a Nu or a 1.6T failure.',
    forums: 'hyundai-forums.com, tucsonforums.com, hyundaiforums.net, r/Hyundai',
  },
  {
    style: 'volume', make: 'Kia', model: 'Telluride', yearsHint: '2020-2025',
    note: 'Only 20 issues on Kia\'s halo three-row and a consistent segment best-seller. Single powertrain (3.8 Lambda II V6, 8-speed automatic) which makes engine-code tagging easy but means the issues cluster elsewhere. Documented: the 2023-24 park-outside recall over the tow-hitch harness fire risk (a large, checkable campaign), the seat-motor/power-seat fire recall, oil consumption and piston-ring complaints on the Lambda II, transmission harshness, wind noise and roof-rack water intrusion, and UVO/infotainment faults. The Hyundai Palisade is the platform twin (10 recent issues) - shared defects are plausible but confirm the nameplate.',
    forums: 'tellurideforums.com, kia-forums.com, palisadeforums.org, r/Telluride, r/kia',
  },
  {
    style: 'volume', make: 'Kia', model: 'Sportage', yearsHint: '2005-2025',
    note: 'Only 22 issues across four generations of a global high-volume crossover. KM 2005-2010, SL 2011-2016 (2.4 Theta II and the 2.0T - the rod-bearing/engine-fire and KSDS chapters), QL 2017-2022 (2.4 GDI and 1.6T with the 7DCT), NQ5 2023-2025 (2.5 NA, plus hybrid and PHEV). Also: the ABS/HECU fire recalls that swept the Kia/Hyundai range, sunroof shattering, and the 1.6T DCT judder. Tag to the exact engine - the Theta II story and the 1.6T story are different failures on different hardware, and merging them is the most common error on this nameplate.',
    forums: 'kia-forums.com, kiasportageforum.com, kiaforums.com, r/kia',
  },
  {
    style: 'volume', make: 'Volkswagen', model: 'Jetta', yearsHint: '1999-2025',
    note: 'Only 24 issues (plus 4 pending) across five generations of VW\'s highest-volume US nameplate. Mk4 1999-2005 (window regulators, coil packs, the ALH/BEW TDI), Mk5 2005-2010 (2.5 five-cylinder, the 2.0T FSI cam follower, and the BRM TDI), Mk6 2011-2018 (1.8T EA888 Gen3 water pump and PCV, the EA189 diesel at the centre of the emissions scandal), Mk7 2019-2025 (1.4T/1.5T EA211). Quarterly-priority make (VW, 3 of 22 models covered). GLI is a separate nameplate concern - keep genuinely Jetta-wide issues here. Tag to the exact engine code.',
    forums: 'vwvortex.com, tdiclub.com, jettaforums.com, vwforum.com, r/Volkswagen',
  },
  {
    style: 'volume', make: 'Hyundai', model: 'Elantra', yearsHint: '2001-2025',
    note: '29 issues across five generations of a perennial top-20 US seller - still light for the volume. XD 2001-2006, HD 2007-2010, MD 2011-2016 (the Nu 1.8 - oil consumption, plus the widely reported steering-column/MDPS clunk and the fuel-economy restatement), AD 2017-2020 (the 2.0 Nu and the 1.6T), CN7 2021-2025 (2.0 Smartstream, the N with the 2.0T, plus hybrid). Also: the ABS/HECU fire recalls, the piston-ring/engine-seizure campaigns on Nu and Gamma engines, and the well-publicised 2015-2021 theft vulnerability from the missing engine immobiliser. Quarterly-priority make.',
    forums: 'hyundai-forums.com, elantraxd.com, hyundaiforums.net, r/Hyundai, r/Elantra',
  },

  // ------------------------------------------------------ THIN NAMEPLATES
  {
    style: 'thin', make: 'Acura', model: 'TLX', yearsHint: '2015-2025',
    note: 'Only 3 documented issues on a nameplate that has been on sale for a decade. UB1/UB2 2015-2020: the K24 2.4 with the 8-SPEED DUAL-CLUTCH (DCT) - harsh engagement, hesitation and the torque-converter-equipped DCT\'s own faults - and the J35 3.5 V6 with the 9-speed ZF (the same 9AT widely reported for harsh shifting and rollaway across Acura/Honda). Precision All-Wheel Steer and SH-AWD are TLX-specific hardware. UB5 2021-2025: all-new, 2.0T and the Type S 3.0T V6 with a 10-speed. Keep the two generations and the two transmissions strictly separate.',
    forums: 'acurazine.com, acura-forums.com, tlxforums.com, r/Acura',
  },
  {
    style: 'thin', make: 'Mazda', model: 'CX-7', yearsHint: '2007-2012',
    note: 'Only 2 documented issues on a vehicle with a genuinely notorious record. The 2.3 DISI turbo (MZR DISI) is the story: TURBOCHARGER FAILURE from oil-feed pipe coking and carbon buildup, timing chain stretch and the chain guide/VVT actuator noise, and heavy oil consumption - all extensively documented and the subject of extended warranties in several markets. Also: the 2.5 naturally aspirated added for 2010, front lower control arm and ball joint wear, rear subframe and suspension corrosion in salt states, A/C compressor failure, and water pump leaks. This is a coverage gap, not a clean vehicle.',
    forums: 'mazdas247.com, cx7forums.com, mazdaforum.com, r/mazda',
  },
  {
    style: 'thin', make: 'Lexus', model: 'GS', yearsHint: '1998-2020',
    note: 'Only 4 issues (this catalog also holds GS300 with 2 - keep genuinely GS-wide findings here). S160 1998-2005 (2JZ-GE and the 3UZ V8 on the GS400/430), S190 2006-2011 (the 2GR-FSE - and the RUBBER OIL SUPPLY HOSE recall plus the VVT-i oil line failure that swept the 2GR family, along with the GS450h hybrid), L10 2013-2020 (2GR-FKS, the GS F with the 2UR-GSE 5.0 V8). Recurring: dashboard melting/stickiness in heat (a well-documented Toyota/Lexus complaint of this era), air suspension on equipped cars, and infotainment/navigation faults. Quarterly note: Lexus is thin overall.',
    forums: 'clublexus.com, lexusownersclub.com, gs300.com, toyotanation.com, r/Lexus',
  },
  {
    style: 'thin', make: 'Nissan', model: '350Z', yearsHint: '2003-2009',
    note: 'Only 4 issues on a car with one of the largest enthusiast communities of its generation. Z33 with the VQ35DE (2003-2006, the DE and the revised REV-UP HR-precursor) and the VQ35HR from 2007 - and these are DIFFERENT engines with different failure records, which is the main tagging trap. Documented: heavy oil consumption on the early DE, the well-known tyre feathering/rear-tyre wear from suspension geometry, clutch and CSC (concentric slave cylinder) failures on the 6-speed, catalytic converter failure sending debris back into the engine, window motor/regulator failure, and rear differential and driveshaft bushing wear.',
    forums: 'my350z.com, 350z-tech.com, nico club (nicoclub.com), the350z.com, r/350z',
  },

  // --------------------------------------------------------- MOTORCYCLES
  {
    style: 'moto', make: 'Harley-Davidson', model: 'Sportster', yearsHint: '2004-2022',
    note: 'RE-RUN: this nameplate\'s discover agent returned EMPTY in the pilot from search starvation, not because the machine is clean. Evolution 883/1200 air-cooled V-twin, rubber-mounted frame from 2004. Long-documented themes: cam chain tensioner and cam bearing wear, primary chain adjuster, stator and voltage regulator failure, oil weep from the cam cover, and the 2014+ ABS/ECU electrical faults. The 2021+ Sportster S is a COMPLETELY different bike (liquid-cooled Revolution Max 1250T) - do NOT carry Evolution issues onto it.',
    forums: 'xlforum.net, hdforums.com, thesportsterandbuellmotorcycleforum.com, r/Harley',
  },
  {
    style: 'moto', make: 'Honda', model: 'Gold Wing', yearsHint: '2001-2025',
    note: 'RE-RUN: returned EMPTY in the pilot from search starvation, not from being clean. GL1800 flat-six. Two eras: 2001-2017 (the long-running chassis, subject of a major NHTSA recall for the secondary fuel-pump/fuel-feed hose and a separate steering-stem bearing issue) and 2018+ (all-new chassis, 7-speed DCT option). Recurring: final drive splines and dry spline wear, rear brake caliper corrosion, alternator/stator failure, and airbag/electrical complaints. Distinguish the two generations - they share almost nothing structurally.',
    forums: 'goldwingfacts.com, gl1800riders.com, wingstuff forums, r/goldwing',
  },
  {
    style: 'moto', make: 'Suzuki', model: 'V-Strom 650', yearsHint: '2004-2025',
    note: 'RE-RUN: returned EMPTY in the pilot from search starvation. MAKE COLLISION - this catalog also holds Suzuki Vitara, Swift, Jimny, SX4 (cars). DL650 with the SV650-derived 645cc 90-degree V-twin. Recurring: regulator/rectifier and stator failure (the signature electrical complaint), fuel pump and FI issues, second-gear and clutch basket wear, cam chain tensioner, and rear shock linkage bearing seizure from lack of grease. 2012+ got a revised engine and 2017+ another revision - note which applies.',
    forums: 'stromtrooper.com, vstrom.info, wee-strom forums, r/Vstrom, r/SuzukiMotorcycles',
  },
  {
    style: 'moto', make: 'Kawasaki', model: 'Ninja 650', yearsHint: '2006-2025',
    note: 'NET-NEW NAMEPLATE and a NET-NEW MAKE for this catalog - Kawasaki has zero rows today. ER-6f/Ninja 650R 2006-2011, 2012-2016, and the 2017+ redesign onto the trellis-frame platform shared with the Z650 and Versys 650, all using the 649cc parallel twin. Recurring documented themes: regulator/rectifier and stator charging failures (the signature complaint on this engine family), fuel pump and FI faults, cam chain tensioner noise, clutch slave cylinder leaks, fork seal and rear shock wear, and the 2020+ TFT/Bluetooth dash issues. Also check NHTSA recalls - Kawasaki files them like any other manufacturer.',
    forums: 'ninja650.net, kawiforums.com, ninjette.org, exriders.com, r/Kawasaki, r/motorcycles',
  },
];

// --only "Model,Model,..." regenerates a SUBSET as a follow-up wave, writing to a suffixed file.
//
// This exists because of how wave 11 failed. The WebSearch cap (200/session by default, and the
// variable was unset) ran out partway through the run, so the seven targets whose discover agents
// happened to schedule LAST got zero searches and returned a clean, well-formed {"candidates":[]}.
// The workflow reported no error. Those seven must be re-run in a session with the cap raised - and
// NOT via resumeFromRunId, which would replay the cached empty results instantly.
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
      select: { title: true, years: true, status: true },
      orderBy: { title: 'asc' },
    });
    const yrs = [...new Set(rows.flatMap((r) => r.years))].sort((a, b) => a - b);
    excl.push({ make: t.make, model: t.model, existingTitles: rows.map((r) => r.title), yearsCovered: yrs });
    console.log(`  [${t.style.padEnd(6)}] ${(t.make + ' ' + t.model).padEnd(30)} ${String(rows.length).padStart(3)} existing titles`);
  }
  fs.writeFileSync(`data/research-wave11${suffix}-exclusions.json`, JSON.stringify(excl, null, 2));

  const body = fs.readFileSync('scripts/_wave11-body.js', 'utf8').replace(/\r/g, '');
  const out = body
    .replace('/*__TARGETS__*/', JSON.stringify(SELECTED, null, 2))
    .replace('/*__EXCLUSIONS__*/', JSON.stringify(excl, null, 2))
    .replace("name: 'research-wave11-four-bucket'", `name: 'research-wave11${suffix}-four-bucket'`);
  const outPath = `scripts/_wf-research-wave11${suffix}.js`;
  fs.writeFileSync(outPath, out);
  console.log(`\nWrote ${outPath} (${out.length} bytes, ${SELECTED.length} targets)`);
  await prisma.$disconnect();
  await pool.end();
})().catch((e) => { console.error('FAIL:', e.message); pool.end(); process.exit(1); });
