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
import { extractPrescribedParts } from '../src/lib/prescription';
import { buildFitmentPacket, type FrozenIssueRecord } from '../src/lib/known-issue-fitment-worklist';

config({ path: '.env.local' });

const make = process.argv[2];
if (!make) { console.error('usage: build-fitment-worklist.ts <Make> [--out file]'); process.exit(1); }
const outFlag = process.argv.indexOf('--out');
const slug = make.toLowerCase().replace(/[^a-z0-9]+/g, '-');
const outFile = outFlag > 0 ? process.argv[outFlag + 1] : `data/_${slug}-fitment-input.json`;
const snapshotFlag = process.argv.indexOf('--snapshot');
const snapshotFile = snapshotFlag > 0 ? process.argv[snapshotFlag + 1] : '';

// Same conservative prescribes-a-part test used by scripts/audit-deeplink-gap.js,
// so the worklist and the gap number describe the same set of issues.
const PART = /\b(pump|sensor|valve|module|switch|motor|actuator|solenoid|coil|belt|chain|tensioner|pulley|bearing|seal|gasket|hose|filter|thermostat|radiator|condenser|compressor|alternator|starter|battery|cable|harness|regulator|control arm|bushing|ball joint|tie rod|spring|strut|shock|mount|rotor|brake pad|caliper|cylinder|clutch|converter|manifold|injector|spark plug|housing|bracket|kit|latch|blower|core|tank|cap|pipe|shaft|differential|turbo|wastegate|intercooler|lifter|piston|oil pan)\b/i;

/**
 * The component noun a phrase is ABOUT. Deliberately the LAST part noun, so
 * "Engine Timing Belt Tensioner" is a tensioner and "head gasket" is a gasket —
 * the trailing noun is the thing, the ones before it are modifiers.
 */
function partNouns(text: string): string[] {
  return String(text || '').toLowerCase().split(/[^a-z0-9]+/)
    .map((t) => (t.length > 3 && t.endsWith('s') && !t.endsWith('ss') ? t.slice(0, -1) : t))
    .filter((t) => PART.test(t));
}

function headNoun(text: string): string {
  const found = partNouns(text);
  return found.length ? found[found.length - 1]! : '';
}
const DEALER = /\b(recall|campaign|reflash|re-?program|software update|warranty extension|free of charge|no charge|dealer will|service action)\b/i;

function prescribesAFix(solution: string): boolean {
  const s = String(solution || '');
  return PART.test(s) && extractPrescribedParts(s).length > 0;
}

if (snapshotFile) (async () => {
  const snapshot = JSON.parse(fs.readFileSync(snapshotFile, 'utf8')) as {
    snapshotKind: string;
    snapshotHash: string;
    records: FrozenIssueRecord[];
  };
  if (!['known-issues-catalog-deeplinks', 'known-issue-make-source'].includes(snapshot.snapshotKind)) {
    throw new Error('Invalid frozen snapshot kind');
  }
  if (!/^[a-f0-9]{64}$/i.test(snapshot.snapshotHash || '')) throw new Error('Frozen snapshot has no valid snapshotHash');
  const packet = buildFitmentPacket(snapshot.records, make);
  if (!packet.ledger.length) throw new Error(`Frozen snapshot has no published ${make} issues`);
  const outputDir = outFlag > 0
    ? null
    : `data/known-issue-part-audit/${slug}/${snapshot.snapshotHash}`;
  const worklistFile = outputDir ? `${outputDir}/02-fitment-worklist.json` : outFile;
  const ledgerFile = outputDir ? `${outputDir}/01-disposition-ledger.json` : `${outFile}.ledger.json`;
  fs.mkdirSync(outputDir || '.', { recursive: true });
  fs.writeFileSync(worklistFile, JSON.stringify({
    schemaVersion: 1,
    artifactKind: 'known-issue-fitment-worklist',
    snapshotHash: snapshot.snapshotHash,
    make,
    guardrail: 'Catalog fitment proves application only; repair-role evidence requires independent review.',
    issueCount: packet.ledger.length,
    componentApplicationCount: packet.entries.length,
    entries: packet.entries,
  }, null, 2));
  fs.writeFileSync(ledgerFile, JSON.stringify({
    schemaVersion: 1,
    artifactKind: 'known-issue-make-disposition-ledger',
    snapshotHash: snapshot.snapshotHash,
    make,
    issueCount: packet.ledger.length,
    issues: packet.ledger,
  }, null, 2));
  console.log(`${make}: ${packet.ledger.length} published | ${packet.entries.length} component/application rows`);
  console.log(`  worklist : ${worklistFile}`);
  console.log(`  ledger   : ${ledgerFile}`);
})().catch((e) => { console.error('ERR', e.message); process.exit(1); });

// Legacy live-database mode remains available only when an explicit frozen
// snapshot was not supplied. Make packets always use the branch above.
if (!snapshotFile) (async () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
  pool.on('error', () => {});
  const { rows } = await pool.query(
    `SELECT id, model, years, engines, title, solution, "fixParts"
       FROM "KnownIssue" WHERE status='published' AND make = $1`,
    [make],
  );
  await pool.end();

  // This lane sources missing parts. Existing fixParts need a separate
  // verification lane; proposing a second replacement beside them can create
  // contradictory commerce and never exercises the quoted-PN verifier.
  const hasExistingFixParts = (value: unknown) => Array.isArray(value) && value.length > 0;
  const prescribing = rows.filter(
    (r) => prescribesAFix(r.solution)
      && !hasExistingFixParts(r.fixParts)
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

    /**
     * The PRESCRIPTION is the best signal, because it is the sentence that
     * actually names what you buy. The title describes the failure and is often
     * looser: "Crankshaft Position Sensor Failure" mapped to a CAMshaft sensor,
     * while its solution says "Replace crankshaft position sensor". Same for the
     * FPDM, the GDI injector, and the master window switch — in every observed
     * error the solution's replace-clause was correct where the title was not.
     *
     * When a prescribed phrase maps to a category, the PHRASE ITSELF becomes the
     * part-type filter, which is more precise than our generic vocabulary
     * ("crankshaft position sensor" rather than "position sensor").
     */
    /**
     * ...but the first MAPPING phrase is not automatically the right one, which
     * is the defect this guard fixes. A repair article routinely prescribes work
     * beyond its own subject — a head-gasket job says to do the timing belt and
     * water pump while the engine is apart — and taking the first match made six
     * separate "Head Gasket Failure" pages recommend an `Engine Timing Belt Kit
     * with Water Pump`. The reader came for a head gasket and was sold a belt.
     *
     * So the prescription still wins, but only among phrases that are ABOUT what
     * the page is about: prefer the first prescribed phrase whose head noun
     * agrees with the title's. Fall back to the title's own mapping before
     * falling back to an unrelated prescribed phrase, because a page that names
     * its component in the title has already told us its subject.
     */
    const titleMapping = mapComponent(r.title, whole);
    /**
     * Agreement is tested against EVERY component noun in the title, not the
     * title's last one.
     *
     * Requiring the last noun to match was too strict and caused its own
     * regressions on titles that name two components: "Engine Overheating /
     * Water Pump and Radiator Fan Failure" ends on `fan`, so a correct "water
     * pump" prescription was judged off-subject and replaced. Measured over the
     * catalog it turned "cabin air filter" into "evaporator", "head gasket" into
     * "intercooler" and "serpentine belt" into "compressor" — each time
     * discarding the right query for a component the title merely also mentions.
     *
     * A prescription is on-subject if the title names that component ANYWHERE.
     * The original defect still gets caught, because a head-gasket page does not
     * mention a pump or a belt in its title at all.
     */
    const titleNouns = new Set(partNouns(r.title));
    if (titleMapping) partNouns(titleMapping.partTypeMatch).forEach((n) => titleNouns.add(n));

    let mapping = null as ReturnType<typeof mapComponent>;
    let partTypeMatch = '';
    let mappedFrom = '';

    const prescribed = extractPrescribedParts(r.solution)
      .map((phrase) => ({ phrase, m: mapComponent(phrase, whole) }))
      .filter((p) => p.m);

    const onSubject = titleNouns.size
      ? prescribed.find((p) => {
        const h = headNoun(p.phrase);
        return h && titleNouns.has(h);
      })
      : undefined;

    if (onSubject) {
      mapping = onSubject.m; partTypeMatch = onSubject.phrase; mappedFrom = 'prescription';
    } else if (titleMapping) {
      mapping = titleMapping; partTypeMatch = titleMapping.partTypeMatch; mappedFrom = 'title';
    }
    // An off-subject prescription is intentionally NOT a fallback. A page can
    // say "replace the timing belt while the head is off" without making a
    // timing belt the repair for its head-gasket identity. If neither the title
    // nor an on-subject prescription maps, leave it for human review.
    if (!mapping) { unmapped.push({ id: r.id, title: r.title }); continue; }
    // WHERE the component was identified is the strongest confidence signal we
    // have. A title names what the page is about; a solution mentions other
    // components in passing ("also check the spark plugs"), and every wrong
    // recommendation found so far came from that fallback.

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
      partTypeMatch,
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
