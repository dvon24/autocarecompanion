import { randomBytes, randomUUID } from 'node:crypto';
import { prisma } from '@/lib/db';
import { RateLimiter, getClientIp, rateLimitResponse } from '@/lib/rate-limit';
import { validateEmailAddress } from '@/lib/validate-email';
import { createVisualSignupHandler } from '@/lib/visual-signup-handler';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
const limiter = new RateLimiter(60 * 60_000, 6);

export const POST = createVisualSignupHandler({
  rateLimit(request) {
    // Release hold: verified email preferences and the migration must pass
    // review before public capture is enabled. Never flip this during QA.
    if (process.env.AU7O_VISUAL_SIGNUPS_ENABLED !== 'true') return NextResponse.json({ error: 'Visual signups are not open yet. Please check back soon.' }, { status: 503 });
    const limit = limiter.check(getClientIp(request));
    return limit.success ? null : rateLimitResponse(limit.reset);
  },
  validateEmail: validateEmailAddress,
  async save(input) {
    const token = randomBytes(24).toString('base64url');
    // Parameterized SQL keeps the additive rollout independent of a regenerated
    // Prisma client. One unique row per email; no write to Reservation or User.
    await prisma.$executeRaw`
      INSERT INTO "VisualSignup" ("id", "email", "product", "country", "source", "unsubscribeToken")
      VALUES (${randomUUID()}, ${input.email}, ${input.product}, ${input.country}, ${input.source}, ${token})
      ON CONFLICT ("email") DO NOTHING
    `;
  },
});
