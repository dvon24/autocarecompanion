/**
 * Multi-Agent Parts Pipeline — Claude-powered parts verification
 *
 * 5-stage pipeline:
 * 0. Ground Truth: Load verified specs from vehicle-specs.json
 * 1. Identifier (Haiku): Identifies parts with OEM numbers
 * 2. Verifier (Haiku): Cross-references, checks superseded numbers
 * 3. Web Verifier (Haiku + web_search): Confirms parts exist on real retailer sites
 *    - If a part fails web verification, re-runs Identifier with failure context (1 retry)
 * 4. Scorer (Haiku): Assigns final confidence only to web-confirmed parts
 */

import Anthropic from '@anthropic-ai/sdk';
import { getVehicleSpecs } from '@/lib/maintenance';
import prisma from '@/lib/db';

const TASK_DESCRIPTIONS: Record<string, string> = {
  // ─── Fluids & Filters ────────────────────────────────────
  oil_change:
    'Motor oil (type, weight, capacity), oil filter (OEM + aftermarket), drain plug size and torque spec',
  coolant_flush:
    'Coolant type, specification, total system capacity',
  transmission_fluid:
    'Transmission fluid type/specification, drain and fill capacity',
  differential_fluid:
    'Differential fluid type and capacity (front and rear)',
  power_steering_fluid:
    'Power steering fluid type/specification, reservoir location',
  brake_fluid:
    'Brake fluid type (DOT 3, DOT 4, DOT 5.1), reservoir location, bleed order',
  transfer_case_fluid:
    'Transfer case fluid type and capacity (4WD/AWD vehicles)',
  air_filter:
    'Engine air filter (OEM + aftermarket part numbers)',
  cabin_filter:
    'Cabin air filter (OEM + aftermarket part numbers)',
  fuel_filter:
    'Fuel filter part number (OEM + aftermarket), location (in-tank or inline)',

  // ─── Ignition & Electrical ───────────────────────────────
  spark_plugs:
    'Spark plugs (OEM + aftermarket, gap, quantity, torque spec)',
  ignition_coils:
    'Ignition coil part number (OEM + aftermarket), quantity needed, connector type',
  battery:
    'Battery group size, CCA recommendation, location',
  alternator:
    'Alternator part number (OEM + aftermarket/remanufactured), amperage rating',
  starter_motor:
    'Starter motor part number (OEM + aftermarket/remanufactured)',
  bulb_replacement:
    'All bulb numbers (headlight low/high, turn signals, tail/brake, fog)',
  oxygen_sensor:
    'Oxygen sensor / O2 sensor part numbers (upstream and downstream, bank 1 and 2)',

  // ─── Brakes & Suspension ─────────────────────────────────
  brake_inspection:
    'Front and rear brake rotors (size, OEM part number, aftermarket options), front and rear brake pads (OEM + aftermarket), brake fluid type',
  brake_calipers:
    'Front and rear brake caliper part numbers (OEM + aftermarket/remanufactured), piston count',
  wheel_bearing:
    'Front and rear wheel bearing/hub assembly part numbers (OEM + aftermarket), bolt pattern',
  shocks_struts:
    'Front struts and rear shocks/struts part numbers (OEM + aftermarket), mount/bearing if applicable',
  ball_joints:
    'Upper and lower ball joint part numbers (OEM + aftermarket), press-in or bolt-on',
  tie_rods:
    'Inner and outer tie rod end part numbers (OEM + aftermarket)',
  control_arms:
    'Front upper/lower control arm part numbers (OEM + aftermarket), bushing included or separate',
  sway_bar_links:
    'Front and rear stabilizer bar end link part numbers (OEM + aftermarket)',

  // ─── Drivetrain ──────────────────────────────────────────
  cv_axle:
    'Front CV axle/halfshaft part numbers (driver and passenger side, OEM + aftermarket)',
  clutch_kit:
    'Clutch disc, pressure plate, throwout bearing, flywheel part numbers (manual transmission only)',
  u_joints:
    'Driveshaft universal joint part numbers (front and rear)',

  // ─── Engine & Cooling ────────────────────────────────────
  serpentine_belt:
    'Serpentine/drive belt part number (OEM + aftermarket), tensioner part number, belt routing',
  timing_belt:
    'Timing belt or timing chain part number, tensioner, idler pulleys, water pump (if timing-belt driven)',
  water_pump:
    'Water pump part number (OEM + aftermarket), gasket included or separate',
  thermostat:
    'Thermostat part number (OEM + aftermarket), housing/gasket, opening temperature',
  radiator:
    'Radiator part number (OEM + aftermarket), core dimensions, transmission cooler built-in or separate',
  fuel_pump:
    'Fuel pump assembly part number (OEM + aftermarket), in-tank or external',
  ac_compressor:
    'AC compressor part number (OEM + aftermarket/remanufactured), refrigerant type and capacity, clutch type',

  // ─── Gaskets & Seals ─────────────────────────────────────
  valve_cover_gasket:
    'Valve cover gasket set part numbers (OEM + aftermarket), bolt/grommet kit if separate, PCV valve if included, left/right bank for V-engines',
  oil_pan_gasket:
    'Oil pan gasket part number (OEM + aftermarket), RTV sealant if required instead of gasket, drain plug washer',
  head_gasket:
    'Head gasket set part numbers (OEM + aftermarket), head bolt set, left/right bank for V-engines, MLS or composite',
  intake_manifold_gasket:
    'Intake manifold gasket set part numbers (OEM + aftermarket), upper and lower if applicable, plenum gasket',

  // ─── Exhaust & Emissions ─────────────────────────────────
  catalytic_converter:
    'Catalytic converter part number (OEM + aftermarket/CARB-compliant), direct-fit or universal, location',
  muffler_exhaust:
    'Muffler and exhaust pipe part numbers (OEM + aftermarket), hangers and gaskets',

  // ─── Exterior & Wheels ───────────────────────────────────
  wiper_blades:
    'Wiper blade sizes (driver, passenger, rear if applicable)',
  tire_rotation:
    'Lug nut/bolt socket size, torque specification',
  wheel_specs:
    'Wheel bolt pattern, center bore, offset range, OEM wheel size, TPMS sensor part number',
};

export interface PipelinePart {
  name: string;
  spec: string;
  detail?: string;
  partNumber?: string;
  oemBrand?: string;
  searchQuery: string;
  crossReferences?: { brand: string; partNumber: string }[];
  confidence: 'dual-verified' | 'oem-verified' | 'high' | 'moderate' | 'needs-review';
  confidenceReason?: string;
  quantity?: number;
  summary?: string;
}

export interface UnverifiedPart {
  name: string;
  partNumber?: string;
  reason: string;
  searchQuery: string; // Pre-built Google search for the user
}

export interface WebVerificationLog {
  partNumber: string;
  searchQuery: string;
  found: boolean;
  retailers: string[];
  sourceUrls: string[];
  retried: boolean;
}

export interface PipelineResult {
  parts: PipelinePart[];
  unverifiedParts: UnverifiedPart[];
  verificationLog: WebVerificationLog[];
  overallConfidence: string;
  vehicleNotes?: string;
  source: 'pipeline' | 'pipeline-freetext';
}

function parseAgentJSON(text: string): any {
  const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');
  const match = cleaned.match(/\{[\s\S]*\}/);
  return JSON.parse(match ? match[0] : cleaned);
}

// ─── Agent 0: Ground Truth ────────────────────────────────────────────

function loadGroundTruth(
  year: number,
  make: string,
  model: string,
  trim: string
): { engine: string; raw: string } | null {
  const specs = getVehicleSpecs({ year, make, model, trim });
  if (!specs) return null;

  // Rebuild raw JSON from the specs object for the AI prompt
  const raw: Record<string, any> = {};
  if (specs.oil) raw.oil = specs.oil;
  if (specs.sparkPlugs) raw.sparkPlugs = specs.sparkPlugs;
  if (specs.brakeFluid) raw.brakeFluid = specs.brakeFluid;
  if (specs.coolant) raw.coolant = specs.coolant;
  if (specs.transmission) raw.transmission = specs.transmission;
  if (specs.differentials) raw.differentials = specs.differentials;
  if (specs.bulbs) raw.bulbs = specs.bulbs;
  if (specs.lug) raw.lug = specs.lug;
  if (specs.brakes) raw.brakes = specs.brakes;

  if (Object.keys(raw).length === 0) return null;

  return {
    engine: specs.engine || 'unknown',
    raw: JSON.stringify(raw, null, 2),
  };
}

// ─── Agent 0.5: Known Issues Context ──────────────────────────────────

// Map tasks to issue categories so we pull relevant known issues
const TASK_TO_CATEGORIES: Record<string, string[]> = {
  oil_change: ['engine'],
  coolant_flush: ['cooling', 'engine'],
  transmission_fluid: ['transmission'],
  differential_fluid: ['drivetrain'],
  power_steering_fluid: ['steering'],
  brake_fluid: ['brakes'],
  transfer_case_fluid: ['drivetrain'],
  air_filter: ['engine'],
  cabin_filter: ['hvac', 'interior'],
  fuel_filter: ['fuel'],
  spark_plugs: ['engine'],
  ignition_coils: ['engine', 'electrical'],
  battery: ['electrical'],
  alternator: ['electrical'],
  starter_motor: ['electrical', 'engine'],
  bulb_replacement: ['electrical', 'exterior'],
  oxygen_sensor: ['emissions', 'engine'],
  brake_inspection: ['brakes'],
  brake_calipers: ['brakes'],
  wheel_bearing: ['suspension', 'drivetrain'],
  shocks_struts: ['suspension'],
  ball_joints: ['suspension', 'steering'],
  tie_rods: ['steering'],
  control_arms: ['suspension'],
  sway_bar_links: ['suspension'],
  cv_axle: ['drivetrain'],
  clutch_kit: ['transmission', 'drivetrain'],
  u_joints: ['drivetrain'],
  serpentine_belt: ['engine'],
  timing_belt: ['engine'],
  water_pump: ['cooling', 'engine'],
  thermostat: ['cooling'],
  radiator: ['cooling'],
  fuel_pump: ['fuel'],
  ac_compressor: ['hvac'],
  valve_cover_gasket: ['engine'],
  oil_pan_gasket: ['engine'],
  head_gasket: ['engine'],
  intake_manifold_gasket: ['engine'],
  catalytic_converter: ['exhaust', 'emissions'],
  muffler_exhaust: ['exhaust'],
  wiper_blades: ['exterior'],
  tire_rotation: ['suspension', 'drivetrain'],
  wheel_specs: ['suspension'],
};

async function loadKnownIssuesContext(
  make: string,
  model: string,
  year: number,
  taskOrQuery: string,
  isFreetext: boolean
): Promise<string | null> {
  try {
    // For predefined tasks, filter by relevant categories
    // For free-text, search by keyword match in title/description
    const categories = isFreetext ? undefined : TASK_TO_CATEGORIES[taskOrQuery];

    const where: any = {
      make: { equals: make, mode: 'insensitive' },
      model: { equals: model, mode: 'insensitive' },
      status: 'published',
      years: { has: year },
    };

    if (categories && categories.length > 0) {
      where.category = { in: categories };
    }

    const issues = await prisma.knownIssue.findMany({
      where,
      select: {
        title: true,
        category: true,
        severity: true,
        description: true,
        solution: true,
        symptoms: true,
        estimatedCostLow: true,
        estimatedCostHigh: true,
      },
      orderBy: { severity: 'asc' }, // high severity first
      take: 10,
    });

    if (issues.length === 0 && !isFreetext) {
      // No known issues found — still check VehicleInsight below
    }

    // Also pull VehicleInsight data (symptom chat diagnoses + past part searches)
    let insightContext = '';
    try {
      const insights = await prisma.vehicleInsight.findMany({
        where: {
          make: { equals: make, mode: 'insensitive' },
          model: { equals: model, mode: 'insensitive' },
          year,
        },
        select: { source: true, insightType: true, title: true, occurrences: true },
        orderBy: { occurrences: 'desc' },
        take: 10,
      });

      if (insights.length > 0) {
        const diagnoses = insights.filter(i => i.insightType === 'diagnosis');
        const demands = insights.filter(i => i.insightType === 'part_demand');

        if (diagnoses.length > 0) {
          insightContext += '\nCOMMON DIAGNOSES FROM SYMPTOM CHAT:\n' +
            diagnoses.map(d => `- ${d.title} (reported ${d.occurrences}x)`).join('\n');
        }
        if (demands.length > 0) {
          insightContext += '\nMOST SEARCHED PARTS FOR THIS VEHICLE:\n' +
            demands.map(d => `- ${d.title} (searched ${d.occurrences}x)`).join('\n');
        }
      }
    } catch {
      // Non-critical
    }

    let issueText = '';
    if (issues.length > 0) {
      if (isFreetext) {
        const queryLower = taskOrQuery.toLowerCase();
        const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);
        const filtered = issues.filter(issue => {
          const text = `${issue.title} ${issue.description} ${issue.category}`.toLowerCase();
          return queryWords.some(w => text.includes(w));
        });
        issueText = formatIssuesForPrompt(filtered.length > 0 ? filtered.slice(0, 5) : issues.slice(0, 3));
      } else {
        issueText = formatIssuesForPrompt(issues);
      }
    }

    const combined = (issueText + insightContext).trim();
    return combined || null;
  } catch {
    // DB error — non-critical, continue without issues context
    return null;
  }
}

function formatIssuesForPrompt(issues: any[]): string {
  const lines = issues.map(issue => {
    const cost = issue.estimatedCostLow && issue.estimatedCostHigh
      ? ` ($${issue.estimatedCostLow}-$${issue.estimatedCostHigh})`
      : '';
    const symptoms = issue.symptoms?.length > 0
      ? ` Symptoms: ${issue.symptoms.slice(0, 3).join(', ')}`
      : '';
    return `- [${issue.severity?.toUpperCase()}] ${issue.title}${cost}${symptoms}\n  Solution: ${(issue.solution || '').slice(0, 150)}`;
  });

  return lines.join('\n');
}

// ─── Agent 1: Identifier ──────────────────────────────────────────────

async function identifyParts(
  client: Anthropic,
  vehicleStr: string,
  trim: string,
  task: string,
  groundTruth: { engine: string; raw: string } | null,
  knownIssuesContext: string | null
): Promise<any> {
  const groundTruthSection = groundTruth
    ? `\nVERIFIED GROUND TRUTH DATA (from the vehicle's service manual — TRUST THIS OVER YOUR TRAINING DATA):
Engine: ${groundTruth.engine}
Specs: ${groundTruth.raw}

USE THESE SPECS AS YOUR PRIMARY SOURCE. Your training data may be wrong for this specific trim.`
    : '';

  const knownIssuesSection = knownIssuesContext
    ? `\nKNOWN ISSUES FOR THIS VEHICLE (from our database of owner-reported problems):
${knownIssuesContext}

Use this information to:
- Warn about known failure points (e.g., if rotors are known to warp, recommend upgraded parts)
- Recommend parts that address common problems
- Include relevant warnings in the "notes" field for each part`
    : '';

  const taskDesc = TASK_DESCRIPTIONS[task] || task.replace(/_/g, ' ');

  const response = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 4000,
    messages: [
      {
        role: 'user',
        content: `You are an automotive parts specialist. Look up the EXACT parts needed for this vehicle and task.

Vehicle: ${vehicleStr}
Task: ${task.replace(/_/g, ' ')}
Look up: ${taskDesc}
${groundTruthSection}
${knownIssuesSection}

For EACH part, provide:
- name: Part name (e.g., "Motor Oil", "Oil Filter", "Front Brake Rotors")
- oemPartNumber: The OEM/manufacturer part number
- oemBrand: The OEM brand (e.g., "Mopar", "Toyota", "Motorcraft")
- specification: The exact specification (e.g., "0W-40 Full Synthetic", "350mm vented")
- quantity: How many needed
- notes: Any important details (capacity, torque spec, location, etc.). Include warnings from known issues if relevant.

CRITICAL RULES:
- Be specific to this EXACT year, make, model, and trim. Different trims often have DIFFERENT specifications.
- For the ${trim}, identify the correct engine size and any trim-specific parts.
- Do NOT confuse base model specs with performance model specs.
- Only provide part numbers you are confident about. If unsure, say so in the notes.

Respond with ONLY a JSON object: { "engine": "engine description", "parts": [...] }`,
      },
    ],
    temperature: 0.1,
  });

  const text = response.content.find((b) => b.type === 'text')?.text || '{}';
  return parseAgentJSON(text);
}

// ─── Agent 2: Verifier ────────────────────────────────────────────────

async function verifyParts(
  client: Anthropic,
  vehicleStr: string,
  identifiedParts: any
): Promise<any> {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 8000,
    messages: [
      {
        role: 'user',
        content: `You are an automotive parts cross-reference specialist. Verify and enhance these parts identified for a ${vehicleStr}.

Engine: ${identifiedParts.engine || 'See parts list'}

Parts to verify:
${JSON.stringify(identifiedParts.parts, null, 2)}

For EACH part:
1. Verify the OEM part number is correct for this exact vehicle
2. Check if the part number has been superseded/updated by the manufacturer
3. Add 2-4 aftermarket cross-references from trusted brands (Wix, Fram, Mobil 1, NGK, Denso, ACDelco, Bosch, PowerStop, StopTech, Centric, K&N, etc.)
4. Flag any issues (wrong part number, discontinued, known fitment problems)

IMPORTANT: If an OEM part number looks wrong or you're unsure, flag it with "verified": false and explain why in "verificationNotes".

Respond with ONLY a JSON object:
{
  "parts": [
    {
      "name": "Part Name",
      "oemPartNumber": "verified or corrected OEM number",
      "oemBrand": "OEM brand",
      "specification": "spec",
      "quantity": 1,
      "notes": "details",
      "verified": true,
      "verificationNotes": "why you believe this is correct or incorrect",
      "supersededBy": null,
      "crossReferences": [
        { "brand": "Wix", "partNumber": "57045" }
      ]
    }
  ]
}`,
      },
    ],
    temperature: 0.1,
  });

  const text = response.content.find((b) => b.type === 'text')?.text || '{}';
  try {
    return parseAgentJSON(text);
  } catch {
    return identifiedParts;
  }
}

// ─── Agent 2.5: GPT Verification ──────────────────────────────────────

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

async function gptVerifyParts(
  vehicleStr: string,
  claudeParts: any[]
): Promise<any[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return claudeParts; // No OpenAI key — skip GPT verification

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'system',
            content: `You are an automotive parts verification specialist. Verify each part number is correct for the given vehicle. Return ONLY a JSON array.`,
          },
          {
            role: 'user',
            content: `Verify these parts for a ${vehicleStr}. For each, confirm the OEM part number is correct or provide the corrected number.

Parts:
${JSON.stringify(claudeParts.map((p: any) => ({
  name: p.name, oemPartNumber: p.oemPartNumber, oemBrand: p.oemBrand, specification: p.specification,
})), null, 2)}

For EACH part respond with:
{ "oemPartNumber": "confirmed or corrected number", "gptAgrees": true/false, "gptNote": "why you agree or disagree" }

Return ONLY a JSON array of these objects, one per part, same order as input.`,
          },
        ],
        max_completion_tokens: 2000,
        temperature: 0.1,
        response_format: { type: 'json_object' },
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!response.ok) return claudeParts;

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);
    const gptResults = parsed.parts || parsed.results || (Array.isArray(parsed) ? parsed : []);

    // Merge GPT verification into Claude parts
    return claudeParts.map((part: any, i: number) => {
      const gptResult = gptResults[i];
      if (!gptResult) return part;

      const agrees = gptResult.gptAgrees !== false;
      return {
        ...part,
        gptVerified: agrees,
        gptPartNumber: gptResult.oemPartNumber || part.oemPartNumber,
        gptNote: gptResult.gptNote,
        dualVerified: agrees && part.oemPartNumber === (gptResult.oemPartNumber || part.oemPartNumber),
      };
    });
  } catch {
    // GPT failed — non-critical, continue with Claude-only verification
    return claudeParts;
  }
}

// ─── Agent 3: Scorer ──────────────────────────────────────────────────

async function scoreParts(
  client: Anthropic,
  vehicleStr: string,
  task: string,
  verifiedParts: any
): Promise<any> {
  // Only score core parts (skip aftermarket to stay within token limits)
  const allParts = verifiedParts.parts || [];
  const coreParts = allParts.filter((p: any) => {
    const name = (p.name || '').toLowerCase();
    return !name.includes('aftermarket') && !name.includes('alternative');
  });

  const response = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 6000,
    messages: [
      {
        role: 'user',
        content: `You are an automotive parts quality assurance specialist. Review these verified parts for a ${vehicleStr} (task: ${task.replace(/_/g, ' ')}) and assign final confidence scores.

Verified parts data:
${JSON.stringify(coreParts, null, 2)}

For EACH part, assign a confidence level:
- "oem-verified": Highly confident this is the correct OEM part number. Part number format matches the brand's pattern, spec is correct, cross-references align.
- "high": Specification is correct and cross-references are consistent, but exact OEM part number may need confirmation.
- "moderate": Something doesn't quite add up — part number format looks off, cross-references inconsistent, or spec seems generic.
- "needs-review": Clear issues — wrong format, conflicting cross-references, or may not fit this vehicle.

Also provide:
- "searchQuery" optimized for Google Shopping (e.g., "Mopar 68191349AC oil filter Dodge Challenger")
- "summary" customer-facing one-line description

Respond with ONLY a JSON object:
{
  "parts": [
    {
      "name": "Part Name",
      "oemPartNumber": "number",
      "oemBrand": "brand",
      "specification": "spec",
      "quantity": 1,
      "notes": "details",
      "confidence": "oem-verified",
      "confidenceReason": "brief explanation",
      "crossReferences": [...],
      "searchQuery": "optimized search query",
      "summary": "customer-facing one-line description"
    }
  ],
  "overallConfidence": "oem-verified or high or moderate or needs-review",
  "vehicleNotes": "any important vehicle-specific notes"
}`,
      },
    ],
    temperature: 0.2,
  });

  const text = response.content.find((b) => b.type === 'text')?.text || '{}';
  try {
    const parsed = parseAgentJSON(text);

    // Merge aftermarket parts back with "high" confidence
    const aftermarketParts = allParts
      .filter((p: any) => {
        const name = (p.name || '').toLowerCase();
        return name.includes('aftermarket') || name.includes('alternative');
      })
      .map((p: any) => ({
        ...p,
        confidence: 'high',
        confidenceReason: 'Aftermarket cross-reference from verified OEM part',
      }));

    if (parsed.parts && aftermarketParts.length > 0) {
      parsed.parts = [...parsed.parts, ...aftermarketParts];
    }

    return parsed;
  } catch {
    return verifiedParts;
  }
}

// ─── Agent 3: Web Search Verifier ─────────────────────────────────────

const RETAILER_DOMAINS = [
  'amazon.com', 'rockauto.com', 'autozone.com', 'oreillyauto.com',
  'advanceautoparts.com', 'napaonline.com', 'carid.com', 'partsgeek.com',
  'carparts.com', 'mopar.com', 'parts.com', 'gmpartsoutlet.net',
  'shop.ford.com', 'toyotapartsdeal.com', 'hondapartsnow.com',
];

interface WebVerifyResult {
  confirmed: boolean;
  retailers: string[];
  sourceUrls: string[];
  searchContext?: string; // Summary of what web search found (for retry context)
}

async function webVerifyPart(
  client: Anthropic,
  partNumber: string,
  partName: string,
  vehicleStr: string
): Promise<WebVerifyResult> {
  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 2048,
      tools: [
        {
          type: 'web_search_20250305' as any,
          name: 'web_search',
          max_uses: 2,
        } as any,
      ],
      messages: [
        {
          role: 'user',
          content: `Search for automotive part number "${partNumber}" for a ${vehicleStr}. I need to verify this part exists and is sold by real retailers.

Search for: "${partNumber}" ${vehicleStr} ${partName}

After searching, tell me:
1. Did you find this exact part number listed for sale on any retailer website?
2. Which retailers carry it? (Amazon, RockAuto, AutoZone, O'Reilly, Advance Auto, NAPA, etc.)
3. Does the part appear to be correct for this vehicle?

Be specific — I need to know if the part number is REAL and AVAILABLE, not just mentioned in a forum post.`,
        },
      ],
    });

    const retailers: string[] = [];
    const sourceUrls: string[] = [];
    let searchContext = '';

    for (const block of response.content) {
      if (block.type === 'web_search_tool_result' && Array.isArray((block as any).content)) {
        for (const result of (block as any).content) {
          if (result.type === 'web_search_result') {
            sourceUrls.push(result.url);
            const domain = RETAILER_DOMAINS.find((d) => result.url.includes(d));
            if (domain) {
              const retailerName = domain.split('.')[0];
              if (!retailers.includes(retailerName)) retailers.push(retailerName);
            }
          }
        }
      } else if (block.type === 'text') {
        searchContext += block.text + '\n';
      }
    }

    const confirmed = retailers.length > 0;
    return { confirmed, retailers, sourceUrls: sourceUrls.slice(0, 5), searchContext: searchContext.slice(0, 500) };
  } catch (err: any) {
    // Web search failed — treat as unconfirmed but don't block pipeline
    return { confirmed: false, retailers: [], sourceUrls: [], searchContext: `Web search error: ${err.message}` };
  }
}

async function webVerifyAllParts(
  client: Anthropic,
  parts: any[],
  vehicleStr: string
): Promise<{
  confirmedParts: any[];
  failedParts: { part: any; result: WebVerifyResult }[];
  log: WebVerificationLog[];
}> {
  const confirmedParts: any[] = [];
  const failedParts: { part: any; result: WebVerifyResult }[] = [];
  const log: WebVerificationLog[] = [];

  // Split parts into those with/without part numbers
  const partsWithNumbers: any[] = [];
  for (const part of parts) {
    const partNumber = part.oemPartNumber || part.partNumber;
    if (!partNumber) {
      // Parts without a part number (like "Motor Oil 0W-40") — pass through as-is
      confirmedParts.push(part);
    } else {
      partsWithNumbers.push(part);
    }
  }

  // Verify parts sequentially to avoid rate limits (50k input tokens/min on Haiku)
  // Each web search call uses ~1-2k tokens, but with multiple agents we're near the limit
  for (let i = 0; i < partsWithNumbers.length; i++) {
    const batch = [partsWithNumbers[i]];
    const results = await Promise.all(
      batch.map(async (part) => {
        const partNumber = part.oemPartNumber || part.partNumber;
        const result = await webVerifyPart(client, partNumber, part.name || '', vehicleStr);
        return { part, partNumber, result };
      })
    );

    for (const { part, partNumber, result } of results) {
      log.push({
        partNumber,
        searchQuery: `"${partNumber}" ${vehicleStr} ${part.name || ''}`,
        found: result.confirmed,
        retailers: result.retailers,
        sourceUrls: result.sourceUrls,
        retried: false,
      });

      if (result.confirmed) {
        confirmedParts.push({ ...part, webVerified: true, retailers: result.retailers });
      } else {
        failedParts.push({ part, result });
      }
    }
  }

  return { confirmedParts, failedParts, log };
}

// ─── Failure Learning: Re-identify with context ──────────────────────

async function retryIdentification(
  client: Anthropic,
  vehicleStr: string,
  trim: string,
  failedPart: any,
  searchContext: string,
  groundTruth: { engine: string; raw: string } | null
): Promise<any> {
  const groundTruthSection = groundTruth
    ? `\nVERIFIED SPECS: ${groundTruth.raw.slice(0, 1000)}`
    : '';

  const response = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: `You are an automotive parts specialist. You previously identified this part for a ${vehicleStr}:

Part: ${failedPart.name}
Part Number: ${failedPart.oemPartNumber}
Brand: ${failedPart.oemBrand}

However, a web search could NOT find this part number listed on any retailer (Amazon, RockAuto, AutoZone, etc.). The web search found:
${searchContext}

This means the part number is likely WRONG or DISCONTINUED. Please try again:
1. Search your knowledge for the CORRECT part number for this exact vehicle and part
2. Consider that the part might have a different number format, or the brand uses a different naming convention
3. If you cannot determine the correct part number, say so honestly
${groundTruthSection}

Respond with ONLY a JSON object:
{
  "name": "${failedPart.name}",
  "oemPartNumber": "corrected part number or null if unknown",
  "oemBrand": "brand",
  "specification": "spec",
  "quantity": ${failedPart.quantity || 1},
  "notes": "what changed and why",
  "corrected": true
}`,
      },
    ],
    temperature: 0.1,
  });

  const text = response.content.find((b) => b.type === 'text')?.text || '{}';
  try {
    return parseAgentJSON(text);
  } catch {
    return null;
  }
}

// ─── Free-text Search Agent ───────────────────────────────────────────

async function freetextSearch(
  client: Anthropic,
  vehicleStr: string,
  trim: string,
  query: string,
  groundTruth: { engine: string; raw: string } | null,
  knownIssuesContext: string | null
): Promise<any> {
  const groundTruthSection = groundTruth
    ? `\nVERIFIED VEHICLE SPECS:\nEngine: ${groundTruth.engine}\nSpecs: ${groundTruth.raw}\n`
    : '';

  const knownIssuesSection = knownIssuesContext
    ? `\nKNOWN ISSUES FOR THIS VEHICLE:
${knownIssuesContext}

Factor these known problems into your recommendations — warn about failure-prone parts and suggest upgrades where appropriate.`
    : '';

  const response = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 4000,
    messages: [
      {
        role: 'user',
        content: `You are an automotive parts specialist. A user is looking for a specific part for their vehicle.

Vehicle: ${vehicleStr}
Part they're looking for: "${query}"
${groundTruthSection}
${knownIssuesSection}

Identify the EXACT parts that match this search. This could be body parts (rocker panels, fenders), interior parts (seats, trim pieces), mechanical parts, or any other automotive part.

For EACH matching part, provide:
- name: Part name
- oemPartNumber: OEM part number if known
- oemBrand: OEM brand
- specification: Size, material, finish, or other key spec
- quantity: How many typically needed
- notes: Fitment notes, left/right side, color-matched requirements, etc. Include warnings from known issues if relevant.
- crossReferences: 2-4 aftermarket options with brand and part number

Be specific to the ${trim} trim. Include both driver and passenger side if applicable.

Respond with ONLY a JSON object:
{
  "engine": "engine description",
  "parts": [
    {
      "name": "Part Name",
      "oemPartNumber": "number",
      "oemBrand": "brand",
      "specification": "spec",
      "quantity": 1,
      "notes": "details",
      "crossReferences": [{ "brand": "Brand", "partNumber": "Number" }]
    }
  ]
}`,
      },
    ],
    temperature: 0.1,
  });

  const text = response.content.find((b) => b.type === 'text')?.text || '{}';
  return parseAgentJSON(text);
}

// ─── Normalize agent output to API shape ──────────────────────────────

function normalizeParts(scored: any): PipelinePart[] {
  if (!scored.parts || !Array.isArray(scored.parts)) return [];

  return scored.parts.map((p: any) => ({
    name: String(p.name || 'Unknown Part'),
    spec: String(p.specification || p.spec || p.oemPartNumber || 'See details'),
    detail: p.notes ? String(p.notes) : undefined,
    partNumber: p.oemPartNumber ? String(p.oemPartNumber) : undefined,
    oemBrand: p.oemBrand ? String(p.oemBrand) : undefined,
    crossReferences: Array.isArray(p.crossReferences)
      ? p.crossReferences.map((cr: any) => ({
          brand: String(cr.brand),
          partNumber: String(cr.partNumber),
        }))
      : undefined,
    quantity: typeof p.quantity === 'number' ? p.quantity : undefined,
    confidence: p.dualVerified ? 'dual-verified'
      : ['oem-verified', 'high', 'moderate', 'needs-review'].includes(p.confidence) ? p.confidence
      : 'moderate',
    confidenceReason: p.dualVerified
      ? `Verified by both Claude and GPT${p.confidenceReason ? `. ${p.confidenceReason}` : ''}`
      : p.confidenceReason ? String(p.confidenceReason) : undefined,
    searchQuery: String(
      p.searchQuery || `${p.oemBrand || ''} ${p.oemPartNumber || ''} ${p.name || ''}`
    ).trim(),
    summary: p.summary ? String(p.summary) : undefined,
  }));
}

// ─── Full Pipeline with Web Verification ─────────────────────────────

async function runFullPipeline(
  client: Anthropic,
  vehicleStr: string,
  year: number,
  make: string,
  model: string,
  trim: string,
  taskOrQuery: string,
  groundTruth: { engine: string; raw: string } | null,
  isFreetext: boolean
): Promise<PipelineResult> {
  // Stage 0.5: Load relevant known issues from DB
  const knownIssuesContext = await loadKnownIssuesContext(make, model, year, taskOrQuery, isFreetext);

  // Stage 1: Identify (with ground truth + known issues context)
  const identified = isFreetext
    ? await freetextSearch(client, vehicleStr, trim, taskOrQuery, groundTruth, knownIssuesContext)
    : await identifyParts(client, vehicleStr, trim, taskOrQuery, groundTruth, knownIssuesContext);

  if (!identified.parts || identified.parts.length === 0) {
    throw new Error(isFreetext ? 'No parts found matching your search' : 'No parts identified by pipeline');
  }

  // Stage 2: Cross-reference verify (Claude)
  const verified = await verifyParts(client, vehicleStr, identified);

  // Stage 2.5: GPT verification (parallel second opinion)
  if (verified.parts && verified.parts.length > 0) {
    verified.parts = await gptVerifyParts(vehicleStr, verified.parts);
  }

  // Stage 3: Web search verification
  const { confirmedParts, failedParts, log } = await webVerifyAllParts(
    client,
    verified.parts || [],
    vehicleStr
  );

  // Stage 3b: Retry failed parts with learning context (sequential for rate limits)
  const unverifiedParts: UnverifiedPart[] = [];
  for (const { part, result } of failedParts) {
    const retried = await retryIdentification(
      client, vehicleStr, trim, part, result.searchContext || '', groundTruth
    );

    if (retried && retried.oemPartNumber && retried.oemPartNumber !== 'null') {
      const retryResult = await webVerifyPart(client, retried.oemPartNumber, retried.name, vehicleStr);
      log.push({
        partNumber: retried.oemPartNumber,
        searchQuery: `"${retried.oemPartNumber}" ${vehicleStr}`,
        found: retryResult.confirmed,
        retailers: retryResult.retailers,
        sourceUrls: retryResult.sourceUrls,
        retried: true,
      });

      if (retryResult.confirmed) {
        confirmedParts.push({ ...retried, webVerified: true, retailers: retryResult.retailers });
        continue;
      }
    }

    unverifiedParts.push({
      name: part.name || 'Unknown Part',
      partNumber: part.oemPartNumber,
      reason: result.searchContext?.slice(0, 200) || 'Could not find this part number on any retailer',
      searchQuery: `${vehicleStr} ${part.name || taskOrQuery}`,
    });
  }

  // Stage 4: Score only web-confirmed parts
  if (confirmedParts.length === 0) {
    return {
      parts: [],
      unverifiedParts,
      verificationLog: log,
      overallConfidence: 'needs-review',
      vehicleNotes: 'No parts could be verified through web search. Use the search links below to find parts manually.',
      source: isFreetext ? 'pipeline-freetext' : 'pipeline',
    };
  }

  const scored = await scoreParts(client, vehicleStr, taskOrQuery, { parts: confirmedParts });

  return {
    parts: normalizeParts(scored),
    unverifiedParts,
    verificationLog: log,
    overallConfidence: scored.overallConfidence || 'moderate',
    vehicleNotes: scored.vehicleNotes,
    source: isFreetext ? 'pipeline-freetext' : 'pipeline',
  };
}

// ─── Main Pipeline Entry Point ────────────────────────────────────────

export async function runPartsPipeline(
  year: number,
  make: string,
  model: string,
  trim: string,
  task: string
): Promise<PipelineResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');

  const client = new Anthropic({ apiKey });
  const vehicleStr = `${year} ${make} ${model} ${trim}`;
  const groundTruth = loadGroundTruth(year, make, model, trim);

  return runFullPipeline(client, vehicleStr, year, make, model, trim, task, groundTruth, false);
}

// ─── Free-text Pipeline Entry Point ───────────────────────────────────

export async function runFreetextPipeline(
  year: number,
  make: string,
  model: string,
  trim: string,
  query: string
): Promise<PipelineResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');

  const client = new Anthropic({ apiKey });
  const vehicleStr = `${year} ${make} ${model} ${trim}`;
  const groundTruth = loadGroundTruth(year, make, model, trim);

  return runFullPipeline(client, vehicleStr, year, make, model, trim, query, groundTruth, true);
}
