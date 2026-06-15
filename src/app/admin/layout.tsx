import { auth } from '@/lib/auth';
import { isFounderEmail } from '@/lib/founder';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

/**
 * Server-side gate for the entire /admin route. The admin page is a client
 * component and the data APIs are already founder-gated, but the PAGE itself
 * had no auth — anyone could load the (empty) shell. This wraps it so a
 * non-founder (signed in OR not) gets a 404 and never even sees the admin UI.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!isFounderEmail(session?.user?.email)) {
    notFound();
  }
  return <>{children}</>;
}
