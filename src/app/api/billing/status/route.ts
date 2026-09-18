import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createBillingStatusHandler } from '@/lib/billing-status-handler';
export const dynamic = 'force-dynamic';
export const GET = createBillingStatusHandler({ auth, prisma });
