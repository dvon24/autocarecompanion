import { auth } from '@/lib/auth';
import { isFounderEmail } from '@/lib/founder';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

/**
 * A discoverable founder entry point, not an authorization boundary.
 * `/admin` and its APIs remain protected by the founder allowlist.
 */
export default async function FounderSignInPage() {
  const session = await auth();
  if (isFounderEmail(session?.user?.email)) redirect('/admin');
  if (session?.user) redirect('/garage');
  redirect('/auth/signin?callbackUrl=%2Ffounder%2Fsignin');
}
