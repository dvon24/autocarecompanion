const fs = require('fs');
const path = require('path');

const knownIssuesPath = path.join(__dirname, '..', 'src', 'data', 'known-issues.json');
const knownIssues = JSON.parse(fs.readFileSync(knownIssuesPath, 'utf8'));

const bmw1SeriesIssues = [
  {
    id: 'bmw-1series-n54-hpfp-2008',
    make: 'BMW',
    model: '1 Series',
    years: { start: 2008, end: 2011 },
    title: 'N54 High-Pressure Fuel Pump (HPFP) Failure (135i / 1M)',
    severity: 'high',
    description: 'The N54 3.0L twin-turbo inline-6 in 2008-2010 135i and 2011 1M Coupe suffers from high-pressure fuel pump (HPFP) failure. The HPFP piston and internal O-ring wear prematurely, causing loss of fuel rail pressure and engine stalling or failure to start. This was one of BMW\'s most widespread N54 issues, affecting tens of thousands of vehicles. BMW issued a recall in October 2010 and extended the warranty to 10 years/120,000 miles on affected vehicles. The OEM Bosch HPFP has gone through multiple revisions (current Rev D, PN 13517616170) to address the failure mode. Symptoms typically appear as sudden loss of power under load, long cranking times, or complete failure to start. N54Tuners and 1Addicts forums report this as the single most common N54 failure, with some owners experiencing multiple pump replacements before the revised part was available.',
    symptoms: [
      'Engine stalling or sudden loss of power under acceleration',
      'Extended/long cranking before engine starts',
      'Engine fails to start entirely',
      'Check engine light with fuel pressure codes (2FBE, 2FBF, 29DC, 29E2)',
      'Rough idle and hesitation',
      'Limp mode activation under boost'
    ],
    solution: 'Replace HPFP with latest revision OEM Bosch pump (Rev D, PN 13517616170, $400-650). Check VIN for BMW recall eligibility (October 2010 recall) and extended warranty coverage (10 years/120,000 miles). If within coverage, repair should be free at dealer. DIY replacement is straightforward (1-2 hours, accessible from top of engine). Always replace with OEM Bosch - aftermarket pumps have high failure rates. When replacing, also inspect fuel injectors for contamination from failed pump debris.',
    estimatedCost: { min: 400, max: 1400 },
    recallInfo: 'BMW Recall October 2010 for HPFP replacement. Extended warranty 10 years/120,000 miles on affected vehicles. Check VIN with dealer for eligibility.',
    communityRecommendations: [
      {
        type: 'part',
        content: 'OEM Bosch HPFP Rev D (PN 13517616170, $400-650) is the only reliable replacement. Earlier revisions (A/B/C) still fail. Aftermarket pumps have high failure rates.',
        partBrand: 'Bosch',
        partName: 'High-Pressure Fuel Pump (HPFP) Rev D',
        partNumber: '13517616170',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Check VIN with BMW dealer for October 2010 recall and extended warranty (10yr/120k miles) before paying out of pocket. Many vehicles still covered.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Carry a portable code reader - HPFP failure can strand you. Codes 2FBE/2FBF/29DC/29E2 confirm fuel pump failure vs. other issues.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'DIY replacement is straightforward (1-2 hours) - pump is accessible from top of engine. Saves $400-800 in dealer labor.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-1series-n54-wastegate-2008',
    make: 'BMW',
    model: '1 Series',
    years: { start: 2008, end: 2011 },
    title: 'N54 Wastegate Rattle & Turbo Failure (135i / 1M)',
    severity: 'moderate',
    description: 'The N54 twin-turbo system in 2008-2010 135i and 2011 1M uses Mitsubishi TD03 turbochargers with wastegate flappers that develop excessive play from bushing wear. The wastegate flapper bushings wear down over time, causing the flapper to rattle against the turbo housing at idle and low throttle. This characteristic "wastegate rattle" is audible as a metallic rattling sound, especially noticeable at idle with windows down near a wall. If left unaddressed, worn wastegates lead to boost control issues, overboost/underboost faults, and eventually complete turbo failure requiring replacement of one or both turbochargers ($770-1,100 each OEM). BMW issued TSB SI B01 02 12 acknowledging the issue and extended the warranty to 8 years/82,000 miles on affected vehicles. VTT (Vargas Turbo Technologies) offers a popular wastegate fix kit (VTT-N54-WF2, $150-250) that replaces the worn bushings without removing turbos.',
    symptoms: [
      'Metallic rattling/chattering noise at idle (sounds like marbles in a can)',
      'Rattle most noticeable at warm idle with A/C off',
      'Boost pressure fault codes (30FF, 30BA overboost/underboost)',
      'Loss of power or inconsistent boost delivery',
      'Check engine light with turbo-related codes',
      'Wastegate rattle worsens over time until turbo failure'
    ],
    solution: 'Install VTT Wastegate Fix Kit (VTT-N54-WF2, $150-250) to replace worn bushings without turbo removal - this is the community-preferred fix. If turbos are damaged beyond wastegate repair, replace turbochargers: OEM front turbo PN 11657649289 ($770-1,100), rear turbo PN 11657649290 ($770-1,100). Check VIN for BMW extended warranty (TSB SI B01 02 12, 8 years/82,000 miles). Full turbo replacement at independent shop: $2,500-3,500 including labor. Dealer: $4,000-5,200.',
    estimatedCost: { min: 1150, max: 5200 },
    recallInfo: 'TSB SI B01 02 12. BMW extended warranty 8 years/82,000 miles on wastegate/turbo issues for affected vehicles.',
    communityRecommendations: [
      {
        type: 'part',
        content: 'VTT (Vargas Turbo Technologies) Wastegate Fix Kit VTT-N54-WF2 ($150-250) replaces worn bushings without turbo removal. Community-preferred fix on 1Addicts/N54Tuners.',
        partBrand: 'VTT',
        partName: 'N54 Wastegate Fix Kit',
        partNumber: 'VTT-N54-WF2',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'OEM Mitsubishi TD03 turbochargers: front PN 11657649289, rear PN 11657649290 ($770-1,100 each). Replace both simultaneously if one has failed.',
        partBrand: 'BMW',
        partName: 'N54 Turbocharger Assembly',
        partNumber: '11657649289',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Wastegate rattle is cosmetic initially but worsens until turbo failure. Fix early with VTT kit ($150-250) vs. full turbo replacement ($3,000-5,200) later.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Check VIN for BMW extended warranty (TSB SI B01 02 12, 8yr/82k miles) before paying out of pocket for wastegate/turbo repairs.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-1series-n54-injector-2008',
    make: 'BMW',
    model: '1 Series',
    years: { start: 2008, end: 2011 },
    title: 'N54 Fuel Injector Failure (135i / 1M)',
    severity: 'moderate',
    description: 'The N54 twin-turbo engine in 2008-2010 135i and 2011 1M uses piezoelectric direct fuel injectors that are prone to premature failure. BMW has released multiple injector revisions (Index 1 through Index 12) to address various failure modes including stuck-open injectors, leaking seals, and misfires. Failed injectors cause rough idle, misfires, poor fuel economy, and can hydrolock cylinders if stuck open (dumping raw fuel into cylinders). The latest VDO/Continental Index 12 injectors (PN 13538616079, $100-150 each) are the most reliable revision. BMW extended warranty coverage on injectors for some affected vehicles. 1Addicts and N54Tuners forums recommend replacing all 6 injectors simultaneously with Index 12 units ($600-900 for set of 6) when any single injector fails, as remaining original injectors will likely fail soon after.',
    symptoms: [
      'Rough idle and engine misfires (especially cold start)',
      'Check engine light with misfire codes (P0300-P0306)',
      'Fuel smell from exhaust (rich running from stuck-open injector)',
      'Poor fuel economy',
      'Engine hesitation under acceleration',
      'Hydrolock risk if injector stuck open (catastrophic engine damage)'
    ],
    solution: 'Replace all 6 fuel injectors with latest VDO/Continental Index 12 units (PN 13538616079, $100-150 each, $600-900 for complete set of 6). Always replace complete set - remaining old injectors will fail soon after. Labor: $300-500 at independent shop, $500-800 at dealer. Check VIN for BMW extended warranty on injectors. CRITICAL: If you smell raw fuel or have persistent misfire on one cylinder, stop driving immediately - stuck-open injector can hydrolock engine.',
    estimatedCost: { min: 1000, max: 1700 },
    recallInfo: 'BMW extended warranty coverage on fuel injectors for some affected vehicles. Check VIN with dealer for eligibility.',
    communityRecommendations: [
      {
        type: 'part',
        content: 'VDO/Continental Index 12 Injectors (PN 13538616079, $100-150 each, $600-900 set of 6) are the latest and most reliable revision. Do NOT use earlier Index injectors.',
        partBrand: 'VDO/Continental',
        partName: 'N54 Piezoelectric Fuel Injector (Index 12)',
        partNumber: '13538616079',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Replace ALL 6 injectors simultaneously even if only one has failed. Remaining original injectors will fail soon - save on repeat labor costs.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'If you smell raw fuel or have persistent single-cylinder misfire, STOP DRIVING immediately. Stuck-open injector can hydrolock engine (catastrophic damage).',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'When replacing injectors, also replace spark plugs and clean carbon buildup from intake valves (walnut blast) - saves on labor since intake manifold is already removed.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-1series-water-pump-2008',
    make: 'BMW',
    model: '1 Series',
    years: { start: 2008, end: 2013 },
    title: 'Electric Water Pump Failure (All 1 Series E82/E88)',
    severity: 'moderate',
    description: 'All BMW 1 Series E82/E88 models (2008-2013) with N52, N54, and N55 engines use electric water pumps that fail prematurely, typically between 60,000-80,000 miles. The Continental/VDO electric pump contains an internal circuit board and plastic impeller that deteriorate from heat and coolant exposure. Unlike traditional belt-driven water pumps, the electric pump fails SUDDENLY without warning - coolant circulation stops and the engine overheats within minutes, potentially causing warped cylinder heads and blown head gaskets ($3,000-6,000 damage). The N52 128i uses pump PN 11517586925 ($200-350), while N54/N55 135i and 1M use pump PN 11517632426 ($250-400). Community consensus on 1Addicts: replace water pump preventively at 60,000 miles along with thermostat (PN 11537549476, $50-80) to avoid being stranded with a catastrophic overheat.',
    symptoms: [
      'Engine overheating rapidly without warning',
      'Coolant temperature gauge spikes to red zone suddenly',
      'Steam or coolant spray from engine bay',
      '"Engine Overheating" warning message on dashboard',
      'Coolant warning light',
      'No heat from cabin heater (pump not circulating coolant)'
    ],
    solution: 'Replace electric water pump and thermostat together. N52 (128i): Continental/VDO pump PN 11517586925 ($200-350) + thermostat PN 11537549476 ($50-80). N54/N55 (135i/1M): Continental/VDO pump PN 11517632426 ($250-400) + thermostat PN 11537549476 ($50-80). Labor: $200-400. Total: $550-1,000. PREVENTIVE: Replace at 60,000 miles before failure. If engine overheats, PULL OVER IMMEDIATELY and shut off engine. DO NOT drive - call tow truck. Driving with overheating engine causes $3,000-6,000 head gasket/cylinder head damage.',
    estimatedCost: { min: 550, max: 1000 },
    recallInfo: 'No official recall. Electric water pump considered routine maintenance by BMW.',
    communityRecommendations: [
      {
        type: 'part',
        content: 'N52 (128i): Continental/VDO pump PN 11517586925 ($200-350). N54/N55 (135i/1M): Continental/VDO pump PN 11517632426 ($250-400). Use OEM or Rein brand only.',
        partBrand: 'Continental/VDO',
        partName: 'Electric Water Pump',
        partNumber: '11517632426',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Always replace thermostat (PN 11537549476, $50-80) with water pump - labor overlap saves $200+ in future. Both fail around same mileage.',
        partBrand: 'BMW',
        partName: 'Thermostat Assembly',
        partNumber: '11537549476',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Replace water pump preventively at 60,000 miles BEFORE failure. Electric pumps fail suddenly - no gradual warning signs like belt-driven pumps.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'If engine overheats, PULL OVER IMMEDIATELY and shut off engine. Do NOT drive - even 2 minutes of overheating can warp cylinder heads ($3,000-6,000 repair).',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-1series-ofhg-leak-2008',
    make: 'BMW',
    model: '1 Series',
    years: { start: 2008, end: 2013 },
    title: 'Oil Filter Housing Gasket Leak (All 1 Series E82/E88)',
    severity: 'moderate',
    description: 'All BMW 1 Series E82/E88 models (2008-2013) with N52, N54, and N55 engines develop oil filter housing gasket (OFHG) leaks as the rubber gaskets harden and crack from repeated heat cycling. Oil seeps from the gasket between the oil filter housing and engine block, dripping onto the exhaust manifold below. This creates a burning oil smell, visible smoke, and presents a FIRE RISK as oil accumulates on hot exhaust components. The leak typically starts around 60,000-80,000 miles and worsens progressively. N52 (128i) uses Elring gasket PN 11427537293 ($10-25). N54/N55 (135i/1M) uses FCP Euro kit PN 11428637821KT or individual Elring gaskets PN 11428637820 + 11428637821. This is a well-known BMW issue across all models of this era - 1Addicts forum considers it routine maintenance, not a defect.',
    symptoms: [
      'Burning oil smell from engine bay (oil dripping on exhaust)',
      'Visible oil seepage around oil filter housing',
      'Oil drips on driveway under passenger side of engine',
      'Smoke from engine bay when engine is hot',
      'Low oil warnings between oil changes',
      'Oil residue on serpentine belt and pulleys'
    ],
    solution: 'Replace oil filter housing gasket(s). N52 (128i): Elring gasket PN 11427537293 ($10-25), labor $150-300. N54/N55 (135i/1M): FCP Euro kit PN 11428637821KT or Elring gaskets PN 11428637820 + 11428637821, labor $200-400. Total: $215-450. DIY-friendly on N52 (1-2 hours). N54/N55 more involved due to turbo components. FIRE RISK: Do not ignore oil dripping on exhaust - clean accumulated oil from exhaust manifold during repair. Replace oil filter housing cap O-ring at same time (often overlooked and leaks separately).',
    estimatedCost: { min: 215, max: 450 },
    recallInfo: 'No official recall. Considered routine maintenance on BMW N52/N54/N55 engines.',
    communityRecommendations: [
      {
        type: 'part',
        content: 'N52 (128i): Elring gasket PN 11427537293 ($10-25). N54/N55 (135i/1M): FCP Euro kit PN 11428637821KT with Elring gaskets PN 11428637820 + 11428637821.',
        partBrand: 'Elring',
        partName: 'Oil Filter Housing Gasket',
        partNumber: '11427537293',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Oil dripping on hot exhaust is a FIRE RISK. Do not ignore burning oil smell - address promptly and clean accumulated oil from exhaust during repair.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Replace oil filter housing cap O-ring at same time - it often leaks separately and labor is already done. Costs $5-10 extra for the O-ring.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'DIY-friendly on N52 128i (1-2 hours). N54/N55 135i more involved due to turbo plumbing but still possible with basic tools.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-1series-valve-cover-pcv-2008',
    make: 'BMW',
    model: '1 Series',
    years: { start: 2008, end: 2013 },
    title: 'Valve Cover & PCV System Failure (All 1 Series E82/E88)',
    severity: 'moderate',
    description: 'All BMW 1 Series E82/E88 models (2008-2013) use plastic valve covers that crack, warp, and deteriorate from engine heat cycling. The valve cover integrates the PCV (Positive Crankcase Ventilation) system, so when the valve cover fails, the PCV also fails - causing oil leaks, vacuum leaks, rough idle, and check engine lights. The plastic valve cover warps from repeated heating/cooling cycles, breaking the seal with the cylinder head. N52 (128i) uses Genuine BMW valve cover PN 11127552281 ($225). N54/N55 (135i/1M) uses Genuine BMW valve cover PN 11127565284 ($350-500), with URO Parts offering a cheaper alternative ($180). This is a well-documented failure on 1Addicts and Bimmerpost - the plastic valve covers are considered a design flaw that BMW has not corrected. Replace with OEM BMW for best longevity.',
    symptoms: [
      'Oil leaking from valve cover gasket area',
      'Rough idle and engine misfires (PCV failure causes vacuum leak)',
      'Whistling or hissing noise from engine (cracked valve cover)',
      'Check engine light with lean/misfire codes',
      'Burning oil smell from oil on exhaust',
      'Oil accumulation around spark plug wells (fouling plugs)',
      'Excessive crankcase pressure (oil pushed past seals)'
    ],
    solution: 'Replace valve cover assembly (includes integrated PCV). N52 (128i): Genuine BMW PN 11127552281 ($225), labor $200-400. N54/N55 (135i/1M): Genuine BMW PN 11127565284 ($350-500) or URO alternative ($180), labor $250-500. Total: $580-1,185. Replace valve cover bolts simultaneously - they stretch and lose clamping force. Use OEM BMW valve cover for best longevity (URO alternative is cheaper but may not last as long). While valve cover is removed, replace spark plugs and inspect coils to save on future labor.',
    estimatedCost: { min: 580, max: 1185 },
    recallInfo: 'No official recall. Known design issue with BMW plastic valve covers across all models.',
    communityRecommendations: [
      {
        type: 'part',
        content: 'N52 (128i): Genuine BMW valve cover PN 11127552281 ($225). N54/N55 (135i/1M): Genuine BMW PN 11127565284 ($350-500). URO alternative ($180) available but shorter lifespan.',
        partBrand: 'BMW',
        partName: 'Valve Cover Assembly with PCV',
        partNumber: '11127565284',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Replace valve cover bolts when replacing cover - they stretch over time and lose clamping force, causing new cover to leak prematurely.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'While valve cover is removed, replace spark plugs and inspect coils - saves $100-200 in future labor since they share access.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'URO alternative valve cover ($180) is cheaper but 1Addicts reports shorter lifespan vs. OEM BMW ($350-500). OEM recommended for longevity.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-1series-n54-charge-pipe-2008',
    make: 'BMW',
    model: '1 Series',
    years: { start: 2008, end: 2011 },
    title: 'N54 Charge Pipe Failure (135i / 1M)',
    severity: 'moderate',
    description: 'The N54 twin-turbo engine in 2008-2010 135i and 2011 1M uses a plastic charge pipe (intercooler-to-throttle body pipe) that cracks and blows off under boost pressure. The OEM plastic pipe becomes brittle over time from heat cycling and boost pressure fatigue, eventually cracking or separating at the throttle body connection. When the charge pipe fails, all boost pressure escapes, causing immediate and dramatic loss of power (engine drops to naturally-aspirated power levels). This is especially dangerous during highway merging or passing. The failure is more common on tuned/modified vehicles running higher boost, but occurs on stock vehicles as well. Community-preferred fix is to replace the OEM plastic pipe with an aluminum aftermarket upgrade: VRSF ($100-150), BMS ($100-150), or Mishimoto ($120-170). Aluminum pipes eliminate the failure mode permanently.',
    symptoms: [
      'Sudden dramatic loss of power under boost (car feels gutless)',
      'Loud pop or hissing sound from engine bay (pipe blowing off)',
      'Visible crack or disconnection in charge pipe',
      'Boost pressure fault codes (30FF underboost)',
      'Check engine light',
      'Whistling/whooshing sound from engine bay under throttle'
    ],
    solution: 'Replace OEM plastic charge pipe with aluminum aftermarket upgrade: VRSF Aluminum Charge Pipe ($100-150), BMS Aluminum Charge Pipe ($100-150), or Mishimoto Charge Pipe ($120-170). Aluminum pipes eliminate the failure mode permanently - no repeat failures. Installation is DIY-friendly (30-60 minutes). Do NOT replace with another OEM plastic pipe - it will fail again. If on a budget, the OEM pipe can be temporarily repaired with epoxy but this is not a permanent fix.',
    estimatedCost: { min: 100, max: 370 },
    recallInfo: 'No official recall. Known design weakness of OEM plastic charge pipe under boost pressure.',
    communityRecommendations: [
      {
        type: 'part',
        content: 'VRSF Aluminum Charge Pipe ($100-150) - most popular upgrade on N54Tuners and 1Addicts. Eliminates plastic pipe failure permanently.',
        partBrand: 'VRSF',
        partName: 'Aluminum Charge Pipe',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'BMS Aluminum Charge Pipe ($100-150) and Mishimoto Charge Pipe ($120-170) are also excellent options. All aluminum pipes are permanent fix.',
        partBrand: 'BMS',
        partName: 'Aluminum Charge Pipe',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'warning',
        content: 'Do NOT replace with another OEM plastic charge pipe - it WILL fail again. Aluminum upgrade is same cost and eliminates the problem permanently.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'DIY installation takes 30-60 minutes with basic tools. One of the easiest N54 upgrades. No tuning or coding required.',
        upvotes: 0,
        needsReview: true
      }
    ]
  },
  {
    id: 'bmw-1series-n54-spark-coil-2008',
    make: 'BMW',
    model: '1 Series',
    years: { start: 2008, end: 2011 },
    title: 'N54 Spark Plug & Ignition Coil Failure (135i / 1M)',
    severity: 'low',
    description: 'The N54 twin-turbo engine in 2008-2010 135i and 2011 1M operates at high cylinder pressures from direct injection and forced induction, demanding more frequent spark plug replacement than BMW\'s suggested 100,000-mile interval. Real-world experience from N54Tuners and 1Addicts forums shows plugs should be replaced every 25,000-30,000 miles (not 100,000 as BMW claims). The OEM Bosch ZGR6STE2 spark plugs (PN 12120037244, $12-15 each) are gapped at 0.024" from factory for the N54\'s high boost pressures - do NOT use standard gap. Ignition coils (Delphi/Genuine BMW PN 12138616153, $25-40 each) also fail prematurely from the high electrical demands, causing misfires. Worn plugs and weak coils cause cascading misfires, rough idle, and reduced power. Replace all 6 plugs and inspect coils every 25,000-30,000 miles as preventive maintenance.',
    symptoms: [
      'Engine misfires (especially under boost/load)',
      'Rough idle',
      'Check engine light with misfire codes (P0300-P0306)',
      'Reduced power and hesitation',
      'Poor fuel economy',
      'Difficulty starting in cold weather'
    ],
    solution: 'Replace all 6 spark plugs with OEM Bosch ZGR6STE2 (PN 12120037244, $12-15 each) every 25,000-30,000 miles. Gap plugs to 0.024" for N54 - do NOT use standard gap. Replace ignition coils (Delphi/Genuine BMW PN 12138616153, $25-40 each) as needed - typically every 50,000-60,000 miles or when misfires persist after plug replacement. DIY-friendly: plugs take 30-45 minutes, coils 15 minutes. Total parts: $200-400 for complete plug and coil refresh (6 plugs + 6 coils).',
    estimatedCost: { min: 200, max: 400 },
    recallInfo: 'No official recall. BMW 100,000-mile plug interval is unrealistic for N54 - community recommends 25,000-30,000 miles.',
    communityRecommendations: [
      {
        type: 'part',
        content: 'Bosch ZGR6STE2 spark plugs (PN 12120037244, $12-15 each) are OEM spec. Gap to 0.024" for N54 high boost - do NOT use standard gap or different plug.',
        partBrand: 'Bosch',
        partName: 'ZGR6STE2 Spark Plug',
        partNumber: '12120037244',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'part',
        content: 'Delphi/Genuine BMW ignition coils (PN 12138616153, $25-40 each). Replace all 6 when any single coil fails - remaining coils are likely near end of life.',
        partBrand: 'Delphi',
        partName: 'Ignition Coil',
        partNumber: '12138616153',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'Replace plugs every 25,000-30,000 miles, NOT BMW\'s 100,000-mile interval. N54\'s high cylinder pressures eat plugs - worn plugs cause cascading misfires.',
        upvotes: 0,
        needsReview: true
      },
      {
        type: 'tip',
        content: 'DIY-friendly: plugs take 30-45 minutes, coils 15 minutes. No special tools needed beyond standard spark plug socket.',
        upvotes: 0,
        needsReview: true
      }
    ]
  }
];

// Add new issues to the known issues array
knownIssues.issues.push(...bmw1SeriesIssues);

// Write back to file
fs.writeFileSync(knownIssuesPath, JSON.stringify(knownIssues, null, 2));

console.log(`✓ Successfully added ${bmw1SeriesIssues.length} BMW 1 Series issues`);
console.log(`  Total issues in database: ${knownIssues.issues.length}`);
console.log('\nAdded:');
bmw1SeriesIssues.forEach(issue => {
  console.log(`  - ${issue.title} (${issue.years.start}-${issue.years.end})`);
});
