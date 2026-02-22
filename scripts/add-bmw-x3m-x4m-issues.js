const fs = require('fs');
const path = require('path');

const knownIssuesPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const knownIssues = JSON.parse(fs.readFileSync(knownIssuesPath, 'utf8'));

const bmwX3MX4MIssues = [
  {
    id: 'bmw-x3m-s58-bearing-recall-2020',
    make: 'BMW',
    model: 'X3 M',
    years: { start: 2020, end: 2021 },
    title: 'S58 Engine Main Bearing Shell Recall / Stop Sale - F97 X3 M / F98 X4 M',
    severity: 'high',
    description: 'BMW issued a delivery stop and subsequent technical service campaign for certain 2020-2021 F97 X3 M and F98 X4 M vehicles (also affecting G80 M3/G82 M4) due to improperly manufactured main bearing shells in the S58 3.0L twin-turbo inline-6 engine. The defective bearing shells can lead to premature bearing wear, spun bearings, and catastrophic engine failure. BMW initially halted deliveries of affected vehicles while the remedy was developed. The stop sale was converted to a Tech Campaign requiring dealer service where the head must be removed and bearing shells inspected and replaced. Bimmerpost G80 forum extensively documented this issue across approximately 27 vehicles with specific production dates. This is a manufacturing defect affecting a narrow production window - most S58 engines are NOT affected.',
    symptoms: [
      'Engine knocking or ticking noise, especially at cold start',
      'Low oil pressure warning light',
      'Metallic debris found in engine oil during oil change',
      'Engine vibration or roughness at idle',
      'In severe cases: catastrophic engine seizure',
      'Note: Many affected vehicles show NO symptoms before failure'
    ],
    solution: 'Check VIN immediately against BMW recall database at bmwusa.com or contact your BMW dealer. If your vehicle is within the affected production date range, BMW will inspect and replace main bearing shells at no cost under the Tech Campaign. The repair requires removing the cylinder head and oil pan to access and replace all main bearing shells - this is a major repair (8-12 hours labor) but fully covered by BMW. Do NOT drive the vehicle if knocking is present. For S58 vehicles outside the recall range: Proactive rod bearing inspection is recommended at 60,000 miles for track-driven vehicles. ACL Race Series rod bearings 6B1510H-STD are the aftermarket upgrade choice on Bimmerpost for preventive replacement ($150-$250 for bearing set, $3,000-$5,000 total with labor).',
    estimatedCost: { min: 0, max: 5000 },
    recallInfo: 'BMW Tech Campaign / Delivery Stop for specific S58 production dates. Check VIN at bmwusa.com. Approximately 27 vehicles affected in initial batch. Repair covered 100% by BMW.',
    communityRecommendations: [
      {
        type: 'warning',
        content: 'Check your VIN against BMW recall database IMMEDIATELY if you own a 2020-2021 X3 M or X4 M. BMW covers repair 100% under Tech Campaign. Do NOT drive if engine is knocking.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'ACL Race Series 6B1510H-STD rod bearings are the aftermarket upgrade for S58 engines. Copper-lead tri-metal construction with improved durability. Bimmerpost G80 forum recommended for track cars.',
        partBrand: 'ACL',
        partNumber: '6B1510H-STD',
        partName: 'S58/B58 High Performance Rod Bearing Set',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Most S58 engines are NOT affected by this recall - it was a narrow production window manufacturing defect. Don\'t panic, but DO check your VIN. The S58 is generally considered more reliable than S55/S65/S85.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'For track-driven X3 M/X4 M: proactive rod bearing inspection at 60,000 miles is cheap insurance. Oil analysis every 5,000 miles (Blackstone Labs, $30/test) catches bearing wear early.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-x3m-cooling-track-use-2020',
    make: 'BMW',
    model: 'X3 M',
    years: { start: 2020, end: 2023 },
    title: 'Cooling System Heat Soak During Track/Spirited Driving - F97 X3 M / F98 X4 M',
    severity: 'moderate',
    description: 'The F97 X3 M and F98 X4 M Competition suffer from cooling system heat soak during sustained high-performance driving, track days, or extended spirited driving. The S58 engine produces tremendous heat in a relatively compact SUV engine bay with less airflow than sedan/coupe M cars. The factory intercooler and radiator are adequate for street driving but become overwhelmed during track sessions, causing intake air temperatures to rise significantly and triggering the engine ECU to pull timing and reduce boost for thermal protection. This results in noticeable power loss after 2-3 hot laps. Additionally, the factory coolant expansion tank and hoses experience elevated stress from sustained high temperatures, accelerating wear on plastic components and hose connections.',
    symptoms: [
      'Noticeable power loss after 2-3 hard laps on track (heat soak)',
      'Coolant temperature gauge climbing above normal during spirited driving',
      'Engine enters thermal protection mode with reduced boost',
      'Longer cooldown periods needed between hard driving sessions',
      'Coolant expansion tank cracking at seams (high mileage + track use)',
      'Intercooler efficiency dropping measurably with infrared thermometer'
    ],
    solution: 'For track use: Upgrade intercooler to do88 front-mount intercooler ($1,200-$1,800) - the community standard for S58 heat management. Add CSF high-performance radiator ($600-$900) for sustained track work. Dinan or VRSF also offer intercooler upgrades in the $1,000-$1,500 range. For street/canyon driving: Stock cooling is adequate but ensure coolant flush every 2 years/30,000 miles and inspect expansion tank for cracks. Replace coolant expansion tank preemptively at 60,000 miles if car is driven hard. For all X3 M/X4 M: Use BMW coolant only (mixed 50/50 with distilled water), replace thermostat at 80,000 miles preventatively, inspect all coolant hoses for bulging or softening at every oil change.',
    estimatedCost: { min: 200, max: 3000 },
    recallInfo: 'No official recall.',
    communityRecommendations: [
      {
        type: 'part',
        content: 'do88 front-mount intercooler is the Bimmerpost community standard for S58 cooling - significant reduction in intake temps during track use. ~$1,500 installed.',
        partBrand: 'do88',
        partName: 'S58 Front Mount Intercooler Radiator',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'CSF high-performance radiator ($600-$900) for sustained track work. Pair with do88 intercooler for complete cooling solution. VRSF and Dinan also offer quality intercooler options.',
        partBrand: 'CSF',
        partName: 'High-Performance Radiator (S58)',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'The X3 M/X4 M are heavy SUVs generating massive heat on track. Budget 3 cool-down laps for every 3 hot laps to protect engine and drivetrain. Track insurance is strongly recommended.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Use BMW coolant ONLY mixed 50/50 with distilled water. Aftermarket coolant can cause gasket and seal deterioration in the S58 cooling system. Flush every 2 years or 30,000 miles.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-x3m-differential-bolt-2020',
    make: 'BMW',
    model: 'X3 M',
    years: { start: 2020, end: 2023 },
    title: 'Rear Differential Mounting Bolt & Bush Failure - F97 X3 M / F98 X4 M',
    severity: 'high',
    description: 'The F97 X3 M and F98 X4 M have a well-documented rear differential mounting bolt weakness. The factory diff bolts and end bushings were undersized for the 503hp S58 engine\'s torque output, particularly when combined with the additional stress from the xDrive AWD system. Under hard acceleration, track use, or with any power modifications, the factory diff bolt can stretch or shear, allowing the differential to move in its housing. This causes drivetrain vibration, clunking, and in severe cases, differential failure that can damage driveshafts and the transfer case. FJ Motorwerkes developed the definitive upgrade kit after documenting multiple failures on both stock and tuned X3 M/X4 M vehicles. Their upgraded bolt is 39% stronger than even BMW\'s revised replacement bolt.',
    symptoms: [
      'Clunking or banging noise from rear during hard acceleration',
      'Drivetrain vibration felt through floor and seats',
      'Rear differential movement visible if car is put on lift',
      'Driveshaft vibration at highway speeds',
      'In severe cases: differential housing cracks or diff bolt shears completely',
      'Increased noise and vibration that worsens over time'
    ],
    solution: 'Replace factory differential bolt, bush, and collar with FJ Motorwerkes uprated diff bolt and collar upgrade kit. The FJ kit uses premium CNC-machined stainless steel components that can handle 170,000 PSI (39% stronger than BMW\'s revised bolt). Kit price approximately $255 (GBP). Available from FJ Motorwerkes directly, BMG Performance, AM Tuning, and H4ck Performance. Installation is straightforward - rear differential does not need to be fully removed. Budget $400-$600 total including labor. This upgrade is considered MANDATORY by the X3 M/X4 M community for any car making stock or above power. JXB Performance also offers a driveshaft carrier bearing upgrade for cars experiencing propshaft vibration as a companion fix.',
    estimatedCost: { min: 400, max: 800 },
    recallInfo: 'No official recall. BMW released a revised bolt but it is still weaker than the FJ Motorwerkes aftermarket solution.',
    communityRecommendations: [
      {
        type: 'part',
        content: 'FJ Motorwerkes rear differential bush, bolt & collar upgrade kit is THE definitive fix. CNC stainless steel, 170,000 PSI rating, 39% stronger than BMW revised bolt. ~$255 GBP. Exclusive to FJ Motorwerkes.',
        partBrand: 'FJ Motorwerkes',
        partName: 'X3 M/X4 M Rear Differential Bush Bolt Collar Upgrade Kit',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'This upgrade is considered MANDATORY by the F97/F98 community for ALL X3 M and X4 M vehicles - stock or tuned. Factory bolt is undersized for the S58\'s torque output. Don\'t wait for failure.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'JXB Performance driveshaft carrier bearing upgrade for F97/F98 - companion fix if experiencing propshaft vibration after diff bolt failure or as preventive maintenance.',
        partBrand: 'JXB Performance',
        partName: 'F97/F98 Driveshaft Center Support Bearing Carrier Upgrade',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'If your car is tuned above stock power, this is a DAY ONE upgrade. Multiple documented diff failures on Stage 1+ cars with factory bolts. Much cheaper than replacing the entire differential.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-x3m-brake-wear-2020',
    make: 'BMW',
    model: 'X3 M',
    years: { start: 2020, end: 2023 },
    title: 'Accelerated Brake Pad & Rotor Wear from Vehicle Weight - F97 X3 M / F98 X4 M',
    severity: 'moderate',
    description: 'The F97 X3 M and F98 X4 M weigh approximately 4,400-4,600 lbs, making them among the heaviest M cars BMW produces. This mass combined with the S58\'s 503hp output places enormous demands on the braking system. The factory Brembo 4-piston front calipers with 395mm rotors provide excellent stopping power but consume brake pads and rotors at a significantly accelerated rate compared to lighter M cars. Front brake pads typically last only 15,000-25,000 miles in mixed driving and as little as 5,000-8,000 miles with track use. Rotors show wear scoring and minimum thickness faster than expected. Rear brakes wear faster than expected because the xDrive system loads the rear axle heavily during braking. Brembo GT big brake kits are available for owners who track these vehicles.',
    symptoms: [
      'Brake pad wear sensor warning activates earlier than expected (15,000-25,000 miles)',
      'Visible scoring and grooving on brake rotors',
      'Brake dust accumulation significantly heavier than non-M BMWs',
      'Brake fade during spirited driving or after 2-3 hard stops from speed',
      'Squealing or grinding noise when braking (worn past minimum thickness)',
      'Pulsation or vibration in brake pedal (warped rotors from heat)'
    ],
    solution: 'Front brake replacement: OEM front rotor (34118054825 left, matching right) with OEM M compound pads. Complete OEM front brake kit available from BimmerWorld (34108064561K1, ~$800-$1,000). Rear brake kit similarly priced. For track use: Upgrade to Brembo GT brake pad set (BM8 compound) for improved heat resistance and longer pad life. EBC Yellowstuff or Hawk HPS 5.0 pads are popular street/track compromise choices ($150-$250 per axle). StopTech slotted rotors offer improved heat dissipation. For dedicated track cars: Brembo GT big brake kit with 412x38mm discs available ($4,000-$6,000 installed). Budget $2,000-$3,000 per year for brake maintenance if driving spiritedly. Use high-temperature brake fluid (Motul RBF 660 or ATE Typ 200) and flush every 12 months.',
    estimatedCost: { min: 800, max: 6000 },
    recallInfo: 'No official recall.',
    communityRecommendations: [
      {
        type: 'part',
        content: 'OEM front brake kit from BimmerWorld (34108064561K1) includes rotors and M compound pads at better price than dealer. Rear kit also available. ~$800-$1,000 per axle.',
        partBrand: 'Genuine BMW',
        partNumber: '34108064561K1',
        partName: 'OEM Front Brake Replacement Kit (F97 X3 M / F98 X4 M)',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'EBC Yellowstuff pads are the popular street/track compromise - longer life than OEM with better heat resistance. ~$200 per axle. Hawk HPS 5.0 also popular.',
        partBrand: 'EBC',
        partName: 'Yellowstuff Brake Pads (F97/F98)',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Flush brake fluid every 12 months with Motul RBF 660 or ATE Typ 200 if tracking or driving hard. BMW DOT4 absorbs moisture quickly and loses performance - $30 fluid change prevents $3,000 caliper damage.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Budget $2,000-$3,000 per year for brake maintenance if you drive the X3 M/X4 M spiritedly. These are 4,500 lb SUVs with 500+ hp - brakes are a consumable, not a one-time cost.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-x3m-transfer-case-2020',
    make: 'BMW',
    model: 'X3 M',
    years: { start: 2020, end: 2023 },
    title: 'xDrive Transfer Case Stress & Fluid Degradation - F97 X3 M / F98 X4 M',
    severity: 'moderate',
    description: 'The F97 X3 M and F98 X4 M use BMW\'s M xDrive transfer case to distribute the S58\'s 503hp between front and rear axles. The transfer case is subjected to extreme stress during hard launches, track use, and spirited driving, and the factory-fill transfer case fluid degrades faster than BMW\'s recommended service interval suggests. Degraded fluid causes harsh shifting, clunking during direction changes, and accelerated internal component wear. Unevenly worn or mismatched tires create additional stress on the transfer case by forcing the system to constantly compensate for differing wheel speeds. On tuned vehicles (Stage 1+), the increased torque can overwhelm the transfer case, especially during hard launches. Regular fluid changes at shorter intervals than BMW recommends is the community consensus for preventing expensive transfer case failure.',
    symptoms: [
      'Clunking or grinding noise during low-speed turns (parking lot maneuvers)',
      'Harsh shifting or delayed engagement when accelerating from stop',
      'Drivetrain vibration at highway speeds',
      'Transfer case warning lights or fault codes',
      'xDrive malfunction warning on dashboard',
      'Binding sensation during tight turns (especially on dry pavement)'
    ],
    solution: 'Change transfer case fluid every 30,000 miles (BMW says "lifetime fill" - this is NOT correct for M vehicles driven hard). Use BMW DTF-1 transfer case fluid or equivalent high-quality synthetic. Check tire tread depth at every service - all 4 tires must be within 2/32" of each other to prevent transfer case stress. Rotate tires every 5,000-7,000 miles. If transfer case actuator motor fails: FCP Euro guide for BMW transfer case actuator repair (part number varies by production date, ~$300-$600). For tuned cars: Consider transfer case brace/reinforcement and shortened fluid change intervals (every 15,000 miles). Complete transfer case replacement if internals are damaged: $3,000-$5,500 at independent specialist, $5,000-$8,000+ at dealer.',
    estimatedCost: { min: 200, max: 8000 },
    recallInfo: 'No official recall.',
    communityRecommendations: [
      {
        type: 'warning',
        content: 'BMW claims "lifetime fill" for transfer case fluid - this is FALSE for M vehicles driven hard. Change every 30,000 miles (15,000 if tuned or tracked). $200 fluid change prevents $5,000+ transfer case replacement.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Keep all 4 tires within 2/32" tread depth of each other. Mismatched tires force the xDrive system to constantly compensate, dramatically accelerating transfer case wear. Rotate every 5,000-7,000 miles.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Use BMW DTF-1 transfer case fluid or equivalent high-quality synthetic. Do NOT use generic ATF - wrong specification fluid causes accelerated wear and harsh shifting.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'FCP Euro has an excellent DIY guide for BMW transfer case actuator repair. The actuator motor is often the first component to fail and is replaceable without removing the entire transfer case.',
        upvotes: 0,
        needsReview: true
      }
    ]
  }
];

// Also add X4 M cross-references (same issues, different model name)
const bmwX4MIssues = bmwX3MX4MIssues.map(issue => ({
  ...issue,
  id: issue.id.replace('x3m', 'x4m'),
  model: 'X4 M',
  title: issue.title.replace('F97 X3 M', 'F98 X4 M').replace('F97 X3M', 'F98 X4M')
}));

// Add X3 M issues
let addedCount = 0;
let skippedCount = 0;

bmwX3MX4MIssues.forEach(issue => {
  const existingIndex = knownIssues.issues.findIndex(i => i.id === issue.id);
  if (existingIndex === -1) {
    knownIssues.issues.push(issue);
    addedCount++;
    console.log(`Added: ${issue.title}`);
  } else {
    skippedCount++;
    console.log(`Skipped (already exists): ${issue.title}`);
  }
});

// Add X4 M issues
bmwX4MIssues.forEach(issue => {
  const existingIndex = knownIssues.issues.findIndex(i => i.id === issue.id);
  if (existingIndex === -1) {
    knownIssues.issues.push(issue);
    addedCount++;
    console.log(`Added: ${issue.title}`);
  } else {
    skippedCount++;
    console.log(`Skipped (already exists): ${issue.title}`);
  }
});

fs.writeFileSync(knownIssuesPath, JSON.stringify(knownIssues, null, 2));

console.log(`\nDone! Added ${addedCount} BMW X3 M / X4 M issues (${skippedCount} skipped).`);
console.log(`Total issues in database: ${knownIssues.issues.length}`);
