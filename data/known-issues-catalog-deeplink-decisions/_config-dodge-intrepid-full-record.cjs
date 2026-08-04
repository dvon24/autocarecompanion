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
      source: 'nhtsa-verified',
      summary: card.summary,
    },
  };
}

const shifterInterlockRecall = {
  years: [1995, 1996, 1997, 1998, 1999],
  trims: ['Vehicles included in recall C45/04V-021; verify by VIN'],
  category: 'transmission',
  title: 'Floor-Shifter Interlock Failure Can Allow Vehicle Rollaway (Recall 04V-021)',
  description:
    'NHTSA recall 04V-021 covers certain 1995-1999 Dodge Intrepid vehicles. The ignition-park interlock can fail, allowing the shifter to move out of Park with the key removed or allowing the key to be removed when the transmission is not in Park. Either condition can allow an unattended vehicle to roll away.',
  solution:
    'Check the VIN for recall 04V-021. DaimlerChrysler\'s remedy is installation of a new load-limiting push rod in the floor-shifter lever. Until verified and repaired, positively confirm Park and apply the parking brake before leaving the vehicle.',
  severity: 'high',
  symptoms: ['Shifter can move out of Park after the key is removed', 'Ignition key can be removed while the shifter is not in Park', 'Vehicle may roll away without warning'],
  affectedSystems: ['floor-shifter ignition-park interlock', 'floor-shifter lever push rod', 'park retention'],
  dtcCodes: [],
  sources: [{ type: 'recall', title: 'NHTSA Recall 04V-021 - Floor-Shifter Interlock Rollaway Risk', url: 'https://www.nhtsa.gov/recalls?nhtsaId=04V021000' }],
  summary:
    'Replaced the twelve-year generic transmission-failure aggregation with recall 04V-021\'s exact 1995-1999 interlock failure, rollaway risk, and shifter push-rod remedy.',
};

const published = {
  'dodge-intrepid-trans-failure-1993': replacement(
    shifterInterlockRecall,
    'Replace the twelve-year forum and reseller transmission-failure aggregation with recall 04V-021\'s exact 1995-1999 ignition-park interlock condition and rollaway remedy.',
  ),
};

const reasons = {
  'dodge-intrepid-27l-sludge-1998':
    'The frozen card attributes all 1998-2004 2.7L engine failures to sludge with mileage, costs, oil-pressure symptoms, flushing, and engine replacement from a lawsuit article, forum, and complaint site without a DaimlerChrysler primary source proving that complete condition.',
  'dodge-intrepid-3-2l-3-5l-v6-timing-belt-tensioner-water-pump-failure':
    'The frozen card combines two engines, twelve model years, timing belts, tensioners, water pumps, interference claims, service intervals, mileage, costs, and multiple remedies from forums and secondary repair sites without one manufacturer bulletin defining the scope.',
  'dodge-intrepid-ac-evaporator-core-corrosion-refrigerant-leak':
    'The frozen card asserts twelve model years of evaporator corrosion and refrigerant leakage with dye diagnosis, dashboard removal, costs, and replacement from repair sites, forums, and complaints without a DaimlerChrysler primary source.',
  'dodge-intrepid-blower-motor-resistor-failure-fan-only-works-high':
    'The frozen card treats seven model years of blower-speed faults as resistor failure and prescribes resistor or blower-motor replacement from forums and repair sites without a manufacturer bulletin defining the affected electrical design and diagnostic boundary.',
  'dodge-intrepid-camshaft-crankshaft-position-sensor-failure-intermittent-sta':
    'The frozen card combines camshaft and crankshaft sensors, two generations, twelve model years, four DTCs, stalling, no-start, costs, and both sensor replacements from secondary sources without one Dodge primary source proving a single condition.',
  'dodge-intrepid-fuel-pump-check-valve-leak-hard-starting-after-sitting':
    'The frozen card attributes hard starting across twelve model years to a fuel-pump check valve and prescribes pressure testing or full pump-module replacement from one repair site and forums without a manufacturer-defined population and remedy.',
  'dodge-intrepid-power-window-regulator-clip-motor-failure':
    'The frozen card combines window clips, regulators, motors, seven model years, costs, and multiple replacement paths from forums, complaints, and a video without one DaimlerChrysler bulletin defining a common defect.',
  'dodge-intrepid-steering-rack-wear-leaks-rack-mounting-bolt-failure':
    'The frozen card combines rack wear, seals, mounting bolts, leaks, clunks, steering play, ten model years, costs, and rack replacement from complaint aggregators and a repair site without a manufacturer primary source establishing one mechanism.',
  'dodge-intrepid-transmission-solenoid-1993':
    'The frozen card asserts twelve model years of 42LE solenoid-pack failure with four DTCs, limp mode, mileage, costs, and replacement guidance but provides no citation or Dodge primary source defining that universal failure pattern.',
};

module.exports = buildConfig({
  label: 'Dodge Intrepid',
  make: 'Dodge',
  model: 'Intrepid',
  slug: 'dodge-intrepid',
  batchId: 'dodge-intrepid-full-record-cohort-74-2026-08-04',
  auditDate: '2026-08-04',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '545c0887ab29dd688c463f259cc2824446dc8072fc3df2518a5d98c572a92b0c',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/dodge-intrepid/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'dodgeintrepid_blind:manual-primary-source-gate',
    edge: 'dodgeintrepid_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [
    '00V033000', '00V034000', '00V180000', '00V366000', '01V119000', '01V273000',
    '03V035000', '04V021000', '09E012000', '09E025000', '98V049000', '98V184000',
    '99V215000', '99V343000',
  ],
});
