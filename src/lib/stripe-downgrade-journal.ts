import type { Prisma } from '@prisma/client';

export type DowngradeOperation = {
  id: string; userId: string; subscriptionId: string; token: string; state: string;
  scheduleId: string | null; dispatchedAt: Date; createdAt: Date;
};
// Rollout can ship before the additive table. Existing billing controls still work.
export async function downgradeJournalAvailable(tx: Prisma.TransactionClient) {
  const rows = await tx.$queryRaw<{ available: boolean }[]>`SELECT to_regclass('public."SubscriptionDowngrade"') IS NOT NULL AS available`;
  return rows[0]?.available === true;
}
export async function latestDowngrade(tx: Prisma.TransactionClient, subscriptionId: string) {
  if (!await downgradeJournalAvailable(tx)) return undefined;
  const rows = await tx.$queryRaw<DowngradeOperation[]>`SELECT * FROM "SubscriptionDowngrade" WHERE "subscriptionId" = ${subscriptionId} ORDER BY "createdAt" DESC, "id" DESC LIMIT 1`;
  return rows[0];
}
export const activeDowngrade = (op: DowngradeOperation | undefined) => op && ['pending','scheduled','undo','cancel'].includes(op.state) ? op : undefined;
export async function setDowngradeState(tx: Prisma.TransactionClient, id: string, state: string) {
  await tx.$executeRaw`UPDATE "SubscriptionDowngrade" SET "state" = ${state} WHERE "id" = ${id}`;
}
