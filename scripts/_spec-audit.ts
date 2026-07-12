/**
 * Spec-DB auditor — the same evidence-gated web-search rigor fixParts got, aimed
 * at the vehicle-specs.json values that FEED part verification. A wrong spec
 * (e.g. the 3.6L V6 oil filter stamped on a V8 Hemi) silently poisons every
 * downstream gate: the verifier correctly refuses to match a real product to a
 * wrong spec, and the part drops.
 *
 * This does NOT mutate the DB. It web-verifies each field, requires a CITED
 * source for any value it asserts, and writes a consolidated diff for approval.
 *
 * Target-driven: TARGETS lists the (make, model, gen) blocks to audit with a
 * plain-English vehicle description; per-block field questions are built from
 * the block's own engine string so the V8 (not the V6 half of a mixed block) is
 * what gets verified. Runs items concurrently with a small cap.
 *
 *   npx tsx scripts/_spec-audit.ts            # audit all TARGETS
 *   npx tsx scripts/_spec-audit.ts Charger    # only blocks whose key matches
 */
import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';

const SPECS_PATH = path.join(process.cwd(), 'src/data/vehicle-specs.json');
const CONCURRENCY = 4;

// The Mopar V8/Hemi family — batch 1 of the systemic audit. Each entry names the
// V8 engine(s) so the questions target the contaminated (V8) half of mixed blocks.
const TARGETS: Array<{ make: string; model: string; gen: string; desc: string; v8: string }> = [
  { make: 'Dodge', model: 'Charger', gen: '2015+', desc: '2015-2023 Dodge Charger', v8: '5.7L V8 HEMI (R/T)' },
  { make: 'Dodge', model: 'Challenger', gen: '2015+ 5.7 Hemi/R/T', desc: '2015-2023 Dodge Challenger R/T', v8: '5.7L V8 HEMI (Eagle, MDS)' },
  { make: 'Dodge', model: 'Challenger', gen: '2015+ Hellcat/Redeye', desc: '2015-2023 Dodge Challenger SRT Hellcat / Redeye', v8: '6.2L Supercharged V8 HEMI' },
  { make: 'Dodge', model: 'Durango', gen: '2014+', desc: '2014+ Dodge Durango', v8: '5.7L V8 HEMI' },
  { make: 'Chrysler', model: '300', gen: '2015+', desc: '2015-2023 Chrysler 300', v8: '5.7L V8 HEMI (300C / 300S)' },
  { make: 'Jeep', model: 'Grand Cherokee', gen: '2022+', desc: '2022+ Jeep Grand Cherokee (WL)', v8: '5.7L V8 HEMI' },
  { make: 'RAM', model: '1500', gen: '2019+', desc: '2019+ RAM 1500 (DT)', v8: '5.7L V8 HEMI (eTorque avail)' },
  { make: 'RAM', model: '2500', gen: '2019+ Gas', desc: '2019+ RAM 2500 Heavy Duty (gas)', v8: '6.4L V8 HEMI' },
  { make: 'RAM', model: '3500', gen: '2019+ Gas', desc: '2019+ RAM 3500 Heavy Duty (gas)', v8: '6.4L V8 HEMI' },
  { make: 'RAM', model: '1500 Classic', gen: '2019+', desc: '2019-2024 RAM 1500 Classic', v8: '5.7L V8 HEMI' },
];

type FieldAudit = { blockKey: string; field: string; label: string; current: string; question: string };

function loadSpecs(): Record<string, any> { return JSON.parse(fs.readFileSync(SPECS_PATH, 'utf8')); }

function buildAuditsForTarget(j: Record<string, any>, t: (typeof TARGETS)[number]): FieldAudit[] {
  const g = j[t.make]?.[t.model]?.[t.gen];
  if (!g) return [];
  const blockKey = `${t.make} ${t.model} [${t.gen}]`;
  const audits: FieldAudit[] = [];

  audits.push({
    blockKey, field: 'sparkPlugs.partNumber', label: `${t.v8} spark plug`,
    current: g.sparkPlugs?.partNumber ?? '(none)',
    question: `What is the FACTORY / OEM spark plug (NGK or Mopar part number) for the ${t.v8} in the ${t.desc}? Confirm plug type (platinum/iridium/copper), gap, and count. If the stored value is the wrong engine's plug (e.g. the 5.7L's plug on a 6.2/6.4, or a V6 plug), correct it. If superseded, give the current replacement.`,
  });
  audits.push({
    blockKey, field: 'oil.filterPartNumber', label: `${t.v8} oil filter`,
    current: g.oil?.filterPartNumber ?? '(none)',
    question: `What is the correct Mopar OEM oil filter part number for the ${t.v8} in the ${t.desc}? The V8 HEMI uses a SPIN-ON filter; 68191349AC is the 3.6L V6 CARTRIDGE and is WRONG for the V8. Give the V8's spin-on part number (e.g. the MO-899 / 04884899 family, or the correct 5.7L number) verified against a real product/catalog page for THIS engine.`,
  });
  if (g.differentials?.rear) {
    audits.push({
      blockKey, field: 'differentials.rear', label: 'Rear differential fluid + capacity',
      current: `${g.differentials.rear.capacity ?? '?'} — ${g.differentials.rear.type ?? '?'}`,
      question: `What is the rear axle fluid CAPACITY (quarts) and correct gear-oil spec for the ${t.desc} (${t.v8})? Identify the axle first. Heavy-duty truck axles (e.g. AAM 11.5"/11.8" on RAM 2500/3500) genuinely use 75W-140 — CONFIRM if so. But a 2015+ RWD-car ZF axle or a light SUV axle may take a lighter oil (75W-85/75W-90) and a smaller fill — correct if the stored 75W-140/2.5qt is the wrong axle. Flag if a friction modifier / LSD additive is required.`,
    });
  }
  return audits;
}

async function auditField(client: Anthropic, a: FieldAudit) {
  const prompt = `You are an OEM factory-spec auditor for au7o. USE WEB SEARCH — never answer from memory. You verify ONE factory specification for ONE vehicle to a strict, cited standard.

Spec field: ${a.label}  (block: ${a.blockKey})
Au7o's CURRENT stored value (may be WRONG — that's what you're checking): ${a.current}

Question: ${a.question}

RULES (a wrong spec silently breaks part verification downstream — correctness is the product):
- Determine the CORRECT value from real sources you open via search (OEM catalog, service manual, reputable vendor/forum confirming the OEM number). Never assert a value you did not find.
- If the current stored value is CORRECT, verdict "confirm".
- If WRONG, verdict "correct" with the corrected value.
- If sources genuinely disagree or it varies by build/axle, verdict "ambiguous" and describe BOTH with the condition for each.
- If you cannot find a citable source, verdict "unknown" — do NOT guess.
- "citation" MUST be a real URL you opened that supports your value.

Return ONLY JSON, no prose:
{"verdict":"confirm"|"correct"|"ambiguous"|"unknown","corrected":"<the correct value, concise>","confidence":"high"|"medium"|"low","citation":"<supporting url>","notes":"<one short line>"}`;

  let msg;
  try {
    msg = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 4000,
      tools: [{ type: 'web_search_20250305' as unknown as 'web_search_20250305', name: 'web_search', max_uses: 5 } as never],
      messages: [{ role: 'user', content: prompt }],
    });
  } catch (e) { return { ...a, verdict: 'error', error: String(e) }; }

  let text = '';
  for (const b of msg.content as unknown as Array<Record<string, unknown>>) {
    if (b.type === 'text' && typeof b.text === 'string') text += b.text;
  }
  const m = text.replace(/```json/g, '').replace(/```/g, '').match(/\{[\s\S]*\}/);
  if (!m) return { ...a, verdict: 'error', error: 'no JSON', raw: text.slice(0, 200) };
  try { return { ...a, ...JSON.parse(m[0]) }; } catch { return { ...a, verdict: 'error', error: 'bad JSON', raw: text.slice(0, 200) }; }
}

async function runPool<T, R>(items: T[], n: number, fn: (x: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length) as R[];
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
    while (i < items.length) { const idx = i++; out[idx] = await fn(items[idx]); }
  }));
  return out;
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) { console.error('No ANTHROPIC_API_KEY'); process.exit(1); }
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const j = loadSpecs();
  const filter = process.argv.slice(2);
  const targets = filter.length ? TARGETS.filter((t) => filter.some((f) => `${t.make} ${t.model} ${t.gen}`.toLowerCase().includes(f.toLowerCase()))) : TARGETS;

  const allAudits = targets.flatMap((t) => buildAuditsForTarget(j, t));
  console.log(`\n=== SYSTEMIC SPEC AUDIT: Mopar V8 family — ${targets.length} blocks, ${allAudits.length} fields ===\n`);

  const results = await runPool(allAudits, CONCURRENCY, async (a) => {
    const r = await auditField(client, a);
    console.log(`  [${(r as any).verdict || '?'}]`.padEnd(14) + `${a.blockKey} :: ${a.label}`);
    return r;
  });

  // Group by block for the approval report.
  console.log('\n\n========== PROPOSED CORRECTIONS (grouped by block) ==========\n');
  const byBlock = new Map<string, any[]>();
  for (const r of results as any[]) { if (!byBlock.has(r.blockKey)) byBlock.set(r.blockKey, []); byBlock.get(r.blockKey)!.push(r); }
  for (const [block, items] of byBlock) {
    console.log(`### ${block}`);
    for (const r of items) {
      const flag = r.verdict === 'confirm' ? '✓ OK' : r.verdict === 'correct' ? '✗ FIX' : r.verdict === 'ambiguous' ? '~ AMBIG' : r.verdict === 'unknown' ? '? UNK' : '! ERR';
      console.log(`  [${flag}] ${r.label}`);
      console.log(`     current:   ${r.current}`);
      if (r.corrected) console.log(`     corrected: ${r.corrected}`);
      if (r.confidence) console.log(`     conf: ${r.confidence}   source: ${r.citation || '(none)'}`);
      if (r.notes) console.log(`     notes: ${r.notes}`);
      if (r.error) console.log(`     ERROR: ${r.error}`);
    }
    console.log('');
  }

  fs.writeFileSync(path.join(process.cwd(), 'scripts/_spec-audit-out.json'), JSON.stringify(results, null, 2));
  const fixes = (results as any[]).filter((r) => r.verdict === 'correct' || r.verdict === 'ambiguous').length;
  console.log(`SUMMARY: ${results.length} fields · ${fixes} need correction/review · full data → scripts/_spec-audit-out.json`);
}

main();
