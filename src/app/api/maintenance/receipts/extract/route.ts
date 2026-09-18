import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { canUsePersonalVehicle } from '@/lib/vehicle-capabilities';
import { checkAiGate, isAiGateBlocked } from '@/lib/ai-gate';
import { hubChatMinuteLimiter } from '@/lib/rate-limit';
import { checkAndConsumePhotoQuota, refundPhotoQuota } from '@/lib/photo-quota';
import { extractMaintenanceReceipt, receiptExtractionConfigured, validateReceiptDocument } from '@/lib/maintenance-receipt-extraction';
import { maintenanceReceiptUploadsConfigured, readMaintenanceReceiptForm } from '@/lib/maintenance-receipt-storage';
import { MAINTENANCE_DOCUMENT_ERROR, MAX_MAINTENANCE_RECEIPT_BODY_BYTES } from '@/lib/maintenance-document';

const json = (body: unknown, init: { status?: number; headers?: Record<string, string> } = {}) =>
  NextResponse.json(body, { ...init, headers: { ...init.headers, 'Cache-Control': 'private, no-store' } });

export const runtime = 'nodejs';
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return json({ error: 'Unauthorized' }, { status: 401 });
  const burst = hubChatMinuteLimiter.check(`receipt:${session.user.id}`);
  if (!burst.success) return json({ error: 'Please wait before reading another receipt.' }, { status: 429, headers: { 'Retry-After': String(burst.reset) } });
  if (Number(request.headers.get('content-length')) > MAX_MAINTENANCE_RECEIPT_BODY_BYTES) return json({ error: MAINTENANCE_DOCUMENT_ERROR }, { status: 413 });
  try {
    const form = await readMaintenanceReceiptForm(request);
    const vehicleId = form.get('vehicleId');
    const file = form.get('file');
    if (typeof vehicleId !== 'string' || !(file instanceof File) || form.get('consent') !== 'true') return json({ error: 'Choose a document and confirm private AI processing.' }, { status: 400 });
    const vehicle = await prisma.vehicle.findFirst({ where: { id: vehicleId, userId: session.user.id } });
    if (!vehicle) return json({ error: 'Vehicle not found' }, { status: 404 });
    if (!await canUsePersonalVehicle(session.user.id, vehicleId)) return json({ error: 'Hub access required' }, { status: 403 });
    const gate = await checkAiGate();
    if (isAiGateBlocked(gate)) { gate.headers.set('Cache-Control', 'private, no-store'); return gate; }
    if (gate.userId !== session.user.id) return json({ error: 'Session changed. Reopen this review.' }, { status: 401 });
    const invalid = await validateReceiptDocument(file);
    if (invalid) return json({ error: invalid }, { status: 400 });
    if (!maintenanceReceiptUploadsConfigured() || !receiptExtractionConfigured()) return json({ error: 'Private receipt extraction is unavailable. You can still log service manually.' }, { status: 503 });
    const quotaKey = `receipt:user:${session.user.id}`;
    const quota = await checkAndConsumePhotoQuota({ key: quotaKey, limit: 40 });
    if (!quota.allowed) return json({ error: 'The monthly limit of 40 receipt drafts has been reached. You can still enter service manually.' }, { status: 429 });
    let draft;
    try { draft = await extractMaintenanceReceipt(file, [vehicle.year, vehicle.make, vehicle.model, vehicle.trim].filter(Boolean).join(' ')); }
    catch (error) { await refundPhotoQuota(quotaKey); throw error; }
    return json({ vehicleId, draft }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    if (error instanceof RangeError) return json({ error: MAINTENANCE_DOCUMENT_ERROR }, { status: 413 });
    return json({ error: 'The receipt could not be read. Your service has not been saved. Enter details manually or retry.' }, { status: 502 });
  }
}
