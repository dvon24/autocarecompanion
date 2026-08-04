const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

function replacement(card, decision) {
  return {
    disposition: 'replace',
    decision,
    evidence: card.sources.map((item) => ({ type: item.type, label: item.title, url: item.url })),
    after: {
      years: card.years,
      trims: card.trims,
      engines: card.engines,
      category: card.category,
      title: card.title,
      description: card.description,
      solution: card.solution,
      severity: card.severity,
      confidence: 'high',
      symptoms: card.symptoms,
      affectedSystems: card.affectedSystems,
      dtcCodes: card.dtcCodes,
      estimatedCostLow: null,
      estimatedCostHigh: null,
      typicalMileageLow: null,
      typicalMileageHigh: null,
      citations: card.sources,
      source: 'manual',
      summary: card.summary,
    },
  };
}

const published = {
  'ford-freestyle-throttle-body-surge-2005': replacement(
    {
      years: [2005, 2006, 2007],
      trims: [],
      engines: [],
      category: 'engine',
      title: 'Throttle-Body Deposits Can Cause a Brief Low-Speed Idle Flare',
      description:
        'NHTSA investigation PE11-018 examined 2005-2007 Ford Freestyle vehicles with intermittent idle flare while stopped or during low-speed maneuvers. Ford attributed the condition to throttle-body deposits affecting idle airflow compensation when engine load changes, such as power-steering input or air-conditioning compressor cycling. NHTSA closed the investigation after Ford created Customer Satisfaction Program 12N03; this was not a safety recall.',
      solution:
        'Have a technician confirm that the event occurs below about 3.5 mph without accelerator input, check for P0505, P0506, or P061B, and rule out transmission, pedal, air-intake, and other causes. Ford\'s historical program directed cleaning the throttle body and reprogramming the PCM with an updated idle-speed strategy. Verify current service and coverage status; do not promise a free recall repair or automatically replace the throttle body.',
      severity: 'medium',
      symptoms: ['Momentary idle RPM flare while stopped or maneuvering at very low speed', 'Possible Check Engine lamp'],
      affectedSystems: ['electronic throttle body', 'idle-speed control strategy', 'Powertrain Control Module'],
      dtcCodes: ['P0505', 'P0506', 'P061B'],
      sources: [
        { type: 'nhtsa', title: 'NHTSA PE11-018 Closing Resume - Ford Freestyle Idle Instability', url: 'https://static.nhtsa.gov/odi/inv/2011/INCLA-PE11018-5248.PDF' },
        { type: 'nhtsa', title: 'Ford Response and Testing in NHTSA PE11-018', url: 'https://static.nhtsa.gov/odi/inv/2011/INRL-PE11018-47620P.pdf' },
      ],
      summary:
        'Corrected the frozen unintended-surge recall claim to NHTSA\'s closed investigation, the exact low-speed idle-flare condition, Ford\'s deposit/idle-control explanation, and historical 12N03 cleaning/software procedure.',
    },
    'Retain the documented condition but explicitly correct the false safety-recall, free-throttle-body-replacement, crash-count, and reimbursement claims.',
  ),
};

const reasons = {
  'ford-freestyle-alternator-2005':
    'The only citation is a placeholder-style YouTube URL, and the frozen card applies one alternator diode-pack failure, mileage threshold, parasitic drain, belt replacement, and post-repair test to every 2005-2007 Freestyle without a Ford primary source.',
  'ford-freestyle-cvt-failure-2005':
    'The frozen card extrapolates complaint data into a universal CVT defect, combines poor acceleration, stalling, sensors, solenoids, complete failure, maintenance intervals, rebuilds, prices, vehicle weight, and sale advice without a Ford-defined failure population.',
  'ford-freestyle-fuel-system-surge-2005':
    'The frozen card combines fuel pumps, injectors, pressure regulators, relays, hot-weather stalling, CVT behavior, throttle-body behavior, cleaning intervals, parts swapping, and prices from complaint and secondary sources rather than one Ford-defined condition.',
  'ford-freestyle-power-steering-pump-2005':
    'The only citation is a fabricated-looking placeholder YouTube URL, and the frozen card applies one pump, shaft-seal, reservoir, hose, rack, fluid, and mileage diagnosis to every 2005-2007 vehicle without an exact Ford service source.',
};

module.exports = buildConfig({
  label: 'Ford Freestyle',
  make: 'Ford',
  model: 'Freestyle',
  slug: 'ford-freestyle',
  batchId: 'ford-freestyle-full-record-cohort-124-2026-08-05',
  auditDate: '2026-08-05',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '5a51448b101663962c802ad1aca60fc2fbd74da6084caa8d268f1c5a72a85ee4',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/ford-freestyle/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'fordfreestyle_blind:manual-primary-source-gate',
    edge: 'fordfreestyle_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [],
});
