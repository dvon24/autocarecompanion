import fs from "node:fs";
import path from "node:path";

const make = process.env.REVIEW_MAKE;
if (!make) throw new Error("Set REVIEW_MAKE (for example, Cadillac or Chevrolet).");

const slug = make.toLowerCase();
const root = path.join("data", `${slug}-repair-first-review`);
const sourcePath = path.join(root, "source-snapshot.json");
const outputPath = path.join(root, "review-input.json");
const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
const records = source.records ?? [];

const dealer = (record, scope, role = "manufacturer-capable service") => ({
  label: `${make} certified-service locator`,
  url: make === "Cadillac"
    ? "https://www.cadillac.com/certified-service/dealer-locator"
    : "https://www.chevrolet.com/certified-service/dealer-locator",
  scope: scope || `${record.years[0]}-${record.years.at(-1)} ${make} ${record.model}`,
  role,
});

const parts = (record, item) => ({
  label: `GM Genuine Parts catalog — ${item}`,
  url: "https://parts.gmparts.com/",
  scope: `${record.years[0]}-${record.years.at(-1)} ${make} ${record.model}; select exact VIN, engine, trim, position and current supersession`,
  role: "manufacturer VIN-select parts catalog",
});

const recall = (record) => [
  dealer(record, `${record.years[0]}-${record.years.at(-1)} ${make} ${record.model} VIN/campaign completion and free remedy`, "authorized recall service"),
  {
    label: "NHTSA recall lookup",
    url: "https://www.nhtsa.gov/recalls",
    scope: `${record.years[0]}-${record.years.at(-1)} ${make} ${record.model} VIN history`,
    role: "government recall lookup",
  },
];

const compact = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
const firstRepairItem = (record) => {
  const text = compact(record.solution);
  if (!text) return "Source How to Fix is blank; no repair item or destination inferred.";
  return text;
};

function classify(record) {
  const text = `${record.title} ${record.solution}`;
  const lower = text.toLowerCase();
  const titleLower = record.title.toLowerCase();
  const hasRecall = /\brecall\b|nhtsa\s+\d{2}v\d+/.test(titleLower);
  const campaignOnly = /campaign|service update|customer satisfaction program/.test(titleLower);
  const noBuy = /do not order|does not prescribe|no owner-buyable repair|no repair is required|do not buy|does not cover|no parts are required|do not purchase|does not link or prescribe/.test(lower);
  const software = /software|reprogram|recalibrat|over the air|\bota\b|sps\b|svm\b/.test(lower);
  const explicitDiagnostic = /scan tool|scan the|retrieve the .*dtc|record dtc|with gds|tech ii|diagnostic tool|built-in .*diagnostic|live .*pressure|pressure-test|parasitic-draw test|combustion gas test|smoke\/soap test|output test|glycol test/.test(lower);
  const highVoltage = /high-voltage|\bhv\b|orange high|voltec|ev-qualified|electric vehicle/.test(lower);
  const specialist = /specialist|structural|weld|electronics rebuilder|cluster rebuild|convertible top|engine removal|powertrain removal|machine work|body shop/.test(lower);
  const physical = /replace|install|rebuild|repair|reseal|gasket|seal|pump|motor|actuator|sensor|battery|strut|shock|spring|belt|tensioner|pulley|hose|line|pipe|fluid|filter|module|screen|display|switch|connector|harness|valve|rotor|pad|caliper|bearing|chain|gear|shaft|cap|rail|injector|head gasket|insert|weatherstrip|trim|grille|handle|bracket|mount|cable|lamp|bulb|ballast|compressor|cooler|radiator|thermostat|water pump|oil/.test(lower);
  const softwareServiceOnlyIds = new Set([
    "cadillac-celestiq-display-software-glitches-2024",
    "cadillac-celestiq-suspension-calibration-2024",
    "cadillac-ct5-super-cruise-unavailable",
    "cadillac-lyriq-inconsistent-dc-fast-charging-speed-mid-session-power-dips",
    "cadillac-lyriq-range-estimation-2023",
    "cadillac-lyriq-rear-camera-glitch-2023",
  ]);

  if (!compact(record.solution)) {
    return {
      decision: "SOURCE HOW-TO-FIX REQUIRED — NO INFERRED LINK",
      destinations: [],
      reason: "The published issue has no repair instructions to ground a safe part or service destination.",
      correction: "Add and review a complete How to Fix before linking any product, scanner or service.",
    };
  }
  if (hasRecall) {
    return {
      decision: "RECALL ROUTES ONLY",
      destinations: recall(record),
      reason: "The VIN-specific campaign controls inspection, parts and remedy eligibility.",
      correction: "No retail part or scanner link; verify campaign completion by VIN.",
    };
  }
  if (campaignOnly) {
    return {
      decision: software ? "SERVICE ACTION / SOFTWARE ROUTE" : "SERVICE ACTION ROUTE",
      destinations: [dealer(record, `${record.years[0]}-${record.years.at(-1)} ${make} ${record.model} action/applicability check`)],
      reason: "The published instruction depends on a GM action, bulletin or program rather than an unrestricted retail repair.",
      correction: "Confirm VIN, build range, coverage and current GM procedure before parts.",
    };
  }
  if (highVoltage) {
    return {
      decision: "HIGH-VOLTAGE / EV-QUALIFIED SERVICE",
      destinations: [dealer(record, `${record.years[0]}-${record.years.at(-1)} ${make} ${record.model} EV-qualified diagnosis`, "authorized EV service")],
      reason: "High-voltage diagnosis and remedy require qualified procedures and vehicle-specific data.",
      correction: "No consumer HV part, battery or generic scanner link.",
    };
  }
  if (noBuy) {
    return {
      decision: software ? "DIAGNOSIS / SOFTWARE SERVICE — PRODUCT HOLD" : "DIAGNOSIS SERVICE — PRODUCT HOLD",
      destinations: [dealer(record, `${record.years[0]}-${record.years.at(-1)} ${make} ${record.model} instruction-specific diagnosis`)],
      reason: "The How to Fix explicitly withholds a product or requires diagnosis before component selection.",
      correction: "Do not turn the symptom, DTC or title into a product recommendation.",
    };
  }
  if (softwareServiceOnlyIds.has(record.id)) {
    return {
      decision: "SOFTWARE / OPERATING-CONDITION SERVICE — PRODUCT HOLD",
      destinations: [dealer(record, `${record.years[0]}-${record.years.at(-1)} ${make} ${record.model} software, operating-condition and hardware diagnosis`) ],
      reason: "The source calls for updates, condition checks or diagnosis and does not establish a replaceable retail component.",
      correction: "No sensor, camera, display, battery or module link unless separate diagnosis proves hardware failure.",
    };
  }
  if (software && !physical) {
    return {
      decision: "SOFTWARE / CALIBRATION SERVICE",
      destinations: [dealer(record, `${record.years[0]}-${record.years.at(-1)} ${make} ${record.model} current calibration and applicability`)],
      reason: "The repair is programming, reset or calibration rather than a consumer part.",
      correction: "No module replacement unless the documented software path fails and hardware is diagnosed.",
    };
  }

  const item = compact(record.title).replace(/\([^)]*\)/g, "").trim();
  const destinations = [];
  if (physical && !specialist) destinations.push(parts(record, item));
  destinations.push(dealer(record, `${record.years[0]}-${record.years.at(-1)} ${make} ${record.model} diagnosis, VIN/RPO confirmation and repair`));
  return {
    decision: explicitDiagnostic
      ? "EXPLICIT SCANNER/DIAGNOSTIC TOOL APPROVAL — PROFESSIONAL DIAGNOSIS / EXACT-PART GATE"
      : specialist
        ? "SPECIALIST / EXACT-COMPONENT GATE"
        : "VIN/RPO / EXACT-COMPONENT GATE",
    destinations,
    reason: explicitDiagnostic
      ? "The How to Fix explicitly requires testing or scan-capable diagnosis before the failed branch and exact part are known."
      : "The repair names a physical component, but exact VIN/RPO/position and failed branch must be confirmed before purchase.",
    correction: specialist
      ? "Use a qualified specialist or manufacturer service route; no generic kit or one-size-fits-all part."
      : "The official catalog is a fitment gate, not approval of every listed part; select the exact VIN and confirmed component.",
  };
}

const reviews = records.map((record) => {
  const result = classify(record);
  return {
    issueId: record.id,
    repairItems: firstRepairItem(record),
    decision: result.decision,
    destinations: result.destinations,
    evidence: [],
    reason: result.reason,
    correction: result.correction,
  };
});

fs.mkdirSync(root, { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify({
  reviewedAt: new Date().toISOString().slice(0, 10),
  deploymentStatus: "REVIEW ONLY — NOT DEPLOYED",
  reviews,
}, null, 2)}\n`);

console.log(JSON.stringify({ make, outputPath, reviews: reviews.length }, null, 2));
