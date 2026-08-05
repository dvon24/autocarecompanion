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

const recalls = (model, year) =>
  `https://api.nhtsa.gov/recalls/recallsByVehicle?make=Genesis&model=${model}&modelYear=${year}`;

const tsb = {
  batterySaver: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10244961-0001.pdf',
  transmissionModule: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-11000776-0001.pdf',
  brakeSqueal: 'https://static.nhtsa.gov/odi/tsbs/2025/MC-11024797-0001.pdf',
  evaporator: 'https://static.nhtsa.gov/odi/tsbs/2025/MC-11020939-0001.pdf',
  charging: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10238386-0001.pdf',
  radar: 'https://static.nhtsa.gov/odi/tsbs/2025/MC-11016993-0001.pdf',
  lamps: 'https://static.nhtsa.gov/odi/tsbs/2025/MC-11025476-0001.pdf',
  ota: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-11002757-0001.pdf',
  displayCable: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-11009769-0001.pdf',
  paintFilm: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10235566-0001.pdf',
  sunroofWind: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-10251292-0001.pdf',
  differential: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-11009768-0001.pdf',
  sunroofDrain: 'https://static.nhtsa.gov/odi/tsbs/2026/MC-11027794-0001.pdf',
};

const published = {
  'genesis-gv70-12v-auxiliary-battery-drain-dead-battery-bricking': replacement(
    {
      years: [2023],
      trims: ['Electrified GV70'],
      category: 'electrical',
      title: 'Electrified GV70 12-Volt Battery-Saver Software Update',
      description: 'Genesis bulletin 10244961 covers a Vehicle Control Unit software package for the 2023 Electrified GV70. It revises the 12-volt battery-saver logic so the high-voltage battery can charge the auxiliary battery at a state of charge as low as 10 percent.',
      solution: 'Ask a Genesis dealer to confirm whether the Vehicle Control Unit software package applies and install the update. The same package also revises regenerative-brake-light and i-Pedal operating logic.',
      symptoms: ['12-volt battery-saver logic may need the Genesis update'],
      affectedSystems: ['Vehicle Control Unit software', '12-volt battery-saver logic'],
      sources: [{ type: 'tsb', title: 'Genesis Bulletin 10244961 - VCU and 12-Volt Battery-Saver Update', url: tsb.batterySaver }],
      summary: 'Replaced broad owner-forum drain theories and maintainer advice with the model-year-specific Genesis battery-saver software bulletin.',
    },
    'The frozen card combined gasoline and electric vehicles, multiple unverified causes, a claimed driving schedule and battery-tender advice that were not established by a Genesis primary source.',
  ),

  'genesis-gv70-8-speed-automatic-jerky-downshift-syndrome-throttle-response': replacement(
    {
      years: [2022, 2023, 2024, 2025],
      trims: ['Vehicles equipped with the applicable 8-speed automatic transmission'],
      category: 'transmission',
      title: '8-Speed Transmission E-Module Diagnostic Bulletin',
      description: 'Genesis bulletin 11000776 provides a service procedure for applicable 8-speed automatic-transmission vehicles that have a check-engine light and one of the bulletin-listed diagnostic trouble codes. The procedure determines whether the transmission E-module needs replacement.',
      solution: 'Have a Genesis dealer scan the transmission controller and follow bulletin 11000776. The technician performs the specified diagnosis and replaces the E-module only when the bulletin criteria are met.',
      symptoms: ['Check-engine light with a covered transmission DTC'],
      affectedSystems: ['8-speed automatic transmission', 'transmission E-module'],
      sources: [{ type: 'tsb', title: 'Genesis Bulletin 11000776 - 8-Speed Transmission E-Module', url: tsb.transmissionModule }],
      summary: 'Removed the unsupported community label, throttle-body fixes and temporary-relearn claims and retained only the documented transmission diagnostic path.',
    },
    'The frozen card presented an owner-created syndrome as a known calibration defect and named multiple fixes without a primary source tying those claims to the GV70.',
  ),

  'genesis-gv70-brake-noise': replacement(
    {
      years: [2026],
      category: 'brakes',
      title: 'Front Brake Squeal Service Bulletin',
      description: 'Genesis bulletin 11024797 documents brake squeal under certain braking conditions on specified 2026 GV70 vehicles.',
      solution: 'A Genesis dealer follows the bulletin and replaces the front brake pads and radial springs to resolve the documented condition.',
      symptoms: ['Squeal during certain braking conditions'],
      affectedSystems: ['front brake pads', 'front brake radial springs'],
      sources: [{ type: 'tsb', title: 'Genesis Bulletin 11024797 - GV70 Brake Squeal', url: tsb.brakeSqueal }],
      summary: 'Narrowed an uncited all-year brake-dust theory to the exact 2026 squeal condition and Genesis repair.',
    },
    'The frozen card attributed noise and dust across five model years to an aggressive pad compound and recommended aftermarket ceramic pads without Genesis evidence.',
  ),

  'genesis-gv70-c-not-cooling-weak-cooling-one-side': replacement(
    {
      years: [2022, 2023, 2024, 2025],
      category: 'hvac',
      title: 'A/C Evaporator-Core Leak and Weak Cooling',
      description: 'Genesis bulletin 11020939 states that specified Genesis vehicles can have insufficient cabin cooling because refrigerant leaks from the evaporator core.',
      solution: 'Have a Genesis dealer inspect the air-conditioning system for leakage under bulletin 11020939 and replace the evaporator core when the bulletin criteria are satisfied.',
      symptoms: ['Insufficient cabin cooling'],
      affectedSystems: ['air-conditioning system', 'evaporator core'],
      sources: [{ type: 'tsb', title: 'Genesis Bulletin 11020939 - Evaporator-Core Leakage', url: tsb.evaporator }],
      summary: 'Replaced forum speculation about blend doors and compressors with the documented evaporator-core leak diagnosis and remedy.',
    },
    'The frozen card generalized one-side cooling and several possible causes, costs and warranty outcomes from forums and repair aggregators rather than Genesis service evidence.',
  ),

  'genesis-gv70-electrified-range': replacement(
    {
      years: [2023],
      trims: ['Electrified GV70'],
      category: 'electrical',
      title: 'Intermittent Charging Stop and P1ABD00 Software Update',
      description: 'Genesis bulletin 10238386 covers a Vehicle Charge Management System software update for the 2023 Electrified GV70. It may address intermittent charging stops or an EV warning light with DTC P1ABD00 for excessive battery-charger-coupler temperature.',
      solution: 'Have a Genesis dealer check for DTC P1ABD00 and apply the Vehicle Charge Management System software update described in the bulletin.',
      symptoms: ['Charging may stop intermittently', 'EV warning light'],
      affectedSystems: ['Vehicle Charge Management System', 'charging coupler temperature monitoring'],
      dtcCodes: ['P1ABD00'],
      sources: [{ type: 'tsb', title: 'Genesis Bulletin 10238386 - Electrified GV70 Charging Update', url: tsb.charging }],
      summary: 'Replaced uncited range-percentage and driving-advice claims with the exact Genesis intermittent-charging bulletin.',
    },
    'The frozen card claimed specific range-estimate behavior, cold-weather effects and a two-to-three-thousand-mile learning period without Genesis test data or a bulletin.',
  ),

  'genesis-gv70-forward-collision-avoidance-assist-phantom-unwanted-automati': replacement(
    {
      years: [2022, 2023],
      category: 'safety',
      title: 'Front Radar Warning Light and DTC C162078',
      description: 'Genesis bulletin 11016993 covers specified 2022-2023 GV70 vehicles that can show a warning light and DTC C162078 because the front radar improperly detects steel structures. The bulletin states that the Advanced Driver Assistance System functions are not affected by this condition.',
      solution: 'A Genesis dealer updates the front radar unit and completes the related adjustments specified in the shop manual.',
      symptoms: ['ADAS warning light', 'DTC C162078'],
      affectedSystems: ['front radar unit', 'ADAS warning logic'],
      dtcCodes: ['C162078'],
      sources: [{ type: 'tsb', title: 'Genesis Bulletin 11016993 - Front Radar DTC C162078', url: tsb.radar }],
      summary: 'Removed unsupported phantom-braking reports and replaced them with the documented radar-warning condition, including Genesis’s statement that ADAS operation remains available.',
    },
    'The frozen card asserted high-speed unwanted braking scenarios and advised reducing or disabling safety assistance based only on owner forums; no Genesis source substantiated those claims.',
  ),

  'genesis-gv70-fuel-pipe-to-rail-connection-leak-fire-risk': replacement(
    {
      years: [2022, 2023, 2024, 2025, 2026],
      category: 'fuel',
      title: 'Fuel-Pipe Connection Leak Recall',
      description: 'NHTSA campaign 26V229 covers certain 2022-2026 Genesis GV70 vehicles. Fuel can leak at the connection between the fuel pipe and fuel rail, increasing the risk of a fire.',
      solution: 'Check the VIN with Genesis. Dealers inspect and tighten the connection or replace the fuel pipe as necessary free of charge. A fuel odor or visible leak requires immediate professional attention.',
      severity: 'high',
      symptoms: ['Possible fuel odor', 'Possible fuel leak at the fuel-pipe connection'],
      affectedSystems: ['fuel pipe', 'fuel rail connection'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 26V229 - GV70 Fuel Pipe', url: recalls('GV70', 2022) }],
      summary: 'Kept the safety issue while replacing secondary reporting and an outdated mailing claim with the official NHTSA campaign details.',
    },
    'The frozen card cited an acknowledgement document and a news article and stated a mailing date that no longer matched the official NHTSA remedy record.',
  ),

  'genesis-gv70-headlight-assembly-moisture-condensation-buildup': replacement(
    {
      years: [2022, 2023, 2024, 2025, 2026],
      category: 'electrical',
      title: 'Exterior Lamp Condensation Guidance',
      description: 'Genesis bulletin 11025476 explains condensation in headlamps, rear combination lamps, daytime running lamps and fog lamps. It states that lamp-assembly replacement is not necessary in most cases.',
      solution: 'Follow the Genesis inspection guidance. The documented condition can usually be cleared by operating the lamps with the engine running for several minutes or through normal driving; a dealer should assess moisture that does not clear or indicates physical damage.',
      symptoms: ['Condensation or accumulated moisture inside an exterior lamp'],
      affectedSystems: ['headlamps', 'rear combination lamps', 'daytime running lamps', 'fog lamps'],
      sources: [{ type: 'tsb', title: 'Genesis Bulletin 11025476 - Lamp Condensation', url: tsb.lamps }],
      summary: 'Replaced broad owner conclusions about beam loss and premature failure with current Genesis lamp-condensation guidance.',
    },
    'The frozen card treated normal and abnormal moisture alike and asserted safety and failure consequences not established by the cited Genesis bulletin.',
  ),

  'genesis-gv70-iccu-failure-causing-loss-drive-power': replacement(
    {
      years: [2023, 2024, 2025],
      trims: ['Electrified GV70'],
      category: 'electrical',
      title: 'ICCU 12-Volt Charging and Power-Loss Recall',
      description: 'NHTSA campaign 24V868 covers certain 2023-2025 Electrified GV70 vehicles. The integrated charging control unit can become damaged and stop charging the 12-volt battery, which can result in a loss of drive power.',
      solution: 'Check the VIN with Genesis. Dealers inspect and replace the ICCU and fuse as necessary and update ICCU software free of charge. The campaign expands and replaces 24V204, so vehicles repaired under the earlier campaign need the new remedy.',
      severity: 'high',
      symptoms: ['12-volt battery may stop charging', 'Possible warning messages and loss of drive power'],
      affectedSystems: ['integrated charging control unit', 'ICCU fuse', '12-volt charging system'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 24V868 - Electrified GV70 ICCU', url: recalls('GV70%20ELECTRIFIED', 2024) }],
      summary: 'Rewrote the card to the exact superseding NHTSA campaign and removed unsupported estimates about remaining driving time and warning sequences.',
    },
    'The frozen card mixed official recall facts with forum timing estimates, an asserted audible pop and other behavior that the campaign record did not guarantee.',
  ),

  'genesis-gv70-infotainment-freeze': replacement(
    {
      years: [2022, 2023],
      category: 'electrical',
      title: 'Incomplete AVN Over-the-Air Update',
      description: 'Genesis bulletin 11002757 covers specified 2022-2023 GV70 and Electrified GV70 vehicles with the sixth-generation audio, video and navigation system that may have an incomplete over-the-air update.',
      solution: 'A Genesis dealer checks whether the update completed and, when needed, installs the applicable AVN software with the supplied USB drive.',
      symptoms: ['Incomplete AVN software update'],
      affectedSystems: ['sixth-generation AVN system', 'over-the-air update process'],
      sources: [{ type: 'tsb', title: 'Genesis Bulletin 11002757 - Incomplete AVN OTA Update', url: tsb.ota }],
      summary: 'Replaced an uncited generic freeze-and-reboot card with the exact Genesis incomplete-update condition and USB recovery procedure.',
    },
    'The frozen card asserted screen freezes, blackouts and a ten-second reset procedure across five years without a Genesis source.',
  ),

  'genesis-gv70-instrument-cluster-blank-flickering-startup': replacement(
    {
      years: [2023, 2024, 2025],
      trims: ['2025 GV70', '2023-2025 Electrified GV70'],
      category: 'electrical',
      title: 'Instrument-Panel Display Software Recall',
      description: 'NHTSA campaign 25V105 covers certain 2025 GV70 and 2023-2025 Electrified GV70 vehicles. A software error can cause the instrument-panel display to fail and hide required vehicle information.',
      solution: 'Check the VIN with Genesis. The instrument-panel display software is updated over the air or by a dealer free of charge. A failed display should be serviced before continued driving without required information.',
      severity: 'high',
      symptoms: ['Instrument-panel display may fail', 'Speedometer or warning information may be unavailable'],
      affectedSystems: ['instrument-panel display', 'display software'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 25V105 - GV70 Instrument Display', url: recalls('GV70%20ELECTRIFIED', 2025) }],
      summary: 'Corrected the frozen card’s campaign identification and scope using the official NHTSA recall record.',
    },
    'The frozen card cited secondary articles and identified recall 031G without an official source; the governing NHTSA campaign is 25V105.',
  ),

  'genesis-gv70-low-pressure-fuel-pump-impeller-failure-causing-stalling': replacement(
    {
      years: [2022, 2023],
      category: 'fuel',
      title: 'Fuel-Pump Failure and Power-Loss Recall',
      description: 'NHTSA campaign 24V282 covers certain 2022-2023 Genesis GV70 vehicles. The fuel pump can fail and cause a loss of drive power.',
      solution: 'Check the VIN with Genesis. Dealers inspect and replace the fuel-pump assembly free of charge. Campaign 24V282 expands campaign 23V630.',
      severity: 'high',
      symptoms: ['Possible fuel-pump failure', 'Possible loss of drive power'],
      affectedSystems: ['fuel-pump assembly'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 24V282 - GV70 Fuel Pump', url: recalls('GV70', 2023) }],
      summary: 'Kept the verified safety issue while removing uncited root-cause mechanics, temperature conditions and symptom details not present in the campaign record.',
    },
    'The frozen card mixed recall facts with detailed impeller, temperature, hesitation and hard-start assertions from secondary sources.',
  ),

  'genesis-gv70-paint-color-mismatch-between-plastic-trim-metal-body-panels': replacement(
    {
      years: [2022, 2023],
      category: 'body',
      title: 'Paint Clouding Under Delivery Protection Film',
      description: 'Genesis bulletin 10235566 explains that moisture can rarely become trapped under the paint-protection film applied before dealer delivery, leaving clouded spots in the paint.',
      solution: 'Have a Genesis dealer inspect the affected finish and follow bulletin 10235566 for the documented correction rather than assuming that panels require repainting.',
      symptoms: ['Clouded paint spots beneath delivery protection film'],
      affectedSystems: ['exterior paint finish', 'delivery paint-protection film'],
      sources: [{ type: 'tsb', title: 'Genesis Bulletin 10235566 - Paint Protection Film Clouding', url: tsb.paintFilm }],
      summary: 'Replaced an unsupported color-mismatch and warranty-denial narrative with the documented paint-film moisture condition.',
    },
    'The frozen card generalized owner reports about one paint color, material mismatch, dealer denials and repaint outcomes without a Genesis source.',
  ),

  'genesis-gv70-panoramic-sunroof-headliner-rattle-wind-noise': replacement(
    {
      years: [2024],
      category: 'body',
      title: 'Panoramic Sunroof Wind-Noise Alignment Bulletin',
      description: 'Genesis bulletin 10251292 covers specified 2024 GV70 and Electrified GV70 vehicles with excessive wind noise that has been isolated to the panoramic sunroof.',
      solution: 'A Genesis dealer inspects and realigns the panoramic sunroof under bulletin 10251292 after confirming that the sunroof is the source of the wind noise.',
      symptoms: ['Excessive wind noise from the panoramic sunroof area'],
      affectedSystems: ['panoramic sunroof alignment'],
      sources: [{ type: 'tsb', title: 'Genesis Bulletin 10251292 - GV70 Panoramic Sunroof Wind Noise', url: tsb.sunroofWind }],
      summary: 'Narrowed a broad rattle-and-water narrative to the model-year-specific sunroof wind-noise condition and alignment remedy.',
    },
    'The frozen card combined several noises, trapped-water claims and a different felt-and-bolt repair without a direct Genesis source for the stated scope.',
  ),

  'genesis-gv70-rear-differential-elsd-whine-repeat-carrier-failure': replacement(
    {
      years: [2022, 2023, 2024, 2025],
      category: 'drivetrain',
      title: 'Rear Differential Hum or Whine Bulletin',
      description: 'Genesis bulletin 11009768 documents a hum or whine from the rear differential at certain speeds while accelerating or decelerating on specified GV70 vehicles.',
      solution: 'A Genesis dealer follows the bulletin to inspect the noise, tighten the rear differential lock nut first and, if the noise remains, replace the rear differential or other driveline components as necessary.',
      symptoms: ['Rear differential hum or whine at certain speeds'],
      affectedSystems: ['rear differential', 'differential lock nut', 'related driveline components'],
      sources: [{ type: 'tsb', title: 'Genesis Bulletin 11009768 - Rear Differential Noise', url: tsb.differential }],
      summary: 'Kept the documented differential-noise problem and removed forum-based repeat-failure rates, warranty advice and lemon-law coaching.',
    },
    'The frozen card mixed an official bulletin with individual owner anecdotes and presented repeat carrier failure and legal strategy as established model-wide facts.',
  ),

  'genesis-gv70-sunroof-drain-clog-causing-water-leak-into-cabin': replacement(
    {
      years: [2022, 2023],
      category: 'body',
      title: 'Sunroof Drain Plug Water Leak and Gurgling',
      description: 'Genesis bulletin 11027794 covers specified 2022-2023 GV70 vehicles that can leak water into the cabin or make a sunroof gurgling noise while driving in rain because foreign material clogs the sunroof drain-hose plugs.',
      solution: 'A Genesis dealer replaces the front drain-hose plugs and modifies the rear plugs as directed in the bulletin.',
      symptoms: ['Water leakage into the cabin', 'Sunroof gurgling while driving in rain'],
      affectedSystems: ['front sunroof drain-hose plugs', 'rear sunroof drain-hose plugs'],
      sources: [{ type: 'tsb', title: 'Genesis Bulletin 11027794 - GV70 Sunroof Drain Plugs', url: tsb.sunroofDrain }],
      summary: 'Rewrote the entry to the exact Genesis drain-plug condition and repair and removed uncited mold and maintenance advice.',
    },
    'The frozen card relied on forum reports and added mold inspection and owner-maintenance advice beyond the documented Genesis repair.',
  ),

  'genesis-gv70-transmission-harness-water-leak-causing-park-to-neutral-roll': replacement(
    {
      years: [2024],
      category: 'transmission',
      title: 'Transmission-Control Harness Park-to-Neutral Recall',
      description: 'NHTSA campaign 24V205 covers certain 2024 Genesis GV70 vehicles. Water can enter the transmission-control harness, cause a short circuit and unexpectedly shift the transmission from Park to Neutral.',
      solution: 'Check the VIN with Genesis. Until repaired, turn off the ignition and apply the emergency parking brake after parking. Dealers inspect the harness and repair the connector or replace the harness and internal wiring as necessary free of charge.',
      severity: 'high',
      symptoms: ['Transmission may unexpectedly shift from Park to Neutral'],
      affectedSystems: ['transmission-control harness', 'harness connector', 'internal wiring'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 24V205 - GV70 Transmission Harness', url: recalls('GV70', 2024) }],
      summary: 'Kept the verified rollaway hazard while replacing secondary citation material with the official NHTSA campaign and remedy wording.',
    },
    'The frozen card added a supplier blanking-pin root cause that was not necessary to publish and cited a repair aggregator alongside a notification document.',
  ),
};

module.exports = buildConfig({
  label: 'Genesis GV70',
  make: 'Genesis',
  model: 'GV70',
  slug: 'genesis-gv70',
  batchId: 'genesis-gv70-full-record-cohort-142-2026-08-05',
  auditDate: '2026-08-05',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: 'a0368d5331ea559f55c5b55f86a2e103f98b56fc8852bbd96711c749a14a7b8c',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/genesis-gv70/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'genesisgv70_blind:manual-primary-source-gate',
    edge: 'genesisgv70_edge:manual-primary-source-gate',
  },
  published,
  reasons: {},
  proposalCampaigns: [],
});
