const fs = require('fs');
const path = require('path');

const knownIssuesPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const knownIssues = JSON.parse(fs.readFileSync(knownIssuesPath, 'utf8'));

const bmwX5Issues = [
  {
    id: 'bmw-x5-transfer-case-actuator-2000',
    make: 'BMW',
    model: 'X5',
    years: { start: 2000, end: 2023 },
    title: 'Transfer Case Actuator Motor Failure (xDrive AWD System)',
    severity: 'moderate',
    description: 'The transfer case actuator motor contains plastic gears that strip over time, causing the xDrive AWD system to malfunction. This is virtually identical to X3 issue and affects ALL X5 models with xDrive AWD across all four generations (E53, E70, F15, G05). The plastic gear teeth are gradually worn down by the metal worm drive gear, typically failing between 90,000-120,000 miles. When the actuator fails, the AWD system loses functionality and multiple warning lights illuminate simultaneously. BMW issued TSB dated 6/1/2020. Bimmerpost/X5Forum report this as inevitable on high-mileage X5s. DIY repair kits with replacement plastic gears cost only $100-150 and are straightforward to install, saving $1,400+ vs dealer replacement.',
    symptoms: [
      'Brake, ABS, and 4x4 DSC warning lights illuminate simultaneously',
      'Audible clicking noise from under driver\'s side when turning ignition off',
      'Transfer case fault codes',
      'Loss of AWD functionality (car stuck in 2WD)',
      'Yellow transfer case warning light',
      'Grinding or whirring noise from transfer case area'
    ],
    solution: 'Replace the actuator motor assembly or rebuild using an aftermarket repair kit. DIY repair kits cost $100-150 and include replacement plastic gears, clips, and seals - straightforward installation saves $1,200+. Complete actuator motor replacement costs $540 for the assembly if DIY, or $1,500-2,200 at dealer. If transfer case itself is damaged from prolonged actuator failure, complete transfer case replacement costs $1,400-3,300. PREVENTIVE: If buying used X5 over 80k miles, budget for this repair - it\'s "when not if" on xDrive models. Check for clicking noise when shutting off ignition.',
    estimatedCost: { min: 100, max: 3300 },
    recallInfo: 'TSB dated 6/1/2020 (NHTSA file MC-10176367-9999). No official recall.',
    communityRecommendations: [
      {
        type: 'part',
        content: 'FCP Euro/BimmerWorld transfer case actuator repair kit for $100-150 - significantly cheaper than dealer $1,500+ motor replacement. Kit includes replacement plastic gears and seals.',
        partBrand: 'FCP Euro',
        partName: 'Transfer Case Actuator Repair Kit',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'This is inevitable on xDrive X5s by 100k-120k miles - budget for this repair when buying used. Not a question of if, but when.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Dealer will quote $1,500-2,200+ for full motor replacement when a $100 gear kit often solves the issue. Get second opinion from BMW specialist.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Listen for clicking noise when shutting off ignition - early warning sign of failing actuator. Replace before complete failure to avoid being stranded.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-x5-air-suspension-2007',
    make: 'BMW',
    model: 'X5',
    years: { start: 2007, end: 2023 },
    title: 'Air Suspension Compressor & Strut Failure (X5-Specific)',
    severity: 'high',
    description: 'X5 models equipped with adaptive air suspension experience compressor and air spring failures, particularly E70 (2007-2013) and F15 (2014-2018) generations, continuing into G05 (2019-2023) with air suspension option. The air compressor can fail due to continuous cycling from leaking air springs. Air springs develop leaks from rubber deterioration, especially in harsh climates with road salt. Ignoring a small air spring leak can burn out the compressor, adding $800-1,300 to repair costs. Full air suspension repair at dealer costs $2,000-$5,000. Many owners convert to traditional coil spring suspension using Strutmasters ($1,200-1,800) or Arnott ($1,400-2,000) conversion kits to eliminate future air suspension problems permanently. X5Forum consensus: coil conversion is cheaper long-term and more reliable.',
    symptoms: [
      'Vehicle sits low (especially rear end sitting on tires)',
      '"Chassis Function Restricted" warning message',
      'Compressor runs continuously or excessively',
      'Hissing sound from air springs',
      'Uneven ride height side-to-side',
      'Suspension warning lights'
    ],
    solution: 'Replace failed air springs ($200-500 each OEM) or compressor ($600-1,300). Many owners convert to traditional coil spring suspension using Strutmasters ($1,200-1,800) or Arnott ($1,400-2,000) conversion kits to eliminate future air suspension problems permanently. Conversion is permanent solution that\'s cheaper long-term than continued air suspension repairs. If keeping air suspension: inspect air springs at 60,000-80,000 miles for cracks/leaks before compressor damage occurs. Replace both air springs on same axle simultaneously to prevent uneven wear.',
    estimatedCost: { min: 1200, max: 5000 },
    recallInfo: 'No official recall. Common wear item on air suspension-equipped X5s.',
    communityRecommendations: [
      {
        type: 'part',
        content: 'Strutmasters or Arnott air-to-coil conversion kit ($1,200-2,000) - eliminates future air suspension failures permanently. X5Forum consensus: coil conversion cheaper long-term.',
        partBrand: 'Strutmasters',
        partName: 'Air Suspension to Coil Conversion Kit',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'If one air spring fails, replace both on same axle to prevent uneven wear and premature failure of the other side.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'WABCO aftermarket air compressors ($600) work as well as OEM BMW ($1,300) - don\'t overpay at dealer for same part with BMW logo.',
        partBrand: 'WABCO',
        partName: 'Air Suspension Compressor',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Inspect air springs at 60,000-80,000 miles for cracks/leaks before compressor damage occurs. Small leak now = $500 repair vs. $2,000+ later with burned compressor.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'If buying used X5 with air suspension over 80k miles, budget $2,000-5,000 for eventual repairs OR $1,500 for coil conversion. Air suspension is expensive to maintain.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-x5-n63-timing-chain-2008',
    make: 'BMW',
    model: 'X5',
    years: { start: 2008, end: 2021 },
    title: 'N63 V8 Timing Chain Failure (Catastrophic) - xDrive50i',
    severity: 'high',
    description: 'The N63 4.4L twin-turbo V8 engine in E70/F15 xDrive50i (2008-2018) and early G05 xDrive50i/M50i (2019-2021) has premature timing chain stretch and guide wear, causing catastrophic engine damage. BMW produced N63 engines between 2008-2014 with defective timing chain tensioners and guides made from weak materials. Timing chains stretch, guides crack and break, leading to rattling on cold start and potential timing failure causing piston-to-valve collision and complete engine destruction ($15,000-$25,000 replacement). BMW issued service bulletins and extended warranties for some affected vehicles. 2015+ N63TU (Technical Update) engines have improved timing components but still require monitoring. This is same catastrophic N63 issue affecting 5 Series 550i. Bimmerpost consensus: avoid 2008-2014 N63 models unless timing chain has been replaced with updated parts.',
    symptoms: [
      'Rattling noise from engine on cold starts (marbles in tin can)',
      'Engine timing-related codes (P0016, P0017)',
      'Loss of power and sluggish acceleration',
      'Check engine light',
      'Engine failure/no start (if chain fails completely)',
      'Catastrophic piston-to-valve collision'
    ],
    solution: 'PREVENTIVE REPLACEMENT: If you own 2008-2014 E70/F15 xDrive50i with N63, replace timing chain guides and tensioners IMMEDIATELY at 60,000-80,000 miles ($3,500-$6,000) BEFORE failure. If chain has failed: Complete engine replacement required ($15,000-$25,000). Check VIN with BMW dealer for extended warranty eligibility - some 2008-2014 models covered. CRITICAL: Avoid 2008-2014 xDrive50i when buying used unless timing chain has been replaced with updated parts AND you have documentation. Opt for xDrive35i with N55 inline-6 instead (no timing chain issues).',
    estimatedCost: { min: 3500, max: 25000 },
    recallInfo: 'BMW service bulletins for 2008-2014 N63 engines. Extended warranty coverage on some VINs. Check dealer for eligibility.',
    communityRecommendations: [
      {
        type: 'warning',
        content: 'AVOID 2008-2014 N63 xDrive50i when buying used unless timing chain has been replaced with updated parts. This is BMW\'s worst V8 reliability disaster.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Check VIN for BMW extended warranty eligibility before purchasing used E70/F15 xDrive50i. Some models covered to 120k miles for timing chain issues.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: '2015+ N63TU (Technical Update) engines have improved timing components but still monitor for rattling on cold starts. Not completely fixed.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'If you hear rattling on cold start, DO NOT DRIVE. Tow to shop immediately - chain failure can destroy engine within days ($15k-25k repair).',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Safer alternative: Buy xDrive35i with N55 inline-6 instead of xDrive50i. N55 has no timing chain issues and makes adequate power for X5.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-x5-n63-wastegate-2008',
    make: 'BMW',
    model: 'X5',
    years: { start: 2008, end: 2018 },
    title: 'N63 Turbocharger Wastegate Rattle & Failure - xDrive50i',
    severity: 'moderate',
    description: 'N63 4.4L twin-turbo V8 engines in E70/F15 xDrive50i (2008-2018) suffer from wastegate rattle and eventual turbocharger failure. The wastegate flapper jiggles within mounting points against turbo housing due to worn bushings, most noticeable at idle or when letting off throttle. This leads to wastegate actuator failure, loss of power, increased turbo lag, and eventually complete turbo failure requiring replacement of BOTH turbos ($4,000-$8,000). Some vehicles may qualify for BMW N63 warranty extension programs (N63 CCP - Central Cooling Pump campaign). This compounds the N63 timing chain issue - 2008-2014 xDrive50i models have BOTH catastrophic timing chain AND wastegate/turbo failures. X5Forum consensus: avoid N63 models unless under warranty or budget $10,000+ for preventive repairs.',
    symptoms: [
      'Rattling noise from engine bay at idle or low throttle (wastegate flutter)',
      'Loss of power and turbo lag',
      'Whistling or whining sounds from turbos',
      'Check engine light with boost pressure codes (P0234, 30FF)',
      'Reduced power mode/limp mode',
      'Oil leaking from turbo seals (failed turbo)'
    ],
    solution: 'Replace wastegate actuators ($500 each, $1,000 for both) or complete turbocharger assemblies ($2,000-4,000 per turbo, $4,000-8,000 for both). Some vehicles may qualify for BMW N63 CCP (Central Cooling Pump) campaign for potential warranty coverage - check with dealer. Wastegate repair kits available ($200-400) but turbo removal required. MONITORING: Wastegate rattle is early warning - address before complete turbo failure to avoid $8,000+ repair. If rattling but car boosts normally, monitor closely but repair before codes appear.',
    estimatedCost: { min: 500, max: 8000 },
    recallInfo: 'Some vehicles may qualify for BMW N63 CCP (Central Cooling Pump) campaign for warranty coverage. Check dealer for eligibility.',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Check if vehicle qualifies for BMW N63 CCP (Central Cooling Pump) campaign for potential warranty coverage of turbo/wastegate repairs.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'WABCO/Garrett wastegate actuators are OE manufacturer and cost less than BMW-branded parts. Same quality, lower price.',
        partBrand: 'Garrett',
        partName: 'Wastegate Actuator',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Wastegate rattle is early warning - address before complete turbo failure to avoid $8,000+ repair for both turbos. Don\'t ignore it.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: '2008-2014 N63 models have BOTH timing chain AND wastegate issues. Budget $10,000+ for preventive repairs or avoid these years entirely.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-x5-water-pump-2007',
    make: 'BMW',
    model: 'X5',
    years: { start: 2007, end: 2018 },
    title: 'Electric Water Pump Failure (N52, N55, N63 Engines)',
    severity: 'moderate',
    description: 'E70 (2007-2013) and F15 (2014-2018) X5 models use electric water pumps with plastic impellers and internal circuit boards that fail prematurely around 60,000-80,000 miles. The pump circuit board corrodes from coolant intrusion, causing pump failure and rapid engine overheating. The E70 cooling system is notorious for premature failure. On some engines (particularly N63), the water pump and thermostat are integrated into one unit, requiring complete assembly replacement if either component fails. Unlike belt-driven pumps, electric pumps fail SUDDENLY without warning - coolant circulation stops and engine overheats in minutes, potentially causing warped heads and blown head gaskets ($3,000-$6,000 damage). This affects N52 (xDrive30i), N55 (xDrive35i), and N63 (xDrive50i) engines.',
    symptoms: [
      'Engine overheating rapidly (even at idle)',
      'Coolant leaking near front of engine',
      'Steam from radiator/engine bay',
      'Engine temperature drops when accelerating (pump volume failure)',
      'Coolant warning light or "Engine Overheating" message',
      'Check engine light with cooling system codes'
    ],
    solution: 'Replace electric water pump/thermostat assembly ($300-800 parts + $200-400 labor = $500-1,200 total). Use OEM BMW or quality German aftermarket (Rein, Hepu) - cheap Chinese pumps fail quickly. PREVENTIVE: Replace water pump at 60,000-80,000 miles BEFORE failure to avoid being stranded and engine damage. If engine overheats, PULL OVER IMMEDIATELY and shut off - driving with overheating warps cylinder heads ($4,000+ repair). Call tow truck; do not attempt to drive.',
    estimatedCost: { min: 500, max: 1200 },
    recallInfo: 'No official recall. Water pump considered routine maintenance by BMW.',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Replace water pump preventively at 60,000-80,000 miles before failure causes overheating damage. Electric pumps fail suddenly - no warning.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Use OEM BMW or Rein brand - cheap aftermarket pumps fail quickly on BMW. Genuine German parts last 80k-100k miles.',
        partBrand: 'Rein',
        partName: 'Electric Water Pump',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Never ignore overheating - electric pump failure can cause head gasket damage within minutes. Pull over immediately and shut off engine.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Replace thermostat when doing water pump - labor is 80% done. Saves $200-300 in future labor if thermostat fails separately.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-x5-valve-stem-seals-2000',
    make: 'BMW',
    model: 'X5',
    years: { start: 2000, end: 2006 },
    title: 'Valve Stem Seal Failure - Excessive Oil Consumption (E53 V8)',
    severity: 'moderate',
    description: 'The M62/N62 4.4L/4.6L/4.8L V8 engines in E53 X5 models (2000-2006: 4.4i, 4.6is, 4.8is) develop valve stem seal failures causing excessive oil consumption and blue smoke from exhaust. The valve stem seals become brittle over time from heat cycling and fail, allowing oil to leak past valve guides into combustion chambers where it burns. This is a well-known issue on BMW V8s of this era, particularly the M62/N62 engines. Oil consumption of 1 quart per 1,000 miles or more is common on high-mileage E53 V8s with failed valve stem seals. This is expensive labor-intensive repair requiring cylinder head work ($2,000-$4,000). Many owners monitor oil levels closely and add as needed rather than repair, or opt for used engine replacement if consumption is severe.',
    symptoms: [
      'Increased oil consumption (1+ quart per 1,000 miles)',
      'Blue smoke from exhaust on startup or acceleration',
      'Fouled spark plugs from oil contamination',
      'Oil burning smell from exhaust',
      'Low oil warnings between oil changes',
      'Rough idle from oil-fouled plugs'
    ],
    solution: 'Replace valve stem seals ($2,000-$4,000 labor-intensive job requiring cylinder head removal and valve train work). Some owners opt for used engine replacement if consumption is severe ($3,000-$5,000 for used engine installed). Many owners choose to monitor oil levels closely and add oil as needed (carry extra quart in vehicle) until repair can be performed or vehicle is sold. Use quality synthetic oil (0W-40 or 5W-40 BMW LL-01 spec) to help extend seal life. Check oil every 500-1,000 miles on high-mileage E53 V8s.',
    estimatedCost: { min: 2000, max: 5000 },
    recallInfo: 'No recall. Known wear issue on BMW M62/N62 V8 engines.',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Check oil consumption before buying E53 4.4i/4.6is/4.8is. Ask seller to show oil level on dipstick and check again after 500-mile test drive.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Don\'t buy E53 V8 without checking oil consumption history - valve stem seal job costs $2,000-4,000. Factor this into purchase price.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Carry extra quart of oil in vehicle and check level every 500-1,000 miles. Low oil can damage engine - better to top off than repair $10,000 engine damage.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Use quality synthetic oil (0W-40 or 5W-40 BMW LL-01 spec) to help extend seal life. Mobil 1 0W-40 European Car Formula recommended.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-x5-vanos-solenoid-2000',
    make: 'BMW',
    model: 'X5',
    years: { start: 2000, end: 2023 },
    title: 'VANOS Solenoid Failure (All Engines)',
    severity: 'moderate',
    description: 'VANOS (Variable Valve Timing) solenoids fail across ALL X5 generations and ALL engines (M54, M62, N52, N55, N63) due to oil sludge buildup clogging the solenoid screens. The solenoids control camshaft timing for optimal performance and become grimy over time, especially with neglected oil changes or cheap oil. This causes rough idle, loss of power, and check engine lights with codes 2A82, 2A87, 2A88 (VANOS solenoid fault codes guarantee solenoid failure). Regular oil changes with quality synthetic oil (5,000-7,500 miles) prevent VANOS solenoid clogging. Some engines have 2-4 solenoids depending on configuration (inline-6 has 2, V8 has 4). F15/G05 models have additional TSB SI B12 14 10 for N52/N55 VANOS gear assembly bolts that may loosen or break.',
    symptoms: [
      'Rough idle or engine misfires (especially at low RPM)',
      'Sluggish acceleration and loss of power',
      'Check engine light with codes 2A82, 2A87, 2A88 (VANOS solenoid codes)',
      'Limp mode activation',
      'Engine hesitation on startup',
      'Poor fuel economy',
      'Loud ticking or rattling from engine'
    ],
    solution: 'Replace VANOS solenoids ($100-200 each part + $200-400 labor = $250-800 total depending on number of solenoids). Or clean solenoids if caught early (some BMW specialists offer cleaning service $150-300). Use quality synthetic oil (0W-40 or 5W-40 BMW LL-01 spec) and change every 5,000-7,500 miles to prevent buildup - cheap oil or extended 10k+ mile intervals kill VANOS solenoids. Some engines have 2-4 solenoids depending on configuration. PREVENTIVE: Replace or clean VANOS solenoids every 50,000-70,000 miles as maintenance.',
    estimatedCost: { min: 250, max: 800 },
    recallInfo: 'TSB SI B12 14 10 for N52/N55 VANOS gear assembly bolts (may loosen or break).',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Regular oil changes (5,000-7,500 miles) with quality synthetic oil prevents VANOS solenoid clogging. Cheap oil or 10k+ mile intervals kill solenoids.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'OEM Genuine BMW VANOS solenoids last longer than cheap aftermarket - worth the extra $50 per solenoid. Elring and Genuine BMW brands recommended.',
        partBrand: 'BMW',
        partName: 'VANOS Solenoid',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Clean VANOS solenoids during oil changes if accessible - prevents expensive replacement. Some BMW specialists offer cleaning service.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Use 0W-40 or 5W-40 BMW LL-01 approved oil ONLY. Mobil 1 0W-40 European Car Formula or Liqui Moly 5W-40 recommended on Bimmerpost.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-x5-oil-leaks-2000',
    make: 'BMW',
    model: 'X5',
    years: { start: 2000, end: 2023 },
    title: 'Oil Leaks - Valve Cover & Oil Pan Gaskets',
    severity: 'low',
    description: 'BMW X5 across ALL generations and ALL engines develop oil leaks from valve cover gaskets and oil pan gaskets as routine wear items. The gaskets deteriorate over time from heat cycling, hardening and cracking. Valve cover gasket leaks are common around 70,000-100,000 miles on all BMW engines. Oil pan gasket leaks require more labor due to subframe removal on some models - particularly E70 models where oil pan gasket replacement can require engine lifting (10+ hours labor). While not immediately catastrophic, oil leaks worsen over time and oil dripping on exhaust causes burning smell and smoke. Low oil from leaks can damage engine. Budget for valve cover gasket replacement around 80,000-100,000 miles as part of BMW ownership.',
    symptoms: [
      'Oil visible on valve cover edges or engine sides',
      'Burning oil smell from engine bay',
      'Oil dripping onto exhaust manifold (smoke)',
      'Oil spots under vehicle after parking',
      'Low oil warnings',
      'Oil residue on engine components'
    ],
    solution: 'Replace valve cover gasket ($700-988 at shop). Replace oil pan gasket ($1,483-$3,459 depending on engine - some require engine lifting for access). Use OEM BMW gaskets for longevity - cheap gaskets leak within 20k miles. DIY valve cover gasket replacement possible on some models (saves $300-500 labor). On V8/V6 engines, replace both valve cover gaskets simultaneously to save on repeat labor costs. Monitor oil level weekly and top off as needed (1 quart low is OK, 2+ quarts low risks engine damage).',
    estimatedCost: { min: 700, max: 3500 },
    recallInfo: 'No recall. Routine maintenance item on all BMWs.',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Budget for valve cover gasket replacement around 80,000-100,000 miles on all BMW engines. Part of BMW ownership - not a defect.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Oil pan gasket on some E70 engines requires 10+ hours labor due to engine lifting - get multiple quotes. Can cost $2,000-3,500.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Replace both valve cover gaskets simultaneously on V8/V6 engines to save on repeat labor costs. Labor is 80% done for second side.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Use OEM BMW or Victor Reinz gaskets - cheap eBay gaskets leak within 20k miles. Quality matters for longevity.',
        partBrand: 'Victor Reinz',
        partName: 'Valve Cover Gasket',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-x5-carbon-buildup-2007',
    make: 'BMW',
    model: 'X5',
    years: { start: 2007, end: 2023 },
    title: 'Carbon Buildup on Intake Valves (Direct Injection Engines)',
    severity: 'moderate',
    description: 'Direct injection engines (N55, N63 in E70/F15/G05 X5) don\'t spray fuel over intake valves - fuel is injected directly into cylinder. This means carbon deposits build up on intake valve backs over time from PCV system oil vapors that bake into hard deposits. This reduces airflow, causes rough idle, misfires, and loss of power. ALL BMW direct injection engines (N54, N55, N63, S63, B58) suffer from this issue. Walnut blasting service required every 60,000-80,000 miles to clean intake valves ($400-800). Chemical cleaners (Seafoam, CRC) don\'t work on DI engines - only physical walnut blasting removes carbon. Catch can installation ($300-500) helps reduce carbon buildup by filtering PCV oil vapors before they reach intake valves.',
    symptoms: [
      'Rough idle or engine misfires',
      'Loss of power and sluggish acceleration',
      'Poor fuel economy (2-3 MPG drop)',
      'Engine hesitation',
      'Check engine light with misfire codes',
      'Reduced throttle response'
    ],
    solution: 'Walnut blasting service to clean intake valves ($400-800) every 60,000-80,000 miles. Requires removing intake manifold and blasting walnut shells through intake ports to scrub carbon off valves. Some BMW specialists offer this service. PREVENTION: Install oil catch can ($300-500) to filter crankcase vapors before they reach intake valves - extends cleaning interval from 60k to 100k+ miles. Use Top Tier gasoline. Change oil every 5,000-7,500 miles. Drive hard occasionally (Italian tune-up - high RPM highway driving) helps burn off some carbon deposits between cleanings.',
    estimatedCost: { min: 400, max: 800 },
    recallInfo: 'No recall. Carbon buildup inherent to all direct injection engines.',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Walnut blast intake valves every 60,000-80,000 miles on N55/N63 engines to prevent carbon buildup. Part of DI engine ownership.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Install oil catch can ($300-500) to reduce crankcase vapors contributing to carbon buildup. Extends cleaning interval from 60k to 100k+ miles.',
        partBrand: 'Mishimoto',
        partName: 'Oil Catch Can',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Italian tune-up (high RPM highway driving) helps burn off some carbon deposits between professional cleanings. Drive hard occasionally.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Chemical cleaners (Seafoam, CRC) don\'t work on DI engines - only physical walnut blasting removes carbon. Don\'t waste money on pour-in cleaners.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-x5-zf-8hp-mechatronic-2007',
    make: 'BMW',
    model: 'X5',
    years: { start: 2007, end: 2023 },
    title: 'ZF 8HP Transmission Mechatronic Sleeve Leak',
    severity: 'low',
    description: 'The ZF 8HP automatic transmission (used in most E70/F15/G05 X5 models) develops mechatronic sealing sleeve leaks around 50,000-60,000 miles. The mechatronic sleeve seals (rubber gaskets connecting valve body to transmission) deteriorate from heat and age, causing ATF (transmission fluid) leaks. If left unaddressed, low fluid levels cause erratic shifting, transmission slipping, and potential transmission failure ($5,000-8,000). Despite this sleeve leak issue, ZF 8HP is one of most reliable modern automatic transmissions - most run past 150,000 miles without internal failure when fluid is maintained. Catch leak early before fluid loss damages transmission. Inspect for mechatronic sleeve leaks at 50,000-60,000 miles during oil changes (red fluid visible under vehicle).',
    symptoms: [
      'ATF leak visible under vehicle (red fluid)',
      'Erratic or harsh shifting',
      'Transmission slipping or delayed engagement',
      'Transmission warning lights',
      'Delayed engagement when shifting into gear',
      'Low transmission fluid level'
    ],
    solution: 'Replace mechatronic sealing sleeves ($200-400 parts + $400-800 labor = $600-1,200 total). Catch leak early before fluid loss damages transmission. Despite sleeve leak issue, ZF 8HP is one of most reliable modern automatics when maintained. PREVENTIVE: Inspect for mechatronic sleeve leaks at 50,000-60,000 miles during oil changes. Change transmission fluid every 50,000 miles (BMW says "lifetime" but fluid degrades) to extend ZF 8HP life past 150,000 miles. Use ZF Lifeguard 8 ATF ONLY - generic ATF will damage transmission.',
    estimatedCost: { min: 600, max: 1200 },
    recallInfo: 'No recall. Common wear item on ZF 8HP transmissions.',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Inspect for mechatronic sleeve leaks at 50,000-60,000 miles during oil changes. Early detection prevents $5,000+ transmission damage from low fluid.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Don\'t attempt DIY mechatronic sleeve replacement - ZF 8HP requires specialized tools and programming. Leave this to BMW specialists.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Change transmission fluid every 50,000 miles (BMW says "lifetime" but fluid degrades) to extend ZF 8HP life past 150,000 miles.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Use ZF Lifeguard 8 ATF ONLY for fluid changes. Generic ATF will damage ZF 8HP transmission - don\'t cheap out on fluid.',
        partBrand: 'ZF',
        partName: 'Lifeguard 8 ATF',
        upvotes: 0,
        needsReview: true
      }
    ]
  }
];

// Add new issues to the known issues array
knownIssues.issues.push(...bmwX5Issues);

// Write back to file
fs.writeFileSync(knownIssuesPath, JSON.stringify(knownIssues, null, 2));

console.log(`✓ Successfully added ${bmwX5Issues.length} BMW X5 issues`);
console.log(`  Total issues in database: ${knownIssues.issues.length}`);
console.log('\nAdded:');
bmwX5Issues.forEach(issue => {
  console.log(`  - ${issue.title} (${issue.years.start}-${issue.years.end})`);
});
