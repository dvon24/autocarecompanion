import { prisma } from '@/lib/db';
import { getClientIp, rateLimitResponse, reservationLimiter } from '@/lib/rate-limit';
import { createReservationHandler } from '@/lib/reservation-handler';
import { auth } from '@/lib/auth';

export const POST = createReservationHandler({
  prisma,
  auth,
  rateLimit(request) {
    const limit = reservationLimiter.check(getClientIp(request));
    return limit.success ? null : rateLimitResponse(limit.reset);
  },
});
