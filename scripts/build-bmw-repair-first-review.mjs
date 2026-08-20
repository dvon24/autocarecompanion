import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const root = process.cwd();
const dataDir = path.join(root, "data", "bmw-repair-first-review");
const outputDir = path.join(root, "outputs", "bmw-repair-first-review");
const source = JSON.parse(await fs.readFile(path.join(dataDir, "source-snapshot.json"), "utf8"));
const input = JSON.parse(await fs.readFile(path.join(dataDir, "review-input.json"), "utf8"));
const byId = new Map(source.records.map((r) => [r.id, r]));

const rows = input.reviews.map((review, index) => {
  const record = byId.get(review.issueId);
  if (!record) throw new Error(`Missing BMW issue ${review.issueId}`);
  const ymmt = [
    `${Math.min(...record.years)}-${Math.max(...record.years)}`,
    record.make,
    record.model,
    (record.trims || []).join(", "),
    (record.engines || []).join(", "),
  ].filter(Boolean).join(" | ");
  return {...review, sequence:index + 1, ymmt, title:record.title, howToFix:record.solution};
});

const reviewedIds = new Set(rows.map((r) => r.issueId));
const queue = source.records.filter((r) => !reviewedIds.has(r.id));
const destinations = rows.flatMap((r) => r.destinations.map((d) => ({issueId:r.issueId, ...d})));
const malformed = destinations.filter((d) => !/^https:\/\//.test(d.url));
const scannerDestinations = destinations.filter((d) => /scanner|obd/i.test(`${d.label} ${d.role}`));
if (malformed.length) throw new Error(`Malformed URLs: ${malformed.map((d) => d.url).join(", ")}`);
if (scannerDestinations.length) throw new Error(`Unexpected scanner destinations: ${scannerDestinations.map((d) => d.issueId).join(", ")}`);
if (rows.some((r) => !r.howToFix)) throw new Error("A reviewed issue is missing How to Fix");
if (rows.length + queue.length !== source.inventory.publishedIssueCount) throw new Error("Inventory mismatch");

const ledger = {
  schemaVersion: 1,
  make: "BMW",
  generatedAt: new Date().toISOString(),
  reviewedAt: input.reviewedAt,
  deploymentStatus: input.deploymentStatus,
  sourceSnapshotHash: source.snapshotHash,
  publishedIssueCount: source.inventory.publishedIssueCount,
  reviewedIssueCount: rows.length,
  remainingIssueCount: queue.length,
  reviewedWithDestinationCount: rows.filter((r) => r.destinations.length).length,
  destinationCount: destinations.length,
  distinctUrlCount: new Set(destinations.map((d) => d.url)).size,
  scannerDestinationCount: scannerDestinations.length,
  reviews: rows,
};
await fs.mkdir(outputDir, {recursive:true});
await fs.writeFile(path.join(dataDir, "review-ledger.json"), `${JSON.stringify(ledger, null, 2)}\n`, "utf8");

const wb = Workbook.create();
const summary = wb.worksheets.add("Summary");
const review = wb.worksheets.add("BMW Review");
const remaining = wb.worksheets.add("Remaining Queue");
const method = wb.worksheets.add("Method");
for (const sheet of [summary, review, remaining, method]) sheet.showGridLines = false;

const navy = "#0B1F3A", blue = "#1769AA", pale = "#EAF2F8", gold = "#F4B942", white = "#FFFFFF", gray = "#5B6573";
summary.getRange("A1:H1").merge();
summary.getRange("A1").values = [["BMW Repair-First Fitment Review"]];
summary.getRange("A1:H1").format = {fill:navy, font:{bold:true,color:white,size:18}, rowHeight:32};
summary.getRange("A3:B11").values = [
  ["Status", ledger.deploymentStatus], ["Published BMW issues", ledger.publishedIssueCount], ["Reviewed in this batch", ledger.reviewedIssueCount],
  ["Remaining queue", ledger.remainingIssueCount], ["Issues with destinations", ledger.reviewedWithDestinationCount], ["Destination entries", ledger.destinationCount],
  ["Distinct URLs", ledger.distinctUrlCount], ["Scanner destinations", ledger.scannerDestinationCount], ["Source snapshot hash", ledger.sourceSnapshotHash],
];
summary.getRange("A3:A11").format = {fill:pale, font:{bold:true,color:navy}};
summary.getRange("A3:B11").format.wrapText = true;
summary.getRange("A13:H13").merge();
summary.getRange("A13").values = [["Interpretation"]];
summary.getRange("A13:H13").format = {fill:blue,font:{bold:true,color:white}};
summary.getRange("A14:H17").merge();
summary.getRange("A14").values = [["This workbook is a local review artifact. Every completed row was evaluated from its full How to Fix text. A product is approved only for the exact verified scope; diagnosis, recall, coverage, software, and ambiguous-fitment issues use service/official destinations. DTCs did not create scanner links."]];
summary.getRange("A14:H17").format = {wrapText:true, verticalAlignment:"top"};
summary.getRange("A1:H17").format.font = {name:"Aptos", size:11};
summary.getRange("A:A").format.columnWidth = 28; summary.getRange("B:B").format.columnWidth = 72;

const headers = ["#","Issue ID","YMMT","Title","Full How to Fix","Repair items extracted","Decision","Destination label","URL","Verified scope","Destination role","Evidence URLs","Reason","Correction / hold note"];
const reviewData = [];
for (const r of rows) {
  const dests = r.destinations.length ? r.destinations : [{label:"",url:"",scope:"",role:""}];
  dests.forEach((d, i) => reviewData.push([i ? "" : r.sequence, i ? "" : r.issueId, i ? "" : r.ymmt, i ? "" : r.title, i ? "" : r.howToFix, i ? "" : r.repairItems, i ? "" : r.decision, d.label, d.url, d.scope, d.role, i ? "" : r.evidence.join("\n"), i ? "" : r.reason, i ? "" : r.correction]));
}
review.getRange("A1:N1").values = [headers];
review.getRange(`A2:N${reviewData.length+1}`).values = reviewData;
review.getRange("A1:N1").format = {fill:navy,font:{bold:true,color:white},wrapText:true,rowHeight:30};
review.getRange(`A2:N${reviewData.length+1}`).format = {wrapText:true,verticalAlignment:"top"};
review.freezePanes.freezeRows(1);
review.getRange(`A1:N${reviewData.length+1}`).format.autofitRows();
const widths = [5,35,34,32,70,45,30,38,58,42,28,48,52,54];
widths.forEach((w,i)=>review.getRangeByIndexes(0,i,reviewData.length+1,1).format.columnWidth=w);

const qHeaders = ["#","Issue ID","YMMT","Title","Full How to Fix","Existing claim count","Queue status"];
const qRows = queue.map((r,i)=>[i+1,r.id,[`${Math.min(...r.years)}-${Math.max(...r.years)}`,r.make,r.model,(r.trims||[]).join(", "),(r.engines||[]).join(", ")].filter(Boolean).join(" | "),r.title,r.solution,(r.claims||[]).length,"PENDING REPAIR-FIRST REVIEW"]);
remaining.getRange("A1:G1").values=[qHeaders];
remaining.getRange(`A2:G${qRows.length+1}`).values=qRows;
remaining.getRange("A1:G1").format={fill:navy,font:{bold:true,color:white},wrapText:true,rowHeight:30};
remaining.getRange(`A2:G${qRows.length+1}`).format={wrapText:true,verticalAlignment:"top"};
remaining.freezePanes.freezeRows(1);
remaining.getRange(`A1:G${qRows.length+1}`).format.autofitRows();
[5,38,40,38,78,16,30].forEach((w,i)=>remaining.getRangeByIndexes(0,i,qRows.length+1,1).format.columnWidth=w);

method.getRange("A1:F1").merge(); method.getRange("A1").values=[["Repeatable repair-first link method"]];
method.getRange("A1:F1").format={fill:navy,font:{bold:true,color:white,size:16},rowHeight:30};
method.getRange("A3:B10").values=[
  ["1","Read the complete title, description, and How to Fix."], ["2","Extract every exact repair part, fluid, tool, service, software, recall, and conditional branch."],
  ["3","Search exact YMMT plus the named repair item plus US."], ["4","Open the real product/service page; do not approve a search-results page."],
  ["5","Verify year, model, trim, engine, drivetrain/transmission, position, part number, page status, and kit completeness."],
  ["6","Approve only the verified scope; split variants or hold when information is missing."], ["7","Use official recall/coverage/dealer routes when the fix is software, campaign, diagnosis, programming, or high-voltage work."],
  ["8","Never infer an OBD scanner from a DTC. Link one only when How to Fix explicitly requires it and exact coverage is verified."],
];
method.getRange("A3:A10").format={fill:gold,font:{bold:true,color:navy},horizontalAlignment:"center"};
method.getRange("B3:B10").format={wrapText:true,verticalAlignment:"top"};
method.getRange("A:A").format.columnWidth=8; method.getRange("B:B").format.columnWidth=110;
method.getRange("A12:B15").values=[["Artifact state",input.deploymentStatus],["Source",path.relative(root,path.join(dataDir,"source-snapshot.json"))],["Review input",path.relative(root,path.join(dataDir,"review-input.json"))],["Generated ledger",path.relative(root,path.join(dataDir,"review-ledger.json"))]];
method.getRange("A12:A15").format={fill:pale,font:{bold:true,color:navy}};
method.getRange("A1:F15").format.font={name:"Aptos",size:11};

for (const sheet of [summary, review, remaining, method]) {
  const used = sheet.getUsedRange(); used.format.borders = {top:{style:"continuous",color:"#D8DEE7"},bottom:{style:"continuous",color:"#D8DEE7"},left:{style:"continuous",color:"#D8DEE7"},right:{style:"continuous",color:"#D8DEE7"}};
}

const formulaErrors = await wb.inspect({
  kind:"match",
  searchTerm:"#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options:{useRegex:true,maxResults:100},
  summary:"final formula error scan",
});
if (formulaErrors.ndjson && formulaErrors.ndjson.includes("\"value\"")) throw new Error(`Formula errors: ${formulaErrors.ndjson}`);
for (const [sheetName, range] of [["Summary",undefined],["BMW Review","A1:N8"],["Remaining Queue","A1:G9"],["Method",undefined]]) {
  const preview = await wb.render({sheetName,range,autoCrop:range?undefined:"all",scale:1,format:"png"});
  const safe = sheetName.toLowerCase().replaceAll(" ","-");
  await fs.writeFile(path.join(outputDir,`${safe}-preview.png`),new Uint8Array(await preview.arrayBuffer()));
}
const out = path.join(outputDir,"BMW-repair-first-fitment-review.xlsx");
const file = await SpreadsheetFile.exportXlsx(wb); await file.save(out);
console.log(JSON.stringify({workbookPath:out,ledgerPath:path.join(dataDir,"review-ledger.json"),reviewed:rows.length,remaining:queue.length,destinations:destinations.length},null,2));
