/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { SOURCE_FILES, RECALL_FILES, clone, diffFields, fullRecord, hashValue, normalizedFileHash } = require('./mazda-adjudication-utils');

const SNAPSHOT = path.resolve(__dirname, '..', 'data', '_mazda-deeplink-snapshot-2026-08-09.json');
const OUTPUT = path.resolve(__dirname, '..', 'data', 'known-issue-mazda-cx-7-adjudication-2026-08-09.json');
const REVIEW_DATE = '2026-08-09';
const MODEL_ALIASES = Object.freeze(['CX-7', 'CX7']);
const IDS = Object.freeze({ combined: 'mazda-cx7-turbo-failure-2007', vvt: 'mazda-cx7-vvt-actuator-2007' });
const BLOCKER_IDS = Object.freeze(Object.values(IDS).sort());
const REQUIRED_COMMUNICATION_IDS = Object.freeze(['10034634', '10039250', '10039251', '10043875', '10044209']);
const CAMPAIGNS = Object.freeze(['09E011000', '16V593000', '17V429000', '17V457000', '18V018000', '18V717000', '19V782000']);

const PDF_SOURCES = Object.freeze({
  ssp86: { title: 'Mazda SSP86 Heavy White Exhaust Smoke Warranty Extension Owner Letter', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2012/CSC-10043874-2940.pdf', localPath: 'C:/tmp/mazda-cx7-sources/CSC-10043874-2940.pdf', pages: 2, visualPages: [1, 2], bytes: 77665, sha256: '6e45741e17c5bc38164b4ad86b4deeff3e3ec26548999fccf0837027d3278ebc' },
  ssp87: { title: 'Mazda SSP87 VVT and Timing Chain Noise Warranty Extension Owner Letter', type: 'manufacturer', url: 'https://static.nhtsa.gov/odi/tsbs/2012/CSC-10043875-4853.pdf', localPath: 'C:/tmp/mazda-cx7-sources/CSC-10043875-4853.pdf', pages: 2, visualPages: [1, 2], bytes: 104998, sha256: '0af1ae24f3ca725d7b0c9ac7fd2ff118d659893a69dbd121d761b9f8f1964730' },
});
const BULLETIN_INVENTORY = Object.freeze({
  source: 'https://www.nhtsa.gov/nhtsa-datasets-and-apis', aliases: MODEL_ALIASES,
  periodCounts: { '1995-1999': 0, '2000-2004': 0, '2005-2009': 20, '2010-2014': 33, '2015-2019': 163, '2020-2024': 63, '2025-2026': 8 },
  totalRows: 287, requiredCommunicationIds: REQUIRED_COMMUNICATION_IDS,
  sourceFiles: SOURCE_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});
const RECALL_INVENTORY = Object.freeze({
  source: 'https://www.nhtsa.gov/nhtsa-datasets-and-apis', aliases: MODEL_ALIASES,
  periodCounts: { pre: 3, post: 26 }, totalRows: 29, campaignCount: CAMPAIGNS.length, campaigns: CAMPAIGNS,
  sourceFiles: RECALL_FILES.map(({ period, length, sha256 }) => ({ period, length, sha256 })),
});

function citation(source) { return { title: source.title, type: source.type, url: source.url }; }
function citationsFor(id) {
  if (id === IDS.combined) return [PDF_SOURCES.ssp87, PDF_SOURCES.ssp86].map(citation);
  if (id === IDS.vvt) return [PDF_SOURCES.ssp87].map(citation);
  throw new Error(`Unexpected Mazda CX-7 row ${id}`);
}
function contentFor(id) {
  const content = {
    [IDS.combined]: {
      confidence: 'high',
      description: 'Mazda documented two separate L3T-engine programs. SSP87 covered certain 2007-2010 CX-7 vehicles for a loud cold-start VVT tick from VVT-rotor lock-pin-hole wear or VVT-case breakage, and a warm rattle below 2,000 rpm from excessive timing-chain stretch. SSP86 covered certain Federal-emissions 2007-2009 CX-7 vehicles for heavy white exhaust smoke after long idle or low-speed driving that may result from turbocharger engine-oil leakage. These programs do not establish the frozen 2011-2012 scope, universal carbon buildup, P0014/P0299, or automatic turbo failure.',
      solution: 'Use the VIN, build date, engine and exact symptom to separate the two paths. For the SSP87 condition, Mazda directed dealer inspection and replacement of the VVT actuator or both the actuator and timing chain only when that cause was verified. For the SSP86 condition, Mazda directed inspection of the white-smoke cause, then a ventilation kit or turbocharger replacement only when turbo oil leakage was verified. The historical warranty extensions may be expired; ask Mazda about current VIN eligibility and service information. Do not buy a VVT actuator, timing kit, turbocharger, oil line or carbon-cleaning service from this page; the applicable program and failed component must be verified first.',
      symptoms: ['loud VVT ticking immediately after a cold start', 'warm knocking or rattle below 2,000 rpm from the timing-cover area', 'heavy white exhaust smoke after a long idle or low-speed driving'],
      summary: 'Separated Mazda SSP87 VVT/timing-chain noise from SSP86 turbo-oil white smoke and removed unsupported 2011-2012, DTC, oil-interval, carbon and parts claims.',
    },
    [IDS.vvt]: {
      confidence: 'high',
      description: 'Mazda SSP87 covered certain 2007-2010 CX-7 vehicles equipped with the L3T engine and produced from February 14, 2006 through February 26, 2010. Mazda describes a loud tick when first started cold from wear at the VVT-rotor lock-pin hole or VVT-case breakage, and a separate warm knock or rattle below 2,000 rpm from excessive timing-chain stretch. The source does not support the frozen 2011-2012 years, generic VVT-solenoid failure, oil-contamination causation, or the listed P0011/P0012/P0016 codes.',
      solution: 'Have Mazda reproduce and localize the noise, verify the VIN/build date and maintenance history, and distinguish the brief cold-start VVT tick from the warm sub-2,000-rpm timing-chain rattle. SSP87 directed replacement of the VVT actuator, or the actuator plus timing chain, only after dealer inspection verified the cause. Its seven-year/70,000-mile warranty extension was historical and may be expired. Do not buy a VVT solenoid, actuator or timing-chain kit from this page; engine identity, noise source and current Mazda coverage must be verified first.',
      symptoms: ['loud ticking from the VVT area immediately after a cold start', 'knock or rattle from the timing-cover or cylinder-head-cover area after warm-up below 2,000 rpm'],
      summary: 'Replaced an unsupported video, solenoid theory and DTC list with Mazda SSP87\'s exact L3T population, two noise conditions and inspection-led remedy.',
    },
  };
  if (!content[id]) throw new Error(`Unexpected Mazda CX-7 row ${id}`);
  return content[id];
}
function commerceDecisionFor(id) { return `No universal retail part; VIN, L3T engine, build date, exact noise or smoke condition and diagnosed cause must be verified before replacement (${id}).`; }
function proposalFor(before, id) {
  const content = contentFor(id);
  return {
    ...clone(before), description: content.description, solution: content.solution, confidence: content.confidence,
    symptoms: clone(content.symptoms), affectedSystems: [], dtcCodes: [],
    estimatedCostLow: null, estimatedCostHigh: null, typicalMileageLow: null, typicalMileageHigh: null,
    citations: citationsFor(id), communityRecommendations: [], fixParts: [], humanApproved: false,
    source: 'ai-researched', reviewedOn: REVIEW_DATE, contentUpdatedOn: REVIEW_DATE, contentUpdateSummary: content.summary,
  };
}
function publicPdfSources() { return Object.fromEntries(Object.entries(PDF_SOURCES).map(([key, source]) => { const value = clone(source); delete value.localPath; return [key, value]; })); }

function buildPacket(snapshot) {
  const frozenRows = snapshot.records.filter((row) => row.make === 'Mazda' && row.model === 'CX-7').sort((a, b) => a.id.localeCompare(b.id));
  if (frozenRows.length !== 2) throw new Error(`Expected 2 Mazda CX-7 rows, found ${frozenRows.length}`);
  const rows = frozenRows.map((row) => {
    const before = fullRecord(row); const proposal = proposalFor(before, row.id); const content = contentFor(row.id);
    return { id: row.id, action: 'retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source', reason: content.summary, evidence: { primaryEvidence: citationsFor(row.id).map((source) => source.title), limitations: 'SSP86 and SSP87 are historical, build/VIN-bounded warranty extensions; frozen 2011-2012 SEO years are retained but not represented as program scope.' }, commerceDecision: commerceDecisionFor(row.id), before, beforeSha256: hashValue(before), proposal, proposalSha256: hashValue(proposal), changedFields: diffFields(before, proposal) };
  });
  return {
    schemaVersion: 1, status: 'proposal-only', auditStage: 'model-primary-source-technical-adjudication', requiresIndependentApproval: true,
    generatedOn: REVIEW_DATE, make: 'Mazda', model: 'CX-7', completionStatement: 'Both frozen Mazda CX-7 pages are accounted for with indexed identities and vehicle scopes preserved.',
    applicationGate: { status: 'blocked', blockerRecordIds: BLOCKER_IDS, reason: 'Both rows contain material source, scope, diagnosis and remedy corrections and require independent review before any catalog write.' },
    safetyContract: [
      'No production write, deployment, archive, redirect, slug change, title change, category change, indexed-year change, trim change, engine change, severity change, report-count change, related-link change or new issue is authorized.',
      'Both pages remain published with their exact frozen identity, vehicle metadata, report count and canonical severity.',
      'SSP86 and SSP87 remain VIN-, engine-, build-date- and symptom-scoped; the frozen 2011-2012 years are not presented as program coverage.',
      'Unknown owner totals remain zero and are never rendered or written as "0+ owners" social proof.',
      'The frozen nonzero report count remains data only and is never inserted into audit prose.',
      'Every named replaceable part has an explicit no-universal-retail-part boundary.',
      'No search-style commerce link, buy link, fixParts record or community recommendation is introduced.',
    ],
    source: { snapshotFile: 'data/_mazda-deeplink-snapshot-2026-08-09.json', snapshotSha256: normalizedFileHash(SNAPSHOT), snapshotGeneratedAt: snapshot.generatedAt, snapshotHash: snapshot.snapshotHash, modelRecordCount: frozenRows.length },
    observations: [
      { code: 'cx7-two-programs-separated', severity: 'accuracy-correction', recordIds: [IDS.combined], detail: 'SSP87 VVT/timing-chain noise and SSP86 turbo-oil white smoke remain separate diagnosis and remedy paths.' },
      { code: 'cx7-frozen-years-outside-program-scope', severity: 'identity-hold', recordIds: BLOCKER_IDS, detail: 'Frozen 2007-2012 indexed years remain unchanged while prose states SSP86 2007-2009 and SSP87 2007-2010 exact scope.' },
      { code: 'cx7-vvt-solenoid-theory-removed', severity: 'accuracy-correction', recordIds: [IDS.vvt], detail: 'SSP87 identifies the VVT actuator/rotor and timing chain, not a generic VVT solenoid or the frozen DTC list.' },
      { code: 'all-cx7-pages-preserved', severity: 'seo-safety', recordIds: BLOCKER_IDS, detail: 'Neither Mazda CX-7 page is removed, merged, redirected or allowed to lose indexed identity or vehicle scope.' },
    ],
    pdfSources: publicPdfSources(), manufacturerCommunications: BULLETIN_INVENTORY, recallInventory: RECALL_INVENTORY,
    summary: { retain_indexed_identity_and_targeted_accuracy_cleanup_pending_source: 2, total: 2 }, rows,
  };
}

if (require.main === module) {
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')); const packet = buildPacket(snapshot);
  fs.writeFileSync(OUTPUT, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, rows: packet.rows.length, summary: packet.summary, applicationGate: packet.applicationGate }, null, 2));
}
module.exports = { BLOCKER_IDS, BULLETIN_INVENTORY, CAMPAIGNS, IDS, MODEL_ALIASES, OUTPUT, PDF_SOURCES, RECALL_INVENTORY, REQUIRED_COMMUNICATION_IDS, REVIEW_DATE, SNAPSHOT, buildPacket, citationsFor, commerceDecisionFor, contentFor, proposalFor };
