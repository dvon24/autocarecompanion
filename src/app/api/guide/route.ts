import { NextRequest, NextResponse } from 'next/server';
import {
  GuideGenerationRequestSchema,
  generateGuideId,
  type Guide,
  type GuideStep,
  type Tool,
  type Part,
} from '@/schemas/guide.schema';
import { logApiCost, isBudgetExceeded } from '@/lib/costs';
import { getVehicleSpecs, type VehicleSpecs } from '@/lib/maintenance';
import {
  extractMaintenanceType,
  getCachedGuide,
  storeCachedGuide,
  recordCacheEvent,
} from '@/lib/guide-cache';

/**
 * Format vehicle specs into a string for injection into the AI prompt.
 * Uses the shared getVehicleSpecs() lookup from maintenance.ts.
 */
function formatSpecsForPrompt(vehicle: { year: number; make: string; model: string; trim: string }, specs: VehicleSpecs): string {
  const sections: string[] = [];
  sections.push(`\n\nVEHICLE-SPECIFIC REFERENCE DATA for ${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim}:`);
  if (specs.engine) sections.push(`Engine: ${specs.engine}`);

  if (specs.oil) {
    sections.push(`Oil: ${specs.oil.type}, Capacity: ${specs.oil.capacity}, Filter: ${specs.oil.filterPartNumber}`);
    if (specs.oil.recommendedProducts) sections.push(`  Recommended oil products: ${specs.oil.recommendedProducts}`);
    if (specs.oil.oilNotes) sections.push(`  Oil notes: ${specs.oil.oilNotes}`);
    if (specs.oil.drainPlugSize) sections.push(`  Drain plug: ${specs.oil.drainPlugSize}, Torque: ${specs.oil.drainPlugTorque}`);
    if (specs.oil.filterLocation) sections.push(`  Filter location: ${specs.oil.filterLocation}`);
  }

  if (specs.coolant) sections.push(`Coolant: ${specs.coolant.type}, Capacity: ${specs.coolant.capacity}`);
  if (specs.transmission) sections.push(`Transmission fluid: ${specs.transmission.type}, Capacity: ${specs.transmission.capacity}`);
  if (specs.brakeFluid) sections.push(`Brake fluid: ${specs.brakeFluid.type}`);

  if (specs.sparkPlugs) {
    sections.push(`Spark plugs: ${specs.sparkPlugs.partNumber}, Gap: ${specs.sparkPlugs.gap}, Qty: ${specs.sparkPlugs.quantity}`);
  }

  if (specs.lug) sections.push(`Lug ${specs.lug.useBolts ? 'bolts' : 'nuts'}: ${specs.lug.size}, Torque: ${specs.lug.torque}`);

  if (specs.differentials) {
    if (specs.differentials.rear) sections.push(`Rear diff: ${specs.differentials.rear.type}, ${specs.differentials.rear.capacity}`);
    if (specs.differentials.front) sections.push(`Front diff: ${specs.differentials.front.type}, ${specs.differentials.front.capacity}`);
  }

  if (specs.supercharger) {
    sections.push(`Supercharger intercooler: ${specs.supercharger.intercoolerFluid}, Capacity: ${specs.supercharger.intercoolerCapacity}`);
  }

  if (specs.jackPoints) {
    sections.push(`Jack points - Front: ${specs.jackPoints.front}`);
    sections.push(`Jack points - Rear: ${specs.jackPoints.rear}`);
    if (specs.jackPoints.frontLift) sections.push(`Lift point front: ${specs.jackPoints.frontLift}`);
    if (specs.jackPoints.rearLift) sections.push(`Lift point rear: ${specs.jackPoints.rearLift}`);
  }

  if (specs.safety && specs.safety.length > 0) {
    sections.push(`CRITICAL SAFETY NOTES:\n${specs.safety.map((s: string) => `- ${s}`).join('\n')}`);
  }

  sections.push(`\nIMPORTANT: Use the exact specs above in your guide. Do NOT guess capacities or part numbers - use the reference data provided.`);

  return sections.join('\n');
}

/**
 * Get vehicle specs formatted for AI prompt injection.
 * Returns empty string if no specs found.
 */
function getVehicleSpecsForPrompt(vehicle: { year: number; make: string; model: string; trim: string }): string {
  const specs = getVehicleSpecs(vehicle);
  if (!specs) return '';
  return formatSpecsForPrompt(vehicle, specs);
}

/**
 * Guide Generation API Route
 *
 * Generates repair guides using AI based on diagnosis and vehicle info.
 * Per Architecture: Server-side API calls, 60s timeout for complex guides.
 *
 * Story 1.6: Guide Generation via AI
 * Story 7.1-7.3: Cost tracking and budget management
 */

// Vercel serverless function config - extend timeout to 60 seconds
export const maxDuration = 60;

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const TIMEOUT_MS = 55000; // 55 second timeout (leave 5s buffer for Vercel)

/**
 * System prompt for guide generation
 */
function getGuideSystemPrompt(
  vehicle: { year: number; make: string; model: string; trim: string },
  diagnosis: { title: string; description?: string }
) {
  // Trim description to avoid overly long prompts that slow down generation
  const trimmedDescription = diagnosis.description
    ? diagnosis.description.slice(0, 300)
    : '';

  const vehicleSpecs = getVehicleSpecsForPrompt(vehicle);

  return `You are an expert automotive repair guide writer. Generate a concise, step-by-step repair guide.

Vehicle: ${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim}
Issue: ${diagnosis.title}
${trimmedDescription ? `Context: ${trimmedDescription}` : ''}${vehicleSpecs}

Create a comprehensive repair guide in the following JSON format. Be SPECIFIC to this exact vehicle.

{
  "title": "Guide title",
  "description": "Brief overview of the repair",
  "difficulty": 1-5 (1=beginner, 5=expert),
  "safetyLevel": "diy-safe" | "diy-safe-with-care" | "requires-mechanic",
  "timeEstimate": "estimated time range (e.g., '30-45 minutes')",
  "tools": [
    {
      "name": "Tool name (include size, e.g., '10mm Socket')",
      "purpose": "What it's used for in this repair",
      "costRange": "$X-$Y",
      "alternatives": ["alternative tool if any"],
      "required": true/false
    }
  ],
  "parts": [
    {
      "name": "Part name (e.g., 'Oil Filter', 'Brake Pads')",
      "partNumber": "OEM part number for this vehicle (e.g., '04152-YZZA1', 'FL-500S')",
      "oemPrice": "$X-$Y (estimated range)",
      "aftermarketPrice": "$X-$Y (estimated range)",
      "notes": "Specs, compatible aftermarket brands (Fram, Mobil 1, etc.)"
    }
  ],
  "steps": [
    {
      "number": 1,
      "instruction": "Clear, detailed instruction",
      "tips": [
        { "content": "Helpful tip for this step" }
      ],
      "safetyWarnings": [
        { "severity": "high|medium|low", "message": "Safety warning" }
      ],
      "estimatedMinutes": 5
    }
  ]
}

PART NUMBER GUIDELINES:
- ALWAYS include OEM part numbers for common parts (oil filters, air filters, spark plugs, brake pads, etc.)
- Use the correct part number for this exact year/make/model/trim
- In "notes", include compatible aftermarket brands and any fitment notes
- Price ranges should be rough estimates
- For engine oil: the "name" MUST include the exact weight/viscosity AND total capacity, e.g. "Mobil 1 5W-30 Full Synthetic (10.0 quarts)" NOT just "Engine Oil (Full Synthetic)"
- For engine oil: use a real product name as "partNumber" (e.g., "Mobil 1 120764" or "Castrol Edge 5W-30"), NOT "N/A"
- For fluids (coolant, brake fluid, trans fluid): always include brand, spec, and quantity in the name

General Guidelines:
- Write clear, concise instructions a DIY mechanic can follow
- Include safety warnings where relevant (battery disconnect, jack stands, hot components, etc.)
- Add tips for common stuck points
- Be specific about bolt sizes, torque specs when applicable
- Consider the skill level indicated by the difficulty rating
- For "requires-mechanic" repairs, explain why professional help is needed
- Include 5-10 steps (be concise, not exhaustive)

Return ONLY valid JSON, no additional text.`;
}

/**
 * Call OpenAI API for guide generation
 * Returns content and token usage for cost tracking
 */
async function callOpenAI(
  systemPrompt: string,
  apiKey: string
): Promise<{ content: string; usage: { promptTokens: number; completionTokens: number } }> {
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
        model: 'gpt-5.2',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Generate the repair guide now.' },
        ],
        max_completion_tokens: 3000,
        temperature: 0.3,
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
    const content = data.choices[0]?.message?.content || '';
    const usage = {
      promptTokens: data.usage?.prompt_tokens || 0,
      completionTokens: data.usage?.completion_tokens || 0,
    };

    return { content, usage };
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Parse AI response into Guide structure
 */
function parseGuideResponse(
  content: string,
  vehicle: { year: number; make: string; model: string; trim: string },
  diagnosis: { id: string; title: string }
): Guide {
  const parsed = JSON.parse(content);
  const guideId = generateGuideId();
  const now = Date.now();

  // Process steps with IDs
  const steps: GuideStep[] = (parsed.steps || []).map((step: Record<string, unknown>, idx: number) => ({
    number: step.number || idx + 1,
    instruction: step.instruction || '',
    tips: ((step.tips || []) as Array<{ content?: string }>).map((tip, tipIdx) => ({
      id: `tip_${guideId}_${idx}_${tipIdx}`,
      content: tip.content || '',
    })),
    safetyWarnings: ((step.safetyWarnings || []) as Array<{ severity?: string; message?: string }>).map((warn, warnIdx) => ({
      id: `warn_${guideId}_${idx}_${warnIdx}`,
      severity: warn.severity || 'medium',
      message: warn.message || '',
    })),
    estimatedMinutes: step.estimatedMinutes,
  }));

  // Process tools with IDs
  const tools: Tool[] = (parsed.tools || []).map((tool: Record<string, unknown>, idx: number) => ({
    id: `tool_${guideId}_${idx}`,
    name: tool.name || '',
    purpose: tool.purpose,
    costRange: tool.costRange,
    alternatives: tool.alternatives,
    required: tool.required !== false,
  }));

  // Process parts with IDs
  const parts: Part[] = (parsed.parts || []).map((part: Record<string, unknown>, idx: number) => ({
    id: `part_${guideId}_${idx}`,
    name: part.name || '',
    partNumber: part.partNumber,
    oemPrice: part.oemPrice,
    aftermarketPrice: part.aftermarketPrice,
    notes: part.notes,
  }));

  return {
    id: guideId,
    title: parsed.title || `${diagnosis.title} Repair Guide`,
    description: parsed.description,
    vehicle,
    diagnosis: {
      id: diagnosis.id,
      title: diagnosis.title,
    },
    difficulty: Math.min(5, Math.max(1, parsed.difficulty || 3)),
    safetyLevel: parsed.safetyLevel || 'diy-safe-with-care',
    timeEstimate: parsed.timeEstimate || '30-60 minutes',
    steps,
    tools,
    parts,
    createdAt: now,
    version: 1,
  };
}

/**
 * Generate mock guide for development/testing
 */
function generateMockGuide(
  vehicle: { year: number; make: string; model: string; trim: string },
  diagnosis: { id: string; title: string; description?: string }
): Guide {
  const guideId = generateGuideId();
  const now = Date.now();

  return {
    id: guideId,
    title: `${diagnosis.title} Repair Guide`,
    description: `Step-by-step guide to repair ${diagnosis.title.toLowerCase()} on your ${vehicle.year} ${vehicle.make} ${vehicle.model}.`,
    vehicle,
    diagnosis: {
      id: diagnosis.id,
      title: diagnosis.title,
    },
    difficulty: 2,
    safetyLevel: 'diy-safe-with-care',
    timeEstimate: '45-60 minutes',
    steps: [
      {
        number: 1,
        instruction: 'Park the vehicle on a level surface and engage the parking brake. Allow the engine to cool if it was recently running.',
        tips: [
          { id: `tip_${guideId}_0_0`, content: 'Wait at least 30 minutes after driving for components to cool down.' },
        ],
        safetyWarnings: [
          { id: `warn_${guideId}_0_0`, severity: 'medium', message: 'Ensure the vehicle is in Park (automatic) or in gear (manual) before working.' },
        ],
        estimatedMinutes: 2,
      },
      {
        number: 2,
        instruction: 'Open the hood and locate the component related to the repair. Consult your owner\'s manual if needed.',
        tips: [
          { id: `tip_${guideId}_1_0`, content: 'Take a photo of the engine bay before starting for reference.' },
        ],
        safetyWarnings: [],
        estimatedMinutes: 3,
      },
      {
        number: 3,
        instruction: 'Disconnect the negative battery terminal to prevent electrical shorts during the repair.',
        tips: [
          { id: `tip_${guideId}_2_0`, content: 'Use a 10mm wrench for most battery terminals.' },
          { id: `tip_${guideId}_2_1`, content: 'Tuck the cable away from the battery to prevent accidental reconnection.' },
        ],
        safetyWarnings: [
          { id: `warn_${guideId}_2_0`, severity: 'high', message: 'Always disconnect the negative terminal first to prevent sparks.' },
        ],
        estimatedMinutes: 5,
      },
      {
        number: 4,
        instruction: 'Remove any covers or components blocking access to the repair area. Keep track of all bolts and screws.',
        tips: [
          { id: `tip_${guideId}_3_0`, content: 'Use a magnetic tray to keep small parts organized.' },
        ],
        safetyWarnings: [],
        estimatedMinutes: 10,
      },
      {
        number: 5,
        instruction: 'Perform the main repair procedure according to your specific diagnosis. Replace worn or damaged parts as needed.',
        tips: [
          { id: `tip_${guideId}_4_0`, content: 'Compare old and new parts side-by-side to ensure correct replacement.' },
        ],
        safetyWarnings: [
          { id: `warn_${guideId}_4_0`, severity: 'medium', message: 'Do not force parts into place. If they don\'t fit, verify you have the correct part.' },
        ],
        estimatedMinutes: 20,
      },
      {
        number: 6,
        instruction: 'Reinstall any components removed during disassembly in reverse order.',
        tips: [
          { id: `tip_${guideId}_5_0`, content: 'Refer to your photos from Step 2 if unsure about component placement.' },
        ],
        safetyWarnings: [],
        estimatedMinutes: 10,
      },
      {
        number: 7,
        instruction: 'Reconnect the negative battery terminal and ensure it\'s secure.',
        tips: [],
        safetyWarnings: [],
        estimatedMinutes: 2,
      },
      {
        number: 8,
        instruction: 'Start the engine and verify the repair was successful. Check for any warning lights or unusual behavior.',
        tips: [
          { id: `tip_${guideId}_7_0`, content: 'Let the engine idle for 2-3 minutes and check for leaks or unusual sounds.' },
        ],
        safetyWarnings: [
          { id: `warn_${guideId}_7_0`, severity: 'medium', message: 'Do not drive the vehicle until you\'ve verified the repair is complete.' },
        ],
        estimatedMinutes: 5,
      },
    ],
    tools: [
      { id: `tool_${guideId}_0`, name: 'Socket Set', purpose: 'For removing bolts and fasteners', costRange: '$30-$80', required: true },
      { id: `tool_${guideId}_1`, name: 'Wrench Set', purpose: 'For various nuts and bolts', costRange: '$20-$50', required: true },
      { id: `tool_${guideId}_2`, name: 'Screwdriver Set', purpose: 'For screws and clips', costRange: '$15-$30', required: true },
      { id: `tool_${guideId}_3`, name: 'Work Light', purpose: 'For visibility in the engine bay', costRange: '$15-$40', required: false },
    ],
    parts: [
      {
        id: `part_${guideId}_0`,
        name: `Oil Filter - ${vehicle.make}`,
        partNumber: vehicle.make === 'Toyota' ? '04152-YZZA1' : vehicle.make === 'Honda' ? '15400-PLM-A02' : vehicle.make === 'Ford' ? 'FL-500S' : 'PF48',
        oemPrice: '$8-$15',
        aftermarketPrice: '$5-$10',
        notes: 'Also compatible: Fram XG7317, Mobil 1 M1-110A, K&N HP-1010'
      },
      {
        id: `part_${guideId}_1`,
        name: 'Engine Oil 5W-30 (5 Quarts)',
        partNumber: 'Mobil 1 120764',
        oemPrice: '$35-$45',
        aftermarketPrice: '$25-$35',
        notes: 'Check owner\'s manual for correct viscosity. Synthetic recommended.'
      },
      {
        id: `part_${guideId}_2`,
        name: 'Drain Plug Gasket',
        partNumber: vehicle.make === 'Toyota' ? '90430-12031' : vehicle.make === 'Honda' ? '94109-14000' : 'Generic',
        oemPrice: '$2-$5',
        aftermarketPrice: '$1-$3',
        notes: 'Replace with every oil change to prevent leaks'
      },
    ],
    createdAt: now,
    version: 1,
  };
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Story 7.3: Check budget before making API call
    if (isBudgetExceeded()) {
      return NextResponse.json(
        {
          error: 'Monthly API budget exceeded. Guide generation is temporarily limited.',
          budgetExceeded: true,
        },
        { status: 429 }
      );
    }

    // Parse and validate request
    const body = await request.json();
    const parseResult = GuideGenerationRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: parseResult.error.issues.map((i) => i.message),
        },
        { status: 400 }
      );
    }

    const { vehicle, diagnosis } = parseResult.data;

    // Extract maintenance type for cache key
    const maintenanceType = extractMaintenanceType(diagnosis);

    // Check cache first
    const cachedGuide = await getCachedGuide(
      vehicle.year,
      vehicle.make,
      vehicle.model,
      vehicle.trim,
      maintenanceType
    );

    if (cachedGuide) {
      const generationTimeMs = Date.now() - startTime;
      // Record cache hit (fire-and-forget)
      recordCacheEvent(true, 0.21).catch(() => {});
      return NextResponse.json({
        guide: cachedGuide,
        generationTimeMs,
        cacheHit: true,
      });
    }

    // Cache MISS - generate via AI
    const apiKey = process.env.OPENAI_API_KEY;

    let guide: Guide;
    let costUsd: number | undefined;

    if (apiKey) {
      // Generate guide via AI
      const systemPrompt = getGuideSystemPrompt(vehicle, diagnosis);
      const { content, usage } = await callOpenAI(systemPrompt, apiKey);

      // Story 7.1: Log API cost
      logApiCost('guide_generation', usage.promptTokens, usage.completionTokens, 'gpt-5.2');

      // Estimate cost for cache stats
      costUsd = ((usage.promptTokens * 10) + (usage.completionTokens * 30)) / 1_000_000;

      guide = parseGuideResponse(content, vehicle, {
        id: diagnosis.id,
        title: diagnosis.title,
      });
    } else {
      // Use mock guide for development
      console.log('[Guide API] No OPENAI_API_KEY configured, using mock guide');
      // Simulate generation delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      guide = generateMockGuide(vehicle, {
        id: diagnosis.id,
        title: diagnosis.title,
        description: diagnosis.description,
      });
    }

    // Store in cache (fire-and-forget - don't block response)
    storeCachedGuide(guide, maintenanceType, costUsd).catch((e) => {
      console.error('[guide-cache] store failed:', e);
    });

    // Record cache miss
    recordCacheEvent(false).catch((e) => {
      console.error('[guide-cache] recordCacheEvent failed:', e);
    });

    const generationTimeMs = Date.now() - startTime;

    return NextResponse.json({
      guide,
      generationTimeMs,
      cacheHit: false,
    });
  } catch (error) {
    console.error('Guide API error:', error);

    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Guide generation timed out. Please try again.' },
        { status: 504 }
      );
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Failed to parse guide data. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate guide. Please try again.' },
      { status: 500 }
    );
  }
}
