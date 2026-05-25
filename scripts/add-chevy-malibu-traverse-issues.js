const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const knownIssues = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Malibu (2008-2024): 2.4L Ecotec, 1.5T/2.0T, 1.8L Hybrid
// Traverse (2009-2025): 3.6L V6, 2.0T (2024+)
// Impala (2006-2020): 3.5L/3.9L V6, 2.5L/3.6L V6
// Cruze (2011-2019): 1.4T Ecotec, 1.6T diesel
// Blazer (2019-2025): 2.0T/2.5L/3.6L V6
// Trax (2015-2025): 1.4T Ecotec, 1.2T (2024+)
// Trailblazer (2021-2025): 1.2T/1.3T Ecotec

const chevyRemainingIssues = [
  // Malibu
  {
    id: 'chevy-malibu-transmission-2016',
    make: 'Chevrolet',
    model: 'Malibu',
    years: { start: 2016, end: 2024 },
    title: '9-Speed Automatic Transmission Shudder and Harsh Shifting',
    severity: 'moderate',
    category: 'transmission',
    description: 'The 2016+ Malibu with the 1.5T engine uses a GM/Ford co-developed 9-speed automatic (9T50) that can exhibit shudder, harsh shifts, and delayed engagement. The 9-speed is sensitive to fluid condition and requires proper DEXRON HP fluid. GM has released multiple TCM calibration updates. The 2.0T Malibu uses a different 9-speed (9T65) with similar but less frequent issues.',
    symptoms: [
      'Shudder at light throttle 25-50 mph',
      'Harsh 1-2 and 3-4 shifts',
      'Delayed engagement from Park to Drive',
      'Hunting between gears on hills',
      'Hesitation on acceleration'
    ],
    solution: 'TCM software update at dealer is first step. Fluid exchange with Mobil 1 LV ATF HP can improve shift quality. For persistent shudder, valve body replacement may be needed.',
    estimatedCost: { min: 200, max: 2500 },
    recallTSB: 'Multiple GM TSBs for 9T50/9T65 shift calibration',
    communityRecommendations: [
      {
        type: 'part',
        content: 'Mobil 1 Synthetic LV ATF HP (GM 19417577) - updated DEXRON HP fluid for 9-speed transmissions',
        partBrand: 'Mobil 1',
        partName: 'Synthetic LV ATF HP',
        partNumber: '19417577',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Ask dealer for the latest TCM recalibration - GM has released many revisions that improve 9-speed shift quality',
        upvotes: 0
      }
    ]
  },
  {
    id: 'chevy-malibu-1.5t-pcv-2016',
    make: 'Chevrolet',
    model: 'Malibu',
    years: { start: 2016, end: 2024 },
    title: '1.5T LFV/LYX Engine PCV System and Oil Consumption',
    severity: 'moderate',
    category: 'engine',
    description: 'The 1.5L turbocharged engine in 2016+ Malibu has a PCV system integrated into the valve cover that commonly fails, causing excessive oil consumption, rough idle, and check engine lights. The PCV diaphragm ruptures, creating a vacuum leak and allowing oil to be ingested into the intake. This is the same engine family as the Equinox 1.5T. GM has released an updated valve cover design.',
    symptoms: [
      'Excessive oil consumption (1qt per 2,000 miles)',
      'Check engine light with lean or misfire codes',
      'Rough idle, especially when cold',
      'Oil in intake manifold or intercooler',
      'Whistling noise from engine (vacuum leak)'
    ],
    solution: 'Replace valve cover assembly which includes the integrated PCV system. GM updated design is less prone to failure. Check for oil contamination in the intercooler and intake - clean if found.',
    estimatedCost: { min: 300, max: 800 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'GM 12690058 updated valve cover assembly with integrated PCV - revised diaphragm design for 1.5T LFV/LYX',
        partBrand: 'GM',
        partName: 'Valve Cover with PCV (1.5T)',
        partNumber: '12690058',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'After replacing the valve cover, check the intercooler for oil contamination - oil ingestion through the failed PCV can coat the intercooler',
        upvotes: 0
      }
    ]
  },
  // Traverse
  {
    id: 'chevy-traverse-timing-chain-2009',
    make: 'Chevrolet',
    model: 'Traverse',
    years: { start: 2009, end: 2017 },
    title: '3.6L V6 Timing Chain Stretch',
    severity: 'high',
    category: 'engine',
    description: 'The 1st gen Traverse (2009-2017) uses the GM 3.6L V6 with the same endemic timing chain stretch issue affecting CTS, SRX, and other GM 3.6L vehicles. Three timing chains with plastic guides wear prematurely between 80,000-120,000 miles. This is one of the highest-volume 3.6L applications, making it extremely common. The chain-driven water pump also fails at similar mileage.',
    symptoms: [
      'Check engine light with P0008, P0009, P0016-P0019',
      'Engine rattle on cold start',
      'Rough idle or misfires',
      'Reduced engine power / limp mode',
      'Coolant leak (water pump failure)'
    ],
    solution: 'Complete timing chain replacement with all three chains, guides, tensioners, and sprockets. Replace water pump simultaneously. Cloyes 9-0753S kit recommended. 10-14 hours labor.',
    estimatedCost: { min: 2500, max: 4500 },
    recallTSB: 'GM TSB #10-06-01-007',
    communityRecommendations: [
      {
        type: 'part',
        content: 'Cloyes 9-0753S complete timing chain kit - all 3 chains, improved guides, tensioners, sprockets for GM 3.6L V6',
        partBrand: 'Cloyes',
        partName: 'Complete Timing Chain Kit (3.6L V6)',
        partNumber: '9-0753S',
        upvotes: 0
      },
      {
        type: 'part',
        content: 'AC Delco 251-749 water pump - chain-driven, replace during timing chain job',
        partBrand: 'AC Delco',
        partName: 'Water Pump (3.6L V6)',
        partNumber: '251-749',
        upvotes: 0
      },
      {
        type: 'warning',
        content: '3.6L is interference engine - if chain jumps, valves hit pistons. Do not ignore cold-start rattle.',
        upvotes: 0
      }
    ]
  },
  {
    id: 'chevy-traverse-transmission-2018',
    make: 'Chevrolet',
    model: 'Traverse',
    years: { start: 2018, end: 2025 },
    title: '9-Speed Automatic Transmission Issues',
    severity: 'moderate',
    category: 'transmission',
    description: 'The 2nd gen Traverse (2018+) uses the GM 9T65 9-speed automatic which can exhibit harsh shifts, delayed engagement, and shudder. Similar to other GM 9-speed applications. GM has released multiple TCM calibration updates that significantly improve shift quality.',
    symptoms: [
      'Harsh or clunky shifts',
      'Delayed Park to Drive engagement',
      'Shudder at light throttle',
      'Hunting between gears'
    ],
    solution: 'TCM recalibration at dealer with latest software. Fluid exchange with correct DEXRON HP fluid. Most issues resolve with software updates.',
    estimatedCost: { min: 0, max: 2000 },
    recallTSB: 'Multiple GM TSBs for 9T65 calibration',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Ask dealer for the latest TCM calibration - most Traverse transmission complaints are resolved with software updates',
        upvotes: 0
      }
    ]
  },
  // Impala
  {
    id: 'chevy-impala-transmission-2006',
    make: 'Chevrolet',
    model: 'Impala',
    years: { start: 2006, end: 2013 },
    title: '4-Speed Automatic Transmission Failure (4T65E)',
    severity: 'high',
    category: 'transmission',
    description: 'The 2006-2013 Impala uses the GM 4T65E 4-speed automatic transmission which is known for internal failures between 100,000-150,000 miles. The most common failure is the 1-2 accumulator piston crack, the pressure control solenoid wear, and the input drum sprag clutch failure. Hard or delayed shifts, slipping, and complete failure are all documented. The 4T65E is also used in many other GM front-wheel-drive vehicles of this era.',
    symptoms: [
      'Hard or delayed 1-2 shift',
      'Transmission slipping on acceleration',
      'Shudder when shifting gears',
      'No reverse or delayed reverse engagement',
      'Check engine light with P0741, P0742 (TCC codes)',
      'Transmission overheating warning'
    ],
    solution: 'Rebuild the 4T65E with updated accumulator piston, pressure control solenoid, and sprag clutch. A remanufactured transmission is often more cost-effective than a rebuild. Sonnax offers updated internal components for rebuilders. Regular transmission fluid changes every 30,000 miles with Dexron VI significantly extend transmission life.',
    estimatedCost: { min: 1500, max: 3500 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'Sonnax 34994-01K accumulator piston kit - updated design that fixes the cracking issue',
        partBrand: 'Sonnax',
        partName: '4T65E Accumulator Piston Kit',
        partNumber: '34994-01K',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Change transmission fluid every 30k miles with Dexron VI - the 4T65E is reliable with regular fluid changes but fails when neglected',
        upvotes: 0
      }
    ]
  },
  {
    id: 'chevy-impala-power-steering-2014',
    make: 'Chevrolet',
    model: 'Impala',
    years: { start: 2014, end: 2020 },
    title: 'Electric Power Steering Assist Motor Failure',
    severity: 'moderate',
    category: 'other',
    description: 'The 2014-2020 Impala uses an electric power steering system with a motor mounted on the steering column. The motor can fail, causing loss of power steering assist (steering becomes very heavy). The steering control module can also lose communication, triggering warnings. GM issued a recall for some model years.',
    symptoms: [
      'POWER STEERING or SERVICE STEERING warning',
      'Steering suddenly becomes heavy',
      'Intermittent power steering assist',
      'Clunking noise from steering column'
    ],
    solution: 'Replace the electric power steering motor/column assembly. Remanufactured units available from Cardone. Recall coverage may apply - check with dealer.',
    estimatedCost: { min: 600, max: 1500 },
    recallTSB: 'NHTSA Recall 14V-047 (certain 2014 Impala)',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Check if your VIN is covered under the EPS recall before paying for repair',
        upvotes: 0
      }
    ]
  },
  // Cruze
  {
    id: 'chevy-cruze-coolant-leak-2011',
    make: 'Chevrolet',
    model: 'Cruze',
    years: { start: 2011, end: 2015 },
    title: '1.4T Ecotec Coolant Leak - Water Outlet and Thermostat Housing',
    severity: 'high',
    category: 'cooling',
    description: 'The 1st gen Cruze with the 1.4L turbocharged Ecotec (LUJ/LUV) is notorious for coolant leaks from the plastic water outlet/thermostat housing. The plastic housing cracks from thermal cycling, causing coolant loss and potential overheating. This is the #1 Cruze reliability complaint. The coolant reservoir (surge tank) also cracks. Multiple components in the cooling system use failure-prone plastic. GM redesigned the water outlet in later production.',
    symptoms: [
      'Coolant level dropping',
      'Sweet smell from engine bay',
      'Visible coolant leak near thermostat housing',
      'Overheating warning',
      'Steam from engine bay',
      'Cracked coolant reservoir (surge tank)'
    ],
    solution: 'Replace the water outlet/thermostat housing. The updated GM design (12652328) uses improved plastic. Many Cruze owners also replace the coolant surge tank and all coolant hoses as a preventive package. An aftermarket aluminum water outlet eliminates the plastic cracking issue entirely.',
    estimatedCost: { min: 150, max: 500 },
    recallTSB: 'GM TSB #15-NA-100 - Coolant leak from water outlet',
    communityRecommendations: [
      {
        type: 'part',
        content: 'GM 12652328 updated water outlet housing - revised plastic design less prone to cracking',
        partBrand: 'GM',
        partName: 'Water Outlet/Thermostat Housing (1.4T)',
        partNumber: '12652328',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'When replacing the water outlet, also replace the coolant surge tank (reservoir) - it cracks at similar mileage and is cheap ($30-50)',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'Do not ignore coolant leaks on the 1.4T - the engine overheats quickly without coolant and can warp the head',
        upvotes: 0
      }
    ]
  },
  {
    id: 'chevy-cruze-turbo-oil-2011',
    make: 'Chevrolet',
    model: 'Cruze',
    years: { start: 2011, end: 2019 },
    title: '1.4T Turbo Oil Feed Line Leak and PCV Issues',
    severity: 'moderate',
    category: 'engine',
    description: 'The Cruze 1.4T has a turbo oil feed line that can crack or leak, starving the turbo of lubrication. The PCV system (integrated into the valve cover on later models) also fails, causing oil consumption and vacuum leaks. The valve cover with integrated PCV is a common replacement item. Turbo oil feed line leaks drip onto the exhaust manifold, causing a burning oil smell.',
    symptoms: [
      'Burning oil smell',
      'Oil drip from turbo area onto exhaust',
      'Turbo noise changes or gets louder',
      'Excessive oil consumption',
      'Rough idle (PCV failure)',
      'Check engine light with lean codes'
    ],
    solution: 'Inspect turbo oil feed line for cracks - replace if leaking. Replace valve cover assembly for PCV failures. Both are relatively affordable repairs. Use full synthetic oil and change every 5,000 miles to protect the turbo.',
    estimatedCost: { min: 150, max: 600 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'tip',
        content: 'The turbo oil feed line is a $20-30 part and easy to inspect visually - check it at every oil change',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Use full synthetic oil and change every 5,000 miles on the 1.4T - turbo longevity depends on clean oil',
        upvotes: 0
      }
    ]
  },
  // Blazer
  {
    id: 'chevy-blazer-transmission-2019',
    make: 'Chevrolet',
    model: 'Blazer',
    years: { start: 2019, end: 2025 },
    title: '9-Speed Transmission Shift Quality Issues',
    severity: 'moderate',
    category: 'transmission',
    description: 'The Blazer uses the GM 9T50 (2.0T/2.5L FWD) or 9T65 (3.6L AWD) 9-speed automatic with similar shift quality concerns as other GM 9-speed applications. Harsh shifts, delayed engagement, and shudder at light throttle are reported. GM has released multiple TCM calibration updates.',
    symptoms: [
      'Harsh or clunky shifts',
      'Shudder at light throttle',
      'Delayed shift from Park',
      'Gear hunting on hills'
    ],
    solution: 'TCM recalibration with latest software. Fluid exchange with Mobil 1 LV ATF HP. Most issues resolve with software updates.',
    estimatedCost: { min: 0, max: 2000 },
    recallTSB: 'Multiple GM TSBs for 9-speed calibration',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Ask dealer for the latest TCM calibration - this resolves most Blazer transmission complaints',
        upvotes: 0
      }
    ]
  },
  // Trax/Trailblazer
  {
    id: 'chevy-trax-turbo-2015',
    make: 'Chevrolet',
    model: 'Trax',
    years: { start: 2015, end: 2022 },
    title: '1.4T Ecotec Turbo and Coolant Issues',
    severity: 'moderate',
    category: 'engine',
    description: 'The Trax uses the same 1.4T Ecotec engine as the Cruze with similar issues: turbo oil feed line leaks, PCV system failures, and coolant system plastic component cracking. The coolant outlet/thermostat housing is the most common failure point.',
    symptoms: [
      'Coolant leak from thermostat housing area',
      'Burning oil smell from turbo area',
      'Rough idle',
      'Overheating warning'
    ],
    solution: 'Same fixes as Cruze 1.4T - replace water outlet, inspect turbo oil lines, replace valve cover for PCV issues.',
    estimatedCost: { min: 150, max: 600 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'GM 12652328 updated water outlet housing - same part as Cruze 1.4T',
        partBrand: 'GM',
        partName: 'Water Outlet/Thermostat Housing (1.4T)',
        partNumber: '12652328',
        upvotes: 0
      }
    ]
  }
];

console.log('Adding ' + chevyRemainingIssues.length + ' Chevrolet Malibu/Traverse/Impala/Cruze/Blazer/Trax issues...');
knownIssues.issues.push(...chevyRemainingIssues);

fs.writeFileSync(dbPath, JSON.stringify(knownIssues, null, 2));

console.log('Successfully added ' + chevyRemainingIssues.length + ' Chevrolet remaining model issues');
console.log('Total issues in database: ' + knownIssues.issues.length);
