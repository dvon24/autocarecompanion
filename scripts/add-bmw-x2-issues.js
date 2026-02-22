const fs = require('fs');
const path = require('path');

const knownIssuesPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const knownIssues = JSON.parse(fs.readFileSync(knownIssuesPath, 'utf8'));

const bmwX2Issues = [
  {
    id: 'bmw-x2-oil-filter-housing-2018',
    make: 'BMW',
    model: 'X2',
    years: { start: 2018, end: 2023 },
    title: 'B48 Oil Filter Housing Gasket Leak/Cracking',
    severity: 'high',
    description: 'The B48 2.0L turbo engine in X2 models (2018-2023) has a plastic oil filter housing that cracks from heat cycling, typically around 55,000-65,000 miles. The plastic housing becomes brittle over time and develops cracks that allow oil and coolant to mix, potentially causing catastrophic engine damage if not caught early. This is a design flaw - the plastic housing is mounted near the hot turbo and exhaust manifold where temperatures cause premature degradation. When the housing cracks, oil and coolant can cross-contaminate, leading to milky oil, overheating, and engine failure. Aftermarket aluminum upgrade housings ($250-350) are recommended over OEM plastic replacement to permanently solve the issue.',
    symptoms: [
      'Oil leak visible around oil filter housing area',
      'Coolant and oil mixing (milky residue on dipstick or oil cap)',
      'Burning oil smell from engine bay',
      'Coolant level dropping without visible external leak',
      'Oil spots under vehicle near front of engine',
      'Overheating due to coolant loss'
    ],
    solution: 'Replace the cracked oil filter housing. OEM plastic housing replacement (BMW 11428596283, $412 dealer) will eventually crack again. RECOMMENDED: Install aftermarket aluminum upgrade housing ($250-350) which permanently eliminates the heat-cycling crack issue. FCP Euro kit 11428596283KT ($450) includes all gaskets and seals. If coolant and oil have mixed, perform complete oil flush and coolant system flush before installing new housing. Check for engine damage if contamination was prolonged.',
    estimatedCost: { min: 250, max: 3000 },
    recallInfo: 'No official recall. Known design flaw on B48 engines.',
    communityRecommendations: [
      {
        type: 'part',
        content: 'Aftermarket aluminum oil filter housing upgrade ($250-350) permanently solves the cracking issue. OEM plastic replacement will eventually crack again.',
        partBrand: 'Aftermarket',
        partName: 'Aluminum Oil Filter Housing Upgrade',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'FCP Euro kit 11428596283KT ($450) includes OEM housing with all gaskets and seals for complete repair.',
        partBrand: 'FCP Euro',
        partName: 'Oil Filter Housing Kit 11428596283KT',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'If you see milky residue on dipstick or oil cap, STOP DRIVING immediately. Coolant/oil mixing can destroy engine bearings within days.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Inspect oil filter housing at every oil change after 50k miles. Catching a crack early prevents coolant/oil mixing and catastrophic engine damage.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-x2-water-pump-2018',
    make: 'BMW',
    model: 'X2',
    years: { start: 2018, end: 2023 },
    title: 'Electric Water Pump Failure',
    severity: 'moderate',
    description: 'The electric water pump in X2 models (2018-2023) fails suddenly at 60,000-80,000 miles with no warning signs. Unlike belt-driven pumps that gradually weaken, electric pumps fail completely and instantly, stopping all coolant circulation and causing rapid engine overheating. The pump\'s internal circuit board or motor fails, often from coolant intrusion or thermal cycling. When the pump stops, the engine can overheat within minutes, potentially causing warped cylinder heads and blown head gaskets ($3,000-6,000+ in additional damage). There is no gradual degradation - the pump works one moment and fails the next.',
    symptoms: [
      'Engine overheating rapidly without warning',
      'Coolant temperature gauge spiking to red',
      'Steam from engine bay or radiator area',
      'Engine overheating warning message on dashboard',
      'Coolant leak near water pump area',
      'No heat from cabin heater (pump not circulating coolant)'
    ],
    solution: 'Replace the electric water pump. OEM pump 11518678905 ($160-350). Replace thermostat 11537644811 ($150-250) at same time since labor overlaps significantly. PREVENTIVE: Consider replacing water pump at 60,000-70,000 miles before failure occurs to avoid being stranded. If engine overheats, PULL OVER IMMEDIATELY and shut off engine - do NOT drive. Call tow truck; driving with overheating engine warps cylinder heads ($3,000+ damage).',
    estimatedCost: { min: 500, max: 1500 },
    recallInfo: 'No official recall. Known wear item on BMW electric water pumps.',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Replace water pump preventively at 60,000-70,000 miles before sudden failure. Electric pumps fail with zero warning - you won\'t get a chance to prepare.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Replace thermostat when doing water pump - labor is 80% done already. Saves $200-300 in future labor if thermostat fails separately.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'If engine overheats, STOP IMMEDIATELY and shut off engine. Do not drive - call tow truck. Driving with overheating causes $3,000-6,000 in head gasket/cylinder damage.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'OEM water pump 11518678905 ($160-350) recommended. Avoid cheap aftermarket pumps - they fail prematurely on BMW applications.',
        partBrand: 'BMW',
        partName: 'Electric Water Pump 11518678905',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-x2-transmission-jerking-2018',
    make: 'BMW',
    model: 'X2',
    years: { start: 2018, end: 2020 },
    title: 'Aisin 8-Speed Transmission Jerking',
    severity: 'moderate',
    description: 'The Aisin 8-speed automatic transmission in 2018-2020 X2 models suffers from oil pump neck wear and calibration issues causing jerking during shifts, particularly in 2nd and 3rd gears. The transmission also exhibits delayed reverse engagement. BMW issued TSB GBSEL-SELP24 acknowledging the issue. Early models may be addressed with a software recalibration update, but severe cases with oil pump neck wear require mechanical repair or transmission replacement. The oil pump neck wears internally due to design tolerances, causing pressure fluctuations that result in harsh, jerky shifts.',
    symptoms: [
      'Jerking or harsh shifts in 2nd and 3rd gears',
      'Delayed engagement when shifting into reverse',
      'Hesitation between gear changes',
      'Rough low-speed shifting',
      'Transmission shudder during light acceleration',
      'Clunking noise when shifting'
    ],
    solution: 'Start with transmission software recalibration at BMW dealer ($200-500) which may resolve calibration-related shifting issues. If software update does not resolve, transmission may require oil pump replacement or internal repair ($2,000-5,000). In severe cases with extensive oil pump neck wear, complete transmission replacement required ($5,000-7,000). Reference TSB GBSEL-SELP24 when visiting dealer.',
    estimatedCost: { min: 200, max: 7000 },
    recallInfo: 'TSB: GBSEL-SELP24. No official recall.',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Reference TSB GBSEL-SELP24 when visiting BMW dealer - ensures they address the known calibration and oil pump neck wear issue.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Try software recalibration first ($200-500) before agreeing to expensive mechanical repair. Many cases resolve with updated transmission software.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Don\'t ignore jerking shifts - oil pump neck wear worsens over time and can lead to complete transmission failure requiring $5,000-7,000 replacement.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-x2-valve-cover-gasket-2018',
    make: 'BMW',
    model: 'X2',
    years: { start: 2018, end: 2023 },
    title: 'Valve Cover Gasket Oil Leak',
    severity: 'low',
    description: 'X2 models (2018-2023) develop valve cover gasket oil leaks at around 70,000+ miles as a routine wear item. The gasket deteriorates from heat cycling, hardening and cracking over time. Oil seeps from the valve cover mating surface, dripping onto exhaust manifold and other engine components, causing burning oil smell and visible smoke. While not immediately catastrophic, the leak worsens over time and low oil levels from ongoing leak can damage engine internals. This is a common maintenance item on all BMW engines and should be budgeted for around 70,000-80,000 miles.',
    symptoms: [
      'Oil visible on valve cover edges or engine sides',
      'Burning oil smell from engine bay',
      'Oil dripping onto exhaust manifold causing smoke',
      'Oil spots under vehicle',
      'Low oil level warnings',
      'Oil residue on spark plug wells'
    ],
    solution: 'Replace valve cover gasket. Genuine BMW valve cover assembly 11127611278 ($200-350) includes integrated gasket. Labor typically 2-3 hours ($300-500). Total cost $700-1,000 at shop. DIY possible with basic tools to save $300-500 in labor. Replace spark plug tube seals at same time if applicable - labor overlap saves money. Monitor oil level between repairs.',
    estimatedCost: { min: 700, max: 1000 },
    recallInfo: 'No recall. Routine maintenance item on all BMW engines.',
    communityRecommendations: [
      {
        type: 'part',
        content: 'Genuine BMW valve cover 11127611278 ($200-350) includes integrated gasket. Preferred over separate gasket replacement for B48 engine.',
        partBrand: 'BMW',
        partName: 'Valve Cover Assembly 11127611278',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Budget for valve cover gasket replacement around 70,000-80,000 miles. Part of BMW ownership - not a defect, just a wear item.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Replace spark plug tube seals at same time as valve cover gasket - labor overlaps significantly and prevents future oil-fouled spark plugs.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-x2-crankshaft-sensor-recall-2018',
    make: 'BMW',
    model: 'X2',
    years: { start: 2018, end: 2019 },
    title: 'Crankshaft Sensor Firmware Defect (NHTSA Recall)',
    severity: 'high',
    description: 'Certain 2018-2019 BMW X2 models have a crankshaft sensor with incorrect firmware that can cause engine stalling or no-start conditions. The defective firmware in the crankshaft position sensor provides incorrect signal readings to the engine control module (ECM), causing the engine to stall unexpectedly while driving or fail to start. This affects approximately 5,309 vehicles. NHTSA issued a recall in September 2018. Stalling while driving poses a serious safety hazard, especially at highway speeds where sudden loss of power can cause accidents. The repair is FREE under the recall - BMW dealers will reprogram or replace the crankshaft sensor at no cost.',
    symptoms: [
      'Engine stalling unexpectedly while driving',
      'Engine fails to start (no-start condition)',
      'Intermittent engine cut-out',
      'Check engine light with crankshaft sensor codes',
      'Loss of power while driving'
    ],
    solution: 'This is a FREE repair under NHTSA recall (September 2018). Contact BMW dealer to check VIN for recall eligibility. Dealer will reprogram or replace the crankshaft sensor firmware at no charge. Do not attempt DIY repair - this requires dealer-level programming. 5,309 vehicles affected.',
    estimatedCost: { min: 0, max: 0 },
    recallInfo: 'NHTSA Recall (September 2018). 5,309 vehicles affected. FREE repair at BMW dealer.',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Check VIN with BMW dealer or NHTSA.gov for recall eligibility. Repair is completely FREE - do not pay for this fix.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'If experiencing stalling while driving, schedule recall repair IMMEDIATELY. Stalling at highway speed is extremely dangerous.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'When buying used 2018-2019 X2, check NHTSA.gov recall database to verify this recall was completed. If not, have it done at dealer for free before driving.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-x2-tie-rod-recall-2019',
    make: 'BMW',
    model: 'X2',
    years: { start: 2019, end: 2019 },
    title: 'Steering Tie Rod Assembly Defect (NHTSA Recall)',
    severity: 'high',
    description: 'Certain 2019 BMW X2 models have a defective steering tie rod assembly that can cause steering looseness and clunking. The tie rod end ball joint may have been manufactured with insufficient torque or defective materials, leading to premature wear and potential separation. If the tie rod separates while driving, the driver can lose steering control, posing a serious crash hazard. NHTSA issued a recall in October 2019. The repair is FREE under the recall - BMW dealers will inspect and replace the tie rod assembly at no cost.',
    symptoms: [
      'Steering wheel looseness or excessive play',
      'Clunking noise when turning steering wheel',
      'Vehicle pulling to one side',
      'Uneven tire wear',
      'Steering feels vague or imprecise',
      'Knocking noise from front suspension area'
    ],
    solution: 'This is a FREE repair under NHTSA recall (October 2019). Contact BMW dealer to check VIN for recall eligibility. Dealer will inspect and replace the steering tie rod assembly at no charge. Do not drive if experiencing significant steering looseness - tow to dealer. After repair, have alignment checked.',
    estimatedCost: { min: 0, max: 0 },
    recallInfo: 'NHTSA Recall (October 2019). FREE repair at BMW dealer.',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Check VIN with BMW dealer or NHTSA.gov for recall eligibility. Repair is completely FREE - do not pay for this fix.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'If experiencing steering looseness or clunking, DO NOT DRIVE. Tie rod separation at speed can cause complete loss of steering control. Tow to dealer.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'When buying used 2019 X2, check NHTSA.gov recall database to verify this recall was completed. Have alignment checked after repair.',
        upvotes: 0,
        needsReview: true
      }
    ]
  }
];

// Add new issues to the known issues array
knownIssues.issues.push(...bmwX2Issues);

// Write back to file
fs.writeFileSync(knownIssuesPath, JSON.stringify(knownIssues, null, 2));

console.log(`\u2713 Successfully added ${bmwX2Issues.length} BMW X2 issues`);
console.log(`  Total issues in database: ${knownIssues.issues.length}`);
console.log('\nAdded:');
bmwX2Issues.forEach(issue => {
  console.log(`  - ${issue.title} (${issue.years.start}-${issue.years.end})`);
});
