/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const {
  SOURCE_FILES,
  RECALL_FILES,
  clone,
  diffFields,
  fullRecord,
  hashValue,
  normalizedFileHash,
} = require('./mazda-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_mazda-deeplink-snapshot-2026-08-09.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-mazda-b-series-adjudication-2026-08-09.json');
const REVIEW_DATE = '2026-08-09';
const NHTSA_DATASET_URL = 'https://www.nhtsa.gov/nhtsa-datasets-and-apis';
const MODEL_ALIASES = Object.freeze(['B-SERIES', 'B SERIES', 'B2000', 'B2200', 'B2300', 'B2500', 'B2600', 'B3000', 'B4000', 'PICKUP']);

const IDS = Object.freeze({
  ballJoint: 'mazda-b-series-ball-joint',
  frameRust: 'mazda-b-series-frame-rust-1994',
  headGasket: 'mazda-b-series-head-gasket-3l-1998',
  leafSpring: 'mazda-b-series-leaf-spring',
  timingChain: 'mazda-b-series-timing-chain',
});
const BLOCKER_IDS = Object.freeze(Object.values(IDS).sort());
const CAMPAIGNS = Object.freeze(['06E026000', '06E049000', '09E012000']);

const OTHER_SOURCES = Object.freeze({
  datasets: { title: 'NHTSA Datasets and APIs', type: 'nhtsa', url: NHTSA_DATASET_URL },
  complaints1996: { title: 'NHTSA 1996 Mazda B-Series Complaints', type: 'nhtsa', url: 'https://api.nhtsa.gov/complaints/complaintsByVehicle?make=MAZDA&model=B-SERIES&modelYear=1996' },
  complaints1997: { title: 'NHTSA 1997 Mazda B-Series Complaints', type: 'nhtsa', url: 'https://api.nhtsa.gov/complaints/complaintsByVehicle?make=MAZDA&model=B-SERIES&modelYear=1997' },
  complaints1998: { title: 'NHTSA 1998 Mazda B-Series Complaints', type: 'nhtsa', url: 'https://api.nhtsa.gov/complaints/complaintsByVehicle?make=MAZDA&model=B-SERIES&modelYear=1998' },
  complaints1999: { title: 'NHTSA 1999 Mazda B-Series Complaints', type: 'nhtsa', url: 'https://api.nhtsa.gov/complaints/complaintsByVehicle?make=MAZDA&model=B-SERIES&modelYear=1999' },
  complaints2000: { title: 'NHTSA 2000 Mazda B-Series Complaints', type: 'nhtsa', url: 'https://api.nhtsa.gov/complaints/complaintsByVehicle?make=MAZDA&model=B-SERIES&modelYear=2000' },
  complaints2001: { title: 'NHTSA 2001 Mazda B-Series Complaints', type: 'nhtsa', url: 'https://api.nhtsa.gov/complaints/complaintsByVehicle?make=MAZDA&model=B-SERIES&modelYear=2001' },
  complaints2004: { title: 'NHTSA 2004 Mazda B-Series Complaints', type: 'nhtsa', url: 'https://api.nhtsa.gov/complaints/complaintsByVehicle?make=MAZDA&model=B-SERIES&modelYear=2004' },
});

const BULLETIN_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL,
  modelAliases: MODEL_ALIASES,
  periodCounts: { '1995-1999': 17, '2000-2004': 1, '2005-2009': 0, '2010-2014': 0, '2015-2019': 2, '2020-2024': 15, '2025-2026': 0 },
  totalRows: 35,
  exactIssueCommunicationIds: [],
  sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});

const RECALL_INVENTORY = Object.freeze({
  source: NHTSA_DATASET_URL,
  modelAliases: MODEL_ALIASES,
  periodCounts: { pre: 11, post: 0 },
  totalRows: 11,
  campaignCount: CAMPAIGNS.length,
  campaigns: CAMPAIGNS,
  relevantCampaignsForPublishedPages: [],
  sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});

function citation(source) { return { url: source.url, type: source.type, title: source.title }; }
function citationsFor(id) {
  const map = {
    [IDS.ballJoint]: [OTHER_SOURCES.datasets, OTHER_SOURCES.complaints1998, OTHER_SOURCES.complaints2000],
    [IDS.frameRust]: [OTHER_SOURCES.complaints1996, OTHER_SOURCES.complaints1998, OTHER_SOURCES.complaints1999, OTHER_SOURCES.complaints2001, OTHER_SOURCES.complaints2004],
    [IDS.headGasket]: [OTHER_SOURCES.datasets, OTHER_SOURCES.complaints1998],
    [IDS.leafSpring]: [OTHER_SOURCES.datasets, OTHER_SOURCES.complaints1997, OTHER_SOURCES.complaints1998, OTHER_SOURCES.complaints2001, OTHER_SOURCES.complaints2004],
    [IDS.timingChain]: [OTHER_SOURCES.datasets, OTHER_SOURCES.complaints1998, OTHER_SOURCES.complaints2001],
  };
  if (!map[id]) throw new Error(`Unexpected Mazda B-Series row ${id}`);
  return map[id].map(citation);
}

function contentFor(id) {
  const content = {
    [IDS.ballJoint]: {
      confidence: 'medium',
      description: 'NHTSA complaint files include individual 1998 and 2000 Mazda B-Series reports describing badly worn or rusted ball joints. Other steering and front-suspension complaints in the model files involve tie rods, vibration or other components and must not be counted as ball-joint evidence. The reviewed Mazda communication and recall inventories do not establish that every upper and lower joint fails across all 1994-2009 configurations, and they do not verify the published Moog K80026 recommendation for every truck.',
      solution: 'If steering feels loose, the front end clunks, or tire wear is abnormal, have a qualified technician inspect each ball joint, control arm, tie-rod end, wheel bearing, bushing and mounting point using the correct unloaded/load-bearing procedure for that suspension. Do not drive a truck with measurable joint separation, a torn joint housing or a wheel that can change position unexpectedly. Do not buy a ball joint or control arm from this page; 2WD/4WD, suspension design, upper/lower location and VIN fitment must be verified first. Align the truck after any repair that changes suspension geometry.',
      symptoms: ['front-end clunk or looseness', 'abnormal tire wear or wandering', 'ball-joint play requires a suspension-specific inspection'],
      summary: 'Replaced unrelated citations and universal part advice with two bounded NHTSA ball-joint reports and a fitment-aware safety inspection.',
    },
    [IDS.frameRust]: {
      confidence: 'medium',
      description: 'NHTSA complaint files for multiple Mazda B-Series years describe frame perforation or cracking and corrosion around rear spring hangers, shackles, fuel-tank supports, spare-tire supports and the rear frame. Those reports support a serious structural-inspection concern, but they do not prove that every 1994-2009 truck is affected, that a C-channel design traps moisture in a specific way, or that structural weakness always appears within 10-15 years.',
      solution: 'Have the full frame inspected on a lift, with particular attention to spring hangers and shackles, crossmembers, shock mounts, fuel-tank and spare-tire supports, steering/suspension attachment points and any cracked or perforated rail. Do not drive or load the truck if a structural mount is separating, a rail is cracked, or a spring, fuel tank, spare tire or bumper is no longer securely supported. Surface coating may be preventive on sound metal, but it must not conceal scale, perforation or an unsafe prior repair. Do not buy coating or weld-in plates from this page; a qualified structural repairer must determine whether the frame is sound and repairable.',
      symptoms: ['frame scale, holes or cracks', 'rear spring hanger or shackle separates from the frame', 'fuel-tank, spare-tire or bumper support is weakened by corrosion'],
      summary: 'Retained the indexed structural-corrosion page using multi-year NHTSA reports while removing the unproven design cause, fixed age range and universal coating/weld-kit prescription.',
    },
    [IDS.headGasket]: {
      confidence: 'low',
      description: 'The complete reviewed Mazda communication inventory does not establish recurring 3.0-liter Vulcan head-gasket failure for the published 1998-2007 B-Series scope. The 1998 NHTSA complaint file contains individual head-gasket and overheating reports for a B4000, which identifies a 4.0-liter truck and therefore cannot validate this 3.0-liter page. The published 80,000-130,000-mile range, rear-gasket design explanation and universal hydrolock progression are not supported by the reviewed primary records.',
      solution: 'If the 3.0-liter engine overheats or loses coolant, stop driving before further heat damage. Pressure-test the cooling system and inspect external leaks, radiator, hoses, thermostat, water pump, fans, heater circuit and intake sealing. Use combustion-gas, compression and leak-down tests plus oil/coolant inspection before authorizing cylinder-head work. Do not buy Fel-Pro gaskets, ARP studs, an intake-gasket set or a head-gasket kit from this page; confirm the engine, leak path, head condition and required machine work first.',
      symptoms: ['3.0-liter engine overheats or loses coolant', 'combustion gas in the cooling system is suspected', 'possible head-gasket leak requires engine-specific testing'],
      summary: 'Flagged that the available head-gasket complaint concerns a B4000 rather than the frozen 3.0L identity and removed unsupported mileage, design and universal-parts claims.',
    },
    [IDS.leafSpring]: {
      confidence: 'low',
      description: 'NHTSA B-Series complaints document rear spring hangers and shackles separating after frame corrosion. Those records do not establish model-wide leaf-pack sag or spring breakage from hauling across every 1994-2009 truck. A low rear ride height can come from a cracked or fatigued leaf pack, an unsafe hanger or shackle, frame corrosion, mismatched springs, overloading or previous modification; those conditions require different remedies.',
      solution: 'Unload the truck and compare side-to-side ride height on level ground, then inspect every leaf for cracks or displacement, the center bolt, U-bolts, axle seating, bushings, shackles, hangers and surrounding frame. Do not drive or carry a load if a leaf is broken, the axle is not secured, or a hanger or frame mount is separating. Do not buy a Ranger spring pack, add-a-leaf, helper spring, shock set or alignment kit from this page; confirm the axle, cab/bed, payload package, ride height, VIN fitment and structural condition first.',
      symptoms: ['rear ride height is low or uneven', 'leaf, U-bolt, hanger or shackle damage is visible', 'rear suspension clunk or instability under load'],
      summary: 'Separated leaf-pack condition from the documented hanger/frame-corrosion complaints and removed unsupported interchangeability and helper-spring advice.',
    },
    [IDS.timingChain]: {
      confidence: 'low',
      description: 'The complete reviewed Mazda B-Series manufacturer-communication and complaint coverage did not establish a recurring timing-chain guide or tensioner defect for the frozen 1998-2007 scope. The page also combines 3.0-liter and 4.0-liter engines even though their timing architectures and service procedures are not interchangeable; a 4.0-liter SOHC guide narrative must not be applied automatically to a 3.0-liter Vulcan or to an unidentified 4.0-liter configuration.',
      solution: 'Identify the exact engine code and timing layout before diagnosing a rattle, correlation code or loss of performance. Check oil level, oil pressure, filter condition, accessory-drive noise, scan data and cam/crank correlation, and localize the noise with the appropriate service procedure. If timing correlation is lost or mechanical contact is suspected, stop driving and arrange engine-specific inspection. Do not buy a Ranger timing set, chain guide, tensioner, cam gear or oil product from this page; confirm the engine architecture and failed component first.',
      symptoms: ['engine rattle requires source localization', 'cam/crank correlation fault may be stored', 'timing system concern requires exact engine identification'],
      summary: 'Removed an unrelated Mazda forum citation and blocked the unsafe transfer of a 4.0L SOHC timing-guide narrative to the frozen 3.0L/4.0L scope.',
    },
  };
  if (!content[id]) throw new Error(`Unexpected Mazda B-Series row ${id}`);
  return content[id];
}

function evidenceFor(id) {
  const notes = {
    [IDS.ballJoint]: ['The 1998 and 2000 NHTSA files contain individual B-Series ball-joint reports.', 'Tie-rod and vibration reports are explicitly excluded from ball-joint evidence.'],
    [IDS.frameRust]: ['NHTSA complaint files directly describe frame perforation, cracking and structural-mount corrosion across several B-Series years.', 'No reviewed primary source proves the published C-channel mechanism, fixed age window or universal population.'],
    [IDS.headGasket]: ['No exact 3.0L B-Series head-gasket communication was found.', 'The reviewed 1998 head-gasket complaint identifies a B4000, so it cannot validate the frozen 3.0L page.'],
    [IDS.leafSpring]: ['Reviewed complaints describe hanger and shackle corrosion, not a verified model-wide leaf-pack sag/break pattern.', 'Spring, mounting, frame and overload causes require separate inspection.'],
    [IDS.timingChain]: ['No exact B-Series timing-chain communication or matching complaint was found in the reviewed coverage.', 'The frozen 3.0L/4.0L scope spans non-interchangeable engine architectures.'],
  };
  return { primaryEvidence: notes[id], limitations: 'Complaint narratives document individual reports, not a defect rate, universal cause, exact failed component or retail fitment.' };
}

function commerceDecisionFor(id) {
  const map = {
    [IDS.ballJoint]: 'No universal retail part; suspension design, drive configuration, joint location and VIN fitment require inspection.',
    [IDS.frameRust]: 'No universal retail part; a structural professional must determine whether the frame is sound, repairable or unsafe.',
    [IDS.headGasket]: 'No universal retail part; engine identity, leak path, head condition and machine-work requirements must be confirmed.',
    [IDS.leafSpring]: 'No universal retail part; axle, body, payload package, VIN fitment, ride height and frame integrity must be confirmed.',
    [IDS.timingChain]: 'No universal retail part; engine code, timing architecture and failed component must be confirmed.',
  };
  return map[id];
}

function proposalFor(before, id) {
  const content = contentFor(id);
  return {
    ...clone(before),
    description: content.description,
    solution: content.solution,
    confidence: content.confidence,
    symptoms: clone(content.symptoms),
    dtcCodes: [],
    estimatedCostLow: null,
    estimatedCostHigh: null,
    typicalMileageLow: null,
    typicalMileageHigh: null,
    citations: citationsFor(id),
    communityRecommendations: [],
    fixParts: [],
    humanApproved: false,
    source: 'ai-researched',
    reviewedOn: REVIEW_DATE,
    contentUpdatedOn: REVIEW_DATE,
    contentUpdateSummary: content.summary,
  };
}

function buildPacket(snapshot) {
  const rows = snapshot.records.filter((row) => row.make === 'Mazda' && row.model === 'B-Series').sort((a, b) => a.id.localeCompare(b.id));
  if (rows.length !== 5) throw new Error(`Expected 5 Mazda B-Series rows, found ${rows.length}`);
  const decisions = rows.map((row) => {
    const before = fullRecord(row);
    const proposal = proposalFor(before, row.id);
    return {
      id: row.id,
      action: 'retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source',
      reason: contentFor(row.id).summary,
      evidence: evidenceFor(row.id),
      commerceDecision: commerceDecisionFor(row.id),
      before,
      beforeSha256: hashValue(before),
      proposal,
      proposalSha256: hashValue(proposal),
      changedFields: diffFields(before, proposal),
    };
  });
  return {
    schemaVersion: 1,
    status: 'proposal-only',
    auditStage: 'model-primary-source-technical-adjudication',
    requiresIndependentApproval: true,
    generatedOn: REVIEW_DATE,
    make: 'Mazda',
    model: 'B-Series',
    completionStatement: 'All 5 frozen Mazda B-Series pages are accounted for with indexed identities and vehicle scopes preserved.',
    applicationGate: { status: 'blocked', blockerRecordIds: BLOCKER_IDS, reason: 'All 5 rows contain material source, fitment, diagnosis or safety corrections and require independent review before any catalog write.' },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change, related-link change or new issue is authorized.',
      'All 5 pages remain published with their exact frozen identity, vehicle metadata, report count and canonical severity.',
      'Complaint records are evidence that a condition was reported, not proof of a defect rate, universal cause or exact failed component.',
      'Ford Ranger similarity is not used as proof of Mazda B-Series fitment, engine architecture or defect coverage.',
      'Every named replaceable part is covered by an explicit no-universal-retail-part boundary.',
      'Unknown owner totals remain zero and no report count is rendered or written as owner social proof.',
      'No search-style commerce link, buy link, fixParts record or community recommendation is introduced.',
    ],
    source: { snapshotFile: 'data/_mazda-deeplink-snapshot-2026-08-09.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: rows.length },
    observations: [
      { code: 'b-series-frame-leaf-causes-separated', severity: 'safety-correction', recordIds: [IDS.frameRust, IDS.leafSpring], detail: 'Documented hanger/shackle corrosion is retained on the frame page and is not misrepresented as proof of leaf-pack sag or payload damage.' },
      { code: 'b-series-head-gasket-engine-mismatch', severity: 'accuracy-correction', recordIds: [IDS.headGasket], detail: 'The primary head-gasket complaint found is a B4000/4.0L report and cannot support the frozen 3.0L identity.' },
      { code: 'b-series-timing-engine-architecture-hold', severity: 'accuracy-correction', recordIds: [IDS.timingChain], detail: 'The frozen 3.0L and 4.0L scope spans non-interchangeable timing architectures; no generic Ranger kit or narrative is authorized.' },
      { code: 'b-series-nonzero-counts-preserved-not-rendered', severity: 'data-integrity', recordIds: [IDS.ballJoint, IDS.leafSpring, IDS.timingChain], detail: 'Existing counts 170, 130 and 220 remain frozen but are not converted into owner social proof.' },
      { code: 'all-b-series-pages-preserved', severity: 'seo-safety', recordIds: rows.map((row) => row.id), detail: 'No Mazda B-Series page is removed, redirected or allowed to lose its indexed identity or vehicle scope.' },
    ],
    pdfSources: {},
    otherSources: clone(OTHER_SOURCES),
    manufacturerCommunications: BULLETIN_INVENTORY,
    recallInventory: RECALL_INVENTORY,
    summary: { retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source: rows.length, total: rows.length },
    rows: decisions,
  };
}

if (require.main === module) {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  const packet = buildPacket(snapshot);
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, rows: packet.rows.length, summary: packet.summary, applicationGate: packet.applicationGate }, null, 2));
}

module.exports = { BLOCKER_IDS, BULLETIN_INVENTORY, CAMPAIGNS, IDS, MODEL_ALIASES, OTHER_SOURCES, OUTPUT, RECALL_INVENTORY, REVIEW_DATE, SNAPSHOT, buildPacket, citationsFor, commerceDecisionFor, contentFor, evidenceFor, proposalFor };
