const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

function replacement(card, decision) {
  return {
    disposition: 'replace',
    decision,
    evidence: card.sources.map((item) => ({ type: item.type, label: item.title, url: item.url })),
    after: {
      years: card.years,
      trims: card.trims || [],
      engines: card.engines || [],
      category: card.category,
      title: card.title,
      description: card.description,
      solution: card.solution,
      severity: 'high',
      confidence: 'high',
      symptoms: card.symptoms,
      affectedSystems: card.affectedSystems,
      dtcCodes: [],
      estimatedCostLow: null,
      estimatedCostHigh: null,
      typicalMileageLow: null,
      typicalMileageHigh: null,
      citations: card.sources,
      source: 'manual',
      summary: card.summary,
    },
  };
}

const recall = (year) =>
  `https://api.nhtsa.gov/recalls/recallsByVehicle?make=GMC&model=SUBURBAN&modelYear=${year}`;

const published = {
  'gmc-suburban-57l-intake-gasket-1996': replacement(
    {
      years: [1992],
      category: 'drivetrain',
      title: 'Transmission Vent-Hose Fire Recall',
      description: 'NHTSA campaign 93V016 covers certain 1992 GMC Suburban vehicles. Unanticipated transmission heat can force fluid from the vent tube, and the fluid can ignite if it reaches an ignition source.',
      solution: 'Check the VIN with GMC or NHTSA. The recall remedy installs a longer transmission vent hose routed to the left side of the engine compartment.',
      symptoms: ['Transmission fluid may be expelled from the vent tube'],
      affectedSystems: ['automatic transmission', 'transmission vent hose', 'exhaust-area routing'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 93V016 - Suburban Transmission Vent', url: recall(1992) }],
      summary: 'Replaced a blank-citation intake-gasket/CPI card with the exact transmission vent-hose recall.',
    },
    'The frozen card asserted intake-gasket and central-injection failures across 1996-1999, including repair procedures and costs, but both citation entries were blank.',
  ),

  'gmc-suburban-fuel-pump-1996': replacement(
    {
      years: [1995],
      category: 'drivetrain',
      title: 'Thin Transmission-Case Casting Recall',
      description: 'NHTSA campaign 95V026 covers certain 1995 GMC Suburban vehicles. A thin transmission-case casting can leak fluid onto the exhaust system and cause a vehicle fire.',
      solution: 'Check the VIN with GMC or NHTSA. Dealers inspect the transmission case and replace the transmission when the affected casting is present.',
      symptoms: ['External transmission-fluid leak', 'Fluid may spray onto the exhaust system'],
      affectedSystems: ['automatic transmission case', 'transmission fluid containment', 'exhaust-system clearance'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 95V026 - Suburban Transmission Case', url: recall(1995) }],
      summary: 'Replaced a fuel-pump card supported by a generic vehicle page and video with the exact transmission-case recall.',
    },
    'The frozen card generalized large-tank fuel-pump failure, tank removal, relay and filter work across four years; a generic NHTSA model page and video did not establish that defect.',
  ),

  'gmc-suburban-hvac-blend-door-2000': replacement(
    {
      years: [1995],
      category: 'drivetrain',
      title: 'Transmission Shift-Cable Lock-Clip Recall',
      description: 'NHTSA campaign 95V139 covers certain 1995 GMC Suburban vehicles. A shift-cable lock clip can back out, causing loss of cable adjustment so the transmission may not actually be in park when the lever is placed there.',
      solution: 'Check the VIN with GMC or NHTSA. Dealers adjust the shift cable and install a lock clip. Apply the parking brake whenever parking.',
      symptoms: ['Park indicator may not illuminate', 'Vehicle may move unexpectedly after selecting park'],
      affectedSystems: ['automatic-transmission shift cable', 'shift-cable lock clip', 'park indication'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 95V139 - Suburban Shift Cable', url: recall(1995) }],
      summary: 'Replaced an uncited 2000-2006 HVAC card on a discontinued GMC nameplate with the exact 1995 shift-cable recall.',
    },
    'The frozen card had no citation and assigned 2000-2006 model years to GMC Suburban even though the GMC full-size successor used the Yukon XL name, while generalizing actuator failure and repair steps.',
  ),

  'gmc-suburban-rear-ac-evaporator-1995': replacement(
    {
      years: [1995, 1996],
      category: 'engine',
      title: 'Binding Throttle-Cable Recall',
      description: 'NHTSA campaign 96V057 covers certain 1995-1996 GMC Suburban vehicles. The throttle cable can contact the dash mat and bind, preventing engine speed from returning to idle as required by the federal accelerator-control standard.',
      solution: 'Check the VIN with GMC or NHTSA. Dealers inspect throttle-cable clearance and cut the interfering portion of dash mat when clearance is insufficient.',
      symptoms: ['Engine speed may not return to idle', 'Throttle cable may bind against the dash mat'],
      affectedSystems: ['throttle cable', 'dash mat clearance', 'accelerator control'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 96V057 - Suburban Throttle Cable', url: recall(1995) }],
      summary: 'Replaced an overbroad rear-A/C leak card with the exact throttle-cable binding recall.',
    },
    'The frozen card spanned 1995-2006, cited a Chevrolet complaint page, and generalized rear evaporator, line, O-ring and bypass repairs without a GMC primary source or valid post-1999 nameplate scope.',
  ),

  'gmc-suburban-rear-hvac-1992': replacement(
    {
      years: [1998],
      category: 'brakes',
      title: 'Front Brake Rotor/Hub Recall',
      description: 'NHTSA campaign 98V033 covers certain 1998 GMC Suburban vehicles. One or both front rotor/hub assemblies may contain out-of-specification gray iron that can crack and, if driving continues, allow a wheel to separate.',
      solution: 'Check the VIN with GMC or NHTSA. Dealers inspect the rotor core date and replace a rotor marked with the affected date code.',
      symptoms: ['Front brake rotor may crack', 'Continued driving with a cracked rotor can lead to wheel separation'],
      affectedSystems: ['front brake rotor/hub assemblies', 'wheel mounting bolt circle'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 98V033 - Suburban Rotor/Hub', url: recall(1998) }],
      summary: 'Replaced a forum-based rear-HVAC aggregation with the exact front rotor/hub recall.',
    },
    'The frozen card combined rear blower, resistor, wiring, heater-core and coolant claims across eight years using a blank citation and one forum thread rather than a manufacturer-defined population.',
  ),
};

module.exports = buildConfig({
  label: 'GMC Suburban',
  make: 'GMC',
  model: 'Suburban',
  slug: 'gmc-suburban',
  batchId: 'gmc-suburban-full-record-cohort-160-2026-08-05',
  auditDate: '2026-08-05',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '78f006bedf4a3892eca6f9fb36a0c417b2b9c2fff32c97cd46869951c2a97945',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/gmc-suburban/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'gmcsuburban_blind:manual-primary-source-gate',
    edge: 'gmcsuburban_edge:manual-primary-source-gate',
  },
  published,
  reasons: {},
  proposalCampaigns: [],
});
