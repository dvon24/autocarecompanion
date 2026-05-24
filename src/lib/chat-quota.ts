/**
 * Server-side weekly chat quota — backstop for the client-side
 * useAnonymousLimit hook.
 *
 * Lives in the ChatQuota Prisma table, keyed on either:
 *   - "anon:<anonymousId>" for unsigned visitors (cookie-set)
 *   - "user:<userId>"      for authed users on a paid-tier limit
 *
 * The week bucket rolls over at Sunday midnight UTC. Old buckets are
 * lazily replaced on the first request of a new week — we don't
 * actively prune them since each user has at most one row.
 */

import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';
import crypto from 'crypto';

const ANON_COOKIE = 'au7o_anon_id';
const ANON_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 * 2; // 2 years

export const DEFAULT_ANON_LIMIT = 5;
export const DEFAULT_FREE_AUTHED_LIMIT = 25;

/**
 * Return the Sunday-midnight-UTC of the current week. Matches the
 * client-side rateLimit.ts implementation so the two counts agree
 * when both are present.
 */
export function getWeekStartUTC(date: Date = new Date()): Date {
  const day = date.getUTCDay(); // 0 = Sunday
  const diff = date.getUTCDate() - day;
  return new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    diff,
    0, 0, 0, 0,
  ));
}

export function getWeekEndUTC(weekStart: Date): Date {
  return new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
}

/**
 * Get-or-set the anonymous ID cookie. Returns the existing value when
 * present; otherwise generates a 32-byte url-safe id and stores it for
 * 2 years. Cookie is NOT HTTP-only so the client can read it too —
 * useful for analytics + tying anonymous-mode persistence (vehicle,
 * mileage) to the same id.
 */
export async function getOrSetAnonId(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(ANON_COOKIE)?.value;
  if (existing && /^[A-Za-z0-9_-]{16,64}$/.test(existing)) return existing;

  const fresh = crypto.randomBytes(16).toString('base64url');
  jar.set(ANON_COOKIE, fresh, {
    maxAge: ANON_COOKIE_MAX_AGE,
    sameSite: 'lax',
    httpOnly: false, // intentional — client reads this too
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
  return fresh;
}

export interface QuotaResult {
  /** True when the request should be allowed and the counter was incremented. */
  allowed: boolean;
  /** Chats remaining for the current week after this request. */
  remaining: number;
  /** The limit cap that applies to this key. */
  limit: number;
  /** When the current week's quota resets (Sunday midnight UTC + 7 days). */
  resetAt: Date;
  /** Identity used for the count — useful for debugging/telemetry. */
  key: string;
}

/**
 * Atomically check-and-consume one chat from the weekly quota.
 *
 * Behavior:
 *   - If no row exists for this key, create one with count=1 (allowed).
 *   - If the existing row is from a previous week, replace it with
 *     count=1 (allowed).
 *   - If the existing row is current-week AND count<limit, increment
 *     and allow.
 *   - Otherwise (count >= limit), do NOT increment and return allowed:false.
 *
 * Uses upsert with a transaction to avoid double-counting under
 * concurrent requests.
 */
export async function checkAndConsumeChatQuota(opts: {
  key: string;
  limit: number;
}): Promise<QuotaResult> {
  const { key, limit } = opts;
  const weekStart = getWeekStartUTC();
  const resetAt = getWeekEndUTC(weekStart);

  // Read current state. We can't atomic-upsert + conditional-increment
  // in a single Prisma call, so we use a transaction that re-reads the
  // row under the same DB connection.
  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.chatQuota.findUnique({
      where: { key },
      select: { id: true, weekStart: true, count: true },
    });

    // No row, or stale week → reset to 1 and allow.
    if (!existing || existing.weekStart.getTime() !== weekStart.getTime()) {
      await tx.chatQuota.upsert({
        where: { key },
        create: { key, weekStart, count: 1 },
        update: { weekStart, count: 1 },
      });
      return { allowed: true, remaining: limit - 1 };
    }

    // Current week — check the cap.
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

/**
 * Peek at the current quota without consuming. Useful for surfacing
 * the remaining count on page load without burning a chat.
 */
export async function peekChatQuota(opts: {
  key: string;
  limit: number;
}): Promise<Omit<QuotaResult, 'allowed'>> {
  const { key, limit } = opts;
  const weekStart = getWeekStartUTC();
  const resetAt = getWeekEndUTC(weekStart);

  const existing = await prisma.chatQuota.findUnique({
    where: { key },
    select: { weekStart: true, count: true },
  });

  let used = 0;
  if (existing && existing.weekStart.getTime() === weekStart.getTime()) {
    used = existing.count;
  }

  return {
    remaining: Math.max(0, limit - used),
    limit,
    resetAt,
    key,
  };
}
