const cite = (type, title, url) => ({ type, title, url });
const campaignUrl = (number) =>
  `https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=${number}`;

const citations = {
  rollaway: cite(
    'recall',
    'NHTSA 25V120 / Audi 454R - Q4 e-tron Gear-Position Display',
    campaignUrl('25V120000'),
  ),
  chargeCable: cite(
    'recall',
    'NHTSA 23V842 / Audi 93U6/93U8 - Compact Charging Cable',
    campaignUrl('23V842000'),
  ),
  headlights: cite(
    'recall',
    'NHTSA 24V361 / Audi 941L - Q4 e-tron Headlight-Control Software',
    campaignUrl('24V361000'),
  ),
  ocdc: cite(
    'recall',
    'NHTSA 25V125 / Audi 93FR - Q4 e-tron On-Board Charger',
    campaignUrl('25V125000'),
  ),
  inventory: cite(
    'nhtsa',
    'NHTSA Q4 e-tron Campaign Inventory',
    'https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=Q4%20e-tron&modelYear=2024',
  ),
};

const archived = ({ years, category, title, formerClaim, diagnosis }) => ({
  disposition: 'remove',
  decision:
    `Archive the unsupported ${formerClaim}. No exact Audi or regulator primary source establishes the frozen row's complete Q4 e-tron model-year, symptom, failure, repair and prevention bundle. Remove every commerce claim and URL.`,
  evidence: [
    {
      label:
        'Official regulator inventory establishes narrower VIN- and campaign-specific Q4 e-tron paths, not this universal aggregation',
      url: citations.inventory.url,
    },
  ],
  after: {
    years,
    trims: [],
    engines: [],
    category,
    title: `Archived - Unsupported Audi Q4 e-tron ${title} Aggregation`,
    description:
      `The former row combined ${formerClaim} without an exact Audi or regulator primary source for the complete public claim.`,
    solution:
      `Do not order parts or apply a universal repair from this archived card. ${diagnosis}`,
    severity: 'low',
    confidence: 'low',
    source: 'manual',
    symptoms: [],
    affectedSystems: [],
    dtcCodes: [],
    citations: [citations.inventory],
    summary:
      `Archived an unsupported Audi Q4 e-tron ${title.toLowerCase()} aggregation and removed broad failure, repair, prevention and commerce claims.`,
  },
});

const recordSpecs = {
  'audi-q4-etron-brake-rollaway-2022': {
    disposition: 'recall-dealer',
    decision:
      'Correct the frozen brake-control/rollaway card to current 2022-2023 NHTSA 25V120 / Audi 454R. Retain only the gear-position display noncompliance, parking-brake precaution and free software remedy.',
    evidence: [
      {
        label:
          'NHTSA 25V120 identifies 2022-2023 Q4 e-tron instrument panels that may not display the gear position and specifies brake-control-unit software',
        url: citations.rollaway.url,
      },
    ],
    after: {
      years: [2022, 2023],
      trims: [],
      engines: [],
      category: 'safety',
      title:
        '2022-2023 Audi Q4 e-tron Rollaway Recall 454R / NHTSA 25V120',
      description:
        'NHTSA campaign 25V120 / Audi 454R covers certain 2022-2023 Q4 e-tron and Q4 e-tron Sportback vehicles. The instrument panel may not display the transmission gear position correctly. If the driver leaves the vehicle without engaging the parking brake, the missing or incorrect indication can contribute to a rollaway. Eligibility is VIN-specific.',
      solution:
        'Check the VIN and campaign-completion history with Audi or NHTSA. The free recall remedy updates the brake-control-unit software. Until completed, verify the selected gear and always engage the parking brake before leaving the vehicle.',
      severity: 'high',
      confidence: 'high',
      source: 'nhtsa-verified',
      symptoms: ['Gear-position indicator is missing or incorrect'],
      affectedSystems: [
        'instrument-panel gear-position display',
        'brake-control-unit software',
      ],
      dtcCodes: [],
      citations: [citations.rollaway],
      summary:
        'Narrowed the rollaway card to exact 2022-2023 campaign 25V120 / 454R and its free software remedy.',
    },
  },
  'audi-q4-etron-charging-port-2022': {
    disposition: 'recall-dealer',
    decision:
      'Replace the unsupported charging-port/CCS hardware narrative with exact 2022-2024 compact charging-cable recall 23V842 / Audi 93U6 and 93U8. Remove the direct inlet and charging-port shopping links.',
    evidence: [
      {
        label:
          'NHTSA 23V842 identifies 2022-2024 Q4 e-tron vehicles whose 220V/240V compact charging cable or home outlet can overheat at the 100-percent setting',
        url: citations.chargeCable.url,
      },
    ],
    after: {
      years: [2022, 2023, 2024],
      trims: [],
      engines: [],
      category: 'electrical',
      title:
        '2022-2024 Audi Q4 e-tron Charging-Cable Recall 93U6/93U8 / NHTSA 23V842',
      description:
        'NHTSA campaign 23V842 / Audi 93U6 and 93U8 covers certain 2022-2024 Q4 e-tron and Q4 e-tron Sportback vehicles supplied with the compact charging system. At the 100-percent setting, an industrial 220V/240V plug or home outlet that cannot handle the requested current may overheat, increasing fire risk. This is not evidence that the vehicle charging inlet itself should be replaced.',
      solution:
        'Check the VIN and campaign instructions with Audi or NHTSA. The recall advises owners not to use the affected 220V/240V compact cable and to use the 110V cable or public charging until Audi supplies the replacement 220V/240V cable with an incorporated temperature sensor at no charge. Do not order a charging inlet from this card.',
      severity: 'high',
      confidence: 'high',
      source: 'nhtsa-verified',
      symptoms: [
        'Compact charging cable or home outlet becomes unusually hot',
      ],
      affectedSystems: ['compact charging cable', '220V/240V home outlet'],
      dtcCodes: [],
      citations: [citations.chargeCable],
      summary:
        'Replaced a broad charging-port card with exact campaign 23V842 / 93U6/93U8 and removed two commerce claims with four URLs.',
    },
  },
  'audi-q4-etron-cold-weather-range-2022': archived({
    years: [2023, 2024],
    category: 'electrical',
    title: 'Cold-Weather Range',
    formerClaim:
      'two-year severe cold-weather range-loss claim tied to heat-pump configuration and an unrelated window-regulator shopping link',
    diagnosis:
      'Compare ambient temperature, battery temperature, HVAC demand, charging history and route conditions against the vehicle’s own consumption data before treating reduced range as a fault.',
  }),
  'audi-q4-etron-headlight-module-2022': {
    disposition: 'recall-dealer',
    decision:
      'Replace the broad headlight hardware and relay/bulb/assembly shopping narrative with exact 2022-2024 software recall 24V361 / Audi 941L.',
    evidence: [
      {
        label:
          'NHTSA 24V361 identifies incorrect Q4 e-tron headlight-control-module software that can make parking lights operate improperly',
        url: citations.headlights.url,
      },
    ],
    after: {
      years: [2022, 2023, 2024],
      trims: [],
      engines: [],
      category: 'electrical',
      title:
        '2022-2024 Audi Q4 e-tron Headlight Recall 941L / NHTSA 24V361',
      description:
        'NHTSA campaign 24V361 / Audi 941L covers certain 2022-2024 Q4 e-tron and Q4 e-tron Sportback vehicles with incorrect headlight-control-module software. The parking lights may not operate as intended when the headlights are on and the turn signals are activated, reducing vehicle visibility. Eligibility is VIN-specific.',
      solution:
        'Check the VIN and campaign-completion history with Audi or NHTSA. The free remedy updates the headlight-control module with a corrected data set. Do not substitute relays, bulbs, a multimeter or a headlight assembly for the campaign software update.',
      severity: 'high',
      confidence: 'high',
      source: 'nhtsa-verified',
      symptoms: [
        'Parking lights operate incorrectly with headlights and turn signals active',
      ],
      affectedSystems: [
        'headlight-control module',
        'parking-light software',
      ],
      dtcCodes: [],
      citations: [citations.headlights],
      summary:
        'Narrowed the headlight card to exact software recall 24V361 / 941L and removed four unrelated commerce links.',
    },
  },
  'audi-q4-etron-hv-coolant-2022': archived({
    years: [2022, 2023, 2024],
    category: 'cooling',
    title: 'High-Voltage Cooling',
    formerClaim:
      'three-year battery-cooling efficiency failure, direct coolant-pump part number and universal G13 coolant prescription',
    diagnosis:
      'Read the high-voltage thermal-management faults, leak-test the correct circuit and follow Audi’s VIN- and component-specific electric-vehicle procedure.',
  }),
  'audi-q4-etron-ota-software-2022': archived({
    years: [2022, 2023, 2024],
    category: 'electrical',
    title: 'OTA/Software Glitch',
    formerClaim:
      'three-year universal over-the-air update and software-glitch narrative with a search-shopping recommendation',
    diagnosis:
      'Record the software version, fault messages and reproducible function, then check VIN-specific Audi campaigns and technical instructions.',
  }),
  'audi-q4-etron-software-glitches-2022': {
    disposition: 'recall-dealer',
    decision:
      'Replace the broad cascading-warning/12-volt parts aggregation with current 2024-2025 on-board charger recall 25V125 / Audi 93FR. Remove eight battery, charger, relay, sensor and scan-tool commerce claims.',
    evidence: [
      {
        label:
          'NHTSA 25V125 identifies 2024-2025 Q4 e-tron on-board chargers that can stop charging the 12-volt battery and cause loss of drive power',
        url: citations.ocdc.url,
      },
    ],
    after: {
      years: [2024, 2025],
      trims: [],
      engines: [],
      category: 'electrical',
      title:
        '2024-2025 Audi Q4 e-tron On-Board-Charger Recall 93FR / NHTSA 25V125',
      description:
        'NHTSA campaign 25V125 / Audi 93FR covers certain 2024-2025 Q4 e-tron and Q4 e-tron Sportback vehicles. The on-board charger can fail and stop charging the 12-volt battery, which can lead to loss of drive power and increase crash risk. Eligibility is VIN-specific; this does not support the former universal sensor, relay, battery or software-glitch diagnosis.',
      solution:
        'Check the VIN and campaign-completion history with Audi or NHTSA. The free remedy replaces the on-board charger. If the vehicle warns of an electrical-system fault or loses drive power, move out of traffic safely and arrange Audi recovery/inspection; do not buy a 12-volt battery or generic electrical parts from this summary.',
      severity: 'high',
      confidence: 'high',
      source: 'nhtsa-verified',
      symptoms: [
        'Electrical-system warning',
        '12-volt battery is no longer charged',
        'Loss of drive power',
      ],
      affectedSystems: ['on-board charger', '12-volt electrical system'],
      dtcCodes: [],
      citations: [citations.ocdc],
      summary:
        'Replaced a broad software card with current 2024-2025 campaign 25V125 / 93FR and removed eight commerce claims with ten URLs.',
    },
  },
};

const expectedIds = [
  'audi-q4-etron-brake-rollaway-2022',
  'audi-q4-etron-charging-port-2022',
  'audi-q4-etron-cold-weather-range-2022',
  'audi-q4-etron-headlight-module-2022',
  'audi-q4-etron-hv-coolant-2022',
  'audi-q4-etron-ota-software-2022',
  'audi-q4-etron-software-glitches-2022',
];
const records = Object.fromEntries(
  expectedIds.map((id) => [id, recordSpecs[id]]),
);
const expected = (
  claimIds,
  urls,
  { claimClicks = 0, recordClicks = 0, priorityClicks = 0 } = {},
) => ({ claimIds, urls, claimClicks, recordClicks, priorityClicks });

module.exports = {
  label: 'Audi Q4 e-tron',
  make: 'Audi',
  model: 'Q4 e-tron',
  batchId: 'audi-q4-etron-full-record-cohort-1-2026-07-29',
  auditDate: '2026-07-29',
  snapshotHash:
    '3ee40713b2b5f1bd845d6118be79fc8486956e01d41eb5a8609a85aba77a5102',
  sourceSnapshotFileHash:
    '6e4c8d64ced097e83111d27c7f46e1f1c08b79dc40423fee81ebc9d9c54cd455',
  packetFileHash:
    'b7697e8b9e19dc2b827c52bf585bddc9a2e3df8f5920e3bff6713dffc2618530',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/audi-q4-etron/3ee40713b2b5/all-0001.json',
  reviewTokens: {
    blind: 'q4_etron_blind_review:no-blocker',
    edge: 'q4_etron_edge_review:no-blocker',
  },
  expectedIds,
  records,
  expectedPerRecord: {
    'audi-q4-etron-brake-rollaway-2022': expected([], []),
    'audi-q4-etron-charging-port-2022': expected(
      ['fixParts:0', 'communityRecommendations:0'],
      [
        'https://www.amazon.com/s?k=8V0862159A&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=8V0862159A',
        'https://www.ebay.com/sch/i.html?_nkw=8V0862159A',
        'https://www.amazon.com/s?k=Genuine%20Audi%20Q4%20e-tron%20charging%20port&tag=au7o-20',
      ],
    ),
    'audi-q4-etron-cold-weather-range-2022': expected(
      ['communityRecommendations:3'],
      [
        'https://www.amazon.com/s?k=Dorman%20Power%20Window%20Regulator%20and%20Motor%20Assembly%20Audi%20Q4%20e-tron&tag=au7o-20',
      ],
    ),
    'audi-q4-etron-headlight-module-2022': expected(
      [
        'communityRecommendations:1',
        'communityRecommendations:2',
        'communityRecommendations:3',
        'communityRecommendations:4',
      ],
      [
        'https://www.amazon.com/s?k=Bosch%20Automotive%20Relay%205-Pin%2012V%20Audi%20Q4%20e-tron&tag=au7o-20',
        'https://www.amazon.com/s?k=Innova%20Digital%20Multimeter%20Audi%20Q4%20e-tron&tag=au7o-20',
        'https://www.amazon.com/s?k=Sylvania%20LED%20Headlight%20Bulbs%20Audi%20Q4%20e-tron&tag=au7o-20',
        'https://www.amazon.com/s?k=TYC%20Headlight%20Assembly%20Audi%20Q4%20e-tron&tag=au7o-20',
      ],
    ),
    'audi-q4-etron-hv-coolant-2022': expected(
      ['fixParts:0', 'communityRecommendations:0'],
      [
        'https://www.amazon.com/s?k=1EA965567L&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=1EA965567L',
        'https://www.ebay.com/sch/i.html?_nkw=1EA965567L',
        'https://www.amazon.com/s?k=Genuine%20Audi%20G13E050A2%20Q4%20e-tron%20coolant&tag=au7o-20',
      ],
    ),
    'audi-q4-etron-ota-software-2022': expected(
      ['communityRecommendations:0'],
      [
        'https://www.amazon.com/s?k=Audi%20Q4%20e-tron%20software%20update&tag=au7o-20',
      ],
    ),
    'audi-q4-etron-software-glitches-2022': expected(
      [
        'fixParts:0',
        'communityRecommendations:3',
        'communityRecommendations:4',
        'communityRecommendations:5',
        'communityRecommendations:6',
        'communityRecommendations:7',
        'communityRecommendations:8',
        'communityRecommendations:9',
      ],
      [
        'https://www.amazon.com/s?k=000915105CC&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=000915105CC',
        'https://www.ebay.com/sch/i.html?_nkw=000915105CC',
        'https://www.amazon.com/s?k=Optima%20RedTop%20AGM%20Battery%20Audi%20Q4%20e-tron&tag=au7o-20',
        'https://www.amazon.com/s?k=ACDelco%20Professional%20AGM%20Battery%20Audi%20Q4%20e-tron&tag=au7o-20',
        'https://www.amazon.com/s?k=Battery%20Tender%20Junior%2012V%20Battery%20Charger%20Maintainer%20Audi%20Q4%20e-tron&tag=au7o-20',
        'https://www.amazon.com/s?k=BlueDriver%20Bluetooth%20Pro%20OBD2%20Scan%20Tool%20Audi%20Q4%20e-tron&tag=au7o-20',
        'https://www.amazon.com/s?k=Bosch%20Automotive%20Relay%205-Pin%2012V%20Audi%20Q4%20e-tron&tag=au7o-20',
        'https://www.amazon.com/s?k=Innova%20Digital%20Multimeter%20Audi%20Q4%20e-tron&tag=au7o-20',
        'https://www.amazon.com/s?k=Bosch%20Replacement%20Sensor%20Audi%20Q4%20e-tron&tag=au7o-20',
      ],
    ),
  },
  expectedTelemetry: {
    claimCount: 18,
    urlCount: 24,
    claimClickCount: 0,
    recordClickCount: 0,
    priorityClickCount: 0,
  },
  expectedDispositionCounts: {
    'recall-dealer': 4,
    remove: 3,
  },
  expectedPublished: 4,
  expectedArchived: 3,
  controlledDeltaProposals: [],
  expectedProposalIdentities: [],
  assertReviewedAfterState(issues) {
    const byId = new Map(issues.map((issue) => [issue.id, issue.after]));
    if (
      JSON.stringify(byId.get('audi-q4-etron-brake-rollaway-2022').years) !==
        JSON.stringify([2022, 2023]) ||
      JSON.stringify(byId.get('audi-q4-etron-headlight-module-2022').years) !==
        JSON.stringify([2022, 2023, 2024]) ||
      JSON.stringify(
        byId.get('audi-q4-etron-software-glitches-2022').years,
      ) !== JSON.stringify([2024, 2025]) ||
      issues.filter((issue) => issue.after.status === 'archived').length !== 3
    ) {
      throw new Error(
        'Audi Q4 e-tron campaign scopes or published/archived split drifted after review.',
      );
    }
  },
};
