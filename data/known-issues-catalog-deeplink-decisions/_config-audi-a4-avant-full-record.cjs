const cite = (type, title, url) => ({ type, title, url });
const recallUrl = (year) =>
  `https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=A4&modelYear=${year}`;

const citations = {
  nadi: cite(
    'recall',
    'NHTSA 20V056 / Audi 69BT - NADI Driver-Airbag Inflator',
    'https://static.nhtsa.gov/odi/rcl/2020/RCRIT-20V056-8043.pdf',
  ),
  inventory2000: cite(
    'nhtsa',
    'NHTSA 2000 Audi A4 Recall Inventory',
    recallUrl(2000),
  ),
};

const archived = ({ years, category, title, formerClaim, diagnosis }) => ({
  disposition: 'remove',
  decision:
    `Archive the unsupported ${formerClaim}. No exact Audi or regulator primary source establishes the frozen row's full A4 Avant model-year, symptom, failure, replacement and prevention bundle. Remove every commerce claim and URL.`,
  evidence: [
    {
      label:
        'Official regulator inventory supports VIN- and campaign-specific A4 safety paths, not this universal parts narrative',
      url: citations.inventory2000.url,
    },
  ],
  after: {
    years,
    trims: [],
    engines: [],
    category,
    title: `Archived - Unsupported Audi A4 Avant ${title} Aggregation`,
    description:
      `The former row combined ${formerClaim} without an exact Audi or regulator primary source for the complete public claim.`,
    solution:
      `Do not order parts from this archived card. ${diagnosis}`,
    severity: 'low',
    confidence: 'low',
    source: 'manual',
    symptoms: [],
    affectedSystems: [],
    dtcCodes: [],
    citations: [citations.inventory2000],
    summary:
      `Archived an unsupported Audi A4 Avant ${title.toLowerCase()} aggregation and removed its broad repair, prevention and commerce claims.`,
  },
});

const recordSpecs = {
  'audi-a4-avant-b5-rear-hatch-strut-failure': archived({
    years: [1996, 1997, 1998, 1999, 2000, 2001],
    category: 'body',
    title: 'Rear-Hatch Strut',
    formerClaim:
      'six-year hatch-strut failure, direct part-number replacement and aftermarket product recommendation',
    diagnosis:
      'Inspect both supports, hinges and mounting points and identify the exact body and installed part before selecting a repair.',
  }),
  'audi-a4-avant-b5-rear-window-regulator-clip-failure': archived({
    years: [1996, 1997, 1998, 1999, 2000, 2001],
    category: 'body',
    title: 'Rear-Window Regulator',
    formerClaim:
      'six-year regulator-clip failure and direct regulator shopping recommendation',
    diagnosis:
      'Confirm whether the fault is in the glass attachment, regulator, guide, wiring or motor before authorizing parts.',
  }),
  'audi-a4-avant-bosch-abs-5-3-module-failure': archived({
    years: [1998, 1999, 2000, 2001],
    category: 'brakes',
    title: 'ABS-Module',
    formerClaim:
      'four-year Bosch ABS 5.3 module-failure diagnosis and direct replacement-module recommendation',
    diagnosis:
      'Read the ABS controller, verify power, ground, communication and wheel-speed inputs, and match the installed controller before repair.',
  }),
  'audi-a4-avant-cargo-cover-latch-2009': archived({
    years: [
      2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019,
      2020, 2021, 2022, 2023, 2024, 2025,
    ],
    category: 'body',
    title: 'Cargo-Cover Latch',
    formerClaim:
      '17-year cargo-cover latch failure and one-size-fits-all direct replacement part',
    diagnosis:
      'Inspect the exact cargo cover, trim attachment and body generation and verify the VIN-specific part before replacement.',
  }),
  'audi-a4-avant-cvt-multitronic-2002': archived({
    years: [2002, 2003, 2004, 2005, 2006, 2007, 2008],
    category: 'transmission',
    title: 'Multitronic CVT',
    formerClaim:
      'seven-year Multitronic failure, universal fluid and filter prescription across unspecified drivetrains',
    diagnosis:
      'Identify the transmission code, scan the transmission controller, reproduce the symptom and use the exact Audi repair and fluid specification.',
  }),
  'audi-a4-avant-nadi-takata-airbag-recall-69ae': {
    disposition: 'recall-dealer',
    decision:
      'Retain the frozen 1999-2000 A4 Avant window but correct the obsolete 69AE label to current Audi campaign 69BT / NHTSA 20V056. Keep the action VIN-first and dealer-only.',
    evidence: [
      {
        label:
          'Audi recall circular 69BT identifies the NADI driver-airbag inflator hazard, says 69BT replaces 69AE and requires an open-action VIN check before free inflator replacement',
        url: citations.nadi.url,
      },
    ],
    after: {
      years: [1999, 2000],
      trims: [],
      engines: [],
      category: 'safety',
      title:
        '1999-2000 Audi A4 Avant NADI Driver-Airbag Recall 69BT / NHTSA 20V056',
      description:
        'Audi campaign 69BT / NHTSA 20V056 covers certain older A4 vehicles equipped with a Non-Azide Driver Inflator. Moisture may enter the inflator and cause the driver airbag not to inflate properly in a crash. Audi renamed the action from 69AE to 69BT. This card retains the frozen catalog window of 1999-2000 A4 Avant vehicles, but eligibility is determined only by VIN and open-campaign status.',
      solution:
        'Check the VIN and campaign-completion history with Audi or NHTSA. If campaign 69BT is open, an authorized Audi dealer replaces the driver-airbag inflator at no charge. Do not open, test or replace an airbag inflator yourself.',
      severity: 'high',
      confidence: 'high',
      source: 'nhtsa-verified',
      symptoms: [],
      affectedSystems: [
        'driver frontal airbag',
        'Non-Azide Driver Inflator',
      ],
      dtcCodes: [],
      citations: [citations.nadi],
      summary:
        'Corrected the former 69AE label to current campaign 69BT / NHTSA 20V056 and retained only the VIN-gated free dealer remedy.',
    },
  },
  'audi-a4-avant-panoramic-sunroof-drain-2009': archived({
    years: [2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016],
    category: 'body',
    title: 'Panoramic-Sunroof Drain',
    formerClaim:
      'eight-year sunroof-drain blockage, corrosion, body-filler repair and direct cassette/trim tool recommendations',
    diagnosis:
      'Water-test the roof, locate the actual entry path and inspect drains, seals, cassette, body seams and interior modules before repair.',
  }),
  'audi-a4-avant-rear-shock-mount-2009': archived({
    years: [
      2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019,
      2020, 2021, 2022, 2023, 2024, 2025,
    ],
    category: 'suspension',
    title: 'Rear-Shock Mount',
    formerClaim:
      '17-year rear-shock-mount failure and direct mount, strut and brand recommendations across multiple generations',
    diagnosis:
      'Road-test and inspect the rear dampers, mounts, springs, bushings and fasteners, then match parts to VIN and suspension code.',
  }),
};

const expectedIds = [
  'audi-a4-avant-b5-rear-hatch-strut-failure',
  'audi-a4-avant-b5-rear-window-regulator-clip-failure',
  'audi-a4-avant-bosch-abs-5-3-module-failure',
  'audi-a4-avant-cargo-cover-latch-2009',
  'audi-a4-avant-cvt-multitronic-2002',
  'audi-a4-avant-nadi-takata-airbag-recall-69ae',
  'audi-a4-avant-panoramic-sunroof-drain-2009',
  'audi-a4-avant-rear-shock-mount-2009',
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
  label: 'Audi A4 Avant',
  make: 'Audi',
  model: 'A4 Avant',
  batchId: 'audi-a4-avant-full-record-cohort-1-2026-07-29',
  auditDate: '2026-07-29',
  snapshotHash:
    '3ee40713b2b5f1bd845d6118be79fc8486956e01d41eb5a8609a85aba77a5102',
  sourceSnapshotFileHash:
    '6e4c8d64ced097e83111d27c7f46e1f1c08b79dc40423fee81ebc9d9c54cd455',
  packetFileHash:
    'a4a2a03738a6e3cafd378555ca11214bf908f203123bee8c7cfe4292f15d95f5',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/audi-a4-avant/3ee40713b2b5/all-0001.json',
  reviewTokens: {
    blind: 'a4_avant_blind_review:no-blocker',
    edge: 'a4_avant_edge_review:no-blocker',
  },
  expectedIds,
  records,
  expectedPerRecord: {
    'audi-a4-avant-b5-rear-hatch-strut-failure': expected(
      ['fixParts:0', 'communityRecommendations:0'],
      [
        'https://www.amazon.com/s?k=8D9827552&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=8D9827552',
        'https://www.ebay.com/sch/i.html?_nkw=8D9827552',
        'https://www.amazon.com/s?k=StrongArm+6526+Audi+A4+Avant&tag=au7o-20',
      ],
    ),
    'audi-a4-avant-b5-rear-window-regulator-clip-failure': expected(
      ['fixParts:0', 'communityRecommendations:0'],
      [
        'https://www.amazon.com/s?k=8D0837461&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=8D0837461',
        'https://www.ebay.com/sch/i.html?_nkw=8D0837461',
        'https://www.amazon.com/s?k=Audi+A4+B5+window+regulator+rear&tag=au7o-20',
      ],
    ),
    'audi-a4-avant-bosch-abs-5-3-module-failure': expected(
      ['fixParts:0'],
      [
        'https://www.amazon.com/s?k=8E0%20614%20111%20M&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=8E0%20614%20111%20M',
        'https://www.ebay.com/sch/i.html?_nkw=8E0%20614%20111%20M',
      ],
    ),
    'audi-a4-avant-cargo-cover-latch-2009': expected(
      ['fixParts:0', 'communityRecommendations:0'],
      [
        'https://www.amazon.com/s?k=8W9863553B%20(94H%20black)&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=8W9863553B%20(94H%20black)',
        'https://www.ebay.com/sch/i.html?_nkw=8W9863553B%20(94H%20black)',
        'https://www.amazon.com/s?k=interior%20trim%20removal%20tool%20set%20automotive&tag=au7o-20',
      ],
    ),
    'audi-a4-avant-cvt-multitronic-2002': expected(
      ['communityRecommendations:0', 'communityRecommendations:1'],
      [
        'https://www.amazon.com/s?k=Valvoline%20CVT%20fluid%20Audi%20A4%20Avant&tag=au7o-20',
        'https://www.amazon.com/s?k=Audi%20A4%20Avant%20CVT%20transmission%20filter%20kit&tag=au7o-20',
      ],
    ),
    'audi-a4-avant-nadi-takata-airbag-recall-69ae': expected([], []),
    'audi-a4-avant-panoramic-sunroof-drain-2009': expected(
      [
        'fixParts:0',
        'communityRecommendations:1',
        'communityRecommendations:2',
      ],
      [
        'https://www.amazon.com/s?k=8K9877201&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=8K9877201',
        'https://www.ebay.com/sch/i.html?_nkw=8K9877201',
        'https://www.amazon.com/s?k=trim%20removal%20tool%20set%20automotive&tag=au7o-20',
        'https://www.amazon.com/s?k=Bondo%20body%20filler%20kit&tag=au7o-20',
      ],
    ),
    'audi-a4-avant-rear-shock-mount-2009': expected(
      ['fixParts:0', 'communityRecommendations:0', 'communityRecommendations:1'],
      [
        'https://www.amazon.com/s?k=8K0513353E&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=8K0513353E',
        'https://www.ebay.com/sch/i.html?_nkw=8K0513353E',
        'https://www.amazon.com/s?k=Monroe%20Quick-Strut%20Audi%20A4%20Avant&tag=au7o-20',
        'https://www.amazon.com/s?k=Moog%20strut%20mount%20Audi%20A4%20Avant&tag=au7o-20',
      ],
    ),
  },
  expectedTelemetry: {
    claimCount: 15,
    urlCount: 27,
    claimClickCount: 0,
    recordClickCount: 0,
    priorityClickCount: 0,
  },
  expectedDispositionCounts: {
    remove: 7,
    'recall-dealer': 1,
  },
  expectedPublished: 1,
  expectedArchived: 7,
  controlledDeltaProposals: [],
  expectedProposalIdentities: [],
  assertReviewedAfterState(issues) {
    const byId = new Map(issues.map((issue) => [issue.id, issue.after]));
    if (
      JSON.stringify(
        byId.get('audi-a4-avant-nadi-takata-airbag-recall-69ae').years,
      ) !== JSON.stringify([1999, 2000]) ||
      issues.filter((issue) => issue.after.status === 'archived').length !== 7
    ) {
      throw new Error(
        'Audi A4 Avant campaign scope or published/archived split drifted after review.',
      );
    }
  },
};
