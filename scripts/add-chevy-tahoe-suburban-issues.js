const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const knownIssues = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Chevrolet Tahoe (2000-2025) and Suburban (2000-2025)
// GMT800 (2000-2006): 4.8L/5.3L Vortec
// GMT900 (2007-2014): 5.3L/6.0L/6.2L Vortec
// K2XX (2015-2020): 5.3L/6.2L EcoTec3
// T1XX (2021-2025): 5.3L/6.2L L87, 3.0L Duramax diesel

const chevyTahoeSuburbanIssues = [
  {
    id: 'chevy-tahoe-afm-lifter-2007',
    make: 'Chevrolet',
    model: 'Tahoe',
    years: { start: 2007, end: 2020 },
    title: 'AFM/DOD Lifter Failure - V8 Cylinder Deactivation',
    severity: 'high',
    category: 'engine',
    description: 'The Tahoe 5.3L and 6.2L V8 engines with Active Fuel Management (AFM) use collapsible hydraulic lifters that commonly fail between 80,000-120,000 miles. Failed AFM lifters cause misfires on deactivation cylinders (1, 4, 6, 7), ticking noises, and potential camshaft and cylinder wall damage. This is the same issue affecting the Silverado and Escalade. GM issued TSB #18-NA-077 acknowledging the problem. The VLOM (Valve Lifter Oil Manifold) must be replaced along with all 16 lifters.',
    symptoms: [
      'Misfire codes P0300, P0301, P0304, P0306, P0307',
      'Ticking or tapping noise from engine',
      'Rough idle or engine shake',
      'Check engine light',
      'Reduced power or limp mode',
      'Metal debris in oil from collapsed lifter'
    ],
    solution: 'Replace all 16 lifters and VLOM assembly. Many owners perform an AFM delete with non-AFM cam, lifters, and Valley cover using a Texas Speed or BTR kit. A Range Technology AFM Disabler (RA003B) can prevent AFM activation as a preventive measure on engines with good lifters. Labor is 12-18 hours.',
    estimatedCost: { min: 3000, max: 6000 },
    recallTSB: 'GM TSB #18-NA-077 - Lifter failure on 5.3L/6.2L V8',
    communityRecommendations: [
      {
        type: 'part',
        content: 'GM 12639516 VLOM (Valve Lifter Oil Manifold) - must replace with lifters to prevent repeat failure',
        partBrand: 'GM',
        partName: 'VLOM Assembly',
        partNumber: '12639516',
        upvotes: 0
      },
      {
        type: 'part',
        content: 'Texas Speed DOD/AFM Delete Kit - includes non-AFM cam, lifters, pushrods, springs, Valley cover. Eliminates AFM entirely.',
        partBrand: 'Texas Speed',
        partName: 'DOD/AFM Delete Kit',
        partNumber: 'TSP-AFM-DELETE',
        upvotes: 0
      },
      {
        type: 'part',
        content: 'Range Technology AFM/DFM Disabler RA003B - plug-in OBD-II device keeps engine in V8 mode. No tune required. Preventive measure.',
        partBrand: 'Range Technology',
        partName: 'AFM/DFM Disabler',
        partNumber: 'RA003B',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'Do NOT ignore lifter tick - a collapsed lifter scores the camshaft and can drop a valve into the cylinder, destroying the engine',
        upvotes: 0
      }
    ]
  },
  {
    id: 'chevy-tahoe-transmission-shudder-2015',
    make: 'Chevrolet',
    model: 'Tahoe',
    years: { start: 2015, end: 2020 },
    title: '8L90 8-Speed Transmission Shudder',
    severity: 'high',
    category: 'transmission',
    description: 'The 2015-2020 Tahoe uses the GM 8L90 8-speed automatic with the same widespread torque converter shudder affecting Silverado and Escalade. Shudder occurs at light throttle between 25-50 mph. Root cause is torque converter clutch material contaminating the fluid. GM extended warranty to 6 years/100,000 miles under Customer Satisfaction Program 18302.',
    symptoms: [
      'Shudder/vibration at light throttle 25-50 mph',
      'Feels like driving over rumble strips',
      'Harsh 1-2 or 2-3 shifts',
      'Transmission slipping',
      'Delayed Park to Drive engagement'
    ],
    solution: 'Fluid exchange with Mobil 1 Synthetic LV ATF HP (GM 19417577) can resolve early-stage shudder. Severe cases need torque converter replacement. Check if VIN qualifies for Customer Satisfaction Program 18302.',
    estimatedCost: { min: 500, max: 4500 },
    recallTSB: 'GM Customer Satisfaction Program #18302 - 6yr/100k torque converter shudder coverage',
    communityRecommendations: [
      {
        type: 'part',
        content: 'Mobil 1 Synthetic LV ATF HP (GM 19417577 / Mobil 124715) - updated fluid that resolves shudder. DEXRON HP spec.',
        partBrand: 'Mobil 1',
        partName: 'Synthetic LV ATF HP',
        partNumber: '19417577',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Ask dealer about Customer Satisfaction Program 18302 before paying - covers torque converter shudder to 6yr/100k miles',
        upvotes: 0
      }
    ]
  },
  {
    id: 'chevy-tahoe-10speed-2021',
    make: 'Chevrolet',
    model: 'Tahoe',
    years: { start: 2021, end: 2025 },
    title: '10L80 10-Speed Transmission Harsh Shifting',
    severity: 'moderate',
    category: 'transmission',
    description: 'The 2021+ Tahoe uses the GM 10L80 10-speed with reports of harsh shifting, delayed engagement, and shift hunting between gears. GM has released multiple TCM calibration updates. The transmission requires DEXRON ULV fluid (NOT DEXRON HP). Most shift quality issues are resolved with the latest software calibration.',
    symptoms: [
      'Harsh or clunky 1-2 and 3-4 shifts',
      'Delayed shift from Park to Drive',
      'Hunting between gears on hills',
      'Clunky low-speed maneuvers'
    ],
    solution: 'TCM recalibration at dealer with latest software. Full fluid exchange with ACDelco DEXRON ULV (19352619). Allow 500+ miles after reset for transmission to relearn driving patterns.',
    estimatedCost: { min: 0, max: 500 },
    recallTSB: 'Multiple GM TSBs for 10L80 shift calibration',
    communityRecommendations: [
      {
        type: 'part',
        content: 'ACDelco DEXRON ULV transmission fluid 19352619 - correct fluid for 10L80. NOT interchangeable with DEXRON HP.',
        partBrand: 'ACDelco',
        partName: 'DEXRON ULV ATF',
        partNumber: '19352619',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'After a TCM reset, drive 500+ miles normally before judging shift quality - the 10-speed needs significant relearn time',
        upvotes: 0
      }
    ]
  },
  {
    id: 'chevy-tahoe-air-suspension-2007',
    make: 'Chevrolet',
    model: 'Tahoe',
    years: { start: 2007, end: 2020 },
    title: 'Autoride Air Suspension Compressor and Air Spring Failure',
    severity: 'moderate',
    category: 'suspension',
    description: 'Tahoe models with Autoride (RPO Z55) or Magnetic Ride Control (RPO Z95) use air springs and an electronic compressor that fail between 80,000-120,000 miles. Air springs crack from age causing the vehicle to sag. The compressor burns out from overwork. Same system as Escalade and Yukon. Many owners convert to conventional coil springs.',
    symptoms: [
      'Vehicle sagging at one or more corners',
      'Air compressor running constantly',
      'SERVICE RIDE CONTROL message',
      'Harsh or bouncy ride',
      'Compressor stops working - vehicle sits low'
    ],
    solution: 'Replace failed air springs and/or compressor. Or convert to coil springs with an Arnott or Strutmasters conversion kit which eliminates recurring failures. Arnott C-2835 is the popular front/rear conversion with electronic bypass module.',
    estimatedCost: { min: 600, max: 3000 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'Arnott P-2793 air suspension compressor - complete assembly with airline, dryer, relay. Lifetime warranty.',
        partBrand: 'Arnott',
        partName: 'Air Suspension Compressor',
        partNumber: 'P-2793',
        upvotes: 0
      },
      {
        type: 'part',
        content: 'Arnott C-2835 coil spring conversion kit - front and rear with electronic bypass module for 2007-2014 Tahoe/Yukon (short wheelbase)',
        partBrand: 'Arnott',
        partName: 'Air-to-Coil Conversion Kit',
        partNumber: 'C-2835',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'If one air spring is leaking, replace both rears together - the other is close to failure',
        upvotes: 0
      }
    ]
  },
  {
    id: 'chevy-tahoe-brake-lines-2007',
    make: 'Chevrolet',
    model: 'Tahoe',
    years: { start: 2007, end: 2014 },
    title: 'Brake Line Corrosion and Failure (Rust Belt)',
    severity: 'high',
    category: 'brakes',
    description: 'The 2007-2014 Tahoe (and all GMT900 platform vehicles) suffer from brake line corrosion in salt-belt states. Factory steel lines corrode internally and can rupture without warning, causing complete brake failure. This is the same safety-critical issue affecting Escalade, Silverado, Suburban, and Yukon of the same era.',
    symptoms: [
      'Soft or spongy brake pedal',
      'Brake fluid level dropping',
      'Visible rust on brake lines under vehicle',
      'Brake warning light',
      'Brake pedal goes to floor'
    ],
    solution: 'Inspect brake lines thoroughly. Replace corroded lines with Dorman stainless steel pre-bent replacement kits. Replace entire vehicle brake line set if significant corrosion found.',
    estimatedCost: { min: 500, max: 1500 },
    recallTSB: 'NHTSA Recall #17V-449 (limited VINs)',
    communityRecommendations: [
      {
        type: 'part',
        content: 'Dorman 919-164 stainless steel brake line kit - pre-bent for GMT900 platform, corrosion resistant',
        partBrand: 'Dorman',
        partName: 'Stainless Steel Brake Line Kit',
        partNumber: '919-164',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'SAFETY CRITICAL - if you see rust on brake lines, get them inspected/replaced immediately. Sudden failure at highway speed is life-threatening.',
        upvotes: 0
      }
    ]
  },
  {
    id: 'chevy-tahoe-instrument-cluster-2003',
    make: 'Chevrolet',
    model: 'Tahoe',
    years: { start: 2003, end: 2006 },
    title: 'Instrument Cluster Stepper Motor Failure',
    severity: 'moderate',
    category: 'electrical',
    description: 'The 2003-2006 Tahoe has the same instrument cluster gauge failure as all GMT800 GM trucks. The stepper motors driving speedometer, tach, fuel, and temp gauges fail from thermal cycling. Gauges read incorrectly, stick, or go dead.',
    symptoms: [
      'Speedometer sticks or reads wrong',
      'Gauges sweep to max then return to zero',
      'Fuel gauge reads empty when full',
      'All gauges intermittent or dead'
    ],
    solution: 'Replace stepper motors (X27.168 kit, $20-40 DIY) or install Dorman remanufactured cluster. Professional rebuild services cost $150-250.',
    estimatedCost: { min: 50, max: 350 },
    recallTSB: 'GM Special Coverage #07036 (limited VINs)',
    communityRecommendations: [
      {
        type: 'part',
        content: 'Dorman 599-300 remanufactured instrument cluster - plug-and-play for 2003-2006 Tahoe',
        partBrand: 'Dorman',
        partName: 'Remanufactured Instrument Cluster',
        partNumber: '599-300',
        upvotes: 0
      },
      {
        type: 'part',
        content: 'X27.168 stepper motor kit (6-pack) - DIY repair for all gauges, requires soldering',
        partBrand: 'Switec/Juken',
        partName: 'X27.168 Stepper Motors',
        partNumber: 'X27.168',
        upvotes: 0
      }
    ]
  },
  // Suburban issues
  {
    id: 'chevy-suburban-afm-lifter-2007',
    make: 'Chevrolet',
    model: 'Suburban',
    years: { start: 2007, end: 2020 },
    title: 'AFM/DOD Lifter Failure - V8 Cylinder Deactivation',
    severity: 'high',
    category: 'engine',
    description: 'The Suburban shares the same 5.3L and 6.2L V8 engines with AFM as the Tahoe, Silverado, and Escalade. AFM lifter failure is the #1 reliability concern, causing misfires, engine noise, and potential catastrophic damage between 80,000-120,000 miles. Same root cause and repair as all GM full-size vehicles.',
    symptoms: [
      'Misfire codes on AFM cylinders (P0300, P0301, P0304, P0306, P0307)',
      'Ticking or tapping noise',
      'Rough idle or shake',
      'Check engine light',
      'Reduced power'
    ],
    solution: 'Replace all 16 lifters and VLOM. AFM delete with Texas Speed or BTR kit recommended. Range Technology AFM Disabler RA003B for prevention.',
    estimatedCost: { min: 3000, max: 6000 },
    recallTSB: 'GM TSB #18-NA-077',
    communityRecommendations: [
      {
        type: 'part',
        content: 'Texas Speed DOD/AFM Delete Kit - complete kit to eliminate AFM system. Requires custom tune.',
        partBrand: 'Texas Speed',
        partName: 'DOD/AFM Delete Kit',
        partNumber: 'TSP-AFM-DELETE',
        upvotes: 0
      },
      {
        type: 'part',
        content: 'Range Technology AFM Disabler RA003B - preventive plug-in device, no tune needed',
        partBrand: 'Range Technology',
        partName: 'AFM/DFM Disabler',
        partNumber: 'RA003B',
        upvotes: 0
      }
    ]
  },
  {
    id: 'chevy-suburban-transmission-shudder-2015',
    make: 'Chevrolet',
    model: 'Suburban',
    years: { start: 2015, end: 2020 },
    title: '8L90 Transmission Shudder',
    severity: 'high',
    category: 'transmission',
    description: 'Same 8L90 torque converter shudder as Tahoe/Silverado/Escalade. Light throttle shudder between 25-50 mph. GM Customer Satisfaction Program 18302 extends coverage to 6yr/100k.',
    symptoms: [
      'Shudder at light throttle 25-50 mph',
      'Harsh shifts',
      'Transmission slipping'
    ],
    solution: 'Fluid exchange with Mobil 1 LV ATF HP (19417577). Torque converter replacement for severe cases. Check CSP 18302 coverage.',
    estimatedCost: { min: 500, max: 4500 },
    recallTSB: 'GM Customer Satisfaction Program #18302',
    communityRecommendations: [
      {
        type: 'part',
        content: 'Mobil 1 Synthetic LV ATF HP (GM 19417577) - updated DEXRON HP fluid that resolves shudder',
        partBrand: 'Mobil 1',
        partName: 'Synthetic LV ATF HP',
        partNumber: '19417577',
        upvotes: 0
      }
    ]
  },
  {
    id: 'chevy-suburban-brake-lines-2007',
    make: 'Chevrolet',
    model: 'Suburban',
    years: { start: 2007, end: 2014 },
    title: 'Brake Line Corrosion (Rust Belt)',
    severity: 'high',
    category: 'brakes',
    description: 'Same brake line corrosion issue as all GMT900 full-size vehicles. Steel lines corrode in salt states and can rupture without warning.',
    symptoms: [
      'Soft brake pedal',
      'Brake fluid dropping',
      'Rust on brake lines',
      'Brake pedal to floor'
    ],
    solution: 'Replace with Dorman stainless steel brake line kit.',
    estimatedCost: { min: 500, max: 1500 },
    recallTSB: 'NHTSA Recall #17V-449 (limited VINs)',
    communityRecommendations: [
      {
        type: 'part',
        content: 'Dorman 919-149 stainless steel brake line kit - for Suburban/Yukon XL long wheelbase GMT900',
        partBrand: 'Dorman',
        partName: 'Stainless Steel Brake Line Kit (LWB)',
        partNumber: '919-149',
        upvotes: 0
      }
    ]
  },
  {
    id: 'chevy-suburban-ac-rear-2007',
    make: 'Chevrolet',
    model: 'Suburban',
    years: { start: 2007, end: 2020 },
    title: 'Rear AC System Failure and Refrigerant Leaks',
    severity: 'low',
    category: 'other',
    description: 'The Suburban has a rear AC system with additional lines, an expansion valve, and evaporator that add failure points. The rear AC lines are prone to corrosion and refrigerant leaks, especially in rust-belt states. The rear expansion valve can freeze up, blocking flow. Rear AC blower motor failure is also common at higher mileage. Losing rear AC in a vehicle designed for 7-9 passengers is a significant comfort issue.',
    symptoms: [
      'Rear AC blows warm while front works fine',
      'Hissing noise from rear AC lines',
      'Rear AC blower motor not working',
      'Refrigerant leaks requiring frequent recharges',
      'Front AC also weakens (shared system, low refrigerant)'
    ],
    solution: 'Diagnose with UV dye to find leak location. Rear AC line replacement for corroded lines. Rear expansion valve replacement if icing. Rear blower motor is accessible through the right rear quarter panel. Full system evacuation and recharge after any line repair.',
    estimatedCost: { min: 200, max: 1500 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Have a shop add UV dye to the AC system to pinpoint the leak location before replacing parts',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'If recharging frequently but no visible leak, the rear lines running under the vehicle are the most likely culprit',
        upvotes: 0
      }
    ]
  }
];

console.log('Adding ' + chevyTahoeSuburbanIssues.length + ' Chevrolet Tahoe/Suburban issues...');
knownIssues.issues.push(...chevyTahoeSuburbanIssues);

fs.writeFileSync(dbPath, JSON.stringify(knownIssues, null, 2));

console.log('Successfully added ' + chevyTahoeSuburbanIssues.length + ' Chevrolet Tahoe/Suburban issues');
console.log('Total issues in database: ' + knownIssues.issues.length);
