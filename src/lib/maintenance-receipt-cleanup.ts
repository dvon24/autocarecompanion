import { createHash, randomUUID } from 'node:crypto';
import type { Prisma, PrismaClient } from '@prisma/client';
import { MaintenanceMutationError } from '@/lib/maintenance-mutation';
import { lockServiceOwner, lockServiceVehicle } from '@/lib/maintenance-service-mutation';
import { deleteMaintenanceReceipts, listMaintenanceReceiptPaths, maintenanceReceiptPath, ownerReceiptPrefix } from '@/lib/maintenance-receipt-storage';

type Db = Pick<Prisma.TransactionClient, '$queryRaw' | '$executeRaw'>;
export type ReceiptCleanupTarget = { userId: string; vehicleId?: string; receiptPath?: string };
export type ReceiptCleanupJob = { id: string; userId: string; vehicleId: string | null; receiptPath: string | null; attempts: number; retiredAt: Date | null; generation: string; cursor: string | null; sweepHadReferences: boolean };
const jobIdentity = (target: ReceiptCleanupTarget) => createHash('sha256').update(JSON.stringify([target.userId, target.vehicleId || null, target.receiptPath || null])).digest('hex');

/** No FK: intent must survive vehicle/account cascades. Call inside the delete transaction. */
export async function queueReceiptCleanup(db: Db, target: ReceiptCleanupTarget, delayMs = 0) {
  if (!target.userId || (target.receiptPath && (!target.vehicleId || maintenanceReceiptPath(target.receiptPath) !== target.receiptPath
    || !target.receiptPath.startsWith(ownerReceiptPrefix(target.userId, target.vehicleId))))) throw new Error('Invalid private document cleanup ownership.');
  const id = jobIdentity(target);
  const due = new Date(Date.now() + delayMs);
  await db.$executeRaw`INSERT INTO "MaintenanceReceiptCleanup" ("id", "userId", "vehicleId", "receiptPath", "nextAttemptAt", "generation")
    VALUES (${id}, ${target.userId}, ${target.vehicleId || null}, ${target.receiptPath || null}, ${due}, ${randomUUID()})
    ON CONFLICT ("id") DO UPDATE SET "nextAttemptAt" = EXCLUDED."nextAttemptAt", "attempts" = 0, "lastError" = NULL, "generation" = EXCLUDED."generation"
      WHERE "MaintenanceReceiptCleanup"."retiredAt" IS NULL`;
  return id;
}

export async function assertReceiptUploadAllowed(tx: Db, path: string) {
  const retired = await tx.$queryRaw<Array<{ id: string }>>`SELECT "id" FROM "MaintenanceReceiptCleanup" WHERE "receiptPath" = ${path} AND "retiredAt" IS NOT NULL LIMIT 1`;
  if (retired.length) throw new MaintenanceMutationError('This document upload expired before confirmation. Start a new service review.', 400);
}

export async function queueStoredReceiptCleanup(db: Db, target: { userId: string; vehicleId: string; receiptUrl: string | null }) {
  const path = target.receiptUrl && maintenanceReceiptPath(target.receiptUrl);
  if (!path || !path.startsWith(ownerReceiptPrefix(target.userId, target.vehicleId))) return false;
  await queueReceiptCleanup(db, { ...target, receiptPath: path });
  return true;
}

export async function receiptHasReferences(tx: Prisma.TransactionClient, path: string) {
  // Check every owner and vehicle, including legacy URL and pathname forms.
  return await tx.maintenanceRecord.count({ where: { OR: [{ receiptUrl: path }, { receiptUrl: { endsWith: `/${path}` } }] } }) > 0;
}

export type ReceiptCleanupStorage = {
  remove: (paths: string[]) => Promise<void>;
  list: (userId: string, vehicleId?: string, cursor?: string) => Promise<{ paths: string[]; cursor: string | null }>;
};
const storage: ReceiptCleanupStorage = { remove: deleteMaintenanceReceipts, list: listMaintenanceReceiptPaths };

/** Caller holds owner + vehicle locks and the job row lock until completion.
 * Provider success followed by process/DB failure is safe: deletion is idempotent
 * and the durable job retries. Provider failures never erase the cleanup intent. */
export async function processReceiptCleanupJob(tx: Prisma.TransactionClient, job: ReceiptCleanupJob, provider = storage) {
  const generation = randomUUID();
  try {
    if (!job.userId || (job.receiptPath && (!job.vehicleId || maintenanceReceiptPath(job.receiptPath) !== job.receiptPath))) throw new Error('Invalid cleanup scope');
    const prefix = ownerReceiptPrefix(job.userId, job.vehicleId || undefined);
    if (job.receiptPath && !job.receiptPath.startsWith(prefix)) throw new Error('Invalid cleanup ownership');
    if (job.receiptPath && !job.retiredAt) {
      if (await receiptHasReferences(tx, job.receiptPath)) {
        await tx.$executeRaw`DELETE FROM "MaintenanceReceiptCleanup" WHERE "id" = ${job.id}`;
        return 'referenced' as const;
      }
      // Commit this tombstone in a separate worker pass BEFORE contacting the
      // provider. A late provider response after a DB timeout can never delete
      // a newly resurrected upload at the same deterministic path.
      await tx.$executeRaw`UPDATE "MaintenanceReceiptCleanup" SET "retiredAt" = NOW(), "nextAttemptAt" = NOW(), "generation" = ${generation} WHERE "id" = ${job.id}`;
      return 'pending' as const;
    }
    if (!job.receiptPath) {
      const parentExists = job.vehicleId
        ? await tx.vehicle.count({ where: { id: job.vehicleId } })
        : await tx.user.count({ where: { id: job.userId } });
      if (parentExists) throw new Error('Cleanup parent still exists');
    }
    const page = job.receiptPath ? { paths: [job.receiptPath], cursor: null } : await provider.list(job.userId, job.vehicleId || undefined, job.cursor || undefined);
    const paths = page.paths;
    if (paths.length > 100 || (page.cursor && (page.cursor.length > 8192 || page.cursor === job.cursor))) throw new Error('Invalid cleanup page');
    let referenced = false;
    for (const path of paths) {
      if (maintenanceReceiptPath(path) !== path || !path.startsWith(prefix)) throw new Error('Invalid listed document ownership');
      if (await receiptHasReferences(tx, path)) { referenced = true; continue; }
      await provider.remove([path]);
    }
    if (!job.receiptPath && (page.cursor || paths.length || job.sweepHadReferences || referenced)) {
      const hadReferences = job.sweepHadReferences || referenced;
      // Persist the next page only after processing this page. Failure leaves
      // the previous cursor retryable; provider removal is idempotent. At the
      // end, begin a later sweep to revisit protected references and confirm
      // that the prefix is empty before removing its durable job.
      const next = new Date(Date.now() + (!page.cursor && hadReferences ? 60 * 60_000 : 60_000));
      await tx.$executeRaw`UPDATE "MaintenanceReceiptCleanup" SET "cursor" = ${page.cursor}, "sweepHadReferences" = ${page.cursor ? hadReferences : false},
        "nextAttemptAt" = ${next}, "lastError" = NULL, "generation" = ${generation} WHERE "id" = ${job.id}`;
      return 'pending' as const;
    }
    // A saved upload is protected by its reference; its eventual deletion will
    // enqueue fresh intent in the same transaction that removes the reference.
    if (job.receiptPath) {
      if (referenced) throw new Error('Retired document still referenced');
      if (await tx.user.count({ where: { id: job.userId } }) === 0) {
        await tx.$executeRaw`DELETE FROM "MaintenanceReceiptCleanup" WHERE "id" = ${job.id}`;
      } else {
        await tx.$executeRaw`UPDATE "MaintenanceReceiptCleanup" SET "completedAt" = NOW(), "lastError" = NULL, "generation" = ${generation} WHERE "id" = ${job.id}`;
      }
    } else {
      if (!job.vehicleId) {
        await tx.$executeRaw`DELETE FROM "MaintenanceReceiptCleanup" WHERE "userId" = ${job.userId} AND "completedAt" IS NOT NULL`;
      }
      await tx.$executeRaw`DELETE FROM "MaintenanceReceiptCleanup" WHERE "id" = ${job.id}`;
    }
    return referenced ? 'referenced' as const : 'completed' as const;
  } catch {
    await deferReceiptCleanup(tx, job);
    return 'pending' as const;
  }
}

/** Also runs OUTSIDE a failed transaction. Compare the generation so a late
 * timeout cannot overwrite a committed retirement, completion, cursor or requeue.
 * Failure to reach the database leaves the original job durable for next run. */
export async function deferReceiptCleanup(db: Pick<Prisma.TransactionClient, '$executeRaw'>, job: ReceiptCleanupJob) {
  const attempts = Math.min(job.attempts + 1, 1_000_000);
  const due = new Date(Date.now() + Math.min(24 * 60 * 60_000, 60_000 * 2 ** Math.min(attempts, 11)));
  return db.$executeRaw`UPDATE "MaintenanceReceiptCleanup" SET "attempts" = ${attempts}, "nextAttemptAt" = ${due},
    "lastError" = 'Private document cleanup pending', "generation" = ${randomUUID()}
    WHERE "id" = ${job.id} AND "generation" = ${job.generation} AND "completedAt" IS NULL`;
}

/** Internal worker only. Owner first, vehicle second, job row last avoids
 * deadlocks with upload/deletion. SKIP LOCKED prevents competing job workers. */
export async function runReceiptCleanup(db: PrismaClient, limit = 5, provider = storage) {
  const bounded = Number.isFinite(limit) ? Math.max(1, Math.min(10, Math.floor(limit))) : 5;
  const jobs = await db.$queryRaw<ReceiptCleanupJob[]>`SELECT *
    FROM "MaintenanceReceiptCleanup" WHERE "completedAt" IS NULL AND "nextAttemptAt" <= NOW() ORDER BY "nextAttemptAt", "id" LIMIT ${bounded}`;
  const results: string[] = [];
  for (const candidate of jobs) {
    let attempted = candidate;
    try {
      results.push(await db.$transaction(async tx => {
        await lockServiceOwner(tx, candidate.userId);
        if (candidate.vehicleId) await lockServiceVehicle(tx, candidate.vehicleId);
        const rows = await tx.$queryRaw<ReceiptCleanupJob[]>`SELECT *
          FROM "MaintenanceReceiptCleanup" WHERE "id" = ${candidate.id} AND "completedAt" IS NULL AND "nextAttemptAt" <= NOW() FOR UPDATE SKIP LOCKED`;
        if (!rows[0]) return 'skipped';
        attempted = rows[0];
        return processReceiptCleanupJob(tx, attempted, provider);
      }, { isolationLevel: 'ReadCommitted', timeout: 25000, maxWait: 5000 }));
    } catch {
      await deferReceiptCleanup(db, attempted).catch(() => undefined);
      results.push('pending');
    }
  }
  return { examined: jobs.length, pending: results.filter(result => result === 'pending').length, completed: results.filter(result => result === 'completed' || result === 'referenced').length };
}
