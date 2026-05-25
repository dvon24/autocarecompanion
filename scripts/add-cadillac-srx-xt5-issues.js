const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const knownIssues = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Cadillac SRX (2004-2016) and XT5 (2017-2025)
// SRX 1st Gen (2004-2009): 3.6L/4.6L Northstar V8
// SRX 2nd Gen (2010-2016): 3.0L/3.6L V6, 2.8T V6 (turbo, rare)
// XT5 (2017-2025): 3.6L V6, 2.0T I4 (2020+)
// Also: XT4 (2019-2025): 2.0T LSY, XT6 (2020-2025): 3.6L V6

const cadillacCrossoverIssues = [
  {
    id: 'cadillac-srx-timing-chain-2010',
    make: 'Cadillac',
    model: 'SRX',
    years: { start: 2010, end: 2016 },
    title: '3.6L V6 Timing Chain Stretch - SRX',
    severity: 'high',
    category: 'engine',
    description: 'The 2010-2016 SRX with the 3.6L V6 (LFX/LF1) has the same endemic timing chain stretch issue as the CTS. The three timing chains and plastic guides wear prematurely between 80,000-120,000 miles. The SRX is the best-selling Cadillac of this era, making this one of the most common and costly Cadillac repairs. Chain stretch causes misfires, timing codes, rough running, and potential catastrophic engine damage if the chain jumps. The chain-driven water pump also commonly fails at similar mileage.',
    symptoms: [
      'Check engine light with P0008, P0009, P0016-P0019 codes',
      'Rattling noise from engine on cold start',
      'Rough idle or misfires',
      'Reduced engine power / limp mode',
      'Coolant leak from water pump (chain-driven, internal)'
    ],
    solution: 'Complete timing chain replacement with all three chains, guides, tensioners, and sprockets. Replace the chain-driven water pump at the same time. Cloyes 9-0753S is the recommended aftermarket kit. Labor is 10-14 hours. This is the same repair as the CTS/ATS 3.6L timing chain issue.',
    estimatedCost: { min: 2500, max: 4500 },
    recallTSB: 'GM TSB #10-06-01-007 - Timing chain wear on 3.6L V6',
    communityRecommendations: [
      {
        type: 'part',
        content: 'Cloyes 9-0753S timing chain kit - complete kit with all 3 chains, improved guides, tensioners, and sprockets',
        partBrand: 'Cloyes',
        partName: 'Complete Timing Chain Kit (3.6L V6)',
        partNumber: '9-0753S',
        upvotes: 0
      },
      {
        type: 'part',
        content: 'AC Delco 251-749 water pump - chain-driven, replace during timing chain job while cover is off',
        partBrand: 'AC Delco',
        partName: 'Water Pump (3.6L V6)',
        partNumber: '251-749',
        upvotes: 0
      },
      {
        type: 'warning',
        content: '3.6L is interference engine - jumped timing chain WILL destroy the engine. Do not ignore chain rattle.',
        upvotes: 0
      }
    ]
  },
  {
    id: 'cadillac-srx-cue-screen-2013',
    make: 'Cadillac',
    model: 'SRX',
    years: { start: 2013, end: 2016 },
    title: 'CUE Infotainment Touchscreen Delamination',
    severity: 'moderate',
    category: 'electrical',
    description: 'The 2013-2016 SRX with the CUE infotainment system has the same touchscreen delamination issue as the CTS and other Cadillacs. The screen develops bubbles, becomes unresponsive, or cracks from internal adhesive failure. Controls climate, audio, navigation, and vehicle settings.',
    symptoms: [
      'Screen appears bubbly or cloudy',
      'Touch inputs not registering',
      'Screen cracks without physical impact',
      'Screen goes black intermittently'
    ],
    solution: 'Replace the CUE screen with OEM (GM 23106488) or aftermarket unit. Straightforward DIY replacement - screen snaps out with trim tools. Apply screen protector after installation.',
    estimatedCost: { min: 150, max: 700 },
    recallTSB: 'GM Customer Satisfaction Program #14311',
    communityRecommendations: [
      {
        type: 'part',
        content: 'OEM Cadillac CUE replacement screen 23106488 - factory replacement, updated adhesive',
        partBrand: 'GM',
        partName: 'CUE Touchscreen Assembly',
        partNumber: '23106488',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Aftermarket CUE screens at $150-200 from Amazon work well - easy DIY with plastic trim removal tools',
        upvotes: 0
      }
    ]
  },
  {
    id: 'cadillac-srx-liftgate-2010',
    make: 'Cadillac',
    model: 'SRX',
    years: { start: 2010, end: 2016 },
    title: 'Power Liftgate Motor and Strut Failure',
    severity: 'low',
    category: 'electrical',
    description: 'The 2010-2016 SRX power liftgate system commonly fails due to worn liftgate struts (gas springs) and motor failure. The struts lose pressure causing the liftgate to sag, fall closed, or not stay open. The power liftgate motor can also fail, making automatic open/close non-functional. This is a convenience issue rather than a safety concern.',
    symptoms: [
      'Liftgate does not stay open / falls down',
      'Power liftgate opens slowly or won\'t open fully',
      'Power liftgate motor makes grinding noise',
      'Liftgate button on key fob/dash stops working',
      'Liftgate opens but won\'t close automatically'
    ],
    solution: 'Replace liftgate gas struts (pair) for sagging liftgate - straightforward DIY. Power liftgate motor replacement requires interior trim removal. Some owners disable the power feature and use manual operation to avoid motor replacement cost.',
    estimatedCost: { min: 100, max: 600 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'Stabilus SG230117 liftgate gas strut (pair) - OE supplier, direct fit replacement',
        partBrand: 'Stabilus',
        partName: 'Liftgate Gas Strut',
        partNumber: 'SG230117',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Replace both struts at the same time even if only one is weak - the other is close behind',
        upvotes: 0
      }
    ]
  },
  {
    id: 'cadillac-xt5-transmission-shudder-2017',
    make: 'Cadillac',
    model: 'XT5',
    years: { start: 2017, end: 2025 },
    title: '8-Speed / 9-Speed Transmission Shudder and Harsh Shifting',
    severity: 'moderate',
    category: 'transmission',
    description: 'The Cadillac XT5 uses an 8-speed (2017-2019) or 9-speed (2020+) automatic transmission. The 8-speed shares the torque converter shudder issue with other GM 8-speed vehicles. The 9-speed (GM 9T50/9T65) can have harsh shifts, delayed engagement, and shift hunting. Both transmissions have been subject to multiple software calibration updates from GM. The 9-speed is particularly sensitive to fluid condition and requires proper Dexron HP fluid.',
    symptoms: [
      'Shudder at light throttle between 25-50 mph (8-speed)',
      'Harsh or clunky 1-2 shift',
      'Delayed engagement from Park to Drive',
      'Transmission hunting between gears on hills (9-speed)',
      'Hesitation on acceleration from stop'
    ],
    solution: 'First step is a TCM software update at the dealer - multiple calibrations have been released. For 8-speed shudder, a fluid exchange with Mobil 1 LV ATF HP may resolve it. The 9-speed typically responds well to software updates. Persistent issues may require torque converter replacement (8-speed) or valve body replacement (9-speed).',
    estimatedCost: { min: 200, max: 3500 },
    recallTSB: 'Multiple GM TSBs for transmission shift quality calibrations',
    communityRecommendations: [
      {
        type: 'part',
        content: 'Mobil 1 Synthetic LV ATF HP 19417577 - updated fluid spec for GM 8/9-speed transmissions',
        partBrand: 'Mobil 1',
        partName: 'Synthetic LV ATF HP',
        partNumber: '19417577',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Ask dealer for the latest TCM calibration update - GM has released multiple revisions that significantly improve shift quality',
        upvotes: 0
      }
    ]
  },
  {
    id: 'cadillac-xt5-timing-chain-2017',
    make: 'Cadillac',
    model: 'XT5',
    years: { start: 2017, end: 2025 },
    title: '3.6L V6 Timing Chain Issues (XT5 V6 models)',
    severity: 'high',
    category: 'engine',
    description: 'The XT5 V6 models use the GM 3.6L V6 (LGX) which has improved timing chains over earlier versions but is not immune to timing chain stretch at higher mileage. The LGX is better than the earlier LFX but still uses three timing chains with plastic guides. Issues typically appear later (100,000-150,000 miles) compared to earlier 3.6L variants. The 2020+ XT5 2.0T models use a different engine (LSY) and are not affected by this issue.',
    symptoms: [
      'Check engine light with timing correlation codes',
      'Rattling on cold start',
      'Rough idle or misfires at high mileage',
      'Reduced engine power warning'
    ],
    solution: 'Same timing chain replacement as SRX/CTS 3.6L. Cloyes 9-0753S kit, replace water pump simultaneously. The LGX timing chain typically lasts longer than the LFX, so preventive replacement at 100,000+ miles is recommended rather than the 80,000-mile interval for earlier engines.',
    estimatedCost: { min: 2500, max: 4500 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'Cloyes 9-0753S timing chain kit - complete kit for GM 3.6L V6',
        partBrand: 'Cloyes',
        partName: 'Complete Timing Chain Kit (3.6L V6)',
        partNumber: '9-0753S',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'The 2020+ XT5 with the 2.0T engine does NOT have this issue - only V6 models are affected',
        upvotes: 0
      }
    ]
  },
  {
    id: 'cadillac-xt4-turbo-issues-2019',
    make: 'Cadillac',
    model: 'XT4',
    years: { start: 2019, end: 2025 },
    title: '2.0T LSY Engine - PCV and Turbo Coolant Line Issues',
    severity: 'moderate',
    category: 'engine',
    description: 'The XT4 uses the 2.0T LSY engine which is an evolution of the LTG found in the ATS/CTS. The LSY has improved reliability but shares some issues including PCV system problems and turbo coolant line leaks. The turbo coolant lines can develop leaks at the connections, causing coolant loss and potential turbo damage from overheating. The PCV valve/cover can fail causing oil consumption. These issues typically appear between 40,000-80,000 miles.',
    symptoms: [
      'Coolant level dropping slowly',
      'Sweet smell from engine bay (coolant leak)',
      'Check engine light with misfire or lean codes',
      'Excessive oil consumption',
      'Turbo whistle changes or louder than normal'
    ],
    solution: 'Inspect turbo coolant lines and connections for leaks - replace lines if seeping. PCV system is integrated into valve cover - replace valve cover assembly if PCV fails. GM has released updated coolant line designs for some affected vehicles. Regular maintenance with full synthetic oil at 5,000-mile intervals is important for turbo health.',
    estimatedCost: { min: 200, max: 1500 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Check coolant level monthly - turbo coolant line leaks start small and can go unnoticed until the turbo overheats',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'The LSY 2.0T is generally reliable with proper maintenance - 5,000-mile oil changes with full synthetic are critical',
        upvotes: 0
      }
    ]
  },
  {
    id: 'cadillac-xt6-timing-chain-2020',
    make: 'Cadillac',
    model: 'XT6',
    years: { start: 2020, end: 2025 },
    title: '3.6L V6 Timing Chain Concern (XT6)',
    severity: 'moderate',
    category: 'engine',
    description: 'The XT6 uses the GM 3.6L V6 (LGX) which has a documented history of timing chain stretch across the GM lineup. While the LGX generation is improved over earlier 3.6L variants, the three-chain design with plastic guides remains a long-term reliability concern. Most XT6s are still too new for widespread timing chain failures, but owners should monitor for early signs and plan for preventive replacement around 100,000-120,000 miles based on the engine\'s history in other models.',
    symptoms: [
      'Rattling on cold start that goes away when warm',
      'Check engine light with timing correlation codes at higher mileage',
      'Rough idle developing gradually'
    ],
    solution: 'Monitor for timing chain rattle on cold starts. If codes or rattle develop, complete timing chain replacement is needed. Preventive replacement at 100,000-120,000 miles is wise based on the 3.6L\'s track record. Same Cloyes 9-0753S kit as other 3.6L applications.',
    estimatedCost: { min: 2500, max: 4500 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'Cloyes 9-0753S timing chain kit - proven kit for GM 3.6L V6 across all applications',
        partBrand: 'Cloyes',
        partName: 'Complete Timing Chain Kit (3.6L V6)',
        partNumber: '9-0753S',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Listen for a brief rattle on cold starts - this is the earliest sign of chain stretch and signals it is time to plan for replacement',
        upvotes: 0
      }
    ]
  }
];

console.log('Adding ' + cadillacCrossoverIssues.length + ' Cadillac SRX/XT5/XT4/XT6 issues...');
knownIssues.issues.push(...cadillacCrossoverIssues);

fs.writeFileSync(dbPath, JSON.stringify(knownIssues, null, 2));

console.log('Successfully added ' + cadillacCrossoverIssues.length + ' Cadillac crossover issues');
console.log('Total issues in database: ' + knownIssues.issues.length);
