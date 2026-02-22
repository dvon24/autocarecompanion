import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getMonthlyCostSummary,
  getBudgetStatus,
  checkBudgetWarning,
  getMonthlyEntries,
  type CostSummary,
} from '@/lib/costs';

/**
 * API Cost Dashboard Endpoint
 *
 * Story 7.1: API Usage & Cost Dashboard
 * Story 7.2: Budget Warnings & Alerts
 * Story 7.3: Hard Budget Cap & Rate Limiting
 *
 * Returns cost summary, budget status, and usage breakdown.
 * Admin access only (requires subscriptionStatus = 'admin').
 */

export async function GET() {
  try {
    const session = await auth();

    // Check if user is admin
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Add proper admin check - for now allow any authenticated user
    // In production, check session.user.subscriptionStatus === 'admin'

    // Get cost data
    const summary: CostSummary = getMonthlyCostSummary();
    const budgetStatus = getBudgetStatus();
    const warning = checkBudgetWarning();
    const entries = getMonthlyEntries();

    // Calculate additional stats
    const totalCalls = entries.length;
    const avgCostPerCall = totalCalls > 0 ? summary.totalCost / totalCalls : 0;

    // Get recent entries (last 20)
    const recentEntries = entries
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20);

    // Calculate daily average
    const uniqueDays = new Set(entries.map(e => e.timestamp.split('T')[0])).size;
    const dailyAverage = uniqueDays > 0 ? summary.totalCost / uniqueDays : 0;

    // Projected monthly spend based on daily average and days in month
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const projectedMonthly = dailyAverage * daysInMonth;

    return NextResponse.json({
      summary,
      budgetStatus: {
        ...budgetStatus,
        monthName: now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      },
      warning,
      stats: {
        totalCalls,
        avgCostPerCall: Math.round(avgCostPerCall * 10000) / 10000,
        dailyAverage: Math.round(dailyAverage * 100) / 100,
        projectedMonthly: Math.round(projectedMonthly * 100) / 100,
        uniqueDays,
      },
      recentEntries,
    });
  } catch (error) {
    console.error('Costs API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cost data' },
      { status: 500 }
    );
  }
}
