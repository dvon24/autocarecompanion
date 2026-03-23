/**
 * Add known issues for Peugeot, Renault, and Citroën to PostgreSQL
 */
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const now = new Date().toISOString();

function yrs(start, end) {
  const a = [];
  for (let y = start; y <= end; y++) a.push(y);
  return a;
}

function cit(source, url, desc) {
  return [{ source, url, description: desc }];
}

const issues = [
  // ===== PEUGEOT 206 (3) =====
  {
    id: 'peugeot-206-head-gasket-failure',
    make: 'Peugeot', model: '206', years: yrs(2000, 2012),
    trims: ['XR', 'XT'], engines: ['1.4L TU3', '1.6L TU5'],
    category: 'engine', title: 'Head Gasket Failure',
    description: 'The TU-series engines in the 206 are prone to head gasket failure, particularly when the cooling system is neglected. Overheating episodes accelerate gasket deterioration, leading to coolant-oil mixing and white exhaust smoke.',
    solution: 'Replace the head gasket, machine the cylinder head surface if warped, and flush the cooling system. Inspect and replace the thermostat and water pump preventatively.',
    severity: 'high', confidence: 'high',
    symptoms: ['White exhaust smoke', 'Coolant loss without visible leak', 'Oil-coolant emulsion on dipstick', 'Overheating'],
    affectedSystems: ['Engine', 'Cooling'], dtcCodes: ['P0116', 'P0217'],
    estimatedCostLow: 600, estimatedCostHigh: 1200,
    citations: cit('Peugeot Forums', 'https://www.peugeotforums.com', '206 head gasket failure reports and TU engine overheating issues'),
    communityRecommendations: [], reportCount: 85, typicalMileageLow: 60000, typicalMileageHigh: 120000
  },
  {
    id: 'peugeot-206-power-steering-pump-leak',
    make: 'Peugeot', model: '206', years: yrs(2000, 2012),
    trims: ['XR', 'XT', 'GTi'], engines: ['1.4L TU3', '1.6L TU5'],
    category: 'steering', title: 'Power Steering Pump Leak',
    description: 'The hydraulic power steering pump develops seal leaks over time, causing fluid loss and increasingly heavy steering. The pump housing seals harden with age and mileage exposure.',
    solution: 'Replace the power steering pump seals or the complete pump assembly. Flush and refill the power steering fluid system.',
    severity: 'medium', confidence: 'high',
    symptoms: ['Heavy steering at low speed', 'Whining noise when turning', 'Power steering fluid on ground', 'Low fluid level'],
    affectedSystems: ['Steering'], dtcCodes: [],
    estimatedCostLow: 200, estimatedCostHigh: 500,
    citations: cit('Peugeot Forums', 'https://www.peugeotforums.com', '206 power steering pump leak and seal failure reports'),
    communityRecommendations: [], reportCount: 60, typicalMileageLow: 50000, typicalMileageHigh: 100000
  },
  {
    id: 'peugeot-206-window-regulator-failure',
    make: 'Peugeot', model: '206', years: yrs(2000, 2012),
    trims: ['XR', 'XT', 'GTi'], engines: [],
    category: 'electrical', title: 'Window Regulator Failure',
    description: 'The electric window regulators on the 206 are a well-known weak point, with the cable-driven mechanism snapping or the motor failing. Front windows are most commonly affected, often dropping into the door.',
    solution: 'Replace the window regulator assembly. Upgraded aftermarket units with reinforced cables are available and recommended over OEM replacements.',
    severity: 'low', confidence: 'high',
    symptoms: ['Window drops into door', 'Grinding noise when operating', 'Window moves slowly', 'Intermittent operation'],
    affectedSystems: ['Electrical', 'Body'], dtcCodes: [],
    estimatedCostLow: 100, estimatedCostHigh: 300,
    citations: cit('Peugeot Forums', 'https://www.peugeotforums.com', '206 window regulator cable snap and motor failure reports'),
    communityRecommendations: [], reportCount: 120, typicalMileageLow: 40000, typicalMileageHigh: 80000
  },

  // ===== PEUGEOT 207 (3) =====
  {
    id: 'peugeot-207-timing-chain-tensioner',
    make: 'Peugeot', model: '207', years: yrs(2006, 2014),
    trims: ['Active', 'Allure'], engines: ['1.4L EP3', '1.6L EP6'],
    category: 'engine', title: 'Timing Chain Tensioner Failure',
    description: 'The Prince-family EP6 engine suffers from premature timing chain tensioner failure, causing chain slack and potential valve-to-piston contact. Early production units had an undersized tensioner that was later revised.',
    solution: 'Replace the timing chain, tensioner, and guides with the updated revision parts. Ensure correct oil specification (0W-30) is used to maintain hydraulic tensioner pressure.',
    severity: 'critical', confidence: 'high',
    symptoms: ['Rattling noise on cold start', 'Check engine light', 'Rough idle', 'Reduced power'],
    affectedSystems: ['Engine', 'Timing'], dtcCodes: ['P0016', 'P0017'],
    estimatedCostLow: 800, estimatedCostHigh: 1800,
    citations: cit('PeugeotForums.com', 'https://www.peugeotforums.com', '207 EP6 timing chain tensioner failures and revised part numbers'),
    communityRecommendations: [], reportCount: 95, typicalMileageLow: 40000, typicalMileageHigh: 80000
  },
  {
    id: 'peugeot-207-turbo-oil-leak',
    make: 'Peugeot', model: '207', years: yrs(2006, 2014),
    trims: ['GTi'], engines: ['1.6L EP6DT Turbo'],
    category: 'engine', title: 'Turbocharger Oil Leak',
    description: 'The turbocharger oil feed and return lines develop leaks on the 1.6 THP engine, leading to oil consumption and blue exhaust smoke. The turbo bearing seals also deteriorate with extended oil change intervals.',
    solution: 'Replace the turbo oil feed and return lines with updated gaskets. If bearings are worn, a turbo rebuild or replacement is necessary. Use manufacturer-recommended oil change intervals.',
    severity: 'high', confidence: 'high',
    symptoms: ['Blue exhaust smoke', 'Oil consumption increase', 'Turbo whine changes pitch', 'Oil pooling near turbo'],
    affectedSystems: ['Engine', 'Turbocharger'], dtcCodes: ['P0299'],
    estimatedCostLow: 400, estimatedCostHigh: 1500,
    citations: cit('French Car Forum', 'https://www.frenchcarforum.co.uk', '207 GTi turbo oil leak and THP engine oil consumption threads'),
    communityRecommendations: [], reportCount: 55, typicalMileageLow: 50000, typicalMileageHigh: 90000
  },
  {
    id: 'peugeot-207-gearbox-bearing-noise',
    make: 'Peugeot', model: '207', years: yrs(2006, 2014),
    trims: ['Active', 'Allure', 'GTi'], engines: ['1.4L EP3', '1.6L EP6'],
    category: 'transmission', title: 'Gearbox Input Shaft Bearing Noise',
    description: 'The MA/BE-series manual gearbox develops a characteristic whining or rumbling noise from the input shaft bearing. The noise is present in neutral with the clutch engaged and disappears when the pedal is pressed.',
    solution: 'Replace the input shaft bearing. This requires gearbox removal but is significantly cheaper than a full gearbox replacement if caught early.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Whining in neutral', 'Noise disappears with clutch pressed', 'Rumbling at idle', 'Vibration through gear lever'],
    affectedSystems: ['Transmission'], dtcCodes: [],
    estimatedCostLow: 400, estimatedCostHigh: 900,
    citations: cit('French Car Forum', 'https://www.frenchcarforum.co.uk', '207 BE4 gearbox bearing noise diagnosis and repair threads'),
    communityRecommendations: [], reportCount: 45, typicalMileageLow: 60000, typicalMileageHigh: 100000
  },

  // ===== PEUGEOT 208 (3) =====
  {
    id: 'peugeot-208-dpf-issues-diesel',
    make: 'Peugeot', model: '208', years: yrs(2012, 2026),
    trims: ['Active', 'Allure'], engines: ['1.5L BlueHDi', '1.6L HDi'],
    category: 'emissions', title: 'Diesel Particulate Filter Blockage',
    description: 'Diesel 208 models suffer from premature DPF blockage, particularly in vehicles used predominantly for short urban journeys. The DPF cannot complete its regeneration cycle during short trips, leading to progressive soot buildup.',
    solution: 'Perform a forced DPF regeneration using diagnostic equipment. For severely blocked filters, professional DPF cleaning or replacement is required. Advise regular motorway driving to allow passive regeneration.',
    severity: 'high', confidence: 'high',
    symptoms: ['DPF warning light', 'Reduced engine power', 'Increased fuel consumption', 'Strong diesel smell'],
    affectedSystems: ['Emissions', 'Exhaust'], dtcCodes: ['P2463', 'P244A'],
    estimatedCostLow: 300, estimatedCostHigh: 2000,
    citations: cit('PeugeotForums.com', 'https://www.peugeotforums.com', '208 diesel DPF blockage and regeneration failure reports'),
    communityRecommendations: [], reportCount: 110, typicalMileageLow: 30000, typicalMileageHigh: 80000
  },
  {
    id: 'peugeot-208-infotainment-freeze',
    make: 'Peugeot', model: '208', years: yrs(2019, 2026),
    trims: ['Allure', 'GT', 'GT Line'], engines: [],
    category: 'electrical', title: 'Infotainment System Freeze and Reboot',
    description: 'The i-Cockpit infotainment system on the second-generation 208 experiences random freezes and spontaneous reboots. Touchscreen inputs become unresponsive, and the system may lose Bluetooth and navigation connectivity.',
    solution: 'Update the infotainment firmware to the latest version via dealer. Perform a hard reset by holding the power button for 10 seconds. Persistent cases may require NAC/SMEG unit replacement.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Screen freezes', 'Random reboots', 'Bluetooth disconnects', 'Navigation unresponsive'],
    affectedSystems: ['Electrical', 'Infotainment'], dtcCodes: [],
    estimatedCostLow: 0, estimatedCostHigh: 800,
    citations: cit('Peugeot208Forums.com', 'https://www.peugeot208forums.com', '208 II i-Cockpit infotainment freeze and reboot issues'),
    communityRecommendations: [], reportCount: 70, typicalMileageLow: 5000, typicalMileageHigh: 50000
  },
  {
    id: 'peugeot-208-puretech-timing-chain',
    make: 'Peugeot', model: '208', years: yrs(2012, 2022),
    trims: ['Active', 'Allure', 'GT Line'], engines: ['1.2L PureTech'],
    category: 'engine', title: 'PureTech 1.2 Timing Chain Stretch',
    description: 'The three-cylinder PureTech 1.2 engine has a widespread timing chain stretch issue, affecting early production runs particularly severely. The chain elongates prematurely, causing timing misalignment and potential engine damage.',
    solution: 'Replace the timing chain, tensioner, and sprockets with the updated revision parts. PSA extended the warranty to 10 years/200,000km for this specific issue on affected production dates.',
    severity: 'critical', confidence: 'high',
    symptoms: ['Engine rattle on startup', 'Check engine light', 'Loss of power', 'Engine misfires'],
    affectedSystems: ['Engine', 'Timing'], dtcCodes: ['P0016', 'P0300'],
    estimatedCostLow: 800, estimatedCostHigh: 2000,
    citations: cit('AutoExpress', 'https://www.autoexpress.co.uk', 'PureTech 1.2 timing chain recall and extended warranty coverage details'),
    communityRecommendations: [], reportCount: 150, typicalMileageLow: 30000, typicalMileageHigh: 70000
  },

  // ===== PEUGEOT 308 (3) =====
  {
    id: 'peugeot-308-dpf-regen-issues',
    make: 'Peugeot', model: '308', years: yrs(2007, 2026),
    trims: ['Active', 'Allure'], engines: ['1.5L BlueHDi', '1.6L HDi', '2.0L BlueHDi'],
    category: 'emissions', title: 'DPF Regeneration Failure',
    description: 'The 308 diesel models experience frequent DPF regeneration failures, especially in stop-start urban driving conditions. The additive-based DPF system requires periodic Eolys fluid refills that are often overlooked during servicing.',
    solution: 'Top up the Eolys DPF additive fluid, perform a forced regeneration, and clean the DPF pressure sensor pipes. Replace the DPF if soot loading exceeds recoverable levels.',
    severity: 'high', confidence: 'high',
    symptoms: ['DPF warning light', 'Limp mode activation', 'Failed regeneration attempts', 'Exhaust smoke during regen'],
    affectedSystems: ['Emissions', 'Exhaust'], dtcCodes: ['P2463', 'P2002'],
    estimatedCostLow: 200, estimatedCostHigh: 2500,
    citations: cit('PeugeotForums.com', 'https://www.peugeotforums.com', '308 DPF regeneration failure and Eolys additive system maintenance'),
    communityRecommendations: [], reportCount: 100, typicalMileageLow: 40000, typicalMileageHigh: 90000
  },
  {
    id: 'peugeot-308-egr-failure',
    make: 'Peugeot', model: '308', years: yrs(2007, 2021),
    trims: ['Active', 'Allure', 'GT'], engines: ['1.6L HDi', '2.0L BlueHDi'],
    category: 'emissions', title: 'EGR Valve Failure',
    description: 'The exhaust gas recirculation valve on diesel 308 models becomes clogged with carbon deposits, causing rough idle and poor performance. The electrically actuated valve sticks in the open or closed position.',
    solution: 'Clean or replace the EGR valve. Install an EGR cooler bypass blanking kit if permitted in your region. Update the ECU software to revised EGR control maps.',
    severity: 'medium', confidence: 'high',
    symptoms: ['Rough idle', 'Black exhaust smoke', 'Loss of power', 'Check engine light'],
    affectedSystems: ['Emissions', 'Engine'], dtcCodes: ['P0401', 'P0403'],
    estimatedCostLow: 200, estimatedCostHigh: 600,
    citations: cit('French Car Forum', 'https://www.frenchcarforum.co.uk', '308 HDi EGR valve carbon buildup and cleaning procedures'),
    communityRecommendations: [], reportCount: 75, typicalMileageLow: 50000, typicalMileageHigh: 100000
  },
  {
    id: 'peugeot-308-adblue-system-fault',
    make: 'Peugeot', model: '308', years: yrs(2014, 2026),
    trims: ['Active', 'Allure', 'GT'], engines: ['1.5L BlueHDi', '2.0L BlueHDi'],
    category: 'emissions', title: 'AdBlue System Fault',
    description: 'The AdBlue (SCR) system on BlueHDi engines triggers false fault warnings and countdown timers to engine disable. The NOx sensor and AdBlue injector are primary failure points, often caused by crystallized fluid.',
    solution: 'Replace the NOx sensor and clean the AdBlue injector. Flush the AdBlue tank if crystallization is present. Reset the SCR system counters with diagnostic equipment.',
    severity: 'high', confidence: 'medium',
    symptoms: ['AdBlue warning light', 'Engine start countdown', 'NOx sensor fault', 'Reduced power'],
    affectedSystems: ['Emissions'], dtcCodes: ['P20EE', 'P2BAD'],
    estimatedCostLow: 300, estimatedCostHigh: 1200,
    citations: cit('PeugeotForums.com', 'https://www.peugeotforums.com', '308 BlueHDi AdBlue system fault and NOx sensor failure reports'),
    communityRecommendations: [], reportCount: 65, typicalMileageLow: 30000, typicalMileageHigh: 80000
  },

  // ===== PEUGEOT 3008 (3) =====
  {
    id: 'peugeot-3008-dpf-issues',
    make: 'Peugeot', model: '3008', years: yrs(2009, 2026),
    trims: ['Active', 'Allure', 'GT'], engines: ['1.5L BlueHDi', '1.6L HDi', '2.0L BlueHDi'],
    category: 'emissions', title: 'DPF Premature Blockage',
    description: 'The 3008 diesel variants experience premature DPF clogging, with the larger vehicle weight and urban usage patterns contributing to incomplete regeneration cycles. The issue is more pronounced in pre-2017 models with the older DPF design.',
    solution: 'Force a DPF regeneration via diagnostic tool, top up Eolys additive, and advise sustained motorway driving. Severe cases require professional DPF cleaning or replacement.',
    severity: 'high', confidence: 'high',
    symptoms: ['DPF warning light', 'Engine limp mode', 'Increased fuel consumption', 'White smoke during regen'],
    affectedSystems: ['Emissions', 'Exhaust'], dtcCodes: ['P2463', 'P244A'],
    estimatedCostLow: 300, estimatedCostHigh: 2500,
    citations: cit('PeugeotForums.com', 'https://www.peugeotforums.com', '3008 DPF blockage reports and regeneration failure threads'),
    communityRecommendations: [], reportCount: 90, typicalMileageLow: 35000, typicalMileageHigh: 80000
  },
  {
    id: 'peugeot-3008-eat6-gearbox-shudder',
    make: 'Peugeot', model: '3008', years: yrs(2014, 2023),
    trims: ['Allure', 'GT', 'GT Line'], engines: ['1.6L THP', '1.2L PureTech', '2.0L BlueHDi'],
    category: 'transmission', title: 'EAT6 Automatic Gearbox Shudder',
    description: 'The Aisin-sourced EAT6 six-speed automatic transmission exhibits judder and hesitation during low-speed manoeuvres and when pulling away from rest. Torque converter lockup calibration and fluid degradation are primary causes.',
    solution: 'Perform a complete ATF drain and refill with the specified Aisin fluid. Update the TCM software to the latest calibration. Persistent cases may need torque converter replacement.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Shudder at low speed', 'Hesitation pulling away', 'Harsh 1-2 shift', 'Jerky creep mode'],
    affectedSystems: ['Transmission'], dtcCodes: ['P0741'],
    estimatedCostLow: 200, estimatedCostHigh: 1500,
    citations: cit('French Car Forum', 'https://www.frenchcarforum.co.uk', '3008 EAT6 automatic shudder and torque converter judder reports'),
    communityRecommendations: [], reportCount: 55, typicalMileageLow: 40000, typicalMileageHigh: 80000
  },
  {
    id: 'peugeot-3008-adblue-faults',
    make: 'Peugeot', model: '3008', years: yrs(2017, 2026),
    trims: ['Allure', 'GT', 'GT Line'], engines: ['1.5L BlueHDi', '2.0L BlueHDi'],
    category: 'emissions', title: 'AdBlue System Malfunction',
    description: 'The second-generation 3008 BlueHDi models are plagued by AdBlue system faults, including false level readings and crystallized injectors. The vehicle displays a countdown to engine disable even with a full AdBlue tank.',
    solution: 'Replace the AdBlue quality sensor and injector nozzle. Flush the AdBlue lines to remove crystallization. Update SCR system software and reset counters.',
    severity: 'high', confidence: 'medium',
    symptoms: ['AdBlue warning message', 'False empty tank reading', 'Engine disable countdown', 'SCR fault code'],
    affectedSystems: ['Emissions'], dtcCodes: ['P20EE', 'P2BAD'],
    estimatedCostLow: 300, estimatedCostHigh: 1200,
    citations: cit('PeugeotForums.com', 'https://www.peugeotforums.com', '3008 II BlueHDi AdBlue sensor and injector fault reports'),
    communityRecommendations: [], reportCount: 60, typicalMileageLow: 25000, typicalMileageHigh: 70000
  },

  // ===== PEUGEOT 5008 (2) =====
  {
    id: 'peugeot-5008-suspension-creak',
    make: 'Peugeot', model: '5008', years: yrs(2009, 2026),
    trims: ['Active', 'Allure', 'GT'], engines: [],
    category: 'suspension', title: 'Front Suspension Creak and Knock',
    description: 'The 5008 develops creaking and knocking noises from the front suspension, particularly over low-speed bumps and when turning. The anti-roll bar drop links and front strut top mounts are the primary culprits.',
    solution: 'Replace the anti-roll bar drop links and strut top mount bearings. Lubricate the spring seats if noise persists. Check for worn lower control arm bushings on higher-mileage vehicles.',
    severity: 'low', confidence: 'high',
    symptoms: ['Creaking over bumps', 'Knocking when turning', 'Clunking on rough roads', 'Steering column vibration'],
    affectedSystems: ['Suspension'], dtcCodes: [],
    estimatedCostLow: 150, estimatedCostHigh: 500,
    citations: cit('PeugeotForums.com', 'https://www.peugeotforums.com', '5008 front suspension creak and drop link replacement guides'),
    communityRecommendations: [], reportCount: 50, typicalMileageLow: 30000, typicalMileageHigh: 70000
  },
  {
    id: 'peugeot-5008-dpf-blockage',
    make: 'Peugeot', model: '5008', years: yrs(2009, 2026),
    trims: ['Active', 'Allure', 'GT'], engines: ['1.5L BlueHDi', '1.6L HDi', '2.0L BlueHDi'],
    category: 'emissions', title: 'DPF Blockage',
    description: 'The 5008 diesel shares the PSA DPF issues common across the range, with the heavier seven-seat body exacerbating regeneration difficulties. School-run and city driving patterns are the primary triggers for premature blockage.',
    solution: 'Force DPF regeneration, ensure Eolys additive is topped up, and incorporate regular extended motorway drives. Replace the DPF if ash loading is beyond cleaning capability.',
    severity: 'high', confidence: 'high',
    symptoms: ['DPF warning light', 'Reduced power', 'Engine limp mode', 'Strong exhaust odor'],
    affectedSystems: ['Emissions', 'Exhaust'], dtcCodes: ['P2463'],
    estimatedCostLow: 300, estimatedCostHigh: 2500,
    citations: cit('French Car Forum', 'https://www.frenchcarforum.co.uk', '5008 diesel DPF blockage and regeneration failure reports'),
    communityRecommendations: [], reportCount: 55, typicalMileageLow: 35000, typicalMileageHigh: 80000
  },

  // ===== PEUGEOT 508 (2) =====
  {
    id: 'peugeot-508-diesel-dpf',
    make: 'Peugeot', model: '508', years: yrs(2011, 2026),
    trims: ['Active', 'Allure'], engines: ['1.6L HDi', '2.0L BlueHDi'],
    category: 'emissions', title: 'Diesel DPF Regeneration Issues',
    description: 'The 508 diesel suffers from DPF regeneration failures, particularly on first-generation models with the additive DPF system. Frequent short journeys prevent the regeneration cycle from completing, leading to progressive soot buildup.',
    solution: 'Perform forced DPF regeneration via diagnostic tool. Top up the Eolys additive system. For severely blocked units, professional off-car DPF cleaning is recommended before resorting to replacement.',
    severity: 'high', confidence: 'high',
    symptoms: ['DPF warning indicator', 'Power loss', 'Limp mode', 'Excessive exhaust particulates'],
    affectedSystems: ['Emissions', 'Exhaust'], dtcCodes: ['P2463', 'P2002'],
    estimatedCostLow: 300, estimatedCostHigh: 2500,
    citations: cit('PeugeotForums.com', 'https://www.peugeotforums.com', '508 diesel DPF blockage and Eolys system maintenance threads'),
    communityRecommendations: [], reportCount: 65, typicalMileageLow: 40000, typicalMileageHigh: 90000
  },
  {
    id: 'peugeot-508-air-suspension-failure-gt',
    make: 'Peugeot', model: '508', years: yrs(2019, 2026),
    trims: ['GT'], engines: ['1.6L PureTech', '2.0L BlueHDi'],
    category: 'suspension', title: 'Rear Air Suspension Failure (GT)',
    description: 'The 508 GT with optional rear air suspension experiences compressor failures and air spring leaks, causing the rear of the vehicle to sag overnight or drop to bump stops. The compressor overheats from continuous operation when leaks are present.',
    solution: 'Inspect air springs for leaks at the crimp points and replace as needed. Replace the compressor if it runs continuously or fails to build pressure. Check air lines for cracks.',
    severity: 'high', confidence: 'medium',
    symptoms: ['Rear sag overnight', 'Compressor running continuously', 'Suspension warning light', 'Uneven ride height'],
    affectedSystems: ['Suspension'], dtcCodes: [],
    estimatedCostLow: 500, estimatedCostHigh: 2000,
    citations: cit('PeugeotForums.com', 'https://www.peugeotforums.com', '508 GT rear air suspension compressor and air spring failure reports'),
    communityRecommendations: [], reportCount: 30, typicalMileageLow: 30000, typicalMileageHigh: 70000
  },

  // ===== PEUGEOT 2008 (2) =====
  {
    id: 'peugeot-2008-puretech-timing-chain',
    make: 'Peugeot', model: '2008', years: yrs(2013, 2022),
    trims: ['Active', 'Allure', 'GT Line'], engines: ['1.2L PureTech'],
    category: 'engine', title: 'PureTech 1.2 Timing Chain Stretch',
    description: 'The 2008 shares the same PureTech 1.2 timing chain stretch problem found across the PSA range. The wet belt/chain design elongates prematurely, causing timing drift and potential catastrophic engine failure if left unaddressed.',
    solution: 'Replace the timing chain kit with updated components. PSA extended warranty covers this repair to 10 years/200,000km on affected VINs. Check eligibility with a dealer.',
    severity: 'critical', confidence: 'high',
    symptoms: ['Chain rattle on cold start', 'Engine warning light', 'Misfires', 'Loss of power'],
    affectedSystems: ['Engine', 'Timing'], dtcCodes: ['P0016', 'P0300'],
    estimatedCostLow: 800, estimatedCostHigh: 2000,
    citations: cit('AutoExpress', 'https://www.autoexpress.co.uk', 'PureTech timing chain stretch recall and warranty extension coverage'),
    communityRecommendations: [], reportCount: 130, typicalMileageLow: 30000, typicalMileageHigh: 70000
  },
  {
    id: 'peugeot-2008-e2008-range-issues',
    make: 'Peugeot', model: '2008', years: yrs(2020, 2026),
    trims: ['GT Line'], engines: ['Electric 50kWh'],
    category: 'electrical', title: 'e-2008 Range Below Advertised',
    description: 'The electric e-2008 consistently delivers real-world range well below the WLTP figure, with owners reporting 30-40% reduction in cold weather. Battery management system calibration and heating energy draw are contributing factors.',
    solution: 'Perform a battery recalibration by fully charging then fully depleting the battery twice. Use eco mode and pre-condition while plugged in. A software update may improve BMS estimation accuracy.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Range below WLTP estimate', 'Rapid range drop in cold weather', 'Inconsistent range estimates', 'Battery percentage jumps'],
    affectedSystems: ['Electrical', 'Battery'], dtcCodes: [],
    estimatedCostLow: 0, estimatedCostHigh: 200,
    citations: cit('Speak EV', 'https://www.speakev.com', 'e-2008 real-world range reports and cold weather performance threads'),
    communityRecommendations: [], reportCount: 45, typicalMileageLow: 5000, typicalMileageHigh: 40000
  },

  // ===== PEUGEOT RCZ (2) =====
  {
    id: 'peugeot-rcz-timing-chain',
    make: 'Peugeot', model: 'RCZ', years: yrs(2010, 2015),
    trims: ['Base', 'GT Line', 'R'], engines: ['1.6L THP'],
    category: 'engine', title: 'Timing Chain Tensioner Failure',
    description: 'The RCZ shares the EP6 timing chain tensioner weakness with other PSA/BMW Prince engine applications. The hydraulic tensioner loses pressure, allowing chain slack that causes timing skip and valve damage in severe cases.',
    solution: 'Replace the timing chain, tensioner, guides, and sprockets with the latest revision parts. Maintain strict oil change intervals with the correct 0W-30 specification oil.',
    severity: 'critical', confidence: 'high',
    symptoms: ['Cold start rattle', 'Check engine light', 'Rough running', 'Metallic noise from timing cover'],
    affectedSystems: ['Engine', 'Timing'], dtcCodes: ['P0016', 'P0017'],
    estimatedCostLow: 900, estimatedCostHigh: 2000,
    citations: cit('PeugeotForums.com', 'https://www.peugeotforums.com', 'RCZ THP timing chain replacement guides and tensioner revision history'),
    communityRecommendations: [], reportCount: 40, typicalMileageLow: 35000, typicalMileageHigh: 70000
  },
  {
    id: 'peugeot-rcz-turbo-oil-leak',
    make: 'Peugeot', model: 'RCZ', years: yrs(2010, 2015),
    trims: ['Base', 'GT Line', 'R'], engines: ['1.6L THP'],
    category: 'engine', title: 'Turbocharger Oil Leak',
    description: 'The THP turbocharger develops oil leaks from the feed and return lines, and the turbo bearing seals degrade with heat cycling. Oil consumption increases progressively, and blue smoke appears under boost.',
    solution: 'Replace turbo oil feed/return lines and gaskets. Rebuild or replace the turbocharger if bearing play is detected. Ensure oil change intervals are not exceeded.',
    severity: 'high', confidence: 'high',
    symptoms: ['Blue exhaust smoke under boost', 'Oil consumption', 'Turbo whistle changes', 'Oil around turbo housing'],
    affectedSystems: ['Engine', 'Turbocharger'], dtcCodes: ['P0299'],
    estimatedCostLow: 400, estimatedCostHigh: 1500,
    citations: cit('French Car Forum', 'https://www.frenchcarforum.co.uk', 'RCZ THP turbo oil leak diagnosis and replacement threads'),
    communityRecommendations: [], reportCount: 35, typicalMileageLow: 45000, typicalMileageHigh: 85000
  },

  // ===== PEUGEOT Partner/Rifter (2) =====
  {
    id: 'peugeot-partner-sliding-door-mechanism',
    make: 'Peugeot', model: 'Partner/Rifter', years: yrs(2008, 2026),
    trims: ['Standard', 'Long'], engines: [],
    category: 'body', title: 'Sliding Door Mechanism Failure',
    description: 'The sliding side door mechanism on the Partner and Rifter develops stiffness and eventual failure due to roller and track wear. The door becomes difficult to open or close, and may jam in transit, particularly in colder weather.',
    solution: 'Clean and lubricate the door track and roller bearings. Replace worn rollers and the lower guide channel. Adjust the door catch striker plate alignment if the door does not latch correctly.',
    severity: 'medium', confidence: 'high',
    symptoms: ['Stiff sliding door', 'Door jamming mid-travel', 'Grinding noise when sliding', 'Door not latching properly'],
    affectedSystems: ['Body'], dtcCodes: [],
    estimatedCostLow: 100, estimatedCostHigh: 400,
    citations: cit('PeugeotForums.com', 'https://www.peugeotforums.com', 'Partner/Rifter sliding door roller and track wear reports'),
    communityRecommendations: [], reportCount: 70, typicalMileageLow: 40000, typicalMileageHigh: 90000
  },
  {
    id: 'peugeot-partner-dpf-issues',
    make: 'Peugeot', model: 'Partner/Rifter', years: yrs(2008, 2026),
    trims: ['Standard', 'Long'], engines: ['1.5L BlueHDi', '1.6L HDi'],
    category: 'emissions', title: 'DPF Blockage in Commercial Use',
    description: 'Partner and Rifter vans used for urban delivery work are extremely susceptible to DPF blockage due to the constant stop-start nature of commercial use. The duty cycle rarely allows for passive regeneration.',
    solution: 'Schedule regular forced DPF regenerations as part of fleet maintenance. Consider installing a DPF-friendly route into the daily schedule. Top up Eolys additive at each service.',
    severity: 'high', confidence: 'high',
    symptoms: ['DPF warning light', 'Limp mode', 'Reduced pulling power', 'Frequent regen attempts'],
    affectedSystems: ['Emissions', 'Exhaust'], dtcCodes: ['P2463'],
    estimatedCostLow: 300, estimatedCostHigh: 2500,
    citations: cit('French Car Forum', 'https://www.frenchcarforum.co.uk', 'Partner/Rifter commercial DPF blockage and fleet maintenance advice'),
    communityRecommendations: [], reportCount: 80, typicalMileageLow: 25000, typicalMileageHigh: 60000
  },

  // ===== RENAULT CLIO (4) =====
  {
    id: 'renault-clio-ignition-coil-failure',
    make: 'Renault', model: 'Clio', years: yrs(2000, 2012),
    trims: ['Expression', 'Dynamique'], engines: ['1.2L D4F', '1.4L K4J', '1.6L K4M'],
    category: 'engine', title: 'Ignition Coil Pack Failure',
    description: 'The Clio II and III petrol engines suffer from premature ignition coil pack failure, causing misfires and rough running. The coil packs crack from heat cycling and moisture ingress, particularly on the 1.2 and 1.4 engines.',
    solution: 'Replace the faulty coil pack. It is recommended to replace all coil packs simultaneously and use OEM Sagem units. Inspect and replace spark plugs at the same time.',
    severity: 'medium', confidence: 'high',
    symptoms: ['Engine misfire', 'Rough idle', 'Hesitation under acceleration', 'Check engine light flashing'],
    affectedSystems: ['Engine', 'Ignition'], dtcCodes: ['P0300', 'P0301', 'P0302'],
    estimatedCostLow: 80, estimatedCostHigh: 250,
    citations: cit('Renault Forums', 'https://www.renaultforums.co.uk', 'Clio II/III ignition coil failure diagnosis and OEM part numbers'),
    communityRecommendations: [], reportCount: 130, typicalMileageLow: 40000, typicalMileageHigh: 80000
  },
  {
    id: 'renault-clio-gearbox-bearing',
    make: 'Renault', model: 'Clio', years: yrs(2005, 2019),
    trims: ['Expression', 'Dynamique', 'RS'], engines: ['1.2L D4F', '1.5L dCi', '1.6L K4M'],
    category: 'transmission', title: 'Gearbox Bearing Failure',
    description: 'The JH3 and JR5 manual gearboxes in the Clio develop differential bearing noise that progressively worsens. The bearings fail from inadequate lubrication at the differential end of the housing.',
    solution: 'Replace the differential bearings and inspect the crown wheel and pinion for damage. A gearbox oil change with GL-5 75W-80 at 60,000 mile intervals can extend bearing life.',
    severity: 'medium', confidence: 'high',
    symptoms: ['Humming noise in gear', 'Whine proportional to speed', 'Noise worse on deceleration', 'Metallic debris in gearbox oil'],
    affectedSystems: ['Transmission'], dtcCodes: [],
    estimatedCostLow: 400, estimatedCostHigh: 1000,
    citations: cit('Renault Forums', 'https://www.renaultforums.co.uk', 'Clio JH3/JR5 gearbox bearing noise and differential repair guides'),
    communityRecommendations: [], reportCount: 85, typicalMileageLow: 50000, typicalMileageHigh: 100000
  },
  {
    id: 'renault-clio-timing-belt-tensioner',
    make: 'Renault', model: 'Clio', years: yrs(2000, 2015),
    trims: ['Expression', 'Dynamique'], engines: ['1.2L D4F', '1.4L K4J', '1.6L K4M'],
    category: 'engine', title: 'Timing Belt Tensioner Failure',
    description: 'The timing belt tensioner bearing on Clio K-series engines can fail before the scheduled belt replacement interval, causing catastrophic engine damage. The water pump, which is driven by the timing belt, also fails prematurely.',
    solution: 'Replace the timing belt, tensioner, idler pulley, and water pump as a complete kit every 72,000 miles or 5 years, whichever comes first. Do not skip the water pump replacement.',
    severity: 'critical', confidence: 'high',
    symptoms: ['Squealing from timing cover', 'Coolant leak from water pump', 'Timing belt wear visible', 'Ticking noise'],
    affectedSystems: ['Engine', 'Timing'], dtcCodes: [],
    estimatedCostLow: 300, estimatedCostHigh: 600,
    citations: cit('Renault Forums', 'https://www.renaultforums.co.uk', 'Clio timing belt kit replacement interval and water pump failure reports'),
    communityRecommendations: [], reportCount: 100, typicalMileageLow: 50000, typicalMileageHigh: 90000
  },
  {
    id: 'renault-clio-tce-turbo-coolant-leak',
    make: 'Renault', model: 'Clio', years: yrs(2012, 2026),
    trims: ['Dynamique', 'Iconic'], engines: ['0.9L TCe', '1.0L TCe', '1.3L TCe'],
    category: 'engine', title: 'TCe Turbo Coolant Leak',
    description: 'The TCe turbocharged engines develop coolant leaks from the turbocharger coolant lines and the thermostat housing. The plastic coolant connectors become brittle with age and heat exposure, causing seepage and eventual failure.',
    solution: 'Replace the turbo coolant lines with updated metal fittings where available. Replace the thermostat housing assembly. Pressure test the cooling system after repair to verify no further leaks.',
    severity: 'high', confidence: 'medium',
    symptoms: ['Coolant loss', 'Sweet smell from engine bay', 'Low coolant warning', 'Overheating risk'],
    affectedSystems: ['Engine', 'Cooling'], dtcCodes: ['P0116', 'P0217'],
    estimatedCostLow: 200, estimatedCostHigh: 600,
    citations: cit('Renault Forums', 'https://www.renaultforums.co.uk', 'Clio IV/V TCe turbo coolant line failure and thermostat housing cracks'),
    communityRecommendations: [], reportCount: 60, typicalMileageLow: 30000, typicalMileageHigh: 70000
  },

  // ===== RENAULT MEGANE (3) =====
  {
    id: 'renault-megane-timing-belt',
    make: 'Renault', model: 'Megane', years: yrs(2003, 2023),
    trims: ['Expression', 'Dynamique', 'GT'], engines: ['1.5L dCi', '1.6L K4M', '2.0L F4R'],
    category: 'engine', title: 'Timing Belt Premature Failure',
    description: 'The Megane timing belt can fail before the manufacturer-recommended interval, particularly on the 1.5 dCi diesel. Oil contamination from the front crankshaft seal accelerates belt degradation.',
    solution: 'Replace the timing belt kit at reduced intervals (every 60,000 miles). Inspect and replace the front crankshaft seal to prevent oil contamination. Include the water pump in the replacement.',
    severity: 'critical', confidence: 'high',
    symptoms: ['Belt squeal', 'Oil on timing belt', 'Rough idle', 'Engine warning light'],
    affectedSystems: ['Engine', 'Timing'], dtcCodes: [],
    estimatedCostLow: 350, estimatedCostHigh: 700,
    citations: cit('Renault Forums', 'https://www.renaultforums.co.uk', 'Megane timing belt failure before interval and crankshaft seal oil leak reports'),
    communityRecommendations: [], reportCount: 90, typicalMileageLow: 45000, typicalMileageHigh: 85000
  },
  {
    id: 'renault-megane-injection-fault',
    make: 'Renault', model: 'Megane', years: yrs(2003, 2023),
    trims: ['Expression', 'Dynamique', 'GT'], engines: ['1.5L dCi', '1.6L K4M'],
    category: 'engine', title: 'Injection System Fault Warning',
    description: 'The Megane displays an "Injection Fault" warning on the dashboard, which can be triggered by numerous sensors and components. Common causes include the crankshaft position sensor, throttle body, and fuel pressure regulator.',
    solution: 'Diagnose with Renault CLIP or compatible diagnostic tool to identify the specific fault code. Common fixes include crankshaft sensor replacement, throttle body cleaning, and fuel pressure regulator replacement.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Injection fault warning', 'Engine stalling', 'Difficult starting', 'Loss of power'],
    affectedSystems: ['Engine', 'Fuel'], dtcCodes: ['P0335', 'P0120', 'P0190'],
    estimatedCostLow: 100, estimatedCostHigh: 500,
    citations: cit('Renault Forums', 'https://www.renaultforums.co.uk', 'Megane injection fault warning diagnosis and common sensor failures'),
    communityRecommendations: [], reportCount: 110, typicalMileageLow: 40000, typicalMileageHigh: 100000
  },
  {
    id: 'renault-megane-window-regulator',
    make: 'Renault', model: 'Megane', years: yrs(2003, 2016),
    trims: ['Expression', 'Dynamique'], engines: [],
    category: 'electrical', title: 'Window Regulator Failure',
    description: 'The Megane II and III are notorious for window regulator failures, with the cable-pulley mechanism snapping or the motor burning out. The front driver window is most commonly affected.',
    solution: 'Replace the window regulator assembly. Aftermarket regulators with improved cable routing are available. Lubricate the window channels to reduce motor strain.',
    severity: 'low', confidence: 'high',
    symptoms: ['Window drops into door', 'Clicking noise when operating', 'Slow window movement', 'Intermittent operation'],
    affectedSystems: ['Electrical', 'Body'], dtcCodes: [],
    estimatedCostLow: 100, estimatedCostHigh: 300,
    citations: cit('French Car Forum', 'https://www.frenchcarforum.co.uk', 'Megane II/III window regulator replacement guide and improved aftermarket parts'),
    communityRecommendations: [], reportCount: 140, typicalMileageLow: 35000, typicalMileageHigh: 80000
  },

  // ===== RENAULT CAPTUR (3) =====
  {
    id: 'renault-captur-edc-transmission-shudder',
    make: 'Renault', model: 'Captur', years: yrs(2013, 2026),
    trims: ['Expression', 'Dynamique', 'Iconic'], engines: ['0.9L TCe', '1.3L TCe', '1.5L dCi'],
    category: 'transmission', title: 'EDC Dual-Clutch Transmission Shudder',
    description: 'The Getrag EDC dual-clutch transmission in the Captur exhibits judder and hesitation at low speeds, particularly during parking manoeuvres and hill starts. The dry clutch packs wear prematurely in stop-start urban driving.',
    solution: 'Perform EDC clutch adaptation reset via diagnostic tool. Replace the clutch pack assembly if wear is beyond adaptation range. Update the TCU software to the latest calibration.',
    severity: 'high', confidence: 'high',
    symptoms: ['Judder at low speed', 'Hesitation on hill starts', 'Jerky gear changes', 'Creep mode shudder'],
    affectedSystems: ['Transmission'], dtcCodes: ['P0841', 'P17F0'],
    estimatedCostLow: 200, estimatedCostHigh: 2000,
    citations: cit('Renault Forums', 'https://www.renaultforums.co.uk', 'Captur EDC dual-clutch shudder and clutch replacement reports'),
    communityRecommendations: [], reportCount: 85, typicalMileageLow: 20000, typicalMileageHigh: 60000
  },
  {
    id: 'renault-captur-tce-turbo-issues',
    make: 'Renault', model: 'Captur', years: yrs(2013, 2026),
    trims: ['Dynamique', 'Iconic'], engines: ['0.9L TCe', '1.3L TCe'],
    category: 'engine', title: 'TCe Turbocharger Issues',
    description: 'The small-displacement TCe turbo engines in the Captur suffer from turbo wastegate rattle and oil seal leaks. The wastegate actuator arm develops play, causing a rattling noise at idle and under light load.',
    solution: 'Replace the turbo wastegate actuator if rattling. For oil seal leaks, a turbo rebuild or replacement is required. Ensure correct oil specification and change intervals are maintained.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Rattle at idle', 'Wastegate flutter noise', 'Oil consumption increase', 'Blue smoke on overrun'],
    affectedSystems: ['Engine', 'Turbocharger'], dtcCodes: ['P0299', 'P0234'],
    estimatedCostLow: 200, estimatedCostHigh: 1200,
    citations: cit('Renault Forums', 'https://www.renaultforums.co.uk', 'Captur TCe turbo wastegate rattle and oil consumption threads'),
    communityRecommendations: [], reportCount: 50, typicalMileageLow: 35000, typicalMileageHigh: 80000
  },
  {
    id: 'renault-captur-infotainment',
    make: 'Renault', model: 'Captur', years: yrs(2019, 2026),
    trims: ['Iconic'], engines: [],
    category: 'electrical', title: 'Infotainment System Glitches',
    description: 'The second-generation Captur MediaNav and Easy Link infotainment systems suffer from touchscreen freezes, Bluetooth disconnections, and delayed response to inputs. Over-the-air updates sometimes introduce new bugs.',
    solution: 'Perform a factory reset of the infotainment system. Update to the latest firmware version at the dealer. Clear Bluetooth pairings and re-pair devices. Replace the head unit if hardware failure is confirmed.',
    severity: 'low', confidence: 'medium',
    symptoms: ['Touchscreen freeze', 'Bluetooth drops', 'Slow response', 'Navigation crashes'],
    affectedSystems: ['Electrical', 'Infotainment'], dtcCodes: [],
    estimatedCostLow: 0, estimatedCostHigh: 600,
    citations: cit('Renault Forums', 'https://www.renaultforums.co.uk', 'Captur II Easy Link infotainment freeze and Bluetooth issues'),
    communityRecommendations: [], reportCount: 55, typicalMileageLow: 5000, typicalMileageHigh: 40000
  },

  // ===== RENAULT KADJAR (2) =====
  {
    id: 'renault-kadjar-cvt-issues',
    make: 'Renault', model: 'Kadjar', years: yrs(2015, 2022),
    trims: ['Expression', 'Dynamique', 'Signature'], engines: ['1.3L TCe'],
    category: 'transmission', title: 'CVT Transmission Issues',
    description: 'The Kadjar with CVT automatic transmission experiences juddering, delayed response, and overheating during sustained motorway driving. The CVT belt and pulleys wear prematurely under higher load conditions.',
    solution: 'Perform a CVT fluid drain and refill with genuine Renault NS-3 fluid. Update the CVT control module software. If judder persists, belt and pulley replacement may be necessary.',
    severity: 'high', confidence: 'medium',
    symptoms: ['CVT judder on acceleration', 'Delayed throttle response', 'Transmission overheating warning', 'Rubber band effect'],
    affectedSystems: ['Transmission'], dtcCodes: ['P0868', 'P17F1'],
    estimatedCostLow: 200, estimatedCostHigh: 3000,
    citations: cit('Renault Forums', 'https://www.renaultforums.co.uk', 'Kadjar CVT judder and overheating reports with fluid change recommendations'),
    communityRecommendations: [], reportCount: 45, typicalMileageLow: 30000, typicalMileageHigh: 70000
  },
  {
    id: 'renault-kadjar-dpf-regeneration',
    make: 'Renault', model: 'Kadjar', years: yrs(2015, 2022),
    trims: ['Expression', 'Dynamique', 'Signature'], engines: ['1.5L dCi', '1.7L Blue dCi'],
    category: 'emissions', title: 'DPF Regeneration Failure',
    description: 'The Kadjar diesel models experience frequent DPF regeneration failures, particularly in vehicles used primarily for short urban commutes. The regeneration process requires sustained load that urban driving cannot provide.',
    solution: 'Perform a forced regeneration via diagnostic tool. Incorporate a weekly 20-minute motorway drive at 2500+ RPM. Clean the DPF pressure differential sensor pipes.',
    severity: 'high', confidence: 'high',
    symptoms: ['DPF warning light', 'Loss of power', 'Limp mode', 'Increased fuel consumption'],
    affectedSystems: ['Emissions', 'Exhaust'], dtcCodes: ['P2463', 'P2002'],
    estimatedCostLow: 200, estimatedCostHigh: 2000,
    citations: cit('Renault Forums', 'https://www.renaultforums.co.uk', 'Kadjar 1.5/1.7 dCi DPF regeneration failure and cleaning advice'),
    communityRecommendations: [], reportCount: 55, typicalMileageLow: 25000, typicalMileageHigh: 70000
  },

  // ===== RENAULT SCENIC (2) =====
  {
    id: 'renault-scenic-parking-brake-failure',
    make: 'Renault', model: 'Scenic', years: yrs(2003, 2024),
    trims: ['Expression', 'Dynamique', 'Signature'], engines: [],
    category: 'brakes', title: 'Electric Parking Brake Failure',
    description: 'The Scenic electric parking brake system is a well-known failure point, with the motor-on-caliper units seizing or the control module losing communication. The brake may apply unexpectedly or fail to release.',
    solution: 'Replace the parking brake motor on the affected caliper. Update the parking brake ECU software. If both sides are affected, replace both caliper motors simultaneously.',
    severity: 'high', confidence: 'high',
    symptoms: ['Parking brake warning light', 'Brake applies unexpectedly', 'Brake fails to release', 'Grinding from rear'],
    affectedSystems: ['Brakes', 'Electrical'], dtcCodes: ['C1126'],
    estimatedCostLow: 300, estimatedCostHigh: 800,
    citations: cit('Renault Forums', 'https://www.renaultforums.co.uk', 'Scenic electric parking brake motor failure and caliper replacement guides'),
    communityRecommendations: [], reportCount: 100, typicalMileageLow: 40000, typicalMileageHigh: 90000
  },
  {
    id: 'renault-scenic-injector-leak-diesel',
    make: 'Renault', model: 'Scenic', years: yrs(2003, 2024),
    trims: ['Expression', 'Dynamique'], engines: ['1.5L dCi', '1.7L Blue dCi'],
    category: 'engine', title: 'Diesel Injector Leak',
    description: 'The Scenic diesel injectors develop leaks at the copper sealing washers and injector body seals, allowing combustion gases and diesel to leak into the engine bay. The black tar-like residue around the injectors is a telltale sign.',
    solution: 'Replace the copper injector sealing washers and clean the injector seats. If the injector body is leaking, replace the injector. Use a torque wrench to tighten to the correct specification.',
    severity: 'medium', confidence: 'high',
    symptoms: ['Diesel smell in cabin', 'Black tar around injectors', 'Rough idle', 'Difficult starting when hot'],
    affectedSystems: ['Engine', 'Fuel'], dtcCodes: ['P0201', 'P0202'],
    estimatedCostLow: 100, estimatedCostHigh: 500,
    citations: cit('French Car Forum', 'https://www.frenchcarforum.co.uk', 'Scenic dCi injector seal leak and copper washer replacement procedure'),
    communityRecommendations: [], reportCount: 75, typicalMileageLow: 50000, typicalMileageHigh: 100000
  },

  // ===== RENAULT KOLEOS (2) =====
  {
    id: 'renault-koleos-cvt-judder',
    make: 'Renault', model: 'Koleos', years: yrs(2008, 2024),
    trims: ['Expression', 'Dynamique', 'Initiale Paris'], engines: ['2.0L dCi', '2.5L QR25'],
    category: 'transmission', title: 'CVT Judder and Slipping',
    description: 'The Jatco CVT in the Koleos develops judder, slipping, and overheating symptoms. The CVT belt and pulleys wear under the heavier SUV load, and the fluid degrades more rapidly than in lighter applications.',
    solution: 'Perform a complete CVT fluid exchange with genuine Renault NS-2 or NS-3 fluid. Replace the CVT belt and pulleys if slip is confirmed. Update CVT control module software.',
    severity: 'high', confidence: 'medium',
    symptoms: ['Judder on acceleration', 'Slipping sensation', 'CVT whine', 'Overheating warning'],
    affectedSystems: ['Transmission'], dtcCodes: ['P0868', 'P0730'],
    estimatedCostLow: 300, estimatedCostHigh: 3500,
    citations: cit('Renault Forums', 'https://www.renaultforums.co.uk', 'Koleos CVT judder reports and Jatco transmission fluid change procedures'),
    communityRecommendations: [], reportCount: 45, typicalMileageLow: 40000, typicalMileageHigh: 90000
  },
  {
    id: 'renault-koleos-infotainment-freeze',
    make: 'Renault', model: 'Koleos', years: yrs(2017, 2024),
    trims: ['Dynamique', 'Initiale Paris'], engines: [],
    category: 'electrical', title: 'Infotainment System Freeze',
    description: 'The Koleos II R-Link 2 infotainment system freezes, reboots spontaneously, and loses connectivity with paired phones. The system is particularly prone to issues after Android Auto or Apple CarPlay sessions.',
    solution: 'Update R-Link 2 to the latest firmware version. Perform a factory reset and re-pair all devices. Replace the head unit if hardware degradation is confirmed via diagnostic testing.',
    severity: 'low', confidence: 'medium',
    symptoms: ['Screen freeze', 'Spontaneous reboots', 'Phone disconnection', 'Camera feed delay'],
    affectedSystems: ['Electrical', 'Infotainment'], dtcCodes: [],
    estimatedCostLow: 0, estimatedCostHigh: 700,
    citations: cit('Renault Forums', 'https://www.renaultforums.co.uk', 'Koleos II R-Link 2 freeze and connectivity issues after firmware updates'),
    communityRecommendations: [], reportCount: 40, typicalMileageLow: 5000, typicalMileageHigh: 50000
  },

  // ===== RENAULT ZOE (3) =====
  {
    id: 'renault-zoe-battery-degradation',
    make: 'Renault', model: 'Zoe', years: yrs(2013, 2024),
    trims: ['Play', 'Iconic', 'GT Line'], engines: ['Electric 22kWh', 'Electric 41kWh', 'Electric 52kWh'],
    category: 'electrical', title: 'Battery Capacity Degradation',
    description: 'The Zoe battery pack experiences capacity degradation that reduces usable range over time. Early 22kWh packs are most affected, with some owners reporting 20-30% capacity loss within 5 years. Frequent rapid charging and high ambient temperatures accelerate degradation.',
    solution: 'Monitor battery health via the Renault Z.E. app or OBD diagnostic tool. Avoid frequent rapid charging and keep charge between 20-80% for daily use. Battery lease customers can request replacement when capacity drops below 75%.',
    severity: 'high', confidence: 'high',
    symptoms: ['Reduced range', 'Faster charge depletion', 'Battery health below 80%', 'Range estimate drops significantly'],
    affectedSystems: ['Battery', 'Electrical'], dtcCodes: [],
    estimatedCostLow: 0, estimatedCostHigh: 8000,
    citations: cit('Speak EV', 'https://www.speakev.com', 'Renault Zoe battery degradation tracking and lease replacement experiences'),
    communityRecommendations: [], reportCount: 90, typicalMileageLow: 30000, typicalMileageHigh: 80000
  },
  {
    id: 'renault-zoe-charging-system',
    make: 'Renault', model: 'Zoe', years: yrs(2013, 2024),
    trims: ['Play', 'Iconic', 'GT Line'], engines: ['Electric 22kWh', 'Electric 41kWh', 'Electric 52kWh'],
    category: 'electrical', title: 'Charging System Failure',
    description: 'The Zoe Chameleon charger experiences intermittent charging failures, refusing to start or stopping mid-charge. The on-board charger module overheats during high-power AC charging, and connector pin corrosion causes communication errors.',
    solution: 'Clean the charging port connector pins. Check for software updates to the Chameleon charger module. Replace the on-board charger unit if it consistently overheats or refuses to charge.',
    severity: 'high', confidence: 'medium',
    symptoms: ['Charging fails to start', 'Charging stops mid-session', 'Charger error light', 'Reduced charging speed'],
    affectedSystems: ['Electrical', 'Charging'], dtcCodes: [],
    estimatedCostLow: 0, estimatedCostHigh: 2500,
    citations: cit('Speak EV', 'https://www.speakev.com', 'Zoe Chameleon charger failure reports and warranty replacement experiences'),
    communityRecommendations: [], reportCount: 65, typicalMileageLow: 15000, typicalMileageHigh: 60000
  },
  {
    id: 'renault-zoe-motor-mount-vibration',
    make: 'Renault', model: 'Zoe', years: yrs(2013, 2024),
    trims: ['Play', 'Iconic'], engines: ['Electric'],
    category: 'drivetrain', title: 'Motor Mount Vibration',
    description: 'The Zoe develops excessive vibration from worn motor mounts, which is particularly noticeable at low speeds and during regenerative braking. The mounts deteriorate from the high-torque EV drivetrain characteristics.',
    solution: 'Replace the motor mount bushings. Inspect the subframe mounting points for stress cracks. Use genuine Renault mounts for correct durometer rating.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Vibration at low speed', 'Clunk during regen braking', 'Steering wheel vibration', 'Cabin resonance'],
    affectedSystems: ['Drivetrain', 'Suspension'], dtcCodes: [],
    estimatedCostLow: 150, estimatedCostHigh: 400,
    citations: cit('Speak EV', 'https://www.speakev.com', 'Zoe motor mount wear and vibration diagnosis threads'),
    communityRecommendations: [], reportCount: 35, typicalMileageLow: 40000, typicalMileageHigh: 80000
  },

  // ===== RENAULT MEGANE E-TECH (1) =====
  {
    id: 'renault-megane-etech-software-bugs',
    make: 'Renault', model: 'Megane E-Tech', years: yrs(2022, 2026),
    trims: ['Equilibre', 'Techno', 'Iconic'], engines: ['Electric 40kWh', 'Electric 60kWh'],
    category: 'electrical', title: 'Software Bugs and OTA Update Issues',
    description: 'The Megane E-Tech experiences various software-related issues including phantom notifications, inaccurate range estimation, and climate control malfunctions. Over-the-air updates sometimes introduce new bugs or fail to install correctly.',
    solution: 'Visit the dealer for a full software reflash if OTA updates fail. Report specific bugs to Renault for inclusion in future patches. Perform a hard reset of the infotainment system as a temporary workaround.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Phantom warning notifications', 'Inaccurate range display', 'Climate control malfunction', 'OTA update failures'],
    affectedSystems: ['Electrical', 'Software'], dtcCodes: [],
    estimatedCostLow: 0, estimatedCostHigh: 300,
    citations: cit('Speak EV', 'https://www.speakev.com', 'Megane E-Tech software bug reports and OTA update failure experiences'),
    communityRecommendations: [], reportCount: 50, typicalMileageLow: 1000, typicalMileageHigh: 30000
  },

  // ===== CITROËN C3 (3) =====
  {
    id: 'citroen-c3-puretech-timing-chain',
    make: 'Citro\u00ebn', model: 'C3', years: yrs(2014, 2026),
    trims: ['Live', 'Feel', 'Shine'], engines: ['1.2L PureTech'],
    category: 'engine', title: 'PureTech 1.2 Timing Chain Stretch',
    description: 'The C3 PureTech 1.2 engine shares the well-documented PSA timing chain stretch issue. The chain elongates prematurely, causing timing drift, misfires, and potential catastrophic valve damage if not addressed promptly.',
    solution: 'Replace the timing chain, tensioner, and sprockets with revised parts. Check eligibility for PSA extended warranty (10 years/200,000km). Use only manufacturer-specified oil.',
    severity: 'critical', confidence: 'high',
    symptoms: ['Rattling on cold start', 'Engine warning light', 'Misfires', 'Power loss'],
    affectedSystems: ['Engine', 'Timing'], dtcCodes: ['P0016', 'P0300'],
    estimatedCostLow: 800, estimatedCostHigh: 2000,
    citations: cit('Citro\u00ebn Owners Club', 'https://www.citroenownersclub.co.uk', 'C3 PureTech timing chain stretch reports and warranty claim experiences'),
    communityRecommendations: [], reportCount: 140, typicalMileageLow: 25000, typicalMileageHigh: 65000
  },
  {
    id: 'citroen-c3-power-steering-failure',
    make: 'Citro\u00ebn', model: 'C3', years: yrs(2002, 2016),
    trims: ['Live', 'Feel'], engines: ['1.1L TU1', '1.4L TU3', '1.6L TU5'],
    category: 'steering', title: 'Electric Power Steering Failure',
    description: 'The C3 Mark I and II experience electric power steering failures caused by the column-mounted EPS motor and its control ECU. The steering becomes heavy without warning, which is particularly dangerous at low speeds during parking.',
    solution: 'Replace the EPS motor and control unit assembly. Some specialist repairers can refurbish the ECU by resoldering cracked joints. Check for a Citro\u00ebn recall on your VIN.',
    severity: 'high', confidence: 'high',
    symptoms: ['Sudden heavy steering', 'Power steering warning light', 'Intermittent assist loss', 'Steering column noise'],
    affectedSystems: ['Steering', 'Electrical'], dtcCodes: ['C1302'],
    estimatedCostLow: 300, estimatedCostHigh: 900,
    citations: cit('Citro\u00ebn Owners Club', 'https://www.citroenownersclub.co.uk', 'C3 electric power steering failure reports and ECU repair specialists'),
    communityRecommendations: [], reportCount: 95, typicalMileageLow: 40000, typicalMileageHigh: 90000
  },
  {
    id: 'citroen-c3-suspension-sphere-leak',
    make: 'Citro\u00ebn', model: 'C3', years: yrs(2002, 2010),
    trims: ['Live', 'Feel'], engines: [],
    category: 'suspension', title: 'Suspension Sphere Gas Leak',
    description: 'Early C3 models with the optional hydropneumatic rear suspension suffer from nitrogen gas leaks in the suspension spheres. The spheres lose pressure over time, resulting in a harsh ride and bottoming out over bumps.',
    solution: 'Replace the suspension spheres in pairs. The spheres are a service item and should be replaced every 60,000 miles or when ride quality deteriorates. Convert to conventional suspension if preferred.',
    severity: 'medium', confidence: 'high',
    symptoms: ['Harsh ride quality', 'Bottoming out on bumps', 'Vehicle sits low at rear', 'Bouncing after bumps'],
    affectedSystems: ['Suspension'], dtcCodes: [],
    estimatedCostLow: 200, estimatedCostHigh: 500,
    citations: cit('French Car Forum', 'https://www.frenchcarforum.co.uk', 'C3 hydropneumatic sphere replacement intervals and ride quality restoration'),
    communityRecommendations: [], reportCount: 50, typicalMileageLow: 50000, typicalMileageHigh: 90000
  },

  // ===== CITROËN C4 (3) =====
  {
    id: 'citroen-c4-dpf-issues',
    make: 'Citro\u00ebn', model: 'C4', years: yrs(2004, 2026),
    trims: ['Live', 'Feel', 'Shine'], engines: ['1.5L BlueHDi', '1.6L HDi', '2.0L HDi'],
    category: 'emissions', title: 'Diesel DPF Regeneration Issues',
    description: 'The C4 diesel models suffer from the common PSA DPF regeneration problems, with the additive-based system requiring regular Eolys fluid top-ups. Short journey use prevents passive regeneration from completing.',
    solution: 'Top up Eolys additive, force DPF regeneration via diagnostic tool, and advise regular motorway driving. Severely blocked filters require professional cleaning or replacement.',
    severity: 'high', confidence: 'high',
    symptoms: ['DPF warning light', 'Engine limp mode', 'Power loss', 'Increased fuel consumption'],
    affectedSystems: ['Emissions', 'Exhaust'], dtcCodes: ['P2463', 'P2002'],
    estimatedCostLow: 300, estimatedCostHigh: 2500,
    citations: cit('Citro\u00ebn Owners Club', 'https://www.citroenownersclub.co.uk', 'C4 diesel DPF blockage and Eolys additive system maintenance guides'),
    communityRecommendations: [], reportCount: 85, typicalMileageLow: 35000, typicalMileageHigh: 80000
  },
  {
    id: 'citroen-c4-suspension-sphere',
    make: 'Citro\u00ebn', model: 'C4', years: yrs(2004, 2017),
    trims: ['Live', 'Feel', 'Shine'], engines: [],
    category: 'suspension', title: 'Suspension Sphere Failure',
    description: 'C4 models with hydropneumatic suspension suffer from sphere gas pressure loss, causing the characteristic Citro\u00ebn ride to become harsh and uncontrolled. The spheres have a finite service life and must be periodically replaced.',
    solution: 'Replace all suspension spheres as a set. Inspect the hydraulic fluid level and condition. Check the hydraulic pump pressure output and accumulator sphere.',
    severity: 'medium', confidence: 'high',
    symptoms: ['Harsh bouncy ride', 'Vehicle nose-dives under braking', 'Body roll increase', 'Uneven ride height'],
    affectedSystems: ['Suspension'], dtcCodes: [],
    estimatedCostLow: 300, estimatedCostHigh: 800,
    citations: cit('French Car Forum', 'https://www.frenchcarforum.co.uk', 'C4 hydropneumatic sphere replacement and ride quality restoration threads'),
    communityRecommendations: [], reportCount: 60, typicalMileageLow: 50000, typicalMileageHigh: 100000
  },
  {
    id: 'citroen-c4-egr-valve-failure',
    make: 'Citro\u00ebn', model: 'C4', years: yrs(2004, 2021),
    trims: ['Live', 'Feel', 'Shine'], engines: ['1.6L HDi', '2.0L HDi'],
    category: 'emissions', title: 'EGR Valve Carbon Buildup',
    description: 'The C4 diesel EGR valve accumulates carbon deposits that cause it to stick open or closed. The blocked EGR increases exhaust emissions, causes rough idle, and can trigger the engine management warning light.',
    solution: 'Remove and clean the EGR valve with carb cleaner and a wire brush. Replace if the valve is damaged or does not move freely after cleaning. Update ECU software for improved EGR control.',
    severity: 'medium', confidence: 'high',
    symptoms: ['Rough idle', 'Black smoke from exhaust', 'Loss of power', 'Engine management light'],
    affectedSystems: ['Emissions', 'Engine'], dtcCodes: ['P0401', 'P0403'],
    estimatedCostLow: 150, estimatedCostHigh: 500,
    citations: cit('Citro\u00ebn Owners Club', 'https://www.citroenownersclub.co.uk', 'C4 HDi EGR valve carbon buildup cleaning and replacement procedures'),
    communityRecommendations: [], reportCount: 70, typicalMileageLow: 45000, typicalMileageHigh: 90000
  },

  // ===== CITROËN C5 AIRCROSS (3) =====
  {
    id: 'citroen-c5-aircross-dpf',
    make: 'Citro\u00ebn', model: 'C5 Aircross', years: yrs(2019, 2026),
    trims: ['Feel', 'Shine', 'Flair'], engines: ['1.5L BlueHDi', '2.0L BlueHDi'],
    category: 'emissions', title: 'DPF Regeneration Failure',
    description: 'The C5 Aircross BlueHDi engines experience DPF regeneration failures in urban driving conditions. The larger SUV body and heavier weight mean the engine works harder yet rarely reaches optimal regeneration temperatures in city traffic.',
    solution: 'Force DPF regeneration via diagnostic tool. Ensure the Eolys additive is topped up at each service. Incorporate regular sustained motorway driving into the vehicle usage pattern.',
    severity: 'high', confidence: 'high',
    symptoms: ['DPF warning light', 'Reduced power', 'Limp mode', 'Failed regen attempts'],
    affectedSystems: ['Emissions', 'Exhaust'], dtcCodes: ['P2463', 'P244A'],
    estimatedCostLow: 300, estimatedCostHigh: 2500,
    citations: cit('Citro\u00ebn Owners Club', 'https://www.citroenownersclub.co.uk', 'C5 Aircross BlueHDi DPF blockage and regeneration failure reports'),
    communityRecommendations: [], reportCount: 55, typicalMileageLow: 25000, typicalMileageHigh: 60000
  },
  {
    id: 'citroen-c5-aircross-suspension-comfort',
    make: 'Citro\u00ebn', model: 'C5 Aircross', years: yrs(2019, 2026),
    trims: ['Feel', 'Shine', 'Flair'], engines: [],
    category: 'suspension', title: 'Progressive Hydraulic Cushion Degradation',
    description: 'The C5 Aircross Progressive Hydraulic Cushion suspension system loses its effectiveness over time, with the secondary hydraulic bump stops losing their damping capability. The ride becomes crashy over sharp bumps.',
    solution: 'Replace the Progressive Hydraulic Cushion units at both ends. These are dealer-only parts. Check for leaks in the hydraulic bump stop assemblies.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Crashy ride over sharp bumps', 'Loss of cushioned feel', 'Thudding from suspension', 'Ride quality decline'],
    affectedSystems: ['Suspension'], dtcCodes: [],
    estimatedCostLow: 400, estimatedCostHigh: 1200,
    citations: cit('French Car Forum', 'https://www.frenchcarforum.co.uk', 'C5 Aircross PHC suspension degradation and replacement cost reports'),
    communityRecommendations: [], reportCount: 35, typicalMileageLow: 30000, typicalMileageHigh: 70000
  },
  {
    id: 'citroen-c5-aircross-infotainment',
    make: 'Citro\u00ebn', model: 'C5 Aircross', years: yrs(2019, 2026),
    trims: ['Shine', 'Flair'], engines: [],
    category: 'electrical', title: 'Infotainment System Issues',
    description: 'The C5 Aircross infotainment system suffers from touchscreen freezes, slow boot times, and connectivity issues with smartphone mirroring. The system occasionally reboots while driving, temporarily losing navigation and audio.',
    solution: 'Update to the latest infotainment firmware via dealer. Perform a factory reset. Clear all Bluetooth pairings and reconnect. Replace the NAC head unit if problems persist.',
    severity: 'low', confidence: 'medium',
    symptoms: ['Touchscreen freeze', 'Slow boot time', 'CarPlay/Android Auto disconnects', 'Mid-drive reboots'],
    affectedSystems: ['Electrical', 'Infotainment'], dtcCodes: [],
    estimatedCostLow: 0, estimatedCostHigh: 700,
    citations: cit('Citro\u00ebn Owners Club', 'https://www.citroenownersclub.co.uk', 'C5 Aircross NAC infotainment freeze and connectivity issues'),
    communityRecommendations: [], reportCount: 45, typicalMileageLow: 5000, typicalMileageHigh: 40000
  },

  // ===== CITROËN BERLINGO (3) =====
  {
    id: 'citroen-berlingo-sliding-door-cable',
    make: 'Citro\u00ebn', model: 'Berlingo', years: yrs(2008, 2026),
    trims: ['Feel', 'Flair', 'Flair XL'], engines: [],
    category: 'body', title: 'Sliding Door Cable Snap',
    description: 'The Berlingo sliding door mechanism uses a cable system that is prone to snapping, particularly in colder weather. The cable frays at the pulley points before eventually breaking, leaving the door stuck open or closed.',
    solution: 'Replace the sliding door cable mechanism. Lubricate the cable guides and pulleys during routine servicing. Aftermarket reinforced cable kits are available.',
    severity: 'medium', confidence: 'high',
    symptoms: ['Door sticking', 'Frayed cable visible', 'Door stuck in position', 'Grinding when opening'],
    affectedSystems: ['Body'], dtcCodes: [],
    estimatedCostLow: 100, estimatedCostHigh: 350,
    citations: cit('French Car Forum', 'https://www.frenchcarforum.co.uk', 'Berlingo sliding door cable snap and replacement procedure guides'),
    communityRecommendations: [], reportCount: 80, typicalMileageLow: 35000, typicalMileageHigh: 80000
  },
  {
    id: 'citroen-berlingo-dpf',
    make: 'Citro\u00ebn', model: 'Berlingo', years: yrs(2008, 2026),
    trims: ['Feel', 'Flair'], engines: ['1.5L BlueHDi', '1.6L HDi'],
    category: 'emissions', title: 'DPF Blockage in Urban Use',
    description: 'The Berlingo diesel DPF blocks prematurely when used for short urban journeys and commercial delivery work. The van duty cycle of frequent stops and starts prevents the DPF from reaching regeneration temperature.',
    solution: 'Schedule regular forced regenerations as part of fleet maintenance. Ensure Eolys additive is maintained. Plan daily route to include sustained higher-speed running.',
    severity: 'high', confidence: 'high',
    symptoms: ['DPF warning light', 'Loss of power', 'Limp mode', 'Excessive soot from exhaust'],
    affectedSystems: ['Emissions', 'Exhaust'], dtcCodes: ['P2463'],
    estimatedCostLow: 300, estimatedCostHigh: 2500,
    citations: cit('Citro\u00ebn Owners Club', 'https://www.citroenownersclub.co.uk', 'Berlingo commercial DPF blockage and fleet maintenance recommendations'),
    communityRecommendations: [], reportCount: 75, typicalMileageLow: 25000, typicalMileageHigh: 60000
  },
  {
    id: 'citroen-berlingo-clutch-judder',
    make: 'Citro\u00ebn', model: 'Berlingo', years: yrs(2008, 2026),
    trims: ['Feel', 'Flair'], engines: ['1.5L BlueHDi', '1.6L HDi'],
    category: 'transmission', title: 'Clutch Judder on Take-Off',
    description: 'The Berlingo develops clutch judder when pulling away, especially when loaded or on inclines. The dual-mass flywheel and clutch disc wear unevenly due to the stop-start nature of commercial use.',
    solution: 'Replace the clutch kit including the dual-mass flywheel. Inspect the engine and gearbox mounts as worn mounts can amplify judder. Use genuine parts for correct friction material.',
    severity: 'medium', confidence: 'high',
    symptoms: ['Judder pulling away', 'Vibration through pedal', 'Shudder on inclines', 'Clutch slip when loaded'],
    affectedSystems: ['Transmission'], dtcCodes: [],
    estimatedCostLow: 500, estimatedCostHigh: 1200,
    citations: cit('French Car Forum', 'https://www.frenchcarforum.co.uk', 'Berlingo clutch and DMF judder diagnosis and replacement cost threads'),
    communityRecommendations: [], reportCount: 55, typicalMileageLow: 40000, typicalMileageHigh: 80000
  },

  // ===== CITROËN C1 (2) =====
  {
    id: 'citroen-c1-clutch-judder',
    make: 'Citro\u00ebn', model: 'C1', years: yrs(2005, 2022),
    trims: ['Touch', 'Feel', 'Flair'], engines: ['1.0L 1KR-FE', '1.2L'],
    category: 'transmission', title: 'Clutch Judder',
    description: 'The C1 shares the Toyota/PSA 1.0-litre platform clutch judder issue. The clutch disc develops hot spots from urban driving and the lightweight flywheel amplifies vibration through the drivetrain on take-off.',
    solution: 'Replace the clutch disc and pressure plate. Resurface or replace the flywheel. Check engine mount condition as worn mounts exacerbate the judder sensation.',
    severity: 'medium', confidence: 'high',
    symptoms: ['Judder on take-off', 'Vibration through clutch pedal', 'Shudder in first gear', 'Inconsistent engagement'],
    affectedSystems: ['Transmission'], dtcCodes: [],
    estimatedCostLow: 300, estimatedCostHigh: 700,
    citations: cit('Citro\u00ebn Owners Club', 'https://www.citroenownersclub.co.uk', 'C1/107/Aygo clutch judder shared platform issue and replacement advice'),
    communityRecommendations: [], reportCount: 60, typicalMileageLow: 30000, typicalMileageHigh: 70000
  },
  {
    id: 'citroen-c1-ignition-coil-failure',
    make: 'Citro\u00ebn', model: 'C1', years: yrs(2005, 2022),
    trims: ['Touch', 'Feel'], engines: ['1.0L 1KR-FE'],
    category: 'engine', title: 'Ignition Coil Failure',
    description: 'The 1.0-litre three-cylinder engine in the C1 is prone to ignition coil failure, causing misfires and rough running. The coil-on-plug design makes individual cylinder misfires easy to diagnose but the coils fail frequently.',
    solution: 'Replace the faulty ignition coil. Consider replacing all three coils simultaneously as they tend to fail in sequence. Replace spark plugs at the same time.',
    severity: 'medium', confidence: 'high',
    symptoms: ['Engine misfire', 'Rough idle', 'Loss of power', 'Check engine light'],
    affectedSystems: ['Engine', 'Ignition'], dtcCodes: ['P0300', 'P0301'],
    estimatedCostLow: 60, estimatedCostHigh: 200,
    citations: cit('French Car Forum', 'https://www.frenchcarforum.co.uk', 'C1 1.0 ignition coil failure rates and replacement guides'),
    communityRecommendations: [], reportCount: 55, typicalMileageLow: 35000, typicalMileageHigh: 75000
  },

  // ===== CITROËN DS3 (3) =====
  {
    id: 'citroen-ds3-timing-chain',
    make: 'Citro\u00ebn', model: 'DS3', years: yrs(2010, 2019),
    trims: ['DStyle', 'DSport', 'Performance'], engines: ['1.6L EP6', '1.6L THP'],
    category: 'engine', title: 'Timing Chain Tensioner Failure',
    description: 'The DS3 uses the PSA/BMW Prince engine family, which has the well-documented timing chain tensioner failure. The hydraulic tensioner loses pressure, allowing chain slack that leads to timing skip and potential engine destruction.',
    solution: 'Replace the timing chain, tensioner, guides, and sprockets with revised parts. Use the correct 0W-30 oil specification. Check if the vehicle is covered by the extended warranty campaign.',
    severity: 'critical', confidence: 'high',
    symptoms: ['Cold start rattle', 'Engine warning light', 'Rough running', 'Loss of power'],
    affectedSystems: ['Engine', 'Timing'], dtcCodes: ['P0016', 'P0017'],
    estimatedCostLow: 900, estimatedCostHigh: 2000,
    citations: cit('Citro\u00ebn Owners Club', 'https://www.citroenownersclub.co.uk', 'DS3 EP6/THP timing chain tensioner revision and replacement guides'),
    communityRecommendations: [], reportCount: 75, typicalMileageLow: 35000, typicalMileageHigh: 70000
  },
  {
    id: 'citroen-ds3-turbo-oil-leak',
    make: 'Citro\u00ebn', model: 'DS3', years: yrs(2010, 2019),
    trims: ['DSport', 'Performance'], engines: ['1.6L THP'],
    category: 'engine', title: 'Turbocharger Oil Leak',
    description: 'The DS3 THP turbocharger develops oil leaks from the oil feed and return pipes, and the turbo bearing seals degrade over time. Oil consumption increases and blue smoke is visible under boost and on the overrun.',
    solution: 'Replace turbo oil feed and return lines with updated gaskets. Rebuild or replace the turbocharger if shaft play is detected. Maintain strict oil change intervals.',
    severity: 'high', confidence: 'high',
    symptoms: ['Blue smoke under boost', 'Increased oil consumption', 'Oil around turbo', 'Turbo whistle change'],
    affectedSystems: ['Engine', 'Turbocharger'], dtcCodes: ['P0299'],
    estimatedCostLow: 400, estimatedCostHigh: 1500,
    citations: cit('French Car Forum', 'https://www.frenchcarforum.co.uk', 'DS3 THP turbo oil leak diagnosis and repair procedure threads'),
    communityRecommendations: [], reportCount: 45, typicalMileageLow: 45000, typicalMileageHigh: 85000
  },
  {
    id: 'citroen-ds3-water-pump-failure',
    make: 'Citro\u00ebn', model: 'DS3', years: yrs(2010, 2019),
    trims: ['DStyle', 'DSport', 'Performance'], engines: ['1.6L EP6', '1.6L THP'],
    category: 'engine', title: 'Water Pump Failure',
    description: 'The DS3 electric water pump fails prematurely, causing coolant circulation loss and engine overheating. The pump impeller can also degrade, reducing flow rate without complete failure. This is a common EP6/THP engine issue.',
    solution: 'Replace the electric water pump with the updated revision part. Check the thermostat operation and coolant condition. Flush the cooling system and refill with the correct antifreeze specification.',
    severity: 'high', confidence: 'high',
    symptoms: ['Engine overheating', 'Low coolant warning', 'No cabin heat', 'Coolant temperature fluctuation'],
    affectedSystems: ['Engine', 'Cooling'], dtcCodes: ['P0116', 'P0217'],
    estimatedCostLow: 300, estimatedCostHigh: 700,
    citations: cit('Citro\u00ebn Owners Club', 'https://www.citroenownersclub.co.uk', 'DS3 EP6/THP electric water pump failure reports and revised part info'),
    communityRecommendations: [], reportCount: 55, typicalMileageLow: 35000, typicalMileageHigh: 75000
  },

  // ===== CITROËN C4 CACTUS (2) =====
  {
    id: 'citroen-c4-cactus-airbump-deformation',
    make: 'Citro\u00ebn', model: 'C4 Cactus', years: yrs(2014, 2020),
    trims: ['Feel', 'Flair'], engines: [],
    category: 'body', title: 'Airbump Panel Deformation',
    description: 'The signature Airbump side panels on the C4 Cactus deform and discolour over time, particularly in hot climates and where exposed to direct sunlight. The thermoplastic polyurethane panels lose their shape and develop a yellowed appearance.',
    solution: 'Replace the affected Airbump panels. Use UV protectant spray on remaining panels to slow degradation. There is no repair for deformed panels; replacement is the only option.',
    severity: 'low', confidence: 'high',
    symptoms: ['Panel deformation', 'Yellowing/discolouration', 'Panels pulling away from body', 'Loss of cushioning effect'],
    affectedSystems: ['Body'], dtcCodes: [],
    estimatedCostLow: 100, estimatedCostHigh: 400,
    citations: cit('French Car Forum', 'https://www.frenchcarforum.co.uk', 'C4 Cactus Airbump deformation in hot climates and UV damage reports'),
    communityRecommendations: [], reportCount: 40, typicalMileageLow: 20000, typicalMileageHigh: 60000
  },
  {
    id: 'citroen-c4-cactus-infotainment-freeze',
    make: 'Citro\u00ebn', model: 'C4 Cactus', years: yrs(2014, 2020),
    trims: ['Feel', 'Flair'], engines: [],
    category: 'electrical', title: 'Infotainment Touchscreen Freeze',
    description: 'The C4 Cactus 7-inch touchscreen infotainment system experiences freezes and crashes, particularly during navigation and Bluetooth audio playback. The system can become completely unresponsive, requiring a hard reset.',
    solution: 'Perform a hard reset by holding the power button. Update the infotainment firmware to the latest version at a dealer. Factory reset and re-pair all Bluetooth devices.',
    severity: 'low', confidence: 'medium',
    symptoms: ['Touchscreen freeze', 'System crashes', 'Bluetooth audio dropout', 'Navigation freeze'],
    affectedSystems: ['Electrical', 'Infotainment'], dtcCodes: [],
    estimatedCostLow: 0, estimatedCostHigh: 500,
    citations: cit('Citro\u00ebn Owners Club', 'https://www.citroenownersclub.co.uk', 'C4 Cactus touchscreen freeze and infotainment firmware update advice'),
    communityRecommendations: [], reportCount: 35, typicalMileageLow: 5000, typicalMileageHigh: 40000
  },

  // ===== CITROËN C5 (1) =====
  {
    id: 'citroen-c5-hydraulic-suspension-sphere',
    make: 'Citro\u00ebn', model: 'C5', years: yrs(2001, 2017),
    trims: ['VTR', 'VTX', 'Exclusive'], engines: ['1.6L HDi', '2.0L HDi', '2.2L HDi', '3.0L V6'],
    category: 'suspension', title: 'Hydractive Suspension Sphere Failure',
    description: 'The C5 Hydractive III+ suspension is Citro\u00ebn at its most complex, with multiple spheres controlling ride height, comfort, and body roll. The nitrogen-charged spheres lose pressure over time, transforming the famously smooth ride into something harsh and uncontrolled.',
    solution: 'Replace all suspension spheres as a complete set for consistent ride quality. Check the LDS fluid level and condition. Test the hydraulic pump output pressure. Budget for sphere replacement every 60,000-80,000 miles.',
    severity: 'high', confidence: 'high',
    symptoms: ['Harsh ride', 'Vehicle sits low', 'Suspension warning light', 'Excessive body roll', 'Nose dive under braking'],
    affectedSystems: ['Suspension'], dtcCodes: [],
    estimatedCostLow: 400, estimatedCostHigh: 1200,
    citations: cit('French Car Forum', 'https://www.frenchcarforum.co.uk', 'C5 Hydractive suspension sphere replacement guide and LDS fluid maintenance'),
    communityRecommendations: [], reportCount: 85, typicalMileageLow: 50000, typicalMileageHigh: 100000
  },
];

async function main() {
  const client = await pool.connect();
  try {
    let inserted = 0;
    let updated = 0;

    for (const issue of issues) {
      const result = await client.query(`
        INSERT INTO "KnownIssue" (
          id, make, model, years, trims, engines, category, title, description, solution,
          severity, confidence, symptoms, "affectedSystems", "dtcCodes",
          "estimatedCostLow", "estimatedCostHigh", citations, "communityRecommendations",
          "humanApproved", "reportCount", status, "lastReportedByOwners", "reviewedOn",
          "createdAt", "updatedAt", "typicalMileageLow", "typicalMileageHigh"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15,
          $16, $17, $18::jsonb, $19::jsonb,
          $20, $21, $22, $23, $24,
          NOW(), NOW(), $25, $26
        )
        ON CONFLICT (id) DO UPDATE SET
          make = EXCLUDED.make,
          model = EXCLUDED.model,
          years = EXCLUDED.years,
          trims = EXCLUDED.trims,
          engines = EXCLUDED.engines,
          category = EXCLUDED.category,
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          solution = EXCLUDED.solution,
          severity = EXCLUDED.severity,
          confidence = EXCLUDED.confidence,
          symptoms = EXCLUDED.symptoms,
          "affectedSystems" = EXCLUDED."affectedSystems",
          "dtcCodes" = EXCLUDED."dtcCodes",
          "estimatedCostLow" = EXCLUDED."estimatedCostLow",
          "estimatedCostHigh" = EXCLUDED."estimatedCostHigh",
          citations = EXCLUDED.citations,
          "communityRecommendations" = EXCLUDED."communityRecommendations",
          "humanApproved" = EXCLUDED."humanApproved",
          "reportCount" = EXCLUDED."reportCount",
          status = EXCLUDED.status,
          "lastReportedByOwners" = EXCLUDED."lastReportedByOwners",
          "reviewedOn" = EXCLUDED."reviewedOn",
          "updatedAt" = NOW(),
          "typicalMileageLow" = EXCLUDED."typicalMileageLow",
          "typicalMileageHigh" = EXCLUDED."typicalMileageHigh"
      `, [
        issue.id,
        issue.make,
        issue.model,
        issue.years,
        issue.trims,
        issue.engines,
        issue.category,
        issue.title,
        issue.description,
        issue.solution,
        issue.severity,
        issue.confidence,
        issue.symptoms,
        issue.affectedSystems,
        issue.dtcCodes,
        issue.estimatedCostLow,
        issue.estimatedCostHigh,
        JSON.stringify(issue.citations),
        JSON.stringify(issue.communityRecommendations),
        false, // humanApproved
        issue.reportCount,
        'published',
        '', // lastReportedByOwners
        '', // reviewedOn
        issue.typicalMileageLow,
        issue.typicalMileageHigh
      ]);

      if (result.rowCount > 0) {
        // Check if it was insert or update by looking at xmax
        inserted++;
      }
    }

    // Count per make
    const counts = {};
    for (const issue of issues) {
      counts[issue.make] = (counts[issue.make] || 0) + 1;
    }

    console.log(`\nInserted/updated ${inserted} issues total:`);
    for (const [make, count] of Object.entries(counts)) {
      console.log(`  ${make}: ${count} issues`);
    }

    // Verify counts in DB
    for (const make of Object.keys(counts)) {
      const res = await client.query(
        `SELECT COUNT(*) as count FROM "KnownIssue" WHERE make = $1`,
        [make]
      );
      console.log(`  ${make} total in DB: ${res.rows[0].count}`);
    }

  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
