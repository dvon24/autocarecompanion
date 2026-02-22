const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const knownIssues = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// BMW i3 (I01) issues - 2014-2021
// Powertrain: eDrive electric motor, optional Range Extender (W20 647cc 2-cylinder)
// All-electric (BEV) and Range Extender (REx) variants

const bmwI3Issues = [
  {
    id: 'bmw-i3-12v-battery-drain-2014',
    make: 'BMW',
    model: 'i3',
    years: { start: 2014, end: 2021 },
    title: '12V Auxiliary Battery Drain - All I01 Models',
    severity: 'high',
    description: 'The BMW i3\'s 12V auxiliary AGM battery (20Ah) is the single most common complaint across all model years. The small-capacity battery powers all vehicle computers and CAN-bus communication modules. When the battery weakens, modules fail to receive sleep/shutdown signals, causing a parasitic drain feedback loop. The DC-DC converter cannot properly charge a degraded 12V battery from the HV pack. Affected vehicles show cascading error messages for ABS, drivetrain, steering, and braking systems that all resolve once the 12V battery is replaced. Battery life is typically 2-4 years. Must be properly registered to the IBS (Intelligent Battery Sensor) after replacement using ISTA, BimmerLink, or dealer tools.',
    symptoms: [
      '"Increased battery discharge when stationary" warning message',
      'Multiple simultaneous warning lights (ABS, drivetrain, steering, brakes)',
      'Vehicle won\'t start or enter "Ready" mode',
      'Infotainment system reboots or goes blank',
      'Remote functions (app, climate preconditioning) stop working',
      'Cooling fan runs continuously with ignition off',
      'Check engine light with no actual engine fault'
    ],
    solution: 'Replace the 12V AGM auxiliary battery. OEM is East Penn/Deka AUX18L (20Ah AGM). BMW part number 61219321815. Must register the new battery to the vehicle using ISTA, BimmerLink, or Carly for BMW so the charging algorithm resets. Aftermarket alternatives include Exide EK151. Battery location is in the engine bay (frunk). A BMW-approved battery charger/maintainer (per SI B04 23 10) is recommended for vehicles that sit for extended periods. Typical battery life is 2-4 years; preventive replacement at 3 years avoids stranding.',
    estimatedCost: { min: 150, max: 400 },
    recallTSB: 'SI B04 23 10 - Discharged 12V Battery maintenance bulletin',
    communityRecommendations: [
      {
        type: 'part',
        content: 'BMW OEM 20Ah AGM battery (61219321815) - East Penn/Deka AUX18L - direct fit replacement',
        partBrand: 'BMW / East Penn',
        partName: '12V AGM Auxiliary Battery 20Ah',
        partNumber: '61219321815',
        needsReview: true
      },
      {
        type: 'part',
        content: 'Exide EK151 AGM battery - aftermarket alternative used by European owners, under $50',
        partBrand: 'Exide',
        partName: 'EK151 AGM Start-Stop Battery',
        partNumber: 'EK151',
        needsReview: true
      },
      {
        type: 'tip',
        content: 'MUST register battery after replacement using BimmerLink app ($30) or dealer ISTA - failure to register causes charging issues',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'Do NOT use a non-AGM battery - the i3 charging system requires AGM chemistry. Using standard lead-acid will damage the battery and system.',
        upvotes: 0
      }
    ]
  },
  {
    id: 'bmw-i3-ac-compressor-black-death-2014',
    make: 'BMW',
    model: 'i3',
    years: { start: 2014, end: 2021 },
    title: 'Electric A/C Compressor Catastrophic Failure ("Black Death") - All I01',
    severity: 'high',
    description: 'The BMW i3 uses a unique direct-refrigerant battery cooling system where the A/C compressor circulates refrigerant through microchannel extrusions in the battery pack. When the electric compressor fails internally, metal shavings from bearing spalling contaminate the entire refrigerant circuit including the battery cooling channels. This "Black Death" scenario can total the vehicle as the battery cooling system cannot be flushed - requiring full battery pack and cooling system replacement ($10,600-$22,000+). BMW produced 6 different compressor revisions between 2013-2019, indicating ongoing reliability issues. The i3 lacks an industry-standard AC trap/filter in the dryer that would catch debris. Failures most common in hot climates (Arizona, Florida, Texas). CARB-state vehicles have 15-year/150,000-mile compressor warranty coverage; other states get 7-year/70,000-mile coverage as an emission-related component.',
    symptoms: [
      'Loud whirring or "mooing" (cow-like) sound from compressor area',
      'Metallic rattling noise preceding failure',
      'A/C stops blowing cold air',
      'Battery thermal management warnings',
      'Reduced charging speed due to overheating battery',
      'Fault code 801252: "Electric A/C compressor internal fault detected"',
      'Drivetrain power reduction in hot weather'
    ],
    solution: 'If caught early (noise but still functioning), replace compressor before catastrophic failure. Latest OEM compressor: BMW 64529496107 (supersedes 64529320855, 64529343806, 64529347662, 64529364868). FCP Euro price ~$1,756. If metal contamination has occurred, entire system including battery cooling channels must be replaced ($10,600+). MUST use POE (Polyolester) anti-electrostatic compressor oil - standard PAG oil will destroy EV compressors. Independent AC shops that understand EV compressors can save 60-80% vs dealer. RYC Automotive offers remanufactured compressor (RYC-i3-01) as budget option. Aftermarket Nissens condenser ($152) available vs OEM ($581 via FCP Euro).',
    estimatedCost: { min: 2500, max: 22000 },
    recallTSB: 'CARB states: 15yr/150k mile compressor warranty; Federal: 7yr/70k miles as emission component',
    communityRecommendations: [
      {
        type: 'part',
        content: 'BMW OEM electric AC compressor latest revision (64529496107) - supersedes all prior versions',
        partBrand: 'BMW',
        partName: 'Electric A/C Compressor (Latest Revision)',
        partNumber: '64529496107',
        needsReview: true
      },
      {
        type: 'part',
        content: 'RYC Automotive remanufactured AC compressor (RYC-i3-01) - fits 2014-2019 i3/i3s',
        partBrand: 'RYC Automotive',
        partName: 'Remanufactured Electric AC Compressor',
        partNumber: 'RYC-i3-01',
        needsReview: true
      },
      {
        type: 'part',
        content: 'Nissens condenser - 80% cheaper than BMW OEM condenser when doing full system repair',
        partBrand: 'Nissens',
        partName: 'A/C Condenser',
        needsReview: true
      },
      {
        type: 'warning',
        content: 'If dealer finds metal shavings in system, check CARB-state warranty coverage FIRST - 15yr/150k coverage in CA, CT, DE, ME, MD, MA, NJ, NY, OR, PA, RI, VT, WA',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Shop MUST use POE anti-electrostatic compressor oil, NOT standard PAG oil - wrong oil will burn out the new compressor immediately',
        upvotes: 0
      }
    ]
  },
  {
    id: 'bmw-i3-rex-stale-fuel-2014',
    make: 'BMW',
    model: 'i3',
    years: { start: 2014, end: 2021 },
    title: 'Range Extender Stale Fuel & Engine Problems - I01 REx Only',
    severity: 'moderate',
    description: 'The BMW i3 REx (Range Extender) uses a W20 647cc 2-cylinder engine derived from the BMW C650 GT scooter. Because the REx engine runs infrequently (only when battery is depleted), fuel sits stale in the small 2.4-gallon tank for extended periods. Stale fuel creates varnish deposits that clog injectors and damage the fuel pump. BMW pressurizes the fuel tank to slow degradation, but owners who rarely use gasoline still experience fuel system issues. Additionally, the REx must run for minimum 10-13 minutes per session to burn off combustion byproducts (mainly water) - short runs cause internal corrosion. Common failures include fuel pump relay ($20-30), injectors, ignition coils, and crankshaft position sensor. The engine is rated at only 34 HP and cannot maintain highway speeds when battery is depleted.',
    symptoms: [
      'Range Extender error message / won\'t start',
      'Check engine light with misfire codes',
      'Engine stalling during startup',
      'Rough running or vibration when REx activates',
      'Higher than expected fuel consumption',
      'Fuel odor from varnished fuel',
      'Error codes: P0128 (coolant temp), crankshaft position sensor faults'
    ],
    solution: 'Preventive: Run the REx at least every 6 weeks for a minimum of 10-13 minutes to burn off moisture. Use fuel stabilizer (Sta-Bil) if vehicle sits for extended periods. Keep fuel tank above half to reduce vapor space. For fuel pump relay failure (most common), replace relay ($20-30). For injector issues, professional cleaning or replacement required. For coil failures, replace ignition coils. Maintain regular oil changes with BMW-approved oil despite low mileage. Some owners run premium fuel exclusively to reduce varnish formation.',
    estimatedCost: { min: 100, max: 2000 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Run the REx every 6 weeks for at least 13 minutes - prevents stale fuel AND moisture buildup that corrodes internals',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Add Sta-Bil fuel stabilizer to the small tank if you rarely use gasoline - prevents varnish in injectors',
        upvotes: 0
      },
      {
        type: 'part',
        content: 'Fuel pump relay - most common REx failure, cheap fix at $20-30 from BMW or aftermarket',
        partBrand: 'BMW',
        partName: 'Fuel Pump Relay',
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Never overfill the REx fuel tank - BMW pressurizes the tank to preserve fuel. Overfilling disrupts this system.',
        upvotes: 0
      }
    ]
  },
  {
    id: 'bmw-i3-dc-fast-charge-latch-2014',
    make: 'BMW',
    model: 'i3',
    years: { start: 2014, end: 2021 },
    title: 'DC Fast Charging (CCS) Latch Pin & Connector Failure',
    severity: 'moderate',
    description: 'The BMW i3\'s CCS (Combined Charging System) DC fast charging consistently fails due to a design flaw in the charge port locking mechanism. The CCS plug must be latched/locked before DC charging can initiate - unlike AC Level 2 charging which works without a latch. The locking pin mechanism is weak (especially 2014-2016 models), sticks from corrosion and weather exposure, and the heavy CCS cable/plug assembly distorts the charge port socket, breaking critical pin connections. When the plug sags from cable weight, serial data communication pins (repurposed from AC pins during DC sessions) lose contact, causing session failures. This is a widespread issue reported across virtually all i3 model years on mybmwi3.com and Bimmerpost forums.',
    symptoms: [
      'DC fast charge session fails to initiate (AC charging works fine)',
      'Charge port latch clicks but doesn\'t engage',
      'Charging starts then immediately stops',
      '"Charging Interrupted" or "Connection Failed" message',
      'CCS plug won\'t release after charging',
      'Intermittent DC charging success (works sometimes, not others)'
    ],
    solution: 'Simple fix: Apply silicone lubricant or WD-40 to the locking pin at top of charge port every 3-4 months. When connecting CCS plug, lift upward on the handle to ensure full pin engagement. If latch pin is stuck, ream out the hole slightly to reduce friction. For persistent failures: charge port latch actuator replacement (BMW part 61136842870). In severe cases, entire charge port/connector assembly replacement needed. Some owners have had the locking pin hole bored out by a machine shop for permanent fix. Weight support bracket for CCS cable can reduce connector distortion.',
    estimatedCost: { min: 50, max: 1200 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'BMW charge port latch actuator (61136842870) - replacement for failed locking mechanism',
        partBrand: 'BMW',
        partName: 'Charge Port Latch Actuator',
        partNumber: '61136842870',
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Quick fix: Lift UP on CCS plug handle while inserting to ensure latch pin engages - DC won\'t start unless locked',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Apply silicone spray to latch pin every 3-4 months to prevent sticking, especially in humid/cold climates',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'Do NOT force CCS plug if it won\'t latch - repeated forcing damages the charge port pins and can cause electrical issues',
        upvotes: 0
      }
    ]
  },
  {
    id: 'bmw-i3-connectivity-module-2014',
    make: 'BMW',
    model: 'i3',
    years: { start: 2014, end: 2017 },
    title: 'Telematics/Connectivity Module (TCB) 3G Shutdown & Failure',
    severity: 'moderate',
    description: 'BMW i3 models from 2014-2017 shipped with 3G telematics communication boxes (TCB) that became permanently non-functional when AT&T shut down their 3G network in February 2022. Beyond the network shutdown, TCB modules in all years (2014-2021) are a common failure point due to water ingress and internal hardware faults. The TCB is responsible for BMW Connected Drive, remote app functions, real-time traffic, emergency SOS calling, and remote climate preconditioning via the app. Failed TCB also causes 12V battery drain as the module attempts to continuously reconnect. 2018+ models have 4G LTE and are not affected by the network shutdown but can still experience hardware failures. BMW part number 84109843931 for the 4G TCB module. Replacement requires ISTA coding and certificate import.',
    symptoms: [
      'BMW Connected Drive services stop working entirely',
      'Remote app functions (lock, climate, location) non-functional',
      'Emergency SOS calling not available',
      'Real-time traffic data unavailable',
      'Increased 12V battery drain from failed module attempting reconnection',
      '"Communication error" or "Service unavailable" messages'
    ],
    solution: 'For 2014-2017 models: The 3G module is permanently obsolete. BMW offered a discounted 4G TCB upgrade (84109843931) through dealers for some vehicles, but availability is limited. Replacement requires ISTA coding and security certificate import - not a DIY job. For all years: If TCB has hardware failure, replacement with new unit coded to VIN is required. Some owners choose to leave the TCB disconnected to prevent parasitic drain, accepting loss of connected services.',
    estimatedCost: { min: 500, max: 1500 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'BMW 4G LTE TCB module (84109843931) - upgrade path for 3G-equipped 2014-2017 models',
        partBrand: 'BMW',
        partName: '4G LTE Telematics Communication Box',
        partNumber: '84109843931',
        needsReview: true
      },
      {
        type: 'tip',
        content: 'If you don\'t need Connected Drive, disconnecting the failed TCB eliminates its parasitic 12V battery drain',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'TCB replacement requires ISTA dealer tool for coding and security certificate import - cannot be done with aftermarket tools',
        upvotes: 0
      }
    ]
  },
  {
    id: 'bmw-i3-brake-actuator-2014',
    make: 'BMW',
    model: 'i3',
    years: { start: 2014, end: 2021 },
    title: 'Integrated Hydraulic Brake (IHB) Module Failure',
    severity: 'high',
    description: 'The BMW i3 uses an electro-hydraulic integrated brake system that combines regenerative braking with traditional hydraulic braking. The IHB (Integrated Hydraulic Brake) module can fail, causing loss of power-assisted braking and requiring significantly increased pedal effort to stop the vehicle. The brake actuator contains an electric motor and hydraulic pump that provides brake boost and ABS/DSC functions. Signal disruption in the engine position sensor within the module leads to failure of hydraulic brake force support. BMW issued recall 21V-062 for 2020-2021 i3 models, and later expanded with recall 24V-104 covering a broader range. The fix is IHB module replacement with updated software programming. Without power assist, the vehicle can still stop but requires extreme pedal force.',
    symptoms: [
      'Brake pedal becomes very hard to press (loss of power assist)',
      'Yellow or red brake warning light on dashboard',
      '"Brake system malfunction" or "Reduced braking power" message',
      'ABS and DSC warning lights illuminate',
      'Extended stopping distance',
      'Grinding or buzzing noise from brake module area'
    ],
    solution: 'BMW recall remedy: Replace the IHB (Integrated Hydraulic Brake) power brake unit module and perform required vehicle programming. Covered under recall 21V-062 (2020-2021 models) and expanded recall 24V-104. Contact BMW dealer with VIN to check recall eligibility. For non-recall vehicles, IHB module replacement costs $2,500-4,000 at dealer. No aftermarket alternatives available - must use BMW OEM module with dealer programming.',
    estimatedCost: { min: 0, max: 4000 },
    recallTSB: 'Recall 21V-062 (2020-2021 i3); Recall 24V-104 (expanded coverage)',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Check your VIN at bmwusa.com/recall or NHTSA.gov - IHB replacement is free under recall for affected vehicles',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'If brakes feel hard, DO NOT drive - vehicle can still stop but requires extreme pedal force. Get towed to dealer.',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Even if your model year isn\'t listed in the recall, report the issue to NHTSA - BMW has expanded recall coverage multiple times',
        upvotes: 0
      }
    ]
  },
  {
    id: 'bmw-i3-hvac-heater-2014',
    make: 'BMW',
    model: 'i3',
    years: { start: 2014, end: 2021 },
    title: 'Electric Heater & HVAC System Failures - Range Impact',
    severity: 'moderate',
    description: 'The BMW i3\'s cabin heating relies on a high-voltage electric heater (resistive element) that draws significant power from the HV battery, reducing range by 20-40% in cold weather. The electric heater element can fail, leaving the cabin without heat. Additionally, the heat pump (standard on later models, optional on earlier ones) can fail, reverting to resistive heating only and dramatically increasing energy consumption. The i3 does not have waste heat from an ICE to heat the cabin (BEV models), making the HVAC system critical for cold-climate usability. Blower motor failures and HVAC control module issues are also reported across all years.',
    symptoms: [
      'No cabin heat in cold weather',
      'Dramatic range reduction in winter (40%+ loss)',
      'HVAC blower runs but only blows cold air',
      'Climate system error messages',
      'Unusual smells or sounds from HVAC vents',
      'Heat pump compressor not engaging (heat pump-equipped models)'
    ],
    solution: 'Electric heater element replacement ($800-1,500). Heat pump compressor replacement uses same compressor as AC system (64529496107) at $1,756-4,000. Blower motor replacement $300-600. HVAC control module reprogramming or replacement $500-1,000. Pre-conditioning the cabin while plugged in (before driving) reduces range impact significantly. Some owners install aftermarket heated seats and steering wheel to reduce HVAC load.',
    estimatedCost: { min: 300, max: 4000 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Pre-condition the cabin while plugged in before driving - uses grid power instead of battery, preserving range',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Use seat heaters and steering wheel heater instead of cabin heat when possible - uses 10x less energy',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'In cold climates, expect 30-40% range reduction. Plan routes with charging stops accordingly.',
        upvotes: 0
      }
    ]
  }
];

console.log(`Adding ${bmwI3Issues.length} BMW i3 issues...`);
knownIssues.issues.push(...bmwI3Issues);

fs.writeFileSync(dbPath, JSON.stringify(knownIssues, null, 2));

console.log(`Successfully added ${bmwI3Issues.length} BMW i3 issues`);
console.log(`Total issues in database: ${knownIssues.issues.length}`);
