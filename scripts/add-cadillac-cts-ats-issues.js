const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const knownIssues = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Cadillac CTS (2003-2019) and ATS (2013-2019)
// CTS 1st Gen (2003-2007): 3.2L/2.8L/3.6L V6
// CTS 2nd Gen (2008-2013): 3.0L/3.6L V6, 2.0T I4 (later)
// CTS 3rd Gen (2014-2019): 2.0T LTG, 3.6L LGX, 6.2L LT4 (V)
// ATS (2013-2019): 2.0T LTG, 2.5L I4, 3.6L V6

const cadillacCtsAtsIssues = [
  {
    id: 'cadillac-cts-timing-chain-2004',
    make: 'Cadillac',
    model: 'CTS',
    years: { start: 2004, end: 2015 },
    title: '3.6L V6 Timing Chain Stretch and Premature Failure',
    severity: 'high',
    category: 'engine',
    description: 'The GM 3.6L V6 (LY7, LLT, LFX variants) used in 2004-2015 CTS models is notorious for premature timing chain stretch, typically between 80,000-120,000 miles. The engine uses three timing chains (one primary, two secondary) and plastic chain guides that wear and break. When the chain stretches, it throws timing off, causing misfires and check engine lights. If the chain jumps or breaks, it can cause catastrophic valve-to-piston contact. This is the single most common and expensive CTS repair. GM updated the chain design for the 2012+ LFX variant, but early LFX engines still have issues.',
    symptoms: [
      'Check engine light with P0008, P0009, P0016, P0017, P0018, P0019 codes',
      'Rattling noise from engine on cold start',
      'Rough idle or misfires (P0300-P0306)',
      'Reduced engine power / limp mode',
      'Engine stalling at idle',
      'Engine will not start (chain has jumped)'
    ],
    solution: 'Complete timing chain replacement including all three chains, guides, tensioners, and sprockets. This is a major repair requiring front cover removal - labor is 10-14 hours. Must replace all three chains even if only one is stretched. Updated Cloyes kit includes improved chain guides. The water pump is driven off the timing chain and should be replaced at the same time. Preventive replacement at 80,000-100,000 miles is recommended for high-mileage 3.6L engines.',
    estimatedCost: { min: 2500, max: 4500 },
    recallTSB: 'GM TSB #10-06-01-007 - Timing chain wear on 3.6L V6',
    communityRecommendations: [
      {
        type: 'part',
        content: 'Cloyes 9-0753S timing chain kit - complete kit with all 3 chains, guides, tensioners, and sprockets. Improved guide material.',
        partBrand: 'Cloyes',
        partName: 'Complete Timing Chain Kit (3.6L V6)',
        partNumber: '9-0753S',
        upvotes: 0
      },
      {
        type: 'part',
        content: 'AC Delco 251-749 water pump - replace while timing cover is off, as it is chain-driven and frequently fails',
        partBrand: 'AC Delco',
        partName: 'Water Pump (3.6L V6)',
        partNumber: '251-749',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'When replacing timing chains, also replace the water pump (chain-driven) and cam position actuator solenoids. The labor overlap saves $500+',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'Do NOT ignore timing chain rattle - if the chain jumps, the interference engine will bend valves, turning a $3k repair into a $6-8k engine replacement',
        upvotes: 0
      }
    ]
  },
  {
    id: 'cadillac-cts-cue-screen-2013',
    make: 'Cadillac',
    model: 'CTS',
    years: { start: 2013, end: 2019 },
    title: 'CUE Infotainment Touchscreen Delamination and Failure',
    severity: 'moderate',
    category: 'electrical',
    description: 'The Cadillac User Experience (CUE) touchscreen system in 2013-2019 CTS models suffers from widespread screen delamination and touch response failure. The capacitive touchscreen develops bubbles, becomes unresponsive to touch, or cracks from internal adhesive failure. This is not caused by physical damage - the screen fails from internal delamination of the touch-sensitive layers. The CUE screen controls climate, audio, navigation, and vehicle settings, making it essential for daily operation. GM extended warranty to 4 years for some model years but many vehicles are beyond that coverage.',
    symptoms: [
      'Screen appears bubbly or cloudy',
      'Touch inputs not registering or registering wrong location',
      'Screen cracks without physical impact',
      'Screen goes black intermittently',
      'Climate and audio controls inaccessible',
      'Ghost touches - system activates features randomly'
    ],
    solution: 'The CUE screen can be replaced with an OEM unit ($400-700 from dealer) or an aftermarket replacement screen ($150-300 from CUE screen specialists). The replacement is a relatively straightforward DIY - the screen snaps out from the dashboard with trim removal tools. Several aftermarket companies sell improved replacement screens with better adhesive and touch layers. A screen overlay/protector can be applied to new screens to prevent future delamination.',
    estimatedCost: { min: 150, max: 700 },
    recallTSB: 'GM Customer Satisfaction Program #14311 - CUE screen replacement (limited coverage)',
    communityRecommendations: [
      {
        type: 'part',
        content: 'OEM Cadillac CUE replacement screen 23106488 - factory replacement with updated adhesive',
        partBrand: 'GM',
        partName: 'CUE Touchscreen Assembly',
        partNumber: '23106488',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Aftermarket CUE screens from eBay/Amazon at $150-200 work well and are easy DIY - just use plastic trim tools to pop out the old screen',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Apply a screen protector immediately after installing a new CUE screen to prevent future delamination from heat cycling',
        upvotes: 0
      }
    ]
  },
  {
    id: 'cadillac-ats-cue-screen-2013',
    make: 'Cadillac',
    model: 'ATS',
    years: { start: 2013, end: 2019 },
    title: 'CUE Infotainment Touchscreen Delamination and Failure',
    severity: 'moderate',
    category: 'electrical',
    description: 'The Cadillac User Experience (CUE) touchscreen in 2013-2019 ATS models has the same widespread delamination and touch failure issue as the CTS and other Cadillac models. The capacitive touchscreen develops bubbles, becomes unresponsive, or cracks from internal adhesive failure. Controls for climate, audio, navigation, and vehicle settings become inaccessible. Same root cause and fix as the CTS CUE screen issue.',
    symptoms: [
      'Screen appears bubbly or cloudy',
      'Touch inputs not registering or wrong location',
      'Screen cracks without physical impact',
      'Screen goes black intermittently',
      'Ghost touches activating features randomly'
    ],
    solution: 'Replace the CUE screen with OEM or aftermarket unit. The screen snaps out from the dashboard. Aftermarket screens from CUE screen specialists ($150-300) work well. Apply a screen protector after installation to prevent future delamination.',
    estimatedCost: { min: 150, max: 700 },
    recallTSB: 'GM Customer Satisfaction Program #14311 - CUE screen replacement (limited coverage)',
    communityRecommendations: [
      {
        type: 'part',
        content: 'OEM Cadillac CUE replacement screen 23106488 - factory replacement with updated adhesive',
        partBrand: 'GM',
        partName: 'CUE Touchscreen Assembly',
        partNumber: '23106488',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Check if your VIN qualifies for GM Customer Satisfaction Program 14311 before buying a screen',
        upvotes: 0
      }
    ]
  },
  {
    id: 'cadillac-cts-2.0t-turbo-2013',
    make: 'Cadillac',
    model: 'CTS',
    years: { start: 2014, end: 2019 },
    title: '2.0T LTG Turbo System Issues - PCV and Wastegate',
    severity: 'moderate',
    category: 'engine',
    description: 'The 2.0L turbocharged LTG engine in 2014-2019 CTS models has several documented issues. The PCV system integrated into the valve cover is prone to failure, causing oil consumption, rough idle, and boost leaks. The turbo wastegate actuator can fail, causing overboost or underboost conditions. The turbo oil feed and drain lines can clog, starving the turbo of lubrication. These issues typically appear between 50,000-100,000 miles. The LTG engine is otherwise reliable when these wear items are addressed.',
    symptoms: [
      'Check engine light with boost-related codes',
      'Excessive oil consumption (1qt per 2,000 miles)',
      'Rough idle or misfires',
      'Turbo whine or whistling noise changes',
      'Loss of boost / reduced acceleration',
      'Blue smoke on acceleration (turbo seal failure)'
    ],
    solution: 'Diagnose the specific failure. PCV valve cover replacement resolves most oil consumption and vacuum leak issues. Wastegate actuator can be replaced independently. Turbo oil lines should be inspected and cleaned or replaced. Complete turbo replacement is rarely needed unless oil starvation has damaged the bearings. Regular oil changes every 5,000 miles with full synthetic are critical for turbo longevity.',
    estimatedCost: { min: 300, max: 2500 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'GM 55573746 valve cover with integrated PCV - updated design that addresses oil consumption issue',
        partBrand: 'GM',
        partName: 'Valve Cover with PCV (LTG 2.0T)',
        partNumber: '55573746',
        upvotes: 0
      },
      {
        type: 'part',
        content: 'Dorman 911-198 turbo wastegate actuator - aftermarket replacement for failed wastegate',
        partBrand: 'Dorman',
        partName: 'Turbo Wastegate Actuator',
        partNumber: '911-198',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Use full synthetic oil and change every 5,000 miles (not the 7,500+ GM recommends) to protect the turbo bearings',
        upvotes: 0
      }
    ]
  },
  {
    id: 'cadillac-ats-2.0t-turbo-2013',
    make: 'Cadillac',
    model: 'ATS',
    years: { start: 2013, end: 2019 },
    title: '2.0T LTG Turbo System Issues - PCV and Wastegate',
    severity: 'moderate',
    category: 'engine',
    description: 'The 2.0L turbocharged LTG engine in 2013-2019 ATS models shares the same PCV valve cover failure, wastegate actuator issues, and turbo oil line problems as the CTS 2.0T. The PCV system integrated into the valve cover fails between 50,000-100,000 miles causing oil consumption and vacuum leaks. The wastegate actuator can fail causing boost control issues. Same root cause and fixes as the CTS 2.0T.',
    symptoms: [
      'Check engine light with boost-related codes',
      'Excessive oil consumption',
      'Rough idle or misfires',
      'Turbo whine or whistling changes',
      'Loss of boost / reduced acceleration',
      'Blue smoke on acceleration'
    ],
    solution: 'Replace valve cover with integrated PCV (GM 55573746) for oil consumption. Replace wastegate actuator if boost control issues. Turbo oil lines should be inspected. Regular 5,000-mile oil changes with full synthetic are critical.',
    estimatedCost: { min: 300, max: 2500 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'GM 55573746 valve cover with integrated PCV - updated design for the LTG 2.0T',
        partBrand: 'GM',
        partName: 'Valve Cover with PCV (LTG 2.0T)',
        partNumber: '55573746',
        upvotes: 0
      },
      {
        type: 'part',
        content: 'Dorman 911-198 turbo wastegate actuator - replacement for failed wastegate',
        partBrand: 'Dorman',
        partName: 'Turbo Wastegate Actuator',
        partNumber: '911-198',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'The LTG 2.0T is robust if maintained - 5,000-mile oil changes and prompt PCV replacement keep it running strong to 200k miles',
        upvotes: 0
      }
    ]
  },
  {
    id: 'cadillac-cts-rear-diff-2008',
    make: 'Cadillac',
    model: 'CTS',
    years: { start: 2008, end: 2019 },
    title: 'Rear Differential Noise and Failure (RWD/AWD)',
    severity: 'moderate',
    category: 'drivetrain',
    description: 'RWD and AWD CTS models (2nd and 3rd gen) can develop rear differential whine, clunking, and eventual bearing failure between 80,000-130,000 miles. The limited-slip differential clutch pack wears and the pinion bearings fail. AWD models have additional transfer case strain on the rear diff. Symptoms worsen gradually from a subtle whine to loud grinding. Regular differential fluid changes are often neglected, accelerating wear.',
    symptoms: [
      'Whining noise from rear that changes with speed',
      'Clunking on acceleration from stop',
      'Vibration felt through floor at highway speed',
      'Grinding noise on turns (limited-slip)',
      'Differential fluid leak at pinion seal'
    ],
    solution: 'Early-stage whine can sometimes be addressed with a differential fluid change using GM limited-slip additive. Advanced wear requires bearing replacement or complete differential rebuild. Pinion seal replacement is straightforward. For CTS-V or performance models, upgraded aftermarket differentials are available. Preventive fluid change every 30,000-50,000 miles significantly extends differential life.',
    estimatedCost: { min: 200, max: 2500 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'GM 19259115 limited-slip differential additive (4oz) - required when changing diff fluid on limited-slip equipped models',
        partBrand: 'GM',
        partName: 'Limited-Slip Differential Additive',
        partNumber: '19259115',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Change differential fluid every 30-50k miles with 75W-90 synthetic plus limited-slip additive - prevents most diff failures',
        upvotes: 0
      }
    ]
  },
  {
    id: 'cadillac-ats-timing-chain-2013',
    make: 'Cadillac',
    model: 'ATS',
    years: { start: 2013, end: 2019 },
    title: '3.6L V6 Timing Chain Stretch (ATS V6 models)',
    severity: 'high',
    category: 'engine',
    description: 'ATS models equipped with the 3.6L V6 (LFX/LGX) share the same timing chain stretch issue as the CTS. The three timing chains and plastic guides wear prematurely, typically between 80,000-120,000 miles. The 2013-2015 LFX variant is most affected; the 2016+ LGX has improved chains but is not immune. Chain stretch causes timing correlation codes, misfires, and potential catastrophic engine damage if the chain jumps.',
    symptoms: [
      'Check engine light with P0008, P0009, P0016-P0019 codes',
      'Rattling from engine on cold start',
      'Rough idle or misfires',
      'Reduced engine power / limp mode',
      'Engine stalling'
    ],
    solution: 'Complete timing chain replacement including all three chains, guides, tensioners, and sprockets. Replace water pump at the same time (chain-driven). Cloyes 9-0753S complete kit is the recommended aftermarket option. Labor is 10-14 hours.',
    estimatedCost: { min: 2500, max: 4500 },
    recallTSB: 'GM TSB #10-06-01-007 - Timing chain wear on 3.6L V6',
    communityRecommendations: [
      {
        type: 'part',
        content: 'Cloyes 9-0753S timing chain kit - complete kit with improved guide material for 3.6L V6',
        partBrand: 'Cloyes',
        partName: 'Complete Timing Chain Kit (3.6L V6)',
        partNumber: '9-0753S',
        upvotes: 0
      },
      {
        type: 'part',
        content: 'AC Delco 251-749 water pump - replace while timing cover is off, chain-driven pump frequently fails',
        partBrand: 'AC Delco',
        partName: 'Water Pump (3.6L V6)',
        partNumber: '251-749',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'The 3.6L is an interference engine - if the chain jumps, valves will contact pistons and destroy the engine',
        upvotes: 0
      }
    ]
  },
  {
    id: 'cadillac-cts-power-steering-2008',
    make: 'Cadillac',
    model: 'CTS',
    years: { start: 2008, end: 2013 },
    title: 'Electric Power Steering Rack Failure',
    severity: 'moderate',
    category: 'other',
    description: 'The 2nd generation CTS (2008-2013) uses an electric power steering rack that can fail, causing heavy or intermittent steering assist. The electric motor integrated into the steering rack wears out, or the steering control module loses communication. Symptoms include sudden loss of power steering assist (steering becomes very heavy), intermittent assist that cuts in and out, and steering warning lights. The entire rack assembly must be replaced as the motor is not serviceable separately.',
    symptoms: [
      'POWER STEERING or SERVICE STEERING warning on dash',
      'Steering suddenly becomes very heavy',
      'Intermittent power steering assist',
      'Clunking noise when turning steering wheel',
      'Steering feels different effort left vs right'
    ],
    solution: 'The electric power steering rack must be replaced as a complete assembly. OEM replacement is expensive. Remanufactured racks from Detroit Axle or Cardone are available at significant savings. The rack replacement is 3-5 hours labor and requires a steering alignment after installation.',
    estimatedCost: { min: 800, max: 2000 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'Cardone 1G-1816 remanufactured electric power steering rack - tested and warrantied rebuild',
        partBrand: 'Cardone',
        partName: 'Remanufactured EPS Rack',
        partNumber: '1G-1816',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Before replacing the rack, check the steering column intermediate shaft - a worn u-joint can cause similar clunking symptoms at much lower cost',
        upvotes: 0
      }
    ]
  }
];

console.log('Adding ' + cadillacCtsAtsIssues.length + ' Cadillac CTS/ATS issues...');
knownIssues.issues.push(...cadillacCtsAtsIssues);

fs.writeFileSync(dbPath, JSON.stringify(knownIssues, null, 2));

console.log('Successfully added ' + cadillacCtsAtsIssues.length + ' Cadillac CTS/ATS issues');
console.log('Total issues in database: ' + knownIssues.issues.length);
