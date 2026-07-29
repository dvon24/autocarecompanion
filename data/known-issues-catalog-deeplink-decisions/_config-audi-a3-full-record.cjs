const cite = (type, title, url) => ({ type, title, url });
const recallUrl = (year) =>
  `https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=A3&modelYear=${year}`;
const citations = {
  dieselgate: cite(
    'recall',
    'US EPA - Volkswagen Clean Air Act Civil Settlement and Audi A3 2.0L TDI Scope',
    'https://www.epa.gov/enforcement/volkswagen-clean-air-act-civil-settlement',
  ),
  emissions2015: cite(
    'recall',
    'Audi Campaign 23Y9 - 2015 A3 2.0L TDI Phase 2 Emissions Modification',
    'https://static.nhtsa.gov/odi/tsbs/2018/MC-10144617-9999.pdf',
  ),
  fuel2010: cite(
    'recall',
    'NHTSA 11V490 - 2010 Audi A3 2.0L TDI Injector Line Number 2',
    recallUrl(2010),
  ),
  fuel2011: cite(
    'recall',
    'NHTSA 11V490 - 2011 Audi A3 2.0L TDI Injector Line Number 2',
    recallUrl(2011),
  ),
  fuel2012: cite(
    'recall',
    'NHTSA 11V490 - 2012 Audi A3 2.0L TDI Injector Line Number 2',
    recallUrl(2012),
  ),
  mmi2022: cite(
    'recall',
    'NHTSA 22V806 - 2022 Audi A3 Infotainment Main Unit and Rearview Camera',
    recallUrl(2022),
  ),
  waterPump: cite(
    'tsb',
    'Audi TSB 2071515/1 - 2020 and 2022-2024 A3/S3 2.0 TFSI Coolant-Pump Leak',
    'https://static.nhtsa.gov/odi/tsbs/2023/MC-10242918-0001.pdf',
  ),
  inventory2020: cite(
    'nhtsa',
    'NHTSA 2020 Audi A3 Recall Inventory',
    recallUrl(2020),
  ),
};

const archived = ({
  years,
  category,
  title,
  description,
  solution,
  citation,
  summary,
}) => ({
  years,
  trims: [],
  engines: [],
  category,
  title: `Archived - ${title}`,
  description,
  solution,
  severity: 'low',
  confidence: 'low',
  source: 'manual',
  symptoms: [],
  affectedSystems: [],
  dtcCodes: [],
  citations: [citation],
  summary,
});

const remove = ({
  years,
  category,
  title,
  formerClaim,
  diagnosis,
  citation = citations.inventory2020,
}) => ({
  disposition: 'remove',
  decision:
    `Archive the unsupported ${formerClaim}. The frozen row does not contain an exact Audi or regulator diagnostic source that establishes its full model-year, hardware, symptom, DTC, prevalence, replacement, interval and prevention bundle. Remove every commerce claim and URL.`,
  evidence: [
    {
      label:
        'Official Audi/regulator material supports narrower VIN-, campaign- or symptom-gated paths and does not establish this frozen universal replacement narrative',
      url: citation.url,
    },
  ],
  after: archived({
    years,
    category,
    title: `Unsupported Audi A3 ${title} Aggregation`,
    description:
      `The former row combined ${formerClaim} without an exact A3 primary diagnostic source for the complete public claim.`,
    solution:
      `Do not order parts or apply a fixed service interval from this archived card. ${diagnosis}`,
    citation,
    summary:
      `Archived an unsupported Audi A3 ${title.toLowerCase()} aggregation and removed broad failure, DTC, cost, interval, prevention and commerce claims.`,
  }),
});

const recordSpecs = {
  'audi-a3-tdi-emissions-2015': {
    disposition: 'no-commerce',
    decision:
      'Retain the 2010-2015 A3 2.0L TDI emissions issue, but replace expired settlement-site, forum, performance, universal warranty and unrelated shopping language with current EPA scope plus Audi campaign 23Y9. Remove both clicked/priority commerce claims and URLs.',
    evidence: [
      {
        label:
          'The EPA identifies 2010-2015 Audi A3 2.0L diesel vehicles among the defeat-device vehicles and records approved emissions modifications',
        url: citations.dieselgate.url,
      },
      {
        label:
          'Audi campaign 23Y9 defines the exact 2015 A3 2.0L TDI Phase 2 hardware/software modification and requires VIN eligibility in Elsa',
        url: citations.emissions2015.url,
      },
    ],
    after: {
      years: [2010, 2011, 2012, 2013, 2014, 2015],
      trims: [],
      engines: ['2.0L TDI'],
      category: 'emissions',
      title: '2010-2015 Audi A3 2.0L TDI Emissions Modification',
      description:
        'The U.S. EPA identifies 2010-2015 Audi A3 2.0L diesel vehicles among the Volkswagen Group vehicles equipped with software that reduced emissions-control effectiveness during normal driving. Audi campaign 23Y9 separately documents the approved two-phase hardware and software modification for eligible 2015 A3 2.0L TDI vehicles. Scope and modification steps differ by generation and VIN.',
      solution:
        'Check the VIN and emissions-modification status with Audi. Do not assume a historical buyback, settlement payment or extended-emissions-warranty term remains available today; ask Audi to confirm the exact completed phases and any current coverage in writing. Diagnose present DPF, EGR, turbo, fuel or drivability symptoms separately rather than buying parts from this campaign summary.',
      severity: 'medium',
      confidence: 'high',
      source: 'manual',
      symptoms: [],
      affectedSystems: [
        'engine-control software',
        'diesel emissions-control hardware',
      ],
      dtcCodes: [],
      citations: [citations.dieselgate, citations.emissions2015],
      summary:
        'Narrowed the row to the EPA-confirmed 2010-2015 A3 2.0L TDI scope and Audi VIN-gated modification process; removed universal current-warranty, performance and two clicked/priority commerce claims.',
    },
  },
  'audi-a3-dq381dq250-s-tronic-mechatronic-2016': remove({
    years: [2016, 2017, 2018, 2019, 2020, 2022, 2023, 2024],
    category: 'transmission',
    title: 'DQ250/DQ381 Mechatronic',
    formerClaim:
      'eight-year two-transmission, six-DTC, no-drive, complete-unit replacement and fixed 40,000-mile service narrative',
    diagnosis:
      'Identify the transmission code and manufacturing data, reproduce the complaint, and follow the exact stored-fault test plan before choosing software, wiring, clutch, control-unit or mechanical work.',
  }),
  'audi-a3-haldex-awd-pumpfilter-contamination-2016': remove({
    years: [2016, 2017, 2018, 2019, 2020],
    category: 'drivetrain',
    title: 'Haldex AWD Pump/Filter',
    formerClaim:
      'five-year Quattro pump-screen contamination, rear-AWD-loss, fixed service interval and direct pump/service-kit narrative',
    diagnosis:
      'Confirm Quattro equipment, scan the AWD control unit, test pump activation and pressure, and inspect the actual fluid and screen before replacing a pump.',
  }),
  'audi-a3-panoramic-sunroof-glass-cracking-2016': remove({
    years: [2016, 2017, 2018, 2019, 2020],
    category: 'body',
    title: 'Panoramic-Sunroof Glass/Frame',
    formerClaim:
      'five-year spontaneous glass breakage, frame stress, rattle, drain, complete cassette and drain-tool narrative',
    diagnosis:
      'Inspect the glass impact pattern, frame alignment, seal, drains and body opening before deciding whether glass, frame, trim or drainage work applies.',
  }),
  'audi-a3-tdi-dpf-2010': remove({
    years: [2010, 2011, 2012, 2013, 2014, 2015],
    category: 'emissions',
    title: 'TDI DPF',
    formerClaim:
      'six-year DPF clogging, fixed mileage, regeneration, replacement, cleaning-chemical and parts narrative',
    diagnosis:
      'Use the applicable post-modification warranty/campaign status and measured soot, ash, pressure and temperature data to diagnose a present DPF complaint.',
    citation: citations.dieselgate,
  }),
  'audi-a3-tdi-egr-2010': remove({
    years: [2010, 2011, 2012, 2013, 2014, 2015],
    category: 'emissions',
    title: 'TDI EGR Valve/Cooler',
    formerClaim:
      'six-year EGR valve/cooler, four-DTC, mileage, replacement and five-part shopping narrative',
    diagnosis:
      'Confirm emissions-modification status and compare commanded/actual EGR flow, cooler integrity and stored faults before selecting a component.',
    citation: citations.dieselgate,
  }),
  'audi-a3-tdi-glow-plug-2010': remove({
    years: [2010, 2011, 2012, 2013, 2014, 2015],
    category: 'engine',
    title: 'TDI Glow-Plug',
    formerClaim:
      'six-year glow-plug, module, harness, fixed-mileage and six-part shopping narrative with no citation',
    diagnosis:
      'Test the exact cylinder circuit, plug resistance/current, harness and control module before replacing parts.',
    citation: citations.dieselgate,
  }),
  'audi-a3-tdi-injector-2010': {
    disposition: 'recall-dealer',
    decision:
      'Replace the generic six-year injector failure, four-DTC and six-link replacement bundle with exact NHTSA campaign 11V490. The campaign covers 2010-2012 A3 2.0L TDI vehicles and injector line number 2 resonance, not universal injector failure.',
    evidence: [
      {
        label:
          'NHTSA 11V490 identifies 2010-2012 Audi A3 2.0L TDI vehicles whose number-2 injector line can crack from resonance and leak fuel',
        url: citations.fuel2010.url,
      },
    ],
    after: {
      years: [2010, 2011, 2012],
      trims: [],
      engines: ['2.0L TDI'],
      category: 'fuel',
      title: '2010-2012 Audi A3 2.0L TDI Injector-Line Recall 11V490',
      description:
        'NHTSA campaign 11V490 covers 2010-2012 Audi A3 vehicles equipped with the 2.0L TDI common-rail diesel engine. Under specific load and RPM conditions, injection pulses can resonate with injector line number 2, adding stress that may create small cracks and fuel leakage. Fuel near an ignition source can cause a fire. The campaign does not establish universal injector, wiring-harness or fuel-rail failure.',
      solution:
        'Check the VIN and campaign-completion history with Audi or NHTSA. The historical remedy installed an improved number-2 injector line on certain vehicles and vibration dampers on all injector lines. Because these vehicles are more than 15 years old, confirm current remedy availability and any cost with Audi. If diesel odor or visible leakage is present, shut the engine off and arrange inspection without driving.',
      severity: 'high',
      confidence: 'high',
      source: 'nhtsa-verified',
      symptoms: [
        'Diesel fuel odor from the engine compartment',
        'Visible fuel leakage at injector line number 2',
      ],
      affectedSystems: [
        'number-2 fuel injector line',
        'fuel injector line vibration dampers',
      ],
      dtcCodes: [],
      citations: [
        citations.fuel2010,
        citations.fuel2011,
        citations.fuel2012,
      ],
      summary:
        'Replaced a generic injector and six-part shopping aggregation with exact 2010-2012 2.0L TDI injector-line recall 11V490; removed unsupported DTC, mileage, cost and all four commerce claims with six URLs.',
    },
  },
  'audi-a3-tdi-turbo-2010': remove({
    years: [2010, 2011, 2012, 2013, 2014, 2015],
    category: 'engine',
    title: 'TDI Turbocharger',
    formerClaim:
      'six-year turbo vane, actuator, six-DTC, mileage, shutdown-idle, replacement-line and hybrid-upgrade narrative',
    diagnosis:
      'Verify emissions-modification status, commanded versus actual boost, actuator travel, charge-air leaks, exhaust restriction and oil supply before authorizing turbo work.',
    citation: citations.dieselgate,
  }),
  'audi-a3-virtual-cockpitmmi-display-freezing-2017': {
    disposition: 'recall-dealer',
    decision:
      'Replace the broad eight-year cluster/MMI freezing and multi-module replacement aggregation with exact 2022 rearview-camera recall 22V806. The supported fault is internal damage to the infotainment main unit after shutdown that can leave the next-start rearview camera inoperative.',
    evidence: [
      {
        label:
          'NHTSA 22V806 includes the 2022 Audi A3 and identifies internal infotainment-main-unit damage that can disable the rearview camera display',
        url: citations.mmi2022.url,
      },
    ],
    after: {
      years: [2022],
      trims: [],
      engines: [],
      category: 'electrical',
      title: '2022 Audi A3 Infotainment Main-Unit Recall 22V806',
      description:
        'NHTSA campaign 22V806 includes certain 2022 Audi A3 vehicles. The infotainment main unit may be damaged internally when the vehicle is shut off, leaving the rearview-camera display inoperative the next time the vehicle is started. Reduced rear visibility increases crash risk. This campaign does not establish the former eight-year virtual-cockpit, navigation, audio and battery aggregation.',
      solution:
        'Check the VIN and recall-completion history with Audi or NHTSA. The recall remedy replaces the infotainment main unit free of charge for eligible vehicles. If the rearview image is unavailable, use direct observation and mirrors and avoid relying on the display until the campaign or a separate diagnosis is completed.',
      severity: 'high',
      confidence: 'high',
      source: 'nhtsa-verified',
      symptoms: [
        'Rearview camera display is inoperative after the vehicle is restarted',
      ],
      affectedSystems: [
        'infotainment main unit',
        'rearview camera display',
      ],
      dtcCodes: [],
      citations: [citations.mmi2022],
      summary:
        'Replaced a broad eight-year virtual-cockpit/MMI aggregation with exact 2022 infotainment-main-unit rearview-camera recall 22V806; removed unsupported module and battery claims.',
    },
  },
  'audi-a3-water-pumpthermostat-housing-coolant-2016': {
    disposition: 'diagnosis-hold',
    decision:
      'Replace the broad 2016-2025 EA888 thermostat-housing and automatic module-replacement narrative with exact Audi TSB 2071515/1. The bulletin covers A3 model years 2020 and 2022-2024 with a confirmed 2.0 TFSI coolant-pump leak and requires clean/dry/recheck diagnosis before replacement.',
    evidence: [
      {
        label:
          'Audi TSB 2071515/1 lists A3 model years 2020 and 2022-2024, requires precise leak localization, and says to observe rather than replace parts when no fresh leak returns',
        url: citations.waterPump.url,
      },
    ],
    after: {
      years: [2020, 2022, 2023, 2024],
      trims: [],
      engines: ['2.0L TFSI'],
      category: 'cooling',
      title: '2020/2022-2024 Audi A3 2.0 TFSI Coolant-Pump Leak Diagnosis',
      description:
        'Audi TSB 2071515/1 covers 2020 and 2022-2024 A3 vehicles with a 2.0 TFSI engine when the owner reports coolant loss, a leak or a coolant warning and the workshop can assign fresh leakage to the coolant pump. Audi warns technicians to distinguish a true leak from insufficient bleeding after production or an earlier repair.',
      solution:
        'Document the suspected leak, clean and dry all traces, fill the system to the correct level and reassess after driving a few miles. If no fresh coolant returns, continue observing without replacing parts. If a leak recurs, replace only the component causing the damage under the exact VIN, engine and part criteria. Outside applicable warranty, Audi states the bulletin is informational.',
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
        'Narrowed a 2016-2025 thermostat/module aggregation to Audi TSB 2071515/1 for confirmed 2020 and 2022-2024 2.0 TFSI coolant-pump leakage; added clean/dry/recheck gate and removed two commerce claims with four URLs.',
    },
  },
};

const expectedIds = [
  'audi-a3-tdi-emissions-2015',
  'audi-a3-dq381dq250-s-tronic-mechatronic-2016',
  'audi-a3-haldex-awd-pumpfilter-contamination-2016',
  'audi-a3-panoramic-sunroof-glass-cracking-2016',
  'audi-a3-tdi-dpf-2010',
  'audi-a3-tdi-egr-2010',
  'audi-a3-tdi-glow-plug-2010',
  'audi-a3-tdi-injector-2010',
  'audi-a3-tdi-turbo-2010',
  'audi-a3-virtual-cockpitmmi-display-freezing-2017',
  'audi-a3-water-pumpthermostat-housing-coolant-2016',
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
  label: 'Audi A3',
  make: 'Audi',
  model: 'A3',
  batchId: 'audi-a3-full-record-cohort-1-2026-07-29',
  auditDate: '2026-07-29',
  snapshotHash:
    '3ee40713b2b5f1bd845d6118be79fc8486956e01d41eb5a8609a85aba77a5102',
  sourceSnapshotFileHash:
    '6e4c8d64ced097e83111d27c7f46e1f1c08b79dc40423fee81ebc9d9c54cd455',
  packetFileHash:
    'a0a117c1a9400e3c8d75083b748939de7d579d36552c6cc32dbf03300a5c673b',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/audi-a3/3ee40713b2b5/all-0001.json',
  reviewTokens: {
    blind: 'a3_blind_review:no-blocker',
    edge: 'a3_edge_review:no-blocker',
  },
  expectedIds,
  records,
  expectedPerRecord: {
    'audi-a3-tdi-emissions-2015': expected(
      ['communityRecommendations:5', 'communityRecommendations:6'],
      [
        'https://www.amazon.com/s?k=Audi%20A3%20Dorman%20Turbocharger%20Gasket%20Kit&tag=au7o-20',
        'https://www.amazon.com/s?k=Audi%20A3%20AutoMeter%20Mechanical%20Boost%20Gauge&tag=au7o-20',
      ],
      { claimClicks: 1, recordClicks: 1, priorityClicks: 1 },
    ),
    'audi-a3-dq381dq250-s-tronic-mechatronic-2016': expected(
      ['communityRecommendations:1'],
      [
        'https://www.amazon.com/s?k=Audi%20DSG%20fluid%20kit%20DQ250%20DQ381&tag=au7o-20',
      ],
    ),
    'audi-a3-haldex-awd-pumpfilter-contamination-2016': expected(
      ['fixParts:0', 'communityRecommendations:1'],
      [
        'https://www.amazon.com/s?k=0CQ598549&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=0CQ598549',
        'https://www.ebay.com/sch/i.html?_nkw=0CQ598549',
        'https://www.amazon.com/s?k=Haldex%20service%20kit%20Audi%20A3%20S3%20MQB&tag=au7o-20',
      ],
    ),
    'audi-a3-panoramic-sunroof-glass-cracking-2016': expected(
      ['fixParts:0', 'communityRecommendations:1'],
      [
        'https://www.amazon.com/s?k=8V5877071A&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=8V5877071A',
        'https://www.ebay.com/sch/i.html?_nkw=8V5877071A',
        'https://www.amazon.com/s?k=sunroof%20drain%20cleaning%20tool%20flexible%20brush&tag=au7o-20',
      ],
    ),
    'audi-a3-tdi-dpf-2010': expected(
      ['fixParts:0', 'communityRecommendations:0', 'communityRecommendations:1'],
      [
        'https://www.amazon.com/s?k=1K0254708GX&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=1K0254708GX',
        'https://www.ebay.com/sch/i.html?_nkw=1K0254708GX',
        'https://www.amazon.com/s?k=Genuine%20VW%2FAudi%20OEM%201K0254706LX%20%2F%201K0254708GX&tag=au7o-20',
        'https://www.amazon.com/s?k=Liqui%20Moly%20LM-20110&tag=au7o-20',
      ],
    ),
    'audi-a3-tdi-egr-2010': expected(
      [
        'fixParts:0',
        'communityRecommendations:0',
        'communityRecommendations:1',
        'communityRecommendations:2',
        'communityRecommendations:3',
      ],
      [
        'https://www.amazon.com/s?k=03L131501K&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=03L131501K',
        'https://www.ebay.com/sch/i.html?_nkw=03L131501K',
        'https://www.amazon.com/s?k=Pierburg%20(OEM%20supplier)%2003L131501K&tag=au7o-20',
        'https://www.amazon.com/s?k=Genuine%20Audi%2FVW%2003L131512AF&tag=au7o-20',
        'https://www.amazon.com/s?k=Genuine%20VW%2FAudi%2003L906529A&tag=au7o-20',
        'https://www.amazon.com/s?k=Genuine%20VW%2FAudi%2003G131547H&tag=au7o-20',
      ],
    ),
    'audi-a3-tdi-glow-plug-2010': expected(
      [
        'fixParts:0',
        'communityRecommendations:0',
        'communityRecommendations:1',
        'communityRecommendations:2',
      ],
      [
        'https://www.amazon.com/s?k=03L905061L&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=03L905061L',
        'https://www.ebay.com/sch/i.html?_nkw=03L905061L',
        'https://www.amazon.com/s?k=Genuine%20VW%2FAudi%2003L905061L%20(current)%20%2F%2003L905061F%20(original)&tag=au7o-20',
        'https://www.amazon.com/s?k=Genuine%20VW%2FAudi%2003L907281%20%2F%2003L907281B&tag=au7o-20',
        'https://www.amazon.com/s?k=Genuine%20VW%2FAudi%2004L971785C%20%2F%2004L971781C&tag=au7o-20',
      ],
    ),
    'audi-a3-tdi-injector-2010': expected(
      [
        'fixParts:0',
        'communityRecommendations:0',
        'communityRecommendations:1',
        'communityRecommendations:2',
      ],
      [
        'https://www.amazon.com/s?k=03L130277A&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=03L130277A',
        'https://www.ebay.com/sch/i.html?_nkw=03L130277A',
        'https://www.amazon.com/s?k=Bosch%20(OEM%20supplier)%2003L130277A%20%2F%20Bosch%200445116030&tag=au7o-20',
        'https://www.amazon.com/s?k=Elring%20%2F%20Genuine%20VW%20059130519%20%2F%20WHT000884%20%2F%20059130119&tag=au7o-20',
        'https://www.amazon.com/s?k=Genuine%20VW%2FAudi%2004L971785C&tag=au7o-20',
      ],
    ),
    'audi-a3-tdi-turbo-2010': expected(
      [
        'fixParts:0',
        'communityRecommendations:0',
        'communityRecommendations:1',
        'communityRecommendations:2',
        'communityRecommendations:3',
      ],
      [
        'https://www.amazon.com/s?k=03L253056&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=03L253056',
        'https://www.ebay.com/sch/i.html?_nkw=03L253056',
        'https://www.amazon.com/s?k=BorgWarner%20(OEM%20manufacturer)%2003L253056%20%2F%20BorgWarner%2053039880208&tag=au7o-20',
        'https://www.amazon.com/s?k=Genuine%20VW%2FAudi%2003L145771&tag=au7o-20',
        'https://www.amazon.com/s?k=Genuine%20VW%2FAudi%20%2F%20Elring%2003G145736F%20%2F%2003L145757Q&tag=au7o-20',
        'https://www.amazon.com/s?k=Audi%20A3%20Hybrid%20Turbo%20Upgrade%3A%20Cascade%20German%20Parts%20and%20MuchBoost%20off&tag=au7o-20',
      ],
    ),
    'audi-a3-virtual-cockpitmmi-display-freezing-2017': expected([], []),
    'audi-a3-water-pumpthermostat-housing-coolant-2016': expected(
      ['fixParts:0', 'communityRecommendations:1'],
      [
        'https://www.amazon.com/s?k=06L121111H&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=06L121111H',
        'https://www.ebay.com/sch/i.html?_nkw=06L121111H',
        'https://www.amazon.com/s?k=VW%20Audi%20G12%20Evo%20coolant%20vacuum%20fill%20tool&tag=au7o-20',
      ],
    ),
  },
  expectedTelemetry: {
    claimCount: 30,
    urlCount: 46,
    claimClickCount: 1,
    recordClickCount: 1,
    priorityClickCount: 1,
  },
  expectedDispositionCounts: {
    'no-commerce': 1,
    remove: 7,
    'recall-dealer': 2,
    'diagnosis-hold': 1,
  },
  expectedPublished: 4,
  expectedArchived: 7,
  controlledDeltaProposals: [],
  expectedProposalIdentities: [],
  assertReviewedAfterState(issues) {
    const byId = new Map(issues.map((issue) => [issue.id, issue.after]));
    if (
      JSON.stringify(byId.get('audi-a3-tdi-emissions-2015').years) !==
        JSON.stringify([2010, 2011, 2012, 2013, 2014, 2015]) ||
      JSON.stringify(byId.get('audi-a3-tdi-injector-2010').years) !==
        JSON.stringify([2010, 2011, 2012]) ||
      JSON.stringify(
        byId.get('audi-a3-virtual-cockpitmmi-display-freezing-2017').years,
      ) !== JSON.stringify([2022]) ||
      JSON.stringify(
        byId.get('audi-a3-water-pumpthermostat-housing-coolant-2016').years,
      ) !== JSON.stringify([2020, 2022, 2023, 2024]) ||
      issues.filter((issue) => issue.after.status === 'archived').length !== 7
    ) {
      throw new Error(
        'Audi A3 campaign/TSB scopes or archived split drifted after review.',
      );
    }
  },
};
