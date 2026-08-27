import { NextResponse } from 'next/server';
import type { prisma as prismaClient } from '@/lib/db';
import {
  resolveMaintenanceReadTypes,
  TRANSMISSION_SERVICE_BRANCHES,
} from '@/lib/maintenance';

export function createMaintenanceGetHandler(deps: {
  auth: () => Promise<{ user?: { id?: string | null } } | null>;
  prisma: typeof prismaClient;
}) {
  return async function GET(request: Request) {
    try {
      const session = await deps.auth();
      if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      const userId = session.user.id;

      const { searchParams } = new URL(request.url);
      const vehicleId = searchParams.get('vehicleId')?.trim() ?? '';
      const requestedType = searchParams.get('type')?.trim() ?? '';
      const rawLimit = searchParams.get('limit');
      const limit = rawLimit == null ? 50 : Number(rawLimit);
      if (!vehicleId) return NextResponse.json({ error: 'vehicleId is required' }, { status: 400 });
      if (!Number.isInteger(limit) || limit < 1) {
        return NextResponse.json({ error: 'limit must be a positive integer' }, { status: 400 });
      }

      const result = await deps.prisma.$transaction(async (tx) => {
        const vehicle = await tx.vehicle.findFirst({
          where: { id: vehicleId, userId },
        });
        if (!vehicle) return { ok: false as const, status: 404, error: 'Vehicle not found' };

        const readTypes = requestedType ? resolveMaintenanceReadTypes(requestedType, vehicle) : [];
        if (requestedType && readTypes.length === 0) {
          return {
            ok: false as const,
            status: 400,
            error: 'That maintenance branch does not match this vehicle',
          };
        }
        const unreadableTransmissionTypes = Object.keys(TRANSMISSION_SERVICE_BRANCHES)
          .filter((type) => !resolveMaintenanceReadTypes(type, vehicle).length);
        const records = await tx.maintenanceRecord.findMany({
          where: {
            vehicleId,
            ...(readTypes.length === 1 ? { type: readTypes[0] } : {}),
            ...(readTypes.length > 1 ? { type: { in: [...readTypes] } } : {}),
            ...(!requestedType && unreadableTransmissionTypes.length
              ? { type: { notIn: unreadableTransmissionTypes } }
              : {}),
          },
          orderBy: { date: 'desc' },
          take: Math.min(limit, 100),
        });
        return { ok: true as const, records };
      }, { isolationLevel: 'Serializable' });
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: result.status });
      }
      return NextResponse.json({ records: result.records });
    } catch (error) {
      console.error('Error fetching maintenance records:', error);
      return NextResponse.json({ error: 'Failed to fetch maintenance records' }, { status: 500 });
    }
  };
}
