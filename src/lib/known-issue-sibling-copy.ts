import sources from '@/data/six-known-issue-sources.json';

// Editorial presentation only. Exact source wording and applicability remain
// the boundary; these records are never written back to the published database.
const copy: Record<string, {problem:string;repair:string;image:string;repairImage?:string}> = {
  'acura-mdx-auto-idle-stop-failure-to-restart': {
    problem:'Auto Idle-Stop may fail to restart the engine; this exact 2019 Technology SH-AWD configuration is included in Acura 23-001.',
    repair:'Ask an Acura dealer to check VIN, software and the applicable PGM-FI update and inspection procedure in bulletin 23-001. Confirm coverage with the dealer; no automatic warranty entitlement, disable module or replacement part is recommended. Source: https://static.nhtsa.gov/odi/tsbs/2023/MC-10229687-0001.pdf',image:'part-engine.webp'},
  'acura-mdx-fuel-pump-impeller-deformation-causing-stall': {
    problem:'A deformed in-tank fuel-pump impeller can stop fuel delivery and cause a stall or no-start on recalled VINs.',
    repair:'Check your VIN for recall 23V858 with Acura. The dealer replaces the affected fuel-pump module free of charge when the recall applies; do not buy a pump from symptoms alone.',image:'part-fuel-pump-module.webp'},
  'acura-mdx-infotainment-reboot-2014': {
    problem:'Infotainment reboots can interrupt navigation, audio and camera display.',
    repair:'Have Acura check the installed software, power and module faults. Apply the appropriate software remedy before considering diagnosed hardware; confirm any coverage by VIN.',image:'part-infotainment-module.webp'},
  'acura-mdx-torque-converter-shudder-2014': {
    problem:'Shudder on this nine-speed MDX needs diagnosis; older transmission advice does not identify a failed converter or the correct fluid.',
    repair:'Have a qualified Acura technician diagnose shudder, check software and confirm the nine-speed transmission by VIN. If fluid service is indicated, use Acura ATF Type 3.1 (08200-9017) and the specified level/temperature procedure, per the 2019 MDX Owner Manual, Transmission Fluid, page 677. Do not replace the converter without diagnostic evidence. Source: https://owners.acura.com/utility/download?path=/static/pdfs/2019/MDX/2019_MDX_Owners_Manual.pdf',image:'part-transmission.webp',repairImage:'part-transmission-fluid.webp'},
  'acura-mdx-zf-9-speed-transmission-hesitation-hard-shifts-stalling': {
    problem:'The nine-speed automatic can hesitate or shift harshly; software and mechanical faults require diagnosis.',
    repair:'Ask Acura to check VIN-specific bulletins, software and fault data before prescribing parts. Follow the applicable diagnostic and update procedure; do not assume a warranty extension or a universal transmission replacement.',image:'part-transmission.webp'},
  'lincoln-nautilus-2-0l-ecoboost-coolant-loss-egr-cooler-leak-low-coolant-white': {
    problem:'On the 2.0L engine, coolant loss or white exhaust may involve an EGR-cooler leak; the symptom alone does not prove engine damage.',
    repair:'Have Lincoln follow TSB 20-2234: check PCM software, pressure-test the cooling system and inspect the EGR cooler. Replace the cooler and outlet only if the specified leak is confirmed; otherwise continue normal cooling diagnosis. This engine/EGR area highlight does not diagnose a radiator failure. Source: https://static.nhtsa.gov/odi/tsbs/2020/MC-10177867-0001.pdf',image:'part-egr-cooler.webp'},
  'lincoln-nautilus-8f35-8-speed-automatic-shudder-buck-jerk-under-35-mph': {
    problem:'An 8F35 shudder or buck below 35 mph may match Ford 21-2389 on vehicles built on or before March 11, 2021.',
    repair:'Have Lincoln confirm the symptom, build and bulletin applicability, then perform the specified PCM and solenoid-strategy programming and adaptive relearn. Temporary shift changes may follow relearning. Fluid service is not a substitute for this software repair; MERCON ULV is relevant only if separate fluid service is indicated. Source: https://static.nhtsa.gov/odi/tsbs/2021/MC-10203649-0001.pdf',image:'part-transmission.webp'},
  'lincoln-nautilus-auto-start-stop-malfunction-engine-won-t-auto-restart': {
    problem:'A failed automatic restart can involve battery condition, charging, battery management or software.',
    repair:'Have Lincoln test battery condition and charging, inspect battery-management faults and check applicable software before selecting a repair. Do not treat a start-stop defeat device as a repair.',image:'part-battery.webp'},
  'lincoln-nautilus-rearview-camera-software-error-blank-image-image-that-won-t': {
    problem:'Rear-camera software can show a blank or retained image on vehicles included in recall 25S72 / 25V442.',
    repair:'Check your VIN with Lincoln for 25S72. If open, the dealer installs the recall software update free of charge; no camera purchase is indicated. Use mirrors and direct observation when the image is unavailable.',image:'part-backup-camera.webp'},
  'lincoln-nautilus-sync-3-apim-infotainment-freezes-black-screens-reboots': {
    problem:'SYNC 3 can freeze, reboot or show a black display.',
    repair:'Check the applicable SYNC software and reset procedure, then ask Lincoln to diagnose persistent power, network or APIM faults before ordering a module. Navigation equipment and VIN determine any replacement fitment.',image:'part-infotainment-module.webp'},
  'nissan-kicks-blank-partial-instrument-cluster-cold-start': {
    problem:'A cluster software fault can hide required telltales on affected redesigned Kicks vehicles.',
    repair:'Check your VIN for recall 26V331 / PMA66. The Nissan dealer performs the applicable instrument-cluster software update free of charge; this is not a cluster purchase recommendation.',image:'part-infotainment-module.webp'},
  'nissan-kicks-center-display-goes-blank-reverse-no-backup-camera-image': {
    problem:'Center-display software may suppress the rear-camera image on affected 2025 Kicks VINs.',
    repair:'Check VIN eligibility for recall 25V324 / PMA48 with Nissan and obtain the free applicable software update. Use mirrors and direct observation when the camera image is unavailable; no display purchase is indicated.',image:'part-infotainment-module.webp'},
  'nissan-kicks-infotainment-touchscreen-freezing-rebooting-carplay-disconne': {
    problem:'Touchscreen freezes, reboots or phone disconnections need diagnosis on the redesigned 2025 Kicks.',
    repair:'Check the phone, supported connection and data cable, then ask Nissan to confirm VIN-specific software and diagnose persistent faults. NTB23-018 predates the redesigned 2025 P16 and does not establish its eligibility or guarantee a firmware remedy. Source: https://static.nhtsa.gov/odi/tsbs/2023/MC-10234078-0001.pdf',image:'part-infotainment-module.webp'},
  'nissan-murano-automatic-emergency-braking-forward-collision-phantom-activa': {
    problem:'Unexpected automatic braking or forward-collision warnings may involve front sensor obstruction, alignment or a fault.',
    repair:'Record the event and warnings; have Nissan inspect the front sensor area, scan faults and confirm calibration or applicable software before replacing hardware. The highlighted area is driver assistance, not the radiator.',image:'part-radar-sensor.webp'},
  'nissan-murano-battery-drain-and-no-start-2021': {
    problem:'Battery discharge and no-start can follow excessive parked electrical draw or a weak battery.',
    repair:'Have the battery and charging system tested, then measure parasitic draw after the modules sleep. Repair the confirmed draw or module fault before replacing a battery; a charger alone does not repair the cause.',image:'part-battery.webp'},
  'nissan-murano-front-driver-seat-frametrack-2021': {
    problem:'The driver seat can rock or click from a loose or worn seat-track mounting component.',
    repair:'Have the seat mounts, bolts, alignment and track inspected. Correct only the confirmed loose or failed component using Nissan service instructions; do not assume the complete seat requires replacement.',image:'part-seat-track.webp'},
  'nissan-murano-front-radarsensor-malfunctions-triggering-2021': {
    problem:'A front-radar fault can trigger warnings or disable driver-assistance functions.',
    repair:'Have Nissan confirm codes and NTB19-033G applicability. Check obstruction, weather and the sensor manufacture criteria, follow the code-specific diagnostic flow and align the sensor if replacement is directed. Do not infer a radar replacement from a warning alone.',image:'part-radar-sensor.webp'},
  'nissan-murano-rearview-camera-image-blank-2021': {
    problem:'An intermittent blank rear-camera image reduces available reversing information.',
    repair:'Check your VIN for applicable Nissan campaigns, then diagnose software, wiring and camera faults as directed. No blanket recall eligibility or camera replacement is implied; use mirrors and direct observation when the image fails.',image:'part-backup-camera.webp'},
};
const conciseRepair: Record<string,string> = {
  'acura-mdx-auto-idle-stop-failure-to-restart':'Have Acura confirm VIN eligibility and follow bulletin 23-001 software and inspection steps; confirm coverage first.',
  'acura-mdx-fuel-pump-impeller-deformation-causing-stall':'Check recall 23V858 by VIN; an eligible open recall receives the dealer pump-module remedy, not a retail purchase.',
  'acura-mdx-infotainment-reboot-2014':'Check software, power and module faults with Acura before selecting hardware.',
  'acura-mdx-torque-converter-shudder-2014':'Diagnose and check software first. If fluid service is indicated, this nine-speed uses Acura ATF Type 3.1.',
  'acura-mdx-zf-9-speed-transmission-hesitation-hard-shifts-stalling':'Have Acura confirm the applicable software and diagnostic procedure before prescribing parts.',
  'lincoln-nautilus-2-0l-ecoboost-coolant-loss-egr-cooler-leak-low-coolant-white':'Follow Ford 20-2234 software, pressure-test and EGR inspection steps; replace only a confirmed leaking cooler/outlet.',
  'lincoln-nautilus-8f35-8-speed-automatic-shudder-buck-jerk-under-35-mph':'Confirm Ford 21-2389 applicability, then perform its programming and adaptive relearn; fluid is not a software-repair substitute.',
  'lincoln-nautilus-auto-start-stop-malfunction-engine-won-t-auto-restart':'Test battery, charging and battery management, then check applicable software before selecting a repair.',
  'lincoln-nautilus-rearview-camera-software-error-blank-image-image-that-won-t':'Check VIN eligibility for 25S72 and obtain the free recall software update; no camera purchase is indicated.',
  'lincoln-nautilus-sync-3-apim-infotainment-freezes-black-screens-reboots':'Check SYNC software and diagnose persistent power, network or APIM faults before buying a module.',
  'nissan-kicks-blank-partial-instrument-cluster-cold-start':'Check VIN eligibility for 26V331 / PMA66 and obtain the applicable free Nissan software update.',
  'nissan-kicks-center-display-goes-blank-reverse-no-backup-camera-image':'Check VIN eligibility for 25V324 / PMA48 and obtain the applicable free Nissan software update.',
  'nissan-kicks-infotainment-touchscreen-freezing-rebooting-carplay-disconne':'Check the phone and cable, then ask Nissan for VIN-specific diagnosis; older NTB23-018 does not establish 2025 eligibility.',
  'nissan-murano-automatic-emergency-braking-forward-collision-phantom-activa':'Have Nissan diagnose front sensors, faults and calibration before replacing hardware.',
  'nissan-murano-battery-drain-and-no-start-2021':'Test battery/charging and parked draw after modules sleep; repair the diagnosed cause before replacing the battery.',
  'nissan-murano-front-driver-seat-frametrack-2021':'Inspect mounts, bolts and track; correct only the confirmed loose or failed component.',
  'nissan-murano-front-radarsensor-malfunctions-triggering-2021':'Confirm codes and NTB19-033G criteria; inspect and calibrate as directed, not from a warning alone.',
  'nissan-murano-rearview-camera-image-blank-2021':'Check VIN campaigns and diagnose software, wiring and camera faults; no blanket recall or replacement is implied.',
};
export const REVIEWED_SIBLING_COPY = sources.map(source=>({
  id:source.id, sourceDescription:source.description, sourceSolution:source.solution,
  sourceYears:source.years,sourceTrims:source.trims,sourceEngines:source.engines,sourceCitations:source.citations.map(row=>'url' in row ? row.url : undefined),
  sourceCitationRecords:source.citations,
  ...copy[source.id],repair:conciseRepair[source.id],reviewedMechanism:copy[source.id].problem,reviewedAction:copy[source.id].repair,
  scope:'Only the displayed reviewed engine, drivetrain and equipment configuration; confirm VIN, build, software and optional equipment before applying a bulletin or recall.',
}));
