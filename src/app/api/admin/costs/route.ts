import { NextResponse } from 'next/server';
import { requireFounder } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import {
  getBudgetStatus,
  checkBudgetWarning,
  getMonthlySpendFromDb,
} from '@/lib/costs';

/**
 * API Cost Dashboard Endpoint
 *
 * Story 7.1: API Usage & Cost Dashboard
 * Story 7.2: Budget Warnings & Alerts
 * Story 7.3: Hard Budget Cap & Rate Limiting
 *
 * Returns cost summary, budget status, and usage breakdown from the
 * AiCostLog table (previously read per-instance /tmp files, which were
 * always empty in production). Founder access only — was "any
 * authenticated user" behind a TODO.
 */

const MONTHLY_BUDGET = 25.0;

export async function GET() {
  const denied = await requireFounder();
  if (denied) return denied;

  try {
    const [spend, recentRows] = await Promise.all([
      getMonthlySpendFromDb(),
      prisma.aiCostLog.findMany({ orderBy: { createdAt: 'desc' }, take: 20 }),
    ]);

    const budgetStatus = getBudgetStatus();
    const warning = checkBudgetWarning();

    const totalCalls = await prisma.aiCostLog.count({
      where: { createdAt: { gte: new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1)) } },
    });
    const avgCostPerCall = totalCalls > 0 ? spend.totalCost / totalCalls : 0;

    const uniqueDays = Object.keys(spend.byDay).length;
    const dailyAverage = uniqueDays > 0 ? spend.totalCost / uniqueDays : 0;

    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const projectedMonthly = dailyAverage * daysInMonth;

    const budgetUsedPercent = (spend.totalCost / MONTHLY_BUDGET) * 100;

    return NextResponse.json({
      summary: {
        totalCost: Math.round(spend.totalCost * 100) / 100,
        byFeature: Object.fromEntries(
          Object.entries(spend.byRoute).map(([k, v]) => [k, Math.round(v * 100) / 100]),
        ),
        byDay: Object.fromEntries(
          Object.entries(spend.byDay).map(([k, v]) => [k, Math.round(v * 100) / 100]),
        ),
        budgetUsedPercent: Math.round(budgetUsedPercent * 10) / 10,
        remainingBudget: Math.round(Math.max(0, MONTHLY_BUDGET - spend.totalCost) * 100) / 100,
        isRateLimited: budgetUsedPercent >= 100,
      },
      budgetStatus: {
        ...budgetStatus,
        used: Math.round(spend.totalCost * 100) / 100,
        percent: Math.round(budgetUsedPercent * 10) / 10,
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
      recentEntries: recentRows.map((r) => ({
        timestamp: r.createdAt.toISOString(),
        feature: r.route,
        inputTokens: r.inputTokens,
        outputTokens: r.outputTokens,
        estimatedCost: r.costUsd,
        model: r.model,
      })),
    });
  } catch (error) {
    console.error('Costs API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cost data' },
      { status: 500 }
    );
  }
}
