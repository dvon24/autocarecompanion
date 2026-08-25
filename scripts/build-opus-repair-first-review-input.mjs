import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const outputDir = path.join(root, "data", "opus-repair-first-review");
const waves = [4, 5, 6];

function slugify(text, maxLen = 80) {
  return String(text).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, maxLen).replace(/-+$/, "");
}

function generateId(make, model, title) {
  const titleSlug = slugify(
    title.replace(/\([^)]*\)/g, "").replace(/\b(and|or|the|a|an|of|in|on|at|for|with)\b/gi, ""),
    60,
  );
  return `${slugify(make)}-${slugify(model)}-${titleSlug}`.replace(/-+/g, "-");
}

function compact(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function initialLane(solution) {
  const text = solution.toLowerCase();
  const productWords = /\b(replace|install|use|fit|apply|lubricate|flush|clean|repair kit|battery tender|charger|sealant|gasket|sensor|pump|valve|mount|bushing|bearing|hose|belt|filter|fluid|oil|relay|actuator|compressor|strut|spring|bolt|nut|cable|module)\b/;
  const recallWords = /\b(recall|campaign|vin check|free of charge|dealer remedy|dealer replacement)\b/;
  const softwareWords = /\b(software update|reflash|reprogram|calibration|firmware|ota update|module coding)\b/;
  const structuralWords = /\b(weld|body shop|sheet metal|frame straight|corrosion repair|paint repair)\b/;
  if (recallWords.test(text) && !productWords.test(text.replace(/dealer replacement/g, ""))) return "Recall/dealer review";
  if (softwareWords.test(text) && !productWords.test(text.replace(/module/g, ""))) return "Software/dealer review";
  if (structuralWords.test(text) && !productWords.test(text)) return "Structural/service review";
  if (productWords.test(text)) return "Product candidate review";
  return "Manual service review";
}

const reviews = [];
for (const wave of waves) {
  const sourcePath = path.join(root, "data", `research-wave${wave}-2026-08-21-final.json`);
  const payload = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
  for (const issue of payload?.result?.confirmed || []) {
    reviews.push({
      sequence: reviews.length + 1,
      wave,
      issueId: generateId(issue.make, issue.model, issue.title),
      make: issue.make,
      model: issue.model,
      years: issue.years || [],
      trims: issue.trims || [],
      engines: issue.engines || [],
      ymmt: [
        (issue.years || []).length ? `${Math.min(...issue.years)}-${Math.max(...issue.years)}` : "Years not supplied",
        issue.make,
        issue.model,
        (issue.trims || []).join(", "),
        (issue.engines || []).join(", "),
      ].filter(Boolean).join(" | "),
      issueTitle: compact(issue.title),
      description: compact(issue.description),
      howToFix: compact(issue.solution),
      citations: issue.citations || [],
      initialLane: initialLane(compact(issue.solution)),
      existingFixParts: [],
      reviewStatus: "Needs review",
    });
  }
}

const payload = {
  schemaVersion: 1,
  generatedOn: new Date().toISOString().slice(0, 10),
  deploymentStatus: "REVIEW ONLY — NOT PERSISTED OR DEPLOYED",
  sourceFiles: waves.map((wave) => `data/research-wave${wave}-2026-08-21-final.json`),
  issueCount: reviews.length,
  reviews,
};

fs.mkdirSync(outputDir, { recursive: true });
const outputPath = path.join(outputDir, "review-input.json");
fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

const lanes = Object.fromEntries([...new Set(reviews.map((row) => row.initialLane))]
  .map((lane) => [lane, reviews.filter((row) => row.initialLane === lane).length]));
const models = Object.fromEntries([...new Set(reviews.map((row) => `${row.make} ${row.model}`))]
  .map((model) => [model, reviews.filter((row) => `${row.make} ${row.model}` === model).length]));

console.log(JSON.stringify({ outputPath: path.relative(root, outputPath), issues: reviews.length, lanes, models }, null, 2));
