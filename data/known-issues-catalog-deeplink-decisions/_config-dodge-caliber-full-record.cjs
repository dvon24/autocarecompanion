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

const absSoftwareRecall = {
  years: [2007],
  trims: [
    'Caliber vehicles built September 7-November 18, 2006 and included in recall 06V-493; verify eligibility by VIN',
  ],
  category: 'brakes',
  title: 'ABS Software Can Cause Rear Brakes to Lock (Recall 06V-493)',
  description:
    'DaimlerChrysler recall F50 (NHTSA 06V-493) covers certain 2007 Dodge Caliber vehicles. Software in the anti-lock brake system control module may cause the rear brakes to lock during certain braking conditions, which can result in loss of control and a crash without warning.',
  solution:
    'Check the VIN for recall F50/06V-493. An authorized Dodge dealer will reprogram the ABS control module free of charge. Do not substitute calipers, pads, rotors, or other brake parts for the recall remedy unless a separate diagnosis identifies a mechanical brake fault.',
  severity: 'high',
  symptoms: [
    'Rear brakes may lock during certain braking conditions',
    'ABS warning lamp may illuminate',
    'Red brake warning lamp may illuminate',
    'Electronic brake distribution, traction control, ABS, or speedometer function may be lost',
  ],
  affectedSystems: [
    'anti-lock brake system control module software',
    'rear brakes',
    'electronic brake distribution',
  ],
  dtcCodes: [],
  sources: [
    {
      type: 'recall',
      title: 'NHTSA Recall 06V-493 - ABS Control Module Software',
      url: 'https://static.nhtsa.gov/odi/rcl/2006/RCAK-06V493-4052.pdf',
    },
    {
      type: 'recall',
      title: 'DaimlerChrysler Safety Recall F50 - Dealer Service Instructions',
      url: 'https://static.nhtsa.gov/odi/rcl/2006/RCRIT-06V493-6659.pdf',
    },
  ],
  summary:
    'Replaced a six-year rear-caliper aggregation with the exact 2007 ABS software recall population, failure mechanism, safety consequence, and free software remedy; removed all parts-commerce, cost, mileage, and wear claims.',
};

const published = {
  'dodge-caliber-rear-brake-seize-2007': replacement(
    absSoftwareRecall,
    'Replace the broad 2007-2012 caliper-seizure and premature-pad-wear aggregation with NHTSA recall 06V-493\'s exact 2007 ABS software condition and reprogramming remedy.',
  ),
};

const reasons = {
  'dodge-caliber-cvt-overheating-2007':
    'The frozen card asserts an inherent Jatco CVT design flaw, a roughly 75,000-mile lifespan, shutdown behavior, broad DTC set, fluid interval, fill-level workaround, fan-relay diagnosis, external-cooler advice, costs, and six-year population without one FCA/NHTSA primary source establishing that complete mechanism and remedy.',
  'dodge-caliber-overheating-2007':
    'The frozen card combines thermostat, radiator, cooling-fan, water-pump, coolant, air-pocket, and temperature-sensor causes with four DTCs, costs, mileage, and replacement parts across six model years without one manufacturer-defined failure mechanism or diagnostic boundary.',
  'dodge-caliber-tipm-2007':
    'The frozen card combines fuel-pump relay faults, no-starts, stalling, warning lamps, random electrical activation, CVT effects, a broad DTC set, rebuild services, bypass wiring, replacement costs, and six model years without one Caliber-specific FCA/NHTSA primary source supporting that population and remedy.',
};

module.exports = buildConfig({
  label: 'Dodge Caliber',
  make: 'Dodge',
  model: 'Caliber',
  slug: 'dodge-caliber',
  batchId: 'dodge-caliber-full-record-cohort-66-2026-08-04',
  auditDate: '2026-08-04',
  snapshotHash:
    '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash:
    '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash:
    '9bc79751a7ca563dfdaed42d56451d7d9d917ee2e02066363f0587644edad0fd',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/dodge-caliber/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'dodgecaliber_blind:manual-primary-source-gate',
    edge: 'dodgecaliber_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [
    '07V196000',
    '08V528000',
    '10V197000',
    '10V234000',
    '11V315000',
    '16V668000',
    '17V824000',
  ],
});
