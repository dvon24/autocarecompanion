const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

function source(type, title, url) {
  return { type, title, url };
}

function replacement(card, decision) {
  return {
    disposition: 'replace',
    decision,
    evidence: card.sources.map((item) => ({ type: item.type, label: item.title, url: item.url })),
    after: {
      years: card.years,
      trims: card.trims || [],
      engines: card.engines || [],
      category: card.category,
      title: card.title,
      description: card.description,
      solution: card.solution,
      severity: card.severity,
      confidence: 'high',
      symptoms: card.symptoms,
      affectedSystems: card.affectedSystems,
      dtcCodes: [],
      estimatedCostLow: null,
      estimatedCostHigh: null,
      typicalMileageLow: null,
      typicalMileageHigh: null,
      citations: card.sources,
      source: 'nhtsa-verified',
      summary: card.summary,
    },
  };
}

const sources = {
  defReservoir: source('tsb', 'GM Special Coverage 29400 - Diesel Emission Fluid Tank Reservoir', 'https://static.nhtsa.gov/odi/tsbs/2017/MC-10135147-9999.pdf'),
  glowPlug: source('tsb', 'GM Special Coverage N212338290 - Glow Plug Failure', 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10200199-9999.pdf'),
  leafSpring: source('tsb', 'GM Bulletin 21-NA-138 - Rear Leaf-Spring Squeak, Grind or Clunk', 'https://static.nhtsa.gov/odi/tsbs/2024/MC-11004990-0001.pdf'),
  tcmEsd: source('tsb', 'GM Preliminary Information PI0310A - Allison TCM Communication Loss from Electrostatic Discharge', 'https://static.nhtsa.gov/odi/tsbs/2013/SB-10037409-9429.pdf'),
  exhaustSensor: source('tsb', 'GM Special Coverage N192291640 - Exhaust Temperature Sensor Failure', 'https://static.nhtsa.gov/odi/tsbs/2020/MC-10178403-9999.pdf'),
};

const cards = {
  defReservoir: {
    years: [2013, 2014, 2015],
    engines: ['6.6L Duramax diesel (RPO LML)'],
    category: 'exhaust',
    title: 'DEF Reservoir Temperature-Sensor Offset or Heater Resistance (Special Coverage 29400)',
    description: 'GM special coverage 29400 applies to certain VIN-identified 2013-2015 Silverado HD trucks with the LML Duramax. A temperature-sensor offset in the diesel-emission-reduction-fluid reservoir or increased DEF-tank-heater resistance can illuminate the malfunction indicator lamp. It does not establish that every DEF warning is an injector, heater, quality-sensor or SCR-catalyst failure.',
    solution: 'Have a GM dealer confirm the VIN and diagnose the warning. For a vehicle meeting special coverage 29400 criteria, GM directed replacement of the DEF tank reservoir. The published coverage was 10 years or 120,000 miles from the original in-service date, so current eligibility must be confirmed rather than promised.',
    severity: 'medium',
    symptoms: ['Malfunction indicator lamp related to the DEF reservoir', 'Confirmed DEF reservoir temperature-sensor offset', 'Confirmed increased DEF tank-heater resistance'],
    affectedSystems: ['DEF tank reservoir temperature sensor', 'DEF tank heater'],
    sources: [sources.defReservoir],
    summary: 'Replaced the 2011-2025 multi-component DEF aggregation with special coverage 29400\'s exact 2013-2015 LML reservoir condition and VIN-gated remedy.',
  },
  glowPlug: {
    years: [2018, 2019],
    engines: ['6.6L Duramax diesel (RPO L5P)'],
    category: 'engine',
    title: 'L5P Glow Plugs Can Fail and Cause a Hard or Rough Cold Start (N212338290)',
    description: 'GM special coverage N212338290 applies to certain VIN-identified 2018-2019 Silverado trucks with the L5P Duramax. A failed glow plug can illuminate the check-engine light and set a diagnostic code; the engine may be hard to start, unable to remote-start in cold weather or rough immediately after a cold start. The coverage does not establish a 2001-2020 all-Duramax failure pattern.',
    solution: 'Have a dealer verify VIN eligibility and follow the applicable GM diagnostic chart. GM directs replacement only for the glow plug or plugs reached by diagnosis. The special coverage states 15 years or 150,000 miles from original in-service date, whichever comes first, for eligible vehicles.',
    severity: 'medium',
    symptoms: ['Check-engine light with a glow-plug-related code', 'Hard cold start', 'Cold-weather remote start unavailable', 'Rough running immediately after a cold start'],
    affectedSystems: ['L5P engine glow plugs', 'cold-start combustion support'],
    sources: [sources.glowPlug],
    summary: 'Bounded the glow-plug card to special coverage N212338290\'s 2018-2019 L5P population, diagnosis gate and as-needed replacement.',
  },
  leafSpring: {
    years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
    category: 'suspension',
    title: 'Rear Leaf-Spring Inserts Can Squeak, Grind or Clunk (21-NA-138)',
    description: 'GM bulletin 21-NA-138 covers 2015-2025 Silverado HD trucks with a rear squeak, grind or clunk caused by the spring insert interacting with the leaf spring. GM notes that some spring noise over bumps is characteristic. The bulletin does not identify cracked springs, fuel-tank puncture or overload-related breakage.',
    solution: 'Inspect the rear springs and first rule out a cracked leaf, loose hardware or another suspension fault. For the insert-interaction noise covered by 21-NA-138, GM directs cleaning the contact area and installing revised grained spring-tip inserts. Some noise can remain during an approximately 1,000-mile insert break-in period.',
    severity: 'low',
    symptoms: ['Squeak from the rear leaf springs', 'Grinding noise from the rear spring pack', 'Clunk associated with leaf-spring insert contact'],
    affectedSystems: ['rear leaf springs', 'spring-tip inserts'],
    sources: [sources.leafSpring],
    summary: 'Replaced the unsupported spring-breakage and aftermarket-helper claim with bulletin 21-NA-138\'s exact insert-noise condition and repair.',
  },
  tcmEsd: {
    years: [2007, 2008, 2009, 2010, 2011, 2012],
    trims: ['Allison A1000 automatic transmission (RPO MW7)'],
    category: 'transmission',
    title: 'Aftermarket Belt Electrostatic Discharge Can Interrupt Allison TCM Communication (PI0310A)',
    description: 'GM preliminary information PI0310A applies to 2007-2012 Silverado trucks with the MW7 Allison A1000. Certain aftermarket serpentine belts or upfitter equipment can generate electrostatic discharge that interrupts communication with the externally mounted transmission control module, causing hesitation, clunking, reduced torque, range inhibit, no shift or a stuck gear. The bulletin does not describe an internal fluid-bathed TCM.',
    solution: 'A technician should run the vehicle diagnostic system check, inspect for aftermarket belts or equipment, verify the electrostatic-discharge condition and follow PI0310A\'s OEM-belt and TCM-relocation steps. Do not replace the TCM unless hard failure or erratic behavior remains after the root cause is corrected.',
    severity: 'high',
    symptoms: ['Intermittent hesitation or clunk', 'Reduced torque or range inhibit', 'Stuck in gear or neutral', 'Loss of communication with the Allison TCM'],
    affectedSystems: ['Allison A1000 transmission control module', 'serpentine belt electrostatic discharge', 'TCM communication network'],
    sources: [sources.tcmEsd],
    summary: 'Corrected the false internal-TCM narrative to PI0310A\'s 2007-2012 aftermarket-belt ESD condition and explicit do-not-replace-TCM diagnostic gate.',
  },
  exhaustSensor: {
    years: [2016],
    engines: ['6.6L Duramax diesel (RPO LML)'],
    category: 'exhaust',
    title: 'Position-2 Exhaust Temperature Sensor Failure Can Disable DPF Regeneration and DEF Dosing (N192291640)',
    description: 'GM special coverage N192291640 applies to certain VIN-identified 2016 Silverado trucks with the LML Duramax. A failed position-2 exhaust-gas-temperature sensor can inhibit diesel-particulate-filter regeneration and selective-catalyst-reduction DEF dosing, illuminate the check-engine light, display Service Exhaust Fluid System or Service Emission System and potentially produce reduced power.',
    solution: 'Have a GM dealer confirm VIN eligibility and complete service-information diagnostics. Replace the position-2 exhaust temperature sensor only when diagnosis leads to it. The special coverage states 10 years or 120,000 miles from original in-service date, whichever comes first, so verify whether the truck remains eligible.',
    severity: 'high',
    symptoms: ['Service Exhaust Fluid System or Service Emission System message', 'Check-engine light', 'Reduced engine power', 'DPF regeneration and DEF dosing inhibited'],
    affectedSystems: ['position-2 exhaust gas temperature sensor', 'diesel particulate filter regeneration', 'selective catalyst reduction DEF dosing'],
    sources: [sources.exhaustSensor],
    summary: 'Replaced the duplicate 2011-2025 generic DEF card with special coverage N192291640\'s exact 2016 LML position-2 temperature-sensor failure and diagnosis-first remedy.',
  },
};

const published = {
  'chevrolet-silverado-3500hd-def-system': replacement(cards.defReservoir, 'Replace the 2011-2025 multi-component DEF warning card with special coverage 29400 for the exact 2013-2015 LML reservoir temperature-sensor/heater condition.'),
  'chevrolet-silverado-3500hd-glow-plug': replacement(cards.glowPlug, 'Replace the 2001-2020 generic maintenance card with special coverage N212338290, its exact 2018-2019 L5P VIN population and diagnosis-first repair.'),
  'chevrolet-silverado-3500hd-leaf-spring': replacement(cards.leafSpring, 'Replace forum-based breakage, puncture and overload claims with bulletin 21-NA-138 for the exact insert-interaction noise and revised inserts.'),
  'chevy-silverado-3500hd-allison-tcm-2006': replacement(cards.tcmEsd, 'Replace the false internal fluid-bathed TCM failure claim with PI0310A, which identifies aftermarket-belt electrostatic discharge and says not to replace the TCM until the root cause is resolved.'),
  'chevy-silverado-3500hd-def-system-2011': replacement(cards.exhaustSensor, 'Replace the duplicate generic DEF/SCR aggregation with special coverage N192291640 for the exact 2016 position-2 exhaust-temperature-sensor condition.'),
};

module.exports = buildConfig({
  label: 'Chevrolet Silverado 3500HD',
  make: 'Chevrolet',
  model: 'Silverado 3500HD',
  slug: 'chevrolet-silverado-3500hd',
  batchId: 'chevrolet-silverado-3500hd-full-record-cohort-34-2026-08-03',
  auditDate: '2026-08-03',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: 'e2ca820d2dd38357435f4a47806b87507c6d93ac403f2c262d516ede03138301',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/chevrolet-silverado-3500hd/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'chevroletsilverado3500hd_blind:manual-primary-source-gate',
    edge: 'chevroletsilverado3500hd_edge:manual-primary-source-gate',
  },
  published,
  reasons: {},
  proposalCampaigns: [],
});
