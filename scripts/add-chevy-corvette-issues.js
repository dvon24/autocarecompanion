const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const knownIssues = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Chevrolet Corvette
// C5 (1997-2004): LS1/LS6 V8
// C6 (2005-2013): LS2/LS3/LS7/LS9 V8
// C7 (2014-2019): LT1/LT4 V8
// C8 (2020-2025): LT2 mid-engine, Z06 LT6 flat-plane V8

const chevyCorvetteIssues = [
  {
    id: 'chevy-corvette-harmonic-balancer-1997',
    make: 'Chevrolet',
    model: 'Corvette',
    years: { start: 1997, end: 2004 },
    title: 'Harmonic Balancer Failure - C5 LS1/LS6',
    severity: 'high',
    category: 'engine',
    description: 'The C5 Corvette LS1 and LS6 engines have a known harmonic balancer (crankshaft pulley) failure. The rubber bonding between the inner hub and outer ring separates, causing the outer ring to wobble or walk off the crankshaft. This can destroy the serpentine belt, damage the timing cover, and in severe cases score the crankshaft snout. The issue typically occurs between 80,000-150,000 miles. A wobbling harmonic balancer also throws off ignition timing and can cause engine damage.',
    symptoms: [
      'Wobbling or vibrating crankshaft pulley (visible)',
      'Serpentine belt walking off pulleys or shredding',
      'Knocking or rattling noise from front of engine',
      'Check engine light with misfire codes',
      'Oil leak from front crank seal (balancer walks off)',
      'AC/PS failure from broken belt'
    ],
    solution: 'Replace the harmonic balancer. ATI Super Damper is the definitive upgrade - it uses elastomer O-rings instead of bonded rubber, making it essentially lifetime. The GM replacement balancer will eventually fail the same way. Installation requires a balancer puller and installer tool. While the balancer is off, replace the front crank seal.',
    estimatedCost: { min: 200, max: 600 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'ATI Super Damper 917781 - SFI-rated performance damper for LS1/LS6. Eliminates rubber bond failure permanently. CorvetteForum.com #1 recommendation.',
        partBrand: 'ATI Performance',
        partName: 'Super Damper (LS1/LS6)',
        partNumber: '917781',
        upvotes: 0
      },
      {
        type: 'part',
        content: 'Fluidampr 760121 - steel viscous damper alternative to ATI, also SFI rated',
        partBrand: 'Fluidampr',
        partName: 'LS1 Harmonic Damper',
        partNumber: '760121',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Inspect the balancer by looking for separation between the inner hub and outer ring. Any visible gap or wobble means replacement is needed NOW.',
        upvotes: 0
      }
    ]
  },
  {
    id: 'chevy-corvette-column-lock-1997',
    make: 'Chevrolet',
    model: 'Corvette',
    years: { start: 1997, end: 2004 },
    title: 'Steering Column Lock (VATS) Failure - Cannot Start',
    severity: 'high',
    category: 'electrical',
    description: 'The C5 Corvette has a notorious electronic steering column lock (part of the Vehicle Anti-Theft System / VATS) that fails, preventing the car from starting. When the column lock module fails, the car displays "SERVICE COLUMN LOCK" and refuses to start even with the correct key. The column lock motor or position sensor fails, and GM designed it as a security feature that defaults to locked when it fails. This can strand you anywhere. It is the #1 most-discussed C5 reliability issue.',
    symptoms: [
      'SERVICE COLUMN LOCK message on DIC',
      'Car will not start - ignition will not turn',
      'Intermittent no-start that resolves by waiting',
      'Steering wheel locked and cannot be turned',
      'Key fob works but ignition does not'
    ],
    solution: 'The permanent fix is to bypass or disable the column lock. Delphi (OEM supplier) sells a bypass module that plugs into the column lock connector and eliminates the lock function while keeping the anti-theft system working. Many C5 owners bypass the column lock preemptively before it fails. GM dealers can also reprogram the BCM to disable the column lock. A failed column lock module can be replaced but the new one will eventually fail too.',
    estimatedCost: { min: 50, max: 500 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Bypass the column lock preemptively before it fails and strands you. CorvetteForum.com has detailed DIY bypass guides. The bypass is a simple wiring modification.',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'If stranded with SERVICE COLUMN LOCK, try turning the key to ON (not start) and waiting 10-15 minutes. Sometimes the lock resets.',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'If buying a used C5, ask if the column lock has been bypassed. If not, plan to do it immediately - failure is a matter of when, not if.',
        upvotes: 0
      }
    ]
  },
  {
    id: 'chevy-corvette-valve-springs-2006',
    make: 'Chevrolet',
    model: 'Corvette',
    years: { start: 2006, end: 2013 },
    title: 'LS7 Valve Guide and Valve Spring Failure - C6 Z06',
    severity: 'high',
    category: 'engine',
    description: 'The C6 Z06 (2006-2013) uses the LS7 7.0L V8 with titanium intake valves and aggressive valve springs. The exhaust valve guides wear prematurely, allowing valves to cock sideways, break valve springs, and drop valves into cylinders. This is catastrophic engine failure. The issue is most common on 2006-2008 models but can affect all LS7s. GM extended the powertrain warranty but many cars are now beyond coverage. The titanium intake valves and sodium-filled exhaust valves are unique to the LS7.',
    symptoms: [
      'Ticking or clicking noise from engine (valve guide wear)',
      'Misfire on one cylinder (broken spring)',
      'Sudden catastrophic engine failure (dropped valve)',
      'Metal debris in oil',
      'Oil consumption increasing gradually'
    ],
    solution: 'Preventive valve spring and guide replacement is recommended for any LS7 that has not had this service. This requires head removal. Upgraded valve springs from Comp Cams or Manley and bronze valve guides from GM or aftermarket replace the failure-prone components. The LS7 is otherwise an outstanding engine when this issue is addressed.',
    estimatedCost: { min: 2500, max: 5000 },
    recallTSB: 'GM Special Coverage #11186 - LS7 valve spring replacement (limited VINs/mileage)',
    communityRecommendations: [
      {
        type: 'part',
        content: 'Comp Cams 26918-16 LS7 valve spring kit - upgraded springs that eliminate the failure-prone factory springs',
        partBrand: 'Comp Cams',
        partName: 'LS7 Beehive Valve Spring Kit',
        partNumber: '26918-16',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Every LS7 should have valve springs and guides inspected/replaced as preventive maintenance. Budget for this when buying a C6 Z06.',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'A dropped valve destroys the engine - do NOT wait for symptoms. Preventive spring/guide replacement costs $3k; an engine replacement costs $15k+.',
        upvotes: 0
      }
    ]
  },
  {
    id: 'chevy-corvette-dry-sump-2006',
    make: 'Chevrolet',
    model: 'Corvette',
    years: { start: 2006, end: 2013 },
    title: 'Dry Sump Oil System Issues - C6 Z06/ZR1',
    severity: 'moderate',
    category: 'engine',
    description: 'The C6 Z06 (LS7) and ZR1 (LS9) use a dry sump oil system with an external oil tank and scavenge pump. The oil tank can develop internal baffle failure, and the scavenge pump lines can leak at fittings. The dry sump system is more complex than the wet sump in base C6 models. Oil level must be checked differently (engine must be running to get accurate level). Overfilling or underfilling can cause issues. Some owners report oil starvation during sustained high-G cornering despite the dry sump design.',
    symptoms: [
      'Low oil pressure warning during hard cornering',
      'Oil leak from dry sump lines or fittings',
      'Oil level difficult to read accurately',
      'Oil foaming (overfilled or air ingestion)',
      'Scavenge pump noise'
    ],
    solution: 'Inspect dry sump lines and fittings for leaks. Check oil level with engine running at operating temperature. Use the correct GM Mobil 1 5W-30 oil and do not overfill. For track use, an oil cooler upgrade and LG Motorsports or similar dry sump upgrade improve oil control under sustained G-loads.',
    estimatedCost: { min: 200, max: 1500 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Always check dry sump oil level with the engine running and at operating temperature - the dipstick reads incorrectly with the engine off',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Use only Mobil 1 5W-30 (GM spec) in the dry sump system. The tight tolerances require the correct viscosity.',
        upvotes: 0
      }
    ]
  },
  {
    id: 'chevy-corvette-c7-vibration-2014',
    make: 'Chevrolet',
    model: 'Corvette',
    years: { start: 2014, end: 2019 },
    title: 'Driveline Vibration at Low Speed - C7',
    severity: 'low',
    category: 'drivetrain',
    description: 'The C7 Corvette with the 7-speed manual or 8-speed automatic can develop an annoying driveline vibration/shudder at low speeds, particularly during gentle acceleration from a stop. The 7-speed manual uses a dual-mass flywheel that can develop chatter. The 8-speed automatic (8L90) shares the torque converter shudder issue with GM trucks. The transaxle-mounted differential and half-shafts can also contribute to vibrations.',
    symptoms: [
      'Shudder during gentle acceleration from stop',
      'Vibration at 20-40 mph under light throttle (8-speed)',
      'Clutch chatter in 1st gear (7-speed manual)',
      'Vibration through floor at highway cruise',
      'Clunk on tip-in/tip-out throttle'
    ],
    solution: 'For 8-speed: same transmission fluid exchange with Mobil 1 LV ATF HP as other 8L90 vehicles. For 7-speed manual: dual-mass flywheel inspection/replacement, or conversion to single-mass flywheel with aftermarket clutch. Half-shaft inspection for worn CV joints. Some vibration at low speed is inherent to the C7 design.',
    estimatedCost: { min: 200, max: 2500 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'Mobil 1 Synthetic LV ATF HP (GM 19417577) - for 8-speed automatic torque converter shudder',
        partBrand: 'Mobil 1',
        partName: 'Synthetic LV ATF HP',
        partNumber: '19417577',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Some low-speed shudder is normal on C7 due to the transaxle layout and half-shafts. CorvetteForum consensus: if it does not worsen, it is acceptable.',
        upvotes: 0
      }
    ]
  },
  {
    id: 'chevy-corvette-c8-frunk-latch-2020',
    make: 'Chevrolet',
    model: 'Corvette',
    years: { start: 2020, end: 2025 },
    title: 'Front Trunk (Frunk) Latch and Electrical Issues - C8',
    severity: 'moderate',
    category: 'electrical',
    description: 'The mid-engine C8 Corvette has reported issues with the front trunk (frunk) latch mechanism. The electronic latch can fail to release or fail to secure properly. GM has issued recalls for frunk latch issues that could allow the frunk to open at speed. Additionally, some C8 owners report various electrical gremlins including infotainment freezes, wireless charging pad failures, and key fob range issues. These are software and build-quality issues typical of a first-generation mid-engine design.',
    symptoms: [
      'Frunk will not open via button or key fob',
      'Frunk opens unexpectedly or does not latch securely',
      'FRUNK AJAR warning when closed properly',
      'Infotainment screen freezing or rebooting',
      'Wireless phone charging pad not working',
      'Key fob range reduced or intermittent'
    ],
    solution: 'Frunk latch: GM recall N212346680 addresses the latch mechanism. Dealer will inspect and replace the latch assembly under recall. Infotainment: ensure software is up to date via dealer or OTA updates. Wireless charger: clean the charging pad and ensure phone case is compatible. Key fob: replace battery (CR2032) and check for interference from aftermarket electronics.',
    estimatedCost: { min: 0, max: 500 },
    recallTSB: 'NHTSA Recall N212346680 - Front trunk latch',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Check if your C8 VIN is covered by the frunk latch recall at nhtsa.gov - the repair is free',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'For infotainment issues, a hard reset (hold power button 10 seconds) resolves most freezes',
        upvotes: 0
      }
    ]
  },
  {
    id: 'chevy-corvette-c8-lifter-2020',
    make: 'Chevrolet',
    model: 'Corvette',
    years: { start: 2020, end: 2025 },
    title: 'LT2 Engine Valve Lifter Tick and DFM Concerns',
    severity: 'moderate',
    category: 'engine',
    description: 'The C8 Corvette uses the LT2 6.2L V8 with Dynamic Fuel Management (DFM) which can deactivate any combination of cylinders. While the LT2 is generally reliable, some owners report lifter tick similar to the AFM issues on truck engines. The DFM system uses the same collapsible lifter technology. GM has released updated VLOM and lifter designs for the LT2. The tick is most noticeable on cold starts and usually disappears when warm. Severe cases may require lifter replacement.',
    symptoms: [
      'Ticking noise from engine on cold start',
      'Tick that goes away when engine warms up',
      'Rough idle briefly on startup',
      'Misfire codes on specific cylinders (rare)'
    ],
    solution: 'Mild cold-start tick is considered normal on LT2 by many in the Corvette community. Persistent tick that does not go away when warm warrants inspection. GM has updated VLOM and lifter designs. A DFM disabler (Range Technology) can be used as a preventive measure. Full lifter replacement is rarely needed on C8.',
    estimatedCost: { min: 0, max: 4000 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'Range Technology DFM Disabler RA003B - keeps C8 in V8 mode, preventive measure for DFM lifter wear',
        partBrand: 'Range Technology',
        partName: 'DFM Disabler',
        partNumber: 'RA003B',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Cold-start tick that goes away in 30-60 seconds is generally considered normal on LT2. Only investigate if it persists when warm.',
        upvotes: 0
      }
    ]
  }
];

console.log('Adding ' + chevyCorvetteIssues.length + ' Chevrolet Corvette issues...');
knownIssues.issues.push(...chevyCorvetteIssues);

fs.writeFileSync(dbPath, JSON.stringify(knownIssues, null, 2));

console.log('Successfully added ' + chevyCorvetteIssues.length + ' Chevrolet Corvette issues');
console.log('Total issues in database: ' + knownIssues.issues.length);
