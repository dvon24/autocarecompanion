import { createHash } from 'node:crypto';
import type { Prisma, Vehicle } from '@prisma/client';
import { resolveMaintenanceWriteType } from '@/lib/maintenance';
import { guardTransmissionMaintenanceVehicle, isTransmissionMaintenanceType, MaintenanceMutationError } from '@/lib/maintenance-mutation';
import { addMaintenanceCalendarMonths, getVehicleMaintenanceIntervals } from '@/lib/vehicle-maintenance-intervals';
import type { ServiceReviewInput } from '@/lib/maintenance-service-review';
import { isPhysicalDrivelineType } from '@/lib/physical-driveline-policy';

export function maintenanceDeadlines(type: string, vehicle: Parameters<typeof getVehicleMaintenanceIntervals>[1], mileage: number, date: string) {
  const intervals = getVehicleMaintenanceIntervals(type, vehicle);
  return {
    nextDueMileage: intervals.intervalMiles != null && mileage <= 2_147_483_647 - intervals.intervalMiles ? mileage + intervals.intervalMiles : undefined,
    nextDueDate: intervals.intervalMonths != null ? new Date(addMaintenanceCalendarMonths(date, intervals.intervalMonths)!) : null,
  };
}

export async function persistMaintenanceEntry(tx: Prisma.TransactionClient, vehicle: Vehicle, input: {
  type: string; mileage: number; date: string; cost?: number; description?: string; shopName?: string; notes?: string; receiptUrl?: string;
}, now: Date, id?: string) {
  const resolved = resolveMaintenanceWriteType(input.type, vehicle);
  if (!resolved.ok) throw new MaintenanceMutationError(resolved.reason === 'transmission-unselected'
    ? 'Choose Automatic or Manual on this vehicle before logging transmission fluid service'
    : resolved.reason === 'transmission-mismatch' ? 'This maintenance type does not match the saved transmission branch' : 'Invalid maintenance type', 400);
  const revision = isTransmissionMaintenanceType(input.type) || isPhysicalDrivelineType(input.type)
    || (vehicle.reviewedEquipmentId != null && ['differential_fluid','transfer_case_fluid'].includes(input.type))
    ? await guardTransmissionMaintenanceVehicle(tx, vehicle, now) : null;
  const record = await tx.maintenanceRecord.create({ data: {
    ...input, ...(id ? { id } : {}), vehicleId: vehicle.id, type: resolved.type, date: new Date(input.date),
    ...maintenanceDeadlines(resolved.type, vehicle, input.mileage, input.date),
  } });
  if (input.mileage > (vehicle.currentMileage ?? 0)) await advanceMaintenanceMileage(tx, vehicle.id, input.mileage, now, revision);
  return record;
}

/** Recheck against the current row, not the receipt's earlier vehicle snapshot.
 * Manual mileage edits do not share the service advisory lock. */
export async function advanceMaintenanceMileage(tx: Prisma.TransactionClient, vehicleId: string, mileage: number, now: Date, revision: Date | null = null) {
  const changed = await tx.$executeRaw`UPDATE "Vehicle"
    SET "currentMileage" = ${mileage}, "lastMileageUpdate" = ${now},
      "updatedAt" = GREATEST("updatedAt" + INTERVAL '1 millisecond', ${revision ?? now})
    WHERE "id" = ${vehicleId} AND ("currentMileage" IS NULL OR "currentMileage" < ${mileage})`;
  if (changed) await tx.mileageLog.create({ data: { vehicleId, mileage, source: 'maintenance' } });
  return changed > 0;
}

const digest = (value: string) => createHash('sha256').update(value).digest('hex');
export function serviceSubmissionIdentity(userId: string, review: ServiceReviewInput, receiptDigest?: string) {
  // The durable submission ledger and unique record IDs share this owner/car
  // scope. Request metadata never appears in the owner's maintenance notes.
  const prefix = `sr_${digest(`${userId}:${review.vehicleId}:${review.requestId}`).slice(0, 32)}_`;
  const fingerprint = digest(JSON.stringify({ ...review, receiptDigest: receiptDigest ?? null }));
  return { prefix, fingerprint, ids: review.jobs.map((_, index) => `${prefix}${fingerprint}_${index}`) };
}

export async function findServiceReplay(tx: Pick<Prisma.TransactionClient, 'maintenanceRecord' | '$queryRaw'>, userId: string, review: ServiceReviewInput, receiptDigest?: string) {
  const identity = serviceSubmissionIdentity(userId, review, receiptDigest);
  const submissions = await tx.$queryRaw<Array<{ fingerprint: string }>>`SELECT "fingerprint" FROM "MaintenanceSubmission" WHERE "id" = ${identity.prefix} AND "vehicleId" = ${review.vehicleId}`;
  if (submissions[0] && submissions[0].fingerprint !== identity.fingerprint) throw new MaintenanceMutationError('This submission was already used for different facts. Check service history before starting again.', 409);
  const records = await tx.maintenanceRecord.findMany({ where: { vehicleId: review.vehicleId, id: { startsWith: identity.prefix } }, orderBy: { id: 'asc' } });
  if (submissions[0] && records.length !== identity.ids.length) throw new MaintenanceMutationError('This service was saved, then records were removed. It has not been recreated. Check service history before recording new work.', 410);
  if (!records.length) return null;
  if (records.length !== identity.ids.length || records.some((record) => !identity.ids.includes(record.id))) {
    throw new MaintenanceMutationError('This review was already saved or changed. Open service history before starting another review.', 409);
  }
  return records;
}

export function validateServiceReviewVehicle(review: ServiceReviewInput, vehicle: Vehicle, now: Date) {
  const resolvedTypes = new Set<string>();
  for (const job of review.jobs) {
    const resolved = resolveMaintenanceWriteType(job.type, vehicle);
    if (!resolved.ok) throw new MaintenanceMutationError('Choose a supported service matching the saved vehicle transmission before saving.', 400);
    if (resolvedTypes.has(resolved.type)) throw new MaintenanceMutationError('Combine duplicate services into one reviewed job.', 400);
    resolvedTypes.add(resolved.type);
  }
  let today: string;
  try {
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: review.timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now).map(part => [part.type, part.value]));
    today = `${parts.year}-${parts.month}-${parts.day}`;
  } catch { throw new MaintenanceMutationError('Invalid time zone.', 400); }
  if (review.date > today) throw new MaintenanceMutationError('Service completion date cannot be in the future.', 400);
}

export async function persistServiceReview(tx: Prisma.TransactionClient, userId: string, review: ServiceReviewInput, now: Date, receipt?: { url: string; digest: string }) {
  await lockServiceOwner(tx, userId);
  await lockServiceVehicle(tx, review.vehicleId);
  const vehicle = await tx.vehicle.findFirst({ where: { id: review.vehicleId, userId } });
  if (!vehicle) throw new MaintenanceMutationError('Vehicle not found', 404);
  const replay = await findServiceReplay(tx, userId, review, receipt?.digest);
  if (replay) return { records: replay, replayed: true };
  validateServiceReviewVehicle(review, vehicle, now);
  const { ids, prefix, fingerprint } = serviceSubmissionIdentity(userId, review, receipt?.digest);
  const records = [];
  for (const [index, job] of review.jobs.entries()) {
    const currentVehicle = index === 0 ? vehicle : await tx.vehicle.findFirst({ where: { id: review.vehicleId, userId } });
    if (!currentVehicle) throw new MaintenanceMutationError('Vehicle not found', 404);
    records.push(await persistMaintenanceEntry(tx, currentVehicle, {
      ...job, mileage: review.mileage, date: review.date, shopName: review.shopName, notes: review.notes,
      // The invoice amount is represented exactly once, never once per line item.
      cost: index === 0 ? review.cost : undefined, receiptUrl: receipt?.url,
    }, now, ids[index]));
  }
  await tx.$executeRaw`INSERT INTO "MaintenanceSubmission" ("id", "vehicleId", "fingerprint", "recordIds") VALUES (${prefix}, ${review.vehicleId}, ${fingerprint}, ${JSON.stringify(ids)}::jsonb)`;
  return { records, replayed: false };
}

export function serviceInvoiceGroup(id: string): string | null {
  return /^(sr_[a-f0-9]{32}_[a-f0-9]{64})_\d+$/.exec(id)?.[1] ?? null;
}

/** Serialize service batch writes and shared receipt deletion for this car. */
export async function lockServiceOwner(tx: Pick<Prisma.TransactionClient, '$queryRaw'>, userId: string) {
  await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${'maintenance-owner:' + userId}))::text`;
}

export async function lockServiceVehicle(tx: Pick<Prisma.TransactionClient, '$queryRaw'>, vehicleId: string) {
  await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${vehicleId}))::text`;
}

export async function transferDeletedInvoiceCost(tx: Prisma.TransactionClient, record: { id: string; vehicleId: string; cost: number | null }) {
  const group = serviceInvoiceGroup(record.id);
  if (!group || record.cost == null) return;
  const sibling = await tx.maintenanceRecord.findFirst({ where: { vehicleId: record.vehicleId, id: { startsWith: `${group}_`, not: record.id } }, orderBy: { id: 'asc' } });
  if (sibling) await tx.maintenanceRecord.update({ where: { id: sibling.id }, data: { cost: (sibling.cost ?? 0) + record.cost } });
}
