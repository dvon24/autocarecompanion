#!/usr/bin/env node
/**
 * Add SEAT known issues via audit-before-publish gate.
 * SEAT shares platforms with VW Group — many issues mirror VW Polo/Golf/Tiguan.
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const { insertPendingIssue, issueExists } = require('./lib/insert-known-issue');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.on('error', () => {});

function range(s, e) { const a = []; for (let y = s; y <= e; y++) a.push(y); return a; }

const ISSUES = [
  {
    id: 'seat-ibiza-leon-1.2-tsi-ea111-chain',
    make: 'SEAT', model: 'Ibiza', years: range(2010, 2015),
    trims: ['Reference', 'Style', 'Sport', 'FR'],
    engines: ['1.2 TSI (EA111 CBZA/CBZB)'],
    category: 'engine',
    title: 'Ibiza 1.2 TSI (EA111) Timing Chain Stretch',
    description: 'The EA111 1.2 TSI in Ibiza Mk4 (and Polo, Fabia, Audi A1) suffers timing chain stretch with the original tensioner design. Symptoms appear from 60,000-100,000 km: cold-start rattle, P0016/P0017 cam-crank correlation codes, eventual chain skip causing valve-piston contact. VW Group issued tensioner updates but the underlying chain wear remains. The newer EA211 1.2 TSI replaced this from ~2014 with belt drive — does NOT have the issue.',
    solution: 'Updated tensioner is a stopgap (~€200-€350 fitted). Full chain kit (chain, tensioner, guides) €700-€1,200. Some independents recommend replacement at 80,000 km regardless of symptoms. Use VW 504.00/507.00 oil at 10,000 km max.',
    severity: 'critical', confidence: 'high',
    symptoms: ['cold start rattle', 'check engine light', 'misfire', 'limp mode'],
    affectedSystems: ['timing chain'],
    dtcCodes: ['P0008', 'P0009', 'P0016', 'P0017'],
    estimatedCostLow: 200, estimatedCostHigh: 1500,
    typicalMileageLow: 60000, typicalMileageHigh: 100000,
  },
  {
    id: 'seat-leon-2.0-tfsi-ea888-gen2-oil',
    make: 'SEAT', model: 'Leon', years: range(2005, 2012),
    trims: ['FR', 'Cupra', 'Cupra R'],
    engines: ['2.0 TFSI (EA888 Gen 1/2 CCZA/CCZB)'],
    category: 'engine',
    title: 'Leon Mk2 2.0 TFSI (EA888 Gen 1/2) Oil Consumption',
    description: 'EA888 Gen 1 and Gen 2 2.0 TFSI engines in Leon Mk2 (and Golf Mk6 GTI, Audi A4 B8, Audi A5 B8) are notorious for oil consumption — typically 1L per 1,500-3,000 km past 80,000 km. Root cause is piston-ring design (low-tension oil-control rings) + PCV valve issues. VW issued an extended warranty in some markets covering piston replacement.',
    solution: 'Piston/ring replacement is the durable fix (€2,500-€4,500). Check service-history records for VW extended warranty action — eligible cars get the work free. Top-up between services and use 5W-40 VW 502.00 spec (better than 5W-30 for these engines).',
    severity: 'high', confidence: 'high',
    symptoms: ['oil consumption', 'oil warning between services', 'blue smoke', 'fouled plugs'],
    affectedSystems: ['piston rings', 'PCV valve'],
    dtcCodes: [],
    estimatedCostLow: 100, estimatedCostHigh: 4500,
    typicalMileageLow: 80000, typicalMileageHigh: 200000,
  },
  {
    id: 'seat-leon-mk3-2.0-tsi-carbon',
    make: 'SEAT', model: 'Leon', years: range(2012, 2020),
    trims: ['FR', 'Cupra'],
    engines: ['2.0 TSI (EA888 Gen 3)'],
    category: 'engine',
    title: 'Leon Mk3 2.0 TSI (EA888 Gen 3) Intake Valve Carbon Buildup',
    description: 'Direct-injection EA888 Gen 3 2.0 TSI engines (Leon Cupra, Tiguan, Golf R) accumulate carbon on intake valves because fuel never washes the valves — port injection (which detergent fuels would clean) is absent. Symptoms appear 80,000-130,000 km: rough idle, misfire codes, reduced economy, sometimes failed emissions tests.',
    solution: 'Walnut-blast intake valves €350-€650 (specialist tool needed — most independents subcontract). Some catch-cans help slow accumulation. Use top-tier petrol; oil-spec adherence (VW 504.00) matters. Avoid extended short-trip duty.',
    severity: 'medium', confidence: 'high',
    symptoms: ['rough idle', 'misfire', 'reduced power', 'emissions failure'],
    affectedSystems: ['intake valves', 'cylinder head'],
    dtcCodes: ['P0300', 'P0301', 'P0302'],
    estimatedCostLow: 350, estimatedCostHigh: 700,
    typicalMileageLow: 80000, typicalMileageHigh: 130000,
  },
  {
    id: 'seat-dsg-dq200-mechatronic',
    make: 'SEAT', model: 'Ibiza', years: range(2008, 2020),
    trims: ['Style', 'FR', 'Xcellence'],
    engines: ['1.2 TSI', '1.4 TSI', '1.6 TDI'],
    category: 'transmission',
    title: 'DSG DQ200 (7-Speed Dry Clutch) Mechatronic Failure',
    description: 'The DQ200 7-speed dry-clutch DSG used in SEAT Ibiza, Leon, Arona, Toledo, Mii (and across VW Group small cars) is well-documented for mechatronic failures — typically jerky shifts, refusal to engage drive/reverse, or limp mode with P189C/P176B/P17D8. Onset 60,000-130,000 km. The dry-clutch packs themselves also wear, often by 80,000-150,000 km.',
    solution: 'Mechatronic replacement (refurbished unit + coding) €900-€1,800; new €2,000-€3,000. Dry clutch pack replacement €1,200-€2,000. Some markets had VW extended-warranty coverage — check records. Avoid riding the brake on inclines (DQ200 hates it).',
    severity: 'high', confidence: 'high',
    symptoms: ['jerky shifts', 'refusal to engage', 'limp mode', 'shudder'],
    affectedSystems: ['DSG', 'mechatronic', 'clutch pack'],
    dtcCodes: ['P176B', 'P17D8', 'P189C', 'P17BF'],
    estimatedCostLow: 900, estimatedCostHigh: 3000,
    typicalMileageLow: 60000, typicalMileageHigh: 130000,
  },
  {
    id: 'seat-leon-mk2-2.0-tdi-pd-injectors',
    make: 'SEAT', model: 'Leon', years: range(2005, 2010),
    trims: ['Reference', 'Style', 'FR'],
    engines: ['2.0 TDI PD (BKD)'],
    category: 'engine',
    title: 'Leon Mk2 2.0 TDI PD (BKD) Injector Failure',
    description: 'The BKD 2.0 TDI Pump-Düse engine in Leon Mk2 (and Golf Mk5, Passat B6, Audi A3 8P) suffers PD injector failure, particularly on long-life servicing. Failure modes: misfire on one cylinder, hard starting, white smoke, sooty exhaust. Often accompanied by cracked cylinder head between #2 and #3 due to local overheating.',
    solution: 'Single injector replacement €400-€700 incl. coding. Full set (4) €1,400-€2,000. If head crack present, head rebuild adds €1,200-€2,000 more. Use VW 507.00 oil at 10,000 km max, NOT long-life intervals.',
    severity: 'high', confidence: 'high',
    symptoms: ['misfire cold', 'hard start', 'white smoke', 'rough idle'],
    affectedSystems: ['injectors', 'cylinder head'],
    dtcCodes: ['P0201', 'P0202', 'P0203', 'P0204', 'P0263', 'P0266', 'P0269', 'P0272'],
    estimatedCostLow: 400, estimatedCostHigh: 4000,
    typicalMileageLow: 100000, typicalMileageHigh: 200000,
  },
  {
    id: 'seat-alhambra-tailgate-struts',
    make: 'SEAT', model: 'Alhambra', years: range(2010, 2020),
    trims: ['Reference', 'Style', 'Xcellence'],
    engines: ['all'],
    category: 'body',
    title: 'Alhambra Mk2 Tailgate Gas Strut Failure',
    description: 'The 2010-2020 Alhambra Mk2 (and twin VW Sharan) tailgate gas struts weaken at 4-6 years, leaving the heavy tailgate either unable to stay up or slowly closing on heads/fingers. The electric-tailgate variant is more expensive to repair because the strut integrates with the motor module.',
    solution: 'Manual-strut pair replacement €60-€120 in parts, 15-30 min DIY. Electric tailgate module €350-€600 per side. Use the manual override (button on inside of tailgate) if a strut fails suddenly — don\'t rely on the remaining one.',
    severity: 'low', confidence: 'high',
    symptoms: ['tailgate drops', 'tailgate will not stay up', 'tailgate slow'],
    affectedSystems: ['tailgate', 'gas struts'],
    dtcCodes: [],
    estimatedCostLow: 60, estimatedCostHigh: 1200,
    typicalMileageLow: 40000, typicalMileageHigh: 200000,
  },
  {
    id: 'seat-leon-mk3-cupra-haldex',
    make: 'SEAT', model: 'Leon', years: range(2014, 2020),
    trims: ['Cupra', 'Cupra R', 'Cupra ST'],
    engines: ['2.0 TSI (EA888 Gen 3)'],
    category: 'drivetrain',
    title: 'Leon Mk3 Cupra 4Drive Haldex Coupling Service / Oil',
    description: 'The 4Drive (Haldex 5) coupling on Leon Mk3 Cupra ST 4Drive (and Tiguan, Tarraco, Ateca AWD) needs scheduled fluid and filter service every 60,000 km. Skipping it causes coupling wear, jerky engagement, and eventual loss of rear drive (defaults to FWD). Service is often missed because Haldex isn\'t in the main service interval display.',
    solution: 'Haldex oil + filter service €120-€220 at independent (€280-€400 dealer). Once neglected for 100,000 km+, coupling refresh or replacement may be needed (€600-€1,400). Check whether prior owners did the service — often skipped.',
    severity: 'medium', confidence: 'high',
    symptoms: ['rear drive intermittent', 'jerky AWD engagement', 'AWD warning light'],
    affectedSystems: ['Haldex', 'AWD coupling'],
    dtcCodes: [],
    estimatedCostLow: 120, estimatedCostHigh: 1400,
    typicalMileageLow: 60000, typicalMileageHigh: 200000,
  },
  {
    id: 'seat-ibiza-leon-1.6-tdi-cr-injectors',
    make: 'SEAT', model: 'Ibiza', years: range(2009, 2020),
    trims: ['Reference', 'Style', 'FR', 'Xcellence'],
    engines: ['1.6 TDI (CAYC/DGTE)'],
    category: 'engine',
    title: 'Ibiza / Leon 1.6 TDI Common-Rail Injector Failure',
    description: 'The 1.6 TDI common-rail engine in Ibiza Mk4/5, Leon Mk2/3 (and across VW Group small diesels) suffers Bosch injector failure typically at 100,000-180,000 km. Symptoms: rough cold start, individual-cylinder misfire, sometimes back-leak overwhelming the rail pressure regulator. Injector copper washers often re-seal poorly after the first removal.',
    solution: 'Back-leak test (10 min) confirms diagnosis. Single injector replacement €300-€600 incl. coding. Full set (4) €1,000-€1,800. Use VW 507.00 spec oil and quality diesel from major-brand stations.',
    severity: 'high', confidence: 'medium',
    symptoms: ['rough cold start', 'misfire', 'limp mode', 'fuel smell'],
    affectedSystems: ['injectors', 'common rail'],
    dtcCodes: ['P0201', 'P0202', 'P0203', 'P0204', 'P1240'],
    estimatedCostLow: 300, estimatedCostHigh: 1800,
    typicalMileageLow: 100000, typicalMileageHigh: 180000,
  },
  {
    id: 'seat-leon-cordoba-window-regulator',
    make: 'SEAT', model: 'Leon', years: range(2005, 2012),
    trims: ['Reference', 'Style', 'Sport', 'FR'],
    engines: ['all'],
    category: 'electrical',
    title: 'Leon Mk2 Electric Window Regulator Cable Failure',
    description: 'The front and rear electric window regulators on Leon Mk2 (also Ibiza Mk4 / Toledo Mk3 — shared parts) use a plastic cable-pulley design that snaps after 60,000-100,000 km. Symptoms: window drops into door, motor whirrs but no movement, or window stuck part-open in rain. Common enough that pattern replacement kits are sold cheaply.',
    solution: 'Replacement regulator kit (cables + plastic clips) €40-€80 in parts; €150-€300 incl. labor. DIY is straightforward (door card off, 4 bolts) but takes care to align cable runs. OEM regulators last longer than the cheapest pattern parts.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['window dropped', 'window motor whirring', 'window stuck'],
    affectedSystems: ['electric windows'],
    dtcCodes: [],
    estimatedCostLow: 150, estimatedCostHigh: 350,
    typicalMileageLow: 60000, typicalMileageHigh: 150000,
  },
  {
    id: 'seat-ateca-tarraco-2.0-tsi-water-pump',
    make: 'SEAT', model: 'Ateca', years: range(2016, 2022),
    trims: ['FR', 'Xcellence', 'Anniversary'],
    engines: ['2.0 TSI (EA888 Gen 3)'],
    category: 'cooling',
    title: 'Ateca 2.0 TSI Water Pump / Thermostat Failure',
    description: 'The EA888 Gen 3 2.0 TSI water pump is a plastic-housing assembly integrating the thermostat. The plastic housing cracks at the seam typically 70,000-130,000 km, causing coolant loss, sweet smell, and overheating. Same part used across SEAT Ateca/Tarraco, VW Tiguan, Audi Q3, Skoda Kodiaq.',
    solution: 'Complete water pump + thermostat module replacement €400-€700 incl. labor and coolant. Use VW G13 coolant (pink, do not mix with G12++ green-pink) and bleed properly — air locks are common.',
    severity: 'high', confidence: 'high',
    symptoms: ['coolant loss', 'sweet smell', 'overheating', 'temperature warning'],
    affectedSystems: ['cooling system', 'water pump', 'thermostat'],
    dtcCodes: ['P0128', 'P0217', 'P2181'],
    estimatedCostLow: 400, estimatedCostHigh: 800,
    typicalMileageLow: 70000, typicalMileageHigh: 130000,
  },
  {
    id: 'seat-leon-mk2-1.4-tsi-twincharger-chain',
    make: 'SEAT', model: 'Leon', years: range(2007, 2012),
    trims: ['Reference', 'Style', 'FR'],
    engines: ['1.4 TSI Twincharger (EA111 CAVD)'],
    category: 'engine',
    title: 'Leon Mk2 1.4 TSI Twincharger Timing Chain + Supercharger',
    description: 'The CAVD 1.4 TSI Twincharger (supercharger + turbo) in Leon Mk2 / Golf Mk6 / Scirocco / Touran is double-trouble: the EA111 timing-chain stretch issue AND supercharger magnetic-clutch failure. Combined repair if both fail is among the most expensive on the platform.',
    solution: 'Chain kit €700-€1,200. Supercharger clutch repair €350-€700 (rebuild) or new pulley €600-€1,000. Many independents recommend ditching the supercharger if budget-limited (remap removes its operation) — power drops but reliability improves.',
    severity: 'critical', confidence: 'high',
    symptoms: ['cold start rattle', 'whine from supercharger', 'limp mode', 'reduced power'],
    affectedSystems: ['timing chain', 'supercharger'],
    dtcCodes: ['P0016', 'P0017', 'P2279'],
    estimatedCostLow: 700, estimatedCostHigh: 3000,
    typicalMileageLow: 60000, typicalMileageHigh: 130000,
  },
  {
    id: 'seat-mii-electric-12v-drain',
    make: 'SEAT', model: 'Mii', years: range(2020, 2021),
    trims: ['Electric'],
    engines: ['Electric'],
    category: 'electrical',
    title: 'Mii Electric 12V Auxiliary Battery Drain (Shared with VW e-Up)',
    description: 'The Mii Electric (and twin VW e-Up, Skoda Citigo-e iV) drains the 12V auxiliary battery during long parking — same pattern as other small EVs. Owner forums and VW Group TSBs cover both software-update fixes and 12V battery replacement under warranty for some build dates.',
    solution: 'Update vehicle software (dealer; some markets covered by recall). Use a 12V battery maintainer for parked stretches over 1 week. AGM 12V replacement €120-€200 + €50-€100 coding.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['will not wake', 'will not charge', 'dead 12V'],
    affectedSystems: ['12V battery', 'BCM'],
    dtcCodes: [],
    estimatedCostLow: 0, estimatedCostHigh: 350,
    typicalMileageLow: 0, typicalMileageHigh: 100000,
  },
];

async function main() {
  console.log(`\n  SEAT — inserting ${ISSUES.length} drafts as pending_review\n`);
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
