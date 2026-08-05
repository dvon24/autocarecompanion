/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');

const { isGenericOrSearchCitation } = require('./build-toyota-hold-adjudication');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const PACKET = path.join(PROJECT_ROOT, 'data', 'known-issue-toyota-hold-adjudication-2026-08-05.json');
const USER_AGENT = 'au7o-toyota-source-link-verifier/1.0';

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

function redirectedToHomepage(requested, finalUrl) {
  try {
    const input = new URL(requested);
    const output = new URL(finalUrl);
    const outputPath = output.pathname.replace(/\/+$/, '');
    return input.hostname === output.hostname
      && input.pathname.replace(/\/+$/, '') !== ''
      && outputPath === '';
  } catch {
    return true;
  }
}

async function verifyComplaintQuery(url, refs) {
  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
    signal: AbortSignal.timeout(45_000),
  });
  const body = await response.json();
  const actualOdis = new Set((body.results || []).map((row) => Number(row.odiNumber)));
  const expectedOdis = refs.flatMap((ref) => [...ref.title.matchAll(/ODI\s+(\d+)/gi)].map((match) => Number(match[1])));
  const missingOdis = expectedOdis.filter((odi) => !actualOdis.has(odi));
  return {
    kind: 'nhtsa-complaint-query',
    url,
    status: response.status,
    expectedOdis,
    missingOdis,
    resultCount: body.results?.length || 0,
    accessBlocked: false,
    passed: response.ok && expectedOdis.length > 0 && missingOdis.length === 0,
  };
}

async function verifyPdf(url) {
  const response = await fetch(url, {
    headers: { Range: 'bytes=0-4', 'User-Agent': USER_AGENT },
    redirect: 'follow',
    signal: AbortSignal.timeout(45_000),
  });
  const bytes = Buffer.from(await response.arrayBuffer());
  const magic = bytes.subarray(0, 5).toString('ascii');
  return {
    kind: 'nhtsa-pdf',
    url,
    finalUrl: response.url,
    status: response.status,
    contentType: response.headers.get('content-type') || '',
    pdfMagic: magic,
    accessBlocked: false,
    passed: response.ok
      && response.url.startsWith('https://static.nhtsa.gov/')
      && (magic === '%PDF-' || (response.headers.get('content-type') || '').toLowerCase().includes('pdf')),
  };
}

async function verifyWebPage(url) {
  try {
    const response = await fetch(url, {
      headers: { Range: 'bytes=0-128', 'User-Agent': USER_AGENT },
      redirect: 'follow',
      signal: AbortSignal.timeout(30_000),
    });
    const accessBlocked = [401, 403, 429].includes(response.status);
    return {
      kind: 'web-page',
      url,
      finalUrl: response.url,
      status: response.status,
      contentType: response.headers.get('content-type') || '',
      accessBlocked,
      passed: (response.ok || accessBlocked) && !redirectedToHomepage(url, response.url),
    };
  } catch (error) {
    return {
      kind: 'web-page',
      url,
      status: null,
      accessBlocked: false,
      error: error instanceof Error ? error.message : String(error),
      passed: false,
    };
  }
}

async function verifyEntry(entry) {
  const url = entry.url;
  if (url.startsWith('https://api.nhtsa.gov/complaints/complaintsByVehicle')) {
    return verifyComplaintQuery(url, entry.refs);
  }
  if (url.startsWith('https://static.nhtsa.gov/') && /\.pdf(?:$|\?)/i.test(url)) return verifyPdf(url);
  return verifyWebPage(url);
}

async function main() {
  const packet = JSON.parse(fs.readFileSync(PACKET, 'utf8'));
  const visibleRows = packet.rows.filter((row) => ['keep_audited_correction', 'rewrite_and_republish'].includes(row.action));
  const byUrl = new Map();
  for (const row of visibleRows) {
    for (const citation of row.proposal.citations) {
      if (!byUrl.has(citation.url)) byUrl.set(citation.url, []);
      byUrl.get(citation.url).push({ id: row.id, title: citation.title, type: citation.type });
    }
  }
  const entries = [...byUrl.entries()].map(([url, refs]) => ({ url, refs }));
  const scopeErrors = entries
    .filter((entry) => isGenericOrSearchCitation(entry.url))
    .map((entry) => `${entry.refs.map((ref) => ref.id).join(',')}: generic/search citation ${entry.url}`);
  const results = await mapLimit(entries, 5, verifyEntry);
  const failures = results.filter((result) => !result.passed);
  const accessBlocked = results.filter((result) => result.accessBlocked);
  const output = {
    passed: scopeErrors.length === 0 && failures.length === 0,
    visibleRowsChecked: visibleRows.length,
    uniqueLinksChecked: results.length,
    nhtsaPdfCount: results.filter((result) => result.kind === 'nhtsa-pdf').length,
    nhtsaComplaintQueryCount: results.filter((result) => result.kind === 'nhtsa-complaint-query').length,
    accessBlockedCount: accessBlocked.length,
    scopeErrors,
    failures,
    accessBlocked,
    results,
  };
  const printable = process.argv.includes('--verbose') ? output : {
    passed: output.passed,
    visibleRowsChecked: output.visibleRowsChecked,
    uniqueLinksChecked: output.uniqueLinksChecked,
    nhtsaPdfCount: output.nhtsaPdfCount,
    nhtsaComplaintQueryCount: output.nhtsaComplaintQueryCount,
    accessBlockedCount: output.accessBlockedCount,
    scopeErrors: output.scopeErrors,
    failures: output.failures,
  };
  console.log(JSON.stringify(printable, null, 2));
  if (!output.passed) process.exitCode = 1;
}

if (require.main === module) main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

module.exports = {
  redirectedToHomepage,
  verifyComplaintQuery,
  verifyPdf,
  verifyWebPage,
};
