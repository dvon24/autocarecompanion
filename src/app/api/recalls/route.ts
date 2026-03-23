import { NextRequest, NextResponse } from 'next/server';

/**
 * NHTSA Recall Lookup API
 *
 * Queries the NHTSA Recalls API by year/make/model.
 * Docs: https://www.nhtsa.gov/nhtsa-recall-api
 *
 * Also supports VIN-based lookup for more precise results.
 */

const NHTSA_RECALLS_API = 'https://api.nhtsa.gov/recalls/recallsByVehicle';
const NHTSA_VIN_DECODE_API = 'https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues';
const TIMEOUT_MS = 10000;

interface NHTSARecall {
  NHTSACampaignNumber: string;
  Manufacturer: string;
  Component: string;
  Summary: string;
  Consequence: string;
  Remedy: string;
  ReportReceivedDate: string;
  NHTSAActionNumber: string;
  ParkIt: boolean;
  ParkOutSide: boolean;
}

interface NHTSARecallResponse {
  Count: number;
  Message: string;
  results: NHTSARecall[];
}

export interface RecallItem {
  campaignNumber: string;
  component: string;
  summary: string;
  consequence: string;
  remedy: string;
  reportDate: string;
  manufacturer: string;
  parkIt: boolean;
  parkOutside: boolean;
  severity: 'critical' | 'high' | 'medium';
}

function classifySeverity(recall: NHTSARecall): 'critical' | 'high' | 'medium' {
  // "Park It" recalls are the most severe — vehicle should not be driven
  if (recall.ParkIt) return 'critical';

  // Check consequence text for fire/crash/injury keywords
  const consequence = (recall.Consequence || '').toLowerCase();
  if (
    consequence.includes('fire') ||
    consequence.includes('crash') ||
    consequence.includes('injury') ||
    consequence.includes('death') ||
    consequence.includes('loss of control')
  ) {
    return 'high';
  }

  return 'medium';
}

function transformRecall(r: NHTSARecall): RecallItem {
  return {
    campaignNumber: r.NHTSACampaignNumber,
    component: r.Component,
    summary: r.Summary,
    consequence: r.Consequence,
    remedy: r.Remedy,
    reportDate: r.ReportReceivedDate,
    manufacturer: r.Manufacturer,
    parkIt: r.ParkIt,
    parkOutside: r.ParkOutSide,
    severity: classifySeverity(r),
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const make = searchParams.get('make');
    const model = searchParams.get('model');
    const vin = searchParams.get('vin');

    // Resolve year/make/model — either from params or by decoding VIN
    let resolvedYear = year;
    let resolvedMake = make;
    let resolvedModel = model;

    if (vin && vin.length === 17) {
      // VIN decode via NHTSA VPIC API to get year/make/model
      const decodeController = new AbortController();
      const decodeTimeout = setTimeout(() => decodeController.abort(), TIMEOUT_MS);
      try {
        const decodeRes = await fetch(
          `${NHTSA_VIN_DECODE_API}/${encodeURIComponent(vin)}?format=json`,
          { signal: decodeController.signal, headers: { Accept: 'application/json' } }
        );
        clearTimeout(decodeTimeout);
        if (decodeRes.ok) {
          const decodeData = await decodeRes.json();
          const result = decodeData.Results?.[0];
          if (result?.Make && result?.Model && result?.ModelYear) {
            resolvedYear = result.ModelYear;
            resolvedMake = result.Make;
            resolvedModel = result.Model;
          }
        }
      } catch {
        clearTimeout(decodeTimeout);
        // Fall through — if VIN decode fails, try year/make/model params
      }
    }

    if (!resolvedYear || !resolvedMake || !resolvedModel) {
      return NextResponse.json(
        { error: 'Provide year/make/model or a valid 17-character VIN' },
        { status: 400 }
      );
    }

    const url = `${NHTSA_RECALLS_API}?make=${encodeURIComponent(resolvedMake)}&model=${encodeURIComponent(resolvedModel)}&modelYear=${encodeURIComponent(resolvedYear)}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`NHTSA API returned ${response.status}`);
    }

    const data: NHTSARecallResponse = await response.json();

    const recalls = (data.results || []).map(transformRecall);

    // Sort by severity (critical first) then by date (newest first)
    const severityOrder = { critical: 0, high: 1, medium: 2 };
    recalls.sort((a, b) => {
      const sev = severityOrder[a.severity] - severityOrder[b.severity];
      if (sev !== 0) return sev;
      return new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime();
    });

    return NextResponse.json({
      count: recalls.length,
      recalls,
      source: vin ? 'vin' : 'ymm',
      vehicle: { year: resolvedYear, make: resolvedMake, model: resolvedModel },
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'NHTSA recall lookup timed out. Please try again.' },
        { status: 504 }
      );
    }

    console.error('Recall lookup error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recall data.' },
      { status: 500 }
    );
  }
}
