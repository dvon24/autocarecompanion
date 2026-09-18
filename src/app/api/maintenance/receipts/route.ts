import { NextResponse } from 'next/server';
import { createHash, randomUUID } from 'node:crypto';
import { ServiceReviewSchema } from '@/lib/maintenance-service-review';
import { findServiceReplay, persistServiceReview, persistMaintenanceEntry, validateServiceReviewVehicle, lockServiceOwner, lockServiceVehicle } from '@/lib/maintenance-service-mutation';
import { assertReceiptUploadAllowed, queueReceiptCleanup } from '@/lib/maintenance-receipt-cleanup';
import { MAINTENANCE_DOCUMENT_ERROR, MAX_MAINTENANCE_RECEIPT_BODY_BYTES } from '@/lib/maintenance-document';
import { isMaintenanceMutationError } from '@/lib/maintenance-mutation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { isFounderEmail } from '@/lib/founder';
import { canUsePersonalVehicle } from '@/lib/vehicle-capabilities';
import { isLoggableMaintenanceType } from '@/lib/maintenance';
import { parseMaintenanceCreate } from '@/lib/twin-route-contracts';
import {
  ownerReceiptPrefix,
  maintenanceReceiptUploadsConfigured,
  storeMaintenanceReceipt,
  validateMaintenanceReceipt,
  validateMaintenanceReceiptContents,
  readMaintenanceReceiptForm,
} from '@/lib/maintenance-receipt-storage';

export const runtime = 'nodejs';

const json = (body: unknown, init: { status?: number } = {}) =>
  NextResponse.json(body, { ...init, headers: { 'Cache-Control': 'private, no-store' } });

function optionalText(form: FormData, key: string): string | undefined {
  const value = form.get(key);
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function currentDateInTimeZone(timeZone: string | undefined): string | null {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timeZone || 'UTC',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date());
    const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${value.year}-${value.month}-${value.day}`;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return json({ error: 'Unauthorized' }, { status: 401 });
  if (!maintenanceReceiptUploadsConfigured()) {
    return json(
      { error: 'Private receipt storage is unavailable. You can still log the service without a receipt.', outcome: 'not_saved' },
      { status: 503 },
    );
  }
  const declaredLength = Number(request.headers.get('content-length'));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_MAINTENANCE_RECEIPT_BODY_BYTES) {
    return json({ error: MAINTENANCE_DOCUMENT_ERROR }, { status: 413 });
  }

  let form: FormData;
  try {
    form = await readMaintenanceReceiptForm(request);
  } catch (error) {
    return json({ error: error instanceof RangeError ? MAINTENANCE_DOCUMENT_ERROR : 'Invalid receipt form.' }, { status: error instanceof RangeError ? 413 : 400 });
  }
  const file = form.get('file');
  if (!(file instanceof File)) return json({ error: 'Choose a receipt file.' }, { status: 400 });
  const fileError = validateMaintenanceReceipt(file);
  if (fileError) return json({ error: fileError }, { status: 400 });
  const contentError = await validateMaintenanceReceiptContents(file).catch(() => 'Receipt file could not be read.');
  if (contentError) return json({ error: contentError }, { status: 400 });

  if (form.has('review')) {
    try {
      const parsedReview = ServiceReviewSchema.safeParse(JSON.parse(String(form.get('review'))));
      if (!parsedReview.success) return json({ error: 'Check the reviewed service details.' }, { status: 400 });
      const review = parsedReview.data;
      const vehicle = await prisma.vehicle.findFirst({ where: { id: review.vehicleId, userId: session.user.id } });
      if (!vehicle) return json({ error: 'Vehicle not found' }, { status: 404 });
      if (!await canUsePersonalVehicle(session.user.id, review.vehicleId)) return json({ error: 'Hub access required' }, { status: 403 });
      const digest = createHash('sha256').update(new Uint8Array(await file.arrayBuffer())).digest('hex');
      const replay = await findServiceReplay(prisma, session.user.id, review, digest);
      if (replay) return json({ record: replay[0], records: replay, replayed: true });
      validateServiceReviewVehicle(review, vehicle, new Date());
      const contentKey = createHash('sha256').update(`${session.user.id}:${review.vehicleId}:${review.requestId}:${digest}`).digest('hex');
      // Commit recovery intent BEFORE storage. Even an interrupted put or an
      // ambiguous database commit leaves an owner-scoped, reference-checked job.
      await queueReceiptCleanup(prisma, { userId: session.user.id, vehicleId: review.vehicleId,
        receiptPath: `${ownerReceiptPrefix(session.user.id, review.vehicleId)}${contentKey}-receipt` }, 60 * 60_000);
      const saved = await prisma.$transaction(async tx => {
        await lockServiceOwner(tx, session.user!.id!);
        await lockServiceVehicle(tx, review.vehicleId);
        const current = await tx.vehicle.findFirst({ where: { id: review.vehicleId, userId: session.user!.id! } });
        if (!current) throw new Error('Vehicle changed before receipt filing.');
        validateServiceReviewVehicle(review, current, new Date());
        const existingRows = await findServiceReplay(tx, session.user!.id!, review, digest);
        if (existingRows) return { records: existingRows, replayed: true };
        await assertReceiptUploadAllowed(tx, `${ownerReceiptPrefix(session.user!.id!, review.vehicleId)}${contentKey}-receipt`);
        const stored = await storeMaintenanceReceipt({ userId: session.user!.id!, vehicleId: review.vehicleId, file, contentKey });
        return persistServiceReview(tx, session.user!.id!, review, new Date(), { url: stored.url, digest });
      }, { isolationLevel: 'ReadCommitted', timeout: 25000 });
      return json({ record: saved.records[0], ...saved }, { status: 201 });
    } catch (error) {
      return json({ error: isMaintenanceMutationError(error) ? error.message : 'Could not confirm this receipt save. Recheck the same review before starting another.' }, { status: isMaintenanceMutationError(error) ? error.status : 503 });
    }
  }

  const vehicleId = optionalText(form, 'vehicleId');
  const type = optionalText(form, 'type');
  const date = optionalText(form, 'date');
  const rawMileage = optionalText(form, 'mileage');
  const rawCost = optionalText(form, 'cost');
  if (!vehicleId || !type || !date || !rawMileage) {
    return json({ error: 'Vehicle, service type, date, and mileage are required.' }, { status: 400 });
  }

  const mileage = Number(rawMileage);
  const cost = rawCost == null ? undefined : Number(rawCost);
  const candidate = {
    vehicleId,
    type,
    mileage,
    date,
    ...(rawCost == null ? {} : { cost }),
    ...(optionalText(form, 'description') ? { description: optionalText(form, 'description') } : {}),
    ...(optionalText(form, 'notes') ? { notes: optionalText(form, 'notes') } : {}),
    ...(optionalText(form, 'shopName') ? { shopName: optionalText(form, 'shopName') } : {}),
  };
  const parsed = parseMaintenanceCreate(candidate, isLoggableMaintenanceType);
  if (!parsed.success) {
    return json({ error: 'Check the service details and try again.', details: parsed.error.issues }, { status: 400 });
  }
  const timeZone = optionalText(form, 'timeZone');
  const ownerToday = currentDateInTimeZone(timeZone);
  if (!ownerToday) return json({ error: 'Invalid time zone.' }, { status: 400 });
  if (parsed.data.date.slice(0, 10) > ownerToday) {
    return json({ error: 'Service completion date cannot be in the future.' }, { status: 400 });
  }
  const ownedVehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId, userId: session.user.id },
    select: { id: true },
  });
  if (!ownedVehicle) return json({ error: 'Vehicle not found' }, { status: 404 });
  if (!isFounderEmail(session.user.email)) {
    if (!(await canUsePersonalVehicle(session.user.id, vehicleId))) {
      return json({
        error: 'tier_required',
        message: 'Hub access is required to track personal service history.',
      }, { status: 403 });
    }
  }

  try {
    const contentKey = createHash('sha256').update(randomUUID()).digest('hex');
    await queueReceiptCleanup(prisma, { userId: session.user.id, vehicleId,
      receiptPath: `${ownerReceiptPrefix(session.user.id, vehicleId)}${contentKey}-receipt` }, 60 * 60_000);
    const record = await prisma.$transaction(async tx => {
      await lockServiceOwner(tx, session.user!.id!);
      await lockServiceVehicle(tx, vehicleId);
      const current = await tx.vehicle.findFirst({ where: { id: vehicleId, userId: session.user!.id! } });
      if (!current) throw new Error('Vehicle changed before receipt filing.');
      await assertReceiptUploadAllowed(tx, `${ownerReceiptPrefix(session.user!.id!, vehicleId)}${contentKey}-receipt`);
      const stored = await storeMaintenanceReceipt({ userId: session.user!.id!, vehicleId, file, contentKey });
      return persistMaintenanceEntry(tx, current, { ...parsed.data, receiptUrl: stored.url }, new Date());
    }, { isolationLevel: 'ReadCommitted', timeout: 25000 });
    return json({ record }, { status: 201 });
  } catch (error) {
    return json(
      { error: isMaintenanceMutationError(error) ? error.message : 'Could not confirm this receipt save. Check service history before trying again. Private document cleanup is queued.' },
      { status: isMaintenanceMutationError(error) ? error.status : 503 },
    );
  }
}
