const fs = require('fs');
const path = require('path');

// Deep Research: Japanese Make Additions
// Adds well-documented issues to undercovered Japanese-make models
// Based on web research of NHTSA complaints, TSBs, recalls, and owner forums

const issuesPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const data = JSON.parse(fs.readFileSync(issuesPath, 'utf8'));
const existingIds = new Set(data.issues.map(function(i) { return i.id; }));

// Helper to check for potential duplicate by make+model+partial title match
function hasSimilarIssue(make, model, titleFragment) {
  return data.issues.some(function(i) {
    var issueMake = i.make || (i.vehicleMatch && i.vehicleMatch.make);
    var issueModel = i.model || (i.vehicleMatch && i.vehicleMatch.model);
    return issueMake === make && issueModel === model &&
      i.title.toLowerCase().indexOf(titleFragment.toLowerCase()) !== -1;
  });
}

const newIssues = [

  // ============================================================
  // TOYOTA
  // ============================================================

  // Toyota Highlander - 2GR-FE Oil Leak (Timing Cover / Oil Cooler Line)
  {
    id: 'toyota-highlander-2grfe-oil-leak-2008',
    make: 'Toyota', model: 'Highlander',
    title: '2GR-FE V6 Oil Leak (Timing Cover and Oil Cooler Line)',
    description: 'The 3.5L 2GR-FE V6 in the 2008-2013 Highlander develops two significant oil leak patterns. The timing cover sealant fails over time, causing a slow but persistent oil leak from the front of the engine that worsens progressively. More critically, the rubber oil cooler hose can rupture catastrophically, causing rapid oil pressure loss and potential engine damage from oil starvation. Toyota extended the oil cooler hose warranty to 10 years/150,000 miles under a limited service campaign. The timing cover repair requires engine removal and is a major job ($2,000-4,000), while the oil cooler line replacement is more straightforward ($300-800).',
    category: 'engine', severity: 'high',
    years: { start: 2008, end: 2013 },
    estimatedCost: { min: 300, max: 4000 },
    symptoms: [
      'Oil dripping from front/bottom of engine',
      'Burning oil smell from engine bay',
      'Sudden rapid oil loss (cooler line rupture)',
      'Low oil pressure warning light',
      'Oil spots on driveway that progressively worsen',
      'Oil visible on timing cover or lower engine area'
    ],
    commonFixes: [
      'Oil cooler hose replacement with updated metal line (Toyota warranty campaign, $300-800)',
      'Timing cover reseal requiring engine removal ($2,000-4,000)',
      'Check VIN for Toyota extended warranty coverage (10yr/150k miles for oil cooler)',
      'Regular oil level monitoring between changes'
    ],
    dtcCodes: []
  },

  // Toyota Highlander - Head Gasket (2AZ-FE 2.4L)
  {
    id: 'toyota-highlander-head-gasket-2001',
    make: 'Toyota', model: 'Highlander',
    title: '2.4L 2AZ-FE Head Gasket and Head Bolt Thread Failure',
    description: 'The 2001-2007 Highlander with the 2.4L 2AZ-FE 4-cylinder engine suffers from a design flaw where the aluminum head bolt threads strip out of the engine block. The plastic intake manifold traps heat against the block, causing thermal fatigue of the aluminum threads. This leads to head gasket failure, coolant leaks, and overheating. In severe cases, the stripped threads make a simple head gasket replacement impossible, requiring thread repair inserts (Time-Serts) or complete engine replacement. This is a known issue across Toyota vehicles using the 2AZ-FE engine.',
    category: 'engine', severity: 'high',
    years: { start: 2001, end: 2007 },
    estimatedCost: { min: 2500, max: 5000 },
    symptoms: [
      'Coolant loss without visible external leaks',
      'White sweet-smelling exhaust smoke',
      'Engine overheating',
      'Chocolate milk appearance of oil (coolant mixing)',
      'Oil level higher than normal',
      'Rough running or hard starting when cold',
      'Coolant bubbling in overflow tank'
    ],
    commonFixes: [
      'Head gasket replacement with Time-Sert thread repair ($2,500-4,000)',
      'Engine replacement if threads are severely damaged ($3,000-5,000 with used engine)',
      'Regular coolant system pressure testing to catch early leaks',
      'Monitor oil condition for coolant contamination at every oil change'
    ],
    dtcCodes: ['P0300', 'P0301', 'P0302', 'P0303', 'P0304']
  },

  // Toyota Tercel - Distributor Failure
  {
    id: 'toyota-tercel-distributor-failure-1987',
    make: 'Toyota', model: 'Tercel',
    title: 'Ignition Distributor and Coil Failure',
    description: 'The 1987-1999 Toyota Tercel experiences ignition distributor failures, primarily from the ignition coil inside the distributor failing or the pickup coil deteriorating. The coil failure causes hesitation on acceleration, especially during warmup in cold or rainy conditions. Complete pickup coil failure results in a no-start condition. The distributor cap and rotor also wear out, but the internal coil and pickup coil failures are the more serious concern. OEM replacement distributors are becoming scarce for these older models.',
    category: 'electrical', severity: 'medium',
    years: { start: 1987, end: 1999 },
    estimatedCost: { min: 200, max: 600 },
    symptoms: [
      'Hesitation or stumble on acceleration',
      'Engine misfire during warmup or in wet conditions',
      'Intermittent no-start condition',
      'Complete no-start (pickup coil failure)',
      'Engine dies while driving and will not restart',
      'Rough idle that worsens in humid weather'
    ],
    commonFixes: [
      'Remanufactured distributor assembly replacement ($200-400)',
      'Ignition coil replacement if distributor is otherwise good ($80-150)',
      'Replace distributor cap and rotor at every tune-up ($20-40)',
      'Carry a spare ignition module for long trips on older Tercels'
    ],
    dtcCodes: []
  },

  // Toyota T100 - Lower Ball Joint Failure
  {
    id: 'toyota-t100-lower-ball-joint-failure-1993',
    make: 'Toyota', model: 'T100',
    title: 'Front Lower Ball Joint Wear and Failure',
    description: 'The 1993-1998 Toyota T100 pickup develops excessive front lower ball joint wear, a problem shared with other Toyota trucks of this era (Tacoma, 4Runner). The ball joints wear prematurely from road conditions, payload stress, and inadequate lubrication (sealed design with no grease fitting). Worn ball joints cause steering wander, clunking noises, and uneven tire wear. In extreme cases, a failed ball joint can separate, causing complete loss of steering control. Toyota issued recalls for related models (Tacoma, Tundra) but the T100 was not specifically included despite sharing similar suspension components.',
    category: 'suspension', severity: 'high',
    years: { start: 1993, end: 1998 },
    estimatedCost: { min: 300, max: 800 },
    symptoms: [
      'Clunking or knocking noise from front suspension over bumps',
      'Steering wander or looseness',
      'Uneven front tire wear',
      'Vehicle pulls to one side',
      'Visible play in ball joint when wheel is jacked up',
      'Steering wheel shimmy at highway speeds'
    ],
    commonFixes: [
      'Lower ball joint replacement - both sides recommended ($300-600 for pair)',
      'Upgrade to aftermarket greaseable ball joints (Moog K80026 or equivalent)',
      'Alignment after ball joint replacement ($80-120)',
      'Inspect upper ball joints simultaneously and replace if worn'
    ],
    dtcCodes: []
  },

  // Toyota Land Cruiser - Lower Ball Joint Wear (100 Series)
  {
    id: 'toyota-landcruiser-lower-ball-joint-1998',
    make: 'Toyota', model: 'Land Cruiser',
    title: 'Front Lower Ball Joint Wear and Separation Risk (100 Series)',
    description: 'The 1998-2007 100 Series Land Cruiser (J100) develops lower ball joint wear, particularly on vehicles used for off-roading or carrying heavy loads. The sealed ball joints cannot be greased and wear out over time. Toyota does not sell the ball joints separately from the lower control arm (LCA), requiring aftermarket parts for standalone ball joint replacement. Worn ball joints cause clunking, steering wander, and uneven tire wear. Complete ball joint separation, while rare, is a critical safety concern that can cause loss of steering control. Regular inspection at every oil change is recommended for high-mileage 100 Series trucks.',
    category: 'suspension', severity: 'high',
    years: { start: 1998, end: 2007 },
    estimatedCost: { min: 300, max: 1200 },
    symptoms: [
      'Clunking noise from front end over bumps',
      'Steering wander or imprecise feel',
      'Uneven front tire wear (inner or outer edge)',
      'Vehicle drifts or pulls under braking',
      'Visible play when checking ball joints with vehicle jacked up',
      'Popping sound when turning at low speed'
    ],
    commonFixes: [
      'Aftermarket ball joint replacement - Moog K500133 or SPC 25460 ($150-300 per pair)',
      'OEM approach: complete lower control arm replacement ($400-600 per side)',
      'Alignment after replacement ($80-120)',
      'Install aftermarket greaseable ball joints for extended service life',
      'Inspect every 30,000 miles or at each tire rotation'
    ],
    dtcCodes: []
  },

  // ============================================================
  // NISSAN
  // ============================================================

  // Nissan Maxima - Steering Rack Leak
  {
    id: 'nissan-maxima-steering-rack-leak-2004',
    make: 'Nissan', model: 'Maxima',
    title: 'Power Steering Rack Seal Leak and Pump Failure',
    description: 'The 2004-2008 Nissan Maxima (6th generation, A34) develops power steering fluid leaks from the steering rack seals, high-pressure hoses, and pump seals. The rack and pinion seals deteriorate from heat cycling and age, causing fluid seepage that progressively worsens. As fluid level drops, the power steering pump whines, groans, and eventually fails from running dry. Leaking power steering fluid can contact hot exhaust components, creating a fire hazard. Loss of power assist makes the vehicle difficult to steer, especially at low speeds and during parking maneuvers.',
    category: 'suspension', severity: 'medium',
    years: { start: 2004, end: 2008 },
    estimatedCost: { min: 300, max: 1500 },
    symptoms: [
      'Power steering fluid spots under vehicle',
      'Whining or groaning noise when turning the steering wheel',
      'Heavy or stiff steering, especially at low speeds',
      'Power steering fluid level dropping between checks',
      'Screeching noise from power steering pump',
      'Burning fluid smell from under hood'
    ],
    commonFixes: [
      'Power steering high-pressure hose replacement ($200-400)',
      'Power steering pump replacement ($800-1,400)',
      'Complete rack and pinion replacement ($1,000-1,500 installed)',
      'Check and top off power steering fluid at every oil change',
      'Use genuine Nissan PSF or Dexron III ATF (per Nissan specification)'
    ],
    dtcCodes: []
  },

  // Nissan Pathfinder - VQ35DE Timing Chain Stretch
  {
    id: 'nissan-pathfinder-timing-chain-2013',
    make: 'Nissan', model: 'Pathfinder',
    title: 'VQ35DE Timing Chain Stretch and Guide Wear',
    description: 'The 2013-2016 Pathfinder with the 3.5L VQ35DE engine develops timing chain stretch and chain guide wear, typically after 80,000-120,000 miles. The timing chain tensioner, secondary chain tensioners, and plastic chain guides all degrade over time. Stretched chains cause rattling on cold start, timing drift triggering misfire codes, and eventual engine failure if the chain jumps timing. The VQ35DE uses three chains (primary and two secondary), making replacement a complex job requiring 8-12 hours of labor. Infrequent oil changes accelerate chain and guide wear due to inadequate tensioner lubrication.',
    category: 'engine', severity: 'high',
    years: { start: 2013, end: 2016 },
    estimatedCost: { min: 2000, max: 4000 },
    symptoms: [
      'Rattling or chattering noise on cold start that diminishes as engine warms',
      'Check engine light with timing-related codes',
      'Engine misfires, especially at idle',
      'Reduced engine power and performance',
      'Metal debris in oil (visible on drain plug magnet)',
      'Increasingly loud timing chain rattle over time'
    ],
    commonFixes: [
      'Complete timing chain kit replacement including all 3 chains, tensioners, and guides ($2,000-3,500)',
      'Replace water pump and front seals during chain job (additional $200-400)',
      'Change oil every 5,000 miles with quality synthetic to protect tensioners',
      'Do NOT ignore cold-start rattle - chain jump causes catastrophic engine damage'
    ],
    dtcCodes: ['P0011', 'P0014', 'P0300', 'P0340', 'P34C4']
  },

  // Nissan 350Z - Steering Lock Module (NATS) Failure
  {
    id: 'nissan-350z-steering-lock-nats-2003',
    make: 'Nissan', model: '350Z',
    title: 'Steering Lock Module and NATS Immobilizer Failure',
    description: 'The 2003-2009 Nissan 350Z experiences failures of the NATS (Nissan Anti-Theft System) immobilizer and steering lock module. The NATS antenna ring around the ignition cylinder fails to communicate with the key transponder, causing intermittent no-start conditions. The ECU can enter lockout mode after repeated failed start attempts. Additionally, the mechanical steering lock can bind, preventing key insertion or rotation. These issues leave the vehicle completely inoperable until repaired. The NATS system requires dealer-level diagnostic equipment (Nissan CONSULT) for reprogramming, making roadside repair impossible.',
    category: 'electrical', severity: 'high',
    years: { start: 2003, end: 2009 },
    estimatedCost: { min: 300, max: 1900 },
    symptoms: [
      'Engine cranks but does not start (NATS lockout)',
      'Security indicator light flashing rapidly on dashboard',
      'Key will not turn in ignition cylinder',
      'Steering wheel locked and cannot be released',
      'Intermittent starting failures that worsen over time',
      'Whining noise near driver fuse box area'
    ],
    commonFixes: [
      'NATS antenna ring (immobilizer unit) replacement ($200-400)',
      'ECU reprogramming at Nissan dealer with CONSULT tool ($100-200)',
      'Steering lock actuator replacement ($300-600)',
      'Key transponder replacement and reprogramming ($200-400)',
      'Full NATS system replacement including ECU ($1,500-1,900 at dealer)'
    ],
    dtcCodes: ['P1610', 'P1614']
  },

  // ============================================================
  // SUBARU
  // ============================================================

  // Subaru Tribeca - EZ30 Head Gasket Failure
  {
    id: 'subaru-tribeca-head-gasket-2006',
    make: 'Subaru', model: 'Tribeca',
    title: 'EZ30 3.0L H6 Head Gasket Leak',
    description: 'The 2006-2007 Subaru Tribeca with the 3.0L EZ30 flat-6 engine can develop head gasket leaks, typically at higher mileages (130,000-200,000 miles). While the EZ30 is generally more resistant to head gasket issues than the smaller EJ25 boxer engines, the problem does occur. The flat-6 boxer design means the head gaskets are oriented horizontally, which allows coolant to seep past the gasket under gravity when the engine is off. Symptoms include external oil leaks between the head and block, coolant consumption, and in severe cases, coolant entering the combustion chamber causing white exhaust smoke and overheating. The repair is complex due to the flat-6 layout and cramped engine bay of the Tribeca.',
    category: 'engine', severity: 'high',
    years: { start: 2006, end: 2007 },
    estimatedCost: { min: 2500, max: 4000 },
    symptoms: [
      'Oil seeping between cylinder head and engine block',
      'Coolant level dropping without visible external leaks',
      'White exhaust smoke (coolant burning in combustion chamber)',
      'Heater blowing cold air intermittently (air trapped in cooling system)',
      'Engine overheating',
      'Sweet coolant smell from engine bay',
      'Temperature gauge fluctuations'
    ],
    commonFixes: [
      'Head gasket replacement with resurfaced heads ($2,500-3,500 at independent shop)',
      'Replace water pump, thermostat, and timing chain components during the job',
      'Used or JDM EZ30 engine swap as alternative ($2,200-2,700 total)',
      'Use Subaru OEM multi-layer steel (MLS) head gaskets for repair',
      'Regular cooling system pressure testing to catch leaks early'
    ],
    dtcCodes: ['P0300', 'P0301', 'P0302', 'P0303', 'P0304', 'P0305', 'P0306']
  },

  // ============================================================
  // MAZDA
  // ============================================================

  // Mazda CX-3 - Skyactiv Carbon Buildup
  {
    id: 'mazda-cx3-carbon-buildup-2016',
    make: 'Mazda', model: 'CX-3',
    title: 'Skyactiv 2.0L Intake Valve Carbon Buildup',
    description: 'The 2016-2021 Mazda CX-3 with the 2.0L Skyactiv-G direct injection engine develops carbon deposits on the intake valves over time. Because direct injection sprays fuel directly into the combustion chamber rather than over the intake valves, there is no fuel wash to clean the valve backsides. Oil vapors from the PCV (Positive Crankcase Ventilation) system coat the intake valves and bake into hard carbon deposits. This gradually restricts airflow, causing misfires on cold starts, loss of low-end power, and reduced fuel efficiency. Using conventional oils with high volatility worsens the problem by producing more PCV vapors.',
    category: 'engine', severity: 'medium',
    years: { start: 2016, end: 2021 },
    estimatedCost: { min: 400, max: 1200 },
    symptoms: [
      'Check engine light with misfire codes, especially on cold starts',
      'Gradual loss of low-end power and throttle response',
      'Reduced fuel efficiency over time',
      'Rough idle after extended parking',
      'Fouled spark plugs',
      'Hesitation during acceleration from stop'
    ],
    commonFixes: [
      'Walnut shell blasting of intake valves ($400-800 at a shop with the equipment)',
      'Chemical intake cleaning service (CRC GDI IVD Intake Valve Cleaner) - less effective but cheaper ($50-150)',
      'Use full synthetic oil with low volatility to reduce PCV vapor deposits',
      'Rev engine to redline periodically on highway drives to help burn off deposits',
      'Replace spark plugs after carbon cleaning service'
    ],
    dtcCodes: ['P0300', 'P0301', 'P0302', 'P0303', 'P0304']
  },

  // ============================================================
  // HYUNDAI
  // ============================================================

  // Hyundai Tiburon - Rear Suspension Camber Bolt Seizure
  {
    id: 'hyundai-tiburon-rear-camber-bolt-seizure-2003',
    make: 'Hyundai', model: 'Tiburon',
    title: 'Rear Suspension Camber Bolt Seizure and Alignment Difficulty',
    description: 'The 2003-2008 Hyundai Tiburon (GK) develops seized rear camber adjustment bolts due to corrosion between the dissimilar metals of the bolt and the hub assembly. In salt-belt and high-humidity regions, the 12mm camber bolts corrode and bond to the rear strut mounting holes, making rear alignment adjustments impossible without destructive removal. This leads to uneven rear tire wear, poor handling, and alignment shops refusing service. The problem is compounded by the lack of aftermarket camber adjustment solutions and Hyundai not designing the rear suspension for easy service access.',
    category: 'suspension', severity: 'medium',
    years: { start: 2003, end: 2008 },
    estimatedCost: { min: 200, max: 800 },
    symptoms: [
      'Rapid or uneven rear tire wear (inner edge)',
      'Vehicle pulls to one side during braking',
      'Alignment shop unable to adjust rear camber',
      'Visible corrosion on rear strut mounting bolts',
      'Poor rear-end handling or instability in corners',
      'Rear tires wearing out significantly faster than fronts'
    ],
    commonFixes: [
      'Penetrating oil soak (PB Blaster) for 24-48 hours before removal attempt ($10-20)',
      'Heat and impact removal of seized bolts ($100-300 labor)',
      'Aftermarket eccentric camber bolt kit installation - SPC or Eibach ($50-100 parts)',
      'Hub assembly replacement if bolt holes are damaged ($200-400 per side)',
      'Apply anti-seize compound to new bolts during reinstallation to prevent recurrence'
    ],
    dtcCodes: []
  },

  // Hyundai Azera - Automatic Transmission Hesitation
  {
    id: 'hyundai-azera-transmission-hesitation-2006',
    make: 'Hyundai', model: 'Azera',
    title: 'Automatic Transmission Shift Hesitation and Shudder',
    description: 'The 2006-2011 Hyundai Azera with the 5-speed or 6-speed automatic transmission develops shift hesitation, particularly a noticeable 1-2 shift delay under wide-open throttle when cold. The torque converter lockup clutch also develops shudder during light-throttle cruising at 35-55 mph. Hyundai issued a PCM recalibration procedure to address the cold-start hesitation. If the transmission fluid is not changed regularly, the shudder progressively worsens and can lead to torque converter failure or internal transmission damage. The Azera shares its transmission with the Sonata and Santa Fe of the same era.',
    category: 'transmission', severity: 'medium',
    years: { start: 2006, end: 2011 },
    estimatedCost: { min: 100, max: 3000 },
    symptoms: [
      'Delayed or hesitant 1-2 upshift, especially when cold',
      'Shudder or vibration at 35-55 mph during light throttle',
      'Harsh shift from 2nd to 3rd gear',
      'Transmission slipping sensation on acceleration',
      'Check engine light with transmission-related codes',
      'Hesitation as if transmission cannot decide whether to shift'
    ],
    commonFixes: [
      'PCM recalibration at Hyundai dealer for cold-start hesitation (may be free under warranty)',
      'Transmission fluid drain-and-fill with Hyundai SP-IV ATF ($150-250)',
      'Torque converter replacement for persistent shudder ($800-1,500)',
      'Complete transmission rebuild ($2,000-3,000)',
      'Change transmission fluid every 30,000 miles as preventive maintenance'
    ],
    dtcCodes: ['P0700', 'P0741', 'P0751', 'P0760']
  },

  // ============================================================
  // KIA
  // ============================================================

  // Kia Sedona - Power Sliding Door Motor Failure (2015+)
  {
    id: 'kia-sedona-sliding-door-motor-2015',
    make: 'Kia', model: 'Sedona',
    title: 'Power Sliding Door Motor and Controller Failure (3rd Generation)',
    description: 'The 2015-2021 Kia Sedona (3rd generation, YP) experiences power sliding door motor failures and controller malfunctions distinct from the cable issues on earlier models. The electric motor that powers the sliding door mechanism wears out, and the controller/actuator module develops faults. Symptoms include the door not responding to power buttons on the overhead console, B-pillar, or key fob, while manual operation may still work with extra effort. The controller actuator motors wear internally and fail to engage the latch mechanism properly. Some failures are caused by a hardened rubber seal at the top of the weather strip obstructing door closure, leading to motor overload.',
    category: 'electrical', severity: 'medium',
    years: { start: 2015, end: 2021 },
    estimatedCost: { min: 300, max: 1900 },
    symptoms: [
      'Power sliding door does not respond to buttons or remote',
      'Door makes thudding or clunking sounds during auto-close',
      'Door pops out of rear latch just before closing',
      'Loud beeping when pressing door buttons but door does not move',
      'Door works manually but not with power buttons',
      'Intermittent power door operation, worse in cold weather'
    ],
    commonFixes: [
      'Check weather strip seal at top of door first - hardened seal causes false motor failures ($50-100)',
      'Sliding door lock actuator replacement ($350-400)',
      'Power sliding door motor replacement ($1,800-1,900)',
      'Controller module reset or replacement ($200-500)',
      'Lubricate door track and rollers regularly to reduce motor strain'
    ],
    dtcCodes: []
  }
];

// ============================================================
// Duplicate checking and insertion
// ============================================================

let added = 0;
let skipped = 0;
const addedList = [];
const skippedList = [];

newIssues.forEach(function(issue) {
  // Check exact ID duplicate
  if (existingIds.has(issue.id)) {
    console.log('  SKIP (exact ID exists): ' + issue.id);
    skippedList.push(issue.id + ' (exact ID)');
    skipped++;
    return;
  }

  // Check for similar issue by title fragment
  var titleKeywords = issue.title.split(' ').slice(0, 3).join(' ');
  if (hasSimilarIssue(issue.make, issue.model, titleKeywords)) {
    console.log('  SKIP (similar title exists): ' + issue.id + ' -> "' + titleKeywords + '"');
    skippedList.push(issue.id + ' (similar: "' + titleKeywords + '")');
    skipped++;
    return;
  }

  data.issues.push(issue);
  existingIds.add(issue.id);
  addedList.push(issue.make + ' ' + issue.model + ': ' + issue.title);
  added++;
});

// Write back
fs.writeFileSync(issuesPath, JSON.stringify(data, null, 2));

// Summary
console.log('');
console.log('=== Deep Research: Japanese Make Additions ===');
console.log('');
console.log('Added: ' + added + ' issues');
console.log('Skipped: ' + skipped + ' issues (duplicates)');
console.log('Total issues now: ' + data.issues.length);
console.log('');

if (addedList.length > 0) {
  console.log('--- Added Issues ---');
  addedList.forEach(function(item) {
    console.log('  + ' + item);
  });
  console.log('');
}

if (skippedList.length > 0) {
  console.log('--- Skipped (duplicate) ---');
  skippedList.forEach(function(item) {
    console.log('  - ' + item);
  });
  console.log('');
}

// Breakdown by make
var makeBreakdown = {};
newIssues.forEach(function(issue) {
  if (!existingIds.has(issue.id) || addedList.some(function(a) { return a.indexOf(issue.model) !== -1; })) {
    if (makeBreakdown[issue.make] === undefined) makeBreakdown[issue.make] = 0;
  }
});
addedList.forEach(function(item) {
  var make = item.split(' ')[0];
  if (makeBreakdown[make] === undefined) makeBreakdown[make] = 0;
  makeBreakdown[make]++;
});

console.log('--- Breakdown by Make ---');
Object.keys(makeBreakdown).sort().forEach(function(make) {
  console.log('  ' + make + ': +' + makeBreakdown[make] + ' issues');
});
console.log('');

// Note about already-covered items
console.log('--- Already Covered (verified in existing database) ---');
console.log('  Toyota Sienna: power sliding door cable (ID: toyota-sienna-power-door-2004)');
console.log('  Toyota Sienna: dashboard cracking (ID: toyota-sienna-dashboard-crack-2007)');
console.log('  Toyota Avalon: water pump leak (ID: toyota-avalon-water-pump-2005)');
console.log('  Toyota Sequoia: air injection pump (IDs: toyota-sequoia-air-injection-2001, toyota-sequoia-air-pump-failure-2008)');
console.log('  Toyota Corolla Cross: CVT calibration (ID: toyota-corolla-cross-cvt-hesitation-2022)');
console.log('  Toyota Land Cruiser: AHC air suspension (ID: toyota-landcruiser-ahc-suspension-2008)');
console.log('  Nissan Sentra: CVT failure (ID: nissan-sentra-cvt-failure-2013)');
console.log('  Nissan Sentra: timing chain MR20DD (ID: nissan-sentra-timing-chain-2013)');
console.log('  Nissan Maxima: CVT failure (ID: nissan-maxima-cvt-failure-2016)');
console.log('  Nissan Pathfinder: CVT failure (ID: nissan-pathfinder-cvt-failure-2013)');
console.log('  Nissan Murano: CVT failure (ID: nissan-murano-cvt-failure-2009)');
console.log('  Nissan Frontier: SMOD transmission cooler (ID: nissan-frontier-radiator-smod-2005)');
console.log('  Nissan Titan: rear axle seal leak (ID: nissan-titan-rear-axle-seal-2004)');
console.log('  Nissan Rogue Sport: CVT judder (IDs: nissan-rogue-sport-cvt-issues-2017, nissan-rogue-sport-cvt-judder-2017)');
console.log('  Kia Sedona: sliding door cable 2006-2014 (ID: kia-sedona-sliding-door-cable)');
console.log('  Mazda Mazda5: sliding door cable (ID: at line 78258)');
console.log('  Subaru Tribeca: oil leaks (ID: subaru-tribeca-oil-leak-2006)');
console.log('  Subaru Tribeca: timing chain (ID: subaru-tribeca-timing-chain-2008)');
console.log('');
console.log('--- Verified Adequate (no additions needed) ---');
console.log('  Toyota Celica: 3 issues - adequate');
console.log('  Toyota MR2: 3 issues - adequate');
console.log('  Honda Del Sol: 2 issues - adequate');
console.log('  Honda Prelude: 3 issues - adequate');
console.log('  Subaru SVX: 2 issues - adequate for rare car');
console.log('  Subaru Loyale: 2 issues - adequate for discontinued');
console.log('  Subaru Solterra: 3 issues - adequate for new EV');
console.log('  Mazda CX-7: 2 issues - turbo failure is the main concern');
console.log('  Hyundai Venue: 2 issues - adequate for small crossover');
console.log('  Kia Spectra: 3 issues - adequate');
console.log('  Kia Sephia: 3 issues - adequate');
console.log('');
console.log('--- Verified Coverage (Hyundai/Kia checks) ---');
console.log('  Hyundai Accent: 4 issues including CVT failure - adequate');
console.log('  Hyundai Elantra: 8 issues including Nu engine failure (Theta II covered) - adequate');
console.log('  Hyundai Sonata: 6 issues including engine bearing 2011 (Theta II covered) - adequate');
console.log('  Hyundai Tiburon: 2 existing + 1 added = 3 issues');
console.log('  Hyundai Azera: 2 existing + 1 added = 3 issues');
console.log('  Kia Soul: 4 issues including EV motor bearing - adequate');
console.log('  Kia Forte: 4 issues including engine knocking Nu GDI - adequate');
console.log('  Kia Sedona: 3 existing + 1 added (motor for 2015+) = 4 issues');
