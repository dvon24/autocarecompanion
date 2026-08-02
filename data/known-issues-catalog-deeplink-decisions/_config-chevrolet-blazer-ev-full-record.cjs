const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

const sources = {
  doorStrikers: {
    type: 'recall',
    title: 'NHTSA Recall 23V869 - Door Strikers',
    url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=23V869000',
  },
  controlArm: {
    type: 'recall',
    title: 'NHTSA Recall 24V487 - Right Front Lower Control Arm',
    url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=24V487000',
  },
  parkingBrake: {
    type: 'recall',
    title: 'NHTSA Recall 26V031 - Incorrect Prior Parking-Brake Harness Repair',
    url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=26V031000',
  },
  rearDrive: {
    type: 'recall',
    title: 'NHTSA Recall 24V320 - Rear Drive Unit Wire Insulation',
    url: 'https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=24V320000',
  },
};

function replace(source, decision, after) {
  return {
    disposition: 'replace',
    decision,
    evidence: [{ type: source.type, label: source.title, url: source.url }],
    after: {
      ...after,
      citations: [{ type: source.type, title: source.title, url: source.url }],
    },
  };
}

module.exports = buildConfig({
  label: 'Chevrolet Blazer EV',
  make: 'Chevrolet',
  model: 'Blazer EV',
  slug: 'chevrolet-blazer-ev',
  batchId: 'chevrolet-blazer-ev-full-record-cohort-5-2026-08-02',
  auditDate: '2026-08-02',
  snapshotHash:
    '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash:
    '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash:
    'dbcc88fcbc7489267d39aca4a47d898bfe942e3bce2c3b49f40b8f46ed89d6a4',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/chevrolet-blazer-ev/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'chevroletblazerev_blind:self-no-blocker',
    edge: 'chevroletblazerev_edge:self-no-blocker',
  },
  published: {
    'chevy-blazer-ev-door-striker-fracture-2024': replace(
      sources.doorStrikers,
      'Retain the genuine 2024 door-striker condition, add the direct NHTSA campaign and exact dealer remedy, and remove two unrelated search-link parts.',
      {
        years: [2024],
        trims: [],
        engines: [],
        category: 'body',
        title: 'Door Strikers Can Fracture and Let a Door Open (Recall 23V869)',
        description:
          'NHTSA Recall 23V869 covers certain 2024 Chevrolet Blazer EV vehicles. A door striker can fracture and allow a door to open unexpectedly while the vehicle is moving, increasing the risk of injury or a crash.',
        solution:
          'Check the VIN for recall completion. A Chevrolet dealer replaces all four door strikers and their attaching bolts under the no-charge campaign.',
        severity: 'high',
        confidence: 'high',
        symptoms: ['Cracked or broken door striker', 'Door opens unexpectedly while driving'],
        affectedSystems: ['four side-door strikers and attaching bolts'],
        dtcCodes: [],
        summary:
          'Added the direct 2024 door-striker recall and exact four-striker remedy, removing two unrelated search links.',
      },
    ),
    'chevy-blazer-ev-infotainment-software-2024': replace(
      sources.controlArm,
      'Replace the single-forum infotainment aggregation and two unrelated diagnostic/sensor search links with the exact 2024 lower-control-arm fracture recall.',
      {
        years: [2024],
        trims: [],
        engines: [],
        category: 'suspension',
        title: 'Right Front Lower Control Arm Can Fracture (Recall 24V487)',
        description:
          'NHTSA Recall 24V487 covers certain 2024 Chevrolet Blazer EV vehicles. A manufacturing defect in the right-front lower control arm can cause it to fracture, resulting in loss of vehicle control and increased crash risk.',
        solution:
          'Check the VIN for recall completion. A Chevrolet dealer inspects the right-front lower control arm and replaces it as necessary.',
        severity: 'high',
        confidence: 'high',
        symptoms: ['No reliable warning before fracture', 'Manufacturing defect found in the right-front lower control arm', 'Loss of vehicle control if the arm fractures'],
        affectedSystems: ['right-front lower control arm and front suspension'],
        dtcCodes: [],
        summary:
          'Replaced an unsupported infotainment card with the exact 2024 lower-control-arm recall and removed two unrelated search links.',
      },
    ),
    'chevy-blazer-ev-parking-brake-wiring-2024': replace(
      sources.parkingBrake,
      'Update the genuine parking-brake harness condition to the current 2026 recall for vehicles repaired incorrectly under 25V433, use the full chassis-harness remedy and remove two unrelated brake-part search links.',
      {
        years: [2024, 2025],
        trims: [],
        engines: [],
        category: 'brakes',
        title: 'Prior Parking-Brake Harness Recall Repair May Be Incorrect (Recall 26V031)',
        description:
          'NHTSA Recall 26V031 covers certain 2024-2025 Chevrolet Blazer EV vehicles that may have been repaired incorrectly under Recall 25V433. The rear parking-brake wiring harness can still be damaged or corroded, causing unintended brake activation while driving or loss of parking-brake function and rollaway while parked.',
        solution:
          'Check the VIN even if the earlier parking-brake recall was completed. A Chevrolet dealer replaces the chassis harness under the current no-charge campaign.',
        severity: 'high',
        confidence: 'high',
        symptoms: ['Parking brake activates unintentionally while driving', 'Parking brake does not hold while parked', 'Vehicle rollaway', 'Damaged or corroded rear parking-brake harness'],
        affectedSystems: ['chassis harness and rear parking-brake wiring'],
        dtcCodes: [],
        summary:
          'Updated the card to the January 2026 re-recall and full chassis-harness remedy, removing two unrelated brake-part search links.',
      },
    ),
    'chevy-blazer-ev-rear-drive-motor-2024': replace(
      sources.rearDrive,
      'Retain the genuine rear-drive-unit condition, replace the secondary recall page with the direct NHTSA campaign and exact remedy, and remove two inapplicable fluid/gasket search links.',
      {
        years: [2024],
        trims: [],
        engines: [],
        category: 'drivetrain',
        title: 'Rear Drive Unit Wire Insulation Can Fail (Recall 24V320)',
        description:
          'NHTSA Recall 24V320 covers certain 2024 Chevrolet Blazer EV vehicles. Insufficient insulation can let wires in a rear drive-unit motor contact each other, causing a loss of drive power and increasing crash risk.',
        solution:
          'Check the VIN for recall completion. A Chevrolet dealer replaces the rear drive unit under the no-charge campaign.',
        severity: 'high',
        confidence: 'high',
        symptoms: ['Loss of drive power', 'Rear drive-unit motor wire insulation failure'],
        affectedSystems: ['rear drive unit, electric motor and internal wiring'],
        dtcCodes: [],
        summary:
          'Replaced a secondary recall citation with the direct 2024 NHTSA campaign and removed two inapplicable fluid/gasket search links.',
      },
    ),
  },
  proposalCampaigns: [],
});
