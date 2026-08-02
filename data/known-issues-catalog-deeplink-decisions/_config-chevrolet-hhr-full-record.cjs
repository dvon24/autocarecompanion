const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

function recall(campaign, years, category, title, description, solution, symptoms, affectedSystems, options = {}) {
  const shortCampaign = campaign.slice(0, 6);
  const sourceTitle = `NHTSA Recall ${shortCampaign} - ${title}`;
  const url = `https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=${campaign}`;
  return {
    years,
    trims: options.trims || [],
    engines: options.engines || [],
    category,
    title: `${title} (Recall ${shortCampaign})`,
    description,
    solution,
    severity: 'high',
    confidence: 'high',
    symptoms,
    affectedSystems,
    dtcCodes: [],
    sourceTitle,
    url,
  };
}

const campaigns = {
  leatherSeatSensor: recall('06V417000', [2006], 'safety', 'Aftermarket Leather Can Disrupt Passenger Sensing',
    'Certain 2006 Chevrolet HHR vehicles originally built with cloth seats were reupholstered with aftermarket leather that can make the passenger-sensing system enable or disable the frontal air bag incorrectly.',
    'Check the VIN and conversion history for campaign 06V417. Because a compatible replacement cover was unavailable, GM offered to repurchase the covered vehicles under the recall terms.',
    ['Passenger-air-bag indicator does not match the occupant', 'Passenger frontal air bag may be enabled or disabled incorrectly'], ['aftermarket leather seat cover, passenger-sensing system and frontal air bag'], { trims: ['Covered vehicles reupholstered with affected aftermarket leather'] }),
  headlinerProtection: recall('08V046000', [2006, 2007, 2008], 'safety', 'Headliner Needs Additional Impact Protection',
    'Certain 2006-2008 Chevrolet HHR vehicles without optional roof-rail air bags do not meet a federal upper-interior head-impact requirement.',
    'Check the VIN for campaign 08V046. A Chevrolet dealer installs an energy-absorbing plastic piece in the headliner trim, free of charge.',
    ['No reliable warning before a crash', 'Reduced upper-interior head-impact protection'], ['headliner trim and energy-absorbing insert'], { trims: ['Without optional roof-rail air bags'] }),
  binLatch: recall('08V444000', [2006, 2007, 2008], 'body', 'Instrument-Panel Storage-Bin Door Can Open in an Impact',
    'Certain 2006-2008 Chevrolet HHR top-center instrument-panel storage-bin doors can fail to remain closed as required during an interior-impact test.',
    'Check the VIN for campaign 08V444. A Chevrolet dealer installs the redesigned storage-bin latch, free of charge.',
    ['Top instrument-panel storage door will not remain latched', 'Storage-bin door can open during an impact'], ['instrument-panel storage-bin door and latch']),
  shiftCable: recall('09V073000', [2009], 'transmission', 'Shift-Cable Clip Can Permit Rollaway',
    'Certain 2009 Chevrolet HHR transmission shift-cable adjustment clips may not be fully engaged. The lever can indicate Park while the transmission is not actually in Park, allowing rollaway.',
    'Check the VIN for campaign 09V073. A Chevrolet dealer inspects the adjustment clip and replaces the shift cable if the clip will not engage, free of charge.',
    ['Shift-lever position does not match the transmission gear', 'Key can be removed when the transmission is not in Park', 'Vehicle rolls after occupants exit'], ['automatic-transmission shift cable, adjustment clip and interlock']),
  aftermarketSwitch: recall('14E021000', [2006, 2007, 2008, 2009, 2010, 2011], 'electrical', 'Aftermarket Ignition Switch Can Move Out of Run',
    'Certain UCI-FRAM replacement ignition switches sold under specified Wells, Duralast, Airtex and Carquest part numbers for 2006-2011 Chevrolet HHR applications can move out of Run, stall the engine and disable the air bags.',
    'Check service history for an affected replacement switch and campaign 14E021. Installed switches are replaced through the related GM ignition-switch recall, free of charge.',
    ['Engine stalls after a jarring event', 'Electrical power and air-bag protection are lost'], ['aftermarket ignition switch, engine electrical system and air bags'], { trims: ['Vehicles repaired with an affected UCI-FRAM replacement switch'] }),
  ignitionSwitch: recall('14V047000', [2006, 2007, 2008, 2009, 2010, 2011], 'electrical', 'Ignition Switch Can Move Out of Run and Disable Air Bags',
    'Certain 2006-2011 Chevrolet HHR ignition switches can move out of Run because of key-ring weight or a jarring event, shutting off the engine and preventing air-bag deployment in a crash.',
    'Until repaired, remove other items and the fob from the key ring. Check the VIN for campaign 14V047; a Chevrolet dealer replaces the ignition switch, free of charge.',
    ['Engine shuts off while driving', 'Electrical accessories lose power', 'Air bags may not deploy after the switch leaves Run'], ['ignition switch, engine electrical power and air-bag system']),
  powerSteering: recall('14V153000', [2009, 2010], 'steering', 'Electric Power-Steering Assist Can Stop Working',
    'Certain non-turbo 2009-2010 Chevrolet HHR vehicles can suddenly lose electric power-steering assist while driving. Manual steering remains, but low-speed effort increases.',
    'Check the VIN and bulletin assignment for campaign 14V153. Covered HHR vehicles receive the applicable electric-power-steering motor remedy free of charge.',
    ['Power-steering warning', 'Sudden loss of steering assist', 'High steering effort at low speed'], ['electric power-steering motor and assist system'], { trims: ['Non-turbo'] }),
  lockCylinder: recall('14V171000', [2006, 2007, 2008, 2009, 2010, 2011], 'electrical', 'Ignition Key Can Be Removed Outside Off',
    'Certain 2006-2011 Chevrolet HHR ignition lock cylinders allow the key to be removed when the ignition is not in Off. A vehicle not secured in the correct gear can roll away.',
    'Until repaired, place an automatic in Park or a manual in Reverse with the parking brake engaged. A Chevrolet dealer replaces the cylinder or supplies relearned keys under campaign 14V171.',
    ['Ignition key can be removed outside Off', 'Vehicle can roll after occupants exit'], ['ignition lock cylinder, keys and transmission park interlock']),
};

const assignments = {
  'chevrolet-hhr-blower-motor-resistor-failure-cowl-water-leak': 'leatherSeatSensor',
  'chevrolet-hhr-defective-ignition-switch-can-shut-off-engine-while-driving': 'ignitionSwitch',
  'chevrolet-hhr-ecotec-timing-chain-stretch-tensioner-failure': 'headlinerProtection',
  'chevrolet-hhr-interior-door-handles-break-off': 'binLatch',
  'chevrolet-hhr-passlock-anti-theft-system-no-start': 'aftermarketSwitch',
  'chevrolet-hhr-sudden-loss-electric-power-steering-assist': 'powerSteering',
  'chevrolet-hhr-transmission-shift-cable-rollaway-recall-harsh-shifting': 'shiftCable',
  'chevy-hhr-ignition-switch-defect-2006': 'lockCylinder',
};

const published = Object.fromEntries(Object.entries(assignments).map(([id, key]) => {
  const card = campaigns[key];
  return [id, {
    disposition: 'replace',
    decision: `Replace the frozen unsupported, duplicate or mis-scoped HHR card with the exact ${card.sourceTitle} primary record and remove its unverified commerce links.`,
    evidence: [{ type: 'recall', label: card.sourceTitle, url: card.url }],
    after: {
      years: card.years,
      trims: card.trims,
      engines: card.engines,
      category: card.category,
      title: card.title,
      description: card.description,
      solution: card.solution,
      severity: card.severity,
      confidence: card.confidence,
      symptoms: card.symptoms,
      affectedSystems: card.affectedSystems,
      dtcCodes: card.dtcCodes,
      citations: [{ type: 'recall', title: card.sourceTitle, url: card.url }],
      summary: `Replaced an unsupported or mis-scoped HHR card with the exact ${card.sourceTitle} primary campaign and removed its unverified commerce links.`,
    },
  }];
}));

module.exports = buildConfig({
  label: 'Chevrolet HHR',
  make: 'Chevrolet',
  model: 'HHR',
  slug: 'chevrolet-hhr',
  batchId: 'chevrolet-hhr-full-record-cohort-22-2026-08-02',
  auditDate: '2026-08-02',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '31e9bb9a9c443cac5b8f3bbd222a7f8884ce1d75c3eedc4681b32b4574a3744e',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/chevrolet-hhr/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'chevrolethhr_blind:self-no-blocker',
    edge: 'chevrolethhr_edge:self-no-blocker',
  },
  published,
  proposalCampaigns: [],
});
