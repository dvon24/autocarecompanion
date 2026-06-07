import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { DiagnoseClaimClient } from '@/components/diagnose/DiagnoseClaimClient';

export const metadata: Metadata = {
  title: 'Saving your diagnosis · Au7o',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

/**
 * /diagnose/claim — post-signup landing for the diagnose-to-chat
 * handoff. Reads the diagnosis snapshot from sessionStorage (stashed
 * on /diagnose just before signup), POSTs it to /api/diagnose/seed,
 * then redirects to /vehicle/{slug} with the seeded ChatSession id.
 *
 * Auth-gated server-side — if the user isn't signed in we bounce
 * through /auth/signup with this page as the callbackUrl so the
 * signup auto-signin lands them right back here.
 */
export default async function DiagnoseClaimPage() {
  const session = await auth().catch(() => null);
  if (!session?.user?.id) {
    redirect('/auth/signup?callbackUrl=' + encodeURIComponent('/diagnose/claim'));
  }
  return <DiagnoseClaimClient />;
}
