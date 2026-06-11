/**
 * Server-side monthly photo-upload quota for /api/vision.
 *
 * Mirrors chat-quota.ts (weekly bucket) but with MONTHLY boundaries
 * — per the pricing brief, free tier gets 3 photos/month before
 * hitting the "Go Pro" upsell. Subscribers bypass entirely. Reuses
 * the existing ChatQuota Prisma table to avoid a schema migration;
 * photo entries are identified by the "photo:" key prefix.
 */

import { prisma } from '@/lib/db';

// Free-tier photo allowance per month, per the pricing brief
// (workflow wf_70514661-afd). Tight enough that the "magic moment" of
// snapping a part and getting the complete kit forces an upgrade
// quickly; loose enough that free users get to feel the value at
// least once or twice without paying.
// 8/month — the pricing page advertises "2 photo diagnoses / week" and the
// old value (3/month) broke that promise at the exact conversion moment
// (2026-06-12 review finding). Monthly window kept for the existing quota
// machinery; 8/mo honors the advertised weekly rate.
export const DEFAULT_FREE_PHOTO_LIMIT = 8;

/**
 * Get UTC first-of-month timestamp for the date passed in (default = now).
 * The ChatQuota.weekStart field stores this; the column is misnamed for
 * photo entries but the field type (Date) and bucket-rollover semantics
 * apply identically.
 */
export function getMonthStartUTC(date: Date = new Date()): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0, 0));
}

/** Same-month-but-next-month date for the "resetAt" field surfaced to clients. */
export function getMonthEndUTC(monthStart: Date): Date {
  return new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 1, 0, 0, 0, 0));
}

export interface PhotoQuotaResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetAt: Date;
  key: string;
}

/**
 * Atomically check-and-consume one photo upload from the user's monthly
 * quota. Subscribers (caller passes a high `limit`, e.g. 10000) effectively
 * always pass.
 *
 * The ChatQuota table is reused to avoid schema work — we use a key
 * prefix of "photo:user:<id>" and store the month-start in weekStart.
 * Photo entries can co-exist with chat entries because the key is unique.
 */
/**
 * Decrement a previously-consumed photo quota credit. Use ONLY after a
 * call to checkAndConsumePhotoQuota succeeded but the downstream work
 * (OpenAI call, parse, etc.) failed — refunds the count so the user
 * doesn't lose a credit to a server error they can't recover from.
 *
 * No-op if the current month bucket doesn't exist (impossible if the
 * preceding consume succeeded, but defensive). Returns silently on
 * any DB error — better to silently fail-to-refund than to crash a
 * request that already failed for other reasons.
 */
export async function refundPhotoQuota(key: string): Promise<void> {
  const monthStart = getMonthStartUTC();
  try {
    await prisma.chatQuota.updateMany({
      where: {
        key,
        weekStart: monthStart,
        count: { gt: 0 },
      },
      data: { count: { decrement: 1 } },
    });
  } catch {
    // Refund failure is non-fatal; the user is already getting an
    // error response and we don't want to mask it with a 500.
  }
}

export async function checkAndConsumePhotoQuota(opts: {
  key: string;
  limit: number;
}): Promise<PhotoQuotaResult> {
  const { key, limit } = opts;
  const monthStart = getMonthStartUTC();
  const resetAt = getMonthEndUTC(monthStart);

  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.chatQuota.findUnique({
      where: { key },
      select: { id: true, weekStart: true, count: true },
    });

    // No row yet, or stale bucket from a previous month → reset.
    if (!existing || existing.weekStart.getTime() !== monthStart.getTime()) {
      await tx.chatQuota.upsert({
        where: { key },
        create: { key, weekStart: monthStart, count: 1 },
        update: { weekStart: monthStart, count: 1 },
      });
      return { allowed: true, remaining: limit - 1 };
    }

    if (existing.count >= limit) {
      return { allowed: false, remaining: 0 };
    }

    const updated = await tx.chatQuota.update({
      where: { id: existing.id },
      data: { count: { increment: 1 } },
      select: { count: true },
    });

    return { allowed: true, remaining: Math.max(0, limit - updated.count) };
  });

  return {
    allowed: result.allowed,
    remaining: result.remaining,
    limit,
    resetAt,
    key,
  };
}
