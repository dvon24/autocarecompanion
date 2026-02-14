import { NextRequest, NextResponse } from 'next/server';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const TIMEOUT_MS = 15000;

interface ParsedVehicle {
  year: number;
  make: string;
  model: string;
  trim?: string;
  engine?: string;
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
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 500,
        temperature: 0.1,
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

function generateMockValidation(input: string): { valid: boolean; vehicle?: ParsedVehicle; error?: string } {
  // Simple regex-based parsing for mock
  const yearMatch = input.match(/\b(19|20)\d{2}\b/);
  const makePatterns = ['honda', 'toyota', 'ford', 'chevrolet', 'chevy', 'bmw', 'mercedes', 'audi', 'nissan', 'hyundai', 'kia', 'mazda', 'subaru', 'volkswagen', 'vw', 'jeep', 'ram', 'dodge', 'gmc', 'buick', 'cadillac', 'lexus', 'acura', 'infiniti'];

  const inputLower = input.toLowerCase();
  let make = '';
  for (const pattern of makePatterns) {
    if (inputLower.includes(pattern)) {
      make = pattern.charAt(0).toUpperCase() + pattern.slice(1);
      if (pattern === 'chevy') make = 'Chevrolet';
      if (pattern === 'vw') make = 'Volkswagen';
      break;
    }
  }

  if (!yearMatch || !make) {
    return { valid: false, error: 'Could not identify year and make. Please include both (e.g., "2015 Honda Civic")' };
  }

  // Extract model (word after make)
  const makeIndex = inputLower.indexOf(make.toLowerCase());
  const afterMake = input.slice(makeIndex + make.length).trim();
  const modelMatch = afterMake.match(/^(\w+)/);
  const model = modelMatch ? modelMatch[1] : '';

  if (!model) {
    return { valid: false, error: 'Could not identify the model. Please include the model name.' };
  }

  // Extract trim (word after model, if present)
  const afterModel = afterMake.slice(model.length).trim();
  const trimMatch = afterModel.match(/^([A-Z]{1,4}|[A-Za-z]+)\b/);
  const trim = trimMatch ? trimMatch[1] : undefined;

  // Extract engine (look for patterns like "1.8L", "2.0T", "V6", "V8")
  const engineMatch = input.match(/\b(\d+\.\d+[LT]?|\d+L|V\d|[A-Z]\d+|\d{3,4}cc)\b/i);
  const engine = engineMatch ? engineMatch[1].toUpperCase() : undefined;

  return {
    valid: true,
    vehicle: {
      year: parseInt(yearMatch[0]),
      make,
      model: model.charAt(0).toUpperCase() + model.slice(1),
      trim,
      engine,
    },
  };
}

export async function POST(request: NextRequest) {
  try {
    const { input } = await request.json();

    if (!input || typeof input !== 'string') {
      return NextResponse.json(
        { valid: false, error: 'Please provide vehicle information' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      // Use mock validation for development
      console.log('[Vehicle Validate API] No OPENAI_API_KEY configured, using mock validation');
      const result = generateMockValidation(input);
      return NextResponse.json(result);
    }

    const currentYear = new Date().getFullYear();
    const messages = [
      {
        role: 'system',
        content: `You are a vehicle identification expert. Parse vehicle descriptions and validate they are real vehicles.`,
      },
      {
        role: 'user',
        content: `Parse this vehicle description and validate if it's a real vehicle that was manufactured. Extract the year, make, model, trim (if mentioned), and engine (if mentioned).

Vehicle description: "${input}"

Respond ONLY with a JSON object in this exact format:
{
  "valid": true/false,
  "vehicle": {
    "year": number,
    "make": "string",
    "model": "string",
    "trim": "string or null",
    "engine": "string or null"
  },
  "error": "error message if invalid, null otherwise"
}

Rules:
- Year must be between 1900 and ${currentYear + 1}
- Make and model must be real automotive manufacturers and models
- If the vehicle combination doesn't exist (e.g., "2020 Honda Mustang"), mark as invalid
- If information is ambiguous or incomplete, try to infer the most likely interpretation
- Common abbreviations are acceptable (e.g., "Chevy" = "Chevrolet")
- Normalize make names to proper capitalization
- Trim and engine are optional`,
      },
    ];

    const responseContent = await callOpenAI(messages, apiKey);

    // Parse the JSON from the response
    const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse vehicle information');
    }

    const result = JSON.parse(jsonMatch[0]);

    if (result.valid && result.vehicle) {
      const vehicle: ParsedVehicle = {
        year: result.vehicle.year,
        make: result.vehicle.make,
        model: result.vehicle.model,
        trim: result.vehicle.trim || undefined,
        engine: result.vehicle.engine || undefined,
      };

      return NextResponse.json({ valid: true, vehicle });
    } else {
      return NextResponse.json({
        valid: false,
        error: result.error || 'Could not validate this vehicle combination',
      });
    }
  } catch (error) {
    console.error('Vehicle validation error:', error);
    return NextResponse.json(
      { valid: false, error: 'Unable to validate vehicle. Please try again.' },
      { status: 500 }
    );
  }
}
