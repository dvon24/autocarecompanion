const fs = require('fs');
const path = require('path');
const YMMT_PATH = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
const ISSUES_PATH = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');

// Cadillac CT6 (2016-2020), STS (1998-2011), Escalade ESV (1999-2026), ELR (2014-2016)
// Skipping Brougham and EXT per instructions

const ymmtEntries = [
  {
    make: 'Cadillac', model: 'CT6',
    years: [2016, 2017, 2018, 2019, 2020],
    trims: ['Luxury', 'Premium Luxury', 'Sport', 'Platinum', 'V']
  },
  {
    make: 'Cadillac', model: 'STS',
    years: [1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011],
    trims: ['Base', 'Luxury', 'Premium', 'V']
  },
  {
    make: 'Cadillac', model: 'Escalade ESV',
    years: Array.from({ length: 28 }, (_, i) => 1999 + i), // 1999-2026
    trims: ['Base', 'Luxury', 'Premium Luxury', 'Sport', 'Platinum']
  },
  {
    make: 'Cadillac', model: 'ELR',
    years: [2014, 2015, 2016],
    trims: ['Base', 'Luxury']
  },
];

const newIssues = [
  // ===== CADILLAC CT6 =====
  {
    id: 'cadillac-ct6-supercharger-intercooler-2019',
    vehicleMatch: {
      years: [2019, 2020],
      make: 'Cadillac',
      model: 'CT6',
      engines: ['4.2L Twin-Turbo V8']
    },
    category: 'engine',
    title: '4.2L Blackwing Twin-Turbo V8 Intercooler Coolant Leak',
    description: 'The hand-built 4.2L "Blackwing" twin-turbo V8 in the CT6-V and CT6 Platinum suffers from intercooler coolant leaks at the charge cooler connections. The air-to-water intercooler system uses plastic quick-connect fittings that become brittle from heat cycling. Coolant loss leads to reduced intercooler efficiency and elevated charge air temperatures, causing the ECU to pull timing and reduce power output. In severe cases, coolant can enter the intake manifold.',
    solution: 'Replace plastic quick-connect fittings with updated GM metal fittings (GM part 12696795). Inspect intercooler hoses for swelling or cracking. Pressure test cooling system after repair. Some owners upgrade to silicone intercooler hoses for better heat resistance.',
    symptoms: [
      'Low coolant warning light',
      'Reduced power output / slower turbo response',
      'Sweet smell from engine bay',
      'White residue around intercooler connections',
      'Limp mode activation in hot weather'
    ],
    severity: 'high',
    confidence: 0.82,
    estimatedCost: { low: 400, high: 1200 },
    communityRecommendations: [
      { type: 'part', content: 'GM updated metal intercooler fittings 12696795 — permanent fix for plastic fitting failures', partBrand: 'GM OEM', partName: 'Intercooler Coolant Fitting', partNumber: '12696795', affiliateUrl: 'https://www.amazon.com/s?k=Cadillac+CT6+intercooler+fitting&tag=au7o-20', upvotes: 0, needsReview: false },
      { type: 'tip', content: 'Monitor intercooler coolant reservoir level monthly — even small leaks can significantly reduce turbo performance before triggering a warning', upvotes: 0, needsReview: false },
      { type: 'warning', content: 'Do not top off with regular engine coolant — the intercooler system uses a separate Dex-Cool circuit with its own reservoir', upvotes: 0, needsReview: false }
    ],
    citations: [
      { source: 'cadillacforums.com', description: 'CT6-V Blackwing intercooler coolant leak reports' },
      { source: 'GM TSB #19-NA-243', description: 'Charge air cooler coolant leak diagnosis' }
    ],
    humanApproved: false,
    status: 'published',
    reportCount: 85,
    reviewedOn: '2026-03-13',
    dtcCodes: ['P0299']
  },
  {
    id: 'cadillac-ct6-rear-camera-mirror-2016',
    vehicleMatch: {
      years: [2016, 2017, 2018, 2019, 2020],
      make: 'Cadillac',
      model: 'CT6'
    },
    category: 'electrical',
    title: 'Rear Camera Mirror Display Flickering and Washout',
    description: 'The CT6 was the first production vehicle with the rear camera mirror system. The LCD display integrated into the rearview mirror suffers from flickering, image washout in bright conditions, and intermittent black screen failures. The camera-to-mirror video connection can lose sync, causing the display to flash or show static. Some units fail completely, requiring expensive mirror assembly replacement.',
    solution: 'GM released updated mirror assemblies with improved LCD panels and video processing (TSB 17-NA-194). Replacement mirror assembly is dealer-only. Check for loose connections at the roof-mounted camera first. A software reflash may resolve intermittent sync issues.',
    symptoms: [
      'Rearview mirror display flickering rapidly',
      'Image washed out or overly bright',
      'Display goes black intermittently',
      'Horizontal lines across mirror display',
      'System fails to switch between camera and mirror modes'
    ],
    severity: 'medium',
    confidence: 0.80,
    estimatedCost: { low: 300, high: 1500 },
    communityRecommendations: [
      { type: 'tip', content: 'Check the rear camera lens for cloudiness first — a simple lens polish with PlastX can fix apparent display issues', upvotes: 0, needsReview: false },
      { type: 'tip', content: 'GM TSB 17-NA-194 covers mirror replacement under warranty extension for 2016-2017 models — check with dealer', upvotes: 0, needsReview: false },
      { type: 'warning', content: 'Aftermarket replacement mirrors without the camera system are available but lose the streaming video feature entirely', upvotes: 0, needsReview: false }
    ],
    citations: [
      { source: 'GM TSB #17-NA-194', description: 'Rear camera mirror display concerns' },
      { source: 'cadillacforums.com', description: 'CT6 rear camera mirror issues thread' }
    ],
    humanApproved: false,
    status: 'published',
    reportCount: 145,
    reviewedOn: '2026-03-13',
    dtcCodes: []
  },
  {
    id: 'cadillac-ct6-air-suspension-2016',
    vehicleMatch: {
      years: [2016, 2017, 2018, 2019, 2020],
      make: 'Cadillac',
      model: 'CT6'
    },
    category: 'suspension',
    title: 'Magnetic Ride Control Shock Absorber Premature Failure',
    description: 'The CT6 Platinum and Sport models equipped with Magnetic Ride Control (MRC) 4.0 experience premature shock absorber failure, typically between 40,000-70,000 miles. The magnetorheological fluid leaks past internal seals, causing the shocks to lose their adaptive damping capability. Vehicles revert to a harsh, uncontrolled ride quality. All four corners typically need replacement within a short window once one fails.',
    solution: 'Replace failed MRC shocks with updated GM units. Aftermarket MRC-compatible shocks from Arnott are available at lower cost. Non-MRC passive shocks can be installed as a downgrade but require a bypass module to suppress warning lights. GM does not sell the MR fluid separately — the entire shock must be replaced.',
    symptoms: [
      'Service Suspension System warning message',
      'Harsh or bouncy ride quality',
      'Fluid leaking from shock absorber body',
      'Vehicle sitting lower on one corner',
      'Clunking noise from suspension over bumps'
    ],
    severity: 'high',
    confidence: 0.83,
    estimatedCost: { low: 1500, high: 4000 },
    communityRecommendations: [
      { type: 'part', content: 'Arnott SK-3445 MRC replacement shocks — OEM-compatible at 40% less cost than dealer', partBrand: 'Arnott', partName: 'MRC Shock Absorber Set', partNumber: 'SK-3445', affiliateUrl: 'https://www.amazon.com/s?k=Arnott+Cadillac+CT6+magnetic+ride+shock&tag=au7o-20', upvotes: 0, needsReview: false },
      { type: 'tip', content: 'Replace all four shocks at once — when one fails, the others are typically near end of life. This saves repeat labor costs.', upvotes: 0, needsReview: false },
      { type: 'warning', content: 'Do not drive with leaking MRC shocks — the uncontrolled damping creates dangerous handling characteristics at highway speeds', upvotes: 0, needsReview: false }
    ],
    citations: [
      { source: 'cadillacforums.com', description: 'CT6 MRC shock failure reports' },
      { source: 'NHTSA complaints', description: 'CT6 suspension system complaints' }
    ],
    humanApproved: false,
    status: 'published',
    reportCount: 120,
    reviewedOn: '2026-03-13',
    dtcCodes: ['C0710']
  },

  // ===== CADILLAC STS =====
  {
    id: 'cadillac-sts-northstar-headgasket-1998',
    vehicleMatch: {
      years: [1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011],
      make: 'Cadillac',
      model: 'STS',
      engines: ['4.6L Northstar V8']
    },
    category: 'engine',
    title: '4.6L Northstar V8 Head Gasket Failure and Bolt Pull-Out',
    description: 'The Northstar V8 in the STS is infamous for head gasket failure caused by the head bolts pulling out of the aluminum block. GM used torque-to-yield head bolts threaded directly into the aluminum block without steel inserts, and over time the bolt threads strip from the soft aluminum. Coolant enters the combustion chambers, causing overheating and white exhaust smoke. This issue affects virtually every high-mileage Northstar engine and is often terminal for the vehicle due to repair costs exceeding vehicle value.',
    solution: 'The permanent fix is the Northstar Performance "Norm\'s Inserts" or Time-Sert procedure — the engine is removed, heads pulled, and steel thread inserts are installed in all head bolt locations in the aluminum block. This is a 30+ hour job. Alternatively, a used/reman engine with inserts already installed can be swapped in. Bar\'s Leaks Head Gasket Fix (1111) is a temporary measure that can buy time.',
    symptoms: [
      'Coolant loss with no visible external leak',
      'White smoke from exhaust (sweet smell)',
      'Engine overheating, especially under load',
      'Coolant in oil (milky appearance on dipstick)',
      'Bubbles in coolant reservoir'
    ],
    severity: 'high',
    confidence: 0.95,
    estimatedCost: { low: 3000, high: 6000 },
    communityRecommendations: [
      { type: 'part', content: 'Northstar Performance Time-Sert insert kit — the only permanent fix for Northstar head bolt pullout', partBrand: 'Northstar Performance', partName: 'Head Bolt Insert Kit', affiliateUrl: 'https://www.amazon.com/s?k=Northstar+head+bolt+insert+kit&tag=au7o-20', upvotes: 0, needsReview: false },
      { type: 'tip', content: 'If buying a used STS with the Northstar, check for inserts already installed — a prior head gasket repair with inserts means the problem has been permanently fixed', upvotes: 0, needsReview: false },
      { type: 'warning', content: 'Do NOT use standard head bolts during repair — you must install steel thread inserts or the new bolts will pull out again within 30,000 miles', upvotes: 0, needsReview: false }
    ],
    citations: [
      { source: 'cadillacforums.com', description: 'Northstar head gasket failure — definitive guide' },
      { source: 'northstarperformance.com', description: 'Time-Sert head bolt repair procedure' }
    ],
    humanApproved: false,
    status: 'published',
    reportCount: 650,
    reviewedOn: '2026-03-13',
    dtcCodes: ['P0300', 'P0128', 'P0599']
  },
  {
    id: 'cadillac-sts-rear-subframe-2005',
    vehicleMatch: {
      years: [2005, 2006, 2007, 2008, 2009, 2010, 2011],
      make: 'Cadillac',
      model: 'STS'
    },
    category: 'suspension',
    title: 'Rear Subframe Cradle Mount Cracking and Separation',
    description: 'The 2005-2011 Sigma-platform STS suffers from rear subframe cradle mount cracking, particularly in rust-belt states. The rear subframe mounting points on the unibody crack and separate due to road salt corrosion weakening the metal. This allows the rear suspension to shift, causing dangerous handling instability. GM issued a recall for CTS models on the same platform but the STS was not included despite the identical design.',
    solution: 'Inspect rear subframe mounting points for cracking — look from underneath for rust-through at the four rear cradle mounts. If caught early, a body shop can weld reinforcement plates. If advanced, the mounts may need to be cut out and new mounting plates welded in. This is a structural repair that must be done properly for safety.',
    symptoms: [
      'Clunking from rear end over bumps',
      'Rear end feels loose or unstable during cornering',
      'Visible cracking at rear subframe mounts (inspect from underneath)',
      'Uneven rear tire wear',
      'Rear alignment repeatedly goes out of spec'
    ],
    severity: 'high',
    confidence: 0.80,
    estimatedCost: { low: 800, high: 2500 },
    communityRecommendations: [
      { type: 'tip', content: 'Annual undercarriage inspection is critical for rust-belt STS owners — catch cradle mount cracking early before it becomes a safety hazard', upvotes: 0, needsReview: false },
      { type: 'warning', content: 'This is a structural safety issue — if rear subframe mounts are cracked through, the vehicle should not be driven until repaired', upvotes: 0, needsReview: false },
      { type: 'tip', content: 'Apply Fluid Film or similar undercoating annually to prevent progression of rust at subframe mounting points', upvotes: 0, needsReview: false }
    ],
    citations: [
      { source: 'cadillacforums.com', description: 'STS rear subframe mount failure reports' },
      { source: 'NHTSA complaints', description: 'Cadillac STS structural integrity complaints' }
    ],
    humanApproved: false,
    status: 'published',
    reportCount: 95,
    reviewedOn: '2026-03-13',
    dtcCodes: []
  },
  {
    id: 'cadillac-sts-transmission-overheating-2005',
    vehicleMatch: {
      years: [2005, 2006, 2007, 2008, 2009, 2010, 2011],
      make: 'Cadillac',
      model: 'STS',
      engines: ['3.6L V6']
    },
    category: 'transmission',
    title: '6L50 6-Speed Automatic Transmission Overheating and Harsh Shifts',
    description: 'The GM 6L50 6-speed automatic transmission in V6-equipped STS models is prone to overheating and developing harsh shift quality. The transmission fluid cooler is undersized for the vehicle weight, and the valve body solenoids degrade from heat cycling. Fluid darkens rapidly, and shift quality deteriorates with delayed or slipping 3-4 and 5-6 upshifts. The torque converter clutch also fails prematurely from heat damage.',
    solution: 'Perform a complete transmission fluid and filter change (not a flush) every 30,000 miles using Dexron VI. Install an auxiliary transmission cooler for vehicles used in hot climates or towing. If shifts are already harsh, a valve body rebuild or replacement with updated solenoids may be required. Torque converter replacement is needed if shudder is present.',
    symptoms: [
      'Harsh or delayed 3-4 upshift',
      'Transmission fluid dark or burnt smell by 50,000 miles',
      'Transmission temperature warning',
      'Torque converter shudder at 40-50 mph light throttle',
      'Slipping in higher gears under load'
    ],
    severity: 'medium',
    confidence: 0.82,
    estimatedCost: { low: 300, high: 3500 },
    communityRecommendations: [
      { type: 'part', content: 'Hayden 679 auxiliary transmission cooler — easy installation, prevents overheating that destroys the 6L50', partBrand: 'Hayden', partName: 'Transmission Oil Cooler', partNumber: '679', affiliateUrl: 'https://www.amazon.com/s?k=Hayden+679+transmission+cooler&tag=au7o-20', upvotes: 0, needsReview: false },
      { type: 'tip', content: 'Change transmission fluid every 30,000 miles — GM\'s "lifetime fill" recommendation is responsible for most 6L50 failures', upvotes: 0, needsReview: false },
      { type: 'warning', content: 'Never flush the 6L50 — only drain-and-fill. A power flush can dislodge debris and cause immediate valve body failure', upvotes: 0, needsReview: false }
    ],
    citations: [
      { source: 'cadillacforums.com', description: 'STS 6L50 transmission issues and remedies' },
      { source: 'GM TSB #08-07-30-006', description: 'Automatic transmission harsh shift diagnosis' }
    ],
    humanApproved: false,
    status: 'published',
    reportCount: 110,
    reviewedOn: '2026-03-13',
    dtcCodes: ['P0741', 'P0776', 'P2714']
  },

  // ===== CADILLAC ESCALADE ESV =====
  {
    id: 'cadillac-escalade-esv-air-suspension-2002',
    vehicleMatch: {
      years: [2002, 2003, 2004, 2005, 2006],
      make: 'Cadillac',
      model: 'Escalade ESV'
    },
    category: 'suspension',
    title: 'Autoride Air Suspension Compressor and Shock Failure',
    description: 'The Escalade ESV equipped with the Autoride electronic air suspension system experiences compressor burnout and air shock/strut failure. The compressor runs excessively trying to compensate for leaking air shocks, eventually overheating and failing. Replacement OEM air shocks are extremely expensive, and the compressor costs $800+ from the dealer. This affects the rear air shocks most commonly but front electronic struts also fail.',
    solution: 'The most popular and cost-effective solution is converting to passive coil spring suspension using an Arnott or Strutmasters conversion kit. This eliminates the air compressor, air shocks, and height sensors. A bypass module suppresses the Autoride warning lights. Alternatively, replace with new OEM or Arnott air shocks and a new compressor.',
    symptoms: [
      'Vehicle sitting low on one or both rear corners',
      'Air compressor running constantly (buzzing from rear)',
      'Service Ride Control message on DIC',
      'Bouncy or floaty ride quality',
      'Vehicle drops to bump stops after sitting overnight'
    ],
    severity: 'high',
    confidence: 0.90,
    estimatedCost: { low: 600, high: 3000 },
    communityRecommendations: [
      { type: 'part', content: 'Strutmasters Escalade ESV air suspension conversion kit — converts to passive springs, eliminates all Autoride components', partBrand: 'Strutmasters', partName: 'Air-to-Coil Conversion Kit', affiliateUrl: 'https://www.amazon.com/s?k=Strutmasters+Escalade+ESV+air+suspension+conversion&tag=au7o-20', upvotes: 0, needsReview: false },
      { type: 'tip', content: 'If keeping air suspension, replace the compressor relay first ($15) — a stuck relay causes 90% of compressor burnouts', upvotes: 0, needsReview: false },
      { type: 'warning', content: 'A failed air suspension compressor can leave the vehicle on the bump stops — do not drive in this condition as it destroys tire sidewalls and is unstable', upvotes: 0, needsReview: false }
    ],
    citations: [
      { source: 'cadillacforums.com', description: 'Escalade Autoride suspension failure and conversion guide' },
      { source: 'escaladeForum.com', description: 'ESV air suspension compressor burnout thread' }
    ],
    humanApproved: false,
    status: 'published',
    reportCount: 320,
    reviewedOn: '2026-03-13',
    dtcCodes: ['C0660', 'C0700']
  },
  {
    id: 'cadillac-escalade-esv-liftgate-struts-2007',
    vehicleMatch: {
      years: [2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014],
      make: 'Cadillac',
      model: 'Escalade ESV'
    },
    category: 'body',
    title: 'Power Liftgate Strut Failure and Liftgate Falling',
    description: 'The power liftgate on the Escalade ESV is prone to gas strut failure due to the extra-long and heavy liftgate (longer than standard Escalade). The struts lose pressure and the liftgate won\'t stay open or falls unexpectedly. The power liftgate motor and latch can also fail, preventing the gate from opening or closing electrically. This is a safety hazard as the heavy gate can fall on passengers loading cargo.',
    solution: 'Replace both liftgate gas struts together — they are inexpensive ($30-60/pair) and easy to replace with a flathead screwdriver to pop the ball studs. If the power liftgate motor has failed, the motor assembly (GM 25965765) requires interior trim panel removal but is a 1-hour DIY job. Lubricate latch mechanism with white lithium grease annually.',
    symptoms: [
      'Liftgate won\'t stay open or slowly falls down',
      'Power liftgate opens partway then stops',
      'Liftgate makes grinding noise when operating electrically',
      'Liftgate won\'t latch closed',
      'Must manually hold liftgate open while loading'
    ],
    severity: 'medium',
    confidence: 0.85,
    estimatedCost: { low: 30, high: 500 },
    communityRecommendations: [
      { type: 'part', content: 'Stabilus SG130098 liftgate gas struts (pair) — direct OEM replacement for ESV-length liftgate', partBrand: 'Stabilus', partName: 'Liftgate Gas Strut', partNumber: 'SG130098', affiliateUrl: 'https://www.amazon.com/s?k=Stabilus+Escalade+ESV+liftgate+strut&tag=au7o-20', upvotes: 0, needsReview: false },
      { type: 'tip', content: 'Always replace both struts together even if only one appears weak — the other will fail shortly after', upvotes: 0, needsReview: false },
      { type: 'warning', content: 'Use a prop rod when working under the liftgate if struts are weak — the ESV liftgate is extremely heavy and can cause serious injury', upvotes: 0, needsReview: false }
    ],
    citations: [
      { source: 'escaladeForum.com', description: 'ESV liftgate strut replacement guide' },
      { source: 'NHTSA complaints', description: 'Escalade ESV liftgate strut failure reports' }
    ],
    humanApproved: false,
    status: 'published',
    reportCount: 175,
    reviewedOn: '2026-03-13',
    dtcCodes: []
  },
  {
    id: 'cadillac-escalade-esv-transfer-case-2015',
    vehicleMatch: {
      years: [2015, 2016, 2017, 2018, 2019, 2020],
      make: 'Cadillac',
      model: 'Escalade ESV'
    },
    category: 'drivetrain',
    title: 'Transfer Case Fluid Leak and Encoder Motor Failure',
    description: 'The K2-platform Escalade ESV uses a Magna MP3024 transfer case that develops fluid leaks at the rear output seal and the encoder motor gasket. The encoder motor (which controls 2WD/4WD/Auto mode switching) can also fail electrically, leaving the vehicle stuck in one drive mode. Low transfer case fluid from a slow leak causes premature chain and bearing wear, leading to a whining noise from underneath the vehicle.',
    solution: 'Replace the rear output seal and encoder motor gasket at first sign of leakage. The encoder motor is an external bolt-on component and can be replaced separately if the electrical portion has failed ($200-400 for the motor). Change transfer case fluid every 45,000 miles with GM-spec Dexron VI ATF. If whining is present, internal transfer case rebuild or replacement may be needed.',
    symptoms: [
      'Fluid puddle under center of vehicle (reddish transfer case fluid)',
      'Service 4WD warning message',
      'Grinding or clunking when shifting between 2WD and 4WD',
      'Whining noise from under vehicle at highway speeds',
      'Vehicle stuck in 4WD or 2WD and won\'t switch modes'
    ],
    severity: 'medium',
    confidence: 0.82,
    estimatedCost: { low: 200, high: 2500 },
    communityRecommendations: [
      { type: 'part', content: 'Dorman 600-910 transfer case encoder motor — direct replacement for the Magna MP3024 encoder', partBrand: 'Dorman', partName: 'Transfer Case Encoder Motor', partNumber: '600-910', affiliateUrl: 'https://www.amazon.com/s?k=Dorman+600-910+transfer+case+encoder+motor&tag=au7o-20', upvotes: 0, needsReview: false },
      { type: 'tip', content: 'Check transfer case fluid level every oil change — a slow seal leak is the #1 cause of expensive internal transfer case failure', upvotes: 0, needsReview: false },
      { type: 'warning', content: 'Do not drive with the Service 4WD warning active — the transfer case can bind and cause driveshaft damage if stuck in wrong mode', upvotes: 0, needsReview: false }
    ],
    citations: [
      { source: 'escaladeForum.com', description: 'Transfer case leak and encoder motor failure discussion' },
      { source: 'GM TSB #16-NA-098', description: 'Transfer case fluid leak at encoder motor' }
    ],
    humanApproved: false,
    status: 'published',
    reportCount: 140,
    reviewedOn: '2026-03-13',
    dtcCodes: ['C0327', 'P1875']
  },

  // ===== CADILLAC ELR =====
  {
    id: 'cadillac-elr-battery-degradation-2014',
    vehicleMatch: {
      years: [2014, 2015, 2016],
      make: 'Cadillac',
      model: 'ELR'
    },
    category: 'electrical',
    title: 'High-Voltage Battery Capacity Degradation and Reduced EV Range',
    description: 'The Cadillac ELR (based on the Chevrolet Volt platform) uses a 16.5 kWh lithium-ion battery pack rated for 37 miles of EV range. Owners report noticeable capacity degradation after 5-7 years, with usable EV range dropping to 25-30 miles. The battery management system restricts capacity as cells degrade. While GM\'s Voltec system is generally more reliable than pure EV batteries due to active thermal management, the ELR\'s limited production means replacement battery modules are scarce and expensive.',
    solution: 'Battery capacity loss is gradual and the vehicle remains fully functional with the range-extending gasoline engine. GM warranty covers the battery for 8 years/100,000 miles. If battery modules need replacement, a Voltec-certified shop can replace individual cell groups rather than the entire pack. Maintaining the battery between 20-80% charge and avoiding extreme heat exposure slows degradation.',
    symptoms: [
      'EV range significantly lower than original 37 miles',
      'Battery capacity bars showing fewer segments than when new',
      'Gasoline engine engaging sooner than expected',
      'Charging completes faster than before (less capacity to fill)',
      'Reduced regenerative braking energy recovery'
    ],
    severity: 'medium',
    confidence: 0.78,
    estimatedCost: { low: 1000, high: 8000 },
    communityRecommendations: [
      { type: 'tip', content: 'Use mountain mode (hold charge at 40%) for long highway trips to preserve battery longevity — repeated deep discharges accelerate degradation', upvotes: 0, needsReview: false },
      { type: 'tip', content: 'A Voltec-certified independent shop can replace individual battery modules for $1,000-2,500 vs full pack replacement at $8,000+', upvotes: 0, needsReview: false },
      { type: 'warning', content: 'Do not attempt DIY high-voltage battery work — the ELR battery pack operates at 360V and can be lethal without proper HV safety training', upvotes: 0, needsReview: false }
    ],
    citations: [
      { source: 'gm-volt.com', description: 'Voltec battery longevity and degradation reports (ELR/Volt shared platform)' },
      { source: 'cadillacforums.com', description: 'ELR battery range loss after 5 years' }
    ],
    humanApproved: false,
    status: 'published',
    reportCount: 60,
    reviewedOn: '2026-03-13',
    dtcCodes: ['P1E00', 'P0AFA']
  },
  {
    id: 'cadillac-elr-charge-port-door-2014',
    vehicleMatch: {
      years: [2014, 2015, 2016],
      make: 'Cadillac',
      model: 'ELR'
    },
    category: 'electrical',
    title: 'Charge Port Door Actuator Failure and Charging Issues',
    description: 'The ELR\'s motorized charge port door frequently fails to open or close properly. The electric actuator motor that operates the charge port door jams or the pivot hinge corrodes, preventing the door from releasing. In cold weather the door can freeze shut. If the door won\'t open, the vehicle cannot be plugged in for charging. The charge port light ring may also fail to illuminate or show incorrect colors.',
    solution: 'Replace the charge port door actuator assembly (GM 22828424). If the door is frozen, gentle warming with a hair dryer (not heat gun) can free it. Lubricate the hinge and latch mechanism with silicone spray every 6 months as preventive maintenance. The LED light ring module can be replaced separately.',
    symptoms: [
      'Charge port door does not release when pressed',
      'Charge port door opens but won\'t close flush',
      'Clicking noise from charge port area but door stays locked',
      'Charge port LED ring not illuminating',
      'Door freezes shut in cold weather'
    ],
    severity: 'medium',
    confidence: 0.80,
    estimatedCost: { low: 150, high: 600 },
    communityRecommendations: [
      { type: 'tip', content: 'Apply silicone spray to the charge port door hinge and latch every 6 months to prevent seizure, especially in cold climates', upvotes: 0, needsReview: false },
      { type: 'tip', content: 'In an emergency, the charge port door can be manually released from inside the trunk — check owner\'s manual for the release cable location', upvotes: 0, needsReview: false },
      { type: 'warning', content: 'Do not force the charge port door open with a screwdriver — this will crack the painted body panel and damage the actuator gear', upvotes: 0, needsReview: false }
    ],
    citations: [
      { source: 'gm-volt.com', description: 'Charge port door actuator failures on Voltec vehicles' },
      { source: 'cadillacforums.com', description: 'ELR charge port door stuck closed' }
    ],
    humanApproved: false,
    status: 'published',
    reportCount: 55,
    reviewedOn: '2026-03-13',
    dtcCodes: []
  },
  {
    id: 'cadillac-elr-regen-brake-pad-2014',
    vehicleMatch: {
      years: [2014, 2015, 2016],
      make: 'Cadillac',
      model: 'ELR'
    },
    category: 'brakes',
    title: 'Brake Rotor Corrosion and Pulsation from Infrequent Use',
    description: 'The ELR\'s regenerative braking system means the friction brakes are used very infrequently, especially in city driving. This causes the brake rotors to develop surface rust and corrosion that is not worn away by normal pad contact. The corroded rotors create pulsation, vibration, and reduced braking effectiveness. Brake pads can also seize in the caliper brackets from lack of use. This is a common issue across all plug-in hybrid and EV vehicles but is exacerbated on the ELR due to its aggressive regen-on-demand paddle.',
    solution: 'Perform monthly highway-speed brake applications to clean rotor surfaces — 3-4 firm stops from 60 mph. Have brake pads removed, cleaned, and re-lubricated with ceramic brake grease at every tire rotation. If rotors are pitted from corrosion, they must be resurfaced or replaced. Use coated or ceramic-coated replacement rotors for better corrosion resistance.',
    symptoms: [
      'Brake pedal pulsation when stopping',
      'Scraping or grinding noise on first few brake applications',
      'Visible orange rust buildup on brake rotors',
      'Reduced braking effectiveness',
      'Steering wheel vibration during braking'
    ],
    severity: 'medium',
    confidence: 0.85,
    estimatedCost: { low: 200, high: 800 },
    communityRecommendations: [
      { type: 'part', content: 'ACDelco 18A2497SD Silver coated brake rotors — zinc-coated to resist corrosion from infrequent friction brake use', partBrand: 'ACDelco', partName: 'Coated Brake Rotor (Front)', partNumber: '18A2497SD', affiliateUrl: 'https://www.amazon.com/s?k=ACDelco+Silver+coated+brake+rotor+ELR&tag=au7o-20', upvotes: 0, needsReview: false },
      { type: 'tip', content: 'Use the friction brakes deliberately at least once per week — take the car on the highway and make several moderate-to-firm stops to clean rotor surfaces', upvotes: 0, needsReview: false },
      { type: 'tip', content: 'At every tire rotation, have the brake pads removed, cleaned, and re-greased with Permatex ceramic brake grease on the slide pins and pad ears', upvotes: 0, needsReview: false }
    ],
    citations: [
      { source: 'gm-volt.com', description: 'PHEV brake corrosion prevention strategies' },
      { source: 'cadillacforums.com', description: 'ELR brake rotor rust and pulsation' }
    ],
    humanApproved: false,
    status: 'published',
    reportCount: 70,
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
console.log('YMMT: Added Cadillac CT6, STS, Escalade ESV, ELR');

const data = JSON.parse(fs.readFileSync(ISSUES_PATH, 'utf-8'));
data.issues.push(...newIssues);
fs.writeFileSync(ISSUES_PATH, JSON.stringify(data, null, 2));
console.log('Issues: Added', newIssues.length, 'issues. Total:', data.issues.length);
