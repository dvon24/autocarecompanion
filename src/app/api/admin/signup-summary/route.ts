import prisma from '@/lib/db';
import { requireFounder } from '@/lib/admin-guard';
import { createAdminSignupSummaryHandler } from '@/lib/admin-signup-summary';

export const dynamic = 'force-dynamic';
export const GET = createAdminSignupSummaryHandler({
  authorize: requireFounder,
  memberships: async () => {
    const load = async (product: 'hub' | 'visual') => {
      const [verifiedAccounts, paid, trialing] = await Promise.all([
        prisma.user.count({where:{emailVerified:{not:null},enrollmentProduct:product}}),
        prisma.user.count({where:{emailVerified:{not:null},subscriptionId:{not:null},subscriptionTier:product,subscriptionStatus:'active'}}),
        prisma.user.count({where:{emailVerified:{not:null},subscriptionId:{not:null},subscriptionTier:product,subscriptionStatus:'trialing'}}),
      ]);
      return {verifiedAccounts,paid,trialing};
    };
    const [hub,visual]=await Promise.all([load('hub'),load('visual')]);return {hub,visual};
  },
  hub: async () => {
    const [total, active] = await Promise.all([
      prisma.reservation.count(),
      prisma.reservation.count({ where: { unsubscribedAt: null } }),
    ]);
    return { total, active };
  },
  visual: async () => {
    const rows = await prisma.$queryRaw<{ total: number; active: number }[]>`SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE "unsubscribedAt" IS NULL)::int AS active FROM "VisualSignup"`;
    if (!rows[0]) throw new Error('Visual signup counts unavailable');
    return rows[0];
  },
});
