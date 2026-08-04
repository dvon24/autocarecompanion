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

const transmissionDiagnosis = {
  years: [2011, 2012, 2013, 2014],
  trims: [
    'JS-platform Avenger vehicles equipped with the 62TE automatic transmission; verify configuration by VIN',
  ],
  category: 'transmission',
  title: '62TE Jerking or Slipping With P0740/P2764: Check TCC Solenoid First',
  description:
    'FCA GPOP communication 9004206 applies to 2011-2014 JS-platform vehicles. For a 62TE-equipped Dodge Avenger that jerks or slips with P0740 or P2764, the communication directs technicians to check torque-converter-clutch solenoid operation. If the solenoid operates correctly, FCA identifies the codes as indicating torque-converter failure.',
  solution:
    'Confirm that the vehicle has the 62TE transmission and verify the stored code before replacing parts. Check torque-converter-clutch solenoid operation using current FCA service information. If the solenoid tests correctly, the communication directs replacement of the torque converter. Do not infer a failed solenoid pack or valve body from jerking, slipping, or P0700 alone.',
  severity: 'medium',
  symptoms: [
    'Transmission jerks during operation',
    'Transmission slips during operation',
    'Malfunction indicator lamp with P0740',
    'Malfunction indicator lamp with P2764',
  ],
  affectedSystems: [
    '62TE automatic transmission',
    'torque-converter clutch solenoid',
    'torque converter',
  ],
  dtcCodes: ['P0740', 'P2764'],
  sources: [
    {
      type: 'tsb',
      title: 'FCA GPOP Issue Review 9004206 - 62TE Diagnostic Guidance',
      url: 'https://static.nhtsa.gov/odi/tsbs/2022/MC-10228975-9999.pdf',
    },
  ],
  summary:
    'Narrowed the broad seven-year solenoid-pack card to FCA\'s documented 2011-2014 JS/62TE P0740-P2764 diagnostic path and removed every cost, mileage, universal-failure, and parts-commerce claim.',
};

const published = {
  'dodge-avenger-62te-trans-2008': replacement(
    transmissionDiagnosis,
    'Replace the broad 2008-2014 solenoid-pack and valve-body aggregation with FCA GPOP 9004206\'s exact 2011-2014 JS/62TE symptom, DTC, test sequence, and conditional torque-converter remedy.',
  ),
};

const reasons = {
  'dodge-avenger-alternator-2008':
    'The frozen card asserts a universal 2008-2014 2.4L premature-alternator pattern, warning behavior, mileage, cost, and replacement guidance from a video without one FCA/NHTSA primary source establishing that complete population and mechanism.',
  'dodge-avenger-heater-core-2008':
    'The frozen card combines heater-core restriction, leakage, HVAC temperature imbalance, dashboard removal, flushing, replacement, costs, and seven model years without one FCA bulletin or campaign proving the complete condition and remedy.',
  'dodge-avenger-suspension-noise-2008':
    'The frozen card merges strut mounts, bearings, sway-bar links, bushings, noises, wear timing, and replacement parts across seven model years without one manufacturer-defined failure mechanism or diagnostic boundary.',
  'dodge-avenger-throttle-body-2008':
    'The frozen card treats broad lean and misfire codes as proof of a 2.4L electronic-throttle-body failure and prescribes cleaning or replacement across seven years without an FCA primary source supporting that population, code set, and remedy.',
};

module.exports = buildConfig({
  label: 'Dodge Avenger',
  make: 'Dodge',
  model: 'Avenger',
  slug: 'dodge-avenger',
  batchId: 'dodge-avenger-full-record-cohort-65-2026-08-04',
  auditDate: '2026-08-04',
  snapshotHash:
    '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash:
    '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash:
    '50803904cdb3ab48e32eaff7b3075cbb74b554783895b15cb20f8e18947d8323',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/dodge-avenger/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'dodgeavenger_blind:manual-primary-source-gate',
    edge: 'dodgeavenger_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [
    '00V421002',
    '06E064000',
    '07E055000',
    '07V104000',
    '07V240000',
    '07V414000',
    '07V426000',
    '07V473000',
    '08V152000',
    '08V528000',
    '09E012000',
    '09E025000',
    '09V047000',
    '10V009000',
    '10V475000',
    '11V315000',
    '13V043000',
    '13V282000',
    '13V552000',
    '16V668000',
    '17V640000',
    '97V081002',
    '98V045002',
    '99V066003',
  ],
});
