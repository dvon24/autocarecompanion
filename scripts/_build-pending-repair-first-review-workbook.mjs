import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const artifactToolPath = path.join(
  process.env.USERPROFILE,
  '.cache', 'codex-runtimes', 'codex-primary-runtime', 'dependencies', 'node',
  'node_modules', '@oai', 'artifact-tool', 'dist', 'artifact_tool.mjs',
);
const { Workbook, SpreadsheetFile } = await import(pathToFileURL(artifactToolPath).href);

const MAKES = [
  'Land Rover', 'Lexus', 'Lincoln', 'Mazda', 'Mercedes-Benz', 'Mercury', 'MG', 'MINI',
  'Mitsubishi', 'Nissan', 'Opel', 'Peugeot', 'Polestar', 'Pontiac', 'Porsche', 'RAM',
  'Renault', 'Rivian', 'Saab', 'Saturn', 'SEAT', 'Subaru', 'Suzuki', 'Tesla', 'Toyota',
  'Triumph', 'Volkswagen', 'Volvo', 'Skoda', 'Alfa Romeo', 'Citroen', 'CUPRA', 'Dacia',
  'Datsun', 'International', 'Lucid',
];
const REVIEW_KEYS = [
  'productIssues', 'recallOnlyIssues', 'serviceOrWarrantyOnlyIssues', 'softwareOnlyIssues',
  'archivedOrRemovedIssues', 'heldIssues',
];
const CLASSIFICATION = {
  recallOnlyIssues: 'Recall only',
  serviceOrWarrantyOnlyIssues: 'Service / warranty only',
  softwareOnlyIssues: 'Software only',
  archivedOrRemovedIssues: 'Archive / merge',
  heldIssues: 'Held',
};
const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const list = (value) => Array.isArray(value) ? value.join(', ') : (value || '');
const yearRange = (value) => {
  if (!Array.isArray(value) || value.length === 0) return '';
  return value.length === 1 ? String(value[0]) : `${Math.min(...value)}–${Math.max(...value)}`;
};
const normalize = (value) => value === null || value === undefined ? '' : value;
const hostOf = (url) => {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return 'invalid-url'; }
};
const ebayTagged = (url) => /[?&]mkevt=1(?:&|$)/i.test(url)
  && /[?&]mkcid=1(?:&|$)/i.test(url)
  && /[?&]mkrid=711-53200-19255-0(?:&|$)/i.test(url)
  && /[?&]campid=5339164204(?:&|$)/i.test(url)
  && /[?&]toolid=10001(?:&|$)/i.test(url);

const globalSnapshot = JSON.parse(fs.readFileSync('data/known-issues-catalog-deeplink-snapshot.json', 'utf8')).records;
const summaryRows = [];
const approvedRows = [];
const noRetailRows = [];
const allProducts = [];

for (const make of MAKES) {
  const directory = path.join('data', `${slugify(make)}-repair-first-review`);
  const localSource = path.join(directory, 'source-snapshot.json');
  const sourceDoc = fs.existsSync(localSource)
    ? JSON.parse(fs.readFileSync(localSource, 'utf8'))
    : null;
  const source = sourceDoc
    ? (sourceDoc.records || sourceDoc.issues || sourceDoc)
    : globalSnapshot.filter((issue) => issue.make === make);
  const sourceById = new Map(source.map((issue) => [issue.id, issue]));
  const files = fs.readdirSync(directory).filter((name) => /^second-pass-.*\.json$/.test(name)).sort();
  const reviewed = [];
  const counts = Object.fromEntries(REVIEW_KEYS.map((key) => [key, 0]));

  for (const fileName of files) {
    const review = JSON.parse(fs.readFileSync(path.join(directory, fileName), 'utf8'));
    for (const key of REVIEW_KEYS) {
      for (const item of review[key] || []) {
        const issueId = item.issueId || item.id;
        reviewed.push(issueId);
        counts[key] += 1;
        const issue = sourceById.get(issueId) || {};
        if (key === 'productIssues') {
          for (const product of item.products || []) {
            const url = product.url || '';
            const row = [
              make, normalize(issue.model), yearRange(issue.years), list(issue.trims), list(issue.engines),
              issueId, normalize(issue.title), normalize(issue.solution), normalize(item.decision),
              normalize(item.contentCorrection), normalize(product.name || product.component),
              normalize(product.merchant || product.vendor), normalize(product.role || product.linkType),
              normalize(product.fitment || product.scope), normalize(product.price),
              normalize(product.availability), product.verified === true ? 'TRUE' : 'FALSE', url,
            ];
            approvedRows.push(row);
            allProducts.push({ ...product, url, make, issueId });
          }
        } else {
          const officialLinks = item.officialLinks || [];
          const renderedOfficial = officialLinks.map((link) => `${link.label || 'Official'}: ${link.url || ''}`).join('\n');
          noRetailRows.push([
            make, normalize(issue.model), yearRange(issue.years), list(issue.trims), list(issue.engines),
            issueId, normalize(issue.title), normalize(issue.solution), CLASSIFICATION[key],
            normalize(item.decision), normalize(item.contentCorrection), renderedOfficial,
            normalize(officialLinks[0]?.url),
          ]);
        }
      }
    }
  }

  const sourceIds = new Set(source.map((issue) => issue.id));
  const idCounts = new Map();
  for (const id of reviewed) idCounts.set(id, (idCounts.get(id) || 0) + 1);
  const missing = [...sourceIds].filter((id) => !idCounts.has(id));
  const extra = [...idCounts.keys()].filter((id) => !sourceIds.has(id));
  const duplicates = [...idCounts.values()].filter((count) => count > 1);
  const makeProducts = allProducts.filter((product) => product.make === make);
  summaryRows.push([
    make, source.length, reviewed.length, counts.productIssues, makeProducts.length,
    counts.recallOnlyIssues, counts.serviceOrWarrantyOnlyIssues, counts.softwareOnlyIssues,
    counts.archivedOrRemovedIssues, counts.heldIssues, missing.length, extra.length, duplicates.length,
    makeProducts.filter((product) => product.verified !== true).length,
    makeProducts.filter((product) => !/^https:\/\//i.test(product.url)).length,
    missing.length + extra.length + duplicates.length === 0 ? 'PASS' : 'CHECK',
  ]);
}

const merchantMap = new Map();
for (const product of allProducts) {
  const host = hostOf(product.url);
  const entry = merchantMap.get(host) || { host, paths: 0, verified: 0, https: 0, ebay: 0, ebayTagged: 0, amazon: 0, amazonTagged: 0 };
  entry.paths += 1;
  if (product.verified === true) entry.verified += 1;
  if (/^https:\/\//i.test(product.url)) entry.https += 1;
  if (/ebay\./i.test(host)) {
    entry.ebay += 1;
    if (ebayTagged(product.url)) entry.ebayTagged += 1;
  }
  if (/amazon\./i.test(host)) {
    entry.amazon += 1;
    if (/[?&]tag=au7o-20(?:&|$)/i.test(product.url)) entry.amazonTagged += 1;
  }
  merchantMap.set(host, entry);
}
const merchantRows = [...merchantMap.values()]
  .sort((a, b) => b.paths - a.paths || a.host.localeCompare(b.host))
  .map((entry) => [
    entry.host, entry.paths, entry.verified, entry.https, entry.ebay, entry.ebayTagged,
    entry.amazon, entry.amazonTagged,
    entry.verified === entry.paths && entry.https === entry.paths
      && entry.ebay === entry.ebayTagged && entry.amazon === entry.amazonTagged ? 'PASS' : 'CHECK',
  ]);

const workbook = Workbook.create();
workbook.setColorScheme?.({ accent1: '#133B5C', accent2: '#1F7A8C', accent3: '#4F9D69' });

function styleHeader(range, fill = '#133B5C') {
  range.format.fill = fill;
  range.format.font = { bold: true, color: '#FFFFFF', size: 11 };
  range.format.horizontalAlignment = 'center';
  range.format.verticalAlignment = 'center';
  range.format.wrapText = true;
  range.format.rowHeight = 32;
}

function setWidths(sheet, widths) {
  widths.forEach((width, index) => {
    sheet.getRangeByIndexes(0, index, Math.max(1, sheet.getUsedRange()?.rowCount || 1), 1).format.columnWidth = width;
  });
}

const summary = workbook.worksheets.add('Summary');
summary.showGridLines = false;
summary.mergeCells('A1:P1');
summary.getRange('A1').values = [['Pending Repair-First Fitment Review — 36 Makes']];
summary.getRange('A1:P1').format.fill = '#133B5C';
summary.getRange('A1:P1').format.font = { bold: true, color: '#FFFFFF', size: 18 };
summary.getRange('A1:P1').format.rowHeight = 34;
summary.mergeCells('A2:P2');
summary.getRange('A2').values = [['Held for user review. No deployment, database persistence, commit, or push performed. Includes full How to Fix text and direct verified product URLs.']];
summary.getRange('A2:P2').format.fill = '#EAF4F6';
summary.getRange('A2:P2').format.font = { italic: true, color: '#133B5C', size: 11 };
summary.getRange('A2:P2').format.wrapText = true;
summary.getRange('A2:P2').format.rowHeight = 34;
const summaryHeaders = ['Make', 'Source Issues', 'Reviewed', 'Product Issues', 'Product Paths', 'Recall Only', 'Service / Warranty', 'Software Only', 'Archived / Merged', 'Held', 'Missing', 'Extra', 'Duplicate IDs', 'Bad Verified', 'Bad HTTPS', 'Status'];
summary.getRangeByIndexes(3, 0, 1, summaryHeaders.length).values = [summaryHeaders];
summary.getRangeByIndexes(4, 0, summaryRows.length, summaryHeaders.length).values = summaryRows;
styleHeader(summary.getRange('A4:P4'));
summary.tables.add(`A4:P${4 + summaryRows.length}`, true, 'MakeCoverage');
const totalRow = 5 + summaryRows.length;
summary.getRange(`A${totalRow}`).values = [['TOTAL']];
summary.getRange(`B${totalRow}:O${totalRow}`).formulas = [[...Array.from({ length: 14 }, (_, i) => {
  const column = String.fromCharCode('B'.charCodeAt(0) + i);
  return `=SUM(${column}5:${column}${totalRow - 1})`;
})]];
summary.getRange(`P${totalRow}`).formulas = [[`=IF(AND(K${totalRow}=0,L${totalRow}=0,M${totalRow}=0,N${totalRow}=0,O${totalRow}=0),"PASS","CHECK")`]];
summary.getRange(`A${totalRow}:P${totalRow}`).format.fill = '#DDEFE2';
summary.getRange(`A${totalRow}:P${totalRow}`).format.font = { bold: true, color: '#123524' };
summary.getRange(`B5:O${totalRow}`).format.numberFormat = '0';
summary.getRange(`A4:P${totalRow}`).format.borders = { preset: 'outside', style: 'thin', color: '#B7C9D3' };
summary.freezePanes.freezeRows(4);
summary.freezePanes.freezeColumns(1);
setWidths(summary, [20, 13, 11, 14, 14, 13, 17, 14, 18, 10, 10, 10, 13, 13, 11, 11]);

const approved = workbook.worksheets.add('Approved Links');
approved.showGridLines = false;
const approvedHeaders = ['Make', 'Model', 'Years', 'Trims', 'Engines', 'Issue ID', 'Issue Title', 'How to Fix', 'Review Decision', 'Content Correction', 'Product', 'Merchant', 'Role', 'Fitment', 'Price', 'Availability', 'Verified', 'URL'];
approved.getRangeByIndexes(0, 0, 1, approvedHeaders.length).values = [approvedHeaders];
approved.getRangeByIndexes(1, 0, approvedRows.length, approvedHeaders.length).values = approvedRows;
styleHeader(approved.getRange('A1:R1'), '#1F7A8C');
approved.tables.add(`A1:R${approvedRows.length + 1}`, true, 'ApprovedProductLinks');
approved.getRange(`A2:R${approvedRows.length + 1}`).format.verticalAlignment = 'top';
approved.getRange(`D2:P${approvedRows.length + 1}`).format.wrapText = true;
approved.getRange(`R2:R${approvedRows.length + 1}`).format.font = { color: '#0563C1', underline: true };
approved.getRange(`A2:R${approvedRows.length + 1}`).format.rowHeight = 54;
approved.getRange(`Q2:Q${approvedRows.length + 1}`).format.horizontalAlignment = 'center';
approved.freezePanes.freezeRows(1);
approved.freezePanes.freezeColumns(2);
setWidths(approved, [15, 18, 12, 24, 24, 43, 46, 80, 58, 58, 44, 20, 48, 62, 18, 30, 10, 70]);

const noRetail = workbook.worksheets.add('No Retail Link');
noRetail.showGridLines = false;
const noRetailHeaders = ['Make', 'Model', 'Years', 'Trims', 'Engines', 'Issue ID', 'Issue Title', 'How to Fix', 'Classification', 'Review Decision', 'Content Correction', 'Official Links', 'Primary Official URL'];
noRetail.getRangeByIndexes(0, 0, 1, noRetailHeaders.length).values = [noRetailHeaders];
noRetail.getRangeByIndexes(1, 0, noRetailRows.length, noRetailHeaders.length).values = noRetailRows;
styleHeader(noRetail.getRange('A1:M1'), '#6B4E71');
noRetail.tables.add(`A1:M${noRetailRows.length + 1}`, true, 'NoRetailDecisions');
noRetail.getRange(`A2:M${noRetailRows.length + 1}`).format.verticalAlignment = 'top';
noRetail.getRange(`D2:M${noRetailRows.length + 1}`).format.wrapText = true;
noRetail.getRange(`M2:M${noRetailRows.length + 1}`).format.font = { color: '#0563C1', underline: true };
noRetail.getRange(`A2:M${noRetailRows.length + 1}`).format.rowHeight = 54;
noRetail.freezePanes.freezeRows(1);
noRetail.freezePanes.freezeColumns(2);
setWidths(noRetail, [15, 18, 12, 24, 24, 43, 46, 80, 22, 60, 60, 58, 70]);

const merchants = workbook.worksheets.add('Merchant QA');
merchants.showGridLines = false;
const merchantHeaders = ['Host', 'Product Paths', 'Verified True', 'HTTPS', 'eBay Total', 'eBay Tagged', 'Amazon Total', 'Amazon Tagged', 'Status'];
merchants.getRangeByIndexes(0, 0, 1, merchantHeaders.length).values = [merchantHeaders];
merchants.getRangeByIndexes(1, 0, merchantRows.length, merchantHeaders.length).values = merchantRows;
styleHeader(merchants.getRange('A1:I1'), '#4F6D3A');
merchants.tables.add(`A1:I${merchantRows.length + 1}`, true, 'MerchantQuality');
merchants.getRange(`B2:H${merchantRows.length + 1}`).format.numberFormat = '0';
merchants.freezePanes.freezeRows(1);
setWidths(merchants, [44, 15, 15, 12, 13, 14, 14, 15, 11]);

workbook.recalculate();
const outputDirectory = path.join('outputs', 'pending-repair-first-review');
fs.mkdirSync(outputDirectory, { recursive: true });
const outputPath = path.join(outputDirectory, 'Pending-36-Makes-Repair-First-Fitment-Review-2026-08-24.xlsx');
const spreadsheetFile = await SpreadsheetFile.exportXlsx(workbook);
await spreadsheetFile.save(outputPath);

const summaryPreview = await workbook.render({ sheetName: 'Summary', range: `A1:P${totalRow}`, format: 'png', scale: 1.2, headers: false });
fs.writeFileSync(path.join(outputDirectory, 'summary-preview.png'), new Uint8Array(await summaryPreview.arrayBuffer()));
const approvedPreview = await workbook.render({ sheetName: 'Approved Links', range: 'A1:R18', format: 'png', scale: 1.0, headers: false });
fs.writeFileSync(path.join(outputDirectory, 'approved-links-preview.png'), new Uint8Array(await approvedPreview.arrayBuffer()));
const noRetailPreview = await workbook.render({ sheetName: 'No Retail Link', range: 'A1:M18', format: 'png', scale: 1.0, headers: false });
fs.writeFileSync(path.join(outputDirectory, 'no-retail-preview.png'), new Uint8Array(await noRetailPreview.arrayBuffer()));

const reloaded = await SpreadsheetFile.importXlsx(fs.readFileSync(outputPath));
reloaded.recalculate();
const inspection = await reloaded.inspect({ kind: 'workbook,sheet,table,formula', maxChars: 200000 });
fs.writeFileSync(path.join(outputDirectory, 'workbook-inspection.ndjson'), inspection.ndjson, 'utf8');

const result = {
  outputPath: path.resolve(outputPath),
  makes: MAKES.length,
  sourceIssues: summaryRows.reduce((sum, row) => sum + row[1], 0),
  reviewedIssues: summaryRows.reduce((sum, row) => sum + row[2], 0),
  productIssues: summaryRows.reduce((sum, row) => sum + row[3], 0),
  productPaths: approvedRows.length,
  noRetailDecisions: noRetailRows.length,
  merchants: merchantRows.length,
  ebayLinks: allProducts.filter((product) => /ebay\./i.test(product.url)).length,
  ebayTagged: allProducts.filter((product) => /ebay\./i.test(product.url) && ebayTagged(product.url)).length,
  amazonLinks: allProducts.filter((product) => /amazon\./i.test(product.url)).length,
  badVerified: allProducts.filter((product) => product.verified !== true).length,
  badHttps: allProducts.filter((product) => !/^https:\/\//i.test(product.url)).length,
};
fs.writeFileSync(path.join(outputDirectory, 'workbook-build-result.json'), `${JSON.stringify(result, null, 2)}\n`, 'utf8');
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
