import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getVehicleSpecs } from '@/lib/maintenance';
import { knownIssuesLimiter, getClientIp, rateLimitResponse } from '@/lib/rate-limit';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const TIMEOUT_MS = 25000;

// Tasks and what we need the AI to look up for each
const TASK_PROMPTS: Record<string, string> = {
  oil_change:
    'Motor oil type and weight (e.g. 0W-20 Full Synthetic), oil capacity with filter, oil filter part number (OEM and common aftermarket like Mobil 1, Fram, Wix), drain plug socket size, drain plug torque spec.',
  spark_plugs:
    'Spark plug part number (OEM and aftermarket like NGK, Denso), spark plug gap, quantity needed, torque spec for installation.',
  brake_inspection:
    'Brake fluid type (DOT 3, DOT 4, etc.), front brake pad part number or type, rear brake pad part number or type if different, front rotor size and part number, rear rotor size and part number.',
  coolant_flush:
    'Coolant type (color and brand specification e.g. Dexcool, Toyota Super Long Life pink), total system capacity.',
  transmission_fluid:
    'Transmission fluid type/specification (e.g. Dexron VI, Toyota WS, CVT fluid), capacity for a drain and fill.',
  air_filter:
    'Engine air filter part number (OEM and common aftermarket like K&N, Fram).',
  cabin_filter:
    'Cabin air filter part number (OEM and common aftermarket).',
  wiper_blades:
    'Wiper blade sizes: driver side length, passenger side length, rear (if applicable). Include common brand part numbers (Bosch, Rain-X).',
  battery:
    'Battery group size, CCA (cold cranking amps) recommendation, battery location (under hood, trunk, under seat, etc.).',
  differential_fluid:
    'Rear differential fluid type and capacity. Front differential fluid type and capacity if AWD/4WD.',
  bulb_replacement:
    'Low beam headlight bulb number, high beam bulb number, front turn signal bulb, rear turn signal bulb, tail/brake light bulb, fog light bulb (if applicable).',
  tire_rotation:
    'Lug nut or lug bolt socket size, lug nut/bolt torque specification in ft-lbs. Note if vehicle uses lug bolts (European) vs lug nuts.',
};

interface PartResult {
  name: string;
  spec: string;
  detail?: string;
  partNumber?: string;
  searchQuery: string;
  crossReferences?: { brand: string; partNumber: string }[];
  confidence: 'oem-verified' | 'high' | 'moderate';
  quantity?: number;
  oemBrand?: string;
}

/**
 * GET /api/parts?year=2019&make=Chevrolet&model=Camaro&trim=ZL1&task=oil_change
 *
 * Resolution order:
 * 1. Static vehicle-specs.json
 * 2. Database cache (VehiclePartLookup)
 * 3. AI lookup → saves to DB
 */
export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  if (!knownIssuesLimiter.check(ip)) {
    return rateLimitResponse(60);
  }

  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get('year') || '', 10);
  const make = searchParams.get('make') || '';
  const model = searchParams.get('model') || '';
  const trim = searchParams.get('trim') || '';
  const task = searchParams.get('task') || '';

  if (!year || !make || !model || !trim || !task) {
    return NextResponse.json(
      { error: 'Missing required params: year, make, model, trim, task' },
      { status: 400 }
    );
  }

  if (!TASK_PROMPTS[task]) {
    return NextResponse.json(
      { error: `Unknown task: ${task}` },
      { status: 400 }
    );
  }

  // 1. Try static vehicle-specs.json
  const staticParts = getStaticParts(year, make, model, trim, task);
  if (staticParts && staticParts.length > 0) {
    return NextResponse.json({ parts: staticParts, source: 'static' });
  }

  // 2. Try database cache
  try {
    const cached = await prisma.vehiclePartLookup.findUnique({
      where: {
        year_make_model_trim_task: { year, make, model, trim, task },
      },
    });
    if (cached) {
      return NextResponse.json({
        parts: cached.parts as unknown as PartResult[],
        source: cached.source,
      });
    }
  } catch {
    // DB error — fall through to AI
  }

  // 3. AI lookup
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Parts lookup unavailable — AI service not configured' },
      { status: 503 }
    );
  }

  try {
    const parts = await lookupPartsWithAI(year, make, model, trim, task, apiKey);

    // Save to DB for next time (fire-and-forget)
    prisma.vehiclePartLookup
      .upsert({
        where: {
          year_make_model_trim_task: { year, make, model, trim, task },
        },
        create: { year, make, model, trim, task, parts: JSON.parse(JSON.stringify(parts)), source: 'ai' },
        update: { parts: JSON.parse(JSON.stringify(parts)), source: 'ai', updatedAt: new Date() },
      })
      .catch(() => {});

    return NextResponse.json({ parts, source: 'ai' });
  } catch (err) {
    console.error('[Parts API] AI lookup failed:', err);
    return NextResponse.json(
      { error: 'Failed to look up parts. Please try again.' },
      { status: 500 }
    );
  }
}

// ─── Static Specs Extraction ───────────────────────────────────────────

function getStaticParts(
  year: number,
  make: string,
  model: string,
  trim: string,
  task: string
): PartResult[] | null {
  const specs = getVehicleSpecs({ year, make, model, trim });
  if (!specs) return null;

  const parts: PartResult[] = [];

  switch (task) {
    case 'oil_change':
      if (!specs.oil) return null;
      parts.push({
        name: 'Motor Oil',
        spec: specs.oil.type,
        detail: specs.oil.capacity,
        searchQuery: specs.oil.type + ' motor oil',
        confidence: 'oem-verified',
      });
      parts.push({
        name: 'Oil Filter',
        spec: specs.oil.filterPartNumber,
        detail: specs.oil.filterLocation,
        searchQuery: specs.oil.filterPartNumber + ' oil filter',
        partNumber: specs.oil.filterPartNumber,
        confidence: 'oem-verified',
      });
      break;

    case 'spark_plugs':
      if (!specs.sparkPlugs) return null;
      parts.push({
        name: 'Spark Plugs',
        spec: specs.sparkPlugs.partNumber,
        detail: `Qty: ${specs.sparkPlugs.quantity} | Gap: ${specs.sparkPlugs.gap} | Torque: ${specs.sparkPlugs.torque}`,
        searchQuery: specs.sparkPlugs.partNumber + ' spark plug',
        partNumber: specs.sparkPlugs.partNumber,
        quantity: specs.sparkPlugs.quantity,
        confidence: 'oem-verified',
      });
      break;

    case 'brake_inspection':
      if (!specs.brakeFluid) return null;
      parts.push({
        name: 'Brake Fluid',
        spec: specs.brakeFluid.type,
        searchQuery: specs.brakeFluid.type + ' brake fluid',
        confidence: 'oem-verified',
      });
      break;

    case 'coolant_flush':
      if (!specs.coolant) return null;
      parts.push({
        name: 'Coolant',
        spec: specs.coolant.type,
        detail: specs.coolant.capacity,
        searchQuery: specs.coolant.type + ' coolant',
        confidence: 'oem-verified',
      });
      break;

    case 'transmission_fluid':
      if (!specs.transmission) return null;
      parts.push({
        name: 'Transmission Fluid',
        spec: specs.transmission.type,
        detail: specs.transmission.capacity,
        searchQuery: specs.transmission.type + ' transmission fluid',
        confidence: 'oem-verified',
      });
      break;

    case 'differential_fluid':
      if (!specs.differentials) return null;
      if (specs.differentials.rear) {
        parts.push({
          name: 'Rear Differential Fluid',
          spec: specs.differentials.rear.type,
          detail: specs.differentials.rear.capacity,
          searchQuery: specs.differentials.rear.type + ' differential fluid',
          confidence: 'oem-verified',
        });
      }
      if (specs.differentials.front) {
        parts.push({
          name: 'Front Differential Fluid',
          spec: specs.differentials.front.type,
          detail: specs.differentials.front.capacity,
          searchQuery: specs.differentials.front.type + ' differential fluid',
          confidence: 'oem-verified',
        });
      }
      break;

    case 'bulb_replacement':
      if (!specs.bulbs) return null;
      if (specs.bulbs.headlightLow)
        parts.push({ name: 'Low Beam', spec: specs.bulbs.headlightLow, searchQuery: specs.bulbs.headlightLow + ' headlight bulb', partNumber: specs.bulbs.headlightLow, confidence: 'oem-verified' });
      if (specs.bulbs.headlightHigh)
        parts.push({ name: 'High Beam', spec: specs.bulbs.headlightHigh, searchQuery: specs.bulbs.headlightHigh + ' headlight bulb', partNumber: specs.bulbs.headlightHigh, confidence: 'oem-verified' });
      if (specs.bulbs.fogLight)
        parts.push({ name: 'Fog Light', spec: specs.bulbs.fogLight, searchQuery: specs.bulbs.fogLight + ' fog light bulb', partNumber: specs.bulbs.fogLight, confidence: 'oem-verified' });
      if (specs.bulbs.taillight)
        parts.push({ name: 'Tail Light', spec: specs.bulbs.taillight, searchQuery: specs.bulbs.taillight + ' tail light bulb', partNumber: specs.bulbs.taillight, confidence: 'oem-verified' });
      if (specs.bulbs.brakeLight)
        parts.push({ name: 'Brake Light', spec: specs.bulbs.brakeLight, searchQuery: specs.bulbs.brakeLight + ' brake light bulb', partNumber: specs.bulbs.brakeLight, confidence: 'oem-verified' });
      break;

    case 'tire_rotation':
      if (!specs.lug) return null;
      parts.push({
        name: specs.lug.useBolts ? 'Lug Bolts' : 'Lug Nuts',
        spec: `${specs.lug.size} socket`,
        detail: `Torque: ${specs.lug.torque}`,
        searchQuery: specs.lug.useBolts ? 'lug bolts' : 'lug nuts',
        confidence: 'oem-verified',
      });
      break;

    // These don't have static data — always go to AI
    case 'air_filter':
    case 'cabin_filter':
    case 'wiper_blades':
    case 'battery':
      return null;

    default:
      return null;
  }

  return parts.length > 0 ? parts : null;
}

// ─── AI Lookup ─────────────────────────────────────────────────────────

async function lookupPartsWithAI(
  year: number,
  make: string,
  model: string,
  trim: string,
  task: string,
  apiKey: string
): Promise<PartResult[]> {
  const taskPrompt = TASK_PROMPTS[task];
  const vehicleStr = `${year} ${make} ${model} ${trim}`;

  const systemPrompt = `You are an automotive parts specialist. Look up the exact parts and specifications for a specific vehicle.

Vehicle: ${vehicleStr}
Task: ${task.replace(/_/g, ' ')}

Look up: ${taskPrompt}

IMPORTANT:
- Use OEM part numbers and specifications from the owner's manual and service manual for this exact vehicle.
- Include both OEM and popular aftermarket cross-reference part numbers.
- Be specific to this exact year, make, model, and trim. Different trims may have different specifications.
- If this vehicle has multiple engine options for the same trim, note the most common one.
- All specs must be accurate — do not guess. If you are not confident about a specific spec, set confidence to "moderate".
- For each part, include 2-4 aftermarket cross-references from brands like Mobil 1, Wix, Fram, NGK, Denso, ACDelco, Bosch, PowerStop, StopTech, Centric, K&N, etc.

Respond with a JSON object:
{
  "parts": [
    {
      "name": "Part Name",
      "spec": "Primary specification (e.g. part number, type, size)",
      "detail": "Additional details (capacity, torque spec, quantity, etc.)",
      "partNumber": "OEM part number",
      "oemBrand": "OEM brand name (e.g. Mopar, Toyota, Motorcraft)",
      "crossReferences": [
        { "brand": "Aftermarket Brand", "partNumber": "Part Number" }
      ],
      "quantity": 1,
      "confidence": "oem-verified or high or moderate",
      "searchQuery": "Optimized search query for finding this part online"
    }
  ]
}

Return ONLY the JSON object, no other text.`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-5.4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Look up the exact ${task.replace(/_/g, ' ')} parts for a ${vehicleStr}. Include OEM part numbers and aftermarket cross-references.` },
        ],
        max_completion_tokens: 2000,
        temperature: 0.2,
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);

    if (!parsed.parts || !Array.isArray(parsed.parts)) {
      throw new Error('Invalid AI response format');
    }

    // Validate and normalize each part
    return parsed.parts.map((p: any) => ({
      name: String(p.name || 'Unknown Part'),
      spec: String(p.spec || 'See details'),
      detail: p.detail ? String(p.detail) : undefined,
      partNumber: p.partNumber ? String(p.partNumber) : undefined,
      oemBrand: p.oemBrand ? String(p.oemBrand) : undefined,
      crossReferences: Array.isArray(p.crossReferences)
        ? p.crossReferences.map((cr: any) => ({ brand: String(cr.brand), partNumber: String(cr.partNumber) }))
        : undefined,
      quantity: typeof p.quantity === 'number' ? p.quantity : undefined,
      confidence: ['oem-verified', 'high', 'moderate'].includes(p.confidence) ? p.confidence : 'moderate',
      searchQuery: String(p.searchQuery || `${vehicleStr} ${p.name || task}`),
    }));
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}
