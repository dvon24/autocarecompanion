const { buildConfig } = require('./_config-buick-remaining-factory.cjs');

function replacement(card, decision) {
  return {
    disposition: 'replace',
    decision,
    evidence: card.sources.map((item) => ({
      type: item.type,
      label: item.title,
      url: item.url,
    })),
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
      source: card.source || 'nhtsa-verified',
      summary: card.summary,
    },
  };
}

const driveshaftTolerance = {
  years: [2022, 2023],
  trims: [
    'Vehicles built September 1-December 14, 2022; excludes 5.7L V8 HEMI VVT sales code EZC; verify by VIN',
  ],
  category: 'drivetrain',
  title: 'Clicking or Grinding Under Acceleration From Driveshaft Tolerance (TSB 03-002-23)',
  description:
    'FCA TSB 03-002-23 identifies a rear-driveshaft manufacturing-tolerance variation on certain 2022-2023 Dodge Challenger vehicles. The documented customer symptom is a clicking or grinding noise while accelerating.',
  solution:
    'Verify the build date, engine sales code, and VIN applicability. FCA directs technicians to replace the rear driveshaft (propeller shaft) and use new driveshaft bolts. Do not diagnose every Challenger vibration or U-joint noise as this bulletin condition.',
  severity: 'medium',
  symptoms: ['Clicking noise when accelerating', 'Grinding noise when accelerating'],
  affectedSystems: ['rear driveshaft', 'propeller shaft manufacturing tolerance'],
  dtcCodes: [],
  sources: [
    {
      type: 'tsb',
      title: 'FCA TSB 03-002-23 - Clicking or Grinding Noise When Accelerating',
      url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10239962-9999.pdf',
    },
  ],
  summary:
    'Narrowed the nine-year driveshaft-failure aggregation to FCA\'s exact 2022-2023 build window, excluded engine, acceleration noise, manufacturing cause, and rear-driveshaft replacement procedure.',
};

const frontControlArmBushings = {
  years: [2023],
  trims: ['Vehicles built February 8-9, 2023; verify by VIN'],
  category: 'suspension',
  title: 'Knock or Rattle Over Bumps From Under-Cured Front Control-Arm Bushings',
  description:
    'FCA TSB 02-008-24 identifies under-cured front lower-control-arm bushings on a narrow group of 2023 Dodge Challenger vehicles. The documented symptom is a knock or rattle while driving over bumps.',
  solution:
    'Verify the build window and VIN, inspect both lower front control-arm bushings, and replace the affected control arm followed by an alignment when required. FCA notes that the proactive North American service action no longer applies, so North American repairs should follow current Service Library diagnosis and coverage rules.',
  severity: 'medium',
  symptoms: ['Knock or rattle noise while driving over bumps'],
  affectedSystems: ['front lower control arms', 'front control-arm bushings'],
  dtcCodes: [],
  sources: [
    {
      type: 'tsb',
      title: 'FCA TSB 02-008-24 - Front Control Arm Bushings Under Cured',
      url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-11001236-0001.pdf',
    },
  ],
  summary:
    'Replaced a sixteen-year multi-component clunk aggregation with FCA\'s two-day 2023 build window, one bushing cause, exact symptom, inspection boundary, and conditional control-arm remedy.',
};

const brakeRotorLotRot = {
  years: [2015, 2016],
  trims: ['EMEA-market vehicles with four-wheel anti-lock disc brakes (sales code BR3)'],
  category: 'brakes',
  title: 'Brake Vibration From Rotor Corrosion After Dealer-Lot Inactivity',
  description:
    'FCA TSB 05-004-16 Rev. A applies to EMEA-market 2015-2016 Dodge Challenger vehicles with BR3 brakes. Inactivity on dealer lots may corrode the rotors, causing a shake or vibration in the steering wheel or seat while braking.',
  solution:
    'Confirm market and brake sales code, road-test to reproduce brake-induced pulsation, and measure the rotors using current service procedures. FCA directs resurfacing the affected rotors when within specification or replacement when they cannot be resurfaced.',
  severity: 'medium',
  symptoms: [
    'Steering-wheel shake while braking',
    'Seat vibration while braking',
    'Brake pedal pulsation associated with rotor corrosion',
  ],
  affectedSystems: ['front brake rotors', 'rear brake rotors'],
  dtcCodes: [],
  sources: [
    {
      type: 'tsb',
      title: 'FCA TSB 05-004-16 Rev. A - Vibration While Braking',
      url: 'https://static.nhtsa.gov/odi/tsbs/2016/MC-10223849-9999.pdf',
    },
  ],
  summary:
    'Replaced the universal warped-rotor and rapid-pad-wear claim with FCA\'s EMEA-only 2015-2016 BR3 rotor-corrosion condition, diagnostic test, and resurfacing-versus-replacement boundary.',
};

const rearAxleHeatTreatment = {
  years: [2021, 2022],
  trims: ['Vehicles with rear axle sales code DR2 included in FCA campaign Z74; verify by VIN'],
  category: 'drivetrain',
  title: 'Loud Rear-Axle Noise From Improperly Heat-Treated Pinion (Campaign Z74)',
  description:
    'FCA Customer Satisfaction Notification Z74 covers a small VIN-defined group of 2021-2022 Dodge Challenger vehicles. A rear-axle pinion may not have been properly heat treated, leaving it too soft; the axle noise can become louder and progress to increasing vibration.',
  solution:
    'Check the VIN for campaign Z74. FCA\'s campaign remedy is replacement of the complete rear axle assembly. Do not apply this remedy to general differential whine without confirming the sales code and VIN-defined campaign population.',
  severity: 'medium',
  symptoms: ['Loud noise from the rear axle', 'Rear-axle noise becomes progressively louder', 'Increasing vibration while driving'],
  affectedSystems: ['rear axle pinion', 'rear differential assembly'],
  dtcCodes: [],
  sources: [
    {
      type: 'tsb',
      title: 'FCA Customer Satisfaction Notification Z74 - Rear Axle',
      url: 'https://static.nhtsa.gov/odi/tsbs/2022/MC-10227728-9999.pdf',
    },
  ],
  summary:
    'Narrowed the broad 2009-2019 differential-whine card to FCA\'s VIN-scoped 2021-2022 DR2 rear-pinion heat-treatment condition and complete axle replacement campaign.',
};

const acPcmSoftware = {
  years: [2023],
  trims: ['Vehicles with 6.2L supercharged HEMI V8 (ESD) and six-speed manual transmission (DEC)'],
  category: 'hvac',
  title: 'A/C Stops Cooling at High Ambient Temperature or While Stationary',
  description:
    'FCA TSB 18-087-24 identifies PCM software on certain 2023 manual-transmission 6.2L Challenger vehicles as the cause of inoperative air conditioning above 89 degrees F (32 degrees C), or cooling that stops while stationary and resumes in motion.',
  solution:
    'Confirm the engine and transmission sales codes and reproduce the exact condition. After ruling out other HVAC faults under current service procedures, FCA directs technicians to reprogram the PCM with the latest available software.',
  severity: 'low',
  symptoms: ['Air conditioning inoperative above 89 degrees F (32 degrees C)', 'A/C stops cooling while stationary and resumes in motion'],
  affectedSystems: ['powertrain control module software', 'air-conditioning operation'],
  dtcCodes: [],
  sources: [
    {
      type: 'tsb',
      title: 'FCA TSB 18-087-24 - PCM Update for A/C Operation',
      url: 'https://static.nhtsa.gov/odi/tsbs/2024/MC-11011912-0001.pdf',
    },
  ],
  summary:
    'Replaced the sixteen-year blend-door and refrigerant aggregation with FCA\'s exact 2023 6.2L/manual PCM-software condition and flash remedy.',
};

const catalystCodesPcmSoftware = {
  years: [2019],
  trims: ['Vehicles with 5.7L V8 HEMI (EZH or EZC) and 8HP70 automatic (DFK) or six-speed manual (DEC)'],
  category: 'emissions',
  title: 'P0420/P0430 May Require a PCM Software Update Before Catalyst Replacement',
  description:
    'FCA TSB 18-090-24 applies to certain 2019 5.7L Dodge Challenger vehicles. PCM software can set P0420 or P0430, so those codes alone do not establish that a catalytic converter has failed.',
  solution:
    'Confirm the exact engine and transmission sales codes, scan for the documented DTC, and follow current FCA diagnosis for any other conditions. If the bulletin applies, reprogram the PCM with the latest software before considering catalyst replacement.',
  severity: 'low',
  symptoms: ['Malfunction indicator lamp', 'P0420 stored', 'P0430 stored'],
  affectedSystems: ['powertrain control module software', 'catalyst-efficiency diagnostics'],
  dtcCodes: ['P0420', 'P0430'],
  sources: [
    {
      type: 'tsb',
      title: 'FCA TSB 18-090-24 - 2019 Challenger PCM Updates',
      url: 'https://static.nhtsa.gov/odi/tsbs/2025/MC-11012186-0001.pdf',
    },
  ],
  summary:
    'Removed the universal catalytic-converter-failure diagnosis and replacement commerce; retained FCA\'s exact 2019 5.7L P0420/P0430 software condition and PCM-flash path.',
};

const demonHoodBezel = {
  years: [2018],
  trims: ['Dodge Challenger SRT Demon vehicles included in RRT 19-099; verify by VIN'],
  category: 'exterior',
  title: 'Warped Demon Hood Bezel Can Chip Paint Around the Opening',
  description:
    'FCA TSB 23-013-20 identifies a warped hood bezel on certain 2018 Dodge Challenger Demon vehicles. The warped bezel can damage or chip paint along the sides and corners of the hood-bezel opening.',
  solution:
    'Verify VIN applicability, replace the hood bezel, inspect the hood for paint damage, and refinish the complete hood when FCA\'s inspection finds damage. This bulletin does not establish a Challenger-wide clear-coat defect.',
  severity: 'low',
  symptoms: ['Hood bezel appears warped', 'Paint chipped at the sides or corners of the hood-bezel opening'],
  affectedSystems: ['hood bezel', 'hood paint finish'],
  dtcCodes: [],
  sources: [
    {
      type: 'tsb',
      title: 'FCA TSB 23-013-20 - Hood Bezel Warped and Hood Paint Damaged',
      url: 'https://static.nhtsa.gov/odi/tsbs/2020/MC-10174210-9999.pdf',
    },
  ],
  summary:
    'Narrowed the sixteen-year clear-coat and paint-blistering aggregation to FCA\'s VIN-scoped 2018 Demon hood-bezel condition and bezel/paint remedy.',
};

const starterCableRecall = {
  years: [2013],
  trims: ['V6 vehicles manufactured December 3, 2012-January 24, 2013 and included in recall 13V-103; verify by VIN'],
  category: 'electrical',
  title: 'Starter B+ Cable Can Short and Cause a Fire (Recall 13V-103)',
  description:
    'NHTSA recall 13V-103 covers certain 2013 V6 Dodge Challenger vehicles. The starter-motor battery-positive cable terminal can short to the starter solenoid, creating a vehicle-fire risk without warning.',
  solution:
    'Check the VIN for recall 13V-103/N18. The recall instructions advised affected owners to stop driving and not park in or near structures until repaired. An authorized dealer replaces the underhood starter cable assembly free of charge.',
  severity: 'high',
  symptoms: ['Electrical short at the starter connection', 'Vehicle fire may occur without warning'],
  affectedSystems: ['starter-motor B+ cable assembly', 'starter solenoid connection'],
  dtcCodes: [],
  sources: [
    {
      type: 'recall',
      title: 'NHTSA Recall 13V-103 - Challenger Starter Cable Short',
      url: 'https://static.nhtsa.gov/odi/rcl/2013/RCDNN-13V103-7284.pdf',
    },
  ],
  summary:
    'Retained the exact 2013 V6 starter-cable recall while removing secondary media, price estimates, mileage claims, and parts-commerce paths that could bypass the free recall remedy.',
};

const evapCodesPcmSoftware = {
  years: [2022],
  trims: ['Vehicles with 6.4L SRT HEMI engine sales code ESG or ESH'],
  category: 'emissions',
  title: 'P0440/P0441/P0455/P0456 May Be Caused by PCM Software',
  description:
    'FCA TSBs 18-095-23 and 18-096-23 identify PCM software as the cause of P0440, P0441, P0455, or P0456 on certain 2022 6.4L Dodge Challenger vehicles. These codes do not, by themselves, prove that the ESIM, gas cap, or another EVAP component has failed.',
  solution:
    'Confirm engine sales code and stored DTCs. For P0456, use FCA\'s wiTECH Small Leak Verification Test to determine whether a physical leak exists. If the bulletin applies and other faults are not present, reprogram the PCM with the latest software.',
  severity: 'low',
  symptoms: ['Malfunction indicator lamp', 'P0440 stored', 'P0441 stored', 'P0455 stored', 'P0456 stored'],
  affectedSystems: ['powertrain control module software', 'EVAP leak diagnostics'],
  dtcCodes: ['P0440', 'P0441', 'P0455', 'P0456'],
  sources: [
    {
      type: 'tsb',
      title: 'FCA TSB 18-095-23 - 2022 Challenger 6.4L ESH PCM Update',
      url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10243280-9999.pdf',
    },
    {
      type: 'tsb',
      title: 'FCA TSB 18-096-23 - 2022 Challenger 6.4L ESG PCM Update',
      url: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10243283-9999.pdf',
    },
  ],
  summary:
    'Replaced the sixteen-year ESIM-failure aggregation with FCA\'s exact 2022 6.4L code set, PCM-software cause, leak-test boundary, and flash remedy.',
};

const keyProgrammingSecurity = {
  years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022],
  trims: ['Security feature availability varies by model year, engine, radio, and VIN; confirm with an authorized Dodge dealer'],
  category: 'safety',
  title: 'Key-Programming Theft Exposure and Dodge Security Measures',
  description:
    'Dodge documented a theft method in which a thief gains physical access to the vehicle electronics and programs a new key fob. Dodge announced Enhanced Security Mode, Key Programming Lockdown, and a 2022 Intrusion Module to reduce that risk; availability and function differ by model year and configuration.',
  solution:
    'Ask an authorized Dodge dealer which current security updates are available for the VIN. Dodge\'s announcement says 2021 392 and SRT Hellcat vehicles could receive Enhanced Security Mode by dealer reflash, the Key Programming Lockdown rollout targeted 2015-2021 vehicles, and the Intrusion Module was standard or optional on 2022 models. The announcement\'s rollout dates are historical, so confirm current availability before relying on any feature.',
  severity: 'high',
  symptoms: ['Unauthorized key fob may be programmed after physical access to vehicle electronics', 'Vehicle can be started and driven with the newly programmed key'],
  affectedSystems: ['key-fob programming', 'vehicle security software', 'intrusion detection'],
  dtcCodes: [],
  sources: [
    {
      type: 'manual',
      title: 'Dodge - Three New Theft Protection Measures',
      url: 'https://www.dodge.com/news/theft-protection-features.html',
    },
  ],
  source: 'manual',
  summary:
    'Replaced the vague relay-attack and merchandise card with Dodge\'s documented key-programming attack path, three named security measures, precise model-year boundaries, and a warning to confirm current VIN availability.',
};

const radiatorHoseWeep = {
  years: [2015],
  trims: ['Vehicles built August 19, 2014-February 20, 2015 with 6.2L ESD or 6.4L ESG/ESH engines'],
  category: 'cooling',
  title: 'Coolant Weep at the Upper Radiator-Hose Connection',
  description:
    'FCA TSB 07-005-15 Rev. A covers certain 2015 Dodge Challenger 6.2L and 6.4L vehicles. A small number may show slight coolant weepage at the upper radiator-hose connection to the radiator.',
  solution:
    'Confirm the build date and engine sales code, inspect the upper radiator-hose connection, and follow FCA\'s procedure to install the additional clamp when the bulletin condition is present. Do not infer complete radiator failure from a coolant trace at this joint.',
  severity: 'medium',
  symptoms: ['Slight coolant weepage underhood', 'Coolant visible at the upper radiator-hose connection'],
  affectedSystems: ['upper radiator hose', 'radiator inlet connection'],
  dtcCodes: [],
  sources: [
    {
      type: 'tsb',
      title: 'FCA TSB 07-005-15 Rev. A - Upper Radiator Hose Coolant Weep',
      url: 'https://static.nhtsa.gov/odi/tsbs/2015/MC-10150526-9999.pdf',
    },
  ],
  summary:
    'Replaced the eleven-year premature-radiator-failure card with FCA\'s exact 2015 HEMI build window, upper-hose joint, slight-weeping symptom, and additional-clamp remedy.',
};

const rearviewCameraRecall = {
  years: [2019],
  trims: ['Vehicles with 8.4-inch or 12-inch radio displays included in recall 20V-191; verify by VIN'],
  category: 'safety',
  title: 'Rearview Image Can Remain After Shifting Out of Reverse (Recall 20V-191)',
  description:
    'NHTSA recall 20V-191 covers certain 2019 Dodge Challenger vehicles. A radio-software error can leave the rearview-camera image on screen after the vehicle is shifted out of reverse, creating a driver-distraction risk and an FMVSS 111 noncompliance.',
  solution:
    'Check the VIN for recall W30-W37/20V-191. FCA\'s remedy is a free radio-display software update, performed by a dealer or, where offered for the vehicle, by the official over-the-air update.',
  severity: 'high',
  symptoms: ['Rearview-camera image remains displayed after shifting out of reverse'],
  affectedSystems: ['radio display software', 'rearview camera display'],
  dtcCodes: [],
  sources: [
    {
      type: 'recall',
      title: 'NHTSA Recall 20V-191 - Rearview Image Remains on Display',
      url: 'https://static.nhtsa.gov/odi/rcl/2020/RCAK-20V191-1841.pdf',
    },
  ],
  summary:
    'Kept the exact 2019 FMVSS 111 software recall, replaced the secondary citation with a direct NHTSA campaign document, and removed all unrelated Uconnect claims and commerce.',
};

const alternatorRecall = {
  years: [2011, 2012, 2013, 2014],
  trims: ['EHPS-equipped vehicles with 3.6L or 5.7L engines and affected 160-, 180-, or 220-amp alternators; verify by VIN'],
  category: 'electrical',
  title: 'Alternator Diode Failure Can Cause Stall or Fire (Recalls P60/T36)',
  description:
    'NHTSA recalls 14V-634 and 17V-435 cover defined 2011-2014 Dodge Challenger populations. Thermal fatigue can cause alternator diodes to fail with little warning, resulting in loss of charging, a sudden stall, or a resistive short that produces heat, smoke, or fire.',
  solution:
    'Check the VIN for recall P60/14V-634 or T36/17V-435. FCA\'s remedy is inspection of the alternator part number and free replacement when required. Do not buy an alternator from this symptom alone before checking recall eligibility.',
  severity: 'high',
  symptoms: ['Battery-saver warning may appear shortly before failure', 'Sudden loss of charging', 'Vehicle stalls without warning', 'Heat, smoke, or fire may originate in the alternator'],
  affectedSystems: ['alternator diodes', 'vehicle charging system', 'electro-hydraulic power steering electrical load'],
  dtcCodes: [],
  sources: [
    {
      type: 'recall',
      title: 'NHTSA Recall 14V-634 - 160-Amp Alternator Failure',
      url: 'https://static.nhtsa.gov/odi/rcl/2014/RCLRPT-14V634-8320.PDF',
    },
    {
      type: 'recall',
      title: 'NHTSA Recall 17V-435 - Expanded Alternator Failure Population',
      url: 'https://static.nhtsa.gov/odi/rcl/2017/RCLRPT-17V435-8916.PDF',
    },
  ],
  summary:
    'Preserved the common alternator-diode mechanism across the two FCA recalls while restricting the population to recalled engine, EHPS, alternator, and VIN combinations and removing costs and parts links.',
};

const takataDriverRecall = {
  years: [2008, 2009, 2010],
  trims: ['Vehicles manufactured September 19, 2007-October 29, 2010 and included in recall 15V-444; verify by VIN'],
  category: 'safety',
  title: 'Do Not Drive: Driver Airbag Inflator Can Rupture (Recall 15V-444)',
  description:
    'NHTSA recall 15V-444/R37 covers certain 2008-2010 Dodge Challenger vehicles. Moisture exposure over time can make the driver frontal-airbag inflator rupture during deployment and propel metal fragments into occupants, causing serious injury or death.',
  solution:
    'Do not drive an affected vehicle until the recall repair is complete. Check the VIN for recall R37/15V-444 and arrange free replacement of the driver-airbag inflator through an authorized Dodge dealer.',
  severity: 'high',
  symptoms: ['No reliable warning before inflator rupture', 'Metal fragments may strike occupants during driver-airbag deployment'],
  affectedSystems: ['driver frontal-airbag inflator'],
  dtcCodes: [],
  sources: [
    {
      type: 'recall',
      title: 'FCA Safety Recall R37 / NHTSA 15V-444 - Driver Airbag Inflator',
      url: 'https://static.nhtsa.gov/odi/rcl/2015/RCRIT-15V444-8889.pdf',
    },
  ],
  summary:
    'Retained the exact stop-drive Takata campaign with a direct FCA/NHTSA service document and removed secondary media, generic airbag language, pricing, and all non-recall repair paths.',
};

const uconnectSoftware = {
  years: [2018, 2019, 2020, 2021],
  trims: ['North American vehicles built April 1, 2017-May 24, 2021 with Uconnect 4C 8.4-inch UAS or UCS radio'],
  category: 'electrical',
  title: 'Intermittent Black Screen or Radio Freeze on Uconnect 4C',
  description:
    'FCA TSB 08-102-21 Rev. A documents intermittent black displays and radio freezes, among other listed software symptoms, on certain 2018-2021 Dodge Challenger vehicles equipped with UAS or UCS Uconnect 4C radios.',
  solution:
    'Confirm radio sales code, build date, market, and the exact symptom. After checking for unrelated DTCs or hardware faults, FCA directs inspection of the current software level and an update to version 39.5 when required.',
  severity: 'medium',
  symptoms: ['Intermittent black radio display', 'Intermittent radio freeze'],
  affectedSystems: ['Uconnect 4C radio software', '8.4-inch radio display'],
  dtcCodes: [],
  sources: [
    {
      type: 'tsb',
      title: 'FCA TSB 08-102-21 Rev. A - UAS/UCS Radio Enhancements',
      url: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10204379-9999.pdf',
    },
  ],
  summary:
    'Narrowed the nine-year Uconnect aggregation to FCA\'s exact 2018-2021 North American UAS/UCS build range, black-screen/freeze symptoms, and software-level remedy.',
};

const windshieldAdhesionRecall = {
  years: [2020, 2021],
  trims: ['Vehicles built with the nonconforming clear-coat batch and included in recall 21V-516; verify by VIN'],
  category: 'safety',
  title: 'Windshield May Detach in a Crash Due to Inadequate Bonding (Recall 21V-516)',
  description:
    'NHTSA recall 21V-516/Y47 covers certain 2020-2021 Dodge Challenger vehicles. Nonconforming paint clear coat could prevent adequate windshield adhesion, allowing the windshield to separate in a crash and increasing occupant-injury risk.',
  solution:
    'Check the VIN for recall Y47/21V-516. An authorized dealer will remove and replace the front-windshield urethane sealant free of charge. This recall does not establish that spontaneous glass cracks on other model years have the same cause.',
  severity: 'high',
  symptoms: ['No reliable warning may be present before inadequate windshield retention is needed in a crash'],
  affectedSystems: ['front windshield bonding', 'urethane sealant', 'body clear-coat bonding surface'],
  dtcCodes: [],
  sources: [
    {
      type: 'recall',
      title: 'NHTSA Recall 21V-516 - Inadequate Windshield Adhesion',
      url: 'https://static.nhtsa.gov/odi/rcl/2021/RCLRPT-21V516-3328.PDF',
    },
  ],
  summary:
    'Replaced the unsupported 2023 crack/off-center/leak aggregation with FCA\'s exact 2020-2021 clear-coat bonding recall and free urethane-sealant remedy.',
};

const transmissionSoftware = {
  years: [2016],
  trims: [
    'Vehicles built on or before August 5, 2016 with 6.4L ESG/8HP70 DFK or 6.2L ESD/8HP90 DFE',
  ],
  category: 'transmission',
  title: 'Undesirable 3-2, 2-1, or 6-5 Coast Downshifts From TCM Software',
  description:
    'FCA TSB 21-028-16 covers certain 2016 Dodge Challenger 6.2L and 6.4L automatic-transmission vehicles. The documented condition is a less-than-desirable 3-2, 2-1, or 6-5 coast downshift caused by transmission-control software.',
  solution:
    'Confirm the build date, engine, transmission sales code, and exact downshift condition. After ruling out unrelated transmission faults, FCA directs technicians to reprogram the transmission control module with the latest software.',
  severity: 'medium',
  symptoms: ['Harsh or undesirable 3-2 coast downshift', 'Harsh or undesirable 2-1 coast downshift', 'Harsh or undesirable 6-5 coast downshift'],
  affectedSystems: ['transmission control module software', '8HP70 automatic transmission', '8HP90 automatic transmission'],
  dtcCodes: [],
  sources: [
    {
      type: 'tsb',
      title: 'FCA TSB 21-028-16 - Transmission Shift and Drivability Enhancements',
      url: 'https://static.nhtsa.gov/odi/tsbs/2016/MC-10224865-9999.pdf',
    },
  ],
  summary:
    'Replaced the nine-year ZF valve-body-failure claim with FCA\'s exact 2016 engine/transmission/build scope, three coast-downshift events, PCM-versus-hardware boundary, and TCM flash.',
};

const published = {
  'dodge-challenger-driveshaft-2015': replacement(
    driveshaftTolerance,
    'Replace the broad 2015-2023 driveshaft/U-joint failure card with FCA TSB 03-002-23\'s exact late-2022 build window, acceleration noise, manufacturing-tolerance cause, and rear-propeller-shaft remedy.',
  ),
  'dodge-challenger-front-end-suspension-clunk-pop-sway-bar-end-links-tie-rods-c': replacement(
    frontControlArmBushings,
    'Replace the sixteen-year sway-bar/tie-rod/control-arm/ball-joint aggregation with FCA TSB 02-008-24\'s two-day 2023 build cohort and under-cured lower-control-arm bushing condition.',
  ),
  'dodge-challenger-warped-front-brake-rotors-causing-pedal-pulsation-steering-s': replacement(
    brakeRotorLotRot,
    'Replace the universal warped-rotor and rapid-pad-wear card with FCA TSB 05-004-16 Rev. A\'s EMEA 2015-2016 BR3 rotor-corrosion condition and measured resurfacing/replacement path.',
  ),
  'dodge-challenger-rear-differential-whine-heard-cabin': replacement(
    rearAxleHeatTreatment,
    'Replace the broad 2009-2019 differential-whine aggregation with FCA campaign Z74\'s VIN-scoped 2021-2022 DR2 pinion heat-treatment condition and rear-axle replacement.',
  ),
  'dodge-challenger-ac-not-blowing-cold-hvac-blend-door-actuator-failure': replacement(
    acPcmSoftware,
    'Replace the sixteen-year blend-door/refrigerant/evaporator aggregation with FCA TSB 18-087-24\'s exact 2023 6.2L manual-transmission PCM-software condition.',
  ),
  'dodge-challenger-catalytic-converter-efficiency-code': replacement(
    catalystCodesPcmSoftware,
    'Replace the universal catalytic-converter-failure diagnosis with FCA TSB 18-090-24\'s exact 2019 5.7L P0420/P0430 PCM-software condition and flash-before-parts boundary.',
  ),
  'dodge-challenger-clear-coat-peeling-paint-blistering': replacement(
    demonHoodBezel,
    'Replace the sixteen-year clear-coat aggregation with FCA TSB 23-013-20\'s exact 2018 Challenger Demon hood-bezel warping and localized paint-damage condition.',
  ),
  'dodge-challenger-engine-bay-wiring-starter-cable-short-circuit-fire-risk-safe': replacement(
    starterCableRecall,
    'Retain the exact 2013 V6 starter-cable short and fire recall while enforcing the VIN, build-date, stop-drive, and free dealer-repair boundaries.',
  ),
  'dodge-challenger-evap-leak-detection-pump-failure-causes-persistent-p0455-p04': replacement(
    evapCodesPcmSoftware,
    'Replace the sixteen-year ESIM-failure claim with FCA TSBs 18-095-23/18-096-23\'s exact 2022 6.4L PCM-software code set and leak-test boundary.',
  ),
  'dodge-challenger-high-theft-risk-relay-attack-key-cloning-vulnerability': replacement(
    keyProgrammingSecurity,
    'Replace the vague relay/key-cloning and merchandise aggregation with Dodge\'s documented physical-access key-programming attack path, named security features, model-year scope, and current-availability caveat.',
  ),
  'dodge-challenger-radiator-failure': replacement(
    radiatorHoseWeep,
    'Replace the broad 2011-2021 premature-radiator-failure card with FCA TSB 07-005-15 Rev. A\'s exact 2015 HEMI upper-hose connection weep and clamp remedy.',
  ),
  'dodge-challenger-rearview-camera-image-lingers-after-reverse-recall-20v191': replacement(
    rearviewCameraRecall,
    'Retain the exact 2019 rearview-image software recall with a direct NHTSA deep link and remove secondary citations and unrelated Uconnect claims.',
  ),
  'dodge-challenger-sudden-alternator-failure-causing-stall-electrical-loss-fire': replacement(
    alternatorRecall,
    'Retain the shared alternator-diode mechanism across recalls 14V-634 and 17V-435 while restricting the affected engine, EHPS, amperage, model-year, and VIN populations.',
  ),
  'dodge-challenger-takata-driver-frontal-airbag-inflator-rupture-do-not-drive-r': replacement(
    takataDriverRecall,
    'Retain the exact 2008-2010 stop-drive Takata campaign with a direct FCA/NHTSA service document and only the free recall remedy.',
  ),
  'dodge-challenger-uconnect-infotainment-freeze-black-screen-random-reboot': replacement(
    uconnectSoftware,
    'Replace the nine-year generic Uconnect card with FCA TSB 08-102-21 Rev. A\'s exact North American UAS/UCS build range, black-screen/freeze symptoms, and radio-software remedy.',
  ),
  'dodge-challenger-windshield-cracking-from-pillar-off-center-mounting-wind-wat': replacement(
    windshieldAdhesionRecall,
    'Replace the unsupported 2023 cracking/off-center/leak card with NHTSA recall 21V-516\'s exact 2020-2021 windshield-bonding population, crash consequence, and free urethane remedy.',
  ),
  'dodge-challenger-zf8-trans-2015': replacement(
    transmissionSoftware,
    'Replace the nine-year harsh-shift and valve-body-failure aggregation with FCA TSB 21-028-16\'s exact 2016 build, powertrain, coast-downshift, and TCM-software scope.',
  ),
};

const reasons = {
  'dodge-challenger-valve-spring-failure-6-4l-392-hemi':
    'The frozen card asserts a 2011-2023 6.4L spring-failure pattern tied to high RPM, modifications, boost, multiple symptoms, costs, and aftermarket spring kits from forums and sellers without one FCA/NHTSA primary source establishing that complete population and remedy.',
  'dodge-challenger-exhaust-manifold-bolts-2008':
    'The frozen card asserts a sixteen-year HEMI exhaust-manifold bolt failure population, tick diagnosis, mileage, costs, and hardware replacement without one Challenger-specific FCA bulletin or campaign proving that full scope.',
  'dodge-challenger-battery-drain-parasitic-draw-battery-dead-overnight-after-si':
    'The frozen card combines radio wakeups, pumps, modules, batteries, alternators, aftermarket accessories, and sixteen model years into one parasitic-draw mechanism without a manufacturer-defined population, diagnostic threshold, or repair path.',
  'dodge-challenger-cracked-split-dashboard-top-panel':
    'The frozen card relies on owner forums and a dash-cover seller for a 2008-2014 dashboard-crack pattern, cause, cost, and remedy without an FCA primary source establishing the affected population and failure mechanism.',
  'dodge-challenger-dodge-challenger-engine-stalls-shuts-off-while-driving':
    'The frozen card merges alternator recall conditions, alleged TIPM/fuel-pump-relay failures, complaints, seven model years, and different remedies; the verified alternator condition is preserved separately, so this duplicate multi-cause stall card cannot remain.',
  'dodge-challenger-eps-rack-2015':
    'The frozen card treats steering warnings, loss of assist, noise, and 2015-2023 rack replacement as one EPS-rack failure without a Challenger-specific FCA/NHTSA source proving that mechanism, full population, and remedy.',
  'dodge-challenger-fuel-tank-hard-to-fill-nozzle-clicks-off-repeatedly':
    'The frozen card combines tank venting, ESIM, hoses, valves, charcoal canisters, filler necks, and sixteen model years from secondary sources without one FCA bulletin defining the cause and repair boundary.',
  'dodge-challenger-hellcat-ihi-supercharger-bearing-pulley-failure':
    'The frozen card asserts a 2015-2023 IHI bearing and pulley failure pattern, noise progression, rebuild-versus-replacement path, costs, and aftermarket service from forums and vendors without an FCA primary source.',
  'dodge-challenger-hemi-water-pump-premature-failure-coolant-leak':
    'The frozen card asserts premature HEMI water-pump failure across fifteen model years with mileage, costs, leakage symptoms, and replacement guidance but no FCA/NHTSA primary source establishing that population and mechanism.',
  'dodge-challenger-lifter-tick':
    'The frozen card presents a seven-year HEMI MDS lifter/cam failure pattern without an FCA bulletin, campaign, or investigation proving the exact model-year, engine, symptom, diagnostic, and remedy scope.',
  'dodge-challenger-oil-cooler-oil-filter-adapter-housing-leak':
    'The frozen card combines 5.7L and 6.4L oil coolers, filter adapters, seals, fifteen model years, costs, and replacement parts from forums and sellers without one FCA source defining a common failure mechanism.',
  'dodge-challenger-oil-filter-housing-2011':
    'The frozen card asserts a 2011-2023 Pentastar oil-filter-housing failure population, leak path, costs, and parts replacement without a Challenger-specific FCA/NHTSA source supporting the complete claim.',
  'dodge-challenger-pentastar-tick':
    'The frozen card treats all 2015-2023 3.6L ticking and misfires as rocker-arm/lifter failure without one FCA bulletin establishing the exact affected population, DTC boundary, diagnosis, and remedy.',
  'dodge-challenger-power-steering-noise-low-speed-ehps-assist-loss-tied-to-alte':
    'The frozen card improperly merges generic low-speed steering noise with the alternator recall and several steering causes. The verified alternator condition is preserved separately, and no source supports the remaining multi-cause noise card.',
  'dodge-challenger-random-misfire-rough-idle-from-worn-spark-plugs-failing-igni':
    'The frozen card treats P0300 and rough idle across thirteen model years as worn plugs or failed coils and prescribes parts from secondary sources without one FCA diagnostic bulletin defining that cause and population.',
  'dodge-challenger-rocker-panel-underbody-rust':
    'The frozen card asserts a 2008-2014 foam-trapped-moisture rocker and underbody rust mechanism from forums and complaint aggregators without an FCA primary source defining the population and repair.',
  'dodge-challenger-sunroof-overhead-console-water-leaks':
    'The frozen card combines clogged drains, weatherstrips, glass adjustment, overhead-console leakage, sixteen years, and multiple repair paths from forums without one FCA bulletin establishing a single failure mechanism.',
  'dodge-challenger-tipm-failure-random-no-start-fuel-pump-no-prime-stalling-bat':
    'The frozen card applies other-platform TIPM/fuel-pump-relay recall material to 2008-2014 Challenger no-starts, stalls, battery drain, and random electrical faults without a Challenger-specific FCA/NHTSA source proving that mechanism and remedy.',
};

module.exports = buildConfig({
  label: 'Dodge Challenger',
  make: 'Dodge',
  model: 'Challenger',
  slug: 'dodge-challenger',
  batchId: 'dodge-challenger-full-record-cohort-67-2026-08-04',
  auditDate: '2026-08-04',
  snapshotHash:
    '422f4bceb3712de9ece2e11518962ca096a56718e84d6217628fcd811be47b91',
  sourceSnapshotFileHash:
    '656d87fb2c100fc72fdbb0f6812ff67b3b28298dcd9eb81a36aeca0c4ae6c02a',
  packetFileHash:
    '9fa6788172cee9d1b2303bb769195f0113fab87338d908aa68e410c829f1bb19',
  packetRelativePath:
    'data/known-issues-catalog-deeplink-work/dodge-challenger/422f4bceb371/all-0001.json',
  reviewTokens: {
    blind: 'dodgechallenger_blind:manual-primary-source-gate',
    edge: 'dodgechallenger_edge:manual-primary-source-gate',
  },
  published,
  reasons,
  proposalCampaigns: [
    '08V458000',
    '08V642000',
    '09V420000',
    '10V200000',
    '10V475000',
    '13V118000',
    '14V749000',
    '15V114000',
    '15V282000',
    '15V461000',
    '16V352000',
    '17V431000',
    '17V496000',
    '17V741000',
    '17V824000',
    '18E053000',
    '18V021000',
    '18V280000',
    '18V332000',
    '18V524000',
    '19V018000',
    '19V203000',
    '19V758000',
    '21V664000',
    '22V504000',
    '22V808000',
    '24V112000',
    '24V573000',
  ],
});
