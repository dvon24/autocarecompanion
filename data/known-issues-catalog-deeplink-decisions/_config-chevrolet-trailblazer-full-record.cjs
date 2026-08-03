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
  cvt: source(
    'tsb',
    'GM Preliminary Information PIP6036B - CVT Surge or Fishbite Diagnostic Aid',
    'https://static.nhtsa.gov/odi/tsbs/2025/MC-11018439-0001.pdf',
  ),
  turbo: source(
    'tsb',
    'GM Special Coverage N242484750 - 1.2L Turbocharger Replacement',
    'https://static.nhtsa.gov/odi/tsbs/2025/MC-11012883-0001.pdf',
  ),
  radio: source(
    'tsb',
    'GM Service Update N202316020 - Radio Software Update',
    'https://static.nhtsa.gov/odi/tsbs/2021/MC-10200183-9999.pdf',
  ),
};

const cards = {
  cvt: {
    years: [2022, 2023, 2024, 2025],
    trims: ['Vehicles equipped with MRG CVT'],
    category: 'transmission',
    title: 'Incorrect CVT Pressure Adapts Can Cause a Shudder, Surge or Fishbite Feel (PIP6036B)',
    description: 'GM preliminary information PIP6036B applies to 2022-2025 Trailblazer vehicles with the MRG continuously variable transmission. Incorrectly learned transmission-pressure adapts can create a shudder, surge or fishbite sensation, usually under load and partial throttle between 1,500 and 3,000 rpm. It can resemble a single-cylinder misfire, and GM says torque-converter-clutch shudder is highly unlikely on this transmission. The bulletin does not establish the frozen card\'s 2021 or 2026 scope or prove internal CVT failure.',
    solution: 'First rule out an engine misfire and other drivability causes. If the vehicle and symptom match PIP6036B, use GDS2 to reset the transmission pressure adapts and perform the bulletin\'s CVT learn drive cycle, then reevaluate. Do not authorize a valve body, torque converter or complete CVT solely from the sensation.',
    severity: 'medium',
    symptoms: ['Shudder, surge or fishbite sensation under load', 'Condition most noticeable at partial throttle between 1,500 and 3,000 rpm', 'Sensation can resemble a single-cylinder misfire', 'No engine misfire found during diagnosis'],
    affectedSystems: ['MRG CVT pressure adapts', 'transmission learned values'],
    sources: [sources.cvt],
    summary: 'Narrowed the six-year CVT aggregation to PIP6036B\'s exact 2022-2025 MRG pressure-adapt condition, diagnostic exclusions and relearn procedure.',
  },
  turbo: {
    years: [2022],
    trims: ['VIN-identified vehicles included in Special Coverage N242484750'],
    engines: ['1.2L turbocharged engine'],
    category: 'engine',
    title: 'Certain 1.2L Turbochargers May Fail (Special Coverage N242484750)',
    description: 'GM Special Coverage N242484750 identifies certain 2022 Trailblazer vehicles with the 1.2L engine whose turbocharger may fail. The condition can illuminate the malfunction indicator lamp, set a diagnostic trouble code and display a reduced-engine-power message. Eligibility is VIN-specific; the bulletin does not establish an oil-leak mechanism or a 2021-2026 problem across both 1.2L and 1.3L engines.',
    solution: 'Check the VIN in GM Investigate Vehicle History for Special Coverage N242484750. For an eligible vehicle with the defined condition, the dealer is directed to replace the turbocharger as necessary. The coverage states 15 years or 150,000 miles from first service, subject to its terms; confirm current eligibility before promising a no-charge repair.',
    severity: 'high',
    symptoms: ['Malfunction indicator lamp illuminated', 'Diagnostic trouble code stored with the covered turbo condition', 'Reduced Engine Power message', 'VIN listed under Special Coverage N242484750'],
    affectedSystems: ['1.2L turbocharger', 'engine power management'],
    sources: [sources.turbo],
    summary: 'Replaced the 2021-2026 oil-leak/failure aggregation with the VIN-specific 2022 1.2L turbocharger condition and current 15-year/150,000-mile special coverage.',
  },
  radio: {
    years: [2021],
    trims: ['VIN-identified vehicles with IOS, IOT or IOU infotainment system'],
    category: 'electrical',
    title: 'Radio Screen, Audio and Chimes May Be Inoperative at Cold Key-On (N202316020)',
    description: 'GM Service Update N202316020 identifies certain 2021 Trailblazer vehicles with IOS, IOT or IOU infotainment whose screen may appear black with no audio and no chime at key-on in cold temperatures. This is a specific software condition, not evidence that every 2021-2025 freeze, reboot, Bluetooth or CarPlay complaint shares one cause.',
    solution: 'Confirm the VIN and radio RPO in GM Investigate Vehicle History, then verify the radio software level. The update directs dealers to install the applicable calibration when necessary, including the prescribed SPS/USB procedure. The service update expired with the involved vehicle\'s new-vehicle limited warranty, so confirm coverage before promising a free repair.',
    severity: 'medium',
    symptoms: ['Black infotainment screen at cold key-on', 'No radio audio', 'No vehicle chime', 'VIN and radio RPO included in Service Update N202316020'],
    affectedSystems: ['IOS/IOT/IOU radio software', 'center display', 'audio and vehicle chimes'],
    sources: [sources.radio],
    summary: 'Narrowed the five-year freeze/reboot card to Service Update N202316020\'s exact 2021 cold-key-on black-screen, no-audio and no-chime software condition.',
  },
};

const published = {
  'chevrolet-trailblazer-cvt-shudder-2021': replacement(cards.cvt, 'Replace the owner-reported 2021-2026 CVT failure narrative with PIP6036B\'s exact 2022-2025 MRG pressure-adapt condition and relearn procedure.'),
  'chevrolet-trailblazer-turbo-2021': replacement(cards.turbo, 'Replace the unsupported six-year turbo oil-leak aggregation with Special Coverage N242484750\'s VIN-specific 2022 1.2L turbocharger failure and remedy.'),
  'chevy-trailblazer-infotainment-freeze-2021': replacement(cards.radio, 'Replace the generic five-year infotainment aggregation with Service Update N202316020\'s exact 2021 cold-key-on black-screen, no-audio and no-chime condition.'),
};

const reasons = {
  'chevrolet-trailblazer-42l-coolant-leak-2003': 'A single owner-forum water-pump discussion does not establish an eight-year combined throttle-body/water-pump leak mechanism or a universal component replacement.',
  'chevrolet-trailblazer-fan-clutch-2002': 'The frozen card has no citations and treats fan roar, overheating and codes as one eight-year electric fan-clutch failure without an exact manufacturer population, diagnostic branch or remedy.',
  'chevrolet-trailblazer-turbo-oil-consumption-2021': 'A single Reddit post cannot establish a 2021-2026 oil-consumption defect across two engines. The retained turbo special-coverage card concerns certain VIN-identified 2022 1.2L turbochargers and does not support this broader oil-consumption claim.',
  'chevrolet-trailblazer-window-regulator-2002': 'A repair video does not establish an eight-year defect population or prove that every inoperative window requires a regulator instead of switch, wiring, motor or glass-channel diagnosis.',
  'chevy-trailblazer-4wd-actuator-2002': 'The frozen card has no citations and assigns every eight-year Service 4WD or failure-to-engage complaint to the axle-disconnect actuator without primary-source circuit and transfer-case diagnostic boundaries.',
  'chevy-trailblazer-turbo-lag-2021': 'A video cannot support a five-year defect claim across both turbo engines, and the condition overlaps the retained VIN-specific 2022 1.2L turbo special coverage without matching its population or symptoms.',
};

module.exports = buildConfig({
  label: 'Chevrolet TrailBlazer',
  make: 'Chevrolet',
  model: 'TrailBlazer',
  slug: 'chevrolet-trailblazer',
  batchId: 'chevrolet-trailblazer-full-record-cohort-42-2026-08-03',
  auditDate: '2026-08-03',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '4072c6c6fa8d3921def57aa0d64d4f50109f9ca223cc1832422530cc09404dd2',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/chevrolet-trailblazer/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'chevrolettrailblazer_blind:manual-primary-source-gate',
    edge: 'chevrolettrailblazer_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [],
});
