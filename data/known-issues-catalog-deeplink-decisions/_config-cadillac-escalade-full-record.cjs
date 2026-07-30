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
    decision: `Replace the frozen "${oldTitle}" aggregation with the exact primary-source diagnosis below. Remove all ${claims} commerce claims and ${urls} outbound URL occurrences.`,
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
      summary: `Replaced the frozen "${oldTitle}" card with exact GM/NHTSA scope and removed ${claims} commerce claims with ${urls} URLs.`,
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
  evidence = [
    {
      type: 'nhtsa',
      label: 'NHTSA Manufacturer Communications Data Corpus',
      url: communicationsCorpus,
    },
  ],
}) {
  return {
    disposition: 'remove',
    decision: `Archive the frozen "${oldTitle}" aggregation. ${reason} Remove all ${claims} commerce claims and ${urls} outbound URL occurrences.`,
    evidence,
    after: {
      years,
      trims: [],
      engines: [],
      category,
      title: `Archived - Unsupported Cadillac Escalade ${idSuffix}`,
      description: `The former card asserted "${oldTitle}" across a broad Cadillac Escalade population. ${reason}`,
      solution:
        'Do not order parts or apply a universal repair from this archived card. Verify the exact year, VIN, equipment, symptoms, DTCs and current GM service information before diagnosis or repair.',
      severity: 'low',
      confidence: 'low',
      source: 'manual',
      symptoms: [],
      affectedSystems: [],
      dtcCodes: [],
      citations: evidence.map((item) => ({
        type: item.type,
        title: item.label,
        url: item.url,
      })),
      summary: `Archived the unsupported Cadillac Escalade "${oldTitle}" aggregation and removed ${claims} commerce claims with ${urls} URLs.`,
    },
  };
}

const config = {
  label: 'Cadillac Escalade',
  make: 'Cadillac',
  model: 'Escalade',
  batchId: 'cadillac-escalade-full-record-cohort-1-2026-07-30',
  auditDate: '2026-07-30',
  snapshotHash:
    '3ee40713b2b5f1bd845d6118be79fc8486956e01d41eb5a8609a85aba77a5102',
  sourceSnapshotFileHash:
    '6e4c8d64ced097e83111d27c7f46e1f1c08b79dc40423fee81ebc9d9c54cd455',
  packetFileHash:
    '11ddc50a903b54f371abdec0679d22bc93b9bcb3a66e96b2c7b4d33fd2926453',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/cadillac-escalade/3ee40713b2b5/all-0001.json',
  reviewTokens: {
    blind: 'cadillac4_blind:no-blocker',
    edge: 'cadillac4_edge:no-blocker',
  },
  expectedIds: [
    'cadillac-escalade-air-suspension-2007',
    'cadillac-escalade-transfer-case-2007',
    'cadillac-escalade-oil-consumption-2015',
    'cadillac-escalade-10speed-shudder-2021',
    'cadillac-escalade-afm-lifter-2007',
    'cadillac-escalade-brake-lines-2007',
    'cadillac-escalade-instrument-cluster-2003',
    'cadillac-escalade-transmission-shudder-2015',
  ],
  records: {
    'cadillac-escalade-air-suspension-2007': exactPath({
      oldTitle:
        'Air Suspension / Magnetic Ride Control Compressor Failure',
      claims: 3,
      urls: 3,
      evidence: [
        {
          type: 'tsb',
          label: 'GM PIT4954D - Automatic Level Control Diagnosis',
          url: 'https://static.nhtsa.gov/odi/tsbs/2014/MC-10112001-9999.pdf',
        },
      ],
      years: [2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014],
      category: 'suspension',
      title:
        'Service Suspension or Low Ride Height Needs Level-Control Diagnosis',
      description:
        'GM PIT4954D separates several Escalade level-control paths. On 2009 and earlier vehicles, pinched pressure-sensor wiring can contribute to C0696 or C0711. A low rear ride height under heavy payload with C0711 has a moisture-damaged sensor/filter/dryer branch. A visibly loose or damaged left-rear inlet hose has a separate hose-and-filter path. No brief key-up compressor run can be normal because startup operation occurs only below 10 psi. The bulletin does not establish universal compressor or air-spring failure.',
      solution:
        'Confirm RPO Z55 or Z95, model year, DTCs, load condition and visible hose condition, then follow the matching PIT4954D branch. Apply the pressure-sensor wiring check only to 2009 and earlier vehicles; use the moisture or inlet-hose path only when its stated condition is present. Do not treat a missing key-up compressor run by itself as a failure: startup operation occurs only below 10 psi, typically after a long park or when a small leak already exists. GM warns against replacing the complete compressor for these conditions.',
      symptoms: [
        'Service Suspension System message',
        'Rear ride height is low',
      ],
      systems: [
        'automatic level control',
        'electronic suspension control',
        'compressor pressure sensor and inlet path',
      ],
      dtcCodes: ['C0696', 'C0711'],
    }),
    'cadillac-escalade-transfer-case-2007': archived({
      oldTitle: 'Transfer Case Encoder Motor and Chain Failure',
      idSuffix: 'Transfer-Case Encoder-and-Chain Aggregation',
      years: [
        2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017,
        2018, 2019, 2020,
      ],
      category: 'drivetrain',
      claims: 2,
      urls: 2,
      reason:
        'The current primary-source sweep did not establish the asserted NP149/NP246 encoder-motor and chain-stretch failure identity, broad year range, fluid prescription or universal repair. Later transfer-case shudder bulletins describe a materially different failure path.',
    }),
    'cadillac-escalade-oil-consumption-2015': exactPath({
      oldTitle: 'Excessive Oil Consumption - 6.2L EcoTec3 V8',
      claims: 2,
      urls: 2,
      evidence: [
        {
          type: 'tsb',
          label: 'GM 19-NA-036 - L86 Oil-Consumption Diagnosis',
          url: 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10163213-9999.pdf',
        },
        {
          type: 'tsb',
          label: 'GM PIP5357 - L86 Brake-Vacuum-Pump Oil Path',
          url: 'https://static.nhtsa.gov/odi/tsbs/2015/MC-10115002-9999.pdf',
        },
        {
          type: 'tsb',
          label: 'GM 01-06-01-011O - Oil-Consumption Guidelines',
          url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10244273-0001.pdf',
        },
      ],
      years: [2015, 2016],
      engines: ['6.2L L86 V8'],
      category: 'engine',
      title:
        'L86 Oil Use Needs a Measured Consumption and PCV-Path Diagnosis',
      description:
        'GM 19-NA-036 provides a bounded L86 diagnosis for 2015-2016 Escalade vehicles built before September 1, 2015. It requires measured use of at least one quart per 2,000 miles and separates plug-deposit/piston-ring findings from oil entering through the dirty-side PCV and LOMA/VLOM path. PIP5357 adds a brake-vacuum-pump oil-path inspection when normal diagnosis finds no source.',
      solution:
        'Check oil consistently after at least 15 minutes, document oil added and mileage, and inspect external leaks and PCV paths. Apply the piston/ring or LOMA/VLOM branch only when the bulletin criteria and build date match. Do not infer AFM causation, use a delete device, or order parts from this card.',
      symptoms: [
        'Documented engine-oil use of at least one quart per 2,000 miles',
        'Spark-plug deposits after measured oil use',
      ],
      systems: [
        'engine lubrication system',
        'pistons and rings',
        'positive crankcase ventilation path',
        'brake vacuum pump oil path',
      ],
    }),
    'cadillac-escalade-10speed-shudder-2021': exactPath({
      oldTitle: '10L80 Transmission Harsh Shifting and Shudder',
      claims: 2,
      urls: 2,
      evidence: [
        {
          type: 'tsb',
          label: 'GM 22-NA-182 - 10-Speed Cooler-Line Diagnosis',
          url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10242240-0001.pdf',
        },
        {
          type: 'tsb',
          label: 'GM 22-NA-015 - 10-Speed Shudder Diagnostic Aid',
          url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10243982-0001.pdf',
        },
      ],
      years: [2021, 2022, 2023, 2024],
      engines: ['6.2L L87 V8', '3.0L LM2 diesel', '6.2L LT4 V8'],
      category: 'transmission',
      title:
        '10-Speed Harsh Shift or Shudder Needs Cooler-Line and Data Diagnosis',
      description:
        'GM 22-NA-182 and 22-NA-015 cover bounded 2021-2024 Escalade 10-speed concerns. A twisted cooler line or incorrect fluid level can contribute, while a 25-50 mph shudder can reflect DFM operation, engine torque variation, valve-body or TCC-solenoid behavior, or true converter slip. The symptom alone does not identify a failed torque converter.',
      solution:
        'Resolve DTCs first, reproduce the concern with GDS data, verify the exact engine and MHS, MHO or MQC transmission branch, inspect cooler-line routing and fluid level, and separate engine torque variation from converter slip before replacement. Do not use a universal reset, flush or converter prescription.',
      symptoms: [
        'Harsh transmission shift',
        'Shudder between about 25 and 50 mph',
        'Transmission flare or surge',
      ],
      systems: [
        '10-speed automatic transmission',
        'transmission cooler lines',
        'torque-converter clutch controls',
      ],
    }),
    'cadillac-escalade-afm-lifter-2007': exactPath({
      oldTitle: 'AFM/DOD Lifter Failure - V8 Cylinder Deactivation System',
      claims: 1,
      urls: 0,
      evidence: [
        {
          type: 'tsb',
          label: 'GM PIP4568S - Gen IV AFM Lifter Diagnosis',
          url: 'https://static.nhtsa.gov/odi/tsbs/2016/MC-10113935-9999.pdf',
        },
        {
          type: 'tsb',
          label: 'GM 15-06-01-002O - Gen V AFM Lifter Diagnosis',
          url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10233332-0001.pdf',
        },
        {
          type: 'tsb',
          label: 'GM 10-06-01-007E - Early L92 AFM-Hardware Boundary',
          url: 'https://static.nhtsa.gov/odi/tsbs/2020/MC-10180695-9999.pdf',
        },
      ],
      years: [
        2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020,
      ],
      engines: ['6.2L L94 V8', '6.2L L86 V8'],
      category: 'engine',
      title:
        'Confirmed AFM Lifter Collapse Requires Generation-Specific Diagnosis',
      description:
        'GM separates the 2010-2014 L94 Gen IV and 2015-2020 L86 Gen V AFM diagnostic and repair paths. A P0300 misfire and loss of valve motion on AFM cylinders 1, 4, 6 or 7 require compression, VLOM and valvetrain checks; early 2007 L92 hardware had AFM disabled and is outside this corrected scope.',
      solution:
        'Confirm the engine, compression and valve motion before parts replacement. On Gen IV, follow the VLOM and all-AFM-lifter path only after confirmed collapse; on Gen V, follow the affected-bank lifter-and-guide path and replace the VLOM or camshaft only when GM diagnosis identifies damage. Use VIN/EPC service parts, never an AFM-delete product from this card.',
      symptoms: ['Engine misfire', 'Valve-train tick', 'Loss of valve motion'],
      systems: [
        'active fuel management lifters',
        'valve lifter oil manifold',
        'camshaft and valvetrain',
      ],
      dtcCodes: ['P0300'],
    }),
    'cadillac-escalade-brake-lines-2007': archived({
      oldTitle: 'Brake Line Corrosion and Failure (Rust Belt)',
      idSuffix: 'Brake-Line-Corrosion Aggregation',
      years: [2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014],
      category: 'brakes',
      claims: 1,
      urls: 1,
      reason:
        'The current primary-source sweep did not support a 2007-2014 Escalade defect, recall, complete-brake-loss narrative or universal preformed-line kit. NHTSA investigation EA11-001 and GM bulletin 13-05-22-001A concern the earlier 2000-2006 generation and cannot be repurposed.',
      evidence: [
        {
          type: 'nhtsa',
          label: 'NHTSA EA11-001 Closing Resume',
          url: 'https://static.nhtsa.gov/odi/inv/2011/INCLA-EA11001-4484.PDF',
        },
        {
          type: 'tsb',
          label: 'GM 13-05-22-001A - 2000-2006 Preformed Brake Pipes',
          url: 'https://static.nhtsa.gov/odi/tsbs/2014/MC-10135198-9999.pdf',
        },
      ],
    }),
    'cadillac-escalade-instrument-cluster-2003': archived({
      oldTitle: 'Instrument Cluster Gauge Failure (Stepper Motors)',
      idSuffix: 'Instrument-Cluster Aggregation',
      years: [2003, 2004, 2005, 2006],
      category: 'electrical',
      claims: 2,
      urls: 2,
      reason:
        'GM special coverage 07187C appears in third-party archival copies, but a current GM/NHTSA-hosted primary document was not located. The frozen record also overreaches into 2006, asserts a stepper-motor cause and prescribes DIY soldering. This audit does not publish from an unverifiable host.',
    }),
    'cadillac-escalade-transmission-shudder-2015': exactPath({
      oldTitle: '8L90 Transmission Shudder and Harsh Shifting',
      claims: 2,
      urls: 2,
      evidence: [
        {
          type: 'tsb',
          label: 'GM 18-NA-355 - 8L90 TCC Shudder Fluid Procedure',
          url: 'https://static.nhtsa.gov/odi/tsbs/2020/MC-10174266-9999.pdf',
        },
      ],
      years: [2015, 2016, 2017],
      engines: ['6.2L L86 V8'],
      category: 'transmission',
      title:
        '8L90 Light-Throttle Shudder Has a Specific Fluid-Exchange Procedure',
      description:
        'GM 18-NA-355 covers 2015-2017 Escalade vehicles with the L86 engine and M5U 8L90 transmission when a rumble-strip-like shudder occurs at steady light throttle from about 25 to 80 mph while the transmission is not actively shifting. It does not establish a broad harsh-shift defect or automatic torque-converter failure.',
      solution:
        'Confirm the exact L86/M5U configuration and symptom with scan and vibration data. The bulletin directs a one-time 20-quart Mobil 1 Synthetic LV ATF HP exchange and allows up to 200 miles or two cold-to-operating-temperature cycles. A returning concern requires normal diagnosis rather than automatic converter replacement.',
      symptoms: [
        'Rumble-strip-like shudder at steady light throttle',
        'Shudder between about 25 and 80 mph while not shifting',
      ],
      systems: ['8L90 automatic transmission', 'torque-converter clutch fluid'],
    }),
  },
  expectedTelemetry: {
    claimCount: 15,
    urlCount: 14,
    claimClickCount: 6,
    recordClickCount: 10,
    priorityClickCount: 6,
  },
  expectedDispositionCounts: {
    'diagnosis-hold': 5,
    remove: 3,
  },
  expectedPublished: 5,
  expectedArchived: 3,
  controlledDeltaProposals: [
    {
      disposition: 'proposal-only',
      insert: false,
      title:
        'Cadillac Escalade 2015-2019 transfer-case clutch-break-in shudder diagnosis',
      sources: [
        'https://static.nhtsa.gov/odi/tsbs/2020/MC-10186069-9999.pdf',
      ],
    },
    {
      disposition: 'proposal-only',
      insert: false,
      title:
        'Cadillac Escalade 2023-2025 NP0/MHO transfer-case shudder diagnosis',
      sources: [
        'https://static.nhtsa.gov/odi/tsbs/2024/MC-11008963-0001.pdf',
      ],
    },
    {
      disposition: 'proposal-only',
      insert: false,
      title:
        'Cadillac Escalade 2015 Z95 Magnetic Ride Control harsh-ride diagnosis',
      sources: [
        'https://static.nhtsa.gov/odi/tsbs/2015/MC-10115005-9999.pdf',
      ],
    },
  ],
  expectedProposalIdentities: [
    'Cadillac Escalade 2015-2019 transfer-case clutch-break-in shudder diagnosis::https://static.nhtsa.gov/odi/tsbs/2020/MC-10186069-9999.pdf',
    'Cadillac Escalade 2023-2025 NP0/MHO transfer-case shudder diagnosis::https://static.nhtsa.gov/odi/tsbs/2024/MC-11008963-0001.pdf',
    'Cadillac Escalade 2015 Z95 Magnetic Ride Control harsh-ride diagnosis::https://static.nhtsa.gov/odi/tsbs/2015/MC-10115005-9999.pdf',
  ],
};

config.assertReviewedAfterState = function assertReviewedAfterState(issues) {
  const expectedYears = {
    'cadillac-escalade-air-suspension-2007': [
      2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014,
    ],
    'cadillac-escalade-oil-consumption-2015': [2015, 2016],
    'cadillac-escalade-10speed-shudder-2021': [2021, 2022, 2023, 2024],
    'cadillac-escalade-afm-lifter-2007': [
      2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020,
    ],
    'cadillac-escalade-transmission-shudder-2015': [2015, 2016, 2017],
  };
  if (
    issues.some((issue) =>
      Object.prototype.hasOwnProperty.call(expectedYears, issue.id)
        ? issue.after.status !== 'published' ||
          JSON.stringify(issue.after.years) !==
            JSON.stringify(expectedYears[issue.id])
        : issue.after.status !== 'archived',
    )
  ) {
    throw new Error('Cadillac Escalade reviewed scopes or statuses drifted.');
  }
};

module.exports = config;
