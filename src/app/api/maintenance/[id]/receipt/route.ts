import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import {
  isManagedMaintenanceReceipt,
  maintenanceReceiptBelongsToOwner,
  readMaintenanceReceipt,
} from '@/lib/maintenance-receipt-storage';

export const runtime = 'nodejs';

function downloadName(pathname: string): string {
  const tail = decodeURIComponent(pathname.split('/').pop() || 'receipt');
  const withoutId = tail.replace(/^[0-9a-f-]{36}-/i, '');
  return withoutId.replace(/["\r\n]/g, '') || 'receipt';
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const record = await prisma.maintenanceRecord.findFirst({
    where: { id, vehicle: { userId: session.user.id } },
    select: { receiptUrl: true, vehicleId: true },
  });
  if (!record?.receiptUrl) return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });

  if (!isManagedMaintenanceReceipt(record.receiptUrl)) {
    try {
      const legacy = new URL(record.receiptUrl);
      if (legacy.protocol === 'https:') return NextResponse.redirect(legacy);
    } catch {
      // Invalid legacy metadata is treated as unavailable.
    }
    return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
  }
  if (!maintenanceReceiptBelongsToOwner(record.receiptUrl, session.user.id, record.vehicleId)) {
    console.error('[maintenance-receipt] rejected owner/path mismatch for record:', id);
    return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
  }

  try {
    const result = await readMaintenanceReceipt(record.receiptUrl);
    if (!result || result.statusCode !== 200 || !result.stream) {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
    }
    return new Response(result.stream, {
      headers: {
        'Content-Type': result.blob.contentType || 'application/octet-stream',
        'Content-Length': String(result.blob.size),
        'Content-Disposition': `inline; filename="${downloadName(result.blob.pathname)}"`,
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('[maintenance-receipt] read failed:', error);
    return NextResponse.json({ error: 'Receipt is temporarily unavailable.' }, { status: 503 });
  }
}
