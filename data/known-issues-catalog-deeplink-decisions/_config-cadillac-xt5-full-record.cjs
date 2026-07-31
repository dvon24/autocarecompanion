const communicationsCorpus =
  'https://www.nhtsa.gov/nhtsa-datasets-and-apis';

function exactPath({
  oldTitle,
  claims,
  urls,
  evidence,
  years,
  engines = [],
  category,
  title,
  description,
  solution,
  severity = 'medium',
  symptoms,
  systems,
  dtcCodes = [],
}) {
  return {
    disposition: 'diagnosis-hold',
    decision: `Replace the frozen "${oldTitle}" aggregation with the bounded primary-source diagnosis below. Remove all ${claims} commerce claims and ${urls} outbound URL occurrences.`,
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
      source: 'nhtsa-verified',
      symptoms,
      affectedSystems: systems,
      dtcCodes,
      citations: evidence.map((item) => ({
        type: item.type,
        title: item.label,
        url: item.url,
      })),
      summary: `Replaced the frozen "${oldTitle}" card with bounded GM/NHTSA scope and removed ${claims} commerce claims with ${urls} URLs.`,
    },
  };
}

function archived({ oldTitle, idSuffix, years, category, claims, urls, reason }) {
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
      title: `Archived - Unsupported Cadillac XT5 ${idSuffix}`,
      description: `The former card asserted "${oldTitle}" across a broad Cadillac XT5 population. ${reason}`,
      solution:
        'Do not order parts or apply a universal repair from this archived card. Verify the exact year, drivetrain, equipment, symptoms, DTCs, VIN campaign status and current Cadillac service information before diagnosis.',
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
      summary: `Archived the unsupported Cadillac XT5 "${oldTitle}" aggregation and removed ${claims} commerce claims with ${urls} URLs.`,
    },
  };
}

const config = {
  label: 'Cadillac XT5',
  make: 'Cadillac',
  model: 'XT5',
  batchId: 'cadillac-xt5-full-record-cohort-1-2026-07-30',
  auditDate: '2026-07-30',
  snapshotHash:
    '3ee40713b2b5f1bd845d6118be79fc8486956e01d41eb5a8609a85aba77a5102',
  sourceSnapshotFileHash:
    '6e4c8d64ced097e83111d27c7f46e1f1c08b79dc40423fee81ebc9d9c54cd455',
  packetFileHash:
    'ef571bb77e2b2736e5a545667f5bfd55ed1b5f835f885947fcd4b8c4fdef721b',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/cadillac-xt5/3ee40713b2b5/all-0001.json',
  reviewTokens: {
    blind: 'cadillac6_blind:no-blocker',
    edge: 'cadillac6_edge:no-blocker',
  },
  expectedIds: [
    'cadillac-xt5-9speed-shudder-2017',
    'cadillac-xt5-brake-vibration-2017',
    'cadillac-xt5-electronic-gear-selector-park-switch-fault-persistent-shift',
    'cadillac-xt5-fuel-pump-jet-nozzle-manufacturing-defect-causing-sudden-eng',
    'cadillac-xt5-liftgate-strut-2017',
    'cadillac-xt5-timing-chain-2017',
    'cadillac-xt5-transmission-shudder-2017',
  ],
  records: {
    'cadillac-xt5-9speed-shudder-2017': exactPath({
      oldTitle: '9-Speed Automatic Transmission Shudder',
      claims: 2,
      urls: 2,
      evidence: [
        {
          type: 'tsb',
          label:
            'GM Preliminary Information PIP5608F - 2020-2021 XT5 Low-Speed TCC Shudder',
          url: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10201297-9999.pdf',
        },
      ],
      years: [2020, 2021],
      category: 'transmission',
      title:
        'Low-Speed TCC Shudder Must Be Confirmed Before a Fluid Drain and Fill',
      description:
        'GM PIP5608F covers 2020-2021 XT5 vehicles with 9-speed transmissions RPO M3G or M3W when torque-converter clutch shudder occurs on re-apply after a shift at 40 mph or below. GM identifies possible excessive assembly lubricant in the fluid and requires confirmation with TCC slip data or the scan-tool command test.',
      solution:
        'Have a qualified transmission technician verify RPO M3G or M3W and confirm the event is TCC shudder using slip-speed data or the commanded-on test. If the bulletin criteria are met, follow the GM DEXRON VI drain-and-fill procedure and drive at least 200 miles before judging the repair. Do not use a universal additive or flush kit. The exact ShowMeTheParts lookup returned no transmission-fluid candidate.',
      symptoms: [
        'Low-speed shudder on TCC re-apply after a shift',
        'Concern occurs at 40 mph or below',
        'Concern changes when TCC is commanded on',
      ],
      systems: [
        'torque-converter clutch',
        '9-speed automatic transmission (RPO M3G or M3W)',
      ],
    }),
    'cadillac-xt5-brake-vibration-2017': archived({
      oldTitle: 'Front Brake Rotor Warping and Pedal Pulsation',
      idSuffix: 'Brake-Vibration Aggregation',
      claims: 2,
      urls: 2,
      years: [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
      category: 'brakes',
      reason:
        'The frozen card asserts one rotor-warp defect, mileage range and universal axle-set replacement across every XT5 year using generic complaint/forum material. The exact 2017 XT5 vibration bulletin found in the primary corpus concerns AWD driveshaft balance at highway speed, not brake rotors, and cannot support this card.',
    }),
    'cadillac-xt5-electronic-gear-selector-park-switch-fault-persistent-shift':
      archived({
        oldTitle:
          "Electronic Gear Selector Park-Switch Fault - Persistent 'Shift to Park' Message / Won't Power Down (TSB 19-NA-206)",
        idSuffix: 'Shift-to-Park Citation',
        claims: 0,
        urls: 0,
        years: [2017, 2018, 2019],
        category: 'electrical',
        reason:
          'The cited March 2024 revision of GM bulletin 19-NA-206 covers specified Chevrolet, GMC and Holden models but lists no Cadillac XT5. Reusing that bulletin, its jumper harness or its diagnostic code for the XT5 would be a model-scope error.',
      }),
    'cadillac-xt5-fuel-pump-jet-nozzle-manufacturing-defect-causing-sudden-eng':
      exactPath({
        oldTitle:
          'Fuel Pump Jet Nozzle Manufacturing Defect Causing Sudden Engine Stall (Recall 20V639000 / N202314760)',
        claims: 0,
        urls: 0,
        evidence: [
          {
            type: 'recall',
            label:
              'GM Safety Recall N202314760 / NHTSA 20V639 - Obstructed Fuel Flow to Engine',
            url: 'https://static.nhtsa.gov/odi/rcl/2020/RCSB-20V639-1823.pdf',
          },
        ],
        years: [2020],
        category: 'fuel',
        title:
          'Recall 20V639: AWD Fuel-Pump Mixing-Tube Burr May Cause a Stall',
        description:
          'GM safety recall N202314760 covers certain 2020 XT5 vehicles equipped with AWD RPO F48 and F46. Burrs inside the fuel-pump mixing tube can prevent transfer from the secondary side of the tank, obstruct fuel flow at low fuel level and cause an unexpected engine stall.',
        solution:
          'Check the VIN for an open NHTSA 20V639 / GM N202314760 campaign. If open, arrange the dealer fuel-pump module replacement at no charge. Do not buy the recall pump from a commerce link; GM directs use of the VIN and electronic parts catalog for the exact module.',
        severity: 'high',
        symptoms: [
          'Unexpected engine stall at low fuel level',
          'Loss of fuel transfer from the secondary side of the tank',
        ],
        systems: ['AWD fuel tank', 'fuel-pump module', 'mixing tube'],
      }),
    'cadillac-xt5-liftgate-strut-2017': archived({
      oldTitle: 'Power Liftgate Strut Failure and Erratic Operation',
      idSuffix: 'Liftgate-Strut Aggregation',
      claims: 2,
      urls: 2,
      years: [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
      category: 'body',
      reason:
        'The frozen card combines weak struts, sensor behavior and module resets across nine model years without an exact GM diagnostic. The 2017 XT5 service update located in the primary corpus addresses approximately 21 vehicles with an incorrect hands-free liftgate data file, not the universal physical-strut failure asserted here.',
    }),
    'cadillac-xt5-timing-chain-2017': archived({
      oldTitle: '3.6L V6 Timing Chain Issues (XT5 V6 models)',
      idSuffix: 'Timing-Chain Aggregation',
      claims: 1,
      urls: 1,
      years: [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
      category: 'engine',
      reason:
        'The frozen card extrapolates timing-chain wear from older GM High Feature V6 applications, declares preventive replacement at a mileage threshold and links a kit and water pump without an exact XT5 bulletin establishing that population, threshold or repair. The cited older timing-chain kit bulletin does not cover the XT5.',
    }),
    'cadillac-xt5-transmission-shudder-2017': archived({
      oldTitle: '8-Speed / 9-Speed Transmission Shudder and Harsh Shifting',
      idSuffix: 'Mixed-Transmission Aggregation',
      claims: 2,
      urls: 2,
      years: [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
      category: 'transmission',
      reason:
        'The frozen card combines different 8-speed and 9-speed diagnoses across nine model years. Its cited GM bulletin 18-NA-355 is scoped to longitudinal 8L45/8L90 vehicles and does not list the XT5. The valid 2020-2021 XT5 9-speed TCC path is retained separately under the other stable transmission identity.',
    }),
  },
  expectedTelemetry: {
    claimCount: 9,
    urlCount: 9,
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
  controlledDeltaProposals: [
    {
      disposition: 'proposal-only',
      insert: false,
      title: 'cadillac-xt5-high-pressure-fuel-pump-emission-recall-2024',
      sources: [
        'https://static.nhtsa.gov/odi/tsbs/2024/MC-10253045-0001.pdf',
      ],
    },
  ],
  expectedProposalIdentities: [
    'cadillac-xt5-high-pressure-fuel-pump-emission-recall-2024::https://static.nhtsa.gov/odi/tsbs/2024/MC-10253045-0001.pdf',
  ],
};

config.assertReviewedAfterState = function assertReviewedAfterState(issues) {
  const expected = {
    'cadillac-xt5-9speed-shudder-2017': {
      years: [2020, 2021],
      engines: [],
      status: 'published',
    },
    'cadillac-xt5-brake-vibration-2017': {
      years: [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
      engines: [],
      status: 'archived',
    },
    'cadillac-xt5-electronic-gear-selector-park-switch-fault-persistent-shift':
      {
        years: [2017, 2018, 2019],
        engines: [],
        status: 'archived',
      },
    'cadillac-xt5-fuel-pump-jet-nozzle-manufacturing-defect-causing-sudden-eng':
      {
        years: [2020],
        engines: [],
        status: 'published',
      },
    'cadillac-xt5-liftgate-strut-2017': {
      years: [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
      engines: [],
      status: 'archived',
    },
    'cadillac-xt5-timing-chain-2017': {
      years: [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
      engines: [],
      status: 'archived',
    },
    'cadillac-xt5-transmission-shudder-2017': {
      years: [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
      engines: [],
      status: 'archived',
    },
  };
  if (
    issues.some(
      (issue) =>
        !expected[issue.id] ||
        issue.after.status !== expected[issue.id].status ||
        JSON.stringify(issue.after.years) !==
          JSON.stringify(expected[issue.id].years) ||
        JSON.stringify(issue.after.engines) !==
          JSON.stringify(expected[issue.id].engines),
    )
  ) {
    throw new Error('Cadillac XT5 reviewed scopes or statuses drifted.');
  }
};

module.exports = config;
