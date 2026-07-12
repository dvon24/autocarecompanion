/**
 * Spec-DB auditor — the same evidence-gated web-search rigor fixParts got, aimed
 * at the vehicle-specs.json values that FEED part verification. A wrong spec
 * (e.g. spark plug LZFR5CI when the OEM is LZTR6AP11EG) silently poisons every
 * downstream gate: the verifier correctly refuses to match a real product to a
 * wrong spec, and the part drops. So the spec DB must be as trustworthy as the
 * parts store.
 *
 * This does NOT mutate the DB. It web-verifies each suspect field, requires a
 * CITED source for any value it asserts, and prints a diff for human approval.
 *
 *   npx tsx scripts/_spec-audit.ts
 */
import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';

const SPECS_PATH = path.join(process.cwd(), 'src/data/vehicle-specs.json');

// The vehicle under audit (proof-of-loop before scaling to the garage).
const MAKE = 'Dodge', MODEL = 'Challenger', GEN = '2015+ 6.4 SRT';
const VEHICLE = '2015-2023 Dodge Challenger SRT 392 / R/T Scat Pack (6.4L 392 HEMI)';

type FieldAudit = { field: string; label: string; current: string; question: string };

function loadGen(): Record<string, any> {
  const j = JSON.parse(fs.readFileSync(SPECS_PATH, 'utf8'));
  return j[MAKE][MODEL][GEN];
}

function buildAudits(g: Record<string, any>): FieldAudit[] {
  return [
    {
      field: 'sparkPlugs.partNumber',
      label: 'Spark plug (OEM part number)',
      current: g.sparkPlugs?.partNumber ?? '(none)',
      question: `What is the FACTORY / OEM spark plug for this engine — the exact NGK (or Mopar) part number the 6.4L 392 HEMI ships with from the factory? Confirm the plug type (platinum vs iridium), the correct gap, and the count (this engine has 16 plugs, 2 per cylinder). If the OEM plug is superseded, give the current replacement.`,
    },
    {
      field: 'oil.filterPartNumber',
      label: 'Oil filter (Mopar part number)',
      current: g.oil?.filterPartNumber ?? '(none)',
      question: `What is the correct Mopar OEM oil filter part number for this 6.4L 392 HEMI engine? Confirm it against a real product/catalog page for THIS engine (not the 5.7L). Note whether it is a spin-on or cartridge filter.`,
    },
    {
      field: 'oil.drainPlugTorque / oil.drainPlugSize',
      label: 'Oil drain plug (size + torque)',
      current: `${g.oil?.drainPlugSize ?? '?'}, ${g.oil?.drainPlugTorque ?? '?'}`,
      question: `What is the factory oil drain plug bolt/hex size AND the torque spec for the 6.4L 392 HEMI oil pan drain plug? Give the value from a service-manual-grade source.`,
    },
    {
      field: 'differentials.rear.capacity',
      label: 'Rear differential fluid capacity + spec',
      current: `${g.differentials?.rear?.capacity ?? '?'} — ${g.differentials?.rear?.type ?? '?'}`,
      question: `What is the rear axle (differential) fluid CAPACITY in quarts AND the correct gear oil spec for this vehicle's rear axle? This is a 8.25"/9.25" axle — confirm the true fill capacity (a full-size RWD car axle is typically well under 3 qt) and the exact viscosity (e.g. 75W-140 synthetic GL-5, limited-slip). Flag if a friction modifier is required.`,
    },
  ];
}

async function auditField(client: Anthropic, a: FieldAudit) {
  const prompt = `You are an OEM factory-spec auditor for au7o. USE WEB SEARCH — never answer from memory. You verify ONE factory specification for ONE vehicle to a strict, cited standard.

Vehicle: ${VEHICLE}
Spec field: ${a.label}
Au7o's CURRENT stored value (may be WRONG — that's what you're checking): ${a.current}

Question: ${a.question}

RULES (a wrong spec silently breaks part verification downstream — correctness is the product):
- Determine the CORRECT value from real sources you actually open via search (OEM catalog, service manual, reputable forum/vendor confirming the OEM number). Never assert a value you did not find in a source.
- If the current stored value is CORRECT, say so (verdict "confirm").
- If it is WRONG, give the corrected value (verdict "correct").
- If sources genuinely disagree or it varies by build/axle, verdict "ambiguous" and describe BOTH in "corrected" with the condition for each.
- If you cannot find a citable source, verdict "unknown" — do NOT guess.
- "citation" MUST be a real URL you opened during this search that supports your value.

Return ONLY JSON, no prose:
{"verdict":"confirm"|"correct"|"ambiguous"|"unknown","corrected":"<the correct value, concise>","confidence":"high"|"medium"|"low","citation":"<supporting url>","notes":"<one short line of reasoning>"}`;

  let msg;
  try {
    msg = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 4000,
      tools: [{ type: 'web_search_20250305' as unknown as 'web_search_20250305', name: 'web_search', max_uses: 5 } as never],
      messages: [{ role: 'user', content: prompt }],
    });
  } catch (e) { return { field: a.field, error: String(e) }; }

  let text = '';
  const searchUrls: string[] = [];
  for (const b of msg.content as unknown as Array<Record<string, unknown>>) {
    if (b.type === 'text' && typeof b.text === 'string') text += b.text;
    if (b.type === 'web_search_tool_result' && Array.isArray(b.content)) {
      for (const r of b.content as unknown as Array<Record<string, unknown>>) {
        if (r.type === 'web_search_result' && typeof r.url === 'string') searchUrls.push(r.url);
      }
    }
  }
  const m = text.replace(/```json/g, '').replace(/```/g, '').match(/\{[\s\S]*\}/);
  if (!m) return { field: a.field, error: 'no JSON', raw: text.slice(0, 300) };
  let j: any;
  try { j = JSON.parse(m[0]); } catch { return { field: a.field, error: 'bad JSON', raw: text.slice(0, 300) }; }
  return { field: a.field, label: a.label, current: a.current, searches: searchUrls.length, ...j };
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) { console.error('No ANTHROPIC_API_KEY'); process.exit(1); }
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const g = loadGen();
  let audits = buildAudits(g);
  // Optional: pass field-name substrings to run only those (re-run failures cheaply).
  const only = process.argv.slice(2);
  if (only.length) audits = audits.filter((a) => only.some((o) => a.field.toLowerCase().includes(o.toLowerCase())));

  console.log(`\n=== SPEC AUDIT: ${VEHICLE} ===\n`);
  const results = [];
  for (const a of audits) {
    process.stdout.write(`Auditing ${a.label}... `);
    const r = await auditField(client, a);
    results.push(r);
    console.log((r as any).verdict ? (r as any).verdict.toUpperCase() : 'ERROR');
  }

  console.log('\n\n========== PROPOSED CORRECTIONS ==========\n');
  for (const r of results as any[]) {
    const flag = r.verdict === 'confirm' ? '✓ OK' : r.verdict === 'correct' ? '✗ FIX' : r.verdict === 'ambiguous' ? '~ AMBIGUOUS' : r.verdict === 'unknown' ? '? UNKNOWN' : '! ERROR';
    console.log(`[${flag}] ${r.label || r.field}`);
    console.log(`   field:     ${r.field}`);
    console.log(`   current:   ${r.current ?? '(n/a)'}`);
    if (r.corrected) console.log(`   corrected: ${r.corrected}`);
    if (r.confidence) console.log(`   confidence:${r.confidence}`);
    if (r.citation) console.log(`   source:    ${r.citation}`);
    if (r.notes) console.log(`   notes:     ${r.notes}`);
    if (r.error) console.log(`   ERROR:     ${r.error}`);
    console.log('');
  }

  fs.writeFileSync(path.join(process.cwd(), 'scripts/_spec-audit-out.json'), JSON.stringify(results, null, 2));
  console.log('Full results → scripts/_spec-audit-out.json');
}

main();
