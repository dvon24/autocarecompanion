import type { prisma as Database } from './db';

export type BillingEnrollmentReview = { subscriptionId: string; userId: string; customerId: string; sessionId: string; attemptKey: string; state: string; initialVerified?: boolean };
type Reader = Pick<typeof Database, '$queryRaw'>;
type Writer = Reader & Pick<typeof Database, '$executeRaw'>;

/** Pass the held transaction here; never acquire another pool connection. */
export async function getBillingEnrollmentReview(db: Reader, userId: string, subscriptionId: string | null | undefined) {
  if (!subscriptionId) return null;
  const rows = await db.$queryRaw<BillingEnrollmentReview[]>`SELECT "subscriptionId", "userId", "customerId", "sessionId", "attemptKey", "state", "initialVerified" FROM "BillingEnrollmentReview" WHERE "subscriptionId" = ${subscriptionId} AND "userId" = ${userId}`;
  return rows[0] || null;
}

export async function saveBillingEnrollmentReview(db: Writer, row: BillingEnrollmentReview) {
  // Identity is immutable: unrelated/superseded attempts cannot overwrite it.
  const count = await db.$executeRaw`INSERT INTO "BillingEnrollmentReview" ("subscriptionId", "userId", "customerId", "sessionId", "attemptKey", "state", "initialVerified", "updatedAt") VALUES (${row.subscriptionId}, ${row.userId}, ${row.customerId}, ${row.sessionId}, ${row.attemptKey}, ${row.state}, ${row.initialVerified === true}, CURRENT_TIMESTAMP) ON CONFLICT ("subscriptionId") DO UPDATE SET "state" = EXCLUDED."state", "initialVerified" = "BillingEnrollmentReview"."initialVerified" OR EXCLUDED."initialVerified", "updatedAt" = CURRENT_TIMESTAMP WHERE "BillingEnrollmentReview"."userId" = EXCLUDED."userId" AND "BillingEnrollmentReview"."customerId" = EXCLUDED."customerId" AND "BillingEnrollmentReview"."sessionId" = EXCLUDED."sessionId" AND "BillingEnrollmentReview"."attemptKey" = EXCLUDED."attemptKey"`;
  if (count !== 1) throw new Error('billing_review_identity_mismatch');
}
