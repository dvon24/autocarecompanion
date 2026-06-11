import { readFileSync, appendFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { prisma } from '@/lib/db';

/**
 * API Cost Tracking System
 *
 * Story 7.1: API Usage & Cost Dashboard
 * Story 7.2: Budget Warnings & Alerts
 * Story 7.3: Hard Budget Cap & Rate Limiting
 *
 * Tracks API costs by feature, provides budget alerts, and enforces hard cap.
 *
 * Storage: the AiCostLog table. The original implementation wrote JSONL to
 * /tmp on Vercel, which is PER-INSTANCE and wiped on every cold start — so
 * the monthly cap never accumulated and never enforced in production
 * (2026-06-11 review finding). The local JSONL file is kept as a dev-only
 * convenience mirror.
 *
 * isBudgetExceeded() stays synchronous (call sites are sync): it reads an
 * in-memory snapshot of the month's DB spend that refreshes in the
 * background at most once per minute per instance.
 */

// Cost estimates per 1K tokens (GPT-4 class pricing)
const COST_PER_1K_INPUT = 0.03;
const COST_PER_1K_OUTPUT = 0.06;

// Monthly budget cap
const MONTHLY_BUDGET = 25.0;

// Budget warning thresholds
const WARNING_THRESHOLDS = {
  low: 0.5, // 50%
  medium: 0.75, // 75%
  high: 1.0, // 100%
};

export type CostFeature =
  | 'guide_generation'
  | 'symptom_chat'
  | 'inline_help'
  | 'vin_decode'
  | 'known_issues'
  | 'garage_assistant';

export type BudgetWarningLevel = 'none' | 'low' | 'medium' | 'high' | 'exceeded';

export interface CostEntry {
  timestamp: string;
  feature: CostFeature;
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;
  model?: string;
}

export interface CostSummary {
  totalCost: number;
  byFeature: Record<CostFeature, number>;
  byDay: Record<string, number>;
  budgetUsedPercent: number;
  warningLevel: BudgetWarningLevel;
  remainingBudget: number;
  isRateLimited: boolean;
}

/**
 * Get the path to the costs data file
 * Uses /tmp on serverless (Vercel) since the main filesystem is read-only
 */
function getCostsFilePath(): string | null {
  try {
    // On Vercel/serverless, use /tmp; locally use project data dir
    const isServerless = process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME;
    const dataDir = isServerless ? '/tmp' : join(process.cwd(), 'data');
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true });
    }
    return join(dataDir, 'api-costs.jsonl');
  } catch {
    // Filesystem not writable - return null to signal no-op
    return null;
  }
}

/**
 * Estimate cost from token counts
 */
export function estimateCost(inputTokens: number, outputTokens: number): number {
  const inputCost = (inputTokens / 1000) * COST_PER_1K_INPUT;
  const outputCost = (outputTokens / 1000) * COST_PER_1K_OUTPUT;
  return Math.round((inputCost + outputCost) * 10000) / 10000; // Round to 4 decimal places
}

/**
 * Log an API call cost
 */
export function logApiCost(
  feature: CostFeature,
  inputTokens: number,
  outputTokens: number,
  model?: string
): CostEntry {
  const entry: CostEntry = {
    timestamp: new Date().toISOString(),
    feature,
    inputTokens,
    outputTokens,
    estimatedCost: estimateCost(inputTokens, outputTokens),
    model,
  };

  // Durable log — fire-and-forget so the request path never blocks on it.
  prisma.aiCostLog.create({
    data: {
      route: feature,
      model: model || 'unknown',
      inputTokens,
      outputTokens,
      costUsd: entry.estimatedCost,
    },
  }).then(() => {
    // Keep the local snapshot roughly current so the cap reacts within
    // the same instance without waiting for the next refresh window.
    if (spendSnapshot.known) spendSnapshot.value += entry.estimatedCost;
  }).catch((err) => {
    console.error('Failed to log API cost to DB:', err);
  });

  // Dev-only convenience mirror (read-only FS on Vercel makes this a no-op).
  try {
    const filePath = getCostsFilePath();
    if (filePath) {
      appendFileSync(filePath, JSON.stringify(entry) + '\n');
    }
  } catch {
    /* expected on serverless */
  }

  return entry;
}

// ── Month spend snapshot (per instance, refreshed from the DB) ──────────
const SPEND_REFRESH_MS = 60_000;
const spendSnapshot = { value: 0, fetchedAt: 0, known: false, refreshing: false };

function refreshSpendSnapshot(): void {
  if (spendSnapshot.refreshing) return;
  spendSnapshot.refreshing = true;
  prisma.aiCostLog.aggregate({
    _sum: { costUsd: true },
    where: { createdAt: { gte: getMonthStart() } },
  }).then((agg) => {
    spendSnapshot.value = agg._sum.costUsd ?? 0;
    spendSnapshot.fetchedAt = Date.now();
    spendSnapshot.known = true;
  }).catch((err) => {
    console.error('Failed to refresh AI spend snapshot:', err);
  }).finally(() => {
    spendSnapshot.refreshing = false;
  });
}

/** Current-month spend straight from the DB (admin dashboard / async callers). */
export async function getMonthlySpendFromDb(): Promise<{ totalCost: number; byRoute: Record<string, number>; byDay: Record<string, number> }> {
  const rows = await prisma.aiCostLog.findMany({
    where: { createdAt: { gte: getMonthStart() } },
    select: { route: true, costUsd: true, createdAt: true },
  });
  const byRoute: Record<string, number> = {};
  const byDay: Record<string, number> = {};
  let totalCost = 0;
  for (const r of rows) {
    totalCost += r.costUsd;
    byRoute[r.route] = (byRoute[r.route] || 0) + r.costUsd;
    const day = r.createdAt.toISOString().split('T')[0];
    byDay[day] = (byDay[day] || 0) + r.costUsd;
  }
  return { totalCost, byRoute, byDay };
}

/**
 * Get the start of the current month (UTC)
 */
function getMonthStart(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

/**
 * Read all cost entries for the current month
 */
export function getMonthlyEntries(): CostEntry[] {
  const filePath = getCostsFilePath();
  if (!filePath || !existsSync(filePath)) {
    return [];
  }

  const monthStart = getMonthStart();
  const entries: CostEntry[] = [];

  try {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.trim().split('\n').filter(Boolean);

    for (const line of lines) {
      try {
        const entry = JSON.parse(line) as CostEntry;
        const entryDate = new Date(entry.timestamp);
        if (entryDate >= monthStart) {
          entries.push(entry);
        }
      } catch {
        // Skip invalid lines
      }
    }
  } catch (error) {
    console.error('Failed to read cost entries:', error);
  }

  return entries;
}

/**
 * Get cost summary for the current month
 */
export function getMonthlyCostSummary(): CostSummary {
  const entries = getMonthlyEntries();

  const byFeature: Record<CostFeature, number> = {
    guide_generation: 0,
    symptom_chat: 0,
    inline_help: 0,
    vin_decode: 0,
    known_issues: 0,
    garage_assistant: 0,
  };

  const byDay: Record<string, number> = {};
  let totalCost = 0;

  for (const entry of entries) {
    totalCost += entry.estimatedCost;
    byFeature[entry.feature] = (byFeature[entry.feature] || 0) + entry.estimatedCost;

    const day = entry.timestamp.split('T')[0];
    byDay[day] = (byDay[day] || 0) + entry.estimatedCost;
  }

  const budgetUsedPercent = (totalCost / MONTHLY_BUDGET) * 100;
  const remainingBudget = Math.max(0, MONTHLY_BUDGET - totalCost);

  let warningLevel: BudgetWarningLevel = 'none';
  if (budgetUsedPercent >= 100) {
    warningLevel = 'exceeded';
  } else if (budgetUsedPercent >= WARNING_THRESHOLDS.high * 100) {
    warningLevel = 'high';
  } else if (budgetUsedPercent >= WARNING_THRESHOLDS.medium * 100) {
    warningLevel = 'medium';
  } else if (budgetUsedPercent >= WARNING_THRESHOLDS.low * 100) {
    warningLevel = 'low';
  }

  return {
    totalCost: Math.round(totalCost * 100) / 100,
    byFeature: Object.fromEntries(
      Object.entries(byFeature).map(([k, v]) => [k, Math.round(v * 100) / 100])
    ) as Record<CostFeature, number>,
    byDay: Object.fromEntries(
      Object.entries(byDay).map(([k, v]) => [k, Math.round(v * 100) / 100])
    ),
    budgetUsedPercent: Math.round(budgetUsedPercent * 10) / 10,
    warningLevel,
    remainingBudget: Math.round(remainingBudget * 100) / 100,
    isRateLimited: budgetUsedPercent >= 100,
  };
}

/**
 * Check if budget is exceeded (for rate limiting).
 *
 * Synchronous on purpose (call sites are sync): reads the per-instance
 * snapshot of this month's DB spend and refreshes it in the background.
 * Until the first refresh resolves we fail OPEN (allow) rather than block
 * all AI features on every cold start.
 */
export function isBudgetExceeded(): boolean {
  if (Date.now() - spendSnapshot.fetchedAt > SPEND_REFRESH_MS) refreshSpendSnapshot();
  if (!spendSnapshot.known) return false;
  return spendSnapshot.value >= MONTHLY_BUDGET;
}

/**
 * Check budget and return warning if threshold crossed
 * Call this after API operations to alert user
 */
export function checkBudgetWarning(): {
  warning: boolean;
  level: BudgetWarningLevel;
  message: string | null;
} {
  const summary = getMonthlyCostSummary();

  if (summary.warningLevel === 'exceeded') {
    return {
      warning: true,
      level: 'exceeded',
      message: `Monthly budget of $${MONTHLY_BUDGET} exceeded. Some features are temporarily limited.`,
    };
  }

  if (summary.warningLevel === 'high') {
    return {
      warning: true,
      level: 'high',
      message: `You've used ${summary.budgetUsedPercent.toFixed(0)}% of your monthly budget ($${summary.totalCost.toFixed(2)}/$${MONTHLY_BUDGET}).`,
    };
  }

  if (summary.warningLevel === 'medium') {
    return {
      warning: true,
      level: 'medium',
      message: `75% of monthly budget used ($${summary.totalCost.toFixed(2)}/$${MONTHLY_BUDGET}).`,
    };
  }

  if (summary.warningLevel === 'low') {
    return {
      warning: true,
      level: 'low',
      message: `50% of monthly budget used ($${summary.totalCost.toFixed(2)}/$${MONTHLY_BUDGET}).`,
    };
  }

  return { warning: false, level: 'none', message: null };
}

/**
 * Get budget status for display
 */
export function getBudgetStatus(): {
  used: number;
  total: number;
  percent: number;
  level: BudgetWarningLevel;
  daysRemaining: number;
} {
  const summary = getMonthlyCostSummary();
  const now = new Date();
  const endOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));
  const daysRemaining = Math.ceil((endOfMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return {
    used: summary.totalCost,
    total: MONTHLY_BUDGET,
    percent: summary.budgetUsedPercent,
    level: summary.warningLevel,
    daysRemaining,
  };
}
