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
  radio: source('tsb', 'GM Service Bulletin 24-NA-084 - Radio Software Version 169.3', 'https://static.nhtsa.gov/odi/tsbs/2024/MC-11001832-0001.pdf'),
  turbo: source('tsb', 'GM Preliminary Information PIP5495G - P0299/P0234 Turbocharger Diagnosis', 'https://static.nhtsa.gov/odi/tsbs/2018/MC-10147384-9999.pdf'),
};

const cards = {
  radio: {
    years: [2024],
    trims: ['Infotainment system RPO IVA'],
    category: 'electrical',
    title: 'Radio Software Anomalies Can Cause Black Screens, Freezes or Projection Dropouts (24-NA-084)',
    description: 'GM bulletin 24-NA-084 applies to the 2024 Trax with IVA infotainment. Documented software symptoms include radio or cluster screens going black and recovering while driving, a temporarily frozen screen, CarPlay or Android Auto disconnecting, projection crashes, and missing rear-camera gridlines. The bulletin does not establish 2025 coverage, a failed 11-inch display, or every missing/delayed camera image as the same condition.',
    solution: 'Confirm IVA equipment and the current radio software version. For matching symptoms, GM directs installation of radio software version 169.3 using both the programming and USB file-transfer events, followed by re-pairing phones and checking settings. Diagnose a persistent blank rear-camera image, wiring fault or hardware failure separately.',
    severity: 'medium',
    symptoms: ['Radio or cluster screen briefly goes black and recovers', 'Screen freezes or phone projection disconnects', 'CarPlay or Android Auto crashes or will not reconnect until a key cycle', 'Rear-camera gridlines are missing'],
    affectedSystems: ['IVA radio software', 'center display', 'phone projection', 'rear-camera overlay'],
    sources: [sources.radio],
    summary: 'Removed a false Kia citation and replaced the 2024-2025 display-failure aggregation with GM bulletin 24-NA-084\'s exact 2024 IVA software symptoms and update procedure.',
  },
  turbo: {
    years: [2015, 2016, 2017, 2018, 2019],
    engines: ['1.4L turbocharged engine (RPO LUV)'],
    category: 'engine',
    title: 'P0299 or P0234 Requires Component-Level Turbo and Wastegate Diagnosis (PIP5495G)',
    description: 'GM preliminary information PIP5495G covers U.S. and Canadian 2015-2019 Trax vehicles with the 1.4L LUV engine. It was issued because turbochargers were being replaced with no fault found. P0299 or P0234 can result from several conditions, including wastegate preload, a missing clip, a bent actuator port, a broken or obstructed solenoid port, oil/deposits in the solenoid or hoses, or vehicle modification. GM notes that some wastegate-port cracking and actuator-rod joint wear are normal and do not justify replacement when preload and performance remain correct.',
    solution: 'Perform normal service-information diagnosis and the bulletin\'s wastegate-preload and component inspections before replacing the turbocharger. Repair the specific clip, actuator, solenoid, hose, preload or confirmed turbo fault found. Do not order a complete turbo from P0299/P0234 alone, and do not treat normal wastegate-port cracking as failure.',
    severity: 'medium',
    symptoms: ['Malfunction indicator lamp with P0299 or P0234', 'Confirmed loss of boost after normal diagnosis', 'Wastegate preload or related component fault found during inspection'],
    affectedSystems: ['turbocharger wastegate', 'wastegate actuator and clip', 'wastegate solenoid and hoses', 'boost control'],
    sources: [sources.turbo],
    summary: 'Replaced the 2014-2020 actuator-failure assumption with PIP5495G\'s exact 2015-2019 LUV diagnostic branches and explicit safeguards against unnecessary turbo replacement.',
  },
};

const published = {
  'chevrolet-trax-11-inch-infotainment-screen-freezing-2024': replacement(cards.radio, 'Remove the unrelated Kia Sportage citation and retain only GM bulletin 24-NA-084\'s exact 2024 IVA radio-software symptoms and update procedure.'),
  'chevrolet-trax-turbo-wastegate-2014': replacement(cards.turbo, 'Replace the seven-year actuator-failure narrative with PIP5495G\'s exact 2015-2019 LUV component-level P0299/P0234 diagnosis and no-unnecessary-turbo guidance.'),
};

const reasons = {
  'chevrolet-trax-coolant-leak-2015': 'The frozen card has no citations and converts eight years of coolant loss into one plastic water-outlet diagnosis without an exact GM/NHTSA population or leak-confirmation procedure.',
  'chevrolet-trax-12-volt-battery-drain-or-2024': 'The frozen card has no citations and treats two years of no-start complaints as one parasitic-drain defect without a sleep-current test, module state, calibration or primary-source remedy.',
  'chevrolet-trax-forward-collision-alert--2024': 'Lemon-law marketing pages do not establish a two-year FCA/AEB defect population, reproduceable trigger or manufacturer remedy. Camera, radar, calibration, visibility and driver-assistance behavior require vehicle-specific diagnosis.',
  'chevrolet-trax-front-brake-squeal-or-2024': 'The frozen card has no citations and conflates noise, wear and grinding across two years without measured pad/rotor condition, production breakpoint or manufacturer remedy.',
  'chevrolet-trax-rearview-camera-image-missing-2024': 'The cited NHTSA document is actually a Kia Sportage cable bulletin. GM bulletin 24-NA-084 mentions missing gridlines and broader radio software symptoms, not the frozen missing/delayed/blue-camera-image aggregation; the corrected software card is retained separately.',
  'chevy-trax-shift-quality-2015': 'A single Reddit post cannot establish an eight-year 6T40/6T45 defect or justify calibration, solenoid, valve-body or transmission replacement without scan and hydraulic diagnosis.',
  'chevy-trax-turbo-2015': 'This duplicates the retained P0299/P0234 diagnostic card while adding unsupported coolant/oil mechanisms and two commerce parts. PIP5495G specifically warns against replacing a turbo before isolating the component fault.',
  'chevy-trax-turbo-oil-consumption-2015': 'The alleged GM PDF is not an accessible regulator/manufacturer primary citation, and a Reddit post cannot establish eight years of turbo oil-consumption, PCV or piston-ring failure. Current primary research did not support the frozen scope or remedy.',
};

module.exports = buildConfig({
  label: 'Chevrolet Trax',
  make: 'Chevrolet',
  model: 'Trax',
  slug: 'chevrolet-trax',
  batchId: 'chevrolet-trax-full-record-cohort-44-2026-08-03',
  auditDate: '2026-08-03',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: 'c866a551814d400c3cedc2de214ab735044f987b78ad49aae7d5f79f6d20bb08',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/chevrolet-trax/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'chevrolettrax_blind:manual-primary-source-gate',
    edge: 'chevrolettrax_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [],
});
