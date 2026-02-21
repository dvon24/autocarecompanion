const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const knownIssues = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// BMW 4 Series issues (F32/F33/F36: 2014-2020, G22/G23/G26: 2021-2023)
// Shares platform with 3 Series, so many common issues
// F32/F33/F36: 428i (N20), 430i (B46), 435i/440i (N55/B58)
// G22/G23/G26: 430i (B46/B48), M440i (B58)

const bmw4SeriesIssues = [
  {
    id: 'bmw-4series-n20-timing-chain-2014',
    make: 'BMW',
    model: '4 Series',
    years: { start: 2014, end: 2016 },
    title: 'N20 Timing Chain Premature Failure - 428i F32/F33/F36',
    severity: 'high',
    description: 'The N20 2.0L turbocharged engine in 428i models suffers from premature timing chain stretch and guide failure, typically occurring between 40,000-80,000 miles. The single-row timing chain design is inadequate for the engine\'s power output. Chain stretch causes the timing to jump, leading to rough running, poor performance, and potential catastrophic engine damage if the chain breaks. BMW issued a class action settlement covering 8 years/100,000 miles. This is identical to the N20 timing chain issue in 328i/X3/X5 models using the same engine.',
    symptoms: [
      'Rattling noise from engine on cold start (first 5 seconds)',
      'Check engine light with timing correlation codes (P0016, P0017, P0018, P0019)',
      'Rough idle or misfires',
      'Loss of power or hesitation on acceleration',
      'Engine won\'t start after chain failure'
    ],
    solution: 'Complete timing chain kit replacement including chain, guides, tensioner, and sprockets. Must be performed by experienced BMW technician. Preventive replacement recommended at 60,000-80,000 miles. BMW extended warranty to 8 years/100,000 miles under class action settlement. Upgraded reinforced chain kit available from aftermarket.',
    estimatedCost: { min: 2500, max: 4500 },
    recallTSB: 'Class Action Settlement - 8yr/100k miles coverage for N20 engine timing chain',
    communityRecommendations: [
      {
        type: 'part',
        content: 'BMW OEM Timing Chain Kit (11318648732KT) is the factory replacement - includes chain, guides, tensioner, and sprockets',
        partBrand: 'BMW',
        partName: 'N20 Timing Chain Kit',
        partNumber: '11318648732KT',
        needsReview: true
      },
      {
        type: 'part',
        content: 'FCP Euro offers lifetime warranty on timing chain kit - popular choice for preventive replacement',
        partBrand: 'FCP Euro',
        partName: 'Lifetime Warranty Timing Chain Kit',
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Check if your VIN is covered under the class action settlement - BMW will cover repair costs up to 100k miles',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Listen for chain rattle on cold starts - if present, get it inspected ASAP before chain breaks',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'Do NOT ignore timing chain rattle - chain failure will cause catastrophic engine damage requiring full engine replacement ($15k+)',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'If check engine light comes on with timing codes, stop driving immediately - tow to shop to prevent valve damage',
        upvotes: 0
      }
    ]
  },
  {
    id: 'bmw-4series-n55-vanos-solenoid-2014',
    make: 'BMW',
    model: '4 Series',
    years: { start: 2014, end: 2018 },
    title: 'N55 VANOS Solenoid Failure - 435i/440i F32/F33/F36',
    severity: 'moderate',
    description: 'The N55 3.0L turbocharged inline-6 engine in 435i and early 440i models experiences VANOS (Variable Valve Timing) solenoid failures. These solenoids control oil flow to the VANOS system for variable valve timing. Internal wear causes them to stick or fail, leading to rough running, power loss, and check engine lights. The intake VANOS solenoid (cylinder head front) fails more frequently than the exhaust solenoid. Oil contamination and sludge accelerate failure. This is a common issue shared with N55-powered 335i, 535i, and X5 35i models.',
    symptoms: [
      'Rough idle or engine stumble',
      'Check engine light with VANOS codes (P0011, P0012, P0021, P0022)',
      'Loss of power or poor throttle response',
      'Increased fuel consumption',
      'Cold start rough running that improves when warm'
    ],
    solution: 'Replace failed VANOS solenoid(s). Both intake and exhaust solenoids should be inspected. Clean VANOS system if contaminated with sludge. Use high-quality full synthetic oil (BMW LL-01 spec) and maintain 7,500-mile oil change intervals to prevent premature failure. Some shops recommend replacing both solenoids preventively.',
    estimatedCost: { min: 250, max: 800 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'BMW OEM VANOS Solenoid (11367585425) is the direct replacement - higher quality than aftermarket',
        partBrand: 'BMW',
        partName: 'N55 VANOS Solenoid',
        partNumber: '11367585425',
        needsReview: true
      },
      {
        type: 'part',
        content: 'Some owners use aftermarket Genuine BMW parts from FCP Euro with lifetime warranty',
        partBrand: 'FCP Euro',
        partName: 'N55 VANOS Solenoid',
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Use BMW LL-01 approved oil (Liqui Moly 5W-30 or Mobil 1 0W-40 European) and change every 7,500 miles max to prevent sludge buildup',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'If one solenoid fails, consider replacing both (intake + exhaust) to avoid second repair later',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'Don\'t extend oil changes beyond 10k miles on N55 engines - sludge will kill VANOS solenoids and entire VANOS system',
        upvotes: 0
      }
    ]
  },
  {
    id: 'bmw-4series-n55-water-pump-2014',
    make: 'BMW',
    model: '4 Series',
    years: { start: 2014, end: 2018 },
    title: 'N55 Electric Water Pump Failure - 435i/440i F32/F33/F36',
    severity: 'moderate',
    description: 'The N55 engine uses an electric auxiliary water pump (in addition to the mechanical pump) that commonly fails between 60,000-100,000 miles. The electric pump circulates coolant when the engine is off to prevent heat soak and during cold starts. Pump bearing wear and seal failure lead to coolant leaks and pump motor burnout. Symptoms include coolant loss, overheating warnings, and heater malfunction. This is a wear item that will eventually fail on all N55 engines (also affects 335i, 535i, X5 35i, X6 35i).',
    symptoms: [
      'Coolant warning light or low coolant message',
      'Visible coolant leak under vehicle (passenger side)',
      'Overheating warning or temperature gauge rising',
      'Heater not working properly',
      'Whining noise from water pump area',
      'Check engine light with coolant circulation codes'
    ],
    solution: 'Replace electric water pump. Also inspect main mechanical water pump and thermostat for leaks/failure while repair is being performed. Replace coolant with BMW-approved coolant (blue or newer orange). Bleed cooling system properly after replacement to avoid air pockets. Some mechanics recommend replacing both pumps together since labor overlaps.',
    estimatedCost: { min: 400, max: 900 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'BMW OEM Electric Water Pump (11517588885) - most reliable option for N55 engines',
        partBrand: 'BMW',
        partName: 'N55 Electric Water Pump',
        partNumber: '11517588885',
        needsReview: true
      },
      {
        type: 'part',
        content: 'Genuine BMW coolant (82141467704 blue or 83192211191 orange) - do not mix colors',
        partBrand: 'BMW',
        partName: 'Coolant',
        partNumber: '82141467704',
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Replace water pump preventively at 80k-100k miles to avoid being stranded with overheating',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Check coolant level monthly - early detection of slow leaks can prevent overheating damage',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'Do NOT drive with overheating warning - can warp cylinder head and require $6k+ engine repair',
        upvotes: 0
      }
    ]
  },
  {
    id: 'bmw-4series-charge-pipe-2014',
    make: 'BMW',
    model: '4 Series',
    years: { start: 2014, end: 2020 },
    title: 'Turbo Charge Pipe Failure - 428i/435i/440i F32/F33/F36',
    severity: 'moderate',
    description: 'BMW uses a plastic charge pipe (boost pipe) to route pressurized air from the turbocharger to the engine intake. The plastic becomes brittle over time due to heat cycles and boost pressure. The pipe commonly cracks or the connection points fail, causing a sudden loss of boost pressure. This results in immediate power loss and limp mode. The failure typically occurs between 50,000-80,000 miles. All turbocharged F-chassis BMWs (N20, N55 engines) are affected. Many owners upgrade to aluminum charge pipes to prevent recurrence.',
    symptoms: [
      'Sudden loss of power while driving',
      'Loud hissing or whooshing sound from engine bay',
      'Check engine light with boost pressure codes (P0299, P0234)',
      'Limp mode activation (reduced power)',
      'Visible crack or separation in charge pipe',
      'Engine runs but lacks power under acceleration'
    ],
    solution: 'Replace charge pipe. OEM replacement is plastic and will fail again. Aftermarket aluminum charge pipe is highly recommended for permanent fix. Popular brands: ARM Motorsports, Burger Motorsport (BMS), VRSF. Installation is straightforward DIY for experienced mechanics. Also inspect intercooler boots and clamps for cracks while charge pipe is removed.',
    estimatedCost: { min: 150, max: 600 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'ARM Motorsports aluminum charge pipe - most popular upgrade, eliminates plastic failure point permanently',
        partBrand: 'ARM Motorsports',
        partName: 'F32 Aluminum Charge Pipe',
        needsReview: true
      },
      {
        type: 'part',
        content: 'BMS (Burger Motorsport) aluminum charge pipe - another high-quality option with great fit',
        partBrand: 'BMS',
        partName: 'N20/N55 Charge Pipe',
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Replace with aluminum aftermarket - same cost as OEM plastic but will never fail again',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'While you\'re in there, inspect and replace intercooler boots if they\'re cracked - prevent future boost leaks',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'If you hear hissing under boost, stop modding and fix the charge pipe first - boost leaks can cause lean conditions',
        upvotes: 0
      }
    ]
  },
  {
    id: 'bmw-4series-fuel-injector-2014',
    make: 'BMW',
    model: '4 Series',
    years: { start: 2014, end: 2020 },
    title: 'Fuel Injector Failure - 428i/430i/435i/440i F32/F33/F36',
    severity: 'moderate',
    description: 'Direct injection fuel injectors on N20 and N55 engines commonly fail between 60,000-100,000 miles due to carbon buildup and high-pressure operation. Injector internal seals wear out, causing fuel leaks or inconsistent spray patterns. Failed injectors cause rough running, misfires, and poor fuel economy. Carbon deposits on intake valves (common on direct injection engines) worsen the problem. BMW uses Bosch high-pressure injectors that operate at 2,000+ PSI. When one injector fails, others often follow soon after.',
    symptoms: [
      'Rough idle or engine vibration',
      'Check engine light with misfire codes (P0300-P0306)',
      'Loss of power or hesitation',
      'Increased fuel consumption',
      'Hard starting or long cranking',
      'Fuel smell from engine bay (injector leak)'
    ],
    solution: 'Replace failed injector(s). BMW recommends replacing all injectors together to prevent repeat repairs. Perform walnut blast carbon cleaning on intake valves while injectors are out (labor overlap saves money). Use Top Tier gasoline with detergent additives to minimize carbon buildup. Some owners add Liqui Moly Valve Clean to fuel tank every 5,000 miles preventively.',
    estimatedCost: { min: 800, max: 2500 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'Bosch OEM fuel injectors (same as BMW uses) - more affordable than BMW-branded parts',
        partBrand: 'Bosch',
        partName: 'High Pressure Fuel Injector',
        needsReview: true
      },
      {
        type: 'part',
        content: 'Liqui Moly Valve Clean - add to fuel tank every 5k miles to reduce carbon buildup on valves',
        partBrand: 'Liqui Moly',
        partName: 'Valve Clean',
        partNumber: '2001',
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Get walnut blast intake valve cleaning when replacing injectors - labor overlap saves $400+',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Use Top Tier gasoline (Shell, Chevron, Mobil) to minimize carbon buildup and extend injector life',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'Don\'t replace just one injector - others will fail soon and you\'ll pay for labor twice',
        upvotes: 0
      }
    ]
  },
  {
    id: 'bmw-4series-convertible-top-2014',
    make: 'BMW',
    model: '4 Series',
    years: { start: 2014, end: 2020 },
    title: 'Convertible Top Hydraulic Pump & Motor Failure - F33 Convertible',
    severity: 'moderate',
    description: 'The F33 4 Series convertible uses a complex hydraulic folding hardtop system that commonly experiences pump and motor failures. The hydraulic pump motor burns out from overheating or seal leaks cause hydraulic fluid loss. Top becomes stuck in partially open/closed position. Microswitch sensors that detect top position also fail frequently, preventing top operation even when hydraulics work. Exposure to weather and infrequent operation accelerate failures. This affects all F33 convertibles and is similar to issues in E93 3 Series convertibles.',
    symptoms: [
      'Convertible top stuck partially open or closed',
      'Top operation warning message on iDrive',
      'Whining or grinding noise when operating top',
      'Top moves slowly or stops mid-cycle',
      'Hydraulic fluid leak in trunk area',
      'Top won\'t unlatch or latch properly'
    ],
    solution: 'Diagnose specific failure point - pump motor, hydraulic lines, microswitches, or latch mechanisms. Hydraulic pump motor replacement is most common repair. Check hydraulic fluid level and refill if low. Inspect all microswitches and sensors for proper operation. Regular top cycling (once per month minimum) prevents seals from drying out. Store with top up to reduce strain on hydraulics.',
    estimatedCost: { min: 1200, max: 3500 },
    recallTSB: null,
    communityRecommendations: [
      {
        type: 'part',
        content: 'BMW OEM convertible top hydraulic pump - rebuilt units available at significant savings',
        partBrand: 'BMW',
        partName: 'Convertible Top Pump',
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Cycle the top at least once per month, even in winter - keeps seals lubricated and prevents failures',
        upvotes: 0
      },
      {
        type: 'tip',
        content: 'Always store with top UP - reduces stress on hydraulic system and prevents seal damage',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'Never force the top manually if it gets stuck - can damage expensive hydraulic components',
        upvotes: 0
      },
      {
        type: 'warning',
        content: 'Don\'t operate top in freezing temps - hydraulic fluid becomes thick and can burn out motor',
        upvotes: 0
      }
    ]
  }
];

console.log(`Adding ${bmw4SeriesIssues.length} BMW 4 Series issues...`);
knownIssues.issues.push(...bmw4SeriesIssues);

fs.writeFileSync(dbPath, JSON.stringify(knownIssues, null, 2));

console.log(`✓ Successfully added ${bmw4SeriesIssues.length} BMW 4 Series issues`);
console.log(`Total issues in database: ${knownIssues.issues.length}`);
