import { NextResponse } from 'next/server';

/**
 * Admin Issue Reports API
 *
 * Returns user-submitted issue reports for admin review.
 * In production, this would query a database of submitted reports.
 *
 * Story 4.6: Admin Pattern Review
 */

// Mock data for development - in production, this would come from a database
const mockReports = [
  {
    id: 'rpt_001',
    timestamp: '2026-02-15T14:22:00Z',
    vehicle: { year: 2019, make: 'Dodge', model: 'Challenger', trim: 'SRT 392' },
    description: 'Experiencing the same coolant bypass valve issue. Already replaced it once at 45k miles, happening again at 72k. Going with the Mishimoto upgrade this time.',
    severity: 'high' as const,
    mileage: 72000,
    existingIssueId: 'ki_cha_01',
  },
  {
    id: 'rpt_002',
    timestamp: '2026-02-14T09:15:00Z',
    vehicle: { year: 2018, make: 'Honda', model: 'Civic', trim: '1.5T' },
    description: 'Noticed fuel smell and oil level rising. Dealer confirmed oil dilution issue. They did an oil change but said it is "normal" for this engine.',
    severity: 'medium' as const,
    mileage: 58000,
  },
  {
    id: 'rpt_003',
    timestamp: '2026-02-13T16:45:00Z',
    vehicle: { year: 2020, make: 'Toyota', model: 'Camry', trim: 'SE' },
    description: 'Dashboard cracking near the passenger airbag. Started as a small crack, now spreading. Car is always garaged, no sun damage explanation.',
    severity: 'low' as const,
    mileage: 42000,
  },
];

export async function GET() {
  try {
    // In production, query database for submitted reports
    // For now, return mock data

    return NextResponse.json({
      reports: mockReports,
      total: mockReports.length,
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports', reports: [] },
      { status: 500 }
    );
  }
}
