const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

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
      trims: card.trims,
      engines: card.engines || [],
      category: card.category,
      title: card.title,
      description: card.description,
      solution: card.solution,
      severity: card.severity,
      confidence: 'high',
      symptoms: card.symptoms,
      affectedSystems: card.affectedSystems,
      dtcCodes: card.dtcCodes || [],
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

const batteryCableRecall = {
  years: [2023, 2024],
  trims: ['Plug-in hybrid vehicles included in recall 98A; verify by VIN'],
  category: 'electrical',
  title: 'Loose 12-Volt or High-Voltage Cable Connections Can Cause a Fire (Recall 23V-623)',
  description:
    'NHTSA recall 23V-623/98A covers certain 2023-2024 Dodge Hornet plug-in hybrid vehicles. A missing or incorrectly torqued nut at the 12-volt positive cable or high-voltage connections can create high resistance, overheat the connection, and cause a fire while parked or driving.',
  solution:
    'Check the VIN for recall 98A/23V-623. NHTSA advised owners to park outside and away from structures until the repair was completed. FCA\'s remedy is dealer inspection and tightening of the affected cable connections as necessary, free of charge.',
  severity: 'high',
  symptoms: ['The recall states there may be no advance warning', 'Electrical connection may overheat', 'Vehicle fire can occur while parked or driving'],
  affectedSystems: ['12-volt battery positive cable connection', 'high-voltage connector cables', 'integrated dual charging module connections'],
  dtcCodes: [],
  sources: [{ type: 'recall', title: 'NHTSA Recall 23V-623 - Loose Battery Cables May Cause Fire', url: 'https://static.nhtsa.gov/odi/rcl/2023/RCLRPT-23V623-5962.PDF' }],
  summary:
    'Replaced secondary reporting with NHTSA recall 23V-623\'s exact PHEV population, cable connections, no-warning fire risk, park-outside instruction, and inspection/torque remedy.',
};

const rearviewDisplayRecall = {
  years: [2023, 2024, 2025],
  trims: ['Vehicles included in recall 13C or 38C; verify by VIN'],
  category: 'electrical',
  title: 'Center Display May Not Show the Rearview Camera Image (Recall 25V-246)',
  description:
    'NHTSA recall 25V-246 covers certain 2023-2025 Dodge Hornet vehicles. Cold soldering at a display voltage regulator and/or a display-microprocessor software defect can prevent the rearview camera image from appearing at the start of a backing event.',
  solution:
    'Check the VIN for recall 13C or 38C/25V-246. FCA\'s remedy is a display-software update or center-display replacement as necessary, free of charge. Until repaired, do not rely solely on the display when reversing; directly verify that the path is clear.',
  severity: 'high',
  symptoms: ['Blank screen instead of the rearview image when reverse is selected', 'Rearview image does not appear at the start of a backing event'],
  affectedSystems: ['center display screen', 'display voltage regulator solder connection', 'display microprocessor software', 'rearview camera image'],
  dtcCodes: [],
  sources: [{ type: 'recall', title: 'NHTSA Recall 25V-246 - Rearview Image May Not Display', url: 'https://static.nhtsa.gov/odi/rcl/2025/RCLRPT-25V246-8568.pdf' }],
  summary:
    'Replaced invalid forum/video citations and generic Uconnect freezing claims with the current NHTSA recall\'s exact rearview-display defect, safety consequence, and software-or-display remedy.',
};

const published = {
  'dodge-hornet-battery-cable-recall-2023': replacement(
    batteryCableRecall,
    'Retain the battery-cable fire issue but replace forum and news citations with NHTSA recall 23V-623\'s exact PHEV scope, connection defect, park-outside instruction, and free remedy.',
  ),
  'dodge-hornet-infotainment-freeze-2023': replacement(
    rearviewDisplayRecall,
    'Replace the invalid Reddit and placeholder-video screen-freezing card with NHTSA recall 25V-246\'s exact 2023-2025 center-display rearview-image defect and software-or-display remedy.',
  ),
};

const reasons = {
  'dodge-hornet-9speed-trans-2023':
    'The frozen card attributes 2023 GT shift hesitation, harsh engagement, and adaptation behavior to 9-speed calibration and prescribes TCM updates or adaptation resets without any cited FCA bulletin defining the affected build and symptom boundary.',
  'dodge-hornet-electrical-2023':
    'The frozen card combines battery drain, warning messages, no-start, camera, infotainment, driver-assistance, module, and software behavior across three model years without a citation or one FCA primary source establishing a single failure mechanism and repair.',
  'dodge-hornet-transmission-hesitation-2023':
    'The frozen card attributes 2023-2025 PHEV hesitation to DCT calibration or clutch adaptation and prescribes software, relearn, or clutch-service paths from a placeholder-style video URL without an FCA bulletin defining that condition.',
};

module.exports = buildConfig({
  label: 'Dodge Hornet',
  make: 'Dodge',
  model: 'Hornet',
  slug: 'dodge-hornet',
  batchId: 'dodge-hornet-full-record-cohort-73-2026-08-04',
  auditDate: '2026-08-04',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: 'bba662051dbd05fb9c0bdc84567f2217eb89e4351d491e5b7b1ed709651fe836',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/dodge-hornet/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'dodgehornet_blind:manual-primary-source-gate',
    edge: 'dodgehornet_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: ['23V623000', '23V696000', '24V175000', '24V209000', '24V752000', '25V246000'],
});
