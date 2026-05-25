const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const knownIssues = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Cadillac Legacy Sedans
// DeVille (1994-2005): 4.6L Northstar V8
// DTS (2006-2011): 4.6L Northstar V8
// Seville (1998-2004): 4.6L Northstar SLS/STS
// Eldorado (1992-2002): 4.6L Northstar (coupe)
// XTS (2013-2019): 3.6L V6

const cadillacLegacySedanIssues = [
  {
    id: 'cadillac-deville-northstar-head-gasket-1994',
    make: 'Cadillac',
    model: 'DeVille',
    years: { start: 1994, end: 2005 },
    title: 'Northstar 4.6L V8 Head Bolt/Head Gasket Failure',
    severity: 'high',
    category: 'engine',
    description: 'The Cadillac Northstar 4.6L V8 is infamous for head gasket failure caused by the head bolts pulling out of the aluminum engine block. The original design used steel bolts threaded directly into the aluminum block without inserts, and the threads strip over time from heat cycling. This causes coolant to enter the cylinders and exhaust gases to enter the cooling system. The issue typically occurs between 100,000-150,000 miles but can happen earlier. This is one of the most well-known engine failures in automotive history and affects every Northstar-powered Cadillac (DeVille, DTS, Seville, Eldorado). The repair requires engine removal and Time-Sert or Norm\'s head stud installation.',
    symptoms: [
      'Coolant loss with no visible external leak',
      'White smoke from exhaust (coolant burning)',
      'Overheating, especially in stop-and-go traffic',
      'Milky residue on oil cap or dipstick',
      'Bubbles in coolant overflow tank (exhaust gas)',
      'Sweet smell from exhaust',
      'Engine misfires when cold'
    ],
    solution: 'The definitive fix is removing the engine and installing Time-Sert or Norm\'s Northstar head stud inserts in all head bolt holes, then installing new head gaskets. The head studs clamp the heads properly and prevent the bolts from pulling out of the aluminum block. This repair requires engine removal (the engine comes out the bottom of the car) and is 20-30 hours of labor. Some shops specialize in Northstar head repairs. A "back-yard" chemical head gasket sealer (like Blue Devil) may temporarily slow the leak but is NOT a permanent fix. Prevention: use Dex-Cool coolant and change every 5 years.',
    estimatedCost: { min: 3000, max: 6000 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'Norm\'s Northstar Head Stud Kit - the gold standard fix. Stainless steel studs with threaded inserts for all head bolt holes. Prevents repeat failure permanently.',
        partBrand: "Norm's Northstar",
        partName: 'Head Stud Kit (Northstar 4.6L)',
        partNumber: 'NNHSK-46',
        upvotes: 0
      },
      {
        type: 'part',
        content: 'Time-Sert 4460 Big-Sert thread repair kit - alternative to Norm\'s studs, steel inserts installed in existing bolt holes',
        partBrand: 'Time-Sert',
        partName: 'Big-Sert Thread Repair Kit (Northstar)',
        partNumber: '4460',
        upvotes: 0
      },
      {
        type: 'part',
        content: 'Fel-Pro 26542PT head gasket set - quality head gaskets for Northstar rebuild',
        partBrand: 'Fel-Pro',
        partName: 'Head Gasket Set (Northstar 4.6L)',
        partNumber: '26542PT',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Find a shop that specializes in Northstar head jobs - the engine must come out the bottom and requires specialized knowledge. CadillacForums.com has a list of recommended shops.',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'Chemical head gasket sealers (Blue Devil, Bar\'s Leaks) are band-aids that may buy time but WILL NOT permanently fix the stripped threads. They can also clog the heater core.',
        upvotes: 0
      }
    ]
  },
  {
    id: 'cadillac-dts-northstar-head-gasket-2006',
    make: 'Cadillac',
    model: 'DTS',
    years: { start: 2006, end: 2011 },
    title: 'Northstar 4.6L V8 Head Bolt/Head Gasket Failure',
    severity: 'high',
    category: 'engine',
    description: 'The 2006-2011 DTS (DeVille\'s successor) continues to use the Northstar 4.6L V8 with the same head bolt thread-stripping issue. GM made minor improvements to the later Northstar engines (L37 and LD8 variants) but never fully resolved the fundamental design flaw of steel bolts in aluminum threads. The DTS Northstar is slightly improved over the DeVille era but still fails at 100,000-150,000+ miles. Same symptoms, same repair as the DeVille.',
    symptoms: [
      'Coolant loss with no visible external leak',
      'White smoke from exhaust',
      'Overheating in stop-and-go traffic',
      'Milky residue on oil cap',
      'Bubbles in coolant overflow',
      'Sweet exhaust smell'
    ],
    solution: 'Same as DeVille - engine removal and Norm\'s head stud or Time-Sert installation with new head gaskets. The DTS engine drops out the bottom. Find a Northstar specialist shop for the best results.',
    estimatedCost: { min: 3000, max: 6000 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'Norm\'s Northstar Head Stud Kit NNHSK-46 - permanent fix for head bolt thread stripping',
        partBrand: "Norm's Northstar",
        partName: 'Head Stud Kit (Northstar 4.6L)',
        partNumber: 'NNHSK-46',
        upvotes: 0
      },
      {
        type: 'part',
        content: 'Fel-Pro 26542PT head gasket set for Northstar 4.6L',
        partBrand: 'Fel-Pro',
        partName: 'Head Gasket Set (Northstar 4.6L)',
        partNumber: '26542PT',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'When buying a used DTS, have a cooling system pressure test done and check for exhaust gases in the coolant before purchase',
        upvotes: 0
      }
    ]
  },
  {
    id: 'cadillac-seville-northstar-head-gasket-1998',
    make: 'Cadillac',
    model: 'Seville',
    years: { start: 1998, end: 2004 },
    title: 'Northstar 4.6L V8 Head Bolt/Head Gasket Failure',
    severity: 'high',
    category: 'engine',
    description: 'The 1998-2004 Seville SLS and STS use the same Northstar 4.6L V8 with the identical head bolt thread-stripping problem as the DeVille and DTS. The Seville STS uses the higher-output 300hp version which may be slightly more prone due to higher thermal stress. Same failure mechanism: steel head bolts pull out of aluminum block threads at 100,000-150,000 miles.',
    symptoms: [
      'Coolant loss with no visible external leak',
      'White smoke from exhaust',
      'Overheating',
      'Milky oil cap residue',
      'Bubbles in coolant overflow',
      'Engine misfires when cold'
    ],
    solution: 'Engine removal and Norm\'s head stud or Time-Sert installation. Same repair as DeVille/DTS. The Seville\'s engine also exits through the bottom of the car.',
    estimatedCost: { min: 3000, max: 6000 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'Norm\'s Northstar Head Stud Kit NNHSK-46 - permanent fix',
        partBrand: "Norm's Northstar",
        partName: 'Head Stud Kit (Northstar 4.6L)',
        partNumber: 'NNHSK-46',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'A used Seville STS with unknown history is a gamble - always get a cooling system test before buying. The head job costs more than many of these cars are worth.',
        upvotes: 0
      }
    ]
  },
  {
    id: 'cadillac-eldorado-northstar-head-gasket-1993',
    make: 'Cadillac',
    model: 'Eldorado',
    years: { start: 1993, end: 2002 },
    title: 'Northstar 4.6L V8 Head Bolt/Head Gasket Failure',
    severity: 'high',
    category: 'engine',
    description: 'The 1993-2002 Eldorado was one of the first vehicles to receive the Northstar 4.6L V8 and has the same head bolt/head gasket failure. Early Northstar engines (1993-1995) are particularly prone as the design was less refined. The Eldorado ETC (Touring Coupe) uses the high-output 300hp Northstar. Same failure mechanism and repair as all Northstar-powered Cadillacs.',
    symptoms: [
      'Coolant loss with no visible external leak',
      'White smoke from exhaust',
      'Overheating',
      'Milky oil residue',
      'Bubbles in coolant overflow'
    ],
    solution: 'Engine removal and head stud/Time-Sert installation. Given the age and value of Eldorados, many owners must weigh repair cost ($3-6k) against vehicle value. Eldorado enthusiasts still perform the repair for collector vehicles.',
    estimatedCost: { min: 3000, max: 6000 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'Norm\'s Northstar Head Stud Kit NNHSK-46 - permanent fix for head bolt threads',
        partBrand: "Norm's Northstar",
        partName: 'Head Stud Kit (Northstar 4.6L)',
        partNumber: 'NNHSK-46',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'For collector Eldorados, the head stud repair is worth it. For daily drivers, weigh repair cost against vehicle value carefully.',
        upvotes: 0
      }
    ]
  },
  {
    id: 'cadillac-northstar-oil-consumption-1994',
    make: 'Cadillac',
    model: 'DeVille',
    years: { start: 1994, end: 2005 },
    title: 'Northstar V8 Excessive Oil Consumption',
    severity: 'moderate',
    category: 'engine',
    description: 'Northstar 4.6L engines are known for consuming significant amounts of oil, often 1 quart per 1,000-2,000 miles. The root causes include worn piston rings, valve stem seal degradation, and the PCV system design. The Northstar was designed with tight tolerances and low-tension piston rings for efficiency, which contributes to oil consumption as the engine ages. High oil consumption is so common on Northstars that GM considered up to 1 quart per 2,000 miles "acceptable." This affects all Northstar-powered vehicles (DeVille, DTS, Seville, Eldorado).',
    symptoms: [
      'Need to add oil between changes',
      'Blue-gray smoke on startup or acceleration',
      'Oil level drops 1-2 quarts between changes',
      'Fouled spark plugs on one or more cylinders',
      'Oil spots on driveway'
    ],
    solution: 'Mild oil consumption (1qt/2,000mi) can be managed by checking oil regularly and topping off. Switching to a higher viscosity oil (10W-30 instead of 5W-30) and using a high-mileage oil with seal conditioners can reduce consumption. Severe cases (1qt/1,000mi or worse) may require piston ring replacement, which is a major engine-out repair. Most owners manage it with regular oil checks rather than pursuing an expensive repair on an aging vehicle.',
    estimatedCost: { min: 50, max: 4000 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Check oil level every 500 miles on a Northstar - running low on oil accelerates wear and can cause bearing failure',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Valvoline High Mileage MaxLife 10W-30 with seal conditioners can reduce consumption by 30-50% on high-mileage Northstars',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'The Northstar has no low oil pressure warning until damage is imminent - always check the dipstick manually',
        upvotes: 0
      }
    ]
  },
  {
    id: 'cadillac-xts-timing-chain-2013',
    make: 'Cadillac',
    model: 'XTS',
    years: { start: 2013, end: 2019 },
    title: '3.6L V6 Timing Chain Stretch - XTS',
    severity: 'high',
    category: 'engine',
    description: 'The 2013-2019 XTS uses the GM 3.6L V6 (LFX, then LGX from 2016+) with the same timing chain stretch issue affecting CTS, SRX, and other GM 3.6L vehicles. The three timing chains and plastic guides wear prematurely between 80,000-120,000 miles. XTS models with the twin-turbo 3.6L (V-Sport) can have even earlier chain wear from the additional thermal stress.',
    symptoms: [
      'Check engine light with P0008, P0009, P0016-P0019',
      'Engine rattle on cold start',
      'Rough idle or misfires',
      'Reduced engine power',
      'Engine stalling'
    ],
    solution: 'Complete timing chain replacement - all three chains, guides, tensioners, sprockets. Replace water pump simultaneously. Cloyes 9-0753S kit recommended. 10-14 hours labor.',
    estimatedCost: { min: 2500, max: 4500 },
    recallTSB: 'GM TSB #10-06-01-007',
    communityRecommendations: [
      {
        type: 'part',
        content: 'Cloyes 9-0753S timing chain kit - complete kit with improved guides for 3.6L V6',
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
      }
    ]
  },
  {
    id: 'cadillac-xts-cue-screen-2013',
    make: 'Cadillac',
    model: 'XTS',
    years: { start: 2013, end: 2019 },
    title: 'CUE Infotainment Touchscreen Delamination - XTS',
    severity: 'moderate',
    category: 'electrical',
    description: 'The 2013-2019 XTS has the same CUE touchscreen delamination issue as all Cadillac CUE-equipped vehicles. The capacitive touchscreen develops bubbles, becomes unresponsive, or cracks from internal adhesive failure. The XTS was commonly used as a livery/fleet vehicle, and the CUE screen failure is widespread in the fleet community.',
    symptoms: [
      'Screen appears bubbly or cloudy',
      'Touch inputs not registering',
      'Screen cracks without impact',
      'Screen goes black intermittently'
    ],
    solution: 'Replace CUE screen with OEM (GM 23106488) or aftermarket unit. Straightforward DIY.',
    estimatedCost: { min: 150, max: 700 },
    recallTSB: 'GM Customer Satisfaction Program #14311',
    communityRecommendations: [
      {
        type: 'part',
        content: 'OEM CUE replacement screen 23106488 - updated adhesive',
        partBrand: 'GM',
        partName: 'CUE Touchscreen Assembly',
        partNumber: '23106488',
        upvotes: 0
      }
    ]
  }
];

console.log('Adding ' + cadillacLegacySedanIssues.length + ' Cadillac DeVille/DTS/Seville/Eldorado/XTS issues...');
knownIssues.issues.push(...cadillacLegacySedanIssues);

fs.writeFileSync(dbPath, JSON.stringify(knownIssues, null, 2));

console.log('Successfully added ' + cadillacLegacySedanIssues.length + ' Cadillac legacy sedan issues');
console.log('Total issues in database: ' + knownIssues.issues.length);
