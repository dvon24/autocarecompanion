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
const methodSheet = workbook.worksheets.add("Method");

summarySheet.showGridLines = false;
reviewSheet.showGridLines = false;
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
summarySheet.getRange("A20:H20").merge();
summarySheet.getRange("A20").values = [["Important review findings"]];
summarySheet.getRange("A21:H25").values = [
  ["1", "Both 3800 entries name the wrong Fel-Pro gasket. MS98014T is the corrected 3.8L part; MS98003T must not be linked.", null, null, null, null, null, null],
  ["2", "The two Enclave timing-chain entries overlap. Their 2008 engine designation must be separated from 2009+ LLT fitment.", null, null, null, null, null, null],
  ["3", "Recall/special-coverage and diagnosis gates remain ahead of retail links for steering, oil-consumption, transmission, and A/C cases.", null, null, null, null, null, null],
  ["4", "No OBD/scanner link was inferred from a DTC. Every destination comes from the full How to Fix repair path.", null, null, null, null, null, null],
  ["5", "Partial-component links are labeled partial; they are never represented as a complete timing or transmission repair.", null, null, null, null, null, null],
];
for (let row = 21; row <= 25; row += 1) summarySheet.getRange(`B${row}:H${row}`).merge();

summarySheet.getRange("A1:H1").format = { fill: "#17365D", font: { bold: true, color: "#FFFFFF", size: 18 }, verticalAlignment: "center" };
summarySheet.getRange("A2:H2").format = { fill: "#D9EAF7", font: { italic: true, color: "#17365D" } };
summarySheet.getRange("A4:B4").format = { fill: "#2F75B5", font: { bold: true, color: "#FFFFFF" } };
summarySheet.getRange("D4:E4").format = { fill: "#2F75B5", font: { bold: true, color: "#FFFFFF" } };
summarySheet.getRange("A20:H20").format = { fill: "#17365D", font: { bold: true, color: "#FFFFFF" } };
summarySheet.getRange("A21:H25").format = { fill: "#F3F6F9", wrapText: true, verticalAlignment: "top", borders: { preset: "inside", style: "thin", color: "#D9E2F3" } };
summarySheet.getRange("A1:H25").format.font.name = "Aptos";
summarySheet.getRange("A1:H25").format.rowHeight = 22;
summarySheet.getRange("A1:H1").format.rowHeight = 34;
summarySheet.getRange("A21:H25").format.rowHeight = 42;
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
  range: "Summary!A1:E25",
  include: "values,formulas",
  tableMaxRows: 20,
  tableMaxCols: 8,
});
console.log(keyRange.ndjson);

for (const sheetName of ["Summary", "Buick Review", "Method"]) {
  const range = sheetName === "Buick Review" ? "A1:O8" : undefined;
  const preview = await workbook.render({ sheetName, range, autoCrop: range ? undefined : "all", scale: 1, format: "png" });
  const safe = sheetName.toLowerCase().replaceAll(" ", "-");
  await fs.writeFile(path.join(outputDir, `${safe}-preview.png`), new Uint8Array(await preview.arrayBuffer()));
}

const workbookFile = await SpreadsheetFile.exportXlsx(workbook);
const workbookPath = path.join(outputDir, "Buick-repair-first-fitment-review.xlsx");
await workbookFile.save(workbookPath);
console.log(JSON.stringify({ workbookPath, reviewLedger: path.join(dataDir, "review-ledger.json"), reviewed: reviewRows.length, remaining: summary.remainingIssueCount }, null, 2));
