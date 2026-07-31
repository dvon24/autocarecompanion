const communicationsCorpus =
  'https://www.nhtsa.gov/nhtsa-datasets-and-apis';

function verifiedPath({
  disposition = 'diagnosis-hold',
  oldTitle,
  claims,
  urls,
  evidence,
  years,
  category,
  title,
  description,
  solution,
  severity,
  symptoms,
  systems,
  dtcCodes = [],
}) {
  return {
    disposition,
    decision: `Replace the frozen "${oldTitle}" aggregation with the bounded primary-source path below. Remove all ${claims} commerce claims and ${urls} outbound URL occurrences.`,
    evidence,
    after: {
      years,
      trims: [],
      engines: [],
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
      dtcCodes,
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
      title: `Archived - Unsupported BMW i8 ${idSuffix}`,
      description: `The former card asserted "${oldTitle}" across a broad BMW i8 population. ${reason}`,
      solution:
        'Do not order parts or apply a universal repair from this archived card. Verify the exact model year, production date, symptoms, DTCs, open recalls, warranty coverage and current BMW service information before diagnosis. High-voltage and hybrid cooling work belongs with properly trained personnel.',
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
      summary: `Archived the unsupported BMW i8 "${oldTitle}" aggregation and removed ${claims} commerce claims with ${urls} URLs.`,
    },
  };
}

const config = {
  label: 'BMW i8',
  make: 'BMW',
  model: 'i8',
  batchId: 'bmw-i8-full-record-cohort-12-2026-07-31',
  auditDate: '2026-07-31',
  snapshotHash:
    'c47ea2e95bd51c52ab93355849a26dd322aa41193a3210a2bc73e199b8008916',
  sourceSnapshotFileHash:
    'a48083643f66949090bac6b6e92bab21848caec644cb521c0edcc63c853d847b',
  packetFileHash:
    'ec1dc02a94d3ac83f55c644cea8ad34bf23bf6b002aee94c3315237f66ad8927',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/bmw-i8/c47ea2e95bd5/all-0001.json',
  reviewTokens: {
    blind: 'bmwi8_blind:no-blocker',
    edge: 'bmwi8_edge:no-blocker',
  },
  expectedIds: [
    'bmw-i8-12v-battery-drain-2014',
    'bmw-i8-12v-battery-hv-system-2014',
    'bmw-i8-b38-turbo-timing-2014',
    'bmw-i8-butterfly-door-actuator-2014',
    'bmw-i8-charging-port-2014',
    'bmw-i8-cooling-system-failure-2014',
    'bmw-i8-door-strut-hinge-2014',
    'bmw-i8-electrical-gremlins-2014',
    'bmw-i8-fuel-tank-recall-2014',
    'bmw-i8-hv-system-faults-2014',
  ],
  records: {
    'bmw-i8-12v-battery-drain-2014': verifiedPath({
      oldTitle: '12V Battery Parasitic Drain',
      claims: 2,
      urls: 4,
      evidence: [
        {
          type: 'tsb',
          label:
            'BMW SIB 61 05 20 - Increased Battery Drain Caused by Controller',
          url: 'https://static.nhtsa.gov/odi/tsbs/2020/MC-10172497-9999.pdf',
        },
      ],
      years: [2015, 2016, 2017, 2018, 2019, 2020],
      category: 'electrical',
      title: 'i8 CCM 415 Controller Sleep-Delay Diagnosis',
      description:
        'BMW SIB 61 05 20 defines a path for i8 vehicles produced from July 1, 2015 when yellow Check Control Message 415 reports increased battery drain and ISTA Energy Diagnosis identifies the Controller as the cause. The Controller may delay vehicle sleep by up to six minutes. BMW states that replacing the Controller will not correct this path.',
      solution:
        'Confirm CCM 415 and run BMW ISTA Energy Diagnosis. Only when the Controller is identified and the I-level is below I001-19-11-530 does the bulletin direct programming to that level or higher. If either condition is absent, continue standard diagnosis. Do not replace the Controller or buy a generic battery maintainer or scan tool as the repair.',
      severity: 'medium',
      symptoms: [
        'Yellow Check Control Message 415 for increased battery drain',
        'Energy Diagnosis identifies the Controller as the sleep-delay source',
        'Complaint occurs when starting after the vehicle was parked',
      ],
      systems: [
        '12-volt energy management',
        'Controller sleep logic',
      ],
    }),
    'bmw-i8-12v-battery-hv-system-2014': archived({
      oldTitle: '12V Battery & High-Voltage System Interaction Issues',
      idSuffix: '12V and HV Interaction Aggregation',
      years: [2014, 2015, 2016, 2017, 2018, 2019, 2020],
      category: 'electrical',
      claims: 11,
      urls: 13,
      reason:
        'It duplicates the retained CCM 415 path but adds broad DC-DC, battery-registration, high-voltage wake-up and module-reset theories, unverified capacity claims and numerous generic batteries, chargers and scan tools without exact BMW fault boundaries or fitment.',
    }),
    'bmw-i8-b38-turbo-timing-2014': archived({
      oldTitle:
        'B38 Turbocharger & Timing Chain Issues - High Mileage',
      idSuffix: 'B38 Turbo and Timing Aggregation',
      years: [2014, 2015, 2016, 2017, 2018, 2019, 2020],
      category: 'engine',
      claims: 3,
      urls: 5,
      reason:
        'It merges turbo wear, oil consumption, wastegate noise and timing-chain wear into an all-year high-mileage defect using non-primary evidence, then promotes a generic turbocharger, timing kit and oil without a BMW bulletin, fault code, measured wear limit or verified i8 fitment.',
    }),
    'bmw-i8-butterfly-door-actuator-2014': verifiedPath({
      oldTitle: 'Butterfly Door Actuator/Strut Failure',
      claims: 3,
      urls: 5,
      evidence: [
        {
          type: 'tsb',
          label:
            'BMW SIB 51 31 19 - i8 Door Will Not Open or Close',
          url: 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10167997-9999.pdf',
        },
      ],
      years: [2014, 2015, 2016, 2017, 2018, 2019, 2020],
      category: 'body',
      title: 'i8 Low-Voltage Door-Latch Failsafe Diagnosis',
      description:
        'BMW SIB 51 31 19 defines an I12 i8 Coupe and I15 i8 Roadster path when one or both doors will not latch or unlatch. Low voltage in the vehicle 12-volt battery or key-fob battery can temporarily fault the door-lock actuator and place the latch in failsafe mode. This does not support the frozen card\'s universal door-strut or mechanical-actuator failure theory.',
      solution:
        'Check the door-release-switch LED and read Body Domain Controller faults. Run Energy Diagnosis for the 12-volt system and test the key-fob batteries. Repair the voltage cause first, then follow the BMW latch-reset procedure when the bulletin criteria are met. If BDC door-lock faults are present or the LED pattern does not match, continue ISTA diagnosis. Do not replace struts, hinges or actuators from this card.',
      severity: 'medium',
      symptoms: [
        'One or both doors will not latch or unlatch',
        'Door-release-switch LED flashes more than twice',
        'Fault follows low 12-volt or key-fob battery voltage',
      ],
      systems: [
        'door-lock actuator',
        'door latch failsafe',
        '12-volt and key-fob battery supply',
      ],
    }),
    'bmw-i8-charging-port-2014': archived({
      oldTitle: 'Charging Port & Charge Flap Actuator Failure',
      idSuffix: 'Charge-Port and Flap Aggregation',
      years: [2014, 2015, 2016, 2017, 2018, 2019, 2020],
      category: 'electrical',
      claims: 4,
      urls: 4,
      reason:
        'It combines flap actuation, charge-port locking, charging interruption, release-cable use and cold-weather behavior into a single all-year hardware defect without an exact i8 BMW bulletin, fault-code set or production boundary.',
    }),
    'bmw-i8-cooling-system-failure-2014': verifiedPath({
      oldTitle:
        'Hybrid Cooling System Failure - B38 Engine Overheating',
      claims: 3,
      urls: 5,
      evidence: [
        {
          type: 'tsb',
          label:
            'BMW SIB 17 02 15 - Turbocharger Coolant Pump Fault 20A503',
          url: 'https://static.nhtsa.gov/odi/tsbs/2015/SB-10059010-9079.pdf',
        },
      ],
      years: [2014, 2015],
      category: 'cooling',
      title: 'Early i8 Turbo-Coolant-Pump Fault 20A503',
      description:
        'BMW SIB 17 02 15 defines an I12 i8 path for Check Control Message Drive Check ID49 with DME fault 20A503, turbocharger coolant pump signal implausible, when no drivability issue is present. BMW identifies DME diagnostic software as the cause in the bulletin path; it does not establish the frozen card\'s model-wide overheating, leak or multiple-pump failure claims.',
      solution:
        'Clear the fault and activate the turbocharger coolant pump with the specified ISTA/D test plan. If activation succeeds and 20A503 does not return, BMW says no repair is required at that time. If it returns during activation, continue ISTA diagnosis; the auxiliary coolant pump may then require replacement. ShowMeTheParts resolves exact 2015 i8 water-pump fitment and the 1.5-liter engine but returned no matching turbo-pump candidate, so no part link is approved.',
      severity: 'medium',
      symptoms: [
        'Drive Check ID49 is displayed',
        'DME fault 20A503 is stored',
        'No drivability issue is present in the bulletin path',
      ],
      systems: [
        'turbocharger coolant pump',
        'DME diagnostic software',
      ],
      dtcCodes: ['20A503'],
    }),
    'bmw-i8-door-strut-hinge-2014': archived({
      oldTitle: 'Dihedral (Butterfly) Door Strut & Hinge Wear',
      idSuffix: 'Door-Strut and Hinge Aggregation',
      years: [2014, 2015, 2016, 2017, 2018, 2019, 2020],
      category: 'body',
      claims: 3,
      urls: 5,
      reason:
        'It duplicates the door complaint but asserts gradual gas-strut and hinge wear, temperature dependence and replacement intervals using non-primary evidence, then promotes generic supports and lubricant without BMW measurements, part validation or a matching bulletin.',
    }),
    'bmw-i8-electrical-gremlins-2014': archived({
      oldTitle:
        'Electrical System Gremlins - Wiring Harness & Module Failures',
      idSuffix: 'Electrical-Gremlins Aggregation',
      years: [2014, 2015, 2016, 2017, 2018, 2019, 2020],
      category: 'electrical',
      claims: 9,
      urls: 9,
      reason:
        'It combines warning lights, infotainment resets, lighting, windows, sensors, wiring, moisture, modules and grounding into an undefined all-year defect, then promotes generic scan tools, electrical supplies and battery products without a reproducible BMW fault path.',
    }),
    'bmw-i8-fuel-tank-recall-2014': verifiedPath({
      disposition: 'recall-dealer',
      oldTitle:
        'Fuel Tank Ground Cable Weld Defect - Fire Risk (Recall)',
      claims: 2,
      urls: 4,
      evidence: [
        {
          type: 'recall',
          label:
            'BMW Recall 14V-674 Remedy Instructions - Fuel Tank Ground Stud',
          url: 'https://static.nhtsa.gov/odi/rcl/2014/RCRIT-14V674-6623.pdf',
        },
        {
          type: 'recall',
          label:
            'NHTSA Recall 14V-674 Acknowledgement - i8 Fuel Tank Weld',
          url: 'https://static.nhtsa.gov/odi/rcl/2014/RCAK-14V674-7884.pdf',
        },
      ],
      years: [2014],
      category: 'fuel',
      title: '2014 i8 Fuel-Tank Weld Recall 14V-674',
      description:
        'BMW recall 14V-674 covers 223 VIN-defined 2014 i8 vehicles produced May 16 through September 16, 2014. The bolt or ground stud at the bottom of the fuel tank may not have been welded correctly, which can allow a fuel leak and create a fire risk in the presence of an ignition source.',
      solution:
        'Check the VIN for an open 14V-674 campaign. If included, have an authorized BMW dealer inspect the fuel-tank ground-stud weld and replace the fuel tank if the BMW inspection fails or is questionable, at no charge. Do not attempt the high-voltage-adjacent inspection or order tank hardware from this card. If fuel odor or leakage appears, stop using the vehicle and contact BMW assistance.',
      severity: 'high',
      symptoms: [
        'VIN shows an open 14V-674 recall',
        'Fuel odor',
        'Fuel drips or leakage near the tank during refueling',
      ],
      systems: [
        'fuel tank',
        'fuel-tank ground-stud weld',
      ],
    }),
    'bmw-i8-hv-system-faults-2014': verifiedPath({
      oldTitle: 'Hybrid High-Voltage System Faults',
      claims: 5,
      urls: 5,
      evidence: [
        {
          type: 'tsb',
          label:
            'BMW SIB 01 09 24 - i8 HV Battery Temperature-Sensor Limited Warranty',
          url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-11010892-0001.pdf',
        },
      ],
      years: [2014, 2015, 2016, 2017],
      category: 'electrical',
      title: '2014-2017 i8 HV Battery Temperature-Sensor Path',
      description:
        'BMW SIB 01 09 24 identifies VIN-eligible 2014-2017 I12 i8 Coupe vehicles produced April 16, 2014 through October 19, 2017 for a component-specific 10-year/120,000-mile US limited-warranty extension. Internal high-voltage battery cell-module temperature sensors can drift out of specification, producing Check Control messages, stored faults or a malfunction indicator lamp. This is not a recall and does not cover other battery components.',
      solution:
        'Check the VIN-specific Warranty Vehicle Inquiry for the SIB 01 09 24 coverage notice and perform BMW\'s corresponding ISTA diagnosis. If a cell-module temperature sensor is confirmed failed, a properly high-voltage-certified BMW technician follows the test plan to install the applicable internal NTC repair kit. No immediate repair is required without the documented problem, and independent battery disassembly or generic module replacement is unsafe.',
      severity: 'high',
      symptoms: [
        'VIN shows the SIB 01 09 24 limited-warranty notice',
        'High-voltage battery Check Control message',
        'Implausible or impermissible cell-module temperature reading',
        'Related stored fault or malfunction indicator lamp',
      ],
      systems: [
        'high-voltage battery cell module',
        'internal NTC temperature sensors',
      ],
    }),
  },
  expectedTelemetry: {
    claimCount: 45,
    urlCount: 59,
    claimClickCount: 0,
    recordClickCount: 0,
    priorityClickCount: 0,
  },
  expectedDispositionCounts: {
    remove: 5,
    'recall-dealer': 1,
    'diagnosis-hold': 4,
  },
  expectedPublished: 5,
  expectedArchived: 5,
  controlledDeltaProposals: [
    {
      disposition: 'proposal-only',
      insert: false,
      title: 'bmw-i8-turbocord-portable-charger-recall',
      sources: [
        'https://static.nhtsa.gov/odi/rcl/2018/RCLRPT-18V652-7451.PDF',
      ],
    },
    {
      disposition: 'proposal-only',
      insert: false,
      title: 'bmw-i8-false-top-up-coolant-message',
      sources: [
        'https://static.nhtsa.gov/odi/tsbs/2019/MC-10159119-9999.pdf',
      ],
    },
  ],
  expectedProposalIdentities: [
    'bmw-i8-turbocord-portable-charger-recall::https://static.nhtsa.gov/odi/rcl/2018/RCLRPT-18V652-7451.PDF',
    'bmw-i8-false-top-up-coolant-message::https://static.nhtsa.gov/odi/tsbs/2019/MC-10159119-9999.pdf',
  ],
};

config.assertReviewedAfterState = function assertReviewedAfterState(
  issues,
) {
  const published = {
    'bmw-i8-12v-battery-drain-2014': [
      2015,
      2016,
      2017,
      2018,
      2019,
      2020,
    ],
    'bmw-i8-butterfly-door-actuator-2014': [
      2014,
      2015,
      2016,
      2017,
      2018,
      2019,
      2020,
    ],
    'bmw-i8-cooling-system-failure-2014': [2014, 2015],
    'bmw-i8-fuel-tank-recall-2014': [2014],
    'bmw-i8-hv-system-faults-2014': [2014, 2015, 2016, 2017],
  };
  if (
    issues.some((issue) => {
      const years = published[issue.id];
      return (
        issue.after.status !== (years ? 'published' : 'archived') ||
        JSON.stringify(issue.after.years) !==
          JSON.stringify(
            years || config.records[issue.id].after.years,
          ) ||
        JSON.stringify(issue.after.engines) !== JSON.stringify([])
      );
    })
  ) {
    throw new Error('BMW i8 reviewed scopes or statuses drifted.');
  }
};

module.exports = config;
