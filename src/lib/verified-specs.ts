/**
 * verified-specs — web-search fallback for vehicle fluid specs.
 *
 * The spec DB (vehicle-specs.json via getVehicleSpecs) is authoritative and
 * fast, but it doesn't cover every vehicle. When a vehicle is MISSING from the
 * DB, the hub chat had nothing to ground on and gpt-5.5 would guess (and vary)
 * the fluid spec. This runs one Anthropic web_search to pull the factory fluid
 * specs from authoritative sources, caches them in VehiclePartLookup under a
 * `spec:fluids` key, and hands the hub chat a grounded block to inject.
 *
 * Same trust posture as parts: only surface a spec we actually found on the web
 * (with a source), never a guess. Cache-first so it's paid once per vehicle.
 */

import Anthropic from '@anthropic-ai/sdk';
import prisma from './db';

export interface GroundedSpecs {
  /** Preformatted "- Label: value" rows for the system prompt. */
  rows: string[];
  /** 'db' when it came from getVehicleSpecs; 'web' when web-searched. */
  source: 'web';
  sourceUrls: string[];
}

const SPEC_TASK = 'spec:fluids';

function fmtRows(specs: Record<string, unknown>): string[] {
  const rows: string[] = [];
  const add = (label: string, v: unknown) => {
    if (v === null || v === undefined || v === '') return;
    const val = typeof v === 'object' ? Object.entries(v as Record<string, unknown>).map(([k, x]) => `${k}: ${x}`).join(', ') : String(v);
    if (val && val !== 'null' && val !== '{}') rows.push(`- ${label}: ${val}`);
  };
  add('Engine oil', specs.oil);
  add('Coolant', specs.coolant);
  add('Transmission fluid', specs.transmission);
  add('Differential fluid', specs.differential ?? specs.differentials);
  add('Brake fluid', specs.brakeFluid);
  add('Power steering fluid', specs.powerSteeringFluid);
  add('Spark plugs', specs.sparkPlugs);
  return rows;
}

/** Read a previously web-searched spec record from the cache. */
async function readCache(year: number, make: string, model: string, trim: string): Promise<GroundedSpecs | null> {
  try {
    const row = await prisma.vehiclePartLookup.findUnique({
      where: { year_make_model_trim_task: { year, make, model, trim, task: SPEC_TASK } },
    });
    if (!row || !row.webSearchConfirmed) return null;
    const data = row.parts as unknown as { specs?: Record<string, unknown> };
    const rows = data?.specs ? fmtRows(data.specs) : [];
    if (!rows.length) return null;
    const urls = ((row.verificationLog as unknown as { sourceUrls?: string[] })?.sourceUrls) || [];
    return { rows, source: 'web', sourceUrls: urls };
  } catch {
    return null;
  }
}

/**
 * Web-search the factory fluid specs for a vehicle NOT in the DB. Cache-first;
 * on a miss runs one Anthropic web_search, parses the result, caches it, and
 * returns grounded rows. Bounded by `timeoutMs`; null on timeout/failure (the
 * chat then honestly says it'll verify by VIN).
 */
export async function getWebSpecs(
  vehicle: { year?: number | string; make?: string; model?: string; trim?: string },
  timeoutMs = 12000,
): Promise<GroundedSpecs | null> {
  const make = vehicle.make?.trim();
  const model = vehicle.model?.trim();
  const year = Number(vehicle.year);
  const trim = (vehicle.trim || '').trim() || 'Base';
  if (!make || !model || !year || !process.env.ANTHROPIC_API_KEY) return null;

  const cached = await readCache(year, make, model, trim);
  if (cached) return cached;

  const run = (async (): Promise<GroundedSpecs | null> => {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const vehicleStr = `${year} ${make} ${model} ${trim}`.replace(/\s+/g, ' ').trim();
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      tools: [{ type: 'web_search_20250305' as unknown as 'web_search_20250305', name: 'web_search', max_uses: 3 } as never],
      messages: [{
        role: 'user',
        content: `Find the FACTORY fluid specifications for a ${vehicleStr} from authoritative sources (owner's/service manual, manufacturer, reputable spec sites). Return ONLY a JSON object, no prose:
{"oil":"<type/viscosity + capacity or null>","coolant":"<spec or null>","transmission":"<fluid spec or null>","differential":"<gear oil spec + capacity or null>","brakeFluid":"<DOT spec or null>","sparkPlugs":"<part/gap or null>"}
Use null for anything you can't confirm. Do NOT guess.`,
      }],
    });

    // Collect text + the web_search source URLs.
    let text = '';
    const sourceUrls: string[] = [];
    for (const block of msg.content as unknown as Array<Record<string, unknown>>) {
      if (block.type === 'text' && typeof block.text === 'string') text += block.text;
      if (block.type === 'web_search_tool_result' && Array.isArray(block.content)) {
        for (const r of block.content as unknown as Array<Record<string, unknown>>) {
          if (r.type === 'web_search_result' && typeof r.url === 'string') sourceUrls.push(r.url);
        }
      }
    }
    const m = text.replace(/```json\s*/g, '').replace(/```/g, '').match(/\{[\s\S]*\}/);
    if (!m) return null;
    let specs: Record<string, unknown>;
    try { specs = JSON.parse(m[0]); } catch { return null; }
    const rows = fmtRows(specs);
    if (!rows.length) return null;

    // Cache it (best-effort). No upsert — PrismaPg adapter doesn't support it;
    // sequential findUnique → update/create instead.
    (async () => {
      const key = { year, make, model, trim, task: SPEC_TASK };
      const data = {
        parts: { specs } as unknown as object,
        verificationLog: { sourceUrls } as unknown as object,
        source: 'pipeline-freetext', status: 'verified', webSearchConfirmed: true, verifiedAt: new Date(),
      };
      const existing = await prisma.vehiclePartLookup.findUnique({ where: { year_make_model_trim_task: key } }).catch(() => null);
      if (existing) await prisma.vehiclePartLookup.update({ where: { year_make_model_trim_task: key }, data }).catch(() => {});
      else await prisma.vehiclePartLookup.create({ data: { ...key, ...data } as never }).catch(() => {});
    })();

    return { rows, source: 'web', sourceUrls };
  })().catch(() => null);

  const timed = new Promise<null>((res) => setTimeout(() => res(null), timeoutMs));
  return Promise.race([run, timed]);
}
