/**
 * Render the staged part proposals as a reviewable document.
 *
 * 504 JSON objects are not a decision. This produces a per-make table an owner
 * can scan quickly: the article's real title next to the part we would attach,
 * so the question "is that the right part for that problem?" can be answered in
 * about a second per row.
 *
 * Rows are ordered so the risky ones surface first WITHIN each make:
 * lower-confidence pickers (unlisted supplier, no alternate, unusually large
 * candidate sets) sort above the clean ones. The measured error rate is ~8%, so
 * the value of this file is finding those 40 rows, not admiring the other 464.
 *
 *   npx tsx scripts/build-proposal-review.ts
 */
import { config } from 'dotenv';
import fs from 'fs';
import { Pool } from 'pg';
import { formatYearRange } from '../src/lib/known-issue-part-fitment';

config({ path: '.env.local' });

interface Part {
  role: string; component: string; supplier: string; aftermarketXref: string[];
  supplierTier: string; fitment?: { years?: number[]; engines?: string[]; catalogModels?: string[] };
}
interface Proposal {
  id: string; vehicle: string; consideredCount: number; parts: Part[];
  partTypeRelaxedTo?: string; modelResolvedBy?: string;
  partTypeMatch?: string; mappedFrom?: string;
}

function repairEvidence(solution: unknown): string {
  const text = String(solution || '').replace(/\|/g, '/').replace(/\s+/g, ' ').trim();
  if (!text) return 'missing solution evidence';
  const clauses = text.split(/(?<=[.;!?])\s+/)
    .filter((clause) => /\b(?:replace|replacing|replacement|install|swap|repair)\b/i.test(clause));
  // Show every repair clause; a fixed prefix can omit the exact conditional
  // language the reviewer needs to distinguish the right component/variant.
  return (clauses.length ? clauses : [text]).join(' / ');
}

(async () => {
  const doc = JSON.parse(fs.readFileSync('data/_part-proposals.json', 'utf8')) as { proposals: Proposal[] };
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
  pool.on('error', () => {});
  const { rows } = await pool.query(
    'select id, make, model, title, solution from "KnownIssue" where id = any($1)',
    [doc.proposals.map((p) => p.id)],
  );
  await pool.end();
  const meta = new Map(rows.map((r) => [r.id, r]));

  /** Cheap risk heuristic — it decides ORDER only, never inclusion. */
  const risk = (p: Proposal) => {
    const primary = p.parts[0]!;
    let score = 0;
    if (primary.supplierTier === 'unlisted') score += 2;
    if (p.parts.length === 1) score += 1;            // no second opinion
    if (p.consideredCount > 25) score += 2;          // ambiguous part type
    if (p.consideredCount <= 2) score += 1;          // thin coverage
    if (!primary.fitment?.engines?.length) score += 1; // not engine-scoped
    if (p.partTypeRelaxedTo) score += 2;
    if (p.modelResolvedBy) score += 1;
    return score;
  };

  const byMake = new Map<string, Proposal[]>();
  for (const p of doc.proposals) {
    const make = meta.get(p.id)?.make || 'Unknown';
    if (!byMake.has(make)) byMake.set(make, []);
    byMake.get(make)!.push(p);
  }

  const out: string[] = [
    '# Part proposals — review queue',
    '',
    `${doc.proposals.length} proposals across ${byMake.size} makes. **Nothing is applied.** Every part is`,
    '`verified: false` with no buy links.',
    '',
    'The catalog proved these parts FIT the vehicle (year + engine). It did NOT prove any of them',
    'REPAIRS the failure the article describes — that judgment is what this review is for.',
    '',
    'Rows are sorted riskiest-first inside each make. The review evidence includes the article repair',
    'clauses, the mapping source, catalog aliases, engine scope, and any part-type relaxation.',
    '',
    '| ✓ | article | proposed part | alt | fits |',
    '|---|---|---|---|---|',
  ];

  for (const [make, list] of [...byMake.entries()].sort((a, b) => b[1].length - a[1].length)) {
    out.push(`| | **${make} — ${list.length}** | | | |`);
    for (const p of list.sort((a, b) => risk(b) - risk(a))) {
      const m = meta.get(p.id);
      const primary = p.parts[0]!;
      const alt = p.parts[1];
      const primaryPartNumber = primary.aftermarketXref?.[0]?.trim();
      const alternatePartNumber = alt?.aftermarketXref?.[0]?.trim();
      if (!primaryPartNumber || (alt && !alternatePartNumber)) {
        throw new Error(`proposal ${p.id} is missing schema-compatible aftermarketXref evidence`);
      }
      const scope = (part: Part) => [
        part.fitment?.years?.length ? formatYearRange(part.fitment.years) : '',
        part.fitment?.engines?.length ? `engine: ${part.fitment.engines.join(', ')}` : '',
        part.fitment?.catalogModels?.length ? `catalog: ${part.fitment.catalogModels.join(', ')}` : '',
      ].filter(Boolean).join('; ') || 'unscoped';
      const evidence = [
        `primary scope: ${scope(primary)}`,
        ...(alt ? [`alternate scope: ${scope(alt)}`, `alternate component: ${alt.component}`] : []),
        `mapped from ${p.mappedFrom || 'unknown'}: ${p.partTypeMatch || 'missing'}`,
        `solution: ${repairEvidence(m?.solution)}`,
        p.partTypeRelaxedTo ? `relaxed: ${p.partTypeRelaxedTo}` : '',
        p.modelResolvedBy || '',
      ].filter(Boolean).join('; ');
      const flag = risk(p) >= 4 ? '⚠️' : '';
      out.push(
        `| ${flag} | ${(m?.title || p.id).replace(/\|/g, '/').slice(0, 72)} `
        + `| ${primary.supplier} \`${primaryPartNumber}\` — ${primary.component} `
        + `| ${alt ? `${alt.supplier} \`${alternatePartNumber}\`` : '—'} `
        + `| ${evidence || 'unscoped'} |`,
      );
    }
  }

  fs.writeFileSync('data/_part-proposals-review.md', out.join('\n') + '\n');
  const flagged = doc.proposals.filter((p) => risk(p) >= 4).length;
  console.log(`review written: data/_part-proposals-review.md`);
  console.log(`${doc.proposals.length} rows, ${flagged} flagged for closer look`);
})().catch((e) => { console.error('ERR', e.message); process.exit(1); });
