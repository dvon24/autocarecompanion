import fs from "node:fs";
import path from "node:path";

const requestedMake = process.argv[2]?.trim();
if (!requestedMake) {
  console.error("Usage: node scripts/build-make-repair-first-review-input.mjs <make>");
  process.exit(1);
}

const projectRoot = path.resolve(import.meta.dirname, "..");
const catalogPath = path.join(projectRoot, "data", "known-issues-catalog-deeplink-snapshot.json");
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
const canonicalMake = [...new Set(catalog.records.map((record) => record.make))]
  .find((make) => make.toLowerCase() === requestedMake.toLowerCase());

if (!canonicalMake) {
  console.error(`Unknown make: ${requestedMake}`);
  process.exit(1);
}

const makeSlug = canonicalMake.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const outputDir = path.join(projectRoot, "data", `${makeSlug}-repair-first-review`);
const sourcePath = path.join(outputDir, "source-snapshot.json");
const inputPath = path.join(outputDir, "review-input.json");
const generatedOn = new Date().toISOString().slice(0, 10);
const records = catalog.records
  .filter((record) => record.make === canonicalMake)
  .sort((left, right) => left.model.localeCompare(right.model) || left.id.localeCompare(right.id));

const compact = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
const range = (years) => years.length ? `${Math.min(...years)}-${Math.max(...years)}` : "Years not supplied";

const source = {
  schemaVersion: 1,
  generatedOn,
  make: canonicalMake,
  sourceSnapshotHash: catalog.snapshotHash,
  recordCount: records.length,
  records,
};

const input = {
  schemaVersion: 1,
  generatedOn,
  deploymentStatus: "REVIEW ONLY — NOT DEPLOYED",
  make: canonicalMake,
  sourceSnapshotHash: catalog.snapshotHash,
  issueCount: records.length,
  reviews: records.map((record, sequence) => ({
    sequence: sequence + 1,
    issueId: record.id,
    model: record.model,
    years: record.years || [],
    trims: record.trims || [],
    engines: record.engines || [],
    ymmt: [
      range(record.years || []),
      canonicalMake,
      record.model,
      (record.trims || []).join(", "),
      (record.engines || []).join(", "),
    ].filter(Boolean).join(" | "),
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
  make: canonicalMake,
  issues: records.length,
  models: new Set(records.map((record) => record.model)).size,
  withExistingFixParts: records.filter((record) => Array.isArray(record.fixParts) && record.fixParts.length).length,
}, null, 2));
