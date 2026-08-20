import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const root = process.cwd();
const sourcePath = path.join(root, "data", "buick-repair-first-review", "source-snapshot.json");
const outputDir = path.join(root, "outputs", "buick-repair-first-review");
const dataDir = path.join(root, "data", "buick-repair-first-review");
const source = JSON.parse(await fs.readFile(sourcePath, "utf8"));

const decisions = {
  "buick-3800-lower-intake-gasket-lesabre": {
    repairItems: "Lower intake manifold gasket; inspect/replace upper intake plenum; drain coolant; optional EGR stovepipe and throttle-body gaskets",
    decision: "CONTENT CORRECTION + PARTIAL APPROVAL",
    destinations: [
      ["Fel-Pro MS98014T intake manifold gasket set", "https://www.autozone.com/p/fel-pro-engine-intake-manifold-gasket-set-ms98014t/217566", "1996-2005 LeSabre 3.8L; verify VIN/engine before purchase", "primary repair part"],
    ],
    evidence: [
      "https://www.partsgeek.com/mmparts/intake_manifold_gasket/buick/lesabre.html",
      "https://www.ebay.com/itm/236597628678",
    ],
    reason: "The named MS98003T is a 3.1/3.4L application. MS98014T is the verified 3800 gasket. The product does not cover the optional plenum or ancillary gaskets.",
    correction: "Replace MS98003T with MS98014T. Narrow verified link scope to 1996-2005; hold 1995 until its exact engine/VIN split is confirmed.",
  },
  "buick-3800-lower-intake-gasket-park-avenue": {
    repairItems: "Lower intake manifold gasket; inspect/replace upper intake plenum; drain/refill coolant; inspect oil contamination",
    decision: "CONTENT CORRECTION + PARTIAL APPROVAL",
    destinations: [
      ["Fel-Pro MS98014T intake manifold gasket set", "https://www.autozone.com/p/fel-pro-engine-intake-manifold-gasket-set-ms98014t/217566", "1995-2005 Park Avenue 3.8L; confirm naturally aspirated vs supercharged configuration and VIN", "primary repair part"],
    ],
    evidence: ["https://www.ebay.com/itm/375107875198"],
    reason: "MS98014T is the correct 3800 lower-intake set; MS98003T is not. The optional upper plenum and coolant choice remain separate decisions.",
    correction: "Replace MS98003T with MS98014T. Remove the blanket recommendation to replace Dex-Cool with Zerex G-05 unless supported by the service information for the exact vehicle.",
  },
  "buick-cascada-1.6t-timing-chain": {
    repairItems: "Timing chain, guides, tensioner and remaining kit hardware; walnut-blast service; dexos2 5W-30",
    decision: "PARTIAL APPROVAL",
    destinations: [
      ["Genuine GM timing chain 55569250", "https://www.gmpartsgiant.com/parts/gm-chain-cm-shf-tmg-55569250.html", "2016-2019 Cascada 1.6L", "partial component"],
      ["Genuine GM timing-chain guide 55569246", "https://www.gmpartsgiant.com/parts/gm-guide-tmg-chain-55569246.html", "2016-2019 Cascada 1.6L", "partial component"],
      ["Genuine GM timing-chain tensioner 55500814", "https://www.gmpartsgiant.com/parts/gm-tensioner-asm-tmg-chain-55500814.html", "2016-2019 Cascada 1.6L", "partial component"],
    ],
    evidence: [],
    reason: "Each OEM component has exact Cascada fitment, but these three links are not a complete kit. Walnut blasting is a service, not a product substitute.",
    correction: "Label every component as partial. Do not present a turbocharger, scanner, or a single timing component as the complete repair.",
  },
  "buick-enclave-6t70-6t75-transmission-wave-plate-failure": {
    repairItems: "Updated 3-5-R wave plate/drum repair; damaged hard parts; debris cleanout; possible remanufactured transmission",
    decision: "SPECIALIST SERVICE / HOLD RETAIL CTA",
    destinations: [
      ["Sonnax 124555K 3-5-R drum saver kit", "https://www.sonnax.com/parts/4810-3-5-r-drum-saver-kit", "6T70/6T75 Gen 1/2; transmission identification required", "technical component reference"],
    ],
    evidence: [
      "https://static.nhtsa.gov/odi/tsbs/2015/SB-10057637-4073.pdf",
      "https://static.nhtsa.gov/odi/tsbs/2012/SB-10062512-7690.pdf",
    ],
    reason: "The Sonnax kit addresses the wave-plate/drum failure but does not cover all hard-part damage, converter damage, labor, programming, or debris cleanout.",
    correction: "Gate by transmission ID and diagnosis. Route to a transmission specialist; do not imply that buying one kit completes the rebuild.",
  },
  "buick-enclave-excessive-oil-consumption-engine-failure-3-6l": {
    repairItems: "Diagnosis per GM PIP5084; PCV/oil-control updates if applicable; possible engine replacement",
    decision: "DIAGNOSIS-FIRST HOLD",
    destinations: [
      ["Buick dealer locator", "https://www.buick.com/locate-buick-dealer", "2008-2010 Enclave; diagnosis and VIN-specific repair", "service locator"],
    ],
    evidence: [],
    reason: "The remedy ranges from updates to complete engine replacement. No single part can be recommended until the consumption/block failure is diagnosed.",
    correction: "Keep commerce off until diagnosis identifies the failed component. A service/dealer locator is appropriate.",
  },
  "buick-enclave-hvac-blend-door-actuator-failure": {
    repairItems: "Failed HVAC actuator at the diagnosed position; HVAC recalibration",
    decision: "POSITION-SPECIFIC PARTIAL APPROVAL",
    destinations: [
      ["GM HVAC actuator 20826182 / ACDelco 15-73989", "https://parts.gmparts.com/product/gm-genuine-parts-air-conditioning-actuator-20826182", "2008-2013 Enclave; confirm actuator position by VIN", "position-specific part"],
      ["GM temperature-door actuator 22816196", "https://www.gmpartsgiant.com/parts/gm-actuator-22816196.html", "2013-2017 Enclave 3.6L; confirm actuator position by VIN", "position-specific part"],
    ],
    evidence: ["https://www.dormanproducts.com/p-79235-604-924.aspx"],
    reason: "The Enclave has multiple HVAC actuators that are not interchangeable. The failed position must be diagnosed before purchase; recalibration remains a service step.",
    correction: "Display a mandatory position/VIN check. Never label either actuator as fitting every HVAC-door location.",
  },
  "buick-enclave-loss-power-steering-assist": {
    repairItems: "Power-steering pump; inspect fluid and lines; Special Coverage eligibility check",
    decision: "COVERAGE-FIRST + PARTIAL APPROVAL",
    destinations: [
      ["Buick recall/coverage lookup", "https://www.buick.com/ownercenter/recalls", "VIN required", "coverage check"],
      ["A-Premium power-steering pump APPSP0062", "https://a-premium.com/product/Power-Steering-Pump-for-2008-2017-Buick-Enclave-85Av08qeyw", "2008-2011 issue scope; product lists 2008-2017 Enclave", "pump only after coverage/diagnosis"],
    ],
    evidence: ["https://static.nhtsa.gov/odi/tsbs/2014/SB-10081074-0335.pdf"],
    reason: "Coverage/VIN check comes before retail. The pump link does not include fluid, lines, steering gear work, or labor.",
    correction: "Set recallFirst/coverage-first behavior and make the retail pump secondary.",
  },
  "buick-enclave-power-steering-recall": {
    repairItems: "VIN eligibility; dealer flush; pump; steering-gear valve housing as directed by Special Coverage 14329",
    decision: "COVERAGE-FIRST / NO RETAIL CTA",
    destinations: [
      ["Buick recall/coverage lookup", "https://www.buick.com/ownercenter/recalls", "2008-2011 Enclave; VIN required", "official coverage check"],
      ["NHTSA VIN recall lookup", "https://www.nhtsa.gov/recalls", "VIN required; safety recalls only", "official recall lookup"],
    ],
    evidence: ["https://static.nhtsa.gov/odi/tsbs/2014/SB-10081074-0335.pdf"],
    reason: "The How to Fix explicitly calls for VIN-based coverage and a multi-step dealer remedy. A generic pump link would omit the flush and valve-housing work.",
    correction: "Use official coverage/dealer routing. Do not place a buy-parts CTA ahead of the VIN check.",
  },
  "buick-enclave-rear-c-evaporator-corrosion-refrigerant-leaks": {
    repairItems: "Leak diagnosis with dye/UV; auxiliary evaporator or leaking line; rear blower if debris-damaged; refrigerant recover/evacuate/recharge",
    decision: "DIAGNOSIS-GATED PARTIAL APPROVAL",
    destinations: [
      ["Genuine GM auxiliary A/C evaporator 84802280", "https://www.gmpartsgiant.com/parts/gm-evaporator-asm-aux-a-c-84802280.html", "2013-2016 issue scope; product lists 2008-2024 Enclave 3.6L", "only if auxiliary core leak is confirmed"],
    ],
    evidence: ["https://static.nhtsa.gov/odi/tsbs/2016/MC-10116900-9999.pdf"],
    reason: "The TSB identifies auxiliary-evaporator corrosion, but the How to Fix also allows a line or blower failure. Refrigerant work requires proper recovery equipment.",
    correction: "Require leak-source confirmation before showing the core as the repair. Do not reuse this link for a leaking line or blower failure.",
  },
  "buick-enclave-stretched-worn-timing-chain-3-6l-v6": {
    repairItems: "Complete timing chains, guides and tensioners; Special Coverage 11340C check; correct oil",
    decision: "COVERAGE-FIRST + YEAR-SPLIT APPROVAL",
    destinations: [
      ["ACDelco timing-chain kit 12700436", "https://www.partsgeek.com/vkz4by3-buick-enclave-timing-chain-kit.html", "2009-2013 Enclave 3.6L LLT VIN D", "complete kit for verified year/engine split"],
      ["Buick recall/coverage lookup", "https://www.buick.com/ownercenter/recalls", "VIN required", "coverage check"],
    ],
    evidence: [
      "https://static.nhtsa.gov/odi/tsbs/2012/SB-10063069-7690.pdf",
      "https://static.nhtsa.gov/odi/tsbs/2013/MC-10134650-9999.pdf",
    ],
    reason: "The ACDelco kit is verified for 2009-2013 LLT/VIN D. The 2008 LY7 application is different and remains held.",
    correction: "Split 2008 LY7 from 2009-2013 LLT. Flag as overlapping/duplicative with buick-enclave-timing-chain-2008-2012.",
  },
  "buick-enclave-timing-chain-2008-2012": {
    repairItems: "Timing-chain repair; intake-valve walnut blast; PCV update; possible engine replacement",
    decision: "CONTENT CORRECTION + PARTIAL APPROVAL",
    destinations: [
      ["ACDelco timing-chain kit 12700436", "https://www.partsgeek.com/vkz4by3-buick-enclave-timing-chain-kit.html", "2009-2012 Enclave 3.6L LLT VIN D", "timing repair only"],
    ],
    evidence: ["https://static.nhtsa.gov/odi/tsbs/2013/MC-10134650-9999.pdf"],
    reason: "The product covers only the timing-chain portion. Walnut blasting and PCV updates are separate services, and 2008 is not an LLT application.",
    correction: "Correct the 2008 engine designation (LY7, not LLT), hold its part link, and consolidate this duplicate with the broader timing-chain issue.",
  },
  "buick-enclave-torque-converter-clutch-shudder": {
    repairItems: "DEXRON-VI fluid exchange; TCM reprogram and fast-learn; possible torque converter",
    decision: "FLUID APPROVAL + SERVICE GATE",
    destinations: [
      ["ACDelco GM OE DEXRON-VI full-synthetic ATF, 1 gallon, 88865618", "https://parts.buick.com/product/acdelco-gm-original-equipment-dexron-vi-full-synthetic-automatic-transmission-fluid-1-gal-88865618", "2014-2020 Enclave; confirm transmission and bulletin procedure", "specified fluid"],
    ],
    evidence: [
      "https://static.nhtsa.gov/odi/tsbs/2018/MC-10187432-9999.pdf",
      "https://static.nhtsa.gov/odi/tsbs/2021/MC-10201297-9999.pdf",
    ],
    reason: "The fluid is verified for the full issue span. TCM programming/fast-learn and converter diagnosis are shop procedures, not replaced by the fluid link.",
    correction: "Update obsolete/bulk part 88862156 to current retail GM package 88865618 while retaining the DEXRON-VI specification.",
  },
  "buick-enclave-water-pump-leak-coolant-loss-3-6l-v6": {
    repairItems: "Water pump and gasket; thermostat/gasket if diagnosed; coolant refill and bleed",
    decision: "PART APPROVAL",
    destinations: [
      ["GM Genuine water-pump kit with gasket 12709178", "https://parts.buick.com/product/gm-genuine-parts-engine-water-pump-with-gasket-12709178", "2008-2017 Enclave issue scope; GM catalog includes these years", "primary repair part"],
    ],
    evidence: ["https://www.gmpartsgiant.com/oem-buick-enclave-water_pump.html"],
    reason: "The GM product is an exact water-pump-with-gasket repair part for the issue span. Thermostat replacement remains conditional.",
    correction: "Keep thermostat/gasket as 'as needed' and include the cooling-system bleed step; do not imply the pump covers every coolant leak.",
  },
  "buick-encore-1.4-turbo-timing-chain": {
    repairItems: "Timing chain, tensioner, guides and sprockets; dexos1 5W-30 maintenance",
    decision: "YEAR-SPLIT PARTIAL APPROVAL",
    destinations: [
      ["Cloyes 9-4311S timing-chain kit", "https://frsport.com/products/cloyes-kit-timing-w-sprockets-9-4311s", "2013-2021 Encore 1.4L; verify VIN/engine", "timing kit"],
    ],
    evidence: [
      "https://www.oreillyauto.com/shop/b/engines---transmissions/timing-parts/timing-set/timing-chain-kit/9438d0f2adb0/v/a/127968/automotive-truck-2013-buick-encore",
      "https://cobaltindustrial.ca/products/cloyes-gear-product-9-4311s-timing-chain-kit-engine-timing-chain-kit",
    ],
    reason: "The kit has verified 2013-2021 1.4L fitment; the issue's 2022 model year remains unverified for this exact product.",
    correction: "Hold 2022 rather than stretching the product fitment. Confirm kit contents before claiming every sprocket/guide is included.",
  },
  "buick-encore-6t40-automatic-transmission-hard-shifting-shudder-slipping": {
    repairItems: "Correct DEXRON-VI fluid service; possible TCC/solenoid; valve body/channel plate; rebuild; software calibration",
    decision: "FLUID APPROVAL + DIAGNOSIS-FIRST HOLD",
    destinations: [
      ["ACDelco GM OE DEXRON-VI ATF, 1 quart, 88865601", "https://parts.buick.com/product/acdelco-gm-original-equipment-dexron-vi-automatic-transmission-fluid-1-qt-88865601", "2013-2018 Encore issue scope; official catalog lists 2013-2022", "fluid service only"],
    ],
    evidence: [
      "https://static.nhtsa.gov/odi/tsbs/2013/MC-10139032-9999.pdf",
      "https://static.nhtsa.gov/odi/tsbs/2016/MC-10112296-9999.pdf",
    ],
    reason: "DEXRON-VI is verified, but the remaining fixes depend on whether the fault is converter, solenoid/TEHCM, valve body, calibration, or internal damage.",
    correction: "Do not link a solenoid, TEHCM, scanner, or rebuild kit until diagnosis identifies that repair. The fluid link is not a promise that service cures slipping.",
  },
};

Object.assign(decisions, {
  "buick-encore-encore-gx-three-cylinder-turbo-stalling-low-oil-pressure-ecm": {
    repairItems: "ECM recall calibration; scan-tool diagnosis if the recall does not resolve the condition; verify oil level/pressure",
    decision: "CONTENT CORRECTION + RECALL-FIRST",
    destinations: [["Buick recall lookup", "https://www.buick.com/ownercenter/recalls", "2020-2023 Encore GX; VIN required", "official recall/service link"]],
    evidence: [],
    reason: "The repair begins with an ECM calibration and VIN eligibility, not a timing, oil-pump, or scanner purchase.",
    correction: "The title says Encore/Encore GX, but the three-cylinder application is Encore GX. Replace the unrelated purge-valve citation before publication.",
  },
  "buick-encore-encore-gx-transmission-shudder-jerking-solenoid-faults": {
    repairItems: "Transmission-capable diagnosis; software; solenoid/valve body, torque converter or transmission only after fault isolation",
    decision: "DIAGNOSIS-FIRST SERVICE LINK",
    destinations: [["Buick dealer locator", "https://www.buick.com/locate-buick-dealer", "2020-2023 Encore GX; transmission identification and module diagnosis required", "service locator"]],
    evidence: [],
    reason: "The How to Fix names several mutually exclusive repairs. A generic OBD scanner or single transmission part would be misleading.",
    correction: "Replace the unrelated charge-air-cooler citation and keep commerce gated by transmission ID and diagnosis.",
  },
  "buick-encore-engine-stalling-sudden-power-loss-while-driving": {
    repairItems: "Scan-tool and fuel/air diagnosis; repair the confirmed sensor, throttle-body, turbo, PCV or calibration fault",
    decision: "DIAGNOSIS-FIRST SERVICE LINK",
    destinations: [["Buick dealer locator", "https://www.buick.com/locate-buick-dealer", "2013-2015 Encore 1.4L; diagnose before ordering", "service locator"]],
    evidence: [],
    reason: "The symptom has multiple unrelated causes and the repair text explicitly requires diagnosis.",
    correction: "Do not generate an OBD or throttle-body CTA from the error codes alone.",
  },
  "buick-encore-evap-purge-pump-failure-warranty-extension": {
    repairItems: "VIN eligibility and dealer replacement of the EVAP purge pump under special coverage",
    decision: "COVERAGE-FIRST / NO RETAIL PART",
    destinations: [["Buick recall and coverage lookup", "https://www.buick.com/ownercenter/recalls", "2022 Encore; VIN required", "official coverage link"]],
    evidence: ["https://static.nhtsa.gov/odi/tsbs/2023/MC-10238343-0001.pdf"],
    reason: "The stated repair is a covered purge-pump replacement. The coverage check should precede any purchase.",
    correction: "Keep the CTA on official VIN coverage rather than a generic purge valve.",
  },
  "buick-encore-excessive-oil-consumption": {
    repairItems: "Oil-consumption test; PCV/cam cover if confirmed; intake/check valve or piston-ring repair only when diagnosed",
    decision: "DIAGNOSIS-GATED PARTIAL APPROVAL",
    destinations: [
      ["GM Genuine 25209141 camshaft/valve cover", "https://cruzekits.com/products/gm-acdelco-25203036-camshaft-valve-cover", "2013-2021 Encore 1.4L except LE2; only after PCV/cam-cover diagnosis", "conditional repair part"],
      ["Buick dealer locator", "https://www.buick.com/locate-buick-dealer", "Oil-consumption test and internal-engine diagnosis", "service locator"],
    ],
    evidence: ["https://static.nhtsa.gov/odi/tsbs/2020/MC-10178406-9999.pdf"],
    reason: "The live product includes the gasket and bolts and lists 2013+ Encore excluding LE2, but it does not address intake check-valve or ring failure.",
    correction: "Show the valve cover only after diagnosis; keep ring/short-block work as service-only.",
  },
  "buick-encore-gx-1.2-1.3-turbo-shudder": {
    repairItems: "Identify CVT versus 9-speed; calibration/fast learn; transmission-specific fluid; valve body or converter only if diagnosed",
    decision: "TRANSMISSION-SPLIT SERVICE LINK",
    destinations: [["Buick dealer locator", "https://www.buick.com/locate-buick-dealer", "2020-2024 Encore GX; VIN/transmission required", "service locator"]],
    evidence: [],
    reason: "The CVT and 9-speed use different procedures and fluids. A shared fluid or solenoid link would be unsafe.",
    correction: "Replace the unrelated turbo-coverage citations and split the repair by transmission before adding parts.",
  },
  "buick-encore-gx-ecm-ignition-timing-fault-causing-engine-knock-after-auto-st": {
    repairItems: "Recall ECM reprogramming",
    decision: "RECALL SOFTWARE / NO PART",
    destinations: [["Buick recall lookup", "https://www.buick.com/ownercenter/recalls", "2024 Encore GX; VIN required", "official recall link"]],
    evidence: ["https://static.nhtsa.gov/odi/tsbs/2024/MC-11006392-0001.pdf"],
    reason: "The remedy is software only; no retail part or scanner purchase is called for.",
    correction: "Use the official VIN/recall route.",
  },
  "buick-encore-gx-electronic-brake-boost-sensor-connection-failure-loss-power": {
    repairItems: "Recall inspection and dealer replacement of the electronic brake-boost module as directed",
    decision: "SAFETY RECALL / NO RETAIL PART",
    destinations: [["Buick recall lookup", "https://www.buick.com/ownercenter/recalls", "2020-2021 Encore GX; VIN required", "official recall link"]],
    evidence: ["https://static.nhtsa.gov/odi/rcl/2020/RCSB-20V588-8771.pdf"],
    reason: "This is a safety-recall remedy with VIN-controlled parts and procedures.",
    correction: "Do not place a brake-booster purchase ahead of the recall repair.",
  },
  "buick-encore-gx-false-shift-to-park-warning-park-switch-failure": {
    repairItems: "Inspect shifter terminals/harness; replace shifter control only if terminals are undamaged and the bulletin directs replacement",
    decision: "TSB DIAGNOSIS / HOLD RETAIL PART",
    destinations: [["Buick dealer locator", "https://www.buick.com/locate-buick-dealer", "2020-2023 Encore GX; inspect connector before parts", "service locator"]],
    evidence: ["https://static.nhtsa.gov/odi/tsbs/2024/MC-11009103-0001.pdf"],
    reason: "The shifter is conditional; harness or terminal damage changes the repair.",
    correction: "Do not link a shifter assembly until VIN and connector condition establish the correct part.",
  },
  "buick-encore-gx-incorrect-catalytic-converter-installed-factory": {
    repairItems: "Emission-recall inspection and VIN-specific catalytic-converter replacement",
    decision: "CONTENT CORRECTION + RECALL-FIRST",
    destinations: [["Buick recall lookup", "https://www.buick.com/ownercenter/recalls", "Encore GX; VIN required", "official recall link"]],
    evidence: ["https://static.nhtsa.gov/odi/tsbs/2021/MC-10197318-9999.pdf", "https://static.nhtsa.gov/odi/tsbs/2023/MC-10232163-0001.pdf"],
    reason: "The recall supplies the correct converter by VIN; a retail converter risks the wrong emissions calibration.",
    correction: "Verify the published year span because the cited campaigns cover specific 2020-2021 and 2023 populations rather than every 2020-2023 vehicle.",
  },
  "buick-encore-gx-instrument-panel-display-goes-blank-while-driving": {
    repairItems: "Recall VCU software update by dealer or approved OTA process",
    decision: "RECALL SOFTWARE / NO PART",
    destinations: [["Buick recall lookup", "https://www.buick.com/ownercenter/recalls", "2024 Encore GX; VIN required", "official recall link"]],
    evidence: ["https://static.nhtsa.gov/odi/rcl/2023/RCLRPT-23V744-5341.PDF"],
    reason: "The remedy is software, not an instrument-cluster or scanner purchase.",
    correction: "Route users to the official recall workflow.",
  },
  "buick-encore-pcv-camshaft-cover-diaphragm-failure-tea-kettle-whistle": {
    repairItems: "Integrated PCV camshaft cover; inspect intake-manifold check valve; coverage eligibility",
    decision: "COVERAGE-FIRST + PART APPROVAL",
    destinations: [
      ["GM Genuine 25209141 camshaft/valve cover", "https://cruzekits.com/products/gm-acdelco-25203036-camshaft-valve-cover", "2013-2021 Encore 1.4L except LE2; cover, gasket and bolts", "primary repair part"],
      ["Buick recall and coverage lookup", "https://www.buick.com/ownercenter/recalls", "VIN required before purchase", "official coverage link"],
    ],
    evidence: ["https://static.nhtsa.gov/odi/tsbs/2020/MC-10178406-9999.pdf"],
    reason: "The live page explicitly includes the valve cover gasket/bolts and Encore fitment. Intake-manifold check-valve damage remains a separate diagnosis.",
    correction: "Do not call the cover a complete repair when the intake check valve has also failed.",
  },
  "buick-encore-turbocharger-oil-supply-line-failure-causing-sudden-loss-pow": {
    repairItems: "Turbocharger assembly; new oil feed/return lines; seals, gaskets and hardware; coverage check",
    decision: "COVERAGE-FIRST + PARTIAL APPROVAL",
    destinations: [
      ["Genuine Buick turbocharger assembly 25201063", "https://www.gmpartsgiant.com/parts/buick-turbocharger-asm~25201063.html", "2013-2018 Encore 1.4L; VIN confirmation required", "turbo assembly"],
      ["Buick recall and coverage lookup", "https://www.buick.com/ownercenter/recalls", "2017-2018 coverage population; VIN required", "official coverage link"],
    ],
    evidence: ["https://static.nhtsa.gov/odi/tsbs/2024/MC-10250285-0001.pdf"],
    reason: "The OEM page verifies the turbo assembly and instructs replacement of feed/return lines, which are not included in the single link.",
    correction: "Label this partial and list lines/seals/hardware separately after VIN lookup.",
  },
  "buick-envision-top-end-engine-ticking-from-hydraulic-lash-adjusters": {
    repairItems: "Dealer inspection; matched lash adjusters and rocker arms only for confirmed affected positions",
    decision: "WARRANTY SERVICE / HOLD RETAIL PART",
    destinations: [["Buick dealer locator", "https://www.buick.com/locate-buick-dealer", "2025-2026 Envision LSY 2.0T; warranty inspection", "service locator"]],
    evidence: ["https://static.nhtsa.gov/odi/tsbs/2026/MC-11032771-0001.pdf"],
    reason: "Part count and positions are determined during inspection and the repair is within the powertrain-warranty context.",
    correction: "Do not sell a generic lifter set before inspection.",
  },
  "buick-lacrosse-3-6l-v6-timing-chain-stretch-wear": {
    repairItems: "Complete timing chains, guides and tensioners; inspect cam phasers; correct dexos1 oil",
    decision: "PARTIAL APPROVAL + CONTENT CORRECTION",
    destinations: [["ACDelco timing-chain kit 12700436", "https://www.finditparts.com/products/11901052/acdelco-12700436", "2010-2012 LaCrosse; confirm 3.6L RPO/VIN", "timing kit"]],
    evidence: ["https://static.nhtsa.gov/odi/tsbs/2012/MC-10113848-9999.pdf"],
    reason: "The live page is in stock, offers Add to Cart and lists 2010-2012 LaCrosse; the GM bulletin covers high-feature V6 chain kits, but cam phasers may be separate.",
    correction: "Replace the unrelated ignition-recall citation and require RPO/VIN confirmation.",
  },
  "buick-lacrosse-3-8l-v6-lower-intake-manifold-gasket-plastic-coolant-elbow-l": {
    repairItems: "Revised lower-intake gasket set; aluminum coolant elbows; coolant refill and contamination inspection",
    decision: "PART APPROVAL",
    destinations: [
      ["Fel-Pro MS98014T intake-manifold gasket set", "https://www.autozone.com/p/fel-pro-engine-intake-manifold-gasket-set-ms98014t/217566", "2005-2009 LaCrosse 3.8L; verify VIN/engine", "primary gasket set"],
      ["Dorman 47065HP aluminum coolant elbows", "https://www.autozone.com/p/dorman-oe-fix-hvac-heater-hose-connector-47065hp/99614", "GM 3.8L application; confirm both elbow shapes before purchase", "companion repair parts"],
    ],
    evidence: ["https://www.autozone.com/external-engine/intake-manifold-gaskets-plenum-gaskets/buick/lacrosse/2009"],
    reason: "The gasket set is listed for the 2009 LaCrosse and the metal elbows address the failure named in How to Fix.",
    correction: "Keep the engine/VIN check visible and do not substitute the similarly numbered MS98003T.",
  },
  "buick-lacrosse-3.6l-timing-chain": {
    repairItems: "Complete timing chains, guides and tensioners; oil service; LLT PCV update when applicable",
    decision: "YEAR/ENGINE-SPLIT PARTIAL APPROVAL",
    destinations: [["ACDelco timing-chain kit 12700436", "https://www.finditparts.com/products/11901052/acdelco-12700436", "2010-2012 LaCrosse high-feature V6; confirm RPO/VIN", "verified early-year timing kit"]],
    evidence: ["https://static.nhtsa.gov/odi/tsbs/2012/MC-10113848-9999.pdf"],
    reason: "The linked kit is verified for the early high-feature V6 application; the 2013-2016 LFX span needs its own exact kit.",
    correction: "Split LLT and LFX years instead of stretching one product across 2010-2016.",
  },
  "buick-lacrosse-driver-door-wiring-splice-corrosion": {
    repairItems: "Recall inspection/replacement of the door-harness splice; harness repair only as directed",
    decision: "RECALL-FIRST / NO RETAIL PART",
    destinations: [["Buick recall lookup", "https://www.buick.com/ownercenter/recalls", "2014 LaCrosse; VIN required", "official recall link"]],
    evidence: [],
    reason: "The repair depends on inspected corrosion extent and recall eligibility.",
    correction: "Do not sell a universal wiring pigtail as the complete repair.",
  },
  "buick-lacrosse-eassist-12v-battery-drain-service-battery-charging-system-wa": {
    repairItems: "Hybrid-system diagnosis; 12V battery, module or hybrid harness only when confirmed; recall/VIN check",
    decision: "DIAGNOSIS + COVERAGE-FIRST",
    destinations: [["Buick recall and coverage lookup", "https://www.buick.com/ownercenter/recalls", "2012-2016 LaCrosse eAssist; VIN required", "official coverage link"]],
    evidence: [],
    reason: "Battery drain can originate in the battery, modules or hybrid harness, so a battery link alone would be incomplete.",
    correction: "Require eAssist-capable diagnosis before parts.",
  },
  "buick-lacrosse-electronic-power-steering-connector-corrosion-loss-assist": {
    repairItems: "Recall inspection and sealing/repair of the EPS connector",
    decision: "SAFETY RECALL / NO RETAIL PART",
    destinations: [["Buick recall lookup", "https://www.buick.com/ownercenter/recalls", "2017 LaCrosse; VIN required", "official recall link"]],
    evidence: [],
    reason: "The remedy is VIN-controlled and connector-condition dependent.",
    correction: "Do not infer that the steering gear must be replaced.",
  },
  "buick-lacrosse-hvac-blower-motor-climate-control-module-failures": {
    repairItems: "Diagnose blower circuit; older blower motor/resistor; later ECC/HVAC module or software; inspect connectors",
    decision: "YEAR-SPLIT DIAGNOSIS + PARTIAL APPROVAL",
    destinations: [["2008 LaCrosse blower-motor resistor catalog", "https://www.autozone.com/cooling-heating-and-climate-control/blower-motor-resistor/buick/lacrosse/2008", "2008 LaCrosse; select exact resistor/control module after connector and HVAC-option check", "year-specific parts catalog"]],
    evidence: ["https://www.autozone.com/cooling-heating-and-climate-control/blower-motor-resistor/buick/lacrosse/2014"],
    reason: "The product category is live and year-filtered, but automatic-climate modules and resistor types differ across 2008-2014.",
    correction: "Split 2008-2009 hardware from later module/software cases; do not show one resistor for every year.",
  },
  "buick-lacrosse-intermittent-low-beam-headlight-failure": {
    repairItems: "Electrical diagnosis of harness, fuse block, relay/driver, switch, connector or lamp socket",
    decision: "DIAGNOSIS-FIRST SERVICE LINK",
    destinations: [["Buick dealer locator", "https://www.buick.com/locate-buick-dealer", "2005-2008 LaCrosse; electrical diagnosis required", "service locator"]],
    evidence: ["https://static.nhtsa.gov/odi/inv/2017/INRD-RQ17002-68739.pdf"],
    reason: "The How to Fix names several non-interchangeable causes; no single bulb, relay or harness is justified.",
    correction: "Do not link headlight bulbs when the known issue is an intermittent control-circuit failure.",
  },
  "buick-lacrosse-rear-suspension-toe-link-may-loosen-fracture": {
    repairItems: "Recall inspection/replacement of rear toe links and required fasteners; alignment",
    decision: "SAFETY RECALL / NO RETAIL PART",
    destinations: [["Buick recall lookup", "https://www.buick.com/ownercenter/recalls", "2017 LaCrosse; VIN required", "official recall link"]],
    evidence: [],
    reason: "Recall parts and alignment procedure are VIN-controlled.",
    correction: "Keep retail suspension links behind the recall check.",
  },
  "buick-lesabre-electronic-climate-control-programmer-blower-control-module": {
    repairItems: "Direct blower test; blower-control module on later cars or HVAC programmer on earlier cars",
    decision: "YEAR-SPLIT PARTIAL APPROVAL",
    destinations: [["Four Seasons 20956 A/C power/blower-control module", "https://www.partsgeek.com/84lcc9p-buick-lesabre-ac-power-module.html", "2000-2005 LeSabre 3.8L sedan; only after direct blower/circuit test", "later-year control module"]],
    evidence: ["https://www.gmpartsgiant.com/oem-buick-lesabre-hvac_control_module.html"],
    reason: "The live page is in stock with Add to Cart, lists 2000-2005 LeSabre 3.8L and cross-references OEM 52480042; 1992-1999 uses other programmers/modules.",
    correction: "Split the 1992-1999 applications and require automatic-climate option confirmation.",
  },
  "buick-lesabre-front-strut-mount-bearing-wear-clunking-popping-over-bumps-t": {
    repairItems: "Both front strut mounts/bearings or paired loaded struts; alignment",
    decision: "PART APPROVAL",
    destinations: [["Monroe Strut-Mate 902972 front strut mount kit", "https://www.shocksurplus.com/products/monroe-strut-mate-strut-mount-kit-902972", "2000-2005 LeSabre front; quantity two", "mount and bearing kit"]],
    evidence: [],
    reason: "The live page is in stock with Add to Cart and its fitment table lists 2000-2005 LeSabre front. Replace both sides and align afterward.",
    correction: "State that alignment and paired replacement remain required service steps.",
  },
  "buick-lesabre-fuel-pressure-regulator-diaphragm-leak-fire-risk-recall": {
    repairItems: "Recall/VIN check and revised fuel-pressure regulator if directed",
    decision: "SAFETY RECALL / NO RETAIL PART",
    destinations: [["Buick recall lookup", "https://www.buick.com/ownercenter/recalls", "1998-2000 LeSabre; VIN required", "official recall link"]],
    evidence: [],
    reason: "A fuel-leak/fire-risk campaign should route to the recall before a regulator purchase.",
    correction: "Do not bypass the recall with a generic regulator.",
  },
  "buick-lesabre-pass-key-anti-theft-system-fault-security-light-engine-crank": {
    repairItems: "Pass-Key diagnosis/relearn; ignition lock cylinder/sensor and keys only when confirmed",
    decision: "DIAGNOSIS-FIRST SERVICE LINK",
    destinations: [["Buick dealer locator", "https://www.buick.com/locate-buick-dealer", "1992-2005 LeSabre; theft-system generation and key code required", "service locator"]],
    evidence: [],
    reason: "The repair differs by Pass-Key generation and may be a relearn rather than hardware.",
    correction: "Do not promote resistor bypasses or a lock cylinder without diagnosing the exact system.",
  },
  "buick-lesabre-plastic-upper-intake-manifold-degradation-causing-coolant-le": {
    repairItems: "Revised upper intake plenum with gaskets/EGR stovepipe; inspect lower-intake gaskets",
    decision: "PART APPROVAL",
    destinations: [["Dorman 615-180 upper intake manifold with gaskets", "https://www.autopartsprime.com/dorman/plastic-intake-manifold/mp-615180", "1996-2005 LeSabre 3.8L; use vehicle fitment check", "primary repair assembly"]],
    evidence: ["https://www.dormanproducts.com/p-32743-615-180.aspx"],
    reason: "The live product is in stock and includes the intake manifold, gaskets and PCV items; Dorman lists Buick 1995-2005 applications.",
    correction: "Keep lower-intake gasket replacement conditional on inspection.",
  },
  "buick-lesabre-power-window-regulator-cable-failure": {
    repairItems: "Position-specific window regulator assembly; reuse motor only if it tests good",
    decision: "POSITION-SPECIFIC PART APPROVAL",
    destinations: [["Genuine Buick LeSabre window-regulator catalog", "https://www.gmpartsgiant.com/oem-buick-lesabre-window_regulator.html", "2000-2005 LeSabre; select front/rear and driver/passenger position", "position-specific parts catalog"]],
    evidence: [],
    reason: "The live catalog lists exact OEM regulators and position labels for the issue span.",
    correction: "Require door position before purchase and do not imply the motor is always included or failed.",
  },
  "buick-lesabre-tank-fuel-pump-fuel-level-sender-failure": {
    repairItems: "Fuel-pressure/electrical diagnosis; complete pump module/sender/strainer for the exact year and tank configuration",
    decision: "YEAR-SPLIT PARTIAL APPROVAL",
    destinations: [["Genuine Buick LeSabre fuel-pump catalog", "https://www.gmpartsgiant.com/oem-buick-lesabre-fuel_pump.html", "1998-2005 LeSabre; select year/VIN/tank option", "year-specific parts catalog"]],
    evidence: ["https://www.gmpartsgiant.com/parts/buick-module-kit-f-tnk-f-pmp~19369903.html"],
    reason: "The 2004-2005 OEM module 19369903 is verified, but earlier years use different modules.",
    correction: "Do not stretch 19369903 across 1998-2003; force year/VIN selection.",
  },
  "buick-lucerne-fuel-pump-relay-overheats-melts-fuse-box": {
    repairItems: "Inspect relay, terminals and underhood fuse block; repair/relocate socket or replace fuse block based on heat damage",
    decision: "ELECTRICAL DIAGNOSIS / HOLD RETAIL PART",
    destinations: [["Buick dealer locator", "https://www.buick.com/locate-buick-dealer", "2008-2011 Lucerne; inspect heat damage before parts", "service locator"]],
    evidence: [],
    reason: "A new relay alone is unsafe if the terminal or fuse block is heat-damaged.",
    correction: "Gate every part behind a terminal/fuse-block inspection.",
  },
  "buick-lucerne-heated-windshield-washer-fluid-module-fire-risk": {
    repairItems: "Recall removal/disablement of the heated-washer module and hose reroute",
    decision: "SAFETY RECALL / NO RETAIL PART",
    destinations: [["Buick recall lookup", "https://www.buick.com/ownercenter/recalls", "2006-2009 Lucerne; VIN required", "official recall link"]],
    evidence: [],
    reason: "The recall remedy removes/disables the module; buying another heated module contradicts the repair.",
    correction: "No retail module CTA.",
  },
  "buick-lucerne-ignition-switch-can-slip-out-run-position": {
    repairItems: "Recall inspection and key/switch remedy as directed by VIN",
    decision: "SAFETY RECALL / NO RETAIL PART",
    destinations: [["Buick recall lookup", "https://www.buick.com/ownercenter/recalls", "2006-2011 Lucerne; VIN required", "official recall link"]],
    evidence: [],
    reason: "The safety campaign controls whether the key, switch or both are serviced.",
    correction: "Do not sell an ignition switch before the VIN recall check.",
  },
  "buick-lucerne-instrument-cluster-hard-to-read-daylight": {
    repairItems: "Diagnose brightness/power; revised instrument cluster when confirmed; VIN programming",
    decision: "PROGRAMMED MODULE SERVICE LINK",
    destinations: [["Buick dealer locator", "https://www.buick.com/locate-buick-dealer", "2006-2008 Lucerne; VIN programming required", "service locator"]],
    evidence: [],
    reason: "A replacement IPC must match options/mileage and be programmed; a bare cluster is not plug-and-play.",
    correction: "Use a service route rather than an unprogrammed module purchase.",
  },
  "buick-lucerne-intermediate-steering-shaft-clunk-during-slow-turns": {
    repairItems: "Inspect/lubricate/realign intermediate shaft; replace with updated shaft if needed",
    decision: "SERVICE-FIRST + PART REFERENCE",
    destinations: [["Buick dealer locator", "https://www.buick.com/locate-buick-dealer", "2006-2009 Lucerne; confirm shaft rather than rack", "service locator"]],
    evidence: ["https://www.gmpartsgiant.com/parts/gm-shaft-25810450.html"],
    reason: "GM 25810450 has exact Lucerne fitment but is discontinued on the verified page; lubrication/realignment may solve the issue.",
    correction: "Do not present a discontinued shaft as buyable or replace the steering rack for this symptom.",
  },
  "buick-lucerne-northstar-4-6l-v8-head-gasket-head-bolt-thread-failure": {
    repairItems: "Northstar specialist diagnosis; oversized block-thread inserts/Time-Sert process; head gaskets and machine inspection",
    decision: "SPECIALIST SERVICE / HOLD RETAIL KIT",
    destinations: [["Buick dealer locator", "https://www.buick.com/locate-buick-dealer", "2006-2011 Lucerne 4.6L; specialist engine repair", "service locator"]],
    evidence: [],
    reason: "Correct insert size, tooling and machine condition cannot be established from YMMT alone.",
    correction: "Do not link sealers or a head-gasket-only kit as the fix.",
  },
  "buick-lucerne-northstar-head-bolt": {
    repairItems: "Oversized block-thread inserts with head gaskets; specialist inspection of block and heads",
    decision: "DUPLICATE + SPECIALIST SERVICE",
    destinations: [["Buick dealer locator", "https://www.buick.com/locate-buick-dealer", "2006-2011 Lucerne 4.6L; specialist engine repair", "service locator"]],
    evidence: [],
    reason: "This duplicates the broader Northstar head-gasket/head-bolt issue and cannot be safely reduced to one retail kit.",
    correction: "Consolidate the duplicate and explicitly reject cooling-system sealants.",
  },
  "buick-lucerne-rear-air-self-leveling-suspension-failure": {
    repairItems: "Diagnose rear shocks, height sensor and compressor; repair failed component or convert to passive shocks",
    decision: "YEAR-SPLIT PARTIAL APPROVAL",
    destinations: [["Monroe 90007C rear air-leveling conversion kit", "https://www.monroe.com/technical-resources/installation-guides/conversion-kit-90007c-buick-cadillac-oldsmobile-pontiac.html", "2006-2010 Lucerne only; conversion option", "conversion kit"]],
    evidence: [],
    reason: "Monroe explicitly covers 2006-2010 Lucerne; 2011 remains outside the verified kit span, and component repair may be preferable.",
    correction: "Hold 2011 and label conversion as an option, not proof that the compressor or shocks failed.",
  },
  "buick-lucerne-throttle-body-throttle-position-sensor-causing-reduced-engin": {
    repairItems: "Throttle-body diagnosis/cleaning; engine-specific throttle body if confirmed; electronic relearn",
    decision: "ENGINE-SPLIT PARTIAL APPROVAL",
    destinations: [["Genuine Buick Lucerne throttle-body catalog", "https://www.gmpartsgiant.com/oem-buick-lucerne-throttle_body.html", "2006-2011 Lucerne; select 3.8L, 3.9L or 4.6L before purchase", "engine-specific parts catalog"]],
    evidence: [],
    reason: "The catalog exposes three different throttle bodies by engine/year and live buyable listings.",
    correction: "Require engine/VIN selection and relearn; do not imply one throttle body fits every Lucerne.",
  },
  "buick-regal-2.0t-timing-chain-ltg": {
    repairItems: "Complete engine-specific timing kit; inspect valves; intake-valve cleaning; correct oil",
    decision: "CONTENT CORRECTION + EARLY-YEAR PARTIAL APPROVAL",
    destinations: [["2011-2013 Regal 2.0L timing-chain kit", "https://www.partsgeek.com/xks4hcw-buick-regal-timing-chain-kit.html", "2011-2013 Regal 2.0L, including VIN V where listed; verify engine/VIN", "early-year timing kit"]],
    evidence: [],
    reason: "The live product lists 2011-2013 2.0L fitment and kit contents. LHU and LTG are different applications, so 2014-2017 needs a separate product.",
    correction: "Split LHU from LTG and do not call walnut blasting part of a timing kit.",
  },
  "buick-regal-6t70-6t40-automatic-transmission-shudder-slipping-hard-shift": {
    repairItems: "Identify transmission; correct DEXRON-VI fluid/filter service; valve body, accumulator or converter only after diagnosis",
    decision: "FLUID APPROVAL + TRANSMISSION-SPLIT HOLD",
    destinations: [["ACDelco GM OE DEXRON-VI ATF 88865601", "https://parts.buick.com/product/acdelco-gm-original-equipment-dexron-vi-automatic-transmission-fluid-1-qt-88865601", "2011-2017 Regal with transmission requiring DEXRON-VI; verify unit and capacity", "specified fluid"]],
    evidence: [],
    reason: "The fluid is appropriate only after confirming a 6T-series unit; hard parts differ between 6T40/6T70 and failure mode.",
    correction: "Do not merge 6T40 and 6T70 repair parts or imply a fluid service cures internal slipping.",
  },
  "buick-regal-aisin-af40-transmission": {
    repairItems: "GM AW/Aisin Warner fluid service; diagnose valve body/solenoids/internal wear; software as applicable",
    decision: "CONTENT CORRECTION + FLUID APPROVAL",
    destinations: [["ACDelco GM OE AW transmission fluid 19256039", "https://parts.buick.com/product/acdelco-gm-original-equipment-aw-%28aisin-warner%29-automatic-transmission-fluid-1-qt-19256039", "2011-2013 Regal GS listed by Buick; confirm AF40/VIN", "specified fluid"]],
    evidence: [],
    reason: "Buick's official product page lists GM AW fluid 19256039 for 2011-2013 Regal GS. The current JWS 3309 claim is not supported for this application.",
    correction: "Replace JWS 3309/Aisin AFW+ language with GM AW-1 specification and narrow the year/trim scope to verified AF40 applications.",
  },
  "buick-regal-carbon-buildup-intake-valves": {
    repairItems: "Borescope/airflow diagnosis; walnut-shell or manual intake-valve cleaning; optional catch can is not the repair",
    decision: "SERVICE LINK / NO RETAIL PART",
    destinations: [["Buick dealer locator", "https://www.buick.com/locate-buick-dealer", "2011-2017 Regal direct-injection engines; confirm buildup", "service locator"]],
    evidence: [],
    reason: "The specified remedy is a cleaning service, not an OBD scanner or replacement intake part.",
    correction: "Do not market a catch can as a cure for existing deposits.",
  },
  "buick-regal-excessive-oil-consumption-2-4l-ecotec": {
    repairItems: "Oil-consumption test; PCV/cam cover if confirmed; piston/ring or short-block repair only after diagnosis",
    decision: "DIAGNOSIS-FIRST SERVICE LINK",
    destinations: [["Buick dealer locator", "https://www.buick.com/locate-buick-dealer", "2011-2013 Regal 2.4L; oil-consumption test", "service locator"]],
    evidence: [],
    reason: "The possible repairs range from a cover to internal engine work, so no single retail part is justified.",
    correction: "Keep the CTA on diagnosis and coverage before parts.",
  },
  "buick-regal-loss-power-brake-assist-ebcm-software-defect": {
    repairItems: "Recall EBCM software update",
    decision: "SAFETY RECALL SOFTWARE / NO PART",
    destinations: [["Buick recall lookup", "https://www.buick.com/ownercenter/recalls", "2018-2020 Regal; VIN required", "official recall link"]],
    evidence: [],
    reason: "The remedy is software and safety-critical.",
    correction: "Do not link a brake booster, sensor or scanner.",
  },
  "buick-regal-rear-suspension-toe-link-corrosion-fracture": {
    repairItems: "Recall replacement of rear toe links/fasteners and alignment",
    decision: "SAFETY RECALL / NO RETAIL PART",
    destinations: [["Buick recall lookup", "https://www.buick.com/ownercenter/recalls", "2011-2013 Regal; VIN required", "official recall link"]],
    evidence: [],
    reason: "The campaign remedy and parts are VIN-controlled.",
    correction: "Recall check precedes any retail suspension link.",
  },
  "buick-regal-sudden-loss-electric-power-steering-assist": {
    repairItems: "Recall replacement of the electric steering gear as directed by VIN",
    decision: "SAFETY RECALL / NO RETAIL PART",
    destinations: [["Buick recall lookup", "https://www.buick.com/ownercenter/recalls", "2016 Regal; VIN required", "official recall link"]],
    evidence: [],
    reason: "Steering gear replacement is a safety-recall procedure with VIN-specific configuration.",
    correction: "Do not sell an unprogrammed steering gear.",
  },
  "buick-regal-timing-chain-tensioner-failure-2-0t-turbo": {
    repairItems: "Complete chain, tensioner and guides; inspect valve/piston damage; correct oil",
    decision: "PARTIAL APPROVAL + DUPLICATE REVIEW",
    destinations: [["2011-2013 Regal 2.0L timing-chain kit", "https://www.partsgeek.com/xks4hcw-buick-regal-timing-chain-kit.html", "2011-2013 Regal 2.0L; verify LHU/VIN", "timing kit"]],
    evidence: [],
    reason: "The live listing covers the stated early 2.0L span and enumerates timing components, but internal damage is not covered.",
    correction: "Consolidate with the broader Regal 2.0T timing-chain entry and keep post-failure engine inspection explicit.",
  },
  "buick-roadmaster-4l60e-automatic-transmission-wear": {
    repairItems: "Transmission diagnosis; valve-body service or rebuild with upgraded sunshell/sprag and damaged hard parts",
    decision: "SPECIALIST SERVICE + TECHNICAL KIT REFERENCE",
    destinations: [["1993-1996 4L60E super-master rebuild kit with HD sunshell", "https://www.gmtransmissionparts.com/4l60e-super-master-transmission-rebuild-kit-1993-1996/", "1994-1996 Roadmaster 4L60E; transmission builder must confirm year-specific unit", "specialist rebuild components"]],
    evidence: [],
    reason: "The kit is year-correct and includes the named HD sunshell, but rebuild contents must follow teardown and the transmission's year-specific calibration.",
    correction: "Route to a transmission specialist and do not imply the kit covers every failed hard part or converter.",
  },
  "buick-roadmaster-abs-hydraulic-modulator-corrosion-front-brake-fluid-leak": {
    repairItems: "Safety-recall inspection/replacement of ABS hydraulic modulator; rebuilt/used sourcing only if no coverage",
    decision: "SAFETY RECALL / HOLD RETAIL PART",
    destinations: [["NHTSA VIN recall lookup", "https://www.nhtsa.gov/recalls", "1994-1996 Roadmaster; VIN required", "official recall link"]],
    evidence: [],
    reason: "A leaking hydraulic modulator is safety-critical and the original remedy is recall-controlled; used units need specialist inspection.",
    correction: "Do not direct users to a used modulator before the VIN recall check.",
  },
  "buick-roadmaster-estate-wagon-rear-self-leveling-air-shock-compressor-failure": {
    repairItems: "Diagnose compressor, height sensor and air shocks; repair failed component or install wagon conversion kit",
    decision: "MODEL-SPECIFIC PART APPROVAL",
    destinations: [["Strutmasters CADR3 rear air-shock conversion kit", "https://www.strutmasters.com/products/1991-1996-buick-roadmaster-wagon-rear-air-shock-conversion-kit-cadr3", "1991-1996 Roadmaster Wagon only", "complete conversion option"]],
    evidence: [],
    reason: "The live page explicitly lists the wagon, full year span, two coil-over shocks and required hardware.",
    correction: "Keep diagnosis first and do not apply the wagon kit to sedans.",
  },
  "buick-roadmaster-fuel-pump-tank-check-valve-failure-causing-hard-starting-low": {
    repairItems: "Fuel-pressure/leak-down diagnosis; complete fuel-pump module/sending unit when check valve or pump is confirmed",
    decision: "DIAGNOSIS-GATED PART APPROVAL",
    destinations: [["19179521-compatible Roadmaster fuel-pump module", "https://www.maxpeedingrods.com/product/fuel-pump-module-assembly-for-buick-roadmaster-57l-v8-1994-1996-19179521.html", "1994-1996 Roadmaster 5.7L; verify tank connector/VIN", "complete pump module"]],
    evidence: [],
    reason: "The product page states the exact 1994-1996 5.7L Roadmaster application; a pressure test is still required because injectors/regulator can also lose pressure.",
    correction: "Do not link a pump from the hard-start symptom alone.",
  },
  "buick-roadmaster-lt1-intake-manifold-gasket-coolant-oil-leak": {
    repairItems: "Retorque/diagnose first; intake-manifold gasket set and seals if leakage persists",
    decision: "SERVICE-FIRST + PART APPROVAL",
    destinations: [["Fel-Pro MS95580 intake-manifold gasket set", "https://frsport.com/products/fel-pro-intake-manifold-gasket-set-felms95580", "1994-1996 Roadmaster 5.7L", "primary gasket set"]],
    evidence: [],
    reason: "The live page is in stock and states exact YMMT/engine fitment; the How to Fix calls for retorque before replacement.",
    correction: "Keep retorque/inspection ahead of the parts CTA.",
  },
  "buick-roadmaster-optispark-distributor-failure-lt1": {
    repairItems: "Ignition diagnosis; vented Optispark distributor if confirmed; inspect/replace leaking water pump, hoses, plugs and wires as needed",
    decision: "DIAGNOSIS-GATED PART APPROVAL",
    destinations: [["ACCEL 59125 vented Opti-Spark II distributor", "https://pitstopusa.com/products/accel-performance-distributor", "1994-1996 Roadmaster 5.7L LT1; verify pin-drive/vented configuration", "primary ignition part"]],
    evidence: [],
    reason: "The live page is in stock with Add to Cart, identifies ACCEL 59125 and lists 1994-1996 Roadmaster; pin-drive/vented configuration still must be confirmed.",
    correction: "Diagnose coil/wires/plugs first and inspect the water pump leak source before ordering.",
  },
  "buick-roadmaster-reverse-flow-cooling-water-pump-shaft-seal-leak-air-lock-ove": {
    repairItems: "Water pump or specialist reseal using correct tool; coolant refill and LT1 bleed procedure",
    decision: "PART APPROVAL + SERVICE NOTE",
    destinations: [["ACDelco 252-700 engine water pump", "https://newparts.com/acdelco-252-700-engine-water-pump", "1994-1996 Roadmaster 5.7L", "primary repair part"]],
    evidence: [],
    reason: "The OEM page lists exact 1994-1996 Roadmaster 5.7L fitment.",
    correction: "Do not imply the pump eliminates the required bleeding procedure or that resealing is appropriate without the specified tool.",
  },
});

const recordsById = new Map(source.records.map((record) => [record.id, record]));
const reviewRows = Object.entries(decisions).map(([issueId, review], index) => {
  const record = recordsById.get(issueId);
  if (!record) throw new Error(`Missing source issue ${issueId}`);
  const years = `${Math.min(...record.years)}-${Math.max(...record.years)}`;
  const ymmt = [years, record.make, record.model, (record.trims || []).join(", "), (record.engines || []).join(", ")]
    .filter(Boolean)
    .join(" | ");
  return {
    sequence: index + 1,
    issueId,
    ymmt,
    title: record.title,
    howToFix: record.solution,
    ...review,
    status: "REVIEW ONLY — NOT DEPLOYED",
  };
});
const reviewedIssueIds = new Set(reviewRows.map((row) => row.issueId));
const remainingRecords = source.records.filter((record) => !reviewedIssueIds.has(record.id));
if (reviewRows.length + remainingRecords.length !== source.inventory.publishedIssueCount) {
  throw new Error(`Buick review inventory mismatch: ${reviewRows.length} reviewed + ${remainingRecords.length} remaining`);
}
const remainingWithLinks = remainingRecords.filter((record) => (record.claims || []).length > 0);
if (remainingWithLinks.length > 0) {
  throw new Error(`Remaining queue unexpectedly contains linked issues: ${remainingWithLinks.map((record) => record.id).join(", ")}`);
}

const summary = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  make: "Buick",
  sourceSnapshotHash: source.snapshotHash,
  totalPublishedIssues: source.inventory.publishedIssueCount,
  reviewedIssueCount: reviewRows.length,
  remainingIssueCount: source.inventory.publishedIssueCount - reviewRows.length,
  deployed: false,
  counts: Object.fromEntries(
    [...new Set(reviewRows.map((row) => row.decision))].map((decision) => [decision, reviewRows.filter((row) => row.decision === decision).length]),
  ),
  records: reviewRows,
};

await fs.mkdir(dataDir, { recursive: true });
await fs.mkdir(outputDir, { recursive: true });
await fs.writeFile(path.join(dataDir, "review-ledger.json"), `${JSON.stringify(summary, null, 2)}\n`, "utf8");

const workbook = Workbook.create();
const summarySheet = workbook.worksheets.add("Summary");
const reviewSheet = workbook.worksheets.add("Buick Review");
const remainingSheet = workbook.worksheets.add("Unlinked Queue");
const methodSheet = workbook.worksheets.add("Method");

summarySheet.showGridLines = false;
reviewSheet.showGridLines = false;
remainingSheet.showGridLines = false;
methodSheet.showGridLines = false;

summarySheet.getRange("A1:H1").merge();
summarySheet.getRange("A1").values = [["Buick Repair-First Fitment Review"]];
summarySheet.getRange("A2:H2").merge();
summarySheet.getRange("A2").values = [["Review-only workbook — no Buick links have been deployed"]];
summarySheet.getRange("A4:B9").values = [
  ["Metric", "Value"],
  ["Published Buick issues", source.inventory.publishedIssueCount],
  ["Issues reviewed in this pass", reviewRows.length],
  ["Issues remaining", source.inventory.publishedIssueCount - reviewRows.length],
  ["Existing live commerce links at snapshot", source.inventory.linkCount],
  ["Deployment status", "NOT DEPLOYED"],
];
summarySheet.getRange("D4:E4").values = [["Decision", "Count"]];
const decisionNames = [...new Set(reviewRows.map((row) => row.decision))];
summarySheet.getRangeByIndexes(4, 3, decisionNames.length, 1).values = decisionNames.map((value) => [value]);
summarySheet.getRange("E5").formulas = [[`=COUNTIF('Buick Review'!$G$5:$G$${reviewRows.length + 4},D5)`]];
summarySheet.getRange(`E5:E${decisionNames.length + 4}`).fillDown();
const findingsStartRow = Math.max(20, decisionNames.length + 7);
summarySheet.getRange(`A${findingsStartRow}:H${findingsStartRow}`).merge();
summarySheet.getRange(`A${findingsStartRow}`).values = [["Important review findings"]];
summarySheet.getRange(`A${findingsStartRow + 1}:H${findingsStartRow + 5}`).values = [
  ["1", "Both 3800 entries name the wrong Fel-Pro gasket. MS98014T is the corrected 3.8L part; MS98003T must not be linked.", null, null, null, null, null, null],
  ["2", "The two Enclave timing-chain entries overlap. Their 2008 engine designation must be separated from 2009+ LLT fitment.", null, null, null, null, null, null],
  ["3", "Recall/special-coverage and diagnosis gates remain ahead of retail links for steering, oil-consumption, transmission, and A/C cases.", null, null, null, null, null, null],
  ["4", "No OBD/scanner link was inferred from a DTC. Every destination comes from the full How to Fix repair path.", null, null, null, null, null, null],
  ["5", "Partial-component links are labeled partial; they are never represented as a complete timing or transmission repair.", null, null, null, null, null, null],
];
for (let row = findingsStartRow + 1; row <= findingsStartRow + 5; row += 1) summarySheet.getRange(`B${row}:H${row}`).merge();

summarySheet.getRange("A1:H1").format = { fill: "#17365D", font: { bold: true, color: "#FFFFFF", size: 18 }, verticalAlignment: "center" };
summarySheet.getRange("A2:H2").format = { fill: "#D9EAF7", font: { italic: true, color: "#17365D" } };
summarySheet.getRange("A4:B4").format = { fill: "#2F75B5", font: { bold: true, color: "#FFFFFF" } };
summarySheet.getRange("D4:E4").format = { fill: "#2F75B5", font: { bold: true, color: "#FFFFFF" } };
summarySheet.getRange(`A${findingsStartRow}:H${findingsStartRow}`).format = { fill: "#17365D", font: { bold: true, color: "#FFFFFF" } };
summarySheet.getRange(`A${findingsStartRow + 1}:H${findingsStartRow + 5}`).format = { fill: "#F3F6F9", wrapText: true, verticalAlignment: "top", borders: { preset: "inside", style: "thin", color: "#D9E2F3" } };
summarySheet.getRange(`A1:H${findingsStartRow + 5}`).format.font.name = "Aptos";
summarySheet.getRange(`A1:H${findingsStartRow + 5}`).format.rowHeight = 22;
summarySheet.getRange("A1:H1").format.rowHeight = 34;
summarySheet.getRange(`A${findingsStartRow + 1}:H${findingsStartRow + 5}`).format.rowHeight = 42;
summarySheet.getRange("A:A").format.columnWidth = 34;
summarySheet.getRange("A4:A9").format.wrapText = true;
summarySheet.getRange("B:B").format.columnWidth = 50;
summarySheet.getRange("C:C").format.columnWidth = 3;
summarySheet.getRange("D:D").format.columnWidth = 38;
summarySheet.getRange("E:E").format.columnWidth = 12;
summarySheet.getRange("F:H").format.columnWidth = 4;

const headers = ["#", "Issue ID", "YMMT", "Known Issue", "How to Fix (full)", "Repair items extracted", "Decision", "Approved destination(s)", "Exact URL(s)", "Verified fitment scope", "Role / limitation", "Why approved or held", "Content correction / gate", "Status", "Evidence URL(s)"];
reviewSheet.getRange("A1:O1").merge();
reviewSheet.getRange("A1").values = [["Buick Known-Issue Link Review — Repair-First Method"]];
reviewSheet.getRange("A2:O2").merge();
reviewSheet.getRange("A2").values = [["Read How to Fix → extract repair items → search exact YMMT + item + US → open product page → verify fitment → approve, split, or hold"]];
reviewSheet.getRange("A4:O4").values = [headers];
const matrix = reviewRows.map((row) => {
  const destinationText = row.destinations.map((item) => item[0]).join("\n");
  const urlText = row.destinations.map((item) => item[1]).join("\n");
  const fitmentText = row.destinations.map((item) => item[2]).join("\n");
  const roleText = row.destinations.map((item) => item[3]).join("\n");
  return [row.sequence, row.issueId, row.ymmt, row.title, row.howToFix, row.repairItems, row.decision, destinationText, urlText, fitmentText, roleText, row.reason, row.correction, row.status, row.evidence.join("\n")];
});
reviewSheet.getRangeByIndexes(4, 0, matrix.length, headers.length).values = matrix;
reviewSheet.freezePanes.freezeRows(4);
reviewSheet.freezePanes.freezeColumns(3);
reviewSheet.getRange("A1:O1").format = { fill: "#17365D", font: { bold: true, color: "#FFFFFF", size: 17 }, verticalAlignment: "center" };
reviewSheet.getRange("A2:O2").format = { fill: "#D9EAF7", font: { italic: true, color: "#17365D" }, wrapText: true };
reviewSheet.getRange("A4:O4").format = { fill: "#2F75B5", font: { bold: true, color: "#FFFFFF" }, wrapText: true, verticalAlignment: "center", borders: { preset: "outside", style: "thin", color: "#17365D" } };
reviewSheet.getRange(`A5:O${reviewRows.length + 4}`).format = { font: { name: "Aptos", size: 9 }, wrapText: true, verticalAlignment: "top", borders: { insideHorizontal: { style: "thin", color: "#D9E2F3" } } };
reviewSheet.getRange(`G5:G${reviewRows.length + 4}`).conditionalFormats.add("containsText", { text: "HOLD", format: { fill: "#FCE4D6", font: { color: "#9C0006", bold: true } } });
reviewSheet.getRange(`G5:G${reviewRows.length + 4}`).conditionalFormats.add("containsText", { text: "APPROVAL", format: { fill: "#E2F0D9", font: { color: "#375623", bold: true } } });
reviewSheet.getRange(`N5:N${reviewRows.length + 4}`).format = { fill: "#FFF2CC", font: { bold: true, color: "#7F6000" }, wrapText: true, verticalAlignment: "top" };
reviewSheet.getRange("A:A").format.columnWidth = 5;
reviewSheet.getRange("B:B").format.columnWidth = 34;
reviewSheet.getRange("C:C").format.columnWidth = 38;
reviewSheet.getRange("D:D").format.columnWidth = 34;
reviewSheet.getRange("E:E").format.columnWidth = 58;
reviewSheet.getRange("F:F").format.columnWidth = 46;
reviewSheet.getRange("G:G").format.columnWidth = 30;
reviewSheet.getRange("H:H").format.columnWidth = 42;
reviewSheet.getRange("I:I").format.columnWidth = 55;
reviewSheet.getRange("J:J").format.columnWidth = 44;
reviewSheet.getRange("K:K").format.columnWidth = 36;
reviewSheet.getRange("L:L").format.columnWidth = 54;
reviewSheet.getRange("M:M").format.columnWidth = 54;
reviewSheet.getRange("N:N").format.columnWidth = 25;
reviewSheet.getRange("O:O").format.columnWidth = 55;
reviewSheet.getRange("A1:O1").format.rowHeight = 34;
reviewSheet.getRange("A2:O2").format.rowHeight = 34;
reviewSheet.getRange("A4:O4").format.rowHeight = 40;
reviewSheet.getRange(`A5:O${reviewRows.length + 4}`).format.rowHeight = 110;

const remainingHeaders = [
  "#",
  "Issue ID",
  "YMMT",
  "Known Issue",
  "Description / Context",
  "How to Fix (full)",
  "Symptoms",
  "DTC Codes",
  "Existing Link Count",
  "Repair Items to Extract",
  "Candidate URL(s)",
  "Reviewer Status",
  "Reviewer Notes",
];
remainingSheet.getRange("A1:M1").merge();
remainingSheet.getRange("A1").values = [[`${remainingRecords.length} Buick Known Issues Remaining`]];
remainingSheet.getRange("A2:M2").merge();
remainingSheet.getRange("A2").values = [[remainingRecords.length === 0
  ? "All 70 Buick issues have completed repair-first review. No Buick links have been deployed; every decision remains review-only."
  : "These issues have not failed the fitment process. They are the untouched queue: read the full How to Fix, extract exact repair items, then search and verify product/service pages."]];
remainingSheet.getRange("A4:M4").values = [remainingHeaders];
const remainingMatrix = remainingRecords.map((record, index) => {
  const years = `${Math.min(...record.years)}-${Math.max(...record.years)}`;
  const ymmt = [
    years,
    record.make,
    record.model,
    (record.trims || []).join(", "),
    (record.engines || []).join(", "),
  ]
    .filter(Boolean)
    .join(" | ");
  return [
    index + 1,
    record.id,
    ymmt,
    record.title,
    record.description,
    record.solution,
    (record.symptoms || []).join("\n"),
    (record.dtcCodes || []).join(", "),
    (record.claims || []).length,
    "PENDING — read full How to Fix",
    "",
    "Needs review",
    "",
  ];
});
if (remainingMatrix.length === 0) {
  remainingMatrix.push(["—", "—", "—", "All Buick issues reviewed", "", "", "", "", 0, "COMPLETE", "", "Complete", "Awaiting user review; nothing deployed"]);
}
const remainingRowCount = remainingMatrix.length;
remainingSheet.getRangeByIndexes(4, 0, remainingRowCount, remainingHeaders.length).values = remainingMatrix;
remainingSheet.freezePanes.freezeRows(4);
remainingSheet.freezePanes.freezeColumns(3);
remainingSheet.getRange("A1:M1").format = {
  fill: "#17365D",
  font: { bold: true, color: "#FFFFFF", size: 17 },
  verticalAlignment: "center",
};
remainingSheet.getRange("A2:M2").format = {
  fill: "#D9EAF7",
  font: { italic: true, color: "#17365D" },
  wrapText: true,
  verticalAlignment: "center",
};
remainingSheet.getRange("A4:M4").format = {
  fill: "#2F75B5",
  font: { bold: true, color: "#FFFFFF" },
  wrapText: true,
  verticalAlignment: "center",
  borders: { preset: "outside", style: "thin", color: "#17365D" },
};
remainingSheet.getRange(`A5:M${remainingRowCount + 4}`).format = {
  font: { name: "Aptos", size: 9 },
  wrapText: true,
  verticalAlignment: "top",
  borders: { insideHorizontal: { style: "thin", color: "#D9E2F3" } },
};
remainingSheet.getRange(`I5:I${remainingRowCount + 4}`).format = {
  fill: "#E2F0D9",
  font: { bold: true, color: "#375623" },
  horizontalAlignment: "center",
  verticalAlignment: "top",
};
remainingSheet.getRange(`J5:J${remainingRowCount + 4}`).format = {
  fill: "#FFF2CC",
  font: { color: "#7F6000" },
  wrapText: true,
  verticalAlignment: "top",
};
remainingSheet.getRange(`L5:L${remainingRowCount + 4}`).dataValidation = {
  rule: {
    type: "list",
    values: ["Needs review", "Agree", "Find replacement", "Hold", "Edit source content"],
  },
};
remainingSheet.getRange(`L5:L${remainingRowCount + 4}`).conditionalFormats.add("containsText", {
  text: "Needs review",
  format: { fill: "#FFF2CC", font: { color: "#7F6000", bold: true } },
});
remainingSheet.getRange("A:A").format.columnWidth = 5;
remainingSheet.getRange("B:B").format.columnWidth = 38;
remainingSheet.getRange("C:C").format.columnWidth = 42;
remainingSheet.getRange("D:D").format.columnWidth = 38;
remainingSheet.getRange("E:E").format.columnWidth = 58;
remainingSheet.getRange("F:F").format.columnWidth = 62;
remainingSheet.getRange("G:G").format.columnWidth = 36;
remainingSheet.getRange("H:H").format.columnWidth = 22;
remainingSheet.getRange("I:I").format.columnWidth = 14;
remainingSheet.getRange("J:J").format.columnWidth = 34;
remainingSheet.getRange("K:K").format.columnWidth = 50;
remainingSheet.getRange("L:L").format.columnWidth = 22;
remainingSheet.getRange("M:M").format.columnWidth = 42;
remainingSheet.getRange("A1:M1").format.rowHeight = 34;
remainingSheet.getRange("A2:M2").format.rowHeight = 42;
remainingSheet.getRange("A4:M4").format.rowHeight = 42;
remainingSheet.getRange(`A5:M${remainingRowCount + 4}`).format.rowHeight = 60;
remainingSheet.tables.add(`A4:M${remainingRowCount + 4}`, true, "UnlinkedBuickIssuesTable");

methodSheet.getRange("A1:F1").merge();
methodSheet.getRange("A1").values = [["Repeatable Link-Finding Method"]];
methodSheet.getRange("A3:B10").values = [
  ["Step", "Required action"],
  [1, "Read the full How to Fix before considering any link."],
  [2, "Extract every exact part, fluid, tool, service, and conditional branch."],
  [3, "Search the YMMT plus the exact repair item plus US."],
  [4, "Open the actual product or official service page; search-result pages are evidence, not the destination."],
  [5, "Verify year, model, engine, trim, transmission, position, drivetrain, and kit contents."],
  [6, "Save the URL with its exact scope, role, limitation, and evidence."],
  [7, "Split or hold any unsupported year/engine/position instead of stretching fitment."],
];
methodSheet.getRange("A12:F12").merge();
methodSheet.getRange("A12").values = [["Hard gates"]];
methodSheet.getRange("A13:F18").values = [
  ["No scanner inference", "A DTC does not create an OBD-scanner commerce link unless the How to Fix actually requires that tool.", null, null, null, null],
  ["Recall/coverage first", "Official VIN or dealer routing comes before retail whenever the remedy may be covered.", null, null, null, null],
  ["Diagnosis first", "Do not pick among mutually exclusive parts until the failed component or position is identified.", null, null, null, null],
  ["Complete-kit honesty", "A chain, guide, tensioner, wave plate, or fluid is not a complete repair unless the page and instructions support that claim.", null, null, null, null],
  ["Live product page", "Use a direct, current product/service page with readable title and fitment evidence.", null, null, null, null],
  ["Review before deploy", "This Buick workbook is review-only. Nothing here is authorized for production until the user approves it.", null, null, null, null],
];
for (let row = 13; row <= 18; row += 1) methodSheet.getRange(`B${row}:F${row}`).merge();
methodSheet.getRange("A1:F1").format = { fill: "#17365D", font: { bold: true, color: "#FFFFFF", size: 17 } };
methodSheet.getRange("A3:B3").format = { fill: "#2F75B5", font: { bold: true, color: "#FFFFFF" } };
methodSheet.getRange("A12:F12").format = { fill: "#17365D", font: { bold: true, color: "#FFFFFF" } };
methodSheet.getRange("A3:B10").format = { wrapText: true, verticalAlignment: "top", borders: { insideHorizontal: { style: "thin", color: "#D9E2F3" } } };
methodSheet.getRange("A13:F18").format = { wrapText: true, verticalAlignment: "top", fill: "#F3F6F9", borders: { insideHorizontal: { style: "thin", color: "#D9E2F3" } } };
methodSheet.getRange("A:A").format.columnWidth = 22;
methodSheet.getRange("B:B").format.columnWidth = 78;
methodSheet.getRange("C:F").format.columnWidth = 4;
methodSheet.getRange("A1:F18").format.font.name = "Aptos";
methodSheet.getRange("A4:B10").format.rowHeight = 34;
methodSheet.getRange("A13:F18").format.rowHeight = 44;

const formulaErrors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 100 },
  summary: "final formula error scan",
});
if (formulaErrors.ndjson && formulaErrors.ndjson.includes("\"value\"")) {
  throw new Error(`Formula error scan returned matches: ${formulaErrors.ndjson}`);
}

const keyRange = await workbook.inspect({
  kind: "table",
  range: `Summary!A1:E${findingsStartRow + 5}`,
  include: "values,formulas",
  tableMaxRows: findingsStartRow + 5,
  tableMaxCols: 8,
});
console.log(keyRange.ndjson);
const remainingCheck = await workbook.inspect({
  kind: "table",
  range: "Unlinked Queue!A1:M9",
  include: "values,formulas",
  tableMaxRows: 9,
  tableMaxCols: 13,
});
console.log(remainingCheck.ndjson);

for (const sheetName of ["Summary", "Buick Review", "Unlinked Queue", "Method"]) {
  const range =
    sheetName === "Buick Review"
      ? "A1:O8"
      : sheetName === "Unlinked Queue"
        ? "A1:M9"
        : undefined;
  const preview = await workbook.render({ sheetName, range, autoCrop: range ? undefined : "all", scale: 1, format: "png" });
  const safe = sheetName.toLowerCase().replaceAll(" ", "-");
  await fs.writeFile(path.join(outputDir, `${safe}-preview.png`), new Uint8Array(await preview.arrayBuffer()));
}

const workbookFile = await SpreadsheetFile.exportXlsx(workbook);
const workbookPath = path.join(outputDir, "Buick-repair-first-fitment-review.xlsx");
await workbookFile.save(workbookPath);
console.log(JSON.stringify({ workbookPath, reviewLedger: path.join(dataDir, "review-ledger.json"), reviewed: reviewRows.length, remaining: summary.remainingIssueCount }, null, 2));
