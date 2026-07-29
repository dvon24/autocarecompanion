const api = (campaign) =>
  `https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=${campaign}`;
const inventory = (year) =>
  `https://api.nhtsa.gov/recalls/recallsByVehicle?make=Cadillac&model=CT5&modelYear=${year}`;

function exactPath({
  disposition = 'replace',
  oldTitle,
  claims,
  urls,
  evidenceTitle,
  evidenceUrl,
  citationType = 'tsb',
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
    disposition,
    decision: `Replace the frozen "${oldTitle}" aggregation with the bounded primary-source path below. Remove all ${claims} commerce claims and ${urls} outbound URL occurrences.`,
    evidence: [{ label: evidenceTitle, url: evidenceUrl }],
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
      citations: [{ type: citationType, title: evidenceTitle, url: evidenceUrl }],
      summary: `Replaced the frozen "${oldTitle}" card with the exact ${evidenceTitle} scope and removed ${claims} commerce claims with ${urls} URLs.`,
    },
  };
}

function recall(options) {
  const campaignLabel = options.campaign.slice(0, -3);
  return exactPath({
    ...options,
    disposition: 'recall-dealer',
    evidenceTitle: `Cadillac CT5 Recall ${campaignLabel}${options.gmNumber ? ` / GM ${options.gmNumber}` : ''}`,
    evidenceUrl: api(options.campaign),
    citationType: 'recall',
    severity: 'high',
  });
}

function archived({
  oldTitle,
  idSuffix,
  years,
  category,
  claims,
  urls,
  reason,
  evidenceTitle = 'Official NHTSA Cadillac CT5 Campaign Inventory',
  evidenceUrl = inventory(2025),
}) {
  return {
    disposition: 'remove',
    decision: `Archive the frozen "${oldTitle}" aggregation. ${reason} Remove all ${claims} commerce claims and ${urls} outbound URL occurrences.`,
    evidence: [{ label: evidenceTitle, url: evidenceUrl }],
    after: {
      years,
      trims: [],
      engines: [],
      category,
      title: `Archived - Unsupported Cadillac CT5 ${idSuffix}`,
      description: `The former card asserted "${oldTitle}" across a broad Cadillac CT5 population. ${reason}`,
      solution:
        'Do not order parts or apply a universal repair from this archived card. Verify the exact VIN, equipment, symptoms, DTCs and current GM service information before diagnosis or repair.',
      severity: 'low',
      confidence: 'low',
      source: 'manual',
      symptoms: [],
      affectedSystems: [],
      dtcCodes: [],
      citations: [{ type: 'nhtsa', title: evidenceTitle, url: evidenceUrl }],
      summary: `Archived the unsupported Cadillac CT5 "${oldTitle}" aggregation and removed ${claims} commerce claims with ${urls} URLs.`,
    },
  };
}

const config = {
  label: 'Cadillac CT5',
  make: 'Cadillac',
  model: 'CT5',
  batchId: 'cadillac-ct5-full-record-cohort-1-2026-07-29',
  auditDate: '2026-07-29',
  snapshotHash:
    '3ee40713b2b5f1bd845d6118be79fc8486956e01d41eb5a8609a85aba77a5102',
  sourceSnapshotFileHash:
    '6e4c8d64ced097e83111d27c7f46e1f1c08b79dc40423fee81ebc9d9c54cd455',
  packetFileHash:
    'a369062276a4ac40076ac884d4d9d435dff80ae57697c31b9efcd85c90904118',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/cadillac-ct5/3ee40713b2b5/all-0001.json',
  reviewTokens: {
    blind: 'ct5_blind_review:no-blocker',
    edge: 'ct5_edge_review:no-blocker',
  },
  expectedIds: [
    'cadillac-ct5-2-0l-turbo-excessive-oil-consumption-pcv-system-failure',
    'cadillac-ct5-10-speed-transmission-control-valve-wear-causing-momentary-w',
    'cadillac-ct5-10l80-10-speed-torque-converter-clutch-shudder-light-throttl',
    'cadillac-ct5-10l80-harsh-shift-p2812-p2814',
    'cadillac-ct5-20t-oil-consumption-2020',
    'cadillac-ct5-auto-stop-start-rough-restart-brake-stability-warning-lights',
    'cadillac-ct5-driver-seat-massage-lumbar-bolster-module-failure',
    'cadillac-ct5-drl-wont-deactivate-recall',
    'cadillac-ct5-electric-water-pump-failure',
    'cadillac-ct5-electronic-brake-boost-module-failure-loss-brake-assist',
    'cadillac-ct5-gloss-black-exterior-trim-peeling-delamination',
    'cadillac-ct5-high-speed-wind-noise-whistle-from-windshield-pillar-weather',
    'cadillac-ct5-instrument-panel-cluster-intermittent-blank-screen-after-rem',
    'cadillac-ct5-performance-carbon-ceramic-brake-squeal-grinding-noise',
    'cadillac-ct5-premature-12v-battery-drain-parasitic-draw',
    'cadillac-ct5-steering-shaft-brake-line-chafe',
    'cadillac-ct5-sunroof-headliner-rattle-creak',
    'cadillac-ct5-super-cruise-unavailable',
    'cadillac-ct5-transmission-adapt-2020',
    'cadillac-ct5-v2-infotainment-freeze-update-stall',
    'cadillac-ct5v-6-2-recall-engine-2021',
    'cadillac-ct5v-airbag-curtain-install-2020',
    'cadillac-ct5v-manual-2nd-gear-notchy-2022',
    'cadillac-ct5v-supercharged-v8-engine-failure-2020',
  ],
  records: {
    'cadillac-ct5-2-0l-turbo-excessive-oil-consumption-pcv-system-failure':
      archived({
        oldTitle:
          '2.0L Turbo (LSY) Excessive Oil Consumption and PCV System Failure',
        idSuffix: 'Oil-Consumption and PCV Aggregation',
        years: [2020, 2021, 2022, 2023, 2024, 2025],
        category: 'engine',
        claims: 5,
        urls: 15,
        reason:
          'Current GM bulletin 21-NA-240 supports a bounded cam-carrier oil-leak diagnosis, not this universal oil-consumption and PCV-failure bundle.',
        evidenceTitle: 'GM Bulletin 21-NA-240 - Information on LSY Engine Oil Leaks',
        evidenceUrl:
          'https://static.nhtsa.gov/odi/tsbs/2025/MC-11019543-0001.pdf',
      }),
    'cadillac-ct5-10-speed-transmission-control-valve-wear-causing-momentary-w':
      recall({
        oldTitle:
          '10-Speed (10L80/10L90) Transmission Control Valve Wear Causing Momentary Wheel Lock-Up (Recall 25V-148)',
        claims: 3,
        urls: 9,
        campaign: '25V148000',
        gmNumber: 'N242480630',
        years: [2020, 2021],
        category: 'transmission',
        title: '10-Speed Transmission Damage Can Cause Wheel Lock-Up (Recall 25V148)',
        description:
          'Certain 2020-2021 Cadillac CT5 vehicles equipped with a 10-speed transmission can develop internal transmission damage that may cause the wheels to lock while driving.',
        solution:
          'Check the VIN and campaign status. Cadillac dealers install transmission-control-module monitoring software under recall N242480630; follow the campaign instructions if the software detects damage.',
        symptoms: ['Open safety recall', 'Unexpected wheel lock-up risk'],
        systems: ['10-speed automatic transmission', 'transmission control module'],
      }),
    'cadillac-ct5-10l80-10-speed-torque-converter-clutch-shudder-light-throttl':
      archived({
        oldTitle:
          '10L80 10-Speed Torque Converter Clutch (TCC) Shudder at Light Throttle',
        idSuffix: 'Torque-Converter Shudder Aggregation',
        years: [2020, 2021, 2022],
        category: 'transmission',
        claims: 0,
        urls: 0,
        reason:
          'The cited current GM bulletin 22-NA-015 lists Cadillac Escalade models and GM trucks/SUVs, not CT5, so its diagnostic and component-replacement path cannot be inherited by model family.',
        evidenceTitle:
          'GM Bulletin 22-NA-015 - Published Applicability Excludes Cadillac CT5',
        evidenceUrl:
          'https://static.nhtsa.gov/odi/tsbs/2023/MC-10243982-0001.pdf',
      }),
    'cadillac-ct5-10l80-harsh-shift-p2812-p2814': exactPath({
      oldTitle:
        '10L80 Harsh Shifts and Check Engine Light with DTC P2812 or P2814 (Line Pressure Solenoid)',
      claims: 0,
      urls: 0,
      evidenceTitle:
        'GM Preliminary Information PIP5799 - CT5 P2812/P2814 Harsh Shift',
      evidenceUrl:
        'https://static.nhtsa.gov/odi/tsbs/2021/MC-10193429-9999.pdf',
      years: [2020, 2021],
      category: 'transmission',
      title: 'Harsh Shift with P2812 or P2814 from Solenoid-7 Electrical Fault (PIP5799)',
      description:
        'GM PIP5799 covers 2020-2021 Cadillac CT5 vehicles with the MHS transmission when the check-engine lamp and harsh shifting occur with TCM DTC P2812 or P2814. The listed cause is an electrical fault in transmission-control solenoid valve 7.',
      solution:
        'Follow GM service-information diagnostics first. If diagnosis does not identify another root cause for P2812 or P2814, PIP5799 directs replacement of the valve body.',
      severity: 'medium',
      symptoms: ['Check-engine lamp', 'Harsh transmission shifts'],
      systems: ['MHS 10-speed transmission', 'transmission-control solenoid valve 7'],
      dtcCodes: ['P2812', 'P2814'],
    }),
    'cadillac-ct5-20t-oil-consumption-2020': exactPath({
      oldTitle: '2.0T LSY Engine Timing Cover Oil Leak',
      claims: 2,
      urls: 2,
      evidenceTitle: 'GM Bulletin 21-NA-240 - Information on LSY Engine Oil Leaks',
      evidenceUrl:
        'https://static.nhtsa.gov/odi/tsbs/2025/MC-11019543-0001.pdf',
      years: [2020, 2021, 2022, 2023, 2024],
      engines: ['2.0L Turbo I4 (LSY)'],
      category: 'engine',
      title: 'LSY Cam-Carrier T-Joint Oil Leak Can Mimic Other Front-Engine Leaks (21-NA-240)',
      description:
        'GM bulletin 21-NA-240 covers 2020-2024 Cadillac CT5 models with the 2.0L LSY engine. An improper amount of cam-carrier gasket sealant can leak at the T-joint and appear to come from the front cover, lower oil pan or upper timing-chain cover.',
      solution:
        'Clean residual oil, add oil dye and trace powder, and run the engine until the source is observed. Reseal the cam-carrier assembly only when the leak is isolated to the T-joint; otherwise continue normal oil-leak diagnosis.',
      symptoms: ['Engine oil leak at the front of the engine'],
      systems: ['cam-carrier T-joint', 'cam-carrier gasket sealant'],
    }),
    'cadillac-ct5-auto-stop-start-rough-restart-brake-stability-warning-lights':
      recall({
        oldTitle:
          'Auto Stop/Start Rough Restart with Brake and Stability Warning Lights',
        claims: 1,
        urls: 3,
        campaign: '21V421000',
        gmNumber: 'N212338110',
        years: [2021],
        category: 'safety',
        title: 'Airbag Warning Lamp May Not Illuminate Consistently (Recall 21V421)',
        description:
          'On certain 2021 Cadillac CT5 vehicles, the communications gateway module can process loss of communication with the sensing and diagnostic module incorrectly, causing inconsistent illumination of the airbag malfunction indicator.',
        solution:
          'Check the VIN and recall completion history. Cadillac dealers update the communications gateway module software under recall N212338110.',
        symptoms: ['Open safety recall', 'Airbag warning lamp may not warn consistently'],
        systems: ['communications gateway module', 'airbag malfunction indicator'],
      }),
    'cadillac-ct5-driver-seat-massage-lumbar-bolster-module-failure': archived({
      oldTitle: 'Driver Seat Massage and Lumbar/Bolster Module Failure',
      idSuffix: 'Seat-Massage Module Aggregation',
      years: [2020, 2021, 2022, 2023, 2024, 2025],
      category: 'interior',
      claims: 1,
      urls: 3,
      reason:
        'The primary-source sweep did not establish this complete model-year, module-failure and universal replacement claim.',
    }),
    'cadillac-ct5-drl-wont-deactivate-recall': recall({
      oldTitle:
        "Daytime Running Lights Won't Turn Off With Headlights (Recall 22V903 / N222386380)",
      claims: 0,
      urls: 0,
      campaign: '22V903000',
      gmNumber: 'N222386380',
      years: [2020, 2021, 2022, 2023],
      category: 'exterior',
      title: 'Daytime Running Lights May Stay On with Headlights (Recall 22V903)',
      description:
        'On certain 2020-2023 Cadillac CT5 vehicles, the daytime running lights may not deactivate when the headlights are on, creating excess glare and failing FMVSS 108.',
      solution:
        'Check the VIN and recall status. The body-control-module software is updated by a dealer or over the air under recall N222386380.',
      symptoms: ['Open safety recall', 'Daytime running lights remain on with headlights'],
      systems: ['daytime running lights', 'body control module software'],
    }),
    'cadillac-ct5-electric-water-pump-failure': exactPath({
      oldTitle: 'Electric Water Pump Circuit Board Failure — Overheat and Limp Mode',
      claims: 0,
      urls: 0,
      evidenceTitle:
        'GM Customer Satisfaction Program N202320510 - Water Pump Failure',
      evidenceUrl:
        'https://static.nhtsa.gov/odi/tsbs/2020/MC-10186046-9999.pdf',
      years: [2020, 2021],
      category: 'cooling',
      title: 'Selected-VIN Electric Water-Pump Circuit Board Failure (N202320510)',
      description:
        'Certain VIN-identified 2020-2021 Cadillac CT5 vehicles with a gasoline engine may have an incorrectly manufactured printed circuit board inside the water pump. Progressive coolant-temperature warnings, DTC P2B85, reduced power and eventual protective engine shutdown can occur.',
      solution:
        'Check GM Investigate Vehicle History for program eligibility before replacing parts. Program N202320510 directs dealers to replace the electric water-pump assembly on involved vehicles.',
      severity: 'high',
      symptoms: ['Over-temperature message', 'Reduced engine power', 'Protective engine shutdown'],
      systems: ['electric water-pump assembly', 'water-pump printed circuit board'],
      dtcCodes: ['P2B85'],
    }),
    'cadillac-ct5-electronic-brake-boost-module-failure-loss-brake-assist':
      recall({
        oldTitle:
          'Electronic Brake Boost Module Failure — Loss of Brake Assist (2020 Recall)',
        claims: 3,
        urls: 9,
        campaign: '20V588000',
        gmNumber: 'A202307260',
        years: [2020],
        category: 'brakes',
        title:
          'Electronic Brake-Boost Sensor Contamination Can Remove Assist (Recall 20V588)',
        description:
          'On certain 2020 Cadillac CT5 vehicles, contamination at a sensor connection can interrupt communication with the electronic brake-boost system and remove brake assist, requiring extra pedal force.',
        solution:
          'Check the VIN and recall completion history. Cadillac dealers replace the electronic brake-boost module under recall A202307260.',
        symptoms: ['Open safety recall', 'Loss of brake assist'],
        systems: ['electronic brake-boost module', 'brake-boost sensor connection'],
      }),
    'cadillac-ct5-gloss-black-exterior-trim-peeling-delamination': archived({
      oldTitle:
        'Gloss Black Exterior Trim (B-Pillar / Window Surround) Peeling and Delamination',
      idSuffix: 'Exterior-Trim Delamination Aggregation',
      years: [2020, 2021, 2022, 2023, 2024],
      category: 'exterior',
      claims: 5,
      urls: 15,
      reason:
        'The primary-source sweep did not establish the claimed broad defect population, failure mechanism and replacement bundle.',
    }),
    'cadillac-ct5-high-speed-wind-noise-whistle-from-windshield-pillar-weather':
      archived({
        oldTitle:
          'High-Speed Wind Noise / Whistle from Windshield A-Pillar Weatherstrip',
        idSuffix: 'A-Pillar Wind-Noise Aggregation',
        years: [2020, 2021, 2022, 2023, 2024],
        category: 'body',
        claims: 5,
        urls: 15,
        reason:
          'The primary-source sweep did not establish this universal A-pillar weatherstrip failure and parts-replacement path.',
      }),
    'cadillac-ct5-instrument-panel-cluster-intermittent-blank-screen-after-rem':
      exactPath({
        oldTitle:
          'Instrument Panel Cluster (IPC / Driver Information Center) Intermittent Blank Screen After Remote Start',
        claims: 0,
        urls: 0,
        evidenceTitle:
          'GM Bulletin 21-NA-269 - CT4/CT5 Intermittent Blank Driver Information Display',
        evidenceUrl:
          'https://static.nhtsa.gov/odi/tsbs/2021/MC-10205588-9999.pdf',
        years: [2020],
        category: 'electrical',
        title:
          'Driver Information Display Can Remain Blank After Remote Start (21-NA-269)',
        description:
          'GM bulletin 21-NA-269 covers 2020 Cadillac CT5 vehicles equipped with enhanced driver-information display RPO UDD. During an ignition cycle with remote start, radio-module infotainment content may not initialize fully and the cluster display can remain blank.',
        solution:
          'Confirm the exact vehicle and RPO, maintain stable programming voltage, and reprogram the instrument-panel cluster with the latest GM software following 21-NA-269.',
        symptoms: ['Blank driver information display after remote start'],
        systems: ['instrument-panel cluster', 'radio-module infotainment content'],
      }),
    'cadillac-ct5-performance-carbon-ceramic-brake-squeal-grinding-noise':
      archived({
        oldTitle: 'Performance and Carbon-Ceramic Brake Squeal and Grinding Noise',
        idSuffix: 'Performance-Brake Noise Aggregation',
        years: [2020, 2021, 2022, 2023, 2024, 2025],
        category: 'brakes',
        claims: 3,
        urls: 9,
        reason:
          'The primary-source sweep did not establish a universal component defect, model-year population or fixed replacement remedy for the broad noise claim.',
      }),
    'cadillac-ct5-premature-12v-battery-drain-parasitic-draw': archived({
      oldTitle: 'Premature 12V Battery Drain / Parasitic Draw (Memory Seat Module)',
      idSuffix: 'Battery-Drain Aggregation',
      years: [2020, 2021, 2022, 2023, 2024, 2025],
      category: 'electrical',
      claims: 2,
      urls: 6,
      reason:
        'The primary-source sweep did not establish the claimed memory-seat-module cause across the listed CT5 years.',
    }),
    'cadillac-ct5-steering-shaft-brake-line-chafe': exactPath({
      oldTitle:
        'Upper Intermediate Steering Shaft Chafes Front Brake Line (Service Update N202296840)',
      claims: 0,
      urls: 0,
      evidenceTitle:
        'GM Service Update N202296840 - Upper Intermediate Steering Shaft',
      evidenceUrl:
        'https://static.nhtsa.gov/odi/tsbs/2021/MC-10187222-9999.pdf',
      years: [2020],
      category: 'brakes',
      title: 'Selected-VIN Steering Shaft Can Contact Front Brake Line (N202296840)',
      description:
        'Certain VIN-identified 2020 Cadillac CT5 vehicles may have an upper intermediate steering shaft that contacts the front brake line. GM requires eligibility confirmation in Investigate Vehicle History.',
      solution:
        'Confirm the VIN is open in GM Investigate Vehicle History. Dealers inspect the brake line and replace the specified front brake line or lines only when the inspection requires it.',
      severity: 'high',
      symptoms: ['Open service update for the VIN', 'Steering-shaft contact at the front brake line'],
      systems: ['upper intermediate steering shaft', 'front brake line'],
    }),
    'cadillac-ct5-sunroof-headliner-rattle-creak': archived({
      oldTitle: 'Sunroof / Headliner Rattle and Creak',
      idSuffix: 'Sunroof and Headliner Noise Aggregation',
      years: [2020, 2021, 2022, 2023, 2024],
      category: 'body',
      claims: 2,
      urls: 6,
      reason:
        'The primary-source sweep did not establish this complete CT5 model-year, failure-location and universal repair claim.',
    }),
    'cadillac-ct5-super-cruise-unavailable': exactPath({
      oldTitle: "Super Cruise 'Unavailable' Message — System Inoperative from Delivery",
      claims: 0,
      urls: 0,
      evidenceTitle:
        'GM Preliminary Information PIT6356B - Super Cruise Unavailable in Low Illumination',
      evidenceUrl:
        'https://static.nhtsa.gov/odi/tsbs/2025/MC-11018647-0001.pdf',
      years: [2025],
      category: 'electrical',
      title:
        'Super Cruise Can Become Unavailable When Steering-Wheel Infrared Emitters Fail (PIT6356B)',
      description:
        'GM PIT6356B covers 2025 Cadillac CT5 vehicles with Super Cruise RPO UKL. In low-illumination conditions, failed steering-wheel infrared emitter LEDs can cause Super Cruise or Driver Attention Assist unavailable messages.',
      solution:
        'Confirm the exact model, year and UKL equipment, then follow GM PIT6356B diagnostics for the steering-wheel infrared emitters. Do not infer this cause from every Super Cruise unavailable message.',
      symptoms: [
        'Super Cruise unavailable in low illumination',
        'Driver Attention Assist unavailable or cannot see face clearly',
      ],
      systems: ['steering-wheel infrared emitter LEDs', 'driver attention system'],
    }),
    'cadillac-ct5-transmission-adapt-2020': archived({
      oldTitle: '10-Speed Transmission Adaptive Learning and Shift Quality',
      idSuffix: 'Transmission-Adaptive-Learning Aggregation',
      years: [2020, 2021, 2022, 2023, 2024, 2025],
      category: 'transmission',
      claims: 1,
      urls: 1,
      reason:
        'The primary-source sweep did not establish the seeded DTC bundle or a universal adaptive-learning repair across every listed CT5 configuration.',
    }),
    'cadillac-ct5-v2-infotainment-freeze-update-stall': recall({
      oldTitle:
        'Infotainment / Center Display Freezing, Black Screen and Stalled Software Update (stuck at 99%)',
      claims: 0,
      urls: 0,
      campaign: '26V114000',
      gmNumber: 'N252540430',
      years: [2026],
      category: 'safety',
      title: 'Radio May Not Download the Electronic Owner Manual (Recall 26V114)',
      description:
        'On certain 2026 Cadillac CT5 vehicles, the radio may not have been set to the correct production status to download the electronic owner manual, leaving required safety-use information unavailable.',
      solution:
        'Check the VIN and recall status. Cadillac dealers reset the vehicle radio to facilitate automatic download of the electronic owner manual under recall N252540430.',
      symptoms: ['Open safety recall', 'Electronic owner manual is unavailable'],
      systems: ['vehicle radio', 'electronic owner manual download'],
    }),
    'cadillac-ct5v-6-2-recall-engine-2021': archived({
      oldTitle: 'GM 6.2L V8 Engine Recall for Connecting Rod Bearing Failure',
      idSuffix: '6.2L V8 Recall Attribution',
      years: [2021, 2022, 2023, 2024],
      category: 'engine',
      claims: 2,
      urls: 2,
      reason:
        'NHTSA 25V274 covers specified GM full-size SUV and truck applications with the L87 6.2L engine; it does not establish Cadillac CT5-V Blackwing LT4 eligibility.',
      evidenceTitle:
        'NHTSA Recall 25V274 - Published Vehicle and Engine Population',
      evidenceUrl: api('25V274000'),
    }),
    'cadillac-ct5v-airbag-curtain-install-2020': recall({
      oldTitle: 'Roof Rail Side-Curtain Airbag Incorrect Installation',
      claims: 1,
      urls: 1,
      campaign: '21V611000',
      gmNumber: 'N212342780',
      years: [2020, 2021, 2022],
      category: 'safety',
      title: 'Roof-Rail Side-Curtain Airbags May Be Installed Incorrectly (Recall 21V611)',
      description:
        'On certain 2020-2022 Cadillac CT5 vehicles, the roof-rail side-curtain airbags may not have been installed correctly and may deploy improperly in a crash.',
      solution:
        'Check the VIN and recall status. Cadillac dealers inspect both roof-rail airbags and reinstall them as necessary under recall N212342780.',
      symptoms: ['Open safety recall', 'Side-curtain airbag installation concern'],
      systems: ['roof-rail side-curtain airbags'],
    }),
    'cadillac-ct5v-manual-2nd-gear-notchy-2022': archived({
      oldTitle: 'Tremec 6-Speed Manual 2nd Gear Notchiness and Difficulty',
      idSuffix: 'Manual-Transmission Notchiness Aggregation',
      years: [2022, 2023, 2024],
      category: 'transmission',
      claims: 2,
      urls: 2,
      reason:
        'The primary-source sweep did not establish a broad component defect or universal repair from the owner-forum discussion.',
    }),
    'cadillac-ct5v-supercharged-v8-engine-failure-2020': archived({
      oldTitle: 'LT4 Supercharged V8 Premature Engine Failure',
      idSuffix: 'LT4 Engine-Failure Aggregation',
      years: [2020, 2021, 2022, 2023, 2024],
      category: 'engine',
      claims: 2,
      urls: 2,
      reason:
        'Individual owner and media reports do not establish the complete broad failure population, DTC bundle or universal engine-replacement remedy.',
    }),
  },
  expectedTelemetry: {
    claimCount: 40,
    urlCount: 100,
    claimClickCount: 1,
    recordClickCount: 1,
    priorityClickCount: 1,
  },
  expectedDispositionCounts: {
    'recall-dealer': 6,
    replace: 6,
    remove: 12,
  },
  expectedPublished: 12,
  expectedArchived: 12,
  controlledDeltaProposals: [],
  expectedProposalIdentities: [],
};

config.assertReviewedAfterState = function assertReviewedAfterState(issues) {
  const publishedYears = {
    'cadillac-ct5-10-speed-transmission-control-valve-wear-causing-momentary-w':
      [2020, 2021],
    'cadillac-ct5-10l80-harsh-shift-p2812-p2814': [2020, 2021],
    'cadillac-ct5-20t-oil-consumption-2020': [2020, 2021, 2022, 2023, 2024],
    'cadillac-ct5-auto-stop-start-rough-restart-brake-stability-warning-lights':
      [2021],
    'cadillac-ct5-drl-wont-deactivate-recall': [2020, 2021, 2022, 2023],
    'cadillac-ct5-electric-water-pump-failure': [2020, 2021],
    'cadillac-ct5-electronic-brake-boost-module-failure-loss-brake-assist':
      [2020],
    'cadillac-ct5-instrument-panel-cluster-intermittent-blank-screen-after-rem':
      [2020],
    'cadillac-ct5-steering-shaft-brake-line-chafe': [2020],
    'cadillac-ct5-super-cruise-unavailable': [2025],
    'cadillac-ct5-v2-infotainment-freeze-update-stall': [2026],
    'cadillac-ct5v-airbag-curtain-install-2020': [2020, 2021, 2022],
  };
  if (
    issues.some((issue) => {
      const years = publishedYears[issue.id];
      return years
        ? issue.after.status !== 'published' ||
            JSON.stringify(issue.after.years) !== JSON.stringify(years)
        : issue.after.status !== 'archived';
    })
  ) {
    throw new Error('Cadillac CT5 reviewed scopes or statuses drifted.');
  }
};

module.exports = config;
