const communicationsCorpus =
  'https://www.nhtsa.gov/nhtsa-datasets-and-apis';

function exactPath({
  oldTitle,
  claims,
  urls,
  evidence,
  years,
  engines,
  category,
  title,
  description,
  solution,
  severity = 'high',
  symptoms,
  systems,
  source = 'recall-related',
}) {
  return {
    disposition: 'diagnosis-hold',
    decision: `Replace the frozen "${oldTitle}" aggregation with the bounded government recall path below. Remove all ${claims} commerce claims and ${urls} outbound URL occurrences.`,
    evidence,
    after: {
      years,
      trims: [],
      engines,
      category,
      title,
      description,
      solution,
      severity,
      confidence: 'high',
      source,
      symptoms,
      affectedSystems: systems,
      dtcCodes: [],
      citations: evidence.map((item) => ({
        type: item.type,
        title: item.label,
        url: item.url,
      })),
      summary: `Replaced the frozen "${oldTitle}" card with bounded government recall scope and removed ${claims} commerce claims with ${urls} URLs.`,
    },
  };
}

function archived({
  oldTitle,
  idSuffix,
  years,
  category,
  claims,
  urls,
  reason,
}) {
  return {
    disposition: 'remove',
    decision: `Archive the frozen "${oldTitle}" aggregation. ${reason} Remove all ${claims} commerce claims and ${urls} outbound URL occurrences.`,
    evidence: [
      {
        type: 'nhtsa',
        label: 'NHTSA Manufacturer Communications Data Corpus',
        url: communicationsCorpus,
      },
    ],
    after: {
      years,
      trims: [],
      engines: [],
      category,
      title: `Archived - Unsupported BMW 2 Series Active Tourer ${idSuffix}`,
      description: `The former card asserted "${oldTitle}" across a broad BMW 2 Series Active Tourer population. ${reason}`,
      solution:
        'Do not order parts or apply a universal repair from this archived card. Verify the VIN, exact model year, engine, production date, equipment, symptoms, DTCs, local recall status and current BMW service information before diagnosis.',
      severity: 'low',
      confidence: 'low',
      source: 'manual',
      symptoms: [],
      affectedSystems: [],
      dtcCodes: [],
      citations: [
        {
          type: 'nhtsa',
          title: 'NHTSA Manufacturer Communications Data Corpus',
          url: communicationsCorpus,
        },
      ],
      summary: `Archived the unsupported BMW 2 Series Active Tourer "${oldTitle}" aggregation and removed ${claims} commerce claims with ${urls} URLs.`,
    },
  };
}

const config = {
  label: 'BMW 2 Series Active Tourer',
  make: 'BMW',
  model: '2 Series Active Tourer',
  batchId:
    'bmw-2-series-active-tourer-full-record-cohort-1-2026-07-30',
  auditDate: '2026-07-30',
  snapshotHash:
    '1cf03c45b76180a14f4739d6179c3677fba2e68f9e782decd6522d1d5d6dbf9b',
  sourceSnapshotFileHash:
    '5d9038c04baaff4b03a9df60fa76fe28a7187c144878b4c847dbc86152cc19c0',
  packetFileHash:
    'd9fb4bef01471e3c2c5ded4b6881f3f9e8faab639ed0ab8d274336a3714aefde',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/bmw-2-series-active-tourer/1cf03c45b761/all-0001.json',
  reviewTokens: {
    blind: 'bmw2at_blind:no-blocker',
    edge: 'bmw2at_edge:no-blocker',
  },
  expectedIds: [
    'bmw-2-series-active-tourer-225xe-plug-hybrid-high-voltage-battery-fire-risk',
    'bmw-2-series-active-tourer-b38-three-cylinder-petrol-timing-chain-stretch-cold-start-ra',
    'bmw-2-series-active-tourer-diesel-egr-cooler-glycol-leak-causing-intake-manifold-melt-f',
    'bmw-2-series-active-tourer-diesel-swirl-flap-sticking-carbon-build-up-causing-limp-mode',
    'bmw-2-series-active-tourer-electromechanical-parking-brake-failure-false-warning',
    'bmw-2-series-active-tourer-front-suspension-strut-top-mount-creaking-knocking-over-bump',
    'bmw-2-series-active-tourer-spurious-collision-warning-autonomous-emergency-braking-acti',
  ],
  records: {
    'bmw-2-series-active-tourer-225xe-plug-hybrid-high-voltage-battery-fire-risk':
      exactPath({
        oldTitle:
          '225xe Plug-in Hybrid High-Voltage Battery Fire Risk (2020 Recall)',
        claims: 1,
        urls: 3,
        evidence: [
          {
            type: 'recall',
            label:
              'French Government Safety Gate Alert A12/01342/20 - BMW F2AT High-Voltage Battery',
            url: 'https://rappel.conso.gouv.fr/fiche-rappel/48854/Rapex',
          },
        ],
        years: [2020],
        engines: ['225xe PHEV (B38 1.5 petrol + electric)'],
        category: 'electrical',
        title:
          '2020 225xe High-Voltage Battery Recall Requires a VIN Check',
        description:
          'French government Safety Gate alert A12/01342/20 covers certain BMW model-series 2 vehicles of type F2AT produced from March 19 through August 6, 2020. A welding bead left in the high-voltage battery can cause a short circuit during charging and may initiate a thermal event or fire. The alert does not support general battery-aging or capacity-loss claims.',
        solution:
          'Do not open or attempt to repair the high-voltage battery. Check the VIN and production date with BMW or the applicable national recall authority, follow any charging or parking instructions provided for the campaign and have an authorized BMW high-voltage center complete the recall remedy. ShowMeTheParts does not resolve the 225xe Active Tourer as an exact catalog model, so the former battery commerce links were removed.',
        symptoms: [
          'An affected vehicle may have no advance symptom',
          'Charging interruption or high-voltage warning may occur',
          'Smoke, unusual heat or odor requires immediate safety action',
        ],
        systems: [
          'high-voltage traction battery',
          'battery cell modules',
          'charging system',
        ],
      }),
    'bmw-2-series-active-tourer-b38-three-cylinder-petrol-timing-chain-stretch-cold-start-ra':
      archived({
        oldTitle:
          'B38 Three-Cylinder Petrol Timing Chain Stretch / Cold-Start Rattle',
        idSuffix: 'B38 Timing-Chain Aggregation',
        years: [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021],
        category: 'engine',
        claims: 0,
        urls: 0,
        reason:
          'The frozen card turns secondary articles into an eight-year timing-chain defect, assigns a mileage onset and prescribes replacement without an exact BMW bulletin establishing the Active Tourer population and diagnostic threshold.',
      }),
    'bmw-2-series-active-tourer-diesel-egr-cooler-glycol-leak-causing-intake-manifold-melt-f':
      exactPath({
        oldTitle:
          'Diesel EGR Cooler Glycol Leak Causing Intake Manifold Melt / Fire Risk',
        claims: 1,
        urls: 3,
        evidence: [
          {
            type: 'recall',
            label:
              'Japan MLIT Campaign Gai-3573 - BMW 218d Active Tourer EGR Cooler Recall',
            url: 'https://www.mlit.go.jp/en/jidosha/content/001611068.pdf',
          },
        ],
        years: [2015, 2016, 2017, 2018],
        engines: ['B47 2.0 diesel (218d)'],
        category: 'emissions',
        title:
          '218d EGR-Cooler Glycol-Leak Recall Requires a VIN Check',
        description:
          'Japan MLIT campaign Gai-3573 identifies 2015-2020 BMW 218d Active Tourer vehicles in its market. An EGR cooler can leak glycol over time; combined with soot deposits and EGR temperatures, this can create smoldering particles, melt the intake manifold and, in extremely rare cases, cause a fire. This card is restricted to the frozen 2015-2018 range and the documented 218d, not every B37/B47 derivative.',
        solution:
          'Check the VIN with BMW or the applicable national recall authority because affected ranges differ by market. For an open campaign, have an authorized BMW dealer replace the EGR module with the countermeasure component and inspect related damage under the campaign procedure. Treat smoke, a burning odor or an engine warning as a safety issue and stop when safe. ShowMeTheParts does not resolve the 218d Active Tourer as an exact catalog model, so no commerce link is approved.',
        symptoms: [
          'Coolant or glycol loss',
          'Engine warning lamp may illuminate',
          'Burning odor, smoke or heat damage near the intake system',
        ],
        systems: [
          'EGR cooler',
          'EGR module',
          'intake manifold',
        ],
      }),
    'bmw-2-series-active-tourer-diesel-swirl-flap-sticking-carbon-build-up-causing-limp-mode':
      archived({
        oldTitle:
          'Diesel Swirl Flap Sticking / Carbon Build-up Causing Limp Mode',
        idSuffix: 'Diesel Swirl-Flap Aggregation',
        years: [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021],
        category: 'engine',
        claims: 1,
        urls: 3,
        reason:
          'The frozen card combines B37 and B47 engines, forum anecdotes, generic carbon buildup and a universal cleaning or manifold-replacement path without a production-bounded BMW communication.',
      }),
    'bmw-2-series-active-tourer-electromechanical-parking-brake-failure-false-warning':
      archived({
        oldTitle:
          'Electromechanical (EMF) Parking Brake Failure / False Warning',
        idSuffix: 'Parking-Brake Warning Aggregation',
        years: [2015, 2016, 2017, 2018],
        category: 'brakes',
        claims: 1,
        urls: 3,
        reason:
          'The frozen card relies on forum and article material, merges false warnings with actuator failure and prescribes calibration or replacement without one exact BMW diagnostic bulletin for the asserted population.',
      }),
    'bmw-2-series-active-tourer-front-suspension-strut-top-mount-creaking-knocking-over-bump':
      archived({
        oldTitle:
          'Front Suspension Strut Top Mount / Creaking & Knocking Over Bumps',
        idSuffix: 'Front-Strut-Noise Aggregation',
        years: [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021],
        category: 'suspension',
        claims: 1,
        urls: 3,
        reason:
          'The frozen card extrapolates generic suspension-noise articles to an eight-year top-mount defect and replacement path without a BMW bulletin that distinguishes mounts from links, dampers, springs or other noise sources.',
      }),
    'bmw-2-series-active-tourer-spurious-collision-warning-autonomous-emergency-braking-acti':
      archived({
        oldTitle:
          'Spurious Collision Warning / Autonomous Emergency Braking Activation',
        idSuffix: 'Driver-Assistance Aggregation',
        years: [2016, 2017, 2018, 2019],
        category: 'safety',
        claims: 0,
        urls: 0,
        reason:
          'The frozen card converts secondary articles into a four-year false-braking defect and software remedy without an exact BMW campaign, equipment code, software level or production range.',
      }),
  },
  expectedTelemetry: {
    claimCount: 5,
    urlCount: 15,
    claimClickCount: 0,
    recordClickCount: 0,
    priorityClickCount: 0,
  },
  expectedDispositionCounts: {
    remove: 5,
    'diagnosis-hold': 2,
  },
  expectedPublished: 2,
  expectedArchived: 5,
  controlledDeltaProposals: [],
  expectedProposalIdentities: [],
};

config.assertReviewedAfterState = function assertReviewedAfterState(issues) {
  const published = {
    'bmw-2-series-active-tourer-225xe-plug-hybrid-high-voltage-battery-fire-risk':
      {
        years: [2020],
        engines: ['225xe PHEV (B38 1.5 petrol + electric)'],
      },
    'bmw-2-series-active-tourer-diesel-egr-cooler-glycol-leak-causing-intake-manifold-melt-f':
      {
        years: [2015, 2016, 2017, 2018],
        engines: ['B47 2.0 diesel (218d)'],
      },
  };
  if (
    issues.some((issue) => {
      const expected = published[issue.id];
      return (
        issue.after.status !== (expected ? 'published' : 'archived') ||
        JSON.stringify(issue.after.years) !==
          JSON.stringify(
            expected
              ? expected.years
              : config.records[issue.id].after.years,
          ) ||
        JSON.stringify(issue.after.engines) !==
          JSON.stringify(expected ? expected.engines : [])
      );
    })
  ) {
    throw new Error(
      'BMW 2 Series Active Tourer reviewed scopes or statuses drifted.',
    );
  }
};

module.exports = config;
