import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const snapshotPath = path.join(projectRoot, "data", "known-issues-catalog-deeplink-snapshot.json");
const outputPath = path.join(projectRoot, "data", "known-issues-affiliate-tag-fix", "deploy-patch-2026-08-21.json");
const targetMakes = new Set(["Acura", "Buick", "BMW", "Audi", "Cadillac", "Chevrolet", "Chrysler"]);
const snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeAffiliateUrl(value) {
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
    url.searchParams.set("customid", "known-issue-parts");
    url.searchParams.set("toolid", "10049");
  }
  return url.toString();
}

function needsTracking(value) {
  const url = new URL(value);
  const host = url.hostname.toLowerCase();
  if (host === "amazon.com" || host.endsWith(".amazon.com")) return url.searchParams.get("tag") !== "au7o-20";
  if (host === "ebay.com" || host.endsWith(".ebay.com")) return url.searchParams.get("campid") !== "5339164204";
  return false;
}

const decisions = [];
let changedLinkCount = 0;
const byMake = {};

for (const record of snapshot.records) {
  if (!targetMakes.has(record.make)) continue;
  const fixParts = clone(record.fixParts || []);
  let issueChanged = false;
  for (const part of fixParts) {
    for (const link of part.buyLinks || []) {
      if (!needsTracking(link.url)) continue;
      link.url = normalizeAffiliateUrl(link.url);
      link.affiliate = true;
      issueChanged = true;
      changedLinkCount += 1;
      byMake[record.make] = (byMake[record.make] || 0) + 1;
    }
  }
  if (!issueChanged) continue;
  decisions.push({
    id: record.id,
    disposition: "replace",
    decision: "Preserve the reviewed fixParts and add the missing Au7o Amazon/eBay affiliate tracking parameters.",
    evidence: ["Production fixParts affiliate-parameter audit 2026-08-21"],
    replaceFixParts: fixParts,
    humanApproved: true,
    reviewedOn: "2026-08-21",
    contentUpdatedOn: "2026-08-21",
    contentUpdateSummary: "Added missing Au7o affiliate tracking parameters to existing reviewed product links.",
  });
}

const patch = {
  schemaVersion: 1,
  patchKind: "known-issues-catalog-deeplink-decisions",
  batchId: "known-issue-affiliate-tag-fix-2026-08-21",
  snapshotHash: snapshot.snapshotHash,
  decisions,
  summary: { affectedIssueCount: decisions.length, changedLinkCount, byMake },
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(patch, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ output: path.relative(projectRoot, outputPath), ...patch.summary }, null, 2));
