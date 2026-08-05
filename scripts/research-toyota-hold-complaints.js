/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const REVIEW_PACKET = path.join(PROJECT_ROOT, 'data', '_toyota-hold-review-packet.json');
const DISPOSITIONS = path.join(PROJECT_ROOT, 'data', '_toyota-hold-dispositions.json');
const OUTPUT = path.join(PROJECT_ROOT, 'data', '_toyota-hold-nhtsa-complaint-candidates.json');
const API = 'https://api.nhtsa.gov/complaints/complaintsByVehicle';
const MAX_SAMPLES = 12;

// Each inner array is an OR group; every group must match the complaint text.
const RULES = {
  'toyota-camry-p0430-bank-2-catalytic-converter-efficiency-failure-3-5l-v6': [['p0430']],
  'toyota-camry-power-window-regulator-window-glass-failure': [['window'], ['regulator', 'motor', 'glass']],
  'toyota-camry-sudden-unintended-acceleration-sticking-accelerator-pedal': [['accelerat'], ['stuck', 'unintended', 'pedal']],
  'toyota-camry-transmission-2018': [['transmission'], ['hesitat', 'jerk', 'shift', 'slip']],
  'toyota-camry-tss-issues-2018': [['brak'], ['phantom', 'unintended', 'false', 'collision']],
  'toyota-camry-v6-active-control-hydraulic-engine-mount-failure-causing-idl': [['mount'], ['vibrat', 'shudder']],
  'toyota-camry-warped-front-brake-rotors-causing-steering-wheel-shudder-pul': [['brake'], ['rotor', 'pulsat', 'shudder']],
  'toyota-camry-windshield-wiper-malfunction-ice-cold-weather-reducing-drive': [['wiper'], ['ice', 'cold', 'snow', 'freez']],
  'toyota-camry-3vz-fe-3-0l-v6-head-gasket-failure': [['head gasket', 'coolant'], ['overheat', 'leak', 'gasket']],
  'toyota-camry-automatic-transmission-delay-no-engagement-and-shift-lever-failure': [['transmission', 'shift'], ['delay', 'engag', 'lever', 'slip']],
  'toyota-camry-c-compressor-seizure-internal-failure-causing-loss-cooling-b': [['air condition', 'a/c', 'ac compressor'], ['compressor', 'cooling', 'warm']],
  'toyota-camry-evap-charcoal-canister--2002': [['evap', 'canister'], ['charcoal', 'vent']],
  'toyota-camry-exterior-door-handle-breakage': [['door handle']],
  'toyota-camry-front-upper-dogbone-torque-strut-engine-mount-failure-causin': [['mount'], ['clunk', 'jerk']],
  'toyota-camry-hood-latch-hood-popping-open-while-driving': [['hood'], ['latch', 'open']],
  'toyota-camry-hvac-blower-motor-resistor-2002': [['blower'], ['resistor', 'fan']],
  'toyota-camry-intermittent-brake-loss-poor-stopping-performance': [['brake'], ['loss', 'stopping', 'pedal']],
  'toyota-corolla-cross-ac-compressor-cycling-2022': [['air condition', 'a/c', 'ac compressor'], ['cycling', 'cool', 'compressor', 'warm']],
  'toyota-corolla-cross-cvt-hesitation-2022': [['transmission', 'cvt'], ['hesitat', 'delay', 'accelerat']],
  'toyota-corolla-cross-cvt-shudder-2022': [['transmission', 'cvt'], ['shudder', 'jerk', 'vibrat']],
  'toyota-corolla-cross-excessive-cabin-road-noise-booming-rough-pavement': [['road noise', 'cabin noise', 'booming']],
  'toyota-corolla-cross-power-liftgate-unlatches-but-fails-to-raise': [['liftgate', 'rear hatch'], ['open', 'raise', 'strut']],
  'toyota-corolla-cross-rear-usb-failure-2022': [['usb'], ['rear', 'back seat']],
  'toyota-corolla-cross-roof-rail-gasket-whistle-highway-speed': [['whistl'], ['roof', 'rail']],
  'toyota-corolla-cross-wind-noise-door-seals-2022': [['wind noise'], ['door', 'seal']],
  'toyota-corolla-cross-windshield-2022': [['windshield'], ['crack', 'shatter']],
  'toyota-rav4-rodent-attracting-soy-based-wiring-insulation-chewed-through': [['rodent', 'rat', 'mouse'], ['wire', 'wiring', 'harness']],
  'toyota-rav4-wind-noise-2019': [['wind noise'], ['door', 'seal', 'mirror']],
  'toyota-rav4-auto-stop-start-system-rough-restart-hesitation-accelerator': [['start stop', 'stop start'], ['hesitat', 'shudder', 'rough', 'restart']],
  'toyota-rav4-excessive-road-tire-noise-from-inadequate-cabin-insulation': [['road noise', 'tire noise', 'cabin noise']],
  'toyota-rav4-hybrid-regenerative-to-friction-brake-transition-causing-bri': [['brake'], ['regenerat', 'rough road', 'release', 'moment']],
  'toyota-rav4-loss-electric-power-steering-assist-heavy-steering-from-fail': [['steering'], ['assist', 'heavy', 'eps']],
  'toyota-rav4-p0174-system-too-lean-from-maf-pcv-contamination-intake-mani': [['p0174']],
};

const REDIRECTS = {
  'toyota-camry-engine-sludge-oiling-failure-and-engine-seizure-fire': 'toyota-camry-1mz-fe-3-0l-v6-oil-sludge-oil-gelling-engine-failure',
  'toyota-camry-hybrid-brake-booster-pump-accumulator-failure-long-pedal-abs': 'toyota-camry-brake-actuator-abs-2007',
  'toyota-corolla-cross-multimedia-head-unit-total-blackout-center-display-hardware': 'toyota-corolla-cross-infotainment-lag-2022',
  'toyota-rav4-fuel-pump-failure-2019': 'toyota-rav4-denso-low-pressure-fuel-pump-impeller-failure-causing-engine',
};

function queryUrl(model, year) {
  const params = new URLSearchParams({ make: 'TOYOTA', model: model.toUpperCase(), modelYear: String(year) });
  return `${API}?${params}`;
}

function complaintText(complaint) {
  return `${complaint.components || ''} ${complaint.summary || ''}`.toLowerCase();
}

function matchesRule(complaint, groups) {
  const text = complaintText(complaint);
  return groups.every((terms) => terms.some((term) => text.includes(term)));
}

async function fetchYear(model, year) {
  const url = queryUrl(model, year);
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'au7o-toyota-hold-review/1.0' },
      signal: AbortSignal.timeout(45_000),
    });
    if (!response.ok) return { url, complaints: [], error: `HTTP ${response.status}` };
    const body = await response.json();
    return { url, complaints: body.results || [], error: null };
  } catch (error) {
    return { url, complaints: [], error: error instanceof Error ? error.message : String(error) };
  }
}

async function mapLimit(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  async function consume() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, consume));
  return results;
}

async function main() {
  const review = JSON.parse(fs.readFileSync(REVIEW_PACKET, 'utf8'));
  const dispositions = JSON.parse(fs.readFileSync(DISPOSITIONS, 'utf8'));
  const dispositionById = new Map(dispositions.rows.map((row) => [row.id, row]));
  const highRisk = review.rows.filter((row) => dispositionById.get(row.id)?.recommendation === 'uphold-archive');
  const researchRows = highRisk.filter((row) => !REDIRECTS[row.id]);
  const missingRules = researchRows.filter((row) => !RULES[row.id]).map((row) => row.id);
  const extraRules = Object.keys(RULES).filter((id) => !researchRows.some((row) => row.id === id));
  if (missingRules.length || extraRules.length) {
    throw new Error(`rule coverage mismatch; missing=${missingRules.join(',')} extra=${extraRules.join(',')}`);
  }

  const pairs = [];
  const seenPairs = new Set();
  for (const row of researchRows) {
    for (const year of row.preAudit.years) {
      const key = `${row.model}|${year}`;
      if (!seenPairs.has(key)) {
        seenPairs.add(key);
        pairs.push({ model: row.model, year });
      }
    }
  }
  const fetched = await mapLimit(pairs, 3, async (pair) => ({ ...pair, ...(await fetchYear(pair.model, pair.year)) }));
  const byPair = new Map(fetched.map((entry) => [`${entry.model}|${entry.year}`, entry]));

  const rows = researchRows.map((row) => {
    const groups = RULES[row.id];
    const matches = [];
    const matchingByYear = {};
    const queries = [];
    for (const year of row.preAudit.years) {
      const entry = byPair.get(`${row.model}|${year}`);
      queries.push({ year, url: entry.url, complaintCount: entry.complaints.length, error: entry.error });
      const yearMatches = entry.complaints.filter((complaint) => matchesRule(complaint, groups));
      matchingByYear[year] = yearMatches.length;
      for (const complaint of yearMatches) matches.push({ ...complaint, modelYear: year, queryUrl: entry.url });
    }
    const unique = [...new Map(matches.map((item) => [item.odiNumber, item])).values()];
    return {
      id: row.id,
      model: row.model,
      title: row.preAudit.title,
      years: row.preAudit.years,
      keywordGroups: groups,
      matchingComplaintCount: unique.length,
      matchingByYear,
      samples: unique.slice(0, MAX_SAMPLES).map((item) => ({
        odiNumber: item.odiNumber,
        modelYear: item.modelYear,
        dateOfIncident: item.dateOfIncident,
        dateComplaintFiled: item.dateComplaintFiled,
        components: item.components,
        crash: item.crash,
        fire: item.fire,
        numberOfInjuries: item.numberOfInjuries,
        numberOfDeaths: item.numberOfDeaths,
        summary: item.summary,
        queryUrl: item.queryUrl,
      })),
      queries,
    };
  });

  const output = {
    schemaVersion: 1,
    generatedOn: new Date().toISOString(),
    source: 'NHTSA Complaints API',
    limitations: [
      'Complaints are owner reports; they do not prove a defect, cause, prevalence, affected population, or remedy.',
      'Keyword matches are candidates for human review, not automated publication decisions.',
      'Counts are not incidence rates and must never be presented as prevalence.',
    ],
    holdRows: highRisk.length,
    redirectRows: Object.entries(REDIRECTS).map(([id, targetId]) => ({ id, targetId })),
    researchRows: rows.length,
    modelYearQueries: pairs.length,
    failedQueries: fetched.filter((entry) => entry.error).map((entry) => ({
      model: entry.model,
      year: entry.year,
      url: entry.url,
      error: entry.error,
    })),
    rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(output, null, 2)}\n`);
  console.log(JSON.stringify({
    output: OUTPUT,
    holdRows: output.holdRows,
    redirectRows: output.redirectRows.length,
    researchRows: output.researchRows,
    modelYearQueries: output.modelYearQueries,
    failedQueries: output.failedQueries,
    matchedRows: rows.filter((row) => row.matchingComplaintCount > 0).length,
    noMatchRows: rows.filter((row) => row.matchingComplaintCount === 0).map((row) => row.id),
  }, null, 2));
}

if (require.main === module) main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

module.exports = { REDIRECTS, RULES, complaintText, matchesRule, queryUrl };
