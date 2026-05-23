#!/usr/bin/env node
/**
 * Add CUPRA known issues via audit-before-publish gate.
 *
 * CUPRA is a young brand (2018-) so issue catalog is small. Shares
 * platforms with VW Group (MQB, MEB) — most issues mirror VW/SEAT
 * versions of the same platforms.
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const { insertPendingIssue, issueExists } = require('./lib/insert-known-issue');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.on('error', () => {});

function range(s, e) { const a = []; for (let y = s; y <= e; y++) a.push(y); return a; }

const ISSUES = [
  {
    id: 'cupra-formentor-2.0-tsi-ea888-gen4-chain',
    make: 'CUPRA', model: 'Formentor', years: range(2020, 2022),
    trims: ['VZ', 'VZ5', 'VZN'],
    engines: ['2.0 TSI (EA888 Gen 4)'],
    category: 'engine',
    title: 'Formentor 2.0 TSI EA888 Gen 4 Early-Production Timing Chain',
    description: 'Early-production Formentor 2.0 TSI (EA888 Gen 4) shows isolated reports of timing chain tensioner issues — milder pattern than the well-known Gen 1/2 chain-stretch saga but worth knowing about. VW Group revised tensioner spec mid-2022. Cold-start rattle that lasts more than 2-3 seconds is the warning.',
    solution: 'Diagnose carefully — most rattles in this engine are NOT chain (more often the high-pressure fuel pump tappet noise). If chain confirmed, replacement is dealer-only and €1,200-€2,500. Check warranty status — many cars still within Stellantis-era brand-warranty coverage.',
    severity: 'high', confidence: 'low',
    symptoms: ['cold start rattle', 'check engine light', 'misfire'],
    affectedSystems: ['timing chain', 'HPFP'],
    dtcCodes: ['P0016', 'P0017'],
    estimatedCostLow: 1200, estimatedCostHigh: 2500,
    typicalMileageLow: 40000, typicalMileageHigh: 120000,
  },
  {
    id: 'cupra-born-12v-infotainment-glitches',
    make: 'CUPRA', model: 'Born', years: range(2022, 2025),
    trims: ['Aurora Blue', 'V', 'VZ', 'e-Boost'],
    engines: ['Electric'],
    category: 'electrical',
    title: 'Born 12V Drain + MIB3 Infotainment Glitches (Shared with VW ID.3)',
    description: 'The Born (MEB platform, shared with VW ID.3/ID.4/Cupra Tavascan) has documented 12V auxiliary battery drain plus MIB3 infotainment glitches: screen freezes, system reboots while driving, slow voice response, intermittent CarPlay/Android Auto, ambient lighting glitches. VW Group rolled multiple software releases (3.0, 3.2, 4.0) addressing different subsets.',
    solution: 'Ensure latest software (dealer check; some via OTA on newer cars). Hard-reset infotainment by holding power button 10+ seconds. 12V replacement covered under warranty for many VINs — request inspection.',
    severity: 'medium', confidence: 'high',
    symptoms: ['screen freezes', 'reboots', 'dead 12V', 'CarPlay drops'],
    affectedSystems: ['infotainment', '12V battery', 'BCM'],
    dtcCodes: [],
    estimatedCostLow: 0, estimatedCostHigh: 400,
    typicalMileageLow: 0, typicalMileageHigh: 80000,
  },
  {
    id: 'cupra-ateca-dq381-wet-clutch',
    make: 'CUPRA', model: 'Ateca', years: range(2018, 2024),
    trims: ['VZ', 'VZN', '2.0 TSI 4Drive'],
    engines: ['2.0 TSI (EA888 Gen 3)'],
    category: 'transmission',
    title: 'Ateca DSG DQ381 (Wet-Clutch) Shudder / Hesitation',
    description: 'The DQ381 7-speed wet-clutch DSG used in CUPRA Ateca (and Formentor 4Drive, Tiguan, Tarraco) develops shudder during low-speed maneuvering and hesitation when pulling away. Different DTC family from the DQ200 dry-clutch (P1735/P1736 vs P176B). Often improves significantly with a fresh oil + filter service.',
    solution: 'DSG oil + filter service (Mileage-based at 60,000 km; many service plans miss it) €180-€280 at independent. Severe shudder may need mechatronic refresh or new clutch packs (€1,200-€2,500).',
    severity: 'medium', confidence: 'medium',
    symptoms: ['shudder', 'hesitation', 'jerky low-speed shifts'],
    affectedSystems: ['DSG', 'mechatronic', 'wet clutch'],
    dtcCodes: ['P1735', 'P1736'],
    estimatedCostLow: 180, estimatedCostHigh: 2500,
    typicalMileageLow: 50000, typicalMileageHigh: 120000,
  },
  {
    id: 'cupra-leon-mk3-dq250-mechatronic',
    make: 'CUPRA', model: 'Leon', years: range(2018, 2020),
    trims: ['Cupra', 'Cupra R', 'Cupra ST'],
    engines: ['2.0 TSI (EA888 Gen 3)'],
    category: 'transmission',
    title: 'Leon Mk3 Cupra DQ250 6-Speed DSG Mechatronic',
    description: 'The 6-speed wet-clutch DQ250 DSG used in late Leon Mk3 Cupra (and Golf R/Audi S3 of the same era) is more robust than DQ200/DQ381 but does suffer mechatronic valve-body failures at high mileage. Symptoms: refusal to engage gears when hot, P0841/P0846 pressure-related codes.',
    solution: 'DSG service every 60,000 km (oil + filter) €200-€350 — non-optional for longevity. Mechatronic refurb €1,400-€2,200, full replacement €2,500-€3,500. Many owners report transmission lasts 200,000+ km with strict service.',
    severity: 'high', confidence: 'medium',
    symptoms: ['will not engage', 'limp mode', 'hot weather shifting issues'],
    affectedSystems: ['DSG', 'mechatronic'],
    dtcCodes: ['P0841', 'P0846', 'P189C'],
    estimatedCostLow: 200, estimatedCostHigh: 3500,
    typicalMileageLow: 100000, typicalMileageHigh: 200000,
  },
  {
    id: 'cupra-formentor-phev-12v-charging',
    make: 'CUPRA', model: 'Formentor', years: range(2021, 2024),
    trims: ['e-Hybrid'],
    engines: ['1.4 TSI PHEV', '1.5 TSI PHEV'],
    category: 'electrical',
    title: 'Formentor e-Hybrid Charging Port + 12V Issues',
    description: 'The Formentor e-Hybrid (PHEV) — shared platform with VW Tiguan eHybrid, Skoda Octavia iV, SEAT Leon e-Hybrid — has had documented charging-port latch failures and 12V auxiliary drain during long parking when HV battery is depleted. Pattern across the MQB Evo PHEV family.',
    solution: 'Update vehicle software (dealer check; some markets had recall). Use a 12V battery maintainer for parked stretches over 1 week. Charging port latch under warranty for early VINs — file a claim.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['will not charge', 'charging port stuck', 'dead 12V'],
    affectedSystems: ['charging port', '12V battery'],
    dtcCodes: [],
    estimatedCostLow: 0, estimatedCostHigh: 600,
    typicalMileageLow: 0, typicalMileageHigh: 80000,
  },
  {
    id: 'cupra-born-thermal-management',
    make: 'CUPRA', model: 'Born', years: range(2022, 2024),
    trims: ['V', 'VZ', 'e-Boost'],
    engines: ['Electric'],
    category: 'cooling',
    title: 'Born Thermal Management Software — Fast-Charge Throttling',
    description: 'Born (and twin VW ID.3) has reported HV battery thermal-management oddities: aggressive throttling of DC fast-charging in cold OR hot weather conditions, sometimes preventing peak charge rates well below rated thresholds. Multiple software releases (3.x → 4.x) have improved behavior but the heat-pump option fares better than resistive heat.',
    solution: 'Update software to 4.x (some via OTA, some dealer-only). Pre-condition battery before fast-charging using nav route planning. Confirm whether your VIN was built with heat-pump option (better thermal range).',
    severity: 'low', confidence: 'low',
    symptoms: ['slow DC fast charging', 'battery temperature warnings', 'reduced charge rate'],
    affectedSystems: ['HV battery', 'thermal management'],
    dtcCodes: [],
    estimatedCostLow: 0, estimatedCostHigh: 200,
    typicalMileageLow: 0, typicalMileageHigh: 80000,
  },
  {
    id: 'cupra-ateca-haldex-coupling',
    make: 'CUPRA', model: 'Ateca', years: range(2018, 2024),
    trims: ['VZ', 'VZN', '2.0 TSI 4Drive', '300hp'],
    engines: ['2.0 TSI (EA888 Gen 3)'],
    category: 'drivetrain',
    title: 'Ateca 4Drive Haldex 5 Coupling Service / Wear',
    description: 'The Haldex 5 coupling on CUPRA Ateca 4Drive (shared with SEAT Tarraco AWD, VW Tiguan AWD, Audi Q3 quattro) needs scheduled fluid + filter service every 60,000 km. Skipping it causes coupling wear, AWD warning light, and eventually loss of rear drive (defaults to FWD). Often missed because Haldex isn\'t in main service interval.',
    solution: 'Haldex oil + filter service €120-€220 at independent (€280-€400 dealer). Neglected couplings may need refresh (€600-€1,000) or replacement (€1,200-€1,800).',
    severity: 'medium', confidence: 'high',
    symptoms: ['rear drive intermittent', 'AWD warning light', 'jerky AWD engagement'],
    affectedSystems: ['Haldex', 'AWD coupling'],
    dtcCodes: [],
    estimatedCostLow: 120, estimatedCostHigh: 1800,
    typicalMileageLow: 60000, typicalMileageHigh: 200000,
  },
  {
    id: 'cupra-mqb-electric-handbrake',
    make: 'CUPRA', model: 'Formentor', years: range(2020, 2024),
    trims: ['V1', 'V2', 'VZ'],
    engines: ['1.5 TSI', '2.0 TSI'],
    category: 'brakes',
    title: 'Formentor MQB Evo Electric Parking Brake Actuator Failure',
    description: 'The electric parking brake actuators (one per rear caliper) on MQB Evo platform — used across CUPRA Formentor/Leon/Ateca, SEAT Leon Mk4, VW Golf Mk8, Audi A3 8Y — can fail with a sudden grinding noise or refuse to release. Symptoms: brake warning light, "Parking brake fault", inability to drive away.',
    solution: 'Single actuator replacement €250-€450 incl. coding. If both fail at similar mileage (common), replacing as a pair is more cost-effective. Use the manual emergency release procedure (button in console + key) to free the car if stuck.',
    severity: 'high', confidence: 'medium',
    symptoms: ['parking brake fault', 'will not release', 'grinding from caliper'],
    affectedSystems: ['parking brake', 'rear caliper'],
    dtcCodes: ['C1080', 'C108F'],
    estimatedCostLow: 250, estimatedCostHigh: 900,
    typicalMileageLow: 40000, typicalMileageHigh: 120000,
  },
];

async function main() {
  console.log(`\n  CUPRA — inserting ${ISSUES.length} drafts as pending_review\n`);
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
