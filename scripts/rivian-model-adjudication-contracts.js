const SNAPSHOT_FILE = 'data/_rivian-deeplink-snapshot-2026-08-11.json';
const REVIEW_DATE = '2026-08-11';

const contracts = {
  EDV: {
    make: 'Rivian',
    model: 'EDV',
    reviewDate: REVIEW_DATE,
    snapshotFile: SNAPSHOT_FILE,
    outputFile: 'data/known-issue-rivian-edv-adjudication-2026-08-11.json',
    allIds: [
      'rivian-edv-driver-seat-belt-pretensioner-cable-damage-from-driver-sitti',
      'rivian-edv-front-upper-control-arm-steering-knuckle-fastener-under-torq',
      'rivian-edv-thermal-events-vehicle-fires-while-parked-depot-chargers-ext',
    ],
    retainedIds: [
      'rivian-edv-driver-seat-belt-pretensioner-cable-damage-from-driver-sitti',
      'rivian-edv-front-upper-control-arm-steering-knuckle-fastener-under-torq',
    ],
    reportCountCleanupIds: [],
    observations: [
      'The frozen EDV inventory contains two exact federal recall identities and one reported-event aggregation.',
      'Recall population totals describe the entire campaign population, not owner-report counts or failure rates.',
      'The July 2024 Houston thermal event has a Rivian statement reported by the press, but no captured primary investigation establishes a recurring EDV defect, EVSE cause, 12 V cause or extreme-heat mechanism.',
    ],
    pdfSources: {
      seatbeltReport: {
        url: 'https://static.nhtsa.gov/odi/rcl/2025/RCLRPT-25V816-8746.pdf',
        type: 'nhtsa',
        title: 'NHTSA Part 573 Safety Recall Report 25V-816',
        contains: ['2022-2025 RIVIAN EDV', '34,824', 'FSAM-1770'],
      },
      seatbeltInvestigation: {
        url: 'https://static.nhtsa.gov/odi/inv/2025/INCLA-PE25011-38365.pdf',
        type: 'nhtsa',
        title: 'NHTSA ODI Closing Resume PE25011',
        contains: ['Rivian EDV Seat Belt Anchor Detachment', 'Recall 25V-816'],
      },
      controlArmReport: {
        url: 'https://static.nhtsa.gov/odi/rcl/2022/RCLRPT-22V744-5291.PDF',
        type: 'nhtsa',
        title: 'NHTSA Part 573 Safety Recall Report 22V-744',
        contains: ['2022-2022 Rivian EDV', 'FSAM 997', '12,212'],
      },
      controlArmOwnerLetter: {
        url: 'https://static.nhtsa.gov/odi/rcl/2022/RCONL-22V744-8813.pdf',
        type: 'nhtsa',
        title: 'Rivian Owner Notice for Recall 22V-744',
        contains: ['2022 Rivian EDV, R1T, & R1S', 'Insufficiently Torqued'],
      },
      emergencyGuide: {
        url: 'https://assets.rivian.com/2md5qhoeajym/5IJ9NmL3Ct2AwgXHsM4Ds9/56ce157d07c94da059c9adc7e684d6d8/emergency-response-guide-edv-en-us-20220929.pdf',
        type: 'manufacturer',
        title: 'Rivian Electric Delivery Vehicle Emergency Response Guide',
        contains: ['Electric Delivery Vehicle', 'Fire', 'high-voltage'],
      },
    },
    otherSources: {
      houstonReport: {
        url: 'https://qz.com/gateway/amazon-rivian-vans-on-fire-1851573007',
        type: 'article',
        title: 'Reported Rivian statement on the July 2024 Houston EDV thermal event',
        contains: ['HV battery was not the initiator', 'too soon to say'],
      },
    },
    bulletinInventory: {
      method: 'Exact NHTSA recall and investigation records were opened for the two recalled identities; no manufacturer bulletin was used to turn the thermal-event report into a recurring defect.',
      exactDocuments: 4,
    },
    recallInventory: {
      method: 'Exact campaign-number reconciliation against the frozen title and model-year scope.',
      exactCampaigns: 2,
    },
    modelAliases: ['EDV', 'Electric Delivery Van'],
    searchTerms: ['25V-816', 'PE25011', '22V-744', 'FSAM-1770', 'FSAM-997', 'EDV thermal event'],
    relevantDocumentIds: ['25V-816', 'PE25011', '22V-744'],
    campaigns: ['25V-816', '22V-744'],
    requiredProse: [
      {
        id: 'rivian-edv-thermal-events-vehicle-fires-while-parked-depot-chargers-ext',
        field: 'description',
        patterns: ['does not establish a recurring EDV defect', 'does not establish extreme heat as the cause'],
      },
    ],
    content: {
      'rivian-edv-driver-seat-belt-pretensioner-cable-damage-from-driver-sitti': {
        description: 'NHTSA recall 25V-816 covers certain 2022-2025 Rivian EDVs built from December 10, 2021 through November 8, 2025. Rivian reported that repeated misuse, such as sitting on a seat belt already buckled beneath the driver, can damage the driver-side pretensioner cable. A damaged cable may not restrain the occupant as intended in a crash. The 34,824 figure is the potentially involved recall population, not an owner-report total or measured failure rate.',
        solution: 'Check the VIN for recall 25V-816 / Rivian FSAM-1770. Rivian released an over-the-air misuse-detection update and will inspect and replace the driver seat-belt pretensioner assembly as necessary, free of charge. A damaged pretensioner may be visible in some cases; do not test restraint performance yourself. Wear the belt across the body and contact Rivian if the VIN is open or damage is suspected. Do not buy a seat-belt assembly from this page; recall eligibility and the exact assembly must be confirmed by VIN and Rivian inspection.',
        symptoms: ['Visible damage to the driver seat-belt pretensioner cable in some cases', 'Seat-belt misuse-detection chime after the applicable OTA update'],
        affectedSystems: ['Driver seat-belt pretensioner assembly', 'Seat-belt misuse-detection software'],
        citations: ['seatbeltReport', 'seatbeltInvestigation'],
        evidence: ['25V-816 identifies 2022-2025 EDV, 34,824 potentially involved units, the repeated-misuse condition and the OTA plus inspection/replacement remedy.', 'PE25011 confirms NHTSA opened the investigation on September 22, 2025 and closed it after the recall addressed the subject population.'],
        summary: 'Bound recall scope, mechanism and remedy to NHTSA records; separated campaign population from owner reports and added a VIN/inspection commerce boundary.',
        conflict: null,
        commerceDecision: 'recall remedy and exact seat-belt assembly require VIN confirmation and Rivian inspection; no universal retail part',
      },
      'rivian-edv-front-upper-control-arm-steering-knuckle-fastener-under-torq': {
        description: 'NHTSA recall 22V-744 includes a subset of model-year 2022 EDVs produced from December 10, 2021 through September 27, 2022 whose records could not confirm proper torque of the fastener joining each front upper control arm to the steering knuckle. A loose fastener can produce excessive front-suspension noise, vibration or harshness, a change in steering feel or excessive wheel camber; in rare cases separation can reduce vehicle control. The 12,212 campaign total includes R1T, R1S and EDV vehicles and is not an EDV failure count.',
        solution: 'Check the VIN for recall 22V-744 / Rivian FSAM-997. Rivian will inspect both sides and secure the steering-knuckle fasteners as necessary at no charge; components are replaced only if inspection finds damage. If steering feel changes, wheel camber appears abnormal or severe front-suspension noise develops, stop in a safe place and contact Rivian rather than continuing to diagnose on the road. Do not buy a control arm, knuckle or fastener from this page; the recall remedy is inspection-first and any replacement is VIN- and damage-dependent.',
        symptoms: ['Excessive noise, vibration or harshness from the front suspension', 'Change in steering performance or feel', 'Abnormal front-wheel camber'],
        affectedSystems: ['Front upper control arm-to-steering-knuckle joint', 'Front suspension and steering'],
        citations: ['controlArmReport', 'controlArmOwnerLetter'],
        evidence: ['22V-744 identifies model-year 2022 EDV and the exact December 2021-September 2022 EDV production window.', 'The Rivian owner notice states the inspection-first, no-cost remedy and the control-risk warning.'],
        summary: 'Preserved the exact recall identity while separating the combined campaign population from EDV incidence and making the remedy inspection-first.',
        conflict: null,
        commerceDecision: 'recall remedy is inspection-first and any control-arm, knuckle or fastener replacement depends on VIN and observed damage; no universal retail part',
      },
      'rivian-edv-thermal-events-vehicle-fires-while-parked-depot-chargers-ext': {
        description: 'Reporting documents a July 2024 thermal event involving three Rivian EDVs parked beside depot chargers in Houston. Rivian stated that the source vehicle was plugged in but not charging, the high-voltage battery was not the initiator, the event propagated to nearby vehicles and the cause was still under investigation. That report does not establish a recurring EDV defect, does not establish extreme heat as the cause, and does not prove an EVSE or 12-volt-system mechanism. The frozen multi-year title therefore remains an indexed identity hold rather than a validated defect pattern.',
        solution: 'Treat smoke, unusual heat, arcing or fire as an emergency: move people away, call emergency services and follow site emergency procedures. Disconnect a charger only if trained personnel can do so safely; do not touch high-voltage components or attempt vehicle-side diagnosis. Fleet operators should preserve charger and vehicle logs and have Rivian plus qualified EVSE personnel investigate the specific event before attributing a cause. Do not buy a charger, 12-volt component or battery part from this page; no failed component or recurring mechanism has been established.',
        symptoms: ['Smoke, unusual heat, arcing or flame near a parked vehicle or charging stall', 'Thermal event spreading to adjacent vehicles'],
        affectedSystems: ['Vehicle and depot charging environment, cause unresolved', 'High-voltage emergency-response boundaries'],
        citations: ['houstonReport', 'emergencyGuide'],
        evidence: ['The contemporaneous report reproduces Rivian\'s statement that cause was undetermined and the high-voltage battery was not the initiator.', 'Rivian\'s EDV emergency guide supplies emergency-response boundaries but does not prove the incident cause or a recurring defect.'],
        summary: 'Converted causal and recurrence claims into a bounded incident report, preserved the indexed page as a hold and added emergency-response limits.',
        conflict: 'The frozen title asserts multiple thermal events and an extreme-heat context across 2022-2025, while captured evidence directly supports only a reported July 2024 event and no established cause or recurring defect.',
        commerceDecision: 'event cause, failed system and recurring identity remain unresolved; no universal retail part',
      },
    },
  },
  R1S: {
    make: 'Rivian',
    model: 'R1S',
    reviewDate: REVIEW_DATE,
    snapshotFile: SNAPSHOT_FILE,
    outputFile: 'data/known-issue-rivian-r1s-adjudication-2026-08-11.json',
    allIds: ['rivian-r1s-third-row-creaks'],
    retainedIds: [],
    reportCountCleanupIds: [],
    observations: [
      'The frozen page has no citations and combines an interior noise complaint with a seat-operation complaint.',
      'Rivian owner guides describe manual latches for the third-row seatbacks and quick-fold buttons for the second row; the frozen claim of a powered third-row folding mechanism is not supported.',
      'No exact Rivian or NHTSA service communication captured in this review supports a common third-row creak, a universal bushing/damper repair, warranty coverage or the frozen cost range.',
    ],
    pdfSources: {
      guide2022: {
        url: 'https://assets.rivian.com/2md5qhoeajym/7Ao7NIFkLxOZtvdc7Fqh70/c7da41962ebd4d50c96d47ccdbbd85de/r1s-owners-guide-en-us-20220523.pdf',
        type: 'manufacturer',
        title: 'Rivian R1S Owner\'s Guide, May 2022',
        contains: ['Fold the third row seats with the manual latch'],
      },
      guide2024: {
        url: 'https://assets.rivian.com/2md5qhoeajym/7Ao7NIFkLxOZtvdc7Fqh70/17fb79d029ad826ae08db938421f7a6b/r1s-og-en-us-20240205.pdf',
        type: 'manufacturer',
        title: 'Rivian R1S Owner\'s Guide, February 2024',
        contains: ['Pull the manual latches down to fold the third-row seats', 'quick-fold the second-row seats'],
      },
    },
    otherSources: {},
    bulletinInventory: {
      method: 'Exact NHTSA/Rivian searches for R1S third-row creak, squeak, folding and seat mechanism communications; unrelated suspension, A/C and audio noise documents were rejected.',
      exactDocuments: 0,
    },
    recallInventory: {
      method: 'No recall was used to substantiate the frozen third-row noise/mechanism identity.',
      exactCampaigns: 0,
    },
    modelAliases: ['R1S'],
    searchTerms: ['third row creak', 'third row squeak', 'third row folding', 'seat mechanism'],
    relevantDocumentIds: [],
    campaigns: [],
    requiredProse: [
      {
        id: 'rivian-r1s-third-row-creaks',
        field: 'description',
        patterns: ['third-row seatbacks use manual latches', 'quick-fold buttons operate the second-row seats'],
      },
    ],
    content: {
      'rivian-r1s-third-row-creaks': {
        description: 'This frozen page combines at least two different identities: a creak or squeak over bumps and a seatback that does not fold, raise or latch correctly. Rivian\'s 2022 and 2024 R1S owner guides say the third-row seatbacks use manual latches; the cargo-area quick-fold buttons operate the second-row seats. The guides therefore do not support the frozen claim of a powered third-row mechanism. No exact Rivian/NHTSA bulletin captured in this review establishes that third-row creaks are common, identifies universal plastic-contact points or prescribes bushings or dampers across 2022-2024 vehicles.',
        solution: 'First identify the symptom and location. Remove loose cargo and accessory mats, make sure no item or occupant obstructs the seat, and operate the seat only as the owner guide directs. If a third-row seatback will not latch securely, a manual latch binds or a structural creak remains after loose items are excluded, stop forcing the seat and document the condition for Rivian service. Do not apply tape or lubricant to a seat latch and do not buy a latch, trim panel, bushing or folding component from this page; the failed component and fitment are not established.',
        symptoms: ['Creak or squeak localized near the third-row seat area', 'Third-row seatback does not fold, raise or latch using its manual latch', 'Second-row quick-fold operation mistaken for a third-row mechanism fault'],
        affectedSystems: ['Third-row manual seatback latches and trim, exact source unresolved', 'Second-row quick-fold controls, separate identity'],
        citations: ['guide2022', 'guide2024'],
        evidence: ['The May 2022 guide describes the third-row seat as manual-latch operated.', 'The February 2024 guide again separates manual third-row latches from second-row quick-fold buttons.'],
        summary: 'Removed unsupported frequency, powered-third-row, bulletin, warranty, cost and universal-repair claims; separated noise from functional latch diagnosis.',
        conflict: 'The frozen title and body combine creaks with folding faults, while the body misidentifies the manual third-row seats as powered and cites no exact service communication.',
        commerceDecision: 'noise location, manual latch state, obstruction and exact failed component require vehicle inspection; no universal retail part',
      },
    },
  },
};

const supportedModels = Object.freeze(Object.keys(contracts));
function getContract(model) {
  const contract = contracts[model];
  if (!contract) throw new Error(`Unsupported Rivian model: ${model}`);
  return contract;
}

module.exports = { getContract, supportedModels };
