const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

function source(type, title, url) {
  return { type, title, url };
}

function replacement(card, decision) {
  return {
    disposition: 'replace',
    decision,
    evidence: card.sources.map((item) => ({
      type: item.type,
      label: item.title,
      url: item.url,
    })),
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
  steering2017: source(
    'recall',
    'NHTSA Recall 17V-382 / GM 17248 - Loss of Electric Power Steering Assist',
    'https://static.nhtsa.gov/odi/rcl/2017/RCLRPT-17V382-6280.PDF',
  ),
  steering2019: source(
    'recall',
    'NHTSA Recall 19V-801 / GM N192265980 - Follow-Up Steering Gear Replacement',
    'https://static.nhtsa.gov/odi/rcl/2019/RCLRPT-19V801-6096.PDF',
  ),
  rearShock: source(
    'tsb',
    'GM Preliminary Information PI1526 - Rear Shock Absorber Seal Leak',
    'https://static.nhtsa.gov/odi/tsbs/2015/MC-10113802-9999.pdf',
  ),
  radio: source(
    'tsb',
    'GM Preliminary Information PIC6077C - Radio Connectivity and Display Software Concerns',
    'https://static.nhtsa.gov/odi/tsbs/2015/MC-10114688-9999.pdf',
  ),
};

const cards = {
  steering: {
    years: [2014, 2015, 2016],
    trims: [
      'VIN-identified vehicles in recall 17V-382; certain prior inspect-only remedies in follow-up recall 19V-801',
    ],
    category: 'suspension',
    title: 'Loss of Electric Power-Steering Assist from Connector Fretting Corrosion (17V-382/19V-801)',
    description: 'NHTSA recall 17V-382 covers 6,204 certain 2014-2016 Chevrolet SS vehicles whose connector between the electric power-steering module and torque sensor can develop fretting corrosion. Lost conductivity can interrupt torque-sensor operation and remove power assist while driving or idling. Manual steering remains, but effort increases, especially at low speed. Follow-up recall 19V-801 covers 476 vehicles that received an inspect-only remedy under the first recall and whose gold-plated terminals could not otherwise be confirmed.',
    solution: 'Check the VIN for both recalls at NHTSA.gov/Recalls or with a Chevrolet dealer. Recall 17V-382 directs inspection of the steering-gear part number and replacement when it is not the latest gold-terminal assembly. Follow-up recall 19V-801 directs replacement of the steering gear on its included vehicles. Recall repairs are free; do not infer coverage from model year alone or order unrelated suspension parts.',
    severity: 'high',
    symptoms: [
      'Sudden loss of electric power-steering assist',
      'Increased steering effort, especially at low speed',
      'Steering malfunction indicator and warning chime',
      'VIN included in recall 17V-382 or follow-up recall 19V-801',
    ],
    affectedSystems: [
      'electric power-steering module connector',
      'steering torque-sensor circuit',
      'electric steering gear assembly',
    ],
    sources: [sources.steering2017, sources.steering2019],
    summary: 'Corrected the 2014-2017 universal claim to the VIN-identified 2014-2016 populations, distinguished the original 6,204-vehicle recall from its 476-vehicle follow-up and removed DTC, cost and unrelated suspension-product claims.',
  },
  rearShock: {
    years: [2015],
    category: 'suspension',
    title: 'Rear Shock-Absorber Seal Can Leak and Cause a Rough Ride (PI1526)',
    description: 'GM preliminary information PI1526 applies to the 2015 Chevrolet SS. A defective seal in a rear shock absorber can leave particles that prevent the absorber from working as intended. The owner may notice a rough rear ride or fluid leaking near a rear tire. The bulletin does not establish a 2014-2017 all-corner Magnetic Ride Control failure pattern.',
    solution: 'Visually inspect the rear shock absorber identified by the symptom. If it is leaking as described in PI1526, replace the affected rear shock absorber according to GM service information. The bulletin does not direct replacement of all four units, a coilover conversion, a bypass module or software tuning.',
    severity: 'medium',
    symptoms: [
      'Rough ride from the rear of the vehicle',
      'Fluid leaking from a rear shock-absorber location near a tire',
      'Visually confirmed leaking rear absorber',
    ],
    affectedSystems: ['rear shock-absorber seal', 'rear shock absorber'],
    sources: [sources.rearShock],
    summary: 'Narrowed the 2014-2017 MRC aggregation to PI1526\'s exact 2015 rear-shock seal condition and affected-unit replacement instruction.',
  },
  radio: {
    years: [2014],
    trims: ['Radio RPO UFU with UP9 or UHQ'],
    category: 'electrical',
    title: 'Bluetooth, Audio and Route-Display Radio Software Concerns (PIC6077C)',
    description: 'GM preliminary information PIC6077C applies to the 2014 Chevrolet SS with the listed radio equipment. Defined symptoms include an iPhone failing to re-pair or disappearing from the device list, Bluetooth dropping while replying to a text, USB audio continuing during a Bluetooth call, street-name flicker, XM weather-alert behavior, or a turn-by-turn routing screen remaining after a download finishes. It does not establish random crashing across every 2014-2017 SS.',
    solution: 'Have a qualified GM technician confirm that the symptom and radio RPO match PIC6077C. The bulletin directs a USB/SPS radio software update followed by calibration and reset; 2014 vehicles require Techline VCI programming assistance. Do not replace the radio module, pull fuses or buy generic electrical parts solely from the broader frozen card.',
    severity: 'low',
    symptoms: [
      'Paired iPhone does not automatically re-pair or disappears from the device list',
      'Bluetooth connection drops while replying to a text',
      'Turn-by-turn routing screen remains after route download finishes',
      'USB audio continues through speakers during a Bluetooth phone call',
      'Street-name flicker or XM weather-alert setting concern',
    ],
    affectedSystems: ['radio software calibration', 'Bluetooth and USB audio', 'turn-by-turn route display'],
    sources: [sources.radio],
    summary: 'Replaced the all-year freeze/crash narrative, fuse reset, module-cost estimate and generic products with PIC6077C\'s exact 2014 radio scope, defined symptoms and software procedure.',
  },
};

const published = {
  'chevy-ss-electric-power-steering-failure-2014': replacement(
    cards.steering,
    'Retain the real steering safety defect while correcting the population to VIN-identified 2014-2016 vehicles, distinguishing recalls 17V-382 and 19V-801, and removing unsupported DTCs, costs and parts.',
  ),
  'chevy-ss-magnetic-ride-shock-failure-2014': replacement(
    cards.rearShock,
    'Replace the 2014-2017 premature-MRC and conversion narrative with PI1526\'s exact 2015 rear-shock seal leak, inspection and affected-absorber remedy.',
  ),
  'chevy-ss-mylink-infotainment-crash-2014': replacement(
    cards.radio,
    'Replace the generic 2014-2017 freezing/crashing aggregation with PIC6077C\'s exact 2014 radio RPO, software symptoms and dealer programming procedure.',
  ),
};

const reasons = {
  'chevy-ss-ac-compressor-2014': 'The frozen card claims an SS-specific compressor/seal failure across all four years, attributes it to Australian specifications and prescribes compressor, receiver/drier and expansion-valve replacement plus a precise refrigerant charge. Current GM/NHTSA primary-source research did not establish that population, mechanism or universal repair.',
  'chevy-ss-differential-clunk-2014': 'The frozen SS card relies on a generic limited-slip differential video and imports fluid/additive procedures from other platforms. Current GM/NHTSA primary-source research did not establish the asserted 2014-2017 SS clutch-plate condition, a repeat-additive remedy or the promoted aftermarket products.',
};

module.exports = buildConfig({
  label: 'Chevrolet SS',
  make: 'Chevrolet',
  model: 'SS',
  slug: 'chevrolet-ss',
  batchId: 'chevrolet-ss-full-record-cohort-38-2026-08-03',
  auditDate: '2026-08-03',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '493614a67c90a02b2152a0baf50d4bf2785312515cd73e366a802407223b9445',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/chevrolet-ss/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'chevroletss_blind:manual-primary-source-gate',
    edge: 'chevroletss_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [],
});
