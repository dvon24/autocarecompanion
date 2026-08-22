import { prisma } from '@/lib/db';

/**
 * Email suppression list.
 *
 * A permanent bounce or spam complaint is charged against our Resend sending
 * reputation, and a degraded reputation costs delivery for EVERY real lead. So
 * the expensive part of a dead address is never the row — it is the tax it puts
 * on the rest of the list every time we retry it. Once an address is proven
 * dead we must stop sending to it, permanently and automatically.
 *
 * Written by the Resend webhook (`src/app/api/resend/webhook/route.ts`), read
 * by `sendEmail()` (every send) and by the weekly digest (batch, so the loop
 * doesn't spend its time budget on addresses that will bounce).
 *
 * FAIL-OPEN is deliberate throughout. If the DB is unreachable we send anyway:
 * a transient DB fault must never silently stop transactional mail such as a
 * password reset. The cost of that trade is re-bouncing a dead address during
 * an outage, which is strictly cheaper than swallowing real mail.
 */

export type SuppressionReason = 'hard_bounce' | 'complaint' | 'manual';

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

/**
 * Add an address to the suppression list. Idempotent — a second bounce for an
 * address already suppressed keeps the ORIGINAL reason and timestamp, because
 * the first one is the event that actually explains the suppression.
 */
export async function suppressEmail(
  email: string,
  reason: SuppressionReason,
  detail?: string,
): Promise<void> {
  const normalized = normalizeEmail(email);
  if (!normalized) return;
  await prisma.emailSuppression.upsert({
    where: { email: normalized },
    create: { email: normalized, reason, detail: detail?.slice(0, 500) || null },
    update: {}, // first reason wins
  });
}

/**
 * Is this single address suppressed? Returns false on any DB error (fail-open).
 */
export async function isSuppressed(email: string): Promise<boolean> {
  const normalized = normalizeEmail(email);
  if (!normalized) return false;
  try {
    const row = await prisma.emailSuppression.findUnique({
      where: { email: normalized },
      select: { id: true },
    });
    return row !== null;
  } catch {
    return false;
  }
}

/**
 * Batch variant for senders that already hold a list of candidates — ONE query
 * instead of one per recipient. Returns the set of suppressed addresses
 * (normalized). Empty set on any DB error (fail-open).
 */
export async function loadSuppressed(emails: string[]): Promise<Set<string>> {
  const normalized = [...new Set(emails.map(normalizeEmail).filter(Boolean))];
  if (normalized.length === 0) return new Set();
  try {
    const rows = await prisma.emailSuppression.findMany({
      where: { email: { in: normalized } },
      select: { email: true },
    });
    return new Set(rows.map((r) => r.email));
  } catch {
    return new Set();
  }
}
