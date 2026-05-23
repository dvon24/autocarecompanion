#!/usr/bin/env node
/**
 * Add Saturn known issues — GM's "different kind" division (defunct 2010).
 *
 * Audit-before-publish: every entry lands as status='pending_review',
 * flipped to published only after WebSearch verification.
 *
 * Source bias: S-Series unique drivetrain (the original SOHC/DOHC
 * 1.9L motors had their own gasket/oil-consumption quirks), then later
 * GM/Opel-platform issues for Vue, Ion, Aura, Outlook.
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const { insertPendingIssue, issueExists } = require('./lib/insert-known-issue');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.on('error', () => {});

function range(start, end) {
  const arr = [];
  for (let y = start; y <= end; y++) arr.push(y);
  return arr;
}

const ISSUES = [
  // === S-Series (1.9L) shared issues across SL/SC/SW ===
  {
    id: 'saturn-s-series-valve-cover-leak-1.9',
    make: 'Saturn',
    model: 'SL',
    years: range(1991, 2002),
    trims: ['Base', 'SL1', 'SL2'],
    engines: ['1.9L SOHC', '1.9L DOHC'],
    category: 'engine',
    title: 'S-Series 1.9L Valve Cover & Front Crank Seal Leaks',
    description: 'The 1.9L SOHC (SL/SC1) and DOHC (SL2/SC2) engines in 1991-2002 S-Series sedans (SL), coupes (SC), and wagons (SW) develop persistent oil leaks at the valve cover gasket and front crank seal by 80,000-120,000 miles. The DOHC valve cover gasket is a $20 part but the cover bolt holes strip easily. The front crank seal often leaks onto the timing chain area and drips onto the exhaust manifold causing smell.',
    solution: 'Valve cover gasket replacement DIY (~$30 part); use a torque wrench to spec (89 in-lbs) to avoid stripping. Front crank seal requires harmonic balancer removal — $200-$400 at independent. Replace the cam seals at the same time on DOHC. If valve cover bolt holes are stripped, time-serts ($60-$100) save the head.',
    severity: 'medium',
    confidence: 'high',
    symptoms: ['oil leak', 'burning oil smell', 'oil dripping from front of engine', 'low oil between changes'],
    affectedSystems: ['valve cover', 'front crank seal'],
    dtcCodes: [],
    estimatedCostLow: 30,
    estimatedCostHigh: 600,
    typicalMileageLow: 80000,
    typicalMileageHigh: 200000,
  },
  {
    id: 'saturn-s-series-oil-consumption-dohc',
    make: 'Saturn',
    model: 'SL',
    years: range(1991, 2002),
    trims: ['SL2'],
    engines: ['1.9L DOHC'],
    category: 'engine',
    title: 'S-Series 1.9L DOHC Oil Consumption (Coked Piston Rings)',
    description: 'The 1.9L DOHC engine in SL2 / SC2 / SW2 develops excessive oil consumption (often 1 qt per 1,000 miles or worse) by 80,000-150,000 miles. Root cause is coked oil-control rings — common to the engine\'s open-deck design and high tolerance for low-quality oil over its long life. Owners are sometimes startled to find the engine 2+ quarts low between changes.',
    solution: 'Ring-cleaning treatments (BG EPR, Sea Foam soak) cycled through oil changes can sometimes free coked rings. If consumption is >1 qt/1,000 miles, ring/piston replacement (~$1,500-$2,500) is the durable fix. Many owners simply top off and run the car until something else fails — these engines often pass 250,000 miles even with consumption.',
    severity: 'medium',
    confidence: 'high',
    symptoms: ['oil consumption', 'blue smoke on startup', 'low oil between changes'],
    affectedSystems: ['piston rings'],
    dtcCodes: [],
    estimatedCostLow: 50,
    estimatedCostHigh: 3000,
    typicalMileageLow: 80000,
    typicalMileageHigh: 200000,
  },
  {
    id: 'saturn-sc-coupe-suicide-door-sag',
    make: 'Saturn',
    model: 'SC',
    years: range(1999, 2002),
    trims: ['SC1', 'SC2'],
    engines: ['all'],
    category: 'body',
    title: 'SC Coupe Third (Suicide) Door Hinge Sag & Latch Wear',
    description: '1999-2002 Saturn SC 3-door coupes have a small rear-hinged "suicide" door on the driver side for rear-seat access. The door is heavy for its hinges and develops sag, leading to alignment issues, weatherstrip wear, and difficult close. The latch mechanism is also prone to wear with regular use.',
    solution: 'Hinge bushings replacement (~$30 parts, 1 hour labor). Door realignment ($60-$120 shop) often needed simultaneously. Latch wear requires latch assembly replacement (~$100-$200 part) or attempt cleaning and re-lubricating internal pawl. If the steel door pin is worn, replace the pin and bushing kit before more hinge damage occurs.',
    severity: 'low',
    confidence: 'medium',
    symptoms: ['suicide door sagging', 'difficulty closing', 'wind noise', 'water leak around suicide door'],
    affectedSystems: ['door hinges', 'door latch'],
    dtcCodes: [],
    estimatedCostLow: 30,
    estimatedCostHigh: 400,
    typicalMileageLow: 50000,
    typicalMileageHigh: 200000,
  },

  // === Vue ===
  {
    id: 'saturn-vue-vti-cvt-failure',
    make: 'Saturn',
    model: 'Vue',
    years: range(2002, 2005),
    trims: ['Base', 'V6'],
    engines: ['2.2L Ecotec'],
    category: 'transmission',
    title: 'Vue VTi CVT Catastrophic Failure (2002-2005)',
    description: 'Early Saturn Vue (2002-2005) was offered with the GM VT25 (VTi) continuously-variable transmission paired with the 2.2L Ecotec. The CVT was infamously unreliable — failure rates so high that GM extended warranty to 5 years/75,000 miles, and many independents won\'t touch them. Symptoms: belt slip noise, surge under acceleration, eventual no-drive.',
    solution: 'If still under the extended warranty, get it documented. If out of warranty, the practical options are: (1) used VTi CVT swap (~$1,200-$2,500 with risky reliability), (2) used 5-speed manual conversion ($1,500-$3,000 with parts hunt), or (3) part out / sell the vehicle. Aamco / GM dealers historically offered swap-with-Aisin-5-speed conversions but parts are hard to source.',
    severity: 'critical',
    confidence: 'high',
    symptoms: ['CVT slip noise', 'surge under acceleration', 'shuddering', 'no drive', 'limp mode'],
    affectedSystems: ['CVT transmission'],
    dtcCodes: ['P0700', 'P0716', 'P0740'],
    estimatedCostLow: 1200,
    estimatedCostHigh: 4500,
    typicalMileageLow: 40000,
    typicalMileageHigh: 100000,
  },
  {
    id: 'saturn-vue-3.5l-honda-timing-belt',
    make: 'Saturn',
    model: 'Vue',
    years: range(2004, 2007),
    trims: ['V6'],
    engines: ['3.5L J35 (Honda V6)'],
    category: 'engine',
    title: 'Vue 3.5L Honda V6 Timing Belt Service Interval',
    description: '2004-2007 Saturn Vue V6 used the Honda 3.5L J35 V6 (sourced from Honda) — same engine as the Honda Pilot/Odyssey/MDX. It uses a timing belt with a recommended replacement interval of 100,000 miles (or 7 years). Interference engine: failure to replace the belt risks catastrophic valve damage. Water pump should be replaced at the same time.',
    solution: 'Full timing belt + water pump + tensioner + idler service kit ($600-$1,000 at independent). Use OEM Honda or quality aftermarket Gates/Aisin parts. Do NOT exceed the interval — this is an interference design. Some owners replaced at 90,000 miles for extra margin.',
    severity: 'critical',
    confidence: 'high',
    symptoms: ['timing belt chirping', 'whine from front of engine', 'oil leak at front', 'service due'],
    affectedSystems: ['timing belt', 'water pump'],
    dtcCodes: ['P0335', 'P0340'],
    estimatedCostLow: 600,
    estimatedCostHigh: 1500,
    typicalMileageLow: 90000,
    typicalMileageHigh: 110000,
  },

  // === Ion ===
  {
    id: 'saturn-ion-eps-failure-recall',
    make: 'Saturn',
    model: 'Ion',
    years: range(2003, 2007),
    trims: ['1', '2', '3', 'Red Line', 'Quad Coupe'],
    engines: ['all'],
    category: 'steering',
    title: 'Ion Electric Power Steering Failure (NHTSA 14V-153)',
    description: 'NHTSA recall 14V-153 covers 2003-2007 Ion, 2005-2010 Cobalt, 2007-2010 Pontiac G5, 2003-2006 Pontiac Pursuit (Canada), 2008-2009 HHR for sudden loss of electric power steering assist. ~1.3 million vehicles affected. Remedy is replacement of the EPS motor or torque sensor.',
    solution: 'Check VIN at NHTSA recall lookup (14V-153). Repair is free under recall. If you experience sudden loss of assist, control is still possible but steering becomes very heavy — pull over safely and request roadside assistance. Do not attempt independent repair until recall status is confirmed.',
    severity: 'critical',
    confidence: 'high',
    symptoms: ['power steering warning', 'sudden heavy steering', 'EPS fault'],
    affectedSystems: ['electric power steering'],
    dtcCodes: ['C0545', 'U0131'],
    estimatedCostLow: 0,
    estimatedCostHigh: 0,
    typicalMileageLow: 0,
    typicalMileageHigh: 999999,
  },
  {
    id: 'saturn-ion-ignition-switch-recall',
    make: 'Saturn',
    model: 'Ion',
    years: range(2003, 2007),
    trims: ['1', '2', '3', 'Red Line', 'Quad Coupe'],
    engines: ['all'],
    category: 'safety',
    title: 'Ion Ignition Switch Recall (NHTSA 14V-047) — Same as Cobalt',
    description: 'NHTSA recall 14V-047 — the infamous GM ignition switch recall that triggered congressional hearings — covers 2003-2007 Ion along with 2005-2010 Cobalt, 2006-2011 HHR, 2005-2010 Pontiac G5, 2007-2010 Pontiac Solstice, 2007-2010 Saturn Sky. The switch can rotate out of "run" position due to key weight, disabling the engine and airbags during operation. Multiple deaths attributed.',
    solution: 'Check VIN at NHTSA recalls lookup (14V-047). Dealer replaces ignition switch and (in many cases) provides new keys with shorter shanks. Until repaired, drive with only the ignition key on the ring (no extra keys/fobs/key ring weight). Free repair under recall.',
    severity: 'critical',
    confidence: 'high',
    symptoms: ['key turns off while driving', 'sudden engine shutoff', 'airbag warning', 'no-start intermittent'],
    affectedSystems: ['ignition switch', 'airbag system'],
    dtcCodes: [],
    estimatedCostLow: 0,
    estimatedCostHigh: 0,
    typicalMileageLow: 0,
    typicalMileageHigh: 999999,
  },

  // === Aura / Outlook (Epsilon / Lambda) ===
  {
    id: 'saturn-aura-3.6l-timing-chain',
    make: 'Saturn',
    model: 'Aura',
    years: range(2007, 2009),
    trims: ['XR', 'XR Special Edition'],
    engines: ['3.6L LY7 V6'],
    category: 'engine',
    title: 'Aura 3.6L LY7 V6 Timing Chain Stretch',
    description: 'The GM 3.6L LY7/LLT "High Feature" V6 in 2007-2009 Saturn Aura XR (and shared Chevy Malibu / Pontiac G6 / Cadillac CTS) develops timing chain stretch typically by 80,000-150,000 miles. Same root cause family as the LLT in Enclave/LaCrosse/Acadia — extended oil intervals starve the chain.',
    solution: 'Full timing chain kit ($1,800-$3,000 at independent) including primary and secondary chains, all tensioners and guides. Switch to 5,000-7,500 mile dexos1 oil intervals. Catastrophic chain skip means cylinder head damage ($4,000+).',
    severity: 'critical',
    confidence: 'high',
    symptoms: ['cold start rattle', 'misfire', 'check engine light', 'reduced power'],
    affectedSystems: ['timing chain'],
    dtcCodes: ['P0008', 'P0009', 'P0016', 'P0017'],
    estimatedCostLow: 1800,
    estimatedCostHigh: 4500,
    typicalMileageLow: 80000,
    typicalMileageHigh: 150000,
  },
  {
    id: 'saturn-outlook-power-steering-recall',
    make: 'Saturn',
    model: 'Outlook',
    years: range(2009, 2010),
    trims: ['XE', 'XR', 'AWD'],
    engines: ['all'],
    category: 'steering',
    title: 'Outlook Power-Steering Hose Fire-Risk Recall (NHTSA 14V-355)',
    description: 'NHTSA recall 14V-355 covers ~189,000 2009-2010 Outlook/Acadia/Traverse/Enclave for a power-steering pressure hose that can leak fluid onto the catalytic converter, creating a fire hazard. Multiple in-service fires were reported.',
    solution: 'Check VIN at NHTSA recalls lookup (14V-355). Dealer replaces the power-steering pressure hose at no cost and inspects for prior leak damage. If you smell burning fluid or see drips near the catalytic converter, do not drive — tow.',
    severity: 'critical',
    confidence: 'high',
    symptoms: ['burning fluid smell', 'PS pressure hose leak', 'smoke from engine bay'],
    affectedSystems: ['power steering', 'exhaust'],
    dtcCodes: [],
    estimatedCostLow: 0,
    estimatedCostHigh: 0,
    typicalMileageLow: 0,
    typicalMileageHigh: 999999,
  },

  // === Sky (Kappa) ===
  {
    id: 'saturn-sky-trunk-leak',
    make: 'Saturn',
    model: 'Sky',
    years: range(2007, 2010),
    trims: ['Base', 'Red Line', 'Ruby Red Limited Edition'],
    engines: ['all'],
    category: 'body',
    title: 'Sky Trunk Leak with Top Down (Kappa Platform)',
    description: '2007-2010 Saturn Sky (and Pontiac Solstice / Opel GT — all Kappa platform) has the trunk lid integrate with the soft top stowage. With the top down, the trunk seal is exposed; rain leaks past the seal into the trunk well. Tiny trunk space (only 3.8 cu ft with top stowed) means water pools at the spare-tire well and rusts the floor panel.',
    solution: 'Replace trunk seal if cracked ($60-$120 part); inspect annually. Use 3M weatherstrip adhesive to reseal. Always check spare-tire well after heavy rain. Confirm the top stowage drainage gutters are clear.',
    severity: 'low',
    confidence: 'high',
    symptoms: ['wet trunk after rain', 'standing water in spare tire well', 'mildew smell'],
    affectedSystems: ['body seals', 'trunk drainage'],
    dtcCodes: [],
    estimatedCostLow: 0,
    estimatedCostHigh: 200,
    typicalMileageLow: 0,
    typicalMileageHigh: 200000,
  },
  {
    id: 'saturn-sky-ignition-switch-recall',
    make: 'Saturn',
    model: 'Sky',
    years: range(2007, 2010),
    trims: ['Base', 'Red Line'],
    engines: ['all'],
    category: 'safety',
    title: 'Sky Ignition Switch Recall (NHTSA 14V-047 — Same as Ion)',
    description: 'NHTSA recall 14V-047 includes 2007-2010 Saturn Sky (along with Ion, Cobalt, HHR, G5, Solstice). The ignition switch can rotate out of "run" position due to key weight, disabling engine, power steering, brake boost, and airbags during operation.',
    solution: 'Check VIN at NHTSA recall lookup (14V-047). Free dealer ignition switch replacement under recall. Until repaired, drive with only the ignition key on the ring — no extra weight from fobs or key rings.',
    severity: 'critical',
    confidence: 'high',
    symptoms: ['key turns off while driving', 'sudden engine shutoff', 'airbag warning'],
    affectedSystems: ['ignition switch', 'airbag'],
    dtcCodes: [],
    estimatedCostLow: 0,
    estimatedCostHigh: 0,
    typicalMileageLow: 0,
    typicalMileageHigh: 999999,
  },

  // === Astra (Opel Astra H) ===
  {
    id: 'saturn-astra-1.8-timing-chain',
    make: 'Saturn',
    model: 'Astra',
    years: range(2008, 2009),
    trims: ['XE 3-door', 'XR 3-door', 'XE 5-door', 'XR 5-door'],
    engines: ['1.8L Z18XER'],
    category: 'engine',
    title: 'Astra 1.8L Z18XER Water Pump / Timing Chain Wear',
    description: '2008-2009 Saturn Astra is the Belgian-built Opel Astra H rebadged. The 1.8L Z18XER engine\'s water pump is driven from the timing chain — pump failure can jam the chain and bend valves. Common at 80,000-130,000 miles. Parts have become scarce in North America since Saturn / Opel withdrew.',
    solution: 'Replace water pump WITH timing chain kit as preventive service ($1,200-$2,000 at independent specialist). Parts may need to be sourced through Opel/Vauxhall channels (UK, Germany). Catastrophic pump seize means head rebuild ($3,500+). Do not delay if there is any whining or coolant weep from the front of the engine.',
    severity: 'critical',
    confidence: 'medium',
    symptoms: ['coolant weep', 'whine from front of engine', 'timing chain rattle', 'misfire'],
    affectedSystems: ['water pump', 'timing chain'],
    dtcCodes: ['P0008', 'P0016', 'P0335'],
    estimatedCostLow: 1200,
    estimatedCostHigh: 4000,
    typicalMileageLow: 80000,
    typicalMileageHigh: 130000,
  },
];

async function main() {
  console.log(`═══════════════════════════════════════════════════════════`);
  console.log(`  Add Saturn Issues to pending_review`);
  console.log(`  Drafts: ${ISSUES.length}`);
  console.log(`═══════════════════════════════════════════════════════════\n`);

  let added = 0, dup = 0, errors = 0;
  for (const draft of ISSUES) {
    try {
      if (await issueExists(pool, draft.id)) {
        console.log(`  ~ ${draft.id} — already exists, skipping`);
        dup++;
        continue;
      }
      await insertPendingIssue(pool, draft);
      console.log(`  ✓ ${draft.id} → pending_review`);
      added++;
    } catch (err) {
      console.error(`  ✗ ${draft.id} — ${err.message}`);
      errors++;
    }
  }

  console.log(`\nAdded: ${added}, Duplicates: ${dup}, Errors: ${errors}`);
  console.log(`\nNext: node scripts/list-pending-issues.js --make Saturn`);
  await pool.end();
}

main().catch(err => { console.error('Fatal:', err); pool.end(); process.exit(1); });
