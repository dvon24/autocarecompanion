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
      source: 'manual',
      summary: card.summary,
    },
  };
}

const maverick2023Recalls =
  'https://api.nhtsa.gov/recalls/recallsByVehicle?make=Ford&model=Maverick&modelYear=2023';
const maverick2024Recalls =
  'https://api.nhtsa.gov/recalls/recallsByVehicle?make=Ford&model=Maverick&modelYear=2024';
const maverick2025Recalls =
  'https://api.nhtsa.gov/recalls/recallsByVehicle?make=Ford&model=Maverick&modelYear=2025';

const published = {
  'ford-maverick-hybrid-ecvt-issues-2022': replacement(
    {
      years: [2022, 2023],
      engines: ['2.5L full hybrid electric vehicle powertrain'],
      trims: ['Vehicles built on or before 11-Apr-2023 that meet the Ford bulletin criteria'],
      category: 'transmission',
      title: 'Hybrid Shudder or Vibration During Low-Speed Braking',
      description:
        'Ford documented a shudder or vibration on some 2022-2023 Maverick hybrid vehicles while braking at 15 mph or below as the gasoline engine shuts down and the vehicle enters electric-only operation. Ford attributes this precise condition to powertrain software rather than a failed eCVT.',
      solution:
        'Have a Ford-capable technician reproduce the symptom under the bulletin conditions and check the vehicle software level. Ford directs reprogramming the PCM and related modules. Do not replace the hybrid transmission from a generic shudder description; vibration during acceleration, turning, or at other speeds requires separate diagnosis.',
      severity: 'medium',
      symptoms: ['Shudder or vibration while braking at 15 mph or below', 'Symptom occurs as the gasoline engine shuts down for electric-only operation'],
      affectedSystems: ['Powertrain Control Module software', 'hybrid powertrain control strategy'],
      sources: [{ type: 'tsb', title: 'Ford Bulletin - 2022-2023 Maverick Hybrid Low-Speed Braking Shudder', url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10240574-0001.pdf' }],
      summary:
        'Replaced an unsupported eCVT-failure card with Ford\'s exact low-speed braking shudder condition and module-reprogramming remedy.',
    },
    'Retain Ford\'s exact hybrid braking-shudder bulletin while removing the fake Reddit citation, delayed-engagement and transmission-failure claims, fluid and clutch advice, mileage estimates, and replacement pricing.',
  ),

  'ford-maverick-12v-battery-drain-2022': replacement(
    {
      years: [2022, 2023],
      trims: ['Certain vehicles identified by VIN; prior recall repair may also require correction'],
      category: 'electrical',
      title: 'Battery-State Recall: Modules May Miss Low Charge and Cause Loss of Drive Power',
      description:
        'NHTSA campaign 24V267 covers certain 2022-2023 Maverick vehicles whose body and powertrain control modules may fail to detect a change in 12-volt battery state of charge. The undetected low charge can disable accessories such as hazard lights or cause loss of drive power. Campaigns 24V590 and 25V158 cover vehicles whose earlier recall repair may have been completed incorrectly.',
      solution:
        'Check the VIN for Ford recalls 24S24, 24S50, and 25S26 even if a prior software recall was completed. A Ford dealer recalibrates the body and powertrain control modules free of charge. A discharged battery after all applicable recall work still requires battery, charging-system, module, and key-off draw diagnosis rather than automatic battery replacement.',
      severity: 'high',
      symptoms: ['12-volt battery state may become critically low without proper module response', 'Loss of electrical accessories', 'Possible loss of drive power'],
      affectedSystems: ['12-volt battery state monitoring', 'Body Control Module', 'Powertrain Control Module'],
      sources: [
        { type: 'recall', title: 'NHTSA Maverick Recall Results - 24V267, 24V590 and 25V158', url: maverick2023Recalls },
        { type: 'recall', title: 'Ford Recall 24S24 - Battery State Detection and Loss of Power', url: 'https://www.ford.com/support/how-tos/recall/recalls-and-faqs/24s24-bronco-sport-2021-2024-and-maverick-2022-2023-loss-of-power-recall/' },
      ],
      summary:
        'Updated the card through the 2025 corrective recall and separated the safety-related module calibration from generic parasitic-drain diagnosis.',
    },
    'Retain the current safety campaigns while removing unsupported 2024 model-year coverage, mixed-engine battery-drain causes, blanket battery replacement, SSM claims, part numbers, prices, and owner-report counts.',
  ),

  'ford-maverick-25-hybrid-engine-fire-2022': replacement(
    {
      years: [2022, 2023],
      engines: ['2.5L hybrid electric vehicle powertrain'],
      trims: ['Certain vehicles identified by VIN; prior recall repair may also require correction'],
      category: 'engine',
      title: 'Hybrid Engine-Failure Fire Recall and 2025 Corrective Recall',
      description:
        'NHTSA campaign 23V380 covers certain 2022-2023 Maverick hybrids. If an engine fails, oil and fuel vapor can enter the engine compartment and accumulate near hot components, increasing fire risk. Campaign 25V345 covers vehicles whose 23V380 repair may have been completed incorrectly.',
      solution:
        'Check the VIN for Ford recalls 23S27 and 25S54, including after any earlier 22S47 or 23S27 service. If there is unexpected engine noise, reduced power, or smoke, park safely and shut off the engine promptly. The 23S27 remedy updates PCM software and replaces the long block when connecting-rod bearing failure is detected; the corrective campaign repeats the required software update. Covered recall work is free of charge.',
      severity: 'high',
      symptoms: ['Unexpected engine noise', 'Reduced engine power', 'Smoke from the engine compartment'],
      affectedSystems: ['2.5L hybrid engine', 'connecting-rod bearings', 'Powertrain Control Module software'],
      sources: [
        { type: 'recall', title: 'NHTSA Campaigns 23V380 and 25V345 / Ford 23S27 and 25S54', url: maverick2023Recalls },
        { type: 'recall', title: 'Ford Recall 23S27 - Hybrid Engine Failure and Fire Risk', url: 'https://www.ford.com/support/how-tos/recall/recalls-and-faqs/23s27-escape-2020-2023-and-maverick-2022-2023-engine-failure-recall/' },
      ],
      summary:
        'Updated the superseding engine-fire campaign through the 2025 incorrect-repair recall and stated the conditional long-block remedy accurately.',
    },
    'Retain the exact safety actions while removing automatic engine-block or oil-pan breach, universal engine replacement, settlement, price, and reimbursement claims not supported by the recall record.',
  ),

  'ford-maverick-infotainment-freeze-2022': replacement(
    {
      years: [2022, 2023, 2024],
      trims: ['Certain vehicles covered by Ford Customer Satisfaction Program 24B47'],
      category: 'electrical',
      title: 'Program 24B47: SYNC Software Instability and Black Screen',
      description:
        'Ford Customer Satisfaction Program 24B47 covers certain vehicles with SYNC software that may become unstable, show a black infotainment screen, lose language or radio-preset settings, or become unable to install software updates. Ford states that the black infotainment-screen condition in this program does not disable the rearview camera.',
      solution:
        'Have Ford verify the VIN, program eligibility, and installed SYNC software. The program directs updating SYNC software. Check current program status before assuming coverage, and diagnose camera loss, power faults, wiring, or a screen that remains blank after the update separately rather than automatically replacing the APIM.',
      severity: 'low',
      symptoms: ['Black infotainment screen while the rearview camera remains available', 'SYNC instability', 'Lost language or radio-preset settings', 'Software update failure'],
      affectedSystems: ['SYNC software', 'infotainment display and saved settings'],
      sources: [{ type: 'tsb', title: 'Ford Customer Satisfaction Program 24B47 - SYNC Software Update', url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-11006036-0001.pdf' }],
      summary:
        'Replaced a fake forum citation with Ford\'s exact 24B47 software symptoms, update action, and distinction from rearview-camera loss.',
    },
    'Retain the exact Ford program while removing a fake Reddit URL, unsupported 2025 coverage, generic fuse resets, APIM replacement, hardware-failure assertions, and repair-price claims.',
  ),

  'ford-maverick-integrated-park-module-rollaway': replacement(
    {
      years: [2025, 2026],
      engines: ['2.5L hybrid'],
      trims: ['Certain vehicles identified by VIN'],
      category: 'transmission',
      title: 'Recall 25C69: Integrated Park Module May Not Lock in Park',
      description:
        'NHTSA campaign 25V863 covers certain 2025-2026 Maverick vehicles whose integrated park module may fail to lock the transmission when Park is selected. Loss of park function can allow an unattended vehicle to roll away.',
      solution:
        'Check the VIN for Ford recall 25C69 and use the parking brake whenever parked. Ford supplies the park-module software update over the air or through a dealer free of charge. If Park does not hold, keep people clear of the vehicle and arrange service rather than relying on the selector indication.',
      severity: 'high',
      symptoms: ['Vehicle may move after Park is selected', 'Park function may not hold the vehicle'],
      affectedSystems: ['integrated park module', 'park-pawl control software'],
      sources: [
        { type: 'recall', title: 'NHTSA Campaign 25V863 Recall Acknowledgement', url: 'https://static.nhtsa.gov/odi/rcl/2025/RCAK-25V863-3736.pdf' },
        { type: 'recall', title: 'NHTSA 2025 Maverick Recall Results - Campaign 25V863', url: maverick2025Recalls },
      ],
      summary:
        'Retained the current rollaway recall with the exact 2025-2026 population, parking-brake precaution, and OTA-or-dealer software remedy.',
    },
    'Retain the exact current safety recall while removing secondary media and any implication that every Maverick hybrid is affected.',
  ),

  'ford-maverick-v2-rear-view-camera-freeze-recall': replacement(
    {
      years: [2022, 2023, 2024],
      trims: ['Certain vehicles identified by VIN; 24S59 specifically covers Connected Touch Radio-equipped vehicles'],
      category: 'electrical',
      title: 'Rearview-Camera Software Recalls: Frozen, Blank, or Persistent Image',
      description:
        'NHTSA campaign 24V684 covers certain 2022-2024 Maverick vehicles with a Connected Touch Radio whose rearview image can freeze in Reverse. Campaign 25V442 covers certain 2022-2024 Mavericks whose camera software can produce a blank image or leave the rear image displayed after the backing event ends. Each condition can reduce rear visibility or distract the driver.',
      solution:
        'Check the VIN for Ford recalls 24S59 and 25S72 even if an earlier camera update was completed. Ford dealers install the applicable Connected Touch Radio or rearview-camera software update free of charge. Continue direct visual checks while reversing; hardware, wiring, or camera faults that remain after current software require separate diagnosis.',
      severity: 'high',
      symptoms: ['Rearview image freezes while reversing', 'Blank rearview image', 'Rearview image remains after shifting out of Reverse'],
      affectedSystems: ['Connected Touch Radio software', 'rearview-camera software and display'],
      sources: [
        { type: 'recall', title: 'NHTSA Maverick Recall Results - Campaigns 24V684 and 25V442', url: maverick2023Recalls },
        { type: 'recall', title: 'NHTSA 24V684 Recall Report', url: 'https://static.nhtsa.gov/odi/rcl/2024/RCLRPT-24V684-3061.PDF' },
      ],
      summary:
        'Updated the frozen-image card with the later 25S72 blank/persistent-image campaign and kept the two software remedies distinct.',
    },
    'Retain the exact camera safety campaigns while removing the secondary media citation and requiring VIN/equipment verification.',
  ),

  'ford-maverick-v2-windshield-wiper-motor-recall': replacement(
    {
      years: [2023, 2024],
      trims: ['Certain vehicles identified by VIN'],
      category: 'electrical',
      title: 'Recall 24S51: Front Wiper Motor May Fail',
      description:
        'NHTSA campaign 24V594 covers certain 2023-2024 Maverick vehicles whose front windshield-wiper motor may become inoperative. Loss of the wipers can reduce visibility in rain or snow and increase crash risk.',
      solution:
        'Check the VIN for Ford recall 24S51. A Ford dealer inspects the windshield-wiper motor and replaces it when necessary, free of charge. Do not continue driving in conditions that require wipers if they stop operating.',
      severity: 'high',
      symptoms: ['Front windshield wipers stop operating'],
      affectedSystems: ['front windshield-wiper motor'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 24V594 / Ford Recall 24S51', url: maverick2024Recalls }],
      summary:
        'Replaced two secondary articles with the direct NHTSA recall population, risk, and inspect-or-replace remedy.',
    },
    'Retain the exact safety recall while removing unrelated wiper-industry coverage and requiring VIN verification.',
  ),

  'ford-maverick-v3-8f35-shudder-buck-jerk': replacement(
    {
      years: [2022, 2023, 2024, 2025, 2026],
      engines: ['Vehicles equipped with the 8F35 automatic transmission'],
      trims: ['Vehicles that meet Ford SSM 54939 diagnostic criteria'],
      category: 'transmission',
      title: '8F35 Torque-Converter Shudder Below 60 mph',
      description:
        'Ford SSM 54939 applies to some 2022-2026 Maverick vehicles with the 8F35 transmission that shudder below 60 mph without relevant PCM diagnostic codes. The sensation can resemble an engine misfire and may be caused by the torque converter.',
      solution:
        'A technician should follow Ford Workshop Manual Pinpoint Test K for torque-converter clutch operation. Only when that test directs replacement does Ford call for replacing the torque converter and seal, removing and thoroughly cleaning the main control valve body, and reassembling the transmission under service procedures. Do not condemn the transmission from feel alone.',
      severity: 'medium',
      symptoms: ['Shudder most noticeable below 60 mph', 'Misfire-like vibration with no relevant PCM codes'],
      affectedSystems: ['8F35 automatic transmission', 'torque converter', 'main control valve body'],
      sources: [{ type: 'tsb', title: 'Ford SSM 54939 - 8F35 Torque-Converter Shudder', url: 'https://static.nhtsa.gov/odi/tsbs/2026/MC-11034017-0001.pdf' }],
      summary:
        'Replaced two bulletins for unrelated Ford models with Ford\'s current Maverick-specific 8F35 diagnostic and conditional repair procedure.',
    },
    'Retain the current exact Ford communication while removing the false early-2022-only scope, unrelated Edge/Nautilus and Transit Connect bulletins, output-carrier bearing theory, media claims, and repair prices.',
  ),

  'ford-maverick-v3-engine-block-heater-fire-risk-25sa4': replacement(
    {
      years: [2022, 2023, 2024],
      engines: ['Vehicles equipped with an engine block heater'],
      trims: ['Certain vehicles identified by VIN'],
      category: 'electrical',
      title: 'Recall 25SA4: Cracked Block Heater Can Leak Coolant and Short Circuit',
      description:
        'NHTSA campaign 25V685 covers certain 2022-2024 Maverick vehicles whose engine block heater may crack, leak coolant, and short circuit while plugged in, increasing fire risk.',
      solution:
        'Do not plug in the engine block heater until the VIN-specific recall remedy is completed. Ford\'s final remedy is expected in September 2026 and includes free block-heater replacement, with an alternative to install a threaded blanking plug and remove the electrical cord. Check the VIN and current parts availability with Ford.',
      severity: 'high',
      symptoms: ['Possible coolant leak at the block heater', 'Electrical short or heat damage while the heater is plugged in'],
      affectedSystems: ['engine block heater', 'block-heater electrical cord', 'engine coolant sealing'],
      sources: [{ type: 'recall', title: 'NHTSA Campaign 25V685 / Ford Recall 25SA4', url: maverick2024Recalls }],
      summary:
        'Replaced media and forum citations with the current NHTSA campaign, do-not-plug interim warning, and anticipated final remedy timing.',
    },
    'Retain the exact current safety recall while removing secondary citations and unsupported failure-rate or repair assumptions.',
  ),

  'ford-maverick-v3-hpcm-forced-neutral-recall': replacement(
    {
      years: [2022, 2023, 2024],
      engines: ['2.5L full hybrid electric vehicle powertrain'],
      trims: ['Certain vehicles identified by VIN; prior recall repair may also require correction'],
      category: 'transmission',
      title: 'HPCM Recalls: Software Can Shift the Hybrid Powertrain into Neutral',
      description:
        'NHTSA campaign 24V330 covers certain 2022-2024 Maverick hybrids whose Hybrid Powertrain Control Module software can shift the vehicle into Neutral unexpectedly and cause loss of drive power. Campaign 25V133 covers vehicles whose earlier 24V330 repair may have been completed incorrectly.',
      solution:
        'Check the VIN for Ford recalls 24S33 and 25S16 even if the earlier update was completed. A Ford dealer installs the current HPCM software free of charge. If the vehicle unexpectedly loses drive power, move out of traffic if possible, activate hazard lights, and arrange service.',
      severity: 'high',
      symptoms: ['Unexpected shift into Neutral while driving', 'Sudden loss of drive power'],
      affectedSystems: ['Hybrid Powertrain Control Module software', 'hybrid transmission control'],
      sources: [
        { type: 'recall', title: 'NHTSA Campaigns 24V330 and 25V133 / Ford 24S33 and 25S16', url: maverick2023Recalls },
        { type: 'recall', title: 'NHTSA 25V133 Corrective Recall Owner Letter', url: 'https://static.nhtsa.gov/odi/rcl/2025/RCONL-25V133-6849.pdf' },
      ],
      summary:
        'Updated the card with the 2025 corrective recall for previously incorrect HPCM software repairs and the current VIN re-check instruction.',
    },
    'Retain the exact original and corrective safety campaigns while removing the non-primary aggregator citation and any implication that an earlier update guarantees completion.',
  ),
};

const reasons = {
  'ford-maverick-20-ecoboost-hesitation-2022':
    'The frozen card turns one owner-forum discussion into a four-model-year cold-start calibration, fuel-quality, carbon, transmission, spark-plug, fuel-pump, and throttle-body defect with fuel-brand and warm-up advice, but no Ford bulletin defines that population or remedy.',
  'ford-maverick-bed-flex-creak-2022':
    'Both citations use fabricated-looking placeholder URLs, and the frozen card combines normal body movement, loose bolts, welds, bushings, rails, liners, tonneau covers, towing loads, corrosion, lubricants, and structural damage without a Ford-defined condition.',
  'ford-maverick-cvt-judder-2022':
    'The only citation is a fabricated-looking placeholder video URL, and the card duplicates the hybrid shudder topic while adding transmission-fluid, motor-generator, software, mount, clutch, and full-eCVT-replacement claims across four years without a Ford primary source.',
  'ford-maverick-hybrid-fan-noise-2022':
    'The only citation is the same fabricated-looking placeholder video used by the bed card, and the frozen record applies one dirty-filter, blocked-duct, sensor, bearing, fan-motor, software, battery-health, climate-use, cleaning, replacement, and price narrative to every hybrid year without a Ford bulletin.',
  'ford-maverick-rear-window-seal-2022':
    'The only citation is a video URL and the frozen card combines rear-glass adhesive, body seams, high-mounted stop lamp, trim, carpet, mold, corrosion, water testing, urethane, glass replacement, and repair prices across all model years without a Ford-defined failure population.',
};

module.exports = buildConfig({
  label: 'Ford Maverick',
  make: 'Ford',
  model: 'Maverick',
  slug: 'ford-maverick',
  batchId: 'ford-maverick-full-record-cohort-127-2026-08-05',
  auditDate: '2026-08-05',
  snapshotHash: '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash: '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash: 'aaad13fbf3c87e5f85c1b8cd23a20639c8279a00e7933cb4b8892fcc76807b07',
  packetRelativePath: 'data/known-issues-catalog-deeplink-work/ford-maverick/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'fordmaverick_blind:manual-primary-source-gate',
    edge: 'fordmaverick_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [],
});
