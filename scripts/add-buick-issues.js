#!/usr/bin/env node
/**
 * Add Buick known issues — GM mid-luxury division.
 *
 * Audit-before-publish: every entry lands as status='pending_review',
 * flipped to published only after WebSearch verification.
 *
 * Source bias: GM 3800 Series II/III lower intake gasket (LIM) — one of
 * the most-documented engine issues in GM's history, applies across
 * Park Avenue, LeSabre, Riviera, Regal, Lucerne. Also Opel/PSA-derived
 * issues for Regal (2011+ Insignia A) and Cascada (Opel-built).
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
  // === 3800 Series II/III — LIM gasket ===
  {
    id: 'buick-3800-lower-intake-gasket-park-avenue',
    make: 'Buick',
    model: 'Park Avenue',
    years: range(1995, 2005),
    trims: ['Base', 'Ultra'],
    engines: ['3.8L L36 (Series II/III)', '3.8L L67 Supercharged'],
    category: 'engine',
    title: 'Park Avenue 3800 V6 Lower Intake Manifold (LIM) Gasket Leak',
    description: 'The 3800 Series II (and early III) V6 in Park Avenue, LeSabre, Riviera, Regal, Lucerne — and shared Pontiac Bonneville/Grand Prix, Olds 88/LSS, Chevy Monte Carlo/Impala — suffers infamous lower intake manifold gasket failure. Plastic intake material softens under coolant exposure (especially Dex-Cool); gasket erodes and leaks coolant into the lifter valley, mixing with oil. Catastrophic if undetected.',
    solution: 'Replace LIM gasket with updated Fel-Pro MS98003T (improved metal-reinforced design) — $400-$800 at independent. Replace upper intake plenum at the same time if cracked. Drain Dex-Cool and refill with Zerex G-05 or compatible HOAT. Inspect oil for coolant contamination at every change; milky oil means immediate teardown.',
    severity: 'critical',
    confidence: 'high',
    symptoms: ['coolant loss with no external leak', 'milky oil', 'overheating', 'sweet smell from exhaust', 'rough idle'],
    affectedSystems: ['intake manifold', 'cooling system', 'lubrication'],
    dtcCodes: ['P0171', 'P0174', 'P0300'],
    estimatedCostLow: 400,
    estimatedCostHigh: 1200,
    typicalMileageLow: 60000,
    typicalMileageHigh: 150000,
  },
  {
    id: 'buick-3800-lower-intake-gasket-lesabre',
    make: 'Buick',
    model: 'LeSabre',
    years: range(1995, 2005),
    trims: ['Custom', 'Limited', '90th Anniversary', 'Celebration'],
    engines: ['3.8L L36 (Series II/III)'],
    category: 'engine',
    title: 'LeSabre 3800 V6 Lower Intake Manifold (LIM) Gasket Leak',
    description: 'Same 3800 V6 LIM-gasket failure mode as Park Avenue — extremely widespread in 1995-2005 LeSabres. Coolant migrates past degraded plastic-and-rubber gasket into the valley, contaminating engine oil. Owners commonly first notice low coolant with no visible leak; by the time milky oil appears, bearings may already be damaged.',
    solution: 'LIM gasket job is the same: Fel-Pro MS98003T or similar updated design — $400-$800. Replace UIM plenum if cracked, and drain Dex-Cool. Many shops will replace the EGR stovepipe gasket and throttle body gasket while everything is apart.',
    severity: 'critical',
    confidence: 'high',
    symptoms: ['coolant loss', 'milky oil', 'overheating', 'sweet exhaust smell', 'rough idle'],
    affectedSystems: ['intake manifold', 'cooling system', 'lubrication'],
    dtcCodes: ['P0171', 'P0174', 'P0300'],
    estimatedCostLow: 400,
    estimatedCostHigh: 1200,
    typicalMileageLow: 60000,
    typicalMileageHigh: 150000,
  },
  {
    id: 'buick-lacrosse-3.6l-timing-chain',
    make: 'Buick',
    model: 'LaCrosse',
    years: range(2010, 2016),
    trims: ['CX', 'CXL', 'CXS', 'Touring', 'Premium I', 'Premium II', 'Premium III', 'Sport Touring'],
    engines: ['3.6L LFX/LLT V6'],
    category: 'engine',
    title: 'LaCrosse 3.6L LLT/LFX Timing Chain Stretch',
    description: 'The GM 3.6L LLT (2007-2011) and LFX (2012+) "High Feature" V6 in LaCrosse, Enclave, Acadia, Traverse, CTS, Cadillac SRX, and many others suffers timing chain stretch typically between 80,000-150,000 miles. Root cause is oil-related — original OLM intervals (up to 12,000 miles) starved the chain of fresh oil. Excessive oil consumption (LLT also has a known consumption issue) accelerates wear.',
    solution: 'Full timing chain kit ($2,000-$3,500 incl. labor) — both primary and secondary chains, all tensioners and guides. Switch to 5,000-7,500 mile oil intervals with full-synthetic dexos1 5W-30. LLT engines may also need PCV valve replacement to reduce oil consumption (TSB 10-06-01-007).',
    severity: 'critical',
    confidence: 'high',
    symptoms: ['cold start rattle', 'check engine light', 'extended cranking', 'misfire', 'low oil between changes'],
    affectedSystems: ['timing chain', 'valvetrain'],
    dtcCodes: ['P0008', 'P0009', 'P0016', 'P0017', 'P0018', 'P0019', 'P0300'],
    estimatedCostLow: 2000,
    estimatedCostHigh: 4500,
    typicalMileageLow: 80000,
    typicalMileageHigh: 150000,
  },

  // === Enclave ===
  {
    id: 'buick-enclave-timing-chain-2008-2012',
    make: 'Buick',
    model: 'Enclave',
    years: range(2008, 2012),
    trims: ['CX', 'CXL', 'CXL-1', 'CXL-2', 'Premium'],
    engines: ['3.6L LLT V6'],
    category: 'engine',
    title: 'Enclave 3.6L LLT Timing Chain Stretch + Oil Consumption',
    description: 'Early Enclaves (2008-2012, plus shared Traverse/Acadia/Outlook) with the 3.6L LLT direct-injection V6 share LaCrosse\'s timing chain stretch and a separate excessive-oil-consumption issue. The PCV system pulls oil into the intake, intake valves carbon up (no port injection to wash them), and the chain wears prematurely from stretched OLM intervals.',
    solution: 'Timing chain replacement ($2,500-$4,500 with 3-row crossover labor premium). Walnut-blast intake valve carbon at the same time ($300-$500). PCV system update per TSB. Some owners refuse the chain job at this mileage and trade — failure can mean total engine replacement ($6,000+).',
    severity: 'critical',
    confidence: 'high',
    symptoms: ['cold start rattle', 'oil consumption (1 qt/1,000 miles)', 'misfire', 'rough idle'],
    affectedSystems: ['timing chain', 'PCV', 'valvetrain'],
    dtcCodes: ['P0008', 'P0009', 'P0016', 'P0017', 'P0018', 'P0019'],
    estimatedCostLow: 2500,
    estimatedCostHigh: 6500,
    typicalMileageLow: 80000,
    typicalMileageHigh: 150000,
  },
  {
    id: 'buick-enclave-power-steering-recall',
    make: 'Buick',
    model: 'Enclave',
    years: range(2009, 2010),
    trims: ['CX', 'CXL', 'CXL-1', 'CXL-2'],
    engines: ['all'],
    category: 'steering',
    title: 'Enclave Power Steering Hose Fire Risk Recall (NHTSA 14V-355)',
    description: 'NHTSA recall 14V-355 covers ~189,000 2009-2010 Enclave/Traverse/Acadia/Outlook for a power-steering pressure hose that can leak fluid onto the catalytic converter, creating a fire risk. Multiple in-service fires were reported. The remedy is replacement of the pressure hose and an inspection.',
    solution: 'Check VIN against NHTSA recall lookup (14V-355). Repair is free — dealer replaces the power-steering pressure hose and inspects for prior leak damage. If you smell burning fluid or see drips near the catalytic converter, park and tow rather than drive.',
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

  // === Regal (Opel Insignia A) ===
  {
    id: 'buick-regal-2.0t-timing-chain-ltg',
    make: 'Buick',
    model: 'Regal',
    years: range(2011, 2017),
    trims: ['GS', 'Premium', 'Turbo', 'Sport Touring'],
    engines: ['2.0L Turbo LHU', '2.0L Turbo LTG'],
    category: 'engine',
    title: 'Regal 2.0L Turbo (LHU/LTG) Timing Chain Stretch',
    description: 'The 2.0L Turbo LHU (2011-2014) and LTG (2014+) in Regal — and shared LaCrosse, Cadillac ATS/CTS — develops timing chain stretch around 80,000-130,000 miles. Symptoms: cold-start rattle, P0008/P0017 codes, eventual loss of cam timing. Aggravated by extended oil intervals and stop-start fleet use.',
    solution: 'Full timing chain kit including chain, tensioner, guides, sprockets — $1,800-$3,000 at independent. Stick to 5,000-7,500 mile oil intervals with dexos1 full-synthetic 5W-30. Carbon-clean intake valves at the same service ($300-$500) since LHU/LTG are direct-injection.',
    severity: 'critical',
    confidence: 'high',
    symptoms: ['cold start rattle', 'misfire', 'check engine light', 'reduced power'],
    affectedSystems: ['timing chain'],
    dtcCodes: ['P0008', 'P0009', 'P0016', 'P0017'],
    estimatedCostLow: 1800,
    estimatedCostHigh: 3500,
    typicalMileageLow: 80000,
    typicalMileageHigh: 130000,
  },
  {
    id: 'buick-regal-aisin-af40-transmission',
    make: 'Buick',
    model: 'Regal',
    years: range(2011, 2017),
    trims: ['CXL', 'GS', 'Premium', 'Turbo'],
    engines: ['2.0L Turbo', '2.4L', '3.6L V6'],
    category: 'transmission',
    title: 'Regal Aisin AF40 6-Speed Harsh Shifts / Shudder',
    description: 'The Aisin AF40 6-speed automatic in 2011-2017 Regal (and 2010-2017 LaCrosse 4-cyl, 2008-2017 Opel Insignia A) develops harsh 1-2 and 2-3 shifts, torque-converter shudder at light throttle, and delayed engagement, usually 80,000-150,000 miles. GM\'s "lifetime fill" claim is widely disputed by independent shops.',
    solution: 'Drain-and-fill ATF every 50,000 miles using AC Delco / Aisin AFW+ (or JWS3309 equivalent) — about $150-$250 DIY (5-6 qt drained per service). Severe shudder may need torque converter or valve body work ($1,500-$3,500). If neglected past 120k miles, full rebuild may be required ($3,500-$5,500).',
    severity: 'high',
    confidence: 'high',
    symptoms: ['harsh shifts', 'torque converter shudder', 'delayed engagement', 'flare on upshift'],
    affectedSystems: ['transmission', 'torque converter'],
    dtcCodes: ['P0741', 'P0746', 'P0776'],
    estimatedCostLow: 150,
    estimatedCostHigh: 5500,
    typicalMileageLow: 80000,
    typicalMileageHigh: 150000,
  },

  // === Lucerne ===
  {
    id: 'buick-lucerne-northstar-head-bolt',
    make: 'Buick',
    model: 'Lucerne',
    years: range(2006, 2011),
    trims: ['CXS', 'Super', 'Special Edition'],
    engines: ['4.6L L37 Northstar V8'],
    category: 'engine',
    title: 'Lucerne Northstar V8 Head Bolt Pull / Coolant Loss',
    description: 'The 4.6L Northstar V8 in 2006-2011 Lucerne CXS/Super (and STS, DTS, Cadillac SLS) is known for head-bolt thread pull from the aluminum block. Bolts back out of the block (rather than head gasket failing outright), allowing combustion gases into the coolant. Symptoms: coolant loss, white smoke, overheating, eventually no-start.',
    solution: 'Northstar "time-sert" head bolt repair is the durable fix — block must be removed (engine out or in some cases above-engine work), threads drilled out, larger steel inserts installed. $3,500-$6,000 specialist labor. Some owners try "Block-Tite" / sealants as a band-aid; not durable. Watch coolant level monthly.',
    severity: 'critical',
    confidence: 'high',
    symptoms: ['white smoke', 'coolant loss', 'overheating', 'sweet exhaust smell', 'rough running'],
    affectedSystems: ['cylinder head', 'cooling system'],
    dtcCodes: ['P0301', 'P0302', 'P0303', 'P0304'],
    estimatedCostLow: 3500,
    estimatedCostHigh: 7500,
    typicalMileageLow: 100000,
    typicalMileageHigh: 180000,
  },

  // === Encore / Encore GX ===
  {
    id: 'buick-encore-1.4-turbo-timing-chain',
    make: 'Buick',
    model: 'Encore',
    years: range(2013, 2022),
    trims: ['Base', 'Convenience', 'Leather', 'Premium', 'Sport Touring', 'Preferred', 'Essence'],
    engines: ['1.4L Turbo LUJ/LUV'],
    category: 'engine',
    title: 'Encore 1.4L Turbo (LUJ/LUV) Timing Chain Stretch',
    description: 'The 1.4L Turbo LUJ (2011-2015) and LUV (2016+) in Encore — and shared Chevy Cruze/Sonic/Trax — develops timing chain stretch typically between 80,000-130,000 miles. Cold-start rattle, then misfire codes, then risk of chain skip. Same engine family used in Opel Astra J (Astra Adam Mokka — see prior Opel issues).',
    solution: 'Full chain kit including chain, tensioner, guides, sprockets ($1,200-$2,000). Use dexos1 full-synthetic 5W-30 and stick to 5,000-mile intervals — extended OLM intervals are the dominant cause. Catastrophic chain skip means head rebuild ($3,500+).',
    severity: 'critical',
    confidence: 'high',
    symptoms: ['cold start rattle', 'misfire', 'check engine light', 'limp mode'],
    affectedSystems: ['timing chain'],
    dtcCodes: ['P0008', 'P0009', 'P0016', 'P0017', 'P0300'],
    estimatedCostLow: 1200,
    estimatedCostHigh: 4000,
    typicalMileageLow: 80000,
    typicalMileageHigh: 130000,
  },
  {
    id: 'buick-encore-gx-1.2-1.3-turbo-shudder',
    make: 'Buick',
    model: 'Encore GX',
    years: range(2020, 2024),
    trims: ['Preferred', 'Select', 'Essence', 'Sport Touring', 'Avenir'],
    engines: ['1.2L Turbo', '1.3L Turbo'],
    category: 'transmission',
    title: 'Encore GX CVT / 9-Speed Hesitation and Shudder',
    description: 'The 2020+ Encore GX uses either the VT40 CVT (FWD 1.2L) or the GM 9T50 9-speed (AWD 1.3L). Both have reported issues: CVT hesitates from a stop, jerks on tip-in, and growls. 9-speed has been the subject of multiple TSBs covering harsh shifts, flares, and torque converter shudder.',
    solution: 'CVT: software update via dealer (TSB 21-NA-141 and successors). 9-speed: ATF flush + reprogramming if persistent shudder; valve body or torque converter if not resolved. Many fixes were under GM\'s "PI" (Product Investigation) bulletins — check for active campaigns on your VIN.',
    severity: 'high',
    confidence: 'medium',
    symptoms: ['hesitation from stop', 'jerk on tip-in', 'shudder at light throttle', 'harsh shifts'],
    affectedSystems: ['CVT', 'automatic transmission', 'torque converter'],
    dtcCodes: ['P0741', 'P0700'],
    estimatedCostLow: 0,
    estimatedCostHigh: 3500,
    typicalMileageLow: 10000,
    typicalMileageHigh: 80000,
  },

  // === Cascada (Opel-built) ===
  {
    id: 'buick-cascada-1.6t-timing-chain',
    make: 'Buick',
    model: 'Cascada',
    years: range(2016, 2019),
    trims: ['Base', 'Premium', 'Sport Touring'],
    engines: ['1.6L Turbo SIDI'],
    category: 'engine',
    title: 'Cascada 1.6L Turbo (Opel SIDI) Timing Chain & Carbon Buildup',
    description: 'The German-built Buick Cascada uses the Opel 1.6L SIDI turbo (A16XHT family). Same engine family is documented for timing chain stretch on Opel Astra K and Insignia. Direct-injection design also leads to intake valve carbon buildup typically by 70,000-100,000 miles, causing misfire and rough running.',
    solution: 'Chain kit replacement ~$1,500-$2,500 (parts harder to source than US-built GM engines). Walnut blast intake valves at the same service ($300-$500). Use dexos2 full-synthetic 5W-30 — required spec for European-build engines.',
    severity: 'high',
    confidence: 'medium',
    symptoms: ['cold start rattle', 'misfire', 'rough idle', 'reduced power', 'check engine light'],
    affectedSystems: ['timing chain', 'intake valves'],
    dtcCodes: ['P0008', 'P0016', 'P0300'],
    estimatedCostLow: 1500,
    estimatedCostHigh: 3500,
    typicalMileageLow: 70000,
    typicalMileageHigh: 130000,
  },
];

async function main() {
  console.log(`═══════════════════════════════════════════════════════════`);
  console.log(`  Add Buick Issues to pending_review`);
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
  console.log(`\nNext: node scripts/list-pending-issues.js --make Buick`);
  await pool.end();
}

main().catch(err => { console.error('Fatal:', err); pool.end(); process.exit(1); });
