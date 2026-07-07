#!/usr/bin/env node
/**
 * Path-B eval runner for the eBay resolver. Hits the eval-gated
 * /api/vision/ebay-health on prod for each fixture and checks the INVARIANTS
 * (snapshots are informational — never a failure, because live listings churn).
 * Exits non-zero if any invariant fails, so a cron/CI step can alert on it.
 *
 * The whole point: the Google-link bug and the Tire Rack fallback both lived in
 * prod undetected until Devon personally tapped the wrong part. This turns
 * "Devon notices" into "the eval notices."
 *
 * Env:
 *   EVAL_TOKEN     required — must match the server's EVAL_TOKEN (the eval gate).
 *   EVAL_BASE_URL  optional — defaults to the fixture's baseUrl (au7o.io).
 *
 * Usage:  EVAL_TOKEN=xxx node scripts/eval-vision-resolver.js
 */
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

const TOKEN = process.env.EVAL_TOKEN;
if (!TOKEN) { console.error('EVAL_TOKEN is required (must match the server env).'); process.exit(2); }

const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'evals', 'vision-ebay-resolver.eval.json'), 'utf-8'));
const BASE = process.env.EVAL_BASE_URL || fixture.baseUrl || 'https://au7o.io';

function checkInvariants(inv, data) {
  const fails = [];
  if (inv.tokenOk === true && data.tokenOk !== true) fails.push(`tokenOk expected true, got ${data.tokenOk}`);
  if (typeof inv.searchStatus === 'number' && data.searchStatus !== inv.searchStatus) fails.push(`searchStatus expected ${inv.searchStatus}, got ${data.searchStatus}`);
  if (inv.verifiedNonNull === true && !data.verifiedPartNumber) fails.push(`verifiedPartNumber expected non-null, got ${data.verifiedPartNumber}`);
  if (inv.affiliateWhenListings === true && (data.listings || 0) > 0 && data.campaignTagged !== true) {
    fails.push(`listings>0 but campaignTagged=${data.campaignTagged} (a surfaced listing must be affiliate-tagged)`);
  }
  if (Array.isArray(inv.allListingsMatchAnyToken)) {
    const toks = inv.allListingsMatchAnyToken.map((t) => t.toUpperCase());
    for (const l of data.sampleListings || []) {
      const title = String(l.title || '').toUpperCase();
      if (!toks.some((t) => title.includes(t))) {
        fails.push(`trim-inappropriate listing surfaced: "${l.title}" (matches none of ${toks.join('/')})`);
      }
    }
  }
  return fails;
}

async function main() {
  let failed = 0;
  for (const c of fixture.cases) {
    const url = new URL(BASE + '/api/vision/ebay-health');
    url.searchParams.set('q', c.query);
    for (const [k, v] of Object.entries(c.params || {})) url.searchParams.set(k, v);
    let data;
    try {
      const res = await fetch(url, { headers: { 'x-eval-token': TOKEN } });
      data = await res.json();
    } catch (e) {
      console.log(`✗ ${c.name}: request failed — ${e.message}`);
      failed++; continue;
    }
    if (data?.error) { console.log(`✗ ${c.name}: endpoint returned ${JSON.stringify(data)}`); failed++; continue; }
    const fails = checkInvariants(c.invariants || {}, data);
    if (fails.length) {
      failed++;
      console.log(`✗ ${c.name}`);
      fails.forEach((f) => console.log(`    - ${f}`));
    } else {
      console.log(`✓ ${c.name}  (verified=${data.verifiedPartNumber ?? 'null'}, reported=${data.reportedPartNumber ?? 'null'}, listings=${data.listings})`);
    }
  }
  console.log(`\n${failed === 0 ? 'PASS' : 'FAIL'} — ${fixture.cases.length - failed}/${fixture.cases.length} cases`);
  process.exit(failed === 0 ? 0 : 1);
}

main();
