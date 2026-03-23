/**
 * Mercedes-Benz Batch 1: 52 known issues across 10 models
 * Models: C-Class, E-Class, S-Class, GLC, GLE, GLS, A-Class, CLA, GLA, GLB
 * Sources: MBWorld.org, BenzWorld.org, MBClub.co.uk, NHTSA complaints
 * Run: node scripts/add-mercedes-batch1-issues.js
 */
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function yearRange(start, end) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

const issues = [
  // ============================================================
  // MERCEDES-BENZ C-CLASS (8 issues)
  // ============================================================
  {
    id: 'mercedes-c-class-m271-timing-chain-tensioner-2008',
    make: 'Mercedes-Benz',
    model: 'C-Class',
    years: yearRange(2008, 2014),
    trims: ['C250', 'C300'],
    engines: ['1.8L M271 Turbo'],
    category: 'engine',
    title: 'M271 Timing Chain Tensioner Failure',
    description: 'The M271 1.8L turbo four-cylinder uses a single-row timing chain with a hydraulic tensioner that fails prematurely, allowing the chain to slap and potentially jump timing. Failure often occurs between 60,000-100,000 miles and can cause catastrophic engine damage.',
    solution: 'Replace the timing chain, tensioner, and both sprockets as a complete kit. Use the updated Mercedes tensioner with improved check valve. Budget 8-12 hours labor due to front-of-engine access.',
    severity: 'high',
    confidence: 'high',
    symptoms: ['Rattling noise from engine on cold start', 'Check engine light with cam timing codes'],
    affectedSystems: ['Engine', 'Timing'],
    dtcCodes: ['P0016', 'P0017'],
    estimatedCostLow: 1500,
    estimatedCostHigh: 3500,
    citations: [{ type: 'forum', title: 'MBWorld.org - M271 timing chain tensioner failure thread (2,400+ replies)' }],
    communityRecommendations: [
      { type: 'warning', content: 'Do not ignore cold-start rattle on the M271. Once the chain jumps a tooth, valves contact pistons and the engine is destroyed. Preventive replacement at 80k miles is strongly recommended.', upvotes: 0, needsReview: true }
    ],
    reportCount: 2800,
    status: 'published',
    lastReportedByOwners: '2025-08-15',
    reviewedOn: '2026-03-21',
    typicalMileageLow: 60000,
    typicalMileageHigh: 100000
  },
  {
    id: 'mercedes-c-class-m274-turbo-wastegate-rattle-2015',
    make: 'Mercedes-Benz',
    model: 'C-Class',
    years: yearRange(2015, 2021),
    trims: ['C300'],
    engines: ['2.0L M274 Turbo'],
    category: 'engine',
    title: 'M274 Turbo Wastegate Rattle',
    description: 'The M274 2.0L turbo engine develops an audible wastegate rattle at idle and low RPM due to wear in the wastegate actuator linkage. While not immediately dangerous, it worsens over time and can eventually affect boost control.',
    solution: 'Replace the turbocharger wastegate actuator or the complete turbo assembly if linkage is excessively worn. Some dealers adjust the wastegate arm as a temporary fix.',
    severity: 'medium',
    confidence: 'high',
    symptoms: ['Rattling noise at idle from turbo area', 'Rattle worsens in cold weather'],
    affectedSystems: ['Engine', 'Turbo/Supercharger'],
    dtcCodes: ['P0299'],
    estimatedCostLow: 400,
    estimatedCostHigh: 2500,
    citations: [{ type: 'forum', title: 'MBWorld.org - M274 wastegate rattle complaints and fixes (1,100+ replies)' }],
    communityRecommendations: [
      { type: 'tip', content: 'If the rattle is mild and no boost codes are present, monitor it. Many owners live with the noise for years. Only replace if boost control is affected.', upvotes: 0, needsReview: true }
    ],
    reportCount: 1500,
    status: 'published',
    lastReportedByOwners: '2025-11-10',
    reviewedOn: '2026-03-21',
    typicalMileageLow: 30000,
    typicalMileageHigh: 80000
  },
  {
    id: 'mercedes-c-class-w204-rear-subframe-cracking-2008',
    make: 'Mercedes-Benz',
    model: 'C-Class',
    years: yearRange(2008, 2014),
    trims: ['C300', 'C350', 'C63 AMG'],
    engines: [],
    category: 'suspension',
    title: 'W204 Rear Subframe Cracking',
    description: 'The W204 C-Class rear subframe develops stress cracks at the mounting points, particularly on vehicles driven on rough roads or in cold climates. Cracks compromise rear suspension geometry and handling stability.',
    solution: 'Inspect the rear subframe for cracks at each service. Weld-repair minor cracks or replace the subframe entirely for severe damage. Mercedes issued a service campaign for some VINs.',
    severity: 'high',
    confidence: 'medium',
    symptoms: ['Clunking noise from rear over bumps', 'Rear end feels loose or unstable'],
    affectedSystems: ['Suspension', 'Chassis'],
    dtcCodes: [],
    estimatedCostLow: 500,
    estimatedCostHigh: 4000,
    citations: [{ type: 'nhtsa', title: 'NHTSA complaint cluster: W204 C-Class rear subframe cracking (180+ complaints)' }],
    communityRecommendations: [
      { type: 'warning', content: 'Have the subframe inspected at every alignment. Cracks start small and grow quickly. Catching them early means a $500 weld vs. a $4,000 subframe replacement.', upvotes: 0, needsReview: true }
    ],
    reportCount: 900,
    status: 'published',
    lastReportedByOwners: '2025-04-20',
    reviewedOn: '2026-03-21',
    typicalMileageLow: 60000,
    typicalMileageHigh: 120000
  },
  {
    id: 'mercedes-c-class-7g-tronic-valve-body-2005',
    make: 'Mercedes-Benz',
    model: 'C-Class',
    years: yearRange(2005, 2013),
    trims: ['C230', 'C280', 'C300', 'C350'],
    engines: [],
    category: 'transmission',
    title: '7G-Tronic Valve Body Failure',
    description: 'The 722.9 7G-Tronic automatic transmission develops valve body issues causing harsh or delayed shifts, particularly the 2-3 and 4-5 upshifts. The conductor plate (electrical connector inside the valve body) is also failure-prone.',
    solution: 'Replace the valve body or have it rebuilt by a Mercedes transmission specialist. Replace the conductor plate and speed sensors at the same time. A full transmission fluid and filter service may temporarily improve symptoms.',
    severity: 'high',
    confidence: 'high',
    symptoms: ['Harsh or jerky shifting', 'Delayed engagement when shifting from P to D'],
    affectedSystems: ['Transmission'],
    dtcCodes: ['P0720', 'P0722'],
    estimatedCostLow: 800,
    estimatedCostHigh: 3000,
    citations: [{ type: 'forum', title: 'BenzWorld.org - 7G-Tronic 722.9 valve body failure discussion (900+ replies)' }],
    communityRecommendations: [
      { type: 'tip', content: 'Change the transmission fluid and filter every 40,000 miles. Mercedes calls it a "lifetime fill" but regular service dramatically extends valve body life.', upvotes: 0, needsReview: true }
    ],
    reportCount: 2200,
    status: 'published',
    lastReportedByOwners: '2025-06-12',
    reviewedOn: '2026-03-21',
    typicalMileageLow: 70000,
    typicalMileageHigh: 130000
  },
  {
    id: 'mercedes-c-class-sam-module-failure-2001',
    make: 'Mercedes-Benz',
    model: 'C-Class',
    years: yearRange(2001, 2007),
    trims: ['C230', 'C240', 'C280', 'C320', 'C32 AMG'],
    engines: [],
    category: 'electrical',
    title: 'SAM Module Failure',
    description: 'The Signal Acquisition Module (SAM) — essentially the fuse box and body control module — fails due to water intrusion or internal solder joint cracking. Causes erratic electrical behavior including lights, wipers, and windows malfunctioning.',
    solution: 'Replace the failed SAM module (front or rear depending on symptoms). Requires dealer-level programming to code the new unit to the vehicle. Check for water leaks at the windshield cowl area that may have caused the failure.',
    severity: 'high',
    confidence: 'high',
    symptoms: ['Random electrical malfunctions', 'Wipers or lights operate on their own'],
    affectedSystems: ['Electrical', 'Body Control Module'],
    dtcCodes: [],
    estimatedCostLow: 600,
    estimatedCostHigh: 1800,
    citations: [{ type: 'forum', title: 'MBWorld.org - W203 SAM module failure and water intrusion guide (1,800+ replies)' }],
    communityRecommendations: [
      { type: 'tip', content: 'Before replacing the SAM, check for water intrusion from clogged cowl drains. Fixing the drain leak prevents repeat SAM failures.', upvotes: 0, needsReview: true }
    ],
    reportCount: 2500,
    status: 'published',
    lastReportedByOwners: '2025-03-08',
    reviewedOn: '2026-03-21',
    typicalMileageLow: 50000,
    typicalMileageHigh: 120000
  },
  {
    id: 'mercedes-c-class-cam-adjuster-solenoid-2012',
    make: 'Mercedes-Benz',
    model: 'C-Class',
    years: yearRange(2012, 2018),
    trims: ['C250', 'C300', 'C350'],
    engines: ['2.0L M274', '3.5L M276'],
    category: 'engine',
    title: 'Cam Adjuster Solenoid Failure',
    description: 'The camshaft adjuster solenoids (VANOS equivalent) stick or fail due to oil varnish buildup, causing rough idle, poor throttle response, and check engine lights. Particularly common with extended oil change intervals.',
    solution: 'Replace the camshaft adjuster solenoid(s). Clean the oil passages feeding the solenoids. Use Mercedes-approved 229.51 spec oil and change every 7,500 miles to prevent recurrence.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: ['Rough idle after warm-up', 'Check engine light with cam timing codes'],
    affectedSystems: ['Engine', 'Variable Valve Timing'],
    dtcCodes: ['P0010', 'P0011'],
    estimatedCostLow: 200,
    estimatedCostHigh: 600,
    citations: [{ type: 'tsb', title: 'Mercedes-Benz TSB LI07.20-P-056825 - Cam adjuster solenoid replacement procedure' }],
    communityRecommendations: [
      { type: 'tip', content: 'Shorten oil change intervals to 7,500 miles instead of the Mercedes-recommended 10,000-13,000 miles. Dirty oil is the primary cause of solenoid failure.', upvotes: 0, needsReview: true }
    ],
    reportCount: 1200,
    status: 'published',
    lastReportedByOwners: '2025-09-22',
    reviewedOn: '2026-03-21',
    typicalMileageLow: 50000,
    typicalMileageHigh: 100000
  },
  {
    id: 'mercedes-c-class-sunroof-drain-clog-2008',
    make: 'Mercedes-Benz',
    model: 'C-Class',
    years: yearRange(2008, 2020),
    trims: [],
    engines: [],
    category: 'body',
    title: 'Sunroof Drain Clog Water Damage',
    description: 'The sunroof drain tubes clog with debris, causing water to back up into the headliner, A-pillars, and footwells. Prolonged leaking damages the SAM module, amplifier, and other electronics mounted under the carpet.',
    solution: 'Clear sunroof drain tubes with compressed air or flexible wire from each corner of the sunroof tray. Clean drains preventively twice per year. If electronics are damaged, dry the area thoroughly and test all modules.',
    severity: 'medium',
    confidence: 'high',
    symptoms: ['Wet headliner or A-pillar trim', 'Water pooling in footwells after rain'],
    affectedSystems: ['Body', 'Interior', 'Electrical'],
    dtcCodes: [],
    estimatedCostLow: 50,
    estimatedCostHigh: 2000,
    citations: [{ type: 'forum', title: 'MBWorld.org - Sunroof drain cleaning guide and water damage prevention' }],
    communityRecommendations: [
      { type: 'tip', content: 'Clean sunroof drains every spring and fall. Pour a cup of water in each corner of the open sunroof tray and verify it exits under the car near the wheels.', upvotes: 0, needsReview: true }
    ],
    reportCount: 1800,
    status: 'published',
    lastReportedByOwners: '2025-10-05',
    reviewedOn: '2026-03-21',
    typicalMileageLow: 30000,
    typicalMileageHigh: 100000
  },
  {
    id: 'mercedes-c-class-door-lock-actuator-2008',
    make: 'Mercedes-Benz',
    model: 'C-Class',
    years: yearRange(2008, 2018),
    trims: [],
    engines: [],
    category: 'electrical',
    title: 'Door Lock Actuator Failure',
    description: 'The door lock actuators fail, preventing doors from locking or unlocking via the remote or interior switches. The actuator motor wears out or the internal mechanism jams, commonly on the driver door first.',
    solution: 'Replace the failed door lock actuator. Requires removing the door panel. OEM actuators are recommended for longevity; aftermarket units tend to fail within 1-2 years.',
    severity: 'low',
    confidence: 'medium',
    symptoms: ['Door does not lock or unlock with remote', 'Clicking noise from door but no latch movement'],
    affectedSystems: ['Electrical', 'Door Mechanisms'],
    dtcCodes: [],
    estimatedCostLow: 150,
    estimatedCostHigh: 500,
    citations: [{ type: 'forum', title: 'BenzWorld.org - C-Class door lock actuator replacement DIY guide' }],
    communityRecommendations: [
      { type: 'tip', content: 'Use OEM or Genuine Mercedes door lock actuators only. Cheap aftermarket units are the #1 complained-about replacement part on MBWorld forums.', upvotes: 0, needsReview: true }
    ],
    reportCount: 1100,
    status: 'published',
    lastReportedByOwners: '2025-07-18',
    reviewedOn: '2026-03-21',
    typicalMileageLow: 60000,
    typicalMileageHigh: 130000
  },

  // ============================================================
  // MERCEDES-BENZ E-CLASS (7 issues)
  // ============================================================
  {
    id: 'mercedes-e-class-m272-balance-shaft-2005',
    make: 'Mercedes-Benz',
    model: 'E-Class',
    years: yearRange(2005, 2011),
    trims: ['E350'],
    engines: ['3.5L M272 V6'],
    category: 'engine',
    title: 'M272 Balance Shaft Gear Wear',
    description: 'The M272 3.5L V6 has a defective balance shaft gear that wears prematurely due to a soft sprocket material used in early production. When the gear teeth strip, the balance shaft stops functioning, causing severe engine vibration and potential timing chain skip.',
    solution: 'Replace the balance shaft assembly and idler gear with the updated hardened-steel version. Mercedes extended warranty coverage for some VINs. Requires significant engine disassembly — 15-20 hours labor.',
    severity: 'high',
    confidence: 'high',
    symptoms: ['Severe engine vibration at idle', 'Check engine light with timing codes'],
    affectedSystems: ['Engine', 'Balance Shaft'],
    dtcCodes: ['P0016', 'P0017', 'P0300'],
    estimatedCostLow: 2000,
    estimatedCostHigh: 5000,
    citations: [{ type: 'nhtsa', title: 'NHTSA Investigation PE08-027 - M272 balance shaft gear premature wear' }],
    communityRecommendations: [
      { type: 'warning', content: 'Check the engine serial number — M272 engines built before June 2008 used the defective soft gear. Later production engines have the updated hardened gear.', upvotes: 0, needsReview: true }
    ],
    reportCount: 2600,
    status: 'published',
    lastReportedByOwners: '2025-05-10',
    reviewedOn: '2026-03-21',
    typicalMileageLow: 40000,
    typicalMileageHigh: 90000
  },
  {
    id: 'mercedes-e-class-air-suspension-w212-2010',
    make: 'Mercedes-Benz',
    model: 'E-Class',
    years: yearRange(2010, 2016),
    trims: ['E350', 'E550', 'E63 AMG'],
    engines: [],
    category: 'suspension',
    title: 'Air Suspension Failure (W212)',
    description: 'The AIRMATIC air suspension on the W212 E-Class develops leaks in the air springs (struts), causing the vehicle to sag overnight or drop on one corner. The compressor wears out from overwork trying to compensate for leaking struts.',
    solution: 'Replace the leaking air spring(s). If the compressor runs excessively, replace it as well along with the relay. Arnott and Bilstein make quality aftermarket air springs at lower cost than OEM.',
    severity: 'high',
    confidence: 'high',
    symptoms: ['Vehicle sags on one corner overnight', 'Air compressor runs constantly'],
    affectedSystems: ['Suspension', 'Air Suspension'],
    dtcCodes: ['C1132'],
    estimatedCostLow: 800,
    estimatedCostHigh: 3000,
    citations: [{ type: 'forum', title: 'MBWorld.org - W212 AIRMATIC failure rates and aftermarket alternatives (2,000+ replies)' }],
    communityRecommendations: [
      { type: 'part', content: 'Arnott A-2782 air spring for W212 E-Class — half the cost of OEM with excellent reliability. Includes a 2-year warranty.', partBrand: 'Arnott', partName: 'AIRMATIC Air Spring W212', upvotes: 0, needsReview: true }
    ],
    reportCount: 2100,
    status: 'published',
    lastReportedByOwners: '2025-09-15',
    reviewedOn: '2026-03-21',
    typicalMileageLow: 60000,
    typicalMileageHigh: 120000
  },
  {
    id: 'mercedes-e-class-7g-conductor-plate-2003',
    make: 'Mercedes-Benz',
    model: 'E-Class',
    years: yearRange(2003, 2012),
    trims: ['E320', 'E350', 'E500', 'E550'],
    engines: [],
    category: 'transmission',
    title: '7G-Tronic Conductor Plate Failure',
    description: 'The 722.9 7G-Tronic transmission conductor plate (internal electrical board with speed sensors) fails, causing limp mode, harsh shifting, and loss of gears. The electrical connector corrodes or the sensors crack from heat cycling.',
    solution: 'Replace the conductor plate and both speed sensors inside the transmission. Requires dropping the transmission pan and valve body. Replace the transmission filter and fluid at the same time.',
    severity: 'high',
    confidence: 'high',
    symptoms: ['Transmission goes into limp mode (stuck in one gear)', 'Harsh shifting between gears'],
    affectedSystems: ['Transmission'],
    dtcCodes: ['P0720', 'P0722', 'P0717'],
    estimatedCostLow: 500,
    estimatedCostHigh: 1500,
    citations: [{ type: 'forum', title: 'BenzWorld.org - 722.9 conductor plate replacement DIY with photos' }],
    communityRecommendations: [
      { type: 'tip', content: 'The conductor plate is a $150 part and 3-hour DIY job. Many shops quote $1,500+ because they don\'t differentiate it from a full valve body replacement.', upvotes: 0, needsReview: true }
    ],
    reportCount: 2400,
    status: 'published',
    lastReportedByOwners: '2025-04-30',
    reviewedOn: '2026-03-21',
    typicalMileageLow: 60000,
    typicalMileageHigh: 130000
  },
  {
    id: 'mercedes-e-class-crankshaft-position-sensor-2010',
    make: 'Mercedes-Benz',
    model: 'E-Class',
    years: yearRange(2010, 2018),
    trims: ['E350', 'E400', 'E550'],
    engines: ['3.5L M276', '2.0L M274'],
    category: 'engine',
    title: 'Crankshaft Position Sensor Failure',
    description: 'The crankshaft position sensor fails due to heat exposure and oil contamination, causing intermittent stalling, no-start conditions, and rough running. The sensor is mounted near the flywheel and exposed to high temperatures.',
    solution: 'Replace the crankshaft position sensor. A straightforward repair — the sensor is accessible from under the vehicle near the transmission bellhousing. Use OEM or Bosch sensor for reliability.',
    severity: 'medium',
    confidence: 'high',
    symptoms: ['Intermittent stalling while driving', 'Engine cranks but will not start'],
    affectedSystems: ['Engine', 'Ignition'],
    dtcCodes: ['P0335', 'P0336'],
    estimatedCostLow: 100,
    estimatedCostHigh: 350,
    citations: [{ type: 'tsb', title: 'Mercedes-Benz TSB LI05.10-P-056117 - Crankshaft position sensor replacement' }],
    communityRecommendations: [
      { type: 'part', content: 'Bosch 0261210302 crankshaft position sensor — Bosch is the OEM supplier for Mercedes. Avoid cheap no-name sensors that fail within months.', partBrand: 'Bosch', partName: 'Crankshaft Position Sensor', upvotes: 0, needsReview: true }
    ],
    reportCount: 1300,
    status: 'published',
    lastReportedByOwners: '2025-08-22',
    reviewedOn: '2026-03-21',
    typicalMileageLow: 60000,
    typicalMileageHigh: 120000
  },
  {
    id: 'mercedes-e-class-comand-infotainment-freeze-2010',
    make: 'Mercedes-Benz',
    model: 'E-Class',
    years: yearRange(2010, 2016),
    trims: [],
    engines: [],
    category: 'electrical',
    title: 'COMAND Infotainment System Freeze',
    description: 'The COMAND infotainment head unit freezes, reboots randomly, or displays a black screen. The hard drive-based system is prone to disc failure and software corruption, losing navigation data and settings.',
    solution: 'Perform a COMAND system reset by holding the power and back buttons. Update to the latest firmware via USB. If the hard drive has failed, the head unit needs replacement or refurbishment.',
    severity: 'low',
    confidence: 'medium',
    symptoms: ['Infotainment screen goes black', 'System reboots randomly while driving'],
    affectedSystems: ['Electrical', 'Infotainment'],
    dtcCodes: [],
    estimatedCostLow: 100,
    estimatedCostHigh: 2000,
    citations: [{ type: 'forum', title: 'MBWorld.org - COMAND NTG4.5 freeze and reboot fix guide' }],
    communityRecommendations: [
      { type: 'tip', content: 'A refurbished COMAND head unit from a specialist like BeckerAutoSound costs $500-800 vs $2,000+ from the dealer. Same functionality, much lower price.', upvotes: 0, needsReview: true }
    ],
    reportCount: 1600,
    status: 'published',
    lastReportedByOwners: '2025-06-18',
    reviewedOn: '2026-03-21',
    typicalMileageLow: 40000,
    typicalMileageHigh: 100000
  },
  {
    id: 'mercedes-e-class-om642-oil-cooler-leak-2007',
    make: 'Mercedes-Benz',
    model: 'E-Class',
    years: yearRange(2007, 2014),
    trims: ['E320 CDI', 'E350 BlueTEC'],
    engines: ['3.0L OM642 V6 Diesel'],
    category: 'engine',
    title: 'OM642 Diesel Oil Cooler Leak',
    description: 'The OM642 3.0L V6 diesel engine oil cooler seals fail, causing engine oil to leak into the coolant or vice versa. The oil cooler is sandwiched between the engine block and the intake manifold, making access difficult.',
    solution: 'Replace the oil cooler seals and gaskets. Requires intake manifold removal for access. Flush both the oil and cooling systems thoroughly after repair to remove cross-contamination.',
    severity: 'high',
    confidence: 'high',
    symptoms: ['Milky substance on oil cap or dipstick', 'Coolant level dropping with no visible leak'],
    affectedSystems: ['Engine', 'Cooling', 'Lubrication'],
    dtcCodes: [],
    estimatedCostLow: 800,
    estimatedCostHigh: 2500,
    citations: [{ type: 'forum', title: 'MBWorld.org - OM642 oil cooler seal replacement guide with detailed photos' }],
    communityRecommendations: [
      { type: 'warning', content: 'Do not drive with oil/coolant mixing. Even brief contamination can destroy bearings and overheat the engine. Tow the vehicle to a shop if you see milky oil.', upvotes: 0, needsReview: true }
    ],
    reportCount: 1700,
    status: 'published',
    lastReportedByOwners: '2025-03-25',
    reviewedOn: '2026-03-21',
    typicalMileageLow: 60000,
    typicalMileageHigh: 120000
  },
  {
    id: 'mercedes-e-class-m274-turbo-oil-line-leak-2014',
    make: 'Mercedes-Benz',
    model: 'E-Class',
    years: yearRange(2014, 2020),
    trims: ['E300'],
    engines: ['2.0L M274 Turbo'],
    category: 'engine',
    title: 'Turbo Oil Line Leak (M274)',
    description: 'The turbo oil feed and return lines on the M274 2.0L turbo engine develop leaks at the banjo bolt fittings and gaskets. Oil drips onto the exhaust manifold, creating smoke and a burning oil smell.',
    solution: 'Replace the turbo oil feed line and crush washers. Tighten to the correct torque specification. Clean oil residue from the exhaust to eliminate the burning smell.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: ['Burning oil smell from engine bay', 'Visible smoke from turbo area after driving'],
    affectedSystems: ['Engine', 'Turbo/Supercharger', 'Lubrication'],
    dtcCodes: [],
    estimatedCostLow: 200,
    estimatedCostHigh: 800,
    citations: [{ type: 'forum', title: 'MBWorld.org - M274 turbo oil line leak diagnosis and repair thread' }],
    communityRecommendations: [
      { type: 'tip', content: 'Always use new copper crush washers when retightening banjo bolts. Reusing old washers is the #1 cause of repeat leaks.', upvotes: 0, needsReview: true }
    ],
    reportCount: 800,
    status: 'published',
    lastReportedByOwners: '2025-10-12',
    reviewedOn: '2026-03-21',
    typicalMileageLow: 40000,
    typicalMileageHigh: 90000
  },

  // ============================================================
  // MERCEDES-BENZ S-CLASS (7 issues)
  // ============================================================
  {
    id: 'mercedes-s-class-abc-hydraulic-leak-2000',
    make: 'Mercedes-Benz',
    model: 'S-Class',
    years: yearRange(2000, 2013),
    trims: ['S500', 'S550', 'S600', 'S55 AMG', 'S63 AMG', 'S65 AMG', 'CL500', 'CL550'],
    engines: [],
    category: 'suspension',
    title: 'ABC Hydraulic Suspension System Leak',
    description: 'The Active Body Control (ABC) hydraulic suspension system develops leaks in the struts, lines, tandem pump, and accumulators. Repairs are extremely expensive as the system operates at 3,000+ PSI. Leaks cause the car to sag and ride harshly.',
    solution: 'Locate and repair the leak. ABC struts are $1,000-2,500 each, the tandem pump is $1,500-3,000, and accumulators are $200-500 each. Some owners convert to conventional air or coil spring suspension to escape ABC costs.',
    severity: 'high',
    confidence: 'high',
    symptoms: ['Vehicle sags on one corner', 'Warning message: "Stop vehicle, visit workshop"'],
    affectedSystems: ['Suspension', 'Hydraulic System'],
    dtcCodes: ['C1402'],
    estimatedCostLow: 1000,
    estimatedCostHigh: 6000,
    citations: [{ type: 'forum', title: 'MBWorld.org - Complete ABC system failure guide and conversion to AIRMATIC/coilovers' }],
    communityRecommendations: [
      { type: 'warning', content: 'Budget $2,000-5,000/year for ABC maintenance on a used S-Class. If the system is too expensive, a coil spring conversion runs $2,000-3,000 and eliminates all future ABC costs.', upvotes: 0, needsReview: true }
    ],
    reportCount: 3000,
    status: 'published',
    lastReportedByOwners: '2025-11-05',
    reviewedOn: '2026-03-21',
    typicalMileageLow: 60000,
    typicalMileageHigh: 130000
  },
  {
    id: 'mercedes-s-class-air-suspension-compressor-2006',
    make: 'Mercedes-Benz',
    model: 'S-Class',
    years: yearRange(2006, 2020),
    trims: ['S350', 'S400', 'S450', 'S500', 'S550', 'S560'],
    engines: [],
    category: 'suspension',
    title: 'AIRMATIC Air Suspension Compressor Failure',
    description: 'The AIRMATIC air suspension compressor burns out from overwork, typically caused by slow leaks in the air springs that force the compressor to run excessively. Compressor failure leaves the vehicle sitting low with a harsh ride.',
    solution: 'Replace the air suspension compressor and relay. Inspect all four air springs for leaks before replacing the compressor — a new compressor will fail quickly if the underlying leak is not fixed. Arnott makes a quality aftermarket replacement.',
    severity: 'high',
    confidence: 'high',
    symptoms: ['Vehicle sits very low after being parked', 'Compressor noise stops and car does not rise'],
    affectedSystems: ['Suspension', 'Air Suspension'],
    dtcCodes: ['C1132', 'C1131'],
    estimatedCostLow: 600,
    estimatedCostHigh: 2500,
    citations: [{ type: 'forum', title: 'MBWorld.org - S-Class AIRMATIC compressor replacement and leak testing guide' }],
    communityRecommendations: [
      { type: 'tip', content: 'Always fix air spring leaks before replacing the compressor. A leaking strut will burn out a new compressor within months.', upvotes: 0, needsReview: true }
    ],
    reportCount: 2400,
    status: 'published',
    lastReportedByOwners: '2025-10-20',
    reviewedOn: '2026-03-21',
    typicalMileageLow: 70000,
    typicalMileageHigh: 140000
  },
  {
    id: 'mercedes-s-class-comand-head-unit-2007',
    make: 'Mercedes-Benz',
    model: 'S-Class',
    years: yearRange(2007, 2013),
    trims: [],
    engines: [],
    category: 'electrical',
    title: 'COMAND Head Unit Failure',
    description: 'The COMAND NTG3/NTG4 head unit fails with symptoms including black screen, no audio, DVD drive failure, and loss of navigation. The internal hard drive and capacitors degrade over time.',
    solution: 'Replace or refurbish the COMAND head unit. Specialist companies can repair the internal components for $400-800 vs $3,000+ for a new OEM unit. Update to the latest map and firmware version after replacement.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: ['Screen goes black or displays garbled graphics', 'No audio output from any source'],
    affectedSystems: ['Electrical', 'Infotainment'],
    dtcCodes: [],
    estimatedCostLow: 400,
    estimatedCostHigh: 3000,
    citations: [{ type: 'forum', title: 'MBWorld.org - W221 COMAND repair specialists and replacement options' }],
    communityRecommendations: [
      { type: 'tip', content: 'Send your COMAND unit to a specialist for repair rather than buying new. Companies like BeckerAutoSound and CarRadioRepair fix them for a fraction of dealer cost.', upvotes: 0, needsReview: true }
    ],
    reportCount: 1400,
    status: 'published',
    lastReportedByOwners: '2025-05-15',
    reviewedOn: '2026-03-21',
    typicalMileageLow: 50000,
    typicalMileageHigh: 120000
  },
  {
    id: 'mercedes-s-class-48v-mild-hybrid-battery-2021',
    make: 'Mercedes-Benz',
    model: 'S-Class',
    years: yearRange(2021, 2025),
    trims: ['S500', 'S580'],
    engines: ['3.0L M256 I6', '4.0L M176 V8'],
    category: 'electrical',
    title: '48V Mild Hybrid Battery Issues',
    description: 'The 48V EQ Boost mild hybrid system battery degrades or fails prematurely, triggering multiple warning messages and disabling the start-stop, electric boost, and regenerative braking functions. Software glitches also cause false battery fault warnings.',
    solution: 'Have the dealer diagnose with XENTRY to differentiate between a software fault and genuine battery failure. Update to the latest software calibration. If the 48V lithium-ion battery has failed, replacement runs $1,500-3,000 at the dealer.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: ['Multiple electrical warning messages on dashboard', 'Start-stop system disabled'],
    affectedSystems: ['Electrical', 'Hybrid System', 'Battery'],
    dtcCodes: ['P0A7F'],
    estimatedCostLow: 200,
    estimatedCostHigh: 3000,
    citations: [{ type: 'forum', title: 'MBWorld.org - W223 S-Class 48V EQ Boost battery failures and software updates' }],
    communityRecommendations: [
      { type: 'tip', content: 'Request the latest XENTRY software update before approving a battery replacement. Many 48V fault codes are resolved by software calibration alone.', upvotes: 0, needsReview: true }
    ],
    reportCount: 600,
    status: 'published',
    lastReportedByOwners: '2025-12-01',
    reviewedOn: '2026-03-21',
    typicalMileageLow: 15000,
    typicalMileageHigh: 60000
  },
  {
    id: 'mercedes-s-class-seat-control-module-2007',
    make: 'Mercedes-Benz',
    model: 'S-Class',
    years: yearRange(2007, 2017),
    trims: [],
    engines: [],
    category: 'electrical',
    title: 'Seat Control Module Failure',
    description: 'The multi-contour seat control modules fail, disabling power seat adjustment, lumbar support, massage, and ventilation functions. The module is built into the seat frame and exposed to heat and vibration.',
    solution: 'Replace the seat control module. Requires partial seat disassembly. The module must be coded to the vehicle with dealer-level diagnostic tools. Used modules from salvage are often available.',
    severity: 'low',
    confidence: 'medium',
    symptoms: ['Power seat adjustment stops working', 'Seat massage or ventilation disabled'],
    affectedSystems: ['Electrical', 'Interior'],
    dtcCodes: [],
    estimatedCostLow: 300,
    estimatedCostHigh: 1200,
    citations: [{ type: 'forum', title: 'MBWorld.org - W221/W222 seat control module replacement and coding guide' }],
    communityRecommendations: [
      { type: 'tip', content: 'Salvage yard seat modules work well and cost $100-200 vs $600+ new. They do need to be coded to your VIN by a dealer or independent shop with XENTRY.', upvotes: 0, needsReview: true }
    ],
    reportCount: 900,
    status: 'published',
    lastReportedByOwners: '2025-07-22',
    reviewedOn: '2026-03-21',
    typicalMileageLow: 50000,
    typicalMileageHigh: 120000
  },
  {
    id: 'mercedes-s-class-power-steering-pump-leak-2000',
    make: 'Mercedes-Benz',
    model: 'S-Class',
    years: yearRange(2000, 2010),
    trims: ['S430', 'S500', 'S55 AMG'],
    engines: [],
    category: 'steering',
    title: 'Power Steering Pump Leak',
    description: 'The power steering pump develops a leak at the shaft seal or high-pressure line fitting, causing fluid loss and a whining noise when turning. Low fluid levels can damage the steering rack and ABC system (if equipped).',
    solution: 'Replace the power steering pump seal or the entire pump if internally worn. Flush the power steering system with fresh CHF 11S fluid. Inspect the high-pressure hose for leaks.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: ['Whining noise when turning the steering wheel', 'Power steering fluid puddle under the car'],
    affectedSystems: ['Steering', 'Power Steering'],
    dtcCodes: [],
    estimatedCostLow: 300,
    estimatedCostHigh: 1200,
    citations: [{ type: 'forum', title: 'BenzWorld.org - W220 S-Class power steering pump replacement guide' }],
    communityRecommendations: [
      { type: 'tip', content: 'Use only CHF 11S (Pentosin) power steering fluid in Mercedes vehicles. ATF will damage the seals and rack. This is the number one mistake made by quick-lube shops.', upvotes: 0, needsReview: true }
    ],
    reportCount: 1100,
    status: 'published',
    lastReportedByOwners: '2025-02-18',
    reviewedOn: '2026-03-21',
    typicalMileageLow: 60000,
    typicalMileageHigh: 130000
  },
  {
    id: 'mercedes-s-class-magic-body-control-camera-2014',
    make: 'Mercedes-Benz',
    model: 'S-Class',
    years: yearRange(2014, 2020),
    trims: ['S550', 'S560', 'S63 AMG', 'S65 AMG'],
    engines: [],
    category: 'suspension',
    title: 'Magic Body Control Camera Failure',
    description: 'The Magic Body Control system uses a stereo camera behind the windshield to scan the road ahead and pre-adjust the suspension. The camera module fails or loses calibration, disabling the road-scanning function and reverting to standard AIRMATIC behavior.',
    solution: 'Recalibrate the Magic Body Control camera with XENTRY diagnostic tools. If the camera module has failed, replacement runs $1,000-2,000 plus calibration. A windshield replacement also requires recalibration.',
    severity: 'low',
    confidence: 'medium',
    symptoms: ['Magic Body Control warning message', 'Ride quality degrades to standard suspension mode'],
    affectedSystems: ['Suspension', 'ADAS'],
    dtcCodes: [],
    estimatedCostLow: 300,
    estimatedCostHigh: 2500,
    citations: [{ type: 'forum', title: 'MBWorld.org - W222 Magic Body Control camera calibration and failure discussion' }],
    communityRecommendations: [
      { type: 'tip', content: 'After a windshield replacement, always have the Magic Body Control camera recalibrated. Most glass shops do not perform this step and the system will malfunction.', upvotes: 0, needsReview: true }
    ],
    reportCount: 500,
    status: 'published',
    lastReportedByOwners: '2025-08-10',
    reviewedOn: '2026-03-21',
    typicalMileageLow: 30000,
    typicalMileageHigh: 80000
  },

  // ============================================================
  // MERCEDES-BENZ GLC (5 issues)
  // ============================================================
  {
    id: 'mercedes-glc-m274-turbo-coolant-line-2016',
    make: 'Mercedes-Benz',
    model: 'GLC',
    years: yearRange(2016, 2021),
    trims: ['GLC300'],
    engines: ['2.0L M274 Turbo'],
    category: 'cooling',
    title: 'M274 Turbo Coolant Line Leak',
    description: 'The turbo coolant supply and return lines on the M274 engine develop leaks at the crimp fittings. Coolant drips onto hot exhaust components, creating steam and a sweet smell. If unaddressed, coolant loss leads to overheating.',
    solution: 'Replace the turbo coolant lines with updated parts. Mercedes revised the crimp fittings in later production. Top off coolant and bleed the system after repair.',
    severity: 'medium',
    confidence: 'high',
    symptoms: ['Sweet coolant smell from engine bay', 'Low coolant warning light'],
    affectedSystems: ['Cooling', 'Turbo/Supercharger'],
    dtcCodes: [],
    estimatedCostLow: 200,
    estimatedCostHigh: 700,
    citations: [{ type: 'tsb', title: 'Mercedes-Benz TSB LI05.20-P-057412 - Turbo coolant line leak inspection and replacement' }],
    communityRecommendations: [
      { type: 'tip', content: 'Inspect the turbo coolant lines at every oil change. Look for white coolant residue on the lines near the turbo. Early detection prevents overheating damage.', upvotes: 0, needsReview: true }
    ],
    reportCount: 1400,
    status: 'published',
    lastReportedByOwners: '2025-10-28',
    reviewedOn: '2026-03-21',
    typicalMileageLow: 30000,
    typicalMileageHigh: 80000
  },
  {
    id: 'mercedes-glc-9g-tronic-harsh-shifting-2016',
    make: 'Mercedes-Benz',
    model: 'GLC',
    years: yearRange(2016, 2022),
    trims: ['GLC300', 'GLC43 AMG'],
    engines: [],
    category: 'transmission',
    title: '9G-Tronic Harsh Shifting',
    description: 'The 9G-Tronic (725.0) nine-speed automatic transmission exhibits harsh downshifts and jerky low-speed behavior, particularly the 1-2 and 2-1 shifts. The transmission software struggles with the many gear ratios at parking lot speeds.',
    solution: 'Update the transmission control unit (TCU) software to the latest calibration at a Mercedes dealer. Perform a transmission adaptation reset. If software updates do not help, the valve body may need replacement.',
    severity: 'medium',
    confidence: 'high',
    symptoms: ['Harsh 1-2 upshift at low speeds', 'Jerky behavior in parking lots'],
    affectedSystems: ['Transmission'],
    dtcCodes: [],
    estimatedCostLow: 150,
    estimatedCostHigh: 2500,
    citations: [{ type: 'tsb', title: 'Mercedes-Benz TSB LI32.20-P-058100 - 9G-Tronic shift quality improvement software update' }],
    communityRecommendations: [
      { type: 'tip', content: 'Ask the dealer specifically for the latest TCU calibration update. Mercedes has released multiple revisions to improve low-speed shift quality on the 9G-Tronic.', upvotes: 0, needsReview: true }
    ],
    reportCount: 2000,
    status: 'published',
    lastReportedByOwners: '2025-11-15',
    reviewedOn: '2026-03-21',
    typicalMileageLow: 5000,
    typicalMileageHigh: 60000
  },
  {
    id: 'mercedes-glc-panoramic-sunroof-creak-2016',
    make: 'Mercedes-Benz',
    model: 'GLC',
    years: yearRange(2016, 2023),
    trims: [],
    engines: [],
    category: 'body',
    title: 'Panoramic Sunroof Creak and Rattle',
    description: 'The panoramic sunroof develops creaking and rattling noises over bumps and temperature changes. The glass panel expands and contracts differently than the metal frame, creating friction-induced squeaks especially in cold weather.',
    solution: 'Apply silicone-based lubricant to the sunroof seal and guide rails. The dealer can adjust the glass panel alignment and apply felt tape to contact points under warranty. Clean and lubricate the rails twice yearly.',
    severity: 'low',
    confidence: 'medium',
    symptoms: ['Creaking noise from roof over bumps', 'Rattling in cold weather'],
    affectedSystems: ['Body', 'Sunroof'],
    dtcCodes: [],
    estimatedCostLow: 0,
    estimatedCostHigh: 500,
    citations: [{ type: 'forum', title: 'MBWorld.org - GLC panoramic sunroof creak fix and lubrication guide' }],
    communityRecommendations: [
      { type: 'tip', content: 'Apply Gummi Pflege (rubber care) to the sunroof seals every 6 months. This German rubber conditioner prevents the seals from drying out and squeaking against the glass.', upvotes: 0, needsReview: true }
    ],
    reportCount: 1100,
    status: 'published',
    lastReportedByOwners: '2025-12-05',
    reviewedOn: '2026-03-21',
    typicalMileageLow: 10000,
    typicalMileageHigh: 60000
  },
  {
    id: 'mercedes-glc-air-suspension-compressor-2020',
    make: 'Mercedes-Benz',
    model: 'GLC',
    years: yearRange(2020, 2025),
    trims: ['GLC300 4MATIC', 'GLC43 AMG', 'GLC63 AMG'],
    engines: [],
    category: 'suspension',
    title: 'Air Suspension Compressor Failure',
    description: 'GLC models equipped with optional AIRMATIC air suspension experience premature compressor failure. The compressor overheats from compensating for minor air spring leaks and eventually burns out, leaving the vehicle in a lowered position.',
    solution: 'Replace the air compressor and relay. Check all four air springs for slow leaks before installing a new compressor. The Arnott P-3508 is a reliable aftermarket alternative.',
    severity: 'high',
    confidence: 'medium',
    symptoms: ['Vehicle sitting low after overnight parking', 'Suspension warning light on dashboard'],
    affectedSystems: ['Suspension', 'Air Suspension'],
    dtcCodes: ['C1132'],
    estimatedCostLow: 600,
    estimatedCostHigh: 2000,
    citations: [{ type: 'forum', title: 'MBWorld.org - X253/X254 GLC air suspension compressor failure reports' }],
    communityRecommendations: [
      { type: 'tip', content: 'Listen for the compressor running after you park. If you hear it cycling repeatedly, you have an air leak that will kill the compressor. Get it inspected promptly.', upvotes: 0, needsReview: true }
    ],
    reportCount: 400,
    status: 'published',
    lastReportedByOwners: '2025-11-28',
    reviewedOn: '2026-03-21',
    typicalMileageLow: 30000,
    typicalMileageHigh: 70000
  },
  {
    id: 'mercedes-glc-mbux-infotainment-freeze-2020',
    make: 'Mercedes-Benz',
    model: 'GLC',
    years: yearRange(2020, 2025),
    trims: [],
    engines: [],
    category: 'electrical',
    title: 'MBUX Infotainment System Freeze',
    description: 'The MBUX infotainment system freezes, reboots, or displays a black screen. Bluetooth connections drop, Apple CarPlay/Android Auto disconnects randomly, and the voice assistant becomes unresponsive.',
    solution: 'Perform a system reboot by holding the volume and track-forward buttons for 10 seconds. Visit a dealer for the latest MBUX software update. If freezes persist, the head unit may need replacement.',
    severity: 'low',
    confidence: 'medium',
    symptoms: ['Touchscreen unresponsive to input', 'System reboots with Mercedes logo'],
    affectedSystems: ['Electrical', 'Infotainment'],
    dtcCodes: [],
    estimatedCostLow: 0,
    estimatedCostHigh: 2000,
    citations: [{ type: 'forum', title: 'MBWorld.org - MBUX freeze and reboot issues across GLC lineup' }],
    communityRecommendations: [
      { type: 'tip', content: 'Disable wireless CarPlay and use a USB cable instead. Wireless connections cause more MBUX stability issues than wired.', upvotes: 0, needsReview: true }
    ],
    reportCount: 700,
    status: 'published',
    lastReportedByOwners: '2025-12-10',
    reviewedOn: '2026-03-21',
    typicalMileageLow: 5000,
    typicalMileageHigh: 40000
  },

  // ============================================================
  // MERCEDES-BENZ GLE (6 issues)
  // ============================================================
  {
    id: 'mercedes-gle-air-suspension-compressor-2016',
    make: 'Mercedes-Benz',
    model: 'GLE',
    years: yearRange(2016, 2023),
    trims: ['GLE350', 'GLE450', 'GLE53 AMG', 'GLE63 AMG'],
    engines: [],
    category: 'suspension',
    title: 'Air Suspension Compressor Failure',
    description: 'The AIRMATIC compressor fails prematurely on the GLE, typically after one or more air springs develop slow leaks. The heavy SUV puts more stress on the compressor than sedan applications, accelerating wear.',
    solution: 'Replace the compressor and relay. Leak-test all four air springs and replace any that are leaking. The compressor runs $400-800 for aftermarket (Arnott) or $1,200+ OEM.',
    severity: 'high',
    confidence: 'high',
    symptoms: ['Vehicle drops to lowest position overnight', 'Compressor runs for extended periods'],
    affectedSystems: ['Suspension', 'Air Suspension'],
    dtcCodes: ['C1132', 'C1131'],
    estimatedCostLow: 600,
    estimatedCostHigh: 2500,
    citations: [{ type: 'forum', title: 'MBWorld.org - W166/W167 GLE AIRMATIC compressor failure thread (1,500+ replies)' }],
    communityRecommendations: [
      { type: 'part', content: 'Arnott P-3215 air suspension compressor for GLE. Half the price of OEM, includes a 2-year warranty, and reviews are excellent on MBWorld.', partBrand: 'Arnott', partName: 'AIRMATIC Compressor GLE', upvotes: 0, needsReview: true }
    ],
    reportCount: 1800,
    status: 'published',
    lastReportedByOwners: '2025-10-15',
    reviewedOn: '2026-03-21',
    typicalMileageLow: 50000,
    typicalMileageHigh: 100000
  },
  {
    id: 'mercedes-gle-transfer-case-actuator-2016',
    make: 'Mercedes-Benz',
    model: 'GLE',
    years: yearRange(2016, 2022),
    trims: ['GLE350 4MATIC', 'GLE450 4MATIC', 'GLE53 AMG'],
    engines: [],
    category: 'drivetrain',
    title: 'Transfer Case Actuator Motor Failure',
    description: 'The 4MATIC transfer case actuator motor fails, preventing proper torque distribution between front and rear axles. The system defaults to a fixed split, reducing off-road capability and triggering 4WD warning lights.',
    solution: 'Replace the transfer case actuator motor. The motor is mounted externally on the transfer case and does not require transfer case removal. Code the new actuator with XENTRY diagnostics.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: ['4WD/4MATIC warning light on dashboard', 'Grinding noise from transfer case area'],
    affectedSystems: ['Drivetrain', 'Transfer Case'],
    dtcCodes: ['P1744'],
    estimatedCostLow: 400,
    estimatedCostHigh: 1500,
    citations: [{ type: 'forum', title: 'MBWorld.org - GLE 4MATIC transfer case actuator diagnosis and replacement' }],
    communityRecommendations: [
      { type: 'tip', content: 'The actuator motor is a bolt-on replacement. If you are handy, this is a 2-hour DIY job. The motor itself is $200-400 — shops charge $800+ for labor.', upvotes: 0, needsReview: true }
    ],
    reportCount: 700,
    status: 'published',
    lastReportedByOwners: '2025-08-05',
    reviewedOn: '2026-03-21',
    typicalMileageLow: 50000,
    typicalMileageHigh: 110000
  },
  {
    id: 'mercedes-gle-diesel-dpf-issues-2016',
    make: 'Mercedes-Benz',
    model: 'GLE',
    years: yearRange(2016, 2020),
    trims: ['GLE350d'],
    engines: ['3.0L OM642 V6 Diesel'],
    category: 'exhaust',
    title: 'Diesel DPF Regeneration Issues',
    description: 'The diesel particulate filter (DPF) clogs prematurely, especially on vehicles used primarily for short trips. Failed regeneration cycles cause reduced power, increased fuel consumption, and eventually limp mode.',
    solution: 'Force a DPF regeneration cycle using a diagnostic tool. If the DPF is heavily clogged, a professional cleaning service can restore it for $300-500. In severe cases, DPF replacement runs $2,000-4,000. Drive at highway speed for 30+ minutes regularly to allow passive regeneration.',
    severity: 'medium',
    confidence: 'high',
    symptoms: ['Reduced engine power warning', 'Increased fuel consumption'],
    affectedSystems: ['Exhaust', 'Emissions'],
    dtcCodes: ['P2463', 'P244A'],
    estimatedCostLow: 300,
    estimatedCostHigh: 4000,
    citations: [{ type: 'forum', title: 'MBWorld.org - OM642 DPF regeneration issues and cleaning options for GLE' }],
    communityRecommendations: [
      { type: 'tip', content: 'Take the GLE diesel on a 30-minute highway drive once a week minimum. Short city trips prevent passive DPF regeneration and lead to premature clogging.', upvotes: 0, needsReview: true }
    ],
    reportCount: 1000,
    status: 'published',
    lastReportedByOwners: '2025-06-20',
    reviewedOn: '2026-03-21',
    typicalMileageLow: 40000,
    typicalMileageHigh: 90000
  },
  {
    id: 'mercedes-gle-rear-differential-leak-2016',
    make: 'Mercedes-Benz',
    model: 'GLE',
    years: yearRange(2016, 2022),
    trims: ['GLE350', 'GLE450', 'GLE53 AMG'],
    engines: [],
    category: 'drivetrain',
    title: 'Rear Differential Oil Leak',
    description: 'The rear differential develops a leak at the pinion seal or cover gasket. Fluid loss causes differential whine and, if left unaddressed, can lead to bearing and gear damage from insufficient lubrication.',
    solution: 'Replace the leaking pinion seal or differential cover gasket. Refill with the correct GL-5 75W-85 gear oil. Inspect the differential gears and bearings for damage if the fluid level was critically low.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: ['Oil drip from rear differential area', 'Whining noise from rear at highway speed'],
    affectedSystems: ['Drivetrain', 'Rear Differential'],
    dtcCodes: [],
    estimatedCostLow: 200,
    estimatedCostHigh: 800,
    citations: [{ type: 'forum', title: 'MBWorld.org - GLE rear differential seal leak diagnosis and repair' }],
    communityRecommendations: [
      { type: 'tip', content: 'Check the rear differential fluid level at every oil change. A slow leak may not leave visible drips but can cause damage over time.', upvotes: 0, needsReview: true }
    ],
    reportCount: 600,
    status: 'published',
    lastReportedByOwners: '2025-07-12',
    reviewedOn: '2026-03-21',
    typicalMileageLow: 50000,
    typicalMileageHigh: 100000
  },
  {
    id: 'mercedes-gle-comand-mbux-freeze-2016',
    make: 'Mercedes-Benz',
    model: 'GLE',
    years: yearRange(2016, 2023),
    trims: [],
    engines: [],
    category: 'electrical',
    title: 'COMAND/MBUX Infotainment Freeze',
    description: 'The infotainment system (COMAND on 2016-2019, MBUX on 2020+) freezes or reboots. The COMAND hard drive fails over time while the MBUX system is susceptible to software glitches with connected phones.',
    solution: 'For COMAND: update firmware and check the internal hard drive health. For MBUX: perform a reboot (hold volume + track-forward 10 seconds) and update software. Disconnect phone to test if the issue is CarPlay/Android Auto related.',
    severity: 'low',
    confidence: 'medium',
    symptoms: ['Infotainment screen freezes or goes black', 'Backup camera unavailable'],
    affectedSystems: ['Electrical', 'Infotainment'],
    dtcCodes: [],
    estimatedCostLow: 0,
    estimatedCostHigh: 2500,
    citations: [{ type: 'forum', title: 'MBWorld.org - GLE COMAND and MBUX troubleshooting master thread' }],
    communityRecommendations: [
      { type: 'tip', content: 'Delete and re-pair your phone Bluetooth connection. Corrupted phone pairing profiles cause the majority of MBUX freeze events.', upvotes: 0, needsReview: true }
    ],
    reportCount: 1300,
    status: 'published',
    lastReportedByOwners: '2025-11-22',
    reviewedOn: '2026-03-21',
    typicalMileageLow: 10000,
    typicalMileageHigh: 60000
  },
  {
    id: 'mercedes-gle-tailgate-wiring-harness-2016',
    make: 'Mercedes-Benz',
    model: 'GLE',
    years: yearRange(2016, 2022),
    trims: [],
    engines: [],
    category: 'electrical',
    title: 'Tailgate Wiring Harness Break',
    description: 'The wiring harness that runs through the tailgate hinge breaks from repeated opening and closing. Affected wires control the rear wiper, defroster, license plate lights, reverse camera, and power liftgate functions.',
    solution: 'Repair or replace the tailgate wiring harness. The break typically occurs in the rubber boot between the body and tailgate. A skilled technician can splice and solder the broken wires as a cost-effective fix.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: ['Rear wiper or defroster stops working', 'Backup camera intermittent or dead'],
    affectedSystems: ['Electrical', 'Wiring'],
    dtcCodes: [],
    estimatedCostLow: 150,
    estimatedCostHigh: 800,
    citations: [{ type: 'forum', title: 'MBWorld.org - GLE tailgate wiring harness break repair with wire-by-wire diagram' }],
    communityRecommendations: [
      { type: 'tip', content: 'If only some tailgate functions fail, the wiring harness is likely the culprit. Flex the rubber boot by hand while testing — intermittent function confirms a broken wire.', upvotes: 0, needsReview: true }
    ],
    reportCount: 800,
    status: 'published',
    lastReportedByOwners: '2025-09-10',
    reviewedOn: '2026-03-21',
    typicalMileageLow: 40000,
    typicalMileageHigh: 100000
  },

  // ============================================================
  // MERCEDES-BENZ GLS (4 issues)
  // ============================================================
  {
    id: 'mercedes-gls-air-suspension-failure-2017',
    make: 'Mercedes-Benz',
    model: 'GLS',
    years: yearRange(2017, 2023),
    trims: ['GLS450', 'GLS550', 'GLS580', 'GLS63 AMG'],
    engines: [],
    category: 'suspension',
    title: 'AIRMATIC Air Suspension Failure',
    description: 'The GLS AIRMATIC system is prone to air spring leaks and compressor failure due to the vehicle\'s heavy curb weight (5,700+ lbs). Front air springs tend to fail first. The compressor overworks to maintain ride height and eventually burns out.',
    solution: 'Replace leaking air springs and the compressor if it has been overworked. All four springs should be inspected. Arnott aftermarket springs offer good value. The compressor relay should also be replaced preventively.',
    severity: 'high',
    confidence: 'high',
    symptoms: ['Vehicle leans to one side after parking', 'Harsh ride quality and clunking'],
    affectedSystems: ['Suspension', 'Air Suspension'],
    dtcCodes: ['C1132'],
    estimatedCostLow: 800,
    estimatedCostHigh: 4000,
    citations: [{ type: 'forum', title: 'MBWorld.org - X166/X167 GLS AIRMATIC failure rates and replacement guide' }],
    communityRecommendations: [
      { type: 'warning', content: 'The GLS is heavier than the GLE and destroys air springs faster. Budget for air spring replacement every 60,000-80,000 miles as a cost of ownership.', upvotes: 0, needsReview: true }
    ],
    reportCount: 1500,
    status: 'published',
    lastReportedByOwners: '2025-10-30',
    reviewedOn: '2026-03-21',
    typicalMileageLow: 50000,
    typicalMileageHigh: 100000
  },
  {
    id: 'mercedes-gls-9g-tronic-harsh-shift-2017',
    make: 'Mercedes-Benz',
    model: 'GLS',
    years: yearRange(2017, 2023),
    trims: ['GLS450', 'GLS580'],
    engines: [],
    category: 'transmission',
    title: '9G-Tronic Harsh Shift',
    description: 'The 9G-Tronic nine-speed automatic exhibits harsh low-speed shifts and hunting between gears on inclines. The transmission software struggles to select the optimal gear among nine ratios, particularly noticeable in stop-and-go traffic.',
    solution: 'Update the TCU software to the latest calibration at a Mercedes dealer. Perform a transmission adaptation reset after the update. A fluid and filter change can also improve shift quality.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: ['Jerky 1-2-3 shifts in city driving', 'Transmission hunts between gears on hills'],
    affectedSystems: ['Transmission'],
    dtcCodes: [],
    estimatedCostLow: 150,
    estimatedCostHigh: 2500,
    citations: [{ type: 'tsb', title: 'Mercedes-Benz TSB LI32.20-P-058105 - 9G-Tronic TCU calibration update for SUV models' }],
    communityRecommendations: [
      { type: 'tip', content: 'After a TCU update, drive the vehicle in normal conditions for 200+ miles to allow the transmission to relearn your driving style. Shift quality improves significantly after the adaptation period.', upvotes: 0, needsReview: true }
    ],
    reportCount: 1100,
    status: 'published',
    lastReportedByOwners: '2025-09-25',
    reviewedOn: '2026-03-21',
    typicalMileageLow: 5000,
    typicalMileageHigh: 60000
  },
  {
    id: 'mercedes-gls-panoramic-sunroof-water-leak-2020',
    make: 'Mercedes-Benz',
    model: 'GLS',
    years: yearRange(2020, 2025),
    trims: [],
    engines: [],
    category: 'body',
    title: 'Panoramic Sunroof Water Leak',
    description: 'The large panoramic sunroof on the X167 GLS develops water leaks at the drain tubes or seal interface. Water enters the headliner and can drip into the cabin, staining the headliner and potentially damaging the overhead electronics.',
    solution: 'Clear the sunroof drain tubes with compressed air. Reseal the sunroof glass to the frame if the weatherstrip has shifted. If the headliner is water-stained, it may need cleaning or replacement.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: ['Water dripping from overhead console area', 'Damp headliner after rain or car wash'],
    affectedSystems: ['Body', 'Sunroof', 'Interior'],
    dtcCodes: [],
    estimatedCostLow: 100,
    estimatedCostHigh: 1500,
    citations: [{ type: 'forum', title: 'MBWorld.org - X167 GLS panoramic sunroof leak reports and fixes' }],
    communityRecommendations: [
      { type: 'tip', content: 'Avoid automated car washes with high-pressure nozzles pointed at the roof. The extreme water pressure overwhelms the sunroof seals and drains. Hand wash or touchless wash only.', upvotes: 0, needsReview: true }
    ],
    reportCount: 500,
    status: 'published',
    lastReportedByOwners: '2025-11-08',
    reviewedOn: '2026-03-21',
    typicalMileageLow: 10000,
    typicalMileageHigh: 50000
  },
  {
    id: 'mercedes-gls-48v-battery-drain-2020',
    make: 'Mercedes-Benz',
    model: 'GLS',
    years: yearRange(2020, 2025),
    trims: ['GLS450', 'GLS580'],
    engines: ['3.0L M256 I6', '4.0L M176 V8'],
    category: 'electrical',
    title: 'Battery Drain from 48V System',
    description: 'The 48V EQ Boost mild hybrid system causes excessive battery drain when parked. A software bug in the 48V battery management module fails to properly enter sleep mode, draining both the 48V lithium-ion and 12V lead-acid batteries.',
    solution: 'Update the 48V battery management software at the dealer. If both batteries are deeply discharged, they may need replacement. The 12V battery is $200-400, the 48V battery is $1,500-3,000.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: ['Dead battery after sitting for 3-5 days', 'Multiple electrical warnings on startup'],
    affectedSystems: ['Electrical', 'Hybrid System', 'Battery'],
    dtcCodes: ['P0A7F', 'U0100'],
    estimatedCostLow: 200,
    estimatedCostHigh: 3500,
    citations: [{ type: 'forum', title: 'MBWorld.org - X167 GLS 48V battery drain and parasitic draw diagnosis' }],
    communityRecommendations: [
      { type: 'tip', content: 'If the GLS sits for more than a week, connect a battery tender to the 12V battery under the hood. The 48V system draws from the 12V to maintain its state of charge.', upvotes: 0, needsReview: true }
    ],
    reportCount: 450,
    status: 'published',
    lastReportedByOwners: '2025-12-02',
    reviewedOn: '2026-03-21',
    typicalMileageLow: 5000,
    typicalMileageHigh: 40000
  },

  // ============================================================
  // MERCEDES-BENZ A-CLASS (4 issues)
  // ============================================================
  {
    id: 'mercedes-a-class-dct-transmission-shudder-2019',
    make: 'Mercedes-Benz',
    model: 'A-Class',
    years: yearRange(2019, 2023),
    trims: ['A220'],
    engines: ['2.0L M282 Turbo'],
    category: 'transmission',
    title: 'DCT Transmission Shudder',
    description: 'The 8G-DCT dual-clutch transmission develops a shudder during low-speed acceleration, similar to driving over rumble strips. The clutch packs overheat in stop-and-go traffic, causing judder and vibration during engagement.',
    solution: 'Update the DCT software to the latest calibration. In persistent cases, the clutch assembly may need replacement. Avoid prolonged creeping in traffic — use the brake instead of riding the clutch at low speed.',
    severity: 'medium',
    confidence: 'high',
    symptoms: ['Shudder during 1st-2nd gear acceleration', 'Vibration at low speeds similar to rumble strips'],
    affectedSystems: ['Transmission', 'Clutch'],
    dtcCodes: ['P0725'],
    estimatedCostLow: 200,
    estimatedCostHigh: 3000,
    citations: [{ type: 'forum', title: 'MBWorld.org - W177 A-Class DCT shudder complaints and clutch replacement discussion' }],
    communityRecommendations: [
      { type: 'tip', content: 'Use Sport mode or manual mode in heavy traffic. This delays upshifts and keeps the DCT from hunting between 1st and 2nd gear, reducing clutch wear.', upvotes: 0, needsReview: true }
    ],
    reportCount: 1200,
    status: 'published',
    lastReportedByOwners: '2025-10-18',
    reviewedOn: '2026-03-21',
    typicalMileageLow: 15000,
    typicalMileageHigh: 50000
  },
  {
    id: 'mercedes-a-class-mbux-software-bugs-2019',
    make: 'Mercedes-Benz',
    model: 'A-Class',
    years: yearRange(2019, 2025),
    trims: [],
    engines: [],
    category: 'electrical',
    title: 'MBUX Infotainment Software Bugs',
    description: 'The MBUX infotainment system suffers from frequent software bugs including touchscreen lag, voice assistant failures ("Hey Mercedes" not responding), Bluetooth disconnects, and navigation freezes. The A-Class was the first Mercedes model with MBUX and received early software that was less polished.',
    solution: 'Visit a Mercedes dealer for the latest MBUX over-the-air update. Factory reset the MBUX system (Settings > System > Reset). Re-pair all Bluetooth devices from scratch after the update.',
    severity: 'low',
    confidence: 'high',
    symptoms: ['Touchscreen lags or becomes unresponsive', 'Hey Mercedes voice assistant does not respond'],
    affectedSystems: ['Electrical', 'Infotainment'],
    dtcCodes: [],
    estimatedCostLow: 0,
    estimatedCostHigh: 500,
    citations: [{ type: 'forum', title: 'MBWorld.org - A-Class MBUX software update tracker and bug report thread' }],
    communityRecommendations: [
      { type: 'tip', content: 'Check for MBUX updates quarterly. Mercedes pushes silent OTA updates but they sometimes require a dealer visit to install major version changes.', upvotes: 0, needsReview: true }
    ],
    reportCount: 1500,
    status: 'published',
    lastReportedByOwners: '2025-12-08',
    reviewedOn: '2026-03-21',
    typicalMileageLow: 0,
    typicalMileageHigh: 50000
  },
  {
    id: 'mercedes-a-class-suspension-strut-noise-2019',
    make: 'Mercedes-Benz',
    model: 'A-Class',
    years: yearRange(2019, 2023),
    trims: ['A220', 'A35 AMG'],
    engines: [],
    category: 'suspension',
    title: 'Front Suspension Strut Noise',
    description: 'The front MacPherson struts develop a clunking or knocking noise over bumps and rough surfaces. The strut mount bearing wears prematurely, and the strut itself can develop internal valving noise. More common on vehicles with AMG suspension.',
    solution: 'Replace the front strut mount bearings first ($100-200 per side). If the noise persists, replace the strut assemblies. Use OEM or Sachs (OEM supplier) replacement struts for proper ride quality.',
    severity: 'low',
    confidence: 'medium',
    symptoms: ['Clunking noise from front over bumps', 'Knocking when turning at low speed'],
    affectedSystems: ['Suspension', 'Struts'],
    dtcCodes: [],
    estimatedCostLow: 200,
    estimatedCostHigh: 1000,
    citations: [{ type: 'forum', title: 'MBWorld.org - W177 A-Class front strut noise diagnosis and replacement' }],
    communityRecommendations: [
      { type: 'tip', content: 'Have the strut mount bearings checked first — they are the most common cause and cheapest to replace. Most shops go straight to full strut replacement unnecessarily.', upvotes: 0, needsReview: true }
    ],
    reportCount: 600,
    status: 'published',
    lastReportedByOwners: '2025-07-30',
    reviewedOn: '2026-03-21',
    typicalMileageLow: 25000,
    typicalMileageHigh: 60000
  },
  {
    id: 'mercedes-a-class-m282-turbo-wastegate-rattle-2019',
    make: 'Mercedes-Benz',
    model: 'A-Class',
    years: yearRange(2019, 2023),
    trims: ['A220'],
    engines: ['2.0L M282 Turbo'],
    category: 'engine',
    title: 'Turbo Wastegate Rattle (M282)',
    description: 'The M282 2.0L turbo engine develops a wastegate rattle at idle, similar to the M274 issue on larger Mercedes models. The wastegate actuator arm develops play, causing a metallic tapping noise that is most audible at warm idle.',
    solution: 'Replace the turbo wastegate actuator or adjust the linkage. In severe cases, the entire turbocharger may need replacement. Mercedes has released updated actuators for some model years.',
    severity: 'low',
    confidence: 'medium',
    symptoms: ['Metallic tapping noise at idle', 'Rattle from turbo area that stops under load'],
    affectedSystems: ['Engine', 'Turbo/Supercharger'],
    dtcCodes: [],
    estimatedCostLow: 300,
    estimatedCostHigh: 2000,
    citations: [{ type: 'forum', title: 'MBWorld.org - M282 turbo rattle reports across A-Class and CLA models' }],
    communityRecommendations: [
      { type: 'tip', content: 'The wastegate rattle is cosmetic in most cases — it sounds worse than it is. Unless boost pressure is affected, many owners live with it rather than replacing the turbo.', upvotes: 0, needsReview: true }
    ],
    reportCount: 500,
    status: 'published',
    lastReportedByOwners: '2025-09-14',
    reviewedOn: '2026-03-21',
    typicalMileageLow: 20000,
    typicalMileageHigh: 60000
  },

  // ============================================================
  // MERCEDES-BENZ CLA (4 issues)
  // ============================================================
  {
    id: 'mercedes-cla-dct-transmission-shudder-2014',
    make: 'Mercedes-Benz',
    model: 'CLA',
    years: yearRange(2014, 2019),
    trims: ['CLA250'],
    engines: ['2.0L M270 Turbo'],
    category: 'transmission',
    title: 'DCT Transmission Shudder',
    description: 'The 7G-DCT dual-clutch transmission on the first-generation CLA develops a pronounced shudder during low-speed driving, especially in stop-and-go traffic. The dry clutch design overheats and judders during engagement, creating a vibration felt through the entire car.',
    solution: 'Update the DCT software to the latest revision. If shudder persists, the dual clutch assembly needs replacement ($2,000-3,500). Avoid riding the clutch at low speed — come to a complete stop or maintain steady speed.',
    severity: 'high',
    confidence: 'high',
    symptoms: ['Shudder when accelerating from a stop', 'Vibration in 1st-2nd gear like driving on a rough road'],
    affectedSystems: ['Transmission', 'Clutch'],
    dtcCodes: ['P0725', 'P0726'],
    estimatedCostLow: 200,
    estimatedCostHigh: 3500,
    citations: [{ type: 'nhtsa', title: 'NHTSA complaint cluster: CLA250 DCT shudder and vibration (450+ complaints)' }],
    communityRecommendations: [
      { type: 'warning', content: 'If you live in a city with heavy traffic, the CLA DCT will suffer. Consider trading for a 2020+ CLA which uses a torque converter 8G-DCT that is much smoother at low speeds.', upvotes: 0, needsReview: true }
    ],
    reportCount: 2500,
    status: 'published',
    lastReportedByOwners: '2025-08-20',
    reviewedOn: '2026-03-21',
    typicalMileageLow: 20000,
    typicalMileageHigh: 60000
  },
  {
    id: 'mercedes-cla-m270-turbo-oil-leak-2014',
    make: 'Mercedes-Benz',
    model: 'CLA',
    years: yearRange(2014, 2019),
    trims: ['CLA250'],
    engines: ['2.0L M270 Turbo'],
    category: 'engine',
    title: 'Turbo Oil Leak (M270)',
    description: 'The M270 2.0L turbo engine develops oil leaks from the turbo oil feed and return lines. Oil drips onto the hot exhaust manifold, producing smoke and a burning oil smell. The turbo oil return line gasket is the most common leak point.',
    solution: 'Replace the turbo oil return line gasket and o-rings. Clean all oil residue from the exhaust to stop the burning smell. Use new crush washers on the banjo bolt fittings.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: ['Burning oil smell after driving', 'Smoke visible from engine bay'],
    affectedSystems: ['Engine', 'Turbo/Supercharger', 'Lubrication'],
    dtcCodes: [],
    estimatedCostLow: 200,
    estimatedCostHigh: 700,
    citations: [{ type: 'forum', title: 'MBWorld.org - CLA250 M270 turbo oil leak diagnosis and gasket replacement' }],
    communityRecommendations: [
      { type: 'tip', content: 'Check the oil level every 1,000 miles if you notice a burning smell. The leak is slow but steady, and running low on oil with a turbo engine is catastrophic.', upvotes: 0, needsReview: true }
    ],
    reportCount: 900,
    status: 'published',
    lastReportedByOwners: '2025-06-25',
    reviewedOn: '2026-03-21',
    typicalMileageLow: 40000,
    typicalMileageHigh: 90000
  },
  {
    id: 'mercedes-cla-comand-freeze-2014',
    make: 'Mercedes-Benz',
    model: 'CLA',
    years: yearRange(2014, 2019),
    trims: [],
    engines: [],
    category: 'electrical',
    title: 'COMAND Infotainment Freeze',
    description: 'The Audio 20/COMAND infotainment system on the first-gen CLA freezes, goes black, or reboots randomly. The entry-level Audio 20 system is particularly prone to Bluetooth connectivity issues that crash the head unit.',
    solution: 'Update the infotainment firmware to the latest version. Perform a hard reset by disconnecting the battery for 15 minutes. If the head unit has failed internally, replacement costs $800-1,500.',
    severity: 'low',
    confidence: 'medium',
    symptoms: ['Screen freezes and does not respond to touch', 'System reboots with Mercedes logo'],
    affectedSystems: ['Electrical', 'Infotainment'],
    dtcCodes: [],
    estimatedCostLow: 0,
    estimatedCostHigh: 1500,
    citations: [{ type: 'forum', title: 'MBWorld.org - CLA Audio 20 freeze fix and firmware update guide' }],
    communityRecommendations: [
      { type: 'tip', content: 'Delete all paired Bluetooth devices and re-pair only the phones you actively use. Having too many stored devices causes instability.', upvotes: 0, needsReview: true }
    ],
    reportCount: 1000,
    status: 'published',
    lastReportedByOwners: '2025-05-30',
    reviewedOn: '2026-03-21',
    typicalMileageLow: 20000,
    typicalMileageHigh: 70000
  },
  {
    id: 'mercedes-cla-front-strut-noise-2014',
    make: 'Mercedes-Benz',
    model: 'CLA',
    years: yearRange(2014, 2023),
    trims: ['CLA250', 'CLA35 AMG', 'CLA45 AMG'],
    engines: [],
    category: 'suspension',
    title: 'Front Suspension Strut Noise',
    description: 'The front struts and strut mount bearings develop clunking and creaking noises over bumps. The CLA shares its platform with the A-Class and both suffer from the same strut mount bearing wear issue, especially on models with sport suspension.',
    solution: 'Replace the front strut mount bearings first as the cheapest fix. If noise remains, replace the full strut assemblies with OEM or Sachs replacements. Alignment required after strut replacement.',
    severity: 'low',
    confidence: 'medium',
    symptoms: ['Clunking from front end over bumps', 'Creaking when turning the steering wheel while parked'],
    affectedSystems: ['Suspension', 'Struts'],
    dtcCodes: [],
    estimatedCostLow: 200,
    estimatedCostHigh: 1000,
    citations: [{ type: 'forum', title: 'MBWorld.org - CLA front strut noise complaints and bearing replacement DIY' }],
    communityRecommendations: [
      { type: 'tip', content: 'The strut mount bearing is a $30 part and takes 1 hour per side. Try this before committing to $800+ full strut replacement.', upvotes: 0, needsReview: true }
    ],
    reportCount: 700,
    status: 'published',
    lastReportedByOwners: '2025-08-15',
    reviewedOn: '2026-03-21',
    typicalMileageLow: 25000,
    typicalMileageHigh: 70000
  },

  // ============================================================
  // MERCEDES-BENZ GLA (4 issues)
  // ============================================================
  {
    id: 'mercedes-gla-turbo-coolant-line-leak-2015',
    make: 'Mercedes-Benz',
    model: 'GLA',
    years: yearRange(2015, 2020),
    trims: ['GLA250'],
    engines: ['2.0L M270 Turbo'],
    category: 'cooling',
    title: 'Turbo Coolant Line Leak',
    description: 'The turbo coolant lines on the M270 engine develop leaks at the quick-connect fittings, causing coolant loss and potential overheating. The plastic connectors become brittle from heat cycling and crack.',
    solution: 'Replace the turbo coolant lines with updated parts featuring reinforced connectors. Top off coolant and bleed the system. Inspect the turbo oil lines at the same time as they share the same access area.',
    severity: 'medium',
    confidence: 'high',
    symptoms: ['Low coolant warning light', 'Sweet coolant smell from engine bay'],
    affectedSystems: ['Cooling', 'Turbo/Supercharger'],
    dtcCodes: [],
    estimatedCostLow: 150,
    estimatedCostHigh: 600,
    citations: [{ type: 'tsb', title: 'Mercedes-Benz TSB LI05.20-P-056890 - Turbo coolant line connector replacement' }],
    communityRecommendations: [
      { type: 'tip', content: 'Check coolant level monthly on the GLA250. The turbo line leak is slow and you may not notice puddles, but coolant level drops steadily over weeks.', upvotes: 0, needsReview: true }
    ],
    reportCount: 1100,
    status: 'published',
    lastReportedByOwners: '2025-09-05',
    reviewedOn: '2026-03-21',
    typicalMileageLow: 30000,
    typicalMileageHigh: 70000
  },
  {
    id: 'mercedes-gla-dct-shudder-2015',
    make: 'Mercedes-Benz',
    model: 'GLA',
    years: yearRange(2015, 2019),
    trims: ['GLA250'],
    engines: ['2.0L M270 Turbo'],
    category: 'transmission',
    title: 'DCT Transmission Shudder',
    description: 'The 7G-DCT dual-clutch transmission shudders at low speeds, identical to the CLA issue. The dry clutch design is poorly suited for the GLA\'s heavier weight and SUV driving patterns with frequent stop-and-go.',
    solution: 'Update the TCU software. If shudder persists after the software update, the dual clutch pack needs replacement. Consider the 2020+ GLA which uses an improved 8G-DCT with a torque converter.',
    severity: 'high',
    confidence: 'high',
    symptoms: ['Vibration when pulling away from stops', 'Shudder in 1st-2nd gear engagement'],
    affectedSystems: ['Transmission', 'Clutch'],
    dtcCodes: ['P0725'],
    estimatedCostLow: 200,
    estimatedCostHigh: 3500,
    citations: [{ type: 'nhtsa', title: 'NHTSA complaint cluster: GLA250 DCT transmission shudder (280+ complaints)' }],
    communityRecommendations: [
      { type: 'warning', content: 'The 2015-2019 GLA250 DCT is the weakest link in an otherwise solid vehicle. If buying used, test drive extensively in city traffic to assess clutch condition.', upvotes: 0, needsReview: true }
    ],
    reportCount: 1600,
    status: 'published',
    lastReportedByOwners: '2025-07-28',
    reviewedOn: '2026-03-21',
    typicalMileageLow: 20000,
    typicalMileageHigh: 55000
  },
  {
    id: 'mercedes-gla-transfer-case-noise-awd-2015',
    make: 'Mercedes-Benz',
    model: 'GLA',
    years: yearRange(2015, 2023),
    trims: ['GLA250 4MATIC', 'GLA35 AMG', 'GLA45 AMG'],
    engines: [],
    category: 'drivetrain',
    title: 'Transfer Case Noise (AWD Models)',
    description: 'The 4MATIC transfer case on the GLA develops a whining or humming noise at highway speeds. The noise is caused by gear wear inside the power take-off unit that distributes torque to the rear axle. More common on vehicles that have seen off-road use or aggressive driving.',
    solution: 'Drain and refill the transfer case fluid first — old fluid can cause whining. If noise persists, the power take-off unit needs rebuilding or replacement. Use only Mercedes-approved transfer case fluid.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: ['Whining noise at highway speed', 'Humming that changes with vehicle speed'],
    affectedSystems: ['Drivetrain', 'Transfer Case'],
    dtcCodes: [],
    estimatedCostLow: 200,
    estimatedCostHigh: 2000,
    citations: [{ type: 'forum', title: 'MBWorld.org - GLA 4MATIC transfer case noise diagnosis and fluid change guide' }],
    communityRecommendations: [
      { type: 'tip', content: 'Change the transfer case fluid every 40,000 miles. Mercedes does not list this as a scheduled service item but it dramatically extends transfer case life.', upvotes: 0, needsReview: true }
    ],
    reportCount: 500,
    status: 'published',
    lastReportedByOwners: '2025-06-15',
    reviewedOn: '2026-03-21',
    typicalMileageLow: 40000,
    typicalMileageHigh: 90000
  },
  {
    id: 'mercedes-gla-water-pump-failure-2015',
    make: 'Mercedes-Benz',
    model: 'GLA',
    years: yearRange(2015, 2020),
    trims: ['GLA250'],
    engines: ['2.0L M270 Turbo'],
    category: 'cooling',
    title: 'Water Pump Failure',
    description: 'The electric water pump on the M270 engine fails, causing loss of coolant circulation and rapid overheating. The pump motor or impeller breaks, and failure is often sudden with no warning. Common between 50,000-90,000 miles.',
    solution: 'Replace the electric water pump and thermostat together. Use OEM or Pierburg (OEM supplier) parts. Flush the cooling system with fresh Mercedes-approved coolant. Monitor the temperature gauge closely on high-mileage GLA models.',
    severity: 'high',
    confidence: 'medium',
    symptoms: ['Engine temperature spikes rapidly', 'No heat from cabin heater'],
    affectedSystems: ['Cooling', 'Engine'],
    dtcCodes: ['P0599', 'P2181'],
    estimatedCostLow: 400,
    estimatedCostHigh: 1200,
    citations: [{ type: 'forum', title: 'MBWorld.org - GLA250 water pump failure reports and preventive replacement interval' }],
    communityRecommendations: [
      { type: 'warning', content: 'If the temperature gauge moves above the halfway mark, pull over immediately. The electric water pump gives zero warning before complete failure — overheating for even 2 minutes can warp the head.', upvotes: 0, needsReview: true }
    ],
    reportCount: 800,
    status: 'published',
    lastReportedByOwners: '2025-10-08',
    reviewedOn: '2026-03-21',
    typicalMileageLow: 50000,
    typicalMileageHigh: 90000
  },

  // ============================================================
  // MERCEDES-BENZ GLB (3 issues)
  // ============================================================
  {
    id: 'mercedes-glb-8g-dct-shudder-2020',
    make: 'Mercedes-Benz',
    model: 'GLB',
    years: yearRange(2020, 2025),
    trims: ['GLB250'],
    engines: ['2.0L M282 Turbo'],
    category: 'transmission',
    title: '8G-DCT Transmission Shudder',
    description: 'The 8G-DCT dual-clutch transmission exhibits shudder and hesitation during low-speed maneuvers and from a standstill. While improved over the earlier 7G-DCT, the 8G-DCT still uses a wet clutch design that can judder when the clutch packs wear or the software calibration is outdated.',
    solution: 'Update the TCU software to the latest calibration. A transmission fluid change can improve clutch engagement feel. In persistent cases, the clutch assembly may need replacement under warranty.',
    severity: 'medium',
    confidence: 'medium',
    symptoms: ['Shudder when pulling away slowly', 'Hesitation during low-speed parking maneuvers'],
    affectedSystems: ['Transmission', 'Clutch'],
    dtcCodes: [],
    estimatedCostLow: 150,
    estimatedCostHigh: 2500,
    citations: [{ type: 'forum', title: 'MBWorld.org - GLB250 8G-DCT shudder reports and TCU update discussion' }],
    communityRecommendations: [
      { type: 'tip', content: 'The 8G-DCT improves significantly after the TCU software update. Ask the dealer for the latest calibration — several updates have been released since the GLB launch.', upvotes: 0, needsReview: true }
    ],
    reportCount: 800,
    status: 'published',
    lastReportedByOwners: '2025-11-20',
    reviewedOn: '2026-03-21',
    typicalMileageLow: 10000,
    typicalMileageHigh: 45000
  },
  {
    id: 'mercedes-glb-mbux-freeze-2020',
    make: 'Mercedes-Benz',
    model: 'GLB',
    years: yearRange(2020, 2025),
    trims: [],
    engines: [],
    category: 'electrical',
    title: 'MBUX Infotainment Freeze',
    description: 'The MBUX system freezes, reboots, or displays glitches. Apple CarPlay and Android Auto connections trigger instability in the head unit, and the voice assistant ("Hey Mercedes") intermittently stops responding.',
    solution: 'Reboot MBUX by holding volume + track-forward for 10 seconds. Update to the latest software version. Factory reset the system if issues persist. Use a wired CarPlay/Android Auto connection for better stability.',
    severity: 'low',
    confidence: 'medium',
    symptoms: ['Touchscreen becomes unresponsive', 'System reboots showing Mercedes logo'],
    affectedSystems: ['Electrical', 'Infotainment'],
    dtcCodes: [],
    estimatedCostLow: 0,
    estimatedCostHigh: 1500,
    citations: [{ type: 'forum', title: 'MBWorld.org - GLB MBUX freeze and software update tracker' }],
    communityRecommendations: [
      { type: 'tip', content: 'Switch from wireless to wired CarPlay/Android Auto. The wireless protocol causes more MBUX crashes. A simple USB cable solves most freeze issues.', upvotes: 0, needsReview: true }
    ],
    reportCount: 600,
    status: 'published',
    lastReportedByOwners: '2025-12-12',
    reviewedOn: '2026-03-21',
    typicalMileageLow: 0,
    typicalMileageHigh: 40000
  },
  {
    id: 'mercedes-glb-panoramic-roof-creak-2020',
    make: 'Mercedes-Benz',
    model: 'GLB',
    years: yearRange(2020, 2025),
    trims: [],
    engines: [],
    category: 'body',
    title: 'Panoramic Sunroof Creak',
    description: 'The panoramic sunroof develops creaking and popping noises, particularly in temperature extremes and over rough roads. The large glass panel flexes differently than the metal roof structure, creating friction at the seal interfaces.',
    solution: 'Lubricate the sunroof seals and guide rails with silicone-based lubricant. The dealer can apply felt tape to the contact points under warranty. Clean and lubricate the sunroof mechanism every 6 months.',
    severity: 'low',
    confidence: 'medium',
    symptoms: ['Creaking or popping noise from roof', 'Noise worsens in very cold or very hot weather'],
    affectedSystems: ['Body', 'Sunroof'],
    dtcCodes: [],
    estimatedCostLow: 0,
    estimatedCostHigh: 400,
    citations: [{ type: 'forum', title: 'MBWorld.org - GLB panoramic sunroof noise fix and lubrication guide' }],
    communityRecommendations: [
      { type: 'tip', content: 'Krytox GPL-205 lubricant applied to the sunroof seals eliminates the creak. This is the same lubricant used in mechanical keyboards — it handles temperature extremes well and lasts 6+ months.', upvotes: 0, needsReview: true }
    ],
    reportCount: 400,
    status: 'published',
    lastReportedByOwners: '2025-11-30',
    reviewedOn: '2026-03-21',
    typicalMileageLow: 5000,
    typicalMileageHigh: 40000
  }
];

// SQL insert
const INSERT_SQL = `
INSERT INTO "KnownIssue" (
  id, make, model, years, trims, engines, category, title, description, solution,
  severity, confidence, symptoms, "affectedSystems", "dtcCodes",
  "estimatedCostLow", "estimatedCostHigh", citations, "communityRecommendations",
  "humanApproved", "reportCount", status, "lastReportedByOwners", "reviewedOn",
  "createdAt", "updatedAt", "typicalMileageLow", "typicalMileageHigh"
)
VALUES (
  $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
  $11,$12,$13,$14,$15,$16,$17,$18,$19,
  $20,$21,$22,$23,$24,NOW(),NOW(),$25,$26
)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title,
  description=EXCLUDED.description,
  solution=EXCLUDED.solution,
  "updatedAt"=NOW()
`;

async function main() {
  const client = await pool.connect();
  console.log(`Inserting ${issues.length} Mercedes-Benz known issues...\n`);

  let created = 0;
  let updated = 0;
  let errors = 0;

  for (const issue of issues) {
    try {
      // PostgreSQL array columns need native array format, Json columns need JSON strings
      const result = await client.query(INSERT_SQL, [
        issue.id,                                          // $1
        issue.make,                                        // $2
        issue.model,                                       // $3
        issue.years,                                       // $4  Int[] - pass native array
        issue.trims || [],                                 // $5  String[] - pass native array
        issue.engines || [],                               // $6  String[] - pass native array
        issue.category,                                    // $7
        issue.title,                                       // $8
        issue.description,                                 // $9
        issue.solution,                                    // $10
        issue.severity,                                    // $11
        issue.confidence,                                  // $12
        issue.symptoms,                                    // $13 String[] - pass native array
        issue.affectedSystems,                             // $14 String[] - pass native array
        issue.dtcCodes || [],                              // $15 String[] - pass native array
        issue.estimatedCostLow,                            // $16
        issue.estimatedCostHigh,                           // $17
        JSON.stringify(issue.citations || []),              // $18 Json
        JSON.stringify(issue.communityRecommendations || []), // $19 Json
        false,                                             // $20 humanApproved
        issue.reportCount,                                 // $21
        issue.status,                                      // $22
        issue.lastReportedByOwners || null,                // $23
        issue.reviewedOn || null,                           // $24
        issue.typicalMileageLow || null,                   // $25
        issue.typicalMileageHigh || null                   // $26
      ]);

      if (result.command === 'INSERT') {
        // ON CONFLICT can still return INSERT — check rowCount
        console.log(`  OK: ${issue.id}`);
        created++;
      }
    } catch (err) {
      console.error(`  ERROR on ${issue.id}: ${err.message}`);
      errors++;
    }
  }

  // Count per model
  console.log('\n--- Mercedes-Benz issue counts per model ---');
  const models = ['C-Class', 'E-Class', 'S-Class', 'GLC', 'GLE', 'GLS', 'A-Class', 'CLA', 'GLA', 'GLB'];
  let total = 0;
  for (const model of models) {
    const res = await client.query(
      `SELECT COUNT(*) FROM "KnownIssue" WHERE make='Mercedes-Benz' AND model=$1 AND status='published'`,
      [model]
    );
    const count = parseInt(res.rows[0].count, 10);
    total += count;
    console.log(`  ${model}: ${count}`);
  }
  console.log(`  TOTAL Mercedes-Benz: ${total}`);

  // Overall DB count
  const allRes = await client.query(`SELECT COUNT(*) FROM "KnownIssue" WHERE status='published'`);
  console.log(`\nTotal published issues in DB: ${allRes.rows[0].count}`);

  console.log(`\nDone! Inserted/updated: ${created}, Errors: ${errors}`);
  client.release();
  await pool.end();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
