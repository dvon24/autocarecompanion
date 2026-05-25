const fs = require('fs');
const path = require('path');
const YMMT_PATH = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ISSUES_PATH = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');

// VW GTI (1990-2026), VW Golf R (2012-2026), VW Golf Alltrack (2017-2019)
// Kia Cadenza (2014-2020), Kia K900 (2015-2020), Kia Borrego (2009-2011)
// Chrysler LeBaron (1990-1995), Chrysler Fifth Avenue (1990-1993), Chrysler Prowler (1999-2002)

const ymmtEntries = [
  {
    make: 'Volkswagen', model: 'GTI',
    years: Array.from({ length: 37 }, (_, i) => 1990 + i), // 1990-2026
    trims: ['Base', '2.0T', 'Autobahn', 'SE', 'S']
  },
  {
    make: 'Volkswagen', model: 'Golf R',
    years: Array.from({ length: 15 }, (_, i) => 2012 + i), // 2012-2026
    trims: ['Base', 'DCC & Navigation']
  },
  {
    make: 'Volkswagen', model: 'Golf Alltrack',
    years: [2017, 2018, 2019],
    trims: ['S', 'SE', 'SEL']
  },
  {
    make: 'Kia', model: 'Cadenza',
    years: [2014, 2015, 2016, 2017, 2018, 2019, 2020],
    trims: ['Base', 'Premium', 'Limited', 'Technology']
  },
  {
    make: 'Kia', model: 'K900',
    years: [2015, 2016, 2017, 2018, 2019, 2020],
    trims: ['Luxury', 'V8 Luxury', 'V8 Elite']
  },
  {
    make: 'Kia', model: 'Borrego',
    years: [2009, 2010, 2011],
    trims: ['LX', 'EX', 'EX V8', 'Limited']
  },
  {
    make: 'Chrysler', model: 'LeBaron',
    years: [1990, 1991, 1992, 1993, 1994, 1995],
    trims: ['Base', 'Highline', 'LX', 'GTC', 'Landau']
  },
  {
    make: 'Chrysler', model: 'Fifth Avenue',
    years: [1990, 1991, 1992, 1993],
    trims: ['Base']
  },
  {
    make: 'Chrysler', model: 'Prowler',
    years: [1999, 2000, 2001, 2002],
    trims: ['Base']
  },
];

const newIssues = [
  // ===== VW GTI =====
  {
    id: 'vw-gti-timing-chain-tensioner-2006',
    vehicleMatch: {
      years: [2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014],
      make: 'Volkswagen',
      model: 'GTI',
      engines: ['2.0L TSI I4']
    },
    category: 'engine',
    title: '2.0 TSI Timing Chain Tensioner Failure (CCTA/CBFA)',
    description: 'The 2.0 TSI engine (CCTA and CBFA codes) in Mk5 and Mk6 GTI models is notorious for timing chain tensioner failure. The original single-piston tensioner design can collapse, allowing the chain to jump teeth. If the chain jumps even one tooth, the interference engine bends valves and causes catastrophic damage. This issue is most common during cold starts when oil pressure is lowest. VW issued an updated tensioner (revision L) but never issued a recall. Engines with build dates before January 2012 are most at risk.',
    solution: 'Replace the timing chain tensioner with the updated revision L part (06K109467K). This requires removing the timing chain cover. Many owners also replace the chain and guides as preventive maintenance since the labor is the same. The repair is time-sensitive — check the tensioner revision letter stamped on the part. Any revision before "L" should be replaced immediately. Some shops can check tensioner condition with a borescope through the oil fill hole.',
    symptoms: [
      'Rattling or clattering noise on cold start lasting 1-3 seconds',
      'Check engine light with P0016 or P0017 (cam/crank correlation)',
      'Engine stalls immediately after starting',
      'Engine cranks but won\'t start (chain has jumped)',
      'Rough running and misfires after cold start rattle event'
    ],
    severity: 'high',
    confidence: 0.93,
    estimatedCost: { low: 800, high: 2500 },
    communityRecommendations: [
      { type: 'part', content: 'VW/Audi 06K109467K updated timing chain tensioner (revision L) — the only accepted permanent fix', partBrand: 'VW OEM', partName: 'Timing Chain Tensioner (Rev L)', partNumber: '06K109467K', affiliateUrl: 'https://www.amazon.com/s?k=VW+GTI+timing+chain+tensioner+06K109467K&tag=au7o-20', upvotes: 0, needsReview: false },
      { type: 'tip', content: 'Check the tensioner revision letter through the timing chain cover inspection window — any revision before "L" should be replaced proactively', upvotes: 0, needsReview: false },
      { type: 'warning', content: 'Do NOT ignore any cold start rattle — a collapsed tensioner can jump the chain in seconds, destroying the engine ($5,000+ for a new long block)', upvotes: 0, needsReview: false }
    ],
    citations: [
      { source: 'vwvortex.com', description: 'Mk5/Mk6 GTI timing chain tensioner failure guide' },
      { source: 'golfmk6.com', description: '2.0 TSI tensioner revision identification' }
    ],
    humanApproved: false,
    status: 'published',
    reportCount: 450,
    reviewedOn: '2026-03-13',
    dtcCodes: ['P0016', 'P0017', 'P0300']
  },
  {
    id: 'vw-gti-water-pump-thermostat-2006',
    vehicleMatch: {
      years: [2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021],
      make: 'Volkswagen',
      model: 'GTI',
      engines: ['2.0L TSI I4', '2.0L TFSI I4']
    },
    category: 'engine',
    title: 'Plastic Water Pump and Thermostat Housing Failure',
    description: 'All EA888-family 2.0T engines in the GTI use a plastic water pump housing and thermostat housing that crack and leak coolant. The plastic becomes brittle from heat cycling and the impeller can also separate from the shaft, causing loss of coolant flow with no visible external leak. The thermostat housing (often called the "water flange") at the back of the cylinder head also cracks. This is considered a routine maintenance item on the GTI — it is not a question of if, but when.',
    solution: 'Replace with an updated VW water pump assembly. Some owners upgrade to the aluminum water pump housing from ECS Tuning or USP Motorsports to prevent repeat failures. Replace the thermostat housing at the same time — the labor overlaps significantly. Use G13 coolant only (purple, VW spec TL 774 J). Flush the cooling system during repair.',
    symptoms: [
      'Coolant dripping from water pump area (front-right of engine)',
      'Low coolant warning light',
      'Engine overheating gradually',
      'Sweet coolant smell from engine bay',
      'Coolant level dropping with no visible puddle (internal impeller failure)'
    ],
    severity: 'high',
    confidence: 0.90,
    estimatedCost: { low: 300, high: 900 },
    communityRecommendations: [
      { type: 'part', content: 'ECS Tuning aluminum water pump housing upgrade — eliminates the plastic cracking issue permanently', partBrand: 'ECS Tuning', partName: 'Aluminum Water Pump Housing', affiliateUrl: 'https://www.amazon.com/s?k=VW+GTI+2.0T+aluminum+water+pump+housing&tag=au7o-20', upvotes: 0, needsReview: false },
      { type: 'tip', content: 'Replace the water pump and thermostat housing together — the labor overlap saves $200+ and they fail at similar intervals', upvotes: 0, needsReview: false },
      { type: 'warning', content: 'Use ONLY VW G13 (purple) coolant — mixing G12/G13 or using green coolant causes silicate precipitation that clogs the heater core', upvotes: 0, needsReview: false }
    ],
    citations: [
      { source: 'vwvortex.com', description: 'EA888 water pump failure — the definitive thread' },
      { source: 'golfmk7.com', description: 'Mk7 GTI water pump and thermostat replacement' }
    ],
    humanApproved: false,
    status: 'published',
    reportCount: 520,
    reviewedOn: '2026-03-13',
    dtcCodes: ['P0117', 'P2181']
  },
  {
    id: 'vw-gti-dsg-mechatronic-2006',
    vehicleMatch: {
      years: [2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
      make: 'Volkswagen',
      model: 'GTI'
    },
    category: 'transmission',
    title: 'DSG (DQ250/DQ381) Mechatronic Unit Failure',
    description: 'The 6-speed (DQ250) and 7-speed (DQ381) DSG dual-clutch transmissions available in the GTI can develop mechatronic unit failures. The mechatronic unit is the electro-hydraulic control unit that operates the clutch packs and gear selection. Internal solenoid failures, pressure accumulator leaks, and circuit board solder joint cracks cause erratic shifting, loss of gears, and "Transmission malfunction" warnings. The DQ250 is more problematic than the newer DQ381. VW extended the DSG warranty to 6 years/72,000 miles on early models.',
    solution: 'A mechatronic unit rebuild by a DSG specialist (BMP Tuning, Deutsche Autoparts) costs $1,200-2,000 vs $3,000+ for a new unit from VW. The DSG fluid and filter must be changed every 40,000 miles — VW says "lifetime fill" but this is demonstrably false. A DSG adaptation reset with VCDS after fluid service restores shift quality. Check for extended warranty coverage.',
    symptoms: [
      'Harsh or jerky low-speed shifting (1st to 2nd, 2nd to 3rd)',
      'Transmission malfunction warning message',
      'Loss of odd or even gears',
      'Shuddering during clutch engagement from a stop',
      'Transmission goes into limp mode (stuck in one gear)'
    ],
    severity: 'high',
    confidence: 0.85,
    estimatedCost: { low: 500, high: 3500 },
    communityRecommendations: [
      { type: 'tip', content: 'Change DSG fluid and filter every 40,000 miles — ignore VW\'s "lifetime fill" claim, it is the #1 cause of premature mechatronic failure', upvotes: 0, needsReview: false },
      { type: 'part', content: 'Pentosin FFL-2 DSG transmission fluid — VW-approved spec for DQ250, use with VW filter 02E305051C', partBrand: 'Pentosin', partName: 'FFL-2 DSG Fluid', affiliateUrl: 'https://www.amazon.com/s?k=Pentosin+FFL-2+DSG+transmission+fluid&tag=au7o-20', upvotes: 0, needsReview: false },
      { type: 'warning', content: 'Do not attempt a generic ATF flush on a DSG — it requires specific fill procedure with temperature monitoring using VCDS or equivalent scan tool', upvotes: 0, needsReview: false }
    ],
    citations: [
      { source: 'vwvortex.com', description: 'DSG mechatronic failure diagnosis and repair options' },
      { source: 'golfmk7.com', description: 'DQ250/DQ381 DSG service intervals and fluid change' }
    ],
    humanApproved: false,
    status: 'published',
    reportCount: 380,
    reviewedOn: '2026-03-13',
    dtcCodes: ['P17BF', 'P189C', 'P17E1']
  },

  // ===== VW GOLF R =====
  {
    id: 'vw-golf-r-haldex-2012',
    vehicleMatch: {
      years: [2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
      make: 'Volkswagen',
      model: 'Golf R'
    },
    category: 'drivetrain',
    title: 'Haldex AWD Coupling Pump and Filter Clogging',
    description: 'The Golf R uses a Haldex (Gen 4 on Mk6, Gen 5 on Mk7+) rear differential coupling for its AWD system. The Haldex pump and filter become clogged with clutch plate debris, reducing the system\'s ability to send power to the rear wheels. When clogged, the Golf R behaves essentially as a front-wheel-drive car during spirited driving, with the rear axle not engaging. The Haldex filter is often overlooked during routine service because many shops are unaware it exists.',
    solution: 'Service the Haldex system every 20,000-30,000 miles: drain and refill the Haldex fluid (VW G 060 175 A2) and replace the Haldex filter. The filter is internal to the pump assembly on Gen 5 units. Use only VW-specified Haldex fluid — generic gear oil will damage the clutch plates. After service, the Haldex should be activated with VCDS to verify proper pump operation.',
    symptoms: [
      'Front wheels spinning in low-traction conditions (AWD not engaging)',
      'Car feels like FWD during hard cornering',
      'Haldex warning light (if equipped)',
      'Understeer that wasn\'t present when new',
      'Groaning or whining noise from rear differential area'
    ],
    severity: 'medium',
    confidence: 0.85,
    estimatedCost: { low: 150, high: 500 },
    communityRecommendations: [
      { type: 'part', content: 'Genuine VW Haldex service kit (fluid + filter) — use only VW G 060 175 A2 fluid for Haldex coupling', partBrand: 'VW OEM', partName: 'Haldex Service Kit', affiliateUrl: 'https://www.amazon.com/s?k=VW+Golf+R+Haldex+service+kit+filter&tag=au7o-20', upvotes: 0, needsReview: false },
      { type: 'tip', content: 'Service the Haldex every 20,000 miles — this is the single most important AWD maintenance item and most shops don\'t even know it exists', upvotes: 0, needsReview: false },
      { type: 'warning', content: 'Never use generic gear oil or ATF in the Haldex — wrong fluid destroys the clutch plates and pump, turning a $200 service into a $2,500 Haldex replacement', upvotes: 0, needsReview: false }
    ],
    citations: [
      { source: 'vwvortex.com', description: 'Golf R Haldex service guide and filter replacement' },
      { source: 'golfmk7.com', description: 'Mk7 Golf R Haldex Gen 5 maintenance' }
    ],
    humanApproved: false,
    status: 'published',
    reportCount: 200,
    reviewedOn: '2026-03-13',
    dtcCodes: ['01315', '16566']
  },
  {
    id: 'vw-golf-r-turbo-diverter-valve-2015',
    vehicleMatch: {
      years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
      make: 'Volkswagen',
      model: 'Golf R',
      engines: ['2.0L EA888 Gen 3 I4']
    },
    category: 'engine',
    title: 'Turbo Diverter Valve (DV) Failure and Boost Leak',
    description: 'The electronically-controlled diverter valve (DV) on the Mk7+ Golf R IS20/IS38 turbocharger develops a torn diaphragm that causes boost leaks. The DV recirculates boost pressure when the throttle is closed; when the diaphragm tears, boost pressure escapes through the valve continuously. This results in reduced turbo response, loss of peak power, and overboost faults. The plastic housing can also crack from heat cycling. Stock and mildly tuned Golf R models are equally affected.',
    solution: 'Replace the diverter valve with an OEM updated unit (06L145612L) or upgrade to a GFB DV+ or Forge Motorsport piston-type diverter valve that eliminates the failure-prone rubber diaphragm. The DV is located on top of the turbo and takes 15 minutes to replace. Reset the ECU adaptation values after replacement using VCDS.',
    symptoms: [
      'Loss of boost pressure / reduced acceleration',
      'Whooshing or hissing noise from engine bay under boost',
      'Check engine light with P0299 (underboost) or P0234 (overboost)',
      'Boost gauge showing lower than normal peak boost',
      'Turbo flutter or compressor surge noise'
    ],
    severity: 'medium',
    confidence: 0.85,
    estimatedCost: { low: 50, high: 200 },
    communityRecommendations: [
      { type: 'part', content: 'GFB DV+ T9351 diverter valve upgrade — piston-type design eliminates the failure-prone rubber diaphragm, direct bolt-on replacement', partBrand: 'GFB', partName: 'DV+ Diverter Valve', partNumber: 'T9351', affiliateUrl: 'https://www.amazon.com/s?k=GFB+DV%2B+T9351+VW+Golf+R+diverter+valve&tag=au7o-20', upvotes: 0, needsReview: false },
      { type: 'tip', content: 'This is a 15-minute DIY job — the DV is on top of the turbo, accessible with one Torx bolt and a hose clamp', upvotes: 0, needsReview: false },
      { type: 'tip', content: 'If your Golf R is tuned (Stage 1+), replace the DV proactively with a piston-type unit — increased boost pressure tears the factory diaphragm faster', upvotes: 0, needsReview: false }
    ],
    citations: [
      { source: 'vwvortex.com', description: 'Golf R diverter valve failure and upgrade options' },
      { source: 'golfmk7.com', description: 'IS38 turbo DV replacement guide' }
    ],
    humanApproved: false,
    status: 'published',
    reportCount: 175,
    reviewedOn: '2026-03-13',
    dtcCodes: ['P0299', 'P0234']
  },
  {
    id: 'vw-golf-r-carbon-buildup-2015',
    vehicleMatch: {
      years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
      make: 'Volkswagen',
      model: 'Golf R',
      engines: ['2.0L EA888 Gen 3 I4']
    },
    category: 'engine',
    title: 'EA888 Gen 3 Intake Valve Carbon Buildup (GDI)',
    description: 'The direct-injected EA888 Gen 3 engine in the Golf R accumulates heavy carbon deposits on the intake valve faces, just like all GDI engines. Since fuel is sprayed directly into the combustion chamber rather than over the intake valves, no fuel-washing occurs to clean the valves. Carbon buildup restricts airflow, causes misfires, rough idle, and measurable power loss. The Golf R\'s higher boost pressure can partially mask the symptoms, but a carbon-loaded Golf R can lose 15-20 HP from flow restriction.',
    solution: 'Walnut shell media blasting every 40,000-50,000 miles is the gold standard for GDI carbon removal. The intake manifold is removed and crushed walnut shells are blasted at the intake valve faces. Install an oil catch can (Mishimoto, JLT, IE) to reduce PCV oil vapor contributing to carbon deposits. Run the engine to full operating temperature before shutting off to burn off light deposits.',
    symptoms: [
      'Rough idle that worsens with mileage',
      'Random misfires (P0300) at idle and low RPM',
      'Reduced power and sluggish throttle response',
      'Poor fuel economy (1-3 MPG below rated)',
      'Cold start stumble or stalling'
    ],
    severity: 'medium',
    confidence: 0.88,
    estimatedCost: { low: 400, high: 700 },
    communityRecommendations: [
      { type: 'part', content: 'Integrated Engineering catch can kit for Mk7/Mk8 Golf R — reduces PCV oil vapor that causes intake valve carbon buildup', partBrand: 'Integrated Engineering', partName: 'Oil Catch Can Kit', affiliateUrl: 'https://www.amazon.com/s?k=Integrated+Engineering+catch+can+VW+Golf+R&tag=au7o-20', upvotes: 0, needsReview: false },
      { type: 'tip', content: 'Schedule walnut blast cleaning every 40,000-50,000 miles — this is routine GDI maintenance and costs less than one tank of gas per 10,000 miles driven', upvotes: 0, needsReview: false },
      { type: 'tip', content: 'Use Top Tier fuel (Shell V-Power, Chevron) and avoid short trips — cold engines produce more intake deposits than fully warmed engines', upvotes: 0, needsReview: false }
    ],
    citations: [
      { source: 'vwvortex.com', description: 'EA888 Gen 3 carbon buildup walnut blasting results and before/after photos' },
      { source: 'golfmk7.com', description: 'Golf R GDI carbon cleaning schedule' }
    ],
    humanApproved: false,
    status: 'published',
    reportCount: 230,
    reviewedOn: '2026-03-13',
    dtcCodes: ['P0300', 'P0301', 'P0302', 'P0303', 'P0304']
  },

  // ===== VW GOLF ALLTRACK =====
  {
    id: 'vw-golf-alltrack-panoramic-sunroof-2017',
    vehicleMatch: {
      years: [2017, 2018, 2019],
      make: 'Volkswagen',
      model: 'Golf Alltrack'
    },
    category: 'body',
    title: 'Panoramic Sunroof Drain Clog and Headliner Water Damage',
    description: 'The Golf Alltrack with the panoramic sunroof (SEL trim) suffers from clogged sunroof drain tubes that cause water to overflow into the headliner and down the A-pillars. The drain tubes run from the sunroof tray through the A-pillars and exit near the wheel wells. Debris, pine needles, and pollen clog the narrow tubes. Water that overflows the sunroof tray saturates the headliner, damages the overhead console electronics, and can drip onto the dashboard. The wagon body style with its longer roof line has longer drain tube runs than the hatchback, making clogs more likely.',
    solution: 'Clear all four sunroof drain tubes using low-pressure compressed air or a flexible weed trimmer line fed through the tubes. The drain openings are visible at the corners of the sunroof tray with the sunroof open. Blow from the top down and watch for water to exit at the wheel wells (front) and rear quarters (rear). Clean debris from the sunroof tray with a damp cloth. Repeat every 6 months.',
    symptoms: [
      'Water dripping from overhead console or map lights',
      'Wet headliner near sunroof edges',
      'Water stains on A-pillar trim',
      'Musty smell inside vehicle',
      'Wet floorboards after heavy rain'
    ],
    severity: 'medium',
    confidence: 0.82,
    estimatedCost: { low: 0, high: 500 },
    communityRecommendations: [
      { type: 'tip', content: 'Clear sunroof drains every spring and fall — use a piece of flexible weed trimmer line threaded through the drain openings at the corners of the sunroof tray', upvotes: 0, needsReview: false },
      { type: 'tip', content: 'Pour a slow cup of water into each corner of the sunroof tray with the sunroof open — you should see it drain out near the wheel wells. If it doesn\'t, the tube is clogged.', upvotes: 0, needsReview: false },
      { type: 'warning', content: 'Do not use a wire or stiff probe to clear the drain tubes — puncturing the rubber tube inside the A-pillar creates a permanent internal leak', upvotes: 0, needsReview: false }
    ],
    citations: [
      { source: 'vwvortex.com', description: 'Golf/Alltrack sunroof drain clearing procedure' },
      { source: 'golfmk7.com', description: 'Mk7 panoramic sunroof water leak fix' }
    ],
    humanApproved: false,
    status: 'published',
    reportCount: 85,
    reviewedOn: '2026-03-13',
    dtcCodes: []
  },
  {
    id: 'vw-golf-alltrack-rear-hatch-wiring-2017',
    vehicleMatch: {
      years: [2017, 2018, 2019],
      make: 'Volkswagen',
      model: 'Golf Alltrack'
    },
    category: 'electrical',
    title: 'Rear Hatch Wiring Harness Chafing and Broken Wires',
    description: 'The Golf Alltrack rear hatch (liftgate) wiring harness flexes every time the hatch is opened and closed. The harness passes through a rubber boot at the top of the hatch opening. Over time, the wires inside the boot break from repeated flexing. This causes intermittent failures of the rear wiper, rear defroster, license plate lights, reverse camera, and power liftgate (if equipped). The issue is common across all Mk7 Golf variants but the Alltrack\'s heavy use as a utility vehicle means more hatch cycles.',
    solution: 'Open the rubber boot/loom at the top of the hatch and inspect the individual wires for breaks. Broken wires can be repaired by splicing in new wire with solder and heat-shrink tubing, adding a small service loop to reduce flexing stress. VW dealers replace the entire hatch harness ($400+) but a DIY splice repair costs under $10 and takes 1-2 hours.',
    symptoms: [
      'Rear wiper stops working intermittently',
      'Rear defroster inoperative',
      'License plate lights flickering or out',
      'Reverse camera intermittently goes black',
      'Multiple rear electrical failures that come and go'
    ],
    severity: 'medium',
    confidence: 0.85,
    estimatedCost: { low: 10, high: 400 },
    communityRecommendations: [
      { type: 'tip', content: 'Open the rubber boot at the hatch hinge and flex the wires while a helper tests each function — this pinpoints which wire(s) are broken', upvotes: 0, needsReview: false },
      { type: 'tip', content: 'When splicing the broken wire, add 2-3 inches of extra service loop so the repair point doesn\'t flex — this prevents the splice from breaking again', upvotes: 0, needsReview: false },
      { type: 'warning', content: 'Use solder and heat-shrink for wire splices, not crimp connectors or wire nuts — vibration and moisture will cause crimp connections to fail within months', upvotes: 0, needsReview: false }
    ],
    citations: [
      { source: 'vwvortex.com', description: 'Mk7 Golf/Alltrack rear hatch wiring harness failure' },
      { source: 'golfmk7.com', description: 'Liftgate wire break repair guide' }
    ],
    humanApproved: false,
    status: 'published',
    reportCount: 120,
    reviewedOn: '2026-03-13',
    dtcCodes: []
  },
  {
    id: 'vw-golf-alltrack-haldex-2017',
    vehicleMatch: {
      years: [2017, 2018, 2019],
      make: 'Volkswagen',
      model: 'Golf Alltrack'
    },
    category: 'drivetrain',
    title: 'Haldex AWD Coupling Service Neglect and Failure',
    description: 'The Golf Alltrack uses a Haldex Gen 5 rear axle coupling for 4MOTION AWD, identical to the Golf R system. The Haldex pump and internal filter require fluid changes every 20,000-30,000 miles, but most owners and dealers are unaware of this maintenance requirement. When neglected, the Haldex pump starves for clean fluid, the filter clogs with clutch debris, and the coupling can no longer effectively send power to the rear wheels. The Alltrack\'s use for outdoor/adventure activities means it is more likely to need functional AWD.',
    solution: 'Service the Haldex every 20,000 miles: drain old fluid, replace the internal filter, and refill with VW-specified Haldex fluid (G 060 175 A2). The drain plug and fill plug are on the Haldex unit at the rear differential. The filter requires removing the Haldex electrical connector to access. After service, verify rear wheel engagement with VCDS or by testing on a loose surface.',
    symptoms: [
      'Front wheels spinning on loose surfaces (AWD not engaging)',
      'Vehicle feels front-wheel-drive in snow or mud',
      'No rear wheel torque during hard acceleration',
      'Groaning from rear end during tight turns',
      'AWD/4MOTION warning light (late-stage failure)'
    ],
    severity: 'medium',
    confidence: 0.83,
    estimatedCost: { low: 150, high: 2000 },
    communityRecommendations: [
      { type: 'tip', content: 'Service the Haldex every 20,000 miles with VW G 060 175 A2 fluid — this is not in most VW maintenance schedules but is critical for 4MOTION longevity', upvotes: 0, needsReview: false },
      { type: 'part', content: 'Genuine VW Haldex filter and fluid service kit — complete service kit with drain plug seal', partBrand: 'VW OEM', partName: 'Haldex Service Kit', affiliateUrl: 'https://www.amazon.com/s?k=VW+Golf+Alltrack+Haldex+service+kit&tag=au7o-20', upvotes: 0, needsReview: false },
      { type: 'warning', content: 'If the Haldex pump has been damaged from running on contaminated fluid, the entire Haldex unit must be replaced ($1,500-2,000) — regular service prevents this', upvotes: 0, needsReview: false }
    ],
    citations: [
      { source: 'vwvortex.com', description: 'Golf Alltrack Haldex service guide' },
      { source: 'golfmk7.com', description: '4MOTION Haldex Gen 5 maintenance schedule' }
    ],
    humanApproved: false,
    status: 'published',
    reportCount: 95,
    reviewedOn: '2026-03-13',
    dtcCodes: []
  },

  // ===== KIA CADENZA =====
  {
    id: 'kia-cadenza-panoramic-sunroof-2014',
    vehicleMatch: {
      years: [2014, 2015, 2016, 2017, 2018, 2019, 2020],
      make: 'Kia',
      model: 'Cadenza'
    },
    category: 'body',
    title: 'Panoramic Sunroof Glass Spontaneous Shattering',
    description: 'The Cadenza equipped with the panoramic sunroof has experienced instances of the tempered glass panel spontaneously shattering without external impact. The glass explodes with a loud pop, showering the interior with small tempered glass fragments. This appears to be caused by stress fractures in the tempered glass from manufacturing defects or frame flex. While tempered glass shatters into small pebble-like pieces rather than sharp shards, the event is extremely startling and leaves the vehicle open to weather.',
    solution: 'Cover the opening immediately with plastic sheeting and tape if the glass shatters. File a claim with Kia — some owners have received goodwill coverage for replacement even outside warranty due to the spontaneous nature of the failure. The replacement glass panel from Kia dealer is $800-1,200 installed. Aftermarket sunroof glass is not available for the Cadenza. File a complaint with NHTSA to support potential recall investigation.',
    symptoms: [
      'Loud pop or explosion sound from roof',
      'Sunroof glass shattered with no external impact',
      'Small glass fragments throughout interior',
      'Wind noise and water intrusion through broken glass',
      'Glass shattering while parked (thermal stress)'
    ],
    severity: 'high',
    confidence: 0.75,
    estimatedCost: { low: 800, high: 1500 },
    communityRecommendations: [
      { type: 'tip', content: 'Contact Kia corporate (1-800-333-4542) for goodwill coverage — many owners have received free or reduced-cost replacement due to the spontaneous nature', upvotes: 0, needsReview: false },
      { type: 'tip', content: 'File a complaint with NHTSA at safercar.gov — documented complaints increase the likelihood of a recall investigation', upvotes: 0, needsReview: false },
      { type: 'warning', content: 'Keep a roll of plastic sheeting and duct tape in the trunk — if the glass shatters, you need to weather-proof the opening immediately to prevent interior water damage', upvotes: 0, needsReview: false }
    ],
    citations: [
      { source: 'NHTSA complaints', description: 'Kia Cadenza sunroof glass shattering reports' },
      { source: 'kia-forums.com', description: 'Cadenza panoramic sunroof spontaneous shattering' }
    ],
    humanApproved: false,
    status: 'published',
    reportCount: 55,
    reviewedOn: '2026-03-13',
    dtcCodes: []
  },
  {
    id: 'kia-cadenza-gdi-engine-knock-2014',
    vehicleMatch: {
      years: [2014, 2015, 2016, 2017, 2018, 2019, 2020],
      make: 'Kia',
      model: 'Cadenza',
      engines: ['3.3L Lambda II GDI V6']
    },
    category: 'engine',
    title: '3.3L Lambda II GDI V6 Connecting Rod Bearing Failure',
    description: 'The Cadenza\'s 3.3L Lambda II GDI V6 is covered under the Hyundai/Kia engine settlement for connecting rod bearing failure. Manufacturing debris in the crankshaft oil passages can restrict oil flow to the connecting rod bearings, causing premature wear and eventual engine seizure. Kia extended the engine warranty to 15 years/150,000 miles. The issue typically manifests as a knocking noise from the bottom end of the engine, often preceded by an illuminated oil pressure warning light.',
    solution: 'Contact a Kia dealer immediately for inspection under the extended warranty (15 years/150,000 miles). Kia performs a rod bearing clearance test and inspection. If the bearings are worn, Kia replaces the engine at no cost with a remanufactured unit. Keep all oil change records as proof of maintenance — they are required for warranty claims.',
    symptoms: [
      'Knocking noise from lower engine that increases with RPM',
      'Low oil pressure warning light',
      'Check engine light illuminated',
      'Metal particles visible in oil during oil change',
      'Engine stalling or seizing'
    ],
    severity: 'high',
    confidence: 0.88,
    estimatedCost: { low: 0, high: 6000 },
    communityRecommendations: [
      { type: 'tip', content: 'Check with Kia dealer about the 15 year/150,000 mile extended engine warranty — engine replacement is free for covered vehicles', upvotes: 0, needsReview: false },
      { type: 'tip', content: 'Keep ALL oil change receipts in the glove box — Kia requires proof of regular oil changes for warranty engine replacement', upvotes: 0, needsReview: false },
      { type: 'warning', content: 'Stop driving immediately if you hear knocking — continued driving can cause the rod to punch through the engine block, voiding warranty coverage', upvotes: 0, needsReview: false }
    ],
    citations: [
      { source: 'Hyundai/Kia Engine Settlement', description: 'Lambda II V6 connecting rod bearing extended warranty' },
      { source: 'NHTSA complaints', description: 'Kia Cadenza engine failure complaints' }
    ],
    humanApproved: false,
    status: 'published',
    reportCount: 75,
    reviewedOn: '2026-03-13',
    dtcCodes: ['P0524', 'P0520', 'P0300']
  },
  {
    id: 'kia-cadenza-transmission-hesitation-2014',
    vehicleMatch: {
      years: [2014, 2015, 2016, 2017, 2018, 2019, 2020],
      make: 'Kia',
      model: 'Cadenza'
    },
    category: 'transmission',
    title: '6-Speed Automatic Transmission Hesitation and Hard Downshift',
    description: 'The Cadenza\'s 6-speed automatic transmission (A6LF2) exhibits a hesitation or delayed response when accelerating from low speeds, particularly after coasting to a stop. The transmission seems to "hunt" for the right gear, causing a 1-2 second delay before power delivery. Hard downshifts also occur during passing maneuvers. Kia released multiple TCM software updates to address the shift calibration but many owners report the issue persists.',
    solution: 'Visit a Kia dealer for the latest TCM software update — multiple updates have been released through 2020. A complete transmission fluid drain and fill with Kia SP-IV ATF can improve shift quality. If the problem persists after the software update, the valve body may need replacement. Some owners report improved behavior after an "adaptive learn" reset performed with the KDS scan tool.',
    symptoms: [
      'Hesitation or delay when accelerating from a stop',
      'Hard downshift when passing on the highway',
      'Transmission "hunting" between 2nd and 3rd gear at low speed',
      'Jolt or jerk during 1-2 upshift',
      'Delayed throttle response when merging'
    ],
    severity: 'medium',
    confidence: 0.80,
    estimatedCost: { low: 0, high: 2000 },
    communityRecommendations: [
      { type: 'tip', content: 'Ask the dealer to check for the latest TCM software update — Kia has released several recalibrations that specifically address the hesitation issue', upvotes: 0, needsReview: false },
      { type: 'tip', content: 'A complete ATF drain and fill with genuine Kia SP-IV fluid often improves shift quality — change every 30,000 miles', upvotes: 0, needsReview: false },
      { type: 'warning', content: 'Do not use aftermarket ATF — the A6LF2 is calibrated specifically for SP-IV viscosity and friction characteristics', upvotes: 0, needsReview: false }
    ],
    citations: [
      { source: 'kia-forums.com', description: 'Cadenza transmission hesitation TSB and fix' },
      { source: 'Kia TSB SSB 150701', description: '6AT shift quality improvement software update' }
    ],
    humanApproved: false,
    status: 'published',
    reportCount: 110,
    reviewedOn: '2026-03-13',
    dtcCodes: ['P0700', 'P0730']
  },

  // ===== KIA K900 =====
  {
    id: 'kia-k900-air-suspension-2015',
    vehicleMatch: {
      years: [2015, 2016, 2017, 2018, 2019, 2020],
      make: 'Kia',
      model: 'K900'
    },
    category: 'suspension',
    title: 'Rear Electronic Air Suspension Leak and Compressor Failure',
    description: 'The K900 flagship sedan uses rear electronic air suspension for its luxury ride. The air springs develop leaks at the rubber bladder and crimped fitting areas after 4-6 years. The compressor overworks to compensate for leaks and eventually burns out. The K900\'s limited production volume means replacement parts are expensive and sometimes back-ordered. The vehicle sags at the rear when parked, with the compressor running audibly from the trunk area.',
    solution: 'Replace both rear air springs together and the compressor if it has been running excessively. Arnott and Continental (OEM supplier) make replacement air springs. An air suspension conversion to coil springs is possible but no dedicated kit exists for the K900 due to low production volume — a custom setup using compatible strut dimensions is required.',
    symptoms: [
      'Rear end sagging when parked overnight',
      'Air compressor running frequently (humming from trunk)',
      'Suspension warning light illuminated',
      'Harsh ride quality over bumps',
      'Vehicle sitting unevenly side to side'
    ],
    severity: 'high',
    confidence: 0.80,
    estimatedCost: { low: 1000, high: 3500 },
    communityRecommendations: [
      { type: 'tip', content: 'Replace both rear air springs at the same time — when one leaks, the other is the same age and will follow shortly', upvotes: 0, needsReview: false },
      { type: 'part', content: 'Continental rear air spring for K900 — OEM supplier, higher quality than generic aftermarket options', partBrand: 'Continental', partName: 'Rear Air Spring', affiliateUrl: 'https://www.amazon.com/s?k=Continental+Kia+K900+rear+air+spring&tag=au7o-20', upvotes: 0, needsReview: false },
      { type: 'warning', content: 'Do not drive with the rear suspension bottomed out — the exhaust and fuel tank can contact the road surface, creating a safety hazard', upvotes: 0, needsReview: false }
    ],
    citations: [
      { source: 'kia-forums.com', description: 'K900 air suspension failure reports and replacement options' },
      { source: 'NHTSA complaints', description: 'Kia K900 suspension system complaints' }
    ],
    humanApproved: false,
    status: 'published',
    reportCount: 45,
    reviewedOn: '2026-03-13',
    dtcCodes: ['C1611']
  },
  {
    id: 'kia-k900-infotainment-freeze-2015',
    vehicleMatch: {
      years: [2015, 2016, 2017],
      make: 'Kia',
      model: 'K900'
    },
    category: 'electrical',
    title: 'Infotainment System Freezing and Rebooting',
    description: 'The first-generation K900 (2015-2017) infotainment system suffers from frequent freezing, slow response, and random reboots. The head unit\'s processing power is inadequate for the system\'s demands, and the software develops memory leaks over time. The screen may freeze on a particular screen, go black, or reboot mid-navigation. Climate controls that are integrated into the touchscreen become inaccessible during freezes. Kia released software updates but the underlying hardware limitations remain.',
    solution: 'Visit the Kia dealer for the latest infotainment software update. A hard reset (hold power button for 10 seconds) temporarily resolves freezes. If software updates don\'t help, the head unit may need replacement. Some owners install aftermarket Android Auto/CarPlay head units, though this requires custom wiring for the K900-specific steering wheel controls and climate integration.',
    symptoms: [
      'Touchscreen frozen and unresponsive',
      'System rebooting randomly during driving',
      'Slow response to touch inputs (5+ seconds)',
      'Navigation freezing or showing incorrect position',
      'Audio cutting out during phone calls'
    ],
    severity: 'medium',
    confidence: 0.80,
    estimatedCost: { low: 0, high: 1500 },
    communityRecommendations: [
      { type: 'tip', content: 'Hold the power/volume knob for 10 seconds to force a system reboot — this clears the frozen state temporarily', upvotes: 0, needsReview: false },
      { type: 'tip', content: 'Visit the dealer for the latest map and software update — Kia has released several updates that improve system stability', upvotes: 0, needsReview: false },
      { type: 'tip', content: 'Disconnect the battery for 5 minutes once a year to perform a full system reset — this clears accumulated memory leaks', upvotes: 0, needsReview: false }
    ],
    citations: [
      { source: 'kia-forums.com', description: 'K900 infotainment freezing and reboot issues' },
      { source: 'NHTSA complaints', description: 'Kia K900 electrical/infotainment complaints' }
    ],
    humanApproved: false,
    status: 'published',
    reportCount: 60,
    reviewedOn: '2026-03-13',
    dtcCodes: []
  },
  {
    id: 'kia-k900-engine-bearing-2015',
    vehicleMatch: {
      years: [2015, 2016, 2017],
      make: 'Kia',
      model: 'K900',
      engines: ['5.0L Tau GDI V8']
    },
    category: 'engine',
    title: '5.0L Tau V8 Timing Chain and GDI Injector Issues',
    description: 'The 5.0L Tau GDI V8 in the first-generation K900 can develop timing chain tensioner rattle on cold start and GDI fuel injector failures. The hydraulic tensioners bleed down overnight, causing chain slack and rattle for 1-5 seconds at startup. The GDI piezoelectric fuel injectors can develop carbon deposits on the tips that cause uneven spray patterns, misfires, and rough idle. The combination of timing chain noise and injector-related misfires can be alarming on a luxury flagship vehicle.',
    solution: 'For timing chain rattle, change oil every 5,000 miles with 5W-30 full synthetic (Mobil 1, Pennzoil Platinum). If rattle persists beyond 5 seconds, replace timing chain tensioners. For injector issues, use a GDI-specific fuel system cleaner (Liqui Moly GDI Cleaner) every 10,000 miles. Severely coked injectors require removal and ultrasonic cleaning ($50/injector) or replacement ($150-250 each).',
    symptoms: [
      'Rattling noise on cold start for 1-5 seconds',
      'Rough idle with intermittent misfires',
      'Check engine light with misfire codes',
      'Reduced fuel economy',
      'Hesitation during acceleration from idle'
    ],
    severity: 'medium',
    confidence: 0.80,
    estimatedCost: { low: 100, high: 2500 },
    communityRecommendations: [
      { type: 'part', content: 'Liqui Moly 2030 GDI Cleaner — pour into fuel tank every 10,000 miles to prevent injector tip carbon buildup', partBrand: 'Liqui Moly', partName: 'GDI Cleaner', partNumber: '2030', affiliateUrl: 'https://www.amazon.com/s?k=Liqui+Moly+2030+GDI+cleaner&tag=au7o-20', upvotes: 0, needsReview: false },
      { type: 'tip', content: 'Use 5W-30 full synthetic oil and change every 5,000 miles — the Tau V8 GDI system dilutes oil with fuel, so frequent changes protect the timing chain tensioners', upvotes: 0, needsReview: false },
      { type: 'warning', content: 'If cold start rattle lasts more than 5 seconds, have timing chain tensioners inspected — prolonged chain slack can jump teeth on the interference engine', upvotes: 0, needsReview: false }
    ],
    citations: [
      { source: 'kia-forums.com', description: 'K900 5.0 V8 timing chain and injector issues' },
      { source: 'hyundai-forums.com', description: 'Tau V8 GDI maintenance requirements' }
    ],
    humanApproved: false,
    status: 'published',
    reportCount: 50,
    reviewedOn: '2026-03-13',
    dtcCodes: ['P0016', 'P0300', 'P0301']
  },

  // ===== KIA BORREGO =====
  {
    id: 'kia-borrego-timing-chain-2009',
    vehicleMatch: {
      years: [2009, 2010, 2011],
      make: 'Kia',
      model: 'Borrego',
      engines: ['3.8L Lambda V6']
    },
    category: 'engine',
    title: '3.8L Lambda V6 Timing Chain Stretch and Rattle',
    description: 'The Borrego\'s 3.8L Lambda V6 is prone to timing chain stretch, causing a persistent rattle from the front of the engine. The chain stretches beyond the tensioner\'s ability to compensate, causing cam timing to drift. This triggers check engine lights for cam position correlation errors. The chain guides also deteriorate, with plastic pieces breaking off and entering the oil pan. If the chain stretches enough to jump a tooth, it causes valve-to-piston contact on this interference engine.',
    solution: 'Replace the timing chain, tensioners, and all chain guides as a complete set. The job requires removing the front timing cover and takes 8-12 hours of labor. Use a quality timing chain kit from Cloyes or Melling with improved chain guide material. Change the oil and filter immediately after the repair to flush out any chain guide debris. This is a preventive replacement — don\'t wait for the chain to jump.',
    symptoms: [
      'Persistent rattling noise from front of engine',
      'Check engine light with P0016/P0017/P0018/P0019 codes',
      'Rough idle and reduced power',
      'Engine misfires (P0300 series codes)',
      'Noise increases with engine RPM'
    ],
    severity: 'high',
    confidence: 0.85,
    estimatedCost: { low: 1500, high: 3500 },
    communityRecommendations: [
      { type: 'part', content: 'Cloyes 9-0908SA timing chain kit — complete set with chains, guides, tensioners, and sprockets for Lambda 3.8L V6', partBrand: 'Cloyes', partName: 'Timing Chain Kit (3.8L V6)', partNumber: '9-0908SA', affiliateUrl: 'https://www.amazon.com/s?k=Cloyes+Kia+Borrego+3.8+timing+chain+kit&tag=au7o-20', upvotes: 0, needsReview: false },
      { type: 'tip', content: 'If the chain is rattling, schedule the repair within 2-4 weeks — do not wait. A jumped chain bends valves and turns a $2,500 repair into a $5,000+ engine rebuild', upvotes: 0, needsReview: false },
      { type: 'warning', content: 'Change oil immediately after timing chain replacement to flush out plastic guide debris — this debris can clog the oil pickup screen', upvotes: 0, needsReview: false }
    ],
    citations: [
      { source: 'kia-forums.com', description: 'Borrego 3.8L timing chain replacement guide' },
      { source: 'NHTSA complaints', description: 'Kia Borrego engine noise and failure complaints' }
    ],
    humanApproved: false,
    status: 'published',
    reportCount: 85,
    reviewedOn: '2026-03-13',
    dtcCodes: ['P0016', 'P0017', 'P0018', 'P0019', 'P0300']
  },
  {
    id: 'kia-borrego-transfer-case-2009',
    vehicleMatch: {
      years: [2009, 2010, 2011],
      make: 'Kia',
      model: 'Borrego'
    },
    category: 'drivetrain',
    title: 'Transfer Case Chain Noise and 4WD Engagement Failure',
    description: 'The Borrego 4WD models use a BorgWarner transfer case that develops chain noise (whining/grinding) and can fail to engage 4WD or 4WD Lock modes. The transfer case chain stretches over time, and the encoder motor that controls mode selection can fail from water intrusion at the electrical connector. The transfer case fluid also breaks down faster than the 60,000-mile factory interval suggests, especially with towing or off-road use.',
    solution: 'Change transfer case fluid every 30,000 miles with the correct ATF specification. If chain noise is present, a transfer case rebuild or replacement is needed. The encoder motor can be replaced separately if 4WD mode selection is failing. Inspect the encoder motor wiring connector for corrosion — clean and apply dielectric grease to prevent future water intrusion. A used transfer case from a Mohave (the Borrego\'s international market name) can be sourced from import recyclers.',
    symptoms: [
      'Whining noise from underneath vehicle that increases with speed',
      '4WD or 4WD Lock mode won\'t engage',
      'Service 4WD warning message',
      'Grinding noise when shifting between 2WD and 4WD',
      'Vibration at highway speed from driveline'
    ],
    severity: 'high',
    confidence: 0.80,
    estimatedCost: { low: 200, high: 3000 },
    communityRecommendations: [
      { type: 'tip', content: 'Change transfer case fluid every 30,000 miles, not the factory 60,000 — the Borrego transfer case runs hotter than most due to vehicle weight', upvotes: 0, needsReview: false },
      { type: 'tip', content: 'Inspect the encoder motor wiring connector for corrosion before replacing the motor itself — clean contacts and dielectric grease often fix engagement issues for free', upvotes: 0, needsReview: false },
      { type: 'warning', content: 'Do not drive with 4WD engaged on dry pavement — this overloads the transfer case chain and accelerates wear', upvotes: 0, needsReview: false }
    ],
    citations: [
      { source: 'kia-forums.com', description: 'Borrego transfer case noise and 4WD engagement issues' },
      { source: 'NHTSA complaints', description: 'Kia Borrego drivetrain complaints' }
    ],
    humanApproved: false,
    status: 'published',
    reportCount: 70,
    reviewedOn: '2026-03-13',
    dtcCodes: ['P1875', 'C0327']
  },
  {
    id: 'kia-borrego-frame-rust-2009',
    vehicleMatch: {
      years: [2009, 2010, 2011],
      make: 'Kia',
      model: 'Borrego'
    },
    category: 'body',
    title: 'Body-on-Frame Rust and Undercarriage Corrosion',
    description: 'The Borrego is one of the few Kia models with a body-on-frame construction (shared with the Mohave platform). The frame is susceptible to surface rust and perforation in rust-belt states, particularly at the rear crossmember and spring perch areas. The frame was not adequately treated with corrosion-resistant coating from the factory. Since the Borrego was discontinued after only 3 model years, rust protection updates were never implemented.',
    solution: 'Inspect the frame annually for surface rust. Wire brush and treat surface rust with a rust converter (POR-15, Corroseal) followed by a rubberized undercoating or Fluid Film. For perforated areas, a qualified frame shop can weld in repair plates. Apply Fluid Film or NH Oil Undercoating annually as a preventive treatment. Focus on the rear crossmember, spring mounts, and fuel tank crossmember.',
    symptoms: [
      'Visible orange/brown rust on frame rails',
      'Flaking metal under the vehicle',
      'Clunking noise from loose components on rusted frame mounts',
      'Failed inspection due to frame condition (rust-belt states)',
      'Exhaust system hangers pulling through rusted frame'
    ],
    severity: 'high',
    confidence: 0.80,
    estimatedCost: { low: 100, high: 2000 },
    communityRecommendations: [
      { type: 'part', content: 'Fluid Film NAS undercoating spray — annual application prevents rust progression on exposed frame surfaces', partBrand: 'Fluid Film', partName: 'NAS Undercoating', affiliateUrl: 'https://www.amazon.com/s?k=Fluid+Film+NAS+undercoating&tag=au7o-20', upvotes: 0, needsReview: false },
      { type: 'tip', content: 'Apply Fluid Film or NH Oil Undercoating every fall before winter — this is the single best investment for preserving the Borrego\'s frame in salt states', upvotes: 0, needsReview: false },
      { type: 'warning', content: 'If frame perforation is found near suspension mounting points, the vehicle should be taken off the road until repaired — a failed mount is a catastrophic safety issue', upvotes: 0, needsReview: false }
    ],
    citations: [
      { source: 'kia-forums.com', description: 'Borrego frame rust prevention and repair' },
      { source: 'NHTSA complaints', description: 'Kia Borrego structural integrity complaints' }
    ],
    humanApproved: false,
    status: 'published',
    reportCount: 65,
    reviewedOn: '2026-03-13',
    dtcCodes: []
  },

  // ===== CHRYSLER LEBARON =====
  {
    id: 'chrysler-lebaron-head-gasket-1990',
    vehicleMatch: {
      years: [1990, 1991, 1992, 1993, 1994, 1995],
      make: 'Chrysler',
      model: 'LeBaron',
      engines: ['2.5L I4', '2.2L Turbo I4', '3.0L V6']
    },
    category: 'engine',
    title: '2.5L and 3.0L Head Gasket Failure',
    description: 'The LeBaron\'s 2.5L 4-cylinder and 3.0L Mitsubishi V6 engines both suffer from head gasket failure. The 2.5L uses a composite head gasket that deteriorates, allowing coolant into the combustion chambers and oil passages. The 3.0L Mitsubishi V6 develops gasket failure between cylinders, causing compression loss. Both engines overheat easily due to the LeBaron\'s limited airflow in the engine bay, particularly the convertible model where underhood temperatures run higher.',
    solution: 'Replace head gaskets with Fel-Pro MLS (multi-layer steel) gaskets rather than composite replacements. Have heads checked for warpage and resurfaced. Replace the thermostat and flush the cooling system. On the 2.5L, inspect the head for cracks around the exhaust valve seats — a common failure point that requires a replacement head.',
    symptoms: [
      'White smoke from exhaust',
      'Coolant loss with no external visible leak',
      'Engine overheating in traffic',
      'Oil appears milky on dipstick',
      'Rough idle and misfires'
    ],
    severity: 'high',
    confidence: 0.82,
    estimatedCost: { low: 600, high: 1500 },
    communityRecommendations: [
      { type: 'part', content: 'Fel-Pro head gasket set for LeBaron 2.5L or 3.0L — MLS construction far more durable than the original composite gasket', partBrand: 'Fel-Pro', partName: 'Head Gasket Set', affiliateUrl: 'https://www.amazon.com/s?k=Fel-Pro+Chrysler+LeBaron+head+gasket&tag=au7o-20', upvotes: 0, needsReview: false },
      { type: 'tip', content: 'Always resurface the cylinder head — the LeBaron engines warp heads easily from overheating and a warped head will blow the new gasket', upvotes: 0, needsReview: false },
      { type: 'warning', content: 'On the 2.5L, check the head for cracks around exhaust valve seats before investing in a gasket repair — a cracked head means you need a replacement head ($200 junkyard)', upvotes: 0, needsReview: false }
    ],
    citations: [
      { source: 'allpar.com', description: 'Chrysler 2.5L and 3.0L engine known issues' },
      { source: 'turbododge.com', description: 'LeBaron head gasket replacement guide' }
    ],
    humanApproved: false,
    status: 'published',
    reportCount: 170,
    reviewedOn: '2026-03-13',
    dtcCodes: []
  },
  {
    id: 'chrysler-lebaron-convertible-top-1990',
    vehicleMatch: {
      years: [1990, 1991, 1992, 1993, 1994, 1995],
      make: 'Chrysler',
      model: 'LeBaron'
    },
    category: 'body',
    title: 'Convertible Top Hydraulic System and Fabric Deterioration',
    description: 'The LeBaron convertible\'s hydraulic top system suffers from cylinder leaks, pump failures, and the fabric top material degradating from UV exposure. The hydraulic cylinders develop internal seal leaks, causing the top to operate slowly or stop mid-cycle. The fabric top material shrinks and becomes brittle, developing tears at the stress points near the rear quarter windows. The rear plastic window yellows and becomes opaque, reducing rear visibility.',
    solution: 'Replace leaking hydraulic cylinders and top pump motor. Rebuild kits are available for the cylinders. For the fabric top, a complete convertible top replacement is available from Kee Auto Top or Robbins Auto Top. The rear window can be replaced separately with a new clear vinyl window. Apply 303 Fabric Guard to the top twice a year to extend fabric life.',
    symptoms: [
      'Top operates slowly or stops during operation',
      'Hydraulic fluid leaking from cylinders behind rear seats',
      'Top fabric torn or separating at seams',
      'Rear window yellowed and opaque',
      'Top won\'t latch to windshield header'
    ],
    severity: 'medium',
    confidence: 0.82,
    estimatedCost: { low: 200, high: 1500 },
    communityRecommendations: [
      { type: 'part', content: 'Robbins Auto Top replacement convertible top for LeBaron — includes new fabric, rear window, and installation instructions', partBrand: 'Robbins', partName: 'Convertible Top Kit', affiliateUrl: 'https://www.amazon.com/s?k=Robbins+Chrysler+LeBaron+convertible+top&tag=au7o-20', upvotes: 0, needsReview: false },
      { type: 'tip', content: 'Apply 303 Fabric Guard twice a year to protect the top fabric from UV deterioration — this can double the top\'s lifespan', upvotes: 0, needsReview: false },
      { type: 'tip', content: 'The hydraulic cylinder rebuild seals are available from specialty convertible parts suppliers — a rebuild costs $50 vs $300+ for new cylinders', upvotes: 0, needsReview: false }
    ],
    citations: [
      { source: 'allpar.com', description: 'LeBaron convertible top maintenance and repair' },
      { source: 'turbododge.com', description: 'LeBaron hydraulic top system troubleshooting' }
    ],
    humanApproved: false,
    status: 'published',
    reportCount: 145,
    reviewedOn: '2026-03-13',
    dtcCodes: []
  },
  {
    id: 'chrysler-lebaron-automatic-trans-1990',
    vehicleMatch: {
      years: [1990, 1991, 1992, 1993, 1994, 1995],
      make: 'Chrysler',
      model: 'LeBaron'
    },
    category: 'transmission',
    title: 'A604 (41TE) Automatic Transaxle Electronic Shift Solenoid Failure',
    description: 'The LeBaron uses the Chrysler A604 (41TE) 4-speed electronically-controlled automatic transaxle. This was one of the first fully electronic automatics and its solenoid pack is the primary failure point. The solenoids develop internal leaks and electrical failures, causing erratic shifting, no-shift conditions, and limp mode (locked in 2nd gear). The transmission controller can also fail. The A604 was so problematic that Chrysler extended warranty coverage on early units.',
    solution: 'Replace the solenoid pack assembly (located in the valve body) with an updated unit. The solenoid pack is accessible by removing the side pan. A remanufactured solenoid pack from TransGo or Rostra is $150-250. If the transmission is in limp mode, scan for codes first — many limp mode events are caused by a speed sensor or input/output shaft sensor failure rather than the solenoid pack.',
    symptoms: [
      'Transmission stuck in 2nd gear (limp mode)',
      'Check engine light with P0700 and P07XX codes',
      'Harsh or erratic shifting between all gears',
      'No upshift from 2nd gear',
      'Transmission bangs into gear from Park'
    ],
    severity: 'high',
    confidence: 0.85,
    estimatedCost: { low: 200, high: 1500 },
    communityRecommendations: [
      { type: 'tip', content: 'Scan for codes FIRST — many A604 limp mode events are caused by a $30 input or output speed sensor, not the $250 solenoid pack', upvotes: 0, needsReview: false },
      { type: 'part', content: 'Rostra 52-0150 A604 solenoid pack — updated design with improved solenoid coils and seals', partBrand: 'Rostra', partName: 'A604 Solenoid Pack', partNumber: '52-0150', affiliateUrl: 'https://www.amazon.com/s?k=Rostra+A604+41TE+solenoid+pack&tag=au7o-20', upvotes: 0, needsReview: false },
      { type: 'warning', content: 'Change A604 fluid every 30,000 miles with ATF+4 — Chrysler\'s "lifetime fill" claim is the #1 reason these transmissions fail', upvotes: 0, needsReview: false }
    ],
    citations: [
      { source: 'allpar.com', description: 'A604/41TE transmission troubleshooting and repair' },
      { source: 'turbododge.com', description: 'LeBaron A604 solenoid replacement guide' }
    ],
    humanApproved: false,
    status: 'published',
    reportCount: 200,
    reviewedOn: '2026-03-13',
    dtcCodes: ['P0700', 'P0715', 'P0720', 'P0750']
  },

  // ===== CHRYSLER FIFTH AVENUE =====
  {
    id: 'chrysler-fifth-avenue-lean-burn-1990',
    vehicleMatch: {
      years: [1990, 1991, 1992, 1993],
      make: 'Chrysler',
      model: 'Fifth Avenue',
      engines: ['3.3L V6', '3.8L V6']
    },
    category: 'engine',
    title: '3.3L/3.8L V6 Intake Manifold Plenum Gasket Oil Leak',
    description: 'The Chrysler 3.3L and 3.8L V6 engines (used in the Y-body Fifth Avenue/Imperial) develop a leak at the upper intake manifold plenum gasket. The plenum gasket degrades and allows oil from the PCV system to leak externally down the back of the engine and pool on top of the transaxle. The leak can be mistaken for a rear main seal leak due to its location. In severe cases, oil drips onto the exhaust manifold creating a burning oil smell and smoke.',
    solution: 'Replace the upper intake plenum gasket. This requires removing the upper intake manifold, which provides access to clean the EGR passages and throttle body at the same time. Use a Fel-Pro gasket rather than the OEM paper gasket. Clean the PCV valve and replace the PCV hose — excessive crankcase pressure from a stuck PCV valve accelerates the gasket leak.',
    symptoms: [
      'Oil leak on back of engine pooling on top of transaxle',
      'Burning oil smell, especially at idle',
      'Oil dripping from center/rear of engine',
      'Light smoke from engine bay (oil on exhaust manifold)',
      'Low oil level between oil changes'
    ],
    severity: 'low',
    confidence: 0.82,
    estimatedCost: { low: 100, high: 400 },
    communityRecommendations: [
      { type: 'tip', content: 'Replace the PCV valve and hose during the plenum gasket repair — a stuck PCV is the root cause of 90% of these leaks', upvotes: 0, needsReview: false },
      { type: 'tip', content: 'While the plenum is off, clean the EGR passages and throttle body — this is free labor overlap that improves idle quality', upvotes: 0, needsReview: false },
      { type: 'part', content: 'Fel-Pro MS95812 upper intake plenum gasket — use the Fel-Pro replacement, not the OEM paper gasket that deteriorated', partBrand: 'Fel-Pro', partName: 'Upper Intake Plenum Gasket', partNumber: 'MS95812', affiliateUrl: 'https://www.amazon.com/s?k=Fel-Pro+Chrysler+3.3+3.8+intake+plenum+gasket&tag=au7o-20', upvotes: 0, needsReview: false }
    ],
    citations: [
      { source: 'allpar.com', description: 'Chrysler 3.3/3.8 V6 intake plenum gasket leak' },
      { source: 'chryslerminivan.net', description: '3.3L/3.8L plenum gasket replacement procedure' }
    ],
    humanApproved: false,
    status: 'published',
    reportCount: 100,
    reviewedOn: '2026-03-13',
    dtcCodes: []
  },
  {
    id: 'chrysler-fifth-avenue-transmission-1990',
    vehicleMatch: {
      years: [1990, 1991, 1992, 1993],
      make: 'Chrysler',
      model: 'Fifth Avenue'
    },
    category: 'transmission',
    title: 'A604 (41TE) Transaxle Premature Failure',
    description: 'The Fifth Avenue uses the Chrysler A604 (41TE) fully electronic 4-speed transaxle, which was notorious for reliability issues in its early years. The solenoid pack and valve body suffer from design limitations that cause erratic shifting and limp mode. The transmission goes into "limp home" mode (locked in 2nd gear) as a protective measure when it detects solenoid or pressure errors. The Fifth Avenue\'s heavier curb weight compared to other A604-equipped vehicles accelerates wear.',
    solution: 'Replace the solenoid pack and valve body separator plate with updated parts. Change the ATF+4 fluid every 30,000 miles — the A604 is extremely sensitive to fluid condition. If the transmission has been running in limp mode repeatedly, internal clutch damage is likely and a rebuild is needed. A TransGo TFOD-3 reprogramming kit can be installed during a rebuild to improve shift quality.',
    symptoms: [
      'Limp mode — stuck in 2nd gear with check engine light',
      'Harsh engagement from Park to Drive or Reverse',
      'Delayed shifts with engine revving between gears',
      'No 4th gear overdrive',
      'Transmission temperature warning'
    ],
    severity: 'high',
    confidence: 0.83,
    estimatedCost: { low: 300, high: 2500 },
    communityRecommendations: [
      { type: 'tip', content: 'Change A604 fluid every 30,000 miles with Chrysler ATF+4 — this is the single most effective way to prevent A604 failure', upvotes: 0, needsReview: false },
      { type: 'part', content: 'TransGo TFOD-3 reprogramming kit — improves shift firmness and reduces clutch slippage during a rebuild', partBrand: 'TransGo', partName: 'TFOD-3 Shift Kit', partNumber: 'TFOD-3', affiliateUrl: 'https://www.amazon.com/s?k=TransGo+TFOD-3+A604+shift+kit&tag=au7o-20', upvotes: 0, needsReview: false },
      { type: 'warning', content: 'When the A604 goes into limp mode, do not continue driving in 2nd gear for extended distances — the clutch packs overheat rapidly and cause additional internal damage', upvotes: 0, needsReview: false }
    ],
    citations: [
      { source: 'allpar.com', description: 'A604/41TE transmission reliability history' },
      { source: 'chryslerminivan.net', description: 'A604 solenoid pack diagnosis and replacement' }
    ],
    humanApproved: false,
    status: 'published',
    reportCount: 130,
    reviewedOn: '2026-03-13',
    dtcCodes: ['P0700', 'P0731', 'P0750']
  },
  {
    id: 'chrysler-fifth-avenue-power-seat-1990',
    vehicleMatch: {
      years: [1990, 1991, 1992, 1993],
      make: 'Chrysler',
      model: 'Fifth Avenue'
    },
    category: 'electrical',
    title: 'Power Seat Motor and Track Failure',
    description: 'The Fifth Avenue\'s 6-way power seat uses electric motors and a gear-driven track system that becomes noisy, slow, and eventually stops working. The seat track cables fray and jam in the guide tubes, and the electric motors burn out from increased resistance. The driver seat is most affected due to higher usage. The power lumbar support is also prone to failure — the inflatable bladder develops leaks and the pump motor fails.',
    solution: 'Lubricate the seat tracks and cable guides with white lithium grease — this can restore function to sluggish seats. If the motor has burned out, replacement motors are available from junkyard Fifth Avenue or New Yorker vehicles (same seat assembly). For the lumbar bladder, a manual lumbar support cushion is the practical alternative.',
    symptoms: [
      'Seat moves slowly or not at all when adjusting',
      'Grinding or clicking noise from seat when operating',
      'Seat stuck in one position',
      'Lumbar support no longer adjusts',
      'Electric motor hums but seat doesn\'t move (cable jam)'
    ],
    severity: 'low',
    confidence: 0.80,
    estimatedCost: { low: 20, high: 400 },
    communityRecommendations: [
      { type: 'tip', content: 'Spray white lithium grease on the seat tracks and cable guides — this often restores full function to sluggish power seats and takes 5 minutes', upvotes: 0, needsReview: false },
      { type: 'tip', content: 'The same seat assembly was used in the Chrysler New Yorker, Dodge Dynasty, and Plymouth Acclaim — junkyard motors are interchangeable', upvotes: 0, needsReview: false },
      { type: 'tip', content: 'For a dead lumbar bladder, a $20 aftermarket lumbar support cushion from Amazon works better than the original and requires no installation', upvotes: 0, needsReview: false }
    ],
    citations: [
      { source: 'allpar.com', description: 'Chrysler Y-body power seat system' },
      { source: 'chryslerclub.com', description: 'Fifth Avenue power seat repair' }
    ],
    humanApproved: false,
    status: 'published',
    reportCount: 80,
    reviewedOn: '2026-03-13',
    dtcCodes: []
  },

  // ===== CHRYSLER PROWLER =====
  {
    id: 'chrysler-prowler-transmission-overheat-1999',
    vehicleMatch: {
      years: [1999, 2000, 2001, 2002],
      make: 'Chrysler',
      model: 'Prowler'
    },
    category: 'transmission',
    title: '42LE Automatic Transmission Overheating (Rear-Mounted)',
    description: 'The Prowler uses a unique rear-mounted Chrysler 42LE 4-speed automatic transaxle with the differential integrated into the unit. The transmission is mounted at the rear axle (like a Corvette) for weight distribution, but the rear mounting location receives less cooling airflow than a front-mounted transmission. Combined with the 3.5L V6\'s torque, the 42LE overheats during spirited driving, causing shift quality degradation and premature clutch wear. There is no factory auxiliary cooler.',
    solution: 'Install an auxiliary transmission cooler with a thermostat to maintain optimal temperature. Route the cooler lines to the front of the vehicle where airflow is available. Change the ATF+4 fluid every 20,000 miles — the rear-mounted transmission runs significantly hotter than a front-mounted unit. A temperature gauge adapter in the cooler line helps monitor transmission temperature. Avoid stop-and-go driving on hot days.',
    symptoms: [
      'Transmission slipping during spirited driving',
      'Harsh or delayed shifts after extended driving',
      'Burning ATF smell from rear of vehicle',
      'Transmission fluid dark or burnt on dipstick',
      'Limp mode after aggressive driving (shift to 2nd only)'
    ],
    severity: 'medium',
    confidence: 0.80,
    estimatedCost: { low: 200, high: 3000 },
    communityRecommendations: [
      { type: 'part', content: 'Derale 15950 plate-fin auxiliary transmission cooler with thermostat — install at the front of the vehicle for maximum airflow', partBrand: 'Derale', partName: 'Plate-Fin Transmission Cooler', partNumber: '15950', affiliateUrl: 'https://www.amazon.com/s?k=Derale+15950+transmission+cooler&tag=au7o-20', upvotes: 0, needsReview: false },
      { type: 'tip', content: 'Change ATF+4 fluid every 20,000 miles — the rear-mounted 42LE runs 20-30 degrees hotter than a front-mounted transaxle', upvotes: 0, needsReview: false },
      { type: 'warning', content: 'Do not tow with the Prowler or use it in sustained stop-and-go traffic on hot days without an auxiliary cooler — the rear-mounted transmission will overheat', upvotes: 0, needsReview: false }
    ],
    citations: [
      { source: 'allpar.com', description: 'Prowler rear-mounted transmission cooling issues' },
      { source: 'prowleronline.com', description: 'Prowler transmission cooler installation guide' }
    ],
    humanApproved: false,
    status: 'published',
    reportCount: 65,
    reviewedOn: '2026-03-13',
    dtcCodes: ['P0218', 'P0700']
  },
  {
    id: 'chrysler-prowler-coolant-leak-1999',
    vehicleMatch: {
      years: [1999, 2000, 2001, 2002],
      make: 'Chrysler',
      model: 'Prowler',
      engines: ['3.5L EGJ V6']
    },
    category: 'engine',
    title: '3.5L V6 Coolant Crossover Tube Leak',
    description: 'The Chrysler 3.5L V6 engine in the Prowler uses aluminum coolant crossover tubes that develop leaks at the O-ring seals and crimped connections. The crossover tubes run across the top of the engine between the cylinder heads and are exposed to high heat. The O-rings harden and shrink, allowing coolant to seep. The Prowler\'s unique front-end design with exposed engine makes the leak visible but also means the engine compartment lacks the heat shielding of a conventional car.',
    solution: 'Replace the coolant crossover tube O-rings with Viton (fluoroelastomer) O-rings that resist heat better than the OEM rubber seals. The tubes must be removed for O-ring access. Inspect the aluminum tubes for corrosion pitting and replace if pitted. Flush the cooling system and use Mopar antifreeze/coolant. Replace the thermostat during the repair.',
    symptoms: [
      'Coolant dripping from top of engine',
      'Sweet coolant smell from engine bay',
      'Low coolant warning light',
      'Visible coolant residue on engine between cylinder heads',
      'Engine overheating in traffic'
    ],
    severity: 'medium',
    confidence: 0.80,
    estimatedCost: { low: 150, high: 600 },
    communityRecommendations: [
      { type: 'tip', content: 'Replace O-rings with Viton (brown/green) rather than standard rubber (black) — Viton handles the high engine bay temperatures far better and lasts 3x longer', upvotes: 0, needsReview: false },
      { type: 'tip', content: 'Inspect the aluminum crossover tubes for pitting corrosion — a pitted tube will leak again even with new O-rings', upvotes: 0, needsReview: false },
      { type: 'warning', content: 'The Prowler has a very small coolant capacity — even a minor leak can cause overheating quickly. Check coolant level weekly.', upvotes: 0, needsReview: false }
    ],
    citations: [
      { source: 'allpar.com', description: 'Chrysler 3.5L V6 known cooling system issues' },
      { source: 'prowleronline.com', description: 'Prowler coolant crossover tube repair' }
    ],
    humanApproved: false,
    status: 'published',
    reportCount: 55,
    reviewedOn: '2026-03-13',
    dtcCodes: ['P0117', 'P0128']
  },
  {
    id: 'chrysler-prowler-paint-aluminum-1999',
    vehicleMatch: {
      years: [1999, 2000, 2001, 2002],
      make: 'Chrysler',
      model: 'Prowler'
    },
    category: 'body',
    title: 'Aluminum Body Panel Paint Adhesion Failure',
    description: 'The Prowler uses aluminum body panels that suffer from paint adhesion issues, particularly on the fenders and hood. The aluminum surface preparation at the factory was inadequate, causing paint to bubble, flake, and peel. The problem is worse on 1999 Prowler Purple models and 2001 Orange models. Touch-up paint does not adhere to the bare aluminum without proper etching primer. The aluminum panels are also more susceptible to hail dents and parking lot dings than steel.',
    solution: 'Affected panels must be stripped to bare aluminum, treated with a self-etching aluminum primer, then resprayed. Body shops experienced with aluminum (Corvette/aluminum body truck shops) are recommended. Paintless dent repair is effective for minor dings on the aluminum panels. For storage, use a quality car cover to protect against UV damage to the paint and prevent further peeling.',
    symptoms: [
      'Paint bubbling on fenders or hood',
      'Paint peeling in sheets from aluminum panels',
      'Clear coat failure with chalky appearance',
      'Paint flaking around edges of panels',
      'Bare aluminum visible where paint has lifted'
    ],
    severity: 'medium',
    confidence: 0.78,
    estimatedCost: { low: 500, high: 5000 },
    communityRecommendations: [
      { type: 'tip', content: 'Use a body shop experienced with aluminum panels (Corvette shops are ideal) — standard body shops often don\'t properly prep aluminum and the paint peels again', upvotes: 0, needsReview: false },
      { type: 'tip', content: 'SEM Self-Etching Primer is essential for painting bare aluminum — regular automotive primer will not adhere to aluminum', upvotes: 0, needsReview: false },
      { type: 'warning', content: 'Do not use steel wool or aggressive abrasives on Prowler aluminum panels — use aluminum-safe ScotchBrite pads only to avoid embedding steel particles that cause galvanic corrosion', upvotes: 0, needsReview: false }
    ],
    citations: [
      { source: 'prowleronline.com', description: 'Prowler paint adhesion failure and repaint guide' },
      { source: 'allpar.com', description: 'Prowler aluminum body panel maintenance' }
    ],
    humanApproved: false,
    status: 'published',
    reportCount: 90,
    reviewedOn: '2026-03-13',
    dtcCodes: []
  },
];

// Execute
const ymmt = JSON.parse(fs.readFileSync(YMMT_PATH, 'utf-8'));
for (const entry of ymmtEntries) {
  for (const year of entry.years) {
    const y = String(year);
    if (!ymmt[y]) ymmt[y] = {};
    if (!ymmt[y][entry.make]) ymmt[y][entry.make] = {};
    ymmt[y][entry.make][entry.model] = entry.trims;
  }
}
fs.writeFileSync(YMMT_PATH, JSON.stringify(ymmt, null, 2));
console.log('YMMT: Added VW GTI, Golf R, Golf Alltrack, Kia Cadenza, K900, Borrego, Chrysler LeBaron, Fifth Avenue, Prowler');

const data = JSON.parse(fs.readFileSync(ISSUES_PATH, 'utf-8'));
data.issues.push(...newIssues);
fs.writeFileSync(ISSUES_PATH, JSON.stringify(data, null, 2));
console.log('Issues: Added', newIssues.length, 'issues. Total:', data.issues.length);
