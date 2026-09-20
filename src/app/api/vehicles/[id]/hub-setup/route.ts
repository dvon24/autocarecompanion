import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createOwnerHubSetupHandler } from '@/lib/owner-hub-setup-handler';
export const POST=createOwnerHubSetupHandler({auth,prisma});
