import { prisma } from '@/lib/db';
import { requireFounder } from '@/lib/admin-guard';
import { createAdminReservationPostHandler } from '@/lib/admin-reservation-post-handler';

export const POST=createAdminReservationPostHandler({requireFounder,prisma});
