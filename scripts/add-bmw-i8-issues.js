const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const knownIssues = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// BMW i8 issues
// I12 Coupe (2014-2020), I15 Roadster (2019-2020)
// Powertrain: B38 1.5L 3-cylinder turbo + eDrive hybrid
// 7.1 kWh (pre-2019) / 11.6 kWh (2019+) HV battery

const bmwI8Issues = [
  {
    id: 'bmw-i8-cooling-system-failure-2014',
    make: 'BMW',
    model: 'i8',
    years: { start: 2014, end: 2020 },
    title: 'Hybrid Cooling System Failure - B38 Engine Overheating',
    severity: 'high',
    description: 'The BMW i8\'s B38 1.5L turbocharged 3-cylinder engine is prone to cooling system failures, particularly the electronic thermostat and electric water pump. These components typically fail between 50,000-70,000 miles, though failures have been reported as early as 40,000 miles. The i8 has multiple separate cooling circuits (engine, turbo, HV battery, power electronics) making the thermal management system complex and failure-prone. The electronic thermostat can stick open or closed, causing either overcooling or overheating. The electric water pump motor burns out from thermal cycling. Because the B38 is mid-mounted and packaged tightly in the i8, labor access is significantly more expensive than in front-engine BMW applications (Mini, 1 Series). CEL code P0128 (coolant temperature below thermostat regulating temperature) is the most common fault code.',
    symptoms: [
      'Check engine light with code P0128 (coolant temp)',
      'Temperature gauge reading high or fluctuating erratically',
      'Coolant low warning despite no visible leak',
      'Reduced power / limp mode in hot weather',
      'Overheating warning on dashboard',
      'Steam or coolant smell from engine area',
      'Electric water pump noise (buzzing/grinding)',
      'Turbo boost reduction due to thermal protection'
    ],
    solution: 'Electronic thermostat replacement ($500-1,200 including labor due to mid-engine access). Electric water pump replacement ($800-1,500). Check all coolant hoses for cracks and weeping - the tight engine bay causes heat damage to hoses. BMW coolant must be used (BMW 83192211191) - do not mix with other coolant types. Preventive thermostat replacement recommended at 60,000 miles. Water pump recommended at 80,000 miles. Full cooling system flush every 4 years. For the B38 engine specifically: Use 5,000-7,000 mile oil change intervals (not BMW\'s 10,000-12,000 recommendation) to protect the turbo oil feed lines and timing chain.',
    estimatedCost: { min: 500, max: 2500 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'BMW OEM electronic thermostat for B38 engine - critical to use OEM on i8 due to precise temp management for hybrid system',
        partBrand: 'BMW',
        partName: 'Electronic Thermostat B38',
        needsReview: true
      },
      {
        type: 'part',
        content: 'BMW coolant (83192211191) - must use BMW-specific coolant, not universal',
        partBrand: 'BMW',
        partName: 'Genuine BMW Coolant',
        partNumber: '83192211191',
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Change oil every 5,000-7,000 miles on B38 turbo, not BMW\'s 10k+ recommendation - protects turbo and timing chain',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'Labor costs on i8 are 2-3x higher than same B38 engine in a Mini due to mid-engine access requirements',
        upvotes: 0
      }
    ]
  },
  {
    id: 'bmw-i8-12v-battery-hv-system-2014',
    make: 'BMW',
    model: 'i8',
    years: { start: 2014, end: 2020 },
    title: '12V Battery & High-Voltage System Interaction Issues',
    severity: 'high',
    description: 'The BMW i8\'s hybrid architecture creates complex interactions between the 12V auxiliary system and the high-voltage (HV) system. The 12V battery drains when the vehicle sits for extended periods, and unlike a simple ICE car, a dead 12V on the i8 prevents all HV system access - the car cannot charge, start, or drive. A critical but obscure failure mode involves a small safety connector wire under the red 12V battery terminal cover that acts as a crash/rollover sensor to cut HV power. This wire is frequently accidentally disconnected during 12V battery replacement, causing the car to show "DRIVETRAIN NO RESTART" and refuse to charge or drive. The i8\'s complex data bus means a weak 12V battery causes cascading errors across all vehicle systems. The alternator/generator system can also fail, preventing proper 12V charging.',
    symptoms: [
      '"DRIVETRAIN NO RESTART" warning on dashboard',
      'Vehicle won\'t charge from any source (AC or HV)',
      'Vehicle won\'t start or enter Drive Ready mode',
      'Multiple cascading error messages on startup',
      'HV battery slowly discharges while vehicle sits',
      'Warning lights for systems that have no actual fault',
      'Remote functions (app) stop responding',
      'Battery discharging while stationary warning'
    ],
    solution: 'For 12V battery replacement: Use BMW-spec AGM battery and ENSURE the small black safety wire under the red terminal cover is reconnected - this is the #1 cause of post-replacement "Drivetrain No Restart" errors. Register new battery via dealer ISTA tool. For HV battery discharge: If the HV battery fully depletes and 12V dies, the car may need dealer-level tools to restart the HV system. Preventive: Use a quality battery tender when vehicle will sit for more than 1 week. Check that all modules are sleeping properly (dealer can run a sleep current test). For alternator/charging system faults: Full electrical diagnosis required at BMW dealer or specialist.',
    estimatedCost: { min: 200, max: 3000 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'warning',
        content: 'When replacing 12V battery, DO NOT disconnect the small black safety wire under the red terminal cover - reconnect it carefully or car will show "Drivetrain No Restart"',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Use a BMW-approved battery tender if the i8 sits for more than 1 week - the 12V drains much faster than ICE cars',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'If you get "Drivetrain No Restart" after battery work, check the crash sensor wire first before calling a tow truck',
        upvotes: 0
      }
    ]
  },
  {
    id: 'bmw-i8-door-strut-hinge-2014',
    make: 'BMW',
    model: 'i8',
    years: { start: 2014, end: 2020 },
    title: 'Dihedral (Butterfly) Door Strut & Hinge Wear',
    severity: 'moderate',
    description: 'The BMW i8\'s signature dihedral (butterfly/scissor-style) doors are operated by gas-pressurized struts and a complex hinge mechanism that wears over time. The gas struts lose pressure, causing doors to not open fully, not stay open, or close unexpectedly. The hinge mechanism can develop rattles when opening/closing the door. Door latch actuators can fail, preventing the door from opening or closing properly. Because the doors swing up and out, worn struts create a safety hazard as the heavy door can drop on occupants entering/exiting. Struts typically need replacement every 4-6 years or 40,000-60,000 miles. Parts are exclusively BMW OEM with no aftermarket alternatives, and labor requires specialized knowledge of the unique hinge geometry. The I15 Roadster (2019-2020) uses the same door mechanism.',
    symptoms: [
      'Door doesn\'t open all the way (gas strut weak)',
      'Door slowly closes on its own when released',
      'Rattling noise when opening or closing door',
      'Door latch won\'t engage or release',
      'Creaking or groaning sound from door hinge area',
      'Door feels heavy or requires extra force to open',
      'Uneven door gap or alignment issues'
    ],
    solution: 'Gas strut replacement is the most common fix - both sides should be replaced together. BMW OEM struts are the only option (no aftermarket). Door hinge pin and bushing inspection should accompany strut replacement. Door latch actuator replacement for electronic lock failures. Hinge adjustment possible for minor alignment issues. DIY is possible with basic tools for strut replacement - YouTube videos from patsgarageonline provide step-by-step guidance. For door lock actuator: BMW part 51217229458 (2014-2020 models). Labor at dealer is 2-4 hours per side due to interior panel removal.',
    estimatedCost: { min: 500, max: 2500 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'BMW OEM gas pressurized door strut (51217404764) - no aftermarket alternatives, must use OEM',
        partBrand: 'BMW',
        partName: 'Gas Pressurized Door Spring',
        partNumber: '51217404764',
        needsReview: true
      },
      {
        type: 'part',
        content: 'BMW door lock actuator motor (51217229458) - for electronic latch failures on 2014-2020 i8',
        partBrand: 'BMW',
        partName: 'Door Lock Actuator Motor',
        partNumber: '51217229458',
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Replace both door struts at the same time - if one is weak, the other is close behind',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'A weak door strut is a safety hazard - the heavy dihedral door can drop onto you while entering/exiting',
        upvotes: 0
      }
    ]
  },
  {
    id: 'bmw-i8-electrical-gremlins-2014',
    make: 'BMW',
    model: 'i8',
    years: { start: 2014, end: 2020 },
    title: 'Electrical System Gremlins - Wiring Harness & Module Failures',
    severity: 'moderate',
    description: 'The BMW i8\'s complex hybrid electrical architecture creates intermittent electrical issues that are difficult to diagnose. Owners report random warning lights, phantom fault codes, infotainment glitches, and display failures. At least one Bimmerpost user reported needing a complete wiring harness replacement after 5,000 miles. The i8 combines high-voltage EV components with traditional ICE electrical systems in a tight mid-engine layout where heat and vibration stress wiring and connectors. The infotainment system and digital displays are prone to glitches and freezing. The hybrid control module can generate false fault codes. Because the i8 is a low-volume specialist car, the pool of qualified technicians is very small. Independent shops generally cannot diagnose or repair i8 electrical issues - dealer service is almost always required.',
    symptoms: [
      'Random warning lights that appear and disappear',
      'Phantom fault codes with no actual hardware failure',
      'Infotainment screen freezing or going blank',
      'Digital instrument cluster glitches',
      'Intermittent loss of individual functions (windows, lights, etc.)',
      'Hybrid system warning lights during normal operation',
      'Connectors corroding in tight engine bay due to heat cycling'
    ],
    solution: 'Dealer diagnosis with ISTA is required for most electrical issues. Software updates often resolve phantom fault codes and infotainment glitches. For persistent issues, check all ground connections and connector integrity - heat cycling in the engine bay causes connector corrosion and pin-fit degradation. Complete wiring harness replacement ($3,000-8,000+) is the nuclear option for severe cases. Ensure 12V battery is in good health as many electrical gremlins are actually low-voltage symptoms. Maintain BMW extended warranty or purchase third-party warranty for electrical coverage.',
    estimatedCost: { min: 200, max: 8000 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Always check 12V battery health FIRST when experiencing electrical gremlins - a weak 12V causes cascading phantom faults',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Keep the i8 under warranty (BMW or third-party) - electrical repairs are extremely expensive and difficult to predict',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'Very few independent shops can work on the i8 - you will almost certainly need a BMW dealer for electrical issues',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'Walk away from any used i8 without a complete, clean BMW service history - hidden electrical issues are catastrophically expensive',
        upvotes: 0
      }
    ]
  },
  {
    id: 'bmw-i8-charging-port-2014',
    make: 'BMW',
    model: 'i8',
    years: { start: 2014, end: 2020 },
    title: 'Charging Port & Charge Flap Actuator Failure',
    severity: 'moderate',
    description: 'The BMW i8\'s charging port and charge flap actuator are common failure points. The charge flap (door) that covers the charging port can become stuck open or closed, and the electric actuator that operates it fails due to motor burnout or internal gear stripping. When the charge flap is stuck closed, the vehicle cannot be charged. When stuck open, it creates an aesthetic issue and potential water ingress. The charging cable latch mechanism can also stick, preventing cable removal after charging. Some owners report the vehicle won\'t recognize the charging cable is connected, refusing to initiate a charge session. The charging port wiring harness is integrated and cannot be repaired individually - the entire harness must be replaced for port failures.',
    symptoms: [
      'Charge flap won\'t open (can\'t access charging port)',
      'Charge flap won\'t close (stays open)',
      'Charging cable won\'t lock into port',
      'Charging cable locked in port and won\'t release',
      'Vehicle doesn\'t recognize charging cable is connected',
      '"Charging Interrupted" error message',
      'Grinding noise from charge flap actuator'
    ],
    solution: 'Charge flap actuator replacement is the most common fix. The actuator is accessed by removing interior trim panels. For stuck charging cable: Use the emergency manual release (located in trunk/frunk area - consult owner\'s manual for exact location). For sticky latch pin: Apply lithium grease aerosol every 3-4 months to the locking mechanism. For charge port failures: The charging port wiring harness is integrated and costs approximately $700+ for the complete assembly - it cannot be repaired as individual components. Dealer service typically required.',
    estimatedCost: { min: 200, max: 1500 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Apply lithium grease to the charging port latch pin every 3-4 months to prevent sticking',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Know the location of the emergency charging cable manual release before you need it',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'The charge port wiring harness is one integrated piece - expect $700+ if the port itself fails, not just the flap',
        upvotes: 0
      }
    ]
  },
  {
    id: 'bmw-i8-b38-turbo-timing-2014',
    make: 'BMW',
    model: 'i8',
    years: { start: 2014, end: 2020 },
    title: 'B38 Turbocharger & Timing Chain Issues - High Mileage',
    severity: 'moderate',
    description: 'The BMW B38 1.5L 3-cylinder turbocharged engine in the i8 develops turbocharger and timing chain issues at higher mileages (70,000+ miles). The turbocharger can develop oil leaks from the turbo oil feed/return lines and bearing seal degradation. Carbon buildup on intake valves is significant due to direct injection, requiring walnut blasting every 40,000-60,000 miles. The timing chain is marketed as "lifetime" but reports of chain stretch and noisy timing components increase on higher-mileage examples, especially those driven with extended oil change intervals. The B38 in the i8 operates differently than in a Mini or 1 Series due to the hybrid system - the engine doesn\'t run continuously, which can cause condensation and oil dilution from short run cycles.',
    symptoms: [
      'Oil leak around turbocharger area',
      'Blue smoke on startup or under boost',
      'Reduced boost pressure / turbo lag increasing',
      'Timing chain rattle on cold start',
      'Rough idle or misfire codes',
      'Carbon buildup causing power loss and rough running',
      'Oil consumption increasing over time',
      'Whining or whistling noise from turbo area'
    ],
    solution: 'Turbocharger: Inspect oil feed and return lines for leaks. Replace turbo seals and lines ($800-1,500) or complete turbo replacement ($2,000-4,000 for i8 due to mid-engine labor). Carbon buildup: Walnut blast intake valves every 40,000-60,000 miles ($400-800). Timing chain: If rattle is present, timing chain kit replacement needed ($2,000-4,000 including labor). Preventive: Use 5,000-7,000 mile oil change intervals with high-quality BMW LL-01 approved synthetic. Run the engine to full operating temperature on every drive (15+ minutes minimum) to burn off moisture. Check oil level monthly.',
    estimatedCost: { min: 400, max: 4000 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Walnut blast intake valves every 40-60k miles - direct injection B38 builds up carbon badly and it kills performance',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Use 5,000-7,000 mile oil change intervals, NOT BMW\'s recommended 10k+ - shorter intervals protect the timing chain and turbo',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Always run the B38 engine to full operating temp (15+ min) to burn off moisture from short hybrid cycles',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'Mid-engine layout means ALL B38 mechanical work costs 2-3x more labor than the same engine in a Mini or 1 Series',
        upvotes: 0
      }
    ]
  },
  {
    id: 'bmw-i8-fuel-tank-recall-2014',
    make: 'BMW',
    model: 'i8',
    years: { start: 2014, end: 2015 },
    title: 'Fuel Tank Ground Cable Weld Defect - Fire Risk (Recall)',
    severity: 'high',
    description: 'Early BMW i8 production models (2014-2015) were subject to a safety recall for an improperly welded bolt used to attach a ground cable between the fuel tank and vehicle chassis. The defective weld could cause a fuel leak that, in the presence of an ignition source, could lead to a fire. Over 200 reports were filed. BMW resolved this issue with a recall that began in November 2014. This is a critical safety recall that must be verified as completed on any used i8 purchase.',
    symptoms: [
      'Fuel odor from under vehicle',
      'Visible fuel leak near fuel tank area',
      'Ground cable loose or disconnected at fuel tank'
    ],
    solution: 'This is covered under BMW safety recall (November 2014). Dealers inspect and repair the fuel tank ground cable attachment at no cost. Verify recall completion on any used i8 using NHTSA VIN lookup at NHTSA.gov or bmwusa.com/recall. Do not purchase a used i8 without confirming this recall has been completed.',
    estimatedCost: { min: 0, max: 0 },
    recallTSB: 'NHTSA Recall - Fuel Tank Ground Cable Weld (2014-2015 i8)',
    communityRecommendations: [
      {
        type: 'warning',
        content: 'CRITICAL: Verify this recall is completed before purchasing any 2014-2015 i8 - this is a fire risk',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Check recall status at NHTSA.gov with VIN - free repair at any BMW dealer',
        upvotes: 0
      }
    ]
  }
];

console.log(`Adding ${bmwI8Issues.length} BMW i8 issues...`);
knownIssues.issues.push(...bmwI8Issues);

fs.writeFileSync(dbPath, JSON.stringify(knownIssues, null, 2));

console.log(`Successfully added ${bmwI8Issues.length} BMW i8 issues`);
console.log(`Total issues in database: ${knownIssues.issues.length}`);
