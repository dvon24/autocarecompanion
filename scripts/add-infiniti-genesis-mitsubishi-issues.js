#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const issues = [
  // ═══ INFINITI (30 issues) ═══
  // G35 (3)
  {
    id: 'infiniti-g35-oil-consumption-vq35de',
    make: 'Infiniti', model: 'G35', years: [2003,2004,2005,2006,2007],
    category: 'engine', title: 'VQ35DE Oil Consumption',
    description: 'The VQ35DE engine in the G35 is known to consume excessive oil, sometimes burning 1 quart every 1,000-2,000 miles. This is typically caused by worn valve stem seals and piston rings that allow oil to enter the combustion chamber.',
    solution: 'Replace valve stem seals and inspect piston rings. In severe cases, a short block replacement may be necessary. Use manufacturer-recommended 5W-30 oil and monitor consumption between changes.',
    severity: 'medium', confidence: 'high',
    symptoms: ['Blue/white smoke from exhaust on startup','Low oil level warnings between changes','Fouled spark plugs'],
    affectedSystems: ['engine'], dtcCodes: [], engines: ['3.5L VQ35DE V6'],
    estimatedCostLow: 800, estimatedCostHigh: 3000,
    citations: [{ source: 'G35Driver Forum', url: 'https://www.g35driver.com', title: 'VQ35DE Oil Consumption Discussion' }]
  },
  {
    id: 'infiniti-g35-window-regulator-failure',
    make: 'Infiniti', model: 'G35', years: [2003,2004,2005,2006,2007],
    category: 'electrical', title: 'Power Window Regulator Failure',
    description: 'The power window regulators in the G35 are prone to failure, causing windows to fall into the door or operate slowly. The plastic guide clips and cable mechanism wear out, especially in hot climates.',
    solution: 'Replace the window regulator assembly. Aftermarket regulators are available at lower cost than OEM. The repair involves removing the door panel and disconnecting the window motor.',
    severity: 'low', confidence: 'high',
    symptoms: ['Window drops into door panel','Grinding noise when operating window','Window moves slowly or unevenly'],
    affectedSystems: ['electrical'], dtcCodes: [], engines: [],
    estimatedCostLow: 150, estimatedCostHigh: 400,
    citations: [{ source: 'MyG37 Forum', url: 'https://www.myg37.com', title: 'G35 Window Regulator Issues' }]
  },
  {
    id: 'infiniti-g35-steering-wheel-lock',
    make: 'Infiniti', model: 'G35', years: [2003,2004,2005,2006,2007],
    category: 'steering', title: 'Steering Wheel Lock Malfunction',
    description: 'The electronic steering wheel lock mechanism can malfunction, preventing the car from starting or causing intermittent no-start conditions. The steering lock actuator motor fails internally, triggering a security fault.',
    solution: 'Replace the steering lock actuator or have the dealer reprogram the BCM. Some owners bypass the lock mechanism entirely, though this may affect resale value. A TSB was issued for certain model years.',
    severity: 'high', confidence: 'medium',
    symptoms: ['Car will not start with key in ignition','Steering wheel will not unlock','Security light flashing on dashboard'],
    affectedSystems: ['steering','electrical'], dtcCodes: [], engines: [],
    estimatedCostLow: 300, estimatedCostHigh: 900,
    citations: [{ source: 'G35Driver Forum', url: 'https://www.g35driver.com', title: 'Steering Lock Failure Discussion' }]
  },
  // G37 (3)
  {
    id: 'infiniti-g37-galley-gasket-oil-leak',
    make: 'Infiniti', model: 'G37', years: [2008,2009,2010,2011,2012,2013],
    category: 'engine', title: 'Oil Gallery Gasket Leak',
    description: 'The VQ37VHR engine develops oil leaks from the oil gallery gaskets located between the upper and lower oil pans. Oil seeps onto the exhaust, creating a burning smell and potential fire hazard if left unaddressed.',
    solution: 'Replace the oil gallery gaskets, which requires removing the lower oil pan. Use updated Nissan/Infiniti gaskets that have improved sealing material. Clean all mating surfaces thoroughly before reinstalling.',
    severity: 'high', confidence: 'high',
    symptoms: ['Burning oil smell from engine bay','Oil dripping on exhaust manifold','Visible oil seepage on lower engine block'],
    affectedSystems: ['engine'], dtcCodes: [], engines: ['3.7L VQ37VHR V6'],
    estimatedCostLow: 400, estimatedCostHigh: 1200,
    citations: [{ source: 'MyG37 Forum', url: 'https://www.myg37.com', title: 'Gallery Gasket Oil Leak Fix' }]
  },
  {
    id: 'infiniti-g37-concentric-slave-cylinder',
    make: 'Infiniti', model: 'G37', years: [2008,2009,2010,2011,2012,2013],
    category: 'transmission', title: 'Concentric Slave Cylinder Failure (Manual)',
    description: 'Manual transmission G37s suffer from premature concentric slave cylinder (CSC) failure. The internal seal degrades, causing clutch fluid to leak into the bell housing and resulting in a soft or sinking clutch pedal.',
    solution: 'Replace the concentric slave cylinder, which unfortunately requires transmission removal. Many owners upgrade to an aftermarket CSC with improved seals. Flush the clutch hydraulic system after replacement.',
    severity: 'high', confidence: 'high',
    symptoms: ['Soft or spongy clutch pedal','Clutch pedal sinks to floor','Difficulty shifting gears','Clutch fluid level dropping'],
    affectedSystems: ['transmission'], dtcCodes: [], engines: ['3.7L VQ37VHR V6'],
    estimatedCostLow: 800, estimatedCostHigh: 2000,
    citations: [{ source: 'MyG37 Forum', url: 'https://www.myg37.com', title: 'CSC Replacement Guide' }]
  },
  {
    id: 'infiniti-g37-steering-lock-malfunction',
    make: 'Infiniti', model: 'G37', years: [2008,2009,2010,2011,2012,2013],
    category: 'steering', title: 'Electronic Steering Lock Failure',
    description: 'Like the G35, the G37 suffers from electronic steering wheel lock actuator failures that prevent the vehicle from starting. The internal motor in the lock mechanism burns out or the control module loses communication with the BCM.',
    solution: 'Replace the steering lock actuator assembly. Nissan issued a voluntary service campaign for some VINs covering this repair. Check with the dealer for coverage before paying out of pocket.',
    severity: 'high', confidence: 'high',
    symptoms: ['No-start condition with push button','Steering wheel locked and will not release','NATS warning light illuminated'],
    affectedSystems: ['steering','electrical'], dtcCodes: [], engines: [],
    estimatedCostLow: 300, estimatedCostHigh: 1000,
    citations: [{ source: 'Infiniti Consumer Affairs', url: 'https://www.infinitiusa.com', title: 'Steering Lock Service Campaign' }]
  },
  // Q50 (4)
  {
    id: 'infiniti-q50-intouch-infotainment-lag',
    make: 'Infiniti', model: 'Q50', years: [2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024,2025,2026],
    category: 'electrical', title: 'InTouch Infotainment System Lag and Freezing',
    description: 'The dual-screen InTouch infotainment system suffers from significant lag, freezing, and occasional black screens. The system uses an outdated processor that struggles with modern navigation and connectivity demands.',
    solution: 'Perform a system reset by holding the power button for 10 seconds. Update to the latest firmware via USB. In persistent cases, the infotainment module may need replacement. Some owners have had success with aftermarket head units.',
    severity: 'medium', confidence: 'high',
    symptoms: ['Touchscreen unresponsive to inputs','Navigation freezing mid-route','Bluetooth disconnecting frequently','Black screen on upper or lower display'],
    affectedSystems: ['electrical'], dtcCodes: [], engines: [],
    estimatedCostLow: 0, estimatedCostHigh: 1500,
    citations: [{ source: 'InfinitiQ50 Forum', url: 'https://www.infinitiq50.org', title: 'InTouch System Issues Thread' }]
  },
  {
    id: 'infiniti-q50-steer-by-wire-issues',
    make: 'Infiniti', model: 'Q50', years: [2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024,2025,2026],
    category: 'steering', title: 'Direct Adaptive Steering (Steer-by-Wire) Issues',
    description: 'The Q50 Sport and Red Sport models equipped with Direct Adaptive Steering (DAS) can exhibit a disconnected steering feel, inconsistent road feedback, and occasional steering angle sensor faults. The system lacks the natural feel of a mechanical steering column.',
    solution: 'Recalibrate the DAS system at the dealer. Software updates have improved steering feel in later model years. Some owners opt for the non-DAS steering column swap, though this is labor-intensive.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Numb or artificial steering feel','Steering pulls intermittently','Steering warning light illumination','Inconsistent steering weight'],
    affectedSystems: ['steering'], dtcCodes: [], engines: [],
    estimatedCostLow: 100, estimatedCostHigh: 800,
    citations: [{ source: 'InfinitiQ50 Forum', url: 'https://www.infinitiq50.org', title: 'DAS Steering Discussion' }]
  },
  {
    id: 'infiniti-q50-turbo-heat-shield-rattle',
    make: 'Infiniti', model: 'Q50', years: [2016,2017,2018,2019,2020,2021,2022,2023,2024,2025,2026],
    category: 'engine', title: 'VR30DDTT Turbo Heat Shield Rattle',
    description: 'The twin-turbo VR30DDTT engine develops an annoying heat shield rattle, particularly at cold start and low RPM. The heat shields on the turbochargers and exhaust manifold loosen over time due to thermal cycling.',
    solution: 'Tighten or replace the heat shield mounting hardware. Stainless steel hose clamps can be used as a temporary fix. Some owners remove the heat shields entirely, though this is not recommended for underhood temperature management.',
    severity: 'low', confidence: 'high',
    symptoms: ['Metallic rattling at cold start','Buzzing noise at low RPM','Rattle that disappears when engine warms up'],
    affectedSystems: ['engine','exhaust'], dtcCodes: [], engines: ['3.0L VR30DDTT V6 Twin-Turbo'],
    estimatedCostLow: 50, estimatedCostHigh: 300,
    citations: [{ source: 'InfinitiQ50 Forum', url: 'https://www.infinitiq50.org', title: 'Heat Shield Rattle Fix' }]
  },
  {
    id: 'infiniti-q50-cvt-judder',
    make: 'Infiniti', model: 'Q50', years: [2014,2015,2016],
    category: 'transmission', title: 'CVT Judder at Low Speed (2.0T Models)',
    description: 'Early Q50 models with the 2.0-liter turbo and CVT transmission experience a noticeable judder or shudder during low-speed acceleration and deceleration. The CVT belt and pulleys develop uneven wear patterns.',
    solution: 'Perform a CVT fluid drain and refill with Nissan NS-3 fluid. A CVT recalibration procedure at the dealer can help. In severe cases, the CVT valve body or complete unit may need replacement.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Shudder during gentle acceleration','Vibration at low speeds','Hesitation when pulling away from stop'],
    affectedSystems: ['transmission'], dtcCodes: [], engines: ['2.0L Turbo I4'],
    estimatedCostLow: 200, estimatedCostHigh: 4000,
    citations: [{ source: 'InfinitiQ50 Forum', url: 'https://www.infinitiq50.org', title: 'CVT Judder Discussion' }]
  },
  // Q60 (3)
  {
    id: 'infiniti-q60-turbo-coolant-leak-vr30',
    make: 'Infiniti', model: 'Q60', years: [2017,2018,2019,2020,2021,2022,2023,2024,2025,2026],
    category: 'engine', title: 'VR30DDTT Turbo Coolant Line Leak',
    description: 'The twin-turbo VR30DDTT engine in the Q60 can develop coolant leaks from the turbocharger coolant supply lines. The plastic quick-connect fittings become brittle from heat exposure and crack, causing coolant loss.',
    solution: 'Replace the plastic quick-connect fittings with updated metal fittings from Nissan. Inspect all turbo coolant lines for signs of deterioration. Monitor coolant levels regularly as a precaution.',
    severity: 'high', confidence: 'medium',
    symptoms: ['Coolant level dropping with no visible leak','Sweet smell from engine bay','Coolant pooling under turbocharger area'],
    affectedSystems: ['engine','cooling'], dtcCodes: [], engines: ['3.0L VR30DDTT V6 Twin-Turbo'],
    estimatedCostLow: 200, estimatedCostHigh: 800,
    citations: [{ source: 'Q60 Forum', url: 'https://www.infinitiq60.org', title: 'VR30 Coolant Leak Fix' }]
  },
  {
    id: 'infiniti-q60-infotainment-issues',
    make: 'Infiniti', model: 'Q60', years: [2017,2018,2019,2020,2021,2022,2023,2024,2025,2026],
    category: 'electrical', title: 'InTouch Infotainment Freezing and Slow Response',
    description: 'The Q60 shares the same dual-screen InTouch system as the Q50, inheriting its lag, freezing, and connectivity issues. The aging hardware platform struggles with modern smartphone integration and navigation processing.',
    solution: 'Update firmware to the latest version. Perform hard resets when screens freeze. Some owners upgrade to aftermarket Android Auto/CarPlay units for improved functionality.',
    severity: 'medium', confidence: 'high',
    symptoms: ['Screens freezing during use','Slow navigation response','Bluetooth pairing failures','Camera display lag'],
    affectedSystems: ['electrical'], dtcCodes: [], engines: [],
    estimatedCostLow: 0, estimatedCostHigh: 1500,
    citations: [{ source: 'Q60 Forum', url: 'https://www.infinitiq60.org', title: 'InTouch Problems Thread' }]
  },
  {
    id: 'infiniti-q60-steering-feel-disconnect',
    make: 'Infiniti', model: 'Q60', years: [2017,2018,2019,2020,2021,2022,2023,2024,2025,2026],
    category: 'steering', title: 'Direct Adaptive Steering Feel Disconnect',
    description: 'The Q60 with Direct Adaptive Steering exhibits a disconnected, artificial steering feel that many enthusiasts find unsatisfying. The steer-by-wire system filters out road imperfections but also removes valuable feedback for spirited driving.',
    solution: 'Switch to Sport+ steering mode for the most direct feel. Software updates from Infiniti have progressively improved the DAS calibration. Consider the non-DAS equipped models for a more traditional steering feel.',
    severity: 'low', confidence: 'high',
    symptoms: ['Numb steering feel at highway speeds','Inconsistent steering effort','Lack of road surface feedback'],
    affectedSystems: ['steering'], dtcCodes: [], engines: [],
    estimatedCostLow: 0, estimatedCostHigh: 200,
    citations: [{ source: 'Q60 Forum', url: 'https://www.infinitiq60.org', title: 'DAS Steering Feel Thread' }]
  },
  // QX50 (3)
  {
    id: 'infiniti-qx50-vc-turbo-oil-consumption',
    make: 'Infiniti', model: 'QX50', years: [2019,2020,2021,2022,2023,2024,2025,2026],
    category: 'engine', title: 'VC-Turbo Engine Oil Consumption',
    description: 'The variable compression turbo (VC-Turbo) KR20DDET engine in the QX50 is known for higher-than-normal oil consumption, sometimes requiring top-offs between scheduled oil changes. The complex variable compression mechanism adds more internal surfaces where oil can be consumed.',
    solution: 'Monitor oil levels every 1,000 miles and top off as needed. Use only 0W-20 full synthetic oil meeting Nissan specifications. Infiniti has extended the powertrain warranty on some VINs to address this concern.',
    severity: 'medium', confidence: 'high',
    symptoms: ['Low oil level warning between changes','Oil consumption exceeding 1 qt per 3,000 miles','No visible external leaks'],
    affectedSystems: ['engine'], dtcCodes: [], engines: ['2.0L VC-Turbo KR20DDET I4'],
    estimatedCostLow: 50, estimatedCostHigh: 500,
    citations: [{ source: 'QX50 Forum', url: 'https://www.infinitiqx50.org', title: 'VC-Turbo Oil Consumption Reports' }]
  },
  {
    id: 'infiniti-qx50-cvt-shudder',
    make: 'Infiniti', model: 'QX50', years: [2019,2020,2021,2022,2023,2024,2025,2026],
    category: 'transmission', title: 'CVT Shudder Under Light Acceleration',
    description: 'The Jatco CVT paired with the VC-Turbo engine can develop a noticeable shudder during light acceleration from a stop. The CVT belt and pulleys exhibit inconsistent clamping force at low vehicle speeds.',
    solution: 'Perform a CVT fluid drain and refill with genuine Nissan NS-3 CVT fluid. A TCM recalibration at the dealer may resolve the issue. Severe cases may require valve body replacement.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Vibration during gentle acceleration','Hesitation from stop','RPM fluctuation at low speeds'],
    affectedSystems: ['transmission'], dtcCodes: [], engines: [],
    estimatedCostLow: 200, estimatedCostHigh: 3500,
    citations: [{ source: 'QX50 Forum', url: 'https://www.infinitiqx50.org', title: 'CVT Shudder Fix Thread' }]
  },
  {
    id: 'infiniti-qx50-infotainment-lag',
    make: 'Infiniti', model: 'QX50', years: [2019,2020,2021,2022,2023,2024,2025,2026],
    category: 'electrical', title: 'Infotainment System Lag and Connectivity Issues',
    description: 'The QX50 InTouch infotainment system suffers from slow response times, frequent Bluetooth disconnections, and occasional screen blackouts. The dual-screen setup amplifies the frustration when both displays become unresponsive.',
    solution: 'Update to the latest firmware via USB download from Infiniti. Perform a system reset by holding the power button. Clear paired Bluetooth devices and re-pair to resolve connectivity issues.',
    severity: 'low', confidence: 'high',
    symptoms: ['Touchscreen delayed response','Bluetooth audio cutting out','Navigation taking long to load','Screen going black intermittently'],
    affectedSystems: ['electrical'], dtcCodes: [], engines: [],
    estimatedCostLow: 0, estimatedCostHigh: 500,
    citations: [{ source: 'QX50 Forum', url: 'https://www.infinitiqx50.org', title: 'Infotainment Issues Thread' }]
  },
  // QX60 (4)
  {
    id: 'infiniti-qx60-cvt-failure',
    make: 'Infiniti', model: 'QX60', years: [2013,2014,2015,2016,2017,2018,2019,2020],
    category: 'transmission', title: 'CVT Transmission Failure',
    description: 'The Jatco CVT in the QX60 is prone to premature failure, particularly in the 2013-2017 models. The transmission overheats during towing or sustained highway driving, leading to shuddering, slipping, and eventual complete failure.',
    solution: 'Replace CVT fluid every 30,000 miles instead of the recommended 60,000. Add an auxiliary transmission cooler for towing. Nissan extended the CVT warranty to 84 months/84,000 miles on affected models.',
    severity: 'critical', confidence: 'high',
    symptoms: ['Transmission shuddering at highway speeds','Loss of power during acceleration','Whining noise from transmission','CVT overheating warning'],
    affectedSystems: ['transmission'], dtcCodes: ['P0868','P17F0'], engines: [],
    estimatedCostLow: 3000, estimatedCostHigh: 8000,
    citations: [{ source: 'QX60 Forum', url: 'https://www.infinitiqx60.org', title: 'CVT Failure Class Action Discussion' }]
  },
  {
    id: 'infiniti-qx60-ac-compressor-failure',
    make: 'Infiniti', model: 'QX60', years: [2014,2015,2016,2017,2018,2019,2020],
    category: 'hvac', title: 'AC Compressor Premature Failure',
    description: 'The AC compressor in the QX60 frequently fails prematurely, often around 60,000-80,000 miles. Internal clutch bearing failure and refrigerant leaks through the compressor shaft seal are the common failure modes.',
    solution: 'Replace the AC compressor, receiver/drier, and expansion valve as a set. Flush the entire AC system to remove metal debris from the failed compressor. Use only OEM-spec PAG oil.',
    severity: 'medium', confidence: 'high',
    symptoms: ['AC blowing warm air','Clicking noise from compressor area','Intermittent cooling','Refrigerant leak under vehicle'],
    affectedSystems: ['hvac'], dtcCodes: [], engines: [],
    estimatedCostLow: 800, estimatedCostHigh: 1800,
    citations: [{ source: 'QX60 Forum', url: 'https://www.infinitiqx60.org', title: 'AC Compressor Failure Reports' }]
  },
  {
    id: 'infiniti-qx60-transmission-judder',
    make: 'Infiniti', model: 'QX60', years: [2013,2014,2015,2016,2017,2018,2019,2020],
    category: 'transmission', title: 'Transmission Judder at Low Speed',
    description: 'The QX60 CVT exhibits a pronounced judder during low-speed maneuvers such as parking lot driving and stop-and-go traffic. The torque converter and CVT belt interaction produces an uncomfortable vibration through the drivetrain.',
    solution: 'Have the dealer perform the CVT judder reprogram (TSB NTB15-024). A CVT fluid change with NS-3 fluid can also improve the condition. Drive the vehicle for 30 minutes after the fluid change to allow the TCM to relearn.',
    severity: 'medium', confidence: 'high',
    symptoms: ['Vibration during low-speed turns','Shudder when accelerating from stop','Jerky motion in parking lots'],
    affectedSystems: ['transmission'], dtcCodes: [], engines: [],
    estimatedCostLow: 150, estimatedCostHigh: 500,
    citations: [{ source: 'NHTSA', url: 'https://www.nhtsa.gov', title: 'QX60 CVT Judder Complaints' }]
  },
  {
    id: 'infiniti-qx60-power-steering-pump-whine',
    make: 'Infiniti', model: 'QX60', years: [2013,2014,2015,2016,2017,2018,2019,2020],
    category: 'steering', title: 'Power Steering Pump Whine',
    description: 'The hydraulic power steering pump develops a pronounced whining noise, especially during cold starts and low-speed turning. Air intrusion into the power steering fluid or a failing pump bearing causes the noise.',
    solution: 'Flush the power steering system and refill with Nissan PSF. Bleed air from the system by turning the wheel lock-to-lock several times with the engine running. Replace the pump if the noise persists after fluid service.',
    severity: 'low', confidence: 'medium',
    symptoms: ['Whining noise during turns','Groaning at full steering lock','Stiff steering on cold mornings'],
    affectedSystems: ['steering'], dtcCodes: [], engines: [],
    estimatedCostLow: 100, estimatedCostHigh: 600,
    citations: [{ source: 'QX60 Forum', url: 'https://www.infinitiqx60.org', title: 'PS Pump Whine Fix' }]
  },
  // QX80 (3)
  {
    id: 'infiniti-qx80-hydraulic-body-motion-control-leak',
    make: 'Infiniti', model: 'QX80', years: [2018,2019,2020,2021,2022,2023,2024,2025,2026],
    category: 'suspension', title: 'Hydraulic Body Motion Control System Leak',
    description: 'The QX80 equipped with Hydraulic Body Motion Control (HBMC) develops fluid leaks from the hydraulic actuators and lines. The system uses high-pressure hydraulic fluid to control body roll, and seal degradation leads to leaks and reduced effectiveness.',
    solution: 'Inspect and replace leaking hydraulic lines and actuator seals. The HBMC fluid reservoir should be checked regularly. Complete system replacement is expensive but may be necessary if multiple components have failed.',
    severity: 'high', confidence: 'medium',
    symptoms: ['Increased body roll in corners','Hydraulic fluid puddle under vehicle','HBMC warning light on dashboard','Clunking noise over bumps'],
    affectedSystems: ['suspension'], dtcCodes: [], engines: [],
    estimatedCostLow: 500, estimatedCostHigh: 3000,
    citations: [{ source: 'QX80 Forum', url: 'https://www.infinitiqx80.org', title: 'HBMC Leak Discussion' }]
  },
  {
    id: 'infiniti-qx80-timing-chain-stretch',
    make: 'Infiniti', model: 'QX80', years: [2011,2012,2013,2014,2015,2016,2017],
    category: 'engine', title: 'VK56VD Timing Chain Stretch',
    description: 'The 5.6L VK56VD engine can develop timing chain stretch, particularly when oil changes are neglected. The primary and secondary timing chains elongate over time, causing rough idle, reduced power, and potential engine damage if not addressed.',
    solution: 'Replace the timing chain, tensioners, and guides as a complete kit. This is a labor-intensive repair requiring significant engine disassembly. Strict adherence to 5,000-mile oil change intervals helps prevent premature chain wear.',
    severity: 'high', confidence: 'medium',
    symptoms: ['Rattling noise at cold start','Check engine light with timing codes','Rough idle','Reduced engine power'],
    affectedSystems: ['engine'], dtcCodes: ['P0300','P0011'], engines: ['5.6L VK56VD V8'],
    estimatedCostLow: 2000, estimatedCostHigh: 5000,
    citations: [{ source: 'QX80 Forum', url: 'https://www.infinitiqx80.org', title: 'Timing Chain Replacement Guide' }]
  },
  {
    id: 'infiniti-qx80-infotainment-lag',
    make: 'Infiniti', model: 'QX80', years: [2018,2019,2020,2021,2022,2023,2024,2025,2026],
    category: 'electrical', title: 'Infotainment System Slow Response',
    description: 'The QX80 infotainment system exhibits noticeable lag when navigating menus, inputting destinations, and switching between audio sources. The aging hardware platform cannot keep pace with modern connected car expectations for a luxury SUV.',
    solution: 'Update to the latest available firmware. Reduce the number of paired Bluetooth devices. The 2025+ models received an updated system, but earlier models remain limited by hardware constraints.',
    severity: 'low', confidence: 'high',
    symptoms: ['Slow touchscreen response','Navigation route calculation delays','Audio source switching lag','Backup camera delayed display'],
    affectedSystems: ['electrical'], dtcCodes: [], engines: [],
    estimatedCostLow: 0, estimatedCostHigh: 500,
    citations: [{ source: 'QX80 Forum', url: 'https://www.infinitiqx80.org', title: 'Infotainment Lag Reports' }]
  },
  // M/Q70 (2)
  {
    id: 'infiniti-m-q70-timing-chain-tensioner',
    make: 'Infiniti', model: 'Q70', years: [2014,2015,2016,2017,2018,2019],
    category: 'engine', title: 'Timing Chain Tensioner Failure',
    description: 'The VQ37VHR and VQ35HR engines in the M/Q70 series develop timing chain tensioner wear, leading to chain rattle on startup and potential chain skip. The hydraulic tensioners lose their ability to maintain proper chain tension as the internal check valve wears.',
    solution: 'Replace the primary timing chain tensioners and inspect the chains and guides. Use updated tensioner part numbers that feature improved check valve design. This repair requires removing the front timing cover.',
    severity: 'high', confidence: 'medium',
    symptoms: ['Chain rattle on cold start lasting 1-3 seconds','Check engine light with cam timing codes','Rough idle after extended parking'],
    affectedSystems: ['engine'], dtcCodes: ['P0011','P0021'], engines: ['3.7L VQ37VHR V6'],
    estimatedCostLow: 1500, estimatedCostHigh: 3500,
    citations: [{ source: 'Infiniti Scene Forum', url: 'https://www.infinitiscene.com', title: 'M37 Timing Chain Issue' }]
  },
  {
    id: 'infiniti-m-q70-air-suspension-compressor',
    make: 'Infiniti', model: 'Q70', years: [2014,2015,2016,2017,2018,2019],
    category: 'suspension', title: 'Rear Air Suspension Compressor Failure',
    description: 'Q70 models equipped with rear air suspension experience compressor failures, typically around 80,000-100,000 miles. The compressor overworks to compensate for slowly leaking air springs, eventually burning out the motor.',
    solution: 'Replace the air suspension compressor and inspect the air springs for leaks. Replace any leaking air springs simultaneously to prevent premature compressor failure. Some owners convert to conventional coil springs as a cost-effective alternative.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Rear of vehicle sagging overnight','Compressor running constantly','Suspension warning light','Harsh ride quality from rear'],
    affectedSystems: ['suspension'], dtcCodes: [], engines: [],
    estimatedCostLow: 600, estimatedCostHigh: 2000,
    citations: [{ source: 'Infiniti Scene Forum', url: 'https://www.infinitiscene.com', title: 'Q70 Air Suspension Issues' }]
  },
  // FX/QX70 (2)
  {
    id: 'infiniti-fx-qx70-transfer-case-seal-leak',
    make: 'Infiniti', model: 'QX70', years: [2014,2015,2016,2017],
    category: 'drivetrain', title: 'Transfer Case Output Seal Leak',
    description: 'AWD-equipped FX/QX70 models develop transfer case output shaft seal leaks, allowing gear oil to seep onto the exhaust and create a burning smell. The seals harden and crack from heat exposure over time.',
    solution: 'Replace the transfer case output seals and inspect the transfer case fluid level. Refill with genuine Nissan transfer case fluid. Check the driveshaft joints for wear while the transfer case is accessible.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Burning gear oil smell','Oil drip from center of vehicle','Low transfer case fluid level'],
    affectedSystems: ['drivetrain'], dtcCodes: [], engines: [],
    estimatedCostLow: 300, estimatedCostHigh: 800,
    citations: [{ source: 'FX Owner Forum', url: 'https://www.fxownersclub.com', title: 'Transfer Case Seal Replacement' }]
  },
  {
    id: 'infiniti-fx-qx70-timing-chain',
    make: 'Infiniti', model: 'QX70', years: [2014,2015,2016,2017],
    category: 'engine', title: 'VQ37VHR Timing Chain Noise',
    description: 'The VQ37VHR engine in the QX70 can develop timing chain rattle, especially on cold starts. The primary timing chain stretches and the tensioner cannot fully compensate, resulting in a distinctive metallic rattle that typically quiets after 10-30 seconds.',
    solution: 'Replace the timing chain, tensioners, and guides as a set. Use updated Nissan timing chain components with improved tensioner design. Ensure regular oil changes with quality synthetic oil to minimize chain wear.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Cold start chain rattle','Gradually worsening startup noise','Check engine light for cam timing'],
    affectedSystems: ['engine'], dtcCodes: ['P0011'], engines: ['3.7L VQ37VHR V6'],
    estimatedCostLow: 1500, estimatedCostHigh: 3500,
    citations: [{ source: 'FX Owner Forum', url: 'https://www.fxownersclub.com', title: 'Timing Chain Replacement Thread' }]
  },
  // EX (1)
  {
    id: 'infiniti-ex35-oil-consumption',
    make: 'Infiniti', model: 'EX35', years: [2008,2009,2010,2011,2012],
    category: 'engine', title: 'VQ35HR Oil Consumption',
    description: 'The VQ35HR engine in the EX35 exhibits higher-than-normal oil consumption, typically burning 1 quart every 2,000-3,000 miles. Worn valve stem seals and piston ring coking contribute to the problem, especially in vehicles with infrequent oil changes.',
    solution: 'Perform an oil consumption test at the dealer to establish baseline usage. Replace valve stem seals if consumption exceeds 1 quart per 1,500 miles. Use quality 5W-30 synthetic oil and change every 5,000 miles.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Oil level dropping between changes','Light blue exhaust smoke on startup','Fouled spark plugs'],
    affectedSystems: ['engine'], dtcCodes: [], engines: ['3.5L VQ35HR V6'],
    estimatedCostLow: 100, estimatedCostHigh: 2500,
    citations: [{ source: 'Infiniti Scene Forum', url: 'https://www.infinitiscene.com', title: 'EX35 Oil Consumption Thread' }]
  },
  // QX55 (2)
  {
    id: 'infiniti-qx55-vc-turbo-oil-consumption',
    make: 'Infiniti', model: 'QX55', years: [2022,2023,2024,2025,2026],
    category: 'engine', title: 'VC-Turbo Engine Oil Consumption',
    description: 'Like the QX50, the QX55 with the VC-Turbo KR20DDET engine exhibits elevated oil consumption. The variable compression mechanism creates additional oil consumption pathways, and owners report needing top-offs between the 5,000-mile service intervals.',
    solution: 'Monitor oil levels bi-weekly and top off with 0W-20 synthetic. Follow the Infiniti oil consumption test procedure if usage exceeds 1 quart per 3,000 miles. Warranty coverage may apply for excessive consumption.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Low oil warnings between services','No visible external leaks','Oil level dropping 1+ quart per 3,000 miles'],
    affectedSystems: ['engine'], dtcCodes: [], engines: ['2.0L VC-Turbo KR20DDET I4'],
    estimatedCostLow: 50, estimatedCostHigh: 500,
    citations: [{ source: 'QX55 Owners Forum', url: 'https://www.infinitiqx55.com', title: 'Oil Consumption Reports' }]
  },
  {
    id: 'infiniti-qx55-infotainment-issues',
    make: 'Infiniti', model: 'QX55', years: [2022,2023,2024,2025,2026],
    category: 'electrical', title: 'Infotainment System Freezing',
    description: 'The QX55 infotainment system experiences periodic freezing, slow boot times, and wireless Apple CarPlay disconnections. The system occasionally requires a manual reboot to restore functionality during driving.',
    solution: 'Update to the latest infotainment firmware. Perform a factory reset if issues persist. Delete and re-pair all Bluetooth devices. Infiniti has released multiple software updates addressing stability.',
    severity: 'low', confidence: 'medium',
    symptoms: ['Screen freezing during navigation','Wireless CarPlay disconnecting','Slow system boot after starting car'],
    affectedSystems: ['electrical'], dtcCodes: [], engines: [],
    estimatedCostLow: 0, estimatedCostHigh: 300,
    citations: [{ source: 'QX55 Owners Forum', url: 'https://www.infinitiqx55.com', title: 'Infotainment Bugs Thread' }]
  },

  // ═══ GENESIS (22 issues) ═══
  // G70 (4)
  {
    id: 'genesis-g70-turbo-oil-line-leak',
    make: 'Genesis', model: 'G70', years: [2019,2020,2021,2022,2023,2024,2025,2026],
    category: 'engine', title: 'Turbo Oil Feed Line Leak (3.3T)',
    description: 'The 3.3-liter twin-turbo V6 in the G70 can develop oil leaks from the turbocharger oil feed lines. The banjo bolt crush washers at the turbo oil inlet degrade over time, allowing oil to seep onto the hot turbo housing and produce a burning smell.',
    solution: 'Replace the banjo bolt crush washers with new copper washers at both turbocharger oil feed connections. Inspect the oil feed lines for cracking. Torque banjo bolts to specification to prevent over-tightening.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Burning oil smell after highway driving','Oil drips on turbo heat shields','Slight oil consumption increase','Smoke visible from engine bay after hard driving'],
    affectedSystems: ['engine'], dtcCodes: [], engines: ['3.3L Twin-Turbo V6'],
    estimatedCostLow: 200, estimatedCostHigh: 800,
    citations: [{ source: 'Genesis Owners Forum', url: 'https://www.genesisowners.com', title: 'G70 3.3T Oil Leak Fix' }]
  },
  {
    id: 'genesis-g70-transmission-shift-quality',
    make: 'Genesis', model: 'G70', years: [2019,2020,2021,2022,2023,2024,2025,2026],
    category: 'transmission', title: '8-Speed Automatic Shift Quality Issues',
    description: 'The 8-speed automatic transmission in the G70 can exhibit rough or delayed shifts, particularly the 1-2 and 2-3 upshifts during cold operation. The adaptive transmission control module sometimes hunts between gears during light throttle city driving.',
    solution: 'Perform a transmission adaptation reset at the dealer. Update the TCM software to the latest calibration. Allow the transmission to fully warm up before spirited driving. A fluid change at 60,000 miles can improve shift quality.',
    severity: 'low', confidence: 'medium',
    symptoms: ['Harsh 1-2 upshift when cold','Gear hunting during city driving','Hesitation on downshift during passing'],
    affectedSystems: ['transmission'], dtcCodes: [], engines: [],
    estimatedCostLow: 100, estimatedCostHigh: 500,
    citations: [{ source: 'Genesis Owners Forum', url: 'https://www.genesisowners.com', title: 'G70 Transmission Shift Discussion' }]
  },
  {
    id: 'genesis-g70-infotainment-lag',
    make: 'Genesis', model: 'G70', years: [2019,2020,2021,2022],
    category: 'electrical', title: 'Infotainment System Lag and Crashes',
    description: 'Early G70 models experience infotainment system lag, occasional crashes, and slow boot times. The system can take 15-30 seconds to fully initialize after starting the vehicle, and navigation inputs are sometimes delayed.',
    solution: 'Update to the latest head unit software via the Genesis Connected Services app or dealer visit. The 2022+ models received significant hardware and software improvements. A factory reset can resolve persistent lag issues.',
    severity: 'low', confidence: 'medium',
    symptoms: ['Slow system startup','Navigation lag when inputting destinations','Screen freezing requiring restart','Bluetooth audio stuttering'],
    affectedSystems: ['electrical'], dtcCodes: [], engines: [],
    estimatedCostLow: 0, estimatedCostHigh: 500,
    citations: [{ source: 'Genesis Owners Forum', url: 'https://www.genesisowners.com', title: 'G70 Infotainment Issues' }]
  },
  {
    id: 'genesis-g70-lsd-noise',
    make: 'Genesis', model: 'G70', years: [2019,2020,2021,2022,2023,2024,2025,2026],
    category: 'drivetrain', title: 'Limited-Slip Differential Chatter Noise',
    description: 'G70 models equipped with the mechanical limited-slip differential can produce a chattering or clunking noise during low-speed tight turns, such as parking lot maneuvers. The LSD clutch packs require specific friction modifier in the gear oil to operate smoothly.',
    solution: 'Drain and refill the differential with Hyundai/Genesis-specified gear oil containing the correct friction modifier additive. The differential may need a break-in period after fluid change. This noise is somewhat normal for clutch-type LSDs.',
    severity: 'low', confidence: 'high',
    symptoms: ['Chattering noise during slow tight turns','Clunking from rear end in parking lots','Noise more pronounced on full steering lock'],
    affectedSystems: ['drivetrain'], dtcCodes: [], engines: [],
    estimatedCostLow: 100, estimatedCostHigh: 300,
    citations: [{ source: 'Genesis Owners Forum', url: 'https://www.genesisowners.com', title: 'G70 LSD Noise Fix' }]
  },
  // G80 (4)
  {
    id: 'genesis-g80-air-suspension-compressor',
    make: 'Genesis', model: 'G80', years: [2021,2022,2023,2024,2025,2026],
    category: 'suspension', title: 'Air Suspension Compressor Failure',
    description: 'The G80 with optional air suspension can experience premature compressor failure, especially in cold climates. The compressor works overtime to compensate for slow air leaks in the struts, eventually overheating and failing.',
    solution: 'Replace the air suspension compressor and inspect all air lines and struts for leaks. Address any leaking struts simultaneously. Some owners convert to conventional springs, though this removes the ride height adjustment feature.',
    severity: 'high', confidence: 'medium',
    symptoms: ['Vehicle sitting low on one or more corners','Compressor running excessively','Suspension warning on instrument cluster','Harsh ride quality'],
    affectedSystems: ['suspension'], dtcCodes: [], engines: [],
    estimatedCostLow: 800, estimatedCostHigh: 2500,
    citations: [{ source: 'Genesis Owners Forum', url: 'https://www.genesisowners.com', title: 'G80 Air Suspension Compressor Thread' }]
  },
  {
    id: 'genesis-g80-infotainment-glitches',
    make: 'Genesis', model: 'G80', years: [2017,2018,2019,2020,2021,2022,2023,2024,2025,2026],
    category: 'electrical', title: 'Infotainment System Software Glitches',
    description: 'The G80 infotainment system experiences intermittent software glitches including screen blackouts, navigation errors, and unresponsive touch inputs. OTA updates have introduced new bugs while fixing existing ones on several occasions.',
    solution: 'Keep the system updated to the latest firmware. Perform a factory reset after major OTA updates. Visit the dealer for a head unit reflash if persistent issues occur. The rotary controller can be used as a backup input method.',
    severity: 'low', confidence: 'medium',
    symptoms: ['Screen going black momentarily','Navigation giving incorrect directions','Touch inputs not registering','System rebooting while driving'],
    affectedSystems: ['electrical'], dtcCodes: [], engines: [],
    estimatedCostLow: 0, estimatedCostHigh: 500,
    citations: [{ source: 'Genesis Owners Forum', url: 'https://www.genesisowners.com', title: 'G80 Infotainment Bugs' }]
  },
  {
    id: 'genesis-g80-35t-turbo-wastegate',
    make: 'Genesis', model: 'G80', years: [2017,2018,2019,2020],
    category: 'engine', title: '3.3T Turbo Wastegate Rattle',
    description: 'The 3.3-liter twin-turbo V6 in earlier G80 Sport models can develop a wastegate rattle at idle and low RPM. The wastegate actuator arm and flap develop play over time, creating a metallic ticking or rattling sound most noticeable at operating temperature.',
    solution: 'Have the wastegate actuator preload adjusted at the dealer. In some cases, the wastegate actuator assembly needs replacement. Updated actuators with tighter tolerances are available for affected engines.',
    severity: 'low', confidence: 'medium',
    symptoms: ['Metallic ticking at idle','Rattle at low RPM that disappears under load','Noise from turbocharger area'],
    affectedSystems: ['engine'], dtcCodes: [], engines: ['3.3L Twin-Turbo V6'],
    estimatedCostLow: 200, estimatedCostHigh: 1000,
    citations: [{ source: 'Genesis G80 Forum', url: 'https://www.genesisg80.com', title: 'Wastegate Rattle Fix' }]
  },
  {
    id: 'genesis-g80-electrified-software',
    make: 'Genesis', model: 'G80', years: [2022,2023,2024,2025,2026],
    category: 'electrical', title: 'Electrified G80 Software and Charging Issues',
    description: 'The Electrified G80 experiences occasional software-related issues including incorrect range estimates, failed DC fast charging sessions, and 12V battery management faults. The EV-specific software is still maturing compared to the ICE platform.',
    solution: 'Update to the latest EV software through the dealer or OTA. Reset the BMS by disconnecting the 12V battery for 30 minutes. Report failed charging sessions to Genesis Connected Services for remote diagnostics.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Range estimate fluctuating wildly','DC fast charging stopping prematurely','12V battery warning messages','Preconditioning not activating'],
    affectedSystems: ['electrical','ev_battery'], dtcCodes: [], engines: ['Electric'],
    estimatedCostLow: 0, estimatedCostHigh: 500,
    citations: [{ source: 'Genesis EV Forum', url: 'https://www.genesisowners.com', title: 'eG80 Software Issues Thread' }]
  },
  // G90 (3)
  {
    id: 'genesis-g90-air-suspension-failure',
    make: 'Genesis', model: 'G90', years: [2017,2018,2019,2020,2021,2022,2023,2024,2025,2026],
    category: 'suspension', title: 'Air Suspension Strut and Compressor Failure',
    description: 'The G90 air suspension system is prone to strut leaks and compressor failure, particularly after 60,000 miles. The rubber air bladders in the struts develop cracks, causing the vehicle to sag overnight and the compressor to overwork.',
    solution: 'Replace leaking air struts and the compressor as a set. Inspect all air lines for cracks and deterioration. The system should be calibrated after component replacement. Consider an extended warranty to cover these expensive repairs.',
    severity: 'high', confidence: 'high',
    symptoms: ['Vehicle sagging on one or more corners after sitting','Suspension warning light','Compressor noise running continuously','Uneven ride height'],
    affectedSystems: ['suspension'], dtcCodes: [], engines: [],
    estimatedCostLow: 1500, estimatedCostHigh: 5000,
    citations: [{ source: 'Genesis Owners Forum', url: 'https://www.genesisowners.com', title: 'G90 Air Suspension Failures' }]
  },
  {
    id: 'genesis-g90-rear-seat-entertainment',
    make: 'Genesis', model: 'G90', years: [2020,2021,2022,2023,2024,2025,2026],
    category: 'electrical', title: 'Rear Seat Entertainment System Malfunctions',
    description: 'The G90 rear seat entertainment system screens experience intermittent blackouts, HDMI input failures, and Wi-Fi connectivity drops. The tablet-style screens in the rear seat headrests are sensitive to vibration-induced connector loosening.',
    solution: 'Check and reseat the HDMI and power connectors behind the headrest screens. Update the rear entertainment firmware at the dealer. A system reset by disconnecting the vehicle battery can clear persistent glitches.',
    severity: 'low', confidence: 'medium',
    symptoms: ['Rear screens going black during use','HDMI input not detected','Wi-Fi connectivity drops in rear','Screen flickering over bumps'],
    affectedSystems: ['electrical'], dtcCodes: [], engines: [],
    estimatedCostLow: 0, estimatedCostHigh: 800,
    citations: [{ source: 'Genesis Owners Forum', url: 'https://www.genesisowners.com', title: 'G90 Rear Entertainment Issues' }]
  },
  {
    id: 'genesis-g90-elsd-noise',
    make: 'Genesis', model: 'G90', years: [2017,2018,2019,2020,2021,2022,2023,2024,2025,2026],
    category: 'drivetrain', title: 'Electronic Limited-Slip Differential Noise',
    description: 'AWD G90 models can produce a whining or humming noise from the rear differential, particularly during low-speed turns and AWD engagement transitions. The e-LSD clutch pack engagement can produce audible noise during operation.',
    solution: 'Change the rear differential fluid using Hyundai/Genesis-approved gear oil with LSD additive. If noise persists, the e-LSD clutch pack may need inspection. The noise is often more pronounced in cold weather.',
    severity: 'low', confidence: 'medium',
    symptoms: ['Whining from rear during turns','Humming noise at low speeds','Noise during AWD engagement transitions'],
    affectedSystems: ['drivetrain'], dtcCodes: [], engines: [],
    estimatedCostLow: 100, estimatedCostHigh: 600,
    citations: [{ source: 'Genesis Owners Forum', url: 'https://www.genesisowners.com', title: 'G90 Rear Diff Noise' }]
  },
  // GV70 (4)
  {
    id: 'genesis-gv70-turbo-coolant-line',
    make: 'Genesis', model: 'GV70', years: [2022,2023,2024,2025,2026],
    category: 'engine', title: 'Turbo Coolant Line Leak (2.5T)',
    description: 'The 2.5-liter turbocharged engine in the GV70 can develop coolant leaks from the turbocharger coolant supply lines. The connections at the turbo water jacket weep coolant, especially after repeated heat cycles.',
    solution: 'Replace the turbo coolant line O-rings and clamps. Inspect the turbo water jacket housing for cracks. Use OEM coolant and ensure the system is properly bled after repair to prevent air pockets.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Coolant level slowly dropping','Sweet coolant smell after driving','Small coolant weep near turbo','Low coolant warning light'],
    affectedSystems: ['engine','cooling'], dtcCodes: [], engines: ['2.5L Turbo I4'],
    estimatedCostLow: 200, estimatedCostHigh: 700,
    citations: [{ source: 'Genesis Owners Forum', url: 'https://www.genesisowners.com', title: 'GV70 Turbo Coolant Leak' }]
  },
  {
    id: 'genesis-gv70-infotainment-freeze',
    make: 'Genesis', model: 'GV70', years: [2022,2023,2024,2025,2026],
    category: 'electrical', title: 'Infotainment Screen Freeze and Reboot',
    description: 'The GV70 infotainment system occasionally freezes mid-use, requiring the vehicle to be restarted to recover. The screen may go black or become unresponsive to touch and rotary controller inputs during navigation or media playback.',
    solution: 'Hold the power/volume knob for 10 seconds to force a soft reset. Update to the latest software via OTA or dealer visit. Clear the navigation cache and reduce stored Bluetooth device pairings.',
    severity: 'low', confidence: 'medium',
    symptoms: ['Screen freezing during use','System rebooting while driving','Touch and rotary inputs unresponsive','CarPlay disconnecting'],
    affectedSystems: ['electrical'], dtcCodes: [], engines: [],
    estimatedCostLow: 0, estimatedCostHigh: 300,
    citations: [{ source: 'Genesis Owners Forum', url: 'https://www.genesisowners.com', title: 'GV70 Screen Freeze Reports' }]
  },
  {
    id: 'genesis-gv70-electrified-range',
    make: 'Genesis', model: 'GV70', years: [2023,2024,2025,2026],
    category: 'electrical', title: 'Electrified GV70 Range Inconsistency',
    description: 'The Electrified GV70 shows significant variation between estimated and actual driving range, particularly in cold weather. The range estimate algorithm does not adequately account for cabin heating, terrain, and highway speeds, leading to range anxiety.',
    solution: 'Precondition the battery while plugged in before cold weather departures. Use ECO mode for maximum range. The BMS learns driving patterns over time and range estimates improve after 2,000-3,000 miles of ownership.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Range estimate dropping faster than miles driven','Significant range loss in cold weather','Inconsistent range between identical trips'],
    affectedSystems: ['ev_battery','electrical'], dtcCodes: [], engines: ['Electric'],
    estimatedCostLow: 0, estimatedCostHigh: 0,
    citations: [{ source: 'Genesis EV Forum', url: 'https://www.genesisowners.com', title: 'eGV70 Range Discussion' }]
  },
  {
    id: 'genesis-gv70-brake-noise',
    make: 'Genesis', model: 'GV70', years: [2022,2023,2024,2025,2026],
    category: 'brakes', title: 'Front Brake Squeal and Dust',
    description: 'The GV70 front brakes produce excessive brake dust and a high-pitched squeal during light braking, especially in the morning or after the vehicle has been sitting. The aggressive brake pad compound prioritizes stopping power over noise and cleanliness.',
    solution: 'Replace the front brake pads with a low-dust ceramic compound. Clean and lubricate the brake caliper slide pins and pad contact points. Apply brake pad shim adhesive if shims are loose or missing.',
    severity: 'low', confidence: 'high',
    symptoms: ['High-pitched squeal during light braking','Excessive black brake dust on front wheels','Grinding noise after car sits overnight'],
    affectedSystems: ['brakes'], dtcCodes: [], engines: [],
    estimatedCostLow: 150, estimatedCostHigh: 400,
    citations: [{ source: 'Genesis Owners Forum', url: 'https://www.genesisowners.com', title: 'GV70 Brake Squeal Fix' }]
  },
  // GV80 (4)
  {
    id: 'genesis-gv80-transmission-shudder',
    make: 'Genesis', model: 'GV80', years: [2021,2022,2023,2024,2025,2026],
    category: 'transmission', title: '8-Speed Transmission Shudder',
    description: 'The GV80 8-speed automatic transmission develops a shudder during low-speed acceleration and torque converter lockup. The torque converter clutch develops uneven friction material wear, creating a vibration felt through the drivetrain.',
    solution: 'Perform a transmission fluid flush with Genesis-specified ATF. A TCM software update can improve torque converter lockup calibration. In persistent cases, the torque converter may need replacement under warranty.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Vibration during gentle acceleration at 30-50 mph','Shudder during torque converter lockup','Transmission hesitation'],
    affectedSystems: ['transmission'], dtcCodes: [], engines: [],
    estimatedCostLow: 200, estimatedCostHigh: 3000,
    citations: [{ source: 'Genesis Owners Forum', url: 'https://www.genesisowners.com', title: 'GV80 Transmission Shudder Reports' }]
  },
  {
    id: 'genesis-gv80-air-suspension-issues',
    make: 'Genesis', model: 'GV80', years: [2021,2022,2023,2024,2025,2026],
    category: 'suspension', title: 'Air Suspension Calibration and Leak Issues',
    description: 'GV80 models with air suspension experience ride height calibration drift and slow air leaks from the strut assemblies. The suspension may not return to the correct ride height after being lowered for entry/exit mode.',
    solution: 'Have the dealer perform an air suspension calibration reset. Inspect the air struts for leaks using soapy water. Replace any leaking struts promptly to protect the compressor from overwork.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Uneven ride height after sitting','Entry/exit mode not returning to normal height','Suspension warning light','Compressor cycling frequently'],
    affectedSystems: ['suspension'], dtcCodes: [], engines: [],
    estimatedCostLow: 300, estimatedCostHigh: 2500,
    citations: [{ source: 'Genesis Owners Forum', url: 'https://www.genesisowners.com', title: 'GV80 Air Suspension Thread' }]
  },
  {
    id: 'genesis-gv80-infotainment-issues',
    make: 'Genesis', model: 'GV80', years: [2021,2022,2023,2024,2025,2026],
    category: 'electrical', title: 'Infotainment and Connected Services Issues',
    description: 'The GV80 infotainment system experiences periodic software glitches, including the 3D navigation display freezing, wireless phone charging overheating phones, and Genesis Connected Services failing to communicate with the vehicle.',
    solution: 'Update to the latest infotainment and Connected Services software. Disable wireless charging if phone overheating occurs and use a wired connection. Factory reset the head unit for persistent glitches.',
    severity: 'low', confidence: 'medium',
    symptoms: ['3D navigation display freezing','Phone overheating on wireless charger','Connected Services app not connecting','Split screen mode glitching'],
    affectedSystems: ['electrical'], dtcCodes: [], engines: [],
    estimatedCostLow: 0, estimatedCostHigh: 500,
    citations: [{ source: 'Genesis Owners Forum', url: 'https://www.genesisowners.com', title: 'GV80 Infotainment Bugs' }]
  },
  {
    id: 'genesis-gv80-diesel-nox',
    make: 'Genesis', model: 'GV80', years: [2021,2022,2023],
    category: 'engine', title: 'Diesel NOx System Issues (International Markets)',
    description: 'Diesel GV80 models experience NOx aftertreatment system issues, including SCR catalyst efficiency codes and DEF quality warnings. The NOx sensor can give false readings, triggering regeneration cycles and reduced power modes.',
    solution: 'Replace the NOx sensor and clear adaptation values. Use only manufacturer-approved DEF fluid. Update the ECU calibration for improved NOx system management. Avoid short trips that prevent the DPF from completing regeneration.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['DEF quality warning message','Reduced engine power mode','Frequent DPF regeneration cycles','Check engine light with NOx codes'],
    affectedSystems: ['engine','exhaust'], dtcCodes: ['P20EE','P229F'], engines: ['3.0L Diesel I6'],
    estimatedCostLow: 400, estimatedCostHigh: 2000,
    citations: [{ source: 'Genesis Owners Forum', url: 'https://www.genesisowners.com', title: 'GV80 Diesel NOx Issues' }]
  },
  // GV60 (3)
  {
    id: 'genesis-gv60-12v-battery-drain',
    make: 'Genesis', model: 'GV60', years: [2023,2024,2025,2026],
    category: 'electrical', title: '12V Battery Drain When Parked',
    description: 'The GV60 can experience excessive 12V auxiliary battery drain when parked for extended periods. Connected services modules, security systems, and over-the-air update checks continue drawing power, depleting the small 12V battery within 5-7 days of inactivity.',
    solution: 'Keep the vehicle plugged in when parked for more than 3 days to allow the HV system to maintain the 12V battery. Update to the latest software that includes improved power management. A 12V battery maintainer can be used as a backup.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Vehicle will not start after sitting several days','Key fob unable to unlock doors','Multiple warning messages after jump start','Connected services disconnecting'],
    affectedSystems: ['electrical'], dtcCodes: [], engines: ['Electric'],
    estimatedCostLow: 0, estimatedCostHigh: 400,
    citations: [{ source: 'Genesis EV Forum', url: 'https://www.genesisowners.com', title: 'GV60 12V Battery Drain Reports' }]
  },
  {
    id: 'genesis-gv60-ota-software-issues',
    make: 'Genesis', model: 'GV60', years: [2023,2024,2025,2026],
    category: 'electrical', title: 'OTA Software Update Failures',
    description: 'The GV60 OTA (over-the-air) update process occasionally fails mid-installation, leaving the vehicle in a partially updated state. Failed updates can cause infotainment malfunctions, ADAS feature deactivation, or charging management errors.',
    solution: 'Ensure the vehicle is plugged in with a strong cellular signal during OTA updates. If an update fails, visit the dealer for a complete software reflash. Do not interrupt the update process by starting the vehicle.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Update progress bar stuck','Infotainment not booting after update','ADAS features showing as unavailable','Charging schedule not functioning after update'],
    affectedSystems: ['electrical'], dtcCodes: [], engines: ['Electric'],
    estimatedCostLow: 0, estimatedCostHigh: 300,
    citations: [{ source: 'Genesis EV Forum', url: 'https://www.genesisowners.com', title: 'GV60 OTA Update Problems' }]
  },
  {
    id: 'genesis-gv60-range-inconsistency',
    make: 'Genesis', model: 'GV60', years: [2023,2024,2025,2026],
    category: 'electrical', title: 'Range Estimate Inconsistency',
    description: 'The GV60 range estimation algorithm shows significant variability, with actual range often falling 15-25% short of the displayed estimate in cold weather or at sustained highway speeds above 70 mph. The system does not adequately factor in ambient temperature and driving speed.',
    solution: 'Precondition the battery and cabin while plugged in before departure. Use ECO mode and limit climate control usage in cold weather for maximum range. The BMS improves range predictions after learning driving patterns over several thousand miles.',
    severity: 'low', confidence: 'high',
    symptoms: ['Range dropping faster than expected','Cold weather range loss exceeding 25%','Highway range significantly less than city range'],
    affectedSystems: ['ev_battery'], dtcCodes: [], engines: ['Electric'],
    estimatedCostLow: 0, estimatedCostHigh: 0,
    citations: [{ source: 'Genesis EV Forum', url: 'https://www.genesisowners.com', title: 'GV60 Range Discussion Thread' }]
  },

  // ═══ MITSUBISHI (25 issues) ═══
  // Outlander (5)
  {
    id: 'mitsubishi-outlander-cvt-failure',
    make: 'Mitsubishi', model: 'Outlander', years: [2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020],
    category: 'transmission', title: 'CVT Transmission Premature Failure',
    description: 'The Jatco CVT in the Outlander is prone to premature failure, particularly under heavy loads and in hot climates. The CVT belt and pulleys wear prematurely, leading to slipping, shuddering, and eventual complete transmission failure, often between 60,000 and 100,000 miles.',
    solution: 'Change CVT fluid every 30,000 miles using Mitsubishi DiaQueen CVTF-J4. Avoid aggressive driving and towing near maximum capacity. If the CVT fails, replacement with a remanufactured unit is more cost-effective than rebuild.',
    severity: 'critical', confidence: 'high',
    symptoms: ['Transmission shuddering during acceleration','Loss of power at highway speeds','Whining noise increasing with speed','CVT overheating warning'],
    affectedSystems: ['transmission'], dtcCodes: ['P0868','P0700'], engines: [],
    estimatedCostLow: 3000, estimatedCostHigh: 7000,
    citations: [{ source: 'Mitsubishi Forums', url: 'https://www.mitsubishiforum.com', title: 'Outlander CVT Failure Reports' }]
  },
  {
    id: 'mitsubishi-outlander-phev-battery',
    make: 'Mitsubishi', model: 'Outlander', years: [2018,2019,2020,2021,2022,2023,2024,2025,2026],
    category: 'electrical', title: 'PHEV Battery Degradation and Charging Issues',
    description: 'The Outlander PHEV can experience accelerated battery capacity degradation and intermittent charging failures. The battery management system occasionally refuses to initiate charging or terminates sessions prematurely, particularly in extreme temperatures.',
    solution: 'Avoid frequent DC fast charging to preserve battery health. Keep the battery between 20-80% state of charge for daily use. Update the BMS software at the dealer. Have the 12V auxiliary battery tested, as a weak 12V battery can cause charging failures.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Electric range decreasing over time','Charging session failing to start','Battery temperature warning','Reduced EV mode availability in cold weather'],
    affectedSystems: ['ev_battery','electrical'], dtcCodes: [], engines: ['2.4L PHEV'],
    estimatedCostLow: 0, estimatedCostHigh: 5000,
    citations: [{ source: 'Outlander PHEV Forum', url: 'https://www.outlanderphevforum.com', title: 'Battery Degradation Reports' }]
  },
  {
    id: 'mitsubishi-outlander-ac-compressor',
    make: 'Mitsubishi', model: 'Outlander', years: [2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020],
    category: 'hvac', title: 'AC Compressor Failure',
    description: 'The AC compressor in the Outlander is prone to premature failure, with the internal clutch bearing seizing or the compressor developing internal leaks. Failure typically occurs between 60,000 and 90,000 miles, leaving the vehicle without air conditioning.',
    solution: 'Replace the AC compressor, receiver/drier, and expansion valve as a complete system. Flush the AC lines to remove debris from the failed compressor. Use the correct PAG oil specification for the replacement unit.',
    severity: 'medium', confidence: 'high',
    symptoms: ['AC blowing warm air','Clicking or grinding from compressor','Intermittent cooling','Refrigerant leak detected'],
    affectedSystems: ['hvac'], dtcCodes: [], engines: [],
    estimatedCostLow: 600, estimatedCostHigh: 1500,
    citations: [{ source: 'Mitsubishi Forums', url: 'https://www.mitsubishiforum.com', title: 'Outlander AC Compressor Issues' }]
  },
  {
    id: 'mitsubishi-outlander-suspension-noise',
    make: 'Mitsubishi', model: 'Outlander', years: [2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024,2025,2026],
    category: 'suspension', title: 'Front Suspension Clunking and Noise',
    description: 'The Outlander develops front suspension clunking and knocking noises over bumps and rough roads. Worn front stabilizer bar end links and strut mount bearings are the primary culprits, with noise appearing as early as 30,000 miles.',
    solution: 'Replace the front stabilizer bar end links and strut mounts. Inspect the lower control arm bushings while the suspension is apart. OEM replacement parts are recommended as some aftermarket components have fitment issues.',
    severity: 'low', confidence: 'high',
    symptoms: ['Clunking over bumps','Knocking noise during turns','Rattling from front suspension','Noise worse on rough roads'],
    affectedSystems: ['suspension'], dtcCodes: [], engines: [],
    estimatedCostLow: 200, estimatedCostHigh: 600,
    citations: [{ source: 'Mitsubishi Forums', url: 'https://www.mitsubishiforum.com', title: 'Outlander Suspension Noise Fix' }]
  },
  {
    id: 'mitsubishi-outlander-infotainment',
    make: 'Mitsubishi', model: 'Outlander', years: [2022,2023,2024,2025,2026],
    category: 'electrical', title: 'Infotainment System Freezing and Connectivity Issues',
    description: 'The new-generation Outlander infotainment system experiences screen freezing, wireless Android Auto/CarPlay disconnections, and slow response to touch inputs. The system occasionally requires a vehicle restart to recover from a frozen state.',
    solution: 'Update to the latest firmware via USB or dealer. Perform a factory reset to clear corrupted data. Use wired connections for CarPlay/Android Auto if wireless connections are unreliable.',
    severity: 'low', confidence: 'medium',
    symptoms: ['Touchscreen freezing','Wireless phone projection disconnecting','Slow menu navigation','Backup camera delayed display'],
    affectedSystems: ['electrical'], dtcCodes: [], engines: [],
    estimatedCostLow: 0, estimatedCostHigh: 500,
    citations: [{ source: 'Mitsubishi Forums', url: 'https://www.mitsubishiforum.com', title: 'Outlander Infotainment Bugs' }]
  },
  // Eclipse Cross (3)
  {
    id: 'mitsubishi-eclipse-cross-cvt-shudder',
    make: 'Mitsubishi', model: 'Eclipse Cross', years: [2018,2019,2020,2021,2022,2023,2024,2025,2026],
    category: 'transmission', title: 'CVT Shudder During Acceleration',
    description: 'The Eclipse Cross CVT exhibits a noticeable shudder during light-to-moderate acceleration from a stop. The CVT belt slippage and inconsistent clamping force create a vibration felt through the vehicle, particularly noticeable in the first few minutes of driving.',
    solution: 'Drain and refill the CVT with Mitsubishi DiaQueen CVTF-J4 fluid. A CVT recalibration at the dealer can improve the shift programming. Avoid aggressive launches from a stop to reduce CVT wear.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Vibration during acceleration from stop','Shudder at low speeds','RPM fluctuation during steady cruise'],
    affectedSystems: ['transmission'], dtcCodes: [], engines: [],
    estimatedCostLow: 200, estimatedCostHigh: 3500,
    citations: [{ source: 'Mitsubishi Forums', url: 'https://www.mitsubishiforum.com', title: 'Eclipse Cross CVT Issues' }]
  },
  {
    id: 'mitsubishi-eclipse-cross-phev-charging',
    make: 'Mitsubishi', model: 'Eclipse Cross', years: [2022,2023,2024,2025,2026],
    category: 'electrical', title: 'PHEV Charging System Intermittent Failures',
    description: 'The Eclipse Cross PHEV experiences intermittent Level 2 charging failures where the charger initiates but disconnects within minutes. Communication errors between the onboard charger and EVSE, as well as ground fault detection sensitivity, cause failed sessions.',
    solution: 'Try different charging stations to rule out EVSE compatibility issues. Update the onboard charger firmware at the dealer. Reset the charging system by disconnecting the 12V battery for 15 minutes. Use the included Level 1 charger as a reliable backup.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Level 2 charging stopping within minutes','Charging indicator blinking error pattern','Vehicle not recognizing charger connection'],
    affectedSystems: ['electrical','ev_battery'], dtcCodes: [], engines: ['2.4L PHEV'],
    estimatedCostLow: 0, estimatedCostHigh: 800,
    citations: [{ source: 'Eclipse Cross Forum', url: 'https://www.eclipsecrossforum.com', title: 'PHEV Charging Issues Thread' }]
  },
  {
    id: 'mitsubishi-eclipse-cross-infotainment',
    make: 'Mitsubishi', model: 'Eclipse Cross', years: [2018,2019,2020,2021,2022,2023,2024,2025,2026],
    category: 'electrical', title: 'Infotainment Touchpad and Screen Issues',
    description: 'The Eclipse Cross infotainment system, particularly the touchpad controller on pre-facelift models, is difficult to use and prone to erratic cursor behavior. Post-facelift models with the touchscreen still experience occasional freezing and Bluetooth disconnections.',
    solution: 'Update the infotainment firmware to the latest version. Clean the touchpad surface with a microfiber cloth for improved responsiveness. Consider a factory reset if the system becomes persistently slow.',
    severity: 'low', confidence: 'high',
    symptoms: ['Touchpad cursor jumping erratically','Screen freezing during use','Bluetooth dropping during calls','Slow navigation response'],
    affectedSystems: ['electrical'], dtcCodes: [], engines: [],
    estimatedCostLow: 0, estimatedCostHigh: 300,
    citations: [{ source: 'Eclipse Cross Forum', url: 'https://www.eclipsecrossforum.com', title: 'Infotainment Frustrations Thread' }]
  },
  // Outlander Sport (3)
  {
    id: 'mitsubishi-outlander-sport-cvt-judder',
    make: 'Mitsubishi', model: 'Outlander Sport', years: [2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024,2025,2026],
    category: 'transmission', title: 'CVT Judder and Hesitation',
    description: 'The Outlander Sport CVT develops a judder during low-speed acceleration and deceleration. The transmission hesitates when pulling away from stops, and the simulated shift points feel rough and inconsistent.',
    solution: 'Replace the CVT fluid with Mitsubishi DiaQueen CVTF-J4 every 30,000 miles. A TCM reprogram may smooth out the shift calibration. Avoid towing with the CVT-equipped models.',
    severity: 'medium', confidence: 'high',
    symptoms: ['Judder during light acceleration','Hesitation from stop','Rough simulated shift points','CVT whining noise'],
    affectedSystems: ['transmission'], dtcCodes: [], engines: [],
    estimatedCostLow: 200, estimatedCostHigh: 4000,
    citations: [{ source: 'Mitsubishi Forums', url: 'https://www.mitsubishiforum.com', title: 'Outlander Sport CVT Problems' }]
  },
  {
    id: 'mitsubishi-outlander-sport-ac-compressor',
    make: 'Mitsubishi', model: 'Outlander Sport', years: [2011,2012,2013,2014,2015,2016,2017,2018,2019,2020],
    category: 'hvac', title: 'AC Compressor Premature Failure',
    description: 'The AC compressor in the Outlander Sport frequently fails between 50,000 and 80,000 miles. The compressor clutch bearing seizes or the internal reed valves break, contaminating the AC system with metal debris.',
    solution: 'Replace the AC compressor, receiver/drier, and expansion valve. Flush the entire system to remove metal particles. Install an inline filter on the liquid line to protect the new compressor from residual debris.',
    severity: 'medium', confidence: 'high',
    symptoms: ['AC not cooling','Loud clicking from compressor','Intermittent AC function','Refrigerant leak'],
    affectedSystems: ['hvac'], dtcCodes: [], engines: [],
    estimatedCostLow: 600, estimatedCostHigh: 1400,
    citations: [{ source: 'Mitsubishi Forums', url: 'https://www.mitsubishiforum.com', title: 'Outlander Sport AC Failure Reports' }]
  },
  {
    id: 'mitsubishi-outlander-sport-rust-corrosion',
    make: 'Mitsubishi', model: 'Outlander Sport', years: [2011,2012,2013,2014,2015,2016,2017,2018,2019,2020],
    category: 'body', title: 'Underbody and Subframe Rust/Corrosion',
    description: 'The Outlander Sport is susceptible to accelerated underbody rust and corrosion, particularly in salt-belt states. The rear subframe, fuel tank straps, and brake lines are the most affected areas, with rust perforation occurring in as little as 5-7 years.',
    solution: 'Apply rust-proofing undercoating annually in salt-belt areas. Inspect the rear subframe for structural integrity during routine maintenance. Replace corroded brake lines with stainless steel or coated replacements.',
    severity: 'high', confidence: 'high',
    symptoms: ['Visible rust on underbody components','Brake line corrosion','Rear subframe structural weakness','Fuel tank strap deterioration'],
    affectedSystems: ['body','brakes'], dtcCodes: [], engines: [],
    estimatedCostLow: 200, estimatedCostHigh: 3000,
    citations: [{ source: 'NHTSA', url: 'https://www.nhtsa.gov', title: 'Outlander Sport Corrosion Complaints' }]
  },
  // Mirage (2)
  {
    id: 'mitsubishi-mirage-cvt-reliability',
    make: 'Mitsubishi', model: 'Mirage', years: [2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024,2025,2026],
    category: 'transmission', title: 'CVT Reliability and Longevity Concerns',
    description: 'The Jatco CVT in the Mirage exhibits premature wear and reduced longevity, with some units failing as early as 60,000 miles. The small displacement engine works hard to move the vehicle, putting additional stress on the CVT belt and pulleys.',
    solution: 'Change CVT fluid every 25,000-30,000 miles using Mitsubishi-specified fluid. Avoid full-throttle launches and sustained high-RPM driving. If the CVT begins slipping, replacement is more economical than rebuilding.',
    severity: 'high', confidence: 'medium',
    symptoms: ['CVT slipping under acceleration','Whining noise increasing with speed','Hesitation from stop','Shudder at highway speeds'],
    affectedSystems: ['transmission'], dtcCodes: [], engines: ['1.2L 3-Cylinder'],
    estimatedCostLow: 2500, estimatedCostHigh: 5000,
    citations: [{ source: 'Mirage Forum', url: 'https://www.mirageforum.com', title: 'CVT Longevity Discussion' }]
  },
  {
    id: 'mitsubishi-mirage-ac-evaporator-leak',
    make: 'Mitsubishi', model: 'Mirage', years: [2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024,2025,2026],
    category: 'hvac', title: 'AC Evaporator Core Leak',
    description: 'The Mirage AC evaporator core develops pinhole leaks from internal corrosion, causing gradual refrigerant loss and reduced cooling performance. The evaporator is located behind the dashboard, making replacement labor-intensive and expensive relative to the vehicle value.',
    solution: 'Have the AC system leak-tested with UV dye to confirm evaporator failure. Replace the evaporator core, which requires dashboard removal. Add a corrosion inhibitor to the new system to extend evaporator life.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['AC cooling gradually weakening','Refrigerant needing annual recharging','Musty smell from vents','Condensation pooling inside vehicle'],
    affectedSystems: ['hvac'], dtcCodes: [], engines: [],
    estimatedCostLow: 600, estimatedCostHigh: 1500,
    citations: [{ source: 'Mirage Forum', url: 'https://www.mirageforum.com', title: 'AC Evaporator Leak Reports' }]
  },
  // Lancer (4)
  {
    id: 'mitsubishi-lancer-evo-transfer-case',
    make: 'Mitsubishi', model: 'Lancer', years: [2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015],
    category: 'drivetrain', title: 'Evolution Transfer Case and ACD Failure',
    description: 'The Lancer Evolution Active Center Differential (ACD) transfer case develops internal failures, particularly under hard launching and track use. The ACD clutch pack wears prematurely, and the transfer case bearings can fail, causing grinding noises and loss of AWD function.',
    solution: 'Change the transfer case fluid every 15,000 miles with Mitsubishi DiaQueen fluid. Avoid repeated hard launches from a standstill. Replace the ACD clutch pack and bearings when noise or AWD malfunction is detected.',
    severity: 'high', confidence: 'high',
    symptoms: ['Grinding noise from center of vehicle','AWD warning light','Loss of center differential lock function','Vibration during acceleration'],
    affectedSystems: ['drivetrain'], dtcCodes: [], engines: ['2.0L 4B11T Turbo I4'],
    estimatedCostLow: 1500, estimatedCostHigh: 4000,
    citations: [{ source: 'EvoM Forum', url: 'https://www.evolutionm.net', title: 'ACD Transfer Case Rebuild Guide' }]
  },
  {
    id: 'mitsubishi-lancer-cvt-failure',
    make: 'Mitsubishi', model: 'Lancer', years: [2008,2009,2010,2011,2012,2013,2014,2015,2016,2017],
    category: 'transmission', title: 'CVT Transmission Failure (Non-Evo)',
    description: 'Non-Evolution Lancer models with the CVT experience premature transmission failure, with the CVT belt and pulleys wearing out between 80,000 and 120,000 miles. The transmission develops slipping, shuddering, and eventually complete failure.',
    solution: 'Regular CVT fluid changes every 30,000 miles can extend transmission life. When the CVT fails, a remanufactured unit from a reputable rebuilder is more cost-effective than a new Mitsubishi unit.',
    severity: 'high', confidence: 'high',
    symptoms: ['Transmission slipping','Shudder during acceleration','Whining noise from transmission','Loss of drive at highway speeds'],
    affectedSystems: ['transmission'], dtcCodes: ['P0700','P0868'], engines: ['2.0L 4B11 I4','2.4L 4B12 I4'],
    estimatedCostLow: 2500, estimatedCostHigh: 5500,
    citations: [{ source: 'Lancer Forum', url: 'https://www.lancerforum.com', title: 'CVT Failure Thread' }]
  },
  {
    id: 'mitsubishi-lancer-timing-chain',
    make: 'Mitsubishi', model: 'Lancer', years: [2008,2009,2010,2011,2012,2013,2014,2015,2016,2017],
    category: 'engine', title: '4B11 Timing Chain Stretch',
    description: 'The 4B11 engine timing chain stretches over time, particularly when oil changes are neglected. Chain stretch leads to retarded cam timing, rough idle, and potential engine damage if the chain jumps a tooth on the sprockets.',
    solution: 'Replace the timing chain, tensioner, and guides as a set. Use the updated Mitsubishi timing chain kit with the improved tensioner. Maintain strict 5,000-mile oil change intervals to minimize chain wear.',
    severity: 'high', confidence: 'medium',
    symptoms: ['Rattling noise on cold start','Check engine light for cam timing','Rough idle','Reduced power and fuel economy'],
    affectedSystems: ['engine'], dtcCodes: ['P0011','P0016'], engines: ['2.0L 4B11 I4','2.4L 4B12 I4'],
    estimatedCostLow: 800, estimatedCostHigh: 2000,
    citations: [{ source: 'Lancer Forum', url: 'https://www.lancerforum.com', title: '4B11 Timing Chain Replacement' }]
  },
  {
    id: 'mitsubishi-lancer-evo-ayc-pump',
    make: 'Mitsubishi', model: 'Lancer', years: [2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015],
    category: 'drivetrain', title: 'Evolution AYC Rear Differential Pump Failure',
    description: 'The Active Yaw Control (AYC) hydraulic pump on the Lancer Evolution rear differential is a known failure point. The pump motor burns out or the internal gears strip, disabling the active torque vectoring rear differential and triggering warning lights.',
    solution: 'Replace the AYC pump motor assembly. Upgraded aftermarket pump motors with improved bearings are available. Some owners convert to a conventional 1.5-way mechanical LSD to eliminate the AYC system entirely.',
    severity: 'high', confidence: 'high',
    symptoms: ['AYC warning light illuminated','Loss of rear torque vectoring','Clicking from rear differential','Reduced cornering stability'],
    affectedSystems: ['drivetrain'], dtcCodes: [], engines: ['2.0L 4G63T Turbo I4','2.0L 4B11T Turbo I4'],
    estimatedCostLow: 800, estimatedCostHigh: 2500,
    citations: [{ source: 'EvoM Forum', url: 'https://www.evolutionm.net', title: 'AYC Pump Failure and Solutions' }]
  },
  // Eclipse (3)
  {
    id: 'mitsubishi-eclipse-timing-belt-tensioner',
    make: 'Mitsubishi', model: 'Eclipse', years: [2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012],
    category: 'engine', title: 'Timing Belt Tensioner and Water Pump Failure',
    description: 'The Eclipse timing belt tensioner hydraulic damper fails, allowing the timing belt to become loose and potentially jump teeth. The water pump, driven by the timing belt, also develops bearing failure and coolant leaks. These failures are particularly common on the 4G64 and 4G69 engines.',
    solution: 'Replace the timing belt, tensioner, idler pulleys, and water pump as a complete kit every 60,000 miles. Use only OEM or premium aftermarket timing components. Do not reuse the old hydraulic tensioner.',
    severity: 'critical', confidence: 'high',
    symptoms: ['Squealing or chirping from timing cover','Coolant leak from water pump weep hole','Engine misfiring or rough running','Timing belt visibly worn or cracked'],
    affectedSystems: ['engine'], dtcCodes: [], engines: ['2.4L 4G64 I4','2.4L 4G69 I4'],
    estimatedCostLow: 400, estimatedCostHigh: 1200,
    citations: [{ source: 'Club4G Forum', url: 'https://www.club4g.org', title: 'Eclipse Timing Belt Service Guide' }]
  },
  {
    id: 'mitsubishi-eclipse-transmission-failure',
    make: 'Mitsubishi', model: 'Eclipse', years: [2000,2001,2002,2003,2004,2005],
    category: 'transmission', title: 'Automatic Transmission Failure (4-Speed)',
    description: 'The 4-speed automatic transmission in the 3rd generation Eclipse (particularly V6 GT models) is prone to premature failure. The transmission develops harsh shifting, slipping, and eventually fails completely, often due to overheating and worn clutch packs.',
    solution: 'Install an auxiliary transmission cooler to prevent overheating. Change the ATF every 30,000 miles. When the transmission fails, consider a quality remanufactured unit from a Mitsubishi specialist.',
    severity: 'high', confidence: 'high',
    symptoms: ['Harsh or delayed shifts','Transmission slipping in higher gears','Burnt ATF smell','Transmission overheating warning'],
    affectedSystems: ['transmission'], dtcCodes: ['P0700','P0750'], engines: ['3.0L 6G72 V6'],
    estimatedCostLow: 1500, estimatedCostHigh: 4000,
    citations: [{ source: 'Club3G Forum', url: 'https://www.club3g.com', title: 'Eclipse Transmission Problems' }]
  },
  {
    id: 'mitsubishi-eclipse-oil-consumption-v6',
    make: 'Mitsubishi', model: 'Eclipse', years: [2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012],
    category: 'engine', title: 'V6 Engine Oil Consumption',
    description: 'The 3.0L 6G72 and 3.8L 6G75 V6 engines in the Eclipse GT develop excessive oil consumption over time. Worn valve stem seals and piston ring glazing allow oil to enter the combustion chambers, producing blue exhaust smoke and requiring frequent top-offs.',
    solution: 'Replace valve stem seals as a first step. If consumption persists, the piston rings may need replacement. Use high-mileage synthetic oil with seal conditioners. Monitor oil level every 1,000 miles.',
    severity: 'medium', confidence: 'medium',
    symptoms: ['Blue smoke from exhaust','Oil level dropping between changes','Fouled spark plugs','Catalytic converter degradation'],
    affectedSystems: ['engine'], dtcCodes: [], engines: ['3.0L 6G72 V6','3.8L 6G75 V6'],
    estimatedCostLow: 300, estimatedCostHigh: 2500,
    citations: [{ source: 'Club4G Forum', url: 'https://www.club4g.org', title: 'Eclipse V6 Oil Consumption Thread' }]
  },
  // Galant (2)
  {
    id: 'mitsubishi-galant-transmission-failure',
    make: 'Mitsubishi', model: 'Galant', years: [2004,2005,2006,2007,2008,2009,2010,2011,2012],
    category: 'transmission', title: 'Automatic Transmission Failure',
    description: 'The 4-speed automatic transmission in the Galant is known for premature failure, particularly in V6 models. Internal clutch pack wear and valve body issues cause harsh shifting, slipping, and eventual transmission failure between 80,000 and 120,000 miles.',
    solution: 'Change ATF every 30,000 miles and install an auxiliary transmission cooler. When failure occurs, a remanufactured transmission is the most cost-effective solution. Avoid aggressive driving to extend transmission life.',
    severity: 'high', confidence: 'high',
    symptoms: ['Harsh shifting between gears','Transmission slipping under load','Delayed engagement from park','Burnt transmission fluid'],
    affectedSystems: ['transmission'], dtcCodes: ['P0700'], engines: ['3.8L 6G75 V6'],
    estimatedCostLow: 1500, estimatedCostHigh: 4000,
    citations: [{ source: 'Mitsubishi Forums', url: 'https://www.mitsubishiforum.com', title: 'Galant Transmission Problems' }]
  },
  {
    id: 'mitsubishi-galant-ac-compressor',
    make: 'Mitsubishi', model: 'Galant', years: [2004,2005,2006,2007,2008,2009,2010,2011,2012],
    category: 'hvac', title: 'AC Compressor Failure',
    description: 'The Galant AC compressor is prone to premature failure, with the clutch bearing seizing or the compressor developing internal leaks. This is a common issue across multiple Mitsubishi models sharing the same AC platform.',
    solution: 'Replace the compressor, receiver/drier, and expansion valve. Flush the system thoroughly to remove any debris. Use the correct PAG oil specification for the replacement compressor.',
    severity: 'medium', confidence: 'high',
    symptoms: ['AC not cooling','Grinding noise from AC compressor','Intermittent AC operation','Low refrigerant warnings'],
    affectedSystems: ['hvac'], dtcCodes: [], engines: [],
    estimatedCostLow: 500, estimatedCostHigh: 1200,
    citations: [{ source: 'Mitsubishi Forums', url: 'https://www.mitsubishiforum.com', title: 'Galant AC Problems' }]
  },
  // Endeavor (2)
  {
    id: 'mitsubishi-endeavor-transmission-issues',
    make: 'Mitsubishi', model: 'Endeavor', years: [2004,2005,2006,2007,2008,2009,2010,2011],
    category: 'transmission', title: 'Automatic Transmission Harsh Shifting and Failure',
    description: 'The Endeavor 4-speed automatic transmission develops harsh shifting and premature wear, often failing between 100,000 and 130,000 miles. The transmission shares components with the Galant and Eclipse platforms, inheriting their reliability weaknesses.',
    solution: 'Perform ATF changes every 30,000 miles. Install an auxiliary cooler for vehicles used for towing. A quality remanufactured transmission with updated clutch packs is the best repair option.',
    severity: 'high', confidence: 'medium',
    symptoms: ['Hard shifting between 2nd and 3rd gear','Transmission slipping under acceleration','Delayed reverse engagement','Overheating during towing'],
    affectedSystems: ['transmission'], dtcCodes: ['P0700'], engines: ['3.8L 6G75 V6'],
    estimatedCostLow: 1500, estimatedCostHigh: 4000,
    citations: [{ source: 'Mitsubishi Forums', url: 'https://www.mitsubishiforum.com', title: 'Endeavor Transmission Issues Thread' }]
  },
  {
    id: 'mitsubishi-endeavor-ac-compressor',
    make: 'Mitsubishi', model: 'Endeavor', years: [2004,2005,2006,2007,2008,2009,2010,2011],
    category: 'hvac', title: 'AC Compressor Premature Failure',
    description: 'The Endeavor shares the same AC compressor platform as other Mitsubishi models of the era, and it is equally prone to premature failure. The compressor clutch and internal seals fail between 60,000 and 90,000 miles.',
    solution: 'Replace the compressor assembly with the receiver/drier and expansion valve. Flush AC lines and use the correct refrigerant charge. An OEM-quality aftermarket compressor provides good longevity at lower cost.',
    severity: 'medium', confidence: 'high',
    symptoms: ['AC blowing warm','Compressor clutch not engaging','Refrigerant leak from compressor seal','Intermittent cooling'],
    affectedSystems: ['hvac'], dtcCodes: [], engines: [],
    estimatedCostLow: 500, estimatedCostHigh: 1200,
    citations: [{ source: 'Mitsubishi Forums', url: 'https://www.mitsubishiforum.com', title: 'Endeavor AC Failure Reports' }]
  },
  // Montero Sport (1)
  {
    id: 'mitsubishi-montero-sport-transfer-case',
    make: 'Mitsubishi', model: 'Montero Sport', years: [2000,2001,2002,2003,2004],
    category: 'drivetrain', title: 'Transfer Case Failure',
    description: 'The Montero Sport transfer case develops internal bearing and chain wear, leading to grinding noises, difficulty engaging 4WD, and eventual failure. The transfer case fluid breaks down faster than the service interval suggests, accelerating wear.',
    solution: 'Change the transfer case fluid every 30,000 miles instead of the factory-recommended interval. Replace the transfer case chain and bearings when noise is detected. A quality rebuilt transfer case is available for complete failures.',
    severity: 'high', confidence: 'high',
    symptoms: ['Grinding noise when engaging 4WD','Difficulty shifting between 2WD and 4WD','4WD indicator light flashing','Clunking from transfer case area'],
    affectedSystems: ['drivetrain'], dtcCodes: [], engines: [],
    estimatedCostLow: 800, estimatedCostHigh: 2500,
    citations: [{ source: 'Mitsubishi Forums', url: 'https://www.mitsubishiforum.com', title: 'Montero Sport Transfer Case Problems' }]
  }
];

async function insertIssues() {
  const client = await pool.connect();
  let inserted = 0, updated = 0, errors = 0;
  const makeCounts = {};

  for (const issue of issues) {
    try {
      const result = await client.query(`
        INSERT INTO "KnownIssue" (
          id, make, model, years, trims, engines, category, title, description, solution,
          severity, confidence, symptoms, "affectedSystems", "dtcCodes",
          "estimatedCostLow", "estimatedCostHigh", citations, "communityRecommendations",
          "humanApproved", "reportCount", status, "lastReportedByOwners", "reviewedOn",
          "createdAt", "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15,
          $16, $17, $18, $19,
          $20, $21, $22, $23, $24,
          NOW(), NOW()
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
          "updatedAt" = NOW()
      `, [
        issue.id, issue.make, issue.model, issue.years,
        issue.trims || [], issue.engines || [],
        issue.category, issue.title, issue.description, issue.solution,
        issue.severity, issue.confidence,
        issue.symptoms, issue.affectedSystems, issue.dtcCodes || [],
        issue.estimatedCostLow, issue.estimatedCostHigh,
        JSON.stringify(issue.citations || []),
        JSON.stringify([]),
        false, 0, 'published', '', ''
      ]);

      if (result.command === 'INSERT') {
        inserted++;
      } else {
        updated++;
      }
      makeCounts[issue.make] = (makeCounts[issue.make] || 0) + 1;
    } catch (err) {
      errors++;
      console.error(`ERROR inserting ${issue.id}: ${err.message}`);
    }
  }

  client.release();
  await pool.end();

  console.log('\n=== Infiniti/Genesis/Mitsubishi Known Issues Insert ===');
  console.log(`Total processed: ${issues.length}`);
  console.log(`Inserted/Updated: ${inserted + updated}`);
  console.log(`Errors: ${errors}`);
  console.log('\nPer-make counts:');
  for (const [make, count] of Object.entries(makeCounts).sort()) {
    console.log(`  ${make}: ${count} issues`);
  }
}

insertIssues().catch(err => { console.error(err); process.exit(1); });
