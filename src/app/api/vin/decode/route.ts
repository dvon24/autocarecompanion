import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { VINSchema, VINDecodeResultSchema } from '@/schemas/vehicle.schema';

/**
 * VIN Decode API Route
 *
 * Proxies VIN decode requests to NHTSA vPIC API.
 * Keeps API calls server-side per Architecture pattern.
 *
 * NHTSA API: https://vpic.nhtsa.dot.gov/api/
 */

const NHTSA_API_BASE = 'https://vpic.nhtsa.dot.gov/api/vehicles';
const TIMEOUT_MS = 10000; // 10 second timeout per NFR-I1

// Request body schema
const DecodeRequestSchema = z.object({
  vin: VINSchema,
});

// NHTSA API response structure
type NHTSAResult = {
  Variable: string;
  Value: string | null;
  ValueId: string | null;
};

type NHTSAResponse = {
  Count: number;
  Message: string;
  Results: NHTSAResult[];
};

/**
 * Extract a specific variable from NHTSA results
 */
function extractVariable(results: NHTSAResult[], variableName: string): string | null {
  const result = results.find((r) => r.Variable === variableName);
  return result?.Value || null;
}

/**
 * Parse NHTSA response into our VINDecodeResult format
 */
function parseNHTSAResponse(data: NHTSAResponse): z.infer<typeof VINDecodeResultSchema> | null {
  const results = data.Results;

  // Extract core YMMT data
  const yearStr = extractVariable(results, 'Model Year');
  const make = extractVariable(results, 'Make');
  const model = extractVariable(results, 'Model');
  const trim = extractVariable(results, 'Trim');
  const series = extractVariable(results, 'Series'); // Fallback for trim

  // Validate required fields
  if (!yearStr || !make || !model) {
    return null;
  }

  const year = parseInt(yearStr, 10);
  if (isNaN(year)) {
    return null;
  }

  return {
    year,
    make,
    model,
    trim: trim || series || null, // Use series as fallback for trim
    possibleTrims: undefined, // NHTSA doesn't provide multiple trims
  };
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const parseResult = DecodeRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid VIN format',
          details: parseResult.error.issues.map((i) => i.message),
        },
        { status: 400 }
      );
    }

    const { vin } = parseResult.data;

    // Call NHTSA API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(
        `${NHTSA_API_BASE}/DecodeVin/${vin}?format=json`,
        {
          method: 'GET',
          signal: controller.signal,
          headers: {
            Accept: 'application/json',
          },
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`NHTSA API returned ${response.status}`);
      }

      const data: NHTSAResponse = await response.json();

      // Check if NHTSA returned an error
      if (data.Message && data.Message.includes('error')) {
        return NextResponse.json(
          { error: 'VIN could not be decoded', message: data.Message },
          { status: 400 }
        );
      }

      // Parse the response
      const decoded = parseNHTSAResponse(data);

      if (!decoded) {
        return NextResponse.json(
          { error: 'Could not extract vehicle information from VIN' },
          { status: 400 }
        );
      }

      // Validate the result
      const validationResult = VINDecodeResultSchema.safeParse(decoded);
      if (!validationResult.success) {
        return NextResponse.json(
          { error: 'Invalid vehicle data from VIN decode' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        vehicle: validationResult.data,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);

      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'VIN decode request timed out. Please try again.' },
          { status: 504 }
        );
      }

      throw fetchError;
    }
  } catch (error) {
    console.error('VIN decode error:', error);
    return NextResponse.json(
      { error: 'Failed to decode VIN. Please try manual selection.' },
      { status: 500 }
    );
  }
}
