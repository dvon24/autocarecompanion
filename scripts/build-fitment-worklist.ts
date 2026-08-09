/**
 * Build a fitment-verification worklist for one make.
 *
 * READ-ONLY against the database. Produces the input file that
 * scripts/verify-parts-fitment.js consumes, plus an unmapped report so the
 * component -> category table grows from real misses rather than speculation.
 *
 *   npx tsx scripts/build-fitment-worklist.ts Chevrolet
 *   npx tsx scripts/build-fitment-worklist.ts Ford --out data/_ford-fitment-input.json
 */
import { config } from 'dotenv';
import fs from 'fs';
import { Pool } from 'pg';
import { mapComponent } from '../src/data/component-catalog-map';

config({ path: '.env.local' });

const make = process.argv[2];
if (!make) { console.error('usage: build-fitment-worklist.ts <Make> [--out file]'); process.exit(1); }
const outFlag = process.argv.indexOf('--out');
const slug = make.toLowerCase().replace(/[^a-z0-9]+/g, '-');
const outFile = outFlag > 0 ? process.argv[outFlag + 1] : `data/_${slug}-fitment-input.json`;

// Same conservative prescribes-a-part test used by scripts/audit-deeplink-gap.js,
// so the worklist and the gap number describe the same set of issues.
const PART = /\b(pump|sensor|valve|module|switch|motor|actuator|solenoid|coil|belt|chain|tensioner|pulley|bearing|seal|gasket|hose|filter|thermostat|radiator|condenser|compressor|alternator|starter|battery|cable|harness|regulator|control arm|bushing|ball joint|tie rod|spring|strut|shock|mount|rotor|brake pad|caliper|cylinder|clutch|converter|manifold|injector|spark plug|housing|bracket|kit|latch|blower|core|tank|cap|pipe|shaft|differential|turbo|wastegate|intercooler|lifter|piston|oil pan)\b/i;
const NEGATED = /\b(?:before|prior to|instead of|rather than|without|avoid|unnecessar\w*|not(?:\s+\w+){0,3}?)\s+(?:replac|install)/i;
const PRESCRIBES = /\b(replace|replacing|replacement|install|installing)\b/i;
const DEALER = /\b(recall|campaign|reflash|re-?program|software update|warranty extension|free of charge|no charge|dealer will|service action)\b/i;

function prescribesAFix(solution: string): boolean {
  const s = String(solution || '');
  if (!PRESCRIBES.test(s) || !PART.test(s)) return false;
  return s.split(/(?<=[.;])\s+/).some((x) => PRESCRIBES.test(x) && PART.test(x) && !NEGATED.test(x));
}

(async () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
  pool.on('error', () => {});
  const { rows } = await pool.query(
    `SELECT id, model, years, engines, title, solution, "fixParts"
       FROM "KnownIssue" WHERE status='published' AND make = $1`,
    [make],
  );
  await pool.end();

  const prescribing = rows.filter(
    (r) => prescribesAFix(r.solution)
      && !(DEALER.test(r.solution) && !/aftermarket|purchase|order the part|buy/i.test(r.solution)),
  );

  const entries: unknown[] = [];
  const unmapped: Array<{ id: string; title: string }> = [];

  for (const r of prescribing) {
    // The TITLE names the component the page is about. The solution often
    // mentions others in passing ("also check the thermostat"), which once made
    // a head-gasket article resolve to a thermostat.
    // Veto is tested against the WHOLE article, so a title-level veto is not
    // undone by the solution's passing mention of the same component.
    const whole = `${r.title} ${r.solution}`;
    const fromTitle = mapComponent(r.title, whole);
    const mapping = fromTitle || mapComponent(r.solution, whole);
    if (!mapping) { unmapped.push({ id: r.id, title: r.title }); continue; }
    // WHERE the component was identified is the strongest confidence signal we
    // have. A title names what the page is about; a solution mentions other
    // components in passing ("also check the spark plugs"), and every wrong
    // recommendation found so far came from that fallback.
    const mappedFrom = fromTitle ? 'title' : 'solution';

    const displacement = (r.engines || [])
      .map((e: string) => (e.match(/\d\.\d\s*L/i) || [])[0])
      .filter(Boolean)[0];

    entries.push({
      id: r.id,
      make,
      model: r.model,
      years: r.years,
      // Empty when the article names no part number: we are SOURCING one, which
      // the verifier reports as `discovered` rather than `absent`.
      partNumber: '',
      productMatch: mapping.productMatch,
      partTypeMatch: mapping.partTypeMatch,
      mappedFrom,
      ...(mapping.engineIndependent || !displacement
        ? {}
        : { engineMatch: String(displacement).replace(/\s+/g, '') }),
    });
  }

  fs.writeFileSync(outFile, JSON.stringify(entries, null, 1));
  fs.writeFileSync(`data/_${slug}-unmapped.json`, JSON.stringify(unmapped, null, 1));

  const pct = prescribing.length ? Math.round((entries.length / prescribing.length) * 100) : 0;
  console.log(`${make}: ${rows.length} published | ${prescribing.length} prescribe a part | ${entries.length} mapped (${pct}%)`);
  console.log(`  worklist : ${outFile}`);
  console.log(`  unmapped : data/_${slug}-unmapped.json (${unmapped.length})`);
  if (unmapped.length) {
    console.log('  top unmapped titles:');
    unmapped.slice(0, 8).forEach((u) => console.log('    -', u.title.slice(0, 72)));
  }
})().catch((e) => { console.error('ERR', e.message); process.exit(1); });
