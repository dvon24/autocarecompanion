import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createTwinClaimPostHandler } from '@/lib/twin-claim-post-handler';

export const POST = createTwinClaimPostHandler({ auth, prisma });
