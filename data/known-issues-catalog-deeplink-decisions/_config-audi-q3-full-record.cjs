const cite = (type, title, url) => ({ type, title, url });
const recallUrl = (year) =>
  `https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=Q3&modelYear=${year}`;

const citations = {
  brakePedal: cite(
    'recall',
    'NHTSA 20V786 / Audi 46i7 - 2020 Q3 Brake-Pedal Plate',
    recallUrl(2020),
  ),
  rearCamera: cite(
    'recall',
    'NHTSA 22V806 / Audi 91Ei - 2022 Q3 Infotainment Main Unit and Rearview Camera',
    recallUrl(2022),
  ),
  sunroof: cite(
    'recall',
    'NHTSA 15V200 / Audi 60C1 - 2015 Q3 Sunroof-Control Software',
    recallUrl(2015),
  ),
  steering: cite(
    'recall',
    'NHTSA 21V027 / Audi 48P7 - 2019 Q3 Steering-Rack Circlip',
    recallUrl(2019),
  ),
  waterPumpFirstGen: cite(
    'tsb',
    'Audi TSB 2061604/5 - 2012-2018 Q3 Coolant Thermostat Housing/Coolant Pump Leak',
    'https://static.nhtsa.gov/odi/tsbs/2022/MC-10226246-0001.pdf',
  ),
  waterPumpSecondGen: cite(
    'tsb',
    'Audi TSB 2071515/1 - 2020-2024 Q3 2.0 TFSI Coolant-Pump Leak',
    'https://static.nhtsa.gov/odi/tsbs/2023/MC-10242918-0001.pdf',
  ),
  inventory2015: cite(
    'nhtsa',
    'NHTSA 2015 Audi Q3 Recall Inventory',
    recallUrl(2015),
  ),
};

const archived = ({
  years,
  category,
  title,
  formerClaim,
  diagnosis,
  citation = citations.inventory2015,
}) => ({
  disposition: 'remove',
  decision:
    `Archive the unsupported ${formerClaim}. No exact Audi or regulator primary source establishes the frozen row's complete Q3 model-year, engine, symptom, DTC, prevalence, replacement, interval and prevention bundle. Remove every commerce claim and URL.`,
  evidence: [
    {
      label:
        'Official Audi/regulator material establishes narrower campaign- or symptom-gated Q3 paths and does not establish this universal replacement narrative',
      url: citation.url,
    },
  ],
  after: {
    years,
    trims: [],
    engines: [],
    category,
    title: `Archived - Unsupported Audi Q3 ${title} Aggregation`,
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
      `Archived an unsupported Audi Q3 ${title.toLowerCase()} aggregation and removed broad failure, DTC, cost, interval, prevention and commerce claims.`,
  },
});

const recordSpecs = {
  'audi-q3-brake-pedal-recall-2019': {
    disposition: 'recall-dealer',
    decision:
      'Correct the frozen 2019-2020 range to exact 2020 Q3 recall 20V786 / Audi 46i7. Replace unrelated brake-pad and rotor shopping links with the VIN-first pedal-weld inspection and free dealer remedy.',
    evidence: [
      {
        label:
          'NHTSA 20V786 identifies certain 2020 Q3 vehicles whose brake-pedal plate can bend or detach during sudden stopping',
        url: citations.brakePedal.url,
      },
    ],
    after: {
      years: [2020],
      trims: [],
      engines: [],
      category: 'brakes',
      title: '2020 Audi Q3 Brake-Pedal Recall 46i7 / NHTSA 20V786',
      description:
        'NHTSA campaign 20V786 / Audi 46i7 covers certain 2020 Audi Q3 vehicles. The brake-pedal plate can bend or detach from the pedal under the pressure of sudden stopping, reducing the contact area for the driver’s foot and increasing crash risk. Eligibility is VIN-specific.',
      solution:
        'Check the VIN and campaign-completion history with Audi or NHTSA. The free recall remedy inspects the weld between the pedal and pedal plate and replaces the complete brake pedal when required. Do not buy pads or rotors for this campaign; if the pedal feels loose, bent or abnormal, stop driving and arrange dealer inspection.',
      severity: 'high',
      confidence: 'high',
      source: 'nhtsa-verified',
      symptoms: [
        'Brake-pedal plate bends or moves under heavy pressure',
        'Reduced foot contact area during emergency braking',
      ],
      affectedSystems: ['brake pedal', 'brake-pedal plate weld'],
      dtcCodes: [],
      citations: [citations.brakePedal],
      summary:
        'Corrected the scope to exact 2020 recall 20V786 / 46i7 and removed two unrelated brake-commerce claims.',
    },
  },
  'audi-q3-carbon-buildup-2015': archived({
    years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023],
    category: 'engine',
    title: 'Carbon-Buildup',
    formerClaim:
      'nine-year universal direct-injection intake-valve carbon, fixed-mileage walnut-blasting, fuel-additive and catch-can narrative',
    diagnosis:
      'Reproduce the concern, inspect misfire data and perform the applicable Audi engine-specific diagnosis before authorizing intake cleaning or modifications.',
  }),
  'audi-q3-electrical-infotainment-2019': {
    disposition: 'recall-dealer',
    decision:
      'Replace the incorrect 2019-2023 electrical/infotainment aggregation and false 20V611 citation with exact 2022 Q3 recall 22V806 / Audi 91Ei. Remove the refurbished-unit shopping link.',
    evidence: [
      {
        label:
          'NHTSA 22V806 identifies certain 2022 Q3 infotainment main units that can be internally damaged after shutdown and leave the next-start rearview-camera display inoperative',
        url: citations.rearCamera.url,
      },
    ],
    after: {
      years: [2022],
      trims: [],
      engines: [],
      category: 'electrical',
      title: '2022 Audi Q3 Rearview-Camera Recall 91Ei / NHTSA 22V806',
      description:
        'NHTSA campaign 22V806 / Audi 91Ei covers certain 2022 Audi Q3 vehicles. The infotainment main unit can be damaged internally when the vehicle is switched off, leaving the rearview-camera image inoperative the next time the vehicle starts. Loss of the required rear image reduces visibility while reversing. Eligibility is VIN-specific.',
      solution:
        'Check the VIN and campaign-completion history with Audi or NHTSA. The recall remedy replaces the infotainment main unit at no charge. Until repaired, use mirrors and direct observation with extra care while reversing; do not order a refurbished head unit from this summary.',
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
        'Replaced a broad electrical card and false 20V611 citation with exact 2022 recall 22V806 / 91Ei; removed its commerce link.',
    },
  },
  'audi-q3-oil-consumption-2015': archived({
    years: [2015, 2016, 2017, 2018],
    category: 'engine',
    title: 'Oil-Consumption/Piston-Ring',
    formerClaim:
      'four-year piston-ring and PCV oil-consumption claim with fixed thresholds, teardown, replacement parts, additives and catch-can prevention',
    diagnosis:
      'Document oil level and consumption using Audi’s specified test procedure, inspect for external leaks and crankcase-ventilation faults, and confirm the engine code before authorizing internal repair.',
  }),
  'audi-q3-panoramic-roof-2015': {
    disposition: 'recall-dealer',
    decision:
      'Replace the broad 2015-2023 panoramic-roof electrical and battery aggregation with exact 2015 sunroof-control recall 15V200 / Audi 60C1. Remove five unrelated battery, relay and multimeter commerce links.',
    evidence: [
      {
        label:
          'NHTSA 15V200 states that certain 2015 Q3 sunroofs may continue closing after vehicle shutdown and specifies control-module software',
        url: citations.sunroof.url,
      },
    ],
    after: {
      years: [2015],
      trims: [],
      engines: [],
      category: 'body',
      title: '2015 Audi Q3 Sunroof-Control Recall 60C1 / NHTSA 15V200',
      description:
        'NHTSA campaign 15V200 / Audi 60C1 covers certain 2015 Audi Q3 vehicles manufactured from April 4 through November 5, 2014. If the vehicle is switched off while the sunroof is closing, the panel may continue moving instead of stopping, increasing injury risk for an occupant in its path. Eligibility is VIN-specific.',
      solution:
        'Check the VIN and campaign-completion history with Audi or NHTSA. The recall remedy updates the sunroof control-module software at no charge. Keep hands and objects clear of the moving panel and do not use battery, relay or generic electrical parts as a substitute for the campaign.',
      severity: 'high',
      confidence: 'high',
      source: 'nhtsa-verified',
      symptoms: [
        'Sunroof continues closing after the vehicle is switched off',
        'Sunroof does not stop as expected during shutdown',
      ],
      affectedSystems: ['sunroof control module', 'power-operated roof panel'],
      dtcCodes: [],
      citations: [citations.sunroof],
      summary:
        'Narrowed the panoramic-roof card to exact 2015 recall 15V200 / 60C1 and removed five unrelated electrical-commerce claims.',
    },
  },
  'audi-q3-steering-lock-recall-2019': {
    disposition: 'recall-dealer',
    decision:
      'Replace the false 20V556 citation and two-year scope with exact NHTSA 21V027 / Audi 48P7 for one 2019 Q3. Keep the unusually small population explicit and VIN-first.',
    evidence: [
      {
        label:
          'NHTSA 21V027 identifies one 2019 Q3 with a belt-pulley production deviation that can prevent steering-rack circlip engagement',
        url: citations.steering.url,
      },
    ],
    after: {
      years: [2019],
      trims: [],
      engines: [],
      category: 'steering',
      title: '2019 Audi Q3 Steering-Rack Recall 48P7 / NHTSA 21V027',
      description:
        'NHTSA campaign 21V027 / Audi 48P7 covers one 2019 Audi Q3 in the United States. A production deviation in the belt pulley can prevent its circlip from engaging correctly; the circlip can detach, catch surrounding components and lock the steering. This is a one-vehicle, VIN-specific campaign, not a general 2019-2020 Q3 defect.',
      solution:
        'Check the VIN and campaign history with Audi or NHTSA. The recall remedy replaces the steering rack at no charge. If steering binds or locks, stop driving and arrange recovery; do not infer that another Q3 is affected from model year alone.',
      severity: 'high',
      confidence: 'high',
      source: 'nhtsa-verified',
      symptoms: [
        'Steering binds or locks',
        'Sudden inability to turn the steering wheel',
      ],
      affectedSystems: [
        'steering rack',
        'belt pulley',
        'retaining circlip',
      ],
      dtcCodes: [],
      citations: [citations.steering],
      summary:
        'Corrected the false 20V556 citation to the one-vehicle 2019 Q3 campaign 21V027 / 48P7.',
    },
  },
  'audi-q3-timing-chain-2015': archived({
    years: [2015, 2016, 2017, 2018],
    category: 'engine',
    title: 'Timing-Chain',
    formerClaim:
      'four-year timing-chain stretch, guide, cam-crank correlation, fixed-mileage inspection and direct kit replacement narrative',
    diagnosis:
      'Confirm the engine code, reproduce any cold-start noise, compare cam/crank adaptation data and follow the applicable Audi repair information before condemning chain components.',
  }),
  'audi-q3-timing-chain-tensioner-2015': archived({
    years: [2015, 2016, 2017, 2018, 2019, 2020],
    category: 'engine',
    title: 'Timing-Chain Tensioner',
    formerClaim:
      'overlapping six-year tensioner, chain-jump, four-DTC, fixed-mileage, complete-kit and warranty-shopping narrative',
    diagnosis:
      'Confirm the exact engine and tensioner revision, reproduce the concern and follow cam/crank correlation and mechanical timing tests before selecting a repair.',
  }),
  'audi-q3-water-pump-2015': {
    disposition: 'diagnosis-hold',
    decision:
      'Replace the broad 2015-2023 pump-failure and direct-parts card with exact Audi TSB 2061604/5 for 2015-2018 Q3 vehicles within this catalog. Retain only pressure-confirmed leakage and replace only the leaking pump or thermostat housing.',
    evidence: [
      {
        label:
          'Audi TSB 2061604/5 covers 2012-2018 Q3 vehicles, requires a pressure check and says to replace only the leaking coolant pump or thermostat housing',
        url: citations.waterPumpFirstGen.url,
      },
    ],
    after: {
      years: [2015, 2016, 2017, 2018],
      trims: [],
      engines: ['2.0 TFSI'],
      category: 'cooling',
      title: '2015-2018 Audi Q3 Coolant-Module Leak TSB 2061604/5',
      description:
        'Audi TSB 2061604/5 applies to 2012-2018 Q3 vehicles; this card retains the catalog’s 2015-2018 range. The supported condition is reproducible coolant loss around the coolant thermostat housing or coolant pump, with a coolant warning lamp or visible coolant marks. The bulletin does not establish that every Q3 needs the complete module.',
      solution:
        'Pressure-test the cooling system and document the leak. Replace only the component that is leaking—the coolant pump or thermostat housing—then align the two components flush, torque the connecting bolts as specified and verify the pump-belt tension is within Audi’s procedure. Confirm current parts and warranty coverage with Audi; do not order by model year alone.',
      severity: 'medium',
      confidence: 'high',
      source: 'nhtsa-verified',
      symptoms: [
        'Coolant warning lamp illuminated',
        'Visible coolant marks below the engine compartment',
        'Reproducible leak near the pump or thermostat housing',
      ],
      affectedSystems: [
        'coolant pump',
        'coolant thermostat housing',
        'coolant-pump toothed belt',
      ],
      dtcCodes: [],
      citations: [citations.waterPumpFirstGen],
      summary:
        'Narrowed the first-generation card to Audi TSB 2061604/5, pressure-confirmed 2015-2018 leakage and replacement of only the leaking component; removed two commerce claims with four URLs.',
    },
  },
  'audi-q3-water-pump-coolant-2015': {
    disposition: 'diagnosis-hold',
    decision:
      'Replace the overlapping 2015-2023 water-pump/thermostat and direct-parts narrative with exact Audi TSB 2071515/1 for 2020-2024 Q3 2.0 TFSI vehicles. Retain the clean/dry/refill/recheck gate before replacement.',
    evidence: [
      {
        label:
          'Audi TSB 2071515/1 covers 2020-2024 Q3 2.0 TFSI coolant-pump leakage and requires reassessment before replacing the component causing the leak',
        url: citations.waterPumpSecondGen.url,
      },
    ],
    after: {
      years: [2020, 2021, 2022, 2023, 2024],
      trims: [],
      engines: ['2.0 TFSI'],
      category: 'cooling',
      title: '2020-2024 Audi Q3 Coolant-Pump Leak TSB 2071515/1',
      description:
        'Audi TSB 2071515/1 covers 2020-2024 Q3 vehicles with a 2.0 TFSI engine when coolant loss, a visible leak or the coolant warning lamp can be assigned to the coolant pump. Audi warns that an apparent level drop can instead follow incomplete bleeding during production or a prior repair, so the leak must be located precisely.',
      solution:
        'Document the suspected leak, clean and dry all coolant traces, fill the system to the correct level and reassess after driving a few miles. If no fresh leak returns, continue observing without replacing parts. If leakage recurs, replace only the component causing it under the exact VIN, engine and part criteria. Outside applicable warranty, Audi states the bulletin is informational.',
      severity: 'medium',
      confidence: 'high',
      source: 'nhtsa-verified',
      symptoms: [
        'Coolant loss or visible coolant leak',
        'Coolant warning lamp illuminated',
      ],
      affectedSystems: ['2.0 TFSI coolant pump', 'engine cooling system'],
      dtcCodes: [],
      citations: [citations.waterPumpSecondGen],
      summary:
        'Separated the second-generation card into exact 2020-2024 TSB 2071515/1 diagnosis and removed three commerce claims with five URLs.',
    },
  },
};

const expectedIds = [
  'audi-q3-brake-pedal-recall-2019',
  'audi-q3-carbon-buildup-2015',
  'audi-q3-electrical-infotainment-2019',
  'audi-q3-oil-consumption-2015',
  'audi-q3-panoramic-roof-2015',
  'audi-q3-steering-lock-recall-2019',
  'audi-q3-timing-chain-2015',
  'audi-q3-timing-chain-tensioner-2015',
  'audi-q3-water-pump-2015',
  'audi-q3-water-pump-coolant-2015',
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
  label: 'Audi Q3',
  make: 'Audi',
  model: 'Q3',
  batchId: 'audi-q3-full-record-cohort-1-2026-07-29',
  auditDate: '2026-07-29',
  snapshotHash:
    '3ee40713b2b5f1bd845d6118be79fc8486956e01d41eb5a8609a85aba77a5102',
  sourceSnapshotFileHash:
    '6e4c8d64ced097e83111d27c7f46e1f1c08b79dc40423fee81ebc9d9c54cd455',
  packetFileHash:
    '7de55ff3e1c0237768d67b36cb526042ee730afe8d644a08ae5e84076d2fa32c',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/audi-q3/3ee40713b2b5/all-0001.json',
  reviewTokens: {
    blind: 'q3_blind_review:no-blocker',
    edge: 'q3_edge_review:no-blocker',
  },
  expectedIds,
  records,
  expectedPerRecord: {
    'audi-q3-brake-pedal-recall-2019': expected(
      ['communityRecommendations:4', 'communityRecommendations:5'],
      [
        'https://www.amazon.com/s?k=Wagner%20ThermoQuiet%20ceramic%20brake%20pads%20Audi%20Q3&tag=au7o-20',
        'https://www.amazon.com/s?k=StopTech%20drilled%20slotted%20brake%20rotor%20Audi%20Q3&tag=au7o-20',
      ],
    ),
    'audi-q3-carbon-buildup-2015': expected(
      ['communityRecommendations:1'],
      [
        'https://www.amazon.com/s?k=034%20Motorsport%20034-101-1010&tag=au7o-20',
      ],
    ),
    'audi-q3-electrical-infotainment-2019': expected(
      ['communityRecommendations:2'],
      [
        'https://www.amazon.com/s?k=Genuine%20VW%2FAudi%20MIB3%20Infotainment%20Unit%20(Refurbished)&tag=au7o-20',
      ],
    ),
    'audi-q3-oil-consumption-2015': expected(
      ['fixParts:0', 'communityRecommendations:0', 'communityRecommendations:1'],
      [
        'https://www.amazon.com/s?k=06H107065DM&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=06H107065DM',
        'https://www.ebay.com/sch/i.html?_nkw=06H107065DM',
        'https://www.amazon.com/s?k=Kolbenschmidt%2006H107065DD&tag=au7o-20',
        'https://www.amazon.com/s?k=Dorman%20917-064&tag=au7o-20',
      ],
    ),
    'audi-q3-panoramic-roof-2015': expected(
      [
        'communityRecommendations:2',
        'communityRecommendations:3',
        'communityRecommendations:4',
        'communityRecommendations:5',
        'communityRecommendations:6',
      ],
      [
        'https://www.amazon.com/s?k=Optima%20RedTop%20AGM%20Battery%20Audi%20Q3&tag=au7o-20',
        'https://www.amazon.com/s?k=ACDelco%20Professional%20AGM%20Battery%20Audi%20Q3&tag=au7o-20',
        'https://www.amazon.com/s?k=Battery%20Tender%20Junior%2012V%20Battery%20Charger%20Maintainer%20Audi%20Q3&tag=au7o-20',
        'https://www.amazon.com/s?k=Bosch%20Automotive%20Relay%205-Pin%2012V%20Audi%20Q3&tag=au7o-20',
        'https://www.amazon.com/s?k=Innova%20Digital%20Multimeter%20Audi%20Q3&tag=au7o-20',
      ],
    ),
    'audi-q3-steering-lock-recall-2019': expected([], []),
    'audi-q3-timing-chain-2015': expected(
      ['fixParts:0', 'communityRecommendations:0'],
      [
        'https://www.amazon.com/s?k=06K109467K&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=06K109467K',
        'https://www.ebay.com/sch/i.html?_nkw=06K109467K',
        'https://www.amazon.com/s?k=Genuine%20VW%2FAudi%2006K109467K&tag=au7o-20',
      ],
    ),
    'audi-q3-timing-chain-tensioner-2015': expected(
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
        'https://www.amazon.com/s?k=FCP%20Euro%20Lifetime%20Warranty%20Coverage&tag=au7o-20',
      ],
    ),
    'audi-q3-water-pump-2015': expected(
      ['fixParts:0', 'communityRecommendations:0'],
      [
        'https://www.amazon.com/s?k=06H121026ED&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=06H121026ED',
        'https://www.ebay.com/sch/i.html?_nkw=06H121026ED',
        'https://www.amazon.com/s?k=Graf%20PA1094%20water%20pump%20Audi&tag=au7o-20',
      ],
    ),
    'audi-q3-water-pump-coolant-2015': expected(
      ['fixParts:0', 'communityRecommendations:0', 'communityRecommendations:1'],
      [
        'https://www.amazon.com/s?k=06L121111H&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=06L121111H',
        'https://www.ebay.com/sch/i.html?_nkw=06L121111H',
        'https://www.amazon.com/s?k=Genuine%20VW%2FAudi%2006L121111P&tag=au7o-20',
        'https://www.amazon.com/s?k=Hepu%20P672&tag=au7o-20',
      ],
    ),
  },
  expectedTelemetry: {
    claimCount: 23,
    urlCount: 33,
    claimClickCount: 0,
    recordClickCount: 0,
    priorityClickCount: 0,
  },
  expectedDispositionCounts: {
    'recall-dealer': 4,
    remove: 4,
    'diagnosis-hold': 2,
  },
  expectedPublished: 6,
  expectedArchived: 4,
  controlledDeltaProposals: [],
  expectedProposalIdentities: [],
  assertReviewedAfterState(issues) {
    const byId = new Map(issues.map((issue) => [issue.id, issue.after]));
    if (
      JSON.stringify(
        byId.get('audi-q3-brake-pedal-recall-2019').years,
      ) !== JSON.stringify([2020]) ||
      JSON.stringify(
        byId.get('audi-q3-electrical-infotainment-2019').years,
      ) !== JSON.stringify([2022]) ||
      JSON.stringify(
        byId.get('audi-q3-panoramic-roof-2015').years,
      ) !== JSON.stringify([2015]) ||
      JSON.stringify(
        byId.get('audi-q3-steering-lock-recall-2019').years,
      ) !== JSON.stringify([2019]) ||
      JSON.stringify(byId.get('audi-q3-water-pump-2015').years) !==
        JSON.stringify([2015, 2016, 2017, 2018]) ||
      JSON.stringify(
        byId.get('audi-q3-water-pump-coolant-2015').years,
      ) !== JSON.stringify([2020, 2021, 2022, 2023, 2024]) ||
      issues.filter((issue) => issue.after.status === 'archived').length !== 4
    ) {
      throw new Error(
        'Audi Q3 campaign/TSB scopes or published/archived split drifted after review.',
      );
    }
  },
};
