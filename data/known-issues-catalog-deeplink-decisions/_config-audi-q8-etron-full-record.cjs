const cite = (type, title, url) => ({ type, title, url });
const campaignUrl = (number) =>
  `https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=${number}`;

const citations = {
  brakePedal: cite(
    'recall',
    'NHTSA 26V240 / Audi 46P7 - e-tron Brake-Pedal Pushrod Joint',
    'https://static.nhtsa.gov/odi/rcl/2026/RCLRPT-26V240-2255.pdf',
  ),
  dcCharging: cite(
    'tsb',
    'Audi TSB 2071345/1 - e-tron Plug & Charge DC-Session Failure U15AF00',
    'https://static.nhtsa.gov/odi/tsbs/2023/MC-10242968-0001.pdf',
  ),
  ods: cite(
    'recall',
    'NHTSA 24V251 / Audi 69GU - 2024 e-tron Passenger-Occupant Detection',
    campaignUrl('24V251000'),
  ),
  brakeLine: cite(
    'recall',
    'NHTSA 24V428 / Audi 47DE - 2024 Q8 e-tron Brake-Pressure Line',
    campaignUrl('24V428000'),
  ),
  rearCamera: cite(
    'recall',
    'NHTSA 25V900 / Audi 90TV - e-tron Rearview-Camera Software',
    'https://static.nhtsa.gov/odi/rcl/2025/RCLRPT-25V900-3613.pdf',
  ),
  hvacNoise: cite(
    'tsb',
    'Audi TSB 2063467/6 - 2024 Q8 e-tron A/C Compressor-Area Noise',
    'https://static.nhtsa.gov/odi/tsbs/2024/MC-10253974-0001.pdf',
  ),
  inventory: cite(
    'nhtsa',
    'NHTSA 2024 Audi Q8 e-tron Recall Inventory',
    'https://api.nhtsa.gov/recalls/recallsByVehicle?make=Audi&model=Q8%20e-tron&modelYear=2024',
  ),
};

const archived = ({ years, category, title, formerClaim, diagnosis }) => ({
  disposition: 'remove',
  decision:
    `Archive the unsupported ${formerClaim}. No exact Audi or regulator primary source establishes the frozen row's complete Q8 e-tron model-year, symptom, failure, repair and prevention bundle. Remove every commerce claim and URL.`,
  evidence: [
    {
      label:
        'Official Audi/regulator material establishes narrower VIN-, campaign- or symptom-gated Q8 e-tron paths and does not establish this universal aggregation',
      url: citations.inventory.url,
    },
  ],
  after: {
    years,
    trims: [],
    engines: [],
    category,
    title: `Archived - Unsupported Audi Q8 e-tron ${title} Aggregation`,
    description:
      `The former row combined ${formerClaim} without an exact Audi or regulator primary source for the complete public claim.`,
    solution:
      `Do not order parts or apply a universal repair from this archived card. ${diagnosis}`,
    severity: 'low',
    confidence: 'low',
    source: 'manual',
    symptoms: [],
    affectedSystems: [],
    dtcCodes: [],
    citations: [citations.inventory],
    summary:
      `Archived an unsupported Audi Q8 e-tron ${title.toLowerCase()} aggregation and removed broad failure, repair, prevention and commerce claims.`,
  },
});

const recordSpecs = {
  'audi-q8-e-tron-brake-pedal-to-booster-pushrod-screw-joint-detachment':
    {
      disposition: 'recall-dealer',
      decision:
        'Update the frozen 24V621 / 46P6 brake-pedal card to current expanded NHTSA 26V240 / Audi 46P7. Retain the frozen 2023-2024 Q8 e-tron window within the official 2019-2024 e-tron and 2020-2024 e-tron Sportback scope.',
      evidence: [
        {
          label:
            'NHTSA 26V240 expands the earlier 24V621 population to 2019-2024 e-tron and 2020-2024 e-tron Sportback vehicles whose brake-pedal-to-booster fastener may detach',
          url: citations.brakePedal.url,
        },
      ],
      after: {
        years: [2023, 2024],
        trims: [],
        engines: [],
        category: 'brakes',
        title:
          '2023-2024 Audi Q8 e-tron Brake-Pedal Recall 46P7 / NHTSA 26V240',
        description:
          'Current NHTSA campaign 26V240 / Audi 46P7 covers certain 2019-2024 e-tron and 2020-2024 e-tron Sportback vehicles, including the Q8 e-tron generation represented by this frozen 2023-2024 card. The fastener joining the brake pedal to the brake-booster pushrod may have been assembled incorrectly and can allow the pedal to detach, causing loss of normal brake function. The current campaign incorporates vehicles outside the earlier 24V621 / 46P6 population. Eligibility is VIN-specific.',
        solution:
          'Check the VIN and campaign-completion history with Audi or NHTSA. Dealers inspect and tighten the brake-booster pushrod screw joint as necessary at no charge. If the brake pedal makes an unusual noise, fails to return or feels abnormal, do not continue driving; contact Audi for recovery and follow the owner’s manual emergency-braking instructions.',
        severity: 'high',
        confidence: 'high',
        source: 'nhtsa-verified',
        symptoms: [
          'Unusual brake-pedal noise',
          'Brake pedal does not return normally',
          'Loss of normal brake-pedal function',
        ],
        affectedSystems: [
          'brake pedal',
          'brake-booster pushrod screw joint',
        ],
        dtcCodes: [],
        citations: [citations.brakePedal],
        summary:
          'Updated the brake-pedal card from 24V621 / 46P6 to current expanded campaign 26V240 / 46P7.',
      },
    },
  'audi-q8-e-tron-dc-fast-charging-handshake-timeout-failure-to-initiate-sessi':
    {
      disposition: 'diagnosis-hold',
      decision:
        'Narrow the frozen generic DC-handshake card to exact Audi TSB 2071345/1 for repeatable Plug & Charge failure with U15AF00 symptom 2097297 on 2023 e-tron and 2024 Q8 e-tron vehicles.',
      evidence: [
        {
          label:
            'Audi TSB 2071345/1 identifies repeatable DC charging refusal at the same Plug & Charge station, AC charging that works and U15AF00 symptom 2097297',
          url: citations.dcCharging.url,
        },
      ],
      after: {
        years: [2023, 2024],
        trims: [],
        engines: [],
        category: 'electrical',
        title:
          '2023-2024 Audi Q8 e-tron Plug & Charge TSB 2071345/1',
        description:
          'Audi TSB 2071345/1 applies to 2023 e-tron and 2024 Q8 e-tron family vehicles when DC charging repeatedly fails at the same station with Plug & Charge enabled, AC charging works, the socket LED pulses white and the high-voltage charger stores U15AF00 with symptom code 2097297. Audi says some charging stations advertise Plug & Charge compatibility without the required station-side software.',
        solution:
          'Confirm that the failure repeats at the same station, AC charging works and U15AF00 symptom 2097297 is present. Temporarily disable Plug & Charge in the MMI or use another compatible charging station. Do not replace vehicle charging hardware solely from this symptom; follow current Audi guidance if the failure also occurs with Plug & Charge disabled or at multiple stations.',
        severity: 'low',
        confidence: 'high',
        source: 'nhtsa-verified',
        symptoms: [
          'DC charging repeatedly fails at the same station',
          'Charging-socket LED pulses white',
          'AC charging continues to work',
        ],
        affectedSystems: [
          'Plug & Charge communication',
          'high-voltage battery charger',
        ],
        dtcCodes: ['U15AF00'],
        citations: [citations.dcCharging],
        summary:
          'Narrowed the DC-handshake card to exact TSB 2071345/1 conditions, DTC/symptom code and non-parts workaround.',
      },
    },
  'audi-q8-e-tron-front-passenger-occupant-detection-system-deactivates-airbag':
    {
      disposition: 'recall-dealer',
      decision:
        'Correct the frozen 2023-2024 scope to the exact 2024 e-tron population in NHTSA 24V251 / Audi 69GU and remove the unrelated replacement-module search links.',
      evidence: [
        {
          label:
            'NHTSA 24V251 lists 2024 e-tron Quattro and e-tron Sportback Quattro vehicles whose passenger-seat ODS connection may loosen and deactivate the airbag',
          url: citations.ods.url,
        },
      ],
      after: {
        years: [2024],
        trims: [],
        engines: [],
        category: 'safety',
        title:
          '2024 Audi Q8 e-tron Passenger-Airbag Recall 69GU / NHTSA 24V251',
        description:
          'NHTSA campaign 24V251 / Audi 69GU covers a small VIN-specific population including certain 2024 e-tron Quattro and e-tron Sportback Quattro vehicles. An electrical connection in the front passenger seat can loosen, causing the occupant-detection control module to deactivate the passenger airbag and increase injury risk in a crash.',
        solution:
          'Check the VIN and campaign-completion history with Audi or NHTSA. The free remedy replaces the passenger-seat occupant-detection control module. If the passenger-airbag warning or AIRBAG OFF indicator behaves unexpectedly, avoid using that seat until Audi inspects it. Do not buy an ODS module from this summary.',
        severity: 'high',
        confidence: 'high',
        source: 'nhtsa-verified',
        symptoms: [
          'Passenger-airbag warning indicator illuminated',
          'Passenger airbag shown as disabled with an occupant present',
        ],
        affectedSystems: [
          'passenger occupant-detection system',
          'front passenger airbag',
        ],
        dtcCodes: [],
        citations: [citations.ods],
        summary:
          'Narrowed the ODS card to exact 2024 campaign 24V251 / 69GU and removed the direct module search links.',
      },
    },
  'audi-q8-e-tron-over-torqued-brake-pressure-line-failure-fluid-leak': {
    disposition: 'recall-dealer',
    decision:
      'Retain and tighten the frozen 2024 brake-pressure-line card to exact NHTSA 24V428 / Audi 47DE.',
    evidence: [
      {
        label:
          'NHTSA 24V428 explicitly covers certain 2024 Q8 e-tron and Q8 Sportback e-tron vehicles whose over-tightened brake-line connection may fail and leak',
        url: citations.brakeLine.url,
      },
    ],
    after: {
      years: [2024],
      trims: [],
      engines: [],
      category: 'brakes',
      title:
        '2024 Audi Q8 e-tron Brake-Line Recall 47DE / NHTSA 24V428',
      description:
        'NHTSA campaign 24V428 / Audi 47DE covers certain 2024 Q8 e-tron Quattro and Q8 Sportback e-tron Quattro vehicles. An over-tightened brake-pressure-line connection may fail, leak brake fluid and reduce braking ability, causing longer pedal travel or stopping distance. Eligibility is VIN-specific.',
      solution:
        'Check the VIN and campaign-completion history with Audi or NHTSA. Dealers inspect and replace the brake-pressure line when necessary at no charge. If the brake warning appears, pedal travel increases or fluid is visible, stop driving and arrange recovery.',
      severity: 'high',
      confidence: 'high',
      source: 'nhtsa-verified',
      symptoms: [
        'Brake warning indicator',
        'Longer brake-pedal travel',
        'Visible brake-fluid leakage',
      ],
      affectedSystems: ['brake-pressure line', 'hydraulic brake system'],
      dtcCodes: [],
      citations: [citations.brakeLine],
      summary:
        'Confirmed exact 2024 Q8 e-tron brake-line recall 24V428 / 47DE and its VIN-gated free inspection/replacement.',
    },
  },
  'audi-q8-e-tron-panoramic-glass-roof-water-leak-into-cabin': archived({
    years: [2023, 2024],
    category: 'body',
    title: 'Panoramic-Roof Water Leak',
    formerClaim:
      'two-year panoramic-roof leak and direct cassette replacement narrative supported by a cited document that does not establish this Q8 e-tron scope',
    diagnosis:
      'Water-test the roof and body openings and inspect the cassette, drains, seals and interior modules before selecting a repair.',
  }),
  'audi-q8-e-tron-premature-brake-pad-rotor-wear-brake-vibration-pulsation':
    archived({
      years: [2023, 2024],
      category: 'brakes',
      title: 'Brake Pad/Rotor Wear',
      formerClaim:
        'two-year universal premature brake-wear, vibration and direct rotor replacement prescription',
      diagnosis:
        'Measure pad and rotor thickness and runout, inspect caliper operation and verify the exact brake option and driving conditions.',
    }),
  'audi-q8-e-tron-rearview-camera-image-fails-is-delayed-when-shifting-to-reve':
    {
      disposition: 'recall-dealer',
      decision:
        'Update the frozen rearview-camera card to current NHTSA 25V900 / Audi 90TV and retain only the frozen 2023-2024 Q8 e-tron range within the official 2019-2024 e-tron and 2020-2024 e-tron Sportback scope.',
      evidence: [
        {
          label:
            'NHTSA 25V900 lists 2019-2024 e-tron Quattro and 2020-2024 e-tron Sportback Quattro vehicles whose software can prevent the rearview image from displaying',
          url: citations.rearCamera.url,
        },
      ],
      after: {
        years: [2023, 2024],
        trims: [],
        engines: [],
        category: 'electrical',
        title:
          '2023-2024 Audi Q8 e-tron Camera Recall 90TV / NHTSA 25V900',
        description:
          'NHTSA campaign 25V900 / Audi 90TV includes certain 2019-2024 e-tron Quattro and 2020-2024 e-tron Sportback Quattro vehicles, including the Q8 e-tron generation represented by this frozen 2023-2024 card. A software error may prevent the rearview-camera image from displaying as intended, reducing the driver’s view behind the vehicle. Eligibility is VIN-specific.',
        solution:
          'Check the VIN and campaign-completion history with Audi or NHTSA. Dealers update the software at no charge. Until completed, use mirrors and direct observation with extra care while reversing.',
        severity: 'high',
        confidence: 'high',
        source: 'nhtsa-verified',
        symptoms: [
          'Rearview-camera image is missing or not displayed as intended',
        ],
        affectedSystems: ['rearview-camera display software'],
        dtcCodes: [],
        citations: [citations.rearCamera],
        summary:
          'Updated the rearview-camera card to current 25V900 / 90TV and retained the frozen 2023-2024 Q8 e-tron scope.',
      },
    },
  'audi-q8-e-tron-severe-cold-weather-range-loss-reduced-dc-charge-speed':
    archived({
      years: [2023, 2024],
      category: 'hvac',
      title: 'Cold-Weather Range/Charge-Speed',
      formerClaim:
        'two-year universal severe cold-weather range and DC-charge-speed claim presented as a known defect without an exact Audi campaign or bulletin',
      diagnosis:
        'Compare ambient and battery temperature, HVAC demand, preconditioning, charger state and the vehicle’s own consumption/charging data before treating performance as a fault.',
    }),
  'audi-q8-etron-12v-battery-drain-2023': archived({
    years: [2023, 2024, 2025],
    category: 'electrical',
    title: '12-Volt Battery Drain',
    formerClaim:
      'three-year auxiliary-battery drain narrative with five battery, maintainer, relay and multimeter recommendations',
    diagnosis:
      'Test battery state and charging behavior, measure sleep current and scan the vehicle before replacing the battery or electrical components.',
  }),
  'audi-q8-etron-12v-battery-drain-2024': archived({
    years: [2024, 2025, 2026],
    category: 'electrical',
    title: 'Duplicate 12-Volt Battery Drain',
    formerClaim:
      'overlapping three-year parasitic-drain narrative and direct maintainer recommendation',
    diagnosis:
      'Test battery state and charging behavior, measure sleep current and identify the awake circuit or control module before repair.',
  }),
  'audi-q8-etron-charge-port-actuator-2024': archived({
    years: [2024, 2025, 2026],
    category: 'electrical',
    title: 'Charge-Port Actuator',
    formerClaim:
      'three-year charge-port actuator/lock failure and direct part plus unrelated portable-EVSE recommendation',
    diagnosis:
      'Reproduce the door or locking fault, scan the charging system and inspect the actuator, linkage, wiring and software before selecting parts.',
  }),
  'audi-q8-etron-charge-port-lid-2023': archived({
    years: [2023, 2024, 2025],
    category: 'electrical',
    title: 'Duplicate Charge-Port Door',
    formerClaim:
      'overlapping three-year charge-port-door actuator failure and duplicate part/portable-EVSE recommendations',
    diagnosis:
      'Reproduce the door or locking fault and inspect the exact actuator, linkage, wiring and control state before repair.',
  }),
  'audi-q8-etron-hvac-compressor-2024': {
    disposition: 'diagnosis-hold',
    decision:
      'Replace the broad 2024-2026 high-voltage compressor-failure and battery/EVSE shopping narrative with exact 2024 Q8 e-tron A/C noise TSB 2063467/6. Preserve the reproduce-and-localize gate and remove four unrelated commerce links.',
    evidence: [
      {
        label:
          'Audi TSB 2063467/6 lists 2024 Q8 e-tron family vehicles and says compressor-area noise may come from contact between adjacent refrigerant lines or a line and hood-release cable clip',
        url: citations.hvacNoise.url,
      },
    ],
    after: {
      years: [2024],
      trims: [],
      engines: [],
      category: 'hvac',
      title:
        '2024 Audi Q8 e-tron A/C Compressor-Area Noise TSB 2063467/6',
      description:
        'Audi TSB 2063467/6 applies to 2024 Q8 e-tron family vehicles when a cabin noise is present only while the air-conditioning compressor runs and disappears when A/C is switched off. Audi says the supported cause may be direct contact between adjacent refrigerant lines or between a refrigerant line and the hood-release Bowden-cable clip; the bulletin does not establish universal compressor failure.',
      solution:
        'Reproduce the exact noise with the A/C compressor active and confirm that it stops when A/C is switched off. Inspect the bulletin’s refrigerant-line contact points and hood-release cable clip and perform only the branch that matches the confirmed contact. Diagnose non-reproducible noise or loss of heating/cooling separately; do not buy a battery, maintainer or portable EVSE from this card.',
      severity: 'low',
      confidence: 'high',
      source: 'nhtsa-verified',
      symptoms: [
        'Noise heard in the cabin only while the A/C compressor runs',
        'Noise stops when air conditioning is switched off',
      ],
      affectedSystems: [
        'refrigerant lines',
        'hood-release Bowden-cable clip',
        'A/C compressor operating area',
      ],
      dtcCodes: [],
      citations: [citations.hvacNoise],
      summary:
        'Narrowed the HVAC card to exact 2024 TSB 2063467/6 noise diagnosis and removed four unrelated commerce links.',
    },
  },
};

const expectedIds = [
  'audi-q8-e-tron-brake-pedal-to-booster-pushrod-screw-joint-detachment',
  'audi-q8-e-tron-dc-fast-charging-handshake-timeout-failure-to-initiate-sessi',
  'audi-q8-e-tron-front-passenger-occupant-detection-system-deactivates-airbag',
  'audi-q8-e-tron-over-torqued-brake-pressure-line-failure-fluid-leak',
  'audi-q8-e-tron-panoramic-glass-roof-water-leak-into-cabin',
  'audi-q8-e-tron-premature-brake-pad-rotor-wear-brake-vibration-pulsation',
  'audi-q8-e-tron-rearview-camera-image-fails-is-delayed-when-shifting-to-reve',
  'audi-q8-e-tron-severe-cold-weather-range-loss-reduced-dc-charge-speed',
  'audi-q8-etron-12v-battery-drain-2023',
  'audi-q8-etron-12v-battery-drain-2024',
  'audi-q8-etron-charge-port-actuator-2024',
  'audi-q8-etron-charge-port-lid-2023',
  'audi-q8-etron-hvac-compressor-2024',
];
const records = Object.fromEntries(
  expectedIds.map((id) => [id, recordSpecs[id]]),
);
const expected = (claimIds, urls) => ({
  claimIds,
  urls,
  claimClicks: 0,
  recordClicks: 0,
  priorityClicks: 0,
});

module.exports = {
  label: 'Audi Q8 e-tron',
  make: 'Audi',
  model: 'Q8 e-tron',
  batchId: 'audi-q8-etron-full-record-cohort-1-2026-07-29',
  auditDate: '2026-07-29',
  snapshotHash:
    '3ee40713b2b5f1bd845d6118be79fc8486956e01d41eb5a8609a85aba77a5102',
  sourceSnapshotFileHash:
    '6e4c8d64ced097e83111d27c7f46e1f1c08b79dc40423fee81ebc9d9c54cd455',
  packetFileHash:
    '194ab3962ba317986afa4825de8421f656ced39ec97df1944d4b92fc9ce3b011',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/audi-q8-etron/3ee40713b2b5/all-0001.json',
  reviewTokens: {
    blind: 'q8_etron_blind_review:no-blocker',
    edge: 'q8_etron_edge_review:no-blocker',
  },
  expectedIds,
  records,
  expectedPerRecord: {
    'audi-q8-e-tron-brake-pedal-to-booster-pushrod-screw-joint-detachment':
      expected([], []),
    'audi-q8-e-tron-dc-fast-charging-handshake-timeout-failure-to-initiate-sessi':
      expected([], []),
    'audi-q8-e-tron-front-passenger-occupant-detection-system-deactivates-airbag':
      expected(
        ['fixParts:0'],
        [
          'https://www.amazon.com/s?k=4M0959339&tag=au7o-20',
          'https://www.rockauto.com/en/partsearch/?q=4M0959339',
          'https://www.ebay.com/sch/i.html?_nkw=4M0959339',
        ],
      ),
    'audi-q8-e-tron-over-torqued-brake-pressure-line-failure-fluid-leak':
      expected([], []),
    'audi-q8-e-tron-panoramic-glass-roof-water-leak-into-cabin': expected(
      ['fixParts:0'],
      [
        'https://www.amazon.com/s?k=4KE877203B&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=4KE877203B',
        'https://www.ebay.com/sch/i.html?_nkw=4KE877203B',
      ],
    ),
    'audi-q8-e-tron-premature-brake-pad-rotor-wear-brake-vibration-pulsation':
      expected(
        ['fixParts:0'],
        [
          'https://www.amazon.com/s?k=4KE615301&tag=au7o-20',
          'https://www.rockauto.com/en/partsearch/?q=4KE615301',
          'https://www.ebay.com/sch/i.html?_nkw=4KE615301',
        ],
      ),
    'audi-q8-e-tron-rearview-camera-image-fails-is-delayed-when-shifting-to-reve':
      expected([], []),
    'audi-q8-e-tron-severe-cold-weather-range-loss-reduced-dc-charge-speed':
      expected([], []),
    'audi-q8-etron-12v-battery-drain-2023': expected(
      [
        'communityRecommendations:0',
        'communityRecommendations:1',
        'communityRecommendations:2',
        'communityRecommendations:3',
        'communityRecommendations:4',
      ],
      [
        'https://www.amazon.com/s?k=Optima%20RedTop%20AGM%20Battery%20Audi%20Q8%20e-tron&tag=au7o-20',
        'https://www.amazon.com/s?k=ACDelco%20Professional%20AGM%20Battery%20Audi%20Q8%20e-tron&tag=au7o-20',
        'https://www.amazon.com/s?k=Battery%20Tender%20Junior%2012V%20Battery%20Charger%20Maintainer%20Audi%20Q8%20e-tron&tag=au7o-20',
        'https://www.amazon.com/s?k=Bosch%20Automotive%20Relay%205-Pin%2012V%20Audi%20Q8%20e-tron&tag=au7o-20',
        'https://www.amazon.com/s?k=Innova%20Digital%20Multimeter%20Audi%20Q8%20e-tron&tag=au7o-20',
      ],
    ),
    'audi-q8-etron-12v-battery-drain-2024': expected(
      ['communityRecommendations:0'],
      [
        'https://www.amazon.com/s?k=CTEK+MXS+5.0+40-206&tag=au7o-20',
      ],
    ),
    'audi-q8-etron-charge-port-actuator-2024': expected(
      ['fixParts:0', 'communityRecommendations:3'],
      [
        'https://www.amazon.com/s?k=4KE915651A&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=4KE915651A',
        'https://www.ebay.com/sch/i.html?_nkw=4KE915651A',
        'https://www.amazon.com/s?k=Lectron%20Portable%20Level%202%20EV%20Charger%20Audi%20Q8%20e-tron&tag=au7o-20',
      ],
    ),
    'audi-q8-etron-charge-port-lid-2023': expected(
      ['fixParts:0', 'communityRecommendations:0'],
      [
        'https://www.amazon.com/s?k=4KE915651A&tag=au7o-20',
        'https://www.rockauto.com/en/partsearch/?q=4KE915651A',
        'https://www.ebay.com/sch/i.html?_nkw=4KE915651A',
        'https://www.amazon.com/s?k=Lectron%20Portable%20Level%202%20EV%20Charger%20Audi%20Q8%20e-tron&tag=au7o-20',
      ],
    ),
    'audi-q8-etron-hvac-compressor-2024': expected(
      [
        'communityRecommendations:3',
        'communityRecommendations:4',
        'communityRecommendations:5',
        'communityRecommendations:6',
      ],
      [
        'https://www.amazon.com/s?k=Optima%20RedTop%20AGM%20Battery%20Audi%20Q8%20e-tron&tag=au7o-20',
        'https://www.amazon.com/s?k=ACDelco%20Professional%20AGM%20Battery%20Audi%20Q8%20e-tron&tag=au7o-20',
        'https://www.amazon.com/s?k=Battery%20Tender%20Junior%2012V%20Battery%20Charger%20Maintainer%20Audi%20Q8%20e-tron&tag=au7o-20',
        'https://www.amazon.com/s?k=Lectron%20Portable%20Level%202%20EV%20Charger%20Audi%20Q8%20e-tron&tag=au7o-20',
      ],
    ),
  },
  expectedTelemetry: {
    claimCount: 17,
    urlCount: 27,
    claimClickCount: 0,
    recordClickCount: 0,
    priorityClickCount: 0,
  },
  expectedDispositionCounts: {
    'recall-dealer': 4,
    'diagnosis-hold': 2,
    remove: 7,
  },
  expectedPublished: 6,
  expectedArchived: 7,
  controlledDeltaProposals: [],
  expectedProposalIdentities: [],
  assertReviewedAfterState(issues) {
    const byId = new Map(issues.map((issue) => [issue.id, issue.after]));
    if (
      JSON.stringify(
        byId.get(
          'audi-q8-e-tron-brake-pedal-to-booster-pushrod-screw-joint-detachment',
        ).years,
      ) !== JSON.stringify([2023, 2024]) ||
      JSON.stringify(
        byId.get(
          'audi-q8-e-tron-front-passenger-occupant-detection-system-deactivates-airbag',
        ).years,
      ) !== JSON.stringify([2024]) ||
      JSON.stringify(
        byId.get(
          'audi-q8-e-tron-over-torqued-brake-pressure-line-failure-fluid-leak',
        ).years,
      ) !== JSON.stringify([2024]) ||
      JSON.stringify(
        byId.get('audi-q8-etron-hvac-compressor-2024').years,
      ) !== JSON.stringify([2024]) ||
      issues.filter((issue) => issue.after.status === 'archived').length !== 7
    ) {
      throw new Error(
        'Audi Q8 e-tron campaign/TSB scopes or published/archived split drifted after review.',
      );
    }
  },
};
