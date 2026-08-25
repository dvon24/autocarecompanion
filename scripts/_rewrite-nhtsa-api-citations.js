#!/usr/bin/env node
/**
 * Rewrite raw api.nhtsa.gov JSON-endpoint citations into human-readable nhtsa.gov pages.
 *
 * WHY: research agents cited API endpoints (api.nhtsa.gov/recalls/recallsByVehicle?...). Those
 * resolve and hold real data, but a reader clicking the source link gets raw JSON. 25 such
 * citations in the wave-1 file and 99 in wave-2.
 *
 * WHY WE DON'T JUST FETCH-CHECK THE NEW URL: nhtsa.gov is a client-rendered SPA. A fake vehicle
 * and a fake campaign both return HTTP 200 with near-identical page length, so status checking
 * proves nothing. Instead we make the target correct BY CONSTRUCTION: fetch the original API
 * URL (which returns real data) and build the human URL out of the API's own canonical
 * Make/Model/ModelYear and NHTSACampaignNumber values. If the API returns nothing, we leave the
 * citation untouched and report it rather than guessing.
 *
 * Prefers a campaign-specific deep link when the issue names a recall that the API confirms:
 *   https://www.nhtsa.gov/recalls?nhtsaId=21V421000
 * Otherwise the vehicle page:
 *   https://www.nhtsa.gov/vehicle/2021/BUICK/ENVISION
 *
 * ZERO AI calls. Writes a .bak beside each file before modifying it.
 *
 * Usage: node scripts/_rewrite-nhtsa-api-citations.js <file.json> [more.json ...] [--dry-run]
 */
const fs = require('fs');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const files = args.filter((a) => !a.startsWith('--'));
if (!files.length) {
  console.error('Usage: node scripts/_rewrite-nhtsa-api-citations.js <file.json> [...] [--dry-run]');
  process.exit(1);
}

const UA = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36' };
const CAMPAIGN_RE = /\b\d{2}[VETRC]\d{6}\b/gi;

// nhtsa.gov vehicle pages double-encode the space: "CLA CLASS" -> "CLA%2520CLASS"
function vehicleUrl(year, make, model) {
  const enc = (s) => String(s).trim().toUpperCase().replace(/ /g, '%2520');
  return `https://www.nhtsa.gov/vehicle/${year}/${enc(make)}/${enc(model)}`;
}
function campaignUrl(id) {
  return `https://www.nhtsa.gov/recalls?nhtsaId=${String(id).toUpperCase()}`;
}
// Display names come from the issue record, which is already correctly cased ("XC40", "CLA",
// "Grand Cherokee L"). Title-casing NHTSA's all-caps values would yield "Xc40" / "Cla Class".
function displayName(issue) {
  return `${issue.make} ${issue.model}`.replace(/\s+/g, ' ').trim();
}

const cache = new Map();
async function fetchApi(url) {
  if (cache.has(url)) return cache.get(url);
  let out = null;
  try {
    const r = await fetch(url.replace(/&amp;/g, '&'), { headers: UA, signal: AbortSignal.timeout(25000) });
    if (r.ok) out = await r.json();
  } catch { out = null; }
  cache.set(url, out);
  return out;
}

async function resolveCitation(url, issue) {
  const api = await fetchApi(url);
  if (!api) return { ok: false, why: 'API request failed' };
  const results = api.results || [];
  const count = api.Count ?? api.count ?? results.length;
  if (!count || !results.length) return { ok: false, why: 'API returned no rows' };

  // Form 3: recalls/campaignNumber?campaignNumber=21V421000 — already campaign-scoped, so the
  // human equivalent is a direct deep link. Confirm the API actually returned that campaign.
  if (/campaignNumber/i.test(url)) {
    let id = null;
    try { id = new URL(url.replace(/&amp;/g, '&')).searchParams.get('campaignNumber'); } catch { /* ignore */ }
    if (!id) return { ok: false, why: 'campaignNumber param unreadable' };
    const row = results.find((r) => String(r.NHTSACampaignNumber || '').toUpperCase() === id.toUpperCase()) || results[0];
    const conf = String(row?.NHTSACampaignNumber || id).toUpperCase();
    return {
      ok: true, kind: 'campaign', url: campaignUrl(conf), type: 'recall',
      title: `NHTSA Recall ${conf} — ${row?.ModelYear || ''} ${displayName(issue)}`.replace(/\s+/g, ' ').trim(),
    };
  }

  const isRecall = /recallsByVehicle/i.test(url);

  if (isRecall) {
    const campaigns = new Set(results.map((r) => String(r.NHTSACampaignNumber || '').toUpperCase()).filter(Boolean));
    // Does the issue itself name a campaign that this API response confirms?
    const named = `${issue.title || ''} ${issue.description || ''} ${issue.solution || ''}`.match(CAMPAIGN_RE) || [];
    const hit = named.map((c) => c.toUpperCase()).find((c) => campaigns.has(c));
    if (hit) {
      const row = results.find((r) => String(r.NHTSACampaignNumber || '').toUpperCase() === hit) || {};
      return {
        ok: true, kind: 'campaign', url: campaignUrl(hit), type: 'recall',
        title: `NHTSA Recall ${hit} — ${row.ModelYear || ''} ${displayName(issue)}`.replace(/\s+/g, ' ').trim(),
      };
    }
    const r0 = results[0];
    if (r0 && r0.Make && r0.Model && r0.ModelYear) {
      return {
        ok: true, kind: 'vehicle', url: vehicleUrl(r0.ModelYear, r0.Make, r0.Model), type: 'nhtsa',
        title: `NHTSA recalls — ${r0.ModelYear} ${displayName(issue)}`,
      };
    }
    return { ok: false, why: 'recall rows lacked canonical Make/Model/ModelYear' };
  }

  // complaintsByVehicle — canonical values live under results[].products[]
  const prod = results.map((r) => (r.products || [])[0]).find((p) => p && p.productMake && p.productModel && p.productYear);
  if (prod) {
    return {
      ok: true, kind: 'vehicle', url: vehicleUrl(prod.productYear, prod.productMake, prod.productModel), type: 'nhtsa',
      title: `NHTSA owner complaints — ${prod.productYear} ${displayName(issue)}`,
    };
  }
  // fall back to the query params the API just answered successfully
  try {
    const q = new URL(url.replace(/&amp;/g, '&')).searchParams;
    const make = q.get('make'), model = q.get('model'), year = q.get('modelYear');
    if (make && model && year) {
      return {
        ok: true, kind: 'vehicle', url: vehicleUrl(year, make, model), type: 'nhtsa',
        title: `NHTSA owner complaints — ${year} ${displayName(issue)}`,
      };
    }
  } catch { /* ignore */ }
  return { ok: false, why: 'complaint rows lacked canonical product fields' };
}

(async () => {
  for (const file of files) {
    if (!fs.existsSync(file)) { console.error(`SKIP (missing): ${file}`); continue; }
    const payload = JSON.parse(fs.readFileSync(file, 'utf8'));
    const confirmed = payload?.result?.confirmed || [];
    let seen = 0, rewritten = 0, campaign = 0, vehicle = 0;
    const failures = [];

    console.log(`\n━━━ ${file} — ${confirmed.length} issues ━━━`);
    for (const issue of confirmed) {
      for (const c of (issue.citations || [])) {
        if (!c || !/api\.nhtsa\.gov/i.test(c.url || '')) continue;
        seen++;
        const res = await resolveCitation(c.url, issue);
        if (!res.ok) {
          failures.push({ make: issue.make, model: issue.model, url: c.url, why: res.why });
          continue;
        }
        if (!dryRun) { c.url = res.url; c.title = res.title; c.type = res.type; }
        rewritten++;
        if (res.kind === 'campaign') campaign++; else vehicle++;
      }
    }

    // Any issue now left with zero citations would be a regression — check before writing.
    const orphaned = confirmed.filter((i) => !(i.citations || []).length);
    console.log(`  api.nhtsa.gov citations found : ${seen}`);
    console.log(`  rewritten                     : ${rewritten}  (${campaign} campaign deep-links, ${vehicle} vehicle pages)`);
    console.log(`  left untouched                : ${failures.length}`);
    if (failures.length) failures.forEach((f) => console.log(`    ! ${f.make} ${f.model} — ${f.why}\n      ${f.url}`));
    if (orphaned.length) { console.error(`  ABORT: ${orphaned.length} issues would have no citations`); continue; }

    if (!dryRun && rewritten) {
      fs.copyFileSync(file, file.replace(/\.json$/, '.prerewrite.bak.json'));
      fs.writeFileSync(file, JSON.stringify(payload, null, 2));
      console.log(`  ✓ written (backup: ${file.replace(/\.json$/, '.prerewrite.bak.json')})`);
    } else if (dryRun) {
      console.log('  (dry-run — nothing written)');
    }
  }
})();
