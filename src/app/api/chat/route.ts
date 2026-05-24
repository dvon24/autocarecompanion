import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import {
  ChatRequestSchema,
  createChatMessage,
  type ChatMessage,
  type Diagnosis,
} from '@/schemas/chat.schema';
import type { OBDCodeEntry } from '@/schemas/obd.schema';
import { logApiCost, isBudgetExceeded } from '@/lib/costs';
import prisma from '@/lib/db';
import { getVehicleSpecs } from '@/lib/maintenance';
import { getRecallsForArticle } from '@/lib/recalls';
import { auth } from '@/lib/auth';
import { checkAiGate, isAiGateBlocked } from '@/lib/ai-gate';

// Allow up to 60s for tool-calling responses on Vercel
export const maxDuration = 60;

/**
 * AI Symptom Chat API Route
 *
 * Handles symptom diagnosis conversations using AI.
 * Per Architecture: Server-side API calls, streaming responses.
 *
 * Uses OpenAI API (configurable to Anthropic).
 * Falls back to mock responses when API key not configured.
 *
 * Story 4.5: Includes passive symptom capture for pattern analysis.
 */

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const TIMEOUT_MS = 60000; // 60 second timeout (tool calls may need multiple rounds)

/**
 * PART_KEYWORDS — words that signal the user wants a part, not a diagnosis
 */
const PART_KEYWORDS = [
  'battery', 'filter', 'oil filter', 'air filter', 'cabin filter', 'fuel filter',
  'brake pad', 'brake rotor', 'spark plug', 'wiper', 'wiper blade', 'bulb',
  'headlight', 'taillight', 'alternator', 'starter', 'radiator', 'thermostat',
  'water pump', 'fuel pump', 'serpentine belt', 'timing belt', 'timing chain',
  'catalytic converter', 'oxygen sensor', 'o2 sensor', 'mass air flow', 'maf sensor',
  'ignition coil', 'strut', 'shock', 'control arm', 'tie rod', 'wheel bearing',
  'cv axle', 'drive shaft', 'clutch', 'flywheel', 'transmission fluid', 'coolant',
  'antifreeze', 'power steering fluid', 'differential fluid', 'transfer case fluid',
  'part number', 'part for', 'need a', 'replace my', 'what battery', 'what oil',
  'what filter', 'what pads', 'which brake', 'which battery', 'looking for a',
  'where to buy', 'how much is', 'cost of', 'price of',
];

/**
 * Detect if the user's message is a parts lookup vs symptom diagnosis
 */
function detectIntent(message: string): 'parts' | 'symptom' {
  const lower = message.toLowerCase();
  for (const kw of PART_KEYWORDS) {
    if (lower.includes(kw)) return 'parts';
  }
  return 'symptom';
}

/**
 * Load RAG context: known issues + cached parts + vehicle specs
 * Non-blocking — returns empty strings on failure
 */
async function loadRAGContext(vehicle: { year: number; make: string; model: string; trim: string }): Promise<{
  knownIssuesContext: string;
  partsContext: string;
  specsContext: string;
  recallsContext: string;
}> {
  let knownIssuesContext = '';
  let partsContext = '';
  let specsContext = '';
  let recallsContext = '';

  try {
    // Load known issues for this vehicle's specific year
    const issues = await prisma.knownIssue.findMany({
      where: {
        make: { equals: vehicle.make, mode: 'insensitive' },
        model: { equals: vehicle.model, mode: 'insensitive' },
        years: { has: vehicle.year },
        status: 'published',
      },
      select: { title: true, severity: true, category: true, description: true },
      take: 15,
      orderBy: { reportCount: 'desc' },
    });

    if (issues.length > 0) {
      knownIssuesContext = `\n\nKNOWN ISSUES for ${vehicle.year} ${vehicle.make} ${vehicle.model} (from our database — reference these when relevant):
${issues.map(i => `- [${i.severity}] ${i.title}: ${(i.description || '').slice(0, 120)}`).join('\n')}`;
    }
  } catch { /* non-blocking */ }

  try {
    // Load cached parts for this vehicle
    const cachedParts = await prisma.vehiclePartLookup.findMany({
      where: {
        year: vehicle.year,
        make: { equals: vehicle.make, mode: 'insensitive' },
        model: { equals: vehicle.model, mode: 'insensitive' },
      },
      select: { task: true, parts: true },
      take: 20,
    });

    if (cachedParts.length > 0) {
      const partLines = cachedParts.map(cp => {
        const parts = cp.parts as any[];
        const topParts = parts.slice(0, 2).map((p: any) => `${p.brand || ''} ${p.partNumber || ''} ${p.name || ''}`).join(', ');
        return `- ${cp.task}: ${topParts}`;
      });
      partsContext = `\n\nCACHED PARTS for this vehicle (verified — use these directly when the user asks about these parts):
${partLines.join('\n')}`;
    }
  } catch { /* non-blocking */ }

  // Load vehicle specs (sync, from JSON)
  try {
    const specs = getVehicleSpecs(vehicle);
    if (specs) {
      const specLines: string[] = [];
      if (specs.oil) specLines.push(`Oil: ${specs.oil.type}, ${specs.oil.capacity}, filter ${specs.oil.filterPartNumber}`);
      if (specs.coolant) specLines.push(`Coolant: ${specs.coolant.type}, ${specs.coolant.capacity}`);
      if (specs.sparkPlugs) specLines.push(`Spark plugs: ${specs.sparkPlugs.partNumber} x${specs.sparkPlugs.quantity}, gap ${specs.sparkPlugs.gap}`);
      if (specs.brakeFluid) specLines.push(`Brake fluid: ${specs.brakeFluid.type}`);
      if (specs.transmission) specLines.push(`Trans: ${specs.transmission.type}, ${specs.transmission.capacity}`);
      if (specs.lug) specLines.push(`Lug: ${specs.lug.size}, ${specs.lug.torque}${specs.lug.useBolts ? ' (bolts)' : ''}`);
      if (specLines.length > 0) {
        specsContext = `\n\nVEHICLE SPECS (verified data):
${specLines.join('\n')}`;
      }
    }
  } catch { /* non-blocking */ }

  try {
    // Load active NHTSA recalls for this vehicle's year
    const recalls = await getRecallsForArticle(vehicle.make, vehicle.model, [vehicle.year]);
    if (recalls.length > 0) {
      const lines = recalls.slice(0, 5).map(r => {
        const sev = r.severity.toUpperCase();
        const parkIt = r.parkIt ? ' (NHTSA PARK-IT ORDER)' : '';
        const summary = (r.summary || '').slice(0, 180);
        const remedy = (r.remedy || '').slice(0, 120);
        return `- [${sev}] ${r.component}${parkIt}: ${summary} — Remedy: ${remedy} (Campaign ${r.campaignNumber})`;
      });
      recallsContext = `\n\nACTIVE NHTSA RECALLS for ${vehicle.year} ${vehicle.make} ${vehicle.model} — mention these when the user's symptom overlaps with a recalled component. Recalls are FREE at the dealer:\n${lines.join('\n')}`;
    }
  } catch { /* non-blocking */ }

  return { knownIssuesContext, partsContext, specsContext, recallsContext };
}

/**
 * System prompt for automotive diagnosis — with RAG context
 */
function getSystemPrompt(
  vehicle: { year: number; make: string; model: string; trim: string },
  ragContext: { knownIssuesContext: string; partsContext: string; specsContext: string; recallsContext: string },
  intent: 'parts' | 'symptom',
  obdCodes?: OBDCodeEntry[]
) {
  const obdSection = obdCodes && obdCodes.length > 0
    ? `\n\nThe user has provided the following OBD-II diagnostic codes from their scanner:
${obdCodes.map((c) => `- ${c.code}: ${c.description || 'Unknown code'}`).join('\n')}

Use these codes to help inform your diagnosis. OBD codes provide valuable diagnostic information and can increase your confidence in the diagnosis when they align with the reported symptoms.`
    : '';

  const intentGuidance = intent === 'parts'
    ? `The user is asking about a PART for their vehicle. DO NOT ask diagnostic questions. Go straight to answering:
- Identify the exact part they need for their specific vehicle
- If you have cached parts data below, use it directly
- Include brand, part number, and Amazon link: [Brand PartName](https://www.amazon.com/s?k=BRAND+PART_NUMBER&tag=au7o-20)
- Mention if Au7o has a Parts Finder for more options: https://au7o.io/parts
- Only ask ONE clarifying question if you genuinely cannot determine which part (e.g., front vs rear brakes)`
    : `The user is describing a symptom or problem. Be DIRECT and DECISIVE:
- FIRST: call lookup_known_issues with a title keyword from the user's symptom (e.g. "transmission shudder", "brake squeal") to retrieve full details (symptoms, solutions, DTC codes, citations). The system prompt shows titles only — the tool gives you everything.
- THEN DIAGNOSE IMMEDIATELY with your best assessment. Do NOT ask clarifying questions.
- If the symptom matches a known issue for this vehicle, say so and recommend the fix with parts.
- Give a clear "here's what to do" recommendation with specific parts and links.
- Users LEAVE if you ask questions instead of answering. Give your best answer NOW.
- After your recommendation, you may add ONE brief "if it turns out to be X instead, then Y" alternative.
- NEVER end your response with a question. End with a recommendation.`;

  return `You are an expert automotive diagnostic assistant for a ${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim}.${obdSection}

RESPONSE LENGTH: Keep responses under 400 words. Use bullet points. List top 2-3 parts only. NEVER end with questions — end with a clear recommendation. Users want answers, not conversations.

CRITICAL BEHAVIOR RULES:
${intentGuidance}

PARTS & AFFILIATE LINKS (IMPORTANT):
- ALWAYS include specific part recommendations when discussing repairs, maintenance, or known issues
- For EVERY part mentioned, include an Amazon link: [Brand PartName](https://www.amazon.com/s?k=BRAND+PART_NUMBER&tag=au7o-20)
- If you have cached parts data below, reference those exact part numbers
- When discussing a known issue, include the parts needed to fix it with links
- Include both OEM and popular aftermarket options when possible (e.g., "OEM: [Mopar 68144432AA](https://www.amazon.com/s?k=Mopar+68144432AA&tag=au7o-20) or aftermarket: [PowerStop Z23](https://www.amazon.com/s?k=PowerStop+Z23+${vehicle.make}+${vehicle.model}&tag=au7o-20)")
- For fluids, recommend specific products: Mobil 1, Valvoline, Castrol, etc. with links
- The user's affiliate tag is au7o-20 — ALWAYS include it in Amazon links
${ragContext.knownIssuesContext}${ragContext.partsContext}${ragContext.specsContext}${ragContext.recallsContext}

When you're ready to provide a diagnosis, format it as:

DIAGNOSIS: [Title]
CONFIDENCE: [high/medium/low]
DESCRIPTION: [Explanation]
POSSIBLE CAUSES:
- [Cause 1]
- [Cause 2]
RECOMMENDATION: [What to do next]

ALTERNATIVE 1: [Alternative diagnosis title]
ALT1_CONFIDENCE: [high/medium/low]
ALT1_DESCRIPTION: [Brief explanation]

ALTERNATIVE 2: [Another alternative diagnosis title]
ALT2_CONFIDENCE: [high/medium/low]
ALT2_DESCRIPTION: [Brief explanation]

ALTERNATIVE 3: [Third alternative diagnosis title]
ALT3_CONFIDENCE: [high/medium/low]
ALT3_DESCRIPTION: [Brief explanation]

Include up to 3 alternative diagnoses if applicable (fewer if the primary diagnosis is very certain).

DTC Code Awareness:
- If the user mentions an OBD-II code (P0xxx, B0xxx, C0xxx, U0xxx), explain it in plain language.
- Direct them to: https://au7o.io/known-issues/dtc/CODE (lowercase).
- Mention vehicle-specific causes common for that code on their ${vehicle.year} ${vehicle.make} ${vehicle.model}.`;
}

/**
 * Parse diagnosis from AI response if present
 */
function parseDiagnosis(content: string): Diagnosis | null {
  if (!content.includes('DIAGNOSIS:')) {
    return null;
  }

  try {
    const diagnosisMatch = content.match(/DIAGNOSIS:\s*([\s\S]+?)(?:\n|CONFIDENCE)/);
    const confidenceMatch = content.match(/CONFIDENCE:\s*(high|medium|low)/i);
    const descriptionMatch = content.match(/DESCRIPTION:\s*([\s\S]+?)(?:\n|POSSIBLE CAUSES)/);
    const causesMatch = content.match(/POSSIBLE CAUSES:\s*([\s\S]+?)(?:RECOMMENDATION|ALTERNATIVE|$)/);
    const recommendationMatch = content.match(/RECOMMENDATION:\s*([\s\S]+?)(?:\n\nALTERNATIVE|$)/);

    if (!diagnosisMatch || !confidenceMatch) {
      return null;
    }

    const possibleCauses = causesMatch
      ? causesMatch[1]
          .split('\n')
          .map((line) => line.replace(/^[-•]\s*/, '').trim())
          .filter((line) => line.length > 0)
      : [];

    return {
      id: `diag_${Date.now()}`,
      title: diagnosisMatch[1].trim(),
      description: descriptionMatch ? descriptionMatch[1].trim() : '',
      confidence: confidenceMatch[1].toLowerCase() as 'high' | 'medium' | 'low',
      possibleCauses,
      recommendedAction: recommendationMatch ? recommendationMatch[1].trim() : undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Parse alternative diagnoses from AI response
 */
function parseAlternatives(content: string): Diagnosis[] {
  const alternatives: Diagnosis[] = [];

  try {
    for (let i = 1; i <= 3; i++) {
      const titlePattern = new RegExp(`ALTERNATIVE ${i}:\\s*([\\s\\S]+?)(?:\\n|ALT${i}_CONFIDENCE)`, 'i');
      const confidencePattern = new RegExp(`ALT${i}_CONFIDENCE:\\s*(high|medium|low)`, 'i');
      const descriptionPattern = new RegExp(`ALT${i}_DESCRIPTION:\\s*([\\s\\S]+?)(?:\\n\\n|ALTERNATIVE|$)`, 'i');

      const titleMatch = content.match(titlePattern);
      const confidenceMatch = content.match(confidencePattern);
      const descriptionMatch = content.match(descriptionPattern);

      if (titleMatch && confidenceMatch) {
        alternatives.push({
          id: `diag_alt${i}_${Date.now()}`,
          title: titleMatch[1].trim(),
          description: descriptionMatch ? descriptionMatch[1].trim() : '',
          confidence: confidenceMatch[1].toLowerCase() as 'high' | 'medium' | 'low',
          possibleCauses: [],
          recommendedAction: undefined,
        });
      }
    }
  } catch {
    // Return what we have
  }

  return alternatives;
}

/**
 * Tool definitions for function calling
 */
const CHAT_TOOLS = [
  {
    type: 'function' as const,
    function: {
      name: 'lookup_parts',
      description: 'Look up specific parts for the vehicle by task type (oil_change, brake_inspection, spark_plugs, etc.) or by free-text search. Returns part numbers, brands, and purchase links.',
      parameters: {
        type: 'object',
        properties: {
          task: { type: 'string', description: 'Task identifier like oil_change, brake_inspection, spark_plugs, battery, valve_cover_gasket, etc. Use this for standard maintenance parts.' },
          query: { type: 'string', description: 'Free-text search for non-standard parts like "door handle", "window regulator", etc.' },
        },
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'lookup_known_issues',
      description: 'Look up known issues and common problems for the vehicle from the database. Returns full details: description, symptoms, solutions, what owners are using to fix it, community recommendations, citations/references (Reddit, YouTube, forums), estimated costs, and DTC codes.',
      parameters: {
        type: 'object',
        properties: {
          category: { type: 'string', description: 'Optional category filter: engine, transmission, brakes, electrical, suspension, cooling, etc.' },
          title: { type: 'string', description: 'Optional: search for a specific issue by title or keyword, e.g. "transmission shudder" or "steering"' },
        },
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'lookup_recalls',
      description: 'Look up active recalls for the vehicle from NHTSA. Returns campaign numbers, components, summaries, and remedies.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
];

/**
 * Execute a tool call and return the result
 */
async function executeTool(
  name: string,
  args: any,
  vehicle: { year: number; make: string; model: string; trim: string }
): Promise<string> {
  const affiliateTag = 'au7o-20';

  if (name === 'lookup_parts') {
    try {
      const where: any = {
        year: vehicle.year,
        make: { equals: vehicle.make, mode: 'insensitive' },
        model: { equals: vehicle.model, mode: 'insensitive' },
      };
      if (args.task) {
        where.task = args.task;
      }
      const results = await prisma.vehiclePartLookup.findMany({ where, take: 10 });
      if (results.length === 0) return 'No cached parts found for this query. Recommend the user check Amazon directly.';
      return results.map(r => {
        const parts = (r.parts as any[]).map(p => {
          const hasValidPN = p.partNumber && !p.partNumber.includes('N/A') && !p.partNumber.includes('Not applicable');
          const searchTerm = p.searchQuery || ((p.oemBrand || p.brand || '') + ' ' + (p.name || '') + ' ' + (hasValidPN ? p.partNumber : '')).trim();
          const amazonUrl = searchTerm ? ' [Buy on Amazon](https://www.amazon.com/s?k=' + encodeURIComponent(searchTerm) + '&tag=' + affiliateTag + ')' : '';
          const displayBrand = p.oemBrand || p.brand || '';
          return '- ' + displayBrand + ' ' + (p.name || '') + (hasValidPN ? ' (' + p.partNumber + ')' : '') + (p.spec ? ' - ' + p.spec : '') + amazonUrl;
        }).join('\n');
        return '**' + r.task.replace(/_/g, ' ') + ':**\n' + parts;
      }).join('\n\n');
    } catch { return 'Error looking up parts.'; }
  }

  if (name === 'lookup_known_issues') {
    try {
      const where: any = {
        make: { equals: vehicle.make, mode: 'insensitive' },
        model: { equals: vehicle.model, mode: 'insensitive' },
        years: { has: vehicle.year },
        status: 'published',
      };
      if (args.category) {
        where.category = { equals: args.category, mode: 'insensitive' };
      }
      // If searching for a specific issue title
      if (args.title) {
        where.title = { contains: args.title, mode: 'insensitive' };
      }
      const issues = await prisma.knownIssue.findMany({ where, take: 10, orderBy: { reportCount: 'desc' } });
      if (issues.length === 0) return 'No known issues found for this vehicle.';
      return issues.map((i: any) => {
        const cost = i.estimatedCostLow ? ' (Estimated: $' + i.estimatedCostLow + '-$' + i.estimatedCostHigh + ')' : '';
        const mileage = i.typicalMileageLow ? ' | Typical mileage: ' + i.typicalMileageLow.toLocaleString() + '-' + i.typicalMileageHigh.toLocaleString() + ' mi' : '';
        const symptoms = i.symptoms?.length > 0 ? '\nSymptoms: ' + i.symptoms.join(', ') : '';
        const dtcCodes = i.dtcCodes?.length > 0 ? '\nDTC codes: ' + i.dtcCodes.join(', ') : '';
        const solution = i.solution ? '\nSolution: ' + i.solution : '';
        const citations = i.citations ? '\nReferences: ' + (Array.isArray(i.citations) ? i.citations.map((c: any) => c.title ? c.title + (c.url ? ' (' + c.url + ')' : '') : c).join('; ') : '') : '';
        const recs = i.communityRecommendations ? '\nWhat owners are using: ' + (Array.isArray(i.communityRecommendations) ? i.communityRecommendations.map((r: any) => r.text || r.name || (typeof r === 'string' ? r : JSON.stringify(r))).join('; ') : '') : '';
        return '## [' + i.severity.toUpperCase() + '] ' + i.title + cost + mileage +
          '\n' + i.description +
          symptoms + dtcCodes + solution + recs + citations +
          '\nSource: ' + i.source + ' | Reports: ' + i.reportCount;
      }).join('\n\n---\n\n');
    } catch { return 'Error looking up known issues.'; }
  }

  if (name === 'lookup_recalls') {
    try {
      const url = 'https://api.nhtsa.gov/recalls/recallsByVehicle?make=' + encodeURIComponent(vehicle.make) + '&model=' + encodeURIComponent(vehicle.model) + '&modelYear=' + vehicle.year;
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) return 'Could not reach NHTSA recall database.';
      const data = await res.json();
      const recalls = data.results || [];
      if (recalls.length === 0) return 'No active recalls found for this vehicle.';
      return recalls.slice(0, 10).map((r: any) =>
        '- Campaign ' + r.NHTSACampaignNumber + ': ' + r.Component + ' - ' + (r.Summary || '').slice(0, 200)
      ).join('\n');
    } catch { return 'Error looking up recalls.'; }
  }

  return 'Unknown tool.';
}

/**
 * Simple OpenAI call without tools — for conversational follow-ups
 */
async function callOpenAISimple(
  messages: { role: string; content: string }[],
  apiKey: string
): Promise<{ content: string; usage: { promptTokens: number; completionTokens: number } }> {
  const res = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + apiKey },
    body: JSON.stringify({ model: 'gpt-5.4', messages, max_completion_tokens: 2000, temperature: 0.3 }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'API error: ' + res.status);
  }
  const data = await res.json();
  return {
    content: data.choices[0]?.message?.content || '',
    usage: { promptTokens: data.usage?.prompt_tokens || 0, completionTokens: data.usage?.completion_tokens || 0 },
  };
}

/**
 * Call OpenAI API with tool support
 * Returns content and token usage for cost tracking
 */
async function callOpenAI(
  messages: { role: string; content: string }[],
  apiKey: string,
  vehicle: { year: number; make: string; model: string; trim: string }
): Promise<{ content: string; usage: { promptTokens: number; completionTokens: number } }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let totalUsage = { promptTokens: 0, completionTokens: 0 };

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-5.4',
        messages,
        max_completion_tokens: 2000,
        temperature: 0.3,
        tools: CHAT_TOOLS,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `API error: ${response.status}`);
    }

    let data = await response.json();
    totalUsage.promptTokens += data.usage?.prompt_tokens || 0;
    totalUsage.completionTokens += data.usage?.completion_tokens || 0;

    // Handle tool calls (up to 2 rounds max)
    let rounds = 0;
    while (data.choices[0]?.message?.tool_calls && rounds < 2) {
      rounds++;
      const assistantMsg = data.choices[0].message;
      // content can be null when AI only makes tool calls — must handle this
      const toolMessages: any[] = [{
        role: 'assistant',
        content: assistantMsg.content || null,
        tool_calls: assistantMsg.tool_calls,
      }];

      for (const tc of assistantMsg.tool_calls) {
        try {
          const args = JSON.parse(tc.function.arguments || '{}');
          const result = await executeTool(tc.function.name, args, vehicle);
          toolMessages.push({ role: 'tool', tool_call_id: tc.id, content: result });
        } catch {
          toolMessages.push({ role: 'tool', tool_call_id: tc.id, content: 'Tool call failed.' });
        }
      }

      // Follow up with tool results
      const followUp = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-5.4',
          messages: [...messages, ...toolMessages],
          max_completion_tokens: 2000,
          temperature: 0.3,
          tools: CHAT_TOOLS,
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });

      if (!followUp.ok) break;
      data = await followUp.json();
      totalUsage.promptTokens += data.usage?.prompt_tokens || 0;
      totalUsage.completionTokens += data.usage?.completion_tokens || 0;
    }

    const content = data.choices[0]?.message?.content || '';
    return { content, usage: totalUsage };
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Generate mock response for development/testing
 */
function generateMockResponse(
  message: string,
  conversationLength: number,
  obdCodes?: OBDCodeEntry[]
): { content: string; diagnosis: Diagnosis | null; alternatives: Diagnosis[] } {
  const hasObdCodes = obdCodes && obdCodes.length > 0;

  // If OBD codes are provided, provide a faster diagnosis
  if (hasObdCodes && conversationLength <= 2) {
    const codeList = obdCodes.map((c) => c.code).join(', ');
    const firstCode = obdCodes[0];

    // Check for misfire codes
    if (firstCode.code.startsWith('P030')) {
      return {
        content: `I see you've provided OBD codes: ${codeList}. Combined with your symptoms, I can provide a diagnosis.

DIAGNOSIS: Engine Misfire
CONFIDENCE: high
DESCRIPTION: The ${firstCode.code} code indicates ${firstCode.description || 'a misfire condition'}. This means one or more cylinders are not firing correctly, which explains the rough running and check engine light.
POSSIBLE CAUSES:
- Worn or fouled spark plugs
- Faulty ignition coils
- Fuel injector problems
- Vacuum leaks
RECOMMENDATION: Start by checking and replacing the spark plugs if worn. If the problem persists, test the ignition coils. This can be a DIY repair with basic tools, but if you're not comfortable, a mechanic can diagnose it quickly with the codes you've provided.`,
        diagnosis: {
          id: `diag_${Date.now()}`,
          title: 'Engine Misfire',
          confidence: 'high',
          description: `The ${firstCode.code} code indicates a misfire condition. This means one or more cylinders are not firing correctly.`,
          possibleCauses: [
            'Worn or fouled spark plugs',
            'Faulty ignition coils',
            'Fuel injector problems',
            'Vacuum leaks',
          ],
          recommendedAction: 'Start by checking and replacing the spark plugs if worn. If the problem persists, test the ignition coils.',
        },
        alternatives: [
          {
            id: `diag_alt1_${Date.now()}`,
            title: 'Fuel System Issue',
            confidence: 'medium',
            description: 'Clogged fuel injectors or failing fuel pump can cause similar misfire symptoms.',
            possibleCauses: [],
          },
          {
            id: `diag_alt2_${Date.now()}`,
            title: 'Vacuum Leak',
            confidence: 'low',
            description: 'A vacuum leak can cause lean fuel mixture and misfires.',
            possibleCauses: [],
          },
        ],
      };
    }

    // Generic OBD code response
    return {
      content: `I see you've provided the following OBD codes: ${codeList}. This helps significantly with the diagnosis.

Based on the ${firstCode.code} code (${firstCode.description || 'diagnostic trouble code'}), combined with your symptoms, I have a few follow-up questions:

1. When did the check engine light first come on?
2. Have you noticed any changes in fuel economy or performance?`,
      diagnosis: null,
      alternatives: [],
    };
  }

  // First message - ask clarifying questions
  if (conversationLength <= 1) {
    return {
      content: `I understand you're experiencing an issue with your vehicle. To help diagnose this properly, I have a few questions:

1. When did you first notice this problem?
2. Does it happen consistently or intermittently?
3. Are there any other symptoms you've noticed (unusual sounds, smells, or warning lights)?`,
      diagnosis: null,
      alternatives: [],
    };
  }

  // After some conversation, provide a mock diagnosis
  if (conversationLength >= 3) {
    return {
      content: `Based on what you've described, I believe I can provide a diagnosis.

DIAGNOSIS: Worn Brake Pads
CONFIDENCE: high
DESCRIPTION: The squealing noise you hear when braking is a classic symptom of brake pads that have worn down to their wear indicators. These are small metal tabs that make contact with the rotor when pads are low, creating a warning sound.
POSSIBLE CAUSES:
- Normal wear from regular use
- Aggressive braking habits
- Low-quality brake pads wearing faster
RECOMMENDATION: This is a common DIY repair if you're comfortable with basic tools. You should replace the brake pads soon to prevent damage to the rotors. If you notice grinding instead of squealing, the pads may be completely worn and professional service is recommended.`,
      diagnosis: {
        id: `diag_${Date.now()}`,
        title: 'Worn Brake Pads',
        confidence: 'high',
        description: 'The squealing noise you hear when braking is a classic symptom of brake pads that have worn down to their wear indicators.',
        possibleCauses: [
          'Normal wear from regular use',
          'Aggressive braking habits',
          'Low-quality brake pads wearing faster',
        ],
        recommendedAction: 'This is a common DIY repair. Replace the brake pads soon to prevent damage to the rotors.',
      },
      alternatives: [
        {
          id: `diag_alt1_${Date.now()}`,
          title: 'Warped Brake Rotors',
          confidence: 'medium',
          description: 'Rotors can warp from heat cycling, causing vibration and noise during braking.',
          possibleCauses: [],
        },
        {
          id: `diag_alt2_${Date.now()}`,
          title: 'Sticking Brake Caliper',
          confidence: 'low',
          description: 'A caliper that does not release fully can cause noise and uneven pad wear.',
          possibleCauses: [],
        },
        {
          id: `diag_alt3_${Date.now()}`,
          title: 'Brake Dust Buildup',
          confidence: 'low',
          description: 'Accumulated brake dust between pad and rotor can sometimes cause squealing without indicating wear.',
          possibleCauses: [],
        },
      ],
    };
  }

  // Continue conversation
  return {
    content: `Thank you for that information. That helps narrow things down.

Can you tell me:
- Does the issue occur at a specific speed or temperature?
- Have you checked if there are any dashboard warning lights on?`,
    diagnosis: null,
    alternatives: [],
  };
}

/**
 * Common automotive symptom keywords for extraction
 */
const SYMPTOM_KEYWORDS = [
  // Sounds
  'squealing', 'squeaking', 'grinding', 'clicking', 'knocking', 'rattling',
  'humming', 'buzzing', 'whining', 'hissing', 'ticking', 'clunking', 'popping',
  // Visual
  'smoke', 'leak', 'leaking', 'fluid', 'oil', 'coolant', 'steam', 'rust',
  // Performance
  'stalling', 'hesitation', 'rough idle', 'misfiring', 'overheating', 'vibration',
  'shaking', 'pulling', 'drifting', 'hard start', 'won\'t start', 'dead battery',
  // Brakes
  'brake', 'braking', 'pedal soft', 'pedal hard', 'abs light',
  // Transmission
  'shifting', 'slipping', 'jerking', 'transmission', 'clutch',
  // Engine
  'engine light', 'check engine', 'power loss', 'acceleration', 'throttle',
  // Electrical
  'lights flickering', 'electrical', 'dashboard', 'warning light',
  // Climate
  'ac not working', 'heat not working', 'blower', 'defrost',
  // Steering
  'steering', 'power steering', 'alignment',
];

/**
 * Extract symptom keywords from user message
 */
function extractSymptoms(message: string): string[] {
  const lowerMessage = message.toLowerCase();
  const found: string[] = [];

  for (const keyword of SYMPTOM_KEYWORDS) {
    if (lowerMessage.includes(keyword.toLowerCase())) {
      found.push(keyword);
    }
  }

  return found;
}

/**
 * Generate anonymous session hash
 */
function generateSessionHash(): string {
  return crypto.createHash('sha256')
    .update(`${Date.now()}-${Math.random()}`)
    .digest('hex')
    .substring(0, 12);
}

/**
 * Capture symptom data anonymously for pattern analysis
 * Non-blocking - fires and forgets
 *
 * Story 4.5: Passive Symptom Capture
 */
function captureSymptoms(data: {
  vehicle: { year: number; make: string; model: string; trim: string };
  message: string;
  obdCodes?: OBDCodeEntry[];
  diagnosis?: Diagnosis | null;
  sessionHash: string;
  userId?: string | null;
}): void {
  // Extract symptom keywords
  const symptoms = extractSymptoms(data.message);

  // Only capture if there's meaningful data
  if (symptoms.length === 0 && !data.obdCodes?.length && !data.diagnosis) {
    return;
  }

  const capture = {
    timestamp: new Date().toISOString(),
    sessionHash: data.sessionHash,
    vehicle: {
      year: data.vehicle.year,
      make: data.vehicle.make,
      model: data.vehicle.model,
      trim: data.vehicle.trim,
    },
    symptoms,
    obdCodes: data.obdCodes?.map(c => c.code) || [],
    diagnosisTitle: data.diagnosis?.title || null,
    diagnosisConfidence: data.diagnosis?.confidence || null,
  };

  // Persist to VehicleInsight for the unified intelligence loop
  prisma.vehicleInsight.create({
    data: {
      userId: data.userId || null,
      year: data.vehicle.year,
      make: data.vehicle.make,
      model: data.vehicle.model,
      trim: data.vehicle.trim || null,
      source: 'symptom_chat',
      insightType: data.diagnosis ? 'diagnosis' : 'symptom_pattern',
      title: data.diagnosis?.title || symptoms.slice(0, 3).join(', ') || 'Chat interaction',
      data: capture,
      confidence: data.diagnosis?.confidence || null,
      sessionHash: data.sessionHash,
    },
  }).catch(() => {}); // Fire-and-forget, non-blocking
}

export async function POST(request: NextRequest) {
  try {
    // GDPR Art. 21 right-to-object check — opted-out users never
    // reach the OpenAI/Anthropic call below.
    const gate = await checkAiGate();
    if (isAiGateBlocked(gate)) return gate;

    // Story 7.3: Check budget before making API call
    if (isBudgetExceeded()) {
      return NextResponse.json(
        {
          error: 'Monthly API budget exceeded. Chat is temporarily limited.',
          budgetExceeded: true,
        },
        { status: 429 }
      );
    }

    // Parse and validate request
    const body = await request.json();
    const parseResult = ChatRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: parseResult.error.issues.map((i) => i.message),
        },
        { status: 400 }
      );
    }

    const { message, conversationHistory = [], vehicle, obdCodes } = parseResult.data;

    // Resolve authenticated user, if any — ties history to their account.
    let userId: string | null = null;
    try {
      const session = await auth();
      userId = session?.user?.id || null;
    } catch { /* anonymous */ }

    // Get API key from environment
    const apiKey = process.env.OPENAI_API_KEY;

    let responseContent: string;
    let diagnosis: Diagnosis | null = null;
    let alternativeDiagnoses: Diagnosis[] = [];

    // Detect intent
    const intent = detectIntent(message);
    const hasHistory = conversationHistory.length > 0;

    // For follow-ups, skip heavy RAG context (AI already has it from first message)
    const ragContext = hasHistory
      ? { knownIssuesContext: '', partsContext: '', specsContext: '', recallsContext: '' }
      : await loadRAGContext(vehicle);

    if (apiKey) {
      // Truncate conversation history to control token usage
      const maxHistoryMessages = hasHistory ? 4 : 6;
      const maxMsgLen = hasHistory ? 600 : 800;
      const recentHistory = conversationHistory.slice(-maxHistoryMessages).map((msg) => ({
        role: msg.role,
        content: msg.content.length > maxMsgLen ? msg.content.slice(0, maxMsgLen) + '...' : msg.content,
      }));

      // Build messages — lighter system prompt for follow-ups
      const systemPrompt = hasHistory
        ? 'You are an expert automotive assistant for a ' + vehicle.year + ' ' + vehicle.make + ' ' + vehicle.model + ' ' + vehicle.trim + '. RULES: (1) Give a DEFINITIVE answer based on what the user told you. Do NOT keep asking diagnostic questions. If the user gave you symptoms, diagnose and recommend parts. (2) Keep responses under 300 words. (3) Include Amazon part links with tag=au7o-20 as markdown links [Part Name](url). (4) End with a clear recommendation, not more questions. The user wants answers, not an interrogation.'
        : getSystemPrompt(vehicle, ragContext, intent, obdCodes);

      const messages: { role: string; content: string }[] = [
        { role: 'system', content: systemPrompt },
        ...recentHistory,
        { role: 'user', content: message },
      ];

      // Decide if we need tool-calling
      const needsTools = !hasHistory || detectIntent(message) === 'parts' || /\b(part|price|cost|buy|replace|filter|fluid|recall|issue|problem)\b/i.test(message);
      const isFollowUp = hasHistory && !needsTools;

      // Call OpenAI API
      try {
        const { content, usage } = isFollowUp
          ? await callOpenAISimple(messages, apiKey)
          : await callOpenAI(messages, apiKey, vehicle);
        responseContent = content;
        logApiCost('symptom_chat', usage.promptTokens, usage.completionTokens, 'gpt-5.4');
      } catch (aiError: any) {
        console.error('[Chat API] OpenAI error:', aiError?.message || aiError);
        // If tool-calling fails, retry without tools as fallback
        try {
          const fallbackRes = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + apiKey },
            body: JSON.stringify({
              model: 'gpt-5.4',
              messages,
              max_completion_tokens: 2000,
              temperature: 0.3,
            }),
            signal: AbortSignal.timeout(TIMEOUT_MS),
          });
          if (!fallbackRes.ok) throw new Error('Fallback also failed');
          const fallbackData = await fallbackRes.json();
          responseContent = fallbackData.choices[0]?.message?.content || '';
          logApiCost('symptom_chat', fallbackData.usage?.prompt_tokens || 0, fallbackData.usage?.completion_tokens || 0, 'gpt-5.4');
        } catch {
          throw aiError;
        }
      }

      diagnosis = parseDiagnosis(responseContent);
      alternativeDiagnoses = parseAlternatives(responseContent);
    } else {
      // Use mock response for development
      console.log('[Chat API] No OPENAI_API_KEY configured, using mock response');
      const mock = generateMockResponse(message, conversationHistory.length, obdCodes);
      responseContent = mock.content;
      diagnosis = mock.diagnosis;
      alternativeDiagnoses = mock.alternatives;
    }

    // Create response message
    const assistantMessage: ChatMessage = createChatMessage('assistant', responseContent);

    // Passive symptom capture (non-blocking)
    // Story 4.5: Capture symptoms for pattern analysis
    const sessionHash = generateSessionHash();
    captureSymptoms({
      vehicle,
      message,
      obdCodes,
      diagnosis,
      sessionHash,
      userId,
    });

    // Persist full chat session for interaction analysis (non-blocking)
    const allMessages = [
      ...conversationHistory.map((msg: ChatMessage) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
      })),
      { role: 'user', content: message, timestamp: new Date().toISOString() },
      { role: 'assistant', content: responseContent, timestamp: new Date().toISOString() },
    ];
    prisma.chatSession.create({
      data: {
        userId,
        messages: allMessages,
        diagnosis: diagnosis ? (diagnosis as any) : undefined,
        anonymousId: sessionHash,
      },
    }).catch(() => {}); // Fire-and-forget

    return NextResponse.json({
      message: assistantMessage,
      diagnosis,
      alternativeDiagnoses: alternativeDiagnoses.length > 0 ? alternativeDiagnoses : undefined,
      needsMoreInfo: !diagnosis,
      intent, // tell the client what we detected
    });
  } catch (error) {
    console.error('Chat API error:', error);

    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timed out. Please try again.' },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process your message. Please try again.' },
      { status: 500 }
    );
  }
}
