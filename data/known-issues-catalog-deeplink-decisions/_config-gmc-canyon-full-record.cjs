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

const recalls = (year) => `https://api.nhtsa.gov/recalls/recallsByVehicle?make=GMC&model=Canyon&modelYear=${year}`;

const published = {
  'gmc-canyon-2024-headlight-flicker-2023-2024-seat-belt-buckle-bolt-recal': replacement(
    {
      years: [2024],
      category: 'electrical',
      title: 'Headlight Flicker Recall',
      description: 'NHTSA campaign 24V673 covers certain 2024 GMC Canyon vehicles. The headlights can flicker while driving or while parked, causing the trucks to fail federal lighting requirements.',
      solution: 'Check the VIN with GMC. Dealers replace the affected headlight module free of charge under GM campaign N242468880.',
      symptoms: ['Headlights may flicker while driving or parked'],
      affectedSystems: ['headlight module', 'exterior lighting'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 24V673 - Canyon Headlights', url: recalls(2024) }],
      summary: 'Separated the frozen two-recall card and replaced secondary sources with the official NHTSA headlight campaign.',
    },
    'The frozen card combined two different campaigns and generations, relied on three secondary sites and did not identify the seat-belt campaign number.',
  ),

  'gmc-canyon-3-6l-v6-excessive-oil-consumption-from-clogged-pcv-orifice': replacement(
    {
      years: [2023],
      category: 'safety',
      title: 'Front Seat-Belt Buckle Bolt Recall',
      description: 'NHTSA campaign 24V703 covers certain 2023 GMC Canyon vehicles. A left or right front seat-belt buckle attachment bolt may not have been tightened properly.',
      solution: 'Check the VIN with GMC. Dealers tighten both front seat-belt buckle attachment bolts free of charge under GM campaign N242453720.',
      symptoms: ['Front seat-belt buckle attachment may be loose'],
      affectedSystems: ['front seat-belt buckle bolts'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 24V703 - Canyon Seat-Belt Buckle Bolts', url: recalls(2023) }],
      summary: 'Replaced a forum-only oil-consumption theory with the verified Canyon seat-belt fastener recall.',
    },
    'The frozen card relied on two forums and asserted a fixed PCV design, consumption rate, sludge mechanism, converter damage and valve-cover repair across eight years without a GM primary source.',
  ),

  'gmc-canyon-8l45-transmission-shudder-2015': replacement(
    {
      years: [2023],
      category: 'safety',
      title: 'Unexpected Automatic Emergency Braking Recall',
      description: 'NHTSA campaign 24V133 covers certain 2023 GMC Canyon vehicles. The front-camera module can falsely detect an obstacle and activate automatic emergency braking unexpectedly.',
      solution: 'Check the VIN with GMC. Dealers update the front-camera module software free of charge under GM campaign A232424660.',
      symptoms: ['Automatic emergency braking may engage unexpectedly'],
      affectedSystems: ['front-camera module', 'automatic emergency braking'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 24V133 - Canyon Automatic Emergency Braking', url: recalls(2023) }],
      summary: 'Replaced forum, lawsuit and aftermarket transmission claims with the exact NHTSA false-obstacle braking recall.',
    },
    'The frozen card applied one transmission and one alleged shudder cause to eleven years, cited no GM bulletin directly and prescribed fluid, quantity, converter and coverage details from secondary sources.',
  ),

  'gmc-canyon-cylinder-deactivation-2015': replacement(
    {
      years: [2023],
      category: 'suspension',
      title: 'Front Wheel-Hub Bolt Recall',
      description: 'NHTSA campaign 24V237 covers certain 2023 GMC Canyon vehicles. The front wheel-hub bolts may have been over-tightened and damaged during assembly.',
      solution: 'Check the VIN with GMC. Dealers replace the left and right front wheel-hub bolts free of charge under GM campaign N232431480.',
      symptoms: ['Front wheel-hub bolts may be damaged'],
      affectedSystems: ['front wheel hubs', 'hub bolts'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 24V237 - Canyon Front Hub Bolts', url: recalls(2023) }],
      summary: 'Replaced an aftermarket AFM-delete card with the model-specific NHTSA front-hub fastener recall.',
    },
    'The frozen card used aftermarket articles and a video to recommend deleting an emissions and engine-control system, and did not establish a defined GMC failure population or approved remedy.',
  ),

  'gmc-canyon-driver-airbag-inflator-misalignment-sdm-reprogram': replacement(
    {
      years: [2015],
      category: 'safety',
      title: 'Driver Airbag Inflator Alignment Recall',
      description: 'NHTSA campaign 15V157 covers certain 2015 GMC Canyon vehicles. The driver-airbag inflator may be misaligned to the module backplate and can separate during deployment.',
      solution: 'Check the VIN with GMC. Dealers inspect the driver-airbag inflator alignment and replace the airbag as necessary free of charge under GM campaign 15037.',
      symptoms: ['No reliable warning before an affected airbag deploys'],
      affectedSystems: ['driver frontal airbag', 'inflator and module backplate'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 15V157 - Canyon Driver Airbag', url: recalls(2015) }],
      summary: 'Corrected the frozen card’s remedy and GM campaign identity using the official NHTSA record.',
    },
    'The frozen card described inflator misalignment but paired it with GM campaign 14690 and an SDM reprogram remedy; that separate campaign concerns incorrect airbag wiring, while misalignment is 15V157/15037 and requires inspection or airbag replacement.',
  ),

  'gmc-canyon-duramax-def-dpf-issues-2016': replacement(
    {
      years: [2015, 2016, 2017, 2018],
      category: 'fuel',
      title: 'High-Pressure Fuel-Pump Detachment Recall',
      description: 'NHTSA campaign 18V358 covers certain 2015-2018 GMC Canyon vehicles. The high-pressure fuel pump can detach from its mounting flange and damage the high-pressure fuel line, creating a fuel leak and fire risk.',
      solution: 'Check the VIN with GMC. Dealers replace the high-pressure fuel pump and high-pressure fuel pipe free of charge under GM campaign 18188.',
      symptoms: ['Possible fuel leak from damaged high-pressure components'],
      affectedSystems: ['high-pressure fuel pump', 'high-pressure fuel pipe'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 18V358 - Canyon High-Pressure Fuel Pump', url: recalls(2015) }],
      summary: 'Replaced an uncited diesel-emissions catch-all and unsafe generic driving advice with the exact fuel-pump safety recall.',
    },
    'The frozen card grouped DEF sensors, DPF regeneration, pumps and NOx sensors across ten years with no citations, then prescribed highway driving, parts, forced regeneration and fluid-level rules without a GM bulletin.',
  ),

  'gmc-canyon-front-brake-caliper-brake-fluid-leak': replacement(
    {
      years: [2015],
      category: 'brakes',
      title: 'Front Brake-Caliper Fluid-Leak Recall',
      description: 'NHTSA campaign 15V278 covers certain 2015 GMC Canyon trucks. Air pockets in the metal caliper body can allow the front brake calipers to leak fluid and reduce braking ability.',
      solution: 'Check the VIN with GMC. Dealers inspect and replace the front brake calipers as necessary free of charge under GM campaign 14888.',
      symptoms: ['Possible front brake-fluid leak', 'Reduced braking ability'],
      affectedSystems: ['front brake calipers', 'hydraulic brake system'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 15V278 - Canyon Front Brake Calipers', url: recalls(2015) }],
      summary: 'Kept the verified brake-caliper recall while replacing secondary citations, production counts and outdated chronology with the official NHTSA record.',
    },
    'The frozen card described a real recall but mixed a recall attachment with repair and news sites and included production and fleet-size detail that does not improve owner guidance.',
  ),

  'gmc-canyon-front-suspension-clunk-2015': replacement(
    {
      years: [2015],
      category: 'safety',
      title: 'Front Seat-Frame Attachment Recall',
      description: 'NHTSA campaign 15V267 covers certain 2015 GMC Canyon trucks. The hooks that secure the driver or front-passenger seat frame may not have been properly attached to the vehicle body.',
      solution: 'Check the VIN with GMC. Dealers inspect the front seats and correct their installation as necessary free of charge under GM campaign 15150.',
      symptoms: ['Front seat frame may not be properly attached'],
      affectedSystems: ['driver seat frame', 'front-passenger seat frame', 'seat attachment hooks'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 15V267 - Canyon Front Seats', url: recalls(2015) }],
      summary: 'Replaced an uncited suspension-parts shopping list with the exact front-seat attachment recall.',
    },
    'The frozen card generalized end-link, ball-joint and strut-mount failures across eleven years, cited no source and named aftermarket parts and replacement procedures without GM evidence.',
  ),

  'gmc-canyon-p0420-p0430-catalytic-converter-efficiency-failure': replacement(
    {
      years: [2024],
      category: 'fuel',
      title: 'Fuel-Pump Lock-Ring Recall',
      description: 'NHTSA campaign 24V491 covers certain 2024 GMC Canyon vehicles. The lock ring that secures the fuel pump to the tank may not be fully locked and can allow fuel to leak during a crash.',
      solution: 'Check the VIN with GMC. Dealers inspect and fully lock the fuel-tank lock ring as necessary free of charge under GM campaign N242451330.',
      symptoms: ['Possible fuel leak during a crash'],
      affectedSystems: ['fuel tank', 'fuel-pump lock ring'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 24V491 - Canyon Fuel-Tank Lock Ring', url: recalls(2024) }],
      summary: 'Replaced a third-party catalytic-code theory with the model-specific NHTSA fuel-tank fastener recall.',
    },
    'The frozen card cited only an aftermarket parts site and asserted a converter failure mechanism, matched-bank aging and repair sequence across eight years without GM primary evidence.',
  ),

  'gmc-canyon-power-steering-assist-loss-from-corroded-steering-gear-conne': replacement(
    {
      years: [2015],
      category: 'steering',
      title: 'Power-Steering Assist Loss Recall',
      description: 'NHTSA campaign 21V213 covers certain 2015 GMC Canyon vehicles. A poor electrical connection within the steering-gear assembly can cause a loss of power-steering assist.',
      solution: 'Check the VIN with GMC. Dealers replace the steering-gear torque-sensor cover assembly free of charge under GM campaign N202325410.',
      symptoms: ['Power-steering assist may be lost', 'Steering effort may increase'],
      affectedSystems: ['electric steering gear', 'torque-sensor cover assembly'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 21V213 - Canyon Power Steering', url: recalls(2015) }],
      summary: 'Updated the card from the earlier 16V054 campaign to the later NHTSA campaign 21V213 and removed secondary citations and unsupported connector details.',
    },
    'The frozen card relied partly on secondary sources, attributed a specific corrosion and supplier mechanism beyond the owner-facing record and identified the earlier campaign rather than the later recall for the same remedy.',
  ),
};

module.exports = buildConfig({
  label: 'GMC Canyon',
  make: 'GMC',
  model: 'Canyon',
  slug: 'gmc-canyon',
  batchId: 'gmc-canyon-full-record-cohort-149-2026-08-05',
  auditDate: '2026-08-05',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '745146790b70a6503aa9c9a5c2569c1009db3189ea4835dbe1e342e2cb1a8cca',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/gmc-canyon/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'gmccanyon_blind:manual-primary-source-gate',
    edge: 'gmccanyon_edge:manual-primary-source-gate',
  },
  published,
  reasons: {},
  proposalCampaigns: [],
});
