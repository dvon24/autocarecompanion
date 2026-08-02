const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

function complaint(odi, label) {
  return {
    type: 'nhtsa',
    label,
    url: `https://api.nhtsa.gov/complaints/odinumber?odinumber=${odi}`,
  };
}

const controlArmCorrosionEvidence = [
  complaint('10376488', 'NHTSA Complaint ODI 10376488 - frame rust and control-arm separation'),
  complaint('10313790', 'NHTSA Complaint ODI 10313790 - excessive frame corrosion'),
  complaint('10306235', 'NHTSA Complaint ODI 10306235 - body separated from frame'),
  complaint('10263599', 'NHTSA Complaint ODI 10263599 - unibody control-arm support detached'),
];

const rockerCorrosionEvidence = [
  complaint('10491875', 'NHTSA Complaint ODI 10491875 - corrosion below rear doors'),
  complaint('10328473', 'NHTSA Complaint ODI 10328473 - rocker-panel corrosion'),
];

const published = {
  'chevrolet-metro-cv-joint': {
    disposition: 'replace',
    decision: 'Replace the unsupported universal CV-joint card with a narrowly scoped summary of two exact NHTSA owner complaints describing rocker or rear-door-sill corrosion on 2000 Chevrolet Metro vehicles. ShowMeTheParts returned many axle variants by transmission, ABS equipment and axle side but no evidence of a model-specific CV-joint defect, so both axle commerce searches are removed.',
    evidence: rockerCorrosionEvidence,
    after: {
      years: [2000],
      trims: [],
      engines: [],
      category: 'body',
      title: 'Rocker and Rear Door-Sill Corrosion (Owner Reports)',
      description: 'Two NHTSA owner complaints for 2000 Chevrolet Metro vehicles describe corrosion in the rocker-panel or rear-door-sill area. One report identifies rust under the front doors at approximately 72,000 miles; another describes corrosion below both rear doors and a technician recommendation involving the rear sway-bar area. These are individual owner reports, and NHTSA does not list a Chevrolet Metro recall for this condition.',
      solution: 'Have a structural or collision-repair technician inspect both rocker panels, door sills, adjacent floor seams and nearby rear-suspension attachment structure. Surface treatment may slow early cosmetic corrosion, but it does not restore perforated or weakened load-bearing metal. Do not lift the vehicle from a corroded jacking point, and obtain a structural repair assessment before continued use if metal is perforated, distorted or separating.',
      severity: 'medium',
      confidence: 'low',
      symptoms: [
        'Rust bubbling, scaling or perforation below the front or rear doors',
        'Weak or deformed rocker-panel jacking points',
        'Corrosion spreading into floor seams or nearby suspension attachment structure',
      ],
      affectedSystems: [
        'rocker panels, door sills and adjacent floor seams',
        'nearby rear-suspension attachment structure',
      ],
      dtcCodes: [],
      estimatedCostLow: null,
      estimatedCostHigh: null,
      typicalMileageLow: null,
      typicalMileageHigh: null,
      citations: rockerCorrosionEvidence.map(({ label, url }) => ({
        type: 'nhtsa',
        title: label,
        url,
      })),
      source: 'manual',
      summary: 'Replaced the unsupported CV-joint card with two exact 2000 Metro rocker and door-sill corrosion complaints, added cautious inspection guidance, and removed two unverified axle commerce links.',
    },
  },
  'chevrolet-metro-rust': {
    disposition: 'replace',
    decision: 'Replace the universal 1995-2001 rust assertion and coating recommendations with a narrowly scoped summary of four exact NHTSA owner complaints describing corrosion and separation around front lower-control-arm support structure on 1998 Chevrolet Metro vehicles. The complaint record supports an urgent structural inspection warning, not a universal coating repair or commerce recommendation.',
    evidence: controlArmCorrosionEvidence,
    after: {
      years: [1998],
      trims: [],
      engines: [],
      category: 'body',
      title: 'Front Lower-Control-Arm Support Corrosion and Separation (Owner Reports)',
      description: 'Four NHTSA owner complaints for 1998 Chevrolet Metro vehicles describe serious corrosion or separation in frame or unibody structure supporting a front lower control arm. Reports include a detached control-arm support, body-to-frame separation and major directional change during braking. These are individual owner reports, and NHTSA does not list a Chevrolet Metro recall for this condition.',
      solution: 'Before purchase or continued operation, have a structural or collision-repair technician inspect both front lower-control-arm mounting areas and the surrounding unibody rails. Do not rely on rust converter, undercoating or a non-structural patch to repair perforated or separating load-bearing metal. Stop driving and tow the vehicle if a mount is cracked, detached or substantially weakened; a qualified technician must decide whether a code-compliant structural repair is possible.',
      severity: 'high',
      confidence: 'medium',
      symptoms: [
        'Cracking or separation around a front lower-control-arm mounting area',
        'Vehicle pulls or changes direction during braking as structure moves',
        'Visible perforation, scaling or severe corrosion around the front unibody rails',
      ],
      affectedSystems: [
        'front lower-control-arm unibody mounting areas',
        'surrounding front unibody rails and load-bearing structure',
      ],
      dtcCodes: [],
      estimatedCostLow: null,
      estimatedCostHigh: null,
      typicalMileageLow: null,
      typicalMileageHigh: null,
      citations: controlArmCorrosionEvidence.map(({ label, url }) => ({
        type: 'nhtsa',
        title: label,
        url,
      })),
      source: 'manual',
      summary: 'Narrowed the unsupported 1995-2001 rust card to four exact 1998 Metro complaints about front control-arm support corrosion, added structural stop-driving guidance, and removed two unverified coating commerce links.',
    },
  },
};

const reasons = {
  'chevrolet-metro-head-gasket': 'The ShowMeTheParts catalog confirms distinct 1998 Metro head-gasket applications for the 1.0L and 1.3L engines and a 2001 1.3L application, but it does not establish a model-wide head-gasket defect. Current NHTSA recall and manufacturer-communication research did not substantiate the frozen 1995-2001 scope or the claimed repair, and the prior YouTube playlist plus thermostat and coolant searches are not primary repair evidence.',
};

module.exports = buildConfig({
  label: 'Chevrolet Metro',
  make: 'Chevrolet',
  model: 'Metro',
  slug: 'chevrolet-metro',
  batchId: 'chevrolet-metro-full-record-cohort-26-2026-08-02',
  auditDate: '2026-08-02',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '7f1a7b7b553535ea48ab65025e43c8ec2e2ed87cc90aeaae7c65cce4c7cf9386',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/chevrolet-metro/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'chevroletmetro_blind:self-no-blocker',
    edge: 'chevroletmetro_edge:self-no-blocker',
  },
  published,
  reasons,
  proposalCampaigns: [],
});
