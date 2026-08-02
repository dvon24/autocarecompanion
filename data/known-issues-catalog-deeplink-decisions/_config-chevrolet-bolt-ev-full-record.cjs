const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

const sources = {
  rearCalipers: {
    type: 'recall',
    title: 'NHTSA Recall 18V576 - Rear Brake Caliper Pistons',
    url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=18V576000',
  },
  batteryFire: {
    type: 'recall',
    title: 'NHTSA Recall 21V560 - High-Voltage Battery Fire Risk',
    url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=21V560000',
  },
  rearDoors: {
    type: 'recall',
    title: 'NHTSA Recall 20V184 - Rear Door-Handle Cables',
    url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=20V184000',
  },
  batterySoftware: {
    type: 'recall',
    title: 'NHTSA Recall 24V812 - Failed Battery Diagnostic-Software Installation',
    url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=24V812000',
  },
  frontCaliper: {
    type: 'recall',
    title: 'NHTSA Recall 20V808 - Front Left Brake Caliper Casting',
    url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=20V808000',
  },
  pretensioners: {
    type: 'recall',
    title: 'NHTSA Recall 23V845 - Incorrect Prior Pretensioner Fire Remedy',
    url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=23V845000',
  },
  passengerAirbag: {
    type: 'recall',
    title: 'NHTSA Recall 23V567 - Instrument Panel Air-Bag Perforation',
    url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=23V567000',
  },
};

function replace(source, decision, after) {
  return {
    disposition: 'replace',
    decision,
    evidence: [{ type: source.type, label: source.title, url: source.url }],
    after: {
      ...after,
      citations: [{ type: source.type, title: source.title, url: source.url }],
    },
  };
}

module.exports = buildConfig({
  label: 'Chevrolet Bolt EV',
  make: 'Chevrolet',
  model: 'Bolt EV',
  slug: 'chevrolet-bolt-ev',
  batchId: 'chevrolet-bolt-ev-full-record-cohort-7-2026-08-02',
  auditDate: '2026-08-02',
  snapshotHash:
    '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash:
    '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash:
    '83efb4ccf880edb6e8796d03000cebd72060185570fb144d794b7081dbd385ef',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/chevrolet-bolt-ev/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'chevroletboltev_blind:self-no-blocker',
    edge: 'chevroletboltev_edge:self-no-blocker',
  },
  published: {
    'chevrolet-bolt-ev-battery-degradation-2017': replace(
      sources.rearCalipers,
      'Replace the complaint-page/Reddit battery-degradation aggregation and five unrelated search links with the exact 2018-2019 rear-caliper recall.',
      {
        years: [2018, 2019],
        trims: [],
        engines: [],
        category: 'brakes',
        title: 'Rear Caliper Piston Coating Can Reduce Brake Performance (Recall 18V576)',
        description:
          'NHTSA Recall 18V576 covers certain 2018-2019 Chevrolet Bolt EV vehicles. Insufficient coating on the rear brake-caliper pistons can allow gas pockets to form and reduce rear braking performance, increasing crash risk.',
        solution:
          'Check the VIN for recall completion. A Chevrolet dealer bleeds the brake system under the no-charge campaign.',
        severity: 'high',
        confidence: 'high',
        symptoms: ['Reduced rear braking performance', 'Gas pockets in the rear brake hydraulic circuit'],
        affectedSystems: ['rear brake-caliper pistons and hydraulic brake circuit'],
        dtcCodes: [],
        summary:
          'Replaced an unsupported battery-degradation card with the exact 2018-2019 rear-caliper recall and removed five search links.',
      },
    ),
    'chevrolet-bolt-ev-battery-fire-recall-2017': replace(
      sources.batteryFire,
      'Retain the genuine battery-fire condition, replace forum/video sourcing with the direct superseding NHTSA campaign and exact module-replacement remedy, and remove six unrelated search links.',
      {
        years: [2017, 2018, 2019],
        trims: [],
        engines: [],
        category: 'electrical',
        title: 'High-Voltage Battery Can Catch Fire Near Full Charge (Recall 21V560)',
        description:
          'NHTSA Recall 21V560 covers certain 2017-2019 Chevrolet Bolt EV vehicles previously recalled under 20V701. The high-voltage battery can catch fire when charged to full or nearly full capacity. Vehicles repaired under the earlier campaign still require the newer remedy.',
        solution:
          'Check the VIN for recall completion and follow Chevrolet\'s current charging/parking instructions for any open campaign. The no-charge recall replaces defective battery modules.',
        severity: 'high',
        confidence: 'high',
        symptoms: ['No reliable warning before a battery fire', 'Open 21V560 battery recall', 'Fire while the high-voltage battery is near full charge'],
        affectedSystems: ['high-voltage traction battery and battery modules'],
        dtcCodes: [],
        summary:
          'Replaced secondary battery-fire sourcing with the direct superseding 21V560 campaign and removed six unrelated search links.',
      },
    ),
    'chevrolet-bolt-ev-cabin-heater-2017': replace(
      sources.rearDoors,
      'Replace the uncited seven-year cabin-heater aggregation and six unrelated search links with the exact 2019-2020 rear door-handle cable recall.',
      {
        years: [2019, 2020],
        trims: [],
        engines: [],
        category: 'body',
        title: 'Rear Door-Handle Cables Can Be Damaged by the Window (Recall 20V184)',
        description:
          'NHTSA Recall 20V184 covers certain 2019-2020 Chevrolet Bolt EV vehicles. An overly long cable inside a rear door can contact the opening window and become damaged, allowing the door to open unintentionally or preventing the inside handle from opening it.',
        solution:
          'Check the VIN for recall completion. A Chevrolet dealer replaces the rear inside door-handle cables under the no-charge campaign.',
        severity: 'high',
        confidence: 'high',
        symptoms: ['Rear door opens unexpectedly', 'Rear inside door handle does not open the door', 'Door-handle cable contacts the rear window'],
        affectedSystems: ['rear inside door-handle cables and windows'],
        dtcCodes: [],
        summary:
          'Replaced an uncited cabin-heater card with the exact 2019-2020 rear-door cable recall and removed six search links.',
      },
    ),
    'chevrolet-bolt-ev-dcfc-speed-reduction-2017': replace(
      sources.batterySoftware,
      'Replace the complaint-page/invalid-Reddit charging-speed aggregation and four unrelated search links with the latest failed battery diagnostic-software installation recall.',
      {
        years: [2020, 2021, 2022],
        trims: [],
        engines: [],
        category: 'electrical',
        title: 'Prior Battery Diagnostic-Software Installation May Have Failed (Recall 24V812)',
        description:
          'NHTSA Recall 24V812 covers certain 2020-2022 Chevrolet Bolt EV vehicles previously repaired under 21V650. Installation of the advanced diagnostic software may have failed, leaving defective battery modules undetected and allowing a fire near full charge.',
        solution:
          'Check the VIN even if the earlier battery recall was completed and follow Chevrolet\'s current interim charging/parking instructions for an open campaign. A dealer reinstalls the advanced diagnostic software at no charge.',
        severity: 'high',
        confidence: 'high',
        symptoms: ['No reliable warning that the software installation failed', 'Open 24V812 recall', 'Battery fire risk near full charge'],
        affectedSystems: ['high-voltage traction battery and advanced diagnostic software'],
        dtcCodes: [],
        summary:
          'Replaced an unsupported charging-speed card with the December 2024 battery-software re-recall and removed four search links.',
      },
    ),
    'chevrolet-bolt-ev-front-motor-bearing-2017': replace(
      sources.frontCaliper,
      'Replace the complaint-page/video drive-motor bearing aggregation and two search links with the exact 2020 front-left brake-caliper recall.',
      {
        years: [2020],
        trims: [],
        engines: [],
        category: 'brakes',
        title: 'Front Left Brake Caliper Can Fracture Under High Pressure (Recall 20V808)',
        description:
          'NHTSA Recall 20V808 covers certain 2020 Chevrolet Bolt EV vehicles with an improperly cast front-left brake caliper. The caliper can fracture during high-pressure braking, leak fluid and reduce brake performance.',
        solution:
          'Check the VIN for recall completion. A Chevrolet dealer inspects the caliper casting lot number and replaces the front-left caliper when necessary.',
        severity: 'high',
        confidence: 'high',
        symptoms: ['Brake-fluid loss at the front-left caliper', 'Reduced brake performance during high-pressure braking', 'Fractured caliper casting'],
        affectedSystems: ['front-left brake caliper and hydraulic circuit'],
        dtcCodes: [],
        summary:
          'Replaced an unsupported motor-bearing card with the exact 2020 front-caliper recall and removed two search links.',
      },
    ),
    'chevrolet-bolt-ev-infotainment-2017': replace(
      sources.pretensioners,
      'Replace the complaint-page/forum infotainment aggregation and four unrelated search links with the current pretensioner fire re-recall.',
      {
        years: [2017, 2018, 2019, 2020, 2021, 2022, 2023],
        trims: [],
        engines: [],
        category: 'safety',
        title: 'Prior Seat-Belt Pretensioner Fire Recall Repair May Be Incorrect (Recall 23V845)',
        description:
          'NHTSA Recall 23V845 covers certain 2017-2023 Chevrolet Bolt EV vehicles, including vehicles repaired incorrectly under 22V930. After a crash deploys a front pretensioner, its exhaust can ignite carpet fibers near the B-pillar and cause a fire.',
        solution:
          'Check the VIN even if Recall 22V930 was completed. A Chevrolet dealer inspects both front pretensioners, installs metal foil near the exhaust and adds a pretensioner cover when required.',
        severity: 'high',
        confidence: 'high',
        symptoms: ['No reliable warning before a post-crash fire', 'Open 23V845 recall', 'Carpet ignition near a B-pillar after pretensioner deployment'],
        affectedSystems: ['front seat-belt pretensioners, B-pillar carpet and protective foil/covers'],
        dtcCodes: [],
        summary:
          'Replaced an unsupported infotainment card with the January 2024 pretensioner re-recall and removed four search links.',
      },
    ),
    'chevrolet-bolt-ev-infotainment-ghosting-2017': replace(
      sources.passengerAirbag,
      'Replace the complaint-page/invalid-video screen-ghosting aggregation and one search link with the exact 2022-2023 passenger-air-bag deployment recall.',
      {
        years: [2022, 2023],
        trims: [],
        engines: [],
        category: 'safety',
        title: 'Instrument Panel May Block Passenger Air-Bag Deployment (Recall 23V567)',
        description:
          'NHTSA Recall 23V567 covers certain 2022-2023 Chevrolet Bolt EV vehicles whose instrument-panel cover may be missing an underside perforation required for proper passenger-air-bag deployment, increasing injury risk in a crash.',
        solution:
          'Check the VIN for recall completion. A Chevrolet dealer replaces the instrument panel under the no-charge campaign.',
        severity: 'high',
        confidence: 'high',
        symptoms: ['No reliable warning before a crash', 'Missing underside perforation in the passenger instrument-panel cover'],
        affectedSystems: ['instrument panel and passenger frontal air bag'],
        dtcCodes: [],
        summary:
          'Replaced an unsupported screen-ghosting card with the exact 2022-2023 passenger-air-bag recall and removed one search link.',
      },
    ),
  },
  proposalCampaigns: [],
});
