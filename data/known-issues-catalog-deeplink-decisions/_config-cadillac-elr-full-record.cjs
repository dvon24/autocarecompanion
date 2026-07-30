const communicationsCorpus =
  'https://www.nhtsa.gov/nhtsa-datasets-and-apis';

function exactPath({
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
  severity = 'medium',
  source = 'nhtsa-verified',
  symptoms,
  systems,
  dtcCodes = [],
}) {
  return {
    disposition,
    decision: `Replace the frozen "${oldTitle}" aggregation with the exact primary-source path below. Remove all ${claims} commerce claims and ${urls} outbound URL occurrences.`,
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
      title: `Archived - Unsupported Cadillac ELR ${idSuffix}`,
      description: `The former card asserted "${oldTitle}" across a broad Cadillac ELR population. ${reason}`,
      solution:
        'Do not order parts or apply a universal repair from this archived card. Verify the exact year, VIN, symptoms, DTCs and current GM service information before diagnosis or repair.',
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
      summary: `Archived the unsupported Cadillac ELR "${oldTitle}" aggregation and removed ${claims} commerce claims with ${urls} URLs.`,
    },
  };
}

const config = {
  label: 'Cadillac ELR',
  make: 'Cadillac',
  model: 'ELR',
  batchId: 'cadillac-elr-full-record-cohort-1-2026-07-30',
  auditDate: '2026-07-30',
  snapshotHash:
    '3ee40713b2b5f1bd845d6118be79fc8486956e01d41eb5a8609a85aba77a5102',
  sourceSnapshotFileHash:
    '6e4c8d64ced097e83111d27c7f46e1f1c08b79dc40423fee81ebc9d9c54cd455',
  packetFileHash:
    'b2b73aaf9cd36053a39d743c36fe6fc4f82d402d48f308add5908ff947be3a00',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/cadillac-elr/3ee40713b2b5/all-0001.json',
  reviewTokens: {
    blind: 'cadillac4_blind:no-blocker',
    edge: 'cadillac4_edge:no-blocker',
  },
  expectedIds: [
    'cadillac-elr-charging-system-2014',
    'cadillac-elr-12v-battery-2014',
    'cadillac-elr-battery-degradation-2014',
    'cadillac-elr-charge-port-door-2014',
    'cadillac-elr-cue-infotainment-touchscreen-delamination-unresponsive-touch',
    'cadillac-elr-electronic-stability-control-diagnostic-software-defect-no-w',
    'cadillac-elr-engine-forced-to-run-by-fuel-engine-maintenance-mode-after-s',
    'cadillac-elr-front-seat-hook-bracket-weld-defect-seat-may-not-stay-secure',
    'cadillac-elr-gas-engine-engages-prematurely-before-ev-range-is-used-up',
    'cadillac-elr-loss-propulsion-propulsion-power-reduced-from-low-hv-battery',
    'cadillac-elr-regen-brake-pad-2014',
    'cadillac-elr-service-high-voltage-charging-system-message-from-low-batter',
    'cadillac-elr-shift-to-park-false-warning-from-failing-electronic-shifter',
    'cadillac-elr-sudden-total-loss-electrical-power-while-driving',
  ],
  records: {
    'cadillac-elr-charging-system-2014': exactPath({
      oldTitle: 'Onboard Charger and EVSE Communication Failures',
      claims: 3,
      urls: 3,
      evidence: [
        {
          type: 'tsb',
          label: 'GM PIC6015A - ELR Charge-Receptacle Diagnosis',
          url: 'https://static.nhtsa.gov/odi/tsbs/2014/MC-10114763-9999.pdf',
        },
        {
          type: 'tsb',
          label: 'GM PIC6076 - ELR P1EDD/P1EDC Charging Diagnosis',
          url: 'https://static.nhtsa.gov/odi/tsbs/2015/SB-10057983-3206.pdf',
        },
      ],
      years: [2014, 2015],
      category: 'electrical',
      title:
        'No-Charge or Service Charging Message Needs Charge-Receptacle Diagnosis',
      description:
        'GM PIC6015A and PIC6076 cover bounded ELR no-charge and Service High Voltage Charging System paths. A cord, charging station, pilot-signal fault, cracked or water-affected receptacle, or an applicable HPCM2 calibration can produce the concern; the bulletins do not establish universal onboard-charger failure.',
      solution:
        'Have a qualified technician record DTCs and freeze-frame data, rule out the cord and charging infrastructure, inspect the charge receptacle for cracks or water intrusion, and apply the current GM diagnostic or HPCM2 programming path when its criteria are met. Do not order charging hardware from this card.',
      severity: 'high',
      symptoms: [
        'Vehicle will not charge',
        'Service High Voltage Charging System message',
      ],
      systems: [
        'charge receptacle',
        'electric-vehicle supply equipment interface',
        'hybrid powertrain control module 2',
      ],
      dtcCodes: ['P0D22', 'P0D26', 'P0D58', 'P0D59', 'P1EDC', 'P1EDD'],
    }),
    'cadillac-elr-12v-battery-2014': exactPath({
      oldTitle: '12V Auxiliary Battery Drain Preventing System Boot',
      claims: 3,
      urls: 3,
      evidence: [
        {
          type: 'tsb',
          label: 'GM PI1141 - 2014 ELR Owner Information',
          url: 'https://static.nhtsa.gov/odi/tsbs/2013/MC-10133111-9999.pdf',
        },
        {
          type: 'tsb',
          label: 'GM Program 14395A - 2015 ELR OnStar Battery Drain',
          url: 'https://static.nhtsa.gov/odi/tsbs/2015/SB-10057076-6945.pdf',
        },
      ],
      years: [2014, 2015],
      category: 'electrical',
      title:
        'Low 12-Volt Battery Can Prevent Module Wake-Up; Diagnose the Cause First',
      description:
        'A low ELR 12-volt battery can leave control modules unable to wake and prevent a normal start. GM also issued VIN-gated program 14395A for a bounded 2015 OnStar-module battery-drain condition; that program expired in 2017 and is not proof of a universal drain.',
      solution:
        'Test the AGM battery and charging state, preserve DTC and low-voltage history, and diagnose the source of discharge before replacement. For a 2015 vehicle, ask a Cadillac dealer to check VIN and program history. This card does not cover a sudden loss of power while driving and does not prescribe a battery or maintainer.',
      symptoms: [
        'Control modules do not wake',
        'Vehicle will not enter Ready mode',
        'Low 12-volt battery after parking',
      ],
      systems: ['12-volt AGM battery', 'vehicle control modules', 'OnStar module'],
    }),
    'cadillac-elr-battery-degradation-2014': exactPath({
      disposition: 'no-commerce',
      oldTitle: 'High-Voltage Battery Capacity Degradation and Reduced EV Range',
      claims: 3,
      urls: 3,
      evidence: [
        {
          type: 'manual',
          label: '2015 Cadillac ELR Limited Warranty and Owner Assistance',
          url: 'https://experience.gm.com/ownercenter/content/dam/gmownercenter/gmna/dynamic/manuals/2015/cadillac/Multiple%20Model%20PDFs/2015%20Limited%20Warranty%20and%20Owner%20Assistance%20Information.pdf',
        },
      ],
      years: [2015],
      category: 'electrical',
      source: 'manual',
      title:
        'Gradual High-Voltage Battery Capacity Loss Is Not the Same as a Fault',
      description:
        'Cadillac warranty information for the 2015 ELR states that gradual high-voltage battery capacity loss is expected with time and use and distinguishes it from a warranted defect. That policy does not support a fixed range, age, balancing routine, individual-module repair, or unrelated 12-volt battery recommendation.',
      solution:
        'Track range under comparable temperature, route and climate-control conditions. Have abrupt range loss, warning messages, charging faults or reduced propulsion diagnosed separately. High-voltage battery inspection and service require qualified EV procedures; there is no owner-buyable repair on this card.',
      severity: 'medium',
      symptoms: ['Gradual reduction in electric driving range'],
      systems: ['high-voltage propulsion battery'],
    }),
    'cadillac-elr-charge-port-door-2014': archived({
      oldTitle: 'Charge Port Door Actuator Failure and Charging Issues',
      idSuffix: 'Charge-Port-Door Aggregation',
      years: [2014, 2015, 2016],
      category: 'body',
      claims: 5,
      urls: 5,
      reason:
        'The current primary-source sweep did not establish a recurring motorized-door actuator defect, the asserted part number, maintenance schedule or a universal charging remedy. Charge-receptacle electrical faults are a separate published record.',
    }),
    'cadillac-elr-cue-infotainment-touchscreen-delamination-unresponsive-touch':
      exactPath({
        oldTitle:
          'CUE Infotainment Touchscreen Delamination and Unresponsive Touch',
        claims: 1,
        urls: 3,
        evidence: [
          {
            type: 'tsb',
            label: 'GM PIC6055B - CUE ICS Display Bubbling or Delamination',
            url: 'https://static.nhtsa.gov/odi/tsbs/2016/MC-10119043-9999.pdf',
          },
        ],
        years: [2014, 2015, 2016],
        category: 'electrical',
        title:
          'CUE 8-Inch Display Bubbling or Delamination Needs ICS Inspection',
        description:
          'GM PIC6055B covers an 8-inch CUE integrated-center-stack display that bubbles or delaminates. The bulletin requires technicians to distinguish the condition from damage caused by cleaners or excessive force and does not establish a universal DIY digitizer repair or fixed replacement part number.',
        solution:
          'Document the display condition and have a Cadillac technician apply PIC6055B. After excluding external damage, the bulletin directs replacement of the integrated center stack using the current VIN-correct service part and authorization path. Do not order a screen from this card.',
        symptoms: [
          'Bubbles beneath the CUE display surface',
          'Display-layer delamination',
        ],
        systems: ['CUE integrated center stack', '8-inch touch display'],
      }),
    'cadillac-elr-electronic-stability-control-diagnostic-software-defect-no-w':
      exactPath({
        disposition: 'recall-dealer',
        oldTitle:
          'Electronic Stability Control Diagnostic Software Defect (NHTSA Recall 14V144000) - No Warning When ESC Is Disabled',
        claims: 0,
        urls: 0,
        evidence: [
          {
            type: 'recall',
            label: 'NHTSA Recall 14V-144 - ELR ESC Diagnostics',
            url: 'https://static.nhtsa.gov/odi/rcl/2014/RCAK-14V144-8420.pdf',
          },
          {
            type: 'recall',
            label: 'GM Recall 14087 - EBCM Recalibration',
            url: 'https://static.nhtsa.gov/odi/rcl/2014/RCRIT-14V144-6578.pdf',
          },
        ],
        years: [2014],
        category: 'safety',
        title:
          'ESC Software May Not Warn When Stability Control Is Disabled (Recall 14V144)',
        description:
          'Certain 2014 ELR vehicles without adaptive cruise control were built with software that can inhibit some electronic-stability-control diagnostics. An ESC fault may therefore disable or degrade the system without illuminating the required malfunction warning, increasing crash risk.',
        solution:
          'Check the VIN and recall-completion history with Cadillac. Recall 14V144 / GM 14087 directs dealers to recalibrate the Electronic Brake Control Module at no charge for an involved vehicle.',
        severity: 'high',
        symptoms: ['Open safety recall', 'ESC fault may occur without a warning lamp'],
        systems: ['electronic stability control', 'electronic brake control module'],
      }),
    'cadillac-elr-engine-forced-to-run-by-fuel-engine-maintenance-mode-after-s':
      exactPath({
        disposition: 'no-commerce',
        oldTitle:
          'Engine Forced to Run by Fuel/Engine Maintenance Mode After Sitting Unused',
        claims: 1,
        urls: 3,
        evidence: [
          {
            type: 'tsb',
            label: 'GM PI1141 - 2014 ELR Owner Information',
            url: 'https://static.nhtsa.gov/odi/tsbs/2013/MC-10133111-9999.pdf',
          },
          {
            type: 'tsb',
            label: 'GM PI1504 - 2016 ELR Owner Information',
            url: 'https://static.nhtsa.gov/odi/tsbs/2015/MC-10138109-9999.pdf',
          },
        ],
        years: [2014, 2016],
        engines: ['1.4L LUU'],
        category: 'fuel',
        title:
          'Engine and Fuel Maintenance Modes Can Run the Engine With Charge Remaining',
        description:
          'The ELR can start its gasoline engine during documented Engine Maintenance Mode or Fuel Maintenance Mode even when battery charge remains. These modes keep the engine operable and consume aging fuel; they are normal operating behaviors, not proof of a propulsion-battery fault.',
        solution:
          'Read the Driver Information Center message and follow the owner-information prompts. Fuel Maintenance Mode ends after enough old fuel is used and fresh fuel is added or fuel becomes low. Diagnose the vehicle only when behavior falls outside the documented mode or occurs with warning messages or DTCs; do not add fuel cleaner from this card.',
        severity: 'low',
        symptoms: [
          'Gasoline engine runs while battery charge remains',
          'Engine Maintenance Mode message',
          'Fuel Maintenance Mode message',
        ],
        systems: ['range-extender engine', 'fuel maintenance logic'],
      }),
    'cadillac-elr-front-seat-hook-bracket-weld-defect-seat-may-not-stay-secure':
      exactPath({
        disposition: 'recall-dealer',
        oldTitle:
          'Front Seat Hook Bracket Weld Defect (NHTSA Recall 14V446000) - Seat May Not Stay Secured in a Crash',
        claims: 0,
        urls: 0,
        evidence: [
          {
            type: 'recall',
            label: 'NHTSA Recall 14V-446 - Front-Seat Hook-Bracket Weld',
            url: 'https://static.nhtsa.gov/odi/rcl/2014/RCAK-14V446-9363.pdf',
          },
          {
            type: 'recall',
            label: 'GM Recall 14340 - Seat Hook-Bracket Inspection',
            url: 'https://static.nhtsa.gov/odi/rcl/2014/RCRIT-14V446-2589.pdf',
          },
        ],
        years: [2014],
        category: 'safety',
        title:
          'Front-Seat Hook-Bracket Weld May Be Incomplete (Recall 14V446)',
        description:
          'Certain 2014 ELR vehicles may have an incomplete weld on either front-seat hook-bracket assembly. Under a high load such as a crash, the hook can separate from the seat track and increase occupant-injury risk.',
        solution:
          'Check the VIN and recall-completion history with Cadillac. Recall 14V446 / GM 14340 directs dealers to inspect both front-seat hook-bracket welds and replace the affected lower seat track when required.',
        severity: 'high',
        symptoms: ['Open safety recall'],
        systems: ['front-seat tracks', 'seat hook-bracket welds'],
      }),
    'cadillac-elr-gas-engine-engages-prematurely-before-ev-range-is-used-up':
      exactPath({
        disposition: 'no-commerce',
        oldTitle:
          'Gas Engine Engages Prematurely Before EV Range Is Used Up',
        claims: 2,
        urls: 6,
        evidence: [
          {
            type: 'tsb',
            label: 'GM PI1141 - 2014 ELR Owner Information',
            url: 'https://static.nhtsa.gov/odi/tsbs/2013/MC-10133111-9999.pdf',
          },
          {
            type: 'tsb',
            label: 'GM PI1504 - 2016 ELR Owner Information',
            url: 'https://static.nhtsa.gov/odi/tsbs/2015/MC-10138109-9999.pdf',
          },
        ],
        years: [2014, 2016],
        engines: ['1.4L LUU'],
        category: 'drivetrain',
        title:
          'The Gas Engine Can Start With EV Range Remaining Under Normal Conditions',
        description:
          'Cadillac documents several normal reasons the ELR gasoline engine may start while battery charge remains, including low or high battery temperature, low high-voltage state of charge, an open hood and engine or fuel maintenance mode. That behavior alone does not establish battery imbalance or pack failure.',
        solution:
          'Check the ambient conditions, hood status, battery display and Driver Information Center messages. Use the maintenance-mode record when that message is present. Seek qualified diagnosis when the engine behavior falls outside documented conditions or accompanies a warning or DTC; do not order battery products from this card.',
        severity: 'low',
        symptoms: ['Gasoline engine starts while indicated EV range remains'],
        systems: [
          'extended-range electric propulsion system',
          'high-voltage battery temperature management',
        ],
      }),
    'cadillac-elr-loss-propulsion-propulsion-power-reduced-from-low-hv-battery':
      exactPath({
        oldTitle:
          "Loss of Propulsion / 'Propulsion Power Reduced' from Low HV Battery Cell Voltage",
        claims: 2,
        urls: 6,
        evidence: [
          {
            type: 'tsb',
            label:
              'GM Program N172130462-02 - Low HV Cell Voltage Warning Calibration',
            url: 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10166248-9999.pdf',
          },
        ],
        years: [2014, 2015, 2016],
        category: 'drivetrain',
        title:
          'Low High-Voltage Cell Voltage Can Reduce or Remove Propulsion',
        description:
          'GM customer-satisfaction program N172130462 covered certain 2014-2016 ELR vehicles whose original HPCM2 calibration might not provide enough warning before a low high-voltage cell caused reduced or lost propulsion. The software adds warning time; it does not restore battery capacity. The program expired in 2021 and was not a recall.',
        solution:
          'If reduced propulsion is active, stop in a safe location and arrange qualified EV service or towing. A Cadillac dealer should check the VIN, program and software history and perform the current high-voltage battery diagnosis. Do not assume current free coverage or order battery parts from this card.',
        severity: 'high',
        symptoms: [
          'Propulsion Power Reduced message',
          'Loss of propulsion',
          'Vehicle may not enter Ready mode',
        ],
        systems: ['high-voltage propulsion battery', 'hybrid powertrain control module 2'],
      }),
    'cadillac-elr-regen-brake-pad-2014': exactPath({
      oldTitle: 'Brake Rotor Corrosion and Pulsation from Infrequent Use',
      claims: 1,
      urls: 1,
      evidence: [
        {
          type: 'tsb',
          label: 'GM 00-05-22-002N - Brake Pulsation and Rotor Diagnosis',
          url: 'https://static.nhtsa.gov/odi/tsbs/2013/MC-10139080-9999.pdf',
        },
      ],
      years: [2014],
      category: 'brakes',
      title:
        'Brake-Rotor Corrosion or Thickness Variation Can Cause Pulsation',
      description:
        'GM bulletin 00-05-22-002N applies to 2014 and prior GM passenger cars and distinguishes cosmetic corrosion, lot rot, lateral runout, thickness variation and flaking. Applying it to the 2014 ELR is a scope inference; the bulletin does not establish regenerative braking as the cause of a recurring ELR defect.',
      solution:
        'Have brake pulsation or corrosion inspected first. For inspected cosmetic corrosion or low-mileage lot rot within the bulletin’s 0-200-mile condition, a technician may use its limited burnish check of 10 to 15 moderate stops from 35 to 40 mph with cooling between stops. Persistent, higher-mileage or flaking-corrosion concerns require professional measurement and the appropriate brake service, not road burnishing or a universal rotor prescription.',
      symptoms: ['Brake-pedal pulsation', 'Visible brake-rotor corrosion'],
      systems: ['friction brakes', 'brake rotors'],
    }),
    'cadillac-elr-service-high-voltage-charging-system-message-from-low-batter':
      exactPath({
        oldTitle:
          "'Service High Voltage Charging System' Message from Low Battery Coolant or Failed Coolant Level Sensor",
        claims: 3,
        urls: 9,
        evidence: [
          {
            type: 'tsb',
            label: 'GM PIC5920B - ELR P0DAA High-Voltage Isolation Diagnosis',
            url: 'https://static.nhtsa.gov/odi/tsbs/2014/MC-10252847-9999.pdf',
          },
        ],
        years: [2014],
        category: 'electrical',
        title:
          'Service High Voltage Charging System With P0DAA Needs Isolation Diagnosis',
        description:
          'GM PIC5920B documents a 2014 ELR no-charge path with DTC P0DAA involving high-voltage isolation and possible heater, contactor, coolant-fill or internal isolation conditions. It does not support presuming a failed coolant-level sensor or simply topping off coolant and clearing the code.',
        solution:
          'Do not touch orange high-voltage components. Have an EV-qualified Cadillac technician preserve DTC and freeze-frame data and follow the GM isolation and coolant-system diagnostic path, including TAC involvement where directed. Incorrect high-voltage work can cause serious injury or death.',
        severity: 'high',
        symptoms: [
          'Service High Voltage Charging System message',
          'Vehicle will not charge',
        ],
        systems: [
          'high-voltage isolation monitoring',
          'battery coolant system',
          'high-voltage contactors and heater',
        ],
        dtcCodes: ['P0DAA'],
      }),
    'cadillac-elr-shift-to-park-false-warning-from-failing-electronic-shifter':
      archived({
        oldTitle:
          '"Shift to Park" False Warning from Failing Electronic Shifter Park Switch',
        idSuffix: 'Shift-to-Park Aggregation',
        years: [2014, 2016],
        category: 'electrical',
        claims: 0,
        urls: 0,
        reason:
          'The current primary-source sweep did not establish the asserted ELR electronic-shifter switch failure, workaround, battery-drain path or universal assembly remedy. Bulletins for other GM models cannot be borrowed for the ELR.',
      }),
    'cadillac-elr-sudden-total-loss-electrical-power-while-driving': archived({
      oldTitle:
        'Sudden Total Loss of Electrical Power While Driving (Often With No Stored Codes)',
      idSuffix: 'Total-Electrical-Power-Loss Aggregation',
      years: [2014, 2016],
      category: 'electrical',
      claims: 3,
      urls: 9,
      reason:
        'The current primary-source sweep did not substantiate the asserted simultaneous loss of steering, brake assist, lamps, locks and gauges or the speculative 12-volt, ground and contactor remedies. The distinct low-cell propulsion program remains separately published.',
    }),
  },
  expectedTelemetry: {
    claimCount: 27,
    urlCount: 51,
    claimClickCount: 9,
    recordClickCount: 9,
    priorityClickCount: 9,
  },
  expectedDispositionCounts: {
    'recall-dealer': 2,
    'diagnosis-hold': 6,
    'no-commerce': 3,
    remove: 3,
  },
  expectedPublished: 11,
  expectedArchived: 3,
  controlledDeltaProposals: [],
  expectedProposalIdentities: [],
};

config.assertReviewedAfterState = function assertReviewedAfterState(issues) {
  const expectedYears = {
    'cadillac-elr-charging-system-2014': [2014, 2015],
    'cadillac-elr-12v-battery-2014': [2014, 2015],
    'cadillac-elr-battery-degradation-2014': [2015],
    'cadillac-elr-cue-infotainment-touchscreen-delamination-unresponsive-touch': [
      2014, 2015, 2016,
    ],
    'cadillac-elr-electronic-stability-control-diagnostic-software-defect-no-w': [
      2014,
    ],
    'cadillac-elr-engine-forced-to-run-by-fuel-engine-maintenance-mode-after-s': [
      2014, 2016,
    ],
    'cadillac-elr-front-seat-hook-bracket-weld-defect-seat-may-not-stay-secure': [
      2014,
    ],
    'cadillac-elr-gas-engine-engages-prematurely-before-ev-range-is-used-up': [
      2014, 2016,
    ],
    'cadillac-elr-loss-propulsion-propulsion-power-reduced-from-low-hv-battery': [
      2014, 2015, 2016,
    ],
    'cadillac-elr-regen-brake-pad-2014': [2014],
    'cadillac-elr-service-high-voltage-charging-system-message-from-low-batter': [
      2014,
    ],
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
    throw new Error('Cadillac ELR reviewed scopes or statuses drifted.');
  }
};

module.exports = config;
