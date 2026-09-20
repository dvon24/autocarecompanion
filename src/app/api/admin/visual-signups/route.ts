import { auth } from '@/lib/auth';
import { isFounderEmail } from '@/lib/founder';
import { prisma } from '@/lib/db';
import { createVisualSignupAdminHandler } from '@/lib/visual-signup-admin-handler';

export const dynamic = 'force-dynamic';

export const GET = createVisualSignupAdminHandler(
  async()=>isFounderEmail((await auth())?.user?.email),
  async()=>{
    const [counts, items] = await Promise.all([
      prisma.$queryRaw<{ total: number; active: number }[]>`SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE "unsubscribedAt" IS NULL)::int AS active FROM "VisualSignup"`,
      prisma.$queryRaw<{ id: string; email: string; source: string; createdAt: Date; unsubscribedAt: Date | null }[]>`SELECT id, email, source, "createdAt", "unsubscribedAt" FROM "VisualSignup" ORDER BY "createdAt" DESC LIMIT 100`,
    ]);
    return {...counts[0],items};
  },
);
