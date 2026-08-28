#!/usr/bin/env node
/**
 * Generate RESEARCH WAVE 13 - third four-bucket wave (EVs, newer, top sellers, thin, moto).
 *
 * Reuses wave 11's prompt body verbatim (`scripts/_wave11-body.js`). Waves 11/11b/12 confirmed
 * 487 of 565 candidates (86%) with one fabricated recall across 262 campaign references, so the
 * five-style approach is not being changed - only the targets.
 *
 * WHAT THIS WAVE GOES AFTER:
 *
 * 1. THE EV BUCKET FINALLY HITS THE ULTIUM CLUSTER. Blazer EV and both Hummer EV body styles sit
 *    at 4 issues each despite being the most recall-active vehicles GM sells. Wave 10's notes
 *    warned that six nameplates share that skateboard; the prompt carries that warning and the
 *    verifier gates on it. Genesis Electrified GV70 is NET-NEW and completes the E-GMP/ICCU story
 *    alongside the GV60 and Ioniq 5 rows added in wave 11.
 *
 * 2. THE THIN BUCKET GOES AFTER ENTHUSIAST CARS. Acura RSX at 2 and Genesis Coupe at 4 have
 *    disproportionately large, still-active owner communities relative to their sales - the same
 *    profile as the 350Z, which returned 13/13 in wave 11b from a base of 5.
 *
 * 3. FIVE MORE NET-NEW MOTORCYCLE NAMEPLATES, adding KTM and Ducati as net-new MAKES. The class
 *    has now produced 112 issues across 12 nameplates with a 91% confirm rate. Note that none of
 *    it is published yet - the ~30 make-only read paths are still the blocker, not the research.
 *
 * PREREQUISITE - CHECK, DO NOT ASSUME:
 *   `~/.claude/settings.json` must set env.CLAUDE_CODE_MAX_WEB_SEARCHES_PER_SESSION (25000).
 * Unset means a 200/session ceiling, and the targets scheduled LAST come back with a clean
 * {"candidates":[]} and no error at all. That is how wave 11 lost seven targets.
 */
require('dotenv').config({ path: '.env.local', quiet: true });
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const TARGETS = [
  // ---------------------------------------------------------------- EVs
  {
    style: 'ev', make: 'Genesis', model: 'Electrified GV70', yearsHint: '2023-2026',
    note: 'NET-NEW NAMEPLATE - zero rows today. This catalog holds the petrol Genesis GV70 (18 issues) as a SEPARATE nameplate, so keep them apart: the Electrified shares a body but nothing of the powertrain. E-GMP-derived 800V architecture built on the petrol platform rather than pure E-GMP, which is unusual and worth stating correctly. THE ICCU (Integrated Charging Control Unit) FAILURE is the defining Hyundai-Kia-Genesis electric story - it kills the 12V and strands the car, and it carries its own recalls and warranty extensions across the GV60, Ioniq 5 and EV6. Confirm which campaigns name the Electrified GV70 specifically. Also: DC fast-charge derating, boost mode, and infotainment/OTA faults.',
    forums: 'genesisownersclub.com, gv70forum.com, ioniqforum.com, r/GenesisMotors, r/electricvehicles',
  },
  {
    style: 'ev', make: 'Chevrolet', model: 'Blazer EV', yearsHint: '2024-2026',
    note: 'Only 4 documented issues on one of the most recall-active vehicles GM sells. GM Ultium (BEV3). The defining chapter is the December 2023 SOFTWARE STOP-SALE that halted deliveries fleet-wide after widespread infotainment and charging failures on early cars - an unusually well-documented event - followed by a string of campaigns. Also: DC fast-charging faults, 12V auxiliary battery, rear drive-unit and propulsion-power-loss campaigns, and the 2024 price/trim restructure. ULTIUM SIBLINGS in this catalog: Equinox EV, Silverado EV, Hummer EV, Honda Prologue, Acura ZDX. A sibling recall is NOT automatically this vehicle\'s - confirm NHTSA names the Blazer EV.',
    forums: 'blazerevforum.com, gm-trucks.com, chevroletforum.com, r/ChevyBlazerEV, r/electricvehicles',
  },
  {
    style: 'ev', make: 'GMC', model: 'Hummer EV', yearsHint: '2022-2026',
    note: 'Only 4 documented issues on a vehicle with an unusually heavy recall record. Ultium pickup body style - this catalog lists "Hummer EV SUV" as a SEPARATE nameplate, so keep findings to the pickup unless a campaign covers both. Documented themes: the 2023-24 battery-module and pack campaigns, the recall over a water-pump/battery-sealing defect, extreme curb weight (over 9,000 lb) driving brake and tire complaints that are genuinely specific to this vehicle, CrabWalk and four-wheel-steer faults, Super Cruise, and software/OTA failures. Early 2022 Edition 1 builds differ substantially from later production.',
    forums: 'gmhummerevforum.com, gm-trucks.com, hummerchat.com, r/HummerEV, r/electricvehicles',
  },
  {
    style: 'ev', make: 'Hyundai', model: 'Ioniq 6', yearsHint: '2023-2026',
    note: 'Only 9 documented issues. E-GMP, sibling to the Ioniq 5 (14 issues here) and Kia EV6 (21) - and THE ICCU FAILURE is the defining platform story, stranding cars with a dead 12V and carrying recalls plus a warranty extension. Confirm which campaigns name the Ioniq 6 rather than assuming Ioniq 5 coverage carries across. Also: the 2023-24 charging-port and DC fast-charge faults, the rear-view camera and FMVSS 111 campaigns that swept Hyundai, heat-pump and cold-weather range, and the digital side mirrors on equipped markets. Quarterly-priority make (Hyundai).',
    forums: 'ioniqforum.com, ioniq6forum.com, hyundai-forums.com, r/Ioniq6, r/electricvehicles',
  },
  {
    style: 'ev', make: 'Cadillac', model: 'Lyriq', yearsHint: '2023-2026',
    note: 'Only 10 documented issues on Cadillac\'s volume EV, four model years in. GM Ultium, and one of the earliest Ultium vehicles to reach customers - which means it carries early-production faults the later siblings do not. Documented themes: the 2023-24 recalls (including the rear-view camera/display software and the battery-module campaigns), 12V drain, DC fast-charge faults, the 33-inch LED display and its software failures, Super Cruise, and heat-pump/HVAC issues. ULTIUM SIBLINGS: Blazer EV, Equinox EV, Silverado EV, Hummer EV, Prologue, ZDX - confirm nameplate before attributing.',
    forums: 'cadillaclyriqforum.com, cadillacforums.com, gm-trucks.com, r/Cadillac, r/electricvehicles',
  },
  {
    style: 'ev', make: 'Kia', model: 'EV9', yearsHint: '2024-2026',
    note: 'Only 10 documented issues on Kia\'s three-row flagship EV. E-GMP 800V, sibling to the Ioniq 5/6, EV6 and GV60. THE ICCU FAILURE applies to this platform and the EV9 has its own campaigns - verify rather than inherit. Also documented: the 2024 recalls over the front trim/emblem and the seat-belt pretensioners, DC fast-charge behaviour, 12V drain, the ADAS and Highway Driving Assist faults, third-row seat and latch issues, and software/OTA failures. Being the newest and largest E-GMP vehicle, thermal management under load and towing is a distinct area worth checking.',
    forums: 'kiaev9forum.com, kia-forums.com, ev6forum.com, r/KiaEV9, r/electricvehicles',
  },

  // ------------------------------------------------------- NEWER VEHICLES
  {
    style: 'new', make: 'Lexus', model: 'NX', yearsHint: '2015-2025',
    note: 'Only 9 documented issues across TWO generations of a high-volume Lexus. AZ10 2015-2021 (NX 200t/300 with the 8AR-FTS 2.0 turbo - a rare turbo for Lexus with its own carbon and wastegate record - plus the NX 300h hybrid). AZ20 2022-2025: all-new on TNGA-K, with the NX 250, NX 350 (T24A-FTS 2.4 turbo), NX 350h and the NX 450h+ PHEV, plus the new Lexus Interface infotainment. THE 2022-23 RECALLS matter here, including the PHEV battery and charging campaigns. Quarterly note: Lexus is thin overall. Keep the two generations and the four powertrains strictly apart.',
    forums: 'clublexus.com, lexusownersclub.com, nxforum.com, toyotanation.com, r/Lexus',
  },
  {
    style: 'new', make: 'Mazda', model: 'CX-30', yearsHint: '2020-2026',
    note: 'Only 9 documented issues six model years in. Built on the Mazda3 platform (Mazda3 has rows here - related but a different vehicle, confirm the nameplate). Powertrains: 2.5 naturally aspirated, the 2.5 Turbo from 2021, and the SkyActiv-X in some markets. Documented themes: the widely reported i-Activsense/Smart Brake Support phantom braking (Mazda issued Service Alerts rather than a recall - describe that accurately, an SA is not a campaign), infotainment and CarPlay disconnects, the A/C condenser, windshield stress cracking, cylinder deactivation on the 2.5, and the 2020-21 recalls.',
    forums: 'cx30forum.com, mazdas247.com, mazda3forums.com, r/mazda',
  },
  {
    style: 'new', make: 'Toyota', model: 'Corolla Cross', yearsHint: '2022-2026',
    note: 'Only 16 documented issues (plus 7 pending) on a fast-growing nameplate. TNGA-C, related to the Corolla but a distinct vehicle - confirm the nameplate on any campaign rather than inheriting Corolla findings. Two powertrains: the 2.0 M20A-FKS with a CVT, and the Corolla Cross Hybrid from 2023 with the 2.0 hybrid system and e-AWD. Documented themes: the 2022-23 recalls including the airbag/seat-belt campaigns, the CVT behaviour, infotainment, and the hybrid battery and inverter. Quarterly-priority make (Toyota, 39 models).',
    forums: 'toyotanation.com, corollacrossforum.com, corollaforum.com, r/Toyota',
  },
  {
    style: 'new', make: 'Subaru', model: 'Ascent', yearsHint: '2019-2026',
    note: 'Only 16 documented issues (plus 1 pending) on Subaru\'s three-row flagship. Single powertrain: the FA24F 2.4 turbo boxer with a CVT (TR690/Lineartronic). THE DEFINING EARLY CHAPTER is the 2019 recall over improperly welded/omitted fuel pump and fuel tank components, followed by the widely reported 2019-2020 fuel pump failures (Denso pump impeller) and the transmission/CVT complaints. Also: oil consumption on the FA24, the panoramic moonroof, and the Starlink infotainment failures that drew a class action. Quarterly-priority make (Subaru, 14 models).',
    forums: 'subaruascentforum.com, subaruoutback.org, nasioc.com, r/Subaru_Ascent, r/subaru',
  },
  {
    style: 'new', make: 'Honda', model: 'HR-V', yearsHint: '2016-2026',
    note: 'Only 17 documented issues across TWO very different generations. 2016-2022: built on the Fit platform with the L15 1.8 and a CVT, small and light. 2023-2026: all-new, built on the Civic platform with the 2.0 K20 naturally aspirated and a CVT - a substantially larger and heavier vehicle that shares almost nothing with the first generation. Do not carry findings across. Documented themes: CVT behaviour and judder, the 2023-24 recalls, A/C condenser failures (a recurring Honda complaint of this era), infotainment, and the Honda Sensing false-activation complaints.',
    forums: 'hrvforums.com, hondahrvforum.com, drivehonda.net, r/Honda, r/HRV',
  },

  // ------------------------------------------ TOP SELLERS, UNDER-DOCUMENTED
  {
    style: 'volume', make: 'Toyota', model: 'Sienna', yearsHint: '1998-2025',
    note: 'Only 19 issues across FOUR generations of the best-selling non-Chrysler minivan. XL10 1998-2003 (1MZ-FE), XL20 2004-2010 (3MZ-FE then 2GR-FE - and the RUBBER OIL SUPPLY HOSE recall plus the VVT-i oil line failure), XL30 2011-2020 (2GR-FE/FKS, the only AWD minivan for much of its life), XL40 2021-2025 (hybrid ONLY, the 2.5 A25A-FXS - a complete powertrain break). Quarterly-priority make. Themes: the 2GR oil line, sliding-door motor and cable failures (the signature minivan complaint), the 2010 accelerator-pedal and floor-mat recalls, rear liftgate struts, and the hybrid battery on XL40.',
    forums: 'siennachat.com, toyotanation.com, priuschat.com, r/Toyota',
  },
  {
    style: 'volume', make: 'Chevrolet', model: 'Colorado', yearsHint: '2004-2026',
    note: 'Only 19 issues across THREE generations of GM\'s mid-size truck. GMT355 2004-2012 (the Atlas inline-4/5 and the 5.3 V8 - the inline-five is unusual and has its own record), 2015-2022 (2.5 LCV, 3.6 LGZ, and the 2.8 Duramax diesel - a genuinely distinct powertrain with DEF and emissions issues), 2023-2026 (2.7 Turbo only, with the 8L80). Themes: the 3.6 timing chain and the 8-speed shudder that runs across GM, the 2.8 diesel emissions and DEF faults, front differential actuator failures, and the launch-year recalls on the 2023 redesign. The GMC Canyon (deepened 2026-08-26) is the platform twin - confirm the nameplate.',
    forums: 'coloradofans.com, gm-trucks.com, chevroletforum.com, r/ColoradoZR2, r/Chevy',
  },
  {
    style: 'volume', make: 'Kia', model: 'Forte', yearsHint: '2010-2025',
    note: 'Only 19 issues across THREE generations of Kia\'s highest-volume compact. TD 2010-2013, YD 2014-2018 (the 1.8/2.0 Nu and the 1.6 turbo), BD 2019-2025 (2.0 Nu with the IVT continuously variable transmission, plus the GT with the 1.6T and a 7-speed DCT). Themes to tag by engine: the Nu-family piston-ring and engine-seizure campaigns and the KSDS knock-sensor software, the IVT judder and failure complaints, the ABS/HECU fire recalls that swept Kia and Hyundai, and THE 2015-2021 THEFT VULNERABILITY from the missing engine immobiliser, which is a genuine documented defect with an insurance and software-fix dimension.',
    forums: 'kia-forums.com, kiaforteforum.com, forteforums.com, r/kia',
  },
  {
    style: 'volume', make: 'Hyundai', model: 'Sonata', yearsHint: '2001-2025',
    note: 'Only 21 issues across FIVE generations of Hyundai\'s flagship sedan - very light for the volume, and this nameplate sits at the CENTRE of the Theta II story. EF 2001-2005, NF 2006-2010, YF 2011-2014 and LF 2015-2019 (2.0/2.4 THETA II GDI - the rod-bearing failures, engine fires, the multi-million-vehicle recalls, the KSDS knock-sensor campaign and the class-action settlement; plus the 2.0T and the hybrid), DN8 2020-2025 (2.5 Smartstream, 1.6T, hybrid, and the N Line). Also: the ABS/HECU fire recalls and the theft vulnerability. Quarterly-priority make. TAG TO THE EXACT ENGINE - Theta II is not Smartstream.',
    forums: 'hyundai-forums.com, sonataforums.com, hyundaiforums.net, r/Hyundai',
  },
  {
    style: 'volume', make: 'Chevrolet', model: 'Traverse', yearsHint: '2009-2026',
    note: 'Only 22 issues (plus 2 pending) across THREE generations of GM\'s big three-row crossover. 2009-2017 (Lambda platform with the 3.6 LLT/LFX - and the TIMING CHAIN STRETCH and the notorious high-pressure fuel pump and cam-actuator issues of that V6, plus the wave of power-steering and transmission complaints), 2018-2023 (C1XX with the 3.6 LFY and the 9-speed 9T65), 2024-2026 (the 2.5 turbo LK0 - a complete break from the V6). Themes: the 3.6 timing chain, the 6T70/9T65 transmissions, A/C condenser and evaporator failures, and the liftgate and seat campaigns. Do not carry V6 findings onto the 2024+ 2.5T.',
    forums: 'traverseforum.com, gm-trucks.com, chevroletforum.com, r/Chevy',
  },

  // ------------------------------------------------------ THIN NAMEPLATES
  {
    style: 'thin', make: 'Acura', model: 'RSX', yearsHint: '2002-2006',
    note: 'Only 2 documented issues on a car with one of the largest and still-active enthusiast communities of its generation - the same profile as the Nissan 350Z, which returned 13 of 13 from a base of 5. DC5 chassis. TWO DISTINCT ENGINES that must never be merged: the K20A3 in the base RSX (SOHC-ish economy tune) and the K20A2/K20Z1 in the Type-S (higher compression, 6-speed). Documented themes: the widely reported 5th/6th gear grind and transmission synchro failure on the Type-S 6-speed, VTC actuator cold-start rattle, motor mount failure, A/C compressor and condenser, power steering pump whine, and rear trailing arm and rust issues.',
    forums: 'club-rsx.com, acurazine.com, honda-tech.com, k20a.org, r/Acura, r/RSX',
  },
  {
    style: 'thin', make: 'Acura', model: 'ILX', yearsHint: '2013-2022',
    note: 'Only 2 documented issues on a nameplate sold for a decade. Built on the Civic platform. THREE powertrain configurations across its life, and merging them is the main trap: the 2.0 with a 5-speed automatic, the 2.4 K24 with a 6-speed MANUAL only (2013-2015, an unusual combination), the 1.5 hybrid (2013-2014, using the Civic Hybrid IMA system), and from 2016 the 2.4 K24 with the 8-SPEED DUAL-CLUTCH (DCT) with torque converter - the DCT drivability complaints are the defining chapter. Also: Takata airbag inflator recalls, A/C condenser failure, and infotainment/ELS audio faults.',
    forums: 'acurazine.com, ilxforums.com, acura-forums.com, r/Acura',
  },
  {
    style: 'thin', make: 'Hyundai', model: 'Genesis Coupe', yearsHint: '2010-2016',
    note: 'Only 4 documented issues on a car with a large enthusiast and tuning community. BK chassis. TWO ENGINES, and they have completely different records: the 2.0T Theta II turbo (2010-2014, then the 2.0T with revisions) and the 3.8 Lambda V6. The 2013 facelift changed both engines substantially - the 2.0T went to the revised turbo and the 3.8 gained GDI - so a pre- and post-2013 distinction matters as much as the engine choice. Documented themes: the Theta II turbo oil-feed and bearing issues, the well-reported clutch and flywheel failures on the 6-speed manual, rear differential and axle problems under power, sunroof and water leaks, and the ZF/Hyundai automatic.',
    forums: 'genesiscoupe.com, hyundai-forums.com, genesisownersclub.com, r/GenesisCoupe, r/Hyundai',
  },
  {
    style: 'thin', make: 'Mazda', model: 'CX-3', yearsHint: '2016-2021',
    note: 'Only 4 documented issues. Built on the Mazda2/Demio platform with the 2.0 Skyactiv-G and a 6-speed automatic (a 1.5 diesel in some markets). Small, and sold in modest numbers in the US, but with a long European and Australian life that produces most of the owner reporting - search accordingly. Documented themes: the 2016-2018 recalls, the widely reported rear brake caliper and parking-brake corrosion, A/C condenser and compressor failures, infotainment and the MZD Connect freezing/reboot complaints, cylinder deactivation on later cars, and windshield stress cracking (a recurring complaint across Mazda of this era).',
    forums: 'cx3forum.com, mazdas247.com, mazdaforum.com, r/mazda',
  },
  {
    style: 'thin', make: 'Jeep', model: 'Commander', yearsHint: '2006-2010',
    note: 'Only 4 documented issues. XK chassis, built alongside the WK Grand Cherokee and sharing most of its mechanicals - Grand Cherokee findings may be genuinely relevant but confirm the nameplate, because the Commander has its own body, roof structure and third row. THREE ENGINES: the 3.7 PowerTech V6, the 4.7 PowerTech V8 and the 5.7 Hemi. Documented themes: the 4.7 V8 valve-seat and misfire problems, the 3.7 timing chain and rocker failures, the notorious water leaks around the sunroofs and the roof rails into the headliner, the electronic throttle and TIPM electrical faults, and front differential and axle issues on 4WD.',
    forums: 'jeepcommander.com, jeepforum.com, jeepgarage.org, wkjeeps.com, r/Jeep',
  },

  // --------------------------------------------------------- MOTORCYCLES
  {
    style: 'moto', make: 'Harley-Davidson', model: 'Road King', yearsHint: '2000-2025',
    note: 'NET-NEW NAMEPLATE. FLHR touring, with a long life spanning three engine eras that must never be merged: Twin Cam 88 (1999-2006), Twin Cam 96/103 (2007-2016), and Milwaukee-Eight 107/114 (2017+). Recurring documented themes: the TWIN CAM CAM-CHAIN TENSIONER shoe wear that sends debris through the oil system (the signature failure of that era), excessive rear-cylinder heat, the compensator sprocket noise and failure on 2007-2016 bikes, stator and voltage-regulator failure, front fork and steering-head bearing wear on a heavy touring chassis, and the ABS and hydraulic-clutch recalls that swept the touring range.',
    forums: 'hdforums.com, harley-davidsonforums.com, roadkingforums.com, fljrider.com, r/Harley',
  },
  {
    style: 'moto', make: 'Honda', model: 'CBR600RR', yearsHint: '2003-2025',
    note: 'NET-NEW NAMEPLATE and one of the most-produced sportbikes ever, with an enormous owner and track community. Generations: 2003-2004 (PC37), 2005-2006, 2007-2012 (the major redesign, with C-ABS as an option from 2009), 2013-2016, and the 2021+ revival. Recurring documented themes: regulator/rectifier and stator charging failure (the signature complaint on Hondas of this era), the 2007-2008 recalls, cam chain tensioner, fuel pump and FI faults, clutch slave cylinder leaks, fork seal and steering-head bearing wear, and the specific issues of the combined-ABS system on equipped bikes. Track-used examples have their own wear profile - distinguish it from street use.',
    forums: 'cbrforum.com, 600rr.net, honda-forums.com, sportbikes.net, r/CBR, r/motorcycles',
  },
  {
    style: 'moto', make: 'Suzuki', model: 'GSX-R600', yearsHint: '2001-2025',
    note: 'NET-NEW NAMEPLATE. MAKE COLLISION - this catalog holds Suzuki Vitara, Swift, Jimny, SX4 (cars) and V-Strom 650 (motorcycle). Generations: 2001-2003 (K1-K3), 2004-2005 (K4-K5), 2006-2010 (K6-K10), 2011+ (L1 onward). Recurring documented themes: regulator/rectifier and stator failure (the defining electrical complaint across the GSX-R range), the well-known fuel pump and FI issues, cam chain tensioner, clutch basket and slave cylinder wear, fork seal failure, and the recalls covering the front brake master cylinder (a large multi-year Suzuki campaign) and the ignition/starter circuit. Distinguish track-used from street-used examples.',
    forums: 'gsxr.com, gixxer.com, sportbikes.net, suzuki-forums.com, r/SuzukiMotorcycles, r/motorcycles',
  },
  {
    style: 'moto', make: 'KTM', model: '390 Duke', yearsHint: '2013-2025',
    note: 'NET-NEW NAMEPLATE and KTM is a NET-NEW MAKE for this catalog. Built by Bajaj in India on the shared 390/250/200 platform. Generations: 2013-2016, 2017-2023 (the major redesign with the TFT dash), and the 2024+ all-new model. Recurring documented themes that are genuinely well documented for this bike: the fuel pump and fuel-pump-relay failures, the notorious cooling-fan and overheating complaints in traffic, wiring-harness and connector corrosion, camshaft and rocker wear on early engines, clutch slave cylinder leaks, and the multiple recalls (including the fuel line and the brake). Watch the RC 390 - a different bike sharing the engine.',
    forums: 'ktmduke390.com, ktmforums.com, advrider.com, r/KTM, r/motorcycles',
  },
  {
    style: 'moto', make: 'Ducati', model: 'Monster', yearsHint: '2000-2025',
    note: 'NET-NEW NAMEPLATE and Ducati is a NET-NEW MAKE. A nameplate spanning twenty-five years and several unrelated engines, which is the central trap: the air-cooled two-valve Desmodue (M600/620/695/696/796/797), the water-cooled Testastretta (S4, S4R, 821, 1200), and the 2021+ Monster with the Superquadro-derived 937. Recurring documented themes: DESMODROMIC VALVE SERVICE INTERVALS and the cost/consequence of skipping them, the dry clutch on older models (rattle, basket wear), regulator/rectifier and stator failure, fuel pump and FI faults, and the recalls covering the side stand, the fuel tank (the well-documented ethanol tank-swelling issue on 2009-2011 bikes) and the brakes.',
    forums: 'ducatimonster.org, ducati.ms, ducatiforum.co.uk, advrider.com, r/Ducati, r/motorcycles',
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
  fs.writeFileSync(`data/research-wave13${suffix}-exclusions.json`, JSON.stringify(excl, null, 2));

  const body = fs.readFileSync('scripts/_wave11-body.js', 'utf8').replace(/\r/g, '');
  const out = body
    .replace('/*__TARGETS__*/', JSON.stringify(SELECTED, null, 2))
    .replace('/*__EXCLUSIONS__*/', JSON.stringify(excl, null, 2))
    .replace("name: 'research-wave11-four-bucket'", `name: 'research-wave13${suffix}-four-bucket'`)
    .replace(/Wave-11: 26 targets[^']*/, `Wave-13${suffix}: ${SELECTED.length} targets across EVs, newer vehicles, top sellers, thin nameplates and motorcycles. Style-selected discover prompt + adversarial verify`)
    .replace(/log\(`Wave 11:/, 'log(`Wave 13:')
    .replace(/WAVE 11 TOTAL/, 'WAVE 13 TOTAL');
  const outPath = `scripts/_wf-research-wave13${suffix}.js`;
  fs.writeFileSync(outPath, out);
  console.log(`\nWrote ${outPath} (${out.length} bytes, ${SELECTED.length} targets)`);
  await prisma.$disconnect();
  await pool.end();
})().catch((e) => { console.error('FAIL:', e.message); pool.end(); process.exit(1); });
