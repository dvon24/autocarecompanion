const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

function replacement(card, decision) {
  return {
    disposition: 'replace',
    decision,
    evidence: card.sources.map((item) => ({ type: item.type, label: item.title, url: item.url })),
    after: {
      years: card.years,
      trims: card.trims,
      engines: card.engines || [],
      category: card.category,
      title: card.title,
      description: card.description,
      solution: card.solution,
      severity: card.severity,
      confidence: 'high',
      symptoms: card.symptoms,
      affectedSystems: card.affectedSystems,
      dtcCodes: card.dtcCodes || [],
      estimatedCostLow: null,
      estimatedCostHigh: null,
      typicalMileageLow: null,
      typicalMileageHigh: null,
      citations: card.sources,
      source: card.source || 'manual',
      summary: card.summary,
    },
  };
}

const doorLatchRecall = {
  years: [2013, 2014, 2015],
  trims: ['Vehicles included in Ford recall 16S30 / NHTSA 16V643'],
  engines: [],
  category: 'body',
  title: 'Door-Latch Component Can Break and Let a Door Open While Driving (Recall)',
  description:
    'NHTSA campaign 16V643, Ford recall 16S30, covers certain 2013-2015 C-Max vehicles. A component inside a door latch can break, preventing the door from latching or making an occupant believe the door is secure when it is not. An unsecured door can open while the vehicle is moving.',
  solution:
    'Check the VIN with Ford or NHTSA. Dealers replace the affected door latches with improved parts free of charge. Some vehicles repaired under this and related campaigns were recalled again under NHTSA 20V331/Ford 20S30 because the earlier repair may not have been completed correctly, so verify both campaign histories by VIN.',
  severity: 'high',
  symptoms: ['Door will not latch securely', 'Door appears closed but is not securely latched', 'Door can open while the vehicle is moving'],
  affectedSystems: ['side-door latches'],
  dtcCodes: [],
  sources: [
    { type: 'nhtsa', title: 'NHTSA Recall API - Ford C-Max (Campaigns 16V643000 and 20V331000)', url: 'https://api.nhtsa.gov/recalls/recallsByVehicle?make=Ford&model=C-Max&modelYear=2013' },
  ],
  source: 'manual',
  summary:
    'Corrected the campaign from the frozen 15S25 label to Ford 16S30/NHTSA 16V643, replaced the secondary article, and added the VIN-dependent 20S30 reinspection campaign without inventing latch symptoms.',
};

const highVoltageInterlock = {
  years: [2013, 2014, 2015, 2016],
  trims: ['C-Max Energi plug-in hybrid vehicles'],
  engines: ['Plug-in hybrid electric powertrain'],
  category: 'electrical',
  title: 'Chafed High-Voltage Interlock Wiring Can Cause Stall or No-Crank With Stop Safely Now',
  description:
    'Ford service information covers some 2013-2016 C-Max plug-in hybrid vehicles that intermittently stall or will not crank while displaying Stop Safely Now. The bulletin identifies high-voltage interlock circuits CYB03 or CYB04 shorting to ground where harness 10B689 can chafe between the traction-battery cover plate and traction battery.',
  solution:
    'Have a Ford dealer or hybrid-qualified technician check for BECM codes U3012 or P0B37 and SOBDMC code P0A0A and inspect the specified low-voltage interlock circuits. Ford directs technicians to cover a chafed circuit with heat-shrink tubing and anti-abrasion tape and secure the harness against repeat contact. This bulletin does not diagnose hybrid-battery capacity degradation.',
  severity: 'high',
  symptoms: ['Intermittent stall', 'Intermittent no-crank condition', 'Stop Safely Now warning'],
  affectedSystems: ['traction-battery harness 10B689', 'high-voltage interlock circuits CYB03 and CYB04'],
  dtcCodes: ['U3012', 'P0B37', 'P0A0A'],
  sources: [{ type: 'tsb', title: 'Ford TSB - C-Max Energi Stop Safely Now and High-Voltage Interlock Harness Chafe', url: 'https://static.nhtsa.gov/odi/tsbs/2016/SB-10093862-2532.pdf' }],
  source: 'manual',
  summary:
    'Replaced the unsupported six-year battery-degradation aggregation with Ford\'s exact 2013-2016 C-Max Energi interlock-harness chafe condition, DTCs, and wiring repair.',
};

const hf35Noise = {
  years: [2013, 2014, 2015, 2016, 2017, 2018],
  trims: ['Vehicles equipped with the HF35 hybrid transmission'],
  engines: ['Hybrid powertrain'],
  category: 'transmission',
  title: 'HF35 Transmission Can Make Thumping, Rubbing, or Grinding Noise While Moving',
  description:
    'Ford service information covers some 2013-2018 C-Max vehicles equipped with the HF35 hybrid transmission that make a thumping, rubbing, or grinding noise. The noise may occur in any gear range, including neutral, while the vehicle is moving, but is not present while stationary or in Park.',
  solution:
    'Have a Ford dealer or hybrid-transmission specialist reproduce the noise under the bulletin conditions and follow Ford Workshop Manual diagnostics. Ford later published that HF35 transmissions can be disassembled and cleaned or repaired after differential or transfer-shaft bearing failure. The service information does not support calling the condition an eCVT shudder or attributing EV-to-engine transitions, warning lights, and every acceleration vibration to it.',
  severity: 'medium',
  symptoms: ['Thumping noise from the transmission while moving', 'Rubbing noise from the transmission while moving', 'Grinding noise in any gear range, including neutral, while moving', 'Noise absent while stationary or in Park'],
  affectedSystems: ['HF35 hybrid transmission', 'differential or transfer-shaft bearings when confirmed'],
  dtcCodes: [],
  sources: [{ type: 'tsb', title: 'Ford TSB - C-Max HF35 Transmission Thumping, Rubbing, or Grinding Noise', url: 'https://static.nhtsa.gov/odi/tsbs/2022/MC-10225458-0001.pdf' }],
  source: 'manual',
  summary:
    'Replaced an uncited generic eCVT-shudder card with Ford\'s exact HF35 moving-only noise pattern, affected years, diagnostic boundary, and current repairability guidance.',
};

const published = {
  'ford-cmax-door-latch-2013': replacement(doorLatchRecall, 'Retain the door-latch safety issue but correct it to Ford 16S30/NHTSA 16V643 and the later VIN-dependent 20S30 reinspection campaign.'),
  'ford-cmax-hybrid-battery-2013': replacement(highVoltageInterlock, 'Replace the broad battery-degradation card with the exact Ford C-Max Energi Stop Safely Now harness-chafe bulletin supported by its existing primary citation.'),
  'ford-cmax-transmission-shudder-2013': replacement(hf35Noise, 'Replace the uncited shudder narrative with Ford\'s exact HF35 thumping, rubbing, or grinding condition while the vehicle is moving.'),
};

const reasons = {
  'ford-cmax-brake-vacuum-pump-2013':
    'The frozen card uses one Reddit thread to apply electric vacuum-pump failure, hard-pedal behavior, warning lights, and poor braking to every 2013-2018 C-Max. The NHTSA campaigns and Ford communications reviewed do not define that six-year defect population or remedy.',
};

module.exports = buildConfig({
  label: 'Ford C-Max',
  make: 'Ford',
  model: 'C-Max',
  slug: 'ford-c-max',
  batchId: 'ford-c-max-full-record-cohort-101-2026-08-04',
  auditDate: '2026-08-04',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: 'ebf29f82cf5e49fd4f1900d98d6964ff03430cd75984b830eb90de29c7be9641',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/ford-c-max/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'fordcmax_blind:manual-primary-source-gate',
    edge: 'fordcmax_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [],
});
