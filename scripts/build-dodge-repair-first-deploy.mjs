import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const snapshotPath = path.join(projectRoot, "data", "known-issues-catalog-deeplink-snapshot.json");
const researchPath = path.join(
  projectRoot,
  "outputs",
  "01a012e3-30b5-7f61-84e7-43b9e1789304",
  "next-four-fitment",
  "dodge-exhaustive-research.json",
);
const patchPath = path.join(projectRoot, "data", "dodge-repair-first-review", "deploy-patch-2026-08-21.json");

const snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));
const research = JSON.parse(fs.readFileSync(researchPath, "utf8"));
const records = new Map(snapshot.records.filter((record) => record.make === "Dodge").map((record) => [record.id, record]));

const searchKeys = new Set(["q", "k", "_nkw", "query", "keyword", "keywords", "search", "searchterm", "text"]);

function productUrlError(value) {
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    return "invalid URL";
  }
  if (parsed.protocol !== "https:") return "URL must use HTTPS";
  for (const key of parsed.searchParams.keys()) {
    if (searchKeys.has(key.toLowerCase())) return `search query parameter ${key}`;
  }
  const pathname = parsed.pathname.toLowerCase();
  if (/(^|\/)(s|search|search-results?|sch|partsearch|category|catalog)(\/|$)/i.test(pathname)) return "search/category URL";
  if (pathname === "/" || pathname.length < 4) return "URL has no product path";
  return null;
}

function isOfficialOrServiceRoute(product) {
  return /recall|vin (?:lookup|route)|dealer locator|service locator|shop locator|manufacturer-capable diagnosis|official campaign|official recall/i.test(
    [product.label, product.product, product.role, product.scope].join(" "),
  );
}

function isCatalogOrSelector(product) {
  return /catalog|selector|route|search page|parts page|category page|buying route/i.test(
    [product.label, product.product, product.availability].join(" "),
  );
}

function isRecallSoftwareOrWarrantyFirst(issue) {
  return /recall|warranty|software|vin-catalog|service-routes-only/i.test(issue.status || "");
}

function vendorFor(value) {
  const host = new URL(value).hostname.toLowerCase().replace(/^www\./, "");
  const brand = host.split(".").slice(-2, -1)[0];
  const names = {
    amazon: "Amazon",
    ebay: "eBay",
    walmart: "Walmart",
    autozone: "AutoZone",
    partsgeek: "PartsGeek",
    advanceautoparts: "Advance Auto Parts",
    oreillyauto: "OReilly Auto Parts",
    napaonline: "NAPA",
    rockauto: "RockAuto",
    summitracing: "Summit Racing",
    jegs: "JEGS",
    moparpartsgiant: "Mopar Parts Giant",
    moparonlineparts: "Mopar Online Parts",
    mopargenuineparts: "Mopar Genuine Parts",
    viperpartsusa: "Viper Parts USA",
    viperpartsdepot: "Viper Parts Depot",
    theviperstore: "The Viper Store",
    americancarcraft: "American Car Craft",
  };
  return names[brand] || brand;
}

function isAffiliate(value) {
  const host = new URL(value).hostname.toLowerCase();
  return host.includes("amazon.") || host === "amazon.com" || host.includes("ebay.") || host === "ebay.com";
}

function withAffiliateTracking(value) {
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
    url.searchParams.set("customid", "dodge-repair-first");
    url.searchParams.set("toolid", "10049");
  }
  return url.toString();
}

function toFixPart(product, issueId, index) {
  const evidence = [...new Set((product.evidence || []).filter((value) => /^https:\/\//.test(value)))];
  const note = [product.role, `Fitment: ${product.scope}`, product.availability].filter(Boolean).join(" ");
  const trackedUrl = withAffiliateTracking(product.url);
  return {
    component: product.product || product.label,
    oemPartNumber: "",
    aftermarketXref: [],
    note,
    sources: evidence,
    buyLinks: [
      {
        vendor: vendorFor(trackedUrl),
        url: trackedUrl,
        linkType: "product",
        verified: true,
        affiliate: isAffiliate(trackedUrl),
      },
    ],
    variants: [
      {
        scope: product.scope,
        note: product.role,
        oemPartNumber: "",
      },
    ],
    verified: true,
    recallFirst: false,
    confidence: 0.84,
    provenance: `Dodge repair-first review 2026-08-21 (${issueId} product ${index + 1})`,
    verificationNotes: [product.availability, ...evidence].filter(Boolean).join(" | "),
  };
}

const decisions = [];
const skipped = [];
let productCount = 0;
let clearedRecallFirst = 0;

for (const [id, issue] of Object.entries(research.issues)) {
  const record = records.get(id);
  if (!record) throw new Error(`Dodge research issue missing from current production snapshot: ${id}`);

  if (![record.title, record.description, record.solution].every((value) => String(value || "").trim())) {
    skipped.push({ id, reason: "production title, description, or How to Fix is empty; content must be repaired before commerce" });
    continue;
  }

  if (isRecallSoftwareOrWarrantyFirst(issue)) {
    if ((record.fixParts || []).length > 0) {
      decisions.push({
        id,
        disposition: "recall-dealer",
        decision: "Clear retail fixParts because this issue is recall-, warranty-, software-, or diagnosis-first.",
        evidence: ["Dodge repair-first fitment review", issue.correction],
        replaceFixParts: [],
        humanApproved: true,
        reviewedOn: "2026-08-21",
        contentUpdatedOn: "2026-08-21",
        contentUpdateSummary: "Removed retail links that could displace a recall, warranty, software, or diagnosis-first remedy.",
      });
      clearedRecallFirst += 1;
    } else {
      skipped.push({ id, reason: "recall/warranty/software/diagnosis-first; no existing commerce to clear" });
    }
    continue;
  }

  const approvedProducts = (issue.products || []).filter(
    (product) => !productUrlError(product.url) && !isOfficialOrServiceRoute(product) && !isCatalogOrSelector(product),
  );
  if (approvedProducts.length === 0) {
    skipped.push({ id, reason: "no exact direct product URL survived the publish gate" });
    continue;
  }

  const fixParts = approvedProducts.map((product, index) => toFixPart(product, id, index));
  productCount += fixParts.length;
  decisions.push({
    id,
    disposition: "replace",
    decision: "Replace the current fixParts set with the repair-first, fitment-scoped Dodge product set.",
    evidence: [
      "Dodge repair-first fitment review",
      issue.correction,
      ...new Set(approvedProducts.flatMap((product) => product.evidence || [])),
    ].filter(Boolean),
    replaceFixParts: fixParts,
    humanApproved: true,
    reviewedOn: "2026-08-21",
    contentUpdatedOn: "2026-08-21",
    contentUpdateSummary: "Added repair-first, fitment-reviewed Dodge product links.",
  });
}

const patch = {
  schemaVersion: 2,
  patchKind: "known-issues-catalog-deeplink-decisions",
  batchId: "dodge-repair-first-links-2026-08-21",
  snapshotHash: snapshot.snapshotHash,
  decisions,
  summary: {
    dodgeIssueCount: records.size,
    writeIssueCount: decisions.length,
    commerceIssueCount: decisions.filter((decision) => decision.disposition === "replace").length,
    productCount,
    clearedRecallFirst,
    skippedIssueCount: skipped.length,
    skipped,
  },
};

fs.mkdirSync(path.dirname(patchPath), { recursive: true });
fs.writeFileSync(patchPath, `${JSON.stringify(patch, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ patchPath: path.relative(projectRoot, patchPath), ...patch.summary }, null, 2));
