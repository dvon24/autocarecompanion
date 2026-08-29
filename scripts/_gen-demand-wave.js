// Generate a DEMAND-DRIVEN known-issues wave.
//
// Target selection is not editorial: every candidate is a lead vehicle (someone
// gave us their email asking about it), ranked by leads-per-published-issue —
// the sharpest demand-to-coverage mismatch we can measure. That surfaces both
// the near-empty nameplates and the high-demand ones that are merely shallow.
//
//   node scripts/_gen-demand-wave.js <waveNumber> [count]
//
// Vehicles that already have pending_review rows are skipped, so consecutive
// waves cannot re-target the same nameplate. That check is self-maintaining —
// it needs no ledger and stays correct if a wave is re-run.
//
// Reuses the wave-14 body verbatim (schemas, style prompts, evidence gates, no
// numeric confidence gate) — only TARGETS and EXCLUSIONS are rebuilt.
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { Pool } = require('pg');

const WAVE = Number(process.argv[2] || 16);
const COUNT = Number(process.argv[3] || 12);
const BODY_FROM_LINE = 923; // wave14: CATEGORIES onwards
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
pool.on('error', () => {});

// Vehicles sold only outside the US: NHTSA has nothing on them and our catalog
// is US-centric, so they are the weakest grounding per search. Deprioritised,
// not banned — a lead still asked.
const EU_ONLY = new Set([
  'Peugeot 5008', 'Peugeot 208', 'Opel Astra', 'Renault Megane', 'Skoda Enyaq',
  'Volkswagen Polo', 'Hyundai i20', 'Mercedes-Benz V-Class', 'Mercedes-Benz EQC',
  'Suzuki Vitara', 'CUPRA Formentor', 'Mercedes-Benz SLK/SLC',
]);

(async () => {
  const cov = JSON.parse(fs.readFileSync('data/_lead-coverage.json', 'utf8'));
  const excl = JSON.parse(fs.readFileSync('data/_specs-research-exclusions.json', 'utf8'));
  const exclKeys = new Set(Object.keys(excl));

  const dbPairs = (await pool.query(
    `SELECT DISTINCT make, model FROM "KnownIssue" WHERE "vehicleType" = 'car'`
  )).rows;
  const pairBy = new Map(dbPairs.map((p) => [`${p.make} ${p.model}`.toLowerCase(), p]));

  // A nameplate already sitting in the review queue was covered by a previous
  // wave; targeting it again would just regenerate what a human has not read yet.
  const queued = new Set((await pool.query(
    `SELECT DISTINCT make, model FROM "KnownIssue" WHERE status = 'pending_review'`
  )).rows.map((r) => `${r.make}|${r.model}`));

  const cands = [];
  for (const c of cov) {
    const pair = pairBy.get(String(c.vehicle).toLowerCase());
    if (!pair) continue;
    const key = `${pair.make}|${pair.model}`;
    if (exclKeys.has(key)) continue;  // already researched
    if (queued.has(key)) continue;    // already waiting in the review queue
    if (c.pub >= 25) continue;        // deep enough that a wave adds little
    cands.push({ ...c, make: pair.make, model: pair.model, eu: EU_ONLY.has(c.vehicle),
      ratio: c.leads / Math.max(c.pub, 1) });
  }

  // Demand per unit of existing coverage, US-market ahead of EU-only (NHTSA has
  // nothing on EU cars, so each search buys less there).
  cands.sort((a, b) => (a.eu - b.eu) || (b.ratio - a.ratio) || (a.pub - b.pub));
  const picked = cands.slice(0, COUNT);

  const targets = [], exclusions = [];
  for (const c of picked) {
    const rows = (await pool.query(
      `SELECT title, years, status FROM "KnownIssue" WHERE make=$1 AND model=$2 AND status IN ('published','pending_review') ORDER BY title`,
      [c.make, c.model]
    )).rows;
    const titles = rows.map((r) => r.title);
    const ys = rows.flatMap((r) => r.years || []).filter((y) => y > 1900);
    const span = ys.length ? `${Math.min(...ys)}-${Math.max(...ys)}` : '';

    // A newer nameplate has thin forums, and demanding forum corroboration is
    // exactly when an agent starts inventing threads — send those official-first.
    const style = ys.length && Math.min(...ys) >= 2020 ? 'new' : 'thin';

    targets.push({
      style,
      make: c.make,
      model: c.model,
      yearsHint: span,
      note: [
        `Only ${c.pub} documented issue${c.pub === 1 ? '' : 's'} on this nameplate.`,
        `${c.leads} interest-email lead${c.leads === 1 ? '' : 's'} asked to be alerted about this exact vehicle, so the demand is measured, not assumed.`,
        `The low count is a COVERAGE GAP — no wave has ever deepened this nameplate. It is NOT evidence the vehicle is reliable, and you must not conclude that it is.`,
        c.eu ? `Sold primarily outside North America: NHTSA will have little or nothing. Lean on owner forums, EU/UK recall notices and manufacturer service actions in the home market, and say plainly when the record is thin.` : '',
        titles.length ? `Already documented — do NOT restate any of these, find what is missing around them: ${titles.join(' | ')}` : `Nothing is documented yet, so the whole failure surface is open.`,
      ].filter(Boolean).join(' '),
      forums: '',
    });
    exclusions.push({ make: c.make, model: c.model, existingTitles: titles });
  }

  const OUT = `scripts/_wf-research-wave${WAVE}.js`;
  const src = fs.readFileSync('scripts/_wf-research-wave14.js', 'utf8').split(/\r?\n/);
  const body = src.slice(BODY_FROM_LINE - 1).join('\n');
  const header = `/**
 * RESEARCH WAVE ${WAVE} — DEMAND-DRIVEN THIN NAMEPLATES.
 *
 * GENERATED FILE. Edit scripts/_gen-demand-wave.js and re-run it instead.
 *
 * Every target is a vehicle somebody gave us their email address about, ranked by
 * leads per published issue. Selection is measured demand over measured coverage
 * — not an editor's guess at what is interesting. Nameplates already sitting in
 * pending_review are excluded, so waves cannot overlap each other.
 *
 * Carries the wave-14 body verbatim: same style prompts, same closed category and
 * severity enums (the renderer knows 17 categories and high/medium/low only — a
 * wider enum has previously crashed article pages for 39 models), same EVIDENCE
 * gates and NO numeric confidence gate (self-reported confidence tracks prompt
 * wording, not belief).
 *
 * 'thin'  the low count is a coverage gap, and the prompt says so explicitly.
 * 'new'   nameplates whose earliest documented year is 2020+: forums are thin, so
 *         official sources first — a recall number is a checkable fact, an
 *         invented forum thread is not.
 *
 * DOWNSTREAM: save to data/research-wave${WAVE}-<date>.json, then
 * _persist-known-issues-run.js -> _promote-pending-review.js -> _check-tonight-dupes.js.
 * Do NOT deploy; hand off to Sol.
 */
export const meta = {
  name: 'research-wave${WAVE}-demand-driven',
  description: 'Wave-${WAVE}: ${targets.length} thin nameplates chosen by interest-email demand. Style-selected discover prompt + adversarial verify',
  phases: [
    { title: 'Discover' },
    { title: 'Verify' },
  ],
}

const TARGETS = ${JSON.stringify(targets, null, 2)}

const EXCLUSIONS = ${JSON.stringify(exclusions, null, 2)}

`;
  fs.writeFileSync(OUT, header + body);
  console.log('wrote ' + OUT);
  console.log('targets: ' + targets.length + ' | eligible candidates: ' + cands.length);
  for (const t of targets) {
    const c = picked.find((x) => x.make === t.make && x.model === t.model);
    console.log('  ' + t.style.padEnd(5) + ' ' + String(c.leads) + ' leads  ' +
      String(c.pub).padStart(2) + ' pub  ratio ' + c.ratio.toFixed(2).padStart(5) + '  ' +
      t.make + ' ' + t.model + '  [' + t.yearsHint + ']');
  }
  await pool.end();
})().catch((e) => { console.error('FAIL:', e.message); pool.end(); });
