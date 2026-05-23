#!/usr/bin/env node
/**
 * Add Suzuki known issues — global market launch via audit-before-publish gate.
 * Every entry lands as status='pending_review'.
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const { insertPendingIssue, issueExists } = require('./lib/insert-known-issue');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.on('error', () => {});

function range(s, e) { const a = []; for (let y = s; y <= e; y++) a.push(y); return a; }

const ISSUES = [
  {
    id: 'suzuki-swift-k12b-timing-chain',
    make: 'Suzuki', model: 'Swift', years: range(2010, 2017),
    trims: ['SZ2', 'SZ3', 'SZ4', 'Sport'],
    engines: ['1.2 K12B'],
    category: 'engine',
    title: 'Swift 1.2 K12B Timing Chain Stretch / Tensioner Wear',
    description: 'The K12B 1.2 petrol in the 2010-2017 Swift (and Splash/Ignis) suffers timing chain stretch and tensioner wear, typically appearing between 80,000-150,000 km. Symptoms: metallic rattle on cold start (longer than 1-2 seconds), P0016/P0017 cam-crank correlation codes, eventually limp mode. Worse on cars with long oil-change intervals or short trips.',
    solution: 'Full timing chain kit (chain, tensioner, guides) replacement £400-£700 (~€450-€800) at an independent. Use full-synthetic 5W-30, ILSAC GF-5 or higher; stick to 10,000 km intervals max for short-trip use.',
    severity: 'high', confidence: 'medium',
    symptoms: ['cold start rattle', 'check engine light', 'misfire', 'limp mode'],
    affectedSystems: ['timing chain'],
    dtcCodes: ['P0008', 'P0009', 'P0016', 'P0017'],
    estimatedCostLow: 400, estimatedCostHigh: 900,
    typicalMileageLow: 80000, typicalMileageHigh: 150000,
  },
  {
    id: 'suzuki-vitara-m16a-oil-consumption',
    make: 'Suzuki', model: 'Vitara', years: range(2015, 2022),
    trims: ['SZ4', 'SZ5', 'SZ-T', 'S'],
    engines: ['1.6 M16A'],
    category: 'engine',
    title: 'Vitara 1.6 M16A Oil Consumption',
    description: 'The naturally-aspirated 1.6 M16A in the current Vitara, S-Cross, and Swift Sport (ZC32S) is known to consume oil — typically 0.5-1.0 L per 5,000-10,000 km past 80,000 km. Worn valve seals and piston-ring deposits are the most-cited causes. Not catastrophic but check oil between services.',
    solution: 'Monitor oil monthly. Top-up only with matching grade (5W-30 ILSAC GF-5+). Heavy consumption (>1L/5,000km) warrants valve-seal/ring inspection — engine flush + Italian tune-up sometimes restores ring sealing temporarily.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['oil consumption', 'blue smoke at startup', 'fouled spark plugs'],
    affectedSystems: ['valve seals', 'piston rings'],
    dtcCodes: [],
    estimatedCostLow: 50, estimatedCostHigh: 800,
    typicalMileageLow: 80000, typicalMileageHigh: 200000,
  },
  {
    id: 'suzuki-jimny-mk4-rust',
    make: 'Suzuki', model: 'Jimny', years: range(2018, 2024),
    trims: ['SZ4', 'SZ5', 'Pro', 'Commercial'],
    engines: ['1.5 K15B'],
    category: 'body',
    title: 'Jimny Mk4 Rear Wheel Arch / Tailgate Corrosion',
    description: 'The 4th-generation Jimny (2018+) shows surprisingly early rear wheel arch and tailgate corrosion, especially in salt-belt markets. Rear arches start bubbling at 3-5 years; tailgate inner skin shows blistering from inside out. UK owner forums and Honest John writeups document repeated cases under 5 years old.',
    solution: 'Inspect arches and tailgate inner skin annually after year 2. Underseal proactively at year 3 in salt regions. Suzuki UK has done some goodwill repairs for in-warranty cases — request inspection at dealer. Patch repair £300-£600 per arch; tailgate replacement £800-£1,500.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['rust bubbling', 'paint blistering', 'tailgate skin bubbling'],
    affectedSystems: ['body', 'tailgate'],
    dtcCodes: [],
    estimatedCostLow: 300, estimatedCostHigh: 1500,
    typicalMileageLow: 10000, typicalMileageHigh: 100000,
  },
  {
    id: 'suzuki-jimny-mk3-rust-chassis',
    make: 'Suzuki', model: 'Jimny', years: range(1998, 2018),
    trims: ['JLX', 'JX', 'SZ3', 'SZ4'],
    engines: ['1.3 M13A'],
    category: 'body',
    title: 'Jimny Mk3 Chassis / Sill Corrosion (Salt-Belt)',
    description: 'The 1998-2018 Jimny (G/3rd gen) suffers chassis rail and sill corrosion in salt-belt markets. UK MOT failures common at 10+ years for rotted chassis sections, especially around rear axle mounts and sill structural sections. Otherwise drivetrain is famously reliable.',
    solution: 'Annual chassis inspection from year 7 in salt regions. Underseal/wax-cavity treatment is worth the cost. Chassis patch welding £400-£900 depending on extent. Rotted sills failing MOT can be repaired but full chassis replacement is rarely economical.',
    severity: 'high', confidence: 'high',
    symptoms: ['MOT failure', 'visible chassis rust', 'sill corrosion'],
    affectedSystems: ['chassis', 'sills', 'subframe'],
    dtcCodes: [],
    estimatedCostLow: 400, estimatedCostHigh: 1500,
    typicalMileageLow: 80000, typicalMileageHigh: 200000,
  },
  {
    id: 'suzuki-sx4-1.9-ddis-egr-dpf',
    make: 'Suzuki', model: 'SX4', years: range(2007, 2014),
    trims: ['Base', 'GL', 'GLX', 'AWD'],
    engines: ['1.9 DDiS (Fiat 8V 939A)'],
    category: 'engine',
    title: 'SX4 1.9 DDiS EGR + DPF Issues (Fiat-Sourced Diesel)',
    description: 'The 1.9 DDiS in the SX4 is the Fiat Multijet 8V 939A engine, shared with Croma/Bravo. Same EGR cooler clogging, DPF regeneration failures, and turbo actuator wear issues as in Fiat applications. Short-trip duty cycles especially destructive — DPF cannot complete passive regen.',
    solution: 'EGR clean: £150-£300. DPF forced regen (dealer): £80-£150 if not yet collapsed; full DPF replacement £700-£1,400. Drive at sustained 70+ mph for 20+ min monthly to enable passive regen. Many independents will EGR/DPF delete + remap — illegal in most markets.',
    severity: 'high', confidence: 'high',
    symptoms: ['DPF light', 'EGR fault', 'power loss', 'limp mode', 'black smoke'],
    affectedSystems: ['EGR', 'DPF', 'turbo'],
    dtcCodes: ['P0401', 'P2002', 'P2452', 'P2453', 'P2459'],
    estimatedCostLow: 150, estimatedCostHigh: 1500,
    typicalMileageLow: 80000, typicalMileageHigh: 150000,
  },
  {
    id: 'suzuki-grand-vitara-n32a-timing-chain',
    make: 'Suzuki', model: 'Grand Vitara', years: range(2005, 2015),
    trims: ['Premium', 'Luxury', 'XL-7', 'Limited'],
    engines: ['3.2 N32A V6'],
    category: 'engine',
    title: 'Grand Vitara 3.2 V6 N32A Timing Chain Tensioner Wear',
    description: 'The 3.2 N32A V6 (GM-developed, used in Grand Vitara and XL-7) suffers timing chain tensioner wear typically after 130,000 km. Multiple chains (intake/exhaust banks + oil pump drive) compound the parts cost. Cold-start rattle that does not clear after 5 seconds is the classic warning sign.',
    solution: 'Full multi-chain kit (chains, tensioners, guides) £1,000-£1,800 in parts; £2,000-£3,500 total. Use 5W-30 dexos1 spec, stick to 8,000 km intervals. Severe chain skip means valve damage and rebuild.',
    severity: 'high', confidence: 'medium',
    symptoms: ['cold start rattle', 'misfire', 'rough idle', 'oil pressure low'],
    affectedSystems: ['timing chain', 'oil pump drive'],
    dtcCodes: ['P0008', 'P0009', 'P0016', 'P0017'],
    estimatedCostLow: 2000, estimatedCostHigh: 5000,
    typicalMileageLow: 130000, typicalMileageHigh: 220000,
  },
  {
    id: 'suzuki-swift-sport-zc33s-clutch',
    make: 'Suzuki', model: 'Swift', years: range(2017, 2023),
    trims: ['Sport'],
    engines: ['1.4 BoosterJet K14C'],
    category: 'transmission',
    title: 'Swift Sport ZC33S Clutch Judder / Premature Wear',
    description: 'The 2017+ Swift Sport (ZC33S, 1.4 BoosterJet K14C turbo) is known for clutch judder, slip, and earlier-than-expected wear — particularly on hot starts after spirited driving. Single-mass flywheel + light clutch is sensitive to launch technique. Many owners replace clutch at 50,000-80,000 km.',
    solution: 'Replacement clutch kit (cover, plate, release bearing) £500-£900 incl. labor. Some specialists offer uprated kits (Helix, Sachs Performance) at +£100. DMF retrofit is debated — adds NVH improvement but doubles cost. Drive with measured launches.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['clutch judder', 'clutch slip', 'high biting point'],
    affectedSystems: ['clutch'],
    dtcCodes: [],
    estimatedCostLow: 500, estimatedCostHigh: 1200,
    typicalMileageLow: 50000, typicalMileageHigh: 100000,
  },
  {
    id: 'suzuki-vitara-1.4-boosterjet-oil-dilution',
    make: 'Suzuki', model: 'Vitara', years: range(2018, 2023),
    trims: ['SZ-T', 'SZ5', 'Sport', 'Allgrip'],
    engines: ['1.4 BoosterJet K14C'],
    category: 'engine',
    title: 'Vitara 1.4 BoosterJet Oil Dilution (Short-Trip Use)',
    description: 'The 1.4 BoosterJet K14C in Vitara and S-Cross can suffer oil-level dilution from fuel washing past piston rings during short, cold-engine trips — fuel enters the sump faster than evaporation can remove it. Oil level above max on the dipstick (a rising oil level) is the warning sign. Common in cars used mostly for sub-15-minute commutes.',
    solution: 'Check oil monthly — note any rise above max. Take a 30-minute fully-warmed-up drive weekly to boil off fuel. Persistent dilution means oil change every 5,000 km not 10,000. Severe cases (oil level rising 5mm+) need investigation for injector leakage or piston ring issues.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['oil level rising', 'fuel smell in oil', 'rough running cold'],
    affectedSystems: ['lubrication', 'fuel system'],
    dtcCodes: [],
    estimatedCostLow: 0, estimatedCostHigh: 200,
    typicalMileageLow: 0, typicalMileageHigh: 150000,
  },
  {
    id: 'suzuki-jimny-mk3-king-pin-wear',
    make: 'Suzuki', model: 'Jimny', years: range(1998, 2018),
    trims: ['JLX', 'JX', 'SZ3', 'SZ4'],
    engines: ['all'],
    category: 'suspension',
    title: 'Jimny Mk3 King-Pin Bearing Wear (Front Axle Solid)',
    description: 'The Jimny Mk3 solid front axle uses king-pin bearings that wear, leading to vague steering, MOT failures for excessive play, and clunking from the front end. Typically presents at 80,000-150,000 km, earlier with serious off-road use. Symptoms are easy to confuse with track-rod-end or wheel-bearing wear.',
    solution: 'King-pin bearing kit (both sides) £100-£200 in parts; £350-£600 labor at a specialist. Use Suzuki/OEM bearings — pattern parts wear faster. Replace tracking-related components at same time (track-rod ends, drag link) since the front end is opened up.',
    severity: 'medium', confidence: 'high',
    symptoms: ['steering vague', 'clunking front end', 'MOT failure', 'tire scrub'],
    affectedSystems: ['front axle', 'steering'],
    dtcCodes: [],
    estimatedCostLow: 350, estimatedCostHigh: 800,
    typicalMileageLow: 80000, typicalMileageHigh: 150000,
  },
  {
    id: 'suzuki-alto-wagon-r-valve-clearance',
    make: 'Suzuki', model: 'Alto', years: range(2009, 2020),
    trims: ['GA', 'GL', 'GLX'],
    engines: ['1.0 K10B'],
    category: 'engine',
    title: 'Alto / Wagon R K10B Valve Clearance Service (Shim-Under-Bucket)',
    description: 'The K10B 1.0 3-cylinder in Alto, Celerio (early), Splash, and Wagon R uses shim-under-bucket valve adjustment — not the more common hydraulic lash adjusters. Suzuki specifies a check at 96,000 km but many owners (and dealers) skip it; tight valves over time cause burned exhaust valves and failed compression.',
    solution: 'Valve clearance check + adjustment at 96,000 km is in the service book — confirm it has been done. £200-£400 labor + shims. If skipped repeatedly, eventually a leak-down test will reveal valve burn — head rebuild £700-£1,200.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['rough idle', 'misfire', 'low compression', 'reduced economy'],
    affectedSystems: ['valvetrain', 'cylinder head'],
    dtcCodes: ['P0300', 'P0301', 'P0302', 'P0303'],
    estimatedCostLow: 200, estimatedCostHigh: 1200,
    typicalMileageLow: 90000, typicalMileageHigh: 180000,
  },
  {
    id: 'suzuki-across-rav4-phev-12v-drain',
    make: 'Suzuki', model: 'Across', years: range(2020, 2025),
    trims: ['Plug-in Hybrid'],
    engines: ['2.5 PHEV'],
    category: 'electrical',
    title: 'Across PHEV 12V Auxiliary Battery Drain (Toyota RAV4 PHEV Rebadge)',
    description: 'The Suzuki Across is a Toyota RAV4 PHEV rebadge and inherits Toyota PHEV 12V auxiliary battery issues — slow drain from telematics + various BCM modules can leave a 12V dead after 7-14 days parked. Toyota has issued multiple TSBs and software updates; check that your dealer has applied the latest.',
    solution: 'Ensure latest software update applied (Toyota covers under their TSB even though sold as Suzuki). Use a 12V battery maintainer for parked stretches over 1 week. AGM 12V replacement around £200-£300 at independent.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['will not wake', 'dead 12V', 'will not charge'],
    affectedSystems: ['12V battery', 'BCM'],
    dtcCodes: [],
    estimatedCostLow: 0, estimatedCostHigh: 350,
    typicalMileageLow: 0, typicalMileageHigh: 100000,
  },
  {
    id: 'suzuki-swift-mk3-aircon-condenser',
    make: 'Suzuki', model: 'Swift', years: range(2004, 2010),
    trims: ['Base', 'GL', 'GLX', 'Sport'],
    engines: ['all'],
    category: 'hvac',
    title: 'Swift Mk3 A/C Condenser Stone Damage / Corrosion',
    description: 'The 3rd-gen Swift (2004-2010) A/C condenser is unusually exposed at the front of the car with minimal stone protection — gets damaged from road debris and corrodes through within 5-7 years. Refrigerant loss + warm air from the vents is the classic symptom.',
    solution: 'Replacement condenser £80-£150 part, £150-£300 labor + regas (£60-£100). Some owners fit a mesh stone guard from £20 to protect the new condenser. Check for damage at MOT.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['warm A/C', 'no cold air', 'visible damage'],
    affectedSystems: ['A/C', 'condenser'],
    dtcCodes: [],
    estimatedCostLow: 200, estimatedCostHigh: 450,
    typicalMileageLow: 40000, typicalMileageHigh: 150000,
  },
];

async function main() {
  console.log(`\n  Suzuki — inserting ${ISSUES.length} drafts as pending_review\n`);
  let added = 0, dup = 0, errors = 0;
  for (const draft of ISSUES) {
    try {
      if (await issueExists(pool, draft.id)) { console.log(`  ~ ${draft.id} — exists`); dup++; continue; }
      await insertPendingIssue(pool, draft);
      console.log(`  ✓ ${draft.id}`); added++;
    } catch (err) { console.error(`  ✗ ${draft.id} — ${err.message}`); errors++; }
  }
  console.log(`\nAdded: ${added}, Duplicates: ${dup}, Errors: ${errors}`);
  await pool.end();
}
main().catch(err => { console.error('Fatal:', err); pool.end(); process.exit(1); });
