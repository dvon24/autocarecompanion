const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

function replacement(card, decision) {
  return {
    disposition: 'replace',
    decision,
    evidence: card.sources.map((item) => ({ type: item.type, label: item.title, url: item.url })),
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

const parkPawlRecall = {
  years: [2005, 2006],
  trims: ['42RLE automatic transmission (sales code DG6); recall E14/05V-460 eligibility must be verified by VIN'],
  engines: [],
  category: 'transmission',
  title: '42RLE Park-Pawl Anchor Shaft Can Prevent Park Engagement (Recall 05V-460)',
  description:
    'DaimlerChrysler recall E14/NHTSA 05V-460 covers certain 2005-2006 Dodge Magnum vehicles equipped with the 42RLE automatic transmission. An improperly installed cup plug can allow the park-pawl anchor shaft to move out of position, preventing the transmission from achieving Park. Without the parking brake applied, the vehicle can roll away.',
  solution:
    'Check the VIN for recall E14/05V-460. The dealer remedy is to inspect the transmission and install a bracket that retains the park-pawl anchor shaft. Until eligibility and completion are confirmed, apply the parking brake every time the vehicle is parked.',
  severity: 'high',
  symptoms: ['Transmission does not achieve Park', 'Vehicle can roll after Park is selected if the parking brake is not applied'],
  affectedSystems: ['42RLE automatic transmission', 'park-pawl anchor shaft', 'park-pawl cup plug'],
  dtcCodes: [],
  sources: [{ type: 'recall', title: 'DaimlerChrysler Recall E14 / NHTSA 05V-460 - Transmission Cup Plug Bracket', url: 'https://static.nhtsa.gov/odi/rcl/2005/RCRIT-05V460-9863.PDF' }],
  summary:
    'Replaced the generic stuck-in-Park diagnosis with recall E14/05V-460\'s VIN-limited 42RLE park-pawl anchor-shaft condition and official retaining-bracket remedy.',
};

const batteryCableRecall = {
  years: [2005],
  trims: ['Vehicles built through April 20, 2004 and included by VIN in recall D28/04V-334'],
  engines: [],
  category: 'electrical',
  title: 'Loose Battery-Cable Bulkhead Fasteners Can Cause an Instrument-Panel Fire (Recall 04V-334)',
  description:
    'DaimlerChrysler recall D28/NHTSA 04V-334 covers certain 2005 Dodge Magnum vehicles built through April 20, 2004. Battery-cable fasteners at the bulkhead stud may not have been tightened correctly. A loose connection can overheat or arc and cause an instrument-panel fire.',
  solution:
    'Check the VIN for recall D28/04V-334. Dealers inspect the battery-cable bulkhead stud for arcing or cross-threading, replace a damaged stud when necessary, and tighten the cable fasteners to the specified torque. Treat heat, smoke, or a burning odor near the passenger-side dash as an urgent safety condition.',
  severity: 'high',
  symptoms: ['The recall may provide no advance warning', 'Heat, smoke, or burning odor near the instrument panel if the connection overheats'],
  affectedSystems: ['battery cable', 'bulkhead stud', 'instrument-panel electrical feed'],
  dtcCodes: [],
  sources: [{ type: 'recall', title: 'DaimlerChrysler Recall D28 / NHTSA 04V-334 - Battery Cable Bulkhead Stud Fasteners', url: 'https://static.nhtsa.gov/odi/rcl/2004/RCRIT-04V334-7317.pdf' }],
  summary:
    'Replaced the broad TIPM and steering-column-module aggregation with recall D28/04V-334\'s exact early-build battery-cable fastener defect, fire consequence, and inspection/torque remedy.',
};

const published = {
  'dodge-magnum-electrical-flickering-2005': replacement(
    batteryCableRecall,
    'Replace the four-year complaint-site aggregation with recall D28/04V-334\'s exact 2005 early-build battery-cable bulkhead-fastener condition and dealer procedure.',
  ),
  'dodge-magnum-shifter-stuck-park-2005': replacement(
    parkPawlRecall,
    'Replace the generic brake-switch or interlock-solenoid diagnosis with recall E14/05V-460\'s exact 42RLE park-pawl anchor-shaft defect and retaining-bracket remedy.',
  ),
};

const reasons = {
  'dodge-magnum-27l-oil-sludge-2005':
    'The frozen card attributes four model years of 2.7L engine failure to multiple design causes, specifies oil intervals, flushes, water-pump timing, mileage, costs, engine swaps, and three DTCs from lawsuit and complaint sites without a DaimlerChrysler bulletin proving that complete condition.',
  'dodge-magnum-front-suspension-2005':
    'The frozen card combines tie rods, ball joints, control arms, bushings, sway-bar links, mileage, causes, costs, and a multi-part replacement plan across four model years from one complaint page without a manufacturer primary source defining a single affected population and remedy.',
};

module.exports = buildConfig({
  label: 'Dodge Magnum',
  make: 'Dodge',
  model: 'Magnum',
  slug: 'dodge-magnum',
  batchId: 'dodge-magnum-full-record-cohort-76-2026-08-04',
  auditDate: '2026-08-04',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: 'cfae5851e51a796b7b83e463d88b70b0a3270cb57c9909d8ee03fbf083758bc3',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/dodge-magnum/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'dodgemagnum_blind:manual-primary-source-gate',
    edge: 'dodgemagnum_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [
    '04V333000', '04V334000', '04V335000', '05V460000', '06V149000', '06V341000',
    '06V493000', '08V295000', '08V583000', '14V567000', '14V770000', '15V313000',
    '16V352000',
  ],
});
