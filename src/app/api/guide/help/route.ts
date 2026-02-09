import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * Guide Help API Route
 *
 * Story 3.4: Inline AI Help Chat
 *
 * Provides contextual help for users during guide execution.
 * Answers questions about the current step, tool usage, safety, etc.
 */

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const TIMEOUT_MS = 20000;

const HelpRequestSchema = z.object({
  question: z.string().min(1).max(500),
  context: z.object({
    guideTitle: z.string(),
    stepNumber: z.number(),
    stepInstruction: z.string(),
    vehicle: z.object({
      year: z.number(),
      make: z.string(),
      model: z.string(),
    }),
    toolsRequired: z.array(z.string()).optional(),
    safetyWarnings: z.array(z.string()).optional(),
  }),
});

function getSystemPrompt(context: z.infer<typeof HelpRequestSchema>['context']) {
  const toolsSection = context.toolsRequired?.length
    ? `\nTools needed for this step: ${context.toolsRequired.join(', ')}`
    : '';

  const safetySection = context.safetyWarnings?.length
    ? `\nSafety warnings for this step:\n${context.safetyWarnings.map(w => `- ${w}`).join('\n')}`
    : '';

  return `You are a helpful automotive repair assistant embedded in a maintenance guide app. The user is currently performing maintenance on their ${context.vehicle.year} ${context.vehicle.make} ${context.vehicle.model}.

They are working on: "${context.guideTitle}"
Current step ${context.stepNumber}: "${context.stepInstruction}"${toolsSection}${safetySection}

Your role is to:
1. Answer questions about the current step clearly and concisely
2. Provide safety reminders when relevant
3. Explain unfamiliar terms or techniques
4. Suggest alternatives if they're stuck
5. Help troubleshoot if something isn't working

Guidelines:
- Keep responses brief and actionable (2-4 sentences max unless more detail is needed)
- Use simple language - the user may not be an expert
- Always prioritize safety
- If unsure, suggest they consult a professional
- Don't provide information outside the scope of this guide step`;
}

async function callOpenAI(
  messages: { role: string; content: string }[],
  apiKey: string
): Promise<string> {
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
        model: 'gpt-4.1-mini',
        messages,
        max_completion_tokens: 300,
        temperature: 0.3,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

function generateMockResponse(question: string, context: z.infer<typeof HelpRequestSchema>['context']): string {
  const q = question.toLowerCase();

  if (q.includes('tool') || q.includes('wrench') || q.includes('socket')) {
    return `For this step, you'll typically need a socket wrench set. The most common sizes used are 10mm, 12mm, 14mm, and 17mm. If you don't have the exact size, an adjustable wrench can work in a pinch.`;
  }

  if (q.includes('tight') || q.includes('torque') || q.includes('how much')) {
    return `Tighten bolts firmly but don't over-torque. A good rule is "snug plus a quarter turn." If the component has specific torque specs, they're usually listed in your vehicle's service manual.`;
  }

  if (q.includes('safe') || q.includes('danger') || q.includes('careful')) {
    return `Good question about safety! Always ensure the vehicle is on a level surface with the parking brake engaged. If working under the vehicle, use jack stands - never rely on a jack alone. Wear safety glasses when working overhead.`;
  }

  if (q.includes('stuck') || q.includes("won't") || q.includes('hard')) {
    return `If a bolt or part is stuck, try applying penetrating oil (like PB Blaster) and wait 10-15 minutes. Don't force it - stripped bolts create bigger problems. Sometimes gentle tapping with a rubber mallet helps break corrosion free.`;
  }

  if (q.includes('where') || q.includes('find') || q.includes('locate')) {
    return `On your ${context.vehicle.year} ${context.vehicle.make} ${context.vehicle.model}, this component is typically located in the engine bay. Check your owner's manual for exact location, or look for labels under the hood.`;
  }

  return `For step ${context.stepNumber}, take your time and follow the instruction carefully. If something doesn't look right or feels wrong, it's better to stop and verify before continuing. Feel free to ask a more specific question about this step.`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = HelpRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parseResult.error.issues },
        { status: 400 }
      );
    }

    const { question, context } = parseResult.data;
    const apiKey = process.env.OPENAI_API_KEY;

    let responseContent: string;

    if (apiKey) {
      const messages = [
        { role: 'system', content: getSystemPrompt(context) },
        { role: 'user', content: question },
      ];
      responseContent = await callOpenAI(messages, apiKey);
    } else {
      console.log('[Guide Help API] No OPENAI_API_KEY configured, using mock response');
      responseContent = generateMockResponse(question, context);
    }

    return NextResponse.json({
      answer: responseContent,
      stepNumber: context.stepNumber,
    });
  } catch (error) {
    console.error('Guide Help API error:', error);

    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timed out. Please try again.' },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to get help. Please try again.' },
      { status: 500 }
    );
  }
}
