#!/usr/bin/env node
/**
 * BUY-LINK GATE. ZERO AI. Runs on the resolver's output BEFORE any DB write.
 *
 * Devon's pillar #2 is no-404 deep links. An agent said it fetched these pages; this checks
 * independently and deterministically. It is the last line of defence before a reader clicks a
 * dead link on a page that is asking them to spend money.
 *
 * Rules, tuned to what these hosts actually do:
 *  - 404 / 410 / unreachable        -> DEAD, drop the link
 *  - 403 / 401                      -> UNVERIFIABLE. Retailers bot-block. NOT treated as live here
 *                                      (unlike the citation gate) because a citation only has to
 *                                      exist, whereas a buy link has to actually sell the part.
 *  - 200 but soft-404 / no-results  -> DEAD, drop the link
 *  - 200 with the part number on it -> LIVE, keep
 *
 * A part with no surviving link is dropped. An issue with no surviving part is dropped.
 * Better empty than wrong.
 *
 * Usage: node scripts/_verify-buylinks.js <resolver-output.json> [--out <file>] [--dry-run]
 */
const fs = require('fs');
const args = process.argv.slice(2);
const file = args[0];
const dry = args.includes('--dry-run');
const outIdx = args.indexOf('--out');
const OUT = outIdx >= 0 ? args[outIdx + 1] : (file || '').replace(/\.json$/, '-linkchecked.json');
if (!file) { console.error('usage: node scripts/_verify-buylinks.js <resolver-output.json> [--out f] [--dry-run]'); process.exit(1); }

const UA = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36', 'Accept': 'text/html,application/xhtml+xml,*/*;q=0.8', 'Accept-Language': 'en-US,en;q=0.9' };
const SOFT404 = /(page not found|no results|we couldn'?t find|not currently available|no products (were )?found|0 results|sorry, we could ?n'?t)/i;

async function checkUrl(url, partNumber) {
  try {
    const r = await fetch(url, { headers: UA, redirect: 'follow', signal: AbortSignal.timeout(25000) });
    if (r.status === 404 || r.status === 410) return { ok: false, status: r.status, why: 'dead' };
    if (r.status === 401 || r.status === 403) return { ok: false, status: r.status, why: 'bot-blocked — cannot confirm the part is actually sold here' };
    if (r.status >= 500) return { ok: false, status: r.status, why: 'server error — unverifiable' };
    // Cross-host redirect (e.g. amazon.com -> amazon.de by IP geolocation) lands on a DIFFERENT
    // storefront, often a different ASIN entirely. The page that comes back says nothing about
    // whether the link a US reader clicks is live, so neither a 200 nor a soft-404 match on it
    // can be trusted. Classify as unverifiable rather than scoring the wrong page.
    try {
      const from = new URL(url).host.replace(/^www\./, '');
      const to = new URL(r.url).host.replace(/^www\./, '');
      if (from !== to) return { ok: false, status: r.status, why: `redirected off-host to ${to} — cannot verify from this location` };
    } catch {}
    const text = (await r.text());
    const lower = text.toLowerCase();
    if (SOFT404.test(lower)) return { ok: false, status: r.status, why: 'soft-404 / no results' };
    const pnHit = partNumber ? lower.includes(String(partNumber).toLowerCase().replace(/\s/g, '')) || lower.includes(String(partNumber).toLowerCase()) : null;
    return { ok: true, status: r.status, pnOnPage: pnHit, why: pnHit === false ? 'live, but part number not visible on page' : 'live' };
  } catch (e) {
    return { ok: false, status: 'ERR', why: e.name === 'TimeoutError' ? 'timeout' : String(e.message).slice(0, 40) };
  }
}

(async () => {
  const payload = JSON.parse(fs.readFileSync(file, 'utf8'));
  const issues = payload?.result?.resolvedIssues || [];
  let linksChecked = 0, linksKept = 0, partsDropped = 0, issuesDropped = 0, pnMissing = 0;
  const report = [];

  const keptIssues = [];
  for (const issue of issues) {
    const keptParts = [];
    for (const part of issue.fixParts || []) {
      const keptLinks = [];
      for (const link of part.buyLinks || []) {
        linksChecked++;
        const res = await checkUrl(link.url, part.oemPartNumber);
        report.push({ issue: `${issue.make} ${issue.model}`, component: part.component, vendor: link.vendor, url: link.url, ...res });
        process.stdout.write(`\r  checked ${linksChecked} links, kept ${linksKept}   `);
        if (res.ok) { linksKept++; if (res.pnOnPage === false) pnMissing++; keptLinks.push({ ...link, verified: true }); }
      }
      if (keptLinks.length) keptParts.push({ ...part, buyLinks: keptLinks });
      else partsDropped++;
    }
    if (keptParts.length) keptIssues.push({ ...issue, fixParts: keptParts });
    else issuesDropped++;
  }
  process.stdout.write('\n\n');

  console.log(`links checked : ${linksChecked}`);
  console.log(`links kept    : ${linksKept}  (dropped ${linksChecked - linksKept})`);
  console.log(`  of the kept, ${pnMissing} loaded but did not show the part number on the page`);
  console.log(`parts dropped (no surviving link) : ${partsDropped}`);
  console.log(`issues dropped (no surviving part): ${issuesDropped}`);
  console.log(`ISSUES READY TO WRITE             : ${keptIssues.length}`);

  const byWhy = {};
  report.filter((r) => !r.ok).forEach((r) => { byWhy[r.why] = (byWhy[r.why] || 0) + 1; });
  if (Object.keys(byWhy).length) {
    console.log('\nrejections by reason:');
    Object.entries(byWhy).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`   ${String(v).padStart(3)}  ${k}`));
    console.log('\nsample rejected links:');
    report.filter((r) => !r.ok).slice(0, 10).forEach((r) => console.log(`   [${r.status}] ${r.vendor} — ${r.issue} — ${r.url.slice(0, 90)}`));
  }

  if (!dry) {
    fs.writeFileSync(OUT, JSON.stringify({ result: { resolvedIssues: keptIssues, stats: { linksChecked, linksKept, partsDropped, issuesDropped, issuesReady: keptIssues.length } } }, null, 2));
    fs.writeFileSync(OUT.replace(/\.json$/, '-linkreport.json'), JSON.stringify(report, null, 2));
    console.log(`\nwrote ${OUT}`);
  } else {
    console.log('\n(dry-run — nothing written)');
  }
})();
