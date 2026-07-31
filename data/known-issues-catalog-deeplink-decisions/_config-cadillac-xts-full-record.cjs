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
      title: `Archived - Unsupported Cadillac XTS ${idSuffix}`,
      description: `The former card asserted "${oldTitle}" across a broad Cadillac XTS population. ${reason}`,
      solution:
        'Do not order parts or apply a universal repair from this archived card. Verify the exact year, engine, transmission, drivetrain, equipment, build date, symptoms, DTCs, VIN campaign status and current Cadillac service information before diagnosis.',
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
      summary: `Archived the unsupported Cadillac XTS "${oldTitle}" aggregation and removed ${claims} commerce claims with ${urls} URLs.`,
    },
  };
}

const config = {
  label: 'Cadillac XTS',
  make: 'Cadillac',
  model: 'XTS',
  batchId: 'cadillac-xts-full-record-cohort-1-2026-07-30',
  auditDate: '2026-07-30',
  snapshotHash:
    '3ee40713b2b5f1bd845d6118be79fc8486956e01d41eb5a8609a85aba77a5102',
  sourceSnapshotFileHash:
    '6e4c8d64ced097e83111d27c7f46e1f1c08b79dc40423fee81ebc9d9c54cd455',
  packetFileHash:
    '101a697c84a4c14791f9c9393b12349350966070af69820d51908a594c7a160a',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/cadillac-xts/3ee40713b2b5/all-0001.json',
  reviewTokens: {
    blind: 'cadillac6_blind:no-blocker',
    edge: 'cadillac6_edge:no-blocker',
  },
  expectedIds: [
    'cadillac-xts-3-6l-direct-injection-intake-valve-carbon-buildup',
    'cadillac-xts-brake-booster-pump-connector-corrosion',
    'cadillac-xts-brake-lamps-flash-intermittently-cruise-disengages',
    'cadillac-xts-cue-screen-2013',
    'cadillac-xts-electric-parking-brake-2013',
    'cadillac-xts-hid-xenon-headlight-ballast-failure-housing-moisture',
    'cadillac-xts-high-pressure-direct-injection-fuel-pump-failure',
    'cadillac-xts-hvac-blend-door-actuator-clicking-blower-resistor-no-heat',
    'cadillac-xts-illuminated-door-handle-led-failure',
    'cadillac-xts-magnetic-ride-control-strut-shock-failure',
    'cadillac-xts-parasitic-battery-drain-modules-not-entering-sleep-mode',
    'cadillac-xts-passenger-presence-system-fault-passenger-airbag-light',
    'cadillac-xts-rear-air-suspension-sudden-collapse',
    'cadillac-xts-safety-alert-seat-haptic-motor-failure',
    'cadillac-xts-service-power-steering-message',
    'cadillac-xts-sunroof-drain-leak-headliner-water-damage',
    'cadillac-xts-timing-chain-2013',
    'cadillac-xts-torque-converter-transmission-shudder',
    'cadillac-xts-water-pump-weep-hole-coolant-leak',
  ],
  records: {
    'cadillac-xts-3-6l-direct-injection-intake-valve-carbon-buildup':
      archived({
        oldTitle: '3.6L Direct-Injection Intake Valve Carbon Buildup',
        idSuffix: 'Intake-Carbon Aggregation',
        claims: 0,
        urls: 0,
        years: [2013, 2014, 2015, 2016, 2017, 2018, 2019],
        category: 'engine',
        reason:
          'The frozen card assigns one universal carbon-build-up failure, mileage range and cleaning interval to both naturally aspirated and twin-turbo engines without an exact Cadillac bulletin or measured diagnostic threshold for the claimed all-year population.',
      }),
    'cadillac-xts-brake-booster-pump-connector-corrosion': exactPath({
      oldTitle:
        'Brake Booster Pump Connector Corrosion (Recall 14062 — Fire Risk)',
      claims: 1,
      urls: 3,
      evidence: [
        {
          type: 'recall',
          label:
            'GM Safety Recall 14062 / NHTSA 14V116 - Brake Booster Pump Cavity Plug',
          url: 'https://static.nhtsa.gov/odi/tsbs/2014/MC-10246852-9999.pdf',
        },
      ],
      years: [2013, 2014],
      category: 'brakes',
      title:
        'Recall 14V116: Brake-Booster Pump Connector Corrosion Can Create a Fire Risk',
      description:
        'GM safety recall 14062 covers 2013 and some 2014 XTS vehicles. A displaced cavity plug can let water enter and corrode the brake-booster pump relay connector; a resistive short can melt the connector and increase fire risk.',
      solution:
        'Check the VIN for an open NHTSA 14V116 / GM 14062 campaign. If open, arrange the dealer recall remedy, which includes sealing the cavity plugs, rerouting the vacuum-pump vent hose and replacing the affected front body harness when required. Do not purchase recall components from the former commerce links.',
      severity: 'high',
      symptoms: [
        'Open recall may exist without symptoms',
        'Brake-booster pump connector corrosion',
        'Melted connector or electrical odor',
      ],
      systems: [
        'brake-booster pump relay connector',
        'vacuum-pump vent hose',
        'front body wiring harness',
      ],
    }),
    'cadillac-xts-brake-lamps-flash-intermittently-cruise-disengages':
      exactPath({
        oldTitle:
          'Brake Lamps Flash Intermittently / Cruise Disengages (Recall — BCM)',
        claims: 2,
        urls: 6,
        evidence: [
          {
            type: 'recall',
            label:
              'GM Recall 13158B / NHTSA 13V220 - Intermittent Brake Lamp Illumination',
            url: 'https://static.nhtsa.gov/odi/rcl/2013/RCMN-13V220-6709.pdf',
          },
        ],
        years: [2013],
        category: 'electrical',
        title:
          'Recall 13V220: Brake Lamps May Flash and Cruise Control May Disengage',
        description:
          'GM recall 13158B covers certain 2013 XTS vehicles that may intermittently flash the brake lamps without brake application and disengage cruise control, creating a misleading signal to following drivers.',
        solution:
          'Check the VIN for an open NHTSA 13V220 / GM 13158 campaign. If open, arrange dealer reprogramming of the body control module at no charge. No parts are required by the recall, so all former switch and module commerce links were removed.',
        severity: 'high',
        symptoms: [
          'Brake lamps flash without brake-pedal application',
          'Cruise control disengages unexpectedly',
        ],
        systems: ['body control module', 'brake lamps', 'cruise control'],
      }),
    'cadillac-xts-cue-screen-2013': archived({
      oldTitle: 'CUE Infotainment Touchscreen Delamination - XTS',
      idSuffix: 'CUE Touchscreen Aggregation',
      claims: 1,
      urls: 1,
      years: [2013, 2014, 2015, 2016, 2017, 2018, 2019],
      category: 'electrical',
      reason:
        'The frozen card asserts a universal physical delamination defect and directs a replacement digitizer across all seven years using complaint/forum material. The primary-source sweep did not establish that all-year hardware defect, part identity or DIY repair path.',
    }),
    'cadillac-xts-electric-parking-brake-2013': exactPath({
      oldTitle: 'Electronic Parking Brake Actuator Failure',
      claims: 3,
      urls: 3,
      evidence: [
        {
          type: 'recall',
          label:
            'GM Recall 14471 / NHTSA 14V541 - Electronic Park Brake Drag',
          url: 'https://static.nhtsa.gov/odi/rcl/2014/RCRIT-14V541-6664.pdf',
        },
      ],
      years: [2013, 2014, 2015],
      category: 'brakes',
      title:
        'Recall 14V541: Electronic Parking-Brake Software May Allow Brake Drag',
      description:
        'GM recall 14471 covers certain 2013-2015 XTS vehicles. The electronic parking-brake piston actuation arm may not fully retract, leaving the rear pads partially engaged without reliably illuminating the parking-brake indicator. This can cause poor acceleration, unwanted deceleration, excessive heat, smoke or sparks.',
      solution:
        'Check the VIN for an open NHTSA 14V541 / GM 14471 campaign. If open, arrange dealer reprogramming of the electronic parking-brake control module at no charge. The recall remedy is software, not automatic actuator, switch or pad replacement, so the former parts links were removed.',
      severity: 'high',
      symptoms: [
        'Poor acceleration or unwanted deceleration',
        'Rear brake heat, smoke or sparks',
        'Parking-brake indicator may not show the drag condition',
      ],
      systems: [
        'electronic parking-brake control module',
        'rear brake calipers and pads',
      ],
    }),
    'cadillac-xts-hid-xenon-headlight-ballast-failure-housing-moisture':
      archived({
        oldTitle: 'HID Xenon Headlight Ballast Failure & Housing Moisture',
        idSuffix: 'HID and Moisture Aggregation',
        claims: 3,
        urls: 9,
        years: [2013, 2014, 2015, 2016, 2017, 2018, 2019],
        category: 'electrical',
        reason:
          'The frozen card combines normal condensation, housing leakage, ballast failure and bulb failure across every XTS year, assigns a generic drying/sealing repair and links unverified lighting parts without an exact XTS bulletin defining the claimed condition.',
      }),
    'cadillac-xts-high-pressure-direct-injection-fuel-pump-failure':
      archived({
        oldTitle: 'High-Pressure Direct-Injection Fuel Pump Failure',
        idSuffix: 'High-Pressure Fuel-Pump Aggregation',
        claims: 3,
        urls: 9,
        years: [2013, 2014, 2015, 2016, 2017, 2018, 2019],
        category: 'fuel',
        reason:
          'The frozen card assigns one high-pressure fuel-pump failure and replacement across naturally aspirated and twin-turbo engines, multiple DTCs and all model years without one exact GM source or VIN/engine boundary supporting that population or the linked pump.',
      }),
    'cadillac-xts-hvac-blend-door-actuator-clicking-blower-resistor-no-heat':
      archived({
        oldTitle: 'HVAC Blend Door Actuator Clicking / Blower Resistor No Heat',
        idSuffix: 'HVAC Multi-Fault Aggregation',
        claims: 3,
        urls: 9,
        years: [2013, 2014, 2015, 2016, 2017, 2018, 2019],
        category: 'hvac',
        reason:
          'The frozen card merges unrelated blend-door, blower-control and heater-output faults into one all-year repair card and links multiple parts without an exact XTS diagnostic that distinguishes the failed subsystem.',
      }),
    'cadillac-xts-illuminated-door-handle-led-failure': exactPath({
      oldTitle: 'Illuminated Door Handle LED Failure (Moisture)',
      claims: 4,
      urls: 12,
      evidence: [
        {
          type: 'tsb',
          label:
            'GM Preliminary Information PI0890A - 2013 XTS Outside Door Handle Water Intrusion',
          url: 'https://static.nhtsa.gov/odi/tsbs/2014/MC-10126244-9999.pdf',
        },
      ],
      years: [2013],
      category: 'electrical',
      title:
        'Early-Build Illuminated Door Handles May Fail from Water Intrusion',
      description:
        'GM PI0890A covers 2013 XTS vehicles equipped with illuminated outside door handles RPO HD7 and built from June 18 through August 1, 2012. Water intrusion can corrode the button/light electronics, leaving a lock/unlock button or handle light inoperative.',
      solution:
        'Verify RPO HD7 and the build date before applying this bulletin. For an affected handle, follow current service information to replace the complete outside handle assembly and the cable for that door; GM specifically warns against replacing only the PCB insert. Use the electronic parts catalog for the exact painted handle rather than the former generic commerce links.',
      symptoms: [
        'Outside door-handle lock/unlock button inoperative',
        'Illuminated outside door-handle light inoperative',
        'Moisture visible in the handle light',
      ],
      systems: [
        'illuminated outside door handle (RPO HD7)',
        'outside door-handle cable',
      ],
    }),
    'cadillac-xts-magnetic-ride-control-strut-shock-failure': exactPath({
      oldTitle: 'Magnetic Ride Control (MagneRide) Strut/Shock Failure',
      claims: 0,
      urls: 0,
      evidence: [
        {
          type: 'tsb',
          label:
            'GM Preliminary Information PI1285 - 2013-2015 XTS Rear Shock Diagnostic Tips',
          url: 'https://static.nhtsa.gov/odi/tsbs/2014/SB-10072511-0335.pdf',
        },
      ],
      years: [2013, 2014, 2015],
      category: 'suspension',
      title:
        'Rear-Shock Seepage or Clunk Requires Inspection Before Replacement',
      description:
        'GM PI1285 covers 2013-2015 XTS rear shocks when light oil seepage or a clunk over bumps is reported. A light oil film is not proof of failure; GM directs checking for a substantial leak and inspecting whether the upper mount shifted because its bolts or suspension-control software need correction.',
      solution:
        'Have the rear suspension inspected under current GM procedures. Do not replace a shock for light seepage alone. If the upper mount shifted, check and torque the mounting bolts to the bulletin specification and verify the Electronic Suspension Control Module calibration. Replace a shock only when diagnosis confirms an actual failure.',
      symptoms: [
        'Light oil residue on a rear shock',
        'Rear suspension clunk over bumps',
      ],
      systems: [
        'rear shock absorber',
        'upper rear shock mount',
        'Electronic Suspension Control Module',
      ],
    }),
    'cadillac-xts-parasitic-battery-drain-modules-not-entering-sleep-mode':
      archived({
        oldTitle: 'Parasitic Battery Drain / Modules Not Entering Sleep Mode',
        idSuffix: 'Parasitic-Drain Aggregation',
        claims: 0,
        urls: 0,
        years: [2013, 2014, 2015, 2016, 2017, 2018, 2019],
        category: 'electrical',
        reason:
          'The frozen card asserts a common all-year sleep-mode defect involving several possible modules but supplies no exact XTS bulletin, measured current threshold, equipment boundary or reproducible diagnostic path for that combined population.',
      }),
    'cadillac-xts-passenger-presence-system-fault-passenger-airbag-light':
      archived({
        oldTitle: 'Passenger Presence System Fault / Passenger Airbag Light On',
        idSuffix: 'Passenger-Presence Aggregation',
        claims: 0,
        urls: 0,
        years: [2013, 2014, 2015, 2016, 2017, 2018, 2019],
        category: 'safety',
        reason:
          'The frozen card assigns a universal passenger-presence sensor failure, wiring cause and replacement procedure to every XTS year without an exact GM bulletin or recall establishing that scope. An airbag warning requires current professional diagnosis, not a generic sensor prescription.',
      }),
    'cadillac-xts-rear-air-suspension-sudden-collapse': archived({
      oldTitle: 'Rear Air Suspension Sudden Collapse (F38 Air Ride)',
      idSuffix: 'Rear-Air-Suspension Aggregation',
      claims: 4,
      urls: 12,
      years: [2013, 2014, 2015, 2016, 2017, 2018, 2019],
      category: 'suspension',
      reason:
        'The frozen card combines compressor, air-line, sensor and shock faults into one sudden-collapse diagnosis across every model year and prescribes multiple unverified parts without an exact XTS bulletin establishing the claimed population or failed component.',
    }),
    'cadillac-xts-safety-alert-seat-haptic-motor-failure': archived({
      oldTitle: 'Safety Alert Seat Haptic Motor Failure',
      idSuffix: 'Haptic-Seat Aggregation',
      claims: 1,
      urls: 3,
      years: [2013, 2014, 2015, 2016, 2017, 2018, 2019],
      category: 'safety',
      reason:
        'The frozen card uses generic model-family and marketplace material to prescribe a seat motor across all XTS years. The exact haptic-motor bulletins surfaced in the primary corpus cover other Cadillac and GM models, not this frozen XTS population.',
    }),
    'cadillac-xts-service-power-steering-message': exactPath({
      oldTitle: 'Service Power Steering Message (FWD Belt-Drive EPS)',
      claims: 3,
      urls: 9,
      evidence: [
        {
          type: 'tsb',
          label:
            'GM Preliminary Information PI1294B - Intermittent XTS Service Power Steering Message',
          url: 'https://static.nhtsa.gov/odi/tsbs/2016/MC-10094743-2280.pdf',
        },
      ],
      years: [2014, 2015, 2016],
      category: 'steering',
      title:
        'Cold-Start Service Power Steering Message May Require Power, Ground and Software Checks',
      description:
        'GM PI1294B covers 2014-2016 XTS vehicles with belt-drive electronic power steering RPO NJ2 when a Service Power Steering message appears intermittently after a cold start and C056D 3C, C0475 00 or U0131 is current or stored.',
      solution:
        'Have a qualified technician verify RPO NJ2 and the exact DTC subtypes, inspect the G111 ground and XTS 80A F72UA fuse connections, fully charge and test the battery, then update the power-steering control module under current GM programming procedures. Do not replace the steering gear, module or battery solely from this card.',
      symptoms: [
        'Intermittent Service Power Steering message after a cold start',
        'C056D 3C',
        'C0475 00',
        'U0131',
      ],
      systems: [
        'belt-drive electronic power steering (RPO NJ2)',
        'G111 ground',
        'F72UA fuse',
        'power-steering control module',
      ],
      dtcCodes: ['C056D', 'C0475', 'U0131'],
    }),
    'cadillac-xts-sunroof-drain-leak-headliner-water-damage': archived({
      oldTitle: 'Sunroof Drain Leak / Headliner Water Damage',
      idSuffix: 'Sunroof-Drain Aggregation',
      claims: 7,
      urls: 21,
      years: [2013, 2014, 2015, 2016, 2017, 2018],
      category: 'body',
      reason:
        'The frozen card combines drain blockage, detached tubes, seal failure and headliner damage across six years, then links seven cleaning or repair products without an exact XTS bulletin defining the leak point or a safe universal procedure.',
    }),
    'cadillac-xts-timing-chain-2013': exactPath({
      oldTitle: '3.6L V6 Timing Chain Stretch - XTS',
      claims: 2,
      urls: 2,
      evidence: [
        {
          type: 'tsb',
          label:
            'GM Preliminary Information PIP3423P - High Feature V6 Correlation DTC Diagnosis',
          url: 'https://static.nhtsa.gov/odi/tsbs/2018/MC-10144453-9999.pdf',
        },
      ],
      years: [2013, 2014, 2015, 2016, 2017, 2018, 2019],
      engines: ['3.6L V6 (RPO LFX)', '3.6L Twin-Turbo V6 (RPO LF3)'],
      category: 'engine',
      title:
        'Multiple Cam/Crank Correlation DTCs Require Chain, Tensioner and Reluctor Diagnosis',
      description:
        'GM PIP3423P covers 2013-2019 XTS vehicles with the 3.6L LFX or LF3 engine when two or more of P0008, P0009 and P0016-P0019 are present. GM directs technicians to check for loose chains or tensioners and, if normal SI diagnosis does not find the cause, inspect whether the crankshaft-sensor reluctor moved. The bulletin does not establish automatic chain replacement.',
      solution:
        'Have a qualified technician confirm that at least two listed correlation DTCs are present, then follow current SI diagnosis for chains and tensioners. If the cause remains unresolved, inspect the crankshaft reluctor as directed by PIP3423P. Do not order the former generic timing kit or water pump from this card; the exact ShowMeTheParts lookup returned no timing-chain candidate.',
      symptoms: [
        'Check-engine light with two or more correlation DTCs',
        'P0008 or P0009',
        'P0016 through P0019',
      ],
      systems: [
        'timing chains and tensioners',
        'crankshaft-sensor reluctor',
        'camshaft/crankshaft correlation',
      ],
      dtcCodes: ['P0008', 'P0009', 'P0016', 'P0017', 'P0018', 'P0019'],
    }),
    'cadillac-xts-torque-converter-transmission-shudder': exactPath({
      oldTitle: 'Torque Converter / Transmission Shudder (6T70/6T75)',
      claims: 2,
      urls: 6,
      evidence: [
        {
          type: 'tsb',
          label:
            'GM Bulletin 18-NA-358 - 2014-2019 XTS 6T70/6T75/6T80 Shift Shudder Diagnosis',
          url: 'https://static.nhtsa.gov/odi/tsbs/2020/MC-10183161-9999.pdf',
        },
      ],
      years: [2014, 2015, 2016, 2017, 2018, 2019],
      category: 'transmission',
      title:
        'Launch or 2-3/3-2 Shift Shudder Must Be Separated from TCC Shudder',
      description:
        'GM bulletin 18-NA-358 covers 2014-2019 XTS vehicles with 6T70, 6T75 or 6T80 transmissions RPO M7U, M7W, M7V or MHM when severe launch or fourth-gear shudder, a 2-3 upshift or 3-2 downshift concern, flare, slip or harsh shift is present. Debris or scoring in the upper or lower valve body may be involved, but GM first requires ruling out engine driveability and torque-converter clutch shudder.',
      solution:
        'Have a qualified transmission technician verify the transmission RPO, reproduce the exact event and monitor TCC slip. Do not replace the TEHCM for this symptom. If diagnosis confirms the bulletin valve-body condition, follow current SI for both upper and lower valve-body replacement. Do not use a universal fluid or additive; the exact ShowMeTheParts lookup returned no transmission-fluid candidate.',
      symptoms: [
        'Severe shudder during launch in first gear',
        'Shudder in fourth gear',
        '2-3 upshift or 3-2 downshift shudder',
        'Flare, slide/bump, slip or harsh shift',
      ],
      systems: [
        '6T70/6T75/6T80 automatic transmission',
        'upper and lower control valve bodies',
        'torque-converter clutch',
      ],
    }),
    'cadillac-xts-water-pump-weep-hole-coolant-leak': archived({
      oldTitle: 'Water Pump Weep-Hole Coolant Leak (3.6L V6)',
      idSuffix: 'Water-Pump Leak Aggregation',
      claims: 2,
      urls: 6,
      years: [2013, 2014, 2015, 2016, 2017, 2018, 2019],
      category: 'cooling',
      reason:
        'The frozen card declares a common all-year water-pump failure, mileage range and replacement package for both XTS V6 variants using generic complaint and retailer material. The primary-source sweep did not establish that population or authorize the linked pump as a universal remedy.',
    }),
  },
  expectedTelemetry: {
    claimCount: 41,
    urlCount: 111,
    claimClickCount: 0,
    recordClickCount: 0,
    priorityClickCount: 0,
  },
  expectedDispositionCounts: {
    remove: 11,
    'diagnosis-hold': 8,
  },
  expectedPublished: 8,
  expectedArchived: 11,
  controlledDeltaProposals: [
    {
      disposition: 'proposal-only',
      insert: false,
      title: 'cadillac-xts-driver-airbag-inflator-recall-2015',
      sources: [
        'https://static.nhtsa.gov/odi/rcl/2026/RCLRPT-26V329-0487.pdf',
      ],
    },
  ],
  expectedProposalIdentities: [
    'cadillac-xts-driver-airbag-inflator-recall-2015::https://static.nhtsa.gov/odi/rcl/2026/RCLRPT-26V329-0487.pdf',
  ],
};

config.assertReviewedAfterState = function assertReviewedAfterState(issues) {
  const published = {
    'cadillac-xts-brake-booster-pump-connector-corrosion': [2013, 2014],
    'cadillac-xts-brake-lamps-flash-intermittently-cruise-disengages': [
      2013,
    ],
    'cadillac-xts-electric-parking-brake-2013': [2013, 2014, 2015],
    'cadillac-xts-illuminated-door-handle-led-failure': [2013],
    'cadillac-xts-magnetic-ride-control-strut-shock-failure': [
      2013, 2014, 2015,
    ],
    'cadillac-xts-service-power-steering-message': [2014, 2015, 2016],
    'cadillac-xts-timing-chain-2013': [
      2013, 2014, 2015, 2016, 2017, 2018, 2019,
    ],
    'cadillac-xts-torque-converter-transmission-shudder': [
      2014, 2015, 2016, 2017, 2018, 2019,
    ],
  };
  const expectedTimingEngines = [
    '3.6L V6 (RPO LFX)',
    '3.6L Twin-Turbo V6 (RPO LF3)',
  ];
  if (
    issues.some((issue) => {
      const expectedYears =
        published[issue.id] ||
        config.records[issue.id].after.years;
      const expectedStatus = published[issue.id] ? 'published' : 'archived';
      const expectedEngines =
        issue.id === 'cadillac-xts-timing-chain-2013'
          ? expectedTimingEngines
          : [];
      return (
        issue.after.status !== expectedStatus ||
        JSON.stringify(issue.after.years) !== JSON.stringify(expectedYears) ||
        JSON.stringify(issue.after.engines) !==
          JSON.stringify(expectedEngines)
      );
    })
  ) {
    throw new Error('Cadillac XTS reviewed scopes or statuses drifted.');
  }
};

module.exports = config;
