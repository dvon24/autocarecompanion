// Recall coverage audit for interest-email lead vehicles.
//
// For every vehicle a lead asked to be alerted about, pull the NHTSA recall
// campaigns and ask: which ones does our published catalog NOT cite? Those are
// the highest-confidence content gaps we have — real, government-sourced defects
// that already ship with a documented remedy, on vehicles we KNOW someone is
// waiting to hear about.
//
// Three traps this script exists to avoid, ALL of which look like "0 recalls":
//   1. Naive make/model split — "Alfa Romeo Giulia" is not make="Alfa".
//   2. Model vocabulary — NHTSA calls the GLC "GLC-CLASS" and explodes the F-150
//      into 20+ cab/powertrain variants. Resolve against their list; don't guess.
//   3. Throttling — nhtsa() returns null on failure, recorded as status
//      "unknown". A throttled vehicle is NEVER reported as a clean one.
//
//   node scripts/_lead-recall-harvest.js     # resumable; re-run to fill "unknown"
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const { nhtsa } = require('./_nhtsa-fetch');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.on('error', () => {});
const p = new PrismaClient({ adapter: new PrismaPg(pool) });

const RECALLS = 'https://api.nhtsa.gov/recalls/recallsByVehicle';
const MAKES = 'https://api.nhtsa.gov/products/vehicle/makes';
const MODELS = 'https://api.nhtsa.gov/products/vehicle/models';
// Year window for the make/model VOCABULARY lookups only. Recall queries use a
// per-vehicle window derived from the years our own catalog covers — a fixed
// modern window silently returns nothing for a LeBaron (ended 1995) or a
// Prowler (2002), which is indistinguishable from a clean vehicle.
const YEARS = [];
for (let y = 2014; y <= 2026; y++) YEARS.push(y);
const NHTSA_EPOCH = 1995; // recalls API has little usable data before this
const MAX_VARIANTS = 10; // F-150 resolves to 20+; cap the fan-out, report the cut
const OUT = 'data/_lead-recall-gaps.json';

const norm = (s) => String(s).toUpperCase().replace(/[^A-Z0-9]/g, '');

async function loadMakes() {
  const set = new Set();
  for (const y of YEARS) {
    const d = await nhtsa(MAKES + '?modelYear=' + y + '&issueType=r');
    for (const m of (d && d.results) || []) set.add(m.make.toUpperCase());
  }
  return set;
}

// Union of NHTSA model names for this make across all years, deduped by
// normalized form, so each real variant is queried once instead of once per year.
async function variantsFor(make, model, years) {
  const seen = new Map();  // normalized -> display name
  const yearsOf = new Map(); // normalized -> [years it actually existed]
  let anyOk = false;
  for (const y of years) {
    const d = await nhtsa(MODELS + '?modelYear=' + y + '&make=' + encodeURIComponent(make) + '&issueType=r');
    if (!d) continue;
    anyOk = true;
    for (const m of d.results || []) {
      const k = norm(m.model);
      if (!seen.has(k)) { seen.set(k, m.model); yearsOf.set(k, []); }
      yearsOf.get(k).push(y);
    }
  }
  if (!anyOk) return { variants: null, truncated: false, totalVariants: 0, yearsOf };

  const cands = Array.from(seen.values());
  const n = norm(model);
  let hits = cands.filter((c) => norm(c) === n);
  if (!hits.length) hits = cands.filter((c) => norm(c) === n + 'CLASS');
  // Prefix match at a token boundary, so "GLC" cannot match "GLE" and "S90"
  // cannot match "S900" — but "GLC-CLASS COUPE" and "F-150 SUPERCAB" survive.
  if (!hits.length) {
    hits = cands.filter((c) => {
      const cn = norm(c);
      if (!cn.startsWith(n)) return false;
      const next = cn[n.length];
      return next === undefined || !/[0-9]/.test(next);
    });
  }
  return { variants: hits.slice(0, MAX_VARIANTS), truncated: hits.length > MAX_VARIANTS, totalVariants: hits.length, yearsOf };
}

// Only query (variant, year) pairs NHTSA says exist. Querying all 13 years for
// every variant is ~70% wasted calls, and the waste is what triggers throttling.
async function recallsFor(make, variants, yearsOf, fallbackYears) {
  const out = new Map();
  let failures = 0;
  let calls = 0;
  for (const t of variants) {
    for (const year of (yearsOf.get(norm(t)) || fallbackYears)) {
      calls++;
      const d = await nhtsa(RECALLS + '?make=' + encodeURIComponent(make) + '&model=' + encodeURIComponent(t) + '&modelYear=' + year);
      if (!d) { failures++; continue; }
      for (const r of d.results || []) {
        if (!out.has(r.NHTSACampaignNumber)) {
          out.set(r.NHTSACampaignNumber, {
            campaign: r.NHTSACampaignNumber,
            component: r.Component,
            consequence: r.Consequence,
            remedy: r.Remedy,
            date: r.ReportReceivedDate,
            parkIt: !!r.ParkIt,
            years: [year],
          });
        } else {
          out.get(r.NHTSACampaignNumber).years.push(year);
        }
      }
    }
  }
  return { recalls: Array.from(out.values()), failures, calls };
}

(async () => {
  const makeSet = await loadMakes();
  console.log('NHTSA makes loaded:', makeSet.size);
  if (makeSet.size < 100) throw new Error('make list looks throttled - aborting rather than reporting false zeros');

  const leads = await p.interestEmail.findMany({
    where: { unsubscribedAt: null, context: { startsWith: 'known-issues:' } },
    select: { context: true },
  });
  const demand = {};
  for (const l of leads) {
    const v = l.context.slice('known-issues:'.length).trim();
    demand[v] = (demand[v] || 0) + 1;
  }

  // Resumable: keep only settled rows. "unknown" is a throttle casualty and
  // "no-nhtsa-model" may just be a too-narrow year window — retry both.
  const prior = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : [];
  const results = prior.filter((r) => r.status === 'ok' || r.status === 'not-in-nhtsa');
  const doneSet = new Set(results.map((r) => r.vehicle));

  const names = Object.keys(demand);
  for (let n = 0; n < names.length; n++) {
    const v = names[n];
    const tag = String(n + 1).padStart(3) + '/' + names.length + ' ' + v.padEnd(30);
    if (doneSet.has(v)) { console.log(tag + ' [cached]'); continue; }

    // Longest NHTSA make that prefixes the string wins ("Alfa Romeo" over "Alfa").
    let make = v.slice(0, v.indexOf(' '));
    let model = v.slice(v.indexOf(' ') + 1);
    for (const m of makeSet) {
      if (v.toUpperCase().startsWith(m + ' ') && m.length > make.length) {
        make = v.slice(0, m.length);
        model = v.slice(m.length + 1);
      }
    }
    const known = makeSet.has(make.toUpperCase());

    const ours = await p.knownIssue.findMany({
      where: {
        vehicleType: 'car',
        make: { equals: make, mode: 'insensitive' },
        model: { equals: model, mode: 'insensitive' },
        status: 'published',
      },
      select: { title: true, description: true, citations: true, years: true },
    });
    const blob = ours
      .map((i) => (i.title + ' ' + i.description + ' ' + JSON.stringify(i.citations)).toLowerCase())
      .join('\n');

    // Search the years OUR catalog says this vehicle spans, widened by two on
    // each side, so a 1990s nameplate is not judged by a 2014+ window.
    const ys = ours.flatMap((i) => i.years || []).filter((y) => y > 1900);
    const lo = ys.length ? Math.max(NHTSA_EPOCH, Math.min(...ys) - 2) : 2014;
    const hi = ys.length ? Math.min(2026, Math.max(...ys) + 2) : 2026;
    const searchYears = [];
    for (let y = lo; y <= hi; y++) searchYears.push(y);

    let rec = { recalls: [], failures: 0, calls: 0 };
    let variants = [];
    let truncated = false;
    let totalVariants = 0;
    let status = 'ok';

    if (!known) {
      status = 'not-in-nhtsa'; // EU-market vehicle; NHTSA has no jurisdiction
    } else {
      const vr = await variantsFor(make, model, searchYears);
      if (vr.variants === null) {
        status = 'unknown';
      } else {
        variants = vr.variants;
        truncated = vr.truncated;
        totalVariants = vr.totalVariants;
        if (!variants.length) {
          status = 'no-nhtsa-model';
        } else {
          rec = await recallsFor(make, variants, vr.yearsOf, searchYears);
          if (rec.failures > rec.calls * 0.2) status = 'unknown';
        }
      }
    }

    const uncovered = rec.recalls.filter((r) => !blob.includes(r.campaign.toLowerCase()));
    results.push({
      vehicle: v, leads: demand[v], make, model, status,
      resolvedModels: variants, variantsTruncated: truncated, totalVariants,
      published: ours.length, recalls: rec.recalls.length, uncovered: uncovered.length,
      fetchFailures: rec.failures, uncoveredList: uncovered,
    });
    fs.writeFileSync(OUT, JSON.stringify(results, null, 2));

    console.log(
      tag + ' ' + (status === 'ok' ? '' : '[' + status + '] ') +
      'recalls=' + String(rec.recalls.length).padStart(3) +
      ' uncovered=' + String(uncovered.length).padStart(3) +
      (truncated ? '  (capped ' + MAX_VARIANTS + ' of ' + totalVariants + ' variants)' : '')
    );
  }

  const ok = results.filter((r) => r.status === 'ok');
  const unknown = results.filter((r) => r.status === 'unknown');
  console.log('');
  console.log('resolved ' + ok.length + '/' + names.length +
    ' | unknown ' + unknown.length +
    ' | not-in-nhtsa ' + results.filter((r) => r.status === 'not-in-nhtsa').length +
    ' | no-nhtsa-model ' + results.filter((r) => r.status === 'no-nhtsa-model').length);
  console.log('TOTAL uncovered recall campaigns: ' + ok.reduce((s, r) => s + r.uncovered, 0));
  if (unknown.length) console.log('Re-run to retry unknown: ' + unknown.map((r) => r.vehicle).join(', '));

  await p.$disconnect();
  await pool.end();
})().catch((e) => { console.error(e); process.exit(1); });
