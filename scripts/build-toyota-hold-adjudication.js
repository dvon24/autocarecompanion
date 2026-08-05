/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const REVIEW_FILE = path.join(PROJECT_ROOT, 'data', '_toyota-hold-review-packet.json');
const DISPOSITIONS_FILE = path.join(PROJECT_ROOT, 'data', '_toyota-hold-dispositions.json');
const COMPLAINTS_FILE = path.join(PROJECT_ROOT, 'data', '_toyota-hold-nhtsa-complaint-candidates.json');
const OUTPUT = path.join(PROJECT_ROOT, 'data', 'known-issue-toyota-hold-adjudication-2026-08-05.json');

const FULL_RECORD_FIELDS = [
  'make', 'model', 'years', 'trims', 'engines', 'category', 'title', 'description', 'solution',
  'severity', 'confidence', 'symptoms', 'affectedSystems', 'dtcCodes', 'estimatedCostLow',
  'estimatedCostHigh', 'typicalMileageLow', 'typicalMileageHigh', 'citations',
  'communityRecommendations', 'fixParts', 'humanApproved', 'reportCount', 'source', 'status',
  'lastReportedByOwners', 'reviewedOn', 'contentUpdatedOn', 'contentUpdateSummary', 'relatedIssueIds',
];

const REDIRECTS = {
  'toyota-camry-power-window-regulator-window-glass-failure': 'toyota-camry-power-window-regulator-motor-failure',
  'toyota-camry-engine-sludge-oiling-failure-and-engine-seizure-fire': 'toyota-camry-1mz-fe-3-0l-v6-oil-sludge-oil-gelling-engine-failure',
  'toyota-camry-hybrid-brake-booster-pump-accumulator-failure-long-pedal-abs': 'toyota-camry-brake-actuator-abs-2007',
  'toyota-corolla-cross-cvt-shudder-2022': 'toyota-corolla-cross-cvt-hesitation-2022',
  'toyota-corolla-cross-multimedia-head-unit-total-blackout-center-display-hardware': 'toyota-corolla-cross-infotainment-lag-2022',
  'toyota-rav4-fuel-pump-failure-2019': 'toyota-rav4-denso-low-pressure-fuel-pump-impeller-failure-causing-engine',
};

const CANONICAL_TARGETS = {
  'toyota-camry-power-window-regulator-motor-failure': { model: 'Camry', title: 'Power Window Regulator / Motor Failure' },
  'toyota-camry-1mz-fe-3-0l-v6-oil-sludge-oil-gelling-engine-failure': { model: 'Camry', title: '1MZ-FE 3.0L V6 Oil Sludge / Oil Gelling and Engine Failure' },
  'toyota-camry-brake-actuator-abs-2007': { model: 'Camry', title: 'Brake Actuator / ABS Module Internal Failure Causing Warning Lights and Loss of Assist' },
  'toyota-corolla-cross-cvt-hesitation-2022': { model: 'Corolla Cross', title: 'CVT Hesitation and Delayed Acceleration Response' },
  'toyota-corolla-cross-infotainment-lag-2022': { model: 'Corolla Cross', title: 'Infotainment Lag / Reboot and Multimedia-System Diagnosis' },
  'toyota-rav4-denso-low-pressure-fuel-pump-impeller-failure-causing-engine': { model: 'RAV4', title: 'Denso Low-Pressure Fuel-Pump Recall Condition' },
};

const HIGH_RISK_REPUBLISH = new Set([
  'toyota-camry-p0430-bank-2-catalytic-converter-efficiency-failure-3-5l-v6',
  'toyota-camry-sudden-unintended-acceleration-sticking-accelerator-pedal',
  'toyota-camry-transmission-2018',
  'toyota-camry-tss-issues-2018',
  'toyota-camry-warped-front-brake-rotors-causing-steering-wheel-shudder-pul',
  'toyota-camry-3vz-fe-3-0l-v6-head-gasket-failure',
  'toyota-camry-automatic-transmission-delay-no-engagement-and-shift-lever-failure',
  'toyota-camry-evap-charcoal-canister--2002',
  'toyota-camry-exterior-door-handle-breakage',
  'toyota-camry-hood-latch-hood-popping-open-while-driving',
  'toyota-corolla-cross-cvt-hesitation-2022',
  'toyota-corolla-cross-excessive-cabin-road-noise-booming-rough-pavement',
  'toyota-corolla-cross-power-liftgate-unlatches-but-fails-to-raise',
  'toyota-corolla-cross-roof-rail-gasket-whistle-highway-speed',
  'toyota-rav4-rodent-attracting-soy-based-wiring-insulation-chewed-through',
  'toyota-rav4-excessive-road-tire-noise-from-inadequate-cabin-insulation',
  'toyota-rav4-loss-electric-power-steering-assist-heavy-steering-from-fail',
  'toyota-rav4-p0174-system-too-lean-from-maf-pcv-contamination-intake-mani',
]);

const SOURCELESS_HOLDS = new Set([
  'toyota-camry-rear-wheel-bearing--2002',
  'toyota-rav4-air-conditioning-compressor-clutch-2001',
]);

const PREFERRED_COMPLAINT_ODIS = {
  'toyota-camry-sudden-unintended-acceleration-sticking-accelerator-pedal': [11186369],
  'toyota-camry-transmission-2018': [11753527],
  'toyota-camry-tss-issues-2018': [11724804],
  'toyota-camry-warped-front-brake-rotors-causing-steering-wheel-shudder-pul': [10667417],
  'toyota-camry-3vz-fe-3-0l-v6-head-gasket-failure': [8020007],
  'toyota-camry-automatic-transmission-delay-no-engagement-and-shift-lever-failure': [10361727],
  'toyota-camry-evap-charcoal-canister--2002': [10735783],
  'toyota-camry-exterior-door-handle-breakage': [10725883, 10720976],
  'toyota-camry-hood-latch-hood-popping-open-while-driving': [11072878],
  'toyota-corolla-cross-cvt-hesitation-2022': [11725065],
  'toyota-corolla-cross-power-liftgate-unlatches-but-fails-to-raise': [11629494],
  'toyota-rav4-rodent-attracting-soy-based-wiring-insulation-chewed-through': [10818982],
  'toyota-rav4-excessive-road-tire-noise-from-inadequate-cabin-insulation': [11376034],
  'toyota-rav4-loss-electric-power-steering-assist-heavy-steering-from-fail': [10359941, 10822452],
  'toyota-rav4-p0174-system-too-lean-from-maf-pcv-contamination-intake-mani': [10660548],
};

const EXCLUDED_CITATION_URLS_BY_ID = {
  'toyota-camry-p0430-bank-2-catalytic-converter-efficiency-failure-3-5l-v6': [
    'https://static.nhtsa.gov/odi/tsbs/2013/SB-10061568-2280.pdf',
  ],
  'toyota-camry-sudden-unintended-acceleration-sticking-accelerator-pedal': [
    'https://static.nhtsa.gov/odi/rcl/2010/RCAK-10V017-1465.pdf',
    'https://pressroom.toyota.com/toyota-lexus-consumer-safety-advisory-potential-floor-mat-interference-with-accelerator-pedal/',
    'https://www.nhtsa.gov/recalls',
  ],
  'toyota-camry-transmission-2018': [
    'https://static.nhtsa.gov/odi/tsbs/2021/MC-10187043-9999.pdf',
  ],
  'toyota-camry-3vz-fe-3-0l-v6-head-gasket-failure': [
    'https://static.nhtsa.gov/odi/tsbs/2018/MC-10145756-9999.pdf',
  ],
  'toyota-camry-automatic-transmission-delay-no-engagement-and-shift-lever-failure': [
    'https://www.nhtsa.gov/document/vehicle-characterization-and-performance-study-toyota-camrys',
  ],
  'toyota-camry-exterior-door-handle-breakage': ['https://www.nhtsa.gov/nhtsa-datasets-and-apis'],
  'toyota-camry-hood-latch-hood-popping-open-while-driving': ['https://www.nhtsa.gov/nhtsa-datasets-and-apis'],
  'toyota-corolla-cross-cvt-hesitation-2022': [
    'https://pressroom.toyota.com/2022-toyota-corolla-cross-makes-u-s-debut-and-expands-corolla-lineup/',
    'https://pressroom.toyota.com/revealed-first-ever-2023-toyota-corolla-cross-hybrid-2/',
    'https://pressroom.toyota.com/assembled-in-america-and-arriving-now-2026-toyota-corolla-cross/',
  ],
  'toyota-corolla-cross-roof-rail-gasket-whistle-highway-speed': [
    'https://pressroom.toyota.com/toyota-corolla-cross-all-new-body-style-adds-utility-fun/',
    'https://pressroom.toyota.com/revealed-first-ever-2023-toyota-corolla-cross-hybrid-2/',
  ],
};

const TITLE_OVERRIDES = {
  'toyota-camry-p0430-bank-2-catalytic-converter-efficiency-failure-3-5l-v6': 'P0430 Bank 2 Catalyst-Monitor Code — Diagnostic Guide',
  'toyota-camry-sudden-unintended-acceleration-sticking-accelerator-pedal': 'Owner-Reported Sudden Acceleration — 2000 Camry',
  'toyota-camry-transmission-2018': 'Owner-Reported 8-Speed Hesitation and Jerking — 2018–2023 Camry',
  'toyota-camry-tss-issues-2018': 'Owner-Reported Toyota Safety Sense Alerts and Unexpected Braking',
  'toyota-camry-warped-front-brake-rotors-causing-steering-wheel-shudder-pul': 'Owner-Reported Brake Pulsation and Steering-Wheel Shudder',
  'toyota-camry-3vz-fe-3-0l-v6-head-gasket-failure': 'Owner-Reported 3VZ-FE Coolant Loss and Head-Gasket Diagnoses',
  'toyota-camry-automatic-transmission-delay-no-engagement-and-shift-lever-failure': 'Owner-Reported Transmission Slip and Delayed Engagement — 2000 Camry',
  'toyota-camry-evap-charcoal-canister--2002': 'Owner-Reported EVAP Canister and Vent-Valve Faults — 2002–2011 Camry',
  'toyota-camry-exterior-door-handle-breakage': 'Owner-Reported Exterior Door-Handle Breakage — 2000 Camry',
  'toyota-camry-hood-latch-hood-popping-open-while-driving': 'Owner-Reported Hood-Latch Release While Driving — 2000 Camry',
  'toyota-corolla-cross-cvt-hesitation-2022': 'Owner-Reported Acceleration Hesitation — 2024 Corolla Cross',
  'toyota-corolla-cross-excessive-cabin-road-noise-booming-rough-pavement': 'Owner-Reported Cabin Road Noise — 2022–2023 Corolla Cross',
  'toyota-corolla-cross-power-liftgate-unlatches-but-fails-to-raise': 'Owner-Reported Power-Liftgate Raise Failure — Corolla Cross',
  'toyota-corolla-cross-roof-rail-gasket-whistle-highway-speed': 'Owner-Reported Roof-Area Whistle — 2023 Corolla Cross',
  'toyota-rav4-rodent-attracting-soy-based-wiring-insulation-chewed-through': 'Rodent-Chewed Wiring Reports — RAV4',
  'toyota-rav4-excessive-road-tire-noise-from-inadequate-cabin-insulation': 'Owner-Reported Road and Tire Noise — 2017–2019 RAV4',
  'toyota-rav4-loss-electric-power-steering-assist-heavy-steering-from-fail': 'Steering-Shaft Clunk and Separate Assist-Loss Reports — 2006–2008 RAV4',
  'toyota-rav4-p0174-system-too-lean-from-maf-pcv-contamination-intake-mani': 'P0174 Bank 2 Fuel-Trim Code — 2GR-FE RAV4 Diagnostic Guide',
};

const YEAR_OVERRIDES = {
  'toyota-corolla-cross-cvt-hesitation-2022': [2024],
  'toyota-corolla-cross-excessive-cabin-road-noise-booming-rough-pavement': [2022, 2023],
  'toyota-corolla-cross-roof-rail-gasket-whistle-highway-speed': [2023],
  'toyota-rav4-excessive-road-tire-noise-from-inadequate-cabin-insulation': [2017, 2018, 2019],
  'toyota-rav4-loss-electric-power-steering-assist-heavy-steering-from-fail': [2006, 2007, 2008],
};

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]));
  }
  return value;
}

function hashValue(value) {
  return crypto.createHash('sha256').update(JSON.stringify(stableValue(value))).digest('hex');
}

function normalizedFileHash(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n')).digest('hex');
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function fullRecord(row) {
  return Object.fromEntries(FULL_RECORD_FIELDS.map((field) => [field, clone(row[field])]));
}

function cleanTitle(title) {
  return title
    .replace(/^Archived\s*[-:]\s*/i, '')
    .replace(/\s*-\s*Archived(?:\s+Pending\s+Primary\s+Evidence)?$/i, '')
    .replace(/\s+Archived(?:\s+Pending\s+Primary\s+Evidence)?$/i, '')
    .replace(/^Unsupported\s+/i, 'Evidence-Limited ')
    .replace(/^Unverified\s+/i, 'Owner-Reported ')
    .replace(/^Unbounded\s+/i, 'Evidence-Limited ')
    .replace(/^Unsubstantiated\s+/i, 'Owner-Reported ')
    .replace(/^False\s+/i, 'Corrected ')
    .replace(/Parts-Replacement Claim/gi, 'Diagnostic Guide')
    .replace(/Defect Claim/gi, 'Evidence Review')
    .replace(/Cause Rule/gi, 'Diagnostic Guide')
    .replace(/Parts Card/gi, 'Diagnostic Guide')
    .replace(/Shopping Card/gi, 'Diagnostic Guide')
    .replace(/Complaint Bundle/gi, 'Owner-Report Review')
    .replace(/Complaint Aggregation/gi, 'Owner-Report Review')
    .replace(/Aggregation/gi, 'Evidence Review')
    .replace(/\bCard\b/gi, 'Diagnostic Guide')
    .replace(/\bClaim\b/gi, 'Evidence Review')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanVisibleText(text) {
  return String(text || '')
    .replace(/^Archived because\s+/i, '')
    .replace(/^Archived after\s+/i, '')
    .replace(/^Archived as\s+/i, '')
    .replace(/\bthis archived card\b/gi, 'the earlier broad card')
    .replace(/\bthe archived card\b/gi, 'the earlier broad card')
    .replace(/\bthis archived page\b/gi, 'this diagnostic page')
    .replace(/\bthe archived row\b/gi, 'the earlier duplicate row')
    .replace(/\barchived\b/gi, 'earlier')
    .replace(/\s+/g, ' ')
    .trim();
}

function isGenericOrSearchCitation(rawUrl) {
  try {
    const url = new URL(rawUrl);
    const pathName = url.pathname.replace(/\/+$/, '').toLowerCase();
    return url.searchParams.has('k')
      || url.searchParams.has('_nkw')
      || pathName === ''
      || pathName === '/s'
      || pathName.includes('/search')
      || pathName.includes('/category')
      || pathName === '/nhtsa-datasets-and-apis';
  } catch {
    return true;
  }
}

function complaintSamples(id, complaintsById) {
  const preferred = PREFERRED_COMPLAINT_ODIS[id] || [];
  const research = complaintsById.get(id);
  if (!research) return [];
  return preferred.map((odiNumber) => {
    const sample = research.samples.find((candidate) => candidate.odiNumber === odiNumber);
    if (!sample) throw new Error(`${id}: preferred ODI ${odiNumber} missing from research output`);
    return sample;
  });
}

function cleanedCitations(id, auditAfter, selectedComplaints) {
  const excluded = new Set(EXCLUDED_CITATION_URLS_BY_ID[id] || []);
  const removed = [];
  const kept = [];
  for (const citation of auditAfter.citations || []) {
    if (excluded.has(citation.url) || isGenericOrSearchCitation(citation.url)) removed.push(citation.url);
    else kept.push(clone(citation));
  }
  for (const sample of selectedComplaints) {
    kept.push({
      type: 'nhtsa-owner-report',
      title: `NHTSA owner-complaint query — ${sample.modelYear} Toyota (sample ODI ${sample.odiNumber})`,
      url: sample.queryUrl,
    });
  }
  const unique = [...new Map(kept.map((citation) => [`${citation.url}|${citation.title}`, citation])).values()];
  return { citations: unique, removed };
}

function evidenceLead(id, selectedComplaints) {
  if (selectedComplaints.length) {
    return 'NHTSA’s public complaints dataset contains owner reports matching this symptom. Owner reports are allegations; they do not prove a shared defect, cause, prevalence, affected population, or automatic repair.';
  }
  if (id === 'toyota-camry-p0430-bank-2-catalytic-converter-efficiency-failure-3-5l-v6') {
    return 'Toyota diagnostic guidance supports a P0430 diagnostic page, not an automatic converter, sensor, or software diagnosis.';
  }
  if (id === 'toyota-corolla-cross-excessive-cabin-road-noise-booming-rough-pavement'
      || id === 'toyota-corolla-cross-roof-rail-gasket-whistle-highway-speed') {
    return 'The cited owner discussions report this concern. They do not prove a design defect, prevalence, year-wide scope, or a universal repair.';
  }
  return 'This page is retained as an evidence-limited diagnostic guide. It does not establish a model-wide defect, prevalence, or automatic repair.';
}

function republishProposal(id, auditAfter, selectedComplaints) {
  const { citations, removed } = cleanedCitations(id, auditAfter, selectedComplaints);
  const proposal = fullRecord({
    ...auditAfter,
    years: YEAR_OVERRIDES[id] || auditAfter.years,
    trims: [],
    engines: [],
    title: TITLE_OVERRIDES[id] || cleanTitle(auditAfter.title),
    description: `${evidenceLead(id, selectedComplaints)} ${cleanVisibleText(auditAfter.description)}`,
    solution: cleanVisibleText(auditAfter.solution),
    confidence: HIGH_RISK_REPUBLISH.has(id) ? 'low' : auditAfter.confidence,
    estimatedCostLow: null,
    estimatedCostHigh: null,
    typicalMileageLow: null,
    typicalMileageHigh: null,
    citations,
    communityRecommendations: [],
    fixParts: [],
    humanApproved: false,
    reportCount: 0,
    source: 'manual',
    status: 'published',
    reviewedOn: '2026-08-05',
    contentUpdatedOn: '2026-08-05',
    contentUpdateSummary: 'Proposal only: republish as an evidence-limited diagnostic or owner-report page; remove unsupported prevalence, cost, mileage and automatic-parts claims.',
  });
  return { proposal, removedCitationUrls: removed };
}

function rationaleFor(id, action, preliminaryRationale, selectedComplaints) {
  if (action === 'redirect_duplicate') {
    return `The issue identity duplicates ${REDIRECTS[id]}. Preserve the source URL with a permanent canonical redirect before retiring the duplicate record.`;
  }
  if (SOURCELESS_HOLDS.has(id)) {
    return 'The preliminary republish recommendation relied on a forum homepage rather than an issue-specific deep link. After generic-link removal, no specific evidence remains, so this row stays held pending a usable source.';
  }
  if (HIGH_RISK_REPUBLISH.has(id)) {
    if (selectedComplaints.length) {
      return `Reconsidered after exact NHTSA owner-complaint evidence was found (sample ODI ${selectedComplaints.map((sample) => sample.odiNumber).join(', ')}). Preserve the slug with an evidence-limited rewrite that labels reports as allegations and removes causation, prevalence, commerce, cost and mileage claims.`;
    }
    return 'Reconsidered because issue-specific diagnostic or owner-report deep links support preserving the slug as an evidence-limited page. The proposal removes defect prevalence, automatic repair and commerce claims.';
  }
  return preliminaryRationale;
}

const review = JSON.parse(fs.readFileSync(REVIEW_FILE, 'utf8'));
const dispositions = JSON.parse(fs.readFileSync(DISPOSITIONS_FILE, 'utf8'));
const complaints = JSON.parse(fs.readFileSync(COMPLAINTS_FILE, 'utf8'));
const dispositionById = new Map(dispositions.rows.map((row) => [row.id, row]));
const complaintsById = new Map(complaints.rows.map((row) => [row.id, row]));

const ACTION_BY_ID = new Map(review.rows.map((row) => {
  const preliminary = dispositionById.get(row.id)?.recommendation;
  let action;
  if (REDIRECTS[row.id]) action = 'redirect_duplicate';
  else if (preliminary === 'keep-published-as-audited') action = 'keep_audited_correction';
  else if (SOURCELESS_HOLDS.has(row.id)) action = 'uphold_archive_evidence_defect';
  else if (preliminary === 'rewrite-then-republish' || HIGH_RISK_REPUBLISH.has(row.id)) action = 'rewrite_and_republish';
  else action = 'uphold_archive_evidence_defect';
  return [row.id, action];
}));

function main() {
  if (ACTION_BY_ID.size !== 91) throw new Error(`expected 91 action rows, found ${ACTION_BY_ID.size}`);
  const rows = review.rows.map((row) => {
    const decision = row.auditDecisions[0];
    if (!decision || row.auditDecisions.length !== 1) throw new Error(`${row.id}: expected one reconciled audit decision`);
    const action = ACTION_BY_ID.get(row.id);
    const before = fullRecord(row.preAudit);
    const auditAfter = fullRecord(decision.after);
    const selectedComplaints = complaintSamples(row.id, complaintsById);
    let proposal = auditAfter;
    let removedCitationUrls = [];
    if (action === 'rewrite_and_republish') {
      ({ proposal, removedCitationUrls } = republishProposal(row.id, auditAfter, selectedComplaints));
    } else if (action === 'redirect_duplicate') {
      proposal = fullRecord({
        ...auditAfter,
        relatedIssueIds: [...new Set([...(auditAfter.relatedIssueIds || []), REDIRECTS[row.id]])],
      });
    }
    return {
      id: row.id,
      make: row.make,
      model: row.model,
      action,
      rationale: rationaleFor(
        row.id,
        action,
        dispositionById.get(row.id)?.rationale || decision.decision,
        selectedComplaints,
      ),
      redirectTargetId: REDIRECTS[row.id] || null,
      redirectTarget: REDIRECTS[row.id] ? CANONICAL_TARGETS[REDIRECTS[row.id]] : null,
      removedCitationUrls,
      evidence: {
        auditDecision: decision.decision,
        auditEvidence: decision.evidence,
        nhtsaOwnerReports: selectedComplaints,
        nhtsaLimitations: complaints.limitations,
      },
      beforeSha256: hashValue(before),
      auditAfterSha256: hashValue(auditAfter),
      proposalSha256: hashValue(proposal),
      before,
      auditAfter,
      proposal,
    };
  });

  const actions = [...new Set(ACTION_BY_ID.values())];
  const summary = Object.fromEntries(actions.map((action) => [action, rows.filter((row) => row.action === action).length]));
  summary.total = rows.length;
  const packet = {
    schemaVersion: 1,
    status: 'proposal-only',
    requiresIndependentApproval: true,
    generatedOn: '2026-08-05',
    make: 'Toyota',
    scope: '91-row post-restore content hold',
    source: {
      reviewPacket: 'data/_toyota-hold-review-packet.json',
      reviewPacketSha256: normalizedFileHash(REVIEW_FILE),
      preliminaryDispositions: 'data/_toyota-hold-dispositions.json',
      preliminaryDispositionsSha256: normalizedFileHash(DISPOSITIONS_FILE),
      complaintCandidates: 'data/_toyota-hold-nhtsa-complaint-candidates.json',
      complaintCandidatesSha256: normalizedFileHash(COMPLAINTS_FILE),
      preAuditSnapshotSha256: review.source.preAuditSnapshotSha256,
      restoreManifestSha256: review.source.holdManifestSha256,
    },
    safetyContract: [
      'This packet has no production write, cache purge, deploy or apply path.',
      'No archive recommendation is based only on the absence of an OEM bulletin.',
      'Owner reports are labeled as allegations and never converted into prevalence or causation claims.',
      'All republish proposals remove commerce, costs, mileage claims and applicability labels.',
      'Every duplicate has an explicit canonical redirect target; a redirect must exist before its source URL is retired.',
      'Thirteen evidence-defect archives remain recommendations for independent review, not authorized writes.',
    ],
    summary,
    rows,
  };
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, sha256: normalizedFileHash(OUTPUT), summary }, null, 2));
}

if (require.main === module) main();

module.exports = {
  ACTION_BY_ID,
  CANONICAL_TARGETS,
  EXCLUDED_CITATION_URLS_BY_ID,
  FULL_RECORD_FIELDS,
  HIGH_RISK_REPUBLISH,
  PREFERRED_COMPLAINT_ODIS,
  REDIRECTS,
  SOURCELESS_HOLDS,
  TITLE_OVERRIDES,
  YEAR_OVERRIDES,
  cleanTitle,
  cleanVisibleText,
  fullRecord,
  hashValue,
  isGenericOrSearchCitation,
  normalizedFileHash,
  republishProposal,
  rationaleFor,
};
