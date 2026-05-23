#!/usr/bin/env node
/**
 * Add Opel known issues — German market launch.
 *
 * Uses the audit-before-publish gate (insertPendingIssue) — every entry
 * lands as status='pending_review', invisible to the live site until
 * verified via WebSearch + flipped by publish-verified-issues.js.
 *
 * Workflow:
 *   1. node scripts/add-opel-issues.js
 *   2. node scripts/list-pending-issues.js --make Opel
 *   3. (audit each via WebSearch in conversation)
 *   4. apply fix scripts for any that need corrections
 *   5. node scripts/publish-verified-issues.js --all-make Opel --apply
 *
 * Source bias: only well-documented mass-market Opel issues that surface
 * in Vauxhall (UK rebadge) and Opel forums + UK safety recall registers.
 * No speculative entries — the gate exists so the cost of being wrong is
 * low, but starting clean is still better.
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
  // === Astra ===
  {
    id: 'opel-astra-h-water-pump-z16xep',
    make: 'Opel',
    model: 'Astra',
    years: range(2004, 2010),
    trims: ['Selection', 'Edition', 'Cosmo', 'Sport'],
    engines: ['1.6 Twinport (Z16XEP)', '1.8 (Z18XER)'],
    category: 'cooling',
    title: 'Astra H Water Pump Failure (Z16XEP / Z18XER)',
    description: 'Astra H (2004-2010) with the Z16XEP 1.6 Twinport and Z18XER 1.8 engines commonly suffers water pump failure between 60,000-100,000 km. The plastic impeller cracks or the seal fails, causing coolant loss and overheating. Often co-fails with the thermostat housing (also plastic).',
    solution: 'Replace water pump with metal-impeller upgrade where available. Typical cost €200-€400 with timing belt service combined (recommended since timing belt access overlaps). Carry coolant onboard if symptoms developing.',
    severity: 'high',
    confidence: 'high',
    symptoms: ['coolant loss', 'overheating', 'sweet smell under hood', 'temperature gauge climbing'],
    affectedSystems: ['cooling system', 'thermostat housing'],
    dtcCodes: ['P0128', 'P0217'],
    estimatedCostLow: 200,
    estimatedCostHigh: 600,
    typicalMileageLow: 60000,
    typicalMileageHigh: 100000,
  },
  {
    id: 'opel-astra-j-1.7-cdti-egr-clog',
    make: 'Opel',
    model: 'Astra',
    years: range(2009, 2015),
    trims: ['Selection', 'Edition', 'Cosmo', 'Sport'],
    engines: ['1.7 CDTI (A17DTR/A17DTS)'],
    category: 'engine',
    title: 'Astra J 1.7 CDTI EGR Valve Clogging',
    description: 'The A17DTR/A17DTS 1.7 CDTI diesel in Astra J (2009-2015), Mokka A, and Meriva B suffers severe EGR valve carbon buildup, typically presenting between 80,000-150,000 km. Symptoms include power loss, limp mode, and rough idle. The EGR cooler can also crack, mixing coolant with intake flow.',
    solution: 'EGR valve clean or replacement (€400-€800 incl. labor). EGR delete is common but illegal in most markets and fails TÜV / MOT emissions tests. Walnut blasting helps the intake manifold simultaneously.',
    severity: 'high',
    confidence: 'high',
    symptoms: ['power loss', 'limp mode', 'rough idle', 'EML warning', 'black smoke'],
    affectedSystems: ['EGR', 'intake manifold'],
    dtcCodes: ['P0401', 'P0402', 'P0404', 'P0405'],
    estimatedCostLow: 400,
    estimatedCostHigh: 1200,
    typicalMileageLow: 80000,
    typicalMileageHigh: 150000,
  },
  {
    id: 'opel-astra-1.4-turbo-timing-chain',
    make: 'Opel',
    model: 'Astra',
    years: range(2009, 2018),
    trims: ['Selection', 'Edition', 'Cosmo', 'Sport', '120 Jahre'],
    engines: ['1.4 Turbo (A14NET)', '1.4 Turbo (A14NEL)'],
    category: 'engine',
    title: '1.4 Turbo (A14NET) Timing Chain Stretch',
    description: 'The A14NET 1.4 turbo engine in Astra J/K, Corsa D/E, Mokka A, and Adam suffers timing chain stretch typically between 80,000-140,000 km. Early symptoms include a rattle on cold start (1-3 seconds) that gradually extends. Left untreated, the chain can skip teeth causing valve-piston contact.',
    solution: 'Full timing chain kit replacement (chain, tensioner, guides, sprockets) — typically €900-€1,500. Catastrophic failure means engine rebuild or replacement (€4,000+). Stretching is detectable via misfire codes and chain rattle.',
    severity: 'critical',
    confidence: 'high',
    symptoms: ['cold start rattle', 'misfire', 'chain rattle', 'check engine light', 'limp mode'],
    affectedSystems: ['timing chain', 'valvetrain'],
    dtcCodes: ['P0008', 'P0009', 'P0016', 'P0017', 'P0300'],
    estimatedCostLow: 900,
    estimatedCostHigh: 4000,
    typicalMileageLow: 80000,
    typicalMileageHigh: 140000,
  },
  {
    id: 'opel-astra-h-rear-axle-corrosion',
    make: 'Opel',
    model: 'Astra',
    years: range(2004, 2010),
    trims: ['Selection', 'Edition', 'Cosmo', 'Sport'],
    engines: ['all'],
    category: 'suspension',
    title: 'Astra H Rear Torsion Beam Corrosion (Salt-Belt)',
    description: 'Astra H rear torsion beam axle corrodes from the inside out in salt-belt markets (Germany, UK, Scandinavia, US Northeast/Midwest). UK MOT testers have failed Astras for rear suspension corrosion at 8-15 years old. Once advanced, repair often requires full beam replacement as repair welding is unsafe.',
    solution: 'Inspect annually after age 8 in salt regions. Replacement rear beam €600-€1,200 + labor; refurbished beams available cheaper. Underseal proactively at 5 years if in salt region.',
    severity: 'high',
    confidence: 'high',
    symptoms: ['MOT failure', 'visible rust on rear beam', 'clunking from rear', 'tracking issues'],
    affectedSystems: ['rear suspension', 'subframe'],
    dtcCodes: [],
    estimatedCostLow: 600,
    estimatedCostHigh: 2000,
    typicalMileageLow: 80000,
    typicalMileageHigh: 200000,
  },

  // === Corsa ===
  {
    id: 'opel-corsa-d-handbrake-cable-corrosion',
    make: 'Opel',
    model: 'Corsa',
    years: range(2006, 2014),
    trims: ['Selection', 'Edition', 'Cosmo', 'Color Edition'],
    engines: ['all'],
    category: 'brakes',
    title: 'Corsa D Handbrake Cable Corrosion',
    description: 'Corsa D (2006-2014) handbrake cables corrode and can either seize or snap, causing parking-brake failure. UK Vauxhall issued multiple service actions on this. The cable runs under the car and is exposed to road salt spray. Common MOT failure point at 6-10 years old in salt regions.',
    solution: 'Replace handbrake cable assembly €120-€280 incl. labor. Apply anti-corrosion treatment to new cable. Always test parking brake at MOT and periodically — failure can be sudden.',
    severity: 'high',
    confidence: 'high',
    symptoms: ['handbrake travel increasing', 'handbrake not holding', 'snapped cable', 'MOT failure'],
    affectedSystems: ['parking brake'],
    dtcCodes: [],
    estimatedCostLow: 120,
    estimatedCostHigh: 350,
    typicalMileageLow: 60000,
    typicalMileageHigh: 150000,
  },
  {
    id: 'opel-corsa-d-stretched-timing-chain-1.2-1.4',
    make: 'Opel',
    model: 'Corsa',
    years: range(2006, 2014),
    trims: ['Selection', 'Edition', 'Cosmo', 'Color Edition'],
    engines: ['1.2 (A12XER/Z12XEP)', '1.4 (A14XER/Z14XEP)'],
    category: 'engine',
    title: 'Corsa D 1.2 / 1.4 Petrol Timing Chain Stretch',
    description: 'Naturally-aspirated 1.2 and 1.4 petrol engines in Corsa D (and Adam) suffer timing chain stretch — distinct from the A14NET turbo issue. Symptoms appear around 80,000-130,000 km: rattle on start, misfire codes, eventually limp mode. The shorter the oil-change interval, the slower the wear.',
    solution: 'Chain kit replacement (chain, tensioner, guides) typically €700-€1,200. Some independents will polish the existing sprockets; OEM kit is the durable fix. Use the correct Dexos2 oil (5W-30) and stick to 10,000 km intervals at most.',
    severity: 'critical',
    confidence: 'medium',
    symptoms: ['cold start rattle', 'misfire', 'engine warning light'],
    affectedSystems: ['timing chain'],
    dtcCodes: ['P0008', 'P0016', 'P0017', 'P0300'],
    estimatedCostLow: 700,
    estimatedCostHigh: 1500,
    typicalMileageLow: 80000,
    typicalMileageHigh: 130000,
  },
  {
    id: 'opel-corsa-e-electric-power-steering',
    make: 'Opel',
    model: 'Corsa',
    years: range(2014, 2019),
    trims: ['Selection', 'Edition', 'Cosmo'],
    engines: ['all'],
    category: 'steering',
    title: 'Corsa E Electric Power Steering Column Failure',
    description: 'Corsa E (2014-2019) EPS column motor/control unit can fail, causing sudden loss of power assistance. Some owners report total assistance loss while moving. UK Vauxhall extended warranty on this for some markets after volume of complaints.',
    solution: 'Replacement steering column assembly is the standard fix (€600-€1,200 dealer; some specialists offer refurb at €300-€500). Check service-history records for the extended-warranty action; some owners qualify for free or part-funded repair.',
    severity: 'high',
    confidence: 'medium',
    symptoms: ['power steering warning', 'sudden heavy steering', 'EPS light'],
    affectedSystems: ['electric power steering'],
    dtcCodes: ['C0545', 'U0131'],
    estimatedCostLow: 300,
    estimatedCostHigh: 1500,
    typicalMileageLow: 40000,
    typicalMileageHigh: 120000,
  },

  // === Insignia ===
  {
    id: 'opel-insignia-a-aisin-af40-shift-quality',
    make: 'Opel',
    model: 'Insignia',
    years: range(2008, 2017),
    trims: ['Edition', 'Cosmo', 'Sport', 'OPC', 'Country Tourer'],
    engines: ['2.0 Turbo', '2.0 CDTI', '2.8 Turbo V6'],
    category: 'transmission',
    title: 'Insignia A Aisin AF40 Harsh Shifts / Shudder',
    description: 'The Aisin AF40 6-speed automatic in Insignia A (2008-2017) develops harsh shifts, shudder during lock-up, and delayed engagement, typically by 100,000-160,000 km. Root cause is degraded ATF and worn solenoids; Opel\'s "lifetime fill" claim is widely disputed.',
    solution: 'Drain-and-fill ATF every 60,000 km using Aisin JWS3309 / Dexron VI-compatible fluid (~€150-€250 DIY). Solenoid pack replacement if shifts remain harsh (€500-€900). Full mechatronic / valve body rebuild €1,500-€2,500. Severe shudder may indicate torque converter wear.',
    severity: 'high',
    confidence: 'high',
    symptoms: ['harsh shifts', 'shudder at light throttle', 'delayed engagement', 'limp mode'],
    affectedSystems: ['transmission', 'torque converter'],
    dtcCodes: ['P0741', 'P0746', 'P0776'],
    estimatedCostLow: 150,
    estimatedCostHigh: 2500,
    typicalMileageLow: 100000,
    typicalMileageHigh: 160000,
  },
  {
    id: 'opel-insignia-a-2.0-cdti-egr-cooler-crack',
    make: 'Opel',
    model: 'Insignia',
    years: range(2008, 2015),
    trims: ['Edition', 'Cosmo', 'Sport', 'Country Tourer', 'Sports Tourer'],
    engines: ['2.0 CDTI (A20DT/A20DTH/A20DTR)'],
    category: 'cooling',
    title: 'Insignia A 2.0 CDTI EGR Cooler Crack (Coolant Loss into Intake)',
    description: 'The A20DT/A20DTH 2.0 CDTI EGR cooler develops internal cracks, allowing coolant to leak into the intake. Symptoms: white smoke from exhaust, mysterious coolant loss with no external leak, sweet smell, eventual no-start as cylinders flood. Common at 100,000-180,000 km. Same engine in Astra J, Zafira C, Cascada.',
    solution: 'EGR cooler replacement €600-€1,200 incl. labor. If coolant has been pulled into cylinders, hydrolock check required. Some independents recommend EGR delete + remap — illegal in most markets and disqualifies TÜV inspection.',
    severity: 'high',
    confidence: 'high',
    symptoms: ['white exhaust smoke', 'mysterious coolant loss', 'sweet smell', 'no start', 'P-codes'],
    affectedSystems: ['EGR cooler', 'cooling system', 'intake'],
    dtcCodes: ['P0401', 'P0402', 'P046C'],
    estimatedCostLow: 600,
    estimatedCostHigh: 1800,
    typicalMileageLow: 100000,
    typicalMileageHigh: 180000,
  },
  {
    id: 'opel-insignia-a-flexpipe-exhaust-failure',
    make: 'Opel',
    model: 'Insignia',
    years: range(2008, 2017),
    trims: ['Edition', 'Cosmo', 'Sport', 'Country Tourer', 'Sports Tourer'],
    engines: ['2.0 CDTI', '2.0 Turbo'],
    category: 'exhaust',
    title: 'Insignia A Flex-Pipe Exhaust Failure',
    description: 'Insignia A front exhaust flex section cracks/fractures around 80,000-150,000 km, especially on diesels. Produces loud rattling/blowing under acceleration, smell of fumes in cabin, and triggers a fault if the lambda sensor is downstream of the leak.',
    solution: 'Flex section can be cut out and replaced (independent specialist €120-€280) instead of buying the full front pipe. OEM full pipe €350-€600. Check downstream lambda sensor function after repair.',
    severity: 'medium',
    confidence: 'high',
    symptoms: ['exhaust rattle under load', 'loud blowing noise', 'fumes in cabin', 'EML'],
    affectedSystems: ['exhaust'],
    dtcCodes: ['P0420', 'P0430', 'P0171'],
    estimatedCostLow: 120,
    estimatedCostHigh: 600,
    typicalMileageLow: 80000,
    typicalMileageHigh: 150000,
  },

  // === Zafira ===
  {
    id: 'opel-zafira-b-fire-risk-heater-blower',
    make: 'Opel',
    model: 'Zafira',
    years: range(2005, 2014),
    trims: ['Selection', 'Edition', 'Cosmo', 'Sport'],
    engines: ['all'],
    category: 'safety',
    title: 'Zafira B Fire Risk — HVAC Blower Resistor (2015-2016 Recall)',
    description: 'Vauxhall/Opel issued a major safety recall in 2015-2016 for Zafira B (Mk2, 2005-2014) after dozens of vehicles caught fire. The blower-motor resistor pre-resistor and associated wiring could overheat and ignite. Many owners reported repeat fires after the initial recall fix; a second improved recall followed.',
    solution: 'Check VIN against Vauxhall/Opel recall database — both R/2015/116 and the follow-up action. If unsure whether your car has had BOTH fixes, request paperwork. Do not run the blower on continuous high if recall status is unknown.',
    severity: 'critical',
    confidence: 'high',
    symptoms: ['burning smell from vents', 'blower fault', 'cabin fire'],
    affectedSystems: ['HVAC', 'electrical'],
    dtcCodes: [],
    estimatedCostLow: 0,
    estimatedCostHigh: 0,
    typicalMileageLow: 0,
    typicalMileageHigh: 999999,
  },
  {
    id: 'opel-zafira-c-1.6-cdti-egr-cooler',
    make: 'Opel',
    model: 'Zafira',
    years: range(2013, 2019),
    trims: ['Selection', 'Tourer', 'Edition', 'Cosmo'],
    engines: ['1.6 CDTI (B16DTH "Whisper Diesel")'],
    category: 'cooling',
    title: 'Zafira Tourer 1.6 CDTI EGR Cooler Failure',
    description: 'The B16DTH "Whisper Diesel" 1.6 CDTI in Zafira Tourer (and shared Astra J/K) suffers EGR cooler failure with similar symptoms to the 2.0 CDTI: coolant disappearing, white smoke, and sweet smell. Typical onset 80,000-150,000 km.',
    solution: 'EGR cooler assembly replacement €550-€1,100. Check for coolant in oil (head gasket damage from hydrolock attempts). Use only Dex-Cool-compatible coolant (G12++) — mixed coolants accelerate failure.',
    severity: 'high',
    confidence: 'medium',
    symptoms: ['coolant loss', 'white smoke', 'sweet smell', 'sluggish performance'],
    affectedSystems: ['EGR cooler', 'cooling system'],
    dtcCodes: ['P0401', 'P046C'],
    estimatedCostLow: 550,
    estimatedCostHigh: 1500,
    typicalMileageLow: 80000,
    typicalMileageHigh: 150000,
  },

  // === Mokka ===
  {
    id: 'opel-mokka-a-1.7-cdti-water-pump',
    make: 'Opel',
    model: 'Mokka',
    years: range(2012, 2019),
    trims: ['Selection', 'Edition', 'Innovation', 'Color Edition'],
    engines: ['1.7 CDTI (A17DTS)'],
    category: 'cooling',
    title: 'Mokka A 1.7 CDTI Water Pump / Timing Belt Drive',
    description: 'The 1.7 CDTI water pump is timing-belt-driven in this engine. When the pump seizes or its impeller fails, the timing belt can be ejected — leading to valve damage. Failure typically appears between 80,000-130,000 km, often before the recommended belt service.',
    solution: 'Replace water pump WITH timing belt as a kit (€700-€1,100) rather than belt alone. Catastrophic pump failure with belt jump means head rebuild (€2,500+). Do the kit early if there\'s any whining or weeping from the pump.',
    severity: 'critical',
    confidence: 'medium',
    symptoms: ['coolant weep', 'belt area noise', 'sudden engine stall', 'no compression after pump seize'],
    affectedSystems: ['cooling system', 'timing belt'],
    dtcCodes: ['P0335', 'P0340'],
    estimatedCostLow: 700,
    estimatedCostHigh: 3000,
    typicalMileageLow: 80000,
    typicalMileageHigh: 130000,
  },

  // === Vivaro / Movano ===
  {
    id: 'opel-vivaro-b-1.6-biturbo-timing-chain',
    make: 'Opel',
    model: 'Vivaro',
    years: range(2014, 2019),
    trims: ['Combi', 'Tour', 'Cargo', 'Sportive'],
    engines: ['1.6 BiTurbo CDTI (R9M)'],
    category: 'engine',
    title: 'Vivaro B 1.6 BiTurbo CDTI (R9M) Timing Chain Stretch',
    description: 'The Renault-sourced R9M 1.6 BiTurbo CDTI used in Vivaro B (and Trafic III, Movano B) develops timing chain stretch, typically 100,000-180,000 km. Cold-start rattle, misfire codes, then potential chain skip causing valve damage. Particularly bad on stop-start fleet use without regular oil changes.',
    solution: 'Full chain kit (€1,200-€1,800) including chain, guides, tensioners, sprockets — full job often involves engine drop in vans due to tight clearance. Use C4-spec low-SAPS 5W-30 oil and shorten intervals to 15,000 km max for fleet/stop-start duty.',
    severity: 'critical',
    confidence: 'medium',
    symptoms: ['cold start rattle', 'misfire', 'loss of power', 'engine warning'],
    affectedSystems: ['timing chain'],
    dtcCodes: ['P0016', 'P0017', 'P0335'],
    estimatedCostLow: 1200,
    estimatedCostHigh: 4500,
    typicalMileageLow: 100000,
    typicalMileageHigh: 180000,
  },

  // === Crossland / Grandland (PSA-platform) ===
  {
    id: 'opel-crossland-1.2-puretech-oil-bath-belt',
    make: 'Opel',
    model: 'Crossland',
    years: range(2017, 2022),
    trims: ['Selection', 'Edition', 'Innovation', 'Elegance'],
    engines: ['1.2 PureTech Turbo (EB2DTS)'],
    category: 'engine',
    title: 'Crossland 1.2 PureTech "Wet" Timing Belt Disintegration',
    description: 'The PSA EB2DTS 1.2 PureTech 3-cylinder turbo uses an oil-immersed ("wet") timing belt that degrades on standard mineral or low-quality synthetic oil. Belt particles clog the oil pickup strainer, starving the engine of oil and causing catastrophic damage. Affects post-2017 Crossland (and Citroën, Peugeot, DS variants of the same engine).',
    solution: 'Use ONLY Stellantis-approved Total Quartz INEO First 0W-30 (or equivalent C2 spec). Replace belt at 100,000 km / 6 years — earlier than original schedule (Stellantis revised guidance multiple times). Oil pickup strainer should be inspected if belt is overdue. Catastrophic failure means engine replacement (€5,000+).',
    severity: 'critical',
    confidence: 'high',
    symptoms: ['oil pressure warning', 'engine knocking', 'belt debris in oil', 'sudden stall'],
    affectedSystems: ['timing belt', 'lubrication'],
    dtcCodes: ['P0524', 'P0521'],
    estimatedCostLow: 800,
    estimatedCostHigh: 6000,
    typicalMileageLow: 60000,
    typicalMileageHigh: 100000,
  },
  {
    id: 'opel-grandland-1.6-thp-timing-chain',
    make: 'Opel',
    model: 'Grandland',
    years: range(2017, 2021),
    trims: ['Selection', 'Edition', 'Innovation', 'Elegance', 'GS Line'],
    engines: ['1.6 Turbo (Prince/THP)'],
    category: 'engine',
    title: 'Grandland X 1.6 THP Timing Chain Stretch',
    description: 'The PSA/BMW "Prince" 1.6 THP engine in early Grandland X (2017-2021) suffers timing chain stretch, also documented across Peugeot 3008/5008 and Citroën C5 Aircross. Symptoms appear from 80,000 km. Same root cause as the well-documented MINI Cooper S timing chain issue from the same engine family.',
    solution: 'Chain kit replacement €1,200-€2,000. Stick to 10,000 km oil intervals with full-synthetic C2/C3. Listen for the characteristic "death rattle" on cold start — once consistent, replacement is urgent.',
    severity: 'critical',
    confidence: 'medium',
    symptoms: ['cold start rattle', 'misfire', 'oil consumption', 'EML'],
    affectedSystems: ['timing chain'],
    dtcCodes: ['P0016', 'P0017'],
    estimatedCostLow: 1200,
    estimatedCostHigh: 3500,
    typicalMileageLow: 80000,
    typicalMileageHigh: 150000,
  },

  // === Mokka-e / electrified ===
  {
    id: 'opel-mokka-e-12v-battery-drain',
    make: 'Opel',
    model: 'Mokka',
    years: range(2020, 2024),
    trims: ['Mokka-e', 'Electric'],
    engines: ['Electric'],
    category: 'electrical',
    title: 'Mokka-e 12V Auxiliary Battery Drain',
    description: 'Mokka-e (and the closely related Corsa-e, Peugeot e-208, DS 3 Crossback E-Tense — all CMP/eCMP platform) drains the 12V auxiliary battery during long parking spells, leaving the car unable to wake or charge. Stellantis acknowledged the issue and pushed multiple software updates between 2021-2024.',
    solution: 'Update vehicle software to latest (dealer check; some markets had recall). Apply a 12V battery maintainer for parked stretches > 1 week. If repeated drain after software update, request battery health test — defective 12V cells were replaced under warranty for some VINs.',
    severity: 'medium',
    confidence: 'high',
    symptoms: ['dead 12V', 'car will not wake', 'will not start HV system', 'will not begin charging'],
    affectedSystems: ['12V battery', 'BCM', 'charging system'],
    dtcCodes: [],
    estimatedCostLow: 0,
    estimatedCostHigh: 300,
    typicalMileageLow: 0,
    typicalMileageHigh: 100000,
  },
];

async function main() {
  console.log(`═══════════════════════════════════════════════════════════`);
  console.log(`  Add Opel Issues to pending_review`);
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
  console.log(`\nNext: node scripts/list-pending-issues.js --make Opel`);
  await pool.end();
}

main().catch(err => { console.error('Fatal:', err); pool.end(); process.exit(1); });
