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
  shifter: source('tsb', 'GM Preliminary Information PI1086 - Cracked Shifter Handle Knob', 'https://static.nhtsa.gov/odi/tsbs/2017/MC-10140339-9999.pdf'),
  stabilizer: source('tsb', 'GM Service Update 12172 - Stabilizer Bar Link Contamination', 'https://static.nhtsa.gov/odi/tsbs/2013/MC-10245834-9999.pdf'),
  pcv2012: source('tsb', 'GM Special Coverage N202299080 - Camshaft Cover PCV Diaphragm', 'https://static.nhtsa.gov/odi/tsbs/2020/MC-10178406-9999.pdf'),
  pcv2015: source('tsb', 'GM Special Coverage N192210230 - Camshaft Cover PCV Diaphragm', 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10163845-9999.pdf'),
  turbine: source('recall', 'NHTSA Recall 14V-315 / GM 14234 - Transmission Turbine Shaft Fracture', 'https://static.nhtsa.gov/odi/rcl/2014/RCAK-14V315-6395.pdf'),
  waterPump: source('tsb', 'GM Special Coverage 14371B - 1.4L Water Pump Coolant Leak', 'https://static.nhtsa.gov/odi/tsbs/2015/SB-10057266-8641.pdf'),
};

const cards = {
  shifter: {
    years: [2012, 2013, 2014],
    trims: ['Automatic transmission'],
    category: 'interior',
    title: 'Cracked Shifter Handle Knob Can Prevent Shifting Out of Park (PI1086)',
    description: 'GM preliminary information PI1086 covers 2012-2014 Sonic vehicles whose shifter handle knob is cracked or will not operate while shifting out of Park. The failure is at the handle/knob and release-button area; it does not by itself establish a transmission or complete shifter-control fault.',
    solution: 'Confirm that the handle knob is cracked or its release button is inoperative. PI1086 directs replacement of the shifter handle knob with the updated service part and specifically says not to replace the transmission shifter-control assembly for this condition.',
    severity: 'medium',
    symptoms: ['Visible crack in the shifter handle knob', 'Release button will not operate', 'Cannot shift out of Park because the handle release is inoperative'],
    affectedSystems: ['automatic shifter handle knob', 'shift-lock release button'],
    sources: [sources.shifter],
    summary: 'Retained the accurate PI1086 issue while removing secondary citations and limiting the repair to the updated handle knob rather than the complete shifter control.',
  },
  stabilizer: {
    years: [2012],
    category: 'suspension',
    title: 'Stabilizer-Link Boot Contamination Can Cause a Rattle or Clunk (Service Update 12172)',
    description: 'GM service update 12172 applies to certain VIN-identified 2012 Sonic vehicles. Water and dirt can enter the lower ball-joint boot of a front stabilizer link, causing rust, looseness and wear between the ball stud and socket. Occupants may hear a rattle or clunk during turns or while driving over bumps.',
    solution: 'Have a technician inspect the suspension and confirm the noise source. For an involved vehicle with this condition, service update 12172 directs replacement of both front stabilizer-shaft links. The update expired with the base warranty, so do not assume current free coverage or substitute an aftermarket upgrade claim.',
    severity: 'low',
    symptoms: ['Front rattle or clunk during turns', 'Front clunk over bumps', 'Loose or rust-contaminated stabilizer-link ball joint'],
    affectedSystems: ['front stabilizer-shaft links', 'lower ball-joint boots'],
    sources: [sources.stabilizer],
    summary: 'Narrowed the 2012-2016 durability aggregation to VIN-identified 2012 service update 12172 and its water/dirt intrusion mechanism.',
  },
  pcv: {
    years: [2012, 2013, 2014, 2015],
    engines: ['1.4L turbo (RPO LUJ or LUV)'],
    category: 'engine',
    title: 'PCV Pressure-Regulator Diaphragm Can Crack in the Camshaft Cover (N202299080/N192210230)',
    description: 'GM special coverages N202299080 and N192210230 cover certain VIN-identified 2012-2015 Sonic vehicles with the 1.4L engine. Cracks can develop in the PCV pressure-regulator diaphragm integrated into the camshaft cover, drawing excess air into the intake and causing rough idle, a check-engine light and a lean-fuel-trim or other airflow-related code. The programs do not say every 1.4L Sonic will fail or require an intake manifold.',
    solution: 'Check VIN eligibility and diagnose the airflow/lean condition. When diagnosis confirms the covered diaphragm failure, GM directs replacement of the engine camshaft cover. The published special coverages were 10 years or 120,000 miles from original in-service date; confirm current eligibility, especially for older 2012-2015 vehicles.',
    severity: 'medium',
    symptoms: ['Rough running, especially at idle', 'Check-engine light', 'Fuel-trim lean or airflow-related diagnostic result', 'Confirmed cracked PCV pressure-regulator diaphragm'],
    affectedSystems: ['camshaft-cover PCV pressure regulator', 'engine intake airflow'],
    sources: [sources.pcv2012, sources.pcv2015],
    summary: 'Replaced the 2012-2020 inevitability and intake-check-valve claims with GM\'s exact 2012-2015 PCV diaphragm special-coverages and camshaft-cover remedy.',
  },
  turbine: {
    years: [2012],
    trims: ['Vehicles built March 1-June 29, 2012 with 6-speed automatic transmission'],
    engines: ['1.8L four-cylinder'],
    category: 'transmission',
    title: 'Automatic-Transmission Turbine Shaft Can Fracture (Recall 14V-315)',
    description: 'NHTSA recall 14V-315 (GM 14234) covers 21,567 model-year 2012 Sonic vehicles built from March 1 through June 29, 2012 with the 1.8L engine and six-speed automatic transmission. The turbine shaft can fracture. In first or second gear the car may not upshift; in higher gears it can coast until it slows enough to downshift, increasing crash risk.',
    solution: 'Check the VIN at NHTSA.gov/Recalls or with a Chevrolet dealer. If recall 14V-315 remains open, the dealer remedy is replacement of the transmission turbine shaft at no charge. The recall is not a 2012-2015 all-engine transmission-replacement program, and fluid changes cannot prevent the defined manufacturing defect.',
    severity: 'high',
    symptoms: ['No upshift beyond first or second gear after shaft fracture', 'Vehicle coasts until it can downshift after fracture in a higher gear', 'VIN included in recall 14V-315'],
    affectedSystems: ['six-speed automatic transmission turbine shaft', 'forward gear power transfer'],
    sources: [sources.turbine],
    summary: 'Corrected the recall card to model year 2012, the exact build window, 1.8L/six-speed population, failure behavior and turbine-shaft remedy.',
  },
  waterPump: {
    years: [2012, 2013, 2014],
    engines: ['1.4L turbo (RPO LUJ or LUV)'],
    category: 'cooling',
    title: '1.4L Water Pump Can Leak from the Weep Reservoir or Shaft Seal (Special Coverage 14371B)',
    description: 'GM special coverage 14371B applies to some VIN-identified 2012-2014 Sonic vehicles with the 1.4L engine. Coolant can leak from the water-pump weep reservoir or shaft seal and drip onto the engine or ground. Continued loss can reduce cooling performance, cause overheating, display Engine Hot, AC Off, sound a chime or reduce engine power. Slight staining alone can be normal and is not a replacement trigger.',
    solution: 'Inspect the pump using the bulletin\'s leak-versus-normal-staining criteria. Replace the pump only when there is an obvious leak or excessive deposits; do not replace it for slight normal staining. The special coverage was 10 years or 150,000 miles from original in-service date, so confirm current eligibility. The GM document does not describe a timing-chain-driven pump or require simultaneous timing-chain and thermostat work.',
    severity: 'high',
    symptoms: ['Coolant drip on the engine or ground', 'Excessive coolant deposits on the water-pump housing', 'Engine Hot, AC Off message', 'Overheating or reduced power after coolant loss'],
    affectedSystems: ['1.4L water-pump weep reservoir', 'water-pump shaft seal', 'engine cooling system'],
    sources: [sources.waterPump],
    summary: 'Replaced the all-engine 2012-2020 card and incorrect timing-chain claim with special coverage 14371B\'s exact 2012-2014 1.4L leak criteria and repair.',
  },
};

const published = {
  'chevrolet-sonic-automatic-shifter-knob-cracks-cannot-shift-out-park': replacement(cards.shifter, 'Retain the PI1086-backed shifter-handle condition, remove secondary sources and preserve the explicit do-not-replace-the-complete-shifter instruction.'),
  'chevrolet-sonic-front-stabilizer-link-rattle-clunking': replacement(cards.stabilizer, 'Replace the 2012-2016 owner-report aggregation and aftermarket-upgrade advice with VIN-bounded 2012 service update 12172.'),
  'chevy-sonic-14t-pcv-valve-cover-2012': replacement(cards.pcv, 'Replace owner-forum inevitability, later years and unrelated turbo products with GM special coverages N202299080/N192210230 and their camshaft-cover diagnosis.'),
  'chevy-sonic-transmission-turbine-shaft-2012': replacement(cards.turbine, 'Replace the secondary recall summary, 2012-2015 scope, cost guesses and maintenance products with NHTSA recall 14V-315\'s exact 2012 build/engine/transmission population and remedy.'),
  'chevy-sonic-water-pump-failure-2012': replacement(cards.waterPump, 'Replace the 2012-2020 two-engine aggregation and incorrect timing-chain mechanism with special coverage 14371B, exact 1.4L years, leak criteria and pump-only remedy.'),
};

const reasons = {
  'chevrolet-sonic-ignition-coil-spark-plug-misfire-from-valve-cover-gasket-oil': 'The frozen card assigns 1.8L misfires across seven years to a coil cassette plus oil in the plug wells based on forums and a generic DTC article. Those symptoms and misfire codes have multiple possible causes, and current GM primary-source research did not establish the claimed model-wide valve-cover-gasket failure or universal parts sequence.',
  'chevy-sonic-check-engine-electrical-2012': 'A check-engine light is a warning state, not a single electrical defect. The frozen card combines oxygen sensors, MAP sensors, communications, gas caps and several DTCs across five years, cites a complaint aggregator as NHTSA and promotes generic relays, a meter and a sensor. No one diagnosis or remedy is supportable.',
};

module.exports = buildConfig({
  label: 'Chevrolet Sonic',
  make: 'Chevrolet',
  model: 'Sonic',
  slug: 'chevrolet-sonic',
  batchId: 'chevrolet-sonic-full-record-cohort-36-2026-08-03',
  auditDate: '2026-08-03',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: 'adacd78a8a668958518e62e1d2978788b84c5dd1c66a8fe4f9934869e9ff3da1',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/chevrolet-sonic/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'chevroletsonic_blind:manual-primary-source-gate',
    edge: 'chevroletsonic_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [],
});
