/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const {
  FULL_RECORD_FIELDS,
  diffFields,
  fullRecord,
  hashValue,
} = require('./build-honda-adjudication');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = path.join(PROJECT_ROOT, 'data', '_honda-deeplink-snapshot-2026-08-05.json');
const OUTPUT = path.join(PROJECT_ROOT, 'data', 'known-issue-honda-crv-adjudication-2026-08-06.json');

const IDS = {
  oilDilutionLong: 'honda-cr-v-1-5l-turbo-engine-oil-dilution-fuel-oil-overfilled-dipstick',
  shaftSealLong: 'honda-cr-v-c-compressor-shaft-seal-leak-c-stops-blowing-cold',
  fuelCellCoolant: 'honda-cr-v-cr-v-e-fcev-fuel-cell-stack-coolant-leak-loss-drive-power',
  airbagHarness: 'honda-cr-v-driver-airbag-can-deploy-inadvertently-steering-wire-chafe-r',
  seatBeltBuckle: 'honda-cr-v-front-seat-belt-buckle-won-t-latch-recall-23v-158',
  highPressureFuelPump: 'honda-cr-v-high-pressure-fuel-pump-cracking-fuel-leak-fire-risk',
  highVoltageBattery: 'honda-cr-v-high-voltage-battery-terminal-busbar-fracture-spark-fire-los',
  pistonRings: 'honda-cr-v-k24z-sticking-piston-rings-excessive-oil-consumption',
  lowPressureFuelPumpLong: 'honda-cr-v-low-density-fuel-pump-impeller-stalling-no-start',
  phantomBraking: 'honda-cr-v-phantom-braking-collision-mitigation-braking-system-activate',
  stickySteering: 'honda-cr-v-steering-gearbox-worm-wheel-friction-causing-sticky-notchy-s',
  vibration: 'honda-cr-v-vibration-while-stopped-gear-while-driving-tsb-15-046',
  lowPressureFuelPumpShort: 'honda-crv-5th-gen-fuel-pump-nhtsa-recall-2018',
  acClutch: 'honda-crv-ac-compressor-clutch-2007',
  shaftSealShort: 'honda-crv-ac-compressor-seal-2017',
  infotainment: 'honda-crv-infotainment-2017',
  oilDilutionShort: 'honda-crv-oil-dilution-1-5t-2017',
  rearFrame: 'honda-crv-rear-frame-corrosion-2007',
  vtcActuator: 'honda-crv-vtc-actuator-2012',
};

const SOURCES = {
  oilDilutionNotice: 'https://static.nhtsa.gov/odi/tsbs/2018/MC-10147185-9999.pdf',
  oilDilutionService: 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10158738-0001.pdf',
  shaftSeal: 'https://static.nhtsa.gov/odi/tsbs/2023/MC-10237949-0001.pdf',
  fuelCellCoolant: 'https://static.nhtsa.gov/odi/rcl/2025/RCAK-25V858-3678.pdf',
  airbagHarness: 'https://static.nhtsa.gov/odi/rcl/2019/RCAK-19V383-7126.pdf',
  seatBeltBuckle: 'https://static.nhtsa.gov/odi/rcl/2023/RCLRPT-23V158-4378.PDF',
  highPressureFuelPump: 'https://static.nhtsa.gov/odi/rcl/2024/RCRIT-24V763-2149.pdf',
  highVoltageBattery: 'https://static.nhtsa.gov/odi/rcl/2024/RCLRPT-24V745-6029.PDF',
  pistonRings: 'https://static.nhtsa.gov/odi/tsbs/2018/MC-10152429-0001.pdf',
  lowPressureFuelPumpCampaign: 'https://static.nhtsa.gov/odi/rcl/2023/RCAK-23V858-9680.pdf',
  lowPressureFuelPumpNotice: 'https://static.nhtsa.gov/odi/rcl/2023/RIONL-23V858-6970.pdf',
  phantomBraking: 'https://static.nhtsa.gov/odi/inv/2024/INOA-EA24002-11766P1.pdf',
  stickySteering: 'https://static.nhtsa.gov/odi/rcl/2024/RCLRPT-24V744-4093.PDF',
  vibration: 'https://static.nhtsa.gov/odi/tsbs/2018/MC-10129791-9999.pdf',
  acClutch: 'https://static.nhtsa.gov/odi/tsbs/2014/MC-10129324-9999.pdf',
  infotainment: 'https://static.nhtsa.gov/odi/tsbs/2019/MC-10169978-0001.pdf',
  rearFrame: 'https://static.nhtsa.gov/odi/rcl/2023/RCRIT-23V228-8413.PDF',
  vtcActuator: 'https://static.nhtsa.gov/odi/tsbs/2016/MC-10204264-9999.pdf',
};

const MISMATCH_SOURCES = {
  infotainment: SOURCES.infotainment,
  vtcActuator: SOURCES.vtcActuator,
  brakeFalseMatch: 'https://static.nhtsa.gov/odi/tsbs/2021/MC-10203501-0001.pdf',
  accFalseMatch: 'https://static.nhtsa.gov/odi/tsbs/2022/MC-10213582-0001.pdf',
};

function citation(type, title, url) {
  return { type, title, url };
}

const oilDilutionCard = {
  years: [2017, 2018],
  category: 'engine',
  title: '1.5L Turbo Oil Dilution / Oil Level Above Full Mark - Honda 2017-18 Campaign',
  description: 'Honda issued an oil-dilution communication for 2017-2018 CR-Vs with the 1.5-liter turbo engine when the engine-oil level reads above the dipstick full mark. Honda Service Bulletin 19-032 separately documents eligible 2017-2018 CR-V EX, EX-L and Touring vehicles with misfire DTCs P0300-P0304, rich-running DTC P0172, drivability concerns or a whirling engine noise.',
  solution: 'Have a Honda dealer check VIN eligibility and diagnose the exact symptom. Bulletin 19-032 directs eligible repairs to update PGM-FI and TCM software, replace the engine oil, reset learned values and, where the procedure requires it, replace the A/C control unit. Returning DTCs or a whirling noise have additional inspection steps in the bulletin.',
  severity: 'high',
  confidence: 'high',
  symptoms: ['Engine-oil level above the full mark on the dipstick', 'Misfire DTC P0300, P0301, P0302, P0303 or P0304', 'Fuel-system-too-rich DTC P0172', 'Whirling noise from the engine compartment'],
  affectedSystems: ['engine lubrication', 'PGM-FI software', 'transmission control software'],
  dtcCodes: ['P0300', 'P0301', 'P0302', 'P0303', 'P0304', 'P0172'],
  citations: [
    citation('manufacturer', 'Honda Tech2Tech - Understanding Oil Dilution on 2017-18 CR-V 1.5T', SOURCES.oilDilutionNotice),
    citation('tsb', 'Honda Service Bulletin 19-032 - 2017-18 CR-V Software Update and Drivability Repair', SOURCES.oilDilutionService),
  ],
  identityTerms: ['oil', 'dilution'],
  summary: 'Kept the oil-dilution identity, limited scope to Honda\'s documented 2017-2018 1.5T vehicles, and removed unsupported class-action, complaint-count, wear, owner-driving and fixed maintenance claims.',
};

const shaftSealCard = {
  years: [2017, 2018, 2019, 2020, 2021, 2022],
  category: 'hvac',
  title: 'A/C Compressor Shaft Seal Leak - Honda Bulletin 23-040',
  description: 'Honda Service Bulletin 23-040 applies to VIN-eligible 2017-2022 CR-V 1.5T vehicles. Honda says the refrigerant and oil can swell the compressor shaft seal, causing abnormal seal wear, larger gaps and a refrigerant leak.',
  solution: 'Ask a Honda dealer to confirm VIN eligibility and inspect the compressor shaft seal under Bulletin 23-040. The bulletin directs the dealer to replace the shaft seal when the inspection procedure confirms the condition, then evacuate and recharge the system.',
  severity: 'medium',
  confidence: 'high',
  symptoms: ['Reduced or lost A/C cooling', 'Oil or refrigerant evidence at the compressor shaft seal'],
  affectedSystems: ['A/C compressor shaft seal', 'refrigerant system'],
  dtcCodes: [],
  citations: [citation('tsb', 'Honda Service Bulletin 23-040 - 2017-22 CR-V A/C Compressor Shaft Seal Leak', SOURCES.shaftSeal)],
  identityTerms: ['compressor', 'seal'],
  summary: 'Kept the shaft-seal identity, corrected applicability to VIN-eligible 2017-2022 CR-V 1.5T vehicles, corrected the remedy to seal replacement when directed, and removed unsupported full-compressor, price and reimbursement claims.',
};

const lowPressureFuelPumpCard = {
  years: [2018, 2019, 2020],
  category: 'fuel',
  title: 'In-Tank Fuel Pump May Fail - Recall 23V-858',
  description: 'NHTSA recall 23V-858 includes certain 2018-2020 CR-V vehicles and 2020 CR-V Hybrid vehicles. Honda says an improperly molded fuel-pump impeller can deform over time and make the in-tank fuel pump inoperable. The vehicle may fail to start, lose drive power or stall while driving.',
  solution: 'Check the VIN in the Honda or NHTSA recall lookup. The recall remedy is replacement of the fuel-pump module by a Honda dealer at no charge.',
  severity: 'high',
  confidence: 'high',
  symptoms: ['Engine may not start', 'Loss of drive power', 'Engine stall while driving'],
  affectedSystems: ['in-tank fuel-pump module'],
  dtcCodes: [],
  citations: [
    citation('recall', 'NHTSA Recall Acknowledgment 23V-858 - Fuel Pump May Fail', SOURCES.lowPressureFuelPumpCampaign),
    citation('recall', 'Honda Owner Notice 23V-858 - Improperly Molded Fuel-Pump Impeller', SOURCES.lowPressureFuelPumpNotice),
  ],
  identityTerms: ['fuel pump'],
  summary: 'Kept the low-pressure fuel-pump identity, corrected CR-V scope to 2018-2020 plus 2020 Hybrid, corrected the campaign number to 23V-858, and removed unsupported model years, DTCs, owner workarounds and parts-availability claims.',
};

const REWRITE_CARDS = {
  [IDS.oilDilutionLong]: oilDilutionCard,
  [IDS.oilDilutionShort]: oilDilutionCard,
  [IDS.shaftSealLong]: shaftSealCard,
  [IDS.shaftSealShort]: shaftSealCard,
  [IDS.lowPressureFuelPumpLong]: lowPressureFuelPumpCard,
  [IDS.lowPressureFuelPumpShort]: lowPressureFuelPumpCard,
  [IDS.fuelCellCoolant]: {
    years: [2025], category: 'drivetrain', title: 'CR-V e:FCEV Fuel-Cell Stack Coolant Leak - Recall 25V-858',
    description: 'NHTSA recall 25V-858 covers certain 2025 Honda CR-V Fuel Cell EV vehicles. Coolant inside the fuel-cell stack may leak into the stack case and cause an internal short circuit, which can cause loss of drive power and increase crash or injury risk.',
    solution: 'Check the VIN in the Honda or NHTSA recall lookup. Honda dealers will replace the fuel-cell stack assembly at no charge under recall 25V-858.',
    severity: 'high', confidence: 'high', symptoms: ['Loss of drive power'], affectedSystems: ['fuel-cell stack', 'fuel-cell coolant system'], dtcCodes: [],
    citations: [citation('recall', 'NHTSA Recall Acknowledgment 25V-858 - CR-V Fuel Cell EV Loss of Drive Power', SOURCES.fuelCellCoolant)],
    identityTerms: ['fuel cell', 'coolant'], summary: 'Replaced secondary reporting with the exact NHTSA recall, retained the coolant-leak/fuel-cell identity, and removed unsupported technical causes, warning details and output figures not stated in the cited recall acknowledgment.',
  },
  [IDS.airbagHarness]: {
    years: [2019], category: 'safety', title: 'Steering-Wheel Burr May Damage Driver-Airbag Wiring - Recall 19V-383',
    description: 'NHTSA recall 19V-383 covers certain 2019 CR-V vehicles. Burrs on the steering-wheel metal core may damage wiring routed inside the wheel, potentially disabling the driver airbag or causing it to deploy without warning.',
    solution: 'Check VIN eligibility through Honda or NHTSA. The recall remedy installs a protective cover on the steering-wheel core and replaces the clockspring and affected harnesses at no charge.',
    severity: 'high', confidence: 'high', symptoms: ['SRS warning indicator may illuminate', 'Driver airbag may be disabled', 'Driver airbag may deploy without warning'], affectedSystems: ['steering-wheel core', 'clockspring', 'driver-airbag wiring harness'], dtcCodes: [],
    citations: [citation('recall', 'NHTSA Recall Acknowledgment 19V-383 - Steering Wheel May Damage Airbag Wiring', SOURCES.airbagHarness)],
    identityTerms: ['airbag', 'steering'], summary: 'Replaced secondary recall summaries with NHTSA\'s exact 2019 CR-V campaign scope, defect and remedy and removed unsupported trim/engine applicability.',
  },
  [IDS.seatBeltBuckle]: {
    years: [2017, 2018, 2019, 2020], category: 'safety', title: 'Front Seat-Belt Buckle May Not Latch - Recall 23V-158',
    description: 'NHTSA recall 23V-158 covers certain 2017-2020 CR-V vehicles. An out-of-spec buckle channel can interfere with the release button; coating deterioration and low-temperature shrinkage can increase friction and prevent the front seat-belt buckle from latching.',
    solution: 'Check VIN eligibility through Honda or NHTSA. The recall remedy replaces the driver and passenger front buckle release buttons and, when inspection requires it, the buckle assembly.',
    severity: 'high', confidence: 'high', symptoms: ['Driver or front-passenger seat-belt buckle may not latch', 'Buckle release button may bind, especially at low temperature'], affectedSystems: ['driver front seat-belt buckle', 'passenger front seat-belt buckle'], dtcCodes: [],
    citations: [citation('recall', 'NHTSA Part 573 Report 23V-158 - Front Seat-Belt Buckle May Not Latch', SOURCES.seatBeltBuckle)],
    identityTerms: ['seat belt', 'buckle'], summary: 'Kept the buckle-latching identity, replaced secondary sources with the exact NHTSA report, stated the inspection-dependent remedy, and removed unsupported trim/engine and forum claims.',
  },
  [IDS.highPressureFuelPump]: {
    years: [2023, 2024, 2025], category: 'fuel', title: 'CR-V Hybrid High-Pressure Fuel-Pump Leak - Recall 24V-763',
    description: 'Honda Service Bulletin 24-049 applies to VIN-eligible 2023-2025 CR-V Hybrid vehicles. An improperly manufactured high-pressure fuel pump can fracture and leak fuel; a leak near an ignition source increases fire or injury risk.',
    solution: 'Check the VIN with Honda or NHTSA. Honda\'s recall procedure calls for dealer inspection and high-pressure fuel-pump replacement when the inspection fails the specified criteria.',
    severity: 'high', confidence: 'high', symptoms: ['Fuel odor or evidence of a high-pressure fuel-pump leak'], affectedSystems: ['high-pressure fuel pump'], dtcCodes: [],
    citations: [citation('recall', 'Honda Service Bulletin 24-049 - 2023-25 CR-V Hybrid High-Pressure Fuel-Pump Recall', SOURCES.highPressureFuelPump)],
    identityTerms: ['high pressure', 'fuel pump'], summary: 'Kept the high-pressure fuel-pump identity, used Honda\'s exact CR-V Hybrid scope and inspection-dependent remedy, and removed unsupported build dates, warning symptoms and secondary reporting.',
  },
  [IDS.highVoltageBattery]: {
    years: [2023], category: 'electrical', title: 'CR-V Hybrid Battery Terminal or Busbar May Break - Recall 24V-745',
    description: 'NHTSA recall 24V-745 covers certain 2023 CR-V Hybrid vehicles. Inadequate copper cladding on a battery-cell negative terminal can lead to a broken terminal or busbar. The vehicle may become undriveable, and a break while the battery is energized can create a spark and increase fire, crash or injury risk.',
    solution: 'Check VIN eligibility through Honda or NHTSA. The recall remedy replaces the battery module with an improved part.',
    severity: 'high', confidence: 'high', symptoms: ['Vehicle may become unable to drive', 'A spark may occur if the terminal or busbar breaks while energized'], affectedSystems: ['high-voltage battery module', 'battery-cell negative terminal', 'busbar'], dtcCodes: [],
    citations: [citation('recall', 'NHTSA Part 573 Report 24V-745 - 2023 CR-V Hybrid Battery Module', SOURCES.highVoltageBattery)],
    identityTerms: ['battery', 'busbar'], summary: 'Kept the high-voltage battery identity, replaced secondary sources with the exact NHTSA Part 573 report, and removed unsupported trim names, warning lights and owner-letter timing.',
  },
  [IDS.pistonRings]: {
    years: [2008, 2009, 2010, 2011], category: 'engine', title: 'Sticking Oil-Control Rings and High Oil Consumption - Bulletin 12-089',
    description: 'Honda Service Bulletin 12-089 lists VIN-eligible 2008-2011 CR-V vehicles and documents deposits that can make the oil-control rings stick, leading to increased oil consumption. The stated symptom is low oil on the dipstick, with an oil warning light possible in rare high-consumption cases. The bulletin\'s warranty-extension background specifically describes 2010-2011 CR-V 2WD and 4WD vehicles.',
    solution: 'Have a Honda dealer check VIN eligibility and perform the bulletin\'s oil-consumption diagnosis. When the diagnosis requires it, Bulletin 12-089 directs replacement of all engine pistons and piston rings. Check the oil level regularly as Honda recommends.',
    severity: 'high', confidence: 'high', symptoms: ['Low engine-oil level on the dipstick', 'Oil warning light in rare high-consumption cases'], affectedSystems: ['oil-control rings', 'pistons'], dtcCodes: [],
    citations: [citation('tsb', 'Honda Service Bulletin 12-089 - Sticking Rings Resulting in High Engine Oil Consumption', SOURCES.pistonRings)],
    identityTerms: ['piston rings', 'oil consumption'], summary: 'Kept the sticking-ring/oil-consumption identity, corrected the affected table to 2008-2011 with VIN eligibility, distinguished the 2010-2011 warranty-extension statement, and removed unsupported consumption rates, engine-damage, additives, prices and DTCs.',
  },
  [IDS.phantomBraking]: {
    years: [2017, 2018, 2019, 2020, 2021, 2022], category: 'brakes', title: 'Alleged Inadvertent CMBS Braking - NHTSA Investigation EA24-002',
    description: 'NHTSA Engineering Analysis EA24-002 concerns alleged inadvertent activation of the Collision Mitigation Braking System in 2017-2022 CR-V vehicles when no imminent collision hazard is present. NHTSA describes unexpected automatic braking and rapid deceleration that may increase collision risk. This is an investigation record, not a recall notice or a finding that every covered vehicle has a defect.',
    solution: 'Document the date, speed, road conditions, warnings and dealer findings for any event and report a suspected safety issue to NHTSA. Have Honda diagnose the CMBS and its sensors. The cited investigation does not prescribe a recall repair or authorize disabling a safety system.',
    severity: 'high', confidence: 'high', symptoms: ['Unexpected automatic braking with no imminent collision hazard', 'Sudden vehicle deceleration'], affectedSystems: ['Collision Mitigation Braking System', 'automatic emergency braking'], dtcCodes: [],
    citations: [citation('nhtsa', 'NHTSA Engineering Analysis EA24-002 - Inadvertent Automatic Emergency Braking', SOURCES.phantomBraking)],
    identityTerms: ['braking', 'collision mitigation'], summary: 'Kept the phantom-braking identity but recast it accurately as an NHTSA allegation under investigation, not a recall or proven defect, and removed unsupported scenario, workaround, lawsuit and repair claims.',
  },
  [IDS.stickySteering]: {
    years: [2023, 2024, 2025], category: 'steering', title: 'Sticky Steering from Steering-Gearbox Friction - Recall 24V-744',
    description: 'NHTSA recall 24V-744 covers certain 2023-2025 CR-V and CR-V Hybrid vehicles and certain 2025 CR-V Fuel Cell EVs. An improperly produced worm wheel can swell and reduce grease-film thickness, while excessive worm-gear spring preload increases sliding force. The resulting friction can cause sticky steering and increased effort or difficulty steering.',
    solution: 'Check VIN eligibility through Honda or NHTSA. The recall remedy replaces the worm-gear spring with an improved part and redistributes or adds grease in the steering gearbox.',
    severity: 'high', confidence: 'high', symptoms: ['Sticky or notchy steering feel', 'Increased steering effort or difficulty'], affectedSystems: ['steering gearbox', 'worm wheel', 'worm gear spring'], dtcCodes: [],
    citations: [citation('recall', 'NHTSA Part 573 Report 24V-744 - Steering Gearbox Friction', SOURCES.stickySteering)],
    identityTerms: ['steering', 'worm'], summary: 'Kept the sticky-steering identity, added the exact CR-V/Hybrid/FCEV scope and NHTSA remedy, and removed complaint counts, parts-delay and post-repair speculation.',
  },
  [IDS.vibration]: {
    years: [2015], category: 'engine', title: 'Vibration While Driving or Stopped in Gear - Bulletin 15-046',
    description: 'Honda Service Bulletin 15-046 applies to 2015 CR-V vehicles. It documents intermittent vibration felt primarily through the driver seat while stopped in gear, during takeoff at 1,000-1,200 rpm, or while driving at 1,800-2,200 rpm around 40-50 mph.',
    solution: 'Have a Honda dealer identify the documented driving mode before repair. Bulletin 15-046 specifies radiator lower cushions, a transmission mount and front head restraints for Mode 1; a PCM update and tailgate damper kit for Mode 2; and a PCM update for Mode 3.',
    severity: 'medium', confidence: 'high', symptoms: ['Vibration while stopped with the vehicle in gear', 'Vibration at 1,000-1,200 rpm during takeoff', 'Vibration at 1,800-2,200 rpm around 40-50 mph'], affectedSystems: ['engine and transmission vibration isolation', 'PCM software'], dtcCodes: [],
    citations: [citation('tsb', 'Honda Service Bulletin 15-046 - Vibration While Driving and/or Stopped in Gear', SOURCES.vibration)],
    identityTerms: ['vibration'], summary: 'Kept the vibration identity, corrected scope from 2015-2016 to 2015 only, copied Honda\'s three documented modes and repairs, and removed lawsuit, owner-forum and nausea claims.',
  },
  [IDS.acClutch]: {
    years: [2007, 2008, 2009, 2010, 2011], category: 'hvac', title: 'A/C Compressor Clutch Wear - Bulletin 12-072',
    description: 'Honda Service Bulletin 12-072 applies to VIN-eligible 2007-2011 CR-V vehicles. Honda says compressor-clutch wear can cause poor cooling, warm air or noise from the compressor area.',
    solution: 'Have a Honda dealer confirm VIN eligibility and diagnose the compressor clutch. Bulletin 12-072 directs replacement of the clutch armature plate and rotor pulley and, when needed, the field coil.',
    severity: 'low', confidence: 'high', symptoms: ['A/C cooling is poor or warm', 'A/C does not work', 'Noise from the compressor area'], affectedSystems: ['A/C compressor clutch', 'field coil'], dtcCodes: [],
    citations: [citation('tsb', 'Honda Service Bulletin 12-072 - A/C Compressor Clutch Warranty Extension', SOURCES.acClutch)],
    identityTerms: ['compressor', 'clutch'], summary: 'Kept the compressor-clutch identity, added Honda\'s exact diagnosis and repair, and removed unsupported burning-smell, full-compressor and price claims.',
  },
  [IDS.infotainment]: {
    years: [2017, 2018, 2019], category: 'electrical', title: 'Center Display Dims or Goes Dark - Bulletin 19-066',
    description: 'Honda Service Bulletin 19-066 applies to 2017-2019 CR-V EX, EX-L and Touring vehicles. The center display may dim or go dark, beep, change screens or change channels because some units do not have the latest software.',
    solution: 'Have a Honda dealer confirm the bulletin applies and update the center-display-unit software. Symptoms outside the bulletin\'s exact list require normal diagnosis rather than assuming the display unit needs replacement.',
    severity: 'low', confidence: 'high', symptoms: ['Center display dims or goes dark', 'Unexpected beeping', 'Screen changes unexpectedly', 'Audio channel changes unexpectedly'], affectedSystems: ['center display unit software'], dtcCodes: [],
    citations: [citation('tsb', 'Honda Service Bulletin 19-066 - 2017-19 CR-V Center Display Dims or Goes Dark', SOURCES.infotainment)],
    identityTerms: ['display'], summary: 'Narrowed the generic infotainment card to the exact 2017-2019 EX/EX-L/Touring center-display condition in Bulletin 19-066 and removed unsupported 2020-2021, reboot, backup-camera and hardware-replacement claims.',
  },
  [IDS.rearFrame]: {
    years: [2007, 2008, 2009, 2010, 2011], category: 'body', title: 'Rear-Frame Corrosion and Trailing-Arm Detachment Risk - Recall 23V-228',
    description: 'Honda recall Bulletin 23-032 applies to VIN-eligible 2007-2011 CR-V vehicles. In salt-belt use, de-icing agents mixed with mud and dirt can accumulate inside the rear frame near the rear-suspension trailing-arm connection. Internal corrosion can allow the trailing arm to detach while driving and increase crash risk.',
    solution: 'Check the VIN with Honda or NHTSA and have a Honda dealer perform the recall inspection. Repairable vehicles receive the trailing-arm holder kit; the bulletin explains that some vehicles may be deemed not repairable based on the inspection.',
    severity: 'high', confidence: 'high', symptoms: ['Rear-frame corrosion near the trailing-arm attachment', 'Risk of rear-suspension trailing-arm detachment'], affectedSystems: ['rear frame', 'rear-suspension trailing-arm attachment'], dtcCodes: [],
    citations: [citation('recall', 'Honda Service Bulletin 23-032 / NHTSA Recall 23V-228 - CR-V Rear Frame Brace', SOURCES.rearFrame)],
    identityTerms: ['rear', 'corrosion'], summary: 'Kept the rear-frame corrosion identity, corrected the recall from 23V-844 to 23V-228, preserved the 2007-2011 VIN-specific scope, and removed unsupported symptoms and automatic repurchase language.',
  },
  [IDS.vtcActuator]: {
    years: [2010, 2011, 2012, 2013], category: 'engine', title: 'VTC Actuator Causes Two-Second Cold-Start Rattle - Bulletin 09-010',
    description: 'Honda Service Bulletin 09-010 applies to all 2010-2012 CR-V vehicles and specified 2013 CR-V VIN ranges. A defective variable timing control actuator can cause a loud engine rattle for about two seconds at cold startup.',
    solution: 'After the engine has not been started for at least six hours, have a Honda technician compare the cold-start noise with the bulletin procedure. If the documented two-second rattle is confirmed, Bulletin 09-010 directs replacement of the VTC actuator.',
    severity: 'medium', confidence: 'high', symptoms: ['Loud engine rattle for about two seconds at cold startup'], affectedSystems: ['variable timing control actuator'], dtcCodes: [],
    citations: [citation('tsb', 'Honda Service Bulletin 09-010 - Engine Rattles at Cold Start-Up', SOURCES.vtcActuator)],
    identityTerms: ['vtc', 'rattle'], summary: 'Kept the VTC-actuator/cold-start-rattle identity, corrected scope to all 2010-2012 and specified 2013 VINs, and removed unsupported timing-chain damage, DTC, oil-interval and price claims.',
  },
};

const KEEP_NOTES = {
  'honda-cr-v-cold-start-rough-idle-vibration-1-5l-turbo': 'The cited oil-dilution material does not establish this card\'s distinct cold-start rough-idle/vibration identity or the claimed Bulletin 19-100/20-054 remedy, so the row remains byte-for-byte unchanged.',
  'honda-cr-v-infotainment-freezing-rebooting-apple-carplay-android-auto-d': 'Bulletin 19-066 supports dim/dark display, beeping and screen/channel changes, not this separate freezing/rebooting/CarPlay-dropout aggregation. No substitution is proposed.',
  'honda-cr-v-p0741-torque-converter-clutch-judder-from-degraded-atf': 'No exact Honda CR-V bulletin was completed for this P0741-specific identity, so the row remains unchanged.',
  'honda-cr-v-rearview-backup-camera-displays-black-white-blank-screen-rev': 'The claimed Bulletin 25-071 source was not verified for this exact CR-V backup-camera identity, so the row remains unchanged.',
  'honda-crv-5th-gen-engine-vibration-rough-idle-2017': 'No exact Honda bulletin was verified for the claimed 2017-2022 1.5T cold-start rough-idle identity; oil-dilution material cannot replace it.',
  'honda-crv-ac-compressor-2012': 'Bulletin 23-040 concerns a 2017-2022 1.5T compressor shaft seal, not this broad 2012-2016 compressor-failure card. The row remains unchanged.',
  'honda-crv-acc-issues-2017': 'Honda Bulletin 22-014 concerns active-noise-cancellation booming in Accord and Insight vehicles, not CR-V adaptive-cruise radar. The row remains unchanged.',
  'honda-crv-hybrid-brake-grinding-2020': 'Honda Bulletin 21-081 concerns EVAP DTCs P0441/P04F1, not CR-V Hybrid brake grinding. The row remains unchanged.',
  'honda-crv-timing-chain-tensioner-failure-2007': 'Honda Bulletin 09-010 documents a VTC-actuator cold-start rattle on later CR-Vs; it does not establish this 2007-2011 timing-chain-tensioner failure identity. The row remains unchanged.',
};

function normalizedFileHash(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n')).digest('hex');
}

function rewriteProposal(current, card) {
  return fullRecord({
    ...current,
    ...card,
    make: 'Honda',
    model: 'CR-V',
    trims: [],
    engines: [],
    estimatedCostLow: null,
    estimatedCostHigh: null,
    typicalMileageLow: null,
    typicalMileageHigh: null,
    communityRecommendations: [],
    fixParts: [],
    humanApproved: false,
    reportCount: 0,
    source: 'manual',
    status: 'published',
    lastReportedByOwners: '',
    reviewedOn: '2026-08-06',
    contentUpdatedOn: '2026-08-06',
    contentUpdateSummary: card.summary,
    relatedIssueIds: [],
  });
}

function keepReason(current) {
  return KEEP_NOTES[current.id] || 'No exact same-identity Honda or NHTSA source was completed for this record. It remains byte-for-byte unchanged; absence of a primary source does not authorize removal, archival or replacement with a different issue.';
}

function evidenceFor(current, card) {
  if (card) return card.citations.map((item) => ({ kind: item.type === 'nhtsa' ? 'government-investigation' : 'manufacturer-or-government-record', url: item.url, verifiedOn: '2026-08-06', observation: `${item.title} supports the proposed same-identity scope, condition and guidance.` }));
  if (current.id === 'honda-crv-acc-issues-2017') return [{ kind: 'citation-identity-mismatch', url: MISMATCH_SOURCES.accFalseMatch, verifiedOn: '2026-08-06', observation: 'Honda Bulletin 22-014 covers active-noise-cancellation booming in Accord and Insight vehicles, not CR-V adaptive cruise control.' }];
  if (current.id === 'honda-crv-hybrid-brake-grinding-2020') return [{ kind: 'citation-identity-mismatch', url: MISMATCH_SOURCES.brakeFalseMatch, verifiedOn: '2026-08-06', observation: 'Honda Bulletin 21-081 covers EVAP DTCs P0441/P04F1, not CR-V Hybrid brake grinding.' }];
  if (current.id === 'honda-crv-timing-chain-tensioner-failure-2007') return [{ kind: 'citation-identity-mismatch', url: MISMATCH_SOURCES.vtcActuator, verifiedOn: '2026-08-06', observation: 'Honda Bulletin 09-010 covers a VTC actuator on 2010-2013 CR-Vs, not a 2007-2011 timing-chain tensioner.' }];
  if (current.id === 'honda-cr-v-infotainment-freezing-rebooting-apple-carplay-android-auto-d') return [{ kind: 'citation-identity-mismatch', url: MISMATCH_SOURCES.infotainment, verifiedOn: '2026-08-06', observation: 'Honda Bulletin 19-066 supports dim/dark display, beeping and screen/channel changes, not rebooting or CarPlay dropout.' }];
  return [];
}

function main() {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const crvRows = snapshot.records.filter((row) => row.make === 'Honda' && row.model === 'CR-V');
  if (crvRows.length !== 53) throw new Error(`expected 53 Honda CR-V rows, found ${crvRows.length}`);

  const rows = crvRows.map((current) => {
    const before = fullRecord(current);
    const card = REWRITE_CARDS[current.id];
    const action = card ? 'rewrite_same_identity' : 'keep_published_pending_source';
    const proposal = card ? rewriteProposal(before, card) : before;
    return {
      id: current.id,
      model: current.model,
      action,
      reason: card ? card.summary : keepReason(current),
      identityRule: card
        ? 'The indexed ID retains the same component/symptom identity; only exact Honda/NHTSA-backed scope, mechanism and guidance change.'
        : 'No content or publication-state changes; a different campaign, component, model or failure mode cannot replace this issue.',
      commerceDecision: card ? 'no-commerce' : 'unchanged-pending-audit',
      changedFields: diffFields(before, proposal),
      evidence: evidenceFor(current, card),
      beforeSha256: hashValue(before),
      proposalSha256: hashValue(proposal),
      before,
      proposal,
    };
  });

  const actions = ['rewrite_same_identity', 'keep_published_pending_source'];
  const summary = Object.fromEntries(actions.map((action) => [action, rows.filter((row) => row.action === action).length]));
  summary.total = rows.length;
  const packet = {
    schemaVersion: 1,
    status: 'proposal-only',
    auditStage: 'model-primary-source-adjudication',
    requiresIndependentApproval: true,
    generatedOn: '2026-08-06',
    make: 'Honda',
    model: 'CR-V',
    completionStatement: 'This packet reconciles all 53 frozen Honda CR-V rows. Nineteen same-identity primary-source corrections are proposed; 34 rows remain byte-for-byte unchanged pending exact evidence or independent disposition.',
    safetyContract: [
      'No production database write, cache purge, deployment, archive action, redirect, slug change or public-page change is authorized by this packet.',
      'All 53 rows remain published. Thirty-four are byte-for-byte unchanged.',
      'An unrelated campaign, bulletin, component or model may never replace the issue named by an existing indexed page.',
      'All 19 rewrites contain zero commerce, zero cost or mileage claims, and empty trim and engine arrays.',
      'Investigations are labeled as allegations under review, not recalls or proven defects.',
      'Independent row-by-row approval is required before a separate guarded apply path may be created.',
    ],
    source: {
      snapshotFile: 'data/_honda-deeplink-snapshot-2026-08-05.json',
      snapshotSha256: normalizedFileHash(SNAPSHOT),
      snapshotGeneratedAt: snapshot.generatedAt,
      snapshotHash: snapshot.snapshotHash,
      crvRecordCount: crvRows.length,
    },
    observations: [
      { code: 'indexed-overlap-oil-dilution', severity: 'independent-review-required', recordIds: [IDS.oilDilutionLong, IDS.oilDilutionShort], detail: 'Two indexed IDs describe the same 2017-2018 oil-dilution identity. Both are corrected without redirecting or removing either page; canonical disposition is reserved for independent review.' },
      { code: 'indexed-overlap-shaft-seal', severity: 'independent-review-required', recordIds: [IDS.shaftSealLong, IDS.shaftSealShort], detail: 'Two indexed IDs describe the same 2017-2022 compressor-shaft-seal identity. Both are corrected without redirecting or removing either page.' },
      { code: 'indexed-overlap-fuel-pump', severity: 'independent-review-required', recordIds: [IDS.lowPressureFuelPumpLong, IDS.lowPressureFuelPumpShort], detail: 'Two indexed IDs describe the same in-tank fuel-pump recall. Both are corrected without redirecting or removing either page.' },
      { code: 'false-bulletin-brake-match', severity: 'independent-review-required', recordIds: ['honda-crv-hybrid-brake-grinding-2020'], detail: 'The claimed Honda Bulletin 21-081 is an EVAP bulletin, not a brake-grinding bulletin. The indexed row remains byte-equivalent.' },
      { code: 'false-bulletin-acc-match', severity: 'independent-review-required', recordIds: ['honda-crv-acc-issues-2017'], detail: 'The claimed Honda Bulletin 22-014 covers Accord/Insight active-noise-cancellation booming, not CR-V adaptive cruise control. The indexed row remains byte-equivalent.' },
      { code: 'vtc-vs-tensioner-identity-mismatch', severity: 'independent-review-required', recordIds: ['honda-crv-timing-chain-tensioner-failure-2007'], detail: 'Honda Bulletin 09-010 supports a later-model VTC-actuator rattle, not the indexed 2007-2011 timing-chain-tensioner identity. No substitution is proposed.' },
      { code: 'display-scope-split', severity: 'independent-review-required', recordIds: ['honda-cr-v-infotainment-freezing-rebooting-apple-carplay-android-auto-d', IDS.infotainment], detail: 'Bulletin 19-066 supports the narrower dim/dark center-display page. It does not support the separate rebooting/CarPlay aggregation, which remains unchanged.' },
    ],
    summary,
    rows,
  };

  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary }, null, 2));
}

if (require.main === module) main();

module.exports = {
  FULL_RECORD_FIELDS,
  IDS,
  KEEP_NOTES,
  MISMATCH_SOURCES,
  REWRITE_CARDS,
  SOURCES,
  fullRecord,
  hashValue,
  normalizedFileHash,
  rewriteProposal,
};
