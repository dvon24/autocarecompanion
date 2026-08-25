#!/usr/bin/env node
/**
 * EVIDENCE FLOOR — how much of a wave rests on sources nobody could actually read?
 *
 * The promote gate counts a 403 as "live", which is right for its purpose: owner forums bot-block
 * scripted fetches, and a citation only has to EXIST. But 403 means the fetch was refused, so the
 * content was never seen. A real thread and a plausibly-shaped fabricated URL on the same real host
 * return the identical status. That is the documented blind spot, and this measures it.
 *
 * For each issue it sorts citations into:
 *   READ      - 2xx/3xx. The page was actually retrieved.
 *   REFUSED   - 401/403. The host exists and answered, but refused to serve the content.
 *   UNREACHED - timeout/DNS/5xx. Transient; says nothing either way.
 *   DEAD      - 404/410.
 *
 * The number that matters is issues with ZERO read citations: those are supported entirely by
 * evidence no gate in this pipeline has ever opened. That is not proof of invention - most will be
 * genuine forum threads - but it is the exact population where invention could hide undetected, so
 * it should be a known, small, named list rather than an unknown share of the wave.
 *
 * Read-only. No writes, no AI.
 *
 *   node scripts/_audit-wave-evidence-floor.js data/research-wave7-2026-08-25-citychecked-corrected.json
 */
const FILE = process.argv.find((a) => a.endsWith('.json'));
if (!FILE) { console.error('usage: node scripts/_audit-wave-evidence-floor.js <wave.json>'); process.exit(1); }

const payload = JSON.parse(require('fs').readFileSync(FILE, 'utf8'));
const confirmed = payload?.result?.confirmed || payload?.confirmed || [];
const UA = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36', Accept: 'text/html,*/*;q=0.8' };

async function state(url) {
  const go = async (method) => {
    try {
      const r = await fetch(url, { method, redirect: 'follow', signal: AbortSignal.timeout(15000), headers: UA });
      if (r.status >= 200 && r.status < 400) return 'READ';
      if (r.status === 401 || r.status === 403) return 'REFUSED';
      if (r.status === 404 || r.status === 410) return 'DEAD';
      return 'UNREACHED';
    } catch { return null; }
  };
  return (await go('HEAD')) || (await go('GET')) || 'UNREACHED';
}

(async () => {
  const urls = [...new Set(confirmed.flatMap((c) => (c.citations || []).map((x) => x.url)))];
  console.log(`${confirmed.length} issues | ${urls.length} unique URLs\n`);
  const st = new Map();
  for (let i = 0; i < urls.length; i += 16) {
    const chunk = urls.slice(i, i + 16);
    const res = await Promise.all(chunk.map(state));
    chunk.forEach((u, n) => st.set(u, res[n]));
    process.stdout.write(`\r  checked ${Math.min(i + 16, urls.length)}/${urls.length}   `);
  }
  console.log('\n');

  const tally = {};
  [...st.values()].forEach((s) => { tally[s] = (tally[s] || 0) + 1; });
  console.log('URL states:', JSON.stringify(tally), '\n');

  const byHost = {};
  for (const [u, s] of st) {
    if (s !== 'REFUSED') continue;
    let h = 'unknown';
    try { h = new URL(u).hostname.replace(/^www\./, ''); } catch {}
    byHost[h] = (byHost[h] || 0) + 1;
  }
  console.log('REFUSED (403) by host — the unreadable surface:');
  Object.entries(byHost).sort((a, b) => b[1] - a[1]).forEach(([h, n]) => console.log(`  ${String(n).padStart(3)}  ${h}`));

  const noRead = [];
  for (const c of confirmed) {
    const states = (c.citations || []).map((x) => st.get(x.url));
    if (!states.some((s) => s === 'READ')) noRead.push({ c, states });
  }
  console.log(`\nIssues with ZERO readable citations: ${noRead.length} of ${confirmed.length} (${Math.round(100 * noRead.length / confirmed.length)}%)`);
  noRead.forEach(({ c, states }) => {
    console.log(`  ${c.make} ${c.model} — ${c.title.slice(0, 68)}`);
    console.log(`      ${states.join(', ')}`);
    (c.citations || []).forEach((x) => console.log(`      ${st.get(x.url)}  ${x.url.slice(0, 96)}`));
  });
})();
