import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createMaintenanceGetHandler } from '@/lib/maintenance-get-handler';
import { createMaintenancePostHandler } from '@/lib/maintenance-post-handler';

// GET /api/maintenance - List maintenance records (by vehicle)
export const GET = createMaintenanceGetHandler({ auth, prisma });

// POST /api/maintenance - Log new maintenance
export const POST = createMaintenancePostHandler({ auth, prisma });
