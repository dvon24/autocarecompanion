import { NextRequest, NextResponse } from 'next/server';
import {
  ChatRequestSchema,
  createChatMessage,
  generateMessageId,
  type ChatMessage,
  type Diagnosis,
} from '@/schemas/chat.schema';

/**
 * AI Symptom Chat API Route
 *
 * Handles symptom diagnosis conversations using AI.
 * Per Architecture: Server-side API calls, streaming responses.
 *
 * Uses OpenAI API (configurable to Anthropic).
 * Falls back to mock responses when API key not configured.
 */

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const TIMEOUT_MS = 30000; // 30 second timeout per NFR-I2

/**
 * System prompt for automotive diagnosis
 */
function getSystemPrompt(vehicle: { year: number; make: string; model: string; trim: string }) {
  return `You are an expert automotive diagnostic assistant helping a vehicle owner diagnose issues with their ${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim}.

Your role is to:
1. Ask clarifying questions to understand the symptoms
2. Provide a likely diagnosis when you have enough information
3. Explain the issue in simple terms
4. Recommend whether this is a DIY repair or needs professional help

Guidelines:
- Be conversational and helpful
- Ask one or two questions at a time
- Consider common issues for this specific vehicle
- Always prioritize safety warnings when relevant
- When ready to diagnose, clearly state your diagnosis with confidence level

When you're ready to provide a diagnosis, format it as:

DIAGNOSIS: [Title]
CONFIDENCE: [high/medium/low]
DESCRIPTION: [Explanation]
POSSIBLE CAUSES:
- [Cause 1]
- [Cause 2]
RECOMMENDATION: [What to do next]

Otherwise, continue the conversation naturally to gather more information.`;
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
    const causesMatch = content.match(/POSSIBLE CAUSES:\s*([\s\S]+?)(?:RECOMMENDATION|$)/);
    const recommendationMatch = content.match(/RECOMMENDATION:\s*([\s\S]+?)$/);

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
 * Call OpenAI API
 */
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
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 1000,
        temperature: 0.7,
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

/**
 * Generate mock response for development/testing
 */
function generateMockResponse(
  message: string,
  conversationLength: number
): { content: string; diagnosis: Diagnosis | null } {
  // First message - ask clarifying questions
  if (conversationLength <= 1) {
    return {
      content: `I understand you're experiencing an issue with your vehicle. To help diagnose this properly, I have a few questions:

1. When did you first notice this problem?
2. Does it happen consistently or intermittently?
3. Are there any other symptoms you've noticed (unusual sounds, smells, or warning lights)?`,
      diagnosis: null,
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
    };
  }

  // Continue conversation
  return {
    content: `Thank you for that information. That helps narrow things down.

Can you tell me:
- Does the issue occur at a specific speed or temperature?
- Have you checked if there are any dashboard warning lights on?`,
    diagnosis: null,
  };
}

export async function POST(request: NextRequest) {
  try {
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

    const { message, conversationHistory = [], vehicle } = parseResult.data;

    // Get API key from environment
    const apiKey = process.env.OPENAI_API_KEY;

    let responseContent: string;
    let diagnosis: Diagnosis | null = null;

    if (apiKey) {
      // Build messages for AI
      const messages: { role: string; content: string }[] = [
        { role: 'system', content: getSystemPrompt(vehicle) },
        ...conversationHistory.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        { role: 'user', content: message },
      ];

      // Call OpenAI API
      responseContent = await callOpenAI(messages, apiKey);
      diagnosis = parseDiagnosis(responseContent);
    } else {
      // Use mock response for development
      console.log('[Chat API] No OPENAI_API_KEY configured, using mock response');
      const mock = generateMockResponse(message, conversationHistory.length);
      responseContent = mock.content;
      diagnosis = mock.diagnosis;
    }

    // Create response message
    const assistantMessage: ChatMessage = createChatMessage('assistant', responseContent);

    return NextResponse.json({
      message: assistantMessage,
      diagnosis,
      needsMoreInfo: !diagnosis,
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
