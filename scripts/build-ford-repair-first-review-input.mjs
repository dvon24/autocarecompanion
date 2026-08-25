import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const catalogPath = path.join(projectRoot, "data", "known-issues-catalog-deeplink-snapshot.json");
const outputDir = path.join(projectRoot, "data", "ford-repair-first-review");
const sourcePath = path.join(outputDir, "source-snapshot.json");
const inputPath = path.join(outputDir, "review-input.json");

const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
const records = catalog.records
  .filter((record) => record.make === "Ford")
  .sort((left, right) => left.model.localeCompare(right.model) || left.id.localeCompare(right.id));

const compact = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
const range = (years) => years.length ? `${Math.min(...years)}-${Math.max(...years)}` : "Years not supplied";

const source = {
  schemaVersion: 1,
  generatedOn: "2026-08-21",
  make: "Ford",
  sourceSnapshotHash: catalog.snapshotHash,
  recordCount: records.length,
  records,
};

const input = {
  schemaVersion: 1,
  generatedOn: "2026-08-21",
  deploymentStatus: "REVIEW ONLY — NOT DEPLOYED",
  make: "Ford",
  sourceSnapshotHash: catalog.snapshotHash,
  issueCount: records.length,
  reviews: records.map((record, sequence) => ({
    sequence: sequence + 1,
    issueId: record.id,
    model: record.model,
    years: record.years || [],
    trims: record.trims || [],
    engines: record.engines || [],
    ymmt: [range(record.years || []), "Ford", record.model, (record.trims || []).join(", "), (record.engines || []).join(", ")]
      .filter(Boolean)
      .join(" | "),
    title: compact(record.title),
    description: compact(record.description),
    howToFix: compact(record.solution),
    dtcCodes: record.dtcCodes || [],
    existingFixParts: record.fixParts || [],
    existingCommunityRecommendations: record.communityRecommendations || [],
  })),
};

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(sourcePath, `${JSON.stringify(source, null, 2)}\n`, "utf8");
fs.writeFileSync(inputPath, `${JSON.stringify(input, null, 2)}\n`, "utf8");

console.log(JSON.stringify({
  sourcePath: path.relative(projectRoot, sourcePath),
  inputPath: path.relative(projectRoot, inputPath),
  issues: records.length,
  models: new Set(records.map((record) => record.model)).size,
  withExistingFixParts: records.filter((record) => Array.isArray(record.fixParts) && record.fixParts.length).length,
}, null, 2));
