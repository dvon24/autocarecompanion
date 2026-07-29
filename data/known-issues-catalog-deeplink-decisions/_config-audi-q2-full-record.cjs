const cite = (type, title, url) => ({ type, title, url });

const citations = {
  parkingBrake: cite(
    'recall',
    'UK DVSA Audi Q2 2017 Recalls - R/2018/295 Parking-Brake Software',
    'https://www.check-vehicle-recalls.service.gov.uk/recall-type/vehicle/make/AUDI/model/Q2/year/2017/recalls',
  ),
  rearHub: cite(
    'recall',
    'UK DVSA Audi Q2 2017 Recalls - R/2017/311 Rear Wheel-Bearing Housings',
    'https://www.check-vehicle-recalls.service.gov.uk/recall-type/vehicle/make/AUDI/model/Q2/year/2017/recalls',
  ),
  fuseCarrier: cite(
    'recall',
    'Japan MLIT GAI-3692 - Audi Q2/SQ2 Interior Fuse-Carrier Power Connector',
    'https://www.mlit.go.jp/en/jidosha/content/001709563.pdf',
  ),
  inventory: cite(
    'recall',
    'UK DVSA Audi Q2 2018 Recall Inventory',
    'https://www.check-vehicle-recalls.service.gov.uk/recall-type/vehicle/make/AUDI/model/Q2/year/2018/recalls',
  ),
};

const archived = ({
  years,
  category,
  title,
  formerClaim,
  diagnosis,
  citation = citations.inventory,
}) => ({
  disposition: 'remove',
  decision:
    `Archive the unsupported ${formerClaim}. No exact Audi or regulator primary source establishes the frozen row's complete Q2 model-year, powertrain, symptom, DTC, prevalence, replacement, interval and prevention bundle. Remove every commerce claim and URL.`,
  evidence: [
    {
      label:
        'Official regulator recall material establishes narrower VIN- and campaign-gated Q2 conditions, not this universal failure narrative',
      url: citation.url,
    },
  ],
  after: {
    years,
    trims: [],
    engines: [],
    category,
    title: `Archived - Unsupported Audi Q2 ${title} Aggregation`,
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
    citations: [citation],
    summary:
      `Archived an unsupported Audi Q2 ${title.toLowerCase()} aggregation and removed broad failure, DTC, cost, interval, prevention and commerce claims.`,
  },
});

const recordSpecs = {
  'audi-q2-coolant-water-pump-leak-tfsi-engines': archived({
    years: [2016, 2017, 2018, 2019, 2020, 2021],
    category: 'cooling',
    title: 'TFSI Water-Pump/Thermostat',
    formerClaim:
      'six-year, four-engine plastic water-pump/thermostat cracking, two-DTC, overheating, timing-belt-risk and complete-module replacement narrative',
    diagnosis:
      'Pressure-test the cooling system, clean and dry the suspected area, identify the exact leaking component and confirm the engine/build data before authorizing a repair.',
  }),
  'audi-q2-diesel-particulate-filter-clogging-tdi-engines-used-short-tr':
    archived({
      years: [2016, 2017, 2018, 2019, 2020],
      category: 'emissions',
      title: 'TDI DPF/Short-Trip',
      formerClaim:
        'five-year TDI short-trip DPF clogging, forced-regeneration, oil-dilution, cleaning and replacement narrative',
      diagnosis:
        'Read measured soot and ash load, differential pressure, temperature data and stored faults before choosing a regeneration, cleaning or component repair.',
    }),
  'audi-q2-electro-mechanical-parking-brake-can-release-its-own': {
    disposition: 'recall-dealer',
    decision:
      'Retain the parking-brake card and narrow it to UK recall R/2018/295 / Audi 45H4 for affected 2017-2018 Q2 vehicles. Remove the unsupported universal-build language and keep the remedy VIN-first.',
    evidence: [
      {
        label:
          'DVSA R/2018/295 states that the electro-mechanical parking brake can release inappropriately and specifies a brake-control-unit software update',
        url: citations.parkingBrake.url,
      },
    ],
    after: {
      years: [2017, 2018],
      trims: [],
      engines: [],
      category: 'brakes',
      title: '2017-2018 Audi Q2 Parking-Brake Software Recall 45H4',
      description:
        'UK DVSA recall R/2018/295 covers affected 2017-2018 Audi Q2 vehicles whose electro-mechanical parking brake can release inappropriately. The campaign is VIN-specific and does not establish that every Q2 in those model years is affected.',
      solution:
        'Check the VIN and campaign-completion history with Audi. The recall remedy is an authorised-dealer software update to the brake control unit. Until eligibility and completion are confirmed, leave the transmission in gear or Park and avoid relying on the parking brake alone on a slope.',
      severity: 'high',
      confidence: 'high',
      source: 'manual',
      symptoms: [
        'Electro-mechanical parking brake releases unexpectedly',
        'Vehicle may roll after being parked',
      ],
      affectedSystems: [
        'electro-mechanical parking brake',
        'brake control unit software',
      ],
      dtcCodes: [],
      citations: [citations.parkingBrake],
      summary:
        'Narrowed the row to VIN-gated UK recall R/2018/295 / Audi 45H4 for 2017-2018 Q2 brake-control software.',
    },
  },
  'audi-q2-fuse-carrier-power-connector-recall-engine-instrument-cluste': {
    disposition: 'recall-dealer',
    decision:
      'Retain the fuse-carrier card but replace the unsupported 2019-2023 UK-wide population claim with Japan MLIT campaign GAI-3692 for affected 2021-2023 Q2 vehicles. Keep market and VIN scope explicit.',
    evidence: [
      {
        label:
          'Japan MLIT GAI-3692 identifies affected Q2 vehicles whose interior fuse-carrier supply connector can loosen and interrupt engine, display or lighting power',
        url: citations.fuseCarrier.url,
      },
    ],
    after: {
      years: [2021, 2022, 2023],
      trims: [],
      engines: ['35 TFSI', '35 TDI'],
      category: 'electrical',
      title: '2021-2023 Audi Q2 Interior Fuse-Carrier Recall GAI-3692',
      description:
        'Japan MLIT campaign GAI-3692 covers specified 2021-2023 Audi Q2 35 TFSI and 35 TDI vehicles. An incorrectly installed power-supply connector at the interior fuse carrier can work loose, interrupting electrical power to the engine, instrument display or lighting. Steering and braking remain available, but an engine shutdown or loss of lighting can increase crash risk. This published scope is market- and VIN-specific.',
      solution:
        'Check the VIN and open-campaign status with an authorised Audi dealer in the vehicle’s market. The campaign remedy is dealer inspection and correction of the fuse-carrier power connection. Do not replace a fuse box or wiring harness solely from a warning lamp or this model-year summary.',
      severity: 'high',
      confidence: 'high',
      source: 'manual',
      symptoms: [
        'Engine may switch off while driving',
        'Instrument display may lose power',
        'Exterior lighting may stop operating',
      ],
      affectedSystems: [
        'interior fuse carrier',
        'power-supply connector',
        'engine and lighting electrical supply',
      ],
      dtcCodes: [],
      citations: [citations.fuseCarrier],
      summary:
        'Corrected the row to Japan MLIT GAI-3692 for VIN-specific 2021-2023 Q2 35 TFSI/35 TDI fuse-carrier connections and removed unsupported UK population claims.',
    },
  },
  'audi-q2-mmi-infotainment-freezing-rebooting-intermittent-electrical':
    archived({
      years: [2016, 2017, 2018, 2019, 2020, 2021, 2022],
      category: 'electrical',
      title: 'MMI Freezing/Rebooting',
      formerClaim:
        'seven-year MMI freezing, rebooting, phone-data, manual-reset, software-update and head-unit replacement aggregation',
      diagnosis:
        'Record the exact symptom and software version, scan the infotainment network and follow the VIN-specific Audi diagnostic plan before resetting or replacing a module.',
    }),
  'audi-q2-premature-timing-belt-failure-1-0-1-4-tfsi-petrol-engines':
    archived({
      years: [2016, 2017, 2018, 2019, 2020, 2021],
      category: 'engine',
      title: 'Premature TFSI Timing-Belt',
      formerClaim:
        'six-year 1.0/1.4 TFSI premature belt-failure, start-stop causation, 40,000-50,000-mile preventive interval, full kit and engine-replacement narrative',
      diagnosis:
        'Confirm the exact engine code, service schedule, belt condition, tensioner alignment and any campaign or warranty status before setting an interval or replacing components.',
    }),
  'audi-q2-rear-hub-carrier-fracture-recall': {
    disposition: 'recall-dealer',
    decision:
      'Retain and narrow the rear-hub card to the exact 2017 Q2 DVSA campaign R/2017/311. Remove vague multi-year wording and keep the small affected population VIN-gated.',
    evidence: [
      {
        label:
          'DVSA R/2017/311 states that incorrectly hardened rear wheel-bearing housings can fracture and specifies replacement of both rear housings',
        url: citations.rearHub.url,
      },
    ],
    after: {
      years: [2017],
      trims: [],
      engines: [],
      category: 'suspension',
      title: '2017 Audi Q2 Rear Wheel-Bearing Housing Recall R/2017/311',
      description:
        'UK DVSA recall R/2017/311 covers a small VIN-specific population of 2017 Audi Q2 vehicles whose rear wheel-bearing housings may not have received the correct hardening treatment. A housing can deform or fracture, causing noise, abnormal tyre wear and, in the most severe theoretical case, wheel separation.',
      solution:
        'Check the VIN and campaign-completion history with Audi. The recall remedy replaces both rear wheel-bearing housings at an authorised dealer. If rear-wheel noise, looseness or unusual tyre wear is present, avoid continued driving until the vehicle is inspected.',
      severity: 'high',
      confidence: 'high',
      source: 'manual',
      symptoms: [
        'Noise from a rear wheel',
        'Abnormal rear tyre wear',
        'Rear-wheel looseness or instability',
      ],
      affectedSystems: [
        'rear wheel-bearing housings',
        'rear hub carriers',
      ],
      dtcCodes: [],
      citations: [citations.rearHub],
      summary:
        'Narrowed the card to exact 2017 DVSA recall R/2017/311 and its both-rear-housing dealer remedy.',
    },
  },
  'audi-q2-s-tronic-dual-clutch-transmission-jerking-hesitation-delayed':
    archived({
      years: [2016, 2017, 2018, 2019, 2020, 2021, 2022],
      category: 'transmission',
      title: 'S tronic Jerking/Hesitation',
      formerClaim:
        'seven-year multi-transmission jerking, hesitation, clutch, mechatronic, fluid-service and replacement-part narrative',
      diagnosis:
        'Identify the transmission code and production data, reproduce the concern, scan the transmission controller and follow its exact fault-guided test plan before selecting software, clutch, fluid or mechatronic work.',
    }),
};

const expectedIds = [
  'audi-q2-coolant-water-pump-leak-tfsi-engines',
  'audi-q2-diesel-particulate-filter-clogging-tdi-engines-used-short-tr',
  'audi-q2-electro-mechanical-parking-brake-can-release-its-own',
  'audi-q2-fuse-carrier-power-connector-recall-engine-instrument-cluste',
  'audi-q2-mmi-infotainment-freezing-rebooting-intermittent-electrical',
  'audi-q2-premature-timing-belt-failure-1-0-1-4-tfsi-petrol-engines',
  'audi-q2-rear-hub-carrier-fracture-recall',
  'audi-q2-s-tronic-dual-clutch-transmission-jerking-hesitation-delayed',
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
  label: 'Audi Q2',
  make: 'Audi',
  model: 'Q2',
  batchId: 'audi-q2-full-record-cohort-1-2026-07-29',
  auditDate: '2026-07-29',
  snapshotHash:
    '3ee40713b2b5f1bd845d6118be79fc8486956e01d41eb5a8609a85aba77a5102',
  sourceSnapshotFileHash:
    '6e4c8d64ced097e83111d27c7f46e1f1c08b79dc40423fee81ebc9d9c54cd455',
  packetFileHash:
    '9d7d06915a50032f795982598d95c779e1fc80da5e6a95373e60fe598d44cab6',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/audi-q2/3ee40713b2b5/all-0001.json',
  reviewTokens: {
    blind: 'q2_blind_review:no-blocker',
    edge: 'q2_edge_review:no-blocker',
  },
  expectedIds,
  records,
  expectedPerRecord: {
    'audi-q2-coolant-water-pump-leak-tfsi-engines': expected(
      ['fixParts:0'],
      [
        'https://www.amazon.com/s?k=04E121600CS&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=04E121600CS',
        'https://www.ebay.com/sch/i.html?_nkw=04E121600CS',
      ],
    ),
    'audi-q2-diesel-particulate-filter-clogging-tdi-engines-used-short-tr':
      expected(
        ['fixParts:0'],
        [
          'https://www.amazon.com/s?k=04L131670AX&tag=au7o-20',
          'https://www.rockauto.com/en/partsearch/?q=04L131670AX',
          'https://www.ebay.com/sch/i.html?_nkw=04L131670AX',
        ],
      ),
    'audi-q2-electro-mechanical-parking-brake-can-release-its-own':
      expected([], []),
    'audi-q2-fuse-carrier-power-connector-recall-engine-instrument-cluste':
      expected([], []),
    'audi-q2-mmi-infotainment-freezing-rebooting-intermittent-electrical':
      expected([], []),
    'audi-q2-premature-timing-belt-failure-1-0-1-4-tfsi-petrol-engines':
      expected(
        ['fixParts:0'],
        [
          'https://www.amazon.com/s?k=04E198119A&tag=au7o-20',
          'https://www.rockauto.com/en/partsearch/?q=04E198119A',
          'https://www.ebay.com/sch/i.html?_nkw=04E198119A',
        ],
      ),
    'audi-q2-rear-hub-carrier-fracture-recall': expected([], []),
    'audi-q2-s-tronic-dual-clutch-transmission-jerking-hesitation-delayed':
      expected(
        ['fixParts:0'],
        [
          'https://www.amazon.com/s?k=0AM927769K&tag=au7o-20',
          'https://www.rockauto.com/en/partsearch/?q=0AM927769K',
          'https://www.ebay.com/sch/i.html?_nkw=0AM927769K',
        ],
      ),
  },
  expectedTelemetry: {
    claimCount: 4,
    urlCount: 12,
    claimClickCount: 0,
    recordClickCount: 0,
    priorityClickCount: 0,
  },
  expectedDispositionCounts: {
    remove: 5,
    'recall-dealer': 3,
  },
  expectedPublished: 3,
  expectedArchived: 5,
  controlledDeltaProposals: [],
  expectedProposalIdentities: [],
  assertReviewedAfterState(issues) {
    const byId = new Map(issues.map((issue) => [issue.id, issue.after]));
    if (
      JSON.stringify(
        byId.get(
          'audi-q2-electro-mechanical-parking-brake-can-release-its-own',
        ).years,
      ) !== JSON.stringify([2017, 2018]) ||
      JSON.stringify(
        byId.get(
          'audi-q2-fuse-carrier-power-connector-recall-engine-instrument-cluste',
        ).years,
      ) !== JSON.stringify([2021, 2022, 2023]) ||
      JSON.stringify(
        byId.get('audi-q2-rear-hub-carrier-fracture-recall').years,
      ) !== JSON.stringify([2017]) ||
      issues.filter((issue) => issue.after.status === 'archived').length !== 5
    ) {
      throw new Error(
        'Audi Q2 campaign scopes or published/archived split drifted after review.',
      );
    }
  },
};
