const fs = require('fs');
const path = require('path');

const knownIssuesPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const knownIssues = JSON.parse(fs.readFileSync(knownIssuesPath, 'utf8'));

const newIssues = [
  {
    id: 'honda-hrv-cvt-transmission-shudder-2016',
    make: 'Honda',
    model: 'HR-V',
    years: { start: 2016, end: 2022 },
    title: 'CVT Transmission Shuddering and Judder',
    severity: 'high',
    description: 'The 2016-2022 Honda HR-V CVT (Continuously Variable Transmission) experiences shuddering, judder, hesitation, and premature belt deterioration. Symptoms include vibrations during acceleration (especially 15-35 mph), delayed engagement, and strange whining/grinding noises. Honda extended the CVT warranty to 7 years/150,000 miles for 2016-2020 models due to premature belt wear. If caught early, CVT fluid replacement can help, but severe cases require complete CVT replacement ($3,000-5,000).',
    symptoms: [
      'Shuddering or vibration during acceleration',
      'Hesitation when accelerating from a stop',
      'Whining or grinding noise from transmission',
      'Delayed engagement when shifting to Drive',
      'Loss of acceleration or power',
      'Check engine light with transmission codes'
    ],
    solution: 'Early-stage: Replace CVT fluid with genuine Honda HCF-2 fluid every 25,000-30,000 miles (not per Honda\'s "lifetime" fluid claim). Severe cases: Replace entire CVT assembly ($3,000-5,000). Check if your vehicle qualifies for Honda\'s extended 7yr/150k warranty coverage (2016-2020 models). Avoid frequent towing, heavy loads, and aggressive driving to extend CVT life.',
    estimatedCost: { min: 300, max: 5000 },
    recallInfo: 'Honda extended CVT warranty to 7 years/150,000 miles for 2016-2020 HR-V models due to premature belt deterioration.',
    communityRecommendations: [
      {
        type: 'part',
        content: 'Use ONLY genuine Honda HCF-2 CVT fluid - aftermarket fluids destroy the belt. Many HRVForum members who used aftermarket fluid had failures within 10k miles.',
        partBrand: 'Honda',
        partName: 'HCF-2 CVT Fluid',
        partNumber: '08200-HCF',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Change CVT fluid every 25k-30k miles regardless of Honda saying "lifetime fluid" - owners who follow this schedule report CVTs lasting 150k+ miles without issues.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'CRITICAL: Avoid towing or heavy loads with the HR-V CVT - the transmission is not designed for it and will fail prematurely under stress.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Check if your 2016-2020 HR-V qualifies for Honda\'s extended 7yr/150k CVT warranty - many owners got free replacements under this program.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'honda-hrv-rear-window-shattering-2023',
    make: 'Honda',
    model: 'HR-V',
    years: { start: 2023, end: 2023 },
    title: 'Rear Window Spontaneous Shattering (Defroster Defect)',
    severity: 'high',
    description: 'The 2023 Honda HR-V has hundreds of complaints about rear windows spontaneously shattering, often in cold weather. The problem is caused by a manufacturing defect where the sealer used to secure the rear glass contacts the defroster heating elements. Over time, the defroster creates a "hot spot" that weakens the glass, causing it to shatter without warning. Consumer Reports investigated and called for a recall, but Honda has not issued one as of early 2025. Replacement cost: $800-1,500.',
    symptoms: [
      'Rear window shatters spontaneously (often in cold weather)',
      'Loud popping/cracking sound',
      'No prior warning or impact',
      'Glass shards inside vehicle',
      'Often occurs after using rear defroster'
    ],
    solution: 'If your 2023 HR-V rear window shatters, contact Honda Customer Service immediately and file a NHTSA complaint. Document everything with photos. Some owners have successfully pressured dealers into goodwill replacements. When replacing, ensure the dealer uses updated parts with correct sealer application (verify with service manager). Cost: $800-1,500 if not covered.',
    estimatedCost: { min: 800, max: 1500 },
    recallInfo: 'No official recall despite hundreds of complaints. Consumer Reports and owners are pressuring Honda. File NHTSA complaint: https://www.nhtsa.gov/report-a-safety-problem',
    communityRecommendations: [
      {
        type: 'warning',
        content: 'CRITICAL: File an NHTSA complaint immediately if this happens - the more complaints filed, the more likely Honda will issue a recall.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Document EVERYTHING with photos/video and save all receipts - many owners who did this got Honda to cover replacement costs as "goodwill".',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'When replacing, ask the dealer if they\'re using updated parts with corrected sealer application - some dealerships acknowledge the defect privately.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Avoid using the rear defroster in extreme cold if possible - this seems to trigger many of the shattering incidents.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'honda-hrv-paint-peeling-2016',
    make: 'Honda',
    model: 'HR-V',
    years: { start: 2016, end: 2018 },
    title: 'Paint and Clearcoat Peeling (Roof and Hood)',
    severity: 'medium',
    description: 'The 2016-2018 Honda HR-V has widespread paint peeling and clearcoat failures, especially on the roof and hood. The problem appears within months to 2 years of ownership. Honda issued a warranty extension for White Orchid Pearl and Bellanova White colors (2016-2018), covering 7 years from original purchase date. However, other colors are affected too. Dealerships often acknowledge it\'s Honda\'s fault but Honda rarely covers repairs outside the specific white colors. Full repaint: $2,000-4,000.',
    symptoms: [
      'Paint peeling or bubbling (especially roof)',
      'Clearcoat flaking off in sheets',
      'Small spots that look like sand under clearcoat',
      'Tiny rust spots forming where paint is gone',
      'Most common on White Orchid Pearl and Bellanova White',
      'Also affects other colors (blue, red, silver)'
    ],
    solution: 'Check if your 2016-2018 HR-V has White Orchid Pearl or Bellanova White paint - if so, you may qualify for Honda\'s warranty extension (7 years from original purchase). For other colors or out-of-warranty vehicles, document the issue with photos and contact Honda Customer Service to request goodwill assistance. If denied, full panel repaint costs $2,000-4,000.',
    estimatedCost: { min: 2000, max: 4000 },
    recallInfo: 'Honda issued warranty extension for White Orchid Pearl and Bellanova White paint on 2016-2018 HR-V (7 years from original purchase date).',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Even if your color isn\'t White Orchid Pearl/Bellanova White, document the issue and contact Honda Customer Service - some owners got goodwill coverage for other colors.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Join the HRVForum.com class action discussion thread - many owners are organizing collective action against Honda for this defect.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Don\'t delay - once the paint peels down to bare metal, rust forms quickly and Honda is less likely to cover it.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'If paying out of pocket, insist on premium paint/clearcoat systems like PPG or Axalta - don\'t let the shop use cheap materials that will fail again.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'honda-hrv-ac-compressor-failure-2016',
    make: 'Honda',
    model: 'HR-V',
    years: { start: 2016, end: 2023 },
    title: 'AC Compressor Failure',
    severity: 'high',
    description: 'Honda HR-V AC compressors (2016-2023) fail prematurely, often between 40,000-80,000 miles. Symptoms include no cold air, loud grinding/squealing noises from the compressor, and intermittent cooling. The compressor clutch bearing fails first, then the entire compressor seizes. If caught early (just clutch failure), replacement is cheaper. If the compressor grenades, metal debris contaminates the entire AC system requiring full flush and component replacement ($1,500-2,500).',
    symptoms: [
      'No cold air from AC vents',
      'AC blows warm air only',
      'Loud grinding or squealing noise when AC is on',
      'Intermittent cooling (works then stops)',
      'Clicking sound from compressor area',
      'AC clutch not engaging'
    ],
    solution: 'If just the clutch/bearing is bad, replace the AC compressor clutch assembly (~$400-600). If the compressor seized or failed, replace the entire AC compressor, receiver-drier, expansion valve, and flush all lines to remove metal debris ($1,500-2,500). Use OEM (Denso/Sanden) or high-quality aftermarket (Four Seasons, UAC) compressors - cheap compressors fail quickly.',
    estimatedCost: { min: 400, max: 2500 },
    communityRecommendations: [
      {
        type: 'part',
        content: 'HRVForum consensus: OEM Denso compressors last longest. Four Seasons and UAC are acceptable aftermarket alternatives at half the price.',
        partBrand: 'Denso',
        partName: 'OEM AC Compressor',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'CRITICAL: If the compressor seized, you MUST replace the receiver-drier and flush all AC lines - metal debris will destroy a new compressor in weeks.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Catch it early - if you hear clicking/grinding from the AC compressor, replace it before it grenades and sends metal shavings through the whole system.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Use PAG46 refrigerant oil only (not PAG100) - wrong oil type accelerates compressor wear in Honda systems.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'honda-hrv-electrical-battery-drain-2016',
    make: 'Honda',
    model: 'HR-V',
    years: { start: 2016, end: 2023 },
    title: 'Electrical System Issues and Battery Drain',
    severity: 'medium',
    description: 'Honda HR-V models across all years experience electrical system problems including parasitic battery drain, premature battery failure, and stability control module failures. Owners report dead batteries after 24-48 hours of sitting, with the vehicle not holding a charge. Common causes include faulty door lock actuators causing constant drain, infotainment system staying on, and failing stability control modules. Stability control module replacement can cost $1,500+.',
    symptoms: [
      'Battery dies after 1-2 days of sitting',
      'Battery won\'t hold charge',
      'Multiple electrical warning lights',
      'VSA (stability control) warning light',
      'Infotainment system won\'t shut off',
      'Random electrical glitches'
    ],
    solution: 'Perform parasitic draw test to identify the circuit causing drain (normal is <50mA). Common culprits: door lock actuators (pull fuse #13 to test), infotainment system, or stability control module. Replace faulty component. If battery is weak (load test <12.4V), replace battery first before chasing gremlins. OEM Honda battery: $150-250. Stability control module: $1,500-2,000.',
    estimatedCost: { min: 150, max: 2000 },
    communityRecommendations: [
      {
        type: 'tip',
        content: 'HRVForum DIY: Pull fuse #13 (power door locks) overnight - if battery stays charged, you have a bad door lock actuator causing the drain.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Many owners report Interstate or DieHard AGM batteries lasting longer than OEM Honda batteries in the HR-V.',
        partBrand: 'Interstate',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Don\'t just keep replacing the battery - find and fix the parasitic drain or you\'ll kill battery after battery.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Disconnect the infotainment harness overnight (under dash) - if drain stops, the head unit is staying awake and needs replacement/reflash.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'honda-hrv-window-gasket-failure-2016',
    make: 'Honda',
    model: 'HR-V',
    years: { start: 2016, end: 2022 },
    title: 'Window Gasket Slipping and Falling Out',
    severity: 'low',
    description: 'The 2016-2022 Honda HR-V has poorly designed window gaskets that slip out of place, become loose, or fall out completely. This affects both door windows and rear hatch windows. The gaskets create wind noise, water leaks, and look terrible hanging out. Honda dealers often claim "customer induced" but it\'s a widespread defect. Replacement gaskets cost $30-80 per window, but they often fail again unless properly glued.',
    symptoms: [
      'Window gasket hanging out of door',
      'Wind noise around windows at highway speeds',
      'Water leaking into cabin during rain',
      'Gasket visibly loose or sagging',
      'Gasket fell out completely'
    ],
    solution: 'Remove old gasket, clean the channel thoroughly with alcohol, and install new gasket with 3M Black Super Weatherstrip Adhesive (part #08008). Press firmly and let cure for 24 hours before use. Just pressing the gasket back in without adhesive is temporary - it will fall out again. Replacement gasket + adhesive: $30-80 per window.',
    estimatedCost: { min: 30, max: 80 },
    communityRecommendations: [
      {
        type: 'part',
        content: 'HRVForum.com proven fix: 3M Black Super Weatherstrip Adhesive (08008) - clean the channel, apply adhesive, install gasket. Lasts 50k+ miles.',
        partBrand: '3M',
        partName: 'Black Super Weatherstrip Adhesive',
        partNumber: '08008',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'DIY-friendly - takes 30 minutes per window. Clean the channel with rubbing alcohol before applying adhesive or it won\'t stick.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Don\'t just push the gasket back in - it will fall out again within weeks. You MUST use adhesive for a permanent fix.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'honda-hrv-infotainment-freezing-2016',
    make: 'Honda',
    model: 'HR-V',
    years: { start: 2016, end: 2023 },
    title: 'Infotainment System Freezing and Glitches',
    severity: 'medium',
    description: 'Honda HR-V infotainment systems (both generations) freeze, crash, and glitch frequently. The touchscreen becomes unresponsive, audio cuts out, Bluetooth won\'t connect, and the system randomly reboots. Apple CarPlay/Android Auto connection issues are common. Honda has released multiple software updates to address issues, but many persist. The 2023+ models with the updated system still have problems. Dealer reflash sometimes helps temporarily.',
    symptoms: [
      'Touchscreen frozen or unresponsive',
      'System randomly reboots while driving',
      'Bluetooth won\'t connect or constantly disconnects',
      'Apple CarPlay/Android Auto not working',
      'Audio cutting in and out',
      'Black screen on startup',
      'Backup camera display not working'
    ],
    solution: 'Try soft reset first: Hold power button for 10+ seconds until system reboots. If issues persist, visit dealer for latest software update (free under warranty, $150-200 out of warranty). If software updates don\'t fix it, head unit replacement required ($800-1,500). Many owners install aftermarket head units (Pioneer, Sony, Kenwood) with better reliability and features ($300-800 installed).',
    estimatedCost: { min: 150, max: 1500 },
    communityRecommendations: [
      {
        type: 'tip',
        content: 'HRVForum owners report better success with aftermarket head units (Pioneer, Sony) - more features, better reliability, and CarPlay/AA that actually works.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Popular replacement: Pioneer DMH-WT7600NEX or Sony XAV-AX8100 - both have wireless CarPlay/AA and fit the HR-V dash with adapter kits.',
        partBrand: 'Pioneer',
        partName: 'DMH-WT7600NEX',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Before replacing, visit dealer for software update - Honda has released multiple updates that fix some (but not all) issues.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'If backup camera stops working, check the camera itself before replacing the head unit - the cameras fail separately.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'honda-hrv-steering-gearbox-recall-2023',
    make: 'Honda',
    model: 'HR-V',
    years: { start: 2023, end: 2023 },
    title: 'Steering Gearbox Defect (NHTSA Recall)',
    severity: 'high',
    description: 'The 2023 Honda HR-V has a steering gearbox recall due to incorrect manufacturing. The worm gear spring may have been manufactured incorrectly, causing excessive internal friction and difficulty steering the vehicle. This increases the risk of a crash. Symptoms include heavy steering, binding when turning, or steering that doesn\'t return to center. Honda recall: Dealers will replace the worm gear spring and redistribute/add grease as necessary, free of charge.',
    symptoms: [
      'Heavy or stiff steering',
      'Steering binds or catches when turning',
      'Steering doesn\'t return to center',
      'Excessive effort required to turn wheel',
      'Grinding feeling in steering'
    ],
    solution: 'This is a NHTSA recall - contact your Honda dealer immediately to schedule the free repair. Dealers will inspect the steering gearbox, replace the worm gear spring if defective, and add/redistribute grease. Repair is free regardless of warranty status. Do not delay - steering failure while driving is dangerous.',
    estimatedCost: { min: 0, max: 0 },
    recallInfo: 'NHTSA Recall - Honda will replace worm gear spring and redistribute grease free of charge. Contact your dealer to schedule the repair.',
    communityRecommendations: [
      {
        type: 'warning',
        content: 'CRITICAL: This is a safety recall - schedule the repair IMMEDIATELY. Steering failure while driving can cause a crash.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Check if your 2023 HR-V is affected by entering your VIN at Honda\'s recall site: https://www.honda.com/recall',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Repair is free and takes 1-2 hours. Call ahead to ensure your dealer has parts in stock to avoid multiple trips.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'honda-hrv-wheel-bearing-noise-2016',
    make: 'Honda',
    model: 'HR-V',
    years: { start: 2016, end: 2023 },
    title: 'Front Wheel Bearing Premature Failure',
    severity: 'medium',
    description: 'Honda HR-V front wheel bearings fail prematurely, often between 40,000-70,000 miles. Symptoms include humming/growling noise that increases with speed, steering wheel vibration, and ABS/VSA warning lights. The noise is usually louder when turning (load shifts to one bearing). If ignored, a failed wheel bearing can cause the wheel to lock up or fall off while driving. Replacement: $250-450 per side (bearing hub assembly).',
    symptoms: [
      'Humming or growling noise from front wheels',
      'Noise increases with vehicle speed',
      'Noise louder when turning (left or right)',
      'Steering wheel vibration',
      'ABS or VSA warning lights',
      'Loose or wobbly feeling in steering'
    ],
    solution: 'Jack up the vehicle and check for wheel play by grabbing the tire at 12 and 6 o\'clock and rocking it. Excessive play = bad bearing. Spin the wheel and listen for grinding. Replace the wheel bearing hub assembly on the affected side ($250-450). Always replace in pairs if both sides have high mileage to avoid another repair soon. Use OEM (NSK, NTN) or quality aftermarket (Timken, SKF) bearings.',
    estimatedCost: { min: 250, max: 450 },
    communityRecommendations: [
      {
        type: 'warning',
        content: 'Don\'t ignore wheel bearing noise - a seized bearing can lock the wheel or cause it to separate while driving (catastrophic failure).',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'HRVForum consensus: OEM bearings (NSK, NTN) or Timken/SKF aftermarket. Avoid ultra-cheap eBay bearings - many fail within 10k miles.',
        partBrand: 'Timken',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'DIY-friendly if you have a press or can rent one from AutoZone. Otherwise, shop labor is 1.5-2 hours per side.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'The humming noise is usually the first symptom - catch it early before the bearing fully fails and damages the hub/spindle.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'honda-hrv-drive-belt-tensioner-rattle-2016',
    make: 'Honda',
    model: 'HR-V',
    years: { start: 2016, end: 2023 },
    title: 'Drive Belt Tensioner Bearing Rattle',
    severity: 'medium',
    description: 'The Honda HR-V drive belt tensioner bearing fails prematurely, causing a rattling or squealing noise from the front of the engine, especially on cold starts. The tensioner pulley bearing wears out and creates noise, but the belt stays tight. If ignored, the tensioner can seize, causing the serpentine belt to slip or break, resulting in loss of power steering, alternator, and water pump (overheating). Replacement: $150-300.',
    symptoms: [
      'Rattling noise from front of engine',
      'Squealing or chirping on cold starts',
      'Noise goes away when engine warms up (sometimes)',
      'Visible wobble in tensioner pulley',
      'Serpentine belt squealing'
    ],
    solution: 'Inspect the drive belt tensioner pulley for play/wobble. If the bearing is bad, replace the entire tensioner assembly (not just the pulley). Also replace the serpentine belt at the same time (~$20-30). Total cost: $150-300 for tensioner + belt + labor. Use OEM Honda or quality aftermarket (Gates, Dayco) tensioners.',
    estimatedCost: { min: 150, max: 300 },
    communityRecommendations: [
      {
        type: 'tip',
        content: 'DIY-friendly - the tensioner is easily accessible on the HR-V. Takes 30-45 minutes with basic hand tools.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'HRVForum members report good results with Gates or Dayco tensioners at half the price of OEM Honda.',
        partBrand: 'Gates',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Don\'t ignore the rattle - if the tensioner seizes, the belt will break and your engine will overheat (no water pump).',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'While you\'re there, replace the serpentine belt too - it\'s cheap ($20-30) and you\'re already in there.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'honda-hrv-rear-camera-failure-2023',
    make: 'Honda',
    model: 'HR-V',
    years: { start: 2023, end: 2023 },
    title: 'Rear-View Camera Display Failure (NHTSA Recall)',
    severity: 'medium',
    description: 'The 2023 Honda HR-V has a recall for rear-view camera display failures. The camera display shows no image when the vehicle is shifted into reverse, which violates Federal Motor Vehicle Safety Standard number 111 (rear visibility). This increases the risk of a crash or injury to pedestrians/objects behind the vehicle. Honda recall: Dealers will replace the display unit free of charge.',
    symptoms: [
      'No image on backup camera display',
      'Black screen when shifted to reverse',
      'Camera display shows error message',
      'Intermittent camera display'
    ],
    solution: 'This is a NHTSA recall - contact your Honda dealer to schedule the free repair. Dealers will replace the defective display unit with a corrected part. Repair is free regardless of warranty status. Until repaired, use mirrors and turn around to check behind the vehicle when reversing.',
    estimatedCost: { min: 0, max: 0 },
    recallInfo: 'NHTSA Recall - Honda will replace the rear-view display unit free of charge. Contact your dealer to schedule the repair.',
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Check if your 2023 HR-V is affected by entering your VIN at Honda\'s recall site: https://www.honda.com/recall',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Until repaired, use extra caution when reversing - turn around and check blind spots since the camera is not working.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Repair is quick (30-60 minutes) and free. Schedule it during your next oil change to save a trip.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'honda-hrv-oil-leaks-engine-2016',
    make: 'Honda',
    model: 'HR-V',
    years: { start: 2016, end: 2023 },
    title: 'Minor Oil Leaks from Engine Seals',
    severity: 'low',
    description: 'Honda HR-V models develop minor oil leaks from various engine seals as they age, particularly the valve cover gasket, oil pan gasket, and front crankshaft seal. These leaks are usually slow and show up as oil spots on the driveway or oil residue on the engine. While not immediately dangerous, oil leaks can cause smoke/burning oil smell, and if left unaddressed, oil level can drop low enough to cause engine damage. Valve cover gasket: $150-300. Oil pan gasket: $200-400.',
    symptoms: [
      'Oil spots on driveway after parking',
      'Oil residue visible on engine (top or bottom)',
      'Burning oil smell from engine bay',
      'Low oil level between changes',
      'Smoke from engine bay (oil dripping on exhaust)'
    ],
    solution: 'Clean the engine thoroughly and identify the source of the leak. Common sources: valve cover gasket (top of engine), oil pan gasket (bottom), front crankshaft seal, or rear main seal. Replace the leaking gasket/seal. Valve cover gasket is DIY-friendly ($150-300). Oil pan gasket requires lifting the engine slightly ($200-400). Monitor oil level and top off as needed until repaired.',
    estimatedCost: { min: 150, max: 400 },
    communityRecommendations: [
      {
        type: 'tip',
        content: 'Valve cover gasket is DIY-friendly on the HR-V - takes 1-2 hours with basic tools. Use OEM Honda gasket for best seal.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Use genuine Honda gaskets - aftermarket gaskets often leak again within a year on Honda engines.',
        partBrand: 'Honda',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Clean the engine with degreaser first so you can pinpoint exactly where the leak is coming from - saves diagnostic time/money.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Don\'t ignore oil leaks - monitor your oil level weekly and top off as needed to prevent engine damage from low oil.',
        upvotes: 0,
        needsReview: true
      }
    ]
  }
];

newIssues.forEach(issue => {
  const exists = knownIssues.issues.some(existing => existing.id === issue.id);
  if (!exists) {
    knownIssues.issues.push(issue);
  }
});

fs.writeFileSync(knownIssuesPath, JSON.stringify(knownIssues, null, 2));

console.log(`✓ Successfully added ${newIssues.length} Honda HR-V issues`);
console.log(`  Total issues in database: ${knownIssues.issues.length}`);
console.log('\nAdded:');
newIssues.forEach(issue => {
  const yearRange = `${issue.years.start}${issue.years.end !== issue.years.start ? `-${issue.years.end}` : ''}`;
  console.log(`  - ${issue.title} (${yearRange})`);
});
