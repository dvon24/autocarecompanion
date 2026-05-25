const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const knownIssues = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Cadillac Escalade Issues
// 2nd Gen (2002-2006): 5.3L/6.0L Vortec V8, 4L60E/4L65E trans
// 3rd Gen (2007-2014): 6.2L Vortec V8, 6L80 trans
// 4th Gen (2015-2020): 6.2L EcoTec3 V8, 8L90 trans, Magnetic Ride Control
// 5th Gen (2021-2025): 6.2L L87 V8, 10L80 trans, Super Cruise available, Escalade-V with LT4

const cadillacEscaladeIssues = [
  {
    id: 'cadillac-escalade-air-suspension-2007',
    make: 'Cadillac',
    model: 'Escalade',
    years: { start: 2007, end: 2020 },
    title: 'Air Suspension / Magnetic Ride Control Compressor Failure',
    severity: 'high',
    category: 'suspension',
    description: 'The Cadillac Escalade with Autoride (air suspension) or Magnetic Ride Control uses an air compressor and electronic shocks that commonly fail between 80,000-120,000 miles. The air compressor burns out from continuous cycling caused by slow air leaks in the air springs (bags). Failed air springs cause the vehicle to sag at one or more corners, and the compressor overworks trying to compensate. The Magnetic Ride Control shocks contain magnetorheological fluid that degrades over time, causing a harsh or bouncy ride. Common on 2007-2014 (3rd gen) and 2015-2020 (4th gen) Escalades equipped with these options.',
    symptoms: [
      'Vehicle sagging at one or more corners overnight',
      'Air compressor running constantly (audible whining from rear)',
      'SERVICE RIDE CONTROL message on dashboard',
      'Harsh or bouncy ride quality',
      'Compressor stops working entirely - vehicle sits very low',
      'Uneven ride height side to side'
    ],
    solution: 'Diagnose whether the compressor, air springs, or electronic shocks have failed. Air springs (bags) typically fail first from dry rot and cracking. Replacing air springs often fixes the compressor overwork. Many owners convert to traditional coil spring suspension using conversion kits from Arnott or Strutmasters, which eliminates recurring air suspension failures. Magnetic Ride Control shocks must be replaced with MRC-compatible units or the system must be bypassed with conventional shocks. Arnott and Bilstein are top choices for replacement MRC shocks.',
    estimatedCost: { min: 800, max: 3500 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'Arnott A-2784 air suspension compressor - direct OEM replacement with improved reliability',
        partBrand: 'Arnott',
        partName: 'Air Suspension Compressor',
        partNumber: 'A-2784',
        upvotes: 0
      },
      {
        type: 'part',
        content: 'Strutmasters SM9020 coil spring conversion kit - eliminates air suspension entirely, bolt-on install',
        partBrand: 'Strutmasters',
        partName: 'Air-to-Coil Spring Conversion Kit',
        partNumber: 'SM9020',
        upvotes: 0
      },
      {
        type: 'part',
        content: 'Arnott AS-2708 rear air spring - OE replacement air spring if keeping air suspension',
        partBrand: 'Arnott',
        partName: 'Rear Air Spring',
        partNumber: 'AS-2708',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'If one air spring is leaking, replace both rears at the same time - the other is likely close to failure too',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'Running the compressor with a leaking air spring will burn it out - fix the spring first to save the compressor',
        upvotes: 0
      }
    ]
  },
  {
    id: 'cadillac-escalade-afm-lifter-2007',
    make: 'Cadillac',
    model: 'Escalade',
    years: { start: 2007, end: 2020 },
    title: 'AFM/DOD Lifter Failure - V8 Cylinder Deactivation System',
    severity: 'high',
    category: 'engine',
    description: 'The Escalade\'s 5.3L and 6.2L V8 engines with Active Fuel Management (AFM) / Dynamic Fuel Management (DFM) use collapsible hydraulic lifters to deactivate cylinders for fuel savings. These AFM lifters are prone to premature failure, causing misfires, rough running, and potential catastrophic engine damage from collapsed lifters. The issue is most common on cylinders 1, 4, 6, and 7 (the deactivation cylinders). Failed lifters can damage camshaft lobes, pushrods, and even score cylinder walls. This is arguably the most common and expensive Escalade issue, affecting 2007-2020 models with the Gen IV and Gen V V8.',
    symptoms: [
      'Misfire codes on AFM cylinders (P0300, P0301, P0304, P0306, P0307)',
      'Rough idle or engine shake',
      'Ticking or tapping noise from engine',
      'Check engine light',
      'Reduced power or limp mode',
      'Metal debris in oil (from collapsed lifter)'
    ],
    solution: 'Replace all 16 lifters (both AFM and standard) along with the VLOM (Valve Lifter Oil Manifold) and lifter guides. Many owners choose to perform an AFM delete at the same time, which replaces AFM components with standard non-AFM lifters, a non-AFM camshaft, and a DOD/AFM delete kit. An AFM disabler device can prevent the system from activating on stock engines as a preventive measure. Engine must be partially disassembled - labor intensive at 12-18 hours.',
    estimatedCost: { min: 3000, max: 6000 },
    recallTSB: 'GM TSB #18-NA-077 - Lifter failure on 5.3L/6.2L V8',
    communityRecommendations: [
      {
        type: 'part',
        content: 'GM OEM VLOM (Valve Lifter Oil Manifold) 12639516 - must replace with lifters to prevent repeat failure',
        partBrand: 'GM',
        partName: 'VLOM Assembly',
        partNumber: '12639516',
        upvotes: 0
      },
      {
        type: 'part',
        content: 'Texas Speed AFM Delete Kit (DOD Delete) - includes non-AFM cam, lifters, pushrods, springs, and Valley cover. Eliminates AFM entirely.',
        partBrand: 'Texas Speed',
        partName: 'DOD/AFM Delete Kit',
        partNumber: 'TSP-AFM-DELETE',
        upvotes: 0
      },
      {
        type: 'part',
        content: 'Range Technology AFM/DFM Disabler - plug-in device that prevents AFM from activating, no tune required. Preventive measure for engines with good lifters.',
        partBrand: 'Range Technology',
        partName: 'AFM/DFM Disabler',
        partNumber: 'RA003',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'If doing lifter replacement, strongly consider the full AFM delete to prevent future failures - the AFM system is the root cause',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'Do NOT ignore lifter tick - a collapsed lifter will score the camshaft and can drop valve into cylinder, turning a $4k repair into a $10k+ engine replacement',
        upvotes: 0
      }
    ]
  },
  {
    id: 'cadillac-escalade-transmission-shudder-2015',
    make: 'Cadillac',
    model: 'Escalade',
    years: { start: 2015, end: 2020 },
    title: '8L90 Transmission Shudder and Harsh Shifting',
    severity: 'high',
    category: 'transmission',
    description: 'The 2015-2020 Escalade uses the GM 8L90 8-speed automatic transmission that suffers from a widespread torque converter shudder issue. The shudder typically occurs at light throttle between 25-50 mph and feels like driving over rumble strips. The root cause is the torque converter clutch wearing prematurely, contaminating the transmission fluid with clutch material. GM extended the warranty and released updated torque converters and fluid, but many owners still experience the issue after the fix. This was the subject of a class action lawsuit.',
    symptoms: [
      'Shudder or vibration at light throttle between 25-50 mph',
      'Feels like driving over rumble strips',
      'Harsh 1-2 or 2-3 shifts',
      'Transmission slipping under load',
      'Delayed engagement when shifting from Park to Drive',
      'Check engine light with transmission codes'
    ],
    solution: 'GM released a torque converter flush procedure using Mobil 1 Synthetic LV ATF HP fluid (replacing Dexron HP) that can resolve early-stage shudder. More severe cases require torque converter replacement with the updated GM design. Complete transmission rebuild may be needed if clutch material has contaminated the valve body. GM extended warranty coverage to 6 years/100,000 miles for torque converter shudder under Customer Satisfaction Program 18302. The 2019+ models received an updated torque converter from the factory.',
    estimatedCost: { min: 500, max: 4500 },
    recallTSB: 'GM Customer Satisfaction Program #18302 - Torque converter shudder, extended warranty 6yr/100k',
    communityRecommendations: [
      {
        type: 'part',
        content: 'Mobil 1 Synthetic LV ATF HP - the updated fluid spec that helps prevent/resolve shudder. Part of GM\'s official fix.',
        partBrand: 'Mobil 1',
        partName: 'Synthetic LV ATF HP',
        partNumber: '19417577',
        upvotes: 0
      },
      {
        type: 'part',
        content: 'GM updated torque converter 24290965 - redesigned clutch material and apply strategy',
        partBrand: 'GM',
        partName: 'Updated Torque Converter (8L90)',
        partNumber: '24290965',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Ask dealer to check if your VIN qualifies for Customer Satisfaction Program 18302 before paying out of pocket',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'A transmission fluid flush with Mobil 1 LV ATF HP (NOT Dexron HP) can resolve early-stage shudder without replacing the torque converter',
        upvotes: 0
      }
    ]
  },
  {
    id: 'cadillac-escalade-10speed-shudder-2021',
    make: 'Cadillac',
    model: 'Escalade',
    years: { start: 2021, end: 2025 },
    title: '10L80 Transmission Harsh Shifting and Shudder',
    severity: 'moderate',
    category: 'transmission',
    description: 'The 5th generation Escalade (2021+) uses the GM 10L80 10-speed automatic transmission. While improved over the 8L90, some owners report harsh shifting, shudder at light throttle, and delayed shifts. The 10-speed has numerous clutch packs and a complex valve body with frequent adaptive learning resets needed. Some units develop torque converter shudder similar to the 8L90 issue. GM has released multiple TCM software updates to address shift quality. The issue is less prevalent than the 8L90 but still documented.',
    symptoms: [
      'Harsh or clunky shifts, especially 1-2 and 3-4',
      'Shudder at light throttle cruising',
      'Delayed downshift response',
      'Hunting between gears on hills',
      'Transmission feels "confused" in stop-and-go traffic'
    ],
    solution: 'First step is a TCM (Transmission Control Module) recalibration at the dealer - GM has released multiple software updates. A full transmission fluid exchange with the correct Mobil 1 LV ATF HP fluid can help. For persistent shudder, torque converter inspection/replacement may be needed. Some owners report improved shift quality after the transmission "learns" their driving style over 500+ miles after a reset.',
    estimatedCost: { min: 200, max: 3500 },
    recallTSB: 'Multiple GM TSBs for 10L80 shift quality - check with dealer for latest calibration',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Have the dealer perform a TCM recalibration first - this is often covered under warranty and resolves most shift complaints',
        upvotes: 0
      },
      {
        type: 'part',
        content: 'Mobil 1 Synthetic LV ATF HP 19417577 - correct fluid for the 10L80, use during fluid exchange',
        partBrand: 'Mobil 1',
        partName: 'Synthetic LV ATF HP',
        partNumber: '19417577',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'After a TCM reset, drive normally for 500+ miles to allow the transmission to relearn your driving patterns before judging shift quality',
        upvotes: 0
      }
    ]
  },
  {
    id: 'cadillac-escalade-transfer-case-2007',
    make: 'Cadillac',
    model: 'Escalade',
    years: { start: 2007, end: 2020 },
    title: 'Transfer Case Encoder Motor and Chain Failure',
    severity: 'moderate',
    category: 'drivetrain',
    description: 'The Escalade AWD system uses a transfer case (NP149 full-time AWD or NP246 selectable 4WD on ESV models) that commonly experiences encoder motor failure and internal chain stretch. The encoder motor controls the transfer case mode selection and wears out between 80,000-130,000 miles. Symptoms include grinding noises when shifting between 2WD/4WD, SERVICE 4WD messages, and the system defaulting to 2WD. Internal chain stretch can cause a whining noise and eventual failure. Transfer case fluid changes are often neglected, accelerating wear.',
    symptoms: [
      'SERVICE 4WD or SERVICE AWD message on dash',
      'Grinding noise when shifting transfer case modes',
      'Clunking on acceleration from stop',
      'Whining noise from under vehicle at highway speed',
      'Transfer case stuck in one mode',
      'Vibration at 40-60 mph that comes and goes'
    ],
    solution: 'Diagnose the specific failure. The encoder motor (shift motor) is the most common failure and can be replaced independently for $300-600. Internal chain stretch requires transfer case rebuild or replacement. Regular transfer case fluid changes every 50,000 miles with Auto-Trak II fluid (NP149) or Dexron VI (NP246) can prevent premature wear. Some owners upgrade to a Merchant Automotive encoder motor for improved longevity.',
    estimatedCost: { min: 300, max: 2500 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'Dorman 600-910 transfer case encoder motor - quality aftermarket replacement for the shift motor',
        partBrand: 'Dorman',
        partName: 'Transfer Case Shift Motor',
        partNumber: '600-910',
        upvotes: 0
      },
      {
        type: 'part',
        content: 'GM Auto-Trak II Transfer Case Fluid 88862472 - correct fluid for NP149 AWD transfer case',
        partBrand: 'GM',
        partName: 'Auto-Trak II Transfer Case Fluid',
        partNumber: '88862472',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Change transfer case fluid every 50k miles - GM says "lifetime" but preventive changes extend transfer case life significantly',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'Using the wrong fluid (Dexron in NP149 or vice versa) will damage the transfer case clutch packs',
        upvotes: 0
      }
    ]
  },
  {
    id: 'cadillac-escalade-instrument-cluster-2003',
    make: 'Cadillac',
    model: 'Escalade',
    years: { start: 2003, end: 2006 },
    title: 'Instrument Cluster Gauge Failure (Stepper Motors)',
    severity: 'moderate',
    category: 'electrical',
    description: 'The 2003-2006 Escalade (and all GM full-size trucks of this era) suffer from widespread instrument cluster gauge failure caused by defective stepper motors. The speedometer, tachometer, fuel gauge, and temperature gauge all use small stepper motors that fail from thermal cycling. Symptoms range from erratic gauge readings to completely dead gauges. GM issued a special coverage for some models but many Escalades are now outside that coverage. This affects nearly every 2003-2006 Escalade eventually.',
    symptoms: [
      'Speedometer reads incorrectly or sticks at one position',
      'Gauges sweep to maximum then return to zero',
      'Fuel gauge reads empty when tank is full (or vice versa)',
      'Temperature gauge erratic or non-functional',
      'All gauges dead or intermittent',
      'Gauges work sometimes and fail in hot/cold weather'
    ],
    solution: 'Replace the stepper motors in the instrument cluster. This can be done by sending the cluster to a rebuild service (many online), doing it yourself with a stepper motor kit ($20-40 for motors), or buying a Dorman remanufactured cluster. The stepper motor replacement is a common DIY repair requiring basic soldering skills. Professional cluster rebuild services cost $150-250 and include all motors plus LED backlighting upgrade. Dorman offers complete remanufactured clusters.',
    estimatedCost: { min: 50, max: 350 },
    recallTSB: 'GM Special Coverage #07036 - Instrument cluster (limited VINs and years)',
    communityRecommendations: [
      {
        type: 'part',
        content: 'Dorman 599-164 remanufactured instrument cluster - complete plug-and-play replacement',
        partBrand: 'Dorman',
        partName: 'Remanufactured Instrument Cluster',
        partNumber: '599-164',
        upvotes: 0
      },
      {
        type: 'part',
        content: 'X27.168 stepper motor kit (set of 6) - DIY replacement for all cluster gauges, requires soldering',
        partBrand: 'Switec/Juken',
        partName: 'X27.168 Stepper Motors (6-pack)',
        partNumber: 'X27.168',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'If replacing stepper motors yourself, also replace the cluster backlighting with LEDs at the same time - the original bulbs are also prone to failure',
        upvotes: 0
      }
    ]
  },
  {
    id: 'cadillac-escalade-brake-lines-2007',
    make: 'Cadillac',
    model: 'Escalade',
    years: { start: 2007, end: 2014 },
    title: 'Brake Line Corrosion and Failure (Rust Belt)',
    severity: 'high',
    category: 'brakes',
    description: 'The 2007-2014 Escalade (and all GM full-size trucks) are prone to severe brake line corrosion, particularly in northern US states and Canada where road salt is used. The factory steel brake lines corrode from the inside out, leading to sudden brake line rupture and complete loss of braking. This is an extremely dangerous safety issue. GM issued recalls for some models but not all affected vehicles were covered. The issue is accelerated by road salt, humidity, and age. Even low-mileage vehicles in rust belt states are affected.',
    symptoms: [
      'Brake pedal feels soft or spongy',
      'Brake fluid level dropping without visible external leak',
      'Visible rust or flaking on brake lines under vehicle',
      'Brake warning light illuminated',
      'Brake pedal goes to floor - complete brake failure',
      'Wet spots on ground under vehicle (brake fluid)'
    ],
    solution: 'Inspect all brake lines thoroughly, particularly along the frame rail and near the rear axle. Replace any corroded lines immediately. Dorman offers pre-bent stainless steel replacement brake line kits that are corrosion-resistant and direct-fit. The entire vehicle brake line set should be replaced if significant corrosion is found - partial replacement leaves other corroded lines ready to fail. This is a safety-critical repair that should not be delayed.',
    estimatedCost: { min: 500, max: 1500 },
    recallTSB: 'NHTSA Recall #17V-449 - Brake line corrosion (limited VINs)',
    communityRecommendations: [
      {
        type: 'part',
        content: 'Dorman 919-162 stainless steel brake line kit - complete pre-bent replacement set, corrosion resistant',
        partBrand: 'Dorman',
        partName: 'Stainless Steel Brake Line Kit',
        partNumber: '919-162',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'This is a SAFETY CRITICAL issue - if you see any rust on brake lines, get them inspected and replaced immediately. A sudden brake line failure at highway speed is life-threatening.',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Even if your Escalade is not in the recall, have brake lines inspected annually if you live in a salt/rust state',
        upvotes: 0
      }
    ]
  },
  {
    id: 'cadillac-escalade-oil-consumption-2015',
    make: 'Cadillac',
    model: 'Escalade',
    years: { start: 2015, end: 2020 },
    title: 'Excessive Oil Consumption - 6.2L EcoTec3 V8',
    severity: 'moderate',
    category: 'engine',
    description: 'The 2015-2020 Escalade\'s 6.2L L86 EcoTec3 V8 can consume excessive oil, sometimes 1 quart per 1,000-2,000 miles. The primary causes are the AFM system (oil used to actuate lifters is consumed), low-tension piston rings designed for fuel economy, and PCV system issues. GM considers up to 1 quart per 2,000 miles "normal" but many owners find this unacceptable for a $80,000+ vehicle. High oil consumption can foul catalytic converters and lead to engine damage if oil level is not monitored closely.',
    symptoms: [
      'Oil level drops between oil changes requiring top-offs',
      'Blue-gray smoke from exhaust on startup or acceleration',
      'Low oil level warning on dash',
      'Fouled spark plugs (oil-fouled on AFM cylinders)',
      'Catalytic converter efficiency codes (P0420/P0430)',
      'Consuming 1+ quart per 2,000 miles'
    ],
    solution: 'First, document oil consumption with dealer using GM oil consumption test procedure. If confirmed excessive, GM may authorize piston ring replacement under powertrain warranty. An AFM delete (see AFM lifter failure issue) can reduce oil consumption by eliminating the oil-hungry lifter actuation system. Updated PCV valve and valve cover can help. Using a slightly heavier oil weight (5W-30 instead of 0W-20) is an owner-reported partial fix but may affect warranty.',
    estimatedCost: { min: 100, max: 4000 },
    recallTSB: 'GM PIP5713 - Oil consumption on Gen V V8 engines',
    communityRecommendations: [
      {
        type: 'part',
        content: 'GM 12673000 updated PCV valve - revised design helps reduce oil consumption',
        partBrand: 'GM',
        partName: 'Updated PCV Valve',
        partNumber: '12673000',
        upvotes: 0
      },
      {
        type: 'part',
        content: 'Range Technology AFM Disabler RA003 - preventing AFM activation reduces oil consumption from lifter actuation',
        partBrand: 'Range Technology',
        partName: 'AFM Disabler',
        partNumber: 'RA003',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Ask dealer to perform an official GM oil consumption test - if it exceeds 1qt/2,000 miles, GM may cover piston ring replacement under warranty',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Check oil level every 1,000 miles and keep 2 extra quarts in the vehicle - do not let it get more than 1 quart low',
        upvotes: 0
      }
    ]
  }
];

console.log('Adding ' + cadillacEscaladeIssues.length + ' Cadillac Escalade issues...');
knownIssues.issues.push(...cadillacEscaladeIssues);

fs.writeFileSync(dbPath, JSON.stringify(knownIssues, null, 2));

console.log('Successfully added ' + cadillacEscaladeIssues.length + ' Cadillac Escalade issues');
console.log('Total issues in database: ' + knownIssues.issues.length);
