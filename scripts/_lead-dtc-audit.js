// DTC coverage audit for interest-email lead vehicles.
//
// Answers three questions per lead vehicle:
//   1. How many of its published issues carry a dtcCodes[] tag at all?
//   2. Which codes do those issues cite that are MISSING from the DTCCode
//      library? A cited-but-unlibraried code is a /dtc/[code]/[make] page that
//      cannot mint — demand we already proved exists, with no page to serve it.
//   3. Which codes appear only in prose (description/solution) and were never
//      promoted into dtcCodes[]? Those are free tags: the research already
//      found the code, the tagging step just missed it.
//
//   node scripts/_lead-dtc-audit.js
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.on('error', () => {});
const p = new PrismaClient({ adapter: new PrismaPg(pool) });

// SAE J2012: one letter (P/B/C/U) + 4 hex-ish digits. Word-bounded so part
// numbers and years cannot masquerade as codes.
const CODE_RE = /\b([PBCU][0-3][0-9A-F]{3})\b/gi;

(async () => {
  const leads = await p.interestEmail.findMany({
    where: { unsubscribedAt: null, context: { startsWith: 'known-issues:' } },
    select: { context: true },
  });
  const demand = {};
  for (const l of leads) {
    const v = l.context.slice('known-issues:'.length).trim();
    demand[v] = (demand[v] || 0) + 1;
  }

  const library = new Set(
    (await p.dTCCode.findMany({ select: { code: true } })).map((c) => c.code.toUpperCase())
  );
  console.log('DTC library size: ' + library.size);

  const issues = await p.knownIssue.findMany({
    where: { vehicleType: 'car', status: 'published' },
    select: { id: true, make: true, model: true, dtcCodes: true, description: true, solution: true, title: true },
  });
  const byVehicle = new Map();
  for (const i of issues) {
    const k = (i.make + ' ' + i.model).toLowerCase();
    if (!byVehicle.has(k)) byVehicle.set(k, []);
    byVehicle.get(k).push(i);
  }

  const rows = [];
  const missingGlobal = new Map(); // code -> lead count backing it
  const untaggedGlobal = [];

  for (const [vehicle, n] of Object.entries(demand)) {
    const list = byVehicle.get(vehicle.toLowerCase()) || [];
    const tagged = list.filter((i) => i.dtcCodes && i.dtcCodes.length);

    const cited = new Set();
    for (const i of tagged) for (const c of i.dtcCodes) cited.add(String(c).toUpperCase());

    // Codes sitting in prose but never promoted into dtcCodes[].
    const proseOnly = new Set();
    for (const i of list) {
      const have = new Set((i.dtcCodes || []).map((c) => String(c).toUpperCase()));
      const text = (i.title || '') + ' ' + (i.description || '') + ' ' + (i.solution || '');
      for (const m of text.matchAll(CODE_RE)) {
        const c = m[1].toUpperCase();
        if (!have.has(c)) {
          proseOnly.add(c);
          untaggedGlobal.push({ issueId: i.id, vehicle, code: c });
        }
      }
    }

    const missing = [...cited].filter((c) => !library.has(c));
    for (const c of missing) missingGlobal.set(c, (missingGlobal.get(c) || 0) + n);

    rows.push({
      vehicle, leads: n,
      published: list.length,
      tagged: tagged.length,
      taggedPct: list.length ? Math.round((tagged.length / list.length) * 100) : 0,
      distinctCodes: cited.size,
      missingFromLibrary: missing.sort(),
      proseOnlyCodes: [...proseOnly].sort(),
    });
  }

  rows.sort((a, b) => a.taggedPct - b.taggedPct || b.leads - a.leads);

  console.log('');
  console.log('leads  pub  tagged   %  codes  missing  prose-only  vehicle');
  for (const r of rows) {
    console.log(
      String(r.leads).padStart(5) + String(r.published).padStart(5) +
      String(r.tagged).padStart(8) + String(r.taggedPct).padStart(4) +
      String(r.distinctCodes).padStart(7) + String(r.missingFromLibrary.length).padStart(9) +
      String(r.proseOnlyCodes.length).padStart(12) + '  ' + r.vehicle
    );
  }

  const totalPub = rows.reduce((s, r) => s + r.published, 0);
  const totalTag = rows.reduce((s, r) => s + r.tagged, 0);
  console.log('');
  console.log('Across ' + rows.length + ' lead vehicles: ' + totalTag + '/' + totalPub +
    ' published issues carry a DTC tag (' + Math.round((totalTag / totalPub) * 100) + '%)');
  console.log('Cited codes MISSING from the library: ' + missingGlobal.size);
  console.log('Prose-only codes never promoted to dtcCodes[]: ' + untaggedGlobal.length +
    ' across ' + new Set(untaggedGlobal.map((u) => u.issueId)).size + ' issues');

  const ranked = [...missingGlobal.entries()].sort((a, b) => b[1] - a[1]);
  if (ranked.length) {
    console.log('');
    console.log('Top missing-from-library codes (by backing lead count):');
    for (const [code, n] of ranked.slice(0, 40)) console.log('  ' + code + '  ' + n + ' leads');
  }

  fs.writeFileSync('data/_lead-dtc-gaps.json', JSON.stringify({
    rows,
    missingFromLibrary: ranked.map(([code, leads]) => ({ code, leads })),
    proseOnly: untaggedGlobal,
  }, null, 2));

  await p.$disconnect();
  await pool.end();
})().catch((e) => { console.error(e); process.exit(1); });
