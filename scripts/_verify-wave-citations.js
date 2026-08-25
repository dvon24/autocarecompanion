#!/usr/bin/env node
/**
 * WAVE CITATION GATE. ZERO AI. Run on a wave output BEFORE persist.
 *
 * Mirrors the semantics of the production promote gate, which differ from the BUY-LINK gate:
 *   - 200                -> LIVE
 *   - 401 / 403          -> LIVE. Owner forums bot-block scripted fetches; a citation only has to
 *                           EXIST, unlike a buy link which must actually sell the part.
 *                           (Known blind spot: this cannot tell a real thread from a fabricated
 *                           URL on a real host. Counted separately and reported.)
 *   - 404 / 410          -> DEAD, prune
 *   - 5xx / timeout / DNS-> UNREACHABLE, reported but not pruned (transient)
 *
 * An issue left with ZERO live citations must be dropped or re-sourced before publish.
 *
 * Usage:
 *   node scripts/_verify-wave-citations.js <wave.json> [--concurrency 20] [--prune-dead]
 * --prune-dead writes <wave>-citychecked.json with 404/410 URLs removed.
 */
const fs = require('fs');
const args = process.argv.slice(2);
const file = args[0];
if (!file) { console.error('usage: node scripts/_verify-wave-citations.js <wave.json> [--concurrency N] [--prune-dead]'); process.exit(1); }
const ci = args.indexOf('--concurrency');
const CONC = ci >= 0 ? Number(args[ci + 1]) : 20;
const PRUNE = args.includes('--prune-dead');

const UA = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36', 'Accept': 'text/html,*/*;q=0.8', 'Accept-Language': 'en-US,en;q=0.9' };

async function check(url) {
  try {
    const r = await fetch(url, { headers: UA, redirect: 'follow', signal: AbortSignal.timeout(20000) });
    if (r.status === 404 || r.status === 410) return { state: 'DEAD', status: r.status };
    if (r.status === 401 || r.status === 403) return { state: 'UNVERIFIABLE', status: r.status };
    if (r.status >= 500) return { state: 'UNREACHABLE', status: r.status };
    return { state: 'LIVE', status: r.status };
  } catch (e) {
    return { state: 'UNREACHABLE', status: e.name === 'TimeoutError' ? 'TIMEOUT' : String(e.message).slice(0, 30) };
  }
}

(async () => {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const list = data?.result?.confirmed || data?.confirmed || [];
  const urls = new Map(); // url -> result (dedupe across issues)
  const all = [];
  list.forEach((iss, i) => (iss.citations || []).forEach((c) => { if (c && c.url) all.push({ i, url: c.url }); }));
  const uniq = [...new Set(all.map((x) => x.url))];
  console.log(`issues ${list.length} | citations ${all.length} | unique URLs ${uniq.length}\n`);

  let done = 0;
  for (let i = 0; i < uniq.length; i += CONC) {
    const batch = uniq.slice(i, i + CONC);
    const res = await Promise.all(batch.map((u) => check(u)));
    batch.forEach((u, k) => urls.set(u, res[k]));
    done += batch.length;
    process.stdout.write(`\r  checked ${done}/${uniq.length}   `);
  }
  process.stdout.write('\n\n');

  // Concurrency causes timeouts that masquerade as UNREACHABLE, which then reads as "this issue
  // has no usable citation" and would drop a perfectly good issue. Measured: myjeepcompass.com,
  // forteforums.com and vwvortex.com all TIMEOUT at concurrency 20 and all return 200 serially.
  // Retry every UNREACHABLE once, serially, before believing it.
  const retry = [...urls.entries()].filter(([, v]) => v.state === 'UNREACHABLE').map(([u]) => u);
  if (retry.length) {
    console.log('retrying ' + retry.length + ' UNREACHABLE serially...');
    let recovered = 0;
    for (const u of retry) {
      const r = await check(u);
      if (r.state !== 'UNREACHABLE') { urls.set(u, r); recovered++; }
    }
    console.log('  recovered ' + recovered + ' of ' + retry.length);
  }

  const tally = { LIVE: 0, UNVERIFIABLE: 0, DEAD: 0, UNREACHABLE: 0 };
  urls.forEach((v) => tally[v.state]++);
  console.log(`unique URL states: LIVE ${tally.LIVE} | UNVERIFIABLE(403) ${tally.UNVERIFIABLE} | DEAD ${tally.DEAD} | UNREACHABLE ${tally.UNREACHABLE}`);

  const dead = [...urls.entries()].filter(([, v]) => v.state === 'DEAD');
  if (dead.length) { console.log('\nDEAD urls:'); dead.forEach(([u, v]) => console.log(`  [${v.status}] ${u.slice(0, 110)}`)); }
  const unreach = [...urls.entries()].filter(([, v]) => v.state === 'UNREACHABLE');
  if (unreach.length) { console.log('\nUNREACHABLE (transient — recheck, do not prune):'); unreach.slice(0, 15).forEach(([u, v]) => console.log(`  [${v.status}] ${u.slice(0, 100)}`)); }

  // Per-issue: anything with no LIVE/UNVERIFIABLE citation left is unpublishable.
  const broken = [];
  list.forEach((iss) => {
    const st = (iss.citations || []).map((c) => (urls.get(c.url) || {}).state);
    const usable = st.filter((s) => s === 'LIVE' || s === 'UNVERIFIABLE').length;
    const deadN = st.filter((s) => s === 'DEAD').length;
    if (usable === 0) broken.push({ iss, why: 'NO usable citation' });
    else if (deadN) broken.push({ iss, why: `${deadN} dead citation(s), ${usable} usable remain` });
  });
  console.log(`\nissues needing attention: ${broken.length} of ${list.length}`);
  broken.forEach((b) => console.log(`  ${b.why.startsWith('NO') ? 'DROP/RESOURCE' : 'prune     '}  ${b.iss.make} ${b.iss.model} — ${b.iss.title.slice(0, 60)}  (${b.why})`));

  if (PRUNE) {
    let removed = 0;
    list.forEach((iss) => {
      const before = (iss.citations || []).length;
      iss.citations = (iss.citations || []).filter((c) => (urls.get(c.url) || {}).state !== 'DEAD');
      removed += before - iss.citations.length;
    });
    const out = file.replace(/\.json$/, '-citychecked.json');
    fs.writeFileSync(out, JSON.stringify(data, null, 2));
    console.log(`\npruned ${removed} dead citations -> ${out}`);
  } else {
    console.log('\n(add --prune-dead to write a cleaned copy)');
  }
})();
