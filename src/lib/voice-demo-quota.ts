import { prisma } from '@/lib/db';

/**
 * Durable voice-demo quota.
 *
 * The free live-voice demo is the give-away for the feature sold at Plus/Pro,
 * so the counter that limits it is an AUTHORIZATION control, not a convenience
 * throttle. It was previously held in `voiceDemoAnonLimiter` / the in-memory
 * `RateLimiter` Map, which resets on every cold start and is not shared between
 * serverless instances — so the "1 demo per IP per 30 days" ceiling never
 * actually bound, and anonymous callers could mint unlimited paid-tier sessions.
 *
 * This backs the same counter with the ChatQuota table (a generic keyed counter
 * already used by chat-quota.ts and photo-quota.ts — no migration needed), so
 * the ceiling survives cold starts and holds across instances.
 *
 * Window is a deterministic 30-day tumbling bucket anchored to the epoch, so
 * every instance computes the same bucket without coordination.
 */

const WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

function windowStart(): Date {
  return new Date(Math.floor(Date.now() / WINDOW_MS) * WINDOW_MS);
}

/** Namespaced so these rows never collide with chat/photo quota keys. */
export function voiceDemoKey(identity: string): string {
  return `voice-demo:${identity}`;
}

/**
 * Read-only check — does NOT consume. Mirrors the old limiter's `peek()` so a
 * failed session mint never burns the visitor's one demo.
 *
 * Returns `null` on a DB error, meaning "unknown — fall back to the in-memory
 * limiter". A DB blip must not take the signup hook offline.
 */
export async function peekVoiceDemo(key: string, limit: number): Promise<boolean | null> {
  const start = windowStart();
  try {
    const row = await prisma.chatQuota.findUnique({
      where: { key },
      select: { weekStart: true, count: true },
    });
    const used = row && row.weekStart.getTime() === start.getTime() ? row.count : 0;
    return used < limit;
  } catch {
    return null;
  }
}

/**
 * Consume one demo credit. Call only AFTER a successful mint.
 *
 * Returns false if the credit could not be taken (already at the ceiling, or a
 * DB error). The caller has already minted at this point, so the return value
 * is for logging — the enforcement decision was made by peekVoiceDemo above.
 */
export async function consumeVoiceDemo(key: string, limit: number): Promise<boolean> {
  const start = windowStart();
  try {
    return await prisma.$transaction(async (tx) => {
      const existing = await tx.chatQuota.findUnique({
        where: { key },
        select: { id: true, weekStart: true, count: true },
      });

      // No row yet, or a stale bucket from a previous window → reset to 1.
      if (!existing || existing.weekStart.getTime() !== start.getTime()) {
        await tx.chatQuota.upsert({
          where: { key },
          create: { key, weekStart: start, count: 1 },
          update: { weekStart: start, count: 1 },
        });
        return true;
      }

      if (existing.count >= limit) return false;

      await tx.chatQuota.update({
        where: { id: existing.id },
        data: { count: { increment: 1 } },
      });
      return true;
    });
  } catch {
    return false;
  }
}
