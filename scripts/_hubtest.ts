/**
 * Live hub-chat test harness. Shows the FULL pipeline for a question:
 *   1) the vehicle block injected into the system prompt
 *   2) the RAW model output (markers visible — reveals link vomit)
 *   3) each [[PART:...]] marker resolved against the record store (what renders)
 *
 * Uses the REAL STATIC_SYSTEM_PROMPT (read from the route file so it never drifts)
 * + the real getVehicleSpecs grounding + the real getCachedVerifiedPart resolver.
 *
 * Usage: DOTENV_CONFIG_PATH=.env.local npx tsx scripts/_hubtest.ts "your question"
 */
import 'dotenv/config';
import { readFileSync } from 'fs';
import { getVehicleSpecs } from '@/lib/maintenance';
import { getCachedVerifiedPart } from '@/lib/verified-parts';
import { matchSupply } from '@/data/supplies-catalog';

const V = { year: 2015, make: 'Dodge', model: 'Challenger', trim: 'SRT 392' };
const question = process.argv[2] || 'my radiator is leaking from underneath the reservoir, not sure what is going on';

// Extract the real STATIC_SYSTEM_PROMPT (no backticks inside it, so slice to first `;).
const route = readFileSync('src/app/api/hub-chat/route.ts', 'utf8');
const start = route.indexOf('const STATIC_SYSTEM_PROMPT = `') + 'const STATIC_SYSTEM_PROMPT = `'.length;
const STATIC = route.slice(start, route.indexOf('`;', start));

// Minimal vehicle block with spec grounding (mirrors buildVehicleBlock's spec part).
const specs = getVehicleSpecs(V) as unknown as Record<string, unknown> | null;
const fmt = (v: unknown) => (v && typeof v === 'object' ? Object.entries(v as Record<string, unknown>).map(([k, x]) => `${k}: ${typeof x === 'object' ? JSON.stringify(x) : x}`).join(', ') : String(v));
const specRows = specs ? ['oil', 'coolant', 'transmission', 'differentials', 'brakeFluid', 'sparkPlugs'].filter((k) => specs[k]).map((k) => `- ${k}: ${fmt(specs[k])}`) : [];
const vehicleBlock = `Active vehicle: 2015 Dodge Challenger SRT 392, ~155,000 miles.${specRows.length ? `\nVERIFIED FACTORY SPECS (use exact values):\n${specRows.join('\n')}` : ''}`;

async function main() {
  console.log('════ USER QUESTION ════\n' + question + '\n');
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({ model: 'gpt-5.5', max_completion_tokens: 4000, messages: [ { role: 'system', content: STATIC + '\n\n' + vehicleBlock }, { role: 'user', content: question } ] }),
  });
  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content || JSON.stringify(data).slice(0, 300);
  const markers = [...raw.matchAll(/\[\[PART:\s*([^\]]+?)\s*\]\]/g)].map((m) => m[1]);

  console.log('════ RAW MODEL OUTPUT (markers visible) ════\n' + raw + '\n');
  console.log(`════ MARKER COUNT: ${markers.length} ════`);
  for (const inner of markers) {
    const name = inner.split('||')[0].trim();
    const supply = matchSupply(name);
    if (supply) { console.log(`  [supply] ${name} → clean Amazon (routed out of per-vehicle verify)`); continue; }
    const h = await getCachedVerifiedPart(V, name);
    if (h?.buyUrl) console.log(`  [verified] ${name} → PN ${h.partNumber || '-'} | ${(h.buyLinks || []).map((l) => l.vendor).join(', ')}`);
    else console.log(`  [fallback] ${name} → no verified record → honest Amazon search`);
  }
  process.exit(0);
}
main();
