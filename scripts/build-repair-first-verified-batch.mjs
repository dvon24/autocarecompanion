import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const args = process.argv.slice(2);
const generatedOnArg = args.find((arg) => arg.startsWith("--generated-on="));
if (!generatedOnArg || !/^--generated-on=\d{4}-\d{2}-\d{2}$/.test(generatedOnArg)) {
  throw new Error("Pass a stable artifact date: --generated-on=YYYY-MM-DD");
}
const makeArgs = args.filter((arg) => !arg.startsWith("--"));
const makes = makeArgs.length
  ? makeArgs
  : ["Honda", "Hyundai", "Infiniti", "Jaguar", "Jeep", "Kia"];
const date = generatedOnArg.split("=")[1];
const outputPath = path.join(root, "data", `repair-first-${makes.map((make) => make.toLowerCase()).join("-")}-${date}-gated.json`);
const reviewedLinksDir = path.join(root, "src", "lib", "known-issue-reviewed-retailer-links");
const reviewedLinksIndexPath = path.join(root, "src", "lib", "known-issue-reviewed-retailer-links.ts");

const resolvedIssues = [];
const seen = new Set();
const makeStats = [];

const SEARCH_QUERY_KEYS = new Set([
  "q", "query", "search", "keyword", "keywords", "_nkw", "k", "s", "term",
  "filter", "filters", "searchterm", "search_query",
]);

function canonicalUrl(value) {
  const url = new URL(value);
  url.hash = "";
  return url.toString();
}

function decodedPathname(url) {
  let pathname = url.pathname;
  for (let pass = 0; pass < 2; pass += 1) {
    const decoded = decodeURIComponent(pathname);
    if (decoded === pathname) break;
    pathname = decoded;
  }
  return pathname.toLowerCase().replace(/\/+$/, "") || "/";
}

function fingerprint(value) {
  const hash = (seed) => {
    let result = (0x811c9dc5 ^ seed) >>> 0;
    for (let index = 0; index < value.length; index += 1) {
      result = Math.imul(result ^ value.charCodeAt(index), 0x01000193) >>> 0;
    }
    result = (result ^ (result >>> 16)) >>> 0;
    result = Math.imul(result, 0x85ebca6b) >>> 0;
    result = (result ^ (result >>> 13)) >>> 0;
    result = Math.imul(result, 0xc2b2ae35) >>> 0;
    result = (result ^ (result >>> 16)) >>> 0;
    return result.toString(16).padStart(8, "0");
  };
  return `${hash(0x9e3779b9)}${hash(0x243f6a88)}${hash(0xb7e15162)}`;
}

function marketplaceShapeReason(url, path) {
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  if (host === "amazon.com" || host.endsWith(".amazon.com")) {
    return /\/(?:dp|gp\/product)\/[a-z0-9]{10}(?:\/|$)/i.test(path)
      ? null
      : "unsupported-marketplace-shape";
  }
  if (host === "ebay.com" || host.endsWith(".ebay.com")) {
    return /\/itm\/(?:[^/]+\/)?\d{9,15}(?:\/|$)/i.test(path)
      ? null
      : "unsupported-marketplace-shape";
  }
  if (host === "rockauto.com" || host.endsWith(".rockauto.com")) {
    return path === "/en/moreinfo.php"
      && /^\d+$/.test(url.searchParams.get("pk") || "")
      && /^\d+$/.test(url.searchParams.get("cc") || "")
      && /^\d+$/.test(url.searchParams.get("pt") || "")
      ? null
      : "unsupported-marketplace-shape";
  }
  return undefined;
}

function reviewedExceptionEligibility(link) {
  if (link.linkType !== "product") return { eligible: false, reason: "catalog-link-type" };

  let url;
  try {
    url = new URL(link.url);
  } catch {
    return { eligible: false, reason: "malformed-url" };
  }
  if (url.protocol !== "https:" || url.username || url.password) {
    return { eligible: false, reason: "non-public-url-shape" };
  }

  let decodedPath;
  try {
    decodedPath = decodedPathname(url);
  } catch {
    return { eligible: false, reason: "malformed-path" };
  }

  const marketplaceReason = marketplaceShapeReason(url, decodedPath);
  if (marketplaceReason !== undefined) {
    return marketplaceReason
      ? { eligible: false, reason: marketplaceReason }
      : { eligible: false, reason: "covered-by-marketplace-guard", alreadyCovered: true };
  }

  if ([...url.searchParams.keys()].some((key) => SEARCH_QUERY_KEYS.has(key.toLowerCase()))) {
    return { eligible: false, reason: "search-query" };
  }

  const shopifyProduct = /\/collections\/[^/]+\/products\/[^/]+(?:\/|$)/i.test(decodedPath);
  if (
    /\/(?:search|search-results|partsearch|parts-search|parts-list|category|categories|catalog|sch|find)(?:\/|$)/i.test(decodedPath)
    || /\/(?:results)(?:\.[a-z0-9]+)?(?:\/|$)/i.test(decodedPath)
    || (!shopifyProduct && /\/collections?(?:\/|$)/i.test(decodedPath))
    || /^\/v-\d{4}-/i.test(decodedPath)
    || /^\/make\//i.test(decodedPath)
  ) {
    return { eligible: false, reason: "search-or-catalog-path" };
  }

  if (decodedPath === "/") return { eligible: false, reason: "retailer-homepage" };
  return { eligible: true, reason: "exact-reviewed-direct-product" };
}

function renderReviewedLinksBatchModule(make, productUrls, vendorUrls, hosts) {
  const assertNoCollisions = (items, label) => {
    const hashes = [...items].map((value) => fingerprint(value));
    if (new Set(hashes).size !== hashes.length) throw new Error(`${label} fingerprint collision`);
  };
  assertNoCollisions(productUrls, "Reviewed URL");
  assertNoCollisions(vendorUrls, "Reviewed vendor/URL");
  assertNoCollisions(hosts, "Reviewed host");

  const values = (items) => [...items]
    .sort((a, b) => a.localeCompare(b))
    .map((item) => `  // ${item.replace(/\n/g, " | ")}\n  '${fingerprint(item)}',`)
    .join("\n");
  return `// GENERATED by scripts/build-repair-first-verified-batch.mjs for ${make}.\n`
    + `// Comments keep exact approvals human-reviewable; runtime stores compact fingerprints.\n\n`
    + `export const productUrlFingerprints = [\n${values(productUrls)}\n] as const;\n\n`
    + `export const vendorUrlFingerprints = [\n${values(vendorUrls)}\n] as const;\n\n`
    + `export const retailerHostFingerprints = [\n${values(hosts)}\n] as const;\n`;
}

function renderReviewedLinksIndex(moduleNames) {
  const imports = moduleNames.map((moduleName, index) => (
    `import { productUrlFingerprints as productUrls${index}, vendorUrlFingerprints as vendorUrls${index}, retailerHostFingerprints as retailerHosts${index} } from './known-issue-reviewed-retailer-links/${moduleName}';`
  )).join("\n");
  const productSpreads = moduleNames.map((_, index) => `...productUrls${index}`).join(", ");
  const vendorSpreads = moduleNames.map((_, index) => `...vendorUrls${index}`).join(", ");
  const hostSpreads = moduleNames.map((_, index) => `...retailerHosts${index}`).join(", ");

  return `// GENERATED by scripts/build-repair-first-verified-batch.mjs. Do not edit by hand.\n`
    + `// Batch modules are additive so a new make review cannot remove prior approvals.\n\n`
    + `${imports}\n\n`
    + `const REVIEWED_PRODUCT_URLS = new Set<string>([${productSpreads}]);\n`
    + `const REVIEWED_VENDOR_URLS = new Set<string>([${vendorSpreads}]);\n`
    + `const REVIEWED_RETAILER_HOSTS = new Set<string>([${hostSpreads}]);\n\n`
    + `function canonicalUrl(value: string): string | null {\n`
    + `  try {\n    const url = new URL(value);\n    url.hash = '';\n    return url.toString();\n  } catch {\n    return null;\n  }\n}\n\n`
    + `function fingerprint(value: string): string {\n`
    + `  const hash = (seed: number): string => {\n`
    + `    let result = (0x811c9dc5 ^ seed) >>> 0;\n`
    + `    for (let index = 0; index < value.length; index += 1) {\n`
    + `      result = Math.imul(result ^ value.charCodeAt(index), 0x01000193) >>> 0;\n`
    + `    }\n`
    + `    result = (result ^ (result >>> 16)) >>> 0;\n`
    + `    result = Math.imul(result, 0x85ebca6b) >>> 0;\n`
    + `    result = (result ^ (result >>> 13)) >>> 0;\n`
    + `    result = Math.imul(result, 0xc2b2ae35) >>> 0;\n`
    + `    result = (result ^ (result >>> 16)) >>> 0;\n`
    + `    return result.toString(16).padStart(8, '0');\n`
    + `  };\n`
    + `  return \`${"${hash(0x9e3779b9)}${hash(0x243f6a88)}${hash(0xb7e15162)}"}\`;\n`
    + `}\n\n`
    + `export function isReviewedKnownIssueProductUrl(value: string): boolean {\n`
    + `  const canonical = canonicalUrl(value);\n  return canonical !== null && REVIEWED_PRODUCT_URLS.has(fingerprint(canonical));\n}\n\n`
    + `export function isReviewedKnownIssueVendorUrl(vendor: string, value: string): boolean {\n`
    + `  const canonical = canonicalUrl(value);\n`
    + `  return canonical !== null && REVIEWED_VENDOR_URLS.has(fingerprint(\`${"${vendor.trim().toLowerCase()}\\n${canonical}"}\`));\n}\n\n`
    + `export function isReviewedKnownIssueRetailerHost(host: string): boolean {\n`
    + `  return REVIEWED_RETAILER_HOSTS.has(fingerprint(host.trim().toLowerCase().replace(/^www\\./, '')));\n}\n`;
}

const DIRECT_LINK_TYPES = new Set([
  "product",
  "product-service",
  "product-variant",
  "repair-service",
  "service",
  "vehicle-specific-product",
]);
const CATALOG_LINK_TYPES = new Set([
  "catalog",
  "catalog-product",
  "manufacturer-product-list",
  "model-filtered-product",
  "product-list-exact-sku",
  "vehicle-filtered-product",
  "vehicle-product-list",
]);

for (const make of makes) {
  const dataDir = path.join(root, "data", `${make.toLowerCase()}-repair-first-review`);
  const input = JSON.parse(await fs.readFile(path.join(dataDir, "review-input.json"), "utf8"));
  const sourceById = new Map(input.reviews.map((row) => [row.issueId, row]));
  const batchFiles = (await fs.readdir(dataDir))
    .filter((name) => /^second-pass-.*\.json$/i.test(name))
    .sort((a, b) => a.localeCompare(b));
  let issueCount = 0;
  let partCount = 0;
  let linkCount = 0;

  for (const batchFile of batchFiles) {
    const batch = JSON.parse(await fs.readFile(path.join(dataDir, batchFile), "utf8"));
    if (!Array.isArray(batch.productIssues)) throw new Error(`Malformed productIssues: ${make} / ${batchFile}`);
    for (const issue of batch.productIssues) {
      if (seen.has(issue.issueId)) throw new Error(`Duplicate product issue: ${issue.issueId}`);
      const source = sourceById.get(issue.issueId);
      if (!source) throw new Error(`Unknown ${make} issue: ${issue.issueId}`);
      const products = Array.isArray(issue.products) ? issue.products : [];
      const sourceRecallFirst = (source.existingFixParts || []).some((part) => part.recallFirst === true);
      const fixParts = products.map((product) => {
        if (product.verified !== true) throw new Error(`Unverified product: ${issue.issueId} / ${product.component}`);
        let parsedUrl;
        try {
          parsedUrl = new URL(product.url);
        } catch {
          throw new Error(`Malformed URL: ${issue.issueId} / ${product.url}`);
        }
        if (parsedUrl.protocol !== "https:") throw new Error(`Non-HTTPS URL: ${issue.issueId} / ${product.url}`);
        if (!DIRECT_LINK_TYPES.has(product.linkType) && !CATALOG_LINK_TYPES.has(product.linkType)) {
          throw new Error(`Unsupported linkType: ${issue.issueId} / ${String(product.linkType)}`);
        }
        const note = [product.role, product.scope, product.availability]
          .filter(Boolean)
          .join(" Fitment/availability: ");
        return {
          component: product.component,
          oemPartNumber: product.manufacturerSku || "",
          aftermarketXref: [],
          priceLow: null,
          priceHigh: null,
          note,
          verified: true,
          ...(product.recallFirst === true || sourceRecallFirst ? { recallFirst: true } : {}),
          buyLinks: [{
            vendor: product.vendor,
            url: product.url,
            linkType: CATALOG_LINK_TYPES.has(product.linkType) ? "catalog" : "product",
            verified: true,
          }],
        };
      });
      if (!fixParts.length) throw new Error(`Product issue has no products: ${issue.issueId}`);
      seen.add(issue.issueId);
      issueCount += 1;
      partCount += fixParts.length;
      linkCount += fixParts.reduce((sum, part) => sum + part.buyLinks.length, 0);
      resolvedIssues.push({
        id: issue.issueId,
        make,
        model: source.model,
        title: source.title,
        fixParts,
      });
    }
  }

  makeStats.push({ make, issues: issueCount, parts: partCount, links: linkCount });
}

const totals = makeStats.reduce((acc, row) => ({
  issues: acc.issues + row.issues,
  parts: acc.parts + row.parts,
  links: acc.links + row.links,
}), { issues: 0, parts: 0, links: 0 });

const reviewedProductUrls = new Set();
const reviewedVendorUrls = new Set();
const reviewedRetailerHosts = new Set();
const reviewedByMake = new Map(makes.map((make) => [make, {
  productUrls: new Set(),
  vendorUrls: new Set(),
  hosts: new Set(),
}]));
const intentionalExclusions = [];
for (const issue of resolvedIssues) {
  for (const part of issue.fixParts) {
    for (const link of part.buyLinks) {
      const eligibility = reviewedExceptionEligibility(link);
      if (eligibility.eligible) {
        const canonical = canonicalUrl(link.url);
        const host = new URL(canonical).hostname.toLowerCase().replace(/^www\./, "");
        reviewedProductUrls.add(canonical);
        reviewedVendorUrls.add(`${link.vendor.trim().toLowerCase()}\n${canonical}`);
        reviewedRetailerHosts.add(host);
        reviewedByMake.get(issue.make).productUrls.add(canonical);
        reviewedByMake.get(issue.make).vendorUrls.add(`${link.vendor.trim().toLowerCase()}\n${canonical}`);
        reviewedByMake.get(issue.make).hosts.add(host);
      } else if (eligibility.alreadyCovered) {
        const canonical = canonicalUrl(link.url);
        reviewedVendorUrls.add(`${link.vendor.trim().toLowerCase()}\n${canonical}`);
        reviewedByMake.get(issue.make).vendorUrls.add(`${link.vendor.trim().toLowerCase()}\n${canonical}`);
      } else if (!eligibility.alreadyCovered) {
        intentionalExclusions.push({
          issueId: issue.id,
          vendor: link.vendor,
          url: link.url,
          reason: eligibility.reason,
        });
      }
    }
  }
}

const output = {
  schemaVersion: 1,
  generatedOn: date,
  source: "repair-first fitment reviews",
  deploymentStatus: "GATED REVIEW ARTIFACT — NOT PERSISTED OR DEPLOYED",
  result: {
    resolvedIssues,
    stats: { makes: makeStats, totals },
    renderGuard: {
      exactReviewedProductUrls: reviewedProductUrls.size,
      exactReviewedVendorUrls: reviewedVendorUrls.size,
      exactReviewedRetailerHosts: reviewedRetailerHosts.size,
      intentionalExclusions,
    },
  },
};

await fs.writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
await fs.mkdir(reviewedLinksDir, { recursive: true });
const reviewedLinksBatchPaths = [];
for (const make of makes) {
  const moduleName = make.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const modulePath = path.join(reviewedLinksDir, `${moduleName}.ts`);
  const review = reviewedByMake.get(make);
  await fs.writeFile(modulePath, renderReviewedLinksBatchModule(make, review.productUrls, review.vendorUrls, review.hosts), "utf8");
  reviewedLinksBatchPaths.push(modulePath);
}
const reviewedBatchModules = (await fs.readdir(reviewedLinksDir))
  .filter((name) => /^[a-z0-9-]+\.ts$/i.test(name))
  .map((name) => name.replace(/\.ts$/i, ""))
  .sort((a, b) => a.localeCompare(b));
await fs.writeFile(reviewedLinksIndexPath, renderReviewedLinksIndex(reviewedBatchModules), "utf8");
console.log(JSON.stringify({
  outputPath,
  reviewedLinksBatchPaths,
  reviewedLinksIndexPath,
  ...totals,
  reviewedProductUrls: reviewedProductUrls.size,
  intentionalExclusions: intentionalExclusions.length,
  makes: makeStats,
}, null, 2));
