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
      severity: card.severity || 'medium',
      confidence: 'high',
      symptoms: card.symptoms,
      affectedSystems: card.affectedSystems,
      dtcCodes: card.dtcCodes || [],
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

const recalls = (year) => `https://api.nhtsa.gov/recalls/recallsByVehicle?make=Genesis&model=GV80&modelYear=${year}`;

const tsb = {
  misfire: 'https://static.nhtsa.gov/odi/tsbs/2025/MC-11021790-0001.pdf',
  infotainment: 'https://static.nhtsa.gov/odi/tsbs/2026/MC-11027056-0001.pdf',
  differential: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-11009768-0001.pdf',
};

const published = {
  'genesis-gv80-2-5l-t-gdi-cold-start-misfire-p0300-p0304': replacement(
    {
      years: [2021, 2022, 2023, 2024],
      engines: ['2.5L Theta III T-GDI'],
      category: 'engine',
      title: '2.5L T-GDI Misfire DTC Software Campaign',
      description: 'Genesis bulletin 11021790 covers specified 2021-2024 GV80 vehicles with the 2.5-liter Theta III T-GDI engine that can illuminate the check-engine light with DTC P0300, P0301, P0302, P0303 or P0304. The campaign addresses the condition with engine-control software.',
      solution: 'Have a Genesis dealer confirm campaign eligibility, scan the engine controller and perform the prescribed ECM software update. A check-engine light that remains after the campaign requires normal diagnosis rather than assumed parts replacement.',
      symptoms: ['Check-engine light', 'Misfire diagnostic trouble code'],
      affectedSystems: ['engine control module software', 'misfire detection logic'],
      dtcCodes: ['P0300', 'P0301', 'P0302', 'P0303', 'P0304'],
      sources: [{ type: 'tsb', title: 'Genesis Bulletin 11021790 - GV80 2.5L Misfire Campaign', url: tsb.misfire }],
      summary: 'Kept the documented 2.5-liter misfire campaign while removing secondary citations, cold-start specificity and unsupported follow-on parts advice.',
    },
    'The frozen card combined an official campaign with forum and aggregator material, then prescribed coil and injector swap-testing beyond the campaign remedy.',
  ),

  'genesis-gv80-front-seat-belt-pretensioner-can-explode-project-metal-fragm': replacement(
    {
      years: [2020, 2021, 2022, 2023],
      category: 'safety',
      title: 'Front Seat-Belt Pretensioner Fragment Recall',
      description: 'NHTSA campaign 23V094 covers certain 2020-2023 Genesis GV80 vehicles. The front driver-side or passenger-side seat-belt pretensioner can explode during deployment and project metal fragments into the passenger compartment.',
      solution: 'Check the VIN with Genesis. Dealers secure the affected pretensioners with protective caps free of charge. Campaign 23V094 supersedes and expands 21V796, so vehicles repaired under the earlier recall require the updated remedy.',
      severity: 'high',
      symptoms: ['No reliable warning before pretensioner deployment in a crash'],
      affectedSystems: ['front seat-belt pretensioners', 'protective caps'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 23V094 - GV80 Seat-Belt Pretensioners', url: recalls(2023) }],
      summary: 'Replaced three secondary news citations with the official NHTSA campaign, exact scope and superseding cap remedy.',
    },
    'The frozen card described a real recall but sourced it only to secondary publications and included production and fleet-size details that are unnecessary for owner guidance.',
  ),

  'genesis-gv80-infotainment-issues': replacement(
    {
      years: [2021, 2022, 2023, 2024],
      trims: ['Vehicles equipped with Premium Gen6 Navigation'],
      category: 'electrical',
      title: 'Premium Gen6 Navigation and Connected-Services Update',
      description: 'Genesis bulletin 11027056 covers specified vehicles with Premium Gen6 Navigation that can have problems with Genesis Connected Services, navigation, voice recognition or Bluetooth. Some home screens may also show applications not intended for the U.S. market.',
      solution: 'Have a Genesis dealer or qualified service provider follow bulletin 11027056 and install the prescribed Premium Gen6 Navigation software update.',
      symptoms: ['Connected Services malfunction', 'Navigation, voice-recognition or Bluetooth problem', 'Unexpected applications on the home screen'],
      affectedSystems: ['Premium Gen6 Navigation head unit', 'Genesis Connected Services', 'Bluetooth and voice recognition'],
      sources: [{ type: 'tsb', title: 'Genesis Bulletin 11027056 - Premium Gen6 Navigation Update', url: tsb.infotainment }],
      summary: 'Replaced a catch-all uncited card about freezing and wireless-phone heat with the exact Genesis software conditions and update path.',
    },
    'The frozen card grouped unrelated navigation, wireless-charging and telematics complaints across six years and advised factory resets without Genesis documentation.',
  ),

  'genesis-gv80-instrument-cluster-goes-blank-startup-software-logic-error': replacement(
    {
      years: [2023, 2024],
      category: 'electrical',
      title: 'Instrument-Panel Display Software Recall',
      description: 'NHTSA campaign 25V105 covers certain 2023-2024 Genesis GV80 vehicles. A software error can cause the instrument-panel display to fail and hide required vehicle information.',
      solution: 'Check the VIN with Genesis. Dealers inspect and update the instrument-panel display software as necessary free of charge. A failed display should be serviced before continued driving without required information.',
      severity: 'high',
      symptoms: ['Instrument-panel display may fail', 'Speedometer or warning information may be unavailable'],
      affectedSystems: ['instrument-panel display', 'display software'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 25V105 - GV80 Instrument Display', url: recalls(2024) }],
      summary: 'Kept the verified display recall but removed encoding damage, secondary citations and unsupported production-detail claims.',
    },
    'The frozen card cited secondary articles alongside a recall attachment and asserted controller behavior and build dates beyond the owner-facing NHTSA record.',
  ),

  'genesis-gv80-low-pressure-fuel-pump-impeller-deformation-causes-stalling': replacement(
    {
      years: [2022, 2023],
      category: 'fuel',
      title: 'Fuel-Pump Failure and Power-Loss Recall',
      description: 'NHTSA campaign 24V282 covers certain 2022-2023 Genesis GV80 vehicles. The fuel pump can fail and cause a loss of drive power.',
      solution: 'Check the VIN with Genesis. Dealers inspect and replace the fuel-pump assembly free of charge. Campaign 24V282 expands campaign 23V630.',
      severity: 'high',
      symptoms: ['Possible fuel-pump failure', 'Possible loss of drive power'],
      affectedSystems: ['fuel-pump assembly'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 24V282 - GV80 Fuel Pump', url: recalls(2023) }],
      summary: 'Replaced three secondary sources and detailed impeller theories with the official NHTSA scope and remedy.',
    },
    'The frozen card asserted temperature, impeller, rough-idle, hesitation and production-date details sourced only through secondary coverage.',
  ),

  'genesis-gv80-rear-differential-hum-whine-noise-from-improperly-torqued-pi': replacement(
    {
      years: [2021, 2022, 2023, 2024, 2025],
      category: 'drivetrain',
      title: 'Rear Differential Hum or Whine Bulletin',
      description: 'Genesis bulletin 11009768 documents a hum or whine from the rear differential at certain speeds on specified GV80 vehicles.',
      solution: 'A Genesis dealer follows the bulletin to inspect the noise, tighten the rear differential lock nut first and, if the noise remains, replace the rear differential or other driveline components as necessary.',
      symptoms: ['Rear differential hum or whine at certain speeds'],
      affectedSystems: ['rear differential', 'differential lock nut', 'related driveline components'],
      sources: [{ type: 'tsb', title: 'Genesis Bulletin 11009768 - GV80 Rear Differential Noise', url: tsb.differential }],
      summary: 'Kept the documented differential condition while removing unsupported speed ranges, factory-cause claims and warranty promises.',
    },
    'The frozen card mixed an older bulletin with aggregator and forum sources, a precise speed range, an asserted factory cause and universal warranty language not established by the primary record.',
  ),
};

const reasons = {
  'genesis-gv80-diesel-nox': 'The frozen international-market diesel card has no cited source, and current Genesis/NHTSA U.S. primary-source research does not establish one GV80 diesel NOx-sensor, SCR, DEF, regeneration and reduced-power condition or the listed repair procedure.',
  'genesis-gv80-head-up-display-fades-eclipse-effect-before-total-failure': 'The frozen head-up-display card is based entirely on owner forums and asserts an overheating or hardware root cause, failure progression, warranty outcome and installed price range that current Genesis/NHTSA primary sources do not establish.',
};

module.exports = buildConfig({
  label: 'Genesis GV80',
  make: 'Genesis',
  model: 'GV80',
  slug: 'genesis-gv80',
  batchId: 'genesis-gv80-full-record-cohort-143-2026-08-05',
  auditDate: '2026-08-05',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '86c38639ef9604f642a23bd42e03afda959c2c6be6e2efc23be2eea6b77461e8',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/genesis-gv80/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'genesisgv80_blind:manual-primary-source-gate',
    edge: 'genesisgv80_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [],
});
