#!/usr/bin/env node
/**
 * Per-recipient "Reserve your spot" links for the launch email.
 *
 * The 177 known-issues leads already told us their vehicle — it is sitting in
 * InterestEmail.context as "known-issues:<Make> <Model>". Sending them to a
 * bare homepage form and asking them to type it again is a drop-off point we
 * do not need, so this emits a link that arrives with make and model already
 * chosen:
 *
 *   https://au7o.io/?make=Chrysler&model=Voyager
 *
 * HeroReserveForm resolves those against ymmt.json and leaves the person
 * picking only year and trim — the two fields we genuinely do not know and
 * that the maintenance schedule cannot be right without.
 *
 * Make/model is split by longest-prefix match against the real make list, not
 * by taking the first token: "Mercedes-Benz E-Class", "Land Rover Range Rover"
 * and "Alfa Romeo Giulia" all break under a naive split, and a wrong make
 * produces a link that silently prefills nothing.
 *
 * Output is CSV (email,vehicle,url) on stdout for an email tool's merge
 * fields, or --json for anything else. Read-only — it never writes to the DB
 * and never sends anything.
 *
 * Usage:
 *   node scripts/build-reserve-links.js
 *   node scripts/build-reserve-links.js --json --base https://au7o.io
 *   node scripts/build-reserve-links.js --unmatched     # only the ones needing a bare link
 */
require('dotenv').config({ path: '.env.local', quiet: true });
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const val = (f, d) => {
  const i = argv.indexOf(f);
  return i !== -1 && argv[i + 1] ? argv[i + 1] : d;
};

const BASE = String(val('--base', process.env.NEXT_PUBLIC_APP_URL || 'https://au7o.io')).replace(/\/+$/, '');
const AS_JSON = has('--json');
const ONLY_UNMATCHED = has('--unmatched');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.on('error', () => {});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

/** Every make in the catalog, longest first so "Land Rover" beats "Land". */
function loadMakes() {
  const file = path.join(__dirname, '..', 'public', 'data', 'ymmt.json');
  const ymmt = JSON.parse(fs.readFileSync(file, 'utf8'));
  const makes = new Set();
  for (const year of Object.keys(ymmt)) {
    for (const make of Object.keys(ymmt[year] || {})) makes.add(make);
  }
  return [...makes].sort((a, b) => b.length - a.length);
}

const canon = (s) => String(s).trim().toLowerCase().replace(/[\s_-]+/g, ' ');

/**
 * "Mercedes-Benz E-Class" -> { make: "Mercedes-Benz", model: "E-Class" }.
 * Returns nulls when no known make prefixes the label, which is the honest
 * answer — those recipients get a plain homepage link rather than a guess.
 */
function splitMakeModel(label, makes) {
  const target = canon(label);
  for (const make of makes) {
    const prefix = canon(make);
    if (target === prefix) return { make, model: null };
    if (target.startsWith(prefix + ' ')) {
      return { make, model: label.trim().slice(make.length).trim() || null };
    }
  }
  return { make: null, model: null };
}

function buildUrl(make, model) {
  const q = new URLSearchParams();
  if (make) q.set('make', make);
  if (model) q.set('model', model);
  const s = q.toString();
  return s ? `${BASE}/?${s}` : `${BASE}/`;
}

const csvCell = (v) => {
  const s = String(v == null ? '' : v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

(async () => {
  const makes = loadMakes();

  const leads = await prisma.interestEmail.findMany({
    where: { unsubscribedAt: null },
    orderBy: { createdAt: 'asc' },
    select: { email: true, context: true, createdAt: true },
  });

  // One row per address. Somebody subscribed to three vehicles gets one email,
  // and the link points at whichever they asked about first — sending the same
  // person three near-identical launch emails is how a list gets marked spam.
  const seen = new Map();
  for (const lead of leads) {
    const key = lead.email.toLowerCase();
    if (seen.has(key)) {
      seen.get(key).extra.push(lead.context);
      continue;
    }
    seen.set(key, { email: key, context: lead.context, extra: [] });
  }

  const rows = [];
  for (const entry of seen.values()) {
    const ctx = String(entry.context || '');
    // "known-issues:Chrysler Voyager" -> "Chrysler Voyager". Anything with a
    // different prefix (dtc:, diagnose) carries no vehicle at all.
    const label = ctx.startsWith('known-issues:') ? ctx.slice('known-issues:'.length).trim() : '';
    const { make, model } = label ? splitMakeModel(label, makes) : { make: null, model: null };
    rows.push({
      email: entry.email,
      vehicle: label || null,
      make,
      model,
      matched: Boolean(make),
      alsoAskedAbout: entry.extra.length,
      url: buildUrl(make, model),
    });
  }

  const out = ONLY_UNMATCHED ? rows.filter((r) => !r.matched) : rows;

  if (AS_JSON) {
    console.log(JSON.stringify(out, null, 2));
  } else {
    console.log(['email', 'vehicle', 'url'].join(','));
    for (const r of out) console.log([csvCell(r.email), csvCell(r.vehicle), csvCell(r.url)].join(','));
  }

  const matched = rows.filter((r) => r.matched).length;
  const withModel = rows.filter((r) => r.make && r.model).length;
  console.error(
    `\n${rows.length} unique addresses (${leads.length} subscription rows) · ` +
    `${matched} resolved to a known make, ${withModel} to make+model · ` +
    `${rows.length - matched} get a plain ${BASE}/ link`
  );
  const unmatched = rows.filter((r) => !r.matched && r.vehicle);
  if (unmatched.length) {
    console.error('unresolved labels: ' + [...new Set(unmatched.map((r) => r.vehicle))].join(' | '));
  }

  await prisma.$disconnect();
  await pool.end();
})().catch((e) => { console.error(e); process.exit(1); });
