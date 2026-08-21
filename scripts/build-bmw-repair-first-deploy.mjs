import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const reviewDir = path.join(projectRoot, "data", "bmw-repair-first-review");
const snapshotPath = path.join(projectRoot, "data", "known-issues-catalog-deeplink-snapshot.json");
const reviewInputPath = path.join(reviewDir, "review-input.json");
const patchPath = path.join(reviewDir, "deploy-patch-2026-08-21.json");
const gatedPath = path.join(reviewDir, "deploy-gated-2026-08-21.json");

const snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));
const reviewInput = JSON.parse(fs.readFileSync(reviewInputPath, "utf8"));
const records = new Map(snapshot.records.map((record) => [record.id, record]));
const expectedIds = new Set(reviewInput.reviews.map((review) => review.issueId));
const sections = ["productIssues", "heldOrNonProductIssues", "serviceIssues", "nonProductOrHeldIssues", "issues"];
const rows = new Map();

for (const name of fs.readdirSync(reviewDir).filter((value) => /^second-pass-.*\.json$/i.test(value)).sort()) {
  const artifact = JSON.parse(fs.readFileSync(path.join(reviewDir, name), "utf8"));
  for (const section of sections) {
    for (const row of artifact[section] || []) {
      if (!row?.issueId) continue;
      if (rows.has(row.issueId)) throw new Error(`Duplicate BMW second-pass issue: ${row.issueId}`);
      rows.set(row.issueId, { ...row, artifact: name, section });
    }
  }
}

const missing = [...expectedIds].filter((id) => !rows.has(id));
const extras = [...rows.keys()].filter((id) => !expectedIds.has(id));
if (missing.length || extras.length) {
  throw new Error(`BMW review coverage mismatch. missing=${missing.join(",")} extras=${extras.join(",")}`);
}

function withAffiliateTracking(value, issueId) {
  const url = new URL(value);
  const host = url.hostname.toLowerCase();
  if (host === "amazon.com" || host.endsWith(".amazon.com")) {
    url.searchParams.set("tag", "au7o-20");
  }
  if (host === "ebay.com" || host.endsWith(".ebay.com")) {
    url.searchParams.set("mkevt", "1");
    url.searchParams.set("mkcid", "1");
    url.searchParams.set("mkrid", "711-53200-19255-0");
    url.searchParams.set("campid", "5339164204");
    url.searchParams.set("customid", `bmw-repair-first-${issueId}`.slice(0, 80));
    url.searchParams.set("toolid", "10049");
  }
  return url.toString();
}

function isAffiliate(value) {
  const host = new URL(value).hostname.toLowerCase();
  return host === "amazon.com" || host.endsWith(".amazon.com") || host === "ebay.com" || host.endsWith(".ebay.com");
}

function renderVendor(product) {
  const host = new URL(product.url).hostname.toLowerCase().replace(/^www\./, "");
  const overrides = {
    "vr-speed.com": "VR Speed",
    "vargasturbo.com": "Vargas Turbo",
    "burgertuning.com": "Burger Tuning",
    "blackstone-labs.com": "Blackstone Labs",
    "endera.de": "Endera",
    "bmwgm5.com": "BMWGM5",
    "parts.bmwoforlandpark.com": "BMW of Orland Park",
    "parts.bmwofsouthatlanta.com": "BMW of South Atlanta",
  };
  return overrides[host] || String(product.vendor);
}

function asStrings(value) {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  return value ? [String(value)] : [];
}

function productToFixPart(product, issueId, index) {
  if (product.verified !== true) throw new Error(`${issueId} product ${index + 1} is not verified:true`);
  const trackedUrl = withAffiliateTracking(product.url, issueId);
  const evidence = [...new Set(asStrings(product.evidence).filter((value) => /^https:\/\//i.test(value)))];
  const oemPartNumber = String(product.oemPartNumber || product.oemCrossReference || "");
  const aftermarketXref = [...new Set([
    ...asStrings(product.aftermarketXref),
    ...asStrings(product.vendorSku),
    ...asStrings(product.manufacturerSku),
  ].filter((value) => value && value !== oemPartNumber))];
  const role = String(product.role || "Fitment-reviewed repair path");
  const scope = String(product.scope || "Confirm exact vehicle and repair fitment before ordering");
  const availability = String(product.availability || "Live exact destination when checked");
  return {
    component: String(product.component),
    oemPartNumber,
    aftermarketXref,
    note: `${role}. Fitment: ${scope}. ${availability}`,
    sources: evidence,
    buyLinks: [{
      vendor: renderVendor(product),
      url: trackedUrl,
      linkType: "product",
      verified: true,
      affiliate: product.affiliate === true || isAffiliate(trackedUrl),
    }],
    variants: [{ scope, note: role, oemPartNumber }],
    verified: true,
    recallFirst: false,
    confidence: 0.86,
    provenance: `BMW repair-first review 2026-08-21 (${issueId} product ${index + 1}; ${product.linkType || "product"})`,
    verificationNotes: [availability, ...evidence].filter(Boolean).join(" | "),
  };
}

function approvedProductsFor(row, stack = new Set()) {
  if (Array.isArray(row.products) && row.products.length) return row.products;
  const sourceId = row.reuseApprovedProductsFromIssueId;
  if (!sourceId) return [];
  if (stack.has(sourceId)) throw new Error(`BMW reuse cycle at ${sourceId}`);
  const source = rows.get(sourceId);
  if (!source) throw new Error(`${row.issueId} reuses missing issue ${sourceId}`);
  stack.add(sourceId);
  return approvedProductsFor(source, stack);
}

const decisions = [];
const resolvedIssues = [];
let commerceIssueCount = 0;
let productPlacementCount = 0;
let clearedHeldIssueCount = 0;
let alreadyEmptyHeldIssueCount = 0;

for (const id of [...expectedIds].sort()) {
  const row = rows.get(id);
  const record = records.get(id);
  if (!record) throw new Error(`BMW review issue missing from current snapshot: ${id}`);
  const products = approvedProductsFor(row);
  if (products.length) {
    const fixParts = products.map((product, index) => productToFixPart(product, id, index));
    productPlacementCount += fixParts.length;
    commerceIssueCount += 1;
    resolvedIssues.push({ id, fixParts });
    decisions.push({
      id,
      disposition: "replace",
      decision: "Replace the current fixParts set with the approved BMW repair-first, fitment-scoped product or exact repair-service paths.",
      evidence: [
        "BMW repair-first fitment review",
        row.contentCorrection || row.correction || row.reason || "Complete How to Fix and live destination reviewed.",
        ...new Set(products.flatMap((product) => asStrings(product.evidence))),
      ].filter(Boolean),
      replaceFixParts: fixParts,
      humanApproved: true,
      reviewedOn: "2026-08-21",
      contentUpdatedOn: "2026-08-21",
      contentUpdateSummary: "Added repair-first, fitment-reviewed BMW product links.",
    });
    continue;
  }

  if (Array.isArray(record.fixParts) && record.fixParts.length) {
    decisions.push({
      id,
      disposition: "no-commerce",
      decision: "Clear the existing retail fixParts because the BMW repair-first review held this issue for recall, diagnosis, exact fitment, structural repair, software, or service routing.",
      evidence: [
        "BMW repair-first fitment review",
        row.contentCorrection || row.correction || row.reason || row.decision || "No exact verified direct product survived review.",
      ].filter(Boolean),
      replaceFixParts: [],
      humanApproved: true,
      reviewedOn: "2026-08-21",
      contentUpdatedOn: "2026-08-21",
      contentUpdateSummary: "Removed BMW retail links that did not survive repair-first fitment review.",
    });
    clearedHeldIssueCount += 1;
  } else {
    alreadyEmptyHeldIssueCount += 1;
  }
}

const uniqueProductUrls = new Set(resolvedIssues.flatMap((issue) => issue.fixParts.flatMap((part) => part.buyLinks.map((link) => link.url))));
const patch = {
  schemaVersion: 2,
  patchKind: "known-issues-catalog-deeplink-decisions",
  batchId: "bmw-repair-first-links-2026-08-21",
  snapshotHash: snapshot.snapshotHash,
  decisions,
  summary: {
    reviewedIssueCount: expectedIds.size,
    writeIssueCount: decisions.length,
    commerceIssueCount,
    productPlacementCount,
    uniqueProductUrlCount: uniqueProductUrls.size,
    clearedHeldIssueCount,
    alreadyEmptyHeldIssueCount,
  },
};

const gated = {
  schemaVersion: 1,
  generatedOn: "2026-08-21",
  batchId: patch.batchId,
  result: { resolvedIssues },
};

fs.writeFileSync(patchPath, `${JSON.stringify(patch, null, 2)}\n`, "utf8");
fs.writeFileSync(gatedPath, `${JSON.stringify(gated, null, 2)}\n`, "utf8");
console.log(JSON.stringify({
  patchPath: path.relative(projectRoot, patchPath),
  gatedPath: path.relative(projectRoot, gatedPath),
  ...patch.summary,
}, null, 2));
