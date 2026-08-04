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

const ballJointRecall = {
  years: [2021, 2022, 2023, 2024, 2025, 2026],
  trims: ['Vehicles included in Ford recall 26S36 / NHTSA 26V340'],
  engines: [],
  category: 'suspension',
  title: 'Front Lower Control-Arm Ball Joint Can Separate (Do Not Drive Recall)',
  description:
    'NHTSA campaign 26V340, Ford recall 26S36, covers certain 2021-2026 Bronco Sport vehicles. A front lower control-arm ball joint may have been installed or repaired incorrectly at the assembly plant, allowing the control arm to disconnect from the front wheel knuckle. Separation can cause loss of vehicle control and increase crash risk.',
  solution:
    'Do not drive an affected vehicle until the recall remedy is completed. Check the VIN with Ford or NHTSA. Dealers inspect and repair the front lower control-arm ball joints as necessary free of charge. The recall record does not establish the frozen clunk, wandering, alignment, tire-wear, or wheel-detachment warning list.',
  severity: 'high',
  symptoms: ['Front lower control arm disconnects from the wheel knuckle', 'Loss of vehicle control'],
  affectedSystems: ['front lower control arms', 'front lower ball joints', 'front wheel knuckles'],
  dtcCodes: [],
  sources: [{ type: 'nhtsa', title: 'NHTSA Recall API - Ford Bronco Sport (Campaign 26V340000)', url: 'https://api.nhtsa.gov/recalls/recallsByVehicle?make=Ford&model=Bronco%20Sport&modelYear=2021' }],
  source: 'manual',
  summary:
    'Replaced secondary news coverage with NHTSA campaign 26V340, preserving the exact 2021-2026 population, assembly condition, do-not-drive instruction, and free inspection-and-repair remedy.',
};

const lossOfPowerRecall = {
  years: [2021, 2022, 2023, 2024],
  trims: ['Vehicles included in Ford recall 24S24 / NHTSA 24V267'],
  engines: [],
  category: 'electrical',
  title: 'Modules May Miss Low 12-Volt Battery Charge and Cause Loss of Drive Power (Recall)',
  description:
    'Ford recall 24S24, NHTSA campaign 24V267, covers certain 2021-2024 Bronco Sport vehicles. The body and powertrain control modules may fail to detect a change in the 12-volt battery state of charge. An undetected low charge can disable electrical accessories, including hazard lights, or cause loss of drive power.',
  solution:
    'Check the VIN with Ford or NHTSA. Dealers recalibrate the body control module and powertrain control module free of charge. NHTSA later recalled some 2021-2023 vehicles for 12-volt battery degradation under 25V019, including vehicles previously repaired under 24V267, so confirm all open campaigns by VIN.',
  severity: 'high',
  symptoms: ['Loss of electrical accessories, including hazard lights', 'Loss of drive power after the 12-volt battery charge falls'],
  affectedSystems: ['12-volt battery state-of-charge monitoring', 'body control module', 'powertrain control module'],
  dtcCodes: [],
  sources: [
    { type: 'recall', title: 'Ford Recall 24S24 - Bronco Sport and Maverick Loss of Power', url: 'https://www.ford.com/support/how-tos/recall/recalls-and-faqs/24s24-bronco-sport-2021-2024-and-maverick-2022-2023-loss-of-power-recall/' },
    { type: 'nhtsa', title: 'NHTSA Recall API - Ford Bronco Sport (Campaign 24V267000)', url: 'https://api.nhtsa.gov/recalls/recallsByVehicle?make=Ford&model=Bronco%20Sport&modelYear=2021' },
  ],
  source: 'manual',
  summary:
    'Grounded the card in Ford 24S24 and NHTSA 24V267, narrowing it to the documented battery-state detection failure, safety consequences, and module-recalibration remedy while flagging the later VIN-dependent battery recall.',
};

const hotTransmissionSlip = {
  years: [2021, 2022],
  trims: ['Vehicles equipped with an 8F35 transmission and built on or before March 16, 2022'],
  engines: [],
  category: 'transmission',
  title: '8F35 Transmission Can Slip From a Stop When Hot',
  description:
    'Ford service information covers certain vehicles equipped with the 8F35 transmission and built on or before March 16, 2022, including affected 2021-2022 Bronco Sport vehicles. They may exhibit transmission slip during acceleration from a stop when hot because of damaged internal case-half pump seals.',
  solution:
    'Have a Ford dealer or qualified transmission technician confirm the build date and bulletin condition. Ford directs technicians to remove the transmission and replace the internal case-half pump seals. Diagnose a P0766 or no-reverse condition separately because this bulletin does not attribute the hot-slip condition to that solenoid code.',
  severity: 'medium',
  symptoms: ['Transmission slips during acceleration from a stop when hot'],
  affectedSystems: ['8F35 transmission', 'internal case-half pump seals'],
  dtcCodes: [],
  sources: [{ type: 'tsb', title: 'Ford SSM - 8F35 Transmission Slip From a Stop When Hot', url: 'https://static.nhtsa.gov/odi/tsbs/2022/MC-10217839-0001.pdf' }],
  source: 'manual',
  summary:
    'Retained Ford\'s exact hot-slip condition and pump-seal remedy while removing the unrelated P0766/no-reverse narrative, secondary sources, broad symptoms, and DTC blending.',
};

const absRecall = {
  years: [2023],
  trims: ['Vehicles included in Ford recall 23S01 / NHTSA 23V021'],
  engines: [],
  category: 'brakes',
  title: 'Damaged ABS Module Valves Can Increase Brake-Pedal Travel (Recall)',
  description:
    'NHTSA campaign 23V021, Ford recall 23S01, covers certain 2023 Bronco Sport vehicles. Valves inside the anti-lock brake system module may have been damaged during manufacturing, causing an internal leak. The leak can unexpectedly increase brake-pedal travel or allow unexpected movement during an Auto Hold event.',
  solution:
    'Check the VIN with Ford or NHTSA. Dealers replace the ABS module free of charge. The campaign does not establish a generic ABS warning light or soft and inconsistent pedal feel as required warning symptoms.',
  severity: 'high',
  symptoms: ['Unexpected increase in brake-pedal travel', 'Unexpected vehicle movement during an Auto Hold event'],
  affectedSystems: ['anti-lock brake system module', 'internal ABS valves', 'Auto Hold'],
  dtcCodes: [],
  sources: [{ type: 'nhtsa', title: 'NHTSA Part 573 Report - Ford Bronco Sport ABS Module (23V021)', url: 'https://static.nhtsa.gov/odi/rcl/2023/RCLRPT-23V021-4811.PDF' }],
  source: 'manual',
  summary:
    'Removed the secondary recall page and rewrote the card from NHTSA\'s Part 573 report with its exact 2023 scope, internal-valve leak, two safety effects, and free module replacement.',
};

const egrRecall = {
  years: [2025],
  trims: ['Vehicles included in Ford recall 26S10 / NHTSA 26V122'],
  engines: [],
  category: 'engine',
  title: 'EGR Valve Can Fail and Cause Unexpected Loss of Drive Power (Recall)',
  description:
    'NHTSA campaign 26V122, Ford recall 26S10, covers certain 2025 Bronco Sport vehicles. The exhaust-gas-recirculation valve may fail and cause an unexpected loss of drive power, increasing crash risk.',
  solution:
    'Check the VIN with Ford or NHTSA. Dealers replace the EGR valve free of charge. The recall record does not establish the frozen weak acceleration, vibration, rough-running, no-start, low-speed, or warning-light symptom list for every affected vehicle.',
  severity: 'high',
  symptoms: ['Unexpected loss of drive power'],
  affectedSystems: ['exhaust-gas-recirculation valve', 'engine drive-power delivery'],
  dtcCodes: [],
  sources: [{ type: 'nhtsa', title: 'NHTSA Recall API - 2025 Ford Bronco Sport (Campaign 26V122000)', url: 'https://api.nhtsa.gov/recalls/recallsByVehicle?make=Ford&model=Bronco%20Sport&modelYear=2025' }],
  source: 'manual',
  summary:
    'Replaced secondary articles and a model-level recall page with NHTSA campaign 26V122, retaining only its exact population, EGR failure, loss-of-power consequence, and free valve replacement.',
};

const cameraRecall = {
  years: [2021, 2022, 2023, 2024],
  trims: ['Vehicles included in Ford recall 25S72 / NHTSA 25V442'],
  engines: [],
  category: 'electrical',
  title: 'Rearview-Camera Software Can Show a Blank or Retained Image (Recall)',
  description:
    'NHTSA campaign 25V442, Ford recall 25S72, covers certain 2021-2024 Bronco Sport vehicles. A software error can make the rearview camera display a blank image or keep the rearview image on the screen after the backing event ends. Either condition can increase crash risk.',
  solution:
    'Check the VIN with Ford or NHTSA. Dealers update the rearview-camera software free of charge. This recall does not support merging unrelated SYNC instability, erased settings, language changes, or failed-update complaints into the safety-camera condition.',
  severity: 'high',
  symptoms: ['Blank rearview-camera image', 'Rearview-camera image remains after the backing event ends'],
  affectedSystems: ['rearview camera software', 'center display'],
  dtcCodes: [],
  sources: [{ type: 'nhtsa', title: 'NHTSA Recall API - Ford Bronco Sport (Campaign 25V442000)', url: 'https://api.nhtsa.gov/recalls/recallsByVehicle?make=Ford&model=Bronco%20Sport&modelYear=2021' }],
  source: 'manual',
  summary:
    'Separated the safety recall from a broad SYNC aggregation and rewrote it to NHTSA 25V442\'s exact blank-or-retained rearview-image condition and free software remedy.',
};

const coolantPump = {
  years: [2021, 2022, 2023, 2024],
  trims: ['Vehicles equipped with a 1.5L EcoBoost engine'],
  engines: ['1.5L EcoBoost'],
  category: 'cooling',
  title: '1.5L Coolant Pump Can Leak Because of Cooling-System Contamination',
  description:
    'Ford service information covers some 2021-2024 Bronco Sport vehicles with the 1.5L EcoBoost engine that lose engine coolant from a leaking coolant pump. Ford attributes recurrent pump leakage to contamination in the cooling system.',
  solution:
    'Have a Ford dealer or qualified technician confirm the external coolant-pump leak. Ford\'s service procedure calls for flushing the cooling system, replacing the coolant pump, and correctly filling and bleeding the system. The bulletins do not support the frozen internal coolant-intrusion, white-smoke, misfire, head-gasket, overheating, or complete-engine-failure claims.',
  severity: 'medium',
  symptoms: ['Engine coolant loss from a leaking coolant pump', 'Visible coolant-pump leak'],
  affectedSystems: ['engine cooling system', 'coolant pump'],
  dtcCodes: [],
  sources: [
    { type: 'tsb', title: 'Ford TSB 25-2063 - Bronco Sport 1.5L Coolant-Pump Leak', url: 'https://static.nhtsa.gov/odi/tsbs/2025/MC-11014866-0001.pdf' },
    { type: 'tsb', title: 'Ford TSB - Bronco Sport 1.5L Cooling-System Flush and Pump Replacement', url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-10252626-0001.pdf' },
  ],
  source: 'manual',
  summary:
    'Narrowed the coolant card to Ford\'s documented external pump leak, exact 1.5L population, contamination cause, and flush-plus-pump remedy while removing unsupported engine-failure claims.',
};

const rduShudder = {
  years: [2021, 2022, 2023, 2024],
  trims: ['Affected all-wheel-drive vehicles'],
  engines: [],
  category: 'drivetrain',
  title: 'Rear Drive Unit Can Chatter or Shudder During Low-Speed Turns',
  description:
    'Ford service information covers affected 2021-2024 Bronco Sport vehicles that exhibit chatter or shudder, most noticeably during low-speed turns, with no relevant diagnostic trouble codes. Ford identifies contamination inside the rear drive unit as the cause.',
  solution:
    'Have a Ford dealer confirm the bulletin applies and follow its current service procedure, which includes rear-drive-unit service and an AWD-module programming step for Bronco Sport vehicles. The bulletin does not describe rear-differential overheating, an AWD-disconnected warning, a burning smell, loss of traction, or limp mode.',
  severity: 'medium',
  symptoms: ['Chatter or shudder most noticeable during low-speed turns', 'No relevant diagnostic trouble codes'],
  affectedSystems: ['rear drive unit', 'rear drive unit fluid', 'all-wheel-drive module'],
  dtcCodes: [],
  sources: [{ type: 'tsb', title: 'Ford TSB - Bronco Sport Rear Drive Unit Chatter or Shudder', url: 'https://static.nhtsa.gov/odi/tsbs/2026/MC-11035099-0001.pdf' }],
  source: 'manual',
  summary:
    'Replaced forum and secondary citations with Ford\'s superseding RDU bulletin and retained only its exact 2021-2024 low-speed-turn shudder, contamination cause, and current service path.',
};

const published = {
  'ford-bronco-sport-front-lower-control-arm-ball-joint-separation-do-not-drive-r': replacement(ballJointRecall, 'Retain the current do-not-drive safety recall, replacing secondary coverage with NHTSA 26V340 and removing warning symptoms the campaign does not establish.'),
  'ford-broncosport-loss-of-power-recall-2021': replacement(lossOfPowerRecall, 'Retain Ford 24S24/NHTSA 24V267 with exact module, battery-state, safety-consequence, and recalibration details.'),
  'ford-bronco-sport-8f35-8-speed-transmission-slip-when-hot-p0766-solenoid-fault': replacement(hotTransmissionSlip, 'Retain Ford\'s exact 8F35 hot-slip bulletin while separating the unrelated P0766/no-reverse condition.'),
  'ford-bronco-sport-abs-module-internal-leak-causing-increased-brake-pedal-trave': replacement(absRecall, 'Retain NHTSA 23V021 with exact 2023 ABS valve damage, pedal-travel and Auto Hold risks, and free module replacement.'),
  'ford-bronco-sport-egr-valve-failure-causing-loss-drive-power': replacement(egrRecall, 'Retain NHTSA 26V122 with exact 2025 EGR-valve failure, loss-of-drive-power consequence, and free replacement.'),
  'ford-bronco-sport-sync-3-software-instability-black-screen-lost-settings-blank': replacement(cameraRecall, 'Retain only the directly supported 25S72/25V442 rearview-camera safety recall and remove unrelated SYNC/CSP symptom blending.'),
  'ford-broncosport-15-ecoboost-coolant-2021': replacement(coolantPump, 'Retain Ford\'s exact 1.5L coolant-pump leak and system-contamination bulletins while removing unsupported internal-intrusion and engine-failure claims.'),
  'ford-broncosport-rdu-shudder-2021': replacement(rduShudder, 'Retain Ford\'s current 2021-2024 RDU contamination bulletin and remove forum-derived scope and symptoms.'),
};

const reasons = {
  'ford-broncosport-rear-diff-overheat-2021':
    'The frozen card relies on a placeholder YouTube URL and turns an unsupported Badlands overheating claim into five years of AWD disconnection, traction loss, burning odor, reduced power, and warning-light symptoms. Ford publishes a distinct RDU contamination/shudder condition, which is retained in its own audited card.',
  'ford-broncosport-15-oil-dilution-2021':
    'The frozen card relies on a placeholder YouTube URL and combines oil dilution, oil-separator recall 22S21, fuel-injector concerns, five model years, diagnostic signs, oil-pressure loss, and fuel-consumption claims without a primary source defining that combined defect.',
  'ford-broncosport-sunroof-drain-clog-2021':
    'The frozen card relies on a placeholder YouTube URL and generalizes five years of drain blockage, headliner leakage, wet footwells, odor, and A-pillar staining without a Ford bulletin, recall, or investigation defining the condition.',
  'ford-broncosport-trans-hesitation-2021':
    'The frozen card has no citations and generalizes five years of hesitation, cold-weather delay, flare, clunk, and delayed engagement without identifying an exact transmission, build range, cause, or Ford service publication. The separate 8F35 hot-slip bulletin is retained precisely.',
  'ford-broncosport-windshield-crack-2021':
    'The frozen card relies on one Reddit thread to declare a five-year no-impact stress-cracking pattern, repeated replacements, temperature sensitivity, and rapid propagation without a Ford bulletin, recall, or investigation defining an affected population.',
};

module.exports = buildConfig({
  label: 'Ford Bronco Sport',
  make: 'Ford',
  model: 'Bronco Sport',
  slug: 'ford-bronco-sport',
  batchId: 'ford-bronco-sport-full-record-cohort-100-2026-08-04',
  auditDate: '2026-08-04',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: '975e5ca4986a15fe4098b6e8c6a5ffc88d1c2a59b9302def71ad7c708a269ad6',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/ford-bronco-sport/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'fordbroncosport_blind:manual-primary-source-gate',
    edge: 'fordbroncosport_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [],
});
