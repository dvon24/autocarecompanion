const communicationsCorpus =
  'https://www.nhtsa.gov/nhtsa-datasets-and-apis';

function verifiedPath({
  disposition = 'diagnosis-hold',
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
  severity,
  symptoms,
  systems,
}) {
  return {
    disposition,
    decision: `Replace the frozen "${oldTitle}" aggregation with the bounded primary-source path below. Remove all ${claims} commerce claims and ${urls} outbound URL occurrences.`,
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
      source:
        disposition === 'recall-dealer'
          ? 'recall-related'
          : 'nhtsa-verified',
      symptoms,
      affectedSystems: systems,
      dtcCodes: [],
      citations: evidence.map((item) => ({
        type: item.type,
        title: item.label,
        url: item.url,
      })),
      summary: `Replaced the frozen "${oldTitle}" card with bounded BMW/NHTSA scope and removed ${claims} commerce claims with ${urls} URLs.`,
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
      title: `Archived - Unsupported BMW i3 ${idSuffix}`,
      description: `The former card asserted "${oldTitle}" across a broad BMW i3 population. ${reason}`,
      solution:
        'Do not order parts or apply a universal repair from this archived card. Verify the exact model year, production date, BEV/REx configuration, symptoms, DTCs, open recalls and current BMW service information before diagnosis. High-voltage and refrigerant work belongs with properly trained personnel.',
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
      summary: `Archived the unsupported BMW i3 "${oldTitle}" aggregation and removed ${claims} commerce claims with ${urls} URLs.`,
    },
  };
}

const config = {
  label: 'BMW i3',
  make: 'BMW',
  model: 'i3',
  batchId: 'bmw-i3-full-record-cohort-8-2026-07-31',
  auditDate: '2026-07-31',
  snapshotHash:
    '1af2aadfeb6c3a979db85b8ede4aee724b778e5fbfe391e99d8b8642215311dc',
  sourceSnapshotFileHash:
    'de75984db599d70199594ec4200eeb407da0d1444df33d277d3176f8d73dcaff',
  packetFileHash:
    '0375aec6f5136e015e7937d2ee95354530f34dd07fba51c0d55bc07f6925b48e',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/bmw-i3/1af2aadfeb6c/all-0001.json',
  reviewTokens: {
    blind: 'bmwi3_blind:no-blocker',
    edge: 'bmwi3_edge:no-blocker',
  },
  expectedIds: [
    'bmw-i3-12v-battery-drain-2014',
    'bmw-i3-12v-parasitic-drain-2014',
    'bmw-i3-ac-compressor-black-death-2014',
    'bmw-i3-ac-compressor-failure-2014',
    'bmw-i3-battery-degradation-2014',
    'bmw-i3-connectivity-module-2014',
    'bmw-i3-dc-fast-charge-latch-2014',
    'bmw-i3-hvac-heater-2014',
    'bmw-i3-rex-engine-issues-2014',
    'bmw-i3-rex-stale-fuel-2014',
  ],
  records: {
    'bmw-i3-12v-battery-drain-2014': verifiedPath({
      oldTitle: '12V Auxiliary Battery Drain - All I01 Models',
      claims: 1,
      urls: 2,
      evidence: [
        {
          type: 'tsb',
          label:
            'BMW SIB 61 39 14 - i3 REx 12V Discharge Message After Charging',
          url: 'https://static.nhtsa.gov/odi/tsbs/2015/MC-10147620-9999.pdf',
        },
        {
          type: 'tsb',
          label:
            'BMW SIB 61 05 20 - Increased Battery Drain Caused by Controller',
          url: 'https://static.nhtsa.gov/odi/tsbs/2020/MC-10174019-9999.pdf',
        },
      ],
      years: [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021],
      category: 'electrical',
      title: 'i3 12V Discharge Warning: ISTA Software-First Diagnosis',
      description:
        'BMW distinguishes condition-specific software faults from a failed 12V battery. SIB 61 39 14 covers a narrow early i3 REx integration-level error after charging, while SIB 61 05 20 applies to I01 vehicles only when ISTA Energy Diagnosis identifies the Controller sleep delay as the cause of Check Control Message 415. These bulletins do not establish that every i3 warning is a bad auxiliary battery or a universal parasitic drain.',
      solution:
        'Read the Check Control Message and fault memory, run BMW ISTA Energy Diagnosis and test the 12V battery before replacing anything. For the Controller condition, BMW says not to replace the Controller; program the vehicle when the measured I-level and diagnostic result meet SIB 61 05 20. For the early REx condition, follow SIB 61 39 14. Replace and register a 12V battery only if separate testing proves it failed. ShowMeTheParts resolved the exact 2014 i3 model but exposed no battery category or defensible 12V candidate, so no commerce link is approved.',
      severity: 'medium',
      symptoms: [
        'Check Control Message for increased battery discharge',
        'ISTA Energy Diagnosis identifies the Controller as the cause',
        'Early i3 REx warning appears after a several-hour charging session',
      ],
      systems: [
        '12V energy management',
        'Controller sleep behavior',
        'REME software',
      ],
    }),
    'bmw-i3-12v-parasitic-drain-2014': archived({
      oldTitle: '12V Auxiliary Battery Parasitic Drain',
      idSuffix: 'Duplicate Parasitic-Drain Aggregation',
      years: [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021],
      category: 'electrical',
      claims: 2,
      urls: 4,
      reason:
        'It duplicates the retained fault-guided 12V path, labels the entire model line notorious, assigns several modules without an exact diagnostic result, and prescribes battery replacement, coding and a tender as universal repairs.',
    }),
    'bmw-i3-ac-compressor-black-death-2014': archived({
      oldTitle:
        'Electric A/C Compressor Catastrophic Failure ("Black Death") - All I01',
      idSuffix: 'A/C Contamination Aggregation',
      years: [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021],
      category: 'hvac',
      claims: 4,
      urls: 6,
      reason:
        'It asserts an all-I01 compressor defect, six revisions, unflushable battery channels, total-loss repair costs, state-specific warranty coverage and multiple replacement brands without a matching BMW bulletin. Its cited SIB 64 03 18 concerns refrigerant disposition for a delivery stop, not the claimed i3 compressor failure.',
    }),
    'bmw-i3-ac-compressor-failure-2014': archived({
      oldTitle: 'Electric AC Compressor Failure',
      idSuffix: 'Duplicate A/C-Compressor Aggregation',
      years: [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021],
      category: 'hvac',
      claims: 4,
      urls: 6,
      reason:
        'It duplicates the unsupported compressor card and assigns high-voltage motor-winding and refrigerant-leak causes, a universal compressor assembly and R-1234yf service to eight model years without an exact BMW diagnostic population.',
    }),
    'bmw-i3-battery-degradation-2014': verifiedPath({
      disposition: 'recall-dealer',
      oldTitle: 'High-Voltage Battery Degradation',
      claims: 4,
      urls: 4,
      evidence: [
        {
          type: 'recall',
          label:
            'NHTSA/BMW Safety Recall 22V-683 - High-Voltage Battery Cell',
          url: 'https://static.nhtsa.gov/odi/rcl/2022/RCRIT-22V683-1876.pdf',
        },
        {
          type: 'recall',
          label: 'NHTSA Part 573 Report 22V-683',
          url: 'https://static.nhtsa.gov/odi/rcl/2022/RCLRPT-22V683-3950.PDF',
        },
      ],
      years: [2019, 2020, 2021],
      category: 'electrical',
      title: '2019-2021 i3 High-Voltage Battery Cell Recall 22V-683',
      description:
        'BMW recall 22V-683 covers a small VIN-defined group of 2019-2021 i3 BEV and i3 REx vehicles whose high-voltage battery may contain a cell with a miscut electrode. A short circuit can cause a thermal event. This is not evidence that ordinary range loss or degradation affects every i3, and model year alone does not establish inclusion.',
      solution:
        'Check the VIN for an open 22V-683 campaign with BMW/NHTSA. If included, arrange the free authorized-BMW remedy; BMW instructs replacement of the affected battery cell module. Do not buy a battery module or use capacity estimates as a substitute for the VIN recall check. This high-voltage, recall-only path intentionally carries no commerce.',
      severity: 'high',
      symptoms: [
        'VIN shows an open 22V-683 recall',
        'The affected battery cell may short circuit',
        'A thermal event can occur without a degradation complaint',
      ],
      systems: ['high-voltage battery', 'battery cell module'],
    }),
    'bmw-i3-connectivity-module-2014': verifiedPath({
      oldTitle: 'Telematics/Connectivity Module (TCB) 3G Shutdown & Failure',
      claims: 2,
      urls: 4,
      evidence: [
        {
          type: 'manual',
          label: 'BMW USA 3G Cellular Technology Discontinuation FAQ',
          url: 'https://www.bmwusa.com/content/dam/bmw/marketUS/common/connected-drive/pdf/3G_FAQ.pdf',
        },
        {
          type: 'tsb',
          label:
            'BMW SIB 84 01 21 - Telematics Unit Deactivation Due to 3G Discontinuation',
          url: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10200487-9999.pdf',
        },
        {
          type: 'tsb',
          label:
            'BMW SIB 84 09 22 - i3 Telematics Programming for 3G Sunset',
          url: 'https://static.nhtsa.gov/odi/tsbs/2022/MC-10225129-9999.pdf',
        },
      ],
      years: [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021],
      category: 'electrical',
      title: 'i3 ConnectedDrive 3G Sunset: VIN-Specific Eligibility Path',
      description:
        'BMW states that factory 3G telematics lost ConnectedDrive/BMW Assist service after the carrier sunset, and SIB 84 01 21 identifies VIN-specific vehicles that do not meet the requirements for a technology upgrade. A separate campaign, SIB 84 09 22, covers certain later I01 vehicles produced April 27, 2017 through October 29, 2021 whose 4G telematics units lacked IMS configuration for voice services. This replaces the unsupported claims of widespread water ingress and universal hardware failure.',
      solution:
        'Check the VIN in BMW AIR/DCSnet or My Garage before choosing a remedy. An early 3G vehicle marked non-eligible cannot be restored by buying the frozen card’s used TCB part. A later campaign-eligible 4G vehicle should receive the BMW programming action that writes the IMS configuration. Confirm current service availability with BMW ConnectedDrive support; do not order a telematics module from model year alone.',
      severity: 'medium',
      symptoms: [
        'ConnectedDrive or BMW Assist services are unavailable after the 3G sunset',
        'BMW VIN record says the vehicle is not eligible for a technology upgrade',
        'Campaign-eligible 4G vehicle loses Concierge, Assistance or emergency-call voice',
      ],
      systems: ['telematics control unit', 'embedded cellular services'],
    }),
    'bmw-i3-dc-fast-charge-latch-2014': verifiedPath({
      oldTitle: 'DC Fast Charging (CCS) Latch Pin & Connector Failure',
      claims: 2,
      urls: 4,
      evidence: [
        {
          type: 'tsb',
          label:
            'BMW SIB 61 31 14 - Replace Convenience Charging Electronics (KLE)',
          url: 'https://static.nhtsa.gov/odi/tsbs/2014/SB-10058161-5091.pdf',
        },
        {
          type: 'tsb',
          label:
            'BMW SIB 61 01 15 - Discharged 12V Battery and Level 2 Charging Delay',
          url: 'https://static.nhtsa.gov/odi/tsbs/2015/MC-10147617-9999.pdf',
        },
      ],
      years: [2014],
      category: 'electrical',
      title: '2014 i3 Level 2 Charging Delay: KLE Campaign Check',
      description:
        'BMW SIB 61 31 14 describes certain early i3 and i3 REx vehicles whose faulty Convenience Charging Electronics capacitor could increase Level 2 charging time; affected VINs showed the service action open in BMW dealer systems. SIB 61 01 15 separately describes a software-related delay before Level 2 charging begins when the 12V battery is discharged. Neither document supports the frozen claim of an all-year CCS latch-pin design defect.',
      solution:
        'Check the VIN for the KLE service action and read charging and 12V faults with BMW diagnostics. For an open campaign, follow BMW’s KLE replacement and programming procedure. If the 12V battery is discharged, SIB 61 01 15 describes a controlled Level 2 recovery/programming path and says parts replacement does not solve its remaining intermittent delay. Do not drill or lubricate the charge port or buy a latch actuator based on this card.',
      severity: 'medium',
      symptoms: [
        'Level 2 charging time is longer than expected on an affected early VIN',
        'A discharged 12V battery delays the start of Level 2 charging',
        'BMW dealer systems show the KLE service action open',
      ],
      systems: [
        'Convenience Charging Electronics',
        'Level 2 charging control',
        '12V charging enablement',
      ],
    }),
    'bmw-i3-hvac-heater-2014': archived({
      oldTitle: 'Electric Heater & HVAC System Failures - Range Impact',
      idSuffix: 'HVAC and Winter-Range Aggregation',
      years: [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021],
      category: 'hvac',
      claims: 3,
      urls: 5,
      reason:
        'It combines normal cold-weather energy use, resistive-heater failure, optional heat-pump failure, compressor replacement, blower faults, module faults, price ranges and aftermarket modifications across every i3 without an exact BMW fault path.',
    }),
    'bmw-i3-rex-engine-issues-2014': verifiedPath({
      disposition: 'recall-dealer',
      oldTitle: 'Range Extender (REx) Engine Reliability Issues',
      claims: 1,
      urls: 1,
      evidence: [
        {
          type: 'recall',
          label:
            'BMW Safety Recall 17V-088 - i3 REx Fuel Tank Vent Line',
          url: 'https://static.nhtsa.gov/odi/rcl/2017/RCRIT-17V088-6492.pdf',
        },
        {
          type: 'recall',
          label: 'NHTSA Part 573 Report 17V-088',
          url: 'https://static.nhtsa.gov/odi/rcl/2017/RCLRPT-17V088-5114.PDF',
        },
      ],
      years: [2014, 2015, 2016, 2017],
      engines: ['W20 647cc'],
      category: 'fuel',
      title: '2014-2017 i3 REx Fuel-Vent-Line Recall 17V-088',
      description:
        'BMW recall 17V-088 covers approximately 19,130 U.S. i3 REx vehicles produced March 5, 2014 through December 30, 2016. The fuel tank vent line can rub against the B+ cable protective sleeve, chafe through and release fuel vapor into the enclosed engine compartment, increasing fire risk. This bounded recall does not support the frozen all-year list of oil consumption, carbon, starter and cold-weather engine failures.',
      solution:
        'Check the VIN for an open 17V-088 campaign with BMW/NHTSA. If included, arrange the free authorized-BMW remedy: inspect the fuel tank vent line, replace it if necessary and install the separating clip. Do not substitute a fuel-pump relay, injector cleaner or generic engine parts for the recall. ShowMeTheParts lists 2014 i3 fuel-system categories, but recall inclusion and remedy are VIN/dealer controlled, so no commerce link is approved.',
      severity: 'high',
      symptoms: [
        'VIN shows an open 17V-088 recall',
        'Fuel vapor can leak into the enclosed REx engine compartment',
        'The defect may not provide a driver-detectable warning',
      ],
      systems: ['fuel tank vent line', 'B+ cable protective sleeve'],
    }),
    'bmw-i3-rex-stale-fuel-2014': archived({
      oldTitle: 'Range Extender Stale Fuel & Engine Problems - I01 REx Only',
      idSuffix: 'REx Fuel-Maintenance Aggregation',
      years: [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021],
      category: 'fuel',
      claims: 2,
      urls: 4,
      reason:
        'It turns a maintenance hypothesis into an all-year defect, prescribes unsupported six-week run intervals, fuel level, premium fuel and stabilizer, and combines relay, injector, coil, sensor, corrosion and performance claims without an exact BMW communication. Its cited SIB 16 02 15 is unrelated to this i3 REx narrative.',
    }),
  },
  expectedTelemetry: {
    claimCount: 25,
    urlCount: 40,
    claimClickCount: 0,
    recordClickCount: 3,
    priorityClickCount: 0,
  },
  expectedDispositionCounts: {
    remove: 5,
    'diagnosis-hold': 3,
    'recall-dealer': 2,
  },
  expectedPublished: 5,
  expectedArchived: 5,
  controlledDeltaProposals: [
    {
      disposition: 'proposal-only',
      insert: false,
      title: 'bmw-i3-passenger-airbag-module-recall-2014-2015',
      sources: [
        'https://static.nhtsa.gov/odi/rcl/2015/RCRIT-15V628-3244.pdf',
      ],
    },
    {
      disposition: 'proposal-only',
      insert: false,
      title: 'bmw-i3-driver-airbag-software-recall-2014-2018',
      sources: [
        'https://static.nhtsa.gov/odi/rcl/2017/RCONL-17V720-3841.pdf',
      ],
    },
  ],
  expectedProposalIdentities: [
    'bmw-i3-passenger-airbag-module-recall-2014-2015::https://static.nhtsa.gov/odi/rcl/2015/RCRIT-15V628-3244.pdf',
    'bmw-i3-driver-airbag-software-recall-2014-2018::https://static.nhtsa.gov/odi/rcl/2017/RCONL-17V720-3841.pdf',
  ],
};

config.assertReviewedAfterState = function assertReviewedAfterState(issues) {
  const published = {
    'bmw-i3-12v-battery-drain-2014': {
      years: [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021],
      engines: [],
    },
    'bmw-i3-battery-degradation-2014': {
      years: [2019, 2020, 2021],
      engines: [],
    },
    'bmw-i3-connectivity-module-2014': {
      years: [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021],
      engines: [],
    },
    'bmw-i3-dc-fast-charge-latch-2014': {
      years: [2014],
      engines: [],
    },
    'bmw-i3-rex-engine-issues-2014': {
      years: [2014, 2015, 2016, 2017],
      engines: ['W20 647cc'],
    },
  };
  if (
    issues.some((issue) => {
      const expected = published[issue.id];
      return (
        issue.after.status !== (expected ? 'published' : 'archived') ||
        JSON.stringify(issue.after.years) !==
          JSON.stringify(
            expected ? expected.years : config.records[issue.id].after.years,
          ) ||
        JSON.stringify(issue.after.engines) !==
          JSON.stringify(expected ? expected.engines : [])
      );
    })
  ) {
    throw new Error('BMW i3 reviewed scopes or statuses drifted.');
  }
};

module.exports = config;
