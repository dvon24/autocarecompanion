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
const rejectedStoredProductIds = new Set([
  // The card says charging speed is an intentional HV-software limitation; a 12V battery does not repair it.
  "chevrolet-bolt-ev-dcfc-speed-reduction-2017",
  // The live retailer compatibility table identifies this hub as a rear Impala part, not the card's front Camaro hub.
  "chevrolet-camaro-front-wheel-bearing-hub-assembly-failure",
]);
const mixedRecallRepairIds = new Set([
  "chevrolet-hhr-transmission-shift-cable-rollaway-recall-harsh-shifting",
  "chevrolet-traverse-inaccurate-stuck-fuel-gauge",
]);

function storedProductDestinations(record, decision) {
  if (rejectedStoredProductIds.has(record.id)) return [];
  if (/RECALL ROUTES ONLY|SOURCE HOW-TO-FIX REQUIRED|HIGH-VOLTAGE|PRODUCT HOLD/.test(decision)) return [];
  return (record.fixParts ?? []).flatMap((part) => (part.buyLinks ?? [])
    .filter((link) => link.verified && /^https:\/\//.test(link.url))
    .map((link) => ({
      label: `${link.vendor} — ${part.component}${part.aftermarketXref?.[0] ? ` ${part.aftermarketXref[0]}` : ""}`,
      url: link.url,
      scope: `${record.years[0]}-${record.years.at(-1)} ${make} ${record.model}; only for the diagnosed ${part.component} branch, with exact engine/trim/position fitment rechecked before purchase`,
      role: "stored verified product link; exact conditional branch",
    })));
}

const firstRepairItem = (record) => {
  const text = compact(record.solution);
  if (!text) return "Source How to Fix is blank; no repair item or destination inferred.";
  return text;
};

function classify(record) {
  const text = `${record.title} ${record.solution}`;
  const lower = text.toLowerCase();
  const titleLower = record.title.toLowerCase();
  const solutionLower = compact(record.solution).toLowerCase();
  const startsWithRecallRemedy = /\brecalls?\b/.test(solutionLower)
    && /^(check (your )?vin|check eligibility|contact (a |the )?(chevrolet|cadillac|gm)? ?dealer|verify recall|recall repair|dealers? (inspect|replace|reprogram|install)|gm'?s remedy|fuel pump module replacement under recall)/.test(solutionLower);
  const hasRecall = /\brecalls?\b|nhtsa\s+\d{2}v\d+/.test(titleLower) || startsWithRecallRemedy;
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
    "chevrolet-equinox-cold-start-rough-running-stalling-from-ecm-software-anomaly",
    "chevrolet-equinox-ev-slow-dc-fast-charging-early-thermal-derating",
    "chevrolet-equinox-ev-led-headlamp-snow-slush-buildup",
    "chevy-blazer-ev-infotainment-software-2024",
    "chevy-colorado-battery-drain-2015",
    "chevy-equinox-ev-one-pedal-calibration-2024",
    "chevy-silverado-ev-charging-fault-2024",
    "chevy-silverado-ev-propulsion-reduced-2024",
  ]);

  if (!compact(record.solution)) {
    return {
      decision: "SOURCE HOW-TO-FIX REQUIRED — NO INFERRED LINK",
      destinations: [],
      reason: "The published issue has no repair instructions to ground a safe part or service destination.",
      correction: "Add and review a complete How to Fix before linking any product, scanner or service.",
    };
  }
  if (record.id === "chevrolet-bolt-ev-dcfc-speed-reduction-2017") {
    return {
      decision: "HIGH-VOLTAGE SOFTWARE LIMITATION — NO HARDWARE REPAIR",
      destinations: [dealer(record, "2017-2023 Chevrolet Bolt EV charging behavior/software confirmation", "authorized EV service")],
      reason: "The How to Fix explicitly says the reduced rate is an intentional battery-protection software limitation.",
      correction: "Reject the stored 12V battery link; it does not repair DC fast-charging behavior.",
    };
  }
  if (mixedRecallRepairIds.has(record.id)) {
    return {
      decision: "RECALL-FIRST / SEPARATE EXACT-COMPONENT BRANCH",
      destinations: [parts(record, compact(record.title)), ...recall(record)],
      reason: "The How to Fix contains both a VIN-specific recall remedy and a separate non-recall hardware diagnosis/repair branch.",
      correction: "Complete/check the campaign first; use the parts catalog only for the separately confirmed sender, valve-body or transmission branch.",
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
  const storedProducts = storedProductDestinations(record, result.decision);
  return {
    issueId: record.id,
    repairItems: firstRepairItem(record),
    decision: result.decision,
    destinations: [...storedProducts, ...result.destinations],
    evidence: storedProducts.length ? ["Existing product page title/part number and stored ShowMeTheParts fitment evidence reviewed against the full How to Fix."] : [],
    reason: storedProducts.length ? `${result.reason} Existing exact-part commerce link retained for that conditional branch.` : result.reason,
    correction: rejectedStoredProductIds.has(record.id)
      ? `${result.correction} Rejected the stored commerce link because the product does not match the repair or live fitment evidence.`
      : result.correction,
  };
});

fs.mkdirSync(root, { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify({
  reviewedAt: new Date().toISOString().slice(0, 10),
  deploymentStatus: "REVIEW ONLY — NOT DEPLOYED",
  reviews,
}, null, 2)}\n`);

console.log(JSON.stringify({ make, outputPath, reviews: reviews.length }, null, 2));
