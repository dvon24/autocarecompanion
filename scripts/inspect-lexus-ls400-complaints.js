const API = 'https://api.nhtsa.gov/complaints/complaintsByVehicle';
const YEARS = Object.freeze(Array.from({ length: 11 }, (_, index) => 1990 + index));
const PATTERNS = Object.freeze({
  ballJoint: /\bball joint\b|\blower control arm\b/i,
  ecuCapacitor: /(?:\b(?:ECU|ECM)\b|engine control module)[^.!?]{0,100}capacitor|capacitor[^.!?]{0,100}(?:\b(?:ECU|ECM)\b|engine control module)/i,
  oilLeak: /engine oil (?:leak|seep)|(?:leak|seep)(?:ing|s)? engine oil|valve cover|cam(?:shaft)? seal|crank(?:shaft)? seal/i,
  powerSteering: /power steering[^.!?]{0,120}leak|leak[^.!?]{0,120}power steering|steering pump[^.!?]{0,120}leak|leak[^.!?]{0,120}steering pump/i,
  starter: /\bstarter\b/i,
  timingService: /timing belt|water pump/i,
});
const NEGATED_PATTERNS = Object.freeze({
  ecuCapacitor: /\b(?:no|without)\b[^.!?]{0,30}capacitor/i,
});

function complaintUrl(year) {
  const query = new URLSearchParams({ make: 'LEXUS', model: 'LS400', modelYear: String(year) });
  return `${API}?${query}`;
}

async function fetchYear(year, fetchImpl = fetch) {
  const response = await fetchImpl(complaintUrl(year), { headers: { accept: 'application/json', 'user-agent': 'au7o-known-issue-source-audit/1.0' } });
  if (!response.ok) throw new Error(`${year}: NHTSA complaints API returned ${response.status}`);
  const body = await response.json();
  if (!Array.isArray(body.results) || body.count !== body.results.length) throw new Error(`${year}: malformed NHTSA complaints response`);
  return body.results.map((complaint) => ({
    year,
    odiNumber: complaint.odiNumber,
    components: complaint.components || '',
    summary: complaint.summary || '',
  }));
}

async function inspect({ fetchImpl = fetch, includeSummaries = false } = {}) {
  const byYear = await Promise.all(YEARS.map((year) => fetchYear(year, fetchImpl)));
  const complaints = byYear.flat();
  const matches = Object.fromEntries(Object.entries(PATTERNS).map(([identity, pattern]) => [
    identity,
    complaints
      .filter((complaint) => {
        const text = `${complaint.components} ${complaint.summary}`;
        return pattern.test(text) && !NEGATED_PATTERNS[identity]?.test(text);
      })
      .map(({ year, odiNumber, components, summary }) => ({ year, odiNumber, components, ...(includeSummaries ? { summary } : {}) }))
      .sort((left, right) => left.year - right.year || left.odiNumber - right.odiNumber),
  ]));
  return {
    source: 'https://www.nhtsa.gov/nhtsa-datasets-and-apis#complaints',
    api: API,
    make: 'LEXUS',
    model: 'LS400',
    years: YEARS,
    caveat: 'NHTSA complaint records are owner allegations. They can confirm that a condition was reported, but do not prove a defect, cause, prevalence or fitment.',
    yearCounts: Object.fromEntries(YEARS.map((year, index) => [year, byYear[index].length])),
    total: complaints.length,
    matches,
  };
}

if (require.main === module) {
  inspect({ includeSummaries: process.argv.includes('--include-summaries') }).then((result) => console.log(JSON.stringify(result, null, 2))).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

module.exports = { API, NEGATED_PATTERNS, PATTERNS, YEARS, complaintUrl, fetchYear, inspect };
