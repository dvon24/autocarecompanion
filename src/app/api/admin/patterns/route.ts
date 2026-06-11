import { NextResponse } from 'next/server';

import { requireFounder } from '@/lib/admin-guard';
/**
 * Admin Symptom Patterns API
 *
 * Returns aggregated symptom patterns from chat conversations.
 * In production, this would query a database of captured symptoms.
 *
 * Story 4.6: Admin Pattern Review
 */

// Mock data for development - in production, this would come from a database
const mockPatterns = [
  {
    id: 'pat_001',
    vehicle: { year: 2019, make: 'Honda', model: 'Civic', trim: 'Sport' },
    symptoms: ['rough idle', 'hesitation', 'check engine'],
    obdCodes: ['P0300', 'P0171'],
    diagnosisTitle: 'Engine Misfire',
    count: 23,
    lastSeen: '2026-02-15T10:30:00Z',
    status: 'pending' as const,
  },
  {
    id: 'pat_002',
    vehicle: { year: 2017, make: 'Toyota', model: 'Camry' },
    symptoms: ['squealing', 'brake', 'grinding'],
    obdCodes: [],
    diagnosisTitle: 'Worn Brake Pads',
    count: 45,
    lastSeen: '2026-02-14T15:45:00Z',
    status: 'approved' as const,
  },
  {
    id: 'pat_003',
    vehicle: { year: 2020, make: 'Ford', model: 'F-150', trim: 'XLT' },
    symptoms: ['overheating', 'coolant', 'steam'],
    obdCodes: ['P0128'],
    diagnosisTitle: 'Thermostat Failure',
    count: 12,
    lastSeen: '2026-02-13T09:20:00Z',
    status: 'pending' as const,
  },
];

export async function GET() {
  const denied = await requireFounder();
  if (denied) return denied;
  try {
    // In production, query database for aggregated patterns
    // For now, return mock data

    return NextResponse.json({
      patterns: mockPatterns,
      total: mockPatterns.length,
    });
  } catch (error) {
    console.error('Error fetching patterns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patterns', patterns: [] },
      { status: 500 }
    );
  }
}
