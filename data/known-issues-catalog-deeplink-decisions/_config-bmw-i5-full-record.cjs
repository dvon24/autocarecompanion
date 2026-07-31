const communicationsCorpus =
  'https://www.nhtsa.gov/nhtsa-datasets-and-apis';

function verifiedPath({
  disposition = 'recall-dealer',
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
      title: `Archived - Unsupported BMW i5 ${idSuffix}`,
      description: `The former card asserted "${oldTitle}" across a broad BMW i5 population. ${reason}`,
      solution:
        'Do not order parts or apply a universal repair from this archived card. Verify the exact model year, variant, production date, symptoms, DTCs, open recalls and current BMW service information before diagnosis. High-voltage and refrigerant work belongs with properly trained personnel.',
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
      summary: `Archived the unsupported BMW i5 "${oldTitle}" aggregation and removed ${claims} commerce claims with ${urls} URLs.`,
    },
  };
}

const config = {
  label: 'BMW i5',
  make: 'BMW',
  model: 'i5',
  batchId: 'bmw-i5-full-record-cohort-10-2026-07-31',
  auditDate: '2026-07-31',
  snapshotHash:
    'f171235e796932ffdc1f6bea8275ab3cf3fc0e694adc527907d5998427fc8d00',
  sourceSnapshotFileHash:
    '1d2a3791c8606af2ba7a2bfb265eeb792f5f01bb04798a7e2003f7085c0ef4b8',
  packetFileHash:
    'e43102e438a78f06732c8f27f28d581e23142b891ca41a3ad687145bc3116a6c',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/bmw-i5/f171235e7969/all-0001.json',
  reviewTokens: {
    blind: 'bmwi5_blind:no-blocker',
    edge: 'bmwi5_edge:no-blocker',
  },
  expectedIds: [
    'bmw-i5-12v-battery-drain-2024',
    'bmw-i5-acoustic-pedestrian-warning-sound-generator-fault',
    'bmw-i5-adaptive-suspension-calibration-2024',
    'bmw-i5-c-wiring-harness-damaged-during-cabin-filter-service',
    'bmw-i5-dc-fast-charge-throttling-loud-cooling-fans-repeated-session',
    'bmw-i5-electric-drive-motor-software-false-isolation-fault-causing',
    'bmw-i5-heat-pump-drip-tube-thunking-clunking-noise',
    'bmw-i5-high-voltage-battery-module-insufficient-weld-seams',
    'bmw-i5-integrated-brake-system-servomotor-weld-failure',
    'bmw-i5-regen-braking-inconsistency-2024',
    'bmw-i5-software-glitches-2024',
    'bmw-i5-software-updates-2025',
    'bmw-i5-steering-spindle-double-universal-joint-fracture',
  ],
  records: {
    'bmw-i5-12v-battery-drain-2024': archived({
      oldTitle: '12V Auxiliary Battery Drain and Dead Car Syndrome',
      idSuffix: '12V Drain Aggregation',
      years: [2024, 2025],
      category: 'electrical',
      claims: 4,
      urls: 4,
      reason:
        'It assigns connected services and sleep-mode activity as causes across the model, promises unspecified over-the-air fixes and promotes a generic AGM battery, maintainer and scan tool without an exact G60 fault path or verified i5 battery fitment.',
    }),
    'bmw-i5-acoustic-pedestrian-warning-sound-generator-fault':
      verifiedPath({
        oldTitle:
          'Acoustic Pedestrian Warning Sound Generator Fault (AVAS)',
        claims: 0,
        urls: 0,
        evidence: [
          {
            type: 'recall',
            label:
              'NHTSA Part 573 Noncompliance Recall 23V-885 - External Artificial Sound Generator',
            url: 'https://static.nhtsa.gov/odi/rcl/2023/RCLRPT-23V885-2972.PDF',
          },
          {
            type: 'recall',
            label:
              'BMW Recall 23V-885 Remedy Instructions - Sound Generator Programming',
            url: 'https://static.nhtsa.gov/odi/rcl/2023/RCRIT-23V885-4679.pdf',
          },
        ],
        years: [2024],
        category: 'safety',
        title: '2024 i5 Pedestrian Sound Recall 23V-885',
        description:
          'BMW recall 23V-885 covers a VIN-defined group of 2024 i5 eDrive40 and M60 xDrive vehicles. Unfavorable external artificial sound-generator software can fail during startup, leaving the vehicle without the low-speed pedestrian warning required by FMVSS 141. Model year, variant, production date and VIN determine inclusion.',
        solution:
          'Check the VIN for an open 23V-885 campaign. If included, arrange BMW\'s free software programming remedy through the authorized dealer or the approved recall over-the-air process. Do not replace a speaker or module based only on a missing sound; diagnose vehicles outside the campaign separately.',
        severity: 'high',
        symptoms: [
          'VIN shows an open 23V-885 recall',
          'External artificial warning sound is absent at low speed',
          'Vehicle sound-generator fault occurs during startup',
        ],
        systems: [
          'external artificial sound generator',
          'pedestrian warning software',
        ],
      }),
    'bmw-i5-adaptive-suspension-calibration-2024': archived({
      oldTitle: 'Adaptive Suspension Self-Leveling Calibration Errors',
      idSuffix: 'Adaptive-Suspension Aggregation',
      years: [2024, 2025, 2026],
      category: 'suspension',
      claims: 2,
      urls: 2,
      reason:
        'It turns broad ride-height and handling symptoms into an all-variant calibration defect, then promotes generic suspension sensors and scan hardware without BMW option-code, production-date, fault-code or bulletin boundaries.',
    }),
    'bmw-i5-c-wiring-harness-damaged-during-cabin-filter-service':
      verifiedPath({
        oldTitle:
          'A/C Wiring Harness Damaged During Cabin Filter Service (Short-Circuit/Fire Risk)',
        claims: 0,
        urls: 0,
        evidence: [
          {
            type: 'recall',
            label:
              'NHTSA Part 573 Safety Recall 26V-096 - Air-Conditioning Wiring Harness',
            url: 'https://static.nhtsa.gov/odi/rcl/2026/RCLRPT-26V096-6591.pdf',
          },
        ],
        years: [2024, 2025, 2026],
        category: 'electrical',
        title: '2024-2026 i5 A/C Harness Recall 26V-096',
        description:
          'BMW recall 26V-096 covers a VIN-defined group of 2024-2026 i5 vehicles produced June 26, 2023 through April 9, 2025. During cabin microfilter service, the air-conditioning wiring harness could have been damaged and can short circuit, increasing fire risk. The recall population and remedy are VIN-specific; normal cabin-filter replacement does not prove damage.',
        solution:
          'Check the VIN for an open 26V-096 campaign. If included, have an authorized BMW dealer inspect the air-conditioning wiring harness and repair or replace it as required at no charge. Do not probe, splice or order harness parts from this card. If smoke, burning odor or an electrical warning appears, stop using the vehicle and follow BMW emergency guidance.',
        severity: 'high',
        symptoms: [
          'VIN shows an open 26V-096 recall',
          'Electrical warning after cabin microfilter service',
          'Burning odor, smoke or evidence of an A/C harness short',
        ],
        systems: [
          'air-conditioning wiring harness',
          'cabin microfilter service area',
        ],
      }),
    'bmw-i5-dc-fast-charge-throttling-loud-cooling-fans-repeated-session':
      archived({
        oldTitle:
          'DC Fast-Charge Throttling and Loud Cooling Fans on Repeated Sessions',
        idSuffix: 'Fast-Charge Behavior Aggregation',
        years: [2024, 2025],
        category: 'electrical',
        claims: 0,
        urls: 0,
        reason:
          'It presents temperature-dependent charging power and cooling-fan operation as a defect without a bounded BMW communication, measured test conditions, fault codes or a VIN-specific campaign.',
      }),
    'bmw-i5-electric-drive-motor-software-false-isolation-fault-causing':
      verifiedPath({
        oldTitle:
          'Electric Drive Motor Software False Isolation Fault Causing Drive Power Loss',
        claims: 0,
        urls: 0,
        evidence: [
          {
            type: 'recall',
            label:
              'NHTSA Part 573 Safety Recall 25V-395 - Electric Drive Motor Software',
            url: 'https://static.nhtsa.gov/odi/rcl/2025/RCLRPT-25V395-7784.pdf',
          },
        ],
        years: [2024],
        category: 'drivetrain',
        title: '2024 i5 Propulsion-Loss Recall 25V-395',
        description:
          'BMW recall 25V-395 covers a VIN-defined group of 2024 i5 vehicles produced February 23 through December 14, 2023. Electric-drive-motor software can mistakenly identify a double-isolation condition and shut down the high-voltage system about 15-20 seconds after a red warning, causing loss of propulsion. Power-assisted steering and braking remain available.',
        solution:
          'Check the VIN for an open 25V-395 campaign. If included, install BMW\'s free electric-drive-motor software update through the authorized dealer or the approved recall over-the-air process. Do not order drivetrain or battery parts from this card. Capture any red warning and arrange diagnosis if the VIN is not included or the fault remains after the remedy.',
        severity: 'high',
        symptoms: [
          'VIN shows an open 25V-395 recall',
          'Red drivetrain warning and red warning symbol',
          'High-voltage shutdown and loss of propulsion about 15-20 seconds later',
        ],
        systems: [
          'electric drive motor software',
          'high-voltage shutdown logic',
        ],
      }),
    'bmw-i5-heat-pump-drip-tube-thunking-clunking-noise':
      verifiedPath({
        disposition: 'diagnosis-hold',
        oldTitle:
          'Heat-Pump Drip-Tube Thunking/Clunking Noise (Battery Pack Drop to Repair)',
        claims: 0,
        urls: 0,
        evidence: [
          {
            type: 'tsb',
            label:
              'BMW SIB 64 01 24 - Rhythmic Drumming Noise from Condensation Drain',
            url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-11002669-0001.pdf',
          },
        ],
        years: [2024],
        category: 'hvac',
        title: 'Early-Production G60 i5 Condensation-Drain Drum Noise',
        description:
          'BMW SIB 64 01 24 defines a narrow path for 2024 G60 battery-electric i5 vehicles produced through December 31, 2023. Water droplets from the air-conditioning system can strike the condensation-water drain and create a rhythmic drumming noise audible inside the vehicle. The bulletin does not establish a heat-pump failure or support modifying the drain.',
        solution:
          'Confirm the production date and reproduce the rhythmic noise under the BMW bulletin conditions. If SIB 64 01 24 applies, an authorized high-voltage-qualified repair facility replaces the condensation-water drain with the optimized part; the procedure requires high-voltage battery removal. Do not cut or modify the drain. ShowMeTheParts resolved the exact 2024 i5 but returned no matching HVAC candidate, so no parts link is approved.',
        severity: 'medium',
        symptoms: [
          'Rhythmic drumming noise audible inside the cabin',
          'Noise occurs while air-conditioning condensate is draining',
          'Vehicle was produced through December 31, 2023',
        ],
        systems: [
          'air-conditioning condensation-water drain',
          'high-voltage battery service area',
        ],
      }),
    'bmw-i5-high-voltage-battery-module-insufficient-weld-seams':
      verifiedPath({
        oldTitle:
          'High-Voltage Battery Module Insufficient Weld Seams (Overheat/Fire Risk)',
        claims: 0,
        urls: 0,
        evidence: [
          {
            type: 'recall',
            label:
              'NHTSA Part 573 Safety Recall 24V-135 - High-Voltage Battery Module Welds',
            url: 'https://static.nhtsa.gov/odi/rcl/2024/RCLRPT-24V135-8404.PDF',
          },
        ],
        years: [2024],
        category: 'electrical',
        title: 'Single-Vehicle 2024 i5 Battery-Weld Recall 24V-135',
        description:
          'BMW recall 24V-135 identifies one 2024 i5 eDrive40 produced December 7, 2023. Insufficient weld seams in a high-voltage battery module can increase electrical resistance and allow overheating. This exceptionally narrow recall does not support treating the entire i5 population as defective.',
        solution:
          'Check the VIN for an open 24V-135 campaign. If included, follow BMW\'s instructions and have the affected high-voltage battery module replaced at no charge by an authorized high-voltage-qualified dealer. Do not open the battery pack or order modules independently; vehicles outside the campaign require separate fault-led diagnosis.',
        severity: 'high',
        symptoms: [
          'VIN shows an open 24V-135 recall',
          'High-voltage battery warning',
          'Heat, smoke or unusual odor from the battery area',
        ],
        systems: [
          'high-voltage battery module',
          'battery-cell weld seams',
        ],
      }),
    'bmw-i5-integrated-brake-system-servomotor-weld-failure':
      verifiedPath({
        oldTitle:
          'Integrated Brake System (IB) Servomotor Weld Failure',
        claims: 0,
        urls: 0,
        evidence: [
          {
            type: 'recall',
            label:
              'BMW Recall 24V-697 Chronology - Integrated Brake Servomotor',
            url: 'https://static.nhtsa.gov/odi/rcl/2024/RCRIT-24V697-3953.pdf',
          },
        ],
        years: [2024, 2025],
        category: 'brakes',
        title: '2024-2025 i5 Integrated-Brake Recall 24V-697',
        description:
          'BMW recall 24V-697 includes a VIN-defined G60 5 Series/i5 production population built April 5 through June 28, 2024. A servomotor weld in the integrated brake system may be out of specification and can affect brake assistance. Inclusion is controlled by VIN and production records, not by symptoms alone.',
        solution:
          'Check the VIN for an open 24V-697 campaign. If included, have an authorized BMW dealer replace the integrated brake system at no charge. Do not buy pads, rotors, fluid or a generic actuator as a substitute. If a brake warning or changed pedal effort appears, stop driving when safe and arrange BMW assistance.',
        severity: 'high',
        symptoms: [
          'VIN shows an open 24V-697 recall',
          'Brake-system warning message',
          'Changed pedal feel or increased braking effort',
        ],
        systems: [
          'integrated brake system',
          'brake servomotor weld',
        ],
      }),
    'bmw-i5-regen-braking-inconsistency-2024': archived({
      oldTitle: 'Regenerative Braking Inconsistency in Cold Weather',
      idSuffix: 'Cold-Weather Regen Aggregation',
      years: [2024, 2025],
      category: 'brakes',
      claims: 1,
      urls: 1,
      reason:
        'It converts temperature- and state-of-charge-dependent regenerative-braking behavior into a model-wide defect without a BMW bulletin, measured boundary, fault code or recall, then promotes unrelated brake pads.',
    }),
    'bmw-i5-software-glitches-2024': archived({
      oldTitle: 'iDrive 8.5 Software Bugs and EV System Errors',
      idSuffix: 'iDrive 8.5 Aggregation',
      years: [2024, 2025, 2026],
      category: 'electrical',
      claims: 2,
      urls: 2,
      reason:
        'It combines infotainment, connectivity, camera, charging and drivetrain symptoms into a model-wide defect using forum-level evidence, then promotes generic scan and charging products without a bounded BMW software measure.',
    }),
    'bmw-i5-software-updates-2025': archived({
      oldTitle: 'iDrive 9 Software Updates and Calibration Issues',
      idSuffix: 'iDrive 9 Aggregation',
      years: [2025, 2026],
      category: 'electrical',
      claims: 2,
      urls: 2,
      reason:
        'It misidentifies the i5 operating system, cites a nonexistent i5 recall and an invalid video, combines unrelated navigation, charging and regenerative-braking behavior, and promotes generic scan and charging products.',
    }),
    'bmw-i5-steering-spindle-double-universal-joint-fracture':
      verifiedPath({
        oldTitle:
          'Steering Spindle Double Universal Joint Fracture',
        claims: 0,
        urls: 0,
        evidence: [
          {
            type: 'recall',
            label:
              'NHTSA Part 573 Safety Recall 24V-714 - Steering Spindle Joint',
            url: 'https://static.nhtsa.gov/odi/rcl/2024/RCLRPT-24V714-4428.PDF',
          },
        ],
        years: [2024, 2025],
        category: 'steering',
        title: '2024-2025 i5 Steering-Spindle Recall 24V-714',
        description:
          'BMW recall 24V-714 covers 202 VIN-defined 2024-2025 i5 vehicles produced June 17 through July 18, 2024. The swivel socket in the steering spindle double universal joint may fracture and cause a sudden increase in steering effort. Noise or changed steering behavior may occur before failure.',
        solution:
          'Check the VIN for an open 24V-714 campaign. If included, have an authorized BMW dealer replace the steering spindle double universal joint at no charge. Do not order a steering joint from this card. If steering-column noise, notchy steering or increased effort appears, stop driving when safe and arrange BMW assistance.',
        severity: 'high',
        symptoms: [
          'VIN shows an open 24V-714 recall',
          'Noise or clunking from the steering column',
          'Changed steering behavior or increased steering effort',
        ],
        systems: [
          'steering spindle',
          'double universal joint',
        ],
      }),
  },
  expectedTelemetry: {
    claimCount: 11,
    urlCount: 11,
    claimClickCount: 0,
    recordClickCount: 0,
    priorityClickCount: 0,
  },
  expectedDispositionCounts: {
    remove: 6,
    'recall-dealer': 6,
    'diagnosis-hold': 1,
  },
  expectedPublished: 7,
  expectedArchived: 6,
  controlledDeltaProposals: [
    {
      disposition: 'proposal-only',
      insert: false,
      title: 'bmw-i5-active-stabilizer-knock-sib',
      sources: [
        'https://static.nhtsa.gov/odi/tsbs/2024/MC-11005226-0001.pdf',
      ],
    },
  ],
  expectedProposalIdentities: [
    'bmw-i5-active-stabilizer-knock-sib::https://static.nhtsa.gov/odi/tsbs/2024/MC-11005226-0001.pdf',
  ],
};

config.assertReviewedAfterState = function assertReviewedAfterState(
  issues,
) {
  const published = {
    'bmw-i5-acoustic-pedestrian-warning-sound-generator-fault': [
      2024,
    ],
    'bmw-i5-c-wiring-harness-damaged-during-cabin-filter-service': [
      2024,
      2025,
      2026,
    ],
    'bmw-i5-electric-drive-motor-software-false-isolation-fault-causing':
      [2024],
    'bmw-i5-heat-pump-drip-tube-thunking-clunking-noise': [2024],
    'bmw-i5-high-voltage-battery-module-insufficient-weld-seams': [
      2024,
    ],
    'bmw-i5-integrated-brake-system-servomotor-weld-failure': [
      2024,
      2025,
    ],
    'bmw-i5-steering-spindle-double-universal-joint-fracture': [
      2024,
      2025,
    ],
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
    throw new Error('BMW i5 reviewed scopes or statuses drifted.');
  }
};

module.exports = config;
