const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

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
      dtcCodes: card.dtcCodes || [],
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

const focus2012Recalls =
  'https://api.nhtsa.gov/recalls/recallsByVehicle?make=Ford&model=Focus&modelYear=2012';

const published = {
  'ford-focus-20-gdi-purge-valve-2012': replacement(
    {
      years: [2012, 2013, 2014, 2015, 2016, 2017, 2018],
      trims: ['Vehicles previously repaired incorrectly under NHTSA campaign 18V735 and identified by VIN for the current campaign'],
      engines: [],
      category: 'fuel',
      title: 'Recall 26S40: Prior Purge-Valve Recall Repair May Be Incomplete',
      description:
        'NHTSA campaign 26V369 covers certain 2012-2018 Focus vehicles that were repaired incorrectly under the original 18V735 canister-purge-valve recall. The purge valve may malfunction and cause the engine to stall unexpectedly while driving.',
      solution:
        'Check the VIN for Ford recall 26S40. A Ford dealer updates the Powertrain Control Module software free of charge. For vehicles still subject to an earlier purge-valve campaign, follow the VIN-specific Ford remedy and interim instructions; do not replace the purge valve or fuel-system parts solely from generic rough-idle symptoms.',
      severity: 'high',
      symptoms: ['Unexpected engine stall while driving', 'Possible no-restart after a purge-valve-related stall'],
      affectedSystems: ['canister purge valve', 'fuel-vapor management system', 'Powertrain Control Module software'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 26V369 / Ford Recall 26S40', url: focus2012Recalls }],
      summary:
        'Updated the frozen do-it-yourself purge-valve card to the current 2026 recall for incorrectly repaired 2012-2018 vehicles and the free PCM-software remedy.',
    },
    'Retain the current NHTSA 26V369 safety action and remove the universal part number, DIY time, cost, and post-replacement diagnosis claims.',
  ),

  'ford-focus-door-latch-recall-2012': replacement(
    {
      years: [2012, 2013, 2014, 2015],
      trims: ['Certain vehicles identified by VIN; some later inspection coverage depends on the prior recall repair'],
      engines: [],
      category: 'body',
      title: 'Door-Latch Recalls: Doors May Not Latch or May Open While Driving',
      description:
        'NHTSA campaign 16V643 covers certain 2012-2015 Focus vehicles whose side-door latch can break, preventing secure latching or allowing a door to open while driving. NHTSA campaign 20V331 covers vehicles whose earlier recall repair may not have been completed correctly.',
      solution:
        'Check the VIN for every open Ford door-latch campaign. Ford dealers replace covered latches with improved parts; for the later prior-repair campaign, dealers inspect latch date codes and replace side-door latches when necessary. Recall work is free of charge.',
      severity: 'high',
      symptoms: ['Door is difficult or impossible to latch', 'Door appears closed but is not securely latched', 'Door may open while driving'],
      affectedSystems: ['side-door latches'],
      sources: [
        { type: 'recall', title: 'Ford Recall 16S30 / NHTSA Campaign 16V643 Chronology', url: 'https://static.nhtsa.gov/odi/rcl/2016/RMISC-16V643-6918.pdf' },
        { type: 'recall', title: 'NHTSA Focus Recall Results - Campaigns 16V643 and 20V331', url: focus2012Recalls },
      ],
      summary:
        'Rewrote the card around both the original 2012-2015 latch defect and the later inspection of potentially incorrect prior repairs, with VIN-gated free dealer service.',
    },
    'Retain the exact safety campaigns while correcting the Ford recall number and adding the later prior-repair inspection action.',
  ),

  'ford-focus-dps6-powershift-shudder-2012': replacement(
    {
      years: [2012, 2013, 2014, 2015, 2016],
      trims: ['Vehicles equipped with the DPS6 automatic transmission and covered by Ford program 14M02'],
      engines: [],
      category: 'transmission',
      title: 'DPS6 Transmission Control Module Can Cause Loss of Engagement or No-Start',
      description:
        'Ford Customer Satisfaction Program 14M02 covers certain 2012-2016 Focus vehicles with the DPS6 automatic transmission. Electrical circuit failures inside the transmission control module can cause intermittent loss of transmission engagement while driving, an intermittent no-start, or loss of power. The historical program supplied time- and mileage-limited extended coverage whose current applicability must be checked.',
      solution:
        'Have a Ford dealer verify the VIN, program status, DPS6 equipment, symptoms, stored codes, software level, and TCM communication. The program addresses a confirmed TCM failure and includes required Ford software procedures. Do not assume every shudder, clutch leak, harsh shift, or drivability concern is a failed TCM, and do not assume historical coverage remains open.',
      severity: 'high',
      symptoms: ['Intermittent loss of transmission engagement while driving', 'Intermittent no-start', 'Loss of power', 'Possible warning lamp or flashing gear display'],
      affectedSystems: ['DPS6 automatic transmission', 'transmission control module'],
      dtcCodes: ['U0100', 'U0101', 'U1013', 'P0606'],
      sources: [
        { type: 'tsb', title: 'Ford Program 14M02 - DPS6 TCM Extended Coverage', url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10237441-0001.pdf' },
        { type: 'tsb', title: 'Ford DPS6 TCM Coverage and Documented Failure Symptoms', url: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10199780-0001.pdf' },
      ],
      summary:
        'Narrowed the frozen seven-year litigation and transmission-failure aggregation to Ford\'s exact 2012-2016 DPS6 TCM program, failure symptoms, diagnostic gate, and historically limited coverage.',
    },
    'Retain the exact Ford TCM program and remove litigation claims, settlement links, buyback advice, universal clutch replacement, and complete-transmission recommendations.',
  ),
};

const reasons = {
  'ford-focus-20-gdi-carbon-buildup-2012':
    'The frozen card treats direct-injection architecture and one enthusiast discussion as a universal defect, then prescribes walnut blasting intervals, a commercial adapter, a catch can, and gasoline brands without a Ford bulletin defining a failure population and remedy.',
  'ford-focus-door-ajar-false-2008':
    'The only citation is a fabricated-looking placeholder YouTube URL. The frozen card combines latch-switch corrosion, battery drain, all four doors, temporary fuse or lubricant workarounds, and latch replacement across eleven years without an exact Ford source.',
  'ford-focus-rear-wheel-bearing-2000':
    'The frozen card relies on a fabricated-looking placeholder YouTube URL and owner anecdotes, then asserts repeated failure, spindle-seal and alignment causes, salt-belt replacement strategy, prices, and anti-seize instructions without a Ford-defined population.',
};

module.exports = buildConfig({
  label: 'Ford Focus',
  make: 'Ford',
  model: 'Focus',
  slug: 'ford-focus',
  batchId: 'ford-focus-full-record-cohort-122-2026-08-05',
  auditDate: '2026-08-05',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '9d493ef229756ada101de079e0ce3663ab41fdfb500ccf71d6c9dd117ca8d1f4',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/ford-focus/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'fordfocus_blind:manual-primary-source-gate',
    edge: 'fordfocus_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [],
});
