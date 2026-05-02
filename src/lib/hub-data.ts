import prisma from '@/lib/db';
import { mileageBucket } from '@/lib/vehicle-slug';
import type { KnownIssue } from '@/schemas/knownIssue.schema';

/**
 * Server-side data loaders for the conversation-first /vehicle/[slug]
 * hub. All read-only, all bounded so a chatty user can't blow up the
 * page render time.
 */

export interface RecentThread {
  id: string;
  preview: string;     // first ~80 chars of the user's first question
  reply: string;       // first ~80 chars of the assistant's first reply
  vehicle: string;     // "2015 Dodge Challenger SRT 392" if vehicle attached
  updatedAt: string;   // ISO date
}

/**
 * Pull the last N ChatSession rows for the current user, scoped to
 * conversations they had about this exact vehicle. Returns a compact
 * shape suitable for rendering as a list — full message history is
 * loaded only when they open a thread.
 */
export async function getRecentThreads(
  userId: string,
  vehicleId: string | null,
  limit = 6,
): Promise<RecentThread[]> {
  const where = vehicleId
    ? { userId, vehicleId }
    : { userId };
  const rows = await prisma.chatSession.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    take: limit,
    select: { id: true, messages: true, updatedAt: true, vehicle: { select: { year: true, make: true, model: true, trim: true } } },
  });
  return rows.map((row) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const msgs = ((row.messages as any[]) || []) as { role: string; content: string }[];
    const firstUser = msgs.find((m) => m.role === 'user')?.content || '';
    const firstAsst = msgs.find((m) => m.role === 'assistant')?.content || '';
    const vehicleLabel = row.vehicle
      ? `${row.vehicle.year} ${row.vehicle.make} ${row.vehicle.model}${row.vehicle.trim ? ' ' + row.vehicle.trim : ''}`
      : '';
    return {
      id: row.id,
      preview: firstUser.slice(0, 80),
      reply: firstAsst.slice(0, 80),
      vehicle: vehicleLabel,
      updatedAt: row.updatedAt.toISOString(),
    };
  });
}

export interface TrendingChip {
  intent: string;
  exampleQuestion: string;
  count: number;
}

/**
 * Get the top "trending" questions for the current vehicle's mileage
 * bucket, pre-aggregated nightly into TrendingIntent. When the table is
 * empty (early days), fall back to nothing — the auto-opener already
 * gives the user starter prompts.
 *
 * The mileage bucket lookup is exact-match on the precomputed
 * bucket field; we don't fan out across nearby buckets to keep the
 * read cheap. Aggregation cron handles fanning by writing each row
 * into multiple bucket rows when the source spans them.
 */
export async function getTrendingForVehicle(args: {
  make: string;
  model: string;
  currentMileage: number | null;
}, limit = 4): Promise<TrendingChip[]> {
  const bucket = mileageBucket(args.currentMileage ?? 0) ?? 0;
  try {
    const rows = await prisma.trendingIntent.findMany({
      where: {
        make: { equals: args.make, mode: 'insensitive' },
        model: { equals: args.model, mode: 'insensitive' },
        mileageBucket: bucket,
      },
      orderBy: { count: 'desc' },
      take: limit,
    });
    return rows.map((r) => ({ intent: r.intent, exampleQuestion: r.exampleQuestion, count: r.count }));
  } catch {
    return [];
  }
}

/**
 * Issue card attachment data — loaded server-side and passed to the
 * hub so chat replies can reference real KnownIssue records by id
 * without making the client re-fetch them. The hub passes the FULL
 * pre-loaded list to the client, then the chat UI matches mentioned
 * issue ids to render an inline card.
 *
 * Bounded to top 12 issues for the vehicle so we don't ship a
 * 50-issue payload every page load.
 */
export interface AttachableIssue {
  id: string;
  title: string;
  category: string;
  severity: string;
  description: string;
  estimatedCost: { low: number; high: number } | null;
  affectedYears: number[];
  knownIssuesUrl: string;  // deeplink to /known-issues/{slug}#{id}
}

export async function getAttachableIssues(args: {
  make: string;
  model: string;
  year: number;
  trim: string;
  limit?: number;
}): Promise<AttachableIssue[]> {
  const limit = args.limit ?? 12;
  try {
    const rows = await prisma.knownIssue.findMany({
      where: {
        make: { equals: args.make, mode: 'insensitive' },
        model: { equals: args.model, mode: 'insensitive' },
        years: { has: args.year },
        status: 'published',
      },
      orderBy: [{ severity: 'asc' }, { reportCount: 'desc' }],
      take: limit,
      select: {
        id: true, title: true, category: true, severity: true,
        description: true, estimatedCostLow: true, estimatedCostHigh: true,
        years: true,
      },
    });
    const slug = `${args.make.toLowerCase().replace(/\s+/g, '-')}-${args.model.toLowerCase().replace(/\s+/g, '-')}`;
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      category: r.category,
      severity: r.severity,
      description: (r.description || '').slice(0, 220),
      estimatedCost: r.estimatedCostLow != null && r.estimatedCostHigh != null
        ? { low: r.estimatedCostLow, high: r.estimatedCostHigh }
        : null,
      affectedYears: r.years,
      knownIssuesUrl: `/known-issues/${slug}#${r.id}`,
    }));
  } catch {
    return [];
  }
}
