/* eslint-disable @typescript-eslint/no-require-imports */
const { EXPECTED_RDW_ACTIONS, EXPECTED_RDW_REFERENCES, EXPECTED_RECALLS, RECALL_QUERIES, SOURCES } = require('./build-jeep-avenger-adjudication');
function normalized(value) { return String(value || '').toLowerCase().normalize('NFKD').replace(/[^a-z0-9&]+/g, ' ').replace(/\s+/g, ' ').trim(); }
async function getJson(url) { const response = await fetch(url, { redirect: 'follow', headers: { 'user-agent': 'Mozilla/5.0 (compatible; au7o-source-audit/1.0)' }, signal: AbortSignal.timeout(60000) }); const body = response.status === 200 ? await response.json() : null; return { response, body }; }
async function verifyRdwReferences() {
  const { response, body } = await getJson(SOURCES.rdwModelRefs);
  const references = Array.isArray(body) ? body.map((row) => row.referentiecode_rdw).filter(Boolean).sort() : [];
  return { url: SOURCES.rdwModelRefs, status: response.status, references, expected: [...EXPECTED_RDW_REFERENCES].sort(), passed: response.status === 200 && JSON.stringify(references) === JSON.stringify([...EXPECTED_RDW_REFERENCES].sort()) };
}
async function verifyRdwActions() {
  const { response, body } = await getJson(SOURCES.rdwActions);
  const rows = Array.isArray(body) ? body : [];
  const checks = Object.entries(EXPECTED_RDW_ACTIONS).map(([reference, expected]) => {
    const row = rows.find((item) => item.referentiecode_rdw === reference);
    const fields = row ? { defect: row.omschrijving_defect, consequence: row.materi_le_gevolgen, remedy: row.beschrijving_van_het_herstel } : {};
    const markerChecks = [
      ...expected.defectMarkers.map((marker) => ({ field: 'defect', marker, present: normalized(fields.defect).includes(normalized(marker)) })),
      ...expected.consequenceMarkers.map((marker) => ({ field: 'consequence', marker, present: normalized(fields.consequence).includes(normalized(marker)) })),
      ...expected.remedyMarkers.map((marker) => ({ field: 'remedy', marker, present: normalized(fields.remedy).includes(normalized(marker)) })),
    ];
    return { reference, producerReference: row?.referentiecode_producent || null, expectedProducerReference: expected.producerReference, markerChecks, passed: Boolean(row) && row.referentiecode_producent === expected.producerReference && markerChecks.every((item) => item.present) };
  });
  return { url: SOURCES.rdwActions, status: response.status, resultCount: rows.length, checks, passed: response.status === 200 && rows.length === EXPECTED_RDW_REFERENCES.length && checks.every((item) => item.passed) };
}
async function verifyRecall(year, url) {
  const response = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(30000) });
  let campaigns = [];
  if (response.status === 200) { const body = await response.json(); campaigns = (body.results || []).map((row) => row.NHTSACampaignNumber).filter(Boolean).sort(); } else await response.arrayBuffer();
  const expected = EXPECTED_RECALLS[year];
  return { year: Number(year), url, status: response.status, campaigns, expected, passed: response.status === expected.status && JSON.stringify(campaigns) === JSON.stringify(expected.campaigns) };
}
async function main() {
  const rdwReferences = await verifyRdwReferences();
  const rdwActions = await verifyRdwActions();
  const recalls = [];
  for (const [year, url] of Object.entries(RECALL_QUERIES)) recalls.push(await verifyRecall(year, url));
  const passed = rdwReferences.passed && rdwActions.passed && recalls.every((row) => row.passed);
  console.log(JSON.stringify({ passed, checkedOn: '2026-08-06', rdwReferences, rdwActions, recalls }, null, 2));
  if (!passed) process.exitCode = 1;
}
if (require.main === module) main().catch((error) => { console.error(error); process.exitCode = 1; });
