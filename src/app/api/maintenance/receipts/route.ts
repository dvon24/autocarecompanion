import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createMaintenancePostHandler } from '@/lib/maintenance-post-handler';
import { isFounderEmail } from '@/lib/founder';
import { isLoggableMaintenanceType } from '@/lib/maintenance';
import { parseMaintenanceCreate } from '@/lib/twin-route-contracts';
import {
  deleteMaintenanceReceipts,
  MAX_MAINTENANCE_RECEIPT_BYTES,
  maintenanceReceiptStorageConfigured,
  storeMaintenanceReceipt,
  validateMaintenanceReceipt,
  validateMaintenanceReceiptContents,
} from '@/lib/maintenance-receipt-storage';

export const runtime = 'nodejs';

const createRecord = createMaintenancePostHandler({ auth, prisma, allowReceiptUrl: true });

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

async function cleanupRejectedReceipt(value: string): Promise<void> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await deleteMaintenanceReceipts([value]);
      return;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Private receipt cleanup failed');
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!maintenanceReceiptStorageConfigured()) {
    return NextResponse.json(
      { error: 'Private receipt storage is unavailable. You can still log the service without a receipt.' },
      { status: 503 },
    );
  }
  const declaredLength = Number(request.headers.get('content-length'));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_MAINTENANCE_RECEIPT_BYTES + 256 * 1024) {
    return NextResponse.json({ error: 'Receipt upload is too large.' }, { status: 413 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid receipt form.' }, { status: 400 });
  }
  const file = form.get('file');
  if (!(file instanceof File)) return NextResponse.json({ error: 'Choose a receipt file.' }, { status: 400 });
  const fileError = validateMaintenanceReceipt(file);
  if (fileError) return NextResponse.json({ error: fileError }, { status: 400 });
  const contentError = await validateMaintenanceReceiptContents(file).catch(() => 'Receipt file could not be read.');
  if (contentError) return NextResponse.json({ error: contentError }, { status: 400 });

  const vehicleId = optionalText(form, 'vehicleId');
  const type = optionalText(form, 'type');
  const date = optionalText(form, 'date');
  const rawMileage = optionalText(form, 'mileage');
  const rawCost = optionalText(form, 'cost');
  if (!vehicleId || !type || !date || !rawMileage) {
    return NextResponse.json({ error: 'Vehicle, service type, date, and mileage are required.' }, { status: 400 });
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
    return NextResponse.json({ error: 'Check the service details and try again.', details: parsed.error.issues }, { status: 400 });
  }
  const timeZone = optionalText(form, 'timeZone');
  const ownerToday = currentDateInTimeZone(timeZone);
  if (!ownerToday) return NextResponse.json({ error: 'Invalid time zone.' }, { status: 400 });
  if (parsed.data.date.slice(0, 10) > ownerToday) {
    return NextResponse.json({ error: 'Service completion date cannot be in the future.' }, { status: 400 });
  }
  const ownedVehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId, userId: session.user.id },
    select: { id: true },
  });
  if (!ownedVehicle) return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
  if (!isFounderEmail(session.user.email)) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { subscriptionStatus: true, subscriptionId: true },
    });
    if (!user?.subscriptionId || user.subscriptionStatus !== 'active') {
      return NextResponse.json({
        error: 'tier_required',
        message: 'Filing receipts to service history is a Plus / Pro feature.',
      }, { status: 403 });
    }
  }

  let stored: { url: string; pathname: string } | null = null;
  try {
    stored = await storeMaintenanceReceipt({ userId: session.user.id, vehicleId, file });
    const body = {
      ...parsed.data,
      receiptUrl: stored.url,
    };
    const recordResponse = await createRecord(new Request('http://local/api/maintenance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }));
    if (!recordResponse.ok) {
      await cleanupRejectedReceipt(stored.url);
      stored = null;
    }
    return recordResponse;
  } catch (error) {
    if (stored) await cleanupRejectedReceipt(stored.url).catch((cleanupError) => {
      console.error('[maintenance-receipt] cleanup failed after rejected record:', cleanupError);
    });
    console.error('[maintenance-receipt] filing failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Could not file this receipt.' },
      { status: 500 },
    );
  }
}
