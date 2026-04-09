import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getVehicleSpecs } from '@/lib/maintenance';
import { knownIssuesLimiter, getClientIp, rateLimitResponse } from '@/lib/rate-limit';
import { runPartsPipeline, runFreetextPipeline, type PipelinePart, type PipelineResult } from '@/lib/parts-pipeline';

const TIMEOUT_MS = 180000; // Pipeline runs 6 agents + web search + retries — needs time

// Valid predefined tasks
const VALID_TASKS = [
  // Fluids & Filters
  'oil_change', 'coolant_flush', 'transmission_fluid', 'differential_fluid',
  'power_steering_fluid', 'brake_fluid', 'transfer_case_fluid',
  'air_filter', 'cabin_filter', 'fuel_filter',
  // Ignition & Electrical
  'spark_plugs', 'ignition_coils', 'battery', 'alternator', 'starter_motor',
  'bulb_replacement', 'oxygen_sensor',
  // Brakes & Suspension
  'brake_inspection', 'brake_calipers', 'wheel_bearing', 'shocks_struts',
  'ball_joints', 'tie_rods', 'control_arms', 'sway_bar_links',
  // Drivetrain
  'cv_axle', 'clutch_kit', 'u_joints',
  // Engine & Cooling
  'serpentine_belt', 'timing_belt', 'water_pump', 'thermostat',
  'radiator', 'fuel_pump', 'ac_compressor',
  // Gaskets & Seals
  'valve_cover_gasket', 'oil_pan_gasket', 'head_gasket', 'intake_manifold_gasket',
  // Exhaust & Emissions
  'catalytic_converter', 'muffler_exhaust',
  // Exterior & Wheels
  'wiper_blades', 'tire_rotation', 'wheel_specs',
];

interface PartResult {
  name: string;
  spec: string;
  detail?: string;
  partNumber?: string;
  searchQuery: string;
  crossReferences?: { brand: string; partNumber: string }[];
  confidence: 'oem-verified' | 'high' | 'moderate' | 'needs-review';
  confidenceReason?: string;
  quantity?: number;
  oemBrand?: string;
  summary?: string;
}

/**
 * GET /api/parts?year=2019&make=Chevrolet&model=Camaro&trim=ZL1&task=oil_change
 * GET /api/parts?year=2015&make=Dodge&model=Challenger&trim=SRT+392&q=rocker+panels
 *
 * Resolution order for predefined tasks:
 * 1. Static vehicle-specs.json
 * 2. Database cache (VehiclePartLookup)
 * 3. Claude multi-agent pipeline → saves to DB
 *
 * Free-text search (?q=rocker panels):
 * 1. Database cache
 * 2. Claude pipeline → saves to DB
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
  const freeQuery = searchParams.get('q') || '';

  // Country detection from Vercel headers
  const country = request.headers.get('x-vercel-ip-country') || 'US';

  // ─── Weekly usage limit (3 lookups/week for free users) ───────────
  const FREE_WEEKLY_LIMIT = 3;
  try {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeklyCount = await prisma.vehicleInsight.count({
      where: {
        source: 'parts_search',
        sessionHash: ip,
        createdAt: { gte: oneWeekAgo },
      },
    });
    if (weeklyCount >= FREE_WEEKLY_LIMIT) {
      // TODO: Check if user has active subscription — skip limit for subscribers
      return NextResponse.json(
        {
          error: 'Weekly limit reached',
          message: `You\u2019ve used ${weeklyCount} of ${FREE_WEEKLY_LIMIT} free parts lookups this week. Upgrade to Pro for unlimited searches.`,
          weeklyUsed: weeklyCount,
          weeklyLimit: FREE_WEEKLY_LIMIT,
          upgradeUrl: '/subscribe',
        },
        { status: 429 }
      );
    }
  } catch {
    // DB error — allow the request through rather than blocking
  }

  if (!year || !make || !model || !trim) {
    return NextResponse.json(
      { error: 'Missing required params: year, make, model, trim' },
      { status: 400 }
    );
  }

  // Must have either a valid task or a free-text query
  if (!task && !freeQuery) {
    return NextResponse.json(
      { error: 'Missing required param: task or q (free-text search)' },
      { status: 400 }
    );
  }

  if (task && !VALID_TASKS.includes(task)) {
    return NextResponse.json(
      { error: `Unknown task: ${task}. Use ?q= for free-text part search.` },
      { status: 400 }
    );
  }

  // ─── Free-text search path ────────────────────────────────────────
  if (freeQuery) {
    return handleFreetextSearch(year, make, model, trim, freeQuery, country, ip);
  }

  // ─── Predefined task path ─────────────────────────────────────────

  // 1. Try static vehicle-specs.json
  const staticParts = getStaticParts(year, make, model, trim, task);
  if (staticParts && staticParts.length > 0) {
    return NextResponse.json({ parts: staticParts, source: 'static' });
  }

  // 2. Try database cache — exact trim match first, then any trim for this generation
  try {
    let cached = await prisma.vehiclePartLookup.findUnique({
      where: {
        year_make_model_trim_task: { year, make, model, trim, task },
      },
    });
    // Fallback: seed script stores with generation trim (e.g. "Base"), user selects actual trim (e.g. "SE")
    if (!cached) {
      cached = await prisma.vehiclePartLookup.findFirst({
        where: { year, make: { equals: make, mode: 'insensitive' }, model: { equals: model, mode: 'insensitive' }, task },
      });
    }
    if (cached) {
      return NextResponse.json({
        parts: cached.parts as unknown as PartResult[],
        source: cached.source,
      });
    }
  } catch {
    // DB error — fall through to pipeline
  }

  // 3. Claude multi-agent pipeline with web verification
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'Parts lookup unavailable — AI service not configured' },
      { status: 503 }
    );
  }

  try {
    const result = await Promise.race([
      runPartsPipeline(year, make, model, trim, task),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Pipeline timeout')), TIMEOUT_MS)
      ),
    ]);

    storePipelineResult(year, make, model, trim, task, result);
    trackPartsSearch(year, make, model, trim, task, country, result.parts.length, ip);

    return NextResponse.json({
      parts: result.parts,
      unverifiedParts: result.unverifiedParts,
      source: result.source,
      overallConfidence: result.overallConfidence,
      vehicleNotes: result.vehicleNotes,
      country,
    });
  } catch (err: any) {
    console.error('[Parts API] Pipeline failed:', err.message, err.stack?.slice(0, 500));
    return NextResponse.json(
      { error: 'Failed to look up parts. Please try again.', detail: err.message },
      { status: 500 }
    );
  }
}

// ─── Store Pipeline Result in DB ──────────────────────────────────────

// ─── Track Parts Search in VehicleInsight ─────────────────────────────

function trackPartsSearch(
  year: number, make: string, model: string, trim: string,
  task: string, country: string, partsCount: number, ip: string
) {
  const title = task.startsWith('freetext:') ? task : task.replace(/_/g, ' ');
  prisma.vehicleInsight.create({
    data: {
      year, make, model, trim,
      source: 'parts_search',
      insightType: 'part_demand',
      title,
      data: { task, partsReturned: partsCount, country },
      country,
      sessionHash: ip,
    },
  }).catch(() => {});
}

function storePipelineResult(
  year: number,
  make: string,
  model: string,
  trim: string,
  task: string,
  result: PipelineResult
) {
  const hasVerified = result.parts.length > 0;
  const hasFailed = result.unverifiedParts.length > 0;
  const status = hasVerified && !hasFailed ? 'verified'
    : hasVerified && hasFailed ? 'partial'
    : 'failed';

  prisma.vehiclePartLookup
    .upsert({
      where: {
        year_make_model_trim_task: { year, make, model, trim, task },
      },
      create: {
        year,
        make,
        model,
        trim,
        task,
        parts: JSON.parse(JSON.stringify(result.parts)),
        unverifiedParts: JSON.parse(JSON.stringify(result.unverifiedParts)),
        source: result.source,
        status,
        webSearchConfirmed: hasVerified,
        verifiedAt: hasVerified ? new Date() : null,
        verificationLog: JSON.parse(JSON.stringify(result.verificationLog)),
      },
      update: {
        parts: JSON.parse(JSON.stringify(result.parts)),
        unverifiedParts: JSON.parse(JSON.stringify(result.unverifiedParts)),
        source: result.source,
        status,
        webSearchConfirmed: hasVerified,
        verifiedAt: hasVerified ? new Date() : null,
        verificationLog: JSON.parse(JSON.stringify(result.verificationLog)),
        updatedAt: new Date(),
      },
    })
    .catch(() => {});
}

// ─── Free-text Search Handler ─────────────────────────────────────────

async function handleFreetextSearch(
  year: number,
  make: string,
  model: string,
  trim: string,
  query: string,
  country: string,
  ip: string
) {
  // Normalize query for cache key
  const cacheTask = `freetext:${query.toLowerCase().trim()}`;

  // 1. Try database cache
  try {
    const cached = await prisma.vehiclePartLookup.findUnique({
      where: {
        year_make_model_trim_task: { year, make, model, trim, task: cacheTask },
      },
    });
    if (cached) {
      return NextResponse.json({
        parts: cached.parts as unknown as PartResult[],
        unverifiedParts: cached.unverifiedParts || [],
        source: cached.source,
      });
    }
  } catch {
    // DB error — fall through
  }

  // 2. Claude pipeline for free-text with web verification
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'Parts search unavailable — AI service not configured' },
      { status: 503 }
    );
  }

  try {
    const result = await Promise.race([
      runFreetextPipeline(year, make, model, trim, query),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Pipeline timeout')), TIMEOUT_MS)
      ),
    ]);

    storePipelineResult(year, make, model, trim, cacheTask, result);
    trackPartsSearch(year, make, model, trim, cacheTask, country, result.parts.length, ip);

    return NextResponse.json({
      parts: result.parts,
      unverifiedParts: result.unverifiedParts,
      source: result.source,
      overallConfidence: result.overallConfidence,
      vehicleNotes: result.vehicleNotes,
      country,
    });
  } catch (err: any) {
    console.error('[Parts API] Freetext pipeline failed:', err.message);
    return NextResponse.json(
      { error: 'Failed to find parts. Please try again.' },
      { status: 500 }
    );
  }
}

// ─── Static Specs Extraction ──────────────────────────────────────────

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

    case 'brake_inspection': {
      if (!specs.brakeFluid && !specs.brakes) return null;
      if (specs.brakeFluid) {
        parts.push({
          name: 'Brake Fluid',
          spec: specs.brakeFluid.type,
          searchQuery: specs.brakeFluid.type + ' brake fluid',
          confidence: 'oem-verified',
        });
      }
      const brakes = specs.brakes;
      const v = `${year} ${make} ${model} ${trim}`;
      if (brakes?.front) {
        parts.push({
          name: 'Front Brake Rotors',
          spec: brakes.front.rotorSize,
          partNumber: brakes.front.rotorPartNumber,
          oemBrand: 'Mopar',
          detail: brakes.front.caliperType ? `${brakes.front.caliperType.replace(/,?\s*(yellow|red|silver|black|blue)\s*\w*\s*calipers?/i, '').trim()}` : undefined,
          searchQuery: `Mopar ${brakes.front.rotorPartNumber} ${v} front brake rotors ${brakes.front.rotorSize.split('(')[0].trim()}`,
          crossReferences: brakes.front.aftermarketRotors,
          confidence: 'oem-verified',
        });
        parts.push({
          name: 'Front Brake Pads',
          spec: brakes.front.padPartNumber,
          partNumber: brakes.front.padPartNumber,
          oemBrand: 'Mopar',
          searchQuery: `Mopar ${brakes.front.padPartNumber} ${v} front brake pads`,
          crossReferences: brakes.front.aftermarketPads,
          confidence: 'oem-verified',
        });
      }
      if (brakes?.rear) {
        parts.push({
          name: 'Rear Brake Rotors',
          spec: brakes.rear.rotorSize,
          partNumber: brakes.rear.rotorPartNumber,
          oemBrand: 'Mopar',
          detail: brakes.rear.caliperType ? `${brakes.rear.caliperType.replace(/,?\s*(yellow|red|silver|black|blue)\s*\w*\s*calipers?/i, '').trim()}` : undefined,
          searchQuery: `Mopar ${brakes.rear.rotorPartNumber} ${v} rear brake rotors ${brakes.rear.rotorSize.split('(')[0].trim()}`,
          crossReferences: brakes.rear.aftermarketRotors,
          confidence: 'oem-verified',
        });
        parts.push({
          name: 'Rear Brake Pads',
          spec: brakes.rear.padPartNumber,
          partNumber: brakes.rear.padPartNumber,
          oemBrand: 'Mopar',
          searchQuery: `Mopar ${brakes.rear.padPartNumber} ${v} rear brake pads`,
          crossReferences: brakes.rear.aftermarketPads,
          confidence: 'oem-verified',
        });
      }
      break;
    }

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

    // These don't have static data — always go to pipeline
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
