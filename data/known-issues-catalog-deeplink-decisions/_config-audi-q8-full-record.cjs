const cite = (type, title, url) => ({ type, title, url });

const citations = {
  starterAlternatorAction: cite(
    'manual',
    'Audi Service Action 27BQ - Starter-Alternator',
    'https://static.nhtsa.gov/odi/tsbs/2025/MC-11012543-0001.pdf',
  ),
  starterAlternatorDiagnosis: cite(
    'tsb',
    'Audi TSB 2058831/15 - 48V Starter-Alternator U046900 Diagnosis',
    'https://static.nhtsa.gov/odi/tsbs/2024/MC-11011249-0001.pdf',
  ),
  canSensorDiagnosis: cite(
    'tsb',
    'Audi TSB 2073284/3 - U046900 CAN and Sensor Diagnosis',
    'https://static.nhtsa.gov/odi/tsbs/2024/MC-11005866-0001.pdf',
  ),
  auditIndex: cite(
    'manual',
    'Audi On-Car Analysis List - Q7/Q8 Diagnostic Topics',
    'https://static.nhtsa.gov/odi/tsbs/2023/MC-10245649-0001.pdf',
  ),
  airSuspension: cite(
    'tsb',
    'Audi TSB 2059363/6 - Air Suspension Warning with C1260F0 or U112100',
    'https://static.nhtsa.gov/odi/tsbs/2024/MC-11002225-0001.pdf',
  ),
  coolantPump: cite(
    'tsb',
    'Audi TSB 2070349/4 - V6 TFSI Coolant-Pump Leak Diagnosis',
    'https://static.nhtsa.gov/odi/tsbs/2024/MC-11007223-0001.pdf',
  ),
  shockRecall: cite(
    'recall',
    'Audi Safety Recall 40O4 / NHTSA 19V114 - Front Shock-Absorber Fork',
    'https://static.nhtsa.gov/odi/rcl/2019/RCRIT-19V114-2837.pdf',
  ),
  fuelRecall: cite(
    'recall',
    'NHTSA 22V516 / Audi 20DR - Fuel-Delivery-Module Recall',
    'https://static.nhtsa.gov/odi/rcl/2022/RCLRPT-22V516-2960.PDF',
  ),
  cameraRecall: cite(
    'recall',
    'NHTSA 25V900 / Audi 90TV - Rearview Camera Software Recall',
    'https://static.nhtsa.gov/odi/rcl/2025/RCLRPT-25V900-3613.pdf',
  ),
  sunroof: cite(
    'tsb',
    'Audi TSB 2056944/10 - Q8 Water Entry from Sunroof Area',
    'https://static.nhtsa.gov/odi/tsbs/2023/MC-10244501-0001.pdf',
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
  'audi-q8-48v-system-2019': {
    disposition: 'recall-dealer',
    decision:
      'Replace the unsupported generic BSG, battery, DC-DC, cold-weather and rough-restart aggregation with VIN-first Audi Service Action 27BQ for 2019-2024 Q8 vehicles. Preserve the start-stop symptom without turning any warning into proof of starter-alternator failure. Remove all five commerce claims and URLs.',
    evidence: [
      {
        label:
          'Audi Service Action 27BQ lists 2019-2024 Q8 vehicles and makes open VIN status in Elsa the eligibility gate for no-cost starter-alternator replacement',
        url: citations.starterAlternatorAction.url,
      },
      {
        label:
          'Audi TSB 2058831/15 requires guided diagnosis and a defined B200096 result before starter-alternator replacement outside the campaign path',
        url: citations.starterAlternatorDiagnosis.url,
      },
      {
        label:
          'Audi TSB 2073284/3 documents U046900 sensor and CAN paths for which starter-alternator replacement will not correct the concern',
        url: citations.canSensorDiagnosis.url,
      },
    ],
    after: {
      years: [2019, 2020, 2021, 2022, 2023, 2024],
      trims: [],
      engines: [],
      category: 'electrical',
      title:
        '2019-2024 Q8 Starter-Alternator Service Action 27BQ - Check VIN',
      description:
        'Audi Service Action 27BQ includes certain 2019-2024 Q8 vehicles equipped with a 48V belt starter-alternator. Audi states that an affected unit can inhibit start-stop operation and increase emissions while stopped, while emissions remain within certification standards. Model year alone does not establish eligibility: the VIN must show 27BQ open. A generic electrical warning, rough restart or U046900 by itself does not prove starter-alternator failure.',
      solution:
        'Check the VIN and current campaign status with an Audi dealer. If 27BQ is open, the dealer follows the campaign procedure and replaces the starter-alternator at no cost when directed. If the action is not open, use Audi guided diagnostics: current bulletins distinguish a replacement result from sensor and CAN faults that replacement will not fix. Do not buy a 12V battery, charger or starter from this card.',
      severity: 'medium',
      confidence: 'high',
      source: 'manual',
      symptoms: [
        'Start-stop function unavailable on a VIN with Service Action 27BQ open',
        'Electrical-system warning requiring Audi guided diagnosis',
      ],
      affectedSystems: [
        '48V belt starter-alternator',
        '48V mild-hybrid electrical system',
        'start-stop system',
      ],
      dtcCodes: [],
      citations: [
        citations.starterAlternatorAction,
        citations.starterAlternatorDiagnosis,
        citations.canSensorDiagnosis,
      ],
      summary:
        'Replaced a generic Q8 48V failure aggregation with VIN-first 2019-2024 Service Action 27BQ and current guided-diagnosis limits; removed 2025, cold-weather, battery and DC-DC assumptions, 550 seeded reports plus five commerce claims and URLs.',
    },
  },
  'audi-q8-8-speed-tiptronic-harsh-shifting-jolt-delayed-engagement': {
    disposition: 'remove',
    decision:
      'Archive the unsupported Q8/RS Q8 forum aggregation that prescribed a full ZF service, adaptation, software and mounts across several distinct symptoms. No Audi primary source in the audit established one 2019-2023 Q8 condition or that universal repair. Remove the commerce claim and three URLs.',
    evidence: [
      {
        label:
          'Audi current Q7/Q8 diagnostic-topic material demonstrates symptom-specific guided paths and does not establish the seeded universal harsh-shift diagnosis or repair',
        url: citations.auditIndex.url,
      },
    ],
    after: archived({
      years: [2019, 2020, 2021, 2022, 2023],
      category: 'transmission',
      title: 'Unsupported Q8 Harsh-Shift and Delayed-Engagement Aggregation',
      description:
        'The former row combined low-speed downshifts, 1-2 upshifts, delayed engagement and an RS Q8 manual-shift report, then prescribed fluid service, adaptation, software and mount replacement without an Audi source establishing one Q8 condition.',
      solution:
        'Do not select a transmission service kit or reset adaptations from this archived row. Record the exact operating condition and stored faults, then diagnose the engine, mounts, fluid level and transmission control path using VIN-specific Audi information.',
      citation: citations.auditIndex,
      summary:
        'Archived an unsupported cross-model harsh-shift aggregation; removed forum-only causation, universal ZF service and adaptation advice plus one commerce claim and three URLs.',
    }),
  },
  'audi-q8-air-suspension-2019': {
    disposition: 'diagnosis-hold',
    decision:
      'Replace the generic spring, compressor, vehicle-weight, cost and coil-conversion aggregation with exact Audi TSB 2059363/6. The supported condition is C1260F0 or U112100 with symptom code 262400 on air-suspension-equipped 2019-2025 Q8 vehicles. Remove all three commerce claims and five URLs.',
    evidence: [
      {
        label:
          'Audi TSB 2059363/6 explicitly lists 2019-2025 Q8 vehicles and defines the J775/J1135 wiring, first-passive, repeated-passive and active/static branches for C1260F0/U112100 symptom 262400',
        url: citations.airSuspension.url,
      },
    ],
    after: {
      years: [2019, 2020, 2021, 2022, 2023, 2024, 2025],
      trims: [],
      engines: [],
      category: 'suspension',
      title:
        '2019-2025 Q8 Air-Suspension J1135 Communication Fault - TSB 2059363/6',
      description:
        'Audi TSB 2059363/6 applies to air-suspension-equipped 2019-2025 Q8 vehicles when the instrument cluster reports an air-suspension malfunction and suspension control unit J775 stores C1260F0 for no communication or U112100 for a missing message, both with symptom code 262400. The bulletin identifies communication with compressor-control unit J1135; it does not establish universal air-spring, strut or compressor wear.',
      solution:
        'Inspect the wiring and connector contacts between J775 and J1135 before replacing a component. For a first passive or sporadic occurrence, clear the fault and release the vehicle. If the same passive fault returns a second time, or the fault is active or static after wiring inspection, Audi directs replacement of J1135 under current repair and parts information. Do not buy struts, springs, a compressor or a conversion kit solely from this warning.',
      severity: 'medium',
      confidence: 'high',
      source: 'manual',
      symptoms: ['Air-suspension malfunction warning in the instrument cluster'],
      affectedSystems: [
        'air-suspension control module J775',
        'compressor control module J1135',
        'air-suspension wiring and connectors',
      ],
      dtcCodes: ['C1260F0', 'U112100'],
      citations: [citations.airSuspension],
      summary:
        'Replaced a generic Q8 spring, compressor and vehicle-weight aggregation with exact 2019-2025 J775/J1135 communication diagnosis; removed fixed costs, coil-conversion advice plus three commerce claims and five URLs.',
    },
  },
  'audi-q8-carbon-buildup-2019': {
    disposition: 'remove',
    decision:
      'Archive the unsupported universal intake-valve carbon, valve-damage, 60,000-mile walnut-blasting and catch-can aggregation. The record has no primary citation and the current Audi Q8 V6 diagnostic material does not establish these universal assertions. Remove the commerce claim and URL.',
    evidence: [
      {
        label:
          'Audi current Q8 V6 technical material documents bounded coolant-pump diagnosis and demonstrates the need for symptom-specific confirmation rather than the seeded universal carbon-maintenance claim',
        url: citations.coolantPump.url,
      },
    ],
    after: archived({
      years: [2019, 2020, 2021, 2022, 2023],
      category: 'engine',
      title: 'Unsupported Q8 Intake-Valve Carbon and Walnut-Blasting Aggregation',
      description:
        'The former row asserted universal severe intake-valve carbon, mandatory walnut blasting every 60,000 miles, engine damage and catch-can effectiveness without an Audi Q8 primary source.',
      solution:
        'Do not schedule walnut blasting or buy a catch can from this archived row. Diagnose rough idle, misfires, hesitation or power loss using stored faults, measured values and VIN-specific Audi repair information.',
      citation: citations.coolantPump,
      summary:
        'Archived an unsupported Q8 intake-valve carbon aggregation; removed mandatory 60,000-mile service, valve-damage, fixed-cost and catch-can claims plus one commerce link.',
    }),
  },
  'audi-q8-ea839-3-0t-water-pump-internal-leak-coolant-loss': {
    disposition: 'diagnosis-hold',
    decision:
      'Replace the inherent-design-flaw, 2.9L RS Q8, universal internal-leak, revised-pump and P0299 aggregation with exact Audi TSB 2070349/4. Scope it to 2019-2024 Q8 V6 TFSI vehicles and preserve P0299 only as possible secondary N649 coolant contamination after a confirmed pump leak. Remove the commerce claim and three URLs.',
    evidence: [
      {
        label:
          'Audi TSB 2070349/4 explicitly lists 2019-2024 Q8 vehicles, requires precise leak confirmation, distinguishes normal small traces and documents possible P0299 from N649 coolant contamination',
        url: citations.coolantPump.url,
      },
    ],
    after: {
      years: [2019, 2020, 2021, 2022, 2023, 2024],
      trims: [],
      engines: ['V6 TFSI'],
      category: 'cooling',
      title:
        '2019-2024 Q8 V6 Coolant-Pump Leak Diagnosis - TSB 2070349/4',
      description:
        'Audi TSB 2070349/4 applies to 2019-2024 Q8 V6 TFSI vehicles with coolant loss, a coolant warning or an engine warning when the coolant pump is suspected. Audi requires precise leak confirmation: a small trace in the drip cup can be normal and dried deposits at the vacuum connection alone do not prove a leak. In individual confirmed cases, coolant can contaminate change-over valve N649 and produce P0299 as a secondary condition.',
      solution:
        'Have the suspected area cleaned and dried, fill the cooling system correctly, inspect at idle and up to about 2,500 rpm, and pressure-test it per Audi repair information. If no leak returns, continue to observe without replacing parts. Replace only the component proven to leak and inspect the vacuum path and N649 when P0299 is present. Do not order a pump from this card without confirmation.',
      severity: 'medium',
      confidence: 'high',
      source: 'manual',
      symptoms: [
        'Coolant loss or visible leak',
        'Coolant warning lamp',
        'Engine warning lamp with a confirmed coolant-pump leak',
      ],
      affectedSystems: [
        'V6 TFSI coolant pump',
        'coolant-pump vacuum connection',
        'coolant-pump change-over valve N649',
      ],
      dtcCodes: ['P0299'],
      citations: [citations.coolantPump],
      summary:
        'Replaced an inherent-design-flaw and universal pump-replacement narrative with exact 2019-2024 Q8 V6 leak-confirmation, normal-trace and N649/P0299 gates; removed 2025, RS Q8, redesign and unrelated parts claims plus one commerce claim and three URLs.',
    },
  },
  'audi-q8-front-brake-rotor-corrosion-premature-pad-rotor-wear': {
    disposition: 'remove',
    decision:
      'Archive the low-confidence forum/article aggregation that attributed corrosion and premature wear to vehicle weight, wheel size and rotor coating without an Audi Q8 primary source. Remove the commerce claim and three URLs.',
    evidence: [
      {
        label:
          'Audi current Q7/Q8 diagnostic-topic material does not establish the seeded universal Q8 brake-rotor corrosion, wheel-size causation or premature-wear condition',
        url: citations.auditIndex.url,
      },
    ],
    after: archived({
      years: [2019, 2020, 2021, 2022, 2023, 2024],
      category: 'brakes',
      title: 'Unsupported Q8 Brake-Rotor Corrosion and Premature-Wear Aggregation',
      description:
        'The former row combined ordinary surface rust, rotor coating, wheel size, vehicle weight, squeal, pulsation and premature pad and rotor wear without a Q8 Audi bulletin establishing one condition.',
      solution:
        'Do not select pads or rotors from this archived row. Inspect disc thickness, runout, corrosion, pad condition and caliper operation, and use the exact VIN and brake PR code for any parts decision.',
      citation: citations.auditIndex,
      summary:
        'Archived a low-confidence unsupported Q8 brake-wear aggregation; removed weight, wheel-size, coating and universal replacement claims plus one commerce claim and three URLs.',
    }),
  },
  'audi-q8-front-shock-absorber-fork-cracking': {
    disposition: 'recall-dealer',
    decision:
      'Retain the safety issue but make it VIN-first and primary-source-only under Audi recall 40O4 / NHTSA 19V114. Remove the secondary citation, unsupported broad symptom list and the direct part-shopping claim with three URLs.',
    evidence: [
      {
        label:
          'Audi recall 40O4 explicitly covers certain 2019 Q7 and Q8 vehicles, a front shock-absorber fork that may crack, impaired steering control and free replacement after VIN verification',
        url: citations.shockRecall.url,
      },
    ],
    after: {
      years: [2019],
      trims: [],
      engines: [],
      category: 'suspension',
      title:
        '2019 Q8 Front Shock-Absorber Fork Recall 40O4 (19V114) - Check VIN',
      description:
        'Certain 2019 Audi Q8 vehicles are covered by Safety Recall 40O4 / NHTSA 19V114. Audi states that a front shock-absorber fork may crack, allowing the shock absorber to loosen and the tire to contact the wheel housing, which can affect steering control and increase crash risk. Only a small VIN-defined population is affected; model year alone is not eligibility.',
      solution:
        'Check the VIN for open recall 40O4 with Audi or NHTSA and contact an authorized Audi dealer. The dealer replaces the affected front shock-absorber fork free of charge. Do not buy a fork from this card or assume a generic suspension noise proves the recall condition.',
      severity: 'high',
      confidence: 'high',
      source: 'nhtsa-verified',
      symptoms: [
        'VIN is included in open recall 40O4',
        'Possible change in steering control if the fork cracks',
      ],
      affectedSystems: [
        'front shock-absorber fork',
        'front shock absorber mounting',
      ],
      dtcCodes: [],
      citations: [citations.shockRecall],
      summary:
        'Retained the exact 2019 Q8 shock-fork safety recall with VIN eligibility and free dealer remedy; removed a secondary citation, speculative symptom list and one direct parts claim with three URLs.',
    },
  },
  'audi-q8-fuel-pump-internal-failure-causing-engine-stall': {
    disposition: 'recall-dealer',
    decision:
      'Retain the issue under exact NHTSA 22V516 / Audi 20DR scope for 2019-2021 Q8 V6 vehicles. Replace secondary citations with the Part 573 filing, keep the warning and stall path, require VIN eligibility and remove the parts claim with three URLs.',
    evidence: [
      {
        label:
          'NHTSA 22V516 identifies 2019-2021 Q8 V6 vehicles, fuel-delivery-module internal breakage, the emissions warning, rough running/no-start and rare stall risk, plus improved-module dealer replacement',
        url: citations.fuelRecall.url,
      },
    ],
    after: {
      years: [2019, 2020, 2021],
      trims: [],
      engines: ['V6'],
      category: 'fuel',
      title:
        '2019-2021 Q8 V6 Fuel-Delivery-Module Recall 20DR (22V516)',
      description:
        'Certain 2019-2021 Audi Q8 V6 vehicles are covered by NHTSA recall 22V516 / Audi 20DR. A component inside the fuel-delivery module can break and damage the pressure-regulator sealing membrane. The emissions-control warning usually illuminates, and rough running or a no-start can occur; in rare cases the engine can stall while driving without a prior warning, increasing crash risk. Eligibility is VIN-specific.',
      solution:
        'Check the VIN for open recall 20DR and contact an authorized Audi dealer. The recall remedy replaces the fuel-delivery module with the improved version. Do not purchase the old or improved module from this card or attempt an in-tank repair based only on the model year.',
      severity: 'high',
      confidence: 'high',
      source: 'nhtsa-verified',
      symptoms: [
        'Emissions-control-system warning',
        'Rough engine running',
        'Engine no-start',
        'Rare loss of engine power or stall',
      ],
      affectedSystems: ['in-tank fuel-delivery module', 'pressure regulator'],
      dtcCodes: [],
      citations: [citations.fuelRecall],
      summary:
        'Retained exact 2019-2021 Q8 V6 recall 20DR/22V516 with primary-source symptoms, VIN gate and improved-module remedy; removed secondary sources and one direct parts claim with three URLs.',
    },
  },
  'audi-q8-mmi-electrical-2019': {
    disposition: 'remove',
    decision:
      'Archive this duplicate generic touchscreen, camera, sensor, battery-drain and head-unit-replacement aggregation. The retained MMI record is converted to the exact rearview-camera software recall; this row has no primary evidence for the remaining bundled claims. Remove the commerce claim and URL.',
    evidence: [
      {
        label:
          'NHTSA 25V900 supports the separate retained rearview-camera software recall but does not establish this duplicate generic MMI, sensor, battery-drain and module-failure aggregation',
        url: citations.cameraRecall.url,
      },
    ],
    after: archived({
      years: [2019, 2020, 2021, 2022, 2023],
      category: 'electrical',
      title: 'Duplicate Unsupported Q8 MMI and Electrical Aggregation',
      description:
        'The former row bundled touchscreen freezing, no-boot, random reboots, camera failure, parking sensors, warning lights, battery drain and head-unit replacement without one primary source. Rearview-camera software risk is handled by the separate retained recall card.',
      solution:
        'Do not buy a display or MMI module from this archived row. Check for open recall 90TV when the rearview image is missing; diagnose other infotainment or electrical symptoms against the VIN, software level and stored faults.',
      citation: citations.cameraRecall,
      summary:
        'Archived a duplicate unsupported MMI and electrical aggregation; preserved the exact camera-recall path in the retained card and removed fixed costs plus one commerce link.',
    }),
  },
  'audi-q8-mmi-infotainment-2019': {
    disposition: 'recall-dealer',
    decision:
      'Replace the generic dual-screen freeze, phantom-touch, reset and Wi-Fi aggregation with exact rearview-camera software recall 90TV / 25V900 for 2019-2026 Q8 vehicles. Preserve only the missing camera-image safety condition and remove all three commerce claims and URLs.',
    evidence: [
      {
        label:
          'NHTSA recall 25V900 explicitly lists 2019-2026 Q8 vehicles and identifies driver-assistance software that can prevent the rearview-camera image from displaying, with a free software remedy',
        url: citations.cameraRecall.url,
      },
    ],
    after: {
      years: [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
      trims: [],
      engines: [],
      category: 'safety',
      title:
        '2019-2026 Q8 Rearview-Camera Software Recall 90TV (25V900)',
      description:
        'Certain 2019-2026 Audi Q8 vehicles are included in NHTSA recall 25V900 / Audi 90TV because driver-assistance software can prevent the rearview-camera image from displaying. A missing rearview image reduces visibility while reversing and increases crash risk. Eligibility depends on the VIN and installed parts and software, not model year alone. The recall does not establish universal dual-screen freezing, phantom touches or hardware failure.',
      solution:
        'Check the VIN for recall 25V900/90TV and contact an authorized Audi dealer. Dealers install more robust driver-assistance software free of charge. Until repaired, use extra caution when reversing. A hard reset, scan tool, relay, multimeter or temporary image recovery is not completion of the recall.',
      severity: 'high',
      confidence: 'high',
      source: 'nhtsa-verified',
      symptoms: ['Rearview camera image does not display'],
      affectedSystems: [
        'driver-assistance control-unit software',
        'rearview camera display',
      ],
      dtcCodes: [],
      citations: [citations.cameraRecall],
      summary:
        'Replaced a generic MMI freeze and phantom-touch aggregation with exact 2019-2026 Q8 rearview-camera recall 90TV/25V900; removed 500 seeded reports, reset and Wi-Fi advice plus three commerce claims and URLs.',
    },
  },
  'audi-q8-oil-separator-pcv-valve-failure-elevated-oil-consumption': {
    disposition: 'remove',
    decision:
      'Archive the unsupported universal plastic-PCV crack, sludge, oil-consumption and updated-part aggregation. Its two citations are non-primary and no Audi Q8 bulletin found in the audit established that combined condition. Remove the commerce claim and three URLs.',
    evidence: [
      {
        label:
          'Audi current Q8 V6 coolant-pump bulletin documents a separate vacuum-system contamination path and does not support the seeded PCV assembly failure or oil-consumption attribution',
        url: citations.coolantPump.url,
      },
    ],
    after: archived({
      years: [2019, 2020, 2021, 2022, 2023],
      category: 'engine',
      title: 'Unsupported Q8 PCV and Oil-Consumption Aggregation',
      description:
        'The former row attributed oil consumption, rough idle, extended cranking, fouled plugs, lean faults and misfires to a cracked or sludged oil-separator assembly without an Audi Q8 primary source or a bounded diagnostic condition.',
      solution:
        'Do not select a PCV assembly from this archived row. Measure oil consumption and crankcase pressure, check for external leaks and stored faults, and identify the exact failure before replacing parts.',
      citation: citations.coolantPump,
      summary:
        'Archived an unsupported Q8 PCV and oil-consumption aggregation; removed universal causation, updated-part and labor assertions plus one commerce claim and three URLs.',
    }),
  },
  'audi-q8-panoramic-sunroof-water-leak-into-cabin': {
    disposition: 'diagnosis-hold',
    decision:
      'Replace secondary owner/article citations and the overbroad 2019-2023 stress-crack narrative with Audi TSB 2056944/10 for 2019-2021 Q8 vehicles. Preserve the headliner drip and Audi four-branch inspection while removing the direct sunroof-frame parts claim and three URLs.',
    evidence: [
      {
        label:
          'Audi TSB 2056944/10 explicitly lists 2019-2021 Q8 vehicles with water dripping from the headliner and requires inspection of drains, opening seal, glass adjustment and water channeling before parts replacement',
        url: citations.sunroof.url,
      },
    ],
    after: {
      years: [2019, 2020, 2021],
      trims: [],
      engines: [],
      category: 'body',
      title:
        '2019-2021 Q8 Water Entry from Sunroof Area - TSB 2056944/10',
      description:
        'Audi TSB 2056944/10 applies to 2019-2021 Q8 vehicles when water drips from the headliner area. Audi requires inspection of four possible paths: a blocked, pinched or kinked drain hose or outlet; a detached or malformed roof-opening seal; incorrect glass-panel adjustment; or water breaching normal channeling around the wind deflector. The bulletin does not support a universal cracked tray or full sunroof-frame replacement.',
      solution:
        'Have all four bulletin branches inspected and water-flow tested. Clear a drain obstruction or replace a damaged hose or valve, replace a damaged opening seal, correct glass adjustment, and perform the specified wind-deflector and channel modifications when applicable. Replace the sunroof frame only when actual structural damage is found. Do not order a frame from this card.',
      severity: 'medium',
      confidence: 'high',
      source: 'manual',
      symptoms: ['Water dripping from the headliner area'],
      affectedSystems: [
        'sunroof drain hoses and outlet valves',
        'roof-opening seal',
        'sunroof glass adjustment',
        'wind deflector and water channels',
      ],
      dtcCodes: [],
      citations: [citations.sunroof],
      summary:
        'Replaced secondary-source Q8 sunroof claims with exact 2019-2021 TSB 2056944/10 four-branch inspection and repair limits; removed 2022-2023, universal cracked-frame claims plus one commerce claim and three URLs.',
    },
  },
};

const controlledDeltaProposals = [
  {
    title:
      '2023-2024 Q8 Driver-Seat Side-Airbag Mount Recall 69GA / NHTSA 23V868 - Check VIN',
    disposition: 'proposal-only',
    insert: false,
    sources: [
      'https://static.nhtsa.gov/odi/rcl/2023/RCLRPT-23V868-5357.PDF',
    ],
  },
  {
    title:
      '2020-2022 Q8 Front-End Creak during Steering or Load Change - TSB 2060304/6',
    disposition: 'proposal-only',
    insert: false,
    sources: [
      'https://static.nhtsa.gov/odi/tsbs/2022/MC-10216010-0001.pdf',
    ],
  },
];

module.exports = {
  label: 'Audi Q8',
  make: 'Audi',
  model: 'Q8',
  batchId: 'audi-q8-full-record-cohort-1-2026-07-28',
  auditDate: '2026-07-28',
  snapshotHash:
    '3ee40713b2b5f1bd845d6118be79fc8486956e01d41eb5a8609a85aba77a5102',
  sourceSnapshotFileHash:
    '6e4c8d64ced097e83111d27c7f46e1f1c08b79dc40423fee81ebc9d9c54cd455',
  packetFileHash:
    '4277dd32fd833ac5c44dfab0a55f02df79d890c9f02ad79858b42a10631ab6b7',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/audi-q8/3ee40713b2b5/all-0001.json',
  reviewTokens: {
    blind: 'q8_blind_review:no-blocker',
    edge: 'q8_edge_review:no-blocker',
  },
  expectedIds: [
    'audi-q8-48v-system-2019',
    'audi-q8-8-speed-tiptronic-harsh-shifting-jolt-delayed-engagement',
    'audi-q8-air-suspension-2019',
    'audi-q8-carbon-buildup-2019',
    'audi-q8-ea839-3-0t-water-pump-internal-leak-coolant-loss',
    'audi-q8-front-brake-rotor-corrosion-premature-pad-rotor-wear',
    'audi-q8-front-shock-absorber-fork-cracking',
    'audi-q8-fuel-pump-internal-failure-causing-engine-stall',
    'audi-q8-mmi-electrical-2019',
    'audi-q8-mmi-infotainment-2019',
    'audi-q8-oil-separator-pcv-valve-failure-elevated-oil-consumption',
    'audi-q8-panoramic-sunroof-water-leak-into-cabin',
  ],
  records,
  expectedPerRecord: {
    'audi-q8-48v-system-2019': {
      claimIds: [
        'communityRecommendations:2',
        'communityRecommendations:3',
        'communityRecommendations:4',
        'communityRecommendations:5',
        'communityRecommendations:6',
      ],
      urls: [
        'https://www.amazon.com/s?k=Optima%20RedTop%20AGM%20Battery%20Audi%20Q8&tag=au7o-20',
        'https://www.amazon.com/s?k=ACDelco%20Professional%20AGM%20Battery%20Audi%20Q8&tag=au7o-20',
        'https://www.amazon.com/s?k=Battery%20Tender%20Junior%2012V%20Battery%20Charger%20Maintainer%20Audi%20Q8&tag=au7o-20',
        'https://www.amazon.com/s?k=Denso%20Starter%20Motor%20Audi%20Q8&tag=au7o-20',
        'https://www.amazon.com/s?k=Remy%20Remanufactured%20Starter%20Motor%20Audi%20Q8&tag=au7o-20',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
    'audi-q8-8-speed-tiptronic-harsh-shifting-jolt-delayed-engagement': {
      claimIds: ['fixParts:0'],
      urls: [
        'https://www.amazon.com/s?k=0D5398010&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=0D5398010',
        'https://www.ebay.com/sch/i.html?_nkw=0D5398010',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
    'audi-q8-air-suspension-2019': {
      claimIds: [
        'fixParts:0',
        'communityRecommendations:0',
        'communityRecommendations:2',
      ],
      urls: [
        'https://www.amazon.com/s?k=4M0616039BE&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=4M0616039BE',
        'https://www.ebay.com/sch/i.html?_nkw=4M0616039BE',
        'https://www.amazon.com/s?k=Arnott%20Industries%20Remanufactured%20Air%20Strut%20(Q8)&tag=au7o-20',
        'https://www.amazon.com/s?k=Arnott%20Industries%20Air%20Compressor%20with%20Dryer&tag=au7o-20',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
    'audi-q8-carbon-buildup-2019': {
      claimIds: ['communityRecommendations:1'],
      urls: [
        'https://www.amazon.com/s?k=034%20Motorsport%20034-101-1016&tag=au7o-20',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
    'audi-q8-ea839-3-0t-water-pump-internal-leak-coolant-loss': {
      claimIds: ['fixParts:0'],
      urls: [
        'https://www.amazon.com/s?k=06M121013G&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=06M121013G',
        'https://www.ebay.com/sch/i.html?_nkw=06M121013G',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
    'audi-q8-front-brake-rotor-corrosion-premature-pad-rotor-wear': {
      claimIds: ['fixParts:0'],
      urls: [
        'https://www.amazon.com/s?k=4M0615301AS&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=4M0615301AS',
        'https://www.ebay.com/sch/i.html?_nkw=4M0615301AS',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
    'audi-q8-front-shock-absorber-fork-cracking': {
      claimIds: ['fixParts:0'],
      urls: [
        'https://www.amazon.com/s?k=4M0413038H&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=4M0413038H',
        'https://www.ebay.com/sch/i.html?_nkw=4M0413038H',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
    'audi-q8-fuel-pump-internal-failure-causing-engine-stall': {
      claimIds: ['fixParts:0'],
      urls: [
        'https://www.amazon.com/s?k=4M0919087G&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=4M0919087G',
        'https://www.ebay.com/sch/i.html?_nkw=4M0919087G',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
    'audi-q8-mmi-electrical-2019': {
      claimIds: ['communityRecommendations:2'],
      urls: [
        'https://www.amazon.com/s?k=Genuine%20VW%2FAudi%20MIB3%20Display%20Unit&tag=au7o-20',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
    'audi-q8-mmi-infotainment-2019': {
      claimIds: [
        'communityRecommendations:2',
        'communityRecommendations:3',
        'communityRecommendations:4',
      ],
      urls: [
        'https://www.amazon.com/s?k=BlueDriver%20Bluetooth%20Pro%20OBD2%20Scan%20Tool%20Audi%20Q8&tag=au7o-20',
        'https://www.amazon.com/s?k=Bosch%20Automotive%20Relay%205-Pin%2012V%20Audi%20Q8&tag=au7o-20',
        'https://www.amazon.com/s?k=Innova%20Digital%20Multimeter%20Audi%20Q8&tag=au7o-20',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
    'audi-q8-oil-separator-pcv-valve-failure-elevated-oil-consumption': {
      claimIds: ['fixParts:0'],
      urls: [
        'https://www.amazon.com/s?k=06M103515H&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=06M103515H',
        'https://www.ebay.com/sch/i.html?_nkw=06M103515H',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
    'audi-q8-panoramic-sunroof-water-leak-into-cabin': {
      claimIds: ['fixParts:0'],
      urls: [
        'https://www.amazon.com/s?k=4M8877201&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=4M8877201',
        'https://www.ebay.com/sch/i.html?_nkw=4M8877201',
      ],
      claimClicks: 0,
      recordClicks: 0,
      priorityClicks: 0,
    },
  },
  expectedTelemetry: {
    claimCount: 20,
    urlCount: 36,
    claimClickCount: 0,
    recordClickCount: 0,
    priorityClickCount: 0,
  },
  expectedDispositionCounts: {
    'recall-dealer': 4,
    remove: 5,
    'diagnosis-hold': 3,
  },
  expectedPublished: 7,
  expectedArchived: 5,
  controlledDeltaProposals,
  expectedProposalIdentities: controlledDeltaProposals.map(
    (proposal) => `${proposal.title}::${proposal.sources.join('|')}`,
  ),
  assertReviewedAfterState(issues) {
    const starter = issues.find(
      (issue) => issue.id === 'audi-q8-48v-system-2019',
    ).after;
    const air = issues.find(
      (issue) => issue.id === 'audi-q8-air-suspension-2019',
    ).after;
    const coolant = issues.find(
      (issue) =>
        issue.id ===
        'audi-q8-ea839-3-0t-water-pump-internal-leak-coolant-loss',
    ).after;
    const shock = issues.find(
      (issue) => issue.id === 'audi-q8-front-shock-absorber-fork-cracking',
    ).after;
    const fuel = issues.find(
      (issue) =>
        issue.id === 'audi-q8-fuel-pump-internal-failure-causing-engine-stall',
    ).after;
    const camera = issues.find(
      (issue) => issue.id === 'audi-q8-mmi-infotainment-2019',
    ).after;
    const sunroof = issues.find(
      (issue) => issue.id === 'audi-q8-panoramic-sunroof-water-leak-into-cabin',
    ).after;
    const archivedCount = issues.filter(
      (issue) => issue.after.status === 'archived',
    ).length;
    if (
      JSON.stringify(starter.years) !==
        JSON.stringify([2019, 2020, 2021, 2022, 2023, 2024]) ||
      starter.status !== 'published' ||
      JSON.stringify(air.years) !==
        JSON.stringify([2019, 2020, 2021, 2022, 2023, 2024, 2025]) ||
      JSON.stringify(air.dtcCodes) !==
        JSON.stringify(['C1260F0', 'U112100']) ||
      JSON.stringify(coolant.years) !==
        JSON.stringify([2019, 2020, 2021, 2022, 2023, 2024]) ||
      JSON.stringify(coolant.dtcCodes) !== JSON.stringify(['P0299']) ||
      JSON.stringify(shock.years) !== JSON.stringify([2019]) ||
      shock.severity !== 'high' ||
      JSON.stringify(fuel.years) !== JSON.stringify([2019, 2020, 2021]) ||
      JSON.stringify(camera.years) !==
        JSON.stringify([2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026]) ||
      JSON.stringify(sunroof.years) !==
        JSON.stringify([2019, 2020, 2021]) ||
      archivedCount !== 5
    ) {
      throw new Error(
        'Audi Q8 starter, suspension, coolant, recall, camera, sunroof or archive after-state scope drifted.',
      );
    }
  },
};
