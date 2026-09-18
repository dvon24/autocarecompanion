import { prisma } from '@/lib/db';
import { createVisualUnsubscribeHandlers } from '@/lib/visual-unsubscribe-handler';

export const { GET, POST } = createVisualUnsubscribeHandlers(async token=>{
  await prisma.$executeRaw`UPDATE "VisualSignup" SET "unsubscribedAt" = CURRENT_TIMESTAMP WHERE "unsubscribeToken" = ${token} AND "unsubscribedAt" IS NULL`;
});
