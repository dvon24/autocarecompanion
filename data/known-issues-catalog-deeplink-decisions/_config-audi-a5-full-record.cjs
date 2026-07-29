const cite = (type, title, url) => ({ type, title, url });
const recallUrl = (year) =>
  `https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=A5&modelYear=${year}`;

const citations = {
  pods: cite(
    'recall',
    'NHTSA 21V874 / Audi 74E3 - A5 Passenger-Occupant Detection Cable',
    recallUrl(2018),
  ),
  rearCamera: cite(
    'recall',
    'NHTSA 22V806 / Audi 91Ei - 2022 A5 Sportback/Cabriolet Rearview Camera',
    recallUrl(2022),
  ),
  waterPump: cite(
    'tsb',
    'Audi TSB 2071515/1 - 2020-2024 A5 2.0 TFSI Coolant-Pump Leak',
    'https://static.nhtsa.gov/odi/tsbs/2023/MC-10242918-0001.pdf',
  ),
  inventory2018: cite(
    'nhtsa',
    'NHTSA 2018 Audi A5 Recall Inventory',
    recallUrl(2018),
  ),
};

const archived = ({ years, category, title, formerClaim, diagnosis }) => ({
  disposition: 'remove',
  decision:
    `Archive the unsupported ${formerClaim}. No exact Audi or regulator primary source establishes the frozen row's complete A5 model-year, engine, DTC, prevalence, repair and prevention bundle. Remove every commerce claim and URL.`,
  evidence: [
    {
      label:
        'Official regulator inventory establishes narrower VIN- and campaign-specific A5 paths, not this universal parts narrative',
      url: citations.inventory2018.url,
    },
  ],
  after: {
    years,
    trims: [],
    engines: [],
    category,
    title: `Archived - Unsupported Audi A5 ${title} Aggregation`,
    description:
      `The former row combined ${formerClaim} without an exact Audi or regulator primary source for the complete public claim.`,
    solution:
      `Do not order parts or apply a fixed service interval from this archived card. ${diagnosis}`,
    severity: 'low',
    confidence: 'low',
    source: 'manual',
    symptoms: [],
    affectedSystems: [],
    dtcCodes: [],
    citations: [citations.inventory2018],
    summary:
      `Archived an unsupported Audi A5 ${title.toLowerCase()} aggregation and removed broad failure, repair, prevention and commerce claims.`,
  },
});

const recordSpecs = {
  'audi-a5-airbag-ods-recall-2018': {
    disposition: 'recall-dealer',
    decision:
      'Replace the incorrect 69CN / 20V354 claim with exact 2018-2020 A5 campaign 21V874 / Audi 74E3. State that it expands 19V547 / 74D9 and remove the unrelated clock-spring shopping link.',
    evidence: [
      {
        label:
          'NHTSA 21V874 covers 2018-2020 A5 body styles, identifies a seat-heater-to-PODS cable contact fault and requires the new remedy even after prior 19V547 work',
        url: citations.pods.url,
      },
    ],
    after: {
      years: [2018, 2019, 2020],
      trims: [],
      engines: [],
      category: 'safety',
      title:
        '2018-2020 Audi A5 Passenger-Airbag Recall 74E3 / NHTSA 21V874',
      description:
        'NHTSA campaign 21V874 / Audi 74E3 covers certain 2018-2020 A5 Coupe, Sportback and Cabriolet vehicles. A contact fault in the cable between the passenger-seat heater and Passenger Occupant Detection System can be misdiagnosed by the software and disable the passenger airbag, increasing injury risk in a crash. The campaign expands recall 19V547 / 74D9, and previously repaired vehicles must return for the new remedy. Eligibility is VIN-specific.',
      solution:
        'Check the VIN and campaign-completion history with Audi or NHTSA. The free remedy replaces the connecting cable and either the heating mat or the entire seat cover. If the passenger-airbag warning or AIRBAG OFF indicator behaves unexpectedly, avoid using that seating position until Audi inspects it. Do not buy a clock spring for this campaign.',
      severity: 'high',
      confidence: 'high',
      source: 'nhtsa-verified',
      symptoms: [
        'Passenger-airbag warning indicator illuminated',
        'Passenger airbag shown as disabled with an occupant present',
      ],
      affectedSystems: [
        'Passenger Occupant Detection System',
        'seat-heater connecting cable',
        'front passenger airbag',
      ],
      dtcCodes: [],
      citations: [citations.pods],
      summary:
        'Corrected the campaign to current 21V874 / 74E3, retained its 2018-2020 A5 body-style scope and removed the unrelated clock-spring commerce claim.',
    },
  },
  'audi-a5-carbon-buildup-2008': archived({
    years: [
      2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018,
      2019, 2020, 2021, 2022, 2023,
    ],
    category: 'engine',
    title: 'Carbon-Buildup',
    formerClaim:
      '16-year universal intake-valve carbon buildup, fixed-mileage cleaning and catch-can prescription',
    diagnosis:
      'Identify the engine code, reproduce the symptom, review misfire data and inspect the intake path before authorizing cleaning or modifications.',
  }),
  'audi-a5-electrical-infotainment-2017': {
    disposition: 'recall-dealer',
    decision:
      'Replace the broad 2017-2023 virtual-cockpit/electrical aggregation with exact 2022 A5 Sportback and Cabriolet rearview-camera recall 22V806 / Audi 91Ei. Remove the refurbished-cluster shopping link.',
    evidence: [
      {
        label:
          'NHTSA 22V806 identifies certain 2022 A5 Sportback and Cabriolet infotainment main units that can fail after shutdown and leave the next-start rearview camera inoperative',
        url: citations.rearCamera.url,
      },
    ],
    after: {
      years: [2022],
      trims: [],
      engines: [],
      category: 'electrical',
      title: '2022 Audi A5 Rearview-Camera Recall 91Ei / NHTSA 22V806',
      description:
        'NHTSA campaign 22V806 / Audi 91Ei covers certain 2022 A5 Sportback and Cabriolet vehicles. The infotainment main unit can be damaged internally when the vehicle is switched off, leaving the rearview-camera display inoperative at the next start. Loss of the required rear image reduces visibility while reversing. Eligibility is VIN-specific; the campaign summary does not list the A5 Coupe.',
      solution:
        'Check the VIN and campaign-completion history with Audi or NHTSA. The free remedy replaces the infotainment main unit. Until repaired, use mirrors and direct observation with extra care while reversing. Do not order a refurbished virtual-cockpit cluster from this summary.',
      severity: 'high',
      confidence: 'high',
      source: 'nhtsa-verified',
      symptoms: [
        'Rearview-camera image does not appear after selecting Reverse',
        'Infotainment display is inoperative after vehicle restart',
      ],
      affectedSystems: [
        'infotainment main unit',
        'rearview-camera display',
      ],
      dtcCodes: [],
      citations: [citations.rearCamera],
      summary:
        'Narrowed a broad electrical card to exact 2022 Sportback/Cabriolet recall 22V806 / 91Ei and removed the unrelated cluster-commerce claim.',
    },
  },
  'audi-a5-mechatronic-2008': archived({
    years: [2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017],
    category: 'transmission',
    title: 'Mechatronic',
    formerClaim:
      'ten-year universal transmission-mechatronic failure, fluid and direct control-unit replacement narrative across unspecified gearboxes',
    diagnosis:
      'Identify the transmission code, scan the controller, reproduce the symptom and follow the exact Audi test plan before repair.',
  }),
  'audi-a5-oil-consumption-2008': archived({
    years: [2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015],
    category: 'engine',
    title: 'Oil-Consumption/Piston-Ring',
    formerClaim:
      'eight-year piston-ring and PCV oil-consumption claim with fixed thresholds, direct internal-engine parts and aftermarket recommendations',
    diagnosis:
      'Document consumption using Audi specifications, inspect for external leaks and crankcase-ventilation faults and identify the engine code before internal repair.',
  }),
  'audi-a5-timing-chain-2008': archived({
    years: [2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017],
    category: 'engine',
    title: 'Timing-Chain',
    formerClaim:
      'ten-year timing-chain stretch, fixed-mileage replacement and direct kit prescription across multiple engines',
    diagnosis:
      'Identify the engine code, reproduce cold-start noise, compare cam/crank data and verify mechanical timing before selecting components.',
  }),
  'audi-a5-timing-chain-tensioner-2008': archived({
    years: [2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016],
    category: 'engine',
    title: 'Timing-Chain Tensioner',
    formerClaim:
      'overlapping nine-year chain-tensioner, chain-jump, DTC, fixed-mileage and lifetime-warranty shopping narrative',
    diagnosis:
      'Confirm the exact engine and tensioner revision and complete Audi cam/crank and mechanical-timing tests before authorizing repair.',
  }),
  'audi-a5-water-pump-2008': {
    disposition: 'diagnosis-hold',
    decision:
      'Replace the broad 2008-2023 pump-failure and direct-parts narrative with exact Audi TSB 2071515/1 for 2020-2024 A5 2.0 TFSI vehicles. Preserve its clean, dry, refill and recheck gate before replacement.',
    evidence: [
      {
        label:
          'Audi TSB 2071515/1 covers 2020-2024 A5 2.0 TFSI coolant-pump leakage and requires reassessment before replacing only the component causing the leak',
        url: citations.waterPump.url,
      },
    ],
    after: {
      years: [2020, 2021, 2022, 2023, 2024],
      trims: [],
      engines: ['2.0 TFSI'],
      category: 'cooling',
      title: '2020-2024 Audi A5 Coolant-Pump Leak TSB 2071515/1',
      description:
        'Audi TSB 2071515/1 covers 2020-2024 A5 vehicles with a 2.0 TFSI engine when coolant loss, a visible leak or the coolant warning lamp can be assigned to the coolant pump. Audi warns that an apparent level drop can instead follow incomplete bleeding during production or prior repair, so the leak must be located precisely.',
      solution:
        'Document the suspected leak, clean and dry all coolant traces, fill the system correctly and reassess after driving a few miles. If no fresh leak returns, continue observing without replacing parts. If leakage recurs, replace only the component causing it under the exact VIN, engine and part criteria. Confirm current coverage with Audi; do not order by model year alone.',
      severity: 'medium',
      confidence: 'high',
      source: 'nhtsa-verified',
      symptoms: [
        'Coolant loss or visible coolant leak',
        'Coolant warning lamp illuminated',
      ],
      affectedSystems: ['2.0 TFSI coolant pump', 'engine cooling system'],
      dtcCodes: [],
      citations: [citations.waterPump],
      summary:
        'Narrowed the water-pump card to exact 2020-2024 TSB 2071515/1 diagnosis and removed three direct-commerce claims with five URLs.',
    },
  },
};

const expectedIds = [
  'audi-a5-airbag-ods-recall-2018',
  'audi-a5-carbon-buildup-2008',
  'audi-a5-electrical-infotainment-2017',
  'audi-a5-mechatronic-2008',
  'audi-a5-oil-consumption-2008',
  'audi-a5-timing-chain-2008',
  'audi-a5-timing-chain-tensioner-2008',
  'audi-a5-water-pump-2008',
];
const records = Object.fromEntries(
  expectedIds.map((id) => [id, recordSpecs[id]]),
);
const expected = (claimIds, urls) => ({
  claimIds,
  urls,
  claimClicks: 0,
  recordClicks: 0,
  priorityClicks: 0,
});

module.exports = {
  label: 'Audi A5',
  make: 'Audi',
  model: 'A5',
  batchId: 'audi-a5-full-record-cohort-1-2026-07-29',
  auditDate: '2026-07-29',
  snapshotHash:
    '3ee40713b2b5f1bd845d6118be79fc8486956e01d41eb5a8609a85aba77a5102',
  sourceSnapshotFileHash:
    '6e4c8d64ced097e83111d27c7f46e1f1c08b79dc40423fee81ebc9d9c54cd455',
  packetFileHash:
    '88eadc608798d0732361da43dfc00a7841b9490fece89634ad28d6fa5e1aba1e',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/audi-a5/3ee40713b2b5/all-0001.json',
  reviewTokens: {
    blind: 'a5_blind_review:no-blocker',
    edge: 'a5_edge_review:no-blocker',
  },
  expectedIds,
  records,
  expectedPerRecord: {
    'audi-a5-airbag-ods-recall-2018': expected(
      ['communityRecommendations:4'],
      ['https://www.amazon.com/s?k=Dorman%20clock%20spring&tag=au7o-20'],
    ),
    'audi-a5-carbon-buildup-2008': expected(
      ['communityRecommendations:0', 'communityRecommendations:2'],
      [
        'https://www.amazon.com/s?k=034%20Motorsport%20034-101-1010&tag=au7o-20',
        'https://www.amazon.com/s?k=Mishimoto%20Baffled%20Oil%20Catch%20Can%20(Universal)&tag=au7o-20',
      ],
    ),
    'audi-a5-electrical-infotainment-2017': expected(
      ['communityRecommendations:2'],
      [
        'https://www.amazon.com/s?k=Genuine%20VW%2FAudi%20Virtual%20Cockpit%20Instrument%20Cluster%20(Refurbished)&tag=au7o-20',
      ],
    ),
    'audi-a5-mechatronic-2008': expected(
      ['fixParts:0', 'communityRecommendations:0'],
      [
        'https://www.amazon.com/s?k=8T0%20927%20156%20H&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=8T0%20927%20156%20H',
        'https://www.ebay.com/sch/i.html?_nkw=8T0%20927%20156%20H',
        'https://www.amazon.com/s?k=Pentosin%20FFL-2%201088107&tag=au7o-20',
      ],
    ),
    'audi-a5-oil-consumption-2008': expected(
      ['fixParts:0', 'communityRecommendations:0', 'communityRecommendations:1'],
      [
        'https://www.amazon.com/s?k=06J198151K&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=06J198151K',
        'https://www.ebay.com/sch/i.html?_nkw=06J198151K',
        'https://www.amazon.com/s?k=Kolbenschmidt%2006H107065DD&tag=au7o-20',
        'https://www.amazon.com/s?k=Dorman%20917-064&tag=au7o-20',
      ],
    ),
    'audi-a5-timing-chain-2008': expected(
      ['fixParts:0', 'communityRecommendations:0'],
      [
        'https://www.amazon.com/s?k=06K109467K&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=06K109467K',
        'https://www.ebay.com/sch/i.html?_nkw=06K109467K',
        'https://www.amazon.com/s?k=Genuine%20VW%2FAudi%2006K109467K&tag=au7o-20',
      ],
    ),
    'audi-a5-timing-chain-tensioner-2008': expected(
      [
        'fixParts:0',
        'communityRecommendations:0',
        'communityRecommendations:1',
        'communityRecommendations:4',
      ],
      [
        'https://www.amazon.com/s?k=06K109467K&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=06K109467K',
        'https://www.ebay.com/sch/i.html?_nkw=06K109467K',
        'https://www.amazon.com/s?k=Genuine%20VW%2FAudi%2006K109467K&tag=au7o-20',
        'https://www.amazon.com/s?k=INA%20711024410&tag=au7o-20',
        'https://www.amazon.com/s?k=FCP%20Euro%20Lifetime%20Warranty%20Parts&tag=au7o-20',
      ],
    ),
    'audi-a5-water-pump-2008': expected(
      ['fixParts:0', 'communityRecommendations:0', 'communityRecommendations:1'],
      [
        'https://www.amazon.com/s?k=06L121111H&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=06L121111H',
        'https://www.ebay.com/sch/i.html?_nkw=06L121111H',
        'https://www.amazon.com/s?k=Genuine%20VW%2FAudi%2006L121111P&tag=au7o-20',
        'https://www.amazon.com/s?k=USP%20Motorsports%2006L121111H-KT1&tag=au7o-20',
      ],
    ),
  },
  expectedTelemetry: {
    claimCount: 18,
    urlCount: 28,
    claimClickCount: 0,
    recordClickCount: 0,
    priorityClickCount: 0,
  },
  expectedDispositionCounts: {
    'recall-dealer': 2,
    remove: 5,
    'diagnosis-hold': 1,
  },
  expectedPublished: 3,
  expectedArchived: 5,
  controlledDeltaProposals: [],
  expectedProposalIdentities: [],
  assertReviewedAfterState(issues) {
    const byId = new Map(issues.map((issue) => [issue.id, issue.after]));
    if (
      JSON.stringify(byId.get('audi-a5-airbag-ods-recall-2018').years) !==
        JSON.stringify([2018, 2019, 2020]) ||
      JSON.stringify(
        byId.get('audi-a5-electrical-infotainment-2017').years,
      ) !== JSON.stringify([2022]) ||
      JSON.stringify(byId.get('audi-a5-water-pump-2008').years) !==
        JSON.stringify([2020, 2021, 2022, 2023, 2024]) ||
      issues.filter((issue) => issue.after.status === 'archived').length !== 5
    ) {
      throw new Error(
        'Audi A5 campaign/TSB scopes or published/archived split drifted after review.',
      );
    }
  },
};
