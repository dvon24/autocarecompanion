// Build the TARGETS payload for a recall-propagation wave over the LEAD-DEMAND
// gaps (data/_lead-recall-gaps.json) — NHTSA campaigns that cover a vehicle our
// interest-email leads asked about, and that no published issue cites.
//
// Read-only. Emits data/_lead-recall-wave-targets.json.
//
//   node scripts/_prep-lead-recall-wave.js [campaignCount]
//
// Different gap source from scripts/_prep-recall-wave.js: that one propagates a
// campaign we already documented onto platform-mate models, this one documents
// campaigns nobody has covered at all, chosen by who is actually waiting.
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const MAX_CAMPAIGNS = Number(process.argv[2] || 12);
const CACHE = path.join(process.cwd(), 'data', '_nhtsa-cache');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
pool.on('error', () => {});

// 'increasing the risk of a crash' is NHTSA boilerplate on 81% of campaigns and
// 'injury' on 37%. Only these actually discriminate.
const urgent = (c) => c.parkIt ||
  /\bfires?\b|\bdeath\b|\bfatal|loss of (vehicle )?control/i.test(c.consequence || '');

// The harvest kept only the fields it needed; Summary and the authoritative
// Component text live in the cached NHTSA responses. Recover them without
// re-hitting the API.
function loadCampaignText() {
  const by = new Map();
  for (const n of fs.readdirSync(CACHE)) {
    if (!n.includes('recallsByVehicle')) continue;
    let j;
    try { j = JSON.parse(fs.readFileSync(path.join(CACHE, n), 'utf8')); } catch { continue; }
    for (const r of j.results || []) {
      const id = r.NHTSACampaignNumber;
      if (!id || by.has(id)) continue;
      by.set(id, {
        component: r.Component, summary: r.Summary, consequence: r.Consequence,
        remedy: r.Remedy, manufacturer: r.Manufacturer, parkIt: !!r.parkIt,
      });
    }
  }
  return by;
}

(async () => {
  const rows = JSON.parse(fs.readFileSync('data/_lead-recall-gaps.json', 'utf8'));
  const text = loadCampaignText();
  console.log('campaign records recovered from cache: ' + text.size);

  // Our own make/model spelling, keyed the way the lead context is keyed.
  const dbPairs = (await pool.query(
    `SELECT DISTINCT make, model FROM "KnownIssue" WHERE "vehicleType" = 'car'`
  )).rows;
  const pairBy = new Map(dbPairs.map((p) => [`${p.make} ${p.model}`.toLowerCase(), p]));

  // campaign -> the lead vehicles it covers but nobody documented
  const byCampaign = new Map();
  let unmapped = 0, notext = 0;
  for (const row of rows) {
    if (row.status !== 'ok') continue;
    const pair = pairBy.get(String(row.vehicle).toLowerCase());
    if (!pair) { unmapped++; continue; }
    for (const c of row.uncoveredList || []) {
      const t = text.get(c.campaign);
      if (!t || !t.summary) { notext++; continue; }
      if (!byCampaign.has(c.campaign)) {
        byCampaign.set(c.campaign, { campaign: c.campaign, ...t, consequence: c.consequence || t.consequence, models: [] });
      }
      byCampaign.get(c.campaign).models.push({
        make: pair.make, model: pair.model, years: c.years, leads: row.leads, urgent: urgent(c),
      });
    }
  }
  if (unmapped) console.log('lead vehicles with no DB make/model match: ' + unmapped);
  if (notext) console.log('campaign refs with no cached Summary: ' + notext);

  // Rank: who is waiting, weighted by whether the defect can actually hurt them,
  // and by how many lead vehicles one campaign clears at once.
  const all = [...byCampaign.values()].map((t) => {
    const leads = t.models.reduce((s, m) => s + m.leads, 0);
    const anyUrgent = t.models.some((m) => m.urgent);
    return { ...t, _leads: leads, _urgent: anyUrgent, _score: leads * (anyUrgent ? 3 : 1) * Math.sqrt(t.models.length) };
  }).sort((a, b) => b._score - a._score);

  const picked = all.slice(0, MAX_CAMPAIGNS);

  // Existing titles per model, so the writer cannot restate what we already have
  // and the verifier can call a duplicate.
  for (const t of picked) {
    for (const m of t.models) {
      m.existingTitles = (await pool.query(
        `SELECT title FROM "KnownIssue" WHERE make=$1 AND model=$2 AND status IN ('published','pending_review') ORDER BY title`,
        [m.make, m.model]
      )).rows.map((r) => r.title);
      delete m.leads; delete m.urgent;
    }
  }

  const out = picked.map(({ _leads, _urgent, _score, manufacturer, ...t }) => t);
  fs.writeFileSync('data/_lead-recall-wave-targets.json', JSON.stringify(out, null, 2));

  console.log('');
  console.log('candidate campaigns: ' + all.length + ' | picked: ' + picked.length +
    ' | model-gaps: ' + picked.reduce((s, t) => s + t.models.length, 0));
  console.log('');
  for (const t of picked) {
    console.log('  ' + t.campaign + '  ' + String(t.models.length).padStart(2) + ' models  ' +
      String(t._leads).padStart(2) + ' leads  ' + (t._urgent ? 'URGENT ' : '       ') +
      String(t.component).slice(0, 46));
    console.log('        ' + t.models.map((m) => m.make + ' ' + m.model).join(', ').slice(0, 110));
  }
  await pool.end();
})().catch((e) => { console.error('FAIL:', e.message); pool.end(); });
