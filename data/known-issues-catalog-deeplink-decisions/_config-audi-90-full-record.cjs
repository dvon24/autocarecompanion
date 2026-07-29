const cite = (type, title, url) => ({ type, title, url });
const recallUrl = (year) =>
  `https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=90&modelYear=${year}`;

const citations = {
  fuel1993: cite(
    'recall',
    'NHTSA 98V332 - 1993 Audi 90 V6 Fuel-Injector Seals',
    recallUrl(1993),
  ),
  fuel1994: cite(
    'recall',
    'NHTSA 98V332 - 1994 Audi 90 V6 Fuel-Injector Seals',
    recallUrl(1994),
  ),
  fuel1995: cite(
    'recall',
    'NHTSA 98V332 - 1995 Audi 90 V6 Fuel-Injector Seals',
    recallUrl(1995),
  ),
  ignition1994: cite(
    'recall',
    'NHTSA 96V017 - 1994 Audi 90 Ignition Switch',
    recallUrl(1994),
  ),
  ignition1995: cite(
    'recall',
    'NHTSA 96V017 - 1995 Audi 90 Ignition Switch',
    recallUrl(1995),
  ),
  inventory1990: cite(
    'nhtsa',
    'NHTSA 1990 Audi 90 Recall Inventory',
    recallUrl(1990),
  ),
  inventory1993: cite(
    'nhtsa',
    'NHTSA 1993 Audi 90 Recall Inventory',
    recallUrl(1993),
  ),
  inventory1995: cite(
    'nhtsa',
    'NHTSA 1995 Audi 90 Recall Inventory',
    recallUrl(1995),
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

const records = {
  'audi-90-cooling-system-failure-1990': {
    disposition: 'remove',
    decision:
      'Archive the unsupported six-year multi-engine radiator, pump, thermostat, fan, hose, fixed-mileage and direct-parts aggregation. Its model landing page and placeholder video do not establish one Audi 90 condition. Remove five claims and seven URLs.',
    evidence: [
      {
        label:
          'The official NHTSA 1990 Audi 90 recall response identifies bounded campaigns but does not establish the frozen universal cooling-system failure and parts mapping',
        url: citations.inventory1990.url,
      },
    ],
    after: archived({
      years: [1990, 1991, 1992, 1993, 1994, 1995],
      category: 'cooling',
      title: 'Unsupported Audi 90 Multi-Component Cooling Aggregation',
      description:
        'The former row combined multiple engines, radiator tanks, water pumps, thermostats, fans, hoses, fixed mileage and fixed costs without an Audi maintenance or repair source establishing one condition.',
      solution:
        'Stop safely if the engine overheats and identify the exact leak or circulation failure by VIN and engine code. Do not order a pump, thermostat, housing or radiator from this archived aggregate card.',
      citation: citations.inventory1990,
      summary:
        'Archived an unsupported six-year cooling-system aggregation; removed fixed mileage and costs, placeholder evidence and five commerce claims with seven URLs.',
    }),
  },
  'audi-90-engine-oil-leaks-from-rear-cam-seal-o-ring-valve-cover-gaske': {
    disposition: 'remove',
    decision:
      'Archive the owner-forum-only six-year I5 cam-seal and valve-cover leak aggregation. The row spans years and engines without a primary source or exact installed-part boundary. Remove one claim and three URLs.',
    evidence: [
      {
        label:
          'The official NHTSA 1990 Audi 90 response does not establish the seeded six-year I5 seal failure, fixed mileage or universal gasket kit',
        url: citations.inventory1990.url,
      },
    ],
    after: archived({
      years: [1990, 1991, 1992, 1993, 1994, 1995],
      category: 'engine',
      title: 'Unsupported I5 Cam-Seal and Valve-Cover Leak Aggregation',
      description:
        'The former row generalized a forum report into a six-year I5 seal defect, fixed mileage and one parts kit without exact engine-code or primary repair evidence.',
      solution:
        'Confirm the engine code and actual leak source before choosing seals or gaskets. Do not buy the former kit from this archived row.',
      citation: citations.inventory1990,
      summary:
        'Archived an unsupported I5 oil-leak aggregation; removed fixed mileage and cost claims plus one commerce claim with three URLs.',
    }),
  },
  'audi-90-hydraulic-brake-pressure-accumulator-nitrogen-loss-loss-brak': {
    disposition: 'remove',
    decision:
      'Archive the unsupported universal brake-pressure accumulator nitrogen-loss, test-count, fixed-life and direct accumulator-shopping record. The Audi 90 recall inventory does not establish this campaign or five-year scope. Remove one claim and three URLs.',
    evidence: [
      {
        label:
          'NHTSA recall results for the Audi 90 model-year range identify other bounded safety campaigns and do not establish this hydraulic accumulator recall premise',
        url: citations.inventory1990.url,
      },
    ],
    after: archived({
      years: [1990, 1991, 1992, 1993, 1994, 1995],
      category: 'brakes',
      title: 'Unsupported Audi 90 Brake-Accumulator Nitrogen-Loss Aggregation',
      description:
        'The former row treated nitrogen loss, warning behavior, pump cycles, a fixed service life and one accumulator part as universal across 1990-1995 without Audi primary evidence.',
      solution:
        'Elevated brake effort requires immediate system-specific diagnosis. Do not order an accumulator from this archived row; identify the installed assist system and failed component first.',
      citation: citations.inventory1990,
      summary:
        'Archived an unsupported brake-accumulator aggregation; removed fixed life, test and cost claims plus one commerce claim with three URLs.',
    }),
  },
  'audi-90-hydraulic-lifter-noise-1990': {
    disposition: 'remove',
    decision:
      'Archive this unsupported six-year hydraulic-lifter-noise, oil-pressure, oil-additive and direct-lifter shopping aggregation. It overlaps the separate cold-start tick row and has no Audi primary citation. Remove three claims and five URLs.',
    evidence: [
      {
        label:
          'The official NHTSA 1990 Audi 90 response does not establish the frozen lifter failure, oil-treatment or direct-part premise',
        url: citations.inventory1990.url,
      },
    ],
    after: archived({
      years: [1990, 1991, 1992, 1993, 1994, 1995],
      category: 'engine',
      title: 'Unsupported Audi 90 Hydraulic-Lifter Noise Aggregation',
      description:
        'The former row combined normal and abnormal noises, oil condition, pressure, sludge, additives and lifter replacement across six years without exact engine or primary-source scope.',
      solution:
        'A persistent valvetrain noise requires oil-pressure and engine-specific diagnosis. Do not buy lifters, a generic scan tool or an oil bundle from this archived card.',
      citation: citations.inventory1990,
      summary:
        'Archived an unsupported lifter-noise aggregation; removed overlap, fixed cost and oil-treatment claims plus three commerce claims with five URLs.',
    }),
  },
  'audi-90-hydraulic-lifter-tick-1990': {
    disposition: 'remove',
    decision:
      'Archive this duplicate unsupported cold-start lifter-tick record. It has no citation and repeats the other lifter row while prescribing parts, a generic scan tool and an oil bundle. Remove three claims and five URLs.',
    evidence: [
      {
        label:
          'The official NHTSA 1990 Audi 90 response does not establish the duplicate lifter-tick aggregation',
        url: citations.inventory1990.url,
      },
    ],
    after: archived({
      years: [1990, 1991, 1992, 1993, 1994, 1995],
      category: 'engine',
      title: 'Duplicate Unsupported Audi 90 Lifter-Tick Aggregation',
      description:
        'The former row duplicated the separate hydraulic-lifter card and supplied no primary citation, exact engine boundary or evidence for its parts and oil prescription.',
      solution:
        'Use engine-specific diagnosis for persistent noise. Do not buy lifters, a scan tool or an oil bundle from this archived duplicate.',
      citation: citations.inventory1990,
      summary:
        'Archived a duplicate unsupported lifter-tick row; removed uncited repair and cost claims plus three commerce claims with five URLs.',
    }),
  },
  'audi-90-speedometer-odometer-plastic-gear-failure': {
    disposition: 'remove',
    decision:
      'Archive the forum and aftermarket-instruction aggregation that generalized odometer gear failure and a check-engine-light consequence across 1990-1995. It lacks Audi primary evidence and exact instrument-cluster applicability.',
    evidence: [
      {
        label:
          'The official NHTSA 1993 Audi 90 response does not establish the seeded universal odometer-gear or warning-lamp premise',
        url: citations.inventory1993.url,
      },
    ],
    after: archived({
      years: [1990, 1991, 1992, 1993, 1994, 1995],
      category: 'interior',
      title: 'Unsupported Audi 90 Odometer-Gear and Warning-Lamp Aggregation',
      description:
        'The former row generalized forum and aftermarket repair material into one six-year plastic-gear defect and claimed warning-lamp behavior without an Audi source or exact cluster variant.',
      solution:
        'Identify the installed cluster and diagnose speedometer, odometer and warning-lamp concerns separately. Do not use this archived row as a cluster-parts fitment guide.',
      citation: citations.inventory1993,
      summary:
        'Archived an unsupported odometer-gear and warning-lamp aggregation; removed universal applicability, cost and repair-duration claims.',
    }),
  },
  'audi-90-timing-belt-failure-causing-bent-valves': {
    disposition: 'remove',
    decision:
      'Archive the unsupported six-year three-engine timing-belt, interference-damage, fixed 60,000-mile and universal pump/tensioner aggregation. The frozen citations are forum and aftermarket pages rather than Audi schedules. Remove one claim and three URLs.',
    evidence: [
      {
        label:
          'The official NHTSA 1993 Audi 90 response establishes bounded recalls but not the frozen multi-engine belt interval, damage or parts premise',
        url: citations.inventory1993.url,
      },
    ],
    after: archived({
      years: [1990, 1991, 1992, 1993, 1994, 1995],
      category: 'engine',
      title: 'Unsupported Multi-Engine Audi 90 Timing-Belt Aggregation',
      description:
        'The former row merged NG, 7A and AAH engines into one fixed belt interval, failure consequence and water-pump/tensioner repair without an Audi maintenance or repair source.',
      solution:
        'Determine timing-belt service from the VIN, engine code and current Audi maintenance information. Do not order the former universal belt kit from this archived row.',
      citation: citations.inventory1993,
      summary:
        'Archived an unsupported multi-engine timing-belt aggregation; removed a fixed interval, universal damage and co-repair claims plus one commerce claim with three URLs.',
    }),
  },
  'audi-90-wandering-erratic-idle-from-idle-stabilizer-valve-intake-vac': {
    disposition: 'recall-dealer',
    decision:
      'Replace the I5 idle-stabilizer and vacuum-leak forum aggregation with exact 1993-1995 V6 fuel-injector seal recall 98V332. Preserve the fuel-system safety category, require VIN/engine confirmation and remove one parts claim with three URLs.',
    evidence: [
      {
        label:
          'NHTSA 98V332 returns for 1993 Audi 90 V6 vehicles and identifies an internal injector seal that can leak fuel in the engine compartment',
        url: citations.fuel1993.url,
      },
      {
        label:
          'NHTSA responses extend the same V6 campaign through the 1994 and 1995 Audi 90 model years',
        url: citations.fuel1995.url,
      },
    ],
    after: {
      years: [1993, 1994, 1995],
      trims: [],
      engines: ['V6'],
      category: 'fuel',
      title: '1993-1995 Audi 90 V6 Fuel-Injector Seal Recall 98V332',
      description:
        'NHTSA campaign 98V332 covers 1993-1995 Audi 90 passenger vehicles equipped with V6 engines. An internal fuel-injector seal could malfunction and leak fuel in the engine compartment; fuel contacting an ignition source can cause a fire. This campaign does not establish a universal I5 idle-stabilizer valve or vacuum-hose failure.',
      solution:
        'Check the VIN, engine and campaign-completion history with Audi or NHTSA. The historical remedy replaced all fuel injectors. Confirm current remedy availability and cost with Audi because of the vehicle age. If fuel odor or visible fuel appears in the engine compartment, shut the engine off, keep ignition sources away and arrange inspection without driving.',
      severity: 'high',
      confidence: 'high',
      source: 'nhtsa-verified',
      symptoms: [
        'Fuel odor from the engine compartment',
        'Visible fuel leakage near a V6 injector',
      ],
      affectedSystems: ['V6 fuel injectors', 'fuel-injector internal seals'],
      dtcCodes: [],
      citations: [citations.fuel1993, citations.fuel1994, citations.fuel1995],
      summary:
        'Replaced an I5 idle and vacuum forum aggregation with exact 1993-1995 V6 fuel-injector recall 98V332; removed wrong engine scope, idle-valve cleaning and one commerce claim with three URLs.',
    },
  },
  'audi-90-water-intrusion-into-footwells-from-windshield-base-sunroof': {
    disposition: 'remove',
    decision:
      'Archive the unsupported windshield-base, sunroof-drain, relay-panel and electronics-damage aggregation. Two owner forums do not establish one 1992-1995 Audi condition or repair path.',
    evidence: [
      {
        label:
          'The official NHTSA 1993 Audi 90 response does not establish the frozen multi-source water-intrusion aggregation',
        url: citations.inventory1993.url,
      },
    ],
    after: archived({
      years: [1992, 1993, 1994, 1995],
      category: 'body',
      title: 'Unsupported Audi 90 Water-Intrusion Aggregation',
      description:
        'The former row combined several possible entry paths, electrical consequences and repairs from owner discussions without Audi source, build range or reproduced leak test.',
      solution:
        'Identify the actual entry path with a controlled water test and inspect affected electrical components before repair. Do not treat every wet footwell as one sunroof or windshield defect.',
      citation: citations.inventory1993,
      summary:
        'Archived an unsupported multi-path water-intrusion aggregation; removed generalized electronics-damage, repair-time and fixed-cost claims.',
    }),
  },
  'audi-90-window-regulator-1993': {
    disposition: 'recall-dealer',
    decision:
      'Replace the unsupported 1993-1995 window-regulator cable and direct-parts aggregation with exact 1994-1995 ignition-switch recall 96V017. The official condition can disable power windows together with wipers, lamps, signals and air conditioning. Remove two claims and four URLs.',
    evidence: [
      {
        label:
          'NHTSA 96V017 returns for the 1994 and 1995 Audi 90 and identifies an improperly manufactured ignition switch that can disable power windows and other accessories',
        url: citations.ignition1994.url,
      },
    ],
    after: {
      years: [1994, 1995],
      trims: [],
      engines: [],
      category: 'electrical',
      title: '1994-1995 Audi 90 Ignition-Switch Recall 96V017',
      description:
        'NHTSA campaign 96V017 covers 1994-1995 Audi 90 passenger vehicles. An improperly manufactured ignition switch could cause turn signals, windshield wipers, lamps, power windows and air conditioning to malfunction after the car is started. This does not establish a window-regulator cable failure or support the former regulator part mapping.',
      solution:
        'Check the VIN and campaign-completion history with Audi or NHTSA. The historical remedy replaced the ignition switch. Confirm current remedy availability and cost with Audi because of the vehicle age. If wipers, lights or signals fail after starting, avoid driving in conditions that require them until the ignition circuit is inspected.',
      severity: 'high',
      confidence: 'high',
      source: 'nhtsa-verified',
      symptoms: [
        'Power windows, turn signals, wipers, lamps or air conditioning fail after starting',
      ],
      affectedSystems: ['ignition switch', 'switched electrical accessories'],
      dtcCodes: [],
      citations: [citations.ignition1994, citations.ignition1995],
      summary:
        'Replaced an unsupported window-regulator cable aggregation with exact 1994-1995 ignition-switch recall 96V017; removed 1993, regulator replacement and two commerce claims with four URLs.',
    },
  },
  'audi-90-window-regulator-clip-1990': {
    disposition: 'remove',
    decision:
      'Archive this overlapping six-year regulator-clip, cable, weatherstrip and adhesive shopping aggregation. The retained electrical row now carries the exact ignition-switch recall; this duplicate has no primary repair evidence. Remove three claims and five URLs.',
    evidence: [
      {
        label:
          'NHTSA 96V017 establishes an ignition-switch accessory-loss condition for 1994-1995, not a universal 1990-1995 regulator clip and cable defect',
        url: citations.ignition1995.url,
      },
    ],
    after: archived({
      years: [1990, 1991, 1992, 1993, 1994, 1995],
      category: 'body',
      title: 'Duplicate Unsupported Audi 90 Window-Regulator Aggregation',
      description:
        'The former row overlapped the other window record and combined regulator clips, cables, weatherstrips and adhesive without an Audi source or exact door and regulator variant.',
      solution:
        'Diagnose a window concern as electrical supply, switch, motor, regulator, guide or seal before selecting parts. Do not buy regulator or weatherstrip products from this archived duplicate.',
      citation: citations.ignition1995,
      summary:
        'Archived an overlapping unsupported regulator and weatherstrip aggregation; removed universal fitment and repair claims plus three commerce claims with five URLs.',
    }),
  },
};

module.exports = {
  label: 'Audi 90',
  make: 'Audi',
  model: '90',
  batchId: 'audi-90-full-record-cohort-1-2026-07-28',
  auditDate: '2026-07-28',
  snapshotHash:
    '3ee40713b2b5f1bd845d6118be79fc8486956e01d41eb5a8609a85aba77a5102',
  sourceSnapshotFileHash:
    '6e4c8d64ced097e83111d27c7f46e1f1c08b79dc40423fee81ebc9d9c54cd455',
  packetFileHash:
    '202274ffd5fa927e7e113578571d85c1ef5bc2f74e2a5be101d90b1ebfe8528e',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/audi-90/3ee40713b2b5/all-0001.json',
  reviewTokens: {
    blind: 'audi90_blind_review:no-blocker',
    edge: 'audi90_edge_review:no-blocker',
  },
  expectedIds: [
    'audi-90-cooling-system-failure-1990',
    'audi-90-engine-oil-leaks-from-rear-cam-seal-o-ring-valve-cover-gaske',
    'audi-90-hydraulic-brake-pressure-accumulator-nitrogen-loss-loss-brak',
    'audi-90-hydraulic-lifter-noise-1990',
    'audi-90-hydraulic-lifter-tick-1990',
    'audi-90-speedometer-odometer-plastic-gear-failure',
    'audi-90-timing-belt-failure-causing-bent-valves',
    'audi-90-wandering-erratic-idle-from-idle-stabilizer-valve-intake-vac',
    'audi-90-water-intrusion-into-footwells-from-windshield-base-sunroof',
    'audi-90-window-regulator-1993',
    'audi-90-window-regulator-clip-1990',
  ],
  records,
  expectedPerRecord: {
    'audi-90-cooling-system-failure-1990': {
      claimIds: [
        'fixParts:0',
        'communityRecommendations:0',
        'communityRecommendations:1',
        'communityRecommendations:2',
        'communityRecommendations:3',
      ],
      urls: [
        'https://www.amazon.com/s?k=078121004CX&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=078121004CX',
        'https://www.ebay.com/sch/i.html?_nkw=078121004CX',
        'https://www.amazon.com/s?k=Gates%20water%20pump&tag=au7o-20',
        'https://www.amazon.com/s?k=GMB%20water%20pump&tag=au7o-20',
        'https://www.amazon.com/s?k=Stant%20thermostat&tag=au7o-20',
        'https://www.amazon.com/s?k=Gates%20thermostat%20housing&tag=au7o-20',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
    'audi-90-engine-oil-leaks-from-rear-cam-seal-o-ring-valve-cover-gaske': {
      claimIds: ['fixParts:0'],
      urls: [
        'https://www.amazon.com/s?k=034198025D&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=034198025D',
        'https://www.ebay.com/sch/i.html?_nkw=034198025D',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
    'audi-90-hydraulic-brake-pressure-accumulator-nitrogen-loss-loss-brak': {
      claimIds: ['fixParts:0'],
      urls: [
        'https://www.amazon.com/s?k=4A0%20612%20061%20D&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=4A0%20612%20061%20D',
        'https://www.ebay.com/sch/i.html?_nkw=4A0%20612%20061%20D',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
    'audi-90-hydraulic-lifter-noise-1990': {
      claimIds: [
        'fixParts:0',
        'communityRecommendations:0',
        'communityRecommendations:1',
      ],
      urls: [
        'https://www.amazon.com/s?k=034109309AD&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=034109309AD',
        'https://www.ebay.com/sch/i.html?_nkw=034109309AD',
        'https://www.amazon.com/s?k=Audi%2090%20BlueDriver%20Bluetooth%20OBD2%20Diagnostic%20Scan%20Tool&tag=au7o-20',
        'https://www.amazon.com/s?k=Audi%2090%20Mobil%201%20Full%20Synthetic%20Oil%20and%20Filter%20Bundle&tag=au7o-20',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
    'audi-90-hydraulic-lifter-tick-1990': {
      claimIds: [
        'fixParts:0',
        'communityRecommendations:0',
        'communityRecommendations:1',
      ],
      urls: [
        'https://www.amazon.com/s?k=034109309AD&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=034109309AD',
        'https://www.ebay.com/sch/i.html?_nkw=034109309AD',
        'https://www.amazon.com/s?k=Audi%2090%20BlueDriver%20Bluetooth%20OBD2%20Diagnostic%20Scan%20Tool&tag=au7o-20',
        'https://www.amazon.com/s?k=Audi%2090%20Mobil%201%20Full%20Synthetic%20Oil%20and%20Filter%20Bundle&tag=au7o-20',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
    'audi-90-speedometer-odometer-plastic-gear-failure': {
      claimIds: [],
      urls: [],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
    'audi-90-timing-belt-failure-causing-bent-valves': {
      claimIds: ['fixParts:0'],
      urls: [
        'https://www.amazon.com/s?k=078109119D&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=078109119D',
        'https://www.ebay.com/sch/i.html?_nkw=078109119D',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
    'audi-90-wandering-erratic-idle-from-idle-stabilizer-valve-intake-vac': {
      claimIds: ['fixParts:0'],
      urls: [
        'https://www.amazon.com/s?k=034133455A&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=034133455A',
        'https://www.ebay.com/sch/i.html?_nkw=034133455A',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
    'audi-90-water-intrusion-into-footwells-from-windshield-base-sunroof': {
      claimIds: [],
      urls: [],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
    'audi-90-window-regulator-1993': {
      claimIds: ['fixParts:0', 'communityRecommendations:1'],
      urls: [
        'https://www.amazon.com/s?k=893%20837%20397%20A&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=893%20837%20397%20A',
        'https://www.ebay.com/sch/i.html?_nkw=893%20837%20397%20A',
        'https://www.amazon.com/s?k=Dorman%20Power%20Window%20Regulator%20and%20Motor%20Assembly%20Audi%2090&tag=au7o-20',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
    'audi-90-window-regulator-clip-1990': {
      claimIds: [
        'fixParts:0',
        'communityRecommendations:0',
        'communityRecommendations:1',
      ],
      urls: [
        'https://www.amazon.com/s?k=893837397A&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=893837397A',
        'https://www.ebay.com/sch/i.html?_nkw=893837397A',
        'https://www.amazon.com/s?k=Dorman%20weatherstrip%20seal&tag=au7o-20',
        'https://www.amazon.com/s?k=3M%20super%20weatherstrip%20adhesive&tag=au7o-20',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
  },
  expectedTelemetry: {
    claimCount: 20,
    urlCount: 38,
    claimClickCount: 0,
    recordClickCount: 0,
    priorityClickCount: 0,
  },
  expectedDispositionCounts: {
    remove: 9,
    'recall-dealer': 2,
  },
  expectedPublished: 2,
  expectedArchived: 9,
  controlledDeltaProposals: [],
  expectedProposalIdentities: [],
  assertReviewedAfterState(issues) {
    const fuel = issues.find(
      (issue) =>
        issue.id ===
        'audi-90-wandering-erratic-idle-from-idle-stabilizer-valve-intake-vac',
    ).after;
    const ignition = issues.find(
      (issue) => issue.id === 'audi-90-window-regulator-1993',
    ).after;
    if (
      JSON.stringify(fuel.years) !== JSON.stringify([1993, 1994, 1995]) ||
      JSON.stringify(fuel.engines) !== JSON.stringify(['V6']) ||
      JSON.stringify(ignition.years) !== JSON.stringify([1994, 1995]) ||
      issues.filter((issue) => issue.after.status === 'archived').length !== 9
    ) {
      throw new Error(
        'Audi 90 recall scopes or archived split drifted after review.',
      );
    }
  },
};
