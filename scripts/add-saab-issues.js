#!/usr/bin/env node
/**
 * Add Saab known issues — Swedish brand (defunct 2012).
 *
 * Audit-before-publish: every entry lands as status='pending_review',
 * flipped to published only after WebSearch verification.
 *
 * Source bias: well-documented Saab community issues — direct ignition
 * cassettes (DIC) on 9-3/9-5, B205/B235 sludge, GM-era Aisin AF40
 * transmission, and 9-7X/9-2X badge-engineered rebadge issues. Parts
 * support shrunk dramatically post-2014; many issues now mean used-only
 * sourcing or aftermarket-specialty replacements.
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
  // === Direct Ignition Cassette (DIC) — 9-3 and 9-5 ===
  {
    id: 'saab-9-3-direct-ignition-cassette',
    make: 'Saab',
    model: '9-3',
    years: range(1999, 2011),
    trims: ['Linear', 'Arc', 'Vector', 'Aero', '2.0T', 'Viggen'],
    engines: ['2.0L Turbo (B205)', '2.0L Turbo (B207)', '2.3L Turbo (B235)'],
    category: 'engine',
    title: '9-3 Direct Ignition Cassette (DIC) Failure',
    description: 'The Saab Direct Ignition Cassette — single integrated unit covering all four spark plugs — is a well-known wear item across 9-3 (and 9-5) from 1999 through end of production. Symptoms: misfire (often cylinder-specific then random), reduced power, check engine light. Failure rate climbs sharply after 80,000 miles. Saab DIC heat-shielding cracks; rubber boots fail.',
    solution: 'Replace DIC ($150-$350 OEM cassette, $80-$180 aftermarket — quality matters here, cheap units fail in months). DIY ~30 minutes with a 10mm hex socket. Always replace spark plugs at the same time (NGK PFR7S8EG or equivalent). Carry a spare DIC if traveling long distances — failure is sudden but the car limps home on the remaining cylinders.',
    severity: 'high',
    confidence: 'high',
    symptoms: ['misfire', 'reduced power', 'check engine light', 'no-start', 'rough idle'],
    affectedSystems: ['ignition'],
    dtcCodes: ['P0300', 'P0301', 'P0302', 'P0303', 'P0304'],
    estimatedCostLow: 80,
    estimatedCostHigh: 400,
    typicalMileageLow: 60000,
    typicalMileageHigh: 200000,
  },
  {
    id: 'saab-9-5-direct-ignition-cassette',
    make: 'Saab',
    model: '9-5',
    years: range(1999, 2009),
    trims: ['Linear', 'Arc', 'Vector', 'Aero'],
    engines: ['2.3L Turbo (B235)', '2.3L High Output Turbo'],
    category: 'engine',
    title: '9-5 Direct Ignition Cassette (DIC) Failure',
    description: 'Same DIC failure mode as 9-3 — 1999-2009 9-5 with the B235 2.3L turbo (Linear/Arc/Vector NA variants are B205) suffers DIC degradation. Saab dealers used to stock these by the dozen. Often the first part to fail on a high-mileage 9-5.',
    solution: 'Replacement DIC ($150-$350 OEM, $80-$180 aftermarket). NGK PFR7S8EG plugs at the same time. Trionic 7 ECU on 1999+ models compensates for misfire well, so the car often limps home — but P03xx codes will accumulate. Some owners pre-emptively replace at 100,000 miles.',
    severity: 'high',
    confidence: 'high',
    symptoms: ['misfire', 'reduced power', 'rough idle', 'check engine light'],
    affectedSystems: ['ignition'],
    dtcCodes: ['P0300', 'P0301', 'P0302', 'P0303', 'P0304'],
    estimatedCostLow: 80,
    estimatedCostHigh: 400,
    typicalMileageLow: 60000,
    typicalMileageHigh: 200000,
  },

  // === Oil Sludge — B205/B235 ===
  {
    id: 'saab-9-5-b235-oil-sludge',
    make: 'Saab',
    model: '9-5',
    years: range(1999, 2003),
    trims: ['Base', 'SE', 'Aero', 'Linear', 'Arc'],
    engines: ['2.3L Turbo (B235)'],
    category: 'engine',
    title: '9-5 B235 Turbo Oil Sludge — Class Action Settlement',
    description: 'Early 2.3L B235 turbo Saab 9-5 (1999-2003 most affected) had an oil-sludge issue serious enough to trigger a class-action lawsuit and warranty extension. Root cause: undersized oil sump + tight PCV system + factory-recommended 10,000-mile oil change intervals combined to coke oil in the turbo oil-feed line. Many engines failed with seized turbos or spun bearings.',
    solution: 'Strict 3,000-5,000 mile oil intervals with full-synthetic 5W-30 (or 5W-40 for high-mileage) — Mobil 1 or Amsoil. Sludge-removal cycle (BG EPR, Liqui Moly Pro-Line) over multiple oil changes. Inspect the oil pickup screen if sump removed — heavy sludge means engine rebuild ($3,000-$5,000). Original class-action coverage long-expired.',
    severity: 'critical',
    confidence: 'high',
    symptoms: ['low oil pressure warning', 'turbo whine then silence', 'oil consumption', 'noisy lifters'],
    affectedSystems: ['lubrication', 'turbocharger'],
    dtcCodes: ['P0521'],
    estimatedCostLow: 100,
    estimatedCostHigh: 6000,
    typicalMileageLow: 60000,
    typicalMileageHigh: 150000,
  },

  // === Sentronic / Aisin AF33 ===
  {
    id: 'saab-9-3-sentronic-af33-failure',
    make: 'Saab',
    model: '9-3',
    years: range(2003, 2011),
    trims: ['Linear', 'Arc', 'Vector', 'Aero', '2.0T', 'Convertible'],
    engines: ['2.0L Turbo', '2.8T V6'],
    category: 'transmission',
    title: '9-3 Sentronic (Aisin AF33-5) 5-Speed Auto Failure',
    description: 'Second-gen 9-3 (2003-2011) Sentronic 5-speed automatic is the Aisin AF33-5. Develops harsh shifts, slipping, then total failure typically by 100,000-150,000 miles. Saab\'s "lifetime fill" claim was the prime contributor. Failure mode includes valve body wear and torque-converter shudder.',
    solution: 'Drain-and-fill ATF every 40,000-50,000 miles with Aisin AFW+ / JWS3309 (~$120-$200 DIY — ~6 quarts come out per service). If shifts are already harsh, valve body rebuild ($800-$1,500) or full transmission swap with used unit ($1,500-$2,800). New AF33 transmissions are hard to source for Saab post-bankruptcy — used is the practical option.',
    severity: 'high',
    confidence: 'high',
    symptoms: ['harsh shifts', 'slipping', 'shudder', 'delayed engagement', 'limp mode'],
    affectedSystems: ['transmission'],
    dtcCodes: ['P0700', 'P0741', 'P0746'],
    estimatedCostLow: 120,
    estimatedCostHigh: 3000,
    typicalMileageLow: 80000,
    typicalMileageHigh: 150000,
  },

  // === SID — Saab Information Display pixel failure ===
  {
    id: 'saab-9-5-sid-pixel-failure',
    make: 'Saab',
    model: '9-5',
    years: range(1999, 2009),
    trims: ['Linear', 'Arc', 'Vector', 'Aero'],
    engines: ['all'],
    category: 'electrical',
    title: '9-5 Saab Information Display (SID) Missing-Pixel Failure',
    description: '1999-2009 9-5 (and 1999-2003 9-3) SID — the small dot-matrix display in the center dash that shows radio info, climate, trip computer — develops missing pixel rows starting around 100,000 miles. The flex-cable connection between the LCD glass and PCB degrades. Often presents as horizontal "dropout" lines in the display.',
    solution: 'Rebuild option: send the SID to a specialist (BBA Reman, Module Master, or several European Saab specialists) for ribbon-cable resoldering — $80-$180 with return shipping. DIY repair kits with replacement flex-cable available for ~$30. Replacement used SID rarely fixes the issue — they age the same way.',
    severity: 'low',
    confidence: 'high',
    symptoms: ['missing pixels in SID display', 'horizontal lines in display', 'unreadable trip info'],
    affectedSystems: ['SID display', 'instrumentation'],
    dtcCodes: [],
    estimatedCostLow: 30,
    estimatedCostHigh: 250,
    typicalMileageLow: 80000,
    typicalMileageHigh: 250000,
  },

  // === 9-3 second-gen (2003+) — sunroof drain ===
  {
    id: 'saab-9-3-sunroof-drain-clog',
    make: 'Saab',
    model: '9-3',
    years: range(2003, 2011),
    trims: ['Linear', 'Arc', 'Vector', 'Aero'],
    engines: ['all'],
    category: 'body',
    title: '9-3 Sunroof Drain Clog → Soaked Carpet → DICE/TWICE Module Failure',
    description: 'Second-gen 9-3 (2003-2011) sunroof drains clog with debris (pollen, leaves). Water then overflows into the headliner, runs down the A-pillars, soaks the carpet, and pools in the front footwell — directly under the DICE (Driver Information Central Electronics) and TWICE modules. Wet modules can short and cause a cascade of weird electrical faults (no-start, dead instrument cluster, ABS faults, etc.).',
    solution: 'Clear sunroof drains annually (compressed air from above, fishline gently from below). If carpet is wet, dry IMMEDIATELY — remove driver carpet and inspect the modules. Once a module is corroded the only fix is replacement and recoding ($300-$1,200). Aftermarket dehumidifier packs in footwell help in humid climates.',
    severity: 'high',
    confidence: 'high',
    symptoms: ['wet carpet', 'no-start intermittent', 'dead dash', 'multiple electrical warnings', 'mildew smell'],
    affectedSystems: ['sunroof drains', 'DICE module', 'TWICE module'],
    dtcCodes: ['U1900', 'U2105'],
    estimatedCostLow: 0,
    estimatedCostHigh: 1500,
    typicalMileageLow: 50000,
    typicalMileageHigh: 200000,
  },

  // === 9-3 / 9-5 — turbo failure ===
  {
    id: 'saab-9-3-turbo-failure-b207',
    make: 'Saab',
    model: '9-3',
    years: range(2003, 2011),
    trims: ['Linear', 'Arc', 'Vector', 'Aero', '2.0T'],
    engines: ['2.0L Turbo (B207)'],
    category: 'engine',
    title: '9-3 B207 Turbo Bearing Failure',
    description: 'The Mitsubishi TD04 turbo on 2003-2011 9-3 B207 2.0L Turbo engines develops shaft-bearing wear around 100,000-150,000 miles, especially on Aero variants which run higher boost. Symptoms: high-pitched whine, oil consumption, blue smoke under boost. Often co-fails with the bypass valve diaphragm.',
    solution: 'Replacement turbo ($400-$800 reman, $800-$1,400 OEM new) plus oil-feed line ($50-$80) and gaskets. Total job ~$1,200-$2,000 at independent. Always replace the oil-feed line — old line is the most common reason a fresh turbo fails immediately. Bypass valve ($40-$80) at the same time.',
    severity: 'high',
    confidence: 'high',
    symptoms: ['turbo whine', 'reduced boost', 'blue smoke under acceleration', 'oil consumption'],
    affectedSystems: ['turbocharger'],
    dtcCodes: ['P0299', 'P0234'],
    estimatedCostLow: 1200,
    estimatedCostHigh: 2500,
    typicalMileageLow: 100000,
    typicalMileageHigh: 180000,
  },

  // === 9-2X (Subaru Impreza rebadge) ===
  {
    id: 'saab-9-2x-head-gasket-2.5',
    make: 'Saab',
    model: '9-2X',
    years: range(2005, 2006),
    trims: ['Linear', '2.5i'],
    engines: ['2.5L EJ253 SOHC'],
    category: 'engine',
    title: '9-2X 2.5L EJ253 Head Gasket External Leak (Subaru-Sourced)',
    description: 'The 9-2X Linear / 2.5i used the same 2.5L EJ253 SOHC engine as the contemporary Subaru Impreza/Forester/Outback. This engine has the well-known external head gasket leak — typically presents as oil seeping at the head-block joint, particularly at the front of the engine. Coolant leaks less common but possible. Symptoms appear 80,000-150,000 miles.',
    solution: 'Head gasket replacement (~$1,800-$2,800 at Subaru-experienced independent). Use Subaru OEM MLS gaskets (Mahle aftermarket also acceptable). ALWAYS resurface the heads — warped surfaces are common cause of recurrent leak. Timing belt, water pump, all idlers should be replaced at the same time since engine is apart.',
    severity: 'high',
    confidence: 'high',
    symptoms: ['oil leak at head-block joint', 'burning oil smell', 'coolant loss (less common)', 'oil drip on exhaust'],
    affectedSystems: ['head gasket'],
    dtcCodes: [],
    estimatedCostLow: 1800,
    estimatedCostHigh: 3500,
    typicalMileageLow: 80000,
    typicalMileageHigh: 150000,
  },

  // === 9-7X (Chevy TrailBlazer rebadge) ===
  {
    id: 'saab-9-7x-fuel-level-sensor-recall',
    make: 'Saab',
    model: '9-7X',
    years: range(2005, 2009),
    trims: ['Linear', 'Arc', '4.2i', '5.3i', 'Aero'],
    engines: ['4.2L LL8 I6', '5.3L LH6 V8', '6.0L LS2 V8'],
    category: 'electrical',
    title: '9-7X / TrailBlazer Driver Power Window Switch Fire Recall (NHTSA 12V-413)',
    description: 'NHTSA recall 12V-413 covers 2006-2007 Saab 9-7X (along with 2006-2007 Chevy TrailBlazer, GMC Envoy, Buick Rainier, Isuzu Ascender) for a driver-side master power window switch that can short and start a fire. Multiple in-service fires reported. ~278,000 vehicles affected; GM eventually expanded to other model years.',
    solution: 'Check VIN at NHTSA recalls lookup (12V-413 and successors). Dealer replaces the switch and waterproofs the connector at no cost. If you smell burning plastic from the driver door, do not operate the window — get the recall fix scheduled immediately.',
    severity: 'critical',
    confidence: 'high',
    symptoms: ['burning smell from driver door', 'window switch hot', 'window inoperative', 'short circuit'],
    affectedSystems: ['power window switch', 'electrical'],
    dtcCodes: [],
    estimatedCostLow: 0,
    estimatedCostHigh: 0,
    typicalMileageLow: 0,
    typicalMileageHigh: 999999,
  },

  // === Classic 900 - sliding door ===
  {
    id: 'saab-900-classic-windshield-frame-rust',
    make: 'Saab',
    model: '900',
    years: range(1990, 1993),
    trims: ['S', 'SE', 'Turbo', 'Turbo Convertible', 'SPG'],
    engines: ['all'],
    category: 'body',
    title: 'Classic 900 (1979-1993) Windshield Frame & Rear Wheel Arch Rust',
    description: 'Classic 900 (1979-1993) is notorious for rust at the windshield frame corners (especially below the trim moldings), the rear wheel arches, and the floor pan under the carpet. Once visible, rust is usually already advanced because the inner structure rots first. Salt-belt cars commonly have structural rust by 25+ years old.',
    solution: 'Annual inspection at the windshield frame (lift the trim moldings) and rear wheel arches. Treatment of pinhole rust early ($200-$500) is far cheaper than structural repair ($1,500-$5,000) once advanced. Convertibles have additional rust at the chassis stiffening members. SaabClub specialists in the US Northeast offer body restoration packages.',
    severity: 'high',
    confidence: 'high',
    symptoms: ['rust bubbles around windshield', 'rear arch rust', 'wet carpet (floor pan rust)', 'crumbling door bottoms'],
    affectedSystems: ['body', 'chassis'],
    dtcCodes: [],
    estimatedCostLow: 200,
    estimatedCostHigh: 6000,
    typicalMileageLow: 0,
    typicalMileageHigh: 999999,
  },

  // === 9-3 / 9-5 — coil pack vs DIC ===
  {
    id: 'saab-9-3-second-gen-control-arm-bushings',
    make: 'Saab',
    model: '9-3',
    years: range(2003, 2011),
    trims: ['Linear', 'Arc', 'Vector', 'Aero'],
    engines: ['all'],
    category: 'suspension',
    title: '9-3 Second-Gen Front Lower Control Arm Bushing Failure',
    description: 'Second-gen 9-3 (Epsilon platform) front lower control arm rear (large) bushings wear and tear by 60,000-100,000 miles. Symptoms: clunking over bumps, steering wander, vibration through wheel, uneven tire wear. Saab supplies the bushing only as part of the entire control arm (not separately), so many independents replace the whole arm.',
    solution: 'Replace lower control arms as a pair (Lemförder OEM ~$120-$200 each, plus $200-$400 labor). DIY-friendly with a spring compressor and basic tools. Polyurethane aftermarket bushings (Powerflex) are more durable but transmit more NVH. Get a 4-wheel alignment after the job.',
    severity: 'medium',
    confidence: 'high',
    symptoms: ['clunking over bumps', 'steering wander', 'vibration', 'uneven front tire wear'],
    affectedSystems: ['suspension'],
    dtcCodes: [],
    estimatedCostLow: 300,
    estimatedCostHigh: 800,
    typicalMileageLow: 60000,
    typicalMileageHigh: 130000,
  },
];

async function main() {
  console.log(`═══════════════════════════════════════════════════════════`);
  console.log(`  Add Saab Issues to pending_review`);
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
  console.log(`\nNext: node scripts/list-pending-issues.js --make Saab`);
  await pool.end();
}

main().catch(err => { console.error('Fatal:', err); pool.end(); process.exit(1); });
