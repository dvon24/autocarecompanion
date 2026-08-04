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

const seatLatch = {
  years: [2021],
  trims: ['Voyager vehicles included in recall Z22 / 22V-181; verify by VIN'],
  category: 'safety',
  title: 'Second-Row Seat-to-Floor Latch Can Bind Open (Recall 22V-181)',
  description: 'FCA recall Z22 / NHTSA 22V-181 covers certain 2021 Chrysler Voyager vehicles. The second-row seat-to-floor mounting latch can bind and remain open, preventing the seat from securing to the floor and creating a Federal Motor Vehicle Safety Standard 225 noncompliance.',
  solution: 'Check the VIN for recall Z22. Do not use a second-row seat that does not positively latch to the floor. An authorized Chrysler dealer inspects the latch condition and replaces the second-row seat-cushion frame when necessary at no charge.',
  severity: 'high',
  symptoms: ['Second-row seat does not secure to the floor', 'Seat-to-floor mounting latch sticks open', 'VIN included in recall Z22'],
  affectedSystems: ['second-row seat cushion frame', 'seat-to-floor mounting latch', 'child-restraint anchorage compliance'],
  sources: [{ type: 'recall', title: 'NHTSA Campaign 22V-181 - Voyager Second-Row Seat Latch', url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=22V181000' }],
  summary: 'Retained the exact 2021 seat-latch safety card and anchored its condition, FMVSS context, inspection, and conditional frame replacement to recall 22V-181.',
};

const wiperNuts = {
  years: [2022],
  trims: ['Voyager vehicles included in recall Z80 / 22V-619; verify by VIN'],
  category: 'safety',
  title: 'Loose Wiper-Arm Nuts Can Cause Wiper Failure (Recall 22V-619)',
  description: 'FCA recall Z80 / NHTSA 22V-619 covers certain 2022 Chrysler Voyager vehicles. The windshield-wiper-arm nuts may have been tightened incorrectly, allowing the wipers to malfunction and reducing visibility.',
  solution: 'Check the VIN for recall Z80. If the wipers slip, stop, or fail to clear the windshield, avoid driving in rain or other low-visibility conditions. An authorized Chrysler dealer tightens the wiper-arm nuts to the required specification at no charge.',
  severity: 'high',
  symptoms: ['Wiper arm slips on its pivot', 'Windshield wipers do not move correctly', 'Reduced visibility in rain or snow'],
  affectedSystems: ['windshield wiper arms', 'wiper-arm retaining nuts', 'windshield visibility'],
  sources: [{ type: 'recall', title: 'NHTSA Campaign 22V-619 - Voyager Wiper-Arm Nuts', url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=22V619000' }],
  summary: 'Kept the exact 2022 wiper safety card and removed unrelated parts guidance by using recall 22V-619\'s tightening remedy.',
};

const sideCurtainAirbags = {
  years: [2020, 2021, 2022, 2023, 2024, 2025, 2026],
  trims: ['2020-2021 and 2023 Voyager vehicles in recall A8B / 24V-793, or 2022-2026 vehicles in recalls 06D/10D/11D / 26V-189; verify by VIN'],
  category: 'safety',
  title: 'Side-Curtain Airbags May Not Deploy or Retain Pressure (Recalls 24V-793 and 26V-189)',
  description: 'Two current FCA recall families cover distinct Voyager side-curtain-airbag defects. Recall A8B / 24V-793 covers certain 2020-2021 and 2023 vehicles with an improperly secured connector that may prevent deployment. Recalls 06D, 10D, and 11D / 26V-189 cover certain 2022-2026 vehicles whose airbag seams may not retain enough pressure. The latter expands and replaces 25V-302 and 25V-573, so vehicles repaired under an earlier campaign may need the new remedy.',
  solution: 'Check the VIN for every current side-curtain-airbag campaign. An authorized Chrysler dealer secures the connector for recall A8B or replaces affected side-curtain airbags under recall 26V-189, as applicable, at no charge. Do not assume an earlier 2025 repair completed the current 26V-189 action; confirm closure by VIN.',
  severity: 'high',
  symptoms: ['VIN included in a side-curtain-airbag recall', 'Connector condition found during campaign inspection', 'Airbag assembly identified in the insufficient-pressure population'],
  affectedSystems: ['left and right side-curtain airbags', 'side-curtain-airbag electrical connector', 'airbag seam pressure retention'],
  sources: [
    { type: 'recall', title: 'NHTSA Campaign 24V-793 - Voyager Side-Curtain-Airbag Connector', url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=24V793000' },
    { type: 'recall', title: 'NHTSA Campaign 26V-189 - Voyager Side-Curtain-Airbag Pressure Retention', url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=26V189000' },
  ],
  summary: 'Separated the two official airbag mechanisms, extended the card through the current 2026 population, and documented that 26V-189 replaces earlier 2025 remedies.',
};

const published = {
  'chrysler-voyager-second-row-seat-to-floor-latch-may-bind-open': replacement(seatLatch, 'Keep the seat-latch card and anchor it to recall Z22 / 22V-181\'s exact 2021 population and remedy.'),
  'chrysler-voyager-side-curtain-airbag-defects-safety-recalls': replacement(sideCurtainAirbags, 'Update the plural airbag-recall card to the current connector and pressure-retention campaigns without merging their distinct mechanisms.'),
  'chrysler-voyager-windshield-wiper-arm-nuts-improperly-tightened': replacement(wiperNuts, 'Keep the wiper card and anchor it to recall Z80 / 22V-619\'s exact 2022 condition and no-charge tightening remedy.'),
};

const reasons = {
  'chrysler-voyager-3-6l-pentastar-v6-oil-filter-housing-oil-cooler-assembly-cra': 'The frozen five-year oil-filter-housing card combines oil and coolant leaks, material theories, replacement assemblies, and costs without one FCA/NHTSA primary source proving the complete Voyager population.',
  'chrysler-voyager-3-6l-pentastar-valvetrain-failure': 'The frozen two-year valvetrain card combines ticking, rocker arms, lifters, camshafts, misfire, and engine damage without one manufacturer-defined failure condition and repair scope.',
  'chrysler-voyager-9speed-trans-2020': 'The frozen five-year 948TE calibration card combines shift quality, adaptation, software, fluid, and hardware causes without one FCA bulletin or campaign establishing a universal calibration remedy.',
  'chrysler-voyager-rear-hvac-2020': 'The frozen rear-HVAC card treats loss of blower operation as confirmed resistor failure across five model years without a primary-source diagnostic boundary or population.',
  'chrysler-voyager-sliding-door-2020': 'The frozen sliding-door card combines motors, cables, latches, tracks, sensors, wiring, and modules across five years without one FCA/NHTSA condition and remedy.',
  'chrysler-voyager-uconnect-screen-2020': 'The frozen touchscreen card combines delamination, touch response, display, software, heat, and replacement claims across five years without a manufacturer program establishing the asserted Voyager scope.',
};

module.exports = buildConfig({
  label: 'Chrysler Voyager',
  make: 'Chrysler',
  model: 'Voyager',
  slug: 'chrysler-voyager',
  batchId: 'chrysler-voyager-full-record-cohort-64-2026-08-03',
  auditDate: '2026-08-03',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: 'cd9e28dcc4ce0fafb188452591014029948665de5fa2bea3ad6285b9515717b8',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/chrysler-voyager/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'chryslervoyager_blind:manual-primary-source-gate',
    edge: 'chryslervoyager_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [
    '24V199000',
    '24V436000',
    '25V388000',
    '25V876000',
    '26V358000',
  ],
});
