#!/usr/bin/env node
/**
 * LEGITIMACY AUDIT — verify a wave's NHTSA campaign numbers against NHTSA itself.
 *
 * The citation gate can only ask "does this URL resolve?", and it treats 403 as live because owner
 * forums bot-block scripted fetches. That leaves a documented blind spot: a 403 cannot distinguish a
 * real thread from a fabricated URL on a real host.
 *
 * NHTSA campaign numbers close part of that gap with hard evidence. A campaign number is a fact, not
 * a URL — api.nhtsa.gov returns the real campaign for a real number and nothing for an invented one,
 * and the response carries the make/model/years the campaign actually covers. So this checks three
 * things a hallucination cannot survive:
 *
 *   1. Does the campaign exist at all?
 *   2. Does it cover the MAKE the article attaches it to?
 *   3. Does it cover the MODEL the article attaches it to?
 *
 * A campaign that exists but covers a different vehicle is the more dangerous failure: it looks
 * verified to every downstream gate while being wrong on the page.
 *
 * Read-only. No writes, no AI.
 *
 *   node scripts/_audit-wave-recalls.js data/research-wave7-2026-08-25-citychecked-corrected.json
 */
const fs = require('fs');

const FILE = process.argv.find((a) => a.endsWith('.json'));
if (!FILE) {
  console.error('usage: node scripts/_audit-wave-recalls.js <wave.json>');
  process.exit(1);
}

const payload = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const confirmed = payload?.result?.confirmed || payload?.confirmed || [];

// NHTSA campaign numbers are 8 chars: 2-digit year, a letter (V vehicle / E equipment / T tire),
// then 3 digits — e.g. 25V636. Articles write them with or without a hyphen and sometimes with
// trailing zeros (24V763000). Capture the canonical 6-char core.
const CAMPAIGN_RE = /\b(\d{2})\s?V-?\s?(\d{3})(\d{3})?\b/gi;

function campaignsIn(issue) {
  const hay = [issue.title, issue.description, issue.solution,
    ...(issue.citations || []).map((c) => `${c.title} ${c.url}`)].join(' ');
  const found = new Set();
  let m;
  while ((m = CAMPAIGN_RE.exec(hay)) !== null) found.add(`${m[1]}V${m[2]}`.toUpperCase());
  return [...found];
}

async function lookup(core) {
  // NHTSA stores campaign numbers zero-padded to 9 chars (25V636000).
  const padded = `${core}000`;
  const url = `https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=${padded}`;
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(20000) });
    if (!r.ok) return { ok: false, err: `HTTP ${r.status}` };
    const j = await r.json();
    const results = j.results || [];
    if (!results.length) return { ok: true, exists: false };
    return {
      ok: true, exists: true,
      makes: [...new Set(results.map((x) => String(x.Manufacturer || '').toUpperCase()))],
      models: [...new Set(results.map((x) => String(x.Model || '').toUpperCase()))],
      nhtsaMakes: [...new Set(results.map((x) => String(x.Make || '').toUpperCase()))],
      component: results[0].Component,
      summary: String(results[0].Summary || '').slice(0, 110),
    };
  } catch (e) {
    return { ok: false, err: e.message };
  }
}

(async () => {
  const jobs = [];
  for (const issue of confirmed) {
    for (const c of campaignsIn(issue)) jobs.push({ issue, campaign: c });
  }
  const unique = [...new Set(jobs.map((j) => j.campaign))];
  console.log(`${confirmed.length} confirmed issues | ${jobs.length} campaign references | ${unique.length} distinct campaign numbers\n`);

  const cache = new Map();
  for (let i = 0; i < unique.length; i += 5) {
    const chunk = unique.slice(i, i + 5);
    const res = await Promise.all(chunk.map((c) => lookup(c)));
    chunk.forEach((c, n) => cache.set(c, res[n]));
    process.stdout.write(`\r  checked ${Math.min(i + 5, unique.length)}/${unique.length}   `);
  }
  console.log('\n');

  const bad = [], mismatch = [], good = [], errored = [];
  for (const j of jobs) {
    const r = cache.get(j.campaign);
    if (!r || !r.ok) { errored.push({ ...j, r }); continue; }
    if (!r.exists) { bad.push({ ...j, r }); continue; }
    const make = j.issue.make.toUpperCase();
    const model = j.issue.model.toUpperCase().replace(/\s+/g, '');
    const makeHit = r.nhtsaMakes.some((x) => x.includes(make)) || r.makes.some((x) => x.includes(make));
    const modelHit = r.models.some((x) => x.replace(/\s+/g, '').includes(model) || model.includes(x.replace(/\s+/g, '')));
    if (!makeHit || !modelHit) mismatch.push({ ...j, r, makeHit, modelHit });
    else good.push({ ...j, r });
  }

  console.log(`VERIFIED (campaign exists AND covers this make+model): ${good.length}`);
  console.log(`MISMATCH (campaign real but covers a different vehicle): ${mismatch.length}`);
  console.log(`NOT FOUND (campaign number does not exist at NHTSA):    ${bad.length}`);
  console.log(`lookup errors (transient, recheck):                     ${errored.length}\n`);

  if (bad.length) {
    console.log('--- NOT FOUND — these are the ones that would indicate invention ---');
    bad.forEach((b) => console.log(`  ${b.campaign}  ${b.issue.make} ${b.issue.model} — ${b.issue.title.slice(0, 70)}`));
    console.log('');
  }
  if (mismatch.length) {
    console.log('--- MISMATCH — campaign is real but NHTSA lists a different vehicle ---');
    mismatch.forEach((b) => {
      console.log(`  ${b.campaign}  claimed: ${b.issue.make} ${b.issue.model}${b.makeHit ? '' : '  [make miss]'}${b.modelHit ? '' : '  [model miss]'}`);
      console.log(`      NHTSA: ${b.r.nhtsaMakes.join('/')} ${b.r.models.slice(0, 6).join(', ')}`);
      console.log(`      ${b.issue.title.slice(0, 80)}`);
    });
    console.log('');
  }
  if (good.length) {
    console.log('--- VERIFIED sample ---');
    good.slice(0, 12).forEach((b) => console.log(`  ${b.campaign}  ${b.issue.make} ${b.issue.model} — ${b.r.component ? String(b.r.component).slice(0, 55) : ''}`));
  }
})();
