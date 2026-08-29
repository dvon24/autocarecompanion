// Shared, polite NHTSA client: global rate limit + exponential backoff + a disk
// cache. NHTSA throttles hard, and a throttled response looks exactly like a
// vehicle with no recalls — so this NEVER converts a failure into an empty
// result. Callers get null on failure and must treat it as unknown, not clean.
const fs = require('fs');
const path = require('path');

const CACHE_DIR = path.join(process.cwd(), 'data', '_nhtsa-cache');
fs.mkdirSync(CACHE_DIR, { recursive: true });

const MIN_INTERVAL_MS = 700; // ~1.4 req/s — 4 req/s got us throttled into 78 false unknowns
let lastAt = 0;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function cachePath(url) {
  const key = url.replace(/^https?:\/\//, '').replace(/[^a-zA-Z0-9]+/g, '_').slice(0, 180);
  return path.join(CACHE_DIR, key + '.json');
}

async function nhtsa(url, { retries = 5 } = {}) {
  const cp = cachePath(url);
  if (fs.existsSync(cp)) {
    try { return JSON.parse(fs.readFileSync(cp, 'utf8')); } catch {}
  }
  for (let a = 0; a <= retries; a++) {
    const wait = lastAt + MIN_INTERVAL_MS - Date.now();
    if (wait > 0) await sleep(wait);
    lastAt = Date.now();
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(25000),
        headers: { 'User-Agent': 'au7o.io recall coverage audit (contact: support@au7o.io)' },
      });
      if (res.status === 429 || res.status >= 500) {
        await sleep(1500 * Math.pow(2, a));
        continue;
      }
      // NHTSA answers "no recalls for this make/model/year" with HTTP 400 and a
      // body that says {"Count":0,"Message":"Results returned successfully"}.
      // That is a real answer, not an error — reading the status alone marked 35
      // vehicles "unknown" that genuinely have zero recalls. Trust the body when
      // it parses and reports success; every other non-ok status is still a
      // failure, so a throttle can never become a false zero.
      const body = await res.text();
      let data = null;
      try { data = JSON.parse(body); } catch {}
      const answered = data && typeof data === 'object' &&
        /results returned successfully/i.test(String(data.Message ?? data.message ?? ''));
      if (!res.ok && !answered) return null;
      if (!data) return null;
      fs.writeFileSync(cp, JSON.stringify(data));
      return data;
    } catch {
      await sleep(1200 * Math.pow(2, a));
    }
  }
  return null; // unknown — NOT "no recalls"
}

module.exports = { nhtsa };
